# Day 3 — Từ tin khuyến mãi trên web đến dữ liệu và thông báo

> Bản giảng giải đầy đủ cho bài 012–014. Nguồn chính: toàn bộ ba file phụ đề SRT bạn cung cấp. Đây là bài giảng được tổ chức lại theo mục tiêu học, không phải bản dịch từng câu hoặc bản chép mã trên màn hình. Ví dụ tự xây dựng và kiến thức bổ sung được ghi rõ.

## 1. Rốt cuộc phần này muốn dạy bạn làm gì?

**Dạy bạn lấy thông tin viết cho con người đọc, chuyển nó thành dữ liệu mà phần mềm xử lý được, rồi dùng dữ liệu đó để thực hiện hành động.**

Ví dụ, website viết:

> “Tai nghe X thường có giá 100 USD. Riêng hôm nay giảm 30 USD, còn 70 USD.”

Con người hiểu ngay giá bán là 70 USD. Nhưng chương trình thấy ba con số: 100, 30 và 70. Nếu chỉ lấy con số đầu tiên, chương trình sẽ hiểu sai.

Ta muốn AI đọc đoạn đó và điền vào một mẫu cố định:

```json
{
  "product_description": "Tai nghe X",
  "price": 70,
  "url": "https://example.com/deal-x"
}
```

Từ đây, chương trình có thể đọc `price`, so sánh với giá ước tính, hiển thị trên giao diện hoặc gửi thông báo. Không cần tiếp tục đoán xem trong một đoạn trả lời dài của AI, đâu là giá và đâu là tên sản phẩm.

**Kỹ năng trung tâm là Structured Outputs — đầu ra có cấu trúc.** Săn khuyến mãi là bài toán minh họa cho kỹ năng đó.

## 2. Ba video nối với nhau như thế nào?

| Bài | Câu hỏi cần giải quyết | Nội dung và kết quả |
| --- | --- | --- |
| 012 — Structured Outputs with Pydantic and Constrained Decoding | Làm sao yêu cầu AI trả lời theo mẫu mà chương trình dùng được? | Hiểu Pydantic, JSON Schema và cách giới hạn token khi sinh câu trả lời. |
| 013 — Building a Deal Scanner with Structured Outputs and Pydantic | Áp dụng kỹ thuật ấy vào tin khuyến mãi thế nào? | Thu thập khoảng 30 tin, chọn 5 tin rõ ràng, trả về mô tả, giá và URL. |
| 014 — Structured Outputs for Parsing & Building a Pushover Notification Agent | Đưa phần thử nghiệm thành thành phần ứng dụng và thông báo ra sao? | Đóng gói ScannerAgent, giải thích giá trị của việc trích xuất thông tin, thêm MessagingAgent và Pushover. |

Giảng viên đang xây dựng dự án *The Price Is Right*. Đầu bài nhắc lại các thành phần đã có: mô hình chuyên biệt, RAG và ensemble để ước tính giá. Phần hôm nay bổ sung **đầu vào có cấu trúc** và **đầu ra thông báo** cho hệ thống đó.

Có thể hình dung toàn dự án như một nhóm người:

- **Scanner:** đọc các mẩu quảng cáo, ghi lại món hàng và giá đang bán.
- **Bộ ước tính giá:** đánh giá sản phẩm thường đáng giá bao nhiêu.
- **Bộ điều phối:** quyết định cần gọi thành phần nào, lúc nào.
- **Messaging:** báo cho bạn khi có thông tin đáng chú ý.

Trong ba bài này, giảng viên tập trung vào Scanner và Messaging. Phần điều phối tự chủ và agent loop được giới thiệu là nội dung tiếp theo, chưa phải phần triển khai hoàn chỉnh của hôm nay.

## 3. Structured Outputs — hãy hình dung một phiếu điền thông tin

### 3.1. Trả lời tự do và trả lời theo mẫu

Nếu bạn nói “hãy tìm món hàng đáng chú ý”, AI có thể trả lời:

> “Tôi thấy tai nghe X khá hấp dẫn. Nó đang giảm mạnh và chỉ còn khoảng 70 USD…”

Câu này dễ đọc, nhưng khó dùng trực tiếp trong chương trình: giá ở đâu, có chính xác không, liên kết ở đâu?

Structured Outputs giống như đưa cho AI một phiếu có sẵn ba ô:

| Ô cần điền | Quy định |
| --- | --- |
| `product_description` | Một chuỗi mô tả sản phẩm. |
| `price` | Một giá trị số. |
| `url` | Một chuỗi chứa liên kết lấy từ nguồn. |

AI vẫn phải đọc hiểu nội dung để điền phiếu. Điểm khác biệt là phần mềm quy định hình dạng câu trả lời.

### 3.2. Ba mức độ dễ bị nhầm

| Cách làm | Ý nghĩa |
| --- | --- |
| Chỉ viết trong prompt: “hãy trả về JSON” | Yêu cầu bằng lời; chương trình vẫn cần đề phòng đầu ra không đúng ý. |
| JSON mode | Hướng tới JSON hợp lệ về cú pháp; chưa tương đương với tuân thủ mẫu trường cụ thể. |
| Structured Outputs theo schema | Ràng buộc đầu ra theo schema được hỗ trợ, chẳng hạn tên trường và kiểu dữ liệu. |

Cần xử lý cả trường hợp bị từ chối hoặc đầu ra không hoàn tất; không nên mặc định mọi lần gọi đều có một đối tượng sử dụng được. Xem [tài liệu Structured Outputs của OpenAI](https://developers.openai.com/api/docs/guides/structured-outputs).

### 3.3. Đúng khuôn mẫu khác với đúng sự thật

Cả hai kết quả sau đều có thể đúng kiểu dữ liệu:

```json
{"product_description": "Tai nghe X", "price": 70, "url": "https://example.com/deal-x"}
```

```json
{"product_description": "Tai nghe X", "price": 30, "url": "https://example.com/deal-x"}
```

Nhưng kết quả thứ hai lấy nhầm **số tiền giảm** thành **giá bán**.

**Schema kiểm soát hình dạng dữ liệu. Nó không tự xác minh nội dung quảng cáo hay cách AI diễn giải nội dung ấy.** Đây là điểm quan trọng nhất cần nhớ khi học phần này.

## 4. Pydantic và JSON Schema có vai trò gì?

### 4.1. Pydantic là người định nghĩa mẫu, không phải AI

Pydantic là thư viện Python dùng để khai báo mô hình dữ liệu và kiểm tra dữ liệu theo kiểu, ràng buộc đã định nghĩa. Lớp kế thừa `BaseModel` cũng có thể tạo JSON Schema. Xem [Pydantic Models](https://pydantic.dev/docs/validation/dev/concepts/models/) và [JSON Schema](https://pydantic.dev/docs/validation/dev/concepts/json_schema/).

Ví dụ tự viết dưới đây giữ cấu trúc chính được mô tả trong video:

```python
from pydantic import BaseModel, Field

class Deal(BaseModel):
    product_description: str = Field(
        description="Mô tả rõ sản phẩm và thông số quan trọng."
    )
    price: float = Field(
        description="Giá bán thực tế, không phải giá gốc hoặc số tiền được giảm."
    )
    url: str = Field(
        description="Liên kết của tin khuyến mãi, lấy từ dữ liệu nguồn."
    )

class DealSelection(BaseModel):
    deals: list[Deal] = Field(
        description="Các tin được chọn vì mô tả chi tiết và giá bán rõ ràng."
    )
```

Đọc bằng tiếng Việt:

- `Deal` là một phiếu thông tin của một tin khuyến mãi.
- `str` nghĩa là văn bản; `float` là số có thể có phần thập phân.
- `DealSelection` là một tập phiếu.
- `list[Deal]` nghĩa là danh sách gồm các đối tượng `Deal`.
- `Field(description=...)` giải thích ý nghĩa trường cho hệ thống và mô hình.

**Phần mô tả “giá bán thực tế” là chỉ dẫn về ý nghĩa, không phải phép kiểm chứng giá.** Tương tự, chỉ ghi “năm tin” trong mô tả chưa tạo ra ràng buộc kỹ thuật về số lượng phần tử.

### 4.2. JSON khác JSON Schema

JSON là **phiếu đã điền**: giá bằng 70, tên là tai nghe X.

JSON Schema là **quy định của phiếu**: phải có những trường nào, mỗi trường nhận loại dữ liệu gì.

Trong Pydantic, có thể xem schema bằng:

```python
schema = DealSelection.model_json_schema()
```

Nếu đã biết TypeScript, bạn có thể liên tưởng cấu trúc của `Deal` đến một `interface`. Tuy nhiên, Pydantic còn thực hiện xử lý/kiểm tra dữ liệu lúc chương trình chạy; riêng TypeScript `interface` không tự kiểm tra phản hồi mạng ở runtime.

### 4.3. Vì sao gọi AI lại nhận được một object Python?

Quy trình khái niệm:

1. Lập trình viên định nghĩa mẫu bằng Pydantic.
2. SDK chuyển mẫu thành schema gửi cùng yêu cầu.
3. Mô hình sinh các token biểu diễn dữ liệu JSON theo cơ chế hỗ trợ schema.
4. SDK đọc JSON, kiểm tra và chuyển thành đối tượng Pydantic.
5. Chương trình sử dụng các thuộc tính của đối tượng.

**LLM không trực tiếp tạo một đối tượng Python trong bộ nhớ của bạn.** Đối tượng đó là kết quả SDK xử lý phản hồi.

Khi đã có kết quả được phân tích thành công, mã phía ứng dụng có thể đơn giản như:

```python
for deal in result.deals:
    print(deal.product_description)
    print(deal.price)
    print(deal.url)
```

`result` ở đây đại diện cho đối tượng đã được SDK parse và ứng dụng kiểm tra. Đây là minh họa cách dùng dữ liệu, không phải chương trình gọi API hoàn chỉnh.

## 5. Constrained Decoding — chặn lựa chọn làm sai khuôn mẫu

Giảng viên nhắc lại: tại mỗi bước sinh, mô hình tạo phân bố xác suất cho những token có thể xuất hiện tiếp theo. Hệ thống sau đó chọn token.

**Constrained Decoding — giải mã có ràng buộc** bổ sung một bước: loại các lựa chọn không hợp lệ với cấu trúc đang được sinh, trước khi chọn token tiếp theo.

Ví dụ trực giác, nếu đang điền trường `price` có kiểu số, hệ thống không cho mô hình chuyển sang một đoạn văn tự do như “tôi nghĩ món này khá rẻ”. Việc kiểm tra diễn ra trên token và trạng thái cấu trúc, không phải chỉ nhìn từng từ theo cách con người đọc.

Ví như điền biểu mẫu điện tử:

- Prompt là lời hướng dẫn “hãy nhập giá vào đây”.
- Ràng buộc là ô nhập được giới hạn theo định dạng cho phép.
- Người điền vẫn có thể nhập nhầm **30** thay vì **70**, dù cả hai đều là số.

Giảng viên mô tả việc đưa xác suất token không hợp lệ về 0. Đây là cách hiểu trực giác về cơ chế giới hạn lựa chọn lúc sinh. Không cần hiểu rằng bên trong nhà cung cấp nhất thiết có một đoạn Python đúng như lời kể. Cơ chế được giải thích trong [bài giới thiệu Structured Outputs của OpenAI](https://openai.com/index/introducing-structured-outputs-in-the-api/).

Vì vậy, giải thích đầu video rằng “chỉ thêm schema vào system prompt” là chưa đủ nếu tách khỏi phần constrained decoding ngay sau đó.

## 6. Bài 013: Scanner lấy 30 tin và trả về 5 tin thế nào?

### 6.1. Thu thập dữ liệu bằng mã thông thường

Theo phụ đề, giảng viên có mã trong `deals.py` để đọc các RSS feed từ DealNews, dùng thư viện `feedparser`, rồi đọc thêm nội dung trang của từng tin.

RSS có thể hình dung là danh sách cập nhật bài viết của website. Nó giúp chương trình tìm các tin mới mà không cần con người mở từng trang danh mục.

Lần chạy minh họa sử dụng ba feed, lấy mười mục từ mỗi feed, nên có ba mươi tin. Đây là cấu hình của ví dụ, không phải yêu cầu của Structured Outputs.

**Đọc RSS và tải nội dung trang không phải công việc do LLM tự làm trong đoạn này.** Mã ứng dụng lấy dữ liệu trước, sau đó mới gửi nội dung cho mô hình.

### 6.2. Ghép dữ liệu vào prompt

Prompt gồm yêu cầu lựa chọn và nội dung các tin đã thu thập. Giảng viên nhấn mạnh:

- Chọn năm tin có mô tả đủ chi tiết.
- Giá bán phải rõ ràng.
- Không nhầm “giảm 100 USD” thành “bán với giá 100 USD”.

Giảng viên nói rõ prompt này có được sau nhiều lần thử và gặp lỗi. Bài học thực tế là: **prompt tốt thường xuất phát từ việc quan sát những trường hợp hệ thống hiểu sai.**

### 6.3. Chọn tin rõ ràng không đồng nghĩa xác định được món hời nhất

Một tin “giảm tới 80%” nghe hấp dẫn nhưng không chỉ rõ model hoặc giá cuối cùng có thể khó sử dụng hơn tin “laptop model X, RAM 16 GB, SSD 512 GB, giá 550 USD”.

Scanner cần dữ liệu đủ tốt để các bước sau đánh giá. Nó chưa có căn cứ kết luận giá 550 USD là rẻ chỉ vì bài quảng cáo nói vậy.

| Thành phần | Câu hỏi nó xử lý |
| --- | --- |
| Scanner | Sản phẩm nào? Giá đang bán bao nhiêu? Nguồn ở đâu? Tin có đủ rõ không? |
| Bộ ước tính giá | Với mô tả này, sản phẩm có thể đáng giá khoảng bao nhiêu? |
| Logic đánh giá cơ hội | Chênh lệch có đủ đáng quan tâm không? |

### 6.4. Gọi mô hình với định dạng `DealSelection`

Giảng viên chuyển từ cách lấy câu trả lời văn bản sang lời gọi parse, truyền `DealSelection` làm định dạng phản hồi. Kết quả dùng là dữ liệu đã parse thay vì chỉ lấy `message.content` dạng văn bản.

Không nên học thuộc các đoạn phụ đề méo như “response zero…”: chúng là lỗi nhận dạng lời nói, không phải cú pháp Python. Khi triển khai, hãy dựa vào tài liệu SDK và mã nguồn thực tế.

Ở cuối demo, giảng viên mở lại trang nguồn để kiểm tra một thiết bị theo dõi sức khỏe giá khoảng 15 USD và một máy Dell giá khoảng 550 USD. Đây là kết quả của lần demo, không phải mức giá hiện tại hay lời khuyên mua hàng.

**Việc mở lại nguồn để đối chiếu chính là kiểm tra nội dung, bổ sung cho việc kiểm tra schema.**

## 7. Bài 014: Từ notebook sang ScannerAgent

Notebook thuận tiện để thử từng bước. Khi muốn tái sử dụng, giảng viên đóng gói logic thành `ScannerAgent`, bổ sung chú thích, type hints và logging.

Luồng trách nhiệm vẫn là:

1. Lấy tin.
2. Tạo prompt.
3. Gọi mô hình với định dạng phản hồi.
4. Trả về kết quả đã parse.

Logging giúp biết chương trình đang tải tin hay chờ mô hình; màu log giúp phân biệt các thành phần. Đó là công cụ quan sát chương trình, không làm mô hình suy luận tốt hơn.

Gọi `scan()` khiến phía sử dụng không phải lặp lại toàn bộ các bước trong notebook. Tuy vậy, thêm một lớp tên `Agent` chưa làm chương trình trở thành hệ thống tự chủ. Ở đây chủ yếu là một thành phần có trách nhiệm rõ trong workflow.

## 8. Vì sao trích xuất dữ liệu bằng LLM có giá trị?

Giảng viên nhấn mạnh LLM giúp xử lý văn bản có cách diễn đạt rất đa dạng. Ví dụ cùng một mức giảm có thể được viết theo nhiều cách, trong khi parser viết bằng quy tắc cố định dễ cần thêm nhiều trường hợp riêng.

Ví dụ bổ sung:

| Dữ liệu đầu vào | Dữ liệu có thể trích xuất |
| --- | --- |
| CV viết theo nhiều bố cục | Kinh nghiệm, kỹ năng, học vấn. |
| Email đặt hàng | Tên hàng, số lượng, địa chỉ được nêu trong thư. |
| Tin hỗ trợ khách hàng | Vấn đề, mức độ ưu tiên, nhóm xử lý dự kiến. |
| Mô tả sản phẩm | Tên, thông số, giá và điều kiện bán. |

Tuy nhiên, nhận xét trong video rằng việc này đã gần như được “giải quyết” cần hiểu là đánh giá về tiến bộ, không phải cam kết không còn lỗi. Chính giảng viên cũng nhắc tới chi phí, độ trễ và sự khó đoán của LLM.

Nếu nguồn thiếu dữ liệu, không nên ép mô hình bịa để điền đủ. Trong ứng dụng thật, có thể thiết kế trường cho phép giá trị thiếu, đánh dấu cần kiểm tra hoặc bỏ qua tin không đủ thông tin.

## 9. Pushover và MessagingAgent: ai thực sự gửi thông báo?

### 9.1. Hai công việc tách biệt

- **LLM:** viết câu thông báo, nếu cần diễn đạt linh hoạt.
- **Mã ứng dụng và Pushover:** chuyển thông báo tới điện thoại.

Ví dụ bổ sung, nếu đã có tên hàng và giá, bạn có thể dùng mẫu cố định:

> “Tai nghe X đang được bán với giá 70 USD. Xem chi tiết tại liên kết đính kèm.”

Không cần gọi thêm LLM để tạo câu đó.

Trong video, giảng viên dùng Claude Sonnet 4.5 viết thông điệp hào hứng hơn, sau đó gọi Pushover và chọn âm thanh máy tính tiền. Giảng viên cũng thừa nhận bước viết bằng LLM là tùy chọn; có thể bỏ hoặc thay nhà cung cấp.

### 9.2. Hai loại khóa cần phân biệt

| Thông tin | Vai trò | Tên biến trong bài |
| --- | --- | --- |
| User Key | Xác định người nhận. | `PUSHOVER_USER` |
| Application/API Token | Xác định ứng dụng gửi. | `PUSHOVER_TOKEN` |

Không nên nhận diện khóa chỉ bằng chữ cái đầu `u` hoặc `a` như mẹo trong lời giảng. Hãy sao chép đúng trường được gắn nhãn trên giao diện. API dùng các trường `token`, `user` và `message`. Xem [Pushover API](https://pushover.net/api).

Trình tự thiết lập về mặt khái niệm:

1. Tạo tài khoản Pushover và cài ứng dụng trên điện thoại.
2. Lấy User Key.
3. Tạo ứng dụng để lấy Application/API Token.
4. Lưu hai giá trị ở phía máy chủ, chẳng hạn qua biến môi trường.
5. Tải lại cấu hình nếu notebook đã đọc môi trường trước đó.
6. Gửi thử một thông báo để xác nhận cấu hình.

Chỉ kiểm tra biến có tồn tại; không cần in nguyên khóa ra log hay đưa vào mã frontend. Trang Pushover nêu thời gian dùng thử 30 ngày; đừng hiểu phần demo là dịch vụ miễn phí vĩnh viễn. Xem [trang chính thức Pushover](https://pushover.net/).

Đây là hướng dẫn hiểu nội dung video; tài liệu này không gửi thông báo hay tạo tài khoản thay bạn.

### 9.3. Có thêm LLM chưa chắc có thêm giá trị

Nếu mục tiêu chỉ là báo đúng tên hàng, giá và đường dẫn, mẫu câu cố định thường đã đủ. Nếu muốn cá nhân hóa ngôn ngữ hoặc tóm tắt điều kiện mua, LLM có thể hữu ích hơn.

Thông điệp càng hào hứng không có nghĩa ưu đãi càng tốt. Nên giữ nội dung thông báo bám vào dữ liệu đã được kiểm tra, tránh tự thêm nhận xét “rẻ nhất thị trường”.

## 10. Một ví dụ nối các thành phần lại với nhau

> Ví dụ tự xây dựng để giải thích kiến trúc; không phải kết quả chạy trong video.

Nguồn ghi: “Tai nghe X giá gốc 100 USD, giảm 30 USD, hôm nay còn 70 USD”.

| Bước | Đầu vào | Kết quả |
| --- | --- | --- |
| Thu thập | RSS và trang tin | Đoạn văn, URL nguồn. |
| Scanner | Đoạn văn và schema | Mô tả tai nghe X, giá 70 USD, URL. |
| Kiểm tra | Dữ liệu Scanner và nguồn | Xác nhận 70 là giá bán, sản phẩm được nhận diện đủ rõ. |
| Ước tính giá | Mô tả sản phẩm | Giả sử bộ ước tính đưa ra 95 USD. |
| Quyết định | 95 USD và 70 USD | Chênh lệch ước tính 25 USD. |
| Thông báo | Dữ liệu đã chọn | Tin nhắn có giá và liên kết. |

Chênh lệch 25 USD là chênh lệch so với **ước tính**, chưa phải lợi nhuận chắc chắn. Có thể còn phí vận chuyển, điều kiện coupon hoặc khác biệt phiên bản sản phẩm.

Ba bài đang cung cấp những mảnh ghép cho luồng này; không nên coi chúng là một hệ thống săn ưu đãi tự chủ hoàn chỉnh đã được kiểm chứng.

## 11. Những kiểm tra nên bổ sung khi tự làm

> Phần bổ sung để hiểu giới hạn thực tế, không phải danh sách tính năng đã được triển khai đầy đủ trong video.

| Rủi ro | Cách xử lý phù hợp |
| --- | --- |
| Nhầm số tiền giảm với giá bán | Dùng ví dụ khó trong prompt, đối chiếu nguồn và kiểm tra bộ ca mẫu. |
| Có ít hơn năm tin đáng tin | Cho phép ít hơn năm hoặc trả trạng thái thiếu dữ liệu; đừng ép bịa đủ. |
| URL có dạng chuỗi nhưng sai nguồn | Đối chiếu URL với danh sách liên kết đã thu thập. |
| Giá đúng con số nhưng sai tiền tệ | Lưu thêm tiền tệ nếu có nhiều thị trường. |
| Phản hồi bị từ chối hoặc không hoàn tất | Xử lý trạng thái lỗi trước khi đọc đối tượng đã parse. |
| Gửi cùng một tin nhiều lần | Ghi nhận tin đã gửi, dùng định danh hoặc URL để chống trùng. |
| Nội dung website chứa lời sai khiến AI | Coi nội dung tải về là dữ liệu, không phải chỉ dẫn có quyền điều khiển ứng dụng. |

Bốn ca kiểm tra dễ hiểu:

1. “Giá gốc 500 USD, giảm 100 USD” → giá bán suy ra là 400 USD, nếu không có điều kiện khác.
2. “Giảm tới 100 USD” → chưa đủ biết giá bán.
3. “Giá 400 USD khi nhập mã X” → phải giữ điều kiện mã giảm giá.
4. “Trả góp 20 USD/tháng” → không được mặc định giá toàn bộ sản phẩm là 20 USD.

## 12. Tự kiểm tra bạn đã hiểu chưa

**Câu 1: Pydantic có phải mô hình AI không?**  
Không. Nó định nghĩa và xử lý mô hình dữ liệu.

**Câu 2: LLM có ngừng sinh token để tạo object Python không?**  
Không. LLM vẫn sinh đầu ra; SDK chuyển dữ liệu phản hồi thành object.

**Câu 3: Giá là số hợp lệ thì đã đúng chưa?**  
Chưa. Nó có thể là giá gốc, số tiền giảm hoặc khoản trả góp bị hiểu nhầm.

**Câu 4: Scanner chọn năm tin thì đã tìm được năm món hời nhất chưa?**  
Chưa. Phần này ưu tiên tin rõ ràng để tiếp tục đánh giá.

**Câu 5: Muốn gửi push có bắt buộc dùng Claude không?**  
Không. Claude chỉ viết lời thông báo trong demo; Pushover và mã ứng dụng thực hiện việc gửi.

**Câu 6: Kỹ năng có thể đem sang dự án khác là gì?**  
Thiết kế schema, dùng LLM trích xuất thông tin, kiểm tra kết quả và đưa dữ liệu đó vào workflow.

## 13. Cách học phần này để không bị ngợp

Hãy học theo thứ tự: hiểu đầu vào/đầu ra → hiểu mẫu `Deal` → hiểu cách Scanner tạo danh sách → hiểu giới hạn đúng schema → hiểu thông báo.

Bạn chưa cần thuộc cú pháp gọi API, tên model hay âm thanh thông báo. Điều cần nắm là: **AI đọc hiểu nội dung; schema quy định đầu ra; chương trình kiểm tra và hành động.**

## Nguồn và phạm vi

Nguồn chính là ba phụ đề đi kèm: bài 012 về Structured Outputs, bài 013 về Deal Scanner và bài 014 về ScannerAgent/Pushover. Các con số 30 tin, 5 lựa chọn và giá trong demo được trình bày theo lời giảng. Không dùng chúng như dữ liệu thị trường hiện tại.

Tài liệu chính thức được liên kết tại các đoạn bổ sung để làm rõ cơ chế và giới hạn. Các đoạn code ở đây là ví dụ giảng giải tự viết, không phải mã nguồn đầy đủ trích từ video và chưa được chạy tích hợp với API trả phí.
