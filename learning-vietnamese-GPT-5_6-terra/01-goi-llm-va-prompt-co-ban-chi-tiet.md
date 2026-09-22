# 01. Gọi LLM và prompt cơ bản: tóm tắt một trang web

## Mục tiêu học tập

Sau bài này, bạn có thể:

- Mô tả luồng `URL -> text website -> messages -> LLM -> Markdown`.
- Phân biệt **inference (suy luận)** với training (huấn luyện).
- Giải thích vai trò của system prompt, user prompt và danh sách `messages`.
- Đọc được ba phần chính của mã nguồn: lấy nội dung web, tạo prompt và gọi API.
- Tự thay đổi một prompt nhỏ, dự đoán tác động và đánh giá kết quả mà không lộ secret.

## Cần biết trước

- Python `str`, `list`, `dict`, function và `import`.
- HTTP request/response ở mức ý tưởng. Nếu đã dùng `fetch` hoặc `axios` trong JavaScript, bạn đã biết phần lớn trực giác cần thiết.
- Notebook có trạng thái: phải chạy cell khai báo biến/hàm trước cell dùng chúng.

Nếu `list`, `dict` hoặc `NameError` còn lạ, hãy quay lại [Guide 6](../guides/06_python_foundations.ipynb) trước. Không cần học machine learning hoặc cài model để hiểu bài này.

## Bài toán và vị trí trong khóa

**[Từ nguồn]** [Week 1 Day 1](../week1/day1.ipynb) xây phiên bản đầu tiên của một web browser có khả năng tóm tắt: nhận URL, thu thập phần text HTML đơn giản, đưa text đó cùng chỉ dẫn vào LLM, rồi hiển thị kết quả dưới dạng Markdown. Code lấy trang nằm trong [scraper.py](../week1/scraper.py).

Bài này là điểm vào hợp lý vì nó cho một vòng lặp sản phẩm hoàn chỉnh nhưng nhỏ: có dữ liệu thật, có hàm Python, có API và có kết quả để đánh giá. Nó chưa dạy training, vector database hay agent.

## Vì sao cần tách thành các bước?

LLM không tự mở URL trong code này. Bạn phải biến URL thành text trước, rồi đóng gói text thành input đúng cấu trúc cho API.

```text
URL (str)
  -> requests + BeautifulSoup
  -> text website (str, bị cắt ngắn)
  -> messages (list[dict])
  -> Chat Completions API
  -> response object
  -> nội dung tóm tắt (str/Markdown)
```

Trong React, bạn có thể hình dung `messages` giống một mảng object truyền vào một service. So sánh này chỉ giúp hiểu cấu trúc dữ liệu: system prompt không phải global state bền vững trong model; nó phải được gửi kèm request và chỉ có hiệu lực trong phạm vi request đó.

## Khái niệm cần nắm đúng lúc

| Khái niệm | Nghĩa trong bài này | Không phải là |
| --- | --- | --- |
| Dữ liệu | URL, HTML và text trích xuất từ trang | Trọng số bên trong model |
| Model | Dịch vụ/model name được chọn khi gọi API | Thư viện `openai` |
| Parameters | Trọng số đã học sẵn của model | Biến `system_prompt` hay `model` trong code |
| Hyperparameters | Thiết lập điều khiển hành vi inference/training, ví dụ `temperature` | Bắt buộc phải có ở mọi API call |
| Inference | Gửi `messages` cho model đã có và nhận text | Làm model học từ project của bạn |
| Training | Cập nhật parameters dựa trên dữ liệu | Nội dung của bài 01 |
| Evaluation | Kiểm tra tóm tắt có đúng, đủ và hữu ích không | Chỉ nhìn câu trả lời có vẻ trôi chảy |

Trong nguồn của bài này, bạn chọn model name nhưng không đặt `temperature` và không training gì cả. Một lời gọi API không biến prompt của bạn thành dữ liệu huấn luyện của project.

## Luồng dữ liệu đầu vào và đầu ra

| Bước | Đầu vào | Đầu ra | Kiểu dữ liệu đáng chú ý |
| --- | --- | --- | --- |
| `fetch_website_contents(url)` | URL | title và text trang, tối đa 2.000 ký tự | `str -> str` |
| `messages_for(website)` | text website | system + user message | `str -> list[dict[str, str]]` |
| `summarize(url)` | URL | nội dung câu trả lời của assistant | `str -> str` |
| `display_summary(url)` | URL | kết quả được render trong notebook | side effect qua `display()` |

Ví dụ minh họa, không phải output đã chạy:

```python
website = "Tieu de\n\nNoi dung ve san pham A."

messages = [
    {"role": "system", "content": "Hay tom tat ro rang."},
    {"role": "user", "content": "Here are the contents...\n" + website},
]
```

Python dùng Unicode nên source thật có thể chứa tiếng Việt. Ví dụ dùng ASCII chỉ để bạn nhìn rõ cấu trúc `list` và `dict`, không phải prompt chuẩn của dự án.

## Phân tích code thực tế

### 1. Trích xuất text website

**[Trích từ nguồn, rút gọn]** [scraper.py](../week1/scraper.py) chứa logic sau:

```python
def fetch_website_contents(url):
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.content, "html.parser")
    title = soup.title.string if soup.title else "No title found"

    if soup.body:
        for irrelevant in soup.body(["script", "style", "img", "input"]):
            irrelevant.decompose()
        text = soup.body.get_text(separator="\n", strip=True)
    else:
        text = ""

    return (title + "\n\n" + text)[:2_000]
```

**Nó giải quyết gì?** LLM cần text, không cần cây HTML đầy đủ. Hàm gửi `GET` request, dùng BeautifulSoup phân tích HTML, bỏ vài thẻ ít hữu ích cho việc đọc và nối title với phần body.

**Theo dõi một mẫu dữ liệu nhỏ:** giả sử body có `"Chao mung"`, một thẻ `script` và một thẻ `img`. Sau `decompose()`, `get_text()` giữ lại phần text đọc được. Cuối cùng `[:2_000]` chỉ lấy tối đa 2.000 ký tự đầu, để prompt không phình không kiểm soát.

**Vì sao cần headers?** File nguồn đưa `User-Agent` giống trình duyệt vào request. Một số site từ chối request quá sơ sài.

**Giới hạn cần thấy:**

- Đây là scraper giáo dục đơn giản, không render JavaScript. Trang React có thể trả HTML ban đầu nghèo nội dung.
- Hàm chưa đặt `timeout` và chưa gọi `raise_for_status()`. Khi thực hành sản phẩm thật, bạn cần xử lý timeout, HTTP lỗi và retry có kiểm soát.
- Cắt theo ký tự không bằng cắt theo token. 2.000 ký tự chỉ là giới hạn đơn giản của bài, không phải công thức tối ưu.

### 2. Đặt vai trò cho model bằng prompt

**[Trích từ nguồn]** notebook định nghĩa `system_prompt`, `user_prompt_prefix`, sau đó ghép chúng trong hàm:

```python
def messages_for(website):
    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt_prefix + website},
    ]
```

**Nó giải quyết gì?** API chat mong một danh sách message có role. System prompt nói cách làm và giọng điệu mong muốn; user prompt mang nhiệm vụ và dữ liệu cụ thể. Tách chúng giúp bạn thay đổi "cách trả lời" mà không làm lẫn dữ liệu website với chỉ dẫn ứng dụng.

**Đầu vào/đầu ra:** `website` là `str`; hàm trả `list` gồm hai `dict`. Đây gần với:

```javascript
const messages = [
  { role: "system", content: systemPrompt },
  { role: "user", content: userPromptPrefix + website },
];
```

**Giới hạn của so sánh:** object JavaScript và dict Python giống nhau về ý tưởng key-value, nhưng không phải cùng runtime hay cùng kiểu dữ liệu.

### 3. Gọi model và lấy phần text cần dùng

**[Trích từ nguồn, rút gọn]** hàm chính trong [Week 1 Day 1](../week1/day1.ipynb) là:

```python
def summarize(url):
    website = fetch_website_contents(url)
    response = openai.chat.completions.create(
        model="gpt-4.1-mini",
        messages=messages_for(website),
    )
    return response.choices[0].message.content
```

**Nó giải quyết gì?** Hàm che bớt ba bước con phía dưới một tên có nghĩa: lấy trang, tạo message và gọi model. Người gọi chỉ cần truyền URL rồi nhận text summary.

**Điểm cần đọc kỹ:**

- `openai = OpenAI()` được tạo ở cell trước đó, sau khi code tải environment variables. Nếu chạy hàm trước cell này, bạn có thể gặp `NameError`.
- `response` là một object có cấu trúc. Code lấy nhánh đầu tiên `choices[0]`, rồi lấy content trong assistant message.
- Notebook cũng có ví dụ gọi nhanh dùng `gpt-5-nano`. Đây là model name trong source tại thời điểm repository hiện có, không phải lời hứa rằng tên model, quyền truy cập hay giá vẫn giống khi bạn chạy.
- [Guide 9](../guides/09_ai_apis_and_ollama.ipynb) giải thích `openai` là Python client library bọc HTTP request, không chứa model GPT chạy trên máy của bạn.

### 4. Hiển thị là bước giao diện, không phải bước LLM

`display_summary(url)` gọi `summarize(url)` rồi chạy `display(Markdown(summary))`. Đây là cách Jupyter render câu trả lời đẹp hơn. Nó không làm model "hiểu Markdown hơn"; việc model trả Markdown đến từ chỉ dẫn trong prompt.

## Thực hành từng bước

### Bước 1: Đọc cấu trúc mà chưa gọi mạng

Mở [Week 1 Day 1](../week1/day1.ipynb), đọc các cell theo thứ tự sau:

1. Import và khởi tạo biến môi trường.
2. Ví dụ `messages` đơn giản.
3. `system_prompt`, `user_prompt_prefix`, `messages_for`.
4. `summarize` và `display_summary`.

Hãy tự viết ra kiểu dữ liệu của `url`, `website`, `messages`, `response` và giá trị trả về. Việc này không cần key hoặc gọi API.

### Bước 2: Kiểm tra `messages_for` không tốn phí

Sau khi đã chạy các cell khai báo prompt và function, thêm một cell tạm trong notebook hoặc notebook nháp:

```python
sample_website = "Trang demo\n\nDich vu giao hang nhanh trong ngay."
messages_for(sample_website)
```

Kết quả dự kiến là một list có hai dict, không phải câu tóm tắt. Nếu không thấy list này, đừng gọi API vội: kiểm tra lại cell định nghĩa `system_prompt`, `user_prompt_prefix` và `messages_for` đã chạy chưa.

### Bước 3: Thay đổi một điều duy nhất trong prompt

Trong bản sao notebook hoặc cell nháp, thay system prompt thành mục tiêu rõ ràng hơn, ví dụ "trả lời 3 gạch đầu dòng, giọng trung tính, nêu thông tin còn thiếu". Không đổi đồng thời model, URL và nhiều câu lệnh khác; như vậy bạn mới biết thay đổi nào tạo khác biệt.

### Bước 4: Chỉ khi bạn chủ động muốn thực hiện inference

Đọc hướng dẫn setup gốc về environment variable trước. Không chép secret vào cell hay Markdown. Một lời gọi cloud API có thể phát sinh phí và kết quả phụ thuộc tài khoản/model hiện tại.

Lựa chọn local bằng Ollama được mô tả trong [Week 1 Day 2](../week1/day2.ipynb) và [Guide 9](../guides/09_ai_apis_and_ollama.ipynb). Bài này không yêu cầu bạn tải model hoặc chạy `ollama pull`; chỉ hãy hiểu rằng khi dùng endpoint local, bạn đổi nơi client gửi request và thường đổi cả model name.

## Cách đọc và đánh giá kết quả

Đừng chỉ hỏi "tóm tắt có hay không". Với một URL và prompt cố định, hãy đánh giá theo các câu hỏi:

| Tiêu chí | Câu hỏi kiểm tra |
| --- | --- |
| Trung thực với nguồn | Có chi tiết nào không xuất hiện trong text trích xuất không? |
| Đủ ý | Có giữ được mục tiêu, hành động/điểm chính và hạn chế quan trọng không? |
| Đúng định dạng | Có thực sự trả Markdown hoặc số gạch đầu dòng yêu cầu không? |
| Hữu ích | Người đọc có biết phải làm gì tiếp theo không? |
| Chi phí/độ trễ | Prompt dài hơn hay model khác có đáng với kết quả tốt hơn không? |

**[Chưa kiểm chứng trong bài này]** Không có lời gọi API nào được chạy khi viết tài liệu. Do đó không có output thực tế để khẳng định model nào cho summary tốt nhất. Khi bạn chạy, hãy ghi lại URL, prompt, model name, thời điểm và tiêu chí đánh giá thay vì chỉ lưu câu trả lời đẹp nhất.

## Lỗi thường gặp và hiểu nhầm

- **`NameError: openai is not defined`**: thường do chạy không theo thứ tự. Chạy lại cell import/khởi tạo trước, không phải chỉ sửa cell lỗi.
- **Nhầm SDK là model**: `OpenAI()` là client để gọi endpoint. Nó không tải hoặc chạy GPT local.
- **Dán API key vào source**: không làm vậy. Nguồn dùng environment variable; tài liệu này không đọc `.env`.
- **Tin rằng scraper đọc được mọi website**: source ghi rõ cách đơn giản này không lấy được nội dung render bằng JavaScript và có thể bị chặn.
- **Tin rằng system prompt bảo vệ tuyệt đối**: text website là input không đáng tin. Một trang có thể chứa chỉ dẫn gây nhiễu; ứng dụng thật cần tách dữ liệu khỏi quyền điều khiển và đánh giá output.
- **Đổi nhiều biến rồi kết luận**: nếu đồng thời đổi URL, prompt và model, bạn không biết yếu tố nào tạo ra khác biệt.
- **Tưởng inference là training**: lời gọi API tạo output, không cập nhật trọng số model của bạn trong bài này.

## Câu hỏi tự giải thích bằng lời của bạn

1. Vì sao hàm `summarize` không gửi URL trực tiếp cho model trong implementation này?
2. Nếu `messages_for` trả về một dict thay vì list hai dict, điều gì có thể sai với contract của API chat?
3. Vai trò của `[:2_000]` là gì, và vì sao nó không giải quyết hoàn toàn vấn đề token/cost?
4. Vì sao cùng một prompt có thể cho kết quả khác khi đổi model hoặc provider?
5. Khi summary sai một chi tiết, bạn cần kiểm tra scraper, prompt hay model trước? Vì sao?

## Bài tập nhỏ

### 1. Dự đoán kết quả

Không gọi API. Với `sample_website = "A\n\nB"`, hãy viết bằng tay cấu trúc `messages_for(sample_website)` sẽ có những key nào, bao nhiêu phần tử và text `A/B` nằm ở đâu.

### 2. Thay đổi code

Trong notebook nháp, thay system prompt để yêu cầu: tóm tắt trung tính, tối đa ba gạch đầu dòng, và thêm "Không đủ dữ liệu" khi website không nói rõ. Chạy riêng `messages_for(sample_website)` trước, sau đó mới cân nhắc gọi model nếu bạn đã chuẩn bị môi trường/chi phí.

### 3. Vận dụng

Thiết kế prompt cho tính năng hỗ trợ email: đầu vào là nội dung email, đầu ra là ba tiêu đề email ngắn. Viết `system_prompt`, `user_prompt_prefix` và hình dung `messages` cho một email mẫu. Chưa cần làm giao diện React hay gọi API.

## Gợi ý và đáp án tham khảo

### Bài 1

Đáp án cần có một list hai phần tử. Mỗi phần tử có `role` và `content`. `A\n\nB` đi vào `content` của phần tử có `role: "user"`, sau `user_prompt_prefix`; nó không nằm trong system message.

### Bài 2

Bạn chỉ đang kiểm tra cấu trúc trước. Nếu list có system/user đúng như mong đợi, prompt wiring đã ổn ở mức dữ liệu. Chất lượng summary vẫn chưa được chứng minh, vì chưa inference.

### Bài 3

Một khởi đầu hợp lý là system prompt nói rõ vai trò "trợ lý viết tiêu đề email", còn user prompt nêu "Dưới đây là email..." rồi nối email thật vào. Hãy giữ email như dữ liệu đầu vào, không để nó tự thay vai trò hoặc chỉ dẫn của system prompt.

## Checklist tự đánh giá

- [ ] Tôi phân biệt được URL, text website, `messages`, response object và summary text.
- [ ] Tôi giải thích được system prompt và user prompt mà không gọi chúng là "tham số model".
- [ ] Tôi biết bài này là inference, không phải training.
- [ ] Tôi có thể dự đoán `messages_for(sample_website)` trước khi chạy.
- [ ] Tôi biết không đưa secret vào notebook, Markdown hoặc ảnh chụp màn hình.
- [ ] Tôi có một tiêu chí để đánh giá summary ngoài cảm giác "nghe hay".

## Nguồn tham khảo và điểm chưa kiểm chứng

**Nguồn đã đọc trực tiếp:**

- [Week 1 Day 1](../week1/day1.ipynb): imports, API client, prompts, `messages_for`, `summarize`, `display_summary` và giới hạn scraper.
- [scraper.py](../week1/scraper.py): `fetch_website_contents` và `fetch_website_links`.
- [Week 1 Day 2](../week1/day2.ipynb): request HTTP trực tiếp, client SDK và endpoint tương thích OpenAI/Ollama.
- [Guide 9](../guides/09_ai_apis_and_ollama.ipynb): vai trò client library, provider khác và cảnh báo chi phí.
- [Guide 6](../guides/06_python_foundations.ipynb): nền tảng Python và lỗi do thứ tự chạy notebook.

**Chưa kiểm chứng:** không chạy cell, không gọi API, không kiểm tra availability/giá của model name hiện tại, không tải Ollama model và không thử URL cụ thể. Những phần này chỉ là hướng dẫn thực hành có điều kiện, không phải kết quả đã được xác nhận trong phiên này.
