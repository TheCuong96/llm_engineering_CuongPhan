# Day 1 — Từ mô hình fine-tune đến dịch vụ AI và agent đầu tiên

> **Thông điệp chính:** Bạn đã có một mô hình biết ước lượng giá sản phẩm. Sáu bài này dạy cách đưa nó lên máy chủ GPU, gọi nó từ chương trình của bạn, giảm thời gian chờ và đóng gói thành một thành phần của hệ thống săn ưu đãi.
>
> Tài liệu được giảng lại từ toàn bộ 6 file phụ đề SRT 001–006 bạn gửi; không phải bản chép lời. Ví dụ giải thích và lưu ý bổ sung được phân biệt với kết quả trong video. Các đoạn mã minh họa không phải bản sao đầy đủ của repository và chưa được chạy triển khai trong tài liệu này.

## 1. Trước hết: bạn đang học để làm được việc gì?

Hãy tưởng tượng bạn đã dạy một người cách nhìn mô tả sản phẩm rồi đoán giá. Người đó làm tốt bài kiểm tra, nhưng hiện chỉ ngồi trong phòng thí nghiệm. Muốn biến năng lực ấy thành ứng dụng, bạn còn phải giải quyết:

- Người khác gửi mô tả đến bằng cách nào?
- Máy nào thực hiện dự đoán khi máy cá nhân của bạn không đủ mạnh?
- Có phải mỗi lần hỏi lại chuẩn bị toàn bộ mô hình từ đầu không?
- Các phần khác của ứng dụng sử dụng kết quả thế nào?

Đó chính là khoảng cách từ **mô hình đã huấn luyện** đến **một chức năng có thể sử dụng trong sản phẩm**. Ngày học này giải quyết phần đầu của khoảng cách đó.

| Giai đoạn | Câu hỏi cần trả lời | Kết quả |
|---|---|---|
| Fine-tuning — tinh chỉnh | Làm sao mô hình dự đoán giá tốt hơn? | Trọng số hoặc adapter đã huấn luyện |
| Inference — suy luận | Với mô tả này, mô hình đoán giá bao nhiêu? | Một dự đoán |
| Deployment — triển khai | Đặt mã và môi trường thực thi ở đâu để gọi lại? | Dịch vụ trên cloud |
| Integration — tích hợp | Cho hệ thống săn ưu đãi sử dụng dịch vụ thế nào? | `SpecialistAgent` gọi dịch vụ định giá |

**Phần này chủ yếu là triển khai và tích hợp.** Không có bước huấn luyện một mô hình như ChatGPT từ đầu. Các lần gọi dự đoán cũng không tự làm mô hình học thêm.

## 2. Mục tiêu toàn tuần khác mục tiêu hôm nay như thế nào?

### 2.1. Toàn tuần: xây hệ thống săn ưu đãi “The Price Is Right”

Theo phần giới thiệu, hệ thống sẽ theo dõi các ưu đãi được công bố qua RSS, chọn những món đáng xem, ước lượng giá trị rồi gửi thông báo về điện thoại.

**Ví dụ bổ sung:** Một chiếc tai nghe được rao 60 USD. Hệ thống ước lượng sản phẩm tương ứng đáng giá 100 USD. Chênh lệch 40 USD là tín hiệu để xem xét ưu đãi. Đây chỉ là chênh lệch theo dự đoán, chưa chứng minh món hàng thực sự rẻ: có thể khác phiên bản, tình trạng hoặc thiếu phụ kiện.

RSS có thể hiểu là một luồng tin cập nhật có cấu trúc mà chương trình đọc được. Hệ thống không cần giả lập người ngồi mở từng trang để biết có bài đăng mới.

### 2.2. Hôm nay: làm phần định giá chuyên biệt hoạt động

| Bài | Giảng viên làm gì? | Ý nghĩa cần hiểu |
|---|---|---|
| 001 | Giới thiệu Agentic AI và dự án cuối khóa | Biết vì sao cần kết nối mô hình với một hệ thống hành động |
| 002 | Trình bày kiến trúc và thiết lập Modal | Hiểu vị trí của từng thành phần và nơi chạy mô hình |
| 003 | Chạy cùng hàm Python ở local và cloud | Tách nơi viết mã khỏi nơi thực thi |
| 004 | Thiết lập Secrets; chạy LLaMA và model fine-tune | Chứng minh cloud tải được mô hình và dự đoán được |
| 005 | Chuẩn hóa đầu vào, deploy, dùng class và Volume | Biến bản chạy thử thành dịch vụ gọi lại hiệu quả hơn |
| 006 | Tạo `SpecialistAgent` | Đóng gói lời gọi mô hình để hệ thống lớn sử dụng |

Kết thúc 6 bài, bạn mới có agent định giá đầu tiên. RAG, ensemble, quét RSS, gửi thông báo và điều phối tự động được giới thiệu cho các ngày tiếp theo; chưa nên coi chúng đã hoàn tất trong phần này.

## 3. Bài 001–002: Agent là gì và vì sao tên gọi dễ gây nhầm?

### 3.1. Một mô hình, một workflow và một agent không hoàn toàn giống nhau

**Mô hình:** Nhận đầu vào và sinh đầu ra. Ví dụ nhận mô tả tai nghe, trả về chuỗi chứa giá dự đoán.

**Workflow — quy trình:** Chương trình ấn định các bước. Ví dụ luôn đọc tin, lọc tin, dự đoán giá rồi gửi thông báo khi đạt ngưỡng.

**Agent theo nghĩa tự chủ:** Mô hình tham gia quyết định bước tiếp theo dựa trên mục tiêu và kết quả đã có. Chẳng hạn thấy mô tả thiếu thông tin nên chọn gọi công cụ tìm thêm, sau đó mới đánh giá tiếp.

Giảng viên giới thiệu ba cách hiểu phổ biến: AI làm việc tương đối độc lập; LLM điều khiển luồng công việc; LLM dùng công cụ trong một vòng lặp để đạt mục tiêu. Đây là những góc nhìn, không phải ba loại phần mềm hoàn toàn tách biệt.

**Điểm rất quan trọng:** Ở bài 002, giảng viên tự nói rằng các thành phần được gọi là “agent” trong kiến trúc không phải cái nào cũng tự chạy vòng lặp. Nhiều thành phần chỉ bọc một lời gọi mô hình.

Vì vậy, `SpecialistAgent` ở bài 006 là một **thành phần chuyên định giá**, chưa phải một trợ lý tự quyết định mọi việc. Đừng hiểu rằng đặt tên class có chữ `Agent` thì class tự có trí thông minh hoặc khả năng tự chủ.

### 3.2. Những thành phần được giới thiệu

| Thành phần | Vai trò dự kiến |
|---|---|
| Scanner Agent | Đọc RSS và chọn ưu đãi tiềm năng |
| Specialist Agent | Gọi mô hình fine-tune để dự đoán giá |
| Ensemble Agent | Kết hợp dự đoán từ nhiều mô hình |
| Messaging Agent | Chuẩn bị nội dung và gửi thông báo |
| Planning Agent | Điều phối các hoạt động để đạt mục tiêu |
| Memory — bộ nhớ hệ thống | Giúp tránh báo lại cùng một ưu đãi |
| Logging — ghi nhật ký | Giúp theo dõi hệ thống đã làm gì |
| User Interface — giao diện | Cho người dùng quan sát và tương tác |

Giảng viên nói toàn tuần có 7 agent, nhưng chưa giải thích đầy đủ mọi thành phần trong 6 bài này. Không nên cộng memory, logging và giao diện vào danh sách agent để cố đủ số 7.

Ensemble nghĩa là kết hợp nhiều mô hình. Có thể liên tưởng đến việc hỏi nhiều người định giá rồi tổng hợp ý kiến; cách tổng hợp cụ thể sẽ cần học ở phần sau, không mặc định luôn là lấy trung bình.

### 3.3. Bài học thiết kế quan trọng hơn số lượng agent

Giảng viên khuyên bắt đầu từ **bài toán và cách đánh giá**, thử giải pháp đơn giản, rồi chỉ tách thành nhiều lời gọi LLM khi việc đó thực sự giúp giải quyết bài toán.

Ví dụ, nếu một lời gọi đã trích xuất thông tin tốt, không cần lập ngay ba agent “đọc”, “phân tích”, “kiểm duyệt” chỉ vì nghe giống cơ cấu công ty. Tách nhiều bước có thể tăng thời gian, chi phí và số điểm có thể lỗi.

Khóa học sẽ tự viết phần kết nối bằng Python để người học nhìn được cơ chế. Không bắt buộc dùng một agent framework bên ngoài mới xây được hệ thống như vậy.

## 4. Bài 002–003: Modal giải quyết vấn đề gì?

### 4.1. Hiểu Modal qua một ví dụ đơn giản

Bạn có một công thức nấu ăn nhưng không có bếp đủ mạnh. Bạn gửi công thức và yêu cầu “bếp cần những thiết bị này” cho một dịch vụ. Dịch vụ chuẩn bị bếp, nấu và trả món về.

Trong bài:

- Công thức là mã Python.
- Môi trường bếp là container và các thư viện.
- Thiết bị tính toán là CPU/GPU.
- Modal chuẩn bị môi trường thực thi và chạy mã.
- Chương trình của bạn nhận kết quả trả về.

**Serverless — ít phải tự quản lý máy chủ:** Vẫn có máy chủ thật. Điều thay đổi là bạn khai báo nhu cầu để nền tảng quản lý việc cấp tài nguyên và vòng đời thực thi.

Modal là hạ tầng chạy AI. LLaMA là mô hình. Hugging Face là nơi cung cấp mô hình, tokenizer và các tài nguyên liên quan. Ba thứ này có vai trò khác nhau.

### 4.2. `Image`, `App`, decorator và `.remote()`

| Thuật ngữ | Cách hiểu trong bài |
|---|---|
| `App` | Tập hợp các thành phần của ứng dụng Modal, có tên để quản lý |
| `Image` | Bản mô tả môi trường phần mềm; không phải ảnh chụp |
| Container | Môi trường thực thi được tạo từ image |
| Decorator `@...` | Cách gắn cấu hình hoặc hành vi lên hàm/class Python |
| `.local()` | Chạy phần thân hàm ở môi trường máy hiện tại |
| `.remote()` | Gửi lời gọi để Modal thực thi từ xa và trả kết quả |

Bài 003 dùng một hàm tra vị trí theo IP. Chạy local thì trả vị trí mạng của máy giảng viên; chạy remote thì trả vị trí mạng của máy cloud. Mục đích là **chứng minh cùng mã nhưng khác nơi thực thi**, không phải dạy định vị địa lý chính xác.

Mã minh họa theo cấu trúc bài học:

```python
import modal

app = modal.App("hello-demo")
image = modal.Image.debian_slim()

@app.function(image=image)
def hello():
    return "Xin chào từ nơi hàm đang chạy"

with app.run():
    print(hello.local())
    print(hello.remote())
```

Hai dòng in ở ví dụ rút gọn này có cùng nội dung; trong video, giảng viên thêm phần tra IP để thấy sự khác nhau.

`.remote()` không biến máy cá nhân thành máy có GPU mạnh hơn. Phép tính nặng được chuyển sang máy của Modal. Cũng không có nghĩa mọi biến và mọi tài nguyên local tự động tồn tại trên cloud.

### 4.3. Thiết lập và vấn đề môi trường

Bài học dùng `uv run` để chạy lệnh trong môi trường Python của dự án. Đây là lớp quản lý môi trường; không phải cơ chế đưa mã lên cloud.

Bạn cần xác thực máy local với tài khoản Modal. Phụ đề hướng dẫn cấu hình token qua CLI; nếu làm theo, dùng lệnh do tài khoản của chính bạn cung cấp. Không sao chép token của người khác vào dự án.

Với Windows, giảng viên lưu ý notebook có thể lỗi khi hiển thị emoji hoặc Unicode. Kiểm tra UTF-8 và đúng kernel; nếu lệnh Modal gặp lỗi hiển thị trong notebook, thử chạy cùng lệnh ở terminal. Lỗi hiển thị không đồng nghĩa mô hình không chạy được.

Video cũng minh họa chọn vùng chạy ở châu Âu. Mục tiêu là cho thấy vị trí thực thi có thể cấu hình; một thông tin vị trí IP chỉ mang tính minh họa.

## 5. Bài 004: Cho cloud quyền tải mô hình rồi chạy inference

### 5.1. Có hai loại thông tin xác thực khác nhau

| Thông tin | Dùng ở đâu? | Mục đích |
|---|---|---|
| Modal token | Máy hoặc môi trường gọi Modal | Xác thực với Modal để triển khai/gọi tài nguyên |
| Hugging Face token | Môi trường cloud cần truy cập model | Cho phép tải tài nguyên Hugging Face theo quyền tài khoản |

Máy local có token Hugging Face không có nghĩa container trên Modal đã có token đó. Bài 004 giải quyết điều này bằng **Secrets**.

### 5.2. Tên Secret khác tên biến môi trường

Cấu hình trong bài gồm ba phần:

| Phần | Giá trị trong hướng dẫn | Ý nghĩa |
|---|---|---|
| Tên Secret | `huggingface-secret` | Tên để mã Modal tìm cấu hình |
| Key | `HF_TOKEN` | Tên biến môi trường được đưa vào container |
| Value | Token Hugging Face của bạn | Giá trị xác thực thực tế |

Liên tưởng: tên Secret là tên một phong bì; `HF_TOKEN` là nhãn tờ giấy bên trong; value là nội dung tờ giấy. Đổi tên phong bì thì chỗ mã tham chiếu cũng phải đổi theo.

Phụ đề có một số lỗi nhận dạng tên, như “HDF token”; định danh cần dùng là `HF_TOKEN`. Token còn phải có quyền truy cập model mà bạn tải, kể cả các điều kiện truy cập của model nếu có.

### 5.3. Chạy mô hình nền trước để kiểm tra từng lớp

Giảng viên tạo môi trường có `torch`, `transformers`, `accelerate`, gắn Secret, yêu cầu GPU T4 rồi tải tokenizer và LLaMA để sinh văn bản.

Lần thử này giúp kiểm tra chuỗi: **xác thực → có môi trường chạy → tải được model → GPU thực thi được → nhận kết quả**. Nếu bước cơ bản chưa chạy, sửa ngay sẽ dễ hơn mang toàn bộ hệ thống agent vào cùng lúc.

### 5.4. Thay bằng mô hình fine-tune dự đoán giá

Sau đó, bản `pricer_ephemeral` sử dụng lại logic inference từ phần học trước. Các thư viện có thêm `bitsandbytes` và `peft` để phục vụ cách tải mô hình lượng tử hóa và adapter trong bài.

Có thể hiểu quy trình như sau:

1. Tải base model — mô hình nền.
2. Tải adapter/checkpoint đã chọn sau fine-tuning.
3. Chuẩn bị tokenizer và prompt tương ứng.
4. Cho model sinh phần trả lời.
5. Trích xuất số để chương trình nhận được giá dự đoán.

**LoRA adapter** giống phần điều chỉnh chuyên môn gắn lên mô hình nền. Nếu chưa gộp adapter vào model, chỉ tải base model thì chưa sử dụng được kết quả tinh chỉnh đó.

`Revision` giúp chọn phiên bản cụ thể của tài nguyên mô hình. Cần đúng model, đúng adapter và phiên bản tương thích; tên repository giống nhau chưa đảm bảo đang dùng đúng checkpoint từng đánh giá.

Giảng viên dùng từ “ephemeral” cho bản chạy thử có vòng đời tạm thời. Điểm cần thấy là nó hoạt động được nhưng mỗi lượt khởi tạo có thể tốn công chuẩn bị. Tuy nhiên, không nên suy ra mọi lời gọi remote trên Modal luôn cài và tải lại mọi thứ: nền tảng còn có cơ chế tái sử dụng image/container/cache tùy cấu hình.

## 6. Bài 005: Đúng định dạng đầu vào trước khi tối ưu tốc độ

### 6.1. Vì sao phải preprocessing — tiền xử lý?

Trong lúc huấn luyện, model nhìn thấy mô tả theo một định dạng ổn định, có những thông tin như tiêu đề và danh mục. Nếu khi dùng thật bạn đưa một câu quá ngắn hoặc khác cấu trúc, đầu vào không còn giống điều model quen xử lý.

**Ví dụ bổ sung; không phải schema chính xác của khóa học:**

```text
Đầu vào thô:
Micro HyperX QuadCast

Đầu vào có cấu trúc:
Title: HyperX QuadCast microphone
Category: Audio equipment
Description: Microphone for recording and streaming
```

Mục tiêu là giảm sự lệch nhau giữa dữ liệu lúc học và lúc dùng. Hãy hình dung học sinh luôn luyện đề có các mục rõ ràng; lúc kiểm tra cũng nên trình bày theo quy ước tương tự.

Trong bài, preprocessor có thể gọi một mô hình khác để chuyển mô tả thành định dạng cần thiết; giảng viên minh họa lựa chọn local và cloud. Phụ đề không thể hiện đầy đủ định danh cấu hình nên tài liệu này không tự điền tên biến `.env` hay model ID chưa được xác nhận.

**Bổ sung:** Preprocessor không nên bịa thêm dung lượng, tình trạng hoặc phụ kiện. Một mô tả “đúng khuôn” nhưng sai sự thật vẫn làm model định giá sai. Nếu preprocessor chạy qua một dịch vụ khác, nó cũng thêm thời gian và có thể thêm chi phí.

### 6.2. Một kết quả giống nhau không chứng minh tiền xử lý vô ích

Video cho thấy mô tả micro sau tiền xử lý vẫn ra cùng giá như trước. Điều đó chỉ chứng minh **với ví dụ ấy**, đầu ra không đổi. Không đủ kết luận tiền xử lý luôn không cần, cũng không đủ kết luận model luôn miễn nhiễm với thay đổi định dạng.

Muốn biết có lợi hay không, phải so sánh nhiều mẫu theo cùng thước đo. Quy tắc cần nhớ vẫn là giữ cách xử lý đầu vào nhất quán với lúc huấn luyện.

## 7. Bài 005: Từ chạy thử đến dịch vụ được triển khai

### 7.1. Deploy đem lại điều gì?

Ở bước tiếp theo, giảng viên triển khai `pricer_service`. Sau đó chương trình lấy tham chiếu đến hàm theo tên ứng dụng và tên hàm, thay vì chỉ tạo một phiên chạy tạm.

Ví dụ lệnh theo cấu trúc bài:

```bash
uv run modal deploy pricer_service.py
```

Ví dụ cách gọi một hàm đã deploy:

```python
import modal

price = modal.Function.from_name("pricer-service", "price")
result = price.remote(description)
```

`description` là mô tả bạn đã chuẩn bị. Các tên phải khớp deployment thực tế. “Handle” trong lời giảng có thể hiểu là **đối tượng đại diện cho chức năng ở xa**. Nó không tải cả mô hình về máy bạn. Tham khảo cơ chế gọi deployment trong [Modal Docs](https://modal.com/docs/guide/trigger-deployed-functions).

Deploy không mặc nhiên tạo API HTTP công khai, cũng không giữ GPU luôn chạy. Trong bài, chương trình gọi qua Modal SDK.

### 7.2. Vì sao đã deploy mà vẫn chậm?

Deploy giải quyết việc quản lý và tìm lại mã đã triển khai. Nó chưa tự giải quyết tất cả chi phí khởi tạo model.

Thời gian chờ có thể gồm: chờ tài nguyên, khởi động container, tải file nếu chưa có, nạp trọng số vào bộ nhớ và sinh kết quả. Chỉ bước cuối mới là dự đoán theo nghĩa hẹp.

Ví dụ micro trong video trả về 90 USD; giảng viên nói từng mua khoảng 130 USD. Đây là minh họa hệ thống chạy được, không phải bằng chứng giá 90 USD đúng với thị trường hiện tại.

## 8. Bài 005: Class, Volume và hai tầng “lưu lại”

### 8.1. Class giúp tách chuẩn bị và xử lý

Bản `pricer_service2` dùng class để tách:

- **Khởi tạo container:** tải tokenizer/model vào bộ nhớ.
- **Xử lý từng yêu cầu:** dùng model đã nạp để dự đoán giá.

Hook `@modal.enter()` phù hợp cho công việc lúc container khởi động. Nó không phải chỉ chạy một lần vĩnh viễn lúc build image; container mới sẽ cần khởi tạo lại. Đây là chỗ lời giảng dễ bị hiểu nhầm. Xem [Container lifecycle hooks](https://modal.com/docs/guide/lifecycle-functions).

### 8.2. Volume lưu file; bộ nhớ giữ model đang hoạt động

| Nơi chứa | Có gì ở đó? | Lợi ích |
|---|---|---|
| Persistent Volume | File trọng số và cache mô hình | Có thể tái sử dụng file qua các lần container chạy |
| RAM/VRAM của container | Model đã nạp để tính toán | Tái sử dụng model khi container còn hoạt động |

Liên tưởng: sách đã tải về ổ cứng khác với sách đang mở trên bàn. Volume giống nơi cất sách; nạp model vào bộ nhớ giống lấy sách ra để làm việc.

Volume là cơ chế lưu trữ bền vững. Muốn tận dụng cache, thư viện tải model phải thực sự đọc/ghi vào thư mục được gắn Volume. Chỉ tạo một Volume nhưng để model tải sang thư mục khác thì chưa giải quyết được mục tiêu. Xem [Modal Volumes](https://modal.com/docs/guide/volumes).

### 8.3. Cold start và warm request

Trong video, giảng viên quan sát bản đầu khoảng hơn một phút; bản dùng cache khoảng 30 giây khi phải khởi động; gọi lại lúc còn sẵn sàng thì gần như tức thì. Đây là số đo buổi demo, không phải thời gian đảm bảo cho mọi model.

Nếu container đã tắt, file có thể còn trên Volume nhưng model phải được nạp lại. Đó là lý do vẫn có **cold start — khởi động nguội**. Nếu container còn sẵn sàng, yêu cầu có thể được xử lý nhanh hơn — **warm request**.

Có thể giữ container sẵn sàng lâu hơn để giảm chờ, đổi lại tốn thêm tài nguyên. Tài liệu Modal được kiểm tra ngày 16/09/2026 nêu mặc định tối đa 60 giây nhàn rỗi và các tùy chọn `scaledown_window`, `min_containers`; khác con số 2 phút trong video. Không coi giá trị mặc định của video là cố định. Xem [Cold start performance](https://modal.com/docs/guide/cold-start).

### 8.4. Chi phí cần hiểu đúng

Giảng viên nói đến 30 USD credit mỗi tháng. Khi đối chiếu ngày 16/09/2026, [trang Modal](https://modal.com/) vẫn quảng bá 30 USD compute miễn phí/tháng. Tuy nhiên, không thể suy ra mọi cách chạy đều miễn phí hoặc Volume miễn phí mãi mãi.

Credit là khoản dùng thử/ưu đãi theo điều kiện dịch vụ. Giữ GPU chờ cũng có thể tiêu thụ tài nguyên và bị tính phí; không chỉ lúc model sinh câu trả lời mới có chi phí. Phần ghi chú này sửa cách hiểu quá rộng từ lời nói “chỉ trả cho request” trong video.

## 9. Bài 006: Agent đầu tiên thực chất chỉ bọc lời gọi dịch vụ

`SpecialistAgent` lấy class `Pricer` trên Modal, tạo đối tượng đại diện rồi dùng phương thức `price` từ xa.

Mã rút gọn để nhìn rõ cơ chế, đã lược logging và lớp cha:

```python
import modal

class SpecialistAgent:
    def __init__(self):
        RemotePricer = modal.Cls.from_name("pricer-service", "Pricer")
        self.pricer = RemotePricer()

    def price(self, description):
        return self.pricer.price.remote(description)
```

Đoạn này giả định dịch vụ class `Pricer` đã triển khai thành công. Nó là dạng gọi của bản class; không dùng lẫn với bản deployment chỉ có hàm `price` ở bước trước.

Vai trò của wrapper là cho các phần khác một giao diện đơn giản: đưa mô tả vào `price()`, nhận dự đoán về. Chi tiết dịch vụ ở đâu được đặt trong class đó.

Lớp cha `Agent` trong bài chỉ cung cấp logging và màu log theo từng agent. Nó không tự lập kế hoạch, không tự có trí nhớ và không có cơ chế điều phối bí mật. Log màu giúp nhìn rõ ai đang hoạt động.

Giảng viên thử iPhone 14 Pro Max và iPhone X, nhận lần lượt khoảng 700 và 350 USD. Đây là đầu ra demo, không phải báo giá hiện tại hoặc kết quả đã chứng minh độ chính xác.

**Liên hệ với lập trình web:** Có thể hình dung `SpecialistAgent` gần với một service gọi hệ thống bên ngoài. Code bên gọi có thể chạy local; model thực thi trên cloud. Deploy model không đồng nghĩa toàn bộ chương trình điều phối local đã được deploy theo.

## 10. Những điều dễ hiểu sai cần sửa ngay

| Cách hiểu dễ nhầm | Cách hiểu chính xác hơn |
|---|---|
| Đưa lên cloud là huấn luyện tiếp | Đang chạy inference bằng model đã có |
| Serverless không có server | Nền tảng quản lý server và tài nguyên thay bạn |
| Mọi class tên Agent đều tự chủ | Agent trong bài có thể chỉ là wrapper gọi model |
| Deploy xong thì hết cold start | Deployment tồn tại nhưng container vẫn có thể dừng |
| File model còn thì model còn trong GPU | Lưu file và giữ model trong bộ nhớ là hai việc khác nhau |
| Preprocessing tự tăng độ chính xác | Nó giúp nhất quán; hiệu quả phải được đánh giá |
| Model vượt frontier thì giỏi hơn mọi mặt | Phát biểu ấy chỉ liên quan bài toán và đánh giá được nhắc lại; 6 bài này không cung cấp lại đầy đủ bằng chứng |
| Tắt laptop thì hệ thống vẫn tự săn deal | Chỉ dịch vụ định giá đã deploy; chương trình local dừng thì nó không tiếp tục tự điều phối |
| Nhận được một con số là định giá đúng | Cần kiểm tra giá dự đoán với dữ liệu thực tế |

**Bổ sung khi đưa vào sản phẩm:** Phần trích số từ văn bản cần xử lý đầu ra lỗi. Ví dụ “không đủ thông tin” không nên bị đổi thành 0 USD; nếu có nhiều con số, không nên lấy tùy tiện. Nên trả lỗi rõ ràng hoặc yêu cầu thử lại theo quy tắc đã định. Đây là vấn đề thực tế ngoài mục tiêu demo tối thiểu của bài.

## 11. Cách học lại phần này mà không bị ngợp

Học theo từng cột mốc; chưa cần đọc hết mã fine-tune lần nữa:

1. **Nói được mục tiêu:** nhận mô tả sản phẩm và lấy giá dự đoán từ cloud.
2. **Hiểu local/remote:** xác định được máy nào đang thực thi hàm.
3. **Chạy model nền:** kiểm tra quyền truy cập, thư viện và GPU.
4. **Chạy model fine-tune:** xác định base model, adapter và định dạng đầu vào.
5. **Deploy và gọi theo tên:** biết chương trình tìm lại dịch vụ thế nào.
6. **Hiểu cache:** phân biệt file trên Volume với model trong RAM/VRAM.
7. **Bọc thành agent:** hiểu wrapper giúp hệ thống lớn dùng dịch vụ ra sao.

Nếu chỉ muốn hiểu khái niệm, bạn vẫn đạt mục tiêu khi giải thích được các bước trên; giảng viên cũng cho phép theo học theo hướng nắm trực giác mà chưa chạy mã.

### Câu hỏi tự kiểm tra

**1. Tại sao dùng cloud nếu đã có model?**  
Vì cần môi trường thực thi và tài nguyên để ứng dụng gọi model; file trọng số tự nó chưa phải dịch vụ.

**2. Tại sao có hai token?**  
Một token để truy cập Modal, một token để môi trường chạy truy cập Hugging Face.

**3. Tại sao lần hai nhanh hơn?**  
Có thể container vẫn sẵn sàng và model còn trong bộ nhớ, nên tránh khởi tạo lại.

**4. Volume giúp gì khi container đã dừng?**  
Giữ file để tái sử dụng; không tự giữ model hoạt động trong GPU.

**5. SpecialistAgent có tự tìm ưu đãi không?**  
Không trong phần này. Nó nhận mô tả và gọi dịch vụ định giá.

**6. Hệ thống có tự mua món hàng không?**  
Mục tiêu được giới thiệu là phát hiện và thông báo ưu đãi; không phải triển khai tự mua hàng.

## 12. Nguồn và giới hạn đối chiếu

Nguồn nội dung chính là toàn bộ phụ đề bạn cung cấp:

1. `001 Day 1 - Intro to Agentic AI & Serverless Deployment on Modal.srt`
2. `002 Day 1 - Designing Agent Architectures & Modal Platform Setup.srt`
3. `003 Day 1 - Running Python Locally and in the Cloud with Modal Remote Execution.srt`
4. `004 Day 1 - Setting Up Modal Secrets and Deploying LLaMA Models to the Cloud.srt`
5. `005 Day 1 - Deploying Fine-Tuned Models to Modal Cloud with Persistent Storage.srt`
6. `006 Day 1 - Building Your First Agent with Modal Serverless AI.srt`

Phụ đề nhận dạng nhầm một số tên như Modal, Ollama, LoRA và Agentic AI; tài liệu chuẩn hóa tên khi ngữ cảnh xác định rõ. Các chi tiết mã không xuất hiện đầy đủ trong phụ đề, như model ID, revision và schema preprocessing chính xác, không được tự dựng thành mã triển khai hoàn chỉnh. Tài liệu Modal liên kết trong từng phần được dùng để đối chiếu một số cơ chế và thông tin có thể thay đổi, không thay thế nội dung khóa học.
