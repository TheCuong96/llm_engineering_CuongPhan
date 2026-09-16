# Day 2 — RAG và Ensemble: bản tóm tắt

> Đọc nhanh nội dung video 007–011. Biên soạn từ 5 phụ đề đính kèm. Xem bản đầy đủ để có ví dụ, sơ đồ và giải thích sâu hơn.

## 1. Cả phần này muốn làm gì?

**Xây bộ định giá: đưa mô tả một sản phẩm vào, nhận giá ước lượng ra.** Bộ phận này sẽ giúp hệ thống săn ưu đãi đánh giá một món hàng có thể đang được bán rẻ hay không.

Bạn đang học cách ghép dữ liệu và các mô hình thành ứng dụng AI. Phần này không huấn luyện ChatGPT từ đầu, cũng chưa hoàn thiện hệ thống tự quét tin và gửi thông báo.

## 2. Năm video nối nhau thế nào?

| Video | Ý chính |
|---|---|
| 007 | Tạo kho sản phẩm tham khảo bằng embedding và ChromaDB |
| 008 | Quan sát vector; tìm 5 sản phẩm tương tự và đưa vào prompt |
| 009 | Đo hiệu quả RAG; giải thích cách kết hợp nhiều mô hình |
| 010 | Đánh giá ensemble và đóng gói logic thành các lớp agent |
| 011 | Chạy toàn bộ luồng và theo dõi các bước qua log |

## 3. RAG — cho AI xem tài liệu trước khi đoán

Thay vì hỏi riêng “Micro này giá bao nhiêu?”, hệ thống hỏi kèm: “Đây là những micro tương tự và giá đã biết của chúng”.

Quy trình:

1. Chuyển mô tả sản phẩm mới thành vector.
2. Tìm 5 sản phẩm gần nghĩa trong Chroma.
3. Lấy mô tả và giá của chúng, ghép vào prompt.
4. LLM dùng thông tin đó để ước lượng giá.

**Encoder tạo vector; Chroma lưu và tìm; LLM đọc thông tin và dự đoán.**

Bài dùng `all-MiniLM-L6-v2` tạo vector 384 chiều. Kho đầy đủ có khoảng 800.000 sản phẩm; light mode dùng khoảng 20.000. Kho được chuẩn bị trước rồi tái sử dụng, không tạo lại toàn bộ mỗi lần hỏi.

RAG ở đây tra dữ liệu có sẵn, không tự lên Internet tìm giá mới. Nó bổ sung ngữ cảnh lúc trả lời, không huấn luyện lại mô hình.

## 4. Vì sao có biểu đồ t-SNE?

t-SNE đưa vector nhiều chiều về 2D/3D để quan sát các nhóm sản phẩm. Giảng viên vẽ khoảng 10.000 điểm.

**Đó là bước khám phá dữ liệu, không phải bước tạo giá.** Hình đẹp không chứng minh dự đoán tốt; Chroma vẫn tìm trên vector gốc trong luồng này.

## 5. Ensemble — lấy ý kiến của ba bộ định giá

| Nhánh | Cách định giá | Trọng số trong bài |
|---|---|---:|
| Frontier + RAG | LLM mạnh đọc thêm sản phẩm tham khảo | 80% |
| Specialist | Mô hình fine-tuned, chạy trên Modal | 10% |
| Neural network | Mạng dự đoán giá đã huấn luyện | 10% |

```text
Giá cuối = 0,8 × giá RAG
         + 0,1 × giá specialist
         + 0,1 × giá neural network
```

Ví dụ: giá thật 100 USD, A đoán 90, B đoán 110. Trung bình hai dự đoán là 100 vì sai số bù nhau. Nhưng nếu cả hai cùng đoán cao, kết hợp vẫn có thể sai.

**80/10/10 được chọn thủ công**, không phải tỷ lệ tối ưu hay xác suất đúng. Ensemble không bảo đảm thắng mô hình tốt nhất ở từng sản phẩm.

## 6. Kết quả cần nhớ

Theo lời giảng, sai số trung bình được báo cáo:

| Phương pháp | Sai số, USD |
|---|---:|
| Specialist fine-tuned | 39,85 |
| Frontier + RAG | 30,19 |
| Ensemble | 29,90 |

RAG đem lại cải thiện lớn; ensemble cải thiện thêm **0,29 USD, khoảng 1%** so với RAG. Đây là kết quả của lần thử trong khóa học, chưa phải bằng chứng hệ thống luôn tốt hơn.

Sai số trung bình 29,90 USD không có nghĩa mỗi sản phẩm chỉ lệch tối đa 29,90 USD. R² khoảng 0,87 được báo cáo cũng không có nghĩa “đoán đúng 87% sản phẩm”.

## 7. Một yêu cầu thực sự chạy ra sao?

**Mô tả thô → chuẩn hóa → ba nhánh định giá → cộng theo trọng số → giá cuối.**

Có năm thành phần mô hình: bộ tiền xử lý, encoder, frontier model, specialist và mạng dự đoán giá. Không phải năm lượt gọi chatbot trả phí; một số thành phần có thể chạy cục bộ.

Modal có thể cần khởi động nguội khi dịch vụ đang nghỉ. Khoảng 30 giây trong video là quan sát của lần chạy đó, không phải thời gian cố định.

“Ensemble Agent” hiện là workflow Python cố định, chưa tự lập kế hoạch. Notebook phục vụ thử nghiệm; các module/class giúp đưa logic vào ứng dụng.

## 8. Những điều tránh hiểu nhầm

- RAG và fine-tuning có thể phối hợp; không có cách nào luôn thắng.
- Thêm nhiều mô hình không tự động làm tốt hơn.
- Chọn trọng số trên validation; giữ test để đánh giá cuối. Tránh để đáp án test lọt vào kho tham khảo.
- Nếu bỏ hai nhánh và chỉ dùng RAG, trả nguyên giá RAG, không nhân 0,8.
- Tên video 009 ghi GPT-4o nhưng phụ đề nói GPT-5.1; tài liệu theo lời giảng. Một dòng phụ đề “129 .90” không khớp nhiều lần nhắc kết quả 29,90.

**Câu cần nhớ:** tra ví dụ phù hợp giúp AI định giá tốt hơn; kết hợp nhiều dự đoán có thể giúp thêm, nhưng phải đo lợi ích so với độ trễ và chi phí.
