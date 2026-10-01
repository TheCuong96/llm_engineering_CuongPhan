
# Quy tắc đặt câu hỏi và làm việc với AI

## 1. Chuẩn bị dự án và yêu cầu

- Tạo `CLAUDE.md`, skill tại `skill/skill.md` và hook phù hợp với dự án.
- Nhờ AI soạn prompt lập kế hoạch cho yêu cầu, sau đó đọc lại để xác nhận kế hoạch đúng với mục tiêu trước khi triển khai.

## 2. Quy trình làm việc cốt lõi

> **Explore → Plan → Code → Commit**

Đây là quy trình trung tâm của khóa học. Bắt đầu viết mã ngay thường dẫn đến nhiều vòng sửa sai; khảo sát và lập kế hoạch trước giúp giảm chi phí về sau.

- Bài gốc: [Claude Code 101 — Explore, plan, code, commit](https://anthropic.skilljar.com/claude-code-101/469792)
- Video: [The explore → plan → code → commit workflow](https://www.youtube.com/watch?v=xJQuF02NAK8)

### Explore — Khảo sát

Claude đọc cấu trúc dự án, các tệp liên quan, bài kiểm thử và tài liệu. Không cần đọc mọi thứ; mục tiêu là xác định **thay đổi nằm ở đâu và phụ thuộc vào những gì**. Có thể dùng Plan mode hoặc subagent Explore khi chỉ cần phác họa codebase.

**Ví dụ yêu cầu:**

```text
Khảo sát pipeline tải ảnh. Xác định điểm thích hợp để chuyển sang WebP,
dependency đang dùng và test liên quan. Chỉ đọc và báo cáo, chưa sửa mã.
```

### Plan — Lập kế hoạch

Một kế hoạch tốt cần nêu rõ:

- Các tệp dự kiến sửa.
- Trình tự thực hiện.
- Rủi ro và trường hợp biên.
- Tiêu chí thành công.
- Lệnh kiểm thử cụ thể.

Đây là thời điểm ít tốn kém nhất để điều chỉnh hướng đi. Nếu kế hoạch đụng đến quá nhiều tệp hoặc thêm dependency không cần thiết, hãy thu hẹp phạm vi trước khi triển khai.

### Code — Thực thi có kiểm chứng

Sau khi duyệt kế hoạch, Claude triển khai theo từng bước. Để giai đoạn này ổn định:

- Định nghĩa “hoàn thành” bằng kết quả có thể quan sát: test nào phải qua, đầu ra nào phải xuất hiện.
- Cấp công cụ phù hợp. Ví dụ, tác vụ giao diện cần có khả năng mở và kiểm tra trình duyệt.
- Dùng test suite đáng tin cậy; test sai có thể tạo cảm giác thành công giả.

Nếu một lỗi lặp lại do quy ước dự án, hãy ghi quy ước vào `CLAUDE.md` thay vì sửa thủ công trong mọi phiên.

### Commit — Rà soát và đóng gói thay đổi

Trước khi commit:

1. Tự chạy và kiểm tra thay đổi.
2. Xem `git diff`, đặc biệt là các tệp nằm ngoài dự kiến.
3. Nhờ subagent reviewer đánh giá chỉ-đọc để có góc nhìn mới.
4. Chạy test, lint và type-check phù hợp.
5. Nhờ Claude soạn commit message theo phong cách của repository.

Quy trình không kết thúc chỉ vì AI thông báo đã xong. Thay đổi chỉ nên được xem là hoàn tất sau khi đã qua rà soát của con người và các bước kiểm chứng.

## 3. Một prompt rõ ràng cần có gì?

1. **Mục tiêu:** Bạn muốn hoàn thành việc gì?
2. **Ngữ cảnh:** Khu vực hoặc luồng nào liên quan? Dự án dùng công nghệ gì?
3. **Phạm vi:** Được sửa phần nào, phần nào cần giữ nguyên?
4. **Ràng buộc:** Có cần theo pattern, framework, style hoặc yêu cầu tương thích nào không? Có được thêm dependency không?
5. **Tiêu chí thành công:** Cần chạy test/build nào? Hành vi nào phải hoạt động?
6. **Mức tự chủ:** Chỉ phân tích, lập kế hoạch hay được phép thực hiện?

## 4. Cách phản hồi một kế hoạch chưa tốt

Đừng chỉ nói “làm lại”. Hãy chỉ rõ phần cần thay đổi và phần cần giữ nguyên.

**Ví dụ:**

> Giữ nguyên bước 1 và 2. Ở bước 3, không thêm dependency mới; hãy tận dụng CSS variables hiện có. Bổ sung kiểm thử cho việc lưu lựa chọn theme sau khi tải lại trang.

## 5. Kiểm tra trước khi push

Sau khi hoàn thành thay đổi:

- [ ] Chạy thử và xác nhận hành vi mới hoạt động.
- [ ] Kiểm tra cả phần code thay đổi lẫn các phần liên quan không thay đổi.
- [ ] Đối chiếu phạm vi thay đổi với yêu cầu; xác nhận không sửa ngoài phạm vi.
- [ ] Sau khi kiểm tra xong, push lên một nhánh riêng cho task. Nhánh này có thể xóa khi không còn cần thiết.

## 6. Rà soát lại sau khi push lên GitHub

1. Nhờ AI trên web kiểm tra code vừa push và nắm ngữ cảnh codebase.
2. Nếu AI phát hiện vấn đề, yêu cầu viết prompt cụ thể để sửa vấn đề đó.
3. Đưa prompt xuống IDE để AI sửa code.
4. Kiểm tra và push phần sửa lên GitHub.
5. Lặp lại việc rà soát cho đến khi AI không còn báo vấn đề.
