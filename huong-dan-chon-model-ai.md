# Hướng dẫn hiểu và chọn model AI trong Copilot và Ollama

Ngày đối chiếu: **20/09/2026**. Phạm vi: **25 dòng model có tên trong hai ảnh**, kèm mục **Auto** và dòng **Azure chưa hiện tên**. Tài liệu tập trung vào lập trình, học tập, phân tích tài liệu, suy luận và chạy AI trên máy cá nhân; không phải danh mục tất cả model AI trên thị trường.

## 1. Đọc tài liệu này như thế nào?

Mỗi model được giải thích theo ba lớp:

- **Thông tin xác minh:** tên, định hướng hoặc đặc tính có tài liệu chính thức hỗ trợ.
- **Thông tin từ ảnh:** context, Tools, Vision và credits mà giao diện của bạn đang hiển thị. Đây không nhất thiết là giới hạn của API gốc.
- **Gợi ý thực hành:** cách mình đề xuất dùng model cho công việc. Các ví dụ và thứ tự thử là nhận định ứng dụng, không phải kết quả đo tốc độ hoặc bảng xếp hạng đã chạy trên máy của bạn.

**“Tốt nhất” phải gắn với một tiêu chí.** Model viết code chính xác nhất chưa chắc trả lời nhanh nhất; model rẻ nhất mỗi token chưa chắc rẻ nhất để hoàn thành công việc. Trong tài liệu này, các bảng lựa chọn là **nhóm ứng viên nên thử trước**, không khẳng định vô địch tuyệt đối.

GitHub xác nhận các tên model cloud trong ảnh nằm trong danh sách hỗ trợ. Khả năng dùng thực tế còn tùy tài khoản, gói, chính sách và ứng dụng. [Nguồn: danh sách model GitHub Copilot](https://docs.github.com/en/copilot/reference/ai-models/supported-models).

## 2. Những khái niệm cần hiểu trước

### Model, provider và ứng dụng khác nhau

Hãy hình dung bạn thuê người làm việc:

- **Model** là bộ não: hiểu câu hỏi, sinh câu trả lời, đề xuất hành động.
- **Provider** là bên cung cấp đường truy cập đến bộ não đó.
- **Ứng dụng/agent** là nơi tổ chức công việc: đưa file vào, tìm code, chạy lệnh, kiểm tra kết quả.

Vì vậy Copilot, Azure và Ollama không phải ba model tương đương nhau. Cùng một model nhưng dùng trong hai ứng dụng có thể cho kết quả khác, vì một bên được đọc repository và chạy test, còn bên kia chỉ nhìn thấy đoạn code bạn dán.

### Context size — lượng thông tin trong một lần xử lý

Context giống diện tích bàn làm việc. Bàn lớn cho phép đặt nhiều tài liệu lên cùng lúc; không chứng minh người ngồi bàn giỏi hơn.

Token là đơn vị văn bản mà model xử lý, không có tỷ lệ cố định một token bằng một từ tiếng Việt. Context có thể chứa chỉ dẫn hệ thống, lịch sử hội thoại, code, kết quả công cụ và phần dành cho đầu ra, tùy API.

**1M context không đồng nghĩa:** nhớ vĩnh viễn, đọc toàn bộ repository tự động, hiểu đúng mọi chi tiết, hoặc sinh được một triệu token đầu ra. Giới hạn đầu ra thường riêng. Lịch sử dài cũng có thể bị ứng dụng tóm tắt hay cắt bớt.

Các số 131K và 128K đôi khi chỉ khác cách biểu diễn cùng khoảng 131.072 token; 33K và 32K cũng có thể là 32.768 token. Tuy nhiên không nên quy mọi chênh lệch cho làm tròn: phải kiểm tra tag và cấu hình thực tế.

### Tools — gọi công cụ

Model có thể đề nghị gọi một hàm như tìm file, đọc dữ liệu hoặc chạy test. **Ứng dụng mới là bên thực thi** và quyết định quyền truy cập. Huy hiệu Tools không tự tạo kết nối Internet, terminal hay database.

Ví dụ: để sửa lỗi React, model đề nghị đọc component → ứng dụng cung cấp nội dung → model tạo bản sửa → ứng dụng chạy test → model xem kết quả. Đây là vòng lặp của agent.

### Vision — hiểu hình ảnh

Vision thường nghĩa là nhận ảnh làm đầu vào rồi trả lời bằng văn bản. Bạn có thể gửi screenshot và hỏi vị trí sai layout. Nó **không đồng nghĩa tạo ảnh**, dựng video hay xử lý mọi định dạng file.

Ảnh chụp UI cũng không cho model biết DOM, CSS thực tế, state và sự kiện. Muốn sửa chính xác nên gửi ảnh cùng code liên quan và kích thước màn hình.

### Reasoning, mini, Flash và số lượng tham số

Reasoning là khả năng xử lý bài toán cần nhiều bước. Nếu có mức effort, tăng mức này có thể giúp bài khó nhưng làm tăng độ trễ và lượng token. Không cần bật mức cao nhất để đổi tên một biến.

Mini/Flash thường gợi ý định vị nhanh hoặc tiết kiệm, nhưng không phải chuẩn kỹ thuật chung giữa các hãng. Không so trực tiếp “mini của hãng A” với “Flash của hãng B” chỉ bằng tên.

Trong tên local, B là tỷ tham số, M là triệu tham số. `270m` khoảng 0,27B; **không phải 270B**. Tham số là các giá trị đã học, không phải dung lượng trí nhớ hội thoại. Model nhiều tham số hơn không luôn tốt hơn một model mới, chuyên đúng tác vụ.

### Quantization, MoE và bộ nhớ

Quantization giảm độ chính xác số học dùng lưu trọng số để tiết kiệm bộ nhớ; chất lượng và tốc độ thay đổi theo cách nén và phần cứng. MoE chỉ kích hoạt một phần các expert mỗi token, nhưng thường vẫn cần lưu/nạp tập trọng số lớn. “5B active” không có nghĩa tổng model chỉ chiếm bộ nhớ như model 5B.

Dung lượng tải về không phải tổng RAM/VRAM cần dùng. Khi chạy còn có cache cho context, bộ đệm và ứng dụng khác. Context càng dài thường càng tốn bộ nhớ.

### Open-weight và chạy local

Open-weight nghĩa là có thể tiếp cận trọng số theo giấy phép tương ứng. Nó không tự bảo đảm chạy nổi trên GPU cá nhân, cũng không đồng nghĩa mọi điều kiện sử dụng đều giống phần mềm mã nguồn mở thông thường.

Model chạy local có thể không bị tính phí API theo token, nhưng vẫn dùng điện, RAM/VRAM và thời gian. Tính riêng tư còn tùy ứng dụng có gửi nội dung tới công cụ hay dịch vụ bên ngoài không.

## 3. Danh sách model cloud trong ảnh

**Các con số trong bảng này được chép từ ảnh**, không quy đổi sang USD. `—` ở cột Out nghĩa là ảnh bị cắt, không phải miễn phí. Tất cả 17 dòng đều hiện Tools và Vision.

| Model | Context trong ảnh | Credits In / 1M token | Credits Out / 1M token |
|---|---:|---:|---:|
| Claude Haiku 4.5 | 160K | 100 | 500 |
| Claude Sonnet 5 | 1M | 200 | — |
| Gemini 3.5 Flash | 1M | 150 | 900 |
| Gemini 3.6 Flash | 1M | 75 | 375 |
| Gemini 3.7 Flash | 1M | 75 | 375 |
| Gemini 3.8 Flash | 1M | 75 | 375 |
| GPT-5 mini | 192K | 25 | 200 |
| GPT-5.3-Codex | 400K | 175 | — |
| GPT-5.4 | 1M | 250 | — |
| GPT-5.4 mini | 400K | 75 | 450 |
| GPT-5.6 Luna | 1M | 20 | 120 |
| GPT-5.6 Terra | 1M | 200 | — |
| Grok 4.5 | 553K | 200 | 600 |
| Grok 4.6 | 553K | 200 | 600 |
| Kimi K2.7 Code | 256K | 95 | 400 |
| Kimi K3 | 1M | 300 | — |
| MAI-Code-1.1-Flash | 256K | 20 | 120 |

Ảnh có biểu tượng cảnh báo cạnh Gemini 3.5 Flash, Gemini 3.6 Flash và Kimi K2.7 Code. Không đọc được tooltip nên không khẳng định ý nghĩa biểu tượng. Tuy nhiên, GitHub hiện ghi lịch ngừng ba model này ngày **02/10/2026**, lần lượt đề xuất Gemini 3.8 Flash và Kimi K3 thay thế. [Nguồn: lịch retirement của GitHub](https://docs.github.com/en/copilot/reference/ai-models/supported-models).

## 4. Giải thích từng model cloud

### 4.1. Claude Haiku 4.5

**Định hướng đã xác minh:** phản hồi nhanh, hỗ trợ lập trình và các tương tác cần độ trễ thấp. Anthropic định vị Haiku 4.5 cho những tình huống cần cân bằng chất lượng với chi phí. [Nguồn Anthropic](https://www.anthropic.com/news/claude-haiku-4-5).

**Mình đề xuất dùng khi:** hỏi ý nghĩa lỗi TypeScript, viết hàm tiện ích, giải thích một đoạn code, sửa một component nhỏ hoặc tạo bản nháp tài liệu. Việc càng rõ đầu vào và đầu ra càng dễ đánh giá kết quả.

**Ví dụ:** “Viết hàm chuẩn hóa từ khóa tìm kiếm. Giữ dấu tiếng Việt, bỏ khoảng trắng thừa, chuyển chữ thường. Cho ví dụ với chuỗi rỗng và khoảng trắng liên tiếp.”

**Cách dùng hiệu quả:** đưa một việc cụ thể và yêu cầu kết quả ngắn. Với bài học, yêu cầu giải thích một khái niệm rồi đưa bài tập kiểm tra thay vì hỏi cả chương.

**Khi nên đổi model:** sau vài lượt vẫn không xác định được nguyên nhân lỗi liên quan nhiều tầng. Đừng để ưu tiên phản hồi nhanh biến thành nhiều vòng sửa sai. Context trong giao diện của bạn là 160K; không dùng số này để kết luận giới hạn API Anthropic.

### 4.2. Claude Sonnet 5

**Định hướng đã xác minh:** GitHub xếp vào nhóm coding và agent đa dụng. [Nguồn GitHub](https://docs.github.com/en/copilot/reference/ai-models/model-comparison). Model card riêng không tải được trong lần đối chiếu này, nên không gán điểm benchmark hoặc mức vượt trội so với các đối thủ.

**Mình đề xuất thử cho:** phát triển tính năng có nhiều yêu cầu liên quan nhau: form, validation, trạng thái loading/error, accessibility và test. Với frontend, đây là ứng viên để giao một nhiệm vụ hoàn chỉnh rồi review phần thay đổi.

**Ví dụ:** “Thêm form chỉnh sửa hồ sơ vào cấu trúc hiện có. Đọc component và API contract trước, tái sử dụng UI hiện có, xử lý lỗi theo từng trường và kiểm tra thao tác bàn phím.”

**Cách dùng hiệu quả:** nêu rõ tiêu chí nghiệm thu và yêu cầu model chỉ ra các file đã đọc. Nếu cần quyết định kiến trúc, yêu cầu so sánh phương án dựa trên ràng buộc cụ thể của dự án.

**Giới hạn:** không có cơ sở từ ảnh để gọi Sonnet 5 là model làm UI đẹp nhất hay viết tiếng Việt tốt nhất. Chất lượng thiết kế còn phụ thuộc ảnh mẫu, design system và khả năng xem kết quả render.

### 4.3. Gemini 3.5 Flash

**Định hướng đã xác minh:** model đa phương thức có suy luận và các mức thinking; model gốc nhận văn bản, ảnh, âm thanh, video, context tới 1M. [Model card Google](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-5-Flash-Model-Card.pdf).

**Mình đề xuất dùng khi:** bạn có workflow cũ đang cho kết quả ổn và muốn giữ một mốc so sánh khi chuyển phiên bản. Có thể thử với phân tích yêu cầu, giải thích code và tóm tắt tài liệu theo cấu trúc.

**Ví dụ:** “Từ tài liệu này, lập bảng endpoint gồm method, path, request và response. Chỉ ghi điều có trong tài liệu; thiếu thì ghi chưa nêu.”

**Giới hạn thực tế:** việc model gốc hỗ trợ audio/video không chứng minh ô chat Copilot hiện tại nhận được các file đó. Ảnh chỉ xác nhận Tools và Vision.

**Nên chọn mới hay giữ lại?** Với workflow mới, mình sẽ thử 3.8 Flash trước: trong ảnh 3.5 có giá token cao hơn và đã có lịch retirement. Đây là lý do vận hành và chi phí, không phải kết luận rằng 3.5 thua mọi bài kiểm tra.

### 4.4. Gemini 3.6 Flash

**Định hướng đã xác minh:** Google mô tả đây là model làm việc đa dụng, cải thiện coding, xử lý tri thức, đa phương thức và hiệu quả token so với 3.5 Flash. Đây là mô tả của nhà cung cấp. [Model card Google](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-6-Flash-Model-Card.pdf).

**Mình đề xuất thử cho:** đọc tài liệu kỹ thuật rồi biến thành checklist triển khai; phân tích một nhóm file; tóm tắt log có cấu trúc. Cần tách rõ điều model đọc được với giả thuyết của nó.

**Ví dụ:** “Đọc các log sau, nhóm theo requestId, chỉ ra request thất bại đầu tiên và ba thông tin còn thiếu để xác định nguyên nhân.”

**Cách dùng:** yêu cầu trích vị trí của thông tin trong đầu vào, thay vì chỉ nhận một bản tóm tắt trôi chảy. Với code, chia nhiệm vụ thành tìm vị trí → sửa → kiểm tra.

**Giới hạn:** context lớn không bảo đảm tìm đúng mọi chi tiết trong tài liệu rất dài. Do đã có lịch retirement, không nên xây quy trình mới phụ thuộc riêng phiên bản này nếu 3.8 đáp ứng được yêu cầu.

### 4.5. Gemini 3.7 Flash

**Định hướng đã xác minh:** Google nêu cải tiến nền tảng reasoning và khả năng hiểu video trong workflow agent; có cấu hình thinking. [Model card Google](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-7-Flash-Model-Card.pdf).

**Mình đề xuất thử cho:** phân tích screenshot UI, đối chiếu ảnh với mô tả yêu cầu, hoặc xử lý chuỗi ảnh thể hiện các bước tái hiện lỗi. Nếu nền tảng có nhận video, có thể dùng bản quay màn hình để mô tả trình tự gây lỗi.

**Ví dụ:** “Ảnh A là thiết kế, ảnh B là bản triển khai. Liệt kê chênh lệch về căn lề, cỡ chữ và khoảng cách. Phân biệt điều nhìn thấy với điều phải kiểm tra trong CSS.”

**Cách dùng:** đánh số ảnh, ghi viewport và zoom; gửi code liên quan sau khi model xác định được vùng cần sửa.

**Giới hạn:** không suy ra đây là model vision tốt nhất thị trường. Khả năng video trong model card chỉ hữu dụng nếu provider và ứng dụng hỗ trợ đường truyền dữ liệu đó. Với cùng giá trong ảnh, hãy thử cả 3.7 và 3.8 trên vài lỗi UI thật trước khi quyết định.

### 4.6. Gemini 3.8 Flash

**Định hướng đã xác minh:** Google nêu cải tiến software engineering và workflow agent xử lý tri thức; có mức effort điều chỉnh chất lượng, giá và độ trễ. Model card cũng thừa nhận có thể chậm, timeout hoặc dùng nhiều token hơn khi effort cao. [Model card Google](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-8-Flash-Model-Card.pdf).

**Mình đề xuất làm ứng viên mặc định trong nhóm Gemini của ảnh:** xử lý yêu cầu dài, hỗ trợ code và tổng hợp tài liệu. Giá hiển thị bằng 3.6/3.7 và đây là phiên bản thay thế được GitHub đề xuất cho 3.5/3.6.

**Ví dụ:** “Đọc đặc tả và component hiện tại, thêm bộ lọc sản phẩm. Dùng lại cơ chế query hiện có, lưu trạng thái bộ lọc trong URL và kiểm tra refresh trang.”

**Cách dùng:** bắt đầu với effort thông thường. Nếu kết quả thiếu logic, tăng effort và bổ sung dữ liệu tái hiện lỗi. Không tăng context chỉ vì nó có sẵn.

**Giới hạn:** “Flash” không cam kết mọi yêu cầu đều nhanh. Model vẫn có thể trả lời sai hoặc tự suy diễn phần đặc tả còn thiếu. Hãy kiểm tra kết quả bằng hành vi thực tế của ứng dụng.

### 4.7. GPT-5 mini

**Định hướng đã xác minh:** GitHub đề xuất cho coding và viết nội dung đa dụng. [Nguồn GitHub](https://docs.github.com/en/copilot/reference/ai-models/model-comparison).

**Mình đề xuất dùng khi:** cần giải thích một lỗi, viết code có phạm vi nhỏ, tóm tắt diff hoặc luyện kiến thức lập trình. Giá trong ảnh thuộc nhóm thấp, nhưng vẫn cao hơn Luna theo cả In và Out.

**Ví dụ:** “Giải thích stale closure trong đoạn React này. Chỉ ra giá trị nào bị cũ và viết hai cách sửa, nêu trường hợp dùng từng cách.”

**Cách dùng:** đưa ví dụ cụ thể và yêu cầu phân biệt đầu ra kỳ vọng với hiện tại. Nếu học NestJS hoặc Java, yêu cầu so sánh với khái niệm JavaScript bạn đã biết sẽ dễ tiếp thu hơn.

**Giới hạn:** không suy ra mọi model có số phiên bản lớn hơn sẽ luôn phù hợp hơn. Nếu GPT-5 mini giải đúng, nhanh và ổn định trên tập việc của bạn, không bắt buộc đổi. Nhưng khi vấn đề trải qua nhiều file hoặc có nhiều giả thuyết cạnh tranh, nên thử thêm một ứng viên chuyên nhiệm vụ dài.

### 4.8. GPT-5.3-Codex

**Định hướng đã xác minh:** model dành cho agent lập trình, kết hợp xử lý code với suy luận và công cụ cho công việc kéo dài nhiều bước. [System card OpenAI](https://deploymentsafety.openai.com/gpt-5-3-codex).

**Mình đề xuất dùng khi:** muốn AI thực hiện công việc trong repository: tìm nguyên nhân, sửa code, bổ sung kiểm tra phù hợp và báo kết quả. Đây là một lựa chọn nên thử sớm cho bug hoặc feature liên quan nhiều file.

**Ví dụ:** “Tìm nguyên nhân refresh trang làm mất trạng thái đăng nhập. Lần theo khởi tạo client, gọi refresh token và cập nhật store. Sửa nguyên nhân gốc, kiểm tra luồng thành công và refresh thất bại.”

**Cách dùng:** cung cấp tiêu chí nghiệm thu, lệnh chạy dự án và các ràng buộc. Để agent đọc cấu trúc trước khi yêu cầu sửa.

**Giới hạn:** chọn tên Codex trong model picker không tự cấp terminal hay quyền sửa file. Không có công cụ thì nó vẫn chỉ đề xuất bằng văn bản. “Mạnh nhất tại thời điểm ra mắt” trong tài liệu cũ không có nghĩa dẫn đầu tại ngày bạn đọc tài liệu này.

### 4.9. GPT-5.4

**Định hướng đã xác minh:** GitHub xếp vào nhóm suy luận và debug chuyên sâu; OpenAI có system card riêng cho GPT-5.4 Thinking. [GitHub](https://docs.github.com/en/copilot/reference/ai-models/model-comparison), [OpenAI](https://deploymentsafety.openai.com/gpt-5-4-thinking/introduction).

**Mình đề xuất thử cho:** quyết định kiến trúc, lỗi khó tái hiện và bài toán có nhiều ràng buộc. Có thể dùng như người phản biện phương án trước khi triển khai.

**Ví dụ:** “So sánh ba cách quản lý trạng thái xác thực trong ứng dụng này. Đánh giá SSR, refresh token đồng thời, mất kết nối và độ khó kiểm thử. Kết luận theo yêu cầu đã cho.”

**Cách dùng:** đưa dữ kiện thật, yêu cầu nêu giả định và cách kiểm chứng giả thuyết. Hỏi “cần đo thêm gì?” thường hữu ích hơn yêu cầu model đoán nguyên nhân ngay.

**Giới hạn:** trong ảnh, In khá cao. Không nhất thiết dùng cho mọi thao tác nhỏ. Suy luận sâu trên dữ kiện sai vẫn có thể dẫn tới đáp án sai; phải kiểm tra log, code và môi trường trước khi tin vào một lời giải thích thuyết phục.

### 4.10. GPT-5.4 mini

**Định hướng đã xác minh:** GitHub nhấn mạnh khả năng khám phá codebase, đặc biệt khi có công cụ tìm kiếm code. [Nguồn GitHub](https://docs.github.com/en/copilot/reference/ai-models/model-comparison).

**Mình đề xuất dùng như bước khảo sát:** tìm nơi khai báo API, lần theo một event handler, lập danh sách file cần đọc hoặc tìm các chỗ dùng một type trước khi refactor.

**Ví dụ:** “Tìm tất cả nơi tạo và xóa notification. Với mỗi nơi, ghi file, hàm, điều kiện gọi và dữ liệu liên quan. Chưa sửa code.”

**Cách dùng:** yêu cầu kết quả có đường dẫn và bằng chứng. Khi đã xác định phạm vi, có thể tiếp tục giao một bản sửa nhỏ hoặc đưa báo cáo cho model khác giải quyết phần khó.

**Giới hạn:** không phải cứ có context 400K là ứng dụng tự gửi đủ file vào. Nếu model không có công cụ tìm kiếm, bạn phải cung cấp code. Giá theo ảnh cao hơn Luna; muốn biết có đáng dùng hơn phải đo độ chính xác khi tìm file và số vòng hỏi lại trên repository của bạn.

### 4.11. GPT-5.6 Luna

**Định hướng đã xác minh:** trong họ GPT-5.6, OpenAI định vị Luna ưu tiên tốc độ và hiệu quả chi phí; Terra là lựa chọn năng lực cao hơn với chi phí thấp hơn flagship Sol. [System card GPT-5.6](https://deploymentsafety.openai.com/gpt-5-6/gpt-5-6.pdf).

**Mình đề xuất dùng đầu tiên cho việc nhỏ:** tạo type từ một JSON mẫu, thêm trạng thái loading, sửa lỗi import, viết helper hoặc tóm tắt một diff ngắn.

**Ví dụ:** “Từ response này, tạo TypeScript type. Trường nào chưa xác định được kiểu thì giải thích; không tự thêm thuộc tính.”

**Cách dùng:** giao từng phần rõ ràng, giới hạn phạm vi sửa, yêu cầu đầu ra gọn. Với thao tác lặp lại, đưa một mẫu đã đúng để model làm theo.

**Giới hạn:** 1M context trong ảnh không đồng nghĩa ngang Terra về khả năng xử lý bài khó. Nếu phải sửa đi sửa lại hoặc phát hiện model bỏ qua ràng buộc, chuyển sang model khác và cung cấp bản tóm tắt vấn đề.

**Điểm đáng chú ý từ ảnh:** Luna và MAI có cùng đơn giá 20 In / 120 Out, thấp nhất trong các hàng nhìn đủ giá. Điều này chưa xác định ai hoàn thành công việc rẻ hơn.

### 4.12. GPT-5.6 Terra

**Định hướng đã xác minh:** Terra là một thành viên của họ GPT-5.6; GitHub định vị cho coding tương tác và agent hằng ngày. [System card OpenAI](https://deploymentsafety.openai.com/gpt-5-6/gpt-5-6.pdf), [GitHub](https://docs.github.com/en/copilot/reference/ai-models/model-comparison).

**Mình đề xuất làm một ứng viên mặc định cho công việc thực tế:** tính năng liên quan vài file, sửa lỗi vừa phải, bổ sung test và review phần thay đổi.

**Ví dụ:** “Thêm phân trang cho danh sách bài viết, giữ cơ chế cache hiện có, xử lý tải thêm thất bại và tránh hiển thị trùng bản ghi.”

**Cách dùng:** đưa mục tiêu cùng hành vi mong muốn. Cho phép model đọc code liên quan, rồi đánh giá bản sửa dựa trên test và thao tác UI, không chỉ phần giải thích.

**Giới hạn:** theo giá In trong ảnh, Terra gấp 10 lần Luna nếu cùng số token đầu vào. Đây không phải chênh lệch tổng chi phí, vì Out bị cắt và mỗi model có thể dùng số token khác nhau. Nên dành Terra cho công việc mà độ chính xác bổ sung có giá trị rõ ràng.

### 4.13. Grok 4.5

**Định hướng đã xác minh:** GitHub xếp Grok 4.5 trong nhóm coding và agent đa dụng. [Nguồn GitHub](https://docs.github.com/en/copilot/reference/ai-models/model-comparison). Model card được liên kết là PDF không trích được nội dung trong lần đọc này; không có đủ dữ liệu để nêu ưu thế benchmark riêng.

**Mình đề xuất thử như một góc nhìn thứ hai:** phản biện giải pháp hoặc tìm edge case mà bản sửa đầu tiên chưa xét.

**Ví dụ:** “Review thuật toán đồng bộ này. Tìm tình huống hai request hoàn thành ngược thứ tự. Với mỗi lỗi nghi ngờ, đưa chuỗi sự kiện tái hiện cụ thể.”

**Cách dùng:** đưa bài toán gốc và bản sửa; yêu cầu chứng minh bằng ví dụ. Đừng chỉ hỏi “bạn có đồng ý với model kia không?” vì câu hỏi đó có thể dẫn câu trả lời theo kết luận sẵn có.

**Giới hạn:** thương hiệu Grok không đồng nghĩa model trong Copilot tự được truy cập X hoặc tìm kiếm web thời gian thực. Phải kiểm tra công cụ của phiên làm việc. Ảnh không cung cấp cơ sở để xếp 4.5 cao hơn hoặc thấp hơn 4.6 về tốc độ thực tế.

### 4.14. Grok 4.6

**Thông tin đã xác minh:** xAI có model card cho Grok 4.6 với các phần đánh giá coding, công việc tri thức, kỹ thuật và khả năng tìm kiếm. [Model card xAI](https://media.x.ai/v1/website/card-4p6-4cd2dc57.pdf).

**Mình đề xuất thử cho:** phân tích một lỗi có nhiều giả thuyết, phản biện thiết kế và kiểm tra độ đầy đủ của test. Nếu so với Grok 4.5, dùng cùng đề bài và cùng công cụ để lựa chọn.

**Ví dụ:** “Có lỗi duplicate message trong chat. Tách giả thuyết do listener đăng ký nhiều lần, retry từ client và server phát lặp. Đề xuất log phân biệt từng giả thuyết trước khi sửa.”

**Cách dùng:** yêu cầu kết luận có điều kiện: thấy bằng chứng nào thì chọn cách sửa nào. Với số liệu, cho công cụ tính hoặc đưa kết quả tính được kiểm chứng.

**Giới hạn:** việc model card có phần đánh giá search không có nghĩa model trong Copilot đang bật search. Cũng không thể dùng các benchmark khác điều kiện chạy để khẳng định nó hơn mọi model còn lại. Hai phiên bản Grok có cùng giá hiển thị trong ảnh, nên chất lượng công việc thực tế là tiêu chí quyết định tốt hơn số phiên bản.

### 4.15. Kimi K2.7 Code

**Định hướng đã xác minh:** Moonshot mô tả model chuyên agent lập trình, xây trên K2.6, cải thiện công việc dài và hiệu quả token. Model card ghi kiến trúc MoE, tổng 1T tham số, 32B kích hoạt và context 256K. [Model card Moonshot](https://huggingface.co/moonshotai/Kimi-K2.7-Code).

**Mình đề xuất thử cho:** công việc cần đọc, sửa và kiểm tra nhiều lượt, nhưng vẫn khoanh vùng được trong một module.

**Ví dụ:** “Chuẩn hóa xử lý lỗi API ở module sản phẩm. Tìm các cách xử lý hiện tại, chọn một kiểu chung, cập nhật nơi gọi và kiểm tra các trạng thái lỗi.”

**Cách dùng:** cung cấp quy ước dự án và yêu cầu giữ hành vi công khai. Đánh giá diff để phát hiện những thay đổi ngoài phạm vi.

**Giới hạn:** open-weight không có nghĩa tải về là chạy gọn trên GPU 24GB. Tổng trọng số rất lớn dù chỉ một phần được kích hoạt mỗi token. Hàng trong ảnh là truy cập qua provider, không phải bản local nhỏ. Do đã có lịch retirement trên Copilot, nên dùng làm mốc so sánh khi chuyển sang K3 thay vì chọn cho workflow dài hạn mới.

### 4.16. Kimi K3

**Định hướng đã xác minh:** Moonshot mô tả model open-weight đa phương thức, hướng tới agent và công việc dài; công bố 2,8T tổng tham số, 104B kích hoạt, context khoảng 1M. [Model card Moonshot](https://huggingface.co/moonshotai/Kimi-K3).

**Mình đề xuất thử cho:** khảo sát repository lớn hoặc triển khai tính năng đi qua nhiều lớp. Đây là ứng viên cho tác vụ dài, không phải lựa chọn mặc định để đổi một dòng CSS.

**Ví dụ:** “Lần theo tính năng thông báo từ API tới socket và UI. Lập bản đồ luồng dữ liệu, tìm chỗ có thể mất sự kiện, rồi sửa vấn đề có bằng chứng rõ nhất.”

**Cách dùng:** đặt mốc kiểm tra cho công việc dài: khảo sát → phương án → triển khai → kiểm chứng. Yêu cầu mỗi kết luận chỉ ra file hoặc dữ liệu chứng minh.

**Giới hạn:** không phù hợp để mặc định coi là model local cho máy cá nhân chỉ vì trọng số mở. Context lớn và model lớn không tự bảo đảm hoàn thành nhiệm vụ chính xác. Giá In cao nhất trong ảnh cũng không có nghĩa tổng chi phí luôn cao nhất: cần đo cả số token, số lần retry và tỷ lệ thành công.

### 4.17. MAI-Code-1.1-Flash

**Định hướng đã xác minh:** model coding của Microsoft nhận văn bản/ảnh, đầu ra văn bản, context 256K. Model card nêu MoE 138B tổng và 5B kích hoạt, được huấn luyện với môi trường công cụ Copilot. [Model card Microsoft](https://microsoft.ai/pdf/MAI-Code-1.1-Flash-Model-Card.PDF).

**Mình đề xuất thử cùng Luna cho công việc hằng ngày:** tìm code, viết helper, giải thích repository, sửa component và refactor nhỏ. Giá trong ảnh thuộc nhóm thấp nhất.

**Ví dụ:** “Tìm component hiển thị danh sách bình luận, thêm empty state theo UI hiện có và giữ nguyên xử lý phân trang.”

**Cách dùng:** tận dụng công cụ đọc/tìm file và cung cấp tiêu chí cụ thể. Nếu gửi screenshot, kèm code và yêu cầu nêu phần nào chưa thể kết luận chỉ từ ảnh.

**Giới hạn:** model card ghi ngôn ngữ hỗ trợ là English; không có nghĩa không thể trả lời tiếng Việt, nhưng cần tự đánh giá chất lượng giảng giải tiếng Việt. Con số 5B active không làm model này tương đương một model local 5B. Không có dữ liệu trong ảnh để kết luận nó nhanh hơn Luna.

## 5. Danh sách model local trong ảnh

Thông tin context ở cột thứ hai là **từ ảnh**. Định danh `latest` ở cột cuối là **ánh xạ trên registry khi tra cứu**, không chứng minh bản cài trên máy bạn chưa từng được tùy chỉnh.

| Dòng trong ảnh | Context ảnh | Tools trong ảnh | Định danh cần hiểu |
|---|---:|---|---|
| `deepseek-coder-v2:latest` | 164K | Không hiện | Registry hiện trỏ bản 16B |
| `deepseek-r1:1.5b` | 131K | Có | Bản distilled nhỏ, không phải R1 đầy đủ |
| `gemma3:270m` | 33K | Không hiện | Model văn bản khoảng 270 triệu tham số |
| `gpt-oss:20b` | 131K | Có | Bản 20B |
| `gpt-oss:latest` | 131K | Có | Registry hiện cùng bản 20B |
| `llama3.2:latest` | 131K | Có | Registry hiện bản 3B text-only |
| `phi3:latest` | 131K | Không hiện | Registry hiện bản 3,8B |
| `qwen:latest` | 33K | Không hiện | Registry hiện Qwen 1.5 bản 4B |

Nguồn cho ánh xạ tag: [DeepSeek Coder](https://ollama.com/library/deepseek-coder-v2), [GPT-OSS](https://ollama.com/library/gpt-oss), [Llama 3.2](https://ollama.com/library/llama3.2), [Phi-3](https://ollama.com/library/phi3), [Qwen](https://ollama.com/library/qwen).

### 5.1. deepseek-coder-v2:latest

**Bản chất:** dòng model chuyên code theo kiến trúc MoE. Registry đang gắn `latest` với bản 16B, tệp tải khoảng 8,9GB. [Nguồn Ollama](https://ollama.com/library/deepseek-coder-v2).

**Mình đề xuất thử cho:** viết hàm, chuyển đổi code, giải thích thuật toán và sửa lỗi trong file nhỏ khi muốn chạy local. Ví dụ: đưa một hàm xử lý cây bình luận, yêu cầu phát hiện vòng lặp và đề xuất cách tránh đệ quy vô hạn.

**Cách dùng:** cung cấp chữ ký hàm, input/output mẫu và trường hợp biên. Chạy code được sinh ra để kiểm tra; đừng chỉ đọc lời giải thích.

**Giới hạn:** không gán chất lượng của bản 236B cho bản 16B. Kiến thức thư viện mới cần bổ sung tài liệu. Không có huy hiệu Tools trong ảnh, nên không mặc định nó dùng được agent nhiều bước trong tích hợp hiện tại.

**Vai trò đề xuất:** ứng viên coding local trong danh sách này. Cần so trực tiếp với GPT-OSS 20B trên code của bạn mới biết ai phù hợp hơn.

### 5.2. deepseek-r1:1.5b

**Bản chất:** bản DeepSeek-R1-Distill-Qwen-1.5B. Distillation là huấn luyện model nhỏ từ dữ liệu/kiểu giải bài của model lớn; không phải nén nguyên sức mạnh model lớn vào file nhỏ. [Nguồn Ollama](https://ollama.com/library/deepseek-r1:1.5b).

**Mình đề xuất thử cho:** học cách model suy luận, bài logic nhỏ, bài toán có đáp án dễ kiểm tra và thử chạy AI trên máy hạn chế bộ nhớ.

**Ví dụ:** “Một hàm duyệt mảng và kiểm tra Set ở mỗi vòng. Giải thích độ phức tạp tổng, phân biệt một lần tra cứu với cả vòng lặp.”

**Cách dùng:** giao bài ngắn, yêu cầu kết luận và kiểm chứng bằng ví dụ. Nếu câu trả lời dài mà không tới kết quả, giới hạn độ dài hoặc đổi model.

**Giới hạn:** không dùng thành tích R1 đầy đủ để quảng bá bản 1.5B. Huy hiệu Tools cần được kiểm tra bằng một tác vụ gọi hàm thật trong ứng dụng; không chứng minh độ tin cậy của agent. Không nên giao review kiến trúc quan trọng mà không đối chiếu.

### 5.3. gemma3:270m

**Bản chất:** model cực nhỏ, **text-only**, context 32K theo trang tag. Những bản Gemma 3 lớn hơn có vision không làm bản 270M có vision. [Nguồn Ollama](https://ollama.com/library/gemma3:270m).

**Mình đề xuất dùng như bài thực hành:** đo tốc độ inference, thử phân loại nhãn đơn giản, kiểm tra prompt hoặc tìm hiểu fine-tuning cho nhiệm vụ rất hẹp. Nhiệm vụ như phân loại thường cần đánh giá và có thể cần tinh chỉnh; không bảo đảm dùng ngay là chính xác.

**Ví dụ:** “Chọn đúng một nhãn: lỗi giao diện, lỗi đăng nhập, lỗi thanh toán. Nội dung: nút xác nhận bị che ở màn hình nhỏ.”

**Cách dùng:** ít nhãn, quy tắc rõ, đầu ra ngắn, có tập kiểm thử giữ riêng. Với văn bản tiếng Việt, kiểm tra riêng thay vì suy chất lượng từ tên họ Gemma.

**Giới hạn:** không chọn làm gia sư kiến thức tổng quát, kiến trúc sư phần mềm hay công cụ đọc ảnh. Ưu điểm kích thước nhỏ không bù cho năng lực hạn chế trên bài phức tạp.

### 5.4. gpt-oss:20b

**Bản chất:** model open-weight hướng tới suy luận và tác vụ agent, hỗ trợ công cụ; registry ghi tệp khoảng 14GB. [Nguồn Ollama](https://ollama.com/library/gpt-oss).

**Mình đề xuất thử đầu tiên khi cần trợ lý local đa dụng trong danh sách:** giải thích code, phân tích tài liệu có sẵn, thử RAG hoặc agent với công cụ đơn giản.

**Ví dụ:** “Dựa riêng vào ba đoạn tài liệu được cung cấp, giải thích quy trình đăng nhập. Trích tên đoạn hỗ trợ từng kết luận; câu nào không có dữ liệu thì nói chưa biết.”

**Cách dùng:** bắt đầu với context vừa phải và một công cụ dễ kiểm tra; đo RAM/VRAM trước khi tăng độ dài. Trong RAG, đánh giá cả việc truy xuất đúng tài liệu lẫn việc trả lời đúng.

**Giới hạn:** đây là model văn bản, không phải bản GPT cloud đổi tên. Máy GPU 24GB có thể là cấu hình đáng thử, nhưng chưa thể cam kết tốc độ hoặc context tối đa nếu chưa biết GPU, RAM, runtime và các ứng dụng đang chạy.

### 5.5. gpt-oss:latest

**Bản chất:** tại thời điểm tra cứu, alias này trỏ cùng bản 20B trên Ollama. Nó không mặc nhiên là bản 120B hoặc một model mới mạnh hơn. [Nguồn Ollama](https://ollama.com/library/gpt-oss).

**Công dụng:** nếu hai tag trên máy có cùng model ID và cấu hình, cách sử dụng tương tự mục 5.4. Không cần xem chúng là hai đối thủ độc lập trong bảng đánh giá.

**Cách kiểm tra đề xuất:** xem danh sách model và đối chiếu ID; sau đó xem thông tin tag. Nếu hai mục khác cấu hình context hoặc template, kết quả vẫn có thể khác dù trọng số giống nhau.

**Khi nên dùng tag rõ:** tài liệu hướng dẫn, script và thí nghiệm cần ghi `20b` cùng ID/model digest đã thử, để tránh hiểu lầm do `latest` thay đổi. Tag kích thước rõ cũng không phải cam kết phiên bản bất biến vĩnh viễn.

**Giới hạn:** danh sách ở ảnh không đủ để kết luận hai tag đang chiếm gấp đôi dung lượng ổ đĩa; cơ chế lưu trữ có thể dùng chung dữ liệu.

### 5.6. llama3.2:latest

**Bản chất:** registry hiện trỏ bản 3B văn bản. Dòng 1B/3B hướng tới hội thoại, tóm tắt và truy xuất; tiếng Việt không nằm trong tám ngôn ngữ hỗ trợ chính thức được liệt kê. [Nguồn Ollama](https://ollama.com/library/llama3.2).

**Mình đề xuất thử cho:** chatbot local nhẹ, viết lại câu, tóm tắt đoạn ngắn hoặc hỏi đáp từ ít tài liệu. Phù hợp để học cách kết nối model với ứng dụng trước khi tối ưu chất lượng.

**Ví dụ:** “Tóm tắt đoạn hướng dẫn này thành năm bước, giữ nguyên tên lệnh, không bổ sung bước không có trong văn bản.”

**Cách dùng:** nội dung ngắn, đầu ra rõ, yêu cầu không suy diễn. Nếu dùng tiếng Việt, tạo tập câu hỏi tiếng Việt của chính bạn để kiểm tra.

**Giới hạn:** không nhầm với Llama 3.2 Vision. Không có cơ sở để coi bản 3B là lựa chọn hàng đầu cho lập trình phức tạp chỉ vì context ghi 131K. Tóm tắt dài cần đối chiếu để phát hiện chi tiết bị bỏ sót.

### 5.7. phi3:latest

**Bản chất:** registry hiện bản Phi-3 3,8B. Tài liệu định hướng môi trường hạn chế tài nguyên, suy luận và sử dụng tiếng Anh. [Nguồn Ollama](https://ollama.com/library/phi3).

**Mình đề xuất thử cho:** bài logic nhỏ, giải thích code ngắn, chatbot tiếng Anh nhẹ hoặc thí nghiệm local để so sánh với Llama 3.2.

**Ví dụ:** “Given this function and these inputs, predict each output, then identify one edge case the function does not handle.”

**Cách dùng:** nếu câu hỏi tiếng Việt bị hiểu sai, thử diễn đạt lại bằng tiếng Anh và so sánh. Đây là cách thử nghiệm, không phải bảo đảm cải thiện.

**Giới hạn:** Phi-3 có nhiều biến thể context; trang tổng quan còn chứa chỉ dẫn cho các tag khác nhau. Kiểm tra đúng model đang cài thay vì áp một con số cho cả họ Phi. Không coi kiến thức package hoặc framework mới là đã cập nhật.

**Vai trò đề xuất:** model nhỏ để học và làm baseline. Muốn dùng làm trợ lý chính, hãy kiểm tra độ chính xác trên tác vụ thực tế trước.

### 5.8. qwen:latest

**Bản chất:** tên registry `qwen` ở đây là **Qwen 1.5**, `latest` hiện trỏ bản **4B**; không đồng nghĩa phiên bản Qwen mới nhất trong toàn bộ họ model. [Nguồn Ollama](https://ollama.com/library/qwen).

**Mình đề xuất dùng khi:** bạn muốn kiểm tra ứng dụng local, so sánh với một baseline cũ hoặc đang có workflow đã ổn với tag này.

**Ví dụ:** “Đọc đoạn mô tả sản phẩm, trả về ba trường name, category và summary. Không có thông tin thì dùng null.”

**Cách dùng:** kiểm tra schema đầu ra bằng code; model sinh JSON có vẻ đúng chưa bảo đảm dữ liệu bên trong đúng. Nếu chọn một model Qwen khác, ghi đủ tên dòng và kích thước rồi đánh giá lại.

**Giới hạn:** đừng đưa benchmark Qwen2.5, Qwen3 hay một bản Coder mới để mô tả `qwen:latest`. Khả năng tiếng Việt, code và tool calling đều phải kiểm tra trên đúng bản. Trong danh sách này, mình không ưu tiên tag cũ này làm trợ lý code chính khi chưa so với các lựa chọn khác.

## 6. Auto, Azure và Ollama (Deprecated)

### Auto không phải một model riêng

Auto là lựa chọn để hệ thống định tuyến model. Nó thích hợp khi bạn muốn tập trung vào công việc thay vì chọn thủ công. Muốn benchmark, chọn model cụ thể và ghi lại tên vì Auto có thể đổi lựa chọn. [Nguồn GitHub](https://docs.github.com/en/copilot/reference/ai-models/model-comparison).

### Dòng Azure chưa hiện tên

Ảnh chỉ cho thấy context 144K và Tools/Vision. **Không đủ dữ liệu để xác định model**. Azure có thể cung cấp nhiều model hoặc deployment với tên riêng; không đoán đó là GPT, Phi hay một dòng cụ thể chỉ từ context.

Để xác định, cần tên model trong cấu hình provider, deployment hoặc trang quản lý tương ứng. Vì thiếu định danh, dòng này được ghi nhận nhưng không đưa vào xếp hạng.

### Ollama (Deprecated)

Nhãn này xuất hiện ở cấp tích hợp/provider. Nó không chứng minh toàn bộ model đã cài bị ngừng phát triển hoặc không thể chạy. Cần xem hướng dẫn Migrate của tích hợp cụ thể trước khi thay cấu hình; ảnh không đủ để xác định lộ trình migration.

## 7. Model nào hiệu suất cao nhất cho từng việc?

### Phải tách bốn tiêu chí

| Tiêu chí | Cách đo có ý nghĩa |
|---|---|
| Chất lượng | Tỷ lệ nhiệm vụ hoàn thành đúng, lỗi còn lại, mức đáp ứng yêu cầu |
| Tốc độ | Thời gian tới kết quả đã dùng được, không chỉ thời gian ra chữ đầu |
| Hiệu quả chi phí | Tổng credits hoặc chi phí vận hành cho một nhiệm vụ thành công |
| Khả năng chạy trên máy | Bộ nhớ, độ ổn định, tốc độ với context bạn cần |

**Chưa có phép thử chung cho toàn bộ 25 dòng trên cùng môi trường**, nên chưa thể chỉ ra một model “cao nhất” có căn cứ cho mọi lĩnh vực. Bảng dưới là đề xuất chọn ứng viên từ đặc tính đã đối chiếu và giá trong ảnh; thứ tự tên trong một ô không phải thứ hạng benchmark.

### Nhóm nên thử trước trong chính danh sách của bạn

| Công việc | Ứng viên ưu tiên thử | Vì sao đưa vào vòng thử | Kiểm tra điều gì |
|---|---|---|---|
| Code hằng ngày, việc nhỏ | GPT-5.6 Luna; MAI-Code-1.1-Flash | Đơn giá thấp nhất nhìn đủ trong ảnh | Có cần hỏi lại nhiều không? |
| Phát triển feature vừa phải | GPT-5.6 Terra; Claude Sonnet 5 | Ứng viên coding/agent đa dụng | Đúng yêu cầu, ít sửa ngoài phạm vi |
| Agent sửa repository nhiều bước | GPT-5.3-Codex; Kimi K3 | Định hướng công việc agent và tác vụ dài | Sửa được nguyên nhân và kiểm chứng được |
| Phân tích kiến trúc, bug khó | GPT-5.4; thử thêm Terra hoặc Sonnet 5 | Cần kiểm tra giả thuyết và ràng buộc | Bằng chứng, trade-off, lỗi bị bỏ sót |
| Tìm vị trí code, khảo sát repo | GPT-5.4 mini; MAI-Code-1.1-Flash | Có thể kết hợp tìm kiếm file và đọc code | Đường dẫn có đúng, có bỏ sót nơi dùng? |
| Đọc ảnh UI rồi hỗ trợ sửa | Gemini 3.8 Flash; Sonnet 5; MAI | Ảnh xác nhận Vision, có thể thử cùng code | So kết quả render với ảnh mẫu |
| Đọc tài liệu dài, tổng hợp yêu cầu | Gemini 3.8 Flash; GPT-5.4; Kimi K3 | Context trong ảnh 1M | Trích đúng, không thêm thông tin |
| Review phản biện | Grok 4.6; GPT-5.4; Sonnet 5 | Thử model khác với model viết bản đầu | Lỗi phát hiện có tái hiện được? |
| Giải thích nhanh, học lập trình | Haiku 4.5; GPT-5 mini; Luna | Phạm vi câu hỏi có thể chia nhỏ | Đúng khái niệm và ví dụ chạy được |
| Local đa dụng, thử agent/RAG | GPT-OSS 20B | Có định hướng reasoning và công cụ | Dùng công cụ đúng, bám tài liệu |
| Local chuyên code | DeepSeek-Coder-V2 16B; GPT-OSS 20B | Hai ứng viên để so trên test thật | Test pass và chất lượng diff |
| Local nhẹ để học và chatbot đơn giản | Llama 3.2 3B; Phi-3 3,8B | Quy mô nhỏ để thử triển khai | Tiếng Việt, tốc độ, bộ nhớ |
| Local cực nhỏ, nhiệm vụ hẹp | Gemma 3 270M | Kích thước nhỏ nhất trong danh sách | Accuracy trên tập kiểm thử riêng |
| Học reasoning ở model nhỏ | DeepSeek-R1 1.5B | Bản distilled phù hợp làm thí nghiệm | Kết quả đúng, không chỉ giải dài |

Các vai trò trong bảng là **đề xuất thực hành của mình**, không tuyên bố đã đo mức vượt trội. Ví dụ “review phản biện” là cách tổ chức công việc có thể áp dụng cho nhiều model, không phải tính năng độc quyền của Grok.

### Lựa chọn chi phí có thể kết luận trực tiếp từ ảnh

Luna và MAI cùng có giá **20 In / 120 Out**, thấp nhất trong những hàng đọc đủ giá. Gemini 3.6, 3.7 và 3.8 có cùng giá **75 / 375**. Grok 4.5 và 4.6 cùng **200 / 600**.

Đây là so sánh **đơn giá**, không phải số giây hoặc tổng chi phí nhiệm vụ. Các cột cache bị cắt và chưa biết quy tắc tính reasoning nên không đưa ra phép tính “hóa đơn thực tế”.

### Một số model dẫn đầu ở benchmark cụ thể

Bảng sau lấy từ **bảng so sánh do Moonshot công bố**, chỉ ghi người có điểm cao nhất **trong tập model được bảng đó so sánh**, không phải toàn thị trường. Một số tên nằm ngoài ảnh.

| Benchmark | Model có điểm cao nhất trong bảng nguồn | Điểm |
|---|---|---:|
| GPQA Diamond | GPT-5.6 Sol | 94,1 |
| DeepSWE | GPT-5.6 Sol | 73,0 |
| ProgramBench | Kimi K3 | 77,8 |
| FrontierSWE | Claude Fable 5 | 86,6 |
| OmniDocBench | Kimi K3 | 91,1 |

Nguồn dùng các môi trường agent và mức effort khác nhau; một số điểm tổng hợp từ leaderboard. Đây là kết quả được nhà cung cấp báo cáo, chưa được mình tái kiểm chứng. Chênh lệch điểm không chứng minh mức hơn kém trên dự án của bạn. [Nguồn và phương pháp](https://huggingface.co/moonshotai/Kimi-K3#3-evaluation-results).

### Nếu muốn tìm model mạnh hơn ngoài ảnh

Danh sách hỗ trợ GitHub còn có GPT-6 Astra, GPT-5.6 Sol, Claude Opus 5 và Claude Fable 5.1. Có thể đưa các model này vào vòng đánh giá nếu tài khoản có quyền truy cập; tài liệu này không khảo sát đầy đủ chúng và **không chứng nhận đây là bốn model đứng đầu thị trường**. [Nguồn GitHub](https://docs.github.com/en/copilot/reference/ai-models/supported-models).

Với tác vụ chuyên biệt như tạo ảnh, tạo video, nhận dạng giọng nói, embedding hoặc reranking, danh sách ở hai ảnh không phải tập ứng viên đầy đủ. Không nên chọn một LLM chat làm “model tốt nhất mọi việc”.

## 8. Cách dùng hiệu quả cho công việc frontend

### Một quy trình lựa chọn đơn giản

1. **Việc rõ, nhỏ:** thử Luna hoặc MAI.
2. **Feature có nhiều trạng thái:** thử Terra hoặc Sonnet 5.
3. **Bug nhiều file hoặc tác vụ agent kéo dài:** thử Codex; cân nhắc K3 nếu cần khảo sát phạm vi lớn.
4. **Quyết định kiến trúc:** yêu cầu phân tích bằng chứng và trade-off; thử GPT-5.4 hoặc model đang cho kết quả tốt trên dự án.
5. **Kết quả chưa đạt:** bổ sung dữ liệu còn thiếu trước khi chỉ đổi sang model đắt hơn.

Không cần dùng mọi model. Bạn có thể chọn một model tiết kiệm, một model làm việc chính và một model local, rồi duy trì tập bài kiểm tra để đánh giá khi phiên bản thay đổi.

### Mẫu yêu cầu triển khai tính năng

```text
Bối cảnh: ứng dụng React/Next.js đang có danh sách sản phẩm.
Mục tiêu: thêm tìm kiếm và lọc theo danh mục.

Yêu cầu:
- Dùng lại API và component hiện có.
- Lưu trạng thái tìm kiếm/bộ lọc trong URL.
- Có loading, empty và error state.
- Refresh trang vẫn khôi phục được bộ lọc.
- Dùng được bằng bàn phím.

Hãy đọc luồng hiện tại trước khi sửa. Sau khi sửa, nêu:
file đã thay đổi, lý do, cách kiểm tra và điều chưa xác minh.
```

Mẫu này là đề bài chung để so model. Không chứa thuật toán bắt buộc, vì model cần dựa vào cấu trúc dự án thực tế.

### Mẫu debug

```text
Hiện tượng: ...
Kỳ vọng: ...
Các bước tái hiện: ...
Log và code liên quan: ...
Môi trường/phiên bản: ...

Phân biệt dữ kiện với giả thuyết.
Đề xuất phép kiểm tra nhỏ nhất giúp xác định nguyên nhân.
Khi đủ bằng chứng, sửa nguyên nhân gốc và kiểm tra regression.
```

Một model mạnh vẫn dễ trả lời sai nếu bạn chỉ nói “nút này không hoạt động” mà không đưa code hoặc bước tái hiện.

### Mẫu học kiến thức

```text
Giải thích [khái niệm] bằng tiếng Việt.
Tôi quen JavaScript/React nhưng mới học phần này.
Cho một ví dụ đời thường, một ví dụ code nhỏ và một trường hợp dễ nhầm.
Cuối cùng đặt một bài tập để tôi tự kiểm tra hiểu biết.
```

### Mẫu phân tích ảnh UI

```text
Ảnh A là thiết kế, ảnh B là bản hiện tại.
Viewport: ...; zoom: ...
Code component và CSS: ...

Chỉ ra chênh lệch nhìn thấy được.
Không đoán DOM hoặc event từ ảnh.
Ưu tiên sửa layout, typography và responsive theo design system hiện có.
Sau khi sửa cần đối chiếu lại ảnh render.
```

## 9. Kiểm tra model local trước khi sử dụng

Các lệnh dưới đây là ví dụ để bạn chạy trên máy có Ollama; tài liệu này không truy cập hoặc kiểm tra máy của bạn. Tham khảo [Ollama CLI](https://docs.ollama.com/cli) cho phiên bản đang cài.

```bash
ollama list
ollama show gpt-oss:20b
ollama show gpt-oss:latest
ollama show qwen:latest
ollama show deepseek-coder-v2:latest
ollama ps
```

Hãy ghi lại tên/tag, ID, kích thước, quantization và context cấu hình. Nếu model chưa có trên máy, thao tác chạy/pull có thể tải thêm dữ liệu; các lệnh xem ở trên phục vụ kiểm tra thông tin đã có.

Với máy khoảng 24GB VRAM, **đề xuất thử nghiệm**, không phải bảo đảm cấu hình:

- Thử GPT-OSS 20B hoặc DeepSeek-Coder-V2 16B từng model một nếu mục tiêu là chất lượng local.
- Thử Llama 3.2/Phi-3 nếu mục tiêu là model nhẹ hơn.
- Bắt đầu context vừa phải, chẳng hạn 8K, rồi tăng khi thật sự cần và theo dõi bộ nhớ.
- Không coi Kimi K3 hoặc K2.7 full-weight là lựa chọn chạy gọn trong 24GB.

Nếu model chậm, phân biệt thời gian nạp, thời gian đọc prompt dài và tốc độ sinh token. Tăng context có thể làm chậm dù câu trả lời rất ngắn. Nếu một phần model phải chạy trên CPU, tốc độ phụ thuộc nhiều vào RAM và phần cứng.

## 10. Tự xác định “tốt nhất” bằng một bài đánh giá nhỏ

### Chuẩn bị 10 nhiệm vụ thật

| Nhóm | Số bài | Ví dụ |
|---|---:|---|
| Sửa lỗi logic | 2 | State cũ; xử lý kết quả trả về sai thứ tự |
| Viết feature | 2 | Tìm kiếm; phân trang |
| Test | 2 | Trường hợp biên; lỗi bất đồng bộ |
| Đọc repository | 1 | Lần theo luồng từ component tới API |
| UI/Vision | 1 | Sửa layout từ screenshot |
| Giải thích tiếng Việt | 1 | SSR/CSR và ví dụ đúng |
| Tài liệu/RAG | 1 | Trả lời có dẫn vị trí trong tài liệu |

Cho các model cùng dữ liệu, công cụ, giới hạn thời gian và trạng thái code ban đầu. Không để model sau được hưởng bản sửa từ model trước. Lặp lại một số bài quan trọng vì kết quả có thể dao động.

### Ghi kết quả

| Model | Bài đúng / tổng | Thời gian tới kết quả dùng được | Credits thực tế | Số lần can thiệp | Lỗi ngoài phạm vi |
|---|---:|---:|---:|---:|---|
| Model A | | | | | |
| Model B | | | | | |
| Model C | | | | | |

Để so chi phí:

```text
Chi phí mỗi nhiệm vụ thành công
= tổng chi phí của tất cả lần thử / số nhiệm vụ hoàn thành đúng
```

Ví dụ minh họa: model A tốn 2 credits cho mỗi lần thử nhưng trung bình cần 4 lần; model B tốn 5 credits và làm đúng ngay. A tốn 8, B tốn 5. Đây là số giả định để giải thích phương pháp, không phải giá đo của model nào trong ảnh.

Nếu dùng scoring, đặt trọng số trước khi thử. Với dự án frontend, có thể ưu tiên đúng hành vi và không regression hơn tốc độ sinh chữ. Không để model tự chấm bản sửa của chính nó làm bằng chứng duy nhất.

## 11. Những nhầm lẫn cần tránh

| Nhầm lẫn | Cách hiểu đúng |
|---|---|
| Model mới hơn luôn thắng | Phải so trên cùng nhiệm vụ và điều kiện |
| Context lớn hơn tức thông minh hơn | Context chủ yếu là sức chứa đầu vào/phiên xử lý |
| Tools tức đã có Internet | Phải có công cụ được ứng dụng cấp và thực thi |
| Vision tức tạo được ảnh | Thường chỉ nói tới hiểu ảnh đầu vào |
| `latest` là thế hệ mới nhất toàn hãng | Chỉ là tag trong một tên registry cụ thể |
| `qwen:latest` là Qwen mới nhất | Ở registry đã tra, nó thuộc Qwen 1.5 |
| `gpt-oss:latest` mạnh hơn `20b` | Hiện hai tag cùng ánh xạ bản 20B trên registry |
| DeepSeek-R1 1.5B mạnh như R1 đầy đủ | Đây là bản distilled nhỏ, cần đánh giá riêng |
| Gemma 3 nào cũng đọc ảnh | Bản 270M trong ảnh chỉ xử lý văn bản |
| Local luôn hoàn toàn miễn phí | Không nhất thiết mất phí API, nhưng có chi phí vận hành |
| Open-weight là chạy được trên GPU cá nhân | Phải xem tổng trọng số, định dạng và bộ nhớ |
| Benchmark cao là code production đúng | Cần test, review và đánh giá workflow thực tế |
| Grok trong Copilot tự đọc X | Tùy công cụ và tích hợp, không tự suy ra từ tên |
| Model RAG tự biết tài liệu của mình | Phải có bước truy xuất và cung cấp tài liệu |

## 12. Nguồn và giới hạn của tài liệu

Thông số giao diện được đọc trực tiếp từ hai ảnh bạn cung cấp. Các trang được đối chiếu ngày 20/09/2026. Thông tin hỗ trợ, tag và giá có thể thay đổi; một số tài liệu chính thức vẫn có đoạn nói về thế hệ cũ. Vì vậy tài liệu này ưu tiên tên phiên bản cụ thể, phân biệt thông số ảnh với model gốc và không dùng câu quảng bá “mạnh nhất” như kết luận xếp hạng.

Nguồn nằm cạnh từng phần giải thích. Các trang nền tảng chính:

- [Danh sách model được GitHub Copilot hỗ trợ](https://docs.github.com/en/copilot/reference/ai-models/supported-models).
- [Gợi ý chọn model của GitHub](https://docs.github.com/en/copilot/reference/ai-models/model-comparison).
- [System card GPT-5.6](https://deploymentsafety.openai.com/gpt-5-6/gpt-5-6.pdf).
- [Model card Gemini 3.8 Flash](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-8-Flash-Model-Card.pdf).
- [Model card MAI-Code-1.1-Flash](https://microsoft.ai/pdf/MAI-Code-1.1-Flash-Model-Card.PDF).
- [Model card Kimi K3](https://huggingface.co/moonshotai/Kimi-K3).
- [Ollama GPT-OSS](https://ollama.com/library/gpt-oss).

**Phần chưa thể kết luận:** model số một tuyệt đối cho tiếng Việt, frontend, suy luận hoặc tốc độ; giá Out bị cắt; tên model Azure; cấu hình model thật trên máy bạn; và ý nghĩa chính xác của từng biểu tượng cảnh báo. Để kết luận các điểm này cần dữ liệu hoặc phép đo bổ sung, không thể suy ra đáng tin cậy chỉ từ danh sách tên.
