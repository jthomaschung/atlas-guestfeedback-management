

## Problem

The `type_of_feedback` field arriving at the `ingest-feedback` webhook is the email **subject line** (e.g. `"Guest Contact: Appearance - Store # (2683-JJ)"`) instead of the parsed value from the email body (`"FYI"` or `"Guest Support"`).

Confirmed in edge function logs: every recent payload has `type_of_feedback` set to the subject. So the field never lands in the DB as `"FYI"`, and routing/priority logic that depends on it never fires. Case CCC8642306 in the screenshot has `type_of_feedback = NULL` because the validator stores the subject string verbatim, then nothing downstream recognizes it as `"FYI"`.

The screenshot of Mailparser shows the parsed value IS available upstream as `"FYI"` — so the real fix is mapping in Zapier. But we can also harden the edge function to recover the value from the email body, which is sent in `feedback_text`.

## Solution

Two-part fix in `supabase/functions/ingest-feedback/index.ts`:

### 1. Detect & strip subject-line garbage in `type_of_feedback`

If the incoming `type_of_feedback` looks like the email subject (starts with `"Guest Contact:"` or contains `"Store #"`), discard it — treat as if not provided.

```ts
function isSubjectLineGarbage(v: string): boolean {
  if (!v) return false;
  const t = v.trim().toLowerCase();
  return t.startsWith('guest contact:') || /store\s*#/i.test(v);
}
```

### 2. Recover the real value from `feedback_text`

After step 1, if `type_of_feedback` is empty, scan `feedback_text` for either:

- The literal phrase `"This is an FYI notification only"` (or `"FYI notification"`) → set to `"FYI"`
- The phrase `"please reach out"` / `"please contact the guest"` / `"please call the guest"` → set to `"Guest Support"`

This matches the language Jimmy John's RAP system uses in the body.

```ts
function inferTypeOfFeedback(text: string): string | null {
  if (!text) return null;
  const t = text.toLowerCase();
  if (t.includes('fyi notification')) return 'FYI';
  if (t.includes('please reach out') || t.includes('please contact the guest') || t.includes('please call the guest')) return 'Guest Support';
  return null;
}
```

### 3. Backfill existing rows

Run a one-time SQL update for rows where `type_of_feedback IS NULL` and `feedback_text` contains the FYI or Guest Support phrases:

```sql
UPDATE customer_feedback
SET type_of_feedback = 'FYI'
WHERE type_of_feedback IS NULL
  AND feedback_text ILIKE '%FYI notification%';

UPDATE customer_feedback
SET type_of_feedback = 'Guest Support'
WHERE type_of_feedback IS NULL
  AND (feedback_text ILIKE '%please reach out%' OR feedback_text ILIKE '%please contact the guest%' OR feedback_text ILIKE '%please call the guest%');
```

I'll run a SELECT preview first showing how many rows match each pattern before issuing the UPDATE so you can confirm the scope.

### 4. Routing recompute (optional, recommend)

After backfill, the existing `type_of_feedback`-driven routing in the validator only runs at ingest time. For the backfilled rows, priority/assignee are already set based on category alone. I will NOT retroactively reroute existing rows — it would change in-flight assignments. New inbound traffic gets correct routing immediately.

### 5. Note on upstream Zapier mapping

The real long-term fix is in Zapier: map the Mailparser `Type of Feedback` field (which already extracts `"FYI"` correctly per the screenshot) into the webhook payload's `type_of_feedback` key, instead of the email subject. The edge-function inference above is a safety net for cases where the upstream mapping is wrong or missing.

## Files Touched

- `supabase/functions/ingest-feedback/index.ts` — add `isSubjectLineGarbage` + `inferTypeOfFeedback`, apply in `validateFeedbackData` around line 298.
- One-time SQL migration to backfill `type_of_feedback` on existing rows.

## Verification

1. Send a test webhook with `type_of_feedback: "Guest Contact: ..."` and body containing `"This is an FYI notification only"` → row should land with `type_of_feedback = 'FYI'`.
2. Send a test with no `type_of_feedback` and body containing `"please reach out"` → row should land with `type_of_feedback = 'Guest Support'`.
3. Verify CCC8642306 is updated to `FYI` after backfill.
4. Confirm new FYI rows route correctly per existing `type_of_feedback`-driven logic.

