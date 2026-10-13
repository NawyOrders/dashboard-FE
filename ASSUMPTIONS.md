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
