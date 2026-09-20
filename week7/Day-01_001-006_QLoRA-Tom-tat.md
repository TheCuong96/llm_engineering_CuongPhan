# Day 1 — LoRA và QLoRA: bản ôn nhanh

> Tóm tắt 6 video 001–006 từ phụ đề đính kèm. Đọc bản này trước; xem bản đầy đủ khi cần hiểu công thức và thao tác.

## 1. Video thực sự muốn truyền đạt điều gì?

**Bạn có thể dạy thêm một mô hình AI có sẵn bằng cách huấn luyện một phần bổ sung nhỏ, đồng thời giảm bộ nhớ của mô hình nền.**

Bài toán của khóa học: **đọc mô tả sản phẩm → dự đoán giá**. Giảng viên muốn kiểm tra liệu LLaMA nhỏ được fine-tuning có đạt kết quả gần mô hình lớn trong nhiệm vụ này không.

Đây là tinh chỉnh mô hình có sẵn, không phải tự xây ChatGPT từ đầu. Day 1 mới giải thích cơ chế, nạp mô hình và xem adapter mẫu; chưa hoàn thành huấn luyện hay chứng minh kết quả tốt hơn.

## 2. Hai kỹ thuật, hai vấn đề khác nhau

| Kỹ thuật | Làm gì? | Giải quyết vấn đề nào? |
|---|---|---|
| **LoRA** | Giữ nguyên trọng số nền, thêm và huấn luyện các ma trận nhỏ A/B | Quá nhiều tham số cần cập nhật |
| **Quantization — lượng tử hóa** | Lưu trọng số với ít bit hơn | Mô hình nền chiếm quá nhiều bộ nhớ |
| **QLoRA** | Huấn luyện LoRA trên nền đã lượng tử hóa, thường 4-bit | Kết hợp cả hai lợi ích |

Ví dụ dễ nhớ: bạn có một chuyên viên đã biết việc. **LoRA** là phần kỹ năng chuyên biệt được học thêm; **quantization** là lưu kiến thức nền bằng biểu diễn ít chi tiết hơn để gọn hơn. Adapter thực tế là trọng số, không phải ghi chú bằng chữ.

**Nền đóng băng vẫn tham gia tính toán. Chỉ nạp mô hình 4-bit để hỏi đáp chưa phải fine-tuning.**

## 3. Chỉ cần nhớ ba cấu hình

| Cấu hình | Ý nghĩa |
|---|---|
| `r` | Kích thước trung gian của adapter; tăng r làm tăng số tham số |
| `alpha` | Điều chỉnh độ lớn đóng góp của adapter |
| `target_modules` | Các lớp được gắn adapter |

Trong cấu hình nhẹ của video: `r = 32`, nhắm vào `q_proj`, `k_proj`, `v_proj`, `o_proj` thuộc attention. Giảng viên dùng quy tắc thử nghiệm `alpha = 2 × r`.

Làm rõ: LoRA thông thường trong PEFT dùng hệ số `alpha / r`, nên `64 / 32 = 2`, không phải nhân trực tiếp 64. [Tài liệu LoRA](https://huggingface.co/docs/peft/en/package_reference/lora).

Không có cấu hình luôn tốt nhất. Phải thử và đo trên dữ liệu validation.

## 4. Các con số đáng nhớ

| Thứ được đo trong video | Dung lượng xấp xỉ |
|---|---:|
| Mô hình ở lần nạp độ chính xác cao | 12,9 GB |
| Nền lượng tử hóa 8-bit | 3,6 GB |
| Nền lượng tử hóa 4-bit | 2,2 GB |
| Adapter nhẹ, r = 32 | 73,4 MB |
| Nền 4-bit + adapter nhẹ | 2,27 GB |
| Adapter nặng, r = 256, thêm MLP | 1,56 GB |

Đây là số của thí nghiệm, **không phải tổng VRAM cần để huấn luyện**.

Adapter nhẹ có khoảng **18,35 triệu tham số**, nhỏ hơn nhiều so với khoảng 3 tỷ của nền. Phụ đề có chỗ ghi “17 MB”; phép tính và phần đối chiếu file cho kết quả đúng là khoảng **73,4 MB**.

**4-bit không làm giảm số lượng tham số.** Nó giảm số bit lưu cho các trọng số được lượng tử hóa. So với 32-bit, phần trọng số lý tưởng còn 1/8; tổng bộ nhớ thực tế còn phụ thuộc các thành phần khác.

## 5. Vì sao phải xem Colab và cấu trúc mô hình?

- **Colab/GPU:** nơi chạy thí nghiệm.
- **Hugging Face:** nơi lấy mô hình, xác thực quyền truy cập và lưu adapter.
- **Embedding:** đổi token ID thành vector số.
- **Attention và MLP:** các phần xử lý bên trong, nơi bài học gắn adapter.
- **`print(model)`:** để nhìn thấy cấu trúc và các lớp LoRA A/B.
- **Memory footprint:** để thấy tác dụng giảm bộ nhớ.

Từ vựng 128.256 token không phải context window. Mô hình trong bài có 28 decoder blocks; không cần học thuộc kiến trúc để nắm ý chính.

## 6. Kết quả lưu lại là gì?

File `adapter_model.safetensors` lưu phần adapter đã học. **Adapter không chạy độc lập:** vẫn cần mô hình nền tương thích, tokenizer và cấu hình.

Cấu hình nhẹ dùng khoảng 20.000 mẫu; cấu hình nặng dự kiến 800.000 mẫu. Đây là lựa chọn của khóa học, không phải yêu cầu tối thiểu chung.

Ba điều tránh hiểu sai:

1. Adapter 73 MB không có nghĩa chỉ cần 73 MB GPU.
2. r lớn hơn, nhiều dữ liệu hơn hoặc fine-tuning lâu hơn không bảo đảm kết quả tốt hơn.
3. Giỏi hơn ở dự đoán giá không đồng nghĩa giỏi hơn toàn diện.

**Câu chốt để nhớ:** QLoRA giữ một mô hình nền đã được làm gọn, rồi học các phần điều chỉnh nhỏ để phục vụ nhiệm vụ riêng. Có hiệu quả hay không phải được kiểm chứng bằng đánh giá.
