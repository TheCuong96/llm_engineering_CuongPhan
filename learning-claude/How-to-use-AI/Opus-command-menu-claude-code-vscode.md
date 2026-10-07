# Command Menu của Claude Code — Cẩm nang tiếng Việt toàn bộ lệnh

**Cập nhật: 07/10/2026**

> Tài liệu này giải thích **command menu** (menu mở bằng phím `/`) của Claude Code, tập trung vào **tiện ích VS Code**, kèm bảng tra cứu **toàn bộ slash command** của Claude Code. Với mỗi mục, tài liệu nêu: **công dụng**, **cách dùng** và **vấn đề mà nó giải quyết**.
>
> Nguồn chính thức:
>
> - [Use Claude Code in VS Code](https://code.claude.com/docs/en/vs-code)
> - [Commands — danh sách đầy đủ](https://code.claude.com/docs/en/commands)
>
> Claude Code cập nhật rất thường xuyên. Tên lệnh, giao diện và phiên bản yêu cầu có thể đổi. Nếu gõ một lệnh mà thấy `Unknown command`, hãy cập nhật extension hoặc đối chiếu lại trang docs.

---

## Mục lục

1. [Command menu là gì?](#1-command-menu-là-gì)
2. [Quy tắc hoạt động của lệnh](#2-quy-tắc-hoạt-động-của-lệnh)
3. [Command menu trong VS Code — từng mục](#3-command-menu-trong-vs-code--từng-mục)
4. [Các tính năng khác của ô nhập prompt](#4-các-tính-năng-khác-của-ô-nhập-prompt)
5. [Bảng tra cứu toàn bộ slash command](#5-bảng-tra-cứu-toàn-bộ-slash-command)
6. [Lệnh trong Command Palette của VS Code và phím tắt](#6-lệnh-trong-command-palette-của-vs-code-và-phím-tắt)
7. [Checkpoints, lịch sử phiên, plugin và MCP](#7-checkpoints-lịch-sử-phiên-plugin-và-mcp)
8. [Dùng lệnh nào ở giai đoạn nào?](#8-dùng-lệnh-nào-ở-giai-đoạn-nào)
9. [Bài tập thực hành](#9-bài-tập-thực-hành)

---

## 1. Command menu là gì?

**Command menu** là menu hiện ra khi bạn **gõ `/`** hoặc **bấm nút `/`** ở ô nhập prompt của Claude Code. Đây là “bảng điều khiển” của phiên làm việc: đổi model, đổi chế độ quyền, quản lý ngữ cảnh, cấu hình MCP/hook/plugin, xem chi phí, xuất hội thoại…

**Vấn đề nó giải quyết:** thay vì phải nhớ file cấu hình nằm ở đâu, hoặc mô tả bằng lời để Claude tự làm (tốn token, dễ sai), bạn điều khiển Claude Code trực tiếp và có kết quả tức thì.

Có **hai lớp** cần phân biệt:

| Lớp | Mở bằng | Dùng để |
|---|---|---|
| **Command menu / slash command** | Gõ `/` trong ô prompt của Claude | Điều khiển *phiên Claude* (model, context, quyền, MCP…) |
| **Command Palette của VS Code** | `Ctrl+Shift+P` → gõ “Claude Code” | Điều khiển *tiện ích trong VS Code* (mở tab mới, đổi vị trí panel, xem log…) |

### So sánh tiện ích VS Code và CLI

| Tính năng | CLI (terminal) | Tiện ích VS Code |
|---|---|---|
| Lệnh và skill | Tất cả | Một tập con (gõ `/` để xem) |
| Cấu hình MCP | Có | Có (`/mcp` trong panel chat) |
| Checkpoints | Có | Có |
| Lối tắt `!` để chạy Bash | Có | Không |
| Tab completion | Có | Không |

> Cần lệnh chỉ có trong CLI? Mở terminal tích hợp (`` Ctrl+` ``) và chạy `claude`. Lưu ý: cài extension **không** thêm `claude` vào PATH, bạn cần [cài CLI riêng](https://code.claude.com/docs/en/setup). Hai bên dùng chung lịch sử hội thoại: chạy `claude --resume` để mở tiếp một hội thoại bắt đầu trong extension.

---

## 2. Quy tắc hoạt động của lệnh

1. **Lệnh chỉ được nhận ở đầu tin nhắn.** Phần chữ phía sau tên lệnh trở thành *tham số*. Ví dụ `/plan sửa bug đăng nhập` → tham số là “sửa bug đăng nhập”.
2. **Ký hiệu tham số:** `<arg>` là bắt buộc, `[arg]` là tuỳ chọn.
3. **Gửi lệnh khi Claude đang trả lời:** lệnh được **xếp hàng** và chạy sau khi lượt hiện tại xong. Một số lệnh chạy **ngay** mà không làm gián đoạn: `/status`, `/tasks`, `/usage`; một số khác như `/model`, `/effort`, `/fast`, `/permissions`, `/add-dir` áp dụng ngay trong lượt đang chạy.
4. **Nối nhiều skill:** `/skill-a /skill-b làm XYZ` nạp cả hai skill và truyền phần chữ cuối làm tham số cho từng skill (tối đa 6 skill).
5. **Cách menu lọc khi gõ:**
   - Khớp từ đầu tên hoặc từ đầu một từ trong tên, bỏ qua dấu `:`, `_`, `-`. Ví dụ gõ `/adddir` → gợi ý `/add-dir`; gõ `/new` → gợi ý `/clear` (qua alias).
   - Gõ sai chính tả: menu không tô sáng gì, `Enter` sẽ gửi nguyên văn và báo `Unknown command`. Dùng `Tab` hoặc phím mũi tên để chọn gợi ý gần đúng.
   - Lệnh không khả dụng với tài khoản/nền tảng của bạn sẽ không hiện ra.
   - Một số lệnh bị **ẩn** (ví dụ `/heapdump`): phải gõ đủ tên mới chạy.
6. **Ba loại mục trong menu:**
   - **Lệnh built-in:** hành vi được lập trình sẵn trong CLI.
   - **Skill (bundled skill):** thực chất là một prompt được giao cho Claude, giống skill bạn tự viết.
   - **Workflow:** điều phối nhiều subagent chạy nền (ví dụ `/deep-research`).
   - Ngoài ra, **MCP server** có thể đăng ký *prompt* của nó thành lệnh, và **skill tự viết** của bạn cũng xuất hiện trong menu.

---

## 3. Command menu trong VS Code — từng mục

Bấm `/` (hoặc gõ `/`) trong ô prompt của panel Claude. Menu chia thành các nhóm. Mục có **biểu tượng terminal** sẽ mở trong terminal tích hợp.

### 3.1. Nhóm thao tác nhanh

#### Attach file (đính kèm tệp)

- **Công dụng:** đưa tệp hoặc ảnh vào ngữ cảnh của tin nhắn.
- **Cách dùng:** chọn trong menu `/`; hoặc **dán ảnh** từ clipboard vào ô prompt; hoặc **giữ `Shift` và kéo-thả** tệp vào ô prompt. Bấm **X** trên tệp đính kèm để bỏ.
- **Giải quyết:** không phải copy-paste nội dung dài; Claude đọc đúng tệp bạn muốn, kể cả ảnh chụp màn hình lỗi giao diện.

#### Switch model… (đổi model)

- **Công dụng:** đổi model ngay giữa phiên; nếu model hỗ trợ, có thêm hàng **Effort** (mức suy luận) và công tắc **Ultracode**.
- **Cách dùng:** chọn **Switch model…** trong menu, bấm vào tên model ở chân ô prompt, hoặc gõ `/model`.
  - Chọn mức effort khác `max` → được lưu làm mặc định cho model đó (trong `modelSettings` của user settings). `max` chỉ áp dụng cho phiên hiện tại.
  - **Ultracode** (khi bật dynamic workflows): Claude tự lập workflow nhiều agent cho mỗi tác vụ đáng kể trong phiên; nút model hiện thêm `· Ultracode`.
- **Giải quyết:** dùng model nhanh/rẻ cho việc đơn giản, model mạnh cho việc khó, mà không cần mở phiên mới.

#### Extended thinking (suy nghĩ mở rộng)

- **Công dụng:** cho Claude thời gian suy luận lâu hơn trước khi trả lời.
- **Cách dùng:** bật/tắt trong menu `/`. Phần suy nghĩ hiện dưới dạng khối thu gọn; bấm để đọc, hoặc `Ctrl+O` để mở/đóng tất cả khối thinking.
- **Giải quyết:** bài toán phức tạp (thiết kế kiến trúc, bug khó, thuật toán) cần suy luận nhiều bước; đọc phần thinking giúp bạn hiểu Claude đã lập luận thế nào.

### 3.2. Nhóm Customize (tuỳ biến)

| Mục | Lệnh tương đương | Công dụng | Vấn đề giải quyết |
|---|---|---|---|
| **Slash commands** | `/skills` | Mở hộp thoại liệt kê mọi lệnh và skill, có ô lọc. Chọn để chạy. Mỗi skill hiển thị **mức hiển thị** (On, Name only…); bấm để đổi, trừ dòng có nhãn **locked** (như skill của plugin) | Không nhớ hết tên lệnh; muốn ẩn bớt skill ít dùng để giảm chi phí context |
| **MCP servers** | `/mcp` | Thêm/xoá server (scope local, user, project), bật/tắt, kết nối lại, quản lý OAuth | Kết nối Claude với GitHub, database, API ngoài mà không phải sửa JSON bằng tay |
| **Output styles** | `/output-style` | Chọn kiểu trả lời (ví dụ *Learning*, *Explanatory*, kiểu tự tạo). Có mục **Build a custom style** để Claude viết file style cho bạn ở cấp project hoặc user | Muốn Claude giải thích kỹ hơn để học, hoặc ngắn gọn hơn khi làm việc |
| **Hooks** | `/hooks` | Xem các hook đang nạp, nhóm theo sự kiện; thêm, sửa, xoá hook trong user/project/local settings. Hook từ managed settings hoặc plugin chỉ đọc | Tự động hoá: chạy formatter sau khi sửa file, chặn lệnh nguy hiểm, thông báo khi xong |
| **Memory** | `/memory` | Bật/tắt **auto memory**; duyệt, đọc, sửa, xoá các ghi nhớ Claude đã lưu; mở thư mục chứa chúng | Claude nhớ sở thích và bối cảnh dự án giữa các phiên; bạn kiểm soát được nó nhớ gì |
| **Instructions** | `/memory` | Mở và sửa các file `CLAUDE.md` mà Claude đọc. Nếu file chưa có, Claude Code tạo trước | Ghi quy ước dự án (lệnh build, style code, cấm gì) một lần, Claude áp dụng mọi phiên |
| **Permissions** | `/permissions` | Xem quy tắc quyền theo nhóm **Allow / Ask / Deny**; thêm vào user, project hoặc local settings, hoặc xoá quy tắc đã lưu | Bớt bị hỏi quyền cho lệnh an toàn (`npm test`), chặn hẳn lệnh/tệp nhạy cảm (`.env`) |
| **Plugins** | `/plugins` (VS Code), `/plugin` (CLI) | Mở giao diện **Manage plugins**: cài, bật/tắt, gỡ plugin; quản lý marketplace | Cài trọn gói skill + hook + MCP + agent do người khác đóng gói, chia sẻ cho cả nhóm |
| **Status** | `/status` | Xem phiên bản Claude Code, tài khoản, model, chi tiết MCP server | Gỡ lỗi nhanh: “mình đang dùng model nào, MCP đã kết nối chưa?” |
| **Sandbox** | `/sandbox` | Xem lệnh Bash của Claude có chạy trong sandbox không; đổi chế độ sandbox và thêm lệnh loại trừ | Cho Claude chạy lệnh tự do hơn mà vẫn cô lập được hệ thống tệp/mạng |
| **Claude in Chrome** | `/chrome` | Kiểm tra và quản lý kết nối tới tiện ích Claude in Chrome (cần đăng nhập tài khoản claude.ai) | Cho Claude mở trang web, đọc console, test giao diện ngay trong trình duyệt của bạn |
| **Commands** | — | Quản lý lệnh tuỳ chỉnh | Đóng gói prompt hay dùng thành lệnh riêng |

### 3.3. Nhóm Context (ngữ cảnh)

#### Export conversation — `/export [tên-file]`

- **Công dụng:** xuất hội thoại thành văn bản thuần, copy vào clipboard hoặc lưu file.
- **Cách dùng:** chọn trong menu, hoặc gõ `/export`. Gõ kèm tên file như `/export notes.txt` để bỏ qua hộp thoại và chọn chỗ lưu.
- **Giải quyết:** lưu lại phiên debug, viết tài liệu, gửi cho đồng nghiệp xem cách bạn đã giải quyết vấn đề.

#### Bookmarks — `/bookmarks`

- **Công dụng:** mở panel các câu trả lời đã đánh dấu.
- **Cách dùng:** di chuột lên một câu trả lời → **Bookmark response**. Xem lại bằng biểu tượng bookmark trên đầu panel, mục **Bookmarks** trong menu, hoặc gõ `/bookmarks`. Gỡ bằng **Remove bookmark**.
- **Giải quyết:** hội thoại dài thì khó tìm lại câu trả lời quan trọng (một đoạn code, một lời giải thích hay).

### 3.4. Nhóm Settings (cài đặt)

| Mục | Công dụng | Vấn đề giải quyết |
|---|---|---|
| **General config…** | Mở VS Code Settings tại Extensions → Claude Code | Đổi các thiết lập của extension (xem [mục 6.3](#63-thiết-lập-của-tiện-ích-extension-settings)) |
| **Enable Remote Control for all sessions** | Bật/tắt `remoteControlAtStartup`: mọi phiên tương tác mới tự kết nối Remote Control. Áp dụng ngay cho phiên đang mở trong cửa sổ đó (và các cửa sổ VS Code khác từ v2.1.261) | Tiếp tục phiên đang chạy trên máy tính từ điện thoại hoặc claude.ai |
| **Focus view** | Ẩn tool call, kết quả tool, thinking vào các dòng thu gọn; chỉ để lại prompt của bạn và câu trả lời của Claude. Danh sách to-do mới nhất và câu hỏi đang chờ vẫn hiện. Phím tắt `Ctrl+Alt+F` | Hội thoại bớt rối, dễ đọc khi bạn chỉ cần kết quả |
| **Sign out** (`/logout`) | Đăng xuất tài khoản Anthropic. Không có khi dùng nhà cung cấp bên thứ ba | Đổi tài khoản, chuyển sang API key hoặc Bedrock/Vertex |

### 3.5. Report a problem — `/bug` hoặc `/feedback`

- **Công dụng:** báo lỗi hoặc gửi góp ý kèm ngữ cảnh phiên.
- **Cách dùng:** bấm **Report a problem** ở cuối menu, hoặc gõ `/bug mô tả lỗi` để điền sẵn nội dung.
  - Đăng nhập Anthropic (kết nối first-party): báo cáo được gửi tới Anthropic.
  - Dùng nhà cung cấp bên thứ ba hoặc không có thông tin đăng nhập Anthropic: **không gửi gì cả**, báo cáo được lưu thành file nén cục bộ tại `~/.claude/feedback-bundles/` (đã che API key/token) để bạn tự gửi cho support.
  - Nếu tổ chức tắt feedback, mục này không xuất hiện.
- **Giải quyết:** báo lỗi có kèm log và ngữ cảnh thay vì mô tả chung chung.

---

## 4. Các tính năng khác của ô nhập prompt

Những tính năng sau không hẳn nằm trong menu `/` nhưng đi cùng nó và rất hay dùng.

### 4.1. Chế độ quyền (Permission modes)

Bấm vào chỉ báo chế độ ở chân ô prompt để đổi:

| Chế độ | Hành vi | Khi nào dùng |
|---|---|---|
| **Auto** | Một bộ phân loại (classifier) duyệt hầu hết hành động thay vì hỏi bạn | Làm việc liên tục, tin tưởng môi trường |
| **Manual** | Claude xin phép trước khi sửa file và trước hầu hết lệnh shell; hiện diff hai bên để bạn chấp nhận/từ chối | Codebase quan trọng, muốn duyệt từng thay đổi |
| **Plan** | Claude mô tả kế hoạch và chờ bạn duyệt rồi mới sửa. VS Code mở kế hoạch thành tài liệu Markdown để bạn **comment trực tiếp** | Thay đổi lớn, cần thống nhất hướng đi trước |
| **Edit automatically** | Claude sửa file không cần hỏi | Việc lặp lại, ít rủi ro |
| **Bypass permissions** | Bỏ qua mọi lời hỏi quyền. Chỉ hiện khi bật `allowDangerouslySkipPermissions` | **Chỉ** trong sandbox không có internet |

**Lệnh `/plan`:**

- `/plan` → chuyển sang plan mode; nếu đang ở plan mode thì hiện kế hoạch hiện tại.
- `/plan sửa bug auth` → chuyển sang plan mode và bắt đầu lập kế hoạch cho việc đó.
- `/plan open` → mở file kế hoạch trong editor (khi đang ở plan mode).

**Duyệt từng thay đổi:** trong diff, dùng nút **Accept this change** / **Reject this change** dưới mỗi thay đổi (diff trên 100 thay đổi thì phải duyệt cả file). Nếu bạn tự sửa nội dung đề xuất trước khi chấp nhận, Claude được báo rằng bạn đã chỉnh.

### 4.2. Chỉ báo ngữ cảnh và `/compact`

- **Context indicator** cho biết bạn đã dùng bao nhiêu phần cửa sổ ngữ cảnh.
- Claude tự **compact** (tóm tắt hội thoại) khi cần, hoặc bạn chạy `/compact` thủ công, có thể kèm hướng dẫn: `/compact giữ lại các quyết định về schema DB`.
- **Giải quyết:** hội thoại dài làm Claude “quên” chi tiết đầu phiên và tốn token; compact giải phóng chỗ mà vẫn giữ ý chính.

### 4.3. Đồng hồ prompt cache

- Biểu tượng đồng hồ cạnh chỉ báo context ước lượng thời gian còn lại của **prompt cache** (5 phút hoặc 1 giờ), ví dụ **12m**. Mỗi câu trả lời dùng cache sẽ đếm lại từ đầu.
- Khi hết giờ, biểu tượng chuyển **đỏ**: tin nhắn kế tiếp sẽ chậm và đắt hơn vì cache phải dựng lại. Ngay sau khi compact, nó cũng đỏ cho đến câu trả lời tiếp theo.
- **Giải quyết:** giúp bạn hiểu vì sao có lúc Claude trả lời chậm/tốn usage hơn, và nên gửi tin nhắn tiếp khi cache còn.

### 4.4. Agent map — `/tasks`

- Khi hội thoại có subagent, chân ô prompt hiện số lượng như **2 agents**. Bấm vào để mở **agent map**: cây subagent với trạng thái, thời gian, số token; xem prompt, tool call, transcript chỉ-đọc, hoặc dừng subagent.
- Map còn liệt kê **tác vụ nền** (lệnh shell chạy nền, monitor) kèm output mới nhất.
- Gõ `/tasks` để mở map khi không thấy số agent (ví dụ chỉ có dev server chạy nền).
- Nút **Run in background** dưới một lệnh chạy lâu hoặc một subagent: Claude thôi chờ, tác vụ tiếp tục chạy nền và báo lại khi xong.
- **Giải quyết:** theo dõi và kiểm soát công việc song song, dừng được tiến trình chạy quá lâu hoặc đi sai hướng.

### 4.5. Câu hỏi bên lề — `/btw`

- **Công dụng:** hỏi một câu về phiên hiện tại **mà không thêm vào hội thoại chính**. Câu trả lời mở ở panel bên cạnh, có thể hỏi tiếp.
- **Ví dụ:** `/btw biến cfg ở trên được khai báo ở file nào?`
- **Giải quyết:** không làm loãng ngữ cảnh chính bằng các câu hỏi phụ.

### 4.6. Sao chép câu trả lời — `/copy [N]`

- Di chuột lên câu trả lời → **Copy response**, hoặc gõ `/copy` (câu mới nhất), `/copy 2` (câu áp chót).

### 4.7. Tham chiếu tệp, thư mục, terminal, trình duyệt bằng `@`

| Cú pháp | Ý nghĩa |
|---|---|
| `@auth` | Tìm gần đúng (fuzzy): khớp `auth.js`, `AuthService.ts`… |
| `@src/components/` | Cả thư mục (có dấu `/` ở cuối) |
| `@app.ts#5-10` | Dòng 5–10 của file. Bôi đen code rồi bấm `Alt+K` để chèn tự động |
| `@terminal:tên` | Output của terminal có tiêu đề đó, khỏi copy log lỗi |
| `@browser …` | Giao việc cho Claude trên Chrome, ví dụ `@browser vào localhost:3000 và kiểm tra lỗi console` |

- Claude **tự thấy** đoạn code bạn đang bôi đen và file đang mở. Bấm **X** trên chỉ báo selection để không gửi.
- File bị `.gitignore`, `files.exclude`, `search.exclude` sẽ không bị gửi nội dung selection (trong panel chat).
- Với PDF lớn, có thể yêu cầu đọc trang cụ thể (cần `poppler-utils`).

### 4.8. Nhập nhiều dòng

- `Shift+Enter` để xuống dòng mà không gửi.

---

## 5. Bảng tra cứu toàn bộ slash command

Ký hiệu cột “VS Code”: **✅** = được docs VS Code nêu rõ là dùng được trong panel chat; **—** = chưa được nêu, có thể chỉ có trong CLI hoặc tuỳ phiên bản (cứ gõ `/` để kiểm tra). Ký hiệu **[Skill]** = bundled skill, **[Workflow]** = workflow nhiều agent.

### 5.1. Khởi tạo dự án và cấu hình

| Lệnh | Công dụng | Cách dùng / ví dụ | Vấn đề giải quyết | VS Code |
|---|---|---|---|---|
| `/init` | Tạo file `CLAUDE.md` khởi đầu cho dự án | `/init` | Claude hiểu ngay cấu trúc, lệnh build/test, quy ước của repo | — |
| `/memory` | Sửa `CLAUDE.md`, bật/tắt và xem auto memory | `/memory` | Quản lý những gì Claude ghi nhớ lâu dài | ✅ |
| `/config [key=value]` | Mở Settings (theme, model, output style…); hoặc đặt trực tiếp | `/config theme=dark`, `/config thinking=false`. Alias: `/settings` | Đổi thiết lập nhanh không cần mở file | — |
| `/update-config [yêu cầu]` | **[Skill]** Mô tả thay đổi bằng lời, Claude sửa đúng file `settings.json` | `/update-config cho phép chạy npm test không cần hỏi` | Không phải nhớ cú pháp settings/hook | — |
| `/permissions` | Quản lý quy tắc allow/ask/deny, thư mục làm việc, xem các lần auto mode từ chối | `/permissions`. Alias: `/allowed-tools` | Giảm hỏi quyền vô ích, chặn hành động nguy hiểm | ✅ |
| `/fewer-permission-prompts` | **[Skill]** Quét lịch sử, đề xuất allowlist cho lệnh chỉ-đọc hay dùng | `/fewer-permission-prompts` | Bị hỏi quyền quá nhiều cho `git status`, `ls`… | — |
| `/auto-mode-setup` | Soạn mục `autoMode.environment` từ dự án và phiên gần đây | `/auto-mode-setup` | Giúp classifier của auto mode hiểu môi trường của bạn | — |
| `/hooks` | Xem cấu hình hook | `/hooks` | Kiểm tra hook nào đang chạy ở sự kiện nào | ✅ |
| `/mcp [reconnect\|enable\|disable …]` | Quản lý MCP server và OAuth | `/mcp`, `/mcp reconnect all` | Kết nối công cụ ngoài, kết nối lại server lỗi | ✅ |
| `/plugin [subcommand]` | Quản lý plugin | `/plugin install …` (VS Code: `/plugins`) | Cài trọn gói tính năng | ✅ |
| `/reload-plugins [--force]` | Nạp lại plugin không cần khởi động lại | `/reload-plugins` | Áp dụng thay đổi plugin ngay | — |
| `/reload-skills` | Quét lại thư mục skill/command | `/reload-skills` | Vừa viết skill mới mà Claude chưa thấy | — |
| `/skills` | Liệt kê skill, lọc, sắp xếp theo token, đổi mức hiển thị | `/skills` | Biết skill nào tốn context, ẩn bớt | ✅ |
| `/skill-doctor` | Xem chi phí context và tần suất dùng của mỗi skill | `/skill-doctor` | Tìm skill thừa để tắt | — |
| `/output-style [style]` | Liệt kê hoặc chuyển output style | `/output-style concise` | Đổi cách Claude trình bày | ✅ |
| `/import [codex\|gemini\|cursor]` | Nhập cấu hình từ Codex, Gemini CLI, Cursor | `/import cursor --dry-run` | Chuyển sang Claude Code không phải làm lại từ đầu | — |
| `/add-dir <path>` | Thêm thư mục làm việc trong phiên | `/add-dir ../shared-lib` | Cho Claude đọc/sửa repo bên cạnh | — |
| `/cd <path>` | Chuyển phiên sang thư mục khác, giữ hội thoại | `/cd ../backend` | Đổi dự án mà không mất ngữ cảnh | — |
| `/statusline` | Cấu hình thanh trạng thái | `/statusline hiện nhánh git và model` | Thấy thông tin quan trọng liên tục | — |
| `/keybindings` | Mở file phím tắt | `/keybindings` | Tuỳ biến phím | — |
| `/terminal-setup` | Cài `Shift+Enter` xuống dòng cho terminal | `/terminal-setup` | Terminal không hỗ trợ nhập nhiều dòng | — |
| `/theme` | Đổi giao diện màu (có cả theme cho người mù màu) | `/theme` | Dễ nhìn hơn | — |
| `/color [màu]` | Đổi màu thanh prompt của phiên | `/color green` | Phân biệt nhiều phiên song song | — |
| `/tui [default\|fullscreen]` | Đổi bộ render terminal | `/tui fullscreen` | Giao diện không nhấp nháy | — |
| `/ide` | Quản lý tích hợp IDE | Chạy trong terminal ngoài để kết nối VS Code | CLI ở terminal ngoài vẫn dùng được diff/diagnostics của VS Code | — |
| `/sandbox` | Bật/tắt sandbox | `/sandbox` | Cô lập lệnh Bash | ✅ |
| `/chrome` | Cấu hình Claude in Chrome | `/chrome` | Tự động hoá trình duyệt | ✅ |

### 5.2. Trong lúc làm việc

| Lệnh | Công dụng | Cách dùng / ví dụ | Vấn đề giải quyết | VS Code |
|---|---|---|---|---|
| `/plan [mô tả]` | Vào plan mode | `/plan refactor module thanh toán` | Thống nhất hướng đi trước khi sửa code | ✅ |
| `/model [model]` | Đổi model (lưu làm mặc định) | `/model sonnet`; trong picker bấm `s` để chỉ đổi cho phiên này | Cân bằng tốc độ, chi phí, chất lượng | ✅ |
| `/effort [level\|auto\|ultracode]` | Đặt mức suy luận `low` → `xhigh`, `max`, `auto`; bật/tắt ultracode | `/effort high`, `/effort ultracode on` | Việc khó cần suy nghĩ kỹ, việc dễ cần nhanh | — |
| `/fast [on\|off]` | Bật/tắt fast mode (output nhanh hơn) | `/fast on` | Cần phản hồi nhanh | — |
| `/advisor [model\|off]` | Bật “cố vấn”: model thứ hai được hỏi ý kiến ở thời điểm quan trọng | `/advisor opus` | Thêm góc nhìn thứ hai cho quyết định khó | — |
| `/context [all]` | Hiển thị lưới mức dùng context, gợi ý tối ưu | `/context` | Biết cái gì đang chiếm context (MCP, memory, file…) | — |
| `/compact [hướng dẫn]` | Tóm tắt hội thoại để giải phóng context | `/compact tập trung vào API đã thiết kế` | Hội thoại quá dài | ✅ |
| `/autocompact [auto\|<tokens>]` | Đặt ngưỡng tự compact | `/autocompact 500k` | Kiểm soát lúc nào tự tóm tắt | — |
| `/btw [câu hỏi]` | Câu hỏi bên lề, không vào lịch sử | `/btw hàm này trả về gì?` | Giữ context chính gọn | ✅ |
| `/goal [điều kiện\|clear]` | Đặt mục tiêu: Claude làm tiếp qua nhiều lượt đến khi đạt | `/goal tất cả test trong tests/ đều pass` | Không phải nhắc “tiếp tục” nhiều lần | — |
| `/loop [khoảng] [prompt]` | **[Skill]** Chạy lặp một prompt khi phiên còn mở | `/loop 5m kiểm tra deploy xong chưa`. Alias: `/proactive` | Theo dõi/polling định kỳ | — |
| `/copy [N]` | Copy câu trả lời | `/copy 2` | Lấy code nhanh | ✅ |
| `/export [file]` | Xuất hội thoại | `/export log.txt` | Lưu trữ, chia sẻ | ✅ |
| `/recap` | Tóm tắt một dòng về phiên | `/recap` | Quay lại sau khi đi vắng, nhớ đang làm gì | — |
| `/rename [tên]` | Đổi tên phiên | `/rename fix-login-bug` | Dễ tìm lại trong lịch sử | — |
| `/claude-api [subcommand]` | **[Skill]** Nạp tài liệu Claude API/Managed Agents cho ngôn ngữ của dự án | `/claude-api migrate` | Viết code gọi Claude API đúng phiên bản, đúng model | — |
| `/dataviz [yêu cầu]` | **[Skill]** Hướng dẫn thiết kế biểu đồ, dashboard | `/dataviz biểu đồ doanh thu theo tháng` | Biểu đồ đẹp, nhất quán, dễ đọc cho người mù màu | — |

### 5.3. Làm việc song song và chạy nền

| Lệnh | Công dụng | Cách dùng / ví dụ | Vấn đề giải quyết | VS Code |
|---|---|---|---|---|
| `/tasks` | Xem, quản lý công việc nền (subagent, shell nền). Alias: `/bashes` | `/tasks` | Kiểm soát tiến trình chạy ngầm | ✅ |
| `/subtask <task>` | Tạo subagent rẽ nhánh, kế thừa toàn bộ hội thoại, chạy nền và trả kết quả về | `/subtask viết test cho utils/date.ts` | Giao việc phụ mà vẫn làm việc chính | — |
| `/fork [prompt]` | Sao chép hội thoại thành một phiên nền mới, bạn tiếp tục ở đây | `/fork thử cách dùng Redis` | Thử hướng khác song song | — |
| `/branch [tên]` | Tạo nhánh hội thoại và chuyển sang đó; quay lại bản gốc bằng `/resume` | `/branch thu-giai-phap-b` | Thử nghiệm mà không mất hội thoại gốc | — |
| `/background [prompt]` | Tách cả phiên thành background agent, giải phóng terminal. Alias: `/bg` | `/bg chạy xong migration rồi báo` | Việc dài, không cần ngồi chờ | — |
| `/stop` | Dừng phiên nền đang gắn vào | `/stop` | Dừng agent nền | — |
| `/batch <instruction>` | **[Skill]** Chia thay đổi lớn thành 5–30 đơn vị, mỗi đơn vị chạy trong worktree riêng | `/batch chuyển src/ từ JS sang TS` | Thay đổi diện rộng mất cả ngày nếu làm tuần tự | — |
| `/deep-research <câu hỏi>` | **[Workflow]** Tìm kiếm web nhiều hướng, đối chiếu nguồn, viết báo cáo có trích dẫn | `/deep-research so sánh các vector DB cho RAG` | Nghiên cứu nhiều nguồn tốn thời gian | — |
| `/workflows` | Xem tiến độ workflow: theo dõi, tạm dừng, tiếp tục, lưu | `/workflows` | Kiểm soát workflow nhiều agent | — |
| `/workflow-authoring` | **[Skill]** Tài liệu viết script workflow | `/workflow-authoring` | Tự viết workflow | — |
| `/agents` | Nhắc cách tạo/quản lý subagent (sửa `.claude/agents/`) | `/agents` | Tạo agent chuyên trách (reviewer, tester…) | — |
| `/list-agents` | Liệt kê subagent, teammate, phiên khác có thể nhắn tin. Alias: `/peers` | `/list-agents` | Phối hợp giữa nhiều phiên | — |
| `/schedule [mô tả]` | Tạo, sửa, chạy routine trên cloud theo lịch cron. Alias: `/routines` | `/schedule mỗi sáng thứ 2 tóm tắt PR mới` | Tự động hoá định kỳ không cần mở máy | — |

### 5.4. Trước khi ship (review và kiểm thử)

| Lệnh | Công dụng | Cách dùng / ví dụ | Vấn đề giải quyết | VS Code |
|---|---|---|---|---|
| `/diff` | Xem thay đổi trong working tree, gồm các sửa đổi của Claude | `/diff` | Biết chính xác Claude đã đổi gì | — |
| `/code-review [mức] [--fix] [--comment] [target]` | **[Skill]** Review diff hiện tại hoặc PR/nhánh để tìm bug. Alias: `/review` | `/code-review high`, `/code-review high 1234 --comment`, `/code-review --fix` | Bắt bug trước khi merge | — |
| `/code-review ultra` / `/ultrareview` | Review sâu nhiều agent trên cloud sandbox (Pro/Max có 3 lượt miễn phí) | `/code-review ultra 1234` | Review kỹ cho thay đổi quan trọng | — |
| `/simplify [target]` | **[Skill]** 4 agent song song tìm chỗ tái sử dụng, đơn giản hoá, hiệu năng, mức trừu tượng; rồi áp dụng sửa | `/simplify src/api` | Code chạy được nhưng rườm rà | — |
| `/security-review` | Phân tích thay đổi trên nhánh hiện tại để tìm lỗ hổng (injection, auth, lộ dữ liệu) | `/security-review` (cần remote `origin`) | Phát hiện lỗi bảo mật sớm | — |
| `/run` | **[Skill]** Khởi chạy và điều khiển app để thấy thay đổi hoạt động thật | `/run` | Test pass nhưng app thật vẫn lỗi | — |
| `/verify` | **[Skill]** Build, chạy app và quan sát kết quả để xác nhận thay đổi | `/verify` | Kiểm chứng end-to-end | — |
| `/run-skill-generator` | **[Skill]** Dạy `/run` và `/verify` cách build/chạy app của dự án | `/run-skill-generator` | Dự án có cách khởi chạy đặc thù | — |
| `/autofix-pr [prompt]` | Mở phiên cloud theo dõi PR của nhánh hiện tại, tự đẩy fix khi CI fail hoặc có comment | `/autofix-pr chỉ sửa lỗi lint và type` | Không phải canh CI và comment review | — |
| `/install-github-app` | Cài Claude GitHub App và GitHub Actions cho repo | `/install-github-app` | Gọi `@claude` trong issue/PR trên GitHub | — |

### 5.5. Quản lý phiên

| Lệnh | Công dụng | Cách dùng / ví dụ | Vấn đề giải quyết | VS Code |
|---|---|---|---|---|
| `/clear [tên]` | Hội thoại mới, context trống (giữ memory dự án). Alias: `/reset`, `/new` | `/clear` | Chuyển việc mới, tránh context cũ gây nhiễu | — |
| `/resume [phiên]` | Mở lại hội thoại theo ID/tên hoặc picker. Alias: `/continue` | `/resume fix-login-bug` | Quay lại việc dở dang | — |
| `/rewind` | Tua lại hội thoại và/hoặc code về checkpoint. Alias: `/checkpoint`, `/undo` | `/rewind` | Claude đi sai hướng, cần quay lại | ✅ (qua nút rewind) |
| `/teleport` | Kéo phiên cloud về terminal. Alias: `/tp` | `/teleport` | Tiếp tục ở máy local việc bắt đầu trên web | — |
| `/remote-control` | Cho phép điều khiển phiên này từ claude.ai/điện thoại. Alias: `/rc` | `/rc` | Theo dõi, trả lời Claude khi rời bàn làm việc | ✅ |
| `/remote-env` | Chọn môi trường cloud mặc định | `/remote-env` | Cấu hình phiên cloud | — |
| `/web-setup` | Kết nối GitHub cho phiên cloud bằng `gh` | `/web-setup` | Phiên cloud truy cập được repo | — |
| `/desktop` | Tiếp tục phiên trong app Claude Code Desktop. Alias: `/app` | `/desktop` | Chuyển sang giao diện desktop | — |
| `/exit` | Thoát CLI. Alias: `/quit` | `/exit` | — | — |

### 5.6. Tài khoản, chi phí, chẩn đoán

| Lệnh | Công dụng | Cách dùng / ví dụ | Vấn đề giải quyết | VS Code |
|---|---|---|---|---|
| `/usage` | Chi phí phiên, hạn mức gói, phân tích cái gì tiêu nhiều usage. Alias: `/cost`, `/stats` | `/usage` → chuyển Day/Week | Biết vì sao hết hạn mức nhanh | ✅ |
| `/status` | Phiên bản, model, tài khoản, kết nối | `/status` | Gỡ lỗi cấu hình | ✅ |
| `/login` / `/logout` | Đăng nhập / đăng xuất | `/logout` | Đổi tài khoản | ✅ |
| `/doctor` | **[Skill]** Kiểm tra cài đặt, PATH, settings lỗi, skill/MCP không dùng, hook chậm; đề xuất và sửa (có hỏi trước). Alias: `/checkup` | `/doctor`, `/doctor prompt-audit` | Claude Code chạy chậm, lỗi lạ, `CLAUDE.md` quá dài | — |
| `/debug [mô tả]` | **[Skill]** Bật debug log và phân tích | `/debug MCP github không kết nối` | Lỗi runtime khó hiểu | — |
| `/bug` / `/feedback` | Báo lỗi, góp ý. Alias của `/bug`: `/share` | `/bug panel bị treo khi dán ảnh` | Báo lỗi có ngữ cảnh | ✅ |
| `/insights` | Báo cáo HTML phân tích cách bạn dùng Claude Code | `/insights` | Biết mình dùng chưa hiệu quả ở đâu | — |
| `/team-onboarding` | Tạo hướng dẫn onboarding từ lịch sử 30 ngày | `/team-onboarding` | Đồng đội mới setup nhanh như bạn | — |
| `/rate-limit-options` | Lựa chọn khi chạm giới hạn: chờ tự tiếp tục, mua thêm credit, nâng gói | `/rate-limit-options` | Bị chặn giữa chừng | — |
| `/usage-credits` | Cấu hình hoặc xin admin cấp usage credits | `/usage-credits` | Hết hạn mức | — |
| `/upgrade` | Mở trang nâng cấp gói | `/upgrade` | — | — |
| `/privacy-settings` | Xem/sửa cài đặt riêng tư (Pro, Max) | `/privacy-settings` | Kiểm soát dữ liệu | — |
| `/release-notes` | Xem changelog theo phiên bản | `/release-notes` | Biết tính năng mới | — |
| `/heapdump` | Ghi heap snapshot để chẩn đoán RAM (lệnh ẩn) | Gõ đủ `/heapdump` | Claude Code ngốn bộ nhớ | — |
| `/help` | Trợ giúp và danh sách lệnh | `/help` | — | — |

### 5.7. Artifact, thiết kế và tích hợp khác

| Lệnh | Công dụng | Vấn đề giải quyết |
|---|---|---|
| `/artifacts` | Liệt kê artifact của bạn, gắn vào phiên, mở trên trình duyệt, copy link | Tìm lại trang/báo cáo đã xuất bản |
| `/artifact-capabilities` | **[Skill]** Tài liệu khả năng runtime của artifact (gọi connector, cho tải file…) | Xây trang tương tác có dữ liệu thật |
| `/artifact-diagramming` | **[Skill]** Hướng dẫn vẽ sơ đồ SVG trong artifact | Sơ đồ rõ ràng ở cả theme sáng và tối |
| `/design [brief]` | **[Skill]** Phác thảo mockup UI, luồng màn hình trên canvas Claude Design | Có bản vẽ giao diện nhanh để bàn bạc |
| `/design-sync [hint]` / `/design-login` | Đưa design system React của repo lên Claude Design | Thiết kế dùng component thật của bạn |
| `/slides [brief]` | **[Skill]** Tạo bộ slide dạng artifact | Làm bài thuyết trình nhanh |
| `/claude-in-chrome [task]` | **[Skill]** Làm việc trên trình duyệt: test trang, điền form, đọc console | Test UI thủ công tốn thời gian |
| `/install-slack-app` | Cài Claude Slack app | Dùng Claude trong Slack |
| `/mobile` | QR tải app di động. Alias: `/ios`, `/android` | — |
| `/voice [hold\|tap\|off]` | Bật nhập bằng giọng nói | Ra lệnh rảnh tay |
| `/powerup` | Bài học tương tác ngắn về tính năng | Học Claude Code nhanh |
| `/plugin-authoring` | Tài liệu viết “mod” (plugin hook) | Tuỳ biến sâu giao diện Claude Code |
| `/scroll-speed`, `/radio`, `/stickers`, `/passes` | Tiện ích phụ: tốc độ cuộn, radio lo-fi, đặt sticker, tặng tuần dùng thử | — |
| `/setup-bedrock`, `/setup-vertex` | Trình hướng dẫn cấu hình Amazon Bedrock / Google Cloud (ẩn cho đến khi bật biến môi trường tương ứng) | Dùng Claude qua nhà cung cấp cloud của công ty |

**Lệnh đã bị gỡ:** `/pr-comments` (hãy hỏi Claude trực tiếp), `/vim` (dùng `/config` → Editor mode), `/ultraplan` (dùng plan mode).

---

## 6. Lệnh trong Command Palette của VS Code và phím tắt

### 6.1. Mở Claude Code

- Biểu tượng **Spark** ở **Editor Toolbar** (góc trên phải, cần mở một file).
- **Activity Bar** (thanh trái): mở danh sách phiên.
- **Status Bar**: bấm **✻ Claude Code** ở góc dưới phải (không cần mở file).
- **Command Palette**: `Ctrl+Shift+P` → gõ “Claude Code”.

### 6.2. Bảng lệnh và phím tắt (Windows/Linux)

“Focus” nghĩa là ô nào đang nhận bàn phím: con trỏ trong file code = editor focus; con trỏ trong ô prompt = Claude focus.

| Lệnh | Phím tắt | Công dụng |
|---|---|---|
| Focus Input | `Ctrl+Esc` | Chuyển qua lại giữa editor và Claude |
| Focus last message | — | Đưa con trỏ tới tin nhắn mới nhất hoặc lời hỏi quyền đang chờ (hữu ích cho screen reader) |
| Open in Side Bar | — | Mở Claude ở sidebar |
| Open in Terminal | — | Mở Claude ở chế độ terminal |
| Open in New Tab | `Ctrl+Shift+Esc` | Mở hội thoại mới thành tab editor |
| Open in New Window | — | Mở hội thoại mới ở cửa sổ riêng |
| New Conversation | `Ctrl+N` | Hội thoại mới (cần bật `enableNewConversationShortcut`) |
| Reopen Closed Session | `Ctrl+Shift+T` | Mở lại tab phiên Claude vừa đóng |
| Insert @-Mention Reference | `Alt+K` | Chèn tham chiếu file + dòng đang chọn |
| Accept / Reject Change at Cursor | — | Chấp nhận / huỷ thay đổi tại con trỏ khi duyệt diff |
| Toggle Focus view | `Ctrl+Alt+F` | Ẩn/hiện hoạt động tool |
| Rename Session Tab | — | Đổi tên phiên trong tab |
| Add Session Tab to Group | — | Thêm phiên vào nhóm |
| Mark Session as Unread | — | Đánh dấu chưa đọc |
| Open Walkthrough | — | Tour hướng dẫn cơ bản |
| Show Logs | — | Xem log debug của extension |
| Logout | — | Đăng xuất |

Phím khác: `Shift+Enter` xuống dòng, `Ctrl+O` mở/đóng mọi khối thinking, `Esc` hoặc **Stop** để dừng lượt hiện tại (agent nền vẫn chạy).

**Mở Claude từ công cụ khác** bằng URI, ví dụ trong PowerShell:

```powershell
Start-Process "vscode://anthropic.claude-code/open?prompt=review%20my%20changes"
```

Tham số: `prompt` (điền sẵn, chưa gửi, phải URL-encode) và `session` (ID phiên để mở lại).

### 6.3. Thiết lập của tiện ích (Extension settings)

Mở bằng `Ctrl+,` → Extensions → Claude Code, hoặc `/` → **General config…**

| Thiết lập | Mặc định | Ý nghĩa |
|---|---|---|
| `useTerminal` | `false` | Chạy Claude dạng terminal thay vì panel đồ hoạ |
| `initialPermissionMode` | — | Chế độ quyền khi mở hội thoại mới: `default` (Manual), `plan`, `acceptEdits`, `bypassPermissions` |
| `preferredLocation` | `panel` | Mở ở `sidebar` hay `panel` (tab) |
| `lockEditorGroups` | `true` | Khoá nhóm editor của Claude để file mới mở sang nhóm khác |
| `autosave` | `true` | Tự lưu file trước khi Claude đọc/ghi |
| `attachOpenFile` | `true` | Tự gửi file đang mở; tắt thì chỉ gửi đoạn được bôi đen |
| `useCtrlEnterToSend` | `false` | Dùng `Ctrl+Enter` để gửi thay vì `Enter` |
| `scrollToBottomOnSend` | `true` | Cuộn xuống cuối khi gửi |
| `showMessageTimestamps` | `false` | Hiện giờ gửi mỗi tin nhắn |
| `enableNewConversationShortcut` | `false` | Bật `Ctrl+N` |
| `enableReopenClosedSessionShortcut` | `true` | Bật `Ctrl+Shift+T` |
| `archiveInactiveSessions` | `14` | Tự lưu trữ phiên sau N ngày không hoạt động (`0` để tắt) |
| `continueAfterReload` | `true` | Sau khi reload cửa sổ, Claude làm tiếp bước bị gián đoạn |
| `hideOnboarding` | `false` | Ẩn checklist hướng dẫn |
| `focusView` | `false` | Bật Focus view |
| `respectGitIgnore` | `true` | Loại file trong `.gitignore` khỏi tìm kiếm và selection |
| `usePythonEnvironment` | `true` | Kích hoạt môi trường Python của workspace |
| `environmentVariables` | `[]` | Biến môi trường cho tiến trình Claude |
| `disableLoginPrompt` | `false` | Bỏ màn hình đăng nhập (dùng Bedrock/Vertex/Foundry) |
| `allowDangerouslySkipPermissions` | `false` | Thêm chế độ Bypass permissions (chỉ dùng trong sandbox không internet) |
| `claudeProcessWrapper` | — | File thực thi dùng để chạy tiến trình Claude |

Cấu hình dùng chung giữa extension và CLI (quyền, hook, MCP, biến môi trường) nằm ở `~/.claude/settings.json`. Thêm `"$schema": "https://json.schemastore.org/claude-code-settings.json"` để VS Code gợi ý và kiểm tra cú pháp.

---

## 7. Checkpoints, lịch sử phiên, plugin và MCP

### 7.1. Checkpoints (tua lại)

Di chuột lên một tin nhắn → nút **rewind**, có 3 lựa chọn:

| Lựa chọn | Hội thoại | Code |
|---|---|---|
| **Fork conversation from here** | Tạo nhánh mới từ tin nhắn này | Giữ nguyên |
| **Rewind code to here** | Giữ nguyên lịch sử | Trả về trạng thái lúc đó |
| **Fork conversation and rewind code** | Tạo nhánh mới | Trả về trạng thái lúc đó |

**Giải quyết:** Claude sửa sai hướng mà bạn chưa commit; tua lại an toàn thay vì tự sửa tay. Checkpoint chỉ theo dõi sửa đổi file của Claude, **không thay thế git**.

### 7.2. Lịch sử phiên

- Nút **Session history** trên đầu panel: tìm theo từ khoá hoặc thời gian; bấm để tiếp tục với đầy đủ lịch sử.
- Tab **Web**: mở lại phiên cloud từ claude.ai (cần đăng nhập Claude.ai Subscription).
- Đổi tên, lưu trữ (archive) phiên khi rê chuột. Phiên không hoạt động 14 ngày tự vào **Archived sessions**.
- Ở Activity Bar: gom phiên thành **nhóm** (chuột phải), lọc theo **Active** hoặc trạng thái (Needs input, Working, Completed).
- Chấm màu trên biểu tượng Spark của tab: **xanh dương** = đang chờ bạn cấp quyền; **cam** = Claude đã xong khi tab bị ẩn.

### 7.3. Plugin — `/plugins`

- Tab **Plugins**: plugin đã cài (bật/tắt, gỡ), plugin có sẵn từ marketplace, ô tìm kiếm.
- Phạm vi cài đặt:
  - **Install for you** (user): mọi dự án của bạn.
  - **Install for this project** (project): chia sẻ với cả nhóm qua `.claude/settings.json`.
  - **Install locally** (local): chỉ bạn, chỉ repo này.
- Tab **Marketplaces**: thêm nguồn (GitHub repo, URL, đường dẫn local), làm mới, xoá.
- Plugin cấu hình trong extension cũng dùng được trong CLI và ngược lại.

### 7.4. MCP — `/mcp`

- Thêm/xoá server, bật/tắt, kết nối lại, xác thực OAuth ngay trong panel.
- Hoặc dùng terminal:

```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/ \
  --header "Authorization: Bearer YOUR_GITHUB_PAT"
```

- Kiểm tra: mở hội thoại mới, gõ `/mcp`, server phải hiện **Connected** (sai thông tin xác thực sẽ hiện **Failed**).
- Extension còn có MCP server nội bộ: `ide` (cho CLI) và `claude-vscode` (cho panel chat), để Claude đọc **Problems panel** (lỗi/cảnh báo của language server) và chạy cell Jupyter (luôn hỏi **Execute/Cancel** trước).

---

## 8. Dùng lệnh nào ở giai đoạn nào?

```text
Bắt đầu repo mới
  /init → /memory (chỉnh CLAUDE.md) → /mcp → /permissions

Trong lúc làm
  /plan <việc lớn>  →  /model, /effort (chọn sức mạnh)
  /context (xem context đầy chưa) → /compact khi quá dài
  /btw <câu hỏi phụ>

Làm song song
  /subtask, /fork, /branch, /batch, /tasks

Trước khi ship
  /diff → /code-review (--fix) → /security-review → /verify

Giữa các phiên
  /clear (việc mới) · /resume (việc cũ) · /rename · /export

Khi có sự cố
  /rewind (tua lại) · /doctor (kiểm tra cài đặt) · /debug · /bug
```

**Mẹo:**

- **Một việc, một phiên.** Đổi chủ đề thì `/clear`; context sạch giúp Claude chính xác và rẻ hơn.
- **Việc lớn luôn bắt đầu bằng `/plan`**, duyệt và comment vào kế hoạch rồi mới cho sửa code.
- Thấy Claude hỏi quyền lặp lại cho cùng một lệnh an toàn → thêm vào **Allow** qua `/permissions` hoặc chạy `/fewer-permission-prompts`.
- Hội thoại dài, đồng hồ cache đỏ liên tục → cân nhắc `/compact` hoặc `/clear`, và xem `/usage` để biết cái gì tốn usage.

---

## 9. Bài tập thực hành

Làm trên một nhánh git riêng của một repo bất kỳ (ví dụ repo `llm_engineering` này).

1. **Làm quen menu:** gõ `/` và đọc hết các mục. Mở **Slash commands** (hoặc `/skills`), lọc chữ “review”.
2. **Ngữ cảnh:** bôi đen một hàm, bấm `Alt+K`, hỏi “hàm này làm gì?”. Sau đó thử `@week1/` để hỏi tổng quan một thư mục.
3. **Plan mode:** gõ `/plan thêm docstring cho các hàm trong một file`, comment vào kế hoạch, rồi duyệt.
4. **Checkpoint:** để Claude sửa một file, rồi dùng **Rewind code to here** để quay lại.
5. **Context:** sau khoảng 20 tin nhắn, xem chỉ báo context và đồng hồ cache; chạy `/compact giữ lại danh sách việc đã xong`.
6. **Câu hỏi phụ:** dùng `/btw` hỏi một điều nhỏ, kiểm tra rằng nó không xuất hiện trong hội thoại chính.
7. **Quyền:** mở **Permissions**, thêm quy tắc Allow cho `Bash(git status)` ở scope local.
8. **Chi phí:** chạy `/usage`, xem mục nào chiếm nhiều usage nhất.
9. **Lưu trữ:** `/export bai-tap-command-menu.txt` để lưu lại phiên.

**Câu hỏi tự kiểm tra:**

- `/compact` khác `/clear` thế nào? Khi nào dùng cái nào?
- `/branch`, `/fork`, `/subtask` khác nhau ra sao?
- Vì sao `Rewind code` không thay thế được `git`?
- Command menu (`/`) khác Command Palette (`Ctrl+Shift+P`) ở điểm nào?

<details>
<summary>Gợi ý đáp án</summary>

- `/compact` **tóm tắt** và giữ cùng hội thoại (vẫn nhớ ý chính); `/clear` bắt đầu **hội thoại mới trống trơn** (chỉ giữ `CLAUDE.md`/memory). Cùng việc nhưng context dài → `/compact`; việc mới → `/clear`.
- `/branch`: bạn **chuyển sang** bản sao hội thoại, bản gốc vẫn còn. `/fork`: bản sao thành **phiên nền riêng**, bạn ở lại phiên hiện tại. `/subtask`: một **subagent** kế thừa hội thoại, làm việc nền rồi **trả kết quả về** hội thoại này.
- Checkpoint chỉ theo dõi sửa đổi file **do Claude thực hiện** trong phiên; thay đổi bạn tự làm hoặc do lệnh shell tạo ra có thể không được theo dõi, và nó không có lịch sử lâu dài hay chia sẻ cho nhóm như git.
- `/` điều khiển **phiên Claude** (model, context, quyền…); Command Palette điều khiển **tiện ích trong VS Code** (mở tab, vị trí panel, log…).

</details>

---

## Tài liệu tham khảo

- [Use Claude Code in VS Code](https://code.claude.com/docs/en/vs-code)
- [Commands](https://code.claude.com/docs/en/commands)
- [Permission modes](https://code.claude.com/docs/en/permission-modes)
- [Checkpointing](https://code.claude.com/docs/en/checkpointing)
- [Skills](https://code.claude.com/docs/en/skills)
- [MCP](https://code.claude.com/docs/en/mcp)
- [Plugins](https://code.claude.com/docs/en/plugins/overview)
- [Settings](https://code.claude.com/docs/en/settings)
