# Day 2 — Chuẩn bị dữ liệu và kiểm tra LLaMA trước khi fine-tuning

> Bản giảng đầy đủ cho bốn video 007–010. Biên soạn từ toàn bộ phụ đề tiếng Anh bạn cung cấp, tổ chức lại theo mạch học dễ hiểu; không phải bản dịch từng câu hay bản chép toàn bộ mã trên màn hình. Các ví dụ tự tạo và phần giải thích bổ sung được ghi rõ. Số liệu thực nghiệm thuộc lần chạy của giảng viên.

## 1. Rốt cuộc bốn video muốn dạy điều gì?

**Mục tiêu: chuẩn bị để một mô hình LLaMA nhỏ học kỹ năng đọc mô tả sản phẩm và ước lượng giá.** Trước khi huấn luyện, cần làm hai việc: tạo bộ bài tập đúng định dạng và đo xem mô hình hiện tại làm bài tốt đến đâu.

Ví dụ tự tạo:

- Đầu vào: “Bàn phím cơ, kết nối Bluetooth, thương hiệu X, còn mới”.
- Đầu ra mong muốn: một mức giá, chẳng hạn `80.00` đô la.
- Sau fine-tuning: hy vọng mô hình đoán giá sát hơn trên những sản phẩm chưa dùng để huấn luyện.

Hãy tưởng tượng tuyển một nhân viên biết đọc hiểu nhưng chưa giỏi định giá. Bạn chuẩn bị hồ sơ sản phẩm kèm giá mẫu, rút gọn hồ sơ quá dài, thống nhất cách ghi đáp án và cho nhân viên làm bài kiểm tra đầu vào. **Bốn video này chủ yếu thực hiện những bước chuẩn bị đó. Buổi huấn luyện chính nằm ở phần tiếp theo.**

| Video | Thao tác chính | Điều cần hiểu |
| --- | --- | --- |
| 007 — Preparing Your Dataset for Fine-Tuning with Token Limits | Đếm token, cắt mô tả dài, tạo `prompt` và `completion` | Dữ liệu phải vừa đủ thông tin và phù hợp tài nguyên |
| 008 — Rounding Prices and Token Length Optimization | Làm tròn giá, đo lại độ dài toàn mẫu | Cách biểu diễn đáp án ảnh hưởng điều mô hình học |
| 009 — Preparing Hugging Face Datasets and Testing Base LLaMA 3.2 | Lưu dữ liệu, tải mô hình 4-bit, thử dự đoán | Có dữ liệu sẵn và có kết quả trước huấn luyện |
| 010 — Base Models vs Chat Models | Giải thích loại mô hình, đánh giá baseline | Chọn mô hình phù hợp và có mốc đo tiến bộ |

Đây là **fine-tuning một mô hình có sẵn**, không phải huấn luyện một ChatGPT từ con số không. “AI của riêng mình” ở đây là mô hình được điều chỉnh cho một nhiệm vụ riêng; không có nghĩa tự tạo toàn bộ kiến thức nền hay tự động giỏi mọi việc.

## 2. Biến dữ liệu sản phẩm thành “đề bài + đáp án”

### Dataset, prompt và completion là gì?

**Dataset — bộ dữ liệu:** tập hợp nhiều ví dụ. Mỗi ví dụ trong bài có mô tả sản phẩm và giá đã biết.

**Prompt — phần đưa vào:** mô tả điều mô hình cần làm và thông tin sản phẩm.

**Completion — phần cần viết tiếp:** đáp án mà ta muốn mô hình học cách tạo ra.

Ví dụ tự tạo, giữ cấu trúc tiếng Anh của bài học:

```text
prompt:
What does this cost to the nearest dollar?
Title: Wireless keyboard
Category: Electronics
Brand: ExampleBrand
Description: Compact rechargeable Bluetooth keyboard.
Price is $

completion:
80.00
```

Nghĩa tiếng Việt: “Sản phẩm này có giá bao nhiêu, làm tròn đến đô la gần nhất? … Giá là $”. Mô hình cần nối thêm `80.00`.

**Vì sao prompt dừng ở `Price is $`?** Vì đây là mô hình sinh tiếp văn bản. Ta đặt nó vào đúng vị trí mà phần tiếp theo nên là giá, thay vì để nó tự chọn trả lời bằng một đoạn dài.

Trong huấn luyện, mô hình có thể được cung cấp chuỗi gồm đề và đáp án để học dự đoán token tiếp theo. Trong kiểm tra, chỉ đưa đề; giá thật được giữ riêng để chấm. Nếu đưa luôn giá thật vào đầu vào khi kiểm tra, kết quả không còn phản ánh khả năng dự đoán.

**Bổ sung:** hai cột `prompt` và `completion` là một định dạng được SFTTrainer của thư viện TRL hỗ trợ. Không phải mọi công cụ trên Hugging Face đều bắt buộc dùng hai cột này. Cách tính loss trên phần đáp án hay toàn chuỗi phụ thuộc định dạng, cấu hình và phiên bản trainer. [Tài liệu SFTTrainer](https://huggingface.co/docs/trl/en/sft_trainer).

### Vì sao chia train, validation và test?

| Tập | Cách hình dung | Vai trò |
| --- | --- | --- |
| Train — huấn luyện | Bài tập có đáp án để luyện | Dùng để cập nhật các tham số được huấn luyện |
| Validation — xác thực | Bài kiểm tra thử | Theo dõi chất lượng, chọn cấu hình hoặc checkpoint |
| Test — kiểm tra | Bài thi cuối | Đánh giá chất lượng trên dữ liệu giữ lại |

Quy mô trong video:

| Phiên bản | Train | Validation | Test | Tổng |
| --- | ---: | ---: | ---: | ---: |
| Lite | 20.000 | 1.000 | 1.000 | 22.000 |
| Full | 800.000 | 10.000 | 10.000 | 820.000 |

Lite giúp thử quy trình nhanh; Full dùng nhiều ví dụ hơn và cần nhiều thời gian xử lý hơn. Nhiều dữ liệu không tự động bảo đảm tốt hơn nếu dữ liệu sai hoặc không liên quan.

**Bổ sung:** nên dùng validation để chọn cách cắt token, cấu hình và checkpoint; hạn chế điều chỉnh dựa vào test. Các mô tả trùng hoặc gần trùng giữa train và test cũng có thể khiến điểm số đẹp hơn năng lực thực tế.

## 3. Video 007: Vì sao phải giới hạn mô tả ở 110 token?

### Token không phải từ hay ký tự

**Token** là đơn vị văn bản mô hình xử lý. **Tokenizer** là bộ chuyển văn bản thành token và token ID. Một từ có thể chiếm một hoặc nhiều token; chữ số, dấu câu và ngôn ngữ cũng ảnh hưởng cách chia.

Vì vậy, quy định “không quá 4.000 ký tự” chưa cho biết chính xác văn bản sẽ có bao nhiêu token. Phải đo bằng tokenizer của mô hình sẽ sử dụng.

Trong tập Lite, giảng viên thấy phần lớn mô tả ngắn, nhưng mẫu dài nhất đạt khoảng **245 token**. Trong tập Full, độ dài trung bình được báo là **86,6 token**, còn một mẫu bất thường lên tới **4.582 token**, chứa nhiều mã sản phẩm.

Phụ đề có chỗ so sánh mẫu này với giới hạn 4.000 ký tự ở bước trước. Không có dữ liệu gốc để xác minh giới hạn đó đã được áp dụng thế nào; bài học cần giữ là **đếm token thực tế, không suy từ số ký tự**.

### Padding và truncation giải quyết hai việc khác nhau

- **Padding — đệm:** thêm vị trí đệm để các chuỗi trong một nhóm xử lý có chiều dài phù hợp.
- **Truncation — cắt ngắn:** bỏ bớt phần vượt giới hạn.
- **Batch — lô:** nhóm ví dụ được xử lý cùng nhau.

Ví dụ tự tạo: một lô có các mô tả dài 70, 90 và 245 token. Nếu đệm cả lô đến 245, hai mẫu ngắn phải có nhiều vị trí đệm. Nếu giới hạn mô tả ở 110, mẫu dài bị cắt nhưng lô gọn hơn.

Đánh đổi nằm ở đây: **giữ dài hơn có thể giữ được nhiều thông tin; giữ ngắn hơn thường tiết kiệm bộ nhớ và thời gian.**

Giảng viên chọn **110 token cho phần mô tả**, sau khi xem những phần bị cắt và nhận thấy tiêu đề, loại hàng, thương hiệu cùng thông tin chính thường đã xuất hiện sớm. Đây là lựa chọn cho dữ liệu này, không phải con số chuẩn cho mọi dự án.

Ví dụ tự tạo về nguy cơ cắt sai: nếu cuối mô tả ghi “bị hỏng, chỉ bán linh kiện” mà bị bỏ mất, mô hình có thể định giá quá cao. Vì vậy, cần xem cả nội dung bị bỏ chứ không chỉ nhìn biểu đồ.

**Bổ sung kỹ thuật:** không phải mọi pipeline đều đệm toàn bộ dữ liệu đến một độ dài cố định. Có thể đệm theo mẫu dài nhất của từng batch; mức tốn bộ nhớ cũng phụ thuộc batch size, attention và cách triển khai. Do đó, không nên hiểu lời giải thích trong video thành quy luật “tổng VRAM luôn tăng tuyến tính chính xác theo giới hạn token”. [Tài liệu padding và truncation](https://huggingface.co/docs/transformers/v4.29.0/en/pad_truncation).

### Chỗ số liệu trong phụ đề cần đọc thận trọng

Phụ đề nêu 1.255 mẫu trên 20.000 bị cắt nhưng đồng thời nói khoảng 5,7%. Phép chia thực tế là **6,275%**. Với tập Full, lời nói nêu khoảng 47.000 trên 800.000, tương đương khoảng **5,875%** nếu lấy các số này đúng như đã nói.

Có thể có số làm tròn hoặc lỗi lời nói/phụ đề. Kết luận đáng nhớ là **một phần nhỏ các mẫu bị cắt**, không cần học thuộc tỷ lệ 5,7% như một thông số chính xác.

## 4. Video 008: Vì sao làm tròn giá khi huấn luyện?

### Mô hình đang học chọn token, không trực tiếp tối thiểu hóa sai số tiền

Bài toán nghiệp vụ là **regression — hồi quy**, tức dự đoán một đại lượng số. Tuy nhiên, LLM thực hiện việc này bằng **next-token prediction — dự đoán token tiếp theo**.

Hình dung mô hình có một bảng rất lớn các token và phải phân phối xác suất cho token nào xuất hiện tiếp. Ở bước đó, nó đang thực hiện một lựa chọn dạng phân loại trên vốn token. Một con số giá có thể cần một hoặc nhiều lựa chọn như vậy.

**Loss — hàm mất mát** trong huấn luyện ngôn ngữ thông thường chấm mức phù hợp của token dự đoán với token đáp án. Nó không mặc nhiên chấm bằng số đô la đoán sai.

Ví dụ tự tạo: với giá thật 80 đô la, đoán 81 đô la gần hơn nhiều so với 800 đô la về mặt tiền. Nhưng loss token thông thường không có sẵn quy tắc “sai 800 thì phạt gấp 720 lần sai 81”. Mô hình có thể học quan hệ số từ dữ liệu; chỉ là mục tiêu huấn luyện không trực tiếp đồng nhất với khoảng cách tiền tệ.

### Bỏ phần cent để tập trung vào mức giá chính

Nếu yêu cầu học `79.83`, mô hình phải học cả phần đô la lẫn phần cent. Giảng viên muốn tập trung năng lực vào mức giá chính nên đổi đáp án huấn luyện thành giá làm tròn, ví dụ `80.00`.

| Giá gốc — ví dụ tự tạo | Đáp án train/validation | Giá giữ lại để chấm test |
| --- | --- | --- |
| 79.83 | 80.00 | 79.83 |
| 64.12 | 64.00 | 64.12 |
| 219.00 | 219.00 | 219.00 |

Đây là **làm tròn đến đô la gần nhất**, không phải luôn làm tròn lên. Việc hiển thị `.00` không có nghĩa mô hình đang học đoán cent biến thiên; phần đó đã trở thành cố định.

Thông điệp của giảng viên là: đừng bắt mô hình dành công sức cho chi tiết không quan trọng đối với mục tiêu. Đây là giả thuyết thiết kế cần kiểm chứng bằng thực nghiệm, không phải bảo đảm mọi bộ dữ liệu đều tốt hơn khi làm tròn.

**Lưu ý:** sai số tối đa do riêng thao tác làm tròn gần nhất là khoảng 0,50 đô la. Điều này không có nghĩa mô hình sau huấn luyện sẽ dự đoán sai dưới 0,50 hay 1 đô la; nó vẫn có thể đoán nhầm mức giá rất xa.

### Vì sao test phải giữ giá thật?

Để các mô hình được chấm trên cùng đáp án gốc. Nếu thí nghiệm trước chấm với 79.83 mà thí nghiệm mới đổi thành 80.00, ta đã thay cả tiêu chuẩn so sánh.

Trong quy trình video:

- Train và validation dùng giá làm tròn để phù hợp mục tiêu học.
- Test giữ giá thật để tính kết quả so sánh.
- Phần mô tả vẫn được xử lý theo cùng quy tắc; “không làm tròn test” nói về **giá**, không có nghĩa bỏ mọi bước tiền xử lý test.

### Lợi thế tokenizer của LLaMA trong bài này

Giảng viên nêu rằng tokenizer LLaMA dùng trong thí nghiệm có thể biểu diễn các số nguyên từ 0 đến 999 bằng một token. Khi phần giá nguyên nằm trong phạm vi này, dự đoán phần đó có thể gọn thành một bước chọn token.

Cần phân biệt **phần số nguyên**, chẳng hạn `219`, với toàn chuỗi `219.00`, ký hiệu `$`, khoảng trắng hoặc token kết thúc. Không được suy ra toàn đáp án lúc nào cũng chỉ có một token. Khi đổi mô hình hoặc định dạng, phải đếm lại.

## 5. Từ 110 token mô tả đến 128 token toàn mẫu

Đây là ba con số dễ bị nhầm nhất:

| Con số | Đại diện cho điều gì? |
| --- | --- |
| 110 | Giới hạn phần mô tả sản phẩm |
| 126 | Độ dài lớn nhất của toàn mẫu đã định dạng được báo trong video |
| 128 | Giới hạn chuỗi dự kiến dùng khi huấn luyện |

Toàn mẫu gồm câu hỏi, mô tả, đoạn `Price is $`, đáp án và những token đặc biệt mà pipeline thêm vào. Vì vậy, giới hạn mô tả 110 không có nghĩa toàn bài chỉ dài 110.

Giảng viên đo lại và báo trung bình khoảng **101 token**, lớn nhất **126 token**, rồi chọn **128** để có một ít khoảng dư.

128 cũng là lũy thừa của hai, nhưng **không có quy tắc bắt buộc mọi độ dài chuỗi phải là lũy thừa của hai**. Điều quan trọng là đo đúng chuỗi mà trainer thực sự nhận và tránh cắt mất đáp án hoặc token kết thúc. Khoảng dư hai token không phải lúc nào cũng đủ nếu bạn thay định dạng.

**128 ở đây là cấu hình cho thí nghiệm, không phải giới hạn đọc hiểu tối đa của LLaMA.** Giống như giới hạn một bài tập ở 128 đơn vị không có nghĩa người học chỉ đọc được tối đa chừng đó.

## 6. Video 009: Lưu dataset và chạy thử mô hình

### Đưa dữ liệu lên Hugging Face để làm gì?

Giảng viên tạo hai phiên bản dữ liệu gồm các cột `prompt`, `completion` và các split train/validation/test, rồi đưa lên Hugging Face Hub. Sau đó notebook Colab tải lại đúng bộ dữ liệu này.

Các tên được nhắc thể hiện những giai đoạn khác nhau:

| Tên dạng rút gọn trong bài | Ý nghĩa |
| --- | --- |
| `items_raw_lite` | Dữ liệu ban đầu |
| `items_lite` | Dữ liệu đã tiền xử lý |
| `items_prompts_lite` / `items_prompts_full` | Dữ liệu đã chuyển sang đề bài và đáp án |

**Upload dataset không phải huấn luyện.** Nó chỉ lưu bộ bài tập để tái sử dụng. Phần phụ đề không cung cấp đầy đủ đường dẫn repository để tái dựng một notebook chạy ngay; tài liệu này tập trung giải thích quy trình.

### Các công cụ trong Colab đóng vai trò gì?

| Thành phần | Vai trò trong video |
| --- | --- |
| GPU T4 | Phần cứng chạy phép tính mô hình trong buổi demo |
| Hugging Face token | Xác thực để truy cập tài nguyên; khác với token văn bản |
| `bitsandbytes` | Hỗ trợ nạp mô hình với lượng tử hóa |
| Tokenizer | Chuyển văn bản sang token ID và giải mã ngược lại |
| LLaMA 3.2 3B base | Mô hình nền đem ra thử; 3B chỉ khoảng 3 tỷ tham số |
| `utils.py` / hàm `evaluate` | Mã tiện ích giảng viên dùng để chấm và hiển thị kết quả |

Giảng viên nạp mô hình ở **4-bit** và báo footprint khoảng **2,2 GB**. Đây là số đo cho mô hình trong thiết lập đó, không phải tổng VRAM chắc chắn cần để huấn luyện hoặc triển khai mọi nơi. Còn có bộ nhớ cho dữ liệu trung gian và các thành phần khác.

**Quantization — lượng tử hóa** giúp biểu diễn trọng số gọn hơn. **Fine-tuning — tinh chỉnh** giúp học nhiệm vụ. Nạp 4-bit chưa có nghĩa mô hình đã được huấn luyện định giá; cũng chưa đủ để nói đã hoàn thành QLoRA.

### Hàm dự đoán làm gì?

Đọc theo ý nghĩa, không cần nhớ cú pháp Python:

1. Lấy `prompt` của sản phẩm, không lấy đáp án thật.
2. Dùng tokenizer chuyển prompt thành token ID.
3. Đưa dữ liệu đến thiết bị chạy mô hình.
4. Sinh tối đa **8 token mới**.
5. Chỉ lấy đoạn mới sinh, bỏ phần prompt khỏi kết quả trả về.
6. Giải mã thành văn bản rồi đưa qua bước trích giá và chấm điểm.

Video dùng `torch.no_grad()` để không xây dựng gradient trong lần dự đoán này. **Bổ sung:** tắt gradient không đồng nghĩa với gọi `model.eval()`; đây là hai việc khác nhau trong PyTorch.

**8 token mới** là ngân sách đầu ra khi thử sinh. **128 token** là giới hạn chuỗi dự kiến cho huấn luyện. Hai con số không cùng vai trò.

Sản phẩm thử là pedal hiệu ứng guitar có giá thật **219 đô la**. Mô hình sinh khoảng **349.99** và tiếp tục một đoạn chữ. Nó vừa đoán giá lệch, vừa chưa hoàn toàn tuân thủ kiểu đầu ra mong muốn.

Điều này cho thấy còn hai việc cần cải thiện: **độ chính xác của giá** và **tính ổn định của định dạng đầu ra**.

### Không học thuộc cấu hình padding như công thức mọi trường hợp

Video đặt pad token trùng EOS và padding về bên phải. EOS là token kết thúc chuỗi, còn padding là vị trí đệm; nếu dùng chung token ID, cần xử lý mask đúng để phân biệt vai trò.

Đây là cấu hình theo ngữ cảnh notebook. Với sinh văn bản theo batch bằng mô hình decoder-only, tài liệu Transformers hướng dẫn đệm bên trái. Vì thế, không nên suy ra “mọi lần nạp tokenizer đều đệm bên phải”. [Hướng dẫn sinh văn bản của Transformers](https://huggingface.co/docs/transformers/en/llm_tutorial).

## 7. Video 010: Base model khác chat/instruct model thế nào?

Cùng nhìn ví dụ đơn giản:

- Base model giống người được luyện rất nhiều bài “đọc đoạn này rồi viết tiếp”.
- Chat/instruct model được huấn luyện thêm để nhận yêu cầu và tạo phản hồi phù hợp.

| Tiêu chí | Base model — mô hình nền | Chat/Instruct — mô hình hội thoại/làm theo chỉ dẫn |
| --- | --- | --- |
| Định hướng | Tiếp nối văn bản | Phản hồi chỉ dẫn, hội thoại |
| Đầu vào thường gặp | Chuỗi văn bản hoặc prompt–completion | Tin nhắn được định dạng theo chat template |
| Phù hợp để thử trong bài | Một nhiệm vụ cố định: viết tiếp giá | Nhiều dạng yêu cầu hoặc tương tác hội thoại |
| Có thể fine-tune không? | Có | Có |

**Bổ sung:** cả hai cuối cùng vẫn xử lý chuỗi token và dự đoán token tiếp theo. Chat template chuyển các vai trò/tin nhắn thành định dạng có token điều khiển mà mô hình đã học. Không phải mô hình nào cũng yêu cầu đủ system, user và assistant ở mọi lượt. [Tài liệu chat templates](https://huggingface.co/docs/transformers/en/chat_templating).

Trong phạm vi video, chat và instruct được dùng gần nghĩa nhau. Trong thực tế, hai nhãn có thể nhấn mạnh khả năng khác nhau; cần xem mục đích huấn luyện của từng mô hình.

### Vì sao giảng viên chọn base model?

Nhiệm vụ luôn là đọc mô tả rồi điền giá. Không cần một hệ thống hội thoại nhiều lượt. Dùng prompt–completion trực tiếp giúp dữ liệu gọn.

Giảng viên cho biết đã thử cả hai biến thể; base cho kết quả nhỉnh hơn trong thí nghiệm của mình, còn instruct cần thêm token định dạng. **Đây là kết quả của bài toán này, không phải bằng chứng base luôn tốt hơn instruct khi fine-tuning.**

Base model cũng không phải “mô hình chưa từng học gì”. Nó đã được pretrain trên dữ liệu lớn; chỉ chưa được fine-tune cho nhiệm vụ định giá trong bài.

Video nhắc reasoning/thinking model để mở rộng bối cảnh. Không cần coi đây là nhóm hoàn toàn tách biệt: khả năng suy luận và khả năng hội thoại có thể cùng tồn tại trong một mô hình. Phần này cũng không cần bạn học thuộc các khẳng định lịch sử hay tên phiên bản GPT được nhắc thoáng qua.

## 8. Baseline: Vì sao phải đo một kết quả kém trước?

**Baseline — mốc ban đầu** trả lời câu hỏi: “Trước khi huấn luyện thêm, hệ thống đang làm tốt đến mức nào?”

Giảng viên chạy bộ đánh giá với LLaMA 3.2 base đã lượng tử hóa, chưa fine-tune cho bài toán, rồi ghi lại:

| Cách dự đoán | Giá trị lỗi được báo trong video |
| --- | ---: |
| Luôn đoán một hằng số — baseline đơn giản trước đó | 106,18 |
| LLaMA 3.2 base 4-bit | 110,72 |

Theo thước đo đang dùng, lỗi càng nhỏ càng tốt. Mô hình base trong lần chạy này còn kém hơn cách đoán hằng số. Không có lý do bỏ qua baseline đơn giản chỉ vì ta đang dùng LLM.

**Giới hạn nguồn:** phụ đề gọi 110,72 là “error” nhưng không cho đủ công thức của hàm `evaluate`. Vì vậy, tài liệu giữ tên “giá trị lỗi”, không tự khẳng định đó là MAE hay RMSE. Tương tự, quy mô test đã lưu không chứng minh evaluator đã chạy toàn bộ số mẫu đó.

Giảng viên cũng báo **R² âm**. Về ý nghĩa toán học, R² âm cho biết tổng sai số bình phương của dự đoán lớn hơn cách luôn đoán trung bình giá thật trên tập đang đánh giá. Đây không phải “độ chính xác âm”, và baseline trung bình trong định nghĩa R² không nhất thiết chính là baseline hằng số có lỗi 106,18 ở bảng.

### Sau fine-tuning phải so sánh thế nào?

Giữ cùng dữ liệu đánh giá, đáp án giá gốc, cách trích số, cách xử lý đầu ra lỗi và công thức chấm. Khi đó, cải thiện mới có ý nghĩa.

Ví dụ tự tạo: nếu sau fine-tuning giá trị lỗi giảm từ 110,72 xuống 70 trên cùng phép đo, đó là tiến bộ theo phép đo ấy. **70 chỉ là ví dụ, không phải kết quả được báo trong bốn video.**

Kết quả kém ban đầu chỉ nói rằng mô hình chưa phù hợp với thiết lập này. Nó không chứng minh mọi LLaMA đều kém, cũng chưa chứng minh fine-tuning chắc chắn sẽ thành công. Mục tiêu của phần sau là kiểm tra xem mô hình nhỏ có thể học kỹ năng đủ hữu ích hay không.

## 9. Ghép toàn bộ bài thành một quy trình dễ nhớ

1. **Xác định nhiệm vụ:** đọc mô tả sản phẩm, dự đoán giá.
2. **Giữ các tập dữ liệu riêng:** train để học, validation để chọn, test để đánh giá.
3. **Đếm token bằng đúng tokenizer:** tìm phần đuôi dài và các mẫu bất thường.
4. **Giới hạn mô tả:** bài chọn 110 token, sau khi xem thông tin bị mất.
5. **Tạo đề và đáp án:** prompt dừng ở `Price is $`, completion chứa giá.
6. **Đơn giản hóa đáp án huấn luyện:** làm tròn train/validation, giữ giá thật cho test.
7. **Đo lại toàn chuỗi:** bài báo tối đa 126, dự kiến cấu hình 128.
8. **Lưu và tải lại dataset:** chuẩn bị cho notebook huấn luyện.
9. **Chạy base model 4-bit và ghi baseline:** bài báo lỗi 110,72.
10. **Bước tiếp theo, chưa thực hiện ở đây:** thiết lập SFTTrainer và bắt đầu fine-tuning.

SFT là **Supervised Fine-Tuning — tinh chỉnh có giám sát**, tức học thêm từ các ví dụ có đáp án mẫu. Trong hướng đi QLoRA, mô hình nền được lượng tử hóa, còn các adapter LoRA là phần được huấn luyện; chi tiết triển khai thuộc bài sau.

## 10. Tự kiểm tra mức hiểu bài

**1. Tạo hai cột prompt/completion có làm mô hình thông minh hơn ngay không?**

Chưa. Đó là chuẩn bị dữ liệu. Tham số cần được huấn luyện ở bước sau mới học từ bộ bài tập này.

**2. Vì sao không giữ mô tả dài nhất cho chắc?**

Vì phần dài có thể làm tăng chi phí xử lý trong khi ít thêm thông tin. Cần cân bằng, xem nội dung bị cắt và đo kết quả.

**3. Vì sao có `.00` khi đã làm tròn?**

Đó là định dạng biểu diễn. Giá trị đã là số đô la nguyên; phần cent không còn biến thiên.

**4. 128 token có phải khả năng đọc tối đa của LLaMA không?**

Không. Đây là giới hạn chuỗi lựa chọn cho thí nghiệm huấn luyện này.

**5. Một mô hình base chưa fine-tune có biết gì không?**

Có. Nó đã được pretrain; chưa học thêm nhiệm vụ định giá theo bộ dữ liệu của bài.

**6. Có thể kết luận mô hình sau fine-tuning sẽ giỏi không?**

Chưa. Bốn video mới cung cấp dữ liệu sẵn sàng và mốc đánh giá ban đầu.

> Điều quan trọng nhất: chất lượng fine-tuning bắt đầu từ việc xác định đúng nhiệm vụ, chuẩn bị ví dụ phù hợp và đo kết quả công bằng — trước cả lúc bấm chạy huấn luyện.
