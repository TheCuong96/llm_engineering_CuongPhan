# Day 2 — Tóm tắt nhanh video 007–010

> Bản ôn nhanh từ phụ đề bốn video. Đọc bản đầy đủ khi cần ví dụ và giải thích kỹ các điểm dễ nhầm.

## 1. Cả phần này đang làm gì?

**Chuẩn bị dữ liệu để dạy LLaMA 3.2 3B đọc mô tả sản phẩm và đoán giá, rồi kiểm tra năng lực trước huấn luyện.**

Hình dung tuyển một nhân viên định giá: chuẩn bị bài tập có đáp án, rút gọn hồ sơ quá dài và cho làm bài kiểm tra đầu vào. **Chưa bắt đầu fine-tuning trong bốn video này.**

| Video | Ý chính |
| --- | --- |
| 007 | Đếm token, cắt mô tả dài, tạo đề bài và đáp án |
| 008 | Làm tròn giá để tập trung học mức giá chính; đo tổng token |
| 009 | Lưu dataset lên Hugging Face, tải LLaMA 4-bit và thử đoán |
| 010 | Phân biệt base với chat/instruct; ghi kết quả baseline |

## 2. Dữ liệu được biến thành gì?

Mỗi sản phẩm thành hai phần, ví dụ tự tạo:

```text
prompt: Món hàng này giá bao nhiêu?
        Bàn phím Bluetooth, nhỏ gọn, sạc lại được.
        Giá là $

completion: 80.00
```

- **Prompt:** đề bài đưa vào mô hình.
- **Completion:** đáp án muốn mô hình học viết tiếp.
- Lúc huấn luyện có đáp án để học; lúc kiểm tra chỉ đưa prompt, giữ giá thật riêng để chấm.

| Tập dữ liệu | Dùng để làm gì? | Lite | Full |
| --- | --- | ---: | ---: |
| Train | Huấn luyện | 20.000 | 800.000 |
| Validation | Theo dõi, chọn cấu hình/checkpoint | 1.000 | 10.000 |
| Test | Đánh giá | 1.000 | 10.000 |

Lưu dữ liệu lên Hugging Face chỉ giúp tái sử dụng; **upload không phải training**.

## 3. Ba con số token cần phân biệt

Token là đơn vị văn bản mô hình xử lý, không đồng nhất với từ hay ký tự. Phải đếm bằng tokenizer của mô hình.

| Số | Ý nghĩa |
| --- | --- |
| **110** | Giới hạn phần mô tả sản phẩm |
| **126** | Độ dài toàn mẫu lớn nhất được báo sau khi thêm câu hỏi, tiền tố và đáp án |
| **128** | Giới hạn chuỗi dự kiến dùng khi huấn luyện |

Cắt mô tả giúp giảm chi phí xử lý, nhưng có thể mất thông tin. Giảng viên chọn 110 sau khi xem các phần bị cắt, không phải vì mọi dự án đều nên dùng 110.

**Padding** là đệm cho các chuỗi có chiều dài phù hợp khi xử lý chung. **Truncation** là cắt phần vượt giới hạn. 128 không phải giới hạn đọc tối đa của LLaMA; lũy thừa của hai cũng không phải yêu cầu bắt buộc.

## 4. Vì sao làm tròn giá?

Ví dụ giá gốc `79.83`:

- Train/validation dùng `80.00`.
- Test vẫn giữ `79.83` để chấm cùng tiêu chuẩn với thí nghiệm trước.

LLM học dự đoán **token tiếp theo**, không trực tiếp tối ưu số đô la đoán sai. Giảng viên làm tròn để mô hình tập trung vào mức giá chính, giảm công sức học phần cent biến thiên.

Đây là làm tròn đến đô la gần nhất, không phải luôn làm tròn lên. Cũng không có nghĩa mô hình sau học sẽ chỉ sai dưới 1 đô la.

Giảng viên nêu lợi thế tokenizer LLaMA: phần số nguyên 0–999 có thể nằm trong một token. Đừng nhầm điều đó với toàn chuỗi `219.00` chỉ có một token.

## 5. Base model và chat model khác gì?

| Base model | Chat/Instruct model |
| --- | --- |
| Được luyện để tiếp nối văn bản | Được huấn luyện thêm để phản hồi chỉ dẫn/hội thoại |
| Hợp để thử với mẫu cố định “mô tả → giá” | Hợp để thử với nhiều yêu cầu và hội thoại |
| Dùng prompt–completion trực tiếp trong bài | Thường dùng chat template phù hợp |

Cả hai vẫn dự đoán token tiếp theo và đều có thể fine-tune. Chat template định dạng tin nhắn thành chuỗi token mà mô hình đã học. [Tài liệu Hugging Face](https://huggingface.co/docs/transformers/en/chat_templating).

Giảng viên thử cả hai và thấy base tốt hơn một chút **trong thí nghiệm này**. Không suy ra base luôn tốt hơn. Base cũng đã được pretrain, không phải mô hình chưa học gì.

## 6. Kết quả ban đầu nói lên điều gì?

- Mô hình: **LLaMA 3.2 3B base, lượng tử hóa 4-bit**.
- Footprint mô hình được báo: khoảng **2,2 GB**, không phải tổng VRAM cần cho mọi thao tác.
- Sinh thử tối đa **8 token mới**; con số này khác giới hạn huấn luyện 128.
- Ví dụ sản phẩm giá thật **219 đô la**, mô hình đoán khoảng **349.99** rồi viết thêm chữ.

| Cách dự đoán | Giá trị lỗi báo trong video — thấp hơn tốt hơn |
| --- | ---: |
| Luôn đoán một hằng số | 106,18 |
| LLaMA base 4-bit | 110,72 |

Phụ đề chưa xác định rõ công thức “error”, nên không tự gọi 110,72 là MAE hay RMSE. R² âm được báo cho thấy kết quả kém hơn dự đoán trung bình xét theo sai số bình phương.

**Baseline** là mốc trước huấn luyện. Phần tiếp theo sẽ kiểm tra fine-tuning có cải thiện được mốc đó hay không; hiện chưa có kết quả sau huấn luyện.

## 7. Chốt lại bằng năm điều cần nhớ

1. Đây là chuẩn bị fine-tuning một mô hình có sẵn cho nhiệm vụ định giá, không xây ChatGPT từ đầu.
2. Dữ liệu học gồm đề bài và đáp án; không đưa đáp án vào prompt khi kiểm tra.
3. Cắt token và làm tròn giá là lựa chọn thiết kế cần đo lại hiệu quả.
4. Giữ giá test gốc và cùng cách chấm để so sánh công bằng; dùng validation để chọn cấu hình.
5. Nạp 4-bit giúp mô hình gọn hơn; huấn luyện mới giúp nó học thêm nhiệm vụ. Hai việc khác nhau.

> Lưu ý nguồn: phụ đề có vài lỗi lời nói/số học, chẳng hạn 1.255/20.000 thực tế là 6,275%, không phải 5,7%. Bản đầy đủ giải thích các chỗ cần đọc thận trọng.
