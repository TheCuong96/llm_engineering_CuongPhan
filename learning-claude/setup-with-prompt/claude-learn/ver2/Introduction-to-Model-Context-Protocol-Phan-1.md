**Introduction to Model Context Protocol — Phần 1: Hiểu vấn đề trước khi viết code**

**1. Tôi thực sự đọc được gì?**

Trang hiện tại có tên **Introduction to Model Context Protocol**, tại [trang khóa học Anthropic](https://anthropic.skilljar.com/introduction-to-model-context-protocol). Đây là **trang tổng quan khóa học**, chưa phải một bài giảng riêng.

Tôi đã nhận nội dung qua extension, sau đó mở phần “About this course” ngay trên trang để đọc thêm. Phạm vi đọc được gồm:

- Mục lục với bốn nhóm: giới thiệu; thực hành với MCP server; kết nối với MCP client; đánh giá và tổng kết.
- Tên các bài, chẳng hạn “Welcome to the course”, “Introducing MCP”, “MCP clients”, “Project setup”, các bài về tools, resources và prompts.
- Phần mô tả khóa học, mục tiêu học tập, điều kiện đầu vào và đối tượng học.
- Phần hỏi đáp về nền tảng Skilljar và dữ liệu học tập.

**Chưa đọc được:** nội dung bên trong từng bài, bản chép lời (transcript), phụ đề video, code mẫu hoặc tài liệu đính kèm của từng bài. Không có cơ sở coi phần giới thiệu này là toàn bộ lời giảng trong video. Tôi chưa đọc toàn bộ khóa học.

Ngoài trang trên, tôi đã đọc ba trang tài liệu MCP chính thức: giới thiệu MCP, tổng quan kiến trúc và các thành phần của server. Liên kết nằm cuối bài. Các URL tài liệu được trả về có phiên bản `2026-07-28`; phần này không đưa lệnh cài đặt hay cấu hình SDK cần kiểm tra thêm theo phiên bản.

Quy ước trong bài:

- **Trong trang khóa học:** thông tin thực sự có trong mục lục hoặc phần giới thiệu.
- **Giải thích bổ sung:** cách diễn giải và ví dụ tôi thêm để bạn hiểu; không phải bản chép lời video.

Để học sát một video ở lượt tiếp theo, bạn có thể mở bài cụ thể rồi yêu cầu tôi đọc lại tab. Nếu văn bản video vẫn không được cung cấp, hãy dùng chức năng gửi nội dung trang của extension nếu có, hoặc sao chép transcript/phụ đề vào cuộc trò chuyện. Tôi không có căn cứ để chỉ tên một nút gửi nội dung cụ thể trong extension của bạn.

**2. Bài này nói về điều gì và bạn sẽ làm được gì?**

**Trong trang khóa học:** khóa học hướng dẫn xây dựng cả phía cung cấp và phía sử dụng MCP bằng bộ công cụ phát triển Python (Python SDK). SDK là tập hợp thư viện và tiện ích giúp lập trình viên làm việc với một hệ thống mà không phải tự xử lý mọi chi tiết giao tiếp.

Mục tiêu được công bố gồm hiểu kiến trúc và luồng yêu cầu–phản hồi; định nghĩa công cụ; đọc và sửa tài liệu; kiểm tra server bằng MCP Inspector; cung cấp dữ liệu dạng tài nguyên; tạo mẫu lời nhắc và sử dụng chúng trong client. Khóa học còn đề cập cách truyền thông điệp, xử lý nội dung JSON/văn bản, gợi ý hoàn thành tham số và đưa dữ liệu vào cuộc trò chuyện. Đây là **mục tiêu của cả khóa**, chưa phải những phần chúng ta đã học xong. [Nguồn: giới thiệu khóa học](https://anthropic.skilljar.com/introduction-to-model-context-protocol).

**Giải thích bổ sung — mục tiêu buổi này:** sau phần đầu tiên, bạn nên giải thích được vì sao một ứng dụng AI cần kết nối dữ liệu bên ngoài, MCP nằm ở đâu trong kết nối đó và ai thực sự chạy hành động. Bạn cũng sẽ phác thảo được một tính năng trợ lý cho ứng dụng React mà chưa cần cài SDK.

**Kiến thức nền cần có:**

| Kiến thức | Cách hiểu dùng trong buổi này |
|---|---|
| Mô hình ngôn ngữ lớn (Large Language Model, LLM) | Mô hình học các quy luật từ dữ liệu để xử lý và sinh ngôn ngữ. Khả năng viết câu trả lời không đồng nghĩa với việc có quyền đọc cơ sở dữ liệu của bạn. |
| Ngữ cảnh (context) | Thông tin được cung cấp cho mô hình trong lần xử lý, như yêu cầu, đoạn tài liệu hoặc kết quả truy vấn. |
| Giao diện lập trình ứng dụng (Application Programming Interface, API) | Cách phần mềm cung cấp chức năng cho phần mềm khác gọi, như API lấy danh sách công việc. |
| JSON và yêu cầu–phản hồi | Dữ liệu có cấu trúc và cách một bên gửi yêu cầu, bên kia trả kết quả; khá quen thuộc nếu bạn đã gọi API trong React. |

Theo trang khóa học, để làm đầy đủ bài thực hành gốc, bạn cần biết Python, JSON và cách HTTP trao đổi yêu cầu–phản hồi. Nền tảng JavaScript/TypeScript giúp bạn hiểu luồng xử lý, nhưng không thay thế hoàn toàn Python khi làm code gốc. Tôi sẽ dùng ví dụ gần với React/Node.js để giải thích.

**3. Vì sao Claude cần một cách kết nối với hệ thống bên ngoài?**

**Giải thích bổ sung — tình huống tự xây dựng:** bạn có ứng dụng React quản lý công việc, với phần xử lý phía máy chủ (backend) viết bằng Node.js. Bạn muốn hỏi trợ lý:

> Những việc nào của tôi đã quá hạn? Hãy gợi ý thứ tự xử lý.

Muốn trả lời đúng, hệ thống cần biết bạn là ai, lấy đúng danh sách công việc bạn được phép xem, rồi đưa dữ liệu cần thiết cho mô hình. Mô hình không thể suy ra danh sách thật chỉ từ tên ứng dụng.

Nếu chưa tích hợp, bạn có thể sao chép danh sách vào cuộc trò chuyện. Cách đó phù hợp khi học hoặc xử lý một lần, nhưng phải làm lại khi dữ liệu thay đổi.

Nếu tích hợp bằng code riêng, bạn có thể xây một hàm `getMyTasks`. Khi trợ lý cần dữ liệu, ứng dụng gọi hàm rồi đưa kết quả vào cuộc trò chuyện. Việc này hoàn toàn khả thi mà chưa cần MCP. Tuy nhiên, nếu muốn cung cấp chức năng tương tự cho nhiều ứng dụng AI, bạn có thể phải làm lại nhiều phần kết nối theo từng ứng dụng.

**MCP giải quyết phần chuẩn hóa kết nối:** Giao thức ngữ cảnh mô hình (Model Context Protocol, MCP) là chuẩn mở để ứng dụng AI kết nối với dữ liệu, công cụ và quy trình bên ngoài. “Giao thức” là các quy tắc chung để hai chương trình hiểu cách trao đổi với nhau. [Nguồn: giới thiệu MCP chính thức](https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro).

Hãy hình dung nhóm của bạn thống nhất một mẫu phiếu yêu cầu: luôn ghi tên thao tác, đầu vào và cách trả kết quả. Các bên không cần tự nghĩ ra mẫu phiếu mới mỗi lần hợp tác.

**Giới hạn phép so sánh:** mẫu phiếu không tự làm công việc. Tương tự, MCP không tự viết logic lấy dữ liệu, cấp quyền truy cập hay đảm bảo kết quả đúng. Bạn vẫn phải triển khai những phần đó.

**4. Phân biệt mô hình, ứng dụng, client và server**

**Giải thích bổ sung — thuật ngữ kiến trúc đã đối chiếu tài liệu chính thức:**

| Thành phần | Vai trò dễ hiểu |
|---|---|
| Mô hình | Xử lý yêu cầu và có thể đề xuất dùng công cụ. |
| Ứng dụng chủ (host) | Ứng dụng AI điều phối cuộc trò chuyện và các kết nối MCP. |
| Thành phần kết nối (MCP client) | Thành phần trong host giao tiếp với một MCP server. |
| Chương trình cung cấp khả năng (MCP server) | Cung cấp dữ liệu hoặc chức năng qua MCP; có thể chạy trên máy cục bộ hoặc từ xa. |

Một host có thể quản lý nhiều client để kết nối nhiều server. Vì vậy, “client” ở đây không đồng nghĩa với toàn bộ giao diện React. [Nguồn: kiến trúc MCP](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture).

Trong ví dụ của chúng ta, giao diện React hiển thị cuộc trò chuyện. Phần Node.js điều phối có thể giữ vai trò host, dùng MCP client để liên hệ một server quản lý công việc. Server đó gọi API công việc hiện có.

Đây là **một phương án thiết kế**, không phải kiến trúc bắt buộc cho mọi ứng dụng React. Đừng suy ra rằng cứ dùng MCP là phải viết lại backend hoặc đưa toàn bộ kết nối vào trình duyệt.

**5. Một yêu cầu đi từ người dùng đến dữ liệu như thế nào?**

**Giải thích bổ sung — ví dụ tự xây dựng để minh họa luồng yêu cầu–phản hồi được nêu trong mục tiêu khóa học:**

Giả sử server cung cấp công cụ `getMyTasks`, có nhiệm vụ lấy công việc của người dùng đang được xác thực. Luồng minh họa là:

1. Bạn nhập câu hỏi trong giao diện React: “Tìm các việc của tôi đã quá hạn”.
2. Host có được thông tin về công cụ khả dụng, gồm công dụng và đầu vào của `getMyTasks`.
3. Host cung cấp thông tin công cụ phù hợp cho mô hình; mô hình có thể đề xuất gọi công cụ đó.
4. Host kiểm tra yêu cầu theo quyền và quy tắc của ứng dụng, rồi dùng MCP client gửi yêu cầu tới server.
5. Server thực hiện logic lấy dữ liệu qua API công việc. Hệ thống xác thực phải ràng buộc dữ liệu với đúng người dùng; không chỉ tin một mã người dùng do mô hình tự đưa ra.
6. Kết quả trở lại host qua client. Host đưa phần dữ liệu cần thiết vào ngữ cảnh để mô hình xử lý tiếp.
7. Mô hình viết câu trả lời; React hiển thị cho bạn.

Đầu vào ban đầu là câu hỏi. Kết quả trung gian là dữ liệu công việc. Đầu ra cuối cùng là lời giải thích dựa trên dữ liệu đó. Đây là hai loại đầu ra khác nhau: **lấy được dữ liệu đúng chưa đủ để kết luận mô hình đã diễn giải đúng**.

Ví dụ, API trả đúng ba công việc nhưng mô hình bỏ qua trạng thái “đã hoàn thành”, thì câu trả lời vẫn sai. Khi kiểm tra tính năng, bạn cần đối chiếu cả dữ liệu và quy tắc suy luận.

Điểm cần nắm: mô hình đề xuất thao tác; phần mềm mới thực hiện thao tác. Tài liệu kiến trúc cũng mô tả ứng dụng nhận yêu cầu gọi công cụ, chuyển tới server và đưa kết quả trở lại cho mô hình. [Nguồn: luồng thực thi công cụ](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture#understanding-the-tool-execution-response).

**6. Ba thành phần chính: nhìn trước để không nhầm**

**Trong trang khóa học:** ba thành phần chính là công cụ (tools), tài nguyên (resources) và mẫu lời nhắc (prompts). Bảng dưới diễn giải lại, dùng ví dụ tự xây dựng:

| Thành phần | Bản chất | Ví dụ quản lý công việc | Cách điều khiển được nêu trong khóa học |
|---|---|---|---|
| Công cụ | Chức năng được gọi để thực hiện một thao tác | `getMyTasks`, `updateTaskStatus` | Mô hình lựa chọn sử dụng |
| Tài nguyên | Dữ liệu cung cấp để đọc làm ngữ cảnh | Tài liệu mô tả các trạng thái công việc | Ứng dụng lựa chọn đưa vào ngữ cảnh |
| Mẫu lời nhắc | Mẫu hướng dẫn tái sử dụng cho một quy trình | “Lập kế hoạch xử lý việc quá hạn” | Người dùng chủ động chọn sử dụng |

**Giải thích bổ sung:** “mô hình điều khiển công cụ” không có nghĩa mô hình được toàn quyền thực thi. Ứng dụng có thể kiểm soát quyền và yêu cầu phê duyệt. Ngoài ra, công cụ có thể chỉ đọc dữ liệu; không phải mọi thao tác đọc đều phải được cung cấp dưới dạng tài nguyên. Tài liệu chính thức phân biệt ba thành phần theo vai trò và cách sử dụng. [Nguồn: các thành phần của MCP server](https://modelcontextprotocol.io/docs/2026-07-28/learn/server-concepts).

Ở buổi này, bạn chỉ cần nhận ra ba vai trò. Cách định nghĩa và gọi từng loại sẽ cần bài riêng.

**7. Khi nào nên dùng, và điều gì dễ bị hiểu sai?**

**Giải thích bổ sung — gợi ý thiết kế từ ví dụ trên:** MCP đáng cân nhắc khi bạn muốn cung cấp khả năng cho ứng dụng AI qua một giao diện chuẩn, có thể tái sử dụng ở nhiều nơi. Điều kiện là phía sử dụng hỗ trợ khả năng MCP cần thiết và bạn có thể triển khai hoặc sử dụng server phù hợp.

Với một tính năng nhỏ chỉ dùng trong một ứng dụng Node.js, gọi hàm hoặc API trực tiếp có thể đã đủ. Hãy xác định nhu cầu tái sử dụng trước khi thêm một tầng tích hợp.

| Hiểu nhầm | Cách hiểu đúng |
|---|---|
| “Có MCP thì Claude biết dữ liệu trong hệ thống.” | Cần kết nối, quyền truy cập và dữ liệu thực sự được lấy rồi cung cấp cho mô hình. |
| “MCP thay thế API hiện có.” | Trong ví dụ này, MCP server vẫn gọi API công việc; bạn có thể giữ lại logic nghiệp vụ hiện có. |
| “Dữ liệu lấy từ server chắc chắn làm câu trả lời đúng.” | Mô hình vẫn có thể áp dụng sai điều kiện hoặc bỏ sót dữ liệu. |
| “MCP là huấn luyện thêm Claude.” | Đưa dữ liệu vào ngữ cảnh của cuộc trò chuyện khác với cập nhật các tham số đã học của mô hình. |

**8. Bài thực hành nhỏ: kiểm tra dữ liệu trước khi tích hợp**

**Giải thích bổ sung — bài tập tự xây dựng, không phải bài tập gốc của khóa học.**

**Mục tiêu:** thiết kế được một yêu cầu đọc công việc và đánh giá câu trả lời bằng dữ liệu rõ ràng. Chưa cần Python, SDK, khóa API hay một kết nối MCP đang chạy.

**Bước 1:** vẽ luồng cho ứng dụng giả định của bạn: người dùng → host → MCP client → MCP server → API công việc, rồi chiều trả kết quả. Đánh dấu nơi xác định người dùng và nơi kiểm tra quyền truy cập.

**Bước 2:** viết mô tả cho `getMyTasks`: lấy công việc của người dùng đang đăng nhập; không sửa dữ liệu; kết quả gồm mã, tiêu đề, hạn chót và trạng thái. Đây là bản thiết kế chức năng, chưa phải định nghĩa công cụ MCP hoàn chỉnh.

**Bước 3:** dùng dữ liệu giả bên dưới để thử riêng khả năng diễn giải. Bạn có thể gửi nguyên lời nhắc này trong cuộc trò chuyện:

```text
Bạn là trợ lý lập kế hoạch công việc.

Chỉ dùng dữ liệu trong phần DỮ LIỆU, không tự bổ sung công việc.
Ngày dùng để so sánh là 2026-10-15.
Các hạn chót là ngày dạng YYYY-MM-DD, không có giờ.

Quy tắc: một việc quá hạn khi hạn chót sớm hơn ngày so sánh
và trạng thái khác "done". Việc đến hạn đúng ngày so sánh chưa quá hạn.

DỮ LIỆU:
[
  {"id":"T17","title":"Sửa lỗi đăng nhập","dueDate":"2026-10-14","status":"todo"},
  {"id":"T18","title":"Cập nhật tài liệu","dueDate":"2026-10-13","status":"done"},
  {"id":"T19","title":"Rà soát giao diện","dueDate":"2026-10-15","status":"todo"}
]

Yêu cầu:
1. Liệt kê mã các việc quá hạn và giải thích bằng hạn chót cùng trạng thái.
2. Với mỗi việc còn lại, giải thích vì sao không thuộc nhóm quá hạn.
3. Nếu gợi ý ưu tiên, phân biệt dữ kiện với đề xuất của bạn;
   không tự cho rằng tiêu đề phản ánh đầy đủ mức độ khẩn cấp.
```

**Vì sao viết như vậy?** Giới hạn nguồn dữ liệu giúp phát hiện việc tự thêm thông tin. Ngày và quy tắc cụ thể loại bỏ cách hiểu mơ hồ về “quá hạn”. Yêu cầu giải thích cả trường hợp bị loại giúp bạn kiểm tra mô hình có xét trạng thái và ranh giới ngày hay không. Tách đề xuất khỏi dữ kiện giúp tránh nhầm lời khuyên với thông tin đã được xác nhận.

Đổi tình huống bằng cách thay ngày, danh sách và quy tắc. Nếu chuyển sang hạn chót có giờ, hãy quy định thêm múi giờ trước khi đánh giá.

**Kết quả mong đợi và cách kiểm tra:** chỉ `T17` thuộc nhóm quá hạn; `T18` đã hoàn thành; `T19` đến hạn đúng ngày so sánh. Một lời đáp nghe trôi chảy nhưng liệt kê thêm `T18` hoặc `T19` vẫn không đạt. Nếu mô hình khẳng định đã truy cập hệ thống thật, kết quả cũng không đạt: bài tập chỉ cung cấp dữ liệu giả.

**Tiêu chí hoàn thành:** bạn vẽ đúng chiều đi và về của dữ liệu, chỉ rõ nơi kiểm tra quyền, mô tả được chức năng chỉ đọc và kiểm tra đúng ba công việc. Tôi chưa chạy lời nhắc này hay kiểm thử một hệ thống MCP; đây là bài tập bạn thực hiện. Việc thử lời nhắc cũng chưa chứng minh kết nối MCP hoạt động.

**9. Những ý quan trọng cần nhớ**

- Mô hình cần được cung cấp dữ liệu liên quan; khả năng sinh văn bản không tự tạo quyền truy cập.
- MCP chuẩn hóa kết nối giữa ứng dụng AI và các khả năng bên ngoài.
- Phân biệt mô hình đề xuất, ứng dụng điều phối và server thực thi.
- Công cụ, tài nguyên và mẫu lời nhắc có vai trò khác nhau.
- Kiểm tra dữ liệu đầu vào lẫn câu trả lời cuối cùng bằng tiêu chí cụ thể.

**10. Năm câu hỏi kiểm tra hiểu bài — chưa có đáp án**

1. Vì sao yêu cầu “hãy đọc cơ sở dữ liệu của tôi” chưa đủ để Claude trả lời bằng dữ liệu thật? Cần bổ sung những thành phần nào?
2. Một ứng dụng React gọi API Node.js trực tiếp để lấy công việc. Khi nào bạn cân nhắc thêm MCP, và lợi ích mong muốn là gì?
3. Trong luồng của ví dụ, mô hình đề xuất gọi `getMyTasks`. Những phần mềm nào tiếp tục xử lý để dữ liệu đến được mô hình?
4. Bạn muốn cung cấp tài liệu quy tắc trạng thái, chức năng đổi trạng thái và mẫu lập kế hoạch hằng tuần. Bạn sẽ thiết kế mỗi thứ thành loại nào trong ba thành phần MCP? Vì sao?
5. Công cụ trả đúng dữ liệu nhưng trợ lý kết luận một việc đã hoàn thành vẫn quá hạn. Bạn sẽ kiểm tra phần nào, và dùng trường hợp kiểm tra nào để xác nhận lỗi đã được sửa?

Đã học: phần nền tảng và thiết kế một luồng đọc dữ liệu. Chưa học: nội dung video từng bài, triển khai Python/TypeScript SDK, cấu hình kết nối, MCP Inspector và chi tiết từng loại thành phần. Tôi dừng ở đây để bạn trả lời hoặc hỏi thêm trước khi học phần tiếp theo.

**Nguồn thực sự đã sử dụng**

- [Trang tổng quan khóa học Anthropic: mục lục và About this course](https://anthropic.skilljar.com/introduction-to-model-context-protocol) — đọc qua extension và giao diện Chrome; chưa đọc nội dung từng bài.
- [MCP chính thức: What is the Model Context Protocol?](https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro) — định nghĩa và mục đích kết nối.
- [MCP chính thức: Architecture overview](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture) — vai trò host/client/server và luồng gọi công cụ.
- [MCP chính thức: Understanding MCP servers](https://modelcontextprotocol.io/docs/2026-07-28/learn/server-concepts) — đối chiếu tools, resources, prompts và quyền điều khiển.
