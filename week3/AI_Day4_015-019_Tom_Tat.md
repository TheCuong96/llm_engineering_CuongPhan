# Ngày 4 — Tự chạy LLM và hiểu cấu trúc bên trong

**Bản tóm tắt • Video 015–019 • Tuần 3**

## 1. Cả phần này muốn dạy gì?

**Biết tự nạp và chạy LLM bằng Hugging Face Transformers, giảm bộ nhớ bằng quantization, và hiểu sơ bộ model biến đầu vào thành câu trả lời.**

Kể chuyện cười chỉ là bài thử. Bạn chưa cần tự viết hoặc huấn luyện Transformer từ đầu.

## 2. Mỗi video chốt một ý

| Video | Ý cần nhớ |
| --- | --- |
| 015 | Quantization giảm độ chính xác biểu diễn trọng số để tiết kiệm bộ nhớ |
| 016 | Tự chuẩn bị tokenizer, chat template, tensor, GPU và model |
| 017 | Model gồm embedding, các decoder block và LM head |
| 018 | Attention kết hợp ngữ cảnh; MLP biến đổi đặc trưng; phi tuyến tăng khả năng biểu diễn |
| 019 | Dùng `generate`, decode, streaming và thử nhiều model |

## 3. Đường đi của một câu hỏi

1. **Messages:** ứng dụng tạo nội dung cùng vai trò user/assistant.
2. **Chat template + tokenizer:** định dạng cuộc hội thoại và chuyển thành token IDs.
3. **Embedding:** mỗi ID được đổi thành vector số đã học.
4. **Decoder blocks:** kết hợp thông tin ngữ cảnh và biến đổi biểu diễn.
5. **LM head:** tạo điểm số cho các token ứng viên.
6. **Generation:** chọn token rồi tiếp tục lặp; **decode** chuyển IDs về văn bản.

Tokenizer không phải bộ phận suy nghĩ ra câu trả lời. Nó phải tương thích với model.

## 4. Quantization — lượng tử hóa

Hình dung bạn lưu một giá trị bằng ít mức đại diện hơn. Dung lượng giảm, nhưng có sai số.

**Dung lượng trọng số lý tưởng = số tham số × số bit ÷ 8.**

| Model đúng 1 tỷ tham số | Dung lượng lý tưởng |
| --- | ---: |
| 32 bit | 4 GB |
| 16 bit | 2 GB |
| 4 bit | 0,5 GB |

Đây chưa phải tổng VRAM: còn cache, tensor và chi phí phụ trợ. Giảm từ 16 xuống 4 bit không bảo đảm chạy nhanh gấp 4.

**NF4** là cách mã hóa 4 bit; **double quantization** giảm thêm phần dữ liệu phụ trợ. Không có nghĩa toàn bộ model chỉ sử dụng cùng 16 số nguyên. [Tài liệu bitsandbytes](https://huggingface.co/docs/transformers/quantization/bitsandbytes).

## 5. Bên trong LLaMA cần hiểu gì?

Trong biến thể 1B được mô tả ở video: vocabulary có 128256 token; hidden size là 2048; có 16 decoder block; MLP mở rộng lên 8192 chiều.

| Bộ phận | Vai trò dễ nhớ |
| --- | --- |
| Token embedding | Tra ID để lấy vector |
| RoPE | Cung cấp thông tin vị trí cho attention |
| Attention | Lấy thông tin từ các token liên quan trong ngữ cảnh được phép nhìn |
| MLP | Biến đổi đặc trưng tại từng vị trí |
| SiLU | Hàm phi tuyến trong MLP |
| RMSNorm + residual | Hỗ trợ ổn định giá trị và truyền thông tin |
| LM head | Tạo logits; có thể chuyển thành xác suất bằng softmax |

**Vì sao phi tuyến quan trọng?** Hai bước `y = 2x`, `z = 3y` vẫn chỉ là `z = 6x`. Thêm phép như `max(0, x)` tạo quan hệ không còn là một đường thẳng duy nhất. Tuy nhiên, bỏ SiLU không khiến toàn Transformer tuyến tính vì attention và normalization còn các phép phi tuyến khác.

## 6. Những dòng code cần nhận ra

| Lệnh | Ý nghĩa |
| --- | --- |
| `AutoTokenizer.from_pretrained(...)` | Nạp tokenizer |
| `AutoModelForCausalLM.from_pretrained(...)` | Nạp model đã huấn luyện |
| `apply_chat_template(...)` | Chuẩn bị hội thoại đúng định dạng |
| `return_tensors="pt"` | Trả tensor PyTorch |
| `.to("cuda")` | Đưa tensor lên GPU NVIDIA |
| `model.generate(...)` | Sinh token mới |
| `tokenizer.decode(...)` | Đổi IDs về chữ |
| `TextStreamer(...)` | Hiển thị văn bản tăng dần |

`max_new_tokens=80` nghĩa là tối đa 80 token mới, không phải 80 từ. Với cách chạy decoder-only trong bài, cần bỏ phần prompt khỏi output nếu chỉ muốn câu trả lời.

## 7. Việc thử năm model cho thấy gì?

LLaMA, Phi và Qwen tạo được chuyện cười trong lần chạy. Gemma 270M dừng ở phần mở đầu. DeepSeek distilled sinh reasoning dài, chưa trả lời cuối khi hết 500 token.

**Đây là quan sát của một buổi demo, không phải bảng xếp hạng chất lượng.** Lỗi quantization của Gemma trong video cũng không chứng minh mọi cấu hình Gemma đều không thể lượng tử hóa.

Distillation là huấn luyện model học từ model mạnh hơn; quantization là giảm độ chính xác biểu diễn trọng số. DeepSeek-R1-Distill-Qwen-1.5B thuộc trường hợp đầu; 1.5B là số tham số, không phải 1,5 GB. [Model card DeepSeek](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B).

## 8. Chốt kiến thức trước khi chuyển bài

- Bạn đang chạy inference, không phải training.
- Embedding khác RoPE; LM head tạo logits; activation đang học là **SiLU**, không phải SELU.
- Streaming giúp thấy câu trả lời sớm hơn, không tự tăng chất lượng.
- Thời gian tải model khác thời gian sinh câu trả lời.
- Chọn model theo tác vụ, độ đúng, tốc độ, bộ nhớ và điều kiện sử dụng.

**Tự kiểm tra:** Model 4B ở 4 bit có phần trọng số lý tưởng khoảng **2 GB**, nhưng tổng bộ nhớ chạy sẽ lớn hơn. Nếu giải thích được vì sao, bạn đã nắm ý quan trọng của bài lượng tử hóa.

*Nguồn bài học: toàn bộ phụ đề tiếng Anh của video 015–019 bạn gửi. Bản đầy đủ có code thực hành, giải thích sâu hơn và các điểm cần sửa cách hiểu.*
