# Day 1 — Hiểu LoRA và QLoRA để fine-tuning mô hình AI

> Bản đầy đủ, giảng lại nội dung 6 video 001–006 bằng tiếng Việt. Nguồn chính: toàn bộ 6 phụ đề SRT bạn cung cấp. Đây là bài giảng được tổ chức lại theo mạch kiến thức, không phải bản dịch từng câu. Ví dụ minh họa và phần làm rõ kỹ thuật được bổ sung để dễ hiểu; các con số thực nghiệm được ghi rõ là của video.

## 1. Cả phần này muốn dạy bạn làm gì?

**Mục tiêu: hiểu cách huấn luyện bổ sung một mô hình có sẵn cho công việc cụ thể, trong điều kiện GPU có bộ nhớ hạn chế.**

Bài toán xuyên suốt khóa học là **The Price Is Right — dự đoán giá sản phẩm từ mô tả**. Ví dụ tự đặt:

- Đầu vào: “Tai nghe không dây, chống ồn, pin 30 giờ, thuộc phân khúc phổ thông”.
- Đầu ra mong muốn: một mức giá phù hợp với dữ liệu sản phẩm đã thu thập.
- Dữ liệu học: nhiều cặp **mô tả sản phẩm + giá thực tế**.

Mô hình nền đã biết ngôn ngữ, nhưng chưa chắc dự đoán tốt giá trong bộ dữ liệu này. Giảng viên muốn thử dùng dữ liệu chuyên biệt để cải thiện khả năng đó, rồi so sánh với các phương pháp đã thử trước.

**Câu hỏi thực nghiệm là:** một mô hình nhỏ được tinh chỉnh cho nhiệm vụ hẹp có thể đạt kết quả gần mô hình lớn ở nhiệm vụ đó không? Đây là mục tiêu cần kiểm chứng, chưa phải kết luận rằng mô hình nhỏ sẽ thắng.

| Video | Nội dung chính | Vì sao phải học phần này? |
|---|---|---|
| 001 — Introduction to QLoRA | Đặt bài toán và giới thiệu kế hoạch tuần | Hiểu chúng ta đang cải thiện một mô hình có sẵn, không xây ChatGPT từ đầu |
| 002 — LoRA Training | Đóng băng mô hình nền, thêm hai ma trận nhỏ A/B | Hiểu vì sao có thể học thêm mà không cập nhật hàng tỷ trọng số |
| 003 — Hyperparameters and Quantization | `r`, `alpha`, `target_modules`, 8-bit và 4-bit | Hiểu những lựa chọn kiểm soát khả năng học và bộ nhớ |
| 004 — Colab and Architecture | Chuẩn bị môi trường, đọc cấu trúc LLaMA | Nhận diện nơi adapter được gắn vào |
| 005 — Loading Quantized Models | So sánh bộ nhớ, nạp adapter đã huấn luyện | Nhìn thấy tác dụng thực tế của LoRA và lượng tử hóa |
| 006 — Parameter Calculations | Tính số tham số và đối chiếu file trên Hugging Face | Hiểu chính xác “thứ được huấn luyện và lưu lại” là gì |

**Giới hạn của Day 1:** chủ yếu học cơ chế và quan sát mô hình. Giảng viên nạp một adapter đã huấn luyện để minh họa. Chuẩn bị dữ liệu, đo baseline, huấn luyện và đánh giá đầy đủ nằm ở những ngày tiếp theo.

## 2. Những từ cần hiểu trước

| Thuật ngữ | Hiểu đơn giản trong bài này |
|---|---|
| Model — mô hình | Hệ thống tính toán dùng các trọng số đã học để xử lý đầu vào |
| Pretrained/base model — mô hình nền | Mô hình đã được huấn luyện trước, được dùng làm điểm xuất phát |
| Parameter/weight — tham số/trọng số | Những con số bên trong mô hình quyết định cách nó xử lý thông tin |
| Fine-tuning — tinh chỉnh | Huấn luyện tiếp mô hình có sẵn với dữ liệu phù hợp nhiệm vụ |
| Inference — suy luận | Dùng mô hình để tạo kết quả; không cập nhật trọng số |
| GPU VRAM | Bộ nhớ trên GPU, chứa trọng số và dữ liệu tính toán |
| Adapter — bộ điều chỉnh | Phần tham số bổ sung làm thay đổi hành vi mô hình nền |
| Hyperparameter — siêu tham số | Cấu hình người làm thí nghiệm chọn, như kích thước adapter |
| Baseline/evaluation | Kết quả ban đầu và cách đo để biết thay đổi có thực sự tốt hơn |

Hình dung mô hình như một bàn điều khiển có hàng tỷ núm chỉnh. Pretraining đã chỉnh chúng để mô hình biết xử lý ngôn ngữ. Fine-tuning tiếp tục điều chỉnh hệ thống cho một công việc cụ thể.

Với ví dụ định giá, **học thêm về định giá không đồng nghĩa giỏi hơn mọi mặt**. Khả năng trò chuyện, lập trình hoặc suy luận tổng quát không tự động tăng theo.

## 3. Vì sao không cập nhật luôn toàn bộ mô hình?

LLaMA 3.2 bản 3B trong video có khoảng 3 tỷ tham số. “B” nghĩa là billion — tỷ, không phải số GB.

Nếu biểu diễn mỗi tham số bằng FP32, tức 32 bit = 4 byte, thì phép ước tính đơn giản là:

```text
3.000.000.000 tham số × 4 byte ≈ 12 GB trọng số
```

Tên 3B là số làm tròn; phép đo trong video khoảng **12,9 GB**. Tuy nhiên, đây không phải dung lượng cố định của mọi cách nạp LLaMA 3.2: kiểu dữ liệu ảnh hưởng trực tiếp đến bộ nhớ.

Huấn luyện còn cần chỗ cho kết quả trung gian, gradient và trạng thái optimizer. Vì vậy, **nạp vừa mô hình vào GPU chưa có nghĩa là huấn luyện vừa**.

Full fine-tuning cập nhật toàn bộ trọng số. Với GPU T4 của bài học, việc này khó hơn nhiều so với chỉ nạp mô hình. Câu nói trong video rằng không thể làm trên một GPU nên hiểu theo phần cứng và thiết lập của bài, không phải giới hạn tuyệt đối của mọi GPU.

LoRA giải quyết phần “quá nhiều tham số cần cập nhật”. Quantization giải quyết phần “trọng số nền chiếm quá nhiều bộ nhớ”.

## 4. LoRA — học một phần điều chỉnh nhỏ

### 4.1. Giữ nguyên mô hình nền, học phần bổ sung

LoRA là **Low-Rank Adaptation — thích nghi bằng cập nhật hạng thấp**.

Hãy tưởng tượng bạn có một chuyên viên đã hiểu ngôn ngữ và có kiến thức chung. Bạn muốn họ định giá sản phẩm tốt hơn. LoRA giống như bổ sung một bộ kỹ năng chuyên biệt thay vì đào tạo lại toàn bộ kiến thức của người đó.

Đây chỉ là ví dụ để hình dung: adapter thực tế là các con số học được, không phải tờ hướng dẫn bằng chữ hoặc prompt ẩn.

Quy trình trong video:

1. Nạp mô hình nền.
2. **Đóng băng** trọng số nền: không cập nhật chúng bằng optimizer.
3. Chọn các lớp sẽ gắn adapter, gọi là `target_modules`.
4. Thêm các ma trận nhỏ có thể học.
5. Dùng dữ liệu để huấn luyện những ma trận nhỏ này.

“Đóng băng” không có nghĩa bỏ mô hình nền ra khỏi phép tính. Đầu vào vẫn đi qua mô hình; quá trình lan truyền ngược vẫn phải tính qua các phép toán cần thiết để học adapter.

### 4.2. Vì sao phải có hai ma trận A và B?

Ma trận có thể hiểu là một bảng số. Một lớp lớn có bảng trọng số `W`. Không thể cộng một bảng nhỏ tùy ý vào một bảng lớn vì kích thước không khớp.

LoRA dùng hai bảng nhỏ A và B. Tích của chúng có đúng kích thước của W, nên tạo được một phần điều chỉnh phù hợp.

Ví dụ một lớp nhận 3.072 số và trả về 3.072 số; chọn `r = 32`:

| Thành phần | Kích thước ma trận theo quy ước đầu ra × đầu vào | Số tham số |
|---|---:|---:|
| Trọng số nền W | 3.072 × 3.072 | 9.437.184 |
| A | 32 × 3.072 | 98.304 |
| B | 3.072 × 32 | 98.304 |
| A và B cộng lại | — | 196.608 |

Ở lớp này, số tham số adapter ít hơn W **48 lần**, nhưng vẫn có thể ảnh hưởng toàn bộ đầu ra của lớp.

Công thức để đọc hiểu, không cần học thuộc:

```text
Đầu ra = W × x + s × B × (A × x)
```

`x` là đầu vào; `s` là hệ số nhân phần điều chỉnh. Cách tính này cũng giải thích vì sao không cần dựng một ma trận điều chỉnh khổng lồ ở mỗi lượt chạy.

**Làm rõ kỹ thuật:** với LoRA thông thường trong PEFT, `s = alpha / r`, không chỉ là `alpha`. Với `r = 32`, `alpha = 64`, hệ số này bằng 2. Có biến thể dùng quy tắc khác. [Tài liệu LoRA của Hugging Face](https://huggingface.co/docs/peft/en/package_reference/lora).

Điều phải nhớ: **mô hình nền giữ nguyên; A và B học cách bổ sung một thay đổi có cấu trúc**. Vì bị giới hạn bởi hạng thấp, thay đổi đó không linh hoạt tùy ý như cập nhật độc lập mọi trọng số.

### 4.3. Một lượt huấn luyện diễn ra ra sao?

Vẫn là bốn bước giảng viên nhắc tới:

1. **Forward pass:** cho ví dụ đi qua mô hình nền và adapter.
2. **Loss:** đo mức lệch giữa dự đoán và mục tiêu huấn luyện.
3. **Backward pass:** tính hướng thay đổi giúp giảm loss.
4. **Optimizer step:** cập nhật các tham số được phép học, ở đây là adapter.

Bổ sung để tránh nhầm: nếu huấn luyện mô hình sinh chuỗi giá, loss thường liên quan đến dự đoán token. Khi đánh giá kinh doanh, ta có thể đo sai số tiền. Hai phép đo này không nhất thiết là một. Sáu video này chưa trình bày đủ thiết lập loss để kết luận chính xác cách huấn luyện của các ngày sau.

## 5. Quantization — lượng tử hóa để giảm bộ nhớ

### 5.1. Giảm độ chi tiết của con số, giữ cấu trúc mô hình

Ví dụ của giảng viên là núm chỉnh độ sáng:

- Núm rất mịn cho phép nhiều mức điều chỉnh.
- Núm 8-bit biểu diễn 256 mã.
- Núm 4-bit biểu diễn 16 mã.

Mô hình vẫn có các trọng số và các lớp tương ứng, nhưng lưu trọng số với độ chính xác thấp hơn. **3B ở 4-bit vẫn là mô hình khoảng 3 tỷ tham số**, không biến thành mô hình chỉ còn một phần tư số lớp.

Phép tính lý tưởng nếu mọi trọng số cùng dùng một độ rộng bit:

| Độ rộng lưu trữ | Byte/tham số | Với đúng 3 tỷ tham số |
|---|---:|---:|
| 32-bit | 4 | 12 GB |
| 16-bit | 2 | 6 GB |
| 8-bit | 1 | 3 GB |
| 4-bit | 0,5 | 1,5 GB |

Từ 32 xuống 4 bit là còn **1/8** dung lượng trọng số lý tưởng; từ 16 xuống 4 bit mới là **1/4**. Con số thực tế lớn hơn mức lý tưởng vì có thành phần không lượng tử hóa và dữ liệu phụ trợ.

Đổi lại, lượng tử hóa tạo sai số biểu diễn. Ảnh hưởng đến chất lượng phụ thuộc mô hình, phương pháp và nhiệm vụ; không thể bảo đảm luôn chỉ giảm rất ít.

### 5.2. 4-bit có phải chỉ còn các số nguyên từ 0 đến 15?

Không nên hiểu rằng mọi trọng số bị thay trực tiếp thành 0, 1, 2…15. Các mã 4-bit được ánh xạ sang giá trị đại diện và kết hợp với thông tin tỷ lệ.

Trong cấu hình bài học, **NF4 — NormalFloat 4-bit** chọn cách biểu diễn phù hợp với trọng số có phân bố gần chuẩn. **Double quantization** lượng tử hóa thêm các hằng số dùng cho lượng tử hóa, giúp giảm phần bộ nhớ phụ trợ; không đơn giản là làm tròn tất cả trọng số hai lần. [Nghiên cứu QLoRA](https://arxiv.org/abs/2305.14314).

### 5.3. Ghép lại thành QLoRA

```text
QLoRA = mô hình nền được lượng tử hóa, đóng băng
      + adapter LoRA được huấn luyện
```

**Q làm nền nhẹ hơn; LoRA làm phần cần học nhỏ hơn.**

Trong ví dụ của giảng viên, nền dùng 4-bit và các adapter dùng FP32. Không nên suy ra mọi adapter LoRA đều bắt buộc FP32: kiểu dữ liệu còn tùy thiết lập.

Cũng cần phân biệt **kiểu lưu trọng số** với **kiểu tính toán**. Lưu nền ở 4-bit không có nghĩa mọi phép tính, activation và gradient đều dùng 4-bit.

Chỉ nạp mô hình 4-bit rồi hỏi đáp là inference với mô hình lượng tử hóa. Để có fine-tuning QLoRA, còn phải gắn adapter có thể học và chạy huấn luyện.

## 6. Ba cấu hình quan trọng: r, alpha, target_modules

| Cấu hình | Câu hỏi nó trả lời | Ảnh hưởng |
|---|---|---|
| `r` — rank | Phần adapter có kích thước trung gian bao nhiêu? | Tăng r làm tăng số tham số và khả năng biểu diễn của phần điều chỉnh |
| `lora_alpha` | Phần điều chỉnh được nhân với hệ số nào? | Tác động đến độ lớn đóng góp của adapter; cần đọc cùng r và quy tắc scaling |
| `target_modules` | Gắn adapter vào các lớp nào? | Nhiều lớp hơn thường có thêm tham số và chi phí |

Trong video, giảng viên dùng các giá trị r như 8, 16, 32 và chọn `alpha = 2 × r` làm điểm xuất phát. Đây là lựa chọn thử nghiệm, không phải công thức bảo đảm tối ưu. r cũng không bắt buộc là lũy thừa của 2.

Cấu hình nhẹ của bài gắn vào `q_proj`, `k_proj`, `v_proj`, `o_proj` trong attention. Cấu hình nặng mở rộng sang `gate_proj`, `up_proj`, `down_proj` trong MLP.

Đây là các **lớp chiếu tuyến tính**, không phải mỗi tên tương ứng với một attention head độc lập. “Bắt đầu với attention” là cách đi của bài học; không phải quy định duy nhất của QLoRA.

Cách lựa chọn có ý nghĩa: giữ dữ liệu và cách đánh giá ổn định, thử một cấu hình, đo trên validation, rồi điều chỉnh. Dữ liệu nhiều hơn hoặc r lớn hơn không tự chứng minh kết quả tốt hơn.

## 7. Đọc cấu trúc LLaMA mà không bị ngợp

Giảng viên in kiến trúc để bạn biết adapter nằm ở đâu. Bạn chưa cần tự viết Transformer.

| Thành phần | Vai trò để hình dung |
|---|---|
| Tokenizer | Chuyển văn bản thành các token ID |
| Embedding | Tra mỗi ID thành một vector số |
| 28 decoder blocks | Liên tiếp xử lý và cập nhật biểu diễn của các token |
| Self-attention | Kết hợp thông tin giữa các vị trí theo mức liên quan |
| MLP | Biến đổi đặc trưng tại từng vị trí |
| Normalization | Chuẩn hóa giúp quá trình tính toán ổn định |
| LM head | Tạo điểm số cho các token có thể xuất hiện tiếp theo |

Ví dụ tự đặt: trong “Tai nghe này có chống ồn”, attention giúp mô hình kết hợp đặc điểm “chống ồn” với sản phẩm đang được mô tả. MLP tiếp tục biến đổi biểu diễn số đó. Đây là trực giác, không phải khẳng định mỗi lớp có một nhiệm vụ ngôn ngữ cố định.

Các kích thước được dùng để tính toán trong bài:

- Vocabulary: **128.256** token.
- Hidden size: **3.072** số trong biểu diễn nội bộ của mỗi vị trí.
- Số decoder blocks: **28**.
- Attention: q/o có kích thước đầu vào–đầu ra 3.072 → 3.072; k/v là 3.072 → 1.024.
- MLP: gate/up là 3.072 → 8.192; down là 8.192 → 3.072.

**128.256 là số mục trong từ vựng, không phải số token của câu đầu vào, cũng không phải context window.**

Hai điểm giảng viên giải thích theo cách giản lược:

- Embedding có thể mô tả bằng nhân one-hot với bảng embedding, nhưng triển khai thường tra trực tiếp bằng token ID; không cần tạo vector one-hot khổng lồ cho từng token.
- LM head tạo **logits — điểm số chưa chuẩn hóa**. Sau softmax mới có phân bố xác suất token tiếp theo.

Tên hàm kích hoạt trong kiến trúc LLaMA này là **SiLU**; phụ đề ghi thành “Selu” dễ gây nhầm sang một hàm khác.

## 8. Hiểu phần thực hành Colab: mỗi thao tác để làm gì?

| Thao tác trong video | Mục đích |
|---|---|
| Chọn runtime có GPU T4 | Có GPU để nạp và xử lý mô hình trong thí nghiệm |
| Cài/import thư viện | `transformers` nạp mô hình, `bitsandbytes` hỗ trợ lượng tử hóa, `peft` xử lý adapter |
| Cấp quyền Hugging Face token trong Colab Secrets | Xác thực khi truy cập tài nguyên cần quyền |
| Chọn base model và quyền truy cập LLaMA | Xác định mô hình nền thực sự sẽ dùng |
| Nạp mô hình và in memory footprint | Đo bộ nhớ theo cách nạp đang thử |
| `print(model)` | Xem cấu trúc lớp, kiểu lớp và adapter |
| Restart rồi chạy lại các bước chuẩn bị | Giải phóng mô hình cũ, tránh giữ nhiều phiên bản đồng thời |
| Nạp adapter của giảng viên | Xem trước kết quả cấu trúc sau fine-tuning |

T4 là môi trường mà giảng viên sử dụng, không phải điều kiện duy nhất của kỹ thuật. Nhận xét “miễn phí” phản ánh bối cảnh video, không phải cam kết về khả năng cấp GPU trong mọi phiên Colab.

Cấu hình lượng tử hóa cần đọc hiểu:

| Tên cấu hình | Ý nghĩa |
|---|---|
| `load_in_8bit=True` | Nạp các lớp được hỗ trợ theo đường lượng tử hóa 8-bit |
| `load_in_4bit=True` | Dùng đường lượng tử hóa 4-bit |
| `bnb_4bit_quant_type="nf4"` | Chọn NF4 |
| `bnb_4bit_use_double_quant=True` | Giảm thêm dung lượng của thông tin lượng tử hóa |
| `bnb_4bit_compute_dtype` | Chọn kiểu dữ liệu cho phép tính, khác với 4-bit lưu trữ |

Các tên cấu hình được đối chiếu với [tài liệu bitsandbytes trong Transformers](https://huggingface.co/docs/transformers/en/quantization/bitsandbytes). Không nên chọn BF16 chỉ vì video nhắc đến nó; cần chọn theo khả năng GPU. Với T4, FP16 là lựa chọn phù hợp hơn cho đường tính toán này.

Nếu gặp “CUDA required but not available”, hãy kiểm tra runtime có GPU và PyTorch có nhận CUDA không. Khởi động lại runtime rồi chạy từ đầu có thể giúp, nhưng lỗi này cũng có thể liên quan môi trường hoặc phiên bản thư viện; không đủ bằng chứng để luôn kết luận Google đã đổi GPU.

Tài liệu này giải thích thao tác, không cung cấp notebook huấn luyện hoàn chỉnh. Các file đính kèm không chứa notebook gốc để kiểm thử trực tiếp.

## 9. Các số 12,9 GB, 2,2 GB và 73 MB thực sự chỉ điều gì?

### 9.1. Kết quả nạp mô hình trong video

| Phiên bản | Memory footprint được giảng viên báo |
|---|---:|
| Bản độ chính xác cao trong lần nạp đầu | Khoảng 12,9 GB |
| Bản lượng tử hóa 8-bit | Khoảng 3,6 GB |
| Bản lượng tử hóa 4-bit | Khoảng 2,2 GB |
| Nền 4-bit + adapter nhẹ | Khoảng 2,27 GB |

Các con số này minh họa mức giảm trong thí nghiệm, không phải yêu cầu VRAM huấn luyện hay dung lượng luôn giống nhau ở mọi phiên bản thư viện.

**73 MB chỉ là trọng số adapter nhẹ**, chưa gồm mô hình nền, activation, gradient và optimizer. Vì vậy không thể nói “huấn luyện mô hình này chỉ cần GPU 73 MB”.

### 9.2. Tính adapter nhẹ: r = 32, chỉ attention

Với lớp có `d_in` đầu vào và `d_out` đầu ra:

```text
Số tham số LoRA = r × d_in + d_out × r
                = r × (d_in + d_out)
```

Áp dụng vào một decoder block:

| Lớp | Phép tính | Số tham số adapter |
|---|---:|---:|
| q_proj | 32 × (3.072 + 3.072) | 196.608 |
| k_proj | 32 × (3.072 + 1.024) | 131.072 |
| v_proj | 32 × (3.072 + 1.024) | 131.072 |
| o_proj | 32 × (3.072 + 3.072) | 196.608 |
| Tổng/block | — | 655.360 |

Có 28 blocks:

```text
655.360 × 28 = 18.350.080 tham số
18.350.080 × 4 byte FP32 = 73.400.320 byte ≈ 73,4 MB
```

Tức khoảng 18,35 triệu tham số có thể học, tương đương khoảng **0,6%** so với mốc 3 tỷ tham số. Đây là lý do file adapter nhỏ hơn mô hình nền rất nhiều.

Phụ đề video 006 có đoạn ghi **17 MB**, nhưng chính phép tính và số file được nhắc tiếp theo là **73,4 MB**. Chênh lệch của hai số làm tròn 2,27 và 2,2 GB cũng xấp xỉ 70 MB, không phải 17 MB. Không nên học thuộc đoạn phụ đề bị mâu thuẫn này.

### 9.3. Cấu hình nặng: r = 256, attention + MLP

Giảng viên dự kiến dùng khoảng 800.000 mẫu thay vì 20.000 mẫu của chế độ nhẹ, đồng thời mở rộng adapter.

```text
Attention/block = 256 × [(3072+3072) + (3072+1024)
                         + (3072+1024) + (3072+3072)]
                = 5.242.880

MLP/block       = 256 × [(3072+8192) + (3072+8192)
                         + (8192+3072)]
                = 8.650.752

Toàn bộ adapter = (5.242.880 + 8.650.752) × 28
                = 389.021.696 tham số

Dung lượng FP32 = 389.021.696 × 4 byte ≈ 1,56 GB
```

So với cấu hình nhẹ, adapter tăng khoảng **21,2 lần** vì vừa tăng r vừa thêm lớp. 389 triệu bằng khoảng 13% của mốc 3 tỷ, nên cách nói “khoảng 10%” trong video chỉ là xấp xỉ thô.

20.000 và 800.000 là hai quy mô thử nghiệm của khóa học, không phải số mẫu tối thiểu hay công thức lựa chọn r. Chất lượng, mức đa dạng và độ phù hợp của dữ liệu vẫn rất quan trọng.

Trong các phép tính trên, MB/GB dùng hệ thập phân; phần mềm hiển thị MiB/GiB có thể cho số khác dù cùng lượng byte.

## 10. Sau khi học xong, “mô hình của tôi” nằm ở đâu?

Video 006 mở **Files and versions** trên Hugging Face để đối chiếu phép tính với file `adapter_model.safetensors` khoảng 73,4 MB hoặc 1,56 GB.

Ý nghĩa: phần được lưu trong ví dụ là **các trọng số adapter đã học**. Adapter không phải một LLaMA hoàn chỉnh có thể chạy độc lập.

Để dùng lại theo cách lưu adapter riêng, bạn cần:

- Đúng mô hình nền tương thích.
- Tokenizer và cấu hình phù hợp.
- Adapter cùng cấu hình của nó.

Hình dung mô hình nền là ứng dụng chính, adapter là phần bổ sung được xây cho ứng dụng đó. Có file bổ sung không có nghĩa đã có toàn bộ ứng dụng.

“AI của riêng tôi” trong bối cảnh này có nghĩa bạn tạo bản tinh chỉnh phục vụ mục tiêu riêng dựa trên mô hình có sẵn. Nó không có nghĩa bạn đã tự pretrain một LLM từ đầu. Chạy bằng tài nguyên của mình cũng vẫn có chi phí phần cứng hoặc hạ tầng.

## 11. Cách tự kiểm tra bạn đã hiểu đúng

**Nếu đóng băng mô hình nền, tại sao đầu ra vẫn thay đổi?** Vì adapter thêm một đóng góp đã học vào các phép tính của mô hình.

**Nếu chỉ quantize mà không huấn luyện thì nó đã học định giá chưa?** Chưa. Lượng tử hóa đổi cách biểu diễn số để giảm bộ nhớ, không tự bổ sung chuyên môn định giá.

**Nếu r tăng từ 32 lên 64, giữ nguyên các lớp, số tham số adapter thay đổi thế nào?** Tăng gấp đôi. Chất lượng không nhất thiết tăng gấp đôi hoặc thậm chí tăng.

**Nếu loss trên dữ liệu học giảm, đã chắc dự đoán giá tốt hơn chưa?** Chưa. Cần kiểm tra trên dữ liệu chưa dùng để huấn luyện, với thước đo liên quan nhiệm vụ.

**Sau sáu video này đã có bằng chứng QLoRA thắng mô hình lớn chưa?** Chưa. Day 1 dựng nền tảng; các bước đánh giá kết quả đến sau.

Bạn chỉ cần giữ được mạch: **có mô hình nền → cần dạy thêm cho nhiệm vụ → full fine-tuning tốn tài nguyên → dùng LoRA để giảm phần cần học → lượng tử hóa nền để giảm bộ nhớ → đo kết quả để biết có đáng dùng hay không**.

## Nguồn và phạm vi đối chiếu

Nguồn nội dung chính là sáu file SRT tương ứng các video 001–006 đã đính kèm, đọc theo thứ tự số. Không coi các đoạn nhận dạng tên riêng hoặc con số mâu thuẫn trong SRT là dữ kiện chắc chắn.

Các liên kết kỹ thuật trong bài dùng để làm rõ scaling, NF4, double quantization và cấu hình nạp mô hình. Ví dụ sản phẩm, ví dụ chuyên viên và các câu tự kiểm tra do người biên soạn bổ sung. Các phép tính tham số được tính lại, không phải kết quả chạy huấn luyện mới.
