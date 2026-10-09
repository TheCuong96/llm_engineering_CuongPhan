---
name: skill-authoring
description: Tạo mới, chuẩn hóa hoặc rà soát Agent Skill (thư mục chứa SKILL.md) cho Claude Code theo đúng quy tắc chuẩn - frontmatter, description, vị trí đặt, nạp dần (progressive disclosure), allowed-tools, kiểm thử kích hoạt. Dùng khi người dùng muốn tạo skill, viết SKILL.md, biến một chỉ dẫn lặp đi lặp lại thành skill, sửa skill không kích hoạt, hoặc review skill trong .claude/skills, kể cả khi họ không nói chữ "skill". Triggers - create a skill, new skill, write SKILL.md, tạo skill, viết skill, skill không chạy, chuẩn hóa skill.
---

# Skill Authoring

Skill này giúp tạo và chuẩn hóa skill cho Claude Code. Nền tảng của mọi quy tắc dưới đây: Claude ban đầu **chỉ thấy `name` và `description`**; nội dung `SKILL.md` chỉ được nạp khi yêu cầu khớp mô tả; tệp phụ chỉ được đọc khi cần. Vì vậy `description` quyết định skill có sống hay không, còn độ gọn của `SKILL.md` quyết định chi phí ngữ cảnh.

## Quy trình

1. **Xác định nhu cầu.** Hỏi (tối đa 1-2 câu, chỉ khi chưa rõ): skill giải quyết chỉ dẫn lặp lại nào, người dùng sẽ nói gì để kích hoạt, dùng cá nhân hay chia sẻ cho team. Nếu đã đủ thông tin thì không hỏi, cứ làm.
2. **Chọn đúng công cụ** (xem mục "Skill hay công cụ khác?"). Đừng ép mọi thứ vào skill.
3. **Chọn vị trí** (xem mục "Vị trí đặt").
4. **Viết `description` trước**, vì nó là phần quan trọng nhất. Đọc `references/description-guide.md` để viết.
5. **Viết thân `SKILL.md`** dựa trên `assets/SKILL.template.md`.
6. **Tách nội dung** nếu thân vượt ~300 dòng hoặc có phần chỉ dùng trong tình huống hiếm (xem "Nạp dần").
7. **Chạy checklist** ở cuối file, sửa đến khi đạt.
8. **Hướng dẫn kiểm thử** cho người dùng: khởi động lại Claude Code, kiểm tra skill có trong danh sách, thử nhiều cách diễn đạt.

## Quy tắc metadata

Hai trường bắt buộc:

- `name`: chữ thường, số, dấu gạch nối (kebab-case); tối đa 64 ký tự; **trùng tên thư mục chứa nó**; không chứa "claude" hoặc "anthropic". Đặt tên cụ thể (`frontend-review`, không phải `review`), vì khi trùng tên giữa các cấp, thứ tự ưu tiên là Enterprise, Personal, Project, Plugins và skill cấp thấp sẽ bị ghi đè.
- `description`: tối đa 1.024 ký tự, không dùng dấu ngoặc nhọn. Phải nói rõ **skill làm gì** và **khi nào dùng**.

Hai trường tùy chọn, chỉ thêm khi có lý do:

- `allowed-tools`: giới hạn công cụ khi skill hoạt động. Dùng cho tác vụ nhạy cảm (ví dụ skill onboarding chỉ đọc: `Read, Grep, Glob`). Cấp đúng quyền cần dùng, không hơn. Bỏ trường này thì áp dụng mô hình quyền bình thường.
- `model`: chọn model riêng cho skill. Chỉ đặt khi tác vụ thực sự cần.

## Vị trí đặt

| Loại | Đường dẫn | Khi dùng |
|---|---|---|
| Cá nhân | `~/.claude/skills/<name>/SKILL.md` | Thói quen và mẫu riêng của người dùng, dùng ở mọi dự án |
| Dự án | `.claude/skills/<name>/SKILL.md` | Quy ước team, quy trình gắn với codebase; commit vào git |
| Plugin / Enterprise | đóng gói riêng | Chia sẻ rộng hoặc yêu cầu bắt buộc toàn tổ chức; nhắc người dùng đây là bước sau, khi skill đã ổn định |

`SKILL.md` luôn nằm **trong một thư mục con có tên skill**, viết đúng chữ hoa `SKILL.md`. Không đặt trực tiếp tại gốc `skills/`. Trên Windows, dùng `/` trong đường dẫn bên trong skill.

## Skill hay công cụ khác?

- Quy tắc **luôn đúng** ở mọi cuộc hội thoại ("không bao giờ...", style chung) → `CLAUDE.md`.
- Quy trình hoặc chuyên môn **chỉ đôi khi cần**, tự nạp theo ngữ cảnh → skill.
- Chỉ chạy khi người dùng gõ lệnh rõ ràng → slash command.
- Cần ngữ cảnh tách biệt hoặc quyền công cụ khác → subagent. Lưu ý subagent không tự thừa hưởng skill; custom subagent trong `.claude/agents` phải khai báo trường `skills` và có công cụ `Skill`.
- Hành động tự động theo sự kiện (lint sau khi lưu...) → hook (hook là event-driven, skill là request-driven).
- Kết nối hệ thống bên ngoài → MCP server.

Nếu nhu cầu của người dùng khớp công cụ khác hơn, nói thẳng và đề xuất đúng công cụ.

## Viết thân SKILL.md

- Mỗi skill làm **một việc rõ ràng**. Thấy skill gánh nhiều mục đích khác nhau thì đề xuất tách.
- Viết thể mệnh lệnh, theo bước đánh số khi có quy trình.
- **Giải thích "tại sao"** cho các quy tắc quan trọng, không chỉ "never/always". Lý do giúp Claude xử lý tình huống ngoài ví dụ.
- Cho ví dụ đầu vào/đầu ra cụ thể khi định dạng là quan trọng.
- Không lặp lại nội dung giữa các mục; mỗi ý nói một lần.
- Tham chiếu skill/mục khác **theo tên**, không theo số mục (số dễ đổi).
- Giữ gọn: mốc cứng dưới 500 dòng, mục tiêu thực tế ~100-300 dòng.

## Nạp dần (progressive disclosure)

Cấu trúc khi skill lớn:

```
ten-skill/
├── SKILL.md        # cốt lõi, gọn
├── references/     # tài liệu chuyên sâu, chỉ đọc khi cần
├── scripts/        # mã chạy được, đã kiểm thử
└── assets/         # mẫu, hình, dữ liệu
```

- Trong `SKILL.md`, ghi rõ **khi nào** đọc từng tệp, ví dụ: "Khi người dùng hỏi về thiết kế hệ thống, đọc `references/architecture.md`".
- Script thì yêu cầu **chạy**, không cần đọc nội dung; chỉ đầu ra tốn token. Dùng script cho kiểm tra môi trường, biến đổi dữ liệu cần nhất quán. Nhớ `chmod +x` và ghi rõ cách gọi, dependency.
- Tệp tham khảo dài trên ~100 dòng nên có mục lục ở đầu.

## Đầu ra của skill này

Khi tạo skill cho người dùng:

1. Tạo thư mục `<name>/` với `SKILL.md` (và `references/`, `scripts/`, `assets/` nếu cần).
2. Tóm tắt ngắn: skill làm gì, đặt ở đâu, và 3-4 câu mẫu để người dùng thử kích hoạt.
3. Nhắc: khởi động lại Claude Code, vì skill được quét lúc khởi động.
4. Gợi ý quy trình cải thiện: dùng thử một thời gian, ghi lại các câu **không** kích hoạt, rồi bổ sung vào `description`.

Nếu gặp lỗi (không kích hoạt, không hiện, chọn nhầm, bị ghi đè), đọc `references/troubleshooting.md`.

## Checklist trước khi giao

- [ ] Tên thư mục trùng `name`; kebab-case; không chứa "claude"/"anthropic"; không dễ trùng
- [ ] `SKILL.md` nằm trong thư mục con, đúng chữ hoa; YAML hợp lệ (có `---` mở và đóng)
- [ ] `description` ≤ 1.024 ký tự, nêu cả việc skill làm lẫn thời điểm kích hoạt, có cụm từ người dùng thật sự sẽ nói
- [ ] Chỉ một mục đích; không nhồi nhiều việc
- [ ] Thân gọn (dưới 500 dòng); phần hiếm dùng đã tách sang `references/`, mỗi tệp có chỉ dẫn khi nào đọc
- [ ] Quy tắc quan trọng có lý do đi kèm; không lặp ý; tham chiếu theo tên
- [ ] `allowed-tools` chỉ cấp đúng quyền cần; script chạy được và có dependency rõ
- [ ] Đã đưa người dùng các câu thử kích hoạt và nhắc khởi động lại
