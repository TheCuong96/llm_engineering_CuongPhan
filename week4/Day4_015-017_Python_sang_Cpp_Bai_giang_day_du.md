# Day 4 — Chọn và thử mô hình AI để chuyển Python sang C++

> Bản giảng đầy đủ cho các video 015–017. Nội dung được diễn giải từ phụ đề tiếng Anh, có đối chiếu bảng kết quả trên video 017. Những mục ghi **Giải thích bổ sung** là phần làm rõ của người biên soạn. Các thứ hạng và số đo thuộc thí nghiệm trong video, không phải bảng xếp hạng AI hiện tại.

## 1. Cả phần này thực sự muốn dạy điều gì?

**Giảng viên muốn bạn biết cách chọn mô hình AI phù hợp với một công việc thực tế, bằng cách xây công cụ thử nghiệm và đo kết quả của chính công việc đó.**

Bài toán xuyên suốt là: đã có chương trình Python tính gần đúng số π bằng khoảng 200 triệu bước lặp; muốn AI viết lại bằng C++ để chương trình chạy nhanh hơn, nhưng vẫn thực hiện đúng phép tính.

Bạn có thể hình dung mình giao cùng một nhiệm vụ cho nhiều lập trình viên. Người có hồ sơ ấn tượng nhất chưa chắc đưa ra phương án tốt nhất cho nhiệm vụ này. Cần xem sản phẩm họ tạo ra, kiểm tra rồi đo tốc độ.

| Video | Giảng viên làm gì? | Bạn cần hiểu điều gì? |
| --- | --- | --- |
| 015 — Open Source Models for Code Generation | Chọn Qwen, DeepSeek, GPT-OSS; chuẩn bị Ollama và các dịch vụ API | Dùng bảng đánh giá để chọn ứng viên; phân biệt mô hình với nơi chạy mô hình |
| 016 — Building a Gradio UI | Tạo giao diện chuyển code và thử ba mô hình local | Ghép giao diện, hàm xử lý và lời gọi AI thành ứng dụng có thể thử nghiệm |
| 017 — Qwen 3 Coder vs GPT OSS | Thử thêm mô hình qua OpenRouter, Groq rồi tổng hợp | Đọc kết quả có giới hạn; mô hình lớn hơn hoặc nổi tiếng hơn không bảo đảm thắng |

Đây là bài học về **LLM application engineering — xây ứng dụng sử dụng mô hình ngôn ngữ**, và **evaluation — đánh giá đầu ra**. Bạn sử dụng mô hình đã được huấn luyện sẵn; ba video này không hướng dẫn huấn luyện mô hình từ đầu hay fine-tuning.

## 2. Hiểu đúng các thành phần trước khi xem thao tác

| Thành phần | Vai trò trong bài | Cách nhớ |
| --- | --- | --- |
| Qwen, DeepSeek, GPT-OSS | Các mô hình được yêu cầu viết C++ | Người giải bài |
| Ollama | Công cụ chạy mô hình trên máy giảng viên | Nơi vận hành AI local |
| OpenRouter | Dịch vụ truy cập mô hình qua API và các nhà cung cấp | Cổng gọi AI từ xa |
| Groq | Nền tảng suy luận được dùng để gọi GPT-OSS 120B | Hạ tầng chạy AI từ xa |
| Gradio | Tạo giao diện nhập Python, chọn mô hình, xem C++ | Màn hình thử nghiệm |
| Compiler — trình biên dịch | Biến mã C++ thành chương trình thực thi | Công cụ xây chương trình từ code |
| Benchmark — bài đo chuẩn | Bài thử giúp so sánh theo tiêu chí xác định | Đề thi cùng cách chấm |
| Evals — các phép đánh giá | Kiểm tra mức độ đáp ứng yêu cầu của đầu ra | Quy trình nghiệm thu |

**Groq và Grok là hai tên khác nhau:** Groq là nền tảng chạy mô hình được dùng trong Day 4; Grok 4 là mô hình xuất hiện trong bảng kết quả từ buổi trước. Phụ đề nhận dạng giọng nói có lúc làm lẫn hai tên này.

### Giải thích bổ sung: “open source”, “local” và “miễn phí”

Giảng viên dùng “open source models” theo cách gọi phổ biến của khóa học. Khi cần phân loại chặt chẽ, cần phân biệt **open weights — công khai trọng số** với việc công khai đầy đủ mã nguồn, dữ liệu và quy trình huấn luyện; điều kiện sử dụng phụ thuộc từng mô hình.

**Local** chỉ nơi mô hình chạy. Cùng một họ mô hình có thể được chạy bằng Ollama trên máy cá nhân hoặc được truy cập qua dịch vụ đám mây.

Chạy local thường không phát sinh phí API theo token, nhưng vẫn dùng bộ nhớ, điện và thời gian của máy. Gọi mô hình mở qua dịch vụ có thể mất phí vì nhà cung cấp vận hành phần cứng. Không nên suy ra “mô hình mở” đồng nghĩa với “mọi cách sử dụng đều miễn phí”.

Các nhãn 7B, 20B, 30B, 120B nói đến quy mô tham số, với B là billion — tỷ. Chúng không trực tiếp cho biết dung lượng RAM/VRAM cần dùng. Bộ nhớ còn phụ thuộc cách lưu trọng số, lượng tử hóa, độ dài ngữ cảnh và cấu hình chạy. Không biến lời ước lượng phần cứng trong phụ đề thành yêu cầu chung cho mọi máy.

## 3. Video 015 — Vì sao chọn các mô hình này?

### 3.1. Đi từ yêu cầu công việc đến danh sách ứng viên

Giảng viên xem Big Code Models Leaderboard trên Hugging Face và các thước đo lập trình trên Artificial Analysis. Vì đầu ra cần là C++, ông tìm tiêu chí liên quan đến khả năng viết code, đặc biệt C++.

Ông cũng nhận xét một bảng có thể đã cũ, và các thước đo khác nhau có thể cho thứ tự khác nhau. Điều này dẫn tới cách làm hợp lý:

1. Xác định công việc: chuyển Python sang C++ có hiệu năng tốt.
2. Tìm thước đo gần với công việc đó.
3. Chọn vài mô hình có triển vọng và phù hợp khả năng sử dụng.
4. Thử chúng trên chương trình thực tế.

**Bảng xếp hạng giúp thu hẹp lựa chọn; kết quả thử trên bài toán của bạn mới giúp quyết định.** Một phiên bản lớn đạt điểm cao cũng không chứng minh phiên bản nhỏ cùng họ đạt kết quả tương đương.

### 3.2. Hai cách chạy mô hình trong thí nghiệm

| Mô hình/phiên bản được thử | Cách truy cập trong video |
| --- | --- |
| Qwen 2.5 Coder, bản khoảng 7B | Ollama, trên máy giảng viên |
| DeepSeek Coder v2, bản khoảng 16B | Ollama, trên máy giảng viên |
| GPT-OSS 20B | Ollama, trên máy giảng viên |
| Qwen 3 Coder 30B | OpenRouter |
| GPT-OSS 120B | Groq |

Điểm cần học: bạn không bị giới hạn ở các mô hình vừa bộ nhớ máy cá nhân nếu chấp nhận dùng dịch vụ từ xa. Đồng thời, có thể giữ cùng một giao diện để thử nhiều cách truy cập.

Trong phần chuẩn bị, giảng viên tải các mô hình local, nạp khóa API cho các dịch vụ cần dùng, khởi tạo client và tạo bảng ánh xạ **tên mô hình → client tương ứng**.

**Giải thích bổ sung cho người biết JavaScript:** bảng ánh xạ này giống một object cấu hình để tìm đúng adapter. Khi chọn một mô hình, ứng dụng biết phải gửi yêu cầu tới Ollama, OpenRouter hay Groq. Mô hình không tự quyết định nơi chạy; ứng dụng định tuyến lời gọi.

### 3.3. Vì sao prompt chứa thông tin máy và lệnh biên dịch?

AI được cung cấp:

- Mã Python cần chuyển.
- Thông tin hệ thống, gồm kiến trúc và thông tin CPU.
- Lệnh sẽ dùng để biên dịch C++.
- Yêu cầu về việc chuyển đổi và tối ưu.

Các thông tin này giúp mô hình viết chương trình phù hợp môi trường đích. Code và cách biên dịch cùng tác động đến tốc độ; không thể chỉ nhìn tên ngôn ngữ để dự đoán toàn bộ hiệu năng.

Ở cuối video 015, giảng viên tự sửa nhận xét về Grok từ buổi trước: số lõi CPU đã có trong prompt, nên việc Grok dùng số luồng cố định không nhất thiết là đoán bừa. Cũng không đủ cơ sở để nói Gemini nhanh hơn chỉ vì tự đọc số lõi.

**Bài học:** khi giải thích kết quả, cần kiểm tra lại dữ kiện đã cung cấp cho mô hình, tránh gán nguyên nhân quá sớm.

## 4. Video 016 — Xây công cụ thử bằng Gradio

### 4.1. Giao diện nhỏ nhưng phục vụ một mục đích rõ ràng

Giao diện có ô Python đầu vào, ô C++ đầu ra, danh sách chọn mô hình và nút **Convert Code**. Gradio dùng cách dựng bố cục `Blocks` để ghép các thành phần này.

Khi bấm nút, giao diện gọi hàm `port` ở phía Python, truyền mô hình đã chọn và mã Python. Hàm xử lý yêu cầu chuyển đổi; đầu ra C++ được hiển thị và ghi vào `main.cpp`.

Sau đó giảng viên quay lại notebook để gọi bước biên dịch và chạy. **Trong phần trình diễn này, nút Convert Code thực hiện chuyển code; bước đo hiệu năng được chạy riêng.**

| Nếu quen React | Thành phần tương ứng trong bài |
| --- | --- |
| Textarea nhập dữ liệu | Ô mã Python |
| Select | Dropdown chọn mô hình |
| `onClick` gọi xử lý | Sự kiện nút Convert Code gọi `port` |
| Giá trị dùng để cập nhật UI | C++ do hàm trả về hoặc phát ra |
| Backend gọi dịch vụ ngoài | Python client gọi mô hình |

Mã giả dưới đây chỉ diễn tả luồng, không phải mã nguồn đầy đủ của notebook:

```text
Khi người dùng bấm Convert Code:
    nhận tên mô hình và mã Python
    tìm client phù hợp
    tạo messages gồm yêu cầu, thông tin máy và mã nguồn
    gọi mô hình để sinh C++
    ghi C++ vào main.cpp
    đưa C++ lên ô kết quả

Khi người dùng chạy bước benchmark trong notebook:
    biên dịch main.cpp
    nếu biên dịch thành công thì chạy chương trình nhiều lần
    xem kết quả tính toán và ghi thời gian
```

Bạn không cần thành thạo Gradio để hiểu mục tiêu bài. Nó giúp rút ngắn thao tác đổi mô hình và gửi cùng một bài toán, để tập trung vào việc đánh giá.

### 4.2. Ba mô hình local cho kết quả gì?

**Qwen 2.5 Coder:** tạo được văn bản C++, nhưng bước biên dịch/chạy không thành công. Giảng viên nghi thiếu thành phần import/include; đây là nhận định trong lúc thử, không phải phân tích lỗi đã được chứng minh đầy đủ. Trong lần thử đó, mô hình bị ghi “Fail”.

**DeepSeek Coder v2:** code chạy được. Ban đầu giảng viên nhìn code và nghi có vấn đề giống Qwen, nhưng thử thực tế lại thành công. Điều này cho thấy việc “nhìn có vẻ sai/đúng” không thay được kiểm chứng.

**GPT-OSS 20B:** giảng viên cho biết phải chờ khoảng năm phút để nhận code trên máy của ông. Code sinh ra chạy được và nhanh hơn hai kết quả local đã thử trước đó, dù ông không thấy cách dùng đa luồng như những mô hình đứng đầu buổi trước.

### 4.3. Điểm quan trọng nhất: có hai loại tốc độ

| Loại thời gian | Đang đo cái gì? | Minh họa từ bài |
| --- | --- | --- |
| Thời gian sinh code | Từ lúc gửi yêu cầu đến lúc AI viết xong | GPT-OSS 20B mất khoảng năm phút trên máy giảng viên |
| Thời gian chạy code | Chương trình C++ đã biên dịch thực hiện bài toán mất bao lâu | C++ do GPT-OSS 20B tạo được ghi khoảng 0,080438 giây |

**Mất năm phút để viết một chương trình chạy trong khoảng 0,08 giây là hoàn toàn có thể.** Hai số đo nói về hai giai đoạn khác nhau.

Tương tự, nền tảng suy luận nhanh có thể giúp nhận câu trả lời sớm; điều đó không bảo đảm C++ trong câu trả lời chạy nhanh. Phần “speedup” của bảng tổng kết đo tốc độ chương trình tạo ra so với Python gốc, không đo tốc độ AI trả lời.

## 5. Video 017 — Thử mô hình từ xa và đọc kết quả

### 5.1. Qwen 3 Coder qua OpenRouter

Giảng viên xem mục programming trên OpenRouter để tìm mô hình được dùng nhiều. Cần nhận ra đây là **xếp hạng theo mức sử dụng**, khác với điểm bài thi lập trình. Nó cho biết mức độ được chọn trên nền tảng, không trực tiếp chứng minh chất lượng cao nhất.

Qwen 3 Coder 30B tạo code chạy được. Thời gian ghi nhận hơi tốt hơn DeepSeek Coder v2, nhưng giảng viên xem chúng gần như ngang nhau. Chênh lệch nhỏ trong một phép đo chưa đủ để kết luận bên nào luôn tốt hơn.

### 5.2. GPT-OSS 120B qua Groq

Giảng viên chọn bản 120B với mức suy nghĩ cao, kỳ vọng mô hình lớn hơn sẽ làm tốt. Code tạo ra chạy được nhưng mất khoảng 1,4 giây, chậm hơn đáng kể so với code do bản 20B tạo ra trong lần thử này.

Ông chạy lại chương trình và thấy kết quả vẫn tương tự. Ông nghi một số `pragma` — chỉ thị cho trình biên dịch — có thể liên quan đến kết quả kém, nhưng chưa xác định chắc nguyên nhân. Không nên biến phỏng đoán đó thành kết luận kỹ thuật đã được kiểm chứng.

**Phát hiện thực tế:** phiên bản lớn hơn thua phiên bản nhỏ hơn ở lần thử này. **Giới hạn:** chưa thể kết luận bản 120B nói chung yếu hơn bản 20B.

### 5.3. Bảng tổng kết được kiểm tra trực tiếp trên màn hình

Bảng sau chép lại các hệ số tăng tốc mà giảng viên ghi trong video 017, khoảng 04:25–05:45. Các kết quả của Claude, GPT-5, Grok và Gemini là số liệu buổi trước được ông đưa vào tổng kết.

| Hạng trong thí nghiệm | Mô hình | Speedup so với Python gốc |
| --- | --- | --- |
| 1 | Gemini 2.5 Pro | 1.440× |
| 2 | Grok 4 | 1.060× |
| 3 | GPT-OSS 20B | 238× |
| 4 | GPT-5 | 233× |
| 5 | Claude Sonnet 4.5 | 184× |
| 6 | Qwen 3 Coder 30B | 168× |
| 7 | DeepSeek Coder v2 | 168× |
| 8 | GPT-OSS 120B | 14× |
| 9 | Qwen 2.5 Coder | Fail — không hoàn tất thành công |

**Quy ước:** dấu chấm trong 1.440× và 1.060× là phân cách hàng nghìn. Đây là số liệu làm tròn của giảng viên. Phụ đề có chỗ ghi sai như 104× thay vì 184×, hoặc 2,33× thay vì 233×; bảng trên ưu tiên nội dung nhìn thấy trong video.

Một số thời gian C++ được ghi ở notebook, làm tròn để dễ đọc:

| Mô hình thử ở Day 4 | Thời gian chạy code được ghi |
| --- | --- |
| DeepSeek Coder v2 | Khoảng 0,114 giây |
| GPT-OSS 20B | Khoảng 0,0804 giây |
| Qwen 3 Coder 30B | Khoảng 0,1137 giây |
| GPT-OSS 120B | Khoảng 1,407 giây |

Công thức:

```text
Speedup = thời gian Python gốc / thời gian C++
```

**Ví dụ bổ sung, không phải số đo nguyên bản:** nếu Python mất 20 giây và C++ mất 0,1 giây thì speedup là 200×. So sánh chỉ có ý nghĩa khi chương trình mới vẫn đáp ứng cùng yêu cầu tính toán.

Theo phần tổng kết của giảng viên, Grok và Gemini đạt kết quả cao nhờ những cách tối ưu có đa luồng; Gemini còn biến đổi cách tính. Điều cần học không chỉ là đổi cú pháp Python sang C++, mà là tìm cách thực hiện cùng bài toán hiệu quả hơn.

## 6. Giải thích bổ sung — Làm sao đánh giá đúng hơn?

Giảng viên thừa nhận đây là thí nghiệm chưa thật sự khoa học: chủ yếu sinh một phiên bản code cho mỗi mô hình, rồi chạy phiên bản đó nhiều lần.

### 6.1. Chạy lại code khác với yêu cầu AI viết lại code

- **Chạy một chương trình C++ ba lần:** giúp xem thời gian chạy có dao động hay không.
- **Yêu cầu AI chuyển code nhiều lần độc lập:** giúp xem mô hình có thường xuyên tạo ra lời giải tốt hay chỉ thành công ở một lần.

Nếu chạy lại code chậm mười lần mà vẫn chậm, bạn biết phiên bản code đó chậm tương đối ổn định. Bạn chưa biết lần sinh code khác của cùng mô hình có tốt hơn không.

Với ba thời gian, trung vị là số ở giữa **sau khi sắp xếp theo giá trị**, không mặc định là kết quả của lượt chạy thứ hai.

### 6.2. Kiểm tra tính đúng trước khi xếp hạng tốc độ

Code biên dịch thành công mới vượt qua một bước. Cần kiểm tra kết quả π, số bước tính, sai số được chấp nhận và việc chương trình có bỏ qua công việc cần làm hay không.

Nếu chỉ kiểm tra “in ra gần 3,14”, chương trình in sẵn một hằng số có thể trông rất nhanh mà không giải đúng nhiệm vụ benchmark. Vì vậy cần quy định rõ bài toán cho phép tối ưu đến đâu, những thay đổi nào vẫn được xem là tương đương.

### 6.3. Một quy trình thử gọn nhưng có ích

1. Chốt cùng mã đầu vào, yêu cầu đầu ra và điều kiện tính đúng.
2. Ghi phiên bản mô hình, cấu hình suy luận và prompt; công bố khác biệt giữa các cấu hình.
3. Cho mỗi mô hình sinh nhiều phương án độc lập, lưu cả lần thất bại.
4. Biên dịch và kiểm tra kết quả trước khi đo tốc độ.
5. Đo trên cùng máy, cùng dữ liệu và chính sách biên dịch; hạn chế tải nền gây nhiễu.
6. Báo cáo riêng tỷ lệ thành công, thời gian sinh code, thời gian chạy code và chi phí nếu có.

Nếu bổ sung vòng “gửi lỗi compiler để AI sửa”, cần áp dụng cùng giới hạn số lần sửa cho các mô hình. Khi ấy bạn đang đánh giá cả quy trình sửa lỗi, khác với tiêu chí thành công ngay lần đầu.

Một bảng ghi đơn giản có thể gồm:

| Mô hình | Lần sinh | Đúng kết quả? | Thời gian sinh code | Trung vị chạy C++ | Số lần sửa |
| --- | --- | --- | --- | --- | --- |
| A | 1 | Có/Không | … | … | … |
| A | 2 | Có/Không | … | … | … |
| B | 1 | Có/Không | … | … | … |

## 7. Liên hệ với công việc front-end của bạn

Bạn có thể thay “chuyển Python sang C++” bằng “viết React component”, “chuyển JavaScript sang TypeScript” hoặc “viết test cho form”. Phương pháp chọn mô hình vẫn giữ nguyên, nhưng tiêu chí chấm phải đổi theo công việc.

Ví dụ, với component React: đúng hành vi, xử lý trạng thái lỗi/loading, khả năng truy cập và tuân thủ cấu trúc dự án có thể quan trọng hơn tốc độ AI gõ code. Một bảng điểm lập trình tổng quát không thay được các phép kiểm tra đó.

Gradio trong bài là một giao diện thử nghiệm nhanh. Với ứng dụng web, bạn có thể nhận ra cùng một cấu trúc quen thuộc: giao diện nhận yêu cầu, backend tạo prompt và gọi mô hình, rồi giao diện hiển thị kết quả. Năng lực ứng dụng đến từ cả mô hình lẫn cách bạn tổ chức đầu vào, kiểm chứng và xử lý lỗi.

## 8. Những điều nên nhớ sau phần này

- Bắt đầu bằng công việc cần giải quyết, rồi mới chọn mô hình.
- Dùng leaderboard để tìm ứng viên; tự thử để quyết định.
- Ollama, OpenRouter và Groq là cách truy cập/vận hành, không phải các mô hình thay thế cho Qwen hay GPT-OSS.
- AI viết code nhanh và code chạy nhanh là hai tiêu chí khác nhau.
- Mô hình lớn hơn có thể thua trong một lần thử; mô hình local có thể tạo ra kết quả rất cạnh tranh.
- Code phải đúng trước khi so tốc độ; cần nhiều lần sinh code để đánh giá độ ổn định.

Cuối video 017, giảng viên giới thiệu buổi tiếp theo sẽ có bài thử khó hơn, bàn sâu hơn về evals và các ứng dụng như sinh comment, sinh test. Đây là nội dung được hẹn cho buổi sau, chưa được triển khai đầy đủ trong ba video này.

## Nguồn và mốc xem lại

| Nguồn đính kèm | Mốc chính |
| --- | --- |
| 015 — Open Source Models for Code Generation Qwen, DeepSeek & Ollama | 00:26 mục tiêu; 01:33 chọn ứng viên; 04:02 local/API; 05:38 thiết lập client; 08:27 thông tin máy và biên dịch |
| 016 — Building a Gradio UI to Test Python-to-C++ Code Conversion Models | 00:00 prompt và bài π; 00:45 giao diện; 02:13 Qwen; 03:18 DeepSeek; 04:32 GPT-OSS 20B |
| 017 — Qwen 3 Coder vs GPT OSS OpenRouter Model Performance Showdown | 00:00 Qwen/OpenRouter; 01:57 GPT-OSS 120B/Groq; 03:58 giới hạn phép thử; 04:20 tổng kết; 06:53 giới thiệu buổi tiếp theo |

Phạm vi kiểm chứng: đọc toàn bộ phụ đề tiếng Anh của cả ba bài, đối chiếu trực tiếp khung hình bảng tổng kết ở video 017 để sửa số liệu nhận dạng sai. Tài liệu diễn giải bài học, không phải bản chép nguyên văn hoặc báo cáo chạy lại thí nghiệm.
