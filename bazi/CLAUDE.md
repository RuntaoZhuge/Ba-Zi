# Ba-Zi Development Guidelines

## Workflow

Use the **speckit** workflow for all tasks by default:

1. `/speckit.specify` — Create or update a feature specification
2. `/speckit.plan` — Generate implementation plan from spec
3. `/speckit.tasks` — Generate task list from plan
4. `/speckit.implement` — Execute the tasks
5. `/speckit.analyze` — Cross-artifact consistency check

Supporting commands:
- `/speckit.constitution` — Update project principles and standards
- `/speckit.clarify` — Resolve underspecified areas in a spec
- `/speckit.checklist` — Generate a custom checklist for the feature
- `/speckit.taskstoissues` — Convert tasks to GitHub issues

The project constitution at `.specify/memory/constitution.md` is the
highest-authority document. All decisions must comply with it.

## Active Technologies

- **Language**: TypeScript (strict mode)
- **Runtime**: Node.js LTS
- **Framework**: Next.js 15 (App Router)
- **Package Manager**: npm with workspaces
- **Ba-Zi Engine**: lunar-typescript (6tail) via adapter pattern
- **Testing**: Vitest (domain), Playwright (E2E when added)
- **Styling**: Tailwind CSS
- **i18n**: next-intl with `[locale]` segment routing (zh, en)
- **Formatting**: Prettier

## Project Structure

```text
bazi/                          # Monorepo root
├── packages/
│   └── domain/                # @bazi/domain — pure Ba-Zi logic
│       ├── src/
│       │   ├── types.ts       # All domain types
│       │   ├── index.ts       # Public API boundary
│       │   ├── calendar/
│       │   │   └── adapter.ts # lunar-typescript wrapper
│       │   └── bazi/
│       │       └── calculator.ts  # Core calculation engine
│       └── tests/
│           └── calculator.test.ts
├── apps/
│   └── web/                   # @bazi/web — Next.js application
│       └── src/
│           ├── app/[locale]/  # Locale-segmented routes
│           ├── components/    # React components
│           ├── i18n/          # next-intl config + messages
│           └── middleware.ts   # Locale routing middleware
├── .specify/                  # Speckit configuration
│   ├── memory/constitution.md # Project constitution (v1.0.1)
│   └── templates/             # Plan, spec, tasks templates
├── package.json               # Workspace root
└── tsconfig.base.json         # Shared TS config
```

## Commands

```bash
# Development
npm run dev          # Start Next.js dev server (port 3000)
npm run build        # Production build

# Testing
npm run test         # Run domain tests (Vitest)

# Code quality
npm run lint         # ESLint
npm run format       # Prettier
```

## Code Style

- Domain logic in `packages/domain` must have zero UI/framework imports
- lunar-typescript access only through `calendar/adapter.ts`
- All user-facing strings in locale files (`messages/zh.json`, `messages/en.json`)
- Prefer flat module structures over deep nesting
