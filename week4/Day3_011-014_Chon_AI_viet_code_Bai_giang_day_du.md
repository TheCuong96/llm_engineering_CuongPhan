# Day 3 — Chọn AI viết code bằng kết quả thực tế
## Bản giảng giải đầy đủ — Bài 011–014

> Biên soạn từ toàn bộ phụ đề tiếng Anh của bốn bài đính kèm. Đây là bài giảng được tổ chức lại, không phải bản dịch từng câu. Các ví dụ và hướng dẫn kiểm chứng bổ sung được đánh dấu riêng. Số liệu là kết quả giảng viên thuật lại trong video, không phải phép đo do tôi chạy lại hay bảng xếp hạng hiện tại.

## 1. Cả phần này thực sự muốn dạy điều gì?

**Muốn chọn AI phù hợp, hãy xác định vấn đề cần giải quyết, đặt tiêu chí thành công, rồi thử các mô hình trên chính công việc đó.**

Giảng viên dùng một bài toán dễ đo: chương trình Python tính toán mất khoảng 19 giây; nhờ các LLM viết lại thành C++ sao cho chạy nhanh hơn và giữ đúng kết quả. Sau đó biên dịch, chạy và so sánh.

Bạn dễ bị phân tâm bởi tên mô hình, cấu hình API, C++ và các con số tăng tốc. Nhưng tất cả đều phục vụ câu hỏi: **mô hình nào tạo ra kết quả tốt nhất cho yêu cầu cụ thể của mình?**

| Bài | Nội dung thực hiện | Điều cần hiểu |
| --- | --- | --- |
| 011 | Xác định vấn đề và tiêu chí; giới thiệu chuyển Python sang C++ | Bắt đầu từ mục tiêu, rồi mới chọn công nghệ |
| 012 | Dùng leaderboard chọn ứng viên; chuẩn bị API và môi trường C++ | Điểm benchmark giúp lập danh sách thử nghiệm |
| 013 | Nhờ GPT-5 chuyển code; biên dịch và đo | Biến nhận định “AI viết code tốt” thành kết quả đo được |
| 014 | Thử Claude, Grok và Gemini; so sánh cách tối ưu | Mô hình đứng đầu bảng chung chưa chắc thắng bài toán riêng |

Đây là thực hành **ứng dụng mô hình có sẵn qua API**, không có bước huấn luyện mô hình từ đầu. Cursor là môi trường làm việc; bài này cũng chưa triển khai agent tự xử lý toàn bộ kho mã.

## 2. Bài 011 — Từ nhu cầu kinh doanh đến tiêu chí đo

### Đừng bắt đầu bằng “tôi muốn một AI agent”

Trong video, giảng viên kể tình huống một người muốn nói vào điện thoại để hỏi doanh số. Ông yêu cầu quay lại vấn đề: người đó cần thông tin gì, gặp khó khăn gì và thế nào là giải quyết thành công? Có thể một tài liệu hiển thị doanh số đã đáp ứng đủ nhu cầu.

Ý nghĩa: tên giải pháp chưa nói lên giá trị của giải pháp. Khi biết rõ mục tiêu, bạn mới biết có cần AI, cần loại nào và có đáng đầu tư không.

**Ví dụ bổ sung gần với lập trình web:** “Thêm AI cho trang quản trị” còn mơ hồ. “Giảm thời gian nhân viên tìm nguyên nhân đơn hàng lỗi từ 10 phút xuống 2 phút, đồng thời chỉ đúng dữ liệu liên quan” đã có công việc và tiêu chí kiểm tra.

### AI engineer cần cả tư duy phần mềm và tư duy thực nghiệm

| Tư duy kỹ thuật phần mềm | Tư duy thực nghiệm, dữ liệu |
| --- | --- |
| Chọn framework, kiến trúc, API, cơ sở dữ liệu | Xác định kết quả đúng và cách đo chất lượng |
| Tích hợp, triển khai, vận hành | Kiểm tra dữ liệu hiện có và phần còn thiếu |
| Làm cho hệ thống hoạt động | Chứng minh hệ thống giải quyết được vấn đề |

Giảng viên cho rằng người có nền tảng lập trình thường dành nhiều chú ý cho framework và kiến trúc vì đó là vùng quen thuộc. Ông muốn người học đặt câu hỏi về dữ liệu, mục tiêu và đánh giá sớm hơn. Những tỷ lệ “80%” trong lời giảng diễn tả trải nghiệm và quan điểm của ông, không phải quy luật định lượng.

### Quy trình năm bước của khóa học

1. **Understand — Hiểu yêu cầu:** vấn đề gì, ràng buộc gì, đo thành công thế nào?
2. **Prepare — Chuẩn bị:** dùng benchmark và thông tin mô hình để chọn ứng viên.
3. **Select — Lựa chọn:** làm prototype và đo trên tiêu chí thực tế.
4. **Customize — Tùy chỉnh:** khi cần, bổ sung RAG, fine-tuning hoặc cách tổ chức agent.
5. **Productionize — Đưa vào vận hành:** triển khai giải pháp đã được kiểm chứng.

RAG là bổ sung thông tin truy xuất được vào ngữ cảnh; fine-tuning là điều chỉnh mô hình bằng dữ liệu huấn luyện; agent tổ chức việc dùng công cụ và thực hiện các bước. Video chỉ nhắc chúng như hướng phát triển ở phần sau, chưa hướng dẫn thực hiện trong bốn bài này.

**Áp dụng vào bài học:** yêu cầu là tăng tốc đoạn tính toán; tiêu chí gồm kết quả đúng và thời gian chạy; prototype là mã C++ do từng mô hình tạo ra.

## 3. Bài 012 — Chọn ứng viên và hiểu các thành phần

### Vì sao xem leaderboard trước?

Có nhiều mô hình, nên cần thu hẹp danh sách. Giảng viên xem các benchmark lập trình, gồm LiveCodeBench và benchmark lập trình khoa học, trên Artificial Analysis. Ông không ưu tiên bảng đánh giá agent vì bài thử này không chạy một quy trình agent.

Các ứng viên trong video là **GPT-5, Claude Sonnet 4.5, Grok 4 và Gemini 2.5 Pro**. Đây là lựa chọn tại thời điểm ghi hình; không nên đọc thành khuyến nghị về mô hình mạnh nhất hiện nay.

**Leaderboard tạo giả thuyết để thử, chưa tạo kết luận để triển khai.** Một bài kiểm tra viết hàm hoặc giải bài toán lập trình không bao trùm mọi loại công việc như tối ưu CPU, sửa giao diện hay bảo trì dự án lớn.

### Cursor, Python, API và C++ đang làm gì?

| Thành phần | Vai trò trong bài |
| --- | --- |
| Cursor | Nơi mở dự án, notebook và thực hiện thao tác lập trình |
| Python/notebook | Điều phối thử nghiệm: chuẩn bị prompt, gọi model, lưu và chạy kết quả |
| API client | Gửi yêu cầu đến dịch vụ mô hình |
| LLM | Nhận mã Python dưới dạng văn bản và tạo mã C++ |
| Compiler — Trình biên dịch | Chuyển mã C++ thành chương trình thực thi |
| CPU của máy chạy thử | Thực hiện chương trình tính toán để đo tốc độ |

Giảng viên dùng thư viện client OpenAI và thay `base_url` để gọi các dịch vụ có giao diện tương thích. **Dùng chung thư viện client không có nghĩa các yêu cầu đều chạy bằng mô hình OpenAI.** Đích kết nối, API key và tên model quyết định dịch vụ được gọi.

Bài giảng cũng nhắc cập nhật mã lab, đồng bộ dependency bằng `uv sync`, nạp API key từ biến môi trường, và có thể chỉ thử những nhà cung cấp mình đã có tài khoản. Nhận xét về chi phí trong video chỉ thuộc bối cảnh buổi học; tài liệu này không dùng nó làm báo giá hiện tại.

### Tại sao chuyển Python sang C++ có thể nhanh hơn?

Vòng lặp tính toán bằng Python thuần có chi phí xử lý động qua trình thông dịch. C++ được biên dịch thành mã máy và có thể tận dụng các tối ưu của compiler. Với công việc lặp số học nhiều lần, sự khác biệt có thể lớn.

**Giải thích bổ sung:** điều đó không có nghĩa mọi chương trình Python đều chậm hay mọi chương trình C++ đều nhanh. Python có thể gọi thư viện tính toán đã được viết bằng mã native. Tốc độ còn phụ thuộc thuật toán, cách triển khai và phần cứng.

### Vì sao phải cung cấp thông tin máy?

Giảng viên lấy thông tin hệ điều hành và công cụ đã cài, rồi hỏi GPT-5 cách biên dịch và chạy C++ trên máy đó. Sau đó ông đưa thông tin hệ thống và lệnh biên dịch vào yêu cầu chuyển code.

AI cần biết môi trường đích để đưa ra mã phù hợp. Lệnh trên Mac không thể mặc định áp dụng nguyên xi cho Windows. Trong video, chạy native là lựa chọn để thực hành; người học cũng có thể dán mã vào trang chạy C++ trực tuyến.

## 4. Bài 013 — Hiểu quy trình tạo mã và phép đo

### Bài toán tính gì?

Chương trình cộng chuỗi:

```text
pi_xap_xi = 4 × (1 − 1/3 + 1/5 − 1/7 + 1/9 − ...)
```

Đây là cách xấp xỉ π, hội tụ chậm. Mục đích ở đây là tạo nhiều phép tính để đo hiệu năng, không phải chọn cách tính π tốt nhất.

**Chỉnh lại chỗ dễ nhầm:** bài 011 nói 100.000 vòng; sang bài 013 giảng viên đính chính số trước đó và thực hiện với **200 triệu vòng lặp**. Mốc Python khoảng **19 giây** thuộc lần thử này trên máy của ông.

Việc chữ số cuối chưa trùng π không tự động là lỗi lập trình: một tổng hữu hạn chỉ cho giá trị xấp xỉ, và số thực máy tính cũng có sai số.

### Vì sao mã Python lại được đặt trong chuỗi?

Có hai vai trò khác nhau: mã nguồn là **dữ liệu văn bản** gửi cho AI, đồng thời là **chương trình** dùng đo mốc ban đầu. Trong lab, giảng viên dùng `exec` để thực thi chuỗi mã Python đã chuẩn bị.

Ví dụ minh họa bổ sung:

```python
source = "print(2 + 2)"
# Gửi source cho AI: AI nhận văn bản mã nguồn.
exec(source)  # Chạy source bằng Python: in ra 4.
```

`exec` thực thi mã thật; ví dụ này dùng chuỗi do mình kiểm soát, không nên đem áp dụng trực tiếp cho văn bản người dùng gửi lên ứng dụng.

### Những hàm trong lab phục vụ việc gì?

| Khối/hàm được nhắc trong phụ đề | Mục đích |
| --- | --- |
| System prompt | Yêu cầu chuyển Python thành C++ hiệu năng cao, giữ kết quả, chỉ trả mã |
| Hàm tạo user prompt | Ghép mã Python, thông tin hệ thống và lệnh biên dịch |
| `messages_for` | Đóng gói các thông điệp để gửi API |
| `port` | Gọi model, lấy phần mã trả về, loại bỏ dấu bao Markdown nếu có |
| Hàm ghi output | Lưu mã thành tệp C++ |
| Hàm compile/run | Biên dịch và chạy để lấy kết quả cùng thời gian |

Đây là bản giải thích vai trò dựa trên phụ đề, không phải bản chép đầy đủ mã notebook. Trong thử nghiệm, GPT-5 được cấu hình mức suy luận cao; đó là mức nỗ lực khi tạo câu trả lời, không phải thiết lập tốc độ của chương trình C++.

### “Nhanh hơn 230 lần” nghĩa là gì?

```text
Hệ số tăng tốc = thời gian Python / thời gian C++
```

Ví dụ minh họa dùng số làm tròn: `19 / 0,083 ≈ 229 lần`. Bài 013 nói khoảng 230 lần; bảng tổng kết bài 014 ghi 233 lần. Không nên xem các số đã làm tròn là phép đo có độ chính xác tuyệt đối.

Phải phân biệt ba loại thời gian:

| Thời gian | Đang đo điều gì? |
| --- | --- |
| AI sinh mã | Từ lúc gửi yêu cầu đến khi nhận mã C++; GPT-5 mất gần 2 phút trong lời giảng |
| Biên dịch | Chuyển mã C++ thành chương trình thực thi |
| Chương trình chạy | Thời gian thực hiện phép tính; đây là trọng tâm hệ số tăng tốc |

**AI suy nghĩ lâu vẫn có thể tạo ra chương trình chạy rất nhanh.** Sau khi mã được tạo và biên dịch, chương trình tính toán đó không cần gọi LLM mỗi lần chạy.

GPT-5 đã dùng **loop unrolling — mở rộng thân vòng lặp**: gộp nhiều bước tính vào một lượt lặp. Cách này có thể giảm chi phí điều khiển vòng lặp và tạo cơ hội tối ưu; không đảm bảo luôn hiệu quả hơn vì compiler cũng có thể tự thực hiện các tối ưu tương tự. Giảng viên cho biết những lần sinh mã khác chỉ tăng tốc khoảng 45 lần.

## 5. Bài 014 — Kết quả và nguyên nhân khác biệt

### Kết quả giảng viên tổng kết

| Model trong video | Hệ số tăng tốc so với Python | Đặc điểm được giảng viên mô tả |
| --- | --- | --- |
| Claude Sonnet 4.5 | 148× | Chuyển mã hiệu quả; cấu hình thử chưa dùng chế độ suy nghĩ đáng kể |
| GPT-5 | 233× | Có phiên bản dùng loop unrolling |
| Grok 4 | 1.060× | Sử dụng nhiều luồng; giảng viên sau đó nhận thấy số luồng được đặt cố định |
| Gemini 2.5 Pro | 1.440× | Kết hợp C++, nhiều luồng và đơn giản hóa phép tính |

Tên bài 014 có chữ **Groq**, nhưng phụ đề xác định model đang thử là **Grok 4 của xAI**. Trong tài liệu này dùng Grok theo nội dung bài giảng.

Phụ đề cũng có một đoạn nói Claude tốt hơn GPT-5 sau khi giảng viên chạy lại, trong khi phần đầu và bảng tổng kết nói GPT-5 nhanh hơn. Vì vậy, bảng trên lấy **số liệu tổng kết cuối bài**, không ghép mọi lời bình thành một lần thử duy nhất.

### Ba cách cải thiện cần phân biệt

1. **Chuyển cách thực thi:** từ Python thuần sang C++ được biên dịch.
2. **Giảm công việc tính toán:** biến đổi biểu thức để thực hiện ít phép toán hơn.
3. **Chia công việc chạy song song:** nhiều luồng xử lý các phần rồi gộp kết quả.

Grok khai thác nhiều luồng. Gemini, theo mô tả của giảng viên, kết hợp cả ba cách và chọn số luồng theo thông tin phần cứng. Giảng viên cho phép các thay đổi này vì mục tiêu là giữ kết quả và tăng tốc, chứ không chỉ dịch từng dòng.

**Ví dụ đại số bổ sung, không phải mã trích từ Gemini:**

```text
1/a − 1/(a + 2) = 2 / (a × (a + 2))
```

Hai vế tương đương về toán học nhưng cách tính khác nhau. Với số thực hữu hạn trên máy tính, vẫn cần kiểm tra sai số; không thể chỉ nhìn biểu thức rồi khẳng định kết quả giống từng bit.

Đa luồng giống chia một tập việc thành nhiều phần để nhiều người làm đồng thời. Nó có lợi khi công việc đủ lớn, có thể chia độc lập và máy có tài nguyên xử lý; việc tạo luồng và gộp kết quả cũng có chi phí.

### Vì sao chuyển sang trang chạy online lại đổi kết quả?

Trong video, mã Gemini chạy rất nhanh trên máy giảng viên, nhưng khi thử trên trang online thì không hơn mã GPT-5; GPT-5 thậm chí nhỉnh hơn. Môi trường đích đã thay đổi, còn mã lại được yêu cầu tối ưu cho máy ban đầu.

**Giải thích bổ sung:** giới hạn CPU, số lõi được cấp, compiler và chi phí quản lý luồng có thể làm thay đổi hiệu quả. Phụ đề không cung cấp đủ thông tin để xác định nguyên nhân duy nhất. Không nên suy rộng nhận xét trong video thành “cloud không chạy được đa luồng”.

## 6. Những kết luận được phép rút ra — và giới hạn

Kết quả cho thấy mô hình có thể tạo ra các chiến lược tối ưu khác nhau, và model thắng benchmark chung chưa chắc thắng một bài thử riêng. Đây là minh họa rõ cho giá trị của prototype có số đo.

Tuy nhiên, **không thể kết luận Gemini luôn viết code giỏi nhất**, hay C++ luôn nhanh hơn Python 1.440 lần, vì:

- Chỉ có một bài tính toán nhỏ, với một cấu hình phần cứng cụ thể.
- Model có thể tạo mã khác nhau giữa các lần; giảng viên cũng nói kết quả thay đổi.
- Các model chưa có ngân sách suy luận tương đương, đặc biệt với Claude.
- Mã tối ưu đã thay đổi cả cách thực thi, phép tính và mức song song; hệ số đo gộp tác động của chúng.
- Phụ đề không cho thấy một bộ kiểm thử đầy đủ về tính đúng, nhiều dữ liệu đầu vào và sai số số thực.

Việc chạy cùng một bản mã ba lần giúp quan sát độ dao động thời gian; **nó không thay thế việc cho AI sinh nhiều bản mã độc lập** để đánh giá độ ổn định của model.

## 7. Cách áp dụng bài học cho công việc của bạn

> Phần bổ sung: quy trình dưới đây mở rộng từ ý tưởng trong video, không phải các bước giảng viên đã kiểm chứng đầy đủ.

Với công việc frontend, bạn có thể thay bài C++ bằng “tối ưu một bảng React nhiều dòng” hoặc “chuyển component JavaScript sang TypeScript”. Giữ nguyên tư duy: yêu cầu rõ, bài thử giống nhau, kết quả đo được.

### Một quy trình đánh giá gọn

1. **Chốt mục tiêu và ràng buộc:** hành vi nào phải giữ nguyên; giới hạn hiệu năng, bộ nhớ hoặc độ tương thích nào phải đáp ứng?
2. **Đo baseline:** chạy bản gốc và lưu kết quả, môi trường, đầu vào.
3. **Cho các model cùng đề bài:** cùng mã nguồn, yêu cầu và dữ liệu; ghi lại mức suy luận và cấu hình khác biệt.
4. **Kiểm tra đúng trước khi đo nhanh:** dùng nhiều đầu vào, trường hợp biên và sai số cho phép nếu tính số thực. Không chấp nhận mã chỉ in sẵn đáp án.
5. **Đo lặp trong cùng môi trường:** thống nhất có tính thời gian khởi động, tạo luồng và các bước khác hay không; lấy số đại diện như trung vị.
6. **Chọn theo tổng giá trị:** chất lượng, tốc độ chương trình, thời gian AI trả lời, phí API, độ ổn định và công sức bảo trì.

Nếu cần đánh giá khả năng dịch ngôn ngữ riêng biệt, hãy giữ nguyên thuật toán và số luồng. Nếu cần tìm giải pháp nhanh nhất như video, cho phép tối ưu rộng hơn nhưng ghi rõ luật đó.

### Mẫu yêu cầu để tự thử

```text
Mục tiêu: viết lại đoạn mã sau để giảm thời gian xử lý.

Đầu vào và hành vi cần giữ: [mô tả].
Môi trường chạy: [hệ điều hành, CPU, compiler/runtime].
Giới hạn: [bộ nhớ, thư viện, số luồng].
Tiêu chí đúng: [bộ test, sai số cho phép nếu có].
Được phép thay đổi thuật toán: [có/không, điều kiện].
Không được hardcode đáp án hoặc bỏ qua việc xử lý đầu vào.

Hãy trả mã nguồn; giải thích ngắn các thay đổi và cách kiểm tra.
Mã nguồn: [dán mã].
```

Mẫu này bổ sung yêu cầu giải thích để dễ học và kiểm tra. Trong lab gốc, giảng viên yêu cầu chỉ trả C++ để tiện ghi thẳng ra tệp.

## 8. Tự kiểm tra xem mình đã hiểu chưa

- **Mục tiêu chính là học C++?** Không. Mục tiêu là chọn và kiểm chứng LLM trên công việc có tiêu chí đo; C++ là phương tiện của bài thử.
- **230× có phải GPT-5 trả lời nhanh hơn?** Không. Đó là chương trình C++ chạy nhanh hơn bản Python trong phép thử.
- **Tại sao cần leaderboard nếu cuối cùng vẫn tự thử?** Để chọn ứng viên hợp lý, giảm số model phải thử.
- **Tại sao đúng kết quả phải kiểm tra trước?** Vì chương trình nhanh nhưng làm sai không giải quyết được yêu cầu.
- **Điều nên nhớ lâu nhất?** Bắt đầu từ vấn đề, chọn ứng viên, rồi quyết định bằng bằng chứng trên môi trường thực tế.

## Nguồn và phạm vi

Nguồn: bốn phụ đề tiếng Anh bài 011 “Selecting LLMs for Code Generation Python to C++ with Cursor”; 012 “Selecting Frontier Models GPT-5, Claude, Grok & Gemini for C++ Code Gen”; 013 “Porting Python to C++ with GPT-5 230x Performance Speedup”; 014 “AI Coding Showdown GPT-5 vs Claude vs Gemini vs Groq Performance”.

Tài liệu dựa trên phụ đề đọc được, không tuyên bố đã kiểm tra từng khung hình, chép chính xác mã hiển thị trong video hoặc tái lập benchmark. Các số liệu và thứ hạng chỉ dùng để giải thích thí nghiệm được giảng dạy.
