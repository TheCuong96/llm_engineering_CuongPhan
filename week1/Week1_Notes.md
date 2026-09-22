<!-- markdownlint-disable MD024 MD025 MD060 -->

# Week 1 — Ghi chú tổng hợp: Làm quen với LLM, gọi API và web scraping cơ bản

> **Mục tiêu tuần:** biết gọi một frontier model (mô hình AI tiên phong) qua API, viết prompt cơ bản (system/user), hiểu vì sao gọi API không phải là huấn luyện, lấy nội dung web bằng scraping đơn giản, hiểu sơ lược cơ chế bên trong của một LLM (token, context window, "ảo giác trí nhớ"), và ghép nhiều lời gọi AI lại thành một sản phẩm nhỏ (brochure generator).
>
> Tài liệu này tổng hợp toàn bộ kiến thức Day 1–5 của Week 1, dựa trên `day1.ipynb`, `day2.ipynb`, `day4.ipynb`, `day5.ipynb`, `scraper.py`, bài tập `week1 EXERCISE.ipynb`, cùng các ghi chú tiếng Việt đã có từ trước: [ngay-4-ai-video-026-032-tieng-viet.md](ngay-4-ai-video-026-032-tieng-viet.md), [AI-Day-5-033-037-Day-du.md](AI-Day-5-033-037-Day-du.md) và bài giảng chi tiết Day 1 tại [learning-vietnamese-claude-sonnet-5/01-goi-api-va-prompt-co-ban-chi-tiet.md](../learning-vietnamese-claude-sonnet-5/01-goi-api-va-prompt-co-ban-chi-tiet.md).
>
> **Lưu ý quan trọng:** thư mục `week1/` của repo này **không có** `day3.ipynb`, và cũng không có tài liệu ghi chú nào đặt tên "Day 3". Mục 4 bên dưới ghi lại đúng sự thật này thay vì tự suy đoán nội dung không có nguồn.

## Mục lục

1. [Bức tranh toàn cảnh](#1-bức-tranh-toàn-cảnh)
2. [Ngày 1 — Gọi API LLM lần đầu & Prompting cơ bản](#2-ngày-1--gọi-api-llm-lần-đầu--prompting-cơ-bản)
3. [Ngày 2 — Client library, endpoint tương thích OpenAI và Ollama local](#3-ngày-2--client-library-endpoint-tương-thích-openai-và-ollama-local)
4. [Ngày 3 — Không có tài liệu nguồn trong repo](#4-ngày-3--không-có-tài-liệu-nguồn-trong-repo)
5. [Ngày 4 — Token hóa và "ảo giác trí nhớ" của LLM](#5-ngày-4--token-hóa-và-ảo-giác-trí-nhớ-của-llm)
6. [Ngày 5 — Ghép nhiều lời gọi AI: Brochure Generator](#6-ngày-5--ghép-nhiều-lời-gọi-ai-brochure-generator)
7. [Bài tập cuối tuần](#7-bài-tập-cuối-tuần)
8. [Bảng liên kết tài liệu nguồn](#8-bảng-liên-kết-tài-liệu-nguồn)
9. [Các điểm dễ nhầm trong cả tuần](#9-các-điểm-dễ-nhầm-trong-cả-tuần)
10. [Mục tiêu cuối cùng](#10-mục-tiêu-cuối-cùng)

---

## 1. Bức tranh toàn cảnh

### Tóm tắt quy trình của tuần

Week 1 đi từ "gọi thử một API" đến "hiểu nó hoạt động ra sao" rồi "ghép nhiều lời gọi thành một sản phẩm nhỏ":

1. **Ngày 1:** viết một "Web Summarizer" — lấy nội dung một trang web rồi nhờ model tóm tắt. Đây là lần đầu tiên bạn gọi Chat Completions API.
2. **Ngày 2:** nhìn sâu hơn vào việc package `openai` chỉ là một lớp bọc (wrapper) quanh một HTTP endpoint, rồi dùng đúng client đó để gọi Google Gemini và các model mã nguồn mở chạy local qua Ollama.
3. **Ngày 3:** không có notebook hay tài liệu nào trong repo này — xem ghi chú trung thực ở mục 4.
4. **Ngày 4:** hiểu điều gì đang xảy ra "bên trong": token hóa văn bản, tại sao LLM có vẻ "nhớ" hội thoại dù thực ra mỗi lần gọi đều stateless (không lưu trạng thái), và (theo tài liệu video) kiến trúc Transformer, tham số, context window, chi phí API.
5. **Ngày 5:** ghép hai lời gọi AI liên tiếp (chain — nối chuỗi) để xây một Brochure Generator hoàn chỉnh — bước đầu tiên chạm tới ý tưởng "Agentic AI" sẽ quay lại ở Week 8.

### Ý nghĩa chính của tuần

Week 1 không dạy bạn huấn luyện AI. Toàn bộ tuần là **inference** (suy luận) — dùng model đã được huấn luyện sẵn (GPT, Gemini, Llama...) thông qua API hoặc chạy local. Kỹ năng cốt lõi được lặp lại xuyên suốt:

```text
Thu thập dữ liệu (scraping)
    -> Xây messages = [{"role": "system", ...}, {"role": "user", ...}]
    -> Gọi model.chat.completions.create(...)
    -> Đọc response.choices[0].message.content
    -> Hiển thị / dùng kết quả cho bước tiếp theo
```

Mẫu hình này sẽ được tái sử dụng ở hầu như mọi tuần sau — kể cả khi bài toán phức tạp hơn nhiều (RAG ở Week 5, Agent ở Week 8). Vì vậy Week 1 là nền tảng bắt buộc, không phải bài khởi động có thể bỏ qua.

---

## 2. Ngày 1 — Gọi API LLM lần đầu & Prompting cơ bản

**Nguồn:** [day1.ipynb](day1.ipynb), [scraper.py](scraper.py), [week1 EXERCISE.ipynb](week1%20EXERCISE.ipynb) · Bài giảng đầy đủ đã có sẵn tại [01-goi-api-va-prompt-co-ban-chi-tiet.md](../learning-vietnamese-claude-sonnet-5/01-goi-api-va-prompt-co-ban-chi-tiet.md) và bản tóm tắt [01-goi-api-va-prompt-co-ban-tom-tat.md](../learning-vietnamese-claude-sonnet-5/01-goi-api-va-prompt-co-ban-tom-tat.md) — hai file đó đi vào chi tiết từng dòng; phần dưới đây chỉ tổng hợp lại các ý cốt lõi.

### Tóm tắt quy trình

`day1.ipynb` xây một chương trình **Web Summarizer**: nhận một URL, lấy nội dung trang web đó bằng `fetch_website_contents()` (định nghĩa trong `scraper.py`), đưa nội dung vào một prompt, gọi `openai.chat.completions.create(...)`, rồi hiển thị bản tóm tắt bằng `display(Markdown(...))`.

### Kiến thức và thuật ngữ chính

| Thuật ngữ | Ý nghĩa dễ hiểu |
|---|---|
| LLM (Large Language Model) | Mô hình đã học cách dự đoán phần văn bản tiếp theo hợp lý, từ lượng lớn dữ liệu văn bản |
| Frontier model | Nhóm model AI mạnh/hiện đại nhất tại một thời điểm (GPT, Claude, Gemini...) |
| System prompt | "Luật chơi" cố định đưa cho model (vai trò, giọng điệu); người dùng cuối không thấy |
| User prompt | Yêu cầu/nội dung cụ thể của người dùng trong một lượt hỏi |
| Token | Đơn vị nhỏ mà model xử lý văn bản (không hẳn là một từ) |
| Inference (suy luận) | Dùng model đã huấn luyện sẵn để sinh câu trả lời — **đây là việc Week 1 đang làm** |
| Training (huấn luyện) | Chỉnh sửa tham số của model — **không xảy ra** ở Week 1, chỉ gặp lại từ Week 6-7 |

### Giải thích các phần chính

- **`messages_for(website)`**: trả về đúng cấu trúc mà mọi API kiểu OpenAI yêu cầu — một `list` các `dict` có khóa `role` (`system`/`user`) và `content`.
- **`summarize(url)`**: gọi `fetch_website_contents(url)` để lấy text, gọi `messages_for()` để dựng prompt, rồi gọi `openai.chat.completions.create(model="gpt-4.1-mini", messages=...)` và trả về `response.choices[0].message.content`.
- **`fetch_website_contents(url)`** (trong `scraper.py`): dùng `requests.get(url, headers=headers)` (có `User-Agent` giả lập trình duyệt để tránh bị chặn), dựng cây DOM bằng `BeautifulSoup`, xóa các thẻ `script/style/img/input` (không phải nội dung đọc được), lấy text còn lại và **cắt còn 2.000 ký tự**.
- Notebook thử gọi nhiều model khác nhau (`gpt-5-nano`, `gpt-4.1-nano`, `gpt-4.1-mini`) ở các cell khác nhau — không phải lỗi, chỉ là so sánh nhanh giữa các lựa chọn.

### Chốt ý nghĩa thực tế

Ngày 1 dùng đúng 5 dòng code cốt lõi (`fetch → messages_for → chat.completions.create → .choices[0].message.content → display`) để xây một ứng dụng AI "nhìn có vẻ thông minh" đầu tiên — vì vậy nó cần bạn hiểu rõ prompt là gì trước khi qua các tuần phức tạp hơn dùng lại đúng mẫu hình này.

---

## 3. Ngày 2 — Client library, endpoint tương thích OpenAI và Ollama local

**Nguồn:** [day2.ipynb](day2.ipynb) (23 cell, đã có sẵn ghi chú tiếng Việt ngay trong notebook).

### Tóm tắt quy trình

Notebook đi từ việc gọi HTTP endpoint bằng tay (không qua thư viện `openai`), rồi mới dùng `OpenAI()` client, sau đó tận dụng đúng client đó để nói chuyện với Google Gemini và với các model mã nguồn mở chạy trên máy qua Ollama.

### Giải thích từng phần

| Cell | Nội dung và vai trò | Chốt ý nghĩa thực tế |
|---:|---|---|
| 1–3 | Chào mừng, liên kết tài nguyên khóa học, giới thiệu Chat Completions API. | Chat Completions API do OpenAI đặt ra nhưng nay gần như là "chuẩn chung". |
| 4 | Kiểm tra `OPENAI_API_KEY` từ `.env` bằng `load_dotenv()`. | Không hardcode key trong code — thói quen bảo mật cơ bản. |
| 5–8 | Tự dựng `headers` + `payload` (dict), gọi thẳng `requests.post("https://api.openai.com/v1/chat/completions", ...)`, rồi tự đọc `response.json()["choices"][0]["message"]["content"]`. | Cho thấy phía sau `openai.chat.completions.create()` chỉ là một HTTP POST bình thường — không có gì "ma thuật". |
| 9 | Giải thích package `openai` chỉ là **Python Client Library** — một wrapper (lớp bọc) quanh đúng lời gọi HTTP ở trên, không chứa model bên trong máy. | Xóa hiểu lầm phổ biến: cài `pip install openai` không tải model AI về máy. |
| 10 | Dùng lại `OpenAI()` client, gọi `openai.chat.completions.create(model="gpt-5-nano", messages=[...])` — code gọn hơn hẳn so với cách gọi tay ở trên. | Đây là cú pháp sẽ dùng xuyên suốt các tuần sau. |
| 11 | Giải thích **"OpenAI Compatible Endpoints"**: nhiều hãng khác (ví dụ Google) dựng endpoint giống hệt cấu trúc OpenAI, nên cùng một client `OpenAI(base_url=..., api_key=...)` có thể gọi được nhà cung cấp khác. | Hiểu đúng: xuất hiện chữ `OpenAI` trong code không có nghĩa model của OpenAI đang được dùng. |
| 12–13 | Kiểm tra `GOOGLE_API_KEY`, tạo `gemini = OpenAI(base_url="https://generativelanguage.googleapis.com/v1beta/openai/", api_key=google_api_key)` rồi gọi `gemini.chat.completions.create(model="gemini-3.1-flash-lite", ...)`. | Đổi nhà cung cấp model chỉ bằng cách đổi `base_url` và `api_key`, giữ nguyên toàn bộ code gọi API. |
| 14–15 | Giới thiệu Ollama cũng có endpoint tương thích OpenAI, chạy hoàn toàn trên máy local; kiểm tra bằng `requests.get("http://localhost:11434")`. | Ollama cần chạy nền (`ollama serve`) trước khi gọi được. |
| 16–19 | `!ollama pull llama3.2`, tạo `ollama = OpenAI(base_url="http://localhost:11434/v1", api_key='ollama')`, gọi `ollama.chat.completions.create(model="llama3.2", ...)`. | Model mã nguồn mở chạy local dùng **cùng một client Python**, chỉ đổi `base_url`/`api_key`/`model`. |
| 20–21 | `!ollama pull deepseek-r1:1.5b` (bản DeepSeek được "distilled" — chưng cất kiến thức — vào Qwen của Alibaba), gọi thử model này. | So sánh nhanh giữa hai model nhỏ chạy local. |
| 22 | Bài tập về nhà: nâng cấp Web Summarizer của Day 1 để dùng Ollama thay OpenAI — lợi ích là miễn phí và dữ liệu không rời máy; đánh đổi là model yếu hơn hẳn frontier model. | Đây chính là bài đã có lời giải mẫu ở `week1/solutions/day1_with_ollama.ipynb`. |

### Chốt ý nghĩa thực tế

Ngày 2 tách bạch rõ ba lớp: **HTTP endpoint** (giao thức thật sự), **client library** (lớp bọc tiện lợi cho Python) và **model** (thứ thật sự xử lý ngôn ngữ). Hiểu rõ ba lớp này giúp bạn tự tin đổi nhà cung cấp model (OpenAI ⇄ Gemini ⇄ Ollama) chỉ bằng vài dòng cấu hình trong suốt các tuần sau.

---

## 4. Ngày 3 — Không có tài liệu nguồn trong repo

Thư mục `week1/` không chứa `day3.ipynb`, và cũng không có file ghi chú (`Day-du`/`Tom-tat`) nào ứng với "Day 3". Đối chiếu quy luật đặt tên của các tuần khác (Day 4 = video 026–032, Day 5 = video 033–037), Day 3 của tuần này nhiều khả năng nằm trong khoảng video 001–025 cùng với Day 1 và Day 2, nhưng đây chỉ là suy luận về đánh số — **không có tài liệu hay phụ đề nào trong workspace để xác nhận nội dung thật sự của Day 3**.

Ghi chú này được giữ lại có chủ đích (thay vì bịa nội dung) để đúng quy tắc "không suy đoán khi không có nguồn". Nếu sau này bạn tìm thấy notebook hoặc phụ đề gốc của Day 3, hãy bổ sung một mục riêng vào đây.

---

## 5. Ngày 4 — Token hóa và "ảo giác trí nhớ" của LLM

**Nguồn:** [day4.ipynb](day4.ipynb) (19 cell, code thực hành) và bài giảng mở rộng từ phụ đề video [ngay-4-ai-video-026-032-tieng-viet.md](ngay-4-ai-video-026-032-tieng-viet.md) (video 026–032, ~64 phút).

### Tóm tắt quy trình

Notebook chia làm hai phần: (1) token hóa văn bản bằng `tiktoken`, và (2) chứng minh bằng thực nghiệm rằng mỗi lời gọi LLM là **stateless** (không lưu trạng thái) — "trí nhớ" của chatbot chỉ là ảo giác tạo ra bằng cách gửi lại toàn bộ lịch sử hội thoại mỗi lần gọi.

### Phần A — Token hóa bằng code (thực hành trong notebook)

| Cell | Nội dung | Ý nghĩa |
|---:|---|---|
| 1 | Tiêu đề "Tokenizing bằng code". | Chuyển từ lý thuyết sang thực hành trực tiếp. |
| 2 | `encoding = tiktoken.encoding_for_model("gpt-4.1-mini")`; `tokens = encoding.encode("Hi my name is Ed and I like banoffee pie")`. | Biến câu văn bản thành danh sách số nguyên (token ID). |
| 3 | In danh sách `tokens`. | Xác nhận một câu ngắn tiếng Anh bị chia thành nhiều token số. |
| 4 | Lặp qua từng `token_id`, gọi `encoding.decode([token_id])` để in `token_id = token_text`. | Cho thấy token không phải luôn là một từ hoàn chỉnh — có thể là một phần từ. |
| 5 | `encoding.decode([326])`. | Giải mã ngược một token ID cụ thể về lại text. |

### Phần B — "Illusion of Memory" (ảo giác trí nhớ)

| Cell | Nội dung | Ý nghĩa |
|---:|---|---|
| 6–9 | Giới thiệu chủ đề, kiểm tra API key, tạo `openai = OpenAI()`. | Chuẩn bị môi trường gọi API như Day 1. |
| 10–12 | `messages = [{"role": "system", ...}, {"role": "user", "content": "Hi! I'm Ed!"}]`; gọi API; model chào lại đúng tên Ed. | Lượt gọi đầu tiên, model biết tên vì tên nằm ngay trong prompt. |
| 13–15 | Tạo **messages hoàn toàn mới**, chỉ có câu hỏi `"What's my name?"` (không có lịch sử cũ); gọi API. | Model **không thể trả lời đúng tên** — vì lời gọi này độc lập hoàn toàn với lời gọi trước. |
| 16 | Giải thích: mỗi lời gọi LLM là **STATELESS** — nhiệm vụ của AI engineer là tạo ảo giác rằng model có trí nhớ. | Đây là điểm mấu chốt của cả bài. |
| 17–18 | Tạo lại `messages` gồm đủ 4 phần: system, user ("Hi I'm Ed"), **assistant** (câu trả lời trước), user ("What's my name?"); gọi API. | Lần này model trả lời đúng "Ed" — vì toàn bộ lịch sử được gửi lại trong **cùng một lần gọi**. |
| 19 | Tóm tắt 5 điểm: stateless, phải gửi lại toàn bộ hội thoại, đó là "trick" tạo ảo giác nhớ, ChatGPT dùng đúng cơ chế này, và mỗi lần gửi lại nghĩa là phải trả phí cho toàn bộ hội thoại cũ. | Giải thích vì sao chatbot càng nói chuyện lâu càng tốn phí hơn. |

### Bổ sung từ bài giảng video (026–032): bức tranh lớn hơn về cách LLM hoạt động

| Video | Chủ đề | Điều cần nhớ |
|---|---|---|
| 026 | Transformers | GPT = **G**enerative **P**re-trained **T**ransformer. Transformer là kiến trúc (thiết kế mạng nơ-ron), khác với "model đã huấn luyện" và khác với "ứng dụng" dùng model đó. Cơ chế **self-attention** (tự chú ý) cho phép mô hình liên hệ các từ ở xa nhau trong câu (ví dụ hiểu "nó" chỉ vật gì). |
| 027 | Attention, Emergent Intelligence, Agentic AI | Phân biệt prompt đơn giản, trợ lý có ngữ cảnh (copilot), và agent (tác nhân) có thể tự hành động. |
| 028 | Parameters (tham số) | Con số như 3B, 8B, 70B là số lượng tham số đã học được — không đồng nghĩa model lớn hơn luôn tốt hơn cho mọi việc. |
| 029 | Tokens | AI không đọc từng chữ cái hay từng từ như người — nó xử lý theo **token**, đơn vị trung gian giữa ký tự và từ. |
| 030 | Tokenization | Cùng độ dài văn bản có thể ra số token khác nhau, tùy dấu cách, từ hiếm, số, hay ngôn ngữ. |
| 031 | tiktoken & Illusion of Memory | Chính là nội dung thực hành ở Phần B phía trên. |
| 032 | Context Window & API Costs | **Context window** (cửa sổ ngữ cảnh) là giới hạn tổng số token một model có thể "nhìn thấy" trong một lần gọi (gồm cả prompt lẫn câu trả lời); chi phí API thường tính theo số token đầu vào + đầu ra. |

### Chốt ý nghĩa thực tế

Ngày 4 giải thích **vì sao** cách gọi API ở Day 1–2 hoạt động được, và cảnh báo trước một hệ quả dễ bị bỏ qua: xây một chatbot "có trí nhớ" tốn phí tăng dần theo độ dài hội thoại, vì mỗi lượt phải gửi lại toàn bộ lịch sử dưới dạng token.

---

## 6. Ngày 5 — Ghép nhiều lời gọi AI: Brochure Generator

**Nguồn:** [day5.ipynb](day5.ipynb) (32 cell) · bài giảng mở rộng từ phụ đề video tại [AI-Day-5-033-037-Day-du.md](AI-Day-5-033-037-Day-du.md) / bản tóm tắt [AI-Day-5-033-037-Tom-tat.md](AI-Day-5-033-037-Tom-tat.md) (video 033–037).

### Tóm tắt quy trình

Notebook nâng cấp bài Day 1 lên "một giải pháp kinh doanh đầy đủ": nhận **tên công ty + URL trang chủ**, để AI tự chọn các link liên quan (About, Careers...), tải nội dung các trang đó, rồi nhờ AI viết một **brochure — tài liệu giới thiệu công ty** hoàn chỉnh dạng Markdown.

```text
Bước 1 (code): fetch_website_links(url) — lấy toàn bộ link trên trang chủ
Bước 2 (AI lần 1): select_relevant_links(url) — model chọn link liên quan, trả JSON
Bước 3 (code): tải nội dung các link đã chọn (fetch_page_and_all_relevant_links)
Bước 4 (AI lần 2): create_brochure(...) / stream_brochure(...) — viết brochure bằng Markdown
```

### Giải thích từng phần

| Cell | Nội dung và vai trò | Chốt ý nghĩa thực tế |
|---:|---|---|
| 1 | Giới thiệu "thách thức kinh doanh": tạo brochure cho khách hàng, nhà đầu tư, ứng viên. | Đặt bài toán thực tế trước khi viết code. |
| 2 | Import `fetch_website_links`, `fetch_website_contents` từ `scraper.py`. | Tái sử dụng đúng hai hàm scraping đã học ở Day 1/Day 4. |
| 3 | Kiểm tra API key, đặt `MODEL = 'gpt-5-nano'`, tạo `openai = OpenAI()`. | Dùng một model rẻ/nhanh cho bước "chọn link" vì đây là việc đơn giản. |
| 4 | Gọi thử `fetch_website_links("https://edwarddonner.com")`. | Xem trước dữ liệu thô (danh sách link) trước khi đưa vào prompt. |
| 5 | Giải thích bước 1: dùng **one-shot prompting** (đưa một ví dụ mẫu ngay trong prompt) để AI trả lời đúng định dạng JSON. | Đây là use case AI xử lý tốt: hiểu ngữ nghĩa link mà không cần code phân tích thủ công phức tạp. |
| 6 | `link_system_prompt`: yêu cầu model chọn link liên quan (About, Careers...) và trả về đúng mẫu JSON `{"links": [{"type": ..., "url": ...}]}`. | System prompt định nghĩa rõ định dạng đầu ra để code có thể xử lý tiếp. |
| 7–8 | `get_links_user_prompt(url)`: liệt kê toàn bộ link lấy được vào user prompt; in thử kết quả. | Nội dung động (danh sách link thật) được ghép vào prompt tĩnh. |
| 9, 14 | `select_relevant_links(url)`: gọi `openai.chat.completions.create(..., response_format={"type": "json_object"})`, dùng `json.loads(result)` để parse chuỗi trả về thành dữ liệu Python. | `response_format={"type": "json_object"}` ép model trả về JSON hợp lệ về mặt cú pháp (chưa chắc đúng nội dung schema mong muốn). |
| 11, 15–16 | Gọi thử `select_relevant_links(...)` cho `edwarddonner.com` và `huggingface.co`. | Kiểm chứng hàm hoạt động với nhiều website khác nhau. |
| 17 | Giới thiệu bước 2: ghép toàn bộ nội dung vào một prompt khác để sinh brochure. | Chuyển từ "hiểu cấu trúc trang" sang "viết nội dung". |
| 18–19 | `fetch_page_and_all_relevant_links(url)`: lấy nội dung trang chủ + nội dung từng trang liên quan đã chọn, nối thành một khối text có tiêu đề `## Landing Page` / `### Link: ...`. | Đây là bước **chaining** (nối chuỗi) — dùng kết quả của AI lần 1 làm đầu vào thu thập dữ liệu cho AI lần 2. |
| 20 | `brochure_system_prompt`: yêu cầu viết brochure ngắn bằng Markdown, gồm văn hóa công ty, khách hàng, cơ hội nghề nghiệp (có kèm bản nháp "giọng hài hước" bị comment sẵn để thử nghiệm). | Minh họa việc đổi *tone* (giọng điệu) chỉ bằng cách sửa system prompt. |
| 21–22 | `get_brochure_user_prompt(company_name, url)`: ghép toàn bộ nội dung đã thu thập, rồi **cắt còn 5.000 ký tự** (`user_prompt[:5_000]`). | Giới hạn độ dài để tránh vượt quá khả năng xử lý hợp lý — lưu ý đây là ký tự, không phải token. |
| 23–24 | `create_brochure(company_name, url)`: gọi `gpt-4.1-mini`, hiển thị kết quả bằng `display(Markdown(result))`. | Bước sinh nội dung cuối cùng, dùng model mạnh hơn `gpt-5-nano` vì cần viết văn tốt. |
| 25–26 | Giới thiệu và định nghĩa `stream_brochure(...)`: gọi API với `stream=True`, đọc dần `chunk.choices[0].delta.content`, cập nhật hiển thị bằng `update_display(...)`. | Tạo hiệu ứng "gõ chữ dần" (typewriter) quen thuộc của các chatbot hiện đại. |
| 27–28 | Gọi thử `stream_brochure(...)`, gợi ý đổi sang `brochure_system_prompt` bản hài hước. | Thực hành trực tiếp để thấy rõ prompt ảnh hưởng đến giọng văn đầu ra. |
| 29–32 | Các cell HTML: giải thích đây là bước đầu chạm tới **Agentic AI design pattern** (kết hợp nhiều lời gọi LLM, sẽ gặp lại đậm nét ở Week 8), nhắc bài tập cuối tuần, tài nguyên tham khảo và lời cảm ơn. | Định vị bài học này trong bức tranh toàn khóa, không chỉ là một bài tập đơn lẻ. |

### Chốt ý nghĩa thực tế

Ngày 5 cho thấy một ứng dụng AI thật thường không chỉ là "một lời gọi API" mà là **nhiều bước có thứ tự**, trong đó AI xử lý phần cần hiểu ngôn ngữ (chọn link, viết văn), còn code thường (Python) xử lý phần thu thập, kiểm tra và ghép dữ liệu. Đây chính là nguyên lý nền cho các Agent phức tạp hơn ở Week 8.

---

## 7. Bài tập cuối tuần

**Nguồn:** [week1 EXERCISE.ipynb](week1%20EXERCISE.ipynb).

Bài tập yêu cầu xây một **Technical Question Explainer**: nhận một câu hỏi kỹ thuật (ví dụ đoạn code Python khó hiểu), rồi trả lời bằng lời giải thích — sử dụng cả `gpt-4o-mini` (qua OpenAI) và `llama3.2` (qua Ollama) để so sánh. Notebook chỉ có khung sườn (import, hằng số `MODEL_GPT`/`MODEL_LLAMA`, biến `question` mẫu) — người học tự viết phần gọi API có streaming.

**Chốt ý nghĩa thực tế:** bài tập này ép bạn tự lắp lại đúng mẫu hình đã học cả tuần (system/user prompt, gọi API, so sánh OpenAI với Ollama) mà không có code mẫu đầy đủ — đây là cách kiểm tra thực sự đã hiểu hay chỉ mới đọc qua.

---

## 8. Bảng liên kết tài liệu nguồn

| Ngày | Notebook / code | Ghi chú tiếng Việt liên quan |
|---|---|---|
| Ngày 1 | [day1.ipynb](day1.ipynb), [scraper.py](scraper.py) | [01-goi-api-va-prompt-co-ban-chi-tiet.md](../learning-vietnamese-claude-sonnet-5/01-goi-api-va-prompt-co-ban-chi-tiet.md), [...-tom-tat.md](../learning-vietnamese-claude-sonnet-5/01-goi-api-va-prompt-co-ban-tom-tat.md) |
| Ngày 2 | [day2.ipynb](day2.ipynb) | Ghi chú tiếng Việt nằm trực tiếp trong notebook (chưa có file `.md` riêng) |
| Ngày 3 | *(không có)* | *(không có)* |
| Ngày 4 | [day4.ipynb](day4.ipynb) | [ngay-4-ai-video-026-032-tieng-viet.md](ngay-4-ai-video-026-032-tieng-viet.md) |
| Ngày 5 | [day5.ipynb](day5.ipynb) | [AI-Day-5-033-037-Day-du.md](AI-Day-5-033-037-Day-du.md), [AI-Day-5-033-037-Tom-tat.md](AI-Day-5-033-037-Tom-tat.md) |
| Bài tập | [week1 EXERCISE.ipynb](week1%20EXERCISE.ipynb) | Lời giải tham khảo tại [solutions/week1 SOLUTION.ipynb](solutions/week1%20SOLUTION.ipynb) |
| Bản Ollama của Day 1 | [solutions/day1_with_ollama.ipynb](solutions/day1_with_ollama.ipynb) | Dùng khi không muốn trả phí OpenAI |

---

## 9. Các điểm dễ nhầm trong cả tuần

1. **Package `openai` không chứa model bên trong máy** — nó chỉ là client library gọi HTTP đến server của OpenAI (hoặc bất kỳ endpoint tương thích nào qua `base_url`).
2. **LLM không xác định (non-deterministic)** — cùng một prompt có thể cho ra câu chữ khác nhau ở hai lần gọi, khác hẳn hàm thuần (pure function) trong lập trình truyền thống.
3. **Mỗi lời gọi LLM là stateless** — "trí nhớ" của chatbot chỉ là việc code gửi lại toàn bộ lịch sử hội thoại mỗi lần gọi, không phải model tự nhớ.
4. **Token ≠ ký tự ≠ từ** — số ký tự cắt bớt (2.000 ở Day 1, 5.000 ở Day 5) không đồng nghĩa với số token thực tế model xử lý.
5. **`response_format={"type": "json_object"}` chỉ ép đúng cú pháp JSON, không đảm bảo đúng schema hay đúng nội dung** — Structured Outputs (học ở Week 8) mới ràng buộc chặt hơn.
6. **Web scraping đơn giản bằng `requests` + `BeautifulSoup` không chạy được với mọi trang** — trang render bằng JavaScript (SPA React/Vue) hoặc có chặn bot sẽ thất bại hoặc trả về nội dung rỗng.
7. **Đưa một ví dụ mẫu vào prompt (one-shot prompting) không phải là huấn luyện lại model** — ví dụ chỉ có tác dụng trong phạm vi ngữ cảnh của lần gọi đó.

---

## 10. Mục tiêu cuối cùng

Sau khi học xong Week 1, người học có thể:

- Giải thích được LLM, prompt, system/user message bằng lời của chính mình.
- Thiết lập và kiểm tra API key an toàn qua file `.env`.
- Gọi Chat Completions API bằng cả cách gọi HTTP thô lẫn qua thư viện `openai`.
- Đổi nhà cung cấp model (OpenAI ⇄ Gemini ⇄ Ollama local) chỉ bằng cách đổi `base_url`/`api_key`/`model`.
- Giải thích vì sao mỗi lời gọi LLM là stateless, và cách "giả lập" trí nhớ bằng cách gửi lại lịch sử hội thoại.
- Đọc hiểu và tự viết một pipeline nhiều bước: thu thập dữ liệu bằng code → để AI xử lý phần cần hiểu ngôn ngữ → ghép kết quả thành sản phẩm cuối (brochure).
- Nhận diện rõ giới hạn: đây vẫn là **inference**, chưa có bước huấn luyện/fine-tuning nào (sẽ gặp ở Week 6-7).
