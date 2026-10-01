
0. tạo file claude.md, tạo skill/skill.md, tạo hook

0. Nhờ AI viết prompt lên kế hoạch(plan) cho yêu cầu mình mong muốn sau đó đọc lại prompt đó xem đã plan chuẩn chưa.


Explore → Plan → Code → Commit

- Bài gốc: <https://anthropic.skilljar.com/claude-code-101/469792>
- Video: [The explore → plan → code → commit workflow](https://www.youtube.com/watch?v=xJQuF02NAK8)

Đây là quy trình trung tâm của khóa học. Nhảy thẳng vào viết mã thường tạo nhiều vòng sửa sai; đầu tư vào khảo sát và kế hoạch giúp giảm chi phí về sau.

### Explore — Khảo sát

Claude đọc cấu trúc dự án, tệp liên quan, test và tài liệu. Mục tiêu không phải đọc mọi thứ, mà trả lời câu hỏi “thay đổi này nằm ở đâu và phụ thuộc vào gì?”. Có thể dùng Plan mode hoặc một subagent Explore nếu chỉ cần bản đồ codebase.

Ví dụ:

```text
Khảo sát pipeline tải ảnh. Xác định điểm thích hợp để chuyển sang WebP,
dependency đang dùng và test liên quan. Chỉ đọc và báo cáo, chưa sửa mã.
```

### Plan — Lập kế hoạch

Kế hoạch tốt phải có:

- danh sách tệp dự kiến sửa;
- trình tự thay đổi;
- rủi ro và trường hợp biên;
- tiêu chí thành công;
- lệnh kiểm thử cụ thể.

Đây là lúc sửa hướng rẻ nhất. Nếu plan đụng quá nhiều tệp hoặc thêm dependency không cần thiết, hãy yêu cầu thu hẹp trước khi triển khai.

### Code — Thực thi có kiểm chứng

Sau khi duyệt plan, Claude triển khai từng bước. Ba cách giúp giai đoạn này ổn định:

- Định nghĩa “done” bằng điều có thể quan sát: test nào phải qua, output nào phải xuất hiện.
- Cấp công cụ phù hợp; ví dụ tác vụ giao diện cần khả năng mở và kiểm tra trình duyệt.
- Có test suite đáng tin cậy; test sai có thể tạo cảm giác thành công giả.

Nếu một lỗi lặp lại do quy ước dự án, ghi lại quy ước vào `CLAUDE.md` thay vì sửa bằng tay trong mọi phiên.

### Commit — Rà soát và đóng gói thay đổi

Trước khi commit:

1. Tự chạy và kiểm tra thay đổi.
2. Xem `git diff`, đặc biệt các tệp ngoài dự kiến.
3. Nhờ subagent reviewer chỉ đọc để có góc nhìn mới.
4. Chạy test/lint/type-check.
5. Nhờ Claude viết commit message theo phong cách repository.

Quy trình kết thúc ở commit không có nghĩa là “Claude nói xong”. Nó kết thúc khi thay đổi đã được con người và các cổng kiểm chứng xem xét.

---

### Một prompt rõ cần nói gì?

1. **Mục tiêu:** bạn muốn hoàn thành việc gì?
2. **Ngữ cảnh:** khu vực/luồng nào, dùng công nghệ nào?
3. **Phạm vi:** được sửa phần nào, phần nào cần giữ nguyên?
4. **Ràng buộc:** cần theo pattern nào, có được thêm dependency không? framework, style, dependency, tương thích…
5. **Tiêu chí thành công:** cần chạy test/build nào, hành vi nào phải hoạt động?
6. **Mức tự chủ:** chỉ phân tích, lập kế hoạch hay được thực hiện?

7. Cách phản hồi một kế hoạch chưa tốt
Đừng nói “làm lại”. Hãy chỉ ra phần cần sửa:

Giữ nguyên bước 1 và 2. Ở bước 3, không thêm dependency mới;
hãy tận dụng CSS variables hiện có. Bổ sung kiểm thử cho việc lưu lựa chọn
theme sau khi tải lại trang.

2. Khi làm xong phải chạy thử -> kiểm tra các code thay đổi và code chưa thay đổi -> kiểm tra phạm vi mà nó đã thay đổi code xem có sửa ngoài phạm vi yêu cầu hay không, sau đó mới push code lên 1 nhánh task và nhánh này có thể xóa bất cứ lúc nào

3. khi push lên github sau đó cho AI trên web kiểm tra lại code vừa được đẩy lên để hiểu codebase -> nếu có vấn đề thì yêu cầu nó viết prompt lại để sửa phần đó -> đem prompt xuống IDE để AI trên IDE sửa sau đó push code lên lại và cho AI trên web check lặp đi lặp lại đến khi AI không còn báo lỗi.
