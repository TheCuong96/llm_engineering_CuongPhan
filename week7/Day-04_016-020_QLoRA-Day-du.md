# Day 4 — Theo dõi fine-tuning, phát hiện overfitting và chọn checkpoint tốt nhất

> Bản giảng giải đầy đủ cho video 016–020. Biên soạn từ toàn bộ 5 phụ đề SRT bạn cung cấp; không phải bản dịch từng câu. Các ví dụ đời thường và hướng dẫn suy luận là phần giải thích bổ sung. Số liệu thí nghiệm được ghi theo lời giảng, có làm tròn; những chỗ phụ đề nói vấp được diễn đạt lại theo ngữ cảnh.

## 1. Cả phần này thực sự muốn dạy bạn điều gì?

**Bấm nút huấn luyện chưa đủ. Bạn cần biết mô hình có tiến bộ trên dữ liệu mới không, có đang học thuộc không và phiên bản nào đáng giữ lại.**

Bài toán xuyên suốt là: đưa mô tả sản phẩm cho một mô hình LLaMA 3.2 đã có sẵn, rồi fine-tune bằng QLoRA để mô hình dự đoán giá. Phần này tập trung vào việc theo dõi và lựa chọn kết quả của quá trình đó.

Hãy tưởng tượng bạn đào tạo một nhân viên định giá:

- Bạn đưa các sản phẩm có giá sẵn để họ luyện tập.
- Thỉnh thoảng bạn đưa sản phẩm khác để xem họ có vận dụng được không.
- Bạn ghi lại năng lực của họ ở nhiều thời điểm.
- Nếu học thêm khiến họ nhớ đáp án cũ nhưng định giá sản phẩm mới kém đi, bạn cần nhận ra điều đó.

Trong thí nghiệm của giảng viên, **hai epoch đầu có ích, nhưng sang epoch thứ ba mô hình có dấu hiệu overfitting rất rõ**. Kết quả tốt nhất được chọn ở khoảng step 6200, trước khi chất lượng trên validation giảm sút.

Đây là kết quả của thí nghiệm cụ thể, không phải quy luật rằng mọi mô hình chỉ nên học hai epoch.

### Vai trò của từng video

| Video | Đang làm gì? | Điều bạn cần hiểu |
|---|---|---|
| 016 | Đọc kết quả lần chạy nhỏ trong Weights & Biases | Phân biệt training loss và validation loss; đọc biểu đồ có kiểm tra trục |
| 017 | Mở rộng lên 800.000 mẫu trên Colab A100 | Dữ liệu, batch size và cấu hình huấn luyện ảnh hưởng thời gian, bộ nhớ |
| 018 | Quan sát learning rate và training loss của lần chạy lớn | Hiểu warmup, scheduler, step, epoch; nhận ra tín hiệu cần kiểm tra |
| 019 | Đối chiếu validation loss, phát hiện overfitting, so sánh các run | Chọn thí nghiệm dựa trên dữ liệu được giữ riêng, không dựa riêng training loss |
| 020 | Đặt tên run và tìm phiên bản trên Hugging Face | Giữ đúng checkpoint và để dành test set cho đánh giá cuối |

## 2. Các thành phần đang làm nhiệm vụ gì?

| Thành phần | Cách hiểu đơn giản |
|---|---|
| Base model — mô hình nền | Người đã có kiến thức trước khi được đào tạo thêm về định giá |
| Fine-tuning — tinh chỉnh | Quá trình dạy thêm bằng các ví dụ phục vụ một nhiệm vụ |
| QLoRA | Cách tinh chỉnh tiết kiệm bộ nhớ: mô hình nền được lượng tử hóa, chủ yếu học các tham số LoRA bổ sung |
| SFT Trainer | Bộ phận điều phối việc học từ ví dụ có đáp án, đánh giá và lưu theo cấu hình |
| Google Colab / GPU A100 | Máy tính và phần cứng thực hiện phép tính huấn luyện |
| Weights & Biases, viết tắt W&B | Sổ thí nghiệm và bảng theo dõi: lưu chỉ số, cấu hình, biểu đồ của từng lần chạy |
| Hugging Face Hub | Nơi lưu và quản lý các phiên bản mô hình/adapter được đẩy lên |
| Run — lần chạy | Một thí nghiệm huấn luyện cụ thể với một cấu hình |
| Checkpoint — bản lưu tại một thời điểm | Trạng thái đã lưu của mô hình/adapter ở một bước huấn luyện |

**W&B cho biết nên chọn kết quả nào; checkpoint đã lưu mới là thứ giúp bạn lấy lại kết quả đó.** Có biểu đồ đẹp không đồng nghĩa đã lưu được mô hình.

## 3. Train, validation, test: ba tập dữ liệu khác nhau để làm gì?

Ví dụ bạn có nhiều mô tả sản phẩm kèm giá thật. Bạn chia chúng thành ba nhóm:

| Tập dữ liệu | Ví dụ đời thường | Vai trò |
|---|---|---|
| Training set — tập huấn luyện | Bài tập được luyện và sửa đáp án | Dùng để tính gradient và cập nhật tham số được huấn luyện |
| Validation set — tập thẩm định | Bài kiểm tra thử định kỳ | Theo dõi tiến bộ, chọn cấu hình và checkpoint |
| Test set — tập kiểm tra cuối | Đề thi cuối chưa sử dụng để luyện/chọn phương án | Đánh giá mô hình sau khi đã chốt lựa chọn |

Validation được giữ ngoài việc cập nhật tham số trực tiếp. Tuy nhiên, bạn vẫn dùng kết quả của nó để quyết định mô hình nào tốt hơn. Vì thế, validation **có tham gia vào quá trình lựa chọn**, dù không được dùng để học qua gradient.

Nếu thử 50 cấu hình rồi chọn cấu hình đạt điểm validation cao nhất, một phần điểm tốt ấy có thể đến từ việc tình cờ phù hợp với bộ validation. Bạn cần test set riêng để kiểm tra lựa chọn đó.

**Giải thích bổ sung:** cũng nên tránh để các bản sao hoặc các mô tả gần như giống hệt của cùng sản phẩm nằm ở cả train và validation/test. Khi đó, “dữ liệu chưa thấy” có thể thực chất rất giống bài đã học.

## 4. Video 016 — Mô hình đang tiến bộ hay biểu đồ chỉ trông có vẻ đẹp?

### 4.1. Loss — mức phạt cho dự đoán

Loss là một con số đo mức sai theo công thức huấn luyện. Với cùng cách tính và cùng điều kiện đánh giá, loss thấp hơn thường là tốt hơn.

Trong bài, giảng viên nhắc đến **cross-entropy loss — hàm mất mát entropy chéo** của bài toán dự đoán token. Hiểu đơn giản: mô hình phân bố khả năng cho các token tiếp theo; nếu nó dành khả năng quá thấp cho token đúng thì bị phạt nhiều hơn.

Ví dụ câu trả lời cần là `120.00`. Mô hình phải học cả cách tạo ra con số, dấu chấm, phần thập phân và kết thúc câu trả lời. Những vị trí cụ thể được tính loss còn phụ thuộc cách chuẩn bị dữ liệu và che nhãn trong trainer.

**Loss 1,12 không có nghĩa là sai 1,12 USD, cũng không có nghĩa là chính xác 98,88%.** Loss ở đây đo việc dự đoán token, không trực tiếp đo độ lệch giá tiền.

### 4.2. Vì sao training loss giảm mạnh ngay lúc đầu?

Theo giải thích của giảng viên, mô hình nhanh chóng nhận ra kiểu đầu ra cần có: một con số, phần `.00`, rồi kết thúc. Chỉ học đúng khuôn dạng đã giúp loss giảm đáng kể, từ khoảng 3 xuống quanh 1,3 trong ví dụ.

Giống nhân viên ban đầu trả lời lan man, sau đó biết chỉ cần ghi giá vào đúng ô. Họ đã tiến bộ về cách trả lời, nhưng chưa chắc định giá đúng.

Vì vậy, đừng nhìn đoạn giảm rất mạnh đầu tiên rồi kết luận mô hình đã giải quyết tốt bài toán kinh doanh.

### 4.3. Training loss khác validation loss ở đâu?

- **Training loss:** đo trên dữ liệu đang dùng để học. Nó giúp biết quá trình tối ưu có hoạt động không.
- **Validation loss**, hiển thị là `eval/loss` trong bài: đo trên bộ validation được giữ riêng. Nó giúp đánh giá khả năng vận dụng sang dữ liệu ngoài tập học.

Lần chạy nhỏ dùng 20.000 mẫu huấn luyện, 500 mẫu validation và đánh giá mỗi 100 step. Kết quả hoàn tất được giảng viên đưa ra có validation loss giảm từ khoảng 1,29 xuống 1,248.

Đó là tín hiệu có tiến bộ theo chỉ số loss. **Chưa thể từ đây suy ra sai số giá thực tế đã giảm bao nhiêu.** Phần đánh giá trên test được để sang ngày tiếp theo.

### 4.4. Ba việc phải kiểm tra khi đọc biểu đồ

1. **Xem tên chỉ số:** bạn đang nhìn training loss, validation loss hay learning rate?
2. **Xem trục:** trục ngang là step hay thời gian; trục dọc đang bao phủ khoảng nào?
3. **Xem xu hướng và dữ liệu gốc:** tránh kết luận từ một vài điểm hoặc chỉ từ đường làm mượt.

Trong video, đoạn giảm từ 1,2894 xuống 1,2693 trông rất mạnh vì trục dọc được phóng to. Chênh lệch thực chỉ khoảng 0,0201.

**Smoothing — làm mượt** giúp nhìn xu hướng khi đường gốc dao động. Nó không làm mô hình tốt lên, không thay đổi loss đã đo và có thể che mất một đợt tăng đột ngột. Nên giữ hiển thị đường gốc khi cần kiểm tra.

## 5. Video 017 — Từ chạy thử nhỏ đến 800.000 mẫu

### 5.1. Tại sao chạy nhỏ trước?

Chạy nhỏ giúp kiểm tra luồng dữ liệu, trainer, log và lưu kết quả trước khi dành nhiều tài nguyên cho thí nghiệm lớn. Khi mọi thứ đã hoạt động, giảng viên sao chép notebook để tạo một lần chạy khác.

Trong notebook của bài, `LIGHT_MODE = False` là cờ do tác giả đặt để đổi sang cấu hình lớn. Đây không phải một chế độ chung bắt buộc của QLoRA.

| Nội dung | Lần chạy nhỏ | Lần chạy lớn trong bài |
|---|---|---|
| Training data | 20.000 mẫu | 800.000 mẫu |
| Validation data | 500 mẫu | 1.000 mẫu |
| Số epoch | 1 | 3 |
| GPU được dùng | T4 | A100, phiên được giảng viên mô tả có 80 GB bộ nhớ GPU |
| Chu kỳ đánh giá | 100 step | 200 step |

Cấu hình lớn được mô tả có batch size 256, LoRA rank `r = 256`, dropout `0.1`, tác động vào các module thuộc attention và MLP, cùng lượng tử hóa 4-bit. Ở video 020, file cấu hình adapter cho thấy `lora_alpha = 512`.

Các con số này là **cấu hình thí nghiệm của giảng viên**, không phải cấu hình tối ưu chung.

### 5.2. Batch, step, epoch là gì?

Hình dung bạn có 800.000 phiếu sản phẩm:

- **Batch:** một nhóm phiếu được xử lý cùng nhau.
- **Step:** trong cách tính của lần chạy này, một bước cập nhật sau nhóm 256 mẫu.
- **Epoch:** một lượt đi qua toàn bộ 800.000 mẫu.

Theo phép tính của video:

```text
Số step mỗi epoch = 800.000 / 256 = 3.125
Số step cho 3 epoch = 3.125 × 3 = 9.375
Tổng lượt mẫu được xử lý = 800.000 × 3 = 2.400.000
```

**2,4 triệu lượt xử lý không phải 2,4 triệu mẫu khác nhau.** Vẫn là 800.000 mẫu, được xem qua ba lượt.

Giải thích bổ sung: trong cấu hình có gradient accumulation, nhiều batch nhỏ có thể mới tạo thành một bước cập nhật. Khi đó cần dùng batch hiệu dụng để tính số optimizer step; không áp dụng máy móc phép chia trên cho mọi notebook.

### 5.3. Vì sao mô hình lượng tử hóa nhỏ mà vẫn dùng nhiều VRAM?

Giảng viên mô tả mô hình nền đã lượng tử hóa khoảng 2,2 GB, nhưng khi huấn luyện, mức sử dụng bộ nhớ GPU lên khoảng 70,1 GB.

Không có mâu thuẫn: ngoài trọng số nền, quá trình học còn cần bộ nhớ cho các tham số adapter, gradient, trạng thái optimizer, kết quả trung gian và vùng nhớ phục vụ tính toán. Batch lớn và chuỗi dài có thể làm phần bộ nhớ này tăng mạnh.

Hãy hình dung một quyển sách chỉ chiếm một góc bàn, nhưng khi 256 người cùng làm bài theo sách, bạn cần thêm rất nhiều chỗ cho giấy nháp và kết quả trung gian.

Nếu hết bộ nhớ, video đề xuất giảm batch size. Giải thích bổ sung: giảm số mẫu thực xử lý cùng lúc có thể tiết kiệm VRAM; gradient accumulation có thể giúp duy trì batch hiệu dụng nhưng không bảo đảm tốc độ hay kết quả giống hệt cấu hình cũ.

Giảng viên còn kể rằng có lần giảm rank từ 256 xuống 32 lại gặp hết bộ nhớ, và thừa nhận chưa giải thích được. **Không nên rút ra quy luật “rank nhỏ dùng nhiều bộ nhớ hơn”.** Đó là quan sát bất thường của một lần chạy, chưa có đủ thông tin để kết luận nguyên nhân.

### 5.4. Thời gian, chi phí và việc dừng chạy

Lời giảng đưa nhiều ước lượng thời gian khác nhau, từ khoảng 15–17 giờ đến gần một ngày cho cấu hình lớn. Đây là các ước lượng trong quá trình quay, không phải cam kết thời gian.

Thông tin về phí, quota, GPU sẵn có và giới hạn Colab trong video phản ánh thời điểm ghi hình; tài liệu này không xác nhận chúng là chính sách hiện hành.

Bạn không cần chạy hết ba epoch mới có kết quả sử dụng được. Nhưng trước khi dừng hoặc xóa runtime, cần chắc rằng checkpoint cần giữ đã được lưu thành công ra nơi bền vững. Phần tiến bộ sau checkpoint cuối có thể mất. Muốn tiếp tục huấn luyện đúng trạng thái còn cần kiểm tra checkpoint có đủ trạng thái trainer/optimizer, không chỉ trọng số adapter.

## 6. Video 018 — Đọc learning rate và dấu hiệu đáng nghi

### 6.1. Learning rate là độ mạnh của mỗi lần điều chỉnh

Hình dung bạn chỉnh một chiếc cân:

- Chỉnh quá mạnh: dễ vượt qua vị trí tốt và dao động.
- Chỉnh quá nhẹ: tiến bộ chậm.
- Điều chỉnh độ mạnh theo giai đoạn: ban đầu thích nghi, sau đó tinh chỉnh dần.

**Warmup — giai đoạn tăng dần learning rate:** lúc đầu learning rate đi từ mức nhỏ lên mức mục tiêu.

**Cosine scheduler — lịch giảm theo đường cosine:** sau warmup, learning rate giảm dần theo một đường cong.

Trong cấu hình được trình bày, lịch này chạy xuyên suốt cả ba epoch. Nó không tự khởi động lại từ đầu mỗi epoch. Đây là hành vi của lịch được dùng trong bài, không phải mọi loại scheduler.

### 6.2. Vì sao batch lớn làm đường loss ít rung hơn?

Mỗi batch chứa nhiều mẫu hơn nên chỉ số tổng hợp thường ít bị chi phối bởi một vài mẫu khó hoặc dễ. Giống hỏi ý kiến nhiều người thường cho trung bình ít dao động hơn hỏi rất ít người.

Tuy vậy, **đường mượt hơn không chứng minh mô hình tổng quát hóa tốt hơn**. Batch nhỏ tạo nhiều nhiễu hơn trong quá trình tối ưu; đôi khi điều đó hữu ích. Batch size và learning rate cần được thử cùng với các điều kiện khác.

### 6.3. Training loss tụt mạnh khi đổi epoch có đáng mừng không?

Giảng viên quan sát training loss giảm rõ khi sang các epoch tiếp theo. Một cách giải thích là mô hình bắt đầu gặp lại dữ liệu đã học, nên dự đoán đáp án quen thuộc tốt hơn.

Điều đó chưa đủ để kết luận overfitting. Nó trở nên đáng ngại nếu mô hình ngày càng làm tốt bài cũ nhưng làm kém bài ngoài tập học.

**Câu hỏi cần hỏi tiếp: validation loss có cùng cải thiện không?**

## 7. Video 019 — Bắt gặp overfitting trong kết quả thật

### 7.1. Overfitting — học quá khớp dữ liệu huấn luyện

Một người nhớ rằng chiếc tai nghe cụ thể trong bài tập có giá 120 USD có thể trả lời đúng khi gặp lại nó. Nhưng nếu họ không nắm được ảnh hưởng của thương hiệu, tính năng và chất lượng, họ có thể định giá sai một chiếc tai nghe khác.

Đó là cách hình dung overfitting: mô hình khớp quá sát những chi tiết của tập huấn luyện, khiến khả năng áp dụng sang dữ liệu mới kém đi.

Ví dụ “mô hình giống một đống câu lệnh if” trong lời giảng chỉ là phép so sánh về hành vi học thuộc. Mô hình không thực sự chuyển thành mã nguồn gồm các câu lệnh if.

### 7.2. Diễn biến được trình bày

| Thời điểm | Quan sát trong video | Cách đọc |
|---|---|---|
| Đầu lần chạy lớn | Validation loss quanh 1,27, có một đợt tăng sớm | Cần theo dõi tiếp; một điểm tăng chưa đủ kết luận |
| Qua phần lớn hai epoch đầu | Validation loss dần giảm | Mô hình có tiến bộ trên tập giữ riêng |
| Khoảng step 6200 | Validation loss khoảng 1,12345, thấp nhất được giảng viên chọn | Checkpoint ứng viên tốt nhất theo validation loss |
| Sang epoch thứ ba | Training loss giảm mạnh nhưng validation loss tăng lên khoảng 1,283 | Dấu hiệu rõ của overfitting trong thí nghiệm này |

Theo phép tính 3.125 step/epoch, hai epoch tương ứng 6.250 step. Vì đánh giá theo chu kỳ 200 step, mốc 6.200 ở gần cuối epoch hai; điểm đánh giá 6.400 nằm trong epoch ba.

Điều này cũng có nghĩa: **6.200 là điểm tốt nhất trong các mốc được đo và được chọn trong bài**, không phải bằng chứng rằng đó là thời điểm tối ưu tuyệt đối giữa mọi lần cập nhật.

### 7.3. Vì sao không lấy checkpoint cuối?

Checkpoint cuối chứa trạng thái sau khi mô hình đã tiếp tục học vào giai đoạn validation xấu đi. Lấy bản cuối chỉ vì nó mới nhất sẽ bỏ qua bằng chứng rằng bản trước đó tốt hơn trên tiêu chí lựa chọn.

Quy tắc: **giữ bản có kết quả validation phù hợp nhất với mục tiêu; sau đó kiểm tra trên test.** Trong bài, tiêu chí lựa chọn là validation loss thấp nhất.

### 7.4. Đợt validation loss tăng sớm có phải cũng là overfitting?

Giảng viên đối chiếu learning rate và thấy đợt tăng xảy ra gần đỉnh learning rate. Ông đưa ra giả thuyết learning rate cao làm việc cập nhật dao động quá mạnh, rồi khi learning rate giảm, mô hình học ổn định hơn.

Đây là **giả thuyết giải thích**, không phải nguyên nhân đã được chứng minh. Không nên gọi mọi đợt tăng validation loss là overfitting, hay kết luận mô hình đã “nhảy ra khỏi cực tiểu toàn cục” chỉ từ biểu đồ.

### 7.5. Có thể thử điều chỉnh gì?

Các hướng được giảng viên nêu:

| Tham số/cách làm | Mục đích thử | Đánh đổi cần hiểu |
|---|---|---|
| Chọn checkpoint sớm hơn hoặc dừng sớm | Tránh dùng giai đoạn đã xấu đi | Có thể bỏ lỡ cải thiện muộn nếu dừng quá vội |
| Dropout từ 0,1 lên 0,2 | Tăng mức ngẫu nhiên trong phần huấn luyện để giảm phụ thuộc quá mức | Không bảo đảm tốt hơn; có thể làm học khó hơn |
| Giảm LoRA rank `r` | Giảm độ linh hoạt/số tham số của adapter | Có thể giảm cả khả năng học nhiệm vụ |
| Giảm số target modules | Thu hẹp những vị trí được thêm LoRA | Có thể hạn chế mức cải thiện |
| Đổi learning rate | Điều chỉnh độ mạnh của cập nhật | Quá lớn dễ bất ổn; quá nhỏ có thể chậm |
| Đổi batch size | Thay đổi mức nhiễu, nhu cầu bộ nhớ và số bước | Làm việc so sánh các run phức tạp hơn |

Dropout 0,2 không có nghĩa là xóa 20% dữ liệu huấn luyện. Trong ngữ cảnh LoRA, nó là cơ chế ngẫu nhiên trong nhánh LoRA khi học.

Không có tham số nào ở bảng trên bảo đảm đánh bại kết quả cũ. Bạn cần chạy thử rồi đo lại.

### 7.6. So sánh các run như một thí nghiệm

Trong W&B, giảng viên quay về project để chồng biểu đồ của nhiều run, bật/tắt từng run và so sánh chúng. Thông điệp là: chọn theo kết quả đo, thay vì cảm giác một cấu hình “có vẻ tốt”.

Quy trình bổ sung để dễ rút ra kết luận:

1. Giữ một run làm mốc so sánh.
2. Giữ cố định validation set và cách tính chỉ số.
3. Mỗi lần đầu tiên chỉ đổi một yếu tố chính, ví dụ learning rate.
4. Ghi rõ cấu hình, kết quả validation tốt nhất và checkpoint tương ứng.
5. Nếu kết quả chênh rất nhỏ, cân nhắc độ biến thiên giữa các lần chạy.

Khi đổi batch size, cùng 1.000 step có thể tương ứng lượng dữ liệu đã xử lý khác nhau. Nên đối chiếu thêm epoch, số mẫu đã đi qua hoặc thời gian chạy. Tương tự, không xếp hạng trực tiếp hai loss lấy từ hai validation set khác nhau như thể chúng là một phép thi hoàn toàn giống nhau.

## 8. Video 020 — Giữ đúng run và đúng phiên bản

### 8.1. Đặt tên để biết mình đã thử gì

Tên theo thời gian giúp sắp thứ tự nhưng khó nhớ mục đích. Video minh họa đổi tên hiển thị thành `main best` để nhận ra run tốt.

Ví dụ tên tự đặt dễ đọc: `baseline`, `lower-lr`, `dropout-02`. Nên kèm cấu hình thật trong phần ghi chép; tên ngắn không thay thế hồ sơ thí nghiệm.

Đổi tên hiển thị trong W&B không tự đổi repository mô hình trên Hugging Face hay tạo một kết quả huấn luyện mới.

### 8.2. Trên Hugging Face đang lưu gì?

Video mở trang model và tab `Files and versions`, trong đó có:

- `adapter_model.safetensors`: trọng số adapter đã học; ví dụ trong bài khoảng 1,56 GB.
- File cấu hình adapter: ghi các thông tin như rank, alpha và target modules.
- Lịch sử commit: cho phép tìm lại các phiên bản đã được đẩy lên.

Adapter là phần bổ sung đã học. Khi dùng adapter, bạn vẫn cần mô hình nền tương thích và cấu hình/tokenizer phù hợp. Không nên hiểu file adapter là toàn bộ mô hình độc lập.

### 8.3. Cách chọn bản tốt theo luồng của bài

1. Trong W&B, xác định run và step có validation loss tốt nhất.
2. Mở repository Hugging Face tương ứng với run đó.
3. Vào lịch sử phiên bản và tìm commit lưu trạng thái tại step 6200.
4. Sao chép **commit ID thực tế** để xác định đúng phiên bản khi tải lại.

`6200` là số bước huấn luyện, không phải bản thân commit ID. Commit ID là mã phiên bản riêng do hệ thống quản lý mã nguồn tạo ra. Tài liệu không chép một mã cụ thể vì phụ đề không cung cấp mã đó.

Lịch sử chỉ có ích khi checkpoint đã được lưu/đẩy lên thành công. W&B có điểm đo step 6200 không tự bảo đảm Hugging Face có checkpoint đúng step đó.

### 8.4. Chọn checkpoint cũ và early stopping khác nhau thế nào?

- **Best-checkpoint selection:** chạy xong rồi quay lại lấy bản đã đạt validation tốt nhất.
- **Early stopping:** trong lúc chạy, theo dõi tiêu chí và dừng khi không còn cải thiện theo điều kiện đặt ra, thường có khoảng chờ để tránh dừng vì dao động ngắn.

Video chủ yếu minh họa cách thứ nhất. Cả hai đều tránh sử dụng giai đoạn huấn luyện kém hiệu quả, nhưng chỉ dừng sớm thực sự mới tiết kiệm phần tính toán chưa chạy.

## 9. Ghép cả năm bài thành quy trình dễ nhớ

1. **Chuẩn bị:** có mô hình nền và ba tập train/validation/test tách biệt.
2. **Chạy nhỏ:** kiểm tra huấn luyện, log, đánh giá và lưu checkpoint.
3. **Mở rộng nếu cần:** dùng nhiều dữ liệu/tài nguyên hơn khi đã hiểu cấu hình.
4. **Theo dõi đồng thời:** training loss, validation loss và learning rate.
5. **Đọc xu hướng:** kiểm tra trục, đường gốc, sự thay đổi qua nhiều mốc.
6. **Thử cấu hình:** so sánh các run trong điều kiện đánh giá nhất quán.
7. **Chọn checkpoint:** ghi lại run, step, repository và commit ID đúng.
8. **Đánh giá cuối:** tải checkpoint đã chọn và đo trên test set chưa dùng để lựa chọn.

### Ví dụ bổ sung về chỉ số kinh doanh

Giả sử ba sản phẩm có giá thật 100, 200 và 300 USD; mô hình dự đoán 110, 180 và 330 USD. Sai số tuyệt đối lần lượt là 10, 20 và 30 USD, nên sai số tuyệt đối trung bình là 20 USD.

Đó là **MAE — Mean Absolute Error**, một cách đo trực tiếp độ lệch giá. Nó trả lời câu hỏi thực tế khác với cross-entropy loss.

Ví dụ này không phải kết quả test của video. Bộ video 016–020 kết thúc ở bước chọn checkpoint; chưa chứng minh bằng kết quả test rằng mô hình đã định giá tốt đến mức nào.

## 10. Những điều cần tránh hiểu nhầm

| Hiểu nhầm | Cách hiểu đúng |
|---|---|
| Training loss thấp nhất nghĩa là mô hình tốt nhất | Cần xem validation và đánh giá cuối trên test |
| Loss thấp nghĩa là sai ít USD | Loss token và sai số giá là hai chỉ số khác nhau |
| Học ba epoch luôn hơn hai epoch | Học thêm có thể dẫn tới overfitting |
| Step 6200 là con số tối ưu cho mọi dự án | Chỉ là checkpoint được chọn trong run này |
| Có 2,4 triệu lượt mẫu nghĩa là có 2,4 triệu sản phẩm khác nhau | Đây là 800.000 mẫu được dùng qua ba epoch |
| Cứ thấy training loss tụt là overfitting | Phải đối chiếu validation và điều kiện chạy |
| Làm mượt biểu đồ giúp mô hình tốt hơn | Chỉ đổi cách hiển thị |
| Giảm rank chắc chắn xử lý được mọi lỗi hết VRAM | Nhu cầu bộ nhớ còn phụ thuộc nhiều thành phần khác |
| Dùng cùng cấu hình sẽ luôn ra số giống hệt video | Phần cứng, phiên bản phần mềm, dữ liệu và ngẫu nhiên có thể ảnh hưởng khả năng tái lập |
| Có checkpoint adapter là tiếp tục huấn luyện đúng trạng thái cũ được ngay | Tiếp tục đầy đủ có thể cần cả trạng thái optimizer/trainer |

## 11. Tự kiểm tra mức hiểu

**Câu 1:** Training loss giảm nhưng validation loss tăng kéo dài, bạn nên nghĩ đến điều gì?  
**Đáp án:** Overfitting là một khả năng quan trọng. Đối chiếu run và chọn checkpoint validation tốt hơn thay vì mặc định lấy bản cuối.

**Câu 2:** Vì sao không dùng luôn validation làm test cuối?  
**Đáp án:** Bạn đã dùng validation để chọn cấu hình/checkpoint, nên nó không còn là phép kiểm tra độc lập với quá trình lựa chọn.

**Câu 3:** Vì sao learning rate đang tăng ở đầu quá trình?  
**Đáp án:** Có thể đang ở warmup trước giai đoạn giảm của scheduler.

**Câu 4:** File adapter 1,56 GB có phải toàn bộ mô hình đã chạy độc lập được không?  
**Đáp án:** Không; adapter cần mô hình nền tương thích cùng các thành phần cần thiết để suy luận.

**Câu 5:** Kết quả quan trọng nhất bạn mang ra khỏi Day 4 là gì?  
**Đáp án:** Biết dùng chỉ số để nhận diện tiến bộ/overfitting và chọn đúng phiên bản để đánh giá trên test ở bước kế tiếp.

## 12. Nguồn và mốc xem lại

Các mốc dưới đây lấy từ phụ đề SRT đi kèm, dùng để tìm lại đoạn giảng:

| Nguồn | Mốc gần đúng | Nội dung |
|---|---|---|
| 016 — Monitoring Your Fine-Tuning Run with Weights & Biases | 01:15–05:30; 09:16–10:30 | Validation định kỳ, trục biểu đồ, loss cuối lần chạy nhỏ, loss token |
| 017 — Full Dataset Training on Google Colab A100 with 800K Data Points | 03:07–03:30; 06:56–08:30 | Batch/rank/dropout; bộ nhớ GPU và quan sát bất thường khi giảm rank |
| 018 — Monitoring Training Loss and Learning Rate in Weights & Biases | 01:15–03:15; phần cuối | Warmup xuyên suốt run, 9.375 step và training loss qua các epoch |
| 019 — Analyzing Weights & Biases Results and Catching Overfitting | 01:27–03:15; 05:52 trở đi | Step 6200, overfitting ở epoch ba, so sánh nhiều run |
| 020 — Managing Runs in Weights & Biases and Selecting Best Model Checkpoints | 02:20–04:30 | Adapter, commit của checkpoint và lý do tách test khỏi validation |

Tài liệu dựa trên lời giảng trong phụ đề, không xác nhận mọi chi tiết giao diện hoặc đoạn code chỉ xuất hiện trên hình. Những giá trị bị nói vấp như “21.27” được hiểu theo ngữ cảnh nhất quán là khoảng 1,27; không dùng các chuỗi lỗi đó làm số liệu chính xác.
