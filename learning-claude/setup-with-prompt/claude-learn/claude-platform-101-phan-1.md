# Claude Platform 101 — Phần 1: Đưa Claude vào ứng dụng fullstack

## 1. Bài này giải quyết vấn đề gì?

Bạn đã biết viết endpoint, truy vấn database và trả dữ liệu cho frontend. Bài này bổ sung một khả năng: **gọi Claude từ backend để xử lý những công việc khó mô tả bằng các quy tắc cố định**, chẳng hạn tóm tắt nội dung, phân loại ticket hoặc soạn bản nháp trả lời.

Ví dụ xuyên suốt: một ứng dụng hỗ trợ khách hàng có nút **“Soạn bản nháp”**.

```text
Người dùng bấm nút
    → Backend lấy nội dung ticket
    → Backend gọi Claude
    → Claude trả bản nháp
    → Frontend hiển thị để nhân viên kiểm tra
```

Bạn vẫn xây dựng ứng dụng fullstack như bình thường. Claude trở thành một dịch vụ mà backend gọi khi cần.

**Vì sao nên quan tâm?** Bạn có thể thêm một tính năng hữu ích vào sản phẩm hiện có mà chưa cần xây chatbot hay hệ thống tự động phức tạp.

### Phạm vi và nguồn

Phần này dựa trên nội dung văn bản của ba bài đầu:

- [What is the Claude Platform?](https://anthropic.skilljar.com/claude-platform-101/486250)
- [Your first API call](https://anthropic.skilljar.com/claude-platform-101/486251)
- [Choosing the right model](https://anthropic.skilljar.com/claude-platform-101/486252)

Các ô stack và mục tiêu trong yêu cầu của bạn còn để dạng mẫu. Tôi dùng **TypeScript/Node và mục tiêu tích hợp Claude API vào sản phẩm** làm ví dụ.

Tôi đọc phần văn bản dưới video, chưa đối chiếu toàn bộ lời thoại trong video. Khi mở ba bài để đọc, Skilljar tự đánh dấu chúng hoàn thành; trang hiện hiển thị **3/14**.

## 2. Hiểu Claude trước khi hiểu Platform

### 2.1. LLM và model là gì?

**LLM — Large Language Model, mô hình ngôn ngữ lớn** — là hệ thống được huấn luyện để xử lý và tạo ngôn ngữ, bao gồm cả code. Khi nhận đầu vào, nó tạo đầu ra dựa trên những mẫu đã học và thông tin bạn cung cấp.

**Model — mô hình** — là phiên bản cụ thể của hệ thống đó mà bạn chọn để xử lý request.

- **Ví von với web:** Bạn gọi một dịch vụ xử lý nội dung và chọn bộ máy xử lý qua tham số `model`.
- **Ví dụ fullstack:** Backend đưa một ticket dài vào model và yêu cầu tóm tắt vấn đề trong ba câu.
- **Giới hạn của ví von:** Một hàm như `calculateTotal()` thường có quy tắc rõ ràng. Model không cung cấp bảo đảm đúng tương tự; cùng một yêu cầu có thể tạo cách diễn đạt khác nhau và có thể trả lời sai.

**Kết luận thực dụng:** Đầu ra của model là kết quả cần được kiểm tra theo yêu cầu sản phẩm.

### 2.2. Prompt và system prompt là gì?

**Prompt — chỉ dẫn hoặc nội dung đầu vào cho model** — mô tả điều bạn muốn nó làm và cung cấp dữ liệu cần xử lý.

**System prompt — chỉ dẫn hệ thống** — đặt cách hành xử chung, chẳng hạn vai trò, giọng văn và giới hạn nhiệm vụ.

- **Ví von với web:** System prompt giống cấu hình chung của một service; nội dung ticket giống payload của từng request.
- **Ví dụ fullstack:** Chỉ dẫn chung là “Soạn trả lời ngắn, lịch sự, không tự hứa hoàn tiền”; payload là ticket cụ thể.
- **Giới hạn của ví von:** Cấu hình phần mềm được thực thi bởi code. System prompt là chỉ dẫn bằng ngôn ngữ, không phải cơ chế phân quyền hay validation chắc chắn.

### Hiểu nhầm phổ biến

- **“Claude nói chắc chắn nên chắc là đúng.”** Giọng văn tự tin không chứng minh tính đúng.
- **“Ghi quy tắc trong prompt là đủ.”** Backend vẫn phải kiểm tra quyền, dữ liệu và các hành động nghiệp vụ.
- **“Gửi tài liệu vào là huấn luyện lại model.”** Trong request thông thường, bạn đang cung cấp dữ liệu để xử lý; bạn không cập nhật model bằng một lần gọi API.

## 3. Claude Platform gồm những gì?

**Claude Platform** là nền tảng của Anthropic để bạn sử dụng Claude bằng code: REST API, SDK, công cụ dòng lệnh và Console.

- **Ví von với web:** Giống một nền tảng dịch vụ có API để tích hợp và trang quản trị để quản lý sử dụng.
- **Ví dụ fullstack:** Backend gọi API; đội phát triển dùng Console quản lý API key và theo dõi usage.
- **Giới hạn của ví von:** Response thành công về mặt HTTP chưa chứng minh nội dung Claude tạo ra đáp ứng nghiệp vụ.

### Ba lớp trong bài học

| Lớp | Câu hỏi nó giải quyết | Liên hệ với hệ thống web |
|---|---|---|
| **Primitives — thành phần cơ bản** | Gọi Claude và cung cấp khả năng xử lý như thế nào? | API và các thành phần để xây tính năng |
| **Infrastructure — hạ tầng vận hành** | Chạy và mở rộng hệ thống như thế nào? | Queue, retry, quản lý tác vụ, theo dõi vận hành |
| **Controls — công cụ kiểm soát** | Đánh giá chất lượng và kiểm soát sử dụng như thế nào? | Dashboard, kiểm thử, giới hạn chi tiêu, log |

Bài giới thiệu còn nhắc đến tools, Skills, MCP và managed agents. Chúng sẽ được giải thích ở các phần sau; lúc này bạn chỉ cần hiểu chúng nằm trong bức tranh lớn của nền tảng.

### Messages API là gì?

**Messages API — API gửi các thông điệp cho Claude** — nhận model, chỉ dẫn và nội dung hội thoại, rồi trả kết quả model tạo ra.

- **Ví von với web:** Đây là một API xử lý nội dung; trong SDK, bạn gọi bằng `client.messages.create(...)`.
- **Ví dụ fullstack:** Endpoint `/tickets/:id/draft` lấy ticket từ database, gọi Messages API và trả bản nháp cho frontend.
- **Giới hạn của ví von:** API không tự biết ticket trong database của bạn. Backend phải lấy và cung cấp dữ liệu cần thiết.

### Lỗi thường gặp

**Xây quá nhiều trước khi có tính năng đầu tiên.** Với nút soạn bản nháp, một lần gọi API có thể đã đủ. Hãy kiểm chứng giá trị và chất lượng trước khi thêm hạ tầng phức tạp.

## 4. Một request gồm những gì?

### 4.1. Token và `max_tokens`

**Token — đơn vị nhỏ mà model dùng để xử lý nội dung** — có thể là một phần từ, dấu câu hoặc đoạn ký tự. Token không đồng nghĩa với từ hay ký tự.

Có hai nhóm cần phân biệt:

- **Input tokens:** Nội dung được gửi vào model.
- **Output tokens:** Nội dung model tạo ra.

- **Ví von với web:** Token giống đơn vị đo khối lượng payload và kết quả xử lý.
- **Ví dụ fullstack:** Ticket dài làm tăng input tokens; bản nháp dài làm tăng output tokens.
- **Giới hạn của ví von:** Token không phải byte. Hai đoạn có cùng số ký tự vẫn có thể có số token khác nhau.

**`max_tokens` đặt giới hạn số token đầu ra.** Nó không yêu cầu model phải dùng hết giới hạn và không giới hạn toàn bộ input.

Ví dụ: yêu cầu “trả lời trong ba câu” định hướng độ dài bằng nội dung; `max_tokens` đặt trần kỹ thuật. Bạn thường cần cả hai.

### 4.2. `system` và `messages`

| Trường | Vai trò | Ví dụ |
|---|---|---|
| `model` | Chọn model xử lý | ID model hợp lệ |
| `max_tokens` | Giới hạn đầu ra | `300` |
| `system` | Đặt cách hành xử chung | Không tự hứa hoàn tiền |
| `messages` | Chứa nội dung và hội thoại | Ticket cần xử lý |

Trong `messages`:

- **`user`** biểu thị đầu vào hoặc yêu cầu được đưa cho Claude.
- **`assistant`** biểu thị lượt trả lời của Claude trong lịch sử hội thoại bạn gửi.

- **Ví von với web:** Các role giống nhãn phân loại bản ghi trong lịch sử hội thoại.
- **Ví dụ fullstack:** Bạn gửi câu hỏi của khách hàng và các lượt trao đổi trước đó để Claude soạn câu trả lời tiếp theo.
- **Giới hạn của ví von:** Role không phải role phân quyền trong ứng dụng. Gắn `user` không chứng minh người gửi được phép đọc hay sửa dữ liệu.

### 4.3. Response là các content block

**Content block — khối nội dung có kiểu** — là một phần của response. `response.content` là mảng các khối, không phải một chuỗi duy nhất.

- **Ví von với lập trình:** Giống mảng các object có trường `type`, để code phân biệt cách xử lý.
- **Ví dụ fullstack:** Với tính năng bản nháp, bạn lấy những block có `type === "text"` để hiển thị.
- **Giới hạn của ví von:** Không phải block nào cũng là văn bản. Các bài sau sẽ giải thích những kiểu khác.

### Lỗi thường gặp

- Coi `max_tokens` là số từ.
- Giả định `response.content` là string.
- Giả định API tự nhớ mọi request trước đó. Với cách gọi Messages API cơ bản, ứng dụng phải gửi lịch sử cần thiết.
- Yêu cầu “trả JSON” rồi tin rằng dữ liệu luôn hợp lệ. Response có cấu trúc ở lớp API không đồng nghĩa với nội dung bên trong đã đạt schema nghiệp vụ.

## 5. Lần gọi API đầu tiên

### Chuẩn bị

Bài học yêu cầu tạo API key trong Console và có credits để gọi API.

Cài SDK:

```bash
npm install @anthropic-ai/sdk
```

**API key phải nằm ở backend.** Dùng biến môi trường hoặc cơ chế quản lý secret của môi trường triển khai.

Bài gợi ý `.env.local`, nhưng cần hiểu đúng:

- File này phải được loại khỏi Git.
- Framework hoặc cách chạy script phải thực sự nạp file.
- Với Next.js, không đặt API key trong biến có tiền tố `NEXT_PUBLIC_`.

### Code tối thiểu

Đoạn này chạy ở server, trong ngữ cảnh cho phép `await`. Nó giả định bạn đã nạp hai biến môi trường:

- `ANTHROPIC_API_KEY`: API key.
- `CLAUDE_MODEL`: ID model hợp lệ mà bạn chọn.

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const response = await client.messages.create({
  model: process.env.CLAUDE_MODEL!,
  max_tokens: 300,
  system:
    "Soạn bản nháp hỗ trợ bằng tiếng Việt. Không tự hứa hoàn tiền.",
  messages: [
    { role: "user", content: "Tôi thấy đơn hàng bị tính phí hai lần." },
  ],
});

const draft = response.content
  .filter(block => block.type === "text")
  .map(block => block.text)
  .join("\n");

console.log(draft);
console.log(response.usage); // Quan sát lượng token đã dùng
```

### Các bước chính

1. **Tạo client:** SDK dùng API key để gọi dịch vụ.
2. **Chọn model:** Lấy ID từ cấu hình để dễ thay đổi.
3. **Đặt chỉ dẫn:** Nêu giọng trả lời và giới hạn nghiệp vụ.
4. **Gửi dữ liệu:** Ticket nằm trong message `user`.
5. **Đọc kết quả:** Lọc block văn bản rồi ghép thành bản nháp.
6. **Quan sát usage:** Ghi nhận lượng token để hiểu chi phí.

Dấu `!` sau biến model chỉ giúp TypeScript bỏ cảnh báo có thể thiếu giá trị; **nó không kiểm tra biến ở runtime**. Trong ứng dụng thật, hãy kiểm tra cấu hình khi khởi động.

### Lưu ý về tên model trong bài

Văn bản khóa học dùng các ID Opus khác nhau ở các ví dụ, và phần chọn model có nội dung cập nhật không đồng bộ với recap.

Vì vậy, hãy học **cấu trúc request**, rồi lấy ID đang được hỗ trợ từ [Models overview chính thức](https://platform.claude.com/docs/en/models/overview). Đoạn code trên dùng biến cấu hình để không phụ thuộc một ID trong bài cũ.

### Lỗi thường gặp

- Đặt API key trong React component hoặc gửi xuống trình duyệt.
- Tưởng `.env.local` tự bảo đảm secret không bị commit.
- Dùng tên model từ ví dụ mà không kiểm tra khả năng truy cập.
- Cho rằng Claude đã xác minh việc tính phí hai lần. Trong ví dụ, nó chỉ nhận lời kể của khách hàng; chưa có dữ liệu thanh toán để kiểm tra.

## 6. Chọn model bằng chất lượng đo được

Bài học đặt ra ba yếu tố: **chất lượng, tốc độ và chi phí**.

Theo cách phân nhóm của bài:

| Nhóm | Công việc bài học gợi ý |
|---|---|
| **Haiku** | Phân loại, trích xuất, định tuyến; khối lượng lớn |
| **Sonnet** | Công việc thường ngày cần cân bằng chất lượng và tốc độ |
| **Opus** | Phân tích phức tạp, lập trình nhiều bước |
| **Fable** | Công việc khó hơn, cần cân nhắc chi phí cao hơn |

Phần văn bản có bổ sung Fable, trong khi hình và recap vẫn nói về ba nhóm. Đây là điểm cập nhật không đồng bộ trong nguồn. Danh mục hiện tại cũng liệt kê Fable cùng Opus, Sonnet và Haiku; hãy kiểm tra thông số và ID tại [tài liệu model chính thức](https://platform.claude.com/docs/en/models/overview).

**Đừng xem bảng trên là quy tắc chọn tự động.** Nó là điểm khởi đầu để thử nghiệm.

### 6.1. Evaluation là gì?

**Evaluation, thường gọi là eval — phép đánh giá đầu ra của model** — dùng một tập đầu vào và tiêu chí cụ thể để kiểm tra model có làm tốt nhiệm vụ của bạn không.

- **Ví von với web:** Giống integration test với dữ liệu đại diện.
- **Ví dụ fullstack:** Cho model xử lý ticket hoàn tiền, lỗi đăng nhập và phản ánh giao hàng; kiểm tra bản nháp có đúng vấn đề và có tự hứa điều không được phép không.
- **Giới hạn của ví von:** Nhiều câu trả lời khác nhau đều có thể tốt. So sánh string bằng nhau thường không phù hợp; bạn cần tiêu chí chấm.

Bài học gợi ý bắt đầu với **20–30 ví dụ đại diện**.

Với tính năng bản nháp, tiêu chí có thể là:

| Tiêu chí | Cách kiểm tra |
|---|---|
| Hiểu đúng vấn đề | Không trả lời lệch nội dung ticket |
| Không bịa dữ kiện | Không tự thêm trạng thái đơn hàng |
| Tuân thủ chính sách | Không tự hứa hoàn tiền |
| Dễ sử dụng | Nhân viên ít phải sửa |
| Chi phí và tốc độ | Phù hợp ngân sách và trải nghiệm UI |

### 6.2. Thử từ model rẻ hơn

Cách bài học đề xuất:

1. Chạy tập eval với Haiku.
2. Nếu chưa đạt tiêu chí, thử Sonnet.
3. Nếu vẫn cần khả năng cao hơn, thử Opus.
4. Cân nhắc nhóm cao hơn khi lợi ích đo được xứng đáng với chi phí.

Mục tiêu là **chọn model có chi phí phù hợp nhất trong số các model đạt yêu cầu**.

Khi so sánh, giữ cùng input, chỉ dẫn và tiêu chí. Đo thời gian ở code gọi API; `response.usage` cho lượng token, không tự cho bạn một phép đo latency hoàn chỉnh.

### 6.3. Model routing là gì?

**Model routing — định tuyến tác vụ tới model phù hợp** — là cách ứng dụng chọn model khác nhau cho từng loại công việc.

- **Ví von với web:** Giống dispatcher đưa từng loại job tới worker phù hợp.
- **Ví dụ fullstack:** Phân loại ticket dùng model nhanh; soạn trả lời khó dùng model đã đạt eval cho nhiệm vụ đó.
- **Giới hạn của ví von:** Các model không phải những worker tương đương hoàn toàn. Chất lượng đầu ra có thể khác nhau và phải được kiểm chứng riêng.

### Hiểu nhầm phổ biến

- **“Model mạnh nhất luôn là lựa chọn tốt nhất.”** Bạn có thể trả thêm tiền mà không cải thiện đáng kể tính năng.
- **“Model rẻ nhất luôn tiết kiệm nhất.”** Kết quả kém có thể tạo thêm lần gọi lại và công sửa.
- **“Một ví dụ trả lời đẹp là đủ.”** Bạn cần cả trường hợp thiếu dữ liệu, mơ hồ và dễ bị hiểu sai.
- **“Số token ít hơn nghĩa là hóa đơn thấp hơn.”** Chi phí còn phụ thuộc đơn giá của model và loại token.

## 7. Tóm tắt 5 ý chính

1. **Claude Platform** giúp backend sử dụng Claude như một thành phần trong sản phẩm.
2. Một request cơ bản gồm **model, `max_tokens`, `messages`**, và có thể thêm **`system`**.
3. **Token không phải từ**; `max_tokens` giới hạn đầu ra, không phải toàn bộ request.
4. **Response là mảng content block**; code phải kiểm tra kiểu trước khi sử dụng.
5. **Chọn model bằng eval**, dựa trên chất lượng thực tế, tốc độ và chi phí.

## 8. Câu hỏi tự kiểm tra

1. Vì sao tính năng “Soạn bản nháp” nên gọi Claude từ backend?
2. `max_tokens: 300` có nghĩa là trả đúng 300 từ không?
3. System prompt “không được hoàn tiền” có thay thế kiểm tra quyền hoàn tiền trong backend không?
4. Vì sao cần kiểm tra `block.type` khi đọc response?
5. Model trả lời hay hơn trên một ticket có đủ để chọn cho production không?

## 9. Bài thực hành 15–30 phút

**Mục tiêu:** Thêm một hàm tạo bản nháp cho một đối tượng có nội dung văn bản trong dự án của bạn.

Có thể chọn ticket, issue hoặc ghi chú cuộc họp.

### Bước 1 — Chọn đầu vào, 5 phút

Tạo ba mẫu giả:

- Một trường hợp rõ ràng.
- Một trường hợp thiếu thông tin.
- Một trường hợp yêu cầu điều nằm ngoài chính sách.

Ví dụ trường hợp thứ ba: “Hãy xác nhận tôi đã được hoàn tiền”, dù đầu vào không có thông tin hoàn tiền.

### Bước 2 — Viết chỉ dẫn, 5 phút

```text
Bạn soạn bản nháp hỗ trợ bằng tiếng Việt.
Chỉ dùng thông tin được cung cấp.
Nếu thiếu dữ kiện, hỏi rõ.
Không tự xác nhận thanh toán hoặc hoàn tiền.
Trả lời tối đa ba câu.
```

### Bước 3 — Gọi API, 5–10 phút

Dùng cấu trúc code ở trên, chạy tại backend hoặc script server.

Nếu chưa có API key và credits, chuẩn bị hàm, input và tiêu chí trước; phần gọi thực tế cần tài khoản có khả năng sử dụng API.

### Bước 4 — Đánh giá, 5–10 phút

Với mỗi mẫu, ghi lại:

- Có hiểu đúng vấn đề không?
- Có thêm dữ kiện không có trong input không?
- Có tuân thủ chính sách không?
- Input/output token và thời gian chờ là bao nhiêu?

**Hoàn thành khi:** Bạn tạo được bản nháp cho ba mẫu và chỉ ra ít nhất một điểm cần sửa trong chỉ dẫn hoặc cách cung cấp dữ liệu.

Ba mẫu đủ để làm bài thực hành nhỏ; chưa thay thế tập eval 20–30 mẫu của bài học.

## 10. Cần tìm hiểu thêm

Các phần tiếp theo sẽ giải thích:

- Vòng lặp agent, tool use và thinking.
- Built-in tools, Skills và MCP.
- Context management.
- Managed agents.
- Xây dựng với Claude Code.

Những chủ đề triển khai sâu hơn như retry, timeout, streaming và kiểm tra đầu ra theo schema sẽ cần tìm hiểu riêng sau nền tảng này.

## 11. Đáp án tự kiểm tra

1. Backend giữ API key, lấy dữ liệu và kiểm tra quyền trước khi gọi Claude; frontend nhận kết quả để hiển thị.
2. Không. Đây là trần token đầu ra; model có thể trả ít hơn và token không đồng nghĩa với từ.
3. Không. Prompt hướng dẫn model; backend phải thực thi quyền và quy tắc nghiệp vụ.
4. Vì `content` có thể chứa nhiều loại block, không chỉ văn bản.
5. Không. Cần tập dữ liệu đại diện, tiêu chí chấm và đo chi phí/tốc độ.

**Dừng tại đây. Gõ “tiếp” để học Phần 2: vòng lặp agent, tool use và thinking.**
