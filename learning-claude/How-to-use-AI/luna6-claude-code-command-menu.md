# Cẩm nang lệnh Claude Code trong VS Code

> Tài liệu tiếng Việt về các lệnh của Claude Code extension trong VS Code, command menu trong khung chat và danh mục slash command chính thức của Claude Code.

**Ngày đối chiếu:** 07/10/2026  
**Tài liệu chính thức:** [Claude Code trong VS Code](https://code.claude.com/docs/en/vs-code) · [Danh mục Commands](https://code.claude.com/docs/en/commands)

---

## 1. Phân biệt hai command menu

| Nơi | Cách mở trên Windows/Linux | Nội dung |
|---|---|---|
| **VS Code Command Palette** | Nhấn **Ctrl+Shift+P**, gõ **Claude Code** | Các lệnh điều khiển extension: mở chat, chuyển focus, mở phiên mới, xem log, duyệt thay đổi… |
| **Command menu trong khung chat** | Mở Claude Code panel rồi nhấn **/** hoặc gõ **/** vào ô nhập | Slash command như **/plan**, **/model**, **/compact**, cùng các mục Customize, Context, Settings. |

Trong khung chat, chọn **Customize → Slash commands** để mở danh sách lệnh và bộ lọc. Có thể gõ một phần tên để tìm. **/skills** cũng mở danh sách skill ở phiên bản hỗ trợ.

Claude Code cho VS Code hỗ trợ một phần các command của CLI. Danh sách thật trên máy phụ thuộc phiên bản, hệ điều hành, gói tài khoản, nhà cung cấp, cấu hình tổ chức, plugin, skill, MCP prompt và command tự tạo. Vì vậy có thể có lệnh trong tài liệu nhưng không có trong menu của bạn.

**Cú pháp:** **&lt;đối_số&gt;** là bắt buộc; **[đối_số]** là tùy chọn. **Alias** là tên khác gọi cùng chức năng. Một số command là **Skill** (hướng dẫn chuyên biệt) hoặc **Workflow** (quy trình điều phối tác vụ).

---

## 2. Lệnh Claude Code trong VS Code Command Palette

Mở **Ctrl+Shift+P**, tìm **Claude Code**. Đây là lệnh của VS Code, không phải slash command.

| Lệnh | Công dụng và vấn đề giải quyết |
|---|---|
| **Focus Input** | Chuyển focus giữa editor và ô chat Claude; phím **Ctrl+Esc**. Dùng khi gõ phím nhưng con trỏ đang ở sai vùng. |
| **Focus last message** | Đưa focus tới câu trả lời mới nhất hoặc yêu cầu cấp quyền đang chờ; hỗ trợ thao tác bàn phím/screen reader. Không có trong Terminal mode. |
| **Open in Side Bar** | Mở Claude trong thanh bên để vừa xem code vừa chat. |
| **Open in Terminal** | Mở giao diện CLI trong terminal thay cho panel đồ họa. |
| **Open in New Tab** | Tạo hội thoại mới trong tab editor; phím **Ctrl+Shift+Esc**. |
| **Open in New Window** | Tạo hội thoại mới ở cửa sổ VS Code riêng để tách công việc/workspace. |
| **New Conversation** | Bắt đầu hội thoại mới; phím **Ctrl+N** khi Claude đang được focus và tùy chọn phím tắt được bật. |
| **Reopen Closed Session** | Mở lại tab phiên Claude vừa đóng; phím **Ctrl+Shift+T**. Nếu tab gần nhất không phải Claude, VS Code thực hiện hành vi mở editor đã đóng thông thường. |
| **Insert @-Mention Reference** | Chèn tham chiếu file và vùng code đang chọn, giúp Claude nhận đúng đoạn cần hỏi; phím **Alt+K** khi editor đang focus. |
| **Accept Change at Cursor** | Chấp nhận thay đổi tại vị trí con trỏ khi duyệt diff từng thay đổi. |
| **Reject Change at Cursor** | Loại bỏ thay đổi tại vị trí con trỏ khi duyệt diff từng thay đổi. |
| **Toggle Focus view** | Ẩn/hiện tool calls và kết quả công cụ để transcript dễ đọc; Windows/Linux **Ctrl+Alt+F**. |
| **Rename Session Tab** | Đổi tên tab hội thoại đang mở để dễ tìm lại. |
| **Add Session Tab to Group** | Thêm tab vào nhóm phiên có sẵn hoặc tạo nhóm mới. |
| **Mark Session as Unread** | Đánh dấu phiên là chưa đọc trong danh sách để quay lại sau. |
| **Show Logs** | Mở log chẩn đoán extension để điều tra lỗi. |
| **Logout** | Đăng xuất tài khoản Anthropic khỏi extension. |

Một số lệnh yêu cầu phiên bản Claude Code tối thiểu. Nếu thiếu lệnh, hãy cập nhật extension và kiểm tra tài liệu phiên bản hiện tại.

---

## 3. Các mục menu tương tác trong khung chat

| Mục | Tính năng và khi nào dùng |
|---|---|
| **Attach files** | Đính kèm file/ảnh hoặc tham chiếu file bằng @; dùng khi Claude cần thêm ngữ cảnh cụ thể. |
| **Switch model…** | Chọn model khác trong phiên; một số model có hàng **Effort** để điều chỉnh mức suy luận. Hữu ích khi muốn cân bằng tốc độ, chi phí và năng lực. |
| **Extended thinking** | Bật/tắt suy luận bổ sung ở model hỗ trợ; dùng cho vấn đề nhiều bước, nhưng không đảm bảo câu trả lời luôn đúng. |
| **Customize → Slash commands** | Duyệt/tìm command slash. |
| **Customize → MCP servers** | Thêm/xóa/bật/tắt/kết nối lại MCP server và xử lý OAuth; dùng khi Claude cần công cụ/API/dữ liệu bên ngoài. |
| **Customize → Output styles** | Chọn hoặc tạo phong cách trả lời để không phải lặp lại format trong mọi prompt. |
| **Customize → Hooks** | Xem hook theo sự kiện; thêm/sửa/xóa cấu hình bạn có quyền chỉnh sửa. |
| **Customize → Memory** | Bật/tắt auto memory, xem và quản lý ghi nhớ nếu phiên bản hỗ trợ. |
| **Customize → Instructions** | Mở file **CLAUDE.md** mà Claude đọc; tạo file nếu chưa có. Dùng để lưu quy tắc dự án. |
| **Customize → Permissions** | Xem luật Allow / Ask / Deny và quản lý luật trong phạm vi được phép. |
| **Customize → Plugins** | Cài, bật/tắt, cấu hình hoặc gỡ plugin/marketplace. |
| **Customize → Status** | Kiểm tra version, model, tài khoản và trạng thái MCP; cũng có thể dùng **/status**. |
| **Customize → Sandbox** | Xem/đổi chế độ sandbox và loại trừ command nếu được hỗ trợ. |
| **Customize → Claude in Chrome** | Kiểm tra kết nối browser automation nếu đã tích hợp Chrome. |
| **Context → Export conversation** | Sao chép hội thoại hoặc lưu file; cũng có thể gọi **/export [tên_file]**. |
| **Context → Bookmarks** | Xem câu trả lời đã đánh dấu; **/bookmarks** có ở phiên bản hỗ trợ. |
| **Settings → Enable Remote Control for all sessions** | Đặt việc phiên mới có tự kết nối Remote Control hay không. |
| **Settings → Focus view** | Ẩn tool calls và phần suy luận thu gọn để hội thoại dễ đọc. |
| **Sign out / Report a problem** | Đăng xuất hoặc mở quy trình báo lỗi; xem kỹ nội dung/consent trước khi gửi feedback. |

Mục menu và phiên bản tối thiểu thay đổi theo bản phát hành. Các mục do tổ chức quản lý có thể chỉ đọc hoặc bị ẩn.

---

## 4. Danh mục slash command chính thức

Các dòng dưới đây bao quát danh mục command tích hợp trong tài liệu Claude Code. Mỗi hàng nêu cách gọi, công dụng và vấn đề giải quyết. Command không được VS Code extension hỗ trợ có thể chỉ dùng được ở CLI.

### A. Thư mục, hội thoại và ngữ cảnh

| Lệnh | Cách dùng, công dụng và vấn đề giải quyết |
|---|---|
| **/add-dir &lt;path&gt;** | Thêm thư mục Claude được phép truy cập trong phiên, ví dụ **/add-dir ../shared**. Dùng khi cần tham chiếu thư mục ngoài workspace. |
| **/cd &lt;path&gt;** | Chuyển thư mục làm việc nhưng giữ hội thoại, ví dụ **/cd ../api**. Dùng khi chuyển sang thư mục dự án khác; khác /add-dir vì thay đổi thư mục chính. |
| **/clear [name]** | Bắt đầu hội thoại trống; tên tùy chọn giúp tìm phiên cũ bằng /resume. Dùng khi chuyển hẳn sang việc mới. Alias: **/reset**, **/new**. |
| **/compact [instructions]** | Tóm tắt phiên để giải phóng context nhưng tiếp tục cùng nhiệm vụ; có thể chỉ dẫn phần cần giữ. Dùng khi hội thoại dài. |
| **/autocompact [auto\|tokens]** | Xem/đặt ngưỡng tự compact, ví dụ **/autocompact 500k** hoặc **/autocompact auto**. Hữu ích khi muốn kiểm soát thời điểm tự tóm tắt; yêu cầu phiên bản hỗ trợ. |
| **/context [all]** | Hiện biểu đồ mức dùng context và gợi ý tối ưu; **all** mở rộng chi tiết. Dùng để tìm nội dung nào đang chiếm cửa sổ context. |
| **/init** | Tạo hướng dẫn dự án **CLAUDE.md** từ repository. Dùng khi bắt đầu áp dụng Claude cho repo và cần lưu cấu trúc/quy tắc/lệnh test. |
| **/memory** | Chỉnh CLAUDE.md, bật/tắt auto memory và xem ghi nhớ. Dùng để sửa tri thức lâu dài bị sai/lỗi thời. |
| **/rename [name]** | Đổi tên phiên; bỏ tên để Claude tự tạo. Giúp nhận diện phiên trong lịch sử. |
| **/resume [session]** | Mở bộ chọn hoặc tiếp tục phiên theo ID/tên. Dùng để quay lại hội thoại cũ. Alias: **/continue**. |
| **/rewind** | Quay code/hội thoại về checkpoint trước đó hoặc tóm tắt từ một điểm. Dùng khi cần phục hồi sau hướng xử lý không phù hợp; xem kỹ trước khi hoàn tác. Alias: **/checkpoint**, **/undo**. |
| **/export [filename]** | Xuất hội thoại dạng text; bỏ filename để chọn sao chép/lưu, hoặc truyền tên để lưu thẳng. Dùng lưu ghi chú/transcript. |
| **/copy [N]** | Sao chép câu trả lời gần nhất; N chọn câu trả lời cũ hơn, ví dụ **/copy 2**. Có thể chọn code block hoặc ghi ra file. |
| **/recap** | Tạo tóm tắt một dòng cho phiên; dùng để nhớ nhanh mục tiêu/tiến độ. |
| **/btw [question]** | Hỏi phụ về phiên mà không thêm vào lịch sử chính, ví dụ **/btw lệnh test tích hợp là gì?** Dùng để hỏi nhanh mà không làm loãng luồng chính. |
| **/goal [condition\|clear]** | Đặt điều kiện hoàn thành để Claude tiếp tục qua nhiều lượt; dùng **clear** để xóa. Hữu ích cho nhiệm vụ nhiều bước có tiêu chí kết thúc. |
| **/loop [interval] [prompt]** | Lặp prompt khi phiên còn mở, ví dụ **/loop 5m kiểm tra deploy đã xong chưa**. Dùng theo dõi công việc định kỳ trong phiên. Alias: **/proactive**. |
| **/help** | Hiện trợ giúp và command khả dụng trong môi trường hiện tại; dùng khi quên cú pháp. |
| **/exit** | Thoát CLI; trong background session đang gắn vào, detach terminal nhưng để session tiếp tục. Alias: **/quit**. |

### B. Lập kế hoạch, agent và tác vụ nền

| Lệnh | Cách dùng, công dụng và vấn đề giải quyết |
|---|---|
| **/plan [description]** | Vào Plan mode, có thể kèm nhiệm vụ: **/plan sửa lỗi auth**. Claude lập kế hoạch và chờ duyệt trước khi sửa. |
| **/advisor [model\|off]** | Chọn/bật/tắt model cố vấn thứ hai. Dùng khi muốn thêm ý kiến ở các thời điểm quan trọng; model/đặc quyền tùy tài khoản. |
| **/agents** | Hướng dẫn tạo/quản lý subagent hoặc cấu hình agents; giao diện phụ thuộc phiên bản. Dùng khi muốn tách vai trò/nhiệm vụ. |
| **/list-agents** | Liệt kê subagent, teammates và phiên có thể nhắn tin; alias **/peers**. Chỉ có khi bật cross-session messaging. |
| **/subtask &lt;task&gt;** | Giao việc phụ cho subagent và nhận kết quả trong phiên hiện tại. Dùng cho phần việc độc lập cần chạy song song. |
| **/fork [prompt]** | Sao chép hội thoại sang background session riêng; có thể truyền prompt để bắt đầu ngay. Dùng khi muốn chạy nhánh công việc độc lập. |
| **/branch [name]** | Tạo nhánh hội thoại và chuyển sang đó, giữ lại hội thoại gốc. Dùng thử hướng giải quyết khác mà không mất tiến trình ban đầu. |
| **/background [prompt]** | Tách phiên hiện tại chạy nền và giải phóng terminal; prompt tùy chọn được gửi trước khi detach. Alias: **/bg**. |
| **/batch &lt;instruction&gt;** | Chia thay đổi quy mô lớn thành 5–30 phần độc lập, lập kế hoạch rồi điều phối worktree/subagent. Dùng cho migration/refactor lớn; cần Git repo hoặc hook tạo worktree. |
| **/tasks** | Xem/quản lý background tasks và subagent, kể cả việc đã xong. Alias: **/bashes**. Dùng để kiểm tra tiến độ/đầu ra hoặc dừng tác vụ. |
| **/stop** | Dừng background session đang gắn vào; giữ transcript và worktree. Dùng khi không muốn tác vụ tiếp tục. |
| **/schedule [description]** | Tạo/sửa/liệt kê/chạy routine trên cloud qua hướng dẫn. Dùng cho công việc theo lịch; phụ thuộc hỗ trợ routine. Alias: **/routines**. |
| **/teleport** | Kéo cloud session về terminal và tiếp tục local. Alias: **/tp**; cần Claude.ai subscription. |
| **/remote-control** | Cho phép tiếp tục phiên local từ thiết bị/Claude.ai khác. Alias: **/rc**; yêu cầu Remote Control khả dụng. |
| **/remote-env** | Chọn cloud environment mặc định cho cloud session khởi chạy từ CLI. |
| **/desktop** | Tiếp tục phiên trong ứng dụng Claude Code Desktop. Alias: **/app**; yêu cầu macOS hoặc Windows x64 cùng subscription. |
| **/autofix-pr [prompt]** | Cloud session theo dõi PR branch hiện tại và đẩy sửa khi CI lỗi/reviewer góp ý. Ví dụ **/autofix-pr chỉ sửa lint**; cần GitHub CLI **gh** và cloud sessions. |
| **/team-onboarding** | Tạo tài liệu onboarding từ cách dùng Claude Code 30 ngày gần đây; hữu ích khi đưa đồng đội vào quy trình. Link chia sẻ tùy gói. |
| **/workflows** | Mở bảng tiến độ dynamic workflow để theo dõi, tạm dừng, tiếp tục hoặc lưu các workflow đang chạy/đã hoàn tất. |

### C. Review, kiểm thử, debug và bảo mật

| Lệnh | Cách dùng, công dụng và vấn đề giải quyết |
|---|---|
| **/diff** | Xem diff trong working tree, gồm sửa đổi Claude vừa làm. Dùng trước khi chấp nhận/commit. |
| **/code-review [level] [flags] [PR\|branch\|path]** | Rà diff hoặc mục tiêu cụ thể để tìm bug; có thể yêu cầu sửa, đăng comment hoặc chạy review sâu. Ví dụ **/code-review high src/auth**. |
| **/review …** | Alias hiện tại của **/code-review**; dùng cùng cú pháp để review diff/PR/branch/path. |
| **/simplify [target]** | Rà code để tái sử dụng helper, giảm phức tạp/kém hiệu quả và áp dụng cải tiến. Không tập trung tìm correctness bug; dùng /code-review cho việc đó. |
| **/security-review** | Rà thay đổi branch so với origin default branch để tìm injection, lỗi auth, lộ dữ liệu. Dùng trước merge code nhạy cảm; cần Git remote origin. |
| **/verify** | Skill kiểm chứng bằng build/chạy app và quan sát kết quả thay vì chỉ dựa trên test/type check. Dùng sau khi sửa tính năng. |
| **/run** | Skill khởi chạy và thao tác ứng dụng để kiểm tra hành vi thực tế. Dùng khi cần xác nhận UI/app hoạt động. |
| **/run-skill-generator** | Tạo skill theo repo dạy /run và /verify cách build/chạy/thao tác app từ môi trường sạch. Dùng khi dự án có quy trình chạy riêng. |
| **/debug [description]** | Bật debug log của phiên và nhờ Claude phân tích. Dùng khi điều tra lỗi runtime khó hiểu; logging có thể chỉ bắt đầu từ lúc gọi lệnh. |
| **/doctor [prompt-audit [path]]** | Health check cài đặt/cấu hình; tìm PATH, settings lỗi, bản cài trùng, hook chậm, skill/plugin/MCP tốn context. /doctor prompt-audit rà hướng dẫn lỗi thời/xung đột. Đề xuất sửa sau khi trình bày kết quả. Alias: **/checkup**. |
| **/fewer-permission-prompts** | Phân tích lệnh Bash/MCP chỉ đọc hay dùng và đề xuất allowlist. Dùng giảm yêu cầu duyệt lặp lại; luôn rà quyền trước khi lưu. |
| **/auto-mode-setup** | Đề xuất autoMode.environment từ dự án/phiên gần đây để bạn xem và lưu. Có điều kiện gói/phiên bản. |
| **/sandbox** | Xem/chuyển sandbox mode trên hệ điều hành được hỗ trợ. Dùng để kiểm tra mức cô lập khi Claude chạy Bash. |
| **/heapdump** | Tạo snapshot bộ nhớ để điều tra RAM cao. Lệnh ẩn, phải nhập đầy đủ. Snapshot có thể chứa hội thoại/credential; không chia sẻ file snapshot, chỉ gửi file diagnostics được hướng dẫn. |
| **/pr-comments [PR]** | **Đã bị gỡ từ v2.1.91.** Ở bản cũ lấy comment PR qua gh; hiện hãy yêu cầu Claude đọc comment trực tiếp hoặc dùng code review. |

### D. Model, cấu hình và giao diện

| Lệnh | Cách dùng, công dụng và vấn đề giải quyết |
|---|---|
| **/model [model]** | Mở picker hoặc đổi model. Dùng khi cần cân bằng năng lực/tốc độ; model hỗ trợ có thể cho chỉnh effort. |
| **/effort [level\|auto\|status\|ultracode]** | Đặt/xem effort suy luận và Ultracode nếu khả dụng. Ví dụ **/effort high**, **/effort status**. Mức max có thể chỉ áp dụng cho phiên hiện tại. |
| **/fast [on\|off]** | Bật/tắt Fast mode. Dùng khi ưu tiên tốc độ; lượt đang chạy có thể tiếp tục ở tốc độ cũ. |
| **/config [key=value …]** | Mở Settings hoặc đặt cấu hình trực tiếp, ví dụ **/config theme=dark**. Alias: **/settings**. Một số setting cần xác nhận trong giao diện. |
| **/output-style [style]** | Liệt kê/chọn output style, ví dụ **/output-style concise**. Dùng để định dạng câu trả lời nhất quán. |
| **/color [color\|default]** | Đổi màu prompt bar của phiên hoặc trả về mặc định; tiện phân biệt phiên. |
| **/focus [on\|off]** | Bật/tắt giao diện tập trung trong CLI, chỉ giữ prompt, tóm tắt tool call và kết quả. VS Code có Focus view riêng. |
| **/theme** | Chọn theme sáng/tối/auto hoặc theme tùy chỉnh của terminal. |
| **/tui [default\|fullscreen]** | Đổi renderer terminal; fullscreen có giao diện toàn màn hình. Dùng khi muốn đổi cách hiển thị CLI. |
| **/scroll-speed** | Chỉnh tốc độ cuộn trong một số giao diện fullscreen; không phải lệnh phát triển code. |
| **/statusline** | Cấu hình status line hiển thị thông tin thường xem trong shell. |
| **/keybindings** | Mở file phím tắt để tra/chỉnh tổ hợp phím. |
| **/terminal-setup** | Thiết lập phím xuống dòng/clipboard/bell theo terminal/editor; dùng khi Shift+Enter hoặc copy hoạt động không đúng. |
| **/voice [hold\|tap\|off]** | Bật/tắt đọc chính tả bằng giọng nói hoặc chọn chế độ; cần tài khoản Claude.ai. |
| **/powerup** | Bài học tương tác ngắn giới thiệu tính năng Claude Code. |

### E. MCP, plugin, skill, hook và tích hợp IDE

| Lệnh | Cách dùng, công dụng và vấn đề giải quyết |
|---|---|
| **/mcp [reconnect\|enable\|disable …]** | Xem MCP/OAuth, kết nối lại hoặc bật/tắt server. Ví dụ **/mcp reconnect github**. Dùng khi Claude cần công cụ ngoài hoặc MCP lỗi kết nối. |
| **/claude-in-chrome [task]** | Điều khiển Chrome qua tích hợp Claude in Chrome: kiểm thử trang, điền form hoặc đọc console. Ví dụ **/claude-in-chrome kiểm tra lỗi console localhost:3000**; cần kết nối Chrome. |
| **/plugin [subcommand]** | Mở menu quản lý plugin hoặc chạy list/install/enable/disable. |
| **/reload-plugins [--force]** | Nạp lại plugin để áp dụng thay đổi không cần khởi động lại; **--force** ép reload khi thay đổi MCP có thể làm mới cache. |
| **/reload-skills** | Quét lại thư mục skill/command để lệnh vừa thêm/sửa có hiệu lực trong phiên. |
| **/skills** | Liệt kê/lọc skill và thay đổi mức hiển thị với Claude/menu nếu được phép. Một số skill plugin/managed bị khóa. |
| **/skill-doctor** | Xem chi phí context và mức sử dụng mỗi skill; giúp tìm skill tốn ngữ cảnh nhưng ít dùng. Cần phiên bản/feature hỗ trợ. |
| **/hooks** | Xem cấu hình hook để chẩn đoán tự động hóa theo sự kiện. |
| **/permissions** | Quản lý luật Allow / Ask / Deny, phạm vi và thư mục. Alias: **/allowed-tools**. |
| **/update-config [request]** | Skill sửa settings.json theo yêu cầu ngôn ngữ tự nhiên, ví dụ cho phép command hay thêm hook. Với theme/model dùng /config. |
| **/ide** | Quản lý tích hợp IDE và xem trạng thái kết nối; dùng khi CLI chưa liên kết với VS Code. |
| **/import [codex\|gemini\|cursor] [--dry-run] [--yes]** | Nhập instruction, MCP, commands, agents, skills từ công cụ khác. --dry-run xem trước; --yes bỏ picker. Không khả dụng ở mọi provider/phiên bản. |
| **/plugin-authoring** | Nạp hướng dẫn tạo/chỉnh plugin hoặc mod cho Claude Code; cần bản mới hỗ trợ. |
| **/workflow-authoring** | Nạp tài liệu tạo dynamic workflow, API, resume và mẫu tốt. |
| **/claude-api [subcommand]** | Nạp tài liệu Claude API/Managed Agents; tự kích hoạt khi repo dùng Anthropic SDK. Subcommand có thể hỗ trợ migrate, upgrade, audit prompt, tối ưu chi phí/eval. |
| **/setup-bedrock** | Wizard cấu hình Amazon Bedrock: auth, region, model. Ẩn trong menu đến khi bật CLAUDE_CODE_USE_BEDROCK=1; nhập đủ tên lệnh. |
| **/setup-vertex** | Wizard cấu hình Google Cloud’s Agent Platform: auth, project, region, model. Ẩn đến khi bật CLAUDE_CODE_USE_VERTEX=1; nhập đủ tên lệnh. |
| **/install-github-app** | Cài Claude GitHub App cho repo, tùy chọn cấu hình Actions/secrets; chỉ hỗ trợ github.com. |
| **/install-slack-app** | Mở trình duyệt hoàn tất OAuth để cài Claude Slack app. |
| **/web-setup** | Kết nối GitHub cho cloud sessions qua credential của gh local. |

### F. Thiết kế, dữ liệu, artifact và nghiên cứu

| Lệnh | Cách dùng, công dụng và vấn đề giải quyết |
|---|---|
| **/deep-research &lt;question&gt;** | Workflow tìm web từ nhiều hướng, đối chiếu nguồn và tổng hợp báo cáo có trích dẫn. Dùng cho câu hỏi cần nghiên cứu/kiểm chứng; khả năng tùy môi trường. |
| **/dataviz [request]** | Skill tư vấn biểu đồ/dashboard, chọn loại biểu đồ, màu, tương phản và accessibility. Dùng khi biểu diễn dữ liệu. |
| **/design [brief]** | Tạo mockup, screen flow, landing page hoặc poster thành artboard Claude Design. Cần artifacts/template/account hỗ trợ. |
| **/design-login** | Ủy quyền truy cập design system cho /design-sync. |
| **/design-sync [hint]** | Đồng bộ React design system trong repo lên Claude Design để thiết kế dùng component thật. Lần đầu có thể mất thời gian kiểm tra component. |
| **/slides [brief]** | Tạo presentation Claude Slides từ brief. Chỉ có khi template/artifact/account được hỗ trợ. |
| **/artifacts** | Liệt kê artifact được sở hữu/chia sẻ, đính kèm, mở trên browser hoặc copy link; cần tính năng artifacts. |
| **/artifact-capabilities** | Nạp tài liệu runtime artifact như connector và tải file; Claude thường tự nạp khi cần. |
| **/artifact-diagramming** | Nạp hướng dẫn tạo diagram/SVG dễ đọc trong theme sáng/tối. |
| **/release-notes** | Xem changelog theo phiên bản; dùng để hiểu thay đổi sau khi cập nhật. |
| **/insights** | Tạo báo cáo HTML về cách dùng Claude Code trên máy, dự án, lỗi thường gặp và tính năng có thể thử. Không có trong cloud sessions. |

### G. Tài khoản, giới hạn sử dụng và tiện ích

| Lệnh | Cách dùng, công dụng và vấn đề giải quyết |
|---|---|
| **/usage** | Xem session cost, giới hạn gói và thống kê hoạt động. Hữu ích khi theo dõi quota/chi phí. |
| **/cost** | Alias của **/usage**. |
| **/stats** | Alias của **/usage**, mở tab thống kê. |
| **/rate-limit-options** | Hiện lựa chọn khi hết hạn mức: đợi reset, usage credits hoặc nâng cấp. Gói/provider có thể không hỗ trợ. |
| **/usage-credits** | Mở cấu hình usage credits hoặc gửi yêu cầu đến admin. Dùng khi bị chặn bởi hạn mức. |
| **/upgrade** | Mở trang nâng cấp gói; có thể không xuất hiện với Enterprise. |
| **/passes** | Chia sẻ một tuần dùng miễn phí nếu tài khoản đủ điều kiện. |
| **/privacy-settings** | Xem/chỉnh thiết lập quyền riêng tư; chỉ có ở một số gói Pro/Max. |
| **/login** | Đăng nhập tài khoản Anthropic. |
| **/logout** | Đăng xuất Anthropic; có thể không có khi dùng provider bên thứ ba. |
| **/bug [report]** | Báo lỗi/chia sẻ phiên sau bước consent; alias **/share**. VS Code có dialog riêng. Nếu không kết nối Anthropic phù hợp, báo cáo có thể được lưu local để tự gửi. |
| **/feedback [report]** | Gửi góp ý/báo lỗi với mô tả điền trước; cách gửi phụ thuộc kết nối và chính sách tổ chức. |
| **/mobile** | Hiện QR tải app Claude mobile. Alias: **/ios**, **/android**. |
| **/radio** | Mở Claude FM lo-fi radio; tiện ích giải trí, không thay đổi code. |
| **/stickers** | Mở trang đặt sticker Claude Code. |
| **/team-onboarding** | Tạo tài liệu Markdown hướng dẫn đồng đội từ lịch sử sử dụng 30 ngày gần nhất; khả năng chia sẻ tùy gói. |

### H. Lệnh đã gỡ và alias cần nhớ

| Lệnh | Tình trạng/ý nghĩa |
|---|---|
| **/ultraplan &lt;prompt&gt;** | Đã bị gỡ; dùng Plan mode hoặc **/plan** thay thế. |
| **/vim** | Đã bị gỡ; vào **/config → Editor mode** để đổi Vim/Normal. |
| **/pr-comments [PR]** | Đã bị gỡ từ v2.1.91; yêu cầu Claude đọc comment trực tiếp hoặc dùng code review. |
| **/ultrareview [PR\|branch]** | Review sâu đa agent trên cloud; alias **/code-review ultra**. Có thể cần usage credits sau số lượt miễn phí. |
| **/reset**, **/new** | Alias của **/clear**. |
| **/settings** | Alias của **/config**. |
| **/review** | Alias của **/code-review**. |
| **/checkpoint**, **/undo** | Alias của **/rewind**. |
| **/bashes** | Alias của **/tasks**. |
| **/tp** | Alias của **/teleport**. |
| **/rc** | Alias của **/remote-control**. |
| **/bg** | Alias của **/background**. |
| **/app** | Alias của **/desktop**. |
| **/continue** | Alias của **/resume**. |
| **/allowed-tools** | Alias của **/permissions**. |
| **/checkup** | Alias của **/doctor**. |
| **/proactive** | Alias của **/loop**. |
| **/routines** | Alias của **/schedule**. |
| **/quit** | Alias của **/exit**. |
| **/share** | Alias của **/bug** trong danh mục hiện tại. |
| **/ios**, **/android** | Alias của **/mobile**. |

---

## 5. Cách dùng nhanh trên Windows

1. Mở project và Claude Code panel.
2. Nhấn **/** trong ô chat để tìm slash command; hoặc **Ctrl+Shift+P → Claude Code** để tìm lệnh VS Code.
3. Với nhiệm vụ lớn, bắt đầu bằng **/plan mô_tả_nhiệm_vụ** và duyệt kế hoạch trước khi cho sửa.
4. Xem thay đổi bằng **/diff**; kiểm tra bug bằng **/code-review**; xác minh hành vi bằng **/verify**.
5. Nếu phiên dài, dùng **/context** để xem phần tốn ngữ cảnh rồi **/compact** để tóm tắt.
6. Dùng **/status** để kiểm tra phiên bản/model/MCP và **/help** để xem lệnh đang có.

Ví dụ:

- **/plan tìm nguyên nhân refresh token bị xoay sai; liệt kê file cần sửa, chưa chỉnh code trước khi tôi duyệt**
- **/code-review high src/auth**
- **/compact giữ lại quyết định API, file đã sửa và test còn lỗi**
- **/mcp reconnect github**
- **/export debug-notes.txt**
- **/btw lệnh chạy test tích hợp trong repo này là gì?**

---

## 6. Lưu ý quyền và dữ liệu

- **/permissions** quyết định công cụ nào được phép chạy, cần hỏi hoặc bị chặn. Đọc yêu cầu trước khi cấp quyền.
- **/add-dir** cấp thêm thư mục cho phiên; chỉ thêm đúng phạm vi cần thiết.
- **/sandbox** phụ thuộc nền tảng; không mặc định mọi lệnh Bash đều bị cô lập.
- **/bug** và **/feedback** có thể đưa nội dung phiên vào báo cáo. Kiểm tra nội dung và xác nhận trước khi gửi.
- **/heapdump** có thể chứa hội thoại/credential trong snapshot; không chia sẻ snapshot.
- Plugin/MCP/hook có thể thêm hành vi mới. Chỉ cài nguồn đáng tin cậy và rà quyền truy cập.

## 7. Nguồn và phạm vi

1. Anthropic, [Use Claude Code in VS Code](https://code.claude.com/docs/en/vs-code) — command menu, Customize/Context/Settings, extension commands, phím tắt và giới hạn so với CLI.
2. Anthropic, [Commands](https://code.claude.com/docs/en/commands) — command tích hợp, cú pháp, alias, lệnh ẩn/đã gỡ và điều kiện khả dụng.
3. Tài liệu thay đổi theo phiên bản. Menu **/** trên cài đặt thực tế là căn cứ cuối cùng. Skill/command tùy chỉnh, plugin và MCP prompt có thể làm danh sách khác đi.

