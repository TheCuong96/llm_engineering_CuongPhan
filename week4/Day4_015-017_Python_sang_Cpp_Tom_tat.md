# Day 4 — Bản tóm tắt video 015–017

## 1. Phần này muốn dạy bạn điều gì?

**Cách chọn mô hình AI bằng kết quả thực tế của công việc cần làm.**

Bài toán: nhờ nhiều mô hình chuyển chương trình Python tính gần đúng π sang C++, rồi kiểm tra và đo xem chương trình mới chạy nhanh đến đâu.

Bạn đang học cách xây ứng dụng dùng AI và đánh giá đầu ra. Phần này không hướng dẫn huấn luyện AI từ đầu.

## 2. Mỗi video đóng góp gì?

| Video | Nội dung | Ý cần nhớ |
| --- | --- | --- |
| 015 | Xem bảng đánh giá, chọn Qwen/DeepSeek/GPT-OSS, chuẩn bị local và API | Chọn ứng viên theo công việc và khả năng sử dụng |
| 016 | Dựng Gradio, nhập Python, chọn mô hình, nhận C++ | Kết nối giao diện với hàm gọi AI rồi kiểm tra code |
| 017 | Thử Qwen 3 Coder và GPT-OSS 120B, tổng hợp kết quả | Mô hình lớn hơn chưa chắc tốt hơn trong một lần thử |

## 3. Phân biệt những tên dễ nhầm

| Tên | Là gì trong bài? |
| --- | --- |
| Qwen, DeepSeek, GPT-OSS | Mô hình viết code |
| Ollama | Công cụ chạy mô hình trên máy cá nhân |
| OpenRouter | Dịch vụ gọi mô hình qua API |
| Groq | Nền tảng chạy AI; bài dùng để gọi GPT-OSS 120B |
| Grok 4 | Một mô hình khác, có trong bảng kết quả buổi trước |
| Gradio | Công cụ tạo giao diện thử nghiệm |

Mô hình mở có thể chạy local hoặc qua cloud. Local thường không tính phí API theo token nhưng vẫn dùng tài nguyên máy; dịch vụ cloud có thể thu phí dù mô hình là mở.

## 4. Ứng dụng hoạt động thế nào?

1. Nhập Python và chọn mô hình.
2. Bấm **Convert Code** để gọi hàm `port`.
3. Hàm gửi code, yêu cầu chuyển đổi và thông tin hệ thống đến mô hình.
4. C++ được hiển thị và lưu vào `main.cpp`.
5. Giảng viên chạy bước biên dịch và đo thời gian riêng trong notebook.

Nếu quen React, đây gần giống nút `onClick` gọi backend, rồi lấy kết quả cập nhật giao diện.

## 5. Kết quả đáng chú ý

Bảng dưới lấy từ màn hình tổng kết video 017, khoảng 04:25–05:45; đây là **kết quả thí nghiệm của giảng viên**, không phải thứ hạng AI hiện tại.

| Mô hình | C++ nhanh hơn Python gốc |
| --- | --- |
| Gemini 2.5 Pro | 1.440× |
| Grok 4 | 1.060× |
| GPT-OSS 20B — local | 238× |
| GPT-5 | 233× |
| Claude Sonnet 4.5 | 184× |
| Qwen 3 Coder 30B — OpenRouter | 168× |
| DeepSeek Coder v2 — local | 168× |
| GPT-OSS 120B — Groq | 14× |
| Qwen 2.5 Coder — local | Không hoàn tất thành công |

Dấu chấm trong 1.440× và 1.060× phân cách hàng nghìn. Các hệ số là số làm tròn ghi trên màn hình. Bảng đã sửa những chỗ phụ đề nhận dạng sai số.

**GPT-OSS 20B mất khoảng năm phút để sinh code, nhưng code đó chạy khoảng 0,08 giây.** Thời gian AI viết code và thời gian chương trình chạy là hai đại lượng khác nhau. “238×” nói về chương trình C++, không phải tốc độ AI trả lời.

## 6. Đọc kết quả sao cho đúng?

- **20B thắng 120B trong lần thử này:** chưa đủ để nói 20B luôn giỏi hơn.
- **Qwen 2.5 thất bại một lần:** chưa đủ để kết luận cả họ Qwen không viết được C++.
- **Groq trả lời nhanh:** không bảo đảm code được tạo ra chạy nhanh.
- **Leaderboard theo mức sử dụng của OpenRouter:** thể hiện mức được dùng trên nền tảng, không phải điểm chất lượng trực tiếp.
- **Chạy lại cùng code:** kiểm tra dao động thời gian; muốn biết AI ổn định không, cần yêu cầu sinh code nhiều lần độc lập.

Giảng viên cũng thừa nhận giới hạn này. Phỏng đoán `pragma` làm code 120B chậm chưa được chứng minh.

## 7. Cách áp dụng cho bạn

Với React, TypeScript hoặc viết test, hãy chọn vài mô hình, giao cùng nhiệm vụ và kiểm tra theo tiêu chí của dự án. Ưu tiên code đúng yêu cầu trước khi so tốc độ, chi phí hoặc độ dài câu trả lời.

**Quy trình cần nhớ:** xác định việc cần làm → chọn ứng viên → thử cùng đầu vào → kiểm tra tính đúng → đo kết quả → chọn mô hình phù hợp.

Đọc bản đầy đủ cùng bộ để hiểu chi tiết prompt, ánh xạ model/client, cách đo và các giới hạn của thí nghiệm.
