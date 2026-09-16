# Day 3 — Tóm tắt nhanh: QLoRA, SFTTrainer và W&B

> **Cả 5 video muốn dạy điều gì?** Dùng dữ liệu mô tả sản phẩm + giá để tinh chỉnh Llama 3.2 bằng QLoRA, rồi theo dõi xem mô hình có học tốt hay không.
>
> Bạn đang học cách tổ chức và quan sát một lần huấn luyện. Video cuối dừng khi tiến trình còn chạy; chưa có kết quả đánh giá mô hình cuối cùng.

## 1. Hiểu bằng một ví dụ

Bạn có người đã biết đọc hiểu (**Llama**) và muốn họ học thêm nghề định giá:

- **Dataset:** các bài mẫu, mỗi bài gồm mô tả sản phẩm và giá đúng.
- **LoRA:** phần điều chỉnh nhỏ được học thêm; trọng số nền giữ cố định.
- **Quantization 4-bit:** giảm bộ nhớ lưu nhiều trọng số nền.
- **Hyperparameters:** lịch học và mức điều chỉnh bạn lựa chọn.
- **SFTTrainer:** điều phối quá trình học.
- **Weights & Biases — W&B:** ghi lại cấu hình, loss và biểu đồ.

Kết quả mong muốn là định giá tốt hơn cho sản phẩm chưa dùng huấn luyện. Việc đó phải được kiểm chứng, không tự động xảy ra chỉ vì đã bấm train.

## 2. Mỗi video nói gì?

| Video | Ý chính |
|---|---|
| **011** | Hiểu các tham số của QLoRA và quá trình học |
| **012** | Hiểu learning rate, optimizer và cơ chế cập nhật |
| **013** | Đặt cấu hình cụ thể trong Colab: bản nhẹ/bản đầy đủ |
| **014** | Nạp mô hình, dữ liệu, kết nối W&B và tạo SFTTrainer |
| **015** | Chạy huấn luyện, xem bộ nhớ GPU, loss và learning rate |

## 3. Các tham số cần nhớ

| Thuật ngữ | Hiểu ngắn gọn | Bản nhẹ trong video |
|---|---|---|
| **Target modules** | Gắn LoRA vào những bộ phận nào? | Nhóm attention |
| **Rank `r`** | Phần điều chỉnh LoRA lớn đến đâu? | 32 |
| **Alpha** | Điều chỉnh sức ảnh hưởng của LoRA | 64 |
| **Dropout** | Tạo nhiễu tạm thời khi học để hạn chế phụ thuộc quá mức | 0.1 |
| **Epoch** | Học qua toàn bộ tập train mấy lần? | 1 |
| **Batch size** | Xử lý bao nhiêu mẫu một lượt? | 32 |
| **Gradient accumulation** | Gom mấy lượt gradient trước khi cập nhật? | 1 |
| **Learning rate** | Mỗi lần điều chỉnh mạnh đến đâu? | `0.0001` |
| **Warmup + scheduler** | Learning rate thay đổi thế nào? | Tăng trong 1% đầu, rồi giảm theo cosine |
| **Optimizer** | Thuật toán cập nhật tham số | `paged_adamw_32bit` |
| **Max sequence length** | Giới hạn token cho một mẫu huấn luyện | 128 |

Rank lớn, batch lớn hoặc dropout cao **không bảo đảm tốt hơn**. Đây là cấu hình của bài giảng, không phải công thức tối ưu cho mọi trường hợp.

## 4. Bốn bước học nằm sau lệnh train

1. **Forward:** tính dự đoán.
2. **Loss:** đo mức lỗi so với đáp án.
3. **Backward:** tính gradient, tức hướng/độ nhạy để điều chỉnh.
4. **Optimizer step:** cập nhật tham số LoRA.

`SFTTrainer` thực hiện vòng lặp này. Bạn cung cấp dữ liệu và cấu hình rồi gọi `.train()`.

Trong SFT ngôn ngữ, loss thường đo việc dự đoán token đáp án; **loss không phải trực tiếp số USD dự đoán sai**.

## 5. Train, validation và test

| Tập dữ liệu | Vai trò |
|---|---|
| **Train** | Bài luyện, dùng cập nhật tham số |
| **Validation** | Kiểm tra định kỳ, giúp chọn cấu hình/checkpoint |
| **Test** | Đánh giá cuối sau khi đã chốt lựa chọn |

Mô hình làm tốt trên train nhưng kém trên dữ liệu giữ riêng có thể là **overfitting — quá khớp**.

## 6. Những con số trên màn hình

Bản nhẹ: **20.000 mẫu, batch 32, 1 epoch, 1 GPU, tích lũy 1**.

```text
20.000 / 32 = 625 bước cập nhật
```

- Mỗi **5 bước**: ghi log.
- Mỗi **100 bước**: lưu và đánh giá định kỳ trên **500 mẫu validation**.
- Chưa tới bước 100 mà chưa thấy validation loss: có thể hoàn toàn bình thường.
- Bản đầy đủ dùng 800.000 mẫu, 3 epochs, batch 256 và rank 256, đòi hỏi nhiều tài nguyên hơn.

Mô hình nạp khoảng 2,2 GB trong video nhưng huấn luyện dùng gần 15 GB GPU: còn cần bộ nhớ cho dữ liệu trung gian, gradient và optimizer.

## 7. Nhìn biểu đồ thế nào?

| Quan sát qua nhiều điểm | Ý nghĩa có thể có |
|---|---|
| Train loss và validation loss cùng giảm | Có dấu hiệu học tiến bộ |
| Train loss giảm, validation loss tăng kéo dài | Có thể quá khớp |
| Learning rate tăng nhanh đầu buổi rồi giảm dần | Warmup và cosine scheduler đang hoạt động |
| GPU báo OOM | Cấu hình vượt bộ nhớ; thử giảm batch |

Không kết luận từ một điểm loss. Cũng không chọn mô hình chỉ vì nó là checkpoint cuối cùng.

**Checkpoint** là bản lưu ở một mốc. **Early stopping** là tự dừng theo tiêu chí; chỉ lưu checkpoint chưa có nghĩa đã bật early stopping.

## 8. Bốn điểm dễ hiểu nhầm

- **QLoRA:** trọng số nền được lượng tử hóa và giữ cố định; phần LoRA được học.
- **Alpha:** LoRA chuẩn thường dùng hệ số `alpha/r`; chọn alpha gấp đôi rank chỉ là một lựa chọn. [Tài liệu PEFT](https://huggingface.co/docs/peft/en/package_reference/lora#peft.LoraConfig).
- **Tích lũy gradient:** giúp đạt batch hiệu dụng lớn khi thiếu bộ nhớ, không bảo đảm tăng tốc. Trên một GPU, batch 8 × tích lũy 4 = batch hiệu dụng 32. [Tài liệu Accelerate](https://huggingface.co/docs/accelerate/usage_guides/gradient_accumulation).
- **Loss giảm:** chưa chứng minh dự đoán giá tốt hơn. Cần đánh giá sai số giá trên test và so với mô hình nền.

## 9. Câu cần nhớ sau khi học

> Tôi đang dùng ví dụ có đáp án để huấn luyện phần LoRA gắn vào Llama. Tôi chọn cách học bằng hyperparameters, để SFTTrainer chạy, dùng W&B theo dõi, rồi đánh giá dữ liệu giữ riêng để biết việc tinh chỉnh có thực sự hữu ích.

*Nguồn: 5 video và phụ đề 011–015 bạn cung cấp; cấu hình đối chiếu từ màn hình video 013–014. Ví dụ giải thích là phần bổ sung. Xem file bản đầy đủ để hiểu từng tham số và các điểm cần diễn giải chính xác hơn.*
