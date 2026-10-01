# Claude Code 101 — Bản Việt hóa và giảng lại

> Biên soạn từ khóa **Claude Code 101** trên Anthropic Academy/Skilljar, truy cập ngày 29-09-2026. Đây là bản giảng lại bằng tiếng Việt: giữ đủ ý chính, diễn giải theo cách dễ học, bổ sung ví dụ và bài thực hành; không phải bản chép lời nguyên văn.

- Trang khóa học: <https://anthropic.skilljar.com/claude-code-101>
- Cấu trúc: 4 chặng, 12 bài nội dung và 1 bài kiểm tra cuối khóa gồm 7 câu.
- Mỗi bài bên dưới có liên kết tới bài gốc và video YouTube tương ứng.
- Lưu ý: giao diện, lệnh, mô hình và chính sách quyền của Claude Code có thể thay đổi theo phiên bản. Khi thao tác trên dự án thật, hãy đối chiếu tài liệu hiện hành và luôn xem lại thay đổi trước khi hợp nhất.

## Mục lục và lộ trình học

### Chặng 1 — Hiểu Claude Code

1. Claude Code là gì?
2. Claude Code hoạt động như thế nào?

### Chặng 2 — Viết lời nhắc đầu tiên

3. Cài đặt Claude Code
4. Lời nhắc đầu tiên

### Chặng 3 — Quy trình làm việc hằng ngày

5. Explore → Plan → Code → Commit
6. Quản lý ngữ cảnh
7. Rà soát mã nguồn

### Chặng 4 — Tùy biến Claude Code

8. Tệp `CLAUDE.md`
9. Subagents
10. Skills
11. MCP
12. Hooks

### Kết thúc

13. Ôn tập và chuẩn bị cho bài kiểm tra 7 câu

---

## 1. Claude Code là gì?

- Bài gốc: <https://anthropic.skilljar.com/claude-code-101/469788>
- Video: [What is Claude Code?](https://www.youtube.com/watch?v=fl1DSmwQKKY)

### Ý tưởng cốt lõi

Claude Code là một **tác nhân lập trình** (agentic coding tool), không chỉ là hộp chat trả lời bằng văn bản. Nó có thể đọc và hiểu codebase, sửa nhiều tệp, chạy lệnh terminal, quan sát kết quả, rồi tiếp tục hành động để hoàn thành mục tiêu.

Điểm khác biệt với Claude.ai thông thường nằm ở quyền tiếp cận môi trường làm việc. Trong một cuộc trò chuyện thông thường, bạn phải sao chép mã vào và chép câu trả lời ra. Với Claude Code, tác nhân có thể trực tiếp đọc tệp trong phạm vi được cấp, chỉnh sửa chúng và chạy các công cụ phát triển.

### “Agent” nghĩa là gì?

Một AI agent gồm ba phần:

1. **Mục tiêu** do người dùng giao, chẳng hạn “tìm nguyên nhân lỗi đăng nhập và sửa nó”.
2. **Mô hình suy luận** để quyết định bước tiếp theo.
3. **Công cụ** để tác động vào môi trường: đọc tệp, tìm kiếm, chỉnh sửa, chạy kiểm thử, gọi dịch vụ bên ngoài…

Agent làm việc theo vòng lặp: quan sát → suy luận → hành động → kiểm tra. Vì vậy, nó có thể tự tìm những tệp liên quan thay vì bắt bạn cung cấp toàn bộ codebase từ đầu.

### Claude Code có thể làm gì?

- Giải thích một tính năng hoặc lần theo luồng dữ liệu qua nhiều tệp.
- Tìm nguyên nhân của lỗi và đề xuất cách sửa.
- Refactor một hàm rồi cập nhật mọi nơi đang gọi hàm đó.
- Chạy build, test, lint, type-check hoặc cài dependency.
- Đọc tài liệu mới trên web khi được cho phép.
- Kết nối với công cụ và nguồn dữ liệu bên ngoài qua MCP.

### Ba điều phải nhớ khi sử dụng

**Ngữ cảnh là hữu hạn.** Claude không thể giữ mọi thứ mãi mãi trong “bộ nhớ làm việc”. Nó phải lựa chọn tệp nào cần đọc và có thể phải tóm tắt cuộc hội thoại khi ngữ cảnh đầy.

**Quyền luôn quan trọng.** Ở chế độ thận trọng, Claude hỏi trước khi sửa tệp hoặc chạy lệnh. Bạn có thể tăng mức tự động hóa, nhưng mức quyền càng cao thì yêu cầu kiểm tra càng nghiêm ngặt.

**Claude vẫn có thể sai.** Nó có thể hiểu nhầm yêu cầu, sửa quá nhiều, tạo lỗi mới hoặc làm giải pháp phức tạp hơn mức cần thiết. Kết quả của agent phải được xem là thay đổi cần kiểm chứng, không phải chân lý.

### Ví dụ thực tế

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

### Bài thực hành

Mở một dự án nhỏ và yêu cầu Claude chỉ đọc:

```text
Hãy mô tả kiến trúc dự án này, điểm vào của ứng dụng,
các lệnh chạy chính và ba tệp quan trọng nhất. Chưa thay đổi tệp nào.
```

Mục tiêu là quan sát cách Claude tự tìm ngữ cảnh thay vì đưa ngay toàn bộ dự án vào lời nhắc.

---

## 2. Claude Code hoạt động như thế nào?

- Bài gốc: <https://anthropic.skilljar.com/claude-code-101/469789>
- Video: [How Claude Code works](https://www.youtube.com/watch?v=6bs5b4FltCU)

### Vòng lặp tác nhân

Khóa học mô tả quy trình như sau:

1. Bạn gửi prompt.
2. Claude xác định ngữ cảnh còn thiếu và gọi công cụ để thu thập nó.
3. Claude thực hiện hành động, ví dụ đọc tệp, sửa mã hoặc chạy lệnh.
4. Claude quan sát kết quả và kiểm tra xem mục tiêu đã đạt chưa.
5. Nếu chưa đạt, Claude điều chỉnh và lặp lại; nếu đạt, nó báo kết quả và chờ prompt mới.

Bạn không cần đứng ngoài vòng lặp. Trong lúc Claude chạy, bạn có thể bổ sung thông tin, sửa hướng hoặc ngắt khi thấy nó đang đi sai đường.

### Cửa sổ ngữ cảnh

Cửa sổ ngữ cảnh chứa hội thoại, nội dung tệp đã đọc, kết quả lệnh, mô tả công cụ và các chỉ dẫn như `CLAUDE.md`. Khi gần đầy, Claude Code thực hiện **compaction**: tóm tắt phần quan trọng và bỏ bớt chi tiết ít liên quan. Việc này kéo dài phiên làm việc nhưng có thể làm mất một số sắc thái.

Hệ quả thực hành: đừng bắt Claude đọc hàng trăm tệp “cho chắc”. Hãy giao mục tiêu rõ để nó chỉ lấy đúng ngữ cảnh cần thiết.

### Công cụ

Mô hình ngôn ngữ tự nó chỉ sinh văn bản. Công cụ biến văn bản thành hành động. Khi Claude gọi công cụ đọc tệp, kết quả quay lại cửa sổ ngữ cảnh; khi nó sửa tệp hoặc chạy test, kết quả cũng quay lại để phục vụ bước suy luận kế tiếp.

### Chế độ quyền cơ bản trong bài 101

- **Approval/default:** hỏi trước khi sửa tệp hoặc chạy shell command.
- **Auto-accept edits:** tự chấp nhận chỉnh sửa tệp, nhưng lệnh vẫn có thể cần duyệt.
- **Plan mode:** chỉ dùng công cụ đọc để khảo sát và lập kế hoạch; không thay đổi mã.

Thiết lập quyền có thể cấu hình thêm. Nguyên tắc an toàn là chỉ cấp mức quyền đủ cho công việc hiện tại và không dùng quyền rộng hơn chỉ để bớt một vài lần xác nhận.

### Cách đọc “hành vi” của Claude

Khi Claude làm sai, hãy xác định nó sai ở khâu nào:

- Thiếu ngữ cảnh → chỉ cho nó tệp, log hoặc yêu cầu liên quan.
- Hiểu sai mục tiêu → viết lại tiêu chí thành công.
- Chọn sai hành động → chuyển sang Plan mode và duyệt kế hoạch.
- Không kiểm chứng → yêu cầu test/lint/type-check và xem bằng chứng.

---

## 3. Cài đặt Claude Code

- Bài gốc: <https://anthropic.skilljar.com/claude-code-101/469790>
- Video: [Installing Claude Code](https://www.youtube.com/watch?v=0kILa02vKuI)

Claude Code có thể dùng trong terminal, Visual Studio Code, JetBrains, Claude Desktop hoặc trên web.

### Terminal

Khóa học nêu các lựa chọn cài đặt theo hệ điều hành:

- macOS/Linux/WSL: trình cài đặt bằng `curl`; Homebrew là lựa chọn khác nhưng theo bài học không hỗ trợ tự cập nhật.
- Windows: PowerShell với `Invoke-RestMethod`, CMD với `curl`, hoặc `winget`; bài học lưu ý bản `winget` không tự cập nhật.

Do lệnh cài đặt có thể thay đổi, nên lấy lệnh hiện hành từ tài liệu chính thức thay vì sao chép một lệnh cũ. Sau khi cài đặt, đóng/mở lại terminal nếu lệnh chưa xuất hiện, chuyển đến thư mục dự án và chạy:

```bash
claude
```

Lần đầu, bạn chọn giao diện màu và đăng nhập bằng tài khoản Claude phù hợp hoặc API key. Nếu tổ chức cấp tài khoản Enterprise, chọn đúng luồng Enterprise.

**Phạm vi tệp:** Claude có quyền làm việc trong thư mục nơi bạn chạy lệnh và các thư mục con. Vì vậy, hãy `cd` vào đúng repository; không khởi chạy ở một thư mục quá rộng chỉ vì tiện.

### Visual Studio Code

1. Mở Extensions.
2. Tìm “Claude Code”.
3. Chọn extension của Anthropic có dấu xác minh.
4. Cài đặt và khởi động lại VS Code nếu cần.
5. Mở Command Palette bằng `Ctrl/Cmd + Shift + P`, tìm “Claude Code: Open in New Tab”, hoặc dùng biểu tượng Claude ở thanh bên.

Trải nghiệm gần giống terminal, nhưng tích hợp tự nhiên hơn với editor. Bạn vẫn có thể chọn dùng trải nghiệm terminal trong phần cài đặt.

### JetBrains

Cài plugin Claude Code từ JetBrains Marketplace, khởi động lại IDE, rồi mở bảng Claude từ biểu tượng xuất hiện trong IDE.

### Desktop và web

- **Claude Desktop:** chuyển sang chế độ Code, chọn thư mục, đặt quyền và có thể giao tác vụ chạy nền.
- **Web:** truy cập <https://claude.ai/code>; phù hợp với repository GitHub và làm việc từ xa.

### Chọn bề mặt nào?

- Terminal: thường nhận tính năng mới sớm nhất và phù hợp người quen CLI.
- IDE: tốt khi muốn xem mã và agent cạnh nhau.
- Desktop: tiện cho tác vụ chạy nền.
- Web: tiện khi repository ở GitHub và không muốn phụ thuộc máy đang dùng.

### Kiểm tra sau cài đặt

Trong một dự án thử nghiệm, xác nhận bốn việc: lệnh khởi động được, tài khoản đúng, thư mục làm việc đúng, và Claude chỉ có mức quyền bạn mong muốn.

---

## 4. Lời nhắc đầu tiên

- Bài gốc: <https://anthropic.skilljar.com/claude-code-101/469791>
- Video: [Your first prompt](https://www.youtube.com/watch?v=gbetp6D7J_Q)

### Chọn mức tham gia của bạn

Nhấn `Shift + Tab` để chuyển giữa các chế độ được giao diện cung cấp:

- Approval: Claude xin phép trước mỗi thay đổi hoặc lệnh đáng kể.
- Auto-accept edits: tự chấp nhận chỉnh sửa tệp; lệnh vẫn cần quyền theo cấu hình.
- Plan mode: nghiên cứu bằng công cụ chỉ đọc, hỏi thêm nếu cần và tạo kế hoạch trước khi viết mã.

Không có chế độ “đúng cho mọi lúc”. Khi học hoặc đụng đến mã nhạy cảm, Approval/Plan mode giúp quan sát kỹ. Khi đã có test tốt và thay đổi có phạm vi hẹp, bạn có thể tăng tự động hóa.

### Công thức cho prompt tốt

Một prompt hữu ích nên nói rõ:

1. **Kết quả mong muốn:** người dùng cuối thấy điều gì?
2. **Phạm vi:** phần nào được phép thay đổi, phần nào không?
3. **Ràng buộc:** framework, style, dependency, tương thích…
4. **Tiêu chí thành công:** test, hành vi, hiệu năng hoặc giao diện nào phải đạt?
5. **Cách làm việc:** khảo sát/lập kế hoạch trước hay triển khai ngay?

### Ví dụ dark mode của khóa học

Yêu cầu không chỉ là “thêm dark mode”, mà cần nói vị trí công tắc, phạm vi toàn ứng dụng và yêu cầu màu tương phản dựa trên theme sáng hiện có. Trong Plan mode, Claude tìm cấu trúc theme, hỏi điều chưa rõ và đưa ra kế hoạch. Bạn duyệt kế hoạch trước khi cho phép thực thi.

Mẫu prompt Việt hóa:

```text
Ứng dụng cần dark mode trên toàn bộ giao diện.
Hãy đặt công tắc chuyển theme ở header và tìm bảng màu tối có độ tương phản
phù hợp với theme sáng hiện tại. Trước tiên dùng Plan mode để khảo sát cách
ứng dụng đang quản lý theme, liệt kê các tệp sẽ sửa và cách kiểm thử.
Chưa viết mã cho đến khi tôi duyệt kế hoạch.
```

### Cách phản hồi một kế hoạch chưa tốt

Đừng nói “làm lại”. Hãy chỉ ra phần cần sửa:

```text
Giữ nguyên bước 1 và 2. Ở bước 3, không thêm dependency mới;
hãy tận dụng CSS variables hiện có. Bổ sung kiểm thử cho việc lưu lựa chọn
theme sau khi tải lại trang.
```

---

## 5. Explore → Plan → Code → Commit

- Bài gốc: <https://anthropic.skilljar.com/claude-code-101/469792>
- Video: [The explore → plan → code → commit workflow](https://www.youtube.com/watch?v=xJQuF02NAK8)

Đây là quy trình trung tâm của khóa học. Nhảy thẳng vào viết mã thường tạo nhiều vòng sửa sai; đầu tư vào khảo sát và kế hoạch giúp giảm chi phí về sau.

### Explore — Khảo sát

Claude đọc cấu trúc dự án, tệp liên quan, test và tài liệu. Mục tiêu không phải đọc mọi thứ, mà trả lời câu hỏi “thay đổi này nằm ở đâu và phụ thuộc vào gì?”. Có thể dùng Plan mode hoặc một subagent Explore nếu chỉ cần bản đồ codebase.

Ví dụ:

```text
Khảo sát pipeline tải ảnh. Xác định điểm thích hợp để chuyển sang WebP,
dependency đang dùng và test liên quan. Chỉ đọc và báo cáo, chưa sửa mã.
```

### Plan — Lập kế hoạch

Kế hoạch tốt phải có:

- danh sách tệp dự kiến sửa;
- trình tự thay đổi;
- rủi ro và trường hợp biên;
- tiêu chí thành công;
- lệnh kiểm thử cụ thể.

Đây là lúc sửa hướng rẻ nhất. Nếu plan đụng quá nhiều tệp hoặc thêm dependency không cần thiết, hãy yêu cầu thu hẹp trước khi triển khai.

### Code — Thực thi có kiểm chứng

Sau khi duyệt plan, Claude triển khai từng bước. Ba cách giúp giai đoạn này ổn định:

- Định nghĩa “done” bằng điều có thể quan sát: test nào phải qua, output nào phải xuất hiện.
- Cấp công cụ phù hợp; ví dụ tác vụ giao diện cần khả năng mở và kiểm tra trình duyệt.
- Có test suite đáng tin cậy; test sai có thể tạo cảm giác thành công giả.

Nếu một lỗi lặp lại do quy ước dự án, ghi lại quy ước vào `CLAUDE.md` thay vì sửa bằng tay trong mọi phiên.

### Commit — Rà soát và đóng gói thay đổi

Trước khi commit:

1. Tự chạy và kiểm tra thay đổi.
2. Xem `git diff`, đặc biệt các tệp ngoài dự kiến.
3. Nhờ subagent reviewer chỉ đọc để có góc nhìn mới.
4. Chạy test/lint/type-check.
5. Nhờ Claude viết commit message theo phong cách repository.

Quy trình kết thúc ở commit không có nghĩa là “Claude nói xong”. Nó kết thúc khi thay đổi đã được con người và các cổng kiểm chứng xem xét.

---

## 6. Quản lý ngữ cảnh

- Bài gốc: <https://anthropic.skilljar.com/claude-code-101/469793>
- Video: [Context management](https://www.youtube.com/watch?v=eW3oTyfeWZ0)

### Ngữ cảnh là tài nguyên

Mọi prompt, nội dung tệp, kết quả công cụ, mô tả MCP và chỉ dẫn đều tiêu tốn cửa sổ ngữ cảnh. Khi cửa sổ gần đầy, Claude Code tự compact: giữ bản tóm tắt quan trọng và bỏ bớt chi tiết. Vì tóm tắt có thể làm mất thông tin, quản lý ngữ cảnh chủ động sẽ cho kết quả tốt hơn.

### Ba lệnh quan trọng

```text
/context
/compact
/clear
```

- `/context`: xem tổng quan dung lượng và nhóm nào đang chiếm nhiều chỗ.
- `/compact`: tóm tắt phần trước để tiếp tục cùng một tính năng.
- `/clear`: bắt đầu ngữ cảnh sạch, phù hợp khi chuyển sang một công việc không liên quan.

Quy tắc gợi ý: compact để tiếp tục **cùng** một feature; clear khi chuyển sang feature **mới**. Kiến thức cần nhớ qua nhiều phiên nên nằm trong `CLAUDE.md`, không nên chỉ dựa vào lịch sử chat.

### Tiết kiệm ngữ cảnh

**Prompt cụ thể.** Prompt mơ hồ buộc Claude khám phá rộng và suy luận nhiều, cuối cùng tốn ngữ cảnh hơn prompt dài nhưng rõ.

**Tắt MCP không dùng.** Tool definition của MCP có thể được nạp ngay cả khi chưa gọi. Chỉ bật những server liên quan tới dự án hiện tại.

**Dùng subagent.** Một subagent có cửa sổ ngữ cảnh riêng; nó thực hiện quá trình tìm kiếm dài và chỉ trả bản tóm tắt về luồng chính.

**Đừng dồn nhiều mục tiêu không liên quan vào một phiên.** Sau khi hoàn thành một feature, lưu kiến thức bền vững vào tài liệu dự án, commit thay đổi, rồi `/clear`.

### Dấu hiệu ngữ cảnh đang “bẩn”

- Claude nhắc lại giả định cũ không còn đúng.
- Nó sửa nhầm feature trước đó.
- Mất nhiều thời gian đọc lại tệp không liên quan.
- Tóm tắt sau compaction bỏ mất tiêu chí quan trọng.

Khi đó, hãy cung cấp một brief ngắn, kiểm tra `CLAUDE.md`, rồi compact có chỉ dẫn hoặc clear.

---

## 7. Rà soát mã nguồn

- Bài gốc: <https://anthropic.skilljar.com/claude-code-101/469794>
- Video: [Code review](https://www.youtube.com/watch?v=RKsADl0ZC3Y)

### Reviewer độc lập bằng subagent

Agent chính vừa viết mã dễ bị “neo” vào cách làm của chính nó. Một subagent có ngữ cảnh sạch tạo góc nhìn thứ hai. Reviewer nên chỉ có công cụ đọc: nhiệm vụ của nó là tìm vấn đề, không âm thầm sửa mã.

Prompt gợi ý:

```text
Dùng một subagent chỉ đọc để review diff hiện tại.
Tập trung vào lỗi logic, bảo mật, regression, test bị làm yếu và thay đổi ngoài phạm vi.
Xếp hạng phát hiện theo mức nghiêm trọng, nêu tệp/dòng và bằng chứng.
Không chỉnh sửa tệp.
```

Nên commit cấu hình reviewer vào repository để cả nhóm dùng cùng tiêu chuẩn.

### Skill `/commit-push-pr`

Theo bài học, skill này có thể gộp ba bước: tạo commit, push và mở pull request. Nếu đã cấu hình Slack MCP và kênh trong `CLAUDE.md`, workflow có thể đăng liên kết PR vào kênh nhóm.

Tự động hóa không loại bỏ việc duyệt. Trước khi chạy skill, cần xem diff, xác nhận branch, test và nội dung commit.

### Nối lại phiên từ pull request

Khi PR được tạo qua `gh pr create`, Claude có thể liên kết session với PR. Để tiếp tục xử lý comment review hoặc build lỗi:

```bash
claude --from-pr <PR_NUMBER>
```

Điều này khôi phục ngữ cảnh liên quan thay vì bắt đầu từ đầu.

### Checklist trước PR

- Diff chỉ chứa thay đổi có chủ đích.
- Không có secret, file sinh ra hoặc dữ liệu cục bộ.
- Test/lint/type-check đã chạy và output được xem.
- Reviewer độc lập đã báo cáo.
- PR mô tả vấn đề, giải pháp, cách kiểm thử và rủi ro.

---

## 8. Tệp `CLAUDE.md`

- Bài gốc: <https://anthropic.skilljar.com/claude-code-101/469795>
- Video: [The CLAUDE.md file](https://www.youtube.com/watch?v=O0FGCxkHM-U)

`CLAUDE.md` là bộ nhớ bền vững/onboarding script cho dự án. Claude Code tự đọc nó khi bắt đầu phiên và thêm nội dung vào chỉ dẫn làm việc.

### Vấn đề nó giải quyết

Không có `CLAUDE.md`, Claude phải khám phá lại stack, lệnh, cấu trúc và quy ước trong mỗi phiên; quá trình đó tốn ngữ cảnh và dễ sinh giả định sai. Một tệp ngắn, chính xác giúp Claude khởi động với thông tin mà mọi lập trình viên mới cũng cần.

### Ví dụ

```markdown
# Project

Ứng dụng Next.js 15 dùng App Router, Tailwind và Drizzle ORM.

# Commands

- Dev: `pnpm dev`
- Test: `pnpm test`
- Lint: `pnpm lint`

# Code style

- Thụt lề 2 dấu cách.
- Ưu tiên named exports.
- API route đặt trong `app/api/`.
- Khi phù hợp, dùng server actions thay cho API routes.
```

### Phạm vi bộ nhớ

- Project-level `CLAUDE.md`: đặt ở gốc dự án và commit để cả nhóm dùng.
- User-level `CLAUDE.md`: nằm trong cấu hình cá nhân, áp dụng cho mọi dự án của riêng bạn.

Không đưa sở thích cá nhân vào tệp chung; cũng không để secret hoặc thông tin nhạy cảm trong tệp được commit.

### Thực hành tốt

- Bắt đầu dự án mà chưa cần viết một `CLAUDE.md` khổng lồ.
- Ghi lại những điểm Claude thường xuyên cần được sửa hướng.
- Dùng `/init` khi đã hiểu dự án đủ để tạo bản đầu.
- Liên kết tài liệu có sẵn bằng `@README.md` hoặc đường dẫn phù hợp thay vì sao chép dài dòng.
- Định kỳ xóa quy tắc lỗi thời, mâu thuẫn hoặc hiển nhiên.

`CLAUDE.md` là hướng dẫn, không phải cơ chế cưỡng chế. Quy tắc không được phép bỏ qua nên chuyển thành hook hoặc kiểm soát ở CI.

---

## 9. Subagents

- Bài gốc: <https://anthropic.skilljar.com/claude-code-101/469796>
- Video: [Subagents](https://www.youtube.com/watch?v=jKErNxuxPXg)

Subagent là tác nhân con nhận một nhiệm vụ hẹp và làm việc trong cửa sổ ngữ cảnh riêng. Nó có thể khảo sát codebase, nghiên cứu tài liệu hoặc review mã rồi trả về kết luận ngắn cho agent chính.

### Vì sao hữu ích?

Quá trình tìm câu trả lời thường sinh nhiều “rác ngữ cảnh”: hàng loạt tệp đã đọc, output tìm kiếm và nhánh suy luận không dùng. Nếu làm trong subagent, toàn bộ hành trình nằm ngoài ngữ cảnh chính; agent chính chỉ nhận kết quả cô đọng.

Subagents cũng có thể chạy song song khi các nhiệm vụ độc lập. Tuy nhiên, tránh cho nhiều agent cùng sửa một vùng mã nếu chưa cô lập worktree hoặc phân chia ownership rõ ràng.

### Tạo subagent

Chạy:

```text
/agents
```

Chọn tạo agent mới, sau đó xác định:

- scope;
- mục đích;
- công cụ được phép dùng;
- tên, mô tả và prompt hệ thống;
- màu hiển thị.

Mô tả rất quan trọng vì nó giúp Claude quyết định khi nào nên gọi subagent.

### Tùy biến nâng cao

- Persistent memory: cho phép agent giữ kiến thức qua các cuộc hội thoại khi thường xuyên làm cùng loại việc.
- Preloaded skills: khai báo skill để agent có sẵn quy trình chuyên môn. Khóa học lưu ý toàn bộ skill được nạp vào ngữ cảnh subagent, khác với cơ chế nạp theo nhu cầu ở luồng chính.

### Ví dụ phân vai

- `explorer`: chỉ đọc, lập bản đồ module liên quan.
- `test-reviewer`: đọc test và tìm lỗ hổng kiểm thử.
- `security-reviewer`: tìm secret, injection, kiểm soát quyền và xử lý dữ liệu.
- `docs-researcher`: tìm tài liệu phiên bản hiện hành rồi tóm tắt.

Nguyên tắc thiết kế: một subagent tốt có phạm vi hẹp, output rõ và chỉ được cấp đúng công cụ cần thiết.

---

## 10. Skills

- Bài gốc: <https://anthropic.skilljar.com/claude-code-101/469848>
- Video: [What are skills?](https://www.youtube.com/watch?v=bjdBVZa66oU)
- Học sâu hơn: <https://anthropic.skilljar.com/introduction-to-agent-skills>

> Trang bài 101 chủ yếu cung cấp video và liên kết khóa học chuyên sâu. Video không công bố transcript qua YouTube tại thời điểm đối chiếu; phần dưới là bản giảng lại nội dung cốt lõi của khái niệm Skills, không phải chép lời video.

### Skill là gì?

Skill dạy Claude một quy trình chuyên biệt một lần để nó có thể áp dụng lại khi tình huống phù hợp. Thay vì lặp một prompt nhiều bước trong mỗi phiên, bạn đóng gói kiến thức đó thành một kỹ năng có tên, mô tả kích hoạt và hướng dẫn thực hiện.

Ví dụ skill:

- chuẩn bị release;
- kiểm chứng thay đổi trước PR;
- tạo migration theo quy ước nội bộ;
- viết tài liệu API theo template của nhóm;
- chuyển đổi một loại tài sản theo pipeline cố định.

### Skill khác `CLAUDE.md` như thế nào?

- `CLAUDE.md`: quy ước luôn đúng, cần hiện diện trong mọi phiên của dự án.
- Skill: quy trình chỉ cần khi làm đúng loại nhiệm vụ.
- Hook: hành vi bắt buộc phải chạy tại một sự kiện nhất định.

Nếu nội dung là “mọi file TypeScript dùng named export”, hãy đặt trong `CLAUDE.md`. Nếu là “khi chuẩn bị release, chạy 8 bước sau”, hãy tạo skill. Nếu formatter bắt buộc chạy sau mỗi edit, hãy dùng hook.

### Cấu trúc tư duy của một skill tốt

1. **Tên rõ:** phản ánh hành động hoặc năng lực.
2. **Mô tả kích hoạt:** nói khi nào skill phù hợp và khi nào không.
3. **Quy trình:** các bước ngắn, xác định đầu vào/đầu ra.
4. **Bằng chứng hoàn tất:** lệnh hoặc kiểm tra xác nhận kết quả.
5. **Tài nguyên phụ:** script, template hoặc tài liệu tham khảo nếu cần.

Ví dụ ý tưởng cho skill kiểm chứng:

```text
Khi một thay đổi mã đã hoàn tất:
1. Xem diff và liệt kê tệp ngoài phạm vi.
2. Chạy lint, type-check và test liên quan.
3. Kiểm tra test có bị xóa/làm yếu không.
4. Báo PASS/FAIL kèm output bằng chứng.
```

Mấu chốt của video được thể hiện ngay trong mô tả: dạy Claude cách làm một việc một lần, rồi Claude tự áp dụng kiến thức đó khi có liên quan.

---

## 11. MCP — Model Context Protocol

- Bài gốc: <https://anthropic.skilljar.com/claude-code-101/469797>
- Video: [MCP](https://www.youtube.com/watch?v=kkBFmwkDzdo)

MCP là chuẩn mở giúp Claude Code kết nối với công cụ và nguồn dữ liệu ngoài codebase. Nhiều thông tin công việc nằm trong Linear, database, tài liệu, repository công khai hoặc dịch vụ nội bộ; MCP cung cấp các tool để Claude truy cập chúng khi cần.

### Tool trong agentic AI

Một tool có schema mô tả đầu vào và kết quả. Claude dùng hiểu biết ngữ nghĩa để quyết định khi nào gọi tool. Ví dụ:

- Linear MCP lấy chi tiết issue.
- Docs MCP như Context7 cung cấp tài liệu dependency mới.
- MCP nội bộ có thể truy vấn dữ liệu hoặc gọi workflow được kiểm soát.

Tool có thể chỉ đọc hoặc tạo tác động bên ngoài. Hãy kiểm tra quyền, dữ liệu gửi đi và hậu quả trước khi cho phép tool ghi, gửi hoặc thay đổi trạng thái.

### Thêm và quản lý server

Lệnh khái quát:

```bash
claude mcp add ...
```

Hai kiểu kết nối chính:

- HTTP server: dịch vụ từ xa do nhà cung cấp host.
- Stdio server: tiến trình cục bộ chạy trên máy.

Trong phiên Claude Code, dùng `/mcp` để xem server, trạng thái và tắt server không cần thiết.

### Phạm vi cấu hình

- Local: chỉ dự án hiện tại, chỉ cho bạn.
- User: dùng cho mọi dự án của bạn.
- Project: khai báo trong `.mcp.json` và commit để cả nhóm có cùng cấu hình.

Không commit credential. Cấu hình chia sẻ nên tham chiếu biến môi trường hoặc cơ chế secret phù hợp.

### Chi phí ngữ cảnh

Tool definitions của MCP chiếm ngữ cảnh ngay cả khi chưa dùng. Vì vậy:

- tắt server không liên quan;
- ưu tiên CLI như `gh` hoặc `aws` nếu tác vụ đơn giản và CLI đã đủ;
- cân nhắc skill nếu chỉ cần quy trình/hướng dẫn, không cần kết nối sống;
- theo bài học, khi MCP tools vượt khoảng 10% context, Claude Code có thể chuyển sang tool search để tìm tool theo nhu cầu, nhưng độ tin cậy có thể thấp hơn.

MCP mạnh nhất khi bạn thực sự cần dữ liệu hoặc hành động bên ngoài; đừng thêm server chỉ vì “có thể sẽ dùng”.

---

## 12. Hooks

- Bài gốc: <https://anthropic.skilljar.com/claude-code-101/469798>
- Video: [Hooks](https://www.youtube.com/watch?v=IkaPHiMDazM)

Hooks chạy lệnh tại những thời điểm xác định trong vòng đời Claude Code. Khác với lời nhắc hoặc `CLAUDE.md`, hook có tính **deterministic**: sự kiện khớp thì hook chạy.

### Các sự kiện được bài 101 giới thiệu

- `PreToolUse`: trước khi gọi tool.
- `PostToolUse`: sau khi tool hoàn tất.
- `UserPromptSubmit`: sau khi gửi prompt nhưng trước khi Claude xử lý.
- `Stop`: khi Claude chuẩn bị kết thúc phản hồi.
- `Notification`: khi Claude gửi thông báo.

Hooks được cấu hình qua `/hooks` hoặc trong `settings.json`.

### Trường hợp sử dụng

- Auto-format sau khi tệp được sửa.
- Ghi log command phục vụ audit/compliance.
- Chặn thao tác nguy hiểm hoặc tệp production.
- Gửi thông báo khi tác vụ kết thúc.
- Chạy kiểm thử trước khi cho phép kết thúc lượt.

### Ví dụ format sau chỉnh sửa

Tạo `PostToolUse` hook với matcher như `Edit|MultiEdit|Write`. Script đọc loại tệp rồi chạy formatter thích hợp: Prettier cho TypeScript, `gofmt` cho Go, v.v.

### Chặn bằng `PreToolUse`

Hook nhận tên tool và input dạng JSON qua stdin. Trong bài 101:

- exit `0`: cho phép tiếp tục;
- exit `2`: chặn hành động; nội dung stderr được đưa lại cho Claude để nó điều chỉnh;
- mã khác: lỗi không chặn, được hiển thị nhưng thao tác vẫn có thể tiếp tục.

Đừng nhầm exit `1` với chặn. Nếu cơ chế hook yêu cầu exit `2` để block, dùng sai mã có thể khiến hành động vẫn chạy.

### Chia sẻ cho nhóm

Hook trong `.claude/settings.json` có thể commit cùng dự án. Dùng biến `CLAUDE_PROJECT_DIR` khi tham chiếu script để hook hoạt động độc lập với thư mục hiện tại của tiến trình.

### Phân biệt ba lớp kiểm soát

- `CLAUDE.md`: “hãy làm theo quy ước này”.
- Skill: “khi gặp loại nhiệm vụ này, thực hiện quy trình này”.
- Hook: “tại sự kiện này, lệnh này chắc chắn chạy”.

Nếu một điều **phải** xảy ra mọi lần, đừng chỉ viết nó trong prompt; hãy dùng hook hoặc cổng kiểm tra ở CI.

---

## 13. Ôn tập và chuẩn bị bài kiểm tra cuối khóa

- Bài quiz: <https://anthropic.skilljar.com/claude-code-101/469849>
- Trên khóa học: 7 câu hỏi.

Phần dưới là bộ ôn tập do người biên soạn tạo, bám vào nội dung 12 bài; không phải bản sao câu hỏi/đáp án chính thức của Skilljar.

### Câu 1 — Điều gì làm Claude Code khác một chatbot thông thường?

**Đáp án:** Claude Code là agent có công cụ và quyền tiếp cận môi trường làm việc. Nó có thể đọc tệp, sửa mã, chạy lệnh, quan sát kết quả và lặp lại cho tới khi đạt mục tiêu; chatbot thông thường chủ yếu trả văn bản và cần người dùng sao chép qua lại.

### Câu 2 — Vì sao Plan mode phù hợp với thay đổi phức tạp?

**Đáp án:** Nó cho Claude khảo sát bằng công cụ chỉ đọc và lập kế hoạch trước khi sửa mã. Bạn có thể chỉnh phạm vi, dependency, test và rủi ro ở thời điểm chi phí sửa hướng còn thấp.

### Câu 3 — Khi nào dùng `/compact`, khi nào dùng `/clear`?

**Đáp án:** Dùng `/compact` khi tiếp tục cùng một feature nhưng cần giải phóng ngữ cảnh; dùng `/clear` khi bắt đầu công việc mới và không muốn giả định cũ gây nhiễu.

### Câu 4 — Tại sao nên dùng subagent cho code review?

**Đáp án:** Subagent có ngữ cảnh riêng, không mang thiên kiến của agent vừa viết mã. Nên cấp công cụ chỉ đọc để reviewer chỉ phát hiện và báo cáo vấn đề.

### Câu 5 — Chọn `CLAUDE.md`, Skill hay Hook

- Quy ước “API route đặt trong thư mục nào” → `CLAUDE.md`.
- Quy trình release nhiều bước → Skill.
- Bắt buộc formatter chạy sau mọi edit → Hook.

### Câu 6 — MCP có lợi và có chi phí gì?

**Đáp án:** MCP đưa công cụ/dữ liệu bên ngoài vào Claude Code. Đổi lại, tool definitions chiếm context và một số tool có thể tạo tác động bên ngoài; chỉ bật server cần thiết và kiểm soát quyền/dữ liệu.

### Câu 7 — Một thay đổi được coi là hoàn tất khi nào?

**Đáp án:** Không phải khi Claude nói “done”, mà khi diff đúng phạm vi, test/lint/type-check vượt qua, kết quả được quan sát, reviewer độc lập đã xem, và con người chấp nhận thay đổi.

---

## Lộ trình thực hành sau khóa học

### Buổi 1 — Làm quen an toàn

1. Cài Claude Code trên bề mặt bạn chọn.
2. Mở một repository thử nghiệm.
3. Dùng Approval hoặc Plan mode.
4. Yêu cầu Claude mô tả kiến trúc mà chưa sửa mã.

### Buổi 2 — Một feature nhỏ theo quy trình chuẩn

1. Explore vị trí thay đổi.
2. Lập plan có tiêu chí thành công.
3. Duyệt plan rồi code.
4. Chạy test và xem diff.
5. Dùng reviewer subagent trước commit.

### Buổi 3 — Tạo bộ nhớ dự án

1. Ghi lại stack, lệnh, thư mục và quy ước vào `CLAUDE.md`.
2. Xóa nội dung hiển nhiên hoặc quá dài.
3. Commit tệp để nhóm dùng chung.

### Buổi 4 — Đóng gói quy trình

1. Chọn một công việc đã lặp ít nhất hai lần.
2. Viết thành skill có trigger và cổng kiểm chứng.
3. Tạo subagent reviewer chỉ đọc.

### Buổi 5 — Tự động hóa có guardrail

1. Tạo `PostToolUse` hook format tệp.
2. Tạo `PreToolUse` hook chặn một thao tác nguy hiểm trong môi trường thử nghiệm.
3. Kiểm tra exit code và thông báo phản hồi.
4. Chỉ sau đó mới cân nhắc tăng quyền tự động hóa.

---

## Cheat sheet

```text
# Điều hướng chế độ quyền
Shift + Tab

# Kiểm tra/quản lý ngữ cảnh
/context
/compact
/clear

# Khởi tạo bộ nhớ dự án
/init

# Quản lý subagents
/agents

# Quản lý MCP
/mcp
claude mcp add ...

# Quản lý hooks
/hooks

# Tiếp tục từ pull request
claude --from-pr <PR_NUMBER>
```

### Nguyên tắc cuối cùng

```text
Khảo sát trước khi lập kế hoạch.
Lập kế hoạch trước khi viết mã.
Kiểm chứng trước khi commit.
Chỉ cấp đúng quyền cần thiết.
Đưa kiến thức bền vững vào CLAUDE.md.
Đưa quy trình lặp lại vào Skill.
Đưa quy tắc bắt buộc vào Hook.
```
