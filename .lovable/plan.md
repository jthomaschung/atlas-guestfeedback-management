

## Problem

The Portal Switcher in the header is missing portals and showing the wrong set per user. Root causes:

1. It reads access from the **deprecated `user_permissions` table** (via `useUserPermissions`) instead of `user_portal_access` — which is the master SSO source of truth used everywhere else (PortalGate, hasPortalAccess).
2. The hardcoded portal list is **out of sync with the `portals` table**. DB has 9 portals; switcher lists 7. Missing: **HR Dashboard** (`incident_reporting`) and **Manager Payroll Dashboard** (`manager_payroll_dashboard`).
3. **KPI and Accounting are hardcoded to `true`** — everyone sees them regardless of actual access.
4. **Training piggybacks on `canAccessFacilities`** — wrong; training has its own portal row.
5. Portal **keys don't match the DB** (`guest-feedback` vs `guest_feedback`, `kpi-dashboard` vs `kpi`).

## Solution

Rewrite `PortalSwitcher` to be data-driven from `user_portal_access` joined to `portals`, mirroring how `hasPortalAccess.ts` already validates access. The switcher will show exactly the portals the user is granted in the master portal — same logic that gates entry to each app.

### Changes

**1. `src/components/PortalSwitcher.tsx` — rewrite**

- Remove dependency on `useUserPermissions`.
- On mount, fetch the user's accessible portals:
  ```ts
  supabase
    .from('user_portal_access')
    .select('portals!inner(key, name)')
    .eq('user_id', user.id)
  ```
- Maintain a local **portal metadata map** (icon + external URL) keyed by the canonical DB key. Add the two missing portals:

  | Key | Title | Icon | URL |
  |---|---|---|---|
  | `facilities` | Facilities | Wrench | `https://atlasfacilities.co/` |
  | `catering` | Catering | UtensilsCrossed | `https://atlas-catering-operations.lovable.app` |
  | `hr` | Human Resources | Users | `https://atlas-hr-management.lovable.app` |
  | `training` | Training Dashboard | GraduationCap | `https://preview--trainingportal.lovable.app/welcome` |
  | `guest_feedback` | Guest Feedback | MessageSquare | `https://guestfeedback.atlasteam.app/dashboard` (current portal) |
  | `kpi` | KPI Dashboard | BarChart3 | `https://atlas-kpis.lovable.app` |
  | `accounting` | Accounting | Calculator | `https://accounting.atlasteam.app` |
  | `incident_reporting` | HR Dashboard | ClipboardList | (confirm URL — see Open Questions) |
  | `manager_payroll_dashboard` | Manager Payroll | DollarSign | (confirm URL — see Open Questions) |

- Render only portals that appear in BOTH the metadata map AND the `user_portal_access` result.
- Update `getCurrentPortal()` to use `guest_feedback` (matches DB key).
- Keep the existing `createAuthenticatedUrl` SSO handoff logic — already correct.
- Keep behavior of hiding switcher when user has access to ≤1 portal.

**2. No DB changes** — the `portals` and `user_portal_access` tables are already populated and authoritative.

### Verification

1. As an admin user with all portal access → switcher shows all 9 portals.
2. As a guest-feedback-only user → switcher hides (1 portal only).
3. Click Catering / KPI / Accounting → SSO redirect carries session correctly.
4. Confirm HR Dashboard and Manager Payroll appear for users with those grants.

### Open Questions

I need URLs for the two missing portals before I add their entries. If unknown, I'll add them with placeholder URLs and a TODO comment, and they'll appear in the dropdown but route to the placeholder.

- **HR Dashboard** (`incident_reporting`) production URL?
- **Manager Payroll Dashboard** (`manager_payroll_dashboard`) production URL?

