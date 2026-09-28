# Các model trên trang Ollama Pricing: tính năng và khả năng

**Ngày đối chiếu:** 28/09/2026  
**Nguồn danh sách và giá:** [Ollama Pricing](https://ollama.com/pricing)

Tài liệu này mô tả **17 model/biến thể được liệt kê trong bảng giá Ollama Cloud** tại thời điểm đối chiếu. Phần tính năng dựa trên thẻ và phần giới thiệu model card công khai trên Ollama; các con số hiệu năng do bên phát triển model công bố nên có thể thay đổi theo phiên bản, thiết lập và bộ kiểm thử. Lưu ý: các dòng giá là giá khi gọi Cloud; chúng không khẳng định rằng mọi họ model đều không có bản local.

> “Toàn bộ chức năng” ở đây có nghĩa là toàn bộ nhóm khả năng được tài liệu công khai nêu rõ, kèm những việc thực tế có thể giao cho model. Model card không thể liệt kê mọi câu lệnh hay mọi trường hợp sử dụng; khả năng cũng không bảo đảm kết quả luôn chính xác.

## Cách đọc trang giá và thẻ model

Các model trong bảng giá là **model chạy trên Ollama Cloud**. Khi dùng bản cloud, prompt được xử lý trên hạ tầng từ xa và tính phí theo token. Việc một model có trọng số mở hoặc có thể tải bản local không biến lượt gọi bản cloud thành miễn phí. Ollama ghi rằng chạy model trên máy của mình không tính giới hạn usage cloud, nhưng tốc độ và khả năng chạy phụ thuộc phần cứng.

| Nhãn | Ý nghĩa thực tế |
|---|---|
| **cloud** | Có thể gọi qua dịch vụ Ollama Cloud. Bản cloud dùng tài nguyên máy chủ và tính theo mức giá của model. |
| **vision** | Nhận và phân tích hình ảnh cùng với văn bản. Không tự động đồng nghĩa với xử lý video hoặc tạo ảnh. |
| **tools** | Model có hỗ trợ cách gọi công cụ/hàm để một ứng dụng hoặc agent thực hiện bước tiếp theo. Model không tự có quyền truy cập trình duyệt, terminal, tệp hay API nếu ứng dụng không cấp công cụ đó. |
| **thinking** | Có chế độ suy luận hoặc mức độ suy luận. Cách bật và các mức hỗ trợ khác nhau giữa model; không nên hiểu là mọi model đều công khai toàn bộ suy nghĩ nội bộ. |
| **audio** | Có khả năng xử lý âm thanh ở biến thể được hỗ trợ. Không có nghĩa là model tạo giọng nói đầu ra. Với Gemma 4, khả năng audio được nêu cho một số bản nhỏ E2B/E4B, không nên mặc định cho bản cloud trong bảng giá. |
| **context** | Số token tối đa mà model có thể tiếp nhận trong một lượt/ngữ cảnh. Tổng này gồm lịch sử hội thoại, system prompt, tài liệu gửi vào và phần trả lời; không phải số từ thuần có thể đọc. |

### Giá cloud trên bảng Ollama

Đơn vị là **USD trên một triệu token**. “Input” là token gửi vào, “Cached input” là đầu vào được cache khi điều kiện cache áp dụng, “Output” là token model tạo ra. Giá có thể thay đổi; kiểm tra trang giá trước khi sử dụng thực tế.

| Model | Input | Cached input | Output |
|---|---:|---:|---:|
| DeepSeek-V4.1-Flash | $0.30 | $0.006 | $1.20 |
| DeepSeek-V4.1-Flash — off-peak | $0.15 | $0.003 | $0.60 |
| DeepSeek-V4-Pro | $1.32 | $0.044 | $3.96 |
| DeepSeek-V4-Pro — off-peak | $0.66 | $0.022 | $1.98 |
| Gemma 4 | $0.14 | $0.05 | $0.40 |
| GLM-5.3 | $1.40 | $0.26 | $4.40 |
| GLM-5.3-Flash | $0.15 | $0.03 | $0.50 |
| GLM-5.2 | $1.40 | $0.26 | $4.40 |
| GPT-OSS 120B | $0.15 | $0.014 | $0.60 |
| GPT-OSS 20B | $0.07 | $0.035 | $0.30 |
| Kimi K3 | $3.00 | $0.30 | $15.00 |
| Kimi K2.7 Code | $0.95 | $0.19 | $4.00 |
| Kimi K2.6 | $0.95 | $0.16 | $4.00 |
| MiniMax M3 | $0.60 | $0.12 | $2.40 |
| MiniMax M2.7 | $0.30 | $0.06 | $1.20 |
| Mistral Large 3 | $0.50 | Không nêu | $1.50 |
| NVIDIA Nemotron 3 Nano | $0.06 | Không nêu | $0.24 |
| NVIDIA Nemotron 3 Super | $0.015 | $0.015 | $0.60 |
| NVIDIA Nemotron 3 Ultra | $0.10 | $0.10 | $3.00 |

Trang giá ghi nhận mức off-peak cho hai model DeepSeek ở trên; điều kiện được nêu là ngoài các mốc 12:00 và 18:00 UTC trong ngày thường, và cả ngày cuối tuần. Hãy đối chiếu trực tiếp trang giá nếu cần tính chi phí chính xác theo thời điểm.


## Có tải được các model này về máy không?

**Giá trên trang Pricing áp dụng cho việc gọi model qua Ollama Cloud.** Điều đó không có nghĩa tất cả model cùng họ đều không có bản local. Một số họ có cả bản local và Cloud, nhưng đây là **các tag/biến thể riêng**: tag Cloud xử lý trên máy chủ và tính phí token; tag local tải trọng số về máy và không bị tính usage Cloud. Khả năng chạy local vẫn phụ thuộc dung lượng model, RAM/VRAM và thiết lập.

Tôi đã đối chiếu mục **Models** trên từng Ollama Library hiện hành:

| Model trong bảng giá | Có biến thể local trên Ollama? | Tag local được liệt kê trên Ollama | Phân biệt với Cloud |
|---|---|---|---|
| DeepSeek-V4.1-Flash | Không thấy | — | Library hiện liệt kê **deepseek-v4.1-flash:cloud**. |
| DeepSeek-V4-Pro | Không thấy | — | Library liệt kê **deepseek-v4-pro:cloud** và **deepseek-v4-pro:0813-cloud**. |
| Gemma 4 | Có | **gemma4:e2b**, **gemma4:e4b**, **gemma4:12b**, **gemma4:26b**, **gemma4:31b** | Các tag trên là bản tải local; **gemma4:cloud** / **gemma4:31b-cloud** là bản Cloud. |
| GLM-5.3 | Không thấy | — | Library hiện liệt kê **glm-5.3:cloud**. |
| GLM-5.3-Flash | Không thấy | — | Library hiện liệt kê **glm-5.3-flash:cloud**. |
| GLM-5.2 | Không thấy | — | Library hiện liệt kê **glm-5.2:cloud**. |
| GPT-OSS 120B | Có | **gpt-oss:120b** | Bản local được liệt kê khoảng 65 GB; tag Cloud riêng là **gpt-oss:120b-cloud**. |
| GPT-OSS 20B | Có | **gpt-oss:20b** | Bản local được liệt kê khoảng 14 GB; tag Cloud riêng là **gpt-oss:20b-cloud**. |
| Kimi K3 | Không thấy | — | Library hiện chỉ liệt kê **kimi-k3:cloud**. |
| Kimi K2.7 Code | Không thấy | — | Library hiện chỉ liệt kê **kimi-k2.7-code:cloud**; đây là model trong ảnh bạn gửi. |
| Kimi K2.6 | Không thấy | — | Library hiện chỉ liệt kê **kimi-k2.6:cloud**. |
| MiniMax M3 | Không thấy | — | Library hiện chỉ liệt kê **minimax-m3:cloud**. |
| MiniMax M2.7 | Không thấy | — | Library hiện chỉ liệt kê **minimax-m2.7:cloud**. |
| Mistral Large 3 | Không thấy | — | Library hiện chỉ liệt kê **mistral-large-3:675b-cloud**. |
| NVIDIA Nemotron 3 Nano | Có | **nemotron-3-nano:4b**, **nemotron-3-nano:30b** | Bản 4B được liệt kê khoảng 2.8 GB; bản 30B khoảng 24 GB. Cloud có tag **nemotron-3-nano:30b-cloud**. |
| NVIDIA Nemotron 3 Super | Có | **nemotron-3-super:120b** | Bản local được liệt kê khoảng 87 GB; Cloud có tag **nemotron-3-super:cloud**. |
| NVIDIA Nemotron 3 Ultra | Không thấy | — | Library hiện chỉ liệt kê **nemotron-3-ultra:cloud**. |

Như vậy, trong 17 dòng tính phí có **5 dòng** thuộc các họ model có biến thể local trên Ollama: Gemma 4, GPT-OSS 20B, GPT-OSS 120B, Nemotron 3 Nano và Nemotron 3 Super. Có **12 dòng** hiện không có tag local tương ứng trong Ollama Library. “Không thấy bản local” ở đây chỉ nói về các gói Ollama đang liệt kê; trọng số trên nguồn khác, nếu có, không tự động trở thành gói Ollama có thể tải bằng lệnh ollama run.

### Lệnh tải và chạy một số bản local

~~~sh
ollama run gemma4:e2b
ollama run gpt-oss:20b
ollama run nemotron-3-nano:4b
~~~

Lệnh ollama run sẽ tải model local nếu máy chưa có. Có thể kiểm tra các model local đã cài bằng ollama list. Với GPU VRAM 24 GB của bạn, nên thử Gemma 4 E2B hoặc Nemotron Nano 4B trước. GPT-OSS 20B có tệp model được Ollama liệt kê khoảng 14 GB, nhưng còn cần bộ nhớ cho runtime và context. Nemotron Nano 30B có tệp khoảng 24 GB và Nemotron Super 120B khoảng 87 GB, nên không nên kỳ vọng các bản đó nằm trọn trong 24 GB VRAM.

Trong ảnh, Ollama đề xuất **kimi-k2.7-code:cloud** vì Library hiện không liệt kê tag local Kimi K2.7 Code. Chọn **Yes** sẽ dùng Cloud; nếu muốn tránh Cloud, chọn **No** và chạy một tag local có sẵn như các ví dụ trên.


---

## 1. DeepSeek-V4.1-Flash

**Trang model:** [Ollama Library — deepseek-v4.1-flash](https://ollama.com/library/deepseek-v4.1-flash)  
**Thẻ:** vision, tools, thinking, cloud · **context được hiển thị:** 1 triệu token.

Đây là biến thể hướng tới tác vụ dài và agent với chi phí thấp hơn bản Pro. Model card mô tả nó là MoE đa phương thức, nhận văn bản và hình ảnh, hỗ trợ ngữ cảnh đến 1 triệu token. Trang nêu thiết kế Causal Encoder-Decoder và Compressed Sparse Attention 2 (CSA2): các lớp có thể tái sử dụng/chia sẻ thông tin attention và KV cache. Theo card, cách này giúp giảm lượng cache cho ngữ cảnh dài; số tham số hoạt động được nêu là 8B khi prefill và 16B khi decode.

**Có thể dùng để:**
- Đọc câu hỏi kèm ảnh, giao diện, sơ đồ hoặc tài liệu dạng hình.
- Phân tích kho mã lớn, yêu cầu nhiều bước, debug hoặc nghiên cứu dài.
- Làm việc trong coding agent có thể gọi công cụ; mức reasoning có thể điều chỉnh theo tích hợp.
- Tóm tắt/đối chiếu lượng tài liệu lớn trong giới hạn context.

**Lưu ý:** Cụm “search capabilities” trong phần giới thiệu không có nghĩa model tự truy cập Internet. Muốn tìm web phải cấp công cụ tìm kiếm cho ứng dụng/agent. Kích thước tham số trên đầu trang và trong phần readme của model card không hoàn toàn trùng nhau; thông số kiến trúc nên xem theo tài liệu kỹ thuật đi kèm.

## 2. DeepSeek-V4-Pro

**Trang model:** [Ollama Library — deepseek-v4-pro](https://ollama.com/library/deepseek-v4-pro)  
**Thẻ:** tools, thinking, cloud · **context:** 1 triệu token.

Bản Pro được định vị cho suy luận khó và công việc dài, dùng kiến trúc MoE. Ollama nêu khoảng 1.6T tham số tổng và 49B tham số được kích hoạt; trang hiển thị quy mô 1.65T. Điểm phân biệt lớn được công bố là ba chế độ suy luận:

- **No thinking:** trả lời nhanh, trực giác hơn.
- **Thinking:** dành thêm xử lý cho phân tích logic.
- **Max thinking:** ưu tiên chất lượng suy luận ở bài khó, thường đánh đổi thời gian/chi phí.

**Có thể dùng để:** phân tích yêu cầu phức tạp, lập kế hoạch kỹ thuật, giải bài toán nhiều ràng buộc, review thiết kế và chạy agent/coding workflow qua công cụ. Context 1M hữu ích khi cần giữ nhiều mã nguồn, tài liệu và lịch sử trong cùng ngữ cảnh.

**Lưu ý:** Trang model đánh dấu Text, không đánh dấu Vision; không nên chọn bản này để gửi ảnh. Đây là model đắt nhất trong bảng giá so với nhiều lựa chọn ở đây, đặc biệt ở token đầu ra.

## 3. Gemma 4

**Trang model:** [Ollama Library — gemma4](https://ollama.com/library/gemma4)  
**Thẻ họ model:** vision, tools, thinking, audio, cloud · **bản cloud trong danh sách model:** context 256K, Text/Image.

Gemma 4 của Google DeepMind là một họ model đa phương thức. Các bản được liệt kê gồm E2B, E4B, 12B, 26B MoE và 31B Dense. E2B/E4B là các bản edge nhỏ; chữ E có nghĩa “effective”, không phải embedding. Bản 26B là MoE với khoảng 4B tham số hoạt động; 31B là Dense. Các bản nhỏ được hướng đến chạy cục bộ trên máy cá nhân/thiết bị phù hợp.

**Khả năng được công bố:**
- Hiểu văn bản và ảnh; có thể xử lý ảnh nhiều tỷ lệ/kích thước. Tăng visual token budget giúp đọc chữ nhỏ/OCR tốt hơn nhưng tốn tính toán hơn.
- Suy luận có thể bật/tắt; hỗ trợ vai trò system prompt và function calling.
- Hỗ trợ coding, thao tác theo hướng agent và các tác vụ hỏi đáp đa phương thức.
- Riêng các biến thể E2B/E4B được liệt kê có đầu vào audio; trang card không mô tả chúng như bộ tạo giọng nói. Bản 26B/31B được ghi là Text/Image, không phải Audio.

**Có thể dùng để:** hỏi đáp trên ảnh/screenshot, đọc tài liệu hoặc bảng biểu, giải thích mã, tạo và sửa code, trợ lý cục bộ với bản nhỏ.

**Lưu ý quan trọng:** Nhãn audio ở trang họ Gemma không chứng minh rằng model Gemma 4 Cloud đang tính phí trên trang Pricing nhận audio. Trang model ghi cụ thể biến thể Cloud là Text/Image; hãy kiểm tra endpoint/tag bạn chọn trước khi gửi âm thanh. Các bản local có thể khác giá, context và phương thức vận hành so với bản cloud.

## 4. GLM-5.3

**Trang model:** [Ollama Library — glm-5.3](https://ollama.com/library/glm-5.3)  
**Thẻ:** tools, thinking, cloud · **context:** 1 triệu token.

GLM-5.3 của Z.ai là model flagship hướng mạnh vào lập trình và các tác vụ agent kéo dài. Model card nói bản này dùng cùng model nền với GLM-5.2 nhưng được cải thiện qua hậu huấn luyện, đặc biệt cho coding phức tạp và công việc cần nhiều bước. Trang nêu mức reasoning effort **low**, **high**, **max**; mặc định là max. Model được giới thiệu cho các coding agent như Claude Code, OpenCode, Hermes Agent và OpenClaw.

**Có thể dùng để:**
- Đọc yêu cầu, chia nhỏ việc và triển khai thay đổi trên codebase.
- Debug, viết test, refactor và tiếp tục nhiều vòng dựa trên kết quả công cụ.
- Phân tích repo lớn, nhờ context 1M.
- Làm agent workflow có gọi terminal hoặc công cụ khác thông qua môi trường tích hợp.

**Lưu ý:** Trang đánh dấu Text, không Vision. Các con số benchmark trong model card là kết quả do nhà phát triển công bố, không bảo đảm mọi repo/ngôn ngữ đều đạt cùng kết quả. Mức reasoning cao có thể dùng nhiều thời gian và token hơn.

## 5. GLM-5.3-Flash

**Trang model:** [Ollama Library — glm-5.3-flash](https://ollama.com/library/glm-5.3-flash)  
**Thẻ:** vision, tools, thinking, cloud · **context:** 1 triệu token.

Đây là lựa chọn Flash thiên về hiệu năng trên chi phí, đồng thời là model đa phương thức native đầu tiên trong dòng GLM-5 theo card Z.ai. Trang nêu 320B tham số tổng, 18B hoạt động. Nó nhận văn bản, hình ảnh và video; reasoning luôn bật nhưng có thể đặt effort **low**, **high** hoặc **max**. Card nhấn mạnh coding agent nhiều bước, context dài và dùng hình ảnh trong vòng lặp phát triển giao diện.

**Có thể dùng để:**
- Viết code frontend, xem screenshot/render rồi sửa giao diện theo phản hồi trực quan.
- Phân tích hình ảnh, tài liệu, bảng tính, slide, dashboard và giao diện.
- Nhận đầu vào video theo khả năng được model card công bố.
- Chạy coding agent, tool calling và các quy trình tự động nhiều bước.

**Lưu ý:** Dấu Vision/Video nói về khả năng nhận diện đầu vào; không đồng nghĩa model tự xuất video hoặc tự điều khiển máy tính. Muốn thao tác màn hình, click hay chạy lệnh thì ứng dụng phải cung cấp công cụ tương ứng. Đây là lựa chọn đáng thử cho front-end khi cần kết hợp code với hình ảnh đầu ra.

## 6. GLM-5.2

**Trang model:** [Ollama Library — glm-5.2](https://ollama.com/library/glm-5.2)  
**Thẻ:** tools, thinking, cloud · **context được hiển thị:** 976K token.

GLM-5.2 được mô tả là model của Z.ai cho các nhiệm vụ dài hạn. Tài liệu nhấn mạnh giữ chất lượng trong quá trình làm việc dài trên coding agent, xử lý yêu cầu kỹ thuật lớn, nghiên cứu tự động, tối ưu hiệu năng và debug phức tạp. Có thể chọn effort **High** hoặc **Max** để cân bằng năng lực suy luận với độ trễ/compute.

**Có thể dùng để:** hoàn thành tác vụ kỹ thuật nhiều giai đoạn, xử lý repo dài, theo dõi quy ước dự án xuyên suốt phiên, và dùng tool calling trong coding agent.

**Khác với GLM-5.3:** 5.3 là bản mới hơn trên trang giá, được card mô tả có cải thiện đáng kể ở coding phức tạp và benchmark agentic. 5.2 vẫn là lựa chọn cho context dài, nhưng không có nhãn Vision; không nên gửi ảnh như đầu vào chính. Giá cloud của hai bản trên trang hiện bằng nhau.

## 7. GPT-OSS 120B

**Trang model:** [Ollama Library — gpt-oss](https://ollama.com/library/gpt-oss)  
**Thẻ:** tools, thinking, cloud · **context:** 128K token.

GPT-OSS 120B là model trọng số mở của OpenAI, hướng đến reasoning, agentic task và công việc cho nhà phát triển. Bản cloud trong Ollama có hỗ trợ gọi hàm/công cụ, structured outputs, mức reasoning **low/medium/high**, và tích hợp Python tool hoặc web search nếu ứng dụng bật/cấp các công cụ đó. Trang model nêu giấy phép Apache 2.0 cho họ model.

**Có thể dùng để:** hỏi đáp và suy luận, sinh/giải thích code, trả về dữ liệu JSON có cấu trúc, hoặc làm agent dùng công cụ. Context 128K đủ cho nhiều tác vụ lập trình/tài liệu cỡ vừa.

**Lưu ý:** Đây là bản 120B, lớn hơn và thường nhắm đến năng lực cao hơn bản 20B; nhưng bảng giá cloud không cho biết một benchmark nào quyết định chính xác khi nào nó tốt hơn. Trang Library cũng có biến thể local 120B, nhưng bản local và bản cloud khác cách cấp tài nguyên và chi phí.

## 8. GPT-OSS 20B

**Trang model:** [Ollama Library — gpt-oss](https://ollama.com/library/gpt-oss)  
**Thẻ:** tools, thinking, cloud · **context:** 128K token.

Bản 20B dùng cùng nhóm chức năng của GPT-OSS nhưng được hướng đến độ trễ thấp hơn, vận hành local hoặc use case chuyên biệt. Tài liệu Ollama mô tả khả năng function calling, structured output, điều chỉnh reasoning effort và dùng công cụ Python/web nếu runtime cung cấp. Bản local được đóng gói bằng định dạng MXFP4; trang Ollama nêu dung lượng khoảng 14GB cho bản local 20B, còn giá bảng này là giá gọi bản cloud.

**Có thể dùng để:** trợ lý code, giải thích kiến thức, xử lý văn bản, tạo đầu ra JSON và agent tác vụ vừa; phù hợp hơn nếu cần thử họ model với mức chi phí thấp hơn bản 120B.

**Lưu ý:** “20B” là quy mô model, không phải số token hoặc dung lượng context. Bản Cloud ở đây vẫn được tính theo token; việc model có thể tải local không làm lượt cloud thành miễn phí.

## 9. Kimi K3

**Trang model:** [Ollama Library — kimi-k3](https://ollama.com/library/kimi-k3)  
**Thẻ:** vision, tools, thinking, cloud · **context:** 1 triệu token.

Kimi K3 của Moonshot AI là model trọng số mở, đa phương thức và hướng agent. Ollama mô tả khoảng 2.8T tham số, kiến trúc Kimi Delta Attention (KDA), Attention Residuals và MoE thưa. Model nhận văn bản, ảnh và video trong cùng họ model, với cửa sổ ngữ cảnh 1M.

**Có thể dùng để:**
- Coding kéo dài trên repo lớn và điều phối terminal tools trong agent.
- Nghiên cứu/knowledge work, tổng hợp nhiều tài liệu và tạo báo cáo.
- Tạo nội dung có hình ảnh, dashboard, widget hoặc visualization tương tác khi runtime hỗ trợ đầu ra đó.
- Hiểu ảnh/video và kết hợp thông tin hình ảnh với ngữ cảnh văn bản dài.

**Lưu ý:** Tài liệu đề cập cả motion design và video editing như ứng dụng/khả năng agent; điều đó không đồng nghĩa endpoint chat đơn lẻ tự xuất video hoàn chỉnh. Trọng số được công bố theo Kimi K3 License; “trọng số mở” không có nghĩa mọi điều kiện sử dụng đều giống Apache/MIT.

## 10. Kimi K2.7 Code

**Trang model:** [Ollama Library — kimi-k2.7-code](https://ollama.com/library/kimi-k2.7-code)  
**Thẻ:** vision, tools, thinking, cloud · **context:** 256K token.

Kimi K2.7 Code là model coding agent dựa trên Kimi K2.6, được tối ưu cho kỹ thuật phần mềm đầu-cuối. Model card nêu hơn 10 ngôn ngữ và nhiều lớp công việc: backend, hạ tầng, hiệu năng, hệ thống, bảo mật, frontend, ML/data engineering. Nó nhận ảnh và video qua bộ mã hóa MoonViT, hỗ trợ MCP và gọi công cụ nhiều bước. Theo card, lượng thinking token giảm khoảng 30% so với K2.6 trong khi khả năng hoàn thành task được cải thiện.

**Có thể dùng để:** thực hiện feature qua nhiều file, debug, review/viết test, thay đổi giao diện dựa trên ảnh, phối hợp agent với MCP server và xử lý phiên coding dài hơn context thông thường.

**Lưu ý:** Mức cải thiện 30% là so sánh được nhà phát triển công bố, không phải đảm bảo mọi prompt giảm đúng tỷ lệ đó. Model thiên coding hơn trợ lý đa năng; không có nhãn audio.

## 11. Kimi K2.6

**Trang model:** [Ollama Library — kimi-k2.6](https://ollama.com/library/kimi-k2.6)  
**Thẻ:** vision, tools, thinking, cloud · **context:** 256K token.

Kimi K2.6 là model đa phương thức hướng agent, nổi bật ở coding dài hạn, thiết kế dựa trên code, tự động thực thi và điều phối nhóm agent. Nó nhận ảnh cùng văn bản. Card nói model có thể biến prompt hoặc hình ảnh tham khảo thành giao diện, bố cục, thành phần tương tác và animation; đồng thời chia tác vụ lớn thành các nhiệm vụ con chuyên biệt.

**Có thể dùng để:**
- Tạo hoặc chỉnh giao diện từ mô tả và ảnh tham khảo.
- Làm công việc nhiều bước trên frontend, DevOps, Rust, Go, Python và tối ưu hiệu năng.
- Phối hợp agent/tool để tạo ra sản phẩm gồm tài liệu, website hoặc bảng tính.
- Dùng cho các quy trình chạy nền nếu ứng dụng phía ngoài quản lý lịch và quyền truy cập.

**Giới hạn cần hiểu:** Con số “300 sub-agents / 4,000 coordinated steps” là mức được card Moonshot nêu cho hệ thống swarm, không có nghĩa một lượt gọi Ollama tự sinh và quản lý hàng trăm agent nếu bạn chưa cấu hình agent harness. K2.7 Code kế thừa hướng coding nhưng chuyên biệt và mới hơn cho code.

## 12. MiniMax M3

**Trang model:** [Ollama Library — minimax-m3](https://ollama.com/library/minimax-m3)  
**Thẻ:** vision, tools, thinking, cloud · **context trên đầu trang:** 512K token.

MiniMax M3 nhắm vào coding, agentic task và đa phương thức. Model card nêu kiến trúc MiniMax Sparse Attention (MSA), hỗ trợ ngữ cảnh tối đa 1M và mức tối thiểu bảo đảm 512K trong hạ tầng của họ; trang model cụ thể của Ollama hiển thị 512K. Card mô tả native multimodal, công cụ, suy luận nhiều bước, chia nhỏ task tự động, và khả năng xử lý tác vụ dài/video dài. Tài liệu còn công bố năng lực duyệt web/tìm thông tin, nhưng việc truy cập web thực tế cần tool search được cấp cho agent.

**Có thể dùng để:** coding agent, nghiên cứu web có công cụ, xử lý tài liệu hình ảnh, các tác vụ dài đòi hỏi nhiều bước và truy vấn nội dung video nếu tích hợp hỗ trợ.

**Lưu ý:** Ollama page hiển thị 512K trong phần thông số, trong khi readme quảng bá hỗ trợ tới 1M. Hãy dùng mức hiển thị của endpoint đang chọn làm căn cứ an toàn; đừng mặc định mọi lời gọi M3 trên mọi hạ tầng nhận đủ 1M.

## 13. MiniMax M2.7

**Trang model:** [Ollama Library — minimax-m2.7](https://ollama.com/library/minimax-m2.7)  
**Thẻ:** tools, thinking, cloud · **context:** 200K token.

M2.7 tập trung vào lập trình chuyên nghiệp, agent workflow và năng suất công việc. Model card nêu khả năng xây agent harness, phối hợp Agent Teams, dùng Skills phức tạp và tìm công cụ linh hoạt. Ngoài coding đầu-cuối, tài liệu mô tả phân tích log, xử lý lỗi, bảo mật code, tác vụ ML, và sửa nhiều vòng trên Excel/PowerPoint/Word thông qua môi trường công cụ.

**Có thể dùng để:**
- Xây tính năng và xử lý lỗi thực tế trên dự án phần mềm.
- Tạo quy trình công việc tự động có nhiều kỹ năng và công cụ.
- Tóm tắt, chỉnh sửa hoặc chuyển đổi nội dung tài liệu văn phòng khi có connector/tool phù hợp.
- Làm trợ lý hội thoại có tính nhất quán nhân vật trong ứng dụng tương tác.

**Lưu ý:** Model có thể tạo/chỉnh nội dung cho tài liệu nhưng không tự mở Microsoft Office hay sửa tệp của bạn nếu chưa được ứng dụng cấp công cụ đọc/ghi. Đây là bản Text theo trang Ollama; không nên chọn nếu yêu cầu đầu vào chính là ảnh.

## 14. Mistral Large 3

**Trang model:** [Ollama Library — mistral-large-3](https://ollama.com/library/mistral-large-3)  
**Thẻ:** vision, tools, cloud · **context:** 256K token.

Mistral Large 3 là model đa dụng MoE hướng đến production và nhu cầu doanh nghiệp. Nó nhận hình ảnh và văn bản, có khả năng đa ngôn ngữ (card nêu hàng chục ngôn ngữ, gồm Anh, Pháp, Tây Ban Nha, Đức, Ý, Bồ Đào Nha, Hà Lan, Trung, Nhật, Hàn và Ả Rập). Ollama nêu khả năng tuân thủ system prompt, function calling native và trả JSON. Giấy phép được model card ghi là Apache 2.0.

**Có thể dùng để:** chatbot và trợ lý nội bộ, hỏi đáp trên ảnh/tài liệu, xử lý đa ngôn ngữ, phân loại/trích xuất dữ liệu, API cần đầu ra JSON, hoặc tích hợp công cụ trong hệ thống doanh nghiệp.

**Lưu ý:** Trang này không gắn nhãn Thinking; điều đó không có nghĩa model không thể phân tích, chỉ là trang không quảng bá một chế độ thinking điều khiển riêng như vài model khác. Bảng giá không nêu cached-input rate.

## 15. NVIDIA Nemotron 3 Nano

**Trang model:** [Ollama Library — nemotron-3-nano](https://ollama.com/library/nemotron-3-nano)  
**Thẻ:** tools, thinking, cloud · **họ model có bản:** 4B và 30B; biến thể Cloud được trang Library liệt kê có context 1M.

Nemotron 3 Nano của NVIDIA được thiết kế thành model gọn, hiệu quả cho agent chuyên biệt. Họ model có bản 4B và 30B; trang mô tả bản 30B gồm khoảng 3.5B active parameters, kiến trúc kết hợp Mamba-2, Mixture-of-Experts và attention. Model xử lý được câu hỏi thông thường và bài cần reasoning; có thể cấu hình sinh reasoning trace trước câu trả lời cuối hoặc bỏ bước đó để phản hồi gọn hơn.

**Có thể dùng để:** tác vụ agent nhẹ/chi phí thấp, hỏi đáp, phân loại, trích xuất và automation có tool; bản nhỏ phù hợp thử chạy local nếu máy đáp ứng. Trang ghi ngôn ngữ hỗ trợ gồm Anh, Đức, Tây Ban Nha, Pháp, Ý và Nhật.

**Lưu ý:** Danh sách ngôn ngữ trong card không nêu tiếng Việt; chất lượng tiếng Việt cần tự thử. Bảng giá là cho Cloud, còn 4B/30B local là các biến thể riêng có yêu cầu phần cứng và cách chạy khác. Trang ghi NVIDIA Open Model License, nên đọc điều khoản đó trước khi đưa bản tải về vào sản phẩm.

## 16. NVIDIA Nemotron 3 Super

**Trang model:** [Ollama Library — nemotron-3-super](https://ollama.com/library/nemotron-3-super)  
**Thẻ:** tools, thinking, cloud · **context trên trang:** 256K token.

Nemotron 3 Super là model 120B theo MoE, trong đó khoảng 12B tham số hoạt động. NVIDIA định vị model cho năng lực agentic, reasoning và hội thoại, đặc biệt cho ứng dụng nhiều agent, workload lớn và tự động hóa IT ticket. Model tạo reasoning trace trước câu trả lời và cho phép cấu hình hành vi này. Card ghi các ngôn ngữ hỗ trợ gồm Anh, Pháp, Đức, Ý, Nhật, Tây Ban Nha và Trung.

**Có thể dùng để:** phân luồng/yêu cầu hỗ trợ, tự động hóa ticket, trả lời hội thoại và phối hợp agent qua tool calling; xử lý các tác vụ cần reasoning nhưng có lượng yêu cầu lớn.

**Lưu ý:** Dù tổng quy mô 120B, số tham số được kích hoạt mỗi token thấp hơn nhờ MoE; đây không phải bằng chứng rằng model tự động chạy nhanh trên mọi hạ tầng. Trang Library liệt kê context 256K và nói model sẵn sàng cho sử dụng thương mại; hãy xem license/model card gốc để xác nhận điều kiện triển khai cụ thể.

## 17. NVIDIA Nemotron 3 Ultra

**Trang model:** [Ollama Library — nemotron-3-ultra](https://ollama.com/library/nemotron-3-ultra)  
**Thẻ:** tools, thinking, cloud · **context hiển thị ở đầu trang:** 256K token.

Nemotron 3 Ultra được thiết kế cho reasoning thông lượng cao và agent chạy lâu. Model card nêu 550B tham số tổng, khoảng 55B hoạt động; tối ưu NVFP4, định dạng floating point 4-bit của NVIDIA. Tài liệu nhấn mạnh điều phối agent, coding agent, deep research, quy trình doanh nghiệp phức tạp và nhiều lượt gọi công cụ.

**Có thể dùng để:** nghiên cứu dài, xử lý codebase lớn, tác vụ doanh nghiệp kéo dài qua nhiều giai đoạn và agent cần gọi tool nhiều lần.

**Chênh lệch context cần lưu ý:** đầu trang Ollama hiển thị 256K, nhưng readme cùng trang nói tới context 1M. Để tránh vượt giới hạn khi tích hợp, hãy coi thông số endpoint đang dùng là quyết định và xác nhận bằng tài liệu/API hiện hành trước khi gửi 1M token.

---

## Chọn model nhanh theo công việc

| Nhu cầu chính | Các lựa chọn nên thử trước | Vì sao |
|---|---|---|
| Coding agent và repo lớn | GLM-5.3, DeepSeek-V4.1-Flash, Kimi K2.7 Code | Được giới thiệu rõ cho lập trình nhiều bước/context dài; Kimi K2.7 Code chuyên code. |
| Frontend cần đọc screenshot hoặc hình ảnh/video | GLM-5.3-Flash, Kimi K2.7 Code, Gemma 4, Mistral Large 3 | Có khả năng nhận hình ảnh; GLM Flash và Kimi có mô tả rõ hơn về vòng lặp code/visual. |
| Suy luận khó, context dài | DeepSeek-V4-Pro, GLM-5.3, GLM-5.2 | Có chế độ reasoning hoặc được nhắm đến tác vụ dài; so sánh chi phí đầu ra trước. |
| Dùng công cụ, function calling, agent | GPT-OSS, GLM-5.3-Flash, MiniMax M2.7, Nemotron Super | Model card nêu tool/function/agent workflow. Công cụ thực vẫn phải do app cung cấp. |
| Đa ngôn ngữ và API JSON | Mistral Large 3 | Card nêu nhiều ngôn ngữ, system prompt, function calling và JSON. |
| Đầu vào âm thanh hoặc chạy gọn tại biên | Gemma 4 E2B/E4B | Trang Gemma nêu hỗ trợ audio cho hai biến thể nhỏ; xác minh đúng biến thể trước khi chọn. |
| Nghiên cứu và kiến thức đa phương thức | Kimi K3, MiniMax M3 | Có mô tả về multimodal, context dài và agentic knowledge work. |
| Ưu tiên mức phí thấp trên trang này | Nemotron Nano, GPT-OSS 20B, GLM-5.3-Flash | Mức giá cloud thấp hơn nhiều model khác trong bảng; năng lực phù hợp vẫn tùy bài toán. |

## Một số điểm không nên hiểu nhầm

1. **Context lớn không bảo đảm model nhớ mọi thứ chính xác.** Tài liệu dài làm tăng token và chi phí; cần kiểm tra chất lượng truy xuất/đối chiếu.
2. **Thẻ Tools không phải quyền truy cập sẵn có.** Model có thể phát ra yêu cầu gọi hàm; ứng dụng phải chạy hàm đó, kiểm tra quyền và trả kết quả về.
3. **Vision, audio, video và generation là các năng lực khác nhau.** Nhận ảnh không đồng nghĩa tạo ảnh; nhận video không đồng nghĩa tạo video; xử lý audio không đồng nghĩa tổng hợp giọng nói.
4. **Cloud và local là hai cách sử dụng khác nhau.** Giá trong bảng áp dụng cho token Cloud. Bản local cần tải model, RAM/VRAM phù hợp và có thể có lượng tử hóa/giới hạn context khác.
5. **Giá cached input không áp dụng cho mọi token đầu vào.** Nó phụ thuộc cơ chế và điều kiện cache của dịch vụ.
6. **Benchmark không thay thế thử nghiệm bằng tác vụ thật.** Nên đưa cùng một yêu cầu thực tế cho vài model, chấm độ chính xác, số lần sửa, độ trễ và tổng token trước khi chọn model cho ứng dụng.

## Nguồn tham khảo

- [Bảng giá và FAQ của Ollama](https://ollama.com/pricing)
- [DeepSeek-V4.1-Flash](https://ollama.com/library/deepseek-v4.1-flash)
- [DeepSeek-V4-Pro](https://ollama.com/library/deepseek-v4-pro)
- [Gemma 4](https://ollama.com/library/gemma4)
- [GLM-5.3](https://ollama.com/library/glm-5.3)
- [GLM-5.3-Flash](https://ollama.com/library/glm-5.3-flash)
- [GLM-5.2](https://ollama.com/library/glm-5.2)
- [GPT-OSS](https://ollama.com/library/gpt-oss)
- [Kimi K3](https://ollama.com/library/kimi-k3)
- [Kimi K2.7 Code](https://ollama.com/library/kimi-k2.7-code)
- [Kimi K2.6](https://ollama.com/library/kimi-k2.6)
- [MiniMax M3](https://ollama.com/library/minimax-m3)
- [MiniMax M2.7](https://ollama.com/library/minimax-m2.7)
- [Mistral Large 3](https://ollama.com/library/mistral-large-3)
- [Nemotron 3 Nano](https://ollama.com/library/nemotron-3-nano)
- [Nemotron 3 Super](https://ollama.com/library/nemotron-3-super)
- [Nemotron 3 Ultra](https://ollama.com/library/nemotron-3-ultra)

