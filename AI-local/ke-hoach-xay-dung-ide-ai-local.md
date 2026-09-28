# Lộ trình dùng LLM local từ Ollama trong VS Code

**Cập nhật:** 28/09/2026  
**Mục tiêu đã chốt:** dùng các model local có sẵn trong Ollama ngay bên trong VS Code để học và phát triển phần mềm. Tài liệu này thay cho lộ trình tự xây IDE/extension ở bản trước.

## 1. Trả lời ngắn gọn

Nếu bạn chỉ muốn chọn model Ollama trong VS Code để chat và hỗ trợ code, thì **không cần tự xây IDE hoặc tự viết extension**. VS Code và đội Ollama đã có đường tích hợp sẵn.

Bạn cũng **không cần train model trước khi dùng**. Tải model về, kết nối nó vào VS Code rồi sử dụng. Fine-tuning chỉ là bước tùy chọn về sau, nếu bạn có một vấn đề cụ thể mà prompt, project instructions và việc đưa đúng code vào context vẫn không giải quyết được.

## 2. Phân biệt các thành phần

| Thành phần | Làm nhiệm vụ gì? | Bạn cần làm gì? |
|---|---|---|
| Ollama | Tải và chạy model trên máy; cung cấp API local cho ứng dụng khác | Cài Ollama và để nó chạy |
| Model, ví dụ Qwen hoặc Gemma | Tạo câu trả lời, giải thích hoặc sinh code | Chọn model phù hợp phần cứng và tác vụ |
| VS Code | Editor nơi bạn đang viết code | Dùng Chat và model picker |
| Ollama for VS Code | Kết nối các model trong Ollama với Chat của VS Code | Cài extension chính thức nếu chưa có |
| Training/fine-tuning | Cập nhật trọng số model bằng một quy trình huấn luyện riêng | Chưa cần làm để bắt đầu dùng |

Model local là “bộ máy trả lời”. Ollama chạy bộ máy đó, còn VS Code cung cấp editor, chat và một số công cụ lập trình. Kết nối model vào VS Code không tự động huấn luyện model.

## 3. Cách thiết lập

### Điều kiện

Theo hướng dẫn hiện hành của Ollama, nên có:

- VS Code phiên bản 1.127 trở lên.
- Ollama đã cài và đang chạy.
- Ít nhất một model local đã được tải.
- Extension chính thức **Ollama for VS Code**.

Hướng dẫn Ollama khuyến nghị Ollama 0.17.6 trở lên cho metadata phong phú và một số chức năng cloud; các bản cũ hơn vẫn có thể dùng với model local. Hãy kiểm tra trang tích hợp nếu phiên bản của bạn khác.

### Các bước

1. Cập nhật VS Code và cài Ollama nếu máy chưa có.
2. Trong terminal, xem model đang có bằng lệnh **ollama list**.
3. Nếu chưa có model, tải một model có kích thước phù hợp bằng **ollama pull tên-model:tag**. Thay phần tên model bằng tag bạn đã chọn trong thư viện Ollama.
4. Cài extension **Ollama for VS Code** từ Marketplace. Kiểm tra publisher là Ollama.
5. Mở Chat trong VS Code.
6. Mở model picker ở dưới ô nhập chat và chọn model trong nhóm Ollama.
7. Thử trước bằng một việc nhỏ: yêu cầu giải thích file đang mở hoặc đoạn code bạn chọn.
8. Sau đó thử yêu cầu đọc một vài file và đề xuất thay đổi. Kiểm tra context và diff trước khi chấp nhận bất kỳ chỉnh sửa nào.

Extension chính thức tìm server Ollama tại **127.0.0.1:11434** theo mặc định. Model local không cần đăng nhập Ollama để chạy.

### Nếu model không hiện trong danh sách

- Kiểm tra Ollama đang chạy.
- Chạy **ollama list** để xác nhận model đã tải xong.
- Trong Command Palette, chạy **Ollama: Refresh Models**.
- Nếu vẫn chưa thấy, chạy **Ollama: Diagnose Models** và đọc Ollama output channel.
- Nếu đang dùng provider Ollama tích hợp cũ trong VS Code, lưu ý tài liệu VS Code hiện đánh dấu provider tích hợp đó là deprecated và khuyên dùng extension chính thức của Ollama.

## 4. VS Code làm được gì với model local?

| Việc cần làm | Khả năng và điều kiện |
|---|---|
| Chat, hỏi đáp, giải thích code | Có thể dùng model local qua Ollama |
| Dùng context từ code/project | Có thể đưa file, selection hoặc context mà giao diện chat cung cấp; model không tự biết toàn bộ repository nếu VS Code không gửi phần đó vào prompt |
| Agent gọi công cụ | Tùy model và chế độ. Model phải hỗ trợ tool calling; nếu không, có thể chỉ chat được hoặc không xuất hiện trong picker dành cho agent |
| Code completion inline | Không nên mặc định rằng completion của Copilot sẽ dùng model Ollama. BYOK trong VS Code hiện áp dụng cho chat và utility tasks; một số tính năng inline/embedding vẫn có điều kiện riêng |
| Semantic search trên cả repository | Có thể còn phụ thuộc vào tính năng VS Code/Copilot cụ thể; không đồng nghĩa với việc model Ollama tự index toàn bộ code |
| Hoạt động ngoại tuyến | Chat với model local có thể hoạt động không cần GitHub account, Copilot plan hoặc Internet sau khi đã cài và tải model; các dịch vụ cập nhật/Marketplace hoặc tính năng khác có thể vẫn cần mạng |

VS Code có thể dùng model BYOK cho chat và một số luồng agent; tuy nhiên khả năng tools, vision, reasoning và agent mode phụ thuộc model. Một số session trong Agents window vẫn được tài liệu đánh dấu experimental. Vì vậy, đừng chỉ kiểm tra model có trả lời chat hay không: hãy kiểm tra riêng khả năng gọi tool và làm việc với code context.

## 5. “Train model” khác gì với việc dùng model trong VS Code?

### A. Dùng model sẵn có — việc bạn cần làm bây giờ

Tải model từ Ollama và chọn model đó trong VS Code. Trọng số model không bị sửa.

### B. Điều chỉnh cách model trả lời — thường chưa phải training

Có thể thêm system instructions, điều chỉnh một số tham số, hoặc tạo một Modelfile để cấu hình model nền, system message, template và tham số chạy. Lệnh ollama create tạo một model cấu hình mới dựa trên model/weights có sẵn; việc này **không tự huấn luyện lại trọng số**.

Trong VS Code, bạn cũng có thể dùng project instructions để nêu quy tắc như:

- Dùng TypeScript và React theo convention hiện tại.
- Không sửa file ngoài phạm vi yêu cầu.
- Viết hoặc cập nhật test khi thay đổi behavior.
- Giải thích trade-off trước khi thay đổi kiến trúc.

### C. Đưa code project vào context hoặc RAG — không phải training

Nếu muốn model trả lời theo codebase hiện tại, hãy để VS Code/agent gửi đúng file, symbol, đoạn code hoặc kết quả tìm kiếm vào context. Nếu dự án lớn, có thể dùng indexing hoặc RAG local để tìm các đoạn liên quan. Đây là bước truy xuất dữ liệu lúc đặt câu hỏi; nó không cập nhật trọng số model.

Code thay đổi hàng ngày, vì vậy việc tìm và đưa code hiện tại vào context thường phù hợp hơn fine-tuning trên một bản code cũ.

### D. Fine-tuning — chỉ làm khi đã có lý do đo được

Fine-tuning thay đổi trọng số hoặc thêm adapter được huấn luyện trên bộ dữ liệu. Đây là quy trình riêng, thường cần chuẩn bị ví dụ đầu vào/đầu ra, framework huấn luyện, GPU/VRAM, đánh giá trước/sau và sau đó mới đóng gói hoặc import model để chạy bằng Ollama.

Fine-tuning có thể đáng thử khi bạn có nhiều ví dụ chất lượng về một quy trình ổn định và model liên tục làm sai cùng một kiểu việc. Nó không phải cách tốt để cập nhật kiến thức về từng file mới trong repo. Cũng không bảo đảm làm model giỏi lập trình hơn trên mọi nhiệm vụ.

**Ollama chủ yếu là runtime và công cụ quản lý/import model; Modelfile điều chỉnh cấu hình và instructions. Ollama không thay thế một pipeline fine-tuning.**

## 6. Lộ trình nên làm cho mục tiêu của bạn

### Giai đoạn 1 — Làm cho model local hoạt động trong VS Code

- Cài Ollama và extension chính thức.
- Tải một model vừa với bộ nhớ GPU chuyên dụng.
- Xác nhận model xuất hiện trong picker.
- Chạy các prompt đơn giản trên một project thử nghiệm.

**Kết quả cần có:** chat trong VS Code nhận được câu trả lời từ model local.

### Giai đoạn 2 — Đánh giá model cho việc lập trình

Tạo 10–15 nhiệm vụ tương tự công việc React/TypeScript của bạn:

- Giải thích component đang có.
- Tìm nơi gọi một API.
- Sửa một lỗi TypeScript đơn giản.
- Bổ sung test cho một function.
- Đề xuất thay đổi trên hai file liên quan.
- Đọc lỗi test và nêu nguyên nhân.

Ghi lại chất lượng, thời gian chờ, mức dùng VRAM, tool call thành công và số lần bạn phải sửa lại câu trả lời. Chọn model dựa trên các nhiệm vụ bạn thực sự làm.

### Giai đoạn 3 — Thử khả năng agent có quyền kiểm soát

- Bắt đầu bằng một repository thử hoặc branch riêng.
- Xác nhận model có hỗ trợ tool calling trong Ollama và có được VS Code nhận diện là model dùng cho agent hay không.
- Yêu cầu model tìm/đọc file trước, chưa cho phép sửa ngay.
- Khi thử sửa code, xem diff và duyệt thủ công.
- Nếu agent tự chạy lệnh, đọc lệnh và thư mục làm việc trước khi xác nhận.

### Giai đoạn 4 — Thêm context và project rules

- Cấu hình instructions ngắn, rõ ràng cho project.
- Đính kèm hoặc yêu cầu đọc file liên quan thay vì gửi cả repository.
- Loại trừ .env, key, credential, build output và file không cần thiết.
- Khi context của VS Code chưa đủ, tìm extension/provider hỗ trợ indexing local trước khi nghĩ tới việc tự xây RAG.

### Giai đoạn 5 — Chỉ xem xét fine-tuning sau đánh giá

Chỉ thử fine-tuning khi đã có bộ ví dụ tốt, đã kiểm tra prompt/instructions/context, và lỗi còn lại lặp lại theo một mẫu cụ thể. So sánh model trước/sau fine-tuning trên cùng bộ nhiệm vụ và giữ lại model gốc để đối chiếu.

## 7. Lưu ý phần cứng của bạn

Thông tin trước đây có hai cách ghi bộ nhớ GPU: 24 GB tổng/shared và RTX 2080 với 8 GB VRAM chuyên dụng cộng bộ nhớ chia sẻ. Với model local, con số quyết định chủ yếu là **VRAM chuyên dụng**, không phải tổng GPU-usable memory. Vì vậy:

- Kiểm tra Dedicated GPU Memory trong Windows Task Manager hoặc công cụ NVIDIA.
- Bắt đầu bằng model nhỏ, rồi đo VRAM/tốc độ trên máy thật.
- Đừng chọn model chỉ vì Ollama ghi context window rất lớn.
- Nếu model chạy một phần trên RAM thì vẫn có thể dùng, nhưng tốc độ có thể giảm rõ rệt.
- Tài liệu extension hiện gợi ý context dài cho một số luồng agent; trên GPU ít VRAM, phải thử theo giới hạn thực tế thay vì đặt context cao theo máy khác.

## 8. Quyết định cuối cho mục tiêu hiện tại

| Nhu cầu | Hướng làm |
|---|---|
| Chat với model local trong VS Code | Cài Ollama for VS Code và chọn model trong picker |
| Để AI hiểu code dự án | Cấp file/selection/context và cấu hình project instructions |
| Để AI sửa code | Dùng agent có tool calling; review diff trước khi apply |
| Tạo model Ollama có hành vi riêng | Bắt đầu với prompt/Modelfile/instructions, đây không phải training |
| Huấn luyện trọng số model | Chưa cần; chỉ làm sau khi có dữ liệu và vấn đề cụ thể |
| Xây IDE hoặc extension của riêng bạn | Không cần cho mục tiêu hiện tại; chỉ xem xét nếu tích hợp có sẵn thiếu một khả năng quan trọng bạn thực sự cần |

## 9. Việc nên làm ngay

1. Cài extension chính thức **Ollama for VS Code**.
2. Mở model picker trong Chat và xác nhận model local đã tải xuất hiện.
3. Hỏi model giải thích một file React/TypeScript đang mở.
4. Thử một yêu cầu có nhiều bước để kiểm tra tool calling/agent.
5. Ghi lại model nào chạy ổn với VRAM thực tế của bạn.
6. Chưa fine-tune model; trước tiên thử project instructions và context của codebase.

## 10. Tài liệu chính thức

- [AI language models in VS Code](https://code.visualstudio.com/docs/agent-customization/language-models) — BYOK, model picker, model provider và các giới hạn tính năng.
- [Understand language models in VS Code](https://code.visualstudio.com/docs/agents/concepts/language-models) — dùng model local, agent, offline và các khác biệt giữa model.
- [Ollama for VS Code](https://github.com/ollama/ollama-vscode) — extension chính thức của Ollama.
- [Ollama integration guide for VS Code](https://github.com/ollama/ollama/blob/main/docs/integrations/vscode.mdx) — yêu cầu cài đặt, model picker và xử lý model không hiện.
- [Ollama Modelfile reference](https://docs.ollama.com/modelfile) — model nền, system message, template và tham số chạy.
- [Importing a model into Ollama](https://docs.ollama.com/import) — import model weights đã có vào runtime Ollama.
- [Ollama streaming and tool calls](https://docs.ollama.com/capabilities/streaming) — stream response và luồng tool call.

