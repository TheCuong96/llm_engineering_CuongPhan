
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

Phải trả lời các câu hỏi này khi khảo sát khi phát triển tính năng:

- Xác định mong muốn: thêm tính năng gì, bỏ hoặc thay đổi cái gì...
- Làm ở đâu trong dự án nào hoặc trong phần nào của dự án
- Tính năng hoặc chức năng đó phù hợp với model LLM nào làm là tốt  nhất
- có cần note hoặc ghi chú lại các docx.
- có muốn làm theo lộ trình hoặc tài liệu nào đã được setup sẵn hay không
- có cần kết nối với MCP nào không.


**Ví dụ yêu cầu:**

```text
Khảo sát pipeline tải ảnh. Xác định điểm thích hợp để chuyển sang WebP,
dependency đang dùng và test liên quan. Chỉ đọc và báo cáo, chưa sửa mã.
```

Mẫu prompt:

```text
Hãy khảo sát luồng thanh toán và lập kế hoạch tách logic tính thuế
thành một module riêng. Chỉ đọc, chưa sửa mã.

Kế hoạch phải nêu:
- tệp sẽ thay đổi;
- interface trước và sau;
- test cần thêm hoặc cập nhật;
- rủi ro tương thích;
- tiêu chí hoàn thành có thể kiểm tra.
```
Phải trả lời các câu hỏi này khi khảo sát khi sửa lỗi:

- Tìm nguyên nhân của lỗi và đề xuất cách sửa: lỗi là lỗi gì có thể là lỗi business hoặc lỗi do code hoặc lỗi từ framework hoặc lỗi vì thiếu tính năng


### Ví dụ thực tế

Thay vì hỏi chung chung:

```text
Sửa phần đăng nhập.
```

Hãy mô tả mục tiêu và tiêu chí hoàn thành:

```text
Tìm nguyên nhân người dùng bị đăng xuất sau khi tải lại trang.
Trước tiên hãy lần theo luồng tạo và lưu session, chưa sửa mã.
Sau đó đề xuất kế hoạch. Thành công khi test session hiện có vượt qua
và có thêm test tái hiện lỗi tải lại trang.
```

### Plan — Lập kế hoạch

Một kế hoạch tốt cần nêu rõ:

- Xác định mong muốn: thêm tính năng gì, bỏ hoặc thay đổi cái gì...
- Lộ trình thực hiện: ví dụ tạo interface trước -> setup state -> sử dụng ở đâu.
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

### Ví dụ thêm tính năng dark mode

Yêu cầu không chỉ là “thêm dark mode”, mà cần nói vị trí công tắc, phạm vi toàn ứng dụng và yêu cầu màu tương phản dựa trên theme sáng hiện có. Trong Plan mode, Claude tìm cấu trúc theme, hỏi điều chưa rõ và đưa ra kế hoạch. Bạn duyệt kế hoạch trước khi cho phép thực thi.

Mẫu prompt Việt hóa:

```text
Ứng dụng cần dark mode trên toàn bộ giao diện.
Hãy đặt công tắc chuyển theme ở header và tìm bảng màu tối có độ tương phản
phù hợp với theme sáng hiện tại. Trước tiên dùng Plan mode để khảo sát cách
ứng dụng đang quản lý theme, liệt kê các tệp sẽ sửa và cách kiểm thử.
Chưa viết mã cho đến khi tôi duyệt kế hoạch.
```

### Cách phản hồi một kế hoạch chưa tốt

Đừng nói “làm lại”. Hãy chỉ ra phần cần sửa:

```text
Giữ nguyên bước 1 và 2. Ở bước 3, không thêm dependency mới;
hãy tận dụng CSS variables hiện có. Bổ sung kiểm thử cho việc lưu lựa chọn
theme sau khi tải lại trang.
```

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
