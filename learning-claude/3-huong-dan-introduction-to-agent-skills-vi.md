# Introduction to Agent Skills — giáo trình Việt hóa

> Ghi chú học tập diễn giải từ khóa **Introduction to agent skills** của Anthropic Academy. Mục tiêu: hiểu cách thiết kế, triển khai, chia sẻ và gỡ lỗi *skills* trong Claude Code.

## Lộ trình học

1. Hiểu skill là gì và khi nào nên dùng.
2. Tạo một skill đầu tiên và kiểm thử việc kích hoạt.
3. Cấu hình nâng cao, bảo vệ công cụ và chia nhỏ skill nhiều tệp.
4. Chọn đúng công cụ giữa skills, `CLAUDE.md`, subagents, hooks và MCP.
5. Chia sẻ skill cho đội nhóm hoặc toàn tổ chức.
6. Chẩn đoán lỗi theo một checklist có hệ thống.

---

## 1. Skill là gì?

**Video (3 phút):** [What are skills?](https://www.youtube.com/watch?v=bjdBVZa66oU)

### Ý chính

Skill là một thư mục hướng dẫn có thể tái sử dụng. Tệp trung tâm là `SKILL.md`: phần đầu (frontmatter YAML) đặt tên và mô tả, phần sau ghi quy trình, tiêu chuẩn và tài nguyên cần thiết. Khi yêu cầu của bạn phù hợp, Claude Code tự nhận diện và nạp skill.

Điểm quan trọng nhất: Claude ban đầu chỉ cần biết **tên và mô tả** các skill. Mô tả đóng vai trò “bộ định tuyến”: yêu cầu nào có ý nghĩa phù hợp thì skill tương ứng được dùng. Vì vậy, skill không phải một prompt chung chung; nó là tri thức chuyên biệt, chỉ được nạp lúc cần.

Ví dụ tối thiểu:

```md
---
name: pr-review
description: Rà soát pull request về chất lượng mã. Dùng khi review PR hoặc kiểm tra thay đổi mã.
---

Khi review:
1. Kiểm tra tính đúng đắn và edge cases.
2. Nêu nhận xét theo mức độ ưu tiên.
3. Đề xuất cách sửa cụ thể.
```

### Đặt skill ở đâu?

| Loại | Vị trí | Khi nên dùng |
|---|---|---|
| Cá nhân | `~/.claude/skills/` | Phong cách commit, cách giải thích mã, mẫu tài liệu của riêng bạn |
| Dự án | `.claude/skills/` ở gốc repo | Quy ước nhóm, quy trình gắn với codebase |

Trên Windows, thư mục cá nhân tương đương `C:/Users/<ten-nguoi-dung>/.claude/skills`. Skill dự án nên được commit cùng source code để mọi người clone repo đều có cùng hướng dẫn.

### Phân biệt ba cách tùy biến

- `CLAUDE.md`: luôn nạp trong mọi cuộc hội thoại; thích hợp cho quy tắc luôn đúng.
- Skill: tự nạp theo ngữ cảnh; thích hợp cho quy trình/chuyên môn chỉ thỉnh thoảng dùng.
- Slash command: chỉ chạy khi người dùng gọi rõ lệnh đó.

**Quy tắc nhớ nhanh:** nếu bạn cứ lặp lại cùng một chỉ dẫn cho Claude, hãy cân nhắc biến nó thành skill.

---

## 2. Tạo skill đầu tiên

**Video (4 phút):** [Creating your first skill](https://www.youtube.com/watch?v=Wx6_vjFFyHM)

### Bài thực hành: skill viết mô tả PR

Tạo thư mục rồi tạo tệp `SKILL.md` bên trong (không đặt `SKILL.md` trực tiếp tại gốc `skills`):

```bash
mkdir -p ~/.claude/skills/pr-description
```

```md
---
name: pr-description
description: Viết mô tả pull request. Dùng khi tạo PR, viết PR, hoặc tóm tắt thay đổi cho pull request.
---

Khi viết mô tả PR:
1. Chạy `git diff main...HEAD` để xem thay đổi.
2. Trình bày theo mẫu:

## What
Một câu nêu PR này làm gì.

## Why
Bối cảnh ngắn gọn: vì sao cần thay đổi.

## Changes
- Liệt kê thay đổi cụ thể.
- Nhóm các thay đổi liên quan.
- Nêu tệp bị xóa hoặc đổi tên nếu có.
```

`name` là định danh; `description` là điều kiện kích hoạt. Các chỉ dẫn sau frontmatter là “nội dung công việc” mà Claude làm khi skill đã được nạp.

### Kiểm thử

1. Khởi động lại Claude Code sau khi tạo/sửa skill, vì skills được quét lúc khởi động.
2. Kiểm tra danh sách skills có skill mới.
3. Trên một nhánh có thay đổi, yêu cầu: “viết mô tả PR cho thay đổi của tôi”.
4. Xác nhận Claude đã dùng skill, đọc diff và tuân thủ mẫu đầu ra.

### Matching và ưu tiên

Claude so sánh yêu cầu với `description` theo **nghĩa**, không chỉ khớp từ nguyên văn. Khi tên skill trùng nhau, ưu tiên là:

`Enterprise → Personal → Project → Plugins`

Vì thế, hãy đặt tên cụ thể như `frontend-review` hoặc `backend-review` thay cho `review`. Muốn cập nhật: sửa `SKILL.md`; muốn gỡ: xóa thư mục skill; rồi khởi động lại Claude Code.

---

## 3. Cấu hình và skill nhiều tệp

**Video (4 phút):** [Configuration and multi-file skills](https://www.youtube.com/watch?v=98KaK_rn5rQ)

### Metadata

Hai trường bắt buộc:

- `name`: chữ thường, số và dấu gạch nối; tối đa 64 ký tự; nên trùng tên thư mục.
- `description`: tối đa 1.024 ký tự; quyết định skill có được gọi đúng lúc hay không.

Hai trường tùy chọn đáng chú ý:

- `allowed-tools`: giới hạn công cụ được Claude sử dụng khi skill hoạt động.
- `model`: chọn model cho skill.

Một description tốt phải trả lời rõ: **skill làm gì** và **khi nào dùng nó**. Nếu skill ít được gọi, thêm những cách diễn đạt mà người dùng thực tế sẽ dùng.

### Giới hạn công cụ

Ví dụ skill onboarding chỉ-đọc:

```yaml
---
name: codebase-onboarding
description: Giúp lập trình viên mới hiểu hệ thống hoạt động thế nào.
allowed-tools: Read, Grep, Glob, Bash
model: sonnet
---
```

`allowed-tools` phù hợp với tác vụ nhạy cảm, cần đọc/kiểm tra mà không được phép sửa. Nếu bỏ trường này, Claude dùng mô hình quyền bình thường.

### Progressive disclosure (nạp dần)

Không nên nhồi mọi thứ vào một `SKILL.md` hàng nghìn dòng. Giữ phần cốt lõi trong `SKILL.md` (mốc hữu ích: dưới 500 dòng) và đưa phần chỉ dùng trong tình huống đặc biệt sang các tệp hỗ trợ:

```text
my-skill/
├── SKILL.md
├── scripts/       # mã thực thi
├── references/    # tài liệu tham khảo sâu
└── assets/        # mẫu, hình, dữ liệu
```

Trong `SKILL.md`, nói rõ **khi nào** phải đọc từng reference. Ví dụ, chỉ đọc `references/architecture-guide.md` khi người dùng hỏi thiết kế hệ thống. Script nên được yêu cầu *chạy*, không cần nạp toàn bộ nội dung script vào context: chỉ đầu ra chiếm token.

Use cases tốt cho script: kiểm tra môi trường, biến đổi dữ liệu cần nhất quán, thao tác nên được đóng gói thành mã đã kiểm thử.

---

## 4. Skills và các tính năng khác của Claude Code

**Video (3 phút):** [Skills vs. other Claude Code features](https://www.youtube.com/watch?v=IgNN4v0BJdU)

| Công cụ | Cơ chế | Dùng khi |
|---|---|---|
| `CLAUDE.md` | Luôn nạp | Tiêu chuẩn toàn dự án, ràng buộc “không bao giờ…”, style luôn áp dụng |
| Skill | Nạp theo yêu cầu phù hợp | Quy trình chi tiết/chuyên môn theo nhiệm vụ |
| Subagent | Context thực thi tách biệt | Ủy thác việc, cần cô lập hoặc quyền công cụ khác |
| Hook | Kích hoạt theo sự kiện | Chạy linter sau khi lưu, xác thực trước tool call |
| MCP server | Công cụ/tích hợp bên ngoài | Kết nối hệ thống và nguồn dữ liệu bên ngoài |

Skills bổ sung kiến thức vào cuộc hội thoại hiện tại; subagent giải một nhiệm vụ trong context riêng rồi trả kết quả. Hook là **event-driven**, còn skill là **request-driven**.

Thiết kế thực tế thường kết hợp cả năm: `CLAUDE.md` đặt nền tảng luôn áp dụng; skills thêm chuyên môn đúng lúc; hooks tự động hóa; subagents xử lý việc tách biệt; MCP cung cấp năng lực bên ngoài. Đừng ép mọi yêu cầu vào skill khi một cơ chế khác phù hợp hơn.

---

## 5. Chia sẻ skills

**Video (4 phút):** [Sharing skills](https://www.youtube.com/watch?v=OCBi3eScNLk)

### Ba cách phân phối

1. **Commit vào repo:** đặt ở `.claude/skills`; đơn giản nhất, theo workflow Git, lý tưởng cho tiêu chuẩn nhóm hoặc workflow gắn codebase.
2. **Plugin/marketplace:** đóng gói skills để dùng xuyên nhiều repository hoặc cộng đồng rộng hơn.
3. **Enterprise managed settings:** triển khai trên toàn tổ chức; có ưu tiên cao nhất. Dùng cho yêu cầu bắt buộc như compliance, bảo mật, chuẩn kỹ thuật.

Ví dụ enterprise có thể hạn chế marketplace plugin bằng danh sách nguồn đã phê duyệt (`strictKnownMarketplaces`). Ý tưởng là quản trị viên kiểm soát nguồn plugin đáng tin cậy, thay vì để mọi nguồn đều cài được.

### Skills và subagents

Subagent không tự động thừa hưởng skills của bạn vì nó khởi tạo context sạch. Built-in agents như Explorer, Plan, Verify không truy cập skill. Chỉ **custom subagent** trong `.claude/agents` mới dùng được skills, và phải khai báo rõ trường `skills` trong frontmatter:

```yaml
---
name: frontend-security-accessibility-reviewer
description: Dùng để review frontend về accessibility và bảo mật.
tools: Bash, Glob, Grep, Read, WebFetch, WebSearch, Skill
model: sonnet
color: blue
skills: accessibility-audit, performance-check
---
```

Đây là mẫu mạnh cho việc ủy thác có kiểm soát: mỗi loại reviewer nhận đúng bộ kỹ năng cần thiết, thay vì phụ thuộc vào prompt tạm thời.

---

## 6. Gỡ lỗi skills

**Video (4 phút):** [Troubleshooting skills](https://www.youtube.com/watch?v=YBa1cwaG7is)

### Trình tự xử lý khuyến nghị

1. Chạy **skills validator/verifier** trước để phát hiện lỗi cấu trúc/YAML.
2. Nếu chưa rõ, chạy `claude --debug` và tìm thông báo chứa tên skill.
3. Phân loại lỗi vào một trong các nhóm dưới đây, rồi sửa đúng nguyên nhân.

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Không kích hoạt | Description không gần cách người dùng diễn đạt | Bổ sung trigger phrases, thử nhiều câu như “vì sao chậm?”, “tối ưu nó” |
| Không tải/không thấy | Sai vị trí/tên tệp | `SKILL.md` phải ở trong thư mục có tên; đúng chữ hoa `SKILL.md` |
| Chọn nhầm skill | Descriptions quá giống nhau | Viết mô tả phân biệt hơn, cụ thể phạm vi và thời điểm dùng |
| Bị ghi đè | Skill cùng tên ở mức ưu tiên cao hơn | Đổi tên cụ thể hoặc trao đổi với admin enterprise |
| Plugin không hiện | Cache hoặc cấu trúc plugin | Xóa cache, khởi động lại, cài lại; kiểm tra bằng validator |
| Lỗi khi chạy | Thiếu dependency, quyền script, đường dẫn | Cài dependency; `chmod +x` cho script; dùng `/` trong đường dẫn kể cả Windows |

### Checklist trước khi chia sẻ

- [ ] Tên thư mục và `name` rõ ràng, không dễ trùng.
- [ ] `SKILL.md` đúng vị trí, YAML hợp lệ.
- [ ] Description nói được cả việc skill làm lẫn thời điểm kích hoạt.
- [ ] Đã thử nhiều cách diễn đạt yêu cầu.
- [ ] `allowed-tools` chỉ cấp đúng quyền cần dùng.
- [ ] Tài liệu dài được tách sang `references/`; script có quyền chạy và dependency rõ ràng.
- [ ] Đã kiểm tra xung đột ưu tiên và chạy validator.

---

## Bài tập áp dụng sau khóa

Chọn một chỉ dẫn bạn đang lặp lại thường xuyên (ví dụ: format PR, audit accessibility, tạo release notes). Tạo skill nhỏ trước, dùng một tuần, ghi lại các yêu cầu khiến skill chưa kích hoạt, rồi cải thiện `description`. Khi skill lớn dần, tách reference/script theo progressive disclosure. Chỉ sau khi ổn định mới đưa vào repo, plugin hoặc enterprise.

Kết luận của khóa: skill tốt không bắt đầu từ ý tưởng trừu tượng; nó bắt đầu từ một “nỗi đau” trong workflow mà bạn phải lặp lại nhiều lần.
