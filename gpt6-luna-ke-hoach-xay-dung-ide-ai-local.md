# Kế hoạch xây dựng IDE hỗ trợ lập trình bằng AI local

**Ngày lập:** 28/09/2026  
**Mục tiêu:** Tạo một trợ lý lập trình chạy model trên máy cá nhân, có thể hiểu codebase, đề xuất sửa code, chạy kiểm tra có kiểm soát và hỗ trợ phát triển sản phẩm ngay trong IDE.

## 1. Có làm được không?

**Có.** Bạn có thể xây dựng một sản phẩm có quy trình làm việc tương tự các coding agent như Codex, Claude Code hoặc Cursor: người dùng mô tả việc cần làm, agent đọc code liên quan, đề xuất patch, người dùng xem diff, chấp nhận thay đổi rồi chạy test.

Điều cần xây là một ứng dụng bao quanh **model có sẵn**, chứ không phải tự huấn luyện một mô hình nền tảng như ChatGPT từ đầu. Sản phẩm gồm ba phần:

1. **Giao diện IDE:** nơi nhập yêu cầu, xem hoạt động của AI, duyệt diff và quản lý cuộc trò chuyện.
2. **Agent runtime:** chọn ngữ cảnh, gọi model, kiểm tra yêu cầu dùng công cụ, thực hiện tìm kiếm/đọc/sửa file và trả kết quả lại cho model.
3. **Model runtime local:** tải và chạy model trên máy, ví dụ Ollama. Phần suy luận có thể hoạt động ngoại tuyến sau khi đã tải runtime và model.

Việc chạy model local không tự động có nghĩa là mọi tính năng đều ngoại tuyến. Tìm kiếm web, cập nhật ứng dụng, tải model và một số MCP server có thể kết nối Internet. Phiên bản đầu nên tắt kết nối ngoài theo mặc định và chỉ bật các tính năng cần mạng khi người dùng chủ động yêu cầu.

Bạn có nền tảng React/TypeScript, Next.js và Node.js, vì vậy có thể xây phần sản phẩm bằng TypeScript. Không cần bắt đầu bằng Python, machine learning hay fine-tuning.

## 2. Hướng triển khai phù hợp nhất

### Khuyến nghị: làm extension cho VS Code trước

Không nên viết toàn bộ IDE ngay từ đầu. Hãy làm **VS Code extension có sidebar AI** trước. Extension tận dụng trình soạn thảo, cây file, Git, terminal và giao diện diff sẵn có. VS Code hỗ trợ extension thêm view, command, webview và giao diện chat; điều đó giúp bạn tập trung thời gian vào agent và model thay vì tự xây lại cả editor.

Giai đoạn đầu có thể dùng:

- **Giao diện:** VS Code extension với sidebar và React webview.
- **Agent:** TypeScript chạy trong extension host của VS Code.
- **Model runtime:** Ollama trên máy người dùng.
- **Kết nối model:** API local của Ollama qua HTTP, có streaming và tool calling tùy model.
- **Lưu hội thoại/cấu hình:** SQLite hoặc JSON cục bộ. SQLite phù hợp ứng dụng một người dùng vì không cần chạy dịch vụ cơ sở dữ liệu riêng.
- **Tìm code:** VS Code workspace API và ripgrep; bổ sung phân tích symbol sau khi luồng cơ bản chạy tốt.
- **Kiểm thử:** Vitest cho logic thuần TypeScript; kiểm thử extension trong VS Code test host.

Bạn đã quen MongoDB. Có thể dùng MongoDB local nếu muốn tận dụng kiến thức đó cho một bản nâng cấp cần truy vấn phức tạp; tuy nhiên, bản extension cá nhân ban đầu thường đơn giản hơn nếu dùng SQLite và không cần cài thêm một database server. Chưa cần vector database.

### Khi nào mới làm ứng dụng desktop riêng?

Sau khi extension đã chứng minh được agent loop và công cụ ổn định, bạn có thể tái sử dụng agent core để làm ứng dụng riêng:

- **Electron + React:** giữ gần như toàn bộ hệ sinh thái Node.js/TypeScript; đổi lại ứng dụng thường nặng hơn.
- **Tauri + React:** gọn hơn, nhưng cần cầu nối Rust hoặc một tiến trình Node sidecar cho agent core.
- **IDE riêng dựa trên editor có sẵn:** cần xử lý thêm terminal, Git, language server, debug, cập nhật và phân phối extension.

VS Code extension trước, desktop shell sau là lộ trình giảm rủi ro. Nếu làm IDE riêng ngay, công việc sẽ chuyển nhiều sang xây editor và hệ thống đóng gói thay vì cải thiện AI coding agent.

Bạn có thể học hỏi cách các sản phẩm này tổ chức luồng chat, thao tác file và duyệt diff, nhưng nên tự thiết kế giao diện, tên gọi và nhận diện sản phẩm thay vì sao chép thương hiệu hoặc giao diện độc quyền.

## 3. Kết quả nên nhắm tới ở phiên bản đầu

### MVP: một trợ lý code local có thể được tin cậy

MVP nên làm được những việc sau:

1. Hiển thị một cửa sổ chat trong sidebar VS Code.
2. Kết nối tới Ollama ở địa chỉ local và cho người dùng chọn model đã tải.
3. Hiển thị nội dung model theo dạng streaming, có nút dừng và báo lỗi kết nối rõ ràng.
4. Nhận ngữ cảnh từ file đang mở, đoạn code được chọn và các file người dùng đính kèm.
5. Tìm file hoặc đoạn code liên quan trong workspace theo yêu cầu.
6. Giải thích code, đề xuất cách sửa và tạo patch.
7. Trình bày diff để người dùng xem, chấp nhận hoặc từ chối trước khi ghi file.
8. Có cách loại trừ file/thư mục nhạy cảm khỏi ngữ cảnh.
9. Lưu hội thoại cục bộ và khôi phục sau khi đóng VS Code.
10. Không gửi source code ra ngoài máy trong chế độ local-only.

### Chưa đưa vào MVP

Để tránh phạm vi quá lớn, chưa làm các mục sau trong phiên bản đầu:

- Tự huấn luyện hoặc fine-tune model.
- Agent tự chạy lệnh shell không cần người dùng duyệt.
- Nhiều agent cùng sửa code.
- Vector database và RAG phức tạp.
- Đăng nhập, đồng bộ cloud, tài khoản người dùng hoặc backend dịch vụ.
- Marketplace cho MCP và plugin bên thứ ba.
- Hỗ trợ nhiều IDE cùng lúc.
- Tự cập nhật hoặc tìm kiếm Internet ngầm.

### Phiên bản kế tiếp

Sau MVP, bổ sung theo thứ tự giá trị:

1. Cho phép chạy lệnh/test sau khi người dùng duyệt chính xác lệnh và thư mục chạy.
2. Hiển thị Git status và diff; yêu cầu người dùng review trước khi commit.
3. Tự động nhận biết lỗi compiler/linter/test và đưa chúng trở lại model.
4. Hỗ trợ file chỉ dẫn của dự án, chẳng hạn AGENTS.md hoặc thư mục docs/ai-context mà người dùng chọn.
5. Thêm MCP có danh sách server được người dùng cấu hình rõ ràng.
6. Thêm tìm kiếm ngữ nghĩa local nếu tìm kiếm thường chưa đủ.
7. Làm shell desktop riêng khi extension đã có người dùng và phản hồi thực tế.

## 4. Kiểm tra phần cứng và chọn model

Trước đây bạn từng nhắc tới 24 GB bộ nhớ GPU; một thông tin cấu hình chi tiết khác ghi RTX 2080 với 8 GB VRAM chuyên dụng và 16 GB shared memory. Hai con số này không thể dùng thay thế cho nhau khi chọn model. Hãy kiểm tra **Dedicated GPU memory/VRAM** trong Task Manager hoặc công cụ của NVIDIA trước khi tải model lớn.

Kích thước file model không phải toàn bộ lượng bộ nhớ cần thiết. Runtime còn cần chỗ cho context/KV cache, tiến trình ứng dụng và các tác vụ GPU khác. Context window lớn được ghi trên model card cũng không có nghĩa máy của bạn có thể chạy context đó với tốc độ tốt.

Tại thời điểm lập tài liệu, Ollama liệt kê một số bản Qwen3.5 với kích thước gần đúng như sau: 4B khoảng 3.4 GB, 9B khoảng 6.6 GB, 27B khoảng 17 GB và 35B khoảng 24 GB. Kích thước model, quantization và tag có thể thay đổi; hãy kiểm tra trang model trước khi tải.

| VRAM chuyên dụng đã xác nhận | Điểm bắt đầu để thử | Cách đánh giá |
|---|---|---|
| Khoảng 8 GB | Bắt đầu với model 4B đã quantize; thử 9B chỉ khi chấp nhận offload và tốc độ chậm hơn | Đo VRAM, thời gian phản hồi đầu tiên, khả năng gọi tool và tỷ lệ patch chạy được |
| Khoảng 12–16 GB | So sánh 7B–14B đã quantize, thử context vừa phải | Giữ phần bộ nhớ dự phòng cho context và hệ điều hành |
| Khoảng 24 GB dedicated | Có thể thử các bản khoảng 14B–27B quantized; vẫn kiểm tra runtime và context | Đừng lấy tổng dung lượng model làm tiêu chí duy nhất |

Nếu GPU thực tế là RTX 2080 8 GB, hãy dùng model 4B làm phép thử đầu tiên. Model 9B có thể vượt ngân sách VRAM khi cộng context và runtime; Ollama có thể offload một phần sang RAM, nhưng tốc độ và trải nghiệm sẽ khác. Không nên xây ứng dụng với giả định một model lớn sẽ chạy ổn trước khi đo trên máy thật.

### Bài thử chọn model

Tạo một tập nhỏ gồm 15–20 nhiệm vụ gần với công việc của bạn:

- Giải thích component React/TypeScript hiện có.
- Tìm nơi xử lý một API hoặc một state.
- Thêm một validation nhỏ và test tương ứng.
- Sửa một lỗi type/lint trong project mẫu.
- Tạo patch trên hai file liên quan.
- Đọc lỗi test và đề xuất nguyên nhân.
- Từ chối hoặc hỏi lại khi yêu cầu còn thiếu thông tin.

Với từng model, ghi lại: thời gian đến token đầu tiên, tổng thời gian, VRAM cao nhất, số lần gọi tool sai định dạng, tỷ lệ test pass và mức độ bạn phải sửa lại patch. Chọn model theo kết quả này chứ không chỉ theo benchmark chung.

## 5. Kiến trúc đề xuất

### Luồng xử lý tổng quát

1. Người dùng nhập yêu cầu trong sidebar.
2. Extension lấy workspace root, file đang mở, selection và các file được người dùng đính kèm.
3. Agent core dựng prompt/context có giới hạn kích thước và gọi Ollama.
4. Model trả lời hoặc yêu cầu gọi một tool.
5. Policy layer kiểm tra schema, đường dẫn, phạm vi quyền và yêu cầu xác nhận.
6. Tool an toàn được chạy trên máy; kết quả được giới hạn kích thước rồi trả cho model.
7. Model tạo patch hoặc câu trả lời.
8. Người dùng xem diff và chọn Apply/Reject.
9. Kết quả, token usage nếu runtime cung cấp, thời gian và tool events được lưu cục bộ.

**Quy tắc cốt lõi:** model chỉ được đề xuất hành động. Extension host mới là thành phần có quyền truy cập file và chạy tool, và phải kiểm tra mọi yêu cầu trước khi thực thi.

### Các module

| Module | Trách nhiệm |
|---|---|
| VS Code UI | Chat, chọn context, trạng thái agent, danh sách tool events, diff và nút duyệt |
| Agent runner | Quản lý vòng lặp model-tool, hủy tác vụ, timeout và giới hạn số lượt |
| LLM provider | Giao diện thống nhất cho Ollama; sau này có thể thêm runtime local khác |
| Context builder | Chọn file liên quan, cắt nội dung, bỏ binary, file lớn và file bị ignore |
| Tool registry | Khai báo các tool và schema đầu vào được phép |
| Policy/permission layer | Áp dụng quyền đọc, sửa, chạy lệnh, giới hạn đường dẫn và xác nhận |
| Workspace adapter | Tìm, đọc, ghi file và truy cập thông tin editor qua VS Code API |
| Persistence | Lưu cài đặt, phiên chat, tin nhắn và nhật ký thao tác cục bộ |
| Evaluation/test harness | Chạy tập tác vụ mẫu và lưu kết quả so sánh model |

### Stack cụ thể

- **Ngôn ngữ:** TypeScript cho extension, agent core, UI và test.
- **UI trong VS Code:** React trong Webview; giao tiếp với extension host qua message API có kiểm tra type và command allowlist.
- **Agent logic:** package TypeScript thuần, tách khỏi UI để sau này dùng lại trong Tauri/Electron.
- **Model local:** Ollama ở giai đoạn đầu. API của Ollama hỗ trợ gọi chat; OpenAI-compatible endpoint giúp tái sử dụng một số SDK, nhưng cần xác nhận các tính năng được model và endpoint hỗ trợ.
- **Tìm code:** VS Code workspace API và ripgrep. Có thể thêm Tree-sitter/language server khi cần phân tích cấu trúc.
- **Dữ liệu:** SQLite cho history/config; không cần lưu codebase đã đọc nếu người dùng chưa bật tính năng đó.
- **Test:** Vitest cho agent/policy; VS Code extension test host cho tích hợp; fixture repository để thử trên codebase giả lập.
- **Build/đóng gói:** VSIX cho extension riêng; Ollama và model cài đặt riêng, hướng dẫn rõ ràng trong onboarding.

### Cấu trúc repository gợi ý

- apps/vscode-extension — activation, commands, views, webview và VS Code adapters.
- packages/agent-core — agent loop, prompt/context, tool schemas và orchestration.
- packages/llm-providers — interface chung và Ollama adapter.
- packages/security — path policy, file exclusions, approval policy và sanitization.
- packages/storage — schema và repository SQLite.
- packages/evaluation — tác vụ mẫu, chạy benchmark và lưu kết quả.
- docs/architecture — sơ đồ, ADR và quyết định kiến trúc.
- docs/security — mô hình đe dọa, quyền tool và chính sách dữ liệu.
- docs/ai-context — hướng dẫn và quy tắc dùng agent trong chính repository.

Trong MVP, không cần tách một NestJS server riêng. VS Code extension host đã chạy trên Node.js và có thể gọi Ollama qua HTTP. Giữ agent core thuần TypeScript để không phụ thuộc vào VS Code API. Nếu về sau làm app desktop riêng, khi đó mới quyết định có tách agent thành local sidecar/NestJS service hay không.

## 6. Thiết kế agent loop và công cụ

### Vòng lặp agent

Mỗi lượt chạy nên theo quy trình cố định:

1. Ghép system instructions, yêu cầu hiện tại, lịch sử hữu hạn và code context liên quan.
2. Gửi yêu cầu đến model với danh sách tool được phép ở mode hiện tại.
3. Nếu model trả tool call, kiểm tra tên tool và validate input bằng schema.
4. Áp dụng policy, kiểm tra quyền và hỏi xác nhận nếu hành động có thể ghi file/chạy lệnh.
5. Thực thi tool, ghi lại kết quả và trả kết quả về model.
6. Lặp lại đến khi có câu trả lời cuối, người dùng dừng, hoặc vượt ngưỡng lượt/thời gian.
7. Hiển thị file thay đổi và diff; không âm thầm ghi đè file.

Thiết lập giới hạn số lượt agent, timeout theo tool, kích thước tối đa của output và nút Cancel. Tránh vòng lặp vô hạn khi model liên tục gọi tool.

### Công cụ theo thứ tự mở quyền

| Tool | MVP | Quyền mặc định |
|---|---|---|
| search_workspace | Có | Chỉ đọc; tôn trọng .gitignore và exclusions |
| read_file | Có | Chỉ trong workspace; chặn file secret theo mặc định |
| get_active_file/selection | Có | Chỉ lấy file và selection người dùng đang xem |
| propose_patch | Có | Tạo diff để review; chưa ghi file |
| apply_patch | Có | Chỉ sau khi người dùng duyệt patch |
| git_status/git_diff | Bản kế tiếp | Chỉ đọc |
| run_test/run_task | Bản kế tiếp | Cần duyệt lệnh cụ thể, cwd và thời gian chạy |
| arbitrary_shell | Không bật mặc định | Không cho model tự chạy câu lệnh tùy ý |
| network_search/MCP | Bản sau | Tắt mặc định, cấu hình và cấp quyền riêng |

Không đưa một hàm run shell tổng quát vào toolset MVP. Cho phép tool hẹp như chạy test script đã cấu hình, và vẫn hiển thị lệnh, thư mục làm việc, output cùng nút hủy trước khi thực hiện.

## 7. Bảo mật và quyền riêng tư

Một coding agent có thể đọc file, sửa source và gọi tiến trình bên ngoài. Bảo mật phải được cài trong policy layer, không giao cho model tự quyết định.

### Quy tắc bắt buộc

- Ollama chỉ lắng nghe trên loopback/local host ở chế độ mặc định; không mở API ra mạng LAN nếu chưa có xác thực và cấu hình rõ ràng.
- Chế độ local-only không gửi code, prompt hay lịch sử ra dịch vụ ngoài.
- Cấm đường dẫn thoát khỏi workspace; chuẩn hóa path và kiểm tra symlink để ngăn truy cập file ngoài project.
- Loại trừ mặc định: .env, credential, private key, .git, node_modules, dist, build, file lớn và binary. Cho người dùng cấu hình lại.
- Giới hạn số file, kích thước file và tổng context mỗi yêu cầu.
- Webview chỉ gửi các action đã khai báo; không cho webview gọi tùy ý API của extension host.
- Escape nội dung do model trả về trước khi render; áp dụng CSP cho webview.
- Mọi thay đổi file phải hiện diff rõ ràng; lưu snapshot/backup hoặc dựa vào Git để khôi phục.
- Mọi lệnh chạy phải hiện executable, arguments, cwd, thời hạn và yêu cầu duyệt.
- Xử lý README, comment và code trong repo như dữ liệu không đáng tin. Chúng có thể chứa prompt injection; không để chúng thay đổi policy hoặc tự cấp quyền.
- Ghi log tool call nhưng tránh ghi secrets, nội dung .env hoặc toàn bộ source code vào log.
- Có nút tạm dừng model/runtime và nút xóa toàn bộ lịch sử local.

### Các chế độ quyền giao diện

1. **Ask:** chỉ trả lời, không dùng tool.
2. **Read:** tìm và đọc file trong workspace.
3. **Edit with review:** tạo patch, chờ người dùng duyệt trước khi áp dụng.
4. **Run with approval:** yêu cầu duyệt từng lệnh/test.

Không cần có chế độ “tự làm mọi thứ” trong bản đầu. Nếu bổ sung về sau, nó cần giới hạn workspace, thời gian, số lần lặp và hành động được phép.

## 8. Lộ trình triển khai từ đầu đến cuối

Ước lượng dưới đây dành cho một người làm ngoài giờ và đã quen React/TypeScript. Có thể thay đổi theo tốc độ học VS Code Extension API, model và kiểm thử.

### Giai đoạn 0 — Chốt yêu cầu và giới hạn (2–3 ngày)

**Việc làm**

- Viết 8–10 user stories: hỏi code, tìm code, sửa code, xem diff, chạy test có duyệt.
- Chốt phiên bản đầu là VS Code extension cá nhân cho Windows.
- Quy định mode local-only, phạm vi workspace và các file mặc định không đọc.
- Xác định model phải chạy trên máy thực tế; không lấy 24 GB shared memory làm VRAM.
- Chọn một repository nhỏ làm project thử nghiệm.

**Kết quả:** PRD ngắn, sơ đồ luồng, phạm vi MVP và danh sách tiêu chí hoàn thành.

**Hoàn tất khi:** có thể mô tả rõ yêu cầu nào được làm ở MVP và yêu cầu nào để sau.

### Giai đoạn 1 — Kiểm chứng model/runtime local (2–4 ngày)

**Việc làm**

- Kiểm tra Dedicated GPU Memory, RAM và dung lượng ổ đĩa còn trống.
- Cài/cập nhật Ollama, tải một model nhỏ đã chọn và thử chat local.
- Gửi một yêu cầu streaming từ Node.js/TypeScript.
- Thử tool calling trên ít nhất 5 yêu cầu, gồm trường hợp model đưa input sai.
- Ghi tốc độ token, VRAM/RAM và chất lượng code trên bộ tác vụ nhỏ.

**Kết quả:** bảng chọn model, cấu hình Ollama hoạt động, quyết định model mặc định.

**Hoàn tất khi:** app mẫu có thể gọi model, stream, dừng yêu cầu và báo lỗi runtime tắt.

### Giai đoạn 2 — Tạo extension shell (3–5 ngày)

**Việc làm**

- Khởi tạo repository TypeScript cho VS Code extension.
- Tạo activity bar/sidebar, command mở chat và panel trống.
- Tạo React webview, nối message qua schema đã định nghĩa.
- Thêm onboarding: kiểm tra Ollama, địa chỉ local, model có sẵn và nút mở hướng dẫn tải model.
- Tạo test extension host ban đầu.

**Kết quả:** extension cài được vào VS Code và mở được giao diện chat.

**Hoàn tất khi:** UI không cần Next.js server chạy nền và hoạt động sau khi reload VS Code.

### Giai đoạn 3 — Chat với model và quản lý phiên (4–6 ngày)

**Việc làm**

- Xây interface LLM provider, Ollama adapter và stream event.
- Thêm cancel, timeout, retry có giới hạn và trạng thái kết nối.
- Lưu hội thoại, model đang dùng và cài đặt vào SQLite/local storage.
- Thêm tạo phiên mới, đổi model và xóa phiên.

**Kết quả:** chat local sử dụng được lặp lại qua nhiều lần mở IDE.

**Hoàn tất khi:** model mất kết nối hoặc trả lỗi vẫn không làm extension bị treo.

### Giai đoạn 4 — Context và tìm kiếm codebase (5–8 ngày)

**Việc làm**

- Lấy file đang mở, selection và danh sách file đính kèm.
- Tìm symbol/text trong workspace qua VS Code API hoặc ripgrep.
- Áp dụng exclusions, ignore, giới hạn file/context và bỏ binary.
- Thêm UI cho người dùng thấy AI đã đọc những file nào và loại bỏ file nào.
- Hỗ trợ file hướng dẫn project chỉ khi người dùng bật hoặc xác nhận.

**Kết quả:** trợ lý trả lời dựa trên code thật trong repo thay vì chỉ dựa vào prompt.

**Hoàn tất khi:** các câu hỏi thử về project chỉ gửi đúng file có liên quan và không đọc thư mục bị loại trừ.

### Giai đoạn 5 — Patch và duyệt diff (5–8 ngày)

**Việc làm**

- Thiết kế format patch có đường dẫn, nội dung gốc/đích và lỗi có cấu trúc.
- Kiểm tra patch trên file hiện tại để phát hiện file đã thay đổi trong lúc model suy luận.
- Mở diff editor để người dùng duyệt từng file.
- Cho phép Apply/Reject và hoàn tác.
- Hiển thị đầy đủ lý do/summary, không ghi file ngầm.

**Kết quả:** AI có thể sửa code nhưng người dùng kiểm soát thời điểm ghi.

**Hoàn tất khi:** có thể chấp nhận patch hợp lệ, từ chối patch và khôi phục nếu áp dụng nhầm.

### Giai đoạn 6 — Agent tools có kiểm soát (1–2 tuần)

**Việc làm**

- Thêm tool schemas bằng Zod hoặc validator tương đương.
- Cài policy layer và phân quyền Ask/Read/Edit.
- Thêm Git status/diff dạng read-only.
- Sau khi MVP ổn, thêm chạy test/task qua danh sách lệnh được cấu hình.
- Mỗi lệnh phải hiển thị cwd, executable, arguments, timeout và nút duyệt/hủy.
- Giới hạn số vòng tool, độ dài output và thời lượng tác vụ.

**Kết quả:** agent có thể điều phối các thao tác code, test và feedback.

**Hoàn tất khi:** một yêu cầu sửa bug có thể tìm file, tạo patch, chờ duyệt, chạy test có duyệt và giải thích kết quả.

### Giai đoạn 7 — Hoàn thiện lưu trữ và context project (4–7 ngày)

**Việc làm**

- Lưu conversations, messages, model metadata, tool runs và timestamps.
- Có cài đặt riêng từng workspace cho exclusions và model.
- Hỗ trợ project instructions trong docs/ai-context hoặc AGENTS.md theo cấu hình.
- Giới hạn thời gian lưu lịch sử và cho phép xóa dữ liệu.
- Bổ sung tìm kiếm full-text lịch sử nếu cần.

**Kết quả:** người dùng có thể tiếp tục công việc trong cùng project mà không dồn mọi thông tin vào một prompt khổng lồ.

**Hoàn tất khi:** lịch sử tồn tại sau khi đóng mở app, chỉ nằm trên máy và xóa được bằng thao tác rõ ràng.

### Giai đoạn 8 — Kiểm thử, bảo mật và đánh giá model (1 tuần)

**Việc làm**

- Unit test path containment, symlink, exclusions, policy và schema.
- Integration test với fake Ollama server cho stream, tool call, timeout và lỗi.
- Chạy extension integration tests bằng VS Code test host.
- Dùng fixture repo để thử đọc, sửa, test, cancel và file nhạy cảm.
- Đánh giá model bằng cùng tập tasks; ghi thành công/thất bại và chi phí phần cứng.
- Thử prompt injection trong README/comment để bảo đảm policy host vẫn chặn thao tác.

**Kết quả:** báo cáo lỗi còn lại, bộ kiểm thử lặp lại được và các tiêu chí release.

**Hoàn tất khi:** mọi test security quan trọng pass, không có lệnh hoặc ghi file ngoài phạm vi mà không được duyệt.

### Giai đoạn 9 — Đóng gói và phát hành bản cá nhân (3–5 ngày)

**Việc làm**

- Đóng gói VSIX và cài thử trên VS Code sạch.
- Viết hướng dẫn cài Ollama, tải model, kiểm tra VRAM và xử lý lỗi thường gặp.
- Viết chính sách dữ liệu dễ hiểu: local-only gồm những gì, tính năng nào cần Internet.
- Thêm nút diagnostics không thu thập nội dung source.
- Ghim dependency, build reproducibly và lưu changelog.

**Kết quả:** một bản cài đặt cá nhân có thể dùng lại trên máy Windows.

**Hoàn tất khi:** cài theo README trên một profile VS Code mới, kết nối model và hoàn thành một task end-to-end.

### Giai đoạn 10 — Mở rộng thành ứng dụng riêng (sau khi MVP được dùng thực tế)

**Việc làm**

- Thu thập danh sách thao tác nào trong extension gây bất tiện.
- Giữ agent core độc lập với VS Code API.
- Làm prototype React + Tauri hoặc Electron và kết nối cùng agent core.
- Quyết định dùng Monaco hay tích hợp một editor/workbench có sẵn.
- Thiết kế cài đặt runtime/model, cập nhật, backup và crash recovery.

**Kết quả:** quyết định dựa trên trải nghiệm dùng extension thật, thay vì xây toàn bộ IDE theo suy đoán.

### Ước lượng tổng

- **Extension MVP dùng cá nhân:** khoảng 8–12 tuần ngoài giờ, nếu làm lần lượt và không mở rộng phạm vi giữa chừng.
- **Ứng dụng desktop riêng có editor, terminal, Git và đóng gói:** cần thêm thời gian đáng kể; có thể mất nhiều tháng tùy mức độ hoàn thiện.

## 9. Tiêu chí nghiệm thu MVP

MVP được xem là dùng được khi đáp ứng các mục sau:

- Cài được như một VS Code extension trên Windows.
- Kết nối Ollama qua địa chỉ loopback mà không cần API key cloud.
- Có thể chat tiếng Việt và tiếng Anh, stream, cancel và đổi model.
- Hiểu selection/file đính kèm và tìm được file liên quan trong workspace.
- Không đọc exclusions hoặc file secret theo cấu hình mặc định.
- Tạo patch, hiển thị diff, chỉ ghi file sau khi người dùng duyệt.
- Lưu và khôi phục lịch sử hội thoại tại chỗ.
- Không chạy arbitrary shell trong phiên bản đầu.
- Khi Ollama tắt, runtime lỗi, model không hỗ trợ tool call hoặc context quá dài, app báo lỗi có hướng xử lý.
- Có test cho policy đọc/ghi và có fixture repo để kiểm thử lại.
- Chế độ local-only không gọi API model cloud, telemetry hoặc dịch vụ tìm kiếm ngoài.

## 10. Rủi ro và cách giảm

| Rủi ro | Ảnh hưởng | Cách giảm |
|---|---|---|
| VRAM thấp hơn dự kiến | Model chậm, out-of-memory hoặc context ngắn | Kiểm tra dedicated VRAM; bắt đầu model nhỏ; đo trong task thật |
| Model local gọi tool không ổn định | Agent làm sai bước hoặc dừng giữa chừng | Validate schema; giới hạn tool; fallback về câu trả lời; đánh giá model trước |
| Context gửi quá nhiều | Tốn RAM/VRAM, model bỏ sót code quan trọng | Tìm file trước, cắt theo giới hạn, cho người dùng xem context |
| Agent sửa nhầm file | Hỏng code hoặc mất thay đổi | Diff trước apply, kiểm tra file version, dùng Git/undo |
| Prompt injection trong repo | Model bị chỉ dẫn đọc secret hoặc chạy lệnh | Xem nội dung repo là untrusted; quyền nằm ở host; cần duyệt hành động |
| Tự làm IDE từ đầu quá sớm | Tốn thời gian vào terminal/editor/SCM | Extension trước, app riêng sau |
| RAG triển khai sớm | Tăng hệ thống nhưng chưa chứng minh cải thiện | Dùng search/selection trước; chỉ thêm embeddings khi đo được thiếu sót |
| Model/license không phù hợp phân phối | Không thể đóng gói hoặc chia sẻ app theo dự tính | Kiểm tra license model và runtime trước khi phát hành rộng |
| Tính năng local nhưng âm thầm gọi mạng | Mất niềm tin và lộ code | Tắt mặc định, hiển thị mọi kết nối ngoài và có chế độ offline rõ ràng |

## 11. Việc nên làm ngay

1. Xác nhận GPU có bao nhiêu **Dedicated VRAM**, không chỉ tổng memory mà Windows hiển thị.
2. Cài hoặc kiểm tra Ollama và thử một model nhỏ phù hợp máy.
3. Tạo bộ 15–20 coding tasks từ những tình huống bạn thường gặp khi làm React/TypeScript.
4. Tạo repository trống cho VS Code extension.
5. Hoàn thành proof of concept tối thiểu: nhập câu hỏi trong VS Code → gửi tới Ollama local → nhận streaming response.
6. Chỉ sau khi bước 5 ổn mới thêm đọc code, tool calling, patch và chạy test.

## 12. Tài liệu tham khảo chính thức

- [VS Code Extension API](https://code.visualstudio.com/api/) — khả năng và hướng dẫn xây dựng extension.
- [VS Code Webviews](https://code.visualstudio.com/api/ux-guidelines/webviews) — giao diện tùy biến bên trong extension.
- [VS Code Chat Participant API](https://code.visualstudio.com/api/extension-guides/ai/chat) — tích hợp chat participant với giao diện chat của VS Code.
- [Testing VS Code Extensions](https://code.visualstudio.com/api/working-with-extensions/testing-extension) — test extension trong VS Code test host.
- [VS Code Workspace Trust](https://code.visualstudio.com/api/extension-guides/workspace-trust) — xử lý workspace không đáng tin.
- [VS Code Extension Runtime Security](https://code.visualstudio.com/docs/configure/extensions/extension-runtime-security) — thông tin bảo mật extension.
- [Ollama OpenAI compatibility](https://ollama.com/blog/openai-compatibility) — gọi endpoint local theo định dạng tương thích OpenAI.
- [Ollama tool support](https://ollama.com/blog/tool-support) — tool calling và yêu cầu model hỗ trợ.
- [Qwen3.5 trên Ollama](https://ollama.com/library/qwen3.5) — các tag model và kích thước được liệt kê; cần kiểm tra lại trước khi tải vì catalog thay đổi.

**Ghi chú:** kích thước model, API và danh sách tính năng có thể thay đổi theo phiên bản. Khi bắt đầu triển khai, kiểm tra lại tài liệu runtime và model card; dùng các số trong kế hoạch này như mốc thử nghiệm, không phải bảo đảm hiệu năng.
