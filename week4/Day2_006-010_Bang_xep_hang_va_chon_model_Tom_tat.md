# Day 2 — Bản tóm tắt bài 006–010

> Đọc nhanh: khoảng 4–5 phút. Dựa trên phụ đề 5 bài; các ví dụ ngắn là phần giải thích thêm. Thứ hạng và giá trong video thuộc thời điểm ghi hình, không phải khuyến nghị hiện tại.

## 1. Cả phần này muốn dạy điều gì?

**Biết dùng bảng xếp hạng để chọn vài mô hình AI đáng thử, rồi thử trên công việc thật để quyết định.**

Đây là phần học cách ứng dụng và đánh giá mô hình có sẵn. Chưa có hướng dẫn huấn luyện AI từ đầu. Việc giảng viên mở nhiều website nhằm cho bạn nhiều loại bằng chứng, không yêu cầu bạn học thuộc mọi bảng và tên mô hình.

| Bài | Điều cần hiểu |
| --- | --- |
| 006 | Biết nơi so sánh mô hình theo năng lực, chi phí và tốc độ |
| 007 | Đọc đúng chi phí thực tế và các loại tốc độ |
| 008 | Tìm benchmark sát lĩnh vực; kiểm tra độ mới và cách chấm |
| 009 | Xem người dùng thích câu trả lời nào qua thử nghiệm ẩn danh |
| 010 | Xác định AI sẽ mang lại giá trị gì cho sản phẩm |

## 2. Các website có vai trò gì trong bài?

| Nguồn | Dùng để hiểu điều gì? |
| --- | --- |
| Artificial Analysis | Năng lực, chi phí và tốc độ của mô hình khi đặt cạnh nhau |
| Vellum | So sánh context window, đơn giá input/output và tốc độ trong bảng được giới thiệu |
| SEAL | Năng lực chuyên biệt như dùng công cụ, phần mềm, dạy học; có Humanity’s Last Exam |
| Hugging Face | Nhiều leaderboard của nhiều nhóm; phải xem nguồn và ngày cập nhật từng bảng |
| LiveBench | Đánh giá với câu hỏi được làm mới để hạn chế nhiễm dữ liệu |
| LM Arena | Hai câu trả lời ẩn tên; người dùng chọn câu mình thích hơn |

**Benchmark** là bài/bộ đánh giá và cách chấm. **Leaderboard** là bảng so kết quả các mô hình. Điểm đứng đầu trên một bộ bài không có nghĩa đứng đầu mọi công việc.

HLE dùng câu hỏi chuyên sâu rất khó; video minh họa mô hình chấm bằng cách đối chiếu câu trả lời với đáp án tham chiếu. Hai bảng có thể khác điểm vì khác phiên bản hoặc thiết lập đánh giá.

## 3. Ba điều dễ đọc nhầm nhất

### Giá mỗi token ≠ chi phí hoàn thành công việc

Mô hình có đơn giá thấp nhưng dùng nhiều token suy luận hoặc cần thử lại nhiều lần vẫn có thể tốn hơn.

Ví dụ giả định: A giá 2 USD/triệu token, dùng 10.000 token → 0,02 USD. B giá 5 USD/triệu token, dùng 2.000 token → 0,01 USD. Ví dụ bỏ qua input, cache và công cụ.

**Cần so tổng chi phí để làm cùng một việc đạt yêu cầu.** Đây cũng là lý do Artificial Analysis đo chi phí dựa trên lượng token thực tế. [Phương pháp](https://artificialanalysis.ai/methodology).

### Sinh chữ nhanh ≠ hoàn thành sớm

- **Output speed:** sinh bao nhiêu token mỗi giây.
- **Độ trễ tới câu trả lời:** chờ bao lâu mới thấy nội dung trả lời.
- **Tổng thời gian:** bao lâu mới nhận đủ kết quả.

Mô hình suy luận lâu rồi sinh chữ rất nhanh vẫn có thể khiến người dùng chờ lâu hơn.

### Điểm cao ≠ phù hợp nhất

Trên biểu đồ có trục ngang là chi phí tăng dần và trục dọc là điểm tăng dần, **phía trên bên trái** thường đáng xem trước: điểm cao, chi phí thấp.

Nhưng vẫn phải xét tác vụ, tiếng Việt, độ trễ, giới hạn ngữ cảnh và cách triển khai. Dùng biểu đồ để lọc ứng viên, không chọn máy móc.

## 4. Đọc kết quả với những giới hạn nào?

- **Intelligence Index:** điểm tổng hợp; cần mở điểm thành phần sát việc của mình.
- **Context window:** sức chứa ngữ cảnh; lớn hơn không bảo đảm hiểu mọi chi tiết tốt hơn.
- **LiveBench:** làm mới câu hỏi để hạn chế “đã gặp đề thi”, không phải bảo đảm tuyệt đối không nhiễm. Nhóm tác giả mô tả cập nhật hàng tháng. [Bài báo](https://arxiv.org/abs/2406.19314).
- **LM Arena:** ẩn tên giúp giảm thiên kiến thương hiệu; bình chọn vẫn chịu ảnh hưởng sở thích. Câu được thích hơn chưa chắc đúng hơn.
- **Elo-style rating:** điểm sức mạnh tương đối từ so sánh đối đầu, giống ý tưởng Elo cờ vua; không phải phần trăm chính xác.
- **Suy luận nhiều hơn:** có thể giúp giải bài khó nhưng cũng tăng chi phí/thời gian, không phải luôn tốt hơn.

## 5. AI mang lại giá trị gì? — Bài 010

Có hai cách phân loại riêng:

| Theo giá trị | Ý nghĩa |
| --- | --- |
| Automation — tự động hóa | Làm hộ một tác vụ lặp lại |
| Augmentation — hỗ trợ tăng năng lực | Giúp người làm tốt hơn; ví dụ đề xuất sửa code để người duyệt |
| Differentiation — tạo khác biệt | Tạo trải nghiệm hoặc năng lực mới cho sản phẩm |

| Theo cách xây | Ý nghĩa |
| --- | --- |
| LLM wrapper | Tích hợp mô hình vào ứng dụng và quy trình |
| AI chuyên biệt | Kết hợp dữ liệu, kiến thức và công cụ của lĩnh vực |
| Agentic AI | Cho mô hình quyết định bước tiếp theo và dùng công cụ trong phạm vi cho phép |

Các nhóm có thể kết hợp. Không cần tự huấn luyện mô hình nền để tạo sản phẩm hữu ích.

**RAG** lấy tài liệu vào ngữ cảnh; **fine-tuning** huấn luyện thêm và thay đổi trọng số; **tools** giúp thực hiện hành động. Agent có thể đọc lỗi, sửa file, chạy test rồi quyết định sửa tiếp — vượt ra ngoài một lần hỏi/đáp.

## 6. Áp dụng ngay như thế nào?

1. Nêu rõ AI phải làm gì và kết quả nào được xem là đạt.
2. Đặt giới hạn chi phí và thời gian chờ.
3. Dùng leaderboard lọc 2–4 mô hình.
4. Cho các mô hình làm cùng bộ ví dụ thực tế.
5. So chất lượng, thời gian và chi phí; chọn theo yêu cầu sản phẩm.

Ví dụ: với AI dạy ngữ pháp A1, hãy đo **sửa đúng, giải thích tiếng Việt dễ hiểu và phản hồi ngắn**. Điểm toán cao chưa trả lời được những câu hỏi đó.

Cuối bài 010, giảng viên giới thiệu bài thực hành tiếp theo: dùng nhiều mô hình chuyển Python sang C++ rồi đánh giá. Mục tiêu là tập chọn mô hình bằng kết quả thật; chuyển ngôn ngữ không tự bảo đảm chương trình chạy nhanh hơn.

**Câu cần nhớ: Bảng xếp hạng cho biết nên thử ai; bài toán của bạn quyết định nên dùng ai.**
