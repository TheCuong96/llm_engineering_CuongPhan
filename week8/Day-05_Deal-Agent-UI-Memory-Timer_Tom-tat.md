# Day 5 — Tóm tắt nhanh: hoàn thiện ứng dụng AI Agent săn deal

> **Cả phần này muốn dạy gì?** Ghép hệ thống AI đã xây thành ứng dụng có giao diện, lưu lịch sử, tự chạy lại theo chu kỳ và gửi thông báo khi tìm được deal đáng chú ý.
>
> Tóm tắt từ phụ đề 019–021 và HTML 022 được cung cấp; không phải phần huấn luyện mô hình mới.

## 1. Mỗi bài nói về điều gì?

| Bài | Điều cần nhớ |
|---|---|
| 019 | Agent có thể dùng công cụ và điều phối nhiều bước để đạt mục tiêu; ngày cuối bổ sung khả năng vận hành tự động và lịch sử |
| 020 | Tạo giao diện Gradio, lớp kết nối DealAgentFramework, memory JSON và timer 5 phút |
| 021 | Chạy demo hoàn chỉnh và nối lại các kiến thức của 8 tuần |
| 022 | Giới thiệu các khóa học và ưu đãi; không có kỹ thuật mới cần học |

## 2. Ứng dụng làm gì?

**Lấy deal → đọc thành dữ liệu có cấu trúc → ước lượng giá → đánh giá cơ hội → thông báo và lưu kết quả nếu phù hợp.**

Giao diện hiển thị lịch sử deal và log. Bộ hẹn giờ kích hoạt lại công việc khoảng mỗi 5 phút.

Ví dụ minh họa: giá bán tai nghe là 80 USD, giá AI ước lượng là 120 USD. Hệ thống thấy chênh lệch 40 USD và có thể đề xuất xem xét. **Giá ước lượng có thể sai; đề xuất không chứng minh đó chắc chắn là món hời.** Demo gửi thông báo, không mô tả tự mua hàng.

## 3. Sáu thành phần cần hiểu

| Thành phần | Hiểu đơn giản |
|---|---|
| Agent loop | Trong một lần chạy, chọn bước tiếp theo, gọi tool và xem kết quả |
| DealAgentFramework | Module tự viết để kết nối, khởi động, ghi log và quản lý lịch sử |
| Memory | Sổ ghi các deal cũ, lưu trong `memory.json` |
| Pydantic | Giúp dữ liệu có cấu trúc và chuyển sang/từ JSON; không bảo đảm nội dung đúng thực tế |
| Gradio | Giao diện gồm tiêu đề, bảng deal, vùng log và các callback |
| Timer | Đồng hồ kích hoạt một lần chạy mới mỗi 5 phút |

**Phân biệt quan trọng nhất:** agent loop quyết định *làm gì tiếp*; timer quyết định *khi nào chạy lại*; memory giữ *những gì đã xảy ra*.

## 4. Vì sao memory không có gì quá bí ẩn?

Ứng dụng ghi lịch sử ra file rồi đọc lại khi cần. LLM chỉ biết lịch sử nếu chương trình đưa nó vào context hoặc cung cấp qua tool.

- Ghi JSON **không phải** fine-tuning.
- Có memory **không bắt buộc** phải có vector database.
- Có lịch sử giúp xây cơ chế chống lặp, nhưng **không tự bảo đảm** sẽ không gửi trùng.
- Hàm reset trong demo giữ lại hai mục; phụ đề chưa nhất quán về việc giữ hai mục đầu hay cuối.

## 5. Cần nhìn gì khi xem demo?

- **Bảng phía trên:** các deal đã tìm được.
- **Log phía dưới:** scanner, bộ định giá và các agent đang làm gì.
- **Lúc chờ mô hình từ xa:** có thể là thời gian khởi động, không nhất thiết là lỗi.
- **Thông báo và dòng mới trong bảng:** cho thấy workflow đã đi đến kết quả.

Mô hình fine-tune chạy trên Modal được mô tả là chờ khoảng 30 giây trong demo; đây không phải thời gian cố định cho mọi lần chạy. Hình 3D được giảng viên nói là để đẹp, không phải chức năng kinh doanh thiết yếu.

## 6. Những điều dễ hiểu nhầm

| Hiểu nhầm | Cách hiểu đúng |
|---|---|
| Bài cuối dạy mô hình AI mới | Chủ yếu hoàn thiện ứng dụng quanh các mô hình đã có |
| Chạy mỗi 5 phút là đủ để gọi là agent | Tính agentic còn nằm ở việc LLM điều phối và dùng công cụ |
| Có timer thì ứng dụng tự chạy mãi | Môi trường và tiến trình vẫn phải hoạt động; chưa thể kết luận hành vi khi đóng UI từ phụ đề |
| Càng nhiều agent/call càng tốt | Phải đo chất lượng, chi phí và độ trễ |
| Xem hết khóa học là đủ năng lực nghề nghiệp | Cần tự xây, đánh giá, sửa lỗi và giải thích được hệ thống |

## 7. Thông điệp tổng kết của khóa học

Bạn đã đi qua: **gọi LLM → dùng API/tool → làm việc với mô hình mở → chọn mô hình → RAG → đánh giá và fine-tuning → ensemble và agent workflow**.

Điều cần giữ lại không phải “fine-tuning luôn tốt nhất” hay “mô hình lớn luôn thắng”. Hãy chọn kỹ thuật dựa trên nhiệm vụ và kết quả đo được.

**Việc nên thực hành ngay:** dùng ba deal giả để tạo bảng, lưu/đọc JSON và ghi log một vòng xử lý. Khi hiểu luồng đó, mới ghép scanner và bộ định giá thật.

**Một câu để nhớ:** Day 5 biến những phần AI rời rạc thành một ứng dụng săn deal có thể quan sát, giữ lịch sử và lặp lại công việc.
