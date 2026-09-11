# Day 2 — Hiểu và sử dụng Hugging Face Pipelines

> **Bản giảng giải đầy đủ · Video 007–010 · Tuần 3, ngày 2 theo lời giảng.**
> Tài liệu được biên soạn từ toàn bộ phụ đề tiếng Anh của bốn video bạn gửi. Các ví dụ bổ sung được viết lại để dễ hiểu, không phải bản chép nguyên văn hay bản sao chính xác của notebook. Tôi chưa chạy các mô hình trên Colab để kiểm chứng đầu ra; các kết quả minh họa được ghi rõ.

## 1. Cả phần này thực sự muốn dạy bạn điều gì?

**Bạn có thể lấy một mô hình đã được người khác huấn luyện, tải nó về máy chạy Python, rồi dùng vài dòng code để giải quyết một công việc cụ thể.** Hugging Face Pipelines giúp đơn giản hóa quá trình đó.

Giảng viên chuyển liên tục từ phân tích cảm xúc sang nhận diện tên, dịch, tạo ảnh và đọc văn bản. Nhìn bên ngoài, chúng giống nhiều bài học rời rạc. Thực ra, giảng viên đang lặp lại cùng một cách làm:

1. Xác định **task — tác vụ** cần giải quyết.
2. Chọn **model — mô hình** phù hợp.
3. Tạo **pipeline — đối tượng đóng gói quy trình xử lý**.
4. Đưa dữ liệu vào và đọc kết quả.
5. Thử dữ liệu khó hơn hoặc đổi model để đánh giá chất lượng.

Mục tiêu không phải nhớ tên mọi mô hình. Mục tiêu là hiểu cách biến một model có sẵn thành một chức năng trong ứng dụng.

### Mục đích của từng video

| Video | Nội dung giảng viên trình bày | Điều bạn cần hiểu sau bài |
|---|---|---|
| 007 | Pipeline, inference, hai mức sử dụng thư viện, lưu ý Colab | Vì sao chỉ vài dòng code đã dùng được mô hình |
| 008 | Chuẩn bị T4 GPU, cài thư viện, đăng nhập, sentiment analysis, đổi model | Cách khởi tạo rồi tái sử dụng pipeline; model có thể đoán sai |
| 009 | NER, hỏi đáp, tóm tắt, dịch, zero-shot classification, GPT-2 | Chọn tác vụ theo đầu vào/đầu ra và ghép các tác vụ thành chức năng |
| 010 | Tạo ảnh bằng SDXL-Turbo, tạo tiếng nói bằng SpeechT5, quản lý bộ nhớ | Cách dùng mô hình ngoài văn bản và vì sao mỗi loại có yêu cầu riêng |

**Sau phần này, bạn đang học cách xây ứng dụng sử dụng AI. Bạn chưa huấn luyện một mô hình như ChatGPT từ đầu.**

## 2. Phân biệt các thành phần trước khi đọc code

| Thành phần | Vai trò | Liên hệ với lập trình web |
|---|---|---|
| Hugging Face Hub | Nơi tìm model, trọng số, cấu hình và tài liệu | Có nét giống nơi lưu repository và phân phối package |
| `transformers` | Thư viện Python để làm việc với nhiều mô hình văn bản, âm thanh, hình ảnh… | Một thư viện ứng dụng import để sử dụng |
| `diffusers` | Thư viện cho các hệ thống diffusion, trong bài dùng để tạo ảnh | Một thư viện khác cho nhóm công việc khác |
| `pipeline` | Lớp giao diện cấp cao, gom nhiều bước xử lý | Gần với một hàm tiện ích hoặc service đóng gói logic |
| Model weights — trọng số | Các giá trị mô hình đã học trong quá trình huấn luyện | Một tài nguyên cần nạp vào bộ nhớ; không chỉ là source code |
| Google Colab | Máy tính từ xa chạy notebook Python | Môi trường chạy chương trình |
| GPU / CUDA | Phần cứng và nền tảng tính toán cho GPU NVIDIA | Tài nguyên giúp thực hiện nhiều phép tính song song |

### “API” trong bài có phải REST API không?

Ở đây, **Pipelines API chủ yếu nói đến giao diện lập trình của thư viện Python**. Nó không mặc nhiên có nghĩa là gửi HTTP request cho Hugging Face để họ chạy model hộ bạn.

Trong cách dùng của bài học, model được tải từ Hub và nạp vào máy Colab. Khi bạn gọi pipeline, chính máy Colab thực hiện phép tính. Trình duyệt của bạn chỉ là nơi thao tác với notebook.

Nếu chạy code trên máy cá nhân, model sẽ chạy trên máy cá nhân theo cấu hình thiết bị. Việc tải model lần đầu vẫn cần truy cập kho lưu trữ. Đây là điểm khác với một dịch vụ inference qua mạng, nơi nhà cung cấp vận hành máy chạy model.

## 3. Video 007 — Pipeline đơn giản hóa điều gì?

### 3.1. Training và inference

**Training — huấn luyện:** dùng dữ liệu và thuật toán học để điều chỉnh trọng số, giúp model học cách làm một nhiệm vụ.

**Inference — chạy suy luận/dự đoán:** dùng trọng số đã có để xử lý một đầu vào.

Ví dụ:

- Cho model học từ nhiều review và nhãn tích cực/tiêu cực: training.
- Đưa một review mới vào để lấy nhãn: inference.
- Đưa 100 review khác vào pipeline: vẫn là inference; model không tự học thêm chỉ vì bạn gọi nhiều lần.

Inference có thể thực hiện với cả đầu vào từng xuất hiện trong dữ liệu học. Cách nói “dữ liệu mới” trong bài nhằm giải thích cách sử dụng phổ biến, không phải điều kiện định nghĩa inference.

### 3.2. Bên trong pipeline có gì?

Với văn bản, có thể hình dung ba công đoạn:

| Công đoạn | Việc xảy ra | Vì sao cần |
|---|---|---|
| Preprocessing — tiền xử lý | Tokenizer chuyển chữ thành dạng số model sử dụng | Model không trực tiếp tính toán trên chuỗi chữ như người đọc |
| Model inference | Model tính toán dựa trên đầu vào | Tạo điểm dự đoán hoặc token đầu ra |
| Postprocessing — hậu xử lý | Chuyển kết quả thành nhãn, câu trả lời hoặc văn bản | Ứng dụng nhận được dữ liệu dễ dùng |

Pipeline đóng gói những bước này. Bạn vẫn có thể dùng tokenizer và model trực tiếp khi cần kiểm soát chi tiết hơn. Hai mức API phục vụ hai mức nhu cầu; dùng mức thấp hơn không tự làm model thông minh hơn.

### 3.3. Hai bước quan trọng nhất

```python
from transformers import pipeline

# Bước 1: tạo đối tượng; có thể tải và nạp model tại đây.
analyzer = pipeline("sentiment-analysis")

# Bước 2: đưa dữ liệu vào để chạy tác vụ.
result = analyzer("I really like this lesson.")
print(result)
```

`analyzer` là một **đối tượng có thể gọi như hàm**. Tên biến do bạn đặt; `sentiment-analysis` là tên tác vụ mà thư viện nhận biết.

Bạn có thể tiếp tục gọi:

```python
print(analyzer("This explanation is confusing."))
print(analyzer("This example is useful."))
```

Không cần tạo lại pipeline cho mỗi câu. Lần đầu chậm có thể do tải model và khởi tạo; các lần gọi sau tái sử dụng model đã nạp. Cache trên đĩa và model trong RAM/VRAM là hai thứ khác nhau.

## 4. Video 008 — Chuẩn bị môi trường và phân tích cảm xúc

### 4.1. Cách hiểu phần cài đặt

Giảng viên chọn T4 GPU, xem lượng GPU RAM, cài package, import thư viện rồi đăng nhập Hugging Face.

- `pip install`: cài thư viện Python, gần với `npm install` về vai trò.
- `-q`: giảm lượng thông tin in ra.
- `--upgrade`: cho phép nâng cấp package theo các ràng buộc đưa vào; không có nghĩa luôn bắt buộc cài lại mọi thứ.
- `datasets==3.6.0`: ghim đúng phiên bản, gọi là **version pinning**. Video ghim phiên bản này để tương thích notebook vào thời điểm ghi hình.

Không nên suy ra rằng mọi dự án đều phải dùng `datasets==3.6.0`. Với notebook khóa học, ưu tiên bộ phiên bản tương thích của chính notebook.

**Phạm vi code trong tài liệu:** các ví dụ `transformers` dưới đây theo kiểu API v4, đối chiếu với tài liệu v4.57.1. Không mặc định rằng mọi task cũ hoạt động nguyên trạng ở phiên bản khác. Bạn có thể dùng cell sau cho các ví dụ văn bản trong một runtime học tập riêng; đây chưa phải bộ môi trường đã được kiểm thử đầy đủ:

```python
%pip install -q "transformers==4.57.1" sentencepiece
```

Nếu Colab yêu cầu restart sau cài đặt, thực hiện rồi chạy lại các cell import. Colab thường có sẵn PyTorch; cell trên không cài toàn bộ phụ thuộc của demo ảnh và tiếng nói. Tham khảo [Pipelines v4.57.1](https://huggingface.co/docs/transformers/v4.57.1/en/main_classes/pipelines).

Kiểm tra GPU:

```python
import torch

print("CUDA available:", torch.cuda.is_available())
if torch.cuda.is_available():
    print("GPU:", torch.cuda.get_device_name(0))

device = 0 if torch.cuda.is_available() else -1
```

Với các pipeline văn bản dưới đây, `0` chọn GPU đầu tiên; `-1` chọn CPU. Nhờ vậy, ví dụ vẫn có đường chạy CPU, dù tốc độ có thể khác.

### 4.2. Token đăng nhập: một điểm cần chỉnh lại từ video

Video nói token phải có quyền `write`. **Với việc tải model và chạy inference theo bài, không nên coi quyền ghi là điều kiện bắt buộc.** Quyền đọc phù hợp với đọc/tải tài nguyên; quyền ghi dành cho tạo hoặc đẩy nội dung lên repository. Một số model cần tài khoản được cấp quyền truy cập riêng. Xem [tài liệu User access tokens](https://huggingface.co/docs/hub/security-tokens).

Nếu notebook cần token, lưu trong Colab Secrets và bật quyền truy cập cho notebook đó. Không đưa token trực tiếp vào file chia sẻ. Nhiều model công khai có thể được tải không cần đăng nhập.

### 4.3. Sentiment analysis — phân tích sắc thái tích cực/tiêu cực

**Bài toán:** có một câu/review, muốn dự đoán sắc thái của nó.

Ví dụ bổ sung, dùng tên model rõ ràng để tránh phụ thuộc model mặc định:

```python
from transformers import pipeline

analyzer = pipeline(
    task="sentiment-analysis",
    model="distilbert/distilbert-base-uncased-finetuned-sst-2-english",
    device=device,
)

reviews = [
    "I am excited to learn AI.",
    "This lesson is frustrating.",
    "I should be more excited about this lesson.",
]

for text, result in zip(reviews, analyzer(reviews)):
    print(text, result)
```

Đầu ra có dạng minh họa:

```python
[{"label": "POSITIVE", "score": 0.99}]
```

- `label`: nhãn model chọn.
- `score`: điểm model gán cho dự đoán, thường được chuyển từ đầu ra model sang dạng xác suất.
- `0.99` **không chứng minh rằng hệ thống đúng 99% trên mọi dữ liệu thực tế**. Muốn biết chất lượng, phải đánh giá trên nhiều ví dụ có đáp án tham chiếu.

### 4.4. Tại sao giảng viên thử câu “I should be more excited…”?

Câu này gần nghĩa: “Lẽ ra tôi nên hào hứng hơn.” Có từ tích cực *excited*, nhưng ý cả câu có thể thể hiện chưa hào hứng hoặc thất vọng nhẹ.

Giảng viên cố tình đưa câu khó để cho thấy **model có thể bám vào tín hiệu bề mặt và phân loại chưa hợp lý**. Đây cũng là câu có thể có nhiều cách diễn giải, nên một ví dụ chưa đủ kết luận model tốt hay kém.

Sau đó, giảng viên đổi sang model dự đoán từ 1 đến 5 sao:

```python
star_analyzer = pipeline(
    "sentiment-analysis",
    model="nlptown/bert-base-multilingual-uncased-sentiment",
    device=device,
)
print(star_analyzer("I should be more excited about this lesson."))
```

Model này được fine-tune trên review sản phẩm bằng sáu ngôn ngữ: Anh, Hà Lan, Đức, Pháp, Tây Ban Nha và Ý. **Không có tiếng Việt trong danh sách fine-tuning được công bố.** Từ `multilingual` không có nghĩa dùng tốt với mọi ngôn ngữ. Xem [model card của NLP Town](https://huggingface.co/nlptown/bert-base-multilingual-uncased-sentiment).

Điều cần học: đổi model có thể đổi cả chất lượng lẫn tập nhãn đầu ra. `POSITIVE/NEGATIVE` và `1–5 stars` không phải hai thang đo giống hệt nhau. Không so trực tiếp hai điểm `score` để tuyên bố model nào tốt hơn.

## 5. Video 009 — Các tác vụ văn bản và mục đích thực tế

### 5.1. NER — Named Entity Recognition / nhận diện thực thể có tên

**Bài toán:** trong một câu, tìm những đoạn đề cập đến người, tổ chức, địa điểm…

Ví dụ bổ sung:

> “Alice works at Microsoft in London.”

Kết quả mong muốn về ý nghĩa: Alice là người, Microsoft là tổ chức, London là địa điểm. Đây là kỳ vọng để kiểm tra model, không phải đầu ra đã chạy xác nhận.

```python
ner = pipeline(
    "ner",
    model="dslim/bert-base-NER",
    aggregation_strategy="simple",
    device=device,
)

for entity in ner("Alice works at Microsoft in London."):
    print(entity)
```

Các nhãn thường thấy: `PER` — người; `ORG` — tổ chức; `LOC` — địa điểm; `MISC` — nhóm khác. Nhãn cụ thể phụ thuộc model.

Video cho thấy tên bị chia thành nhiều token. `aggregation_strategy="simple"` trong ví dụ bổ sung giúp gom các token được dự đoán liên quan thành cụm dễ đọc hơn. Nó không bảo đảm mọi thực thể được nhận diện đúng.

Các trường thường gặp gồm `word`, `entity_group`, `score`, `start`, `end`. `start/end` chỉ vị trí ký tự trong chuỗi đầu vào; đây là dữ liệu hữu ích nếu muốn tô màu thực thể trên giao diện web.

**Ứng dụng:** trích tên tổ chức trong tin tức, hỗ trợ tìm dữ liệu liên quan. Model NER tổng quát không mặc nhiên biết mã sản phẩm riêng như `ZENI-PRO-01`; với mã có cấu trúc, quy tắc hoặc tra cứu trực tiếp có thể phù hợp hơn.

### 5.2. Question answering — hỏi đáp dựa trên context

**Bài toán:** cung cấp một câu hỏi và một đoạn văn chứa thông tin trả lời.

```python
qa = pipeline(
    "question-answering",
    model="distilbert/distilbert-base-cased-distilled-squad",
    device=device,
)

result = qa(
    question="How long is the warranty?",
    context="The Zeni keyboard has a two-year warranty. Delivery takes three days.",
)
print(result)
```

Kỳ vọng về nội dung trả lời là “two-year”. Ở kiểu model này, hệ thống **chọn một đoạn văn bản trong context**: đó là **extractive QA — hỏi đáp trích xuất**.

Bạn không nên hiểu nó như chatbot luôn tự viết một câu trả lời đầy đủ. Nếu context thiếu đáp án, một số model vẫn chọn một đoạn không phù hợp; khả năng nhận biết “không có đáp án” tùy model và cấu hình.

### 5.3. Tại sao giảng viên liên hệ NER với RAG?

Giảng viên gợi ý: lấy tên sản phẩm từ câu hỏi, tra cơ sở dữ liệu, rồi đưa thông tin tìm được vào context để trả lời.

Ví dụ bổ sung:

1. Khách hỏi: “Bàn phím Zeni được bảo hành bao lâu?”
2. Ứng dụng xác định sản phẩm đang được hỏi.
3. Ứng dụng tra thông tin bảo hành trong database.
4. Ứng dụng đưa thông tin đó và câu hỏi cho hệ thống hỏi đáp.

**Phần quan trọng là ứng dụng phải tìm đúng thông tin trước. Pipeline QA không tự truy cập database giúp bạn.**

Một lệnh QA với context nhập sẵn chưa tạo thành hệ thống RAG hoàn chỉnh. RAG — *Retrieval-Augmented Generation / sinh câu trả lời có bổ sung thông tin truy xuất* — kết hợp bước tìm thông tin với bước sinh câu trả lời. Bài học mới giới thiệu các thành phần gợi mở ý tưởng đó; demo QA trích xuất chưa phải demo sinh câu trả lời theo RAG.

NER không phải thành phần bắt buộc của mọi RAG. Với trường bảo hành có cấu trúc rõ, đôi khi tra database rồi trả câu theo mẫu đã đủ.

### 5.4. Summarization — tóm tắt

**Bài toán:** rút ngắn văn bản mà vẫn giữ thông tin quan trọng.

Trong video, giảng viên đưa một đoạn mô tả dài về thư viện Transformers rồi dùng task `summarization` để thu gọn nó.

Cấu trúc minh họa theo API v4:

```python
summarizer = pipeline(
    "summarization",
    model="sshleifer/distilbart-cnn-12-6",
    device=device,
)

article = (
    "The team tested an AI feature for customer feedback. "
    "The feature groups reviews by sentiment so staff can inspect complaints. "
    "Short reviews were processed quickly, but ambiguous comments were harder. "
    "The team decided to review uncertain predictions before taking action."
)

print(summarizer(article, max_length=45, min_length=10, do_sample=False))
```

Các giới hạn độ dài ở đây liên quan đến **token**, không phải số từ tiếng Việt hay số ký tự. Không nên mặc định ném cả tài liệu dài vào một model: cần chú ý giới hạn đầu vào và kiểm tra thông tin bị bỏ hoặc sai lệch.

**Ứng dụng:** tạo bản xem trước bài viết, rút gọn ghi chú. Tóm tắt ngắn hơn chưa chắc đã đúng hoặc đủ ý.

### 5.5. Translation — dịch ngôn ngữ

Video minh họa dịch tiếng Anh sang tiếng Pháp và tiếng Tây Ban Nha. Mục tiêu là biết chọn mô hình đúng cặp ngôn ngữ.

Ví dụ bổ sung theo API v4:

```python
translator = pipeline(
    "translation_en_to_fr",
    model="google-t5/t5-small",
    device=device,
)
print(translator("This lesson explains how AI models work."))
```

Đừng chỉ thay hậu tố thành một ngôn ngữ bất kỳ rồi cho rằng model sẽ dịch được. Phải kiểm tra model có hỗ trợ nguồn/đích đó không; một số model đa ngôn ngữ còn yêu cầu mã ngôn ngữ riêng.

Với nhu cầu Anh–Việt, cần chọn model được thiết kế hoặc đánh giá cho cặp này. Model demo Anh–Pháp trong bài không phải bằng chứng về chất lượng dịch tiếng Việt.

### 5.6. Vì sao dùng model chuyên biệt khi chatbot cũng làm được?

Giảng viên muốn bạn thấy rằng nhiều công việc nhỏ có thể giải quyết bằng model chuyên biệt, thay vì luôn cần model hội thoại lớn.

| Hướng sử dụng | Điểm đáng cân nhắc |
|---|---|
| Model chuyên biệt chạy trên máy bạn quản lý | Có thể gọn, nhanh cho task phù hợp; bạn chịu trách nhiệm máy chạy và đánh giá |
| Model đa dụng qua dịch vụ API | Linh hoạt với nhiều yêu cầu; cần cân nhắc chi phí dịch vụ và cách tích hợp |

Không có kết luận “model nhỏ luôn rẻ hơn” cho mọi trường hợp. Cần xét chất lượng cần đạt, số request, độ trễ và chi phí vận hành. Thông điệp của bài là **chọn công cụ đủ phù hợp với bài toán**.

### 5.7. Zero-shot classification — phân loại không đưa ví dụ mẫu cho tác vụ đang gọi

**Bài toán:** cho một đoạn văn và một danh sách nhóm; nhờ model đánh giá đoạn văn thuộc nhóm nào.

```python
classifier = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli",
    device=device,
)

print(classifier(
    "The team released a new AI programming tool.",
    candidate_labels=["technology", "sports", "politics"],
))
```

Khác với sentiment model có bộ nhãn đã xác định, ở đây bạn truyền `candidate_labels` khi gọi. Cách đặt tên nhãn có thể ảnh hưởng kết quả.

**Zero-shot không có nghĩa model chưa từng được huấn luyện.** Model đã học trước; bạn chỉ không đưa các ví dụ đã gán nhãn cho những nhóm này trong lần gọi.

Video cho thấy nhóm technology có điểm cao nhất. Đừng coi những điểm ấy là xác suất khách quan đã được kiểm chứng. Nếu dữ liệu không thuộc nhóm nào mà chỉ đưa ba nhóm, hệ thống vẫn có thể ưu tiên một nhóm không thực sự phù hợp.

**Ứng dụng:** phân nhóm bài viết, định tuyến phản hồi. Nếu một đoạn được phép thuộc nhiều nhóm, cần hiểu chế độ nhiều nhãn như `multi_label=True`, thay vì mặc định chỉ chọn một.

### 5.8. Text generation — sinh văn bản với GPT-2

Giảng viên đưa một câu mở đầu, rồi để GPT-2 viết tiếp. Phần đầu nghe hợp lý nhưng sau đó đi lạc sang nội dung thiếu căn cứ.

```python
generator = pipeline("text-generation", model="openai-community/gpt2", device=device)

print(generator(
    "The most useful thing about learning AI is",
    max_new_tokens=45,
    do_sample=True,
    pad_token_id=generator.tokenizer.eos_token_id,
))
```

`max_new_tokens` giới hạn số token sinh thêm; `do_sample=True` cho phép lấy mẫu nên các lần chạy có thể khác nhau.

**Mục đích demo:** phân biệt văn bản có vẻ tự nhiên với thông tin đúng. GPT-2 cơ bản là model tiếp tục văn bản, không phải trợ lý đã được huấn luyện để làm theo mọi yêu cầu hội thoại.

Không nên lấy chất lượng GPT-2 trong demo để kết luận mọi model nhỏ hoặc mọi model có trọng số công khai đều kém. Đây là một ví dụ cụ thể để bạn nhìn thấy giới hạn của việc sinh tiếp token.

## 6. Video 010 — Tạo ảnh và tiếng nói

### 6.1. Image generation — tạo ảnh bằng SDXL-Turbo

Video quay lại prompt về lớp học AI theo phong cách pop art. Lần này, bạn cần nhìn ra cấu trúc: nạp pipeline, truyền prompt, lấy ảnh.

**Stable Diffusion** là tên dòng mô hình; **Stability AI** là tên công ty. Trong bài, giảng viên tự sửa nhầm lẫn tên gọi và dùng **SDXL-Turbo**.

Pipeline ảnh trong phần này thuộc `diffusers`; nó không phải cùng hàm `transformers.pipeline`. Hai thư viện cùng cung cấp cách dùng cấp cao nhưng không có API hoàn toàn giống nhau.

Về ý tưởng, hệ thống tạo ảnh từ nhiễu với điều kiện là mô tả văn bản. Pipeline gom việc xử lý prompt và quá trình tạo ảnh để người dùng không phải viết từng bước.

Ví dụ bổ sung dựa trên model card, chạy riêng khi đã cài `diffusers`, `accelerate`, `transformers` và có GPU CUDA đủ bộ nhớ:

```python
import torch
from diffusers import AutoPipelineForText2Image
from IPython.display import display

image_pipe = AutoPipelineForText2Image.from_pretrained(
    "stabilityai/sdxl-turbo",
    torch_dtype=torch.float16,
    variant="fp16",
).to("cuda")

image = image_pipe(
    prompt="A small classroom learning AI, vibrant pop art style",
    num_inference_steps=1,
    guidance_scale=0.0,
).images[0]

display(image)
```

`float16` dùng biểu diễn số 16-bit; `images[0]` lấy ảnh đầu tiên. Thiết lập một bước và `guidance_scale=0.0` phù hợp ví dụ SDXL-Turbo, không phải cấu hình chung cho mọi model tạo ảnh. Xem [SDXL-Turbo model card](https://huggingface.co/stabilityai/sdxl-turbo).

Video đề cập cảnh báo `torch_dtype`/`dtype`: xem tài liệu đúng phiên bản của **thư viện đang gọi** trước khi sửa; không thay hàng loạt tham số giữa các thư viện chỉ vì cùng xuất hiện từ “pipeline”.

Thời gian chờ trong video không phải cam kết tốc độ. Cần phân biệt thời gian tải/nạp model với thời gian tạo ảnh sau khi model đã sẵn sàng.

### 6.2. Audio generation trong bài là Text-to-Speech

**Text-to-Speech (TTS) — chuyển văn bản thành tiếng nói:** bạn đưa câu chữ, model tạo dữ liệu âm thanh để phát thành giọng đọc.

Đây là chiều ngược với **Speech-to-Text — chuyển tiếng nói thành văn bản**. Video này không trình bày demo nhận dạng giọng nói hay tạo nhạc.

Giảng viên dùng `microsoft/speecht5_tts`. Phần “thông tin đặc biệt mô tả giọng” được truyền thêm là **speaker embedding — vector đặc trưng người nói**. Nó giúp điều kiện hóa giọng đọc; không phải nội dung câu cần đọc. Xem [SpeechT5 model card](https://huggingface.co/microsoft/speecht5_tts).

Khung logic sau **chỉ để đọc hiểu**, chưa phải cell chạy độc lập: biến `speaker_embedding` cần được nạp từ nguồn vector phù hợp trước.

```python
synthesizer = pipeline(
    "text-to-speech",
    model="microsoft/speecht5_tts",
    device=device,
)

speech = synthesizer(
    "Welcome to this AI lesson.",
    forward_params={"speaker_embeddings": speaker_embedding},
)
```

Kết quả chứa dữ liệu `audio` và `sampling_rate` để phát hoặc ghi file. Nếu thiếu phần tạo speaker embedding hoặc thư viện cần thiết, chép riêng cell gọi TTS chưa đủ.

**Liên hệ ứng dụng học tiếng Anh:** có thể tạo giọng đọc cho câu ví dụ. Việc học pipeline không tự bảo đảm phát âm, giọng điệu hoặc ngôn ngữ nào cũng đạt yêu cầu; vẫn phải nghe kiểm tra.

### 6.3. Những đoạn vui ở cuối video có ý nghĩa gì?

Corgi mode, mèo/cua chạy trên màn hình và hiệu ứng “power” là phần trang trí mà giảng viên giới thiệu để tạo không khí. “Power” ở đoạn này không phải cách nâng sức mạnh GPU hay chất lượng model. Không cần học thuộc để hiểu AI.

Cuối bài, giảng viên báo trước nội dung tiếp theo: tokenizer, special tokens và chat templates. Đó là bước đi sâu vào những gì pipeline đang đóng gói.

## 7. Colab và bộ nhớ: hiểu để tránh sửa nhầm

Video liên tục nhắc xem GPU RAM vì mỗi model được giữ trong bộ nhớ. Tải thêm nhiều model vào cùng một phiên có thể làm cạn VRAM dù từng model riêng lẻ chạy được.

**Các ví dụ trong tài liệu là để học từng tác vụ, không nên chạy toàn bộ rồi giữ tất cả model trên GPU cùng lúc.** Chạy từng nhóm; restart khi chuyển sang ảnh hoặc tác vụ nặng nếu cần.

| Hiện tượng | Cần kiểm tra trước | Hướng xử lý |
|---|---|---|
| Khởi tạo lần đầu lâu | Model đang tải hay đang tính toán? | Chờ tải xong; lần sau có thể dùng cache |
| `CUDA is not available` | `torch.cuda.is_available()` và loại runtime | Kiểm tra đã được cấp GPU, PyTorch có hỗ trợ CUDA; không cài lại hàng loạt ngay |
| `CUDA out of memory` | Các model đang giữ trong GPU RAM | Giải phóng model không dùng hoặc restart session rồi chỉ nạp model cần |
| `ModuleNotFoundError` | Đã chạy cell cài thư viện trong runtime hiện tại chưa? | Cài đúng package rồi chạy lại import |
| Lỗi truy cập model | Quyền tải, token, tên model | Kiểm tra đúng tài nguyên và quyền đọc |
| Task không được nhận biết | Phiên bản thư viện đang dùng | Đối chiếu notebook và tài liệu đúng phiên bản |
| Deprecation warning | Cảnh báo đổi API gì, thuộc thư viện nào? | Ghi nhận và điều chỉnh có kiểm tra; không coi mọi warning là vô nghĩa |

Giảng viên nêu mất GPU như một nguyên nhân của lỗi CUDA. **Không phải mọi lỗi CUDA đều chứng minh Colab đã đổi máy của bạn sang CPU.** Cần kiểm tra thực trạng trước.

Phân biệt các thao tác:

- **Restart session:** khởi động lại tiến trình; mất biến và model đã nạp. Nếu vẫn cùng runtime, file và package đã cài thường còn.
- **Disconnect and delete runtime:** bỏ môi trường chạy hiện tại; khi có môi trường mới, cần cài lại và chạy từ đầu, tải lại các file cần thiết.
- **Clear outputs:** chỉ xóa kết quả hiển thị trong notebook; không thay cho giải phóng model hay reset môi trường.

## 8. Những hiểu nhầm cần tránh

| Dễ hiểu nhầm | Cách hiểu đúng hơn |
|---|---|
| Mọi pipeline dùng chung một model | Pipeline chọn và đóng gói model phù hợp với task |
| AI nào cũng là chatbot/LLM sinh văn bản | Nhiều model chỉ phân loại, trích xuất, tạo ảnh hoặc tạo tiếng nói |
| Pipeline tự học từ câu mình nhập | Gọi inference thông thường không cập nhật trọng số |
| `score` cao nghĩa là chắc chắn đúng | Điểm cao vẫn có thể đi kèm dự đoán sai |
| NER tự tra database | Code ứng dụng phải thực hiện bước tra cứu |
| Cung cấp context là đã có RAG đầy đủ | Còn phải xét việc truy xuất và cách sinh câu trả lời |
| “Multilingual” nghĩa là hỗ trợ tốt tiếng Việt | Cần kiểm tra ngôn ngữ, dữ liệu và kết quả thực tế |
| Model tải được thì mọi cách sử dụng đều miễn phí | Chi phí máy chạy và điều kiện sử dụng model là hai vấn đề riêng |

Video dùng “open source” theo nghĩa khá rộng để nói model được chia sẻ. Khi chọn model cho dự án, xem cả trọng số được cung cấp, model card và giấy phép; không suy ra mọi model đều có cùng quyền sử dụng. SDXL-Turbo chẳng hạn có phần hướng dẫn điều kiện sử dụng riêng trên [model card](https://huggingface.co/stabilityai/sdxl-turbo).

## 9. Liên hệ với tư duy front-end của bạn

Hãy hình dung một form nhập review trong React:

1. Người dùng nhập câu và bấm phân tích.
2. Front-end gửi câu đến backend ứng dụng.
3. Một service chạy Python gọi pipeline đã nạp sẵn.
4. Service trả kết quả có cấu trúc, chẳng hạn nhãn và điểm.
5. Front-end hiển thị kết quả để người dùng xem.

Đây là **ví dụ kiến trúc bổ sung**, không phải phần hệ thống web đã được xây trong video. Pipeline là thành phần xử lý AI; bạn vẫn cần viết phần nhận request, xác thực, xử lý lỗi và giao diện nếu muốn biến nó thành sản phẩm.

Với người đã biết JavaScript, phần mới quan trọng nhất ở đây là **chọn model, hiểu dữ liệu đầu vào/đầu ra, quản lý tài nguyên và đánh giá kết quả**. Cú pháp gọi hàm Python chỉ là lớp bên ngoài.

## 10. Bài thực hành ngắn để thật sự hiểu

### Bài 1 — Kiểm tra sentiment thay vì chỉ xem một câu

Tự viết 8 câu tiếng Anh gồm câu tích cực, tiêu cực, phủ định và mơ hồ. Ghi nhãn bạn kỳ vọng trước khi chạy. Sau đó xem câu nào model sai hoặc khó kết luận.

**Điều cần rút ra:** dữ liệu kiểm tra phải có tình huống khó; một câu demo đẹp chưa nói lên chất lượng hệ thống.

### Bài 2 — Làm rõ giới hạn context

Dùng ví dụ bảo hành ở mục 5.2. Đổi câu hỏi sang giá bán trong khi context không có giá.

**Điều cần rút ra:** thiếu thông tin đầu vào là vấn đề thật; hệ thống không nên biến một đoạn trích tùy tiện thành đáp án chắc chắn.

### Bài 3 — So sánh hai cách phân loại

Dùng cùng một câu cho sentiment và zero-shot classification.

**Điều cần rút ra:** sentiment hỏi “sắc thái ra sao?”, còn các nhãn technology/sports/politics hỏi “chủ đề gì?”. Cùng đầu vào nhưng hai task khác nhau.

### Tự kiểm tra trước khi sang bài tiếp theo

1. Model chạy trên máy nào khi dùng notebook Colab?
2. Tạo pipeline khác gì gọi pipeline?
3. Gọi pipeline nhiều lần có huấn luyện lại model không?
4. NER và QA mỗi cái trả lời câu hỏi gì?
5. Vì sao không thể coi mọi `score=0.99` là bảo đảm đúng?
6. Vì sao tạo ảnh dùng thư viện khác với sentiment trong bài?

**Đáp án ngắn:** (1) Máy runtime Colab. (2) Khởi tạo/nạp tài nguyên so với xử lý đầu vào. (3) Không. (4) Tìm thực thể so với tìm câu trả lời từ context. (5) Điểm model không thay thế đánh giá thực tế. (6) Bài dùng `diffusers` cho diffusion và `transformers` cho sentiment, với API riêng.

## 11. Phạm vi nguồn

Nội dung bài học bám theo bốn phụ đề gốc bạn gửi:

- **007 — Introduction to Hugging Face Pipelines for Quick AI Inference:** khái niệm và hai bước dùng pipeline, lưu ý Colab.
- **008 — HuggingFace Pipelines API for Sentiment Analysis on Colab T4 GPU:** thiết lập môi trường, inference, sentiment và đổi model.
- **009 — Named Entity Recognition, Q&A, and Hugging Face Pipeline Tasks:** sáu nhóm tác vụ văn bản và liên hệ truy xuất thông tin.
- **010 — Hugging Face Pipelines Image, Audio & Diffusion Models in Colab:** ảnh, tiếng nói, bộ nhớ và định hướng bài tiếp theo.

Giải thích về ứng dụng web, các câu ví dụ mới, bài tập và những điểm làm rõ kỹ thuật là phần biên soạn bổ sung. Các liên kết tài liệu chính thức được đặt ngay tại nội dung đối chiếu. Tài liệu ưu tiên giúp bạn hiểu bài; các đoạn code không thay thế notebook cùng bộ phụ thuộc đã được kiểm thử của khóa học.
