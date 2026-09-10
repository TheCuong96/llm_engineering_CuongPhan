# Ngày 4 — Tool Calling | Bản tóm tắt video 015–019

> Đọc nhanh để nắm mạch bài. Biên soạn từ phụ đề tiếng Anh đính kèm; ví dụ giá là dữ liệu học tập.

## 1. Cả phần đang dạy điều gì?

**Xây chatbot có thể dùng chức năng của ứng dụng để tra dữ liệu thật và thực hiện công việc.** Ví dụ xuyên suốt: trợ lý hãng hàng không tra giá vé, so sánh nhiều thành phố, rồi dùng SQLite làm nguồn dữ liệu.

Bạn đang xây ứng dụng dùng LLM có sẵn; không huấn luyện mô hình mới. Demo hoàn thành phần tra giá; đặt vé thật là hướng mở rộng.

## 2. Mục tiêu của từng video

| Video | Điều cần nhớ |
|---|---|
| **015 — Bản chất tool calling** | LLM sinh yêu cầu gọi hàm. Chương trình của bạn chạy hàm rồi trả kết quả về LLM. |
| **016 — Ứng dụng và Agentic AI** | Tools dùng để tra cứu, thực hiện hành động, tính toán, chạy mã, cập nhật UI; còn có thể gọi LLM khác và quản lý kế hoạch. |
| **017 — Xây chatbot hàng không** | Viết hàm tra giá, khai báo schema, gửi `tools`, nhận tool call, thực thi và gửi kết quả về. |
| **018 — Nhiều tool calls** | Xử lý cả nhiều yêu cầu trong một phản hồi lẫn nhiều vòng yêu cầu phụ thuộc nhau. |
| **019 — SQLite** | Thay dictionary bằng DB; giữ cách gọi hàm. Nhận ra giới hạn về lịch sử, streaming và mở rộng tool ghi dữ liệu. |

## 3. Luồng hoạt động phải hiểu

Ví dụ: «Giá vé London bao nhiêu?»

1. Backend gửi câu hỏi, lịch sử và mô tả tools cho LLM.
2. LLM yêu cầu `get_ticket_price("London")`.
3. Backend kiểm tra và chạy hàm, nhận giá 799 USD.
4. Backend thêm **yêu cầu gọi tool + kết quả tool** vào lịch sử rồi gửi lại LLM.
5. LLM trả lời người dùng bằng ngôn ngữ tự nhiên.

Một câu hỏi dùng tool thường cần ít nhất hai lần gọi LLM trong luồng này. Câu chào có thể không dùng tool; tác vụ phức tạp có thể cần nhiều vòng.

**Schema chỉ mô tả hàm, không phải mã thực thi.** LLM không tự truy cập máy bạn để chạy Python.

## 4. Các tên kỹ thuật cần nhớ

| Tên | Nghĩa |
|---|---|
| `tools` | Danh sách mô tả công cụ đưa cho LLM. |
| `name`, `description`, `parameters` | Tên, công dụng và đối số của hàm. |
| `tool_calls` | Các yêu cầu gọi công cụ do mô hình trả về. |
| `arguments` | Đối số; trong luồng của bài thường cần giải mã từ chuỗi JSON. |
| `role: "assistant"` | Chứa yêu cầu gọi tool của mô hình. |
| `role: "tool"` | Chứa kết quả do chương trình thực thi. |
| `tool_call_id` | Ghép kết quả với đúng yêu cầu gọi tool. |

Cấu trúc message trên theo Chat Completions trong video; có thể đối chiếu ở [OpenAI — Function calling](https://developers.openai.com/api/docs/guides/function-calling).

## 5. Hai kiểu «nhiều lần gọi»

| Tình huống | Cách xử lý |
|---|---|
| «So sánh London và Paris» | Một phản hồi có thể chứa hai tool calls. Dùng `for` xử lý tất cả và trả kết quả cho từng ID. |
| «Tra London; nếu dưới 1.000 USD thì tra Paris» | Phải biết giá London rồi mới quyết định. Lặp gọi LLM, gửi tiếp `tools` ở mỗi vòng. |

**Vòng ngoài xử lý các đợt phản hồi; vòng trong xử lý mọi tool call trong một đợt.** Không chỉ lấy `tool_calls[0]`. Nhiều calls cùng một phản hồi chưa có nghĩa mã chạy song song. Cần đặt giới hạn vòng lặp.

## 6. SQLite thay đổi điều gì?

Trước: `get_ticket_price` tra dictionary trong bộ nhớ.

Sau: cùng hàm ấy chạy `SELECT price FROM prices WHERE city = ?` trong file `prices.db`.

- Dữ liệu đã ghi có thể còn sau khi khởi động lại nếu file DB được giữ.
- `set_ticket_price` thêm mới hoặc cập nhật giá; `commit()` xác nhận lưu.
- Dùng tham số SQL thay vì ghép tên thành phố trực tiếp vào câu truy vấn.
- Không có giá thì báo thiếu dữ liệu; không tự bịa một giá.
- LLM đưa tên thành phố; lập trình viên viết sẵn SQL. Đây chưa phải text-to-SQL.
- Có thể thay bằng PostgreSQL, MongoDB hoặc API; tool calling không bắt buộc SQLite.

## 7. Những điểm dễ hiểu nhầm

- **System prompt không phải DB:** lời nhắc «hãy chính xác» không tự cung cấp giá vé hoặc bảo đảm không bịa.
- **Lịch sử UI chưa đủ:** demo có thể mất tool calls và kết quả ở lượt sau. Backend cần giữ lịch sử thực thi đầy đủ theo phiên.
- **Không streaming là lựa chọn để bài dễ học:** streaming tool calls cần ghép các mảnh dữ liệu trước khi chạy hàm.
- **Tool là nền tảng cho agent:** agent còn cần điều phối bước tiếp theo, quan sát kết quả và điều kiện dừng.
- **Tool calling khác RAG:** tool có thể phục vụ truy xuất cho RAG, nhưng cũng có thể ghi dữ liệu hoặc tính toán. Bài này không cần vector DB.
- **Bổ sung khi triển khai thật:** kiểm tra đối số và quyền ở backend; chỉ gọi các hàm trong danh sách cho phép. Tool sửa giá cần quyền phù hợp, không dựa vào câu «tôi là admin» trong chat.

## 8. Học xong cần tự làm được gì?

1. Gọi hàm tra giá bằng tay, gồm trường hợp không có dữ liệu.
2. Giải thích được schema và ai thực thi hàm.
3. Theo dõi một lần gọi tool qua log: tên, đối số, kết quả, ID.
4. Xử lý hai thành phố và một yêu cầu có điều kiện.
5. Đổi giá trong SQLite và thấy chatbot trả giá mới khi tra lại.

Với kiến thức web: **Gradio là UI; callback là phần xử lý server; tool là hàm service; LLM giúp chọn thao tác và tham số từ lời người dùng.** Mã backend vẫn chịu trách nhiệm về dữ liệu và nghiệp vụ.
