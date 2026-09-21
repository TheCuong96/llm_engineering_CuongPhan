# RAG Day 1 — Bản tóm tắt nhanh

> Tổng hợp 6 video 001–006 từ phụ đề. Đọc bản này để nắm mạch chính; bản đầy đủ giải thích code, thí nghiệm và các điểm dễ hiểu nhầm.

## 1. Cả phần học này nhằm làm gì?

**Xây một trợ lý có thể tra tài liệu riêng của công ty rồi trả lời dựa trên tài liệu đó.**

Hình dung LLM là người giỏi đọc hiểu nhưng chưa biết công ty bạn. RAG đưa đúng hồ sơ cho người đó đọc trước khi trả lời.

**RAG — Retrieval Augmented Generation:** truy xuất thông tin → bổ sung vào ngữ cảnh → sinh câu trả lời.

Đây là xây ứng dụng sử dụng model có sẵn. Đưa tài liệu vào prompt không phải huấn luyện model mới hay làm model ghi nhớ vĩnh viễn.

## 2. Mạch của 6 video

| Video | Ý cần nắm |
| --- | --- |
| 001 | Muốn AI biết dữ liệu riêng, hãy tìm dữ liệu liên quan rồi gửi kèm câu hỏi |
| 002 | Làm bản đơn giản: đọc hồ sơ Markdown vào dictionary, tra bằng từ khóa |
| 003 | Ghép context, gọi model, thử chatbot; thấy lỗi tìm kiếm và ảnh hưởng của lịch sử |
| 004 | Hiểu token, vector và vai trò khác nhau của model embedding với model sinh văn bản |
| 005 | Hiểu vì sao biểu diễn bằng số có thể giúp tìm theo ý nghĩa |
| 006 | Ghép kho vector, tìm kiếm và LLM thành luồng RAG hoàn chỉnh ở mức ý tưởng |

Ngày 1 chưa triển khai đầy đủ RAG bằng LangChain/Chroma; đó là phần được hẹn học tiếp.

## 3. Từ “ý tưởng nhỏ” đến “ý tưởng lớn”

**Ý tưởng nhỏ: tìm theo từ khóa.**

Trong demo, dictionary lưu khóa `lancaster` với nội dung hồ sơ Avery Lancaster. Hỏi “Lancaster là ai?” thì tìm được. Hỏi “Avery là ai?” thì không tìm được vì thiếu khóa `avery`. Hỏi “Alex Lancaster là ai?” lại có thể lấy nhầm hồ sơ Avery vì trùng họ.

Code lấy văn bản tìm được, đưa vào prompt, rồi gọi LLM trả lời. Điểm yếu nằm ở cách tìm quá cứng nhắc.

**Ý tưởng lớn: tìm theo ý nghĩa bằng embedding.**

Câu “Giá vé đi London?” và “Bay đến Heathrow bao nhiêu tiền?” có liên quan dù từ ngữ khác nhau. Embedding giúp hệ thống tìm ra tài liệu có thể hữu ích. Tuy nhiên, liên quan không có nghĩa mọi chi tiết đều khớp: vẫn cần kiểm tra sân bay, ngày và điều kiện cụ thể.

## 4. Chỉ cần phân biệt những thành phần này

| Thành phần | Hiểu nhanh |
| --- | --- |
| Knowledge base — kho kiến thức | Tài liệu để tra cứu: file, hồ sơ, dữ liệu… |
| Token / Token ID | Đơn vị văn bản / số định danh của đơn vị đó |
| Embedding | Danh sách số biểu diễn văn bản, giúp so sánh ngữ nghĩa |
| Embedding model | Tạo vector cho tài liệu và câu hỏi |
| Vector store | Lưu, tìm vector và liên kết với văn bản tương ứng |
| Generative LLM | Đọc câu hỏi cùng tài liệu đã tìm và viết câu trả lời |

**Model tạo embedding giúp tìm; LLM sinh văn bản giúp trả lời.** Hai vai trò có thể dùng các model khác nhau.

## 5. RAG dùng vector chạy thế nào?

**Chuẩn bị trước:** đọc tài liệu → tạo embedding → lưu vector gắn với văn bản. Khi triển khai thực tế, tài liệu dài thường được chia thành các đoạn nhỏ trước bước embedding.

**Khi có câu hỏi:** tạo embedding câu hỏi → tìm vector liên quan → lấy văn bản tương ứng → gửi văn bản cùng câu hỏi cho LLM → trả lời.

Điều quan trọng nhất: **LLM trả lời nhận văn bản gốc đã tìm được, không phải dãy số embedding.** Hệ thống không giải mã vector để tái tạo tài liệu.

Trong cách làm của video, tài liệu và câu hỏi dùng cùng model embedding với cấu hình nhất quán. Các vector phải thuộc không gian tương thích; cùng số chiều thôi chưa đủ. Xem phần giải thích trong [tài liệu Semantic Search](https://sbert.net/examples/sentence_transformer/applications/semantic-search/README.html).

## 6. Thí nghiệm đáng nhớ nhất

Hỏi “Avery Lancaster là ai?” rồi hỏi “Avery là ai?” trong cùng cuộc chat: cả hai có thể trả lời đúng.

Nhưng câu thứ hai **không chứng minh tìm kiếm hoạt động đúng**. Model có thể lấy thông tin từ lịch sử hội thoại. Mở chat mới và hỏi “Avery là ai?” mới thấy dictionary không tìm được.

Khi kiểm tra RAG, hãy xem riêng **tài liệu truy xuất**, **prompt gửi đi** và **câu trả lời**.

## 7. Những điểm đừng hiểu nhầm

- RAG không bắt buộc có vector database; tra từ khóa cũng có thể thực hiện nguyên lý RAG.
- Vector gần nhau hỗ trợ ước lượng liên quan, không bảo đảm tài liệu chứa đáp án.
- Ví dụ `king − man + woman ≈ queen` chỉ minh họa quan hệ ngữ nghĩa; không cần làm phép toán này để xây RAG.
- Có RAG vẫn có thể trả lời sai nếu nguồn sai, truy xuất sai hoặc model diễn giải sai.
- Càng nhiều context không có nghĩa càng tốt; cần thông tin phù hợp.
- Dữ liệu demo công ty là giả lập do LLM tạo; giảng viên cũng phải kiểm tra và chỉnh sự thiên lệch của dữ liệu.

**Câu chốt để nhớ bài: RAG tìm thông tin trước, cho model đọc rồi mới trả lời; vector giúp bước tìm kiếm linh hoạt hơn cách khớp chữ.**
