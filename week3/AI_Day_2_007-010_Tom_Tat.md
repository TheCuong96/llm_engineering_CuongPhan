# Day 2 — Hugging Face Pipelines: bản tóm tắt

> **Video 007–010 · Đọc nhanh trước, mở bản đầy đủ khi cần code và giải thích.**
> Biên soạn từ phụ đề bốn video bạn gửi; các lưu ý kỹ thuật được làm rõ thêm để tránh hiểu nhầm.

## 1. Phần này muốn dạy điều gì?

**Dùng model đã được huấn luyện sẵn để thực hiện một tác vụ AI bằng vài dòng Python.**

Giảng viên thử nhiều việc khác nhau để bạn thấy cùng một cách làm: **chọn task → chọn model → tạo pipeline → đưa dữ liệu vào → đánh giá kết quả**.

Bạn đang học cách sử dụng AI trong ứng dụng. Việc gọi pipeline không phải tự huấn luyện ChatGPT và không khiến model tự học thêm từ câu bạn nhập.

## 2. Vai trò của bốn bài

| Video | Ý cần nhớ |
|---|---|
| 007 | Pipeline đóng gói các bước xử lý để dùng model dễ hơn |
| 008 | Tạo pipeline một lần, gọi nhiều lần; đổi model có thể đổi kết quả và bộ nhãn |
| 009 | Chọn task theo vấn đề cần giải quyết; có thể ghép các task thành chức năng |
| 010 | Tạo ảnh và tiếng nói cũng dùng cách đóng gói cấp cao, nhưng API và tài nguyên khác nhau |

## 3. Những thành phần dễ nhầm

- **Hugging Face Hub:** nơi tìm và tải model, trọng số, cấu hình, tài liệu.
- **`transformers`:** thư viện sử dụng nhiều loại model; bài dùng cho các tác vụ văn bản và TTS.
- **`diffusers`:** thư viện dùng cho model diffusion; bài dùng để tạo ảnh.
- **Pipeline:** đối tượng gom tiền xử lý, chạy model và hậu xử lý.
- **Colab:** máy tính từ xa chạy code; GPU T4 là tài nguyên của máy đó.

“Pipelines API” ở đây là giao diện thư viện Python. Nó không mặc nhiên là REST API gửi dữ liệu cho Hugging Face xử lý. Trong bài, model chạy trên máy Colab sau khi được tải và nạp.

## 4. Mẫu code cốt lõi

```python
from transformers import pipeline

# Tạo và nạp model.
analyzer = pipeline("sentiment-analysis")

# Chạy inference trên dữ liệu.
result = analyzer("This lesson is useful.")
print(result)
```

Đây là mẫu đọc hiểu từ cách làm trong bài, chưa phải môi trường được kiểm thử. Khi thực hành, dùng bộ phiên bản của notebook và nên chỉ rõ `model` để kết quả không phụ thuộc lựa chọn mặc định.

**Training:** thay đổi trọng số qua học từ dữ liệu. **Inference:** sử dụng trọng số đã có để xử lý đầu vào. Phần này làm inference.

## 5. Từng tác vụ dùng để làm gì?

| Tác vụ | Đầu vào | Đầu ra / mục đích |
|---|---|---|
| Sentiment analysis | Review/câu chữ | Nhãn tích cực–tiêu cực hoặc số sao, tùy model |
| NER | Một câu | Tìm tên người, tổ chức, địa điểm… |
| Question answering | Câu hỏi + context | Trong demo: trích đoạn trả lời từ context |
| Summarization | Đoạn văn dài | Bản rút gọn |
| Translation | Văn bản ngôn ngữ nguồn | Bản dịch sang ngôn ngữ model hỗ trợ |
| Zero-shot classification | Văn bản + các nhãn bạn đưa | Điểm và thứ tự các nhóm phù hợp |
| Text generation | Câu mở đầu/prompt | Văn bản được viết tiếp |
| Image generation | Mô tả bằng chữ | Ảnh; bài dùng SDXL-Turbo |
| Text-to-Speech | Văn bản + thông tin giọng phù hợp | Tiếng nói; bài dùng SpeechT5 |

## 6. Các demo thực sự muốn chứng minh điều gì?

**Câu “I should be more excited…”:** có từ tích cực nhưng ý có thể là chưa hào hứng. Model có thể phân loại chưa hợp lý. Hãy thử câu khó và đánh giá nhiều ví dụ.

**Đổi sentiment model sang thang 1–5 sao:** model khác có thể cho cách nhìn khác. Không so trực tiếp điểm tin cậy của hai bộ nhãn khác nhau để chọn người thắng.

**NER + database + QA:** ứng dụng có thể tìm sản phẩm trong câu hỏi, tra thông tin rồi đưa vào context. Pipeline QA không tự tra database. Một đoạn context nhập sẵn chưa tạo thành hệ thống RAG đầy đủ.

**GPT-2 viết tiếp:** câu nghe tự nhiên có thể chứa nội dung thiếu căn cứ. Sinh văn bản không đồng nghĩa bảo đảm sự thật; GPT-2 trong bài cũng không phải chatbot làm theo chỉ dẫn như trợ lý hiện đại.

**Ảnh và tiếng nói:** nhiều loại model có cách sử dụng cấp cao tương tự, nhưng không phải cùng một model hay cùng một hàm API.

## 7. Những điểm cần nhớ khi thực hành

1. **`score` cao vẫn có thể sai.** Nó không phải chứng nhận độ chính xác trên dữ liệu của bạn.
2. **Zero-shot không phải chưa huấn luyện.** Bạn không đưa ví dụ gán nhãn cho task đang gọi; model đã học trước.
3. **“Multilingual” không bảo đảm tiếng Việt.** Model sentiment NLP Town minh họa có sáu ngôn ngữ fine-tuning được công bố, không gồm tiếng Việt. [Model card](https://huggingface.co/nlptown/bert-base-multilingual-uncased-sentiment).
4. **Không mặc định cần token `write`.** Đọc/tải model dùng quyền đọc phù hợp; quyền ghi phục vụ đẩy nội dung. [Tài liệu token](https://huggingface.co/docs/hub/security-tokens).
5. **Đừng giữ mọi model trên GPU cùng lúc.** Chạy từng tác vụ để tránh hết VRAM.
6. **Phân biệt restart và xóa runtime.** Restart mất biến/model trong bộ nhớ; runtime mới có thể cần cài và tải lại. Xóa output không giải phóng model.
7. **Cảnh báo khác lỗi nhưng vẫn nên đọc.** Lỗi CUDA cần kiểm tra GPU và môi trường, không cài lại hàng loạt theo phỏng đoán.
8. **Code phụ thuộc phiên bản.** Bản đầy đủ dùng ví dụ theo Transformers v4.57.1; kiểm tra notebook trước khi nâng thư viện. [Tài liệu phiên bản](https://huggingface.co/docs/transformers/v4.57.1/en/main_classes/pipelines).

Việc tải model về không loại bỏ chi phí máy chạy và không khiến mọi model có cùng điều kiện sử dụng. “Power mode” và Corgi ở cuối video chỉ là phần hiệu ứng vui, không tăng sức mạnh AI.

## 8. Học xong cần làm được gì?

Tự chọn một task, tạo pipeline, thử vài đầu vào và giải thích kết quả. Với nền tảng web, hãy hình dung pipeline là phần xử lý AI phía sau chức năng bạn đang xây; giao diện và backend vẫn do ứng dụng tổ chức.

**Bài tập nhanh:** viết ba câu tích cực, tiêu cực, mơ hồ rồi chạy sentiment; tiếp đó hỏi một câu không có đáp án trong context của QA. Hai thử nghiệm này giúp bạn hiểu cả khả năng lẫn giới hạn của model.
