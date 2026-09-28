Hãy tiếp tục công việc học lại khóa **LLM Engineering** trong workspace hiện tại. Trước khi bắt đầu, hãy đọc hướng dẫn dự án đang áp dụng, khảo sát các ghi chú nguồn của cả 8 tuần và đọc nội dung thư mục `learning-vietnamese-claude-sonnet-5/` đã được tạo trước đó.

## Mục tiêu

Tôi đã học xong khóa LLM Engineering gồm 8 tuần nhưng chưa nắm chắc kiến thức. Các ghi chú hiện tại có phần lặp lại giữa các ngày, giữa các tuần và giữa bản đầy đủ với bản tóm tắt. Hãy biên tập lại thành một bộ tài liệu tiếng Việt giúp tôi **học lại đầy đủ, có thứ tự và hiểu cách áp dụng**, giảm phần diễn đạt trùng lặp nhưng không bỏ mất kiến thức quan trọng.

Tôi có nền tảng React/JavaScript, nhưng kiến thức Python, machine learning và LLM chưa vững. Hãy giải thích thuật ngữ chuyên ngành bằng tiếng Việt, giữ thuật ngữ tiếng Anh trong ngoặc ở lần xuất hiện đầu tiên, và dùng ví dụ phù hợp với nền tảng frontend khi điều đó giúp tôi hiểu hơn.

## Nguồn và độ chính xác

1. Tìm các ghi chú `Week1_Notes.md` đến `Week8_Notes.md` hoặc file tương ứng; lưu ý file Week 7 có thể mang tên `Week-07-QLoRA-Ghi-note.md`.
2. Tìm và đọc notebook, source code, README, file dependencies và tài liệu khóa học gốc nếu chúng có trong workspace. Ưu tiên tài liệu gốc khi cần kiểm tra một nhận định hoặc đoạn code.
3. Đọc tài liệu trong `learning-vietnamese-claude-sonnet-5/` để biết nội dung nào đã có, ghi chú nào của tôi cần giữ và tiến độ nào không được ghi đè.
4. Không bịa nội dung không thấy trong nguồn. Nếu một ngày hoặc chủ đề thiếu tài liệu, ghi rõ giới hạn đó.
5. Phân biệt rõ:

   * Nội dung khóa học.
   * Phần giải thích bổ sung do bạn viết để giúp tôi hiểu.
   * Kết quả thực nghiệm riêng của khóa học, không đại diện cho mọi model hoặc mọi dự án.
6. Khi dẫn chiếu source code, ghi đúng đường dẫn file, notebook/cell hoặc hàm nếu có thể xác định. Không nói rằng đã chạy hay kiểm chứng code nếu bạn chưa thực sự làm việc đó.
7. Không đưa API key, token, mật khẩu hay nội dung `.env` vào tài liệu.

## Cách tổ chức kiến thức

Hãy giữ thứ tự học từ nền tảng đến ứng dụng, nhưng tổ chức lại nội dung để mỗi khái niệm có một nơi giải thích chính. Khi khái niệm cũ xuất hiện trong tuần sau, chỉ nhắc ngắn và chỉ rõ nó đang được áp dụng vào việc gì mới; không giảng lại nguyên đoạn.

Tài liệu phải bao quát các chủ đề thực sự có trong 8 tuần. Dùng danh sách sau làm khung kiểm tra, nhưng hãy đối chiếu với nguồn và điều chỉnh nếu nội dung thực tế khác:

* **Week 1:** gọi LLM qua API, prompt, client library và endpoint tương thích OpenAI, Ollama, token, context window, hội thoại stateless và lịch sử được gửi lại, scraping, nối nhiều lời gọi thành ứng dụng.
* **Week 2:** nhiều nhà cung cấp/model, Gradio, chatbot có lịch sử, RAG bằng từ khóa, tool calling, SQLite, agentic AI và multimodal.
* **Week 3:** Hugging Face/Colab, pipeline, tokenizer, chat template, chạy model có sẵn, quantization, ứng dụng xử lý cuộc họp và dữ liệu tổng hợp.
* **Week 4:** chọn và đánh giá model, benchmark/leaderboard, giới hạn của điểm số, chi phí/tốc độ/chất lượng, thử nghiệm chuyển đổi code và phân biệt chỉ số kỹ thuật với kết quả thực tế.
* **Week 5:** RAG, embedding, vector store/database, chunking, Chroma, lịch sử hội thoại, truy xuất và tạo câu trả lời, đánh giá RAG, các kỹ thuật Advanced RAG.
* **Week 6:** dự án dự đoán giá, thu thập/làm sạch dữ liệu, train/validation/test, tiền xử lý, baseline, machine learning truyền thống, vector hóa văn bản, mạng nơ-ron, gọi model và đánh giá.
* **Week 7:** fine-tuning có giám sát và QLoRA, prompt/completion, LoRA, quantization, tokenizer, cấu hình huấn luyện, loss, validation, checkpoint và đánh giá trên test set.
* **Week 8:** triển khai model, RAG và ensemble, structured outputs, scanner, planning agent, tool calling, agent loop, memory, giao diện và timer.

## File cần tạo hoặc cập nhật

Làm việc trong `learning-vietnamese-claude-sonnet-5/`. Đọc file hiện có trước khi sửa. Giữ nguyên câu trả lời, bài làm, ghi chú cá nhân và tiến độ học của tôi. Không xóa hoặc ghi đè mù quáng các tài liệu cũ. Nếu cần thay thế cấu trúc, hãy tạo bộ tài liệu mới với tên rõ ràng và cập nhật README để chỉ tôi nên học từ bộ nào.

Tạo các file sau:

### `LLM-Engineering-8-tuan-day-du.md`

Đây là tài liệu giảng lại chính, đầy đủ nhưng không lặp. Chia thành các phần theo tuần hoặc theo chủ đề có trình tự tương đương. Mỗi phần cần có những mục phù hợp sau:

1. Mục tiêu và kiến thức cần biết trước.
2. Bài toán phần này giải quyết và vị trí của nó trong toàn khóa.
3. Giải thích khái niệm mới bằng lời dễ hiểu, ví dụ cụ thể và giới hạn của ví dụ.
4. Luồng hoạt động: đầu vào → xử lý → đầu ra.
5. Giải thích code hoặc notebook quan trọng, có đường dẫn để tôi đối chiếu.
6. Những lựa chọn kỹ thuật và lý do chúng được dùng trong bài.
7. Lỗi, giới hạn và hiểu nhầm thường gặp.
8. Một bài tập ngắn để tôi tự làm hoặc tự giải thích.
9. Checklist để tự kiểm tra xem tôi đã hiểu phần đó chưa.

Không bắt buộc mọi tuần phải có code nếu nguồn không có phần thực hành phù hợp. Không cần chép lại từng cell một cách máy móc; hãy giải thích những khối code quan trọng để tôi hiểu luồng chương trình.

Giải thích rõ các cặp khái niệm dễ nhầm khi chúng xuất hiện, ví dụ: inference và training; prompt và fine-tuning; context và memory; RAG và training; model yêu cầu tool và code thực thi tool; training loss, validation loss và metric của tác vụ; đúng định dạng và đúng nội dung.

### `LLM-Engineering-8-tuan-tom-tat.md`

Tạo tài liệu ôn tập ngắn, dẫn chiếu đến phần tương ứng trong tài liệu đầy đủ. Chỉ giữ ý chính, thuật ngữ cốt lõi, luồng quan trọng và câu hỏi gợi nhớ. Không lặp lại toàn bộ lời giảng từ file đầy đủ.

### `README.md`

Cập nhật README để nêu:

* Tôi nên bắt đầu đọc file nào.
* Cấu trúc bộ tài liệu mới.
* Thứ tự học 8 tuần.
* Liên kết tương đối đến các tài liệu mới.
* Những tài liệu cũ nào vẫn hữu ích để tra cứu và nội dung nào đã được gộp.
* Các phần nguồn còn thiếu hoặc chưa xác minh.

### `coverage-map.md`

Tạo bảng đối chiếu có các cột:

| Tuần/chủ đề nguồn | Kiến thức cần giữ | Vị trí trong tài liệu đầy đủ | Đã đối chiếu source gốc chưa? | Ghi chú |

Dùng bảng này để chứng minh các chủ đề quan trọng từ đủ 8 ghi chú đã được đưa vào tài liệu mới. Nếu một nội dung không được đưa vào, nêu lý do; không bỏ qua âm thầm.

### `tien-do-hoc.md`

Đọc tiến độ hiện tại rồi cập nhật trạng thái tài liệu. Phân biệt rõ “đã tạo tài liệu” với “tôi đã học và hiểu”. Không tự đánh dấu tôi đã hiểu kiến thức khi chưa có câu trả lời hoặc bài thực hành từ tôi.

## Tiêu chuẩn biên tập

* Không lặp cùng một lời giải thích ở nhiều tuần chỉ để nhắc lại; dùng liên kết nội bộ hoặc một câu nhắc ngắn.
* Gộp các đoạn “tóm tắt”, “ý nghĩa thực tế”, “chốt ý nghĩa”, “mục tiêu cuối cùng” khi chúng đang nói cùng một ý.
* Giữ ví dụ, số liệu, code, cảnh báo và chi tiết có giá trị học tập; loại bỏ phần diễn đạt vòng vo hoặc liệt kê lại cùng một nội dung.
* Không cố làm tài liệu ngắn bằng cách xóa phần giải thích cần thiết. Mục tiêu là đầy đủ và mạch lạc, không phải ngắn nhất.
* Không tạo một bản đầy đủ cho từng ngày rồi lại ghép nguyên các bản đó vào tài liệu tổng hợp.
* Không tạo bản tóm tắt dài gần bằng bản đầy đủ.
* Với số liệu benchmark hoặc kết quả thực nghiệm, ghi rõ nguồn và bối cảnh; không trình bày như kết quả chung cho mọi model.
* Nếu dùng thuật ngữ nâng cao, giải thích trước khi dùng để suy luận tiếp.
* Cuối mỗi tuần, chỉ đặt câu hỏi/bài tập thật sự giúp kiểm tra hiểu biết; đáp án tham khảo để riêng sau bài tập hoặc cuối tài liệu.

## Phạm vi thực hiện

* Chỉ tạo hoặc cập nhật tài liệu Markdown trong `learning-vietnamese-claude-sonnet-5/`.
* Không sửa source code khóa học.
* Không cài package, tải model/dataset lớn, gọi API có phí, chạy fine-tuning hoặc training.
* Nếu một phần không thể kiểm chứng trong môi trường hiện tại, ghi rõ điều đó.
* Nếu tài liệu lớn đến mức không thể đọc hết trong một lượt, hãy khảo sát có hệ thống theo từng tuần và ghi lại phạm vi đã đọc; không tuyên bố đã đối chiếu những file chưa xem.

## Hoàn thành và tự kiểm tra

Sau khi viết xong:

1. Đối chiếu `coverage-map.md` với cả tám file ghi chú nguồn.
2. Kiểm tra tài liệu mới không có những đoạn lặp dài giữa các tuần.
3. Kiểm tra liên kết Markdown nội bộ, tiêu đề, code fence và đường dẫn nguồn.
4. Đảm bảo các ghi chú cá nhân và tiến độ cũ trong `learning-vietnamese-claude-sonnet-5/` vẫn được giữ.
5. Trong chat, báo cho tôi biết file nào nên đọc trước, phạm vi nào đã đối chiếu với notebook/source gốc, phần nào còn thiếu nguồn, và một bài tập đầu tiên tôi nên tự làm.

Hãy thực hiện việc khảo sát, biên tập và tạo file ngay trong lượt này. Đừng chỉ đưa ra kế hoạch.
