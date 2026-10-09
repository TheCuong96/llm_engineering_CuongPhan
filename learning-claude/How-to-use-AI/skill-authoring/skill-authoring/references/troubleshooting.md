# Gỡ lỗi skill

Đọc tệp này khi người dùng báo skill không kích hoạt, không hiện, chọn nhầm, bị ghi đè hoặc lỗi khi chạy.

## Mục lục
1. Trình tự xử lý
2. Bảng triệu chứng
3. Checklist trước khi chia sẻ

## 1. Trình tự xử lý

1. Chạy skills validator/verifier trước để phát hiện lỗi cấu trúc và YAML.
2. Nếu chưa rõ, chạy `claude --debug` và tìm thông báo chứa tên skill.
3. Xếp lỗi vào một nhóm ở bảng dưới, sửa đúng nguyên nhân, rồi khởi động lại Claude Code (skill được quét lúc khởi động).

## 2. Bảng triệu chứng

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Không kích hoạt | Description không gần cách người dùng diễn đạt | Bổ sung cụm từ kích hoạt; thử nhiều câu như "vì sao chậm?", "tối ưu nó" (xem `description-guide.md`) |
| Không tải / không thấy | Sai vị trí hoặc tên tệp | `SKILL.md` phải nằm trong thư mục con có tên skill, đúng chữ hoa `SKILL.md`; kiểm tra YAML có `---` mở và đóng |
| Chọn nhầm skill | Description của các skill quá giống nhau | Viết mô tả phân biệt hơn, nêu rõ phạm vi và thời điểm dùng |
| Bị ghi đè | Skill cùng tên ở cấp ưu tiên cao hơn (Enterprise, Personal, Project, Plugins) | Đổi sang tên cụ thể hơn hoặc trao đổi với admin enterprise |
| Plugin không hiện | Cache hoặc sai cấu trúc plugin | Xóa cache, khởi động lại, cài lại; kiểm tra bằng validator |
| Lỗi khi chạy | Thiếu dependency, thiếu quyền chạy script, sai đường dẫn | Cài dependency; `chmod +x` cho script; dùng `/` trong đường dẫn kể cả trên Windows |

## 3. Checklist trước khi chia sẻ

- [ ] Tên thư mục và `name` rõ ràng, không dễ trùng
- [ ] `SKILL.md` đúng vị trí, YAML hợp lệ
- [ ] Description nêu cả việc skill làm lẫn thời điểm kích hoạt
- [ ] Đã thử nhiều cách diễn đạt yêu cầu
- [ ] `allowed-tools` chỉ cấp đúng quyền cần dùng
- [ ] Tài liệu dài đã tách sang `references/`; script có quyền chạy và dependency rõ ràng
- [ ] Đã kiểm tra xung đột ưu tiên và chạy validator
