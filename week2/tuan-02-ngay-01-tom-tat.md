# Tuần 2 · Ngày 1 — Bản tóm tắt 6 bài AI

> Phạm vi: bài 001–006, dựa trên phụ đề bạn gửi. Đọc bản này để nắm ý chính; bản đầy đủ giải thích kỹ ví dụ, khái niệm và cơ chế hội thoại.

## 1. Cả phần này muốn bạn học được gì?

**Viết chương trình gọi nhiều mô hình AI, cung cấp đúng ngữ cảnh và điều phối chúng làm việc với nhau.** Bạn đang xây ứng dụng dùng model có sẵn; 6 bài này không huấn luyện một model từ đầu.

Các chuyện cười và câu đố chỉ là dữ liệu thử để bạn quen lời gọi API và quan sát đầu ra. Không cần ghi nhớ từng câu trả lời.

## 2. Ý chính của từng bài

| Bài | Bạn cần hiểu | Điểm dễ nhầm |
|---|---|---|
| **001 — Kết nối API** | Chuẩn bị khóa, tạo client, chọn model, gửi messages, đọc response | Thư viện dùng để gọi không quyết định model chạy ở hãng nào |
| **002 — Reasoning và scaling** | Đổi model hoặc tăng mức suy luận có thể thay đổi kết quả | Tăng reasoning không phải huấn luyện lại và không bảo đảm đúng |
| **003 — So sánh model** | Quan sát độ đúng, phong cách, tốc độ; phân biệt Groq/Grok | Vài câu đố không đủ xếp hạng năng lực tổng thể |
| **004 — Local và router** | Model có thể chạy local, được gọi trực tiếp hoặc qua trung gian | Ollama là công cụ; Llama là model; OpenRouter là dịch vụ định tuyến |
| **005 — Framework và ngữ cảnh** | LangChain/LiteLLM hỗ trợ lập trình; nguồn đúng giúp trả lời tốt hơn; cache giảm xử lý lặp | Framework không tự làm model thông minh hơn |
| **006 — Model trò chuyện** | Ứng dụng lưu lịch sử, đổi vai và gọi lần lượt từng model | Các model không tự kết nối hoặc tự biết toàn bộ lịch sử |

## 3. Những tên cần phân biệt

| Tên / khái niệm | Hiểu nhanh |
|---|---|
| GPT, Claude, Gemini, Llama, GPT-OSS | Các họ mô hình |
| API key | Khóa xác thực với dịch vụ; giữ ở phía backend |
| SDK / client | Thư viện giúp gửi request |
| OpenAI-compatible API | Giao diện tương thích với cách gọi OpenAI; không đồng nghĩa dùng model OpenAI |
| Groq — Q | Dịch vụ/hạ tầng chạy mô hình |
| Grok — K | Họ mô hình của xAI |
| Ollama | Công cụ chạy các model được hỗ trợ, dùng local trong bài |
| OpenRouter | Điểm truy cập trung gian tới nhiều model/dịch vụ |
| LangChain | Framework hỗ trợ xây ứng dụng LLM |
| LiteLLM | Công cụ thống nhất lời gọi nhiều provider; có hỗ trợ theo dõi usage/chi phí |

## 4. Bốn bài học quan trọng nhất

### A. Chọn model và tăng reasoning là hai việc khác nhau

Bạn có thể chọn model có năng lực khác, hoặc cho model hỗ trợ reasoning dùng thêm tính toán khi trả lời. Cả hai đều cần đo trên tác vụ thật: **đúng đến đâu, nhanh đến đâu, tốn bao nhiêu**.

Câu đố đồng xu có đáp án **2/3** khi biết *ít nhất một trong hai đồng xu công bằng, độc lập là ngửa*. Nếu biết *đồng thứ nhất ngửa*, xác suất đồng thứ hai sấp là **1/2**. Vì vậy cần làm rõ đề trước khi chấm model sai.

Câu đố con sâu có đáp án **4 mm** theo cách xếp sách trong bài: sâu chỉ đi qua hai bìa ở giữa, mỗi bìa 2 mm. Mục đích là cho thấy model vẫn có thể suy luận sai dù giải thích rất dài.

### B. Đưa đúng thông tin có thể quan trọng hơn đổi model

Trong demo Hamlet, model trả lời sai khi chưa được cung cấp tác phẩm, rồi trả lời đúng khi có văn bản nguồn.

Với dự án web cũng vậy: muốn AI giải thích hàm của bạn, hãy đưa đúng code và phần liên quan. Đây là **thiết kế ngữ cảnh**. Gửi toàn bộ tài liệu trực tiếp chưa phải một quy trình RAG có bước truy xuất.

### C. Lịch sử và tài liệu đều tiêu thụ input token

- Input: yêu cầu, hướng dẫn, tài liệu và lịch sử được gửi vào.
- Output: nội dung model sinh ra, với cách thống kê chi tiết tùy API.
- Prompt caching: tái sử dụng phần xử lý đầu vào phù hợp; không phải trí nhớ vĩnh viễn hay lưu sẵn câu trả lời.

Với cache theo tiền tố, đặt nội dung ổn định trước, câu hỏi thay đổi sau. Việc giảm phí còn phụ thuộc quy tắc dịch vụ; đừng mặc định gửi lại là được cache.

**Lưu ý cập nhật:** Anthropic hiện có cấu hình automatic caching và explicit breakpoints; phần mô tả trong video không nên được hiểu là quy tắc cố định. [Tài liệu prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)

### D. Hai model trò chuyện là một vòng lặp do bạn viết

Chương trình gọi A → lưu lời A → gọi B với lịch sử mới → lưu lời B → lặp trong số vòng cho phép.

| Nội dung | Gửi cho A | Gửi cho B |
|---|---|---|
| Lời cũ của A | `assistant` | `user` |
| Lời cũ của B | `user` | `assistant` |

Với ba vai, có thể gửi lịch sử ghi rõ tên từng người rồi yêu cầu “viết lượt tiếp theo của Alex”. Có thể dùng **cùng một model, nhiều prompt vai trò**.

Ứng dụng gần gũi: một vai giải thích bài học, một vai tìm chỗ khó hiểu, một vai tóm tắt. Cần giới hạn số vòng và kiểm tra nguồn vì nhiều model vẫn có thể cùng sai.

## 5. Học xong, bạn nên tự làm được gì?

1. Gọi một model và đọc câu trả lời.
2. Phân biệt model, provider, client và endpoint.
3. Gửi tài liệu để câu trả lời bám đúng nguồn.
4. Tạo hai vai trao đổi hai vòng, kiểm tra messages trước mỗi lần gọi.
5. Theo dõi token, thời gian và chi phí nếu dịch vụ cung cấp.

**Câu cần nhớ:** Chất lượng ứng dụng AI phụ thuộc vào cách bạn chọn model, cung cấp thông tin, kiểm tra đầu ra và tổ chức các lượt gọi — không chỉ vào tên model.

*Tên phiên bản, mức giá và kết quả thắng/thua trong video thuộc lần demo đó. Không cần mở tài khoản ở tất cả hãng để học được cơ chế.*
