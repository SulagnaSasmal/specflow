# SpecFlow — Build Roadmap with Claude Code

> Revised estimates accounting for AI-assisted development.
> Original plan: see [PLAN.md](./PLAN.md)

## Phase Estimates

| Phase | Manual Estimate | With Claude Code | Reduction |
|-------|----------------|-----------------|-----------|
| 1: Core Portal | 3 weeks (~50 hrs) | 5–7 days (~20 hrs) | ~60% |
| 2: Try-It Console | 2 weeks (~35 hrs) | 3–4 days (~12 hrs) | ~65% |
| 3: AI + Compliance | 2 weeks (~35 hrs) | 4–5 days (~15 hrs) | ~57% |
| 4: Deploy + CI/CD | 1 week (~12 hrs) | 1–2 days (~5 hrs) | ~58% |
| 5: Showcase | 1 week (~12 hrs) | 2–3 days (~8 hrs) | ~33% |
| **Total** | **~9 weeks (~144 hrs)** | **~3 weeks (~60 hrs)** | **~58%** |

---

## What Claude Code Handles vs. What You Own

### Phase 1: Core Portal
**Claude Code handles:**
- React components, three-panel layout
- OpenAPI parsing boilerplate
- Code sample generation templates
- Tailwind styling, dark mode

**You own:**
- Architecture decisions
- Chunking the work into good prompts
- UX design choices
- Testing with real specs

---

### Phase 2: Try-It Console
**Claude Code handles:**
- Form builder from schema
- Fetch wrapper
- Auth state management
- Response display components

**You own:**
- CORS edge cases
- OAuth flow testing
- Security review

---

### Phase 3: AI + Compliance
**Claude Code handles:**
- Compliance annotation rendering
- GPT-4o integration code
- Diff view component

**You own:**
- Compliance rule definitions (domain knowledge)
- Prompt engineering for enrichment quality

---

### Phase 4: Deploy + CI/CD
**Claude Code handles:**
- GitHub Actions YAML
- Static export config
- CLI scaffold

**You own:**
- Testing the full pipeline
- README writing

---

### Phase 5: Showcase
**Claude Code handles:**
- README scaffold
- Demo data setup

**You own:**
- Your own writing
- Screenshots
- LinkedIn narrative

---

*Last updated: March 2026*
