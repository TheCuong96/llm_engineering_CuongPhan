You are a senior fullstack engineer onboarding onto this codebase. Explore the project thoroughly and generate a high-quality CLAUDE.md at the repository root. This file is loaded into every future Claude Code session, so it must be accurate, concise, and genuinely useful.

Known stack: Next.js (frontend), NestJS (backend API), Python (service/worker/scripts, role to be determined), MongoDB (database). Verify all of this against the code; do not assume.

## Phase 1: Explore (read-only, do NOT write anything yet)

1. Root: README, workspace config (pnpm-workspace.yaml / turbo.json / nx.json / lerna.json / package.json workspaces), Dockerfiles, docker-compose*, .env.example files, Makefile, CI configs (.github/workflows etc.), lint/format configs (eslint, prettier, ruff, black, mypy, editorconfig, tsconfig).
2. Repo layout: monorepo or multi-repo? List every app/service/package and its purpose. Identify the package managers in use (npm/pnpm/yarn, pip/poetry/uv/pipenv) and Node/Python versions (.nvmrc, .python-version, engines, pyproject).
3. Next.js: version, App Router vs Pages Router (or both), Server vs Client Components usage, Server Actions, data fetching and caching strategy, how it calls the backend (fetch wrapper, axios, generated client, react-query/SWR), auth handling (NextAuth/cookies/JWT, middleware.ts), state management, styling system (Tailwind/CSS modules/UI library), env var conventions (NEXT_PUBLIC_*), folder conventions.
4. NestJS: module structure, controller/service/repository layering, DTOs and validation (class-validator/zod), guards/interceptors/pipes/filters, auth mechanism, config management (@nestjs/config), logging, error response shape, API docs (Swagger), queues/events/schedulers if any, how it talks to the Python service (HTTP, message queue, gRPC, child process, shared DB).
5. Python: determine its exact role. Framework (FastAPI/Flask/Django/Celery/plain scripts), entry point, dependency and virtualenv management, typing and lint tools, async or sync, how it is triggered and by whom, how it receives input and returns output, any ML/AI/data libraries and model files.
6. MongoDB: how each service accesses it (Mongoose / @nestjs/mongoose / Typegoose / PyMongo / Motor / Beanie / ODMantic). Locate schemas/models, indexes, relationships (embedded vs referenced), ID conventions (ObjectId vs string), timestamps/soft-delete conventions, migration approach (migrate-mongo or none), seed scripts. Note whether Node and Python share collections and how schema drift between them is handled.
7. Cross-service contracts: shared types, OpenAPI specs, generated clients, shared env vars, ports, service URLs, auth between services.
8. Testing: Jest/Vitest/Playwright/Cypress for JS/TS, pytest for Python, locations, how to run all tests and a single test per service, mocking conventions, test DB strategy (mongodb-memory-server, testcontainers, docker).
9. Sample 3-5 representative files per service (prefer recently modified, check git log) to infer real conventions: naming, imports, error handling, file organization.
10. Briefly check git log for commit message and branch conventions.
11. If a CLAUDE.md already exists, read it first and preserve still-correct content. Update rather than overwrite.

## Phase 2: Verify

- Every command in the file must trace to a real script/target/config. Do not invent commands.
- Where safe, run read-only or non-destructive commands to confirm they work (lint, type-check, a single test, --help). NEVER run commands that touch real databases, run migrations, seed data, deploy, or delete anything.
- If something cannot be determined from the code, write "TODO: confirm with team" instead of guessing.

## Phase 3: Write CLAUDE.md

Use this structure (omit sections that do not apply):

# <Project name>
One or two sentences: what the product does and who uses it.

## Tech Stack
Per service: Next.js (version, router type), NestJS (version), Python (version, framework), MongoDB (version, ODM/driver), plus key libraries and infra.

## Project Structure
Brief annotated tree of important directories only, grouped by service.

## Common Commands
Code block, grouped by service, with exact commands for: install, dev, build, lint, format, type-check, run all tests, run a single test, start MongoDB/dependencies via Docker, seed/migrate (document only, flagged as "do not run without asking").

## Architecture & Key Patterns
- How a request flows: browser -> Next.js -> NestJS -> MongoDB, and where/how Python is invoked.
- Where business logic lives in each service.
- Auth flow end to end.
- API contract: how types/schemas are shared or kept in sync between Next.js, NestJS, and Python.
Only non-obvious things.

## Code Conventions
Separate subsections for TypeScript (Next.js and NestJS) and Python. Only conventions actually observed that differ from defaults: naming, imports, error handling, API response shape, logging, typing strictness.

## Database (MongoDB)
Schema locations, ID/timestamp conventions, index policy, embedded vs referenced rules, how to add or change a schema safely, migration process, and how Node and Python must stay consistent when touching the same collections.

## Testing
Where tests live per service, how to write a new one, what to mock, test DB approach, what must pass before a change is done.

## Environment & Configuration
Required env vars per service (names and purpose only, NEVER values or secrets), local setup steps, ports, external services.

## Git & Workflow
Branch naming, commit format, PR expectations, required CI checks.

## Gotchas & Pitfalls
Non-obvious traps: generated files, Server vs Client Component pitfalls, ObjectId vs string mismatches, Node/Python schema drift, order-dependent setup, flaky tests, legacy areas, things that look wrong but are intentional.

## Rules for Claude
Short imperative rules specific to this repo, for example:
- Run type-check/lint for the service you edited before finishing.
- Never edit generated files.
- Ask before adding dependencies, changing schemas/indexes, or touching shared contracts.
- When changing an API shape, update every consumer (Next.js, NestJS, Python).

## Writing rules
- Target under 200 lines. Every line must earn its place.
- Concrete and specific; delete anything true of every project.
- Do not list things easily discovered by reading files.
- Imperative, scannable bullets; code blocks for commands and paths.
- No secrets, tokens, credentials, or private URLs.
- Because this is a polyglot repo, keep the root file for global rules and cross-service concerns. Propose (but do NOT create until I confirm) nested CLAUDE.md files for each app/service that has its own conventions (e.g. the Next.js app, the NestJS API, the Python service).
- Write the file in English.

## Phase 4: Report

After writing the file, give me:
1. A short summary of what you found (stack, architecture, how the services communicate) in 3-5 lines.
2. Everything you marked TODO or were unsure about.
3. Inconsistencies in the repo (broken README commands, outdated docs, schema drift between Node and Python, mismatched versions).
4. Proposed nested CLAUDE.md files with a one-line description of what each would contain.

Begin with Phase 1 now.