<!-- markdownlint-disable MD024 MD025 MD060 -->

# Week 2 — Ghi chú tổng hợp: Đa nhà cung cấp, Gradio UI, Chatbot và Tool Calling

> **Mục tiêu tuần:** gọi được nhiều nhà cung cấp model AI khác nhau và biết cách so sánh chúng, biến một hàm Python gọi AI thành giao diện web bằng Gradio, xây chatbot có "lịch sử hội thoại", rồi cho AI gọi hàm/công cụ (tool calling) để tra dữ liệu thật và cuối cùng ghép mọi thứ thành một trợ lý đa phương thức (chữ + ảnh + giọng nói).
>
> Tài liệu này tổng hợp lại nội dung Day 1–5 của Week 2 từ các bản ghi chú đã có: [tuan-02-ngay-01-tom-tat.md](tuan-02-ngay-01-tom-tat.md) / [-day-du.md](tuan-02-ngay-01-day-du.md), [AI-Day-2-007-011-Tom-tat.md](AI-Day-2-007-011-Tom-tat.md) / [-Day-du.md](AI-Day-2-007-011-Day-du.md), [AI-Day-3-012-014-Tom-Tat.md](AI-Day-3-012-014-Tom-Tat.md) / [-Day-Du.md](AI-Day-3-012-014-Day-Du.md), [Day-4-015-019-Tom-tat.md](Day-4-015-019-Tom-tat.md) / [-Giai-thich-day-du.md](Day-4-015-019-Giai-thich-day-du.md), [AI-Day-5-020-024-Tom-tat.md](AI-Day-5-020-024-Tom-tat.md) / [-Day-du.md](AI-Day-5-020-024-Day-du.md), cùng notebook thật `day1.ipynb`–`day5.ipynb`.

## Mục lục

1. [Bức tranh toàn cảnh](#1-bức-tranh-toàn-cảnh)
2. [Ngày 1 — Gọi nhiều nhà cung cấp AI và so sánh model](#2-ngày-1--gọi-nhiều-nhà-cung-cấp-ai-và-so-sánh-model)
3. [Ngày 2 — Gradio: biến hàm Python thành ứng dụng web](#3-ngày-2--gradio-biến-hàm-python-thành-ứng-dụng-web)
4. [Ngày 3 — Chatbot có lịch sử hội thoại và RAG kiểu từ khóa](#4-ngày-3--chatbot-có-lịch-sử-hội-thoại-và-rag-kiểu-từ-khóa)
5. [Ngày 4 — Tool Calling: để AI gọi hàm của bạn](#5-ngày-4--tool-calling-để-ai-gọi-hàm-của-bạn)
6. [Ngày 5 — Agentic AI và Multimodal: chữ, ảnh, giọng nói](#6-ngày-5--agentic-ai-và-multimodal-chữ-ảnh-giọng-nói)
7. [Bài tập cuối tuần](#7-bài-tập-cuối-tuần)
8. [Bảng liên kết tài liệu nguồn](#8-bảng-liên-kết-tài-liệu-nguồn)
9. [Các điểm dễ nhầm trong cả tuần](#9-các-điểm-dễ-nhầm-trong-cả-tuần)
10. [Mục tiêu cuối cùng](#10-mục-tiêu-cuối-cùng)

---

## 1. Bức tranh toàn cảnh

### Tóm tắt quy trình của tuần

Week 2 xây dần một trợ lý AI hoàn chỉnh, từng bước một:

1. **Ngày 1:** gọi nhiều nhà cung cấp model (OpenAI, Anthropic, Google, Groq, Ollama, OpenRouter...), so sánh chất lượng, và cho hai model "nói chuyện" với nhau qua một vòng lặp do mình viết.
2. **Ngày 2:** dùng **Gradio** để biến một hàm Python gọi AI thành giao diện web thật sự có ô nhập, nút bấm và hiển thị kết quả dần (streaming).
3. **Ngày 3:** nâng cấp giao diện đó thành **chatbot có lịch sử hội thoại**, rồi thêm một dạng RAG rất đơn giản (kiểm tra từ khóa trong câu hỏi để bổ sung dữ kiện vào prompt).
4. **Ngày 4:** dạy AI **gọi hàm** (tool calling/function calling) để tra cứu dữ liệu thật (giá vé máy bay) thay vì tự bịa, kể cả khi cần gọi nhiều tool hoặc nhiều vòng.
5. **Ngày 5:** ghép tool calling với **multimodal** — model quyết định khi nào cần tra giá, rồi chương trình gọi thêm dịch vụ tạo ảnh và chuyển văn bản thành giọng nói (TTS), đóng gói tất cả trong một giao diện Gradio Blocks.

### Ý nghĩa chính của tuần

Nếu Week 1 dạy "gọi một model", thì Week 2 dạy **"biến một lời gọi model thành một ứng dụng thật có người dùng tương tác được"**. Ba mảnh ghép quan trọng nhất được lặp lại xuyên suốt:

```text
Model (bộ não trả lời)
    + Giao diện Gradio (nơi người dùng gõ và xem kết quả)
    + Lịch sử/Tool (dữ liệu và hành động thật, không chỉ chữ)
    = Một ứng dụng AI có thể dùng được, không chỉ là một cell notebook
```

Đây cũng là tuần đầu tiên khóa học nhắc rõ đến **Agentic AI** (model tự quyết định bước hành động tiếp theo) — ý tưởng này sẽ được đào sâu ở Week 8.

---

## 2. Ngày 1 — Gọi nhiều nhà cung cấp AI và so sánh model

**Nguồn:** [day1.ipynb](day1.ipynb) · bài giảng đầy đủ [tuan-02-ngay-01-day-du.md](tuan-02-ngay-01-day-du.md) / tóm tắt [tuan-02-ngay-01-tom-tat.md](tuan-02-ngay-01-tom-tat.md) (bài 001–006).

### Tóm tắt quy trình

Notebook lần lượt: kết nối nhiều provider (OpenAI, Anthropic/Claude, Google/Gemini, Groq, Ollama...), thử tăng "mức suy luận" (`reasoning_effort`) của một model, đưa hai câu đố logic cho nhiều model so sánh câu trả lời, cung cấp thêm ngữ cảnh thật (toàn văn vở kịch Hamlet) để xem chất lượng trả lời thay đổi ra sao, rồi cuối cùng cho hai model trò chuyện qua lại với nhau bằng một vòng lặp Python tự viết.

### Kiến thức và thuật ngữ chính

| Tên / khái niệm | Hiểu nhanh |
|---|---|
| SDK / client library | Thư viện Python giúp gửi request tới model — không quyết định model chạy ở hãng nào |
| OpenAI-compatible API | Giao diện gọi giống OpenAI; **không đồng nghĩa** là đang dùng model của OpenAI |
| Groq (chữ Q) | Dịch vụ/hạ tầng chạy mô hình tốc độ cao — khác với **Grok** (chữ K, họ model của xAI) |
| OpenRouter | Điểm truy cập trung gian, định tuyến tới nhiều model/dịch vụ khác nhau |
| LangChain / LiteLLM | Framework/thư viện hỗ trợ gọi thống nhất nhiều provider, theo dõi usage và chi phí |
| Reasoning effort / test-time scaling | Cho model "suy nghĩ" nhiều hơn trước khi trả lời — có thể đổi kết quả nhưng không phải huấn luyện lại và không đảm bảo luôn đúng |
| Prompt caching | Tái sử dụng phần xử lý của đầu vào lặp lại để giảm chi phí — **không phải** trí nhớ vĩnh viễn hay lưu sẵn câu trả lời |

### Bốn bài học quan trọng nhất

1. **Chọn model khác và tăng reasoning là hai việc khác nhau** — cả hai đều cần đo bằng tác vụ thật (đúng đến đâu, nhanh đến đâu, tốn bao nhiêu), không chỉ tin vào tên gọi.
2. **Đưa đúng thông tin quan trọng hơn đổi model** — ví dụ trong bài: model trả lời sai về Hamlet khi chưa được cấp toàn văn vở kịch, và trả lời đúng hơn hẳn sau khi được cấp. Đây là **thiết kế ngữ cảnh (context design)** — gửi thẳng tài liệu vào prompt vẫn chưa phải một hệ thống RAG có bước truy xuất thật sự (RAG thật sẽ học ở Week 5).
3. **Lịch sử hội thoại và tài liệu đính kèm đều tốn input token** — gửi càng nhiều ngữ cảnh, chi phí và độ trễ càng tăng.
4. **Hai AI "nói chuyện" với nhau chỉ là một vòng lặp do người viết code điều khiển**: gọi model A → lưu câu trả lời → gán câu đó là `user` khi gửi cho model B → lưu câu trả lời của B → lặp lại. Không có gì "tự phát" — toàn bộ do vòng `for`/`while` trong code quyết định số lượt.

### Chốt ý nghĩa thực tế

Ngày 1 khẳng định lại: chất lượng một ứng dụng AI phụ thuộc vào cách bạn **chọn model, cung cấp thông tin, kiểm tra đầu ra và tổ chức các lượt gọi** — không chỉ vào tên model đắt tiền nhất.

---

## 3. Ngày 2 — Gradio: biến hàm Python thành ứng dụng web

**Nguồn:** [day2.ipynb](day2.ipynb) · bài giảng đầy đủ [AI-Day-2-007-011-Day-du.md](AI-Day-2-007-011-Day-du.md) / tóm tắt [AI-Day-2-007-011-Tom-tat.md](AI-Day-2-007-011-Tom-tat.md) (bài 007–011).

### Tóm tắt quy trình

Từ một hàm `shout(text)` viết hoa đơn giản, notebook dần thay callback đó bằng một hàm thật sự gọi GPT, thêm hiển thị Markdown, thêm streaming (hiện chữ dần), rồi thêm dropdown chọn giữa GPT và Claude, cuối cùng tái sử dụng toàn bộ luồng đó để làm lại "Brochure Generator" của Week 1 nhưng có giao diện web.

### Ví dụ nhỏ nhất để hiểu cả bài

```python
import gradio as gr

def shout(text):
    return text.upper()

view = gr.Interface(fn=shout, inputs="text", outputs="text")
view.launch()
```

Gõ `hello`, bấm Submit, Gradio tự gọi `shout("hello")` và hiển thị `HELLO`. **Gradio lo giao diện và tương tác; callback (`fn`) lo xử lý; model lo sinh nội dung** — chỉ cần thay nội dung hàm `shout` bằng một lời gọi AI là có ngay một "UI hỏi AI".

### Khái niệm quan trọng

| Khái niệm | Nghĩa dễ nhớ |
|---|---|
| Callback | `fn=shout` truyền **cái hàm** để Gradio tự gọi sau, không gọi ngay như `shout()` — giống truyền `handler` cho `onClick` trong React |
| `gr.Markdown()` | Hiển thị chuỗi có định dạng tiêu đề/danh sách do AI trả về |
| Streaming | API trả kết quả theo từng mảnh; callback phải **cộng dồn** rồi `yield` toàn bộ nội dung đã có, không chỉ mảnh mới |
| Generator / `yield` | Một hàm có thể "trả" nhiều lần thay vì trả một lần rồi kết thúc như `return` |
| Model selector | Input thứ hai của callback (ví dụ dropdown) cho biết nên gọi GPT hay Claude |

Cách stream đúng vào Gradio là cộng dồn văn bản:

```python
result = ""
for chunk in chunks:
    result += chunk
    yield result
```

### Brochure Generator có giao diện web

1. Người dùng nhập tên công ty, URL, chọn model.
2. Hàm scraper (từ Week 1) lấy nội dung trang.
3. Callback ghép nội dung vào prompt.
4. GPT hoặc Claude viết brochure; giao diện hiển thị dần bằng Markdown.

**Lưu ý:** demo chỉ đọc landing page, gửi một URL cho model không có nghĩa model tự "ghé thăm" trang đó — chỉ có scraper mới thực sự lấy nội dung.

### Chốt ý nghĩa thực tế

Ngày 2 cho thấy khoảng cách từ "code chạy trong notebook" đến "ứng dụng có giao diện" ngắn hơn tưởng tượng rất nhiều — chỉ cần đúng 3 tham số `fn`, `inputs`, `outputs` của `gr.Interface`.

---

## 4. Ngày 3 — Chatbot có lịch sử hội thoại và RAG kiểu từ khóa

**Nguồn:** [day3.ipynb](day3.ipynb) · bài giảng đầy đủ [AI-Day-3-012-014-Day-Du.md](AI-Day-3-012-014-Day-Du.md) / tóm tắt [AI-Day-3-012-014-Tom-Tat.md](AI-Day-3-012-014-Tom-Tat.md) (bài 012–014).

### Tóm tắt quy trình

Notebook dựng `gr.ChatInterface`, chứng minh UI và AI là hai phần tách biệt (dùng một callback trả lời cố định `"bananas"` trước), sau đó nối callback đó với API thật kèm `history`, thêm streaming, rồi thêm một system prompt đóng vai trợ lý cửa hàng — có cả một dạng RAG rất thô sơ: kiểm tra chữ `"belt"` trong câu hỏi để chèn thêm dữ kiện "cửa hàng không bán thắt lưng" vào prompt.

### Kiến thức chính

- **`chat(message, history)`**: `message` là câu người dùng vừa gõ; `history` là các lượt trước đó; `gr.ChatInterface(fn=chat, type="messages")` tự quản lý và truyền `history` này vào mỗi lần callback được gọi.
- **"Trí nhớ" chỉ là gửi lại lịch sử**: mỗi lượt gọi API thực chất gửi `system prompt + history + câu hỏi mới`. Model trả lời đúng tên người dùng vì tên đó nằm ngay trong `history` được gửi lại, không phải vì model tự nhớ.
- **One-shot / few-shot prompting**: đưa một hoặc vài ví dụ mẫu vào prompt để định hướng cách trả lời — "shot" ở đây là số lượng ví dụ, **không phải** số lần gọi API.
- **RAG (Retrieval-Augmented Generation) ở mức sơ khai nhất**: ý tưởng cốt lõi là "tìm thông tin liên quan → thêm vào đầu vào → nhờ model trả lời dựa trên đó". Bài này minh họa bằng cách kiểm tra từ khóa viết sẵn (`belt`), **chưa** có embedding hay vector database thật (những thứ đó học ở Week 5). RAG cũng không bắt buộc phải dùng vector database.

### Vì sao chỉ thêm dữ liệu liên quan, không gửi cả kho dữ liệu?

Vì hàng nghìn sản phẩm gửi hết vào mỗi lượt sẽ khiến prompt quá dài, tốn token và tiền — nhưng nếu tìm sai/thiếu dữ liệu liên quan thì câu trả lời vẫn có thể sai (ví dụ: kiểm tra chữ `belt` sẽ bỏ sót câu hỏi bằng tiếng Việt như "dây nịt", hoặc câu hỏi nối tiếp kiểu "loại đó giá bao nhiêu?").

### Chốt ý nghĩa thực tế

Ngày 3 tách rõ ba lớp trách nhiệm: **Gradio lo giao diện chat, callback là "backend", history + prompt + dữ kiện truy xuất là đầu vào chuẩn bị cho model** — đúng cách tư duy của một lập trình viên web khi tách frontend/backend/data layer.

---

## 5. Ngày 4 — Tool Calling: để AI gọi hàm của bạn

**Nguồn:** [day4.ipynb](day4.ipynb), [prices.db](prices.db) · bài giảng đầy đủ [Day-4-015-019-Giai-thich-day-du.md](Day-4-015-019-Giai-thich-day-du.md) / tóm tắt [Day-4-015-019-Tom-tat.md](Day-4-015-019-Tom-tat.md) (bài 015–019).

### Tóm tắt quy trình

Notebook xây một chatbot hãng hàng không có thể tra **giá vé thật** bằng cách khai báo một "tool" (công cụ) cho model biết, xử lý yêu cầu gọi tool mà model trả về, chạy hàm Python thật, rồi gửi kết quả về lại cho model để nó viết câu trả lời cuối cùng. Cuối bài, dữ liệu giá vé được chuyển từ `dict` trong bộ nhớ sang một database SQLite thật (`prices.db`).

### Luồng hoạt động cốt lõi (bắt buộc phải hiểu)

Câu hỏi ví dụ: **"Giá vé đi London bao nhiêu?"**

1. Backend gửi câu hỏi + lịch sử + mô tả `tools` cho model.
2. Model **không tự trả lời** mà trả về một yêu cầu: hãy gọi hàm `get_ticket_price("London")`.
3. Backend (code Python) kiểm tra và **tự chạy** hàm đó, nhận kết quả (ví dụ 799 USD).
4. Backend thêm cả "yêu cầu gọi tool" lẫn "kết quả tool" vào lịch sử rồi **gọi lại model lần thứ hai**.
5. Model dùng kết quả đó viết câu trả lời bằng ngôn ngữ tự nhiên.

Vì vậy **một câu hỏi cần dùng tool thường tốn ít nhất hai lượt gọi model**, không phải một. Điểm mấu chốt: **schema chỉ mô tả hàm, model không tự chạy được code trên máy bạn** — code thực thi luôn do backend kiểm soát.

### Các tên kỹ thuật cần nhớ

| Tên | Nghĩa |
|---|---|
| `tools` | Danh sách mô tả công cụ (tên hàm, mục đích, tham số) gửi kèm cho model |
| `tool_calls` | Các yêu cầu gọi công cụ mà model trả về (thay vì trả lời trực tiếp) |
| `arguments` | Tham số của lời gọi, thường ở dạng chuỗi JSON cần giải mã |
| `role: "assistant"` chứa tool call | Tin nhắn ghi lại việc model yêu cầu gọi tool |
| `role: "tool"` | Tin nhắn chứa kết quả do backend thực thi, được ghép lại bằng `tool_call_id` |

### Hai kiểu "nhiều lần gọi" cần phân biệt

| Tình huống | Cách xử lý |
|---|---|
| "So sánh giá London và Paris" | Model có thể trả về **hai tool call trong cùng một phản hồi** → dùng vòng lặp `for` chạy cả hai và trả kết quả tương ứng từng `tool_call_id` |
| "Tra London, nếu dưới 1.000 USD thì tra thêm Paris" | Phải biết kết quả London trước mới quyết định bước sau → cần **nhiều vòng gọi model liên tiếp**, mỗi vòng vẫn gửi kèm `tools` |

### SQLite thay đổi điều gì?

`get_ticket_price` chuyển từ tra một `dict` trong bộ nhớ sang chạy `SELECT price FROM prices WHERE city = ?` trong file `prices.db` — dùng tham số hóa câu truy vấn (không nối chuỗi thủ công, tránh SQL injection). Có thêm `set_ticket_price` để ghi/cập nhật giá kèm `commit()`. Đây **chưa phải text-to-SQL**: model chỉ đưa tên thành phố, còn câu SQL vẫn do lập trình viên viết sẵn.

### Chốt ý nghĩa thực tế

Ngày 4 là bước quan trọng để AI từ "chỉ biết nói" chuyển sang "biết tra cứu và hành động dựa trên dữ liệu thật" — nền tảng trực tiếp cho khái niệm **Agent** ở Week 8. Bài học an toàn quan trọng: mọi quyền hạn (đọc, ghi, sửa dữ liệu) vẫn phải được kiểm soát ở phía backend, không dựa vào lời người dùng tự xưng "tôi là admin" trong đoạn chat.

---

## 6. Ngày 5 — Agentic AI và Multimodal: chữ, ảnh, giọng nói

**Nguồn:** [day5.ipynb](day5.ipynb), [extra.ipynb](extra.ipynb) · bài giảng đầy đủ [AI-Day-5-020-024-Day-du.md](AI-Day-5-020-024-Day-du.md) / tóm tắt [AI-Day-5-020-024-Tom-tat.md](AI-Day-5-020-024-Tom-tat.md) (bài 020–024).

### Tóm tắt quy trình

Notebook ôn lại tool calling với SQLite, sau đó bổ sung khả năng **multimodal**: tạo ảnh minh họa thành phố và chuyển câu trả lời thành giọng nói (TTS), tất cả gói trong một giao diện `gr.Blocks` (bố cục Gradio linh hoạt hơn `gr.Interface`). Bài 024 mở rộng sang thử cùng một đề bài (vẽ SVG) trên nhiều model khác nhau qua OpenRouter để so sánh.

### Luồng hoạt động đầy đủ

Câu hỏi ví dụ: **"Đi Paris hay Tokyo rẻ hơn?"**

1. Model nhận câu hỏi + mô tả tool tra giá.
2. Model yêu cầu gọi `get_ticket_price` cho cả hai thành phố.
3. Python chạy truy vấn SQLite, gửi kết quả về model.
4. Model so sánh và viết câu trả lời.
5. Hàm `talker(reply)` đọc câu trả lời thành giọng nói; hàm `artist(city)` vẽ ảnh minh họa thành phố.
6. `gr.Blocks` hiển thị đồng thời: khung chat, trình phát âm thanh, ảnh.

Một lượt hỏi đầy đủ như trên có thể tốn tới **4 lời gọi AI khác nhau**: (1) chat xin gọi tool, (2) chat trả lời sau khi có kết quả tool, (3) tạo giọng nói, (4) tạo ảnh — còn truy vấn SQLite không phải là một lời gọi AI.

### Phân biệt các khái niệm dễ lẫn

| Khái niệm | Nói đơn giản |
|---|---|
| **Agentic AI** | Model tham gia **quyết định hành động** tiếp theo (ví dụ: có cần gọi tool tra giá không) |
| **Workflow** | Luồng xử lý do hệ thống/code tổ chức sẵn, có thể cố định hoặc để model quyết định một phần |
| **Multimodal** | Ứng dụng xử lý/tạo ra nhiều dạng dữ liệu: chữ, ảnh, âm thanh |
| **Tool calling** | Cơ chế kỹ thuật giúp model yêu cầu chạy một hàm cụ thể |

Nhiều lời gọi AI nối tiếp nhau **chưa đủ** để gọi là "agent tự chủ" — demo này mang tính agentic chủ yếu ở bước chọn tool tra giá, còn việc tạo ảnh/giọng nói vẫn chạy theo luồng code cố định.

### Bài 024 — So sánh nhiều model bằng SVG qua OpenRouter

**SVG** là văn bản XML mô tả hình vẽ vector — model sinh ra các phần tử hình học và tọa độ, phần mềm khác mới render thành ảnh (khác hẳn việc gọi thẳng một API tạo ảnh như bài 022). OpenRouter cho phép gửi cùng một đề bài tới nhiều model khác nhau để so sánh: bám sát đề, SVG có hợp lệ không, chất lượng hình, thời gian phản hồi, chi phí và độ ổn định qua nhiều lần chạy — chứ không chỉ dựa vào một lần thử để kết luận model nào "giỏi nhất".

### Chốt ý nghĩa thực tế

Ngày 5 là bản tổng duyệt của cả tuần: model quyết định **khi nào cần hành động** (tool calling), còn code chịu trách nhiệm **kết nối dữ liệu, thực thi hành động, và trình bày kết quả** trên giao diện — đúng nguyên lý sẽ được mở rộng thành một hệ nhiều Agent hoàn chỉnh ở Week 8.

---

## 7. Bài tập cuối tuần

**Nguồn:** [week2 EXERCISE.ipynb](week2%20EXERCISE.ipynb).

Bài tập yêu cầu nâng cấp "Technical Question Explainer" của bài tập Week 1 thành một prototype đầy đủ hơn: có giao diện Gradio, có streaming, dùng system prompt để thêm "chuyên môn" cho trợ lý, và **cho phép đổi qua lại giữa nhiều model**. Điểm cộng nếu thêm được tool calling; thử thách nâng cao là thêm đầu vào/đầu ra bằng giọng nói.

**Chốt ý nghĩa thực tế:** bài tập này buộc người học tự ghép lại toàn bộ 5 mảnh kiến thức của tuần (multi-provider, Gradio, history, tool, multimodal) thành một sản phẩm cá nhân, thay vì chỉ chạy lại notebook mẫu.

---

## 8. Bảng liên kết tài liệu nguồn

| Ngày | Notebook / code | Ghi chú tiếng Việt (Tóm tắt / Đầy đủ) |
|---|---|---|
| Ngày 1 | [day1.ipynb](day1.ipynb) | [tuan-02-ngay-01-tom-tat.md](tuan-02-ngay-01-tom-tat.md) / [-day-du.md](tuan-02-ngay-01-day-du.md) |
| Ngày 2 | [day2.ipynb](day2.ipynb) | [AI-Day-2-007-011-Tom-tat.md](AI-Day-2-007-011-Tom-tat.md) / [-Day-du.md](AI-Day-2-007-011-Day-du.md) |
| Ngày 3 | [day3.ipynb](day3.ipynb) | [AI-Day-3-012-014-Tom-Tat.md](AI-Day-3-012-014-Tom-Tat.md) / [-Day-Du.md](AI-Day-3-012-014-Day-Du.md) |
| Ngày 4 | [day4.ipynb](day4.ipynb), [prices.db](prices.db) | [Day-4-015-019-Tom-tat.md](Day-4-015-019-Tom-tat.md) / [-Giai-thich-day-du.md](Day-4-015-019-Giai-thich-day-du.md) |
| Ngày 5 | [day5.ipynb](day5.ipynb), [extra.ipynb](extra.ipynb) | [AI-Day-5-020-024-Tom-tat.md](AI-Day-5-020-024-Tom-tat.md) / [-Day-du.md](AI-Day-5-020-024-Day-du.md) |
| Bài tập | [week2 EXERCISE.ipynb](week2%20EXERCISE.ipynb) | — |

---

## 9. Các điểm dễ nhầm trong cả tuần

1. **OpenAI-compatible API không có nghĩa đang dùng model của OpenAI** — chỉ là cùng một kiểu giao diện gọi.
2. **Groq (hạ tầng chạy nhanh) khác với Grok (họ model của xAI)** — hai tên rất dễ gõ nhầm.
3. **Tăng "reasoning effort" không phải là huấn luyện lại model**, và không đảm bảo câu trả lời luôn đúng.
4. **Callback (`fn`) phải được truyền dưới dạng hàm** (`fn=shout`), không phải gọi sẵn (`fn=shout()`).
5. **Streaming phải cộng dồn nội dung trước khi `yield`**, nếu không giao diện sẽ chỉ hiển thị từng mảnh rời rạc thay vì câu trả lời đầy đủ dần.
6. **"Trí nhớ" của chatbot chỉ là gửi lại `history` mỗi lượt** — không có bộ nhớ dài hạn nào được lưu trữ nếu không tự code thêm.
7. **RAG không bắt buộc phải có vector database** — cốt lõi của RAG là "tìm thông tin liên quan rồi thêm vào đầu vào của model"; kiểm tra từ khóa đơn giản (như bài Day 3) đã là một dạng RAG sơ khai.
8. **Tool calling không phải là model tự chạy code trên máy bạn** — model chỉ trả về một *yêu cầu* gọi hàm; code Python của bạn mới là bên thực thi và phải tự kiểm tra quyền hạn/dữ liệu đầu vào.
9. **Một phản hồi có thể chứa nhiều `tool_calls` cùng lúc** — cần lặp qua tất cả, không chỉ lấy phần tử đầu tiên.
10. **Nhiều lời gọi AI nối tiếp nhau chưa chắc là "agent tự chủ"** — cần model thật sự tham gia quyết định bước tiếp theo mới tính là agentic.

---

## 10. Mục tiêu cuối cùng

Sau khi học xong Week 2, người học có thể:

- Gọi được nhiều nhà cung cấp model khác nhau (OpenAI, Claude, Gemini, Groq, Ollama, OpenRouter...) và biết cách so sánh chúng một cách công bằng.
- Dựng một giao diện Gradio (`gr.Interface` hoặc `gr.ChatInterface`/`gr.Blocks`) cho một hàm Python gọi AI, có streaming.
- Giải thích chính xác cơ chế "trí nhớ" của chatbot dựa trên việc gửi lại lịch sử hội thoại mỗi lượt.
- Viết một dạng RAG đơn giản: tìm dữ kiện liên quan và chèn vào prompt trước khi gọi model.
- Khai báo tool/function cho model, xử lý đúng vòng lặp `tool_calls` (kể cả nhiều tool trong một phản hồi, và nhiều vòng phụ thuộc nhau).
- Kết hợp tool calling với các dịch vụ khác (tạo ảnh, TTS) để xây một trợ lý multimodal có giao diện hoàn chỉnh.
- Phân biệt rõ ràng: đây vẫn là **ứng dụng dùng AI có sẵn** (inference + tool calling), chưa phải huấn luyện hay agent tự chủ hoàn toàn (những chủ đề đó nằm ở Week 6-8).
