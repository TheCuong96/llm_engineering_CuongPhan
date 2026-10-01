---
name: project-standards
description: Tiêu chuẩn kỹ thuật toàn dự án cho codebase fullstack đa ngôn ngữ (Next.js frontend, NestJS backend, Python service, MongoDB). Định nghĩa quy trình làm việc, tiêu chí hoàn tất, quy ước git và PR, quy tắc API contract, nền tảng bảo mật, chính sách kiểm thử và trường hợp cần hỏi trước khi thực hiện. Dùng skill này khi bắt đầu MỌI tác vụ trong repository - viết, review, refactor, debug hoặc lập kế hoạch - kể cả khi người dùng không nhắc tiêu chuẩn hay convention. Skill này cũng điều hướng đến các skill chuyên biệt (frontend-standards, backend-standards, nextjs-standards, nestjs-standards, python-standards).
---

# Tiêu chuẩn dự án

Đây là nền tảng cần áp dụng cho mọi tác vụ trong repository. Skill chuyên biệt bổ sung chi tiết theo từng khu vực; nếu có xung đột, quy tắc cụ thể hơn được ưu tiên. Nếu quy tắc mâu thuẫn với hành vi rõ ràng của code hiện có, hãy làm theo code hiện có và nêu chênh lệch thay vì âm thầm "sửa".

## 1. Tổng quan stack

| Khu vực | Công nghệ | Skill cần nạp |
| --- | --- | --- |
| Web UI | Next.js (React, TypeScript) | `frontend-standards` + `nextjs-standards` |
| API | NestJS (TypeScript) | `backend-standards` + `nestjs-standards` |
| Service / worker | Python | `backend-standards` + `python-standards` |
| Database | MongoDB | `backend-standards` (mục Database) |

Hãy nạp mọi skill phù hợp với các file sắp sửa. Thay đổi đi qua nhiều service (ví dụ thêm API field được UI dùng) cần tất cả skill liên quan, cùng mục 5 bên dưới.

Version luôn thay đổi. Trước khi dùng tính năng framework, xác nhận version đang cài trong `package.json` / `pyproject.toml` và viết code cho đúng version đó, không dựa vào version mình nhớ.

## 2. Quy trình làm việc

Áp dụng vòng lặp này cho mọi tác vụ không tầm thường. Phần lớn thời gian lãng phí là do code trước khi hiểu vấn đề.

1. **Tìm hiểu.** Đọc code, test và tài liệu liên quan trước. Tìm feature tương tự trong repo và dùng làm mẫu. Không tự nghĩ pattern mới khi đã có pattern phù hợp.
2. **Lập kế hoạch.** Với thay đổi chạm hơn khoảng 3 file hoặc hơn một service, nêu kế hoạch ngắn (file, thứ tự, rủi ro) trước khi sửa. Chờ xác nhận nếu kế hoạch liên quan mục 7.
3. **Triển khai từng bước nhỏ.** Mỗi bước nên biên dịch và kiểm thử được. Ưu tiên vài diff nhỏ, tập trung thay vì một thay đổi diện rộng.
4. **Xác minh.** Chạy các bước trong Definition of Done. Không báo thành công chỉ vì nghĩ rằng code "chắc sẽ chạy".
5. **Báo cáo.** Tóm tắt nội dung thay đổi, phần đã xác minh, phần chưa thể xác minh và việc cần theo dõi. Nêu trung thực các khoảng trống.

## 3. Tiêu chí hoàn tất

Chỉ xem tác vụ hoàn tất khi mọi điều sau đúng với từng service đã sửa:

- Type-check thành công (`tsc --noEmit` cho TS, `mypy`/`pyright` theo cấu hình cho Python).
- Lint và format thành công với config riêng của repo. Không tắt rule inline để qua kiểm tra nếu không có lý do được ghi rõ.
- Test liên quan đều qua và hành vi mới có test mới (xem mục 6).
- Không có `console.log`, `print`, code bị comment hoặc TODO còn sót mà bạn vừa thêm.
- Không có secret, token hoặc dữ liệu cá nhân thật trong code, test, fixture hay log.
- Cập nhật tài liệu nếu thay public API, biến môi trường, command hoặc bước setup.
- Đã cập nhật mọi consumer của contract thay đổi (mục 5).

Nếu không thể chạy kiểm tra (thiếu tool, không có mạng, cần database thật), phải nói rõ, không được âm thầm bỏ qua.

## 4. Nguyên tắc code

- **Rõ ràng hơn khéo léo.** Code được đọc nhiều hơn được viết. Ưu tiên cách làm đơn giản, tường minh.
- **Tên mang ý nghĩa.** Dùng từ ngữ domain (`invoice`, `subscription`), không dùng từ mơ hồ (`data`, `info`, `manager`, `helper`). Boolean nên đọc như câu hỏi (`isActive`, `hasAccess`).
- **Đơn vị nhỏ.** Một function làm một việc; nếu cần mô tả bằng từ "và", hãy tách. File cứ lớn dần là dấu hiệu cần tách theo trách nhiệm, không theo số dòng.
- **Biểu diễn trạng thái không hợp lệ thành bất khả thi.** Dùng union type, enum và schema để mô hình hóa domain, thay vì rải runtime check.
- **Thất bại sớm và rõ** tại ranh giới (input, config, lời gọi ngoài); giữ phần bên trong đơn giản và đáng tin cậy.
- **Không lặp lại, nhưng đừng trừu tượng hóa quá sớm.** Chờ đến lần lặp thứ ba rồi trừu tượng hóa hành vi, không trừu tượng hóa sự giống nhau ngẫu nhiên về hình thức.
- Comment giải thích lý do, không giải thích điều hiển nhiên. Nếu comment mô tả code làm gì, hãy đổi tên hoặc cấu trúc lại.
- **Không để dead code.** Xóa code không dùng; git vẫn lưu lịch sử.
- **Hạn chế dependency.** Thêm package đồng nghĩa gánh thêm lỗi, kích thước, license và bề mặt bảo mật. Xem mục 7.

## 5. Contract liên service

Phần lớn bug production trong hệ thống đa ngôn ngữ xảy ra ở ranh giới. Hãy coi mọi cấu trúc dữ liệu dùng chung là contract.

- **Mỗi contract có một nguồn sự thật.** Ưu tiên OpenAPI (sinh từ NestJS) hoặc shared schema package. Sinh client type từ đó thay vì chép tay interface.
- **Khi thay contract**, cập nhật trong cùng change set: producer, mọi consumer (Next.js, NestJS, Python), test và tài liệu. Tìm toàn repo theo tên field trước khi kết luận đã xong.
- **Tương thích ngược.** Thêm field optional là an toàn. Xóa, đổi tên, đổi type hoặc ý nghĩa của field là breaking change và cần kế hoạch migration hoặc API versioning.
- **Định dạng thống nhất ở mọi nơi:**
  - Ngày giờ: chuỗi ISO 8601 UTC khi truyền qua mạng (`2026-03-15T08:30:00Z`); lưu thành kiểu date native trong MongoDB.
  - ID: string trên wire; chỉ dùng `ObjectId` bên trong code truy cập MongoDB. Không để UI thấy khác biệt tên `_id`; ánh xạ thành `id` tại API boundary.
  - Tiền: số nguyên đơn vị nhỏ nhất (cent/đồng) kèm currency code. Không dùng số thực.
  - Chữ hoa/thường: `camelCase` trong JSON body; `snake_case` bên trong Python, chuyển đổi tại boundary bằng Pydantic alias.
  - Enum: chuỗi `lowercase` hoặc `SCREAMING_SNAKE`, thống nhất giữa các service; không dùng magic number.
- **Error shape chuẩn** (mọi service trả cùng cấu trúc):

```json
{ "statusCode": 400, "error": "VALIDATION_FAILED", "message": "Human readable summary", "details": [{ "field": "email", "issue": "must be a valid email" }], "requestId": "..." }
```

- **MongoDB collection dùng chung.** Nếu nhiều service ghi cùng collection, phải ghi rõ owner. Quy tắc mặc định: mỗi collection chỉ có một service sở hữu quyền ghi; service khác chỉ đọc hoặc gọi API của service đó.

## 6. Chính sách kiểm thử

- Kiểm thử **hành vi**, không kiểm thử cách triển khai. Refactor giữ nguyên hành vi thì test không nên hỏng.
- Mỗi bug fix bắt đầu bằng test thất bại tái hiện bug.
- Hình tháp test: nhiều unit test nhanh cho logic, ít integration test hơn cho ranh giới (HTTP, DB), và ít E2E test hơn nữa cho hành trình người dùng quan trọng.
- Test phải xác định: không phụ thuộc giờ thực, randomness, network hoặc thứ tự test. Inject clock và ID generator.
- Dùng MongoDB thật (in-memory server hoặc container) cho repository test; mock driver không chứng minh được query đúng.
- Tên test mô tả hành vi: `rejects login when password is expired`, không đặt `test1`.
- Không xóa hoặc làm yếu test đang lỗi chỉ để build qua. Sửa code hoặc giải thích vì sao test sai.

## 7. Hỏi trước khi thực hiện

Dừng lại và hỏi người dùng trước nếu tác vụ sẽ:

- Thêm, xóa hoặc nâng cấp dependency (đặc biệt là major version).
- Thay schema database, index hoặc collection ownership; chạy migration/seed trên database không phải local.
- Thay public API contract hoặc logic auth/permission.
- Xóa file/dữ liệu, viết lại git history, force-push hoặc sửa CI/CD, hạ tầng hay cấu hình deploy.
- Đụng tới xử lý thanh toán, dữ liệu cá nhân hoặc credential.
- Mở rộng phạm vi đáng kể ngoài yêu cầu (refactor "tiện tay").

Không bao giờ chạy lệnh phá hoại trên tài nguyên dùng chung hoặc production. Giả định mọi connection string tìm được đều có thể trỏ tới dữ liệu thật.

## 8. Nền tảng bảo mật

- Coi mọi input là không đáng tin: validation type, cấu trúc, độ dài và khoảng giá trị ở mọi boundary, luôn ở server kể cả khi client đã validation.
- Xác thực mọi endpoint không công khai và **phân quyền cho từng resource** (user này có được chạm bản ghi này không?), không chỉ kiểm tra role.
- Secret đặt trong environment variable hoặc secret manager. Không commit, không log, không đặt trong biến `NEXT_PUBLIC_*`.
- Dùng query có kiểu/parameter. Với MongoDB, không đưa raw request body vào filter; whitelist field và từ chối operator key (`$where`, `$ne`, `$gt`) từ user để ngăn NoSQL injection.
- Hash password bằng thuật toán hiện đại (argon2id hoặc bcrypt với cost hợp lý). Không tự viết crypto.
- Không log dữ liệu cá nhân, token hoặc toàn bộ request body. Mặc định redact.
- Cập nhật dependency; không bỏ qua audit finding nếu không ghi chú.
- Trả lỗi chung chung cho client; chỉ lưu stack trace và thông tin nội bộ trong server log.

## 9. Git và pull request

- **Branch:** `feat/<short-topic>`, `fix/<short-topic>`, `chore/<short-topic>`, `refactor/<short-topic>`. Thêm ticket id nếu team có dùng.
- **Commit:** Conventional Commits - `type(scope): imperative summary`, phần summary dưới khoảng 72 ký tự; body giải thích lý do nếu không hiển nhiên.
  - Type: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `build`, `ci`, `chore`.
  - Ví dụ: `fix(api): reject expired refresh tokens`
  - Đánh dấu breaking change bằng `!` và footer `BREAKING CHANGE:`.
- **Mỗi commit và PR chỉ nên có một thay đổi logic.** Không trộn refactor với thay đổi hành vi.
- **Mô tả PR:** nội dung và lý do, cách đã test, screenshot cho UI, ghi chú migration/rollout và danh sách contract thay đổi.
- Nếu `git log` gần đây của repo khác với quy tắc trên, làm theo lịch sử repo.

## 10. Cấu hình và môi trường

- Đọc config từ environment variable và validation khi khởi động. App phải từ chối khởi động nếu thiếu hoặc sai định dạng config, đồng thời nêu tên biến.
- Duy trì `.env.example` cho từng service: chỉ tên, mục đích và giá trị giả an toàn.
- Không dùng nhánh `if (production)` theo môi trường trong business logic; thay đổi hành vi qua config.
- Khi có thể, dùng cùng container/runtime setup ở local và CI.

## 11. Khả năng quan sát

- **Structured log** (JSON) gồm level, timestamp, tên service và **request/correlation id** được truyền xuyên Next.js -> NestJS -> Python qua header (`x-request-id`).
- Dùng đúng log level: `error` cho lỗi cần xử lý, `warn` cho tình huống bất thường có thể phục hồi, `info` cho sự kiện vòng đời, `debug` cho chi tiết. Không log bên trong vòng lặp nóng.
- Expose health endpoint cho mỗi service; thêm metric và tracing hook nếu repo đã có.

## 12. Cách giao tiếp khi làm việc

- Ưu tiên thay đổi nhỏ nhất giải quyết được vấn đề và nói rõ điều đã chọn không làm.
- Khi yêu cầu mơ hồ và đoán sai có chi phí cao, hỏi một câu tập trung; nếu không, nêu giả định rồi tiếp tục.
- Nêu rõ điều chưa chắc chắn ("Tôi chưa chạy integration test vì...") thay vì thể hiện tự tin quá mức.
- Không bịa command, đường dẫn file, API hoặc tính năng thư viện. Nếu không chắc có tồn tại, hãy kiểm tra code/package đã cài hoặc nói rõ là chưa chắc.
