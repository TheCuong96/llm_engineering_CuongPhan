# Day 2 — Gradio: bản tóm tắt video 007–011

## Cả phần này dạy điều gì?

**Biến một hàm Python gọi AI thành ứng dụng web có ô nhập, nút bấm, lựa chọn mô hình và câu trả lời xuất hiện dần.**

Bạn xây ứng dụng sử dụng mô hình có sẵn. Kết quả cuối phần là giao diện hỏi AI và công cụ viết bản giới thiệu doanh nghiệp từ nội dung website.

## Ý chính của từng bài

| Bài | Nội dung cần nhớ |
|---|---|
| **007 — Giới thiệu Gradio** | Gradio tạo UI từ cấu hình Python. Chuẩn bị hàm nhận prompt và trả về câu trả lời từ LLM. |
| **008 — Interface và callback** | `fn` là hàm xử lý; `inputs` là dữ liệu đi vào; `outputs` là nơi hiển thị. `.launch()` khởi chạy ứng dụng. |
| **009 — Tùy chỉnh và nối GPT** | Thêm nhãn, ví dụ, đăng nhập. Thay callback viết hoa bằng callback gọi GPT là có UI hỏi AI. |
| **010 — Markdown và streaming** | Dùng `gr.Markdown()` để trình bày đẹp; dùng generator và `yield` để cập nhật câu trả lời dần. |
| **011 — Nhiều mô hình và brochure** | Dropdown quyết định gọi GPT hay Claude. Tái sử dụng luồng đó để viết giới thiệu công ty từ một trang web. |

## Ví dụ nhỏ nhất để hiểu cả phần

```python
import gradio as gr


def shout(text):
    return text.upper()


view = gr.Interface(fn=shout, inputs="text", outputs="text")
view.launch()
```

Nhập `hello`, bấm Submit, Gradio gọi `shout("hello")`, rồi hiển thị `HELLO`.

Thay `shout` bằng một hàm gọi AI nhận chuỗi và trả chuỗi: bạn có giao diện hỏi AI. **Gradio lo tương tác, callback lo xử lý, mô hình lo sinh nội dung.**

## Các khái niệm phải hiểu

| Khái niệm | Nghĩa dễ nhớ |
|---|---|
| **Callback — hàm được đăng ký để gọi sau** | `fn=shout` truyền hàm, không gọi ngay như `shout()`; liên hệ `onClick={handler}` nhưng callback Gradio chạy phía Python. |
| **Markdown — định dạng văn bản** | AI tạo chuỗi có tiêu đề/danh sách; `gr.Markdown()` render chuỗi đó. |
| **Streaming — trả lời dần** | API gửi các phần kết quả; callback chuyển chúng thành cập nhật cho UI. |
| **Generator / `yield`** | Hàm phát ra nhiều giá trị qua các lần tiếp tục thực thi. |
| **`yield from`** | Chuyển tiếp các giá trị từ generator khác. |
| **Model selector — bộ chọn mô hình** | Input thứ hai cho callback biết nên gọi GPT hay Claude. |

Trong cách stream vào vùng Markdown của bài, cần gửi **nội dung tích lũy**:

```python
result = ""
for chunk in chunks:
    result += chunk
    yield result
```

Ví dụ UI nhận lần lượt `Xin` → `Xin chào` → `Xin chào bạn`, thay vì mỗi lần chỉ nhận mảnh mới.

## Brochure Generator hoạt động ra sao?

1. Nhập tên công ty, URL và chọn mô hình.
2. Hàm scraper lấy nội dung trang web.
3. Callback ghép nội dung vào prompt yêu cầu viết giới thiệu.
4. GPT hoặc Claude tạo văn bản; UI hiển thị dần bằng Markdown.

**Demo chỉ đọc landing page, chưa tự đi theo các liên kết.** Brochure ở đây là bản giới thiệu bằng văn bản, chưa phải PDF hay tờ gấp được thiết kế. Chỉ gửi một URL cho mô hình không bảo đảm mô hình đã đọc trang; bước scraper mới cung cấp nội dung.

## Những điều dễ hiểu sai

- **Chưa có trí nhớ hội thoại:** mỗi lượt trong bài chỉ gửi chỉ dẫn và câu hỏi hiện tại. Muốn hỏi tiếp dựa trên câu trước phải cung cấp lịch sử/ngữ cảnh.
- **`share=True` là chia sẻ ứng dụng đang chạy:** callback vẫn chạy tại môi trường Python của bạn, không tự biến thành hosting độc lập. Xem thêm [tài liệu chia sẻ của Gradio](https://github.com/gradio-app/gradio/tree/main/guides).
- **Streaming không làm AI thông minh hơn:** nó giúp thấy kết quả sớm và liên tục.
- **Notebook giữ trạng thái:** chạy cell đổi biến toàn cục có thể ảnh hưởng lần gọi hàm sau, dù hàm nằm ở cell phía trên.
- **Multi-model là chọn một mô hình mỗi lượt:** bài chưa làm hai AI phối hợp hay tranh luận.
- **Đăng nhập đơn giản chưa phải hệ thống tài khoản đầy đủ; UI cũng không làm API miễn phí.**

Video gọi frontend Gradio là React; mã Gradio sử dụng Svelte. Bạn chỉ cần nhớ đây là UI web được cấu hình qua Python. [Nguồn: kho mã Gradio](https://github.com/gradio-app/gradio).

## Tự kiểm tra trong một phút

Bạn đã hiểu phần này nếu trả lời được:

1. Tại sao viết `fn=shout` mà không viết `fn=shout()`?
2. Tại sao thay callback lại biến UI viết hoa thành UI hỏi AI?
3. Tại sao phải cộng dồn văn bản trước khi `yield`?
4. Dropdown truyền giá trị vào tham số nào của callback?
5. Ai đọc website: scraper hay mô hình tự biết nội dung từ URL?

**Đáp án ngắn:** truyền hàm để gọi sau; cùng dạng input/output; UI cần bản văn bản đầy đủ ở mỗi lần cập nhật; tham số thứ hai khi dropdown đứng thứ hai trong `inputs`; scraper lấy nội dung rồi đưa cho mô hình.

> Biên soạn từ toàn bộ phụ đề tiếng Anh của video 007–011. Bản đầy đủ giải thích từng bước, có ví dụ mã và phân biệt nội dung bài với phần bổ sung. Ví dụ có API trong bản đầy đủ chưa được chạy tích hợp với dịch vụ trả phí.
