# Tuần 3 – Ngày 1: Hiểu Hugging Face và tự chạy mô hình AI trên Google Colab

> Bản giảng giải đầy đủ cho bài 001–006. Tài liệu được biên soạn từ toàn bộ phụ đề tiếng Anh, đối chiếu một số thuật ngữ trong phụ đề Việt và tài liệu chính thức. Đây là bài giảng viết lại theo mạch dễ học, không phải bản dịch từng câu. Các ví dụ giải thích và code bổ sung được ghi rõ; không phải bản chép notebook của giảng viên. MP4 bài 006 không truy cập được, nên phần đó dựa trên phụ đề, không đánh giá trực tiếp hình ảnh đầu ra.

## 1. Cả ngày học này thực sự muốn dạy điều gì?

**Mục tiêu chính: biết tìm một mô hình đã được huấn luyện, tải nó về một máy có GPU và dùng Python để chạy mô hình đó.**

Trong phần mở đầu, giảng viên nhắc rằng người học đã biết gọi API, làm giao diện Gradio, xử lý ảnh/âm thanh và dùng tools. Ngày học này chuyển sự chú ý vào nơi mô hình thực sự chạy.

Khi dùng API của nhà cung cấp, ứng dụng gửi đầu vào tới dịch vụ và nhận kết quả. Trong bài này, bạn tải các tệp mô hình về máy Colab, nạp mô hình bằng thư viện Python rồi chạy trên tài nguyên của máy đó. Bạn chịu trách nhiệm thêm về bộ nhớ, cài thư viện và thời gian chạy.

Ví dụ gần với lập trình web: trước đây bạn gọi một dịch vụ xử lý ảnh; bây giờ bạn thiết lập chương trình xử lý ảnh trên máy chủ do mình điều khiển phiên chạy. Frontend vẫn có thể nhận prompt và hiển thị kết quả, nhưng phần xử lý phía sau thay đổi.

| Bài | Câu hỏi bài giải quyết | Kết quả cần hiểu |
|---|---|---|
| 001 | Tìm mô hình, dữ liệu và ứng dụng AI ở đâu? | Phân biệt Models, Datasets, Spaces trên Hugging Face |
| 002 | Dùng gì để tải, chạy và tùy chỉnh mô hình? | Hiểu vai trò các thư viện Hugging Face và khác biệt với Ollama |
| 003 | Máy cá nhân yếu thì chạy mô hình ở đâu? | Hiểu Colab, GPU và bộ nhớ GPU |
| 004 | Điều khiển máy Colab như thế nào? | Kết nối runtime, xem tài nguyên, khởi động lại đúng cách |
| 005 | Ghép Hugging Face với Colab ra sao? | Thiết lập token, đăng nhập, chạy thử mô hình tạo ảnh |
| 006 | Tự chạy mô hình cần đánh đổi những gì? | Quan sát chất lượng, tốc độ, bộ nhớ và chi phí qua các mô hình |

Ngày này chủ yếu là **inference – suy luận**, tức dùng mô hình đã học để tạo đầu ra. Việc giới thiệu PEFT và TRL chỉ chuẩn bị cho các tuần sau; bạn chưa tự huấn luyện một mô hình như ChatGPT từ đầu.

## 2. Bài 001 — Hugging Face: nền tảng chứa những gì?

Hãy hình dung Hugging Face Hub là nơi cộng đồng chia sẻ tài nguyên AI theo các repository. So sánh với GitHub giúp bạn dễ hình dung cách tổ chức, nhưng tài nguyên ở đây còn gồm trọng số mô hình và tập dữ liệu.

### Models, Datasets và Spaces

| Thành phần | Nó chứa gì? | Ví dụ dễ hiểu |
|---|---|---|
| **Models – Mô hình** | Các tệp cần để sử dụng mô hình: trọng số, cấu hình, tokenizer hoặc thành phần liên quan | Mô hình nhận mô tả và tạo ảnh |
| **Datasets – Tập dữ liệu** | Dữ liệu phục vụ huấn luyện, đánh giá hoặc nghiên cứu | Các câu đánh giá sản phẩm kèm nhãn tích cực/tiêu cực |
| **Spaces – Ứng dụng demo được triển khai** | Ứng dụng cho người dùng tương tác | Trang nhập prompt, bấm nút và xem ảnh |

Ba thứ này liên quan nhưng không thay thế nhau. Tải một dataset không có nghĩa bạn đã có AI hoạt động. Tải model cũng chưa tự tạo ra giao diện web. Space là lớp ứng dụng có thể sử dụng model và có thể được xây bằng Gradio.

Giảng viên giới thiệu Spaces như nơi đưa demo Gradio lên cho người khác dùng, đồng thời nhắc các cách triển khai khác. Điểm cần nhớ là **Space là ứng dụng**, còn **model là thành phần xử lý AI** bên trong hoặc được ứng dụng gọi tới.

### Tìm model theo nhu cầu, không học thuộc danh sách

Bài 001 hướng dẫn lọc theo tác vụ, thư viện, ngôn ngữ, giấy phép và số tham số; có thể sắp xếp theo lượt tải, lượt thích hoặc cập nhật. Các chỉ số phổ biến giúp khám phá, nhưng không chứng minh model phù hợp với bài toán của bạn.

Một quy trình đọc trang model dễ áp dụng:

1. Xác định tác vụ: tạo văn bản, tạo ảnh, nhận dạng giọng nói hay tác vụ khác.
2. Đọc **model card – trang mô tả mô hình** để biết khả năng, cách dùng và giới hạn.
3. Xem ví dụ sử dụng và tài nguyên cần thiết.
4. Kiểm tra giấy phép và điều kiện truy cập.

Tên như `stabilityai/sdxl-turbo` có hai phần: `stabilityai` là tài khoản/tổ chức, `sdxl-turbo` là tên repository. Nó không phải tên thư viện để `import`.

**Giải thích bổ sung:** giảng viên dùng “open source” khá rộng. Việc một model xuất hiện trên Hub hoặc cho tải trọng số không tự động có nghĩa mọi mục đích sử dụng đều được phép. Hãy đọc giấy phép từng model; đừng hiểu “tải được” thành “không có điều kiện”.

Số lượng model/dataset giảng viên đọc trên màn hình chỉ là thống kê lúc quay. Không cần ghi nhớ các con số đó; mục tiêu là biết cách tìm tài nguyên.

## 3. Bài 002 — Hugging Face còn là bộ thư viện Python

Tên Hugging Face đang được dùng cho hai lớp khác nhau:

- **Nền tảng trên web:** nơi lưu và chia sẻ tài nguyên.
- **Thư viện lập trình:** code bạn cài và import để thao tác với tài nguyên, chạy hoặc huấn luyện mô hình.

Với người làm frontend, có thể liên tưởng: một website lưu package và package được cài vào dự án là hai thứ liên quan nhưng khác nhau.

| Thư viện | Công việc chính trong mạch khóa học | Mức cần học hôm nay |
|---|---|---|
| `huggingface_hub` | Đăng nhập, tải/đẩy tệp, làm việc với repository trên Hub | Hiểu vì sao dùng `login()` |
| `datasets` | Nạp và xử lý tập dữ liệu | Nhận diện vai trò |
| `transformers` | Nạp và chạy nhiều mô hình; hỗ trợ quy trình huấn luyện | Hiểu đây là thư viện chính, không chỉ dành cho chatbot |
| `peft` | Parameter-Efficient Fine-Tuning: tinh chỉnh tiết kiệm tham số, như LoRA | Chưa cần học cách triển khai |
| `trl` | Công cụ huấn luyện/hậu huấn luyện mô hình, gồm các phương pháp liên quan học tăng cường | Biết đây là phần nâng cao |
| `accelerate` | Hỗ trợ chạy/huấn luyện trên các cấu hình thiết bị, gồm nhiều GPU | Chưa cần cấu hình hệ phân tán |
| `diffusers` | Pipeline cho các mô hình sinh ảnh và các mô hình sinh liên quan | Được dùng trong ví dụ bài 005–006 |

Sáu thư viện đầu được giới thiệu trong bài 002; `diffusers` xuất hiện khi thực hành tạo ảnh sau đó.

**PyTorch** nằm ở lớp tính toán bên dưới nhiều ví dụ này: làm việc với tensor, thực hiện phép tính trên CPU/GPU và hỗ trợ huấn luyện. **Weights – trọng số** là những giá trị mô hình đã học. Code mô tả cách tính; trọng số quyết định cụ thể cách mô hình biến đầu vào thành đầu ra.

### Ollama khác cách dùng thư viện như thế nào?

Phụ đề bài 002 nhiều lần ghi nhầm “Ollama” thành “llama”. Cần phân biệt: **Ollama là công cụ chạy mô hình**, còn **Llama là một họ mô hình**.

| Khía cạnh | Ollama | Dùng thư viện Hugging Face trực tiếp |
|---|---|---|
| Cách tiếp cận | Chạy mô hình qua phần mềm và giao diện gọi có sẵn | Viết Python để nạp, cấu hình và chạy mô hình |
| Mức thao tác thường gặp | Quản lý model, gửi yêu cầu, nhận phản hồi | Làm việc với tokenizer, tensor, thiết bị và pipeline |
| Sự thuận tiện | Thuận tiện để bắt đầu sử dụng các model được hỗ trợ | Nhiều quyền kiểm soát hơn nhưng nhiều phần phải hiểu hơn |
| Vai trò trong bài học | Ví dụ về cách chạy đóng gói | Con đường để học sâu hơn và tiến tới fine-tuning |

Không nên hiểu lời giảng thành “Ollama là phần mềm đóng” hoặc “không bao giờ dùng được model đã fine-tune”. Điểm khác biệt ở đây là workflow: chạy model qua công cụ có sẵn so với trực tiếp thao tác bằng thư viện huấn luyện/suy luận. Định dạng phụ đề gọi là “GIF” trong đoạn này là **GGUF**, không phải định dạng ảnh GIF.

## 4. Bài 003 — Colab và GPU giải quyết vấn đề gì?

**Google Colab cho bạn dùng notebook trong trình duyệt, còn code chạy trên máy từ xa của Google trong cấu hình hosted runtime của bài.** Laptop của bạn chủ yếu hiển thị giao diện và gửi lệnh.

Một **notebook** chứa các ô văn bản và **code cell – ô mã**. Một **runtime** là môi trường thực thi được kết nối; **kernel** là tiến trình thực thi code, giữ biến và đối tượng trong phiên Python.

Ví dụ: bạn chạy một cell tạo biến `prompt`, rồi cell tiếp theo dùng biến đó. Hai cell chia sẻ trạng thái của kernel. Sau khi restart kernel, biến không còn dù dòng code vẫn nằm trong notebook.

### Vì sao AI cần GPU?

Nhiều phép tính của mô hình là các phép toán tensor/ma trận có thể xử lý song song hiệu quả. GPU phù hợp với kiểu công việc này. Điều đó không có nghĩa mọi dòng Python đều chạy trên GPU: phép tính Python thông thường vẫn có thể chạy bằng CPU; chương trình cần đưa mô hình và dữ liệu lên thiết bị phù hợp.

| Tài nguyên | Dùng để làm gì? | Nhầm lẫn cần tránh |
|---|---|---|
| Disk – Ổ đĩa | Lưu tệp model, package, ảnh đầu ra | Còn nhiều disk không bảo đảm đủ GPU memory |
| System RAM – Bộ nhớ hệ thống | Giữ dữ liệu và trạng thái phía CPU | RAM hệ thống không đồng nghĩa VRAM |
| GPU memory / VRAM | Giữ trọng số và dữ liệu trung gian khi tính trên GPU | Kích thước model tải xuống không phải toàn bộ bộ nhớ lúc chạy |

Trong phiên của giảng viên, T4 hiển thị khoảng 15 GB bộ nhớ GPU khả dụng; A100 ở phần sau hiển thị 40 GB. Đây là cấu hình được quan sát trong bài, không phải thông số bắt buộc của mọi phiên Colab.

**Bổ sung để hiểu bộ nhớ:** một model có 8 tỷ tham số lưu mỗi tham số bằng 2 byte đã cần khoảng 16 GB chỉ cho trọng số theo phép tính thô. Khi chạy còn có dữ liệu trung gian; khi huấn luyện thường cần thêm nhiều bộ nhớ. Nén lượng tử, kiểu dữ liệu và offload có thể thay đổi yêu cầu thực tế.

### Vì sao dùng máy trên cloud?

Giảng viên muốn người học thử GPU mà chưa phải mua phần cứng. Đổi lại, bạn phải chờ tải model, chịu độ trễ kết nối và quản lý vòng đời runtime. Thuê hay mua phụ thuộc tần suất sử dụng; một demo ngắn không đủ để kết luận phương án nào luôn rẻ hơn.

**Đính chính về tài nguyên:** Colab có tài nguyên miễn phí nhưng không bảo đảm luôn cấp T4 hoặc chạy không giới hạn; loại GPU và giới hạn thay đổi theo khả dụng. [Nguồn: FAQ Colab](https://research.google.com/colaboratory/faq.html).

## 5. Bài 004 — Quản lý phiên Colab đúng cách

Trình tự thao tác trong bài:

1. Mở notebook từ tài nguyên khóa học và đăng nhập Google.
2. Chọn **File → Save a copy in Drive** để có bản chỉnh sửa của mình.
3. Mở **Change runtime type**, chọn GPU phù hợp; bài dùng T4.
4. Bấm **Connect**, kiểm tra trạng thái kết nối.
5. Mở bảng tài nguyên để theo dõi RAM, GPU memory và disk.
6. Chạy các cell theo thứ tự từ trên xuống.

Phụ đề không chứa URL notebook gốc nên tài liệu này không tự suy đoán đường dẫn. Hãy lấy notebook ở tài nguyên khóa học hoặc repository giảng viên cung cấp.

### Restart khác xóa runtime ra sao?

| Thao tác | Tác động chính | Sau đó cần làm gì? |
|---|---|---|
| Restart session | Khởi động lại tiến trình Python, mất biến/model trong bộ nhớ | Chạy lại import, khởi tạo và nạp model; package cài trong máy hiện tại thường còn |
| Disconnect and delete runtime | Bỏ môi trường máy đang dùng | Kết nối mới, cài lại phần cần thiết, nạp lại dữ liệu/model |
| Lưu notebook | Lưu code, văn bản và có thể cả output | Không đồng nghĩa lưu toàn bộ máy đang chạy |

Đừng hiểu câu “rời Colab là mọi thứ bị xóa” theo nghĩa đóng tab sẽ xóa máy ngay. Notebook lưu trong Drive khác với tệp tạm trong runtime; máy có thể tiếp tục tồn tại một thời gian. Chia sẻ notebook cũng không chia sẻ nguyên máy ảo đang chạy. [Nguồn: FAQ Colab](https://research.google.com/colaboratory/faq.html).

**Giải thích bổ sung:** cùng dùng Colab giúp giảm khác biệt môi trường, nhưng không bảo đảm hai người luôn có phiên bản thư viện và phần cứng giống tuyệt đối. Các package cài thêm và phiên bản runtime vẫn có thể khác.

Khi lỗi, đọc thông báo trước. Nếu chỉ quên chạy cell import, hãy chạy cell đó. Khi trạng thái đã rối hoặc cần giải phóng model trước, restart rồi chạy lại theo thứ tự là cách dễ hiểu. Xóa runtime là bước mạnh hơn, không cần làm cho mọi lỗi nhỏ.

## 6. Bài 005 — Đăng nhập Hugging Face và chạy model đầu tiên

### Ba việc độc lập cần ghép lại

- **Kết nối Colab:** có máy để chạy code.
- **Đăng nhập Hugging Face:** có danh tính/quyền truy cập tài nguyên khi cần.
- **Nạp và chạy model:** dùng thư viện để thực hiện tác vụ trên máy Colab.

Đăng nhập thành công chưa có nghĩa mô hình đã nằm trên GPU.

Trong notebook, `Shift + Enter` chạy cell. Dấu `!` đầu dòng dùng để chạy lệnh shell, ví dụ:

```python
!nvidia-smi
```

Lệnh này xem GPU mà máy đang nhận. Nó không cài GPU và không chuyển model sang GPU. Phụ đề có chỗ ghi “15MB”; ngữ cảnh đang nói bộ nhớ GPU cỡ GB.

### Thiết lập token

Theo mạch bài: vào phần Access Tokens của Hugging Face, tạo token, sau đó mở biểu tượng chìa khóa **Secrets** trong Colab. Tạo secret tên **`HF_TOKEN`**, dán token bắt đầu bằng **`hf_`** vào giá trị và cho notebook quyền truy cập.

Phân biệt ba tên: `HF_TOKEN` là tên secret; `hf_...` là giá trị bí mật; `hf_token` có thể là tên biến Python do bạn đặt.

**Đính chính quan trọng:** bài yêu cầu quyền Write để chuẩn bị cho việc đẩy model ở tuần sau. Việc chỉ tải/chạy model không đòi Write; quyền Read hoặc fine-grained phù hợp có thể đủ. Token cũng không tự cho quyền vào mọi repository: tài khoản vẫn phải có quyền, và model gated có thể yêu cầu chấp nhận điều kiện. [Nguồn: Hugging Face User access tokens](https://huggingface.co/docs/hub/security-tokens).

Code minh họa kết nối:

```python
from google.colab import userdata
from huggingface_hub import login

hf_token = userdata.get("HF_TOKEN")
login(token=hf_token)
```

`userdata.get()` đọc secret, còn `login()` xác thực với Hub. Không in token vào output hoặc viết thẳng vào cell được chia sẻ. Secrets tách khỏi notebook, nhưng code được cấp quyền vẫn có thể đọc chúng.

### Điều gì xảy ra khi tạo ảnh lần đầu?

Bài dùng SDXL Turbo của Stability AI với prompt về lớp học AI theo phong cách pop art. Quá trình có thể gồm: tải cấu hình và trọng số, dựng các thành phần pipeline, nạp lên thiết bị, rồi mới tính toán tạo ảnh.

Vì vậy, lúc đầu có thể thấy tải nhiều GB trong khi GPU memory chưa tăng nhiều. Lần chạy đầu thường chậm hơn lần tiếp theo. Cache trên disk và model còn trong bộ nhớ là hai thứ khác nhau; runtime mới có thể phải tải lại.

**Pipeline** là bộ xử lý đóng gói các bước cần cho một tác vụ. Bạn cung cấp prompt và thông số; pipeline điều phối các thành phần để trả ảnh. Pipeline vẫn chạy tính toán thực sự trên thiết bị được cấu hình.

## 7. Bài 006 — Các thí nghiệm muốn chứng minh điều gì?

Bài này tiếp tục kết quả bài 005 rồi lần lượt thử model khác. Bạn cần quan sát tài nguyên và hiểu đánh đổi, không cần thuộc mọi dòng code tạo ảnh ngay ngày đầu.

| Thí nghiệm trong phụ đề | Quan sát giảng viên nêu | Bài học |
|---|---|---|
| SDXL Turbo | Tạo ảnh nhanh; GPU memory khoảng 8,5 GB | Có thể tự chạy pipeline tạo ảnh trên T4 |
| SDXL Base | 30 inference steps; GPU memory khoảng 12,7 GB | Cấu hình/model khác có nhu cầu tài nguyên khác |
| SDXL Base + Refiner | Chia quá trình khoảng 80/20; cuối cùng vẫn chạy được trên T4 của giảng viên | Hai giai đoạn có thể cải thiện đầu ra nhưng sát giới hạn bộ nhớ |
| Microsoft SpeechT5 TTS | Tạo và phát câu chào bằng giọng nói trên T4 | Thư viện Transformers còn hỗ trợ tác vụ âm thanh |
| FLUX.1-schnell | Chạy trên A100, 4 bước; bộ nhớ khoảng 36,8 GB; tác vụ được đo khoảng 240 giây | Model có thể miễn phí tải nhưng máy chạy vẫn có chi phí |

Các số trên là lời mô tả của giảng viên trong phiên demo, không phải benchmark hay yêu cầu bộ nhớ tối thiểu. Chất lượng hình ảnh trong bảng không được kiểm tra trực tiếp từ MP4 bài 006.

### Diffusion và inference steps

Cách hình dung đơn giản: khi sinh ảnh, hệ thống bắt đầu từ nhiễu trong một biểu diễn nội bộ rồi biến đổi nó theo điều kiện văn bản để tạo đầu ra. Trong huấn luyện, mô hình đã học cách xử lý nhiễu. Khi bạn gọi nó tạo ảnh, bạn đang dùng kiến thức đó, không huấn luyện lại mô hình.

**`num_inference_steps`** là số bước xử lý trong quá trình suy luận. Nó không phải số ảnh và cũng không phải số vòng training. Nhiều bước thường tốn thêm thời gian, nhưng không tự động tạo ảnh đẹp hơn ở mọi model.

SDXL Turbo được thiết kế cho ít bước; ví dụ chính thức dùng `guidance_scale=0.0`. Không nên sao chép cấu hình của SDXL Base sang Turbo một cách máy móc. [Nguồn: model card SDXL Turbo](https://huggingface.co/stabilityai/sdxl-turbo).

### Base và Refiner

Hãy hình dung Base tạo cấu trúc ban đầu, rồi Refiner xử lý phần sau để hoàn thiện. Tỷ lệ 80/20 trong demo là chia giai đoạn khử nhiễu, không phải chia dữ liệu train/test và không phải hai ảnh có kích thước 80% và 20%.

Giảng viên dự đoán sẽ hết bộ nhớ trên T4, nhưng sau đó xác nhận chạy thành công. Kết luận đúng là **phiên đó chạy được và rất sát giới hạn**, không phải Refiner bắt buộc cần A100 hoặc chắc chắn chạy được trên mọi T4.

### TTS cũng là một tác vụ AI riêng

Tên đúng là **SpeechT5**, không phải “Speech five”. TTS viết đầy đủ là **Text-to-Speech – chuyển văn bản thành giọng nói**. Mô hình trong bài là `microsoft/speecht5_tts`. [Nguồn: model card SpeechT5](https://huggingface.co/microsoft/speecht5_tts).

Nó không phải chatbot trả lời câu hỏi, cũng không phải nhận dạng giọng nói thành chữ. Bạn đưa vào câu đã có; hệ thống tạo âm thanh đọc câu ấy. Giảng viên còn phải thêm bước cài package trước khi demo hoạt động; phụ đề không nêu đủ câu lệnh để tái dựng nguyên cell đó.

### FLUX: sửa tên và cách hiểu

“Chanel” trong phụ đề là **schnell**. Model card mô tả FLUX.1-schnell là mô hình 12 tỷ tham số dùng rectified flow transformer, có thể sinh ảnh với 1–4 bước. Vì vậy, không nên hiểu FLUX là ba kích thước nhỏ/vừa/lớn chỉ từ cách giảng viên gọi schnell/dev/pro. [Nguồn: model card FLUX.1-schnell](https://huggingface.co/black-forest-labs/FLUX.1-schnell).

Một nhầm lẫn khác cần tránh: “diffusion” và “Transformer” không phải hai nhãn loại trừ nhau. Một nhãn nói về cách xây dựng quá trình sinh; nhãn kia nói về kiến trúc mạng. Không phải mọi mô hình dùng kiến trúc Transformer đều là LLM sinh văn bản.

### Miễn phí model khác miễn phí vận hành

Giảng viên dùng giả định 10 USD mua 100 compute units và A100 tiêu thụ khoảng 5 units/giờ. Theo đúng các giả định đó:

```text
Giá một unit = 10 / 100 = 0,10 USD
Giá một giờ = 5 × 0,10 = 0,50 USD
240 giây = 240 / 3600 giờ
Chi phí ước tính = 240 / 3600 × 0,50 ≈ 0,033 USD
```

Giảng viên làm tròn khoảng 0,04 USD. Đây là phép tính minh họa từ bài, không phải báo giá Colab hiện tại. Toàn bộ thời gian giữ runtime, gồm chờ tải và thời gian chưa kết thúc phiên, có thể làm chi phí thực tế khác với một lần suy luận đã đo.

Điểm cần học: khi tự chạy model, bạn chuyển sang quản lý tài nguyên tính toán. Sau khi dùng xong, lưu kết quả cần giữ rồi kết thúc runtime qua menu quản lý phiên.

## 8. Ví dụ bổ sung: một lần tự chạy SDXL Turbo

Đây là ví dụ tối giản để nối các khái niệm, được biên soạn dựa trên ví dụ model card, không phải notebook gốc. Chưa thực thi trên GPU trong lần biên soạn này; phiên bản package và quyền truy cập thực tế có thể ảnh hưởng việc chạy.

**Cell 1 — Cài thư viện nếu môi trường thiếu:**

```python
%pip install -q diffusers transformers accelerate huggingface_hub safetensors
```

`%pip` là lệnh notebook cài package vào môi trường kernel. Nếu môi trường yêu cầu restart sau cài đặt, restart trước khi chạy các cell sau.

**Cell 2 — Kiểm tra GPU:**

```python
import torch

assert torch.cuda.is_available(), "Hãy kết nối runtime có NVIDIA GPU"
print(torch.cuda.get_device_name(0))
```

Nếu tài nguyên model yêu cầu đăng nhập, chạy cell `login()` ở mục 6 sau khi đã thiết lập Secrets.

**Cell 3 — Nạp model:**

```python
from diffusers import AutoPipelineForText2Image

pipe = AutoPipelineForText2Image.from_pretrained(
    "stabilityai/sdxl-turbo",
    torch_dtype=torch.float16,
    variant="fp16",
)
pipe = pipe.to("cuda")
```

- `from_pretrained(...)`: dựng pipeline và nạp trọng số có sẵn.
- `float16` / `fp16`: cấu hình dùng trọng số/kiểu số 16 bit phù hợp ví dụ này.
- `.to("cuda")`: chuyển pipeline lên NVIDIA GPU.

**Cell 4 — Tạo và xem ảnh:**

```python
prompt = "A class of students learning AI engineering, vibrant pop art style"

image = pipe(
    prompt=prompt,
    num_inference_steps=1,
    guidance_scale=0.0,
).images[0]

display(image)
image.save("ai_class.png")
```

Ảnh vừa lưu nằm trên máy runtime. Muốn giữ lâu dài, tải ảnh về hoặc lưu sang nơi bền vững trước khi bỏ runtime. Khi thử prompt khác, chỉ cần chạy lại cell tạo ảnh nếu `pipe` vẫn tồn tại.

[Nguồn cấu hình ví dụ: SDXL Turbo](https://huggingface.co/stabilityai/sdxl-turbo).

## 9. Những lỗi thường gặp và cách suy nghĩ

| Hiện tượng | Kiểm tra gì trước? | Hướng xử lý |
|---|---|---|
| `NameError` với `pipe` hoặc biến khác | Đã chạy cell khai báo chưa? Có vừa restart không? | Chạy lại các cell phụ thuộc theo thứ tự |
| `ModuleNotFoundError` | Package có trong runtime hiện tại chưa? | Cài đúng package; đọc yêu cầu restart nếu có |
| Không tìm thấy `HF_TOKEN` | Tên secret và quyền Notebook access | Sửa tên, thêm giá trị, cấp quyền đúng notebook |
| Lỗi truy cập 401/403 | Token hợp lệ? Tài khoản được truy cập repo? | Kiểm tra quyền và điều kiện model, không mặc định tăng lên Write |
| Không có CUDA/GPU | Runtime đang cấp thiết bị gì? | Xem trạng thái, `nvidia-smi`, kết nối GPU khi có sẵn |
| `CUDA out of memory` | Còn model cũ trong bộ nhớ? Ảnh/batch quá lớn? | Restart để bỏ model cũ; giảm cấu hình hoặc dùng model phù hợp |
| Lần đầu rất lâu | Đang tải tệp hay đã suy luận? | Xem tiến trình, phân biệt thời gian tải với thời gian tạo kết quả |
| Đầu ra ảnh méo/sai chi tiết | Model, prompt và cấu hình có phù hợp? | Thử một thay đổi mỗi lần; nhiều bước không bảo đảm sửa mọi lỗi |

Giảm inference steps chủ yếu giúp giảm thời gian; không phải phương án chắc chắn giải quyết thiếu VRAM. Kích thước ảnh, batch, kiểu dữ liệu và cách nạp model cũng rất quan trọng.

## 10. Học xong cần tự giải thích được gì?

1. **Model lấy từ đâu, chạy ở đâu?** Tệp lấy từ Hub; trong bài, tính toán chạy trên máy Colab.
2. **Tại sao có cả `huggingface_hub` và `diffusers`?** Một bên làm việc với kho tài nguyên; bên kia điều phối tác vụ sinh ảnh.
3. **Tại sao restart xong phải chạy lại code?** Trạng thái Python và model trong bộ nhớ đã mất.
4. **Có đang train model không?** Không, các demo đang suy luận bằng trọng số đã huấn luyện.
5. **Miễn phí model nghĩa là không có chi phí nào?** Không; còn tài nguyên máy chạy và điều kiện giấy phép.
6. **Có cần học PEFT/TRL ngay hôm nay?** Chưa; ưu tiên hiểu luồng tải → nạp → suy luận → lưu kết quả → kết thúc phiên.

Bài tập ngắn: tạo một ảnh bằng ví dụ trên, đổi prompt một lần, quan sát lần sau có còn tải lại model không. Sau đó restart và thử cell tạo ảnh trước cell nạp model: đọc lỗi để thấy rõ notebook lưu code còn kernel giữ trạng thái. Cuối cùng chạy lại đúng thứ tự và lưu ảnh cần giữ.

## Phạm vi nguồn

Nguồn nội dung chính là sáu tệp phụ đề tiếng Anh bài 001–006 do bạn cung cấp. Các đoạn tiếng Việt được đối chiếu để tránh giữ lại lỗi dịch như “ôm mặt”, “máy tính xách tay” cho notebook, “Chanel” hoặc “Speech five”. Các đoạn “bổ sung”, đính chính và ví dụ code là phần giảng giải thêm, không gán thành lời nói nguyên văn của giảng viên.

Tài liệu chính thức dùng để đối chiếu ngày 10/09/2026 đã được liên kết ngay tại các phần liên quan. Những nhận xét và số liệu demo vẫn được giữ dưới dạng quan sát của bài học, không chuyển thành cam kết về dịch vụ hiện tại.
