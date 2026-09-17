# Day 3 — RAG: bản tóm tắt video 012–016

> Đọc nhanh trước; xem bản đầy đủ khi cần giải thích hoặc ví dụ. Nội dung được tổng hợp từ phụ đề của năm video.

## 1. Phần này dạy gì?

**Xây chatbot trả lời từ tài liệu riêng bằng cách tìm các đoạn liên quan rồi đưa cho LLM đọc.** Sau đó thêm giao diện, lịch sử hội thoại và quan sát các lỗi tìm kiếm.

Bạn đang xây ứng dụng dùng mô hình có sẵn; không huấn luyện ChatGPT từ đầu và không làm mô hình nhớ vĩnh viễn kho tài liệu.

| Video | Ý chính |
| --- | --- |
| 012 | Hiểu luồng RAG và vai trò của retriever/LLM |
| 013 | Kết nối Chroma, dùng embedding tương thích, tạo retriever và LLM |
| 014 | Lấy context rồi gửi cùng câu hỏi cho LLM; gắn Gradio |
| 015 | Tách code thành module; dùng lịch sử hội thoại |
| 016 | Xem nguồn và tìm lỗi do lịch sử hoặc chia đoạn |

## 2. Hai luồng cần nhớ

**Chuẩn bị dữ liệu:** tài liệu → chia chunk → tạo embedding → lưu Chroma.

**Mỗi lượt hỏi:** tạo truy vấn → tìm chunk liên quan → lấy văn bản làm context → gửi context, lịch sử và câu hỏi cho LLM → hiển thị câu trả lời.

Vector dùng để tìm kiếm; **văn bản của chunk mới là thứ LLM đọc trong prompt**.

| Thành phần | Vai trò ngắn gọn |
| --- | --- |
| Embedding model | Đổi văn bản thành vector |
| Chroma | Lưu và tìm vector cùng dữ liệu liên quan |
| Retriever | Lấy các đoạn phù hợp với truy vấn |
| LLM | Đọc đầu vào và viết câu trả lời |
| LangChain | Giúp kết nối các thành phần |
| Gradio | Giao diện chat và xem context |

`retriever.invoke()` trả tài liệu; `llm.invoke()` trả phản hồi. Bạn phải tự nối hai bước này bằng code. Chỉ tạo hai đối tượng chưa tạo thành RAG.

## 3. Thiết lập và tổ chức code

- Dùng embedding tương thích ở cả lúc tạo kho và lúc hỏi. Chỉ khớp số chiều chưa đủ nếu hai mô hình khác nhau.
- `k` là số chunk muốn lấy. Bản module đặt `k = 5`; nhiều hơn không tự động tốt hơn.
- Demo chia đoạn với 1.000 ký tự, chồng lặp 200 ký tự. Overlap giúp giảm mất ý nhưng không bảo đảm đủ ngữ cảnh.
- Temperature thấp giúp đầu ra ít biến thiên hơn; không tăng kiến thức, không sửa tìm kiếm sai, không bảo đảm lặp lại tuyệt đối.

| File | Công việc |
| --- | --- |
| `ingest.py` | Đọc → chia đoạn → embedding → lưu kho |
| `answer.py` | Lấy context, xử lý lịch sử, gọi LLM |
| `app.py` | Chạy giao diện |

Demo ingestion tạo lại kho cũ. Tách module giúp dễ bảo trì, chưa đồng nghĩa hoàn thiện mọi yêu cầu production.

## 4. Ba lỗi quan trọng nhất

### Lỗi 1: “Lương của cô ấy?” nhưng trả lời về người khác

Sau khi hỏi Avery, câu hỏi tiếp nối thiếu tên người. Có **hai nơi** cần lịch sử:

- LLM cần biết “cô ấy” chỉ Avery.
- Retriever cần đủ thông tin để tìm hồ sơ Avery.

Chỉ gửi lịch sử cho LLM vẫn có thể lấy sai tài liệu. Video sửa bằng cách vừa gửi lịch sử cho LLM, vừa ghép các câu người dùng đã nói thành truy vấn tìm kiếm.

### Lỗi 2: Đổi chủ đề nhưng vẫn tìm hồ sơ Avery

Ghép mọi câu hỏi cũ khiến truy vấn còn quá nhiều nội dung về Avery. Khi hỏi người nhận giải IOTY, hệ thống vẫn lấy các đoạn về Avery.

**Hướng cải tiến bổ sung, chưa được triển khai trong nhóm video:** viết lại câu hỏi hiện tại thành câu độc lập, chỉ lấy ngữ cảnh lịch sử cần thiết. “Lương của cô ấy?” trở thành “Lương của Avery Lancaster?”, còn câu hỏi về giải thưởng không tự thêm Avery.

### Lỗi 3: Trả lời “Maxine” nhưng thiếu họ “Thompson”

Chunk được tìm thấy có nội dung giải thưởng nhưng thiếu họ tên đầy đủ nằm ở đầu tài liệu.

**Bài học:** tài liệu có thông tin chưa chắc prompt có thông tin. Hướng thử bổ sung: thêm tiêu đề/tên nhân vật vào chunk, lấy đoạn lân cận hoặc chia theo cấu trúc tài liệu.

## 5. Debug và thực hành

Khi câu trả lời sai, xem: **tài liệu gốc → chunk tìm được → context/lịch sử gửi cho LLM → câu trả lời**. Nếu chunk đã sai, cần sửa truy xuất trước khi chỉ tập trung đổi LLM.

Giao diện video hiển thị cả nội dung chunk và nguồn. Metadata nguồn được hiển thị cho người xem nhưng không được gửi cho LLM trong demo; đừng mặc định mô hình nhìn thấy mọi thứ trên giao diện.

Hãy thử: hỏi trực tiếp → hỏi bằng “cô ấy” → đổi chủ đề → yêu cầu họ tên đầy đủ → hỏi thông tin không có. Ghi lại câu trả lời và các chunk, rồi chạy lại khi thay cấu hình.

**Thông điệp cuối:** làm RAG chạy được khá đơn giản; làm nó tìm đúng và trả lời đủ đòi hỏi xử lý lịch sử, chia đoạn hợp lý và đánh giá bằng các trường hợp cụ thể. Phần tiếp theo của khóa học sẽ đi vào Evals — đánh giá hệ thống.
