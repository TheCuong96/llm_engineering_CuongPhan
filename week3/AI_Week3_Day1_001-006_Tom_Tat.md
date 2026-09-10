# Tuần 3 – Ngày 1: Hugging Face và Google Colab — Bản tóm tắt

> Ôn nhanh bài 001–006. Dựa trên phụ đề do bạn cung cấp; bài 006 có phụ đề đầy đủ nhưng MP4 không truy cập được. Bản đầy đủ cùng bộ tài liệu có giải thích, ví dụ code và cách xử lý lỗi.

## 1. Cả phần này muốn dạy điều gì?

**Tìm mô hình đã được huấn luyện → tải về máy có GPU → dùng Python chạy mô hình → tạo ảnh hoặc âm thanh.**

Đây là bước chuyển từ gọi dịch vụ AI có sẵn sang tự kiểm soát việc nạp và chạy model. Máy chạy trong bài là máy Google Colab trên cloud, không phải laptop của bạn.

Bạn đang làm **inference – suy luận**, chưa tự huấn luyện một ChatGPT từ đầu.

## 2. Mục tiêu của từng video

| Bài | Nội dung cần nắm |
|---|---|
| 001 | Hugging Face có **Models** để lấy mô hình, **Datasets** để lấy dữ liệu, **Spaces** để dùng/triển khai demo AI |
| 002 | Hugging Face còn cung cấp thư viện Python để tải, chạy và tiến tới tinh chỉnh mô hình |
| 003 | Colab cho phép chạy notebook trên máy từ xa; GPU giúp xử lý tính toán AI, VRAM giới hạn khả năng chứa model và dữ liệu |
| 004 | Biết chọn runtime, kết nối GPU, theo dõi tài nguyên và restart đúng cách |
| 005 | Thiết lập `HF_TOKEN`, đăng nhập Hub, tải SDXL Turbo và tạo ảnh đầu tiên |
| 006 | Thử SDXL, Refiner, SpeechT5 và FLUX để hiểu chất lượng, thời gian, bộ nhớ và chi phí |

## 3. Phân biệt các tên dễ nhầm

| Tên | Vai trò |
|---|---|
| Hugging Face Hub | Kho tài nguyên AI trên web |
| `huggingface_hub` | Thư viện làm việc với kho đó |
| `transformers` | Thư viện chạy nhiều mô hình, gồm văn bản và âm thanh |
| `diffusers` | Thư viện dùng cho các pipeline sinh ảnh trong bài |
| `datasets` | Thư viện nạp và xử lý dữ liệu |
| PEFT / TRL / Accelerate | Công cụ nâng cao cho tinh chỉnh, huấn luyện và thiết bị; chưa cần thành thạo hôm nay |
| PyTorch | Lớp tính toán tensor, CPU/GPU bên dưới nhiều ví dụ |
| Ollama | Công cụ chạy model qua cách dùng đóng gói sẵn |
| Llama | Một họ mô hình; khác Ollama |
| Pipeline | Các bước xử lý một tác vụ được đóng gói để dễ gọi |

**Hugging Face cung cấp tài nguyên và thư viện; Colab cung cấp môi trường tính toán.**

## 4. Quy trình thực hành cần nhớ

1. Mở notebook khóa học, lưu bản sao vào Drive.
2. Chọn GPU runtime và kết nối; kiểm tra bằng `!nvidia-smi`.
3. Cài thư viện cần thiết trong runtime.
4. Nếu cần xác thực, tạo secret `HF_TOKEN`, bật Notebook access và đăng nhập.
5. Nạp model bằng thư viện, đưa lên thiết bị phù hợp.
6. Gửi prompt, nhận ảnh/âm thanh và lưu kết quả cần giữ.
7. Kết thúc runtime khi dùng xong.

**Chạy cell từ trên xuống.** Restart session làm mất biến và model trong bộ nhớ; xóa runtime còn làm mất môi trường tạm, có thể phải cài và tải lại. Lưu notebook không đồng nghĩa lưu toàn bộ máy chạy. [Đối chiếu: FAQ Colab](https://research.google.com/colaboratory/faq.html).

## 5. Các demo bài 006 nói lên điều gì?

- **SDXL Turbo:** trải nghiệm tạo ảnh bằng model chạy trực tiếp trên T4.
- **SDXL Base:** thử cấu hình khác với 30 inference steps và nhu cầu bộ nhớ cao hơn trong phiên demo.
- **Base + Refiner:** hai giai đoạn xử lý, chia khoảng 80/20; không phải chia train/test. Phiên của giảng viên chạy được trên T4 nhưng sát giới hạn.
- **SpeechT5:** đưa văn bản vào và tạo giọng đọc; không phải chatbot hay nhận dạng giọng nói.
- **FLUX.1-schnell:** dùng 4 bước trên A100; chứng minh model cho tải không đồng nghĩa máy chạy miễn phí.

**Inference steps là số bước xử lý khi sinh đầu ra, không phải số vòng huấn luyện.** Số bước phù hợp tùy model; tăng bước không bảo đảm ảnh đẹp hơn.

## 6. Những chỗ cần hiểu chính xác

| Dễ hiểu nhầm | Cách hiểu đúng |
|---|---|
| Colab lúc nào cũng có T4 miễn phí | GPU và giới hạn phụ thuộc khả dụng; không được bảo đảm |
| Tải model phải có token Write | Đọc/tải không mặc định cần Write; quyền truy cập repo vẫn phải hợp lệ |
| Có nhiều disk/RAM là đủ chạy AI | GPU memory là tài nguyên riêng; còn cần bộ nhớ cho dữ liệu trung gian |
| “Chanel”, “Speech five”, “GIF” trong phụ đề | Tên đúng theo ngữ cảnh: **schnell**, **SpeechT5**, **GGUF** |
| Model trên Hub đều được dùng tùy ý | Cần đọc giấy phép và điều kiện từng model |
| Demo tốn khoảng 0,04 USD là giá cố định | Chỉ là ước tính theo giả định trong video; còn thời gian giữ runtime |

Đối chiếu: [quyền token Hugging Face](https://huggingface.co/docs/hub/security-tokens), [FLUX.1-schnell](https://huggingface.co/black-forest-labs/FLUX.1-schnell), [SpeechT5](https://huggingface.co/microsoft/speecht5_tts).

## 7. Tự kiểm tra trong một phút

- **Model tải ở đâu?** Hugging Face Hub.
- **Code tính toán ở đâu trong bài?** Máy Colab.
- **Thư viện nào tạo ảnh trong các ví dụ?** `diffusers`.
- **Vì sao lần đầu chậm?** Phải tải và nạp model trước khi suy luận.
- **Vì sao restart rồi `pipe` không tồn tại?** Kernel đã mất trạng thái.
- **Hôm nay đã học fine-tuning chưa?** Chưa; mới giới thiệu công cụ để chuẩn bị.

Ưu tiên hiểu luồng hoạt động trên và chạy được một ví dụ nhỏ trước khi học thêm các thư viện nâng cao.
