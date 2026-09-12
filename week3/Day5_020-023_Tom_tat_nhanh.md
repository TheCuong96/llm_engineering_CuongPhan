# Tuần 3 – Ngày 5: Tóm tắt nhanh các bài 020–023

> Đọc trước để nắm mạch bài. Bản đầy đủ giải thích từng công đoạn, thuật ngữ và cách thực hành.

## 1. Cả phần này muốn dạy gì?

**Ghép các mô hình AI có sẵn thành công cụ thực tế: chuyển ghi âm cuộc họp thành bản nháp biên bản.** Sau đó, tự luyện bằng một công cụ sinh dữ liệu giả.

| Bài | Ý chính cần nhớ |
| --- | --- |
| 020 | LLM tạo câu trả lời bằng cách chọn token tiếp theo nhiều lần |
| 021 | Chuẩn bị file trên Colab và dùng Whisper chuyển giọng nói thành văn bản |
| 022 | Dùng transcript làm đầu vào cho Llama để viết biên bản bằng Markdown |
| 023 | Tự xây công cụ sinh dữ liệu tổng hợp để luyện lại kỹ năng |

Bạn đang học **sử dụng và kết hợp model đã được huấn luyện**, chưa phải tự huấn luyện model mới.

## 2. Bài 020: LLM tạo văn bản ra sao?

Mô hình nhận prompt và phần đã sinh, tính khả năng xuất hiện của các token tiếp theo, chọn một token rồi lặp lại. Token có thể là một từ, một phần từ hoặc dấu câu.

Ví dụ trong video: mô tả màu xanh cho người chưa từng nhìn thấy. Sau `Blue`, model có thể chọn ` is` hoặc ` feels`; lựa chọn này làm thay đổi phần tiếp theo.

- **Greedy:** chọn token có xác suất cao nhất mỗi bước.
- **Sampling:** chọn theo phân bố xác suất.
- **Temperature:** điều chỉnh mức biến thiên khi lấy mẫu, không làm model biết nhiều hơn.
- **Streaming:** hiện phần đã sinh để người dùng không phải đợi toàn bộ kết quả.

**Xác suất token cao không bảo đảm câu đúng.** Temperature thấp cũng không bảo đảm kết quả giống tuyệt đối giữa mọi lần chạy. [Tham khảo cách sinh văn bản](https://huggingface.co/docs/transformers/main/en/generation_strategies).

## 3. Bài 021–022: Công cụ biên bản có hai bước AI

| Bước | Model làm gì? | Kết quả |
| --- | --- | --- |
| 1 | Whisper hoặc API nhận dạng giọng nói | Transcript – bản chép lời |
| 2 | Llama đọc transcript theo prompt | Meeting minutes – biên bản họp |

**Transcript ghi lời nói; biên bản rút ra nội dung đáng lưu lại.**

Ví dụ bổ sung:

> “An sửa lỗi đăng nhập trước thứ Sáu. Bình kiểm tra sau khi sửa. Việc đổi giao diện để buổi sau bàn.”

Biên bản đúng phải ghi công việc của An và Bình, đồng thời giữ “đổi giao diện” ở trạng thái **chưa quyết định**.

Các chi tiết thực hành cần nhớ:

- Python chạy trên máy Colab; cần upload audio hoặc mount Google Drive để runtime đọc được file.
- Mount Drive là tùy chọn; file upload tạm có thể mất khi runtime bị xóa.
- Mã trên video dùng `openai/whisper-medium.en`; `.en` là biến thể tiếng Anh. Audio tiếng Việt cần biến thể đa ngôn ngữ phù hợp. [Các biến thể Whisper](https://huggingface.co/openai/whisper-small).
- Nhánh API trong video dùng `gpt-4o-mini-transcribe`. Chỉ cần chọn một nhánh chép lời, không bắt buộc chạy cả hai.
- Llama 3.2 nhận **văn bản** ở bước sau; cả ứng dụng xử lý audio và text nên được gọi là đa phương thức.

## 4. Đọc code mà không bị ngợp

| Tên | Vai trò |
| --- | --- |
| `pipeline` | Gói sẵn các bước thực hiện một tác vụ |
| Tokenizer | Chuyển văn bản thành token và ngược lại |
| Chat template | Đóng gói đúng vai trò và mẫu hội thoại của model |
| Tensor / CUDA | Dữ liệu tính toán / chạy trên GPU |
| Quantization 4-bit | Giảm bộ nhớ lưu một phần trọng số |
| `generate` | Chạy vòng lặp sinh token |
| `TextStreamer` | Hiện văn bản dần |
| Markdown renderer | Hiển thị tiêu đề, danh sách và bảng |

Không cần học thuộc code trước khi hiểu từng bước nhận gì và trả gì. Gán PAD bằng EOS là cấu hình trong demo, không phải quy tắc cho mọi model.

## 5. Prompt biên bản cần yêu cầu gì?

Yêu cầu tóm tắt, chủ đề thảo luận, quyết định và công việc kèm người phụ trách/thời hạn. Xuất Markdown trực tiếp.

Thêm ba quy tắc:

1. Chỉ dùng thông tin trong transcript.
2. Thiếu người phụ trách hoặc thời hạn thì ghi **“Chưa xác định”**.
3. Không biến một đề xuất thành quyết định đã thống nhất.

**Biên bản đẹp chưa chắc đúng.** Kiểm tra tên người, con số, từ phủ định, quyết định và nhiệm vụ so với nguồn. Có timestamp chưa có nghĩa đã nhận diện được người nói.

## 6. Bài 023 giao bài tập gì?

Xây **Synthetic Data Generator – công cụ sinh dữ liệu tổng hợp**. Người dùng mô tả loại dữ liệu và cấu trúc; model sinh dữ liệu mẫu.

Ví dụ phù hợp với frontend: tạo ticket hỗ trợ, sản phẩm hoặc bình luận để thử giao diện.

Cách làm đề xuất: định nghĩa schema → sinh 10 bản ghi → parse JSON → kiểm tra trường và giá trị → xử lý lỗi/trùng lặp → thử model khác → thêm Gradio nếu muốn.

Giảng viên khuyến khích thử nhiều model và cấu hình lượng tử hóa. Mục tiêu là luyện kỹ năng và so sánh thực tế. **Bài 023 chỉ giao bài tập, chưa triển khai công cụ hoàn chỉnh.**

## 7. Năm điều tránh hiểu nhầm

- Tự chạy model không đồng nghĩa không tốn tài nguyên.
- Thời gian và số tiền trong demo không phải cam kết hiệu năng hay giá hiện tại.
- 4-bit không phải tổng VRAM thực tế của toàn ứng dụng.
- Tóm tắt đoạn transcript bị thiếu vẫn có thể cho biên bản thiếu ý.
- Dữ liệu giả đúng JSON chưa chắc đúng quy tắc hoặc đại diện dữ liệu thật.

**Thực hành đầu tiên:** lấy một audio ngắn, tạo transcript, tạo biên bản rồi đối chiếu. Khi hai bước đúng, hãy thêm streaming và giao diện.

---

Nguồn: các bài 020–023 bạn cung cấp; tên model đối chiếu khung hình bài 022. Ví dụ web và quy trình kiểm tra là phần bổ sung. Bản đầy đủ có giải thích sâu hơn và nguồn kỹ thuật liên quan.
