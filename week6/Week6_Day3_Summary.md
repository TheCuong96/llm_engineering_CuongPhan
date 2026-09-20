# Day 3 — Bản tóm tắt nhanh các bài 012–016

> Đọc trong khoảng 4–6 phút. Tổng hợp từ phụ đề 5 video đính kèm; các con số là kết quả demo của giảng viên, không phải kết quả chạy lại.

## 1. Phần này muốn dạy điều gì?

**Trước khi dùng LLM, hãy xây cách giải đơn giản và đo chất lượng để có mốc so sánh.**

Bài toán: **nhận thông tin sản phẩm, dự đoán giá bằng USD**. Đây là **regression — hồi quy**, vì đầu ra là một con số. Kết quả sẽ làm nền cho hệ thống tìm món hời ở phần sau.

Bạn đang học ML truyền thống để dự đoán giá, chưa phải tạo ChatGPT từ đầu, fine-tune LLM hay xây RAG.

| Video | Điều cần hiểu |
| --- | --- |
| 012 | Vì sao cần baseline; thế nào là học được quy luật và quá khớp |
| 013 | Tạo cách đoán ngẫu nhiên và bộ chấm điểm chung |
| 014 | Thử giá trung bình và hồi quy tuyến tính với vài đặc trưng |
| 015 | Biến nội dung mô tả thành số đếm từ để dự đoán tốt hơn |
| 016 | Thử Random Forest, XGBoost và so sánh kết quả |

## 2. Sáu cách dự đoán, từ đơn giản đến mạnh hơn

| Cách làm | Hiểu đơn giản | Sai số trung bình trong demo |
| --- | --- | ---: |
| Random Pricer | Không đọc sản phẩm, đoán ngẫu nhiên từ 1–999 | 382,08 USD |
| Constant Pricer | Mọi sản phẩm đều đoán bằng trung bình train, khoảng 140,56 USD | 106,18 USD |
| Linear Regression | Học công thức từ trọng lượng, cờ thiếu trọng lượng và độ dài mô tả | 101,56 USD |
| Linear Regression + Bag of Words | Vẫn hồi quy, nhưng dùng số lần các từ xuất hiện trong mô tả | 76,81 USD |
| Random Forest | Nhiều cây quyết định cùng dự đoán rồi lấy trung bình | 72,28 USD |
| XGBoost | Thêm cây theo từng bước để giảm lỗi của mô hình hiện có | 68,23 USD |

**Càng ít sai số càng tốt.** Các mốc chính dùng hàm chấm mặc định trên 200 sản phẩm đầu của tập test.

Điểm đáng nhớ nhất: **chỉ thay đặc trưng đầu vào, cùng thuật toán Linear Regression đã giảm sai số từ 101,56 xuống 76,81 USD.** Chất lượng thông tin đầu vào rất quan trọng.

## 3. Hiểu các mô hình bằng ví dụ

**Linear Regression — hồi quy tuyến tính:** giống một công thức tính giá, trong đó máy tự học các hệ số. Ví dụ minh họa: `giá = 30 + 5 × trọng lượng + 0,1 × độ dài mô tả`. Nhưng nặng hơn hoặc mô tả dài hơn chưa chắc đắt hơn, nên các thông tin này chưa đủ tốt.

**Bag of Words — túi từ:** lập danh sách từ rồi đếm từng từ trong mô tả. Nếu danh sách là `[budget, luxury, tv]`, câu `luxury tv` thành `[0, 1, 1]`.

Trong bài, **CountVectorizer** chọn tối đa 2.000 từ sau xử lý và lọc stop words tiếng Anh. Mỗi sản phẩm được biểu diễn bằng số đếm theo các cột từ vựng đó. Đây là vector đếm từ, không phải embedding ngữ nghĩa dùng trong RAG. Cách cơ bản này không giữ thứ tự câu hay tự hiểu từ đồng nghĩa.

**Random Forest — rừng ngẫu nhiên:** giống nhiều người định giá từ những góc nhìn khác nhau, rồi lấy trung bình ý kiến. Mỗi “người” là một cây quyết định học điều kiện từ dữ liệu. Trong demo: 100 cây, học trên 15.000 sản phẩm.

**XGBoost:** giống một bản dự đoán được cải thiện từng bước; cây mới góp phần sửa lỗi của mô hình trước đó. Trong demo: 1.000 estimators, dùng toàn bộ tập train. Đây là thư viện riêng có giao diện theo phong cách scikit-learn.

Đừng nhầm **Random Forest** với **Random Pricer**: rừng ngẫu nhiên có học từ dữ liệu; Random Pricer đoán bừa.

## 4. Quy trình học và dự đoán

1. Chuẩn bị các sản phẩm kèm giá đã biết.
2. Tạo đặc trưng `X`; giá cần dự đoán là `y`.
3. Dùng `model.fit(X_train, y_train)` để học.
4. Dùng `model.predict(X_new)` để dự đoán sản phẩm mới.
5. Đối chiếu dự đoán với giá giữ riêng để chấm sai số.

Với văn bản: học từ vựng bằng `fit_transform()` trên train; khi dự đoán chỉ dùng `transform()` để giữ nguyên ý nghĩa các cột.

| Tập dữ liệu | Vai trò | Kích thước bản đầy đủ trong video |
| --- | --- | ---: |
| Train | Dùng để học | 800.000 |
| Validation | Chọn mô hình/cấu hình trong quy trình chuẩn | 10.000 |
| Test | Kiểm tra cuối sau khi chốt cách làm | 10.000 |

**Generalization — khái quát hóa:** làm tốt trên sản phẩm chưa học.

**Overfitting — quá khớp:** bám sát dữ liệu đã học, kể cả nhiễu, nhưng gặp sản phẩm mới lại dự đoán kém.

## 5. Đọc điểm số và biểu đồ

- **MAE:** độ lệch tuyệt đối trung bình. Giá thật 100, đoán 80 thì sai 20 USD. MAE 68 USD không có nghĩa chính xác 68% hay mọi sản phẩm đều sai 68 USD.
- **MSE:** trung bình bình phương sai lệch; phạt mạnh những lần sai rất lớn.
- **R²:** so với mốc đoán trung bình của tập được chấm; `1` hoàn hảo, `0` ngang mốc, âm là tệ hơn. Không phải tỷ lệ sản phẩm đoán đúng.
- **Biểu đồ chấm:** ngang là giá đối chiếu, dọc là giá dự đoán. Gần đường chéo là tốt; trên đường là đoán cao, dưới đường là đoán thấp.
- **Vùng tin cậy:** thể hiện độ bất định của ước lượng sai số trung bình, không bảo đảm sai lệch của từng sản phẩm.

Lưu ý nhỏ: đoán trung bình **train** không nhất thiết có R² bằng 0 trên **test**, vì hai trung bình có thể khác nhau. Với MAE, trung vị cũng là một mốc hằng số đáng thử; video dùng trung bình.

## 6. Kết luận cần nhớ và giới hạn

**XGBoost đạt sai số thấp nhất trong demo này.** Nhưng Random Forest chỉ học trên 15.000 sản phẩm còn XGBoost dùng toàn bộ tập train, nên kết quả chưa chứng minh thuật toán nào luôn tốt hơn.

Chấm 200 mẫu là kiểm tra nhanh. Khi làm thực tế, cần chọn cấu hình bằng validation và giữ test để đánh giá cuối; tránh thử liên tục rồi chọn theo điểm test. Tăng số từ, số cây hoặc số dữ liệu không bảo đảm chắc chắn cải thiện.

Giá còn thay đổi theo thời điểm, người bán và tình trạng hàng. Chỉ đọc mô tả sẽ có giới hạn; MAE thấp hơn không đồng nghĩa hệ thống đã săn được món hời đáng tin cậy.

**Câu cần mang sang phần học tiếp:** “Neural network hoặc LLM có cải thiện đủ nhiều so với các mốc đơn giản này để đáng dùng hay không?”
