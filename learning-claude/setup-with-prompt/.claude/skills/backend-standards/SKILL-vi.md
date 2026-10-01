---
name: backend-standards
description: Tiêu chuẩn kỹ thuật backend áp dụng cho mọi service phía máy chủ, bất kể ngôn ngữ (NestJS và Python trong dự án này) - thiết kế API, kiến trúc phân lớp, validation, xác thực và phân quyền, xử lý lỗi, mô hình hóa dữ liệu MongoDB, index, transaction, tác vụ nền, giao tiếp liên service, khả năng quan sát, bảo mật và kiểm thử. Dùng skill này khi tạo hoặc thay đổi endpoint, service, repository, schema, truy vấn, job, logic xác thực hoặc tích hợp; hoặc khi review mã phía server, kể cả khi người dùng chỉ nói "thêm endpoint" hay "sửa truy vấn". Kết hợp với nestjs-standards hoặc python-standards để áp dụng quy tắc riêng của framework.
---

# Tiêu chuẩn Backend

Các quy tắc không phụ thuộc ngôn ngữ cho toàn bộ mã phía server. Chi tiết theo framework nằm trong `nestjs-standards` và `python-standards`. Quy trình cơ bản, contract và bảo mật nằm trong `project-standards`.

Trước khi viết mã mới, hãy tìm endpoint hoặc module hiện có thực hiện việc tương tự và làm theo cấu trúc của nó.

## 1. Kiến trúc phân lớp

Tách biệt trách nhiệm; dependency hướng vào trong.

```text
Transport (controller / router)  ->  Application (service / use case)  ->  Data access (repository)  ->  MongoDB
         HTTP, DTO, auth                  quy tắc nghiệp vụ, điều phối          truy vấn, ánh xạ
```

- **Lớp Transport:** phân tích và validation input, gọi một method của service, định dạng response. Không chứa quy tắc nghiệp vụ hoặc gọi database.
- **Lớp Service:** chứa quy tắc nghiệp vụ và điều phối. Không biết về HTTP (không dùng `req`/`res`, không dùng status code). Ném domain error.
- **Lớp Repository:** nơi duy nhất giao tiếp với database. Trả về domain object hoặc dữ liệu có kiểu rõ ràng, không trả document thô từ driver. Che giấu chi tiết truy vấn.
- **Chiều phụ thuộc:** controller -> service -> repository. Không bao giờ đi ngược chiều. Service không được import controller.
- Inject dependency; không tự khởi tạo collaborator bên trong hàm. Đây là điều giúp code kiểm thử được.
- Đặt tích hợp bên ngoài (email, thanh toán, lưu trữ, service khác) sau một interface/adapter để có thể giả lập trong test và thay thế sau này.

## 2. Thiết kế API (REST)

- **Resource là danh từ, số nhiều, kebab-case:** `/users`, `/purchase-orders/{id}/items`. Dùng HTTP method làm động từ. Chỉ dùng action trên sub-resource (`POST /orders/{id}/cancel`) cho thao tác không phải CRUD.
- **Method và status code:**
  - `GET` an toàn và idempotent -> `200`.
  - `POST` tạo mới -> `201` kèm resource đã tạo (và header `Location`); chấp nhận xử lý async -> `202`.
  - `PUT` thay thế toàn bộ, `PATCH` cập nhật một phần -> `200`; `DELETE` -> `204`.
  - Lỗi client: `400` sai định dạng/validation, `401` chưa xác thực, `403` không có quyền, `404` không tìm thấy, `409` xung đột, `422` chỉ dùng nếu repo đã áp dụng cho validation ngữ nghĩa, `429` vượt giới hạn tần suất.
  - Lỗi server: `500` ngoài dự kiến, `502/503/504` lỗi upstream/khả dụng. Không bao giờ trả `200` kèm nội dung lỗi.
- **Versioning:** dùng tiền tố `/v1`; chỉ thêm `/v2` khi có thay đổi phá vỡ tương thích.
- **Phân trang:** mọi endpoint danh sách đều phải phân trang với giới hạn trang tối đa. Ưu tiên phân trang theo **cursor** cho collection lớn hoặc thường xuyên thay đổi; chỉ dùng offset/limit cho danh sách nhỏ, ổn định. Trả `{ items, nextCursor | page info, total? }` theo một envelope nhất quán.
- **Lọc và sắp xếp:** whitelist field được phép; từ chối field không xác định; không chuyển nguyên query string vào database filter.
- **Idempotency:** `PUT`/`DELETE` vốn idempotent. Với `POST` tạo resource có tác dụng phụ hoặc luân chuyển tiền, nhận header `Idempotency-Key` và loại trùng.
- **Response không để lộ nội bộ:** không có `_id`/`__v`, password hash, cờ nội bộ hoặc stack trace. Ánh xạ document sang response DTO một cách tường minh; không trả raw database object.
- Ghi tài liệu mọi endpoint trong OpenAPI (summary, request, mọi response code, yêu cầu auth) để có thể sinh client.

## 3. Validation và xử lý input

- Validation **mọi** input bên ngoài (body, query, params, headers, message từ queue) tại biên bằng schema. Mặc định từ chối thuộc tính không xác định.
- Validation kiểm tra cấu trúc và quy tắc cơ bản (kiểu, độ dài, khoảng giá trị, định dạng). Quy tắc nghiệp vụ ("số dư phải đủ") thuộc về service.
- Chuẩn hóa sớm: trim chuỗi, chuyển email về chữ thường, parse ngày thành đối tượng ngày thực.
- Giới hạn kích thước request body và file upload; xác thực loại file dựa trên nội dung, không dựa vào phần mở rộng.
- Không ghép input người dùng để tạo query, đường dẫn file, lệnh shell hoặc URL.

## 4. Xác thực và phân quyền

- **AuthN:** access token ngắn hạn (JWT hoặc opaque) cùng refresh token xoay vòng, lưu phía server (dạng hash). Mỗi request phải kiểm tra chữ ký, thời hạn, issuer và audience. Giữ signing key trong secret store và xoay vòng.
- **AuthZ:** kiểm tra ở **mọi lần truy cập resource** rằng caller được phép thao tác trên **đúng bản ghi đó** (ownership / tenant / role). Chỉ kiểm tra role sẽ gây lỗi IDOR. Mặc định từ chối.
- Thực thi multi-tenancy ở data layer (luôn lọc theo tenant id), không chỉ ở controller.
- Giới hạn tần suất endpoint xác thực và endpoint tốn tài nguyên; khóa hoặc trì hoãn sau nhiều lần thất bại liên tiếp.
- Giao tiếp service-to-service cũng phải xác thực (token có chữ ký, mTLS hoặc secret dùng chung lấy từ secret store). Mạng nội bộ không phải ranh giới tin cậy.
- Không log credential hoặc token. Không đưa token vào URL.

## 5. Xử lý lỗi

- Định nghĩa **domain error** (`NotFoundError`, `ConflictError`, `ForbiddenError`, `ValidationError`) ở service layer. Chuyển chúng sang HTTP tại **một** handler toàn cục. Không ném HTTP exception sâu trong business logic, trừ khi quy ước framework trong `nestjs-standards` yêu cầu.
- Mọi error response dùng cấu trúc chuẩn trong `project-standards`, bao gồm `requestId`.
- Phân biệt lỗi dự kiến (trả 4xx rõ ràng) với lỗi ngoài dự kiến (log đầy đủ chi tiết, stack và context; trả 500 chung chung).
- Không nuốt exception. Chỉ catch khi có thể xử lý hoặc bổ sung context; nếu không thì ném lại và giữ nguyên nguyên nhân.
- Bọc lời gọi hệ thống ngoài bằng timeout, retry có giới hạn với exponential backoff và jitter (chỉ cho thao tác idempotent), cùng circuit breaker hoặc fail-fast khi lỗi kéo dài.

## 6. Database - MongoDB

### Mô hình hóa

- Thiết kế theo **mẫu truy cập**, không theo chuẩn hóa quan hệ. Trước tiên hỏi: "Dữ liệu này thường được đọc như thế nào?"
- **Embed** khi dữ liệu thuộc về parent, thường được đọc cùng nhau và kích thước có giới hạn hợp lý (địa chỉ, line item với số lượng tối đa hợp lý). **Reference** khi dữ liệu được chia sẻ, tăng không giới hạn hoặc thay đổi độc lập (user -> orders).
- Không để array tăng không giới hạn trong document (giới hạn document 16 MB, cập nhật chậm). Chuyển danh sách tăng trưởng sang collection riêng.
- Mỗi collection phải có một cấu trúc nhất quán. MongoDB không ép schema, vì vậy hãy kiểm tra schema trong code (Mongoose schema / Pydantic model) và dùng JSON Schema validator cho collection quan trọng.
- Quy ước: tên collection số nhiều, `snake_case` hoặc `camelCase` theo repo; field `camelCase`; mỗi document có `createdAt` và `updatedAt`; chỉ dùng soft delete (`deletedAt`) khi domain cần và lọc nhất quán.
- Lưu timestamp thành BSON `Date`, tiền thành đơn vị nhỏ nhất kiểu integer, enum thành string.
- **Quy tắc owner:** mỗi collection chỉ có đúng một service ghi dữ liệu. Service khác chỉ đọc hoặc gọi API của service sở hữu.

### Truy vấn và index

- Mọi mẫu truy vấn chạy production phải có index hỗ trợ. Kiểm tra bằng `explain("executionStats")`; `COLLSCAN` trên collection tăng trưởng là lỗi.
- Áp dụng **quy tắc ESR** cho compound index: Equality trước, sau đó Sort, rồi Range.
- Tạo unique index cho tính duy nhất tự nhiên (email, external id), không dựa vào "kiểm tra rồi insert" vì có race condition.
- Dùng projection chỉ lấy field cần thiết; tránh tải toàn bộ document cho danh sách.
- Tránh `find()` không giới hạn; luôn áp dụng limit. Tránh `$where`, regex không có index và offset `skip` lớn.
- Dùng `lean()`/plain object cho luồng chỉ đọc (Mongoose) để tăng tốc.
- Định nghĩa TTL index cho dữ liệu hết hạn (session, token, bản ghi tạm).
- Thay đổi index trên collection lớn là công việc vận hành: tạo trong background, lên kế hoạch rollout và hỏi trước (xem mục 7 của `project-standards`).

### Ghi dữ liệu, tính nhất quán và transaction

- Thao tác trên một document là atomic; thiết kế để tận dụng điều đó (`$inc`, `$push`, `findOneAndUpdate`) thay vì read-modify-write.
- Dùng **optimistic concurrency** (version field hoặc `updatedAt` trong filter) khi cần xử lý chỉnh sửa đồng thời.
- Chỉ dùng transaction nhiều document khi thực sự cần tính atomic giữa các document; giữ transaction ngắn, retry khi gặp `TransientTransactionError` và lưu ý cần replica set.
- Ưu tiên eventual consistency với handler idempotent cho workflow qua nhiều collection/service (dùng outbox pattern để đảm bảo event tin cậy).
- Ghi dữ liệu cần độ bền với write concern phù hợp; không giảm bảo đảm nếu không có lý do.

### Migration và seed

- Thay đổi schema hoặc dữ liệu phải đi kèm script migration **có version, đảo ngược được và idempotent** (ví dụ `migrate-mongo`), được review trong PR. Không sửa tay database dùng chung.
- Thực hiện theo các bước expand -> migrate -> contract để code cũ và mới có thể cùng hoạt động trong lúc deploy.
- Script seed chỉ dành cho local/dev và phải từ chối chạy trên production.

## 7. Tác vụ nền và messaging

- Việc chậm, có thể retry hoặc không cần thiết trong HTTP response (email, tạo báo cáo, xử lý Python nặng) phải vào queue/worker, không chạy trong request thread.
- Job phải **idempotent** (chạy hai lần vẫn an toàn), chỉ mang id/payload nhỏ (khi chạy thì tải dữ liệu mới nhất), có retry với backoff và dead-letter cho message lỗi không xử lý được.
- Scheduled job phải an toàn khi có nhiều instance (distributed lock hoặc chỉ một scheduler).
- Tác vụ dài trả `202 Accepted` kèm resource trạng thái để poll, hoặc thông báo qua webhook/event.

## 8. Giao tiếp liên service

- Định nghĩa contract trước (OpenAPI/JSON Schema), sau đó triển khai cả hai phía theo contract.
- Đặt **timeout tường minh** cho mọi outbound call; không phụ thuộc mặc định (thường có thể vô hạn). Truyền tiếp `x-request-id`.
- Xử lý lỗi một phần: caller quyết định retry, degrade hay fail. Không để một dependency chậm làm cạn worker (bulkhead, giới hạn concurrency).
- Validation response từ service khác; không mặc định chúng luôn đúng contract.
- Ưu tiên messaging bất đồng bộ cho fire-and-forget và fan-out; dùng HTTP đồng bộ khi cần request/response.

## 9. Cấu hình

- Đọc cấu hình một lần khi khởi động, kiểm tra bằng schema và cung cấp qua typed config object. Dừng sớm nếu cấu hình không hợp lệ.
- Không đọc `process.env` / `os.environ` rải rác trong business code.
- Secret lấy từ environment hoặc secret manager; không bao giờ in ra log hay error message.

## 10. Khả năng quan sát

- Log JSON có cấu trúc gồm level, timestamp, service, `requestId` và (nếu an toàn) user/tenant id. Ở rìa hệ thống, log một dòng cho mỗi request với method, route, status và duration.
- Không bao giờ log secret, token, password hoặc dữ liệu cá nhân đầy đủ. Mặc định phải redact.
- Cung cấp endpoint `/health` (liveness) và `/ready` (readiness, bao gồm kết nối database).
- Phát metrics (latency, error rate, queue depth) và trace context nếu repo đã có công cụ.
- Cảnh báo theo triệu chứng người dùng gặp (error rate, latency), không chỉ theo mức sử dụng tài nguyên.

## 11. Hiệu năng và độ tin cậy

- Đo trước khi tối ưu; profile điểm nóng thực tế. Cải thiện thường gặp: thiếu index, N+1 query, lấy thừa dữ liệu, gọi service quá nhiều, công việc đồng bộ cần chuyển vào queue.
- Tránh N+1: batch bằng `$in`, aggregation `$lookup` (dùng hạn chế) hoặc data loader.
- Chỉ cache khi có cách invalidation rõ ràng và TTL; cache phải là tùy chọn (hệ thống vẫn hoạt động nếu cache ngừng).
- Dùng connection pool và tái sử dụng một database client cho mỗi process.
- Graceful shutdown: ngừng nhận request, hoàn tất công việc đang chạy, đóng connection.
- Áp dụng rate limit và giới hạn payload size cho endpoint công khai.

## 12. Checklist bảo mật (server)

- [ ] Đã validation toàn bộ input; từ chối field không xác định
- [ ] Có AuthN cho mọi route không công khai; có AuthZ cho từng lần truy cập resource
- [ ] Không đưa raw request data vào Mongo filter (NoSQL injection); loại bỏ operator key
- [ ] Password được hash (argon2id/bcrypt); token có hạn dùng và có thể thu hồi
- [ ] Secret chỉ lấy từ env/secret manager; không xuất hiện trong log hoặc response
- [ ] CORS chỉ cho phép origin xác định; đã đặt security header (ví dụ `helmet`)
- [ ] Có rate limit cho xác thực và route tốn tài nguyên
- [ ] Error response không làm lộ thông tin nội bộ
- [ ] Dependency đã được audit

## 13. Kiểm thử

- **Unit test** cho service với repository và adapter được giả lập. Bao phủ quy tắc nghiệp vụ, trường hợp biên và từng domain error.
- **Integration test** cho repository và endpoint trên MongoDB thật (in-memory server hoặc container), với dữ liệu riêng biệt cho từng test.
- **Contract test** (hoặc validation schema trong test) ở ranh giới service để NestJS và Python không âm thầm lệch nhau.
- Kiểm thử tường minh phân quyền: user **không được** đọc hoặc sửa dữ liệu của user khác.
- Kiểm thử luồng lỗi: timeout, duplicate key, input không hợp lệ, lỗi upstream.
- Test phải tự dọn dữ liệu và không bao giờ chạm database dùng chung.

## 14. Checklist trước khi hoàn tất

- [ ] Tuân thủ phân lớp; không có business logic trong controller, không gọi DB trong service
- [ ] Input đã validation, output được ánh xạ sang DTO, lỗi theo cấu trúc chuẩn
- [ ] Đã kiểm tra quyền trên từng resource
- [ ] Query có index và giới hạn; không có N+1
- [ ] Contract thay đổi đã được cập nhật ở mọi consumer và tài liệu
- [ ] Log có cấu trúc, không lộ secret; request id được truyền tiếp
- [ ] Đã thêm test (kể cả luồng lỗi và quyền); lint, type-check, test đều qua
