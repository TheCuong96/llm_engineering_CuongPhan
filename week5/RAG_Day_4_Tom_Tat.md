# Day 4 — Đánh giá RAG: Bản ôn nhanh

> Tổng hợp 7 video 017–023. Đọc bản này trước để nắm mạch, dùng bản đầy đủ khi cần ví dụ và giải thích sâu.

## 1. Cả phần này dạy gì?

**Cách biết chatbot RAG đang làm tốt đến đâu và mỗi lần chỉnh sửa có thật sự giúp nó tốt hơn không.**

Bạn không huấn luyện lại LLM. Bạn đo và cải thiện cách ứng dụng tìm tài liệu, đưa context cho LLM và tạo câu trả lời.

Quy trình: **lập bộ câu hỏi chuẩn → đo baseline → đổi cấu hình → chạy lại → so sánh và đọc lỗi**.

## 2. Vì sao phải chấm hai phần?

| Phần | Câu hỏi cần kiểm tra |
| --- | --- |
| Retrieval — Truy xuất | Có tìm đúng, đủ các đoạn tài liệu cần thiết không? |
| Answer — Câu trả lời | Dựa trên các đoạn đó, LLM có trả lời đúng, đủ, tập trung không? |

Ví dụ trong video: đáp án là **Maxine Thompson**, nhưng đoạn tìm được chỉ có **Maxine**. LLM trả lời thiếu họ vì context thiếu thông tin.

## 3. Những khái niệm cần nhớ

| Khái niệm | Hiểu nhanh |
| --- | --- |
| Golden dataset | Bộ câu hỏi và đáp án chuẩn đã kiểm tra; demo có 150 câu |
| Keyword coverage | Đã tìm thấy bao nhiêu từ khóa mong đợi trong context |
| MRR | Kết quả cần tìm xuất hiện sớm đến đâu; đầu danh sách được điểm cao |
| nDCG | Chất lượng sắp xếp cả danh sách, ưu tiên nội dung hữu ích ở đầu |
| LLM as a Judge | Dùng LLM so câu trả lời với đáp án chuẩn theo tiêu chí |
| Structured Outputs | Yêu cầu kết quả theo schema để code đọc và tổng hợp |
| Baseline | Điểm cấu hình ban đầu để so trước/sau |

Judge chấm ba chiều: **Accuracy — đúng; Completeness — đủ; Relevance — liên quan**. Trong ví dụ thiếu họ Thompson, judge cho lần lượt **5/5, 4/5, 5/5**.

JSONL là file mỗi dòng một đối tượng JSON. Pydantic mô tả/kiểm tra cấu trúc test và kết quả chấm. Gradio là màn hình chạy và xem eval; nền tảng của phép đo vẫn là bộ test tốt.

## 4. Các video làm gì theo thứ tự?

| Video | Ý chính |
| --- | --- |
| 017 | RAG có thể sai dù cấu hình trông hợp lý; cần đánh giá có hệ thống |
| 018 | Chuẩn bị golden dataset, chấm retrieval và answer riêng |
| 019 | Nạp 150 test bằng JSONL/Pydantic, tính điểm và chia nhóm câu hỏi |
| 020 | Gọi LLM chấm đáp án, nhận feedback và điểm theo schema |
| 021 | Chạy dashboard lấy baseline, xem nhóm nào yếu |
| 022 | Thử chunk nhỏ/lớn, thay k và thử Markdown splitter |
| 023 | Thử embedding small/large, kiểm tra câu trả lời cuối có tiến bộ |

## 5. Kết quả đáng nhớ của demo

Ban đầu: **chunk 1.000 ký tự, k = 5**. Thử **500 ký tự, k = 10** để giữ khoảng 5.000 ký tự context danh nghĩa. Cấu hình chunk nhỏ tốt hơn trong bộ test này; sau đó đổi embedding và đánh giá lại.

| Chỉ số | Ban đầu | Cuối demo |
| --- | --- | --- |
| MRR | 0,7298 | 0,7903 |
| nDCG | 0,7387 | 0,7901 |
| Keyword coverage | 83,8% | 92,5% |
| Accuracy | 3,99/5 | 4,21/5 |
| Completeness | 3,85/5 | 4,05/5 |
| Relevance | 4,57/5 | 4,71/5 |

Nguồn: video 021 và phần tổng kết video 023 khoảng 04:05–05:09; nDCG cuối đối chiếu dashboard. Đây là kết quả của giảng viên, không phải phép thử được chạy lại cho tài liệu này.

**Điều cần học:** retrieval tốt hơn đã đi kèm câu trả lời tốt hơn trong lần thử. Không suy ra chunk 500 hay model lớn nhất luôn tốt nhất cho mọi dự án.

## 6. Những điểm tránh hiểu nhầm

- **MRR 0,79 không phải 79% câu trả lời đúng.** Cách triển khai trong khóa học còn lấy trung bình theo từ khóa; cần biết cách tính trước khi so với công cụ khác.
- **Accuracy 4,21/5 là điểm judge**, không phải tỷ lệ trả lời đúng 84,2%.
- **Đủ từ khóa chưa chắc đủ bằng chứng đúng.** Các từ có thể thuộc những đối tượng khác nhau.
- **JSON đúng cấu trúc không bảo đảm AI chấm đúng.** Nên đối chiếu thủ công một số câu.
- **Chunk nhỏ kèm tăng k là đổi một cặp cấu hình.** Context thực tế không chắc bằng nhau chỉ vì tích ký tự bằng nhau.
- **Đổi embedding phải đổi cả phía tài liệu và truy vấn, rồi xây lại vector.**

Lưu ý thuật ngữ bổ sung: Recall là tỷ lệ nội dung liên quan đã tìm được; tỷ lệ câu có ít nhất một kết quả đúng trong top-k thường gọi là Hit Rate@k. Video diễn giải hai ý này hơi gộp. Định nghĩa nền tảng xem [Stanford IR](https://nlp.stanford.edu/IR-book/html/htmledition/evaluation-of-unranked-retrieval-sets-1.html).

## 7. Áp dụng ngay

1. Viết một bộ câu hỏi thực tế và kiểm tra đáp án theo tài liệu.
2. Có cả câu tra cứu đơn giản, câu cần nhiều tài liệu và câu kho không có đáp án.
3. Ghi cấu hình và điểm baseline, lưu lỗi từng câu.
4. Thay đổi có giả thuyết, chạy lại cùng bộ đề và cùng cách chấm.
5. Kiểm tra cả retrieval lẫn answer, nhóm câu yếu, chi phí và thời gian.
6. Thử thêm câu chưa dùng để chỉnh cấu hình trước khi kết luận.

**Câu cốt lõi cần nhớ: “Tôi biết thay đổi này tốt hơn vì đã đo nó trên những câu hỏi đại diện cho nhu cầu thật.”**
