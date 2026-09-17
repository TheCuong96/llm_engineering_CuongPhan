# Day 2 — Tóm tắt nhanh video 007–011

> Biên soạn từ phụ đề 5 video bạn cung cấp. Ví dụ tiếng Việt là phần minh họa bổ sung. Chi phí và thời gian dưới đây là số giảng viên kể trong bài, không phải mức giá hiện tại.

## 1. Phần này đang muốn dạy bạn điều gì?

**Xác định đúng bài toán AI, biết đo kết quả, rồi chuẩn bị dữ liệu tốt trước khi huấn luyện.**

Dự án muốn **đọc mô tả sản phẩm và dự đoán giá**. Trong buổi này, giảng viên dùng một LLM có sẵn để viết lại mô tả cho rõ, ngắn và nhất quán, rồi thực hiện hàng loạt bằng batch.

**Kết quả cuối buổi là dataset đã xử lý; chưa phải mô hình dự đoán giá đã huấn luyện.**

## 2. Mỗi video có vai trò gì?

| Video | Chỉ cần nhớ |
|---|---|
| 007 | Làm dự án AI theo 5 bước; chọn giải pháp bằng thực nghiệm |
| 008 | Đưa vào vận hành rồi vẫn phải tiếp tục đánh giá |
| 009 | Dùng LLM chuẩn hóa mô tả sản phẩm |
| 010 | Dùng JSONL để gửi nhiều yêu cầu thành batch; ghép kết quả bằng ID |
| 011 | Mở rộng lên 22.000 sản phẩm và lưu dataset hoàn chỉnh |

## 3. Quy trình 5 bước

1. **Understand — Hiểu vấn đề:** cần giải quyết gì, dữ liệu nào, đo thành công ra sao, ngân sách và thời gian bao nhiêu?
2. **Prepare — Chuẩn bị:** dữ liệu, danh sách mô hình ứng viên và **baseline**, tức cách giải đơn giản làm mốc so sánh.
3. **Select — Chọn mô hình:** thử trên bài toán của mình và đo kết quả.
4. **Customize — Điều chỉnh:** thử prompting, RAG, agent hoặc fine-tuning theo nhu cầu.
5. **Productionize — Đưa vào vận hành:** triển khai, theo dõi lỗi, chi phí và chất lượng; cập nhật khi cần.

Ví dụ: giá tham chiếu 100 USD, dự đoán 120 USD thì sai số tuyệt đối là 20 USD. Lấy trung bình sai số tuyệt đối trên nhiều sản phẩm là **MAE**; thấp hơn là tốt hơn khi so trên cùng tập dữ liệu.

**MLOps** là công việc vận hành hệ thống học máy. Cần tiếp tục đánh giá vì dữ liệu thực tế và thị trường có thể thay đổi, làm mô hình từng tốt trở nên kém chính xác.

## 4. Bốn kỹ thuật dễ nhầm

| Kỹ thuật | Hiểu nhanh |
|---|---|
| Prompting | Hướng dẫn rõ và đưa ví dụ ngay trong yêu cầu |
| RAG | Tìm thông tin liên quan rồi cung cấp cho mô hình khi trả lời |
| Agentic AI | Điều phối nhiều bước, sử dụng công cụ để hoàn thành nhiệm vụ |
| Fine-tuning | Huấn luyện bổ sung một mô hình đã có bằng dữ liệu phù hợp |

Ba kỹ thuật đầu trong bài cải thiện cách sử dụng mô hình lúc **inference**. Fine-tuning thay đổi các tham số được huấn luyện. Có thể kết hợp các cách này; chọn bằng kết quả đánh giá.

“Fine-tune mô hình của riêng mình” trong khóa học nghĩa là điều chỉnh mô hình đã học sẵn, không phải tạo ChatGPT từ đầu.

## 5. Vì sao phải viết lại mô tả?

Mô tả thô thường có quảng cáo, câu lặp và thông tin lộn xộn. LLM chuyển nó về mẫu:

```text
Title: Tên sản phẩm
Category: Nhóm sản phẩm
Brand: Thương hiệu
Description: Mô tả chính
Details: Thông số quan trọng
```

Ví dụ: “TAI NGHE SIÊU ĐẸP!!! Pin 30 giờ, chống ồn, pin 30 giờ…” được viết thành mô tả ngắn giữ lại pin và chống ồn, bỏ câu quảng cáo và phần lặp.

Mục tiêu là **giữ thông tin ảnh hưởng đến giá**, không chỉ rút ngắn. Nếu bỏ mất “gói 12 chiếc” hoặc tự bịa thương hiệu, dữ liệu sẽ kém đi.

**Hai vai trò khác nhau:** LLM hiện tại nhận văn bản thô và trả mô tả sạch. Mô hình ở bước sau nhận mô tả và dự đoán giá.

## 6. Batch và JSONL: cách hiểu đơn giản

Tưởng tượng có 22.000 phiếu sản phẩm cần biên tập. Bạn đóng thành các tập, giao xử lý rồi quay lại nhận kết quả.

- **Batch:** một lô gồm nhiều yêu cầu độc lập, không phải một prompt khổng lồ.
- **JSONL:** file mà mỗi dòng là một đối tượng JSON; trong bài, mỗi dòng mô tả một yêu cầu.
- **Asynchronous:** gửi công việc trước, kiểm tra và lấy kết quả sau.
- **`custom_id`:** mã giúp biết kết quả thuộc sản phẩm nào.

Quy trình:

1. Tạo JSONL, mỗi sản phẩm có một ID.
2. Upload file.
3. Tạo batch từ file đã upload.
4. Kiểm tra trạng thái.
5. Tải kết quả khi xong.
6. Ghép summary vào đúng sản phẩm bằng ID.

**Không ghép theo thứ tự dòng:** gửi ID 0, 1, 2 có thể nhận về 2, 0, 1.

Trong demo, 1.000 yêu cầu/file × 22 file = 22.000 yêu cầu. Số 1.000 là lựa chọn chia lô của giảng viên.

## 7. Công cụ và số liệu trong bài

| Tên | Vai trò |
|---|---|
| Groq, chữ q | Nền tảng chạy mô hình; khác Grok của xAI |
| GPT-OSS 20B | Mô hình dùng để viết lại mô tả qua Groq |
| LiteLLM | Thư viện hỗ trợ gọi mô hình |
| Ollama và Llama 3.2 | Công cụ và mô hình được thử chạy local |
| Hugging Face | Nơi lấy và lưu dataset |

| Dataset | Train | Validation | Test | Tổng |
|---|---:|---:|---:|---:|
| Light | 20.000 | 1.000 | 1.000 | 22.000 |
| Full | 800.000 | 10.000 | 10.000 | 820.000 |

Train để học, validation để điều chỉnh và chọn phương án, test để đánh giá cuối. Xử lý mô tả cho cả ba tập không có nghĩa dùng cả ba để huấn luyện.

Giảng viên ghi nhận bản Light dưới 1 USD; bản Full khoảng hoặc dưới 30 USD, mất vài giờ. Một lần gọi thử có chi phí **0,011 cent = 0,00011 USD**. Không coi các con số này là chi phí cố định cho mọi dataset hoặc mọi lần chạy.

## 8. Những điểm phải nhớ để không hiểu sai

- **Chạy batch không phải fine-tuning:** ở đây chỉ đang dùng LLM tạo mô tả mới.
- **Summary không rỗng chưa chắc đúng:** cần kiểm tra thông số, số lượng, thương hiệu và ghép đúng ID.
- **Không để giá đáp án lọt vào mô tả đầu vào:** nếu có, điểm đánh giá dễ tốt giả tạo.
- **Dữ liệu gọn hơn chưa chắc mô hình tốt hơn:** cần so sánh kết quả đo.
- **Khi chạy sản phẩm mới, dùng cách tiền xử lý tương ứng với lúc huấn luyện.**
- **Lưu bản dữ liệu thô riêng** để đối chiếu khi cần.

Sau phần này, bạn cần nắm được: **hiểu bài toán → chuẩn bị và làm sạch dữ liệu → thử nghiệm và đánh giá → chọn cách áp dụng → vận hành và tiếp tục theo dõi**. Thực hành hiện tại tập trung vào khâu chuẩn bị dữ liệu; các bài sau mới đi sâu vào baseline và huấn luyện.
