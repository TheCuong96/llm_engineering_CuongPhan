<!-- markdownlint-disable MD024 MD025 MD060 -->

# Week 4 — Ghi chú tổng hợp: Lựa chọn và đánh giá LLM bằng kết quả thực tế

> **Mục tiêu tuần:** ngừng chọn model chỉ vì "nghe nói mạnh nhất", mà học cách **tự đánh giá** một model bằng benchmark, bảng xếp hạng (leaderboard) và — quan trọng nhất — bằng chính công việc thật của mình. Tuần này dùng một bài toán cụ thể xuyên suốt để thực hành: nhờ nhiều model AI **chuyển code Python sang C++ rồi sang Rust**, đo xem chương trình sinh ra chạy đúng và nhanh đến đâu.
>
> Tài liệu này tổng hợp nội dung Day 1–5 của Week 4 từ các bản ghi chú đã có: [Day1_001-005_Chon_va_danh_gia_LLM_Tom_tat.md](Day1_001-005_Chon_va_danh_gia_LLM_Tom_tat.md) / [-Bai_giang_day_du.md](Day1_001-005_Chon_va_danh_gia_LLM_Bai_giang_day_du.md), [Day2_006-010_Bang_xep_hang_va_chon_model_Tom_tat.md](Day2_006-010_Bang_xep_hang_va_chon_model_Tom_tat.md) / [-Bai_giang_day_du.md](Day2_006-010_Bang_xep_hang_va_chon_model_Bai_giang_day_du.md), [Day3_011-014_Chon_AI_viet_code_Tom_tat.md](Day3_011-014_Chon_AI_viet_code_Tom_tat.md) / [-Bai_giang_day_du.md](Day3_011-014_Chon_AI_viet_code_Bai_giang_day_du.md), [Day4_015-017_Python_sang_Cpp_Tom_tat.md](Day4_015-017_Python_sang_Cpp_Tom_tat.md) / [-Bai_giang_day_du.md](Day4_015-017_Python_sang_Cpp_Bai_giang_day_du.md), [Day5_018-021_Danh_gia_AI_va_Python_sang_Rust_Tom_tat.md](Day5_018-021_Danh_gia_AI_va_Python_sang_Rust_Tom_tat.md) / [-Bai_giang_day_du.md](Day5_018-021_Danh_gia_AI_va_Python_sang_Rust_Bai_giang_day_du.md).
>
> **Lưu ý:** Day 1 và Day 2 là phần lý thuyết thuần (không có notebook `day1.ipynb`/`day2.ipynb` trong thư mục — chỉ có `day3.ipynb`, `day4.ipynb`, `day5.ipynb` là notebook thực hành).
>
> **Ghi chú minh bạch:** mọi con số tăng tốc, điểm benchmark, tên phiên bản model trong tuần này đều là **kết quả của một lần demo cụ thể tại thời điểm ghi hình khóa học** — không phải bảng xếp hạng cố định hay cam kết hiệu năng hiện tại. Khi đọc, hãy tập trung vào **cách tư duy đánh giá**, không học thuộc con số.

## Mục lục

1. [Bức tranh toàn cảnh](#1-bức-tranh-toàn-cảnh)
2. [Ngày 1 — Chọn và đánh giá LLM: benchmark, Chinchilla, giới hạn của điểm số](#2-ngày-1--chọn-và-đánh-giá-llm-benchmark-chinchilla-giới-hạn-của-điểm-số)
3. [Ngày 2 — Đọc bảng xếp hạng và xác định giá trị kinh doanh của AI](#3-ngày-2--đọc-bảng-xếp-hạng-và-xác-định-giá-trị-kinh-doanh-của-ai)
4. [Ngày 3 — Thử nghiệm thật: chuyển Python sang C++ bằng GPT-5/Claude/Grok/Gemini](#4-ngày-3--thử-nghiệm-thật-chuyển-python-sang-c-bằng-gpt-5claudegrokgemini)
5. [Ngày 4 — Mở rộng sang model mã nguồn mở qua giao diện Gradio](#5-ngày-4--mở-rộng-sang-model-mã-nguồn-mở-qua-giao-diện-gradio)
6. [Ngày 5 — Đánh giá sâu hơn: chỉ số kỹ thuật, kết quả kinh doanh và Python sang Rust](#6-ngày-5--đánh-giá-sâu-hơn-chỉ-số-kỹ-thuật-kết-quả-kinh-doanh-và-python-sang-rust)
7. [Bảng liên kết tài liệu nguồn](#7-bảng-liên-kết-tài-liệu-nguồn)
8. [Các điểm dễ nhầm trong cả tuần](#8-các-điểm-dễ-nhầm-trong-cả-tuần)
9. [Mục tiêu cuối cùng](#9-mục-tiêu-cuối-cùng)

---

## 1. Bức tranh toàn cảnh

### Tóm tắt quy trình của tuần

1. **Ngày 1:** học cách nghĩ về việc chọn model — xem xét tham số, dữ liệu huấn luyện (định luật Chinchilla), benchmark, và vì sao điểm benchmark có thể "nói dối" (contamination, overfitting benchmark).
2. **Ngày 2:** đi một vòng các trang bảng xếp hạng thật (Artificial Analysis, Vellum, SEAL, Hugging Face, LiveBench, LM Arena), học cách đọc đúng chi phí/tốc độ, và học khung phân loại giá trị AI mang lại cho sản phẩm.
3. **Ngày 3:** thực hành đầu tiên — dùng GPT-5, Claude, Grok, Gemini chuyển một đoạn Python tính toán sang C++, biên dịch và đo tốc độ thật.
4. **Ngày 4:** mở rộng thử nghiệm sang các model mã nguồn mở (Qwen, DeepSeek, GPT-OSS) chạy qua Ollama/OpenRouter/Groq, đóng gói thành một công cụ có giao diện Gradio.
5. **Ngày 5:** nâng cấp bài toán (Python sang Rust, thuật toán tối ưu hơn) và học phân biệt **chỉ số kỹ thuật** với **chỉ số kết quả kinh doanh** khi đánh giá một giải pháp AI.

### Ý nghĩa chính của tuần

Câu thần chú xuyên suốt cả tuần:

> **"Model đứng đầu bảng xếp hạng chưa chắc phù hợp nhất với ứng dụng của bạn. Bảng xếp hạng cho biết nên thử ai; bài toán của bạn quyết định nên dùng ai."**

```text
Xác định rõ nhiệm vụ + tiêu chí "thế nào là đạt"
    -> Dùng benchmark/leaderboard để lọc ra 2-4 model đáng thử (không phải để chọn luôn)
    -> Cho các model làm cùng một việc thật, trên cùng một bộ dữ liệu thử
    -> Đo: có đúng không, nhanh đến đâu, tốn bao nhiêu
    -> Chọn model đáp ứng yêu cầu thật, không phải model có điểm cao nhất trên giấy
```

---

## 2. Ngày 1 — Chọn và đánh giá LLM: benchmark, Chinchilla, giới hạn của điểm số

**Nguồn:** bài giảng đầy đủ [Day1_001-005_Chon_va_danh_gia_LLM_Bai_giang_day_du.md](Day1_001-005_Chon_va_danh_gia_LLM_Bai_giang_day_du.md) / tóm tắt [Day1_001-005_Chon_va_danh_gia_LLM_Tom_tat.md](Day1_001-005_Chon_va_danh_gia_LLM_Tom_tat.md) (bài 001–005, không có notebook).

### Tóm tắt quy trình

Ngày 1 đặt nền tảng lý thuyết: hiểu các thông số mô tả một model, hiểu vì sao "model lớn hơn" không đồng nghĩa "model tốt hơn" (định luật Chinchilla), điểm qua các benchmark phổ biến, và xem một demo (chơi cờ Connect Four) để thấy model có thể giải thích rất hợp lý nhưng vẫn đi nước cờ sai.

### Các thông số hay bị nhầm lẫn

| Thuật ngữ | Nhớ ngắn gọn |
|---|---|
| Parameters (tham số) | Model có bao nhiêu tham số đã học được |
| Training tokens | Lượng token đã dùng để huấn luyện |
| Context window | Giới hạn ngữ cảnh xử lý được trong một lần gọi |
| Knowledge cutoff | Mốc thời gian dữ liệu huấn luyện — **không đảm bảo** model biết hết mọi thứ trước mốc đó |
| TTFT (Time To First Token) | Phải chờ bao lâu mới thấy token đầu tiên |
| Output throughput | Sau khi bắt đầu trả lời, model sinh chữ nhanh hay chậm |

### Định luật Chinchilla — một ý cần nhớ

> Trong điều kiện tối ưu tính toán huấn luyện, khi tăng kích thước model, lượng token huấn luyện tối ưu cũng phải tăng tương ứng. **Gấp đôi số tham số không có nghĩa model "thông minh" gấp đôi.**

Ngoài việc huấn luyện lại, chất lượng câu trả lời còn có thể cải thiện lúc *sử dụng* bằng prompt tốt hơn, thêm tính toán suy luận (reasoning), RAG, hoặc cho model dùng tool — không phải lúc nào cũng cần một model "to hơn".

### Sáu benchmark hay gặp

| Benchmark | Kiểm tra chủ yếu |
|---|---|
| GPQA | Câu hỏi khoa học chuyên sâu |
| MMLU-Pro | Kiến thức và suy luận đa lĩnh vực |
| AIME | Toán thi đấu |
| LiveCodeBench | Bài lập trình, có cập nhật đề mới theo thời gian |
| MuSR | Suy luận nhiều bước từ tình huống/câu chuyện |
| HLE (Humanity's Last Exam) | Câu hỏi học thuật cực khó |

### Vì sao không nên tin tuyệt đối vào điểm số?

- **Contamination:** đề hoặc đáp án vô tình đã lọt vào dữ liệu huấn luyện.
- **Overfitting benchmark:** chọn/chỉnh model quá nhiều lần dựa trên đúng một bộ đề, khiến điểm cao nhưng chưa chắc phản ánh năng lực tổng quát.
- **Khác điều kiện đo:** một model được cấp nhiều token, công cụ hoặc số lượt thử hơn model kia khi so sánh.
- **Phạm vi hẹp:** giỏi toán không đảm bảo giảng dễ hiểu, hay viết giao diện tốt.
- **Saturation (bão hòa):** khi hầu hết model đều đạt điểm gần tối đa, benchmark khó phân biệt model nào thực sự tốt hơn.

### Demo Connect Four nói lên điều gì?

Model phải đọc đúng bàn cờ, tìm nước thắng và chặn đối thủ. Yêu cầu model *đánh giá bàn cờ trước khi chọn cột* giúp chơi tốt hơn so với chỉ hỏi thẳng "đi cột nào" — nhưng **giải thích nghe hợp lý vẫn có thể đi sai nước cờ**. Nếu tự xây ứng dụng tương tự, luôn để *code* (không phải model) kiểm tra tính hợp lệ của nước đi và ai thắng/thua.

### Chốt ý nghĩa thực tế

Ngày 1 dạy một phản xạ quan trọng: trước khi tin một con số benchmark, hãy hỏi "cùng bộ đề, cùng phiên bản, cùng prompt, cùng số lần thử chưa?" — nếu không, hai điểm số không thể so sánh công bằng với nhau.

---

## 3. Ngày 2 — Đọc bảng xếp hạng và xác định giá trị kinh doanh của AI

**Nguồn:** bài giảng đầy đủ [Day2_006-010_Bang_xep_hang_va_chon_model_Bai_giang_day_du.md](Day2_006-010_Bang_xep_hang_va_chon_model_Bai_giang_day_du.md) / tóm tắt [Day2_006-010_Bang_xep_hang_va_chon_model_Tom_tat.md](Day2_006-010_Bang_xep_hang_va_chon_model_Tom_tat.md) (bài 006–010, không có notebook).

### Tóm tắt quy trình

Ngày 2 đi một vòng các trang leaderboard thật để biết chỗ nào cho biết điều gì, sau đó tổng kết bằng một khung phân loại: **AI có thể tạo giá trị cho sản phẩm theo cách nào?**

### Các nguồn leaderboard và vai trò

| Nguồn | Dùng để hiểu điều gì? |
|---|---|
| Artificial Analysis | Đặt cạnh nhau năng lực, chi phí và tốc độ của nhiều model |
| Vellum | So sánh context window, đơn giá input/output, tốc độ |
| SEAL | Năng lực chuyên biệt (dùng tool, lập trình, giảng dạy...), có HLE |
| Hugging Face | Rất nhiều leaderboard từ nhiều nhóm khác nhau — cần xem rõ nguồn và ngày cập nhật |
| LiveBench | Làm mới câu hỏi liên tục để hạn chế nhiễm dữ liệu (contamination) |
| LM Arena | Người dùng chấm hai câu trả lời ẩn danh, chọn câu thích hơn (kiểu Elo) |

### Ba điều dễ đọc nhầm nhất

1. **Giá mỗi token ≠ chi phí hoàn thành công việc** — model giá thấp nhưng dùng nhiều token suy luận hoặc phải thử lại nhiều lần vẫn có thể tốn hơn tổng thể. Luôn so **tổng chi phí để hoàn thành cùng một việc**, không chỉ đơn giá.
2. **Sinh chữ nhanh ≠ hoàn thành sớm** — cần phân biệt *output speed* (tốc độ sinh token), *độ trễ tới câu trả lời đầu tiên*, và *tổng thời gian* tới khi có đủ kết quả.
3. **Điểm cao ≠ phù hợp nhất** — vẫn phải xét thêm: có hỗ trợ tốt tiếng Việt không, độ trễ có chấp nhận được không, giới hạn ngữ cảnh có đủ dùng không, cách triển khai có khả thi không.

### Giá trị AI mang lại cho sản phẩm — hai cách phân loại

**Theo loại giá trị:**

| Loại | Ý nghĩa |
|---|---|
| Automation (tự động hóa) | Làm hộ một tác vụ lặp lại |
| Augmentation (hỗ trợ) | Giúp con người làm tốt hơn (ví dụ: gợi ý sửa code để người review) |
| Differentiation (tạo khác biệt) | Tạo ra trải nghiệm/năng lực hoàn toàn mới cho sản phẩm |

**Theo cách xây dựng:**

| Loại | Ý nghĩa |
|---|---|
| LLM wrapper | Tích hợp model có sẵn vào ứng dụng/quy trình |
| AI chuyên biệt | Kết hợp dữ liệu, kiến thức và công cụ riêng của một lĩnh vực |
| Agentic AI | Model tự quyết định bước tiếp theo và dùng tool trong phạm vi được cho phép |

**Không cần tự huấn luyện một model nền để tạo ra sản phẩm AI hữu ích** — phần lớn giá trị có thể đến từ cách bạn thiết kế RAG (đưa đúng tài liệu vào ngữ cảnh), tools (cho model thực hiện hành động), hoặc chỉ đơn giản là một wrapper gọi API tốt.

### Chốt ý nghĩa thực tế

Cuối Ngày 2, khóa học đặt ra chính bài toán sẽ dùng suốt phần còn lại của tuần: dùng nhiều model chuyển Python sang C++ rồi đánh giá — một ví dụ cụ thể để luyện tư duy "chọn model bằng kết quả thật", vì bản thân việc chuyển ngôn ngữ không tự động đảm bảo chương trình chạy nhanh hơn.

---

## 4. Ngày 3 — Thử nghiệm thật: chuyển Python sang C++ bằng GPT-5/Claude/Grok/Gemini

**Nguồn:** [day3.ipynb](day3.ipynb) · bài giảng đầy đủ [Day3_011-014_Chon_AI_viet_code_Bai_giang_day_du.md](Day3_011-014_Chon_AI_viet_code_Bai_giang_day_du.md) / tóm tắt [Day3_011-014_Chon_AI_viet_code_Tom_tat.md](Day3_011-014_Chon_AI_viet_code_Tom_tat.md) (bài 011–014).

### Tóm tắt quy trình

Có một đoạn Python tính xấp xỉ số π bằng một chuỗi nhiều số hạng, chạy mất khoảng 19 giây. Notebook lần lượt nhờ GPT-5, Claude Sonnet 4.5, Grok 4 và Gemini 2.5 Pro viết lại đoạn đó bằng **C++**, rồi tự biên dịch (`main.cpp`) và đo thời gian chạy thực tế để so sánh.

### Quy trình đánh giá (áp dụng lại từ Day 1-2)

**Hiểu yêu cầu → Chọn ứng viên → Làm prototype và đo → Tùy chỉnh nếu cần → Đưa vào vận hành.**

| Thành phần | Vai trò |
|---|---|
| Notebook Python | Chuẩn bị yêu cầu, gọi API, lưu và chạy mã |
| LLM (GPT-5, Claude...) | Viết lại mã Python thành C++ |
| Compiler C++ | Biên dịch `main.cpp` thành chương trình chạy được |
| CPU | Thực thi chương trình đã biên dịch |

### Kết quả demo (chỉ để hiểu cách đo, không phải bảng xếp hạng cố định)

| Model | Tăng tốc so với bản Python gốc |
|---|---:|
| Claude Sonnet 4.5 | 148× |
| GPT-5 | 233× |
| Grok 4 | 1.060× |
| Gemini 2.5 Pro | 1.440× |

$$\text{Hệ số tăng tốc} = \frac{\text{thời gian chạy Python}}{\text{thời gian chạy C++}}$$

**Lưu ý quan trọng:** con số này đo **tốc độ chương trình được tạo ra**, không phải tốc độ AI trả lời — thời gian AI sinh mã và thời gian biên dịch/chạy là hai đại lượng hoàn toàn khác nhau.

### Vì sao tăng tốc được nhiều đến vậy?

- **C++ đã biên dịch** loại bỏ chi phí của vòng lặp thông dịch (interpreted) trong Python thuần.
- **Loop unrolling** (thực hiện nhiều bước trong một lượt lặp) — GPT-5 dùng kỹ thuật này trong bản được trình diễn.
- **Multithreading** (chia việc cho nhiều luồng) — Grok và Gemini có áp dụng.
- **Đơn giản hóa phép tính toán học** — Gemini còn giảm bớt số phép toán cần thực hiện.

### Ba giới hạn phải nhớ khi đọc bảng kết quả trên

1. Một bài thử **chưa đại diện** cho mọi loại công việc — kết quả phụ thuộc đề bài cụ thể, phần cứng, và cấu hình suy luận của từng lần chạy.
2. Đổi môi trường chạy (máy khác, thời điểm khác) có thể **đổi thứ hạng** — kết quả trên máy này chưa chắc lặp lại y hệt trên máy khác.
3. **Nhanh phải đi kèm với đúng** — cần kiểm tra kết quả tính toán trên nhiều đầu vào, không chỉ đo tốc độ của một lần chạy.

### Chốt ý nghĩa thực tế

Ngày 3 biến lý thuyết Ngày 1-2 thành hành động cụ thể: thay vì tin lời quảng cáo "model X viết code giỏi nhất", hãy tự cho các model làm cùng một việc, biên dịch/chạy thật, và đo bằng đúng con số của riêng bài toán mình quan tâm.

---

## 5. Ngày 4 — Mở rộng sang model mã nguồn mở qua giao diện Gradio

**Nguồn:** [day4.ipynb](day4.ipynb), [styles.py](styles.py), [system_info.py](system_info.py) · bài giảng đầy đủ [Day4_015-017_Python_sang_Cpp_Bai_giang_day_du.md](Day4_015-017_Python_sang_Cpp_Bai_giang_day_du.md) / tóm tắt [Day4_015-017_Python_sang_Cpp_Tom_tat.md](Day4_015-017_Python_sang_Cpp_Tom_tat.md) (bài 015–017).

### Tóm tắt quy trình

Ngày 4 lặp lại bài toán Day 3 nhưng mở rộng sang các **model mã nguồn mở** (Qwen, DeepSeek, GPT-OSS) chạy qua Ollama (local), OpenRouter hoặc Groq (cloud), đồng thời đóng gói toàn bộ quy trình thành một ứng dụng có giao diện **Gradio** thay vì chỉ chạy trong cell notebook.

### Cách ứng dụng hoạt động

1. Người dùng nhập code Python, chọn model từ danh sách.
2. Bấm nút **"Convert Code"** để gọi hàm `port(...)`.
3. Hàm gửi code, yêu cầu chuyển đổi, kèm thông tin hệ thống (từ `system_info.py`) tới model đã chọn.
4. Code C++ trả về được hiển thị và lưu vào `main.cpp`.
5. Notebook biên dịch và đo thời gian chạy riêng (bước này không do Gradio thực hiện).

*(Nếu quen làm React: đây gần giống một nút bấm gọi `onClick` tới backend, rồi cập nhật giao diện bằng kết quả trả về.)*

### Bảng kết quả demo (bổ sung thêm các model mở so với Day 3)

| Model | C++ nhanh hơn Python gốc |
|---|---:|
| Gemini 2.5 Pro | 1.440× |
| Grok 4 | 1.060× |
| GPT-OSS 20B (chạy local) | 238× |
| GPT-5 | 233× |
| Claude Sonnet 4.5 | 184× |
| Qwen 3 Coder 30B (qua OpenRouter) | 168× |
| DeepSeek Coder v2 (chạy local) | 168× |
| GPT-OSS 120B (qua Groq) | 14× |
| Qwen 2.5 Coder (chạy local) | Không hoàn tất thành công |

**Phát hiện đáng chú ý:** GPT-OSS 20B (model "nhỏ hơn") vượt qua GPT-OSS 120B ("lớn hơn") trong lần thử này — một lần nữa khẳng định bài học Chinchilla ở Ngày 1: **to hơn không đồng nghĩa tốt hơn cho một tác vụ cụ thể**. Ngược lại, một lần Qwen 2.5 Coder thất bại cũng chưa đủ để kết luận cả họ model đó không viết được C++.

### Chốt ý nghĩa thực tế

Ngày 4 chứng minh model mã nguồn mở (chạy miễn phí trên máy hoặc rẻ hơn qua cloud) hoàn toàn có thể cạnh tranh với model trả phí đắt tiền trên một tác vụ cụ thể — nhưng vẫn cần tự đo, không thể giả định trước.

---

## 6. Ngày 5 — Đánh giá sâu hơn: chỉ số kỹ thuật, kết quả kinh doanh và Python sang Rust

**Nguồn:** [day5.ipynb](day5.ipynb) · bài giảng đầy đủ [Day5_018-021_Danh_gia_AI_va_Python_sang_Rust_Bai_giang_day_du.md](Day5_018-021_Danh_gia_AI_va_Python_sang_Rust_Bai_giang_day_du.md) / tóm tắt [Day5_018-021_Danh_gia_AI_va_Python_sang_Rust_Tom_tat.md](Day5_018-021_Danh_gia_AI_va_Python_sang_Rust_Tom_tat.md) (bài 018–021).

### Tóm tắt quy trình

Ngày cuối tuần nâng cấp bài toán (đổi sang Rust và đổi bài toán tính "tổng đoạn con liên tiếp lớn nhất" — *maximum subarray sum*), đồng thời dạy cách phân biệt hai nhóm chỉ số đánh giá khi nói "AI này tốt".

### Hai nhóm chỉ số đánh giá cần phân biệt

| Nhóm | Ví dụ | Ý nghĩa |
|---|---|---|
| **Technical metrics (chỉ số kỹ thuật)** | loss, perplexity, precision, recall, F1 | Model làm tốt một nhiệm vụ *đo được* đến đâu |
| **Outcome metrics (chỉ số kết quả)** | mức hài lòng, thời gian tiết kiệm, chi phí giảm, doanh thu | Giải pháp có thực sự *tạo giá trị* cho người dùng/doanh nghiệp không |

Một chatbot trả lời đúng nhưng quá chậm hoặc giao diện khó dùng vẫn có thể khiến người dùng không hài lòng — cần đo cả hai nhóm, không chỉ một.

### Bài toán và lý do tăng tốc "khủng"

Bài toán ví dụ: cho mảng `[-2, 3, -1, 4, -5]`, đoạn con liên tiếp có tổng lớn nhất là `[3, -1, 4]` với tổng `6`.

- Bản Python gốc dùng hai vòng lặp lồng nhau để thử mọi cặp điểm đầu/cuối: độ phức tạp $O(n^2)$.
- Model chuyển đổi thành công đã áp dụng **thuật toán Kadane**, chỉ duyệt mảng một lần: độ phức tạp $O(n)$.
- Rust sau khi biên dịch giúp giảm thêm thời gian thực thi so với Python.

**Bài học quan trọng nhất của Ngày 5:** mức tăng tốc đến từ **cả việc đổi thuật toán lẫn việc đổi ngôn ngữ** — nếu chỉ viết lại thuật toán Kadane bằng chính Python, bản gốc cũng đã nhanh hơn rất nhiều. Đừng vội quy hết công lao tăng tốc cho "AI giỏi" hay "Rust nhanh hơn Python".

### Bảng kết quả demo

| Model | Thời gian chạy (mã đúng) |
|---|---:|
| GPT-OSS 120B | 304 micro-giây — hạng 1 |
| Grok 4 | 317 micro-giây — hạng 2 |
| GPT-OSS 20B | 341 micro-giây — hạng 3 |

Nhiều model khác (Qwen 2.5 Coder, DeepSeek Coder v2, Qwen3 Coder 30B, Claude Sonnet 4.5, GPT-5, Gemini 2.5 Pro) bị đánh dấu **fail** trong lượt thử này do lỗi kiểu số hoặc định dạng — luật thử nghiệm không cho phép sửa lại để "cứu" kết quả.

### Bốn điều dễ hiểu nhầm

1. **304 micro-giây là thời gian chương trình chạy**, không phải thời gian AI viết code.
2. **Một lượt thắng không chứng minh model đó tốt nhất cho mọi việc** — đổi prompt, cấu hình, hoặc cho phép sửa lỗi có thể thay đổi kết quả.
3. **Một kết quả khớp đáp án chưa chứng minh đúng trong mọi trường hợp** — cần thử thêm mảng toàn số âm, mảng một phần tử, nhiều seed khác nhau.
4. **Rust không "mặc định" nhanh hơn Python hàng trăm nghìn lần** — phần lớn mức tăng tốc trong ví dụ này đến từ đổi thuật toán, không chỉ đổi ngôn ngữ.

### Chốt ý nghĩa thực tế

Ngày 5 khép lại tuần bằng thông điệp quan trọng nhất cho người làm sản phẩm: khi AI đề xuất một cách "tối ưu", **luôn kiểm tra hành vi đúng trước, rồi mới đo tốc độ/chi phí trước-sau** — tên model nổi tiếng và đoạn code trông thuyết phục không phải bằng chứng đủ để tin tưởng.

---

## 7. Bảng liên kết tài liệu nguồn

| Ngày | Notebook / code | Ghi chú tiếng Việt (Tóm tắt / Đầy đủ) |
|---|---|---|
| Ngày 1 | *(không có notebook)* | [Day1_001-005_Chon_va_danh_gia_LLM_Tom_tat.md](Day1_001-005_Chon_va_danh_gia_LLM_Tom_tat.md) / [-Bai_giang_day_du.md](Day1_001-005_Chon_va_danh_gia_LLM_Bai_giang_day_du.md) |
| Ngày 2 | *(không có notebook)* | [Day2_006-010_Bang_xep_hang_va_chon_model_Tom_tat.md](Day2_006-010_Bang_xep_hang_va_chon_model_Tom_tat.md) / [-Bai_giang_day_du.md](Day2_006-010_Bang_xep_hang_va_chon_model_Bai_giang_day_du.md) |
| Ngày 3 | [day3.ipynb](day3.ipynb), [main.cpp](main.cpp) | [Day3_011-014_Chon_AI_viet_code_Tom_tat.md](Day3_011-014_Chon_AI_viet_code_Tom_tat.md) / [-Bai_giang_day_du.md](Day3_011-014_Chon_AI_viet_code_Bai_giang_day_du.md) |
| Ngày 4 | [day4.ipynb](day4.ipynb), [styles.py](styles.py), [system_info.py](system_info.py) | [Day4_015-017_Python_sang_Cpp_Tom_tat.md](Day4_015-017_Python_sang_Cpp_Tom_tat.md) / [-Bai_giang_day_du.md](Day4_015-017_Python_sang_Cpp_Bai_giang_day_du.md) |
| Ngày 5 | [day5.ipynb](day5.ipynb) | [Day5_018-021_Danh_gia_AI_va_Python_sang_Rust_Tom_tat.md](Day5_018-021_Danh_gia_AI_va_Python_sang_Rust_Tom_tat.md) / [-Bai_giang_day_du.md](Day5_018-021_Danh_gia_AI_va_Python_sang_Rust_Bai_giang_day_du.md) |

---

## 8. Các điểm dễ nhầm trong cả tuần

1. **Nhiều tham số hơn không đồng nghĩa model "thông minh" hơn** (định luật Chinchilla) — cần xét cả dữ liệu huấn luyện và cách sử dụng lúc suy luận.
2. **Điểm benchmark cao có thể do contamination (nhiễm dữ liệu) hoặc overfitting benchmark**, không hẳn phản ánh năng lực thật.
3. **Giá mỗi token thấp không đồng nghĩa chi phí hoàn thành công việc thấp** — phải so tổng chi phí cho cùng một việc.
4. **Tốc độ sinh chữ nhanh không đồng nghĩa hoàn thành sớm** — cần phân biệt TTFT, output throughput và tổng thời gian.
5. **Hệ số tăng tốc (ví dụ 233×) đo tốc độ chương trình được tạo ra, không phải tốc độ AI trả lời.**
6. **Model nhỏ hơn có thể thắng model lớn hơn trên một tác vụ cụ thể** (GPT-OSS 20B thắng GPT-OSS 120B) — không có model nào "luôn tốt nhất" cho mọi việc.
7. **Mức tăng tốc "hàng trăm nghìn lần" có thể đến từ đổi thuật toán, không chỉ đổi ngôn ngữ lập trình** — cần tách bạch hai yếu tố này khi đánh giá.
8. **Một lần chạy đúng/thắng chưa chứng minh model luôn đúng/luôn thắng** — cần thử nhiều đầu vào, nhiều lần lặp, nhiều cấu hình trước khi kết luận.
9. **Technical metrics (loss, F1...) khác Outcome metrics (mức hài lòng, chi phí, doanh thu)** — một giải pháp AI "đúng về mặt kỹ thuật" chưa chắc tạo ra giá trị thực tế.

---

## 9. Mục tiêu cuối cùng

Sau khi học xong Week 4, người học có thể:

- Đọc và diễn giải đúng các thông số mô tả một model (tham số, context window, TTFT, throughput) mà không hiểu nhầm ý nghĩa.
- Giải thích được vì sao một model điểm benchmark cao vẫn có thể không phù hợp với một ứng dụng cụ thể.
- Biết dùng các trang leaderboard thật (Artificial Analysis, LM Arena, LiveBench...) để **lọc ứng viên**, không phải để **quyết định cuối cùng**.
- Tự thiết kế một bài thử thực tế (như chuyển đổi ngôn ngữ lập trình) để so sánh nhiều model một cách công bằng.
- Phân biệt rõ chỉ số kỹ thuật và chỉ số kết quả kinh doanh khi đánh giá một giải pháp AI.
- Áp dụng quy trình 5 bước cho mọi bài toán chọn model trong tương lai: **xác định mục tiêu → chọn ứng viên → kiểm tra tính đúng → đo nhiều lần → so chi phí/tốc độ rồi mới quyết định.**
