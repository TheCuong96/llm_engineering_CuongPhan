---
name: Quy tắc ghi note cho notebook và mã nguồn
description: Áp dụng khi người dùng yêu cầu ghi note, viết note hoặc giải thích các file notebook, Python và Markdown.
applyTo: "**/*.{ipynb,py,md}"
---

# Quy tắc ghi note và giải thích

Khi người dùng yêu cầu “ghi note” hoặc “viết note”, hãy tuân thủ các quy tắc sau:

- Dịch nội dung và các ghi chú Markdown sang tiếng Việt.
- Thêm phần giải thích cho từng cell trong notebook.
- Giải thích các câu lệnh chính bằng ngôn ngữ dễ hiểu.
- Viết theo phong cách học tập, rõ ràng, dễ hiểu và không quá kỹ thuật.
- Thêm comment ngắn gọn để giải thích các khối code quan trọng.
- Giữ nguyên logic và thứ tự xử lý của code để notebook vẫn chạy được.
- Không tự ý xóa, đổi tên hoặc thay đổi biến, hàm, thư viện và kết quả của code nếu không cần thiết cho yêu cầu.
- Với file `.ipynb`, phải giữ đúng định dạng JSON hợp lệ của notebook.
- Với file `.ipynb`, mỗi cell mới phải có `cell_type`, `metadata.language` và `source` phù hợp.
- Không hiển thị hoặc đề cập đến mã định danh nội bộ của cell trong câu trả lời; hãy gọi là “Cell 1”, “Cell 2” theo thứ tự xuất hiện.

## Cấu trúc giải thích bắt buộc

Khi giải thích một notebook hoặc một cell, hãy ưu tiên sử dụng các tiêu đề sau:

### Tóm tắt quy trình của notebook

Mô tả ngắn gọn notebook thực hiện những bước nào và các bước liên kết với nhau ra sao.

### Ý nghĩa chính của notebook

Giải thích notebook đang giải quyết bài toán gì, dữ liệu đi qua những bước nào và kết quả cuối cùng có ý nghĩa gì.

### Giải thích từng cell

Với mỗi cell, nêu rõ:

- Cell này dùng để làm gì.
- Các câu lệnh hoặc khối code chính hoạt động như thế nào.
- Vì sao cell này cần thiết trong quy trình.
- Kết quả của cell được sử dụng ở đâu tiếp theo, nếu có.

### Chốt ý nghĩa thực tế của cell trong dự án

Kết thúc phần giải thích của mỗi cell bằng một câu liên hệ thực tế. Ví dụ:

> Cell này dùng để tải dữ liệu, vì vậy nó cần import thư viện, gọi `load_dataset()` và kiểm tra dữ liệu đầu vào trước khi huấn luyện mô hình.

### Mục tiêu cuối cùng

Nêu kết quả mà người học hoặc dự án đạt được sau khi chạy và hiểu toàn bộ notebook.

## Quy tắc riêng cho từng loại file

- Với `.ipynb`: ưu tiên giữ nguyên cấu trúc JSON, thứ tự cell, code có thể chạy và dữ liệu đầu vào. Nếu cần thêm giải thích, ưu tiên thêm Markdown cell hoặc comment mà không làm hỏng code.
- Với `.py`: giữ nguyên hành vi chương trình; đặt comment gần phần code được giải thích và không biến comment thành phần thay thế cho code.
- Với `.md`: dịch và tổ chức lại nội dung bằng các tiêu đề Markdown rõ ràng; giữ nguyên các đoạn code, tên hàm, tên biến và lệnh có ý nghĩa kỹ thuật.
