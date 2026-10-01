---
name: project-standards
description: Project-wide engineering standards for a polyglot fullstack codebase (Next.js frontend, NestJS backend, Python service, MongoDB). Defines the working process, definition of done, git and PR conventions, API contract rules, security baseline, testing policy and when to ask before acting. Use this skill at the start of ANY task in this repository - writing, reviewing, refactoring, debugging, or planning code - even if the user does not mention standards, conventions, or best practices. It also routes to the specialised skills (frontend-standards, backend-standards, nextjs-standards, nestjs-standards, python-standards).
---

# Project Standards

This is the baseline every task in this repository follows. Specialised skills add detail for one area; when a specialised rule conflicts with this file, the more specific rule wins. When a rule conflicts with what the existing code clearly does, follow the existing code and mention the discrepancy instead of silently "fixing" it.

## 1. Stack at a glance

| Area | Technology | Skill to load |
|---|---|---|
| Web UI | Next.js (React, TypeScript) | `frontend-standards` + `nextjs-standards` |
| API | NestJS (TypeScript) | `backend-standards` + `nestjs-standards` |
| Services / workers | Python | `backend-standards` + `python-standards` |
| Database | MongoDB | `backend-standards` (Database section) |

Load every skill that matches the files you are about to touch. A change that crosses services (for example a new API field consumed by the UI) needs all the relevant skills, plus section 5 below.

Versions change. Before using a framework feature, confirm the installed version in `package.json` / `pyproject.toml` and write code for that version, not for the one you remember best.

## 2. Working process

Follow this loop for any non-trivial task. It exists because most wasted effort comes from coding before understanding.

1. **Understand.** Read the relevant code, tests and docs first. Find a similar feature already in the repo and use it as the template. Do not invent a new pattern when one exists.
2. **Plan.** For changes touching more than ~3 files or more than one service, state a short plan (files to change, order, risks) before editing. Wait for confirmation if the plan involves anything in section 7.
3. **Implement in small steps.** Keep each step compilable and testable. Prefer several small, focused diffs over one sweeping one.
4. **Verify.** Run the checks in the Definition of Done. Do not report success on the basis that the code "should work".
5. **Report.** Summarise what changed, what you verified, what you could not verify, and any follow-ups. Be honest about gaps.

## 3. Definition of done

A task is done only when all of these hold for every service you touched:

- Type-check passes (`tsc --noEmit` for TS, `mypy`/`pyright` for Python as configured).
- Lint and format pass with the repo's own config. Never disable a rule inline to get green without a written reason.
- Relevant tests pass, and new behaviour has new tests (see section 6).
- No stray `console.log`, `print`, commented-out code, or leftover TODOs that you introduced.
- No secrets, tokens, or real personal data in code, tests, fixtures, or logs.
- Docs updated if you changed a public API, env var, command, or setup step.
- Every consumer of a changed contract is updated (section 5).

If you cannot run a check (missing tool, no network, needs a real database), say so explicitly rather than skipping it quietly.

## 4. Code principles

- **Clarity over cleverness.** Code is read far more than written. Prefer boring, explicit code.
- **Names carry meaning.** Use domain words (`invoice`, `subscription`), not vague ones (`data`, `info`, `manager`, `helper`). Booleans read as questions (`isActive`, `hasAccess`).
- **Small units.** A function does one thing; if you need "and" to describe it, split it. A file that keeps growing is asking to be split by responsibility, not by line count.
- **Make illegal states unrepresentable.** Use union types, enums, and schemas to model the domain instead of runtime checks scattered around.
- **Fail loudly and early** at boundaries (input, config, external calls); keep the inside of the system simple and trusting.
- **Do not repeat yourself, but do not abstract too early.** Wait for the third repetition, and abstract the behaviour, not the coincidental shape.
- **Comments explain why, not what.** If a comment explains what the code does, rename or restructure instead.
- **No dead code.** Delete unused code; git remembers it.
- **Minimise dependencies.** Adding a package means taking on its bugs, size, licence, and security surface. See section 7.

## 5. Cross-service contracts

Most production bugs in a polyglot system happen at the seams. Treat any shared shape as a contract.

- **One source of truth per contract.** Prefer OpenAPI (generated from NestJS) or a shared schema package. Generate client types from it rather than hand-copying interfaces.
- **When you change a contract**, update in the same change set: the producer, every consumer (Next.js, NestJS, Python), the tests, and the docs. Search the whole repo for the field name before declaring it done.
- **Backward compatibility.** Additive changes (new optional field) are safe. Removing, renaming, or changing the type or meaning of a field is a breaking change and needs a migration plan or API versioning.
- **Agreed formats everywhere:**
  - Dates and times: ISO 8601 strings in UTC on the wire (`2026-03-15T08:30:00Z`); store as native date types in MongoDB.
  - IDs: strings on the wire; `ObjectId` only inside MongoDB access code. Never leak `_id` naming differences to the UI; map to `id` at the API boundary.
  - Money: integer minor units (cents/đồng) plus a currency code. Never floats.
  - Casing: `camelCase` in JSON bodies; `snake_case` internal to Python, converted at the boundary (Pydantic aliases).
  - Enums: lowercase or `SCREAMING_SNAKE` strings, consistent across services; never numeric magic values.
- **Standard error shape** (all services return the same):
  ```json
  { "statusCode": 400, "error": "VALIDATION_FAILED", "message": "Human readable summary", "details": [{ "field": "email", "issue": "must be a valid email" }], "requestId": "..." }
  ```
- **Shared MongoDB collections.** If more than one service writes to a collection, document the owner. Default rule: exactly one service owns writes per collection; others read or go through its API.

## 6. Testing policy

- Test **behaviour**, not implementation. A refactor that keeps behaviour must not break tests.
- Every bug fix starts with a failing test that reproduces the bug.
- Pyramid: many fast unit tests for logic, fewer integration tests for the seams (HTTP, DB), few end-to-end tests for critical user journeys.
- Tests are deterministic: no reliance on wall-clock time, randomness, network, or test order. Inject clocks and ID generators.
- Use real MongoDB (in-memory server or container) for repository tests; mocking the driver proves nothing about queries.
- Test names describe behaviour: `rejects login when password is expired`, not `test1`.
- Never delete or weaken a failing test to make a build pass. Fix the code or explain why the test is wrong.

## 7. Ask before you act

Stop and ask the user first when the task would:

- Add, remove, or upgrade a dependency (especially a major version).
- Change a database schema, index, or collection ownership; run a migration or seed against any non-local database.
- Change a public API contract or auth/permission logic.
- Delete files or data, rewrite git history, force-push, or touch CI/CD, infra, or deployment config.
- Touch anything that handles payments, personal data, or credentials.
- Expand scope well beyond what was asked ("while I'm here" refactors).

Never run destructive commands against shared or production resources. Assume any connection string you find might point at real data.

## 8. Security baseline

- Treat all input as hostile: validate type, shape, length, and range at every boundary, on the server side regardless of client validation.
- Authenticate every non-public endpoint and **authorise on each resource** (can *this* user touch *this* record?), not just by role.
- Secrets live in environment variables or a secret manager. Never commit them, never log them, never put them in `NEXT_PUBLIC_*` variables.
- Use parameterised/typed queries. For MongoDB, never pass raw request bodies into filters; whitelist fields and reject operator keys (`$where`, `$ne`, `$gt`) from user input to prevent NoSQL injection.
- Hash passwords with a modern algorithm (argon2id or bcrypt with a sane cost). Never roll your own crypto.
- Do not log personal data, tokens, or full request bodies. Redact by default.
- Keep dependencies patched; do not ignore audit findings without a note.
- Return generic errors to clients; keep stack traces and internals in server logs only.

## 9. Git and pull requests

- **Branches:** `feat/<short-topic>`, `fix/<short-topic>`, `chore/<short-topic>`, `refactor/<short-topic>`. Include a ticket id if the team uses one.
- **Commits:** Conventional Commits - `type(scope): imperative summary`, summary under ~72 characters, body explains why when not obvious.
  - Types: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `build`, `ci`, `chore`.
  - Example: `fix(api): reject expired refresh tokens`
  - Mark breaking changes with `!` and a `BREAKING CHANGE:` footer.
- **One logical change per commit and per PR.** Do not mix refactors with behaviour changes.
- **PR description:** what and why, how it was tested, screenshots for UI, migration or rollout notes, and a list of contract changes.
- Follow whatever the repo's recent `git log` already does if it differs from the above.

## 10. Configuration and environments

- Configuration comes from environment variables, validated at startup. The app must refuse to boot with missing or malformed config, with an error naming the variable.
- Maintain `.env.example` for every service: names, purpose, and safe dummy values only.
- No environment-specific `if (production)` branches in business logic; vary behaviour through config.
- Use the same container/runtime setup locally as in CI where possible.

## 11. Observability

- **Structured logs** (JSON) with level, timestamp, service name, and a **request/correlation id** that is propagated across Next.js -> NestJS -> Python via a header (`x-request-id`).
- Log at the right level: `error` for failures needing attention, `warn` for recoverable oddities, `info` for lifecycle events, `debug` for detail. Do not log inside tight loops.
- Expose health endpoints for each service; add metrics and tracing hooks where the repo already has them.

## 12. Communication style when working

- Prefer the smallest change that solves the problem and say what you chose not to do.
- When requirements are ambiguous and the cost of a wrong guess is high, ask one focused question; otherwise state your assumption and proceed.
- Mark uncertainty explicitly ("I did not run the integration tests because...") instead of sounding more confident than you are.
- Never fabricate commands, file paths, APIs, or library features. If you are not sure something exists, check the code or the installed package, or say you are unsure.
