# Day 5 — Bản tóm tắt nhanh: Fine-tuning có chắc làm AI tốt hơn?

> Tóm tắt 6 video 022–027. Đọc bản này trước để nắm ý; mở bản đầy đủ khi cần giải thích từng bước.

## 1. Cả phần đang muốn nói gì?

**Hãy chọn AI bằng kết quả đo được trên bài toán của mình. Fine-tuning không bảo đảm mô hình sẽ tốt hơn.**

Bài toán của giảng viên là: **đưa mô tả sản phẩm → dự đoán giá**.

Ông thử fine-tune một LLM có sẵn. Kết quả chưa cải thiện ổn định. Sau đó, ông thử một mạng neural chuyên dự đoán giá và đạt kết quả tốt hơn trong phép thử của khóa học.

## 2. Mỗi video đóng góp gì?

| Video | Ý chính |
|---|---|
| 022 | Chọn SFT vì dữ liệu đã có câu hỏi và đáp án mẫu |
| 023 | Chuyển các cặp mô tả–giá thành JSONL rồi tải lên |
| 024 | Tạo job huấn luyện và theo dõi loss |
| 025 | Test mô hình mới: fine-tuning lần này chưa tốt hơn |
| 026 | Rút kinh nghiệm và giới thiệu mạng neural sâu |
| 027 | Mạng chuyên dụng 289 triệu tham số đạt sai số trung bình $46,49 |

**Tên model cần sửa khi đọc:** tên file có chỗ ghi GPT-4o, nhưng phần thực hành dùng **GPT-4.1 nano**. Các số liệu dưới đây thuộc video, không phải thông tin dịch vụ hiện hành.

## 3. Fine-tuning là gì?

Giống như huấn luyện bổ sung cho một người đã có kiến thức nền, bằng các ví dụ của công việc bạn cần làm.

- **Prompting:** viết yêu cầu trong lần hỏi; không cập nhật tham số.
- **RAG:** tìm thông tin liên quan rồi đưa vào câu hỏi; bản thân bước này không huấn luyện mô hình.
- **Fine-tuning:** dùng dữ liệu để tiếp tục huấn luyện mô hình có sẵn.
- **Mạng dự đoán giá tự xây:** một mô hình chuyên dụng khác, không phải chatbot tổng quát.

Fine-tuning qua API trong bài tạo một biến thể dùng qua dịch vụ, không phải tự xây ChatGPT từ đầu hay tải toàn bộ mô hình về máy.

| Cách tinh chỉnh | Mô hình học từ đâu? |
|---|---|
| SFT | Câu hỏi + câu trả lời mong muốn |
| DPO | So sánh câu trả lời được ưu tiên và câu kém ưu tiên |
| RFT | Điểm từ cơ chế chấm, gọi là grader |

Bài này thử **SFT** vì có sẵn giá thật làm đáp án.

## 4. Quy trình chỉ cần nhớ 6 bước

1. Chuẩn bị các cặp **mô tả sản phẩm + giá thật**.
2. Ghi thành **JSONL**, mỗi dòng là một ví dụ hội thoại.
3. Tải file train và validation lên, lấy file ID.
4. Tạo job fine-tuning, theo dõi bằng job ID.
5. Hoàn tất thì lấy **model ID mới** để gọi dự đoán.
6. Đo sai số trên test và so với mô hình gốc.

**Train để học; validation để theo dõi/chọn cấu hình; test để đánh giá cuối.** Khi test, giá thật được giữ ở phía chương trình chấm, không gửi cho mô hình.

Các từ hay gặp: **epoch** = một lượt qua tập train; **batch** = một nhóm mẫu; **learning rate** = mức điều chỉnh khi học; **inference** = dùng mô hình để dự đoán.

## 5. Bẫy lớn nhất: loss giảm không đồng nghĩa giá đúng hơn

Mô hình có thể học nhanh cách trả lời `$80.00` thay vì viết một đoạn giải thích. Định dạng tốt hơn có thể làm loss giảm, nhưng con số giá vẫn có thể sai nhiều.

Ví dụ giá thật $80:

- “Khoảng 82 đô” sai định dạng nhưng chỉ lệch $2.
- `$800.00` đúng định dạng nhưng lệch $720.

**Loss trong SFT đo việc dự đoán token; MAE đo độ lệch giá.** Hai thước đo không phải một.

```text
MAE = trung bình của |giá dự đoán − giá thật|
```

MAE $46,49 nghĩa là sai trung bình $46,49, không có nghĩa mọi sản phẩm đều sai ít hơn số đó.

**Không gửi đáp án `assistant` mẫu khi test.** Nếu mô hình nhìn thấy giá thật, điểm số đẹp không phản ánh năng lực dự đoán.

## 6. Thí nghiệm cho kết quả gì?

| Phương án | Quy mô được nêu trong video | Sai số trung bình |
|---|---|---:|
| Fine-tune GPT-4.1 nano, lần chạy chính | 20.000 train, 50 validation, 200 test | $75,91 |
| Mạng neural sâu chuyên dự đoán giá | Khoảng 800.000 mẫu huấn luyện, 289 triệu tham số | $46,49 |

Giảng viên nói lần fine-tuning chính kém hơn nano gốc; một lần trước từng đạt $67,75. Kết quả có biến động, chưa cho thấy lợi ích ổn định.

DNN thấp hơn lần fine-tuning chính khoảng **38,8% về sai số**, nhưng hai thiết lập dùng lượng dữ liệu và quy trình khác nhau. Không thể quy toàn bộ khác biệt cho kiến trúc.

Mạng DNN dùng nhiều lớp, **residual connections** giúp truyền thông tin qua mạng sâu, **LayerNorm** hỗ trợ ổn định việc học và **dropout** giúp hạn chế học quá sát dữ liệu train. Nó chuyên dự đoán giá, không biết làm mọi việc như LLM.

## 7. Điều cần nhớ và điều không nên suy ra

**Cần nhớ:**

- Job thành công chỉ xác nhận huấn luyện đã hoàn tất; chất lượng cần đo riêng.
- Một mô hình chuyên dụng có thể rất tốt ở nhiệm vụ hẹp.
- Dữ liệu, cấu hình và cách đánh giá quan trọng hơn việc chỉ chọn tên model nổi tiếng.
- Thử nghiệm chưa tốt vẫn giúp biết hướng nào chưa hiệu quả trong điều kiện đã thử.

**Không nên suy ra:**

- Fine-tuning luôn làm AI kém hơn.
- Mô hình mở chắc chắn fine-tune tốt hơn mô hình đóng.
- Mạng 289 triệu tham số giỏi hơn LLM ở mọi công việc.
- Loss giảm là đủ để kết luận mô hình hữu ích hơn.

**Một câu để nhớ cả phần:** “Cho mô hình học thêm chỉ là một bước; phải kiểm tra trên dữ liệu chưa dùng để học mới biết nó có tiến bộ hay không.”

*Nguồn: phụ đề 022–027 và các khung hình thực hành/kết quả trong video đính kèm. Ví dụ giải thích được viết bổ sung; không phải bản dịch nguyên văn.*
