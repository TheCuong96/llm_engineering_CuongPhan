# Day 5 — Ngày 5: Bản tóm tắt bài 033–037

> Viết lại từ 5 phụ đề SRT bạn cung cấp. Đọc bản này để hiểu nhanh; bản đầy đủ giải thích thêm ví dụ, code và các giới hạn của demo.

## 1. Ngày này thực sự dạy gì?

**Dạy bạn kết hợp code và nhiều lần gọi AI để xây một tính năng cụ thể.** Ví dụ là công cụ nhập website công ty rồi tạo **Sales Brochure — tài liệu giới thiệu công ty** cho khách hàng, nhà đầu tư hoặc ứng viên.

Đầu ra của demo là văn bản Markdown có tiêu đề và danh sách, chưa phải tờ quảng cáo được thiết kế thành PDF.

Bạn đang dùng mô hình có sẵn để xây ứng dụng. Không có bước huấn luyện model từ đầu hoặc cập nhật trọng số.

## 2. Nhớ quy trình này là hiểu cốt lõi

| Bước | Ai làm? | Làm gì? |
| --- | --- | --- |
| 1 | Code | Tải trang chủ, lấy nội dung và các liên kết |
| 2 | AI lần 1 | Chọn liên kết phù hợp, trả JSON |
| 3 | Code | Parse và kiểm tra JSON, tải các trang được chọn |
| 4 | Code | Ghép nội dung các trang thành prompt viết bài |
| 5 | AI lần 2 | Viết tài liệu giới thiệu bằng Markdown |
| 6 | Giao diện | Hiển thị kết quả, có thể hiển thị dần bằng streaming |

**Vì sao hai lần gọi?** Phải chọn tài liệu cần đọc trước, rồi mới có đủ dữ liệu để viết. Mỗi lần giải quyết một nhiệm vụ.

**Ai mở website?** Code tải trang. Trong demo, mô hình nhận dữ liệu được gửi vào prompt; đưa URL vào một lời gọi thông thường không tự khiến mô hình truy cập URL đó.

## 3. Mỗi video muốn truyền đạt điều gì?

| Video | Mục tiêu cần nhớ |
| --- | --- |
| **033 — Xây brochure generator** | Trang chủ chưa đủ thông tin; cần chọn thêm trang About, Products, Careers… AI giúp đánh giá mức độ liên quan |
| **034 — Prompt và JSON** | Viết chỉ dẫn rõ, đưa mẫu đầu ra và yêu cầu JSON để code sử dụng kết quả |
| **035 — Chaining** | Dùng kết quả AI lần 1 để thu thập dữ liệu cho AI lần 2 |
| **036 — Sinh bài và streaming** | Viết brochure, hiển thị dần, thử thay giọng văn bằng prompt |
| **037 — Ứng dụng và bài tập** | Tái sử dụng quy trình cho công việc riêng; làm gia sư AI và thử cải thiện prompt |

Trong phụ đề, demo chọn GPT-5 nano ở bước chọn link và GPT-4.1 mini ở bước viết. Bạn cần hiểu vai trò của hai bước; không cần học thuộc tên model hoặc bắt buộc dùng hai model khác nhau.

## 4. Các thuật ngữ quan trọng

| Thuật ngữ | Hiểu đơn giản |
| --- | --- |
| **System prompt — chỉ dẫn hệ thống** | Quy tắc làm việc: chọn loại link nào, trả kết quả kiểu gì |
| **User prompt — yêu cầu của lượt gọi** | Dữ liệu và nhiệm vụ cụ thể: website nào, danh sách link nào |
| **One-shot prompting** | Đưa một ví dụ để AI biết kết quả mong muốn; bài dùng mẫu JSON |
| **Few-shot / Multi-shot prompting** | Đưa nhiều ví dụ; nên dùng các cặp đầu vào–đầu ra rõ ràng |
| **JSON** | Dữ liệu có cấu trúc, thuận tiện cho chương trình đọc |
| **Markdown** | Văn bản có cách đánh dấu tiêu đề, danh sách… để hiển thị dễ đọc |
| **Chaining — nối các lần gọi** | Code dùng kết quả bước trước để chuẩn bị bước sau |
| **Streaming** | Nhận và hiển thị nội dung từng phần khi kết quả đến |

Ví dụ AI trả chuỗi chứa JSON:

```json
{"links": [{"type": "about", "url": "https://example.com/about"}]}
```

Python dùng `json.loads(text)` để biến chuỗi thành dữ liệu có thể truy cập. JavaScript tương ứng là `JSON.parse(text)`. Parse là xử lý bằng code, không phải thêm một lần gọi AI.

JSON mode không bảo đảm đúng schema; Structured Outputs bổ sung ràng buộc schema trên model hỗ trợ. Dù đúng cấu trúc, nội dung vẫn có thể sai. [Tài liệu chính thức](https://developers.openai.com/api/docs/guides/structured-outputs)

## 5. Sáu điểm rất dễ hiểu sai

1. **Đưa ví dụ không phải huấn luyện lại AI.** Ví dụ chỉ giúp hướng dẫn trong ngữ cảnh được gửi vào.
2. **Hai lần gọi không tự có chung trí nhớ.** Code phải truyền dữ liệu cần thiết giữa các bước.
3. **5.000 ký tự không phải 5.000 token.** Cắt văn bản để giảm đầu vào còn có thể làm mất thông tin của các trang nằm cuối.
4. **Streaming không loại bỏ mọi thời gian chờ.** Bước chọn link và tải trang vẫn phải chạy trước khi bắt đầu viết.
5. **Brochure viết hay chưa chắc đúng.** Có thể sáng tạo cách diễn đạt; không nên bịa khách hàng, số liệu hoặc chứng nhận.
6. **Demo chưa phải sản phẩm hoàn chỉnh.** Cần xử lý lỗi tải trang, kiểm tra URL, dữ liệu, chi phí và chất lượng đầu ra.

Trong Chat Completions, bản thường đọc `message.content`; bản streaming đọc phần mới ở `delta.content` và nối dần lại. Một chunk không nhất thiết bằng một token. [Tham chiếu API](https://developers.openai.com/api/reference/resources/chat)

## 6. Bạn nên thực hành gì?

- **Đổi đối tượng brochure:** chỉ viết cho ứng viên; quan sát mục nào được ưu tiên hoặc bỏ đi.
- **Thêm lần gọi thứ ba:** dịch brochure sang tiếng Việt, giữ cả bản gốc và bản dịch.
- **Làm AI Tutor:** nhập câu hỏi kỹ thuật, yêu cầu giải thích phù hợp với nền tảng React/TypeScript của bạn; thử OpenAI và/hoặc model qua Ollama.

Prompt gia sư mẫu:

```text
Giải thích bằng tiếng Việt cho người biết React/TypeScript nhưng mới học AI.
Nêu khái niệm và mục đích trước, sau đó cho một ví dụ dễ hiểu.
Giữ thuật ngữ tiếng Anh và kèm nghĩa tiếng Việt.
Nêu một nhầm lẫn thường gặp; kết thúc bằng 3 ý cần nhớ.
Tránh lặp ý và không dùng thuật ngữ mới mà chưa giải thích.
```

Thử nghiệm bằng cùng một nhóm câu hỏi, kiểm tra độ đúng, độ rõ và độ dài. Thêm ví dụ tốt khi cần; nhiều ví dụ hơn không tự động cho kết quả tốt hơn.

**Điều cần mang theo sau Ngày 5:** biết chia công việc thành bước rõ ràng, để code thu thập và kiểm tra dữ liệu, giao AI xử lý ngôn ngữ, rồi nối kết quả thành một tính năng hữu ích.
