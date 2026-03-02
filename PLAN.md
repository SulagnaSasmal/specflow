# SpecFlow — OpenAPI-to-Developer Portal Generator
## End-to-End Project Plan

---

## Executive Summary

**Project name:** SpecFlow
**Tagline:** Drop an OpenAPI spec. Get a Stripe-quality developer portal.
**What it is:** A tool that takes a raw OpenAPI 3.1 specification file and generates a fully styled, interactive, three-panel developer documentation portal — with a try-it-out console, multi-language code samples, compliance annotations, and one-click deployment to GitHub Pages.

**Why this project:**
Every major API docs platform (Redocly, Scalar, ReadMe, Stoplight, Mintlify) solves this problem as SaaS. None of them are open-source, free, and built by a technical writer who understands both the tooling AND the content architecture. SpecFlow fills that gap — and positions you uniquely at the intersection of documentation engineering, Docs-as-Code, and developer experience.

**What makes it best-in-class:**
- Three-panel Stripe/Redocly-style layout (navigation → content → code)
- Live "Try It" API console embedded in each endpoint
- Auto-generated code samples in 5+ languages from OpenAPI
- Compliance annotation layer (your FinTech differentiator — no other tool does this)
- AI-powered description enrichment from raw specs
- Static site output — deploys to GitHub Pages with zero infrastructure
- Built by a documentation architect, not a SaaS company

---

## Strategic Positioning

### How SpecFlow fits your career narrative

| Asset | What it proves |
|-------|---------------|
| Your 10 existing doc sites | You write best-in-class documentation |
| DocCraft AI | You can build AI-powered content tools |
| PPT2Video | You can build end-to-end automation pipelines |
| **SpecFlow** | **You can build documentation infrastructure** |

SpecFlow is the capstone project. It says: "I don't just write docs. I build the systems that generate, validate, and publish them." This is the difference between a Senior Technical Writer and a Documentation Architect / Documentation Engineer.

### Competitive differentiation from existing tools

| Tool | Strength | SpecFlow advantage |
|------|----------|-------------------|
| Redocly | Enterprise customization, Git workflows | SpecFlow is free, open-source, zero SaaS lock-in |
| Scalar | Beautiful UI, developer-focused | SpecFlow adds compliance layer + AI enrichment |
| ReadMe | Analytics, developer community | SpecFlow is static (GitHub Pages), no hosting costs |
| Stoplight Elements | Embeddable React component | SpecFlow is a full portal, not just a component |
| Swagger UI | Ubiquitous, well-known | SpecFlow has modern design + three-panel layout |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    INPUT LAYER                          │
│                                                         │
│   OpenAPI 3.1 spec (YAML or JSON)                      │
│   + Optional: style config, compliance rules, branding │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  PROCESSING ENGINE                       │
│                                                         │
│  1. Parser — validates & normalizes the spec            │
│  2. Enricher — AI fills missing descriptions            │
│  3. Code Generator — curl, Python, JS, Go, Java, C#    │
│  4. Compliance Mapper — tags endpoints with regs        │
│  5. Schema Visualizer — builds interactive trees        │
│  6. Search Indexer — generates client-side search index │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   OUTPUT LAYER                          │
│                                                         │
│  Static HTML/CSS/JS site                                │
│  → Three-panel layout (nav / content / code)            │
│  → Try-It console per endpoint                          │
│  → Dark/light mode                                      │
│  → Client-side search (Fuse.js or Lunr)                 │
│  → GitHub Pages-ready (single command deploy)           │
└─────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 14 (App Router) | You already know it from DocCraft. SSG for static export. |
| **Language** | TypeScript | Type safety for OpenAPI parsing. Consistent with DocCraft. |
| **OpenAPI Parser** | `@readme/openapi-parser` or `swagger-parser` | Battle-tested, handles $ref resolution, OAS 3.1 |
| **Styling** | Tailwind CSS | Rapid prototyping, dark mode built-in, responsive |
| **Code Highlighting** | Shiki or Prism.js | Syntax highlighting for code samples |
| **Search** | Fuse.js (client-side fuzzy search) | No server needed — works on static sites |
| **Try-It Console** | Custom fetch wrapper | Builds and sends requests from the browser |
| **AI Enrichment** | OpenAI GPT-4o API | Auto-generates missing descriptions/summaries |
| **Deployment** | GitHub Pages + GitHub Actions | Docs-as-Code — push spec, portal auto-deploys |
| **Hosting** | Vercel (live demo) + GitHub Pages (generated sites) | Free tier covers everything |

---

## Feature Breakdown (Phased)

### Phase 1: Core Portal Generator (Weeks 1–3)
*Goal: Drop a spec file, get a working three-panel documentation site.*

**1.1 OpenAPI Parser & Validator**
- Accept YAML or JSON input (file upload or URL)
- Validate against OpenAPI 3.0 / 3.1 schema
- Resolve all `$ref` references (internal + external)
- Surface validation errors with line numbers and fix suggestions
- Output: normalized, dereferenced JSON object

**1.2 Three-Panel Layout**
- **Left panel:** Collapsible navigation grouped by tags/resource
  - Endpoints listed as `METHOD /path` with color-coded badges
  - Collapsible sections for: Authentication, Endpoints (by tag), Schemas, Webhooks
  - Sticky positioning on scroll
- **Center panel:** Endpoint documentation
  - Operation summary + description
  - Path parameters, query parameters, headers — in styled tables
  - Request body schema with expandable nested objects
  - Response codes (200, 400, 401, 403, 404, 500) with schema + example
  - Deprecation warnings where flagged in spec
- **Right panel:** Code examples
  - Auto-generated from OpenAPI for: curl, Python (requests), JavaScript (fetch), Go, Java (OkHttp), C# (HttpClient)
  - Language switcher tabs
  - Copy-to-clipboard on each block
  - Syntax highlighted (Shiki)

**1.3 Schema Visualization**
- Expandable/collapsible JSON schema trees
- Required fields marked with red asterisk
- Type + format displayed inline (e.g., `string · date-time`)
- Enum values shown as inline badges
- `oneOf` / `anyOf` / `allOf` rendered as tabbed variants

**1.4 Dark/Light Mode**
- System-preference detection + manual toggle
- Persistent via localStorage
- Full coverage (nav, content, code blocks, tables)

**1.5 Client-Side Search**
- Index: endpoint paths, operation IDs, summaries, descriptions, parameter names
- Fuzzy matching with Fuse.js
- Keyboard shortcut: `Cmd/Ctrl + K` to open search modal
- Results grouped by resource/tag

---

### Phase 2: Interactive Features (Weeks 4–5)
*Goal: Make the portal interactive — developers can test endpoints directly.*

**2.1 Try-It Console**
- Embedded in each endpoint's center panel
- Form fields auto-generated from:
  - Path parameters (pre-filled in URL)
  - Query parameters (optional, with defaults)
  - Request headers (including auth)
  - Request body (editable JSON with schema validation)
- "Send Request" button → executes via browser fetch
- Response display: status code, headers, body (syntax highlighted)
- Support for Bearer token, API key, and OAuth 2.0 flows
- CORS proxy option for cross-origin testing
- Request history (last 5 requests per endpoint, stored in session)

**2.2 Authentication Configuration**
- Global auth panel (top of portal)
- Auto-detected from `securitySchemes` in spec
- Supported types:
  - API Key (header, query, cookie)
  - Bearer Token
  - OAuth 2.0 (authorization code, client credentials)
  - HTTP Basic
- Auth tokens persist across endpoints during session
- Visual indicator: "Authenticated" / "Not authenticated" badge

**2.3 Webhook Documentation**
- Separate section for `webhooks` (OAS 3.1)
- Event name, payload schema, example payload
- Signature verification instructions (if `x-webhook-signature` extension present)
- Retry policy display

---

### Phase 3: AI Enrichment & Compliance (Weeks 6–7)
*Goal: Add intelligence — auto-fill gaps, surface compliance context.*
*This is your differentiator. No other tool does this.*

**3.1 AI Description Enrichment**
- Detect endpoints/parameters with missing or thin descriptions
- One-click "Enrich with AI" generates:
  - Endpoint summary (1 sentence)
  - Endpoint description (2–3 sentences, developer-facing)
  - Parameter descriptions
  - Error code explanations
- Uses GPT-4o with a system prompt tuned for API documentation style
- Side-by-side diff view: original → enriched
- Accept/reject per field — non-destructive
- Exports enriched spec back as YAML/JSON (spec improvement loop)

**3.2 Compliance Annotation Layer**
- Custom `x-compliance` OpenAPI extension:
```yaml
paths:
  /payments/initiate:
    post:
      x-compliance:
        regulations:
          - PCI-DSS-4.0
          - PSD2-SCA
          - BSA-AML
        data-classification: restricted
        audit-required: true
        retention-days: 2555
```
- Visual compliance badges on each endpoint
- Compliance summary page: matrix of endpoints × regulations
- Filterable: "Show me all PCI-DSS endpoints"
- Regulation tooltip with brief description + link to source
- Pre-built regulation profiles:
  - FinTech: PCI DSS, PSD2/SCA, BSA/AML, OFAC, FATF, SOX
  - Healthcare: HIPAA, HITECH
  - General: GDPR, SOC 2, ISO 27001

**3.3 Spec Quality Score**
- Analyze the OpenAPI spec for completeness:
  - % of endpoints with descriptions
  - % of parameters with descriptions
  - % of responses with examples
  - Schema coverage (required fields, enums defined)
  - Security scheme defined (yes/no)
- Output: score card (e.g., "78/100 — Good") with specific improvement suggestions
- Exportable as Markdown report

---

### Phase 4: Deployment & CI/CD (Week 8)
*Goal: One command to go from spec to live portal on GitHub Pages.*

**4.1 Static Site Export**
- `npx specflow build --spec openapi.yaml --out ./docs`
- Outputs: static HTML/CSS/JS folder
- Zero runtime dependencies — pure static assets
- Optimized: minified, tree-shaken, image-optimized

**4.2 GitHub Actions Workflow**
- Auto-generated `.github/workflows/docs.yml`:
```yaml
name: Deploy API Docs
on:
  push:
    paths: ['openapi.yaml']
jobs:
  build-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npx specflow build --spec openapi.yaml --out ./docs
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```
- Push your spec → portal auto-deploys
- Optional: Vale linting step for description quality

**4.3 Configuration File**
- `specflow.config.yaml`:
```yaml
title: "VaultPay API Documentation"
version: "2.1.0"
logo: "./assets/logo.svg"
favicon: "./assets/favicon.ico"
theme:
  primary-color: "#0A66C2"
  font-heading: "Plus Jakarta Sans"
  font-body: "Inter"
  font-code: "JetBrains Mono"
  mode: "system"    # system | light | dark
compliance:
  enabled: true
  profiles: [pci-dss, psd2, bsa-aml]
ai-enrichment:
  enabled: false    # opt-in
  model: "gpt-4o"
navigation:
  group-by: "tags"  # tags | paths
  sort: "alpha"     # alpha | spec-order
code-samples:
  languages: [curl, python, javascript, go, java]
  show-by-default: "curl"
try-it:
  enabled: true
  cors-proxy: "https://cors-anywhere.herokuapp.com/"
```

---

### Phase 5: Showcase & Documentation (Week 9)
*Goal: Make the project itself a portfolio piece.*

**5.1 Live Demo Site**
- Deploy SpecFlow to Vercel as a web app
- Include 3 pre-loaded example specs:
  1. **VaultPay API** (your existing spec — FinTech/payments)
  2. **Petstore** (standard OpenAPI sample — shows general use)
  3. **FraudShield API** (your existing spec — AI/fraud/compliance)
- "Upload your own spec" button on the landing page

**5.2 SpecFlow's Own Documentation**
- Built using SpecFlow itself (self-referential, like your Docs-as-Code portal)
- Sections:
  - Getting Started (install, first build, deploy)
  - Configuration Reference
  - Compliance Extensions Guide
  - AI Enrichment Guide
  - Theming & Customization
  - GitHub Actions Integration
  - Contributing Guide

**5.3 README & GitHub Repository**
- Professional README with:
  - Animated GIF showing spec → portal workflow
  - Feature comparison table vs. Redocly, Scalar, ReadMe
  - "Built by a documentation architect, not a SaaS company" tagline
  - Badges: build status, license, npm version
- Repository structure:
```
specflow/
├── src/
│   ├── parser/         # OpenAPI parsing & validation
│   ├── generator/      # Code sample generation
│   ├── compliance/     # Regulation annotation engine
│   ├── ai/             # GPT-4o enrichment
│   ├── components/     # React components (layout, panels, console)
│   ├── search/         # Fuse.js index builder
│   └── themes/         # Default + custom themes
├── templates/          # HTML/CSS templates for static output
├── examples/           # Sample specs (VaultPay, FraudShield, Petstore)
├── docs/               # SpecFlow's own docs (built with SpecFlow)
├── .github/workflows/  # CI/CD templates
├── specflow.config.yaml
├── package.json
└── README.md
```

---

## Detailed Timeline

| Week | Phase | Deliverable | Hours |
|------|-------|------------|-------|
| 1 | Core | OpenAPI parser + validator + route structure | 15-20 |
| 2 | Core | Three-panel layout + endpoint rendering + schema trees | 15-20 |
| 3 | Core | Code sample generation + search + dark/light mode | 15-20 |
| 4 | Interactive | Try-It console + auth configuration | 15-20 |
| 5 | Interactive | Webhook docs + request history + polish | 10-15 |
| 6 | Intelligence | AI description enrichment + diff view | 15-20 |
| 7 | Intelligence | Compliance annotation layer + spec quality score | 15-20 |
| 8 | Deploy | Static export CLI + GitHub Actions template + config | 10-15 |
| 9 | Showcase | Live demo + SpecFlow docs + README + LinkedIn posts | 10-15 |
| **Total** | | | **~120-165 hrs** |

---

## LinkedIn Content Strategy (During the Build)

Ship in public. Each phase becomes a LinkedIn post.

| Week | Post topic | Hook |
|------|-----------|------|
| 1 | "I'm building an open-source alternative to Redocly" | Announce the project, show the vision |
| 3 | "What Stripe's API docs get right (and how I'm replicating it)" | Three-panel layout reveal, side-by-side with Stripe |
| 5 | "The Try-It console that writes itself from an OpenAPI spec" | Demo video: upload spec → test endpoint live |
| 7 | "No API docs tool does compliance. So I built it." | The differentiator — compliance annotation demo |
| 8 | "One YAML file. One GitHub push. A developer portal appears." | Full pipeline demo: spec → GitHub Actions → live site |
| 9 | "I built 10 documentation sites. Then I built the tool that generates them." | The capstone narrative — ties your whole portfolio together |

---

## Success Metrics

How you know SpecFlow is working for your career:

| Metric | Target |
|--------|--------|
| GitHub stars (within 3 months) | 50+ |
| Live demo site visitors | Track via Vercel analytics |
| LinkedIn post engagement (Week 7 compliance post) | 100+ reactions |
| Recruiter/hiring manager conversations citing SpecFlow | 2+ |
| Job interviews where SpecFlow is discussed | 3+ |
| npm downloads (if published as CLI) | Any traction = bonus |

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Scope creep | Phase 1-2 alone is a complete, impressive project. Phases 3-5 are enhancements. Ship early. |
| OpenAPI parsing edge cases | Use battle-tested parser libraries. Test against real-world specs (Stripe, Twilio, GitHub). |
| Try-It CORS issues | Include configurable CORS proxy. Document limitations clearly. |
| AI costs (GPT-4o) | AI enrichment is opt-in. Works fully without it. Use GPT-4o-mini for cost efficiency. |
| Time pressure (job search) | Phase 1 alone (3 weeks) produces a deployable, demonstrable project. |

---

## What to Build First (If Time is Limited)

If you can only do 3 weeks of work before your next interview cycle:

**Build Phase 1 only.** A beautiful, three-panel, static documentation portal generated from an OpenAPI spec — with code samples, schema trees, search, and dark mode. Deploy it with your VaultPay spec. That alone is more impressive than 95% of technical writer portfolios.

Then add the Try-It console (Phase 2) and compliance layer (Phase 3) iteratively. Every addition is another LinkedIn post, another talking point in interviews.

---

*Plan created: March 2026*
*Project: SpecFlow — OpenAPI to Developer Portal Generator*
*Author: Sulagna Sasmal*
