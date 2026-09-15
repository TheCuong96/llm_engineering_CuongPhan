# Tuần 6 · Ngày 1 — Chuẩn bị dữ liệu để AI học dự đoán giá

> **Thông điệp chính:** Muốn AI định giá tốt, trước hết phải chuẩn bị những ví dụ học có chất lượng và một cách kiểm tra công bằng. Sáu bài này xây dựng nền tảng đó; chưa thực hiện fine-tuning.

Tài liệu giảng lại nội dung bài 001–006 bằng tiếng Việt, dựa trên toàn bộ phụ đề tiếng Anh đính kèm. Riêng công thức lấy mẫu được đối chiếu thêm với màn hình video 006 tại khoảng 00:45. Video MP4 bài 001 không truy cập được; phần bài 001 dựa trên phụ đề. Các ví dụ cửa hàng và số liệu nhỏ dùng để giải thích là ví dụ bổ sung, không phải kết quả thí nghiệm của giảng viên. Số liệu lớn được ghi theo bài giảng, nhiều số đã được làm tròn.

## 1. Rốt cuộc cả phần này muốn dạy điều gì?

Hãy tưởng tượng bạn mở một cửa hàng và muốn đào tạo một nhân viên mới: **chỉ đọc mô tả sản phẩm rồi ước lượng giá**.

Bạn đưa cho người đó nhiều phiếu mẫu. Mỗi phiếu có mô tả ở mặt trước, giá đã biết ở mặt sau. Sau khi học, người đó phải định giá một sản phẩm chưa từng xuất hiện trong các phiếu.

Để việc đào tạo có ý nghĩa, bạn cần giải quyết những câu hỏi sau:

1. Lấy phiếu mẫu ở đâu?
2. Phiếu không ghi giá có dùng làm bài học được không?
3. Nếu phần lớn phiếu đều là phụ tùng ô tô giá rẻ, người học có đủ kinh nghiệm định giá đồ điện tử đắt tiền không?
4. Nếu đề thi trùng với phiếu đã học, điểm cao có chứng minh năng lực không?
5. Làm sao lưu bộ phiếu để hôm sau tiếp tục sử dụng?

Đó chính là mạch nội dung của sáu video. Thay “nhân viên” bằng “mô hình AI”, thay “phiếu mẫu” bằng “bản ghi dữ liệu”, bạn sẽ hiểu tại sao giảng viên dành cả ngày cho dữ liệu.

| Bài | Nội dung trên video | Mục đích thật sự | Điều cần hiểu sau khi học |
|---|---|---|---|
| 001 | Training, Datasets, Generalization | Xác định học máy đang cố đạt điều gì | Mô hình cần làm tốt trên dữ liệu mới |
| 002 | Fine-tuning và The Price Is Right | Giới thiệu bài toán xuyên suốt ba tuần | Dùng mô hình có sẵn, huấn luyện thêm để dự đoán giá |
| 003 | Nguồn dữ liệu và chia tập | Chuẩn bị nguyên liệu và cách đánh giá | Phân biệt train, validation, test; đo sai số giá |
| 004 | Đọc và làm sạch dữ liệu Amazon | Biến dữ liệu thô thành ví dụ học dùng được | Giữ mô tả và giá hợp lệ trong phạm vi đã chọn |
| 005 | Khảo sát phân bố, loại trùng | Phát hiện dữ liệu lệch và kiểm tra không công bằng | Loại trùng trước khi chia tập; biết dữ liệu đang thiên về đâu |
| 006 | Lấy mẫu có trọng số, lưu lên Hub | Tạo bộ dữ liệu phù hợp để dùng tiếp | Hiểu cách ưu tiên mẫu, chia tập và lưu Full/Lite |

**Đầu ra ngày hôm nay là một bộ dữ liệu đã tuyển chọn, chưa phải một AI định giá đã được huấn luyện.**

## 2. Bài 001 — Training và Generalization

### Training — Huấn luyện là gì?

Một mô hình có các giá trị số bên trong gọi là **parameters — tham số**. Bạn có thể hình dung chúng như rất nhiều núm điều chỉnh ảnh hưởng đến câu trả lời.

Trong bài toán này, mô hình được học từ các cặp:

| Input — Đầu vào | Target/Label — Đáp án mục tiêu |
|---|---:|
| Mô tả một ấm đun nước cơ bản | 20 USD |
| Mô tả một ấm có chỉnh nhiệt độ, giữ ấm | 45 USD |
| Mô tả một ấm cao cấp có các đặc điểm khác | 80 USD |

Các giá trên chỉ để minh họa. Trong quá trình huấn luyện, hệ thống dùng ví dụ và mức độ dự đoán sai để điều chỉnh các tham số. Cơ chế cập nhật cụ thể được để lại cho bài sau.

**Dataset — Bộ dữ liệu** là tập hợp các ví dụ như vậy. Một dòng là một sản phẩm; các cột lưu mô tả, giá, danh mục và thông tin liên quan.

### Generalization — Khả năng khái quát hóa

Sau khi học, bạn đưa một mẫu ấm mới mà nhân viên chưa từng xem. Nếu người đó suy luận hợp lý từ đặc điểm sản phẩm, họ đã học được điều có thể áp dụng sang trường hợp mới.

Đó là ý nghĩa của generalization: **làm tốt trên dữ liệu chưa được dùng để huấn luyện**, trong phạm vi có liên quan đến những gì đã học.

Phân biệt hai tình huống:

- Nhớ một mô tả cụ thể đi kèm giá 45 USD rồi trả lại đúng giá đó: có thể chỉ là ghi nhớ.
- Ước lượng hợp lý cho mô tả mới: bằng chứng hữu ích hơn về khả năng khái quát hóa.

**Overfitting — Học quá khớp** là khi mô hình bám quá sát dữ liệu học, kể cả những chi tiết không áp dụng tốt sang dữ liệu mới. Tương tự một học sinh thuộc lời giải nhưng lúng túng khi đề đổi.

Lưu ý bổ sung: mô hình học tốt trên sản phẩm gia dụng không mặc nhiên định giá tốt bất động sản. “Khái quát hóa” không có nghĩa là giỏi mọi bài toán.

## 3. Bài 002 — Fine-tuning và dự án The Price Is Right

### Dự án đang xây dựng cái gì?

**The Price Is Right — Ước lượng giá sản phẩm** nhận mô tả sản phẩm và trả về một con số dự đoán giá.

Ví dụ minh họa: “Màn hình 27 inch, độ phân giải 4K, có USB-C” là đầu vào. “Khoảng 300 USD” là dạng đầu ra cần có. Con số minh họa này không phải báo giá thực tế.

Bài toán dự đoán một đại lượng số như giá được gọi là **regression — hồi quy**. Các đặc điểm có thể giúp dự đoán, như kích thước màn hình hoặc tính năng, gọi là **features — đặc trưng**.

Giảng viên chọn bài toán này vì:

- Có dữ liệu mô tả đi cùng giá, nên có ví dụ để học và đáp án để so sánh.
- Sai lệch giữa giá dự đoán và giá trong dữ liệu dễ hiểu hơn việc chấm “một bài văn có hay không”.
- Có thể so sánh học máy truyền thống, mạng nơ-ron và LLM trên cùng một nhiệm vụ.
- LLM có thể khai thác thông tin trong ngôn ngữ mô tả, chẳng hạn tính năng và định vị sản phẩm.

**Baseline — Mốc so sánh ban đầu** là lời giải cơ bản để biết một giải pháp phức tạp có cải thiện thật không. Chẳng hạn, mô hình đơn giản dựa vào đặc trưng sản phẩm sẽ là một đối thủ so sánh của LLM. Sáu bài này mới giới thiệu kế hoạch đó, chưa có kết quả để kết luận LLM thắng.

### Fine-tuning — Tinh chỉnh mô hình là gì?

Hãy hình dung bạn tuyển một người đã biết đọc và có kiến thức chung, rồi đào tạo thêm về định giá. Bạn không phải dạy họ lại từ đầu cách đọc từng chữ.

Tương tự, fine-tuning bắt đầu từ **pre-trained model — mô hình đã được huấn luyện trước**, sau đó huấn luyện thêm bằng dữ liệu phục vụ nhiệm vụ cụ thể. Cách tận dụng kiến thức đã học để làm nhiệm vụ mới liên quan đến **transfer learning — học chuyển giao**.

| Cách làm | Ví dụ với nhân viên định giá | Có cập nhật tham số qua bước huấn luyện này không? |
|---|---|---|
| Prompting — Hướng dẫn bằng lời | Dặn cách định giá hoặc cho vài ví dụ ngay trong yêu cầu | Không |
| RAG — Truy xuất tăng cường sinh | Tìm tài liệu liên quan và đưa cho nhân viên đọc trước khi trả lời | Không, trong quy trình RAG thông thường |
| Tool calling — Gọi công cụ | Cho phép tra cứu hoặc dùng máy tính thông qua hệ thống | Không, chỉ việc gọi công cụ không phải huấn luyện |
| Fine-tuning — Tinh chỉnh | Tổ chức đợt đào tạo thêm từ nhiều ví dụ | Có cập nhật tham số được huấn luyện, tùy phương pháp |
| Training from scratch — Huấn luyện từ đầu | Xây dựng năng lực mô hình từ điểm khởi tạo ban đầu | Có, với phạm vi và nguồn lực thường lớn hơn nhiều |

**Vì vậy, dự án này là xây dựng ứng dụng AI và tinh chỉnh mô hình có sẵn cho nhiệm vụ định giá; không phải tự huấn luyện một mô hình như ChatGPT từ đầu.**

Bổ sung: fine-tuning không bảo đảm mọi năng lực cũ đều được giữ nguyên hoặc mô hình chắc chắn tốt hơn. Điều đó cần được đánh giá; bản thân giảng viên cũng báo trước rằng kết quả của giai đoạn fine-tuning đầu tiên sẽ không hoàn toàn như mong đợi.

### Ngày 1 nằm ở đâu trong kế hoạch lớn?

| Giai đoạn giảng viên giới thiệu | Công việc |
|---|---|
| Tuần 6, ngày 1 — phần hiện tại | Tuyển chọn dữ liệu |
| Ngày 2 | Tiền xử lý mô tả bằng LLM, giới thiệu xử lý API theo lô |
| Ngày 3 | Xây dựng mốc so sánh bằng học máy truyền thống |
| Ngày 4 | Mạng nơ-ron và đánh giá LLM |
| Ngày 5 | Fine-tuning một mô hình qua API |
| Tuần 7 | Fine-tuning mô hình nguồn mở theo cách gọi của khóa học |
| Tuần 8 | Triển khai và kết hợp thành sản phẩm agent, có sử dụng lại RAG |

Agent tìm món hời là **đích đến được giới thiệu**, chưa được xây dựng trong sáu bài này. Giá học từ dữ liệu lịch sử cũng không phải sự bảo đảm về giá thị trường hiện tại hoặc “giá trị thật” của món hàng.

Giảng viên đưa ra ba mức tham gia: học để hiểu ý tưởng, làm bản Lite, hoặc làm đầy đủ. Các chi phí và thời gian chạy được nêu trong video là ước lượng tại thời điểm quay, không phải cam kết hiện tại. Để hiểu bài, bạn không cần tự tải và xử lý hàng triệu sản phẩm.

## 4. Bài 003 — Chọn dữ liệu và chuẩn bị cách chấm điểm

### Dữ liệu có thể đến từ đâu?

Bài giảng nêu dữ liệu riêng của doanh nghiệp, các bộ dữ liệu trên Kaggle/Hugging Face, dữ liệu tổng hợp và đơn vị cung cấp dữ liệu.

**Synthetic data — Dữ liệu tổng hợp** là ví dụ được tạo ra thay vì thu thập trực tiếp từ quan sát thực tế. Ví dụ, AI tạo thêm mô tả sản phẩm. Bổ sung: dữ liệu được tạo không tự động có giá đúng; chất lượng nhãn vẫn phải được kiểm soát.

Trong dự án, nguồn được chọn là **Amazon Reviews 2023** của McAuley Lab, được truy cập qua Hugging Face. Dù tên chứa “Reviews”, phần này dùng **thông tin sản phẩm, mô tả và giá**, không dùng đánh giá khách hàng làm đầu vào chính.

Hugging Face trong bài có hai vai trò: nơi lấy bộ dữ liệu và nơi lưu bộ dữ liệu đã xử lý để dùng lại.

### Vì sao phải quan tâm chất lượng dữ liệu?

Nếu nhân viên chỉ được học từ phiếu sai giá, thiếu thông tin hoặc lặp đi lặp lại một loại hàng, cách tổ chức buổi học tốt đến đâu cũng khó khắc phục hoàn toàn.

**Data curation — Tuyển chọn dữ liệu** gồm xem xét, làm sạch, lọc, tổ chức và chọn các ví dụ phù hợp mục tiêu. Nó rộng hơn việc chỉ xóa ký tự thừa.

Giảng viên cho biết trong các thử nghiệm của mình, thay đổi cách tuyển chọn dữ liệu có tác động lớn hơn nhiều thay đổi cấu hình huấn luyện. Đây là kinh nghiệm của dự án được kể lại, không phải quy luật đảm bảo cho mọi bài toán.

### Đo dự đoán giá sai bao nhiêu

Giảng viên phân biệt **model-centric metrics — chỉ số gần với hoạt động của mô hình** và **business-centric metrics — chỉ số gần với mục tiêu kinh doanh**. Trong dự án, sai số giá là một cầu nối dễ hiểu giữa hai phía.

Ví dụ bổ sung:

| Sản phẩm | Giá trong dữ liệu | Giá dự đoán | Sai số tuyệt đối |
|---|---:|---:|---:|
| A | 100 USD | 120 USD | 20 USD |
| B | 50 USD | 40 USD | 10 USD |
| C | 200 USD | 170 USD | 30 USD |

**Absolute error — Sai số tuyệt đối** = độ lớn của chênh lệch, bỏ dấu âm/dương.

**MAE — Mean Absolute Error — Sai số tuyệt đối trung bình** = (20 + 10 + 30) / 3 = **20 USD**. Bạn hiểu ngay: trên ba ví dụ, dự đoán lệch trung bình 20 USD.

**MSE — Mean Squared Error — Sai số bình phương trung bình** = (20² + 10² + 30²) / 3 ≈ **466,67 USD²**. Việc bình phương làm lỗi lớn bị tính nặng hơn, nhưng con số khó diễn giải bằng tiền hơn MAE.

Bài giảng còn nhắc **cross-entropy loss — hàm mất mát entropy chéo**, thường liên quan đến dự đoán token của LLM, và để phần giải thích sâu cho sau. Đừng đồng nhất chỉ số này với sai số giá tính bằng USD.

Bổ sung: MAE thấp hơn trên cùng bộ kiểm tra thường tốt hơn cho tiêu chí này, nhưng chưa đủ để khẳng định sản phẩm kinh doanh tốt hơn. Sai 20 USD với món 30 USD rất khác sai 20 USD với món 900 USD; khi triển khai nên xem thêm theo nhóm giá và loại hàng.

### Train, validation, test — Ba bộ dùng vào ba việc

| Bộ dữ liệu | Ví dụ trường học | Vai trò |
|---|---|---|
| Training set — Tập huấn luyện | Bài tập có đáp án để học | Dùng trực tiếp để cập nhật tham số |
| Validation set — Tập thẩm định | Bài thi thử để lựa chọn cách học | So sánh cấu hình, chọn phiên bản hoặc thời điểm dừng |
| Test set — Tập kiểm tra cuối | Đề thi cuối được cất riêng | Đánh giá sau khi đã chốt các lựa chọn |

Validation và test là **held-out data — dữ liệu được giữ riêng** khỏi bước cập nhật tham số.

Tại sao không dùng một bộ kiểm tra duy nhất? Vì nếu thử nhiều cách và luôn chọn cách có điểm tốt nhất trên validation, quyết định của bạn đã chịu ảnh hưởng từ bộ đó. Cần một bộ test còn nguyên để đánh giá cuối cùng.

Không có tỷ lệ 80/10/10 bắt buộc cho mọi dự án. Điều quan trọng là mỗi bộ đủ phù hợp với vai trò của nó. Số lượng cụ thể trong khóa học nằm ở phần 7.

## 5. Bài 004 — Biến dữ liệu Amazon thành ví dụ học dùng được

### Bước 1: Đọc thử một danh mục

Giảng viên bắt đầu với Appliances — thiết bị gia dụng, khoảng **94.000 bản ghi**. Khi mở một vài dòng đầu tiên, nhiều sản phẩm không có giá. Một dòng có giá được dùng làm ví dụ là bộ linh kiện rack roller and stud assembly kit, giá **8,99 USD** trong dữ liệu.

Tại sao mở từng dòng thay vì huấn luyện ngay? Vì bạn cần biết “nguyên liệu” có thật sự chứa mô tả và đáp án mà bài toán đòi hỏi hay không.

Một món đắt bất thường, khoảng **21.000 USD**, được giảng viên kiểm tra thêm và nhận ra là thiết bị nấu thương mại. Bài học ở đây: **outlier — điểm ngoại lệ** chưa chắc là dữ liệu sai. Nó có thể hợp lệ nhưng nằm ngoài phạm vi bạn muốn xây dựng.

### Bước 2: Đặt quy tắc lựa chọn

| Quy tắc trong bài | Lý do |
|---|---|
| Phải có giá dùng được | Cần đáp án để học dự đoán giá |
| Giá từ 0,50 đến 999,49 USD | Giới hạn phạm vi bài toán, giảm ảnh hưởng của sản phẩm quá đắt |
| Mô tả tối thiểu 600 ký tự | Tránh ví dụ có quá ít thông tin |
| Giới hạn mỗi phần văn bản ở 3.000 ký tự | Hạn chế phần mô tả quá dài |
| Giới hạn tổng văn bản ở 4.000 ký tự | Giữ kích thước mỗi ví dụ ở mức kiểm soát được |
| Làm sạch khoảng trắng và một số chuỗi mã dài | Giảm nội dung mà bộ xử lý của giảng viên coi là ít hữu ích |
| Quy đổi trọng lượng sang pound | Đưa cùng một đại lượng về một đơn vị |

Đây là **lựa chọn của dự án**, không phải chuẩn bắt buộc cho mọi LLM. Độ dài ở đây tính bằng **ký tự**, không phải token.

Bổ sung: cắt bớt văn bản và loại mô tả ngắn có đánh đổi. Bạn có thể mất thông tin hữu ích hoặc bỏ qua những sản phẩm mà ngoài thực tế vẫn cần định giá. Loại mã sản phẩm cũng cần cân nhắc, vì mã đôi khi phân biệt hai phiên bản có giá khác nhau.

### Bước 3: Chuẩn hóa thành Item

Giảng viên dùng `Item` làm một mẫu cấu trúc chứa dữ liệu sản phẩm, dựa trên Pydantic. Hãy hình dung đây là **mẫu phiếu chuẩn** để mọi sản phẩm điền đúng các ô.

| Trường | Nghĩa |
|---|---|
| `title` | Tiêu đề sản phẩm |
| `category` | Danh mục |
| `price` | Giá dùng làm nhãn |
| `full` | Nội dung mô tả đầy đủ sau xử lý của dự án |
| `summary` | Ô dành cho mô tả tóm tắt, phục vụ bước tiếp theo |
| `weight` | Trọng lượng vật lý của sản phẩm |
| `prompt`, `id` | Các trường phục vụ quy trình về sau |

**Parser — Bộ phân tích/chuyển đổi dữ liệu** nhận bản ghi gốc, đọc các trường, làm sạch, kiểm tra điều kiện và tạo `Item` phù hợp. **Schema — Cấu trúc dữ liệu** quy định mẫu phiếu gồm những ô nào. **JSON** là một dạng biểu diễn để lưu hoặc trao đổi các thông tin đó.

Bài này không yêu cầu bạn thuộc chi tiết lớp Python. Điều cần hiểu là: dữ liệu từ nguồn ngoài phải được đưa về cấu trúc thống nhất trước khi dùng tiếp.

### Kết quả của bước thử nghiệm

Khoảng 94.000 bản ghi ban đầu còn khoảng **35.000 sản phẩm** sau lọc. Ít hơn không đồng nghĩa kém hơn: nhiều dòng bị bỏ vì không có nhãn hoặc không phù hợp phạm vi.

Trong video, giảng viên nhắc cách xử lý lỗi tương thích bằng phiên bản thư viện `datasets` 3.6.0. Đây là ghi chú về môi trường lúc quay. Tài liệu này không suy đoán lại câu lệnh cài đặt từ phụ đề và không xác nhận khả năng tương thích của môi trường hiện tại.

## 6. Bài 005 — Khám phá phân bố và loại bỏ bản ghi trùng

### Histogram — Biểu đồ phân bố cho biết gì?

Nếu chia giá thành các khoảng rồi đếm số sản phẩm trong mỗi khoảng, bạn có histogram. Cột cao ở khoảng giá thấp nghĩa là có nhiều sản phẩm giá thấp.

Trong phần thiết bị gia dụng, giảng viên quan sát độ dài mô tả trung bình khoảng **1.400 ký tự**, giá trung bình khoảng **56 USD**. Dữ liệu nghiêng nhiều về món rẻ.

Sau đó, quy trình được mở rộng sang ô tô, điện tử, văn phòng phẩm, công cụ/cải tạo nhà, điện thoại/phụ kiện, đồ chơi, thiết bị gia dụng và nhạc cụ. `ItemLoader` hỗ trợ tải và xử lý nhiều phần, có dùng xử lý song song để tăng tốc. Kết quả là gần **2,9 triệu sản phẩm** sau các quy tắc lọc.

Đây là cách làm có chủ đích: hiểu một phần dữ liệu trước, rồi áp dụng quy trình lên phạm vi lớn hơn.

### Tại sao trùng dữ liệu nguy hiểm?

Một sản phẩm có thể xuất hiện trong nhiều danh mục. Nếu chia dữ liệu mà không loại trùng, một bản có thể vào train và bản còn lại vào test.

Ví dụ: nhân viên đã học phiếu “Ấm X, 45 USD”, rồi đề thi lại có đúng phiếu đó. Trả lời đúng không chứng minh họ định giá được một mẫu ấm chưa từng xem.

Đó là **data leakage/data contamination — rò rỉ hoặc nhiễm dữ liệu** giữa các tập. Nó không chỉ làm điểm số đẹp hơn thực chất: điểm validation sai lệch còn có thể khiến bạn tiếp tục huấn luyện hoặc chọn nhầm mô hình.

Trong bài, giảng viên trộn dữ liệu rồi loại các bản có **tiêu đề trùng** hoặc **mô tả đầy đủ trùng**, còn khoảng **2.887.000 sản phẩm**.

Bổ sung: so khớp y hệt là bước hữu ích nhưng chưa phát hiện mọi sản phẩm gần trùng. Đổi vài chữ có thể lọt qua. Với dự án thực tế, nếu có mã định danh hoặc nhóm biến thể đáng tin cậy, cần cân nhắc kiểm tra hoặc chia theo nhóm để hạn chế rò rỉ.

### Hai độ lệch được phát hiện

Sau khi mở rộng dữ liệu, mô tả trung bình khoảng **1.600 ký tự**, giá trung bình khoảng **59 USD**. Hai vấn đề giảng viên muốn điều chỉnh là:

1. Có rất nhiều món giá rẻ và ít món đắt.
2. Automotive — sản phẩm/phụ tùng ô tô — chiếm gần một triệu bản ghi, vượt trội nhiều nhóm khác.

Quay lại ví dụ cửa hàng: nếu học phần lớn từ phụ tùng rẻ, nhân viên có ít cơ hội luyện định giá các loại hàng và mức giá khác.

Tuy nhiên, **phân bố lệch không tự động là lỗi**. Nếu cửa hàng thực sự bán chủ yếu phụ tùng rẻ, phân bố đó có thể phù hợp. Giảng viên điều chỉnh vì muốn mô hình phục vụ phạm vi sản phẩm và giá rộng hơn.

## 7. Bài 006 — Chọn mẫu có trọng số và lưu bộ dữ liệu

### Sampling — Lấy mẫu

Bạn có gần 2,9 triệu phiếu nhưng muốn chọn **820.000 phiếu** để dùng tiếp. Đó là lấy một tập con từ tập lớn.

**Weighted sampling — Lấy mẫu có trọng số** cho một số phiếu mức ưu tiên lớn hơn khi chọn. Hình dung mỗi phiếu có một “mức ưu tiên bốc thăm”: ưu tiên cao thì dễ được chọn hơn, nhưng không phải chắc chắn được chọn.

Ba nghĩa của “weight” cần tách riêng:

| Thuật ngữ | Nghĩa trong phần này |
|---|---|
| Product weight | Sản phẩm nặng bao nhiêu, là thuộc tính vật lý |
| Sampling weight | Mức ưu tiên khi chọn sản phẩm vào bộ dữ liệu |
| Model weights | Các giá trị bên trong mô hình, liên quan đến huấn luyện |

Chỉnh trọng số lấy mẫu **không đổi giá thật của sản phẩm** và **chưa phải cập nhật mô hình**.

### Công thức được dùng trên màn hình

Phụ đề diễn đạt ngắn là “bình phương giá”. Màn hình video 006, khoảng 00:45, cho thấy chi tiết hơn: **chuẩn hóa giá trước, rồi bình phương**.

1. Đưa giá về thang gần 0–1 bằng cách lấy giá trừ giá nhỏ nhất, chia cho khoảng từ giá nhỏ nhất đến lớn nhất. Mẫu số có thêm số rất nhỏ `1e-9`.
2. Bình phương giá trị đã chuẩn hóa để tăng ưu tiên tương đối cho món đắt.
3. Nhân trọng số của Tools and Home Improvement với **0,5**.
4. Nhân trọng số của Automotive với **0,05**, vì nhóm này nhiều và cũng chứa không ít món đắt.
5. Chia các trọng số cho tổng của chúng để tạo phân bố xác suất.
6. Chọn 820.000 sản phẩm bằng NumPy, với `replace=False`: **không lấy lại cùng một phần tử** trong lần chọn tập con này.

Ví dụ bổ sung về ý nghĩa bước bình phương: hai giá trị đã chuẩn hóa là 0,2 và 0,8 trở thành 0,04 và 0,64. Trước điều chỉnh danh mục, trọng số sau lớn gấp 16 lần trọng số trước. Đây là tỷ lệ trọng số lựa chọn, không phải cam kết tỷ lệ xuất hiện cuối cùng khi lấy mẫu không hoàn lại.

Hệ số Automotive 0,05 cũng **không có nghĩa** Automotive sẽ chiếm đúng 5% bộ dữ liệu cuối. Kết quả còn phụ thuộc số lượng sản phẩm, giá và các nhóm khác.

### Kết quả lấy mẫu

Giảng viên có **820.000 sản phẩm**, giá trung bình tăng từ khoảng **59 lên 140 USD**. Dữ liệu vẫn có nhiều món rẻ, nhưng phần giá cao được đại diện nhiều hơn. Điện tử trở thành nhóm lớn nhất và ô tô bớt lấn át.

Các đỉnh quanh giá 399, 499 USD được giữ lại vì chúng phản ánh cách niêm yết giá phổ biến trong dữ liệu. Mục tiêu không phải làm biểu đồ phẳng hoặc làm mọi nhóm bằng nhau.

**Biểu đồ trông cân đối hơn chưa chứng minh mô hình tốt hơn.** Giảng viên nhấn mạnh cần thử các cách tuyển chọn và xem hiệu quả huấn luyện qua chỉ số đánh giá.

Bổ sung về phạm vi đánh giá: khi lấy mẫu rồi chia train/validation/test như trong bài, cả ba bộ phản ánh phân bố đã tuyển chọn. Điểm số trên đó cần được hiểu trong phạm vi này. Nếu triển khai cho toàn bộ lưu lượng Amazon tự nhiên, nên có thêm bộ đánh giá đại diện cho lưu lượng thực tế.

### Shuffle và random seed

**Shuffle — Xáo trộn** đổi thứ tự các phiếu. Nó không tự thay đổi tỷ lệ loại hàng hoặc giá trung bình.

**Random seed — Hạt giống ngẫu nhiên** giúp tái lập quá trình ngẫu nhiên khi dữ liệu, thứ tự đầu vào và điều kiện thực hiện tương ứng giống nhau. Video dùng seed 42; màn hình đặt seed cho NumPy trước lấy mẫu, lời giảng sau đó nhắc seed khi trộn bằng Python.

Bổ sung: 42 không có năng lực đặc biệt giúp AI học tốt. Một seed cũng không tự chứng minh thí nghiệm công bằng, và chỉ đặt seed cho một bộ sinh ngẫu nhiên không kiểm soát mọi thao tác của thư viện khác. Điều quan trọng là ghi lại cách thực hiện và không chọn riêng lần chạy đẹp nhất để báo cáo.

### Correlation — Mối tương quan

Giảng viên xem hai biểu đồ: giá với độ dài mô tả, và giá với trọng lượng sản phẩm.

| Cặp thông tin | Quan sát trong lời giảng | Cách hiểu phù hợp |
|---|---|---|
| Độ dài mô tả và giá | Không thấy quan hệ rõ bằng mắt | Viết dài hơn không tự động đồng nghĩa đắt hơn |
| Trọng lượng và giá | Có vẻ có tín hiệu nhưng nhiều nhiễu | Trọng lượng có thể là một đặc trưng đáng thử |

Bổ sung: đây là khảo sát bằng biểu đồ, chưa phải chứng minh quan hệ nhân quả. Có sản phẩm thiếu thông tin trọng lượng; số 0 trong dữ liệu không nhất thiết có nghĩa món hàng không có khối lượng.

### Chia bộ Full và Lite rồi lưu lên Hugging Face Hub

| Phiên bản | Train | Validation | Test | Tổng |
|---|---:|---:|---:|---:|
| Full — Đầy đủ | 800.000 | 10.000 | 10.000 | **820.000** |
| Lite — Nhẹ | 20.000 | 1.000 | 1.000 | **22.000** |

Điểm dễ bỏ sót: khi giảng viên nói ngắn “Lite 20.000” hoặc “Full 800.000”, đó là số ví dụ **train**. Tổng số của cả ba tập lớn hơn.

Giảng viên cho biết đã đưa hai phiên bản dữ liệu dạng raw lên Hub để người học tải lại. “Raw” ở giai đoạn này vẫn đã qua tuyển chọn, làm sạch và lấy mẫu; nó phân biệt với dữ liệu sẽ được LLM tiền xử lý/tóm tắt ở ngày sau.

Việc upload chỉ lưu và chia sẻ dữ liệu; nó không tự chạy huấn luyện. Phần thực hành dùng tài khoản và token Hugging Face để xác thực. Quyền riêng tư khi tải lên cần được chọn rõ; không suy ra rằng mọi lần upload đều có cùng chế độ mặc định từ lời nói trong video.

## 8. Ghép toàn bộ quy trình bằng một ví dụ nhỏ

Giả sử bạn có 1.000 phiếu sản phẩm. Các con số dưới đây chỉ minh họa quy trình:

1. Bỏ 100 phiếu thiếu giá vì không có đáp án để học.
2. Bỏ 150 phiếu không đạt phạm vi giá hoặc thông tin mô tả.
3. Loại 50 phiếu trùng, còn 700 phiếu khác nhau theo tiêu chí kiểm tra.
4. Xem thống kê, nhận ra phần lớn là phụ tùng giá thấp.
5. Lấy 500 phiếu theo mức ưu tiên để tăng cơ hội có các loại hàng và giá khác.
6. Xáo trộn và chia 400 phiếu học, 50 phiếu thi thử, 50 phiếu thi cuối.
7. Lưu ba bộ để ngày sau tiền xử lý và huấn luyện.

Đến đây, bạn **đã chuẩn bị xong việc dạy**, nhưng **chưa thực hiện buổi huấn luyện**. Đây cũng là trạng thái của dự án khi kết thúc ngày 1.

## 9. Những hiểu lầm cần tránh

| Hiểu nhầm | Cách hiểu chính xác hơn |
|---|---|
| Tải dataset là mô hình đã học | Dữ liệu chỉ mới được tải; phải có bước huấn luyện riêng |
| Đây là RAG tiếp tục tìm tài liệu | Phần này chuẩn bị dữ liệu cho học dự đoán giá; RAG được giới thiệu quay lại ở giai đoạn sau |
| Fine-tuning là tạo ChatGPT từ đầu | Fine-tuning tận dụng mô hình đã được huấn luyện |
| Càng nhiều dữ liệu càng tốt | Chất lượng, sự phù hợp và cách kiểm tra cũng quyết định kết quả |
| Bản ghi không có giá cứ gán 0 | Như vậy tạo nhãn sai; dự án loại các dòng không có giá dùng được |
| Điểm cao trên dữ liệu đã học chứng minh AI tốt | Phải xem năng lực trên dữ liệu giữ riêng và kiểm tra rò rỉ |
| Phải cân bằng mọi danh mục bằng nhau | Tỷ lệ cần phục vụ mục tiêu, không nhất thiết đồng đều |
| Dùng seed 42 là kết quả chắc chắn công bằng | Seed hỗ trợ tái lập, không thay thế thiết kế đánh giá |
| Lấy mẫu làm giá trung bình tăng nghĩa là đổi giá | Chỉ đổi thành phần sản phẩm được chọn |
| Giá nhãn là giá trị đúng ở mọi thời điểm | Đây là giá ghi trong nguồn dữ liệu, có giới hạn về thời gian và bối cảnh |

## 10. Tự kiểm tra mức độ hiểu

Hãy thử trả lời trước khi đọc phần gợi ý:

1. Cuối ngày 1, sản phẩm đầu ra là gì?
2. Vì sao bản ghi thiếu giá không phù hợp với cách huấn luyện ở đây?
3. Vì sao cần cả validation và test?
4. Nhân trọng số Automotive với 0,05 có đổi giá phụ tùng không?
5. Vì sao loại trùng nên làm trước khi chia tập?
6. Bộ Lite có tổng cộng bao nhiêu ví dụ?

**Gợi ý trả lời:** (1) Bộ dữ liệu đã tuyển chọn và chia tập. (2) Thiếu nhãn mục tiêu. (3) Validation để lựa chọn, test để đánh giá cuối sau lựa chọn. (4) Không, chỉ giảm ưu tiên chọn mẫu thuộc nhóm đó. (5) Tránh cùng ví dụ xuất hiện ở cả bộ học và bộ đánh giá. (6) 22.000, trong đó 20.000 dùng để học.

## 11. Nguồn và cách đọc tài liệu

Nguồn chính là sáu file phụ đề tiếng Anh do bạn cung cấp, theo đúng thứ tự:

1. `001 Day 1 - Training, Datasets, and Generalization Your Capstone Begins.srt`
2. `002 Day 1 - Finetuning LLMs & The Price is Right Capstone Project Intro.srt`
3. `003 Day 1 - Curating Datasets Finding Data Sources and Building Training Sets.srt`
4. `004 Day 1 - Curating Amazon Data with Hugging Face for Price Prediction.srt`
5. `005 Day 1 - Exploring Amazon Dataset Distribution and Removing Duplicates.srt`
6. `006 Day 1 - Weighted Sampling with NumPy and Uploading Datasets to Hugging Face.srt`

Đối chiếu bổ sung: màn hình file MP4 bài 006 tại khoảng 00:45 để xác định công thức chuẩn hóa giá, hai hệ số danh mục, seed NumPy và `replace=False`.

Tài liệu diễn giải lại mạch học, bỏ các câu chào và lời lặp, sửa cách hiểu khi phụ đề nhận dạng thuật ngữ không rõ. Những đoạn ghi “bổ sung” là phần giải thích giúp hiểu đúng hoặc thấy giới hạn, không phải kết quả đã được chứng minh trong video. Đây là tài liệu học khái niệm và quy trình, không phải bản chép toàn bộ mã nguồn hay báo cáo đã chạy lại thí nghiệm.
