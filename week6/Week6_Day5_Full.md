# Day 5 — Fine-tuning và cách đánh giá một mô hình AI

> Bản giảng giải đầy đủ cho 6 video 022–027. Nội dung được tổ chức lại theo mạch học, không dịch từng câu. Nguồn chính là toàn bộ phụ đề được cung cấp, có đối chiếu các khung hình về code và kết quả. Ví dụ đời thường, phần giải thích cơ chế và các lưu ý về kết luận là phần bổ sung để bạn dễ hiểu.

## 1. Phần này thực sự muốn dạy điều gì?

**Mục tiêu là học cách thử một phương án AI và dùng kết quả đo được để quyết định nó có phù hợp với bài toán hay không.** Fine-tuning là phương án được thử trong buổi học, chứ không phải lời hứa rằng cứ huấn luyện thêm là AI sẽ giỏi hơn.

Bài toán xuyên suốt rất cụ thể:

> Cho mô tả một sản phẩm, hãy dự đoán giá của sản phẩm đó.

Ví dụ minh họa: đầu vào là “bàn phím cơ không dây, kết nối Bluetooth, có đèn nền”; đầu ra mong muốn là một mức giá, chẳng hạn `$80.00`. Giá thật được lưu riêng để chấm điểm.

Giảng viên đi qua hai hướng:

1. Lấy một LLM có sẵn, fine-tune bằng các cặp **mô tả sản phẩm → giá thật**, rồi xem nó có dự đoán tốt hơn trước không.
2. Khi hướng đó chưa đem lại kết quả tốt, thử một **mạng neural chuyên dự đoán giá**, được huấn luyện bằng nhiều dữ liệu hơn.

Bạn cần hiểu được ba điều sau khi học: **đang dạy mô hình việc gì, đang đo việc gì, và kết quả cho phép kết luận đến đâu.**

### Bản đồ 6 video

| Video | Việc giảng viên làm | Điều bạn cần hiểu |
|---|---|---|
| 022 | Giới thiệu fine-tuning qua API, SFT, DPO, RFT | Vì sao dữ liệu có đáp án phù hợp với SFT |
| 023 | Biến dữ liệu thành hội thoại JSONL, tải lên | Một ví dụ huấn luyện cần chứa câu hỏi và đáp án |
| 024 | Tạo job, theo dõi trạng thái và loss | API giao việc huấn luyện cho nhà cung cấp; loss phải được đọc đúng |
| 025 | Dùng mô hình mới để kiểm tra trên dữ liệu test | Job thành công không đồng nghĩa chất lượng tăng |
| 026 | Phân tích kết quả và giới thiệu mạng neural sâu | Thử nghiệm chưa tốt là thông tin để lựa chọn hướng tiếp theo |
| 027 | Chạy mạng 289 triệu tham số và so sánh | Một mô hình chuyên dụng có thể làm rất tốt một nhiệm vụ hẹp |

**Lưu ý tên mô hình:** tên các file có chỗ ghi GPT-4o mini/nano, nhưng lời giảng và màn hình thực hành dùng **GPT-4.1 nano**; giảng viên cũng nhắc các lần thử GPT-4.1 mini. Tài liệu này theo nội dung thực tế trong video. Các tên model, chi phí, thời gian và giao diện được hiểu là thông tin của buổi ghi hình, không phải hướng dẫn API hay bảng giá hiện hành.

## 2. Fine-tuning là gì? Bạn đang tạo loại “AI riêng” nào?

Hãy tưởng tượng bạn thuê một người đã có kiến thức rộng về rất nhiều sản phẩm. Bạn đưa thêm các hồ sơ sản phẩm kèm giá, để người đó tập trả lời theo yêu cầu của cửa hàng.

- **Pre-training — tiền huấn luyện:** giai đoạn tạo nền tảng kiến thức và năng lực ban đầu của mô hình.
- **Fine-tuning — tinh chỉnh:** tiếp tục huấn luyện từ mô hình đã có, dùng dữ liệu cho mục tiêu cụ thể.
- **Inference — suy luận:** dùng mô hình đã huấn luyện để trả lời một đầu vào mới.

Trong video, bạn chuẩn bị dữ liệu và gọi API; OpenAI vận hành quá trình huấn luyện. Khi hoàn tất, bạn nhận một **mã định danh mô hình đã tinh chỉnh** để gọi khi dự đoán.

Đây là một biến thể tùy chỉnh sử dụng qua dịch vụ. Quy trình được trình bày không phải xây ChatGPT từ số 0 và không cung cấp bước tải trọng số về để chạy offline.

### Phân biệt các cách thường bị nhầm

| Cách làm | Ví dụ dễ hiểu | Có huấn luyện thêm không? |
|---|---|---|
| Prompting — viết yêu cầu | “Hãy dự đoán giá, chỉ trả về một con số” | Không |
| Few-shot prompting — đưa vài ví dụ trong câu hỏi | Đính kèm 3 mẫu mô tả và giá trước khi hỏi sản phẩm mới | Không; ví dụ nằm trong ngữ cảnh của lần gọi |
| RAG — truy xuất thông tin bổ sung | Tìm sản phẩm tương tự trong danh mục rồi đưa thông tin vào câu hỏi | Bản thân bước truy xuất không huấn luyện mô hình |
| Fine-tuning — tinh chỉnh | Dùng nhiều cặp mô tả–giá để cập nhật các tham số được huấn luyện | Có |
| Huấn luyện mạng chuyên dụng | Tự xây mạng dự đoán giá bằng PyTorch | Có; trong bài này là một mô hình khác với LLM |

Nếu muốn lấy **giá hiện tại chính xác của sản phẩm có trong kho**, tra cơ sở dữ liệu/API là bài toán khác với **ước lượng giá sản phẩm từ mô tả**. Fine-tuning không biến mô hình thành bảng giá luôn cập nhật.

### LoRA xuất hiện để làm gì?

LoRA là **Low-Rank Adaptation**, một kỹ thuật tinh chỉnh dùng các ma trận bổ sung có hạng thấp, giúp giảm số tham số cần huấn luyện so với cập nhật toàn bộ mô hình.

Ví von: thay vì sửa cả bộ máy, bạn huấn luyện một phần điều chỉnh nhỏ để tác động đến hoạt động của bộ máy.

Video chủ yếu gợi mở LoRA cho phần học sau. Giảng viên suy đoán nhà cung cấp sử dụng cách này ở phía sau; **không nên biến suy đoán đó thành khẳng định rằng job trong video chắc chắn dùng LoRA**. Bạn không cần hiểu ma trận LoRA để nắm quy trình của buổi này.

## 3. Vì sao bài này chọn Supervised Fine-Tuning?

**Supervised Fine-Tuning (SFT) — tinh chỉnh có giám sát** nghĩa là huấn luyện bằng ví dụ có đầu vào và đầu ra mong muốn. “Giám sát” ở đây là có đáp án làm căn cứ, không phải có người ngồi theo dõi từng phép tính.

| Phương pháp | Tín hiệu dạy mô hình | Ví dụ minh họa |
|---|---|---|
| SFT | Câu hỏi và câu trả lời mẫu | Mô tả sản phẩm → `$80.00` |
| DPO — Direct Preference Optimization | Hai câu trả lời, chỉ rõ câu nào được ưu tiên | Cùng một câu hỏi, ưu tiên câu trả lời rõ ràng hơn |
| RFT — Reinforcement Fine-Tuning | Điểm đánh giá từ một cơ chế chấm, gọi là grader | Cho điểm câu trả lời dựa trên các tiêu chí của nhiệm vụ |

Trong bài dự đoán giá, dữ liệu đã có giá thật, nên SFT là hướng trực tiếp để thử.

Hai điểm cần hiểu chính xác hơn lời diễn giải giản lược trong video:

- DPO dùng **so sánh ưu tiên** giữa câu trả lời; không chỉ đơn thuần đưa vài ví dụ tốt/xấu rời rạc mà không có cấu trúc.
- RFT tập trung vào **tín hiệu thưởng/chấm điểm**. Không nên nhớ máy móc rằng “có đáp án thì không thể dùng RFT”: grader vẫn có thể tham chiếu đáp án. Việc có đáp án khiến SFT thuận tiện trong bài này, không chứng minh đây là cách duy nhất.

Danh sách model hỗ trợ từng phương pháp trong video thuộc thời điểm ghi hình. Mục tiêu của phần này là phân biệt cách học, không ghi nhớ danh sách đó.

## 4. Chuẩn bị dữ liệu: mô hình học từ cái gì?

### 4.1. Một mẫu huấn luyện gồm câu hỏi và đáp án

Ví dụ minh họa, không phải sản phẩm thật được trích nguyên từ dataset:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Estimate the price of this product. Respond with the price, no explanation.\nWireless mechanical keyboard with Bluetooth and backlight."
    },
    {
      "role": "assistant",
      "content": "$80.00"
    }
  ]
}
```

Đọc theo nghĩa đời thường:

- `user`: nếu khách hỏi như thế này…
- `assistant`: …thì câu trả lời mẫu cần học là như thế này.
- `messages`: gói các lượt hội thoại của một ví dụ.

Đáp án `$80.00` được cung cấp trong dữ liệu huấn luyện, không phải do mô hình tự đoán ở bước chuẩn bị.

### 4.2. JSONL khác JSON ở đâu?

**JSONL — JSON Lines** đặt mỗi đối tượng JSON trên một dòng riêng. Ví dụ ở trên được xuống dòng để dễ đọc; khi ghi thành JSONL, toàn bộ ví dụ đó nằm trên một dòng.

```jsonl
{"messages":[{"role":"user","content":"Estimate the price: product A. Respond with the price only."},{"role":"assistant","content":"$80.00"}]}
{"messages":[{"role":"user","content":"Estimate the price: product B. Respond with the price only."},{"role":"assistant","content":"$120.00"}]}
```

Video xây các hàm chuyển sản phẩm thành `messages`, chuyển thành JSONL, rồi ghi hai file cho train và validation. Sau đó tải các file lên với mục đích fine-tuning và nhận **file ID**. Có file ID mới chỉ có nghĩa dữ liệu đã được đưa lên; việc huấn luyện chưa tự động hoàn tất.

### 4.3. Phải tách train, validation và test

| Tập dữ liệu | Vai trò | So sánh với việc học |
|---|---|---|
| Training set — tập huấn luyện | Dùng để cập nhật tham số | Bài tập để học |
| Validation set — tập kiểm định | Theo dõi chất lượng, hỗ trợ chọn cấu hình | Bài kiểm tra thử trong quá trình ôn |
| Test set — tập kiểm tra cuối | Đánh giá mô hình sau khi đã lựa chọn | Đề thi cuối chưa dùng để luyện |

Cả ba có thể có giá thật trong dữ liệu lưu trữ. Khác biệt nằm ở **giá đó được sử dụng khi nào**: khi test, giữ giá thật ở phía chương trình chấm điểm, không đưa nó vào yêu cầu gửi cho mô hình.

Trong thí nghiệm fine-tuning:

- Giảng viên dùng **20.000 mẫu train** từ nguồn dữ liệu lớn hơn được mô tả khoảng 800.000 mẫu.
- Có **50 mẫu validation**.
- Đánh giá cuối trên **200 mẫu test**.
- Notebook hướng dẫn người học bắt đầu với **100 mẫu train**; cuối bài giảng viên còn gợi ý thử khoảng **20 mẫu** để tập thao tác.

Đây là những quy mô thử nghiệm của bài học, không phải quy tắc rằng mọi dự án phải dùng đúng từng ấy mẫu. Tập nhỏ giúp học quy trình nhanh, nhưng có thể không đại diện đủ loại sản phẩm và khoảng giá.

**Bổ sung:** tránh để cùng một sản phẩm hoặc các bản mô tả gần như trùng nhau lọt vào nhiều tập. Nếu liên tục dùng test để chọn cấu hình, test cũng mất dần giá trị như một phép kiểm tra độc lập.

## 5. Tạo job: bạn giao việc, dịch vụ thực hiện huấn luyện

Sau khi tải dữ liệu lên, giảng viên tạo **fine-tuning job — tác vụ tinh chỉnh**, kèm các thông tin:

| Thành phần | Ý nghĩa | Lựa chọn trong lần chạy của giảng viên |
|---|---|---|
| Base model | Mô hình có sẵn để bắt đầu | GPT-4.1 nano |
| Training/validation file | ID các file dữ liệu đã tải lên | Hai file đã chuẩn bị |
| Epoch | Số lượt đi qua toàn bộ tập train | 1 |
| Batch size | Số mẫu trong một nhóm huấn luyện | 16; bản hướng dẫn tập nhỏ dùng 1 |
| Seed | Giá trị khởi tạo cho các yếu tố ngẫu nhiên | 42 |
| Learning-rate multiplier | Hệ số điều chỉnh tốc độ học | Để dịch vụ tự lựa chọn |
| Suffix | Nhãn giúp nhận diện mô hình | `pricer` |

**Epoch và batch khác nhau:** với 20.000 mẫu, một epoch là đi qua 20.000 mẫu đó một lượt. Batch size 16 chia dữ liệu thành khoảng 1.250 nhóm. Đây là cách hình dung, không phải cam kết về toàn bộ chi tiết xử lý bên trong dịch vụ.

**Learning rate — tốc độ học** quyết định mức thay đổi tham số sau khi nhận tín hiệu sai số. Quá lớn có thể làm việc học không ổn định; quá nhỏ có thể khiến tiến bộ chậm. Multiplier là hệ số nhân, không nhất thiết là giá trị learning rate trực tiếp.

Giảng viên chọn một epoch vì còn nhiều dữ liệu khác để thử. **Không nên suy ra “nhiều dữ liệu thì nhiều epoch luôn vô ích”.** Số epoch phù hợp phải được đánh giá bằng thực nghiệm. Batch size 1 cũng không tự động là lựa chọn tốt nhất cho mọi tập nhỏ.

### Phân biệt ba ID

| ID | Trỏ đến cái gì? |
|---|---|
| File ID | File train hoặc validation đã tải lên |
| Job ID | Tác vụ đang xử lý/huấn luyện |
| Fine-tuned model ID | Mô hình thành phẩm dùng để dự đoán |

Bạn theo dõi job bằng API hoặc dashboard: xem trạng thái, sự kiện, lỗi, các chỉ số huấn luyện. Khi chưa hoàn tất, trường mô hình thành phẩm có thể chưa có giá trị. Khi thành công, dùng model ID mới để suy luận; nếu vẫn gọi base model cũ thì bạn chưa sử dụng kết quả fine-tuning.

Ví dụ liên hệ lập trình web: gửi dữ liệu tạo một công việc nền → nhận job ID → kiểm tra tiến độ → lấy kết quả khi xong. Việc request tạo job thành công chưa nói gì về độ chính xác của mô hình.

## 6. Đọc biểu đồ: vì sao loss giảm mà giá vẫn sai?

Đây là điểm quan trọng nhất của bài.

### 6.1. Hai mục tiêu có liên quan nhưng không giống nhau

Trong SFT cho mô hình sinh văn bản, **loss** phản ánh mức độ mô hình dự đoán các token của câu trả lời mẫu tốt đến đâu. Nó không trực tiếp mang đơn vị đô la.

Trong bài toán kinh doanh, điều cần biết là: **giá dự đoán lệch giá thật bao nhiêu?**

Ví dụ giá thật là `$80.00`:

| Câu trả lời | Định dạng | Chất lượng dự đoán giá |
|---|---|---|
| “Tôi đoán sản phẩm có giá khoảng 82 đô” | Không đúng yêu cầu chỉ trả giá | Giá chỉ lệch 2 đô |
| `$800.00` | Đúng kiểu trả lời | Giá lệch 720 đô |

Mô hình có thể học rất nhanh cách bắt đầu bằng `$`, viết số, rồi kết thúc câu trả lời. Vì vậy, loss có thể giảm mạnh ở giai đoạn đầu mà phần năng lực ước lượng giá chưa tiến bộ tương ứng.

**Token accuracy** nếu được hiển thị cũng không nên hiểu là “tỷ lệ sản phẩm được dự đoán đúng giá”. Accuracy và loss có liên hệ nhưng không phải hai đại lượng đối nghịch hoàn toàn hoặc luôn biến đổi giống nhau.

### 6.2. Biểu đồ trong video cho thấy gì?

Giảng viên thấy loss giảm mạnh ban đầu, sau đó dao động và không có xu hướng cải thiện rõ ràng. Ông nghi mô hình chủ yếu học định dạng trả lời.

Ở video 025, các giá trị validation loss được đọc gồm khoảng **1,138**, **1,179**, **1,141**, **1,133**, **1,284**, **0,932** và cuối khoảng **1,225**. Chúng không cho thấy một quá trình giảm đều, rõ ràng.

Cách hiểu thận trọng:

- Đây là các số đo trong lần chạy đó; mức dao động khiến kết luận chỉ từ vài điểm trở nên yếu.
- Validation chỉ có 50 sản phẩm nên mức đại diện hạn chế.
- Cần dùng mô hình dự đoán trên dữ liệu giữ lại và đo sai số giá thực tế.
- Không thể chỉ nhìn một đồ thị rồi khẳng định chắc chắn nguyên nhân là overfitting, dữ liệu kém hay một hyperparameter cụ thể.

**Overfitting — học quá sát dữ liệu huấn luyện** là khi mô hình làm tốt trên bài đã học nhưng kém trên dữ liệu mới. Đây là một khả năng cần kiểm tra, không phải nguyên nhân đã được chứng minh trong video.

Giảng viên có thử làm mượt và đổi thang hiển thị biểu đồ. Những thao tác đó giúp nhìn xu hướng; chúng không làm mô hình tốt lên và cũng không thay đổi số đo gốc.

## 7. Đánh giá đúng: không được đưa đáp án vào câu hỏi

Ở lúc huấn luyện, dữ liệu chứa cả `user` và câu trả lời `assistant` mẫu. Nhưng khi kiểm tra, chỉ đưa mô tả và yêu cầu dự đoán.

```text
Huấn luyện:
  Đầu vào: mô tả sản phẩm + yêu cầu dự đoán
  Đáp án mẫu để học: giá thật

Kiểm tra:
  Gửi cho mô hình: mô tả sản phẩm + yêu cầu dự đoán
  Mô hình tự tạo: giá dự đoán
  Chương trình chấm: so giá dự đoán với giá thật giữ riêng
```

Nếu gửi luôn đáp án `assistant` trong lời nhắc test, bạn đã **rò rỉ đáp án — data leakage**. Một kết quả gần hoàn hảo lúc đó có thể chỉ cho thấy mô hình nhìn thấy lời giải.

Prompt khi test cũng nên nhất quán với cách đã dùng khi huấn luyện. Giảng viên sửa lại câu yêu cầu để thống nhất rồi gọi model ID mới.

### Sai số giá được tính thế nào?

Thước đo chính của bài là sai số tuyệt đối trung bình, thường gọi **MAE — Mean Absolute Error**:

```text
Sai số của một sản phẩm = |giá dự đoán − giá thật|
MAE = tổng sai số tuyệt đối / số sản phẩm
```

Ví dụ tự tạo:

| Sản phẩm | Giá thật | Dự đoán | Sai số tuyệt đối |
|---|---:|---:|---:|
| A | $100 | $90 | $10 |
| B | $200 | $240 | $40 |
| C | $50 | $40 | $10 |

MAE = (10 + 40 + 10) / 3 = **20 đô la**. Càng thấp càng tốt.

Một vài dự đoán cực đoan có thể kéo trung bình lên rất mạnh. Bởi vậy, ngoài số trung bình, nên xem các trường hợp sai lớn và kết quả theo nhóm sản phẩm. Video cũng hiển thị các chỉ số khác, nhưng thông điệp chính tập trung vào mức chênh lệch giá tuyệt đối.

### Kết quả fine-tuning trong video 025

- Một sản phẩm pedal guitar có giá thật **$219**, mô hình dự đoán **$199**, lệch **$20**.
- Trên 200 mẫu test, kết quả tổng thể của lần chạy được trình bày là **$75,91** sai số trung bình.
- Giảng viên cho biết kết quả này kém hơn GPT-4.1 nano chưa fine-tune trong bảng so sánh của ông.
- Một lần thử nano với 20.000 mẫu trước đó từng đạt **$67,75**; các lần chạy không cho cùng kết quả.
- Ông cũng kể có lúc xuất hiện dự đoán rất cao, như khoảng **$10.000**, làm sai số tăng mạnh.

**Kết luận đúng:** cấu hình fine-tuning được thử chưa thể hiện lợi ích ổn định trong bài toán này. Không có cơ sở từ riêng buổi học để kết luận mọi fine-tuning đều vô ích hoặc luôn khiến mô hình kém đi.

## 8. Tại sao fine-tuning lần này chưa tốt?

Giảng viên nhấn mạnh rằng fine-tuning hữu ích khi muốn điều chỉnh cách mô hình hành xử: phong cách, định dạng, tuân thủ yêu cầu phức tạp hoặc xử lý các trường hợp thường làm sai. Ông cho rằng việc học thêm năng lực định giá từ các ví dụ cụ thể không đem lại hiệu quả rõ ràng trong thí nghiệm này.

Nên giữ lại ý **“chọn công cụ theo nhiệm vụ”**, nhưng tránh biến nhận định đó thành ranh giới tuyệt đối giữa mô hình đóng và mô hình mở.

| Điều có thể nói từ video | Điều chưa được chứng minh |
|---|---|
| Lần chạy cho sai số $75,91 | Fine-tuning luôn làm GPT kém hơn |
| Loss giảm ban đầu, sau đó cải thiện không rõ | Chắc chắn mô hình chỉ học định dạng và không học thêm gì khác |
| Mạng chuyên dụng cho kết quả tốt trong phép thử | Cứ tăng số tham số hoặc dữ liệu là chắc chắn thắng |
| Mô hình mở là hướng tiếp theo của khóa học | Mô hình mở chắc chắn fine-tune tốt hơn mô hình đóng |

**Giải thích bổ sung — các khả năng cần kiểm tra, không phải nguyên nhân đã xác nhận:** dữ liệu chưa đại diện, nhãn giá nhiễu, khác biệt giữa train và test, cấu hình huấn luyện chưa phù hợp, đầu ra có ngoại lệ, hoặc mục tiêu học token chưa phù hợp hoàn toàn với mục tiêu giảm sai số số học.

Ví dụ: dự đoán sai một chữ số có thể làm giá thay đổi từ 100 thành 900. Mất mát trên token không đơn giản tương đương với phạt sai 800 đô.

Một quy trình thử tiếp hợp lý là giữ baseline, thay một yếu tố mỗi lần, dùng validation để chọn cấu hình và đánh giá cuối trên test độc lập. Khi kết quả dao động mạnh, cần nhiều lần chạy hoặc đánh giá độ bất định trước khi tuyên bố một hướng tốt hơn.

## 9. Vì sao chuyển sang Deep Neural Network?

**Deep Neural Network (DNN) — mạng neural sâu** là mạng có nhiều lớp xử lý học từ dữ liệu. Trong bài này, nó được xây để dự đoán giá, không phải để trò chuyện.

Giảng viên đang kiểm tra một hướng khác:

> Nếu không yêu cầu mô hình làm hàng nghìn loại công việc, mà tập trung huấn luyện nó cho một nhiệm vụ duy nhất, kết quả sẽ ra sao?

Ví von: một người biết nhiều nghề chưa chắc định giá đồ nghề tốt bằng người chuyên định giá nhóm hàng đó mỗi ngày. Nhưng người chuyên định giá không vì thế mà biết viết thơ hay trả lời mọi câu hỏi.

### 9.1. Các thành phần trong mạng có tác dụng gì?

Màn hình code cho thấy `DeepNeuralNetwork` và các `ResidualBlock`, xây từ các lớp PyTorch:

| Thành phần | Cách hiểu đơn giản |
|---|---|
| Linear | Kết hợp các giá trị đầu vào bằng những trọng số học được |
| ReLU | Tạo tính phi tuyến để mạng học được quan hệ phức tạp hơn phép biến đổi tuyến tính |
| LayerNorm | Chuẩn hóa các giá trị trong lớp theo cách giúp việc tối ưu ổn định hơn |
| Dropout | Trong lúc train, ngẫu nhiên bỏ một phần tín hiệu để giảm phụ thuộc quá mức vào một số đường truyền |
| Residual/skip connection | Cộng đầu vào với kết quả xử lý của một khối, giúp thông tin và gradient truyền qua mạng sâu dễ hơn |

Ví dụ khái niệm cho residual:

```text
Đầu ra khối ≈ đầu vào + phần điều chỉnh khối đã học
```

Dropout giúp hạn chế overfitting, không bảo đảm loại bỏ nó hoàn toàn. Residual không có nghĩa mạng bỏ qua việc học.

Code có nhiều khối, mỗi khối chứa nhiều lớp. Vì thế cách nói “10 lớp” hay “40–50 lớp” phụ thuộc đang đếm khối, lớp có trọng số hay cả các phép biến đổi. Không cần ghi nhớ một con số lớp duy nhất để hiểu bài.

Dữ liệu văn bản phải được biến thành số trước khi mạng xử lý. Video có nhắc chuẩn hóa đầu vào; tài liệu này không tái dựng toàn bộ cách tạo đặc trưng và code huấn luyện vì không có notebook/source đầy đủ kèm theo.

### 9.2. Vòng học vẫn gồm bốn bước

1. **Forward pass — chạy xuôi:** đưa dữ liệu qua mạng để tạo giá dự đoán.
2. **Loss calculation — tính mất mát:** đo mức sai so với giá thật bằng hàm loss được chọn.
3. **Backward pass — lan truyền ngược:** tính gradient để biết các tham số ảnh hưởng đến loss thế nào.
4. **Optimizer step — cập nhật tham số:** điều chỉnh trọng số theo gradient và cấu hình tối ưu.

Lặp lại qua nhiều batch và epoch. Không nên mặc định loss nội bộ của mạng chính là MAE chỉ vì MAE được dùng ở bước đánh giá cuối; phải xem code để biết chính xác hàm loss huấn luyện.

**Parameter — tham số** là một giá trị có thể học, như trọng số hoặc bias. “289 triệu tham số” không phải 289 triệu sản phẩm, cũng không phải 289 triệu dòng code.

### 9.3. Cách chạy và kết quả trong video 027

Giảng viên nêu ba lựa chọn: chỉ xem kết quả, tải mô hình đã huấn luyện để chạy suy luận, hoặc tự huấn luyện.

| Hạng mục | Thông tin trong video |
|---|---|
| Số tham số | Khoảng 289 triệu |
| Dữ liệu huấn luyện | Được mô tả khoảng 800.000 mẫu |
| Validation cho runner | 1.000 mẫu đầu của tập validation |
| Số epoch huấn luyện được nhắc tới | 5 |
| Thời gian trên máy giảng viên | Khoảng 40 phút/epoch, tổng vài giờ |
| File mô hình | Giảng viên mô tả cỡ 2 GB |
| Sai số giá trung bình | **$46,49** |

Thời gian và dung lượng không phải cam kết cho máy bạn. Tải mô hình đã train giúp bỏ qua thời gian huấn luyện, nhưng việc suy luận vẫn cần tài nguyên tính toán.

Trong bảng của buổi học, giảng viên cho biết mạng này tốt hơn một số frontier model được thử, gồm Claude Opus 4.5 và Gemini 3 Pro, nhưng chưa vượt GPT-5.1. Đây là kết quả trên bài toán và bộ kiểm tra của khóa học, **không phải bảng xếp hạng năng lực AI nói chung**.

So với $75,91 của lần fine-tuning được trình bày, $46,49 thấp hơn $29,42, tức khoảng **38,8% về sai số trung bình**. Không nên gọi đó là “AI thông minh hơn 38,8%”.

Cũng không nên diễn giải $46,49 thành “mọi sản phẩm đều sai dưới $46,49”. Đó là trung bình; từng sản phẩm có thể sai ít hoặc nhiều hơn.

### 9.4. So sánh này có giới hạn gì?

Mạng DNN được huấn luyện với khoảng 800.000 mẫu, trong khi lượt fine-tuning LLM dùng 20.000 mẫu; kiến trúc và quy trình huấn luyện cũng khác. Vì vậy, kết quả cho thấy **giải pháp DNN được thử đạt kết quả tốt hơn trong thiết lập này**, không tách riêng được tác động của kiến trúc, số dữ liệu và cấu hình.

Các phát biểu trong lời giảng về số tham số “hàng nghìn tỷ” của mô hình đóng không nên được coi là số liệu đã xác minh. Điều cần giữ lại là sự khác biệt giữa **mô hình đa dụng** và **mô hình tối ưu cho một nhiệm vụ hẹp**.

## 10. Cách học phần này mà không bị ngợp

Bạn không cần nhớ mọi tên hàm API hoặc tự xây ngay mạng 289 triệu tham số. Hãy đi theo thứ tự:

1. Nói được bài toán: **mô tả sản phẩm → giá ước lượng**.
2. Hiểu mẫu SFT: **câu hỏi + câu trả lời mẫu**.
3. Phân biệt train, validation và test; biết vì sao test không được chứa đáp án trong prompt.
4. Hiểu luồng **tạo dữ liệu → tải file → tạo job → theo dõi → lấy model ID → đánh giá**.
5. Phân biệt **loss trên token** với **sai số giá**.
6. Hiểu kết quả thất bại của một thử nghiệm chỉ là bằng chứng về thiết lập đã thử.
7. Nhìn DNN như một phương án chuyên dụng để so sánh, không phải bản ChatGPT thu nhỏ.

### Tự kiểm tra nhanh

**1. Job fine-tuning thành công có nghĩa mô hình tốt hơn không?**  
Không. Chỉ có nghĩa quá trình đã hoàn tất thành công; cần đo chất lượng trên dữ liệu giữ lại.

**2. Loss giảm mạnh mà MAE không giảm có vô lý không?**  
Không. Mô hình có thể tiến bộ về xác suất token hoặc định dạng nhưng chưa dự đoán giá chính xác hơn.

**3. Tại sao không đưa câu trả lời `assistant` mẫu vào prompt test?**  
Vì đó là đáp án cần mô hình tự dự đoán; đưa vào sẽ làm rò rỉ đáp án.

**4. Mạng DNN đạt MAE thấp hơn có thay thế được chatbot không?**  
Không suy ra được điều đó. Mạng được thiết kế cho đầu ra dự đoán giá.

**5. Điều quan trọng nhất của cả phần là gì?**  
Xác định mục tiêu, chọn thước đo phù hợp, thử nghiệm và dùng bằng chứng để chọn giải pháp.

## 11. Ghi chú về nguồn và phạm vi

- **022:** mục tiêu fine-tuning, các phương pháp SFT/DPO/RFT và phần gợi mở LoRA.
- **023:** dữ liệu hội thoại, JSONL, 20.000/100 mẫu train và 50 mẫu validation.
- **024:** job, hyperparameters, theo dõi trạng thái và cách diễn giải loss ban đầu.
- **025:** validation loss, kiểm tra không lộ đáp án, kết quả $75,91 và biến động giữa các lần thử.
- **026:** nhận định sau thử nghiệm và kiến trúc DNN có residual blocks.
- **027:** mạng 289 triệu tham số, quy mô dữ liệu, lựa chọn tải/train và kết quả $46,49.

Các ví dụ bàn phím, bảng tính MAE, so sánh prompting/RAG, lưu ý về tính độc lập của test và giới hạn suy luận là phần giảng giải bổ sung. Tài liệu không xác minh khả năng hỗ trợ model hoặc giá dịch vụ hiện tại và không khởi chạy bất kỳ tác vụ huấn luyện nào.
