# Model Context Protocol: Advanced Topics — Phần 1

Phạm vi: kiểm tra nguồn, định hướng khóa học và nền tảng MCP bổ sung. Ngày đối chiếu tài liệu: 15/10/2026.

## 1. Tôi thực sự đọc được gì?

Trang ban đầu là [Model Context Protocol: Advanced Topics](https://anthropic.skilljar.com/model-context-protocol-advanced-topics), tức trang tổng quan khóa học, chưa phải một bài giảng cụ thể.

Extension đã cung cấp tên khóa, mục lục 15 bài, trạng thái hoàn thành và phần thông tin Skilljar. Tôi mở tiếp bài đầu [Let's get started!](https://anthropic.skilljar.com/model-context-protocol-advanced-topics/296349) và đọc được tiêu đề, mục lục bên cạnh, trình phát video dài **1 phút 28 giây**, cùng nút chuyển sang Sampling.

**Giới hạn:** chưa nhận được transcript, phụ đề hoặc nội dung âm thanh/hình ảnh đủ để phân tích video. Không thấy liên kết tài liệu đính kèm trong nội dung trang đã kiểm tra. Vì vậy, tôi chưa thể xác nhận video giới thiệu nói gì, yêu cầu kiến thức nền nào hay cam kết kết quả học tập nào. Tôi cũng chưa đọc các bài còn lại.

Để giảng đúng video, bạn có thể gửi transcript/phụ đề hoặc sao chép phần văn bản bài học vào cuộc trò chuyện. Nếu extension của bạn có chức năng gửi nội dung trang, hãy dùng chức năng đó sau khi mở phần transcript. Tôi chưa thấy tên nút gửi nội dung trong giao diện của bạn nên không hướng dẫn bằng một tên nút giả định.

**Toàn bộ phần giảng kiến thức dưới đây là “Giải thích bổ sung”, dựa trên tài liệu MCP chính thức và ví dụ tôi tự xây dựng; không phải bản thuật lại video.**

## 2. Bản đồ nội dung thực sự có trong mục lục

| Nhóm | Tên bài hiển thị |
|---|---|
| Giới thiệu | Let's get started! |
| Tính năng MCP | Sampling; Sampling walkthrough; Log and progress notifications; Notifications walkthrough; Roots; Roots walkthrough; Survey |
| Truyền tải và giao tiếp | JSON message types; The STDIO transport; The StreamableHTTP transport; StreamableHTTP in depth; State and the StreamableHTTP transport |
| Đánh giá và bước tiếp theo | Assessment on MCP concepts; Wrapping up |

Đây là bản đồ tên bài, không phải bằng chứng rằng tôi đã đọc nội dung từng bài. Từ mục lục, có thể thấy khóa tập trung vào tính năng và cách các thành phần MCP giao tiếp; chưa thể xác nhận chi tiết các ví dụ hoặc bài tập của khóa.

**Lưu ý phiên bản — Giải thích bổ sung:** tài liệu chính thức tôi truy cập chuyển tới bản `2026-07-28`. Trang kiến trúc đánh dấu Sampling và Logging là **không còn được khuyến nghị dùng cho triển khai mới (deprecated)**; trang về client cũng đánh dấu Roots như vậy. Điều này không đồng nghĩa mọi hệ thống cũ đã ngừng hỗ trợ chúng. Tôi chưa xác định được khóa học dựa trên bản đặc tả nào; cần đối chiếu phiên bản trước khi áp dụng code từ các bài sau. Nguồn: [kiến trúc MCP](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture), [các khái niệm về client](https://modelcontextprotocol.io/docs/2026-07-28/learn/client-concepts).

## 3. Phần đầu tiên: MCP giúp ứng dụng AI làm việc với hệ thống bên ngoài

### Bài này giải quyết vấn đề gì?

**Giải thích bổ sung.** Hãy đặt một bài toán quen thuộc: bạn muốn Claude tìm những component React chưa có kiểm thử trong dự án.

Để trả lời dựa trên dự án thật, ứng dụng cần lấy được danh sách file, đọc nội dung liên quan và đưa kết quả đó cho mô hình. Việc bạn gõ tên dự án vào ô chat chưa cung cấp những dữ liệu ấy.

**Giao thức ngữ cảnh mô hình (Model Context Protocol — MCP)** là chuẩn giao tiếp để ứng dụng AI kết nối với dữ liệu và chức năng bên ngoài. Nó giúp các bên trao đổi theo một quy ước chung. [Giới thiệu MCP chính thức](https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro).

Sau phần nền tảng này, mục tiêu là bạn có thể vẽ luồng “người dùng → ứng dụng AI → công cụ → dữ liệu → câu trả lời”, phân biệt các vai trò, và biết khi nào đáng thêm MCP vào một ứng dụng. Đây là mục tiêu của phần giảng tôi xây dựng, chưa phải mục tiêu đã xác nhận từ video.

### Kiến thức cần có trước

Với nền tảng React/TypeScript, bạn đã có phần lớn vốn lập trình cần thiết. Ta cần thống nhất thêm vài từ:

- **Mô hình ngôn ngữ lớn (Large Language Model — LLM):** mô hình xử lý và sinh ngôn ngữ; trong ví dụ, nó diễn giải yêu cầu và tạo nhận xét về code.
- **Ngữ cảnh (context):** thông tin được đưa vào lần xử lý của mô hình, chẳng hạn câu hỏi, đoạn code và kết quả công cụ.
- **Giao diện lập trình ứng dụng (Application Programming Interface — API):** cách chương trình gọi chức năng của chương trình khác. Bạn đã gặp nó khi gọi API từ React.
- **Giao thức (protocol):** quy ước hai bên cùng tuân theo để hiểu thông điệp của nhau.

Chưa cần học cách huấn luyện mô hình để hiểu phần này. Khi viết triển khai thật, bạn sẽ cần đọc được JSON, hiểu thao tác bất đồng bộ và phân biệt chương trình chạy ở trình duyệt với chương trình Node.js.

### Tại sao cần một chuẩn chung?

**Ví dụ tự xây dựng.** Bạn có hai ứng dụng AI và ba nguồn: kho mã nguồn, hệ thống lỗi và tài liệu nội bộ. Nếu mỗi ứng dụng tự tích hợp từng nguồn theo một kiểu riêng, bạn phải duy trì nhiều cách kết nối.

MCP tạo một giao diện chung mà các ứng dụng và máy chủ tương thích có thể sử dụng. Tuy vậy, phần kết nối tới API thật của kho mã hoặc hệ thống lỗi vẫn phải được ai đó triển khai. [Giới thiệu MCP chính thức](https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro).

Có thể hình dung một biểu mẫu yêu cầu thống nhất trong công ty: các phòng ban nhận cùng cấu trúc yêu cầu nhưng mỗi phòng vẫn phải tự xử lý công việc chuyên môn. Giới hạn phép so sánh: MCP là giao thức phần mềm với thông điệp và quy tắc kỹ thuật; “có biểu mẫu chung” không tự bảo đảm kết quả chính xác hay đủ quyền truy cập.

### Ba vai trò dễ nhầm

Theo [tài liệu về client](https://modelcontextprotocol.io/docs/2026-07-28/learn/client-concepts):

| Vai trò | Ý nghĩa | Ví dụ giả định |
|---|---|---|
| Ứng dụng chủ (host) | Ứng dụng AI điều phối các kết nối MCP | Ứng dụng trợ lý lập trình bạn đang dùng |
| Thành phần khách MCP (client) | Thành phần trong host giao tiếp với một server | Thành phần nối tới server phân tích dự án |
| Máy chủ MCP (server) | Chương trình cung cấp dữ liệu hoặc chức năng qua MCP | Chương trình Node.js truy xuất dự án |

Một host có thể tạo nhiều client cho nhiều server. Theo [tài liệu kiến trúc](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture), “server” ở đây chỉ vai trò chương trình; nó có thể chạy ngay trên máy bạn hoặc ở xa. Không nên mặc định server luôn là dịch vụ trên Internet.

Với góc nhìn React, bạn có thể hình dung host là toàn bộ ứng dụng, còn client gần với một lớp phụ trách giao tiếp. Đây chỉ là liên tưởng về phân chia trách nhiệm; client MCP không đồng nghĩa một React component hay mọi hàm `fetch()`.

### Nó hoạt động như thế nào trong bài toán React?

**Ví dụ tự xây dựng**, giả sử bạn đã có một host tương thích và server cung cấp công cụ `find_components_without_tests`:

```text
Bạn: “Tìm component trong src/components chưa có file kiểm thử đi kèm.”
  ↓
Host cung cấp mô tả công cụ cho mô hình
  ↓
Mô hình đề xuất gọi find_components_without_tests
  ↓
Host xử lý quyền và chuyển yêu cầu qua client MCP
  ↓
Server kiểm tra các file trong phạm vi được phép
  ↓
Kết quả quay về host, rồi được đưa cho mô hình
  ↓
Mô hình giải thích những mục được tìm thấy và giới hạn kiểm tra
```

Trong ví dụ này:

- **Đầu vào:** thư mục `src/components` và quy ước nhận diện file kiểm thử.
- **Xử lý:** server liệt kê file, so sánh tên component với tên file kiểm thử theo quy ước đã định.
- **Đầu ra giả định:** `Button.tsx` chưa có `Button.test.tsx` đi kèm.

Luồng chung “ứng dụng chuyển yêu cầu công cụ và đưa kết quả trở lại mô hình” được mô tả trong [tài liệu kiến trúc](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture). Tên công cụ và thuật toán trong ví dụ là do tôi đặt, không phải công cụ có sẵn của Claude.

**Điểm cần suy luận:** không có file kiểm thử cùng tên chưa chứng minh component hoàn toàn chưa được kiểm thử. Nó có thể được kiểm tra trong một bài kiểm thử tích hợp ở thư mục khác. Vì vậy, báo cáo phải nêu quy tắc đã dùng và tránh kết luận vượt quá dữ liệu.

### Công cụ, tài nguyên và mẫu lời nhắc khác nhau thế nào?

**Giải thích bổ sung**, theo [tài liệu server](https://modelcontextprotocol.io/docs/2026-07-28/learn/server-concepts):

| Thành phần | Hiểu đơn giản | Ví dụ tôi tự đặt |
|---|---|---|
| Công cụ (tool) | Chức năng có thể được gọi để thực hiện một thao tác | Tìm component thiếu file kiểm thử |
| Tài nguyên (resource) | Dữ liệu ứng dụng lấy làm ngữ cảnh | Nội dung quy ước kiểm thử của nhóm |
| Mẫu lời nhắc (prompt) | Mẫu hướng dẫn dùng lại cho một công việc | Mẫu yêu cầu rà soát kiểm thử |

Công cụ có thể chỉ đọc dữ liệu; không phải công cụ nào cũng sửa hoặc xóa. Một đoạn văn bạn gõ vào chat cũng chưa tự trở thành prompt được server cung cấp qua MCP. Ba thành phần được phân biệt bằng cách chúng được cung cấp và sử dụng, không chỉ bằng hình thức văn bản.

### Khi nào nên dùng?

**Nhận định thiết kế bổ sung.** Nếu bạn xây server phân tích dự án để nhiều ứng dụng AI tương thích cùng sử dụng, MCP đáng cân nhắc. Nếu chỉ cần một trang React hiển thị danh sách lỗi từ backend của chính bạn, cách gọi API hiện có có thể đã đủ; hãy bắt đầu từ nhu cầu tích hợp thực tế.

Một lỗi hiểu nhầm khác là “kết nối được MCP thì mọi tính năng đều hoạt động”. Cần kiểm tra phía host, server và phiên bản mà chúng hỗ trợ. Với tính năng Sampling của đặc tả `2025-06-18`, chẳng hạn, client hỗ trợ phải khai báo khả năng đó; không thể giả định mọi client đều có. [Đặc tả Sampling 2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18/client/sampling).

## 4. Một lời nhắc để áp dụng vào tình huống thật

**Ví dụ bổ sung do tôi viết.** Chỉ dùng khi môi trường Claude của bạn đã có công cụ đọc dự án phù hợp; lời nhắc không tự cài hoặc kết nối MCP.

```text
Hãy rà soát các component React trong src/components.

Trước khi phân tích, cho biết bạn có công cụ nào để đọc danh sách file
và nội dung dự án. Nếu chưa truy cập được, hãy nói rõ.

Chỉ đọc dữ liệu. Tìm các component không có file .test.tsx hoặc .spec.tsx
đi kèm theo quy ước tên file cùng thư mục. Nếu dự án có quy ước khác
trong tài liệu, hãy nêu quy ước đó và điều chỉnh cách rà soát.

Với mỗi mục tìm được, đưa ra:
1. Đường dẫn component.
2. Bằng chứng về những file đã kiểm tra.
3. Giới hạn của kết luận và vị trí có thể còn chứa kiểm thử.
4. Một hành vi cụ thể nên kiểm thử trước, nếu đã đọc đủ code để đề xuất.

Không kết luận “chưa được kiểm thử” chỉ vì thiếu file cùng tên.
Cuối cùng, liệt kê phần đã kiểm tra và phần chưa truy cập được.
```

Đoạn đầu buộc xác định khả năng truy cập. Đoạn giữa đặt phạm vi và quy tắc để người khác kiểm tra lại. Phần báo cáo yêu cầu bằng chứng và giới hạn. Bạn có thể thay `src/components` bằng thư mục khác hoặc đổi quy ước tên file theo dự án.

Để đánh giá kết quả, hãy mở lại vài đường dẫn được nêu, kiểm tra file kiểm thử ở nơi khác và xem đề xuất có khớp hành vi component không. Một câu trả lời trôi chảy chưa đủ chứng minh việc rà soát đúng. Tôi chưa chạy lời nhắc này trên dự án của bạn.

## 5. Bài thực hành nhỏ

**Mục tiêu:** phân biệt kết quả công cụ với suy luận của mô hình, chưa cần cài phần mềm.

Giả sử dự án có:

```text
src/components/Button.tsx
src/components/Button.test.tsx
src/components/Modal.tsx
tests/checkout-flow.spec.tsx
```

1. Vẽ host, client, server và nơi lưu file; nối chiều yêu cầu và kết quả.
2. Viết đầu vào của công cụ rà soát: phạm vi thư mục và quy ước tìm file kiểm thử.
3. Tự đóng vai server, ghi dữ liệu công cụ trả về khi chỉ so sánh tên file cùng thư mục.
4. Tự đóng vai mô hình, viết báo cáo ngắn dựa trên dữ liệu đó.
5. Bổ sung thông tin: `checkout-flow.spec.tsx` có kiểm tra hành vi của Modal. Sửa báo cáo nếu cần và giải thích lý do.

**Tiêu chí hoàn thành:** phân biệt đúng vai trò; dữ liệu trả về khớp quy tắc; báo cáo không suy diễn “thiếu file cùng tên” thành “không có bất kỳ kiểm thử nào”; chỉ ra dữ liệu cần đọc thêm. Đây là bài mô phỏng thiết kế, không phải kết quả từ một server đã chạy.

## 6. Điều cần nhớ và năm câu hỏi tự kiểm tra

- MCP chuẩn hóa cách ứng dụng AI kết nối với dữ liệu và chức năng bên ngoài.
- Host, client và server có trách nhiệm khác nhau.
- Phải phân biệt dữ liệu công cụ cung cấp với kết luận mô hình rút ra.
- Trước khi dùng tính năng trong khóa, kiểm tra phiên bản và khả năng hỗ trợ.
- Phần này chưa thay thế nội dung video “Let's get started!”.

**Chưa có đáp án để bạn tự trả lời:**

1. Vì sao gõ “hãy đọc dự án của tôi” chưa đủ để Claude biết code trong máy?
2. Nếu một ứng dụng AI kết nối hai server MCP, bạn xác định host, client và server như thế nào?
3. Vì sao kết quả “Modal không có file kiểm thử cùng tên” chưa đủ để nói Modal chưa được kiểm thử? Bạn sẽ lấy thêm dữ liệu gì?
4. Bạn chỉ cần React gọi backend để hiển thị dữ liệu. Khi nào việc thêm MCP bắt đầu có giá trị?
5. Một bài trong khóa có code Sampling nhưng môi trường của bạn dùng bản MCP khác. Bạn sẽ kiểm tra những gì trước khi áp dụng, và vì sao?

Đã giảng: định hướng nguồn và nền tảng MCP bổ sung. Chưa giảng: nội dung video giới thiệu cùng các bài chuyên sâu. Dừng ở đây để bạn trả lời hoặc hỏi thêm; nếu muốn học đúng video đầu tiên, cần cung cấp transcript/phụ đề.

## 7. Nguồn và trạng thái truy cập

Đã đọc trang tổng quan và phần văn bản của bài đầu qua Chrome:

- [Model Context Protocol: Advanced Topics](https://anthropic.skilljar.com/model-context-protocol-advanced-topics) — mục lục và thông tin trang khóa.
- [Let's get started!](https://anthropic.skilljar.com/model-context-protocol-advanced-topics/296349) — tiêu đề, mục lục, thông tin trình phát; chưa đọc được nội dung video.

Đã đọc các tài liệu chính thức dùng để giải thích bổ sung:

- [MCP là gì? — bản 2026-07-28](https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro).
- [Kiến trúc — bản 2026-07-28](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture).
- [Các khái niệm về server — bản 2026-07-28](https://modelcontextprotocol.io/docs/2026-07-28/learn/server-concepts).
- [Các khái niệm về client — bản 2026-07-28](https://modelcontextprotocol.io/docs/2026-07-28/learn/client-concepts).
- [Sampling — đặc tả 2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18/client/sampling) — đối chiếu một phiên bản cũ cụ thể.

Trang đặc tả riêng [Versioning and Compatibility](https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning) có trả về tên/đường dẫn ở lần truy cập đầu, nhưng không lấy được nội dung chi tiết khi mở tiếp; tôi không dùng nó làm căn cứ cho các giải thích trên. Các ghi chú thay đổi tính năng dựa vào trang kiến trúc và trang client đã đọc.
