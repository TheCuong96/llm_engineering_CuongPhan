---
name: python-standards
description: Python standards for this repository's Python service/worker - project layout, typing, ruff/mypy tooling, FastAPI and Pydantic v2 patterns, async rules, MongoDB access (PyMongo/Beanie), error handling, logging, background jobs, integration with the NestJS API, packaging with uv/poetry, and pytest testing. Use this skill whenever creating or modifying Python code, scripts, workers, data/AI processing, FastAPI routes, Pydantic models, or when the user mentions Python, FastAPI, pytest, pip, or the Python service, even for small scripts. Always combine with backend-standards.
---

# Python Standards

Builds on `backend-standards` (layering, API design, MongoDB, security) and `project-standards` (process, contracts). This file covers Python-specific practice.

Read `pyproject.toml`, the lockfile, and `.python-version` first. Follow the repo's tool choices (uv / Poetry / pip-tools, FastAPI / Flask / Celery) instead of introducing alternatives. The guidance below assumes **FastAPI + Pydantic v2** for HTTP services; adapt idioms if the repo uses something else.

## 1. Project layout and tooling

```
services/python/
  pyproject.toml  uv.lock | poetry.lock  .python-version
  src/<package>/
    main.py            # app factory / entrypoint
    api/ routers/      # transport: routes, request/response schemas, dependencies
    services/          # business logic
    repositories/      # MongoDB access
    models/ schemas/   # domain models, Pydantic schemas
    core/              # config, logging, errors, security
    workers/           # queue consumers / jobs
  tests/ unit/ integration/ conftest.py
```

- Use the `src/` layout so tests import the installed package, not the working directory.
- **One dependency manager, one lockfile, committed.** Pin the Python version. Separate runtime and dev dependencies.
- Tooling (configured in `pyproject.toml`, run in CI):
  - **Ruff** for lint and format (replaces flake8, isort, black).
  - **mypy** or **pyright** in strict-ish mode for type checking.
  - **pytest** (+ `pytest-asyncio` or `anyio`, `pytest-cov`) for tests.
  - **pre-commit** hooks run ruff and type checks.
- Never `pip install` ad hoc into the project environment; add to the manifest and re-lock.

## 2. Style and language practice

- Follow PEP 8 via Ruff; do not argue with the formatter. Line length per repo config.
- Naming: `snake_case` functions/variables/modules, `PascalCase` classes, `UPPER_SNAKE` constants, `_leading` for private.
- **Type hints on all public functions, methods, and class attributes.** Use modern syntax (`list[str]`, `dict[str, int]`, `X | None`) for the project's Python version. Avoid `Any`; prefer `Protocol`, `TypedDict`, generics, or `object`.
- Prefer `dataclass(slots=True)` or Pydantic models over loose dicts for structured data.
- Use `pathlib.Path` instead of string paths; f-strings instead of `%`/`format`; `enum.Enum`/`StrEnum` for fixed sets of values.
- Use context managers (`with`/`async with`) for files, connections, locks, and temporary resources.
- Comprehensions and generators for simple transforms; plain loops when logic is non-trivial. Use generators/iterators for large data to avoid loading everything in memory.
- No mutable default arguments (`def f(x=[])`); use `None` and create inside.
- No wildcard imports. Import order handled by Ruff: stdlib, third party, first party.
- No bare `except:`; catch specific exceptions. Use `raise NewError(...) from err` to preserve the cause.
- Use `logging`, never `print`, in application code.
- Docstrings (Google or NumPy style, as the repo does) for public modules, classes, and non-obvious functions; explain *why* and contracts (raises, side effects), not restate the signature.

## 3. Configuration

- Use **`pydantic-settings`** (`BaseSettings`) to load and validate environment variables once at startup into a typed, immutable settings object. Fail fast with a message naming the missing variable.
- Cache access with a `get_settings()` function (`functools.lru_cache`) and inject it with FastAPI dependencies; do not read `os.environ` throughout the code.
- Secrets use `SecretStr` so they do not appear in logs or reprs.

## 4. FastAPI patterns

- **App factory** `create_app()` registers routers, middleware, exception handlers, and lifespan (startup/shutdown) so tests can build the app cleanly. Use the `lifespan` context manager to create and close the Mongo client and other resources; no module-level connections.
- **Routers** are thin: declare typed request/response models, call a service via dependency injection, return the response model. No business logic or database calls in route functions.
- Use `Depends()` for services, repositories, settings, and the current user. Override dependencies in tests (`app.dependency_overrides`).
- Declare `response_model`, `status_code`, `tags`, `summary`, and `responses` for error codes so OpenAPI is accurate and consumable by the NestJS side.
- Version routes (`/v1/...`) consistent with the platform.
- **Validate everything with Pydantic v2**: constrain fields (`Field(min_length=1, max_length=200)`, `conint`, `EmailStr`, `Literal`, enums); set `model_config = ConfigDict(extra="forbid")` on input models so unknown fields are rejected.
- Separate **input**, **domain/persistence**, and **output** models. Do not return database documents; construct response models explicitly.
- Wire-format casing: use `alias_generator=to_camel` with `populate_by_name=True` so the JSON is `camelCase` while Python stays `snake_case` (matches the contract in `project-standards`).
- Use Pydantic v2 APIs (`model_validate`, `model_dump`, `field_validator`, `model_validator`). Do not mix in deprecated v1 idioms (`.dict()`, `@validator`, `class Config`) unless the repo is on v1.
- Add middleware for request-id propagation (`x-request-id`) and access logging.
- Authenticate service-to-service calls (shared secret / signed token via a dependency); do not leave internal endpoints open.

## 5. Async and concurrency

- Choose per service: **async end to end** (FastAPI + async Mongo driver + `httpx.AsyncClient`) or **sync end to end**. Do not mix carelessly.
- **Never block the event loop** inside `async def`: no `time.sleep`, `requests`, sync DB drivers, heavy CPU loops, or large file reads. Use async equivalents, `await asyncio.to_thread(...)` for blocking calls, or process pools/workers for CPU-bound work.
- Plain `def` route functions run in a threadpool in FastAPI; acceptable for sync libraries, but keep the pool in mind.
- Run independent I/O concurrently with `asyncio.gather` / `TaskGroup`, bounded by a semaphore to avoid overload. Always await or track created tasks; never fire-and-forget without error handling.
- Set **timeouts** on every outbound call (`httpx.Timeout`) and handle cancellation correctly (do not swallow `asyncio.CancelledError`).
- Reuse one `httpx.AsyncClient` per app (created in lifespan), not one per request.
- CPU/ML-heavy work belongs in worker processes or a job queue, not in request handlers.

## 6. MongoDB access

- Follow the driver already used in the repo. For new code, prefer **PyMongo's native async API (`AsyncMongoClient`)**; the older **Motor** library is deprecated by MongoDB. If the repo uses Beanie or ODMantic, stay consistent with it and verify its driver compatibility before upgrading.
- Create **one client per process** in the lifespan and inject collections into repositories. Never connect in module scope or per request.
- **Repositories only.** Services never touch collections directly. Repositories take and return typed models, and convert `ObjectId` <-> `str` at the boundary.
- Always use typed, parameterised filters built from validated values. Never pass user-supplied dicts as filters (NoSQL injection); reject operator keys.
- Use projections and limits; apply pagination; make sure queries are indexed (`explain`). Create indexes through migrations/startup scripts the repo defines, not ad hoc.
- Use atomic operators (`update_one` with `$set`/`$inc`, `find_one_and_update`) over read-modify-write. Use sessions/transactions only when needed and keep them short.
- Store timezone-aware UTC datetimes (`datetime.now(UTC)`); configure the client with `tz_aware=True`. Never use naive datetimes.
- **Shared collections:** follow the owner rule in `backend-standards`. If Python writes to a collection owned by NestJS (or vice versa), stop and ask; schema drift between services is the most common failure here. Field names and types written by Python must match the NestJS Mongoose schema exactly (timestamps as `Date`, ids as `ObjectId`, same enums).
- Handle `DuplicateKeyError` and `PyMongoError` explicitly and translate to domain errors.

## 7. Error handling

- Define a small hierarchy of domain exceptions (`AppError` -> `NotFoundError`, `ConflictError`, `ValidationFailed`, `UpstreamError`) in `core/errors.py`.
- Register **exception handlers** that convert them to the standard error shape (`statusCode`, `error`, `message`, `details`, `requestId`). Convert Pydantic/FastAPI validation errors to the same shape with `details[{ field, issue }]`.
- Unexpected exceptions: log with stack trace and request id, return a generic `500`. Never leak internals.
- Be specific in `try` blocks: wrap the smallest possible statement, handle the exceptions you can act on, let others propagate.
- Use `contextlib.suppress` only for exceptions that are truly ignorable.

## 8. Logging and observability

- Configure structured JSON logging once at startup (`structlog` or `logging` with a JSON formatter, as the repo does). Include service name, level, timestamp, and `request_id` via context variables (`contextvars`).
- Use `logger = logging.getLogger(__name__)`; pass data as structured fields or `%s` args instead of building f-strings eagerly in log calls.
- Redact secrets and personal data. Log exceptions with `logger.exception(...)` inside `except` blocks.
- Provide `/health` and `/ready` endpoints (Mongo ping in readiness).

## 9. Workers, jobs, and data/AI processing

- Handlers are **idempotent**; guard against duplicate delivery with a deduplication key or upserts.
- Jobs receive ids/small payloads and load fresh data; results are written back through the owning service's API or the owned collection.
- Bounded retries with exponential backoff and jitter; poison messages go to a dead-letter store with context.
- Long-running or heavy work reports progress/status in a way the NestJS API can expose.
- Load models and large resources once at startup (lifespan/worker init), not per request. Pin model and library versions; make processing deterministic where possible (seed randomness).
- Stream or batch large datasets; do not load whole collections into memory. Set memory and time limits for tasks.
- Validate and size-limit anything coming from users or files (type, size, content) before processing; never `pickle.load`, `eval`, or `exec` untrusted data. Use `yaml.safe_load`, `subprocess` with argument lists (never `shell=True` with user input).

## 10. Security specifics

- Validate all input with Pydantic; reject unknown fields.
- No `eval`/`exec`, no `shell=True` with interpolated input, no unsafe deserialisation (`pickle`, unsafe `yaml.load`).
- Store secrets only in environment/secret manager; never in source, notebooks, or test fixtures.
- Use `secrets` (not `random`) for tokens; `hmac.compare_digest` for comparing secrets.
- Keep dependencies audited (`pip-audit` / `uv` audit or CI scanner); pin versions via the lockfile.
- Restrict outbound requests derived from user input (SSRF): allowlist hosts, block internal ranges.

## 11. Integration with the NestJS API

- The Python service's OpenAPI schema is the contract the NestJS adapter is written against. Any change to a route, field name, type, enum, or error shape is a **contract change**: update the NestJS client/DTOs, tests, and docs in the same change set.
- Responses use `camelCase` JSON and the standard error shape; dates are ISO 8601 UTC; ids are strings; money is integer minor units.
- Honour `x-request-id` on input and echo/propagate it to logs and outbound calls.
- Respond quickly: for operations that take more than a few seconds, accept the job (`202`) and process asynchronously.

## 12. Testing (pytest)

- Layout: `tests/unit` (pure logic, services with fakes), `tests/integration` (repositories against real MongoDB, API through `TestClient`/`httpx.AsyncClient`).
- Use **fixtures** (`conftest.py`) for app, client, database, and factories; keep them small and composable. Use `pytest.mark.parametrize` for table-driven cases.
- **Real MongoDB** for repository tests via Testcontainers or a local test instance, with a unique database per test run and cleanup between tests. Do not mock the driver for query tests. Never point tests at a shared or production database; the test config must refuse non-test URIs.
- Override FastAPI dependencies for auth and external adapters; mock outbound HTTP with `respx` or `pytest-httpx`.
- Control time and randomness (`freezegun`/`time-machine`, injected clocks, seeded RNG).
- Async tests configured consistently (`asyncio_mode = "auto"` or explicit marks).
- Test failure paths: validation errors, duplicate keys, upstream timeouts, unauthorised access.
- Measure coverage as a signal, not a goal; critical logic should have meaningful tests, not just executed lines.

## 13. Common pitfalls

- Blocking calls inside `async def` (silently freezes the whole service under load).
- Creating a Mongo client or HTTP client per request.
- Naive datetimes and timezone mismatches versus NestJS-written data.
- Returning raw documents (leaking `_id`/`ObjectId`, which is not JSON-serialisable) instead of response models.
- Letting Python and NestJS both write the same collection with different shapes.
- Mutable default arguments and shared module-level state across requests.
- Swallowing exceptions with broad `except Exception: pass`.
- Forgetting `extra="forbid"` so typos in payloads are silently ignored.
- Unpinned or unlocked dependencies producing non-reproducible builds.
- Heavy ML/CPU work running in the request path.

## 14. Pre-completion checklist

- [ ] Type hints complete; `ruff check`, `ruff format --check`, and the type checker pass
- [ ] Routers thin, services free of HTTP/DB details, repositories own all Mongo access
- [ ] Input models reject unknown fields; outputs use response models in `camelCase`
- [ ] No blocking calls in async code; timeouts on every outbound call
- [ ] Datetimes timezone-aware UTC; ids/enums/money match the shared contract
- [ ] Errors use the standard shape; logs are structured with request id and no secrets
- [ ] Contract changes propagated to NestJS; tests (unit + integration, incl. failure paths) pass
