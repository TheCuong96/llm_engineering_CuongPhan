# Day 2 — Tóm tắt video 007–011: chuẩn bị dữ liệu cho RAG

> Bản ôn nhanh. Nội dung chính dựa trên năm phụ đề được cung cấp; các lưu ý đánh giá và triển khai được bổ sung để tránh hiểu sai.

## Mục tiêu của cả phần

**Biến kho tài liệu thành các đoạn có thể tìm kiếm theo ý nghĩa, để sau đó cung cấp đúng thông tin cho AI trả lời.**

Buổi này tập trung vào đọc tài liệu, chia đoạn, tạo embedding, lưu Chroma và xem biểu đồ. Chatbot RAG hoàn chỉnh có giao diện và nguồn tham khảo được giảng viên để sang buổi sau.

## Mỗi video muốn truyền đạt gì?

| Video | Ý chính |
| --- | --- |
| 007 | LangChain giúp nối các thành phần RAG; tiện nhưng thêm lớp abstraction và kiến thức phải học |
| 008 | Chia tài liệu thành chunk để tìm đúng phần nhỏ và tránh gửi nội dung không cần thiết |
| 009 | Embedding model tạo vector; vector store lưu và tìm vector |
| 010 | Tạo kho Chroma, kiểm tra số vector và giảm chiều bằng t-SNE để nhìn trong 2D |
| 011 | Quan sát 3D, thay embedding model và xem cách biểu diễn dữ liệu thay đổi |

## Luồng xử lý cần nhớ

**Chuẩn bị kho:** đọc tài liệu → chia chunk → embedding model tạo vector → lưu vector kèm văn bản và metadata.

**Khi có câu hỏi:** mã hóa câu hỏi → tìm các vector gần → lấy văn bản của chunk tương ứng → gửi văn bản cùng câu hỏi cho mô hình trả lời.

Vector là phương tiện để tìm nội dung. Mô hình trả lời thường đọc văn bản truy xuất được. Tạo vector không phải huấn luyện lại mô hình trả lời.

## Phân biệt các thành phần

| Thuật ngữ | Hiểu đơn giản |
| --- | --- |
| Chunk | Đoạn trích từ tài liệu, không tự động là bản tóm tắt |
| Metadata | Thông tin đi kèm như file nguồn và loại tài liệu |
| Embedding model | Chuyển đoạn văn hoặc câu hỏi thành danh sách số biểu diễn nội dung |
| Vector store / Chroma | Lưu dữ liệu và tìm mục gần vector truy vấn |
| LangChain | Công cụ ghép các bước xử lý |
| Generative model | Đọc câu hỏi và context để viết câu trả lời |
| t-SNE | Tạo tọa độ 2D/3D để quan sát dữ liệu nhiều chiều |

## Các con số trong demo

- **76 file**, khoảng **300.000 ký tự**, gần **64.000 token** theo cách đếm trong notebook.
- Chia với `chunk_size=1000`, `chunk_overlap=200` **ký tự**: được **413 chunk**.
- Giảm kích thước xuống 800: được **532 chunk**.
- Kích thước vector trong các lần chạy: MiniLM **384 chiều**; OpenAI small **1.536 chiều**; OpenAI large **3.072 chiều**.

413 là số đoạn; 384 là số giá trị trong mỗi vector MiniLM. Những số liệu này thuộc lần chạy trong video, không phải quy luật chung.

## Chunking cần hiểu thế nào?

`RecursiveCharacterTextSplitter` ưu tiên ranh giới lớn như đoạn văn, rồi chia nhỏ hơn nếu cần. Nó không tự hiểu toàn bộ ý nghĩa như một người biên tập.

- Chunk nhỏ: tập trung vào chi tiết nhưng có thể mất điều kiện hoặc chủ thể.
- Chunk lớn: giữ ngữ cảnh nhưng dễ lẫn nhiều ý và tốn context.
- Overlap: lặp một phần nội dung giữa các chunk để giảm đứt ngữ cảnh; nhiều quá sẽ tăng trùng lặp.

`1000/200` là cấu hình thử nghiệm, không phải chuẩn tối ưu. Cần kiểm tra cả giới hạn token của embedding model: MiniLM trong bài mặc định cắt đầu vào quá 256 word pieces. [Model card](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2).

## Đọc biểu đồ đúng cách

Mỗi điểm là một chunk; màu lấy từ loại tài liệu; hover để xem nội dung. X/Y/Z không có ý nghĩa cố định như “mức độ liên quan đến nhân viên”.

t-SNE giúp quan sát quan hệ lân cận, nhưng không giữ nguyên mọi khoảng cách. **Cụm tách đẹp chưa chứng minh truy xuất tốt.** Biểu đồ 3D cũng chỉ là cách nhìn, không thay đổi vector gốc trong kho. [Tài liệu t-SNE](https://scikit-learn.org/stable/modules/manifold.html#t-sne).

Chunk hợp đồng gần chunk sản phẩm có thể đúng vì hợp đồng nói về sản phẩm. Mục tiêu là tìm thông tin liên quan, không phải tách bốn màu bằng mọi giá.

## Điều cần nhớ khi đổi model

Giảng viên giữ nguyên các chunk và thay embedding model để chứng minh: **mô hình quyết định biểu diễn vector**. Nhận xét OpenAI phân nhóm rõ hơn là quan sát trên demo, không phải thứ hạng cho mọi dữ liệu.

Khi triển khai, cần tạo lại vector tài liệu với model mới và mã hóa câu hỏi theo cách tương thích. Cùng số chiều không có nghĩa hai model dùng chung không gian vector. Nhiều chiều hơn cũng không tự bảo đảm tốt hơn.

## Tự kiểm tra bằng một ví dụ

Người dùng hỏi: “Tôi muốn ngừng hợp đồng thì làm sao?” Tài liệu có mục “Thủ tục chấm dứt hợp đồng”. Hệ thống cần tìm đúng đoạn dù cách dùng từ khác nhau, rồi đưa đoạn ấy cho mô hình trả lời.

Để thử chất lượng, viết một nhóm câu hỏi kèm đoạn nguồn mong đợi và xem hệ thống có lấy đúng, đủ các đoạn đó không. Thay chunk size hoặc model từng yếu tố một. Với tiếng Việt, kiểm tra bằng dữ liệu và câu hỏi tiếng Việt.

**Sau phần này, bạn cần giải thích được: chia đoạn để tìm chi tiết; embedding để biểu diễn nội dung bằng số; Chroma để lưu và tìm; t-SNE để quan sát.**
