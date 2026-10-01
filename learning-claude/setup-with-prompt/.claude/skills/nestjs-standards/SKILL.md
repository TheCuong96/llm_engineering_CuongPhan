---
name: nestjs-standards
description: NestJS standards for this repository - module architecture, controllers/services/providers, DTOs and validation pipes, configuration, Mongoose/MongoDB integration, authentication guards, interceptors, exception filters, Swagger/OpenAPI, logging, calling the Python service, queues, and testing. Use this skill whenever working in the NestJS API (modules, controllers, services, DTOs, schemas, guards, pipes, interceptors, filters, main.ts) or when the user mentions NestJS, endpoints, DTOs, Mongoose schemas, decorators, or the API layer, even if they do not say "NestJS" explicitly. Always combine with backend-standards.
---

# NestJS Standards

Builds on `backend-standards` (layering, API design, MongoDB, security) and `project-standards` (process, contracts). This file covers NestJS-specific implementation.

Check the installed `@nestjs/*` versions and follow the repo. Before adding a module, copy the structure of an existing well-built one.

## 1. Project structure

```
src/
  main.ts  app.module.ts
  config/            # typed config + env validation
  common/            # filters, interceptors, guards, pipes, decorators, utils (no feature logic)
  modules/
    users/
      users.module.ts
      users.controller.ts
      users.service.ts
      users.repository.ts
      dto/            # create-user.dto.ts, update-user.dto.ts, user-response.dto.ts, query-users.dto.ts
      schemas/        # user.schema.ts
      entities|mappers/
      users.service.spec.ts  users.controller.spec.ts
test/                # e2e
```

- **One feature = one module.** A module exports only what other modules need (usually the service).
- Names: files `kebab-case.type.ts`; classes `PascalCase` with the type suffix (`UsersService`, `CreateUserDto`, `JwtAuthGuard`).
- `common/` contains cross-cutting infrastructure only. Business logic never lives there.
- Avoid a god `SharedModule`. Create small modules with explicit imports/exports.

## 2. Bootstrapping (`main.ts`)

Configure once, globally, in this spirit:

```ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,              // strip unknown properties
  forbidNonWhitelisted: true,   // reject them
  transform: true,              // instantiate DTO classes and coerce primitives
  transformOptions: { enableImplicitConversion: false },
}));
app.useGlobalFilters(new AllExceptionsFilter());   // standard error shape + requestId
app.enableShutdownHooks();                         // graceful shutdown
app.use(helmet());                                 // security headers
app.enableCors({ origin: allowedOrigins, credentials: true });
app.setGlobalPrefix('api'); app.enableVersioning({ type: VersioningType.URI });
```

- Set up Swagger only from a typed config flag; do not expose it publicly in production unless intended.
- Trust-proxy, body-size limits, compression, and rate limiting (`@nestjs/throttler`) are configured here, once.

## 3. Controllers

- Controllers are **thin**: decorators, parameter extraction, one call to a service, return a response DTO. No business rules, no repositories/models injected.
- Decorate precisely: `@Controller('users')`, `@Get(':id')`, `@HttpCode(...)` where the default is wrong, `@ApiTags`, `@ApiOperation`, `@ApiResponse` for **every** status code returned, `@ApiBearerAuth` where secured.
- Parse and validate params with pipes: `@Param('id', ParseObjectIdPipe)` (custom pipe that validates and rejects invalid ids with `400`), `ParseIntPipe`, `ParseEnumPipe`.
- Return **response DTOs**, never raw Mongoose documents. Use `class-transformer` (`@Exclude`, `@Expose`, `ClassSerializerInterceptor`) or explicit mappers so `_id`, `__v`, and secrets cannot leak.
- Use `@Req()`/`@Res()` only when unavoidable; prefer typed custom decorators (`@CurrentUser()`).

## 4. DTOs and validation

- Every input has a DTO class with `class-validator` decorators (or Zod via a pipe if the repo uses it - do not mix).
- Validate types, lengths, ranges, enums, and nested objects (`@ValidateNested()` + `@Type(() => Child)`). Arrays: `@IsArray()`, `@ArrayMaxSize()`, `@ValidateNested({ each: true })`.
- Query DTOs for list endpoints: `page`/`limit` (with `@Max`) or `cursor`, whitelisted `sortBy` and `filter` fields via `@IsIn(...)`. Never forward `req.query` to a database filter.
- Reuse with mapped types: `PartialType`, `PickType`, `OmitType` from `@nestjs/swagger` so validation and docs stay in sync.
- Add `@ApiProperty()` with examples on DTO fields (or enable the Swagger CLI plugin).
- Separate DTOs for create, update, query, and response. Do not reuse a persistence schema as a DTO.
- Sanitise on input where appropriate (`@Transform(({ value }) => value?.trim())`, lowercase emails).

## 5. Services

- Services hold business rules and orchestration. They depend on repositories and adapters via constructor injection, never on `Request` objects.
- Throw **domain-appropriate exceptions** (see section 9). Do not return `null` for "not found" and let controllers guess; fail explicitly.
- Keep methods small and named after the business operation (`cancelOrder`, not `updateOrderStatus2`).
- Authorisation of resource ownership is enforced here (or in a policy/guard that the service calls), using the authenticated user's id/tenant passed in explicitly.
- No static singletons or module-level mutable state. Default provider scope is singleton; do not store per-request data on a service instance. Use request-scoped providers only when truly needed (they cascade and hurt performance); prefer passing context as an argument or using `nestjs-cls`/AsyncLocalStorage for request context.

## 6. Repositories and MongoDB (Mongoose)

- Use `@nestjs/mongoose` with `MongooseModule.forFeature`. Only repository classes inject `Model<T>`.
- **Schema definition:**
  ```ts
  @Schema({ timestamps: true, collection: 'users', versionKey: false })
  export class User {
    @Prop({ required: true, trim: true, lowercase: true }) email: string;
    @Prop({ required: true, select: false }) passwordHash: string;
    @Prop({ type: String, enum: UserRole, default: UserRole.Member }) role: UserRole;
  }
  export const UserSchema = SchemaFactory.createForClass(User);
  UserSchema.index({ email: 1 }, { unique: true });
  ```
- Declare **indexes in the schema** and keep them aligned with real query patterns (see ESR rule in `backend-standards`). In production, disable automatic index creation (`autoIndex: false`) and manage indexes through migrations.
- Mark sensitive fields `select: false`. Always set `timestamps: true`.
- Use `.lean()` for read-only queries; map to response DTOs. Use projections and limits on lists.
- Prefer atomic operators (`findOneAndUpdate` with `$set`/`$inc`, `{ new: true }`, filter including the version or owner) over read-modify-save.
- Convert string ids to `ObjectId` inside the repository only; domain/service code deals with string ids.
- Map duplicate-key errors (code `11000`) to a `ConflictException` in the repository/service, never leak the raw Mongo error.
- Transactions: `connection.startSession()` + `withTransaction` only when required; pass the session explicitly to every operation in the transaction.
- Populate sparingly; prefer explicit second queries or aggregation with indexes. Watch out for N+1.

## 7. Configuration

- Use `@nestjs/config` with `ConfigModule.forRoot({ isGlobal: true, validate })`, validating env with a schema (Joi/Zod/class-validator) so the app fails at boot on bad config.
- Expose **typed config** through `registerAs('database', ...)` namespaces and inject `ConfigType<typeof databaseConfig>`; do not call `process.env` in services.
- Database connection via `MongooseModule.forRootAsync` using the typed config.

## 8. Authentication and authorisation

- Use Passport strategies or `@nestjs/jwt` through a `JwtAuthGuard` registered globally (`APP_GUARD`), with an `@Public()` decorator to opt endpoints out. **Secure by default.**
- Authorisation: `@Roles()` + `RolesGuard` for coarse role checks, **plus** per-resource ownership checks in the service (or a policy layer such as CASL). Role guards alone are insufficient.
- `@CurrentUser()` param decorator returns a typed user object from the validated token.
- Hash passwords with argon2id/bcrypt; never store or log plain text; refresh tokens stored hashed with rotation and revocation.
- Throttle login, registration, password-reset, and other abuse-prone routes (`@Throttle`).
- Guards run before pipes/interceptors; do not put business logic in guards.

## 9. Errors, filters, interceptors

- Throw Nest `HttpException` subclasses (`NotFoundException`, `ConflictException`, `ForbiddenException`, `BadRequestException`) from services for expected errors, **or** domain errors translated by a filter - follow whichever the repo already uses and stay consistent.
- A single global `AllExceptionsFilter` converts every error into the standard error shape (`statusCode`, `error`, `message`, `details`, `requestId`), logs unexpected ones with stack traces, and returns a generic message for `500`.
- Validation errors from `ValidationPipe` are mapped to `details[{ field, issue }]`.
- Interceptors for cross-cutting concerns: request-id propagation, logging (method, route, status, duration), response transformation/serialisation, timeouts (`timeout()` from RxJS), caching. Keep each interceptor single-purpose.
- Never catch an exception just to log and rethrow without adding context.

## 10. Logging and observability

- Use a structured logger (`nestjs-pino` or the repo's choice) with JSON output; attach `requestId` (read `x-request-id` or generate) to every log line and to outbound HTTP calls.
- Redact `authorization`, cookies, passwords, tokens, and personal data in logger config.
- Use `Logger` with the class name as context; do not use `console.log`.
- Add health checks with `@nestjs/terminus` (`/health` liveness, `/ready` including Mongo ping).

## 11. Calling the Python service (and other upstreams)

- Wrap each upstream in a dedicated **adapter provider** (`PythonProcessingClient`) using `HttpModule` / `HttpService` (or `fetch`) with: base URL from config, **explicit timeout**, retry with backoff for idempotent calls only, `x-request-id` and service-auth headers, and response validation against the shared schema.
- Translate upstream failures into domain exceptions (`BadGatewayException`/`ServiceUnavailableException`) with a safe message; log the upstream detail.
- For slow or heavy work, enqueue a job (BullMQ via `@nestjs/bullmq`, or the repo's queue) and let the worker/Python service process it; expose a status endpoint or event rather than blocking the request.
- Keep the request/response types for the upstream in one place (generated from its OpenAPI where possible). Changing them means updating the Python side in the same change set (see `project-standards` section 5).

## 12. Queues, schedulers, events

- Processors are idempotent, retry with backoff, and have a dead-letter strategy. Job payloads are small (ids), not full documents.
- `@nestjs/schedule` cron jobs must be safe with multiple instances (distributed lock or a dedicated scheduler instance).
- Use `EventEmitter2` only for in-process decoupling; use a real queue/broker for cross-service events.

## 13. OpenAPI and contracts

- The generated OpenAPI document is the contract consumed by Next.js (type generation). Keep it accurate: all DTO fields documented, all response codes listed, enums named, auth declared.
- A change to a DTO is a contract change; follow the compatibility rules in `project-standards`. Do not rename or remove fields without a deprecation plan or version bump.

## 14. Testing

- **Unit tests** (`*.spec.ts`) with `Test.createTestingModule` and `useValue`/`useMocker` fakes for repositories and adapters. Test business rules and every thrown exception.
- **Repository/integration tests** against a real MongoDB (`mongodb-memory-server` or Testcontainers); each test gets isolated collections or a cleaned database.
- **E2E tests** (`test/`, Supertest) boot the real app with the same global pipes/filters as `main.ts` (extract a `configureApp(app)` function and reuse it so tests match production). Cover auth, validation errors, forbidden access to other users' data, and the error shape.
- Do not mock Mongoose models deeply to test queries; it proves nothing.
- Override providers for external systems (`overrideProvider`) rather than hitting them.

## 15. Common pitfalls

- Business logic or DB access inside controllers.
- Returning Mongoose documents directly (leaks `_id`, `__v`, hashed fields).
- Forgetting `whitelist`/`forbidNonWhitelisted`, allowing mass assignment of unexpected fields.
- Missing `@Type()` on nested DTOs so nested validation silently does nothing.
- Circular dependencies between modules/providers; fix the design (extract a third module, use events) rather than `forwardRef` as a habit.
- Request-scoped providers used casually, causing performance degradation and scope bubbling.
- Relying on `autoIndex` in production, or on a guard alone for authorisation.
- Unhandled promise rejections in async code outside Nest's request pipeline (jobs, event handlers); catch and log.
- Not setting a timeout on outbound HTTP calls.
- Global filters/pipes configured in `main.ts` but not in e2e tests, so tests pass while production behaves differently.

## 16. Pre-completion checklist

- [ ] New feature is its own module with controller / service / repository / dto / schema
- [ ] DTOs validated (whitelist, nested types), responses mapped to response DTOs
- [ ] Guards and per-resource authorisation in place; `@Public()` only where intended
- [ ] Swagger decorators complete; contract change propagated to Next.js and Python
- [ ] Indexes defined for new queries; no raw filters from user input
- [ ] Standard error shape and `requestId` verified in an e2e test
- [ ] Lint, type-check, unit, and e2e tests pass
