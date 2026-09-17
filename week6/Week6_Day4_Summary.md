# AI — Day 4: Bản tóm tắt video 017–021

> Đọc nhanh để nắm mục tiêu; dùng bản đầy đủ khi cần ví dụ và giải thích mã. Số liệu dưới đây là kết quả trong video, không phải bảng xếp hạng AI hiện tại.

## 1. Phần này muốn dạy bạn điều gì?

**Dùng bài toán “đọc mô tả sản phẩm → đoán giá” để học cách huấn luyện mô hình và so sánh các giải pháp AI bằng kết quả đo được.**

Giảng viên thử hai hướng: tự huấn luyện một mạng nơ-ron nhỏ và hỏi những LLM đã có sẵn. Đây chưa phải bài xây ChatGPT từ đầu; fine-tuning được để sang buổi tiếp theo.

| Video | Điều cần hiểu |
|---|---|
| 017 | Máy học bằng cách dự đoán, đo lỗi và sửa tham số |
| 018 | Cho một người thử đoán để thấy bài toán khó thế nào |
| 019 | Tạo và huấn luyện mạng dự đoán giá bằng PyTorch |
| 020 | Thử GPT-4.1 nano và Claude Opus 4.5, không huấn luyện thêm |
| 021 | Thử Gemini, Grok, GPT-5.1 và so kết quả |

## 2. Cách mạng nhỏ học

Mỗi mẫu gồm **mô tả sản phẩm + giá thật**. Mô tả được chuyển thành vector số; mạng nhận vector và trả về giá dự đoán.

Với mỗi nhóm dữ liệu, lặp bốn bước:

1. **Forward:** dự đoán giá.
2. **Loss:** đo sai lệch với giá thật.
3. **Backward:** tính gradient — thông tin cho biết tham số ảnh hưởng đến lỗi thế nào.
4. **Optimizer:** cập nhật tham số theo thông tin đó.

Ví dụ: đoán 150 USD nhưng giá thật 200 USD → tính mức sai → điều chỉnh các trọng số → tiếp tục học từ các sản phẩm khác. Không phải viết tay quy tắc giá cho từng mặt hàng.

| Thuật ngữ | Nhớ ngắn gọn |
|---|---|
| Parameter | Trọng số/độ lệch mà mô hình học |
| Hyperparameter | Thiết lập quá trình học, như learning rate |
| Batch | Một nhóm mẫu xử lý mỗi lượt |
| Epoch | Đi hết tập training một lần |
| Learning rate | Hệ số điều khiển mức cập nhật |
| Inference | Dùng mô hình để dự đoán, không cập nhật trọng số |
| Overfitting | Giỏi dữ liệu đã học nhưng kém dữ liệu mới |

Mạng trong video: **5.000 đặc trưng đầu vào, 8 lớp Linear, 669.249 tham số, batch 64, 2 epoch, Adam, learning rate 0.001, loss MSE**. Đây là cấu hình minh họa, không cần học thuộc.

## 3. Vì sao LLM không học thêm mà vẫn làm tốt?

LLM **đã được huấn luyện từ trước**, có kiến thức nền về ngôn ngữ và sản phẩm. Trong bài, chương trình chỉ gửi mô tả kèm yêu cầu ước lượng giá, rồi chấm câu trả lời.

- **Training mạng nhỏ:** tự học từ các cặp mô tả–giá.
- **Prompt/inference với LLM:** dùng năng lực đã có, không sửa trọng số.
- **Fine-tuning:** học tiếp để thay đổi trọng số; chưa thực hiện trong phần này.
- **RAG:** truy xuất thông tin bổ sung; không triển khai ở đây.

LLM cũng là mạng nơ-ron, nhưng kiến trúc và quá trình huấn luyện khác xa mạng nhỏ trong bài.

## 4. Chấm điểm thế nào? Kết quả ra sao?

**MAE = trung bình độ lệch tuyệt đối giữa giá dự đoán và giá thật. Càng thấp càng tốt.**

Ví dụ: ba sản phẩm sai 20, 30 và 50 USD thì MAE khoảng 33.33 USD. Đây không phải phần trăm chính xác hay mức sai tối đa.

| Người / mô hình | MAE (USD) |
|---|---:|
| Giảng viên tự đoán | 87.62 |
| Mạng nơ-ron tự huấn luyện | 63.97 |
| GPT-4.1 nano | 62.51 |
| Claude Opus 4.5 | 47.10 |
| Gemini 3 Pro Preview | 50.54 |
| Gemini 2.5 Flash Lite | 58.68 |
| Grok 4.1 Fast | 57.62 |
| GPT-5.1 | 44.74 |

**Giới hạn:** giảng viên chỉ chấm 100 mẫu; Gemini 3 chấm 50; nhiều lượt mô hình khác dùng 200. Vì vậy đây là kết quả minh họa, chưa đủ để khẳng định thứ hạng chắc chắn. Một người cũng không đại diện cho mọi người.

MSE phạt lỗi lớn mạnh hơn MAE và được dùng làm loss huấn luyện. R² không phải tỷ lệ dự đoán đúng. Trên biểu đồ, chấm càng gần đường chéo thì giá dự đoán càng gần giá thật.

## 5. Những điều dễ hiểu nhầm

- Tên file 020 nhắc GPT-4o-mini, nhưng nội dung thực tế chạy **GPT-4.1 nano**.
- Mã HashingVectorizer dùng **5.000 ô băm**, không chọn 5.000 từ phổ biến nhất; xem giải thích và nguồn kỹ thuật trong bản đầy đủ.
- “Không training” nghĩa là **không huấn luyện thêm trong bài**, không phải LLM chưa từng học.
- Có vector không có nghĩa đang dùng vector database hay RAG.
- Điểm GPT-5.1 thấp nhất ở đây không chứng minh nó tốt nhất cho mọi nhiệm vụ.
- Tăng reasoning không cải thiện rõ kết quả lần thử này; không thể suy ra reasoning luôn vô ích.

## 6. Điều đáng nhớ nhất

**Đừng bắt đầu bằng việc chọn mô hình nổi tiếng nhất. Hãy xác định bài toán, giữ dữ liệu kiểm tra riêng, tạo mốc so sánh, rồi đo hiệu quả từng cách.**

Train dùng để học; validation dùng để chọn cấu hình; test dùng để chấm cuối cùng. Cùng với sai số, cần cân nhắc tốc độ, chi phí và độ ổn định.

Nếu bạn giải thích được “máy dự đoán → đo sai → sửa trọng số” và phân biệt được **tự huấn luyện mạng** với **gọi LLM có sẵn**, bạn đã nắm được mục tiêu cốt lõi của cả 5 video.

*Nguồn: 5 video và phụ đề 017–021 do bạn cung cấp; tên mô hình dễ nhầm đã đối chiếu trên các biểu đồ trong video.*
