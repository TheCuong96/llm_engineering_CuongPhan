# Day 5 — Advanced RAG: bản tóm tắt nhanh

> Tổng hợp bài 024–032 từ 9 phụ đề được cung cấp. Đọc bản này trước để nắm ý chính; bản đầy đủ giải thích cơ chế, ví dụ, mã giả và những chỗ dễ hiểu nhầm.

## 1. Phần này muốn dạy điều gì?

**Làm cho chatbot tìm tài liệu đúng hơn, trả lời đầy đủ hơn và dùng số liệu để chứng minh nó tốt hơn.**

RAG cơ bản: tìm tài liệu liên quan → đưa vào prompt → LLM trả lời.

RAG nâng cao cải thiện từng khâu: chuẩn bị tài liệu, cách tìm kiếm, cách chọn đoạn và cách trả lời. Không có một kỹ thuật luôn tốt cho mọi dữ liệu.

**Thông điệp chính: đo → tìm lỗi → thay đổi → đo lại.**

## 2. Bản đồ bài học

| Bài | Ý chính |
|---|---|
| 024 | Ôn RAG và cách đánh giá |
| 025–026 | Giới thiệu 10 hướng cải thiện |
| 027–028 | Dùng LLM chia đoạn, tạo embedding, lưu Chroma không qua LangChain |
| 029 | Reranking và rewriting; phát hiện rewriting đôi khi gây hại |
| 030 | Tìm bằng cả câu gốc lẫn câu viết lại; tăng tốc nhập dữ liệu |
| 031 | Chạy lại UI và đánh giá bản nâng cao |
| 032 | Thử vượt kết quả demo và xây trợ lý dữ liệu cá nhân |

## 3. Mười thuật ngữ chỉ cần hiểu thế này

| Kỹ thuật | Hiểu ngắn gọn |
|---|---|
| Chunking | Chia tài liệu sao cho từng đoạn đủ nghĩa và dễ tìm |
| Encoder selection | Chọn model biến văn bản thành vector phù hợp dữ liệu |
| Prompt improvement | Hướng dẫn model trả lời rõ, đúng và đủ |
| Document preprocessing | Chuẩn bị tài liệu; thêm tiêu đề/tóm tắt để hỗ trợ tìm kiếm |
| Query rewriting | Viết lại câu hỏi thành truy vấn rõ nghĩa, có thể dựa vào lịch sử |
| Query expansion | Tìm bằng nhiều truy vấn để giảm bỏ sót |
| Re-ranking | Sắp xếp lại các đoạn đã tìm để đưa đoạn hữu ích lên đầu |
| Hierarchical RAG | Dùng dữ liệu tổng hợp nhiều cấp cho câu hỏi bao quát |
| GraphRAG | Khai thác quan hệ giữa người, nhóm, sản phẩm hoặc tài liệu |
| Agentic RAG | Để LLM chọn công cụ và các bước tìm kiếm |

Ba hướng cuối chủ yếu được giới thiệu và giao thử nghiệm; video không xây hoàn chỉnh cả ba.

## 4. Hệ thống thực hành hoạt động ra sao?

**Khi nhập dữ liệu:**

1. Đọc tài liệu Markdown.
2. LLM chia đoạn theo ý nghĩa — semantic chunking.
3. Mỗi đoạn có tiêu đề, tóm tắt và nguyên văn.
4. Tạo embedding, lưu cùng văn bản và metadata vào Chroma.

**Khi người dùng hỏi:**

1. Giữ câu hỏi gốc và tạo một câu viết lại.
2. Tìm 20 đoạn bằng mỗi câu.
3. Gộp, loại trùng: tối đa 40 ứng viên trước loại trùng.
4. Xếp hạng theo câu hỏi gốc, giữ 10 đoạn đầu.
5. LLM đọc chúng cùng câu hỏi/lịch sử rồi trả lời.

Không xử lý lại toàn bộ kho tài liệu mỗi lần người dùng chat.

## 5. Ví dụ quan trọng nhất

Câu hỏi: **“Ai học ở Manchester University?”**

Hồ sơ demo ghi Jessica Liu học tại **University of Manchester**.

- Sau semantic chunking, tìm được đoạn đúng ở vị trí thứ 5.
- Sau reranking, đoạn đó lên vị trí đầu.
- Nhưng rewriting đôi khi tự thêm tên công ty, kéo tìm kiếm sang tài liệu chung và làm kết quả kém đi.
- Cách xử lý: **tìm bằng cả câu gốc và câu viết lại**, rồi gộp và xếp hạng.

Bài học: thêm một bước AI không tự động làm hệ thống tốt hơn. Phải kiểm tra lỗi và đo lại.

## 6. Đọc các chỉ số thế nào?

| Chỉ số | Cần nhớ |
|---|---|
| MRR | Đo vị trí kết quả liên quan đầu tiên: hạng 1 được 1; hạng 2 được 1/2; hạng 5 được 1/5; lấy trung bình |
| nDCG | Xem các kết quả liên quan có được xếp lên đầu danh sách không |
| Keyword coverage | Kiểm tra mức bao phủ từ khóa kỳ vọng; không bảo đảm nội dung đúng |
| Accuracy | Câu trả lời có chính xác không? |
| Relevance | Có đúng trọng tâm không? |
| Completeness | Có đủ các ý cần trả lời không? |

**Kết quả giảng viên báo trong bài 031:**

| Chỉ số | Ban đầu → nâng cao |
|---|---|
| MRR | 0,7298 → 0,9116 |
| nDCG | 0,7387 → 0,9025 |
| Keyword coverage | 83,8% → khoảng 96% |
| Accuracy / 5 | 3,99 → 4,62 |
| Relevance / 5 | 4,57 → 4,84 |
| Completeness / 5 | 3,85 → 4,35 |

Đây là số liệu của bộ test demo và có dao động giữa các lần chạy. Giảng viên giữ cùng phương pháp/model chấm để so sánh. Nhiều thành phần đã đổi, nên không thể quy toàn bộ mức tăng cho riêng một kỹ thuật.

Tên video nhắc GPT-4o, nhưng phụ đề mô tả model trả lời GPT-OSS và judge GPT-4.1 nano; không nên hiểu bảng này là thành tích riêng của GPT-4o.

## 7. Những điểm đừng hiểu nhầm

- **MRR 0,91 không có nghĩa chính xác 91% câu hỏi đúng ở hạng 1.** Đây là trung bình nghịch đảo thứ hạng.
- **Recall khác hit rate:** recall đo lượng thông tin liên quan lấy được; hit rate đo tỷ lệ câu hỏi có ít nhất một kết quả đúng. Phụ đề dùng hai ý này chưa thật rõ. Xem thêm [Ragas: Context Recall](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/context_recall/).
- **Reranking không tìm ra dữ liệu bị bỏ sót hoàn toàn.** Nó chỉ sắp lại ứng viên đã lấy về.
- **Tìm 10 đoạn tốt nhất chưa đủ để đếm toàn bộ nhân viên.** Câu hỏi tổng hợp/số liệu có thể cần truy xuất khác hoặc công cụ tính toán.
- **Structured outputs bảo đảm hình dạng đầu ra, không bảo đảm sự thật.** Giữ nguồn gốc của thông tin.
- **Hình t-SNE đẹp không chứng minh RAG tốt.** Nó dùng để quan sát dữ liệu.
- **Model mở không đồng nghĩa dữ liệu ở local.** Gọi model đó qua cloud vẫn gửi dữ liệu ra dịch vụ.

## 8. Phần kỹ thuật chỉ cần nhớ

- Không dùng LangChain vẫn xây được RAG bằng cách tự gọi embedding, Chroma và LLM.
- Giữ interface của `answer_question` và `fetch_context` giúp thay logic mà UI/evaluator ít phải đổi.
- Multiprocessing chạy nhiều tác vụ nhập dữ liệu đồng thời; không bảo đảm tăng worker bao nhiêu thì nhanh bấy nhiêu.
- Retry với backoff giúp xử lý lỗi tạm thời; cần giới hạn số lần và phân biệt loại lỗi.
- Giảng viên đề xuất agent tự chấm rồi sửa, nhưng lặp nhiều lần không bảo đảm đúng; cần giới hạn vòng lặp và bộ test độc lập.

## 9. Học xong nên làm gì?

1. Chọn một nhóm tài liệu của bạn, chẳng hạn ghi chú kỹ thuật.
2. Tạo câu hỏi và đáp án kiểm tra được, gồm cả câu hỏi thiếu dữ liệu.
3. Đo bản RAG đơn giản làm mốc.
4. Thử từng thay đổi: chia đoạn, embedding, reranking, mở rộng truy vấn.
5. Ghi lại chất lượng, thời gian, chi phí và những câu còn sai.

**Chỉ nhớ một câu:** RAG nâng cao là tổ chức và tìm bằng chứng tốt hơn; muốn biết có tốt hơn thật hay không, phải đánh giá.
