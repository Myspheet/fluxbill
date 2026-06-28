# FluxBill — Merchant Integration Guide

This guide is written for the **downstream developer**: an engineer at a gym, SaaS, or church-funds app who wants FluxBill to handle recurring billing and — the part that matters — **recover failed payments automatically**.

You only ever talk to FluxBill's API. FluxBill talks to Nomba for you.

- **Base URL:** `https://api.fluxbill.app/api` (local: `http://localhost:8000/api`)
- **Interactive reference:** `/docs/api` (OpenAPI 3.1, “Try it” enabled) · machine-readable spec at `/docs/api.json`
- **Postman:** import [`postman/FluxBill.postman_collection.json`](../../postman/FluxBill.postman_collection.json) + the environment file.

> **Money is always in kobo** (integer, ₦1 = 100 kobo). `500000` means ₦5,000.00. Never send floats.

---

## Authentication

| Caller | Mechanism |
|---|---|
| Merchant (you) | Sanctum bearer token: `Authorization: Bearer <token>`, issued at register/login |
| Your customer (portal) | The signed token in the magic-link URL **is** the auth — no password |
| Nomba / FluxBill webhooks | HMAC-SHA256 signature over the raw body |

---

## The 5-step integration

```
1. Register            → get API token + webhook_secret
2. Create plans        → priced recurring offerings
3. Send to checkout    → customer pays, card is tokenised   [activates in the Nomba window]
4. Receive webhooks    → subscription lifecycle events       [activates in the Nomba window]
5. Generate portal link→ let customers self-serve            [activates in the Nomba window]
```

Steps 1–2 are live now. Steps 3–5 call Nomba and go live during the integration window (1–7 July); their request/response contracts are documented below so you can build against them today.

### Step 1 — Register

```http
POST /api/merchants/register
Content-Type: application/json

{ "name": "Adaeze Gym", "email": "owner@adaezegym.com",
  "password": "a-strong-password", "webhook_url": "https://yourapp.com/webhooks/fluxbill" }
```
```json
// 201 Created
{
  "merchant": { "id": "0199…", "name": "Adaeze Gym", "email": "owner@adaezegym.com" },
  "token": "1|fbXXXXitext…",
  "webhook_secret": "whsec_…"   // shown ONCE — store it now to verify our webhooks
}
```
Save the `token` (authenticates your API calls) and the `webhook_secret` (verifies webhooks we send you). The secret is never shown again.

> Log in later with `POST /api/auth/login` (same email/password) to get a fresh token.

### Step 2 — Create plans

```http
POST /api/plans
Authorization: Bearer <token>

{ "name": "Monthly Gym Membership", "amount": 500000, "interval": "monthly", "trial_days": 7 }
```
```json
// 201 Created
{ "data": { "id": "0199…", "amount": 500000, "currency": "NGN", "interval": "monthly",
            "status": "active", "subscribe_url": "https://app.fluxbill.app/subscribe/0199…" } }
```
`interval` is one of `weekly | monthly | annual | custom`. Share `subscribe_url` with customers, or drive checkout yourself (step 3).

### Step 3 — Send the customer to checkout *(Nomba window)*

```http
POST /api/subscriptions/checkout
Authorization: Bearer <token>

{ "plan_id": "0199…", "customer": { "name": "Emeka", "email": "emeka@gmail.com" } }
```
```json
// 202 Accepted (async — checkout initiated)
{ "checkout_url": "https://checkout.nomba.com/…", "merchant_tx_ref": "inv_8821" }
```
Redirect the customer to `checkout_url`. They enter their card on **Nomba's hosted page** (you never handle card data); the card is tokenised for future renewals. Your return page can poll
`GET /api/subscriptions/checkout/{merchant_tx_ref}/status` — but the **webhook is the source of truth**.

### Step 4 — Receive FluxBill webhooks *(Nomba window)*

Set `webhook_url` at register (or `PATCH /api/merchants/webhook`). We POST lifecycle events signed with your `webhook_secret`.

**Events:** `subscription.created`, `subscription.renewed`, `subscription.plan_changed`, `subscription.card_update_required`, `subscription.access_suspended`, `subscription.cancelled`, `invoice.partially_paid`.

```json
// example body we POST to your webhook_url
{
  "event": "subscription.access_suspended",
  "request_id": "evt_9f2a1c",
  "created_at": "2026-07-04T09:15:00Z",
  "data": {
    "subscription_id": "sub_a1b2c3",
    "customer": { "id": "cus_8821", "email": "emeka@gmail.com" },
    "plan_id": "plan_growth_monthly",
    "reason": "dunning_exhausted",
    "last_decline_reason": "INSUFFICIENT_FUNDS",
    "attempts_made": 4
  }
}
```

**Verify every webhook** (the signature is in the `fluxbill-signature` header, HMAC-SHA256 over the raw body):

```php
$expected = hash_hmac('sha256', $request->getContent(), $yourWebhookSecret);
if (! hash_equals($expected, $request->header('fluxbill-signature'))) {
    return response('bad signature', 401);
}
```
This is symmetric to how FluxBill verifies Nomba — verify the signature **before** parsing the body, and treat `request_id` as an idempotency key (we may retry).

### Step 5 — Let customers self-serve *(Nomba window)*

```http
POST /api/portal/generate
Authorization: Bearer <token>

{ "subscription_id": "sub_a1b2c3" }
```
```json
// 200 OK
{ "portal_url": "https://app.fluxbill.app/portal/abc123…", "expires_at": "2026-07-03T15:00:00Z" }
```
The link is **single-use and expires in 1 hour**. Your customer opens it (no login) to view status/invoices, cancel (sets cancel-at-period-end), or update their card.

---

## Standardised errors

**Every** endpoint returns the same error envelope, so you write one handler:

```json
{ "error": { "code": "validation_failed",
             "message": "The amount field must be at least 1.",
             "field": "amount",          // populated for validation errors, else null
             "request_id": "req_8822" } } // also returned in the X-Request-Id header
```

| Status | When |
|---|---|
| 200 | Success |
| 201 | Resource created |
| 202 | Accepted, async (checkout initiated) |
| 401 | Missing/invalid token (`unauthenticated`) |
| 403 | Authenticated but not allowed (`forbidden`) |
| 404 | Not found **or another merchant's resource** — existence is never leaked via 403 (`not_found`) |
| 409 | Idempotency conflict — already processed (`conflict`) |
| 422 | Validation failed on submitted fields (`validation_failed`) |

---

## What FluxBill does that generic billing doesn't

When a renewal charge fails, FluxBill's **Smart Retry Engine** routes the retry on *why* it failed — an expired card is never retried (you get `card_update_required` instead); a bank outage is retried fast and quietly; insufficient funds follows an escalating schedule with a bounded grace period before suspension. You receive the lifecycle as webhooks and the recovered revenue shows on your dashboard. That recovery — involuntary churn is up to 25% of all churn — is the point of integrating.

---

## Conventions cheat-sheet

- **Kobo, always.** `amount: 500000` = ₦5,000.00.
- **Idempotency.** Webhook `request_id` is unique; dedupe on it.
- **Tenant isolation.** Your token only ever sees your own data; another merchant's id returns 404.
- **References.** `merchant_tx_ref` (e.g. `inv_8821`) ties a payment back to its invoice across both systems.
