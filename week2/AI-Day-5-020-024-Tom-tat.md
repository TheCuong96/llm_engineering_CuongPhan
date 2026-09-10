# Day 5 — Tóm tắt nhanh bài 020–024

> **Cả phần này dạy cách xây một trợ lý AI hoàn chỉnh bằng cách ghép mô hình có sẵn, công cụ lấy dữ liệu và giao diện web.** Đầu vào là câu hỏi bằng chữ; đầu ra có thể gồm câu trả lời, ảnh và giọng nói. Bài 024 mở rộng sang thử nhiều model bằng nhiệm vụ vẽ SVG.
>
> Tóm tắt dựa trên phụ đề 5 bài và đối chiếu một số khung hình code. Tên model và kết quả trong video thuộc thời điểm ghi hình.

## 1. Mỗi bài muốn bạn hiểu điều gì?

| Bài | Nội dung chính | Ý cần nhớ |
|---|---|---|
| **020 — Agentic AI** | Ôn tool calling với SQLite; giới thiệu agent | Model yêu cầu hành động; code thực thi và gửi kết quả lại |
| **021 — Gradio** | Giải thích Python tạo UI web như thế nào | Khai báo UI + web server + callback được nối sẵn |
| **022 — Multimodal** | Thêm tạo ảnh, TTS và bố cục Blocks | Một callback có thể trả nhiều loại đầu ra |
| **023 — Chạy demo** | Tra giá London, so sánh Paris/Tokyo | Kiểm tra toàn bộ luồng và hiểu giới hạn của demo |
| **024 — OpenRouter/SVG** | Cùng một đề bài gửi tới nhiều model | Chọn model bằng kết quả trên nhiệm vụ cụ thể |

## 2. Luồng quan trọng nhất

Người dùng hỏi: **“Đi Paris hay Tokyo rẻ hơn?”**

1. Model nhận câu hỏi và mô tả công cụ tra giá.
2. Model yêu cầu `get_ticket_price` cho hai thành phố.
3. Python chạy các truy vấn SQLite, gửi kết quả lại model.
4. Model so sánh và viết câu trả lời.
5. TTS đọc câu trả lời; hàm tạo ảnh vẽ một thành phố.
6. Gradio hiển thị chữ, âm thanh và ảnh.

**Tool call là yêu cầu chạy hàm, chưa phải hành động đã hoàn thành.** Vòng lặp cho phép model nhận kết quả rồi yêu cầu thêm công cụ nếu cần.

Trong luồng đơn giản có thể có **4 lời gọi AI**: chat xin tool → chat trả lời sau tool → TTS → tạo ảnh. Truy vấn SQLite không phải lời gọi AI. Hai tool call trong cùng một response cũng không bắt buộc tạo thành hai lượt gọi model riêng.

## 3. Agentic AI và Multimodal khác nhau ở đâu?

| Khái niệm | Nói đơn giản |
|---|---|
| **Agentic AI** | Model tham gia quyết định hành động hoặc các bước xử lý |
| **Workflow** | Luồng do hệ thống tổ chức; có thể cố định hoặc cho model quyết định một phần |
| **Multimodal** | Có nhiều dạng thông tin: chữ, ảnh, âm thanh… |
| **Tool calling** | Model sinh yêu cầu công cụ để chương trình thực thi |

Nhiều lời gọi AI nối tiếp nhau chưa đủ để khẳng định là agent tự chủ. Demo này có tính agentic ở phần chọn tool, còn việc tạo ảnh và đọc câu trả lời chủ yếu theo quy tắc code.

Bạn đang xây **ứng dụng dùng AI**, chưa huấn luyện một mô hình mới.

## 4. Những hàm và thành phần cần nhớ

| Thành phần | Vai trò |
|---|---|
| `get_ticket_price(city)` | Lấy giá demo từ DB |
| `handle_tool_calls_and_return_cities(...)` | Chạy tool; trả kết quả cùng tên thành phố |
| `artist(city)` ở bài 022 | Tạo ảnh minh họa thành phố |
| `talker(reply)` | Chuyển câu trả lời thành âm thanh |
| `put_message_in_chatbot(...)` | Hiện ngay tin nhắn mới, xóa textbox |
| `chat(history)` | Điều phối, trả `history, voice, image` |
| `gr.Blocks` | Tự bố trí UI và nối các sự kiện |

`chat` chỉ nhận `history` vì callback trước đã thêm câu hỏi mới vào đó. Đừng thêm lại khiến câu hỏi bị trùng.

Ba giá trị trả về phải khớp thứ tự ba output: **khung chat → trình phát âm thanh → ảnh**.

Với React/Next.js, có thể hiểu Gradio đang lo sẵn phần component, submit request và cập nhật giao diện; callback Python vẫn xử lý ở server.

## 5. Những chỗ dễ hiểu nhầm nhất

- **DB có giá không có nghĩa là giá vé thị trường:** đây là dữ liệu demo.
- **“Bạn muốn đặt vé không?” chưa phải booking:** demo chưa thực hiện giao dịch đặt vé thật.
- **TTS là đọc chữ ra tiếng:** chưa có chức năng nghe và nhận dạng lời nói của người dùng.
- **Ảnh được tạo vì code gọi `artist`:** model không trực tiếp tự chọn mọi bước tạo ảnh/âm thanh.
- **`cities[0]` là thành phố đầu tiên:** không đảm bảo là thành phố rẻ nhất. Code video còn gán lại danh sách này qua mỗi vòng tool.
- **Prompt yêu cầu không bịa không bảo đảm tuyệt đối:** vẫn cần dữ liệu và kiểm tra ứng dụng.
- **Ảnh du lịch là minh họa:** có thể chứa chi tiết tưởng tượng.

Trong demo hoàn chỉnh: London 799 USD; Paris 899 USD; Tokyo 1.420 USD. Phụ đề bài 020 có chỗ ghi London thành 7.99; phần chạy bài 023 thể hiện 799 USD. Các giá này chỉ để hiểu ví dụ.

## 6. Bài 024: SVG và OpenRouter

**SVG là văn bản XML mô tả hình vector.** Model sinh các phần tử hình học và tọa độ; phần mềm render chúng thành ảnh. Điều này khác với gọi API tạo ảnh ở bài 022.

OpenRouter là cổng định tuyến tới nhiều model. Quy trình thử: **cùng prompt → chọn từng model → lấy SVG → ghi thời gian/lỗi → hiển thị và so sánh**.

Đề trong video là gấu trúc đi patin đến chỗ làm. Giảng viên thích kết quả Gemini 3 Pro nhất trong lần thử đó; GPT-5 nano gặp lỗi. Đây không phải bảng xếp hạng năng lực tổng quát. Hiệu ứng SVG được vẽ dần là cách hiển thị kết quả, không phải quan sát suy nghĩ của model.

Muốn so sánh có ích, hãy xem: **bám đề, SVG hợp lệ, chất lượng hình, thời gian, chi phí và độ ổn định qua nhiều lần chạy**.

## 7. Học và áp dụng thế nào?

Làm theo thứ tự: **chat chữ → tool tra dữ liệu → nhiều tool call → TTS → ảnh → UI Blocks → thử nhiều model**. Mỗi bước cần biết dữ liệu vào đâu, ai xử lý và trả ra gì.

Ví dụ ứng dụng vào học tiếng Anh: tool lấy nghĩa và ví dụ từ kho bài học; model giải thích bằng tiếng Việt; TTS đọc câu tiếng Anh; ảnh minh họa chỉ tạo khi cần.

Nếu chỉ nhớ một ý: **AI sinh yêu cầu và nội dung; code kết nối dữ liệu, thực thi hành động và đưa kết quả lên giao diện.**

Nguồn: 5 bài đính kèm số 020–024, Day 5 và Day 5 Extra. Xem bản đầy đủ để hiểu từng hàm, vòng lặp, hợp đồng dữ liệu và các mốc thời gian xem lại.
