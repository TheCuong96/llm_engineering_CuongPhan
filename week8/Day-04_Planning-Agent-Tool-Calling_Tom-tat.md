# Day 4 — Bản tóm tắt nhanh: Planning Agent và Tool Calling

> Tổng hợp từ phụ đề bốn bài 015–018. Đọc bản này để nắm ý trước; bản đầy đủ giải thích cơ chế, ví dụ và các điểm dễ nhầm.

## 1. Phần này muốn dạy gì?

**Xây một agent điều phối biết sử dụng các công cụ để tìm ưu đãi, ước tính giá trị sản phẩm và gửi thông báo về ưu đãi tốt nhất.**

Ví dụ đời thường: một trợ lý tìm laptop giá tốt, hỏi bên định giá rồi nhắn kết quả cho bạn. Trong ứng dụng, mỗi việc do một thành phần phần mềm thực hiện.

Đây là việc **kết nối và điều phối các năng lực đã có**. Day 4 không huấn luyện một mô hình như ChatGPT từ đầu.

## 2. Bốn bài nối với nhau thế nào?

| Bài | Ý chính |
| --- | --- |
| 015 | Hiểu Agentic AI và kiến trúc các agent |
| 016 | Dùng ba hàm giả để học cơ chế yêu cầu gọi công cụ |
| 017 | Thêm vòng lặp, thay hàm giả bằng agent thật, chạy toàn bộ quy trình |
| 018 | Tổng kết lần chạy gồm nhiều mô hình và 34 lượt gọi |

## 3. Các thành phần cần nhớ

| Thành phần | Cách hiểu đơn giản |
| --- | --- |
| Planning Agent | Người điều phối: chọn công cụ cần gọi tiếp |
| Scanner Agent | Tìm và chọn các ưu đãi từ nguồn web/RSS |
| Ensemble Agent | Phối hợp các bộ phận định giá sản phẩm |
| Messaging Agent | Soạn nội dung và gửi thông báo qua Pushover |

Ensemble sử dụng Specialist đã fine-tune trên Modal, Frontier có RAG và một mạng nơ-ron định giá. Planner chỉ cần gọi tool định giá, không cần trực tiếp điều khiển từng mô hình bên trong.

## 4. Tool Calling thực sự hoạt động ra sao?

1. Chương trình đưa cho LLM mục tiêu và danh sách công cụ.
2. LLM trả về tên công cụ muốn dùng và các đối số.
3. **Chương trình thực thi hàm**, không phải LLM tự chạy hàm.
4. Kết quả được đưa trở lại cho LLM.
5. LLM chọn bước tiếp theo hoặc kết thúc.

**Tool** là chức năng ứng dụng cung cấp. **Tool schema** mô tả tên, mục đích và tham số của chức năng đó. Một tool có thể gọi API, tính toán hoặc gọi một agent khác.

**Agent Loop** là việc lặp lại “hỏi mô hình → chạy công cụ → trả kết quả”. Một vòng `while` tự nó chưa đủ; mô hình phải dùng kết quả để tiếp tục nhiệm vụ.

## 5. Vì sao giảng viên dùng hàm giả trước?

Ba hàm giả gồm: trả danh sách ưu đãi cố định, luôn định giá 300 USD và giả lập gửi thông báo.

Mục đích là kiểm tra **luồng điều phối** mà chưa phụ thuộc vào web, model thật hoặc điện thoại. Giá 300 USD không có ý nghĩa đánh giá sản phẩm.

Khi luồng hoạt động, thay phần thân hàm bằng `scanner.scan()`, `ensemble.price()` và `messenger.notify()`. Giao diện công cụ giữ nguyên nên Planner gần như không cần thay đổi cách sử dụng.

## 6. “Ưu đãi tốt nhất” nghĩa là gì?

Ví dụ bổ sung: sản phẩm bán 650 USD, mô hình ước tính 850 USD → chênh lệch 200 USD.

Nhưng **giá ước tính không phải giá trị thật đã được xác minh**. Đồng thời, ưu đãi có chênh lệch tiền lớn nhất có thể không có tỷ lệ giảm cao nhất. Muốn chọn nhất quán phải quy định tiêu chí cụ thể.

## 7. Những điểm dễ hiểu nhầm

- **34 lượt gọi ≠ 34 agent:** một agent có thể gọi nhiều mô hình nhiều lần. Giảng viên đếm lần demo là 29 lượt gọi được gọi chung là LLM và 5 lượt mạng nơ-ron; đây không phải số cố định của mọi lần chạy.
- **“OK” ≠ đã thành công:** không còn tool call là điều kiện dừng của demo; ứng dụng cần kiểm tra kết quả thực tế.
- **Tự chủ ≠ luôn làm đủ:** ở lần chạy giả, giảng viên nhận xét có năm ưu đãi nhưng chỉ định giá bốn. Nếu yêu cầu phải xử lý hết, cần kiểm tra bằng code.
- **Vòng lặp ≠ chạy nền 24/7:** bộ lập lịch và việc duy trì tác vụ là vấn đề riêng.
- **Lịch sử lần chạy ≠ memory lâu dài:** cuối bài 018, memory vẫn là phần hẹn bổ sung ngày tiếp theo.
- **Nhiều agent ≠ tốt hơn:** hãy chia theo nhu cầu thực của bài toán, tránh thêm vai trò chỉ vì tên nghe giống một đội ngũ con người.

Tên file 016 nhắc GPT-4, nhưng lời giảng nói GPT-5.1. Điểm cần học là cơ chế điều phối, không phải thuộc lòng tên model.

## 8. Câu chốt để nhớ

**Planning Agent chọn việc tiếp theo; tool thực hiện công việc; Agent Loop đưa kết quả trở lại để mô hình tiếp tục quyết định.**

Nếu giải thích được câu này và vì sao có thể thay hàm giả bằng agent thật, bạn đã nắm được trọng tâm của cả bốn bài.
