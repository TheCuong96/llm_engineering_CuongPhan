---
name: backend-standards
description: Back-end engineering standards that apply to every server-side service regardless of language (NestJS and Python here) - API design, layered architecture, validation, authentication and authorisation, error handling, MongoDB data modelling, indexes, transactions, background jobs, inter-service calls, observability, security and testing. Use this skill whenever creating or changing endpoints, services, repositories, schemas, queries, jobs, auth logic, or integrations, or when reviewing server-side code, even if the user only says "add an endpoint", "fix this query", or "store this in the database". Pair with nestjs-standards or python-standards for framework specifics.
---

# Back-End Standards

Language-agnostic rules for all server-side code. Framework-specific detail lives in `nestjs-standards` and `python-standards`. Baseline process, contracts, and security live in `project-standards`.

Find an existing endpoint or module that does something similar and mirror its structure before writing new code.

## 1. Layered architecture

Keep responsibilities separated; dependencies point inward.

```
Transport (controller / router)  ->  Application (service / use case)  ->  Data access (repository)  ->  MongoDB
         HTTP, DTOs, auth               business rules, orchestration        queries, mapping
```

- **Transport layer:** parse and validate input, call one service method, shape the response. No business rules, no database calls.
- **Service layer:** business rules and orchestration. Knows nothing about HTTP (no `req`/`res`, no status codes). Throws domain errors.
- **Repository layer:** the only place that talks to the database. Returns domain objects or plain typed data, not raw driver documents. Hides query details.
- **Dependency direction:** controllers -> services -> repositories. Never the reverse. Never import a controller from a service.
- Inject dependencies; do not instantiate collaborators inside functions. This is what makes code testable.
- Keep external integrations (email, payments, storage, other services) behind an interface/adapter so they can be faked in tests and swapped later.

## 2. API design (REST)

- **Resources are nouns, plural, kebab-case:** `/users`, `/purchase-orders/{id}/items`. Verbs are HTTP methods. Use a sub-resource action (`POST /orders/{id}/cancel`) only for operations that are not CRUD.
- **Methods and status codes:**
  - `GET` safe and idempotent -> `200`.
  - `POST` create -> `201` with the created resource (and `Location` header); async accepted -> `202`.
  - `PUT` full replace, `PATCH` partial update -> `200`; `DELETE` -> `204`.
  - Client errors: `400` malformed/validation, `401` unauthenticated, `403` forbidden, `404` not found, `409` conflict, `422` only if the repo already uses it for semantic validation, `429` rate limited.
  - Server errors: `500` unexpected, `502/503/504` upstream/availability. Never return `200` with an error body.
- **Versioning:** prefix with `/v1`; introduce `/v2` only for breaking changes.
- **Pagination:** every list endpoint is paginated with a hard maximum page size. Prefer **cursor-based** pagination for large or changing collections; offset/limit only for small, stable ones. Return `{ items, nextCursor | page info, total? }` in a consistent envelope.
- **Filtering and sorting:** whitelist allowed fields; reject unknown ones; never forward the raw query string into a database filter.
- **Idempotency:** `PUT`/`DELETE` are idempotent by nature. For `POST` that creates money-moving or side-effecting resources, accept an `Idempotency-Key` header and deduplicate.
- **Responses never expose internals:** no `_id`/`__v`, password hashes, internal flags, or stack traces. Map documents to response DTOs explicitly; do not return raw database objects.
- Document every endpoint in OpenAPI (summary, request, all response codes, auth requirements) so clients can be generated.

## 3. Validation and input handling

- Validate **every** external input (body, query, params, headers, messages from queues) at the boundary with a schema. Reject unknown properties by default.
- Validation checks shape and basic rules (type, length, range, format). Business rules ("balance must cover the amount") belong in the service.
- Normalise early: trim strings, lowercase emails, parse dates into real date objects.
- Limit request body size and upload size; validate file type by content, not extension.
- Never build queries, file paths, shell commands, or URLs by concatenating user input.

## 4. Authentication and authorisation

- **AuthN:** short-lived access tokens (JWT or opaque) plus rotating refresh tokens stored server-side (hashed). Validate signature, expiry, issuer, and audience on every request. Keep signing keys in secrets, rotate them.
- **AuthZ:** check on **every resource access** that the caller may act on **that** record (ownership / tenant / role). Role checks alone cause IDOR bugs. Default deny.
- Enforce multi-tenancy in the data layer (always filter by tenant id), not only in controllers.
- Rate-limit authentication and expensive endpoints; lock out or delay after repeated failures.
- Service-to-service calls authenticate too (signed token, mTLS, or a shared secret from a secret store). The internal network is not a trust boundary.
- Never log credentials or tokens. Never put tokens in URLs.

## 5. Error handling

- Define **domain errors** (`NotFoundError`, `ConflictError`, `ForbiddenError`, `ValidationError`) in the service layer. Translate them to HTTP in **one** global handler. Do not throw HTTP exceptions from deep inside business logic unless the framework convention in `nestjs-standards` says so.
- Every error response uses the standard error shape from `project-standards`, including `requestId`.
- Distinguish expected failures (return a clear 4xx) from unexpected ones (log full detail with stack and context, return a generic 500).
- Never swallow exceptions. Catch only where you can handle or add context; rethrow otherwise, preserving the cause.
- Wrap calls to external systems with timeouts, bounded retries with exponential backoff and jitter (only for idempotent operations), and a circuit breaker or fail-fast path for sustained failure.

## 6. Database - MongoDB

### Modelling
- Model for **access patterns**, not for normal forms. Ask "how will this be read most often?" first.
- **Embed** when data is owned by the parent, read together, and bounded in size (address, line items up to a sane maximum). **Reference** when data is shared, grows without bound, or changes independently (user -> orders).
- Never allow unbounded arrays inside a document (16 MB document limit, slow updates). Move growing lists to their own collection.
- One consistent shape per collection. MongoDB does not force a schema, so enforce one in code (Mongoose schema / Pydantic model) and, for critical collections, with a JSON Schema validator.
- Conventions: collection names plural `snake_case` or `camelCase` as the repo already does; fields `camelCase`; every document has `createdAt` and `updatedAt`; use soft delete (`deletedAt`) only where the domain needs it and filter it consistently.
- Store timestamps as BSON `Date`, money as integer minor units, enums as strings.
- **Owner rule:** each collection has exactly one writing service. Other services read, or call the owner's API.

### Queries and indexes
- Every query pattern used in production has a supporting index. Check with `explain("executionStats")`; a `COLLSCAN` on a growing collection is a bug.
- Follow the **ESR rule** for compound indexes: Equality fields first, then Sort, then Range.
- Create unique indexes for natural uniqueness (email, external ids) instead of relying on "check then insert", which races.
- Use projections to fetch only needed fields; avoid loading whole documents for lists.
- Avoid unbounded `find()`; always apply limits. Avoid `$where`, un-indexed regex, and large `skip` offsets.
- Use `lean()`/plain objects for read-only paths (Mongoose) for speed.
- Define TTL indexes for expiring data (sessions, tokens, temporary records).
- Index changes in large collections are operations: build in the background, plan rollout, and ask first (see `project-standards` section 7).

### Writes, consistency, transactions
- Single-document operations are atomic; design to use them (`$inc`, `$push`, `findOneAndUpdate`) instead of read-modify-write.
- Use **optimistic concurrency** (version field or `updatedAt` in the filter) where concurrent edits matter.
- Use multi-document transactions only when atomicity across documents is truly required; keep them short, retry on `TransientTransactionError`, and note they require a replica set.
- Prefer eventual consistency with idempotent handlers for cross-collection or cross-service workflows (outbox pattern for reliable events).
- Writes that must be durable use an appropriate write concern; do not lower guarantees without a reason.

### Migrations and seeds
- Schema or data changes ship as **versioned, reversible, idempotent** migration scripts (for example `migrate-mongo`), reviewed in the PR. Never hand-edit shared databases.
- Make changes in expand -> migrate -> contract steps so old and new code can run together during deploys.
- Seed scripts are for local/dev only and refuse to run against production.

## 7. Background work and messaging

- Anything slow, retryable, or not needed in the HTTP response (emails, report generation, heavy Python processing) goes to a queue/worker, not the request thread.
- Jobs are **idempotent** (safe to run twice), carry only ids/small payloads (load fresh data when running), have retries with backoff, and a dead-letter path for poison messages.
- Scheduled jobs must be safe under multiple instances (distributed lock or a single scheduler).
- Long operations return `202 Accepted` with a status resource to poll, or notify by webhook/event.

## 8. Inter-service communication

- Define the contract first (OpenAPI/JSON Schema), then implement both sides against it.
- Set explicit **timeouts** on every outbound call; never rely on defaults (often infinite). Propagate `x-request-id`.
- Handle partial failure: the caller decides whether to retry, degrade, or fail. Do not let one slow dependency exhaust all workers (bulkheads, concurrency limits).
- Validate responses from other services; do not assume they match the contract.
- Prefer asynchronous messaging for fire-and-forget and fan-out; use synchronous HTTP for request/response needs.

## 9. Configuration

- Read configuration once at startup, validate against a schema, expose it through a typed config object. Fail fast on invalid config.
- Do not read `process.env` / `os.environ` scattered through business code.
- Secrets come from the environment or a secret manager and are never printed in logs or error messages.

## 10. Observability

- Structured JSON logs with level, timestamp, service, `requestId`, and (where safe) user/tenant id. Log one line per request at the edge with method, route, status, and duration.
- Never log secrets, tokens, passwords, or full personal data. Redact by default.
- Provide `/health` (liveness) and `/ready` (readiness incl. database connectivity) endpoints.
- Emit metrics (latency, error rate, queue depth) and trace context where the repo has tooling.
- Alert on symptoms users feel (error rate, latency), not just on resource use.

## 11. Performance and reliability

- Measure before optimising; profile real hotspots. Typical wins: missing indexes, N+1 queries, over-fetching, chatty service calls, synchronous work that should be queued.
- Avoid N+1: batch with `$in`, aggregation `$lookup` (sparingly), or data loaders.
- Cache only with a clear invalidation story and TTL; keep caches optional (system works if the cache is down).
- Use connection pooling and reuse one database client per process.
- Graceful shutdown: stop accepting requests, finish in-flight work, close connections.
- Apply rate limits and payload size limits on public endpoints.

## 12. Security checklist (server)

- [ ] All input validated; unknown fields rejected
- [ ] AuthN on every non-public route; AuthZ on every resource access
- [ ] No raw request data in Mongo filters (NoSQL injection); operator keys stripped
- [ ] Passwords hashed (argon2id/bcrypt); tokens expire and can be revoked
- [ ] Secrets only from env/secret manager; none in logs or responses
- [ ] CORS restricted to known origins; security headers set (e.g. `helmet`)
- [ ] Rate limiting on auth and costly routes
- [ ] Error responses leak no internals
- [ ] Dependencies audited

## 13. Testing

- **Unit tests** for services with repositories and adapters faked. Cover business rules, edge cases, and each domain error.
- **Integration tests** for repositories and endpoints against a real MongoDB (in-memory server or container) with isolated data per test.
- **Contract tests** (or schema validation in tests) at service boundaries so NestJS and Python cannot drift apart silently.
- Test authorisation explicitly: a user must **not** be able to read or modify another user's data.
- Test failure paths: timeouts, duplicate keys, invalid input, upstream errors.
- Tests clean up after themselves and never touch shared databases.

## 14. Pre-completion checklist

- [ ] Layers respected; no business logic in controllers, no DB calls in services
- [ ] Input validated, output mapped to DTOs, errors in the standard shape
- [ ] Authorisation checked per resource
- [ ] Queries indexed and bounded; no N+1
- [ ] Contract changes propagated to all consumers and docs
- [ ] Logs structured, no secrets; request id propagated
- [ ] Tests added (incl. failure and permission paths); lint, type-check, tests pass
