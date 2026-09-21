# Week 7 — Ghi chú toàn bộ quy trình QLoRA dự đoán giá

<!-- markdownlint-disable MD024 MD025 MD060 -->

## Tóm tắt quy trình của tuần học

Week 7 xây dựng một quy trình fine-tuning cho bài toán **đọc mô tả sản phẩm và dự đoán giá**. Mạch học đi từ lý thuyết đến thực nghiệm:

1. Hiểu LoRA, lượng tử hóa và QLoRA.
2. Tải dữ liệu sản phẩm, đo token và tạo `prompt`/`completion`.
3. Chọn mô hình nền LLaMA 3.2 3B, cấu hình SFTTrainer và huấn luyện adapter LoRA.
4. Theo dõi training loss, validation loss, learning rate và checkpoint.
5. Nạp lại adapter, chạy đánh giá trên test set và so sánh sai số giá.

Các notebook là phần thao tác chính. Các file Markdown diễn giải lại bài giảng theo hai mức: bản đầy đủ để học kỹ và bản tóm tắt để ôn nhanh. Các module Python cung cấp lớp dữ liệu, bộ đánh giá và công cụ biểu diễn kết quả.

## Ý nghĩa chính của toàn bộ dự án

Mục tiêu không phải tạo một mô hình ngôn ngữ từ đầu. Dự án dùng một mô hình LLaMA đã pretrain, giữ phần lớn trọng số nền cố định, rồi học thêm adapter LoRA trên dữ liệu sản phẩm có giá.

- **LoRA** giảm số tham số cần cập nhật.
- **Quantization 4-bit** giảm bộ nhớ của mô hình nền.
- **SFTTrainer** điều phối fine-tuning có giám sát.
- **Validation** giúp chọn cấu hình hoặc checkpoint.
- **Test** chỉ được dùng sau khi đã chốt lựa chọn.
- **MAE/error theo USD** phản ánh mục tiêu kinh doanh rõ hơn training loss.

Kết quả cuối cần được hiểu trong phạm vi bộ dữ liệu và phép đánh giá của dự án, không được suy rộng thành kết luận rằng mô hình nhỏ giỏi hơn mọi mô hình lớn ở mọi nhiệm vụ.

## Sơ đồ liên kết các file

| Nhóm | File | Vai trò |
|---|---|---|
| Notebook | [day1.ipynb](day1.ipynb) | Giới thiệu lộ trình Week 7 và QLoRA |
| Notebook | [day2.ipynb](day2.ipynb) | Chuẩn bị dữ liệu, cắt token, tạo prompt |
| Notebook | [day3 and 4.ipynb](day3%20and%204.ipynb) | Notebook huấn luyện cho Day 3 và Day 4 |
| Notebook | [day5.ipynb](day5.ipynb) | Giới thiệu notebook đánh giá Day 5 |
| Notebook | [results.ipynb](results.ipynb) | Vẽ biểu đồ so sánh sai số các mô hình |
| Python | [pricer/items.py](pricer/items.py) | Mô hình dữ liệu và xử lý prompt/dataset |
| Python | [pricer/evaluator.py](pricer/evaluator.py) | Đánh giá song song trên các sản phẩm |
| Python | [util.py](util.py) | Đánh giá tuần tự và trực quan hóa kết quả |

# Phần I — Ghi chú các tài liệu Markdown

## 1. Day 1 — Bản đầy đủ

File: [Day-01_001-006_QLoRA-Day-du.md](Day-01_001-006_QLoRA-Day-du.md)

### Nội dung chính

Tài liệu giải thích nền tảng của fine-tuning tiết kiệm tài nguyên:

- Mô hình nền đã biết ngôn ngữ nhưng chưa chắc giỏi định giá.
- Full fine-tuning phải cập nhật hàng tỷ tham số, cần nhiều bộ nhớ.
- LoRA đóng băng mô hình nền và thêm hai ma trận nhỏ `A` và `B`.
- `r`, `alpha` và `target_modules` quyết định kích thước, mức ảnh hưởng và vị trí của adapter.
- Quantization lưu trọng số bằng ít bit hơn; 4-bit không làm giảm số lượng tham số.
- QLoRA là sự kết hợp giữa nền lượng tử hóa và adapter LoRA được huấn luyện.
- Adapter không chạy độc lập; cần base model, tokenizer và cấu hình tương thích.

### Các số liệu cần hiểu

Tài liệu phân biệt footprint khi nạp mô hình với bộ nhớ khi huấn luyện. Các con số như khoảng 12,9 GB, 3,6 GB, 2,2 GB và 73,4 MB là số đo trong thí nghiệm, không phải yêu cầu chung cho mọi máy.

### Ý nghĩa thực tế

File này giúp người học hiểu **vì sao** dự án dùng QLoRA trước khi đọc cấu hình notebook. Trọng tâm là phần được học là adapter, còn mô hình nền vẫn tham gia tính toán nhưng được giữ cố định.

## 2. Day 1 — Bản tóm tắt

File: [Day-01_001-006_QLoRA-Tom-tat.md](Day-01_001-006_QLoRA-Tom-tat.md)

### Nội dung chính

Đây là bản ôn nhanh của Day 1. Có thể dùng để nhớ ba ý:

1. LoRA giải quyết việc có quá nhiều tham số cần cập nhật.
2. Quantization giải quyết việc mô hình nền chiếm nhiều bộ nhớ.
3. QLoRA huấn luyện adapter LoRA trên nền đã lượng tử hóa.

File cũng tóm tắt `r`, `alpha`, `target_modules`, footprint mô hình, adapter và sự khác nhau giữa dung lượng file với VRAM huấn luyện.

### Ý nghĩa thực tế

Đọc file này trước bản đầy đủ giúp nắm từ khóa. Khi cần hiểu công thức hoặc các cảnh báo về số liệu, quay lại bản Day 1 đầy đủ.

## 3. Day 2 — Bản đầy đủ

File: [Day-02_007-010_QLoRA-Day-du.md](Day-02_007-010_QLoRA-Day-du.md)

### Nội dung chính

Tài liệu trình bày quá trình biến dữ liệu sản phẩm thành dữ liệu fine-tuning:

- Đếm token bằng đúng tokenizer của LLaMA.
- Cắt phần mô tả ở 110 token theo thí nghiệm.
- Tạo `prompt` kết thúc ở `Price is $` và `completion` chứa giá.
- Làm tròn giá cho train/validation nhưng giữ giá thật cho test.
- Đo độ dài toàn mẫu, phân biệt 110, 126 và 128 token.
- Lưu dataset lên Hugging Face và thử mô hình base 4-bit.
- Phân biệt base model với chat/instruct model.
- Ghi baseline trước fine-tuning.

### Các cảnh báo quan trọng

Padding và truncation là hai thao tác khác nhau. Giới hạn 128 token là cấu hình của thí nghiệm, không phải context window tối đa của LLaMA. Upload dataset cũng không đồng nghĩa với training.

Baseline base model có error được báo là 110,72, còn baseline hằng số là 106,18. Công thức evaluator không được cung cấp đầy đủ trong phụ đề nên không nên tự gọi 110,72 là MAE hay RMSE nếu chưa kiểm tra code thực tế.

### Ý nghĩa thực tế

Chất lượng fine-tuning bắt đầu từ dữ liệu đúng định dạng, không cắt mất đáp án và có baseline để so sánh công bằng.

## 4. Day 2 — Bản tóm tắt

File: [Day-02_007-010_QLoRA-Tom-tat.md](Day-02_007-010_QLoRA-Tom-tat.md)

### Nội dung chính

Bản tóm tắt giữ lại các điểm cần nhớ nhất:

- `prompt` là đề bài, `completion` là phần giá mô hình phải viết tiếp.
- Train, validation và test có vai trò khác nhau.
- 110 là giới hạn mô tả, 126 là độ dài toàn mẫu lớn nhất được báo, 128 là giới hạn chuỗi dự kiến.
- Train/validation dùng giá làm tròn; test giữ giá gốc.
- 8 token sinh ra khi thử nghiệm không cùng vai trò với 128 token dùng khi huấn luyện.
- Base model chưa fine-tune không phải mô hình chưa học gì.

### Ý nghĩa thực tế

Đây là bản ôn nhanh trước khi chuyển sang Day 3, nơi dữ liệu đã được chuẩn bị sẽ đi vào quy trình huấn luyện.

## 5. Day 3 — Bản đầy đủ

File: [Day-03_011-015_QLoRA-Day-du.md](Day-03_011-015_QLoRA-Day-du.md)

### Nội dung chính

Tài liệu giải thích cách tổ chức một buổi huấn luyện QLoRA:

- Chọn `target_modules`, rank, alpha và dropout cho LoRA.
- Chọn epoch, batch size, gradient accumulation và learning rate.
- Hiểu warmup, cosine scheduler, AdamW và weight decay.
- Tạo `LoraConfig`, `SFTConfig` và `SFTTrainer`.
- Theo dõi training loss, validation loss, learning rate, GPU memory và checkpoint.
- Phân biệt loss token với sai số giá.

Bản nhẹ trong video dùng khoảng 20.000 mẫu, batch 32, một epoch và tạo khoảng 625 bước cập nhật. Bản đầy đủ dùng nhiều dữ liệu, rank lớn hơn và nhiều tài nguyên hơn.

### Ý nghĩa thực tế

File này là cầu nối giữa lý thuyết QLoRA và notebook training. Người học cần hiểu mỗi hyperparameter đang điều khiển điều gì thay vì chỉ sao chép các giá trị trong notebook.

## 6. Day 3 — Bản tóm tắt

File: [Day-03_011-015_QLoRA-Tom-tat.md](Day-03_011-015_QLoRA-Tom-tat.md)

### Nội dung chính

Bản ôn nhanh tập trung vào:

- Bốn bước `forward → loss → backward → optimizer step`.
- LoRA adapter là phần được học, nền 4-bit được giữ cố định.
- Validation dùng để theo dõi và chọn checkpoint.
- Loss giảm chưa chứng minh sai số giá giảm.
- Checkpoint cuối không mặc nhiên là checkpoint tốt nhất.

### Ý nghĩa thực tế

Đây là bảng nhắc nhanh để đọc log trong lúc training mà không nhầm loss token với MAE theo USD.

## 7. Day 4 — Bản đầy đủ

File: [Day-04_016-020_QLoRA-Day-du.md](Day-04_016-020_QLoRA-Day-du.md)

### Nội dung chính

Day 4 tập trung vào theo dõi và chọn kết quả:

- So sánh training loss với validation loss.
- Đọc đúng tên chỉ số và trục biểu đồ.
- Hiểu smoothing chỉ thay đổi cách hiển thị.
- Phân biệt batch, step, epoch và gradient accumulation.
- Theo dõi warmup và cosine scheduler.
- Nhận diện overfitting khi training loss giảm nhưng validation loss tăng.
- Chọn checkpoint theo validation và ghi lại commit ID trên Hugging Face.

Trong thí nghiệm được mô tả, checkpoint khoảng step 6200 được chọn trước khi validation loss xấu đi ở epoch thứ ba. Đây là kết quả của một run cụ thể, không phải con số áp dụng cho mọi dự án.

### Ý nghĩa thực tế

Huấn luyện không kết thúc ở lệnh `.train()`. Cần theo dõi xu hướng, giữ checkpoint đúng và chỉ dùng test sau khi lựa chọn đã hoàn tất.

## 8. Day 4 — Bản tóm tắt

File: [Day-04_016-020_QLoRA-Tom-tat.md](Day-04_016-020_QLoRA-Tom-tat.md)

### Nội dung chính

Bản tóm tắt nhấn mạnh ba câu:

1. Training loss cho biết mô hình học dữ liệu train thế nào.
2. Validation loss cho biết khả năng áp dụng lên dữ liệu giữ riêng.
3. Sau khi chọn bằng validation, cần dùng test riêng để đánh giá cuối.

### Ý nghĩa thực tế

File này phù hợp để kiểm tra nhanh xem một run có dấu hiệu overfitting hay không và nhắc rằng checkpoint mới nhất chưa chắc là checkpoint tốt nhất.

## 9. Day 5 — Bản đầy đủ

File: [Day-05_021-024_QLoRA-Day-du.md](Day-05_021-024_QLoRA-Day-du.md)

### Nội dung chính

Day 5 giải thích giai đoạn sau training:

- Forward, cross-entropy loss, backward và optimizer step.
- Logits, softmax và xác suất của token đúng.
- Vì sao loss không phải số USD đoán sai.
- Cách nạp base model cùng LoRA adapter và revision đúng.
- Đánh giá bản Lite và bản Full trên test set.
- Phân biệt loss token với MAE.

Các số liệu được ghi trong tài liệu gồm Lite 65,40 USD và Full 39,85 USD. Đây là số liệu của thí nghiệm trong khóa học, không phải kết luận tổng quát về năng lực mô hình.

### Ý nghĩa thực tế

File này khép lại vòng đời của thí nghiệm: hiểu mô hình học gì, lấy đúng adapter đã chọn và đo chất lượng theo mục tiêu thật là sai số giá.

## 10. Day 5 — Bản tóm tắt

File: [Day-05_021-024_QLoRA-Tom-tat.md](Day-05_021-024_QLoRA-Tom-tat.md)

### Nội dung chính

Bản tóm tắt ghi nhớ:

- Cross-entropy dựa trên xác suất token đúng.
- Adapter thường cần base model tương thích.
- Lite và Full thay đổi nhiều yếu tố cùng lúc nên không thể quy toàn bộ cải thiện cho rank.
- MAE 39,85 USD là sai số trung bình, không phải mọi sản phẩm đều sai đúng 39,85 USD.

### Ý nghĩa thực tế

Dùng file này để ôn trước khi đọc mã đánh giá và biểu đồ kết quả.

# Phần II — Ghi chú các module Python

## 11. `pricer/items.py`

File: [pricer/items.py](pricer/items.py)

### File này dùng để làm gì?

`Item` là mô hình dữ liệu Pydantic đại diện cho một sản phẩm. Nó giữ tiêu đề, danh mục, giá, mô tả đầy đủ, trọng lượng, phần tóm tắt, prompt, completion và ID.

### Các thành phần chính

- `PREFIX = "Price is $"`: tiền tố báo vị trí mô hình cần sinh giá.
- `QUESTION`: câu hỏi yêu cầu ước lượng giá đến đô la gần nhất.
- `make_prompt()`: tạo prompt đơn giản từ một đoạn text và giá làm tròn.
- `test_prompt()`: cắt phần completion để lấy prompt dùng khi kiểm tra.
- `from_hub()`: tải các split từ Hugging Face và dựng lại các đối tượng `Item`.
- `push_to_hub()`: lưu các trường đầy đủ của Item lên Hugging Face.
- `count_tokens()`: đếm token trong summary bằng tokenizer.
- `make_prompts()`: cắt summary theo `max_tokens`, tạo prompt và chọn giá làm tròn hoặc giá gốc.
- `count_prompt_tokens()`: đếm token của prompt nối với completion.
- `to_datapoint()`: chỉ giữ hai trường `prompt` và `completion` cho SFT.
- `push_prompts_to_hub()`: lưu dataset prompt-completion.

### Luồng dữ liệu

`summary → tokenizer → cắt nếu cần → prompt + completion → DatasetDict → Hugging Face Hub`.

Khi `do_round=True`, train và validation nhận giá dạng làm tròn như `80.00`. Khi `do_round=False`, test giữ giá thật.

### Điểm cần kiểm tra

`push_to_hub()` dùng split `validation`, nhưng `push_prompts_to_hub()` đang dùng khóa `val`. Trong khi đó `from_hub()` luôn đọc `ds["validation"]`. Nếu dataset prompt-completion được tải bằng `from_hub()`, split `val` có thể gây lỗi hoặc không nhất quán. Nên thống nhất tên split thành `validation` nếu muốn hai hàm tương thích trực tiếp.

Ngoài ra, `make_prompts()` giả định `summary` có giá trị. Nếu summary là `None`, tokenizer sẽ không xử lý được; dữ liệu đầu vào cần được kiểm tra trước.

### Ý nghĩa thực tế

Đây là module nối dữ liệu thô với định dạng mà trainer cần. Nếu prompt, completion hoặc split sai, notebook huấn luyện có thể lỗi dù cấu hình mô hình đúng.

## 12. `pricer/evaluator.py`

File: [pricer/evaluator.py](pricer/evaluator.py)

### File này dùng để làm gì?

Module cung cấp lớp `Tester` và hàm `evaluate()` để chạy predictor trên một số lượng sản phẩm, tính sai số tuyệt đối, MSE, R² và vẽ biểu đồ.

### Các bước chính

1. `post_process()` lấy số đầu tiên từ chuỗi mô hình sinh ra, loại `$` và dấu phẩy.
2. `run_datapoint()` gọi predictor, chuyển kết quả thành số và so sánh với `datapoint.price`.
3. `color_for()` phân loại điểm theo mức sai số: xanh, cam hoặc đỏ.
4. `chart()` vẽ giá thật và giá dự đoán, kèm đường tham chiếu `y=x`.
5. `error_trend_chart()` vẽ sai số trung bình tích lũy và khoảng tin cậy 95%.
6. `report()` tính error trung bình, MSE và R² rồi gọi hai biểu đồ.
7. `run()` dùng `ThreadPoolExecutor` để đánh giá song song.
8. `evaluate()` là hàm tiện ích tạo Tester và chạy toàn bộ quy trình.

### Ý nghĩa thực tế

Module này phù hợp khi predictor gọi API hoặc thao tác chậm, vì có thể chạy nhiều datapoint song song. `executor.map()` vẫn trả kết quả theo thứ tự đầu vào, còn việc thêm kết quả vào các danh sách diễn ra trong luồng chính.

### Điểm cần kiểm tra

`post_process()` trả `0` nếu không tìm thấy số. Điều này giúp pipeline không dừng nhưng biến lỗi định dạng thành một dự đoán có sai số rất lớn. Nên thống kê riêng số output không hợp lệ thay vì chỉ gộp vào error.

`color_for()` chia cho `truth`; nếu giá thật bằng `0`, có thể xảy ra chia cho 0. `report()` cũng giả định `size` đúng với số lỗi đã thu thập.

## 13. `util.py`

File: [util.py](util.py)

### File này dùng để làm gì?

`util.py` có chức năng gần giống `pricer/evaluator.py` nhưng chạy tuần tự và nhận dữ liệu dạng dictionary có `prompt` và `completion`.

### Các bước chính

- `make_title()` tạo tiêu đề từ tên predictor.
- `post_process()` trích số đầu tiên từ output.
- `run_datapoint()` lấy giá thật từ `completion`, tính sai số và rút tên sản phẩm từ prompt.
- `chart()` vẽ scatter plot giữa giá thật và giá dự đoán.
- `error_trend_chart()` vẽ trung bình tích lũy và khoảng tin cậy.
- `report()` tính error, MSE, R² và hiển thị biểu đồ.
- `run()` lặp qua dữ liệu bằng `tqdm`, sau đó xóa output cũ bằng `clear_output()`.
- `evaluate()` là hàm gọi tắt.

### So sánh với `pricer/evaluator.py`

| Đặc điểm | `util.py` | `pricer/evaluator.py` |
|---|---|---|
| Dữ liệu | Dictionary prompt-completion | Đối tượng `Item` |
| Chạy | Tuần tự | Song song bằng 5 worker mặc định |
| Progress bar | `tqdm.auto` | `tqdm.notebook` |
| Dữ liệu giá thật | `datapoint["completion"]` | `datapoint.price` |
| Kích thước biểu đồ | Nhỏ hơn | Lớn hơn |

### Điểm cần kiểm tra

Các rủi ro tương tự tồn tại ở đây: output không có số bị biến thành `0`, giá thật bằng `0` có thể gây lỗi trong `error / truth`, và `size` cần khớp với số datapoint thực tế.

Hai evaluator còn có cách đọc dữ liệu và cách hiển thị khác nhau. Khi so sánh kết quả, cần dùng cùng test set, cùng quy tắc trích giá và cùng công thức đánh giá.

# Phần III — Giải thích từng notebook

## 14. Notebook `day1.ipynb`

File: [day1.ipynb](day1.ipynb)

### Tóm tắt quy trình của notebook

Notebook chỉ giới thiệu Week 7, bài toán và thứ tự học. Nó không chạy huấn luyện hay đánh giá.

### Ý nghĩa chính của notebook

Đây là trang mở đầu giúp người học hiểu cả tuần sẽ fine-tune một mô hình mã nguồn mở để ước lượng giá từ mô tả sản phẩm.

### Giải thích từng cell

#### Cell 1 — Giới thiệu Week 7

- Dùng để giới thiệu capstone “The Price Is Right”.
- Nêu mục tiêu fine-tune mô hình để ước lượng giá từ mô tả.
- Liệt kê thứ tự Day 1 QLoRA, Day 2 dữ liệu/prompt, Day 3–4 training và Day 5 evaluation.
- Đây là định hướng cho các notebook tiếp theo.

**Chốt ý nghĩa thực tế:** Cell này giúp người học biết từng bước trong dự án trước khi bắt đầu chạy code.

#### Cell 2 — Liên kết Google Colab

- Dùng để cung cấp URL notebook trên Google Colab.
- Không tạo biến hay kết quả nào trong môi trường local.
- Người học có thể dùng liên kết để đối chiếu notebook gốc.

**Chốt ý nghĩa thực tế:** Cell này là điểm truy cập đến môi trường thực hành của khóa học.

### Mục tiêu cuối cùng

Sau notebook này, người học hiểu phạm vi dự án và thứ tự các ngày học.

## 15. Notebook `day2.ipynb`

File: [day2.ipynb](day2.ipynb)

### Tóm tắt quy trình của notebook

Notebook tải dataset, nạp tokenizer, đo độ dài summary, chọn cutoff 110 token, tạo prompt-completion, đo lại độ dài và đẩy dataset prompt lên Hugging Face.

### Ý nghĩa chính của notebook

Đây là notebook tiền xử lý dữ liệu trước fine-tuning. Kết quả quan trọng là ba split train/validation/test với prompt và completion có định dạng nhất quán.

### Giải thích từng cell

#### Cell 1 — Tiêu đề và lộ trình

Giới thiệu Day 2 và mục tiêu upload dataset cuối cùng. Cell này tạo bối cảnh cho các thao tác code tiếp theo.

**Chốt ý nghĩa thực tế:** Cell này cho biết notebook đang chuẩn bị dữ liệu chứ chưa huấn luyện mô hình.

#### Cell 2 — Import thư viện

Import `os`, `dotenv`, Hugging Face login, `Item`, `tqdm`, `AutoTokenizer` và `matplotlib`. Đây là các công cụ dùng để đọc cấu hình, tải dữ liệu, tokenize và vẽ histogram.

**Chốt ý nghĩa thực tế:** Cell này chuẩn bị các thành phần cần thiết cho toàn bộ pipeline tiền xử lý.

#### Cell 3 — Chọn chế độ và đăng nhập

`LITE_MODE` chọn dataset nhỏ hoặc đầy đủ. `load_dotenv()` đọc biến môi trường, sau đó lấy `HF_TOKEN` và đăng nhập Hugging Face.

**Chốt ý nghĩa thực tế:** Cell này xác định quy mô thí nghiệm và quyền truy cập dataset/model.

#### Cell 4 — Tải dataset

Tạo tên dataset theo `LITE_MODE`, gọi `Item.from_hub()` và nối train, validation, test vào `items`. Cuối cell in số lượng mẫu.

**Chốt ý nghĩa thực tế:** Cell này đưa dữ liệu đã lưu trên Hub về dạng các đối tượng `Item` để xử lý tiếp.

#### Cell 5 — Nạp tokenizer

Đặt `BASE_MODEL` là `meta-llama/Llama-3.2-3B` rồi dùng `AutoTokenizer.from_pretrained()`.

**Chốt ý nghĩa thực tế:** Mọi quyết định cắt token phải dựa trên tokenizer của mô hình thực sự dùng khi huấn luyện.

#### Cell 6 — Đếm token summary

Gọi `item.count_tokens(tokenizer)` cho từng sản phẩm và hiển thị tiến độ bằng `tqdm`.

**Chốt ý nghĩa thực tế:** Cell này đo độ dài thật theo token, thay vì suy đoán từ số ký tự.

#### Cell 7 — Vẽ histogram summary

Tính trung bình, giá trị lớn nhất và vẽ phân bố token bằng `plt.hist()`.

**Chốt ý nghĩa thực tế:** Histogram giúp quyết định cutoff dựa trên dữ liệu thay vì chọn tùy ý.

#### Cell 8 — Chọn cutoff

Đặt `CUTOFF = 110`, đếm số summary dài hơn cutoff và in tỷ lệ bị truncate.

**Chốt ý nghĩa thực tế:** Cell này lượng hóa đánh đổi giữa giữ thông tin và giảm chi phí xử lý.

#### Cell 9 — Xem summary mẫu

In `train[0].summary` để kiểm tra nội dung thực tế trước khi cắt.

**Chốt ý nghĩa thực tế:** Xem mẫu giúp phát hiện dữ liệu bất thường mà biểu đồ không thể hiện đầy đủ.

#### Cell 10 — Tạo prompt và completion

Với train và validation, gọi `make_prompts(..., True)` để làm tròn giá. Với test, gọi `make_prompts(..., False)` để giữ giá thật.

**Chốt ý nghĩa thực tế:** Cell này bảo đảm mục tiêu huấn luyện và tiêu chuẩn test được tách biệt đúng.

#### Cell 11 — Kiểm tra prompt mẫu

In prompt và completion của một mẫu test để kiểm tra định dạng đầu ra.

**Chốt ý nghĩa thực tế:** Đây là bước kiểm tra rẻ nhưng quan trọng để chắc rằng prompt không chứa sẵn đáp án và completion đúng kiểu mong muốn.

#### Cell 12 — Đếm token toàn mẫu

Gọi `count_prompt_tokens()` cho toàn bộ items. Hàm này đếm prompt nối với completion.

**Chốt ý nghĩa thực tế:** Cell này kiểm tra độ dài mà trainer thực sự có thể nhận, không chỉ độ dài summary.

#### Cell 13 — Vẽ histogram toàn mẫu

Vẽ phân bố độ dài prompt cộng completion, hiển thị trung bình và giá trị lớn nhất.

**Chốt ý nghĩa thực tế:** Kết quả giúp chọn maximum sequence length, chẳng hạn 128 token, mà hạn chế cắt mất completion.

#### Cell 14 — Đẩy prompt dataset lên Hub

Tạo tên `items_prompts_lite` hoặc `items_prompts_full`, rồi gọi `Item.push_prompts_to_hub()`.

**Chốt ý nghĩa thực tế:** Cell này lưu dữ liệu đúng định dạng để notebook training có thể tải lại.

#### Cell 15 — Liên kết dataset và Colab

Cung cấp URL dataset trên Hugging Face và URL notebook Colab.

**Chốt ý nghĩa thực tế:** Cell này giúp người học kiểm tra dataset đã được công bố và mở môi trường thực hành tương ứng.

#### Cell 16 — Cell Markdown trống

Không có nội dung xử lý. Đây là ô giữ chỗ hoặc phần kết thúc notebook.

**Chốt ý nghĩa thực tế:** Cell này không ảnh hưởng pipeline và có thể bỏ qua khi học.

### Mục tiêu cuối cùng

Tạo được dataset prompt-completion có train/validation/test, summary đã cắt theo token và giá train/validation được làm tròn.

## 16. Notebook `day3 and 4.ipynb`

File: [day3 and 4.ipynb](day3%20and%204.ipynb)

### Tóm tắt quy trình của notebook

Trong bản file hiện tại, notebook chỉ có phần giới thiệu và liên kết Colab; phần code training đầy đủ nằm ở notebook Colab được liên kết.

### Ý nghĩa chính của notebook

Notebook local đóng vai trò mục lục cho Day 3 và Day 4, còn các thao tác cấu hình, chạy SFTTrainer và theo dõi W&B được thực hiện ở môi trường Colab gốc.

### Giải thích từng cell

#### Cell 1 — Giới thiệu Days 3 and 4

Nêu mục tiêu fine-tune mô hình để dự đoán giá và cung cấp URL Colab.

**Chốt ý nghĩa thực tế:** Cell này chỉ đường đến môi trường chứa quy trình training chính.

#### Cell 2 — Cell Markdown trống

Không có nội dung. Không tạo ra dữ liệu hay tác động đến training.

**Chốt ý nghĩa thực tế:** Cell này là phần giữ chỗ, có thể bỏ qua khi đọc.

### Mục tiêu cuối cùng

Biết rằng notebook local là bản giới thiệu; muốn xem code training cần mở liên kết Colab.

## 17. Notebook `day5.ipynb`

File: [day5.ipynb](day5.ipynb)

### Tóm tắt quy trình của notebook

Notebook chỉ giới thiệu Day 5 và cung cấp liên kết Colab cho phần đánh giá.

### Ý nghĩa chính của notebook

Day 5 dùng mô hình/adapter đã huấn luyện để chạy dự đoán, tính error, MSE, R² và so sánh với các baseline.

### Giải thích từng cell

#### Cell 1 — Giới thiệu và liên kết Colab

Nêu chủ đề fine-tune mô hình dự đoán giá rồi dẫn đến notebook Colab.

**Chốt ý nghĩa thực tế:** Cell này là điểm bắt đầu để thực hiện đánh giá sau training.

### Mục tiêu cuối cùng

Mở notebook Colab tương ứng để nạp checkpoint đúng và đánh giá trên test set.

## 18. Notebook `results.ipynb`

File: [results.ipynb](results.ipynb)

### Tóm tắt quy trình của notebook

Notebook tạo một danh sách kết quả đã có sẵn, tách nhãn/màu/giá trị rồi vẽ biểu đồ cột bằng Plotly.

### Ý nghĩa chính của notebook

Notebook giúp so sánh error của baseline truyền thống, con người, các mô hình ngôn ngữ và LLaMA fine-tuned.

### Giải thích từng cell

#### Cell 1 — Tạo và vẽ bảng so sánh

- Import `plotly.graph_objects`.
- Tạo danh sách `results` gồm tên mô hình, màu và error.
- Dùng `zip(*)` để tách `labels`, `colors`, `values`.
- Tạo `go.Bar` với error trên trục y.
- Đặt tiêu đề, giới hạn trục y, góc nhãn và kích thước biểu đồ.
- `fig.show()` hiển thị kết quả.

**Chốt ý nghĩa thực tế:** Cell này biến các con số đánh giá thành biểu đồ để so sánh nhanh mô hình nào có error thấp hơn.

#### Cell 2 — Cell code trống

Không có lệnh thực thi.

**Chốt ý nghĩa thực tế:** Cell này không ảnh hưởng kết quả biểu đồ.

#### Cell 3 — Cell code trống

Không có lệnh thực thi.

**Chốt ý nghĩa thực tế:** Cell này là phần giữ chỗ và không tạo thêm kết quả.

### Mục tiêu cuối cùng

Có một biểu đồ tổng quan, trong đó error thấp hơn biểu thị kết quả định giá tốt hơn theo phép đo đã dùng.

## 19. Ghi chú về định dạng notebook hiện tại

Kiểm tra file thực tế trong workspace cho thấy các notebook đều có thể đọc như JSON và có cấu trúc `cells`. Tuy nhiên, metadata của các cell hiện đang rỗng hoặc chưa đầy đủ theo quy tắc notebook đã đặt:

- `id` đang nằm trực tiếp trên cell thay vì trong `metadata.id`.
- `metadata.language` chưa được khai báo cho từng cell.
- Điều này không làm thay đổi nội dung logic của notebook, nhưng có thể khiến công cụ kiểm tra định dạng hoặc công cụ xử lý notebook yêu cầu schema nghiêm ngặt báo lỗi.

**Chốt ý nghĩa thực tế:** Các notebook hiện có thể dùng để tham khảo, nhưng nên chuẩn hóa metadata trước khi tạo cell mới hoặc đưa chúng qua một công cụ tự động yêu cầu đúng schema.

# Phần IV — Quy trình thực hành đề xuất

## Bước 1 — Kiểm tra dữ liệu

Đọc dataset, kiểm tra `summary`, `price`, các split và các giá trị thiếu. Đảm bảo test không chứa đáp án trong prompt.

## Bước 2 — Kiểm tra token

Dùng đúng tokenizer của base model, đo summary và toàn chuỗi sau khi nối prompt/completion. Kiểm tra trực tiếp các mẫu bị cắt để tránh mất thông tin quan trọng hoặc mất completion.

## Bước 3 — Chuẩn hóa split

Nên dùng nhất quán tên `train`, `validation`, `test`. Đặc biệt cần kiểm tra khác biệt giữa `validation` và `val` trong [pricer/items.py](pricer/items.py).

## Bước 4 — Chạy training nhỏ

Dùng chế độ Lite để kiểm tra pipeline, log, checkpoint và khả năng nạp lại adapter trước khi chạy Full.

## Bước 5 — Theo dõi validation

Không chọn checkpoint chỉ vì training loss thấp hoặc step lớn nhất. Theo dõi validation loss và nếu mục tiêu là giá thì đo thêm MAE trên validation bằng cùng cách sinh và trích giá.

## Bước 6 — Đánh giá cuối

Sau khi đã chọn checkpoint bằng validation, chạy đúng một quy trình test nhất quán. Ghi lại số output không hợp lệ, không âm thầm biến tất cả thành giá `0` mà không báo cáo.

## Bước 7 — Diễn giải kết quả

Phân biệt rõ:

- Cross-entropy: mô hình dự đoán token đúng tốt đến đâu.
- MAE/error: giá dự đoán lệch giá thật bao nhiêu USD.
- MSE: phạt mạnh các lỗi lớn.
- R²: mức giải thích biến thiên, không phải phần trăm dự đoán đúng.

# Mục tiêu cuối cùng

Sau khi đọc và hiểu toàn bộ các file, người học có thể mô tả trọn vẹn pipeline:

**mô hình nền → dữ liệu sản phẩm → đếm/cắt token → prompt-completion → QLoRA/SFTTrainer → theo dõi loss và checkpoint → nạp adapter → đánh giá MAE/error trên test**.

Điều quan trọng nhất là giữ được tính công bằng của thí nghiệm: dữ liệu tách biệt, tokenizer đúng, checkpoint được chọn bằng validation, test chỉ dùng ở cuối và kết quả được diễn giải đúng theo phạm vi của bộ dữ liệu.
