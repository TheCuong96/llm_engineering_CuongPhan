# Day 3 — Bản tóm tắt bài 012–014

> Đọc nhanh khoảng 3–5 phút. Dựa trên ba phụ đề bạn cung cấp; ví dụ tai nghe dưới đây được tự xây dựng để dễ hiểu.

## 1. Mục tiêu của cả phần

**Biến tin khuyến mãi viết bằng ngôn ngữ tự nhiên thành dữ liệu mà chương trình xử lý được, rồi gửi thông báo tới điện thoại.**

Ví dụ đầu vào:

> “Tai nghe X giá gốc 100 USD, giảm 30 USD, còn 70 USD.”

Đầu ra mong muốn:

```json
{
  "product_description": "Tai nghe X",
  "price": 70,
  "url": "https://example.com/deal-x"
}
```

Chương trình có thể đọc `price` để so sánh, lưu dữ liệu hoặc hiển thị; không cần tự tìm giá trong một đoạn trả lời dài.

## 2. Mỗi video dạy điều gì?

| Bài | Ý chính |
| --- | --- |
| **012** | Structured Outputs cho AI trả lời theo mẫu; Pydantic định nghĩa mẫu; constrained decoding giới hạn lựa chọn token để giữ đúng cấu trúc. |
| **013** | Thu thập khoảng 30 tin từ RSS/trang web, dùng AI chọn 5 tin có mô tả và giá rõ ràng, trả về danh sách `Deal`. |
| **014** | Đóng gói thành ScannerAgent; dùng Pushover gửi push. Claude viết lời thông báo hấp dẫn hơn là bước tùy chọn. |

## 3. Sáu khái niệm cần nhớ

| Thuật ngữ | Cách hiểu đơn giản |
| --- | --- |
| **Unstructured data — dữ liệu phi cấu trúc** | Nội dung dạng bài viết, quảng cáo hoặc email chưa theo mẫu dữ liệu ứng dụng cần. |
| **Structured Outputs — đầu ra có cấu trúc** | Yêu cầu phản hồi theo khuôn dữ liệu xác định. |
| **Pydantic** | Thư viện Python định nghĩa và kiểm tra dữ liệu; không phải AI. |
| **JSON Schema** | Quy định các ô cần có và kiểu dữ liệu của từng ô. |
| **Constrained Decoding** | Loại lựa chọn token làm sai cấu trúc trong lúc sinh phản hồi. |
| **Parsing — phân tích/chuyển đổi dữ liệu** | Đọc nội dung và chuyển thành dạng chương trình sử dụng được. |

Mô hình vẫn sinh token biểu diễn JSON. SDK mới chuyển phản hồi đó thành object Python.

## 4. Scanner làm gì, và chưa làm gì?

Scanner lấy nội dung bằng mã thông thường, đưa nội dung cho LLM, rồi nhận danh sách gồm:

- `product_description`: mô tả sản phẩm.
- `price`: giá bán thực tế.
- `url`: liên kết nguồn.

**Chọn tin rõ ràng chưa đồng nghĩa chọn được món hời nhất.** Muốn đánh giá mức hời còn cần so sánh giá bán với giá ước tính hoặc căn cứ đáng tin khác.

Đừng nhầm trách nhiệm:

| Thành phần | Việc chính |
| --- | --- |
| Mã đọc RSS/trang web | Thu thập nội dung. |
| Scanner | Chọn và trích xuất tin thành dữ liệu. |
| Bộ ước tính giá | Ước tính sản phẩm đáng giá bao nhiêu. |
| Bộ điều phối | Quyết định các bước và điều kiện hành động. |
| Messaging/Pushover | Soạn và chuyển thông báo. |

Bộ điều phối tự chủ được hẹn ở bài tiếp theo, chưa hoàn chỉnh trong ba bài này.

## 5. Điểm dễ hiểu sai nhất

**Đúng cấu trúc không bảo đảm đúng thông tin.**

Với tai nghe giá 70 USD, AI có thể trả `price: 30`. Giá trị 30 vẫn là số hợp lệ, nhưng đó là số tiền giảm.

Vì vậy phải kiểm tra giá, URL và điều kiện mua. Lời mô tả “hãy lấy giá đúng” trong schema không tự xác minh được thực tế. Cũng cần xử lý phản hồi bị từ chối hoặc không hoàn tất. Xem [Structured Outputs của OpenAI](https://developers.openai.com/api/docs/guides/structured-outputs).

## 6. Pushover cần hiểu đến đâu?

Pushover là dịch vụ chuyển push tới điện thoại. Hai khóa có vai trò khác nhau:

- **User Key:** người nhận — biến `PUSHOVER_USER` trong bài.
- **Application/API Token:** ứng dụng gửi — biến `PUSHOVER_TOKEN`.

Hãy lấy đúng trường được gắn nhãn, không nhận diện chỉ bằng chữ cái đầu của khóa. Xem [Pushover API](https://pushover.net/api).

**Không cần LLM để gửi thông báo.** Trong demo, Claude chỉ viết câu thông báo sinh động; mã ứng dụng gọi Pushover để gửi. Có thể thay phần viết bằng một mẫu câu cố định.

## 7. Điều nên mang theo sau bài học

1. Xác định rõ đầu ra trước: bạn cần những trường nào?
2. Dùng LLM để đọc hiểu và điền dữ liệu vào mẫu.
3. Kiểm tra nội dung trước khi hành động.
4. Dùng mã ứng dụng để lưu, so sánh hoặc gửi thông báo.

**Câu chốt:** AI đọc hiểu; schema định hình; chương trình kiểm tra và thực hiện hành động.

Nếu nhớ được câu này, bạn đã nắm được mục đích chính của cả ba video.
