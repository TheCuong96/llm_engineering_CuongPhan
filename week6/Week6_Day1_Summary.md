# Tuần 6 · Ngày 1 — Bản tóm tắt nhanh

> **Cả sáu video dạy cách chuẩn bị dữ liệu để AI học dự đoán giá sản phẩm. Kết thúc phần này mới có bộ dữ liệu phù hợp; chưa huấn luyện xong AI.**

## 1. Hiểu bằng một ví dụ

Bạn muốn đào tạo một nhân viên định giá. Bạn đưa nhiều phiếu **mô tả sản phẩm + giá đã biết**, để sau này họ định giá được sản phẩm mới.

Trước khi đào tạo, phải chọn phiếu có đáp án, bỏ phiếu trùng, tránh chỉ toàn một loại hàng và cất riêng đề thi. Đó chính là việc giảng viên đang làm với dataset.

## 2. Mỗi video muốn truyền đạt điều gì?

| Bài | Ý chính cần nhớ |
|---|---|
| 001 — Training và Generalization | AI cần học quy luật để làm tốt với dữ liệu mới, không chỉ nhớ ví dụ cũ |
| 002 — Fine-tuning và dự án | Dùng mô hình có sẵn, đào tạo thêm cho nhiệm vụ đoán giá từ mô tả |
| 003 — Dữ liệu và đánh giá | Chọn nguồn dữ liệu, xác định sai số giá và tách train/validation/test |
| 004 — Làm sạch Amazon | Bỏ dòng thiếu giá, giới hạn phạm vi giá và chuẩn hóa mô tả |
| 005 — Phân bố và loại trùng | Phát hiện quá nhiều món rẻ/phụ tùng ô tô; tránh trùng giữa bộ học và bộ kiểm tra |
| 006 — Lấy mẫu và lưu | Chọn 820.000 sản phẩm có ưu tiên, chia tập, lưu Full/Lite để dùng tiếp |

## 3. Các khái niệm cốt lõi

| Thuật ngữ | Nghĩa dễ hiểu |
|---|---|
| Dataset — Bộ dữ liệu | Tập các phiếu sản phẩm |
| Label/Target — Nhãn/đáp án mục tiêu | Giá đã biết để mô hình học và đối chiếu |
| Training — Huấn luyện | Điều chỉnh tham số mô hình từ dữ liệu |
| Generalization — Khái quát hóa | Dự đoán tốt cho ví dụ chưa dùng để huấn luyện |
| Fine-tuning — Tinh chỉnh | Huấn luyện thêm mô hình đã có cho nhiệm vụ cụ thể |
| Data curation — Tuyển chọn dữ liệu | Xem xét, làm sạch, lọc và chọn ví dụ phù hợp |
| Data leakage — Rò rỉ dữ liệu | Thông tin từ dữ liệu học lọt sang bài kiểm tra, làm điểm số dễ gây hiểu lầm |
| Weighted sampling — Lấy mẫu có trọng số | Cho một số bản ghi cơ hội được chọn cao hơn |

**Phân biệt:** RAG tìm tài liệu đưa vào yêu cầu lúc trả lời. Fine-tuning cập nhật các tham số được huấn luyện. Upload dataset chỉ lưu dữ liệu. Đây là ba thao tác khác nhau.

## 4. Quy trình trong bài

1. **Lấy dữ liệu:** Amazon Reviews 2023; dùng thông tin sản phẩm và giá, không lấy đánh giá khách hàng làm đầu vào chính.
2. **Làm sạch và lọc:** phải có giá; phạm vi **0,50–999,49 USD**; mô tả tối thiểu **600 ký tự**, giới hạn tổng **4.000 ký tự**.
3. **Mở rộng danh mục:** từ thiết bị gia dụng sang nhiều loại hàng, thu được gần **2,9 triệu** sản phẩm sau lọc.
4. **Loại trùng tiêu đề hoặc mô tả:** còn khoảng **2.887.000** sản phẩm.
5. **Xem phân bố:** nhiều món rẻ và nhiều phụ tùng ô tô hơn mức giảng viên mong muốn cho dự án.
6. **Chọn 820.000 sản phẩm có trọng số:** tăng ưu tiên món đắt, giảm ưu tiên một số danh mục đang lấn át.
7. **Xáo trộn, chia ba tập, lưu lên Hugging Face Hub.**

Các ngưỡng lọc là lựa chọn của bài tập, không phải tiêu chuẩn bắt buộc cho mọi AI. Ký tự cũng không đồng nghĩa token.

## 5. Lấy mẫu có trọng số: chỗ dễ khó hiểu nhất

Hãy nghĩ đến “mức ưu tiên bốc thăm”. Video chuẩn hóa giá về thang gần 0–1, bình phương giá trị đó, rồi điều chỉnh theo danh mục:

- Tools and Home Improvement: nhân trọng số với **0,5**.
- Automotive: nhân trọng số với **0,05**.
- Chuẩn hóa tổng trọng số và chọn mẫu **không hoàn lại**: không chọn lại cùng một phần tử.

Điều này **chỉ thay đổi cơ hội được chọn**, không đổi giá và chưa huấn luyện mô hình. Hệ số 0,05 không có nghĩa ô tô sẽ chiếm đúng 5% dữ liệu.

Sau chọn mẫu, giá trung bình tăng từ khoảng **59 lên 140 USD**. Mục đích là phù hợp phạm vi sản phẩm muốn học; không phải làm mọi nhóm có số lượng bằng nhau. Muốn biết có tốt hơn thật không vẫn phải đánh giá mô hình.

Đừng nhầm **trọng lượng sản phẩm**, **trọng số lấy mẫu** và **trọng số bên trong mô hình**.

## 6. Ba bộ dữ liệu dùng làm gì?

| Bộ | Cách nhớ | Full | Lite |
|---|---|---:|---:|
| Train | Bài để học, cập nhật tham số | 800.000 | 20.000 |
| Validation | Thi thử để chọn cách làm/phiên bản | 10.000 | 1.000 |
| Test | Thi cuối sau khi đã chốt lựa chọn | 10.000 | 1.000 |
| **Tổng** | | **820.000** | **22.000** |

Phải loại trùng để tránh đề thi có đúng sản phẩm đã học. Không liên tục dùng test để chỉnh mô hình rồi coi nó vẫn là bài thi cuối độc lập.

## 7. Chấm mô hình như thế nào?

Giá trong dữ liệu là **100 USD**, dự đoán **120 USD** → sai số tuyệt đối **20 USD**.

Lấy trung bình các sai số tuyệt đối gọi là **MAE**. Ví dụ lỗi 20, 10, 30 USD thì MAE = **20 USD**. Chỉ số này dễ diễn giải: dự đoán lệch trung bình bao nhiêu tiền trên bộ đánh giá.

Giá nhãn là giá trong dữ liệu, không đảm bảo là giá thị trường hiện tại. Điểm tốt trên bộ đã tuyển chọn cũng chưa chứng minh tốt cho mọi loại sản phẩm ngoài thực tế.

## 8. Sau phần này cần nhớ gì để học tiếp?

- Ngày 1 chuẩn bị dữ liệu; ngày 2 sẽ tiền xử lý mô tả bằng LLM và giới thiệu API theo lô.
- Dự án tận dụng mô hình có sẵn; không xây ChatGPT từ đầu.
- Dữ liệu tốt và bộ kiểm tra công bằng quan trọng không kém cách huấn luyện.
- Seed 42 giúp tái lập khi các điều kiện tương ứng giống nhau; không tự làm AI giỏi hơn.
- Có thể học ý tưởng và dùng dữ liệu đã xử lý của giảng viên, không bắt buộc tự xử lý hàng triệu dòng để hiểu bài.

**Tự kiểm tra:** Nếu giải thích được vì sao cần giá làm nhãn, vì sao phải loại trùng và vì sao train/validation/test tách riêng, bạn đã nắm được trọng tâm ngày học này.

---

Nguồn: phụ đề tiếng Anh bài 001–006 do bạn cung cấp; công thức lấy mẫu đối chiếu màn hình MP4 bài 006 khoảng 00:45. MP4 bài 001 không truy cập được, nhưng phụ đề bài đó có đầy đủ để giảng lại nội dung. Ví dụ số nhỏ là minh họa bổ sung; số lượng và quan sát dữ liệu lớn được thuật lại từ bài giảng, không phải kết quả chạy lại.
