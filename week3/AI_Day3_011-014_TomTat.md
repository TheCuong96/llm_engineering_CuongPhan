# Tokenizers và Chat Templates — Bản tóm tắt

> Video 011–014 • Week 3 / Day 3 • Đọc nhanh trước, mở bản đầy đủ khi cần code và giải thích sâu.

## 1. Cả phần này muốn dạy điều gì?

**Hiểu cách văn bản và lịch sử chat được chuyển thành đầu vào dạng số cho LLM.** Đây là bước chuẩn bị để học tự chạy model, sau khi đã biết gọi API và dùng Hugging Face pipeline.

| Video | Ý chính cần nhớ |
|---|---|
| 011 | Tokenizer chia văn bản thành token và ánh xạ sang token ID |
| 012 | Dùng `encode` và `decode` để tận mắt thấy chữ → số → chữ |
| 013 | Chat template chuyển `messages` thành chuỗi có ranh giới vai trò |
| 014 | Llama, Phi, DeepSeek, Qwen có thể dùng cách chia, ID và template khác nhau |

## 2. Sáu khái niệm cốt lõi

| Thuật ngữ | Hiểu ngắn gọn |
|---|---|
| Token | Một mảnh văn bản; không nhất thiết là một từ |
| Token ID | Số nguyên định danh token trong bộ từ vựng |
| Tokenizer | Bộ chuyển văn bản sang ID và giải mã ID về văn bản |
| Vocabulary | Tập token cùng các ID tương ứng |
| Special token | Dấu đánh cấu trúc, ví dụ bắt đầu văn bản hoặc kết thúc lượt |
| Chat template | Quy tắc sắp xếp nội dung hội thoại theo định dạng model đã học |

Ví dụ **giả định**: `Hello world!` được chia thành `Hello`, ` world`, `!`, rồi ánh xạ sang `[101, 202, 303]`. Đây không phải ID thật của Llama.

Token ID không phải vector. Mô hình lấy **embedding vector** tương ứng với ID để tính toán; giá trị ID lớn hơn không có nghĩa quan trọng hơn.

## 3. Điểm quan trọng nhất: `messages` được biến đổi ra sao?

Bạn truyền một danh sách gồm system, user và lịch sử assistant. Lớp xử lý định dạng nó thành chuỗi hội thoại, rồi tokenizer mã hóa thành ID. Model sinh tiếp các token; các ID đầu ra được giải mã thành câu trả lời.

Ví dụ cấu trúc **minh họa, không phải template thật**:

```text
[Bắt đầu system] Giải thích dễ hiểu. [Kết thúc lượt]
[Bắt đầu user] Token là gì? [Kết thúc lượt]
[Bắt đầu assistant]
```

Model viết tiếp sau phần mở đầu assistant. Nó học được vai trò của các dấu nhờ dữ liệu huấn luyện có cùng định dạng.

**Đây là điều giảng viên muốn bạn nhận ra:** giao diện có nhiều vai trò, nhưng đầu vào văn bản của model vẫn là một chuỗi token được tổ chức có cấu trúc.

## 4. Các lệnh cần nhớ

| Lệnh | Dùng để làm gì? |
|---|---|
| `AutoTokenizer.from_pretrained(model_id)` | Nạp tokenizer đi cùng checkpoint |
| `tok.encode(text)` | Chuyển văn bản thành ID |
| `tok.decode(ids)` | Chuyển một chuỗi ID thành văn bản |
| `tok.decode(ids, skip_special_tokens=True)` | Giải mã và bỏ special tokens |
| `tok.batch_decode([ids1, ids2])` | Giải mã nhiều chuỗi ID |
| `tok.apply_chat_template(messages, tokenize=False)` | Xem chuỗi hội thoại đã định dạng |
| `tok.apply_chat_template(messages, tokenize=True)` | Lấy ID của hội thoại đã định dạng |

`add_generation_prompt=True` yêu cầu template mở đầu lượt assistant nếu có hỗ trợ. Nó **không tạo câu trả lời**. Nếu định dạng chat ra text rồi mới tokenize, dùng `add_special_tokens=False` để tránh thêm dấu đặc biệt trùng. [Đối chiếu Hugging Face](https://huggingface.co/docs/transformers/chat_templating).

## 5. So sánh model để rút ra điều gì?

- **Llama:** demo có `<|begin_of_text|>`; chat dùng các header để phân chia vai trò.
- **Phi-4-mini-instruct:** ID và template khác Llama; cách encode trong demo không thêm dấu đầu giống Llama.
- **DeepSeek V3.1:** có quy ước hội thoại riêng; không bê nguyên template Llama sang.
- **Qwen2.5-Coder:** mã nguồn cũng được chia thành token, gồm tên hàm, khoảng trắng, dấu câu…

**Quy tắc: dùng tokenizer và template phù hợp model.** Ít token hơn chưa chứng minh model tốt hơn. Video không phải bài benchmark để chọn model mạnh nhất.

## 6. Những chỗ dễ hiểu sai

- Một token không luôn bằng một từ; đếm tiếng Việt phải dùng tokenizer thực tế.
- `batch_decode` giải mã nhiều chuỗi, không chỉ “tách từng token của một câu”.
- Instruct không bắt buộc có nhiều token hơn Base; khác biệt cốt lõi là huấn luyện và định dạng hội thoại.
- Tokenizer không phải LLM và không tự trả lời câu hỏi.
- Chỉ thử tokenizer **không cần GPU**, cũng không cần tải toàn bộ trọng số model.
- Ngày tháng mà template chèn vào không tự cập nhật kiến thức model.

## 7. Học xong cần làm được gì?

1. Encode một câu và xem số token bằng `len(ids)`.
2. Decode để kiểm tra nội dung, thử hiện/ẩn special tokens.
3. In kết quả `apply_chat_template` để nhìn ranh giới vai trò.
4. Đổi tokenizer, giữ nguyên câu và quan sát khác biệt.

Ứng dụng thực tế: đếm prompt đầy đủ hơn, đổi model đúng định dạng và gỡ lỗi hội thoại trước khi chạy inference.

**Câu chốt để nhớ:** Chat template tổ chức hội thoại; tokenizer chuyển chữ thành ID; model xử lý và sinh tiếp; tokenizer chuyển ID đầu ra về chữ.

---

Nguồn chính: toàn bộ phụ đề tiếng Anh của video 011–014 được cung cấp. Bản này tổng hợp bài giảng và các đính chính kỹ thuật; xem bản đầy đủ để có ví dụ thực hành, giới hạn kiểm chứng và nguồn đối chiếu.
