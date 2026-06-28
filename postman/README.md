# FluxBill — Postman

1. **Import** both files into Postman:
   - `FluxBill.postman_collection.json`
   - `FluxBill.postman_environment.json`
2. Select the **FluxBill — Local** environment (or edit `base_url` for a deployed instance).
3. Run **Auth → Register a merchant** first. Its test script auto-saves `{{merchant_token}}`, so every authenticated request just works. (Already registered? Run **Log in** instead.)
4. **Plans → Create a plan** saves `{{plan_id}}` for the get/update/archive requests.

Amounts are in **kobo** (₦1 = 100 kobo). The `Webhooks` folder holds reference payloads FluxBill sends to *your* app — verify the `fluxbill-signature` (HMAC-SHA256 over the raw body) before parsing.

> The collection mirrors the live OpenAPI spec (`/docs/api`, exported to `backend/docs/openapi.json`). During the Nomba integration window, the in-window endpoints and **real captured responses** are added here.
