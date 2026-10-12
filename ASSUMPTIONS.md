# ASSUMPTIONS

Decisions taken where the spec was silent or ambiguous, per `agent.md` §10.
Each item is mirrored by a `// ASSUMPTION:` comment in the source.

## Missing source files
1. `nawy_orders_super_admin_dashboard.md` (original product spec) and `screen.png` (visual
   reference) were **not present** in the repository. Work proceeded using `agent.md` and
   `design.md` as the distilled source of truth. If the original spec is restored, re-check
   scope and naming against it.

## Stack & tooling
2. Stack not specified by the spec (`agent.md` §3): React 18 + Vite + TypeScript (strict),
   Tailwind CSS, React Router, TanStack Query, react-hook-form + zod, lucide-react. Adopted as-is.
3. Inter font loaded from Google Fonts via `index.html`.
4. ESLint uses the classic `.eslintrc.cjs` config (not flat config) for stability.

## Data layer
5. Mock data: 26 fictional tenants (emails use the reserved `@example.com` domain; names are
   invented) covering every status combination, including expired/expiring-soon subscriptions,
   Growth tenants at each app-delivery state, and Start tenants with null channel statuses.
6. `?mockError=1` forces the mock API to reject every call, so the error state can be exercised.
7. Creating a tenant derives the subscription status from the start/end dates
   (`not_started` / `expired` / `expiring_soon` / `active`) because the create form does not ask
   for a subscription status explicitly (it asks for restaurant status only).
8. Feature flags are seeded to match the package entitlement (Growth-only features off for Start).

## Product behavior
9. Website status and PWA status are modelled as two independent `ChannelStatus | null` fields;
   Mobile app status is two independent `AppStatus | null` fields (Android, iOS). `null` renders
   as "Not tracked".
10. "Active Subscriptions" KPI counts subscriptions whose stored status is `active`
    (expiring-soon excluded, since it is its own status).
11. "Expiring soon" filter/KPI uses `EXPIRING_SOON_DAYS` (30) on the end date, while the pill
    label uses the stored subscription status.
12. Logo upload is out of scope for V1; the create form accepts an image URL instead.
13. CSV export is generated client-side from the rows already loaded/filtered.
14. Dev role switcher (super_admin / support) is exposed in the account menu for testing
    permissions. It is clearly marked "(dev)".

## Open decisions (see `src/config/policy.ts`)
15. `EXPIRING_SOON_DAYS = 30`.
16. Subscription start date is chosen manually; no automatic rule.
17. No grace period and no automatic suspension on expiry; expired subscriptions stay `expired`.
18. Notifications bell is rendered but disabled/empty.
19. Extra branches beyond 4 show a "fee not yet defined" note with no price.

## Post-review decisions
20. The top-bar global search navigates to `/restaurants?q=…`; the restaurants directory is
    remounted (keyed) when `q` changes so an in-page search updates the existing table.
21. The "Demo data" badge is shown in the top bar at **all** breakpoints (not only ≥sm), so
    the mock provider is always disclosed; the page title truncates if space is tight.
22. `eslint.config.js` (Vite flat-config template) was removed and lint intentionally runs
    from the classic `.eslintrc.cjs`, matching item 4 and the `--ext` flag in `npm run lint`.
