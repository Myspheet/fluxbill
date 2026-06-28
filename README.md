# FluxBill — The Recurring Revenue Recovery Layer for Nigerian Businesses

> Built on Nomba (Sub-Accounts + Tokenized Cards + Webhooks) for the **Nomba × DevCareer Hackathon 2026** — Infrastructure Track / Managed Subscriptions Engine.

FluxBill is **not** a generic subscription-management platform. It is a **revenue recovery layer**: when a recurring charge fails, FluxBill's **Smart Retry Engine** recovers it by routing the retry strategy on *why* it failed — an expired card is never retried; a bank outage is retried aggressively and quietly — instead of the generic "retry day 1/3/5/7" everyone else builds. A bounded grace period precedes access suspension, and an AI layer scores churn risk and recommends a concrete recovery action.

**The justifying number:** involuntary churn (payments that fail though the customer meant to keep paying) is **up to 25% of all subscription churn**. That is the gap FluxBill closes.

---

## Stack

| Layer | Tech |
|---|---|
| Backend | Laravel 12, PHP 8.2 |
| Database | PostgreSQL 16 |
| Queue / scheduler | Laravel database queue + scheduler |
| Auth | Sanctum (merchants) + signed single-use links (customer portal) |
| Frontend | React (Vite) + Tailwind, Nomba-yellow accent |
| AI | Google Gemini (churn score + recovery copilot) |
| Infra | Docker Compose (app + worker + db) |

Money is stored and computed in **kobo (integer)** everywhere — never float.

---

## Repository layout

```
app/                      ← git repo root (this folder)
├── backend/              Laravel 12 API
├── frontend/             React (Vite) SPA
├── docker-compose.yml    app + worker + postgres
└── README.md
```

---

## Quick start (Docker)

```bash
cd app
cp backend/.env.example backend/.env   # Nomba keys stay blank pre-window
docker compose up --build
```

- API: http://localhost:8080/api  (health: `GET /api/health`)
- Postgres: localhost:55432  (non-default host port)

> Host ports are deliberately non-default (app `8080`, db `55432`) to avoid clashing with locally running services.

### Frontend (separate dev server)

```bash
cd app/frontend
npm install
npm run dev          # http://localhost:5173  (proxies /api -> backend)
```

## Quick start (local, no Docker)

```bash
# Backend
cd app/backend
cp .env.example .env
composer install
php artisan key:generate
# point DB_* at a local Postgres, then:
php artisan migrate
php artisan serve            # http://localhost:8000

# Frontend
cd app/frontend && npm install && npm run dev
```

---

## API documentation

| Resource | Where | What it is |
|---|---|---|
| **Interactive reference** | `GET /docs/api` | OpenAPI 3.1 docs (Stoplight Elements) with “Try it”, auto-generated from the code by [Scramble](https://scramble.dedoc.co) — it can't drift from the API |
| **OpenAPI spec** | `GET /docs/api.json` · committed at [`backend/docs/openapi.json`](backend/docs/openapi.json) | Machine-readable; import into Postman/Insomnia/codegen |
| **Merchant Integration Guide** | [`backend/docs/INTEGRATION-GUIDE.md`](backend/docs/INTEGRATION-GUIDE.md) | Downstream-developer narrative: 5-step integration, error shape, webhook verification |
| **Postman** | [`postman/`](postman/) | Collection + environment; register request auto-saves the token |

Regenerate the committed spec after changing the API:

```bash
cd app/backend && composer docs:export      # writes docs/openapi.json
```

Because request schemas come from FormRequests and responses from API Resources, **new endpoints are documented automatically** — no annotations required (method docblocks add summaries/descriptions).

---

## What's built now (pre-window, before 1 July)

Everything here runs with **no Nomba credentials** — nothing calls `api.nomba.com`.

- **Full schema** — 18 tables (merchants, plans, customers, card tokens, subscriptions, invoices, dunning attempts, proration history/credits, churn scores, recovery recommendations, portal tokens, webhook idempotency ledger, reconciliation log, group subscriptions). `nomba_*` columns exist but stay null.
- **Tenant isolation** — a global `MerchantScope` on `Plan`, `Subscription`, `Invoice`, `Customer`. Cross-merchant access returns **404, not 403**.
- **Auth** — Sanctum register/login; the merchant `webhook_secret` is shown once.
- **Plan CRUD** — pure DB; `DELETE` archives (never hard-deletes).
- **Standardised errors** — every endpoint returns `{ error: { code, message, field, request_id } }`.
- **CORS** — wired to `FRONTEND_URL`.
- **Smart Retry Engine logic (pure, unit-tested)** — `DunningRouter` (decline-reason routing), `ProrationService`, partial-payment reconciliation, `SubscriptionStateMachine` (9-state guards), `PortalService` (hashed, single-use, expiring tokens), kobo + HMAC helpers.
- **Frontend** — 7 screens (register, login, create plan, dashboard, subscribe, payment return, portal). Register/login/create-plan/dashboard call the live API; checkout/portal screens are static until their Nomba features land.

### Tests

```bash
cd app/backend && php artisan test
```

54 tests / 146 assertions green (DunningRouter, proration, partial-pay, state machine, money/signature helpers, auth, plan CRUD, tenant isolation, portal tokens).

---

## What's added in-window (1–7 July)

Per the build plan, Nomba integration commits **only** during the window:

| Day | Adds |
|---|---|
| 1 | Nomba auth + token caching, sub-account per merchant |
| 2 | Checkout + card tokenization, subscribe/return screens go live |
| 3 | Webhook receiver (HMAC → idempotency → process) + billing engine |
| 4 | **Smart Retry Engine** wired to real failures, proration, partial-pay reconciliation |
| 5 | Churn prediction + recovery copilot (Gemini) |
| 6 | Nightly reconciliation, hosted customer portal |
| 7 | Docker/README/Postman finalisation, demo video, submit |

The pure-logic core that decides retries, proration, grace/suspension and partial payments is **already built and tested** — the window wires it to Nomba's live API.

---

## API surface (pre-window)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | public | Liveness + DB check |
| POST | `/api/merchants/register` | public | Create merchant, returns token + `webhook_secret` (once) |
| POST | `/api/auth/login` | public | Email/password → Sanctum token |
| GET | `/api/auth/me` | merchant | Current merchant |
| POST | `/api/auth/logout` | merchant | Revoke current token |
| PATCH | `/api/merchants/webhook` | merchant | Update downstream webhook URL |
| GET/POST | `/api/plans` | merchant | List / create plans |
| GET/PATCH/DELETE | `/api/plans/{id}` | merchant | Show / edit / archive a plan |

All merchant endpoints are tenant-scoped; every error follows the standardised shape.
