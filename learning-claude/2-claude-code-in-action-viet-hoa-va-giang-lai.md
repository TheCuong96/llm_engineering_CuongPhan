# Claude Code in Action — Bản Việt hóa và giảng lại

> Biên soạn từ khóa **Claude Code in Action** trên Anthropic Academy/Skilljar, truy cập ngày 29-09-2026. Tài liệu này diễn giải lại đầy đủ nội dung bằng tiếng Việt, bổ sung ví dụ và bài thực hành; không phải bản chép lời nguyên văn.

- Trang khóa học: <https://anthropic.skilljar.com/claude-code-in-action>
- Cấu trúc: 4 chặng, 9 bài nội dung và một bài kiểm tra 11 câu.
- Mỗi bài có liên kết bài gốc và video YouTube ngay đầu phần.
- Các tính năng như permission mode, routines, plugin, model và CLI có thể thay đổi. Hãy đối chiếu tài liệu Claude Code hiện hành trước khi dùng trong hệ thống thật.

## Mục lục và lộ trình

### Chặng 1 — Điều phối công việc

1. Điều khiển các phiên làm việc dài

### Chặng 2 — Cấu hình Claude

2. Viết `CLAUDE.md` để Claude thực sự làm theo
3. Verification Skills — kỹ năng kiểm chứng
4. Các chế độ quyền
5. Hooks — cơ chế cưỡng chế hành vi

### Chặng 3 — Tự động hóa công việc lặp lại

6. Routines và Headless mode
7. GitHub Actions và Code Review

### Chặng 4 — Kiểm chứng và chia sẻ

8. Kiểm chứng các lần chạy không giám sát
9. Plugins

### Kết thúc

10. Ôn tập cho bài kiểm tra 11 câu
11. Lộ trình thực hành và cheat sheet

---

## 1. Điều khiển các phiên làm việc dài

- Bài gốc: <https://anthropic.skilljar.com/claude-code-in-action/486901>
- Video: [Steering Long Sessions](https://www.youtube.com/watch?v=l_4ZYAiyP7U)

Một tác vụ vài phút có thể được giao bằng một prompt rồi kiểm tra kết quả. Nhưng refactor hàng chục tệp hoặc xây một tính năng lớn kéo dài nhiều giờ. Khi đó, năng lực quan trọng nhất không phải “prompt thật hay” mà là **đặt phạm vi trước khi chạy và liên tục giữ Claude đi đúng hướng**.

### Lập kế hoạch trước khi viết mã

Trong Plan mode, Claude nghiên cứu bằng công cụ chỉ đọc. Nó xem codebase, xác định điểm cần thay đổi và đưa ra kế hoạch để bạn duyệt. Kế hoạch là bản hợp đồng giữa mục tiêu và việc thực thi.

Đừng chỉ lướt qua plan. Hãy kiểm tra:

- Claude đã hiểu đúng vấn đề chưa?
- Có đụng vào tệp hoặc hệ thống ngoài phạm vi không?
- Có thêm dependency không cần thiết không?
- Tiêu chí “hoàn thành” có đo được không?
- Test, rollback và rủi ro đã được đề cập chưa?

Sửa một plan sai rẻ hơn rất nhiều so với dọn dẹp một loạt thay đổi sai sau vài giờ.

Mẫu prompt:

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

### Compact có định hướng

Compaction tóm tắt cuộc hội thoại, dùng bản tóm tắt làm ngữ cảnh mới và loại bỏ tin nhắn cũ. Nó giải phóng cửa sổ ngữ cảnh nhưng có nguy cơ bỏ mất chi tiết quan trọng.

Vì vậy, đừng chỉ chạy `/compact`; hãy chỉ rõ nội dung cần giữ:

```text
/compact Focus on the --version flag implementation
```

Việt hóa ý định:

```text
/compact Chỉ giữ ngữ cảnh liên quan tới việc triển khai cờ --version,
các tệp đã sửa, test đang lỗi và những quyết định API đã thống nhất.
```

Phần sau lệnh hoạt động như “tay lái” của bản tóm tắt. Nó giúp Claude bỏ cuộc thảo luận cũ nhưng giữ trạng thái hiện tại.

### Rewind — quay lại checkpoint

Mỗi prompt của người dùng tạo một checkpoint. Khi Claude đi sai hướng, nhấn `Esc` hai lần tại ô prompt trống để mở menu Rewind.

Các lựa chọn quan trọng:

- **Restore code and conversation:** phục hồi cả mã lẫn hội thoại.
- **Restore conversation:** quay lại phần chat, giữ mã hiện tại.
- **Restore code:** quay lại trạng thái tệp, giữ hội thoại.
- **Summarize from here:** tóm tắt mọi thứ sau checkpoint; hữu ích khi vừa có một nhánh thảo luận phụ dài.
- **Summarize up to here:** tóm tắt phần trước checkpoint nhưng giữ nguyên phần triển khai gần đây.

Hãy chọn theo thứ bạn muốn cứu: mã, cuộc hội thoại hay dung lượng ngữ cảnh.

### Goal — mô tả trạng thái hoàn thành

Khi bạn mô tả “done” dễ hơn mô tả từng bước, dùng `/goal`:

```text
/goal all tests in src/billing pass, and the type checker reports zero errors
```

Claude tiếp tục làm việc qua nhiều lượt cho tới khi một evaluator nhanh xác nhận điều kiện hoàn thành. Hủy bằng:

```text
/goal clear
```

Giới hạn quan trọng: evaluator chỉ đọc transcript. Do đó, điều kiện phải được chứng minh bằng output Claude tạo ra, chẳng hạn kết quả test hoặc type-check. “Ứng dụng trông đẹp” không phải điều kiện tốt nếu transcript không chứa bằng chứng trực quan.

### Loop — theo dõi trạng thái bên ngoài

Loop chạy một prompt theo khoảng thời gian cố định hoặc nhịp tự điều chỉnh giữa các lượt. Nó phù hợp để kiểm tra CI, deployment hoặc một tiến trình bên ngoài rồi phản ứng khi trạng thái thay đổi.

Dừng loop bằng `Esc`.

Phân biệt:

- Goal: tiếp tục hành động cho đến khi đạt **điều kiện hoàn thành**.
- Loop: lặp lại một phép kiểm tra hoặc hành động theo **thời gian/trạng thái bên ngoài**.

### Làm việc song song bằng worktrees

Hai phiên Claude cùng sửa một cây tệp rất dễ ghi đè hoặc xung đột. Git worktree cung cấp cho mỗi phiên một cây làm việc độc lập. Khi phiên kết thúc, worktree sạch có thể được tự động loại bỏ.

Tệp `.worktreeinclude` ở gốc repository liệt kê các tệp đang bị Git ignore nhưng cần sao chép vào mỗi worktree, ví dụ cấu hình cục bộ hoặc mẫu môi trường. Không đưa secret vào cơ chế chia sẻ nếu không thật sự cần.

### Tóm tắt bài

1. Lập phạm vi và plan trước.
2. Compact có chỉ dẫn.
3. Dùng Rewind thay vì cố prompt để thoát khỏi một hướng sai.
4. Dùng Goal khi có thể định nghĩa “done”.
5. Dùng Loop để theo dõi trạng thái bên ngoài.
6. Cô lập công việc song song bằng worktrees.

---

## 2. Viết `CLAUDE.md` để Claude thực sự làm theo

- Bài gốc: <https://anthropic.skilljar.com/claude-code-in-action/486929>
- Video: [A CLAUDE.md That Follows](https://www.youtube.com/watch?v=sfE5UQEumdM)

### Cái bẫy của tệp ngày càng dài

Mỗi lần Claude làm sai, ta dễ thêm một quy tắc. Dần dần `CLAUDE.md` trở thành bức tường văn bản và Claude bỏ sót một số dòng. Đây không hẳn là lỗi; mỗi chỉ dẫn phải cạnh tranh sự chú ý trong cùng ngữ cảnh.

`CLAUDE.md` là **hướng dẫn**, không phải cấu hình được cưỡng chế. Mục tiêu không phải ghi mọi thứ, mà giữ tệp ngắn, rõ và có giá trị.

### Trước tiên hãy hỏi: quy tắc có thuộc `CLAUDE.md` không?

Quy tắc mềm như “đặt API handler ở thư mục này” phù hợp với `CLAUDE.md`. Quy tắc cứng như “không bao giờ push vào `main`” không nên chỉ dựa vào việc Claude nhớ đọc. Hãy thực thi nó bằng `PreToolUse` hook hoặc bảo vệ branch ở GitHub.

Nguyên tắc:

- **Hướng dẫn/convention:** `CLAUDE.md`.
- **Quy trình theo loại nhiệm vụ:** Skill.
- **Điều bắt buộc không được bỏ qua:** Hook hoặc policy ngoài Claude.

### Bốn vị trí cấu hình

Claude có thể nạp nhiều tệp cùng lúc; chúng xếp chồng chứ không loại trừ nhau:

1. **Managed policy:** cấp tổ chức, do platform team quản lý và người dùng không thể bỏ qua.
2. **User:** sở thích cá nhân áp dụng trên mọi dự án của máy.
3. **Project:** tệp commit vào repository, dùng chung cho nhóm.
4. **Local:** ghi chú cá nhân của riêng repository, bị Git ignore.

Ví dụ: một quyết định kiến trúc tạm thời trong nhánh refactor của bạn nên nằm ở local, không nên làm ảnh hưởng cả nhóm qua project-level file.

### Chia tệp bằng imports

Có thể tổ chức một tệp lớn bằng đường dẫn import:

```text
@.claude/conventions/code-style.md
@.claude/conventions/testing.md
@.claude/conventions/workflow.md
```

Imports giúp cấu trúc dễ đọc, nhưng không giảm context. Khi khởi động, nội dung được mở rộng inline và vẫn được nạp đầy đủ. Hãy dùng import để **tổ chức**, không phải để tiết kiệm ngữ cảnh.

### Viết quy tắc dễ tuân theo

**Cụ thể và kiểm tra được**

```text
Mơ hồ: Follow best practices for API routes.
Cụ thể: Put new API routes in src/api/handlers, one per file.
```

**Nêu giải pháp thay thế, không chỉ cấm**

```text
Hở: Don't use default exports.
Kín: Use named exports, not default exports.
```

**Xem nhấn mạnh là ngân sách**

`IMPORTANT`, `MUST` hay chữ in hoa chỉ nổi bật khi phần còn lại không cùng “la lớn”. Chỉ dùng cho hai hoặc ba quy tắc có hậu quả nghiêm trọng nhất.

### Xem `CLAUDE.md` như mã sống

Mỗi lỗi lặp lại là một bug report cho tệp hướng dẫn. Hỏi:

- Quy tắc thiếu hay diễn đạt mơ hồ?
- Quy tắc này phải chuyển thành hook không?
- Có dòng lỗi thời nào gây mâu thuẫn không?
- Có thể rút ngắn hoặc đưa chi tiết sang tài liệu tham khảo không?

Định kỳ review và xóa dòng không còn giá trị. Tệp càng tinh gọn, xác suất Claude làm theo từng dòng càng cao.

---

## 3. Verification Skills — kỹ năng kiểm chứng

- Bài gốc: <https://anthropic.skilljar.com/claude-code-in-action/486930>
- Video: [Verification Skills](https://www.youtube.com/watch?v=soLPOXXAc1w)

### Vì sao nên xây verification skill đầu tiên?

Sau khi Claude refactor, con người thường phải nhớ yêu cầu chạy test, đọc diff và kiểm tra test có bị làm yếu không. Nếu việc kiểm chứng phụ thuộc vào trí nhớ của người dùng, chỉ cần quên một lần là mã lỗi có thể lọt qua.

Một verification skill đóng gói quy trình và tự kích hoạt khi mô tả của skill khớp với tác vụ. Luồng mẫu:

1. Chạy test suite.
2. Đọc diff.
3. Kiểm tra test không bị xóa, bỏ assertion hoặc nới điều kiện chỉ để chuyển xanh.
4. Báo PASS/FAIL kèm bằng chứng.

“Test xanh” chưa đủ nếu chính test vừa bị làm vô hiệu. “Done” là các cổng kiểm tra đã thực sự chạy, output được quan sát và kết luận được nêu rõ.

### Khi nào một quy trình nên thành skill?

Quy tắc đơn giản: nếu bạn đã gõ cùng một hướng dẫn nhiều bước hai lần, hãy cân nhắc tạo skill.

Ví dụ:

- checklist release;
- quy trình migration;
- kiểm tra trước PR;
- tạo changelog;
- kiểm chứng thay đổi bảo mật.

### Thư mục skill chứa nhiều hơn hướng dẫn

Một skill không chỉ có `SKILL.md`:

- `reference.md`: tài liệu dài, chỉ được đọc khi cần độ sâu.
- `scripts/`: các script có thể được thực thi mà không cần nạp toàn bộ mã nguồn vào context.
- templates hoặc tài sản phụ trợ cho output nhất quán.

Giữ `SKILL.md` ngắn: tên, mô tả kích hoạt và quy trình chính. Đẩy giải thích dài, mẫu và công cụ sang tệp phụ.

### Mẫu verification skill về mặt ý tưởng

```markdown
# Verify change

Use when implementation work is complete and must be checked before handoff.

1. Inspect the complete diff.
2. Flag files outside the approved scope.
3. Run lint, type-check, and relevant tests.
4. Check whether tests were deleted or weakened.
5. Report PASS or FAIL with command output and unresolved risks.
```

Đặt skill của dự án trong `.claude/skills` và commit để cả nhóm dùng cùng tiêu chuẩn kiểm chứng.

---

## 4. Các chế độ quyền

- Bài gốc: <https://anthropic.skilljar.com/claude-code-in-action/486932>
- Video: [Permission Modes](https://www.youtube.com/watch?v=Fjg4O-ZcRSU)

Permission mode cho phép chọn trước những hành động Claude được thực hiện mà không cần dừng lại hỏi. Khóa học trình bày sáu chế độ:

### Manual

Cho phép đọc mà không hỏi; hầu hết hành động khác cần xác nhận. Phù hợp khi học, xử lý mã nhạy cảm hoặc muốn quan sát từng bước.

### Accept edits

Cho phép đọc, sửa tệp và một số lệnh filesystem phổ biến. Phù hợp khi lặp nhanh trên mã mà bạn sẽ review ngay sau đó.

### Plan

Chỉ đọc, nghiên cứu và đề xuất kế hoạch; không chỉnh sửa. Đây là lựa chọn tốt để hiểu codebase, review hoặc chuẩn bị thay đổi phức tạp.

### Auto

Chạy tự động hơn, nhưng mỗi hành động được một classifier model riêng xem xét trước khi thực thi. Classifier tập trung vào **ý định nguy hiểm**, chẳng hạn:

- deploy hoặc migration production;
- force push;
- tải mã rồi pipe thẳng vào shell;
- gửi dữ liệu nhạy cảm ra endpoint ngoài;
- phá hủy tệp cần cho phiên.

Nó thường cho qua chỉnh sửa cục bộ, dependency từ lockfile, request chỉ đọc và push lên branch riêng.

Classifier không đánh giá tính đúng của mã. Authentication bị viết hỏng vẫn có thể được cho qua nếu hành động không nguy hiểm. Vì vậy, nên ghép Auto với Stop hook chạy test:

- Auto bảo vệ ý định trước hành động.
- Stop hook bảo vệ tính đúng khi Claude muốn kết thúc.

### Don't ask

Chỉ tool được phê duyệt trước mới chạy; phần còn lại bị từ chối tự động mà không hiện prompt. Phù hợp với CI, lịch chạy đêm hoặc môi trường không có người chờ duyệt.

### Bypass permissions

Bỏ qua các kiểm tra quyền. Đây là mức tương đương cờ nguy hiểm bỏ qua permission và chỉ nên dùng trong container/VM cô lập, có dữ liệu và credential giới hạn.

### Chọn chế độ theo công việc

- Khảo sát/review: Plan.
- Pair programming có giám sát: Manual hoặc Accept edits.
- Chạy tự động nhưng vẫn cần lớp kiểm tra ý định: Auto.
- Pipeline không có người: Don't ask với allowlist tối thiểu.
- Sandbox có thể vứt bỏ hoàn toàn: mới cân nhắc Bypass.

Các chế độ giao diện hằng ngày có thể được chuyển bằng `Shift + Tab`; luôn nhìn status bar để biết chế độ hiện tại.

---

## 5. Hooks — cơ chế cưỡng chế hành vi

- Bài gốc: <https://anthropic.skilljar.com/claude-code-in-action/486933>
- Video: [Hooks](https://www.youtube.com/watch?v=8ALu1dk681s)

Một câu trong `CLAUDE.md` là yêu cầu; hook là mã chạy tại một điểm cố định. Hook biến “Claude thường làm” thành “hệ thống luôn thực thi”.

### Những sự kiện quan trọng

- `PreToolUse`: trước khi tool chạy; có thể chặn hoặc sửa input.
- `PostToolUse`: sau một tool call thành công; phù hợp auto-format/lint.
- `Stop`: khi Claude muốn kết thúc lượt; có thể từ chối nếu chưa đạt điều kiện.
- `SubagentStop`: tương tự cho subagent.
- `PreCompact` và `PostCompact`: trước/sau compaction.
- `InstructionsLoaded`: khi `CLAUDE.md` hoặc rule file được nạp; hữu ích để audit.
- `SessionStart`: lúc bắt đầu phiên và khi cần khởi tạo môi trường.

Điểm dễ nhầm: để đưa lại context sau compaction, dùng `SessionStart` với matcher `compact`, không phải `PostCompact`, vì output của SessionStart mới được đưa vào cuộc hội thoại.

### `PreToolUse` trả quyết định bằng JSON

Hook có thể in JSON rồi exit `0`. Trường `permissionDecision` nhận:

- `allow`: cho qua;
- `deny`: chặn;
- `ask`: chuyển cho người dùng quyết định;
- `defer`: trường hợp đặc biệt trong một số lượt `-p` không tương tác.

Cấu trúc khái quát:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Lý do chặn",
    "updatedInput": {
      "command": "lệnh đã sửa"
    }
  }
}
```

`updatedInput` có thể viết lại tool call, chẳng hạn thay một secret bằng placeholder thay vì chặn toàn bộ. Nó thay thế **toàn bộ** input object, vì vậy phải trả lại cả những field không đổi.

### Exit codes

- `0`: thành công; stdout dạng JSON được parse. Plain text chỉ được đưa vào context ở một số event như `SessionStart`, `UserPromptSubmit` và `UserPromptExpansion`.
- `2`: lỗi chặn; stderr được đưa lại cho Claude làm context.
- Mã khác: lỗi không chặn; stderr được log và Claude tiếp tục.

Sai lầm nguy hiểm: exit `1` nghe giống lỗi nhưng không chặn. Muốn ngăn hành động, dùng exit `2` hoặc quyết định JSON phù hợp.

`PostToolUse` chạy sau tool nên không thể ngăn hành động đã xảy ra. `Notification` và `SessionStart` cũng có thể bỏ qua cơ chế block.

### Redact thay vì chỉ deny

Một `PreToolUse` hook cho Bash có thể phát hiện chuỗi giống secret, thay nó bằng placeholder qua `updatedInput`, rồi cho lệnh an toàn tiếp tục. Như vậy công việc vẫn chạy nhưng secret không đi qua tool call.

### Bảo toàn trạng thái sau compact

Dùng `SessionStart` với matcher `compact` để in một bản tóm tắt ngắn về các tệp đang làm và trạng thái hiện tại. Output được đưa lại vào context, giúp Claude tiếp tục thay vì “tỉnh dậy” mà thiếu thông tin.

---

## 6. Routines và Headless mode

- Bài gốc: <https://anthropic.skilljar.com/claude-code-in-action/486935>
- Video: [Routines and Headless](https://www.youtube.com/watch?v=b9TCW-pdzDA)

Khi đã tin tưởng Claude làm một tác vụ, bước tiếp theo là ngừng khởi động thủ công. Khóa học mô tả một phổ tự động hóa:

```text
Routines do Anthropic quản lý → Headless CLI trong script của bạn → Agent SDK trong ứng dụng
```

### Routines

Routine là một prompt đã lưu, gắn với repository và connectors, chạy trên hạ tầng Anthropic khi được kích hoạt. Bạn không cần dựng server hay duy trì workflow file.

Trigger có thể là:

- cron schedule, ví dụ 9 giờ mỗi sáng;
- HTTP POST vào API endpoint;
- sự kiện GitHub như pull request mới.

Trường hợp phù hợp: dependency audit buổi sáng, phân loại PR, quét Sentry hằng ngày hoặc báo cáo có cùng prompt lặp lại.

Tạo routine trên web tại `claude.ai/code/routines` hoặc từ Claude Code:

```text
/schedule daily dependency audit at 9am
```

Ba giới hạn khóa học nhấn mạnh:

1. Routines đang ở research preview nên hành vi/giới hạn có thể đổi.
2. Lịch lặp chạy thường xuyên nhất là mỗi giờ.
3. Mỗi lượt bắt đầu từ bản clone mới của default branch và mặc định chỉ push vào branch có tiền tố `claude/`, trừ khi bạn nới policy của repository.

### Headless mode với `-p`

Headless chạy Claude Code một lần, không giao diện tương tác. Nó đọc stdin, ghi stdout và có thể nối pipe:

```bash
claude -p "summarize the changes in this diff"
```

Theo nội dung bài học, `-p` bỏ qua việc tự động khám phá hooks, skills, plugins, MCP servers và `CLAUDE.md`, giúp khởi động nhanh. Chỉ những tool được cấp rõ ràng mới khả dụng. Khi dùng, hãy kiểm tra hành vi phiên bản CLI hiện tại.

### Structured output

Có thể kết hợp JSON output với JSON Schema. Kết quả đúng schema nằm trong `structured_output`:

```bash
claude -p "Extract the exported function names from src/core/style.js" \
  --output-format json \
  --json-schema '{"type":"object","properties":{"functions":{"type":"array","items":{"type":"string"}}},"required":["functions"]}' \
  | jq '.structured_output.functions'
```

Đây là cách biến output LLM thành dữ liệu ổn định cho bước tiếp theo của pipeline.

### Tự động hóa nhiều bước bằng session

Lấy `session_id` từ JSON của lượt đầu rồi tiếp tục:

```bash
claude --resume "$(jq -r .session_id /tmp/plan.json)"
```

Một script có thể tạo plan; script sau resume session để thi hành với ngữ cảnh cũ.

### `--bare` cho CI

Khóa học giới thiệu `--bare` như chế độ deterministic dành cho pipeline cần đầu ra lặp lại và dự đoán được hơn. Hãy xác nhận semantics của phiên bản CLI đang cài trước khi dựa vào nó cho kiểm soát sản xuất.

### Agent SDK

Agent SDK nhúng Claude Code vào ứng dụng TypeScript hoặc Python. Hai ngôn ngữ cung cấp hàm truy vấn và các primitive tương tự CLI. Bạn truyền prompt cùng options như:

- `allowedTools`;
- system prompt;
- permission mode.

Sau đó ứng dụng lặp qua stream message và xử lý theo nhu cầu.

### Cách chọn

- Bắt đầu bằng Routine cho công việc lặp lại trên hạ tầng Anthropic.
- Dùng `-p` khi cần môi trường/pipeline và xử lý bằng shell.
- Dùng `--bare` khi CI cần tính xác định theo khả năng mà phiên bản hỗ trợ.
- Dùng Agent SDK khi agent là một phần trong sản phẩm của bạn.

---

## 7. GitHub Actions và Code Review

- Bài gốc: <https://anthropic.skilljar.com/claude-code-in-action/486936>
- Video: [GitHub Actions and Code Review](https://www.youtube.com/watch?v=gIVt_iqmACw)

Có hai con đường đưa Claude vào pull request: dịch vụ Code Review do Anthropic quản lý và GitHub Action tự cấu hình. Chúng giải quyết hai nhu cầu khác nhau.

### Code Review được quản lý

Admin tổ chức bật Code Review trong Claude Code admin settings, cài Claude GitHub app, chọn repository và thời điểm chạy:

- một lần khi PR mở;
- mỗi lần push vào PR;
- chỉ khi có comment `@claude review`.

Các review agent phân tích diff trong ngữ cảnh toàn codebase, đăng phát hiện inline tại dòng liên quan, gắn severity và tạo bảng tóm tắt trong check run. Dịch vụ deduplicate và xếp hạng để giảm các nitpick trùng lặp.

Giới hạn:

- không tự approve hoặc block PR;
- không có managed autofix;
- theo khóa học, đây là research preview cho Team/Enterprise, nên phạm vi có thể thay đổi.

Muốn áp dụng fix, chạy local:

```text
/code-review
/code-review --fix
```

### GitHub Action tự cấu hình

Dùng khi công việc vượt ra ngoài review: triển khai thay đổi từ comment, báo cáo theo lịch hoặc workflow tùy chỉnh.

Khởi tạo bằng:

```text
/install-github-app
```

Bạn cần quyền admin repository. Lệnh hướng dẫn cài GitHub app và thiết lập Anthropic API key secret.

Action:

```text
anthropics/claude-code-action@v1
```

Input quan trọng:

- `anthropic_api_key`;
- `github_token` — mặc định có thể là `secrets.GITHUB_TOKEN`;
- `trigger_phrase` — mặc định `@claude`;
- `use_bedrock` / `use_vertex`;
- `prompt`;
- `claude_args`.

Ví dụ bước lõi:

```yaml
- uses: anthropics/claude-code-action@v1
  with:
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    github_token: ${{ secrets.GITHUB_TOKEN }}
    trigger_phrase: "@claude"
    prompt: "Your instructions here"
    claude_args: "--max-turns 5 --model claude-sonnet-5"
```

Tên model trong ví dụ là nội dung khóa học; hãy dùng model hợp lệ ở thời điểm cấu hình.

Workflow có thể nghe `issue_comment`, `pull_request_review_comment`, cron hoặc `workflow_dispatch`. Với comment như `@claude implement the spec...`, Claude có thể tạo commit và phản hồi những gì đã làm.

### Tuning bằng `claude_args`

- `--max-turns 5`: giới hạn vòng lặp.
- permission mode phù hợp tác vụ không người giám sát.
- allowlist tool tối thiểu; báo cáo chỉ cần quyền đọc thì không cấp quyền ghi.
- model và budget phù hợp độ khó.

Nguyên tắc: dùng managed Code Review khi chỉ cần nhận xét; dùng GitHub Action khi cần Claude thực hiện công việc tùy biến trong CI.

---

## 8. Kiểm chứng các lần chạy không giám sát

- Bài gốc: <https://anthropic.skilljar.com/claude-code-in-action/486938>
- Video: [Trust It: Verifying Unsupervised Runs](https://www.youtube.com/watch?v=lalGZSNhm8E)

Khi Claude chạy mà không có người theo dõi, bạn phải kiểm tra nghiêm ngặt hơn. Quy tắc trung tâm:

> Bạn quan sát càng ít, mức kiểm chứng sau đó càng phải cao.

### Giữ unattended run trong Auto mode

Ở môi trường làm việc, nên giữ Auto thay vì bypass permissions để classifier vẫn kiểm tra ý định nguy hiểm. Nhưng lớp này không chứng minh mã đúng; nó chỉ giảm rủi ro của hành động.

### Bắt đầu bằng diff, không phải summary

Đừng để bản tóm tắt mượt mà thay thế bằng chứng. Quy trình:

1. Chạy `/code-review` để có vòng phân tích ban đầu.
2. Tự xem `git diff`.
3. Đọc trước những tệp nằm trong plan.
4. Tìm tệp ngoài plan, thay đổi dependency, cấu hình, test hoặc credential.

Summary có thể bỏ qua một tệp không ngờ tới; diff thì không.

### Biến test thành cổng, không phải lời hứa

Một agent có thể nói “tests pass” mà không chạy đúng test. Hãy cưỡng chế:

- Stop hook chạy test và từ chối kết thúc nếu thất bại.
- PostToolUse hook chạy lint/type-check sau edit.

Exit `2` đưa lỗi trở lại cho Claude, giúp nó tự sửa. Cổng phải chạy trong mọi lượt, không phụ thuộc người dùng có nhớ hỏi hay không.

### Kiểm chứng headless run

Đọc JSON result, exit code và log lệnh. Xác nhận output thật sự chứa bằng chứng cho điều kiện hoàn thành. Không chỉ kiểm tra câu trả lời prose.

### Lấy ý kiến thứ hai “lạnh”

Mở session hoặc subagent mới, không có lịch sử cách mã được tạo, và yêu cầu review diff. Reviewer không bị ràng buộc bởi những biện minh của agent tác giả nên dễ phát hiện lỗi bị bỏ qua.

### Ma trận mức kiểm chứng

| Mức tự động | Kiểm chứng tối thiểu |
|---|---|
| Phiên ngắn, bạn theo dõi | Xem diff và chạy test liên quan |
| Phiên dài, thỉnh thoảng theo dõi | Xem toàn diff, lint/type-check/test, reviewer |
| Chạy qua đêm hoặc CI | Hook bắt buộc, log/JSON/exit code, reviewer độc lập, kiểm tra thay đổi ngoài phạm vi |
| Thay đổi nhạy cảm/production | Thêm phê duyệt con người, sandbox, rollback và policy ngoài agent |

Tin cậy không đến từ lời tuyên bố của Claude; nó đến từ bằng chứng độc lập có thể lặp lại.

---

## 9. Plugins

- Bài gốc: <https://anthropic.skilljar.com/claude-code-in-action/486939>
- Video: [Plugins](https://www.youtube.com/watch?v=k4kZwJ0FtX0)

Plugin đóng gói một thiết lập Claude Code thành đơn vị cài đặt để chia sẻ cho người khác. Nó có thể chứa:

- skills;
- subagents;
- hooks;
- cấu hình MCP server;
- language servers;
- background monitors;
- themes;
- một phần `settings.json`.

### Cài plugin

Trong session:

```text
/plugin install org-name@plugin-name
```

Sau cài đặt, chạy:

```text
/reload-plugins
```

### Marketplace cho nhóm

Thêm nguồn plugin dùng chung:

```text
/plugin marketplace add your-org/claude-plugins
```

Marketplace tập trung discovery, version và update. Thành viên có thể duyệt plugin ở tab Discover.

### Đọc trước khi cài

Plugin chạy mã với quyền của người dùng. Hooks của plugin chạy tại mọi tool call khớp; subagent có thể thay đổi hành vi; MCP có thể kết nối ra ngoài. Vì vậy, cài plugin chỉ vì thích một skill vẫn có thể kéo theo hook hoặc cấu hình khác.

Trước khi bật, kiểm tra:

- source và tác giả;
- hooks, đặc biệt `PreToolUse` và `Stop`;
- agents và tool restrictions;
- MCP servers và endpoint mạng;
- script thực thi;
- context cost;
- settings mà plugin thay đổi.

Automated review hoặc marketplace listing không đồng nghĩa với đáng tin tuyệt đối.

### Thành phần chạy song song

Plugin không ghi đè cấu hình riêng; thành phần của nó chạy cùng cấu hình hiện có:

- Hooks xếp chồng: hook plugin và hook dự án đều chạy.
- Skills, agents và commands được namespace theo plugin để tránh trùng tên.
- `settings.json` của plugin chỉ hỗ trợ một phạm vi key hẹp theo khóa học, gồm các key status line cho agent/subagent.

Một key `agent` có thể đưa subagent của plugin lên main thread cùng system prompt, giới hạn tool và model của nó. Đây là lý do cần đọc chi tiết trước khi enable.

### Đóng gói plugin của riêng bạn

Plugin dùng cấu trúc `.claude` quen thuộc:

```text
plugin-root/
├─ skills/
│  └─ verify/
│     └─ SKILL.md
├─ agents/
│  └─ reviewer.md
├─ hooks/
│  └─ hooks.json
├─ .mcp.json
└─ .claude-plugin/
   └─ plugin.json
```

Manifest tùy chọn:

```json
{
  "name": "svg-splitter-review",
  "version": "0.1.0",
  "description": "Reviews the SVG Splitter repo",
  "author": {
    "name": "Lewis Menelaws"
  }
}
```

Tên là field bắt buộc nếu dùng manifest và tạo namespace như `company-name:skill-name`. Version plugin như một dependency để nhóm theo dõi update.

Hai quy tắc:

1. Khi dùng plugin: đọc trước khi cài vì nó chạy mã bằng quyền của bạn.
2. Khi xây một `.claude` hữu ích: đóng gói thành plugin thay vì copy/paste giữa máy.

---

## 10. Ôn tập cho bài kiểm tra 11 câu

- Quiz: <https://anthropic.skilljar.com/claude-code-in-action/487234>
- Khóa học hiển thị 11 câu.

Phần dưới là câu hỏi ôn tập do người biên soạn tạo dựa trên chín bài, không phải bản sao nguyên văn bài kiểm tra Skilljar.

### 1. Khi mô tả trạng thái “xong” chính xác hơn các bước, nên dùng gì?

**Đáp án:** `/goal`, vì nó đặt điều kiện hoàn thành để Claude tiếp tục cho đến khi evaluator xác nhận bằng bằng chứng trong transcript.

### 2. Khi muốn kiểm tra CI mỗi vài phút, Goal hay Loop phù hợp hơn?

**Đáp án:** Loop, vì cần lặp prompt theo thời gian và phản ứng với trạng thái ngoài.

### 3. Imports trong `CLAUDE.md` có giảm context không?

**Đáp án:** Không. Chúng giúp tổ chức, nhưng nội dung được mở rộng và nạp cùng lúc.

### 4. Quy tắc “không push vào main” nên đặt ở đâu?

**Đáp án:** Hook/policy thực thi, không chỉ `CLAUDE.md`, vì đây là giới hạn cứng.

### 5. Vì sao verification skill phải đọc cả diff lẫn kết quả test?

**Đáp án:** Test có thể bị làm yếu để chuyển xanh; diff cho thấy test và phạm vi thay đổi thật.

### 6. Auto mode bảo vệ điều gì và không bảo vệ điều gì?

**Đáp án:** Classifier kiểm tra ý định/hành động nguy hiểm; nó không đảm bảo mã đúng. Cần Stop hook/test để kiểm tra correctness.

### 7. Exit code nào dùng để block trong hook theo bài học?

**Đáp án:** Exit `2`; exit `1` không chặn.

### 8. Khi nào chọn Routine thay vì headless `-p`?

**Đáp án:** Khi tác vụ là prompt lặp lại và có thể chạy trên hạ tầng Anthropic mà không cần script/môi trường tùy chỉnh của bạn.

### 9. Managed Code Review khác GitHub Action thế nào?

**Đáp án:** Managed review tập trung phát hiện và comment, không approve/block/autofix; Action dành cho workflow tùy chỉnh có thể thực hiện công việc trong CI.

### 10. Bước đầu tiên khi kiểm tra unattended run là gì?

**Đáp án:** Xem diff, không bắt đầu bằng summary. Sau đó chạy các cổng test và reviewer độc lập.

### 11. Vì sao phải audit plugin trước khi cài?

**Đáp án:** Plugin có thể chạy hooks, agent và MCP bằng quyền của bạn; các thành phần chạy song song với cấu hình hiện có.

---

## 11. Lộ trình thực hành

### Bài thực hành 1 — Điều phối một phiên dài

1. Chọn một refactor có ít nhất năm tệp.
2. Dùng Plan mode và duyệt phạm vi.
3. Đặt `/goal` dựa trên test/type-check.
4. Compact có chỉ dẫn khi ngữ cảnh dài.
5. Cố ý tạo một nhánh thảo luận phụ rồi dùng Rewind/Summarize phù hợp.

### Bài thực hành 2 — Tối ưu `CLAUDE.md`

1. Đo độ dài và liệt kê mọi quy tắc.
2. Xóa điều hiển nhiên/lỗi thời.
3. Chuyển quy trình nhiều bước thành skill.
4. Chuyển giới hạn cứng thành hook.
5. Viết lại quy tắc còn lại sao cho kiểm tra được và nêu cách thay thế.

### Bài thực hành 3 — Xây verification stack

1. Tạo verification skill.
2. Tạo PostToolUse hook cho formatter/lint.
3. Tạo Stop hook chạy test.
4. Tạo reviewer subagent chỉ đọc.
5. Kiểm tra tình huống test bị cố ý làm yếu.

### Bài thực hành 4 — Tự động hóa

1. Chọn một báo cáo lặp lại.
2. Thử Routine nếu phù hợp hạ tầng managed.
3. Thử headless `-p` với JSON Schema.
4. Kiểm tra exit code, JSON result và giới hạn tool.
5. Không đưa credential thật vào bài thử.

### Bài thực hành 5 — Chia sẻ cho nhóm

1. Đóng gói skill, reviewer và hook thành plugin.
2. Viết manifest và version `0.1.0`.
3. Audit plugin như một người dùng bên ngoài.
4. Thử trong repository sandbox trước khi đưa vào marketplace nội bộ.

---

## Cheat sheet

```text
# Thu gọn ngữ cảnh có định hướng
/compact <những điều bản tóm tắt phải giữ>

# Mục tiêu kéo dài qua nhiều lượt
/goal <điều kiện hoàn thành có thể chứng minh>
/goal clear

# Lập lịch routine
/schedule <mô tả lịch và nhiệm vụ>

# Headless
claude -p "<prompt>"

# Resume session
claude --resume "<session_id>"

# Managed/local code review
/code-review
/code-review --fix

# Cài GitHub app/action
/install-github-app

# Plugin
/plugin install org-name@plugin-name
/reload-plugins
/plugin marketplace add your-org/claude-plugins
```

### Bảy nguyên tắc mang theo sau khóa học

```text
1. Plan trước khi code.
2. Mô tả “done” bằng bằng chứng kiểm tra được.
3. Xem diff thay vì tin summary.
4. Hướng dẫn mềm vào CLAUDE.md; quy trình vào Skill; luật cứng vào Hook.
5. Quyền càng rộng thì kiểm chứng càng nghiêm.
6. Cô lập công việc song song và unattended runs.
7. Audit plugin trước khi cài và đóng gói cấu hình tốt để chia sẻ có version.
```
