You are a senior fullstack engineer onboarding onto this codebase. Your task is to explore this project thoroughly and generate a high-quality CLAUDE.md file at the repository root. This file will be loaded into every future Claude Code session, so it must be accurate, concise, and genuinely useful.

## Phase 1: Explore (do NOT write anything yet)

Investigate the repo in this order, using read-only tools:
1. Root files: README, package.json / pyproject.toml / go.mod / pom.xml / Cargo.toml / composer.json, lockfiles, Makefile, Dockerfile, docker-compose, .env.example, CI configs (.github/workflows, .gitlab-ci.yml), lint/format configs (eslint, prettier, ruff, editorconfig, tsconfig).
2. Directory structure (2-3 levels deep). Identify whether this is a monorepo, and what each app/package is for.
3. Frontend: framework, routing, state management, styling system, component conventions, API-calling layer.
4. Backend: framework, entry point, layering (controller/service/repository or similar), auth mechanism, error handling, validation, logging.
5. Database: engine, ORM/query builder, migration tool and location, seed data, naming conventions.
6. Testing: framework, where tests live, how to run all tests / a single test, mocking conventions.
7. Sample 3-5 representative source files from each major area to infer real coding conventions (naming, imports, error handling, file organization). Prefer recently modified files (check git log) over legacy ones.
8. Check git log briefly for commit message conventions and branch naming.
9. If a CLAUDE.md already exists, read it first and preserve any still-correct content. Update rather than overwrite.

## Phase 2: Verify

- Every command you put in the file must be traceable to a real script/target/config in the repo. Do not invent commands. If you can safely run a command (e.g. lint, type-check, a single test) to confirm it works, do so. Never run destructive commands (migrations on real DBs, deploys, data deletion).
- If something cannot be determined from the code, write "TODO: confirm with team" instead of guessing.

## Phase 3: Write CLAUDE.md

Use this structure (omit any section that does not apply):

# <Project name>
One or two sentences: what the product does and who uses it.

## Tech Stack
Bullet list with versions where relevant (frontend, backend, database, infra, key libraries).

## Project Structure
Brief annotated tree of the important directories only. Explain the purpose of each, not every file.

## Common Commands
Exact commands for: install, dev server (frontend/backend), build, lint, format, type-check, run all tests, run a single test, DB migrate, DB seed, Docker usage. Use a code block.

## Architecture & Key Patterns
How the layers fit together, how a request flows from UI to DB, where business logic lives, how auth works, how API contracts are shared or validated. Only non-obvious things.

## Code Conventions
Naming, file organization, import order, error handling, API response shape, logging, comments. Only conventions that are actually observed in the code and that differ from language/framework defaults.

## Testing
Where tests live, how to write a new one, what to mock, minimum expectations before a change is considered done.

## Environment & Configuration
Required env vars (names and purpose only, NEVER values or secrets), how to set up locally, external services needed.

## Git & Workflow
Branch naming, commit message format, PR expectations, CI checks that must pass.

## Gotchas & Pitfalls
Non-obvious traps: generated files not to edit by hand, order-dependent setup, known flaky tests, legacy areas to avoid touching, things that look wrong but are intentional.

## Rules for Claude
Short, imperative rules specific to this repo (e.g. "Always run type-check after editing TypeScript", "Never edit files in /generated", "Ask before adding new dependencies").

## Writing rules
- Be concise: target under 200 lines. Every line should earn its place.
- Prefer concrete, specific statements over generic advice. Delete anything that is true of every project (e.g. "write clean code").
- Do not duplicate what is easily discoverable by reading a file (e.g. do not list every component).
- Use imperative, scannable bullets. Use code blocks for commands and paths.
- Never include secrets, tokens, credentials, or real URLs of private systems.
- If this is a monorepo, put shared/global rules in the root CLAUDE.md and propose (but do not create unless I confirm) nested CLAUDE.md files for packages with their own conventions.
- Write the file in English.

## Phase 4: Report

After writing the file, give me:
1. A short summary of what you found (stack, architecture in 3-5 lines).
2. A list of everything you marked TODO or were unsure about, so I can fill the gaps.
3. Any inconsistencies you noticed in the repo (e.g. README commands that no longer work, outdated docs).
4. Suggestions for nested CLAUDE.md files or other improvements, if relevant.

Begin with Phase 1 now.
