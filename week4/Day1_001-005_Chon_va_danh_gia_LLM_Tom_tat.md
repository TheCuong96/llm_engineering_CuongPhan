# Chọn và đánh giá LLM — Bản tóm tắt

tôi muốn bạn phân tích mục tiêu, mục đích mà nội dung trong các video giảng dạy về AI này nói về điều gì rồi giảng dạy lại cho tôi theo cách dễ hiểu hơn, vì tôi thấy rất khó hiểu rằng video muốn truyền đạt điều gì, tôi muốn bạn dạy lại cho tôi bằng tiếng Việt thông qua file .md, đôi khi nội dung của bạn viết lại hơi dài, cho nên tôi muốn khi tạo ra file .md thì tôi muốn bạn tạo cho tôi thành 2 file .md mà trong đó 1 file đầy đủ còn 1 file là tóm tắt lại nội dung của phần đó, để tôi có thể xem và hiểu nhanh hơn.

> Tổng hợp 5 bài Day 1, video 001–005, dựa trên phụ đề tiếng Anh đính kèm. Đọc bản này để nắm ý chính; xem bản đầy đủ để hiểu ví dụ và cách áp dụng.

## 1. Cả phần học muốn nói gì?

**Hãy chọn model phù hợp với công việc, rồi kiểm chứng bằng dữ liệu thực tế.** Model đứng đầu bảng xếp hạng chưa chắc phù hợp nhất với ứng dụng của bạn.

Ví dụ: tính năng sửa câu tiếng Anh A1 cần sửa đúng, giải thích dễ hiểu và phản hồi nhanh. Khả năng giải toán cực khó không phải tiêu chí quyết định.

## 2. Ý chính của từng video

| Video | Điều cần hiểu |
| --- | --- |
| 001 — Chọn model | Xác định yêu cầu, lọc theo thông số, tốc độ, chi phí và điều kiện sử dụng |
| 002 — Chinchilla | Phải xét cả kích thước model và dữ liệu học; nhiều tham số không bảo đảm tốt hơn |
| 003 — Benchmarks | Mỗi bộ đề kiểm tra một số năng lực cụ thể |
| 004 — Hạn chế | Điểm có thể bị ảnh hưởng bởi đề đã gặp, tối ưu quá sát đề hoặc cách đo khác nhau |
| 005 — Connect Four | Demo cho thấy lỗi thực tế và ảnh hưởng của prompt; không phải bài code đầy đủ |

## 3. Các thông số dễ nhầm

| Thuật ngữ | Nhớ ngắn gọn |
| --- | --- |
| Parameters | Model có bao nhiêu tham số được học |
| Training tokens | Lượng token đã dùng để huấn luyện |
| Context window | Giới hạn ngữ cảnh cho một lần xử lý |
| Knowledge cutoff | Mốc dữ liệu kiến thức, không bảo đảm biết hết trước mốc đó |
| TTFT | Chờ bao lâu tới token đầu tiên |
| Output throughput | Sau khi bắt đầu, sinh token nhanh thế nào |
| Rate limits | Được gọi bao nhiêu request/token trong một khoảng thời gian |

Context có thể chứa chỉ dẫn, lịch sử được gửi lại, tài liệu và kết quả công cụ. Nó không chỉ là câu hỏi mới nhất, cũng không phải trí nhớ vĩnh viễn.

Chạy local vẫn có chi phí máy, điện và vận hành. Dùng API cần tính phí sử dụng, tích hợp và giới hạn tải. Xem tổng chi phí, không chỉ giá mỗi token.

## 4. Chinchilla trong một ý

Trong điều kiện tối ưu tính toán huấn luyện của nghiên cứu, khi tăng kích thước model, lượng token huấn luyện tối ưu cũng cần tăng tương ứng. **Điều này không có nghĩa gấp đôi tham số thì thông minh gấp đôi.** [Nghiên cứu Chinchilla](https://arxiv.org/abs/2203.15556).

Ngoài huấn luyện, còn có thể cải thiện kết quả lúc sử dụng bằng prompt, thêm tính toán suy luận, RAG hoặc công cụ. RAG cung cấp tài liệu liên quan cho model; không mặc nhiên huấn luyện lại trọng số.

## 5. Sáu benchmark cần nhận diện

| Benchmark | Kiểm tra chủ yếu |
| --- | --- |
| GPQA | Câu hỏi khoa học chuyên sâu |
| MMLU-Pro | Kiến thức và suy luận đa lĩnh vực |
| AIME | Toán thi đấu |
| LiveCodeBench | Bài lập trình, cập nhật bài mới theo thời gian |
| MuSR | Suy luận nhiều bước từ câu chuyện |
| HLE | Câu hỏi học thuật rất khó |

Benchmark là bộ bài và cách đánh giá; metric là chỉ số; leaderboard là bảng xếp hạng theo kết quả.

Khi so điểm, hỏi: **cùng bộ đề, phiên bản, prompt, công cụ và số lần thử chưa?** Các điểm hoặc thứ hạng trong video thuộc thời điểm ghi hình.

## 6. Vì sao không nên tin điểm số tuyệt đối?

- **Contamination:** đề hoặc đáp án đã lọt vào dữ liệu học.
- **Overfitting:** chỉnh hoặc chọn model quá nhiều lần theo cùng một bộ đề.
- **Khác điều kiện đo:** một bên được nhiều token, công cụ hoặc lượt thử hơn.
- **Phạm vi hẹp:** giỏi toán không bảo đảm giảng dễ hiểu hoặc làm giao diện tốt.
- **Thiếu sắc thái:** trắc nghiệm khó đo khả năng hỏi lại và xử lý mơ hồ.
- **Saturation:** các model đều gần điểm tối đa nên khó phân biệt.

Video còn nêu mối quan tâm về model phản ứng khác trong bối cảnh đánh giá; không nên diễn giải thành khẳng định mọi model cố ý gian lận.

Điểm giảm khi đổi tên hoặc số trong đề cho thấy kết quả chưa vững trước biến thể, nhưng riêng dấu hiệu đó chưa chứng minh chắc chắn contamination. [Apple: GSM-Symbolic](https://machinelearning.apple.com/research/gsm-symbolic).

## 7. Connect Four giúp hiểu điều gì?

Hai bên lần lượt thả quân vào cột; bốn quân liên tiếp ngang, dọc hoặc chéo thì thắng. Model phải đọc đúng bàn cờ, tìm nước thắng và chặn đối thủ.

Giảng viên quan sát rằng yêu cầu đánh giá bàn cờ trước khi chọn cột giúp chơi tốt hơn so với chỉ hỏi cột. Tuy nhiên, **giải thích nghe hợp lý vẫn có thể đi sai**.

Nếu tự xây, hãy để code kiểm tra nước đi và thắng/thua. Muốn so model cần nhiều ván, đổi bên đi trước, giữ rõ cấu hình và ghi cả lỗi, tốc độ, chi phí. Một ván thắng không chứng minh model giỏi hơn toàn diện.

## 8. Quy trình áp dụng ngay — phần bổ sung

1. Viết rõ nhiệm vụ và thế nào là kết quả đạt.
2. Lọc 2–3 model theo khả năng, tốc độ, chi phí và điều kiện triển khai.
3. Xem benchmark phù hợp để hỗ trợ sàng lọc.
4. Chuẩn bị bộ thử gần dữ liệu người dùng, gồm cả câu khó và đầu vào mơ hồ.
5. Chấm chất lượng, định dạng, thời gian và chi phí; giữ tập kiểm tra riêng khỏi tập chỉnh prompt.
6. Chọn model đáp ứng yêu cầu, theo dõi lỗi sau khi sử dụng.

**Câu cần nhớ:** benchmark giúp bạn biết nên thử model nào; bài kiểm tra của ứng dụng giúp bạn quyết định nên dùng model nào.
