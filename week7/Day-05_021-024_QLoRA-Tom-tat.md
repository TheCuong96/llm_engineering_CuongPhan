# Day 5 — Bản tóm tắt bài 021–024

> Đọc nhanh khoảng 4–5 phút. Dựa trên bốn bài bạn gửi; số liệu là kết quả thí nghiệm trong khóa học, không phải bảng xếp hạng AI hiện tại.

## 1. Cả phần này muốn nói điều gì?

**Sau khi fine-tune mô hình, cần hiểu nó học thế nào, tải đúng bản đã học và kiểm tra xem nó làm nhiệm vụ tốt hơn chưa.**

Nhiệm vụ cụ thể: **đọc mô tả sản phẩm → dự đoán giá**. Mô hình là LLaMA 3.2 khoảng 3 tỷ tham số, lượng tử hóa 4-bit và bổ sung LoRA adapter. Đây là tinh chỉnh mô hình có sẵn, không phải tạo ChatGPT từ đầu.

| Bài | Ý chính |
| --- | --- |
| 021 | Giải thích vòng lặp huấn luyện. |
| 022 | Giải thích cross-entropy loss: mô hình bị chấm điểm thế nào. |
| 023 | Nạp mô hình đã fine-tune và đánh giá bản Lite. |
| 024 | Đánh giá bản Full và giải thích vì sao chuyên môn hóa có thể thắng mô hình lớn. |

## 2. Mô hình học bằng bốn bước

1. **Forward pass:** tính điểm số cho các token có thể xuất hiện tiếp theo.
2. **Tính loss:** xem mô hình dành bao nhiêu xác suất cho token đáp án đúng.
3. **Backward pass:** dùng backpropagation để tính gradient — hướng điều chỉnh tham số.
4. **Optimizer step:** cập nhật tham số có thể học bằng những bước nhỏ.

Với LoRA trong bài, **mô hình nền được giữ nguyên trọng số; adapter là phần được cập nhật**. Mô hình nền vẫn tham gia tính toán.

## 3. Loss không phải số tiền đoán sai

Giả sử giá thật là **89 USD**, mô hình đoán **99 USD**:

- Sai số giá: `|99 − 89| = 10 USD`.
- Training loss: dựa trên **xác suất dành cho token đúng**, không lấy trực tiếp 99 trừ 89.

Công thức cho một token: `Loss = −ln(p của token đúng)`.

| Xác suất token đúng | Loss xấp xỉ |
| --- | ---: |
| 90% | 0,105 |
| 50% | 0,693 |
| 10% | 2,303 |

**Nhớ một câu:** càng ít tin vào đáp án đúng, càng bị phạt nhiều.

Mô hình sinh đúng chưa chắc loss bằng 0: token đúng có thể đứng đầu nhưng xác suất chưa bằng 100%. Với đáp án nhiều token, loss thường được tổng hợp trên các vị trí được chấm. Ví dụ coi `89` là một token chỉ để dễ hiểu; tokenizer thực tế quyết định cách tách.

**Logits** là điểm số thô; **softmax** đổi điểm số thành phân phối xác suất. Khi sinh đáp án, hệ thống chọn token đứng đầu hoặc lấy mẫu theo phân phối đó.

## 4. Dùng mô hình sau fine-tuning như thế nào?

Nạp **base model + tokenizer + LoRA adapter đúng phiên bản**, rồi chạy dự đoán.

- Adapter bổ sung điều chỉnh bên trong mô hình; thông thường không hoạt động độc lập.
- `revision` chỉ định phiên bản adapter/checkpoint muốn tải.
- Đổi sang bản Full trong notebook đánh giá là chọn adapter đã huấn luyện, không tự huấn luyện thêm.
- Chọn checkpoint bằng validation; dùng test để đánh giá sau khi chốt.

| Tập dữ liệu | Công việc |
| --- | --- |
| Train | Cho mô hình học. |
| Validation | Chọn cấu hình và checkpoint. |
| Test | Kiểm tra cuối trên dữ liệu giữ riêng. |

## 5. Kết quả cần nhớ

Đánh giá trên 200 mẫu test. **Sai số thấp hơn là tốt hơn.**

| Hệ thống trong phép so sánh của bài | Sai số trung bình |
| --- | ---: |
| Con người — giảng viên Ed | Khoảng 87 USD |
| LLaMA fine-tune Lite | 65,40 USD |
| GPT-4.1 nano | 62,51 USD |
| GPT-5.1 | 44,74 USD |
| LLaMA fine-tune Full | **39,85 USD** |

Tên tệp bài 023 ghi “GPT-4o Nano”, nhưng lời giảng và biểu đồ dùng **GPT-4.1 nano**.

Bản Lite dùng rank 32, tập trung adapter ở attention. Bản Full dùng rank 256, thêm adapter ở MLP và có chế độ huấn luyện lớn hơn. Vì nhiều yếu tố thay đổi, không thể nói kết quả tốt lên chỉ nhờ tăng rank.

**39,85 USD là sai số trung bình**, không phải tỷ lệ sai 39,85%, cũng không phải mỗi sản phẩm đều lệch đúng số tiền đó. So với 44,74 USD, MAE giảm khoảng 10,9%; không có nghĩa mô hình thông minh hơn 10,9%.

## 6. “Thắng mô hình lớn” phải hiểu thế nào?

Giống một người chuyên định giá một loại hàng có thể làm việc đó tốt hơn một người biết rộng: mô hình nhỏ được luyện đúng nhiệm vụ có thể đạt kết quả tốt hơn ở nhiệm vụ đó.

Kết quả chứng minh **bản Full tốt hơn các mốc được so sánh trên bài test định giá này**. Nó không chứng minh giỏi hơn về code, dịch thuật, mọi loại hàng hay mọi bộ dữ liệu.

Bài học quan trọng: **nhiệm vụ rõ + dữ liệu phù hợp + đánh giá đúng** có thể tạo lợi thế chuyên môn rất lớn. Fine-tuning không tự động bảo đảm thắng; vẫn cần kiểm tra overfitting và lỗi thực tế.

## 7. Năm điều nên mang theo

- Phân biệt **loss dự đoán token** với **MAE dự đoán giá**.
- Dùng đúng base model, tokenizer, adapter và revision.
- Checkpoint cuối chưa chắc tốt nhất; chọn bằng validation.
- Không liên tục chỉnh theo test rồi coi điểm đó là đánh giá khách quan cuối cùng.
- Đánh giá thành công theo nhiệm vụ của bạn, không chỉ theo độ lớn hay danh tiếng mô hình.

**Tự kiểm tra:** giá thật 89, mô hình sinh 99; sai số tiền là 10 USD. Bạn chưa biết training loss nếu chưa biết xác suất nó dành cho token đáp án đúng.

Phần tiếp theo của khóa học mới giới thiệu triển khai mô hình để gọi từ xa, xây RAG và kết hợp agent; bốn bài này chủ yếu khép lại huấn luyện và đánh giá.
