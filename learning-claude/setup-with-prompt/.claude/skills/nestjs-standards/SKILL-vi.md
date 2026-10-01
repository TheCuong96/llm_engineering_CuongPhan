---
name: nestjs-standards
description: Tiêu chuẩn NestJS cho repository này - kiến trúc module, controller/service/provider, DTO và validation pipe, cấu hình, tích hợp Mongoose/MongoDB, authentication guard, interceptor, exception filter, Swagger/OpenAPI, logging, gọi Python service, queue và kiểm thử. Dùng skill này khi làm việc trong NestJS API (module, controller, service, DTO, schema, guard, pipe, interceptor, filter, main.ts) hoặc khi người dùng nhắc NestJS, endpoint, DTO, Mongoose schema, decorator hay API layer, kể cả khi không nói rõ "NestJS". Luôn kết hợp với backend-standards.
---

# Tiêu chuẩn NestJS

Kế thừa `backend-standards` (phân lớp, thiết kế API, MongoDB, bảo mật) và `project-standards` (quy trình, contract). File này hướng dẫn cách triển khai riêng cho NestJS.

Kiểm tra phiên bản `@nestjs/*` đã cài và làm theo repo. Trước khi thêm module, sao chép cấu trúc từ một module hiện có được xây dựng tốt.

## 1. Cấu trúc dự án

```text
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

- **Mỗi feature = một module.** Module chỉ export những gì module khác cần (thường là service).
- Tên file `kebab-case.type.ts`; class dùng `PascalCase` kèm hậu tố loại (`UsersService`, `CreateUserDto`, `JwtAuthGuard`).
- `common/` chỉ chứa hạ tầng dùng xuyên suốt. Không đặt business logic ở đó.
- Tránh `SharedModule` ôm đồm. Tạo module nhỏ với import/export tường minh.

## 2. Khởi tạo ứng dụng (`main.ts`)

Cấu hình một lần, toàn cục, theo tinh thần sau:

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

- Chỉ thiết lập Swagger khi có typed config flag; không công khai Swagger trên production nếu không chủ đích.
- Trust-proxy, giới hạn body size, compression và rate limiting (`@nestjs/throttler`) được cấu hình tại đây, một lần.

## 3. Controller

- Controller phải **mỏng**: decorator, lấy tham số, gọi một service, trả response DTO. Không có business rule, không inject repository/model.
- Dùng decorator chính xác: `@Controller('users')`, `@Get(':id')`, `@HttpCode(...)` khi mặc định không phù hợp, `@ApiTags`, `@ApiOperation`, `@ApiResponse` cho **mọi** status code trả về, `@ApiBearerAuth` nếu route cần bảo vệ.
- Parse và validation params bằng pipe: `@Param('id', ParseObjectIdPipe)` (custom pipe kiểm tra id không hợp lệ và từ chối bằng `400`), `ParseIntPipe`, `ParseEnumPipe`.
- Luôn trả **response DTO**, không trả Mongoose document thô. Dùng `class-transformer` (`@Exclude`, `@Expose`, `ClassSerializerInterceptor`) hoặc mapper tường minh để `_id`, `__v` và secret không bị lộ.
- Chỉ dùng `@Req()`/`@Res()` khi không thể tránh; ưu tiên custom decorator có kiểu (`@CurrentUser()`).

## 4. DTO và validation

- Mọi input phải có DTO class với decorator `class-validator` (hoặc Zod qua pipe nếu repo đang dùng; không trộn hai cách).
- Kiểm tra type, độ dài, khoảng giá trị, enum và object lồng nhau (`@ValidateNested()` + `@Type(() => Child)`). Với array: `@IsArray()`, `@ArrayMaxSize()`, `@ValidateNested({ each: true })`.
- Endpoint danh sách cần query DTO: `page`/`limit` (kèm `@Max`) hoặc `cursor`; whitelist field `sortBy` và `filter` bằng `@IsIn(...)`. Không chuyển `req.query` trực tiếp thành database filter.
- Tái sử dụng bằng mapped type: `PartialType`, `PickType`, `OmitType` từ `@nestjs/swagger` để validation và tài liệu đồng bộ.
- Thêm `@ApiProperty()` kèm ví dụ cho field DTO (hoặc bật Swagger CLI plugin).
- Tách DTO create, update, query và response. Không dùng lại persistence schema làm DTO.
- Sanitize input khi phù hợp (`@Transform(({ value }) => value?.trim())`, chuyển email thành chữ thường).

## 5. Service

- Service chứa business rule và orchestration. Dependency của service là repository và adapter được inject qua constructor, không phụ thuộc `Request` object.
- Ném **exception phù hợp với domain** (xem mục 9). Không trả `null` cho trường hợp "không tìm thấy" để controller tự đoán; hãy báo lỗi tường minh.
- Giữ method nhỏ và đặt tên theo thao tác nghiệp vụ (`cancelOrder`, không phải `updateOrderStatus2`).
- Kiểm tra quyền sở hữu resource ở đây (hoặc trong policy/guard được service gọi), truyền id/tenant của user đã xác thực một cách tường minh.
- Không dùng singleton tĩnh hoặc mutable state cấp module. Scope provider mặc định là singleton; không lưu dữ liệu mỗi request trên instance service. Chỉ dùng request-scoped provider khi thật sự cần (chúng lan truyền scope và ảnh hưởng hiệu năng); ưu tiên truyền context làm đối số hoặc dùng `nestjs-cls`/AsyncLocalStorage cho request context.

## 6. Repository và MongoDB (Mongoose)

- Dùng `@nestjs/mongoose` với `MongooseModule.forFeature`. Chỉ repository class mới inject `Model<T>`.
- **Khai báo schema:**

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

- Khai báo **index trong schema**, bảo đảm khớp mẫu truy vấn thực tế (xem quy tắc ESR trong `backend-standards`). Trên production, tắt tạo index tự động (`autoIndex: false`) và quản lý index bằng migration.
- Đánh dấu field nhạy cảm `select: false`. Luôn đặt `timestamps: true`.
- Dùng `.lean()` cho truy vấn chỉ đọc; ánh xạ sang response DTO. Dùng projection và limit cho danh sách.
- Ưu tiên toán tử atomic (`findOneAndUpdate` với `$set`/`$inc`, `{ new: true }`, filter có version hoặc owner) hơn read-modify-save.
- Chỉ chuyển string id thành `ObjectId` bên trong repository; domain/service chỉ xử lý string id.
- Chuyển duplicate-key error (code `11000`) thành `ConflictException` ở repository/service; không để lộ raw Mongo error.
- Transaction: chỉ dùng `connection.startSession()` + `withTransaction` khi cần; truyền session tường minh cho mọi thao tác trong transaction.
- Dùng `populate` tiết chế; ưu tiên truy vấn thứ hai tường minh hoặc aggregation có index. Cẩn thận N+1.

## 7. Cấu hình

- Dùng `@nestjs/config` với `ConfigModule.forRoot({ isGlobal: true, validate })`, validation env bằng schema (Joi/Zod/class-validator) để app dừng khi khởi động nếu config sai.
- Cung cấp **typed config** qua namespace `registerAs('database', ...)` và inject `ConfigType<typeof databaseConfig>`; không gọi `process.env` trong service.
- Kết nối database bằng `MongooseModule.forRootAsync` qua typed config.

## 8. Xác thực và phân quyền

- Dùng Passport strategy hoặc `@nestjs/jwt` qua `JwtAuthGuard` đăng ký toàn cục (`APP_GUARD`), cùng decorator `@Public()` để loại trừ endpoint. **Mặc định phải được bảo vệ.**
- Phân quyền: dùng `@Roles()` + `RolesGuard` cho kiểm tra role tổng quát, **đồng thời** kiểm tra quyền sở hữu từng resource trong service (hoặc policy layer như CASL). Chỉ có role guard là chưa đủ.
- Param decorator `@CurrentUser()` trả typed user object từ token đã validation.
- Hash password bằng argon2id/bcrypt; không bao giờ lưu hoặc log plaintext; refresh token lưu dạng hash, có rotation và revocation.
- Giới hạn tần suất login, đăng ký, reset password và các route dễ bị lạm dụng khác (`@Throttle`).
- Guard chạy trước pipe/interceptor; không đặt business logic trong guard.

## 9. Lỗi, filter và interceptor

- Với lỗi dự kiến, service có thể ném subclass `HttpException` của Nest (`NotFoundException`, `ConflictException`, `ForbiddenException`, `BadRequestException`), **hoặc** ném domain error được filter chuyển đổi - làm theo cách repo đang dùng và giữ nhất quán.
- Một `AllExceptionsFilter` toàn cục chuyển mọi lỗi sang cấu trúc chuẩn (`statusCode`, `error`, `message`, `details`, `requestId`), log lỗi bất ngờ kèm stack trace và trả message chung cho `500`.
- Validation error từ `ValidationPipe` được ánh xạ thành `details[{ field, issue }]`.
- Interceptor dành cho concern xuyên suốt: truyền request-id, logging (method, route, status, duration), transform/serialize response, timeout (`timeout()` từ RxJS), caching. Mỗi interceptor chỉ nên có một trách nhiệm.
- Không catch exception chỉ để log rồi ném lại mà không bổ sung context.

## 10. Logging và khả năng quan sát

- Dùng structured logger (`nestjs-pino` hoặc lựa chọn của repo) với JSON output; gắn `requestId` (đọc `x-request-id` hoặc tự tạo) vào mọi dòng log và outbound HTTP call.
- Cấu hình logger redact `authorization`, cookie, password, token và dữ liệu cá nhân.
- Dùng `Logger` với tên class làm context; không dùng `console.log`.
- Thêm health check bằng `@nestjs/terminus` (`/health` liveness, `/ready` có kiểm tra Mongo ping).

## 11. Gọi Python service (và upstream khác)

- Bọc mỗi upstream bằng **adapter provider** riêng (`PythonProcessingClient`) dùng `HttpModule` / `HttpService` (hoặc `fetch`) với: base URL từ config, **timeout tường minh**, retry có backoff chỉ cho call idempotent, header `x-request-id` và service-auth, cùng validation response theo schema dùng chung.
- Chuyển upstream failure thành domain exception (`BadGatewayException`/`ServiceUnavailableException`) với message an toàn; log chi tiết upstream.
- Với công việc chậm hoặc nặng, đưa job vào queue (BullMQ qua `@nestjs/bullmq` hoặc queue repo đang dùng) để worker/Python service xử lý; cung cấp endpoint trạng thái hoặc event thay vì chặn request.
- Giữ request/response type của upstream ở một nơi (nếu có thể thì sinh từ OpenAPI). Thay đổi type phải cập nhật phía Python trong cùng change set (xem mục 5 của `project-standards`).

## 12. Queue, scheduler và event

- Processor phải idempotent, retry có backoff và có chiến lược dead-letter. Payload job nên nhỏ (id), không phải toàn bộ document.
- Cron job `@nestjs/schedule` phải an toàn khi có nhiều instance (distributed lock hoặc instance scheduler riêng).
- Chỉ dùng `EventEmitter2` để tách rời trong cùng process; dùng queue/broker thật cho event liên service.

## 13. OpenAPI và contract

- OpenAPI document được sinh là contract mà Next.js dùng để sinh type. Giữ tài liệu chính xác: mọi DTO field đều được mô tả, liệt kê mọi response code, đặt tên enum và khai báo auth.
- Thay đổi DTO là thay đổi contract; làm theo quy tắc tương thích trong `project-standards`. Không đổi tên hoặc xóa field nếu chưa có kế hoạch deprecation hoặc tăng version.

## 14. Kiểm thử

- **Unit test** (`*.spec.ts`) dùng `Test.createTestingModule` và fake `useValue`/`useMocker` cho repository, adapter. Kiểm thử business rule và mọi exception có thể ném.
- **Repository/integration test** dùng MongoDB thật (`mongodb-memory-server` hoặc Testcontainers); mỗi test có collection cô lập hoặc database được dọn sạch.
- **E2E test** (`test/`, Supertest) khởi chạy app thật với global pipe/filter giống `main.ts` (tách hàm `configureApp(app)` để dùng lại và bảo đảm test giống production). Bao phủ auth, validation error, truy cập trái phép dữ liệu user khác và error shape.
- Không mock sâu Mongoose model để kiểm thử query; việc đó không chứng minh được gì.
- Override provider cho hệ thống ngoài (`overrideProvider`) thay vì gọi hệ thống thật.

## 15. Lỗi thường gặp

- Đặt business logic hoặc truy cập DB trong controller.
- Trả trực tiếp Mongoose document (làm lộ `_id`, `__v`, field đã hash).
- Quên `whitelist`/`forbidNonWhitelisted`, khiến mass assignment nhận field ngoài dự kiến.
- Thiếu `@Type()` trên DTO lồng nhau làm nested validation âm thầm không chạy.
- Circular dependency giữa module/provider; sửa thiết kế (tách module thứ ba, dùng event) thay vì tùy tiện dùng `forwardRef`.
- Dùng request-scoped provider tùy tiện gây giảm hiệu năng và scope bị lan truyền.
- Dựa vào `autoIndex` trên production hoặc chỉ dựa vào guard để phân quyền.
- Promise rejection không được xử lý trong async code ngoài Nest request pipeline (job, event handler); hãy catch và log.
- Không đặt timeout cho outbound HTTP call.
- Global filter/pipe được cấu hình trong `main.ts` nhưng thiếu trong e2e test, khiến test qua dù production chạy khác.

## 16. Checklist trước khi hoàn tất

- [ ] Feature mới có module riêng với controller / service / repository / dto / schema
- [ ] DTO đã validation (whitelist, nested type), response được ánh xạ sang response DTO
- [ ] Có guard và phân quyền theo từng resource; chỉ dùng `@Public()` đúng nơi cần thiết
- [ ] Swagger decorator đầy đủ; contract change đã truyền sang Next.js và Python
- [ ] Query mới có index; không dùng raw filter từ input người dùng
- [ ] Đã xác minh error shape chuẩn và `requestId` trong e2e test
- [ ] Lint, type-check, unit và e2e test đều qua
