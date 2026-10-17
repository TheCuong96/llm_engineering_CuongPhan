# Quy tắc đặt câu hỏi và làm việc với AI

## 1. Chuẩn bị dự án và yêu cầu

- Tạo `CLAUDE.md`, skill tại `.claude/skills/<tên-skill>/SKILL.md` và hook phù hợp với dự án.
- Nhờ AI soạn prompt lập kế hoạch cho yêu cầu, sau đó đọc lại để xác nhận kế hoạch đúng với mục tiêu trước khi triển khai.

### 1.1 Đề xuất cấu hình `.claude` bằng plugin của Anthropic

Chạy lệnh sau để AI phân tích codebase và đề xuất hook, subagent, skill, plugin, MCP phù hợp:

```text
/claude-code-setup:claude-automation-recommender
```

## 2. Quy trình làm việc cốt lõi

> **Requirements → Explore → Critique → Diagram → Flow → Design → Kanban → Telegram → Plan → Breakdown → Code → Docs → Commit**

Quy trình gốc của khóa học là **Explore → Plan → Code → Commit**. Bắt đầu viết mã ngay thường dẫn đến nhiều vòng sửa sai; khảo sát và lập kế hoạch trước giúp giảm chi phí về sau. Ở đây bổ sung thêm chín bước: thu thập yêu cầu trước khi khảo sát; phản biện sau khi khảo sát để tìm chỗ sai, chỗ thiếu và chỗ chưa quyết định; vẽ diagram, viết chi tiết luồng hoạt động của từng tính năng và làm design để thống nhất hướng đi; đưa toàn bộ kết quả lên thẻ Kanban; kết nối Telegram để giao việc và nhận thông báo từ xa trước khi lập kế hoạch; phân tích và chia kế hoạch thành các task nhỏ trước khi code; và sau khi code xong thì cập nhật tài liệu cấu trúc, sơ đồ, luồng logic cho khớp với code thực tế.

- Bài gốc: [Claude Code 101 — Explore, plan, code, commit](https://anthropic.skilljar.com/claude-code-101/469792)
- Video: [The explore → plan → code → commit workflow](https://www.youtube.com/watch?v=xJQuF02NAK8)

### 2.1 Requirements — Thu thập yêu cầu

Trước khi để AI đọc code, cần làm rõ **vấn đề cần giải quyết** và **thế nào là xong**. Yêu cầu mơ hồ ở bước này sẽ khiến mọi bước sau đi sai hướng.

Phải trả lời các câu hỏi sau:

- Ai dùng tính năng này và họ đang gặp vấn đề gì?
- Kết quả mong muốn là gì? Hành vi nào người dùng nhìn thấy được?
- Phạm vi: phần nào nằm trong yêu cầu, phần nào **không** làm lần này?
- Ràng buộc: deadline, công nghệ, hiệu năng, bảo mật, tương thích ngược.
- Tiêu chí chấp nhận (acceptance criteria) có thể kiểm tra được.
- Còn điểm nào chưa rõ cần hỏi lại người yêu cầu?

Có thể để AI phỏng vấn ngược lại bạn thay vì tự viết hết:

**Mẫu prompt:**

```text
Tôi muốn thêm tính năng xuất báo cáo doanh thu ra Excel.
Đừng khảo sát code vội. Hãy hỏi tôi từng câu một để làm rõ: ai dùng,
dữ liệu nào cần xuất, phạm vi không làm, ràng buộc và tiêu chí chấp nhận.
Khi đủ thông tin, tóm tắt thành danh sách yêu cầu để tôi duyệt
và lưu vào docs/requirements/export-report.md.
```

### 2.2 Explore — Khảo sát

Claude đọc cấu trúc dự án, các tệp liên quan, bài kiểm thử và tài liệu. Không cần đọc mọi thứ; mục tiêu là xác định **thay đổi nằm ở đâu và phụ thuộc vào những gì**. Có thể dùng Plan mode hoặc subagent Explore khi chỉ cần phác họa codebase.

#### Khi phát triển tính năng

Phải trả lời các câu hỏi sau:

- Mong muốn là gì: thêm tính năng gì, bỏ hoặc thay đổi cái gì?
- Làm ở dự án nào, hoặc phần nào của dự án?
- Model LLM nào phù hợp nhất để làm tính năng hoặc chức năng đó?
- Có cần ghi chú hoặc viết tài liệu (docx) không?
- Có làm theo lộ trình hoặc tài liệu đã được chuẩn bị sẵn không?
- Có cần kết nối với MCP nào không?

**Ví dụ yêu cầu:**

```text
Khảo sát pipeline tải ảnh. Xác định điểm thích hợp để chuyển sang WebP,
dependency đang dùng và test liên quan. Chỉ đọc và báo cáo, chưa sửa mã.
```

**Mẫu prompt:**

```text
Hãy khảo sát luồng thanh toán và lập kế hoạch tách logic tính thuế
thành một module riêng. Chỉ đọc, chưa sửa mã.

Kế hoạch phải nêu:
- tệp sẽ thay đổi;
- interface trước và sau;
- test cần thêm hoặc cập nhật;
- rủi ro tương thích;
- tiêu chí hoàn thành có thể kiểm tra.
```

#### Khi sửa lỗi

Phải trả lời các câu hỏi sau:

- Nguyên nhân của lỗi là gì? Phân loại lỗi: lỗi business, lỗi code, lỗi từ framework hay do thiếu tính năng.
- Đề xuất cách sửa phù hợp với loại lỗi đó.

Thay vì hỏi chung chung:

```text
Sửa phần đăng nhập.
```

Hãy mô tả mục tiêu và tiêu chí hoàn thành:

```text
Tìm nguyên nhân người dùng bị đăng xuất sau khi tải lại trang.
Trước tiên hãy lần theo luồng tạo và lưu session, chưa sửa mã.
Sau đó đề xuất kế hoạch. Thành công khi test session hiện có vượt qua
và có thêm test tái hiện lỗi tải lại trang.
```

### 2.3 Critique — Tư duy phản biện

> **Trước khi vẽ sơ đồ và thiết kế, phải tìm ra chỗ sai, chỗ thiếu và chỗ chưa quyết định.**

AI thường đồng ý với người dùng rồi làm tiếp. Ở bước này, bạn yêu cầu AI đóng vai người phản biện: chủ động tìm điểm yếu trong yêu cầu, trong hướng tiếp cận và trong dự án hiện tại. Phát hiện lỗi lúc này chỉ tốn sửa vài dòng tài liệu. Nếu để đến sau khi code xong, phải sửa lại cả sơ đồ, design và code.

Cần soi theo bốn nhóm:

- **Sai:** giả định không khớp với code thực tế, yêu cầu mâu thuẫn nhau, hướng tiếp cận không giải quyết được vấn đề gốc, chọn sai công nghệ hoặc model.
- **Thiếu:** trường hợp biên, xử lý lỗi, phân quyền, bảo mật, hiệu năng, dữ liệu cũ (migration), test, tài liệu, nhóm người dùng bị ảnh hưởng nhưng chưa được nhắc tới.
- **Chưa quyết định:** chỗ có nhiều cách làm nhưng chưa ai chốt (ví dụ xuất đồng bộ hay chạy nền, giới hạn bao nhiêu dòng), những chỗ ghi "để sau tính".
- **Rủi ro:** điều có thể làm hỏng tính năng đang chạy, phụ thuộc bên ngoài, chi phí, thay đổi khó quay lui.

Câu hỏi gợi ý:

- Nếu dự án này thất bại, nguyên nhân có khả năng nhất là gì? (pre-mortem)
- Giả định nào mà nếu sai thì toàn bộ hướng đi phải làm lại?
- Có cách đơn giản hơn để đạt cùng mục tiêu không?
- Yêu cầu nào hiện chưa kiểm tra được?

**Mẫu prompt:**

```text
Đóng vai người phản biện khó tính. Đọc docs/requirements/export-report.md
và kết quả khảo sát. Đừng đồng ý cho qua, hãy tìm:
- chỗ sai: giả định không khớp với code, yêu cầu mâu thuẫn;
- chỗ thiếu: trường hợp biên, lỗi, phân quyền, hiệu năng, dữ liệu lớn, test;
- chỗ chưa có quyết định rõ ràng;
- rủi ro ảnh hưởng đến tính năng đang chạy.
Mỗi vấn đề ghi mức độ (chặn / quan trọng / nhỏ), lý do và đề xuất.
Sau đó hỏi tôi từng câu một về các điểm cần quyết định.
Lưu kết quả vào docs/decisions/export-report.md. Chưa sửa mã.
```

**Ví dụ kết quả:**

| Mức độ | Vấn đề | Đề xuất |
| --- | --- | --- |
| Chặn | Chưa rõ ai được phép xuất báo cáo doanh thu | Chốt quyền: chỉ Admin và Kế toán |
| Quan trọng | Kỳ có 500.000 dòng sẽ bị timeout nếu xuất đồng bộ | Chạy nền, gửi link tải khi xong |
| Nhỏ | Chưa quy định định dạng số tiền trong file | Dùng định dạng VND, không có số lẻ |

Bạn xử lý từng mục theo một trong ba cách: sửa lại yêu cầu, chốt quyết định, hoặc chấp nhận rủi ro và ghi chú lý do. Chỉ chuyển sang bước tiếp theo khi không còn mục **chặn** nào.

Mẹo: nên phản biện trong một phiên mới hoặc nhờ một subagent làm. AI vừa viết yêu cầu sẽ có xu hướng bảo vệ chính những gì nó đã viết.

### 2.4 Diagram — Tạo và vẽ sơ đồ

Sau khi khảo sát, vẽ lại luồng hiện tại và luồng sau khi thay đổi. Sơ đồ giúp phát hiện sớm chỗ hiểu sai giữa bạn và AI mà đọc văn bản dài khó thấy.

Chọn loại sơ đồ theo câu hỏi cần trả lời:

| Loại sơ đồ | Dùng khi cần thể hiện |
| --- | --- |
| Flowchart | Luồng xử lý, các nhánh điều kiện |
| Sequence diagram | Thứ tự gọi giữa client, API, service, database |
| ERD | Bảng dữ liệu và quan hệ giữa chúng |
| Architecture diagram | Các thành phần hệ thống và cách chúng kết nối |
| State diagram | Các trạng thái của một đối tượng (ví dụ đơn hàng) |

Công cụ gợi ý:

- **Mermaid** viết ngay trong file Markdown, dễ cho AI tạo và dễ review trong PR.
- **FigJam, draw.io, Excalidraw** khi cần sơ đồ trình bày cho người khác xem.

**Mẫu prompt:**

```text
Dựa trên kết quả khảo sát, vẽ sequence diagram bằng Mermaid cho luồng
xuất báo cáo: hiện tại và sau khi thay đổi. Đánh dấu rõ phần mới thêm.
Lưu vào docs/diagrams/export-report.md. Chưa sửa mã.
```

**Ví dụ kết quả:**

```mermaid
sequenceDiagram
    participant U as Người dùng
    participant FE as Frontend
    participant API as Report API
    participant DB as Database
    U->>FE: Bấm "Xuất Excel"
    FE->>API: GET /reports/revenue/export
    API->>DB: Truy vấn doanh thu theo kỳ
    DB-->>API: Dữ liệu
    API-->>FE: File .xlsx
    FE-->>U: Tải file xuống
```

Đọc lại sơ đồ và sửa ngay nếu sai. Sửa sơ đồ rẻ hơn rất nhiều so với sửa code.

### 2.5 Flow — Chi tiết luồng hoạt động của từng tính năng

> **Sơ đồ cho thấy bức tranh tổng thể. Luồng chi tiết mô tả từng bước và từng nhánh của mỗi tính năng.**

Sơ đồ ở bước 2.4 dễ đọc nhưng thường bỏ qua chi tiết: đầu vào cụ thể là gì, rẽ nhánh theo điều kiện nào, lỗi xảy ra ở bước nào và hệ thống phản hồi ra sao. Bước này viết từng luồng thành văn bản có cấu trúc, mỗi tính năng một tài liệu. Tài liệu này về sau dùng để viết test và đối chiếu khi review code.

Với mỗi tính năng, cần mô tả:

- **Điểm kích hoạt:** ai hoặc cái gì bắt đầu luồng (người dùng bấm nút, cron job, webhook...).
- **Điều kiện trước:** quyền và trạng thái dữ liệu cần có.
- **Đầu vào:** tham số, kiểu dữ liệu, giới hạn hợp lệ.
- **Luồng chính:** các bước được đánh số, mỗi bước ghi rõ thành phần nào làm gì.
- **Luồng rẽ nhánh:** đi theo hướng nào khi điều kiện khác đi (dữ liệu lớn, không có dữ liệu...).
- **Luồng lỗi:** lỗi gì, xảy ra ở bước nào, người dùng nhận được phản hồi gì, có ghi log hoặc thử lại không.
- **Kết quả:** dữ liệu nào thay đổi và người dùng nhận được gì.

**Mẫu prompt:**

```text
Dựa trên yêu cầu, các quyết định đã chốt và sơ đồ docs/diagrams/export-report.md,
viết chi tiết luồng hoạt động cho từng tính năng trong phạm vi.
Mỗi tính năng ghi rõ: điểm kích hoạt, điều kiện trước, đầu vào,
luồng chính (đánh số từng bước), luồng rẽ nhánh, luồng lỗi và kết quả.
Chỗ nào chưa có quyết định thì liệt kê riêng để hỏi tôi, không tự giả định.
Lưu vào docs/flows/export-report.md. Chưa sửa mã.
```

**Ví dụ kết quả:**

```text
Tính năng: Xuất báo cáo doanh thu ra Excel

Kích hoạt: người dùng bấm "Xuất Excel" trên trang báo cáo doanh thu.
Điều kiện trước: đã đăng nhập, có role Admin hoặc Kế toán.
Đầu vào: kỳ báo cáo (từ ngày, đến ngày), dài tối đa 12 tháng.

Luồng chính:
1. Frontend gọi GET /reports/revenue/export?from=...&to=...
2. API kiểm tra quyền và tính hợp lệ của kỳ báo cáo.
3. API đếm số dòng. Nếu ≤ 50.000 dòng thì truy vấn và tạo file .xlsx.
4. API trả file. Frontend tải file xuống và hiện thông báo thành công.

Rẽ nhánh:
3a. Trên 50.000 dòng: tạo job chạy nền, trả 202 kèm mã job.
    Khi job xong, gửi link tải qua thông báo trong ứng dụng.
3b. Kỳ không có dữ liệu: trả 204, frontend hiện "Không có dữ liệu trong kỳ này".

Lỗi:
E1. Không đủ quyền (bước 2): trả 403. Với role khác, frontend ẩn nút.
E2. Kỳ không hợp lệ hoặc dài quá 12 tháng (bước 2): trả 400 kèm thông báo cụ thể.
E3. Lỗi database (bước 3): trả 500 và ghi log. Frontend hiện "Xuất thất bại, hãy thử lại".

Kết quả: người dùng nhận file revenue_<từ>_<đến>.xlsx. Dữ liệu trong hệ thống không thay đổi.
```

Mỗi nhánh rẽ và mỗi lỗi nên có ít nhất một test case tương ứng. Nếu trong lúc viết luồng phát hiện chỗ chưa có quyết định (ví dụ chưa biết kỳ báo cáo được dài tối đa bao lâu), quay lại bước 2.3 để chốt rồi mới viết tiếp.

### 2.6 Design — Tạo và vẽ thiết kế

Khi thay đổi có giao diện, cần có design trước khi lập kế hoạch code. Với tác vụ không có giao diện (API, script, refactor), thay bằng bản thiết kế kỹ thuật ngắn: interface, cấu trúc dữ liệu, format request/response.

Một design tốt cần có:

- Các màn hình hoặc component bị ảnh hưởng.
- Đủ trạng thái: mặc định, đang tải, rỗng, lỗi, thành công.
- Hành vi trên các kích thước màn hình (desktop, mobile).
- Tận dụng design system, màu, font và component đã có trong dự án.

Công cụ gợi ý:

- **Figma** (có thể kết nối qua MCP để AI đọc design và chuyển thành code).
- **Prototype HTML** do AI tạo nhanh để xem trực tiếp trên trình duyệt.

**Mẫu prompt:**

```text
Dựa trên docs/requirements/export-report.md và sơ đồ docs/diagrams/export-report.md,
đề xuất design cho nút "Xuất Excel" trên trang báo cáo doanh thu.
Dùng component và màu có sẵn trong dự án. Thể hiện đủ trạng thái
mặc định, đang xuất, lỗi và thành công. Tạo prototype HTML để tôi xem trước.
Chưa sửa mã của ứng dụng.
```

Chỉ chuyển sang bước tiếp theo sau khi bạn đã duyệt design.

### 2.7 Kanban — Tạo và kết nối bảng công việc

> **Mỗi yêu cầu đã duyệt là một thẻ trên bảng Kanban trước khi bắt đầu Plan.**

Đến bước này đã có đủ yêu cầu, sơ đồ và design. Bảng Kanban gom tất cả vào một chỗ, giúp theo dõi tiến độ, tránh làm nhiều việc cùng lúc và cho AI một nguồn ngữ cảnh thống nhất ở các phiên sau.

#### Tạo bảng

- Chọn công cụ: GitHub Projects, Jira, Linear, Trello...
- Tạo các cột cơ bản: `Backlog` → `To do` → `In progress` → `Review` → `Done`.
- Giới hạn số thẻ trong `In progress` (ví dụ tối đa 2) để tập trung hoàn thành từng việc.

#### Kết nối bảng với AI

- Kết nối qua MCP để AI đọc và cập nhật thẻ, ví dụ với GitHub:

  ```text
  claude mcp add --transport http github https://api.githubcopilot.com/mcp/
  ```

- Hoặc dùng CLI có sẵn, ví dụ `gh project` cho GitHub Projects.
- Ghi vào `CLAUDE.md` bảng nào đang dùng và quy ước đặt tên thẻ, nhánh (ví dụ nhánh `feature/<mã-thẻ>-<mô-tả-ngắn>`).

#### Nội dung một thẻ

Mỗi thẻ nên trả lời được:

- Mục tiêu: thêm, bỏ hoặc thay đổi cái gì.
- Phạm vi: dự án hoặc phần nào của dự án.
- Tiêu chí hoàn thành có thể kiểm tra.
- Liên kết: tài liệu yêu cầu, các quyết định đã chốt ở bước phản biện, diagram, luồng hoạt động, design, nhánh, PR hoặc issue liên quan.

Nếu tính năng lớn, tách thành nhiều thẻ nhỏ, mỗi thẻ có thể hoàn thành và review độc lập.

**Ví dụ yêu cầu:**

```text
Tạo thẻ "Xuất báo cáo doanh thu ra Excel" trên bảng Kanban của dự án
từ docs/requirements/export-report.md. Gắn link sơ đồ
docs/diagrams/export-report.md và prototype design đã duyệt.
Đặt thẻ ở cột To do. Chưa sửa mã.
```

Khi làm xong từng giai đoạn tiếp theo, cập nhật trạng thái thẻ tương ứng: tạo thẻ → `To do`, bắt đầu Plan → `In progress` và tạo nhánh theo quy ước, mở PR → `Review`, merge → `Done`.

### 2.8 Telegram — Giao việc và nhận thông báo từ xa

> **Không cần ngồi trước máy: giao việc, duyệt kế hoạch và xem tiến độ qua Telegram.**

Sau khi có thẻ Kanban, các bước Plan → Code → Commit có thể chạy lâu. Kết nối Telegram giúp bạn nhắn việc cho AI từ điện thoại và nhận thông báo khi AI cần duyệt hoặc đã làm xong, thay vì phải theo dõi terminal liên tục.

#### Thiết lập kết nối

1. Mở Telegram, chat với **@BotFather**, gửi `/newbot` để tạo bot và lấy **bot token**.
2. Cài plugin Telegram cho Claude Code, sau đó chạy lệnh cấu hình và dán token vào:

   ```text
   /telegram:configure
   ```

3. Nhắn thử một tin cho bot, rồi duyệt ghép nối (pairing) và giới hạn chỉ tài khoản của bạn được ra lệnh:

   ```text
   /telegram:access
   ```

4. Ghi vào `CLAUDE.md` những loại sự kiện cần báo qua Telegram để AI làm theo ở mọi phiên.

#### Giao việc qua Telegram

Nhắn cho bot giống như gõ prompt trong terminal, vẫn theo nguyên tắc ở mục 3: rõ mục tiêu, phạm vi và mức tự chủ.

**Ví dụ tin nhắn:**

```text
Đọc thẻ "Xuất báo cáo doanh thu ra Excel" trên Kanban.
Chuyển thẻ sang In progress và lập kế hoạch theo mục 2.9.
Gửi kế hoạch qua đây để tôi duyệt. Chưa sửa mã.
```

#### Thông báo nên nhận

- Kế hoạch đã sẵn sàng, đang chờ bạn duyệt.
- AI cần quyết định hoặc cấp quyền để tiếp tục.
- Test, lint hoặc build bị lỗi.
- Đã mở PR, thẻ chuyển sang `Review`.
- Task hoàn tất, kèm tóm tắt ngắn những gì đã thay đổi.

#### Lưu ý bảo mật

- Bot token như mật khẩu: không commit vào repo, không gửi cho người khác.
- Chỉ cho phép tài khoản của bạn (allowlist) ra lệnh. Ai nhắn được cho bot là có thể điều khiển AI trên máy bạn.
- Việc quan trọng như push, merge, xóa dữ liệu vẫn nên duyệt rõ ràng, không để AI tự làm chỉ vì có một tin nhắn yêu cầu.

### 2.9 Plan — Lập kế hoạch

Một kế hoạch tốt cần nêu rõ:

- Mong muốn: thêm tính năng gì, bỏ hoặc thay đổi cái gì.
- Bám theo yêu cầu, các quyết định đã chốt, diagram, luồng hoạt động và design đã gắn trên thẻ Kanban.
- Lộ trình thực hiện, ví dụ: tạo interface trước → setup state → sử dụng ở đâu.
- Các tệp dự kiến sửa.
- Trình tự thực hiện.
- Rủi ro và trường hợp biên.
- Tiêu chí thành công.
- Lệnh kiểm thử cụ thể.

Đây là thời điểm ít tốn kém nhất để điều chỉnh hướng đi. Nếu kế hoạch đụng đến quá nhiều tệp hoặc thêm dependency không cần thiết, hãy thu hẹp phạm vi trước khi triển khai.

### 2.10 Breakdown — Phân tích và phân mảnh công việc

> **Chia kế hoạch lớn thành các task nhỏ. Mỗi task phải làm, kiểm tra và commit được độc lập.**

Plan trả lời câu hỏi "làm gì và theo hướng nào". Bước này trả lời "làm theo thứ tự nào và mỗi lần làm bao nhiêu". Nếu giao cả một kế hoạch lớn trong một lượt, AI dễ bị quá tải ngữ cảnh và sửa lan sang nhiều tệp. Diff sinh ra vừa khó review, vừa khó tìm chỗ hỏng khi test lỗi.

#### Phân tích

- **Các phần cấu thành:** dữ liệu, logic nghiệp vụ, API, giao diện, test, tài liệu.
- **Phụ thuộc:** task nào phải xong trước. Ví dụ: kiểu dữ liệu và interface trước, rồi đến logic, sau cùng là giao diện.
- **Rủi ro cao hoặc chưa chắc chắn:** đưa lên làm sớm. Nếu hướng đi sai thì phát hiện khi chưa tốn nhiều công.
- **Có thể làm song song:** những task này giao được cho subagent hoặc làm trên một git worktree riêng.

#### Một task tốt cần

- **Nhỏ:** xong trong một phiên, chạm ít tệp, diff đọc hết trong vài phút.
- **Độc lập:** làm xong task nào thì ứng dụng vẫn build được và test vẫn qua, không để lại code dang dở.
- **Kiểm chứng được:** có tiêu chí hoàn thành và lệnh kiểm tra cụ thể.
- **Có đầu ra rõ ràng:** một commit hoặc một PR nhỏ.

Nên chia theo **lát cắt dọc (vertical slice)** thay vì theo tầng. Mỗi task đi xuyên từ dữ liệu đến giao diện, nhưng chỉ cho một trường hợp nhỏ, nên chạy thử được ngay. Ví dụ: làm "xuất một kỳ, ít dòng" trước, rồi mới làm "chạy nền cho dữ liệu lớn".

**Mẫu prompt:**

```text
Dựa trên kế hoạch đã duyệt cho thẻ "Xuất báo cáo doanh thu ra Excel",
chia thành các task nhỏ theo lát cắt dọc. Với mỗi task, ghi:
- mô tả ngắn và các tệp dự kiến sửa;
- task phụ thuộc;
- tiêu chí hoàn thành và lệnh kiểm tra.
Đưa task có rủi ro cao lên sớm, đánh dấu task có thể làm song song.
Mỗi task phải để ứng dụng ở trạng thái build và test được.
Thêm danh sách task thành checklist trên thẻ Kanban. Chưa sửa mã.
```

**Ví dụ kết quả:**

| # | Task | Phụ thuộc | Kiểm tra |
| --- | --- | --- | --- |
| 1 | Hàm truy vấn doanh thu theo kỳ, kèm unit test | — | Unit test của hàm truy vấn qua |
| 2 | API `GET /reports/revenue/export` trả về file `.xlsx` (dữ liệu nhỏ, chỉ Admin và Kế toán) | 1 | Test API: đúng header, đúng số dòng, role khác nhận 403 |
| 3 | Nút "Xuất Excel" với các trạng thái đang xuất, lỗi, thành công | 2 | Mở trình duyệt, tải được file |
| 4 | Chạy nền khi vượt 50.000 dòng, gửi link tải khi xong | 2 | Test với 500.000 dòng dữ liệu giả |

Task 3 và 4 có thể làm song song.

Trong lúc thực hiện:

- Làm lần lượt từng task: code, chạy test, xem diff, commit, rồi mới sang task tiếp.
- Đánh dấu task xong trên checklist của thẻ Kanban.
- Nếu một task phình to quá dự kiến, dừng lại và chia nhỏ tiếp thay vì cố làm cho xong.

### 2.11 Code — Thực thi có kiểm chứng

Sau khi duyệt kế hoạch và danh sách task, Claude triển khai lần lượt từng task. Để giai đoạn này ổn định:

- Định nghĩa “hoàn thành” bằng kết quả có thể quan sát: test nào phải qua, đầu ra nào phải xuất hiện.
- Cấp công cụ phù hợp. Ví dụ, tác vụ giao diện cần có khả năng mở và kiểm tra trình duyệt.
- Dùng test suite đáng tin cậy; test sai có thể tạo cảm giác thành công giả.

Nếu một lỗi lặp lại do quy ước dự án, hãy ghi quy ước vào `CLAUDE.md` thay vì sửa thủ công trong mọi phiên.

### 2.12 Docs — Cập nhật cấu trúc, sơ đồ, luồng logic của source code

> **Code đã đổi thì tài liệu cũng phải đổi theo, trong cùng một commit hoặc PR.**

Khi triển khai, code thực tế thường lệch một chút so với diagram và kế hoạch ban đầu. Nếu không cập nhật lại, tài liệu sẽ sai dần, và ở phiên sau AI đọc tài liệu sai sẽ khảo sát và lập kế hoạch sai theo.

Cần rà soát và cập nhật:

- **Cấu trúc source code:** thư mục, module, tệp mới thêm hoặc đã xóa, và vai trò của từng phần (ví dụ trong `README.md` hoặc `docs/ARCHITECTURE.md`).
- **Sơ đồ:** cập nhật các diagram ở bước 2.4 (ví dụ `docs/diagrams/export-report.md`) theo đúng luồng đã code, bỏ phần "hiện tại" cũ nếu không còn đúng.
- **Luồng logic:** cập nhật tài liệu luồng hoạt động ở bước 2.5 (ví dụ `docs/flows/export-report.md`) theo đúng code: luồng chính, điều kiện rẽ nhánh, cách xử lý lỗi và các trường hợp biên đã xử lý.
- **Interface:** API, tham số, format dữ liệu vào và ra nếu có thay đổi.
- **`CLAUDE.md`:** nếu có quy ước mới (lệnh build, test, cách đặt tên...), ghi lại để AI dùng ở các phiên sau.
- **Thẻ Kanban:** gắn link tới tài liệu đã cập nhật.

**Mẫu prompt:**

```text
Code cho thẻ "Xuất báo cáo doanh thu ra Excel" đã xong.
So sánh code thực tế với docs/diagrams/export-report.md và kế hoạch đã duyệt.
Cập nhật lại:
- cấu trúc thư mục và vai trò các module mới trong docs/ARCHITECTURE.md;
- sequence diagram theo đúng luồng đã code;
- mô tả luồng logic, cách xử lý lỗi và trường hợp biên.
Liệt kê những chỗ code khác với kế hoạch ban đầu. Không sửa code.
```

Danh sách "những chỗ khác với kế hoạch" rất đáng đọc: nó cho biết AI đã tự quyết định những gì trong lúc code, để bạn xác nhận hoặc yêu cầu sửa trước khi commit.

### 2.13 Commit — Rà soát và đóng gói thay đổi

Trước khi commit:

1. Tự chạy và kiểm tra thay đổi.
2. Xem `git diff`, đặc biệt là các tệp nằm ngoài dự kiến.
3. Nhờ subagent reviewer đánh giá chỉ-đọc để có góc nhìn mới.
4. Chạy test, lint và type-check phù hợp.
5. Nhờ Claude soạn commit message theo phong cách của repository.

Quy trình không kết thúc chỉ vì AI thông báo đã xong. Thay đổi chỉ nên được xem là hoàn tất sau khi đã qua rà soát của con người và các bước kiểm chứng.

## 3. Một prompt rõ ràng cần có gì?

1. **Mục tiêu:** Bạn muốn hoàn thành việc gì?
2. **Ngữ cảnh:** Khu vực hoặc luồng nào liên quan? Dự án dùng công nghệ gì?
3. **Phạm vi:** Được sửa phần nào, phần nào cần giữ nguyên?
4. **Ràng buộc:** Có cần theo pattern, framework, style hoặc yêu cầu tương thích nào không? Có được thêm dependency không?
5. **Tiêu chí thành công:** Cần chạy test/build nào? Hành vi nào phải hoạt động?
6. **Mức tự chủ:** Chỉ phân tích, lập kế hoạch hay được phép thực hiện?

### Ví dụ: thêm tính năng dark mode

Yêu cầu không chỉ là “thêm dark mode”, mà cần nói vị trí công tắc, phạm vi toàn ứng dụng và yêu cầu màu tương phản dựa trên theme sáng hiện có. Trong Plan mode, Claude tìm cấu trúc theme, hỏi điều chưa rõ và đưa ra kế hoạch. Bạn duyệt kế hoạch trước khi cho phép thực thi.

**Mẫu prompt:**

```text
Ứng dụng cần dark mode trên toàn bộ giao diện.
Hãy đặt công tắc chuyển theme ở header và tìm bảng màu tối có độ tương phản
phù hợp với theme sáng hiện tại. Trước tiên dùng Plan mode để khảo sát cách
ứng dụng đang quản lý theme, liệt kê các tệp sẽ sửa và cách kiểm thử.
Chưa viết mã cho đến khi tôi duyệt kế hoạch.
```

## 4. Cách phản hồi một kế hoạch chưa tốt

Đừng chỉ nói “làm lại”. Hãy chỉ rõ phần cần thay đổi và phần cần giữ nguyên.

**Ví dụ:**

```text
Giữ nguyên bước 1 và 2. Ở bước 3, không thêm dependency mới;
hãy tận dụng CSS variables hiện có. Bổ sung kiểm thử cho việc lưu lựa chọn
theme sau khi tải lại trang.
```

## 5. Kiểm tra trước khi push

Sau khi hoàn thành thay đổi:

- [ ] Chạy thử và xác nhận hành vi mới hoạt động.
- [ ] Kiểm tra cả phần code thay đổi lẫn các phần liên quan không thay đổi.
- [ ] Đối chiếu phạm vi thay đổi với yêu cầu và tiêu chí trên thẻ Kanban; xác nhận không sửa ngoài phạm vi.
- [ ] Sau khi kiểm tra xong, push lên một nhánh riêng cho task. Nhánh này có thể xóa khi không còn cần thiết.

## 6. Rà soát lại sau khi push lên GitHub

1. Nhờ AI trên web kiểm tra code vừa push và nắm ngữ cảnh codebase.
2. Nếu AI phát hiện vấn đề, yêu cầu viết prompt cụ thể để sửa vấn đề đó.
3. Đưa prompt xuống IDE để AI sửa code.
4. Kiểm tra và push phần sửa lên GitHub.
5. Lặp lại việc rà soát cho đến khi AI không còn báo vấn đề, rồi chuyển thẻ Kanban sang `Done`.
