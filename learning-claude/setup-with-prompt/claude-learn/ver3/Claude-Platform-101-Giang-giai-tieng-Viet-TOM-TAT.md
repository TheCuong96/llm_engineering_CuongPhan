# TÓM TẮT — Claude Platform 101

> Bản tóm tắt dễ hiểu của [Claude-Platform-101-Giang-giai-tieng-Viet.md](Claude-Platform-101-Giang-giai-tieng-Viet.md). Giữ đủ 13 bài, các bước demo và thực hành; code đầy đủ xem ở file gốc.
> Lưu ý: mã model trong khóa (Opus 4.7/4.8, Sonnet 4.5…) chỉ là ví dụ — luôn dùng model ID có quyền trong Console của bạn. Dữ liệu thời tiết trong khóa là **giả lập**.

## Bức tranh 1 phút

Khóa học đi từ **một lời gọi API** → **agent tự viết vòng lặp** → **công cụ, skill, MCP** → **quản lý context** → **Managed Agents do Anthropic vận hành** → **dùng Claude Code để viết tích hợp**.

Câu hỏi xuyên suốt cần luôn trả lời được: **phần nào model quyết định, phần nào code/hạ tầng thực thi, phần nào ứng dụng phải kiểm tra?**

```
Messages API  →  Agent loop  →  Tools / Tool runner  →  Thinking
      ↓
Server tools · Skills · MCP  →  Context (JIT · compaction · cache · memory)
      ↓
Managed Agents (agent + environment + session + events)  →  Claude Code
```

---

## Bài 1 — Claude Platform là gì?

**Ý chính:** Trong chat, *bạn* hỏi. Trên Platform, *chương trình của bạn* gửi yêu cầu → Claude thành một tính năng trong sản phẩm (soạn phản hồi, tóm tắt họp, phân loại tài liệu).

| Thành phần | Là gì |
|---|---|
| REST API | Địa chỉ để phần mềm gửi yêu cầu |
| SDK | Thư viện gọi API tiện (`messages.create`) |
| CLI | Công cụ terminal |
| Console | Trang quản trị: khóa, sử dụng, thử prompt, agent |

**3 tầng** (ví dụ quán ăn): **Primitives** = nguyên liệu (Messages API, tools, files, web search, code execution, MCP, skills) · **Infrastructure** = bếp (chạy agent, retry, hàng đợi, theo dõi) · **Controls** = báo cáo (dashboard, eval, giới hạn, log).

**Demo nút "Soạn phản hồi" (help desk):** mở phiếu (vd bị tính tiền 2 lần) → chọn nội dung phiếu gửi Claude → khởi tạo client SDK ở **server** → `messages.create` với model, `max_tokens`, `system`, `messages` → lấy các block text → điền nháp vào ô phản hồi → nhân viên đọc, sửa rồi mới gửi. (Gọi API không tự tạo nút — lập trình viên phải nối giao diện.)

💡 **Phân biệt:** quy tắc áp dụng mọi lần (văn phong, ≤120 từ, không hứa hoàn tiền) → `system`; dữ liệu thay đổi mỗi lần (nội dung phiếu) → `messages`.

## Bài 2 — Lời gọi API đầu tiên

**Ý chính:** body cần 3 trường: `model` · `max_tokens` (giới hạn token *sinh ra*, không phải số từ) · `messages` (vai `user`/`assistant`). `system` là tùy chọn. **API key không bao giờ nằm trong prompt** — nó xác thực client. Demo: cho Claude review hàm `add` mà lại `return a - b`.

**Các bước:**
1. **Lấy khóa:** Console → đúng workspace → API keys → tạo và sao chép. Tài khoản cần credits.
2. **Tạo thư mục:** `mkdir claude-platform-lab` → `npm init -y` → `npm install @anthropic-ai/sdk` (kiểm `node --version`).
3. **`.env.local`:** `ANTHROPIC_API_KEY=...`, `ANTHROPIC_MODEL=...`.
4. **`.gitignore`:** `.env`, `.env.*`, `node_modules/`. ⚠️ Đặt tên `.env.local` *không* tự được Git bỏ qua — phải có ignore.
5. **`first-call.mjs`:** tạo client → `messages.create({model, max_tokens:1024, system:"Bạn là người review code…", messages:[{role:"user", content:"Review: ..."}]})` → duyệt `response.content`, chỉ in block `type === "text"` → in `stop_reason`, `usage`.
6. **Chạy:** `node --env-file=.env.local first-call.mjs`. (Quên `--env-file` = lỗi "thiếu API key" phổ biến nhất.)

**Kết quả mong đợi:** Claude chỉ ra tên là cộng mà thân lại trừ, đề xuất `return a + b`.

💡 **Vì sao duyệt `response.content`?** Nó là *mảng block* (text, tool_use, thinking…), không phải chuỗi — đừng mặc định block nào cũng có `.text`.

✅ Tự kiểm: đổi yêu cầu thành "trả lời bằng 3 gạch đầu dòng" → đầu ra đổi, script vẫn đọc đúng.

## Bài 3 — Chọn model phù hợp

**Ý chính:** cân bằng **chất lượng – tốc độ – chi phí**. Mạnh hơn ≠ kinh tế hơn.

| Họ | Dùng cho | Ví dụ |
|---|---|---|
| Haiku | Nhanh, rẻ, số lượng lớn, đơn giản | Gắn nhãn phiếu, trích trường |
| Sonnet | Cân bằng, việc thường ngày | Soạn cập nhật, trợ lý trong app |
| Opus | Khó, nhiều bước, phân tích sâu | Suy luận phức tạp, coding nhiều bước |

(Phần chữ có nhắc thêm Fable ở trên Opus — không có nghĩa tài khoản nào cũng có.)

**Demo — so sánh bằng eval:**
1. Chọn 20–30 ví dụ đại diện việc thật.
2. **Viết tiêu chí chấm trước** (đúng, đúng cấu trúc, không sót, độ dài).
3. Chạy Haiku trước → đạt thì ghi kết quả + chi phí.
4. Chưa đạt → Sonnet → Opus khi cần.
5. Đọc `response.usage` (token vào/ra).
6. **Đo thời gian riêng** bằng `performance.now()` — `usage` không đo độ trễ; thứ tự in ra terminal cũng không chứng minh model nào nhanh.

**Bảng eval mẫu** (phân loại `billing/technical/other`, 25 phiếu đã gắn nhãn, gồm phiếu ngắn/dài/mơ hồ): độ đúng · đúng định dạng · độ trễ · token · chi phí. Haiku 24/25 vs Sonnet 25/25 → xem *lỗi còn lại nghiêm trọng đến đâu* (lỗi liên quan hoàn tiền nặng hơn).

**Định tuyến:** nhiều model trong một quy trình — Haiku phân loại, Sonnet soạn cập nhật, Opus làm RFP phức tạp.

✅ Trước khi nói "A tốt hơn B" phải chỉ được: tốt hơn ở tiêu chí nào, trên bộ ví dụ nào.

## Bài 4 — Vòng lặp agent

**Ý chính:** Một lời gọi = hỏi 1 câu, nhận 1 câu. Agent = quyết định cần dữ liệu gì → yêu cầu tool → đọc kết quả → quyết định tiếp.

```
User: Hôm nay ở Austin mặc gì?
  → Claude yêu cầu get_weather("Austin")
  → CODE CỦA BẠN chạy hàm
  → gửi kết quả lại → Claude khuyên trang phục
```

**Model quyết định yêu cầu gì; chương trình của bạn thực thi.** Khai báo tên tool không tự tạo kết nối API thời tiết.

**9 bước của vòng lặp:**
1. Khai báo tool: `name`, `description`, `input_schema` (JSON Schema).
2. Viết hàm thực thi (trong bài trả dữ liệu cố định).
3. Tạo `messages` với câu hỏi.
4. Gọi API kèm `messages` + `tools`.
5. Nếu `stop_reason == "tool_use"` → tìm các block `tool_use`, chạy từng cái.
6. Thêm **nguyên phản hồi assistant** vào lịch sử.
7. Thêm một tin `user` chứa các `tool_result`.
8. Gọi lại API.
9. Gặp `end_turn` → lấy text làm câu trả lời.

🔑 **Khóa nối:** `tool_result.tool_use_id` phải khớp `tool_use.id`.

**Thực hành mở rộng (Python, Đà Nẵng):** `python -m venv .venv` → `pip install anthropic python-dotenv` → `agent_loop.py`:
- `for turn in range(1, 7)` — **giới hạn lượt** tránh lặp vô hạn.
- `end_turn` → in text, `break`; lý do khác `tool_use` (vd `max_tokens`) → báo lỗi, đừng coi là thành công.
- Mỗi `tool_use` → `try` chạy hàm → `tool_result`; lỗi → `tool_result` với `"is_error": True`.
- Hết vòng `for` mà chưa xong → báo "đạt giới hạn 6 lượt".

Luồng điển hình: 1 lượt `tool_use` → 1 lần chạy hàm → 1 lượt `end_turn`.

⚠️ `end_turn` = model kết thúc lượt, **không** = nghiệp vụ đã đúng. Demo sản phẩm (agent đọc báo cáo, tra điều khoản, lưu DB, UI nhận qua server-sent events) vẫn chỉ là vòng lặp này + dữ liệu thật.

## Bài 5 — Tool use

**Ý chính:** Tool = hàm bạn cho model dùng, gồm `name` · `description` (khi nào dùng, trả gì — phải cụ thể, không chỉ "lấy dữ liệu") · `input_schema`. Bạn vẫn chịu trách nhiệm kiểm đầu vào, phân quyền, xử lý lỗi.

**Demo 2 tool thời tiết:**
1. `get_weather` (hôm nay) + 2. `get_forecast` (các ngày tới).
3. Mô tả phân biệt rõ "hiện tại" vs "dự báo".
4. Đưa cả hai vào `tools` → 5. hàm điều phối phân nhánh theo tên.
6. Hỏi hành lý cho chuyến Denver 3 ngày → 7. Claude gọi cả hai (cùng lượt hoặc khác lượt).
8. Trả từng kết quả đúng `tool_use_id`.

⚠️ Hàm gọi mạng thường async — phải `await`, không gửi Promise làm kết quả.

**Tool runner** = SDK lo phần lặp giúp bạn. Chỉnh lý: không mặc định hàm JS thường tự thành schema — dùng helper **`betaZodTool`**.

**Thực hành:** `npm install zod` → `weather-runner.mjs`: tạo 2 tool bằng `betaZodTool({name, description, inputSchema: z.object({city: z.string().min(1)}), run})` → `await client.beta.messages.toolRunner({model, max_tokens, tools:[...], messages})` → in text blocks → chạy `node --env-file=.env.local weather-runner.mjs` → kiểm câu trả lời dùng cả 2 nguồn (thêm `console.log` trong `run` để thấy).

**Khi nào tự viết vòng lặp?** Cần duyệt từng tool call, thêm bước người duyệt, log theo quy tắc riêng. Tool runner hợp khi quy trình cho phép tự chạy tool đã cấp.

## Bài 6 — Thinking

**Ý chính:** cho model thêm "công sức suy luận" với bài nhiều bước (debug, logic, so sánh phương án). Gắn nhãn email → không cần; chọn 2 điểm dừng tránh mưa + giới hạn giờ lái → cần.
- **Adaptive thinking:** model tự quyết khi nào và bao nhiêu.
- `output_config.effort`: `low` / `medium` / `high` (mặc định trong ví dụ) / `xhigh` / `max`.

**Các bước:**
1. Chọn model hỗ trợ thinking.
2. Giữ weather tool + vòng lặp.
3. Đổi yêu cầu: lên kế hoạch 2 điểm dừng từ San Francisco.
4. Thêm `thinking={"type": "adaptive"}`.
5. Đặt `effort` **bên trong** `output_config`.
6. Tăng `max_tokens` (vd 16000).
7. Chạy, quan sát block, tool call, kết quả.
8. Có `tool_use` thì tiếp tục vòng lặp.

⚠️ Phần thinking hiển thị có thể là bản tóm tắt hoặc bị bỏ — đừng hứa UI luôn có đủ suy luận. `effort` không phải số token cố định.

**Thử có đáng dùng không:** bài có đáp án rõ → chạy effort thấp → chạy effort cao, cùng đầu vào → so độ đúng, tuân thủ, thời gian, token → chỉ tăng mặc định khi có lợi.

💡 **Thinking xử lý dữ liệu tốt hơn; tool lấy dữ liệu.** Thinking không tự sinh ra thời gian lái xe thật — cần thêm tool tuyến đường.

## Bài 7 — Công cụ có sẵn

**Ý chính:** quan trọng nhất là **tool chạy ở đâu, ai thực thi**.

| Nhóm | Chạy ở | Ví dụ | Bạn làm gì |
|---|---|---|---|
| Server tools | Hạ tầng Anthropic | web search, web fetch, code execution | Khai báo, gửi, đọc kết quả |
| Client tools | Môi trường app bạn | memory, bash | Cấp nơi chạy/lưu, nối thực thi |
| Custom tools | Hệ thống của bạn | tra tồn kho, đọc phiếu | Tự định nghĩa và viết hàm |

Web search *tìm trang* · web fetch *lấy nội dung URL đã biết* · code execution *chạy mã trong sandbox*.

**Demo — 2 request riêng:**
- **A. Web search:** khai báo `{"type": "web_search_20260209", "name": "web_search"}` → hỏi về lần phát hành model gần nhất → Anthropic tự tìm → đọc block `server_tool_use` + text + trích dẫn.
- **B. Code execution:** `{"type": "code_execution_20260120", "name": "code_execution"}` → yêu cầu tính trung bình và độ lệch chuẩn dãy 1..10 → Claude viết và chạy mã trong sandbox → đọc block kết quả, stdout, câu trả lời.

Không cần tự viết `run_tool` cho server tools; nhưng vẫn xử lý `stop_reason` và lỗi. Cấu trúc block kết quả phụ thuộc phiên bản tool (vd `bash_code_execution_tool_result`).

**Đáp án để tự kiểm:** mean = **5,5** · population SD ≈ **2,8723** · sample SD ≈ **3,0277**. Prompt tốt nên nói rõ loại độ lệch chuẩn nào.

⚠️ Fact-check: kiểm nguồn từng phát biểu, không chỉ thấy link là tin. "Không phải tự xây sandbox" ≠ miễn phí. Bash client tool vẫn chạy ở máy/runtime *của bạn*.

## Bài 8 — Skills

**Ý chính:** Skill = gói hướng dẫn (`SKILL.md` + script + tài nguyên) để Claude làm một loại việc *nhất quán* (báo cáo ngày, checklist review, release notes).

| Câu hỏi | Dùng gì |
|---|---|
| Lấy task từ đâu? | Tool / MCP |
| Viết theo bố cục nào? | **Skill** |
| Tính tổng giờ công? | Script trong skill + môi trường thực thi |

Skill **nạp theo nhu cầu**: trước chỉ tên + mô tả để agent chọn; nội dung đầy đủ đọc khi cần → đừng nhồi tài liệu dài vào mô tả.

**Demo báo cáo trạng thái:**
1. Chuẩn bị thư mục skill + quy tắc.
2. Upload vào workspace (UI hoặc API).
3. Lưu `skill.id`.
4. Chuẩn bị nhật ký ngày.
5. Gọi endpoint beta, đính skill qua `container.skills` (`{"type":"custom","skill_id":…,"version":"latest"}`).
6. Bật code execution (`betas=["skills-2025-10-02","code-execution-2025-08-25"]`, tool `code_execution_20250825`).
7. Gửi nhật ký.
8. Đối chiếu kết quả với bố cục trong skill.

**Skill mẫu `daily-status-report`:** đọc nhật ký → chia **Đã xong / Đang làm / Vướng mắc** đúng thứ tự → không tự đặt tên người, hạn, kết quả → không có vướng mắc thì ghi "Chưa ghi nhận vướng mắc trong nhật ký". Dữ liệu thử: sửa lỗi đăng nhập (Đã xong) · viết onboarding (Đang làm) · chưa có tài khoản sandbox (Vướng mắc). Nếu báo cáo tự ghi "Minh sẽ cấp tài khoản ngày mai" → **đã bịa**.

**Kiểm skill có tác dụng:** đổi quy tắc bố cục → tạo phiên bản mới → gọi lại → thử nhật ký không vướng mắc → thử nhật ký thiếu hạn → khi cần ổn định, **ghim phiên bản** thay vì `latest`.

💡 Một file Markdown không cấp quyền vào Linear — lấy task cần kết nối, viết báo cáo cần skill.

## Bài 9 — MCP

**Ý chính:** Thay vì tự viết tích hợp Asana, Slack, lịch… (và sửa mỗi khi API họ đổi), **MCP** là giao thức chuẩn — như ổ cắm chuẩn. Cách nhớ nhập môn: *tools cho dữ liệu của bạn, skills cho quy trình, MCP cho dịch vụ ngoài* — nhưng MCP cũng dùng được cho hệ thống nội bộ; cần biết ai bảo trì server.

**Demo kết nối Linear:**
1. Lấy endpoint MCP + cách xác thực.
2. Lưu token ngoài mã nguồn.
3. `mcp_servers=[{"type":"url","url":"https://mcp.linear.app/mcp","name":"linear","authorization_token":…}]`.
4. `tools=[{"type":"mcp_toolset","mcp_server_name":"linear"}]` — **tên phải khớp**.
5. Thêm beta header `mcp-client-2025-11-20`, gọi `client.beta.messages.create`.
6. Hỏi danh sách tool / yêu cầu chỉ đọc.
7. Thấy tool được phát hiện tự động — không cần tự viết schema.

Token phải là loại MCP endpoint chấp nhận, không phải API key bất kỳ.

**Chỉ bật tool cần thiết** (ví dụ Slack): `"default_config": {"enabled": False}` rồi bật `search_messages`, `list_channels` trong `configs`. Vẫn cần mục `mcp_servers` tên `slack`.

**Thực hành:** kết nối server được phép → xem tool, tách đọc/ghi → chỉ bật tool đọc → hỏi cụ thể ("task giao cho tôi tuần này") → kiểm đúng người/workspace/thời gian → so với tự viết custom tool.

⚠️ MCP chuẩn hóa kết nối nhưng vẫn phải quản lý quyền, token hết hạn, thay đổi tương thích.

## Bài 10 — Quản lý context

**Ý chính:** Context = mọi thứ model thấy trong một lượt (system, lịch sử, định nghĩa tool, kết quả tool, tài liệu). Như **bàn làm việc**: bàn to vẫn chật nếu đổ cả kho hồ sơ lên. (1 triệu token chỉ là ví dụ — xem giới hạn model cụ thể.)

| Cách | Giải quyết | Hình dung |
|---|---|---|
| **Just-in-time** | Nạp thừa tài liệu | Cần điều khoản nào lấy điều khoản đó |
| **Compaction** | Lịch sử quá dài | Tóm tắt phần cũ |
| **Prompt caching** | Phần cố định xử lý lặp | Tái dùng prefix ổn định |
| **Memory** | Cần giữ qua các phiên | Sổ ghi chép bên ngoài |

**1. Just-in-time** (thiết kế, không phải công tắc API): gửi nhiệm vụ + phần báo cáo → cấp tool tra điều khoản → agent gọi khi cần → trả đúng đoạn + nguồn → chỉ bổ sung khi cần. Với kho lớn: trả danh sách ngắn trước, rồi mở đúng tài liệu.

**2. Compaction:** bật chiến lược tương thích → tiếp tục quản lý lịch sử → đến ngưỡng API sinh block tóm tắt → **giữ block đó** khi nối lịch sử → kiểm bản tóm tắt còn mục tiêu, quyết định, dữ liệu, việc dở. Cú pháp chuẩn: `client.beta.messages.create(betas=["compact-2026-01-12"], …, context_management={"edits":[{"type":"compact_20260112"}]})`. Tóm tắt có thể mất chi tiết.

**3. Prompt caching** (vd system 4.000 token × 100 lần/giờ): xác định phần chung → đặt phần ổn định **trước** phần thay đổi → đánh dấu điểm cache → gửi nhiều request cùng prefix → xem thông tin cache trong usage. Caching *không* lưu câu trả lời và *không* làm tài liệu chiếm ít context hơn — nó giảm xử lý lặp và chi phí.

**4. Memory:** bạn cấp backend lưu (file/DB) → Claude đọc/ghi qua memory tool → đầu việc lấy ghi chú liên quan → cuối việc lưu kết quả. Ghi chú tốt phải **có ngày và phạm vi** ("dữ liệu tuần trước lưu 08/10; 2 nhà cung cấp thiếu bảng giá").

**Phối hợp:** agent giá cả cache quy tắc, chỉ tải trang giá cần, compact lịch sử, lưu chênh lệch + ngày vào memory.

**Bài tập:** 1.000 tài liệu, câu hỏi chỉ liên quan 2 → tool tìm kiếm trả mã + đoạn trích trước, chỉ tải toàn văn tài liệu chọn; xác định cái gì vào memory, cái gì chỉ trong phiên.

✅ Cache giảm xử lý lặp · compaction giảm lịch sử chiếm chỗ · memory giữ qua phiên — **không dùng thay nhau**.

## Bài 11 — Managed Agents là gì?

**Ý chính:** Bài 4: *code của bạn* giữ lịch sử và chạy vòng lặp. Managed Agents: bạn định nghĩa agent + môi trường + phiên; **hạ tầng Anthropic chạy vòng lặp**. Như giao hồ sơ cho nhân viên rồi nhận báo cáo tiến độ. "Managed" không có nghĩa hệ thống tự hiểu nghiệp vụ — bạn vẫn định nghĩa việc, dữ liệu, tiêu chí, nơi nhận kết quả.

**Demo 1 — Kéo thẻ Kanban:** kéo thẻ "tối ưu hiệu năng web" sang Đang làm → backend tạo session → environment có Lighthouse + Puppeteer → repo được đưa vào → agent chạy audit → sửa ảnh/CSS/cách nạp script → event stream đẩy tiến độ về bảng realtime → **grader có context riêng** chấm theo rubric (Lighthouse >90, không tài nguyên chặn render, ảnh lazy-load) → agent sửa tiếp khi chưa đạt → đạt 96. 💡 Bài học: biến "làm nhanh hơn" thành **tiêu chí đo được**. Kéo thẻ là trigger do app demo lập trình.

**Demo 2 — Nghiên cứu giá hằng tuần có memory:** khởi chạy → đọc kết quả tuần trước từ memory → tìm trang giá → phân tích bằng Python trong sandbox → skill tạo bảng tính + tóm tắt điều hành → qua MCP chia sẻ Slack, tạo task Asana → lưu thay đổi vào memory. Nhờ memory mới nói được "giá giảm so với tuần trước". (Con số 15% chỉ là minh họa.)

**Demo 3 — Nhiều agent xử lý sự cố:** cảnh báo giám sát → backend đưa vào session → agent điều phối chia việc cho 3 chuyên gia (chẩn đoán, log, truyền thông) → mỗi chuyên gia có context riêng, dùng chung file system → điều phối tổng hợp → tra memory sự cố cũ → **chính sách quyền bắt duyệt** bản nháp → người duyệt → mới gửi. Nhiều agent chỉ có ích khi việc độc lập; không phải càng nhiều càng tốt.

| Thành phần | Ý nghĩa |
|---|---|
| Agent | Model, vai trò, công cụ (**ai làm, dùng gì**) |
| Environment | Môi trường chạy, gói, mạng (**làm ở đâu**) |
| Session | Một phiên công việc (**lần làm nào**) |
| Tools & MCP | Thao tác & kết nối dữ liệu |
| Memory | Ghi chú qua phiên |
| Outcomes | Tiêu chí, cơ chế đánh giá |
| Multi-agent | Phân việc, phối hợp |

**Thực hành thiết kế** ("chuẩn hóa 50 file báo cáo"): ghi thư mục vào/ra, quy tắc tên file, xử lý file lạ, báo cáo cuối gồm gì → quyết định 1 hay nhiều agent.

## Bài 12 — Tạo managed agent đầu tiên

**Nhiệm vụ demo:** tạo file trong thư mục tạm, đếm dòng, báo lại. Điểm mới: **gửi và đọc events** thay vì tự giữ vòng lặp.

```
Tạo Agent → Tạo Environment → Tạo Session → MỞ STREAM → gửi user.message → theo dõi events
```

**Các bước:**
1. **Agent:** `client.beta.agents.create(name, model, system, tools=[{"type":"agent_toolset_20260401", …}])` (toolset file/bash/web). Giữ ID — dùng lại cho nhiều session.
2. **Environment:** `client.beta.environments.create(config={"type":"cloud","networking":{…}})`. Video dùng `unrestricted`; bài đếm dòng chỉ cần `limited`. File nằm trong môi trường này, **không** tự về ổ đĩa của bạn.
3. **Session:** gắn agent (`{"type":"agent","id":…,"version":…}`) + `environment_id` + tiêu đề. Lưu session ID.
4. **Mở stream TRƯỚC rồi mới gửi** `user.message` — stream chỉ nhận event phát sinh sau khi mở.
5. **Đọc events:**

| Event | Dùng để |
|---|---|
| `agent.message` | In văn bản Claude trả |
| `agent.tool_use` | Thấy tool agent chọn |
| `session.error` | Báo lỗi |
| `session.status_idle` | Session dừng, chờ tiếp |

⚠️ `idle` **không** luôn = thành công — đọc `stop_reason` (xong lượt / chờ duyệt / hết ngân sách). Kết nối lại thì dùng lịch sử event bù phần lỡ.

**Chạy:** `pip install --upgrade anthropic` → `managed_lines.py` → yêu cầu tạo `/tmp/course-lines.txt` gồm `alpha, beta, gamma` và đếm dòng.

**Kiểm hoàn thành:** in đủ 3 ID → agent thực sự dùng tool tạo/đọc file → kết quả nêu đúng đường dẫn + **3 dòng** → agent có *kiểm chứng* chứ không chỉ nhắc lại yêu cầu → đọc lý do dừng → muốn tải file về phải lấy artifact. Mỗi lần chạy script tạo đối tượng mới → về sau tách bước tạo agent/environment khỏi tạo session.

| Tình huống | Chọn |
|---|---|
| Tóm tắt 1 đoạn | Messages API thường |
| Vài tool, muốn chặn từng hành động | Vòng lặp tự viết |
| Giảm code lặp trong app | Tool runner |
| Việc dài, thao tác file, cần session quản lý | Managed Agents |

💡 Mất kết nối trình xem ≠ agent dừng.

## Bài 13 — Xây dựng bằng Claude Code

**Ý chính:** Claude Code = agent trong môi trường lập trình (đọc/sửa file, chạy lệnh, xem lỗi, sửa tiếp). Demo: file TypeScript có 2 hàm khung `getWeather` và `run`. Bạn vẫn phải hiểu tool/runner để **đánh giá code sinh ra**.

**Các bước demo:**
1. Mở terminal ở thư mục dự án → 2. chạy `claude`.
3. Dùng skill **`/claude-api`** (tích hợp sẵn; nếu cần cài: `/plugin marketplace add anthropics/skills` → `/plugin install claude-api@anthropic-agent-skills`).
4. Gửi prompt nêu rõ **file**, **pattern**, **kết quả cuối**.
5. Claude Code đọc file, hoàn thiện 2 hàm → 6. tạo tool bằng Zod, nối runner → 7. thêm điểm khởi chạy, chạy → 8. lỗi thì tự đọc và sửa → 9. bạn xem đầu ra + **đọc diff**.

**Thực hành:** `npm install zod` + `npm install --save-dev typescript tsx @types/node` → tạo `weather.ts` với 2 hàm `throw new Error("Chưa…")` → prompt cho Claude Code: dùng `betaZodTool` + Zod tạo `get_weather` trả JSON giả lập (`mock: true`); `run` đọc `ANTHROPIC_MODEL`, dùng `client.beta.messages.toolRunner` hỏi nên mặc gì ở Đà Nẵng, in text blocks, xử lý lỗi; chạy bằng `node --env-file=.env.local --import tsx weather.ts`; báo file đã sửa, lệnh, kết quả.

**Đọc diff** (`git diff -- weather.ts`) theo luồng dữ liệu: `city` kiểm ở schema nào? → hàm nào tạo dữ liệu giả? → tool gọi đúng hàm? → model lấy từ biến nào? → runner nhận đúng tool + câu hỏi? → có in text và báo lỗi? Nếu model nói "đã tra thời tiết trực tiếp" mà code chỉ có mock → sửa mô tả tool/prompt.

✅ Giải thích được đường đi: câu hỏi → tool → hàm → kết quả → câu trả lời.

---

## Quiz và câu tự ôn

Quiz chính thức có **8 câu**. 13 câu tự ôn (đáp án):

1. Nút "Tóm tắt họp" cần gì? → lấy transcript, gọi API, đọc phản hồi, hiển thị.
2. Trường cơ bản? → `model`, `max_tokens`, `messages` (key ở client, không ở message).
3. Phân loại hàng chục nghìn phiếu? → eval, thử model rẻ trước, tăng khi chưa đạt.
4. Ai chạy custom tool? → code/runtime của bạn.
5. Nối kết quả với tool call? → `tool_use_id` khớp `tool_use.id`.
6. Khi nào tăng effort? → bài nhiều bước *và* eval cho thấy có lợi.
7. Web search khác custom tool? → Anthropic chạy server-side vs hàm bạn nối.
8. Báo cáo luôn 3 mục? → Skill.
9. Chỉ cần đọc từ MCP nhiều tool? → tắt mặc định, bật đúng tool đọc.
10. Giữ quyết định tuần trước? → Memory.
11. Agent vs session? → định nghĩa tái dùng vs một phiên làm việc.
12. Thứ tự stream? → mở stream trước, gửi `user.message` sau.
13. Prompt cho Claude Code? → file, pattern, kết quả mong đợi.

## Bài thực hành tổng hợp — Trợ lý báo cáo dự án

1. **Một lời gọi:** nhật ký giả 10 hoạt động → Messages API chia 3 mục → lưu → so sánh có sót/bịa không. *Xong khi* mọi ý có căn cứ.
2. **Chọn model bằng eval:** 20–30 nhật ký (có ngày không vướng mắc) → chấm đúng, đủ, bố cục, độ trễ, token → rẻ trước → ghi lý do chọn.
3. **Nối dữ liệu:** custom tool `list_project_tasks` (giả lập trước) → vòng lặp/tool runner → đóng gói bố cục thành skill → thử MCP nếu có → giới hạn tool.
4. **Kiểm soát context:** cache phần cố định → chỉ lấy task trong phạm vi → memory có ngày → compaction khi phiên dài.
5. **Managed Agents:** nhiều file, chạy lâu, cần artifact → session; *xong khi* có artifact đúng, có bằng chứng kiểm, xử lý đúng lý do dừng.

## Bảng xử lý lỗi nhanh

| Hiện tượng | Kiểm tra đầu tiên |
|---|---|
| Thiếu API key | Đã nạp `--env-file`? Tên `ANTHROPIC_API_KEY` đúng? |
| Git vẫn nhận `.env.local` | Có ignore chưa? File đã bị theo dõi từ trước? |
| Model không tồn tại | Dùng đúng ID có quyền trong tài khoản |
| Đầu ra bị cắt | `stop_reason` và `max_tokens` |
| `response.content.text` lỗi | `content` là mảng — duyệt block `text` |
| Agent nói chưa có dữ liệu | Tool đã chạy và gửi `tool_result` chưa? |
| Thiếu kết quả tool | Mỗi ID đều có `tool_result`? |
| Chọn nhầm tool | Mô tả đã phân biệt rõ chưa? |
| Runner không nhận hàm | Dùng helper đúng phiên bản SDK |
| Lỗi 400 thinking/beta | Model, tên trường, header beta |
| MCP lỗi xác thực / không thấy tool | Endpoint, loại token, hạn, phạm vi; tên server, cấu hình bật/tắt |
| Không thấy file agent tạo | Nằm trong sandbox — lấy artifact |
| Mất event đầu | Mở stream trước khi gửi? |
| Idle mà chưa có kết quả | Đọc lý do dừng |
| Báo cáo dùng dữ liệu cũ | Memory phải có ngày + bước cập nhật |
