

## Add Accounting Portal to Portal Switcher

### Change
Add a new "Accounting" entry to the portal switcher dropdown that links to `accounting.atlasteam.app`.

### Technical Details

**File: `src/components/PortalSwitcher.tsx`**

1. Import a suitable icon (e.g., `Calculator` from lucide-react)
2. Add a new entry to the `portals` array:

```ts
{
  key: 'accounting',
  title: 'Accounting',
  icon: Calculator,
  href: '/accounting',
  externalUrl: 'https://accounting.atlasteam.app'
}
```

3. Add a permission case in the `accessiblePortals` filter. Since there is an `accounting` portal key defined in `src/auth/portalKeys.ts`, map it to an appropriate permission. For now, make it accessible to all authenticated users (like KPI Dashboard), unless you want it restricted.

### Summary
- 1 file edited: `src/components/PortalSwitcher.tsx`
- New portal entry pointing to `https://accounting.atlasteam.app`

