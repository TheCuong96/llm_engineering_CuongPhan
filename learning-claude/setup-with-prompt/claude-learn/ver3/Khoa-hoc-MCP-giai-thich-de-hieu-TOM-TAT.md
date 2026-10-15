# TÓM TẮT — Introduction to Model Context Protocol (MCP)

> Bản tóm tắt dễ hiểu của [Khoa-hoc-MCP-giai-thich-de-hieu.md](Khoa-hoc-MCP-giai-thich-de-hieu.md). Giữ đủ 14 mục, các bước thao tác và đoạn code cốt lõi; code demo hai file đầy đủ xem ở file gốc.
> Khóa học của Stephen Grider (Anthropic Academy). Dùng **Python SDK 1.x** (`FastMCP`, `ClientSession`, `stdio_client`), khóa ở `mcp==1.26.0` — đừng trộn với ví dụ SDK v2 (`MCPServer`, `Client`).

## Bức tranh 1 phút

Bạn hỏi chatbot: "Trong `report.pdf` có gì? Sửa 20m thành 25m." Claude **không tự mở được tài liệu** — ứng dụng phải cung cấp cách lấy dữ liệu và thao tác. **MCP** chuẩn hóa phần kết nối đó.

| Thành phần | Ví von văn phòng | Trách nhiệm |
|---|---|---|
| Người dùng | Người giao việc | Hỏi, chọn tài liệu, chọn quy trình |
| **Host** (ứng dụng AI) | Văn phòng điều phối | Quản lý hội thoại, gọi Claude, xử lý tool use |
| **MCP client** | Nhân viên liên lạc | Kết nối, gửi yêu cầu đúng giao thức |
| **MCP server** | Quầy dịch vụ chuyên môn | Công bố tools, resources, prompts |
| Claude | Người suy luận | Hiểu yêu cầu, đề xuất gọi tool, tổng hợp |
| Dịch vụ/kho dữ liệu | Nơi giữ hồ sơ thật | GitHub, DB… |

⚠️ Khóa học đôi khi gọi host là "your server" — đừng nhầm với **MCP server**.

**3 primitive — ai chủ động?**

| Primitive | Ai chủ động | Trong dự án | Ví von |
|---|---|---|---|
| **Tool** | Mô hình đề xuất | Đọc/sửa tài liệu | "Nhờ người xử lý đi lấy hồ sơ khi thấy cần" |
| **Resource** | Mã ứng dụng | Danh sách ID + nội dung cho `@` | "Ứng dụng đặt sẵn hồ sơ bạn chọn lên bàn" |
| **Prompt** | Người dùng (qua UI) | `/format plan.md` | "Phiếu giao việc có sẵn" |

**Dự án xuyên suốt:** chatbot terminal quản lý 6 tài liệu giả. `report.pdf` chỉ là **khóa dictionary chứa chuỗi** — không có PDF thật; dữ liệu nằm trong RAM, khởi động lại là mất thay đổi.

---

## 1. Welcome — Chuẩn bị học

**Cần biết:** Python cơ bản (hàm, dict, import, kiểu, ngoại lệ). `async def` = hàm có thể nhường khi chờ I/O; `await` = chờ kết quả bất đồng bộ.

**Các bước:**
1. Mở terminal (PowerShell trong VS Code được).
2. `python --version`.
3. `uv --version`; chưa có thì cài theo docs uv (hoặc `pip install uv`).
4. Tạo thư mục riêng để giải nén bài tập; mở đúng thư mục chứa `main.py`.
5. Chưa viết server — chờ bài 4.

## 2. Introducing MCP — MCP giải quyết việc gì?

**Vấn đề:** chatbot muốn trả lời "PR nào đang mở trong repo GitHub của tôi?" → phải tự viết schema tool, hàm gọi GitHub API, xử lý phản hồi, bảo trì khi API đổi… nhân lên cho mỗi dịch vụ.

**Giải pháp:** **MCP server** cho GitHub đóng gói phần đặc thù GitHub, công bố qua giao diện chung. Ứng dụng kết nối → khám phá tool → gọi khi cần. Phần điều phối hội thoại và quyền vẫn thuộc ứng dụng.

**MCP vs tool use:** *tool use* = cơ chế mô hình yêu cầu dùng tool (tên + đối số). *MCP* = cách ứng dụng khám phá và thực thi khả năng do server công bố. Bổ sung cho nhau:

```
Mô hình đề xuất list_open_pull_requests(repo="demo")
→ Ứng dụng tìm server có tool đó → MCP client gửi yêu cầu
→ MCP server gọi GitHub API → kết quả về ứng dụng → về mô hình → trả lời người dùng
```

**Thao tác:** vẽ ô *ứng dụng chat → MCP client → MCP server GitHub → GitHub API*; ghi cạnh server "schema + hàm đặc thù GitHub", cạnh ứng dụng "hội thoại + gọi mô hình + xử lý tool use"; thay GitHub bằng hệ thống tài liệu nội bộ và kiểm tra trách nhiệm còn hợp lý.

⚠️ MCP không phải mô hình AI · không tự cấp quyền · ai cũng viết được server · không phải ứng dụng nào cũng hỗ trợ mọi tính năng. Dùng MCP **vẫn cần** code gửi câu hỏi tới Claude và chuyển kết quả tool về Claude.

## 3. MCP clients — Đường đi của một yêu cầu

**Client** = đầu mối ứng dụng dùng để nói chuyện với server. Trong dự án, client **khởi chạy server thành tiến trình con** và trao đổi qua **stdio** (không cần HTTP server). SDK chính thức hỗ trợ stdio và Streamable HTTP.

| Mục đích | Thông điệp | SDK 1.x |
|---|---|---|
| Server có tool gì? | `ListToolsRequest/Result` (`tools/list`) | `session.list_tools()` |
| Chạy tool | `CallToolRequest/Result` (`tools/call`) | `session.call_tool(...)` |

**12 bước của "Tôi có repository nào?":** người dùng hỏi → ứng dụng xin client danh sách tool → client hỏi server → server trả tên/mô tả/schema → ứng dụng gửi câu hỏi + định nghĩa tool cho Claude → Claude trả yêu cầu dùng tool → ứng dụng đọc tên + đối số → gọi client chạy tool → server chạy logic (gọi GitHub) → kết quả về ứng dụng → ứng dụng gửi kết quả cho Claude → Claude trả lời, ứng dụng hiển thị.

**Tự kiểm:** "Đọc `report.pdf`" → tool `read_doc_contents`, đối số `{"doc_id": "report.pdf"}` → chỉ ra bước nào của mô hình, bước nào của chương trình. 💡 **Mô hình đề xuất; ứng dụng + server thực hiện.**

## 4. Project setup — Thiết lập dự án

**Bước 1 — Tải mã:** mục **Downloads** có `cli_project.zip` (khởi đầu, để học) và `cli_project_COMPLETE.zip` (tham khảo, để riêng thư mục khác). `cd` vào thư mục có `README.md`, `pyproject.toml`, `main.py`.

**Bước 2 — Cấu trúc:**
```
.env · main.py (khởi động) · mcp_server.py (docs, tools, resources, prompts)
mcp_client.py (kết nối + hàm bọc session) · pyproject.toml · uv.lock
core/ chat.py (vòng lặp + tool use) · tools.py (chuyển schema, định tuyến)
      cli_chat.py (@tài_liệu, /lệnh) · cli.py (giao diện, autocomplete) · claude.py (gọi API)
```

**Bước 3 — `.env`:**
```dotenv
ANTHROPIC_API_KEY="..."
CLAUDE_MODEL="model_id_hợp_lệ"   # main.py kiểm tra cả biến này
USE_UV="1"                       # server con chạy bằng `uv run mcp_server.py`
```

**Bước 4 — Cài môi trường** (chọn 1 cách):
- Có lockfile (khuyên dùng): `uv sync --locked` → `uv run main.py`.
- Theo README: `uv venv` → `.\.venv\Scripts\Activate.ps1` → `uv pip install -e .` → `uv run main.py`.
- Không dùng uv: `python -m venv .venv` → activate → `pip install anthropic python-dotenv prompt-toolkit "mcp[cli]==1.26.0"` → `python main.py`, đặt `USE_UV="0"`.

Python: README ghi 3.9+ nhưng `pyproject.toml` yêu cầu **≥3.10** — theo file dự án.

**Bước 5 — Chạy thử:** `uv run main.py` → gõ `What's one plus one?` → mong đợi "2" → cảnh báo refresh resources/prompts ở bản khởi đầu là do còn TODO (khác lỗi key/model) → `Ctrl+C` thoát.

## 5. Defining tools — Tạo công cụ

**Ý chính:** viết hàm Python + `@mcp.tool(...)` → SDK dùng chữ ký, type hints, `Field(description=…)` để **tự sinh schema**.

**Các bước:**
1. Đầu `mcp_server.py` (chỉ một biến `mcp`):
   ```python
   from mcp.server.fastmcp import FastMCP
   from pydantic import Field
   mcp = FastMCP("DocumentMCP", log_level="ERROR")
   ```
2. Hiểu `docs` = dict `ID → nội dung` (giữ nguyên 6 tài liệu gốc).
3. **Tool đọc** (đặt trước `if __name__ == "__main__":`):
   ```python
   @mcp.tool(name="read_doc_contents", description="Đọc nội dung tài liệu theo ID.")
   def read_document(doc_id: str = Field(description="ID tài liệu, ví dụ report.pdf")) -> str:
       if doc_id not in docs:
           raise ValueError(f"Không có tài liệu: {doc_id}")
       return docs[doc_id]
   ```
   `read_document` = tên hàm nội bộ; `read_doc_contents` = **tên tool công bố**.
4. **Tool sửa** `edit_document(doc_id, old_str, new_str)`: kiểm tồn tại → `docs[doc_id] = docs[doc_id].replace(old_str, new_str)`. Đầu vào ví dụ: `{"doc_id":"report.pdf","old_str":"20m","new_str":"25m"}`.
5. Cuối file: `if __name__ == "__main__": mcp.run(transport="stdio")`. Chạy trực tiếp thấy terminal "đứng" = server đang chờ thông điệp, **không phải lỗi**.

⚠️ `str.replace()` thay **mọi** chỗ khớp; không khớp thì im lặng không báo lỗi; hàm trả `None` → **phải đọc lại để kiểm chứng**.

## 6. The server inspector — Kiểm tra server

**Inspector** = client cho phát triển: xem server công bố gì, điền tham số, gọi trực tiếp — **không cần Claude**.

1. **Mở:** `uv run mcp dev mcp_server.py` → mở **đúng URL terminal in ra** (kể cả token; thường `http://127.0.0.1:6274`). Có thể cần Node/npm.
2. **Kết nối:** giữ terminal chạy → mở URL → kiểm cấu hình → **Connect** → thấy **Connected**.
3. **Thử đọc:** tab **Tools** → **List Tools** → `read_doc_contents` → `doc_id=report.pdf` → **Run Tool** → thấy `20m`.
4. **Sửa rồi đọc lại:** `edit_document` với `20m → 25m` → chạy → đọc lại → thấy `25m` (xác nhận hai lời gọi dùng chung trạng thái).
5. **Thử lỗi:** đọc `khong-ton-tai.md` → thấy lỗi; sửa chuỗi không tồn tại rồi đọc lại → hiểu vì sao phải kiểm kết quả.

**Nhớ:** server khởi động lại → dict reset · server của Inspector và của `main.py` là **2 tiến trình khác nhau**, không chia sẻ RAM · đừng `print` vào stdout của server stdio — dùng logging/stderr.

## 7. Survey — Khảo sát

3 câu phản hồi khóa học, không có nội dung kỹ thuật. Gợi ý tự ghi: khái niệm đã rõ, thao tác còn mắc, ví dụ muốn áp dụng.

## 8. Implementing a client — Viết client

**2 thành phần:** `MCPClient` (lớp bọc dự án tự viết — "bảng điều khiển") + `ClientSession` (của SDK — "bộ phận giữ đường truyền").

**Bước 1 — Đọc `connect()` có sẵn:** tạo `StdioServerParameters(command, args, env)` → mở `stdio_client(...)` khởi chạy server → nhận 2 luồng đọc/ghi → tạo `ClientSession` → `await session.initialize()`. `AsyncExitStack` đóng tài nguyên đúng thứ tự; `async with MCPClient(...)` tự connect/cleanup.

**Bước 2 — `list_tools`:**
```python
async def list_tools(self) -> list[types.Tool]:
    result = await self.session().list_tools()
    return result.tools          # kết quả là object có .tools, không phải list trần
```

**Bước 3 — `call_tool`:**
```python
async def call_tool(self, tool_name: str, tool_input: dict) -> types.CallToolResult:
    return await self.session().call_tool(tool_name, tool_input)   # truyền dict, không phải chuỗi JSON
```

**Bước 4 — Kiểm trực tiếp:** `uv run mcp_client.py`. ⚠️ Bản COMPLETE chỉ có `pass` nên **không in gì** → thay bằng vòng in `tool.name, tool.inputSchema` + `call_tool("read_doc_contents", {"doc_id": "report.pdf"})`. Mong đợi: 2 tool + nội dung tài liệu (không cần Claude).

**Bước 5 — Toàn luồng chat:** `uv run main.py` → `What is the contents of the report.pdf document?` → app gửi định nghĩa tool cho Claude → Claude đề xuất `read_doc_contents` → app chạy qua client, trả kết quả → nhận câu trả lời dựa trên dữ liệu thật.

**Phần điều phối có sẵn:** `core/tools.py` chuyển `name → name`, `description → description`, `inputSchema → input_schema`. `core/chat.py` lặp khi `stop_reason == "tool_use"`, gắn kết quả với **ID lời gọi** rồi gửi lại — không gửi thì Claude không có dữ liệu.

## 9. Defining resources — Cung cấp dữ liệu

**Vì sao có tool đọc rồi còn cần resource?** Phân biệt theo **ai chủ động**:
- "Trong báo cáo có gì?" → mô hình *có thể chọn* tool đọc.
- Gõ `@report.pdf` → ứng dụng *đã biết* tài liệu, tự lấy nội dung đính kèm → **resource**.

Tool chỉ đọc vẫn hợp lệ — tiêu chí là cách dùng và bên điều khiển, không phải có ghi hay không.

Chức năng `@` cần 2 dữ liệu: **danh sách ID** (gợi ý) + **nội dung tài liệu chọn**. Luồng: `ReadResourceRequest/Result` theo URI, trả nội dung + MIME type.

**Bước 1 — Resource URI cố định:**
```python
@mcp.resource("docs://documents", mime_type="application/json")
def list_docs() -> list[str]:
    return list(docs.keys())
```
`docs://…` là định danh thỏa thuận, không phải địa chỉ web.

**Bước 2 — Resource template (có tham số):**
```python
@mcp.resource("docs://documents/{doc_id}", mime_type="text/plain")
def fetch_doc(doc_id: str) -> str:
    if doc_id not in docs:
        raise ValueError(f"Không có tài liệu: {doc_id}")
    return docs[doc_id]
```
Đọc `docs://documents/plan.md` → SDK đưa `plan.md` vào `{doc_id}`.

**Bước 3 — MIME đúng dữ liệu thật:** JSON → `application/json`; văn bản → `text/plain`. **Không** dùng `application/pdf` chỉ vì ID có đuôi `.pdf` (thực chất là chuỗi).

**Bước 4 — Thử trong Inspector:** lưu → `uv run mcp dev mcp_server.py` → kết nối → **Resources** → đọc `docs://documents` (6 ID) → **Resource Templates** → `docs://documents/{doc_id}` với `report.pdf` → kiểm nội dung, URI, MIME.

💡 *Liệt kê metadata resource* (thao tác giao thức) ≠ *đọc resource `docs://documents` để lấy danh sách ID nghiệp vụ* (thiết kế của dự án).

## 10. Accessing resources — Đọc và đính kèm dữ liệu

**Bước 1 — Import** (chỉ thêm cái thiếu) trong `mcp_client.py`: `json`, `typing.Any`, `pydantic.AnyUrl`, `mcp.types`.

**Bước 2 — `read_resource`:**
```python
async def read_resource(self, uri: str) -> Any:
    result = await self.session().read_resource(AnyUrl(uri))
    if not result.contents:
        raise ValueError("Resource không trả nội dung")
    resource = result.contents[0]
    if not isinstance(resource, types.TextResourceContents):
        raise TypeError("Ví dụ này chỉ xử lý resource dạng văn bản")
    if resource.mimeType == "application/json":
        return json.loads(resource.text)     # '["report.pdf",...]' → list Python
    return resource.text
```
(Bản có thêm kiểm lỗi so với bài gốc; phản hồi MCP thực tế có thể có nhiều phần.)

**Bước 3 — Kiểm trực tiếp:** trong khối `async with ... as _client` in `read_resource("docs://documents")` và `read_resource("docs://documents/report.pdf")` → `uv run mcp_client.py`.

**Bước 4 — Phần UI có sẵn (`core/cli_chat.py`):** `list_docs_ids()` đọc danh sách · `get_doc_content(doc_id)` đọc nội dung · `_extract_resources(query)` tìm từ bắt đầu bằng `@` · `_process_query(...)` đưa câu hỏi + tài liệu vào context. Ký tự `@` là **quy ước của app mẫu**, không phải của MCP.

**Bước 5 — Thử `@`:** `uv run main.py` → gõ `Tell me about @` → chọn gợi ý bằng mũi tên + Tab (hoặc gõ thẳng `Tell me about @report.pdf`) → Enter → app đọc tài liệu *trước*, gói vào `<context><document id="report.pdf">…</document></context>` → Claude trả lời ngay, không cần lượt tool.

⚠️ Parser dùng `query.split()` → `@report.pdf?` không khớp — tách bằng khoảng trắng, không dính dấu câu. Đính kèm vẫn tốn context — tài liệu lớn cần cắt đoạn.

## 11. Defining prompts — Tạo mẫu hướng dẫn

**Prompt MCP** = mẫu (tên, mô tả, tham số) tạo ra các message gửi cho mô hình — giao việc nhất quán, tái sử dụng (chất lượng vẫn phải kiểm thử).

**Luồng:** `/format plan.md` → app lấy message đã điền tham số từ server → gửi Claude → Claude dùng tool đọc/sửa. 🔑 **`get_prompt` chỉ lấy message — không gọi mô hình, không sửa tài liệu.**

**Bước 1 — Import:** `from mcp.server.fastmcp.prompts import base`, `from pydantic import Field`.

**Bước 2 — Định nghĩa:**
```python
@mcp.prompt(name="format", description="Định dạng lại tài liệu thành Markdown.")
def format_document(doc_id: str = Field(description="ID tài liệu cần định dạng")) -> list[base.Message]:
    instruction = f"""Đọc tài liệu <document_id>{doc_id}</document_id> bằng read_doc_contents.
Chuyển sang Markdown dễ đọc, giữ nguyên ý nghĩa; dùng heading/list/bảng khi phù hợp.
Dùng edit_document để cập nhật, rồi trả phiên bản cuối."""
    return [base.UserMessage(instruction)]
```
Tên công bố là **`format`** (không phải `format_document`).

**Bước 3 — Kiểm trong Inspector:** lưu, kết nối lại → **Prompts** → chọn `format` → `doc_id=plan.md` → **Get Prompt** → thấy message role `user` chứa `plan.md`, không còn `{doc_id}`. Tài liệu chưa đổi = **đúng hành vi**.

**Bước 4 — Chất lượng mẫu:** thử với tài liệu ngắn, đã có Markdown, chứa số liệu → kiểm có mất thông tin không. Prompt "summarize" phải nói rõ độ dài, nội dung giữ, có sửa bản gốc không. ⚠️ README nhắc `/summarize` nhưng server **chỉ có `format`**.

## 12. Prompts in the client — Dùng mẫu từ client

**Bước 1 — `list_prompts`** (cho menu lệnh):
```python
async def list_prompts(self) -> list[types.Prompt]:
    result = await self.session().list_prompts()
    return result.prompts
```

**Bước 2 — `get_prompt`** (lấy message đã điền):
```python
async def get_prompt(self, prompt_name: str, args: dict[str, str]):
    result = await self.session().get_prompt(prompt_name, args)
    return result.messages
```
Ví dụ `get_prompt("format", {"doc_id": "plan.md"})` — tên prompt và khóa `doc_id` phải khớp server.

**Bước 3 — App nối vào hội thoại** (`_process_command` trong `core/cli_chat.py`): kiểm câu bắt đầu bằng `/` → tách lệnh + ID → `get_prompt(...)` → **chuyển MCP message sang định dạng Anthropic API** (hai cấu trúc khác nhau) → thêm vào lịch sử → vòng chat gọi Claude và xử lý tool use.

**Bước 4 — Thử `/format`:** `uv run main.py` → gõ `/` → chọn `format` → dấu cách → `plan.md` → Enter → Claude gọi tool đọc, tạo Markdown, gọi tool sửa → nhận bản định dạng → trong **cùng phiên** hỏi `What is the contents of the plan.md document?` để kiểm chứng.

⚠️ Autocomplete đối số có giới hạn → gõ thẳng `/format plan.md`; **đừng** chỉ gõ `/format` rồi Enter (parser lấy từ thứ hai → lỗi). `/format` là quy ước UI, không phải cú pháp MCP. Một prompt có thể trả nhiều message.

Đường đi: `/format plan.md → get_prompt → messages → Claude → tools → nội dung mới`.

## 13. Final assessment — Ôn để làm đánh giá

Quiz **7 câu**; câu 1 hỏi 2 thành phần của client (**MCP Client** lớp bọc + **Client Session**). Ôn 3 cặp: *tool/mô hình · resource/ứng dụng · prompt/người dùng* → Start → chọn → **Next Question**.

**7 câu tự luyện:**
1. MCP thay GitHub API? → **Không**, server vẫn gọi GitHub API phía sau.
2. Ai chạy `read_doc_contents`? → app nhận tool use → gọi qua client → **server** thực hiện.
3. Vì sao `initialize()` + cleanup? → thiết lập phiên; đóng session/luồng/tiến trình.
4. Danh sách tài liệu cho autocomplete? → **Resource** (`docs://documents`).
5. Tool chỉ đọc có sai không? → **Không**.
6. `get_prompt` có sửa tài liệu ngay? → **Không**, chỉ trả message.
7. Sửa 20m→25m, restart lại thành 20m? → dict trong **RAM**.

**Tự kiểm thực hành:** làm được 5 việc — liệt kê tool, gọi tool đọc, sửa rồi đọc lại, đọc resource JSON, lấy prompt có tham số — và giải thích ai chủ động mỗi bước.

## 14. MCP review — Chọn đúng thành phần

**Tình huống dùng cả ba** (định dạng kế hoạch): Resource gợi ý `plan.md` → người dùng chọn prompt `format` → app lấy message → Claude chọn tool đọc → soạn lại → đề xuất tool sửa → app trả kết quả tool → Claude trả bản cuối. Ba primitive **hợp tác**, không loại trừ nhau.

**Câu hỏi để chọn:**
- Muốn mô hình có thêm khả năng *tự chọn dùng*? → **Tool**.
- Code app *đã biết* cần dữ liệu gì cho UI/context? → **Resource**.
- Người dùng cần *một thao tác* gọi mẫu có sẵn? → **Prompt**.

| Nhu cầu | Thiết kế |
|---|---|
| Mô hình kiểm tồn kho theo mã | Tool `check_stock` |
| UI hiện danh sách kho để chọn | Resource |
| Nút "Báo cáo tồn kho tuần" | Prompt (tham số tuần/kho) |
| Đính kèm tài liệu đã chọn | Resource |
| Mô hình đề xuất tạo bản ghi | Tool (qua quyền & quy trình của app) |

"Model-controlled" = nơi *đề xuất*; app vẫn thực thi, quản lý quyền, có thể bắt người dùng duyệt.

**Thao tác tổng kết:** tìm 3 decorator trong `mcp_server.py` → nói đầu vào/ra/ai chủ động → đối chiếu hàm trong `mcp_client.py` → chạy 3 kịch bản (hỏi đọc bằng tool, `@report.pdf`, `/format plan.md`) → giải thích vì sao khác nhau mà dùng chung `docs`.

---

## Bài thực hành độc lập — thấy cả 3 primitive chạy (không cần API key)

**A. Môi trường:** `mkdir mcp-demo` → `cd mcp-demo` → `uv venv --python 3.11` → `uv pip install --python .venv/Scripts/python.exe "mcp[cli]==1.26.0"`.

**B. `demo_server.py`:** `FastMCP("VietnameseDocumentDemo")` + dict 2 tài liệu + helper `require_doc` (không decorator → không công bố) + tool `read_doc_contents` + tool `edit_document` (báo lỗi nếu `old_str` rỗng/không tìm thấy, trả "Đã cập nhật…") + resource `docs://documents` (JSON) + template `docs://documents/{doc_id}` + prompt `format` + `mcp.run(transport="stdio")`.

**C. `smoke_client.py`:** tự khởi chạy server bằng `sys.executable`, `initialize()`, rồi `assert` lần lượt:
1. `list_tools` đúng 2 tool → 2. đọc thấy `20m` → 3. sửa rồi đọc thấy `25m`, mất `20m` → 4. đọc `missing.md` trả `isError` → 5. `list_resources` + `list_resource_templates` có đủ → 6. đọc JSON = `["report.pdf","plan.md"]`, đọc template thấy `25m` → 7. `list_prompts == ["format"]`, `get_prompt` trả 1 message `user` chứa `plan.md` → 8. **lấy prompt không làm đổi tài liệu**.

**D. Chạy:** `.\.venv\Scripts\python.exe smoke_client.py` → các dòng `PASS` + `All MCP checks passed. No model API was called.` (Xác nhận giao tiếp MCP, chưa xác nhận Claude chọn tool tốt.)

**E. Inspector:** `.\.venv\Scripts\mcp.exe dev demo_server.py` → thử lại bài 6, 9, 11; sửa `25m` rồi đọc bằng cả tool và resource → thấy dùng chung dict.

**F. Nối sang chat có mô hình** — 4 điểm nối: `list_tools()` → schema cho API · `tool_use` → `call_tool(name, input)` · kết quả → message gắn ID → gọi lại mô hình · `read_resource`/`get_prompt` → đưa vào hội thoại.

## Xử lý lỗi thường gặp

| Hiện tượng | Thao tác |
|---|---|
| Không có `uv` | Cài, mở terminal mới |
| `ModuleNotFoundError: mcp` | Dùng `uv run …` hoặc đúng `.venv/Scripts/python.exe` |
| Import `FastMCP` lỗi | Sai major SDK → dùng lockfile / `mcp==1.26.0` |
| `CLAUDE_MODEL`/`ANTHROPIC_API_KEY cannot be empty` | Điền `.env` đúng thư mục chạy |
| Model không tồn tại | Dùng ID tài khoản có quyền |
| Chạy server terminal đứng yên | Bình thường — chạy client/Inspector |
| Inspector không kết nối | Xem terminal, kiểm path, mở đúng URL vừa in |
| Không thấy tools/resources/prompts | Decorator trước `mcp.run`, lưu file, kết nối lại |
| `mcp_client.py` không in gì | Thay `pass` bằng lệnh in (bài 8) |
| Sửa mà không đổi | `old_str` không khớp / đang đọc tiến trình khác |
| Mất dữ liệu sau khi chạy lại | Dữ liệu RAM — hành vi của demo |
| `@report.pdf?` không lấy được | Bỏ dấu câu dính sau ID |
| `/format` lỗi thiếu đối số | Gõ đủ `/format plan.md` |
| `/summarize` không có | Server chỉ có `format` |
| Lấy prompt mà tài liệu chưa đổi | Đúng — chưa chạy mô hình/tools |

⚠️ Bản COMPLETE: nhánh `except` trong `core/tools.py` tham chiếu `tool_output` có thể chưa gán → nên trả trạng thái `"error"` trực tiếp. **Chẩn đoán theo 3 tầng:** server trả đúng chưa → client giao tiếp đúng chưa → host chuyển schema/message và xử lý tool use đúng chưa.

## Bảng tra nhanh

| Mục tiêu | Server (SDK 1.x) | Client/session |
|---|---|---|
| Đăng ký / xem tool | `@mcp.tool(...)` | `list_tools()` |
| Chạy tool | hàm dưới decorator | `call_tool(name, arguments)` |
| Resource cố định | `@mcp.resource("docs://documents")` | `read_resource(AnyUrl(...))` |
| Resource có tham số | `@mcp.resource("docs://documents/{doc_id}")` | đọc URI đã điền ID |
| Metadata / template | — | `list_resources()` / `list_resource_templates()` |
| Đăng ký / xem prompt | `@mcp.prompt(...)` | `list_prompts()` |
| Dựng message | hàm trả message | `get_prompt(name, arguments)` |

```
"Đọc report.pdf"      → mô hình có thể đề xuất TOOL đọc
"Tóm tắt @report.pdf" → ỨNG DỤNG đọc RESOURCE, đính kèm nội dung
"/format plan.md"     → app lấy PROMPT → gửi mô hình → xử lý tools mô hình đề xuất
```

**Lộ trình ôn 10 bước:** vấn đề MCP chuẩn hóa → vẽ host/client/server/mô hình → tạo & gọi 2 tool → kiểm sửa bằng đọc lại → resource cố định + template → JSON chuỗi → object Python → prompt có tham số → phân biệt lấy prompt vs thực thi → chạy 3 luồng tool/`@`/`/format` → giải thích giới hạn RAM và tài liệu giả.
