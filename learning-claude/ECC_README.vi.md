# Everything Claude Code dành cho Kiro

Đưa quy trình công việc [Everything Claude Code](https://github.com/anthropics/courses/tree/master/everything-claude-code) (ECC) vào [Kiro](https://kiro.dev). Kho lưu trữ này cung cấp các tác nhân, kỹ năng, hook, tệp điều khiển và tập lệnh tùy chỉnh có thể được cài đặt vào bất kỳ dự án Kiro nào chỉ bằng một lệnh duy nhất.

## Bắt đầu nhanh

```bash
# Chuyển đến thư mục .kiro
cd .kiro

# Cài đặt vào dự án của bạn
./install.sh /path/to/your/project

# Hoặc cài đặt vào thư mục hiện tại
./install.sh

# Hoặc cài đặt toàn cầu (áp dụng cho tất cả dự án Kiro)
./install.sh ~
```

Trình cài đặt sử dụng bản sao không phá hủy — nó sẽ không ghi đè lên các tệp hiện có của bạn.

## Kho thành phần

| Thành phần | Đếm | Vị trí |
|-----------|-------|----------|
| Tác nhân (JSON) | 33 | `.kiro/agents/*.json` |
| Tác nhân (MD) | 33 | `.kiro/agents/*.md` |
| Kỹ năng | 43 | `.kiro/skills/*/SKILL.md` |
| Tập tin chỉ đạo | 22 | `.kiro/steering/*.md` |
| Móc IDE | 13 | `.kiro/hooks/*.kiro.hook` |
| Kịch bản | 2 | `.kiro/scripts/*.sh` |
| Ví dụ MCP | 1 | `.kiro/settings/mcp.json.example` |
| Tài liệu | 5 | `docs/*.md` |

## Những gì được bao gồm

### Tác nhân

Tác nhân là những trợ lý AI chuyên biệt với cấu hình công cụ cụ thể.

**Định dạng:**
- **IDE**: Tệp đánh dấu (`.md`) - Truy cập thông qua lựa chọn tự động hoặc lệnh gọi rõ ràng
- **CLI**: Tệp JSON (`.json`) - Truy cập thông qua lệnh `/agent swap`

Cả hai định dạng đều được bao gồm để có khả năng tương thích tối đa.

> **Lưu ý:** Mô hình của tác nhân được xác định theo lựa chọn mô hình hiện tại của bạn trong Kiro, không phải theo cấu hình tác nhân.

| Tác nhân | Mô tả |
|-------|-------------|
| `planner` | Chuyên gia lập kế hoạch chuyên nghiệp cho các tính năng phức tạp và tái cấu trúc. Công cụ chỉ đọc để phân tích an toàn. |
| `code-reviewer` | Người đánh giá mã cao cấp đảm bảo chất lượng và bảo mật. Đánh giá mã về các vấn đề bảo mật QUAN TRỌNG, chất lượng mã, mẫu React/Next.js và hiệu suất. |
| `tdd-guide` | Chuyên gia phát triển dựa trên thử nghiệm thực thi phương pháp viết thử nghiệm đầu tiên. Đảm bảo phạm vi kiểm tra trên 80% với bộ kiểm tra toàn diện. |
| `security-reviewer` | Chuyên gia phát hiện và khắc phục lỗ hổng bảo mật. Gắn cờ bí mật, SSRF, nội dung, mật mã không an toàn và 10 lỗ hổng hàng đầu của OWASP. |
| `architect` | Chuyên gia kiến ​​trúc phần mềm về thiết kế hệ thống, khả năng mở rộng và ra quyết định kỹ thuật. Công cụ chỉ đọc để phân tích an toàn. |
| `build-error-resolver` | Chuyên gia giải quyết lỗi Build và TypeScript. Sửa lỗi xây dựng/loại với sự khác biệt tối thiểu, không có thay đổi về kiến ​​trúc. |
| `doc-updater` | Chuyên gia về tài liệu và bản đồ mã. Cập nhật sơ đồ mã và tài liệu, tạo tài liệu/CODEMAPS/*, cập nhật README. |
| `refactor-cleaner` | Chuyên gia dọn dẹp và hợp nhất mã chết. Loại bỏ mã không sử dụng, mã trùng lặp và mã tái cấu trúc một cách an toàn. |
| `go-reviewer` | Chuyên gia đánh giá mã Go. Đánh giá mã Go về các mẫu thành ngữ, xử lý lỗi, tính đồng thời và hiệu suất. |
| `python-reviewer` | Chuyên gia đánh giá mã Python. Đánh giá mã Python cho PEP 8, gợi ý nhập, xử lý lỗi và các phương pháp hay nhất. |
| `typescript-reviewer` | Trình đánh giá mã TypeScript/JavaScript. An toàn khi nhập, độ chính xác không đồng bộ, bảo mật nút/web và các mẫu thành ngữ. |
| `rust-reviewer` | Người đánh giá mã Rust. Quyền sở hữu, thời gian tồn tại, xử lý lỗi, sử dụng không an toàn và các mẫu thành ngữ. |
| `rust-build-resolver` | Chuyên gia giải quyết lỗi xây dựng Rust/Cargo. Sửa các lỗi biên dịch, phụ thuộc và liên kết. |
| `kotlin-reviewer` | Người đánh giá mã Kotlin/Android/KMP. Sự an toàn của Coroutine, các phương pháp hay nhất về Compose, kiến ​​trúc rõ ràng. |
| `kotlin-build-resolver` | Chuyên gia giải quyết lỗi xây dựng Kotlin/Gradle. Sửa lỗi Gradle, KSP và lỗi phụ thuộc. |
| `java-reviewer` | Trình đánh giá mã Java/Spring Boot/Quarkus. Mô hình doanh nghiệp, bảo mật và hiệu suất. |
| `java-build-resolver` | Chuyên gia giải quyết lỗi xây dựng Java/Maven/Gradle. Sửa lỗi biên dịch và phụ thuộc. |
| `cpp-reviewer` | Người đánh giá mã C++. An toàn bộ nhớ, C++, RAII hiện đại và các mẫu hiệu suất. |
| `cpp-build-resolver` | Chuyên gia giải quyết lỗi xây dựng C++/CMake. Sửa lỗi biên dịch, liên kết và CMake. |
| `django-reviewer` | Người đánh giá mã Django. Các mẫu ORM, DRF, di chuyển và bảo mật Django. |
| `swift-reviewer` | Người đánh giá mã Swift. Đồng thời, ARC, giao thức và mẫu SwiftUI. |
| `fsharp-reviewer` | Trình đánh giá mã chức năng F #. Tính bất biến, khớp mẫu và thiết kế theo kiểu. |
| `react-reviewer` | Người đánh giá mã React. Các mẫu thành phần, hook, hiệu suất và khả năng tiếp cận. |
| `react-build-resolver` | Chuyên gia giải quyết lỗi xây dựng React/Next.js. Sửa các lỗi về gói, SSR và hydrat hóa. |
| `pytorch-build-resolver` | Chuyên gia giải quyết lỗi thời gian chạy PyTorch/CUDA/đào tạo. |
| `mle-reviewer` | Người đánh giá kỹ thuật ML sản xuất. Quy trình, đánh giá, cung cấp, giám sát và khôi phục. |
| `performance-optimizer` | Chuyên gia phân tích và tối ưu hóa hiệu suất. Lập hồ sơ, phát hiện nút cổ chai và điều chỉnh. |
| `database-reviewer` | Chuyên gia về cơ sở dữ liệu và SQL. Đánh giá thiết kế lược đồ, truy vấn, di chuyển và bảo mật cơ sở dữ liệu. |
| `e2e-runner` | Chuyên gia kiểm tra đầu cuối. Tạo và duy trì các bài kiểm tra E2E bằng Playwright hoặc Cypress. |
| `harness-optimizer` | Chuyên gia tối ưu hóa khai thác thử nghiệm. Cải thiện hiệu suất kiểm tra, độ tin cậy và khả năng bảo trì. |
| `loop-operator` | Toán tử vòng lặp xác minh. Chạy kiểm tra toàn diện và lặp lại cho đến khi tất cả đều đạt. |
| `chief-of-staff` | Trợ lý điều hành về quản lý dự án, điều phối và lập kế hoạch chiến lược. |
| `go-build-resolver` | Đi xây dựng chuyên gia giải quyết lỗi. Sửa lỗi biên dịch Go, sự cố phụ thuộc và sự cố xây dựng. |

**Cách sử dụng trong IDE:**
- Bạn có thể điều hành một tác nhân trong `/` trong phiên Kiro, ví dụ: `/code-reviewer`.
- Phiên Spec của Kiro có người lập kế hoạch, nhà thiết kế và kiến ​​trúc sư gốc có thể được sử dụng thay cho các tác nhân `planner` và `architect`.

**Cách sử dụng trong CLI:**
1. Bắt đầu một phiên trò chuyện
2. Gõ `/agent swap` để xem các tác nhân có sẵn
3. Chọn một tác nhân để chuyển đổi (ví dụ: `code-reviewer` sau khi viết mã)
4. Hoặc bắt đầu với một tác nhân cụ thể: `kiro-cli --agent planner`


### Kỹ năng

Kỹ năng là quy trình công việc theo yêu cầu có thể được yêu cầu thông qua menu `/` trong trò chuyện.

| Kỹ năng | Mô tả |
|-------|-------------|
| `tdd-workflow` | Thực thi phát triển dựa trên thử nghiệm với phạm vi bao phủ hơn 80% bao gồm các thử nghiệm đơn vị, tích hợp và E2E. Sử dụng khi viết tính năng mới hoặc sửa lỗi. |
| `coding-standards` | Các tiêu chuẩn mã hóa phổ biến và các phương pháp hay nhất cho TypeScript, JavaScript, React và Node.js. Sử dụng khi bắt đầu dự án, xem lại mã hoặc tái cấu trúc. |
| `security-review` | Danh sách kiểm tra và mẫu bảo mật toàn diện. Sử dụng khi thêm xác thực, xử lý thông tin đầu vào của người dùng, tạo điểm cuối API hoặc làm việc với các bí mật. |
| `verification-loop` | Hệ thống xác minh toàn diện chạy bản dựng, kiểm tra loại, tìm lỗi mã nguồn, kiểm tra, quét bảo mật và đánh giá khác biệt. Sử dụng sau khi hoàn thành các tính năng hoặc trước khi tạo PR. |
| `api-design` | Các mẫu thiết kế API RESTful và các phương pháp hay nhất. Sử dụng khi thiết kế API mới hoặc tái cấu trúc các điểm cuối hiện có. |
| `frontend-patterns` | Các mẫu kiến ​​trúc React, Next.js và giao diện người dùng. Sử dụng khi xây dựng các thành phần giao diện người dùng hoặc tối ưu hóa hiệu suất giao diện người dùng. |
| `backend-patterns` | Các mẫu kiến ​​trúc Node.js, Express và phụ trợ. Sử dụng khi xây dựng API, dịch vụ hoặc cơ sở hạ tầng phụ trợ. |
| `e2e-testing` | Thử nghiệm toàn diện với Playwright hoặc Cypress. Sử dụng khi thêm các bài kiểm tra E2E hoặc cải thiện phạm vi kiểm tra. |
| `golang-patterns` | Các thành ngữ, mô hình đồng thời và các phương pháp hay nhất. Sử dụng khi viết mã Go hoặc xem xét các dự án Go. |
| `golang-testing` | Các mẫu kiểm thử Go với kiểm thử dạng bảng và benchmark. Sử dụng khi viết kiểm thử Go hoặc cải thiện độ bao phủ kiểm thử. |
| `python-patterns` | Thành ngữ Python, gợi ý gõ và các phương pháp hay nhất. Sử dụng khi viết mã Python hoặc xem xét các dự án Python. |
| `python-testing` | Thử nghiệm Python với pytest và phạm vi bảo hiểm. Sử dụng khi viết bài kiểm tra Python hoặc cải thiện phạm vi kiểm tra. |
| `database-migrations` | Thiết kế lược đồ cơ sở dữ liệu và các mẫu di chuyển. Sử dụng khi tạo di chuyển hoặc tái cấu trúc lược đồ cơ sở dữ liệu. |
| `postgres-patterns` | Các mẫu và tối ưu hóa dành riêng cho PostgreSQL. Sử dụng khi làm việc với cơ sở dữ liệu PostgreSQL. |
| `docker-patterns` | Thực hành tốt nhất về Docker và container hóa. Sử dụng khi tạo Dockerfiles hoặc tối ưu hóa việc xây dựng vùng chứa. |
| `deployment-patterns` | Chiến lược triển khai và mẫu CI/CD. Sử dụng khi thiết lập triển khai hoặc cải thiện quy trình CI/CD. |
| `search-first` | Phương pháp phát triển tìm kiếm đầu tiên. Sử dụng khi khám phá các cơ sở mã lạ hoặc các vấn đề gỡ lỗi. |
| `agentic-engineering` | Các mô hình và quy trình công nghệ phần mềm tác nhân. Sử dụng khi làm việc với các tác nhân AI hoặc xây dựng hệ thống tác nhân. |
| `rust-patterns` | Các mẫu Rust thành ngữ, quyền sở hữu, xử lý lỗi, đặc điểm và tính đồng thời. Sử dụng khi viết mã Rust. |
| `rust-testing` | Các mẫu thử nghiệm rỉ sét bao gồm đơn vị, tích hợp, không đồng bộ, thử nghiệm dựa trên thuộc tính và phạm vi bao phủ. |
| `kotlin-patterns` | Các mẫu Kotlin đặc trưng, ​​coroutine, an toàn null và trình tạo DSL. Sử dụng khi viết mã Kotlin. |
| `kotlin-testing` | Thử nghiệm Kotlin với Kotest, MockK, thử nghiệm coroutine và phạm vi bảo hiểm của Kover. |
| `java-coding-standards` | Tiêu chuẩn mã hóa Java cho dịch vụ Spring Boot và Quarkus. |
| `jpa-patterns` | Các mẫu JPA/Hibernate để thiết kế thực thể, các mối quan hệ và tối ưu hóa truy vấn. |
| `springboot-patterns` | Các mẫu kiến ​​trúc Spring Boot, thiết kế API REST và các dịch vụ phân lớp. |
| `springboot-security` | Các phương pháp hay nhất về Bảo mật mùa xuân dành cho xác thực/authz, xác thực và bí mật. |
| `django-patterns` | Các mẫu kiến ​​trúc Django, thiết kế API REST với DRF và các phương pháp hay nhất về ORM. |
| `django-security` | Các biện pháp thực hành tốt nhất về bảo mật, xác thực và ngăn chặn CSRF/XSS của Django. |
| `fastapi-patterns` | Các mẫu FastAPI cho API không đồng bộ, nội xạ phụ thuộc và mô hình Pydantic. |
| `nestjs-patterns` | Các mẫu kiến ​​trúc NestJS dành cho mô-đun, bộ điều khiển và nhà cung cấp. |
| `react-patterns` | Các mẫu React 18/19, bao gồm hook, thành phần máy chủ/máy khách và Suspense. |
| `react-testing` | Kiểm thử thành phần React với Testing Library, Vitest/Jest và MSW. |
| `nextjs-turbopack` | Các mẫu đóng gói gia tăng Next.js 16+ và Turbopack. |
| `cpp-coding-standards` | Các tiêu chuẩn mã hóa C++ dựa trên Nguyên tắc cốt lõi của C++. |
| `cpp-testing` | Thử nghiệm C++ với GoogleTest, CTest và bộ khử trùng. |
| `swift-actor-persistence` | Duy trì dữ liệu an toàn theo luồng trong Swift bằng cách sử dụng các tác nhân. |
| `swift-protocol-di-testing` | Nội dung phụ thuộc dựa trên giao thức cho mã Swift có thể kiểm tra được. |
| `mle-workflow` | Quy trình kỹ thuật ML sản xuất để đào tạo, đánh giá, triển khai và giám sát. |
| `pytorch-patterns` | Các mô hình học sâu PyTorch dành cho quy trình đào tạo và kiến ​​trúc mô hình. |
| `deep-research` | Nghiên cứu sâu đa nguồn với sự tổng hợp và phân bổ nguồn. |
| `strategic-compact` | Quản lý bối cảnh và đề xuất nén thủ công theo các khoảng thời gian hợp lý. |
| `autonomous-loops` | Các mẫu cho vòng lặp tác nhân tự trị - các đường dẫn tuần tự đến DAG đa tác nhân. |
| `content-hash-cache-pattern` | Bộ nhớ đệm xử lý tệp đắt tiền bằng cách sử dụng hàm băm nội dung SHA-256. |

**Cách sử dụng:**

1. Nhập `/` trong trò chuyện để mở menu kỹ năng
2. Chọn một kỹ năng (ví dụ: `tdd-workflow` khi bắt đầu một tính năng mới, `security-review` khi thêm xác thực)
3. Nhân viên sẽ hướng dẫn bạn quy trình làm việc với các hướng dẫn và danh sách kiểm tra cụ thể

**Lưu ý:** Để lập kế hoạch cho các tính năng phức tạp, hãy sử dụng tác nhân `planner` (xem phần Tác nhân ở trên).

### Tập tin chỉ đạo

Các tệp chỉ đạo cung cấp các quy tắc và bối cảnh luôn sẵn sàng giúp định hình cách tác nhân hoạt động với mã của bạn.

| Tập tin | Bao gồm | Mô tả |
|------|-----------|-------------|
| `coding-style.md` | tự động | Các quy tắc kiểu mã hóa cốt lõi: tính bất biến, tổ chức tệp, xử lý lỗi và tiêu chuẩn chất lượng mã. Được tải trong mọi cuộc trò chuyện. |
| `security.md` | tự động | Các phương pháp bảo mật tốt nhất bao gồm kiểm tra bắt buộc, quản lý bí mật và giao thức phản hồi bảo mật. Được tải trong mọi cuộc trò chuyện. |
| `testing.md` | tự động | Yêu cầu kiểm tra: phạm vi bao phủ tối thiểu 80%, quy trình làm việc TDD và các loại kiểm tra (đơn vị, tích hợp, E2E). Được tải trong mọi cuộc trò chuyện. |
| `development-workflow.md` | tự động | Quy trình phát triển, quy trình PR và mô hình hợp tác. Được tải trong mọi cuộc trò chuyện. |
| `git-workflow.md` | tự động | Các quy ước cam kết của Git, chiến lược phân nhánh và các phương pháp hay nhất về kiểm soát phiên bản. Được tải trong mọi cuộc trò chuyện. |
| `patterns.md` | tự động | Các mẫu thiết kế chung và nguyên tắc kiến ​​trúc. Được tải trong mọi cuộc trò chuyện. |
| `performance.md` | tự động | Hướng dẫn tối ưu hóa hiệu suất và chiến lược lập hồ sơ. Được tải trong mọi cuộc trò chuyện. |
| `lessons-learned.md` | tự động | Các mô hình và bài học cụ thể theo dự án. Chỉnh sửa tệp này để nắm bắt các quy ước của nhóm bạn. Được tải trong mọi cuộc trò chuyện. |
| `typescript-patterns.md` | fileMatch: `*.ts,*.tsx` | Các mẫu dành riêng cho TypeScript, an toàn về loại và các phương pháp hay nhất. Được tải khi chỉnh sửa tệp TypeScript. |
| `python-patterns.md` | fileMatch: `*.py` | Các mẫu dành riêng cho Python, gợi ý về loại và các phương pháp hay nhất. Được tải khi chỉnh sửa tệp Python. |
| `golang-patterns.md` | fileMatch: `*.go` | Các mô hình cụ thể, tính đồng thời và các phương pháp hay nhất. Được tải khi chỉnh sửa tệp Go. |
| `swift-patterns.md` | fileMatch: `*.swift` | Các mẫu dành riêng cho Swift và các phương pháp hay nhất. Được tải khi chỉnh sửa tệp Swift. |
| `rust-patterns.md` | fileMatch: `*.rs` | Quyền sở hữu rỉ sét, thời gian tồn tại, xử lý lỗi và các mẫu thành ngữ. Được tải khi chỉnh sửa tập tin Rust. |
| `kotlin-patterns.md` | fileMatch: `*.kt` | Các phương pháp hay nhất về coroutine, Compose và Android/KMP trong Kotlin. Được tải khi chỉnh sửa tệp Kotlin. |
| `java-patterns.md` | fileMatch: `*.java` | Các mẫu Java, Spring Boot và các phương pháp hay nhất dành cho doanh nghiệp. Được tải khi chỉnh sửa tệp Java. |
| `cpp-patterns.md` | fileMatch: `*.cpp,*.hpp,*.h,*.cc,*.cxx` | C++ RAII, con trỏ thông minh và mẫu C++ hiện đại. Được tải khi chỉnh sửa tệp C++. |
| `php-patterns.md` | fileMatch: `*.php` | Các mẫu PHP, Laravel và các phương pháp hay nhất về PHP hiện đại. Được tải khi chỉnh sửa tệp PHP. |
| `ruby-patterns.md` | fileMatch: `*.rb` | Các mẫu Ruby và các phương pháp hay nhất về Rails. Được tải khi chỉnh sửa tệp Ruby. |
| `typescript-security.md` | fileMatch: `*.ts,*.tsx` | Các mẫu bảo mật TypeScript. Được tải khi chỉnh sửa tệp TypeScript. |
| `dev-mode.md` | hướng dẫn sử dụng | Chế độ bối cảnh phát triển. Gọi với `#dev-mode` để tập trung phát triển. |
| `review-mode.md` | hướng dẫn sử dụng | Chế độ ngữ cảnh xem xét mã. Gọi với `#review-mode` để được đánh giá kỹ lưỡng. |
| `research-mode.md` | hướng dẫn sử dụng | Chế độ bối cảnh nghiên cứu. Gọi bằng `#research-mode` để khám phá và học hỏi. |

Các tệp chỉ đạo có bao gồm `auto` được tải tự động. Không cần thực hiện hành động nào — chúng sẽ áp dụng ngay khi bạn cài đặt.

Để tạo tệp của riêng bạn, hãy thêm tệp đánh dấu vào `.kiro/steering/` bằng bộ xử lý YAML:

```yaml
---
inclusion: auto        # tự động | tập tinMatch | thủ công
name: my-steering      # bắt buộc nếu việc đưa vào được tự động
description: Brief explanation of what this steering file contains
fileMatchPattern: "*.ts"  # bắt buộc nếu bao gồm là fileMatch
---

Your rules here...
```

### móc

Kiro hỗ trợ hai loại hook:

1. **IDE Hooks** - Tệp JSON độc lập trong `.kiro/hooks/` (dành cho Kiro IDE)
2. **CLI Hooks** - Được nhúng trong cấu hình tác nhân (dành cho `kiro-cli`)

#### Móc IDE (Tệp độc lập)

Các hook này xuất hiện trong bảng Agent Hooks trong Kiro IDE và có thể bật/tắt. Các tệp hook sử dụng phần mở rộng `.kiro.hook`.

| Móc | Kích hoạt | Hành động | Mô tả |
|------|---------|--------|-------------|
| `quality-gate` | Hướng dẫn sử dụng (`userTriggered`) | `runCommand` | Chạy bản dựng, kiểm tra kiểu, tìm lỗi mã nguồn và kiểm tra thông qua `quality-gate.sh`. Nhấp để kích hoạt kiểm tra chất lượng toàn diện. |
| `typecheck-on-edit` | Đã chỉnh sửa tệp (`*.ts`, `*.tsx`) | `askAgent` | Kiểm tra lỗi loại khi tệp TypeScript được chỉnh sửa để sớm phát hiện sự cố. |
| `console-log-check` | Đã chỉnh sửa tệp (`*.js`, `*.ts`, `*.tsx`) | `askAgent` | Kiểm tra các câu lệnh console.log để ngăn mã gỡ lỗi được thực hiện. |
| `tdd-reminder` | Tệp đã được tạo (`*.ts`, `*.tsx`) | `askAgent` | Nhắc bạn viết bài kiểm tra trước khi tạo tệp TypeScript mới. |
| `git-push-review` | Trước lệnh shell | `askAgent` | Xem lại các lệnh git push để đảm bảo chất lượng code trước khi push. |
| `code-review-on-write` | Sau thao tác ghi | `askAgent` | Kích hoạt xem xét mã sau khi sửa đổi tập tin. |
| `auto-format` | Đã chỉnh sửa tệp (`*.ts`, `*.tsx`, `*.js`) | `askAgent` | Kiểm tra các vấn đề về định dạng và sửa chúng nội tuyến mà không tạo ra thiết bị đầu cuối. |
| `extract-patterns` | Điểm dừng đại lý | `askAgent` | Đề xuất các mẫu để thêm vào lessons-learned.md sau khi hoàn thành công việc. |
| `session-summary` | Điểm dừng đại lý | `askAgent` | Cung cấp một bản tóm tắt công việc đã hoàn thành trong phiên. |
| `doc-file-warning` | Trước khi ghi thao tác | `askAgent` | Cảnh báo trước khi sửa đổi tệp tài liệu để đảm bảo những thay đổi có chủ ý. |
| `rust-check-on-edit` | Đã chỉnh sửa tệp (`*.rs`) | `askAgent` | Kiểm tra lỗi biên dịch, vấn đề về quyền sở hữu hoặc sự cố trọn đời trong tệp Rust. |
| `python-lint-on-edit` | Đã chỉnh sửa tệp (`*.py`) | `askAgent` | Kiểm tra lỗi loại, vi phạm PEP 8 hoặc các mẫu chống phổ biến trong tệp Python. |
| `security-check-on-create` | Tệp đã được tạo (`**/auth/**`, `**/api/**`, `**/middleware/**`) | `askAgent` | Chạy kiểm tra bảo mật nhanh khi tệp mới được tạo trong các thư mục nhạy cảm. |

**Định dạng móc IDE:**

```json
{
  "version": "1.0.0",
  "enabled": true,
  "name": "hook-name",
  "description": "Cái móc này làm gì",
  "when": {
    "type": "fileEdited",
    "patterns": ["*.ts"]
  },
  "then": {
    "type": "runCommand",
    "command": "npx tsc --noEmit"
  }
}
```

**Các trường bắt buộc:** `version`, `enabled`, `name`, `description`, `when`, `then`

**Các loại trình kích hoạt có sẵn:** `fileEdited`, `fileCreated`, `fileDeleted`, `userTriggered`, `promptSubmit`, `agentStop`, `preToolUse`, `postToolUse`

#### Móc CLI (Được nhúng trong Đại lý)

Móc CLI được nhúng trong các tệp cấu hình tác nhân để sử dụng với `kiro-cli`.

**Ví dụ:** Xem `.kiro/agents/tdd-guide-with-hooks.json` để biết tác nhân có móc nhúng.

**Định dạng móc CLI:**

```json
{
  "name": "my-agent",
  "hooks": {
    "postToolUse": [
      {
        "matcher": "fs_write",
        "command": "npx tsc --noEmit"
      }
    ]
  }
}
```

**Trình kích hoạt có sẵn:** `agentSpawn`, `userPromptSubmit`, `preToolUse`, `postToolUse`, `stop`

Xem `.kiro/hooks/README.md` để biết tài liệu đầy đủ về cả hai loại móc.

### Tập lệnh

Các tập lệnh Shell được hook sử dụng để thực hiện kiểm tra chất lượng và định dạng.

| Kịch bản | Mô tả |
|--------|-------------|
| `quality-gate.sh` | Phát hiện trình quản lý gói của bạn (pnpm/yarn/bun/npm) và chạy các lệnh xây dựng, kiểm tra loại, tìm lỗi mã nguồn và kiểm tra. Bỏ qua việc kiểm tra một cách khéo léo nếu thiếu công cụ. |
| `format.sh` | Phát hiện trình định dạng của bạn (quần xã hoặc đẹp hơn) và tự động định dạng tệp được chỉ định. Được sử dụng bởi các móc định dạng. |

## Cấu trúc dự án

```
.kiro/
├── agents/                       # 33 tác nhân (định dạng JSON + MD)
│   ├── planner.json / .md        # Chuyên gia quy hoạch
│   ├── code-reviewer.json / .md  # Chuyên gia đánh giá mã
│   ├── tdd-guide.json / .md      # chuyên gia TDD
│   ├── security-reviewer.json / .md # Chuyên gia bảo mật
│   ├── architect.json / .md      # chuyên gia kiến ​​trúc
│   ├── build-error-resolver.json / .md # Chuyên gia lỗi xây dựng
│   ├── typescript-reviewer.json / .md  # Người đánh giá TypeScript/JS
│   ├── rust-reviewer.json / .md  # Người đánh giá rỉ sét
│   ├── kotlin-reviewer.json / .md # Người đánh giá Kotlin/Android
│   ├── java-reviewer.json / .md  # Người đánh giá Java/Spring Boot
│   ├── cpp-reviewer.json / .md   # Người đánh giá C++
│   ├── django-reviewer.json / .md # Người đánh giá Django
│   ├── swift-reviewer.json / .md # Người đánh giá Swift
│   ├── react-reviewer.json / .md # Người đánh giá phản ứng
│   ├── mle-reviewer.json / .md   # Người đánh giá kỹ thuật ML
│   ├── performance-optimizer.json / .md # Chuyên gia biểu diễn
│   ├── ... and 17 more           # (trình phân giải xây dựng, go, python, db, e2e, v.v.)
│   └── (each agent has both .json for CLI and .md for IDE)
├── skills/                       # 43 kỹ năng
│   ├── tdd-workflow/             # Quy trình làm việc TDD
│   ├── coding-standards/         # Tiêu chuẩn mã hóa phổ quát
│   ├── security-review/          # Danh sách kiểm tra bảo mật
│   ├── verification-loop/        # Xác minh bản dựng/kiểm tra/lint
│   ├── api-design/               # Các mẫu API REST
│   ├── frontend-patterns/        # Các mẫu phản ứng/Next.js
│   ├── backend-patterns/         # Mẫu Node.js/Express
│   ├── react-patterns/           # Phản ứng mô hình 18/19
│   ├── react-testing/            # Thư viện thử nghiệm phản ứng
│   ├── rust-patterns/            # Thành ngữ và quyền sở hữu Rust
│   ├── kotlin-patterns/          # Coroutine Kotlin và KMP
│   ├── springboot-patterns/      # Kiến trúc khởi động mùa xuân
│   ├── django-patterns/          # Django ORM và DRF
│   ├── fastapi-patterns/         # API không đồng bộ FastAPI
│   ├── nestjs-patterns/          # Mô-đun NestJS và DI
│   ├── mle-workflow/             # Quy trình kỹ thuật ML
│   ├── pytorch-patterns/         # Quy trình đào tạo PyTorch
│   ├── ... and 26 more           # (thử nghiệm, triển khai, docker, v.v.)
│   └── (each skill has a SKILL.md with YAML frontmatter)
├── steering/                     # 22 tập tin chỉ đạo
│   ├── coding-style.md           # Quy tắc kiểu mã hóa được tải tự động
│   ├── security.md               # Tự động tải quy tắc bảo mật
│   ├── testing.md                # Quy tắc kiểm tra tự động tải
│   ├── development-workflow.md   # Quy trình làm việc của nhà phát triển được tự động tải
│   ├── git-workflow.md           # Luồng công việc git được tải tự động
│   ├── patterns.md               # Các mẫu thiết kế được tải tự động
│   ├── performance.md            # Quy tắc hiệu suất được tải tự động
│   ├── lessons-learned.md        # Mẫu dự án được tải tự động
│   ├── typescript-patterns.md    # Đã tải cho tệp .ts/.tsx
│   ├── typescript-security.md    # Đã tải cho tệp .ts/.tsx
│   ├── python-patterns.md        # Đã tải cho các tệp .py
│   ├── golang-patterns.md        # Đã tải cho các tệp .go
│   ├── swift-patterns.md         # Đã tải cho các tệp .swift
│   ├── rust-patterns.md          # Đã tải cho các tệp .rs
│   ├── kotlin-patterns.md        # Đã tải cho các tệp .kt
│   ├── java-patterns.md          # Đã tải cho các tệp .java
│   ├── cpp-patterns.md           # Đã tải cho tệp .cpp/.hpp/.h
│   ├── php-patterns.md           # Đã tải cho các tệp .php
│   ├── ruby-patterns.md          # Đã tải cho các tệp .rb
│   ├── dev-mode.md               # Hướng dẫn sử dụng: #dev-mode
│   ├── review-mode.md            # Hướng dẫn sử dụng: #review-mode
│   └── research-mode.md          # Hướng dẫn sử dụng: #research-mode
├── hooks/                        # 13 móc IDE
│   ├── README.md                      # Tài liệu về hook IDE và CLI
│   ├── quality-gate.kiro.hook         # Móc cổng chất lượng thủ công
│   ├── typecheck-on-edit.kiro.hook    # Tự động đánh máy khi chỉnh sửa
│   ├── console-log-check.kiro.hook    # Kiểm tra console.log
│   ├── tdd-reminder.kiro.hook         # Lời nhắc TDD khi tạo tập tin
│   ├── git-push-review.kiro.hook      # Xem lại trước khi git đẩy
│   ├── code-review-on-write.kiro.hook # Đánh giá sau khi viết
│   ├── auto-format.kiro.hook          # Tự động định dạng khi chỉnh sửa
│   ├── extract-patterns.kiro.hook     # Trích xuất các mẫu khi dừng
│   ├── session-summary.kiro.hook      # Tóm tắt về điểm dừng
│   ├── doc-file-warning.kiro.hook     # Cảnh báo trước khi thay đổi tài liệu
│   ├── rust-check-on-edit.kiro.hook   # Kiểm tra biên dịch Rust
│   ├── python-lint-on-edit.kiro.hook  # Python lint đang chỉnh sửa
│   └── security-check-on-create.kiro.hook # Kiểm tra bảo mật trên các thư mục nhạy cảm
├── scripts/                      # 2 tập lệnh shell
│   ├── quality-gate.sh           # Kịch bản shell cổng chất lượng
│   └── format.sh                 # Tập lệnh shell tự động định dạng
└── settings/                     # Cấu hình MCP
    └── mcp.json.example          # Ví dụ về cấu hình máy chủ MCP

docs/                             # 5 file tài liệu
├── longform-guide.md             # Tìm hiểu sâu về quy trình làm việc tác nhân
├── shortform-guide.md            # Hướng dẫn tham khảo nhanh
├── security-guide.md             # Các biện pháp bảo mật tốt nhất
├── migration-from-ecc.md         # Hướng dẫn di chuyển từ ECC
└── ECC-KIRO-INTEGRATION-PLAN.md  # Kế hoạch tích hợp và phân tích
```

## Tùy chỉnh

Tất cả các tập tin là của bạn để sửa đổi sau khi cài đặt. Trình cài đặt không bao giờ ghi đè lên các tệp hiện có, vì vậy các tùy chỉnh của bạn được an toàn trong quá trình cài đặt lại.

- **Chỉnh sửa lời nhắc của nhân viên** trong `.kiro/agents/*.json` để điều chỉnh hành vi hoặc thêm hướng dẫn dành riêng cho dự án
- **Sửa đổi quy trình công việc kỹ năng** trong `.kiro/skills/*/SKILL.md` để phù hợp với quy trình của nhóm bạn
- **Điều chỉnh quy tắc lái** trong `.kiro/steering/*.md` để thực thi các tiêu chuẩn mã hóa của bạn
- **Chuyển đổi hoặc chỉnh sửa móc** trong `.kiro/hooks/*.json` để tự động hóa quy trình làm việc của bạn
- **Tùy chỉnh tập lệnh** trong `.kiro/scripts/*.sh` để phù hợp với thiết lập công cụ của bạn

## Quy trình làm việc được đề xuất

1. **Bắt đầu với việc lập kế hoạch**: Sử dụng tác nhân `planner` để chia nhỏ các tính năng phức tạp
2. **Viết bài kiểm tra trước**: Gọi kỹ năng `tdd-workflow` trước khi triển khai
3. **Xem lại mã của bạn**: Chuyển sang đại lý `code-reviewer` sau khi viết mã
4. **Kiểm tra bảo mật**: Sử dụng tác nhân `security-reviewer` để xác thực, điểm cuối API hoặc xử lý dữ liệu nhạy cảm
5. **Chạy cổng chất lượng**: Kích hoạt hook `quality-gate` trước khi cam kết
6. **Xác minh toàn diện**: Sử dụng kỹ năng `verification-loop` trước khi tạo PR

Các tệp chỉ đạo được tải tự động (kiểu mã hóa, bảo mật, kiểm tra) đảm bảo các tiêu chuẩn nhất quán trong suốt phiên của bạn.

## Ví dụ sử dụng

### Ví dụ 1: Xây dựng tính năng mới với TDD

```bash
# 1. Bắt đầu với tác nhân lập kế hoạch để chia nhỏ tính năng
kiro-cli --agent planner
> "Tôi cần thêm xác thực người dùng bằng mã thông báo JWT"

# 2. Gọi kỹ năng quy trình làm việc TDD
> /tdd-workflow

# 3. Thực hiện theo chu trình TDD: viết bài kiểm tra trước, sau đó thực hiện
# Kỹ năng tdd-workflow sẽ hướng dẫn bạn:
# - Viết bài kiểm tra đơn vị cho logic xác thực
# - Viết bài kiểm tra tích hợp cho các điểm cuối API
# - Viết bài kiểm tra E2E cho luồng đăng nhập

# 4. Chuyển sang người đánh giá mã sau khi triển khai
> /agent swap code-reviewer
> "Xem lại việc thực hiện xác thực"

# 5. Chạy đánh giá bảo mật cho mã liên quan đến xác thực
> /agent swap security-reviewer
> "Kiểm tra lỗ hổng bảo mật trong hệ thống xác thực"

# 6. Kích hoạt cổng chất lượng trước khi cam kết
# (Trong IDE: Nhấp vào móc cổng chất lượng trong bảng Móc tác nhân)
```

### Ví dụ 2: Quy trình đánh giá mã

```bash
# 1. Chuyển sang đại lý đánh giá mã
kiro-cli --agent code-reviewer

# 2. Xem lại các tập tin hoặc thư mục cụ thể
> "Xem lại các thay đổi trong src/api/users.ts"

# 3. Sử dụng kỹ năng vòng lặp xác minh để kiểm tra toàn diện
> /verification-loop

# 4. Vòng xác minh sẽ:
# - Chạy kiểm tra bản dựng và kiểu
# - Chạy nói dối
# - Chạy tất cả các bài kiểm tra
# - Thực hiện quét bảo mật
# - Đánh giá git khác
# - Lặp lại cho đến khi tất cả các lần kiểm tra đều vượt qua
```

### Ví dụ 3: Phát triển ưu tiên bảo mật

```bash
# 1. Sử dụng kỹ năng đánh giá bảo mật khi làm việc trên các tính năng nhạy cảm
> /security-review

# 2. Kỹ năng cung cấp danh sách kiểm tra toàn diện:
# - Xác nhận đầu vào và vệ sinh
# - Xác thực và ủy quyền
# - Quản lý bí mật
# - Phòng chống tiêm SQL
# - Phòng chống XSS
# - Bảo vệ CSRF

# 3. Chuyển sang tác nhân đánh giá bảo mật để phân tích sâu
> /agent swap security-reviewer
> "Phân tích các điểm cuối API để tìm lỗ hổng bảo mật"

# 4. Tệp điều khiển security.md được tải tự động, đảm bảo:
# - Không có bí mật được mã hóa cứng
# - Xử lý lỗi hợp lý
# - Sử dụng tiền điện tử an toàn
# - Tuân thủ OWASP Top 10
```

### Ví dụ 4: Phát triển ngôn ngữ cụ thể

```bash
# Đối với các dự án Go:
kiro-cli --agent go-reviewer
> "Xem lại các mẫu đồng thời trong dịch vụ này"
> /golang-patterns  # Gọi kỹ năng mẫu dành riêng cho cờ vây

# Đối với các dự án Python:
kiro-cli --agent python-reviewer
> "Xem lại gợi ý loại và xử lý lỗi"
> /python-patterns  # Gọi kỹ năng mẫu dành riêng cho Python

# Các tệp chỉ đạo dành riêng cho ngôn ngữ được tải tự động:
# - golang-patterns.md tải khi chỉnh sửa file .go
# - Tải python-patterns.md khi chỉnh sửa tệp .py
# - typescript-patterns.md tải khi chỉnh sửa tệp .ts/.tsx
```

### Ví dụ 5: Sử dụng Hook để tự động hóa

```bash
# Hook chạy tự động dựa trên trigger:

# 1. móc kiểm tra khi chỉnh sửa
# - Kích hoạt khi bạn lưu tệp .ts hoặc .tsx
# - Tác nhân kiểm tra lỗi loại nội tuyến, không có thiết bị đầu cuối nào xuất hiện

# 2. hook kiểm tra nhật ký bảng điều khiển
# - Kích hoạt khi bạn lưu tệp .js, .ts hoặc .tsx
# - Cờ đại lý báo cáo console.log và đề nghị loại bỏ chúng

# 3. móc nhắc nhở tdd
# - Kích hoạt khi bạn tạo tệp .ts hoặc .tsx mới
# - Nhắc nhở bạn viết bài kiểm tra trước
# - Củng cố kỷ luật TDD

# 4. trích xuất mẫu móc
# - Chạy khi đại lý ngừng hoạt động
# - Gợi ý các mẫu để thêm vào lessons-learned.md
# - Xây dựng nền tảng kiến ​​thức cho nhóm của bạn theo thời gian

# Bật/tắt hook trong bảng Agent Hooks (IDE)
# hoặc vô hiệu hóa chúng trong các tệp JSON hook
```

### Ví dụ 6: Chế độ bối cảnh thủ công

```bash
# Sử dụng các tệp chỉ đạo thủ công cho các ngữ cảnh cụ thể:

# Chế độ phát triển - tập trung vào việc thực hiện
> # chế độ phát triển
> "Triển khai điểm cuối đăng ký người dùng"

# Chế độ xem lại - xem xét mã kỹ lưỡng
> # chế độ đánh giá
> "Xem lại tất cả các thay đổi trong PR hiện tại"

# Chế độ nghiên cứu - khám phá và học tập
> # chế độ nghiên cứu
> "Giải thích cách hoạt động của hệ thống xác thực"

# Tệp chỉ đạo thủ công cung cấp hướng dẫn theo ngữ cảnh cụ thể
# mà không làm lộn xộn mọi cuộc trò chuyện
```

### Ví dụ 7: Công việc cơ sở dữ liệu

```bash
# 1. Sử dụng tác nhân đánh giá cơ sở dữ liệu cho công việc lược đồ
kiro-cli --agent database-reviewer
> "Xem lại lược đồ cơ sở dữ liệu cho bảng người dùng"

# 2. Gọi kỹ năng di chuyển cơ sở dữ liệu
> /database-migrations

# 3. Đối với công việc dành riêng cho PostgreSQL
> /postgres-patterns
> "Tối ưu hóa truy vấn này để có hiệu suất tốt hơn"

# 4. Người kiểm tra cơ sở dữ liệu sẽ kiểm tra:
# - Thiết kế lược đồ và chuẩn hóa
# - Cách sử dụng chỉ mục và hiệu suất
# - An toàn di cư
# - Lỗ hổng tiêm SQL
```

### Ví dụ 8: Xây dựng và triển khai

```bash
# 1. Sửa lỗi build bằng build-error-resolver
kiro-cli --agent build-error-resolver
> "Sửa lỗi biên dịch TypeScript"

# 2. Sử dụng kỹ năng docker-patterns để container hóa
> /docker-patterns
> "Tạo một Dockerfile sẵn sàng sản xuất"

# 3. Sử dụng kỹ năng triển khai mẫu cho CI/CD
> /deployment-patterns
> "Thiết lập quy trình làm việc Hành động GitHub để triển khai"

# 4. Chạy cổng chất lượng trước khi triển khai
# (Kích hoạt móc cổng chất lượng để chạy tất cả kiểm tra)
```

### Ví dụ 9: Tái cấu trúc và dọn dẹp

```bash
# 1. Sử dụng tác nhân dọn dẹp tái cấu trúc để tái cấu trúc an toàn
kiro-cli --agent refactor-cleaner
> "Xóa mã không sử dụng và hợp nhất các chức năng trùng lặp"

# 2. Đại lý sẽ:
# - Xác định mã chết
# - Tìm triển khai trùng lặp
# - Đề xuất các cơ hội hợp nhất
# - Tái cấu trúc một cách an toàn mà không phá vỡ các thay đổi

# 3. Sử dụng vòng xác minh sau khi tái cấu trúc
> /verification-loop
# Đảm bảo tất cả các bài kiểm tra vẫn vượt qua sau khi tái cấu trúc
```

### Ví dụ 10: Cập nhật tài liệu

```bash
# 1. Sử dụng tác nhân cập nhật tài liệu cho công việc tài liệu
kiro-cli --agent doc-updater
> "Cập nhật README với các điểm cuối API mới"

# 2. Đại lý sẽ:
# - Cập nhật codemap trong docs/CODEMAPS/
# - Cập nhật tập tin README
# - Tạo tài liệu API
# - Giữ tài liệu đồng bộ với mã

# 3. móc cảnh báo tập tin doc ngăn chặn những thay đổi tài liệu vô tình
# - Kích hoạt trước khi ghi vào tập tin tài liệu
# - Yêu cầu xác nhận
# - Ngăn chặn những sửa đổi không chủ ý
```

## Tài liệu

Để biết thêm thông tin chi tiết, hãy xem thư mục `docs/`:

- **[Hướng dẫn dạng dài](docs/longform-guide.md)** - Tìm hiểu sâu về quy trình làm việc tổng đài và các phương pháp hay nhất
- **[Hướng dẫn rút gọn](docs/shortform-guide.md)** - Tham khảo nhanh về các tác vụ thông thường
- **[Hướng dẫn bảo mật](docs/security-guide.md)** - Các phương pháp bảo mật toàn diện hay nhất



## Người đóng góp

- Himanshu Sharma [@ihimanss](https://github.com/ihimanss)
- Sungmin Hong [@aws-hsungmin](https://github.com/aws-hsungmin)



## Giấy phép

MIT — xem [LICENSE](LICENSE) để biết chi tiết.
