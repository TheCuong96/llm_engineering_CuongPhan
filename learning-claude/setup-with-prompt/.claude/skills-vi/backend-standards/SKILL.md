---
name: backend-standards
description: Back-end engineering standards that apply to every server-side service regardless of language (NestJS and Python here) - API design, layered architecture, validation, authentication and authorisation, error handling, MongoDB data modelling, indexes, transactions, background jobs, inter-service calls, observability, security and testing. Use this skill whenever creating or changing endpoints, services, repositories, schemas, queries, jobs, auth logic, or integrations, or when reviewing server-side code, even if the user only says "add an endpoint", "fix this query", or "store this in the database". Pair with nestjs-standards or python-standards for framework specifics.
---

<!-- BẢN TIẾNG VIỆT. Phần description giữ tiếng Anh để Claude kích hoạt skill chính xác. Chỉ dùng MỘT bản (Anh hoặc Việt) cho mỗi skill, không cài cả hai. -->

# Chuẩn Back-End

Quy tắc không phụ thuộc ngôn ngữ cho mọi code phía server. Chi tiết theo framework nằm ở `nestjs-standards` và `python-standards`. Quy trình, contract và bảo mật nền tảng nằm ở `project-standards`.

Hãy tìm một endpoint hoặc module tương tự đã có và làm theo cấu trúc của nó trước khi viết code mới.

## 1. Kiến trúc phân lớp

Tách biệt trách nhiệm; phụ thuộc hướng vào trong.

```
Transport (controller / router)  ->  Application (service / use case)  ->  Data access (repository)  ->  MongoDB
       HTTP, DTO, auth                 quy tắc nghiệp vụ, điều phối            truy vấn, ánh xạ
```

- **Lớp transport:** parse và validate input, gọi một method của service, định hình response. Không có quy tắc nghiệp vụ, không gọi database.
- **Lớp service:** quy tắc nghiệp vụ và điều phối. Không biết gì về HTTP (không `req`/`res`, không status code). Ném lỗi nghiệp vụ.
- **Lớp repository:** nơi **duy nhất** nói chuyện với database. Trả về đối tượng nghiệp vụ hoặc dữ liệu thuần có kiểu, không trả document thô của driver. Che giấu chi tiết truy vấn.
- **Hướng phụ thuộc:** controller -> service -> repository. Không bao giờ ngược lại. Không import controller từ service.
- Inject phụ thuộc; không khởi tạo collaborator bên trong hàm. Đó là điều khiến code test được.
- Đặt tích hợp bên ngoài (email, thanh toán, lưu trữ, service khác) sau một interface/adapter để giả lập trong test và thay thế sau.

## 2. Thiết kế API (REST)

- **Tài nguyên là danh từ, số nhiều, kebab-case:** `/users`, `/purchase-orders/{id}/items`. Động từ là HTTP method. Chỉ dùng hành động con (`POST /orders/{id}/cancel`) cho thao tác không phải CRUD.
- **Method và status code:**
  - `GET` an toàn và idempotent -> `200`.
  - `POST` tạo mới -> `201` kèm tài nguyên vừa tạo (và header `Location`); chấp nhận xử lý bất đồng bộ -> `202`.
  - `PUT` thay thế toàn bộ, `PATCH` cập nhật một phần -> `200`; `DELETE` -> `204`.
  - Lỗi client: `400` sai định dạng/validation, `401` chưa xác thực, `403` không có quyền, `404` không tìm thấy, `409` xung đột, `422` chỉ khi repo đã dùng cho validation ngữ nghĩa, `429` quá giới hạn.
  - Lỗi server: `500` bất ngờ, `502/503/504` upstream/sẵn sàng. Không bao giờ trả `200` kèm body lỗi.
- **Versioning:** tiền tố `/v1`; chỉ thêm `/v2` cho thay đổi phá vỡ.
- **Phân trang:** mọi endpoint danh sách đều phân trang với kích thước trang tối đa cứng. Ưu tiên **cursor** cho collection lớn hoặc hay đổi; offset/limit chỉ cho cái nhỏ, ổn định. Trả `{ items, nextCursor | thông tin trang, total? }` theo envelope nhất quán.
- **Lọc và sắp xếp:** whitelist field cho phép; từ chối field lạ; không bao giờ chuyển nguyên query string vào filter database.
- **Idempotency:** `PUT`/`DELETE` vốn idempotent. Với `POST` tạo tài nguyên có tiền hoặc side effect, nhận header `Idempotency-Key` và khử trùng lặp.
- **Response không lộ nội bộ:** không `_id`/`__v`, hash mật khẩu, cờ nội bộ hay stack trace. Ánh xạ document sang response DTO tường minh; không trả đối tượng database thô.
- Tài liệu hoá mọi endpoint trong OpenAPI (mô tả, request, mọi mã response, yêu cầu auth) để sinh được client.

## 3. Validation và xử lý input

- Validate **mọi** input bên ngoài (body, query, params, header, message từ queue) tại biên bằng schema. Mặc định từ chối thuộc tính lạ.
- Validation kiểm tra hình dạng và quy tắc cơ bản (kiểu, độ dài, khoảng, định dạng). Quy tắc nghiệp vụ ("số dư phải đủ trả") thuộc về service.
- Chuẩn hoá sớm: trim chuỗi, hạ chữ thường email, parse ngày thành đối tượng ngày thật.
- Giới hạn kích thước body và upload; kiểm tra loại file theo nội dung, không theo đuôi.
- Không bao giờ dựng truy vấn, đường dẫn file, lệnh shell hay URL bằng cách nối chuỗi với input người dùng.

## 4. Xác thực và phân quyền

- **AuthN:** access token sống ngắn (JWT hoặc opaque) cộng refresh token xoay vòng lưu phía server (đã băm). Kiểm tra chữ ký, hạn dùng, issuer, audience ở mọi request. Giữ khoá ký trong secret, và xoay vòng chúng.
- **AuthZ:** kiểm tra ở **mỗi lần truy cập tài nguyên** rằng người gọi được phép thao tác trên **bản ghi đó** (sở hữu / tenant / role). Chỉ kiểm role gây ra lỗi IDOR. Mặc định từ chối.
- Áp dụng đa tenant ở tầng dữ liệu (luôn lọc theo tenant id), không chỉ ở controller.
- Giới hạn tốc độ cho xác thực và endpoint tốn kém; khoá hoặc làm chậm sau nhiều lần thất bại.
- Gọi giữa các service cũng phải xác thực (token ký, mTLS, hoặc secret chung từ kho bí mật). Mạng nội bộ không phải ranh giới tin cậy.
- Không bao giờ log thông tin xác thực hay token. Không bao giờ đặt token trong URL.

## 5. Xử lý lỗi

- Định nghĩa **lỗi nghiệp vụ** (`NotFoundError`, `ConflictError`, `ForbiddenError`, `ValidationError`) ở lớp service. Dịch sang HTTP ở **một** handler toàn cục. Không ném HTTP exception từ sâu trong logic nghiệp vụ, trừ khi quy ước framework trong `nestjs-standards` nói vậy.
- Mọi response lỗi dùng cấu trúc lỗi chuẩn của `project-standards`, kèm `requestId`.
- Phân biệt lỗi dự kiến (trả 4xx rõ ràng) với lỗi bất ngờ (log đầy đủ chi tiết kèm stack và ngữ cảnh, trả `500` chung chung).
- Không bao giờ nuốt exception. Chỉ bắt ở nơi bạn xử lý được hoặc thêm được ngữ cảnh; còn lại ném lại, giữ nguyên nguyên nhân.
- Bọc các lệnh gọi hệ thống ngoài bằng timeout, retry có giới hạn với exponential backoff và jitter (chỉ cho thao tác idempotent), và circuit breaker hoặc đường fail-fast khi lỗi kéo dài.

## 6. Cơ sở dữ liệu - MongoDB

### Mô hình hoá
- Mô hình hoá theo **mẫu truy cập**, không theo dạng chuẩn hoá. Hãy hỏi trước: "dữ liệu này thường được đọc thế nào?"
- **Nhúng (embed)** khi dữ liệu thuộc sở hữu của cha, đọc cùng nhau, và có kích thước giới hạn (địa chỉ, dòng hàng tới mức tối đa hợp lý). **Tham chiếu** khi dữ liệu dùng chung, tăng không giới hạn, hoặc đổi độc lập (user -> orders).
- Không bao giờ cho mảng không giới hạn trong một document (giới hạn 16 MB, cập nhật chậm). Chuyển danh sách tăng trưởng sang collection riêng.
- Một hình dạng nhất quán cho mỗi collection. MongoDB không ép schema, nên hãy ép trong code (Mongoose schema / Pydantic model) và với collection quan trọng, bằng JSON Schema validator.
- Quy ước: tên collection số nhiều `snake_case` hoặc `camelCase` theo repo; field `camelCase`; mọi document có `createdAt` và `updatedAt`; soft delete (`deletedAt`) chỉ khi nghiệp vụ cần và lọc nhất quán.
- Lưu timestamp dạng BSON `Date`, tiền dạng số nguyên đơn vị nhỏ nhất, enum dạng chuỗi.
- **Quy tắc chủ sở hữu:** mỗi collection có đúng một service được ghi. Service khác đọc, hoặc gọi API của chủ sở hữu.

### Truy vấn và index
- Mọi mẫu truy vấn dùng ở production đều có index hỗ trợ. Kiểm tra bằng `explain("executionStats")`; `COLLSCAN` trên collection đang lớn là lỗi.
- Theo **quy tắc ESR** cho index kép: trường **E**quality trước, rồi **S**ort, rồi **R**ange.
- Tạo unique index cho tính duy nhất tự nhiên (email, id ngoài) thay vì dựa vào "kiểm tra rồi chèn", vốn bị race.
- Dùng projection để chỉ lấy field cần; tránh tải nguyên document cho danh sách.
- Tránh `find()` không giới hạn; luôn áp limit. Tránh `$where`, regex không có index, và `skip` lớn.
- Dùng `lean()`/đối tượng thuần cho đường chỉ đọc (Mongoose) để nhanh hơn.
- Định nghĩa TTL index cho dữ liệu hết hạn (session, token, bản ghi tạm).
- Đổi index trên collection lớn là một thao tác vận hành: build nền, lên kế hoạch rollout, và hỏi trước (xem `project-standards` mục 7).

### Ghi, nhất quán, transaction
- Thao tác trên một document là nguyên tử; hãy thiết kế để dùng chúng (`$inc`, `$push`, `findOneAndUpdate`) thay vì đọc-sửa-ghi.
- Dùng **optimistic concurrency** (trường version hoặc `updatedAt` trong filter) ở nơi sửa đồng thời quan trọng.
- Chỉ dùng transaction nhiều document khi thật sự cần nguyên tử qua nhiều document; giữ ngắn, retry khi gặp `TransientTransactionError`, và nhớ cần replica set.
- Ưu tiên nhất quán cuối cùng (eventual) với handler idempotent cho workflow xuyên collection/service (outbox pattern cho sự kiện đáng tin cậy).
- Ghi cần bền vững dùng write concern phù hợp; không hạ đảm bảo nếu không có lý do.

### Migration và seed
- Thay đổi schema hay dữ liệu được phát hành dưới dạng script migration **có phiên bản, đảo ngược được, idempotent** (ví dụ `migrate-mongo`), được review trong PR. Không bao giờ sửa tay DB dùng chung.
- Thay đổi theo các bước mở rộng -> migrate -> thu hẹp để code cũ và mới chạy được cùng nhau lúc deploy.
- Script seed chỉ cho local/dev và từ chối chạy trên production.

## 7. Công việc nền và messaging

- Mọi thứ chậm, có thể retry, hoặc không cần trong HTTP response (email, tạo báo cáo, xử lý Python nặng) đi vào queue/worker, không chạy trên luồng request.
- Job **idempotent** (chạy hai lần vẫn an toàn), chỉ mang id/payload nhỏ (tải dữ liệu mới khi chạy), có retry với backoff, và đường dead-letter cho message độc.
- Job theo lịch phải an toàn khi nhiều instance (distributed lock hoặc một scheduler duy nhất).
- Thao tác dài trả `202 Accepted` kèm tài nguyên trạng thái để poll, hoặc thông báo qua webhook/event.

## 8. Giao tiếp giữa các service

- Định nghĩa contract trước (OpenAPI/JSON Schema), rồi cài đặt cả hai phía theo nó.
- Đặt **timeout** tường minh cho mọi lệnh gọi ra ngoài; không dựa vào mặc định (thường là vô hạn). Truyền `x-request-id`.
- Xử lý lỗi từng phần: bên gọi quyết định retry, hạ cấp hay thất bại. Đừng để một dependency chậm làm cạn mọi worker (bulkhead, giới hạn đồng thời).
- Validate response từ service khác; không giả định chúng khớp contract.
- Ưu tiên messaging bất đồng bộ cho fire-and-forget và fan-out; dùng HTTP đồng bộ khi cần request/response.

## 9. Cấu hình

- Đọc cấu hình một lần lúc khởi động, validate theo schema, và cung cấp qua đối tượng config có kiểu. Fail nhanh khi config sai.
- Không đọc `process.env` / `os.environ` rải rác trong code nghiệp vụ.
- Bí mật đến từ môi trường hoặc secret manager và không bao giờ bị in trong log hay thông báo lỗi.

## 10. Observability

- Log JSON có cấu trúc gồm level, timestamp, service, `requestId`, và (khi an toàn) user/tenant id. Log một dòng mỗi request ở rìa với method, route, status và thời lượng.
- Không bao giờ log bí mật, token, mật khẩu hay dữ liệu cá nhân đầy đủ. Mặc định che đi.
- Cung cấp `/health` (liveness) và `/ready` (readiness gồm kết nối database).
- Phát metrics (độ trễ, tỉ lệ lỗi, độ sâu queue) và ngữ cảnh trace ở nơi repo có công cụ.
- Cảnh báo theo triệu chứng người dùng cảm nhận (tỉ lệ lỗi, độ trễ), không chỉ theo mức dùng tài nguyên.

## 11. Hiệu năng và độ tin cậy

- Đo trước khi tối ưu; profile điểm nóng thật. Thắng lợi thường gặp: thiếu index, N+1 query, lấy thừa, gọi service quá nhiều, công việc đồng bộ lẽ ra nên vào queue.
- Tránh N+1: gom nhóm bằng `$in`, aggregation `$lookup` (dùng tiết kiệm), hoặc data loader.
- Chỉ cache khi có chiến lược vô hiệu hoá rõ ràng và TTL; giữ cache là tuỳ chọn (hệ thống vẫn chạy khi cache sập).
- Dùng connection pool và tái sử dụng một database client cho mỗi process.
- Tắt êm (graceful shutdown): ngừng nhận request, hoàn tất công việc đang chạy, đóng kết nối.
- Áp giới hạn tốc độ và kích thước payload ở endpoint công khai.

## 12. Checklist bảo mật (server)

- [ ] Mọi input đã validate; field lạ bị từ chối
- [ ] AuthN ở mọi route không công khai; AuthZ ở mọi lần truy cập tài nguyên
- [ ] Không đưa dữ liệu request thô vào filter Mongo (NoSQL injection); key toán tử bị loại
- [ ] Mật khẩu được băm (argon2id/bcrypt); token có hạn và thu hồi được
- [ ] Bí mật chỉ từ env/secret manager; không có trong log hay response
- [ ] CORS giới hạn origin đã biết; đã đặt security header (ví dụ `helmet`)
- [ ] Rate limit ở auth và route tốn kém
- [ ] Response lỗi không lộ nội bộ
- [ ] Dependency đã được audit

## 13. Kiểm thử

- **Unit test** cho service với repository và adapter giả lập. Phủ quy tắc nghiệp vụ, trường hợp biên, và từng lỗi nghiệp vụ.
- **Integration test** cho repository và endpoint với MongoDB thật (server in-memory hoặc container), dữ liệu cô lập cho mỗi test.
- **Contract test** (hoặc validate schema trong test) ở biên service để NestJS và Python không thể lệch nhau âm thầm.
- Test phân quyền tường minh: người dùng **không** được đọc hay sửa dữ liệu của người khác.
- Test đường lỗi: timeout, khoá trùng, input sai, lỗi upstream.
- Test tự dọn dẹp và không bao giờ đụng DB dùng chung.

## 14. Checklist trước khi hoàn thành

- [ ] Các lớp được tôn trọng; không logic nghiệp vụ trong controller, không gọi DB trong service
- [ ] Input đã validate, output ánh xạ sang DTO, lỗi theo cấu trúc chuẩn
- [ ] Phân quyền kiểm tra theo từng tài nguyên
- [ ] Truy vấn có index và có giới hạn; không N+1
- [ ] Thay đổi contract đã lan tới mọi consumer và tài liệu
- [ ] Log có cấu trúc, không bí mật; request id được truyền đi
- [ ] Đã thêm test (gồm đường lỗi và quyền); lint, type-check, test đều qua
