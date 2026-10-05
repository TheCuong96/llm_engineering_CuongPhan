# Accessing the API — Bài giảng cho lập trình viên fullstack

**Khóa học:** Building with the Claude API, Anthropic.

**Phạm vi:** bài Accessing the API đang mở, không phải toàn bộ khóa học.

**Nguồn chính:** [Accessing the API — Claude Academy](https://academy.claude.com/courses/building-with-the-claude-api/accessing-the-api).

Ví dụ xuyên suốt: thêm chức năng **tóm tắt ticket hỗ trợ khách hàng** vào ứng dụng fullstack. Ví dụ dùng Node.js; bạn có thể áp dụng cùng kiến trúc cho Python hoặc framework backend khác.

## Phần 1 — Từ giao diện đến Claude

### 1. Bài này giải quyết vấn đề gì?

Bạn biết gọi REST API. Khi tích hợp Claude, bạn cần hiểu thêm ba chuyện: bảo vệ credential, cách văn bản được xử lý, và cách biết câu trả lời đã hoàn tất hay bị cắt.

Hiểu vòng đời request giúp bạn thiết kế kiến trúc an toàn, đặt giới hạn đầu ra hợp lý và debug đúng nơi. Mục tiêu của bài là nhận biết thuật ngữ và luồng xử lý; bạn chưa cần học toán bên trong mô hình.

**LLM — Large Language Model (mô hình ngôn ngữ lớn)** là hệ thống được huấn luyện trên lượng dữ liệu lớn để xử lý và sinh ngôn ngữ. Claude thuộc nhóm này.

- **Ví von web:** giống một dịch vụ autocomplete rất mạnh, có thể tiếp tục văn bản dựa trên nội dung đã nhận.
- **Ví dụ fullstack:** đưa nội dung ticket vào; yêu cầu tạo bản tóm tắt cho nhân viên hỗ trợ.
- **Giới hạn:** LLM làm được nhiều hơn autocomplete thông thường, nhưng văn bản trôi chảy không bảo đảm thông tin đúng. Nó không phải database truy xuất sự thật đã xác nhận.

**Model (mô hình)** là hệ thống cụ thể bạn chọn để xử lý request, được xác định qua trường `model`.

- **Ví von web:** giống chọn một implementation cho cùng interface của service.
- **Ví dụ fullstack:** backend cấu hình model dùng cho chức năng tóm tắt ticket.
- **Giới hạn:** đổi model có thể thay đổi chất lượng, thời gian phản hồi và tính năng hỗ trợ, dù cấu trúc request tương tự.

#### Hiểu nhầm phổ biến

“Claude trả lời trôi chảy nên chắc chắn đúng.” Sự trôi chảy không thay thế kiểm tra dữ liệu và quy tắc nghiệp vụ. Tóm tắt ticket giúp nhân viên đọc nhanh; quyết định hoàn tiền vẫn cần dữ liệu và chính sách của ứng dụng.

### 2. Luồng request gồm năm bước

```text
[1] Client gửi yêu cầu đến backend của bạn
                     ↓
[2] Backend gọi Anthropic API
                     ↓
[3] Claude xử lý và sinh câu trả lời
                     ↓
[4] Anthropic API trả response về backend
                     ↓
[5] Backend trả kết quả về client để hiển thị
```

| Bước | Ví dụ trong ứng dụng |
|---|---|
| 1 | Người dùng bấm “Tóm tắt”; frontend gửi ID ticket đến backend |
| 2 | Backend kiểm tra quyền, đọc ticket rồi gửi nội dung cần thiết đến Claude |
| 3 | Claude sinh bản tóm tắt |
| 4 | Backend nhận nội dung cùng metadata về lượt xử lý |
| 5 | Frontend hiển thị bản tóm tắt |

Kiểm tra quyền và đọc ticket là cách áp dụng vào dự án thật, bổ sung cho sơ đồ tổng quát của bài.

**Ví von web:** backend gọi một dịch vụ bên ngoài, giống tích hợp thanh toán hoặc gửi email. **Giới hạn:** với LLM, cùng đầu vào có thể tạo cách diễn đạt khác nhau; nhận HTTP thành công chưa đủ để kết luận kết quả phù hợp nghiệp vụ.

#### Lỗi thường gặp

Gộp mọi vấn đề thành “Claude lỗi”. Hãy xác định bước bị lỗi:

- Không có request từ frontend: kiểm tra giao diện và network.
- Backend không gọi được API: kiểm tra credential, cấu hình và kết nối.
- Có response nhưng UI trống: kiểm tra cách đọc response và hiển thị.
- Có câu trả lời nhưng thiếu phần cuối: kiểm tra giới hạn sinh và lý do dừng.

### 3. Vì sao cần backend?

**API key (khóa truy cập API)** là thông tin bí mật dùng để xác thực request với nhà cung cấp.

- **Ví von web:** giống credential backend dùng để kết nối database hoặc gọi dịch vụ thanh toán.
- **Ví dụ fullstack:** backend đọc key từ cấu hình bí mật rồi gọi Anthropic; React chỉ gọi backend của bạn.
- **Giới hạn:** key xác thực ứng dụng với Anthropic, không chứng minh người dùng có quyền đọc một ticket.

Bạn cần hai lớp kiểm tra:

1. **User → backend:** người dùng có quyền thực hiện hành động này không?
2. **Backend → Anthropic:** ứng dụng có credential hợp lệ để gọi API không?

Key phải nằm trong môi trường chạy phía server, chẳng hạn biến môi trường hoặc hệ thống quản lý bí mật. Backend có thể là server truyền thống, serverless function hoặc route chạy phía server trong Next.js. Điểm quyết định là **key không được gửi xuống trình duyệt**.

#### Lỗi thường gặp

- Gắn key trực tiếp trong component React.
- Đưa key vào biến môi trường được framework công khai cho frontend.
- Nghĩ minify JavaScript sẽ giữ được bí mật.
- Bảo vệ key nhưng bỏ qua kiểm tra quyền tại endpoint backend.

**Biến môi trường không tự động là bí mật.** Nếu giá trị được đưa vào bundle trình duyệt, người dùng có thể lấy nó.

### 4. Backend gửi gì đến Anthropic?

Bạn có thể dùng **SDK — Software Development Kit (bộ thư viện hỗ trợ tích hợp)** hoặc gửi HTTP request trực tiếp.

SDK giống client library cho database: giúp gọi API bằng cú pháp của ngôn ngữ và xử lý một số chi tiết giao tiếp. Nó không thay bạn thiết kế nghiệp vụ. Ví dụ backend Node.js dùng SDK TypeScript chính thức để gửi nội dung ticket.

Bài học nhắc Python, TypeScript/JavaScript, Go và Ruby. Danh sách SDK có thể thay đổi; JavaScript có thể dùng SDK TypeScript. [Tài liệu SDK chính thức](https://platform.claude.com/docs/en/cli-sdks-libraries/overview).

| Thành phần | Ý nghĩa |
|---|---|
| API key | Credential để xác thực |
| `model` | Model xử lý request |
| `messages` | Nội dung các tin nhắn gửi cho model |
| `max_tokens` | Giới hạn số token model được phép sinh |

Đây là các thành phần cần hiểu, không phải bốn trường cùng nằm trong JSON body. Với HTTP trực tiếp, credential được gửi qua header; `model`, `messages` và `max_tokens` nằm trong body. SDK xử lý các header thông thường giúp bạn. [API overview](https://platform.claude.com/docs/en/api/overview).

**Prompt (nội dung đầu vào hướng dẫn model)** là yêu cầu và thông tin bạn đưa cho Claude để thực hiện tác vụ.

- **Ví von web:** giống dữ liệu đầu vào cộng với mô tả công việc gửi cho một service.
- **Ví dụ fullstack:** “Tóm tắt ticket sau thành ba gạch đầu dòng: …”.
- **Giới hạn:** ngôn ngữ tự nhiên có thể mơ hồ; prompt không chặt chẽ như validation bằng schema.

Ví dụ phần `messages`, chưa phải request đầy đủ:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Tóm tắt ticket này thành ba gạch đầu dòng: Khách không nhận được email xác nhận..."
    }
  ]
}
```

`role: "user"` đánh dấu tin nhắn đầu vào của người dùng; `content` chứa yêu cầu và dữ liệu. Backend xây dựng cấu trúc này trước khi gọi API.

#### Hiểu nhầm phổ biến

“`messages` luôn chỉ chứa câu hỏi mới nhất.” Một tin nhắn đủ cho ví dụ đơn giản. Khi làm hội thoại nhiều lượt, ứng dụng cần quản lý lịch sử liên quan; nội dung này thuộc bài sau.

### 5. Token và `max_tokens`

**Token (đơn vị văn bản model xử lý)** là một mảnh văn bản, có thể là cả từ, một phần của từ hoặc ký hiệu. Token không đồng nghĩa với từ hay ký tự.

- **Ví von web:** giống parser chia mã nguồn thành những đơn vị nhỏ để xử lý.
- **Ví dụ fullstack:** nội dung ticket trở thành token đầu vào; bản tóm tắt được sinh thành token đầu ra.
- **Giới hạn:** token của LLM không theo quy tắc cú pháp JavaScript. Dấu cách giữa các từ không đủ để xác định số token.

Bài tạm ví “mỗi từ là một token” cho dễ hiểu. **Đây không phải công thức tính giới hạn**, đặc biệt với tiếng Việt hoặc mã nguồn.

**`max_tokens` (giới hạn token đầu ra)** đặt trần cho lượng token Claude được phép sinh trong lượt gọi.

- **Ví von web:** giống giới hạn số bản ghi trả về cho truy vấn.
- **Ví dụ fullstack:** thử giới hạn 200 token cho bản tóm tắt rồi điều chỉnh theo kết quả.
- **Giới hạn:** đạt giới hạn có thể cắt câu trả lời giữa chừng; câu cuối không được bảo đảm hoàn chỉnh như một bản ghi database.

#### Lỗi thường gặp

- Nghĩ `max_tokens: 200` nghĩa là đúng 200 từ.
- Nghĩ model bắt buộc phải sinh hết giới hạn.
- Nghĩ tăng giới hạn tự làm câu trả lời chính xác hơn.
- Nghĩ giới hạn này khống chế cả độ dài đầu vào.

Hãy dùng prompt để yêu cầu câu trả lời ngắn và `max_tokens` để đặt trần. Hai cơ chế hỗ trợ nhau.

## Phần 2 — Claude xử lý thế nào và ứng dụng đọc kết quả ra sao?

### 6. Bốn giai đoạn xử lý bên trong

Bài mô tả chuỗi sau:

```text
Văn bản → Tokenization → Embedding → Contextualization → Generation
```

Đây là sơ đồ khái niệm để học, không phải bốn endpoint hay bốn hàm bạn phải tự gọi. Tôi không có thông tin để khẳng định mọi chi tiết triển khai nội bộ riêng của Claude; các giải thích dưới đây giúp hiểu nguyên lý mà bài giới thiệu.

#### 6.1. Tokenization — Chia văn bản thành token

**Tokenization (quá trình chia văn bản thành token)** chuyển văn bản thành chuỗi đơn vị mà model có thể xử lý.

- **Ví von web:** bước lexer của compiler chuyển mã nguồn thành những đơn vị nhỏ.
- **Ví dụ fullstack:** câu “Khách không nhận được email xác nhận” được chuyển thành chuỗi token trước khi xử lý.
- **Giới hạn:** không thể suy ra cách chia chính xác bằng `split(" ")`. Tokenizer có quy tắc riêng; ví dụ trên không khẳng định số token thực tế.

**Lỗi thường gặp:** dùng số từ để tính chính xác lượng token. Khi cần số chính xác, dùng cơ chế đếm token phù hợp với API.

#### 6.2. Embedding — Biểu diễn bằng số

**Embedding (biểu diễn dạng vector số)** chuyển token thành một danh sách số để mạng xử lý. Biểu diễn được học này mang thông tin hữu ích về ngôn ngữ và các mối quan hệ giữa token.

- **Ví von web:** giống chuyển dữ liệu đầu vào sang cấu trúc mà bộ máy xử lý có thể tính toán, như một lớp ánh xạ dữ liệu.
- **Ví dụ fullstack:** “email”, “gửi” và “xác nhận” được biểu diễn bằng số để model xử lý quan hệ trong ticket.
- **Giới hạn:** embedding không phải ID database, hash hoặc object chứa các nghĩa được đặt tên rõ ràng. Bạn không đọc từng số như đọc thuộc tính JSON.

Bài ví embedding như một “định nghĩa bằng số” chứa các nghĩa có thể có. Hãy hiểu đây là phép ví von. Vector không phải từ điển liệt kê đầy đủ mọi nghĩa.

Bài dùng từ “quantum” để minh họa nhiều nghĩa: đơn vị lượng vật lý rời rạc, cơ học lượng tử, ý chỉ thứ cực nhỏ hoặc ứng dụng điện toán lượng tử. Ý chính là **một từ có thể xuất hiện trong nhiều ngữ cảnh**; đây chưa phải bài học về vật lý.

**Hiểu nhầm phổ biến:** tích hợp Messages API nghĩa là bạn phải tự tạo embedding trước. Trong luồng của bài, model thực hiện bước nội bộ này. Embedding dùng cho tìm kiếm tài liệu là chủ đề khác, cần học riêng.

#### 6.3. Contextualization — Diễn giải theo ngữ cảnh

**Contextualization (điều chỉnh biểu diễn theo ngữ cảnh)** là quá trình model dùng những token xung quanh để tạo biểu diễn phù hợp hơn cho nội dung đang xử lý.

- **Ví von web:** giống compiler xác định một tên biến dựa trên scope thay vì chỉ nhìn tên đó riêng lẻ.
- **Ví dụ fullstack:** “token hết hạn” trong ticket đăng nhập thường liên quan credential; “giới hạn token đầu ra” trong bài này liên quan đơn vị văn bản của LLM.
- **Giới hạn:** compiler phân giải tên theo quy tắc xác định. Model học các quan hệ thống kê và vẫn có thể hiểu sai khi thông tin thiếu hoặc mơ hồ.

**Hiểu nhầm phổ biến:** model sẽ tự biết toàn bộ dự án của bạn. Trong lượt gọi đơn giản này, backend phải cung cấp thông tin cần thiết; nó không tự đọc database hoặc repository của ứng dụng.

#### 6.4. Generation — Sinh token tiếp theo

**Generation (quá trình sinh đầu ra)** tạo văn bản bằng cách dự đoán token tiếp theo dựa trên đầu vào và phần đã sinh, rồi lặp lại.

- **Ví von web:** giống vòng lặp xây dựng một chuỗi kết quả từng mảnh, trong đó mỗi mảnh mới phụ thuộc trạng thái đã có.
- **Ví dụ fullstack:** model sinh “Khách”, rồi tiếp tục bản tóm tắt dựa trên ticket và các token vừa sinh.
- **Giới hạn:** đây không phải vòng lặp nối các câu được lập trình sẵn. Token được chọn dựa trên phân bố xác suất mà model tính toán.

**Sampling (chọn token từ phân bố xác suất)** là cách lựa chọn token tiếp theo từ các khả năng model dự đoán. Bài giải thích rằng model không phải lúc nào cũng chọn khả năng có xác suất cao nhất; quá trình lựa chọn có thể tạo ra cách diễn đạt đa dạng.

- **Ví von web:** giống chọn có trọng số giữa nhiều phương án trong một thuật toán.
- **Ví dụ fullstack:** hai lượt tóm tắt cùng ticket có thể dùng từ khác nhau nhưng cùng ý chính.
- **Giới hạn:** xác suất của token không phải phần trăm bảo đảm câu trả lời đúng. Cũng không nên mặc định mọi model đều cung cấp cùng tham số để điều chỉnh sampling.

Bài nói quá trình lặp lại sau mỗi “word”. Chính xác hơn ở mức này là **mỗi token**. Việc lặp không có nghĩa API gửi lại request qua mạng cho từng token, cũng không có nghĩa toàn bộ phép tính cũ bắt buộc được làm lại từ đầu.

**Lỗi thường gặp:** xem model như một API nghiệp vụ luôn trả đúng một đáp án cố định. Hãy kiểm tra kết quả bằng các ticket mẫu thay vì chỉ thử một lần.

### 7. Khi nào Claude dừng sinh?

Bài giới thiệu ba trường hợp chính:

| Trường hợp | Biểu hiện trong response | Cách nghĩ khi xử lý |
|---|---|---|
| Đạt giới hạn đầu ra | `stop_reason: "max_tokens"` | Có thể bị cắt; báo người dùng và xem lại giới hạn |
| Kết thúc tự nhiên | `stop_reason: "end_turn"` | Model đã kết thúc lượt trả lời |
| Gặp chuỗi dừng do ứng dụng cấu hình | `stop_reason: "stop_sequence"` | Kiểm tra chuỗi nào gây dừng |

Đây là ba trường hợp trong bài, không phải toàn bộ giá trị API có thể trả. [Tài liệu stop reasons](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons).

**End-of-sequence token (token đánh dấu kết thúc chuỗi)** là dấu hiệu đặc biệt trong cơ chế sinh để kết thúc đầu ra; không phải dấu chấm mà người dùng nhìn thấy.

- **Ví von web:** giống dấu hiệu kết thúc một luồng dữ liệu.
- **Ví dụ fullstack:** model hoàn tất tóm tắt, API báo `end_turn`.
- **Giới hạn:** kết thúc lượt không chứng minh nội dung đúng hoặc đáp ứng mọi yêu cầu.

**Stop sequence (chuỗi dừng)** là chuỗi văn bản bạn cấu hình để API dừng khi model sinh đến nó.

- **Ví von web:** giống delimiter đánh dấu ranh giới khi đọc dữ liệu.
- **Ví dụ fullstack:** một quy trình định dạng văn bản dùng chuỗi `[[END_SUMMARY]]` làm mốc dừng.
- **Giới hạn:** model không được bảo đảm sẽ sinh mốc đó; mốc xuất hiện ngoài ý muốn cũng có thể làm dừng sớm. Nó không phải validation cho nội dung.

**Stop reason (lý do dừng)** là metadata giải thích tại sao lượt sinh kết thúc.

- **Ví von web:** giống mã trạng thái nghiệp vụ trong response body.
- **Ví dụ fullstack:** backend trả thêm `truncated: true` khi gặp `max_tokens`.
- **Giới hạn:** stop reason khác HTTP status. Request thành công vẫn có thể chứa văn bản bị cắt.

#### Lỗi thường gặp

- Có HTTP 200 là xem bản tóm tắt hoàn chỉnh.
- Gặp `max_tokens` nhưng vẫn hiển thị như không có vấn đề.
- Tự retry không giới hạn mỗi khi gặp kết quả ngắn.
- Dùng chuỗi dừng phổ biến như “END” khiến nội dung hợp lệ vô tình bị cắt.

### 8. Response chứa gì?

Response cung cấp nội dung, số token sử dụng và lý do dừng. Trong Messages API, văn bản nằm trong các block của mảng `content`; đừng mặc định response có một thuộc tính `message` là chuỗi. [Ví dụ request và response chính thức](https://platform.claude.com/docs/en/build-with-claude/working-with-messages).

**Content block (khối nội dung)** là một phần nội dung có trường `type` để mô tả loại của nó.

- **Ví von web:** giống phần tử trong mảng có discriminated union ở TypeScript.
- **Ví dụ fullstack:** lấy các block có `type: "text"` để hiển thị bản tóm tắt.
- **Giới hạn:** không phải mọi block đều có thuộc tính `text`; các tính năng khác có thể trả loại nội dung khác.

**Usage (thống kê token sử dụng)** cung cấp các số đếm như `input_tokens` và `output_tokens`.

- **Ví von web:** giống telemetry đo lượng dữ liệu được xử lý trong một request.
- **Ví dụ fullstack:** so sánh usage giữa ticket ngắn và dài để điều chỉnh sản phẩm.
- **Giới hạn:** số token không phải số tiền. Tính chi phí cần bảng giá và các quy tắc tính phí liên quan.

### 9. Ví dụ backend ngắn

Giả sử dự án Node.js đã cài `@anthropic-ai/sdk`. Cấu hình phía server hai biến `ANTHROPIC_API_KEY` và `ANTHROPIC_MODEL`; biến thứ hai chứa tên model hợp lệ cho tài khoản của bạn. Không đưa key vào bundle frontend.

Hàm dưới đây minh họa một lần gọi. Route của bạn cần kiểm tra quyền người dùng và validate ticket trước khi gọi hàm.

```javascript
import Anthropic from "@anthropic-ai/sdk";

// Chỉ chạy phía server.
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function summarizeTicket(ticketText) {
  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL,
    max_tokens: 200, // Trần đầu ra, không phải 200 từ.
    messages: [{
      role: "user",
      content: `Tóm tắt ticket sau thành 3 gạch đầu dòng:\n${ticketText}`,
    }],
  });

  // Chỉ lấy block văn bản.
  const text = response.content
    .filter(block => block.type === "text")
    .map(block => block.text)
    .join("\n");

  return {
    text,
    stopReason: response.stop_reason,
    usage: response.usage,
  };
}
```

Các bước chính:

1. Tạo API client bằng key phía server.
2. Gửi model, giới hạn sinh và yêu cầu tóm tắt.
3. Đọc các block văn bản thay vì giả định một chuỗi duy nhất.
4. Trả cả metadata để route quyết định cách hiển thị.

Đây là đoạn minh họa, chưa bao gồm xử lý exception, timeout hoặc đầy đủ stop reason. Với bài thực hành, cần phân biệt lỗi gọi API với đầu ra bị cắt. Không hardcode tên model từ ví dụ cũ của khóa nếu chưa kiểm tra model còn dùng được.

#### Lỗi thường gặp

Chỉ trả `text` rồi bỏ mọi metadata. Khi người dùng báo “tóm tắt thiếu”, bạn sẽ khó phân biệt bị cắt với model bỏ sót ý.

## Tóm tắt 5 ý chính

1. Luồng cơ bản là **client → backend → Anthropic/Claude → backend → client**.
2. **Giữ API key phía server**; kiểm tra quyền người dùng là lớp bảo vệ riêng.
3. **Token không phải từ**; `max_tokens` giới hạn lượng sinh đầu ra.
4. Model xử lý văn bản qua các bước khái niệm: **tokenization, embedding, contextualization, generation**.
5. Đọc **content, usage và stop_reason**; HTTP thành công không bảo đảm đầu ra hoàn chỉnh hoặc đúng nghiệp vụ.

## Câu hỏi tự kiểm tra

1. Vì sao đặt key trong biến môi trường của frontend vẫn có thể làm lộ key?
2. `max_tokens: 200` có bảo đảm đầu ra gồm 200 từ không? Có giới hạn độ dài ticket đầu vào không?
3. Embedding khác ID database hoặc một mục từ điển ở điểm nào?
4. Backend nhận HTTP 200 và `stop_reason: "max_tokens"`. Bạn có nên đánh dấu bản tóm tắt là hoàn chỉnh không?
5. Vì sao nên lọc block có `type: "text"` thay vì mặc định đọc `response.content[0].text`?

## Bài thực hành nhỏ — Tóm tắt ticket trong 15–30 phút

**Mục tiêu:** thêm một endpoint thử nghiệm nhận nội dung ticket, gọi Claude và trả bản tóm tắt cùng metadata. Dùng ticket giả lập, không cần dữ liệu khách hàng thật.

**Điều kiện:** có API key hợp lệ và model có thể dùng. Nếu chưa có key, dùng response giả lập để hoàn thành phần đọc response; bạn cần key để kiểm tra tích hợp thật.

### Bước 1 — Chuẩn bị, 5 phút

- Thêm cấu hình bí mật phía server và tên model hợp lệ.
- Tạo endpoint trong backend hiện tại, chẳng hạn `POST /api/tickets/summarize`.
- Chỉ nhận một chuỗi nội dung không rỗng; giữ kiểm tra quyền theo cơ chế hiện có của dự án.

### Bước 2 — Tích hợp, 10 phút

- Gọi hàm minh họa ở trên với ticket giả lập gồm 5–8 câu.
- Trả `text`, `stopReason` và `usage`.
- Khi gặp `max_tokens`, hiển thị thông báo “Bản tóm tắt có thể chưa đầy đủ”.
- Khi API báo lỗi, trả thông báo lỗi phù hợp thay vì giả vờ có bản tóm tắt.

### Bước 3 — Thử hai trường hợp, 5–10 phút

1. Yêu cầu “Giải thích chi tiết từng vấn đề trong ticket”, đặt `max_tokens` rất nhỏ, chẳng hạn 10. Mục tiêu là quan sát tình huống có thể bị cắt; kiểm tra giá trị thực tế, không mặc định chắc chắn xảy ra.
2. Yêu cầu tóm tắt ngắn, đặt giới hạn lớn hơn, chẳng hạn 200. So sánh văn bản, usage và stop reason.

**Tiêu chí hoàn thành:** frontend không chứa key; backend lấy đúng văn bản; bạn phân biệt được request lỗi, lượt kết thúc tự nhiên và đầu ra chạm giới hạn. Bản tóm tắt không tự thêm thông tin ngoài ticket mẫu.

## Cần tìm hiểu thêm

Các chủ đề dưới đây vượt phạm vi bài này; không cần hiểu chúng để hoàn thành luồng cơ bản:

- Lịch sử hội thoại nhiều lượt và hướng dẫn áp dụng cho toàn cuộc hội thoại.
- Giới hạn lượng ngữ cảnh model có thể xử lý, cùng cách đếm token trước khi gửi.
- Truyền kết quả dần về UI thay vì chờ toàn bộ câu trả lời.
- Các loại stop reason khác và response chứa nội dung ngoài văn bản.
- Timeout, giới hạn tốc độ gọi API, retry có kiểm soát và giá sử dụng.
- Tìm kiếm tài liệu bằng embedding; cung cấp dữ liệu và hành động bên ngoài cho model.

Các bài sau của khóa đi sâu vào những phần này. Bài hiện tại xây nền để bạn hiểu request và response trước.

## Đáp án tự kiểm tra

1. Biến môi trường được framework công khai có thể đi vào JavaScript bundle hoặc dữ liệu gửi xuống trình duyệt. Khi đó người dùng lấy được key. Key phải chỉ được đọc ở phía server.
2. Không. Token không đồng nghĩa với từ; giới hạn là trần, không phải số lượng bắt buộc. `max_tokens` không đặt giới hạn độ dài ticket đầu vào.
3. Embedding là biểu diễn số được học để model tính toán quan hệ. Nó không chỉ định danh như ID, cũng không liệt kê các nghĩa có tên rõ ràng như từ điển.
4. Không. Request đã thành công ở mức HTTP, nhưng quá trình sinh chạm giới hạn. Cần báo khả năng bị cắt và cân nhắc giới hạn hoặc cách yêu cầu phù hợp hơn.
5. Vì `content` là mảng block có loại. Block đầu tiên không được bảo đảm luôn là văn bản, và có thể có nhiều block văn bản cần ghép lại.
