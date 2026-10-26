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
19. ~~Extra branches beyond 4 show a "fee not yet defined" note with no price.~~ Superseded by
    NW-247: the branch limit is 2 for every package (owner decision), so no branch is ever
    "beyond the limit" and **no fee text is shown anywhere**.

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

## AH-237 close-out (resume pass)
53. **Page background conflict:** the resume checklist stated "Page background is #C16A12",
    but `Nawy-Order-DESIGN.md` is not in the repository and the distilled AH-237 ticket
    (recorded before the resume) specified `bg = #FDF8F3`, with `#C16A12` appearing only as a
    white-text canvas in the contrast note. Conservative choice: keep `bg = #FDF8F3`. If the
    design doc later confirms the canvas, it is a one-line change in `tokens.ts` (the base
    layer and Tailwind classes both read from it).
54. **Status-pill colors:** `success` (#167A3E / #E6F6EC), `warning` (#9A6200 / #FFF4D6),
    `danger` (#B8251A / #FDE7E4) and `neutral` (#5E544D / #F3EEE9) are defined as tokens and
    used by `Badge`/`StatusPill`; they match the values carried over from the previous theme.
55. **`tailwind.config.ts`:** confirmed working in this setup — Tailwind auto-discovers the TS
    config via jiti; neither `postcss.config.js` nor `vite.config.ts` references a config path,
    and the built CSS contains the token values. No fallback to `.js` was needed.
56. **Line endings:** `.gitattributes` with `* text=auto` added; no renormalization commit was
    required (no files had mixed endings in the index).
57. **Create-form brand defaults** (`CreateRestaurantPage` `#E43820` / `#FF6B63`) are tenant
    brand-color **data** (form defaults), in the same category as the seed `PALETTE`; the
    `BasicsStep` picker fallback/placeholder now reads `tokens.colors.primary.DEFAULT`.

## AH-239 sales chart
58. **`scale()` signature:** the chart scale helper took both a `buckets` argument and an
    `opts.buckets` field (duplicated input), which left the first parameter unused. Rather than
    silencing lint with an `_` prefix, the redundant parameter was **removed** and the function
    now reads `opts.buckets` — a single source of truth for the data being scaled.
59. **Monotone cubic line (Fritsch–Carlson):** `charts/path.ts` builds the smooth line itself
    rather than pulling a `d3-shape`-style dependency, because `agent.md` §3 restricts new
    chart libraries; the helper is pure (numbers in, SVG path string out) and never overshoots
    between months.
60. **Sales chart colors & empty state:** the SVG reads all colors from `theme/tokens.ts`
    (primary line + gradient, border grid, muted axis text, card/text tooltip) rather than
    inline hex or `var(--…)`, so the runtime theme injection and Tailwind stay the single
    source. The chart stays a line (flat on the axis) when every month is zero and adds the
    `en.overview.noSales` caption; zero months are still plotted as points so the series shape
    is never hidden. Width is measured with a `ResizeObserver` so the SVG maps
    1:1 to pixels and the stroke is not distorted by `preserveAspectRatio`. (AH-239)

## AH-239 applications flow
61. **Only Super Admin approves.** The Approve action is gated in the UI by
    `usePermission('restaurant.edit')`, and only `super_admin` holds that permission in
    `ROLE_REGISTRY` (Support does not). Other roles therefore see the Applications table
    read-only (View only); `restaurant.edit` stays the single source of truth for "may mutate a
    restaurant".
62. **Approving does not activate the subscription.** `approveApplication` only moves
    `status: pending_approval → approved` and appends the activity-log entry; the subscription
    stays `not_started`. Turning the subscription on remains a separate, explicit action on the
    restaurant details page. (Mirrors the `// ASSUMPTION:` comment in `approve-application.ts`.)
63. **One pending-applications query backs every count.** The TopBar button badge, the
    notifications bell, the Overview "Pending Approval" KPI and the Applications table all read
    `useApplications()` (key `queryKeys.applications` → `api.listApplications()` →
    `listApplications`, filtered by `isListed` = `status !== 'pending_approval'`). TanStack
    Query dedupes them into a single request, so the four counts can never disagree.
64. **The sales series is mock data.** `getMonthlySales` returns a deterministic seed series
    (one record per active tenant per day over 365 days, fixed amounts, no randomness —
    `buildSeedSales`). It feeds the sales-per-month chart only; no total is computed or shown
    and the pages carry the "Demo data" badge. (Repeated in `get-monthly-sales.ts`.)
65. **Removed Create-Restaurant form → pending applications.** The old manual registration
    form's seed entries were re-modelled as pending applications: three tenants start as
    `status: 'pending_approval'` with `subscription.status: 'not_started'`, no live channels and
    0–1 branches (Falcon's Nest, Kelvin's Kitchen, Umbra Umami). `isListed` keeps them out of
    the directory/Overview, so they surface only on the Applications page until an admin
    approves them, after which they join the directory. No "create" use case exists any more.
66. **SPA fallback for deep routes is a host responsibility (refresh 404).** The app uses
    `createBrowserRouter` (history mode) with no `basename`, and `vite.config.ts` sets no `base`
    (both default to `/`, so they match). Vite dev and `vite preview` rewrite unknown paths to
    `index.html`, so `/applications`, `/analytics` and `/restaurants/:id` return 200 locally on
    direct load and refresh. The repository ships **no** host configuration (`vercel.json`,
    `netlify.toml`, `public/_redirects`, nginx/S3 rules), so a static host without an SPA rewrite
    returns 404 when refreshing a deep route. Add the host-specific rewrite (or switch to a hash
    router) once a target host is chosen — deliberately not guessed here.
67. **The whole type scale is now token-driven and 2px smaller (floor 12px).** The design
    token scale previously only defined `h1` 64, `caption` 48, `body` 16 and `dense` 14/12,
    while components used Tailwind's default `text-xs/sm/base/lg/xl/2xl` sizes and a few
    hard-coded `text-[40px]/[13px]/[11px]/[10px]` and SVG `fontSize` values. `AH-239` moves
    every used size into `tokens.ts` (`h1` 62, `caption` 46, `2xs/xs/sm` 12, `base` 14,
    `lg` 16, `xl` 18, `2xl` 22, plus `title` 38 for the mobile page title, `mono` 12,
    `badge` 11, `micro` 10 and `chart` 12) and maps them in     `tailwind.config.ts`. Line-heights
    are stored as unitless ratios so the proportion is preserved at any size, and no value
    drops below the 12px floor. The global body size reads the `base` token through the
    `--font-body` CSS variable injected by `applyTheme`, so `tokens.ts` stays the single
    source. Hard-coded component sizes were replaced with the matching token names.

## NW-246 schema-driven registration form
68. **Branch limits per package (confirmed by the owner, not an assumption).** ~~`Start` allows
    1–2 branches and `Growth` allows 1–4~~ **NW-247: the limit is 2 for EVERY package**
    (`Start` and `Growth` both declare 1–2), stored in `config/packages.ts`
    (`PackageDefinition.branchLimits`) and enforced by the registration-form repeater and by
    the approve validation. The `limits` block of
    `src/config/restaurant-registration-fields.json` (`minBranches: 1`, `maxBranches: 2`) is
    **not** used for the maximum, because the limits are owned by the package configuration.
    The platform-wide included-branch count (`INCLUDED_BRANCHES`, `config/policy.ts`) is now
    derived from those package limits, so the two can never drift apart.
69. **Leaflet is a new runtime dependency.** `leaflet` 1.9.4 (dependency) and `@types/leaflet`
    1.9.22 (dev dependency) render the branch map picker. Tiles come from OpenStreetMap using
    the `tileUrl`/`attribution` values in the registration-fields JSON; no API key is required.
    The marker is a `divIcon` styled with the design tokens, so no marker image asset and no
    hex value is needed.
70. **Uploaded images are stored as data URLs in the mock.** The JSON marks both image-upload
    fields with `saveBehavior: "local preview only until upload endpoint exists"`, so the file
    upload goes through the `FileUploadRepository` port and the mock adapter returns a
    `data:` URL that is written into `coverImageUrl` / `menuImageUrl`. No binary is persisted
    and the payload stays inside the in-memory mock.
71. **City options come from a static list.** The JSON field `city` declares
    `options: "backend list (ASSUMPTION)"` and gives no values, so `config/cities.ts` holds a
    fixed list of Egyptian cities (starting with the JSON example "الاسكندرية") until the
    backend provides one.
72. **The map opens on a default position.** With no coordinates yet, the picker centres on
    `config/map.ts` (`DEFAULT_MAP_CENTER` = Cairo, zoom 12) and shows no marker until the
    owner picks a point. The JSON does not define a default centre.
73. **Monthly / yearly prices are derived from the reference price table.** The JSON package
    shape asks for `monthlyPrice`/`yearlyPrice`, but the dashboard only had reference prices
    per duration (Start 9,000 / 17,000 / 32,000 EGP for 3 / 6 / 12 months, Growth 18,000 /
    34,000 / 64,000). Monthly is the 3-month price divided by three (Start 3,000, Growth 6,000)
    and yearly is the 12-month reference price (Start 32,000, Growth 64,000). They stay
    reference prices and are not confirmed commercial terms.
74. **The billing cycle toggle is display-only.** `Monthly` / `Yearly` selects which price the
    package cards show, as the JSON describes. The persisted subscription keeps the existing
    `durationMonths` (3 / 6 / 12) model — a monthly/yearly cycle and a 3/6/12-month duration
    are different concepts and are not merged. The cycle is therefore not written on save.
75. **Read-only sections render values as text.** The `logo` and `brand_colors` sections are
    marked `editable: false` in the JSON, so they are shown as plain values (logo tile, colour
    swatches) instead of inputs; they are still part of the form and are never hidden.

76. **Saving the form logs one entry per changed field.** `updateApplication` compares the stored
    tenant with the saved one field by field (using the JSON field labels) and writes one
    `restaurant_details_changed` entry per changed field, with the previous and new value.
    Branches that were added or removed get one entry of their own. Nothing is logged when
    nothing changed, and no entry is written for the billing cycle because it is not persisted.
77. **Approve stores the form first.** Since the reviewer approves what is on screen, `Approve`
    calls `updateApplication` with the current form values and then `approveApplication`. This
    keeps the stored tenant and the approved data identical.
78. **Labels from the JSON win over the English UI strings.** Where the JSON supplies a label
    (`addButtonLabel`, `removeLabel`, the billing-cycle labels) that Arabic label is used as
    given, because the JSON is the single source of truth for the form. Layout headings that the
    JSON does not carry use `en.ts`.
79. **Branch cards fold and the map mounts on demand.** The JSON `map.behavior` asks for the map
    to load only while its branch is open, so each branch card is collapsible and the Leaflet
    map is created only when the card is open. A branch with a validation problem is opened
    automatically so the field can be focused.
80. **The same form is reused on the restaurant details page.** Approved restaurants get a
    `Registration` tab that renders the same schema-driven form; saving there uses the same
    `updateApplication` use case and activity log. It is read-only for Support.
81. **Seed data carries the new registration fields.** The demo tenants were extended (owner
    name, city, description, branch opening hours and coordinates; cover and menu images stay
    empty) so the form can be exercised end to end. Seeded phone numbers keep their display
    format and do not satisfy the JSON phone pattern, so approving a seed application also
    demonstrates the inline validation until the phone is corrected.

## NW-247 — commercial register, accounts and passwords
82. **Commercial register number (ASSUMPTION: verify with official source before production).**
    The number is optional and, when filled, must be digits only and exactly
    `commercialRegisterMinLength` … `commercialRegisterMaxLength` (15 … 15) characters long.
    Both lengths live in `src/config/validation.ts` and carry the `// ASSUMPTION:` marker.
83. **The commercial register number is added to the schema at load time.** The owner file
    `src/config/restaurant-registration-fields.json` describes the customer-facing
    registration wizard and must not be edited, so the dashboard-only field is declared in
    `src/config/dashboard-registration-fields.ts` and merged into the parsed schema
    (`withDashboardFields`). The form, the validation and the activity log keep working with
    one schema; no field is hard-coded in a component.
84. **The demo data never exceeds the branch limit.** With the limit of 2 for every package
    (item 68), the seeded restaurants were reduced to at most 2 branches, so no demo record
    contradicts the owner decision.
85. **One account model for internal and tenant accounts.** `src/domain/entities/account.ts`
    holds a single `Account` type with `accountType: 'internal' | 'tenant'`; internal accounts
    carry the dashboard `role`, tenant accounts carry `tenantId` and the restaurant role.
    Both live in one account store, so a tenant account can never be mistaken for a
    dashboard user.
86. **A tenant account never signs in to this dashboard.** The account store answers `null`
    for a tenant account in `findByCredentials`, exactly as it does for a wrong password, so
    the sign-in screen shows the same generic "Invalid email or password" error and never
    reveals that the account exists. An inactive account is rejected the same way.
87. **Passwords are stored as a hash only.** The mock account store hashes a password with
    SHA-256 (`src/infrastructure/security/password-hasher.ts`) and keeps only the hash; the
    plain password never reaches the store, an activity log or the console.
    ASSUMPTION: SHA-256 without a per-account salt is enough for this mock — a real backend
    must use a slow key-derivation function (argon2 / bcrypt / scrypt) with a unique salt.
88. **The restaurant roles are still a mock.** `src/config/restaurant-roles.ts` copies the
    owner file `restaurant-roles.mock.ts` and keeps its `// MOCK: replace with owner-defined
    roles.` marker. `admin` is not offered in the role select: the admin account of a
    restaurant is created when the application is approved.
89. **One password policy for the whole product.** `src/domain/rules/password.ts` requires
    at least 8 characters, at least one letter and at least one digit. The same rule is
    used for the restaurant admin password (set while approving an application), for the
    password of a dashboard user and for the password of a tenant account.
    ASSUMPTION: the owner did not define a password policy — 8 characters with a letter
    and a digit is the platform default used here.
90. **Approving an application creates the admin account of the restaurant.** The password
    is entered in the application view dialog and checked like every other required field:
    an empty value blocks the approval and is listed in the inline summary. The account
    gets the restaurant role `admin`, which is never offered in the role select. The
    activity log records `account_created` for it — without the password value.
91. **A user changes their own password in the platform settings.** The current password is
    verified against the signed-in account first: a wrong one changes nothing and shows an
    inline error. The new password follows the policy of item 89 and must be repeated. The
    activity log records `account.password_changed` with the actor — never with a password
    value.
92. **A new dashboard account is created with a password.** The create-account form asks
    for the password and its repetition; the password is required and follows the policy of
    item 89. The account can sign in right after it is created. The activity log records
    `account_created` with the email and the role — never with a password value.
93. **The tenant accounts live in a section of the accounts page.** Every row shows the
    restaurant, the role, the email and the date the account was created. A Super Admin
    creates an account for one restaurant with the permission `tenantAccount.create`;
    the Support role keeps read-only access to the list. The role select offers the roles
    of `src/config/restaurant-roles.ts` only — `admin` is never in it, because that
    account is created when the application is approved. The email format and the
    password policy are checked by the use case as well, not only by the form.
    ASSUMPTION: a tenant account has no name field in the form, so the account is stored
    with the restaurant name and the role as its display name.
94. **A Super Admin resets the password of a tenant account from the accounts page.** The
    action needs the permission `tenantAccount.resetPassword`; the dialog asks for the new
    password and its repetition. The old password stops working as soon as the reset is
    saved — only the hash is replaced in the account store. The activity log records
    `account.password_reset` with the actor and the account — never with a password value.
95. **The static data source is read-only on disk.** `public/mock/*.json` is loaded once
    through `fetch` and validated with Zod. Approve, save, delete, account creation,
    password reset and password changes update the in-memory cache only; a page refresh
    restores the fixture values. The files under `public/` are demo data and contain
    fictional names, addresses, contact details and credentials only.
96. **Demo login credentials are fixtures only.** The static adapter reads
    `public/mock/auth/login-fixtures.json`; for example
    `superadmin@example.com` / `SuperDemo123!` and `support@example.com` /
    `SupportDemo123!`. These passwords are fictional, hashed in memory, and must never be
    reused in a real environment. Sign-out clears both `nawy_session` and
    `nawy_platform_tokens` from `sessionStorage`.
