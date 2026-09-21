# Day 1 — Modal và agent đầu tiên: bản tóm tắt

> **Chỉ cần nhớ:** Phần này dạy cách biến mô hình dự đoán giá đã fine-tune thành dịch vụ trên cloud, rồi bọc lời gọi dịch vụ trong `SpecialistAgent` để ứng dụng sử dụng.

## 1. Đang xây cái gì?

Mục tiêu **cả tuần** là hệ thống săn ưu đãi: đọc tin RSS, chọn sản phẩm, ước lượng giá, tìm ưu đãi hấp dẫn và gửi thông báo điện thoại.

Mục tiêu **6 bài hôm nay** là làm phần định giá hoạt động trên Modal. Chưa hoàn thành hệ thống tự động săn ưu đãi, RAG hay toàn bộ các agent.

Đây là triển khai và sử dụng model đã học, không phải huấn luyện ChatGPT từ đầu.

## 2. Mỗi bài muốn truyền đạt điều gì?

| Bài | Ý chính |
|---|---|
| 001 | Kết nối những gì đã học thành sản phẩm có khả năng hành động |
| 002 | Thiết kế từ bài toán; chỉ tách nhiều agent khi có ích; làm quen Modal |
| 003 | Cùng hàm Python có thể chạy local hoặc remote |
| 004 | Cấp quyền tải model bằng Secrets; chạy LLaMA và model fine-tune trên GPU cloud |
| 005 | Giữ đầu vào nhất quán, deploy dịch vụ, dùng Volume và class để giảm chuẩn bị lặp lại |
| 006 | Tạo `SpecialistAgent` để gọi dịch vụ định giá |

## 3. Những từ khóa cần hiểu

| Từ khóa | Hiểu đơn giản |
|---|---|
| Modal | Nền tảng chạy mã và mô hình trên cloud |
| Serverless | Nền tảng lo phần lớn việc quản lý máy chủ; vẫn có máy chủ thật |
| Inference | Dùng model đã học để tạo dự đoán |
| Deployment | Triển khai mã và cấu hình để gọi lại như một dịch vụ |
| Image | Bản mô tả môi trường phần mềm và thư viện |
| Secret | Cấu hình chứa thông tin xác thực cần dùng khi chạy |
| Volume | Nơi lưu file bền vững, chẳng hạn trọng số model |
| Cold start | Phải khởi động và chuẩn bị môi trường trước khi xử lý |
| SpecialistAgent | Class bọc lời gọi model định giá ở xa |

## 4. Hệ thống chạy như thế nào?

1. Nhận mô tả sản phẩm.
2. Chuẩn hóa về định dạng tương tự lúc huấn luyện.
3. `SpecialistAgent` gọi phương thức định giá trên Modal.
4. Model nền kết hợp adapter đã fine-tune chạy trên GPU cloud.
5. Kết quả được chuyển thành giá dự đoán và trả về chương trình.

**Ví dụ bổ sung:** Bạn gửi mô tả tai nghe; model trả giá 100 USD. Nếu giá rao là 60 USD, hệ thống ở các ngày sau có thể xem xét chênh lệch 40 USD. Con số dự đoán chưa chứng minh món hàng thực sự rẻ.

## 5. Ba chỗ dễ nhầm nhất

### “Agent” có tự suy nghĩ và làm mọi việc không?

`SpecialistAgent` trong bài chỉ nhận mô tả rồi gọi dịch vụ. Chưa có vòng lặp tự lập kế hoạch. Lớp cha `Agent` chủ yếu giúp ghi log theo màu.

Bài học kiến trúc: bắt đầu đơn giản, đánh giá kết quả rồi mới tăng số bước hoặc số lời gọi LLM.

### Có Volume rồi sao vẫn phải chờ?

**File trên ổ đĩa khác model đang nằm trong RAM/VRAM.** Volume giữ file; container mới vẫn cần nạp model vào bộ nhớ. Gọi lại khi container còn sẵn sàng thường nhanh hơn.

Video minh họa hơn một phút → khoảng 30 giây → gần tức thì tùy trạng thái. Đây là số đo demo, không phải cam kết tốc độ.

### Deploy xong có tự chạy săn ưu đãi mãi không?

Chỉ dịch vụ định giá được triển khai. Nếu phần điều phối còn chạy trên laptop và bạn tắt nó, phần đó cũng dừng. Deploy không mặc định giữ GPU luôn bật hoặc tạo API HTTP công khai.

## 6. Chi tiết thực hành cần nhớ

- Modal token cho chương trình truy cập Modal; Hugging Face token cho container truy cập model.
- Secret trong bài tên `huggingface-secret`, chứa key `HF_TOKEN`; tên tham chiếu trong mã phải khớp.
- `.local()` chạy tại máy hiện tại; `.remote()` thực thi trên cloud.
- Preprocessing giúp nhất quán với lúc huấn luyện; không đảm bảo mọi ví dụ đều chính xác hơn.
- Bản class tách khởi tạo model khỏi xử lý từng yêu cầu; Volume lưu file cho những lần chạy sau.
- Giá micro/iPhone trong video là đầu ra minh họa, không phải giá thị trường hiện tại.

**Thông tin đối chiếu ngày 16/09/2026:** Modal hiện mô tả tối đa 60 giây nhàn rỗi mặc định, khác 2 phút trong video. Giữ container sẵn sàng lâu hơn có thể tốn thêm phí. Xem [Modal: Cold start performance](https://modal.com/docs/guide/cold-start).

## 7. Tự kiểm tra trong 30 giây

- **Hôm nay có train lại model không?** Không, chủ yếu deploy và inference.
- **Model chạy ở đâu?** GPU trên Modal; code gọi có thể ở máy cá nhân.
- **Volume có giữ model luôn trong GPU không?** Không, nó giữ file.
- **Agent đầu tiên làm gì?** Gọi model chuyên định giá.
- **Sau phần này đã có toàn bộ hệ thống chưa?** Chưa; còn các phần của những ngày sau.

*Nguồn: 6 phụ đề SRT bài 001–006 bạn gửi. Bản đầy đủ giải thích từng bước, mã minh họa và các điểm cần phân biệt.*
