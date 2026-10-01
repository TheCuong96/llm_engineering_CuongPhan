# Prompt tạo CLAUDE.md cho Next.js, NestJS, Python và MongoDB

Bạn là một kỹ sư fullstack cấp cao đang làm quen với codebase này. Hãy khảo sát kỹ dự án và tạo một file `CLAUDE.md` chất lượng cao tại thư mục gốc của repository. File này sẽ được tải trong mọi phiên Claude Code sau này, vì vậy nội dung phải chính xác, súc tích và thực sự hữu ích.

Stack đã biết: Next.js (frontend), NestJS (backend API), Python (service/worker/script, vai trò cần xác định), MongoDB (database). Hãy xác minh tất cả thông tin này từ code; không được mặc định là đúng.

## Giai đoạn 1: Khảo sát (chỉ đọc, chưa viết bất kỳ nội dung nào)

1. Thư mục gốc: README, cấu hình workspace (`pnpm-workspace.yaml` / `turbo.json` / `nx.json` / `lerna.json` / workspaces trong `package.json`), Dockerfile, `docker-compose*`, các file `.env.example`, Makefile, cấu hình CI (ví dụ `.github/workflows`), cấu hình lint/format (eslint, prettier, ruff, black, mypy, editorconfig, tsconfig).
2. Bố cục repo: monorepo hay nhiều repo? Liệt kê mọi app/service/package và mục đích của chúng. Xác định package manager đang dùng (npm/pnpm/yarn, pip/poetry/uv/pipenv) và phiên bản Node/Python (`.nvmrc`, `.python-version`, `engines`, pyproject).
3. Next.js: phiên bản, App Router hay Pages Router (hoặc cả hai), cách dùng Server/Client Components, Server Actions, chiến lược lấy dữ liệu và caching, cách gọi backend (fetch wrapper, axios, client được sinh tự động, react-query/SWR), xử lý auth (NextAuth/cookie/JWT, `middleware.ts`), quản lý trạng thái, hệ thống styling (Tailwind/CSS modules/UI library), quy ước biến môi trường (`NEXT_PUBLIC_*`), quy ước thư mục.
4. NestJS: cấu trúc module, phân lớp controller/service/repository, DTO và validation (class-validator/zod), guard/interceptor/pipe/filter, cơ chế auth, quản lý cấu hình (`@nestjs/config`), logging, định dạng lỗi trả về, tài liệu API (Swagger), queue/event/scheduler nếu có, cách giao tiếp với Python service (HTTP, message queue, gRPC, child process, shared DB).
5. Python: xác định vai trò chính xác. Framework (FastAPI/Flask/Django/Celery/script thuần), entry point, quản lý dependency và virtualenv, công cụ typing/lint, async hay sync, ai/khu vực nào kích hoạt nó, cách nhận input và trả output, thư viện ML/AI/data và các file model nếu có.
6. MongoDB: mỗi service truy cập DB bằng cách nào (Mongoose / `@nestjs/mongoose` / Typegoose / PyMongo / Motor / Beanie / ODMantic). Tìm vị trí schema/model, index, quan hệ (embedded hay referenced), quy ước ID (ObjectId hay string), timestamp/soft-delete, cách migration, script seed. Ghi nhận Node và Python có dùng chung collection không và xử lý lệch schema giữa chúng như thế nào.
7. Contract giữa các service: shared type, OpenAPI spec, client được sinh tự động, biến môi trường dùng chung, port, URL service, xác thực giữa các service.
8. Kiểm thử: Jest/Vitest/Playwright/Cypress cho JS/TS, pytest cho Python; vị trí test, cách chạy toàn bộ test và test đơn lẻ theo service, quy ước mocking, chiến lược test DB (`mongodb-memory-server`, testcontainers, Docker).
9. Chọn 3-5 file tiêu biểu cho mỗi service (ưu tiên file mới sửa gần đây, kiểm tra `git log`) để nhận diện quy ước thực tế: cách đặt tên, import, xử lý lỗi, tổ chức file.
10. Kiểm tra sơ lược `git log` để nhận diện quy ước commit và đặt tên nhánh.
11. Nếu đã có `CLAUDE.md`, hãy đọc trước và giữ lại nội dung vẫn còn đúng. Cập nhật thay vì ghi đè.

## Giai đoạn 2: Xác minh

- Mọi lệnh trong file phải truy ra được script/target/cấu hình thực tế trong repo. Không tự nghĩ ra lệnh.
- Nếu an toàn, hãy chạy lệnh chỉ đọc hoặc không phá hoại để xác nhận hoạt động (lint, type-check, một test cụ thể, `--help`). TUYỆT ĐỐI KHÔNG chạy lệnh có thể chạm vào database thật, chạy migration, seed dữ liệu, deploy hoặc xóa dữ liệu.
- Nếu không thể xác định điều gì từ code, hãy ghi `TODO: confirm with team` thay vì đoán.

## Giai đoạn 3: Viết `CLAUDE.md`

Dùng cấu trúc sau (bỏ qua mục không áp dụng):

<!-- markdownlint-disable-next-line MD025 -->
# <Tên dự án>

Một hoặc hai câu mô tả sản phẩm làm gì và ai sử dụng.

## Tech Stack

Liệt kê theo từng service: Next.js (phiên bản, loại router), NestJS (phiên bản), Python (phiên bản, framework), MongoDB (phiên bản, ODM/driver), cùng thư viện và hạ tầng chính.

## Project Structure

Cây thư mục ngắn gọn, có chú thích cho các thư mục quan trọng, nhóm theo service.

## Common Commands

Dùng code block, nhóm theo service; ghi lệnh chính xác cho: cài đặt, dev, build, lint, format, type-check, chạy toàn bộ test, chạy một test, khởi động MongoDB/dependency bằng Docker, seed/migrate (chỉ ghi tài liệu, đánh dấu “không chạy nếu chưa được hỏi”).

## Architecture & Key Patterns

- Luồng request: browser -> Next.js -> NestJS -> MongoDB, và Python được gọi ở đâu/bằng cách nào.
- Business logic nằm ở đâu trong từng service.
- Luồng auth xuyên suốt hệ thống.
- API contract: type/schema được chia sẻ hoặc đồng bộ giữa Next.js, NestJS và Python như thế nào.
Chỉ nêu những điểm không hiển nhiên.

## Code Conventions

Tách các mục nhỏ cho TypeScript (Next.js và NestJS) và Python. Chỉ nêu những quy ước thực sự quan sát được, khác với mặc định: cách đặt tên, import, xử lý lỗi, định dạng response API, logging, mức độ nghiêm ngặt của typing.

## Database (MongoDB)

Vị trí schema, quy ước ID/timestamp, chính sách index, quy tắc embedded/reference, cách thêm hoặc thay đổi schema an toàn, quy trình migration, cách giữ nhất quán khi Node và Python cùng sửa một collection.

## Testing

Vị trí test theo từng service, cách viết test mới, nội dung cần mock, phương thức dùng test DB, các bước bắt buộc phải qua trước khi hoàn tất thay đổi.

## Environment & Configuration

Các biến môi trường bắt buộc theo từng service (chỉ tên và mục đích, KHÔNG BAO GIỜ ghi giá trị hoặc secret), các bước thiết lập local, port và dịch vụ bên ngoài.

## Git & Workflow

Quy ước đặt tên nhánh, định dạng commit, yêu cầu PR, các bước CI bắt buộc.

## Gotchas & Pitfalls

Các bẫy không hiển nhiên: file được sinh tự động, lỗi thường gặp giữa Server/Client Component, sai khác ObjectId/string, lệch schema Node/Python, thứ tự thiết lập phụ thuộc nhau, test chập chờn, khu vực cũ, những điều trông có vẻ sai nhưng thực ra là chủ ý.

## Rules for Claude

Các quy tắc ngắn, mệnh lệnh, dành riêng cho repo này. Ví dụ:

- Chạy type-check/lint cho service vừa sửa trước khi hoàn tất.
- Không sửa file được sinh tự động.
- Hỏi trước khi thêm dependency, thay đổi schema/index hoặc đụng đến contract dùng chung.
- Khi thay đổi API shape, cập nhật mọi consumer (Next.js, NestJS, Python).

## Quy tắc viết

- Mục tiêu dưới 200 dòng. Mỗi dòng đều phải có ích.
- Cụ thể, rõ ràng; bỏ những điều đúng với mọi dự án.
- Không liệt kê những điều có thể dễ dàng biết bằng cách đọc file.
- Dùng gạch đầu dòng dễ quét, ở thể mệnh lệnh; dùng code block cho lệnh và đường dẫn.
- Không đưa secret, token, thông tin xác thực hoặc URL riêng tư vào file.
- Vì đây là repo đa ngôn ngữ, chỉ đặt quy tắc chung/toàn cục và quy tắc liên service trong file gốc. Đề xuất (nhưng KHÔNG tạo nếu chưa được tôi xác nhận) các file `CLAUDE.md` lồng nhau cho app/service có quy ước riêng (ví dụ app Next.js, API NestJS, Python service).
- Viết file bằng tiếng Anh.

## Giai đoạn 4: Báo cáo

Sau khi viết file, hãy cung cấp:

1. Tóm tắt ngắn những gì đã tìm thấy (stack, kiến trúc, cách các service giao tiếp) trong 3-5 dòng.
2. Mọi nội dung được đánh dấu TODO hoặc còn chưa chắc chắn.
3. Những điểm không nhất quán trong repo (lệnh README hỏng, tài liệu lỗi thời, schema Node/Python không khớp, phiên bản không đồng nhất).
4. Đề xuất các file `CLAUDE.md` lồng nhau, kèm một dòng mô tả nội dung của mỗi file.

Bắt đầu với Giai đoạn 1.
