# Prompt tạo CLAUDE.md cho repository

Bạn là một kỹ sư fullstack cấp cao đang làm quen với codebase này. Nhiệm vụ của bạn là khảo sát kỹ dự án và tạo một file `CLAUDE.md` chất lượng cao tại thư mục gốc của repository. File này sẽ được tải trong mọi phiên Claude Code sau này, vì vậy nội dung phải chính xác, súc tích và thực sự hữu ích.

## Giai đoạn 1: Khảo sát (chưa viết bất kỳ nội dung nào)

Hãy kiểm tra repository theo thứ tự sau, chỉ sử dụng công cụ chỉ đọc:

1. Các file ở thư mục gốc: README, `package.json` / `pyproject.toml` / `go.mod` / `pom.xml` / `Cargo.toml` / `composer.json`, lockfile, Makefile, Dockerfile, docker-compose, `.env.example`, cấu hình CI (`.github/workflows`, `.gitlab-ci.yml`), cấu hình lint/format (eslint, prettier, ruff, editorconfig, tsconfig).
2. Cấu trúc thư mục (sâu 2-3 cấp). Xác định đây có phải monorepo không và mục đích của từng ứng dụng/package.
3. Frontend: framework, routing, quản lý trạng thái, hệ thống styling, quy ước component, lớp gọi API.
4. Backend: framework, entry point, phân lớp (controller/service/repository hoặc tương tự), cơ chế xác thực, xử lý lỗi, validation, logging.
5. Cơ sở dữ liệu: hệ quản trị, ORM/query builder, công cụ và vị trí migration, dữ liệu seed, quy ước đặt tên.
6. Kiểm thử: framework, vị trí test, cách chạy toàn bộ test/một test, quy ước mocking.
7. Chọn 3-5 file mã nguồn tiêu biểu cho mỗi khu vực chính để nhận diện quy ước thực tế (đặt tên, import, xử lý lỗi, tổ chức file). Ưu tiên file mới được sửa gần đây (kiểm tra `git log`) thay vì file cũ.
8. Kiểm tra sơ lược `git log` để nhận diện quy ước thông điệp commit và cách đặt tên nhánh.
9. Nếu đã có `CLAUDE.md`, hãy đọc trước và giữ lại nội dung vẫn còn đúng. Cập nhật thay vì ghi đè.

## Giai đoạn 2: Xác minh

- Mọi lệnh ghi trong file phải truy ra được script/target/cấu hình thực tế trong repo. Không tự nghĩ ra lệnh. Nếu có thể chạy an toàn (ví dụ lint, type-check, một test cụ thể) để xác nhận lệnh hoạt động, hãy chạy. Không bao giờ chạy lệnh phá hoại (migration trên DB thật, deploy, xóa dữ liệu).
- Nếu không thể xác định điều gì từ mã nguồn, hãy ghi `TODO: confirm with team` thay vì đoán.

## Giai đoạn 3: Viết `CLAUDE.md`

Dùng cấu trúc sau (bỏ qua mục không áp dụng):

<!-- markdownlint-disable-next-line MD025 -->
# <Tên dự án>

Một hoặc hai câu mô tả sản phẩm làm gì và ai sử dụng.

## Tech Stack

Danh sách gạch đầu dòng, kèm phiên bản khi phù hợp (frontend, backend, database, hạ tầng, thư viện chính).

## Project Structure

Cây thư mục ngắn gọn, có chú thích cho các thư mục quan trọng. Nêu mục đích, không cần liệt kê mọi file.

## Common Commands

Các lệnh chính xác cho: cài đặt, dev server (frontend/backend), build, lint, format, type-check, chạy toàn bộ test, chạy một test, DB migrate, DB seed, Docker. Đặt trong code block.

## Architecture & Key Patterns

Cách các lớp kết nối với nhau, luồng request từ UI đến DB, nơi đặt business logic, cách xác thực hoạt động, cách chia sẻ hoặc xác thực API contract. Chỉ nêu những điểm không hiển nhiên.

## Code Conventions

Quy ước đặt tên, tổ chức file, thứ tự import, xử lý lỗi, định dạng response API, logging, comment. Chỉ nêu những quy ước thực sự quan sát được và khác với mặc định của ngôn ngữ/framework.

## Testing

Vị trí test, cách viết test mới, những gì cần mock, yêu cầu tối thiểu trước khi xem một thay đổi là hoàn tất.

## Environment & Configuration

Các biến môi trường bắt buộc (chỉ tên và mục đích, KHÔNG BAO GIỜ ghi giá trị hoặc secret), cách thiết lập môi trường local, dịch vụ bên ngoài cần có.

## Git & Workflow

Quy ước đặt tên nhánh, định dạng commit, yêu cầu PR, các bước CI bắt buộc phải qua.

## Gotchas & Pitfalls

Các bẫy không hiển nhiên: file được sinh tự động không nên sửa tay, thứ tự thiết lập phụ thuộc lẫn nhau, test chập chờn đã biết, khu vực cũ cần tránh sửa, những điều trông có vẻ sai nhưng thực ra là chủ ý.

## Rules for Claude

Các quy tắc ngắn, mệnh lệnh, dành riêng cho repo này (ví dụ: “Luôn chạy type-check sau khi sửa TypeScript”, “Không sửa file trong `/generated`”, “Hỏi trước khi thêm dependency”).

## Quy tắc viết

- Súc tích: mục tiêu dưới 200 dòng. Mỗi dòng đều phải có ích.
- Ưu tiên thông tin cụ thể, rõ ràng thay vì lời khuyên chung chung. Bỏ những điều đúng với mọi dự án (ví dụ: “viết code sạch”).
- Không lặp lại những điều có thể dễ dàng biết bằng cách đọc file (ví dụ: không liệt kê mọi component).
- Dùng các gạch đầu dòng dễ quét, ở thể mệnh lệnh. Dùng code block cho lệnh và đường dẫn.
- Không bao giờ đưa secret, token, thông tin xác thực hoặc URL thật của hệ thống riêng tư vào file.
- Nếu đây là monorepo, đặt quy tắc dùng chung/toàn cục trong `CLAUDE.md` gốc và đề xuất (nhưng không tạo nếu chưa được tôi xác nhận) các file `CLAUDE.md` lồng nhau cho package có quy ước riêng.
- Viết file bằng tiếng Anh.

## Giai đoạn 4: Báo cáo

Sau khi viết file, hãy cung cấp:

1. Tóm tắt ngắn những gì đã tìm thấy (stack, kiến trúc trong 3-5 dòng).
2. Danh sách mọi nội dung được đánh dấu TODO hoặc còn chưa chắc chắn để tôi bổ sung.
3. Những điểm không nhất quán bạn nhận thấy trong repo (ví dụ: lệnh README không còn chạy được, tài liệu lỗi thời).
4. Đề xuất file `CLAUDE.md` lồng nhau hoặc cải tiến khác nếu phù hợp.

Bắt đầu với Giai đoạn 1.
