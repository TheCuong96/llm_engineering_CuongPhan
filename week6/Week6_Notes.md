<!-- markdownlint-disable MD024 MD060 -->

# Week 6 — Ghi chú học tập dự án The Price Is Right

> **Mục tiêu:** đọc mô tả sản phẩm và ước lượng giá của sản phẩm đó.
>
> Tài liệu này tổng hợp các notebook, module Python và các note Day 1–5 trong thư mục `week6`. Nội dung được viết theo hướng học tập, giữ nguyên tên file, tên hàm, biến và thư viện quan trọng để dễ đối chiếu với mã nguồn.

## Mục lục

1. [Bức tranh toàn cảnh](#1-bức-tranh-toàn-cảnh)
2. [Dữ liệu và cấu trúc Item](#2-dữ-liệu-và-cấu-trúc-item)
3. [Giải thích các module Python](#3-giải-thích-các-module-python)
4. [Giải thích từng notebook](#4-giải-thích-từng-notebook)
5. [Bảng kết quả](#5-bảng-kết-quả)
6. [Các điểm dễ nhầm](#6-các-điểm-dễ-nhầm)
7. [Checklist học và chạy dự án](#7-checklist-học-và-chạy-dự-án)

---

## 1. Bức tranh toàn cảnh

### Tóm tắt quy trình của dự án

Dự án đi qua năm giai đoạn:

1. **Ngày 1 — Data Curation:** tải dữ liệu sản phẩm Amazon, lọc giá và mô tả, làm sạch, loại trùng, khảo sát phân bố và tạo dataset Lite/Full.
2. **Ngày 2 — Data Pre-processing:** dùng LLM để viết lại mô tả sản phẩm theo một định dạng thống nhất, sau đó xử lý nhiều sản phẩm bằng Groq Batch API.
3. **Ngày 3 — Baseline và ML truyền thống:** xây các mốc so sánh, biến mô tả thành đặc trưng số và thử `LinearRegression`, `RandomForestRegressor`, `XGBRegressor`.
4. **Ngày 4 — Neural Network và LLM:** huấn luyện mạng nơ-ron nhỏ bằng PyTorch, so sánh với human baseline và nhiều LLM có sẵn.
5. **Ngày 5 — Fine-tuning:** chuyển cặp mô tả–giá thành JSONL, tạo fine-tuning job qua OpenAI API và đo chất lượng mô hình mới.

### Ý nghĩa chính của notebook

Đây không chỉ là bài tập chọn một model. Dự án minh họa một quy trình AI đầy đủ:

```text
Dữ liệu thô
    -> làm sạch và loại trùng
    -> chuẩn hóa mô tả
    -> chia train / validation / test
    -> tạo baseline
    -> huấn luyện nhiều loại mô hình
    -> đánh giá bằng cùng một cách
    -> chọn hướng phù hợp với chất lượng, chi phí và thời gian
```

### Mục tiêu cuối cùng

Sau khi học xong, người học có thể:

- hiểu vì sao chất lượng dữ liệu ảnh hưởng mạnh đến mô hình;
- phân biệt `training`, `validation`, `test` và `inference`;
- biến văn bản thành đặc trưng số;
- xây một hàm dự đoán có thể đưa vào `evaluate()`;
- đọc MAE, MSE, R² và biểu đồ sai số;
- phân biệt prompting, batch processing, fine-tuning và huấn luyện mạng chuyên dụng;
- không kết luận quá mức từ một lần chạy hoặc một điểm số.

---

## 2. Dữ liệu và cấu trúc `Item`

### Dataset nguồn

Dữ liệu lấy từ `McAuley-Lab/Amazon-Reviews-2023` trên Hugging Face, cụ thể là các cấu hình `raw_meta_<category>`. Phần này dùng thông tin sản phẩm, mô tả và giá; tên dataset có chữ Reviews nhưng bài toán hiện tại không dùng nội dung đánh giá khách hàng làm đầu vào chính.

### Quy tắc lọc trong `parser.py`

- Giá phải chuyển được sang `float`.
- Giá nằm trong khoảng `0.5` đến `999.49`.
- Văn bản sau làm sạch có ít nhất `600` ký tự.
- Mỗi phần văn bản tối đa `3000` ký tự.
- Tổng văn bản tối đa `4000` ký tự.
- Một số trường ít hữu ích như `Part Number` và `Best Sellers Rank` bị loại khỏi `details`.
- Trọng lượng được quy đổi về pound.

Đây là lựa chọn của dự án, không phải tiêu chuẩn bắt buộc cho mọi bài toán. Độ dài trong các hằng số trên tính bằng ký tự, không phải token.

### Các trường của `Item`

| Trường | Ý nghĩa |
|---|---|
| `title` | Tên sản phẩm |
| `category` | Danh mục sản phẩm |
| `price` | Giá dùng làm nhãn mục tiêu |
| `full` | Mô tả đầy đủ sau bước lọc |
| `weight` | Trọng lượng đã quy đổi |
| `summary` | Mô tả được LLM viết lại |
| `prompt` | Prompt có thể dùng cho một số thí nghiệm |
| `id` | Mã tạm dùng để ghép kết quả batch |

`price` là giá tham chiếu trong dataset tại thời điểm thu thập, không phải cam kết về giá thị trường hiện tại.

### Train, validation, test

| Tập | Dataset Full | Dataset Lite | Vai trò |
|---|---:|---:|---|
| `train` | 800.000 | 20.000 | Dùng để học |
| `val` | 10.000 | 1.000 | Theo dõi và chọn cách làm |
| `test` | 10.000 | 1.000 | Đánh giá cuối |

Không nên dùng `test` liên tục để sửa prompt hoặc chọn model. Nếu làm vậy, test dần trở thành một phần của quá trình phát triển và không còn là phép kiểm tra độc lập.

---

## 3. Giải thích các module Python

### 3.1. `parser.py` — biến bản ghi thô thành `Item`

Các hàm chính:

- `simplify(text_list)`: chuyển nội dung về chuỗi, bỏ xuống dòng/khoảng trắng dư và cắt độ dài.
- `scrub(title, description, features, details)`: xóa trường không cần, nối các phần mô tả và loại chuỗi giống mã sản phẩm.
- `get_weight(details)`: đọc trọng lượng và quy đổi pound, ounce, gram, milligram hoặc kilogram.
- `parse(datapoint, category)`: đọc giá, kiểm tra ngưỡng, làm sạch dữ liệu và trả về `Item`; trả về `None` nếu bản ghi không hợp lệ.

**Ý nghĩa thực tế:** module này là cổng kiểm soát chất lượng đầu vào. Dữ liệu chỉ đi tiếp khi có giá và mô tả đủ dùng.

### 3.2. `items.py` — schema và lưu dataset

`Item` kế thừa `pydantic.BaseModel`, giúp các sản phẩm có cấu trúc thống nhất.

- `make_prompt(text)`: tạo prompt có câu hỏi và giá thật, chủ yếu phục vụ thí nghiệm.
- `test_prompt()`: lấy phần prompt không chứa giá trả lời.
- `push_to_hub(...)`: chuyển danh sách `Item` thành `DatasetDict` gồm `train`, `validation`, `test` rồi đẩy lên Hugging Face.
- `from_hub(dataset_name)`: tải dataset và dựng lại các đối tượng `Item` bằng `model_validate()`.

**Ý nghĩa thực tế:** `Item` là mẫu phiếu chung giúp mọi bước sau dùng cùng một dạng dữ liệu.

### 3.3. `loaders.py` — tải nhiều category song song

`ItemLoader` nhận một category, tải cấu hình tương ứng từ Hugging Face rồi xử lý theo chunk `1000` bản ghi.

- `from_datapoint()`: gọi `parse()` cho một bản ghi.
- `from_chunk()`: xử lý một nhóm và bỏ các kết quả `None`.
- `chunk_generator()`: tạo các nhóm dữ liệu liên tiếp.
- `load_in_parallel()`: dùng `ProcessPoolExecutor` để xử lý nhiều chunk.
- `load()`: tải dataset, gọi xử lý song song và in thời gian thực hiện.

**Ý nghĩa thực tế:** chia chunk và xử lý song song giúp mở rộng từ một category sang hàng triệu bản ghi.

### 3.4. `batch.py` — tiền xử lý mô tả bằng Groq Batch API

`Batch` chia danh sách thành các nhóm `BATCH_SIZE = 1_000`.

- `make_jsonl(item)`: tạo một request JSONL có `custom_id`, endpoint, model và messages.
- `make_file()`: ghi các request của batch ra file.
- `send_file()`: upload file lên Groq và nhận `file_id`.
- `submit_batch()`: tạo công việc batch và nhận `batch_id`.
- `is_ready()`: kiểm tra trạng thái.
- `fetch_output()`: tải file kết quả.
- `apply_output()`: đọc `custom_id` rồi ghi summary vào đúng `items[id]`.
- `create()`, `run()`, `fetch()`: điều phối toàn bộ các batch.
- `save()` và `load()`: lưu/trả lại trạng thái bằng `pickle`.

**Điểm cốt lõi:** không ghép kết quả theo thứ tự dòng. Phải ghép theo `custom_id`, vì API có thể trả kết quả không đúng thứ tự đầu vào.

**Ý nghĩa thực tế:** module này biến một thử nghiệm trên một sản phẩm thành quy trình xử lý hàng chục nghìn sản phẩm có thể theo dõi và chạy lại.

### 3.5. `preprocessor.py` — gọi LLM cho một văn bản

`Preprocessor` là phiên bản đơn giản hơn cho xử lý từng văn bản.

- `messages_for(text)`: tạo system message và user message.
- `preprocess(text)`: gọi `litellm.completion()`, cộng dồn số token và chi phí, rồi trả nội dung summary.

Model mặc định là `groq/openai/gpt-oss-20b`, reasoning effort là `low`.

**Ý nghĩa thực tế:** module này phù hợp để thử prompt hoặc xử lý ít dữ liệu; với dữ liệu lớn, `Batch` phù hợp hơn.

### 3.6. `evaluator.py` — bộ chấm điểm dùng chung

`Tester` nhận một hàm dự đoán, dataset và số lượng mẫu.

1. Gọi predictor cho từng item, có thể dùng `ThreadPoolExecutor`.
2. Dùng `post_process()` để lấy số từ kết quả chuỗi như `$79.50`.
3. Tính sai số tuyệt đối.
4. Tô màu điểm dự đoán theo mức sai.
5. Vẽ biểu đồ dự đoán so với giá thật.
6. Vẽ đường xu hướng sai số trung bình và khoảng tin cậy 95%.
7. Tính MSE và R².

`evaluate(function, data, size=200, workers=5)` là hàm gọi tiện ích.

**MAE trong code** được tính qua `sum(errors) / size`, và `errors` là sai số tuyệt đối của từng item. MAE thấp hơn thường tốt hơn trên cùng bộ test.

**Lưu ý kỹ thuật:** `color_for()` chia cho `truth`, nên bài toán giả định giá thật dương. Dataset đã lọc giá tối thiểu `0.5`, vì vậy điều kiện này phù hợp với dữ liệu hiện tại.

### 3.7. `deep_neural_network.py` — mạng sâu chuyên dự đoán giá

- `ResidualBlock`: hai lớp tuyến tính, `LayerNorm`, `ReLU`, `Dropout` và skip connection.
- `DeepNeuralNetwork`: lớp đầu vào, nhiều residual block và một lớp đầu ra trả về một giá trị.
- `DeepNeuralNetworkRunner.setup()`: băm summary thành 5.000 đặc trưng, chuyển giá sang log scale, chuẩn hóa nhãn, chọn thiết bị và tạo DataLoader.
- `train()`: thực hiện forward, tính `L1Loss`, backward, gradient clipping, cập nhật optimizer và validation.
- `save()` / `load()`: lưu và tải trọng số.
- `inference()`: biến summary mới thành vector, dự đoán rồi đổi ngược từ log scale về giá.

Mạng này chuyên cho bài toán định giá, không phải chatbot tổng quát. `torch.cuda.is_available()` được ưu tiên, sau đó đến `mps`, cuối cùng là CPU.

---

## 4. Giải thích từng notebook

> Quy ước: các mục dưới đây dùng số Cell theo thứ tự xuất hiện trong notebook, không dùng mã định danh nội bộ của Jupyter.

### 4.1. `day1.ipynb` — tuyển chọn dữ liệu

#### Tóm tắt quy trình của notebook

Notebook tải một category để khảo sát, thử `parse()`, sau đó mở rộng sang nhiều category, loại trùng, phân tích phân bố, lấy mẫu có trọng số và đẩy dataset lên Hugging Face.

#### Giải thích từng Cell

| Cell | Nội dung và vai trò | Chốt ý nghĩa thực tế |
|---:|---|---|
| 1 | Giới thiệu dự án, nguồn dữ liệu và lộ trình 5 ngày. | Đặt mục tiêu trước khi viết code. |
| 2 | Tóm tắt quy trình và ý nghĩa của `parse()`, `Item`, `ItemLoader`. | Cho biết dữ liệu sẽ đi qua những bước nào. |
| 3 | HTML minh họa giá trị kinh doanh của chất lượng dữ liệu. | Nhắc rằng dữ liệu tốt thường quan trọng hơn tối ưu mù quáng. |
| 4 | Import thư viện và gọi `load_dotenv()`. | Chuẩn bị công cụ và biến môi trường. |
| 5 | Đọc `HF_TOKEN` và đăng nhập bằng `login()`. | Cho phép tải/đẩy dataset riêng tư hoặc có quyền truy cập. |
| 6 | Hướng dẫn lỗi tương thích `datasets`. | Giúp xử lý vấn đề môi trường trước khi chạy. |
| 7 | Tải `raw_meta_Appliances` bằng `load_dataset()`. | Bắt đầu kiểm tra dữ liệu thật. |
| 8 | In số lượng bản ghi. | Kiểm tra quy mô trước khi xử lý. |
| 9 | Xem `dataset[6]`. | Quan sát cấu trúc của một bản ghi gốc. |
| 10 | Tìm sản phẩm có giá cao nhất, bỏ qua giá lỗi. | Phát hiện phạm vi giá và outlier. |
| 11 | Ghi chú về sản phẩm giá cao được kiểm tra. | Nhắc rằng outlier chưa chắc là dữ liệu sai. |
| 12 | Dùng `parse()` cho Appliances và bỏ `None`. | Biến dữ liệu thô thành các `Item` hợp lệ. |
| 13 | In `items[0]`. | Kiểm tra schema sau chuẩn hóa. |
| 14 | In `items[0].full`. | Kiểm tra chất lượng văn bản đã làm sạch. |
| 15 | Tạo danh sách `prices` và `lengths`. | Chuẩn bị dữ liệu để khảo sát. |
| 16 | Vẽ histogram độ dài văn bản. | Nhìn xem mô tả thường dài bao nhiêu. |
| 17 | Tìm và in item có text dài nhất. | Kiểm tra trường hợp cực đoan. |
| 18 | Vẽ histogram giá. | Nhận biết dữ liệu có lệch về giá rẻ hay không. |
| 19 | In `items[3].full`. | Xem thêm một ví dụ thực tế sau làm sạch. |
| 20 | Dùng `ItemLoader` cho Appliances. | Kiểm tra quy trình tải tự động theo category. |
| 21 | Khai báo `dataset_names`. | Xác định các nhóm sản phẩm sẽ gộp. |
| 22 | Lặp qua categories và `items.extend(loader.load())`. | Tạo dataset lớn hơn từ nhiều nguồn. |
| 23 | In tổng số item. | Xác nhận quy mô sau khi gộp. |
| 24 | Xem `items[1000]`. | Kiểm tra ngẫu nhiên chất lượng dataset lớn. |
| 25 | `shuffle`, loại trùng theo `title`, rồi theo `full`. | Giảm nguy cơ một sản phẩm xuất hiện ở nhiều tập. |
| 26 | Vẽ lại phân bố độ dài sau dedupe. | Đánh giá ảnh hưởng của bước lọc. |
| 27 | Vẽ lại phân bố giá. | Kiểm tra độ lệch giá của dataset cuối. |
| 28 | Đếm và vẽ số lượng theo category. | Phát hiện category chiếm ưu thế. |
| 29 | Chuẩn hóa giá, tạo trọng số `w` và chọn `SIZE = 820_000`. | Điều chỉnh cơ hội chọn mẫu theo mục tiêu dự án. |
| 30 | Vẽ phân bố giá của `sample`. | Kiểm tra sample có phủ khoảng giá mong muốn không. |
| 31 | Xáo trộn `sample`. | Tránh dữ liệu cuối giữ một thứ tự có tính hệ thống. |
| 32 | Vẽ lại phân bố giá sau trộn. | Xác nhận việc trộn không phá dữ liệu. |
| 33 | Đếm và vẽ category trong sample. | Kiểm tra cân bằng tương đối sau lấy mẫu. |
| 34 | Vẽ donut chart category. | Nhìn tỷ lệ category trực quan hơn. |
| 35 | Scatter text size–price. | Kiểm tra độ dài mô tả có liên hệ đơn giản với giá không. |
| 36 | Scatter weight–price. | Kiểm tra trọng lượng có liên hệ đơn giản với giá không. |
| 37 | Ghi chú chuẩn bị đẩy dataset lên Hub. | Nhắc người học thay username nếu cần. |
| 38 | Chia `sample` thành `train`, `val`, `test`, rồi gọi `Item.push_to_hub()`. | Lưu dataset đã tuyển chọn để các ngày sau dùng lại. |
| 39 | Ghi chú về bảng màu Matplotlib. | Tài liệu tham khảo phụ cho việc vẽ biểu đồ. |

#### Mục tiêu cuối cùng

Kết thúc notebook, ta có dataset sạch, ít trùng, có phân bố được khảo sát và có thể tải lại từ Hugging Face.

### 4.2. `day2.ipynb` — tiền xử lý bằng LLM và batch

#### Tóm tắt quy trình của notebook

Notebook tải `items_raw_lite` hoặc `items_raw_full`, gắn `id`, thử prompt trên một item, so sánh Groq với Ollama, tạo JSONL, gọi Groq Batch API, ghép summary và đẩy dataset đã xử lý lên Hub.

#### Giải thích từng Cell

| Cell | Nội dung và vai trò | Chốt ý nghĩa thực tế |
|---:|---|---|
| 1 | Giới thiệu ngày 2 và mục tiêu chuẩn hóa mô tả. | Xác định LLM đang làm biên tập dữ liệu, chưa dự đoán giá. |
| 2 | HTML minh họa giá trị của tiền xử lý. | Cho thấy cùng một kỹ thuật có thể dùng trong nhiều lĩnh vực. |
| 3 | Import `completion`, `Batch`, `Item` và dotenv. | Chuẩn bị công cụ gọi model và xử lý dataset. |
| 4 | Giải thích lựa chọn Lite/Full và chi phí tham khảo. | Giúp chọn quy mô phù hợp tài nguyên. |
| 5 | Đặt `LITE_MODE = True`. | Chọn chạy nhanh với dữ liệu nhỏ. |
| 6 | Tạo tên dataset, gọi `Item.from_hub()`, gộp các tập. | Đưa toàn bộ item vào pipeline tiền xử lý. |
| 7 | Xem `items[2].id`. | Kiểm tra ID trước khi gán. |
| 8 | Gán `item.id = index`. | Tạo khóa để ghép output batch đúng item. |
| 9 | Khai báo `SYSTEM_PROMPT`. | Ép output có Title, Category, Brand, Description, Details. |
| 10 | In `items[0].full`. | Xem dữ liệu trước khi rewrite. |
| 11 | Gọi `completion()` với Groq và in token/chi phí. | Thử prompt trên một mẫu trước khi mở rộng. |
| 12 | Gọi Ollama `llama3.2` qua `api_base`. | So sánh lựa chọn local về chất lượng và chi phí. |
| 13 | Đặt `MODEL = "openai/gpt-oss-20b"`. | Chọn model dùng trong file batch. |
| 14 | Viết `make_jsonl(item)`. | Biến một item thành một request JSONL hợp lệ. |
| 15 | Hiển thị một `Item`. | Kiểm tra dữ liệu đầu vào của request. |
| 16 | Gọi `make_jsonl(items[0])`. | Kiểm tra cú pháp một dòng JSONL. |
| 17 | Viết `make_file(start, end, filename)`. | Tạo nhiều request trong một file. |
| 18 | Tạo file `jsonl/0_1000.jsonl`. | Chạy thử batch nhỏ trước khi chạy lớn. |
| 19 | Khởi tạo `Groq` bằng `GROQ_API_KEY`. | Kết nối tới dịch vụ batch. |
| 20 | Upload file bằng `groq.files.create()`. | Nhận `file_id` cho input. |
| 21 | Lưu `response.id` vào `file_id`. | Chuẩn bị tạo batch job. |
| 22 | Gọi `groq.batches.create()`. | Gửi công việc bất đồng bộ. |
| 23 | Gọi `groq.batches.retrieve()`. | Kiểm tra job đã hoàn thành chưa. |
| 24 | Tải output bằng `groq.files.content()`. | Lưu kết quả batch về máy. |
| 25 | Đọc từng dòng và dùng `custom_id`. | Ghép summary vào đúng item, không dựa vào thứ tự. |
| 26 | In `items[0].full`. | Đối chiếu dữ liệu gốc. |
| 27 | In summary của một item. | Kiểm tra output đã được ghi hay chưa. |
| 28 | Ghi chú về class `Batch`. | Giải thích vì sao nên đóng gói logic lặp lại. |
| 29 | Gọi `Batch.create()`. | Chia toàn bộ danh sách thành các batch 1.000 item. |
| 30 | Gọi `Batch.run()`. | Tạo, upload và submit tất cả batch. |
| 31 | Gọi `Batch.fetch()`. | Lấy các batch đã hoàn tất và áp dụng output. |
| 32 | Tìm item chưa có `summary`. | Kiểm tra độ đầy đủ của pipeline. |
| 33 | In summary ngẫu nhiên. | Kiểm tra chất lượng output bằng mắt. |
| 34 | Xóa `full` và `id`. | Giảm dữ liệu dư trước khi lưu bản đã xử lý. |
| 35 | Ghi chú quy trình push dataset cuối. | Nhắc khác biệt giữa Lite và Full. |
| 36 | Chia dataset và gọi `Item.push_to_hub()`. | Lưu `items_lite` hoặc `items_full` đã tiền xử lý. |
| 37 | Liên kết dataset kết quả trên Hub. | Cho phép tải lại kết quả thay vì chạy API lần nữa. |
| 38 | Cell Markdown rỗng. | Không có logic xử lý; có thể bỏ qua khi học. |

#### Mục tiêu cuối cùng

Mỗi `Item` có `summary` ngắn, nhất quán và sẵn sàng làm đầu vào cho mô hình dự đoán giá.

### 4.3. `day3.ipynb` — baseline và học máy truyền thống

#### Tóm tắt quy trình của notebook

Notebook dùng cùng `evaluate()` để so sánh từ mô hình ngẫu nhiên, giá trung bình, hồi quy theo đặc trưng đơn giản, hồi quy từ Bag of Words, Random Forest đến XGBoost.

#### Giải thích từng Cell

| Cell | Nội dung và vai trò | Chốt ý nghĩa thực tế |
|---:|---|---|
| 1 | Giới thiệu dự án, mục tiêu, quy trình và cấu trúc giải thích. | Đặt câu hỏi: mô hình có dự đoán tốt trên sản phẩm mới không? |
| 2 | Import thư viện. | Chuẩn bị dữ liệu, vectorizer, model và evaluator. |
| 3 | Đặt `LITE_MODE`. | Chọn quy mô dữ liệu chạy thử. |
| 4 | Tạo tên dataset và tải `train`, `val`, `test`. | Tách rõ dữ liệu học và dữ liệu đánh giá. |
| 5 | Định nghĩa `random_pricer()`. | Tạo baseline thấp nhất. |
| 6 | Seed 42 và đánh giá random pricer. | Đo mức sai khi không dùng thông tin sản phẩm. |
| 7 | Tính `training_average`, định nghĩa `constant_pricer()`. | Tạo baseline dùng một thống kê đơn giản. |
| 8 | Đánh giá `constant_pricer`. | Kiểm tra giá trung bình có tốt hơn đoán bừa không. |
| 9 | Định nghĩa `get_features()`. | Lấy weight, cờ thiếu weight và độ dài summary. |
| 10 | Tạo DataFrame train/test. | Đưa đặc trưng về dạng phù hợp với scikit-learn. |
| 11 | Fit `LinearRegression`, in hệ số, tính MSE/R². | Học quan hệ tuyến tính từ đặc trưng đơn giản. |
| 12 | Định nghĩa `linear_regression_pricer()`. | Đóng gói tạo feature và dự đoán một item. |
| 13 | Đánh giá hồi quy theo đặc trưng. | Đo khả năng tổng quát hóa trên test. |
| 14 | Tạo mảng `prices` và `documents`. | Chuẩn bị giá và văn bản cho Bag of Words. |
| 15 | Fit `CountVectorizer(max_features=2000)`. | Biến summary thành ma trận đếm từ. |
| 16 | In danh sách từ được chọn. | Kiểm tra vocabulary của vectorizer. |
| 17 | Fit `LinearRegression` trên ma trận từ. | Xem văn bản có tín hiệu giá hay không. |
| 18 | Định nghĩa `natural_language_linear_regression_pricer()`. | Dùng cùng vectorizer cho item mới. |
| 19 | Đánh giá NLP + Linear Regression. | So sánh lợi ích của việc dùng nội dung mô tả. |
| 20 | Fit `RandomForestRegressor` trên subset 15.000. | Thử mô hình phi tuyến dạng ensemble. |
| 21 | Giải thích Decision Tree và Random Forest. | Hiểu vì sao nhiều cây có thể giảm phụ thuộc vào một cây. |
| 22 | Định nghĩa `random_forest()`. | Đóng gói vector hóa và dự đoán. |
| 23 | Đánh giá Random Forest. | Đo cải thiện so với hồi quy tuyến tính. |
| 24 | Ví dụ lưu model bằng `joblib`. | Minh họa cách tái sử dụng model đã train. |
| 25 | Giới thiệu XGBoost và lưu ý môi trường. | Chuẩn bị cho mô hình boosting. |
| 26 | Import `xgboost as xgb`. | Cung cấp thư viện mô hình. |
| 27 | Tạo và fit `XGBRegressor`. | Học tuần tự để giảm lỗi còn lại. |
| 28 | Định nghĩa `xg_boost()`. | Đưa XGBoost vào cùng giao diện evaluator. |
| 29 | Đánh giá XGBoost. | Lấy mốc ML truyền thống mạnh nhất trong notebook. |
| 30 | HTML liên hệ kinh doanh. | Nhắc rằng thời gian, chi phí và độ chính xác phải xét cùng nhau. |
| 31–60 | Các cell Markdown giải thích tương ứng và cell rỗng cuối notebook. | Dùng để đọc lại khái niệm; không tạo thêm phép tính mới. |

> Notebook có 60 cell; các phần Markdown giải thích từ Cell 2 đến Cell 30 mở rộng ý nghĩa của cell code ngay trước đó. Cell 31–60 chủ yếu là phần diễn giải tiếp theo, vì vậy khi học nên đọc theo cặp: **cell code → cell giải thích**.

#### Kết quả demo cần nhớ

| Phương pháp | Sai số trung bình |
|---|---:|
| Random Pricer | 382,08 USD |
| Constant Pricer | 106,18 USD |
| Linear Regression với đặc trưng đơn giản | 101,56 USD |
| NLP + Linear Regression | 76,81 USD |
| Random Forest | 72,28 USD |
| XGBoost | 68,23 USD |

Kết luận quan trọng: thay đổi đầu vào từ `weight` và `text_length` sang nội dung từ vựng đã giúp cải thiện rõ rệt, dù vẫn dùng `LinearRegression`.

### 4.4. `day4.ipynb` — mạng nơ-ron và LLM

#### Tóm tắt quy trình của notebook

Notebook tạo human baseline trên 100 item, huấn luyện mạng nơ-ron PyTorch từ vector băm 5.000 chiều, rồi gọi nhiều LLM có sẵn qua LiteLLM để so sánh.

#### Giải thích từng Cell

| Cell | Nội dung và vai trò | Chốt ý nghĩa thực tế |
|---:|---|---|
| 1 | Giới thiệu ngày 4. | Chuyển từ ML truyền thống sang neural network và LLM. |
| 2 | Import PyTorch, `HashingVectorizer`, LiteLLM và evaluator. | Chuẩn bị toàn bộ công cụ thí nghiệm. |
| 3 | Đặt chế độ, load dotenv, đăng nhập Hugging Face. | Chuẩn bị quyền truy cập và môi trường. |
| 4 | Tải `train`, `val`, `test`. | Lấy dữ liệu đã tiền xử lý. |
| 5 | Ghi 100 summary ra `human_in.csv`. | Tạo bài kiểm tra cho người. |
| 6 | Đọc `human_out.csv`. | Nạp các dự đoán do người điền. |
| 7 | Định nghĩa `human_pricer()`. | Tra dự đoán theo vị trí item trong test. |
| 8 | In dự đoán và giá thật của một item. | Kiểm tra file trả lời đã khớp chưa. |
| 9 | Đánh giá human baseline trên 100 mẫu. | Biết nhiệm vụ khó đến mức nào với người. |
| 10 | Giới thiệu vanilla neural network. | Chuẩn bị mô hình tự huấn luyện. |
| 11 | Tạo `y` và `documents`. | Tách nhãn giá và mô tả. |
| 12 | Dùng `HashingVectorizer(n_features=5000)`. | Biến văn bản thành vector số cố định. |
| 13 | Định nghĩa 8 lớp `NeuralNetwork`. | Xây mạng từ 5.000 đầu vào đến 1 giá đầu ra. |
| 14 | Đổi dữ liệu thành tensor, split validation, tạo DataLoader. | Chuẩn bị dữ liệu cho vòng lặp PyTorch. |
| 15 | Đếm trainable parameters. | Biết quy mô mô hình. |
| 16 | Khai báo `MSELoss`, Adam và vòng lặp 2 epoch. | Thực hiện forward, loss, backward, optimizer. |
| 17 | Định nghĩa `neural_network()`. | Dùng mạng đã train cho một item mới. |
| 18 | Đánh giá mạng nơ-ron. | So sánh mạng tự huấn luyện với baseline. |
| 19 | Giới thiệu frontier models. | Chuyển sang mô hình đã được huấn luyện sẵn. |
| 20 | Định nghĩa `messages_for(item)`. | Chuẩn hóa prompt dự đoán giá. |
| 21 | In summary của test item. | Kiểm tra đầu vào gửi model. |
| 22 | Hiển thị messages. | Kiểm tra cấu trúc prompt. |
| 23 | Định nghĩa `gpt_4__1_nano()`. | Gọi GPT-4.1 nano qua LiteLLM. |
| 24 | Gọi model trên `test[0]`. | Thử một dự đoán trước khi đánh giá hàng loạt. |
| 25 | In giá thật. | Có điểm đối chiếu cho mẫu thử. |
| 26 | Đánh giá GPT-4.1 nano. | Đo LLM bằng cùng evaluator. |
| 27 | Định nghĩa `claude_opus_4_5()`. | Thử Claude với cùng prompt. |
| 28 | Đánh giá Claude. | So sánh trên cùng loại nhiệm vụ. |
| 29 | Định nghĩa `gemini_3_pro_preview()`. | Thử Gemini với reasoning thấp. |
| 30 | Đánh giá Gemini 3 trên 50 mẫu. | Ghi rõ quy mô nhỏ hơn các lần khác. |
| 31 | Định nghĩa `gemini_2__5_flash_lite()`. | Thử một model Gemini khác. |
| 32 | Đánh giá Gemini Flash Lite. | Đo thêm một lựa chọn tốc độ/chi phí khác. |
| 33 | Định nghĩa `grok_4__1_fast()`. | Thử Grok 4.1 Fast non-reasoning. |
| 34 | Đánh giá Grok. | So sánh thêm một frontier model. |
| 35 | Định nghĩa `gpt_5__1()`. | Thử GPT-5.1 với reasoning effort cao trong code notebook. |
| 36 | Đánh giá GPT-5.1. | Hoàn tất nhóm so sánh LLM. |
| 37–38 | Cell code rỗng. | Không có logic mới. |

#### Ý nghĩa cần nhớ

- Mạng nhỏ học từ dữ liệu của dự án.
- LLM ở các cell cuối chỉ được gọi để suy luận; không fine-tune trong notebook này.
- Có vector không có nghĩa đang dùng embedding ngữ nghĩa hoặc RAG.
- `HashingVectorizer` dùng 5.000 ô băm, không phải chọn đúng 5.000 từ phổ biến.

### 4.5. `day5.ipynb` — fine-tuning qua OpenAI API

#### Tóm tắt quy trình của notebook

Notebook chuẩn bị các cặp user–assistant, ghi thành JSONL, upload file train/validation, tạo fine-tuning job, theo dõi job, lấy model ID và đánh giá trên test.

#### Giải thích từng Cell

| Cell | Nội dung và vai trò | Chốt ý nghĩa thực tế |
|---:|---|---|
| 1 | Giới thiệu fine-tuning GPT-4.1 nano. | Xác định đây là huấn luyện bổ sung model có sẵn. |
| 2 | Import OpenAI, `Item`, `evaluate` và tiện ích. | Chuẩn bị API và bộ chấm điểm. |
| 3 | Chọn Lite/Full, load dotenv, đăng nhập Hugging Face. | Chuẩn bị dataset và token. |
| 4 | Tải train/val/test. | Tách dữ liệu cho các vai trò khác nhau. |
| 5 | Khởi tạo `OpenAI()`. | Kết nối API. |
| 6 | Ghi chú quy mô fine-tuning. | Nhắc chi phí và quy mô trong bài chỉ là tham khảo. |
| 7 | Lấy `fine_tune_train` và `fine_tune_validation`. | Tạo tập nhỏ để thực hành nhanh. |
| 8 | Kiểm tra `len(fine_tune_train)`. | Xác nhận số mẫu. |
| 9 | Giới thiệu Step 1 và JSONL. | Chuẩn bị dữ liệu đúng định dạng API. |
| 10 | Định nghĩa `messages_for(item)`. | Tạo câu hỏi và đáp án giá thật. |
| 11 | Xem messages của một item. | Kiểm tra mẫu huấn luyện. |
| 12 | Định nghĩa `make_jsonl(items)`. | Chuyển nhiều item thành JSON Lines. |
| 13 | In JSONL của ba item. | Kiểm tra cấu trúc trước khi ghi file. |
| 14 | Định nghĩa `write_jsonl()`. | Ghi dữ liệu ra file. |
| 15 | Ghi file train. | Tạo dữ liệu huấn luyện. |
| 16 | Ghi file validation. | Tạo dữ liệu theo dõi. |
| 17 | Upload train file. | Nhận `train_file.id`. |
| 18 | Hiển thị `train_file`. | Kiểm tra phản hồi upload. |
| 19 | Upload validation file. | Nhận `validation_file.id`. |
| 20 | Hiển thị `validation_file`. | Kiểm tra phản hồi upload. |
| 21 | Liên kết trang storage. | Tham khảo quản lý file. |
| 22 | Giới thiệu Step 2. | Chuyển từ upload sang tạo job. |
| 23 | Gọi `openai.fine_tuning.jobs.create()`. | Giao tác vụ cho dịch vụ huấn luyện. |
| 24 | Liệt kê job gần nhất. | Kiểm tra trạng thái job. |
| 25 | Lưu `job_id`. | Có mã để truy vấn job. |
| 26 | Hiển thị `job_id`. | Kiểm tra mã tác vụ. |
| 27 | Gọi `jobs.retrieve(job_id)`. | Xem chi tiết trạng thái và kết quả. |
| 28 | Gọi `list_events()`. | Xem sự kiện và thông tin huấn luyện. |
| 29 | Liên kết dashboard fine-tuning. | Tham khảo giao diện theo dõi. |
| 30 | Giới thiệu Step 3. | Chuẩn bị kiểm tra model mới. |
| 31 | Lấy `fine_tuned_model_name`. | Nhận model ID sau khi job hoàn tất. |
| 32 | Hiển thị model ID. | Xác nhận model dùng khi inference. |
| 33 | Định nghĩa `test_messages_for()`. | Tạo prompt test không chứa đáp án. |
| 34 | Kiểm tra prompt test. | Đảm bảo input khi đánh giá là đúng. |
| 35 | Định nghĩa `gpt_4__1_nano_fine_tuned()`. | Gọi model fine-tuned và lấy text giá. |
| 36 | In giá thật và dự đoán một item. | Kiểm tra nhanh đầu ra. |
| 37 | Đánh giá trên test. | Đo MAE và các chỉ số bằng evaluator chung. |
| 38 | Ghi chú các kết quả thử khác nhau. | Nhắc rằng kết quả phụ thuộc dữ liệu và cấu hình. |

#### Bài học quan trọng

`loss` trong supervised fine-tuning phản ánh khả năng dự đoán token của câu trả lời, không trực tiếp là số đô la sai lệch. Vì vậy loss giảm không đủ để kết luận giá dự đoán tốt hơn; phải gọi model trên test và tính sai số giá.

### 4.6. `redemption_train.ipynb` — huấn luyện DNN sâu

#### Tóm tắt quy trình của notebook

Notebook tải dataset, tạo `DeepNeuralNetworkRunner`, chạy 5 epoch, đánh giá và lưu trọng số.

| Cell | Nội dung và vai trò | Chốt ý nghĩa thực tế |
|---:|---|---|
| 1 | Giới thiệu notebook bổ sung. | Đây là hướng thử thêm, không bắt buộc cho mạch chính. |
| 2 | Import dotenv, Hugging Face, evaluator, runner, Item. | Chuẩn bị môi trường và mô hình. |
| 3 | Chọn mode và đăng nhập. | Chuẩn bị quyền truy cập dataset. |
| 4 | Tải `train`, `val`, `test`. | Nạp dữ liệu đã xử lý. |
| 5 | Tạo runner và gọi `setup()`. | Vector hóa, chuẩn hóa nhãn và dựng model. |
| 6 | Gọi `runner.train(epochs=5)`. | Huấn luyện mạng sâu qua nhiều vòng. |
| 7 | Định nghĩa predictor và gọi `evaluate()`. | Đánh giá mạng bằng cùng thước đo. |
| 8 | Gọi `runner.save()`. | Lưu trọng số để không phải train lại. |
| 9 | Cell code rỗng. | Không có xử lý mới. |

Kết quả được ghi trong notebook: model khoảng `289,128,449` tham số; validation MAE dao động quanh giữa 50 USD; kết quả test được tổng hợp ở mức khoảng `46.49 USD` trong bảng kết quả.

### 4.7. `redemption_run.ipynb` — tải và chạy DNN đã huấn luyện

#### Tóm tắt quy trình của notebook

Notebook không train lại từ đầu. Nó dựng đúng runner, tải `deep_neural_network.pth`, tạo hàm predictor rồi đánh giá.

| Cell | Nội dung và vai trò | Chốt ý nghĩa thực tế |
|---:|---|---|
| 1 | Giới thiệu file trọng số cần tải. | Cho biết dependency ngoài notebook. |
| 2 | Import các thành phần cần dùng. | Chuẩn bị pipeline inference. |
| 3 | Chọn mode và đăng nhập. | Chuẩn bị quyền tải dataset. |
| 4 | Tải dataset. | Cần cùng kiểu dữ liệu với lúc train. |
| 5 | Tạo runner và `setup()`. | Dựng đúng kiến trúc và vectorizer. |
| 6 | Hướng dẫn train hoặc tải file `.pth`. | Phân biệt train lâu với inference nhanh. |
| 7 | `runner.load(..., 'cpu')`. | Tải trọng số phù hợp Windows/CPU. |
| 8 | Định nghĩa `deep_neural_network()` và đánh giá. | Dùng model đã lưu để dự đoán. |
| 9–10 | Cell code rỗng. | Không có logic mới. |

### 4.8. `results.ipynb` — vẽ biểu đồ tổng hợp

| Cell | Nội dung và vai trò | Chốt ý nghĩa thực tế |
|---:|---|---|
| 1 | Khai báo `results`, tách labels/colors/values, vẽ biểu đồ cột Plotly. | So sánh trực quan sai số của các hướng. |
| 2–3 | Cell code rỗng. | Không có phép tính mới. |

Notebook này chỉ trực quan hóa các số đã ghi, không huấn luyện lại hoặc đánh giá lại model.

---

## 5. Bảng kết quả

Các con số dưới đây là kết quả được ghi trong notebook/note của khóa học, không phải benchmark hiện tại và không nên so sánh nếu quy mô mẫu, prompt hoặc dữ liệu khác nhau.

| Phương pháp | Sai số trung bình |
|---|---:|
| Constant | 106,18 USD |
| Linear Regression | 101,56 USD |
| NLP + Linear Regression | 76,81 USD |
| Random Forest | 72,28 USD |
| XGBoost | 68,23 USD |
| Human baseline | 87,62 USD |
| Neural Network | 63,97 USD |
| GPT-4.1 Nano | 62,51 USD |
| Grok 4.1 Fast | 57,62 USD |
| Gemini 3 Pro | 50,54 USD |
| Claude 4.5 Sonnet | 47,10 USD |
| GPT-5.1 | 44,74 USD |
| GPT-4.1 Nano fine-tuned | 75,91 USD |
| Deep Neural Network | 46,49 USD |

### Cách đọc kết quả

- Sai số thấp hơn là tốt hơn nếu cùng một bộ đánh giá.
- MAE là độ lệch giá trung bình, không phải phần trăm chính xác.
- Human baseline chỉ là kết quả của một người trên một số mẫu giới hạn.
- Gemini 3 được chạy trên 50 mẫu trong một lần thử; nhiều model khác dùng 200 mẫu.
- Fine-tuning đạt kết quả kém hơn model gốc trong lần thử chính, nhưng điều đó không chứng minh fine-tuning luôn có hại.
- DNN có nhiều dữ liệu và điều kiện khác, nên không thể quy toàn bộ cải thiện chỉ cho số lượng tham số.

---

## 6. Các điểm dễ nhầm

### 6.1. Batch processing không phải fine-tuning

`Batch` ở Ngày 2 chỉ gửi nhiều yêu cầu inference để LLM viết lại mô tả. Trọng số model không thay đổi.

Fine-tuning ở Ngày 5 mới là huấn luyện bổ sung, trong đó dịch vụ tạo một model ID mới.

### 6.2. Groq khác Grok

- **Groq:** nền tảng/API được dùng cho batch.
- **Grok:** model của xAI được thử ở Ngày 4.

### 6.3. `full`, `summary`, `price`

- `full` là dữ liệu mô tả đã làm sạch trước LLM.
- `summary` là mô tả được LLM chuẩn hóa.
- `price` là nhãn để học/chấm, không được đưa vào prompt test.

### 6.4. `HashingVectorizer` khác `CountVectorizer`

- `CountVectorizer`: học vocabulary và tạo cột cho các từ được chọn.
- `HashingVectorizer`: băm token vào số ô cố định, không lưu vocabulary đảo ngược.

Trong code, `n_features=5000` là 5.000 ô băm, không phải 5.000 từ phổ biến nhất.

### 6.5. Loss khác MAE

- Loss của mô hình sinh văn bản đo việc dự đoán token.
- MAE đo độ lệch giữa hai con số giá.

Một model có thể trả lời đúng định dạng nhưng vẫn đoán giá sai xa.

### 6.6. Train, validation, test khác nhau

- `train`: dùng để cập nhật tham số.
- `validation`: dùng để theo dõi và chọn cấu hình.
- `test`: chỉ dùng sau khi đã chốt phương án.

Nếu đáp án hoặc giá thật xuất hiện trong prompt test, kết quả bị rò rỉ và không còn đáng tin.

### 6.7. Trọng lượng có ba nghĩa khác nhau

- `item.weight`: cân nặng vật lý của sản phẩm.
- `sampling weight`: mức ưu tiên khi lấy mẫu ở Ngày 1.
- `model weight`: tham số bên trong mô hình.

### 6.8. Điểm số không phải toàn bộ quyết định

Khi chọn model thật, cần xem thêm:

- chi phí API hoặc chi phí phần cứng;
- thời gian phản hồi;
- khả năng chạy ổn định;
- định dạng output;
- độ dễ bảo trì;
- mức độ phù hợp với loại sản phẩm;
- chất lượng khi dữ liệu thị trường thay đổi.

---

## 7. Checklist học và chạy dự án

### Trước khi chạy

- [ ] Chọn Python environment đúng và cài các package trong `pyproject.toml`/`environment.yml`.
- [ ] Chuẩn bị biến môi trường phù hợp: `HF_TOKEN`, `GROQ_API_KEY`, hoặc `OPENAI_API_KEY`.
- [ ] Bắt đầu với `LITE_MODE = True` để kiểm tra pipeline.
- [ ] Kiểm tra các thư mục `jsonl`, `batches`, `output` nếu notebook cần ghi file.

### Khi xử lý dữ liệu

- [ ] Kiểm tra giá và mô tả trước khi chạy trên toàn dataset.
- [ ] Loại trùng trước khi chia train/validation/test.
- [ ] Dùng `custom_id` để ghép output batch.
- [ ] Kiểm tra một số `summary` bằng mắt.
- [ ] Bảo toàn dataset thô để có thể đối chiếu.

### Khi huấn luyện và đánh giá

- [ ] Chỉ fit vectorizer trên train; dùng `transform()` cho dữ liệu mới.
- [ ] Giữ test riêng khi chọn model hoặc prompt.
- [ ] So sánh với ít nhất một baseline đơn giản.
- [ ] Ghi lại model, prompt, số mẫu, seed và metric.
- [ ] Xem cả các dự đoán sai lớn, không chỉ nhìn MAE.
- [ ] Không coi một lần chạy nhỏ là kết luận phổ quát.

### Câu hỏi tự kiểm tra

1. Vì sao phải loại sản phẩm trùng trước khi chia tập?
2. Vì sao `summary` không được chứa `price` khi test?
3. `Batch.run()` có cập nhật trọng số model không?
4. Vì sao `CountVectorizer` cần `transform()` thay vì `fit_transform()` trên test?
5. `loss` của fine-tuning khác MAE như thế nào?
6. Vì sao DNN chuyên dụng có thể thắng LLM trong một nhiệm vụ hẹp nhưng không vì thế giỏi mọi nhiệm vụ?
7. Khi hai model có MAE gần nhau, cần xét thêm những yếu tố nào?

### Chốt ý nghĩa thực tế

Dự án cho thấy một hệ thống AI tốt bắt đầu từ câu hỏi rõ, dữ liệu được tổ chức cẩn thận và cách đánh giá công bằng. Mô hình nổi tiếng hoặc kiến trúc phức tạp không tự động tạo ra kết quả tốt. Quy trình đáng tin cậy là:

```text
Hiểu bài toán
    -> chuẩn bị dữ liệu
    -> tạo baseline
    -> thử nghiệm có kiểm soát
    -> đánh giá trên dữ liệu chưa thấy
    -> cân nhắc chi phí và vận hành
    -> theo dõi lại sau triển khai
```

> **Một câu cần nhớ:** dữ liệu tốt và phép đánh giá công bằng là nền móng; model chỉ là một phần của cả hệ thống.
