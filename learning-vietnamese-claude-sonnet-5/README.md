# Học lại khóa "LLM Engineering" bằng tiếng Việt (bản Claude Sonnet 5)

> Bộ tài liệu này được biên soạn **từ source code, notebook và tài liệu gốc** đang có trong workspace này — repo [`llm_engineering`](../README.md) của Ed Donner, dùng cho khóa Udemy **"LLM Engineering: Master AI, Large Language Models & Agents"**.
> Người học mục tiêu: có nền tảng frontend React/JavaScript, đã học qua khóa AI này một lần nhưng chưa hiểu sâu và chưa tự làm lại được.

---

## 0. Cách dùng bộ tài liệu này

1. Đọc [00-lo-trinh-hoc.md](00-lo-trinh-hoc.md) trước — file đó có bảng lộ trình, kiến thức nền cần bổ sung và câu hỏi tự kiểm tra.
2. Với mỗi bài, đọc file `*-chi-tiet.md` trước (học sâu), sau đó dùng file `*-tom-tat.md` để ôn nhanh.
3. Sau khi học/thực hành xong một bài, cập nhật [tien-do-hoc.md](tien-do-hoc.md) (hoặc nhờ tôi cập nhật giúp) để buổi học sau tiếp tục đúng chỗ, không phải học lại từ đầu.
4. Thư mục này **không đụng vào source code hoặc notebook gốc** của khóa học — mọi thứ chỉ là tài liệu học thêm.

---

## 1. Bức tranh tổng quan khóa học

Theo [README.md gốc](../README.md) của repo:

- Đây là khóa **8 tuần**, đi từ việc gọi API một model AI mạnh nhất hiện có (gọi là *frontier model* — mô hình tiên phong), tới việc **tự xây một hệ thống nhiều AI agent (tác nhân AI) phối hợp tự động** để giải quyết một bài toán kinh doanh (tuần 8).
- Các dự án được thiết kế **nối tiếp nhau**: kiến thức và code của tuần trước được dùng lại và mở rộng ở tuần sau.
- Về chi phí: khóa học dùng API trả phí (OpenAI, Anthropic, Google...) nhưng tác giả nói chi phí cả khóa chỉ vài đô la; luôn có lựa chọn miễn phí bằng **Ollama** (chạy model mã nguồn mở ngay trên máy).
- Công cụ cài đặt môi trường: **uv** (trình quản lý gói Python nhanh) — xem [setup/SETUP-new.md](../setup/SETUP-new.md).

> **Lưu ý minh bạch:** đây là mô tả tổng quan lấy từ chính văn bản README gốc, không phải điều tôi suy diễn.

---

## 2. Các nhóm chủ đề thực sự có trong nguồn

Bảng dưới đây liệt kê các tuần dựa trên tên thư mục, tên file (notebook + ghi chú có sẵn) và nội dung tôi đã **thực sự đọc**. Cột "Mức độ khảo sát" cho biết độ tin cậy của thông tin.

| Tuần | Chủ đề (dựa trên bằng chứng) | Mức độ khảo sát trong phiên này |
| --- | --- | --- |
| 1 | Gọi API frontier model lần đầu, cấu trúc prompt (system/user), web scraping cơ bản bằng `requests` + `BeautifulSoup`, so sánh nhiều model | **Đã đọc kỹ**: `week1/day1.ipynb`, `week1/scraper.py`, `week1/day2.ipynb` (một phần), `week1/week1 EXERCISE.ipynb` |
| 2 | Chat Completions API sâu hơn, giao diện Gradio, có thể có đa phương thức (ảnh/âm thanh) và Tools/function calling | Chỉ xem **danh sách thư mục** (`day1.ipynb`...`day5.ipynb`, `extra.ipynb`) + tên các file ghi chú tiếng Việt đã có sẵn (`AI-Day-2-007-011...`, `Day-4-015-019...`). Chưa đọc nội dung notebook |
| 3 | Mô hình mã nguồn mở với HuggingFace (nhiều khả năng: pipelines, tokenizers, models) | Chỉ xem danh sách thư mục + tên file ghi chú cũ. Chưa đọc nội dung notebook |
| 4 | Lựa chọn & đánh giá LLM; bài toán sinh/chuyển đổi code (tên file gợi ý: Python → C++, Python → Rust) | Chỉ xem danh sách thư mục + tên file ghi chú cũ (`Day3_011-014_Chon_AI_viet_code...`, `Day4_015-017_Python_sang_Cpp...`). Chưa đọc nội dung notebook |
| 5 | RAG — Retrieval-Augmented Generation (sinh câu trả lời có tra cứu tri thức), có `knowledge-base/`, `vector_db/`, `evaluation/` | Chỉ xem danh sách thư mục (có nhiều thư mục con: `implementation/`, `pro_implementation/`, `evaluation/`). Chưa đọc nội dung notebook |
| 6 | Fine-tuning cơ bản: dự án "Pricer" (dự đoán giá sản phẩm), có `deep_neural_network.pth`, `human_in.csv`, `jsonl/` | Chỉ xem danh sách thư mục. Chưa đọc nội dung notebook |
| 7 | QLoRA — kỹ thuật fine-tuning tiết kiệm bộ nhớ cho model mã nguồn mở | Chỉ xem danh sách thư mục + tên file ghi chú cũ (`Day-0x_...QLoRA...`). Chưa đọc nội dung notebook |
| 8 | Agentic AI — hệ nhiều agent tự hoạt động (dự án capstone), có `agents/`, `deal_agent_framework.py`, `memory.json`, `pricer_service.py` | Chỉ xem danh sách thư mục + tên file ghi chú cũ (`Day-0x_Modal-Agent...`, `RAG-Ensemble...`, `Planning-Agent-Tool-Calling...`). Chưa đọc nội dung notebook |

**Ghi chú quan trọng phát hiện được khi khảo sát:** bên trong các thư mục `week1/` → `week8/` đã có sẵn rất nhiều file `.md` tiếng Việt dạng "…Day-du.md / …Bai-giang-day-du.md" (bài giảng đầy đủ) và "…Tom-tat.md" (tóm tắt), nhiều khả năng được tạo bởi một phiên làm việc AI khác trước đây (có cả một thư mục `learning-vietnamese-codex/` nhưng thư mục đó hiện đang **trống**). Bộ tài liệu trong `learning-vietnamese-claude-sonnet-5/` này được tôi biên soạn **độc lập**, theo đúng cấu trúc sư phạm bạn yêu cầu ở phiên này, nên có thể trùng lặp một phần nội dung với các file cũ đó. Bạn có thể đối chiếu hai nguồn để kiểm tra chéo, nhưng đừng coi các file cũ là do tôi viết hay đã được tôi kiểm chứng.

Ngoài ra ở thư mục gốc còn có `Danh-Sach-Models-VSCode-Copilot.md` và `huong-dan-chon-model-ai.md` — đọc tên thì đây là ghi chú cá nhân về chọn model AI cho công cụ lập trình (VS Code Copilot), **không thuộc nội dung khóa học LLM Engineering**, nên tôi không đưa vào bài giảng.

### Tài liệu nền (không phải nội dung khóa học chính, nhưng hỗ trợ học) — thư mục `guides/`

Repo có 14 notebook hướng dẫn nền tảng, dùng cho người mới (rất phù hợp với bạn vì bạn còn yếu Python):

| # | File | Chủ đề (đã xác nhận qua mục lục trong `guides/01_intro.ipynb`) |
| --- | --- | --- |
| 1 | `01_intro.ipynb` | Giới thiệu, mục lục các guide |
| 2 | `02_command_line.ipynb` | Dòng lệnh (command line) |
| 3 | `03_git_and_github.ipynb` | Git và GitHub |
| 4 | `04_technical_foundations.ipynb` | Biến môi trường, mạng, API, `uv` |
| 5 | `05_notebooks.ipynb` | Cách dùng Jupyter Notebook |
| 6 | `06_python_foundations.ipynb` | Nền tảng Python — **đã đọc**, chủ yếu là các liên kết ChatGPT giải thích import/hàm/string/f-string/list-dict-set/file/class + cách tự sửa `NameError` |
| 7 | `07_vibe_coding_and_debugging.ipynb` | "Vibe coding" — lập trình với sự hỗ trợ của LLM |
| 8 | `08_debugging.ipynb` | Kỹ thuật debug |
| 9 | `09_ai_apis_and_ollama.ipynb` | Gọi API ngoài OpenAI (Ollama, Gemini, DeepSeek, OpenRouter...) — **đã đọc**, giải thích rất rõ "OpenAI Python client chỉ là lớp gọi HTTP, không chứa model" |
| 10 | `10_intermediate_python.ipynb` | Python trung cấp (decorator, ...) |
| 11 | `11_async_python.ipynb` | Lập trình bất đồng bộ (async) trong Python |
| 12 | `12_starting_your_project.ipynb` | Lời khuyên khi bắt đầu dự án riêng |
| 13 | `13_frontend.ipynb` | Frontend crash course |
| 14 | `14_docker_terraform.ipynb` | Docker và Terraform |

Các guide 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14 mới chỉ được tôi ghi nhận **tên và vị trí**, chưa đọc nội dung chi tiết — sẽ khảo sát thêm khi lộ trình đi tới phần cần dùng tới chúng.

---

## 3. Trình tự học đề xuất và kiến thức tiên quyết

Xem chi tiết đầy đủ trong [00-lo-trinh-hoc.md](00-lo-trinh-hoc.md). Tóm tắt nhanh:

1. Ôn nhanh 5 khối kiến thức nền (Python cơ bản, Jupyter Notebook, biến môi trường, khái niệm HTTP API bạn đã biết từ frontend, khái niệm LLM/prompt) — xem mục "Kiến thức nền cần bổ sung".
2. Học Tuần 1 theo từng "Day" (ngày) — bắt đầu bằng Bài 01 đã tạo sẵn trong bộ tài liệu này.
3. Đi tiếp Tuần 2 → Tuần 8 theo đúng thứ tự gốc của khóa học, vì các dự án nối tiếp nhau (ví dụ Tuần 6-7-8 dùng lại ý tưởng dự đoán giá sản phẩm từ Tuần 6).

---

## 4. Các bài đã tạo trong bộ tài liệu này

| File | Nội dung | Trạng thái |
| --- | --- | --- |
| [00-lo-trinh-hoc.md](00-lo-trinh-hoc.md) | Lộ trình học, kiến thức nền, câu hỏi tự kiểm tra | Đã tạo |
| [01-goi-api-va-prompt-co-ban-chi-tiet.md](01-goi-api-va-prompt-co-ban-chi-tiet.md) | Bài giảng đầy đủ: gọi API LLM lần đầu + prompting cơ bản (Tuần 1 – Day 1) | Đã tạo |
| [01-goi-api-va-prompt-co-ban-tom-tat.md](01-goi-api-va-prompt-co-ban-tom-tat.md) | Tóm tắt nhanh của Bài 01 | Đã tạo |
| [LLM-Engineering-8-tuan-day-du.md](LLM-Engineering-8-tuan-day-du.md) | Tổng hợp đầy đủ 8 tuần theo nguồn gốc và cách giải thích hướng học | Đã tạo |
| [LLM-Engineering-8-tuan-tom-tat.md](LLM-Engineering-8-tuan-tom-tat.md) | Tóm tắt nhanh 8 tuần | Đã tạo |
| [coverage-map.md](coverage-map.md) | Bảng đối chiếu giữa nội dung khóa học và nguồn gốc | Đã tạo |
| [tien-do-hoc.md](tien-do-hoc.md) | Nhật ký tiến độ học tập | Đã tạo, cần cập nhật bằng phản hồi thực tế từ bạn |

Đọc thứ tự gợi ý:

1. [00-lo-trinh-hoc.md](00-lo-trinh-hoc.md) — lộ trình và mục tiêu
2. [01-goi-api-va-prompt-co-ban-chi-tiet.md](01-goi-api-va-prompt-co-ban-chi-tiet.md) — học sâu bài đầu tiên
3. [LLM-Engineering-8-tuan-day-du.md](LLM-Engineering-8-tuan-day-du.md) — đọc tổng hợp 8 tuần khi cần tổng quan
4. [LLM-Engineering-8-tuan-tom-tat.md](LLM-Engineering-8-tuan-tom-tat.md) — ôn nhanh trước khi làm bài tập
5. [tien-do-hoc.md](tien-do-hoc.md) — ghi lại tiến độ thực sự đã học

---

## 5. Bảng ánh xạ bài học ⇄ nguồn

| Bài | Nguồn chính trong repo | Nguồn phụ |
| --- | --- | --- |
| Bài 01 — Gọi API LLM lần đầu & Prompting cơ bản | [week1/day1.ipynb](../week1/day1.ipynb), [week1/scraper.py](../week1/scraper.py) | [week1/week1 EXERCISE.ipynb](../week1/week1%20EXERCISE.ipynb), [setup/SETUP-new.md](../setup/SETUP-new.md), [guides/09_ai_apis_and_ollama.ipynb](../guides/09_ai_apis_and_ollama.ipynb) |

Bảng này sẽ được nối dài dần khi có thêm bài mới.

---

## 6. Những phần chưa khảo sát hoặc chưa đủ dữ liệu

Ghi rõ theo yêu cầu minh bạch — **không suy diễn nội dung của các phần này**:

- **Tuần 2 → Tuần 8**: mới chỉ xem danh sách thư mục/tên file, **chưa mở nội dung notebook**. Mô tả chủ đề ở mục 2 là suy luận hợp lý từ tên file và tên file ghi chú tiếng Việt có sẵn, có thể cần điều chỉnh khi đọc kỹ.
- **`week1` Day 3**: không tìm thấy file `day3.ipynb` trong `week1/` (chỉ có `day1, day2, day4, day5`). Chưa rõ nội dung "Day 3" của tuần 1 nằm ở đâu (có thể là phần lý thuyết/video không có notebook đi kèm) — cần hỏi lại hoặc khảo sát thêm.
- **`week1` Day 4, Day 5**: đã thấy có file ghi chú tiếng Việt cũ (`ngay-4-ai-video-026-032-tieng-viet.md`, `AI-Day-5-033-037-Day-du.md`) nhưng tôi **chưa tự đọc notebook gốc** `day4.ipynb`/`day5.ipynb` trong phiên này, nên chưa đưa nội dung của 2 ngày đó vào bài giảng chính thức.
- **Các thư mục `community-contributions/`**: theo đúng yêu cầu của bạn, tôi **không đọc** các thư mục này ở bất kỳ tuần nào.
- **`extras/`**: có 2 thư mục con `community/` và `trading/`, chưa khảo sát nội dung.
- **`week2/.gradio/`, `week5/knowledge-base/`, `week5/vector_db/`, `week5/preprocessed_db/`, `week6/pricer/`, `week6/jsonl/`, `week7/pricer/`, `week8/products_vectorstore/`**: đây là dữ liệu/artifact lớn hoặc thư mục runtime — chủ động không đọc theo đúng yêu cầu "không đọc toàn bộ dữ liệu lớn".
- File `.env`: không đọc, không trích dẫn nội dung.

---

*Cập nhật lần cuối: tạo mới trong lượt làm việc đầu tiên (2026-09-22). Nếu cấu trúc thư mục nguồn thay đổi, các liên kết trong file này cần được rà soát lại.*
