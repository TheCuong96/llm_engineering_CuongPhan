# Bảng đối chiếu phạm vi (Coverage Map)

> Mục đích: chứng minh mọi chủ đề quan trọng từ 8 ghi chú nguồn (và notebook gốc) đã được đưa vào [LLM-Engineering-8-tuan-day-du.md](LLM-Engineering-8-tuan-day-du.md). Nếu một nội dung KHÔNG được đưa vào, lý do được ghi rõ ở cột "Ghi chú" — không bỏ qua âm thầm.
>
> Cột "Đã đối chiếu source gốc?" phân biệt 3 mức:
>
> - **Đã đọc trực tiếp** = tôi tự mở file `.ipynb`/`.py` gốc trong phiên này.
> - **Qua ghi chú cũ (chưa tự đọc source)** = dựa trên file `*_Day_Du.md`/`*_Full.md`/`*_Giai-thich-day-du.md` có sẵn trong repo, không tự mở lại notebook gốc.
> - **Không có source để đối chiếu** = không tồn tại notebook cho phần đó (ví dụ lý thuyết thuần, hoặc nội dung nằm ở Google Colab không truy cập được).

---

## Tuần 1 — Nền tảng: gọi API, prompt, kiến trúc LLM

| Tuần/chủ đề nguồn | Kiến thức cần giữ | Vị trí trong tài liệu đầy đủ | Đã đối chiếu source gốc? | Ghi chú |
| --- | --- | --- | --- | --- |
| Day 1 — `week1/day1.ipynb`, `week1/scraper.py` | Gọi Chat Completions API lần đầu; system/user prompt; `.env`/`load_dotenv`; web scraping bằng `requests`+`BeautifulSoup`; giới hạn 2000 ký tự | [Tuần 1 — Ngày 1](LLM-Engineering-8-tuan-day-du.md#tuan1-ngay1) | Đã đọc trực tiếp | Đã có bài 01 cũ chi tiết hơn (`01-goi-api-va-prompt-co-ban-chi-tiet.md`); nội dung được rút gọn và hợp nhất vào đây |
| Day 2 — `week1/day2.ipynb` | Chat Completions API "dưới nắp ca-pô" (gọi HTTP thô bằng `requests`), package `openai` là client library chứ không chứa model, endpoint tương thích OpenAI | [Tuần 1 — Ngày 2](LLM-Engineering-8-tuan-day-du.md#tuan1-ngay2) | Đã đọc trực tiếp | — |
| Day 3 — không có file | Không xác định được nội dung | *(không có mục riêng)* | Không có source để đối chiếu | `week1/` không có `day3.ipynb` và không có ghi chú cũ nào cho Day 3; nêu rõ trong tài liệu là khoảng trống chưa xác định |
| Day 4 (video 026–032) — `week1/ngay-4-ai-video-026-032-tieng-viet.md` | Kiến trúc Transformer, attention, GPT là gì, RLHF, LSTM vs Transformer, emergent intelligence, agentic AI/copilot/tool phân biệt, tham số (M/B/T), Dense vs MoE, training vs inference | [Tuần 1 — Ngày 4](LLM-Engineering-8-tuan-day-du.md#tuan1-ngay4) | Qua ghi chú cũ (chưa tự đọc source) | Không có notebook cho ngày này (nội dung là video lý thuyết); ghi chú cũ đã tự đối chiếu với bài báo Transformer gốc và model card DeepSeek-V3 |
| Day 5 (video 033–037) — `week1/AI-Day-5-033-037-Day-du.md`, `week1/day5.ipynb` | Nối nhiều lời gọi AI thành ứng dụng (Brochure Generator); one-shot prompting; JSON mode (`response_format={"type":"json_object"}`); streaming; agentic pattern đầu tiên | [Tuần 1 — Ngày 5](LLM-Engineering-8-tuan-day-du.md#tuan1-ngay5) | Đã đọc trực tiếp (notebook) + qua ghi chú cũ (phần diễn giải) | — |
| Token, context window, chi phí API | Khái niệm token, context window, ước tính chi phí | [Tuần 1 — Ngày 4](LLM-Engineering-8-tuan-day-du.md#tuan1-ngay4) (video 032) | Qua ghi chú cũ (chưa tự đọc source) | Số liệu giá trong ghi chú cũ là tại thời điểm quay video, không phải bảng giá hiện hành — đã ghi chú lại |

## Tuần 2 — Nhiều nhà cung cấp, Gradio, chatbot, tool calling, multimodal

| Tuần/chủ đề nguồn | Kiến thức cần giữ | Vị trí trong tài liệu đầy đủ | Đã đối chiếu source gốc? | Ghi chú |
| --- | --- | --- | --- | --- |
| Day 1 — `week2/day1.ipynb` | Kết nối 7+ nhà cung cấp qua endpoint tương thích OpenAI; `reasoning_effort` (test-time scaling) | [Tuần 2 — Ngày 1](LLM-Engineering-8-tuan-day-du.md#tuan2-ngay1) | Đã đọc trực tiếp (qua subagent khảo sát + bản thân tôi đọc lại) | — |
| Day 2 — `week2/day2.ipynb` | Gradio cơ bản: `gr.Interface`, streaming bằng `yield` | [Tuần 2 — Ngày 2](LLM-Engineering-8-tuan-day-du.md#tuan2-ngay2) | Đã đọc trực tiếp (qua subagent) | — |
| Day 3 — `week2/day3.ipynb` | Chatbot có lịch sử (`chat(message, history)`), `gr.ChatInterface`, one-shot prompting, "RAG kiểu từ khóa" sơ khai (`if "belt" in message`) | [Tuần 2 — Ngày 3](LLM-Engineering-8-tuan-day-du.md#tuan2-ngay3) | Đã đọc trực tiếp | "RAG từ khóa" ở đây chỉ là tiền đề — RAG thật (embedding + vector DB) học ở Tuần 5, đã ghi chú rõ để không nhầm |
| Day 4 — `week2/day4.ipynb` | Tool calling: schema JSON mô tả hàm, `tools=[...]`, SQLite tra giá vé | [Tuần 2 — Ngày 4-5](LLM-Engineering-8-tuan-day-du.md#tuan2-ngay4-5) | Đã đọc trực tiếp | — |
| Day 5 — `week2/day5.ipynb` | Vòng lặp xử lý `tool_calls` (agentic loop), mở rộng multimodal: DALL-E (ảnh), TTS (giọng nói), SVG | [Tuần 2 — Ngày 4-5](LLM-Engineering-8-tuan-day-du.md#tuan2-ngay4-5) | Đã đọc trực tiếp | Gộp Day 4+5 vào 1 mục vì cùng chủ đề tool calling, tránh lặp |

## Tuần 3 — Mô hình mã nguồn mở với Hugging Face

| Tuần/chủ đề nguồn | Kiến thức cần giữ | Vị trí trong tài liệu đầy đủ | Đã đối chiếu source gốc? | Ghi chú |
| --- | --- | --- | --- | --- |
| Day 1 — `week3/day1.ipynb` | Hugging Face Hub, Google Colab, GPU | [Tuần 3 — Ngày 1](LLM-Engineering-8-tuan-day-du.md#tuan3-ngay1) | Đã đọc trực tiếp — nhưng file gốc chỉ là "vỏ" 11 dòng trỏ sang Colab | **QUAN TRỌNG:** nội dung thật nằm ở Google Colab (không truy cập được từ đây); phần giải thích khái niệm dựa trên ghi chú cũ |
| Day 2 — `week3/day2.ipynb` | `pipeline()` — API cấp cao của Hugging Face | [Tuần 3 — Ngày 2](LLM-Engineering-8-tuan-day-du.md#tuan3-ngay2) | Notebook gốc chỉ là "vỏ" trỏ Colab; nội dung qua ghi chú cũ | Như trên |
| Day 3 — `week3/day3.ipynb` | Tokenizer, token ID, chat template (`apply_chat_template`) | [Tuần 3 — Ngày 3](LLM-Engineering-8-tuan-day-du.md#tuan3-ngay3) | Notebook gốc chỉ là "vỏ" trỏ Colab; nội dung qua ghi chú cũ | Như trên |
| Day 4 — `week3/day4.ipynb` | Model inference cấp thấp (`AutoModelForCausalLM`), quantization (NF4, 4-bit/8-bit) | [Tuần 3 — Ngày 4](LLM-Engineering-8-tuan-day-du.md#tuan3-ngay4) | Notebook gốc chỉ là "vỏ" trỏ Colab; nội dung qua ghi chú cũ | Như trên |
| Day 5 — `week3/day5.ipynb`, `week3/visualizer.py` | Ứng dụng "meeting minutes" (Whisper ASR + LLM tóm tắt), synthetic data generator, trực quan hóa token prediction | [Tuần 3 — Ngày 5](LLM-Engineering-8-tuan-day-du.md#tuan3-ngay5) | **Đã đọc trực tiếp** — đây là notebook DUY NHẤT của tuần 3 có code thật chạy local | Ưu tiên trích code từ đây vì là code thật, không phải diễn giải từ video |

## Tuần 4 — Chọn và đánh giá model

| Tuần/chủ đề nguồn | Kiến thức cần giữ | Vị trí trong tài liệu đầy đủ | Đã đối chiếu source gốc? | Ghi chú |
| --- | --- | --- | --- | --- |
| Day 1-2 — không có notebook | Model selection, Chinchilla scaling law, 6 benchmark (GPQA, MMLU-Pro, AIME, LiveCodeBench, MuSR, HLE), giới hạn benchmark (data contamination, saturation...), leaderboard vs product | [Tuần 4 — Ngày 1-2](LLM-Engineering-8-tuan-day-du.md#tuan4-ngay1-2) | Không có source để đối chiếu | Không tồn tại `day1.ipynb`/`day2.ipynb` trong `week4/`; toàn bộ dựa trên ghi chú cũ (phụ đề video) |
| Day 3 — `week4/day3.ipynb` | Code Generator Python→C++; đo hiệu năng thật (compile+run); so sánh GPT-5/Claude/Grok/Gemini | [Tuần 4 — Ngày 3](LLM-Engineering-8-tuan-day-du.md#tuan4-ngay3) | Đã đọc trực tiếp | Số liệu speedup (233×, 148×...) lấy từ ghi chú cũ mô tả 1 lần chạy cụ thể của giảng viên, không phải benchmark chuẩn hóa — đã ghi rõ bối cảnh |
| Day 4 — `week4/day4.ipynb` | Mở rộng sang model mã nguồn mở (Ollama/Groq/OpenRouter), Gradio UI chọn model | [Tuần 4 — Ngày 4](LLM-Engineering-8-tuan-day-du.md#tuan4-ngay4) | Đã đọc trực tiếp | — |
| Day 5 — `week4/day5.ipynb` | Bài toán khó hơn (Python→Rust, Max Subarray + LCG); technical vs business metrics; nhiều model FAIL | [Tuần 4 — Ngày 5](LLM-Engineering-8-tuan-day-du.md#tuan4-ngay5) | Qua ghi chú cũ (chưa tự đọc source) — subagent đã đối chiếu cell chính | Lỗi tràn số `u32` của Claude được giữ lại làm ví dụ "lỗi thật" |

## Tuần 5 — RAG (Retrieval-Augmented Generation)

| Tuần/chủ đề nguồn | Kiến thức cần giữ | Vị trí trong tài liệu đầy đủ | Đã đối chiếu source gốc? | Ghi chú |
| --- | --- | --- | --- | --- |
| Day 1 — `week5/day1.ipynb` | RAG là gì, vấn đề nó giải quyết; RAG kiểu từ khóa (naive) cho "Insurellm" | [Tuần 5 — Ngày 1](LLM-Engineering-8-tuan-day-du.md#tuan5-ngay1) | Đã đọc trực tiếp | — |
| Day 2 — `week5/day2.ipynb` | Chunking (`RecursiveCharacterTextSplitter`, 1000/200), Embedding (`all-MiniLM-L6-v2`, 384 chiều), Chroma, t-SNE visualize | [Tuần 5 — Ngày 2](LLM-Engineering-8-tuan-day-du.md#tuan5-ngay2) | Đã đọc trực tiếp (qua subagent) | — |
| Day 3 — `week5/day3.ipynb` | Retriever + generation, lịch sử hội thoại, Gradio ChatInterface | [Tuần 5 — Ngày 3](LLM-Engineering-8-tuan-day-du.md#tuan5-ngay3) | Đã đọc trực tiếp (qua subagent) | — |
| Day 4 — `week5/day4.ipynb` | Đánh giá RAG: golden dataset (150 câu), MRR/nDCG, LLM-as-judge | [Tuần 5 — Ngày 4](LLM-Engineering-8-tuan-day-du.md#tuan5-ngay4) | Đã đọc trực tiếp (qua subagent) | Số "150 test" chưa verify được vì `evaluation/` (chứa file test) không được đọc chi tiết |
| Day 5 — `week5/day5.ipynb` | Advanced RAG: semantic chunking bằng LLM, reranking, query rewriting, `text-embedding-3-large` | [Tuần 5 — Ngày 5](LLM-Engineering-8-tuan-day-du.md#tuan5-ngay5) | Đã đọc trực tiếp (qua subagent) | `day5-EN.ipynb` (bản tiếng Anh) chưa được so sánh chi tiết với `day5.ipynb` |

## Tuần 6 — Dự án dự đoán giá: từ baseline tới fine-tuning

| Tuần/chủ đề nguồn | Kiến thức cần giữ | Vị trí trong tài liệu đầy đủ | Đã đối chiếu source gốc? | Ghi chú |
| --- | --- | --- | --- | --- |
| `week6/Week6_Notes.md` (tổng quan) | Bài toán dự đoán giá sản phẩm Amazon từ mô tả văn bản; 5 ngày = 5 giai đoạn của 1 dự án Data Science | [Tuần 6 — Tổng quan](LLM-Engineering-8-tuan-day-du.md#tuan6-tong-quan) | Qua ghi chú cũ | — |
| Day 1 — `week6/day1.ipynb` | Data curation: lọc giá 0.5–999.49$, độ dài text 600–4000 ký tự, weighted sampling, 2.9M→820K sản phẩm | [Tuần 6 — Ngày 1](LLM-Engineering-8-tuan-day-du.md#tuan6-ngay1) | Qua ghi chú cũ (chưa tự đọc source) | — |
| Day 2 — `week6/day2.ipynb` | Tiền xử lý bằng LLM qua Groq Batch API, JSONL, `custom_id` | [Tuần 6 — Ngày 2](LLM-Engineering-8-tuan-day-du.md#tuan6-ngay2) | Qua ghi chú cũ (chưa tự đọc source) | Chi phí batch (~1$/~30$) là số nêu trong ghi chú tại thời điểm quay, không phải giá hiện hành |
| Day 3 — `week6/day3.ipynb` | Baseline (random/constant/human), ML truyền thống (Linear Regression, Random Forest, XGBoost), Bag-of-Words (`CountVectorizer`) | [Tuần 6 — Ngày 3](LLM-Engineering-8-tuan-day-du.md#tuan6-ngay3) | Qua ghi chú cũ (chưa tự đọc source) | Bảng MAE cụ thể (382/106/101.56/76.81/72.28/68.23 USD) là kết quả 1 lần chạy trên bộ test cụ thể của khóa học |
| Day 4 — `week6/day4.ipynb` | Neural network PyTorch tự huấn luyện; so sánh với 5 frontier LLM (GPT-4.1 nano, Claude Opus, Gemini, Grok, GPT-5.1) | [Tuần 6 — Ngày 4](LLM-Engineering-8-tuan-day-du.md#tuan6-ngay4) | Qua ghi chú cũ (chưa tự đọc source) | Số tham số "669M" cho neural network chưa tự verify từ code |
| Day 5 — `week6/day5.ipynb` | Fine-tuning GPT (SFT) → kết quả TỆ HƠN (75.91 vs 62.51 baseline); Deep Neural Network 289M tham số → kết quả tốt (46.49) | [Tuần 6 — Ngày 5](LLM-Engineering-8-tuan-day-du.md#tuan6-ngay5) | Qua ghi chú cũ (chưa tự đọc source) | Đây là bằng chứng trực tiếp cho nguyên tắc "fine-tuning không đảm bảo luôn tốt hơn" — giữ lại làm ví dụ trọng tâm |

## Tuần 7 — Fine-tuning có giám sát và QLoRA

| Tuần/chủ đề nguồn | Kiến thức cần giữ | Vị trí trong tài liệu đầy đủ | Đã đối chiếu source gốc? | Ghi chú |
| --- | --- | --- | --- | --- |
| `week7/Week-07-QLoRA-Ghi-note.md` (tổng quan) | SFT trên LLaMA 3.2 3B bằng QLoRA để dự đoán giá (tiếp nối Tuần 6) | [Tuần 7 — Tổng quan](LLM-Engineering-8-tuan-day-du.md#tuan7-tong-quan) | Qua ghi chú cũ | — |
| Day 1 — `week7/day1.ipynb` (chỉ markdown, không code) | LoRA (ma trận A/B hạng thấp), rank/alpha, quantization 4-bit/NF4/double quantization, QLoRA = LoRA+quantization, footprint bộ nhớ (12.9GB→2.2GB) | [Tuần 7 — Ngày 1](LLM-Engineering-8-tuan-day-du.md#tuan7-ngay1) | Đã đọc trực tiếp (notebook chỉ có markdown, không có code để đối chiếu) | — |
| Day 2 — `week7/day2.ipynb` | Tokenize dữ liệu, `CUTOFF=110` token, định dạng prompt/completion, đẩy lên HF Hub | [Tuần 7 — Ngày 2](LLM-Engineering-8-tuan-day-du.md#tuan7-ngay2) | **Đã đọc trực tiếp** (notebook có code thật) | — |
| Day 3-4 — `week7/day3 and 4.ipynb` (chỉ là "vỏ" trỏ Colab) | `LoraConfig`, `SFTConfig`/`SFTTrainer`, training loss vs validation loss, overfitting, checkpoint | [Tuần 7 — Ngày 3-4](LLM-Engineering-8-tuan-day-du.md#tuan7-ngay3-4) | Qua ghi chú cũ (chưa tự đọc source — code thật ở Colab) | Code `LoraConfig`/`SFTConfig` trong tài liệu là ví dụ minh họa dựa trên ghi chú, CHƯA xác nhận chạy được nguyên văn |
| Day 5 — `week7/day5.ipynb` (chỉ là "vỏ") | Loss (cross-entropy) khác MAE; `PeftModel.from_pretrained` nạp adapter; so sánh MAE cuối (Lite 65.40, Full 39.85 — tốt nhất toàn khóa) | [Tuần 7 — Ngày 5](LLM-Engineering-8-tuan-day-du.md#tuan7-ngay5) | Qua ghi chú cũ (chưa tự đọc source) | — |

## Tuần 8 — Agentic AI: dự án capstone "The Price Is Right"

| Tuần/chủ đề nguồn | Kiến thức cần giữ | Vị trí trong tài liệu đầy đủ | Đã đối chiếu source gốc? | Ghi chú |
| --- | --- | --- | --- | --- |
| Day 1 — `week8/day1.ipynb` | Triển khai model lên Modal (serverless cloud), `SpecialistAgent` gọi model đã fine-tune từ xa | [Tuần 8 — Ngày 1](LLM-Engineering-8-tuan-day-du.md#tuan8-ngay1) | Đã đọc trực tiếp (một phần bởi tôi, một phần qua subagent) | — |
| Day 2 — `week8/day2.ipynb`, `week8/agents/frontier_agent.py`, `ensemble_agent.py` | `FrontierAgent` (RAG với Chroma), `EnsembleAgent` (kết hợp trọng số 80/10/10) | [Tuần 8 — Ngày 2](LLM-Engineering-8-tuan-day-du.md#tuan8-ngay2) | Qua ghi chú cũ + đọc trực tiếp file `.py` trong `agents/` | — |
| Day 3 — `week8/day3.ipynb`, `agents/scanner_agent.py`, `agents/messaging_agent.py` | Structured Outputs (Pydantic `Deal`/`DealSelection`), `ScannerAgent` (đọc RSS), Pushover (thông báo đẩy) | [Tuần 8 — Ngày 3](LLM-Engineering-8-tuan-day-du.md#tuan8-ngay3) | Qua ghi chú cũ + đọc trực tiếp file `.py` | — |
| Day 4 — `week8/day4.ipynb`, `agents/planning_agent.py` | `PlanningAgent` điều phối, tool calling trong agent loop, `DEAL_THRESHOLD=50` | [Tuần 8 — Ngày 4](LLM-Engineering-8-tuan-day-du.md#tuan8-ngay4) | Qua ghi chú cũ + đọc trực tiếp `planning_agent.py` | — |
| Day 5 — `week8/day5.ipynb`, `deal_agent_framework.py`, `price_is_right.py` | Giao diện Gradio, `memory.json` (bộ nhớ giữa các lần chạy), Timer tự động chạy định kỳ | [Tuần 8 — Ngày 5](LLM-Engineering-8-tuan-day-du.md#tuan8-ngay5) | Qua ghi chú cũ + đọc trực tiếp `deal_agent_framework.py` | — |

---

## Các khái niệm xuyên suốt (giải thích 1 lần, dùng lại nhiều tuần)

| Khái niệm | Giải thích chính ở đâu | Được nhắc lại/áp dụng ở đâu |
| --- | --- | --- |
| System/user/assistant prompt, `messages` list | [Tuần 1 — Ngày 1](LLM-Engineering-8-tuan-day-du.md#tuan1-ngay1) | Mọi tuần sau |
| Client library vs endpoint tương thích OpenAI | [Tuần 1 — Ngày 2](LLM-Engineering-8-tuan-day-du.md#tuan1-ngay2) | Tuần 2, 4, 5, 8 |
| Training vs Inference | [Tuần 1 — Ngày 4](LLM-Engineering-8-tuan-day-du.md#tuan1-ngay4) | Tuần 6, 7 (nhắc ngắn, không giảng lại) |
| Token, context window | [Tuần 1 — Ngày 4](LLM-Engineering-8-tuan-day-du.md#tuan1-ngay4) | Tuần 3 (tokenizer cụ thể), Tuần 7 (CUTOFF token) |
| Tool calling: model YÊU CẦU vs code THỰC THI | [Tuần 2 — Ngày 4-5](LLM-Engineering-8-tuan-day-du.md#tuan2-ngay4-5) | Tuần 8 (agent loop) |
| RAG vs Training | [Tuần 5 — Ngày 1](LLM-Engineering-8-tuan-day-du.md#tuan5-ngay1) | Tuần 8 (FrontierAgent) |
| Đúng định dạng (format) vs đúng nội dung (content) | [Tuần 1 — Ngày 5](LLM-Engineering-8-tuan-day-du.md#tuan1-ngay5) | Tuần 8 (Structured Outputs) |
| Training loss, validation loss, metric của tác vụ (MAE...) | [Tuần 6 — Ngày 4-5](LLM-Engineering-8-tuan-day-du.md#tuan6-ngay4) | Tuần 7 (nhắc ngắn, đào sâu thêm phần overfitting) |
| Context (ngữ cảnh 1 lần gọi) vs Memory (bộ nhớ giữa nhiều lần chạy) | [Tuần 8 — Ngày 5](LLM-Engineering-8-tuan-day-du.md#tuan8-ngay5) | — |

---

## Nội dung KHÔNG đưa vào tài liệu (và lý do)

| Nội dung | Lý do không đưa vào |
|---|---|
| Toàn bộ thư mục `community-contributions/`/`community_contributions/` (mọi tuần) | Theo yêu cầu rõ ràng của bạn: không khảo sát |
| Nội dung notebook Google Colab của Tuần 3 (Day 1-4) và Tuần 7 (Day 3-5) | Không thể truy cập Google Colab từ môi trường làm việc hiện tại; đã dùng ghi chú cũ (biên soạn từ phụ đề video) thay thế, có ghi rõ giới hạn |
| Dữ liệu nhị phân/lớn: `*.pth`, `*.db`, `vector_db/`, `knowledge-base/`, `products_vectorstore/`, `jsonl/`, `pricer/` (artifact đã train) | Theo yêu cầu: không đọc dữ liệu/model lớn |
| `week4/styles.py`, `week8/hello.py`, `week8/llama.py`, phần lớn `week8/pricer_service*.py` | File hỗ trợ phụ, không ảnh hưởng tới nội dung khái niệm chính; không đọc chi tiết để tiết kiệm phạm vi khảo sát |
| Nội dung Day 3 của Tuần 1 | Không tồn tại file nguồn nào (notebook hoặc ghi chú) — đã ghi rõ là khoảng trống, không suy đoán |
| Nội dung Day 1-2 của Tuần 4 dưới dạng code | Không có notebook; chỉ trình bày như lý thuyết dựa trên ghi chú cũ |
