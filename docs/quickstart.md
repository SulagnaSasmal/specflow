# SpecFlow Quickstart

**Time to complete:** 10 minutes  
**What you accomplish:** Load an OpenAPI spec and get a working interactive developer portal.

---

## Before you start

You need:

- A modern browser (Chrome, Firefox, Safari, or Edge — any version from the past two years)
- An OpenAPI 3.x specification in YAML or JSON format

That's it. SpecFlow runs entirely in the browser — no account, no installation, no API key.

---

## Option A: Try the live tool immediately

The fastest path is the hosted version at [sulagnasasmal.github.io/specflow](https://sulagnasasmal.github.io/specflow/). Skip ahead to [Step 2](#step-2-load-a-spec) and use the VaultPay example.

---

## Option B: Run locally

Clone the repo and start the dev server:

```bash
git clone https://github.com/SulagnaSasmal/specflow.git
cd specflow
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The home page loads with three input methods and a **Try the VaultPay example** button.

Development server startup takes about 5 seconds on first run (Next.js compiles on demand).

---

## Step 1: Understand the home page

The home page has three input tabs:

| Tab | Use when |
|---|---|
| **Upload** | You have a spec file on disk (`.yaml`, `.yml`, or `.json`) |
| **Paste** | You want to paste spec text directly — useful during development or when iterating on a draft |
| **URL** | Your spec is publicly accessible — for example, a raw GitHub URL or a live `/openapi.json` endpoint |

There is also a **Try the VaultPay example** button that loads a built-in fintech payment API spec. Use it now if you want to see a fully populated portal immediately.

---

## Step 2: Load a spec

### Load the VaultPay example

Select **Try the VaultPay example**. SpecFlow parses the spec and redirects you to `/docs` automatically. The portal loads in under 1 second.

### Load your own spec

**Upload:**
1. Select the **Upload** tab.
2. Drag your spec file onto the drop zone, or click **Choose file**.
3. SpecFlow parses the file and redirects to `/docs`.

**Paste:**
1. Select the **Paste** tab.
2. Paste the raw spec text (YAML or JSON) into the text area.
3. Select **Generate Portal**.

**URL:**
1. Select the **URL** tab.
2. Enter the URL. For a GitHub file, use the raw URL: `https://raw.githubusercontent.com/owner/repo/main/openapi.yaml`
3. Select **Generate Portal**.

> **Note:** If the URL is on a different domain, the host must return a permissive `Access-Control-Allow-Origin` header. Use the Paste method with a copied YAML if CORS blocks the URL request.

---

## Step 3: Explore the portal

The portal has three panels:

### Left panel — Navigation

The left panel lists all tags (groups) and their endpoints. Each endpoint shows:

- A colored method badge (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`)
- The endpoint path
- The summary from the spec

Select any endpoint to open it in the center panel. Use the search icon (or press `/`) to filter endpoints by name or path.

### Center panel — Endpoint documentation

The center panel shows the full documentation for the selected endpoint:

- **Summary and description** — from the spec's `summary` and `description` fields
- **Parameters** — path, query, header, and cookie parameters with their types, requirements, and descriptions
- **Request body** — schema, content type, and whether it is required; required fields are marked
- **Responses** — each status code with its description and response schema
- **Compliance annotations** — if the spec includes `x-compliance` extensions on an endpoint, they appear as callout boxes here

Expand any schema field to see its type, format, constraints, and nested properties.

### Right panel — Code samples

The right panel shows auto-generated request examples for the selected endpoint in four languages: `curl`, `Python`, `JavaScript`, and `Go`. Select any tab to switch languages. The **Copy** button copies the current sample to the clipboard.

Code samples include:

- The full URL with path parameters substituted for realistic placeholder values
- Any required query parameters
- The `Authorization` header with a placeholder token
- A JSON request body for `POST`, `PUT`, and `PATCH` endpoints

---

## Step 4: Use the Try It console

The Try It console lets you send actual requests to the API from the browser.

1. Select any endpoint.
2. In the right panel, look for the **Try It** section below the code sample.
3. Fill in the required parameters — required fields are marked with a red asterisk.
4. Under **Auth**, enter your API key or bearer token.
5. Select **Send Request**.

The response appears below the button: HTTP status code, response headers, and the response body in a formatted JSON viewer.

> **Tip:** If the API you are documenting is CORS-restricted, the Try It console cannot reach it from the browser. Use the generated code samples to run requests from your terminal instead.

---

## Step 5: Test with a minimal spec

If you are evaluating SpecFlow for your own API, here is a minimal spec that exercises the main features. Paste it into the **Paste** tab:

```yaml
openapi: "3.0.3"
info:
  title: Bookstore API
  version: "1.0.0"
  description: A simple API for managing a bookstore inventory.
servers:
  - url: https://api.mybookstore.io/v1
tags:
  - name: Books
    description: Book inventory management
paths:
  /books:
    get:
      tags: [Books]
      summary: List all books
      description: Returns a paginated list of books in the inventory.
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
      responses:
        "200":
          description: A list of books
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/Book"
                  total:
                    type: integer
    post:
      tags: [Books]
      summary: Add a book
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/BookInput"
      responses:
        "201":
          description: Book created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Book"
        "400":
          description: Validation error
  /books/{id}:
    get:
      tags: [Books]
      summary: Get a book by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        "200":
          description: The book
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Book"
        "404":
          description: Book not found
components:
  schemas:
    Book:
      type: object
      properties:
        id:
          type: string
          example: bk_01HX7K2V
        title:
          type: string
          example: The Pragmatic Programmer
        author:
          type: string
          example: David Thomas
        isbn:
          type: string
          example: "978-0-13-595705-9"
        in_stock:
          type: boolean
    BookInput:
      type: object
      required: [title, author, isbn]
      properties:
        title:
          type: string
        author:
          type: string
        isbn:
          type: string
```

SpecFlow renders this as a two-endpoint portal with schema visualization, code samples, and a Try It console targeting `api.mybookstore.io`. You can see exactly what a hiring manager or API consumer sees from your own spec.

---

## Build a static site for deployment

To export a static version of the portal that you can host anywhere:

```bash
npm run build
```

The output in `out/` is a fully self-contained static site. No Node.js server is required at deploy time.

**Deploy to GitHub Pages:**

```bash
# In your repo settings, set GitHub Pages source to the gh-pages branch or /docs folder.
# Then copy the out/ contents to your target location and push.
cp -r out/* docs/
git add docs/
git commit -m "Deploy SpecFlow static export"
git push
```

**Deploy to Netlify or Vercel:** Drag and drop the `out/` folder into the Netlify deploy UI, or connect the repository to Vercel — it detects Next.js automatically.

---

## What to do if something looks wrong

| Issue | Likely cause | What to do |
|---|---|---|
| Portal shows "No endpoints found" | The spec uses OpenAPI 2.x (Swagger) format | Convert to OpenAPI 3.x using [Swagger2OpenAPI](https://github.com/Mermade/oas-kit) |
| Schema shows `[object Object]` instead of properties | Circular `$ref` that `swagger-parser` cannot fully dereference | Break the circular reference in your spec |
| Try It requests fail with a network error | The target server blocks cross-origin requests | Use the generated code sample in curl or Python instead |
| Validation errors appear in the portal header | Required fields are missing (e.g., `info.title`, `openapi` version) | Check the error messages and add the missing fields |

---

## Next steps

- [Sample output](sample-output.md) — Annotated screenshots of a fully populated VaultPay portal
- [VaultPay spec](../examples/vaultpay.yaml) — The full example spec; study it to understand which spec features produce which portal elements
- [GitHub repository](https://github.com/SulagnaSasmal/specflow) — Source code, issues, and contribution guide

---

*This document follows Microsoft Writing Style Guide conventions.*
