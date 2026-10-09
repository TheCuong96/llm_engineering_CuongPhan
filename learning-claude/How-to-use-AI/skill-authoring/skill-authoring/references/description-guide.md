# Hướng dẫn viết `description`

Đọc tệp này khi viết hoặc sửa `description` của một skill.

## Mục lục
1. Vai trò của description
2. Công thức
3. Ví dụ tốt và chưa tốt
4. Tránh chọn nhầm skill
5. Quy trình thử nghiệm

## 1. Vai trò của description

Description là "bộ định tuyến": Claude so sánh yêu cầu của người dùng với mô tả theo **nghĩa**, không chỉ khớp từ nguyên văn. Mô tả mơ hồ thì skill không bao giờ được gọi; mô tả quá rộng thì skill bị gọi nhầm.

## 2. Công thức

Một description tốt gồm bốn phần, trong tối đa 1.024 ký tự:

1. **Làm gì**: một câu nêu năng lực chính.
2. **Phạm vi**: các khía cạnh skill bao phủ, để phân biệt với skill gần giống.
3. **Khi nào dùng**: tình huống và những cách diễn đạt người dùng thực tế sẽ nói, kể cả khi họ không gọi tên chủ đề ("kể cả khi họ không nói chữ X").
4. **Từ khóa kích hoạt** (tùy chọn): cụm từ ngắn, song ngữ nếu người dùng dùng nhiều ngôn ngữ.

## 3. Ví dụ

Chưa tốt:

```yaml
description: Giúp review code.
```

Lý do: không nói review loại nào, khi nào dùng, và dễ trùng với skill review khác.

Tốt hơn:

```yaml
description: Rà soát pull request về chất lượng mã (đúng đắn, edge cases, bảo mật, khả năng đọc). Dùng khi review PR, kiểm tra thay đổi mã, hoặc người dùng hỏi "có vấn đề gì trong diff này không", kể cả khi họ không nói chữ "review".
```

Ví dụ khác, skill ít được gọi cần thêm cách diễn đạt thực tế:

```yaml
description: Chẩn đoán và tối ưu hiệu năng truy vấn MongoDB. Dùng khi API chậm, truy vấn tốn thời gian, cần thêm index, hoặc người dùng nói "vì sao chậm", "tối ưu nó", "query này nặng quá".
```

## 4. Tránh chọn nhầm skill

Khi hai skill có mô tả gần giống nhau, Claude có thể chọn sai. Cách xử lý:

- Nêu **phạm vi cụ thể** (frontend hay backend, PR hay toàn repo).
- Đặt tên cụ thể: `frontend-review` và `backend-review`, không phải `review`.
- Nếu một skill luôn đi kèm skill khác, ghi rõ trong description ("kết hợp với `backend-standards`").

## 5. Quy trình thử nghiệm

1. Liệt kê 5-8 câu người dùng có thể nói, gồm cả câu gián tiếp và viết tắt.
2. Khởi động lại Claude Code, thử từng câu, ghi lại câu nào **không** kích hoạt.
3. Thêm cách diễn đạt đó vào description, lặp lại.
4. Thử thêm vài câu **không liên quan** để chắc skill không bị gọi thừa.
