# Day 3 — Hiểu cách xây mô hình dự đoán giá trước khi dùng LLM

> Bản giảng đầy đủ cho 5 bài 012–016. Viết lại từ phụ đề tiếng Anh được đính kèm, theo mạch giải thích dành cho người mới; không phải bản dịch từng câu. Các ví dụ có ghi “minh họa” và các phần “giải thích bổ sung” là phần diễn giải thêm. Số liệu kết quả được lấy từ lời giảng, không phải kết quả tôi chạy lại notebook.

## 1. Cả phần này thực sự muốn dạy điều gì?

**Trước khi dùng một AI phức tạp để giải quyết công việc, hãy thử những cách đơn giản và đo xem chúng làm tốt đến đâu.**

Bài toán xuyên suốt là: **đưa vào mô tả một sản phẩm, dự đoán sản phẩm đó có giá bao nhiêu USD.**

Ví dụ minh họa: đưa vào “Tai nghe không dây, chống ồn, thời lượng pin 30 giờ”, nhận về một con số như 85 USD. Đây là **regression — bài toán hồi quy**, vì đầu ra cần dự đoán là một số. Nếu đầu ra là “tai nghe” hay “loa”, đó lại là bài toán phân loại.

Giảng viên muốn có một bộ phận ước lượng giá để sau này ghép vào hệ thống AI tìm món hời. Khi có giá ước lượng và giá đang bán, hệ thống có thêm cơ sở để phát hiện sản phẩm đáng xem xét. Nhưng 5 video này mới làm phần **dự đoán và đánh giá**, chưa xây hoàn chỉnh hệ thống săn hàng.

Trong lời nhắc đầu bài, dữ liệu đã trải qua các bước ở ngày trước: lấy dữ liệu sản phẩm Amazon qua Hugging Face, chọn lọc dữ liệu và tiền xử lý mô tả bằng GPT-OSS 20B qua Groq ở chế độ batch. Đây là bối cảnh của bài, không phải những thao tác được dạy lại trong phần này.

Điều bạn cần hiểu sau khi học:

- Tại sao phải có **baseline — mốc cơ sở** trước khi thử LLM.
- Mô hình học từ dữ liệu gì và được kiểm tra như thế nào.
- Vì sao cách biến thông tin thành con số ảnh hưởng lớn đến chất lượng dự đoán.
- Linear Regression, Random Forest và XGBoost khác nhau ở cách học ra sao.
- Vì sao một kết quả tốt trong demo chưa đủ để kết luận mô hình tốt trong thực tế.

**Bạn đang học huấn luyện mô hình ML để dự đoán giá; chưa phải tự tạo ChatGPT từ đầu, fine-tune LLM hay xây RAG.** LLM vẫn thuộc Machine Learning, nhưng trong phần này “ML truyền thống” chỉ các phương pháp như hồi quy tuyến tính và mô hình cây.

## 2. Vai trò của từng video trong mạch bài

| Bài | Nội dung chính | Câu hỏi bài đó giải quyết |
| --- | --- | --- |
| 012 | Baseline, ML truyền thống, generalization, overfitting | Tại sao cần bắt đầu đơn giản? Học tốt thực sự nghĩa là gì? |
| 013 | Nạp dữ liệu, đoán ngẫu nhiên, hàm đánh giá và biểu đồ | Làm thế nào biết một cách dự đoán tốt hay tệ? |
| 014 | Đoán giá trung bình, hồi quy tuyến tính với vài đặc trưng | Mô hình có học nhưng đầu vào nghèo thông tin thì sao? |
| 015 | Bag of Words và CountVectorizer | Làm thế nào đưa nội dung mô tả vào mô hình dưới dạng số? |
| 016 | Random Forest, XGBoost và đối chiếu kết quả | Khi đã có dữ liệu đầu vào hữu ích, mô hình mạnh hơn cải thiện được bao nhiêu? |

Hãy đọc cả phần như **một thí nghiệm được nâng cấp dần**, không phải 5 chủ đề tách rời.

## 3. Nền tảng: học từ ví dụ, rồi kiểm tra trên ví dụ mới

### Dữ liệu đầu vào và đáp án

Hãy tưởng tượng bạn đào tạo một nhân viên định giá. Bạn đưa cho họ nhiều sản phẩm kèm giá cũ để học kinh nghiệm. Sau đó, bạn đưa một sản phẩm mới, giấu giá và yêu cầu họ đoán.

Trong mô hình:

| Thuật ngữ | Nghĩa trong bài này |
| --- | --- |
| Dataset — tập dữ liệu | Nhiều sản phẩm, mỗi sản phẩm có thông tin và giá |
| Feature — đặc trưng | Thông tin đầu vào được biểu diễn thành số, như trọng lượng hoặc số lần xuất hiện một từ |
| `X` | Bảng các đặc trưng đầu vào |
| Target/label — giá trị mục tiêu/nhãn | Giá thật mà mô hình cần học dự đoán; ký hiệu `y` |
| Ground truth — giá trị đối chiếu | Giá được ghi trong dữ liệu, dùng để chấm dự đoán |
| Prediction — dự đoán | Giá mô hình đưa ra; thường ký hiệu `ŷ` |
| Training — huấn luyện | Tìm quy luật từ nhiều cặp đầu vào và giá thật |
| Inference — suy luận | Dùng mô hình đã học để dự đoán một đầu vào mới |

Giá trong dữ liệu là giá tại thời điểm thu thập. Nó không nhất thiết là giá bán hiện tại hoặc một “giá trị thật” bất biến của sản phẩm.

### Vì sao phải có train, validation và test?

Trong cấu hình dữ liệu đầy đủ mà giảng viên nạp:

| Tập dữ liệu | Số sản phẩm | Vai trò |
| --- | ---: | --- |
| Training set — tập huấn luyện | 800.000 | Cho mô hình học |
| Validation set — tập kiểm định | 10.000 | Dùng để lựa chọn cách làm và cấu hình trong một quy trình chuẩn |
| Test set — tập kiểm tra | 10.000 | Đánh giá cuối trên dữ liệu giữ riêng |

Giảng viên cũng giới thiệu chế độ nhẹ với dữ liệu huấn luyện khoảng 20.000 sản phẩm. Tuy nạp một tập test lớn, hàm đánh giá trong demo mặc định chỉ dùng **200 sản phẩm đầu tiên**.

**Generalization — khả năng khái quát hóa** là làm tốt với sản phẩm chưa từng học, nhờ nắm được quy luật có ích.

**Overfitting — quá khớp** là bám quá sát dữ liệu huấn luyện, kể cả các chi tiết ngẫu nhiên, khiến dự đoán trên dữ liệu mới kém đi. Giống học sinh thuộc lời giải của đề cũ nhưng lúng túng khi thay dữ kiện.

Giải thích bổ sung: huấn luyện lâu hơn không phải lúc nào cũng gây quá khớp, và chạy lại `fit()` không tự động đồng nghĩa với “học quá nhiều”. Rủi ro còn phụ thuộc độ phức tạp mô hình, lượng dữ liệu, nhiễu và cách kiểm soát mô hình. Cần quan sát kết quả trên validation.

## 4. Đo chất lượng: đoán sai bao nhiêu tiền?

### MAE — sai số tuyệt đối trung bình

Ví dụ minh họa:

| Sản phẩm | Giá trong dữ liệu | Giá dự đoán | Sai lệch tuyệt đối |
| --- | ---: | ---: | ---: |
| A | 100 USD | 80 USD | 20 USD |
| B | 50 USD | 70 USD | 20 USD |
| C | 200 USD | 170 USD | 30 USD |

Sai số trung bình = `(20 + 20 + 30) / 3 ≈ 23,33 USD`.

Dùng giá trị tuyệt đối để việc đoán cao và đoán thấp không triệt tiêu nhau. Chỉ số này gọi là **Mean Absolute Error — MAE**; đơn vị ở đây là USD và **càng thấp càng tốt**. Đây là cách hiểu con số “average error” được giảng viên ghi lại để so sánh.

MAE 68 USD có nghĩa là độ lệch tuyệt đối trung bình khoảng 68 USD trên các mẫu được chấm. **Không có nghĩa mọi sản phẩm đều sai đúng 68 USD, hoặc mô hình chính xác 68%.**

### MSE và R² bổ sung thông tin gì?

- **MSE — Mean Squared Error, sai số bình phương trung bình:** bình phương từng sai lệch rồi lấy trung bình. Ví dụ sai 10 USD đóng góp 100, sai 100 USD đóng góp 10.000. Vì thế chỉ số này phạt nặng các lần sai rất lớn. Đơn vị là USD².
- **R² — hệ số xác định:** so sánh tổng sai số bình phương của mô hình với cách luôn đoán giá trung bình của chính tập được đánh giá. `1` là khớp hoàn hảo; `0` là ngang mốc đó; âm là tệ hơn mốc đó, với dữ liệu mục tiêu có biến thiên.

R² không phải tỷ lệ số sản phẩm được đoán đúng. Chẳng hạn R² khoảng 41,8% trong bài 015 không có nghĩa 41,8% sản phẩm có giá dự đoán chính xác.

Giải thích bổ sung: mô hình đoán **trung bình tập train** không nhất thiết có R² bằng 0 trên **tập test**. Hai trung bình có thể khác nhau. Khi tăng số mẫu, màn hình có thể hiển thị 0 do giá trị gần 0 và làm tròn; không có quy luật cứ đủ nhiều mẫu là chắc chắn bằng 0.

### Đọc hai biểu đồ trong video

**Biểu đồ phân tán:** mỗi chấm là một sản phẩm. Trục ngang là giá trong dữ liệu; trục dọc là giá dự đoán. Đường chéo biểu diễn dự đoán bằng giá đối chiếu.

- Chấm càng gần đường chéo thì dự đoán càng tốt.
- Chấm phía trên đường chéo là đoán cao hơn giá đối chiếu.
- Chấm phía dưới là đoán thấp hơn.
- Màu xanh/vàng/đỏ trong demo minh họa mức sai lệch tăng dần; ngưỡng cụ thể nằm trong mã đánh giá.

**Biểu đồ sai số theo số mẫu:** cho thấy sai số trung bình biến động ra sao khi chấm thêm sản phẩm. Ít mẫu thường khiến kết quả dao động mạnh. Vùng xám minh họa khoảng tin cậy, thể hiện độ bất định của ước lượng sai số trung bình.

Trong lần đoán ngẫu nhiên, giảng viên mô tả kết quả khoảng 382 USD với biên khoảng ±37 USD ở mức tin cậy 95%. Đây không phải cam kết giá dự đoán của từng sản phẩm nằm trong khoảng ±37 USD. Khoảng tin cậy cũng không sửa được việc chọn mẫu thiếu đại diện.

## 5. Bước đầu: hai cách dự đoán không đọc sản phẩm

### Random Pricer — đoán ngẫu nhiên

Hàm nhận một sản phẩm, bỏ qua thông tin của nó và trả về số ngẫu nhiên từ 1 đến 999.

Tai nghe, áo khoác hay máy in đều bị xử lý như nhau. Cách này chưa học quan hệ nào giữa thông tin sản phẩm và giá.

**Mục đích:** thử bộ khung đánh giá và tạo mốc rất thô để nhìn thấy sự cải thiện ở các bước sau. Kết quả được ghi trong bài: **382,08 USD** sai số trung bình. Vì có ngẫu nhiên, chạy lại có thể ra số khác.

### Constant Pricer — luôn đoán một giá cố định

Lấy giá trung bình của các sản phẩm trong tập train, khoảng **140,56 USD**, rồi dự đoán giá đó cho mọi sản phẩm.

Bạn có thể thấy lạ: “Không nhìn sản phẩm thì tốt hơn ở đâu?” Vì giá ngẫu nhiên có thể liên tục rơi vào vùng quá cao, còn một giá đại diện cho dữ liệu thường hợp lý hơn. Trong demo, sai số giảm xuống **106,18 USD**.

Trên biểu đồ, mọi chấm nằm trên một đường ngang, bởi giá dự đoán không thay đổi.

**Bài học:** một cách làm rất đơn giản vẫn là đối thủ đáng so sánh. Nếu mô hình phức tạp thua mốc này, cần xem lại dữ liệu và phương pháp trước khi dùng nó.

Giải thích bổ sung: trung bình là lựa chọn tối ưu cho dự đoán hằng số khi tối thiểu hóa tổng sai số bình phương trên dữ liệu dùng để chọn hằng số. Nếu mục tiêu là sai số tuyệt đối, **trung vị — median** là một mốc hằng số đáng thử. Video dùng trung bình; không nên suy ra đây là hằng số tốt nhất cho mọi chỉ số.

## 6. Linear Regression — hồi quy tuyến tính: bắt đầu học từ đặc trưng

Giảng viên thử ba đặc trưng:

1. Trọng lượng sản phẩm, đã quy về pound trong dữ liệu.
2. Cờ cho biết trọng lượng có bị thiếu hay không.
3. Độ dài phần mô tả tóm tắt, tính theo số ký tự.

Cách mô hình hoạt động có thể viết đơn giản:

`Giá dự đoán = b + a × trọng lượng + c × cờ thiếu trọng lượng + d × độ dài mô tả`

Trong đó `a`, `c`, `d` là các hệ số mô hình học, còn `b` là **intercept — hệ số chặn**. Người lập trình chọn loại thông tin đưa vào; quá trình huấn luyện tìm các hệ số phù hợp với dữ liệu.

Ví dụ minh họa, không phải công thức lấy từ video:

`Giá = 30 + 5 × trọng lượng + 0,1 × độ dài mô tả`

Với trọng lượng 2 pound và mô tả 100 ký tự, mô hình cho `30 + 10 + 10 = 50 USD`.

### Hai chữ “weight” dễ nhầm

- **Item weight:** trọng lượng vật lý của sản phẩm.
- **Model weight/coefficient:** trọng số/hệ số nhân trong công thức mô hình.

Cùng một từ tiếng Anh nhưng chỉ hai thứ khác nhau.

### Vì sao cần cờ thiếu trọng lượng?

Trong quy ước dữ liệu của bài, số 0 có thể đại diện cho việc không biết trọng lượng. Nếu chỉ đưa số 0, mô hình không có chỉ dấu riêng về việc thiếu thông tin. Thêm cờ `1 = thiếu`, `0 = có` giúp mô hình điều chỉnh dự đoán cho nhóm thiếu trọng lượng.

Đây là **feature engineering — thiết kế đặc trưng**: biến dữ liệu sẵn có thành đầu vào giúp mô hình học tốt hơn.

### Tại sao kết quả chỉ nhích lên một chút?

Sai số giảm từ **106,18 xuống 101,56 USD**. Mô hình đã dùng thông tin sản phẩm, nhưng trọng lượng và độ dài mô tả chưa giải thích giá tốt.

Hãy tưởng tượng so sánh một chiếc nhẫn và một bao cát: nặng hơn không có nghĩa đắt hơn. Một sản phẩm rẻ cũng có thể được viết mô tả dài.

**Bài học quan trọng nhất ở đây: thuật toán tốt không thể bù hoàn toàn cho đầu vào thiếu thông tin liên quan.**

Giải thích bổ sung: độ lớn của hệ số không tự động là thước đo “đặc trưng nào quan trọng nhất”, vì các đặc trưng khác đơn vị và thang đo. Các mô hình sâu có thể tự học nhiều biểu diễn, nhưng việc chọn, làm sạch và tổ chức dữ liệu vẫn cần thiết.

## 7. Bag of Words — túi từ: cho mô hình tiếp cận nội dung mô tả

### Ý tưởng dễ hiểu nhất

Thay vì chỉ đếm mô tả dài bao nhiêu ký tự, hãy xem **trong đó có những từ gì**.

Một mô tả có “luxury”, “budget”, “TV” hoặc “jacket” có thể chứa dấu hiệu liên quan đến loại sản phẩm và giá. Ta biến những dấu hiệu đó thành số bằng cách đếm từ.

Ví dụ minh họa, chọn từ vựng theo thứ tự: `budget`, `luxury`, `tv`.

| Mô tả | budget | luxury | tv | Vector số |
| --- | ---: | ---: | ---: | --- |
| budget tv | 1 | 0 | 1 | `[1, 0, 1]` |
| luxury tv | 0 | 1 | 1 | `[0, 1, 1]` |
| tv tv | 0 | 0 | 2 | `[0, 0, 2]` |

**Vector ở đây đơn giản là một dãy số theo thứ tự cố định.** Mỗi vị trí ứng với một từ; giá trị tại vị trí đó là số lần từ xuất hiện.

Bag of Words gọi là “túi từ” vì biểu diễn cơ bản này quan tâm từ và số lần xuất hiện, không giữ thứ tự câu. Nó cũng không tự hiểu nghĩa như con người: từ “luxury” không đảm bảo sản phẩm đắt, mà chỉ có thể là một dấu hiệu mô hình học được từ dữ liệu.

### CountVectorizer làm gì?

**CountVectorizer** là công cụ trong scikit-learn tạo biểu diễn đếm từ. Trong demo, giảng viên dùng tối đa **2.000 đặc trưng từ vựng**, đồng thời lọc stop words tiếng Anh — những từ phổ biến thuộc danh sách loại bỏ.

Quy trình:

1. Đọc các mô tả tóm tắt trong tập train.
2. Sau xử lý và lọc từ, chọn các từ phổ biến theo cấu hình; trong demo tìm được đủ 2.000 từ.
3. Cố định mỗi từ vào một cột.
4. Biến từng mô tả thành 2.000 số đếm.
5. Cho hồi quy tuyến tính học quan hệ giữa các số đếm này và giá.

Không phải **2.000 từ trong mỗi sản phẩm**, không phải **2.000 sản phẩm**, cũng không phải **2.000 token context của LLM**. Đó là số cột đặc trưng dùng chung cho các sản phẩm.

Phần lớn số đếm bằng 0 vì một mô tả chỉ chứa một phần nhỏ từ vựng. Công cụ biểu diễn dữ liệu dưới dạng **sparse matrix — ma trận thưa**, tránh lưu tất cả số 0 theo cách tốn bộ nhớ.

### Vì sao phải dùng cùng một bộ từ vựng khi dự đoán?

Nếu khi huấn luyện cột số 1 là “budget”, khi dự đoán nó vẫn phải là “budget”. Nếu tự tạo bộ từ vựng khác cho dữ liệu mới, các cột có thể đổi nghĩa và mô hình nhận sai đầu vào.

Vì vậy:

- `fit_transform(train_documents)`: học từ vựng từ train rồi chuyển train thành bảng số.
- `transform(new_documents)`: dùng nguyên từ vựng đã học để chuyển mô tả mới thành bảng số.

Từ mới nằm ngoài từ vựng không có cột riêng trong biểu diễn này. Không học lại từ vựng trên test, vì như vậy dữ liệu kiểm tra đã ảnh hưởng vào bước chuẩn bị mô hình.

### Bag of Words có phải embedding trong RAG không?

| Điểm so sánh | Bag of Words trong bài | Semantic embedding — embedding ngữ nghĩa |
| --- | --- | --- |
| Mỗi vị trí biểu diễn gì? | Một từ cụ thể và số lần xuất hiện | Một tọa độ của biểu diễn do mô hình học |
| Từ khác nhau nhưng gần nghĩa | Không tự được xem là gần nghĩa chỉ vì nghĩa tương tự | Có thể được biểu diễn gần nhau, tùy mô hình |
| Dữ liệu số | Thường nhiều số 0 | Thường là vector số thực dày đặc |
| Mục đích ở ngữ cảnh này | Đặc trưng để dự đoán giá | Có thể dùng tìm kiếm ngữ nghĩa, trong đó có truy xuất cho RAG |

Cả hai đều biến văn bản thành số, nhưng không phải cùng một cách biểu diễn. Bài này không cần vector database và không truy xuất tài liệu để trả lời câu hỏi.

### Kết quả nói lên điều gì?

Vẫn dùng **Linear Regression**, nhưng chuyển sang đặc trưng đếm từ, sai số xuống **76,81 USD**, R² trong demo khoảng **41,8%**.

So với 101,56 USD trước đó, đây là cải thiện rõ. **Thay thông tin đầu vào đã giúp nhiều hơn bước chuyển từ đoán trung bình sang hồi quy với vài đặc trưng nghèo thông tin.**

## 8. Random Forest — rừng ngẫu nhiên: kết hợp nhiều cây dự đoán

### Hiểu một Decision Tree — cây quyết định trước

Tưởng tượng một chuỗi câu hỏi minh họa:

- Mô tả có nhắc đến TV không?
- Nếu có, có nhắc đến OLED không?
- Nếu không phải TV, có nhắc đến tai nghe không?

Theo câu trả lời, sản phẩm đi xuống các nhánh và đến một nút đưa ra dự đoán giá.

Điểm khác với tự viết `if/else`: **mô hình học từ dữ liệu để chọn điều kiện chia nhánh**, chứ không phải người lập trình viết hết các luật. Vì vậy, cây quyết định được huấn luyện vẫn là ML.

Một cây có thể quá bám vào những sản phẩm đã học. Random Forest kết hợp nhiều cây để giảm phụ thuộc vào một cây riêng lẻ.

### Hãy hình dung nhiều người định giá độc lập

Mỗi người có một góc nhìn hơi khác nhau. Một người đoán 80 USD, người khác 100 USD, người nữa 90 USD. Lấy trung bình được 90 USD.

Đó là hình ảnh đơn giản của **ensemble — mô hình tổ hợp**. Với hồi quy, Random Forest kết hợp dự đoán của các cây bằng cách lấy trung bình. Tính ngẫu nhiên thường đến từ việc lấy mẫu huấn luyện cho mỗi cây và lựa chọn đặc trưng ứng viên khi chia nhánh, tùy cấu hình.

Trong demo:

- Tiếp tục dùng đặc trưng văn bản đã tạo.
- Dùng **100 cây**.
- Chỉ huấn luyện trên **15.000 sản phẩm** để giảm thời gian tính toán.
- Sai số đạt **72,28 USD**.

Random Forest khác hoàn toàn Random Pricer. Một bên dùng sự ngẫu nhiên trong quá trình xây các mô hình có học; bên kia bỏ qua thông tin và đoán giá bừa.

## 9. XGBoost: thêm cây để sửa những gì mô hình hiện tại làm chưa tốt

XGBoost trong thí nghiệm này cũng kết hợp nhiều cây, nhưng theo cách khác Random Forest.

| Random Forest | XGBoost trong bài |
| --- | --- |
| Các cây được huấn luyện tương đối độc lập | Các cây được thêm theo từng bước |
| Kết hợp nhiều góc nhìn bằng trung bình dự đoán | Cây mới góp phần giảm lỗi của mô hình hiện có |
| Liên hệ với bagging | Liên hệ với gradient boosting |

Ví dụ minh họa trực giác, không phải phép tính chính xác của thư viện:

- Dự đoán ban đầu: 100 USD.
- Một bước học bổ sung điều chỉnh thêm 20 USD.
- Bước tiếp theo điều chỉnh bớt 5 USD.
- Dự đoán kết hợp: 115 USD.

Với **gradient boosting — tăng cường theo gradient**, quá trình thêm cây dựa trên thông tin từ hàm mất mát để cải thiện dự đoán. Bạn chưa cần hiểu công thức gradient để nắm mục tiêu: **mỗi bước cố giảm phần lỗi còn lại**.

Trong demo, giảng viên cấu hình **1.000 estimators**, dùng toàn bộ tập huấn luyện và `n_jobs=4`; thời gian được báo là khoảng **15 giây**. Sai số đạt **68,23 USD**, thấp nhất trong những lần chạy được trình bày.

Lưu ý: XGBoost là một thư viện riêng có giao diện tương thích phong cách scikit-learn, không phải lớp mô hình được import trực tiếp từ `sklearn`.

Giải thích bổ sung: 15 giây là kết quả trên môi trường và cấu hình trong video. Không thể cam kết máy khác cũng nhanh như vậy. XGBoost cũng không luôn nhanh hơn hoặc chính xác hơn Random Forest trên mọi bài toán.

## 10. Toàn bộ kết quả và cách kết luận đúng

| Phương pháp | Thông tin được sử dụng | Sai số trung bình trong demo |
| --- | --- | ---: |
| Random Pricer | Không dùng thông tin sản phẩm | 382,08 USD |
| Constant Pricer | Giá trung bình tập train | 106,18 USD |
| Linear Regression với đặc trưng đơn giản | Trọng lượng, cờ thiếu trọng lượng, độ dài mô tả | 101,56 USD |
| Linear Regression + Bag of Words | Các số đếm từ trong mô tả | 76,81 USD |
| Random Forest | Đặc trưng đếm từ; huấn luyện trên 15.000 sản phẩm | 72,28 USD |
| XGBoost | Đặc trưng đếm từ; dùng toàn bộ tập train | 68,23 USD |

Các số trên là kết quả được giảng viên ghi cho demo; hàm đánh giá mặc định chấm 200 sản phẩm. Trong bài 014, giảng viên thử tăng lên 1.000 và 2.000 mẫu rồi quay lại cấu hình mặc định để ghi mốc so sánh.

**Có thể kết luận:** trong các lần thử này, XGBoost cho MAE thấp nhất; đặc trưng đếm từ hữu ích hơn rõ rệt so với chỉ trọng lượng và độ dài văn bản.

**Chưa thể kết luận:** XGBoost luôn tốt nhất, Random Forest chắc chắn thắng nếu tăng dữ liệu, hoặc kết quả này đại diện cho tất cả sản phẩm ngoài thực tế.

Những điểm cần hiểu thêm:

1. **Số lượng dữ liệu huấn luyện khác nhau.** Random Forest dùng 15.000 sản phẩm, XGBoost dùng toàn bộ tập train. Đây là so sánh các cấu hình thực nghiệm, chưa cô lập tác động riêng của thuật toán.
2. **200 mẫu là phép kiểm tra nhanh.** Nếu dữ liệu có thứ tự hoặc phân bố lệch, 200 mẫu đầu có thể không đại diện tốt. Đánh giá nghiêm túc cần mẫu phù hợp và xem sai số theo nhóm giá, loại sản phẩm.
3. **Đừng chọn mô hình liên tục dựa vào test.** Quy trình chặt chẽ nên chọn cấu hình trên validation, sau đó chấm test khi đã chốt. Demo giúp học cách so sánh nhưng không nên biến test thành nơi thử đi thử lại để tối ưu.
4. **Nhiều cây, nhiều từ hay nhiều dữ liệu không bảo đảm tốt hơn.** Chúng có thể tăng thời gian, bộ nhớ và đôi khi không cải thiện chất lượng. Lời dự đoán rằng Random Forest sẽ thắng khi chạy toàn bộ dữ liệu là kỳ vọng của giảng viên, chưa phải kết quả đã đo trong bài.
5. **Giá có biến động và đầu vào có thể thiếu thông tin.** Cùng mô tả nhưng khác thời điểm, người bán hoặc tình trạng hàng có thể khác giá. Điều này hạn chế mức chính xác đạt được từ mô tả đơn thuần.

Ngoài ra, MAE và MSE nhấn mạnh sai số theo cách khác nhau, nên một mô hình MAE tốt hơn vẫn có thể có MSE hoặc R² kém hơn. Không có một chỉ số duy nhất kể hết câu chuyện.

## 11. Đọc code bằng ba động tác: tạo, học, dự đoán

Trong scikit-learn, phần lớn mô hình ở đây có mẫu sử dụng tương tự:

```python
model = LinearRegression()          # Tạo mô hình
model.fit(X_train, y_train)          # Học từ đầu vào và giá đã biết
predictions = model.predict(X_new)   # Dự đoán cho đầu vào mới
```

- `fit()` không phải là hỏi mô hình giá của một sản phẩm; nó là bước huấn luyện.
- `predict()` dùng kết quả đã học; không cần cung cấp giá thật của sản phẩm mới.
- DataFrame của pandas giống một bảng gồm hàng và cột, giúp tổ chức các đặc trưng.
- `evaluate(pricer, test)` nhận một hàm dự đoán, gọi nó cho nhiều sản phẩm rồi đối chiếu với giá trong test. Với nền tảng JavaScript, có thể liên hệ `pricer` với một callback được truyền vào hàm chấm điểm.

Hàm đánh giá trong video mặc định dùng 5 worker để chạy các lần dự đoán song song; có thể giảm `workers` hoặc `size` nếu cần. Đây là cấu hình của **bộ đánh giá**, khác với số cây của mô hình và khác với `n_jobs` trong huấn luyện.

### Ví dụ bổ sung: nối CountVectorizer với Linear Regression

Đây là đoạn minh họa độc lập, không chép nguyên notebook. Dữ liệu nhỏ chỉ để hiểu luồng xử lý, không đủ tạo mô hình định giá đáng tin cậy.

```python
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import make_pipeline

train_descriptions = [
    "budget wired headphones",
    "wireless headphones noise cancelling",
    "small led television",
    "large oled television",
]
train_prices = [20, 100, 180, 900]

model = make_pipeline(
    CountVectorizer(max_features=2000, stop_words="english"),
    LinearRegression(),
)

# Học bộ từ vựng từ train, biến văn bản thành số và học dự đoán giá.
model.fit(train_descriptions, train_prices)

# Dùng lại bộ từ vựng đã học; không tạo bộ từ vựng mới.
price = model.predict(["wireless noise cancelling headphones"])[0]
print(round(float(price), 2))
```

**Pipeline — chuỗi bước xử lý** gói việc chuyển văn bản thành số và dự đoán vào cùng một đối tượng. Với 4 mô tả này, bộ từ vựng nhỏ hơn 2.000; `max_features=2000` là giới hạn tối đa.

Đoạn code chỉ minh họa `fit` và `predict`, chưa có đánh giá chất lượng. Hồi quy tuyến tính cũng có thể dự đoán giá âm trên một số đầu vào; đó là một giới hạn cần xử lý khi thiết kế hệ thống thực tế, không phải giá có ý nghĩa kinh doanh.

## 12. Bạn cần nhớ gì để học tiếp?

Hãy tự trả lời những câu sau:

1. **Tại sao không dùng LLM ngay?** Vì cần biết giải pháp đơn giản đạt mức nào để đánh giá giá trị cải thiện của giải pháp phức tạp.
2. **Tại sao hồi quy tuyến tính lần đầu kém?** Vì vài đặc trưng được chọn chưa chứa đủ dấu hiệu liên quan đến giá.
3. **Bag of Words thay đổi điều gì?** Biến nội dung mô tả thành các cột số đếm từ để mô hình sử dụng.
4. **Random Forest khác XGBoost ở ý chính nào?** Kết hợp các cây tương đối độc lập, so với thêm cây theo từng bước để giảm lỗi của mô hình hiện có.
5. **Học tốt có nghĩa gì?** Dự đoán tốt trên dữ liệu mới, không chỉ khớp dữ liệu đã học.
6. **Phần sau sẽ làm gì?** Theo lời kết của giảng viên, thử neural network và các LLM để xem chúng cải thiện được bao nhiêu so với các mốc vừa xây.

Bạn chưa cần tự viết thuật toán cây hay thuộc công thức tối ưu. Trước hết hãy hiểu rõ **đầu vào là gì, đáp án là gì, mô hình học điều gì và mình đo chất lượng bằng cách nào**.

## Nguồn bài học

Tài liệu dựa trên nội dung đầy đủ của 5 phụ đề tiếng Anh đính kèm, tổng thời lượng khoảng 51 phút; không xác minh lại notebook hay chạy lại mô hình:

- **012 — Building Baseline Models with Traditional ML and XGBoost**: mục tiêu, bối cảnh và nền tảng ML.
- **013 — Building Your First Baseline with Random Pricer and Scikit-learn**: dữ liệu, bộ đánh giá, biểu đồ và mốc ngẫu nhiên.
- **014 — Baseline Models and Linear Regression with Scikit-Learn**: mốc trung bình và hồi quy với đặc trưng thủ công.
- **015 — Bag of Words and CountVectorizer for Linear Regression NLP**: đếm từ, vector hóa và hồi quy trên văn bản.
- **016 — Random Forest and XGBoost Ensemble Models in Scikit-Learn**: mô hình tổ hợp và kết quả đối chiếu.
