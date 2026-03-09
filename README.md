# SpecFlow

**Drop an OpenAPI spec. Get a Stripe-quality developer portal.**

SpecFlow converts any OpenAPI 3.x specification into a fully interactive, three-panel developer portal — directly in the browser. No build step. No server. No configuration file.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-sulagnasasmal.github.io%2Fspecflow-6366f1?style=flat-square&logo=githubpages&logoColor=white)](https://sulagnasasmal.github.io/specflow/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)

---

## What it does

You provide an OpenAPI 3.x spec — by file upload, URL, or paste. SpecFlow parses it and immediately renders:

- **Navigation panel** — tag-grouped endpoint tree with method badges and search
- **Content panel** — endpoint documentation with parameter tables, request body schemas, and response schemas
- **Code panel** — auto-generated code samples in curl, Python, JavaScript, and Go; copy-to-clipboard on every block

Additional features included out of the box:

| Feature | Description |
|---|---|
| **Try It console** | Send live requests from the browser — set auth headers, fill parameters, and inspect the response |
| **Schema tree** | Recursive schema visualization with `$ref` resolution; expands inline or collapses to summary |
| **Compliance annotations** | Renders `x-compliance` OpenAPI extensions as structured compliance callouts alongside endpoint docs |
| **Webhook documentation** | Dedicated webhook panel, auto-populated from `webhooks` objects in the spec |
| **Search** | Full-text search across endpoint summaries, descriptions, and parameter names |
| **Dark / light theme** | System preference detected on load; toggled manually at any time |
| **Static export** | `npm run build` produces a fully static site ready for GitHub Pages, Netlify, or S3 |

---

## Quickstart

Open [sulagnasasmal.github.io/specflow](https://sulagnasasmal.github.io/specflow/) and try the built-in example in under a minute:

1. Select **Try the VaultPay example** on the home page.
2. Explore the generated portal: browse endpoints in the left nav, inspect schemas in the center panel, copy code samples from the right panel.
3. Open the Try It console on any endpoint and send a test request.

To use your own spec, select **Upload**, **Paste**, or **URL** and provide your OpenAPI 3.x file.

For a step-by-step walkthrough, see [docs/quickstart.md](docs/quickstart.md).

---

## Run locally

```bash
# Clone the repository
git clone https://github.com/SulagnaSasmal/specflow.git
cd specflow

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dev server hot-reloads on changes to `src/`.

### Build for production

```bash
npm run build
```

Output goes to `out/` as a fully static site (no server required). Deploy to any static host.

---

## Input formats

SpecFlow accepts OpenAPI 3.0.x and 3.1.x specifications in both YAML and JSON. OpenAPI 2.x (Swagger) is not supported.

| Input method | How to use |
|---|---|
| File upload | Drag and drop, or click to select. Any `.yaml`, `.yml`, or `.json` file. |
| Paste | Switch to the **Paste** tab and paste the spec text directly. |
| URL | Switch to the **URL** tab and enter a publicly accessible URL to a raw spec file. |

If the spec has validation errors (missing required fields, invalid `$ref` paths), SpecFlow renders the valid portions and surfaces the errors in the portal header. Partial specs work.

---

## Project structure

```
src/
  app/              # Next.js app router — home page and /docs route
  components/
    endpoint/       # Endpoint documentation: parameters, request body, responses
    layout/         # Three-panel shell: NavPanel, ContentPanel, CodePanel
    try-it/         # Live request console: auth, parameter inputs, response display
    schema/         # Recursive schema tree renderer
    search/         # Search modal and index
    ui/             # Shared UI: MethodBadge, CopyButton, ThemeToggle
  generator/
    code-samples.ts # Generates curl, Python, JavaScript, Go samples from parsed operations
  lib/
    spec-context.tsx  # React context — loads, parses, and distributes spec data
    request-executor.ts # Executes Try It requests via the browser Fetch API
  parser/
    index.ts        # OpenAPI spec parser: YAML/JSON → internal ParsedSpec type
  search/
    index.ts        # Search index builder and query handler
  types/
    openapi.ts      # Core type definitions: ParsedSpec, ParsedOperation, ParsedTag
    try-it.ts       # Try It console state types
```

---

## Example output

The [VaultPay API](examples/vaultpay.yaml) example spec ships with the repository. It models a fintech payment API with authentication, transfer endpoints, webhook definitions, compliance annotations, and structured error responses. Load it to see a representative portal.

Sample output screenshot and field-level description: [docs/sample-output.md](docs/sample-output.md).

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, static export) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Spec parsing | `swagger-parser` + `js-yaml` |
| Code generation | Custom generator in `src/generator/code-samples.ts` |
| Deployment | GitHub Pages (static export) |

---

## Contributing

Issues and pull requests are welcome. Before opening a PR:

1. Run `npm run build` to confirm there are no TypeScript or build errors.
2. Test with at least the VaultPay example spec and one additional spec of your own.
3. Keep code samples syntactically correct — they are the primary output users see.

---

## License

MIT — see [LICENSE](LICENSE).

---

*Built by [Sulagna Sasmal](https://github.com/SulagnaSasmal) — Senior Technical Writer and Documentation Architect.*
