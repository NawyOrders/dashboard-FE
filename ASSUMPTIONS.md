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

## Architecture refactor
23. The codebase was reorganized into clean-architecture layers
    (`domain` → `application` → `infrastructure`/`presentation`, composed in `app`).
    Dependencies point inward only; the mock API is an `infrastructure` adapter behind the
    `Api` port declared in `application/dto.ts`. See `agent.md` §6.
24. `config/features.ts` was deleted; its logic moved to `domain/rules/packages.ts`
    (feature gating is a domain rule, not a config constant). `config/` now holds only
    constants (`policy.ts`, `packages.ts`).
25. IDs for created entities start at `10_000` so they can never collide with seeded ids.
26. Time and id generation are injectable (`Clock`, `IdGenerator` ports) so use cases and
    tests are deterministic; production uses `SystemClock` / `createSequentialIdGenerator`.

## Validation rules (bugs.md)
27. **Name allowed set** (business, restaurant, branch): letters, digits, spaces, hyphen `-`
    and apostrophe `'` only (`/^[\p{L}\p{N} \-']+$/u`); the value must contain at least one
    letter (so purely numeric input is rejected). Non-Latin letters are accepted via `\p{L}`.
28. **Phone rules** (main + branch), in evaluation order:
    - contains a letter → BUG-005 / BUG-017 message;
    - a non-digit character other than one optional leading `+` → BUG-006 / BUG-018 message;
    - fewer than `MIN_PHONE_DIGITS` (7) digits → BUG-008 / BUG-020 message;
    - more than `MAX_PHONE_DIGITS` (15) digits → BUG-007 / BUG-019 message.
29. **Email rules**, in evaluation order:
    - not exactly one `@` → contains a symbol from the `@#$%^&` set? BUG-015 message,
      otherwise all-digits → BUG-016 message, otherwise BUG-010 message;
    - disallowed character in local part or domain → BUG-015 message;
    - malformed domain (missing dot, empty label) or TLD shorter than 2 letters → BUG-011 message.
    `'`, `-` and `.` are accepted in the local part (BUG-009).
30. **Conflict — BUG-006 vs BUG-007/019:** both describe symbol input (e.g. `01?#@@#`).
    The more specific "symbols are not allowed" message (BUG-006 / BUG-018) wins for
    non-digit, non-leading-`+` characters; the pattern message (BUG-007 / BUG-019) is used
    only for valid-looking input that is too long.
31. All user-facing validation strings are centralized in `VALIDATION_MESSAGES` in
    `src/domain/rules/validation.ts` and consumed by the zod schemas, so the UI never
    re-states a message and cannot drift from the bug list.
32. Search matching (BUG-022/023): the query is trimmed before matching and compared with
    `String.prototype.includes` (never `RegExp`), so `'`, `&` and `-` match literally.

## Phase 3b — Overview analysis
33. The Overview analysis block (contracts-per-month chart, latest contracts, ending soon) treats
    the **subscription start date** as the "contract date". The spec did not name a separate
    contract-signing date, so `subscription.startDate` is reused.
34. The chart shows the last `OVERVIEW_CHART_MONTHS` (6) **calendar months including the current
    month**, oldest → newest. Months with zero contracts are rendered as zero-height bars (never
    hidden); exact counts appear in a tooltip and in an sr-only table for screen readers.
35. "Latest contracts" = the `OVERVIEW_LATEST_CONTRACTS_COUNT` (8) most recent contracts, sorted by
    contract date descending, tie-broken by Tenant ID descending.
36. The "ending within N days" table uses its **own** constant `OVERVIEW_ENDING_WITHIN_DAYS` (14),
    intentionally separate from `EXPIRING_SOON_DAYS` (30) which drives the KPI card and badges. It
    is date-driven: includes `0 ≤ daysRemaining ≤ 14`, excludes already-expired contracts, sorts
    most-urgent-first, and does not special-case `not_started`.
37. The "Renew" action in the ending-soon table reuses the existing Edit Subscription dialog and is
    gated by the `subscription.change` permission (no new renewal flow was invented).
38. No sales/revenue total is displayed. `FEATURES.overviewRevenue` lives in `src/config/policy.ts`
    and defaults to `false`; the total-sales card is hidden until revenue is approved (extends
    item 24, which notes `config/`, and this `FEATURES` constant, only hold constants).

## Update tickets (AH-236 → AH-239)
39. **Branch base:** the repository has no `main` branch. Ticket branches are stacked starting
    from `test-dashboard-update` (AH-236), then AH-237, AH-238, AH-239 on top.
40. **Role registry (AH-236):** `ROLE_REGISTRY` in `src/domain/rules/permissions.ts` is the single
    source of truth for role labels, descriptions and permissions. `super_admin` keeps account and
    role management; `support` is read-only and additionally gets `accounts.view` (view the accounts
    list) but **not** `account.create` / `role.manage` — the spec only required the new management
    surface for super admins.
41. **Activity targets (AH-236):** `ActivityTarget.tenantId` became optional because
    `account_created` entries are not tenant-scoped; the tenant filter in `list-activity` simply
    never matches account targets.
42. **Packages page removed (AH-236b):** the `/packages` route, page, nav item, `usePackages`
    hook, `listPackages` use case and `Api.listPackages` were removed per the ticket.
    `config/packages.ts`, `domain/rules/packages.ts`, `PackageCards` and the `ManageFeaturesDialog`
    remain — package/feature **gating** is still required by the restaurant details and edit flows.
    The `en.packages.*` strings kept for those flows (`feature`, `priceFor`) were trimmed to the
    keys still referenced.
43. **Seed admin accounts (AH-236):** three fictional accounts (two `super_admin`, one `support`,
    one inactive) are seeded so the Accounts table and search have data; emails use the reserved
    `@example.com` domain.

## Design tokens (AH-237)
44. **Single source of truth:** `src/presentation/theme/tokens.ts` holds every color, radius,
    shadow, focus-ring and typography value. `tailwind.config.ts` imports it at build time;
    `applyTheme()` (called once in `main.tsx`) injects the same values as CSS custom properties
    for the base layer. Hex literals in app code are otherwise banned — the only remaining ones
    are the fallbacks mirrored in `index.css` (documented as such) and tenant brand-color
    **data** in the seed/palette pickers (`BasicsStep` placeholder is illustrative data).
45. **Typography:** h1 = 64px / weight 800 and KPI values = 48px / weight 500 exactly as the
    ticket states; Alexandria (400/500/800) replaces Inter, body base is 16px. Dense UI (tables,
    meta text, pills, form labels) keeps an auxiliary 14/12px scale — 48px captions would break
    table density; this deviation is recorded here and in `QA_REPORT.md`, not hidden.
46. **Page titles on small screens:** the 64px h1 renders at 40px below `md` so it wraps cleanly
    at 390px instead of overflowing (ticket asked for layout fixes to be logged, not silent).
47. **Radius:** card/panel = 8px, pill/avatar = 9999px (avatar/logo/severity-dot become circles).
    Checkbox keeps a 4px control radius as a native-control exception.
48. **Shadows:** sm (buttons, chips, icon buttons), DEFAULT = `shadow-card` (cards, dropdowns,
    toasts), md (reserved for side panels), lg (modals), `primary` (active nav/primary buttons).
49. **`info` tone removed:** `Badge`/`Toast`/KPI tints now use `neutral`; `submitted_to_store`
    app status renders as `warning` (closest semantic match). Toast variant union is
    `success | error | neutral`.
50. **Error vs danger:** form validation uses the new `error` tokens (`#EF4444` + 15% ring);
    `danger` tokens remain for status pills only.
51. **Focus:** global `:focus-visible` uses a 3px `#E438201F` outline; error fields add an
    `error-ring` 4px ring on focus.
52. **Contrast limitation:** white text on primary `#E43820` is ≈4.30:1 — just under 4.5:1 for
    small body text, but ≥3:1 for large/bold text and UI components (buttons are 14–16px
    medium/bold). Kept per spec; logged in `QA_REPORT.md`.
