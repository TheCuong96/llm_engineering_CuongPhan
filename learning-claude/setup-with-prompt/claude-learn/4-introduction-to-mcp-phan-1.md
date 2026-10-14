# Introduction to Model Context Protocol — Phần 1/5
## MCP giải quyết vấn đề gì và hệ thống hoạt động ra sao?

Phần này bám theo hai bài **Introducing MCP** và **MCP clients**. Tôi bổ sung kiến thức AI nền tảng và ví dụ fullstack để bạn hiểu luồng xử lý trước khi viết code.

Chúng ta sẽ đi qua khóa theo 5 phần:

1. **Tổng quan:** MCP, tool use, client và server.
2. **Xây MCP server:** project setup, định nghĩa tools, dùng server inspector.
3. **Xây MCP client:** kết nối server và điều phối việc gọi công cụ.
4. **Resources và prompts:** định nghĩa, truy cập và sử dụng trong client.
5. **Tổng hợp:** ôn tập, câu hỏi tự kiểm tra và bài thực hành hoàn chỉnh.

Bạn chưa chỉ định stack cụ thể, nên tôi dùng ví dụ quen thuộc với React, Node.js, REST API và SQL. Khi đến phần thực hành của khóa, tôi sẽ giải thích stack mà bài học thực sự sử dụng.

## 1. Vấn đề: AI không tự có kết nối đến hệ thống của bạn

Giả sử bạn thêm một ô chat vào dashboard nội bộ. Người dùng hỏi:

> “Trong các repository của tôi, pull request nào đang chờ review?”

Để trả lời đúng, ứng dụng phải lấy dữ liệu GitHub hiện tại. Việc chỉ gửi câu hỏi cho Claude chưa tạo ra kết nối đến tài khoản GitHub của người dùng.

**Large Language Model — LLM** là mô hình xử lý và sinh ngôn ngữ, chẳng hạn mô hình đứng sau Claude. Nó có thể giải thích code và diễn giải dữ liệu được cung cấp, nhưng bản thân việc sinh câu trả lời không thực hiện truy vấn GitHub.

- **Ví von với web:** xem LLM như một thành phần nhận đầu vào và sinh đầu ra trong backend.
- **Ví dụ fullstack:** backend gửi thông tin một pull request; LLM viết bản tóm tắt dễ đọc cho reviewer.
- **Giới hạn của ví von:** LLM không giống một hàm business logic có quy tắc cố định. Câu trả lời có thể khác nhau và có thể sai; văn bản hợp lý chưa chứng minh dữ liệu chính xác.

**Context — ngữ cảnh** là thông tin được cung cấp cho mô hình trong lần xử lý: câu hỏi, chỉ dẫn, lịch sử liên quan, dữ liệu và kết quả công cụ.

- **Ví von với web:** giống dữ liệu bạn gom vào một request để service có đủ thông tin xử lý.
- **Ví dụ fullstack:** câu hỏi “PR nào đang chờ review?” cộng danh sách PR vừa lấy từ GitHub.
- **Giới hạn của ví von:** context không phải database hay session lưu trữ bền vững. Thông tin nằm trong hệ thống của bạn chưa chắc đã nằm trong đầu vào của mô hình.

### Hiểu nhầm phổ biến

**“Claude biết GitHub nên biết repository của tôi.”**

Biết cách GitHub hoạt động khác với có dữ liệu và quyền truy cập tài khoản của bạn. Backend cần cung cấp dữ liệu, hoặc cung cấp công cụ để lấy dữ liệu.

**“Muốn Claude đọc dữ liệu thì phải huấn luyện lại mô hình.”**

Với tình huống này, bạn có thể lấy dữ liệu rồi đưa vào context. Không cần huấn luyện lại chỉ để trả lời về danh sách PR hiện tại.

## 2. Trước MCP: bạn tự viết đường nối giữa mô hình và API

Một REST API dùng được từ backend chưa đồng nghĩa với việc mô hình biết cách sử dụng nó.

Bạn thường phải chuẩn bị:

1. Mô tả công cụ và các tham số.
2. Code thực thi công cụ.
3. Logic nhận yêu cầu gọi công cụ từ mô hình.
4. Logic gửi kết quả công cụ trở lại mô hình.

### Tool là gì?

**Tool — công cụ** là một chức năng mà ứng dụng cho phép mô hình yêu cầu thực thi. Trong bài này, hãy nghĩ đến các hàm đọc repository, tìm issue hoặc lấy pull request.

- **Ví von với web:** gần với một service method được đưa ra ngoài qua một hợp đồng gọi hàm.
- **Ví dụ fullstack:** `list_open_pull_requests` nhận tên repository rồi dùng GitHub API để lấy PR.
- **Giới hạn của ví von:** mô hình không nhận function pointer rồi chạy code trong backend. Nó sinh yêu cầu gọi; phần mềm của bạn tiếp nhận và thực thi yêu cầu đó.

### Tool schema là gì?

**Tool schema — mô tả cấu trúc công cụ** cho biết tên công cụ, chức năng và định dạng tham số đầu vào.

- **Ví von với web:** gần với OpenAPI hoặc DTO validation schema.
- **Ví dụ fullstack:** công cụ yêu cầu `repository` là chuỗi và `state` thuộc các giá trị cho phép.
- **Giới hạn của ví von:** schema giúp mô hình hiểu cách gọi, nhưng không thay thế xác thực người dùng, kiểm tra quyền hay validation phía server.

Ví dụ dưới đây là **thiết kế minh họa**, chưa phải code SDK hoặc tên công cụ có sẵn:

```json
{
  "name": "list_open_pull_requests",
  "description": "Liệt kê pull request đang mở của một repository",
  "inputSchema": {
    "type": "object",
    "properties": {
      "repository": { "type": "string" }
    },
    "required": ["repository"]
  }
}
```

Ba thành phần chính:

- `name`: định danh để ứng dụng biết công cụ cần gọi.
- `description`: giúp mô hình hiểu công cụ dùng khi nào.
- `inputSchema`: mô tả dữ liệu cần truyền vào.

Đoạn JSON này **không chứa phần thực thi**. Bạn vẫn cần code gọi GitHub API.

### Tool use là gì?

**Tool use — sử dụng công cụ** là cơ chế mô hình yêu cầu gọi một công cụ, nhận kết quả và dùng kết quả đó để tiếp tục xử lý. Với công cụ phía ứng dụng, code của ứng dụng thực hiện thao tác thật.

- **Ví von với web:** giống một workflow gọi service, chờ kết quả rồi xử lý bước tiếp theo.
- **Ví dụ fullstack:** Claude yêu cầu lấy PR → backend gọi GitHub → Claude tóm tắt danh sách trả về.
- **Giới hạn của ví von:** service gọi nhau bằng logic do lập trình viên viết; ở đây mô hình lựa chọn công cụ và tham số dựa trên đầu vào. Vì vậy, bạn vẫn cần kiểm tra yêu cầu đó.

Nguồn bổ sung: [Tool use trong tài liệu Claude](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview).

### Lỗi thường gặp

- Viết mô tả quá mơ hồ, khiến mô hình khó chọn đúng công cụ.
- Tin rằng tham số do mô hình tạo luôn hợp lệ.
- Gửi kết quả cho frontend nhưng quên gửi lại cho mô hình.
- Cho rằng mọi câu hỏi đều cần gọi công cụ; nhiều câu hỏi có thể trả lời từ context sẵn có.

## 3. MCP chuẩn hóa phần tích hợp

**Model Context Protocol — MCP** là giao thức mở để ứng dụng AI giao tiếp với các chương trình cung cấp dữ liệu và công cụ.

Ở góc nhìn fullstack, MCP giúp bạn không phải tự thiết kế một cách kết nối khác nhau cho từng hệ thống tích hợp.

- **Ví von với web:** giống việc các adapter tích hợp cùng tuân theo một hợp đồng chung.
- **Ví dụ fullstack:** ứng dụng chat kết nối MCP server cho GitHub để khám phá và gọi công cụ đọc PR.
- **Giới hạn của ví von:** MCP không chuẩn hóa toàn bộ business logic của GitHub, Jira hay database. Mỗi server vẫn có tập chức năng, schema và cách kiểm tra quyền riêng.

Nguồn: [Giới thiệu MCP chính thức](https://modelcontextprotocol.io/introduction).

### MCP giảm công việc ở đâu?

Trong cách làm trực tiếp, ứng dụng của bạn vừa điều phối Claude, vừa chứa code tích hợp riêng với GitHub.

Với MCP, phần định nghĩa và thực thi công cụ GitHub có thể nằm trong một **MCP server** chuyên biệt. Ứng dụng dùng **MCP client** để giao tiếp với server đó.

Bạn vẫn phải xây luồng ứng dụng, quản lý truy cập và xử lý lỗi. Lợi ích là phần tích hợp có thể được đóng gói và tái sử dụng.

Nếu bạn tự xây MCP server cho hệ thống nội bộ, bạn vẫn viết code tích hợp lần đầu. MCP tạo ra giao diện dùng lại được; nó không tự sinh business logic.

### So sánh MCP và tool use

| Khái niệm | Câu hỏi nó giải quyết |
|---|---|
| Tool use | Mô hình yêu cầu gọi công cụ và sử dụng kết quả như thế nào? |
| MCP | Ứng dụng khám phá và gọi công cụ do server cung cấp theo giao thức nào? |

Hai khái niệm phối hợp với nhau.

Bạn có thể triển khai tool use mà không dùng MCP, bằng cách viết và thực thi công cụ trực tiếp trong backend.

### Hiểu nhầm phổ biến

**“MCP là một mô hình AI.”**

MCP là giao thức giao tiếp. Chương trình triển khai MCP server có thể chỉ chứa code đọc file hoặc gọi API thông thường.

**“Có MCP là khỏi viết tích hợp.”**

Bạn giảm công việc nếu có server phù hợp để sử dụng. Với hệ thống riêng, vẫn cần người triển khai server.

**“MCP server nào cũng có toàn bộ tính năng của dịch vụ.”**

Không có bảo đảm đó. Server chỉ cung cấp những chức năng tác giả đã triển khai và cho phép sử dụng.

## 4. Phân biệt host, client và server

Khóa dùng ví dụ “server của bạn” kết nối đến “MCP server”. Hai chữ *server* này chỉ hai vai trò khác nhau.

Trong kiến trúc MCP, nên phân biệt:

| Thành phần | Định nghĩa | Ví dụ fullstack | Ví von và giới hạn |
|---|---|---|---|
| **MCP host — ứng dụng chủ** | Ứng dụng quản lý việc sử dụng mô hình và các MCP client. | Backend của ứng dụng chat nội bộ. | Giống tầng điều phối; host cũng có thể là ứng dụng desktop, không nhất thiết là web backend. |
| **MCP client — thành phần kết nối** | Thành phần giao tiếp với một MCP server theo giao thức MCP. | Đối tượng client trong backend kết nối server GitHub. | Giống API client hoặc database driver; nó không tự thay bạn quyết định toàn bộ workflow với Claude. |
| **MCP server — chương trình cung cấp khả năng** | Chương trình công bố và xử lý các chức năng MCP mà nó hỗ trợ. | Chương trình chuyển yêu cầu đọc PR thành lời gọi GitHub API. | Giống adapter service; nó có thể chạy cục bộ, không nhất thiết là máy chủ trên Internet. |

Một host có thể quản lý nhiều client để kết nối nhiều server. Đây là cách phân chia vai trò trong [kiến trúc MCP chính thức](https://modelcontextprotocol.io/docs/learn/architecture).

### Sơ đồ dễ nhớ

```text
Frontend chat
      │
      ▼
Backend của bạn — MCP host
      ├── Gọi Claude API
      │
      └── MCP client
              │
              ▼
         MCP server GitHub
              │
              ▼
          GitHub API
```

**Hai đường giao tiếp khác nhau:**

- Backend ↔ Claude: trao đổi với mô hình.
- MCP client ↔ MCP server: trao đổi theo MCP.

Trong ví dụ này, Claude không trực tiếp gửi HTTP request đến GitHub.

### Hiểu nhầm phổ biến

- MCP client không phải frontend chỉ vì có chữ “client”.
- MCP server không nhất thiết chứa LLM.
- Backend của bạn vẫn có trách nhiệm điều phối; MCP client chủ yếu xử lý giao tiếp MCP.

## 5. Một câu hỏi đi qua toàn hệ thống như thế nào?

Lấy câu hỏi trong bài học:

> “Tôi có những repository nào?”

Luồng xử lý gồm ba giai đoạn.

### Giai đoạn A: biết công cụ nào tồn tại

1. Người dùng gửi câu hỏi đến backend.
2. Backend yêu cầu MCP client lấy danh sách công cụ.
3. Client gửi yêu cầu đến MCP server.
4. Server trả về các công cụ cùng mô tả và schema.
5. Backend cung cấp câu hỏi và các định nghĩa công cụ phù hợp cho Claude.

Bài học gọi cặp thông điệp này là **ListToolsRequest / ListToolsResult**. Tên phương thức giao thức tương ứng là `tools/list`.

**Tool discovery — khám phá công cụ** nghĩa là hỏi server hiện cung cấp những công cụ nào.

- **Ví von với web:** giống lấy danh mục API để biết các thao tác có thể gọi.
- **Ví dụ fullstack:** backend phát hiện server có công cụ liệt kê repository.
- **Giới hạn của ví von:** biết công cụ tồn tại chưa có nghĩa công cụ đã chạy hoặc người dùng có quyền truy cập mọi dữ liệu.

### Giai đoạn B: chạy công cụ

6. Claude tạo yêu cầu gọi công cụ phù hợp.
7. Backend nhận yêu cầu và chuyển đến MCP client.
8. Client gửi yêu cầu thực thi đến MCP server.
9. MCP server gọi GitHub API.
10. Kết quả đi ngược về backend.

Bài học gọi cặp thông điệp này là **CallToolRequest / CallToolResult**. Tên phương thức giao thức tương ứng là `tools/call`.

### Giai đoạn C: dùng kết quả để trả lời

11. Backend gửi kết quả công cụ trở lại Claude.
12. Claude tạo câu trả lời dựa trên dữ liệu nhận được.
13. Backend trả câu trả lời cho frontend.

**Điểm cần nhớ:** gọi xong công cụ chưa hoàn thành luồng hội thoại. Mô hình cần nhận kết quả để diễn giải nó.

Trong ứng dụng thực tế, một câu hỏi có thể cần nhiều lần gọi công cụ. Danh sách công cụ cũng không nhất thiết phải được tải lại ở mọi câu hỏi; đó là lựa chọn triển khai.

### Lỗi thường gặp

- Nghĩ `tools/list` trả về dữ liệu repository; nó trả về định nghĩa công cụ.
- Nghĩ model yêu cầu gọi là thao tác đã xảy ra.
- Không xử lý trường hợp GitHub từ chối quyền hoặc trả lỗi.
- Không phân biệt kết quả thật từ công cụ với suy luận của mô hình.

## 6. Client và server giao tiếp qua đâu?

**Transport — cơ chế truyền thông điệp** là cách đưa thông điệp MCP từ client đến server.

- **Ví von với web:** giống phân biệt nội dung một request với kênh dùng để chuyển request.
- **Ví dụ fullstack:** backend khởi chạy MCP server thành một process con và trao đổi qua các luồng vào/ra.
- **Giới hạn của ví von:** không thể đổi transport tùy ý rồi mặc định mọi chi tiết kết nối, xác thực và triển khai vẫn giống nhau.

Hai cơ chế được tài liệu hiện hành mô tả là:

| Transport | Cách hiểu |
|---|---|
| **stdio — standard input/output** | Hai process cục bộ trao đổi qua luồng nhập và xuất chuẩn. |
| **Streamable HTTP** | Client và server trao đổi qua HTTP; phù hợp với server từ xa. |

Bài **MCP clients** cũng nhắc WebSockets và các giao thức khác để diễn đạt tính độc lập với transport. Điều đó không có nghĩa mọi SDK đều hỗ trợ sẵn mọi transport; khi triển khai cần kiểm tra phiên bản và tài liệu tương ứng.

Nguồn đối chiếu: [Transport trong kiến trúc MCP](https://modelcontextprotocol.io/docs/learn/architecture).

### Hiểu nhầm phổ biến

- MCP không đồng nghĩa với REST.
- MCP server chạy cục bộ vẫn là “server” theo vai trò giao thức.
- Đổi từ stdio sang HTTP không chỉ là đổi một chuỗi cấu hình; bạn cần xem lại cách khởi chạy và kiểm soát truy cập.

## 7. Tóm tắt 5 ý chính

1. **LLM cần dữ liệu được cung cấp hoặc công cụ được kết nối** để trả lời về hệ thống hiện tại của bạn.
2. **Tool use** là luồng mô hình yêu cầu công cụ, phần mềm thực thi và mô hình sử dụng kết quả.
3. **MCP** chuẩn hóa cách ứng dụng giao tiếp với chương trình cung cấp dữ liệu và công cụ.
4. **Host điều phối, client kết nối, server cung cấp chức năng.** Ba vai trò không nên gộp thành một.
5. **Khám phá → gọi công cụ → gửi kết quả lại cho mô hình** là luồng nền tảng cần hiểu trước khi viết code.

## 8. Câu hỏi tự kiểm tra

1. Claude biết cách GitHub hoạt động. Vì sao điều đó chưa đủ để trả lời về PR trong tài khoản của bạn?
2. `tools/list` và `tools/call` khác nhau ở đâu?
3. Trong ví dụ trên, thành phần nào thực hiện lời gọi GitHub API?
4. Bạn có thể dùng tool use mà không dùng MCP không?
5. Khi công cụ trả kết quả, vì sao backend thường phải gửi thêm một lượt dữ liệu đến Claude?

## 9. Bài thực hành 20 phút: thiết kế một công cụ cho dự án của bạn

Chưa cần cài SDK hoặc có API key.

**Mục tiêu:** biến một chức năng backend thành thiết kế công cụ rõ ràng.

### Bước 1 — Chọn chức năng đọc dữ liệu, 3 phút

Ví dụ:

- Tìm đơn hàng theo mã.
- Liệt kê issue đang mở.
- Đọc trạng thái một lần deploy.

Chọn chức năng bạn đã có service hoặc endpoint để thực hiện.

### Bước 2 — Viết hợp đồng công cụ, 7 phút

Trong một file Markdown của dự án, ghi:

```text
Tên: get_order_status
Mục đích: Đọc trạng thái hiện tại của một đơn hàng
Đầu vào: order_id
Đầu ra: order_id, status, updated_at
Lỗi: không tồn tại, không có quyền, dịch vụ tạm lỗi
Code thực thi: gọi service đơn hàng hiện có
```

Đây là tên do bạn tự thiết kế, không phải công cụ MCP có sẵn.

### Bước 3 — Vẽ luồng, 5 phút

```text
Người dùng hỏi
→ backend gửi câu hỏi và định nghĩa công cụ cho mô hình
→ mô hình yêu cầu gọi get_order_status
→ backend chuyển yêu cầu qua MCP client
→ MCP server gọi service đơn hàng
→ kết quả về backend
→ backend gửi kết quả cho mô hình
→ mô hình trả lời
```

### Bước 4 — Kiểm tra ranh giới, 5 phút

Trả lời:

- Quyền đọc đơn hàng được kiểm tra ở đâu?
- Nếu `order_id` sai định dạng, thành phần nào từ chối?
- Nếu service lỗi, ứng dụng có phân biệt lỗi với “không tìm thấy” không?
- Dữ liệu nào thực sự cần gửi đến mô hình?

**Hoàn thành khi:** bạn chỉ ra được code nào thuộc host, client và server, đồng thời phân biệt được định nghĩa công cụ với code thực thi.

## 10. Cần tìm hiểu thêm

Các phần sau của khóa sẽ đi vào **tools, resources và prompts**. Phần này chưa cần học thêm agent, subagent, skill hay prompt caching để hiểu MCP.

Sau khi nắm luồng cơ bản, những chủ đề đáng học thêm là:

- Quyền truy cập và xác thực cho MCP server.
- Validation, lỗi, timeout và giới hạn số lần gọi công cụ.
- **Context window** và **token** khi cần quản lý lượng dữ liệu gửi cho mô hình.

Đây là nội dung mở rộng, không phải điều kiện để làm bài thực hành thiết kế ở trên.

## 11. Đáp án tự kiểm tra

1. Kiến thức về GitHub không cung cấp dữ liệu hiện tại hoặc quyền truy cập tài khoản. Ứng dụng phải kết nối và lấy dữ liệu.
2. `tools/list` khám phá định nghĩa công cụ; `tools/call` yêu cầu thực thi một công cụ với tham số.
3. MCP server GitHub thực hiện lời gọi API trong kiến trúc ví dụ.
4. Có. Bạn có thể tự định nghĩa và thực thi công cụ trực tiếp trong backend.
5. Để mô hình nhận dữ liệu thực tế và dùng nó tạo câu trả lời cho người dùng.

---

**Dừng tại đây. Gõ “tiếp” để học Phần 2: xây MCP server, định nghĩa tools và kiểm tra bằng server inspector.**
