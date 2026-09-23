# LLM Engineering 8 tuần — tóm tắt nhanh

> File này là phiên bản rút gọn của [LLM-Engineering-8-tuan-day-du.md](LLM-Engineering-8-tuan-day-du.md). Mục tiêu là giúp bạn nắm nhanh “bức tranh lớn” trước khi quay lại đọc từng phần chi tiết.

---

## 1. Bức tranh tổng quan

Khóa học này không chỉ dạy “gọi model AI” mà dạy cách xây dựng một hệ thống AI thực tế:

- gọi API và hiểu prompt
- so sánh nhiều model và cách chọn model phù hợp
- kiểm tra chất lượng đầu ra bằng metric và test case
- xây dựng RAG để bổ sung tri thức cho model
- fine-tuning và QLoRA khi cần hiệu suất chuyên biệt
- phối hợp nhiều agent/ tool để giải quyết bài toán tự động

Nói ngắn gọn: bạn học cách biến model AI thành một ứng dụng, không chỉ là một chat box.

---

## 2. 8 tuần theo nhịp học

### Tuần 1 — Nền tảng: model, API, prompt

Khái niệm cốt lõi:

- system prompt, user prompt, assistant response
- model là service remote, còn thư viện client OpenAI chỉ là cách gọi HTTP
- token, context window, chi phí API
- web scraper + summarizer là cách mở đầu rất tốt để hiểu prompt

Bài học quan trọng:

- prompt không phải “thần chú”; nó là giao tiếp có cấu trúc
- model khác nhau ở chiến lược training và quality, không phải chỉ khác tên

### Tuần 2 — Multi-provider + UI + tool calling

Bạn bắt đầu thấy một ứng dụng AI không chỉ trả lời văn bản mà còn:

- gọi nhiều model khác nhau qua endpoint tương thích OpenAI
- bọc UI bằng Gradio
- lưu lịch sử hội thoại
- cho model gọi công cụ như database, API, hoặc function có schema rõ ràng

Bài học quan trọng:

- tool calling là cách model “yêu cầu” thao tác, còn code thực thi công việc đó
- đây là nền móng cho các agent sau này

### Tuần 3 — Mô hình mã nguồn mở với Hugging Face

Nội dung trọng tâm:

- Hugging Face Hub và pipeline
- tokenizer và token ID
- chat template
- inference ở mức model và ứng dụng
- Whisper + LLM dùng để tóm tắt cuộc họp, hoặc tạo dữ liệu giả

Bài học quan trọng:

- mô hình mã nguồn mở không chỉ là “một file model”; có cả pipeline, tokenizer, template, quantization
- bạn có thể chạy model ở local nhưng cần cân bằng tài nguyên và độ chính xác

### Tuần 4 — Chọn model và đánh giá đúng cách

Đây là phần khiến bạn thấy “AI không phải là sự lựa chọn ngẫu nhiên”.

- benchmark là giúp so sánh, nhưng không phải mọi benchmark đều phản ánh thực tế
- model mạnh ở code, mạnh ở logic, có thể yếu ở một nhiệm vụ cụ thể
- nên đánh giá bằng metric đúng với bài toán: code compile, MAE, throughput, độ chính xác, chi phí

Bài học quan trọng:

- “model tốt nhất” là model phù hợp với bài toán cụ thể
- benchmark rất hữu ích nhưng không thay thế đánh giá sản phẩm của bạn

### Tuần 5 — RAG

RAG là cách giúp model truy xuất tri thức từ kho dữ liệu và trả lời dựa trên nguồn có thật.

Các thành phần chính:

- chunking dữ liệu
- embedding
- vector database
- retriever
- generation
- đánh giá bằng golden set, MRR, nDCG, LLM-as-judge

Bài học quan trọng:

- RAG không phải “cho model xem tài liệu”; nó là hệ thống tìm kiếm + truy xuất + tổng hợp thông tin
- nếu dữ liệu không sạch, chunking không phù hợp, RAG sẽ yếu ngay từ đầu

### Tuần 6 — Bài toán doanh nghiệp: dự đoán giá sản phẩm

Đây là dự án thật giúp kết hợp data science + LLM + product evaluation.

Trình tự dự án:

- thu thập và làm sạch dữ liệu
- so sánh baseline
- dùng ML truyền thống và neural network
- so sánh với LLM trực tiếp
- đánh giá xem fine-tuning có thực sự cải thiện hay không

Bài học quan trọng:

- fine-tuning không phải giải pháp “mạnh hơn mọi thứ”
- trong nhiều bài toán thực tế, baseline hoặc mô hình truyền thống vẫn rất đáng tin cậy

### Tuần 7 — QLoRA và fine-tuning tiết kiệm bộ nhớ

Nội dung chính:

- LoRA: cập nhật ma trận hạng thấp thay vì cập nhật toàn bộ model
- quantization: giảm footprint bộ nhớ
- QLoRA: kết hợp LoRA + quantization
- SFT cho bài toán giá sản phẩm

Bài học quan trọng:

- fine-tuning hiệu quả không nhất thiết phải chạy trên máy siêu mạnh
- chỉ cần lựa chọn đúng kỹ thuật và định dạng dữ liệu

### Tuần 8 — Agentic AI và hệ thống nhiều agent

Đây là phần “chốt” của khóa học: xây dựng hệ thống AI có phân vai, gọi tool, tự lập kế hoạch và vận hành trong môi trường thực.

Các thành phần thường thấy:

- FrontierAgent / RAG agent
- EnsembleAgent / kết hợp nhiều nguồn tri thức
- ScannerAgent / đọc tin tức hoặc dữ liệu mới
- PlanningAgent / quyết định điều phối
- memory, timer, Gradio UI

Bài học quan trọng:

- agent không phải “chat bot thông minh hơn”; agent là hệ thống có mục tiêu, tool, bộ nhớ và vòng lặp ra quyết định
- sự phối hợp tốt hơn là ưu tiên hơn là một model mạnh nhất

---

## 3. Mẹo học hiệu quả

1. Đọc theo trình tự gốc, không nhảy tuần.
2. Mỗi tuần hãy làm 1 mini-project hoặc 1 đoạn code mẫu.
3. Chỉ sau khi chạy thử thành công, mới chuyển sang tuần sau.
4. Học khái niệm qua tình huống thực tế, không chỉ qua lý thuyết.
5. Khi thấy model “sai”, hãy hỏi: do prompt, dữ liệu, retrieval, hay metric?

---

## 4. Câu hỏi để tự kiểm tra

- Model làm việc như thế nào khi bạn gọi API?
- Prompt có vai trò gì khác với dữ liệu đầu vào?
- RAG khác fine-tuning ở chỗ nào?
- Khi nào nên dùng tool calling, khi nào nên dùng RAG?
- AIsystem hiệu quả cần yếu tố nào ngoài model mạnh?

Nếu bạn trả lời được các câu hỏi trên, bạn đã đi được phần lớn quãng đường của khóa học.

---

## 5. Tài liệu nên đọc tiếp theo

- [00-lo-trinh-hoc.md](00-lo-trinh-hoc.md)
- [01-goi-api-va-prompt-co-ban-chi-tiet.md](01-goi-api-va-prompt-co-ban-chi-tiet.md)
- [LLM-Engineering-8-tuan-day-du.md](LLM-Engineering-8-tuan-day-du.md)
- [coverage-map.md](coverage-map.md)

