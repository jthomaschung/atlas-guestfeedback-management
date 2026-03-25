

# Update Portal URLs to Custom Domains

## Situation
The three files specified (`src/config/portalRegistry.ts`, `src/pages/hr/HRPublicLanding.tsx`, `src/pages/accounting/AccountingPublicLanding.tsx`) do not exist in this project. They likely belong to the master portal project.

However, this project **does** contain lovable.app URLs that should be updated. Here is the proposed scope:

## Changes in This Project

### 1. `src/components/PortalSwitcher.tsx`
- `preview--trainingportal.lovable.app/welcome` → `training.atlasteam.app/welcome`
- `atlas-kpis.lovable.app` → `kpi.atlasteam.app`
- `atlas-guestfeedback-management.lovable.app/dashboard` → `guestfeedback.atlasteam.app/dashboard` (if present)
- `accounting.atlasteam.app` is already correct

### 2. `supabase/functions/monitor-sla/index.ts`
- `guestfeedback.lovable.app` → `guestfeedback.atlasteam.app`

### 3. `supabase/functions/send-feedback-slack-notification/index.ts`
- `guestfeedback.lovable.app` → `guestfeedback.atlasteam.app`

### 4. `supabase/functions/send-weekly-performance-summary/index.ts`
- `guestfeedback.lovable.app` → `guestfeedback.atlasteam.app`

### 5. `supabase/functions/send-refund-approval-notification/index.ts`
- `guestfeedback.lovable.app` → `guestfeedback.atlasteam.app`

### 6. `supabase/functions/send-executive-approval-notification/index.ts`
- `guestfeedback.lovable.app` → `guestfeedback.atlasteam.app`

### 7. `src/App.tsx` — masterLoginUrl
- `atlas-masterportal.lovable.app` → update if you have a custom domain for the master portal (needs confirmation)

## Note
The `portalRegistry.ts` and landing page files you referenced are not in this codebase. If you'd like those updated, that change needs to happen in the master portal project.

