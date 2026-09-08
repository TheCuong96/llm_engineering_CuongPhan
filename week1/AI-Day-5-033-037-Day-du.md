# Day 5 — Ngày 5: Ghép các lần gọi AI thành một ứng dụng thực tế

> **Phạm vi:** bài 033–037. Bản giảng giải đầy đủ, viết lại từ toàn bộ 5 file phụ đề SRT bạn cung cấp; không phải bản dịch từng câu hoặc bản chép nguyên code trên màn hình. Ví dụ và phần “Bổ sung” do tôi biên soạn để làm rõ bài học.

## 1. Cả ngày học muốn bạn hiểu điều gì?

**Bạn có thể viết phần mềm sử dụng một mô hình AI có sẵn, kết hợp nó với code xử lý dữ liệu để giải quyết một công việc cụ thể.** Sản phẩm minh họa là **Sales Brochure Generator — công cụ tạo tài liệu giới thiệu công ty**.

Bạn nhập tên công ty và địa chỉ website. Chương trình chọn các trang liên quan, lấy nội dung, rồi viết một tài liệu giới thiệu phù hợp với khách hàng, nhà đầu tư hoặc ứng viên. “Brochure” ở bài này là **nội dung văn bản có định dạng Markdown**, chưa phải tờ quảng cáo PDF có thiết kế đồ họa hoàn chỉnh.

Tưởng tượng bạn giao việc cho một trợ lý: “Hãy tìm hiểu công ty này rồi viết một bài giới thiệu.” Để làm tốt, trợ lý phải chọn tài liệu cần đọc trước, sau đó mới tổng hợp và viết. Chương trình trong bài tách công việc theo đúng cách đó.

| Bài | Đang làm gì? | Điều bạn cần hiểu |
| --- | --- | --- |
| 033 | Xác định bài toán, lấy các liên kết trên website | Code thu thập dữ liệu; AI đánh giá liên kết nào phù hợp với mục tiêu |
| 034 | Viết prompt chọn liên kết và yêu cầu JSON | Đặt nhiệm vụ rõ ràng, đưa ví dụ đầu ra để chương trình dễ sử dụng kết quả |
| 035 | Đọc JSON, tải các trang được chọn, ghép nội dung | Đầu ra của lần gọi AI trước điều khiển dữ liệu đưa vào lần gọi sau |
| 036 | Sinh brochure và hiển thị dần | Hoàn thành sản phẩm; dùng streaming và thử thay đổi giọng văn |
| 037 | Mở rộng ứng dụng và làm AI Tutor | Áp dụng cùng tư duy vào công việc riêng, thử nghiệm prompt có tiêu chí |

Đây là **xây ứng dụng trên LLM**, không có bước huấn luyện mô hình từ đầu hoặc cập nhật trọng số. Bạn kiểm soát quy trình, dữ liệu và cách giao việc cho mô hình.

## 2. Bài 033 — Vì sao phải lấy nhiều trang và gọi AI hai lần?

### Vấn đề của việc chỉ đọc trang chủ

Trang chủ thường chỉ có thông điệp tổng quát. Thông tin sản phẩm nằm ở trang Products; lịch sử nằm ở About; tuyển dụng nằm ở Careers. Nếu chỉ gửi trang chủ cho AI, tài liệu có thể thiếu những dữ kiện quan trọng.

Nhưng tải mọi liên kết cũng không hợp lý: website có thể chứa hàng trăm đường dẫn đến bài viết, trang đăng nhập, chính sách hoặc website bên ngoài. Cần chọn trước khi đọc.

Trong bài có hai tiện ích:

- `fetch_website_links(url)`: tải trang và trích xuất các liên kết.
- `fetch_website_contents(url)`: tải trang và trích xuất nội dung văn bản.

Đây là **code thu thập và phân tích HTML**, dùng công cụ như BeautifulSoup. Chúng không cần một LLM để tìm thẻ liên kết. Giảng viên chủ động giữ scraper đơn giản, dù có chỗ tải lại cùng một trang, để tập trung vào kiến thức AI.

**Một điểm rất quan trọng:** trong quy trình này, mô hình không tự mở website chỉ vì bạn gửi URL. Code của ứng dụng tải nội dung và đưa dữ liệu ấy vào prompt.

### AI đóng góp ở đâu?

Ví dụ minh họa: website công ty ABC có các đường dẫn sau.

| Liên kết | Giá trị cho brochure |
| --- | --- |
| `/about` | Có thể giải thích công ty là ai |
| `/products` | Có thể cho biết công ty bán gì |
| `/careers` | Có thể cung cấp thông tin tuyển dụng |
| `/privacy` | Thường không cần cho bài giới thiệu |
| Trang LinkedIn chính thức của công ty | Có thể liên quan dù nằm ngoài website |
| Một bài tin tức không liên quan | Có thể loại |

Quy tắc “chỉ lấy link cùng tên miền” khá dễ viết nhưng chưa đủ. AI được giao việc nhận xét mức độ liên quan theo ý nghĩa. Tuy vậy, nếu nó chỉ nhận danh sách URL thì nó mới **suy đoán từ các URL và ngữ cảnh được gửi**, chưa biết toàn bộ nội dung từng trang.

Hai lần gọi AI có hai nhiệm vụ khác nhau:

1. **Chọn nguồn:** nhận các liên kết, trả danh sách cần đọc dưới dạng JSON.
2. **Viết nội dung:** nhận văn bản đã tải, trả brochure dưới dạng Markdown.

Giữa hai lần gọi là code tải dữ liệu. Đây là lý do “gọi AI hai lần” không phải hỏi lại cùng một câu.

### Nếu ChatGPT cũng làm được thì xây ứng dụng để làm gì?

Mục đích của bài là học cách đóng gói công việc thành tính năng: người dùng chỉ nhập vài thông tin, phần mềm tự chạy quy trình và trả kết quả theo định dạng thống nhất. Giá trị nằm ở sự tiện lợi, dữ liệu, prompt, nghiệp vụ và khả năng tích hợp vào sản phẩm.

Ví dụ với ứng dụng web: một nút “Tạo giới thiệu doanh nghiệp” có thể lấy dữ liệu từ hồ sơ đã lưu, tạo bản nháp rồi cho người dùng sửa. Người dùng không phải tự sao chép dữ liệu và viết lại prompt mỗi lần. Tuy nhiên, demo chạy được mới là **prototype — bản thử nghiệm**, chưa chứng minh sản phẩm đã sẵn sàng kinh doanh.

## 3. Bài 034 — Dùng prompt và JSON để giao việc rõ ràng

### System prompt và User prompt khác nhau thế nào?

Hãy coi chúng là **quy tắc làm việc** và **nhiệm vụ cụ thể của lượt này**.

| Thành phần | Nội dung trong bước chọn liên kết |
| --- | --- |
| System prompt — chỉ dẫn hệ thống | Chọn các trang phù hợp để viết brochure; trả đúng kiểu dữ liệu mong muốn |
| User prompt — yêu cầu của lượt gọi | Website đang xét, danh sách liên kết thực tế, các điều kiện chọn hoặc loại |

Trong video, system prompt được lưu thành chuỗi cố định. User prompt được tạo bằng hàm vì URL và danh sách liên kết thay đổi theo công ty. **Tạo chuỗi prompt chưa phải là gọi AI.** Chỉ khi gọi API, dữ liệu mới được gửi tới mô hình.

Ví dụ prompt do tôi viết lại:

```text
Bạn chọn nguồn để viết tài liệu giới thiệu công ty.
Ưu tiên trang giới thiệu, sản phẩm, khách hàng và tuyển dụng.
Loại liên kết email, điều khoản sử dụng và chính sách riêng tư.
Chỉ chọn từ danh sách được cung cấp. Không tự sáng tác URL.
Trả về JSON theo cấu trúc ví dụ bên dưới.
```

```json
{
  "links": [
    {"type": "about", "url": "https://example.com/about"},
    {"type": "careers", "url": "https://example.com/careers"}
  ]
}
```

Đây là cấu trúc do người viết ứng dụng tự thiết kế. `links`, `type`, `url` không phải những tên trường bắt buộc mà OpenAI đặt ra cho nhiệm vụ này.

### One-shot prompting — hướng dẫn bằng một ví dụ

Thay vì chỉ nói “trả dữ liệu cho dễ xử lý”, bạn đưa một mẫu để AI thấy hình dạng câu trả lời mong muốn.

- **Zero-shot:** giao yêu cầu, không kèm ví dụ mẫu.
- **One-shot:** kèm một ví dụ.
- **Few-shot / Multi-shot:** kèm một vài hoặc nhiều ví dụ.

Video gọi JSON mẫu là one-shot prompting. Theo nghĩa chặt chẽ, một ví dụ đầy đủ thường gồm cả **đầu vào và đầu ra tương ứng**. JSON mẫu trong bài chủ yếu hướng dẫn định dạng.

**AI không được huấn luyện lại khi bạn đưa ví dụ trong prompt.** Nó dùng ví dụ trong ngữ cảnh của lần gọi hiện tại. Nếu muốn những lần gọi sau cũng áp dụng, ứng dụng phải tiếp tục đưa chỉ dẫn hoặc ví dụ cần thiết vào đầu vào.

### JSON dùng cho chương trình, Markdown dùng cho người đọc

Nếu AI trả “Bạn nên đọc trang About và Careers”, code phải phân tích câu văn để tìm URL. Nếu AI trả JSON, code có thể truy cập trực tiếp `data["links"]` và duyệt từng phần tử.

Markdown phù hợp cho brochure vì có tiêu đề, đoạn văn và danh sách. Hai định dạng phục vụ hai đối tượng khác nhau: **JSON giúp máy sử dụng kết quả; Markdown giúp người đọc kết quả.** Không cần hiểu lời giảng về dữ liệu huấn luyện như một thống kê rằng LLM chỉ học ba loại dữ liệu.

Trong Chat Completions, bài dùng:

```python
response_format={"type": "json_object"}
```

**Bổ sung đã đối chiếu tài liệu:** JSON mode hỗ trợ đầu ra JSON hợp lệ, nhưng không bảo đảm đúng các trường hoặc kiểu dữ liệu bạn muốn. Structured Outputs ràng buộc theo schema trên model hỗ trợ. Cả hai đều không chứng minh nội dung đúng thực tế; vẫn cần xử lý trường hợp kết quả thiếu hoặc bị ngắt. [Tài liệu Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)

Ví dụ `{"hello": "world"}` hợp lệ về JSON nhưng sai hợp đồng dữ liệu của bài vì không có `links`. Với nền tảng TypeScript, bạn có thể liên hệ: kiểu `interface` giúp lúc viết code, còn dữ liệu bên ngoài vẫn cần kiểm tra lúc chạy.

## 4. Bài 035 — Nối đầu ra AI với code và lần gọi tiếp theo

### Từ chuỗi JSON thành dữ liệu có thể truy cập

Trong bài, lấy câu trả lời bằng:

```python
text = response.choices[0].message.content
links = json.loads(text)
```

`choices[0]` là phương án trả lời đầu tiên; `message.content` chứa nội dung. Ở bước này, dù nội dung trông giống JSON, nó vẫn là **chuỗi văn bản**. `json.loads` biến chuỗi thành cấu trúc Python như dictionary và list.

So với JavaScript:

```javascript
const data = JSON.parse(text);
const firstUrl = data.links[0].url;
```

Đây chỉ là ví dụ truy cập khi có phần tử; thực tế cần kiểm tra danh sách rỗng. Parse không phải gọi thêm AI và cũng không kiểm chứng URL có thật.

### Toàn bộ luồng dữ liệu

| Bước | Ai xử lý? | Đầu vào | Đầu ra |
| --- | --- | --- | --- |
| 1 | Code | URL công ty | Nội dung trang chủ và danh sách link |
| 2 | AI lần 1 | Danh sách link + tiêu chí | Chuỗi JSON các link được chọn |
| 3 | Code | Chuỗi JSON | Dữ liệu đã parse và kiểm tra |
| 4 | Code | Các URL đã chọn | Văn bản từ nhiều trang |
| 5 | Code | Văn bản và tên công ty | Prompt viết brochure |
| 6 | AI lần 2 | Prompt viết brochure | Bài giới thiệu Markdown |
| 7 | Giao diện | Markdown | Nội dung dễ đọc |

**Chaining — nối các lần gọi:** kết quả bước trước được chương trình dùng để chuẩn bị đầu vào bước sau. Hai lần gọi không tự chia sẻ trí nhớ; mối liên hệ được tạo bởi code truyền dữ liệu.

Đọc hàm trong video theo vai trò sẽ dễ hơn nhớ từng dòng:

| Hàm | Nhiệm vụ |
| --- | --- |
| `get_links_user_prompt` | Đưa danh sách link vào chuỗi yêu cầu |
| `select_relevant_links` | Gọi AI lần 1 và parse JSON |
| `fetch_page_and_all_relevant_links` | Lấy trang chủ, chọn link, tải nội dung các trang |
| `get_brochure_user_prompt` | Ghép tên công ty và tài liệu nguồn vào prompt viết |
| `create_brochure` | Gọi AI lần 2 và hiển thị kết quả |
| `stream_brochure` | Biến thể hiển thị dần kết quả lần gọi thứ 2 |

Một chỗ dễ nhầm: gọi `get_brochure_user_prompt(...)` trong demo **cũng có thể phát sinh phí API**, vì bên trong nó gọi hàm chọn liên kết. Tên “tạo prompt” không nói hết tác dụng của hàm. Chạy lại ô notebook có thể chạy lại cả chuỗi công việc.

### Có phải AI Agent không?

Giảng viên liên hệ việc nối code và LLM với agentic workflow. Ở mức chính xác với demo này, bạn đang có **workflow định sẵn**: chọn link, tải trang, viết tài liệu. Nó chưa phải một agent tự lập kế hoạch, tự thử lại và tự quyết định bao nhiêu bước cần thực hiện. Khái niệm cần nắm lúc này là phối hợp nhiều bước, không phải đặt tên hệ thống cho thật lớn.

### Vì sao cắt nội dung còn 5.000 ký tự?

Trong bài, giảng viên giới hạn độ dài phần dữ liệu đưa vào prompt để tránh gửi quá nhiều nội dung và tăng chi phí. Đây là cách đơn giản phù hợp demo.

**5.000 ký tự không phải 5.000 token.** Ngoài nội dung website, đầu vào còn chứa chỉ dẫn và tên công ty; đầu ra cũng dùng token.

Cắt thẳng đầu chuỗi có thể làm mất toàn bộ trang nằm cuối, dù chương trình đã tốn thời gian tải chúng. Cách cải thiện là chọn ít trang hơn, chia ngân sách nội dung cho mỗi trang hoặc tóm tắt từng trang trước. Phương án tóm tắt trung gian lại phát sinh thêm lần gọi AI: phải cân bằng dữ liệu, chất lượng và chi phí.

## 5. Bài 036 — Viết brochure và streaming kết quả

### Giao việc viết khác với giao việc chọn nguồn

Prompt lần 2 yêu cầu phân tích các trang đã thu thập, viết brochure ngắn, có thông tin về công ty, khách hàng, văn hóa hoặc tuyển dụng **nếu nguồn có dữ liệu**. Đầu ra là Markdown, không bọc toàn bài trong code block.

Trong nội dung phụ đề, giảng viên dùng GPT-5 nano để chọn link và GPT-4.1 mini để viết, với lý do trải nghiệm tốc độ trong demo. Đây là lựa chọn của bài học, không phải yêu cầu bắt buộc hoặc kết luận rằng model này luôn nhanh hơn model kia. Tiêu đề file có thể ghi tên model khác hoặc tổng quát hơn; nên hiểu mục tiêu của từng bước thay vì học thuộc tên model.

Bạn có thể dùng cùng một model cho cả hai bước. Tách model giúp thử nghiệm khả năng và chi phí theo nhiệm vụ; không làm quy trình tự động thông minh hơn nếu prompt và dữ liệu chưa tốt.

### Streaming — nhận kết quả từng phần

Không streaming: giao diện chờ toàn bộ bài viết rồi hiển thị. Có streaming: giao diện nhận và hiển thị các phần văn bản khi chúng đến.

Trong Chat Completions, thêm `stream=True` và đọc `chunk.choices[0].delta.content`. `delta` là phần nội dung mới, có thể rỗng; một chunk không nhất thiết tương ứng đúng một token. [Tham chiếu Chat Completions](https://developers.openai.com/api/reference/resources/chat)

```python
# Đoạn minh họa: client, WRITE_MODEL và messages đã được chuẩn bị.
stream = client.chat.completions.create(
    model=WRITE_MODEL,
    messages=messages,
    stream=True,
)

text = ""
for chunk in stream:
    if not chunk.choices:
        continue
    part = chunk.choices[0].delta.content or ""
    text += part
    print(part, end="", flush=True)
```

Code này in văn bản ra terminal. Trong notebook, giảng viên tạo một vùng hiển thị Markdown rồi cập nhật vùng đó bằng **toàn bộ văn bản đã tích lũy**, để tránh tạo thêm một khối mới cho mỗi mẩu nhận về.

Liên hệ với React: bạn nhận phần văn bản mới, nối vào nội dung hiện có rồi render. Cần phân biệt ba nơi làm việc: API sinh dữ liệu; backend chuyển dữ liệu; frontend hiển thị. API key phải nằm ở backend khi đưa vào ứng dụng web.

Streaming giúp người dùng **thấy kết quả sớm hơn**, không bảo đảm toàn bộ tác vụ hoàn tất nhanh hơn. Trong bài, chọn link và tải trang vẫn diễn ra trước khi brochure bắt đầu xuất hiện. Có thể hiển thị trạng thái “Đang chọn nguồn”, “Đang đọc tài liệu”, “Đang viết” để người dùng hiểu giai đoạn chờ.

### Thay giọng văn và kiểm soát việc bịa thêm

Giảng viên đổi prompt để có brochure hài hước. Kết quả xuất hiện khẩu hiệu và cách mô tả sáng tạo. Điều đó cho thấy prompt tác động mạnh đến giọng văn, nhưng không biến những điều sáng tác thành dữ kiện công ty.

Prompt bổ sung nên phân biệt:

```text
Có thể sáng tạo cách diễn đạt và đề xuất khẩu hiệu.
Không tự tạo số liệu, tên khách hàng, chứng nhận hoặc vị trí tuyển dụng.
Nếu đề xuất khẩu hiệu, ghi rõ đó là đề xuất, không phải khẩu hiệu chính thức.
Nếu nguồn thiếu dữ kiện, bỏ mục đó hoặc nêu chưa có thông tin.
```

Hài hước là lựa chọn phong cách. Bịa số lượng khách hàng hoặc chứng nhận lại là vấn đề độ chính xác. Brochure cần vừa dễ đọc vừa trung thực với nguồn.

### Vì sao đổi biến trong notebook rồi chạy hàm vẫn có tác dụng?

Trong demo, hàm đọc biến prompt toàn cục khi được gọi. Khi ô gán prompt đã chạy lại, hàm đọc giá trị mới. Sửa chữ trong ô nhưng chưa chạy ô đó thì chưa cập nhật biến.

Cách này thuận tiện khi thử nghiệm nhưng dễ nhầm trạng thái. Khi kết quả khác dự kiến, hãy kiểm tra thứ tự chạy các ô. Khi tách thành ứng dụng, truyền prompt/model qua tham số hoặc cấu hình rõ ràng sẽ dễ theo dõi hơn.

## 6. Bài 037 — Chuyển kỹ thuật thành việc có ích cho bạn

### Công thức có thể tái sử dụng

**Thu thập dữ liệu → chọn thông tin cần thiết → tổng hợp → tạo đầu ra theo mục tiêu.**

| Bài toán | Nguồn dữ liệu | Đầu ra mong muốn |
| --- | --- | --- |
| Tạo brochure | Website công ty | Tài liệu giới thiệu |
| Viết hướng dẫn sản phẩm | Tài liệu tính năng | Bài hướng dẫn dễ hiểu |
| Soạn email | Thông tin sản phẩm và mục đích gửi | Bản nháp email |
| Giảng lại bài học | Phụ đề hoặc tài liệu | Bài giảng và bản tóm tắt |

Ví dụ cuối rất gần nhu cầu của bạn: chương trình có thể lấy phụ đề, xác định mục tiêu bài, viết giải thích rồi tạo bản tóm tắt. Muốn bản tóm tắt không bỏ sót ý quan trọng thì cần kiểm tra nó với nội dung gốc hoặc danh sách kiến thức cần giữ.

Giảng viên khuyến khích làm một **proof of concept — bản thử để chứng minh ý tưởng** bằng notebook. Mục đích là nhanh chóng thử prompt, xem đầu ra và sửa, trước khi đầu tư xây giao diện và kiến trúc hoàn chỉnh.

### Các bài tập được giao

1. Thay prompt, giọng văn và ví dụ của brochure generator.
2. Thêm lần gọi AI thứ ba để dịch brochure; giữ cả bản gốc và bản dịch.
3. Áp dụng cách tổng hợp dữ liệu vào một vấn đề công việc hoặc cá nhân.
4. Làm **AI Tutor — gia sư AI** để giải thích câu hỏi kỹ thuật, thử OpenAI và/hoặc model chạy qua Ollama.

Khi thêm bước dịch, đưa bản brochure đã tạo vào lần gọi thứ ba; không cần tải lại toàn bộ website chỉ để dịch. Khi đổi model, so sánh trên cùng câu hỏi và tiêu chí, tránh kết luận từ một câu trả lời may mắn.

Bài còn hướng dẫn đóng góp vào thư mục `community-contributions`, xóa output notebook trước khi gửi PR và giải thích phần mình làm. Đây là hoạt động thực hành/chia sẻ, không phải điều kiện để AI Tutor hoạt động. Cuối bài là giới thiệu nội dung tuần sau: các API khác, gọi công cụ, giao diện chat, đa phương thức và Gradio; các kỹ thuật đó chưa được triển khai đầy đủ trong nhóm video này.

### Prompt AI Tutor phù hợp với bạn — ví dụ bổ sung

```text
Bạn là gia sư AI, giải thích bằng tiếng Việt cho một lập trình viên
đã biết React/TypeScript nhưng mới học AI và Python.

Với mỗi câu hỏi:
1. Nêu khái niệm và nó giải quyết vấn đề gì trong tối đa 3 câu.
2. Cho một ví dụ gần với lập trình web nếu phép so sánh phù hợp.
3. Giải thích các bước cốt lõi, không lặp cùng một ý ở nhiều tiêu đề.
4. Nêu một nhầm lẫn thường gặp.
5. Kết thúc bằng 3 ý cần nhớ.

Giữ thuật ngữ tiếng Anh và kèm nghĩa tiếng Việt ở lần xuất hiện đầu.
Không dùng thuật ngữ mới mà chưa giải thích.
Nếu thiếu dữ liệu, nói rõ giới hạn thay vì đoán chắc chắn.
```

Câu hỏi thử: “Tại sao phải parse JSON do AI trả về?” Một câu trả lời tốt cần nói được: nội dung nhận về là chuỗi; parse biến chuỗi thành cấu trúc truy cập được; parse không bảo đảm dữ liệu đúng nghiệp vụ.

Sau đó thêm một cặp câu hỏi–trả lời tốt làm ví dụ. Nếu thêm phản ví dụ, ghi rõ đó là cách trả lời sai và lý do, tránh để AI hiểu nhầm là mẫu cần bắt chước. Nhiều ví dụ hơn không tự động tốt hơn: ví dụ cần đúng, liên quan và đủ ngắn.

## 7. Những điểm cần bổ sung để không hiểu quá mức demo

Phần này là nhận xét kỹ thuật bổ sung, không phải các tính năng đã được giảng viên triển khai đầy đủ.

| Chỗ dễ hiểu nhầm | Cách hiểu và cải thiện |
| --- | --- |
| AI chọn link nên URL nào trả về cũng dùng được | Kiểm tra link thuộc tập nguồn đã cung cấp; xử lý link hỏng và trùng lặp |
| Đổi URL tương đối phải dùng AI | Có thể dùng thư viện URL, ví dụ `urljoin`; dành AI cho việc đánh giá ý nghĩa |
| JSON hợp lệ đồng nghĩa dữ liệu đúng | Kiểm tra schema, kiểu dữ liệu và điều kiện nghiệp vụ |
| Đã đọc nhiều trang thì chắc chắn không bịa | AI vẫn có thể suy diễn; đối chiếu dữ kiện và giữ URL nguồn |
| Số link thay đổi nghĩa là code bị lỗi | Lựa chọn mô hình có thể khác giữa các lượt; đặt giới hạn, tiêu chí và kiểm tra chất lượng |
| Chỉ sửa prompt là giải quyết mọi vấn đề | Scraper thiếu nội dung, trang cần đăng nhập hoặc dữ liệu bị cắt phải sửa ở bước thu thập |
| Gọi nhiều AI hơn luôn tốt hơn | Mỗi lần gọi tăng thời gian, chi phí và nguy cơ truyền lỗi sang bước sau |

Nếu nhận URL tùy ý từ người dùng trên server, cần chặn địa chỉ nội bộ và kiểm soát redirect; nếu không, tính năng tải trang có thể bị dùng để truy cập tài nguyên nội bộ. Nội dung website cũng phải được coi là dữ liệu nguồn, không phải chỉ dẫn có quyền thay đổi nhiệm vụ của hệ thống. Đây là hai giới hạn trực tiếp của kiểu ứng dụng thu thập web này.

Để thử prompt có cơ sở, giữ nguyên vài bộ dữ liệu nguồn và chấm theo các tiêu chí: chọn đúng trang không; JSON có dùng được không; brochure có bịa dữ kiện không; có đúng đối tượng và độ dài không. Thay từng yếu tố để biết điều gì thực sự làm kết quả tốt hơn.

## 8. Tự kiểm tra xem bạn đã hiểu chưa

1. **Vì sao gọi AI hai lần?** Một lần chọn nguồn, một lần viết từ nguồn đã tải.
2. **Ai tải website?** Code thu thập dữ liệu của ứng dụng.
3. **Vì sao dùng JSON ở bước đầu?** Để code đọc danh sách link một cách có cấu trúc.
4. **Vì sao cần `json.loads`?** Vì nội dung JSON đang ở dạng chuỗi.
5. **Streaming làm gì?** Cho phép nhận và hiển thị kết quả từng phần.
6. **Thêm ví dụ vào prompt có huấn luyện lại model không?** Không; ví dụ được dùng trong ngữ cảnh lần gọi.
7. **Bạn xây được gì sau ngày này?** Một workflow ứng dụng LLM có nhiều bước, có dữ liệu nguồn và đầu ra theo mục tiêu.

## Nguồn và cách biên soạn

- Nguồn chính: toàn bộ phụ đề SRT bài 033, 034, 035, 036, 037 được đính kèm. Diễn giải và ví dụ được tổ chức lại theo mạch học; đã bỏ lời đệm và phần quảng bá.
- `external-links.txt` dẫn tới [repository của khóa học](https://github.com/ed-donner/llm_engineering). Repo có thể được cập nhật khác với thời điểm quay; tài liệu này ưu tiên nội dung phụ đề bạn gửi.
- Các lưu ý về JSON mode/Structured Outputs và streaming được đối chiếu tài liệu chính thức tại các liên kết trong bài, ngày 08/09/2026. Mã minh họa nhằm giải thích cơ chế, không phải một ứng dụng hoàn chỉnh đã được chạy kiểm thử với API.
