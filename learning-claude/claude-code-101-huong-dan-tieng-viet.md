# Claude Code 101 — Hướng dẫn học lại bằng tiếng Việt

> Tài liệu học tập được biên soạn lại bằng tiếng Việt, có giải thích, ví dụ và bài luyện tập mới. Đây không phải bản chép lời hay bản dịch nguyên văn transcript.

## Nguồn và phạm vi

Trang Skilljar bạn gửi hiện trả về lỗi 403 trong môi trường truy cập này. Để xác minh chương trình, tài liệu dùng trang Claude Academy chính thức của Anthropic cho khóa **Claude Code 101**, các trang bài học công khai của khóa và playlist YouTube chính thức của kênh **Claude**.

Trang Academy hiện liệt kê **12 bài học, 1 bài quiz, thời lượng ước tính 1,5 giờ**. Playlist YouTube công khai có **9 video**. Vì vậy video không ghép một-một với từng bài; *Code review*, *Subagents* và *Skills* không có video riêng tương ứng trong playlist này. Nội dung giảng dưới đây vẫn bao quát đủ 12 bài theo thứ tự khóa học.

- [Claude Code 101 trên Claude Academy](https://academy.claude.com/courses/claude-code-101)
- [Trang Skilljar bạn gửi](https://anthropic.skilljar.com/claude-code-101/469788)
- [Playlist Claude Code 101 trên YouTube](https://www.youtube.com/playlist?list=PLmWCw1CzcFilebjK89WLb5cAvM8K0cLB3)

Claude Code thay đổi thường xuyên. Tên chế độ, lệnh, cách cài đặt và giao diện có thể khác theo phiên bản. Khi chạy lệnh cài đặt hoặc cấu hình thật, hãy đối chiếu tài liệu chính thức hiện hành ở cuối file.

## Mục tiêu khóa học

Claude Code là công cụ lập trình có thể làm việc với dự án: đọc mã nguồn, tìm kiếm, sửa file, chạy lệnh và xem kết quả. Khóa học không chỉ dạy “gõ prompt để sinh code”, mà hướng đến cách cộng tác có kiểm soát:

1. Hiểu Claude Code khác cửa sổ chat thông thường như thế nào.
2. Cung cấp mục tiêu, ngữ cảnh, giới hạn và tiêu chí thành công.
3. Dùng quy trình khảo sát, lập kế hoạch, thực hiện, kiểm tra và review.
4. Giữ cho phiên làm việc có đủ ngữ cảnh mà không bị quá tải.
5. Thêm quy ước dự án, tác vụ dùng lại, công cụ ngoài và tự động hóa.

### Bốn chặng

| Chặng | Bài học | Câu hỏi cần trả lời |
|---|---|---|
| Claude Code là gì? | 1–2 | Agent lập trình hoạt động ra sao? Ngữ cảnh và quyền ảnh hưởng thế nào? |
| Prompt đầu tiên | 3–4 | Cài ở đâu, giao việc và chọn mức giám sát nào? |
| Quy trình hằng ngày | 5–7 | Khảo sát, code, quản lý context và review thế nào? |
| Tùy chỉnh Claude Code | 8–12 | Khi nào dùng CLAUDE.md, subagent, skill, MCP và hook? |

**Điều kiện nên có:** biết dùng trình soạn thảo code và dòng lệnh cơ bản. Không cần kinh nghiệm AI coding agent trước đó. Với nền tảng frontend, hãy thử các ví dụ trong một nhánh mới của repo React/Next.js.

---

# Phần I — Claude Code là gì?

## Bài 1. What is Claude Code? — Claude Code là gì?

- **Bài gốc:** [What is Claude Code?](https://academy.claude.com/courses/claude-code-101/what-is-claude-code)
- **Video:** [What is Claude Code? — Claude](https://www.youtube.com/watch?v=fl1DSmwQKKY)
- **Thời lượng khóa học:** khoảng 5 phút

### Giải thích

Trong khung chat Claude, bạn thường gửi nội dung rồi nhận câu trả lời bằng chữ hoặc code. Bạn tự chép code vào repo, tự chạy, rồi gửi lại lỗi.

Claude Code có thể làm việc ngay trong môi trường dự án được cấp quyền. Bạn giao mục tiêu; nó có thể đọc file liên quan, đề xuất hoặc thực hiện thay đổi, chạy lệnh kiểm tra, đọc output rồi tiếp tục. Vì nó có thể quan sát và tác động lên dự án, Claude Code được gọi là **AI coding agent** — tác nhân AI hỗ trợ lập trình.

| Kiểu công cụ | Nó thường làm gì? | Ví dụ |
|---|---|---|
| Chatbot | Trả lời nội dung trong cửa sổ chat | “Giải thích lỗi React này” |
| Gợi ý code trong editor | Đề xuất code tại vị trí con trỏ | Hoàn thành một hàm |
| Coding agent | Khảo sát repo, dùng công cụ, sửa file, chạy lệnh và xác minh | “Tìm lỗi refresh token, sửa và chạy test liên quan” |

Agent không phải lập trình viên tự biết mọi thứ và luôn đúng. Nó dựa trên yêu cầu, file, công cụ và quyền của phiên làm việc. Nó có thể đọc nhầm kiến trúc, sửa quá phạm vi hoặc kết luận test đã đạt dù test chưa đủ. Bạn vẫn đặt mục tiêu, giám sát và quyết định có chấp nhận thay đổi hay không.

### Ví dụ frontend

> “Hãy tìm luồng tải trang hồ sơ người dùng trong ứng dụng Next.js này. Chỉ phân tích, chưa sửa file. Chỉ ra component, hook/API, trạng thái loading/error và test hiện có.”

Claude Code có thể tìm trong repo và tổng hợp kết quả. Khi bạn biết nơi cần sửa, giao bước tiếp theo. Cách chia này an toàn và dễ kiểm chứng hơn câu “sửa trang hồ sơ”.

### Ghi nhớ

- Claude Code làm việc **trên dự án**, không chỉ viết ví dụ trong chat.
- “Agent” nghĩa là mô hình có thể chọn công cụ và lặp hành động để đạt mục tiêu.
- Cấp quyền truy cập không đồng nghĩa giao toàn bộ trách nhiệm cho nó.

---

## Bài 2. How Claude Code works — Claude Code hoạt động thế nào?

- **Bài gốc:** [How Claude Code works](https://academy.claude.com/courses/claude-code-101/how-claude-code-works)
- **Video:** [How Claude Code Works — Claude](https://www.youtube.com/watch?v=6bs5b4FltCU)
- **Thời lượng khóa học:** khoảng 5 phút

### Vòng lặp của agent

1. **Bạn nêu mục tiêu.** Ví dụ: “Tìm lý do test đăng nhập thất bại sau khi refresh token hết hạn.”
2. **Claude thu thập ngữ cảnh.** Nó đọc file, tìm symbol, xem test hoặc hỏi thêm điều kiện.
3. **Claude chọn hành động.** Nó có thể giải thích, tìm kiếm, sửa code hoặc chạy lệnh.
4. **Quyền kiểm soát hành động.** Tùy permission mode, Claude có thể cần bạn duyệt lệnh hay thay đổi.
5. **Claude xem kết quả.** Nó đọc output của lệnh/test hoặc diff vừa tạo.
6. **Claude xác minh rồi lặp lại.** Nếu chưa đạt mục tiêu, nó tiếp tục điều tra hoặc sửa; nếu đủ, nó báo kết quả.

Bạn có thể ngắt, bổ sung ngữ cảnh hoặc đổi hướng ở bất kỳ bước nào.

### Bốn khái niệm cần hiểu

- **Context window (cửa sổ ngữ cảnh):** vùng thông tin làm việc của phiên, gồm prompt, trao đổi, file và kết quả công cụ. Nó hữu hạn; Claude thường tìm các phần liên quan thay vì nạp toàn bộ repo cùng lúc.
- **Tools (công cụ):** khả năng đọc/sửa file, chạy lệnh, tìm kiếm hoặc kết nối dịch vụ.
- **Permissions (quyền):** quy định Claude được tự làm gì và việc nào phải hỏi bạn.
- **Verification (xác minh):** chạy test, xem diff, kiểm tra build hoặc đối chiếu yêu cầu để biết kết quả thực sự đạt chưa.

### Chế độ quyền

Tên hiển thị có thể đổi theo phiên bản, nhưng khóa dạy chọn mức giám sát phù hợp:

- **Manual/approval:** hỏi trước hành động cần quyền; hữu ích khi cần theo dõi sát.
- **Auto-accept:** có thể tự chấp nhận một số sửa đổi file, còn hành động khác vẫn có thể cần duyệt.
- **Plan Mode:** khảo sát và đề xuất kế hoạch bằng thao tác chủ yếu chỉ đọc.
- **Auto mode:** một số giao diện có chế độ hỏi ít hơn, kèm kiểm tra an toàn nền. Chế độ này không thay thế việc xem kết quả.

### Cách chọn

- Việc nhỏ, dễ hoàn tác: có thể cho phép thực hiện trong phạm vi hẹp, rồi xem diff.
- Việc liên quan auth, dữ liệu người dùng, dependency hoặc nhiều file: bắt đầu bằng Plan Mode.
- Lệnh có thể xóa dữ liệu, gửi nội dung ra ngoài, đổi cấu hình production hoặc tác động repo khác: đọc kỹ lệnh và quyền trước khi chấp nhận.

**Nguyên tắc:** chọn quyền dựa trên mức rủi ro và khả năng hoàn tác, không phải chỉ để giảm số lần bấm.

---

# Phần II — Prompt đầu tiên

## Bài 3. Installing Claude Code — Cài đặt Claude Code

- **Bài gốc:** [Installing Claude Code](https://academy.claude.com/courses/claude-code-101/installing-claude-code)
- **Video:** [Installing Claude Code — Claude](https://www.youtube.com/watch?v=0kILa02vKuI)
- **Thời lượng khóa học:** khoảng 6 phút

### Các môi trường khóa học giới thiệu

- **Terminal:** làm việc ngay trong repo; phù hợp với lệnh và scripting.
- **VS Code:** tích hợp trong editor.
- **JetBrains IDEs:** mở Claude Code trong IDE JetBrains.
- **Claude Desktop:** giao diện desktop để chọn dự án/thư mục và phiên làm việc.
- **Claude Code trên web:** làm việc với repo được hỗ trợ trên web; quyền truy cập local khác với phiên chạy trên máy.

Frontend developer có thể bắt đầu bằng terminal hoặc extension chính thức trong editor đang dùng. Không cần cài mọi tích hợp cùng lúc.

### Cách làm

1. Kiểm tra tài khoản và phương thức sử dụng; gói và khả năng truy cập có thể thay đổi.
2. Chọn một môi trường. Nếu muốn agent làm việc với repo local và gọi lệnh dự án, dùng terminal/IDE trên máy.
3. Cài từ nguồn chính thức; xem [hướng dẫn setup hiện hành](https://code.claude.com/docs/en/setup), không chạy lệnh cũ từ bài blog.
4. Mở đúng thư mục dự án rồi khởi chạy Claude Code.
5. Bắt đầu bằng yêu cầu chỉ đọc như mô tả cấu trúc repo hoặc tìm test script.
6. Kiểm tra đầu ra trước khi giao một thay đổi lớn.

### Thói quen an toàn

- Chỉ cài từ nguồn chính thức.
- Chạy Claude Code trong đúng thư mục dự án; tránh mở thư mục chứa dữ liệu cá nhân không liên quan.
- Không đưa API key, token, file .env hoặc dữ liệu khách hàng vào prompt.
- Trước khi chấp nhận install/build/test, hiểu lệnh có thể thay đổi gì.
- Xem các file được sửa sau tác vụ đầu tiên.

---

## Bài 4. Your first prompt — Prompt đầu tiên

- **Bài gốc:** [Your first prompt](https://academy.claude.com/courses/claude-code-101/your-first-prompt)
- **Video:** [Your first Claude Code prompt — Claude](https://www.youtube.com/watch?v=gbetp6D7J_Q)
- **Thời lượng khóa học:** khoảng 6 phút

### Một prompt rõ cần nói gì?

1. **Mục tiêu:** bạn muốn hoàn thành việc gì?
2. **Ngữ cảnh:** khu vực/luồng nào, dùng công nghệ nào?
3. **Phạm vi:** được sửa phần nào, phần nào cần giữ nguyên?
4. **Ràng buộc:** cần theo pattern nào, có được thêm dependency không?
5. **Tiêu chí thành công:** cần chạy test/build nào, hành vi nào phải hoạt động?
6. **Mức tự chủ:** chỉ phân tích, lập kế hoạch hay được thực hiện?

### Ví dụ theo từng bước

**Khảo sát — chưa sửa code:**

> “Trong ứng dụng Next.js này, hãy tìm luồng tải trang danh sách bài viết và cách xử lý loading, error, empty state. Chỉ đọc và báo file, component, hook/API cùng test liên quan. Chưa sửa file, chưa thêm dependency.”

**Lập kế hoạch:**

> “Tôi muốn thêm trạng thái retry cho lỗi tải danh sách. Đề xuất phương án tối thiểu theo cấu trúc hiện tại, nêu file sẽ sửa, hành vi người dùng, test cần thêm và rủi ro. Chưa viết code.”

**Thực hiện sau khi duyệt:**

> “Thực hiện kế hoạch đã duyệt. Không đổi API contract và không thêm dependency. Chạy test liên quan và lint. Báo file đã đổi, lệnh đã chạy, kết quả và phần chưa kiểm chứng.”

### Chọn chế độ

- **Plan Mode:** khi yêu cầu nhiều bước, chưa rõ hoặc cần xem phương án trước.
- **Manual/approval:** khi muốn duyệt từng hành động cần quyền.
- **Auto-accept:** chỉ khi hiểu phạm vi và chấp nhận một phần sửa file tự động.
- **Auto mode:** nếu dùng, vẫn xem diff và test trước khi chấp nhận kết quả.

Prompt rõ không loại bỏ lỗi, nhưng giúp agent bớt phải đoán. Nếu yêu cầu còn nhiều quyết định, nhờ Claude liệt kê câu hỏi cần làm rõ trước khi code.

---

# Phần III — Quy trình hằng ngày

## Bài 5. The Explore → Plan → Code → Commit workflow — Khảo sát → Lập kế hoạch → Code → Commit

- **Bài gốc:** [The explore → plan → code → commit workflow](https://academy.claude.com/courses/claude-code-101/the-explore-plan-code-commit-workflow)
- **Video:** [The Explore → Plan → Code → Commit workflow in Claude Code](https://www.youtube.com/watch?v=xJQuF02NAK8)
- **Thời lượng khóa học:** khoảng 8 phút

Đây là nhịp làm việc trung tâm. Nếu nhảy thẳng từ “tôi muốn tính năng X” sang “hãy code”, agent phải tự đoán cấu trúc, quy ước, ràng buộc và cách xác minh.

### 1. Explore — Khảo sát

Tìm hiểu hiện trạng trước khi quyết định thay đổi:

- File và thành phần nằm trong luồng cần sửa.
- Cách dữ liệu đi qua component, hook, service hoặc API.
- Quy ước đang có trong codebase.
- Test và lệnh kiểm tra phù hợp.
- Điểm chưa rõ hoặc cần bạn quyết định.

Không cần đọc mọi thứ; giới hạn khảo sát vào luồng liên quan.

### 2. Plan — Lập kế hoạch

Kế hoạch có thể kiểm tra được nên nêu:

- Các file dự định chỉnh.
- Hành vi trước và sau thay đổi.
- Test chứng minh từng tiêu chí.
- Rủi ro, phụ thuộc và quyết định còn thiếu.

Đọc và sửa kế hoạch trước khi thực thi. Đây thường là lúc dễ phát hiện hiểu nhầm nhất.

### 3. Code — Thực hiện

Sau khi duyệt, Claude thực hiện từng phần. Bạn có thể yêu cầu làm theo nhóm file, không mở rộng yêu cầu, giữ nguyên API công khai và chạy test sau mỗi thay đổi. Nếu phát hiện kế hoạch lệch, dừng sớm và cập nhật kế hoạch.

### 4. Commit — Kiểm tra rồi lưu thay đổi

“Commit” không có nghĩa phải để agent tự commit mà không hỏi bạn. Trước khi hoàn tất:

- Xem diff.
- Tìm file ngoài phạm vi, test bị bỏ/giảm, dependency mới, URL/key hard-code.
- Chạy test/build phù hợp.
- Có thể xin một lượt review trong context mới.
- Chỉ commit khi bạn hiểu và chấp nhận thay đổi.

### Prompt mẫu cho feature frontend

> “Khảo sát trước, chưa sửa file: cần thêm empty state và nút thử lại cho trang danh sách. Tìm luồng data-fetching, component hiện có, style pattern và test. Lập kế hoạch tối thiểu kèm tiêu chí chấp nhận. Không đổi API contract, không thêm dependency. Chờ tôi duyệt rồi mới thực hiện. Khi code xong, chạy test/lint, xem diff và báo phần chưa kiểm chứng.”

Với thay đổi nhỏ có thể gộp bước, nhưng vẫn yêu cầu agent nêu file dự định sửa và cách xác minh. Với thay đổi rộng, nhạy cảm hoặc khó hoàn tác, tách rõ từng bước.

---

## Bài 6. Context management — Quản lý ngữ cảnh

- **Bài gốc:** [Context management](https://academy.claude.com/courses/claude-code-101/context-management)
- **Video:** [Context Management in Claude Code — Claude](https://www.youtube.com/watch?v=eW3oTyfeWZ0)
- **Thời lượng khóa học:** khoảng 7 phút

### Context là gì?

Context là thông tin Claude có thể dùng trong phiên: prompt, lịch sử, file đã đọc, output lệnh và kết quả công cụ. Hãy tưởng tượng nó như bàn làm việc tạm thời: quá nhiều nội dung cũ hoặc không liên quan khiến chỗ cho thông tin mới bị ít đi.

Context không có nghĩa Claude nhớ mọi thứ mãi mãi. Phiên mới có thể không chứa lịch sử cũ; quy tắc dài hạn nên được ghi vào file phù hợp như CLAUDE.md.

### Ba lệnh của bài học

- **/context:** xem tổng quan context đang dùng và nhóm nội dung chiếm nhiều chỗ.
- **/compact:** tóm tắt lịch sử để giải phóng chỗ nhưng giữ lại điều cần cho công việc đang tiếp tục. Tóm tắt có thể làm mất chi tiết, nên bổ sung quyết định quan trọng.
- **/clear:** xóa ngữ cảnh hội thoại hiện tại và bắt đầu việc mới.

### Cách giữ context hữu ích

1. Prompt cụ thể để Claude không phải dò repo quá rộng.
2. Chia tác vụ lớn thành phần có đầu ra rõ.
3. Sau một phần việc, yêu cầu tóm tắt quyết định, file và test trước khi tiếp tục.
4. Dùng /compact khi tiếp tục cùng feature nhưng phiên đã dài.
5. Dùng /clear khi chuyển hẳn sang nhiệm vụ khác.
6. Chỉ bật MCP server cần cho dự án; mô tả tool cũng có thể dùng context.
7. Dùng subagent cho khảo sát dài khi phiên chính chỉ cần kết luận.

**Ví dụ:** sau một phiên dài khảo sát auth, bạn muốn sửa bug refresh token. Giữ lại phát hiện liên quan bằng một bản tóm tắt rồi compact. Khi xong auth và chuyển sang chỉnh CSS landing page, dùng context mới để thông tin cũ không gây nhiễu.

---

## Bài 7. Code review — Review code

- **Bài gốc:** [Code review](https://academy.claude.com/courses/claude-code-101/code-review)
- **Video:** playlist YouTube công khai không có video riêng về code review.
- **Thời lượng khóa học:** khoảng 10 phút

### Vì sao cần review?

Phiên viết code có thể tóm tắt thay đổi rất gọn dù đã sửa nhiều file. Một lượt review trong context sạch giúp nhìn lại thay đổi từ góc khác. Nó hỗ trợ người dùng, không thay thế quyết định của người review.

### Quy trình review bằng chứng

1. **Đọc diff.** Diff thể hiện dòng nào được thêm/xóa từng file. Bài học giới thiệu **/diff**, cần repo được quản lý bằng Git để đọc các thay đổi Git ghi nhận.
2. **Tìm thay đổi ngoài yêu cầu.** Có file config hoặc helper không liên quan bị sửa không?
3. **Kiểm tra test.** Có test bị xóa, bỏ qua hoặc nới lỏng để chạy qua không?
4. **Kiểm tra dependency và giá trị hard-code.** Có package mới, URL, key hoặc môi trường cố định không?
5. **Xin ý kiến trong context sạch.** Bài học giới thiệu **/code-review**; bạn cũng có thể yêu cầu review bằng lời. Reviewer thường báo phát hiện, không tự sửa trừ khi được yêu cầu.
6. **Phân loại từng finding:** sửa ngay, hỏi/kiểm chứng thêm, hoặc ghi lại để xử lý sau.
7. **Sau khi sửa, xác minh lại:** chạy test liên quan và xem output.

Nhận xét của AI cũng có thể sai. Nếu reviewer báo hàm không xử lý khoảng trắng nhưng code đã gọi trim, yêu cầu chỉ ra đường đi dữ liệu/test rồi kiểm tra lại; đừng sửa mù quáng.

Bài học cũng nhắc **/rewind** để quay lại thay đổi do Claude tạo. Tác động từ shell như cài package có thể không được hoàn tác cùng lúc. Kiểm tra trước khi dùng lệnh rollback.

---

# Phần IV — Tùy chỉnh Claude Code

## Bài 8. The CLAUDE.md file — File CLAUDE.md

- **Bài gốc:** [The CLAUDE.md file](https://academy.claude.com/courses/claude-code-101/the-claude-md-file)
- **Video:** [The CLAUDE.md file — Claude](https://www.youtube.com/watch?v=O0FGCxkHM-U)
- **Thời lượng khóa học:** khoảng 10 phút

### File này giải quyết vấn đề gì?

Nếu mỗi phiên bạn phải nhắc “dùng pnpm”, “test ở đâu”, “đừng sửa API contract”, hãy cân nhắc ghi các quy tắc ấy vào hướng dẫn dự án. Claude Code có thể nạp CLAUDE.md làm ngữ cảnh lâu dài khi mở phiên.

File này giống onboarding ngắn cho agent:

- Dự án dùng framework/package manager nào?
- Lệnh dev, test, build, lint là gì?
- Cấu trúc module và quy ước nào cần biết?
- Quy tắc quan trọng nào phải tuân thủ?
- Hành động nào cần hỏi trước?

### Ví dụ cho repo React/Next.js

Thay lệnh bằng lệnh thật trong dự án của bạn.

~~~md
# Project

Ứng dụng Next.js dùng TypeScript và App Router.
Ưu tiên theo kiến trúc và pattern đang có trong repo.

## Commands

- Cài dependency: pnpm install
- Chạy web: pnpm dev
- Kiểm tra kiểu: pnpm typecheck
- Chạy test: pnpm test
- Lint: pnpm lint

## Rules

- Đọc component/hook tương tự trước khi tạo pattern mới.
- Không thêm dependency nếu chưa giải thích lý do và được duyệt.
- Không thay đổi API contract ngoài phạm vi task.
- Thay đổi hành vi phải có test phù hợp.
- Báo file đã sửa và lệnh kiểm tra đã chạy.
~~~

### Cách viết hữu ích

- Bắt đầu từ những quy tắc phải nhắc lại nhiều lần.
- Ghi lệnh chạy đúng, không ghi lệnh phỏng đoán.
- Giữ file ngắn; chuyển tài liệu chi tiết sang nơi phù hợp.
- Tách sở thích cá nhân khỏi quy ước dùng chung.
- Có thể dùng **/init** để tạo bản nháp, sau đó review kỹ trước khi commit.

File cấp dự án có thể được đưa vào version control cho cả nhóm. Hướng dẫn cấp người dùng dành cho sở thích cá nhân. Cấu trúc chính xác có thể đổi; xem [tài liệu Memory](https://code.claude.com/docs/en/memory).

---

## Bài 9. Subagents — Tác nhân phụ

- **Bài gốc:** [Subagents](https://academy.claude.com/courses/claude-code-101/subagents)
- **Video:** playlist YouTube công khai không có video riêng về subagents.
- **Thời lượng khóa học:** khoảng 6 phút

### Subagent là gì?

Subagent là tác nhân phụ nhận nhiệm vụ hẹp với context riêng. Nó có thể khảo sát file hoặc nghiên cứu lâu rồi gửi tóm tắt về phiên chính. Cách này giữ cho phiên chính không phải chứa mọi bước dò tìm.

Ví dụ, bạn sửa luồng subscription và muốn biết nơi lưu trạng thái. Giao subagent chỉ đọc repo, trả lại model/schema, service, test và điểm chưa chắc chắn.

### Nên dùng khi

- Khảo sát nhiều thư mục để tìm một luồng.
- Tìm nguyên nhân lỗi độc lập với phần sửa.
- Review thay đổi bằng góc nhìn sạch.
- Nghiên cứu khu vực không xung đột với việc khác.

### Không nên dùng khi

- Tác vụ nhỏ và việc điều phối tốn hơn lợi ích.
- Nhiều agent cùng sửa một file mà chưa có kế hoạch tích hợp.
- Nhiệm vụ cần duy trì một chuỗi quyết định thống nhất.

Khóa học hướng dẫn bắt đầu bằng **/agents** để chọn mục tiêu, phạm vi và tool được phép dùng. Hãy thử agent chỉ đọc trước.

> “Dùng một subagent chỉ đọc để tìm mọi nơi gọi API lấy hồ sơ người dùng. Trả về danh sách file, đường đi dữ liệu và test liên quan; không sửa file.”

---

## Bài 10. Skills — Kỹ năng dùng lại

- **Bài gốc:** [Skills](https://academy.claude.com/courses/claude-code-101/skills)
- **Video:** playlist YouTube công khai không có video riêng về Skills.
- **Thời lượng khóa học:** khoảng 3 phút

### Skill làm gì?

Nếu thường xuyên giải thích cùng một quy trình — review PR, viết test component, ghi tài liệu API — bạn có thể đóng gói hướng dẫn thành một **skill**. Skill thường gồm file hướng dẫn **SKILL.md**, có thể kèm script hoặc tài liệu tham khảo. Claude có thể nhận ra mô tả phù hợp và nạp chi tiết khi cần.

### Phân biệt công cụ

| Nhu cầu | Thành phần phù hợp |
|---|---|
| “Luôn dùng pnpm và chạy test trước khi báo xong” | CLAUDE.md |
| “Khi review PR, áp dụng checklist này” | Skill |
| “Mỗi lần sửa file phải chạy formatter” | Hook có thể phù hợp hơn |
| “Lấy nội dung ticket từ hệ thống dự án” | MCP có thể phù hợp |

CLAUDE.md giữ ngữ cảnh/quy tắc luôn cần biết. Skill phù hợp với quy trình hoặc kiến thức chuyên biệt chỉ cần khi có tác vụ tương ứng. Slash command thường do bạn gọi rõ; skill có thể được tự chọn khi yêu cầu khớp, tùy cấu hình.

### Ví dụ frontend

Skill **component-test** có thể hướng dẫn agent: xem test gần giống, dùng thư viện đang có, kiểm tra hành vi người dùng, bao phủ loading/error/success và chạy test liên quan.

Đừng tạo skill cho tác vụ một lần. Hãy đóng gói quy trình sau khi thấy nó được lặp lại và thực sự ổn định.

---

## Bài 11. MCP — Model Context Protocol

- **Bài gốc:** [MCP](https://academy.claude.com/courses/claude-code-101/mcp)
- **Video:** [MCP in Claude Code — Claude](https://www.youtube.com/watch?v=kkBFmwkDzdo)
- **Thời lượng khóa học:** khoảng 6 phút

### MCP là gì?

MCP là chuẩn kết nối để ứng dụng AI sử dụng tool hoặc nguồn dữ liệu bên ngoài theo một cách có cấu trúc. Nếu thông tin nằm trong ticket, tài liệu nội bộ hoặc hệ thống khác, MCP có thể tạo cầu nối để Claude Code truy vấn hoặc thao tác qua server phù hợp.

Ví dụ: lấy nội dung ticket Linear trước khi sửa bug, hoặc tra tài liệu mới của thư viện UI.

### Hai kiểu kết nối khóa giới thiệu

- **HTTP server:** dịch vụ ở xa, kết nối qua mạng.
- **stdio server:** tiến trình cục bộ; Claude Code giao tiếp qua stdin/stdout.

Khóa học đề cập lệnh **claude mcp add** để thêm server và **/mcp** để kiểm tra kết nối trong phiên. Xem tài liệu của đúng server vì cách cài đặt/xác thực khác nhau.

### Ba phạm vi cấu hình

- **Local:** chỉ dự án hiện tại của bạn.
- **User:** dùng qua nhiều dự án cá nhân.
- **Project:** chia sẻ cấu hình trong repo, thường qua file **.mcp.json**.

### Context và quyền

Mỗi MCP server có thể cung cấp danh sách tool cùng mô tả; chúng làm tăng context. MCP cũng có thể mở tới dữ liệu hoặc hành động ngoài repo. Trước khi thêm server:

- Xác minh nhà phát triển và nguồn.
- Đọc dữ liệu/quyền hành động được yêu cầu.
- Không commit credential hoặc đưa key vào prompt.
- Chỉ bật server cần thiết.
- Phân biệt rõ thao tác đọc với thao tác ghi.

Nếu có CLI phù hợp cho tác vụ ngắn, CLI có thể gọn context hơn. Skill dạy quy trình; MCP cung cấp kết nối.

---

## Bài 12. Hooks — Móc sự kiện tự động

- **Bài gốc:** [Hooks](https://academy.claude.com/courses/claude-code-101/hooks)
- **Video:** [Hooks in Claude Code — Claude](https://www.youtube.com/watch?v=IkaPHiMDazM)
- **Thời lượng khóa học:** khoảng 6 phút

### Hooks giải quyết điều gì?

Bạn có thể nhắc Claude “chạy formatter sau khi sửa file”, nhưng một lời nhắc bằng ngôn ngữ tự nhiên không bảo đảm luôn được làm. **Hook** là lệnh/chương trình được cấu hình để chạy tại một sự kiện cụ thể trong vòng đời Claude Code. Vì vậy, hook phù hợp với bước cần lặp lại có tính xác định.

### Một số sự kiện

- **PreToolUse:** trước khi Claude gọi tool.
- **PostToolUse:** sau khi tool hoàn tất.
- **UserPromptSubmit:** khi bạn gửi prompt.
- **Stop:** khi Claude kết thúc lượt trả lời.
- **Notification:** khi Claude tạo thông báo.

Khóa học giới thiệu cấu hình bằng **/hooks** hoặc settings file.

### Ví dụ

- Sau khi sửa file TypeScript, chạy formatter của dự án.
- Ghi log hoạt động cần audit.
- Từ chối một nhóm hành động không được phép.
- Hiện thông báo khi tác vụ dài kết thúc.

Có thể chia thành hai nhóm: **hậu xử lý** như format/log, và **guardrail** như kiểm tra/từ chối tool trước khi chạy. Hook chỉ đáng tin khi script, matcher, cấu hình và cách xử lý lỗi đã được kiểm thử.

Hook trong cấu hình dự án có thể được chia sẻ qua repo; review script như review code thường. Tránh để hook gọi lệnh phá hủy dữ liệu hoặc dùng secret. Thử trên repo an toàn trước. Tham khảo [hướng dẫn Hooks](https://code.claude.com/docs/en/hooks-guide) và [tài liệu tham chiếu Hooks](https://code.claude.com/docs/en/hooks).

---

# Bản đồ chọn tính năng

| Nếu bạn muốn… | Chọn |
|---|---|
| Claude luôn biết quy ước và lệnh dự án | CLAUDE.md |
| Tái sử dụng quy trình cho một loại công việc | Skill |
| Kết nối dữ liệu/tool bên ngoài | MCP |
| Tách khảo sát dài khỏi context chính | Subagent |
| Tự chạy việc tại một event hoặc áp guardrail | Hook |
| Xem thay đổi Git | /diff hoặc công cụ Git |
| Review trong context sạch | /code-review hoặc yêu cầu review riêng |
| Tiếp tục việc hiện tại nhưng phiên dài | /compact |
| Bắt đầu việc hoàn toàn mới | /clear |

**Mẹo nhớ:** CLAUDE.md = luôn cần biết; Skill = khi gặp đúng việc; MCP = kết nối hệ thống; Subagent = context phụ; Hook = tự động hóa theo event.

---

# Bài luyện tập cuối khóa: thêm trạng thái retry cho trang danh sách

Thử trên nhánh riêng hoặc repo an toàn.

## A. Khảo sát

> “Chỉ khảo sát trang danh sách người dùng: tìm route/page, component, hook/API, trạng thái loading/error/empty và test. Không sửa file. Báo luồng dữ liệu và lệnh test.”

Kiểm tra agent đã tìm đúng luồng chưa. Nếu chưa, bổ sung route hoặc từ khóa.

## B. Lập kế hoạch

> “Lập kế hoạch tối thiểu để hiển thị nút thử lại khi API tải danh sách thất bại. Giữ API contract và style hiện có. Nêu file dự định sửa, hành vi khi retry, test và tiêu chí thành công. Chưa code.”

Duyệt kế hoạch, đặc biệt xem lỗi, retry và test.

## C. Thực hiện và xác minh

Sau khi duyệt, yêu cầu thực hiện rồi kiểm tra:

- Nút retry có gọi lại đúng query không?
- Loading state có xuất hiện khi gọi lại không?
- Lỗi còn hiển thị nếu retry thất bại không?
- Test có bao phủ error → retry → success và retry thất bại không?
- Claude có sửa file ngoài phạm vi không?
- Test/lint/build chạy ra kết quả gì?

## D. Review

> “Review diff trong context sạch. Chỉ báo lỗi có bằng chứng, nhất là thay đổi ngoài yêu cầu, test bị giảm, retry sai và accessibility của nút. Chưa tự sửa.”

Đối chiếu từng finding với code/test. Chỉ thêm quy tắc vào CLAUDE.md hoặc skill nếu đó là kiến thức lặp lại hữu ích.

---

# Tự kiểm tra

### 1. Claude Code khác chatbot thông thường ở đâu?

**Gợi ý trả lời:** Claude Code dùng công cụ để đọc/sửa repo, chạy lệnh và xác minh trong phạm vi quyền được cấp; chatbot thường chủ yếu trả lời trong chat.

### 2. Vòng lặp agent gồm những bước nào?

**Gợi ý trả lời:** Nhận mục tiêu → thu thập context → gọi tool → thực hiện → xem kết quả/xác minh → lặp lại hoặc báo hoàn tất.

### 3. Khi nào bắt đầu bằng Plan Mode?

**Gợi ý trả lời:** Khi việc nhiều bước, phạm vi chưa rõ, có rủi ro hoặc cần xem phương án trước khi sửa.

### 4. /compact khác /clear thế nào?

**Gợi ý trả lời:** /compact tóm tắt để tiếp tục cùng công việc; /clear bắt đầu context mới.

### 5. CLAUDE.md và skill khác nhau thế nào?

**Gợi ý trả lời:** CLAUDE.md giữ ngữ cảnh/quy tắc nền; skill chứa quy trình hoặc kiến thức chuyên biệt dùng khi phù hợp.

### 6. MCP khác hook thế nào?

**Gợi ý trả lời:** MCP kết nối tới tool/dữ liệu bên ngoài; hook chạy lệnh theo một event trong vòng đời Claude Code.

### 7. Vì sao cần xem diff nếu Claude đã báo “xong”?

**Gợi ý trả lời:** Tóm tắt có thể bỏ sót chi tiết; diff cho thấy thay đổi thật, kể cả ngoài phạm vi, test yếu đi hay dependency mới.

### 8. Khi nào nên dùng subagent?

**Gợi ý trả lời:** Khi có khảo sát dài/tách biệt và phiên chính chỉ cần kết quả tóm tắt.

### 9. Reviewer AI báo lỗi nhưng bạn nghĩ code đã xử lý rồi. Làm gì?

**Gợi ý trả lời:** Yêu cầu chỉ ra dòng, đường đi dữ liệu hoặc test; xác minh trước khi sửa.

### 10. Muốn formatter chạy theo mỗi lần sửa file thì dùng gì?

**Gợi ý trả lời:** Hook là lựa chọn phù hợp hơn lời nhắc, vì hook chạy theo event được cấu hình; vẫn phải kiểm thử cấu hình/script.

---

# Thuật ngữ Anh — Việt

| Thuật ngữ | Nghĩa dễ nhớ |
|---|---|
| Agentic coding tool | Công cụ lập trình có thể dùng tool và thực hiện nhiều bước để đạt mục tiêu |
| Agentic loop | Vòng lặp thu thập ngữ cảnh → hành động → xác minh |
| Context window | Dung lượng thông tin làm việc của phiên hiện tại |
| Permission mode | Chế độ kiểm soát mức tự chủ/duyệt hành động |
| Plan Mode | Chế độ khảo sát và đề xuất kế hoạch trước khi thực hiện |
| Diff | Bản so sánh dòng code thêm/xóa/thay đổi |
| CLAUDE.md | File hướng dẫn/ngữ cảnh lâu dài cho dự án hoặc người dùng |
| Subagent | Tác nhân phụ có context riêng, trả kết quả cho tác nhân chính |
| Skill | Gói hướng dẫn/quy trình dùng lại, thường nạp theo nhu cầu |
| MCP | Chuẩn kết nối công cụ và dữ liệu bên ngoài |
| Hook | Lệnh gắn với sự kiện để tự động hóa hoặc áp guardrail |

---

# Tài liệu chính thức để tra cứu

- [Claude Code 101 — khóa học và 12 bài](https://academy.claude.com/courses/claude-code-101)
- [Playlist Claude Code 101 của kênh Claude](https://www.youtube.com/playlist?list=PLmWCw1CzcFilebjK89WLb5cAvM8K0cLB3)
- [Cài đặt và cập nhật Claude Code](https://code.claude.com/docs/en/setup)
- [Cấu hình quyền](https://code.claude.com/docs/en/permissions)
- [Claude Code hoạt động thế nào](https://code.claude.com/docs/en/how-claude-code-works)
- [Tổng quan tính năng mở rộng](https://code.claude.com/docs/en/features-overview)
- [Skills](https://code.claude.com/docs/en/skills)
- [Subagents](https://code.claude.com/docs/en/sub-agents)
- [Hooks: hướng dẫn](https://code.claude.com/docs/en/hooks-guide)
- [Hooks: tham chiếu](https://code.claude.com/docs/en/hooks)

*Tài liệu được kiểm tra theo các trang công khai ngày 29-09-2026. Khóa học và sản phẩm có thể được cập nhật sau thời điểm này.*

