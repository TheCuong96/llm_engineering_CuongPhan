# Day 5 — Hoàn thiện ứng dụng AI Agent săn deal và tổng kết khóa học

> **Ý chính:** Đưa hệ thống AI đã xây dựng thành một ứng dụng có giao diện, nhớ các deal từng tìm được, chạy định kỳ và chủ động gửi thông báo khi phát hiện cơ hội đáng chú ý.
>
> Tài liệu giảng lại bằng tiếng Việt từ toàn bộ phụ đề bài 019–021 và HTML bài 022 được cung cấp. Không phải bản chép lời. Các ví dụ, phân tích giới hạn và bài tập được bổ sung để giúp hiểu bài; không phải mã nguồn nguyên bản của giảng viên. Chưa đối chiếu từng khung hình video hay chạy repository của khóa học.

## 1. Vì sao phần này dễ gây khó hiểu?

Bạn có thể đang chờ giảng viên dạy một kỹ thuật AI mới, nhưng lại thấy họ nói về giao diện, file JSON, bảng dữ liệu và bộ hẹn giờ. Nguyên nhân là **đây là phần tích hợp cuối dự án**, không phải một bài huấn luyện mô hình mới.

Ở những phần trước, các thành phần đã biết lấy deal, ước lượng giá và phối hợp xử lý. Câu hỏi của ngày cuối là:

> Làm sao biến những thành phần đó thành ứng dụng mà người dùng có thể mở lên, theo dõi và nhận kết quả mà không phải tự chạy từng ô notebook?

Hãy hình dung bạn xây một đội săn hàng giảm giá. Trước đó bạn đã có người tìm hàng, người định giá và người báo tin. Bây giờ bạn cần thêm bàn điều phối, sổ ghi chép, bảng theo dõi và đồng hồ nhắc cả đội làm việc.

| Bài | Nội dung thực sự | Bạn cần hiểu điều gì? |
|---|---|---|
| 019 — Finalizing Your Agentic Workflow | Nhắc lại năng lực đã học và các cách hiểu về agent | Vì sao dự án được gọi là agentic và phần nào còn thiếu |
| 020 — Building the Price-Is-Right Agent UI | Thêm lớp kết nối, bộ nhớ, giao diện và timer | Cách đóng gói workflow thành ứng dụng |
| 021 — Course Wrap-Up | Chạy demo hoàn chỉnh, tổng kết 8 tuần | Các phần phối hợp ra sao và ý nghĩa của kết quả |
| 022 — Bonus Lecture | Giới thiệu khóa học và liên kết ưu đãi | Đây là tài liệu tham khảo/giới thiệu, không phải bài kỹ thuật mới |

## 2. Ứng dụng cuối cùng đang giải quyết vấn đề gì?

Ứng dụng mang tên **The Price Is Right**, dùng để săn deal: tìm sản phẩm đang được bán với giá có vẻ thấp so với giá trị mà hệ thống ước lượng.

Một vòng làm việc có thể được hiểu như sau:

1. Lấy các tin sản phẩm từ nguồn deal.
2. Đọc và chuyển thông tin thành dữ liệu có cấu trúc.
3. Dùng các thành phần định giá để ước lượng giá sản phẩm.
4. Đánh giá mức chênh lệch giữa giá ước lượng và giá bán.
5. Nếu cơ hội đáp ứng tiêu chí, gửi thông báo và lưu lại.
6. Hiển thị kết quả và quá trình xử lý trên giao diện.
7. Đến lần hẹn tiếp theo, thực hiện một vòng mới.

**Ví dụ bổ sung, không phải số liệu trong video:** Một tai nghe có giá bán 80 USD. Hệ thống ước lượng giá hợp lý là 120 USD. Chênh lệch ước tính là `120 − 80 = 40 USD`, tương đương khoảng `33,3%` nếu lấy giá ước lượng làm mẫu số.

Điều đó có nghĩa là “đáng xem xét”, không chứng minh món hàng chắc chắn rẻ hơn thị trường. Mô hình có thể đọc nhầm phiên bản, bỏ qua tình trạng hàng cũ hoặc định giá sai. Cột “discount” cần được hiểu theo cách tính của mã nguồn; phụ đề chỉ liệt kê tên cột, không xác nhận công thức hay đơn vị.

**Đầu ra của demo là đề xuất và thông báo; phụ đề không mô tả ứng dụng tự mua hàng.**

## 3. Bài 019 — Hiểu đúng AI Agent và Agentic Workflow

### 3.1. Ba góc nhìn giảng viên nhắc lại

Giảng viên đưa ra ba cách diễn đạt về agent:

- Một hệ thống AI có thể làm việc tương đối độc lập.
- Một hệ thống mà LLM tham gia điều khiển quy trình.
- Một LLM nằm trong vòng lặp, có công cụ để tiến tới mục tiêu.

Đây là các góc nhìn được nêu trong bài giảng, không phải một định nghĩa tiêu chuẩn duy nhất.

Một cách dễ hiểu: bạn giao mục tiêu “tìm deal đáng chú ý”, rồi hệ thống có khả năng chọn hành động, sử dụng công cụ, xem kết quả và quyết định bước tiếp theo.

### 3.2. Tool Calling — Gọi công cụ

LLM tự nó không phải là chương trình gửi thông báo hay đọc RSS. Nó có thể yêu cầu một công cụ làm việc đó; mã ứng dụng tiếp nhận yêu cầu và thực thi.

Ví dụ bổ sung:

- LLM yêu cầu lấy danh sách sản phẩm.
- Chương trình gọi hàm lấy dữ liệu.
- Kết quả được đưa lại cho LLM.
- LLM quyết định cần định giá tiếp hay kết thúc.

**LLM đề xuất/gọi hành động qua giao thức công cụ; chương trình mới là nơi thực thi hành động.**

### 3.3. Agent loop khác timer thế nào?

| Thành phần | Câu hỏi nó giải quyết | Ví dụ |
|---|---|---|
| Agent loop — Vòng lặp agent | Trong lần chạy hiện tại, bước tiếp theo là gì? | Lấy deal → định giá → xem kết quả → quyết định thông báo |
| Timer — Bộ hẹn giờ | Khi nào bắt đầu một lần chạy nữa? | Sau 5 phút kích hoạt lại |
| Memory — Bộ nhớ | Lần trước hệ thống đã biết/làm gì? | Các deal từng được tìm thấy |

Đây là ba chức năng khác nhau. Một script chạy theo lịch chưa chắc đã là agent. Ngược lại, agent được người dùng bấm nút khởi động vẫn có thể tự điều phối các bước trong lần chạy đó.

Trong bài, giảng viên muốn tăng tính tự động bằng cách cho hệ thống chạy lặp lại theo thời gian và giữ lịch sử giữa các lần chạy. Việc cần một lần khởi động ban đầu không tự động làm mất tính agentic của hệ thống.

### 3.4. Multi-agent không có nghĩa là nhiều “người máy” độc lập

Có thể hiểu các agent là những vai trò chuyên trách: quét deal, định giá, điều phối, nhắn tin. Một vai trò có thể chỉ là một lớp Python bọc lời gọi mô hình hoặc một công cụ. Không phải mỗi agent đều được huấn luyện riêng hay chạy trên một máy riêng.

Giá trị nằm ở việc phân chia trách nhiệm để dễ kết nối, quan sát và thay đổi. Càng nhiều agent không đồng nghĩa hệ thống càng tốt.

## 4. Bài 020 — DealAgentFramework: lớp kết nối của dự án

### 4.1. Vì sao nói không dùng framework mà lại có DealAgentFramework?

Giảng viên giải thích đây là module tự viết để nối các thành phần lại với nhau và đưa ứng dụng ra khỏi cách chạy notebook. Tên có chữ “Framework” không có nghĩa đây là một thư viện agent bên ngoài.

Hãy xem nó như **người quản lý ứng dụng**: chuẩn bị các thành phần, nạp dữ liệu cũ, bắt đầu xử lý và lưu kết quả.

| Thành phần được nói tới | Vai trò |
|---|---|
| Thiết lập logging | Chuẩn bị việc ghi nhận hoạt động |
| `read_memory` | Đọc lịch sử từ file JSON |
| `write_memory` | Lưu lịch sử vào file JSON |
| `reset_memory` | Thu gọn dữ liệu về hai mục như cấu hình demo |
| Hàm ghi log | Ghi thông tin hoạt động |
| `run` | Khởi động quy trình xử lý |

Phụ đề có chỗ mô tả reset giữ “hai mục đầu”, chỗ khác nói “hai mục gần đây”. Vì chưa kiểm tra mã nguồn, điểm chắc chắn là demo **giữ lại hai mục**, không phải xóa sạch toàn bộ và không thể kết luận chính xác giữ đầu hay cuối.

### 4.2. Tách notebook khỏi ứng dụng để làm gì?

Notebook thích hợp để thử từng bước và xem kết quả ngay. Nhưng khi dùng thường xuyên, việc tự chạy đúng thứ tự từng ô rất bất tiện.

Chuyển logic sang module giúp tập hợp quy trình vào một điểm gọi rõ ràng. Giao diện chỉ cần yêu cầu ứng dụng thực hiện nhiệm vụ, thay vì chứa tất cả logic AI.

**Liên hệ với frontend:** Gradio tương tự phần giao diện; DealAgentFramework gần với lớp điều phối nghiệp vụ; các agent/tool giống những service chuyên trách. Đây là phép so sánh để hiểu trách nhiệm, không phải khẳng định kiến trúc triển khai giống hệt ứng dụng React/API.

## 5. Memory — Bộ nhớ ở đây đơn giản đến mức nào?

### 5.1. Đó là dữ liệu lưu trên đĩa

Trong demo, memory là lịch sử các deal đã được hệ thống đưa ra, được đọc/ghi trong `memory.json`.

Ví dụ minh họa một bản ghi, không phải schema nguyên bản:

```json
{
  "description": "Tai nghe không dây",
  "price": 80,
  "estimate": 120,
  "url": "https://example.com/deal/123"
}
```

Lần chạy sau, chương trình đọc lại dữ liệu này. Hệ thống vì thế không phải bắt đầu từ một lịch sử trống.

### 5.2. Lưu file không có nghĩa LLM tự biết nội dung file

Có ba việc cần phân biệt:

1. **Lưu trữ:** dữ liệu tồn tại trong JSON.
2. **Sử dụng trong chương trình:** ứng dụng đọc dữ liệu để hiển thị hoặc so sánh.
3. **Cung cấp cho LLM:** chương trình đưa dữ liệu liên quan vào prompt hoặc cho LLM truy xuất qua tool.

LLM chỉ sử dụng được lịch sử khi ứng dụng cung cấp nó theo một cơ chế phù hợp. Chỉ tạo file JSON trên máy chưa đủ.

Giảng viên nêu hai kiểu memory thường gặp: công cụ để tra cứu, hoặc nội dung được đưa vào prompt. Trường hợp của dự án liên quan đến những deal đã được tìm thấy trước đó.

### 5.3. Memory không phải Fine-tuning hay Vector Database

| Khái niệm | Có thể hình dung như | Trong bài này |
|---|---|---|
| Memory | Sổ ghi chép mà ứng dụng mở lại | Lịch sử deal trong JSON |
| Prompt/context | Tài liệu đưa cho mô hình ở lần gọi hiện tại | Có thể chứa thông tin lịch sử |
| Fine-tuning | Huấn luyện thêm để thay đổi tham số học được | Không diễn ra khi ghi `memory.json` |
| Vector database | Kho hỗ trợ tìm dữ liệu theo độ tương đồng biểu diễn vector | Không phải yêu cầu để lưu lịch sử JSON này |

**Ứng dụng nhớ thêm một deal không có nghĩa mô hình vừa được học thêm deal đó bằng huấn luyện.**

Lịch sử có thể hỗ trợ tránh đề xuất trùng. Tuy nhiên, lưu lịch sử không tự bảo đảm chống trùng tuyệt đối; cần xem cách mã nguồn so sánh URL/ID và cách xử lý các lần chạy đồng thời. Đây là phần giải thích bổ sung.

### 5.4. Pydantic góp phần gì?

Các đối tượng deal trong bài được biểu diễn bằng Pydantic. Nhờ vậy, dữ liệu có cấu trúc rõ ràng và thuận tiện chuyển sang JSON để lưu, rồi dựng lại khi đọc.

Hình dung đó là một mẫu phiếu có các ô quy định sẵn. Pydantic giúp kiểm tra phiếu có đúng cấu trúc và kiểu dữ liệu theo schema hay không. Nó không chứng minh giá sản phẩm trên phiếu là sự thật.

## 6. Gradio — Làm bảng điều khiển cho hệ thống

Gradio được dùng để tạo giao diện bằng Python. Mục đích trong bài là nhanh chóng quan sát được ứng dụng đang làm gì và đã tìm được gì.

### 6.1. Các thành phần chính

| Thành phần | Vai trò trong demo |
|---|---|
| `Blocks` | Ghép giao diện từ nhiều thành phần |
| Markdown | Hiển thị tiêu đề và mô tả |
| Dataframe | Bảng gồm mô tả, giá, giá ước lượng, discount và URL |
| Callback | Hàm chạy khi có sự kiện và trả dữ liệu cho giao diện |
| Vùng log | Hiển thị hoạt động của các agent |
| Timer | Kích hoạt lần xử lý tiếp theo theo chu kỳ |

Giảng viên làm từng bước: tạo trang trống, thêm bảng với dữ liệu giả, rồi chuyển sang module ứng dụng hoàn chỉnh hơn. Dữ liệu giả dùng để kiểm tra cách hiển thị, chưa phải kết quả AI.

### 6.2. Callback là gì?

Callback là “hàm được gọi khi một sự kiện xảy ra”. Trong ví dụ của bài, khi giao diện tải lên, một hàm lấy dữ liệu bảng được gọi; đầu ra được nối vào bảng Gradio.

Nếu quen frontend, bạn có thể hình dung: khi màn hình sẵn sàng, lấy danh sách deal rồi cập nhật bảng. Điểm quan trọng là **callback nối sự kiện với logic xử lý và nơi nhận kết quả**.

### 6.3. Vì sao cần log ngoài bảng kết quả?

Bảng cho biết **đã có kết quả gì**. Log cho biết **hệ thống đang làm gì**.

Chẳng hạn chưa có deal mới có thể vì đang lấy RSS, đang gọi mô hình, chờ mô hình từ xa khởi động, hoặc không có deal đủ điều kiện. Nếu chỉ nhìn bảng, các trường hợp này rất khó phân biệt.

Trong demo, giảng viên thu log để hiển thị trên Gradio và cũng cho thấy log ở terminal. Phần xử lý hiển thị được mô tả là khá nhiều mã hỗ trợ; bài không đi sâu để dạy toàn bộ Gradio.

### 6.4. Timer 5 phút có nghĩa gì?

Giảng viên thêm bộ hẹn giờ để cứ khoảng 5 phút hệ thống lại thực hiện công việc. Đây là phần giúp giảm nhu cầu người dùng tự bấm chạy.

**Giải thích bổ sung:** “Cứ 5 phút” không đồng nghĩa ứng dụng tự tồn tại mãi mãi. Nó cần tiến trình và môi trường chạy còn hoạt động. Phụ đề chưa đủ để xác nhận hành vi khi đóng trình duyệt, nhiều người mở giao diện hoặc một lần chạy kéo dài hơn chu kỳ timer. Muốn dùng như dịch vụ nền đáng tin cậy cần kiểm tra cơ chế kích hoạt thực tế.

Tài liệu này không dựng lại lệnh khởi chạy từ phụ đề vì cách nhận diện tên file trong lời nói có thể sai; nên lấy tên file/lệnh chính xác từ repository đi kèm khóa học.

## 7. Bài 021 — Đọc demo như thế nào để hiểu hệ thống?

### 7.1. Các dấu hiệu cần chú ý

Khi ứng dụng được mở, giảng viên cho thấy:

1. Lịch sử các deal cũ xuất hiện ở phía trên.
2. Log các agent xuất hiện phía dưới.
3. Scanner lấy deal từ RSS và gọi OpenAI với structured outputs.
4. Specialist gọi mô hình đã fine-tune chạy từ xa trên Modal.
5. Các thành phần định giá tiếp tục hoạt động, trong đó có frontier agent.
6. Hệ thống phát thông báo; một đề xuất laptop Dell giá khoảng 550 USD xuất hiện trong lịch sử.
7. Ứng dụng được thiết kế để tiếp tục chạy lại mỗi 5 phút.

Đây là bằng chứng về **sự tích hợp của demo**. Nó không phải phép kiểm định tổng quát rằng mọi đề xuất của hệ thống đều tốt.

### 7.2. Cold start — Vì sao phải chờ mô hình “ấm lên”?

Trong lần trình diễn, giảng viên nói chờ khoảng 30 giây để mô hình từ xa sẵn sàng. Có thể hiểu như mở một cửa hàng đang đóng: cần thời gian khởi động trước khi phục vụ.

Đây là thời gian được mô tả trong demo, không phải cam kết cố định của Modal hay mọi mô hình. Bài học là độ trễ toàn hệ thống còn có thể đến từ việc khởi động hạ tầng, không chỉ thời gian LLM sinh câu trả lời.

### 7.3. Hình 3D có nhiệm vụ gì?

Giảng viên nói rõ phần hình 3D được đưa vào vì trông đẹp, không có mục đích thương mại trong demo đó. Không nên xem việc có biểu đồ 3D là điều kiện để ứng dụng AI hoạt động hoặc có giá trị.

Cũng không nên đồng nhất phần trực quan hóa dữ liệu với cơ chế lịch sử `memory.json`: một bên là cách trình bày, một bên là lưu trạng thái ứng dụng.

### 7.4. Nhiều lời gọi mô hình có phải điểm mạnh?

Giảng viên nêu con số 34 lời gọi mô hình, trong đó 29 là lời gọi LLM, để nhấn mạnh quy mô phối hợp trong dự án. Phụ đề không cung cấp bảng phân rã để kiểm chứng cách đếm hoặc phạm vi tính.

**Bài học bổ sung:** nhiều lời gọi có thể tăng chi phí, độ trễ và điểm có thể lỗi. Đánh giá hệ thống bằng chất lượng đề xuất, tốc độ và chi phí mới hữu ích hơn việc đếm agent.

## 8. Toàn bộ khóa học đang muốn dạy điều gì?

Bài tổng kết nối các tuần thành một chuỗi năng lực:

| Tuần | Nội dung được nhắc lại | Ý nghĩa dễ hiểu |
|---|---|---|
| 1 | Token, nền tảng, chat completions | Hiểu cách gửi yêu cầu cho LLM |
| 2 | API, giao diện, đa phương thức, công cụ | Cho mô hình tương tác với ứng dụng và loại dữ liệu khác |
| 3 | Colab, Hugging Face, pipelines, Transformers | Làm việc trực tiếp với các mô hình mở |
| 4 | Chọn LLM và sinh mã, chuyển Python sang C++ | Chọn công cụ phù hợp với nhiệm vụ |
| 5 | RAG, có/không dùng LangChain, đánh giá | Bổ sung thông tin phù hợp cho mô hình và kiểm tra kết quả |
| 6 | Dataset, các baseline/mô hình, fine-tune mô hình dịch vụ | Thử phương án trên dữ liệu và đo hiệu quả |
| 7 | Fine-tune mô hình mở LLaMA 3.2 | Chuyên môn hóa một mô hình cho bài toán cụ thể |
| 8 | RAG, ensemble, triển khai và agent workflow | Ghép các kỹ thuật thành ứng dụng hoàn chỉnh |

Giảng viên kể rằng fine-tuning ở tuần 6 không cho kết quả mong muốn, mô hình mở cải thiện ở tuần 7, rồi RAG và ensemble đạt kết quả tốt trong tuần 8.

Ý nghĩa cần giữ lại: **không có một kỹ thuật luôn thắng**. Mô hình chuyên biệt có thể tốt ở một nhiệm vụ; dữ liệu truy xuất có thể giúp một mô hình khác; kết hợp mô hình có thể hữu ích nếu được đánh giá đúng.

Con số “29 phẩy…” trong phần tổng kết không đủ thông tin trong phụ đề để tự xác định tên chỉ số và cách đo. Không nên biến nó thành “độ chính xác 29%” hay suy diễn một công thức đánh giá.

Lời chúc “bạn đã là AI Engineer” mang tính động viên kết thúc khóa học. Năng lực thực tế thể hiện qua khả năng tự xây, giải thích, đánh giá và sửa hệ thống, không chỉ qua việc xem hết video.

## 9. Bài 022 — Phần bonus có cần học kỹ không?

HTML này giới thiệu sáu hướng học của giảng viên:

| Hướng học | Nội dung được mô tả trong tài liệu |
|---|---|
| AI Builder | Agent, voice agent và tự động hóa bằng n8n |
| AI Coder | Dùng coding agent như Claude Code để làm phần mềm |
| AI Leader | Ứng dụng AI để tạo giá trị kinh doanh |
| AI Engineer Core | LLM, RAG, QLoRA và các nền tảng ứng dụng |
| AI Engineer Agentic | Agent tự chủ và MCP |
| AI Engineer Production | Triển khai, mở rộng, quan sát, độ bền và bảo mật |

Tài liệu cũng giải thích cơ chế liên kết ưu đãi và thời điểm cập nhật theo lời tác giả. Đây là nội dung giới thiệu thương mại, không phải kiến thức cốt lõi cần ghi nhớ để hiểu Day 5. Không có kiểm tra giá hay tình trạng ưu đãi hiện tại trong bản giảng lại này.

Bạn không cần học thêm cả sáu khóa mới được thực hành. Bước hợp lý ngay sau phần này là tự dựng lại một phiên bản đơn giản của workflow và hiểu rõ dữ liệu đi qua từng bước.

## 10. Ví dụ tổng hợp: diễn giải bằng một ca làm việc

> Ví dụ dưới đây do mình bổ sung để nối các khái niệm, không phải trace nguyên bản của video.

**09:00:** Ứng dụng bắt đầu một vòng xử lý và đọc lịch sử deal.

**09:01:** Scanner lấy một tin tai nghe giá 80 USD. Dữ liệu được đưa về các trường có cấu trúc. Bộ định giá trả về ước lượng 120 USD.

**Tiếp theo:** Logic đánh giá xem chênh lệch có đáng chú ý và deal đã được xử lý hay chưa. Nếu đủ điều kiện, công cụ thông báo được gọi; kết quả được ghi lại và hiển thị.

**09:05:** Bộ hẹn giờ kích hoạt vòng tiếp theo. Nếu cùng deal xuất hiện, một cơ chế chống trùng được triển khai đúng có thể bỏ qua nó dựa trên lịch sử.

Ở đây, LLM giúp đọc/đánh giá/điều phối tùy vai trò; timer quyết định thời điểm; JSON giữ lịch sử; Gradio trình bày kết quả. Không có thành phần nào thay thế toàn bộ các thành phần còn lại.

## 11. Từ demo đến ứng dụng dùng lâu dài — phần bổ sung

Video chứng minh các phần có thể chạy cùng nhau. Để vận hành ổn định, những câu hỏi tiếp theo nên là:

- **Chất lượng:** trong các deal được đề xuất, có bao nhiêu thực sự đáng mua sau khi đối chiếu đúng sản phẩm?
- **Chi phí:** mỗi vòng gọi bao nhiêu mô hình; một ngày chạy hết bao nhiêu?
- **Tính liên tục:** ai khởi động lại khi ứng dụng dừng hoặc máy chủ lỗi?
- **Chống trùng và đồng thời:** hai lần chạy có thể gửi cùng một thông báo không?
- **Dữ liệu:** ghi JSON thất bại có làm mất lịch sử không?
- **Khả năng quan sát:** log có giúp biết bước nào chậm hoặc lỗi không?

Ví dụ tính toán bổ sung: chạy đều mỗi 5 phút trong 24 giờ tương ứng tối đa theo lịch là `24 × 60 / 5 = 288` lượt kích hoạt/ngày. Không thể suy ra chi phí tiền chỉ từ con số này; còn phụ thuộc số lời gọi, token, mô hình và thời gian tài nguyên chạy.

Đây là lý do “demo chạy được” và “dịch vụ vận hành ổn định” là hai mức hoàn thiện khác nhau.

## 12. Tự kiểm tra: bạn đã hiểu bài chưa?

1. **Bài này có huấn luyện thêm mô hình không?** Không; chủ yếu tích hợp giao diện, trạng thái và việc chạy định kỳ.
2. **Lưu deal vào JSON có làm LLM học thêm không?** Không; đó là lưu dữ liệu, không phải cập nhật tham số mô hình.
3. **Timer 5 phút có phải agent loop không?** Không; timer kích hoạt các lần chạy, agent loop điều phối bên trong một lần chạy.
4. **DealAgentFramework có phải framework bên ngoài không?** Theo bài, đây là module kết nối tự viết của dự án.
5. **Pydantic bảo đảm giá là chính xác không?** Không; nó hỗ trợ cấu trúc và kiểm tra dữ liệu theo schema.
6. **Gradio quyết định deal nào tốt không?** Không; nó là giao diện, quyết định thuộc logic xử lý được kết nối vào.
7. **Giá trị của dự án là gì?** Tự động tìm, đánh giá và đưa cơ hội đáng chú ý đến người dùng, đồng thời cho phép quan sát quá trình.

**Bài thực hành ngắn:** Trước khi ghép nhiều LLM, hãy dùng ba deal giả để làm bảng hiển thị, lưu/đọc JSON và ghi log một vòng xử lý. Khi hiểu luồng đó, thay phần dữ liệu giả bằng scanner và bộ định giá. Bạn sẽ dễ phân biệt lỗi giao diện, lỗi lưu dữ liệu và lỗi AI hơn.

## 13. Nguồn và giới hạn của bản giảng lại

- `019 Day 5 - Finalizing Your Agentic Workflow and Becoming an AI Engineer.srt` — khoảng 3 phút 02 giây; tổng kết năng lực và góc nhìn về agent.
- `020 Day 5 - Building the Price-Is-Right Agent UI with Gradio and DealAgentFramework.srt` — khoảng 6 phút 16 giây; lớp kết nối, JSON memory, Gradio và timer.
- `021 Day 5 - Course Wrap-Up Your Journey to AI Engineer.srt` — khoảng 9 phút 02 giây; demo và tổng kết khóa học.
- `022 Bonus Lecture - Your Exclusive Links.html` — giới thiệu hướng học và ưu đãi.

Phụ đề có lỗi nhận dạng như “pedantic” thay cho Pydantic, “a genetic” thay cho agentic, “model” ở đoạn nói về Modal. Bản này chuẩn hóa theo ngữ cảnh. Những điểm không xác định được từ phụ đề, như công thức discount, chi tiết reset và cách đếm lời gọi mô hình, được giữ rõ giới hạn thay vì suy đoán thành sự thật.
