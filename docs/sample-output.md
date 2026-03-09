# SpecFlow Sample Output

This page describes what SpecFlow generates when you load the VaultPay API specification — the example spec that ships with the repository at [`examples/vaultpay.yaml`](../examples/vaultpay.yaml).

See for yourself at the live demo: [sulagnasasmal.github.io/specflow](https://sulagnasasmal.github.io/specflow/) → **Try the VaultPay example**.

---

## What the VaultPay spec contains

The VaultPay spec models a fintech payment infrastructure API for financial institutions. It includes:

- **4 tag groups:** Payments, Accounts, Transfers, Webhooks
- **2 authentication schemes:** Bearer token (JWT) and API key (`X-API-Key` header)
- **2 server environments:** Production (`api.vaultpay.io/v2`) and Sandbox (`sandbox.vaultpay.io/v2`)
- **Compliance annotations** (`x-compliance` extensions) on sensitive endpoints
- **Structured error schema** with `code`, `message`, `details`, and `request_id`
- **Shared schemas** via `$ref` — `Money`, `Payment`, `PaymentStatus`, `Account`, `Error`

---

## Portal layout

### Navigation panel (left)

```
┌─────────────────────────────┐
│  🔍  Search endpoints...     │
├─────────────────────────────┤
│  ▼ Payments                 │
│     GET  /payments          │
│     POST /payments          │
│     GET  /payments/{id}     │
│     POST /payments/{id}/...  │
│  ▼ Accounts                 │
│     GET  /accounts          │
│     GET  /accounts/{id}     │
│     PATCH /accounts/{id}    │
│  ▼ Transfers                │
│     POST /transfers         │
│     GET  /transfers/{id}    │
│  ▼ Webhooks                 │
│     GET  /webhooks          │
│     POST /webhooks          │
│     DELETE /webhooks/{id}   │
└─────────────────────────────┘
```

Each endpoint in the nav shows:

- A colored method badge — green for `GET`, blue for `POST`, amber for `PATCH`, red for `DELETE`
- The path, shortened if needed
- A hover tooltip showing the endpoint summary

Selecting a tag group header collapses or expands it. The currently selected endpoint is highlighted.

---

## Content panel — `POST /payments`

The center panel for the **Create payment** endpoint (`POST /payments`) renders as follows.

### Header section

```
● POST  /payments
Create a payment
```

Below the header, the full description from the spec:

> Initiate a new payment transaction. For card payments, the charge is authorized immediately. For bank transfers, the charge is pending until the funds clear.

### Compliance callout

Because this endpoint has `x-compliance` extensions in the spec, a callout box appears:

```
┌──────────────────────────────────────────────────────────────┐
│  ⚖  Compliance                                               │
│  Regulations: PCI-DSS 4.0, SOX                               │
│  Data classification: Restricted                             │
│  Audit logging: Required                                     │
└──────────────────────────────────────────────────────────────┘
```

This renders any `x-compliance` object as a structured callout rather than leaving it as raw JSON in the spec. Teams that annotate their specs with regulatory context see it surfaced automatically.

### Request body section

The request body section shows the `PaymentRequest` schema, expanded one level:

```
Request Body  application/json  required

  amount *            object (Money)
    amount *          integer
                      Amount in minor currency units (e.g., cents for USD)
                      Example: 10000
    currency *        string (iso-4217)
                      ISO 4217 currency code
                      Enum: USD | EUR | GBP | JPY | CAD | AUD

  payment_method *    object
    type *            string
                      Enum: card | bank_transfer | wallet
    token             string
                      Tokenized payment method ID

  description         string  maxLength: 500
  customer_id         string
  idempotency_key     string (uuid)
                      Unique key to prevent duplicate charges
  metadata            object
```

Required fields are marked with an asterisk (*). Nested `$ref` schemas expand inline — `Money` is rendered as its own property tree rather than displayed as a raw reference.

### Responses section

```
200 OK
  Payment created successfully.
  Schema: Payment

  id *               string (uuid)      pay_550e8400-...
  amount *           object (Money)
  status *           string (PaymentStatus)
                     Enum: pending | authorized | captured | settled |
                           failed | refunded | cancelled
  description        string
  customer_id        string
  metadata           object
  created_at *       string (date-time) 2024-06-01T10:30:00Z
  updated_at *       string (date-time)

400 Bad Request
  Validation error.
  Schema: Error

  code *             string             invalid_payment_method
  message *          string             The provided payment method token is...
  details            array
  request_id         string (uuid)

401 Unauthorized
  Authentication required.

422 Unprocessable Entity
  Insufficient funds or payment method declined.
```

---

## Code panel — `POST /payments`

The right panel shows auto-generated request examples. Each tab generates a complete, runnable sample.

### curl tab

```bash
curl -X POST https://api.vaultpay.io/v2/payments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": {
      "amount": 10000,
      "currency": "USD"
    },
    "payment_method": {
      "type": "card",
      "token": "tok_example"
    },
    "description": "Subscription renewal - Pro plan",
    "customer_id": "cus_abc123",
    "idempotency_key": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### Python tab

```python
import requests

response = requests.post(
    "https://api.vaultpay.io/v2/payments",
    headers={"Authorization": "Bearer YOUR_TOKEN"},
    json={
        "amount": {"amount": 10000, "currency": "USD"},
        "payment_method": {"type": "card", "token": "tok_example"},
        "description": "Subscription renewal - Pro plan",
        "customer_id": "cus_abc123",
        "idempotency_key": "550e8400-e29b-41d4-a716-446655440000",
    },
)
print(response.json())
```

### JavaScript tab

```javascript
const response = await fetch("https://api.vaultpay.io/v2/payments", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_TOKEN",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    amount: { amount: 10000, currency: "USD" },
    payment_method: { type: "card", token: "tok_example" },
    description: "Subscription renewal - Pro plan",
    customer_id: "cus_abc123",
    idempotency_key: "550e8400-e29b-41d4-a716-446655440000",
  }),
});
const payment = await response.json();
```

All samples use the correct HTTP method, the spec's server URL, and realistic values drawn from the schema's `example` fields or enum values. The `Authorization` header is pre-populated with a placeholder that users replace with their actual token.

---

## Server selector

Above the code panel, a server dropdown lets you switch between the spec's declared servers:

```
Server: [Production ▼]
  ● Production   https://api.vaultpay.io/v2
  ○ Sandbox      https://sandbox.vaultpay.io/v2
```

Switching servers updates the URL in all code samples and in the Try It console immediately — without reloading the page.

---

## Try It console — `GET /payments/{id}`

For the **Get payment** endpoint (`GET /payments/{id}`), the Try It console renders:

```
┌─────────────────────────────────────────────────────┐
│  Try It                                             │
│                                                     │
│  Server   [Production ▼]                           │
│                                                     │
│  Path parameters                                    │
│  id *     [____________________________]            │
│           string (uuid) — Payment identifier       │
│                                                     │
│  Auth                                               │
│  Bearer token  [sk_live_________________]          │
│                                                     │
│  [  Send Request  ]                                 │
└─────────────────────────────────────────────────────┘
```

After a request is sent, the response section shows:

```
HTTP 200  application/json  112ms

{
  "id": "pay_550e8400-e29b-41d4-a716-446655440000",
  "amount": {
    "amount": 10000,
    "currency": "USD"
  },
  "status": "settled",
  "description": "Subscription renewal - Pro plan",
  "created_at": "2024-06-01T10:30:00Z",
  "updated_at": "2024-06-01T10:31:00Z"
}
```

---

## Search

Pressing `/` or selecting the search icon opens the search modal:

```
┌────────────────────────────────────────────┐
│  🔍  Search endpoints...                   │
├────────────────────────────────────────────┤
│  payments                                  │  ← user typed this
├────────────────────────────────────────────┤
│  POST  /payments          Create a payment │
│  GET   /payments          List payments    │
│  GET   /payments/{id}     Get payment      │
│  POST  /payments/{id}/... Capture payment  │
└────────────────────────────────────────────┘
```

Search is full-text across endpoint summaries, descriptions, tag names, and parameter names. Results appear as you type.

---

## What produces what

The table below maps spec fields to portal output — useful when you are writing or editing a spec and want to know where each field appears.

| Spec field | Appears in |
|---|---|
| `info.title` | Portal browser tab title |
| `info.description` | Not currently displayed in the portal header (roadmap item) |
| `tags[*].description` | Tag section header in the nav and in the content panel |
| `operation.summary` | Endpoint title in the content panel and nav tooltip |
| `operation.description` | Description body in the content panel |
| `operation.x-compliance` | Compliance callout box in the content panel |
| `operation.parameters` | Parameters table in the content panel |
| `operation.requestBody` | Request body schema tree in the content panel |
| `operation.responses` | Responses section with status codes and schemas |
| `components.schemas.*` | Resolved inline wherever `$ref` points to a schema |
| `components.securitySchemes.*` | Auth panel in the Try It console |
| `servers[*]` | Server selector above the code panel |
| `operation.tags` | Determines which nav group an endpoint belongs to |
| `operation.deprecated: true` | Deprecated badge on the endpoint in the nav and content panel |

---

*This document follows Microsoft Writing Style Guide conventions.*
