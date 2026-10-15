# Claude Learn — ver3

Bộ tài liệu tự học bằng tiếng Việt cho 5 khóa của Anthropic Academy / Claude Academy. Mỗi khóa có **hai file**:

- **Bản giảng giải** (file gốc): giải thích chi tiết, đủ code, prompt mẫu, nguồn đối chiếu.
- **Bản tóm tắt** (`-TOM-TAT.md`): ngắn khoảng 1/3–1/2, vẫn giữ đủ ý và từng bước thực hành, dùng để ôn nhanh hoặc vừa đọc vừa làm.

## Lộ trình học đề xuất

```
1. AI Fluency  →  2. Claude Platform 101  →  3. MCP cơ bản  →  4. MCP Advanced  →  5. AI-native SDLC
   (tư duy)          (gọi API, agent)          (giao thức)        (nâng cao)            (quy trình tổ chức)
```

| # | Khóa | Bạn học được gì | Tóm tắt | Bản đầy đủ |
|---|---|---|---|---|
| 1 | **AI Fluency: Framework & foundations** | Khung 4D (Delegation, Description, Discernment, Diligence) để làm việc với AI hiệu quả và có trách nhiệm. Không cần lập trình. | [Tóm tắt](AI-Fluency-giai-thich-va-thuc-hanh-tieng-Viet-TOM-TAT.md) | [Đầy đủ](AI-Fluency-giai-thich-va-thuc-hanh-tieng-Viet.md) |
| 2 | **Claude Platform 101** | Gọi Messages API, chọn model, vòng lặp agent, tool use, thinking, skills, MCP, quản lý context, Managed Agents, Claude Code. | [Tóm tắt](Claude-Platform-101-Giang-giai-tieng-Viet-TOM-TAT.md) | [Đầy đủ](Claude-Platform-101-Giang-giai-tieng-Viet.md) |
| 3 | **Introduction to MCP** | Host/client/server; viết MCP server và client bằng Python với tools, resources, prompts; dùng Inspector. | [Tóm tắt](Khoa-hoc-MCP-giai-thich-de-hieu-TOM-TAT.md) | [Đầy đủ](Khoa-hoc-MCP-giai-thich-de-hieu.md) |
| 4 | **MCP: Advanced Topics** | Sampling, log/progress notifications, roots, thông điệp JSON-RPC, transport STDIO và Streamable HTTP, bài toán trạng thái. | [Tóm tắt](MCP-Advanced-Topics-Giang-giai-tieng-Viet-TOM-TAT.md) | [Đầy đủ](MCP-Advanced-Topics-Giang-giai-tieng-Viet.md) |
| 5 | **The AI-native SDLC playbook** | Đưa AI vào cả vòng đời phần mềm: intent → spec → plan, CLAUDE.md, skill, subagent, eval, review PR, hook, CI/CD, vận hành. | [Tóm tắt](khoa-hoc-ai-native-sdlc-giai-thich-va-thuc-hanh-TOM-TAT.md) | [Đầy đủ](khoa-hoc-ai-native-sdlc-giai-thich-va-thuc-hanh.md) |

**Vì sao theo thứ tự này?** Khóa 1 cho tư duy nền để dùng AI tốt. Khóa 2 chuyển sang lập trình với Claude. Khóa 3–4 đi sâu vào MCP, chuẩn kết nối được giới thiệu ở khóa 2. Khóa 5 ghép mọi thứ thành quy trình cho cả nhóm/tổ chức. Nếu đã quen lập trình với Claude, bạn có thể bắt đầu thẳng từ khóa 3.

## Cách dùng hiệu quả

1. **Đọc bản tóm tắt trước** để nắm bức tranh chung (mục "Bức tranh 1 phút" ở đầu mỗi file).
2. **Làm theo các bước thực hành** trong bản tóm tắt; khi cần code đầy đủ hoặc giải thích kỹ hơn, mở bản đầy đủ ở đúng bài đó.
3. **Ôn bằng phần câu hỏi tự kiểm** ở cuối mỗi bản tóm tắt trước khi làm quiz trên Academy.
4. Gặp lỗi khi thực hành → tra **bảng xử lý lỗi** ở cuối file.

## Tài nguyên kèm theo

| Tệp | Dùng cho | Ghi chú |
|---|---|---|
| `cli_project.zip` | Khóa 3 | Bộ mã khởi đầu chatbot tài liệu (bài 4 Project setup) |
| `cli_project_COMPLETE.zip` | Khóa 3 | Bản hoàn chỉnh để đối chiếu |
| `sampling.zip` | Khóa 4 — bài 3 | Lab Sampling, cần API key |
| `notifications.zip` | Khóa 4 — bài 5 | Lab log/progress, không cần API key |
| `roots.zip` | Khóa 4 — bài 7 | Lab Roots + chuyển đổi video, cần API key và FFmpeg |
| `transport-http.zip` | Khóa 4 — bài 12–13 | Demo Streamable HTTP, không cần API key |
| [`audio/`](audio/) | Khóa 3 | Bản audio (`.mp3`) và văn bản đọc (`.txt`) của bài giảng MCP cơ bản |

Giải nén mỗi ZIP vào một thư mục riêng và chạy lệnh trong thư mục chứa `pyproject.toml` (xem hướng dẫn trong từng khóa).

## Lưu ý chung

- **Phiên bản:** Model ID trong các khóa chỉ là ví dụ. Hãy dùng model mà tài khoản của bạn có quyền truy cập. Các khóa MCP dùng **Python SDK 1.x** được khóa phiên bản trong `uv.lock`. Đừng nâng SDK khi đang làm theo bài.
- **Bảo mật:** Chỉ đặt API key trong `.env` hoặc biến môi trường, nhớ thêm vào `.gitignore`. Không dán key vào prompt hay vào tài liệu.
- **Dữ liệu demo:** Dữ liệu thời tiết, tài liệu `report.pdf` và các con số trong ví dụ đều là **giả lập**.
- **Nguồn:** Đây là bản diễn giải để tự học, không phải bản dịch chính thức. Nội dung AI Fluency theo giấy phép CC BY-NC-SA 4.0 (Rick Dakan, Joseph Feller, Anthropic).
