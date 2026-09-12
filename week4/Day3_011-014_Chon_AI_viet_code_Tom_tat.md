# Day 3 — Chọn AI viết code bằng kết quả thực tế
## Bản tóm tắt — Bài 011–014

**Ý chính: chọn AI bằng kết quả trên công việc của mình. Leaderboard chỉ giúp chọn những model đáng thử.**

## 1. Video đang muốn giải quyết điều gì?

Có một đoạn Python tính toán mất khoảng **19 giây**. Giảng viên nhờ các model chuyển nó sang **C++**, sau đó biên dịch và chạy để xem model nào tạo chương trình **đúng và nhanh nhất**.

Bài tính là xấp xỉ π bằng một chuỗi có nhiều số hạng. Thử nghiệm ở bài 013 dùng **200 triệu vòng lặp**; con số 100.000 được nói trước đó đã được giảng viên đính chính.

**C++ là phương tiện thử nghiệm. Điều cần học là cách xác định mục tiêu và đánh giá AI.** Đây là dùng model có sẵn qua API, chưa phải huấn luyện model hay xây agent xử lý cả dự án.

## 2. Mỗi video đóng góp một phần

| Bài | Ý cần nhớ |
| --- | --- |
| 011 | Hỏi “cần giải quyết vấn đề gì, đo thành công ra sao?” trước khi chọn AI/framework |
| 012 | Dùng benchmark lập trình để chọn GPT-5, Claude, Grok và Gemini; chuẩn bị môi trường |
| 013 | Gửi code cho GPT-5, nhận C++, biên dịch và đo mức tăng tốc khoảng 230× |
| 014 | Thử các model còn lại; Gemini dẫn đầu bài thử được tổng kết dù không đứng đầu bảng chung |

Quy trình khóa học: **Hiểu yêu cầu → Chọn ứng viên → Làm prototype và đo → Tùy chỉnh nếu cần → Đưa vào vận hành.**

## 3. Các thành phần dễ nhầm

| Thành phần | Công việc |
| --- | --- |
| Cursor | Môi trường mở dự án và chạy notebook |
| Python/notebook | Chuẩn bị yêu cầu, gọi API, lưu và chạy mã |
| LLM | Viết lại mã nguồn Python thành C++ |
| Compiler | Biên dịch C++ thành chương trình thực thi |
| CPU | Chạy chương trình tính toán |

LLM sinh mã xong thì chương trình tính toán có thể chạy mà không gọi AI tiếp. Dùng thư viện client OpenAI để kết nối không có nghĩa mọi yêu cầu đều dùng model OpenAI.

## 4. Kết quả trong video

| Model | Tăng tốc so với bản Python |
| --- | ---: |
| Claude Sonnet 4.5 | 148× |
| GPT-5 | 233× |
| Grok 4 | 1.060× |
| Gemini 2.5 Pro | 1.440× |

Đây là **bảng tổng kết của giảng viên**, không phải xếp hạng hiện tại hay kết quả tôi chạy lại. Bài 013 nói khoảng 230×; bài 014 tổng kết 233×. Một đoạn bình luận về Claude thay đổi sau khi chạy lại, nên không nên ghép mọi nhận xét thành cùng một lần thử. Tên tệp ghi “Groq”, nhưng nội dung nói **Grok 4**.

```text
Hệ số tăng tốc = thời gian chạy Python / thời gian chạy C++
```

**233× là tốc độ chương trình được tạo ra, không phải tốc độ AI trả lời.** Thời gian AI sinh mã và thời gian biên dịch là hai đại lượng riêng.

## 5. Vì sao tăng tốc được nhiều?

- **C++ biên dịch:** giảm chi phí của vòng lặp Python thuần.
- **Loop unrolling:** thực hiện nhiều bước trong một lượt lặp; GPT-5 dùng cách này ở bản mã được trình diễn.
- **Multithreading:** chia tính toán cho nhiều luồng; Grok và Gemini sử dụng.
- **Đơn giản hóa phép tính:** Gemini còn giảm số phép toán theo mô tả của giảng viên.

Tốc độ đo được là kết quả kết hợp các thay đổi này. Nó không chứng minh mọi đoạn C++ đều nhanh hơn Python theo tỷ lệ trên.

## 6. Ba giới hạn phải nhớ

1. **Một bài thử chưa đại diện mọi công việc:** kết quả phụ thuộc đề bài, mã sinh ra, phần cứng và cấu hình suy luận; Claude chưa được dùng chế độ suy nghĩ đáng kể trong phép thử.
2. **Môi trường khác có thể đổi thứ hạng:** trên trang chạy online, mã Gemini không còn vượt mã GPT-5 như trên máy giảng viên.
3. **Nhanh phải đi kèm đúng:** cần kiểm tra nhiều đầu vào và sai số; phụ đề không thể hiện một bộ kiểm thử đầy đủ. Chạy một bản mã nhiều lần cũng khác với cho AI sinh nhiều bản để đo độ ổn định.

## 7. Áp dụng cho bạn

*Ví dụ bổ sung:* khi dùng AI tối ưu bảng React, hãy xác định hành vi phải giữ, đo bản gốc, giao cùng đề cho các model, kiểm tra tính đúng rồi so thời gian render trong cùng môi trường. Sau đó cân nhắc cả chi phí và khả năng bảo trì.

**Câu ghi nhớ: “Model nổi tiếng nhất” là thông tin tham khảo; “model giải quyết tốt yêu cầu đã đo của mình” mới là căn cứ lựa chọn.**

Nguồn: phụ đề tiếng Anh của bốn bài 011–014 đính kèm. Bản đầy đủ đi sâu vào từng bước, các hàm trong lab, cách đọc kết quả và mẫu yêu cầu tự thực hành.
