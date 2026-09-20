# Day 5 — Hiểu cách LLM học và kiểm tra mô hình sau fine-tuning

> Bản giảng giải đầy đủ bằng tiếng Việt cho các bài 021–024. Đọc bản tóm tắt trước nếu bạn muốn nắm ý chính nhanh.
>
> Nguồn: toàn bộ bốn phụ đề SRT bạn gửi; đối chiếu thêm khung hình kết quả ở video 023 và biểu đồ so sánh ở video 024. Đây là tài liệu giảng lại, không phải bản dịch từng câu. Các ví dụ đơn giản, lưu ý đánh giá và câu hỏi ôn tập là phần giải thích bổ sung.

## 1. Rốt cuộc, bốn video muốn dạy điều gì?

**Bạn đã huấn luyện một mô hình. Bây giờ cần hiểu nó học bằng cách nào, tải đúng phiên bản đã học và kiểm tra xem nó có thực sự giải quyết bài toán tốt hơn hay không.**

Bài toán xuyên suốt là **đọc mô tả sản phẩm rồi dự đoán giá**. Ví dụ minh họa:

- Đầu vào: mô tả một thiết bị âm thanh, thương hiệu và tính năng.
- Đầu ra mong muốn: giá 89 USD.
- Mô hình ban đầu có thể đoán sai. Fine-tuning dùng những cặp mô tả–giá có sẵn để dạy nó chuyên môn này.

Đối tượng được điều chỉnh là LLaMA 3.2 khoảng 3 tỷ tham số, dùng lượng tử hóa 4-bit và LoRA. Đây là **điều chỉnh mô hình đã được huấn luyện sẵn**, không phải tự huấn luyện một ChatGPT từ đầu.

| Bài | Câu hỏi chính | Điều cần hiểu sau khi học |
| --- | --- | --- |
| 021 | Mô hình sửa sai bằng cách nào? | Bốn bước: tính đầu ra, tính loss, tính gradient, cập nhật tham số. |
| 022 | Loss thực sự chấm điểm điều gì? | Chấm xác suất dành cho token đúng, không trực tiếp lấy giá đoán trừ giá thật. |
| 023 | Dùng lại mô hình đã fine-tune như thế nào? | Nạp base model cùng LoRA adapter, rồi đánh giá bản Lite trên test set. |
| 024 | Bản huấn luyện mạnh hơn cải thiện đến đâu? | Đọc kết quả bản Full và hiểu giới hạn của tuyên bố “vượt mô hình lớn”. |

Ví dụ đời thường: một người có kiến thức tổng quát được đào tạo chuyên sâu để định giá hàng hóa. Sau đào tạo, họ làm bài thi định giá. Điểm thi tốt chứng minh năng lực ở bài thi đó; không chứng minh họ giỏi mọi môn.

## 2. Những thành phần cần phân biệt trước

| Thuật ngữ | Nghĩa dễ hiểu trong bài |
| --- | --- |
| Base model — mô hình nền | Mô hình có sẵn, mang kiến thức và khả năng ngôn ngữ ban đầu. |
| Fine-tuning — tinh chỉnh | Huấn luyện bổ sung để làm tốt một nhiệm vụ cụ thể. |
| LoRA adapter — bộ điều chỉnh LoRA | Những ma trận có thể học, bổ sung vào một số lớp của mô hình. |
| Quantization — lượng tử hóa | Lưu biểu diễn trọng số với độ chính xác thấp hơn để giảm bộ nhớ. |
| QLoRA | Huấn luyện adapter LoRA trên mô hình nền đã lượng tử hóa; không có nghĩa mọi phép tính và adapter đều dùng 4-bit. |
| Checkpoint — bản lưu huấn luyện | Trạng thái mô hình/adapter được lưu tại một thời điểm. |
| Inference — suy luận | Dùng mô hình để tạo dự đoán; bình thường không cập nhật trọng số. |
| Token | Đơn vị văn bản mô hình xử lý: có thể là từ, một phần từ, số hoặc ký hiệu. |

Hình dung adapter như “phần chuyên môn bổ sung”. Về kỹ thuật, nó tác động vào phép tính bên trong mô hình, không phải một tệp ghi chú được ghép vào prompt. Adapter thường cần đúng mô hình nền tương ứng để hoạt động.

## 3. Bài 021 — Một vòng huấn luyện diễn ra thế nào?

### 3.1. Forward pass — tính đầu ra

Mô tả sản phẩm và phần dẫn như `Price is $` được chuyển thành token ID rồi đưa qua mô hình nền cùng adapter. Mô hình tính các điểm số cho những token có thể xuất hiện tiếp theo.

Ở mức khái quát, ta nói “mô hình đoán 99”. Nhưng bên trong, nó tạo điểm số cho nhiều khả năng; sau khi chuyển thành xác suất, một quy tắc chọn token mới quyết định đầu ra. Bài 022 giải thích sâu phần này.

### 3.2. Loss calculation — tính mức phạt

Dữ liệu huấn luyện đã có đáp án. Hệ thống so sánh phân phối dự đoán với token đáp án và tính một con số gọi là **loss**.

- Loss thấp: mô hình dành xác suất cao cho token đúng tại những vị trí được chấm.
- Loss cao: mô hình dành xác suất thấp cho token đúng.

**Loss không phải “số USD đoán sai”.** Giá thật 89 USD, đoán 99 USD thì sai số tiền là 10 USD, nhưng training loss trong bài không được tính đơn giản bằng 10.

### 3.3. Backward pass — tính hướng sửa

Hệ thống tính **gradient**, cho biết loss nhạy thế nào với thay đổi của các tham số có thể học. **Backpropagation — lan truyền ngược** dùng quy tắc đạo hàm dây chuyền để tính những gradient này hiệu quả.

Ẩn dụ: giáo viên không chỉ nói “em sai”, mà xác định phần nào trong cách làm cần điều chỉnh. Máy không thật sự thử vặn từng tham số bằng tay; đây là phép tính đạo hàm.

Trong thiết lập LoRA của bài, trọng số mô hình nền được **đóng băng**: chúng không được optimizer cập nhật. Các tham số adapter là phần được học. Đóng băng không có nghĩa mô hình nền bị bỏ qua; nó vẫn tham gia tính đầu ra và đường tính toán cần thiết cho việc học adapter.

### 3.4. Optimizer step — cập nhật

Optimizer dùng gradient để cập nhật tham số. Learning rate quyết định quy mô bước điều chỉnh. Bài nhắc đến AdamW và mô tả trực giác của SGD: đi một bước theo hướng ngược gradient.

Mục tiêu là làm loss giảm, nhưng không bảo đảm mọi batch hoặc mọi bước đều giảm loss. Dữ liệu từng batch khác nhau nên đường loss có thể dao động.

**Điều cần nhớ:** mô hình tính dự đoán → nhận mức phạt → tính hướng sửa → cập nhật adapter. Vòng này lặp lại trên nhiều ví dụ.

## 4. Bài 022 — Cross-entropy loss thực sự là gì?

### 4.1. Mô hình không chỉ đưa ra một đáp án

Giả sử giá thật là 89 USD. Để dễ hiểu, tạm coi mỗi chuỗi số sau là một token; cách tách token thực tế phụ thuộc tokenizer.

| Token có thể xuất hiện tiếp | Xác suất minh họa |
| --- | ---: |
| `99` | 40% |
| `89` — đáp án đúng | 30% |
| `79` | 20% |
| Tất cả token khác cộng lại | 10% |

Nếu chọn token có xác suất cao nhất, mô hình xuất `99`. Tuy nhiên, **khi tính loss, câu hỏi là: “Mô hình đã dành bao nhiêu xác suất cho token đúng `89`?”** Ở đây là 30%.

Không lấy token đã chọn `99` làm đáp án để tính loss. Tuy vậy, những token khác vẫn có ảnh hưởng thông qua phân phối xác suất: tổng xác suất bằng 1, nên tăng phần dành cho khả năng sai có thể làm giảm phần dành cho khả năng đúng.

### 4.2. Logits và softmax

**Logits** là các điểm số thô đầu ra của mô hình, chưa phải xác suất. **Softmax** chuyển chúng thành xác suất cộng lại bằng 1.

Bài nói khoảng 128 nghìn token trong bộ từ vựng. Điều cần hiểu không phải thuộc con số đó, mà là: tại mỗi vị trí, mô hình chấm điểm các khả năng trong bộ từ vựng.

Khi sinh văn bản, mô hình có thể chọn token xác suất cao nhất hoặc lấy mẫu theo phân phối. Lấy mẫu vẫn có thể chọn token khác token đứng đầu. Temperature điều chỉnh độ tập trung của phân phối; không nên hiểu “temperature thấp” luôn đồng nghĩa chọn token đứng đầu.

### 4.3. Công thức chỉ cần hiểu một dòng

Với một token đáp án đúng:

`Loss = −ln(xác suất mô hình dành cho token đúng)`

Trong đó `ln` là logarit tự nhiên; xác suất viết dưới dạng 0–1.

| Xác suất cho token đúng | Loss xấp xỉ | Diễn giải |
| --- | ---: | --- |
| 1,00 | 0 | Trường hợp lý tưởng, chắc chắn hoàn toàn vào đáp án đúng. |
| 0,90 | 0,105 | Rất tin vào đáp án đúng. |
| 0,50 | 0,693 | Chưa thật sự chắc chắn. |
| 0,30 | 1,204 | Đáp án đúng chưa được ưu tiên đủ. |
| 0,10 | 2,303 | Đáp án đúng bị đánh giá thấp. |
| 0,01 | 4,605 | Đáp án đúng bị coi là rất khó xảy ra. |

Bạn không cần tự tính logarit để hiểu bài. Chỉ cần nhớ: **xác suất cho đáp án đúng càng thấp thì bị phạt càng mạnh**.

Chọn đúng token có xác suất cao nhất chưa đồng nghĩa loss bằng 0. Ví dụ token đúng đứng đầu với 40% thì mô hình có thể sinh đúng, nhưng loss vẫn là `−ln(0,4) ≈ 0,916`.

### 4.4. Vì sao không lấy 99 trừ 89?

LLM học dự đoán token nói chung. Đáp án có thể là `89`, `cat`, hoặc một phần của câu tiếng Việt. Phép trừ hai con số không áp dụng chung cho văn bản. Token ID cũng chỉ là mã định danh; khoảng cách giữa hai ID không phải khoảng cách ý nghĩa.

Cross-entropy phù hợp với bài toán phân loại token kế tiếp. Giảm loss tương đương tăng khả năng mô hình gán cho chuỗi đáp án trong dữ liệu.

**Một hệ quả quan trọng:** cross-entropy không trực tiếp biết “đoán 90 gần 89 hơn đoán 900” theo khoảng cách USD. Vì vậy, sau huấn luyện vẫn phải đo sai số giá để biết hiệu quả thực tế.

### 4.5. Nếu đáp án có nhiều token thì sao?

Phần bổ sung: huấn luyện thường tính loss ở nhiều vị trí token hợp lệ rồi lấy trung bình. Những vị trí nào được tính phụ thuộc cách tạo labels và masking; padding hoặc phần prompt có thể bị loại khỏi loss tùy thiết lập.

Trong huấn luyện ngôn ngữ nhân quả, mô hình thường được cung cấp tiền tố đúng từ dữ liệu để dự đoán token kế tiếp, gọi là **teacher forcing**. Khi suy luận, token vừa sinh lại được đưa vào ngữ cảnh để sinh token sau.

Vì vậy, một con số training loss trên biểu đồ không phải sai số của duy nhất một mức giá, cũng không thể quy đổi trực tiếp thành USD.

## 5. Bài 023 — Nạp lại mô hình và kiểm tra bản Lite

### 5.1. Quy trình trong video

1. Kết nối Colab với GPU T4, cài thư viện và lấy script đánh giá.
2. Chọn mô hình nền, tài khoản/repository chứa adapter và dữ liệu.
3. Đặt chế độ Lite để thử phiên bản huấn luyện nhẹ.
4. Đăng nhập Hugging Face và tải dữ liệu kiểm tra.
5. Nạp tokenizer và base model lượng tử hóa.
6. Dùng `PeftModel.from_pretrained(...)` để gắn adapter đã lưu lên base model.
7. Chạy hàm `model_predict`, chuyển đầu ra thành giá và đánh giá trên 200 mẫu test.

Tên hàm được nêu để nhận diện thao tác trong bài, không phải một notebook hoàn chỉnh có thể chạy ngay. Không có mã nguồn notebook đính kèm để tái tạo chính xác mọi tham số.

**PEFT** là nhóm phương pháp và thư viện hỗ trợ tinh chỉnh tiết kiệm tham số; LoRA là một phương pháp trong nhóm đó, không phải hai tên hoàn toàn đồng nghĩa.

### 5.2. Vì sao cần revision?

Repository adapter có thể chứa nhiều phiên bản qua các lần lưu. `revision` cho phép chỉ định phiên bản cụ thể, chẳng hạn commit tương ứng với checkpoint đã chọn.

Giảng viên nhắc checkpoint khoảng step 6.200, với giọng nhớ lại chưa hoàn toàn chắc chắn. Điều quan trọng là chọn đúng bản đã xác định tốt qua validation, không phải học thuộc 6.200 hay luôn tải bản mới nhất.

Phân biệt: **step** là tiến độ cập nhật lúc huấn luyện; **revision** là định danh phiên bản trong repository. Chúng không phải một loại số.

### 5.3. Train, validation và test làm ba công việc khác nhau

| Tập dữ liệu | Dùng để làm gì? | Ẩn dụ |
| --- | --- | --- |
| Train | Cập nhật adapter. | Bài luyện tập có đáp án. |
| Validation | Theo dõi khả năng tổng quát hóa, chọn cấu hình/checkpoint. | Thi thử để điều chỉnh cách học. |
| Test | Đánh giá sau khi đã chốt lựa chọn. | Bài thi cuối. |

Giảng viên nói tập test được giữ lại đến cuối và khác tập validation. Nếu liên tục đổi cấu hình dựa vào test score, test dần trở thành một tập validation trá hình và kết quả cuối dễ lạc quan quá mức.

### 5.4. Bản Lite đạt gì?

Bản Lite có rank `r = 32`, adapter tập trung ở các lớp attention; MLP không được gắn adapter trong cấu hình được trình bày. Video báo footprint khoảng 2.271 MB, diễn giải là khoảng 2,2 GB mô hình nền cộng khoảng 70 MB adapter.

Kết quả: **sai số trung bình 65,40 USD**, tốt hơn mốc con người của giảng viên khoảng 87 USD, nhưng vẫn kém GPT-4.1 nano ở mức 62,51 USD vì sai số càng thấp càng tốt.

Tên tệp bài 023 ghi “GPT-4o Nano”, nhưng lời giảng và biểu đồ dùng **GPT-4.1 nano**. Tài liệu này theo nội dung bên trong để tránh lẫn tên.

Huấn luyện nhẹ miễn phí trên T4 là trải nghiệm giảng viên mô tả trong khóa học, không phải cam kết mọi người luôn có tài nguyên miễn phí hoặc chạy ra đúng cùng kết quả.

## 6. Bài 024 — Bản Full và ý nghĩa của kết quả

### 6.1. Full khác Lite thế nào?

Giảng viên khởi động lại phiên chạy, đặt `light mode = false`, chọn run/revision của bản Full rồi nạp lại base model cùng adapter tương ứng. Đổi cờ này **không tự huấn luyện thêm**; nó chọn bộ trọng số đã được huấn luyện trước đó.

| Đặc điểm | Lite | Full |
| --- | --- | --- |
| Rank LoRA | 32 | 256 |
| Phạm vi gắn adapter | Attention trong cấu hình nhẹ | Attention và MLP |
| Huấn luyện được mô tả | Khoảng một giờ | Nhiều giờ, dùng toàn bộ dữ liệu; bản được chọn khoảng cuối epoch 2 |
| Adapter theo lời giảng | Khoảng 70 MB | Khoảng 1,56 GB |
| Footprint được báo | Khoảng 2,27 GB | Khoảng 3,75 GB |
| Sai số test | 65,40 USD | 39,85 USD |

Rank là kích thước trung gian của hai ma trận LoRA, không phải số lớp hay số epoch. Rank lớn hơn cho adapter nhiều khả năng điều chỉnh hơn và thường tốn thêm tài nguyên. Nó không bảo đảm kết quả tốt hơn trong mọi trường hợp.

Ở đây nhiều yếu tố thay đổi cùng lúc: rank, phạm vi adapter, dữ liệu và thời lượng huấn luyện. Không thể kết luận mức cải thiện chỉ do tăng rank.

Phụ đề có chỗ nói nhầm MB/GB ở đầu bài 024; câu tiếp theo nêu khoảng 2,2 GB base và 1,56 GB adapter. Các số trên là xấp xỉ theo bài, không phải phép đo tổng VRAM cần dùng. Bộ nhớ chạy còn có cache và các bộ đệm khác; bộ nhớ huấn luyện còn phụ thuộc gradient, optimizer và activation.

### 6.2. Đọc các con số cho đúng

| Mốc so sánh trong bài | Sai số giá trung bình — thấp hơn tốt hơn |
| --- | ---: |
| Con người — giảng viên Ed | Khoảng 87 USD |
| LLaMA fine-tune Lite | 65,40 USD |
| GPT-4.1 nano | 62,51 USD |
| GPT-5.1 | 44,74 USD |
| LLaMA fine-tune Full | **39,85 USD** |

Các số là kết quả giảng viên báo cáo trong thí nghiệm của khóa học, không phải bảng xếp hạng năng lực AI hiện tại. Bảng chỉ liệt kê những mốc có số được nói rõ; không suy đoán toàn bộ số liệu từ chiều cao các cột.

Sai số trung bình ở đây được hiểu theo cách đánh giá absolute error xuyên suốt bài:

`MAE = trung bình của |giá dự đoán − giá thật|`

Ví dụ bổ sung: ba món có sai số lần lượt 10, 20 và 30 USD thì MAE bằng 20 USD. MAE 39,85 USD không có nghĩa mọi món đều sai đúng 39,85 USD, cũng không có nghĩa sai 39,85%.

So với mốc GPT-5.1 được báo cáo, bản Full giảm MAE 4,89 USD, tương đương khoảng **10,9%**. Đây là mức giảm sai số trên bài test này, không phải “thông minh hơn 10,9%”.

### 6.3. Đọc biểu đồ trong video

Ở bài 023, biểu đồ đường thể hiện sai số trung bình khi số mẫu đã đánh giá tăng lên. Trục ngang là **số mẫu test**, không phải training step; đường này không cho thấy mô hình đang tiếp tục học.

Biểu đồ phân tán đặt giá thật và giá dự đoán trên hai trục. Điểm gần đường chéo nghĩa là giá đoán gần giá thật. Bảng còn có MSE và R²: MSE phạt sai số lớn mạnh hơn vì bình phương sai số; R² đo mức giải thích biến thiên và không phải tỷ lệ dự đoán đúng. Các video này tập trung so sánh chỉ số Error bằng USD.

Khung hình Lite hiển thị `65.40 ± 13.49`. Vì chưa có script đánh giá để xác nhận ý nghĩa thống kê của phần `±`, không nên tự gọi đó là độ lệch chuẩn hoặc khoảng tin cậy cụ thể.

### 6.4. Tại sao mô hình nhỏ có thể thắng mô hình lớn?

Một người làm việc nhiều năm với một loại hàng có thể định giá loại hàng đó tốt hơn một người biết rộng nhưng ít luyện đúng việc này. Fine-tuning tạo lợi thế tương tự: mô hình được luyện trực tiếp trên nhiều ví dụ gần với nhiệm vụ cần làm.

**Kết luận được dữ liệu trong bài hỗ trợ:** bản Full có điểm sai số tốt nhất trong các hệ thống giảng viên đã so sánh ở bài toán và bộ test này.

Điều đó không chứng minh nó giỏi hơn về viết code, dịch thuật, suy luận tổng quát hay mọi loại hàng ngoài phân phối dữ liệu. Cũng không chứng minh đây là mô hình định giá tốt nhất thế giới; phạm vi thử nghiệm hữu hạn không hỗ trợ kết luận rộng như vậy.

Phần bổ sung: 200 mẫu là một kết quả thử nghiệm hữu ích, nhưng muốn kết luận vững hơn cần kiểm tra tính đại diện, trùng lặp dữ liệu, sai số theo nhóm sản phẩm và độ ổn định. Chênh lệch điểm trung bình tự nó chưa chứng minh ý nghĩa thống kê.

## 7. Hai loại “tốt hơn” bạn phải tách riêng

| Câu hỏi | Chỉ số phù hợp trong bài |
| --- | --- |
| Mô hình có gán xác suất cao hơn cho chuỗi đáp án không? | Cross-entropy loss. |
| Giá cuối cùng có gần giá thật hơn không? | MAE tính bằng USD. |

Loss tốt hơn thường là tín hiệu tích cực, nhưng không bảo đảm MAE cũng tốt hơn theo cùng tỷ lệ. Cách sinh token, định dạng đầu ra, xử lý số và dữ liệu đánh giá đều có thể ảnh hưởng kết quả cuối.

Tương tự, checkpoint cuối cùng không nhất thiết tốt nhất. Mô hình có thể tiếp tục khớp dữ liệu train nhưng giảm khả năng làm tốt trên dữ liệu mới — gọi là **overfitting, học quá khớp**.

## 8. Nếu tự làm lại, bạn nên tư duy theo quy trình nào?

Đây là quy trình học và đánh giá bổ sung, không phải các lệnh chạy nguyên bản của khóa học.

1. **Chốt đầu vào, đầu ra và tiêu chí:** mô tả sản phẩm → giá USD; dùng MAE để đánh giá.
2. **Chuẩn bị dữ liệu:** bảo đảm cặp mô tả–giá đáng tin cậy, tách train/validation/test và hạn chế mẫu trùng lọt qua các tập.
3. **Đo baseline:** thử base model hoặc một giải pháp đơn giản để biết có cần fine-tuning không.
4. **Huấn luyện adapter:** ghi cấu hình, dữ liệu, thời gian và validation loss.
5. **Chọn checkpoint bằng validation:** nếu ưu tiên MAE, đo thêm MAE trên validation với cách sinh đầu ra nhất quán.
6. **Nạp đúng mô hình:** base model, tokenizer, adapter và revision phải tương thích.
7. **Đánh giá test sau khi chốt:** dùng cùng dữ liệu và quy tắc chấm; ghi nhận cả lỗi không sinh được giá hợp lệ, không âm thầm bỏ mẫu khó.
8. **Xem lỗi thực tế:** kiểm tra nhóm hàng sai nhiều và các trường hợp lệch lớn trước khi triển khai.

Giảng viên giao bài thử cải thiện mốc 39,85 bằng điều chỉnh hyperparameter và dữ liệu. Hướng làm có kỷ luật là thử trên validation; nếu đã dùng test nhiều lần để chọn cấu hình, cần một tập đánh giá cuối mới để kiểm tra khách quan.

## 9. Các câu hỏi tự kiểm tra

**1. Giá thật 89, mô hình sinh 99. Training loss có bằng 10 không?**  
Không. Sai số tiền là 10 USD; cross-entropy tính từ xác suất mô hình dành cho token đáp án.

**2. Mô hình sinh đúng thì loss chắc chắn bằng 0?**  
Không. Token đúng có thể đứng đầu dù xác suất chỉ là 40%. Loss chỉ bằng 0 trong trường hợp lý tưởng xác suất token đúng bằng 1.

**3. Tải adapter thôi là có mô hình hoàn chỉnh?**  
Thông thường không. Cần mô hình nền phù hợp, trừ khi bạn đang dùng một bản đã được hợp nhất/đóng gói theo cách khác.

**4. Đổi sang Full có phải bắt đầu huấn luyện lại?**  
Không trong notebook đánh giá này. Bạn chọn và tải adapter Full đã huấn luyện.

**5. Full đạt 39,85 USD có chứng minh giỏi hơn GPT-5.1 ở mọi việc?**  
Không. Nó chỉ cho thấy kết quả tốt hơn ở phép so sánh nhiệm vụ định giá được báo cáo.

**6. Điều quan trọng nhất mang sang dự án khác là gì?**  
Chọn nhiệm vụ rõ, có dữ liệu phù hợp, đo kết quả đúng mục tiêu và kiểm tra trên dữ liệu chưa dùng để lựa chọn mô hình.

## 10. Mốc xem lại và hướng đi tiếp của khóa học

| Bài | Mốc gần đúng | Nội dung |
| --- | --- | --- |
| 021 | 02:08–07:34 | Bốn bước huấn luyện, gradient và backpropagation. |
| 022 | 02:09–04:59 | Xác suất token đúng và công thức loss. |
| 022 | 07:12–08:26 | Làm rõ logits, softmax và cách chọn token. |
| 023 | 01:44–03:56 | Tập test, nạp adapter và cấu hình Lite. |
| 023 | 05:35–06:37 | Kết quả Lite 65,40 USD. |
| 024 | 00:56–01:41 | Dung lượng và cấu hình Full. |
| 024 | 02:24–05:37 | Kết quả 39,85 USD và ý nghĩa chuyên môn hóa. |
| 024 | 07:09–07:59 | Bài tập tối ưu thêm. |
| 024 | 08:54–09:35 | Giới thiệu triển khai, RAG và hệ thống agent ở phần sau. |

Bốn bài hiện tại kết thúc ở việc **hiểu cơ chế học và chứng minh chất lượng bằng đánh giá**. Phần đưa mô hình lên mạng, xây RAG và kết hợp agent mới là lời giới thiệu nội dung tiếp theo, chưa phải phần triển khai được hướng dẫn trong nhóm bài này.
