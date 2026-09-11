# Tokenizers và Chat Templates — Hiểu đầu vào của LLM

> Bản giảng giải đầy đủ bằng tiếng Việt • Video 011–014, Week 3 / Day 3.
> Cơ sở biên soạn: đọc toàn bộ phụ đề tiếng Anh của 4 video được cung cấp. Đây là bài giảng được tổ chức lại, không phải bản dịch nguyên văn hay bản chép mã từ màn hình. Các ví dụ và phần “Giải thích bổ sung” do tôi biên soạn; tài liệu Hugging Face được dùng để đối chiếu những chi tiết API dễ nhầm.

## 1. Cả phần này thực sự muốn dạy bạn điều gì?

**Mục tiêu chính: hiểu câu chữ và lịch sử hội thoại được chuẩn bị như thế nào trước khi đưa vào mô hình ngôn ngữ.**

Trước đó, bạn gọi API hoặc dùng `pipeline(...)`: truyền nội dung vào và nhận kết quả. Nhiều bước được thư viện làm sẵn nên bạn chưa cần nhìn bên trong.

Ở đây, giảng viên mở một phần của quy trình đó: **tokenizer**. Ngày học này chuẩn bị cho bước tiếp theo là tự chạy **model inference (suy luận bằng mô hình)**. Bạn chưa cần huấn luyện LLM, chưa cần học toán Transformer, cũng chưa cần tải trọng số mô hình để làm các bài tokenization.

| Video | Vấn đề cần hiểu | Điều bạn nên làm được sau bài |
|---|---|---|
| 011 — How LLMs Convert Text to Numbers | Vì sao phải đổi chữ thành số? Token khác token ID thế nào? | Giải thích được vai trò tokenizer và special token |
| 012 — Encoding and Decoding with Llama 3.1 | Quan sát phép đổi chữ → ID → chữ bằng code | Dùng `encode`, `decode`, kiểm tra từng token |
| 013 — Chat Templates and Special Tokens | Một mảng `messages` trở thành đầu vào mô hình ra sao? | Hiểu `apply_chat_template` và phần mở đầu lượt assistant |
| 014 — Comparing Tokenizers | Vì sao Llama, Phi, DeepSeek, Qwen có cách biểu diễn khác nhau? | Chọn tokenizer đúng model và đọc kết quả so sánh |

**Câu hỏi xuyên suốt:** “Tôi gửi một câu hỏi và vai trò `user`; ở bên trong, mô hình thực sự nhận được gì?”

## 2. Video 011 — Tokenizer: bộ chuyển văn bản thành token ID

### 2.1. Phân biệt ba thứ trước tiên

| Khái niệm | Ý nghĩa | Ví dụ minh họa |
|---|---|---|
| Text — Văn bản | Chuỗi ban đầu | `Hello world!` |
| Token — Đơn vị văn bản | Một mảnh mà tokenizer biểu diễn | `Hello`, ` world`, `!` |
| Token ID — Mã token | Số nguyên định danh token trong bộ từ vựng | `[101, 202, 303]` |

**Cách chia và các ID trên là giả định để minh họa, không phải kết quả thật của Llama.**

Một token không nhất thiết là một từ. Nó có thể là một phần của từ, dấu câu, khoảng trắng, chuỗi ký tự hay một đơn vị liên quan đến byte. Vì vậy, đếm từ bằng `split()` không cho bạn số token thực tế.

Tokenizer xác định cách chia văn bản và ánh xạ những đơn vị đó sang ID. **Vocabulary (bộ từ vựng)** chứa các token và mã tương ứng. Để dễ hình dung, bạn có thể nghĩ tới một bảng tra cứu; thực tế tokenizer còn có quy tắc xử lý và phân tách văn bản, chứ không chỉ tra từng từ.

### 2.2. Vì sao LLM cần số?

Các phép tính bên trong mạng neural làm việc với giá trị số. Với luồng văn bản đang học, tokenizer tạo các ID, rồi mô hình chuyển những ID đó thành biểu diễn vector để tính toán.

Quy trình khái quát:

1. Bạn nhập văn bản.
2. Tokenizer chuyển văn bản thành token ID.
3. Lớp embedding của mô hình lấy vector tương ứng với các ID.
4. Các lớp của mô hình xử lý chuỗi biểu diễn và ngữ cảnh.
5. Mô hình dự đoán phân bố xác suất cho token tiếp theo.
6. Cơ chế sinh chọn token, tiếp tục lặp; tokenizer giải mã các ID đầu ra thành chữ.

**Giải thích bổ sung:** ID giống khóa tra cứu. Token có ID `1000` không có nghĩa là nó “mạnh gấp đôi” token ID `500`; hai ID gần nhau cũng không chứng minh hai token gần nghĩa.

### 2.3. Token ID không phải embedding vector

| Token ID | Embedding vector |
|---|---|
| Một số nguyên định danh | Một dãy giá trị số biểu diễn token |
| Được tokenizer tạo ra | Được tra từ lớp embedding trong mô hình |
| Ví dụ giả định: `101` | Ví dụ giả định: `[0.12, -0.45, 0.08, ...]` |

Khi học tiếp về embeddings hoặc tìm kiếm ngữ nghĩa, đừng lấy danh sách token ID làm vector để so sánh ngữ nghĩa.

Lời giảng nói “mọi model nhận token ID” cần được hiểu trong phạm vi **đường xử lý văn bản của bài học**. Không nên áp dụng nguyên xi cho tất cả AI: mô hình xử lý ảnh, âm thanh hoặc hệ thống đa phương thức có những kiểu đầu vào khác.

### 2.4. Special tokens — Token đặc biệt

Token thông thường biểu diễn nội dung. Special token thường đánh dấu cấu trúc, chẳng hạn bắt đầu văn bản, kết thúc một lượt hoặc ranh giới giữa phần header và nội dung.

Ví dụ trong Llama ở bài học:

- `<|begin_of_text|>`: đánh dấu bắt đầu văn bản.
- `<|start_header_id|>` và `<|end_header_id|>`: bao quanh phần header xác định vai trò.
- `<|eot_id|>`: đánh dấu kết thúc lượt trong định dạng hội thoại.

**Vì sao model hiểu những dấu này?** Trong dữ liệu huấn luyện, chúng đã được dùng nhất quán. Mô hình học được mối liên hệ giữa các dấu đó và nội dung thường xuất hiện tiếp theo.

Con số `10` mà giảng viên dùng để giải thích “bắt đầu prompt” chỉ là ví dụ. Không có quy luật rằng mọi model đều dành ID `10` cho cùng một chức năng.

**Giải thích bổ sung:** ngoài ý nghĩa mà mô hình học được, phần mềm sinh văn bản cũng có thể sử dụng một số ID như EOS để dừng sinh. Vì vậy, không nên hiểu rằng special token hoàn toàn không liên quan đến logic phần mềm.

### 2.5. Vì sao tokenizer phải khớp model?

Giả sử cùng ID `101` nhưng tokenizer A gán cho `Hello`, tokenizer B gán cho một mảnh khác. Nếu mô hình được huấn luyện theo A mà bạn mã hóa bằng B, mô hình sẽ nhận sai cách biểu diễn so với những gì đã học.

Quy tắc thực hành: **lấy tokenizer đi cùng checkpoint (bản mô hình) bạn định sử dụng**. Một số model có thể dùng chung tokenizer; không phải mỗi model trên thế giới đều bắt buộc có một bộ hoàn toàn riêng.

## 3. Video 012 — Tận mắt xem encode và decode

### 3.1. Mục đích của bài thực hành

Bạn nhìn thấy câu chữ trở thành một danh sách số, rồi trở lại thành chữ. Đây là cách biến khái niệm trừu tượng thành thứ có thể kiểm tra được.

Trong video, giảng viên dùng Google Colab và Llama 3.1. Tuy nhiên, **chỉ chạy tokenizer không cần GPU**. Bạn có thể dùng CPU; tải tokenizer cũng không đồng nghĩa với tải toàn bộ trọng số model 8B.

Llama là họ mô hình của Meta. Ollama là công cụ chạy mô hình; hai tên gần giống nhau nhưng không chỉ cùng một thứ.

### 3.2. Chuẩn bị và quyền truy cập

Đoạn mã dưới đây được biên soạn lại cho bài học, không phải notebook gốc. Trong Colab, cài thư viện ở một ô riêng:

```python
%pip install -U transformers huggingface_hub
```

Nếu repository yêu cầu tài khoản được cấp quyền, hãy hoàn thành yêu cầu trên trang model và đăng nhập bằng tài khoản tương ứng:

```python
from huggingface_hub import login

login()  # Nhập access token qua lời nhắc; không ghi token trực tiếp vào mã.
```

Video chia sẻ kinh nghiệm về thời gian duyệt và cách điền thông tin. Đây không phải bảo đảm về quy trình duyệt. Hãy khai đúng thông tin; nếu chưa truy cập được Llama, có thể dùng tokenizer Qwen trong ví dụ phần 6 để tiếp tục học.

### 3.3. Nạp tokenizer và mã hóa

```python
from transformers import AutoTokenizer

base_id = "meta-llama/Llama-3.1-8B"
tokenizer = AutoTokenizer.from_pretrained(base_id)

text = "I'm excited to show Tokenizers in action to my LLM engineers."
ids = tokenizer.encode(text)

print("Token IDs:", ids)
print("Số token:", len(ids))
```

`AutoTokenizer` chọn lớp tokenizer phù hợp dựa vào cấu hình của repository. `from_pretrained(...)` lấy tokenizer đã được chuẩn bị sẵn; nó không huấn luyện một tokenizer mới.

`encode(text)` trả về dãy ID. Tùy tokenizer và tùy chọn, dãy đó có thể chứa cả special token được tự thêm.

Trong lần chạy được mô tả ở video, giảng viên báo câu mẫu có 15 token. Hãy xem đó là quan sát của lần demo; khi tự chạy, dùng `len(ids)` để biết kết quả của tokenizer và cấu hình bạn đang dùng.

### 3.4. Giải mã và thấy token bắt đầu văn bản

```python
print(tokenizer.decode(ids))
print(tokenizer.decode(ids, skip_special_tokens=True))
```

Ở demo Llama, bản giải mã có `<|begin_of_text|>` ở đầu vì bước mã hóa đã thêm token này. `skip_special_tokens=True` bỏ các token được đăng ký là special token khỏi kết quả giải mã.

Muốn khảo sát riêng nội dung văn bản:

```python
plain_ids = tokenizer.encode(text, add_special_tokens=False)
print(plain_ids)
print(tokenizer.decode(plain_ids))
```

Không nên mặc định rằng mọi tokenizer đều thêm cùng một token đầu câu. Video 014 sẽ cho thấy khác biệt này.

### 3.5. Xem từng token và hiểu đúng `batch_decode`

```python
for token_id in plain_ids:
    fragment = tokenizer.decode([token_id])
    print(token_id, repr(fragment))

# Cách xem ký hiệu token trong biểu diễn nội bộ:
print(tokenizer.convert_ids_to_tokens(plain_ids))
```

`repr(...)` giúp nhìn khoảng trắng và ký tự xuống dòng như `\n`. Khoảng trắng đầu một mảnh có ý nghĩa đối với cách chia token, không phải lúc nào cũng là lỗi thừa dấu cách.

**Điểm cần sửa rõ từ cách diễn đạt trong video:** `batch_decode` dùng để giải mã **nhiều chuỗi ID**. Nó không được định nghĩa đơn giản là “tách một câu thành từng token”. Ví dụ chuẩn:

```python
batch = [
    tokenizer.encode("Hello"),
    tokenizer.encode("Good morning"),
]
print(tokenizer.batch_decode(batch, skip_special_tokens=True))

# Muốn mỗi token được giải mã thành một phần tử riêng:
print(tokenizer.batch_decode([[token_id] for token_id in plain_ids]))
```

Lưu ý khi thử tiếng Việt: một token riêng lẻ có thể chỉ chứa một phần của chuỗi byte tạo nên ký tự Unicode. Do đó, giải mã từng ID có thể xuất hiện ký tự thay thế; giải mã cả chuỗi mới là cách đọc văn bản hoàn chỉnh. Đối chiếu API: [Hugging Face — Tokenizer](https://huggingface.co/docs/transformers/main_classes/tokenizer).

## 4. Video 013 — Chat template: phần quan trọng nhất của ngày học

### 4.1. Mảng `messages` không đi nguyên dạng vào các phép tính của model

Bạn thường làm việc với dữ liệu như sau:

```python
messages = [
    {"role": "system", "content": "Bạn là trợ lý giải thích dễ hiểu."},
    {"role": "user", "content": "Token là gì?"},
]
```

Ở tầng ứng dụng, đây là cấu trúc tiện dùng. Trước khi chạy mô hình chat dạng văn bản, lớp xử lý sẽ định dạng các lượt thành một chuỗi theo quy ước của model, rồi mã hóa chuỗi đó thành ID.

**Chat template (khuôn định dạng hội thoại)** là quy tắc chuyển lịch sử chat sang định dạng này. Nó giữ thông tin ai nói, nội dung nào thuộc lượt nào và phần nào model cần viết tiếp.

Với kinh nghiệm frontend, bạn có thể hình dung:

| Lập trình web | Liên hệ với bài học |
|---|---|
| Mảng object dùng trong ứng dụng | `messages` chứa `role` và `content` |
| Hàm serialize theo định dạng đích | Chat template sắp xếp nội dung và dấu phân cách |
| Thành phần nhận phải hiểu đúng định dạng | Model cần định dạng phù hợp dữ liệu huấn luyện |

Đây là phép liên hệ để dễ hiểu. Chat template không đơn thuần là `JSON.stringify(messages)`; nó dùng quy ước riêng của checkpoint.

### 4.2. Base model và Instruct model

| Base model — Mô hình nền | Instruct/Chat model — Mô hình theo chỉ dẫn/hội thoại |
|---|---|
| Chủ yếu được tiền huấn luyện để học quy luật văn bản | Được huấn luyện bổ sung để làm theo yêu cầu, trả lời hội thoại |
| Thường được dùng như mô hình tiếp nối văn bản hoặc nền để tinh chỉnh | Phù hợp hơn với đầu vào gồm các lượt system/user/assistant |
| Không nên tự giả định có chat template sẵn dùng | Thường cung cấp template cho kiểu hội thoại đã học |

Ví dụ bài học chuyển từ `meta-llama/Llama-3.1-8B` sang `meta-llama/Llama-3.1-8B-Instruct`.

**Điểm cần nói chính xác hơn:** chuyển sang Instruct không có nghĩa chắc chắn bộ từ vựng lớn hơn hoặc có nhiều special token hơn. Hai biến thể có thể chia sẻ bộ từ vựng; khác biệt quan trọng là quá trình huấn luyện và cấu hình phục vụ hội thoại.

### 4.3. Xem chuỗi sau khi áp dụng template

```python
chat_tokenizer = AutoTokenizer.from_pretrained(
    "meta-llama/Llama-3.1-8B-Instruct"
)

formatted = chat_tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
)
print(formatted)
```

Minh họa rút gọn cấu trúc Llama trong bài, **không phải output nguyên văn**; ngày tháng hoặc phần chèn thêm của template đã được lược bỏ:

```text
<|begin_of_text|><|start_header_id|>system<|end_header_id|>

Bạn là trợ lý giải thích dễ hiểu.<|eot_id|><|start_header_id|>user<|end_header_id|>

Token là gì?<|eot_id|><|start_header_id|>assistant<|end_header_id|>

```

Đọc lần lượt:

1. Bắt đầu văn bản.
2. Header cho biết phần tiếp theo là lời `system`.
3. Nội dung system và dấu kết thúc lượt.
4. Header `user`, câu hỏi và dấu kết thúc lượt.
5. Mở đầu lượt `assistant`, chờ model sinh phần nội dung.

Trong định dạng này, các chuỗi đánh dấu header là special token; chữ `system`, `user`, `assistant` nằm trong header không nhất thiết mỗi chữ đều là một special token riêng.

### 4.4. Ba tùy chọn cần hiểu

| Tùy chọn | Ý nghĩa |
|---|---|
| `tokenize=False` | Trả về chuỗi đã định dạng để bạn đọc và kiểm tra |
| `tokenize=True` | Mã hóa định dạng đó thành token ID |
| `add_generation_prompt=True` | Yêu cầu template thêm phần mở đầu lượt assistant nếu template hỗ trợ |

`add_generation_prompt` không sinh câu trả lời và không thêm một yêu cầu kiểu “hãy trả lời”. Nó chuẩn bị vị trí để model viết tiếp đúng lượt. Tác dụng cụ thể phụ thuộc template. [Hugging Face — Chat templates](https://huggingface.co/docs/transformers/chat_templating).

Muốn quan sát các ID:

```python
chat_ids = chat_tokenizer.apply_chat_template(
    messages,
    tokenize=True,
    add_generation_prompt=True,
)
print(chat_ids)
print("Số token của toàn bộ prompt chat:", len(chat_ids))
```

Code này mới chuẩn bị đầu vào; chưa gọi model để tạo câu trả lời.

### 4.5. Lỗi dễ mắc: thêm special token hai lần

Nếu đã dùng template tạo chuỗi, template thường đã chèn các dấu cần thiết. Khi mã hóa chuỗi đó lần nữa, tránh tự động thêm trùng:

```python
formatted = chat_tokenizer.apply_chat_template(
    messages, tokenize=False, add_generation_prompt=True
)
chat_ids = chat_tokenizer.encode(formatted, add_special_tokens=False)
```

Hoặc dùng thẳng `apply_chat_template(..., tokenize=True)` như trên. Đây là lưu ý được nêu trong [tài liệu chat template của Hugging Face](https://huggingface.co/docs/transformers/chat_templating).

### 4.6. Xem vocabulary đúng cách

```python
print("Số mục trong toàn bộ vocabulary:", len(chat_tokenizer.get_vocab()))
print("Vocabulary có tính added tokens:", len(chat_tokenizer))
print("Added vocabulary:", chat_tokenizer.get_added_vocab())
print("Special tokens:", chat_tokenizer.all_special_tokens)
print("Special token IDs:", chat_tokenizer.all_special_ids)
```

Ở video, giảng viên kiểm tra được tổng 128.256 mục cho tokenizer Llama đang dùng, gồm 128.000 mục và nhóm 256 token bổ sung. ID `128000` được nói tới không phải “số token của một câu”, cũng không phải ID lớn nhất chỉ vì nó là số lớn.

`get_added_vocab()` là danh sách token bổ sung, không phải API bảo đảm chỉ trả về special tokens cho mọi tokenizer. Muốn kiểm tra special tokens, dùng các thuộc tính dành riêng cho chúng. [Đối chiếu API tokenizer](https://huggingface.co/docs/transformers/main_classes/tokenizer).

### 4.7. Khoảnh khắc “à, ra vậy” mà giảng viên muốn bạn có

**Một cuộc hội thoại có nhiều vai trò vẫn được biểu diễn thành một chuỗi token có cấu trúc. Model học cách viết tiếp chuỗi đó thành câu trả lời của assistant.**

Điều này không có nghĩa vai trò system vô dụng. Các dấu phân cách và việc huấn luyện giúp model phân biệt chức năng từng phần. Cũng không nên coi hệ thống chat hoàn chỉnh chỉ có duy nhất một mảng số: phần triển khai còn có thể truyền attention mask, thông tin vị trí và các dữ liệu phụ trợ.

## 5. Video 014 — So sánh để hiểu sự tương thích, không để xếp hạng

### 5.1. Giảng viên đang so sánh điều gì?

| Họ model được demo | Quan sát chính trong video | Bài học |
|---|---|---|
| Llama 3.1 | Có dấu bắt đầu văn bản trong demo; chat dùng header và dấu kết thúc lượt | Nội dung và cấu trúc đều được biểu diễn thành token |
| Phi-4-mini-instruct | ID khác Llama, cách chia một số mảnh khác; lần `encode` demo không có dấu đầu giống Llama | Không có một bảng ID chung cho mọi model |
| DeepSeek V3.1 | Dùng các dấu đầu câu, user, assistant theo định dạng riêng | Cùng mảng messages có thể được định dạng rất khác |
| Qwen2.5-Coder | Tokenize cả mã nguồn, gồm các mảnh như `_world` hoặc tổ hợp dấu | Code cũng là dữ liệu có thể mã hóa thành token |

Tên video 014 ghi Phi-4; phần lời giảng xác định biến thể **Phi-4-mini-instruct**. Phụ đề nhận diện giọng nói có nhiều cách viết sai tên; ở đây chuẩn hóa thành Llama, Phi, DeepSeek và Qwen.

Phi có định dạng chat riêng được mô tả ở [model card Phi-4-mini-instruct](https://huggingface.co/microsoft/Phi-4-mini-instruct). Với DeepSeek V3.1, cấu hình template đặt nội dung system phía đầu và có thể thêm dấu liên quan đến chế độ thinking; không nên học một chuỗi rút gọn rồi tự ghép cho mọi trường hợp. [Cấu hình tokenizer DeepSeek V3.1](https://huggingface.co/deepseek-ai/DeepSeek-V3.1/raw/main/tokenizer_config.json).

### 5.2. Tokenizer cho code có gì đáng chú ý?

Ví dụ do tôi biên soạn:

```python
def hello_world(person):
    print(f"Hello, {person}!")
```

Khi tokenize, bạn có thể thấy từ khóa, phần tên hàm, khoảng trắng, xuống dòng hoặc tổ hợp dấu nằm trong các token. Chúng không nhất thiết được chia theo đơn vị mà một lập trình viên gọi là “từ”.

Giảng viên phỏng đoán tokenizer của model lập trình có thể được tối ưu cho cấu trúc code, đồng thời nói chưa phân tích sâu. **Chỉ nhìn một ví dụ token hóa không đủ chứng minh tokenizer đó chuyên biệt hơn hay model lập trình tốt hơn.** Qwen2.5-Coder được huấn luyện cho code, nhưng điều đó cần phân biệt với kết luận về thiết kế tokenizer. [Model card Qwen2.5-Coder](https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct).

### 5.3. Ít token hơn có tốt hơn không?

Ít token hơn cho cùng nội dung có thể giúp tiết kiệm chỗ trong context và ảnh hưởng chi phí hoặc hiệu năng. Tuy nhiên, số token không tự chứng minh chất lượng câu trả lời.

Giảng viên muốn bạn đừng mắc kẹt vào vài token chênh lệch khi đang học cơ bản. **Giải thích bổ sung:** trong hệ thống lớn hoặc xử lý nhiều tiếng Việt/code, khác biệt này có thể đáng đo. Khi so sánh thật, cần xét cả chất lượng, giá theo model, độ trễ, độ dài đầu ra và dữ liệu thực tế.

Quy tắc “1 token xấp xỉ 0,75 từ” chỉ là ước lượng thường dùng với một số văn bản tiếng Anh. Không dùng nó như công thức chính xác cho tiếng Việt, JSON, code hoặc emoji.

## 6. Bài thực hành gọn: tự kiểm chứng các ý chính bằng CPU

Đây là bài bổ sung để bạn làm lại sau khi đọc. Chọn một checkpoint Qwen cụ thể để minh họa; không khẳng định đây là đúng kích thước checkpoint Qwen xuất hiện trên màn hình video.

Sau bước cài thư viện ở mục 3.2, chạy:

```python
from transformers import AutoTokenizer

model_id = "Qwen/Qwen2.5-Coder-7B-Instruct"
tok = AutoTokenizer.from_pretrained(model_id)

samples = {
    "Tiếng Anh": "I am learning how tokenizers work.",
    "Tiếng Việt": "Tôi đang học cách tokenizer hoạt động.",
    "Python": 'def hello_world(person):\n    print(f"Hello, {person}!")',
}

for label, text in samples.items():
    ids = tok.encode(text, add_special_tokens=False)
    print("\nNội dung:", label)
    print("Số token:", len(ids))
    print("Token IDs:", ids)
    print("Ký hiệu token:", tok.convert_ids_to_tokens(ids))
    print("Giải mã cả chuỗi:", tok.decode(ids))

messages = [
    {"role": "system", "content": "Giải thích ngắn gọn bằng tiếng Việt."},
    {"role": "user", "content": "Token ID khác embedding như thế nào?"},
]

print("\nChuỗi hội thoại sau khi định dạng:")
print(tok.apply_chat_template(
    messages, tokenize=False, add_generation_prompt=True
))

chat_ids = tok.apply_chat_template(
    messages, tokenize=True, add_generation_prompt=True
)
print("Số token của toàn bộ hội thoại:", len(chat_ids))
```

Bạn cần quan sát 4 việc:

1. Số token khác số từ và số ký tự.
2. ID khó đọc với con người, nhưng giải mã cả chuỗi cho thấy nội dung.
3. Prompt chat có thêm cấu trúc ngoài câu hỏi user.
4. Tokenizer không tự trả lời câu hỏi; nó chỉ chuẩn bị và chuyển đổi dữ liệu.

Để so sánh với Phi như video, đổi `model_id` thành `microsoft/Phi-4-mini-instruct` rồi chạy lại. Giữ nguyên câu đầu vào và tùy chọn nếu muốn so sánh công bằng. Không cần tải trọng số Llama, Phi hay DeepSeek chỉ để xem tokenizer.

**Phạm vi kiểm chứng:** mã trong tài liệu được viết theo API đã đối chiếu; chưa chạy tải tokenizer hoặc inference trong môi trường này. Kết quả token ID cụ thể không được dựng thành output giả. Cấu hình repository và phiên bản thư viện có thể khiến output khác video.

## 7. Các hiểu nhầm nên tránh

| Hiểu nhầm | Cách hiểu đúng |
|---|---|
| Một token luôn là một từ | Token có thể nhỏ hơn từ hoặc gồm khoảng trắng/dấu câu |
| Tokenizer hiểu và trả lời câu hỏi | Tokenizer chủ yếu chuyển đổi biểu diễn; model thực hiện suy luận |
| Token ID là vector ngữ nghĩa | ID là mã tra cứu; vector là một biểu diễn khác |
| ID càng lớn thì token càng quan trọng | Giá trị ID không phải điểm quan trọng |
| Mảng JSON messages đi thẳng vào Transformer | Cần bước chuẩn bị theo định dạng hội thoại và mã hóa |
| `batch_decode` chỉ để tách token của một câu | Nó giải mã một batch các chuỗi ID |
| Instruct bắt buộc có vocabulary lớn hơn Base | Có thể dùng chung vocabulary; cần xem cấu hình thực tế |
| Special token tự làm model hiểu vai trò | Ý nghĩa được học nhờ huấn luyện; phần mềm cũng có thể xử lý một số token |
| Có thể dùng tokenizer model nào cũng được | Phải bảo đảm tương thích với checkpoint |
| Ngày tháng trong template làm kiến thức model mới hơn | Đó là nội dung đầu vào; không tự cập nhật trọng số hoặc kiến thức |
| Lỗi tải tokenizer nghĩa là thiếu GPU | Hãy kiểm tra ID repository, quyền truy cập, mạng và phiên bản thư viện |

## 8. Bạn học phần này để dùng vào đâu?

Khi xây chatbot, kiến thức này giúp bạn:

- **Đếm đầu vào đúng hơn:** tính cả system, lịch sử, tài liệu bổ sung và định dạng chat, không chỉ câu user vừa gõ.
- **Đổi model đúng cách:** dùng tokenizer và template phù hợp model mới.
- **Gỡ lỗi prompt:** kiểm tra chuỗi sau template nếu model viết tiếp lời user, lẫn vai trò hoặc sinh dấu lạ.
- **Chuẩn bị học inference:** hiểu `input_ids` đến từ đâu trước khi truyền đầu vào cho model.

Nếu chỉ gọi một API chat, nhà cung cấp thường xử lý phần định dạng nội bộ. Bạn không cần tự chèn ký hiệu Llama vào mảng messages gửi cho một API khác.

## 9. Tự kiểm tra mức độ hiểu

1. **Vì sao cùng một câu cho ra hai danh sách ID khác nhau?** Vì hai tokenizer có thể có cách chia và bảng ánh xạ khác nhau.
2. **`apply_chat_template` có sinh câu trả lời không?** Không; nó chuẩn bị định dạng đầu vào.
3. **Tại sao đầu ra template kết thúc bằng phần mở đầu assistant?** Để model tiếp tục tại vị trí câu trả lời.
4. **Có cần GPU để làm các ví dụ tokenizer này không?** Không; CPU đủ cho các thao tác đang học.
5. **Tại sao không thay tokenizer tùy ý?** Vì model đã học trên một quy ước mã hóa cụ thể.

Nếu bạn giải thích được: **“messages được định dạng thành chuỗi hội thoại, tokenizer đổi chuỗi thành ID, model sinh tiếp ID, rồi tokenizer giải mã thành chữ”**, bạn đã nắm đúng trọng tâm của cả 4 video.

## 10. Nguồn nội dung

Nguồn chính là các phụ đề người học cung cấp:

- `011 Day 3 - Tokenizers How LLMs Convert Text to Numbers.srt` — khái niệm, special tokens, tính tương thích, phân biệt vector.
- `012 Day 3 - Tokenizers in Action Encoding and Decoding with Llama 3.1.srt` — Colab, quyền truy cập, encode/decode.
- `013 Day 3 - How Chat Templates Work LLaMA Tokenizers and Special Tokens.srt` — vocabulary, Base/Instruct, biểu diễn hội thoại.
- `014 Day 3 - Comparing Tokenizers Phi-4, DeepSeek, and QWENCoder in Action.srt` — so sánh tokenizer và tokenization cho code.

Các liên kết Hugging Face được gắn tại phần đối chiếu tương ứng. Ví dụ frontend, bài thực hành tiếng Việt, các lưu ý kỹ thuật và câu tự kiểm tra là phần giải thích bổ sung.
