# Danh sách các Model AI trong VS Code Copilot (Language Models)

> Ghi chú: Nội dung dưới đây được tổng hợp từ bảng "Language Models" trong VS Code (chụp ngày 2026-09-20). Vì một số tên model (ví dụ GPT-5.4, GPT-5.6, Claude Sonnet 5, Gemini 3.8 Flash, Grok 4.6, Kimi K3...) là các phiên bản rất mới/tương lai so với dữ liệu huấn luyện của tôi, mô tả bên dưới dựa trên: (1) thông số hiển thị thực tế trong bảng (Context Size, Tools, Vision, chi phí), và (2) đặc điểm chung đã biết của từng dòng model (family) từ nhà cung cấp tương ứng. Khi cần độ chính xác tuyệt đối, hãy tham khảo tài liệu chính thức của nhà cung cấp tại thời điểm sử dụng.

---

## 1. Cách đọc bảng

| Cột | Ý nghĩa |
|---|---|
| **Context Size** | Số lượng token tối đa model có thể "nhớ" trong một lần trò chuyện (prompt + lịch sử + code liên quan). Context càng lớn thì càng xử lý tốt các tác vụ cần đọc nhiều file/tài liệu dài. |
| **Capabilities (Tools / Vision)** | `Tools`: model có thể gọi công cụ (function calling) — bắt buộc để agent mode hoạt động (đọc/sửa file, chạy lệnh...). `Vision`: model hiểu được hình ảnh (ảnh chụp màn hình, biểu đồ...). |
| **Cost (Credits per 1M Tokens)** | Chi phí quy đổi theo credit cho mỗi 1 triệu token đầu vào (In) và đầu ra (Out). Out thường đắt hơn In nhiều lần vì token sinh ra tốn nhiều tính toán hơn. |
| **⚠ (cảnh báo)** | Một số model có biểu tượng cảnh báo — thường là bản preview, sắp ngừng hỗ trợ, hoặc có giới hạn sử dụng. Nên rê chuột vào icon trong VS Code để xem chi tiết trước khi phụ thuộc vào các model này cho việc quan trọng. |

---

## 2. Nhóm Copilot (Cloud – trả phí theo credit)

### 2.1. Dòng GPT (OpenAI)

| Model | Context | Tools/Vision | Chi phí (In/Out) | Tối ưu cho việc gì |
|---|---|---|---|---|
| **GPT-5 mini** | 192K | ✅/✅ | 25 / 200 | Bản nhẹ, rẻ, phản hồi nhanh. Phù hợp cho các tác vụ đơn giản, lặp lại nhiều lần: hoàn thiện code ngắn, trả lời nhanh, autocomplete, chat thông thường không cần suy luận sâu. |
| **GPT-5.3-Codex** | 400K | ✅/✅ | 175 / ~1400 | Biến thể chuyên biệt cho **lập trình** (hậu tố "Codex"). Tối ưu cho: sinh code phức tạp, refactor lớn, hiểu codebase nhiều file, debug logic khó. Nên chọn khi làm việc chính là coding/agent sửa code. |
| **GPT-5.4** | 1M | ✅/✅ | 250 / ~1500 | Bản đầy đủ, context cực lớn (1M token). Tối ưu cho: reasoning phức tạp, phân tích tài liệu/codebase khổng lồ, tác vụ đa bước cần độ chính xác cao. Chi phí cao nhất nhóm GPT — dùng khi thực sự cần "sức mạnh tối đa". |
| **GPT-5.4 mini** | 400K | ✅/✅ | 75 / 450 | Bản rút gọn của GPT-5.4, cân bằng giữa chất lượng và chi phí. Phù hợp công việc hàng ngày: viết code vừa phải, giải thích, review PR nhỏ. |
| **GPT-5.6 Luna** | 1M | ✅/✅ | 20 / 120 | **Rẻ nhất trong toàn bộ danh sách** mà vẫn có context 1M. Tối ưu cho: tác vụ khối lượng lớn (batch), xử lý tài liệu dài với ngân sách hạn chế, các workflow tự động chạy nhiều lần. |
| **GPT-5.6 Terra** | 1M | ✅/✅ | 200 / ~1200 | Cùng dòng 5.6 nhưng thiên về chất lượng/hiệu năng cao hơn Luna, chấp nhận chi phí cao hơn. Phù hợp tác vụ quan trọng cần độ chính xác tốt hơn nhưng vẫn giữ context 1M. |

### 2.2. Dòng Claude (Anthropic)

| Model | Context | Tools/Vision | Chi phí (In/Out) | Tối ưu cho việc gì |
|---|---|---|---|---|
| **Claude Haiku 4.5** | 160K | ✅/✅ | 100 / 500 | Bản nhanh, nhẹ trong họ Claude. Tối ưu cho: trả lời nhanh, tác vụ real-time, chi phí thấp hơn Sonnet nhưng vẫn giữ chất lượng ổn cho các câu hỏi/coding đơn giản. |
| **Claude Sonnet 5** | 1M | ✅/✅ | 200 / ~1000 | Model cân bằng tốt nhất giữa tốc độ – chất lượng – chi phí trong họ Claude, nổi tiếng mạnh về **viết code sạch, tuân thủ hướng dẫn (instruction-following), viết văn bản kỹ thuật**. Context 1M giúp xử lý repo lớn. Là lựa chọn mặc định tốt cho hầu hết agent coding task. |

### 2.3. Dòng Gemini (Google) — họ "Flash"

| Model | Context | Tools/Vision | Chi phí (In/Out) | Tối ưu cho việc gì |
|---|---|---|---|---|
| **Gemini 3.5 Flash** ⚠ | 1M | ✅/✅ | 150 / 900 | Dòng Flash tối ưu tốc độ + đa phương thức, context 1M. Có cảnh báo ⚠ (có thể là bản preview/sắp thay thế). |
| **Gemini 3.6 Flash** ⚠ | 1M | ✅/✅ | 75 / 375 | Rẻ hơn 3.5 Flash đáng kể, cũng có cảnh báo ⚠. |
| **Gemini 3.7 Flash** | 1M | ✅/✅ | 75 / 375 | Không còn cảnh báo — ổn định hơn 3.5/3.6. Tối ưu cho: tác vụ cần tốc độ phản hồi nhanh + hiểu hình ảnh (đọc UI mockup, biểu đồ, ảnh lỗi) với chi phí thấp. |
| **Gemini 3.8 Flash** | 1M | ✅/✅ | 75 / 375 | Bản mới nhất dòng Flash, cùng mức giá 3.7. Nên ưu tiên bản này thay vì 3.5/3.6 vì ổn định hơn. Phù hợp: xử lý đa phương thức (ảnh + code + tài liệu dài) với chi phí thấp, tốc độ cao. |

> **Đặc trưng chung của họ Gemini Flash**: tối ưu cho tốc độ và chi phí thấp hơn là suy luận sâu, rất mạnh về xử lý đa phương thức (ảnh, tài liệu) nhờ context 1M đồng loạt.

### 2.4. Grok (xAI)

| Model | Context | Tools/Vision | Chi phí (In/Out) | Tối ưu cho việc gì |
|---|---|---|---|---|
| **Grok 4.5** | 553K | ✅/✅ | 200 / 600 | Tối ưu cho hội thoại tự nhiên, sáng tạo nội dung, và các câu hỏi cần dữ liệu/ngữ cảnh cập nhật (đặc trưng của xAI). Context lớn (553K) phù hợp đọc tài liệu vừa phải. |
| **Grok 4.6** | 553K | ✅/✅ | 200 / 600 | Bản kế tiếp 4.5, cùng thông số hiển thị — có thể cải thiện chất lượng suy luận/độ chính xác so với 4.5. |

### 2.5. Kimi (Moonshot AI)

| Model | Context | Tools/Vision | Chi phí (In/Out) | Tối ưu cho việc gì |
|---|---|---|---|---|
| **Kimi K2.7 Code** ⚠ | 256K | ✅/✅ | 95 / 400 | Biến thể chuyên **code** của Kimi (hậu tố "Code"). Có cảnh báo ⚠, nên kiểm tra trạng thái trước khi dùng cho task quan trọng. Tối ưu cho: sinh/sửa code với chi phí trung bình. |
| **Kimi K3** | 1M | ✅/✅ | 300 / ~1500 | Bản đầy đủ, context 1M — đắt nhất trong nhóm Kimi. Tối ưu cho: xử lý ngữ cảnh cực dài (đọc nhiều file/tài liệu lớn), tác vụ tổng hợp phức tạp. |

### 2.6. MAI-Code (Microsoft AI)

| Model | Context | Tools/Vision | Chi phí (In/Out) | Tối ưu cho việc gì |
|---|---|---|---|---|
| **MAI-Code-1.1-Flash** | 256K | ✅/✅ | 20 / 120 | Model code nội bộ của Microsoft, tối ưu tốc độ + chi phí cực thấp (ngang GPT-5.6 Luna). Tối ưu cho: hoàn thiện code nhanh, gợi ý inline, tác vụ coding lặp lại nhiều nhưng không quá phức tạp. |

---

## 3. Azure (Model tự cấu hình qua Azure OpenAI)

| Model | Context | Tools/Vision | Tối ưu cho việc gì |
|---|---|---|---|
| **(Deployment tùy chỉnh)** | 144K | ✅/✅ | Model được host và cấu hình riêng qua tài khoản Azure OpenAI của người dùng/tổ chức. Phù hợp khi công ty yêu cầu dữ liệu xử lý trong hạ tầng Azure riêng (compliance, bảo mật dữ liệu nội bộ) thay vì qua Copilot backend chung. |

---

## 4. Ollama (Deprecated – chạy local, miễn phí, riêng tư)

> Nhóm này chạy hoàn toàn trên máy của bạn (không tốn credit, không gửi dữ liệu ra ngoài), nhưng đã được đánh dấu **Deprecated** trong VS Code — nên cân nhắc migrate sang cách tích hợp model local mới hơn.

| Model | Context | Tools | Tối ưu cho việc gì |
|---|---|---|---|
| **deepseek-coder-v2:latest** | 164K | ❌ | Model chuyên **lập trình** của DeepSeek, mạnh về sinh code, giải thích code, hỗ trợ nhiều ngôn ngữ lập trình. Tốt cho coding local không cần Tools/agent. |
| **deepseek-r1:1.5b** | 131K | ✅ | Bản nhỏ (1.5 tỷ tham số) của dòng reasoning DeepSeek-R1, tối ưu cho suy luận từng bước (chain-of-thought) ở quy mô nhẹ, chạy được trên máy cấu hình vừa phải. |
| **gemma3:270m** | 33K | ❌ | Cực nhỏ (270 triệu tham số) của Google. Tối ưu cho: test nhanh, chạy trên máy yếu/không có GPU, tác vụ đơn giản (phân loại, trả lời ngắn), không phù hợp tác vụ phức tạp. |
| **gpt-oss:20b** | 131K | ✅ | Model mã nguồn mở phong cách GPT (20 tỷ tham số) của OpenAI, hỗ trợ Tools nên dùng được cho agent mode local. Tối ưu cho tác vụ tổng quát cần chạy offline. |
| **gpt-oss:latest** | 131K | ✅ | Phiên bản mới nhất của gpt-oss, tương tự bản 20b, cập nhật liên tục theo bản phát hành mới nhất. |
| **llama3.2:latest** | 131K | ✅ | Model của Meta, cân bằng tốt giữa hiệu năng và tốc độ khi chạy local. Tối ưu cho: trợ lý code, hội thoại tổng quát, có hỗ trợ Tools nên dùng được với agent mode. |
| **phi3:latest** | 131K | ❌ | Model nhỏ gọn của Microsoft, tối ưu cho hiệu năng/kích thước (small language model), phù hợp máy cấu hình hạn chế nhưng vẫn cần chất lượng suy luận khá. Không hỗ trợ Tools nên không dùng được cho agent mode. |
| **qwen:latest** | 33K | ❌ | Model của Alibaba, context nhỏ (33K), phù hợp cho các tác vụ ngắn, hội thoại đơn giản, không hỗ trợ Tools. |

---

## 5. Model có hiệu suất/ưu thế cao nhất theo từng tiêu chí

| Tiêu chí | Model nổi bật | Lý do |
|---|---|---|
| **Context dài nhất (1M token)** | Claude Sonnet 5, Gemini 3.5–3.8 Flash, GPT-5.4, GPT-5.6 Luna/Terra, Kimi K3 | Đọc/hiểu được toàn bộ codebase lớn hoặc tài liệu rất dài trong 1 lần. |
| **Lập trình (coding) tốt nhất** | GPT-5.3-Codex, Claude Sonnet 5, Kimi K2.7 Code, MAI-Code-1.1-Flash | Được thiết kế/tối ưu chuyên biệt cho code (hậu tố Codex/Code), hoặc nổi tiếng về chất lượng code sạch, đúng ý (Claude Sonnet). |
| **Rẻ nhất (tối ưu chi phí)** | GPT-5.6 Luna, MAI-Code-1.1-Flash (20/120) | Chi phí thấp nhất trong khi vẫn có Tools + Vision. |
| **Nhanh nhất / độ trễ thấp** | Gemini 3.7/3.8 Flash, Claude Haiku 4.5, GPT-5 mini | Thuộc các dòng "mini"/"Flash"/"Haiku" — được thiết kế ưu tiên tốc độ hơn là suy luận sâu. |
| **Đa phương thức (Vision) tốt nhất để đọc ảnh/UI** | Toàn bộ model Copilot cloud (đều có Vision) + model Azure | Riêng nhóm Ollama local hiện không có Vision. |
| **Chạy local/riêng tư, không tốn phí** | gpt-oss:20b, llama3.2:latest, deepseek-coder-v2:latest | Có Tools (trừ deepseek-coder-v2) và chạy hoàn toàn offline trên máy. |
| **Suy luận từng bước (reasoning) nhẹ, chạy local** | deepseek-r1:1.5b | Thuộc dòng "R1" chuyên về reasoning, dù chỉ 1.5B tham số. |
| **Context lớn nhất trong nhóm free/local** | deepseek-coder-v2:latest (164K) | Cao nhất trong các model Ollama hiện có. |

---

## 6. Gợi ý chọn model theo tình huống thực tế

- **Coding hàng ngày, cần agent sửa file/chạy lệnh (Tools bắt buộc)** → Claude Sonnet 5 hoặc GPT-5.3-Codex.
- **Task đơn giản, lặp lại nhiều, muốn tiết kiệm chi phí** → GPT-5 mini hoặc GPT-5.6 Luna.
- **Cần đọc/phân tích tài liệu hoặc repo rất lớn** → Bất kỳ model 1M context nào (Claude Sonnet 5, GPT-5.4, Gemini Flash 3.7/3.8, Kimi K3).
- **Cần hiểu ảnh chụp màn hình / thiết kế UI** → Gemini 3.7/3.8 Flash (rẻ, có Vision) hoặc Claude Sonnet 5.
- **Không muốn tốn credit, ưu tiên bảo mật dữ liệu (chạy offline)** → llama3.2:latest hoặc gpt-oss:20b (đều có Tools).
- **Máy yếu, chỉ cần tác vụ nhẹ** → gemma3:270m hoặc phi3:latest.
- **Yêu cầu tuân thủ hạ tầng doanh nghiệp (Azure)** → dùng model Azure đã cấu hình sẵn (144K, Tools + Vision).

---

*Lưu ý: Chi phí "Credits per 1M Tokens" và context size có thể thay đổi theo thời gian do nhà cung cấp cập nhật. Một số con số Output cost bị cắt trong ảnh chụp gốc (ví dụ "Out: 10...", "Out: 14...") nên được ước lượng gần đúng ("~") — hãy kiểm tra lại trực tiếp trong VS Code Language Models panel để có số chính xác.*
