<!-- markdownlint-disable MD024 MD025 MD060 -->

# Week 3 — Ghi chú tổng hợp: Hugging Face, Tokenizer và tự chạy mô hình mã nguồn mở

> **Mục tiêu tuần:** chuyển từ "gọi dịch vụ AI có sẵn qua API" (Week 1-2) sang **tự tải và tự chạy model mã nguồn mở** trên máy có GPU (Google Colab), hiểu cách văn bản được token hóa, nhìn sơ lược cấu trúc bên trong một LLM (embedding, attention, MLP), và ghép nhiều model lại thành một sản phẩm nhỏ (công cụ tạo biên bản họp từ ghi âm).
>
> Tài liệu này tổng hợp nội dung Day 1–5 của Week 3 từ các bản ghi chú đã có: [AI_Week3_Day1_001-006_Tom_Tat.md](AI_Week3_Day1_001-006_Tom_Tat.md) / [-Day_Du.md](AI_Week3_Day1_001-006_Day_Du.md), [AI_Day_2_007-010_Tom_Tat.md](AI_Day_2_007-010_Tom_Tat.md) / [-Day_Du.md](AI_Day_2_007-010_Day_Du.md), [AI_Day3_011-014_TomTat.md](AI_Day3_011-014_TomTat.md) / [-DayDu.md](AI_Day3_011-014_DayDu.md), [AI_Day4_015-019_Tom_Tat.md](AI_Day4_015-019_Tom_Tat.md) / [-Day_Du.md](AI_Day4_015-019_Day_Du.md), [Day5_020-023_Tom_tat_nhanh.md](Day5_020-023_Tom_tat_nhanh.md) / [-Bai_giang_day_du.md](Day5_020-023_Bai_giang_day_du.md).
>
> **Lưu ý:** nội dung thực hành chính của tuần này chạy trên **Google Colab** (máy ảo có GPU trên cloud), không phải trên máy cá nhân — các notebook `day1.ipynb`–`day5.ipynb` trong repo chủ yếu dẫn sang Colab và ghi lại kết quả/giải thích.

## Mục lục

1. [Bức tranh toàn cảnh](#1-bức-tranh-toàn-cảnh)
2. [Ngày 1 — Hugging Face và Google Colab](#2-ngày-1--hugging-face-và-google-colab)
3. [Ngày 2 — Pipelines: dùng model có sẵn bằng vài dòng code](#3-ngày-2--pipelines-dùng-model-có-sẵn-bằng-vài-dòng-code)
4. [Ngày 3 — Tokenizer và Chat Template](#4-ngày-3--tokenizer-và-chat-template)
5. [Ngày 4 — Tự nạp và chạy LLM, quantization](#5-ngày-4--tự-nạp-và-chạy-llm-quantization)
6. [Ngày 5 — Ghép model thành sản phẩm: công cụ biên bản họp](#6-ngày-5--ghép-model-thành-sản-phẩm-công-cụ-biên-bản-họp)
7. [Bảng liên kết tài liệu nguồn](#7-bảng-liên-kết-tài-liệu-nguồn)
8. [Các điểm dễ nhầm trong cả tuần](#8-các-điểm-dễ-nhầm-trong-cả-tuần)
9. [Mục tiêu cuối cùng](#9-mục-tiêu-cuối-cùng)

---

## 1. Bức tranh toàn cảnh

### Tóm tắt quy trình của tuần

1. **Ngày 1:** làm quen Hugging Face Hub (Models/Datasets/Spaces) và Google Colab (máy ảo có GPU), chạy thử vài model tạo ảnh/giọng nói đầu tiên.
2. **Ngày 2:** dùng `pipeline()` của thư viện `transformers` để thực hiện nhiều tác vụ AI khác nhau (phân tích cảm xúc, nhận diện thực thể, hỏi-đáp, tóm tắt, dịch, zero-shot, sinh văn bản, sinh ảnh, TTS) chỉ bằng vài dòng code.
3. **Ngày 3:** nhìn sâu hơn một bước — hiểu **tokenizer** (bộ chia văn bản thành token) và **chat template** (cách sắp xếp hội thoại nhiều vai trò thành một chuỗi mà model hiểu được).
4. **Ngày 4:** tự nạp một LLM đầy đủ (không qua pipeline đóng gói sẵn), hiểu **quantization** (lượng tử hóa để giảm bộ nhớ) và cấu trúc bên trong (embedding → decoder blocks → LM head).
5. **Ngày 5:** ghép nhiều model lại (Whisper nhận dạng giọng nói + Llama viết văn bản) thành một sản phẩm thật: chuyển ghi âm cuộc họp thành bản nháp biên bản.

### Ý nghĩa chính của tuần

Week 3 trả lời câu hỏi: **"Nếu không muốn hoặc không thể trả phí API, liệu có thể tự chạy AI trên máy của mình (hoặc máy mượn miễn phí như Colab) không?"** — Câu trả lời là có, nhưng đổi lại bạn phải tự lo: tải model, chọn đúng phần cứng (GPU/VRAM), quản lý bộ nhớ (quantization), và hiểu rõ hơn cơ chế bên trong thay vì chỉ gọi một API "hộp đen".

```text
Hugging Face Hub (kho model + dataset)
    -> Google Colab (mượn máy có GPU để chạy)
    -> pipeline() (cách dùng nhanh, đóng gói sẵn)
    -> tokenizer + chat template (chuẩn bị đầu vào đúng định dạng)
    -> AutoModelForCausalLM + generate() (tự kiểm soát toàn bộ quá trình sinh văn bản)
```

---

## 2. Ngày 1 — Hugging Face và Google Colab

**Nguồn:** [day1.ipynb](day1.ipynb) · bài giảng đầy đủ [AI_Week3_Day1_001-006_Day_Du.md](AI_Week3_Day1_001-006_Day_Du.md) / tóm tắt [AI_Week3_Day1_001-006_Tom_Tat.md](AI_Week3_Day1_001-006_Tom_Tat.md) (bài 001–006).

### Tóm tắt quy trình

Ngày 1 giới thiệu quy trình chung của cả tuần: **tìm model đã huấn luyện sẵn trên Hugging Face → tải về máy có GPU (Colab) → dùng Python chạy model → tạo ra ảnh hoặc âm thanh.** Đây vẫn là **inference** (suy luận) — chưa tự huấn luyện một ChatGPT từ đầu.

### Kiến thức và thuật ngữ chính

| Tên | Vai trò |
|---|---|
| Hugging Face Hub | Kho tài nguyên AI trên web: **Models** (model đã huấn luyện), **Datasets** (dữ liệu), **Spaces** (demo đã triển khai) |
| `huggingface_hub` | Thư viện Python để thao tác với kho đó (đăng nhập, tải file...) |
| `transformers` | Thư viện chạy nhiều loại model (văn bản, âm thanh...) |
| `diffusers` | Thư viện dùng cho các pipeline sinh ảnh (diffusion model) |
| `datasets` | Thư viện nạp và xử lý dữ liệu |
| PEFT / TRL / Accelerate | Công cụ nâng cao cho fine-tuning/huấn luyện — sẽ cần đến ở Week 6-7 |
| Google Colab | Notebook chạy trên máy ảo từ xa (cloud), có thể gắn GPU miễn phí (không đảm bảo luôn khả dụng) |

**Ghi nhớ:** Hugging Face cung cấp *tài nguyên và thư viện*; Colab cung cấp *môi trường tính toán (GPU)*. Hai thứ độc lập nhau nhưng thường dùng chung.

### Quy trình thực hành cần nhớ khi làm việc trên Colab

1. Mở notebook, lưu bản sao vào Google Drive.
2. Chọn runtime có GPU, kết nối, kiểm tra bằng `!nvidia-smi`.
3. Cài thư viện cần thiết ngay trong runtime đó.
4. Nếu cần xác thực: tạo secret `HF_TOKEN`, đăng nhập Hugging Face.
5. Nạp model, đưa lên đúng thiết bị (GPU/CPU).
6. Gửi prompt, nhận kết quả (ảnh/âm thanh/văn bản), lưu lại nếu cần.
7. Tắt runtime khi dùng xong (tránh tốn tài nguyên/hạn mức).

**Lưu ý quan trọng:** restart session sẽ xóa toàn bộ biến và model đang nạp trong bộ nhớ (phải chạy lại từ đầu); xóa hẳn runtime còn mất cả môi trường đã cài. Lưu notebook **không đồng nghĩa** với lưu lại trạng thái máy đang chạy.

### Các demo trong bài 006 đã minh họa gì?

| Model | Minh họa điều gì |
|---|---|
| SDXL Turbo | Tạo ảnh nhanh, chạy trực tiếp trên GPU T4 |
| SDXL Base + Refiner | Hai giai đoạn xử lý nối tiếp (không phải chia train/test), cần nhiều bộ nhớ hơn |
| SpeechT5 | Chuyển văn bản thành giọng đọc (TTS) — không phải chatbot, không nhận dạng giọng nói |
| FLUX.1-schnell | Chạy trên GPU mạnh hơn (A100); cho thấy tải model về không đồng nghĩa máy chạy "miễn phí" hoàn toàn |

**"Inference steps"** là số bước xử lý khi *sinh* một đầu ra (ví dụ một bức ảnh), không phải số vòng *huấn luyện* — và tăng số bước không đảm bảo kết quả luôn đẹp hơn.

### Chốt ý nghĩa thực tế

Ngày 1 dựng nền tảng thao tác: biết mở đúng môi trường có GPU, biết phân biệt "model tải ở đâu" (Hugging Face) với "code chạy ở đâu" (Colab) — hai câu hỏi sẽ lặp lại suốt cả tuần.

---

## 3. Ngày 2 — Pipelines: dùng model có sẵn bằng vài dòng code

**Nguồn:** [day2.ipynb](day2.ipynb) · bài giảng đầy đủ [AI_Day_2_007-010_Day_Du.md](AI_Day_2_007-010_Day_Du.md) / tóm tắt [AI_Day_2_007-010_Tom_Tat.md](AI_Day_2_007-010_Tom_Tat.md) (bài 007–010).

### Tóm tắt quy trình

Notebook lặp lại một công thức duy nhất cho rất nhiều tác vụ khác nhau: **chọn task → chọn model → tạo `pipeline()` → đưa dữ liệu vào → đọc/đánh giá kết quả.**

```python
from transformers import pipeline

analyzer = pipeline("sentiment-analysis")   # tạo pipeline một lần
result = analyzer("This lesson is useful.") # gọi nhiều lần với dữ liệu khác nhau
```

### Bảng các tác vụ đã thử qua `pipeline()`

| Tác vụ | Đầu vào | Đầu ra / mục đích |
|---|---|---|
| Sentiment analysis (phân tích cảm xúc) | Một câu/review | Nhãn tích cực-tiêu cực (hoặc số sao, tùy model) |
| NER (Named Entity Recognition) | Một câu | Tìm tên người, tổ chức, địa điểm |
| Question answering | Câu hỏi + đoạn văn cho trước (context) | Trích đoạn trả lời từ context đó |
| Summarization | Đoạn văn dài | Bản rút gọn |
| Translation | Văn bản ngôn ngữ nguồn | Bản dịch |
| Zero-shot classification | Văn bản + danh sách nhãn tự đặt | Điểm phù hợp cho từng nhãn, dù model chưa từng học riêng các nhãn đó |
| Text generation | Câu mở đầu | Văn bản được viết tiếp (ví dụ GPT-2) |
| Image generation | Mô tả bằng chữ | Ảnh (dùng SDXL-Turbo) |
| Text-to-Speech | Văn bản | Giọng nói (dùng SpeechT5) |

### Những điều cần hiểu đúng

- **`score` (độ tin cậy) cao không đồng nghĩa kết quả đúng** — đó chỉ là độ tự tin của model, không phải chứng nhận độ chính xác trên dữ liệu của bạn.
- **Zero-shot không có nghĩa là "chưa huấn luyện"** — model đã học từ trước, chỉ là không cần ví dụ mẫu cho riêng tác vụ/nhãn đang gọi.
- **"Multilingual" không đảm bảo hỗ trợ tiếng Việt** — cần đọc kỹ model card để biết chính xác ngôn ngữ nào được huấn luyện.
- **Pipeline QA không tự tra cứu dữ liệu** — nếu ghép với NER + database để tìm context tự động, đó là bạn tự xây thêm phần logic, pipeline chỉ trả lời dựa trên context được đưa vào sẵn (một context nhập tay chưa phải là hệ thống RAG đầy đủ).
- **Sinh văn bản (GPT-2) không đảm bảo đúng sự thật** — câu nghe tự nhiên vẫn có thể chứa nội dung thiếu căn cứ.
- **Không giữ nhiều model cùng lúc trên GPU** để tránh hết VRAM; nên chạy lần lượt từng tác vụ.

### Chốt ý nghĩa thực tế

`pipeline()` là "phiên bản rút gọn" giúp bạn dùng thử rất nhanh hàng chục loại model khác nhau mà không cần hiểu chi tiết bên trong — đây là bước đệm hợp lý trước khi Ngày 3-4 mổ xẻ sâu hơn cách dữ liệu thực sự được xử lý.

---

## 4. Ngày 3 — Tokenizer và Chat Template

**Nguồn:** [day3.ipynb](day3.ipynb) · bài giảng đầy đủ [AI_Day3_011-014_DayDu.md](AI_Day3_011-014_DayDu.md) / tóm tắt [AI_Day3_011-014_TomTat.md](AI_Day3_011-014_TomTat.md) (bài 011–014).

### Tóm tắt quy trình

Notebook giải thích bước trung gian bắt buộc giữa "văn bản con người đọc được" và "con số model xử lý được": **tokenizer** chia văn bản thành token rồi ánh xạ sang token ID; **chat template** quy định cách sắp xếp một cuộc hội thoại nhiều vai trò (system/user/assistant) thành một chuỗi văn bản có cấu trúc mà model đã được huấn luyện để hiểu.

### Sáu khái niệm cốt lõi

| Thuật ngữ | Hiểu ngắn gọn |
|---|---|
| Token | Một mảnh văn bản — không nhất thiết là một từ hoàn chỉnh |
| Token ID | Số nguyên định danh token đó trong bộ từ vựng (vocabulary) của model |
| Tokenizer | Bộ chuyển đổi văn bản ⇄ token ID (`encode`/`decode`) |
| Vocabulary | Toàn bộ tập token mà một model "biết" |
| Special token | Token đánh dấu cấu trúc (bắt đầu văn bản, kết thúc lượt nói...) |
| Chat template | Quy tắc sắp xếp `messages` (system/user/assistant) thành chuỗi đúng định dạng model đã học |

**Lưu ý quan trọng:** Token ID **không phải** là vector — model sẽ tra ID đó ra một **embedding vector** tương ứng để tính toán tiếp; ID lớn hơn không có nghĩa là "quan trọng hơn".

### Các lệnh cần nhớ

| Lệnh | Dùng để làm gì |
|---|---|
| `AutoTokenizer.from_pretrained(model_id)` | Nạp đúng tokenizer đi kèm với model |
| `tok.encode(text)` | Chuyển văn bản thành danh sách token ID |
| `tok.decode(ids)` | Chuyển token ID về lại văn bản |
| `tok.decode(ids, skip_special_tokens=True)` | Giải mã và bỏ các token đặc biệt |
| `tok.apply_chat_template(messages, tokenize=False)` | Xem chuỗi hội thoại đã được định dạng (dạng văn bản) |
| `tok.apply_chat_template(messages, tokenize=True)` | Lấy luôn token ID của hội thoại đã định dạng |

`add_generation_prompt=True` chỉ yêu cầu template "mở sẵn" lượt trả lời của assistant — **nó không tự tạo ra câu trả lời**, model vẫn phải sinh tiếp phần đó.

### So sánh nhanh giữa các model

Llama, Phi-4-mini-instruct, DeepSeek V3.1, Qwen2.5-Coder mỗi model có cách chia token, bộ token ID và chat template **khác nhau**. Quy tắc quan trọng: **luôn dùng đúng tokenizer và đúng template của chính model đang chạy** — không thể lấy template của model này gán cho model khác. Số token ít hơn cũng không chứng minh model đó "tốt hơn".

### Chốt ý nghĩa thực tế

Hiểu tokenizer và chat template giúp bạn tự tin gỡ lỗi khi một model trả lời kỳ lạ (có thể do sai định dạng hội thoại đầu vào), và là kiến thức bắt buộc trước khi tự nạp model ở Ngày 4 — vì tokenizer sai sẽ khiến toàn bộ pipeline phía sau sai theo, dù model có "giỏi" đến đâu.

---

## 5. Ngày 4 — Tự nạp và chạy LLM, quantization

**Nguồn:** [day4.ipynb](day4.ipynb) · bài giảng đầy đủ [AI_Day4_015-019_Day_Du.md](AI_Day4_015-019_Day_Du.md) / tóm tắt [AI_Day4_015-019_Tom_Tat.md](AI_Day4_015-019_Tom_Tat.md) (bài 015–019).

### Tóm tắt quy trình

Đây là bước "tháo hộp đen" của pipeline: notebook tự tay nạp tokenizer + model, chuyển hội thoại thành tensor, đẩy lên GPU, gọi `model.generate()`, rồi tự giải mã kết quả — đồng thời học cách **quantization** (lượng tử hóa) giúp model lớn vẫn chạy vừa bộ nhớ GPU giới hạn.

### Đường đi của một câu hỏi (bắt buộc phải hiểu)

1. **Messages** — ứng dụng tạo nội dung hội thoại với vai trò user/assistant.
2. **Chat template + tokenizer** — định dạng hội thoại rồi chuyển thành token ID (`return_tensors="pt"` để có tensor PyTorch, `.to("cuda")` để đưa lên GPU).
3. **Embedding** — mỗi token ID được đổi thành một vector số đã học.
4. **Decoder blocks** — nhiều lớp liên tiếp, mỗi lớp có **attention** (kết hợp thông tin ngữ cảnh từ các token liên quan) và **MLP** (biến đổi phi tuyến đặc trưng tại từng vị trí).
5. **LM head** — tạo ra điểm số (logits) cho các token ứng viên tiếp theo.
6. **`generate()`** — chọn token, lặp lại quá trình; **`tokenizer.decode()`** chuyển kết quả cuối về lại văn bản đọc được. `TextStreamer` giúp hiển thị dần từng phần.

### Quantization (lượng tử hóa) — vì sao cần?

Ý tưởng: lưu mỗi trọng số của model bằng **ít bit hơn** để giảm dung lượng, đổi lại có sai số nhỏ.

$$\text{Dung lượng lý tưởng} = \text{số tham số} \times \text{số bit} \div 8$$

| Model 1 tỷ tham số | Dung lượng lý tưởng |
|---|---:|
| 32-bit | 4 GB |
| 16-bit | 2 GB |
| 4-bit | 0,5 GB |

Đây **chưa phải** tổng VRAM cần khi chạy thực tế (còn cache, tensor trung gian...); giảm từ 16-bit xuống 4-bit cũng **không** đảm bảo chạy nhanh gấp 4 lần. **NF4** là một cách mã hóa 4-bit, **double quantization** giảm thêm dữ liệu phụ trợ — đây là kỹ thuật sẽ gặp lại dưới tên **QLoRA** ở Week 7.

### Cấu trúc bên trong một LLaMA nhỏ (ví dụ minh họa từ bài giảng)

| Bộ phận | Vai trò dễ nhớ |
|---|---|
| Token embedding | Tra token ID để lấy vector |
| RoPE | Cung cấp thông tin vị trí cho attention |
| Attention | Lấy thông tin từ các token liên quan trong phạm vi được phép nhìn |
| MLP + SiLU | Biến đổi phi tuyến đặc trưng tại từng vị trí |
| RMSNorm + residual | Giữ ổn định giá trị và giúp thông tin truyền xuyên suốt nhiều lớp |
| LM head | Tạo logits, có thể chuyển thành xác suất bằng softmax |

**Vì sao cần phép biến đổi phi tuyến (như SiLU)?** Nếu chỉ có các phép biến đổi tuyến tính nối tiếp nhau (`y = 2x`, `z = 3y`), kết quả cuối vẫn chỉ là một phép tuyến tính duy nhất (`z = 6x`). Thêm một hàm phi tuyến giúp mạng biểu diễn được các quan hệ phức tạp hơn một đường thẳng.

### Thử nhiều model cho thấy gì?

LLaMA, Phi và Qwen tạo được câu chuyện cười hoàn chỉnh trong lần demo; Gemma 270M dừng giữa chừng; DeepSeek bản distilled sinh phần "suy luận" (reasoning) dài nhưng chưa kịp trả lời khi hết giới hạn token. **Đây là quan sát của một buổi demo cụ thể, không phải bảng xếp hạng chất lượng chung.**

### Chốt ý nghĩa thực tế

Ngày 4 là "phòng máy" thật sự của cả tuần: hiểu quantization giúp bạn ước lượng được một model có vừa GPU của mình không trước khi tải về, còn hiểu sơ lược kiến trúc bên trong giúp không hoang mang khi gặp các thuật ngữ (embedding, attention, logits) ở các tuần fine-tuning sau này (Week 6-7).

---

## 6. Ngày 5 — Ghép model thành sản phẩm: công cụ biên bản họp

**Nguồn:** [day5.ipynb](day5.ipynb), [visualizer.py](visualizer.py) · bài giảng đầy đủ [Day5_020-023_Bai_giang_day_du.md](Day5_020-023_Bai_giang_day_du.md) / tóm tắt [Day5_020-023_Tom_tat_nhanh.md](Day5_020-023_Tom_tat_nhanh.md) (bài 020–023).

### Tóm tắt quy trình

Ngày cuối tuần ghép hai model khác chức năng lại với nhau để giải quyết một bài toán thật: **chuyển file ghi âm cuộc họp thành bản nháp biên bản (meeting minutes)**, sau đó giao bài tập tự xây một công cụ sinh dữ liệu giả (Synthetic Data Generator).

### Cách LLM sinh văn bản, nhắc lại cho rõ (bài 020)

Model chọn token tiếp theo dựa trên xác suất, rồi lặp lại nhiều lần:

| Chiến lược | Cách chọn token |
|---|---|
| Greedy | Luôn chọn token có xác suất cao nhất |
| Sampling | Chọn ngẫu nhiên theo đúng phân bố xác suất |
| Temperature | Điều chỉnh mức "ngẫu nhiên" khi lấy mẫu — không làm model biết nhiều hơn |

**Xác suất cao không đảm bảo câu đúng**, và temperature thấp cũng không đảm bảo kết quả giống hệt nhau giữa các lần chạy.

### Hai bước AI của công cụ biên bản họp (bài 021–022)

| Bước | Model làm gì | Kết quả |
|---|---|---|
| 1 | Whisper (`openai/whisper-medium.en` hoặc API `gpt-4o-mini-transcribe`) nhận dạng giọng nói | **Transcript** — bản chép lời |
| 2 | Llama đọc transcript theo một prompt cụ thể | **Meeting minutes** — biên bản họp dạng Markdown |

**Transcript ghi lại lời nói; biên bản phải chắt lọc ra nội dung đáng lưu** (tóm tắt, chủ đề, quyết định, công việc kèm người phụ trách/thời hạn). Prompt viết biên bản nên có ba quy tắc an toàn:

1. Chỉ dùng thông tin có trong transcript.
2. Thiếu người phụ trách hoặc thời hạn → ghi rõ **"Chưa xác định"**, không tự bịa.
3. Không biến một đề xuất còn đang bàn thành một quyết định đã chốt.

**Lưu ý:** `.en` trong tên model Whisper nghĩa là bản chỉ tối ưu cho tiếng Anh — muốn dùng cho audio tiếng Việt cần chọn biến thể đa ngôn ngữ phù hợp. Vì ứng dụng xử lý cả âm thanh lẫn văn bản, đây là một ví dụ khác của **multimodal**.

### Bài tập: Synthetic Data Generator (bài 023)

Xây một công cụ để người dùng mô tả loại dữ liệu và cấu trúc mong muốn, model sinh ra dữ liệu mẫu (ví dụ: ticket hỗ trợ, bình luận sản phẩm giả để thử giao diện). Gợi ý cách làm: định nghĩa schema → sinh một số bản ghi mẫu → parse JSON → kiểm tra trường/giá trị hợp lệ → xử lý lỗi hoặc trùng lặp → thử với model/cấu hình khác. **Bài 023 chỉ giao đề bài, chưa có lời giải đầy đủ trong bài giảng.**

### Chốt ý nghĩa thực tế

Ngày 5 là bằng chứng cụ thể cho nguyên lý "ghép nhiều model chuyên biệt lại với nhau" (một model giỏi nghe, một model giỏi viết) thay vì kỳ vọng một model làm được mọi việc — nguyên lý này sẽ xuất hiện trở lại rõ nét hơn ở các Agent nhiều thành phần của Week 8.

---

## 7. Bảng liên kết tài liệu nguồn

| Ngày | Notebook / code | Ghi chú tiếng Việt (Tóm tắt / Đầy đủ) |
|---|---|---|
| Ngày 1 | [day1.ipynb](day1.ipynb) | [AI_Week3_Day1_001-006_Tom_Tat.md](AI_Week3_Day1_001-006_Tom_Tat.md) / [-Day_Du.md](AI_Week3_Day1_001-006_Day_Du.md) |
| Ngày 2 | [day2.ipynb](day2.ipynb) | [AI_Day_2_007-010_Tom_Tat.md](AI_Day_2_007-010_Tom_Tat.md) / [-Day_Du.md](AI_Day_2_007-010_Day_Du.md) |
| Ngày 3 | [day3.ipynb](day3.ipynb) | [AI_Day3_011-014_TomTat.md](AI_Day3_011-014_TomTat.md) / [-DayDu.md](AI_Day3_011-014_DayDu.md) |
| Ngày 4 | [day4.ipynb](day4.ipynb) | [AI_Day4_015-019_Tom_Tat.md](AI_Day4_015-019_Tom_Tat.md) / [-Day_Du.md](AI_Day4_015-019_Day_Du.md) |
| Ngày 5 | [day5.ipynb](day5.ipynb), [visualizer.py](visualizer.py) | [Day5_020-023_Tom_tat_nhanh.md](Day5_020-023_Tom_tat_nhanh.md) / [-Bai_giang_day_du.md](Day5_020-023_Bai_giang_day_du.md) |

---

## 8. Các điểm dễ nhầm trong cả tuần

1. **Hugging Face Hub (kho tài nguyên) khác Google Colab (máy tính chạy code)** — model tải *từ* Hugging Face nhưng chạy *trên* Colab.
2. **Restart runtime sẽ xóa model/biến đang nạp trong bộ nhớ** — không giống việc chỉ đóng và mở lại file.
3. **`pipeline()` là cách dùng rút gọn, không phải REST API gửi dữ liệu cho Hugging Face xử lý hộ** — model thật sự chạy ngay trên máy Colab của bạn sau khi được tải về.
4. **Zero-shot classification không có nghĩa "model chưa học gì"** — chỉ là không cần ví dụ mẫu cho riêng nhãn/tác vụ đang gọi.
5. **Token ID không phải là vector** — model tra ID đó ra một embedding vector để tính toán, ID lớn hơn không có nghĩa "quan trọng hơn".
6. **Chat template khác nhau giữa các model** — không thể dùng template của model này cho model khác.
7. **Quantization (4-bit, 8-bit...) chỉ giảm cách lưu trọng số, không phải tổng VRAM cần khi chạy thực tế** (còn cache, tensor trung gian...).
8. **`max_new_tokens` giới hạn số token mới sinh ra, không phải số từ** — một từ có thể chiếm nhiều hơn một token.
9. **Streaming (hiện chữ dần) không làm model chính xác hơn** — chỉ giúp người dùng thấy kết quả sớm hơn.
10. **Transcript (bản chép lời) khác Biên bản (bản đã chắt lọc nội dung)** — không nên nhầm hai khái niệm hoặc bỏ qua bước tóm lược khi xây ứng dụng tương tự.

---

## 9. Mục tiêu cuối cùng

Sau khi học xong Week 3, người học có thể:

- Phân biệt rõ vai trò của Hugging Face Hub (kho tài nguyên) và Google Colab (môi trường tính toán có GPU).
- Dùng `pipeline()` để thử nhanh nhiều tác vụ AI khác nhau (văn bản, ảnh, âm thanh) mà không cần hiểu chi tiết bên trong.
- Giải thích được tokenizer, token ID, embedding, và cách `apply_chat_template` chuẩn bị hội thoại nhiều vai trò cho model.
- Tự nạp một LLM bằng `AutoTokenizer`/`AutoModelForCausalLM`, gọi `generate()` và hiểu sơ lược cấu trúc bên trong (attention, MLP, LM head).
- Ước lượng được bộ nhớ cần thiết để chạy một model ở các mức quantization khác nhau (32-bit/16-bit/4-bit).
- Ghép nhiều model chuyên biệt (nghe + viết) thành một sản phẩm hoàn chỉnh, như công cụ tạo biên bản họp từ ghi âm.
- Tiếp tục phân biệt rõ: toàn bộ tuần vẫn là **inference** (tự chạy model có sẵn) — bước **huấn luyện/tinh chỉnh (fine-tuning)** thật sự chỉ bắt đầu từ Week 6-7.
