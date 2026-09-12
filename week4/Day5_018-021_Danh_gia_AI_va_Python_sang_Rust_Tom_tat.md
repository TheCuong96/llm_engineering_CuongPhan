# Day 5 — Tóm tắt nhanh video 018–021

> Mục tiêu: hiểu phần học này muốn truyền đạt gì trước khi đọc bản đầy đủ. Kết quả dưới đây thuộc thử nghiệm trong video, không phải bảng xếp hạng mô hình hiện tại.

## 1. Ý chính của cả phần

**Muốn chọn AI phù hợp, phải xác định “làm tốt” nghĩa là gì, rồi đo trên công việc thật.**

Ví dụ của bài: cho nhiều mô hình chuyển chương trình Python sang Rust, yêu cầu **kết quả tính toán không đổi và thời gian chạy giảm**. Đây là ứng dụng mô hình có sẵn để sinh mã, không phải huấn luyện AI từ đầu hay khóa học Rust chuyên sâu.

| Video | Điều cần hiểu |
|---|---|
| 018 | Phân biệt chỉ số kỹ thuật với kết quả người dùng/doanh nghiệp cần |
| 019 | Chuẩn bị công cụ và bài toán để kiểm tra khả năng chuyển mã |
| 020 | Thử nhiều mô hình; tìm ra lỗi và lợi ích của đổi thuật toán |
| 021 | Tổng kết kết quả, giới hạn của thử nghiệm và hướng mở rộng |

## 2. Hai nhóm chỉ số đánh giá

- **Technical metrics — chỉ số kỹ thuật:** loss, perplexity, precision, recall, F1… Cho biết mô hình thực hiện một nhiệm vụ đo được tốt đến đâu.
- **Outcome metrics — chỉ số kết quả:** mức hài lòng, thời gian tiết kiệm, chi phí giảm, doanh thu… Cho biết giải pháp có tạo giá trị không.

Ví dụ: chatbot trả lời đúng nhưng quá chậm hoặc giao diện khó dùng thì người dùng vẫn không hài lòng. Cần đo cả chất lượng mô hình lẫn trải nghiệm tổng thể.

Trong bài này, thời gian chạy chương trình là thước đo trực tiếp của mục tiêu tăng tốc; **đúng kết quả là điều kiện bắt buộc trước khi so tốc độ**.

## 3. Công cụ hoạt động thế nào?

1. Chạy Python gốc để có kết quả và thời gian tham chiếu.
2. Chọn mô hình, gửi mã và yêu cầu chuyển sang Rust.
3. Nhận mã Rust, biên dịch rồi chạy.
4. Đối chiếu kết quả và ghi thời gian.

**Cursor** là nơi mở/chạy notebook; **Gradio** tạo giao diện và nối nút bấm với hàm xử lý; **LLM** sinh mã; **Rust compiler** biên dịch mã. Mô hình có thể chạy local hoặc qua dịch vụ đám mây. **Groq** là dịch vụ, khác với mô hình **Grok 4**.

## 4. Bài toán và lý do tăng tốc

Bài toán **maximum subarray sum**: tìm đoạn **liên tiếp** có tổng lớn nhất.

Ví dụ `[-2, 3, -1, 4, -5]` → chọn `[3, -1, 4]` → tổng `6`.

Trong video: mỗi mảng có 10.000 số từ −10 đến 10, thực hiện 20 lượt và cộng kết quả, thu được **10980**. Bộ sinh số giả ngẫu nhiên dùng quy tắc và seed xác định để các ngôn ngữ tạo cùng dữ liệu.

- Python gốc thử các điểm đầu/cuối bằng hai vòng lặp: **O(n²)**.
- Mô hình thành công dùng **Kadane**, duyệt một lượt: **O(n)**.
- Rust được biên dịch thành mã máy, tiếp tục giúp giảm thời gian thực thi.

**Tăng tốc đến từ cả đổi thuật toán và chuyển ngôn ngữ. Viết Kadane bằng Python cũng có thể cải thiện mạnh bản gốc.**

## 5. Kết quả trong video

| Mô hình | Thời gian chạy mã đúng được ghi nhận |
|---|---:|
| GPT-OSS 120B | 304 micro giây — thứ 1 |
| Grok 4 | 317 micro giây — thứ 2 |
| GPT-OSS 20B | 341 micro giây — thứ 3 |

Qwen 2.5 Coder, DeepSeek Coder v2, Qwen3 Coder 30B, Claude Sonnet 4.5, GPT-5 và Gemini 2.5 Pro bị đánh dấu fail trong lượt thử. Có lỗi kiểu số hoặc định dạng; luật thử không cho sửa để cứu kết quả.

Phần tổng kết tính `33,755 / 0,000304 ≈ 111.036 lần`. Màn hình Python ở một đoạn khác hiển thị khoảng 33,472 giây; nên hiểu mức tăng tốc là xấp xỉ **110.000 lần trong thí nghiệm này**.

## 6. Bốn điều dễ hiểu nhầm

1. **304 µs là thời gian mã chạy**, không phải thời gian AI viết mã.
2. **Một lượt thắng không chứng minh mô hình tốt nhất mọi việc.** Khác prompt, cấu hình hoặc cho sửa lỗi có thể đổi kết quả.
3. **Một kết quả khớp chưa chứng minh đúng mọi trường hợp.** Cần thử mảng toàn âm, một phần tử, nhiều seed và kích thước.
4. **Rust không luôn nhanh hơn Python 100.000 lần.** So sánh này thay cả thuật toán; ba thời gian rất gần nhau cũng cần đo lặp để xác nhận thứ hạng.

## 7. Cách áp dụng sau bài học

**Xác định mục tiêu → chọn ứng viên → kiểm tra tính đúng → đo nhiều lần → so chi phí và tốc độ → quyết định.**

Có thể mở rộng công cụ để thêm comment/docstring, sinh unit test, chuyển sang Go hoặc dùng agent đọc nhiều file và lặp sửa theo lỗi compiler/test. Đây là các hướng bài tập, chưa phải hệ thống hoàn chỉnh đã được triển khai trong phần này.

Điều quan trọng nhất mang sang công việc front-end: **khi AI đề xuất tối ưu, hãy kiểm tra hành vi và đo trước/sau; tên mô hình và vẻ thuyết phục của đoạn code chưa đủ để kết luận.**

*Nguồn: phụ đề video 018–021 và khung hình kết quả ở 020 khoảng 00:55, 021 khoảng 06:48. Ví dụ nhỏ và lưu ý đánh giá được bổ sung để giải thích dễ hiểu.*
