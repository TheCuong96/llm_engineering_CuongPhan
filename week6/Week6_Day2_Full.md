# Day 2 — Hiểu quy trình làm dự án AI và chuẩn bị dữ liệu bằng LLM

> Bản giảng giải đầy đủ cho video 007–011. Nội dung được biên soạn từ toàn bộ phụ đề tiếng Anh của 5 video bạn cung cấp; không phải bản chép lời hay bản kiểm chứng toàn bộ mã trên màn hình. Các ví dụ bằng tiếng Việt và phần “Giải thích bổ sung” được thêm để giúp bạn hiểu. Số tiền, thời gian và kết quả thử mô hình là những gì giảng viên ghi nhận trong bài, không phải báo giá hoặc cam kết hiện tại.

## 1. Cả phần này thực sự muốn dạy điều gì?

**Muốn xây một hệ thống AI có ích, bạn cần xác định đúng bài toán, biết cách đo kết quả và chuẩn bị dữ liệu tốt trước khi huấn luyện.** Trong phần thực hành, giảng viên dùng một LLM có sẵn để viết lại hàng chục nghìn mô tả sản phẩm, rồi xử lý các yêu cầu theo lô để giảm công sức và chi phí.

Dự án xuyên suốt có tên **The Price Is Right — Dự đoán giá sản phẩm**:

- **Đầu vào:** mô tả sản phẩm.
- **Đầu ra mong muốn:** mức giá dự đoán.
- **Ứng dụng dự kiến về sau:** tìm sản phẩm đang bán rẻ hơn mức giá hệ thống ước tính và thông báo cơ hội mua hời.

Ví dụ minh họa: bạn đưa mô tả “tai nghe không dây, chống ồn, pin 30 giờ, thương hiệu X”. Hệ thống trả về một mức giá ước tính. Để biết nó giỏi hay không, ta so dự đoán với giá tham chiếu trong dữ liệu.

**Nhưng trong 5 video này, giảng viên chủ yếu đang chuẩn bị nguyên liệu cho hệ thống đó.** Ông chưa thực hiện phần huấn luyện mô hình dự đoán giá ở đây.

Hãy tưởng tượng bạn muốn dạy một nhân viên mới định giá hàng hóa. Trước tiên, bạn cần chuẩn bị những phiếu sản phẩm rõ ràng, kèm giá để đối chiếu. Nếu phiếu đầy quảng cáo, ký hiệu và câu lặp lại, người học sẽ khó nhận ra những đặc điểm quan trọng. LLM trong buổi này đóng vai người biên tập lại các phiếu đó.

## 2. Mục tiêu của từng video

| Video | Nội dung chính | Vì sao cần học? | Điều cần hiểu sau bài |
|---|---|---|---|
| 007 | Chiến lược 5 bước áp dụng AI vào bài toán kinh doanh | Giúp chọn giải pháp dựa trên nhu cầu và kết quả đo | Biết bắt đầu từ yêu cầu, tiêu chí thành công và baseline |
| 008 | Bước đưa vào vận hành, MLOps và nhắc lại dự án | Kết quả tốt trong thử nghiệm chưa đủ để dùng lâu dài | Biết phải tiếp tục theo dõi chất lượng sau triển khai |
| 009 | Dùng LLM viết lại mô tả sản phẩm | Tạo đầu vào ngắn gọn, nhất quán cho mô hình học | Hiểu tiền xử lý và thử prompt trên một sản phẩm |
| 010 | So sánh một lần chạy local và xây luồng batch bằng JSONL | Đưa cách xử lý một sản phẩm lên quy mô nhiều sản phẩm | Hiểu từng dòng yêu cầu, mã định danh và cách nhận kết quả |
| 011 | Đóng gói, chạy 22.000 sản phẩm và lưu dataset hoàn chỉnh | Biến thử nghiệm nhỏ thành quy trình có thể lặp lại | Hiểu cách chia lô, ghép kết quả và kiểm tra dữ liệu |

## 3. Video 007 — Chiến lược 5 bước: bắt đầu từ đâu?

### Bước 1: Understand — Hiểu vấn đề

Câu “Tôi muốn làm một AI agent” mới nói về công nghệ muốn dùng. Cần diễn đạt được vấn đề, chẳng hạn: “Tôi muốn giảm thời gian tìm các sản phẩm có giá bán hấp dẫn”.

Những câu hỏi giảng viên yêu cầu đặt ra:

- Người dùng cần đạt được kết quả gì?
- Đo thành công bằng cách nào?
- Dữ liệu hiện có bao nhiêu, chất lượng ra sao, ở dạng nào?
- Hệ thống cần phục vụ bao nhiêu yêu cầu?
- Chờ kết quả bao lâu thì chấp nhận được?
- Ngân sách và thời hạn triển khai là bao nhiêu?

Ở dự án này, tác vụ được thu hẹp thành **nhận mô tả và dự đoán giá**. Giảng viên chọn độ chênh lệch tuyệt đối giữa giá dự đoán và giá tham chiếu để đánh giá.

**Ví dụ bổ sung:** giá tham chiếu 100 USD, dự đoán 120 USD thì sai số là 20 USD. Dự đoán 80 USD cũng sai 20 USD; ta không để sai số âm và dương triệt tiêu nhau.

Khi lấy trung bình sai số tuyệt đối trên nhiều sản phẩm, ta có **MAE — Mean Absolute Error, sai số tuyệt đối trung bình**. Ví dụ sai số 10, 20 và 30 USD cho MAE là 20 USD. Trong cùng tập đánh giá, MAE thấp hơn thường là tốt hơn.

Giá trong dataset là giá tham chiếu được thu thập, không mặc nhiên là “giá trị thật tuyệt đối” của món hàng. Với sản phẩm thực tế, còn phải xem dữ liệu giá có phù hợp thời điểm và thị trường hay không.

### Bước 2: Prepare — Chuẩn bị

Có ba việc chính:

1. **Xây baseline — mốc so sánh ban đầu.** Thử giải pháp có sẵn, quy tắc đơn giản hoặc machine learning truyền thống.
2. **Lập danh sách mô hình ứng viên.** Dựa vào đặc tính, benchmark và các đánh giá bên ngoài để thu hẹp lựa chọn.
3. **Curate dataset — tuyển chọn và tổ chức dữ liệu.** Chuẩn bị bộ dữ liệu đủ phù hợp để thử nghiệm và huấn luyện.

Ví dụ baseline do tôi bổ sung: dự đoán mọi chiếc tai nghe bằng giá trung vị của nhóm tai nghe trong dữ liệu huấn luyện. Cách này đơn giản nhưng tạo một cột mốc: mô hình phức tạp phải chứng minh được lợi ích so với nó.

**Baseline không bắt buộc là LLM.** Nếu cách đơn giản đã đáp ứng yêu cầu, bạn đã có một ứng viên giải pháp đáng cân nhắc.

### Bước 3: Select — Chọn mô hình bằng thực nghiệm

Bạn đem các ứng viên thử trên tác vụ và dữ liệu của mình. Một mô hình đứng đầu bảng xếp hạng tổng quát chưa chắc dự đoán giá sản phẩm tốt nhất, hoặc chưa chắc phù hợp ngân sách.

Bảng dưới là **số liệu giả định để minh họa cách ra quyết định**, không phải kết quả trong video:

| Phương án | Sai số trung bình | Chi phí và vận hành | Cách đọc |
|---|---:|---|---|
| Baseline đơn giản | 35 USD | Thấp | Mốc ban đầu |
| Mô hình A | 25 USD | Vừa | Có cải thiện rõ |
| Mô hình B | 24 USD | Cao hơn nhiều | Cần xem giảm thêm 1 USD sai số có đáng chi phí không |

### Bước 4: Customize / Apply — Điều chỉnh cách áp dụng

Giảng viên trình bày bốn nhóm kỹ thuật:

| Kỹ thuật | Hiểu đơn giản | Ví dụ cho bài toán giá | Có huấn luyện lại LLM trong chính kỹ thuật này không? |
|---|---|---|---|
| Prompting, multi-shot prompting | Viết yêu cầu rõ, đưa thêm các ví dụ mẫu | Cho vài cặp mô tả–giá rồi yêu cầu đoán sản phẩm mới | Không |
| RAG — Retrieval-Augmented Generation | Tìm dữ liệu liên quan rồi đưa vào ngữ cảnh trả lời | Cung cấp mô tả và giá của các sản phẩm tương tự | Không |
| Agentic AI — AI dùng công cụ và điều phối công việc | Cho hệ thống thực hiện nhiều bước, có thể để LLM chọn bước hoặc công cụ | Tìm thông tin sản phẩm, đối chiếu rồi đánh giá cơ hội | Không bắt buộc |
| Fine-tuning — Tinh chỉnh mô hình | Huấn luyện bổ sung mô hình có sẵn bằng dữ liệu phù hợp | Học từ nhiều cặp mô tả–giá | Có |

**Inference time — lúc sử dụng mô hình:** mô hình đã học xong và đang xử lý đầu vào. Prompting, RAG và cách điều phối agent trong bài cải thiện hệ thống ở giai đoạn này.

**Training time — lúc huấn luyện:** quá trình học điều chỉnh các tham số được huấn luyện của mô hình. Fine-tuning thuộc nhóm này.

Ví dụ: cho nhân viên một tài liệu để đọc khi trả lời giống RAG; tổ chức thêm các buổi luyện tập để nâng kỹ năng giống fine-tuning. Hai cách có thể kết hợp.

**Giải thích bổ sung về RAG và fine-tuning:** giảng viên đưa ra định hướng “bổ sung kiến thức thì nghĩ đến RAG, dạy kỹ năng thì nghĩ đến fine-tuning”. Đây là cách định hướng hữu ích, không phải ranh giới tuyệt đối. LLM trong hệ thống RAG vẫn có thể suy luận từ thông tin tìm được và kiến thức sẵn có. Fine-tuning cũng không bảo đảm luôn dự đoán tốt sản phẩm mới. Bạn vẫn phải kiểm tra trên dữ liệu chưa dùng để huấn luyện.

Thông điệp quan trọng là **thử nghiệm và đo**, có thể kết hợp kỹ thuật. Trong thực hành, chọn những thử nghiệm có cơ sở và phù hợp ngân sách, thay vì hiểu rằng dự án nào cũng bắt buộc thử mọi công nghệ.

## 4. Video 008 — Productionize và MLOps: chạy được chưa phải là xong

### Bước 5: Productionize — Đưa vào vận hành thực tế

Giảng viên đề cập hosting, kiến trúc triển khai, khả năng mở rộng, bảo mật, tuân thủ và theo dõi hệ thống.

**MLOps — vận hành hệ thống machine learning** bao gồm những công việc giúp mô hình được triển khai, theo dõi và cập nhật có kiểm soát. Trong hệ thống nhiều agent, còn cần biết các bước đã gọi mô hình hay công cụ nào và lỗi phát sinh ở đâu.

Ý chính nhất: **đánh giá không dừng sau khi chọn được mô hình**.

Ví dụ bổ sung: dữ liệu huấn luyện chứa giá tai nghe năm trước. Năm nay có mẫu mới và các mẫu cũ giảm giá. Hệ thống vẫn chạy bình thường nhưng dự đoán có thể kém chính xác hơn.

Giảng viên gọi hiện tượng chất lượng giảm khi thực tế lệch khỏi dữ liệu huấn luyện là **model drift**. Hiểu ở mức nhập môn: môi trường thay đổi, nên cách dự đoán từng tốt có thể không còn tốt như trước. Cần theo dõi sai số và xác định nguyên nhân trước khi quyết định cập nhật dữ liệu, cách xử lý hoặc huấn luyện lại.

### “Huấn luyện mô hình của riêng mình” trong khóa học nghĩa là gì?

Bài 008 giải thích rõ: phần sau sẽ lấy một mô hình đã được huấn luyện sẵn rồi tinh chỉnh bằng dữ liệu riêng. Đây không phải xây một ChatGPT từ con số không.

Phân biệt ba việc:

- **Gọi mô hình để viết lại mô tả:** inference, đang thực hiện trong buổi này.
- **Lấy mô hình có sẵn và huấn luyện bổ sung:** fine-tuning, sẽ làm ở các bài sau.
- **Bắt đầu từ mô hình chưa học và huấn luyện từ đầu:** training from scratch, khác với lộ trình thực hành này.

Giảng viên cũng đưa ba cách theo học: chỉ hiểu quy trình; thực hành với bản dữ liệu nhỏ; hoặc xử lý toàn bộ và tự thử nghiệm cải thiện kết quả. Không bắt buộc tự chạy toàn bộ dữ liệu để hiểu bài.

## 5. Video 009 — Vì sao dùng LLM để làm sạch dữ liệu?

### 5.1. Dữ liệu thô có vấn đề gì?

Dữ liệu là mô tả sản phẩm thu thập từ Amazon, được lấy qua bộ dữ liệu trên Hugging Face. Các mô tả có thể dài, lặp, nhiều mã và không thống nhất cách trình bày.

**Data curation — tuyển chọn dữ liệu:** quyết định giữ những bản ghi nào và tổ chức bộ dữ liệu ra sao.

**Data pre-processing — tiền xử lý dữ liệu:** biến đổi những bản ghi đã chọn sang dạng phù hợp hơn cho bước tiếp theo. Buổi này tập trung vào tiền xử lý phần mô tả.

Ví dụ minh họa do tôi viết:

```text
TAI NGHE ABC!!! Chất lượng tuyệt vời, mua ngay!!!
Bluetooth 5.3. Pin 30 giờ. Màu đen. Chống ồn chủ động.
Tai nghe không dây. Thiết kế đẹp! Pin 30 giờ!
```

Sau khi viết lại:

```text
Title: Tai nghe không dây ABC
Category: Tai nghe
Brand: ABC
Description: Tai nghe Bluetooth có chống ồn chủ động.
Details: Bluetooth 5.3; pin 30 giờ; màu đen.
```

Mục tiêu không chỉ là rút ngắn. Ta muốn **giữ đặc điểm hữu ích để định giá và giảm phần gây nhiễu**.

- **Signal — thông tin hữu ích:** thương hiệu, dung lượng, chất liệu, kích thước, số lượng trong gói, tình trạng sản phẩm…
- **Noise — thông tin nhiễu:** câu quảng cáo, câu lặp hoặc phần không giúp phân biệt sản phẩm.

Không nên mặc định mọi mã sản phẩm đều vô ích: một mã model có thể phân biệt hai phiên bản giá rất khác nhau. Video yêu cầu bỏ part numbers trong prompt; đó là lựa chọn của thí nghiệm, cần đánh giá nếu áp dụng sang dữ liệu khác.

### 5.2. LLM đang làm công việc nào?

Ở đây có **hai vai trò khác nhau**:

| Vai trò | Nhận gì? | Trả gì? | Xuất hiện ở đâu? |
|---|---|---|---|
| LLM biên tập dữ liệu | Mô tả thô | Mô tả ngắn, theo mẫu | Thực hành hiện tại |
| Mô hình dự đoán giá | Mô tả đã xử lý | Giá ước tính | Các bước tiếp theo của dự án |

LLM viết lại hàng nghìn mô tả không có nghĩa nó đang tự học cách dự đoán giá. Ta đang dùng khả năng đã có của nó để tạo dữ liệu đầu vào tốt hơn cho việc học sau này.

### 5.3. Prompt yêu cầu điều gì?

Giảng viên yêu cầu tạo mô tả súc tích, bỏ part numbers và chỉ trả theo các mục:

| Nhãn gốc | Nghĩa tiếng Việt |
|---|---|
| Title | Tên sản phẩm |
| Category | Nhóm sản phẩm |
| Brand | Thương hiệu |
| Description | Mô tả chính |
| Details | Chi tiết |

**System prompt** là chỉ dẫn chung áp dụng cho mọi sản phẩm. **User message** chứa mô tả cụ thể cần xử lý.

Mẫu hướng dẫn tiếng Việt sau là **bổ sung để minh họa**, không phải nguyên văn prompt trong video:

```text
Viết lại mô tả sản phẩm ngắn gọn theo các mục:
Title, Category, Brand, Description, Details.
Giữ các thông số có ảnh hưởng đến giá và số lượng trong gói.
Không tự thêm đặc điểm không có trong nguồn.
Nếu không có thông tin thương hiệu, ghi “Không rõ”.
Không đưa giá vào bản mô tả dùng làm đầu vào dự đoán giá.
```

Giảng viên dùng mẫu văn bản có nhãn thay vì JSON để giữ đầu ra gọn. Ông có nhắc **structured outputs — đầu ra có cấu trúc được ràng buộc**, và sẽ quay lại sau.

Điểm cần phân biệt: prompt “hãy trả JSON” chỉ là yêu cầu bằng lời; cơ chế structured outputs có thể ràng buộc cấu trúc theo khả năng API. Dù cấu trúc đúng, nội dung vẫn có thể sai. Và JSON không phải lúc nào cũng gây chi phí cao đáng kể; phải đo trên mẫu và mô hình cụ thể.

### 5.4. Groq, mô hình và thư viện là ba thứ khác nhau

| Tên trong bài | Vai trò |
|---|---|
| Groq, có chữ **q** | Nền tảng chạy mô hình và cung cấp API |
| GPT-OSS 20B | Mô hình giảng viên dùng để viết lại mô tả qua Groq |
| LiteLLM | Thư viện giúp gọi các mô hình qua cách dùng tương đối thống nhất |
| Ollama | Công cụ chạy mô hình trên máy cá nhân trong phần thử local |
| Llama 3.2 | Mô hình local được thử trong bài 010 |
| Hugging Face Hub | Nơi lấy và chia sẻ dataset trong quy trình của bài |

Phụ đề tự động có chỗ ghi “grok”, “light LM”, “a lama” hoặc “a genetic AI”. Trong ngữ cảnh này chúng lần lượt được chuẩn hóa thành Groq, LiteLLM, Ollama và Agentic AI. **Groq trong bài không phải Grok của xAI.**

## 6. Video 010 — Từ một yêu cầu sang xử lý batch

### 6.1. Vì sao thử local trước?

Giảng viên thử cùng nhiệm vụ với Llama 3.2 qua Ollama. Trong ví dụ được trình diễn, đầu ra local không bám định dạng tốt bằng GPT-OSS 20B: cách viết tiêu đề và phân loại chưa như mong muốn.

Đây là quan sát trên mẫu thử, không đủ để kết luận mọi mô hình local đều kém hơn. Lựa chọn cần tính cả chất lượng, thời gian chạy và chi phí. Chạy local không trả phí API cho từng yêu cầu nhưng vẫn sử dụng máy, điện và thời gian.

Bài cũng lưu ý số output tokens có thể gồm **reasoning tokens — token dùng trong quá trình suy luận**, nên không nhất thiết bằng số token của đoạn câu trả lời nhìn thấy. Đây là lời giải thích giảng viên đưa ra cho số liệu trong lần chạy của mình.

### 6.2. Batch processing — xử lý theo lô là gì?

Hãy hình dung bạn có 22.000 phiếu sản phẩm cần biên tập:

- Với cách gọi riêng từng yêu cầu, chương trình gửi từng phiếu và quản lý từng phản hồi.
- Với batch, bạn lập một tập yêu cầu, gửi thành một công việc rồi quay lại lấy kết quả khi hoàn tất.

**Một batch chứa nhiều yêu cầu độc lập.** Không phải nhét 1.000 sản phẩm vào cùng một prompt để nhận một câu trả lời chung.

**Asynchronous — bất đồng bộ** nghĩa là sau khi gửi việc, bạn không phải giữ một cuộc gọi mở chờ toàn bộ kết quả. Hệ thống trả mã công việc để bạn kiểm tra sau.

Theo video, chế độ batch được giảm khoảng 50% chi phí và có cửa sổ hoàn thành 24 giờ. Đây là điều kiện mà giảng viên sử dụng trong bài. Hoàn thành rất nhanh trong lần demo không có nghĩa mọi lần chạy đều nhanh như vậy.

Batch phù hợp với chuẩn bị dataset, phân loại hàng loạt hoặc tổng hợp tài liệu khi không cần trả lời tức thì. Hộp chat cần phản hồi ngay có yêu cầu thời gian khác.

### 6.3. JSONL là gì, và tại sao cần nó?

**JSON** là cách biểu diễn dữ liệu có tên trường và giá trị. **JSONL — JSON Lines** là định dạng mà mỗi dòng chứa một đối tượng JSON độc lập.

Ví dụ dưới đây chỉ minh họa định dạng, **không phải request đầy đủ để gửi API**:

```jsonl
{"custom_id":"0","text":"Mô tả tay nắm cửa"}
{"custom_id":"1","text":"Mô tả tai nghe"}
{"custom_id":"2","text":"Mô tả bình giữ nhiệt"}
```

Trong file batch của bài, mỗi dòng còn mô tả một lần gọi mô hình: phương thức, endpoint, model, messages và tùy chọn liên quan.

| Thành phần | Ý nghĩa đơn giản |
|---|---|
| `custom_id` | Mã do mình gán để biết yêu cầu thuộc sản phẩm nào |
| `method` | Loại thao tác gửi yêu cầu, trong bài là POST |
| `url` / endpoint | Địa chỉ chức năng API cần gọi |
| `body` | Nội dung yêu cầu |
| `model` | Mô hình cần sử dụng |
| `messages` | Chỉ dẫn chung và mô tả sản phẩm |

Một file chứa 1.000 dòng như vậy tương ứng 1.000 yêu cầu xử lý. Việc xuống dòng do trình soạn thảo tự ngắt hiển thị không làm một bản ghi thành nhiều dòng dữ liệu thực.

### 6.4. Toàn bộ quy trình batch trong bài

1. **Tạo file JSONL ở máy:** mỗi sản phẩm thành một yêu cầu có mã riêng.
2. **Upload file lên Groq:** nhận `file_id`, tức mã của file đã gửi.
3. **Tạo batch từ file đó:** nhận `batch_id`, tức mã của công việc xử lý.
4. **Kiểm tra trạng thái batch:** xem công việc đã xong chưa.
5. **Tải file đầu ra khi hoàn tất:** lấy kết quả trả về của các yêu cầu.
6. **Đọc kết quả và ghép vào sản phẩm:** dùng `custom_id` để đặt mô tả vào đúng bản ghi.

Các tên thao tác được nhắc trong bài như `files.create`, `batches.create`, `batches.retrieve`, `files.content` giúp nhận diện các bước. Tài liệu này giải thích luồng, không cung cấp chương trình API đã được kiểm thử cho phiên bản hiện tại.

### 6.5. Vì sao `custom_id` cực kỳ quan trọng?

Kết quả không nhất thiết giữ thứ tự đầu vào.

| Thứ tự gửi | Sản phẩm | Một thứ tự trả về có thể xảy ra |
|---|---|---|
| ID 0 | Tay nắm cửa | ID 2: bình giữ nhiệt |
| ID 1 | Tai nghe | ID 0: tay nắm cửa |
| ID 2 | Bình giữ nhiệt | ID 1: tai nghe |

Nếu lấy “dòng kết quả đầu tiên” gắn cho “sản phẩm đầu tiên”, bạn có thể gắn mô tả bình giữ nhiệt vào tay nắm cửa. File trông vẫn đầy đủ nhưng dữ liệu đã sai.

Cách đúng là đọc mã: kết quả có `custom_id = 2` thuộc về sản phẩm mang ID 2.

**Giải thích bổ sung:** trong demo, ID là vị trí trong danh sách. Nếu dùng cách đó, phải giữ nguyên danh sách và thứ tự trong suốt quá trình. Một quy trình lâu dài nên giữ mã sản phẩm ổn định để không phụ thuộc vào vị trí.

## 7. Video 011 — Mở rộng lên 22.000 sản phẩm

### 7.1. Chạy thử 1.000 trước rồi mới mở rộng

Sau khi lấy kết quả lô đầu, giảng viên kiểm tra `summary` đã có ở các phần tử từ 0 đến 999. Phần tử 1000 chưa có vì chưa thuộc lô đó.

Ông đóng gói quy trình vào một module `batch` để tái sử dụng:

| Nhóm công việc trong module | Công dụng |
|---|---|
| Tạo từng dòng và tạo file | Biến sản phẩm thành yêu cầu JSONL |
| Gửi file và tạo batch | Bắt đầu công việc trên nền tảng |
| Kiểm tra trạng thái | Biết batch đã sẵn sàng để lấy kết quả chưa |
| Tải đầu ra | Lưu các phản hồi |
| Áp dụng đầu ra | Ghép summary vào đúng sản phẩm |

Đây là tổ chức mã để lặp lại quy trình thuận tiện hơn; không phải thêm một kỹ thuật huấn luyện AI mới.

Trong demo, mỗi file có 1.000 yêu cầu. Với 22.000 sản phẩm, ta có 22 batch. **1.000 là lựa chọn của giảng viên, không phải định nghĩa batch hay giới hạn chung của API.**

Giảng viên gửi các lô, kiểm tra tiến độ nhiều lần rồi nhận đủ 22/22. Thanh tiến độ `tqdm` giúp nhìn thấy tiến trình của vòng lặp; hoàn tất bước gửi vẫn cần kiểm tra xem các công việc từ xa đã xong chưa.

### 7.2. Light và Full khác nhau thế nào?

| Bộ dữ liệu trong bài | Train — huấn luyện | Validation — phát triển/điều chỉnh | Test — kiểm tra cuối | Tổng |
|---|---:|---:|---:|---:|
| Light | 20.000 | 1.000 | 1.000 | 22.000 |
| Full | 800.000 | 10.000 | 10.000 | 820.000 |

Trong lời nói, giảng viên có lúc gọi gọn “20.000” hoặc “800.000”, đang nói về phần train. Tổng số bản ghi được xử lý còn gồm validation và test.

Ví dụ ví von:

- **Train:** bài tập để học.
- **Validation:** bài kiểm tra thử để chọn cách học và điều chỉnh.
- **Test:** bài kiểm tra cuối để đánh giá khách quan sau khi chốt lựa chọn.

Bài nạp các phần lại để xử lý mô tả hàng loạt. Điều đó **không có nghĩa dùng toàn bộ chúng để huấn luyện**. Khi lưu và sử dụng, vẫn phải bảo toàn ranh giới các tập.

### 7.3. Những con số chi phí nên hiểu ra sao?

| Số liệu giảng viên nói | Ngữ cảnh |
|---|---|
| 446 input tokens, 125 output tokens | Một lần gọi thử ở bài 009 |
| 0,011 cent | Chi phí của lần gọi thử đó, không phải 0,011 USD |
| Dưới 1 USD | Lần xử lý bản Light khoảng 22.000 sản phẩm bằng batch |
| Khoảng hoặc dưới 30 USD | Lần xử lý bản Full khoảng 820.000 sản phẩm |
| Vài giờ | Thời gian giảng viên kể đã chờ bản Full |

**Đổi đơn vị:** 0,011 cent = 0,00011 USD. Nhầm cent với USD sẽ làm con số lệch 100 lần.

Một sản phẩm không đại diện cho độ dài trung bình của toàn bộ dataset. Vì vậy không thể nhân đúng chi phí ví dụ duy nhất rồi yêu cầu tổng phải khớp con số thực tế giảng viên kể.

Nguyên tắc ước tính là cộng chi phí token đầu vào và đầu ra, tính mức giá áp dụng cho chế độ chạy đó, rồi tính thêm các yêu cầu phải chạy lại. Giảm số lần gửi file không đồng nghĩa giảm số yêu cầu: 22 batch vẫn chứa tổng cộng 22.000 yêu cầu trong demo.

### 7.4. Kết quả cuối buổi là gì?

Mỗi sản phẩm đã có trường `summary`. Giảng viên kiểm tra không còn summary rỗng, xem vài ví dụ trước–sau, rồi lưu bộ dữ liệu đã xử lý lên Hugging Face.

Các tên dataset được nhắc trong lời giảng chuyển từ `items raw light/full` sang `items light/full`. Đây là tên được nhắc trong phụ đề; tài liệu không tự suy ra URL hoặc tên repository chính xác.

Ở bản xuất cuối, giảng viên bỏ trường mô tả `full` và ID tạm vì không cần cho các bước sau của demo. **Bổ sung khi tự làm:** nên giữ một bản dữ liệu thô riêng để có thể đối chiếu và xử lý lại nếu phát hiện mô tả bị sai.

Kết thúc phần này, sản phẩm tạo ra là **dataset đã tiền xử lý**, chưa phải mô hình dự đoán giá hoàn chỉnh. Buổi sau mới đi vào baseline với machine learning truyền thống, có nhắc Random Forest và XGBoost.

## 8. Giải thích bổ sung — Làm sao biết dữ liệu viết lại thực sự tốt?

Giảng viên kỳ vọng mô tả gọn, rõ sẽ giúp dự đoán tốt hơn. Tuy nhiên, “đọc thấy hay hơn” chưa chứng minh được chất lượng mô hình tăng.

### 8.1. Tránh làm mất thông tin quyết định giá

Nếu nguồn ghi “gói 12 chiếc” mà summary chỉ còn “một chiếc”, mô tả mới sẽ gây hiểu nhầm. Tương tự với bộ phận thay thế so với sản phẩm hoàn chỉnh, dung lượng, chất liệu hoặc tình trạng đã qua sử dụng.

Nên đối chiếu mẫu ở nhiều loại sản phẩm và nhiều độ dài, thay vì chỉ xem một kết quả đẹp.

### 8.2. Không để LLM tự bịa thông số

Nguồn không ghi thương hiệu thì không nên suy đoán một thương hiệu nổi tiếng. Một summary có đủ 5 nhãn vẫn có thể sai sự thật.

Kiểm tra “không rỗng” như trong demo chỉ xác nhận có đầu ra, chưa xác nhận đầu ra chính xác.

### 8.3. Tránh data leakage — rò rỉ đáp án

Trong bài toán dự đoán giá, **giá là đáp án để huấn luyện và đánh giá, không phải nội dung đầu vào để đoán**.

Nếu mô tả còn câu “giá 99 USD” và summary giữ lại, mô hình có thể nhìn thấy đáp án. Kết quả đánh giá lúc đó dễ đẹp giả tạo.

Tiền xử lý từng bản ghi bằng cùng quy tắc cố định có thể áp dụng cho cả train, validation và test, nhưng cần giữ giá mục tiêu ngoài prompt viết lại, bảo toàn các tập, và không liên tục chỉnh prompt dựa trên điểm test. Dùng validation để phát triển; giữ test cho đánh giá cuối.

### 8.4. Giữ cách xử lý nhất quán khi sử dụng thật

Nếu huấn luyện trên mô tả theo mẫu Title/Category/Brand/Description/Details, dữ liệu sản phẩm mới cũng nên đi qua cách xử lý tương ứng. Bài 009 có nhắc áp dụng lại tiền xử lý khi inference trên sản phẩm mới.

Nếu huấn luyện bằng dữ liệu sạch nhưng khi chạy thật lại đưa văn bản thô rất khác, bạn đã đổi điều kiện đầu vào của mô hình.

### 8.5. Kiểm tra kết quả batch trước khi ghép

Một quy trình chắc chắn hơn demo cần xác nhận:

- Mỗi ID mong đợi có kết quả và không bị trùng ngoài ý muốn.
- Yêu cầu có lỗi được nhận diện trước khi đọc nội dung.
- Kết quả được ghép bằng ID, đúng sản phẩm.
- Những yêu cầu thiếu hoặc lỗi có thể chạy lại riêng.

Cuối cùng, so sánh mô hình dùng dữ liệu thô với mô hình dùng dữ liệu đã viết lại trên cùng cách đánh giá. Đó mới là bằng chứng cho giá trị của tiền xử lý.

## 9. Tự kiểm tra xem bạn đã hiểu bài chưa

**1. Gửi 22.000 mô tả cho Groq có phải đang fine-tune không?**  
Không. Trong phần này, đó là 22.000 yêu cầu inference để viết lại dữ liệu.

**2. Một batch 1.000 yêu cầu có phải một prompt chứa 1.000 sản phẩm không?**  
Không. Nó chứa 1.000 yêu cầu độc lập được gửi theo lô.

**3. Vì sao tạo baseline trước?**  
Để biết giải pháp phức tạp hơn có cải thiện đủ đáng giá hay không.

**4. Vì sao phải ghép bằng `custom_id`?**  
Vì thứ tự trả kết quả có thể khác thứ tự gửi.

**5. Summary ngắn hơn có chắc tốt hơn không?**  
Không. Nó phải giữ đúng thông tin hữu ích và cần được kiểm chứng bằng kết quả đánh giá.

**6. Thành quả chính sau 5 video là gì?**  
Hiểu quy trình dự án AI và có dữ liệu mô tả được chuẩn hóa để dùng cho các bước huấn luyện, đánh giá sau đó.

## 10. Mốc xem lại trong video

Các mốc dưới đây lấy từ phụ đề; có thể chênh nhẹ với vị trí thao tác trên màn hình.

| Video | Mốc | Nội dung |
|---|---|---|
| 007 | 01:24–04:58 | Quy trình 5 bước, hiểu yêu cầu, baseline và chọn mô hình |
| 007 | 04:58–10:28 | Các kỹ thuật áp dụng, inference và training, RAG và fine-tuning |
| 008 | 00:35–02:05 | Productionize, MLOps và tiếp tục đánh giá |
| 008 | Từ 02:52 | Nhắc bài toán dự đoán giá và lộ trình dự án |
| 009 | Từ 04:41 | Prompt chuẩn hóa mô tả |
| 009 | Từ 07:30 | Ví dụ đầu ra và số liệu token, chi phí |
| 010 | Từ 02:00 | Giải thích reasoning tokens trong lần chạy |
| 010 | Từ 03:37 | JSONL và từng yêu cầu batch |
| 010 | Từ 09:03 | Tạo batch, chờ và lấy kết quả |
| 010 | Từ 10:54 | Thứ tự đầu ra và ghép kết quả bằng ID |
| 011 | Từ 04:27 | Chạy 22 lô cho bản Light |
| 011 | Từ 07:26 | Kiểm tra summary và xem dữ liệu đã xử lý |
| 011 | Từ 11:33 | Chi phí, thời gian bản Full và kết thúc phần dữ liệu |

## 11. Nguồn sử dụng

Toàn bộ phụ đề tiếng Anh của các tệp sau do bạn cung cấp:

1. `007 Day 2 - Five-Step Strategy for Selecting and Applying LLMs to Business Problems.srt`
2. `008 Day 2 - The Five-Step AI Process & Productionizing with MLOps.srt`
3. `009 Day 2 - Data Pre-processing with LLMs and Groq Batch Mode.srt`
4. `010 Day 2 - Batch Processing with Groq API and JSONL Files for LLM Workflows.srt`
5. `011 Day 2 - Batch Processing with Groq Running 22K LLM Requests for Under $1.srt`

Tài liệu diễn giải lại mục đích và các bước trong bài, lược bỏ câu lặp và lời dẫn. Các lưu ý về rò rỉ đáp án, kiểm tra dữ liệu, giới hạn suy luận từ một mẫu thử và ví dụ minh họa là phần giảng giải bổ sung.
