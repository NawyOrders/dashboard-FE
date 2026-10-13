# Nawy Orders — Super Admin Dashboard

React + TypeScript dashboard for **platform operators** of the Nawy Orders multi-tenant
restaurant-ordering SaaS. It manages tenants (restaurants), their subscriptions, package
entitlements, channel delivery status and the audit log.

This project is **only** the Super Admin panel. It is not the restaurant admin panel and
does not contain orders, POS, menu, inventory or accounting screens.

## Requirements

- Node.js 18+ (tested on Node 20)
- npm

## Run

```bash
npm install
npm run dev        # Vite dev server → http://localhost:5173
```

Other scripts:

```bash
npm run build      # tsc --noEmit && vite build
npm run lint       # eslint (classic .eslintrc.cjs), zero warnings allowed
npm run typecheck  # tsc --noEmit
npm test           # vitest run
npm run test:coverage  # vitest run --coverage (thresholds enforced)
npm run preview    # serve the production build
```

### Demo data

The app ships with a **mock data layer**. While it is active a **"Demo data"** badge is
shown in the top bar and on the Overview / Subscriptions / Activity Logs headers, so mock
figures are never presented as real production numbers.

All KPIs are computed from the data the provider returns — none are hard-coded.

To exercise the error state, append `?mockError=1` to any URL (every API call then rejects).

The account menu contains a **role switcher (dev)** to test permissions:
`super_admin` (full) vs `support` (read-only + logged tenant access).

## Project structure

Clean architecture — dependencies point inward only
(`presentation → application → domain`; `infrastructure` implements `application` ports).

```
src/
  domain/              enterprise rules — no framework, no I/O
    entities/          tenant, subscription, package, activity-log, user (+ enums)
    rules/             date, subscription, packages, permissions, validation
  application/         orchestration — depends on domain only
    dto.ts             Api contract + request/response shapes
    ports.ts           repository / clock / id / permission interfaces
    use-cases/         one factory per action + createBackend() composition
  infrastructure/      adapters implementing application ports
    repositories/      in-memory Restaurant / ActivityLog / FeatureFlag stores
    mock/              mock API adapter (latency, cloning, ?mockError=1)
    seed/ clock/ ids/  fictional seed data (26 tenants), SystemClock, id generator
  presentation/        React only — depends on application contracts
    components/        ui/ kit + layout/ shell (Sidebar, TopBar, AccountMenu)
    features/          overview/ restaurants/ restaurant-details/ create-restaurant/
                       subscriptions/ packages/ activity-logs/ settings/
    hooks/ i18n/ lib/  usePermission, useDebounce, query hooks; en.ts; display helpers
  app/                 composition root + router + providers
    composition.ts     wires ports → use cases → mock adapter, exports `api`
  config/              policy.ts (open decisions), packages.ts (constants only)
  test/                vitest setup, fixtures, harness
```

Architecture rules live in `agent.md` (§6); the visual system in `design.md`. Decisions taken
where the spec was silent are listed in `ASSUMPTIONS.md` (each mirrored by a
`// ASSUMPTION:` comment in the source). Bug resolutions and verification are in
`QA_REPORT.md`.

## Status model (kept deliberately separate)

The UI never merges these into one column or badge:

| Domain              | Field                                    | Values |
|---------------------|------------------------------------------|--------|
| Restaurant status   | `tenant.status`                          | active / pending / inactive |
| Subscription status | `tenant.subscription.status`             | active / expiring_soon / expired / not_started |
| Website status      | `tenant.channels.websiteStatus`          | ready / in_setup / not_tracked / null |
| PWA status          | `tenant.channels.pwaStatus`              | ready / in_setup / not_tracked / null |
| Mobile app status   | `tenant.apps.android`, `.ios`            | not_started / in_preparation / submitted_to_store / published / null |
| Branch status       | `branch.status`                          | active / pending / inactive |

**Entitlement ≠ delivery:** a Growth tenant is entitled to mobile apps, but the app
delivery state is a separate field. Publishing is never implied by the package.

## Swapping the mock API for a real one

The UI depends on the single `Api` interface in `src/application/dto.ts` and imports it
through the composition root in `src/app/composition.ts`:

```ts
// src/app/composition.ts
export const api: Api = createMockApi(backend, { minDelayMs, maxDelayMs }); // ← swap this
export const IS_MOCK_PROVIDER = true; // ← set false to hide the "Demo data" badge
```

To connect a backend:

1. Create e.g. `src/infrastructure/http/http-api.ts`:
   ```ts
   import type { Api } from '@/application';
   export const httpApi: Api = {
     getCurrentUser: () => fetch('/api/me').then(toJson),
     listTenants: (params) => fetch(`/api/tenants?${toQuery(params)}`).then(toJson),
     getTenant: (tenantId) => fetch(`/api/tenants/${tenantId}`).then(toJson),
     // …one method per entry in the Api interface
   };
   ```
2. Point `src/app/composition.ts` at it and set `IS_MOCK_PROVIDER = false`.
3. Ensure every method matches the `Api` signature and keeps tenant scoping (every
   tenant-scoped function takes/returns data for a single `tenantId`).

No component imports the mock directly, so no feature code changes. TanStack Query cache
keys are stable, so mutations should invalidate `['tenants']`, `['tenant', id]`,
`['activity']` and `['flags', id]` exactly as the mock-driven flows already do.

## Design notes

- Logical CSS properties (`ms-*`, `ps-*`, `start-*`) are used throughout, so Arabic/RTL can
  be added later without layout changes; strings are centralised in `src/i18n/en.ts`.
- Responsive: full layout ≥1280px; icon rail with tooltips 768–1279px; below 768px the
  sidebar becomes an off-canvas drawer opened by the top-bar hamburger. The drawer always
  shows **icon + full text label** for every nav item (never icon-only), closes on backdrop
  tap / Esc / route change, and traps focus while open.
