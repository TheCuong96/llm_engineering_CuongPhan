
0. tạo file claude.md, tạo skill/skill.md
0. Nhờ AI viết prompt cho yêu cầu mình mong muốn sau đó đọc lại prompt đó xem đã plan chuẩn chưa.

### Một prompt rõ cần nói gì?

1. **Mục tiêu:** bạn muốn hoàn thành việc gì?
2. **Ngữ cảnh:** khu vực/luồng nào, dùng công nghệ nào?
3. **Phạm vi:** được sửa phần nào, phần nào cần giữ nguyên?
4. **Ràng buộc:** cần theo pattern nào, có được thêm dependency không?
5. **Tiêu chí thành công:** cần chạy test/build nào, hành vi nào phải hoạt động?
6. **Mức tự chủ:** chỉ phân tích, lập kế hoạch hay được thực hiện?

1. Luôn hỏi có ngữ cảnh, bối cảnh, vấn đề cần giải quyết, kết quả mong muốn.

2. Khi làm xong phải chạy thử -> kiểm tra các code thay đổi và code chưa thay đổi -> kiểm tra phạm vi mà nó đã thay đổi code xem có sửa ngoài phạm vi yêu cầu hay không, sau đó mới push code lên 1 nhánh task và nhánh này có thể xóa bất cứ lúc nào

3. khi push lên github sau đó cho AI trên web kiểm tra lại code vừa được đẩy lên để hiểu codebase -> nếu có vấn đề thì yêu cầu nó viết prompt lại để sửa phần đó -> đem prompt xuống IDE để AI trên IDE sửa sau đó push code lên lại và cho AI trên web check lặp đi lặp lại đến khi AI không còn báo lỗi.
