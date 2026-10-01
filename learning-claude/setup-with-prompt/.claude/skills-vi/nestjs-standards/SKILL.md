---
name: nestjs-standards
description: NestJS standards for this repository - module architecture, controllers/services/providers, DTOs and validation pipes, configuration, Mongoose/MongoDB integration, authentication guards, interceptors, exception filters, Swagger/OpenAPI, logging, calling the Python service, queues, and testing. Use this skill whenever working in the NestJS API (modules, controllers, services, DTOs, schemas, guards, pipes, interceptors, filters, main.ts) or when the user mentions NestJS, endpoints, DTOs, Mongoose schemas, decorators, or the API layer, even if they do not say "NestJS" explicitly. Always combine with backend-standards.
---

<!-- BẢN TIẾNG VIỆT. Phần description giữ tiếng Anh để Claude kích hoạt skill chính xác. Chỉ dùng MỘT bản (Anh hoặc Việt) cho mỗi skill, không cài cả hai. -->

# Chuẩn NestJS

Xây trên `backend-standards` (phân lớp, thiết kế API, MongoDB, bảo mật) và `project-standards` (quy trình, contract). File này nói về phần cài đặt đặc thù của NestJS.

Kiểm tra phiên bản `@nestjs/*` đang cài và theo repo. Trước khi thêm module, hãy chép cấu trúc của một module đã có và làm tốt.

## 1. Cấu trúc dự án

```
src/
  main.ts  app.module.ts
  config/            # config có kiểu + validate env
  common/            # filter, interceptor, guard, pipe, decorator, util (không có logic tính năng)
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

- **Một tính năng = một module.** Module chỉ export những gì module khác cần (thường là service).
- Đặt tên: file `kebab-case.type.ts`; class `PascalCase` kèm hậu tố loại (`UsersService`, `CreateUserDto`, `JwtAuthGuard`).
- `common/` chỉ chứa hạ tầng xuyên suốt. Logic nghiệp vụ không bao giờ nằm ở đây.
- Tránh một `SharedModule` ôm đồm. Tạo module nhỏ với import/export tường minh.

## 2. Khởi động (`main.ts`)

Cấu hình một lần, toàn cục, theo tinh thần sau:

```ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,              // loại bỏ thuộc tính lạ
  forbidNonWhitelisted: true,   // từ chối chúng
  transform: true,              // khởi tạo class DTO và ép kiểu nguyên thuỷ
  transformOptions: { enableImplicitConversion: false },
}));
app.useGlobalFilters(new AllExceptionsFilter());   // cấu trúc lỗi chuẩn + requestId
app.enableShutdownHooks();                         // tắt êm
app.use(helmet());                                 // security header
app.enableCors({ origin: allowedOrigins, credentials: true });
app.setGlobalPrefix('api'); app.enableVersioning({ type: VersioningType.URI });
```

- Chỉ dựng Swagger từ một cờ config có kiểu; đừng phơi nó công khai ở production trừ khi có chủ ý.
- Trust-proxy, giới hạn body, nén, và rate limiting (`@nestjs/throttler`) được cấu hình ở đây, một lần.

## 3. Controller

- Controller **mỏng**: decorator, lấy tham số, một lệnh gọi service, trả response DTO. Không quy tắc nghiệp vụ, không inject repository/model.
- Decorate chính xác: `@Controller('users')`, `@Get(':id')`, `@HttpCode(...)` khi mặc định sai, `@ApiTags`, `@ApiOperation`, `@ApiResponse` cho **mọi** status code trả về, `@ApiBearerAuth` khi có bảo vệ.
- Parse và validate param bằng pipe: `@Param('id', ParseObjectIdPipe)` (pipe tự viết, validate và từ chối id sai bằng `400`), `ParseIntPipe`, `ParseEnumPipe`.
- Trả **response DTO**, không bao giờ trả document Mongoose thô. Dùng `class-transformer` (`@Exclude`, `@Expose`, `ClassSerializerInterceptor`) hoặc mapper tường minh để `_id`, `__v` và bí mật không thể lọt ra.
- Chỉ dùng `@Req()`/`@Res()` khi bất khả kháng; ưu tiên decorator tuỳ biến có kiểu (`@CurrentUser()`).

## 4. DTO và validation

- Mọi input có một class DTO với decorator `class-validator` (hoặc Zod qua pipe nếu repo dùng - không trộn).
- Validate kiểu, độ dài, khoảng, enum và đối tượng lồng nhau (`@ValidateNested()` + `@Type(() => Child)`). Mảng: `@IsArray()`, `@ArrayMaxSize()`, `@ValidateNested({ each: true })`.
- Query DTO cho endpoint danh sách: `page`/`limit` (kèm `@Max`) hoặc `cursor`, `sortBy` và `filter` whitelist bằng `@IsIn(...)`. Không bao giờ chuyển `req.query` vào filter database.
- Tái sử dụng bằng mapped types: `PartialType`, `PickType`, `OmitType` từ `@nestjs/swagger` để validation và tài liệu luôn đồng bộ.
- Thêm `@ApiProperty()` kèm ví dụ cho field DTO (hoặc bật plugin Swagger CLI).
- DTO riêng cho create, update, query và response. Không dùng schema lưu trữ làm DTO.
- Làm sạch input khi phù hợp (`@Transform(({ value }) => value?.trim())`, hạ chữ thường email).

## 5. Service

- Service giữ quy tắc nghiệp vụ và điều phối. Chúng phụ thuộc vào repository và adapter qua constructor injection, không bao giờ vào đối tượng `Request`.
- Ném **exception đúng nghiệp vụ** (xem mục 9). Đừng trả `null` cho "không tìm thấy" rồi để controller đoán; hãy thất bại tường minh.
- Giữ method nhỏ và đặt tên theo thao tác nghiệp vụ (`cancelOrder`, không phải `updateOrderStatus2`).
- Phân quyền sở hữu tài nguyên được thực thi ở đây (hoặc trong một policy/guard mà service gọi), dùng id/tenant của người dùng đã xác thực được truyền vào tường minh.
- Không dùng singleton tĩnh hay state thay đổi ở cấp module. Phạm vi provider mặc định là singleton; không lưu dữ liệu theo request trên instance của service. Chỉ dùng request-scoped provider khi thật sự cần (chúng lan truyền và làm chậm); ưu tiên truyền ngữ cảnh qua tham số hoặc dùng `nestjs-cls`/AsyncLocalStorage.

## 6. Repository và MongoDB (Mongoose)

- Dùng `@nestjs/mongoose` với `MongooseModule.forFeature`. Chỉ class repository inject `Model<T>`.
- **Định nghĩa schema:**
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
- Khai báo **index trong schema** và giữ chúng khớp mẫu truy vấn thật (xem quy tắc ESR ở `backend-standards`). Ở production, tắt tự tạo index (`autoIndex: false`) và quản lý index qua migration.
- Đánh dấu field nhạy cảm `select: false`. Luôn đặt `timestamps: true`.
- Dùng `.lean()` cho truy vấn chỉ đọc; ánh xạ sang response DTO. Dùng projection và limit cho danh sách.
- Ưu tiên toán tử nguyên tử (`findOneAndUpdate` với `$set`/`$inc`, `{ new: true }`, filter gồm version hoặc chủ sở hữu) hơn đọc-sửa-lưu.
- Chuyển id chuỗi sang `ObjectId` chỉ bên trong repository; code nghiệp vụ/service làm việc với id chuỗi.
- Ánh xạ lỗi khoá trùng (mã `11000`) sang `ConflictException` trong repository/service, không bao giờ để lộ lỗi Mongo thô.
- Transaction: `connection.startSession()` + `withTransaction` chỉ khi cần; truyền session tường minh vào mọi thao tác trong transaction.
- Dùng populate tiết kiệm; ưu tiên truy vấn thứ hai tường minh hoặc aggregation có index. Coi chừng N+1.

## 7. Cấu hình

- Dùng `@nestjs/config` với `ConfigModule.forRoot({ isGlobal: true, validate })`, validate env bằng schema (Joi/Zod/class-validator) để app lỗi ngay lúc boot nếu config sai.
- Phơi **config có kiểu** qua namespace `registerAs('database', ...)` và inject `ConfigType<typeof databaseConfig>`; không gọi `process.env` trong service.
- Kết nối database qua `MongooseModule.forRootAsync` dùng config có kiểu.

## 8. Xác thực và phân quyền

- Dùng Passport strategy hoặc `@nestjs/jwt` qua một `JwtAuthGuard` đăng ký toàn cục (`APP_GUARD`), với decorator `@Public()` để loại endpoint khỏi bảo vệ. **Bảo mật theo mặc định.**
- Phân quyền: `@Roles()` + `RolesGuard` cho kiểm role thô, **cộng thêm** kiểm sở hữu theo từng tài nguyên trong service (hoặc lớp policy như CASL). Guard theo role một mình là chưa đủ.
- Param decorator `@CurrentUser()` trả đối tượng user có kiểu từ token đã xác thực.
- Băm mật khẩu bằng argon2id/bcrypt; không bao giờ lưu hay log plain text; refresh token lưu dạng băm, có xoay vòng và thu hồi.
- Throttle đăng nhập, đăng ký, đặt lại mật khẩu và các route dễ bị lạm dụng (`@Throttle`).
- Guard chạy trước pipe/interceptor; không đặt logic nghiệp vụ trong guard.

## 9. Lỗi, filter, interceptor

- Ném subclass của Nest `HttpException` (`NotFoundException`, `ConflictException`, `ForbiddenException`, `BadRequestException`) từ service cho lỗi dự kiến, **hoặc** lỗi nghiệp vụ được filter dịch - theo cách repo đã dùng và giữ nhất quán.
- Một `AllExceptionsFilter` toàn cục chuyển mọi lỗi thành cấu trúc lỗi chuẩn (`statusCode`, `error`, `message`, `details`, `requestId`), log lỗi bất ngờ kèm stack trace, và trả thông điệp chung cho `500`.
- Lỗi validation từ `ValidationPipe` được ánh xạ sang `details[{ field, issue }]`.
- Interceptor cho mối quan tâm xuyên suốt: truyền request-id, logging (method, route, status, thời lượng), biến đổi/serialize response, timeout (`timeout()` của RxJS), caching. Mỗi interceptor chỉ một mục đích.
- Không bắt exception chỉ để log rồi ném lại mà không thêm ngữ cảnh.

## 10. Logging và observability

- Dùng logger có cấu trúc (`nestjs-pino` hoặc lựa chọn của repo) xuất JSON; gắn `requestId` (đọc `x-request-id` hoặc tự sinh) vào mọi dòng log và mọi lệnh HTTP gọi ra.
- Che `authorization`, cookie, mật khẩu, token và dữ liệu cá nhân trong cấu hình logger.
- Dùng `Logger` với tên class làm ngữ cảnh; không dùng `console.log`.
- Thêm health check bằng `@nestjs/terminus` (`/health` liveness, `/ready` gồm ping Mongo).

## 11. Gọi service Python (và upstream khác)

- Bọc mỗi upstream trong một **adapter provider** riêng (`PythonProcessingClient`) dùng `HttpModule` / `HttpService` (hoặc `fetch`) với: base URL từ config, **timeout tường minh**, retry với backoff chỉ cho lệnh idempotent, header `x-request-id` và xác thực service, và validate response theo schema dùng chung.
- Dịch lỗi upstream thành exception nghiệp vụ (`BadGatewayException`/`ServiceUnavailableException`) với thông điệp an toàn; log chi tiết upstream.
- Với việc chậm hoặc nặng, đưa job vào queue (BullMQ qua `@nestjs/bullmq`, hoặc queue của repo) để worker/service Python xử lý; phơi endpoint trạng thái hoặc event thay vì chặn request.
- Giữ kiểu request/response của upstream ở một chỗ (sinh từ OpenAPI của nó khi có thể). Đổi chúng nghĩa là phải cập nhật phía Python trong cùng một lần thay đổi (xem `project-standards` mục 5).

## 12. Queue, scheduler, event

- Processor idempotent, retry với backoff và có chiến lược dead-letter. Payload job nhỏ (id), không phải cả document.
- Cron job của `@nestjs/schedule` phải an toàn khi nhiều instance (distributed lock hoặc instance scheduler riêng).
- Chỉ dùng `EventEmitter2` để tách rời trong cùng process; dùng queue/broker thật cho sự kiện xuyên service.

## 13. OpenAPI và contract

- Tài liệu OpenAPI được sinh ra là contract mà Next.js dùng (sinh kiểu). Giữ nó chính xác: mọi field DTO được mô tả, mọi mã response được liệt kê, enum có tên, auth được khai báo.
- Đổi một DTO là đổi contract; theo quy tắc tương thích trong `project-standards`. Không đổi tên hay xoá field khi chưa có kế hoạch deprecate hoặc nâng version.

## 14. Kiểm thử

- **Unit test** (`*.spec.ts`) với `Test.createTestingModule` và đồ giả `useValue`/`useMocker` cho repository và adapter. Kiểm tra quy tắc nghiệp vụ và mọi exception được ném.
- **Test repository/integration** trên MongoDB thật (`mongodb-memory-server` hoặc Testcontainers); mỗi test có collection cô lập hoặc DB được dọn.
- **E2E test** (`test/`, Supertest) dựng app thật với cùng global pipe/filter như `main.ts` (tách hàm `configureApp(app)` và dùng lại để test giống production). Phủ auth, lỗi validation, truy cập trái phép dữ liệu người khác, và cấu trúc lỗi.
- Không mock sâu model Mongoose để test truy vấn; làm vậy không chứng minh được gì.
- Override provider cho hệ thống ngoài (`overrideProvider`) thay vì gọi thật.

## 15. Lỗi thường gặp

- Logic nghiệp vụ hoặc truy cập DB trong controller.
- Trả document Mongoose trực tiếp (lộ `_id`, `__v`, field đã băm).
- Quên `whitelist`/`forbidNonWhitelisted`, cho phép mass assignment các field bất ngờ.
- Thiếu `@Type()` ở DTO lồng nhau nên validation lồng nhau âm thầm không làm gì.
- Phụ thuộc vòng giữa module/provider; hãy sửa thiết kế (tách module thứ ba, dùng event) thay vì dùng `forwardRef` thành thói quen.
- Dùng request-scoped provider tuỳ tiện gây giảm hiệu năng và lan phạm vi.
- Dựa vào `autoIndex` ở production, hoặc chỉ dựa vào guard để phân quyền.
- Promise rejection không được xử lý ở code async ngoài pipeline request của Nest (job, event handler); hãy bắt và log.
- Không đặt timeout cho lệnh HTTP gọi ra.
- Global filter/pipe được cấu hình ở `main.ts` nhưng không có trong e2e test, nên test qua mà production lại khác.

## 16. Checklist trước khi hoàn thành

- [ ] Tính năng mới là module riêng với controller / service / repository / dto / schema
- [ ] DTO đã validate (whitelist, kiểu lồng), response ánh xạ sang response DTO
- [ ] Guard và phân quyền theo tài nguyên đã có; `@Public()` chỉ ở nơi có chủ ý
- [ ] Decorator Swagger đầy đủ; thay đổi contract đã lan tới Next.js và Python
- [ ] Đã định nghĩa index cho truy vấn mới; không có filter thô từ input người dùng
- [ ] Cấu trúc lỗi chuẩn và `requestId` được kiểm chứng trong một e2e test
- [ ] Lint, type-check, unit và e2e test đều qua
