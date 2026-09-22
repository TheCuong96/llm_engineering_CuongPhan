# Học lại khóa LLM Engineering bằng tiếng Việt

Thư mục này là lộ trình học lại được biên soạn từ mã nguồn, notebook và tài liệu có trong repository. Mục tiêu là giúp người đã biết React/JavaScript nhưng chưa vững Python và machine learning đọc được code, tự thực hành từng bước, rồi đánh giá được kết quả thay vì chỉ chạy theo notebook.

## Cách dùng bộ tài liệu

1. Mở [00-lo-trinh-hoc.md](00-lo-trinh-hoc.md) để biết điểm xuất phát và thứ tự học.
2. Học bài chi tiết, tự chạy từng phần an toàn, rồi đối chiếu với notebook gốc.
3. Dùng bản tóm tắt để ôn lại sau khi đã tự giải thích được bài bằng lời của mình.
4. Cập nhật [tien-do-hoc.md](tien-do-hoc.md) sau khi bạn thực sự làm bài tập hoặc nêu được chỗ đang vướng.

Việc tạo tài liệu không có nghĩa là người học đã hiểu nội dung.

## Bức tranh tổng quan

Repository là khóa **LLM Engineering** kéo dài 8 tuần. Theo README gốc, các dự án được thiết kế để tích lũy dần và kết thúc bằng một giải pháp Agentic AI. Đường đi quan sát được trong mã nguồn là:

1. Gọi LLM qua API, viết prompt và xử lý nội dung web.
2. Xây giao diện, hội thoại có history, tool calling và ứng dụng đa phương thức.
3. Dùng model mã nguồn mở, Hugging Face, tokenizer và suy luận trên môi trường có GPU.
4. Chọn và đánh giá model theo chất lượng, chi phí, độ trễ và kết quả thực tế.
5. Xây RAG để truy hồi ngữ cảnh trước khi sinh câu trả lời.
6. So sánh các cách dự đoán giá: ML cổ điển, neural network, LLM và fine-tuning qua API.
7. Fine-tune hiệu quả bằng QLoRA.
8. Ghép các năng lực trên thành hệ nhiều agent có tool calling, structured output, bộ nhớ và giao diện.

## Các nhóm chủ đề có bằng chứng trong nguồn

- **Python, notebook và môi trường chạy**: các guide nền tảng, setup dùng Python 3.11+ và `uv`.
- **API LLM, prompt và Ollama local**: Week 1 Day 1-2 và Guide 9.
- **Ứng dụng LLM**: Gradio, streaming, chat history, tool/function calling, SQLite và đa phương thức trong Week 2.
- **Model mã nguồn mở**: Hugging Face, `pipeline`, tokenizer, chat template, model loading và quantization trong Week 3.
- **Đánh giá**: benchmark, leaderboard, chi phí/độ trễ và kiểm thử code sinh ra trong Week 4.
- **RAG**: embedding, chunking, Chroma/vector search và đánh giá retrieval/câu trả lời trong Week 5.
- **Machine learning và training**: feature baseline, neural network, prediction/evaluation và fine-tuning trong Week 6.
- **QLoRA**: adapter low-rank, quantization, huấn luyện có giám sát và đánh giá trong Week 7.
- **Agentic AI**: agent chuyên biệt, RAG, ensemble, structured output, planning/tool loop và bộ nhớ trong Week 8.

## Trình tự học đề xuất

Nên học theo luồng sau, không nhảy thẳng vào fine-tuning hoặc agent:

1. Python tối thiểu, virtual environment, notebook và HTTP/API.
2. Gọi LLM, hiểu `messages`, system prompt, user prompt và output.
3. Đổi provider, chạy local bằng Ollama, sau đó xây UI/chat/tool calling.
4. Hiểu token, tokenizer và model open-source trước khi tải model lớn.
5. Học đánh giá trước khi tin rằng một model hoặc prompt là "tốt".
6. Học RAG rồi mới sang dữ liệu, ML, training và QLoRA.
7. Dùng các năng lực đã học để đọc kiến trúc agent ở Week 8.

## Tài liệu đã tạo trong mạch này

- [00-lo-trinh-hoc.md](00-lo-trinh-hoc.md): kiến thức nền, thứ tự bài học và câu hỏi tự kiểm tra.
- [01-goi-llm-va-prompt-co-ban-chi-tiet.md](01-goi-llm-va-prompt-co-ban-chi-tiet.md): bài học đầu tiên, bám sát Week 1 Day 1.
- [01-goi-llm-va-prompt-co-ban-tom-tat.md](01-goi-llm-va-prompt-co-ban-tom-tat.md): bản ôn ngắn của bài 01.
- [tien-do-hoc.md](tien-do-hoc.md): theo dõi việc đã thực sự học và thực hành.

## Bảng ánh xạ bài học với nguồn

| Giai đoạn | Nguồn chính đã dùng để lập bản đồ | Nội dung được xác nhận |
| --- | --- | --- |
| Nền tảng Python | [Guide 6](../guides/06_python_foundations.ipynb), [Setup](../setup/SETUP-new.md) | import, function, list/dict, NameError trong notebook, kernel, `uv sync` |
| Bài 01: API và prompt | [Week 1 Day 1](../week1/day1.ipynb), [scraper.py](../week1/scraper.py), [Guide 9](../guides/09_ai_apis_and_ollama.ipynb) | website text, `messages`, OpenAI client, summary, Ollama thay thế |
| API trực tiếp và provider | [Week 1 Day 2](../week1/day2.ipynb), [Guide 9](../guides/09_ai_apis_and_ollama.ipynb) | HTTP `POST`, SDK client, endpoint tương thích OpenAI, Gemini và Ollama |
| Ứng dụng hội thoại | [Week 2](../week2/) | multi-provider, Gradio, history, streaming, tool calling và multimodal |
| Model open-source | [Week 3](../week3/) | Hugging Face, GPU/Colab, pipeline, tokenizer, chat template, quantization |
| Chọn và đánh giá LLM | [Week 4](../week4/) | benchmark, leaderboard, code generation và đo kết quả thực thi |
| RAG | [Week 5](../week5/) | retrieval, embedding, chunking, vector database và evaluation |
| Dự đoán giá và training | [Week 6](../week6/) | baseline ML, neural network, prompting và fine-tuning |
| QLoRA | [Week 7](../week7/) | LoRA, 4-bit quantization, SFT và đánh giá adapter |
| Agentic AI capstone | [Week 8](../week8/) | specialist/RAG/ensemble agents, structured output, planning và tools |

## Phạm vi khảo sát và giới hạn

- Đã đọc README, cấu hình dependency, setup, guide nền tảng, Week 1 Day 1-2, `scraper.py`, và khảo sát có mục tiêu các tuần 2-8 qua notebook/mã nguồn đại diện.
- Không đọc thư mục `community-contributions` hoặc `community_contributions`.
- Không đọc `.env`, secrets, API keys, model weights, dataset lớn, `vector_db`, `knowledge-base`, `jsonl`, `pricer` hoặc các thư mục dữ liệu tương tự.
- Không gọi API có phí, không tải model, không chạy training hay notebook. Vì vậy mọi hành vi phụ thuộc provider, model name, quota hoặc phiên bản thư viện cần được kiểm tra khi bạn thực hành.
- Chưa đọc kỹ từng cell của mọi notebook. Các bài sau sẽ bổ sung bằng chứng nguồn cụ thể trước khi được viết chi tiết; lộ trình có thể điều chỉnh theo nội dung đó.

## Cách an toàn để bắt đầu thực hành

Repository dùng Python `>=3.11`; hướng dẫn setup gốc dùng `uv sync`. Không tự cài thêm package chỉ để học bài 01. Nếu gọi cloud API, hãy tự đặt giới hạn chi phí và không ghi secret vào notebook hay tài liệu. Bài 01 cũng chỉ cách đọc code với Ollama local như một lựa chọn không cần cloud API, nhưng không yêu cầu tải model trong lượt học này.

Bắt đầu tại [00-lo-trinh-hoc.md](00-lo-trinh-hoc.md), sau đó chuyển sang bài 01.
