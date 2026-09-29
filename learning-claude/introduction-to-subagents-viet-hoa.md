# Introduction to Subagents — Giáo trình Việt hóa và giảng lại

> Nguồn học: khóa **Introduction to subagents** của Anthropic Academy.  
> Bản này diễn giải lại bằng tiếng Việt theo cấu trúc của khóa học, có bổ sung ví dụ và bài tập để dễ áp dụng. Đây không phải bản chép nguyên văn.

## Mục lục

1. [Lộ trình học](#lộ-trình-học)
2. [Bài 1 — Subagent là gì?](#bài-1--subagent-là-gì)
3. [Bài 2 — Tạo một subagent](#bài-2--tạo-một-subagent)
4. [Bài 3 — Thiết kế subagent hiệu quả](#bài-3--thiết-kế-subagent-hiệu-quả)
5. [Bài 4 — Sử dụng subagent hiệu quả](#bài-4--sử-dụng-subagent-hiệu-quả)
6. [Mẫu subagent hoàn chỉnh để thực hành](#mẫu-subagent-hoàn-chỉnh-để-thực-hành)
7. [Bảng quyết định nhanh](#bảng-quyết-định-nhanh)
8. [Bài tập tổng kết](#bài-tập-tổng-kết)

---

## Lộ trình học

Khóa học gồm bốn bài, đi theo trình tự từ hiểu bản chất đến sử dụng đúng tình huống:

1. **What are subagents?** — Hiểu subagent, context window và cơ chế ủy quyền.
2. **Creating a subagent** — Tạo subagent bằng lệnh `/agents`, chọn phạm vi, công cụ, mô hình và viết tệp cấu hình.
3. **Designing effective subagents** — Viết mô tả tốt, định nghĩa đầu ra, báo cáo trở ngại và giới hạn công cụ.
4. **Using subagents effectively** — Nhận biết trường hợp nên dùng, không nên dùng và quy tắc ra quyết định.

Mạch tư duy xuyên suốt là:

```text
Công việc cần làm
    ↓
Công việc trung gian có quan trọng với luồng chính không?
    ├─ Không → có thể giao cho subagent
    └─ Có   → nên giữ trong luồng chính
```

---

## Bài 1 — Subagent là gì?

### Video của bài

- [What are subagents? — YouTube](https://www.youtube.com/watch?v=jKErNxuxPXg)

### 1.1. Định nghĩa

**Subagent** là một trợ lý chuyên biệt mà Claude Code có thể giao một nhiệm vụ riêng. Hãy hình dung main agent là người điều phối, còn subagent là cộng sự được gọi vào để xử lý một phần việc có phạm vi rõ ràng.

Mỗi subagent:

- chạy trong một **context window riêng**;
- nhận một vai trò và bộ quy tắc riêng qua **system prompt**;
- nhận một nhiệm vụ cụ thể do main agent viết;
- có thể đọc tệp, tìm kiếm, chạy công cụ hoặc sửa mã tùy quyền được cấp;
- khi xong chỉ trả một bản tóm tắt về luồng chính;
- toàn bộ diễn biến nội bộ của phiên subagent sau đó bị loại bỏ.

Điểm quan trọng không phải là “có thêm một Claude thông minh hơn”, mà là **tách ngữ cảnh và chuyên môn hóa cách làm việc**.

### 1.2. Vì sao context window quan trọng?

Trong một phiên Claude Code, gần như mọi thứ đều chiếm chỗ trong context window:

- câu hỏi của bạn;
- câu trả lời của Claude;
- nội dung tệp đã đọc;
- kết quả tìm kiếm;
- lệnh công cụ và kết quả của lệnh;
- các quyết định đã đưa ra trong quá trình làm việc.

Context window là hữu hạn. Nếu một nhiệm vụ khám phá tạo ra quá nhiều dữ liệu, Claude có thể khó giữ được các chi tiết cũ hoặc dành ít “không gian chú ý” hơn cho mục tiêu chính.

Subagent giải quyết vấn đề này bằng cách tạo một ngữ cảnh phụ. Luồng chính không phải chứa hàng chục lần đọc tệp hoặc kết quả tìm kiếm; nó chỉ nhận phần kết luận đã cô đọng.

### 1.3. Hai đầu vào của một subagent

Khi main agent gọi một subagent, subagent thường nhận hai thứ:

1. **System prompt tùy chỉnh**

   Được lấy từ tệp cấu hình của subagent. Nó quy định vai trò, phạm vi, tiêu chí đánh giá, cách làm và định dạng báo cáo.

2. **Task description — mô tả nhiệm vụ**

   Được main agent viết dựa trên yêu cầu hiện tại của người dùng. Ví dụ: “Hãy rà soát ba tệp A, B, C, tập trung vào lỗi bảo mật và trả kết quả theo mức độ nghiêm trọng.”

System prompt có tính ổn định qua nhiều lần chạy; task description thay đổi theo từng nhiệm vụ.

### 1.4. Chu trình hoạt động

```text
Bạn đưa yêu cầu
    ↓
Main agent xác định phần việc có thể ủy quyền
    ↓
Main agent chọn subagent phù hợp
    ↓
Subagent nhận system prompt + task description
    ↓
Subagent tự làm việc trong context riêng
    ↓
Subagent trả bản tóm tắt/kết quả
    ↓
Main agent dùng kết quả để tiếp tục
```

Các lần đọc tệp, tìm kiếm và gọi công cụ của subagent không làm đầy context chính. Đổi lại, main agent không nhìn thấy toàn bộ quá trình suy luận và khám phá của subagent.

### 1.5. Ví dụ thực tế: tìm dịch vụ xử lý hoàn tiền

Giả sử bạn bước vào một codebase lạ và muốn biết dịch vụ nào xử lý hoàn tiền.

**Nếu không dùng subagent:**

- main agent tìm kiếm từ khóa `refund`;
- đọc khoảng 15 tệp;
- lần theo router, service và nhiều lời gọi hàm;
- toàn bộ nội dung đó nằm trong context chính;
- cuối cùng bạn chỉ cần một thông tin: tên dịch vụ xử lý hoàn tiền.

**Nếu dùng subagent Explore:**

- subagent tự tìm kiếm và đọc các tệp trong context riêng;
- nó lần theo luồng gọi hàm;
- main agent chỉ nhận kết luận tập trung, chẳng hạn: “Hoàn tiền được xử lý bởi `RefundService`, được gọi từ `payments/refund-handler.ts`.”

Bạn nhận được câu trả lời mà không mang toàn bộ “hành trình tìm kiếm” vào luồng chính.

### 1.6. Đánh đổi cần nhớ

Lợi ích lớn nhất là **ngữ cảnh sạch**. Đánh đổi lớn nhất là **mất khả năng quan sát chi tiết**.

Vì vậy, subagent phù hợp khi bạn cần kết quả cuối hơn là toàn bộ quá trình. Nếu từng bước trung gian chứa dữ liệu bạn cần xem, chẩn đoán hoặc phản ứng ngay, việc ủy quyền có thể gây hại.

### 1.7. Các subagent có sẵn trong Claude Code

Khóa học giới thiệu ba loại tích hợp sẵn:

- **General purpose**: dành cho nhiệm vụ nhiều bước, vừa khám phá vừa thực hiện hành động.
- **Explore**: dành cho tìm kiếm nhanh và điều hướng codebase.
- **Plan**: được dùng trong Plan mode để nghiên cứu codebase trước khi main agent trình bày kế hoạch.

Ngoài ra, bạn có thể tạo subagent riêng như:

- người rà soát mã;
- người viết kiểm thử;
- người tạo tài liệu;
- người nghiên cứu web;
- người áp dụng design system;
- người viết nội dung marketing theo giọng thương hiệu.

### 1.8. Ba lợi ích chính

1. **Chia nhỏ công việc có trọng tâm** — mỗi subagent tập trung vào một mục tiêu.
2. **Giữ context chính gọn** — công việc trung gian bị cô lập.
3. **Chỉ trả lại thông tin cần thiết** — main agent nhận một kết quả ngắn gọn, có thể hành động.

### 1.9. Tự kiểm tra sau bài 1

Bạn nên trả lời được:

- Subagent khác main agent ở điểm nào?
- Vì sao việc đọc nhiều tệp có thể làm giảm hiệu quả của phiên chính?
- Subagent nhận hai đầu vào nào?
- Lợi ích và đánh đổi quan trọng nhất là gì?

---

## Bài 2 — Tạo một subagent

### Video của bài

- [Creating a subagent — YouTube](https://www.youtube.com/watch?v=arD6qEWa2Xc)

### 2.1. Subagent tùy chỉnh được lưu như thế nào?

Một subagent tùy chỉnh được định nghĩa trong một tệp Markdown có **YAML frontmatter** ở đầu. Tệp này vừa chứa dữ liệu cấu hình, vừa chứa system prompt.

Thông thường, subagent ở cấp dự án được lưu tại:

```text
.claude/agents/ten-subagent.md
```

Cấu trúc tổng quát:

```markdown
---
name: ten-subagent
description: Mô tả khi nào nên dùng subagent này.
tools: Read, Grep, Glob
model: sonnet
color: purple
---

Phần bên dưới frontmatter là system prompt của subagent.
```

### 2.2. Cách tạo dễ nhất: lệnh `/agents`

Trong Claude Code, chạy:

```text
/agents
```

Đây là giao diện chính để quản lý subagent. Chọn **Create new agent** để bắt đầu.

### 2.3. Chọn phạm vi

Bạn được hỏi subagent thuộc phạm vi nào:

- **Project-level**: chỉ có trong dự án hiện tại. Phù hợp khi system prompt nhắc đến kiến trúc, tiêu chuẩn hoặc tệp riêng của dự án.
- **User-level**: dùng chung cho các dự án trên máy. Phù hợp với vai trò có tính phổ quát, chẳng hạn kiểm tra tài liệu hoặc rà lỗi theo một quy trình cá nhân.

Quy tắc thực tế:

- nếu subagent phụ thuộc vào convention của repository → chọn project-level;
- nếu nó hữu ích gần như giống nhau ở mọi nơi → cân nhắc user-level.

### 2.4. Tạo thủ công hay để Claude sinh cấu hình?

Bạn có thể tự viết tệp cấu hình, nhưng khóa học khuyên nên mô tả mục tiêu rồi để Claude tạo bản ban đầu.

Ví dụ yêu cầu:

```text
Tạo một subagent chuyên rà soát chất lượng và bảo mật của mã vừa thay đổi.
Nó chỉ được đọc mã và chạy các lệnh cần thiết để xem diff; không được sửa tệp.
```

Claude sẽ đề xuất:

- tên;
- description;
- system prompt;
- bộ công cụ phù hợp.

Sau đó bạn vẫn nên kiểm tra và chỉnh lại, đặc biệt là `description`, quyền công cụ và định dạng đầu ra.

### 2.5. Chọn công cụ theo nguyên tắc đặc quyền tối thiểu

Trong quá trình tạo, bạn có thể cấu hình các nhóm công cụ:

- công cụ chỉ đọc;
- công cụ chỉnh sửa;
- công cụ thực thi;
- công cụ MCP;
- các công cụ khác.

Hỏi một câu rất cụ thể: **Subagent cần làm hành động nào để hoàn thành nhiệm vụ?**

Ví dụ với code reviewer:

- cần `Read`, `Grep`, `Glob` để đọc và tìm mã;
- có thể cần `Bash` để chạy `git diff` và nhìn thay đổi chưa commit;
- không cần `Edit` hoặc `Write`, vì nhiệm vụ là đánh giá chứ không phải sửa mã.

Giới hạn công cụ giúp:

- giảm nguy cơ tác dụng phụ ngoài ý muốn;
- khiến vai trò rõ ràng hơn;
- tránh để subagent tự mở rộng nhiệm vụ;
- giúp người dùng tin tưởng hơn vào phạm vi hoạt động.

### 2.6. Chọn model

Khóa học nêu bốn lựa chọn:

- **Haiku** — thích hợp cho tác vụ nhanh, nhẹ, lặp lại và có phạm vi rõ.
- **Sonnet** — điểm cân bằng giữa tốc độ và chiều sâu.
- **Opus** — thích hợp cho phân tích phức tạp, cần suy luận sâu.
- **Inherit** — dùng cùng model với cuộc trò chuyện chính.

Không nên mặc định chọn model mạnh nhất. Hãy căn cứ vào độ khó và chi phí/độ trễ:

```text
Tìm kiếm đơn giản, phân loại → Haiku
Review thông thường, tài liệu hóa → Sonnet
Kiến trúc/phân tích phức tạp → Opus
Muốn đồng bộ với main agent → Inherit
```

### 2.7. Chọn màu

Màu chỉ dùng để nhận biết subagent đang hoạt động trong giao diện. Nó không thay đổi khả năng, nhưng hữu ích khi bạn có nhiều subagent.

### 2.8. Giải thích từng trường cấu hình

Ví dụ theo tinh thần của khóa học:

```markdown
---
name: code-quality-reviewer
description: Proactively review recently modified code for quality, security, reliability, maintainability, and performance issues.
tools: Bash, Glob, Grep, Read
model: sonnet
color: purple
---

You are a code reviewer. Examine only the files named in the task.
Identify security, correctness, maintainability, and performance issues.
Return findings in the required structured format.
```

#### `name`

Là định danh duy nhất. Bạn có thể yêu cầu Claude gọi subagent bằng lời tự nhiên hoặc đề cập trực tiếp, ví dụ:

```text
@agent code-quality-reviewer
```

Tên nên:

- ngắn;
- mô tả đúng chức năng;
- tránh những tên chung chung như `helper` hoặc `expert`.

#### `description`

Đây là trường cực kỳ quan trọng vì nó điều khiển **khi nào main agent quyết định dùng subagent**.

Description phải nằm trên một dòng. Nếu thật sự cần ngắt dòng, có thể dùng ký tự xuống dòng đã escape như `\n`.

Description tốt cần nói rõ:

- loại nhiệm vụ phù hợp;
- dấu hiệu kích hoạt;
- dữ liệu mà main agent phải cung cấp;
- kết quả mong muốn;
- trường hợp không nên dùng, nếu cần.

Nếu muốn Claude chủ động gọi subagent, khóa học gợi ý dùng từ **“proactively”** trong description. Có thể thêm tình huống ví dụ để main agent hiểu lúc nào nên ủy quyền.

#### `tools`

Liệt kê công cụ được phép dùng. Danh sách ban đầu phản ánh lựa chọn khi tạo, nhưng bạn có thể sửa trực tiếp về sau.

#### `model`

Nhận một trong các giá trị tương ứng với Sonnet, Opus, Haiku hoặc `inherit`.

#### `color`

Màu nhận diện trong giao diện.

### 2.9. System prompt nằm ở đâu?

Mọi nội dung phía dưới YAML frontmatter là system prompt. Đây là nơi bạn quy định:

- subagent phải tập trung vào điều gì;
- giới hạn phạm vi;
- tiêu chí phân tích;
- thứ tự thực hiện;
- mức độ chủ động;
- định dạng đầu ra;
- cách báo cáo thông tin cho main agent.

Một system prompt mơ hồ tạo ra subagent hay đi lệch hoặc làm quá lâu. Một system prompt cụ thể tạo ra hành vi ổn định và dễ dự đoán.

### 2.10. Kiểm thử subagent

Sau khi tạo code reviewer:

1. tạo một thay đổi nhỏ trong mã;
2. yêu cầu Claude rà soát thay đổi;
3. kiểm tra xem đúng subagent có được gọi không;
4. kiểm tra nó có xem đúng tệp không;
5. kiểm tra báo cáo có đúng định dạng và đủ dữ liệu không.

Nếu subagent không tự được gọi như mong đợi, ưu tiên sửa `description`:

- thêm dấu hiệu kích hoạt cụ thể;
- thêm ví dụ;
- nói rõ main agent phải truyền tệp nào;
- tránh mô tả quá rộng.

### 2.11. Tự kiểm tra sau bài 2

Bạn nên trả lời được:

- Lệnh nào mở giao diện quản lý subagent?
- Khi nào chọn project-level hoặc user-level?
- Vì sao reviewer không nên có quyền Edit/Write?
- `description` và system prompt khác nhau như thế nào?
- Khi nào dùng Haiku, Sonnet, Opus hoặc Inherit?

---

## Bài 3 — Thiết kế subagent hiệu quả

### Video của bài

- [Designing effective subagents — YouTube](https://www.youtube.com/watch?v=WPxWKT_OaU4)

### 3.1. Bốn trụ cột của một subagent tốt

Một subagent cấu hình kém có thể lang thang, chạy quá lâu hoặc trả kết quả mà main agent không dùng được. Khóa học quy vấn đề về bốn yếu tố:

1. description cụ thể;
2. định dạng đầu ra có cấu trúc;
3. báo cáo trở ngại và cách xử lý;
4. quyền công cụ có giới hạn.

### 3.2. Dữ liệu cấu hình được dùng ra sao?

Mỗi khi bạn gửi tin nhắn cho main agent, **tên và description của các subagent có sẵn** được đưa vào system prompt của main agent. Nhờ đó main agent biết:

- hiện có những subagent nào;
- mỗi subagent phù hợp với loại nhiệm vụ nào;
- khi nào nên tự động gọi chúng.

Description còn có vai trò thứ hai: khi gọi subagent, main agent phải viết task description khởi động. Nó dùng description của subagent làm hướng dẫn để viết nhiệm vụ đó.

Vì vậy, description tác động đến cả:

- **thời điểm** subagent được gọi;
- **nội dung nhiệm vụ** mà subagent nhận được.

### 3.3. Viết description để định hình input prompt

Description quá chung chung:

```yaml
description: Reviews code changes.
```

Main agent có thể chỉ giao: “Hãy dùng git diff để tìm các thay đổi.” Subagent lại phải tự đoán tệp nào quan trọng.

Description tốt hơn:

```yaml
description: Review specified changed files for correctness and security. The parent agent must provide the exact file paths to review and the feature intent. Return findings with file and line references.
```

Khi đó main agent có xu hướng truyền:

- danh sách tệp chính xác;
- ý định của thay đổi;
- tiêu chí đánh giá;
- yêu cầu về tham chiếu dòng.

Tương tự, với subagent nghiên cứu web, câu “return sources that can be cited” trong description khiến main agent nhớ yêu cầu subagent trả nguồn có thể trích dẫn.

### 3.4. Định nghĩa định dạng đầu ra

Theo khóa học, đây là cải tiến quan trọng nhất.

Một output format tốt có hai tác dụng:

1. **Tạo điểm dừng tự nhiên** — subagent biết hoàn thành khi đã điền đủ các mục.
2. **Ngăn làm việc quá lâu** — không có format, agent khó biết nghiên cứu đến đâu là đủ.

Mẫu cho code review:

```text
1. Summary
   - Phạm vi đã rà soát và đánh giá chung.

2. Critical Issues
   - Lỗ hổng bảo mật, rủi ro dữ liệu hoặc lỗi logic phải sửa ngay.

3. Major Issues
   - Vấn đề kiến trúc, chất lượng hoặc hiệu năng đáng kể.

4. Minor Issues
   - Style, tài liệu hoặc tối ưu nhỏ.

5. Recommendations
   - Cách cải thiện hoặc refactor.

6. Approval Status
   - Ready to merge / Requires changes.
```

Format này vừa là checklist, vừa là “điều kiện hoàn tất”.

### 3.5. Báo cáo trở ngại

Trong quá trình làm việc, subagent có thể phát hiện:

- vấn đề thiết lập môi trường;
- lệnh chỉ chạy khi thêm cờ đặc biệt;
- dependency hoặc import gây lỗi;
- workaround cần thiết;
- convention không được ghi chép;
- dữ liệu không đủ hoặc tệp bị thiếu.

Nếu các chi tiết này không xuất hiện trong bản tóm tắt, main agent sẽ phải khám phá lại, gây lãng phí thời gian và token.

Hãy thêm mục bắt buộc:

```text
7. Obstacles Encountered
   - Setup issues
   - Workarounds discovered
   - Environment quirks
   - Commands requiring special flags/configuration
   - Dependency/import problems
```

Nếu không gặp trở ngại, subagent nên ghi “None” thay vì bỏ mục. Như vậy main agent biết đây là kết luận có chủ ý.

### 3.6. Giới hạn công cụ theo vai trò

#### Subagent nghiên cứu/chỉ đọc

Thường chỉ cần:

```text
Glob, Grep, Read
```

Nó có thể tìm và đọc nhưng không thể vô tình sửa tệp.

#### Code reviewer

Có thể cần:

```text
Bash, Glob, Grep, Read
```

`Bash` giúp chạy `git diff` hoặc các lệnh kiểm tra. Reviewer vẫn không cần `Edit`/`Write`.

#### Subagent sửa giao diện hoặc mã

Mới cần:

```text
Edit, Write
```

Vì nhiệm vụ của nó thực sự là thay đổi code, chẳng hạn áp dụng CSS theo design system.

### 3.7. Mẫu thiết kế hoàn chỉnh

```markdown
---
name: code-reviewer
description: Proactively review the exact files supplied by the parent after meaningful code changes. The parent must include file paths and intended behavior. Return actionable findings with file/line references. Do not edit files.
tools: Bash, Glob, Grep, Read
model: sonnet
color: purple
---

You are a read-only code reviewer.

Review only the files named in the task. Compare the implementation with the stated intent.
Prioritize correctness, security, data integrity, maintainability, and performance.
Do not modify files.

Return:
1. Summary
2. Critical Issues
3. Major Issues
4. Minor Issues
5. Recommendations
6. Approval Status
7. Obstacles Encountered

Every issue must include a file path, line reference when available, impact, and a concrete fix.
Write "None" for any empty section.
```

### 3.8. Dấu hiệu thiết kế chưa tốt

- Tên kiểu `expert` nhưng không chỉ ra công việc.
- Description chỉ có một câu rất rộng.
- Subagent được cấp mọi công cụ.
- Không có giới hạn phạm vi.
- Không quy định output format.
- Không yêu cầu dẫn tệp/dòng hoặc bằng chứng.
- Không báo trở ngại.
- Kết quả dài nhưng main agent không biết phải làm gì tiếp.

### 3.9. Tự kiểm tra sau bài 3

Bạn nên trả lời được:

- Vì sao description ảnh hưởng cả lúc gọi và nội dung nhiệm vụ?
- Tại sao output format giúp agent dừng đúng lúc?
- “Obstacles Encountered” tiết kiệm công sức cho main agent ra sao?
- Bộ công cụ tối thiểu của research agent, reviewer và modification agent khác nhau thế nào?

---

## Bài 4 — Sử dụng subagent hiệu quả

### Video của bài

- [Using subagents effectively — YouTube](https://www.youtube.com/watch?v=n5LoKZ8Oa-A)

### 4.1. Câu hỏi quyết định

Quy tắc cốt lõi của cả khóa học:

> **Công việc trung gian có quan trọng với main thread không?**

- Nếu **không**, bạn chủ yếu cần kết quả cuối → giao cho subagent.
- Nếu **có**, bạn cần xem và phản ứng theo từng bước → giữ trong main thread.

Subagent tỏa sáng khi **khám phá tách biệt với thực thi**. Nó dễ gây mất mát thông tin khi bước sau phụ thuộc chặt vào phát hiện của bước trước.

### 4.2. Trường hợp subagent phát huy tốt

Subagent phù hợp khi:

- bạn cần kết quả, không cần toàn bộ nhật ký tìm kiếm;
- công việc khám phá sẽ làm context chính quá nặng;
- nhiệm vụ hưởng lợi từ góc nhìn mới;
- cần một custom system prompt rất khác prompt mặc định;
- phạm vi có thể mô tả rõ và đầu ra có thể chuẩn hóa.

### 4.3. Nghiên cứu codebase

Ví dụ: tìm nơi xác thực JWT.

Subagent có thể:

- tìm từ khóa liên quan;
- đọc nhiều tệp middleware/router;
- lần theo lời gọi hàm;
- phân biệt nơi parse token và nơi thật sự verify chữ ký;
- trả kết luận ngắn gọn.

Ví dụ đầu ra hữu ích:

```text
JWT được xác thực tại middleware/auth.js:42.
Middleware này được gắn vào Express router tại routes/api.js.
```

Main thread không cần xem từng kết quả tìm kiếm để dùng kết luận đó vào bước tiếp theo.

### 4.4. Code review bằng “đôi mắt mới”

Nếu main agent đã cùng bạn xây tính năng qua nhiều lượt, nó mang theo lịch sử và các giả định khi viết mã. Việc yêu cầu chính luồng đó tự review thường tạo phản hồi yếu hơn.

Reviewer subagent:

- không có lịch sử “đồng tác giả”;
- nhìn `git diff` trong context riêng;
- đọc các tệp thay đổi;
- áp dụng tiêu chí review chuyên biệt;
- có thể chứa chuẩn review riêng của dự án trong system prompt.

Sự tách biệt này tạo một góc nhìn mới và giúp đội nhóm dùng tiêu chí nhất quán.

### 4.5. Nhiệm vụ cần custom system prompt

Prompt mặc định của Claude Code thiên về trả lời ngắn gọn, kỹ thuật và tập trung vào code. Điều đó tốt cho lập trình nhưng không tối ưu cho mọi nhiệm vụ.

#### Copywriting subagent

Bạn có thể định nghĩa:

- chân dung người đọc;
- giọng thương hiệu;
- mức độ trang trọng;
- cấu trúc landing page/email;
- từ ngữ nên dùng và nên tránh;
- lời kêu gọi hành động.

Nhờ prompt riêng, nó viết nội dung marketing phù hợp hơn luồng code mặc định.

#### Styling subagent

Cho subagent tham chiếu các tệp design system. Khi chạy, nó nạp các quy tắc cần thiết vào context riêng:

- biến màu;
- thang spacing;
- typography;
- component patterns;
- convention CSS.

Sau đó nó có thể áp dụng giao diện nhất quán mà không làm context chính bị chất đầy bởi toàn bộ design system.

### 4.6. Khi subagent gây hại

Việc khởi chạy subagent có chi phí:

- thêm bước ủy quyền;
- mất khả năng quan sát chi tiết;
- kết quả bị nén thành tóm tắt;
- có nguy cơ mất thông tin qua bàn giao.

Chi phí này chỉ đáng khi subagent tạo ra giá trị mà main thread khó đạt được trực tiếp.

#### Anti-pattern 1: “Chuyên gia” chỉ bằng lời tuyên bố

Ví dụ:

```text
You are a Python expert.
You are a Kubernetes specialist.
```

Chỉ gắn nhãn “chuyên gia” không tạo thêm năng lực; Claude vốn đã có kiến thức đó. Nếu subagent không có context, công cụ, quy trình hay đầu ra riêng, nó chỉ thêm overhead.

Một persona có giá trị khi nó mang theo **hành vi chuyên biệt**, chẳng hạn:

- checklist riêng của dự án;
- tiêu chuẩn bảo mật bắt buộc;
- nguồn dữ liệu riêng;
- format báo cáo cụ thể;
- quyền công cụ phù hợp.

#### Anti-pattern 2: Pipeline tuần tự phụ thuộc nhau

Ví dụ ba agent:

1. agent A tái hiện lỗi;
2. agent B debug;
3. agent C sửa lỗi.

Chuỗi này dễ thất bại vì B phụ thuộc chi tiết A phát hiện, và C phụ thuộc toàn bộ quá trình chẩn đoán của B. Mỗi lần bàn giao lại nén thông tin, nên các sắc thái quan trọng có thể biến mất.

Pipeline chỉ tốt khi các phần việc **thật sự độc lập**. Nếu bước sau cần phản ứng liên tục với bằng chứng của bước trước, nên để một luồng giữ toàn bộ context.

#### Anti-pattern 3: Test runner subagent

Khi test thất bại, bạn thường cần:

- toàn bộ stdout/stderr;
- stack trace;
- test case cụ thể;
- trạng thái môi trường;
- chuỗi lỗi trước đó.

Nếu subagent chỉ trả “tests failed”, main thread lại phải chạy hoặc điều tra lần nữa. Khóa học cho biết kiểu cấu hình test runner đã cho kết quả kém hơn trong thử nghiệm.

Điều này không có nghĩa là subagent không bao giờ được chạy test. Vấn đề là dùng nó như một lớp che mất thông tin mà luồng chính cần để debug.

### 4.7. Nên và không nên

**Nên dùng cho:**

- nghiên cứu và khám phá;
- code review độc lập;
- nhiệm vụ cần custom system prompt;
- phần việc độc lập, có đầu ra rõ;
- tác vụ mà nhật ký trung gian không quan trọng.

**Tránh dùng cho:**

- persona “expert” không thêm quy trình hay năng lực;
- pipeline nhiều bước phụ thuộc chặt;
- chạy test khi cần xem đầy đủ output để chẩn đoán;
- nhiệm vụ đang biến đổi liên tục và cần người dùng phản hồi từng bước;
- phần việc mà bằng chứng trung gian quan trọng hơn kết luận.

### 4.8. Ví dụ ra quyết định

| Tình huống | Có nên dùng subagent? | Lý do |
|---|---:|---|
| Tìm tệp thực hiện JWT validation | Có | Chỉ cần kết luận và tham chiếu |
| Review diff sau một tính năng lớn | Có | Góc nhìn mới, tiêu chí riêng |
| Viết landing page theo giọng thương hiệu | Có | Cần system prompt khác prompt code |
| Chạy test đang lỗi để debug tương tác | Không nên | Cần thấy đầy đủ output và phản ứng từng bước |
| Ba agent lần lượt reproduce → debug → fix | Không nên | Mất thông tin qua từng lần bàn giao |
| Quét độc lập ba module không liên quan | Có thể | Các phần việc độc lập, kết quả có thể hợp nhất |
| “Gọi Python expert để viết một hàm nhỏ” | Không cần | Main agent làm trực tiếp, không có giá trị bổ sung |

### 4.9. Tự kiểm tra sau bài 4

Bạn nên trả lời được:

- Câu hỏi quyết định quan trọng nhất là gì?
- Vì sao reviewer subagent có “đôi mắt mới”?
- Vì sao persona expert đơn thuần ít giá trị?
- Pipeline tuần tự thất thoát thông tin như thế nào?
- Vì sao test runner có thể làm việc debug khó hơn?

---

## Mẫu subagent hoàn chỉnh để thực hành

Dưới đây là mẫu rút ra từ toàn bộ nguyên tắc của khóa học. Bạn có thể lưu thành:

```text
.claude/agents/code-reviewer.md
```

```markdown
---
name: code-reviewer
description: Proactively review meaningful code changes after implementation. The parent must provide the exact file paths, intended behavior, and relevant constraints. Use this agent for an independent read-only review; do not use it to implement fixes. Return actionable findings with file and line references.
tools: Bash, Glob, Grep, Read
model: sonnet
color: purple
---

You are an independent, read-only code reviewer.

## Scope

- Review only the files explicitly named in the task.
- Compare the implementation with the intended behavior and stated constraints.
- You may inspect directly related definitions when necessary, but report any scope expansion.
- Do not edit or write files.

## Review criteria

Prioritize:

1. Correctness and logic errors
2. Security and data integrity
3. Reliability and failure handling
4. Architecture and maintainability
5. Performance
6. Tests and documentation gaps

## Required output

1. Summary
2. Critical Issues
3. Major Issues
4. Minor Issues
5. Recommendations
6. Approval Status: Ready to merge / Requires changes
7. Obstacles Encountered

For every issue, include:

- severity;
- file path and line reference when available;
- why it matters;
- a concrete remediation.

Write "None" for empty sections. Do not invent findings merely to fill the template.
```

### Cách gọi thử

```text
Hãy dùng code-reviewer để rà soát:
- src/auth/middleware.ts
- src/routes/api.ts

Mục tiêu thay đổi: chuyển JWT validation sang middleware dùng chung.
Ràng buộc: không thay đổi hành vi của các route hiện có.
```

Điểm tốt của yêu cầu này:

- chỉ rõ subagent;
- chỉ rõ tệp;
- nói rõ ý định;
- nêu ràng buộc;
- tạo cơ sở để reviewer kiểm tra đúng/sai.

---

## Bảng quyết định nhanh

Trước khi tạo hoặc gọi subagent, đi qua checklist này:

| Câu hỏi | Nếu “Có” thì… |
|---|---|
| Tôi chỉ cần kết luận, không cần hành trình? | Nghiêng về dùng subagent |
| Công việc khám phá sẽ đọc/tìm rất nhiều dữ liệu? | Nghiêng về dùng subagent |
| Nhiệm vụ cần system prompt riêng? | Nghiêng về dùng subagent |
| Nhiệm vụ cần góc nhìn độc lập? | Nghiêng về dùng subagent |
| Bước sau phụ thuộc chi tiết chưa nén của bước trước? | Giữ trong main thread |
| Tôi cần xem đầy đủ log/output để phản ứng? | Giữ trong main thread |
| Subagent chỉ mang nhãn “expert” mà không có quy trình riêng? | Không cần tạo |
| Có thể xác định output format và điều kiện hoàn tất? | Rất phù hợp với subagent |

Checklist thiết kế:

- [ ] Tên thể hiện nhiệm vụ cụ thể.
- [ ] Description nói rõ khi nào dùng.
- [ ] Description giúp main agent truyền đúng dữ liệu đầu vào.
- [ ] System prompt có phạm vi và tiêu chí.
- [ ] Output format có cấu trúc.
- [ ] Có mục báo cáo obstacles/workarounds.
- [ ] Chỉ cấp công cụ thật sự cần.
- [ ] Model phù hợp với độ khó.
- [ ] Đã thử bằng một nhiệm vụ thực tế.
- [ ] Nếu không tự kích hoạt đúng, đã sửa description và thêm ví dụ.

---

## Bài tập tổng kết

### Bài tập 1 — Phân loại tình huống

Với mỗi nhiệm vụ sau, quyết định dùng main thread hay subagent và giải thích bằng quy tắc “công việc trung gian có quan trọng không?”:

1. Tìm nơi hệ thống tính phí vận chuyển trong codebase lạ.
2. Debug một integration test lúc đậu lúc rớt.
3. Rà soát bảo mật cho bốn tệp vừa sửa.
4. Viết email marketing đúng giọng thương hiệu.
5. Lần lượt tái hiện, phân tích và sửa một race condition.

Gợi ý: 1, 3, 4 thường hợp với subagent; 2 và 5 thường cần giữ ngữ cảnh đầy đủ trong main thread.

### Bài tập 2 — Sửa description

Description chưa tốt:

```yaml
description: A helpful expert that reviews code.
```

Hãy viết lại để có:

- thời điểm sử dụng;
- dữ liệu main agent phải truyền;
- phạm vi chỉ đọc;
- format kết quả mong muốn;
- ít nhất một trường hợp không nên dùng.

### Bài tập 3 — Thiết kế quyền công cụ

Chọn bộ công cụ tối thiểu cho:

1. agent nghiên cứu kiến trúc;
2. agent review diff;
3. agent sửa CSS theo design system.

Giải thích vì sao từng agent có hoặc không có quyền Edit/Write/Bash.

### Bài tập 4 — Tạo subagent thật

1. Chạy `/agents`.
2. Chọn **Create new agent**.
3. Tạo project-level code reviewer.
4. Chỉ cấp quyền đọc và quyền chạy lệnh cần thiết để xem diff.
5. Chọn Sonnet hoặc model phù hợp.
6. Thêm output format gồm bảy phần như mẫu.
7. Thay đổi một tệp nhỏ và yêu cầu review.
8. Quan sát: nó có tự kích hoạt đúng không, có dừng đúng lúc không, có báo trở ngại không?

### Bài tập 5 — Tự đánh giá

Sau khi chạy thử, trả lời:

- Subagent có nhận đúng tệp không?
- Có đọc quá phạm vi không?
- Có dùng công cụ không cần thiết không?
- Kết quả có thể hành động ngay không?
- Có bằng chứng tệp/dòng không?
- Có thông tin nào bị mất khi tóm tắt không?
- Nhiệm vụ này thật sự tốt hơn khi dùng subagent chứ?

---

## Kết luận toàn khóa

Subagent là cách tách một phần việc sang context riêng, dùng system prompt và quyền công cụ riêng, rồi trả kết quả cô đọng về main thread. Giá trị chính không nằm ở việc tạo thêm persona, mà ở bốn điều:

1. cô lập công việc khám phá để bảo vệ context chính;
2. tạo góc nhìn độc lập;
3. áp dụng quy trình hoặc system prompt chuyên biệt;
4. chuẩn hóa đầu ra để main agent dùng được ngay.

Muốn subagent hiệu quả, hãy viết description cụ thể, định nghĩa output format, yêu cầu báo obstacles và chỉ cấp công cụ tối thiểu. Cuối cùng, luôn dùng quy tắc:

> Nếu công việc trung gian không quan trọng, hãy ủy quyền. Nếu công việc trung gian quan trọng, hãy giữ nó trong main thread.

## Liên kết nhanh

- [Video 1 — What are subagents?](https://www.youtube.com/watch?v=jKErNxuxPXg)
- [Video 2 — Creating a subagent](https://www.youtube.com/watch?v=arD6qEWa2Xc)
- [Video 3 — Designing effective subagents](https://www.youtube.com/watch?v=WPxWKT_OaU4)
- [Video 4 — Using subagents effectively](https://www.youtube.com/watch?v=n5LoKZ8Oa-A)
- [Trang khóa học Introduction to subagents](https://anthropic.skilljar.com/introduction-to-subagents)
