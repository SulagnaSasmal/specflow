# SpecFlow Phase 1 — Test Cases

## How to Use This Document

Each test case targets a specific Phase 1 feature. Use the VaultPay spec (`vaultpay-openapi.yaml`) as your primary test input. Where a test requires a different spec structure, a minimal YAML snippet is provided inline.

---

## 1. OpenAPI Parser & Validator

### TC-1.1: Valid spec loads successfully
**Input:** `vaultpay-openapi.yaml`
**Expected:** Parser loads without errors. Console/UI shows: title ("VaultPay Payment API"), version ("2.1.0"), server count (2), path count (13 operations across 7 tags).

### TC-1.2: $ref resolution — component schemas
**Input:** `vaultpay-openapi.yaml`
**Expected:** `CreateChargeRequest.ach_details` resolves to the full `ACHDetails` schema with properties: `sec_code`, `entry_description`, `effective_date`, `batch_mode`. No `$ref` tokens appear in the rendered output.

### TC-1.3: $ref resolution — nested refs
**Input:** `vaultpay-openapi.yaml`
**Expected:** `Customer.address` resolves to `Address` schema. `Customer.payment_methods[].card` resolves to `CardSummary`. Three levels deep: `Charge.refunds[].charge_id` is reachable.

### TC-1.4: $ref resolution — shared responses
**Input:** `vaultpay-openapi.yaml`
**Expected:** `$ref: "#/components/responses/Unauthorized"` used in `/auth/token`, `/charges POST`, renders identically in both endpoint docs with the same error example.

### TC-1.5: $ref resolution — shared parameters
**Input:** `vaultpay-openapi.yaml`
**Expected:** `IdempotencyKey` parameter renders on both `POST /charges` and `POST /refunds`. `ChargeId` parameter renders on `GET /charges/{charge_id}`, `POST /charges/{charge_id}/capture`, `POST /charges/{charge_id}/cancel`.

### TC-1.6: Invalid spec — missing required field
**Input (inline):**
```yaml
openapi: 3.1.0
info:
  title: Broken Spec
paths:
  /test:
    get:
      responses:
        "200":
          description: ok
```
**Expected:** Validation error: `info.version` is required. Parser shows clear error message with location.

### TC-1.7: Invalid spec — bad $ref target
**Input (inline):**
```yaml
openapi: 3.1.0
info:
  title: Bad Ref
  version: 1.0.0
paths:
  /test:
    get:
      responses:
        "200":
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/NonExistent"
```
**Expected:** Parser reports unresolvable `$ref` at `/paths/~1test/get/responses/200/content/application~1json/schema/$ref`. Does not crash. Shows which ref is broken.

### TC-1.8: Spec with no tags
**Input (inline):**
```yaml
openapi: 3.1.0
info:
  title: No Tags API
  version: 1.0.0
paths:
  /users:
    get:
      summary: List users
      responses:
        "200":
          description: ok
  /users/{id}:
    get:
      summary: Get user
      responses:
        "200":
          description: ok
```
**Expected:** Navigation groups endpoints under "Default" or by path prefix (`/users`). Does not crash or show empty nav.

### TC-1.9: YAML vs JSON input
**Input:** Same spec saved as `.yaml` and `.json`
**Expected:** Both produce identical output. Parser auto-detects format.

### TC-1.10: Large spec — Petstore extended
**Input:** Official OpenAPI Petstore spec (publicly available)
**Expected:** Parses and renders without errors. Serves as a cross-compatibility check against a well-known spec.

---

## 2. Three-Panel Layout

### TC-2.1: Left panel — navigation structure
**Input:** `vaultpay-openapi.yaml`
**Expected:** Navigation shows 7 groups matching tags: Authentication, Charges, Refunds, Customers, Webhooks, Payment Methods, Disputes. Each group is collapsible.

### TC-2.2: Left panel — endpoint listing
**Input:** `vaultpay-openapi.yaml`
**Expected:** Under "Charges" tag, shows:
- `POST /charges` — with green POST badge
- `GET /charges` — with blue GET badge
- `GET /charges/{charge_id}` — blue GET badge
- `POST /charges/{charge_id}/capture` — green POST badge
- `POST /charges/{charge_id}/cancel` — green POST badge

### TC-2.3: Left panel — HTTP method color coding
**Expected:** `GET` = blue, `POST` = green, `PUT` = orange, `PATCH` = yellow/teal, `DELETE` = red. Verify with `DELETE /customers/{customer_id}` showing red badge.

### TC-2.4: Left panel — deprecated endpoint indication
**Input:** `vaultpay-openapi.yaml`
**Expected:** `DELETE /customers/{customer_id}` shows strikethrough or a "deprecated" label. Visually distinct from active endpoints.

### TC-2.5: Center panel — endpoint documentation
**Input:** Click `POST /charges`
**Expected:** Shows:
- Operation summary: "Create a charge"
- Full description (multi-paragraph, with markdown rendered)
- `x-compliance` badges (PCI-DSS-4.0, PSD2-SCA)
- Parameters table: `Idempotency-Key` header
- Request body schema (expandable)
- Response codes: 201, 400, 401, 402, 409, 422, 429

### TC-2.6: Center panel — multiple request examples
**Input:** `POST /charges` has 3 examples: `card_charge`, `ach_charge`, `rtp_charge`
**Expected:** Example selector (tabs or dropdown) lets user switch between all three. Each shows the correct JSON body.

### TC-2.7: Center panel — response headers
**Input:** `POST /charges` 201 response defines `X-Request-Id` and `X-RateLimit-Remaining` headers
**Expected:** Response section shows headers with names, types, and descriptions.

### TC-2.8: Center panel — deprecated endpoint warning
**Input:** Click `DELETE /customers/{customer_id}`
**Expected:** Shows deprecation notice prominently: "Deprecated. Use POST /customers/{customer_id}/archive instead." Visual warning (amber/yellow banner or strikethrough).

### TC-2.9: Center panel — markdown rendering in descriptions
**Input:** `vaultpay-openapi.yaml` — info.description contains markdown (headers, lists, code blocks)
**Expected:** Markdown renders correctly: numbered list, inline code (`https://sandbox.vaultpay.io/v2`), headers (## Getting Started). No raw markdown visible.

### TC-2.10: Right panel — code samples present
**Input:** Click `POST /charges`
**Expected:** Right panel shows auto-generated code samples. At minimum: curl, Python, JavaScript. All three use the correct URL, method, headers, and a sample request body.

### TC-2.11: Layout — responsive behavior
**Input:** Resize browser to < 768px width
**Expected:** Layout adapts. Options: left nav collapses to hamburger menu, or layout stacks vertically. Code panel may move below content. Nothing overflows or breaks.

### TC-2.12: Layout — sticky navigation
**Input:** Scroll through a long endpoint (e.g., `POST /charges`)
**Expected:** Left navigation stays visible (sticky position). Current endpoint is highlighted in the nav.

---

## 3. Schema Visualization

### TC-3.1: Simple object schema
**Input:** `Address` schema
**Expected:** Shows expandable tree with 6 properties: `line1`, `line2`, `city`, `state`, `postal_code`, `country`. Each shows type (`string`) and description.

### TC-3.2: Required fields marked
**Input:** `CreateChargeRequest` schema
**Expected:** `amount`, `currency`, `payment_method_id` are visually marked as required (red asterisk, "required" badge, or bold). Optional fields like `description`, `metadata` are not marked.

### TC-3.3: Nested $ref schemas expand
**Input:** `CreateChargeRequest` schema
**Expected:** `ach_details` expands to show `ACHDetails` properties. `three_d_secure` expands to show `ThreeDSecureRequest` properties. Expansion is interactive (click to toggle).

### TC-3.4: Deeply nested schemas
**Input:** `Charge` schema → `refunds` → array items → `Refund` schema
**Expected:** User can expand: `Charge` → `refunds (array)` → item → sees `Refund` properties (`id`, `charge_id`, `amount`, `status`, etc.). Three levels of nesting rendered correctly.

### TC-3.5: Enum values displayed
**Input:** `CreateChargeRequest.currency`
**Expected:** Shows: `enum: USD, EUR, GBP, CAD, AUD, JPY, CHF, SGD` — as inline badges or a list. Enum values are copy-friendly.

### TC-3.6: oneOf schema rendering
**Input:** `Charge.failure_reason` uses `oneOf` with three variants: `CardFailure`, `ACHFailure`, `NetworkFailure`
**Expected:** Shows tabbed or labeled variants. User can switch between the three options. Each shows its own properties. `const` values (`type: card`, `type: ach`, `type: network`) are displayed as discriminators.

### TC-3.7: Array type rendering
**Input:** `Charge.refunds` — array of `Refund`
**Expected:** Shows `refunds: array of Refund` (or similar notation). Expandable to see `Refund` properties.

### TC-3.8: additionalProperties (free-form object)
**Input:** `CreateChargeRequest.metadata` — `additionalProperties: { type: string }`
**Expected:** Shows `metadata: object` with note indicating string key-value pairs. Shows constraints: `maxProperties: 20`.

### TC-3.9: Format annotations
**Input:** Various fields across schemas
**Expected:**
- `email` fields show `string · email`
- `created_at` fields show `string · date-time`
- `url` fields show `string · uri`
- `client_secret` shows `string · password`

### TC-3.10: Constraints displayed
**Input:** `CreateChargeRequest.amount` — `minimum: 1`, `maximum: 99999999`
**Expected:** Shows constraints: `min: 1, max: 99999999` near the field type.

### TC-3.11: Pattern constraint
**Input:** `ACHBankAccount.routing_number` — `pattern: "^\\d{9}$"`
**Expected:** Shows pattern constraint. Rendered in a readable way (e.g., "Pattern: 9 digits").

---

## 4. Code Sample Generation

### TC-4.1: curl — POST with JSON body
**Input:** `POST /charges`
**Expected:**
```bash
curl -X POST https://api.vaultpay.io/v2/charges \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{
    "amount": 5000,
    "currency": "USD",
    "payment_method_id": "pm_card_4242424242424242",
    "customer_id": "cus_9f8a7b6c",
    "description": "Annual subscription renewal"
  }'
```
Verify: correct URL, method, auth header, content-type, idempotency key from parameters, body from first example.

### TC-4.2: curl — GET with query parameters
**Input:** `GET /charges`
**Expected:**
```bash
curl "https://api.vaultpay.io/v2/charges?limit=20&status=succeeded" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
Verify: query params in URL, no body, no Content-Type header.

### TC-4.3: curl — path parameters substituted
**Input:** `GET /charges/{charge_id}`
**Expected:** URL shows `https://api.vaultpay.io/v2/charges/ch_1a2b3c4d5e6f` (using the example value from the parameter spec).

### TC-4.4: curl — form-urlencoded body
**Input:** `POST /auth/token`
**Expected:** Uses `-d "grant_type=client_credentials&client_id=..."` format, NOT JSON. Content-Type is `application/x-www-form-urlencoded`.

### TC-4.5: Python (requests) — POST
**Input:** `POST /charges`
**Expected:**
```python
import requests

url = "https://api.vaultpay.io/v2/charges"
headers = {
    "Authorization": "Bearer YOUR_ACCESS_TOKEN",
    "Idempotency-Key": "550e8400-e29b-41d4-a716-446655440000"
}
payload = {
    "amount": 5000,
    "currency": "USD",
    "payment_method_id": "pm_card_4242424242424242"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())
```

### TC-4.6: JavaScript (fetch) — POST
**Input:** `POST /charges`
**Expected:**
```javascript
const response = await fetch("https://api.vaultpay.io/v2/charges", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_ACCESS_TOKEN",
    "Content-Type": "application/json",
    "Idempotency-Key": "550e8400-e29b-41d4-a716-446655440000"
  },
  body: JSON.stringify({
    amount: 5000,
    currency: "USD",
    payment_method_id: "pm_card_4242424242424242"
  })
});
const data = await response.json();
```

### TC-4.7: Language switcher
**Input:** Click between curl / Python / JavaScript tabs on any endpoint
**Expected:** Code switches instantly. Selected language persists when navigating to a different endpoint.

### TC-4.8: Copy to clipboard
**Input:** Click copy button on any code sample
**Expected:** Full code block copied to clipboard. Visual feedback (checkmark or "Copied!" tooltip).

### TC-4.9: Auth header — Bearer vs API Key
**Input:** Spec defines two security schemes: `BearerAuth` and `ApiKeyAuth`
**Expected:** Code samples default to Bearer. If user switches auth mode (if UI supports it), curl shows `-H "X-API-Key: YOUR_API_KEY"` instead.

### TC-4.10: No auth on public endpoint
**Input:** `POST /auth/token` has `security: []`
**Expected:** Code samples do NOT include any Authorization header. No Bearer token, no API key.

---

## 5. Dark/Light Mode

### TC-5.1: System preference detection
**Input:** OS set to dark mode
**Expected:** Portal loads in dark mode automatically.

### TC-5.2: Manual toggle
**Input:** Click dark/light toggle
**Expected:** Entire portal switches themes. All panels, code blocks, tables, badges update.

### TC-5.3: Persistence
**Input:** Toggle to dark mode, refresh page
**Expected:** Portal loads in dark mode (stored in localStorage).

### TC-5.4: Code block theming
**Input:** View code samples in dark mode
**Expected:** Syntax highlighting uses a dark theme (e.g., One Dark, Dracula). Strings, keywords, numbers visually distinct.

### TC-5.5: Schema tree in dark mode
**Input:** Expand `CreateChargeRequest` schema in dark mode
**Expected:** Tree lines, type badges, required indicators all readable. No contrast issues.

---

## 6. Client-Side Search

### TC-6.1: Search by endpoint path
**Input:** Type `/refunds` in search
**Expected:** Results include `POST /refunds` and any refund-related content.

### TC-6.2: Search by operation summary
**Input:** Type "capture"
**Expected:** Results include `POST /charges/{charge_id}/capture` — "Capture an authorized charge."

### TC-6.3: Search by description content
**Input:** Type "idempotency"
**Expected:** Results include `POST /charges` (description mentions idempotency) and the `Idempotency-Key` parameter.

### TC-6.4: Search by schema/parameter name
**Input:** Type "sec_code"
**Expected:** Results include `ACHDetails` schema or the `POST /charges` endpoint where it appears.

### TC-6.5: Fuzzy matching
**Input:** Type "refnd" (typo)
**Expected:** Still returns refund-related results (fuzzy match via Fuse.js).

### TC-6.6: Keyboard shortcut
**Input:** Press `Cmd+K` (Mac) or `Ctrl+K` (Windows)
**Expected:** Search modal opens with cursor in the input field. Press `Esc` to close.

### TC-6.7: Results navigation
**Input:** Search "charge", use arrow keys
**Expected:** Arrow keys navigate results. Enter key navigates to the selected endpoint.

### TC-6.8: No results
**Input:** Type "xyznonexistent"
**Expected:** Shows "No results found" message. Does not crash or show empty list silently.

### TC-6.9: Results grouped by tag
**Input:** Type "create"
**Expected:** Results grouped by tag: Charges ("Create a charge"), Refunds ("Create a refund"), Customers ("Create a customer"), etc.

---

## 7. Edge Cases & Stress Tests

### TC-7.1: Endpoint with no description
**Input (inline):**
```yaml
paths:
  /health:
    get:
      summary: Health check
      responses:
        "200":
          description: OK
```
**Expected:** Renders cleanly with just the summary. No empty description area or "undefined" text.

### TC-7.2: Schema with no properties
**Input (inline):**
```yaml
components:
  schemas:
    EmptyObject:
      type: object
```
**Expected:** Shows "object" with no expandable properties. No crash.

### TC-7.3: Deeply nested oneOf inside array inside object
**Input:** `Charge.failure_reason` (oneOf) is inside `Charge` which is inside `ChargeList.data[]`
**Expected:** Full nesting renders: `ChargeList` → `data[]` → `Charge` → `failure_reason` → oneOf tabs. All expandable.

### TC-7.4: Circular $ref (if encountered)
**Input (inline):**
```yaml
components:
  schemas:
    TreeNode:
      type: object
      properties:
        value:
          type: string
        children:
          type: array
          items:
            $ref: "#/components/schemas/TreeNode"
```
**Expected:** Renders first level with a "TreeNode" reference link for children. Does NOT infinite-loop. Shows a max depth indicator or "$ref: TreeNode" link.

### TC-7.5: Very long enum list
**Input (inline):**
```yaml
currency:
  type: string
  enum: [USD, EUR, GBP, CAD, AUD, JPY, CHF, SGD, HKD, NZD, SEK, DKK, NOK, MXN, BRL, PLN, CZK, HUF, RON, BGN, HRK, TRY, ZAR, INR, IDR, MYR, PHP, THB, VND, KRW, TWD, AED, SAR, QAR, KWD, BHD, OMR, ILS, EGP, NGN, KES, GHS, TZS, UGX, RWF, COP, CLP, PEN, ARS]
```
**Expected:** Enum list doesn't break layout. Wraps or shows in a scrollable/expandable container.

### TC-7.6: Multiple servers
**Input:** `vaultpay-openapi.yaml` has 2 servers (Production + Sandbox)
**Expected:** Server selector dropdown in the portal. Code samples update URLs when server is switched.

### TC-7.7: Spec with webhooks (OAS 3.1)
**Input:** `vaultpay-openapi.yaml` has `webhooks` section with `charge.succeeded` and `dispute.created`
**Expected:** Webhooks appear in a separate navigation section. Each webhook shows its payload schema. Not mixed in with regular endpoints.

### TC-7.8: Empty tags array
**Input:** An endpoint with `tags: []`
**Expected:** Endpoint appears in an "Other" or "Untagged" navigation group.

### TC-7.9: Operation with all HTTP methods
**Input (inline):**
```yaml
paths:
  /resources/{id}:
    get:
      summary: Get resource
      responses: { "200": { description: ok } }
    put:
      summary: Replace resource
      responses: { "200": { description: ok } }
    patch:
      summary: Update resource
      responses: { "200": { description: ok } }
    delete:
      summary: Delete resource
      responses: { "200": { description: ok } }
    head:
      summary: Check resource
      responses: { "200": { description: ok } }
    options:
      summary: Resource options
      responses: { "200": { description: ok } }
```
**Expected:** All 6 methods render with distinct color badges. Navigation shows all 6 under the same path.

### TC-7.10: Performance — spec with 50+ endpoints
**Input:** Generate or use a large spec with 50+ paths
**Expected:** Portal loads in < 3 seconds. Search is responsive (< 200ms per keystroke). Navigation scroll is smooth.

---

## Test Execution Checklist

| # | Feature | Pass | Fail | Notes |
|---|---------|------|------|-------|
| 1.1–1.10 | Parser & Validator | | | |
| 2.1–2.12 | Three-Panel Layout | | | |
| 3.1–3.11 | Schema Visualization | | | |
| 4.1–4.10 | Code Sample Generation | | | |
| 5.1–5.5 | Dark/Light Mode | | | |
| 6.1–6.9 | Client-Side Search | | | |
| 7.1–7.10 | Edge Cases | | | |

**Total test cases: 67**
