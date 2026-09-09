# Tuần 2 · Ngày 1 — Kết nối và phối hợp nhiều mô hình AI

> Bản giảng giải đầy đủ cho 6 bài 001–006. Biên soạn từ phụ đề tiếng Anh bạn gửi, theo cách giải thích mới bằng tiếng Việt; không phải bản dịch từng câu hoặc bản chép toàn bộ mã trên màn hình. Tên “Tuần 2” lấy từ lời mở đầu và kết thúc của giảng viên.
>
> Cách đọc: đọc mục 1 để hiểu toàn cảnh, sau đó đi lần lượt từng bài. Những đoạn **Bổ sung / làm rõ** giúp phân biệt kiến thức cốt lõi với nhận xét hoặc kết quả riêng của buổi demo.

## 1. Toàn bộ phần này thực sự muốn dạy điều gì?

**Mục tiêu là giúp bạn viết chương trình sử dụng nhiều LLM: biết cách kết nối, chọn cấu hình, cung cấp thông tin và điều phối các lượt gọi.**

LLM — Large Language Model, mô hình ngôn ngữ lớn — là thành phần tạo câu trả lời. Chương trình của bạn chịu trách nhiệm quyết định hỏi mô hình nào, gửi dữ liệu gì và làm gì với kết quả.

Nếu liên hệ với công việc lập trình web: bạn đã biết gọi một API để lấy danh sách sản phẩm. Ở đây, bạn gọi API để yêu cầu mô hình tạo câu trả lời. Phần mới nằm ở việc thiết kế đầu vào bằng ngôn ngữ, xử lý kết quả không hoàn toàn xác định và kiểm soát chi phí theo lượng token.

Bạn đang học **xây dựng ứng dụng dùng AI có sẵn**, không thực hiện huấn luyện một mô hình từ đầu trong 6 bài này.

| Bài | Giảng viên làm gì? | Kiến thức bạn cần lấy ra |
|---|---|---|
| 001 | Kết nối nhiều hãng, nhờ AI kể chuyện cười | API key, client, model, messages và API tương thích |
| 002 | Thử câu đố với các cấu hình GPT-5 | Phân biệt đổi mô hình và tăng mức suy luận |
| 003 | So sánh câu trả lời của nhiều mô hình | Cách quan sát kết quả; phân biệt model và nhà cung cấp |
| 004 | Gọi mô hình local, SDK riêng và OpenRouter | Phân biệt nơi chạy mô hình với cách truy cập |
| 005 | Dùng LangChain, LiteLLM và văn bản Hamlet | Lớp trừu tượng, ngữ cảnh, token, chi phí và caching |
| 006 | Cho GPT và Claude trò chuyện | Quản lý lịch sử, vai trò và vòng lặp điều phối |

**Vì sao có nhiều câu đố và chuyện cười?** Đó là dữ liệu thử cho các lời gọi API. Giảng viên cố ý lặp thao tác để bạn quen cấu trúc gọi mô hình, đồng thời thấy đầu ra thay đổi. Bạn không cần ghi nhớ từng chuyện cười hoặc học sâu lý thuyết trò chơi để hiểu phần này.

## 2. Bài 001 — Connecting to Multiple Frontier Models with APIs · Kết nối nhiều mô hình qua API

### 2.1. Phân biệt những thứ xuất hiện cùng lúc

Frontier model có thể hiểu là mô hình thuộc nhóm năng lực tiên tiến tại thời điểm đang nói đến. Đây không phải tên một giao thức hoặc kiểu API.

| Thuật ngữ | Hiểu đơn giản | Liên hệ lập trình web |
|---|---|---|
| Model — mô hình | Thành phần xử lý yêu cầu và sinh câu trả lời | Bộ máy xử lý nằm sau API |
| Provider — nhà cung cấp | Đơn vị cung cấp dịch vụ chạy mô hình | Dịch vụ bên ngoài mà backend gọi |
| API — giao diện lập trình | Quy định gửi yêu cầu và nhận kết quả | Hợp đồng request/response |
| Endpoint / base URL — địa chỉ API | Nơi gửi request | Địa chỉ máy chủ hoặc địa chỉ gốc của API |
| SDK / client library — thư viện phía ứng dụng | Mã hỗ trợ gọi API | Gần với một API client viết trên `fetch` |
| API key — khóa truy cập | Thông tin xác thực và gắn việc sử dụng với tài khoản | Khóa bí mật của dịch vụ |
| Messages — danh sách thông điệp | Nội dung cuộc trao đổi bạn gửi cho mô hình | Một mảng object |

**Điểm dễ nhầm:** tên thư viện dùng để gọi API không quyết định mô hình thực sự chạy ở đâu. Một client theo định dạng OpenAI có thể gửi request đến dịch vụ khác nếu dịch vụ đó hỗ trợ giao diện tương thích.

Ví dụ, Gemini có tài liệu hướng dẫn dùng thư viện OpenAI với địa chỉ API, khóa và tên mô hình phù hợp. Điều này là khả năng tương thích giao diện, không có nghĩa Gemini được chạy bởi OpenAI. [Tài liệu Gemini về OpenAI compatibility](https://ai.google.dev/gemini-api/docs/openai)

### 2.2. Một lần gọi LLM gồm những bước nào?

1. Chuẩn bị khóa của dịch vụ muốn sử dụng.
2. Khởi tạo client trỏ đến đúng địa chỉ.
3. Chọn model.
4. Tạo messages chứa yêu cầu.
5. Gửi request và lấy nội dung trả lời từ response.

Trong video, giảng viên lưu khóa trong `.env`, nạp các biến môi trường rồi kiểm tra chúng đã có hay chưa. Phụ đề tự động đôi khi ghi nhầm `.env` thành “EMV”.

Với nền tảng JavaScript của bạn, đầu vào sau rất quen thuộc:

```json
[
  { "role": "user", "content": "Kể một chuyện cười cho người đang học LLM." }
]
```

Python gọi cấu trúc này là **list of dictionaries**: một danh sách chứa các dictionary. Bạn có thể hình dung tương đương mảng chứa object trong JavaScript.

Trong lab, lời gọi lặp đi lặp lại là `client.chat.completions.create(...)`. Cách lấy văn bản thường xuất hiện dưới dạng `response.choices[0].message.content`: lấy lựa chọn đầu tiên, rồi lấy nội dung thông điệp của nó. Đây là cấu trúc của kiểu response đang dùng trong bài, không phải quy tắc cho mọi API.

Một `system` message có thể đặt vai trò, phong cách và quy tắc trả lời. Tuy nhiên, một câu hỏi đơn giản không nhất thiết cần thêm system message chỉ để nói “Bạn là trợ lý hữu ích”.

### 2.3. Bạn cần chuẩn bị đến mức nào?

Giảng viên nói rõ việc đăng ký tất cả dịch vụ là tùy chọn. Bạn có thể hiểu quy trình bằng một mô hình, rồi mở rộng sau. Đừng nhầm danh sách hãng dài với danh sách tài khoản bắt buộc phải mua.

**Bổ sung / làm rõ:**

- Để khóa ở backend hoặc môi trường chạy notebook; không nhúng khóa bí mật vào mã frontend gửi tới trình duyệt.
- `.env` cần được loại khỏi Git. Khi kiểm tra cấu hình, chỉ báo “đã có khóa” thay vì in nguyên khóa.
- Sau khi sửa `.env`, cần lưu và nạp lại; nếu notebook còn giữ giá trị cũ, kiểm tra cơ chế ghi đè hoặc khởi động lại môi trường chạy.
- Giá nạp tiền, free tier và các tên model trong video là thông tin theo thời điểm quay. Tài liệu này không coi chúng là bảng giá hoặc danh sách model hiện hành.

**Kết quả cần đạt:** giải thích được bốn thứ riêng biệt: *dùng client nào, gửi đến đâu, dùng khóa của ai và gọi model nào*.

## 3. Bài 002 — Reasoning Effort and Scaling · Mức suy luận và cách tăng năng lực xử lý

### 3.1. Hai “núm điều chỉnh” khác nhau

Giảng viên dùng một câu hỏi, sau đó thay đổi model hoặc mức reasoning để bạn quan sát kết quả.

| Hướng thay đổi | Điều gì được thay đổi? | Ý nghĩa |
|---|---|---|
| Training-time scaling — tăng quy mô khi huấn luyện | Tài nguyên, dữ liệu, quy mô và quá trình huấn luyện ở phía tạo model | Có thể tạo ra mô hình có năng lực khác |
| Inference-time scaling — tăng tính toán lúc trả lời | Lượng tính toán dành cho một yêu cầu | Cho model thêm khả năng xử lý bài khó ở thời điểm sử dụng |

Trong lab, bạn **chọn một model khác đã được huấn luyện sẵn** để minh họa hướng thứ nhất. Bạn không trực tiếp tăng quy mô huấn luyện bằng một tham số API.

`reasoning_effort` — mức nỗ lực suy luận — minh họa hướng thứ hai. Video thử các mức như `minimal` và `low`; các giá trị được hỗ trợ phụ thuộc model và API. Tăng mức này thường đánh đổi thêm thời gian hoặc token xử lý; không phải công tắc bảo đảm đúng.

Ví dụ gần gũi: nhờ một người có năng lực khác giải bài, hoặc vẫn người đó nhưng cho thêm thời gian kiểm tra. Đây là phép so sánh để dễ hiểu, không phải mô tả AI suy nghĩ giống con người.

### 3.2. Câu đố hai đồng xu: tại sao giảng viên nói 2/3?

Câu trong video có ý: “Tung hai đồng xu, biết một đồng là ngửa. Xác suất đồng còn lại là sấp?”

**Điều kiện cần làm rõ:** đáp án 2/3 đúng khi hai đồng xu công bằng, độc lập và thông tin được hiểu là **ít nhất một đồng ngửa**, tức loại các lần cả hai cùng sấp.

| Kết quả | Phù hợp điều kiện ít nhất một ngửa? | Có một ngửa và một sấp? |
|---|---|---|
| Ngửa – Ngửa | Có | Không |
| Ngửa – Sấp | Có | Có |
| Sấp – Ngửa | Có | Có |
| Sấp – Sấp | Không | — |

Còn ba kết quả đồng khả năng; hai kết quả có một ngửa, một sấp. Vì vậy xác suất là **2/3**.

**Bổ sung / làm rõ:** nếu đề cho biết một đồng cụ thể, chẳng hạn đồng thứ nhất, đã ngửa thì xác suất đồng thứ hai sấp là **1/2**. Nếu biết “đúng một đồng ngửa” thì đồng còn lại chắc chắn sấp. Cách thu được thông tin quan trọng, nên câu chữ ban đầu chưa đủ chặt để chấm mọi câu trả lời 1/2 là sai.

Theo lần demo, GPT-5 nano ở mức minimal trả lời 1/3; tăng lên low trả lời 2/3; đổi sang GPT-5 mini ở minimal cũng trả lời 2/3. Bài học là **cả lựa chọn model và cấu hình suy luận đều có thể tác động kết quả**, không phải một quy luật rằng mọi lần chạy sẽ lặp đúng bảng này.

### 3.3. Câu đố con sâu và hai cuốn sách

Đề cho hai tập sách đặt cạnh nhau trên giá, mỗi tập có ruột sách dày 2 cm, mỗi bìa dày 2 mm. Con sâu đi từ trang đầu tập 1 đến trang cuối tập 2, theo phương vuông góc với trang giấy.

Theo cách xếp sách thông thường mà giảng viên minh họa, hai trang đó nằm sát phía giữa hai tập. Con sâu chỉ đi qua **bìa trước tập 1 và bìa sau tập 2**:

**2 mm + 2 mm = 4 mm.**

Độ dày ruột sách là dữ kiện gây nhiễu trong cách bố trí này. Nếu khó hình dung, lấy hai cuốn sách đặt lên giá, gáy hướng ra ngoài, rồi mở kiểm tra vị trí hai trang thay vì chỉ tưởng tượng.

**Kết quả cần đạt:** hiểu vì sao phải thử cấu hình trên nhiệm vụ cụ thể, đồng thời kiểm tra xem đề bài và đáp án chuẩn có rõ ràng không.

## 4. Bài 003 — Testing Models on Brain Teasers · So sánh mô hình bằng câu đố

### 4.1. Quan sát trong video cho ta biết gì?

Ở câu đố con sâu, lần chạy được trình bày cho kết quả:

| Model trong video | Câu trả lời được ghi nhận |
|---|---|
| Claude Sonnet 4.5 | 8 mm — không đúng với cách bố trí của bài |
| GPT-5 | 4 mm |
| Gemini 2.5 Pro | 4 mm |

Một câu trả lời dài và có vẻ phân tích cẩn thận vẫn có thể sai. Ngược lại, một câu trả lời ngắn vẫn có thể đúng. Đây là lý do phải kiểm tra nội dung thay vì chỉ nhìn độ trôi chảy hoặc độ dài.

### 4.2. Trò chơi Share / Steal nhằm minh họa điều gì?

Hai người chọn **Share — chia sẻ** hoặc **Steal — lấy hết**:

| Bạn chọn | Người kia chọn | Bạn nhận | Người kia nhận |
|---|---|---:|---:|
| Share | Share | 1.000 USD | 1.000 USD |
| Share | Steal | 0 USD | 2.000 USD |
| Steal | Share | 2.000 USD | 0 USD |
| Steal | Steal | 0 USD | 0 USD |

Video ghi nhận Claude và mô hình GPT-OSS được gọi qua Groq chọn chia sẻ; DeepSeek và Grok chọn lấy hết. Giảng viên dùng điều này để minh họa khác biệt về phong cách trả lời.

**Bổ sung / làm rõ:** đây là đầu ra trong một tình huống giả định, không chứng minh AI có tính cách hay đạo đức cố định. Prompt, phiên bản model và lần chạy đều có thể ảnh hưởng câu trả lời.

Với đúng bảng thưởng trên và chỉ xét tiền của bản thân trong một lượt, Steal là lựa chọn **không kém hơn** Share: tốt hơn khi đối phương Share, bằng nhau khi đối phương Steal. Đây là ưu thế yếu; bảng này không hoàn toàn giống Prisoner’s Dilemma — thế lưỡng nan tù nhân — dạng chuẩn có ưu thế nghiêm ngặt. Bạn không cần học thuộc thuật ngữ đó để hoàn thành bài API.

### 4.3. Groq và Grok là hai thứ khác nhau

| Tên | Vai trò được giới thiệu trong bài |
|---|---|
| **Groq**, chữ Q | Nhà cung cấp hạ tầng suy luận, chạy các mô hình trên phần cứng của họ |
| **Grok**, chữ K | Họ mô hình của xAI |

Gọi GPT-OSS qua Groq nghĩa là dùng **mô hình GPT-OSS trên dịch vụ Groq**. Không nên gọi tất cả chúng chung là “con AI Groq”. Phụ đề tự động có nhiều chỗ viết tên hai bên gần như giống nhau.

### 4.4. Chuyển demo vui thành cách đánh giá có ích

Với một ứng dụng thật, hãy thay câu đố bằng một tập tác vụ của chính ứng dụng: giải thích ngữ pháp tiếng Việt, trả JSON đúng schema, tóm tắt bài giảng hoặc phân loại nội dung.

Đánh giá song song bốn yếu tố: **độ đúng, mức tuân thủ yêu cầu, thời gian và chi phí**. Giữ prompt đủ nhất quán để so sánh và thử nhiều ví dụ. Một lần timeout trong video cũng không đủ để kết luận dịch vụ đó luôn chậm.

**Kết quả cần đạt:** coi kết quả demo là quan sát có điều kiện; không biến vài câu đố thành bảng xếp hạng năng lực tổng thể.

## 5. Bài 004 — Local Models, Native APIs, OpenRouter · Nơi chạy và cách gọi mô hình

### 5.1. Chạy local bằng Ollama

Ollama là công cụ giúp tải và chạy các mô hình được hỗ trợ trên máy. Trong bài, giảng viên thử Llama 3.2 và GPT-OSS 20B, rồi gửi câu đố qua giao diện API.

Các tên cần tách rõ:

- **Ollama:** công cụ phục vụ việc chạy model.
- **Llama:** một họ mô hình; không phải cách viết khác của Ollama.
- **GPT-OSS:** một họ mô hình khác được dùng trong demo.
- **Local:** nơi thực hiện suy luận là máy đang chạy model trong tình huống này.

Nếu dịch vụ Ollama chưa chạy, video nhắc tới `ollama serve`. Việc tải model và khởi động dịch vụ là bước chuẩn bị; API request sau đó mới yêu cầu model tạo câu trả lời.

Ollama có giao diện tương thích với một phần API OpenAI, cho phép tái sử dụng client với địa chỉ local thích hợp. “Tương thích” không có nghĩa hỗ trợ mọi tính năng giống hệt dịch vụ gốc. [Tài liệu Ollama về OpenAI compatibility](https://docs.ollama.com/api/openai-compatibility)

**Bổ sung / làm rõ:** con số RAM giảng viên nhắc đến là gợi ý trong bối cảnh demo, không bảo đảm trải nghiệm cho mọi máy. Bộ nhớ cần dùng còn tùy bản lượng tử hóa, độ dài ngữ cảnh, CPU/GPU và cấu hình chạy. Local không mất phí API bên ngoài cho từng lần suy luận tại máy, nhưng vẫn dùng tài nguyên phần cứng và điện.

### 5.2. Native SDK — thư viện riêng của hãng

Giảng viên chuyển từ client tương thích sang thư viện riêng của Google và Anthropic. Cùng mục tiêu gửi câu hỏi nhưng tên hàm, tham số và cách đọc response khác nhau.

Ở ví dụ Anthropic, bài nhấn mạnh phải truyền giới hạn đầu ra `max_tokens`. Đó là giới hạn số token có thể sinh ra trong kiểu lời gọi đang dùng, không phải số từ và cũng không phải giới hạn tổng ngữ cảnh.

**Ý nghĩa:** bạn không cần thuộc tất cả SDK. Bạn cần biết đọc hợp đồng API của đúng thư viện mình dùng. Nếu cần tính năng riêng của nhà cung cấp, kiểm tra native API thay vì giả định lớp tương thích đã hỗ trợ.

### 5.3. OpenRouter — dịch vụ trung gian định tuyến

Thay vì ứng dụng giữ từng khóa của từng dịch vụ, ví dụ OpenRouter trong bài dùng một điểm truy cập trung gian rồi chọn model bằng tên tương ứng. Video gọi GLM 4.5 để minh họa rằng cùng một cách gọi có thể tiếp cận model khác.

| Cách tiếp cận trong bài | Request đi đâu? | Bạn phải hiểu gì? |
|---|---|---|
| Gọi trực tiếp | Ứng dụng → nhà cung cấp model | Xác thực và API của dịch vụ đó |
| Gọi local | Ứng dụng → Ollama trên máy chạy model | Model đã có, dịch vụ đang chạy, tài nguyên đủ |
| Qua router | Ứng dụng → OpenRouter → dịch vụ chạy model | Khóa/router endpoint và model được router hỗ trợ |

Router giúp đơn giản hóa điểm kết nối nhưng không khiến mọi model có cùng năng lực, cùng giá hoặc cùng tính năng. Trong ví dụ bạn chọn model cụ thể; chữ “router” không tự động có nghĩa hệ thống sẽ chọn model tốt nhất cho mọi câu hỏi.

**Kết quả cần đạt:** phân biệt được hai câu hỏi: *model chạy ở đâu?* và *mình dùng giao diện nào để gọi nó?*

## 6. Bài 005 — LangChain, LiteLLM, Context và Prompt Caching

### 6.1. Vì sao cần thêm một lớp thư viện?

Khi phải hỗ trợ nhiều nhà cung cấp, mỗi bên có thể có cách gọi và cấu trúc dữ liệu riêng. **Abstraction layer — lớp trừu tượng** tạo một cách dùng chung để ứng dụng ít phải xử lý các khác biệt đó.

| Thành phần | Vai trò trong bài | Không nên hiểu thành |
|---|---|---|
| LangChain | Framework cung cấp các lớp và công cụ để xây ứng dụng LLM; demo dùng đối tượng model và `invoke` | Một model tự sinh câu trả lời |
| LiteLLM | Thư viện giúp thống nhất lời gọi tới nhiều provider; demo dùng `completion` | Công cụ huấn luyện hoặc làm model thông minh hơn |
| OpenRouter | Dịch vụ trung gian nhận request rồi chuyển tiếp | Chỉ là thư viện được import vào chương trình |

Giảng viên thích LiteLLM và thấy LangChain có nhiều khái niệm phải học. Đây là đánh giá cá nhân của người dạy, không phải kết luận rằng LangChain luôn không phù hợp. Bài này mới giới thiệu cách gọi model bằng LangChain, chưa giảng toàn bộ framework.

**Bổ sung / làm rõ:** cách chia “router ở xa, abstraction layer ở trong mã” giúp hiểu demo. Tuy nhiên, một sản phẩm có thể có nhiều hình thức triển khai; chẳng hạn LiteLLM có cả Python SDK và Proxy Server, nên không nên đóng khung sản phẩm chỉ vào một loại. [Tài liệu LiteLLM](https://docs.litellm.ai/)

### 6.2. Ví dụ Hamlet: thiếu thông tin và có thông tin khác nhau thế nào?

Giảng viên hỏi một câu rất cụ thể về lời thoại trong *Hamlet*. Lúc chưa gửi văn bản gốc, model trả lời sai nhưng có vẻ chắc chắn. Sau khi đưa toàn bộ tác phẩm vào ngữ cảnh, model trả lời đúng theo văn bản được dùng trong lab.

**Bài học chính: trước khi đổi sang model đắt hơn, hãy kiểm tra nó đã được cung cấp đúng thông tin cần thiết chưa.**

Hallucination — thông tin bịa hoặc không có căn cứ — ở đây là câu trả lời có vẻ hợp lý nhưng không khớp nguồn. Không phải mọi lần thiếu thông tin model đều bịa; điều đáng chú ý là giọng văn tự tin không bảo đảm độ đúng.

Bạn có thể liên hệ với việc nhờ AI giải thích code: hỏi “Hàm đăng nhập trong dự án tôi làm gì?” mà không đưa code sẽ rất khác với gửi đúng hàm và các phần liên quan.

**Context engineering — thiết kế ngữ cảnh** là tổ chức thông tin cần thiết: tài liệu nguồn, câu hỏi, lịch sử, quy tắc và cách phân biệt chúng. Nó không đơn thuần là thêm câu “hãy suy nghĩ kỹ”.

Việc nhét toàn bộ Hamlet vào prompt là ví dụ cấp ngữ cảnh trực tiếp. Nó **chưa phải một quy trình RAG hoàn chỉnh**: RAG thường có bước truy xuất phần tài liệu liên quan trước khi tạo câu trả lời. Khi dữ liệu lớn, gửi toàn bộ mỗi lần có thể không phù hợp vì giới hạn ngữ cảnh và chi phí.

### 6.3. Token và chi phí: cần theo dõi điều gì?

Token là đơn vị mô hình xử lý văn bản; không nên đổi cứng một token thành một từ, đặc biệt giữa các ngôn ngữ.

- **Input tokens:** token của nội dung đầu vào, gồm cả lịch sử và tài liệu bạn gửi.
- **Output tokens:** token sinh ra; cách thống kê reasoning tokens phụ thuộc API/model.
- **Cached input tokens:** phần đầu vào được tái sử dụng theo cơ chế cache của dịch vụ.

Video dùng tiện ích LiteLLM để xem usage và ước tính chi phí từng lần gọi. Thư viện có thông tin token sử dụng và hàm tính chi phí; vẫn cần đối chiếu với thông tin thanh toán của nhà cung cấp. [LiteLLM: Completion Token Usage & Cost](https://docs.litellm.ai/docs/completion/token_usage)

Công thức giản lược, chưa xét cache và các khoản đặc thù:

```text
Chi phí ≈ input_tokens × đơn_giá_input / 1.000.000
        + output_tokens × đơn_giá_output / 1.000.000
```

**Ví dụ tự đặt, không phải giá của model nào:** nếu input là 1 USD/triệu token và output là 4 USD/triệu token, một lượt dùng 2.000 input cùng 500 output có giá khoảng 0,004 USD. Với 10.000 lượt cùng cấu hình, tổng là khoảng 40 USD.

Điều đáng học không phải thuộc số tiền trong video, mà là **đo chi phí một yêu cầu rồi nhân với quy mô sử dụng dự kiến**. Phụ đề nhận dạng số thập phân trong phần này khá nhiễu, nên tài liệu không chép chúng thành bảng giá.

### 6.4. Prompt caching — tái sử dụng phần đầu vào đã xử lý

Trong demo, gửi văn bản Hamlet dài làm tăng số input token. Gửi lại nội dung tương ứng ngay sau đó tạo cơ hội dùng cached tokens và giảm tiền xử lý đầu vào.

Hãy hình dung model phải xử lý một bộ tài liệu chung trước nhiều câu hỏi khác nhau. Cache cho phép hệ thống tái sử dụng một phần tính toán của bộ tài liệu đó.

**Prompt caching khác cache câu trả lời:** model vẫn có thể tạo câu trả lời mới. Nó cũng không huấn luyện lại model, không tạo trí nhớ vĩnh viễn và không làm ngữ cảnh dài biến mất khỏi giới hạn context.

Với cơ chế cache theo tiền tố, cách tổ chức có ích là:

1. Đặt quy tắc và tài liệu ổn định ở đầu.
2. Đặt câu hỏi hoặc dữ liệu thay đổi ở sau.
3. Theo dõi usage để biết thực tế có cache hit hay không.

Nếu đặt timestamp thay đổi ở đầu prompt, phần tiền tố giống nhau có thể bị ngắt rất sớm. Tuy nhiên, việc lặp prompt không bảo đảm tự động được giảm giá: còn phụ thuộc độ dài tối thiểu, thời hạn cache, cấu hình và dịch vụ.

**Cập nhật so với video:** giảng viên mô tả Anthropic theo cách chỉ định cache trong bối cảnh lúc quay. Tài liệu hiện có cả cách cấu hình automatic caching bằng `cache_control` ở cấp request và cách đặt breakpoint cụ thể. Vì vậy không nên ghi nhớ “Anthropic không có automatic caching” như quy tắc cố định. [Claude: Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)

**Kết quả cần đạt:** biết ba việc riêng biệt: thư viện giúp gọi dễ hơn; ngữ cảnh giúp trả lời có căn cứ hơn; cache giúp giảm phần xử lý lặp lại khi đủ điều kiện.

## 7. Bài 006 — Multi-Model Conversations · Cho các mô hình trò chuyện với nhau

### 7.1. Mục đích không nằm ở cuộc cãi nhau

Giảng viên đặt GPT vào vai hay phản bác và Claude vào vai lịch sự, rồi cho hai bên trao đổi. Phần vui đó che một bài học rất quan trọng: **ứng dụng quản lý lượt nói và dựng đúng ngữ cảnh cho từng lần gọi**.

Hai model không tự kết nối với nhau. Chương trình gọi A, lấy câu trả lời, đưa nó vào ngữ cảnh của B, gọi B, rồi tiếp tục.

Đổi system prompt có thể đổi vai. Cũng có thể dùng cùng một model cho cả hai vai. Điều đó không tạo ra hai bộ trọng số mới: bạn chỉ đang chạy hai vai hội thoại với cấu hình/ngữ cảnh riêng.

### 7.2. `user` và `assistant` phải nhìn từ phía model đang được gọi

Đây là điểm nên hiểu kỹ nhất trong bài.

| Lời trong lịch sử | Khi gọi GPT | Khi gọi Claude |
|---|---|---|
| Lời trước đó của GPT | `assistant` | `user` |
| Lời trước đó của Claude | `user` | `assistant` |

`assistant` là phía mà model hiện tại đang tiếp tục đóng vai. Trong demo này, `user` có thể chứa lời do model khác sinh ra; không bắt buộc người thật phải gõ lời đó.

Ví dụ, GPT vừa đề xuất “Nên dùng MongoDB”, Claude đáp “Hãy xem dữ liệu có nhiều quan hệ không”. Khi gọi GPT nói tiếp, lịch sử có thể được dựng như sau:

```json
[
  { "role": "system", "content": "Bạn là người đề xuất phương án kỹ thuật." },
  { "role": "assistant", "content": "Nên dùng MongoDB." },
  { "role": "user", "content": "Hãy xem dữ liệu có nhiều quan hệ không." }
]
```

Khi gọi Claude, lời GPT trở thành đầu vào phía đối thoại, còn lời Claude trước đó là lịch sử của chính assistant. Mỗi request phải dùng system prompt phù hợp với vai đang gọi.

### 7.3. Lịch sử ở đâu, và “trí nhớ” từ đâu ra?

Trong cách gọi Chat Completions của lab, ứng dụng lưu lịch sử và gửi lại ở mỗi lượt. Nếu chỉ gửi câu “Tại sao?” mà bỏ đoạn trước, model không tự biết bạn đang hỏi về điều gì.

Mã giả bên dưới thể hiện cơ chế, **không phải mã SDK chạy trực tiếp**:

```python
history = [{"speaker": "Claude", "text": "Chào bạn."}]

for round_index in range(5):
    for speaker in ["GPT", "Claude"]:
        messages = build_messages_for(speaker, history)
        reply = call_model(speaker, messages)
        history.append({"speaker": speaker, "text": reply})
```

- `history` do chương trình sở hữu và cập nhật.
- `build_messages_for` đổi vai theo model nhận request và thêm system prompt.
- `call_model` đại diện lời gọi API thích hợp.
- Năm vòng với hai model tạo **10 lượt gọi mới**, nếu không phát sinh retry.

Cách hiểu này áp dụng cho lab; không nên mở rộng thành kết luận rằng mọi API hội thoại đều buộc client tự quản lý lịch sử theo cùng một cách.

### 7.4. Ba người trò chuyện: ghi tên người nói trong ngữ cảnh

Khi có Alex, Blake và Charlie, hai role `user`/`assistant` không trực tiếp biểu diễn đủ ba danh tính. Giảng viên gợi ý đưa lịch sử thành văn bản có nhãn người nói, rồi yêu cầu model đóng đúng vai ở lượt tiếp theo.

Ví dụ prompt cho Alex:

```text
Vai của bạn: Alex, người đề xuất giải pháp.
Bạn đang trao đổi với Blake và Charlie.

Lịch sử hội thoại:
Alex: Tôi đề xuất dùng một mô hình nhỏ trước.
Blake: Tôi lo chất lượng giải thích sẽ không đủ.
Charlie: Chúng ta có thể đo trên một bộ câu hỏi cố định.

Hãy viết lượt tiếp theo của Alex. Chỉ viết lời của Alex.
```

Danh tính người nói nằm trong nội dung, còn `role` vẫn là cấu trúc API. Đây là một cách rõ ràng cho demo ba bên, không phải cách duy nhất hay lý do phải bỏ message history trong mọi ứng dụng phức tạp.

**Bổ sung / làm rõ:** tách quy tắc vai trò khỏi đoạn lịch sử được trích dẫn. Không coi mọi câu do model khác nói là chỉ thị hệ thống mới. Điều này giúp giữ đúng nhiệm vụ của từng bên.

### 7.5. Ứng dụng thực tế và giới hạn

Ví dụ phù hợp với việc học của bạn: một vai giải thích bài AI, một vai kiểm tra chỗ mơ hồ, một vai viết bản tóm tắt. Cả ba có thể là cùng model với prompt khác nhau, hoặc là các model khác nhau.

Phối hợp nhiều vai không tự bảo đảm kết quả đúng: chúng có thể lặp lại lỗi của nhau. Vai kiểm tra vẫn cần nguồn hoặc tiêu chí đánh giá đáng tin.

Khi lịch sử được gửi lại liên tục, input tăng theo lượt. Nếu mỗi lượt thêm lượng văn bản gần như nhau và luôn gửi toàn bộ, tổng input qua cả cuộc hội thoại có thể tăng gần theo bình phương số lượt. Cache có thể giúp chi phí nhưng không loại bỏ nhu cầu quản lý ngữ cảnh.

Vì vậy, đặt số vòng tối đa, giới hạn đầu ra và điều kiện dừng là một phần của thiết kế. Khi lịch sử dài, cần lựa chọn đoạn liên quan hoặc tóm tắt có kiểm soát.

**Kết quả cần đạt:** tự giải thích được ai lưu lịch sử, ai gọi model tiếp theo và vì sao cùng một lời nói có role khác nhau ở hai request.

## 8. Bài thực hành để kiểm tra bạn đã hiểu

Không cần đăng ký đủ mọi hãng. Với một model đã truy cập được, bạn vẫn làm được phần lớn các bước sau.

1. **Gọi một lần:** yêu cầu giải thích API trong ba câu. Xác định model, messages và văn bản trong response.
2. **Đổi một yếu tố:** đổi prompt hoặc mức reasoning được hỗ trợ, giữ phần còn lại để quan sát. Đừng đổi cả model lẫn prompt rồi kết luận nguyên nhân.
3. **Cấp ngữ cảnh:** đưa một đoạn bài học, yêu cầu trả lời dựa trên đoạn đó và nói rõ nếu thiếu thông tin. So sánh với lúc không gửi đoạn nguồn.
4. **Hai vai trao đổi:** cho vai “giải thích” và “hỏi lại chỗ khó” trao đổi hai vòng. In messages trước mỗi lần gọi và kiểm tra role.
5. **Đo:** ghi lại số request, input/output token, thời gian và chi phí ước tính nếu có. Xem phần nào tăng khi thêm lịch sử.

### Tự kiểm tra nhanh

| Câu hỏi | Câu trả lời cần nắm |
|---|---|
| Dùng thư viện OpenAI có luôn gọi model OpenAI không? | Không; còn tùy endpoint và khả năng tương thích. |
| Tăng reasoning có phải huấn luyện lại không? | Không; đó là điều chỉnh xử lý lúc suy luận. |
| LiteLLM kể chuyện cười hay hơn có nghĩa framework thông minh hơn không? | Không; model tạo nội dung, framework hỗ trợ lời gọi. |
| Hai model có tự nhớ lần trao đổi trước không? | Trong lab, chương trình gửi lại lịch sử để tạo tính liên tục. |
| Cache có khiến model học vĩnh viễn tài liệu không? | Không; đó là tái sử dụng tính toán đầu vào có điều kiện. |
| Vì sao thêm nhiều model chưa chắc tốt hơn? | Tăng chi phí và độ phức tạp, trong khi lỗi vẫn có thể lan truyền. |

## 9. Nguồn và phạm vi biên soạn

Nguồn chính là toàn bộ nội dung phụ đề tiếng Anh của 6 tệp đi kèm, tương ứng:

1. **001** — Connecting to Multiple Frontier Models with APIs (OpenAI, Claude, Gemini).
2. **002** — Testing GPT-5 Models with Reasoning Effort and Scaling Puzzles.
3. **003** — Testing Claude, GPT-5, Gemini & DeepSeek on Brain Teasers.
4. **004** — Local Models with Ollama, Native APIs, and OpenRouter Integration.
5. **005** — LangChain vs LiteLLM: Choosing the Right LLM Framework.
6. **006** — LLM vs LLM: Building Multi-Model Conversations with OpenAI & Claude.

Các ví dụ JSON, mã giả, liên hệ lập trình web và bài thực hành được biên soạn thêm để giải thích. Các kết quả thử model là kết quả giảng viên thuật lại trong video, không phải thử nghiệm mới. Phần tài liệu chính thức được dẫn ngay tại nội dung dùng để đối chiếu; không sử dụng giá hoặc tên model trong video như khuyến nghị hiện hành.
