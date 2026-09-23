# 00 — Lộ trình học

> File này trả lời 3 câu hỏi: **tôi cần ôn gì trước**, **tôi sẽ học theo thứ tự nào**, và **làm sao biết tôi đã hiểu đủ để đi tiếp**.

---

## 1. Kiến thức nền cần bổ sung

Bạn có nền frontend React/JavaScript vững, nhưng khóa học dùng Python + Jupyter Notebook. Dưới đây là các khoảng cách kiến thức cụ thể, xếp theo mức độ cần thiết ngay từ Bài 01.

### 1.1. Jupyter Notebook — môi trường làm việc mới

- Notebook (`.ipynb`) gồm nhiều **cell** (ô), có 2 loại chính: Markdown (văn bản/giải thích) và Code (mã Python chạy được).
- Bạn chạy từng cell bằng `Shift + Enter`. **Thứ tự chạy quan trọng hơn thứ tự hiển thị** — nếu bạn chạy cell số 10 trước khi chạy cell số 3 (nơi khai báo biến), bạn sẽ gặp `NameError`.
- Đối chiếu với React: gần giống việc bạn mở Console trong Chrome DevTools và gõ từng dòng lệnh — biến bạn khai báo sẽ "sống" trong bộ nhớ (gọi là **kernel**) cho tới khi bạn restart kernel hoặc đóng notebook, y hệt biến toàn cục trong console tồn tại tới khi bạn tải lại (reload) trang.
- Giới hạn của phép so sánh: notebook **không** có khái niệm re-render hay virtual DOM như React; nó chỉ là một REPL (vòng lặp đọc–chạy–in kết quả) có giao diện đẹp hơn.
- Đọc thêm: `guides/05_notebooks.ipynb` (chưa được tôi đọc chi tiết trong phiên này).

### 1.2. Python rất cơ bản

Bạn không cần giỏi Python trước khi học, nhưng nên nhận mặt được các cấu trúc sau (sẽ giải thích lại ngay khi gặp trong Bài 01, không cần học thuộc trước):

| Khái niệm Python | Tương đương gần trong JavaScript |
| --- | --- |
| `import x` / `from x import y` | `import x from '...'` / `import { y } from '...'` |
| `def ten_ham(tham_so):` | `function tenHam(thamSo) { ... }` |
| `dict` (`{"key": "value"}`) | Object literal `{ key: 'value' }` |
| `list` (`[1, 2, 3]`) | Array `[1, 2, 3]` |
| f-string `f"Xin chào {ten}"` | Template literal `` `Xin chào ${ten}` `` |
| Thụt lề (indentation) quyết định khối lệnh | Dấu `{ }` quyết định khối lệnh |

- Nguồn bổ sung chính thức của khóa học: `guides/06_python_foundations.ipynb` — tổng hợp các liên kết ChatGPT giải thích import, hàm, string, f-string, list/dict/set, file, class, và cách tự sửa lỗi `NameError`. Tôi đã đọc phần mục lục của guide này; nội dung chi tiết nằm ở các liên kết ngoài, tôi chưa mở từng liên kết đó.

### 1.3. Biến môi trường & API key

- File `.env` ở thư mục gốc project dùng để lưu các "chìa khóa bí mật" (API key) mà **không commit lên Git**. Tương tự file `.env` bạn từng dùng với Node/Vite/Next.js.
- Khác biệt: Python đọc `.env` qua thư viện `python-dotenv` (hàm `load_dotenv()`), không tự động như một số framework JS.
- Lý do phải giấu API key: key này dùng để tính phí vào tài khoản của bạn — lộ key = người khác tiêu tiền hộ bạn.
- Đọc thêm: `guides/04_technical_foundations.ipynb` (chưa đọc chi tiết trong phiên này).

### 1.4. Khái niệm API/HTTP — bạn đã biết một phần rồi

- Bạn đã quen gọi REST API bằng `fetch`/`axios` ở frontend. Ở Python, khóa học dùng thư viện `requests` (giống `axios`) để gọi HTTP trực tiếp, và thư viện `openai` (một **client library** — lớp bọc tiện lợi quanh việc gọi HTTP) để gọi model AI.
- Điểm khác: gọi API OpenAI ở đây chạy **phía Python (server-side/local)**, không phải trong trình duyệt — nên API key được giữ an toàn hơn so với việc để lộ key trong code frontend chạy trên trình duyệt người dùng.

### 1.5. Khái niệm AI/LLM — sẽ học sâu ngay ở Bài 01

Chỉ cần nắm sơ bộ trước khi vào Bài 01: **LLM (Large Language Model — mô hình ngôn ngữ lớn)** là một chương trình đã được huấn luyện trước (pretrained) trên rất nhiều văn bản, có khả năng nhận một đoạn văn bản đầu vào (**prompt**) và sinh ra văn bản tiếp theo hợp lý. Khi bạn gọi API, bạn **không huấn luyện lại** model — bạn chỉ đang "hỏi" một model đã huấn luyện xong (gọi là **inference** — suy luận). Khái niệm này sẽ được giải thích kỹ hơn, có ví dụ cụ thể, trong Bài 01.

### 1.6. Những guide chỉ cần đọc sau (chưa cần ngay)

- `guides/02_command_line.ipynb`, `03_git_and_github.ipynb`: hữu ích nhưng bạn có thể đã biết một phần từ công việc frontend; đọc khi cần làm Pull Request.
- `guides/07_vibe_coding_and_debugging.ipynb`, `08_debugging.ipynb`: hữu ích xuyên suốt khóa, không bắt buộc đọc ngay.
- `guides/10_intermediate_python.ipynb`, `11_async_python.ipynb`: cần trước khi vào Tuần 2 (nếu Tuần 2 dùng Gradio/async — **suy đoán chưa kiểm chứng**, sẽ xác nhận khi khảo sát Tuần 2).
- `guides/13_frontend.ipynb`, `14_docker_terraform.ipynb`: liên quan tới việc triển khai, nhiều khả năng chỉ cần ở các tuần cuối (Tuần 8) — **chưa kiểm chứng**.

---

## 2. Lộ trình chia theo bài nhỏ

Quy ước đánh số: mỗi "Bài" (lesson) trong bộ tài liệu này tương ứng khoảng 1 "Day" trong khóa gốc. Bảng dưới đây là **kế hoạch dự kiến**, chỉ Tuần 1 – Bài 01 là đã tạo; phần còn lại sẽ được tạo dần ở các lượt sau và có thể điều chỉnh khi tôi đọc kỹ notebook nguồn.

### Tuần 1 — Nền tảng: gọi API, prompting, so sánh model

| Bài | Chủ đề dự kiến | Nguồn | Trạng thái |
| --- | --- | --- | --- |
| 01 | Gọi API LLM lần đầu & Prompting cơ bản (system/user prompt), web scraping đơn giản, xây "web summarizer" | `week1/day1.ipynb` | **Đã tạo** |
| 02 | Chat Completions API "dưới nắp ca-pô" (gọi HTTP thô bằng `requests`), endpoint tương thích OpenAI, gọi Ollama/Gemini | `week1/day2.ipynb` | Chưa tạo |
| 03 | Chưa xác định — không thấy `day3.ipynb` trong `week1/` | Chưa rõ | Chưa khảo sát |
| 04 | Có thể là nội dung lý thuyết/video (dựa theo tên file ghi chú cũ `ngay-4-ai-video-026-032`) | `week1/day4.ipynb` (chưa đọc) | Chưa khảo sát |
| 05 | Có thể là "hội thoại đối kháng" giữa 2 model AI (dựa theo tên file ghi chú cũ `AI-Day-5-033-037`) | `week1/day5.ipynb` (chưa đọc) | Chưa khảo sát |

**Mục tiêu của cả Tuần 1:** tự tin gọi được API của ít nhất 1 frontier model bằng Python, hiểu cấu trúc `messages` (system/user), và biết ít nhất 2 giới hạn của việc gọi API/scraping đơn giản.

### Tuần 2 → Tuần 8 (khung dự kiến, mức tin cậy thấp — chỉ dựa trên tên thư mục/file)

| Tuần | Chủ đề dự kiến | Ghi chú tin cậy |
| --- | --- | --- |
| 2 | Gradio UI, có thể đa phương thức (ảnh/âm thanh), Tools/function calling | Suy luận từ tên thư mục, **chưa đọc notebook** |
| 3 | Mô hình mã nguồn mở với HuggingFace (pipelines/tokenizers/models) | Suy luận, **chưa đọc notebook** |
| 4 | Lựa chọn & đánh giá LLM; sinh/chuyển đổi code (Python→C++/Rust) | Suy luận từ tên file ghi chú cũ, **chưa đọc notebook** |
| 5 | RAG (Retrieval-Augmented Generation) với vector database | Suy luận từ tên thư mục (`knowledge-base/`, `vector_db/`), **chưa đọc notebook** |
| 6 | Fine-tuning cơ bản — bài toán dự đoán giá sản phẩm ("Pricer"), so sánh với baseline truyền thống | Suy luận từ tên file (`deep_neural_network.pth`, `human_in.csv`), **chưa đọc notebook** |
| 7 | QLoRA — fine-tuning tiết kiệm bộ nhớ cho model mã nguồn mở | Suy luận từ tên file ghi chú cũ, **chưa đọc notebook** |
| 8 | Agentic AI — hệ nhiều agent tự hoạt động (dự án capstone, 7 agent theo README gốc) | Suy luận từ tên thư mục (`agents/`, `deal_agent_framework.py`), **chưa đọc notebook** |

> Lộ trình Tuần 2-8 **sẽ được viết lại chính xác hơn** từng bài một, ngay trước khi bạn học tới, sau khi tôi đọc kỹ notebook nguồn của tuần đó. Không tạo toàn bộ 8 tuần cùng lúc để tránh suy đoán sai lệch.

---

## 3. Tiêu chí chứng minh bạn đã hiểu từng giai đoạn

Đừng chuyển bài/tuần chỉ vì đã "đọc xong" — hãy tự kiểm bằng các tiêu chí sau (không cần làm hoàn hảo, nhưng phải tự làm được phần lớn):

**Sau Bài 01 (kết thúc Tuần 1 phần đầu):**

- [ ] Giải thích được bằng lời riêng: system prompt khác user prompt ở điểm nào.
- [ ] Tự viết được (không copy) một `messages` list Python hợp lệ cho một tác vụ mới (không phải tóm tắt web).
- [ ] Chỉ ra được ít nhất 2 giới hạn của cách scraping/gọi API trong bài (ví dụ: web JS-render, bị chặn 403, cắt bớt nội dung).
- [ ] Phân biệt được: gọi API (inference — suy luận) **không phải** là huấn luyện (training) lại model.

**Sau khi hoàn tất Tuần 1 (khi các Bài 02-05 được tạo và học xong):**

- [ ] So sánh được câu trả lời của ít nhất 2 model khác nhau cho cùng 1 prompt, và nêu nhận xét (không cần "model nào tốt hơn tuyệt đối" — vì đây là đánh giá chủ quan/theo tiêu chí bạn tự chọn).

**Sau khi hoàn tất Tuần 5 (RAG) — mốc kiểm tra giữa khóa:**

- [ ] Giải thích được vì sao RAG giúp model trả lời dựa trên tài liệu riêng của bạn thay vì chỉ dựa vào kiến thức đã huấn luyện sẵn.

**Sau khi hoàn tất Tuần 7 (fine-tuning) — mốc quan trọng:**

- [ ] Phân biệt rõ ràng 4 khái niệm: dữ liệu huấn luyện, tham số model, hyperparameter, và quá trình training — không gộp chung thành "train AI".
- [ ] Không khẳng định "loss giảm nghĩa là model chắc chắn tốt hơn trong thực tế" mà không có bằng chứng đánh giá cụ thể.

> Các tiêu chí cho Tuần 2, 3, 4, 6, 8 sẽ được bổ sung khi các bài tương ứng được tạo, để tránh đặt tiêu chí cho nội dung tôi chưa xác nhận.

---

## 4. Câu hỏi tự kiểm tra ban đầu

Trả lời nhanh (trong đầu hoặc viết ra) trước khi bắt đầu Bài 01. Không có "điểm số" — mục đích là biết nên đọc thêm phần nào trước.

1. **Bạn có từng gọi một REST API từ JavaScript (`fetch`/`axios`) chưa? Bạn có thể mô tả request gồm những phần gì (URL, method, headers, body) không?**
   - Nếu **có** → tốt, Bài 01 sẽ tận dụng thẳng kiến thức này.
   - Nếu **chưa chắc** → đọc phần "API" trong `guides/04_technical_foundations.ipynb` trước khi vào Bài 01.

2. **Bạn có biết file `.env` dùng để làm gì không?**
   - Nếu **có** (đã dùng với Node/Next.js) → chỉ cần chú ý cách Python đọc nó khác (`load_dotenv` + `os.getenv`).
   - Nếu **chưa** → đọc mục 1.3 ở trên trước, rồi đọc phần tương ứng trong Bài 01.

3. **Bạn đã cài đặt xong môi trường theo `setup/SETUP-new.md` chưa (đã chạy `uv sync`, đã có file `.env` với `OPENAI_API_KEY`)?**
   - Nếu **chưa** → bạn vẫn đọc được lý thuyết Bài 01, nhưng cần hoàn tất bước này trước khi tự chạy notebook thật.

4. **Bạn có thể đoán sự khác nhau giữa "model" và "code gọi model" (ví dụ thư viện `openai`) không?**
   - Nếu **chưa chắc** → đây chính là trọng tâm đầu tiên của Bài 01, cứ học tiếp, không cần tự trả lời trước.

5. **Với kinh nghiệm React: khi bạn truyền `props` khác nhau vào cùng một component, output thường thay đổi theo một quy luật cố định, có thể đoán trước 100%. Bạn nghĩ điều này có đúng hệt với việc đưa input khác nhau vào một LLM không?**
   - Đây là câu hỏi mở, không có đáp án đúng/sai tuyệt đối ở bước này — Bài 01 sẽ giải thích rõ vì sao câu trả lời là "không hoàn toàn giống", và giới hạn của phép so sánh này.

---

*File này sẽ được cập nhật khi có bài học mới hoặc khi lộ trình Tuần 2-8 được xác nhận chi tiết hơn.*
