# Ngày 3 — Tóm tắt nhanh bài 012–014

> Đọc bản này trước để nắm ý chính; bản đầy đủ giải thích code và có bài thực hành. Nội dung dựa trên phụ đề tiếng Anh và một số khung hình code trong ba video được cung cấp.

## 1. Cả phần này muốn dạy gì?

**Xây chatbot có giao diện trò chuyện, theo dõi nội dung đã trao đổi, trả lời dần và tư vấn dựa trên thông tin cửa hàng.** Bạn sử dụng mô hình có sẵn; chưa huấn luyện mô hình mới.

| Bài | Ý chính | Kết quả |
| --- | --- | --- |
| 012 | Tạo giao diện và hiểu callback | Nhận được câu mới cùng lịch sử |
| 013 | Gửi hội thoại cho mô hình, nhận streaming | Chatbot trả lời có ngữ cảnh, chữ hiện dần |
| 014 | Cung cấp chỉ dẫn, ví dụ và dữ kiện liên quan | Trợ lý tư vấn theo tình huống cửa hàng |

## 2. Bài 012 — UI và AI là hai phần riêng

```python
def chat(message, history):
    return "bananas"
```

Giảng viên cố ý trả lời cố định để chứng minh: **Gradio tạo UI và gọi hàm; hàm quyết định câu trả lời.** Thay nội dung hàm bằng lệnh gọi AI thì UI vẫn dùng cơ chế ấy.

- `message`: câu người dùng vừa gửi.
- `history`: những lượt user và assistant trước đó.
- `messages`: danh sách bạn tự ghép để gửi cho API.

Trong phiên bản của video, `gr.ChatInterface(fn=chat, type="messages").launch()` dựng giao diện chat; `type="messages"` chọn lịch sử dạng `role`/`content`.

## 3. Bài 013 — “Nhớ” nhờ lịch sử, hiện chữ dần nhờ streaming

**Mỗi lượt gửi: system prompt + history + câu hỏi mới.**

Ví dụ bạn nói “Tôi tên Cường”, rồi hỏi “Tôi tên gì?”. Mô hình trả lời được vì ứng dụng gửi lại câu chứa tên trong history. Demo chưa có bộ nhớ lâu dài hoặc lưu hội thoại vào database.

| Role | Nội dung |
| --- | --- |
| `system` | Chỉ dẫn nền của ứng dụng |
| `user` | Lời người dùng |
| `assistant` | Câu trả lời trước đó của mô hình |

Giảng viên làm sạch history để chỉ giữ `role`, `content`, tránh gửi metadata UI không phù hợp cho một số API. Đây chưa phải bộ chuyển đổi cho mọi loại message và mọi nhà cung cấp.

Streaming cần hai phía phối hợp:

1. Gọi API với `stream=True` để nhận các mảnh dữ liệu.
2. Cộng dồn văn bản, rồi `yield` toàn bộ câu trả lời hiện có cho Gradio.

Ví dụ lần lượt hiển thị: `Chào` → `Chào Cường` → `Chào Cường!`.

`return` trả kết quả một lần rồi kết thúc; `yield` cho phép hàm cung cấp nhiều kết quả qua các lần lặp. Streaming giúp thấy phần đầu sớm, không tự làm câu trả lời chính xác hơn.

## 4. Bài 014 — Cung cấp vai trò, mẫu trả lời và dữ kiện

**System prompt** giống bản hướng dẫn làm việc: trợ lý là ai, nói thế nào, cần hỗ trợ việc gì và biết thông tin nào.

Trong tình huống cửa hàng của video:

- Mũ giảm 60%; phần lớn mặt hàng khác giảm 50%.
- Giày không giảm giá hôm nay.
- Trợ lý nhẹ nhàng giới thiệu hàng giảm giá, đặc biệt là mũ.

**One-shot prompting** là cho một ví dụ; **few-shot/multi-shot prompting** là cho một vài hoặc nhiều ví dụ. Mẫu hỏi–đáp giúp mô hình hiểu cách xử lý mong muốn. “Shot” không phải số lần gọi API.

Ví dụ: “Khách hỏi giày → nói giày không giảm giá, có thể giới thiệu thêm mũ đang ưu đãi”.

## 5. RAG trong bài thực chất đơn giản thế nào?

Giảng viên kiểm tra: nếu câu hỏi chứa `belt`, thêm “cửa hàng không bán thắt lưng” vào prompt trước khi gọi mô hình.

**Ý tưởng RAG: tìm thông tin liên quan → thêm vào đầu vào → nhờ mô hình trả lời.**

Đây mới là minh họa bằng từ khóa và dữ kiện viết sẵn; chưa xây truy xuất từ kho tài liệu, embedding hay vector database. RAG cũng không bắt buộc dùng vector database.

Tại sao chỉ thêm dữ liệu liên quan? Vì hàng nghìn sản phẩm sẽ khiến prompt dài và tốn token nếu gửi tất cả mỗi lượt. Tuy nhiên, tìm sai dữ liệu thì câu trả lời vẫn có thể sai.

Kiểm tra `belt` không hiểu mọi cách diễn đạt như “dây nịt” hoặc câu hỏi nối tiếp “loại đó”. Đây là giới hạn mà hệ thống truy xuất tốt hơn cần giải quyết.

## 6. Những điều cần nhớ để tránh hiểu nhầm

| Dễ hiểu nhầm | Hiểu đúng |
| --- | --- |
| Gradio là AI | Gradio lo giao diện; mô hình tạo câu trả lời |
| AI tự nhớ mọi lần trò chuyện | Demo gửi lại lịch sử trong từng lần gọi API |
| Thêm dữ liệu vào prompt là huấn luyện | Mô hình giữ nguyên; chỉ đầu vào thay đổi |
| RAG đồng nghĩa vector database | Cốt lõi là chọn và cung cấp thông tin liên quan |
| Dặn “đừng bịa” là đủ | Chỉ dẫn không bảo đảm câu trả lời luôn có căn cứ |

Để tự kiểm tra, hãy thử giới thiệu tên rồi hỏi lại; hỏi mức giảm giá của mũ, giày; và so sánh câu hỏi có từ `belt` với một cách nói khác. Bạn cần giải thích được **dữ kiện nào đã được gửi cho mô hình ở từng lượt**.

Với nền tảng front-end, hãy hình dung: Gradio tương ứng phần UI chat, callback là xử lý backend, history là dữ liệu hội thoại, còn prompt và thông tin truy xuất là đầu vào backend chuẩn bị cho mô hình. Video kết thúc bằng gợi ý tự xây demo và nhắc lại chia sẻ qua `share`/`auth`; phần tools sẽ học sau.
