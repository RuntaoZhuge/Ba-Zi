<!--
Sync Impact Report
==================
Version change: 1.0.0 → 1.0.1
Bump rationale: PATCH — clarifications to Technology Standards
  reflecting concrete choices made during MVP implementation.
  No principles added, removed, or redefined.
Modified principles: None
Added sections: None
Removed sections: None
Modified sections:
  - Technology Standards: refined from placeholder choices to
    concrete implementation decisions (npm workspaces, Vitest,
    Tailwind CSS, next-intl, lunar-typescript, monorepo structure)
Templates requiring updates:
  - .specify/templates/plan-template.md — ✅ compatible (no changes needed)
  - .specify/templates/spec-template.md — ✅ compatible (no changes needed)
  - .specify/templates/tasks-template.md — ✅ compatible (no changes needed)
  - .specify/templates/agent-file-template.md — ✅ compatible (no changes needed)
Follow-up TODOs: None
-->

# Ba-Zi Constitution

## Core Principles

### I. Accuracy First

All Ba-Zi calculations MUST produce astronomically and
calendrically correct results. This is the non-negotiable
foundation of the entire project.

- The Heavenly Stems, Earthly Branches, and pillar derivations
  MUST conform to the traditional Chinese calendar (lunisolar
  system) and validated reference tables.
- Solar term boundaries MUST use precise astronomical data, not
  approximations.
- Every calculation function MUST have automated tests against
  known-correct reference data covering at least 100 years of
  dates.
- When multiple Ba-Zi schools differ on methodology, the chosen
  method MUST be documented and the rationale recorded.

### II. Domain Integrity

Ba-Zi domain logic MUST be fully isolated from UI, API, and
infrastructure concerns.

- All calendar, stem-branch, and analysis logic MUST reside in a
  dedicated domain layer with no imports from UI or framework
  code.
- Domain functions MUST be pure where possible: given the same
  input (date, time, location), they MUST return the same output.
- The domain layer MUST be independently testable without
  spinning up a server, browser, or database.
- UI and API layers MUST consume domain logic through a clearly
  defined interface boundary — never by reaching into internal
  domain structures.

### III. Simplicity (YAGNI)

Start with the minimum viable implementation. Add complexity only
when a concrete requirement demands it.

- Do not introduce abstractions, patterns, or libraries until a
  second use case justifies them.
- Prefer flat module structures over deep nesting.
- Avoid premature optimization; measure first, then optimize the
  proven bottleneck.
- Third-party dependencies MUST be justified: each dependency
  added MUST solve a problem that cannot be reasonably solved
  with fewer than 50 lines of project code.

### IV. Internationalization

The application MUST support Chinese (zh) and English (en) from
day one. CJK-aware design is not an afterthought.

- All user-facing strings MUST be externalized into locale files;
  no hardcoded display text in components.
- Ba-Zi terminology (天干, 地支, 五行, etc.) MUST appear correctly
  in both Chinese and English with proper typographic handling.
- Date and time display MUST respect locale conventions (Gregorian
  and Chinese calendar representations).
- Layout and typography MUST accommodate CJK character widths and
  line-breaking rules.

### V. Observability

Calculation steps and system behavior MUST be transparent and
traceable.

- All Ba-Zi calculation pipelines MUST produce structured,
  step-by-step logs that can be inspected for debugging and
  user education.
- Errors MUST include contextual information: input date/time,
  the calculation step that failed, and a human-readable
  explanation.
- Structured logging (JSON format) MUST be used for all server-
  side operations.
- Calculation provenance: for any output, it MUST be possible to
  trace back through the intermediate steps that produced it.

## Technology Standards

- **Language**: TypeScript (strict mode enabled)
- **Runtime**: Node.js (LTS version)
- **Framework**: Next.js 15+ (App Router)
- **Package Manager**: npm with workspaces (monorepo)
- **Monorepo Structure**: `packages/domain` (pure domain logic) +
  `apps/web` (Next.js application)
- **Ba-Zi Engine**: lunar-typescript (6tail, v1.8.x) wrapped behind
  an adapter in the domain layer; the adapter MUST be the sole
  import boundary so the engine can be replaced without touching
  consumers.
- **Testing**: Vitest for domain unit tests; Playwright for E2E
  (when added)
- **Styling**: Tailwind CSS
- **Internationalization**: next-intl with `[locale]` segment
  routing (zh, en)
- **Linting**: ESLint with strict TypeScript rules
- **Formatting**: Prettier with consistent configuration
- All code MUST compile with zero TypeScript errors and zero
  ESLint warnings before merge.
- Dependencies MUST be pinned to exact versions in lock files.

## Development Workflow

- Feature work MUST happen on feature branches named with the
  pattern `###-feature-name`.
- Commits MUST be atomic: one logical change per commit.
- All domain calculation logic MUST have passing tests before a
  feature branch is merged.
- Code reviews MUST verify compliance with this constitution's
  principles, particularly Accuracy First and Domain Integrity.
- The main branch MUST always be in a deployable state.

## Governance

This constitution is the highest-authority document for the Ba-Zi
project. All design decisions, code reviews, and architectural
choices MUST be evaluated against these principles.

- **Amendments**: Any change to this constitution MUST be
  documented with a rationale, reviewed, and versioned according
  to semantic versioning (MAJOR for principle removals or
  redefinitions, MINOR for additions or material expansions,
  PATCH for clarifications).
- **Compliance**: Every pull request review MUST include a
  constitution compliance check. Violations MUST be justified in
  the PR description or resolved before merge.
- **Conflict resolution**: When principles conflict (e.g.,
  Simplicity vs. Internationalization overhead), Accuracy First
  takes precedence, followed by Domain Integrity, then the
  remaining principles in listed order.

**Version**: 1.0.1 | **Ratified**: 2026-02-12 | **Last Amended**: 2026-02-12
