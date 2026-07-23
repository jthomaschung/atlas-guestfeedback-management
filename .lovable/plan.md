# Plan: Supabase Architecture Documentation

Create a single shareable Markdown file that documents how the Guest Feedback portal uses Supabase.

## Deliverable
`/mnt/documents/SUPABASE_ARCHITECTURE.md` (also surfaced as a `<presentation-artifact>` for download).

## Contents

1. **Overview**
   - Project ref, URL, auth model (Master Portal SSO via PortalGate), anon key usage.
   - High-level diagram (ASCII) of frontend → Supabase (DB, Auth, Edge Functions, Storage).

2. **Authentication & Access Control**
   - `user_portal_access` / `portals` gating.
   - `user_hierarchy`, `user_market_permissions`, `user_store_permissions`, `user_portal_roles`.
   - `profiles` table and `has_role` pattern.
   - Note deprecated `_deprecated_user_permissions`.

3. **Database Tables (grouped by domain)**
   For each group: table name, purpose, key columns, RLS summary.
   - Feedback core: `customer_feedback`, `guest_feedback_notes`, `feedback_likes`, `internal_feedback`, `critical_feedback_approvals`, `escalation_log`, `customer_outreach_log`, `email_templates`, `email_campaigns`.
   - Refunds: `refund_requests`, `refund_void_ledger`.
   - Praise: `praise_comments`, `achievements`, `user_achievements`, `employee_patch_awards`, `patch_shipments`.
   - Stores/markets: `stores`, `store_information`, `markets`, `store_region_groups`, `departments`, `positions`.
   - Notifications: `in_app_notifications`, `notification_log`, `notification_preferences`, `hr_notification_log`, `sla_notifications`.
   - Auxiliary (list-only, since out of scope): catering_*, ring_*, wsr_*, ecosure_*, er_*, incident_*, etc. — flagged as belonging to other portals sharing the DB.

4. **Row Level Security Patterns**
   - Standard patterns used (auth.uid scoping, has_role, market permission joins).
   - Public-schema GRANT convention.

5. **Database Functions & Triggers**
   - `fn_resolve_feedback_routing`, `auto_tag_fyi_feedback`, `notify_feedback_stakeholders`, `check_feedback_alerts`, `notify_customer_response`, `get_executive_hierarchy`, `has_role`, `update_updated_at_column`.
   - Which tables they attach to and what they do.

6. **Edge Functions**
   Table with: name, JWT verify, purpose, triggered by.
   Cover all under `supabase/functions/`:
   - ingest-feedback, email-webhook, send-customer-outreach, send-daily-summary, send-weekly-performance-summary, send-feedback-slack-notification, send-critical-escalation, send-feedback-notification, send-internal-feedback-notification, send-bulk-internal-feedback-notifications, send-executive-approval-notification, send-refund-approval-notification, send-refund-receipt, send-notifications, monitor-sla, backfill-periods, create-user, update-feedback-assignee, redirect-to-work-order, debug-webhook.

7. **Webhooks (Inbound)**
   - SendGrid Inbound Parse → `email-webhook` (host `feedback.atlaswe.com`).
   - SendGrid Event Webhook → `email-webhook`.
   - Feedback ingestion webhook → `ingest-feedback`.
   - Slack notifications (outbound via bot token, not a webhook).

8. **Outbound Integrations**
   - SendGrid (email send + inbound parse), sender `guestfeedback@feedback.atlaswe.com`.
   - Slack Bot (`SLACK_BOT_TOKEN`) for DMs.
   - `pg_net` for trigger-based HTTP calls to edge functions.

9. **Realtime**
   - Where realtime subscriptions are used (feedback board, conversation view).

10. **Secrets & Env**
    - Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`.
    - Edge function secrets: `SENDGRID_API_KEY`, `SLACK_BOT_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`, etc.

11. **Data Flow Walkthroughs**
    - Inbound guest feedback: webhook → ingest-feedback → routing trigger → Slack/email notifications → portal.
    - Reply thread: SendGrid Inbound Parse → email-webhook → `customer_outreach_log` → trigger → Slack + realtime → card "New Reply" badge.
    - Refund request: RequestRefundDialog → `refund_requests` → approval workflow → `refund_void_ledger` → receipt email.

## Method

- Read `supabase/functions/*/index.ts` headers to summarize each function.
- Query DB for function/trigger definitions via `supabase--read_query` on `pg_proc` / `pg_trigger` to accurately list them.
- Query `information_schema` for key columns on the top ~30 in-scope tables (skip out-of-scope tables — just list them).
- Assemble the Markdown, keep it ≤ ~1500 lines, human-readable.
- Write to `/mnt/documents/SUPABASE_ARCHITECTURE.md` and emit the artifact tag.

## Out of scope
- No code changes.
- Non-guest-feedback tables (catering, ring, WSR, EcoSure, ER, incident, facilities, etc.) are only listed by name so the reader knows they exist but belong to sibling portals sharing the DB.
