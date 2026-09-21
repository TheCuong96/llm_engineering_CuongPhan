# Day 4 — Bản tóm tắt nhanh video 016–020

> Nguồn: toàn bộ 5 phụ đề SRT bạn cung cấp. Đây là bản rút gọn để nắm ý; ví dụ diễn giải được bổ sung cho dễ hiểu.

## 1. Phần này muốn dạy gì?

**Cách biết mô hình đang học tốt, phát hiện khi nó bắt đầu học thuộc và chọn phiên bản tốt nhất để sử dụng.**

Bài toán trong video: fine-tune LLaMA 3.2 bằng QLoRA để dự đoán giá từ mô tả sản phẩm. Trọng tâm Day 4 là theo dõi và chọn kết quả, chưa phải đánh giá cuối trên test.

## 2. Mỗi video đóng góp điều gì?

| Video | Ý chính |
|---|---|
| 016 | Đọc training loss và validation loss; cẩn thận trục biểu đồ và đường làm mượt |
| 017 | Tăng lên 800.000 mẫu, dùng A100; hiểu nhu cầu thời gian và bộ nhớ |
| 018 | Hiểu batch, step, epoch, warmup và lịch giảm learning rate |
| 019 | Phát hiện overfitting bằng cách so sánh hai loại loss; thử nhiều cấu hình |
| 020 | Chọn đúng checkpoint trên Hugging Face; giữ test riêng để đánh giá cuối |

## 3. Ví dụ dễ nhớ

Bạn đào tạo một nhân viên định giá:

- **Train:** sản phẩm có đáp án để họ luyện và được sửa.
- **Validation:** sản phẩm giữ riêng để kiểm tra định kỳ, chọn cách đào tạo và thời điểm tốt nhất.
- **Test:** bài thi cuối, chưa dùng để chọn phương án.

Nếu họ làm bài cũ ngày càng tốt nhưng định giá sản phẩm mới ngày càng kém, đó là hình ảnh của **overfitting — học quá khớp dữ liệu huấn luyện**.

Validation không dùng để cập nhật tham số trực tiếp, nhưng có dùng để lựa chọn mô hình. Vì vậy, không dùng lại nó làm phép kiểm tra cuối độc lập.

## 4. Ba đường biểu đồ cần hiểu

| Chỉ số | Trả lời câu hỏi nào? |
|---|---|
| Training loss | Mô hình khớp dữ liệu đang học tốt đến đâu? |
| Validation loss, trong bài là `eval/loss` | Mô hình làm tốt đến đâu trên bộ dữ liệu được giữ riêng? |
| Learning rate | Mỗi bước đang điều chỉnh mô hình mạnh đến mức nào? |

**Loss thấp hơn thường tốt hơn trong cùng điều kiện đo. Nhưng loss 1,12 không có nghĩa sai 1,12 USD.** Loss trong bài liên quan dự đoán token; muốn biết lệch giá bao nhiêu phải đo chỉ số giá thực tế.

Training loss giảm nhanh lúc đầu có thể do mô hình học được khuôn dạng câu trả lời, chẳng hạn một con số và `.00`. Chưa đủ để kết luận định giá giỏi.

Khi xem biểu đồ, kiểm tra tên chỉ số, trục và đường gốc. Smoothing chỉ làm đường hiển thị mượt hơn, không cải thiện mô hình.

## 5. Những con số đáng nhớ của thí nghiệm

| Nội dung | Kết quả/cấu hình trong bài |
|---|---|
| Lần chạy nhỏ | 20.000 mẫu train, 500 mẫu validation, 1 epoch |
| Validation loss lần nhỏ | Khoảng 1,29 xuống 1,248 |
| Lần chạy lớn | 800.000 mẫu train, 1.000 mẫu validation, 3 epoch |
| Batch size trong phép tính của bài | 256 |
| Step mỗi epoch | 800.000 / 256 = 3.125 |
| Tổng step | 3.125 × 3 = 9.375 |
| Tổng lượt xử lý mẫu | 2,4 triệu lượt; vẫn chỉ 800.000 mẫu khác nhau |
| Checkpoint được chọn | Khoảng step 6200, validation loss ≈ 1,12345 |
| Khi sang epoch ba | Training loss giảm, nhưng validation loss tăng lên khoảng 1,283 |

**Bài học lớn nhất: checkpoint cuối không nhất thiết là checkpoint tốt nhất.** Trong run này, bản gần cuối epoch hai tốt hơn bản sau khi tiếp tục học sang epoch ba.

Step 6200 chỉ là mốc tốt nhất được chọn trong thí nghiệm đó, không phải con số nên áp dụng cho mọi dự án.

## 6. Những thuật ngữ còn lại

- **Run:** một lần chạy huấn luyện với một cấu hình.
- **Batch:** một nhóm mẫu được xử lý cùng nhau.
- **Step:** bước huấn luyện; nếu có gradient accumulation, nhiều batch nhỏ mới tạo thành một bước cập nhật.
- **Epoch:** một lượt đi qua toàn bộ tập train.
- **Warmup:** tăng learning rate dần ở đầu quá trình.
- **Cosine scheduler:** giảm learning rate theo đường cong sau warmup. Trong bài, lịch chạy xuyên cả ba epoch.
- **Checkpoint:** bản lưu mô hình/adapter ở một thời điểm.
- **Adapter:** phần tham số học thêm bằng LoRA; cần mô hình nền tương thích để sử dụng.

## 7. Nếu kết quả chưa tốt, làm gì?

Giảng viên gợi ý thử learning rate, batch size, dropout, LoRA rank hoặc target modules. Ví dụ tăng dropout từ 0,1 lên 0,2 có thể giúp giảm overfitting, nhưng không bảo đảm tốt hơn.

Hãy giữ một run làm mốc, đổi một yếu tố chính mỗi lần và dùng cùng validation set để so sánh. Training loss đẹp nhất chưa chắc có validation loss tốt nhất.

Nếu hết VRAM, giảm batch xử lý cùng lúc là cách đơn giản được nêu trong bài. File trọng số nhỏ không có nghĩa huấn luyện dùng ít bộ nhớ, vì còn nhiều dữ liệu trung gian và trạng thái phục vụ việc học.

## 8. Quy trình chọn kết quả

1. Dùng **W&B** để xác định run và step có validation loss tốt nhất.
2. Tìm đúng repository và checkpoint đã lưu trên **Hugging Face**.
3. Ghi lại **commit ID thực tế** của phiên bản đó; số step 6200 không phải commit ID.
4. Tải đúng phiên bản đã chọn.
5. Đánh giá trên **test set** chưa dùng để lựa chọn, bằng chỉ số phù hợp bài toán giá.

Chọn checkpoint cũ sau khi chạy xong khác với **early stopping**: early stopping thực sự dừng trong lúc huấn luyện khi thỏa điều kiện, nhờ đó có thể tiết kiệm phần tính toán còn lại.

Trước khi dừng/xóa runtime, xác nhận checkpoint cần giữ đã được lưu thành công. Chi phí, thời gian và thông số tài nguyên Colab trong video chỉ phản ánh lần chạy được quay, không phải cam kết hiện hành.

## 9. Chỉ cần nhớ ba câu

1. **Training loss cho biết học bài cũ; validation giúp kiểm tra khả năng áp dụng sang dữ liệu giữ riêng.**
2. **Học thêm có thể kém đi: hãy chọn checkpoint theo kết quả đo, không theo độ mới.**
3. **Sau khi chọn bằng validation, dùng test riêng để kiểm tra chất lượng thật.**
