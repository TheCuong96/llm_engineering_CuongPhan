## Quá trình hiểu và xây dựng 1 LLM local từ đầu đến đuôi.
## Mục tiêu là xây dựng 1 AI local tự train để phục vụ cho việc viết code và phát triển sản phẩm với các ngôn ngữ như là reactjs, nodejs,nest, python.

1. LLM (Large Language Model — mô hình ngôn ngữ lớn) là gì?: 
- là công cụ hỗ trợ hành động và tương tác đa chức năng dùng để tra cứu và thực hiện hành động có tư duy đã được đào tạo để cho ra kết quả gần như là tốt nhất mà nó biết ngay tại thời điểm đó

2. Prompt, System prompt, User prompt là gì?: 
- system prompt là quy tắc, bối cảnh được đặt ra cho AI(LLM) để mọi lần tương tác, đối thoại đó đều phải thông qua các quy tắc đó để phản hồi cho user ví dụ: "bạn là kỹ sư AI chuyên nghiệp...", user prompt là câu sự tương tác trực tiếp từ người dùng ví dụ:"tôi muốn biết vòng đời trong lập trình reactjs".

3. Có những loại AI nào: 
- có nhiều hãng nhưng lại có 2 loại là mã nguồn đóng và mã nguồn mở.

4. ollama là loại công cụ chưa nhiều LLM mã nguồn mở, và ta có thể sử dụng để dùng dưới local miễn phí.

5. Parameters(tham số) trong LLM là gì:
- Là kiến thức mà LLM đã được học được hiểu là tham số, tham số càng cao thì chứng tỏ LLM đó được học càng nhiều, ví dụ: "JS=15, Reactjs=10, tiếng anh 20,và LLM đều được học cả 3 cái trên thì tham số của LLM đó sẽ là 45"

6. RLHF (Reinforcement Learning from Human Feedback) là gì:
- là bước huấn luyện bổ sung giúp model trả lời theo phong cách "trợ lý hữu ích" — đây vẫn thuộc giai đoạn training, xảy ra trước khi bạn gọi API, không phải mỗi lần bạn chat

7. trong 1 LLM hoàn chỉnh thì gồm có những thành phần gì:
- Có model, có Tool, có Agent

8. Model là gì:
- Model không tự thực thi hành động trên máy — nó chỉ sinh ra "yêu cầu gọi tool"; chương trình bên ngoài mới thực sự chạy tool đó

9. Tool là gì: là các chức năng phần mềm có thể thực hiện trên máy của mình ví dụ như: mở, đọc, thêm, xóa, sửa, chạy bất ứng dụng nào mà ta yêu cầu và cấp phép 

10. Agent là gì: Hệ thống để model tự quyết định bước tiếp theo trong một vòng lặp(tự quyết định, có vòng lặp) 

11. AI có biết mình là ai không: 
-Không, AI chỉ đọc lại được nội dung mà mình đã tổng kết của các lần trước để gửi lại cho lần này để nó hiểu tình hình cuộc trò truyện nên mới biết mình là ai ngay lúc đó và trong cuộc hội thoại đó.
12. Streaming là gì:
- Là cơ chế chỉ giúp thấy kết quả sớm hơn, không làm cả pipeline (bước chọn link + tải trang) nhanh hơn.

13. Inference(suy luận) là gì:
- đơn giản là hỏi từ bạn và AI đáp lại câu hỏi, đưa prompt vào model có sẵn, nhận văn bản trả về

14. 