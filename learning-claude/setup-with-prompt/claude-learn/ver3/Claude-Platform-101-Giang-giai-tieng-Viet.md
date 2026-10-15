# Claude Platform 101 — Giảng giải và thực hành bằng tiếng Việt

**Nguồn chính:** [Claude Platform 101 — Anthropic Academy](https://anthropic.skilljar.com/claude-platform-101).  
**Ngày biên soạn:** 15/10/2026.  
**Phạm vi:** 13 bài giảng, phần hướng dẫn quiz và bài tập ôn tập tự biên soạn.

## Cách sử dụng tài liệu

Đây là bản giảng giải bằng lời mới, có bổ sung ví dụ và hướng dẫn thực hành. Tôi đã truy cập từng mục, đọc phần chữ, mô tả hình minh họa và phụ đề tự động tiếng Anh của cả 13 video. Các mốc thời gian bên dưới giúp bạn mở lại đúng đoạn demo. Đây không phải bản chép nguyên văn hay bản ghi lại từng khung hình của video.

Trong mỗi bài:

- **Hiểu bài:** giải thích khái niệm và lý do cần dùng.
- **Theo demo:** diễn giải trình tự công việc mà giảng viên thực hiện.
- **Thực hành:** ví dụ và các bước để bạn tự làm lại; phần mở rộng được ghi rõ.
- **Tự kiểm tra:** dấu hiệu cho thấy bạn đã hiểu hoặc làm đúng.

Các ví dụ thời tiết trong khóa học chủ yếu dùng **dữ liệu giả lập**. Thấy Claude trả lời về thời tiết không có nghĩa chương trình đã kết nối một dịch vụ thời tiết thật.

**Lưu ý phiên bản:** khóa học chứa nhiều thế hệ model và API beta khác nhau. Bài 2 dùng cả `claude-opus-4-7` và `claude-opus-4-8`; bài Skills còn dùng Sonnet 4.5. Bài chọn model có ghi chú Fable trong phần chữ, trong khi video và phần recap vẫn nói về ba họ Haiku, Sonnet, Opus. Vì vậy, các mã model được xem là ví dụ của khóa học. Khi thực hành, chọn ID có quyền truy cập trong tài khoản của bạn. Những chỉnh lý từ tài liệu chính thức được đặt ngay tại bài liên quan.

**Trạng thái kiểm chứng:** các đoạn mã được biên soạn để giải thích và tự thực hành; chưa gọi API trả phí, chưa tạo agent, chưa kết nối tài khoản bên ngoài bằng thông tin của bạn. Quiz chính thức chưa được trả lời hay nộp. Trang học có cơ chế tự đánh dấu bài đã xem khi được mở.

## Mục lục

1. [Claude Platform là gì?](#bai-1)
2. [Lời gọi API đầu tiên](#bai-2)
3. [Chọn model phù hợp](#bai-3)
4. [Vòng lặp agent](#bai-4)
5. [Tool use](#bai-5)
6. [Thinking](#bai-6)
7. [Công cụ có sẵn](#bai-7)
8. [Skills](#bai-8)
9. [MCP](#bai-9)
10. [Quản lý context](#bai-10)
11. [Managed Agents là gì?](#bai-11)
12. [Tạo managed agent đầu tiên](#bai-12)
13. [Xây dựng bằng Claude Code](#bai-13)
14. [Quiz và câu hỏi luyện tập](#quiz)
15. [Bài thực hành tổng hợp](#tong-hop)
16. [Bảng thuật ngữ và xử lý lỗi](#phu-luc)

<a id="bai-1"></a>
## Bài 1 — Claude Platform là gì?

[Bài gốc](https://anthropic.skilljar.com/claude-platform-101/486250) · [Video](https://www.youtube.com/watch?v=RfeC02NmLqs)

### Hiểu bài

Khi dùng Claude trong giao diện chat, bạn nhập câu hỏi rồi đọc câu trả lời. Khi dùng Claude Platform, **chương trình của bạn** gửi yêu cầu và nhận kết quả. Nhờ vậy, Claude có thể trở thành một tính năng trong sản phẩm: soạn phản hồi khách hàng, tóm tắt cuộc họp hoặc phân loại tài liệu.

Ví dụ, một phần mềm hỗ trợ khách hàng có nút “Soạn phản hồi”. Khi nhân viên bấm nút, máy chủ lấy nội dung phiếu hỗ trợ, gửi cho Claude và đưa bản nháp về ô soạn thảo. Nhân viên có thể sửa trước khi gửi.

Nền tảng gồm bốn thành phần dễ nhận biết:

| Thành phần | Hiểu đơn giản | Bạn dùng để làm gì? |
|---|---|---|
| REST API | Địa chỉ dịch vụ để phần mềm gửi yêu cầu | Gọi Claude từ ngôn ngữ lập trình bất kỳ |
| SDK | Thư viện giúp gọi API thuận tiện | Dùng `messages.create` thay vì tự viết toàn bộ HTTP |
| CLI | Công cụ chạy trong terminal | Thực hiện công việc bằng dòng lệnh |
| Console | Trang quản trị nền tảng | Quản lý khóa, sử dụng, thử prompt và quản lý agent |

Khóa học chia nền tảng thành ba tầng:

1. **Primitives — các khối chức năng:** Messages API, tools, files, web search, code execution, MCP và skills.
2. **Infrastructure — hạ tầng vận hành:** chạy agent, thử lại khi lỗi, hàng đợi và theo dõi hoạt động.
3. **Controls — quản trị:** dashboard, đánh giá chất lượng, giới hạn sử dụng và nhật ký.

Hình dung bạn mở một quán ăn: nguyên liệu và dụng cụ là primitives; bếp và quy trình giao món là infrastructure; báo cáo chất lượng và doanh thu là controls.

### Theo demo: thêm nút soạn phản hồi

Các đoạn đáng xem: [01:17 — bài toán help desk](https://www.youtube.com/watch?v=RfeC02NmLqs&t=77s), [01:32 — xây dựng lời gọi](https://www.youtube.com/watch?v=RfeC02NmLqs&t=92s), [02:08 — đưa kết quả về giao diện](https://www.youtube.com/watch?v=RfeC02NmLqs&t=128s).

1. Mở một phiếu hỗ trợ trong ứng dụng demo. Hình minh họa là khiếu nại bị tính tiền hai lần.
2. Xác định phần nội dung phiếu sẽ đưa cho Claude.
3. Khởi tạo client của SDK ở phía máy chủ.
4. Gọi `messages.create` và đặt model, `max_tokens`, `system`, `messages`.
5. Nhận các content block từ phản hồi; lấy các block văn bản.
6. Điền bản nháp vào ô phản hồi của ứng dụng.
7. Đọc lại, chỉnh sửa nếu cần, rồi mới dùng thao tác gửi của ứng dụng.

Đây là luồng tích hợp do lập trình viên xây dựng. Việc gọi API tự nó không tạo nút hay ô nhập trên trang web.

### Thực hành mở rộng

Thử mô tả luồng của bạn trước khi viết code:

```text
Nhân viên bấm Soạn phản hồi
    → Backend lấy nội dung phiếu
    → Backend gửi nội dung + quy tắc văn phong cho Claude
    → Claude trả về bản nháp
    → Giao diện hiển thị bản nháp
    → Nhân viên duyệt và gửi
```

Ví dụ system prompt: “Bạn là nhân viên hỗ trợ. Viết bằng tiếng Việt, lịch sự, tối đa 120 từ. Chỉ dựa trên thông tin phiếu; chưa có kết quả xử lý thì không hứa đã hoàn tiền.” Đây là quy tắc hành vi; nội dung từng phiếu đi vào `messages`.

**Tự kiểm tra:** bạn có giải thích được đâu là dữ liệu thay đổi mỗi lần gọi, đâu là quy tắc áp dụng cho mọi phiếu không? Nội dung phiếu là dữ liệu thay đổi; quy tắc văn phong nằm trong system prompt.

<a id="bai-2"></a>
## Bài 2 — Lời gọi API đầu tiên

[Bài gốc](https://anthropic.skilljar.com/claude-platform-101/486251) · [Video](https://www.youtube.com/watch?v=j0ftK_R5DTs)

### Hiểu bài

Lời gọi cơ bản cần ba trường trong body:

- `model`: model xử lý yêu cầu.
- `max_tokens`: giới hạn số token có thể sinh ra, không phải số từ và cũng không phải độ dài đầu vào.
- `messages`: danh sách tin nhắn theo vai trò `user` hoặc `assistant`.

`system` là trường bổ sung để định hướng hành vi. API key dùng để xác thực client; nó không phải một tin nhắn và không được đưa vào prompt.

Giảng viên cho Claude đọc một hàm tên `add` nhưng lại thực hiện `a - b`. Mục tiêu là thấy toàn bộ đường đi từ code → yêu cầu API → nhận xét có ích.

### Theo demo và thực hành từng bước

Mốc video: [00:14 — lấy API key](https://www.youtube.com/watch?v=j0ftK_R5DTs&t=14s), [00:39 — cấu trúc request](https://www.youtube.com/watch?v=j0ftK_R5DTs&t=39s), [01:12 — system và content blocks](https://www.youtube.com/watch?v=j0ftK_R5DTs&t=72s), [01:39 — xem kết quả](https://www.youtube.com/watch?v=j0ftK_R5DTs&t=99s).

**Bước 1 — Chuẩn bị quyền gọi API.** Mở [Claude Console](https://platform.claude.com), chọn đúng workspace và mục quản lý API keys. Tạo khóa nếu cần rồi sao chép khi khóa được hiển thị. Khóa học lưu ý tài khoản cần có credits. Chi phí và quyền truy cập phụ thuộc tài khoản; học trên Skilljar và dùng API là hai việc riêng.

**Bước 2 — Tạo thư mục thực hành.** Mở terminal trong thư mục bạn muốn làm việc và chạy:

```powershell
mkdir claude-platform-lab
cd claude-platform-lab
npm init -y
npm install @anthropic-ai/sdk
```

Máy cần có Node.js và npm. Chạy `node --version` và `npm --version` để kiểm tra trước. Các lệnh dưới dùng Node có hỗ trợ `--env-file`.

**Bước 3 — Tạo `.env.local`.** Dùng trình soạn thảo tạo file trong thư mục trên:

```dotenv
ANTHROPIC_API_KEY=THAY_BANG_KHOA_CUA_BAN
ANTHROPIC_MODEL=THAY_BANG_MODEL_ID_TRONG_CONSOLE
```

Thay hai giá trị mẫu trên máy của bạn. Tài liệu không chứa khóa thật.

**Bước 4 — Tạo `.gitignore`.** Đưa những dòng sau vào file:

```gitignore
.env
.env.*
node_modules/
```

Điểm cần sửa từ cách diễn đạt ngắn của bài học: **đặt tên `.env.local` không tự làm Git bỏ qua file**. Bạn phải có quy tắc ignore. Nếu file đã được Git theo dõi, thêm ignore cũng không tự gỡ nó khỏi lịch sử.

**Bước 5 — Tạo `first-call.mjs`.** Đây là ví dụ tự biên soạn cùng bài toán của khóa học:

```javascript
import Anthropic from "@anthropic-ai/sdk";

const model = process.env.ANTHROPIC_MODEL;
if (!model) throw new Error("Hãy đặt ANTHROPIC_MODEL trong .env.local");

const client = new Anthropic();
const buggyCode = `function add(a, b) { return a - b; }`;

const response = await client.messages.create({
  model,
  max_tokens: 1024,
  system: "Bạn là người review code. Nhận xét bằng tiếng Việt trong một đoạn ngắn.",
  messages: [
    { role: "user", content: `Hãy review đoạn code sau:\n${buggyCode}` },
  ],
});

for (const block of response.content) {
  if (block.type === "text") console.log(block.text);
}
console.log("Lý do dừng:", response.stop_reason);
console.log("Token sử dụng:", response.usage);
```

**Bước 6 — Chạy script và đọc kết quả.**

```powershell
node --env-file=.env.local first-call.mjs
```

Lệnh `--env-file` đưa giá trị từ file vào môi trường. SDK đọc `ANTHROPIC_API_KEY`; code đọc `ANTHROPIC_MODEL`. Chỉ tạo file môi trường mà không nạp nó là nguyên nhân phổ biến khiến SDK báo thiếu khóa.

**Kết quả mong đợi:** Claude chỉ ra tên hàm là cộng nhưng thân hàm đang trừ; đề xuất `return a + b`. Câu chữ cụ thể có thể khác mỗi lần.

### Vì sao phải duyệt `response.content`?

Phản hồi có dạng một danh sách các khối nội dung, không phải một chuỗi duy nhất. Một block có thể là văn bản, yêu cầu gọi tool hoặc thông tin thinking. Vì vậy:

```javascript
// Đúng cho phần văn bản:
if (block.type === "text") console.log(block.text);
```

Không mặc định mọi block đều có trường `.text`.

### Đưa vào sản phẩm

Ở tính năng tóm tắt cuộc họp, backend lấy transcript từ cơ sở dữ liệu, gọi cùng phương thức trên với yêu cầu rút ra quyết định và rủi ro, lưu kết quả, rồi trả về UI. Phần mới là kết nối với dữ liệu và giao diện; cấu trúc gọi Claude vẫn tương tự.

**Tự kiểm tra:** đổi yêu cầu thành “Trả lời bằng ba gạch đầu dòng”. Nếu đầu ra thay đổi và script vẫn đọc đúng text blocks, bạn đã đi trọn một lời gọi API.

<a id="bai-3"></a>
## Bài 3 — Chọn model phù hợp

[Bài gốc](https://anthropic.skilljar.com/claude-platform-101/486252) · [Video](https://www.youtube.com/watch?v=UAeTSBsK71A)

### Hiểu bài

Chọn model là cân bằng **chất lượng, thời gian phản hồi và chi phí**. Model mạnh hơn không tự động là lựa chọn kinh tế hơn cho mọi tác vụ.

| Họ model trong video | Định hướng của khóa học | Ví dụ |
|---|---|---|
| Haiku | Nhanh, chi phí thấp cho việc đơn giản, số lượng lớn | Gắn nhãn phiếu, trích xuất trường dữ liệu |
| Sonnet | Cân bằng cho công việc thường ngày | Soạn cập nhật dự án, trợ lý trong ứng dụng |
| Opus | Bài toán khó, nhiều bước và cần phân tích kỹ | Suy luận phức tạp, coding nhiều bước |

Phần chữ bổ sung **Fable** như một tầng năng lực phía trên Opus, kèm lưu ý về khả dụng ở thời điểm khóa học; liên kết giới thiệu còn nhắc Mythos. Video này vẫn trình bày ba họ trong bảng trên. Đây là khác biệt giữa các phần của nguồn, không phải căn cứ để cho rằng mọi tài khoản đều có mọi model.

### Theo demo: so sánh bằng cùng đầu vào

Mốc video: [00:54 — tạo eval](https://www.youtube.com/watch?v=UAeTSBsK71A&t=54s), [01:27 — chạy các model](https://www.youtube.com/watch?v=UAeTSBsK71A&t=87s), [02:30 — định tuyến theo loại việc](https://www.youtube.com/watch?v=UAeTSBsK71A&t=150s).

1. Chọn 20–30 ví dụ đại diện cho việc thật của bạn.
2. Viết tiêu chí chấm trước khi chạy: đúng thông tin, đúng cấu trúc, không bỏ sót, độ dài phù hợp.
3. Gửi cùng bộ ví dụ cho Haiku trước.
4. Nếu chất lượng đạt yêu cầu, ghi nhận kết quả và chi phí.
5. Nếu chưa đạt, thử Sonnet; tiếp tục lên Opus khi cần.
6. Dùng `response.usage` để đọc token đầu vào và đầu ra.
7. Đo thời gian riêng; `response.usage` không phải đồng hồ đo độ trễ.

Video chạy các model theo vòng lặp. Model xuất hiện trước trong terminal có thể chỉ vì nó được gọi trước; thứ tự hiển thị không đủ để kết luận model nào nhanh hơn.

### Thực hành mở rộng: lập một bảng eval nhỏ

Ví dụ, bạn muốn phân loại phiếu thành `billing`, `technical`, `other`. Tạo 25 phiếu đã có nhãn do người kiểm tra, trong đó có phiếu ngắn, dài và mơ hồ. Chạy từng model với cùng prompt rồi ghi:

| Chỉ số | Cách tính hoặc kiểm tra |
|---|---|
| Độ đúng | Số nhãn khớp / tổng ví dụ |
| Đúng định dạng | Có chỉ trả một nhãn hợp lệ không? |
| Độ trễ | Đo trước và sau mỗi request |
| Token | Đọc `input_tokens`, `output_tokens` |
| Chi phí | Đối chiếu giá của model và tính năng đang dùng |

Ví dụ giả định: Haiku đúng 24/25, Sonnet đúng 25/25. Bạn cần xem lỗi còn lại có chấp nhận được không; một lỗi liên quan hoàn tiền có thể quan trọng hơn nhiều lỗi gắn nhãn ít ảnh hưởng.

Đo thời gian trong JavaScript:

```javascript
const started = performance.now();
const response = await client.messages.create({
  model,
  max_tokens: 300,
  messages: [{ role: "user", content: prompt }],
});
console.log({
  model,
  milliseconds: Math.round(performance.now() - started),
  usage: response.usage,
});
```

Đoạn trên được đặt trong script đã có `client`, `model`, `prompt`; chưa phải một file độc lập. Chạy nhiều ví dụ để tránh kết luận từ một lần mạng nhanh hoặc chậm.

### Định tuyến trong ứng dụng

Bạn có thể dùng nhiều model trong một quy trình: Haiku phân loại tài liệu, Sonnet soạn cập nhật cho khách hàng, Opus xử lý phần trả lời RFP phức tạp. Lựa chọn diễn ra theo từng loại việc.

**Tự kiểm tra:** trước khi nói “model A tốt hơn”, bạn có chỉ được tốt hơn ở tiêu chí nào và trên bộ ví dụ nào không? Nếu chưa, hãy lập eval trước.

<a id="bai-4"></a>
## Bài 4 — Vòng lặp agent

[Bài gốc](https://anthropic.skilljar.com/claude-platform-101/486254) · [Video](https://www.youtube.com/watch?v=tBIdyIoCQVU)

### Hiểu bài

Một lời gọi thông thường giống việc hỏi một câu và nhận một câu trả lời. Agent cần làm nhiều hơn: quyết định cần dữ liệu gì, yêu cầu một công cụ lấy dữ liệu, đọc kết quả rồi quyết định bước tiếp theo.

Trong ví dụ thời tiết:

```text
Người dùng: Hôm nay ở Austin nên mặc gì?
    → Claude yêu cầu get_weather("Austin")
    → Code của bạn chạy hàm và lấy kết quả
    → Code gửi kết quả lại cho Claude
    → Claude đưa ra lời khuyên về trang phục
```

**Model quyết định nên yêu cầu gì; chương trình của bạn thực thi tool.** Khai báo tên `get_weather` không tự tạo khả năng truy cập mạng hay một API thời tiết.

### Theo demo

Mốc video: [00:31 — năm bước của vòng lặp](https://www.youtube.com/watch?v=tBIdyIoCQVU&t=31s), [00:55 — demo Austin](https://www.youtube.com/watch?v=tBIdyIoCQVU&t=55s), [01:53 — hai lượt API](https://www.youtube.com/watch?v=tBIdyIoCQVU&t=113s).

1. Khai báo tool bằng tên, mô tả và JSON Schema của đầu vào.
2. Viết hàm thực thi tool; trong bài chỉ trả dữ liệu thời tiết cố định.
3. Tạo danh sách `messages` với câu hỏi của người dùng.
4. Gọi Messages API, đính kèm `messages` và `tools`.
5. Nếu `stop_reason` là `tool_use`, tìm các block `tool_use` và thực thi từng yêu cầu.
6. Thêm **nguyên phản hồi assistant** vào lịch sử.
7. Thêm một tin nhắn `user` chứa các `tool_result` tương ứng.
8. Gọi lại API với lịch sử mới.
9. Khi `end_turn`, lấy phần văn bản làm câu trả lời của lượt đó.

Điểm nối giữa lời yêu cầu và kết quả là ID: `tool_result.tool_use_id` phải khớp với `tool_use.id` đã nhận.

### Thực hành mở rộng: một vòng lặp hoàn chỉnh

Ví dụ dưới đổi thành Đà Nẵng và bổ sung giới hạn vòng lặp, xử lý tool lỗi cùng các lý do dừng bất thường. Dữ liệu thời tiết vẫn là giả lập.

**Bước 1:** tạo môi trường Python trong thư mục lab và cài thư viện:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install anthropic python-dotenv
```

**Bước 2:** dùng lại `.env.local` ở bài 2, rồi tạo `agent_loop.py`:

```python
import json
import os

import anthropic
from dotenv import load_dotenv

load_dotenv(".env.local")
client = anthropic.Anthropic()
model = os.environ["ANTHROPIC_MODEL"]

tools = [{
    "name": "get_weather",
    "description": (
        "Trả dữ liệu thời tiết GIẢ LẬP cho thành phố để học tool use. "
        "Không phải dịch vụ dự báo trực tiếp."
    ),
    "input_schema": {
        "type": "object",
        "properties": {"city": {"type": "string"}},
        "required": ["city"],
        "additionalProperties": False,
    },
}]

def execute_tool(name, args):
    if name != "get_weather":
        raise ValueError(f"Tool không được hỗ trợ: {name}")
    city = args.get("city")
    if not isinstance(city, str) or not city.strip():
        raise ValueError("city phải là chuỗi không rỗng")
    return json.dumps({
        "city": city,
        "temperature_c": 31,
        "conditions": "nắng, có thể mưa chiều",
        "source": "mock_data",
    }, ensure_ascii=False)

history = [{
    "role": "user",
    "content": (
        "Dùng dữ liệu giả lập của tool để gợi ý trang phục ở Đà Nẵng. "
        "Nêu rõ đây là ví dụ học tập."
    ),
}]

for turn in range(1, 7):
    reply = client.messages.create(
        model=model,
        max_tokens=1200,
        tools=tools,
        messages=history,
    )
    print(f"Lượt {turn}: {reply.stop_reason}")
    history.append({"role": "assistant", "content": reply.content})

    if reply.stop_reason == "end_turn":
        for item in reply.content:
            if item.type == "text":
                print(item.text)
        break

    if reply.stop_reason != "tool_use":
        raise RuntimeError(f"Cần xử lý lý do dừng: {reply.stop_reason}")

    results = []
    for item in reply.content:
        if item.type != "tool_use":
            continue
        print("Chạy tool:", item.name, item.input)
        try:
            output = execute_tool(item.name, item.input)
            result = {
                "type": "tool_result",
                "tool_use_id": item.id,
                "content": output,
            }
        except Exception as exc:
            result = {
                "type": "tool_result",
                "tool_use_id": item.id,
                "content": str(exc),
                "is_error": True,
            }
        results.append(result)

    if not results:
        raise RuntimeError("Có tool_use nhưng không tìm thấy yêu cầu tool")
    history.append({"role": "user", "content": results})
else:
    raise RuntimeError("Đã đạt giới hạn 6 lượt; kiểm tra yêu cầu và tool")
```

**Bước 3:** chạy:

```powershell
.\.venv\Scripts\python.exe agent_loop.py
```

**Bước 4:** đọc nhật ký. Luồng điển hình gồm một lượt `tool_use`, một lần gọi hàm giả lập và một lượt `end_turn`. Số lượt thực tế do model quyết định.

### Điểm cần hiểu khi mở rộng

`end_turn` nghĩa là model kết thúc lượt trả lời, chưa phải bằng chứng tất cả yêu cầu nghiệp vụ đã đúng. Ứng dụng vẫn cần kiểm tra kết quả. `max_tokens` là một lý do dừng khác; không nên coi mọi trường hợp khác `tool_use` đều là thành công.

Trong demo sản phẩm của bài học, agent đọc báo cáo, tra từng điều khoản và lưu phát hiện vào cơ sở dữ liệu. UI nhận cập nhật qua server-sent events. Đó vẫn là vòng lặp trên, được nối thêm dữ liệu thật và phần hiển thị tiến độ.

**Tự kiểm tra:** tạm bỏ tin nhắn `tool_result`. Bạn có giải thích được vì sao model chưa có dữ liệu để trả lời tiếp không? Đây là phần kết quả thực thi mà chương trình phải gửi trở lại.

<a id="bai-5"></a>
## Bài 5 — Tool use: cho Claude dùng công cụ

[Bài gốc](https://anthropic.skilljar.com/claude-platform-101/486255) · [Video](https://www.youtube.com/watch?v=Ao759wXbRc0)

### Hiểu bài

Tool là một hàm mà bạn đưa ra cho model sử dụng. Một tool cần ba thông tin:

| Trường | Trả lời câu hỏi nào? | Ví dụ |
|---|---|---|
| `name` | Công cụ tên gì? | `lookup_building_code` |
| `description` | Khi nào nên dùng và nhận lại gì? | Tra nguyên văn điều khoản theo mã |
| `input_schema` | Cần đầu vào nào, thuộc kiểu gì? | `section` là chuỗi, bắt buộc |

Mô tả “lấy dữ liệu” quá chung chung. Mô tả “Tra nội dung của một điều khoản xây dựng theo mã mục; trả nguyên văn và mã mục” giúp model biết khi nào công cụ phù hợp.

Tool có thể bọc hàm sẵn có: truy vấn cơ sở dữ liệu, tra tồn kho hoặc tìm tài liệu. Bạn vẫn chịu trách nhiệm kiểm tra đầu vào, phân quyền và xử lý lỗi ở hàm thực thi.

### Theo demo: hai tool thời tiết

Mốc video: [00:43 — cấu trúc tool](https://www.youtube.com/watch?v=Ao759wXbRc0&t=43s), [01:26 — nhiều tool](https://www.youtube.com/watch?v=Ao759wXbRc0&t=86s), [02:34 — tool runner](https://www.youtube.com/watch?v=Ao759wXbRc0&t=154s).

1. Tạo `get_weather` để lấy thời tiết hôm nay.
2. Tạo `get_forecast` để lấy dự báo những ngày tới.
3. Viết mô tả phân biệt rõ “hiện tại” và “dự báo”.
4. Đưa cả hai vào mảng `tools`.
5. Trong hàm điều phối, phân nhánh theo tên tool để gọi đúng hàm.
6. Hỏi về hành lý cho chuyến đi Denver ba ngày.
7. Quan sát Claude yêu cầu cả thời tiết hiện tại và dự báo. Hai tool có thể được yêu cầu trong cùng lượt hoặc các lượt khác nhau.
8. Trả từng kết quả với đúng `tool_use_id`, rồi nhận gợi ý cuối.

Nếu hàm thật gọi mạng, nó thường bất đồng bộ. Trong JavaScript phải `await` kết quả hoặc dùng `Promise.all` phù hợp; không gửi một Promise làm nội dung kết quả tool.

### Tool runner giúp gì?

Khi tự viết vòng lặp, bạn phải quản lý các lượt API, gọi hàm và trả kết quả. Tool runner của SDK làm phần lặp đó giúp bạn. Tuy vậy, công cụ vẫn cần được mô tả bằng định dạng mà SDK hỗ trợ.

**Chỉnh lý quan trọng:** đoạn rút gọn trong khóa học đưa các hàm TypeScript trực tiếp vào `tools`. Khi thực hành, không nên mặc định mọi hàm JavaScript đều tự biến thành schema. Tài liệu SDK có helper `betaZodTool` để khai báo schema, mô tả và hàm `run` rõ ràng. [Tài liệu SDK TypeScript](https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/typescript).

### Thực hành mở rộng: tool runner với Zod

**Bước 1:** trong thư mục Node của bài 2, cài phần phụ thuộc:

```powershell
npm install zod
```

**Bước 2:** tạo `weather-runner.mjs`:

```javascript
import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

const client = new Anthropic();
const model = process.env.ANTHROPIC_MODEL;
if (!model) throw new Error("Thiếu ANTHROPIC_MODEL");

const currentWeather = betaZodTool({
  name: "get_weather",
  description: "Lấy thời tiết hiện tại GIẢ LẬP cho ví dụ học tập.",
  inputSchema: z.object({ city: z.string().min(1) }),
  run: ({ city }) => JSON.stringify({ city, celsius: 12, mock: true }),
});

const forecast = betaZodTool({
  name: "get_forecast",
  description: "Lấy dự báo ba ngày GIẢ LẬP; không dùng cho thời tiết trực tiếp.",
  inputSchema: z.object({ city: z.string().min(1) }),
  run: ({ city }) => JSON.stringify({
    city, daily_celsius: [12, 16, 19], mock: true,
  }),
});

const finalMessage = await client.beta.messages.toolRunner({
  model,
  max_tokens: 1500,
  tools: [currentWeather, forecast],
  messages: [{
    role: "user",
    content: "Dùng dữ liệu giả lập để gợi ý đồ cho chuyến Denver ba ngày. " +
      "Hãy xem cả thời tiết hôm nay và dự báo; ghi rõ dữ liệu là giả lập.",
  }],
});

for (const block of finalMessage.content) {
  if (block.type === "text") console.log(block.text);
}
```

**Bước 3:** chạy `node --env-file=.env.local weather-runner.mjs`.

**Bước 4:** kiểm tra câu trả lời dùng được cả hai nguồn dữ liệu. Để thấy rõ công cụ nào thực thi, có thể bổ sung `console.log` trong từng `run`.

Khóa học minh họa `runner.untilDone()`; ví dụ bổ sung ở đây dùng cách `await toolRunner(...)` theo trang SDK đã đối chiếu. Cách sử dụng phụ thuộc phiên bản SDK bạn cài. [Tool runner của SDK](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-runner).

### Khi nào giữ vòng lặp tự viết?

Khi cần kiểm tra từng tool call trước khi chạy, thêm bước người duyệt hoặc ghi nhật ký theo quy tắc riêng, vòng lặp của bài 4 giúp bạn thấy và điều khiển rõ từng bước. Tool runner hữu ích khi phần lặp lặp lại nhiều và quy trình cho phép tự thực thi các tool đã cấp.

**Tự kiểm tra:** nếu thêm tool thứ ba, bạn cần khai báo đúng công cụ và nối nó với phần thực thi. Viết một cái tên vào prompt chưa đủ.

<a id="bai-6"></a>
## Bài 6 — Thinking: dành thêm công sức cho suy luận

[Bài gốc](https://anthropic.skilljar.com/claude-platform-101/486256) · [Video](https://www.youtube.com/watch?v=4SunBsMGRwA)

### Hiểu bài

Một số câu hỏi cần cân nhắc nhiều điều kiện trước khi trả lời. Thinking cho model khả năng dành thêm quá trình tính toán cho các bài toán như debug, logic nhiều bước hoặc so sánh phương án.

Ví dụ, “gắn nhãn email này” thường đơn giản. Nhưng “chọn hai điểm dừng trong chuyến đi, vừa tránh mưa vừa giới hạn thời gian lái xe” cần tổng hợp và cân nhắc nhiều yếu tố.

Trong bài, **adaptive thinking** để model quyết định khi nào cần suy nghĩ và mức độ bao nhiêu. `output_config.effort` định hướng mức công sức. Các mức được trình bày là `low`, `medium`, `high`, `xhigh`, `max`; `high` là mặc định trong ví dụ Opus 4.7 của khóa học.

### Theo demo và thao tác

Mốc video: [00:27 — adaptive thinking](https://www.youtube.com/watch?v=4SunBsMGRwA&t=27s), [01:07 — chuyến đi San Francisco](https://www.youtube.com/watch?v=4SunBsMGRwA&t=67s), [01:45 — ứng dụng review kỹ](https://www.youtube.com/watch?v=4SunBsMGRwA&t=105s).

1. Dùng một model hỗ trợ cấu hình thinking muốn thử.
2. Giữ weather tool và vòng lặp đã học.
3. Đổi yêu cầu thành lên kế hoạch hai điểm dừng từ San Francisco.
4. Thêm cấu hình `thinking={"type": "adaptive"}`.
5. Đặt `effort` **bên trong** `output_config`.
6. Chọn `max_tokens` đủ chỗ cho tác vụ, thay vì chỉ đủ một câu trả lời ngắn.
7. Chạy và quan sát các block trả về, tool call và kết quả cuối.
8. Nếu có `tool_use`, thực thi tool và tiếp tục vòng lặp; một request có tool chưa phải toàn bộ agent chạy xong.

Phần cấu hình cốt lõi trong Python:

```python
reply = client.messages.create(
    model=os.environ["ANTHROPIC_MODEL"],
    max_tokens=16000,
    thinking={"type": "adaptive"},
    output_config={"effort": "high"},
    tools=tools,
    messages=history,
)
```

Đây là đoạn thay thế lời gọi bên trong vòng lặp bài 4. Cần chọn model tương thích; không áp dụng nguyên cấu hình này cho mọi model.

### Hiểu đúng về phần suy luận hiển thị

Video nói rằng có thể nhìn thấy reasoning bên cạnh câu trả lời. Khi triển khai, cần phân biệt **phần thinking được API cho hiển thị** với toàn bộ quá trình nội bộ. Tài liệu chính thức hiện mô tả chế độ trả bản tóm tắt hoặc bỏ phần thinking hiển thị, tùy model và cấu hình; không nên hứa UI sẽ luôn có đầy đủ suy luận. [Thinking](https://platform.claude.com/docs/en/build-with-claude/thinking).

`effort` không phải số token cam kết cố định. Mức được hỗ trợ và hành vi mặc định thay đổi theo model. [Steering thinking](https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking).

### Thực hành mở rộng: kiểm tra thinking có đáng dùng không

1. Chọn một bài toán có đáp án hoặc tiêu chí đánh giá rõ.
2. Chạy với cấu hình tiết kiệm công sức phù hợp model.
3. Chạy lại với effort cao hơn, giữ nguyên đầu vào.
4. So độ đúng, mức tuân thủ điều kiện, thời gian và token.
5. Chỉ tăng effort mặc định nếu kết quả cho thấy lợi ích.

Nếu cần kế hoạch chuyến đi thật, weather tool chưa đủ để biết thời gian chạy xe hiện tại. Bạn phải cung cấp thời gian từ dữ liệu đáng tin hoặc thêm tool tuyến đường. Thinking không tự cung cấp dữ liệu còn thiếu.

Trong demo sản phẩm, tùy chọn “Thorough review” bật phân tích kỹ để phát hiện mâu thuẫn giữa các phần báo cáo, chẳng hạn tải trọng gió ở một mục không khớp đặc tả vật liệu ở mục khác.

**Tự kiểm tra:** thinking giúp xử lý dữ liệu tốt hơn; tool giúp lấy dữ liệu hoặc làm hành động. Hai khả năng này thường cần phối hợp.

<a id="bai-7"></a>
## Bài 7 — Công cụ có sẵn

[Bài gốc](https://anthropic.skilljar.com/claude-platform-101/486258) · [Video](https://www.youtube.com/watch?v=pm8iwdSIs3M)

### Hiểu bài

Bạn có thể tự xây tool, nhưng các khả năng phổ biến đã có công cụ tích hợp. Điều quan trọng là biết **công cụ chạy ở đâu và ai thực thi**.

| Nhóm | Nơi chạy | Ví dụ trong bài | Phần việc của bạn |
|---|---|---|---|
| Server tools | Hạ tầng Anthropic | Web search, web fetch, code execution | Khai báo công cụ, gửi yêu cầu, đọc kết quả |
| Client tools | Môi trường do ứng dụng của bạn cung cấp | Memory, bash | Cấp nơi chạy hoặc nơi lưu, nối phần thực thi |
| Custom tools | Hệ thống của bạn hoặc dịch vụ bạn gọi | Tra tồn kho, đọc phiếu hỗ trợ | Tự định nghĩa và triển khai hàm |

**Web search** tìm trang phù hợp; **web fetch** lấy nội dung từ URL đã biết; **code execution** chạy mã trong sandbox. Ba việc này khác nhau dù có thể phối hợp trong cùng tác vụ.

### Theo demo: hai lời gọi riêng

Mốc video: [00:42 — hai request](https://www.youtube.com/watch?v=pm8iwdSIs3M&t=42s), [01:14 — kết quả search](https://www.youtube.com/watch?v=pm8iwdSIs3M&t=74s), [01:24 — kết quả code execution](https://www.youtube.com/watch?v=pm8iwdSIs3M&t=84s).

**Lượt A — Web search**

1. Tạo một request có khai báo web search trong `tools`.
2. Hỏi về thông tin mới, trong bài là lần phát hành model gần nhất.
3. Gửi request; Anthropic thực thi phần tìm kiếm trên máy chủ.
4. Đọc `server_tool_use` để biết công cụ đã được yêu cầu.
5. Đọc text blocks và thông tin trích dẫn đi kèm câu trả lời.

**Lượt B — Code execution**

1. Tạo request khác, bật code execution.
2. Yêu cầu tính trung bình và độ lệch chuẩn của dãy 1 đến 10.
3. Claude tạo và chạy mã trong sandbox.
4. Kiểm tra các block kết quả thực thi, stdout nếu được trả về, và câu trả lời cuối.

Trong demo, bạn không viết một vòng lặp riêng để tự thực thi các server tools này. Với sản phẩm thật, vẫn cần xử lý lý do dừng và lỗi theo API thay vì mặc định mọi request đều kết thúc trọn vẹn.

### Cấu hình minh họa từ bài học

Khóa học sử dụng các phiên bản tool dưới đây; phải đối chiếu khả năng hỗ trợ của model và SDK trước khi chạy:

```python
search_tools = [
    {"type": "web_search_20260209", "name": "web_search"}
]
execution_tools = [
    {"type": "code_execution_20260120", "name": "code_execution"}
]
```

Đưa một trong hai mảng vào `tools` của `messages.create`. Không cần viết hàm `run_tool` ở máy của bạn cho hai công cụ phía máy chủ này.

Ví dụ phần đọc phản hồi:

```python
for item in reply.content:
    if item.type == "text":
        print(item.text)
    else:
        # Trong buổi học, xem cấu trúc các block khác để hiểu API.
        print(item.model_dump())
```

Tên block kết quả và cấu trúc bên trong phụ thuộc phiên bản tool. Ví dụ của khóa học kiểm tra `bash_code_execution_tool_result`; không nên dùng một thuộc tính stdout cho mọi loại kết quả.

### Thực hành mở rộng và kết quả mong đợi

Với dãy `1, 2, ..., 10`:

- Trung bình là **5,5**.
- Độ lệch chuẩn tổng thể xấp xỉ **2,8723**.
- Độ lệch chuẩn mẫu xấp xỉ **3,0277**.

Prompt tốt hơn là: “Dùng code execution tính mean, population standard deviation và sample standard deviation của dãy 1 đến 10. Ghi rõ công thức hoặc tên hàm dùng.” Như vậy bạn tránh sự mơ hồ của chữ “độ lệch chuẩn”. Các con số này là mốc toán học để tự kiểm tra, không phải kết quả API đã chạy trong phiên biên soạn.

Ở ví dụ fact-check, hãy kiểm tra nguồn của từng phát biểu thay vì chỉ nhìn thấy đường dẫn rồi kết luận đúng. Và câu “không phải tự xây sandbox” trong video không đồng nghĩa dịch vụ không tính phí.

**Tự kiểm tra:** nếu dùng bash client tool, nơi chạy lệnh vẫn cần do bạn hoặc runtime của bạn cung cấp. Bật tool không biến máy tính cá nhân thành một sandbox do Anthropic tự quản lý.

<a id="bai-8"></a>
## Bài 8 — Skills: đóng gói quy trình làm việc

[Bài gốc](https://anthropic.skilljar.com/claude-platform-101/486259) · [Video](https://www.youtube.com/watch?v=3fGaS8mcD9Q)

### Hiểu bài

Skill là gói hướng dẫn để Claude thực hiện một loại việc theo cách thống nhất. Gói thường có `SKILL.md`, có thể kèm script và tài nguyên. Ví dụ: quy trình viết báo cáo ngày, checklist review hoặc mẫu release notes.

Một công ty có thể yêu cầu mọi báo cáo ngày gồm “Đã xong”, “Đang làm”, “Vướng mắc” theo đúng thứ tự. Thay vì lặp lại cả quy trình trong mỗi prompt, bạn đóng gói nó thành skill rồi đính kèm cho các lần sử dụng.

| Câu hỏi | Khả năng phù hợp |
|---|---|
| Lấy công việc của dự án từ đâu? | Tool hoặc MCP |
| Viết báo cáo theo bố cục nào? | Skill |
| Tính tổng giờ công thế nào? | Có thể dùng script trong skill với môi trường thực thi |

Skills nạp theo nhu cầu: trước tiên là tên và mô tả để agent chọn; phần hướng dẫn đầy đủ và tài nguyên liên quan được đọc khi cần. Đây là lý do không nên nhồi mọi tài liệu dài vào phần mô tả ngắn.

### Theo demo: tạo báo cáo trạng thái

Mốc video: [00:35 — skill và tool](https://www.youtube.com/watch?v=3fGaS8mcD9Q&t=35s), [01:11 — upload](https://www.youtube.com/watch?v=3fGaS8mcD9Q&t=71s), [01:37 — cấu hình request](https://www.youtube.com/watch?v=3fGaS8mcD9Q&t=97s), [02:05 — đọc báo cáo](https://www.youtube.com/watch?v=3fGaS8mcD9Q&t=125s).

1. Chuẩn bị một thư mục chứa skill và các quy tắc báo cáo.
2. Upload vào workspace qua giao diện Platform hoặc API.
3. Lưu `skill.id` được trả về.
4. Chuẩn bị nhật ký hoạt động của ngày cần báo cáo.
5. Gọi endpoint beta như trong bài và đính kèm skill bằng `container.skills`.
6. Bật code execution theo cấu hình ví dụ của bài học.
7. Gửi nhật ký như dữ liệu đầu vào.
8. Đối chiếu kết quả với bố cục và quy tắc trong skill.

### Thực hành mở rộng: viết nội dung skill mẫu

Tạo thư mục `status-report-skill`, bên trong có `SKILL.md`. Đây là ví dụ giảng dạy, chưa upload hay cài vào tài khoản:

````markdown
---
name: daily-status-report
description: Viết báo cáo ngày bằng tiếng Việt từ nhật ký công việc được cung cấp.
---

# Quy trình báo cáo ngày

1. Đọc toàn bộ nhật ký đầu vào.
2. Phân loại thành Đã xong, Đang làm và Vướng mắc.
3. Viết đúng ba mục theo thứ tự trên, mỗi mục dùng gạch đầu dòng.
4. Mỗi gạch nêu việc, kết quả hoặc bước kế tiếp nếu dữ liệu có cung cấp.
5. Không tự đặt tên người phụ trách, thời hạn hay kết quả chưa có trong nhật ký.
6. Nếu không có vướng mắc, viết: Chưa ghi nhận vướng mắc trong nhật ký.
7. Dùng câu ngắn, rõ ràng, bằng tiếng Việt.
````

Chuẩn bị dữ liệu thử:

```text
09:00 Hoàn tất sửa lỗi đăng nhập, đã kiểm tra lại trên staging.
11:00 Đang viết hướng dẫn onboarding.
15:00 Chưa kiểm thử thanh toán vì chưa có tài khoản sandbox.
```

Kết quả phù hợp phải đặt lỗi đăng nhập vào “Đã xong”, onboarding vào “Đang làm”, thiếu tài khoản sandbox vào “Vướng mắc”. Nếu báo cáo tự ghi “Minh sẽ cấp tài khoản ngày mai” thì nó đã thêm thông tin không có trong dữ liệu.

### Cách đính kèm trong API

Phần cốt lõi của ví dụ trong khóa học:

```python
# skill_id là ID trả về sau khi upload thành công.
container = {
    "skills": [{
        "type": "custom",
        "skill_id": skill_id,
        "version": "latest",
    }]
}
```

Đưa `container` vào `client.beta.messages.create`. Bài gốc kèm:

```python
betas = ["skills-2025-10-02", "code-execution-2025-08-25"]
tools = [{"type": "code_execution_20250825", "name": "code_execution"}]
```

Các biến trên minh họa cấu hình của bài học, chưa phải script độc lập. Bài gốc gọi `client.beta.skills.create(..., files=files_from_dir(...))`, nhưng không giải thích phần import helper và toàn bộ chuẩn upload; cần làm theo tài liệu Skills API đúng SDK để chuẩn bị `files`. [Hướng dẫn dùng Skills với API](https://platform.claude.com/docs/en/build-with-claude/skills-guide).

### Kiểm tra skill có tác dụng

1. Giữ nguyên nhật ký, thay quy tắc bố cục trong skill rồi tạo phiên bản mới.
2. Gọi lại và quan sát cấu trúc đầu ra.
3. Thử nhật ký không có vướng mắc.
4. Thử nhật ký thiếu thời hạn để xem báo cáo có tự thêm không.
5. Khi cần tái lập kết quả vận hành, chọn phiên bản cố định thay vì để `latest` luôn thay đổi.

Skill dạy quy trình; chất lượng vẫn cần được đánh giá. Đính kèm skill không bảo đảm mọi đầu ra tự động tuân thủ tuyệt đối.

**Tự kiểm tra:** nếu cần “lấy task trong Linear rồi viết báo cáo theo mẫu”, bạn cần phần kết nối lấy task và phần hướng dẫn viết báo cáo. Một file Markdown không tự cấp quyền truy cập Linear.

<a id="bai-9"></a>
## Bài 9 — MCP: kết nối theo một chuẩn chung

[Bài gốc](https://anthropic.skilljar.com/claude-platform-101/486260) · [Video](https://www.youtube.com/watch?v=hftmYd97LBw)

### Hiểu bài

Nếu agent cần Asana, Slack và lịch, bạn có thể tự viết ba bộ tích hợp. Nhưng mỗi lần API của một dịch vụ thay đổi, bạn lại cần cập nhật phần tương ứng.

**Model Context Protocol — MCP** là giao thức chuẩn để ứng dụng AI giao tiếp với server cung cấp công cụ và các khả năng liên quan. Khi một nhà cung cấp duy trì MCP server của họ, bạn có thể dùng cùng kiểu kết nối thay vì tự viết lại tất cả lớp bọc API.

Ví dụ gần gũi là ổ cắm chuẩn: thiết bị có chức năng khác nhau, nhưng cách kết nối thống nhất giúp việc ghép chúng vào hệ thống dễ hơn.

Khóa học dùng cách nhớ: tools cho dữ liệu của bạn, skills cho quy trình, MCP cho dịch vụ bên ngoài. Đây là cách nhập môn. **MCP cũng có thể dùng cho hệ thống nội bộ**, và MCP server có thể do bạn, nhà cung cấp hoặc bên thứ ba vận hành. Cần xác định ai thật sự chịu trách nhiệm bảo trì server.

### Theo demo: kết nối Linear

Mốc video: [00:13 — chi phí bảo trì tích hợp](https://www.youtube.com/watch?v=hftmYd97LBw&t=13s), [01:31 — cấu hình Linear](https://www.youtube.com/watch?v=hftmYd97LBw&t=91s), [02:45 — giới hạn tool](https://www.youtube.com/watch?v=hftmYd97LBw&t=165s).

1. Lấy endpoint MCP và cách xác thực từ dịch vụ muốn dùng.
2. Chuẩn bị thông tin xác thực hợp lệ, lưu ngoài mã nguồn.
3. Trong `mcp_servers`, khai báo loại kết nối URL, endpoint, tên tham chiếu và token nếu endpoint yêu cầu.
4. Trong `tools`, thêm `mcp_toolset` trỏ đến đúng tên server.
5. Bổ sung beta header của API theo phiên bản trong bài.
6. Hỏi Claude các công cụ sẵn có hoặc giao một yêu cầu chỉ đọc rõ ràng.
7. Quan sát các công cụ được phát hiện từ server. Bạn không cần tự viết JSON Schema cho từng công cụ của server đó.

### Cấu hình minh họa từ bài học

Đoạn dưới dành cho Python ở môi trường đã có `client`, `os` và khóa API. Nó chưa chạy trong quá trình biên soạn:

```python
reply = client.beta.messages.create(
    model=os.environ["ANTHROPIC_MODEL"],
    max_tokens=1000,
    betas=["mcp-client-2025-11-20"],
    mcp_servers=[{
        "type": "url",
        "url": "https://mcp.linear.app/mcp",
        "name": "linear",
        "authorization_token": os.environ["LINEAR_MCP_TOKEN"],
    }],
    tools=[{
        "type": "mcp_toolset",
        "mcp_server_name": "linear",
    }],
    messages=[{
        "role": "user",
        "content": "Liệt kê các công cụ Linear đang có. Chưa tạo hay sửa dữ liệu.",
    }],
)
```

`name` và `mcp_server_name` đều là `linear`; nếu không khớp, toolset không tham chiếu đúng kết nối.

`LINEAR_MCP_TOKEN` là thông tin xác thực MCP phù hợp endpoint. Không mặc định một API key bất kỳ của Linear sẽ dùng thay được; hãy dùng luồng xác thực mà dịch vụ hỗ trợ.

### Chỉ cho dùng những tool cần thiết

Trong ví dụ Slack của bài, cấu hình tắt tất cả mặc định rồi bật hai tool:

```python
limited_toolset = {
    "type": "mcp_toolset",
    "mcp_server_name": "slack",
    "default_config": {"enabled": False},
    "configs": {
        "search_messages": {"enabled": True},
        "list_channels": {"enabled": True},
    },
}
```

Tên tool phải đúng với server bạn kết nối. Ví dụ trên không tự tạo kết nối Slack; bạn còn cần mục `mcp_servers` có tên `slack` và thông tin xác thực tương ứng.

### Thực hành mở rộng

1. Kết nối một server thử nghiệm hoặc workspace bạn được phép sử dụng.
2. Xem danh sách tool thực tế, phân biệt tool đọc và tool ghi.
3. Chỉ bật các tool đọc cần cho bài toán.
4. Hỏi một câu cụ thể, chẳng hạn “Tóm tắt các task được giao cho tôi tuần này”.
5. Kiểm tra task được trả về có thuộc đúng người, workspace và khoảng thời gian không.
6. So sánh với việc tự viết một custom tool để thấy phần nào đã được server MCP đảm nhiệm.

MCP giúp chuẩn hóa kết nối, nhưng không loại bỏ yêu cầu quản lý quyền, xử lý hết hạn token hoặc theo dõi thay đổi tương thích.

**Tự kiểm tra:** viết skill “Hãy tìm Slack” không làm xuất hiện khả năng tìm Slack. Bạn cần một kết nối và tool có quyền truy cập thực tế.

<a id="bai-10"></a>
## Bài 10 — Quản lý context

[Bài gốc](https://anthropic.skilljar.com/claude-platform-101/486261) · [Video](https://www.youtube.com/watch?v=jZQ6b_vVHRc)

### Hiểu bài

Context là những thông tin model được cung cấp trong một lượt: hướng dẫn hệ thống, lịch sử hội thoại, định nghĩa tool, kết quả tool và tài liệu liên quan. Thinking cũng có quy tắc tính và giữ context riêng tùy model, API và lượt hội thoại.

Hãy hình dung context như bàn làm việc. Một chiếc bàn lớn vẫn có thể chật nếu bạn để toàn bộ hồ sơ của công ty lên đó. Cách làm hiệu quả là đặt đúng tài liệu đang cần lên bàn.

Khóa học nhắc đến cửa sổ một triệu token như một ví dụ về dung lượng lớn. Không nên hiểu mọi model hay tài khoản đều có cùng giới hạn. Khi thiết kế, phải xem giới hạn của model cụ thể.

### Bốn cách quản lý context

| Cách | Giải quyết chuyện gì? | Hình dung |
|---|---|---|
| Just-in-time | Tránh nạp thừa tài liệu | Cần điều khoản nào mới lấy điều khoản đó |
| Compaction | Hội thoại dài chiếm quá nhiều chỗ | Tóm tắt phần làm việc trước |
| Prompt caching | Phần đầu vào cố định bị xử lý lặp lại | Tái sử dụng prefix ổn định |
| Memory | Thông tin cần tồn tại qua các phiên | Sổ ghi chép lưu bên ngoài cuộc hội thoại |

Mốc video: [00:47 — just-in-time](https://www.youtube.com/watch?v=jZQ6b_vVHRc&t=47s), [01:05 — compaction](https://www.youtube.com/watch?v=jZQ6b_vVHRc&t=65s), [01:21 — caching](https://www.youtube.com/watch?v=jZQ6b_vVHRc&t=81s), [01:38 — memory](https://www.youtube.com/watch?v=jZQ6b_vVHRc&t=98s).

### Cách 1 — Nạp đúng lúc

Theo ví dụ báo cáo tuân thủ:

1. Gửi nhiệm vụ và phần báo cáo cần xử lý.
2. Cung cấp tool tra điều khoản theo mã hoặc tìm kiếm.
3. Khi agent cần điều khoản, nó gọi tool.
4. Trả đúng đoạn liên quan kèm định danh nguồn.
5. Chỉ bổ sung đoạn khác khi công việc cần.

Đây là lựa chọn thiết kế, không phải một công tắc API tên “just-in-time”. Với kho tài liệu, bạn có thể trả danh sách kết quả ngắn trước rồi cho agent mở đúng tài liệu cần đọc.

### Cách 2 — Compaction

Khi cuộc hội thoại dài, compaction thay phần lịch sử cũ bằng bản tóm tắt để tiếp tục làm việc.

Trình tự thao tác:

1. Bật chiến lược compaction tương thích model và API.
2. Tiếp tục quản lý lịch sử hội thoại của ứng dụng.
3. Khi đến ngưỡng, API sinh block tóm tắt.
4. Giữ block này khi bổ sung phản hồi vào lịch sử cho lượt kế tiếp.
5. Kiểm tra bản tóm tắt còn giữ mục tiêu, quyết định, dữ liệu quan trọng và việc chưa xong.

**Chỉnh lý cú pháp:** bài học rút gọn thành `{"type": "compact"}` trong lời gọi thường. Tài liệu chính thức đã đối chiếu dùng endpoint beta, header `compact-2026-01-12` và chiến lược `compact_20260112`:

```python
reply = client.beta.messages.create(
    betas=["compact-2026-01-12"],
    model=os.environ["ANTHROPIC_MODEL"],
    max_tokens=4096,
    messages=history,
    context_management={
        "edits": [{"type": "compact_20260112"}]
    },
)
history.append({"role": "assistant", "content": reply.content})
```

Chọn model được tính năng này hỗ trợ. Tóm tắt có thể làm mất chi tiết; các dữ kiện cần kiểm chứng nên có nguồn để lấy lại. [Tài liệu Compaction](https://platform.claude.com/docs/en/build-with-claude/compaction).

### Cách 3 — Prompt caching

Trong bài, một system prompt 4.000 token được dùng 100 lần mỗi giờ là ví dụ về phần lặp lại có thể tối ưu. Caching dùng cho các phần ổn định như hướng dẫn, tool definitions hoặc tài liệu dài ít thay đổi.

Các bước áp dụng:

1. Xác định phần chung giữa nhiều request.
2. Sắp phần ổn định trước phần thay đổi theo người dùng hoặc nhiệm vụ.
3. Đánh dấu điểm cache theo API và SDK đang dùng.
4. Gửi nhiều request có cùng prefix.
5. Quan sát thông tin cache trong usage và chi phí thực tế.

Caching không phải lưu sẵn một câu trả lời để trả cho mọi câu hỏi. Nó cũng không làm tài liệu chiếm ít token context hơn; mục tiêu chính ở đây là giảm xử lý lặp và chi phí theo cơ chế cache.

### Cách 4 — Memory

Memory lưu những điều cần giữ qua các phiên: sở thích người dùng, ghi chú công việc hoặc điều đã quyết định tuần trước.

Theo bài học:

1. Bạn cung cấp backend lưu trữ phía client: file, database hoặc kho phù hợp.
2. Claude đọc và ghi thông qua memory tool.
3. Khi bắt đầu việc mới, agent lấy lại ghi chú có liên quan.
4. Khi kết thúc, agent lưu các kết quả cần dùng về sau.

Ví dụ ghi chú tốt: “Báo cáo tuần dùng VND; dữ liệu tuần trước lưu ngày 08/10; hai nhà cung cấp còn thiếu bảng giá.” Ghi chú này phải có ngày và phạm vi để lần sau không bị xem là thông tin hiện tại vĩnh viễn.

Nếu bạn tự làm memory bằng custom tool, cần tự xây cả chức năng lưu, lấy và hướng dẫn sử dụng. Không giả định model luôn nhớ mọi cuộc hội thoại ngoài những gì ứng dụng thực sự cung cấp.

### Phối hợp cả bốn

Một agent nghiên cứu giá có thể cache quy tắc báo cáo, chỉ tải các trang giá cần dùng, compact lịch sử dài trong phiên, rồi lưu chênh lệch và ngày kiểm tra vào memory cho tuần tới.

**Bài tập:** bạn có 1.000 tài liệu nhưng câu hỏi chỉ liên quan hai mục. Hãy thiết kế tool tìm kiếm trả mã tài liệu và đoạn trích trước; chỉ tải toàn văn tài liệu đã chọn. Sau đó nêu rõ dữ liệu nào cần giữ trong memory và dữ liệu nào chỉ dùng trong phiên.

**Tự kiểm tra:** caching giảm phần xử lý lặp; compaction giảm lịch sử đang chiếm chỗ; memory giữ thông tin qua phiên. Không nên dùng ba từ này thay thế nhau.

<a id="bai-11"></a>
## Bài 11 — Managed Agents là gì?

[Bài gốc](https://anthropic.skilljar.com/claude-platform-101/486263) · [Video](https://www.youtube.com/watch?v=haeslvB0zpg)

### Hiểu bài

Ở bài 4, chương trình của bạn giữ lịch sử và điều khiển vòng lặp. Với Managed Agents, bạn định nghĩa agent, chuẩn bị môi trường và khởi tạo một phiên làm việc; hạ tầng Anthropic vận hành phần vòng lặp đó.

Ví dụ một nhân viên được giao xử lý hồ sơ: bạn xác định nhiệm vụ, công cụ và nơi làm việc. Trong lúc người đó thực hiện, bạn nhận cập nhật tiến độ. Managed agent cung cấp mô hình tương tự cho phần mềm.

Bạn vẫn phải định nghĩa việc cần làm, dữ liệu được truy cập, cách đánh giá kết quả và ứng dụng nhận đầu ra. “Managed” không có nghĩa hệ thống tự hiểu hết nghiệp vụ.

### Demo 1 — Kéo thẻ Kanban để chạy công việc

Mốc video: [00:46 — bảng Kanban](https://www.youtube.com/watch?v=haeslvB0zpg&t=46s).

1. Trên ứng dụng demo, kéo thẻ “tối ưu hiệu năng website” sang cột đang làm.
2. Backend tạo một session cho công việc đó.
3. Session dùng environment đã cài Lighthouse và Puppeteer.
4. Repository được đưa vào môi trường để agent có mã nguồn cần xử lý.
5. Agent chạy audit, xem điểm và các vấn đề hiệu năng.
6. Agent sửa ảnh, CSS hoặc cách nạp script theo phát hiện.
7. Event stream đưa hoạt động về bảng Kanban trong thời gian thực.
8. Một grader có context riêng chấm theo rubric.
9. Agent đọc phản hồi và sửa tiếp khi chưa đạt.
10. Demo báo điểm Lighthouse đạt 96; một thẻ khác có thể chạy bằng session riêng.

Rubric trong video gồm điểm Lighthouse trên 90, không có tài nguyên chặn hiển thị và ảnh được lazy-load. Đây là tiêu chí demo. Khi áp dụng thật, cần viết tiêu chí phù hợp trang; chẳng hạn ảnh quan trọng ở đầu trang có thể cần cách nạp khác.

**Điều cần học:** chuyển một yêu cầu chung như “làm nhanh hơn” thành các dấu hiệu hoàn thành đo được. Việc kéo thẻ chỉ là trigger do ứng dụng demo đã lập trình, không phải khả năng mặc định của mọi bảng Kanban.

### Demo 2 — Nghiên cứu giá định kỳ có memory

Mốc video: [01:55 — nghiên cứu giá](https://www.youtube.com/watch?v=haeslvB0zpg&t=115s).

1. Khởi chạy báo cáo tuần trong ứng dụng demo.
2. Agent đọc kết quả tuần trước từ memory.
3. Tìm các trang giá và thông tin gói dịch vụ hiện tại.
4. Dùng Python phân tích chi phí trong sandbox.
5. Áp dụng skill để tạo bảng tính và bản tóm tắt điều hành.
6. Trong quy trình demo đã kết nối MCP, agent chia sẻ đường dẫn qua Slack và tạo task xem xét trong Asana.
7. Lưu các thay đổi có ý nghĩa vào memory.

Tuần sau, báo cáo có thể nói “giá giảm so với tuần trước”, vì có dữ liệu đối chiếu. Nếu chỉ tìm web mới mà không giữ lịch sử, agent khó phân biệt thay đổi thật với tình trạng cũ.

Con số 15% trong bài là tình huống minh họa của demo, không phải thông tin giá hiện tại của một nhà cung cấp cụ thể.

### Demo 3 — Phối hợp nhiều agent xử lý sự cố

Mốc video: [02:47 — incident response](https://www.youtube.com/watch?v=haeslvB0zpg&t=167s).

1. Hệ thống giám sát phát cảnh báo.
2. Backend chuyển dữ liệu cảnh báo vào session.
3. Agent điều phối phân việc cho ba chuyên gia: chẩn đoán, log và truyền thông.
4. Mỗi chuyên gia có context riêng; các agent có thể dùng chung hệ thống file của session.
5. Các chuyên gia trả kết quả; agent điều phối tổng hợp.
6. Agent tra memory để xem sự cố tương tự trước đây.
7. Chính sách quyền yêu cầu duyệt bản nháp trước khi gửi cập nhật.
8. Người dùng xem và chấp thuận trong ứng dụng demo rồi thông điệp mới được gửi.

Chia nhiều agent có ích khi có các phần việc tương đối độc lập. Nó cũng đòi hỏi xác định ai làm gì và ai tổng hợp; không phải cứ tăng số agent là kết quả sẽ tốt hơn.

### Các thành phần cần nhớ

| Thành phần | Ý nghĩa |
|---|---|
| Agent | Định nghĩa model, vai trò và công cụ |
| Environment | Môi trường chạy, gói phần mềm, thiết lập mạng |
| Session | Một phiên công việc cụ thể |
| Tools và MCP | Khả năng thao tác và kết nối dữ liệu |
| Memory | Ghi chú tồn tại qua phiên |
| Outcomes | Tiêu chí và cơ chế đánh giá kết quả |
| Multi-agent coordination | Phân việc và phối hợp các agent |

### Thực hành thiết kế trước khi code

Chọn tác vụ “chuẩn hóa 50 file báo cáo”. Viết ra: thư mục đầu vào, thư mục đầu ra, quy tắc tên file, cách xử lý file không xác định, và báo cáo cuối phải có gì. Sau đó quyết định dùng một agent hay cần nhiều phần việc độc lập.

**Tự kiểm tra:** agent định nghĩa **ai làm và được dùng gì**; environment xác định **làm ở đâu**; session xác định **lần làm việc nào**. Ba đối tượng này không thay thế nhau.

<a id="bai-12"></a>
## Bài 12 — Tạo managed agent đầu tiên

[Bài gốc](https://anthropic.skilljar.com/claude-platform-101/486264) · [Video](https://www.youtube.com/watch?v=1Rl3gZrlQJo)

### Hiểu bài

Bài này thực hiện công việc nhỏ để thấy toàn bộ API: tạo một file trong thư mục tạm, đếm số dòng và báo lại. Điểm mới là bạn gửi và đọc **events**, thay vì tự giữ vòng lặp Messages API.

```text
Tạo Agent → Tạo Environment → Tạo Session
                                  ↓
                          Mở event stream
                                  ↓
                         Gửi user.message
                                  ↓
                 Theo dõi hoạt động và kết quả
```

### Theo demo từng thao tác

**Bước 1 — Tạo agent.** [01:39 trong video](https://www.youtube.com/watch?v=1Rl3gZrlQJo&t=99s).

Gọi `client.beta.agents.create` với tên, model, system prompt và toolset. `agent_toolset_20260401` là nhóm công cụ tích hợp dùng cho thao tác file, bash và web trong ví dụ.

Kết quả cần giữ là ID agent. Agent có thể được dùng cho nhiều session, nên không cần tạo lại mỗi lần gửi một yêu cầu mới.

**Bước 2 — Tạo environment.** [01:47 trong video](https://www.youtube.com/watch?v=1Rl3gZrlQJo&t=107s).

Gọi `client.beta.environments.create`. Trong video, môi trường là cloud với mạng `unrestricted`. File agent tạo sẽ nằm trong môi trường làm việc này, không tự xuất hiện trên ổ đĩa Windows của bạn.

**Bước 3 — Tạo session.** [01:56 trong video](https://www.youtube.com/watch?v=1Rl3gZrlQJo&t=116s).

Gắn một agent với một environment và đặt tiêu đề để dễ theo dõi. Lưu session ID; đó là định danh của phiên bạn sẽ gửi việc vào.

**Bước 4 — Mở stream rồi gửi nhiệm vụ.** [02:03 trong video](https://www.youtube.com/watch?v=1Rl3gZrlQJo&t=123s).

Mở stream trước khi gửi `user.message`. Theo hành vi được mô tả trong bài, stream chỉ nhận các event phát sinh sau khi mở, nên đảo thứ tự có thể làm bạn bỏ lỡ phần đầu hoạt động.

**Bước 5 — Đọc event.** [02:21 trong video](https://www.youtube.com/watch?v=1Rl3gZrlQJo&t=141s).

| Event trong demo | Dùng để làm gì? |
|---|---|
| `agent.message` | Hiển thị văn bản Claude trả về |
| `agent.tool_use` | Theo dõi công cụ agent chọn |
| `session.status_idle` | Biết session đã dừng và chờ tiếp |

**Chỉnh lý khi vận hành:** `idle` không luôn có nghĩa nhiệm vụ thành công. Cần đọc `stop_reason`: có thể là kết thúc lượt, đang chờ xử lý tool/duyệt hoặc đạt giới hạn ngân sách. Khi kết nối lại, cần dùng lịch sử event để bù phần đã bỏ lỡ. [Session event stream](https://platform.claude.com/docs/en/managed-agents/events-and-streaming).

### Thực hành mở rộng: bản ghép thành một file

Ví dụ dưới dùng cấu trúc demo, đồng thời đổi tham chiếu agent trong session thành đối tượng có ID và version theo hướng dẫn di chuyển hiện hành. Nó dùng mạng giới hạn vì bài đếm dòng không cần truy cập website. [Migration](https://platform.claude.com/docs/en/managed-agents/migration), [Cookbook về môi trường Managed Agents](https://platform.claude.com/cookbook/managed-agents-cma-iterate-fix-failing-tests).

**Chuẩn bị:** dùng môi trường Python ở bài 4 và SDK có hỗ trợ các API beta này. Nếu cần cập nhật SDK, chạy:

```powershell
.\.venv\Scripts\python.exe -m pip install --upgrade anthropic
```

Tạo `managed_lines.py`:

```python
import os

import anthropic
from dotenv import load_dotenv

load_dotenv(".env.local")
client = anthropic.Anthropic()

# 1. Agent: định nghĩa có thể tái sử dụng.
agent = client.beta.agents.create(
    name="Course Line Counter",
    model=os.environ["ANTHROPIC_MODEL"],
    system="Hoàn thành tác vụ file nhỏ. Kiểm tra kết quả và báo cáo bằng tiếng Việt.",
    tools=[{
        "type": "agent_toolset_20260401",
        "default_config": {"enabled": True},
    }],
)

# 2. Environment: tác vụ này chỉ cần thao tác file trong sandbox.
environment = client.beta.environments.create(
    name="course-line-count-env",
    config={
        "type": "cloud",
        "networking": {"type": "limited"},
    },
)

# 3. Session: một lần giao việc.
session = client.beta.sessions.create(
    agent={"type": "agent", "id": agent.id, "version": agent.version},
    environment_id=environment.id,
    title="Bài học đếm ba dòng",
)
print("Agent:", agent.id)
print("Environment:", environment.id)
print("Session:", session.id)

# 4. Mở stream trước, gửi việc sau.
with client.beta.sessions.events.stream(session.id) as stream:
    client.beta.sessions.events.send(
        session.id,
        events=[{
            "type": "user.message",
            "content": [{
                "type": "text",
                "text": (
                    "Tạo /tmp/course-lines.txt có đúng ba dòng: "
                    "alpha, beta, gamma; mỗi dòng kết thúc bằng newline. "
                    "Dùng công cụ để đếm dòng. Báo lại đường dẫn, số dòng "
                    "và cách đã kiểm tra. Không cần truy cập mạng."
                ),
            }],
        }],
    )

    # 5. Theo dõi phản hồi.
    for event in stream:
        if event.type == "agent.message":
            for block in event.content:
                if block.type == "text":
                    print(block.text, flush=True)
        elif event.type == "agent.tool_use":
            print("Tool:", event.name)
        elif event.type == "session.error":
            print("Session báo lỗi:", event)
            break
        elif event.type == "session.status_idle":
            reason = getattr(event, "stop_reason", None)
            print("Session đang chờ; lý do:", reason)
            break
```

Chạy:

```powershell
.\.venv\Scripts\python.exe managed_lines.py
```

Đây là demo quan sát một lượt, chưa bao gồm xử lý tiếp mọi tình huống chờ duyệt, custom tool hay reconnect. Các endpoint beta có thể yêu cầu cấu trúc mới theo phiên bản SDK; nếu SDK báo lỗi trường dữ liệu, đối chiếu [Quickstart chính thức](https://platform.claude.com/docs/en/managed-agents/quickstart) thay vì tự đoán tên trường.

### Đọc kết quả và kiểm tra hoàn thành

1. Kiểm tra terminal có in ba ID được tạo.
2. Quan sát agent dùng tool để tạo hoặc đọc file.
3. Kết quả cuối cần nêu đúng file `/tmp/course-lines.txt` và **3 dòng**.
4. Kiểm tra agent thật sự chạy lệnh hoặc đọc file để xác nhận, thay vì chỉ lặp lại yêu cầu.
5. Đọc lý do session dừng. Nếu chờ hành động, task chưa hoàn tất.
6. Nếu cần tải file về máy, thực hiện luồng lấy artifact của session; đường dẫn trong container không phải liên kết tải tự động.

Mỗi lần chạy nguyên script này sẽ tạo đối tượng mới. Sau khi hiểu demo, tách bước tạo agent/environment khỏi bước tạo session để dùng lại các đối tượng phù hợp.

### Nên dùng cách nào?

| Tình huống | Hướng phù hợp để cân nhắc |
|---|---|
| Một lần tóm tắt đoạn văn | Messages API thông thường |
| Vài tool và muốn tự chặn từng hành động | Vòng lặp tự quản lý |
| Cần giảm phần lặp trong ứng dụng của mình | Tool runner |
| Công việc dài, thao tác file và cần session được quản lý | Managed Agents |

**Tự kiểm tra:** nếu mất kết nối trình xem tiến độ, điều đó không nhất thiết nghĩa agent đã dừng. Phân biệt trạng thái kết nối của ứng dụng với trạng thái session trên máy chủ.

<a id="bai-13"></a>
## Bài 13 — Xây dựng bằng Claude Code

[Bài gốc](https://anthropic.skilljar.com/claude-platform-101/486266) · [Video](https://www.youtube.com/watch?v=Zq_c7xMbxto)

### Hiểu bài

Claude Code là agent làm việc trong môi trường lập trình: đọc và sửa file, chạy lệnh, xem lỗi rồi sửa tiếp. Bạn có thể nhờ nó viết phần tích hợp Claude API theo những cấu trúc đã học.

Trong demo, dự án có file TypeScript gồm hai hàm chưa hoàn thiện:

- `getWeather`: nhận thành phố và trả nhiệt độ, điều kiện thời tiết.
- `run`: tạo và chạy quy trình bằng Claude SDK cùng tool runner.

Mục tiêu của bài là biết giao một yêu cầu lập trình cụ thể và kiểm tra thay đổi. Bạn vẫn cần hiểu tool, runner và kết quả để đánh giá code được sinh ra.

### Theo demo từng thao tác

Mốc video: [00:12 — hai hàm khung](https://www.youtube.com/watch?v=Zq_c7xMbxto&t=12s), [00:31 — Claude API skill](https://www.youtube.com/watch?v=Zq_c7xMbxto&t=31s), [00:52 — chạy trong dự án](https://www.youtube.com/watch?v=Zq_c7xMbxto&t=52s), [01:13 — code được tạo](https://www.youtube.com/watch?v=Zq_c7xMbxto&t=73s).

1. Mở terminal tại thư mục dự án.
2. Khởi động Claude Code bằng lệnh `claude`, giả định công cụ đã được cài và đăng nhập.
3. Dùng skill Claude API để có hướng dẫn theo SDK.
4. Gửi prompt nêu rõ file cần sửa, cấu trúc cần dùng và kết quả cuối.
5. Claude Code đọc file cùng kiểu dữ liệu, hoàn thiện hàm thời tiết và `run`.
6. Công cụ tạo khai báo tool dùng Zod, nối tool với runner.
7. Thêm điểm khởi chạy và chạy script.
8. Nếu script lỗi, Claude Code đọc thông báo và sửa lại.
9. Xem đầu ra, đọc diff và kiểm tra code có thực hiện đúng yêu cầu.

### Claude API skill và lệnh marketplace

Trong Claude Code, có thể gọi:

```text
/claude-api
```

Tài liệu chính thức mô tả skill được tích hợp sẵn và có thể tự kích hoạt khi làm việc với SDK. Nếu cần cài từ kho chính thức, hướng dẫn hiện hành dùng:

```text
/plugin marketplace add anthropics/skills
/plugin install claude-api@anthropic-agent-skills
```

Phần chữ của bài học hiển thị tên marketplace không rõ dạng đường dẫn (`AnthropicsSkills`); nên dùng cú pháp chính thức đã đối chiếu ở trên. Những lệnh này là hướng dẫn cho người học, chưa được thực thi trên máy bạn trong phiên biên soạn. [Claude API skill](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/claude-api-skill).

### Thực hành mở rộng: chuẩn bị một file khung

Trong thư mục Node ở bài 2:

```powershell
npm install zod
npm install --save-dev typescript tsx @types/node
```

Tạo `weather.ts`:

```typescript
export function getWeather(city: string): string {
  throw new Error("Chưa viết phần dữ liệu thời tiết giả lập");
}

export async function run(): Promise<void> {
  throw new Error("Chưa nối tool runner");
}
```

Sau đó mở Claude Code và gửi prompt mẫu tự biên soạn:

```text
Hoàn thiện file weather.ts.

Dùng @anthropic-ai/sdk, helper betaZodTool và Zod để tạo tool get_weather.
getWeather nhận city và trả JSON string có tên thành phố, nhiệt độ,
điều kiện thời tiết và mock: true. Dữ liệu thời tiết là giả lập.

Trong run, đọc ANTHROPIC_MODEL từ môi trường và dùng
client.beta.messages.toolRunner để hỏi nên mặc gì ở Đà Nẵng.
Đọc các text block trong phản hồi cuối và in chúng ra terminal.
Thêm lời gọi run ở cuối file và xử lý lỗi ở điểm khởi chạy.

Chạy bằng node --env-file=.env.local --import tsx weather.ts.
Báo lại các file đã sửa, lệnh đã chạy và kết quả.
```

Prompt này có ba phần mà bài học nhấn mạnh: **file** là `weather.ts`, **pattern** là Zod tool + tool runner, **end state** là script chạy và in kết quả.

### Đọc diff và kiểm tra kết quả

Nếu dự án dùng Git, xem phần thay đổi bằng `git diff -- weather.ts`. Đọc theo luồng dữ liệu:

1. `city` được kiểm tra ở schema nào?
2. Hàm nào tạo dữ liệu giả lập?
3. Tool có gọi đúng hàm đó không?
4. Model được lấy từ biến môi trường nào?
5. Runner có nhận đúng tool và câu hỏi không?
6. Script có in text blocks và báo lỗi khi thất bại không?

Sau khi chạy, câu trả lời phải nhất quán với dữ liệu giả lập. Nếu model nói đã tra thời tiết trực tiếp dù code không gọi nguồn thật, cần sửa mô tả tool hoặc prompt và kiểm tra lại.

**Tự kiểm tra:** bạn có thể giải thích đường đi từ câu hỏi → tool → hàm → kết quả → câu trả lời cuối không? Đó là cách biết mình đang kiểm soát phần tích hợp do Claude Code tạo.

<a id="quiz"></a>
## Quiz chính thức và bộ câu hỏi tự ôn

[Mở quiz của khóa học](https://anthropic.skilljar.com/claude-platform-101/486268).

### Phần đã truy cập

Quiz chính thức hiển thị **8 câu**. Tôi đã mở mục quiz và xem câu đầu, về ba tham số cơ bản của `messages.create`. Trang yêu cầu chọn đáp án trước khi chuyển câu; tôi không chọn đáp án, không nộp bài và không làm bài thay bạn. Vì vậy, tài liệu không tuyên bố đã đọc đủ 8 câu chính thức.

Các câu bên dưới **do tôi tự biên soạn**, dựa trên 13 bài đã đọc. Chúng dùng để kiểm tra hiểu bài và không phải bản sao bộ đề hay đáp án chấm chính thức.

### Câu hỏi tự ôn

**1. Bạn muốn có nút “Tóm tắt cuộc họp” trong ứng dụng. Luồng tối thiểu cần những bước nào?**

A. Chỉ đặt tên nút là Claude.  
B. Lấy transcript, gọi API với hướng dẫn, đọc phản hồi và hiển thị kết quả.  
C. Chỉ thêm transcript vào `.env.local`.

**2. Những trường cơ bản nào thuộc body của một lời gọi Messages API trong khóa học?**

A. `model`, `max_tokens`, `messages`.  
B. Chỉ `system`.  
C. API key đặt trong một tin nhắn `user`.

**3. Bạn cần phân loại hàng chục nghìn phiếu đơn giản. Bắt đầu chọn model thế nào?**

A. Chọn tầng cao nhất cho mọi phiếu.  
B. Lập eval đại diện, thử model chi phí thấp trước và tăng khi chất lượng chưa đạt.  
C. Chọn model có tên dài nhất.

**4. Với custom tool, sau khi Claude trả về `tool_use`, ai thực hiện hàm?**

A. Code hoặc runtime bạn đã triển khai cho tool.  
B. Một hàm chỉ có tên trong prompt sẽ tự chạy.  
C. Trình duyệt Skilljar tự chạy hàm.

**5. Trường nào giúp gắn kết quả với đúng tool call?**

A. Tên file script.  
B. `tool_result.tool_use_id` khớp `tool_use.id`.  
C. Bất kỳ ID nào cũng được.

**6. Khi nào đáng thử tăng effort?**

A. Khi cần phân tích nhiều bước và eval cho thấy có lợi.  
B. Mọi lần gắn nhãn đều bắt buộc dùng mức cao nhất.  
C. Khi chưa có dữ liệu thì tăng effort sẽ tự tạo dữ liệu thật.

**7. Web search server tool khác custom tool thời tiết ở điểm nào trong demo?**

A. Web search do Anthropic thực thi phía máy chủ; custom tool dùng hàm do bạn nối.  
B. Cả hai chỉ là chữ, không thể thực thi.  
C. Mọi tool đều chạy trong trình duyệt của người học.

**8. Bạn cần báo cáo luôn có ba mục theo quy định công ty. Khả năng nào đóng gói quy trình phù hợp?**

A. Skill có hướng dẫn và tài nguyên cần thiết.  
B. Đổi API key.  
C. Đổi tên model thành tên công ty.

**9. Bạn chỉ cần đọc dữ liệu từ một MCP server nhiều tool. Cách cấu hình phù hợp là gì?**

A. Bật toàn bộ tool để khỏi phải xem tên.  
B. Tắt mặc định rồi bật đúng các tool đọc cần dùng, với quyền dịch vụ tương ứng.  
C. Ghi “chỉ đọc” trong tên biến là đủ để mọi quyền ghi biến mất.

**10. Bạn cần giữ quyết định của tuần trước sang phiên tuần này. Thành phần nào giải quyết trực tiếp?**

A. Memory được lưu và truy xuất đúng cách.  
B. Chỉ tăng `max_tokens`.  
C. Prompt caching tự nhớ mọi quyết định của mọi phiên.

**11. Trong Managed Agents, agent và session khác nhau thế nào?**

A. Agent là định nghĩa tái sử dụng; session là một phiên làm việc.  
B. Hai từ luôn chỉ cùng một đối tượng.  
C. Session là API key của agent.

**12. Thứ tự nào đúng cho stream theo demo?**

A. Gửi việc, đợi rất lâu, rồi mới mở stream để chắc chắn có đủ event cũ.  
B. Mở stream trước, sau đó gửi `user.message`.  
C. Chỉ đọc stdout của máy cá nhân là thấy mọi file trong container.

**13. Prompt tốt khi nhờ Claude Code hoàn thiện tích hợp nên nêu gì?**

A. File cần sửa, pattern cần dùng và kết quả mong đợi.  
B. Chỉ nói “làm cho tốt”.  
C. Chỉ đưa tên thư viện, không cần mục tiêu.

### Đáp án và giải thích

| Câu | Đáp án | Giải thích |
|---|---|---|
| 1 | B | Tích hợp cần nối dữ liệu, lời gọi API và giao diện. |
| 2 | A | Khóa xác thực nằm ở client/môi trường; system là trường hướng dẫn bổ sung. |
| 3 | B | Bộ ví dụ thật giúp chọn mức chất lượng và chi phí phù hợp. |
| 4 | A | Khai báo tool giúp model yêu cầu; phần thực thi cần được triển khai. |
| 5 | B | ID là khóa nối yêu cầu với kết quả tương ứng. |
| 6 | A | Thinking phù hợp bài khó, không thay thế nguồn dữ liệu. |
| 7 | A | Hai nhóm tool khác nơi thực thi và phần việc bạn phải quản lý. |
| 8 | A | Skill chuẩn hóa cách làm và cấu trúc đầu ra. |
| 9 | B | Cần chọn đúng tool và quyền thực tế, không chỉ viết một lời nhắc. |
| 10 | A | Memory giữ thông tin qua phiên; cache và context có mục đích khác. |
| 11 | A | Một agent có thể phục vụ nhiều session. |
| 12 | B | Mở trước giúp tránh bỏ lỡ các event khởi đầu. |
| 13 | A | Yêu cầu cụ thể giúp agent biết sửa đâu, dùng gì và khi nào xong. |

Nếu trả lời sai một câu, quay lại bài cùng số, làm lại ví dụ rồi giải thích bằng lời của bạn. Mục tiêu là hiểu đường đi của dữ liệu, không chỉ nhớ chữ cái.

<a id="tong-hop"></a>
## Bài thực hành tổng hợp — Trợ lý báo cáo dự án

Đây là bài tập mở rộng tự biên soạn để ghép các phần của khóa học vào một sản phẩm nhỏ. Không cần triển khai mọi khả năng ngay từ đầu.

**Bài toán:** từ nhật ký công việc và danh sách task, tạo báo cáo ngày có ba mục, nêu các vướng mắc và lưu bản nháp cho người phụ trách xem.

### Giai đoạn 1 — Làm được bằng một lời gọi

1. Tạo một nhật ký giả lập gồm 10 hoạt động.
2. Gửi qua Messages API với yêu cầu chia thành ba mục.
3. Đọc text blocks và lưu kết quả vào file hoặc hiển thị trong terminal.
4. So với nhật ký gốc: có bỏ sót việc hoặc thêm thông tin không?

**Hoàn thành khi:** script chạy, có đầu ra đọc được và mọi ý trong báo cáo đều có căn cứ trong dữ liệu đầu vào.

### Giai đoạn 2 — Chọn model bằng eval

1. Chuẩn bị 20–30 nhật ký đại diện, trong đó có ngày không có vướng mắc.
2. Chấm tính đúng, đủ, đúng bố cục, độ trễ và token.
3. Thử model chi phí thấp trước rồi tăng tầng khi cần.
4. Ghi lý do chọn model cho tác vụ này.

**Hoàn thành khi:** lựa chọn có số liệu và tiêu chí, không dựa vào cảm giác từ một ví dụ.

### Giai đoạn 3 — Nối dữ liệu và quy trình

1. Tạo custom tool `list_project_tasks` trả task giả lập, rồi thay bằng nguồn được phép khi sẵn sàng.
2. Dùng vòng lặp hoặc tool runner để agent lấy task.
3. Đóng gói cấu trúc báo cáo thành skill.
4. Khi dùng một dịch vụ có MCP phù hợp, thử thay phần tích hợp bằng kết nối đó.
5. Giới hạn công cụ ở các thao tác cần cho việc tạo bản nháp.

**Hoàn thành khi:** báo cáo dùng cả nhật ký và task đúng dự án, không coi dữ liệu giả lập là dữ liệu đang hoạt động.

### Giai đoạn 4 — Kiểm soát context

1. Cache phần hướng dẫn cố định nếu API và lượng công việc phù hợp.
2. Chỉ lấy task thuộc phạm vi ngày hoặc dự án cần báo cáo.
3. Lưu những quyết định cần dùng ngày sau vào memory có ngày ghi nhận.
4. Cân nhắc compaction khi một phiên hội thoại dài gần giới hạn.

**Hoàn thành khi:** bạn chỉ được thông tin nào ở context hiện tại, thông tin nào nằm trong kho lưu trữ và thông tin nào có thể lấy lại qua tool.

### Giai đoạn 5 — Đưa việc dài sang Managed Agents

Nếu báo cáo phải xử lý nhiều file, chạy lâu và tạo artifact, thử một session managed agent. Định nghĩa agent, environment, dữ liệu đầu vào và tiêu chí đầu ra; hiển thị tiến độ từ events.

**Hoàn thành khi:** có artifact đúng yêu cầu, có bằng chứng kiểm tra và lý do session dừng được xử lý đúng. Một dòng “xong rồi” trong hội thoại chưa đủ để thay thế việc kiểm tra file.

<a id="phu-luc"></a>
## Phụ lục — Thuật ngữ, xử lý lỗi và nguồn

### Thuật ngữ thường gặp

| Thuật ngữ | Nghĩa dễ hiểu |
|---|---|
| API | Cách phần mềm gửi yêu cầu và nhận dữ liệu từ dịch vụ |
| SDK | Thư viện giúp lập trình với API |
| API key | Khóa xác thực ứng dụng khi gọi dịch vụ |
| Prompt | Nội dung hướng dẫn hoặc câu hỏi gửi cho model |
| System prompt | Hướng dẫn hành vi chung của model trong request |
| Token | Đơn vị xử lý văn bản của model; không đồng nhất với từ |
| Content block | Một khối nội dung có kiểu, ví dụ text hoặc tool use |
| Tool schema | Mô tả tên, công dụng và cấu trúc đầu vào của tool |
| Tool result | Kết quả thực thi được trả về cho model |
| Agent loop | Chu trình model yêu cầu, công cụ thực thi, model đọc kết quả |
| Tool runner | Thành phần SDK quản lý vòng lặp tool cho ứng dụng |
| Thinking / effort | Cơ chế và mức định hướng công sức suy luận |
| Sandbox | Môi trường thực thi được tách khỏi hệ thống khác |
| Skill | Gói hướng dẫn, script và tài nguyên cho một quy trình |
| MCP | Giao thức chuẩn để kết nối các khả năng của server với ứng dụng AI |
| Context window | Dung lượng thông tin model có thể xử lý trong một lần làm việc theo giới hạn model |
| Compaction | Tóm tắt context cũ để tiếp tục hội thoại dài |
| Prompt caching | Tái sử dụng phần đầu vào ổn định theo cơ chế cache |
| Memory | Thông tin lưu và truy xuất qua các phiên |
| Event stream | Luồng sự kiện tiến độ và phản hồi của session |
| Eval | Bộ ví dụ và cách đo để đánh giá chất lượng |
| Rubric | Tiêu chí cụ thể để chấm kết quả |
| Grader | Thành phần đánh giá theo tiêu chí |
| Staging | Môi trường thử gần với hệ thống chạy thật |
| Mock data | Dữ liệu giả lập dành cho demo hoặc kiểm tra |

### Các lỗi dễ gặp khi làm bài

| Hiện tượng | Điều cần kiểm tra đầu tiên |
|---|---|
| SDK báo thiếu API key | File môi trường đã được nạp chưa? Tên biến có đúng `ANTHROPIC_API_KEY` không? |
| Có `.env.local` mà Git vẫn nhận file | Đã thêm quy tắc ignore chưa? File có được theo dõi từ trước không? |
| Model không tồn tại hoặc không có quyền | Sao chép đúng model ID từ tài khoản có quyền; tên trong khóa học chỉ là ví dụ |
| Đầu ra bị cắt | Xem `stop_reason` và giới hạn `max_tokens` |
| `response.content.text` không dùng được | `content` là mảng; duyệt và chọn block `text` |
| Agent nói chưa có dữ liệu | Tool đã được khai báo và thực thi chưa? Kết quả đã gửi lại chưa? |
| API báo thiếu kết quả tool | Kiểm tra từng ID được yêu cầu có `tool_result` tương ứng |
| Claude chọn nhầm tool | Xem mô tả có phân biệt rõ công dụng, đầu vào và kết quả không |
| Tool runner không nhận một hàm thường | Xem helper và định dạng runnable tool của đúng phiên bản SDK |
| Thinking hoặc beta bị lỗi 400 | Kiểm tra model, tên trường, phiên bản feature và header |
| MCP lỗi xác thực | Kiểm tra endpoint, loại token, thời hạn và phạm vi quyền |
| MCP có kết nối nhưng không thấy tool cần | Xem toolset, tên server và cấu hình bật/tắt tool |
| Không thấy file agent vừa tạo trên máy cá nhân | File có thể nằm trong sandbox; cần lấy artifact về |
| Không thấy event đầu tiên | Stream có mở trước khi gửi việc không? Khi nối lại đã lấy lịch sử chưa? |
| Session idle nhưng chưa có kết quả | Đọc lý do dừng, yêu cầu hành động và trạng thái công việc |
| Báo cáo tuần sau dùng dữ liệu cũ | Memory phải có ngày và bước cập nhật, không thay thế kiểm tra dữ liệu hiện tại |

### Ghi chú về độ chính xác của phần thực hành

Các hướng dẫn thao tác trên Console được diễn giải theo chức năng quan sát được trong khóa học. Vị trí menu hoặc nhãn nút có thể thay đổi; tài liệu không bịa ra từng cú bấm mà nguồn không thể hiện.

Các script hoàn chỉnh trong bài 2, 4, 5 và 12 được viết để bạn tách ra thành file tương ứng. Các đoạn cấu hình khác được ghi rõ là thành phần ghép vào chương trình, không phải mọi code block đều chạy độc lập. Việc kiểm tra tài liệu không bao gồm gọi API thật, đo hóa đơn, xác thực MCP hay thực thi tác vụ trên tài khoản của bạn.

### Nguồn và cách đối chiếu

Mỗi bài ở trên có liên kết trực tiếp đến trang học và video tương ứng. Phần trình tự demo dựa trên nội dung bài, mô tả hình và phụ đề tự động; phụ đề có thể nhận sai tên SDK hoặc lệnh, nên phần code ưu tiên văn bản gốc và những chỉnh lý có nguồn chính thức.

Các tài liệu chính thức đã dùng để đối chiếu được dẫn ngay tại phần liên quan: SDK TypeScript và tool runner ở bài 5; thinking ở bài 6; cấu hình compaction ở bài 10; session events và tham chiếu agent ở bài 12; lệnh cài Claude API skill ở bài 13.

Để tự học theo nhịp phù hợp, hãy làm xong một ví dụ nhỏ, giải thích được kết quả rồi mới ghép thêm khả năng. Sau khóa này, điều quan trọng nhất là bạn nhận ra được phần nào do model quyết định, phần nào do code hoặc hạ tầng thực thi, và phần nào ứng dụng phải kiểm tra.
