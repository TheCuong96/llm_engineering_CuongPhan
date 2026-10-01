---
name: project-standards
description: Project-wide engineering standards for a polyglot fullstack codebase (Next.js frontend, NestJS backend, Python service, MongoDB). Defines the working process, definition of done, git and PR conventions, API contract rules, security baseline, testing policy and when to ask before acting. Use this skill at the start of ANY task in this repository - writing, reviewing, refactoring, debugging, or planning code - even if the user does not mention standards, conventions, or best practices. It also routes to the specialised skills (frontend-standards, backend-standards, nextjs-standards, nestjs-standards, python-standards).
---

<!-- BẢN TIẾNG VIỆT. Phần description giữ tiếng Anh để Claude kích hoạt skill chính xác. Chỉ dùng MỘT bản (Anh hoặc Việt) cho mỗi skill, không cài cả hai. -->

# Chuẩn chung của dự án

Đây là nền tảng cho mọi tác vụ trong repo. Các skill chuyên biệt bổ sung chi tiết cho từng khu vực; khi quy tắc chuyên biệt mâu thuẫn với file này, **quy tắc cụ thể hơn thắng**. Khi quy tắc mâu thuẫn với cách code hiện có đang làm rõ ràng, hãy theo code hiện có và nêu ra sự không nhất quán thay vì âm thầm "sửa".

## 1. Tổng quan stack

| Khu vực | Công nghệ | Skill cần nạp |
|---|---|---|
| Giao diện web | Next.js (React, TypeScript) | `frontend-standards` + `nextjs-standards` |
| API | NestJS (TypeScript) | `backend-standards` + `nestjs-standards` |
| Service / worker | Python | `backend-standards` + `python-standards` |
| Cơ sở dữ liệu | MongoDB | `backend-standards` (mục Database) |

Nạp mọi skill khớp với các file bạn sắp đụng tới. Thay đổi xuyên service (ví dụ thêm field API mà UI dùng) cần đủ các skill liên quan, cộng với mục 5 bên dưới.

Phiên bản framework thay đổi. Trước khi dùng một tính năng, hãy xác nhận phiên bản đang cài trong `package.json` / `pyproject.toml` và viết code cho phiên bản đó, không phải phiên bản bạn nhớ rõ nhất.

## 2. Quy trình làm việc

Áp dụng vòng lặp này cho mọi tác vụ không tầm thường, vì phần lớn công sức lãng phí đến từ việc code trước khi hiểu.

1. **Hiểu.** Đọc code, test và tài liệu liên quan trước. Tìm một tính năng tương tự đã có và dùng nó làm khuôn mẫu. Không tạo pattern mới khi đã có pattern sẵn.
2. **Lập kế hoạch.** Với thay đổi chạm hơn ~3 file hoặc hơn một service, nêu kế hoạch ngắn (file cần đổi, thứ tự, rủi ro) trước khi sửa. Chờ xác nhận nếu kế hoạch liên quan tới mục 7.
3. **Làm từng bước nhỏ.** Mỗi bước phải biên dịch và test được. Ưu tiên nhiều diff nhỏ, tập trung hơn một diff khổng lồ.
4. **Kiểm chứng.** Chạy các kiểm tra trong Definition of Done. Không báo thành công chỉ vì code "chắc là chạy".
5. **Báo cáo.** Tóm tắt đã đổi gì, đã kiểm chứng gì, chưa kiểm chứng được gì, và việc tiếp theo. Trung thực về chỗ còn thiếu.

## 3. Definition of Done (tiêu chí hoàn thành)

Một tác vụ chỉ xong khi tất cả điều sau đúng với mọi service bạn đã đụng tới:

- Type-check qua (`tsc --noEmit` cho TS, `mypy`/`pyright` cho Python theo cấu hình).
- Lint và format qua theo cấu hình của repo. Không tắt rule bằng comment inline chỉ để qua mà không ghi lý do.
- Test liên quan qua, và hành vi mới có test mới (xem mục 6).
- Không còn `console.log`, `print`, code bị comment, hay TODO do bạn thêm.
- Không có bí mật, token, dữ liệu cá nhân thật trong code, test, fixture hay log.
- Tài liệu được cập nhật nếu bạn đổi API công khai, biến môi trường, lệnh hoặc bước cài đặt.
- Mọi bên dùng (consumer) của contract đã đổi đều được cập nhật (mục 5).

Nếu không chạy được một kiểm tra (thiếu công cụ, không có mạng, cần DB thật), hãy nói rõ thay vì lẳng lặng bỏ qua.

## 4. Nguyên tắc viết code

- **Rõ ràng hơn thông minh.** Code được đọc nhiều hơn được viết. Ưu tiên code đơn giản, tường minh.
- **Tên phải có nghĩa.** Dùng từ vựng nghiệp vụ (`invoice`, `subscription`), không dùng từ mơ hồ (`data`, `info`, `manager`, `helper`). Biến boolean đọc như câu hỏi (`isActive`, `hasAccess`).
- **Đơn vị nhỏ.** Một hàm làm một việc; nếu cần chữ "và" để mô tả, hãy tách. File phình to cần được tách theo trách nhiệm, không theo số dòng.
- **Khiến trạng thái sai không thể biểu diễn.** Dùng union type, enum, schema để mô hình hoá nghiệp vụ thay vì kiểm tra runtime rải rác.
- **Lỗi sớm và rõ ràng** ở biên (input, config, gọi ngoài); bên trong hệ thống giữ đơn giản và tin cậy.
- **Không lặp lại, nhưng đừng trừu tượng hoá quá sớm.** Đợi tới lần lặp thứ ba, và trừu tượng hoá hành vi chứ không phải hình dạng trùng hợp.
- **Comment giải thích "vì sao", không phải "cái gì".** Nếu comment giải thích code làm gì, hãy đổi tên hoặc cấu trúc lại.
- **Không có code chết.** Xoá code không dùng; git vẫn nhớ.
- **Tối thiểu hoá phụ thuộc.** Thêm một package là nhận thêm lỗi, dung lượng, giấy phép và bề mặt tấn công của nó. Xem mục 7.

## 5. Contract giữa các service

Phần lớn lỗi production trong hệ thống đa ngôn ngữ xảy ra ở chỗ nối. Hãy coi mọi hình dạng dữ liệu dùng chung là một contract.

- **Một nguồn sự thật cho mỗi contract.** Ưu tiên OpenAPI (sinh từ NestJS) hoặc package schema dùng chung. Sinh kiểu cho client từ đó thay vì chép tay interface.
- **Khi đổi contract**, cập nhật trong cùng một lần thay đổi: bên cung cấp, mọi bên dùng (Next.js, NestJS, Python), test và tài liệu. Tìm tên field trong toàn repo trước khi tuyên bố xong.
- **Tương thích ngược.** Thay đổi cộng thêm (field tuỳ chọn mới) an toàn. Xoá, đổi tên, đổi kiểu hoặc đổi ý nghĩa field là thay đổi phá vỡ, cần kế hoạch migrate hoặc versioning API.
- **Định dạng thống nhất ở mọi nơi:**
  - Ngày giờ: chuỗi ISO 8601 UTC trên đường truyền (`2026-03-15T08:30:00Z`); lưu dạng date gốc trong MongoDB.
  - ID: chuỗi trên đường truyền; `ObjectId` chỉ nằm trong code truy cập MongoDB. Không để khác biệt tên `_id` lộ ra UI; ánh xạ thành `id` ở biên API.
  - Tiền: số nguyên đơn vị nhỏ nhất (cent/đồng) kèm mã tiền tệ. Không bao giờ dùng float.
  - Kiểu chữ: `camelCase` trong JSON; `snake_case` nội bộ Python, chuyển ở biên (alias của Pydantic).
  - Enum: chuỗi chữ thường hoặc `SCREAMING_SNAKE`, nhất quán giữa các service; không dùng số "ma thuật".
- **Cấu trúc lỗi chuẩn** (mọi service trả giống nhau):
  ```json
  { "statusCode": 400, "error": "VALIDATION_FAILED", "message": "Tóm tắt dễ đọc", "details": [{ "field": "email", "issue": "must be a valid email" }], "requestId": "..." }
  ```
- **Collection MongoDB dùng chung.** Nếu nhiều service ghi vào một collection, hãy ghi rõ chủ sở hữu. Quy tắc mặc định: mỗi collection chỉ có **một** service được ghi; các service khác đọc hoặc gọi qua API của chủ sở hữu.

## 6. Chính sách kiểm thử

- Kiểm thử **hành vi**, không phải cài đặt. Refactor giữ nguyên hành vi thì không được làm hỏng test.
- Mỗi bản sửa lỗi bắt đầu bằng một test thất bại tái hiện lỗi đó.
- Kim tự tháp: nhiều unit test nhanh cho logic, ít integration test cho các điểm nối (HTTP, DB), rất ít end-to-end cho các hành trình quan trọng.
- Test phải tất định: không phụ thuộc đồng hồ, ngẫu nhiên, mạng, hay thứ tự chạy. Inject đồng hồ và bộ sinh ID.
- Dùng MongoDB thật (server in-memory hoặc container) cho test repository; mock driver không chứng minh được gì về truy vấn.
- Tên test mô tả hành vi: `rejects login when password is expired`, không phải `test1`.
- Không bao giờ xoá hay làm yếu test đang đỏ để build qua. Hãy sửa code hoặc giải thích vì sao test sai.

## 7. Hỏi trước khi làm

Dừng lại và hỏi người dùng trước khi tác vụ sẽ:

- Thêm, xoá, hoặc nâng cấp một dependency (đặc biệt bản major).
- Đổi schema, index, hoặc quyền sở hữu collection; chạy migration hay seed trên DB không phải local.
- Đổi contract API công khai hoặc logic xác thực/phân quyền.
- Xoá file hay dữ liệu, viết lại lịch sử git, force-push, hoặc đụng tới CI/CD, hạ tầng, cấu hình deploy.
- Đụng tới thứ xử lý thanh toán, dữ liệu cá nhân hoặc thông tin xác thực.
- Mở rộng phạm vi vượt xa yêu cầu ("tiện tay" refactor).

Không bao giờ chạy lệnh phá huỷ lên tài nguyên dùng chung hoặc production. Hãy giả định mọi connection string bạn thấy có thể trỏ tới dữ liệu thật.

## 8. Nền tảng bảo mật

- Coi mọi input là độc hại: kiểm tra kiểu, hình dạng, độ dài, khoảng giá trị ở mọi biên, luôn ở phía server bất kể client đã validate.
- Xác thực mọi endpoint không công khai và **phân quyền trên từng tài nguyên** (người dùng *này* có được đụng *bản ghi này* không?), không chỉ theo role.
- Bí mật nằm trong biến môi trường hoặc secret manager. Không commit, không log, không đặt trong biến `NEXT_PUBLIC_*`.
- Dùng truy vấn tham số hoá/có kiểu. Với MongoDB, không bao giờ truyền thẳng body request vào filter; whitelist field và từ chối key toán tử (`$where`, `$ne`, `$gt`) từ input người dùng để chống NoSQL injection.
- Băm mật khẩu bằng thuật toán hiện đại (argon2id hoặc bcrypt với cost hợp lý). Không tự viết mật mã.
- Không log dữ liệu cá nhân, token hay toàn bộ body request. Mặc định che dữ liệu nhạy cảm.
- Giữ dependency được vá; không bỏ qua cảnh báo audit mà không ghi chú.
- Trả lỗi chung chung cho client; giữ stack trace và chi tiết nội bộ trong log server.

## 9. Git và pull request

- **Nhánh:** `feat/<chủ-đề>`, `fix/<chủ-đề>`, `chore/<chủ-đề>`, `refactor/<chủ-đề>`. Kèm mã ticket nếu team dùng.
- **Commit:** Conventional Commits - `type(scope): tóm tắt dạng mệnh lệnh`, dưới ~72 ký tự, phần thân giải thích lý do khi không hiển nhiên.
  - Type: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `build`, `ci`, `chore`.
  - Ví dụ: `fix(api): reject expired refresh tokens`
  - Đánh dấu thay đổi phá vỡ bằng `!` và footer `BREAKING CHANGE:`.
- **Một thay đổi logic cho mỗi commit và mỗi PR.** Không trộn refactor với thay đổi hành vi.
- **Mô tả PR:** làm gì và vì sao, đã test thế nào, ảnh chụp cho UI, ghi chú migrate/rollout, và danh sách thay đổi contract.
- Theo `git log` gần đây của repo nếu nó khác với ở trên.

## 10. Cấu hình và môi trường

- Cấu hình đến từ biến môi trường, được validate lúc khởi động. App phải từ chối chạy khi thiếu hoặc sai cấu hình, kèm lỗi nêu đúng tên biến.
- Duy trì `.env.example` cho mọi service: tên, mục đích và giá trị giả an toàn.
- Không rẽ nhánh `if (production)` theo môi trường trong logic nghiệp vụ; thay đổi hành vi qua cấu hình.
- Dùng cùng thiết lập container/runtime ở local và CI khi có thể.

## 11. Khả năng quan sát (observability)

- **Log có cấu trúc** (JSON) với level, timestamp, tên service và **request/correlation id** truyền qua Next.js -> NestJS -> Python bằng header (`x-request-id`).
- Log đúng mức: `error` cho lỗi cần chú ý, `warn` cho bất thường có thể phục hồi, `info` cho sự kiện vòng đời, `debug` cho chi tiết. Không log trong vòng lặp chặt.
- Cung cấp endpoint health cho từng service; thêm metrics và tracing ở chỗ repo đã có công cụ.

## 12. Cách giao tiếp khi làm việc

- Ưu tiên thay đổi nhỏ nhất giải quyết được vấn đề và nói rõ những gì bạn chọn không làm.
- Khi yêu cầu mơ hồ và cái giá của đoán sai cao, hỏi một câu tập trung; nếu không, nêu giả định của bạn rồi tiếp tục.
- Nói rõ sự không chắc chắn ("Tôi chưa chạy integration test vì...") thay vì tỏ ra chắc chắn hơn thực tế.
- Không bao giờ bịa lệnh, đường dẫn file, API hay tính năng thư viện. Nếu không chắc cái gì đó có tồn tại, hãy kiểm tra code hoặc package đã cài, hoặc nói là không chắc.
