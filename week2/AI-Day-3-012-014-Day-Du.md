# Ngày 3 — Xây chatbot có lịch sử hội thoại, streaming và kiến thức riêng

> Bản giảng lại đầy đủ của ba bài 012–014, thuộc tuần 2, ngày 3. Nội dung được biên soạn từ toàn bộ phụ đề tiếng Anh và đối chiếu một số khung hình chứa code trong video. Đây là bài giảng được tổ chức lại cho dễ hiểu, không phải bản dịch từng câu. Các phần ghi **Bổ sung để hiểu đúng** là giải thích thêm ngoài phần thực hành của giảng viên.

## 1. Cả ba video thực sự muốn dạy bạn điều gì?

**Mục tiêu là biến một giao diện hỏi–đáp thành trợ lý trò chuyện có thể theo dõi ngữ cảnh và tư vấn theo thông tin của một cửa hàng.**

Hãy hình dung bạn tuyển một nhân viên tư vấn. Người đó cần có nơi tiếp khách, biết khách đã nói gì, biết cách giao tiếp và có thông tin sản phẩm. Ba bài xây lần lượt những thành phần tương ứng:

| Bài | Vấn đề cần giải quyết | Điều bạn học được |
| --- | --- | --- |
| 012 — Building Chat UIs with Gradio (Tạo giao diện trò chuyện) | Làm sao nhận tin nhắn và các lượt trao đổi trước? | `ChatInterface` và callback `chat(message, history)` |
| 013 — Building a Streaming Chatbot (Tạo chatbot trả lời dần) | Làm sao gọi mô hình để trả lời đúng ngữ cảnh và hiển thị dần? | Ghép `messages`, gọi API, cộng dồn các chunk rồi `yield` |
| 014 — System Prompts, Multi-Shot Prompting, RAG (Chỉ dẫn, ví dụ và dữ liệu liên quan) | Làm sao trợ lý nói đúng vai và biết thông tin cửa hàng? | System prompt, ví dụ mẫu, bổ sung ngữ cảnh theo câu hỏi |

Bạn đang xây **ứng dụng sử dụng mô hình đã có**. Bạn tự viết giao diện, luồng xử lý và cách cung cấp thông tin; bạn không huấn luyện một mô hình ngôn ngữ từ đầu.

## 2. Bài 012 — Hiểu giao diện chat trước khi gắn AI

### 2.1. Vì sao giảng viên cho chatbot chỉ trả lời “bananas”?

Đoạn đầu cố ý chưa gọi AI:

```python
def chat(message, history):
    return "bananas"
```

Mục đích là tách hai việc để bạn dễ quan sát: **Gradio lo giao diện; hàm `chat` quyết định nội dung trả lời.** Gradio không cần biết hàm đó dùng mô hình, đọc database hay chỉ trả về một chuỗi cố định.

Trong code của video, giao diện được tạo như sau:

```python
gr.ChatInterface(fn=chat, type="messages").launch()
```

- `fn=chat`: đăng ký hàm để Gradio gọi khi người dùng gửi tin nhắn.
- `type="messages"`: trong phiên bản dùng ở video, yêu cầu lịch sử theo dạng các message có `role` và `content`.
- `.launch()`: khởi chạy giao diện.

Nếu quen React, bạn có thể hình dung `chat` gần với một hàm xử lý `onSubmit`: UI thu thập dữ liệu rồi gọi hàm xử lý. Đây là phép so sánh về trách nhiệm; callback Python trong ví dụ chạy phía server.

### 2.2. `message`, `history`, `messages` khác nhau thế nào?

Ba tên gần giống nhau này là điểm cần nắm chắc nhất:

| Biến | Chứa gì? | Ai cung cấp hoặc tạo ra? |
| --- | --- | --- |
| `message` | Tin nhắn người dùng vừa gửi | Gradio truyền vào callback |
| `history` | Các lượt user và assistant trước đó | Gradio truyền vào callback |
| `messages` | Toàn bộ đầu vào sẽ gửi cho mô hình ở lượt hiện tại | Bạn ghép trong callback |

Ví dụ bạn đã nói “Tôi tên Cường”, chatbot đã đáp “Chào Cường”, rồi bạn gửi “Tôi tên gì?”. Khi callback được gọi:

```python
message = "Tôi tên gì?"

history = [
    {"role": "user", "content": "Tôi tên Cường"},
    {"role": "assistant", "content": "Chào Cường"},
]
```

Tin nhắn “Tôi tên gì?” được truyền riêng, chưa nằm trong `history` theo luồng callback của bài học. Vì vậy bạn phải thêm nó khi dựng đầu vào cho API.

Lần đầu mở chat, chưa có trao đổi nên `history` là `[]`, tức danh sách rỗng.

### 2.3. Tại sao có `role`?

`content` là nội dung; `role` cho biết nội dung đó thuộc vai nào:

| Role | Ý nghĩa trong bài |
| --- | --- |
| `system` | Chỉ dẫn nền do ứng dụng đặt ra |
| `user` | Lời người dùng |
| `assistant` | Câu trả lời trước đó của mô hình |

Gửi cả hai phía giúp mô hình hiểu diễn biến cuộc trò chuyện. Nếu chỉ gửi lời user, câu “mẫu thứ hai bạn vừa giới thiệu” có thể mất đối tượng tham chiếu vì danh sách sản phẩm nằm trong câu trả lời của assistant.

**Kết quả cần đạt sau bài 012:** bạn giải thích được ai gọi callback, callback nhận gì và giá trị trả về được đưa lên màn hình ở đâu.

## 3. Bài 013 — Nối giao diện với mô hình và tạo cảm giác “nhớ”

### 3.1. Công thức ghép đầu vào

Mỗi lượt hỏi trong bài được xử lý bằng công thức:

**Đầu vào mô hình = chỉ dẫn hệ thống + lịch sử trước đó + câu hỏi hiện tại.**

```python
messages = (
    [{"role": "system", "content": system_message}]
    + history
    + [{"role": "user", "content": message}]
)
```

Dấu `+` ở đây nối các danh sách. Kết quả của ví dụ trên sẽ là:

```python
[
    {"role": "system", "content": "Bạn là trợ lý hữu ích."},
    {"role": "user", "content": "Tôi tên Cường"},
    {"role": "assistant", "content": "Chào Cường"},
    {"role": "user", "content": "Tôi tên gì?"},
]
```

Gradio quản lý phần hội thoại trên UI, nhưng không tự biết biến `system_message` của bạn. Đó là lý do bạn tự thêm system message vào đầu danh sách.

### 3.2. AI “nhớ tên” bằng cách nào?

Trong cách gọi API của bài, **ứng dụng gửi lại lịch sử ở mỗi lượt**. Mô hình nhìn thấy câu “Tôi tên Cường” trong đầu vào mới, rồi dùng nó để trả lời.

Hãy coi mỗi lần gọi API là đưa cho nhân viên một tờ giấy gồm nội quy, biên bản trao đổi trước đó và câu hỏi mới. Nhân viên có đủ dữ kiện vì bạn đưa lại biên bản.

**Bổ sung để hiểu đúng:** lịch sử hội thoại trong phiên, dữ liệu lưu trong database và kiến thức đã học của mô hình là ba thứ khác nhau. Ví dụ này chưa xây bộ nhớ lâu dài. Muốn tiếp tục một cuộc chat ở lần đăng nhập sau, ứng dụng cần lưu, tải và chọn lại ngữ cảnh phù hợp để gửi đi.

Lịch sử dài hơn cũng làm đầu vào lớn hơn. Context window (cửa sổ ngữ cảnh) có giới hạn; trong ứng dụng lớn bạn có thể cần chọn các lượt gần đây hoặc tóm tắt phần cũ. Bài này chưa triển khai các bước đó.

### 3.3. Vì sao làm sạch `history`?

Giảng viên thêm bước chỉ giữ hai trường:

```python
history = [
    {"role": item["role"], "content": item["content"]}
    for item in history
]
```

Đọc như sau: “Duyệt từng phần tử của lịch sử, tạo một dictionary mới chỉ có `role` và `content`, rồi gom chúng thành danh sách”.

UI có thể kèm metadata mà API đích không nhận. Trong video, giảng viên nhấn mạnh bước này để tránh vấn đề khi thử một số nhà cung cấp khác.

**Bổ sung để hiểu đúng:** đây là bước chuyển dữ liệu UI sang định dạng API cho ví dụ chat văn bản. Nó không bảo đảm mọi API có cùng schema, cũng không đủ để xử lý mọi trường hợp ảnh, file hoặc tool call. Không nên suy ra rằng mọi phiên bản OpenAI API luôn chấp nhận trường thừa.

### 3.4. Từ trả lời một lần sang streaming

Ở bản không streaming, callback gọi API, chờ xong rồi trả nội dung:

```python
result = client.chat.completions.create(
    model=MODEL,
    messages=messages,
)
return result.choices[0].message.content
```

Với streaming (truyền kết quả dần), callback nhận nhiều **chunk — mảnh dữ liệu** và cập nhật giao diện từng đợt:

```python
stream = client.chat.completions.create(
    model=MODEL,
    messages=messages,
    stream=True,
)

response = ""
for chunk in stream:
    response += chunk.choices[0].delta.content or ""
    yield response
```

Các đoạn API này diễn giải cách làm trong video, không phải hướng dẫn cập nhật SDK mới nhất.

| Thành phần | Vai trò |
| --- | --- |
| `stream=True` | Yêu cầu API trả kết quả theo luồng |
| `for chunk in stream` | Nhận lần lượt từng mảnh dữ liệu |
| `delta.content` | Phần văn bản mới trong chunk |
| `or ""` | Dùng chuỗi rỗng nếu phần nội dung không có giá trị |
| `response += ...` | Ghép phần mới vào câu trả lời đã nhận |
| `yield response` | Đưa câu trả lời tích lũy hiện tại cho Gradio hiển thị |

Ví dụ giả định:

| Chunk văn bản vừa đến | Giá trị được `yield` |
| --- | --- |
| `Chào` | `Chào` |
| ` Cường` | `Chào Cường` |
| `!` | `Chào Cường!` |

Trong mẫu callback này, phải đưa **toàn bộ nội dung tích lũy**, không chỉ mảnh mới nhất. Nếu chỉ đưa mảnh mới, UI có thể thay nội dung đang hiển thị bằng riêng mảnh đó.

`return` kết thúc hàm và trả kết quả một lần. Hàm có `yield` trở thành generator (hàm sinh): nó có thể cung cấp nhiều giá trị qua các lần lặp. Gradio dùng những giá trị ấy để cập nhật câu trả lời đang viết.

**Bổ sung để hiểu đúng:** chunk không nhất thiết là một từ hoặc đúng một token. Streaming chủ yếu giúp người dùng thấy phần đầu sớm hơn; nó không tự làm mô hình thông minh hơn hay bảo đảm tổng thời gian sinh câu trả lời ngắn hơn.

**Kết quả cần đạt sau bài 013:** bạn hiểu tại sao chatbot trả lời được câu hỏi nối tiếp và vì sao cần cả API streaming lẫn callback `yield` để chữ hiện dần.

## 4. Bài 014 — Biến chatbot chung thành trợ lý cửa hàng

### 4.1. System prompt (chỉ dẫn hệ thống) có những nhiệm vụ nào?

Giảng viên thay chỉ dẫn chung bằng chỉ dẫn cho một cửa hàng quần áo. Thông tin trong phần code gồm: mũ giảm 60%, phần lớn mặt hàng khác giảm 50%; trợ lý nên nhẹ nhàng giới thiệu hàng giảm giá và gợi ý mũ khi khách phân vân.

Đây là dữ liệu của tình huống minh họa trong video, không phải thông tin của một cửa hàng thực tế.

| Thành phần prompt | Ví dụ | Tác dụng |
| --- | --- | --- |
| Vai trò | Bạn là trợ lý cửa hàng quần áo | Xác định phạm vi tư vấn |
| Giọng điệu | Khuyến khích nhẹ nhàng | Định hướng cách nói |
| Dữ kiện | Mũ giảm 60% | Cung cấp thông tin để trả lời |
| Mục tiêu | Giới thiệu mặt hàng đang giảm giá | Định hướng hành vi |
| Ví dụ | Khách hỏi mua mũ thì trả lời thế nào | Minh họa cách áp dụng |

Cùng một mô hình, thay đầu vào sẽ làm câu trả lời thay đổi. Bạn đang **cấu hình hành vi và cung cấp ngữ cảnh**, không thay trọng số của mô hình.

**Bổ sung để hiểu đúng:** câu “không biết thì nói không biết” là một chỉ dẫn hữu ích, nhưng không bảo đảm loại bỏ hallucination (câu trả lời bịa hoặc không có căn cứ). Ngay trong demo, chatbot nói giày thoải mái và chất lượng tốt dù prompt chưa cung cấp căn cứ cho các thuộc tính ấy. Câu trả lời nghe tự nhiên chưa chứng minh dữ kiện đúng.

### 4.2. One-shot và multi-shot prompting — Dạy bằng ví dụ

Chỉ nói “hãy tư vấn tốt” khá mơ hồ. Cho ví dụ cụ thể giúp mô hình thấy kiểu câu trả lời bạn mong muốn.

| Kỹ thuật | Số ví dụ minh họa | Cách hiểu |
| --- | --- | --- |
| Zero-shot | Không có ví dụ | Giao yêu cầu trực tiếp |
| One-shot | Một ví dụ | Cho một mẫu để làm theo |
| Few-shot / multi-shot | Một vài / nhiều ví dụ | Minh họa nhiều tình huống |

Ví dụ được viết lại bằng tiếng Việt:

```text
Khách: Tôi muốn mua mũ.
Trợ lý: Mũ đang giảm 60%. Bạn muốn tìm kiểu nào?

Khách: Tôi muốn mua giày.
Trợ lý: Hôm nay giày không giảm giá. Nếu bạn muốn xem thêm
phụ kiện đang ưu đãi, cửa hàng có mũ giảm 60%.
```

Trong video, giảng viên bắt đầu bằng mẫu hỏi về mũ, sau đó bổ sung tình huống giày không giảm giá và gọi đó là bước đầu của multi-shot prompting.

**Bổ sung để hiểu đúng:** quy tắc “nếu hỏi giày thì nói giày không giảm giá” cũng có thể được xem là chỉ dẫn theo tình huống; một cặp hỏi–đáp hoàn chỉnh minh họa rõ hơn khái niệm shot. “Shot” nói về ví dụ trong prompt, không phải số lần bạn gọi API.

Ví dụ có thể nằm trong nội dung prompt hoặc được thể hiện bằng các message mẫu phù hợp. Không bắt buộc mọi ví dụ đều phải nằm trong system prompt.

### 4.3. Dynamic context (ngữ cảnh được bổ sung theo câu hỏi)

Giảng viên thêm một kiểm tra đơn giản:

```python
relevant_system_message = system_message

if "belt" in message.lower():
    relevant_system_message += (
        " Cửa hàng không bán thắt lưng."
        " Nếu khách hỏi, hãy giới thiệu mặt hàng khác đang giảm giá."
    )
```

Luồng xử lý là:

1. Bắt đầu từ chỉ dẫn chung của cửa hàng.
2. Kiểm tra tin nhắn mới có chứa `belt` hay không.
3. Nếu có, thêm dữ kiện “cửa hàng không bán thắt lưng”.
4. Dùng prompt đã bổ sung để dựng `messages` và gọi mô hình.

Điểm đáng học không nằm ở câu lệnh `if`. **Điểm chính là ứng dụng chọn thông tin phù hợp trước khi nhờ mô hình trả lời.**

`message.lower()` chuyển chữ thành chữ thường để `Belt` và `BELT` cũng khớp. Tuy nhiên, khách viết “thắt lưng”, dùng từ đồng nghĩa hoặc hỏi tiếp “loại đó có màu đen không?” thì kiểm tra này có thể không tìm ra dữ kiện cần thiết. Kiểm tra chuỗi con còn có thể khớp những từ không đúng ý định.

### 4.4. Đây là bước đầu của RAG như thế nào?

**RAG — Retrieval-Augmented Generation (sinh câu trả lời có bổ sung thông tin truy xuất)** có ý tưởng cốt lõi:

| Bước | Việc làm | Trong demo |
| --- | --- | --- |
| Retrieval — truy xuất | Chọn thông tin liên quan câu hỏi | Kiểm tra từ `belt` để chọn một dữ kiện viết sẵn |
| Augmentation — bổ sung | Đưa thông tin vào đầu vào mô hình | Nối dữ kiện vào prompt |
| Generation — sinh câu trả lời | Mô hình trả lời dựa trên ngữ cảnh đã nhận | Giải thích cửa hàng không bán thắt lưng |

Demo là **minh họa tối giản cho ý tưởng RAG**, chưa xây pipeline truy xuất từ một kho tài liệu. Video chưa triển khai chia tài liệu, embedding, vector database hay xếp hạng kết quả.

Ví dụ mở rộng để hình dung: khách hỏi “mua rồi có đổi kích cỡ được không?”. Ứng dụng tìm phần chính sách đổi hàng, đưa đoạn liên quan vào prompt, rồi mô hình diễn đạt thành câu trả lời dễ hiểu.

**Bổ sung để hiểu đúng:** RAG không bắt buộc dùng vector database; thông tin có thể được tìm bằng từ khóa, database hoặc phương pháp khác. Dữ liệu truy xuất cũng không bắt buộc đặt trong system message. Khi triển khai thật, cần phân biệt chỉ dẫn của ứng dụng với nội dung tài liệu tham khảo.

### 4.5. Vì sao không nhét toàn bộ thông tin cửa hàng vào prompt?

Với vài dòng dữ liệu, đưa tất cả vào prompt là hợp lý. Nhưng khi có hàng nghìn sản phẩm, đưa mọi thứ ở mọi lượt sẽ làm đầu vào dài, tăng lượng token xử lý, có thể vượt giới hạn ngữ cảnh và khiến thông tin cần thiết khó nổi bật.

Vì vậy, hãy nghĩ đến “đưa đúng trang tài liệu cần đọc” thay vì “đưa cả tủ tài liệu cho mỗi câu hỏi”. Lợi ích phụ thuộc việc truy xuất đúng: nếu chọn sai hoặc bỏ sót tài liệu quan trọng, câu trả lời vẫn có thể sai.

### 4.6. RAG khác training và fine-tuning ở đâu?

| Cách làm | Thứ thay đổi | Liên hệ với bài |
| --- | --- | --- |
| Prompting | Chỉ dẫn và ví dụ trong đầu vào | Có thực hành |
| Gửi history | Ngữ cảnh cuộc trò chuyện hiện tại | Có thực hành |
| RAG | Thông tin truy xuất được thêm vào đầu vào | Mới minh họa ý tưởng |
| Fine-tuning — tinh chỉnh | Trọng số được cập nhật qua huấn luyện bổ sung | Không thực hiện |
| Training from scratch — huấn luyện từ đầu | Huấn luyện trọng số mô hình từ đầu | Không thực hiện |

Giảng viên gọi các cách bổ sung prompt là **inference-time techniques — kỹ thuật áp dụng lúc mô hình được dùng để trả lời**. Mô hình giữ nguyên; đầu vào được chuẩn bị tốt hơn.

**Kết quả cần đạt sau bài 014:** bạn biết vì sao trợ lý dùng được dữ kiện riêng dù chưa được huấn luyện lại, và phân biệt được demo kiểm tra từ khóa với một hệ thống RAG đầy đủ hơn.

## 5. Ghép toàn bộ bài học thành một đoạn code

Đây là **bản viết lại để học theo cấu trúc và cú pháp của video**, chỉ dành cho chat văn bản. Video dùng `gpt-4.1-mini` và `gr.ChatInterface(..., type="messages")`. Không xem đây là xác nhận về phiên bản Gradio mới nhất hoặc quyền truy cập model hiện tại. Đoạn này chưa được chạy gọi API trong quá trình biên soạn.

Giả định môi trường khóa học đã có `gradio`, `openai`, `python-dotenv`, cùng `OPENAI_API_KEY` trong biến môi trường hoặc `.env`.

```python
import gradio as gr
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI()
MODEL = "gpt-4.1-mini"  # Model hiển thị trong video

SYSTEM_MESSAGE = """
Bạn là trợ lý của một cửa hàng quần áo. Trả lời bằng tiếng Việt.
Tư vấn thân thiện, ngắn gọn; nhẹ nhàng giới thiệu hàng giảm giá.
Mũ giảm 60%. Phần lớn mặt hàng khác giảm 50%.
Giày không giảm giá hôm nay.
Không tự suy đoán giá, tồn kho hoặc chính sách chưa được cung cấp.
Nếu thiếu thông tin, hãy nói rõ.

Ví dụ 1:
Khách: Tôi muốn mua mũ.
Trợ lý: Mũ đang giảm 60%. Bạn đang tìm kiểu nào?

Ví dụ 2:
Khách: Tôi muốn mua giày.
Trợ lý: Hôm nay giày không giảm giá. Nếu bạn muốn xem thêm
phụ kiện đang ưu đãi, cửa hàng có mũ giảm 60%.
"""


def chat(message, history):
    # 1. Chuyển lịch sử UI về các trường cần cho ví dụ API này.
    clean_history = [
        {"role": item["role"], "content": item["content"]}
        for item in history
    ]

    # 2. Tạo prompt riêng cho lượt hiện tại.
    relevant_system_message = SYSTEM_MESSAGE
    question = message.lower()

    # Mở rộng demo gốc để nhận cả từ tiếng Việt.
    # Đây vẫn chỉ là kiểm tra từ khóa đơn giản.
    if "belt" in question or "thắt lưng" in question:
        relevant_system_message += "\nCửa hàng không bán thắt lưng."

    # 3. Ghép chỉ dẫn, lịch sử và câu hỏi mới theo đúng thứ tự.
    messages = (
        [{"role": "system", "content": relevant_system_message}]
        + clean_history
        + [{"role": "user", "content": message}]
    )

    # 4. Gọi mô hình ở chế độ streaming.
    stream = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        stream=True,
    )

    # 5. Cập nhật câu trả lời tích lũy lên giao diện.
    response = ""
    for chunk in stream:
        response += chunk.choices[0].delta.content or ""
        yield response


gr.ChatInterface(fn=chat, type="messages").launch()
```

Phần bổ sung của bản viết lại là tiếng Việt, quy tắc không suy đoán và từ khóa “thắt lưng”. Cơ chế chính giữ theo bài: callback, ghép history, thêm thông tin có điều kiện và streaming.

**Chi tiết đáng chú ý:** mỗi lượt tạo biến `relevant_system_message` từ chỉ dẫn nền rồi bổ sung cục bộ. Không nối thông tin riêng của từng khách trực tiếp vào biến global dùng chung. Trong notebook, giảng viên thay biến global để thử nghiệm nhanh; đó chưa phải thiết kế quản lý trạng thái cho sản phẩm nhiều người dùng.

## 6. Liên hệ với công việc front-end của bạn

| Trong bài học | Nếu tự xây ứng dụng web |
| --- | --- |
| Gradio dựng khung chat | React/Next.js dựng danh sách tin nhắn và ô nhập |
| Callback Python | Hàm xử lý phía backend nhận câu hỏi |
| `history` của Gradio | Trạng thái hội thoại và dữ liệu phiên do ứng dụng quản lý |
| Dựng `messages` | Backend chuẩn bị đầu vào mô hình |
| `yield` để cập nhật Gradio | Backend truyền dần kết quả, frontend cập nhật tin nhắn đang nhận |
| Chèn dữ kiện cửa hàng | Backend lấy thông tin nghiệp vụ liên quan trước khi gọi mô hình |

Đây là phần liên hệ bổ sung, không phải bài hướng dẫn triển khai Next.js. Giá trị bạn tạo thêm nằm ở trải nghiệm, dữ liệu nghiệp vụ và cách tổ chức ngữ cảnh. Gradio giúp thử ý tưởng nhanh; kiến thức về `messages`, history và chọn dữ liệu vẫn dùng được khi bạn đổi giao diện.

Video có nhắc `share=True` để chia sẻ demo và `auth` để thêm đăng nhập cơ bản. Phần này chỉ là nhắc lại khả năng đã học; nó không thay thế việc triển khai đầy đủ lưu trữ hội thoại, phân quyền dữ liệu, xử lý lỗi và quản lý chi phí. API key trong ví dụ thuộc môi trường Python phía server.

## 7. Bài thực hành ngắn để kiểm tra bạn đã hiểu

Thử theo thứ tự sau; câu trả lời thực tế có thể khác cách diễn đạt vì mô hình không phải hàm trả chuỗi cố định.

| Thao tác | Điều cần quan sát |
| --- | --- |
| Gửi “Tôi tên Cường”, rồi “Tôi tên gì?” | Lịch sử giúp mô hình có dữ kiện về tên |
| Tạm bỏ `clean_history` khỏi phép ghép, hỏi lại tên | Mô hình không còn dữ kiện tên từ lượt trước; nếu đoán thì không phải nhớ |
| Hỏi “Mũ đang giảm bao nhiêu?” | Dùng dữ kiện 60% trong prompt |
| Hỏi “Giày có giảm giá không?” | Dùng ngoại lệ giày không giảm giá |
| Hỏi “Có bán thắt lưng không?” | Bản viết lại kích hoạt nhánh bổ sung dữ kiện |
| Hỏi “Có dây nịt không?” | Thấy giới hạn của việc chỉ kiểm tra từ khóa |
| Yêu cầu một câu trả lời dài hơn | Quan sát văn bản xuất hiện dần |

Tự trả lời ba câu này là đủ kiểm tra phần cốt lõi:

1. **Ai giữ và gửi lại lịch sử?** Ứng dụng; trong demo, Gradio cung cấp history cho callback, callback đưa history vào API.
2. **Vì sao mô hình biết cửa hàng không bán thắt lưng?** Code chọn và thêm dữ kiện ấy vào đầu vào trước khi gọi mô hình.
3. **Bạn đã huấn luyện AI chưa?** Chưa. Bạn đã xây một ứng dụng sử dụng mô hình có sẵn và chuẩn bị ngữ cảnh cho nó.

## 8. Nguồn và phạm vi

Nguồn chính là các file do bạn cung cấp:

- **012 Day 3 - Building Chat UIs with Gradio Your First Conversational AI Assistant** — phụ đề `.srt`; đối chiếu code khởi tạo ở khoảng 04:00 trong `.mp4`.
- **013 Day 3 - Building a Streaming Chatbot with Gradio and OpenAI API** — phụ đề `.srt`; đối chiếu phần ghép lịch sử và streaming ở khoảng 04:15.
- **014 Day 3 - System Prompts, Multi-Shot Prompting, and Your First Look at RAG** — phụ đề `.srt`; đối chiếu prompt cửa hàng khoảng 00:35 và nhánh `belt` khoảng 03:25.

Phụ đề có chỗ nhận dạng tên model và tỷ lệ giảm giá chưa rõ; các chi tiết ấy ở đây theo code nhìn thấy trên video: `gpt-4.1-mini`, mũ 60%, phần lớn mặt hàng khác 50%. Những ví dụ tiếng Việt, phép so sánh với lập trình web và giải thích về giới hạn của demo do tôi bổ sung để giúp bạn hiểu bản chất.
