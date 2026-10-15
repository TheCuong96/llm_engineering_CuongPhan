# TÓM TẮT — Model Context Protocol: Advanced Topics

> Bản tóm tắt dễ hiểu của [MCP-Advanced-Topics-Giang-giai-tieng-Viet.md](MCP-Advanced-Topics-Giang-giai-tieng-Viet.md). Giữ đủ 15 mục, các bước walkthrough và thao tác lab; chi tiết code/giải thích xem file gốc.
> Khóa của Stephen Grider (Anthropic Academy). Dùng **Python SDK 1.x** theo lockfile của từng ZIP — đừng nâng SDK giữa chừng.

## Bức tranh 1 phút

Khóa cơ bản dừng ở "client gọi tool trên server". Khóa nâng cao thêm: **server cũng có thể chủ động nhờ client** — MCP là giao tiếp **hai chiều**.

```
Nhu cầu của server
  ├─ Cần mô hình sinh nội dung     → SAMPLING
  ├─ Cần báo đang làm đến đâu      → LOGGING / PROGRESS
  └─ Cần biết phạm vi tệp          → ROOTS
Tất cả đóng gói thành JSON-RPC, vận chuyển qua:
  ├─ Cục bộ   → STDIO
  └─ Từ xa    → Streamable HTTP (+ bài toán trạng thái / load balancer)
```

**4 vai trò:** Host (app chat CLI, điều phối) · MCP client (`ClientSession`, giữ kết nối) · MCP server (công bố + thực thi) · Mô hình (Claude, suy luận, đề xuất tool). Trong mã mẫu host + client thường chung một chương trình nên hay gọi gọn là "client".

## Chuẩn bị chung

| ZIP | `mcp` trong lockfile | Chạy bằng | Cần API key? |
|---|---:|---|---|
| `sampling.zip` | 1.9.3 | `uv run client.py` | Có |
| `notifications.zip` | 1.9.3 | `uv run client.py` | Không |
| `roots.zip` | 1.8.0 | `uv run main.py <thư-mục-root>` | Có (+ FFmpeg) |
| `transport-http.zip` | 1.9.3 | `uv run main.py` | Không |

**Các bước tải & mở lab:**
1. Mở bài walkthrough/State → vùng **Downloads** → tải ZIP.
2. Giải nén mỗi ZIP vào thư mục riêng (vd `C:\MCP-Labs\sampling`).
3. Mở thư mục trong editor; mở terminal **tại thư mục chứa `pyproject.toml`**.
4. `python --version`, `uv --version` (Python ≥3.10).
5. `uv sync --locked` (thêm `--locked` để phát hiện lockfile lệch).

---

## 1. Let's get started — Bức tranh toàn khóa

**Ví dụ:** trợ lý nghiên cứu cần (a) viết tóm tắt — server có phải tự giữ API key không? (b) báo cho người dùng đang làm gì trong lúc chờ? (c) người dùng chỉ nói tên tệp — tìm ở đâu? → lần lượt là **Sampling, Notifications, Roots**. Phần sau hỏi: nếu server ở máy khác qua HTTP, các tính năng này còn chạy không?

**Thao tác:** xem video (~1’28”) → nhận diện 2 khối trong mục lục (tính năng MCP / transport) → tự kiểm đọc được `async def`, `await`, `async with` → chuẩn bị thư mục lab.

## 2. Sampling — Server nhờ client gọi mô hình

**Ý chính:** Sampling = **server đề nghị client tạo nội dung bằng LLM** (không phải chỉnh temperature). Vd server có 5 bài viết về pin xe điện, muốn tóm tắt 300 từ → thay vì tự giữ key/tích hợp nhà cung cấp, server gửi yêu cầu qua MCP; client gọi mô hình và trả về. Trong lab, chi phí nằm ở client — đây là lựa chọn kiến trúc, MCP không tự quyết ai trả tiền.

```
Client --tools/call: summarize--> Server
Server --sampling/createMessage--> Client --gọi API--> LLM
LLM --văn bản--> Client --CreateMessageResult--> Server --kết quả tool--> Client
```

⚠️ Một lần gọi tool có thể chứa một **lần gọi ngược**. Client phải tiếp tục xử lý message trong lúc chờ — "gửi rồi đứng chờ" sẽ treo.

| Server cần | Client cần |
|---|---|
| Tool nhận dữ liệu, tạo prompt | Kết nối tới mô hình |
| Gọi `ctx.session.create_message(...)` | `sampling_callback` |
| Kiểm tra nội dung trả về | Chuyển message MCP → định dạng SDK mô hình |
| Tiếp tục xử lý / trả kết quả tool | Đóng gói `CreateMessageResult`, gắn callback vào session |

**Thao tác:** tìm `create_message` ở server → `sampling_callback` ở client (nơi gọi API thật) → theo `CreateMessageResult` về server → kiểm callback đã truyền khi tạo `ClientSession`.

Client phải **hỗ trợ capability `sampling`**; đặc tả khuyến nghị cho người dùng xem/từ chối yêu cầu. Tóm tắt "chờ mãi" → kiểm callback và transport trước khi đổ lỗi mô hình chậm.

## 3. Sampling walkthrough — 6 bước

Mở song song `server.py` (tool `summarize`) và `client.py` (khởi chạy server bằng STDIO, nhận sampling, gọi Anthropic). Trên trang, bấm từng bước 1–6 bên trái hoặc **Next →** trong walkthrough.

1. **Server khởi tạo sampling:** trong `summarize(text_to_summarize, ctx: Context)` tạo prompt →
   ```python
   result = await ctx.session.create_message(
       messages=[SamplingMessage(role="user", content=TextContent(type="text", text=prompt))],
       max_tokens=4000, system_prompt="You are a helpful research assistant.")
   ```
   `await` chờ *client* xử lý — server không tự gọi Anthropic.
2. **Client viết `sampling_callback`:** nhận context + `CreateMessageRequestParams` → gọi `chat(params.messages)` → bên trong là `anthropic_client.messages.create(...)`. Hai tầng: callback (MCP) vs `messages.create` (SDK nhà cung cấp).
3. **Chuyển định dạng:** MCP dùng `TextContent(type="text", text=…)`; Anthropic SDK dùng `{"role", "content"}` → duyệt từng message, chỉ nhận `type == "text"`, xử lý cả nhánh `user` và `assistant`.
4. **Trả `CreateMessageResult(role="assistant", model=model, content=TextContent(type="text", text=text))`** — không trả chuỗi tùy ý.
5. **Gắn callback:** `ClientSession(read, write, sampling_callback=sampling_callback)` → `await session.initialize()`. Định nghĩa mà quên truyền = vô dụng.
6. **Server dùng kết quả:** đọc `result.content` (mẫu chỉ nhận `text`, khác thì báo lỗi) → trả ngay / xử lý tiếp / làm đầu vào sampling khác. Phân biệt **kết quả sampling** vs **kết quả tool**.

**Chạy thử:**
1. Đặt key không lưu lịch sử: `$k = Read-Host "Anthropic API key" -AsSecureString` → `$env:ANTHROPIC_API_KEY = [System.Net.NetworkCredential]::new("", $k).Password`.
2. Thay `lots of text` trong `client.py` bằng đoạn ngắn (vd nhật ký triển khai tính năng A).
3. Kiểm biến `model` (khóa dùng `claude-sonnet-4-0`) — đổi nếu tài khoản không có.
4. `uv run client.py` — client tự sinh tiến trình server.
5. Thấy bản tóm tắt; server không giữ key.

⚠️ Callback gốc chỉ chuyển `params.messages` — **chưa** chuyển `systemPrompt`, `maxTokens` → server đặt system prompt không bảo đảm mô hình nhận được. README trong ZIP ghi nhầm tiêu đề "Logging and Progress Demo".

**Thực hành thêm:** đổi yêu cầu thành "đúng 3 gạch đầu dòng"; bỏ `sampling_callback=` để xem lỗi thiếu hỗ trợ rồi khôi phục.

## 4. Log and progress notifications

**Vì sao:** chờ 30 giây mà UI im lặng → không biết đang chạy hay hỏng.

| Loại | Trả lời câu hỏi | Ví dụ |
|---|---|---|
| **Log** | Đang ở công đoạn nào? | "Đã đọc xong tài liệu" |
| **Progress** | Xong bao nhiêu phần? | `6/10` |
| **Tool result** | Kết quả cuối là gì? | Đường dẫn báo cáo |

**Server gửi qua `Context`** (được inject theo kiểu, người gọi không truyền trong JSON; tên tham số `ctx` hay `context` đều được):
```python
await ctx.info("Đang thu thập dữ liệu"); await ctx.report_progress(20, 100)
await ctx.info("Đang viết báo cáo");      await ctx.report_progress(70, 100)
```

**Client quyết định hiển thị** (CLI in terminal · web đẩy sự kiện qua backend · desktop cập nhật progress bar). Server gọi `info()` không tự tạo UI.

**Thao tác:** tìm các mốc công việc → gắn log vào mốc có ý nghĩa → gắn progress khi ước lượng được khối lượng → ở client tìm **logging callback gắn vào session** và **progress callback gắn vào từng lần gọi tool**.

⚠️ `20/100` là *đơn vị công việc*, không nhất thiết là giây. Chỉ tính % khi tổng đã biết và > 0. Đừng cập nhật hàng nghìn lần/giây. Bài tập: 12 tệp → báo `(đã_xử_lý, 12)` + log tên công đoạn.

## 5. Notifications walkthrough — 4 bước

Lab dùng phép cộng `1 + 3` (chờ 2 giây giả lập việc chậm).

1. **Tool nhận Context:** `add(a: int, b: int, ctx: Context)`; client gửi `arguments={"a": 1, "b": 3}` — **không** thêm trường `ctx`.
2. **Gửi log + progress** theo thứ tự: log "Preparing to add..." → progress 20/100 → chờ 2s → log "OK, adding..." → progress 80/100 → trả `a + b`. Mức log: `info`, `warning`, `debug`, `error`.
3. **2 callback phía client:** `logging_callback(params: LoggingMessageNotificationParams)` in `params.data`; `print_progress_callback(progress, total, message)` — nên xử lý `total` None/0 (in "Đã xử lý: N" thay vì %).
4. **Gắn đúng chỗ:**
   ```python
   async with ClientSession(read, write, logging_callback=logging_callback) as session:
       await session.initialize()
       result = await session.call_tool(name="add", arguments={"a": 1, "b": 3},
                                        progress_callback=print_progress_callback)
   ```
   Logging thuộc **session**; progress thuộc **lần gọi**.

**Chạy:** giải nén → `uv sync --locked` → `uv run client.py` → thấy log + mốc 20%, 80%. ⚠️ Client gốc **không in kết quả 4** (muốn thấy thì gán `result` rồi `print(result.content)`) và không báo 100%.

**Thực hành thêm:** thêm `report_progress(100, 100)` trước khi trả; bỏ riêng progress callback để thấy log và progress là 2 luồng riêng.

## 6. Roots — Phạm vi tệp và thư mục

**Bài toán:** "Chuyển `biking.mp4` sang MOV" — tool cần đường dẫn đầy đủ, mô hình không biết tệp ở Desktop hay ổ khác. **Roots** = danh sách vị trí client công bố là phạm vi làm việc (URI `file://`, server hỏi bằng `roots/list`).

**Luồng:** người dùng yêu cầu → mô hình gọi tool lấy roots → gọi tool liệt kê thư mục để tìm video → có đường dẫn đầy đủ → gọi tool chuyển đổi.

| Roots cung cấp | Ứng dụng PHẢI tự làm |
|---|---|
| Danh sách vị trí công bố | Xác thực từng yêu cầu đọc/ghi |
| Bối cảnh tìm tệp | Chuẩn hóa, kiểm tra đường dẫn |
| Ranh giới mong muốn | Quyền OS / sandbox nếu cần |

🔑 **SDK không tự chặn truy cập ngoài roots** — tool nào bỏ kiểm tra thì server vẫn dùng quyền OS của nó.

```
Root: C:\MCP-Labs\media
✅ C:\MCP-Labs\media\biking.mp4 · C:\MCP-Labs\media\holidays\trip.mp4
❌ C:\MCP-Labs\private\notes.txt · C:\MCP-Labs\media-backup\biking.mp4  ← cùng tiền tố nhưng KHÔNG phải con
```
→ **Không** kiểm bằng `str(path).startswith(str(root))`.

**Thao tác:** viết 1 root thật cho lab → chọn 1 tệp trong + 1 tệp ngoài → vẽ chuỗi `list_roots → read_dir → convert_video` → đánh dấu nơi mỗi tool phải kiểm đường dẫn.

💡 Roots không gửi nội dung tệp, không gắn ổ đĩa client vào server từ xa. Server ở máy B thì `C:\...` của máy A không tồn tại trên B.

## 7. Roots walkthrough — 7 bước

| Tệp | Vai trò |
|---|---|
| `main.py` | Nhận roots từ dòng lệnh, tạo app chat |
| `mcp_client.py` | Session + callback cung cấp roots |
| `mcp_server.py` | Tool `list_roots`, `read_dir`, `convert_video` + hàm kiểm tra |
| `core/utils.py` | URI → đường dẫn |
| `core/video_converter.py` | Kiểm đầu vào, gọi FFmpeg |
| `.env.example` | Mẫu cấu hình API/model |

1. **Người dùng xác định roots:** `main.py` lấy `sys.argv[1:]` → `MCPClient(..., roots=root_paths)`. Vd `uv run main.py "C:\MCP-Labs\media" "D:\PracticeVideos"` = 2 root.
2. **Đường dẫn → `Root`:** `Path(raw).resolve()` → `Root(uri=FileUrl(path.as_uri()), name=path.name or "Root")`. Trên Windows dùng `as_uri()` (→ `file:///C:/MCP-Labs/media`) thay vì ghép chuỗi `file://{p}`.
3. **Cung cấp qua callback:** `async def _handle_list_roots(self, context): return ListRootsResult(roots=self._roots)` → gắn `list_roots_callback=...` khi tạo `ClientSession` (mẫu chỉ gắn khi danh sách không rỗng).
4. **Server dùng roots 2 cách:** giúp mô hình biết chỗ tìm (tool `list_roots`, hoặc đưa vào prompt) + kiểm tra trước khi đọc/chuyển đổi.
5. **Server hỏi client:** `roots_result = await ctx.session.list_roots()` → client chạy callback bước 3. ⚠️ Phân biệt **tool `list_roots`** (ví dụ tự xây cho mô hình gọi) với **request MCP `roots/list`** (server gửi).
6. **Hàm quyết định quyền** `is_path_allowed(requested_path, ctx)`: lấy roots → kiểm tồn tại → thử `relative_to(root_path)`; không root nào chứa → từ chối. Bản đơn giản cho roots là thư mục:
   ```python
   target = Path(requested).resolve(strict=True)
   for raw_root in roots:
       root = Path(raw_root).resolve(strict=True)
       if root.is_dir() and target.is_relative_to(root): return True
   return False
   ```
   Khi làm thật còn phải xét symlink/junction, root là tệp hay thư mục, vị trí đầu ra.
7. **Áp dụng vào MỌI tool liên quan:** `read_dir` và `convert_video` gọi `is_path_allowed` trước khi làm. Thêm tool đọc/đổi tên/xóa → phải áp chính sách tương ứng.

**Chạy app chat:**
1. Chuẩn bị `C:\MCP-Labs\media` + video nhỏ.
2. `Copy-Item .env.example .env` → điền key + model (không dán key vào chat).
3. `ffmpeg -version` (trên Windows cài bản phù hợp; `brew` trong README là của macOS).
4. `uv sync --locked` → `uv run main.py "C:\MCP-Labs\media"`.
5. Hỏi "Thư mục nào trong phạm vi làm việc?" → "Liệt kê tệp trong media" → "Chuyển biking.mp4 sang mov".
6. Kiểm đường dẫn đầu ra và tệp thật.
7. Thử đọc thư mục ngoài root → phải bị từ chối.

⚠️ Nhánh "nếu là tệp thì kiểm thư mục cha" trong mẫu không nên thành quy tắc chung — xác định rõ roots chỉ là thư mục hay cho cả tệp.

## 8. Survey — Khảo sát giữa khóa

3 câu hài lòng: **Start** → chọn → **Next Question** → kiểm rồi gửi. **Tự tổng kết trước khi sang HTTP:** Sampling = server nhờ client gọi mô hình · Notifications = server báo tin khi đang chạy · Roots = client công bố phạm vi, server tự thực thi kiểm tra.

## 9. JSON message types — Đọc thông điệp MCP

Hiểu JSON bên dưới SDK để đọc log, kiểm bắt tay, tìm request bị mất.

| Loại | Dấu hiệu | Ví dụ |
|---|---|---|
| **Request** | có `id` + `method` | `{"jsonrpc":"2.0","id":21,"method":"tools/call","params":{"name":"add","arguments":{"a":2,"b":7}}}` |
| **Result** | cùng `id` + `result` | `{"jsonrpc":"2.0","id":21,"result":{"content":[{"type":"text","text":"9"}]}}` |
| **Notification** | có `method`, **không** `id` | `{"jsonrpc":"2.0","method":"notifications/progress","params":{"progressToken":"job-demo","progress":3,"total":10}}` |
| **Error** | cùng `id` + `error` | `{"jsonrpc":"2.0","id":21,"error":{"code":-32602,"message":"Invalid params"}}` |

`id` để ghép phản hồi (không phải tên tool). `progressToken` gắn tiến độ với công việc (≠ `id`). Log chỉ tìm `result` sẽ bỏ sót lỗi.

| Tình huống | Ai khởi tạo | Ai phản hồi |
|---|---|---|
| Gọi tool, liệt kê prompt, đọc resource | Client | Server |
| Sampling, yêu cầu roots | **Server** | Client |
| Log, progress | Server | (không có result) |
| Báo đã initialize xong | Client | (không có result) |

**Thao tác:** mở đặc tả MCP (khác kho SDK) → tìm Call Tool, Initialize, Create Message, List Roots → đối chiếu trường với ví dụ → đánh dấu request/response/notification → vẽ mũi tên chiều. (Đặc tả viết bằng TypeScript không bắt bạn dùng TS.)

## 10. The STDIO transport

**Transport** = cách vận chuyển JSON. STDIO: client sinh server thành **tiến trình con** — client ghi vào **stdin** của server, đọc từ **stdout** của server. Chiều luồng không quyết định là request hay response — cấu trúc message mới quyết định.

| Kịch bản | Luồng |
|---|---|
| Client gọi tool | Client → stdin server |
| Server trả kết quả | Server → stdout |
| Server yêu cầu sampling/roots | Server → stdout |
| Client trả kết quả sampling/roots | Client → stdin server |

Hợp với chạy cùng máy; không có URL để máy khác truy cập.

**Bắt tay 3 message:** (1) Client → `initialize` request · (2) Server → initialize result · (3) Client → `notifications/initialized`. `session.initialize()` làm giúp bạn.

**Thực hành gõ JSON tay** (dùng `server.py` của lab Notifications, không cần API):
1. Mở terminal thư mục Notifications → `uv run server.py` (trông "đứng" = đang chờ stdin).
2. Dán **trên một dòng**: `{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"manual-client","version":"0.1.0"}}}`
3. Đọc result (phiên bản thương lượng — `2024-11-05` là bản lịch sử, không phải mới nhất).
4. `{"jsonrpc":"2.0","method":"notifications/initialized"}` (không có result).
5. `{"jsonrpc":"2.0","id":2,"method":"tools/list"}` → thấy `add`.
6. `{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"add","arguments":{"a":2,"b":7}}}` → ghép với `id: 3`, kết quả 9.
7. `Ctrl+C` dừng.

⚠️ Message STDIO phân tách bằng **dòng mới**; stdout server chỉ dành cho MCP — log debug đưa sang `stderr` (`print(..., file=sys.stderr)`) hoặc dùng logging MCP. Thêm thử `_meta.progressToken` vào `params` để thấy progress cùng token.

## 11. The StreamableHTTP transport

**Mục đích:** cho ứng dụng ở máy khác dùng server qua endpoint HTTP.

**Khó khăn:** client biết URL server nên gửi dễ; nhưng **server thường không có URL của client** — mà sampling/roots lại cần server gửi sang client.

🔑 **Phân biệt 2 tầng request:** *HTTP request* (GET/POST) ≠ *MCP request* (JSON có `method` + `id`). Một MCP request từ server có thể nằm **bên trong HTTP response** đang stream về client.

**SSE (Server-Sent Events):** giữ một HTTP response mở để server đẩy thêm sự kiện (chiều server → client). Client trả lời request của server bằng **POST mới**. Hai chiều ghép lại → MCP vẫn hai chiều trên HTTP.

**2 cờ của FastMCP — hai trục khác nhau:**
```python
mcp = FastMCP("demo", stateless_http=False, json_response=False)
```
- `stateless_http`: có giữ trạng thái/session giữa các HTTP request không.
- `json_response`: POST trả một JSON cuối thay vì luồng SSE.

**Thao tác:** liệt kê tính năng app dùng (tool, sampling, roots, log, progress, subscription) → đánh dấu cái nào cần server gửi sang client → tìm 2 cờ trong cấu hình → **kiểm riêng các luồng gửi ngược**, không chỉ "add trả đúng số".

⚠️ Đổi STDIO → HTTP không chỉ là đổi một dòng. Nhưng cũng đừng kết luận "HTTP không hỗ trợ sampling" — tùy SDK, định tuyến, stream đang mở.

## 12. StreamableHTTP in depth — Theo dõi đường đi

**Mô hình session có trạng thái:** POST initialize → result + **session ID** → POST initialized (HTTP 202) → **GET mở SSE** (kênh nhận chung) → POST `tools/call` trả bằng SSE riêng (log + kết quả) → server cần sampling/roots thì client trả bằng POST mới. Trong ví dụ: progress qua luồng GET, log + kết quả qua luồng POST. (Đặc tả: GET SSE và session ID đều **tùy chọn**; POST có thể trả JSON hoặc SSE; server đã cấp ID thì client phải gửi lại.)

**Lab `transport-http.zip`** (trong Downloads của bài State; gồm `main.py` + `index.html`):
1. **Mở `main.py`:** `FastMCP` + tool `add` (log, chờ 2s, progress) + route `/` phục vụ HTML + `mcp.run(transport="streamable-http")`. ⚠️ ZIP đặt sẵn **`True/True`** — cấu hình để thấy giới hạn.
2. **Sửa về chế độ quan sát đầy đủ:** `stateless_http=False, json_response=False`, lưu.
3. **Chạy:** `uv sync --locked` → `uv run main.py` → mở `http://localhost:8000/` (HTML gọi `http://localhost:8000/mcp/`; đổi `serverUrl` nếu cổng khác). Trang **MCP Protocol Demo**.
4. **Send Initialize Request** → xem result + header **`mcp-session-id`**, ghi lại.
5. **Send Initialized Notification** → request có header session → HTTP **202** (xác nhận tầng vận chuyển, không phải result JSON-RPC).
6. **Start GET SSE** → luồng chờ lâu là bình thường. ⚠️ Nút bị `disabled` trong ZIP → trong `updateSessionId(id)` thêm `document.getElementById("sse-start-button").disabled = !id;`, tải lại, initialize lại.
7. **Call Add Tool** (`a=5, b=3`, có `_meta.progressToken`) → log trước, kết quả **8** sau.
8. **F12 → Network:** tìm request `/mcp/` → **Headers** (method, content type, session ID) → POST streaming có `text/event-stream` → GET SSE còn mở → POST nhận result khi tool xong. Phiên bản protocol mới cần gửi header `MCP-Protocol-Version` sau initialize.

Lab HTTP **không có** sampling — muốn thử phải tự bổ sung client HTTP có callback + server có tool sampling.

## 13. State and StreamableHTTP — Trạng thái và mở rộng

**"State"** ở đây = thông tin gắn với session MCP (client nào, luồng nhận nào, request nào đang chờ) — **không** phải lịch sử chat hay DB nghiệp vụ.

**Vấn đề load balancer:**
```
                     ┌─ Instance A: giữ GET SSE của client
Client → Load balancer
                     └─ Instance B: nhận POST gọi tool
```
Tool ở B muốn hỏi roots/sampling nhưng kênh nhận của client ở A → không có đường gửi ngược nếu A, B không phối hợp. Thêm instance thôi chưa đủ.

**`stateless_http=True`** (SDK 1.9.3): tạo transport mới cho mỗi HTTP request, không giữ session ID → dễ phân phối, nhưng các tính năng phụ thuộc session/gửi ngược (sampling, progress, subscription) phải xem lại. 💡 Server tự gọi API mô hình bằng key riêng **không phải sampling** và không bị ảnh hưởng.

**`json_response=True`**: POST chờ kết quả cuối rồi trả 1 JSON, không chuyển request/notification trung gian trên luồng POST → tool đang chờ sampling có thể **không bao giờ xong**.

| `stateless_http` | `json_response` | Quan sát |
|---:|---:|---|
| False | False | Session + POST streaming; có thể thêm GET SSE |
| False | True | Giữ session; POST chỉ JSON cuối — kiểm message trung gian & GET riêng |
| True | False | Transport mới mỗi request; POST có thể stream, không có phiên bền |
| True | True | Hợp tool độc lập chỉ cần kết quả cuối |

**Thực hành so sánh 4 cấu hình:** dùng bản sao lab chương 12 → bắt đầu `False/False`, initialize, gọi Add → ghi: có session ID? Content-Type POST? log? progress? kết quả? → dừng server, đổi **chỉ** `json_response=True` → khởi động lại, tải lại trang, initialize lại (**không dùng session ID cũ**) → so sánh → `True/False` → cuối cùng `True/True` (cấu hình gốc ZIP). **Đừng điền bảng từ trí nhớ** — quan sát đúng phiên bản bạn chạy.

⚠️ Khóa nói stateless có thể gọi thẳng không cần initialize — đó là hành vi riêng SDK, **không** phải quy tắc protocol; client tương thích vẫn nên thực hiện lifecycle.

**Chọn kiến trúc:** tool độc lập → chế độ đơn giản · cần sampling/roots khi tool chạy → kiểm session + đường gửi ngược · subscription dài hạn → thiết kế duy trì/định tuyến · nhiều instance mà vẫn giữ session → định tuyến ổn định / phối hợp trạng thái.

✅ Giải thích được vì sao tool chạy tốt bằng STDIO có thể hỏng trên HTTP dù code nghiệp vụ không đổi.

## 14. Assessment — Ôn tập cuối khóa

Quiz **10 câu** (câu 1: server cần tóm tắt nhưng không muốn quản lý chi phí API). Thao tác: ôn bảng tra cứu → **Start** → chọn → **Next Question** → xem lại, tự nộp.

**10 câu tự ôn:**
1. Server nhờ client tóm tắt? → **Sampling** (tự gọi SDK = tích hợp API trực tiếp).
2. Có `sampling_callback` mà không chạy? → đã gắn vào `ClientSession`? capability? format? transport đưa request ngược tới chưa?
3. Log vs kết quả tool? → log = trạng thái giữa chừng; có log chưa chứng minh thành công.
4. Gắn callback ở đâu? → logging: session; progress: `call_tool`.
5. Root tự chặn truy cập ngoài? → **Không**, tool phải kiểm.
6. `C:\media-backup\a.mp4` thuộc root `C:\media`? → **Không**, kiểm quan hệ đường dẫn, không so tiền tố.
7. Notification cần result? → **Không** (HTTP vẫn có status tầng transport).
8. 3 message đầu? → initialize request → initialize result → initialized notification.
9. Server gửi request qua STDIO? → ghi ra stdout; client trả qua stdin server.
10. HTTP + 2 cờ `True` làm hỏng sampling? → mất session liên request / mất message trung gian trong POST.

Mẹo: vẽ 2 cột client/server, đặt từng message đúng chiều rồi xác định transport mang nó.

## 15. Wrapping up — Bước tiếp theo

Video (~48”) khuyên: tham gia cộng đồng MCP trên GitHub · theo dõi trang MCP để cập nhật đặc tả · tự xây server.

**Thao tác:** đánh dấu trang đặc tả trên modelcontextprotocol.io → tìm khu thảo luận trên GitHub MCP → chọn ý tưởng nhỏ → dùng một lab làm nền, đổi nghiệp vụ → **ghi phiên bản SDK/protocol + hành vi quan sát được**.

**Dự án đầu tiên gợi ý:** server xử lý tài liệu trong thư mục — Roots xác định thư mục · tool liệt kê/đọc trong phạm vi · Sampling nhờ client tóm tắt · log công đoạn + progress số tệp · chạy đúng bằng STDIO rồi chuyển sang Streamable HTTP và kiểm lại từng luồng.

---

## Tra cứu nhanh

| Cần làm | Dùng |
|---|---|
| Server nhờ client gọi LLM | Sampling |
| Báo đang ở bước nào / xong bao nhiêu | Logging / Progress |
| Cho server biết phạm vi tệp | Roots |
| Thực thi giới hạn truy cập | Kiểm tra trong tool + quyền OS |
| Nối tiến trình cục bộ / server từ xa | STDIO / Streamable HTTP |
| POST trả JSON cuối / không giữ session | `json_response` / `stateless_http` |

| Hàm SDK 1.x | Phía | Ý nghĩa |
|---|---|---|
| `ctx.session.create_message(...)` | Server | Đề nghị sampling |
| `sampling_callback` → `CreateMessageResult` | Client | Thực hiện sampling, gói kết quả |
| `ctx.info(...)` / `ctx.report_progress(...)` | Server | Gửi log / tiến độ |
| `logging_callback` / `progress_callback` | Client | Nhận log (session) / tiến độ (lần gọi) |
| `ctx.session.list_roots()` | Server | Hỏi roots |
| `list_roots_callback` → `ListRootsResult` | Client | Cung cấp roots |
| `session.initialize()` / `session.call_tool(...)` | Client | Bắt tay / gọi tool |

## Lỗi thường gặp

| Hiện tượng | Kiểm tra |
|---|---|
| Server STDIO không in gì | Đã có client gửi initialize? (đang chờ stdin) |
| JSON parse lỗi khi kết nối | Có `print` ra stdout server? |
| Không tìm thấy tool | Tên, decorator, `tools/list` |
| Sampling không chạy | Callback, capability, đường gửi ngược |
| System prompt vô tác dụng | Callback có chuyển `params.systemPrompt`? |
| Không thấy tiến độ | Callback, token, luồng SSE |
| Có log mà không thấy số 4 | Client gốc không in result |
| Roots không chặn | Mọi tool đã kiểm đường dẫn? |
| Không tìm thấy video | `list_roots` + `read_dir` đã chạy? |
| FFmpeg lỗi | `ffmpeg -version`, PATH |
| HTTP lỗi session | Session ID có từ server hiện tại? |
| POST bị từ chối | Content-Type, Accept |
| POST chỉ có 1 JSON | `json_response` |
| Nút GET SSE bị khóa | Sửa `updateSessionId` trong `index.html` |
| Cục bộ ổn, sau load balancer lỗi | Request và GET SSE cùng instance? |
| API đổi tên sau nâng cấp | `uv.lock`, SDK major |

**Thứ tự gỡ lỗi:** nghiệp vụ đơn giản → message đúng → callback chạy → transport mang đủ message → hạ tầng định tuyến đúng. **Mỗi lần chỉ đổi một biến.**

## Bài tập tổng hợp — Trợ lý tóm tắt thư mục

1. Tạo 3 tệp `.txt` ngắn.
2. Làm tool liệt kê + đọc trước, thử với đường dẫn đầy đủ.
3. Thêm roots; tool kiểm từng đường dẫn.
4. Thử tệp ở thư mục bên cạnh cùng tiền tố → phải bị từ chối.
5. Thêm sampling để client tóm tắt.
6. Thêm log: đọc tệp / tạo tóm tắt / ghép báo cáo.
7. Thêm progress: số tệp đã xử lý / tổng.
8. Chạy qua STDIO với client có callback.
9. Chuyển sang HTTP, kiểm lại sampling và roots.
10. So sánh cấu hình cờ, ghi tính năng nào còn chạy.

**Hoàn thành khi:** báo cáo có ý chính 3 tệp · client nhận tin trong lúc chạy · tệp ngoài root bị từ chối **ở tool** · thiếu sampling/đường truyền thì báo lỗi rõ · ghi lại phiên bản SDK/protocol và cấu hình.

## Những cách hiểu sai cần tránh

| Hiểu sai | Đúng |
|---|---|
| Roots tự chặn filesystem | Roots công bố phạm vi; app phải thực thi |
| Sampling làm server hết chi phí | Chỉ chuyển việc gọi API sang client |
| HTTP luôn có session ID | Chỉ khi server cấp |
| Streamable HTTP luôn có đúng 2 SSE | Chỉ là mô hình của ví dụ |
| Stateless = không dùng được AI | Server vẫn gọi API riêng được |
| Stateless = bỏ được initialize | Hành vi riêng SDK, không phải quy tắc |
| `json_response` = stateless | Hai khía cạnh khác nhau |
