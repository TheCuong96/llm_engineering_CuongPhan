# 00. Lộ trình học lại

## Đích đến

Sau lộ trình này, bạn có thể tự đọc một notebook LLM, phân biệt input, output và trạng thái kernel; gọi model qua API một cách có kiểm soát; chọn cách đánh giá phù hợp; rồi lần lượt xây RAG, fine-tuning và agent dựa trên các phần có trong repository.

Đích đến không phải là "thuộc nhiều thư viện". Đích đến là giải thích được vì sao code tồn tại, dữ liệu đi đâu, kết quả có đáng tin không và thay đổi nào cần thử tiếp theo.

## Kiến thức nền cần bổ sung

### Python tối thiểu

- Biến, chuỗi, số, điều kiện, vòng lặp và hàm.
- `list` và `dict`; đây là hai kiểu xuất hiện liên tục trong `messages` và JSON API.
- `import`, module, lỗi `NameError`, lỗi do chạy notebook sai thứ tự.
- Hàm đồng bộ và thao tác I/O: gọi web có thể chậm và có thể lỗi.

Liên hệ với JavaScript: Python `list` gần với `Array`, `dict` gần với object thuần, nhưng cú pháp, `None` và thụt lề là khác. Đừng giả định một hàm Python gọi mạng tự động có `await`; trong nguồn Week 1 nó là hàm đồng bộ.

### Web và API

- HTTP request/response, endpoint, header, JSON và status code.
- Environment variable: chỉ biết cách chương trình lấy biến, không dán secret vào code hoặc ghi chú.
- Client SDK là lớp bọc giúp tạo HTTP request; nó không phải bản thân model.

### Nền tảng AI cần có đúng lúc

- **Dữ liệu**: text website, prompt, document, dataset.
- **Model**: hệ đã được huấn luyện để biến input thành output.
- **Parameters (tham số model)**: trọng số học được trong quá trình training, không phải các đối số bạn truyền hằng ngày.
- **Hyperparameters (siêu tham số)**: lựa chọn điều khiển training hoặc inference, ví dụ learning rate hoặc temperature. Không phải bài nào cũng đặt chúng.
- **Inference (suy luận)**: gửi input tới model đã có để nhận output. Bài 01 là inference.
- **Training (huấn luyện)**: thay đổi parameters dựa trên dữ liệu. Phần này xuất hiện rõ hơn ở Week 6-7.
- **Evaluation (đánh giá)**: đo xem output có hữu ích/đúng theo tiêu chí; loss giảm không tự động chứng minh trải nghiệm người dùng tốt hơn.

## Lộ trình theo bài nhỏ

| Giai đoạn | Mục tiêu rõ ràng | Bằng chứng bạn đã hiểu |
| --- | --- | --- |
| 0. Môi trường và notebook | Chạy cell theo thứ tự, chọn kernel, hiểu lỗi biến chưa được định nghĩa | Bạn tự giải thích được vì sao chạy Cell B trước Cell A có thể gây `NameError` |
| 1. API và prompt | Biến một yêu cầu thành `messages`, đọc response và biết dữ liệu nhạy cảm nằm ở đâu | Bạn vẽ được `prompt -> API -> response` và chỉ ra role của system/user |
| 2. Provider và model local | Đổi endpoint/model có chủ đích, so sánh cloud với Ollama | Bạn nêu được đổi `base_url` khác đổi model ở chỗ nào và giới hạn chất lượng/tài nguyên |
| 3. UI, hội thoại và tools | Đọc callback chat, history, streaming và tool calling loop | Bạn giải thích được model đề nghị gọi tool nhưng code ứng dụng mới là thứ thật sự gọi hàm |
| 4. Token và model open-source | Hiểu tokenizer, chat template, context và tải model | Bạn dự đoán được vì sao một message cần template đúng định dạng model |
| 5. Đánh giá LLM | Chọn metric, kiểm tra output thật và cân nhắc cost/latency | Bạn không chọn model chỉ từ leaderboard hoặc một lần demo |
| 6. RAG | Tách retrieval khỏi answer generation, chunk dữ liệu và kiểm tra tìm kiếm | Bạn kiểm thử được retrieval trước khi kết luận prompt/model sai |
| 7. ML, training và QLoRA | Phân biệt baseline, training, validation/test, fine-tuning và parameter-efficient tuning | Bạn giải thích được vì sao phải giữ test set và loss thấp chưa đủ để chọn model |
| 8. Agentic AI | Đọc agent, schema, tool loop, bộ nhớ và điều kiện dừng | Bạn xác định được quyền hạn, input/output và giới hạn chi phí của từng agent |

## Thứ tự thực hiện đề xuất

1. Học bài 01 trong thư mục này và tự làm bài tập không cần API trước.
2. Đọc Week 1 Day 2 cùng Guide 9 để hiểu HTTP, SDK và Ollama.
3. Học Week 2 theo thứ tự Day 1 đến Day 5.
4. Học Week 3 rồi Week 4 để có nền tảng model/token và đánh giá.
5. Học Week 5 RAG, sau đó mới đi tới Week 6-7 về dữ liệu, training và QLoRA.
6. Đọc Week 8 như một bài tích hợp, không như điểm bắt đầu.

## Câu hỏi tự kiểm tra ban đầu

1. **`messages` là gì và vì sao không chỉ gửi một chuỗi?**
   Nếu chưa trả lời được, học [bài 01 chi tiết](01-goi-llm-va-prompt-co-ban-chi-tiet.md), phần "Messages và prompt".

2. **`OpenAI()` có chạy model GPT trên máy bạn không?**
   Nếu chưa chắc, đọc lại bài 01 và [Guide 9](../guides/09_ai_apis_and_ollama.ipynb), phần client library.

3. **Vì sao notebook có thể báo `NameError` dù code đúng?**
   Quay lại [Guide 6](../guides/06_python_foundations.ipynb) và giai đoạn 0.

4. **Một câu trả lời nghe hay có chứng minh RAG retriever hoạt động tốt không?**
   Chưa. Hãy để câu hỏi này lại Week 5, nơi retrieval và answer được tách để đánh giá.

5. **Training, inference và evaluation khác nhau thế nào?**
   Nếu lẫn lộn, đọc lại mục "Nền tảng AI cần có đúng lúc" trước khi sang Week 6.

6. **Model muốn gọi tool thì tool đã được chạy chưa?**
   Chưa chắc. Học Week 2 Day 4-5 để thấy vòng lặp do application code điều khiển.

## Nguyên tắc thực hành

- Chạy notebook từ trên xuống, ghi lại input và output quan sát được.
- Trước khi đổi nhiều thứ, chỉ đổi một biến: prompt, URL, model name hoặc một tham số.
- Không xem output cũ trong notebook là bằng chứng bạn vừa chạy thành công.
- Không dán API key vào cell, screenshot, commit hay file Markdown.
- Với thao tác gọi cloud API, kiểm tra giá, quota và tài khoản trước; dừng nếu bạn không muốn phát sinh chi phí.

## Dấu hiệu nên dừng để hỏi

- Kernel khác Python environment chứa dependency của repository.
- Bạn không biết input vào hàm hoặc kiểu dữ liệu trả ra.
- Lỗi có thể liên quan secret, billing hoặc quyền truy cập.
- Bạn sắp tải model/dataset lớn hoặc chạy training mà chưa hiểu chi phí tài nguyên.

Trong các trường hợp này, ghi lại nguyên văn thông báo lỗi đã được làm sạch secret, cell/hàm bạn đang chạy và điều đã thử. Đây là đủ dữ kiện để phân tích mà không cần đoán mò.

Bước học tiếp theo là [bài 01 chi tiết](01-goi-llm-va-prompt-co-ban-chi-tiet.md).
