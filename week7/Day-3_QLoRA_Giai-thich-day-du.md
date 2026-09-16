# Day 3 — Giảng lại: Huấn luyện Llama 3.2 bằng QLoRA và theo dõi quá trình học

> **Ý chính của cả phần:** Bạn đã có một mô hình và dữ liệu mô tả sản phẩm kèm giá. Bây giờ cần tổ chức một buổi huấn luyện: quyết định mô hình được sửa phần nào, học bao nhiêu lần, mỗi lần sửa mạnh đến đâu, rồi kiểm tra xem nó có tiến bộ trên sản phẩm chưa dùng để học hay không.
>
> Tài liệu tổng hợp 5 video 011–015 thành một bài giảng liên tục, thay vì dịch từng câu. Nội dung dựa trên toàn bộ phụ đề và đối chiếu các khung hình cấu hình trong video 013–014. Các ví dụ số học, ví dụ sản phẩm và bảng chẩn đoán bên dưới là phần giải thích bổ sung, không phải kết quả thực nghiệm của giảng viên.

## 1. Rốt cuộc giảng viên muốn bạn làm được gì?

Dự án mang tên **The Price is Right**: đưa mô tả một sản phẩm vào LLM và yêu cầu nó dự đoán giá.

Ví dụ minh họa:

```text
Đầu vào: Tai nghe không dây, chống ồn, pin 30 giờ, thương hiệu X.
Đáp án trong dữ liệu: 80 USD.
Mục tiêu: Sau khi học nhiều ví dụ, mô hình ước lượng tốt hơn
         cho các sản phẩm khác mà nó chưa được huấn luyện trên đó.
```

Llama đã có khả năng xử lý ngôn ngữ, nhưng khả năng đó không đồng nghĩa với việc định giá tốt. Fine-tuning dùng các ví dụ chuyên biệt để điều chỉnh hành vi của mô hình cho nhiệm vụ này.

Trong phần này, bạn sử dụng **Llama 3.2 3B có sẵn**, giữ cố định trọng số gốc và huấn luyện phần bổ sung LoRA. Thành quả là một bộ điều chỉnh chuyên cho nhiệm vụ định giá, dùng cùng mô hình nền. Đây là ý nghĩa thực tế của cách nói “mô hình của chúng ta” trong video.

Sau 5 video, bạn cần hiểu và thực hiện được bốn việc:

1. Chọn các thiết lập cho QLoRA và quá trình học.
2. Cung cấp mô hình, dữ liệu và cấu hình cho `SFTTrainer`.
3. Bắt đầu huấn luyện, ghi lại tiến độ và lưu các mốc mô hình.
4. Phân biệt việc học tốt trên bài luyện với việc làm tốt trên dữ liệu giữ riêng.

**Giới hạn của phần này:** Video 015 dừng khi huấn luyện đang chạy. Việc phân tích đầy đủ validation loss, so sánh các lần chạy và đánh giá kết quả được hẹn sang ngày tiếp theo. Không có cơ sở từ 5 video này để khẳng định mô hình cuối cùng đã cải thiện bao nhiêu.

## 2. Mỗi video đóng vai trò gì?

| Video | Nội dung chính | Câu hỏi mà video giải quyết |
|---|---|---|
| **011 — Fine-Tuning Hyperparameters, QLoRA Settings and Training Config** | Giới thiệu các thiết lập của LoRA và huấn luyện | Tôi có những “núm điều chỉnh” nào, chúng tác động đến đâu? |
| **012 — Learning Rate, Optimizers, and Training Hyperparameters for LoRA** | Learning rate, scheduler, gradient accumulation, optimizer và 4 bước học | Mô hình sửa mình bằng cách nào, tại sao không sửa thật mạnh cho nhanh? |
| **013 — Setting Up Training Hyperparameters, qLoRA Config & Weights & Biases** | Chuyển lý thuyết thành các hằng số trong Colab; so sánh chế độ nhẹ và đầy đủ | Với tài nguyên và dữ liệu của bài học, tôi chọn cấu hình nào? |
| **014 — Setting Up Weights & Biases and the HuggingFace SFT Trainer** | Đăng nhập, nạp dữ liệu/mô hình, tạo các đối tượng cấu hình và trainer | Làm sao nối các thành phần thành một quy trình huấn luyện? |
| **015 — Running Fine-Tuning with TRL and Monitoring Training in Weights & Biases** | Chạy huấn luyện, xem GPU, số bước, loss và learning rate | Làm sao biết tiến trình đang hoạt động, và cần quan sát gì? |

Mạch bài học là: **hiểu các lựa chọn → đặt cấu hình → nối công cụ → chạy → quan sát**. Danh sách tham số dài trong notebook chính là cách ghi lại các lựa chọn đó.

## 3. Hình dung bằng một lớp học định giá

Hãy tưởng tượng bạn thuê một người đã biết đọc hiểu để học thêm nghề định giá sản phẩm.

| Trong ví dụ lớp học | Trong bài AI |
|---|---|
| Người đã biết đọc hiểu | Base model — mô hình nền Llama |
| Bài luyện có mô tả và giá đúng | Training dataset — tập huấn luyện |
| Một bộ cơ chế điều chỉnh nhỏ học thêm | LoRA adapter |
| Lịch học, số bài mỗi lượt, mức sửa sau mỗi lượt | Hyperparameters — siêu tham số |
| Làm bài, chấm lỗi, tìm cách sửa, sửa | Vòng lặp huấn luyện |
| Bộ bài kiểm tra định kỳ giữ riêng | Validation dataset — tập xác thực |
| Bài thi cuối cùng | Test dataset — tập kiểm thử |
| Người điều phối toàn bộ buổi học | SFTTrainer |
| Sổ và biểu đồ theo dõi kết quả | Weights & Biases |
| Bản lưu năng lực ở từng thời điểm | Checkpoint |

LoRA adapter không phải một cuốn sổ chứa nguyên văn các đáp án. Nó gồm các tham số số học được học từ dữ liệu, tham gia vào phép tính của mô hình.

## 4. Parameters và hyperparameters khác nhau thế nào?

**Parameters — tham số mô hình:** Những con số bên trong mô hình. Quá trình học tự điều chỉnh các tham số được cho phép cập nhật. Trong bài này, trọng tâm là tham số của LoRA.

**Hyperparameters — siêu tham số:** Những lựa chọn bên ngoài do bạn đặt, như học mấy vòng, batch lớn bao nhiêu và learning rate là bao nhiêu.

Ví dụ: người học tự thay đổi cách suy đoán giá sau khi luyện tập; còn bạn quyết định mỗi buổi họ luyện 32 bài và học hết tập dữ liệu một lần.

Tên dự án, tên lần chạy hay tần suất ghi log cũng là cấu hình trong notebook, nhưng không cùng bản chất với các siêu tham số ảnh hưởng trực tiếp tới việc học.

## 5. QLoRA: Tiết kiệm bộ nhớ bằng cách nào?

### 5.1. Tách mô hình nền và phần được học

Bài học kết hợp hai ý:

- **Quantization — lượng tử hóa:** Lưu nhiều trọng số của mô hình nền với độ chính xác thấp hơn, ở đây là 4-bit, để giảm bộ nhớ.
- **LoRA — Low-Rank Adaptation:** Thêm những ma trận nhỏ có thể huấn luyện, thay vì cập nhật toàn bộ hàng tỷ trọng số gốc.

Có thể hình dung đầu ra tại một lớp chịu tác động của cả phép tính gốc lẫn phần điều chỉnh LoRA. Khi học, phần điều chỉnh thay đổi còn trọng số nền được giữ cố định.

**4-bit không có nghĩa mọi phép tính, gradient và optimizer đều dùng 4-bit.** Notebook còn có FP16/BF16 cho tính toán và một optimizer mang tên `paged_adamw_32bit`. Đây là các thiết lập cho những thành phần khác nhau nên không mâu thuẫn.

Video ghi nhận phần mô hình nạp vào khoảng **2,2 GB**, nhưng khi huấn luyện GPU dùng gần **15 GB**. Bộ nhớ huấn luyện còn dành cho dữ liệu trung gian, gradient, trạng thái optimizer và các phần phụ trợ. Vì vậy, “nạp vừa mô hình” chưa có nghĩa “huấn luyện vừa với mọi batch size”.

### 5.2. Target modules — Gắn LoRA vào đâu?

Một Transformer gồm nhiều bộ phận. `target_modules` chọn những phép biến đổi sẽ nhận phần điều chỉnh LoRA.

Notebook dùng:

```python
ATTENTION_LAYERS = ["q_proj", "v_proj", "k_proj", "o_proj"]
MLP_LAYERS = ["gate_proj", "up_proj", "down_proj"]
```

- Bản nhẹ: chỉ nhắm vào nhóm attention.
- Bản đầy đủ: thêm nhóm MLP.

Ở mức trực giác, attention giúp kết hợp thông tin giữa các token; MLP tiếp tục biến đổi thông tin bên trong từng vị trí. Bạn chưa cần thuộc phép toán của từng lớp để hiểu bài này. Cần nhớ: **thêm vị trí gắn LoRA tạo thêm phần có thể điều chỉnh, đồng thời tốn thêm tài nguyên**.

Các tên trên thuộc kiến trúc đang dùng, không phải tên bắt buộc của mọi LLM.

### 5.3. Rank `r` — Phần điều chỉnh lớn đến đâu?

LoRA biểu diễn phần cập nhật bằng hai ma trận nhỏ. `r` quyết định kích thước trung gian của chúng.

Hãy hình dung bạn cho người học một bảng quy tắc điều chỉnh: bảng nhỏ tiết kiệm nhưng ít khả năng biểu diễn; bảng lớn linh hoạt hơn nhưng tốn bộ nhớ và công học hơn. Đây chỉ là phép ví von: rank không phải số quy tắc hay số sản phẩm được ghi nhớ.

Video chọn `r=32` cho bản nhẹ và `r=256` cho bản đầy đủ. Giảng viên nói 256 là khá lớn và trong thử nghiệm của ông chỉ cải thiện thêm ít so với rank nhỏ hơn. **Không nên suy ra rank càng lớn thì kết quả luôn càng tốt.**

### 5.4. Alpha — Mức ảnh hưởng của phần LoRA

`lora_alpha` điều khiển hệ số nhân của phần điều chỉnh. Với LoRA chuẩn, hệ số thường là **alpha/r**, không phải chỉ alpha. Ví dụ `r=32`, `alpha=64` cho hệ số 2. Biến thể rsLoRA dùng cách chuẩn hóa khác. [Tài liệu LoraConfig của PEFT](https://huggingface.co/docs/peft/en/package_reference/lora#peft.LoraConfig).

Notebook chọn `alpha = 2 × r`: 64 cho bản nhẹ, 512 cho bản đầy đủ. Đó là lựa chọn của lần chạy, không phải một quy tắc bắt buộc cho mọi bài toán.

### 5.5. Dropout — Hạn chế học phụ thuộc quá mức

Giả sử người học luôn dựa vào đúng một dấu hiệu quen thuộc. Khi gặp trường hợp mới thiếu dấu hiệu đó, họ dễ trả lời sai. Dropout tạo nhiễu có kiểm soát trong lúc học, giúp hạn chế sự phụ thuộc như vậy.

Ở cấu hình `lora_dropout=0.1`, dropout áp dụng trong nhánh LoRA khi huấn luyện. Cách nói “xóa 10% neuron” trong video là mô tả trực giác; không phải xóa vĩnh viễn 10% mô hình Llama. Khi đánh giá hoặc suy luận ở chế độ eval, dropout được tắt.

Tăng dropout không bảo đảm khái quát hóa tốt hơn. Quá nhiều nhiễu có thể khiến mô hình học không đủ tốt.

## 6. Một lần học thực sự diễn ra như thế nào?

Giảng viên lặp lại bốn bước vì đây là cơ chế đứng sau lệnh `.train()`.

| Bước | Tên tiếng Anh | Điều thực sự diễn ra |
|---|---|---|
| 1 | Forward pass — lượt tính xuôi | Mô hình tính dự đoán từ đầu vào, có sử dụng nhánh LoRA |
| 2 | Loss calculation — tính hàm mất mát | So sánh dự đoán với đáp án theo hàm loss |
| 3 | Backward pass — lan truyền ngược | Tính gradient: độ nhạy của loss đối với tham số được học |
| 4 | Optimization step — cập nhật tham số | Optimizer dùng gradient để điều chỉnh các tham số đó |

Ví dụ minh họa: mô hình có xu hướng đưa ra “60” trong khi đáp án là “80”. Quy trình học không cần bạn tự viết quy tắc “hãy cộng thêm 20”; nó dùng loss và gradient để điều chỉnh tham số qua nhiều mẫu.

**Bổ sung quan trọng:** Với huấn luyện causal language model trong bài, loss thông thường liên quan đến xác suất của token đáp án. Không được tự hiểu loss là `|60 − 80| = 20 USD`. Sai số giá là chỉ số riêng để đánh giá nhiệm vụ định giá.

Khi huấn luyện ngôn ngữ, mô hình thường được cung cấp các token đáp án trước đó để dự đoán token tiếp theo. Điều này khác với việc mỗi bước đều tự sinh trọn một câu trả lời như khi bạn chat.

## 7. Các tham số điều khiển quá trình học

### 7.1. Epoch — Học qua toàn bộ dữ liệu bao nhiêu lần?

Một epoch là một lượt qua tập huấn luyện.

- 20.000 mẫu × 1 epoch: khoảng 20.000 lượt sử dụng mẫu.
- 800.000 mẫu × 3 epochs: khoảng 2.400.000 lượt sử dụng mẫu, không phải 2.400.000 mẫu khác nhau.

Học lại vẫn có ích vì mỗi lần cập nhật chỉ điều chỉnh một phần. Thứ tự mẫu thường được xáo trộn giữa các epoch. Tuy vậy, học thêm quá lâu có thể làm mô hình bám quá sát tập luyện, gọi là **overfitting — quá khớp**.

### 7.2. Batch size — Xử lý bao nhiêu mẫu trong một lượt?

`batch_size=32` nghĩa là một lượt xử lý một nhóm 32 mẫu, thay vì lần lượt cập nhật ngay sau từng mẫu.

Batch lớn tận dụng xử lý song song, nhưng cần nhiều bộ nhớ hơn. Batch lớn hơn không luôn nhanh hơn trên mọi phần cứng và cũng không luôn đem lại mô hình tốt hơn.

Giảng viên dùng cách thử batch vừa với GPU. Hãy hiểu đó là lựa chọn thực dụng trong notebook. Batch size không bắt buộc là lũy thừa của 2; cũng không có nguyên tắc rằng batch 1 luôn chính xác nhất.

### 7.3. Gradient accumulation — Gom nhiều lượt nhỏ rồi mới cập nhật

Nếu GPU chỉ chứa được 8 mẫu một lượt, bạn có thể xử lý 4 lượt, tích lũy gradient rồi cập nhật một lần.

Với 1 GPU:

```text
Effective batch size = batch mỗi lượt × số lượt tích lũy
                     = 8 × 4 = 32 mẫu/lần cập nhật
```

Lợi ích chính là đạt batch hiệu dụng lớn hơn khi thiếu bộ nhớ. Nó không phải mẹo bảo đảm tăng tốc; xử lý nhiều lượt nhỏ có thể chậm hơn xử lý trực tiếp batch lớn vừa bộ nhớ. [Hugging Face Accelerate — Gradient accumulation](https://huggingface.co/docs/accelerate/usage_guides/gradient_accumulation).

Trong video, `gradient_accumulation_steps=1`: không gom thêm lượt; mỗi batch dẫn đến một bước cập nhật. Khi tích lũy lớn hơn 1, cần phân biệt **lượt xử lý batch nhỏ** với **optimizer step**.

### 7.4. Learning rate — Mỗi lần sửa mạnh đến đâu?

Hãy tưởng tượng bạn đang tìm điểm thấp trong một vùng đồi:

- Bước quá lớn: dễ nhảy qua vùng tốt, dao động hoặc mất ổn định.
- Bước quá nhỏ: tiến bộ rất chậm, có thể chưa học đủ trong thời gian cho phép.

Video chọn `1e-4`, tức `0.0001`. Đây là hệ số điều chỉnh cập nhật; không có nghĩa mô hình giỏi thêm 0,01% sau một bước, cũng không có nghĩa mọi trọng số cùng thay đổi đúng 0.0001.

Hình ảnh “kẹt trong thung lũng nhỏ” của video giúp hình dung, nhưng không mô tả đầy đủ bài toán tối ưu hàng triệu chiều. Learning rate lớn cũng không bảo đảm tìm được điểm tốt nhất toàn cục.

### 7.5. Warmup và cosine scheduler — Thay đổi bước sửa theo thời gian

Thay vì dùng learning rate cố định, notebook dùng:

1. **Warmup:** Bắt đầu thấp rồi tăng lên mức đặt trước.
2. **Cosine decay:** Sau đó giảm dần theo một đường cong cosine.

Trực giác: bắt đầu nhẹ để ổn định, bước mạnh hơn ở giai đoạn đầu, rồi điều chỉnh tinh hơn về sau.

`warmup_ratio=0.01` là khoảng 1% tổng số bước cập nhật. Với 625 bước của bản nhẹ, đó là khoảng 7 bước nếu làm tròn lên. Vì ghi log mỗi 5 bước, đoạn tăng đầu tiên có thể chỉ hiện qua rất ít điểm trên biểu đồ.

### 7.6. Optimizer, AdamW và weight decay

**Optimizer** là thuật toán quyết định cập nhật tham số thế nào dựa trên gradient.

- **SGD:** Cách cơ bản, đi ngược hướng gradient.
- **Adam:** Dùng thêm thông tin tích lũy từ các gradient trước để điều chỉnh bước cập nhật.
- **AdamW:** Biến thể có cách xử lý weight decay tách khỏi bước gradient.

**Weight decay** tạo xu hướng kéo các trọng số áp dụng decay về phía nhỏ hơn, hỗ trợ kiểm soát độ phức tạp. Nó không cùng cơ chế với dropout.

Notebook dùng `paged_adamw_32bit` và `weight_decay=0.001`. Bạn chỉ cần nhận ra đây là lựa chọn optimizer cụ thể; không cần học hết nội bộ AdamW mới theo được phần này.

### 7.7. Maximum sequence length — Mỗi mẫu được dài tối đa bao nhiêu token?

Notebook đặt giới hạn **128 token**, dựa trên dữ liệu đã được làm ngắn từ trước, và chừa chỗ cho token đặc biệt.

Đây là giới hạn chuỗi dùng cho buổi huấn luyện, không phải khẳng định Llama chỉ có context window 128 token. Cần kiểm tra độ dài sau tokenization, gồm prompt, completion và token đặc biệt; nếu vượt giới hạn, phần bị cắt có thể bao gồm chính đáp án.

Token cũng không tương đương một từ. Không thể dùng số từ để bảo đảm mẫu luôn nằm dưới 128 token.

## 8. Bảng cấu hình thực tế trong video

Các giá trị dưới đây được đối chiếu trên màn hình video 013, đặc biệt vùng khoảng 06:00–10:00. Đây là cấu hình của bài giảng, không phải cam kết phù hợp mọi máy hay mọi dữ liệu.

| Thiết lập | Light mode — bản nhẹ | Full mode — bản đầy đủ |
|---|---|---|
| Base model | `meta-llama/Llama-3.2-3B` | Như bản nhẹ |
| Số mẫu training theo lời giảng | 20.000 | 800.000 |
| Epochs | 1 | 3 |
| Batch size | 32 | 256 |
| Maximum sequence length | 128 | 128 |
| Gradient accumulation steps | 1 | 1 |
| Quantization | 4-bit | 4-bit |
| LoRA rank `r` | 32 | 256 |
| LoRA alpha | 64 | 512 |
| Target modules | Attention | Attention + MLP |
| LoRA dropout | 0.1 | 0.1 |
| Learning rate | `1e-4` | `1e-4` |
| Warmup ratio | 0.01 | 0.01 |
| Scheduler | `cosine` | `cosine` |
| Optimizer | `paged_adamw_32bit` | Như bản nhẹ |
| Weight decay | 0.001 | 0.001 |
| Số mẫu validation dùng định kỳ | 500 | 1.000 |
| Ghi log mỗi | 5 bước | 10 bước |
| Lưu và đánh giá định kỳ mỗi | 100 bước | 200 bước |

Trong video 014, `save_total_limit=10` giới hạn số checkpoint giữ trên ổ đĩa cục bộ. Không nên hiểu đây là giới hạn tổng số phiên bản trên Hugging Face Hub.

Video chạy bản nhẹ trên T4 và có nhánh cấu hình cho BF16 trên GPU phù hợp, như A100. Thời gian khoảng một giờ và khả năng chạy trên tài nguyên miễn phí là trải nghiệm tại thời điểm quay; tài nguyên được cấp và phiên bản thư viện có thể khác khi bạn thực hành.

## 9. Ba tập dữ liệu: Học, kiểm tra định kỳ và thi cuối

| Tập | Dùng làm gì? | Có cập nhật tham số từ nó không? |
|---|---|---|
| **Train** | Tạo loss và gradient để học | Có |
| **Validation** | Theo dõi và lựa chọn cấu hình/checkpoint | Không trong lượt đánh giá |
| **Test** | Đánh giá cuối cùng sau khi chốt lựa chọn | Không |

Ví dụ: bạn học từ bộ bài luyện, làm một đề kiểm tra định kỳ, rồi thi cuối kỳ bằng đề khác.

Validation được giữ riêng với train nhưng vẫn ảnh hưởng **gián tiếp** đến lựa chọn của người làm thí nghiệm. Vì thế, cần test riêng để tránh kết luận quá lạc quan sau nhiều lần thử cấu hình.

Notebook lấy 500 hoặc 1.000 mẫu validation để mỗi lần kiểm tra không mất quá lâu. **Bổ sung:** nếu tự xây dựng dữ liệu, nên dùng một tập con cố định và đủ đại diện. Lấy các dòng đầu có thể lệch nếu dữ liệu đã được sắp theo loại sản phẩm hay giá.

Ngay cả khi chỉ học một epoch, validation vẫn hữu ích: bạn đo đi đo lại trên cùng bộ dữ liệu, trong khi các batch train liên tục thay đổi độ khó.

## 10. Các công cụ đang làm việc gì?

| Thành phần | Vai trò trong bài |
|---|---|
| **Colab/GPU** | Nơi thực hiện tính toán huấn luyện |
| **Hugging Face Hub** | Nguồn tải mô hình/dữ liệu và nơi lưu kết quả |
| **Transformers** | Công cụ nạp và làm việc với mô hình Transformer |
| **bitsandbytes** | Hỗ trợ lượng tử hóa và optimizer được dùng |
| **PEFT** | Cấu hình, gắn và quản lý LoRA |
| **TRL** | Thư viện có `SFTTrainer` để tổ chức fine-tuning |
| **Weights & Biases, viết tắt W&B; thư viện `wandb`** | Ghi cấu hình, số liệu và biểu đồ cho từng lần chạy |

TRL có tên gắn với reinforcement learning, nhưng trong bài này bạn đang làm **SFT — Supervised Fine-Tuning, tinh chỉnh có giám sát**, từ ví dụ có đáp án. Tên thư viện không biến buổi huấn luyện này thành học tăng cường.

W&B không thay GPU huấn luyện mô hình. Nó giống bảng theo dõi: nhận số liệu và giúp bạn quan sát, so sánh các thí nghiệm.

## 11. Đọc notebook theo mục đích, thay vì thuộc từng dòng

### Bước A — Đặt tên và lựa chọn chế độ

`HF_USER` là tài khoản nhận kết quả mô hình; `DATA_USER` là tài khoản chứa dataset. Hai giá trị không bắt buộc giống nhau.

Tên project là `price`. Tên run dùng thời gian, thêm hậu tố `lite` khi chạy bản nhẹ. Mục đích là tránh nhầm các lần chạy trên W&B và Hugging Face.

### Bước B — Đăng nhập và nạp dữ liệu

Notebook lấy token từ Colab Secrets, đăng nhập Hugging Face và W&B, rồi tải dữ liệu có các split train/validation/test. Trong buổi này chỉ train và validation tham gia quá trình huấn luyện/theo dõi.

Nên để khóa trong Secrets hoặc biến môi trường, không ghi thẳng vào notebook chia sẻ. Nếu không dùng W&B, notebook có lựa chọn tắt ghi log đến nền tảng đó.

### Bước C — Nạp tokenizer và mô hình lượng tử hóa

Tokenizer chuyển văn bản thành token ID; base model thực hiện phép tính trên chúng. Đây là bước chuẩn bị mô hình trước khi gắn cấu hình huấn luyện.

### Bước D — Tạo hai loại cấu hình

- `LoraConfig`: **Phần nào được điều chỉnh và phần LoRA có hình dạng ra sao?** Chứa rank, alpha, dropout, target modules.
- `SFTConfig`: **Tổ chức buổi học thế nào?** Chứa epochs, batch size, learning rate, optimizer, lịch log/lưu/đánh giá và các lựa chọn liên quan.

### Bước E — Tạo SFTTrainer

Đưa cho trainer mô hình, dữ liệu, tokenizer và hai nhóm cấu hình. Trainer chuẩn bị dữ liệu và điều phối vòng lặp học.

Đoạn dưới là sơ đồ mã minh họa vai trò, không phải notebook hoàn chỉnh đã kiểm thử:

```python
trainer = SFTTrainer(
    model=base_model,
    train_dataset=train_data,
    eval_dataset=validation_data,
    peft_config=lora_config,
    args=training_config,
    processing_class=tokenizer,
)

trainer.train()
```

Các biến cần được chuẩn bị trước. Tên trường cấu hình và hành vi của thư viện có thể thay đổi theo phiên bản; nên bám phiên bản notebook khi thực hành. Tham số `processing_class` được mô tả trong [tài liệu SFTTrainer](https://huggingface.co/docs/trl/en/sft_trainer).

### Prompt và completion giúp trainer hiểu gì?

Ví dụ dữ liệu minh họa:

```json
{
  "prompt": "Estimate the price of this wireless headset. Price: $",
  "completion": "80"
}
```

Prompt là ngữ cảnh đầu vào; completion là phần đáp án muốn mô hình học tiếp nối. Với dữ liệu prompt-completion, TRL hỗ trợ tính loss chỉ trên completion; prompt vẫn là ngữ cảnh mà mô hình sử dụng. Nên kiểm tra `completion_only_loss` và định dạng dữ liệu trong phiên bản dùng thực tế. SFTTrainer cũng hỗ trợ định dạng khác, không chỉ hai cột này. [Tài liệu TRL về completion-only training](https://huggingface.co/docs/trl/en/sft_trainer#train-on-completion-only).

Trong video, trainer thêm EOS. **EOS là End of Sequence — kết thúc chuỗi**, giúp mô hình học điểm dừng. Nó không đơn thuần là dấu chấm hết một câu, dù phụ đề diễn đạt như vậy.

## 12. Khi bấm train, những con số trên màn hình có nghĩa gì?

### 12.1. Vì sao bản nhẹ có 625 bước?

Với đúng cấu hình video: 20.000 mẫu, batch 32, 1 GPU, tích lũy 1, 1 epoch:

```text
20.000 / 32 = 625 bước cập nhật
```

Ở cấu hình này, cứ 5 bước ghi một điểm log. Các mốc lưu/đánh giá định kỳ là 100, 200, 300, 400, 500 và 600; sau khi học xong notebook còn đẩy kết quả cuối lên Hub.

Nếu đổi batch, số epoch hoặc tích lũy gradient, số bước thay đổi. Ví dụ batch 8 và tích lũy 4 tạo 2.500 lượt xử lý nhỏ nhưng vẫn 625 bước cập nhật trong trường hợp chia hết này.

### 12.2. Đọc training loss

Training loss phản ánh mức lỗi của mục tiêu huấn luyện trên dữ liệu học. Mong đợi xu hướng giảm, nhưng từng điểm có thể lên xuống do batch khác nhau.

Không nên kết luận từ vài điểm đầu hoặc mong đường giảm đều. Trong video 015, biểu đồ còn ở giai đoạn đầu.

### 12.3. Đọc validation loss

Validation loss kiểm tra cùng mục tiêu loss trên dữ liệu không dùng cập nhật tham số. Đây là tín hiệu để xem việc học có chuyển sang dữ liệu giữ riêng hay không.

| Quan sát qua nhiều lần đo | Cách hiểu có thể phù hợp |
|---|---|
| Train giảm, validation giảm | Có dấu hiệu tiến bộ trên cả hai tập |
| Train giảm, validation tăng kéo dài | Có thể đang quá khớp; cần kiểm tra |
| Cả hai gần như không cải thiện | Có thể học quá chậm, dữ liệu/cấu hình chưa phù hợp |
| Loss thành NaN hoặc tăng đột biến bất thường | Cần kiểm tra tính ổn định số, dữ liệu và cấu hình |

Các tình huống này là hướng chẩn đoán, không phải kết luận chắc chắn từ một điểm dữ liệu.

Trong video, validation chưa hiện ngay vì phải đến mốc đánh giá đầu tiên. **Chưa có biểu đồ validation trước bước 100 không có nghĩa chương trình bị lỗi.**

### 12.4. Đọc learning rate và bộ nhớ GPU

Biểu đồ learning rate giúp xác nhận warmup và scheduler hoạt động: tăng ở đầu rồi giảm dần. Nó mô tả lịch học, không đo độ thông minh của mô hình.

Bộ nhớ GPU giúp kiểm tra cấu hình có vừa không. Nếu gặp OOM — hết bộ nhớ — hãy giảm batch size trước. Nếu phải giảm độ dài chuỗi, cần kiểm tra để tránh cắt mất completion.

Giảng viên bỏ qua một số warning cụ thể trong lần chạy. Không nên biến điều đó thành quy tắc bỏ qua mọi warning: thông báo về cắt dữ liệu, mất nhãn hay cấu hình không được hỗ trợ có thể ảnh hưởng trực tiếp kết quả.

## 13. Loss giảm có đồng nghĩa giá dự đoán chính xác hơn không?

**Chưa đủ để kết luận.** Mục tiêu học là token; mục tiêu ứng dụng là giá.

Ví dụ bổ sung:

| Giá thật | Giá mô hình sinh ra | Sai số tuyệt đối |
|---|---|---|
| 80 USD | 75 USD | 5 USD |
| 200 USD | 230 USD | 30 USD |
| 20 USD | 25 USD | 5 USD |

Sai số tuyệt đối trung bình trong ví dụ là `(5 + 30 + 5) / 3 ≈ 13,33 USD`. Đây là một cách đo trực tiếp nhiệm vụ, khác với token loss.

Chỉ số token accuracy, nếu xuất hiện, cũng không phải tỷ lệ sản phẩm được định giá đúng và không đơn giản bằng `1 − loss`.

Để kết luận fine-tuning có ích, cần so sánh base model và mô hình đã tinh chỉnh trên cùng tập test, cùng prompt, cách sinh đáp án, cách đọc giá và thước đo. Phần video hiện tại chưa trình bày kết quả cuối này.

## 14. Checkpoint, lưu kết quả và chọn mô hình tốt

Checkpoint là bản chụp trạng thái ở một mốc huấn luyện. Lưu định kỳ giúp giữ lại các ứng viên và có thể hỗ trợ tiếp tục một phiên bị ngắt.

Ví dụ **giả định**, không phải số liệu video:

| Checkpoint | Training loss | Validation loss |
|---|---|---|
| Bước 100 | 1,20 | 1,30 |
| Bước 200 | 0,95 | 1,08 |
| Bước 300 | 0,80 | 1,15 |

Nếu mục tiêu chọn theo validation loss, bước 200 đáng cân nhắc hơn bước 300 dù bước 300 có training loss thấp hơn.

Phân biệt ba việc:

- **Lưu checkpoint:** giữ lại một mốc.
- **Chọn checkpoint tốt nhất:** chọn mốc theo tiêu chí đã đặt.
- **Early stopping:** chủ động dừng khi tiêu chí không còn cải thiện theo quy tắc định trước.

Giảng viên dùng “early stopping” theo nghĩa khá rộng khi nói xem lại và chọn mốc tốt. Có lưu định kỳ không đồng nghĩa notebook đã cấu hình tự động dừng sớm.

Với PEFT/LoRA, kết quả lưu thường là adapter và cấu hình liên quan; để dùng lại cần đúng mô hình nền. Bản adapter để suy luận cũng không nhất thiết chứa đủ trạng thái optimizer/scheduler để tiếp tục chính xác một phiên học. [Hugging Face — PEFT checkpoint format](https://huggingface.co/docs/peft/en/developer_guides/checkpoint).

Lệnh đẩy kết quả cuối lên Hub giúp tránh mất thành quả sau khi runtime kết thúc, nhưng chỉ thực hiện được nếu chương trình đi tới lệnh đó và việc lưu thành công. Checkpoint định kỳ vẫn có giá trị khi phiên chạy bị ngắt sớm.

## 15. Những điều cần hiểu chính xác hơn lời nói giản lược trong video

| Cách nói dễ gây hiểu nhầm | Cách ghi nhớ chính xác hơn |
|---|---|
| Alpha luôn bằng hai lần rank | Đây là lựa chọn của notebook; có thể thử giá trị khác |
| Lượng tử hóa chắc chắn làm kết quả kém đi | Có sai số biểu diễn; ảnh hưởng lên chất lượng phải đo thực tế |
| Dropout xóa neuron | Tạo mask tạm thời khi học; ở đây thuộc nhánh LoRA |
| Dropout càng cao càng tốt | Quá cao có thể cản trở học |
| Batch lớn hơn luôn nhanh hơn | Phải xét phần cứng, độ dài chuỗi và hiệu suất thực tế |
| Gradient accumulation dùng để tăng tốc | Chủ yếu hữu ích để đạt batch hiệu dụng khi bộ nhớ hạn chế |
| EOS là kết thúc câu | EOS là kết thúc chuỗi |
| Training loss giảm tức mỗi sản phẩm đều dự đoán tốt hơn | Đây là số tổng hợp; từng mẫu có thể vẫn sai hoặc tệ hơn |
| Lưu mô hình đồng nghĩa có early stopping | Lưu, chọn mốc tốt và tự dừng là ba việc khác nhau |
| Train xong là chứng minh thành công | Cần đánh giá tác vụ trên dữ liệu giữ riêng và so với baseline |

## 16. Tự kiểm tra xem bạn đã hiểu bài chưa

**1. Phần nào được cập nhật trong buổi huấn luyện này?**  
Các tham số LoRA; mô hình nền lượng tử hóa được giữ cố định.

**2. Tại sao có dữ liệu train rồi còn cần validation?**  
Để đo định kỳ trên bộ dữ liệu cố định không dùng cập nhật trọng số, hỗ trợ phát hiện quá khớp và chọn cấu hình.

**3. GPU chỉ vừa batch 8, nhưng muốn batch hiệu dụng 32 trên một GPU thì sao?**  
Có thể dùng tích lũy gradient 4 lượt rồi cập nhật một lần.

**4. W&B có huấn luyện thay Colab không?**  
Không. W&B ghi nhận và hiển thị thông tin; tính toán học diễn ra trên môi trường chạy mô hình.

**5. Điểm loss thấp nhất trên train có nhất thiết là mô hình nên dùng không?**  
Không. Cần xem validation và đánh giá khả năng giải quyết nhiệm vụ thực tế.

**6. Đầu ra học được của phần này là gì?**  
Một quá trình QLoRA được cấu hình, khởi chạy, theo dõi và lưu lại; kết quả định giá cuối cùng còn cần đánh giá.

## 17. Nguồn và phạm vi đối chiếu

Nguồn chính là video và phụ đề bạn cung cấp:

1. `011 Day 3 - Fine-Tuning Hyperparameters QLoRA Settings and Training Config`.
2. `012 Day 3 - Learning Rate, Optimizers, and Training Hyperparameters for LoRA`.
3. `013 Day 3 - Setting Up Training Hyperparameters, qLoRA Config & Weights & Biases`.
4. `014 Day 3 - Setting Up Weights & Biases and the HuggingFace SFT Trainer`.
5. `015 Day 3 - Running Fine-Tuning with TRL and Monitoring Training in Weights & Biases`.

Các liên kết tài liệu chính thức đặt tại phần bổ sung tương ứng để làm rõ hành vi thư viện. Tài liệu này giảng lại nội dung và giải thích cơ chế; không tuyên bố đã chạy lại notebook, huấn luyện mô hình hoặc tái lập kết quả của giảng viên.
