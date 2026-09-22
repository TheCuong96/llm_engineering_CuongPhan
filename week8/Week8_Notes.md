<!-- markdownlint-disable MD024 MD025 MD060 -->

# Week 8 — Ghi chú tổng hợp: Agentic AI — Dự án Capstone "Săn deal"

> **Mục tiêu tuần:** ghép toàn bộ kiến thức của 7 tuần trước (gọi API, RAG, fine-tuning, đánh giá model...) thành một **hệ nhiều agent** hoàn chỉnh: tự động đọc tin khuyến mãi, ước lượng giá trị thật của sản phẩm bằng ba cách định giá khác nhau, tìm ra ưu đãi đáng chú ý nhất, rồi gửi thông báo qua điện thoại — tất cả chạy trong một ứng dụng có giao diện, có bộ nhớ và tự lặp lại theo chu kỳ.
>
> Tài liệu này tổng hợp nội dung Day 1–5 của Week 8 từ các bản ghi chú đã có: [Day-01_Modal-Agent_Tom-tat.md](Day-01_Modal-Agent_Tom-tat.md) / [-Giai-thich-day-du.md](Day-01_Modal-Agent_Giai-thich-day-du.md), [Day-02_RAG-Ensemble_Tom-tat.md](Day-02_RAG-Ensemble_Tom-tat.md) / [-Giai-thich-day-du.md](Day-02_RAG-Ensemble_Giai-thich-day-du.md), [Day-03_Structured-Outputs-Scanner-Pushover_Tom-tat.md](Day-03_Structured-Outputs-Scanner-Pushover_Tom-tat.md) / [-Giai-thich-day-du.md](Day-03_Structured-Outputs-Scanner-Pushover_Giai-thich-day-du.md), [Day-04_Planning-Agent-Tool-Calling_Tom-tat.md](Day-04_Planning-Agent-Tool-Calling_Tom-tat.md) / [-Giai-thich-day-du.md](Day-04_Planning-Agent-Tool-Calling_Giai-thich-day-du.md), [Day-05_Deal-Agent-UI-Memory-Timer_Tom-tat.md](Day-05_Deal-Agent-UI-Memory-Timer_Tom-tat.md) / [-Giai-thich-day-du.md](Day-05_Deal-Agent-UI-Memory-Timer_Giai-thich-day-du.md).

## Mục lục

1. [Bức tranh toàn cảnh](#1-bức-tranh-toàn-cảnh)
2. [Ngày 1 — Modal và agent định giá đầu tiên](#2-ngày-1--modal-và-agent-định-giá-đầu-tiên)
3. [Ngày 2 — RAG và Ensemble: ba cách định giá phối hợp](#3-ngày-2--rag-và-ensemble-ba-cách-định-giá-phối-hợp)
4. [Ngày 3 — Structured Outputs: biến tin khuyến mãi thành dữ liệu](#4-ngày-3--structured-outputs-biến-tin-khuyến-mãi-thành-dữ-liệu)
5. [Ngày 4 — Planning Agent và Tool Calling: bộ não điều phối](#5-ngày-4--planning-agent-và-tool-calling-bộ-não-điều-phối)
6. [Ngày 5 — Hoàn thiện ứng dụng: giao diện, bộ nhớ và bộ hẹn giờ](#6-ngày-5--hoàn-thiện-ứng-dụng-giao-diện-bộ-nhớ-và-bộ-hẹn-giờ)
7. [Bảng liên kết tài liệu nguồn](#7-bảng-liên-kết-tài-liệu-nguồn)
8. [Các điểm dễ nhầm trong cả tuần](#8-các-điểm-dễ-nhầm-trong-cả-tuần)
9. [Mục tiêu cuối cùng — và lời kết cả khóa học](#9-mục-tiêu-cuối-cùng--và-lời-kết-cả-khóa-học)

---

## 1. Bức tranh toàn cảnh

### Tóm tắt quy trình của tuần

Week 8 xây dần từng mảnh của hệ thống săn ưu đãi, mỗi ngày thêm một lớp:

1. **Ngày 1:** triển khai model định giá (đã fine-tune ở Week 7) lên **Modal** (nền tảng cloud), rồi bọc lời gọi đó trong `SpecialistAgent` — agent đầu tiên và đơn giản nhất.
2. **Ngày 2:** xây thêm hai cách định giá khác (RAG với kho sản phẩm tham khảo, và mạng nơ-ron từ Week 6), rồi **kết hợp cả ba (Ensemble)** thành một agent định giá mạnh hơn.
3. **Ngày 3:** dùng **Structured Outputs** để biến tin khuyến mãi (viết bằng ngôn ngữ tự nhiên, lộn xộn) thành dữ liệu có cấu trúc (`Deal`: mô tả, giá, URL), đóng gói thành `ScannerAgent`, và gửi thử thông báo qua Pushover.
4. **Ngày 4:** xây `PlanningAgent` — "bộ não" dùng **tool calling** để điều phối Scanner, Ensemble và Messaging theo đúng thứ tự, thay vì code cứng một luồng cố định.
5. **Ngày 5:** hoàn thiện thành ứng dụng thật: giao diện Gradio, bộ nhớ lưu lịch sử deal (`memory.json`), và bộ hẹn giờ tự chạy lại mỗi vài phút.

### Ý nghĩa chính của tuần

Đây là tuần **capstone** (dự án tổng kết) của khóa học — không giới thiệu khái niệm mới nào quá xa lạ, mà là bài tập lớn **ghép lại mọi kỹ thuật đã học**:

```text
Week 1-2 (gọi API, tool calling)  ─┐
Week 3 (model mã nguồn mở)         │
Week 5 (RAG)                       ├──►  Week 8: hệ nhiều Agent phối hợp
Week 6-7 (fine-tuning, ensemble)   │      (Scanner + Ensemble + Planning + Messaging)
Week 4 (đánh giá model)           ─┘
```

**Ghi nhớ cốt lõi xuyên suốt cả tuần:** một "agent" trong tuần này **không tự ý làm mọi việc một cách thần kỳ** — nó vẫn chỉ là code Python gọi LLM, nhận về một yêu cầu (gọi tool hoặc trả lời), rồi chính code đó thực thi hành động thật. "Tính agentic" nằm ở việc **model được quyền quyết định bước tiếp theo và công cụ cần dùng**, còn việc thực thi luôn nằm trong tay lập trình viên.

---

## 2. Ngày 1 — Modal và agent định giá đầu tiên

**Nguồn:** [day1.ipynb](day1.ipynb), [pricer_service.py](pricer_service.py), [pricer_service2.py](pricer_service2.py), [pricer_ephemeral.py](pricer_ephemeral.py), [llama.py](llama.py), [hello.py](hello.py) · bài giảng đầy đủ [Day-01_Modal-Agent_Giai-thich-day-du.md](Day-01_Modal-Agent_Giai-thich-day-du.md) / tóm tắt [Day-01_Modal-Agent_Tom-tat.md](Day-01_Modal-Agent_Tom-tat.md) (bài 001–006).

### Tóm tắt quy trình

Ngày 1 chỉ tập trung vào **một mảnh nhỏ** của hệ thống lớn: đưa model định giá đã fine-tune ở Week 7 lên chạy trên **Modal** (nền tảng serverless — chạy code trên cloud mà không cần tự quản lý máy chủ), rồi tạo `SpecialistAgent` để gọi dịch vụ đó từ xa.

### Từ khóa cần hiểu

| Từ khóa | Hiểu đơn giản |
|---|---|
| Modal | Nền tảng chạy code/model trên cloud, tự lo phần lớn việc quản lý máy chủ |
| Serverless | Vẫn có máy chủ thật phía sau, chỉ là bạn không phải tự quản lý nó |
| Deployment (triển khai) | Đưa code/model lên chạy như một dịch vụ có thể gọi lại nhiều lần |
| Secret | Nơi lưu thông tin xác thực (ví dụ `HF_TOKEN`) để container có quyền tải model |
| Volume | Nơi lưu file bền vững giữa các lần chạy (ví dụ trọng số model) — **khác** với việc model đã sẵn sàng trong bộ nhớ (RAM/VRAM) |
| Cold start (khởi động nguội) | Thời gian cần để khởi động môi trường và nạp model trước khi xử lý được yêu cầu đầu tiên |
| `SpecialistAgent` | Class Python bọc lời gọi tới model định giá đang chạy trên Modal |

### Luồng hoạt động

1. Nhận mô tả sản phẩm.
2. Chuẩn hóa về đúng định dạng đã dùng lúc huấn luyện (Week 7).
3. `SpecialistAgent` gọi phương thức định giá trên Modal — dùng `.local()` để chạy tại máy hiện tại (thử nghiệm) hoặc `.remote()` để thực thi trên cloud.
4. Model nền (LLaMA) kết hợp với adapter đã fine-tune chạy trên GPU cloud.
5. Kết quả được chuyển thành giá dự đoán, trả về chương trình gọi.

### Ba điểm dễ nhầm nhất

1. **"Agent" ở đây chưa "tự suy nghĩ" làm mọi việc** — `SpecialistAgent` chỉ nhận mô tả rồi gọi đúng một dịch vụ định giá, chưa có vòng lặp tự lập kế hoạch (điều đó để dành cho `PlanningAgent` ở Ngày 4).
2. **Có Volume (lưu file) không có nghĩa model luôn sẵn sàng ngay lập tức** — file trên đĩa khác với model đã nạp vào bộ nhớ GPU; container mới khởi động vẫn cần thời gian nạp lại model (cold start).
3. **Triển khai (deploy) dịch vụ định giá không có nghĩa cả hệ thống săn ưu đãi đã tự chạy mãi mãi** — nếu phần điều phối vẫn đang chạy trên máy cá nhân và bạn tắt máy, phần đó cũng dừng theo.

### Chốt ý nghĩa thực tế

Ngày 1 dạy một bài học kiến trúc quan trọng cho mọi hệ agent phức tạp: **bắt đầu với một agent đơn giản nhất, kiểm tra nó chạy đúng và đo được kết quả, rồi mới tăng dần số bước hoặc số agent** — thay vì cố gắng xây cả hệ thống lớn ngay từ đầu.

---

## 3. Ngày 2 — RAG và Ensemble: ba cách định giá phối hợp

**Nguồn:** [day2.ipynb](day2.ipynb), [products_vectorstore/](products_vectorstore/) · bài giảng đầy đủ [Day-02_RAG-Ensemble_Giai-thich-day-du.md](Day-02_RAG-Ensemble_Giai-thich-day-du.md) / tóm tắt [Day-02_RAG-Ensemble_Tom-tat.md](Day-02_RAG-Ensemble_Tom-tat.md) (bài 007–011).

### Tóm tắt quy trình

Ngày 2 xây thêm hai cách định giá khác rồi **kết hợp cả ba lại (Ensemble)** thành một bộ định giá đáng tin cậy hơn từng phần riêng lẻ.

### Cách 1 — RAG: cho AI xem sản phẩm tương tự trước khi đoán giá

Thay vì hỏi thẳng "sản phẩm này giá bao nhiêu?", hệ thống hỏi kèm: "đây là những sản phẩm tương tự và giá đã biết của chúng".

```text
Mô tả sản phẩm mới -> encoder (all-MiniLM-L6-v2, 384 chiều) tạo vector
    -> tìm 5 sản phẩm gần nghĩa nhất trong ChromaDB (kho ~800.000 sản phẩm, bản light ~20.000)
    -> lấy mô tả + giá của 5 sản phẩm đó, ghép vào prompt
    -> LLM (frontier model) dựa vào đó ước lượng giá sản phẩm mới
```

Biểu đồ t-SNE trong bài (khoảng 10.000 điểm) chỉ là bước **khám phá dữ liệu**, không phải bước tạo ra giá — hình đẹp không chứng minh dự đoán chính xác.

### Cách 2 và 3 — Specialist (Week 7) và Neural Network (Week 6)

Tái sử dụng trực tiếp hai mô hình đã xây ở các tuần trước: model fine-tune chạy trên Modal (`SpecialistAgent`, Ngày 1) và mạng nơ-ron nhỏ dự đoán giá từ Week 6.

### Ensemble — kết hợp ba dự đoán theo trọng số

| Nhánh | Cách định giá | Trọng số trong bài |
|---|---|---:|
| Frontier + RAG | LLM mạnh, đọc thêm sản phẩm tham khảo | 80% |
| Specialist | Model fine-tuned, chạy trên Modal | 10% |
| Neural network | Mạng đã huấn luyện ở Week 6 | 10% |

$$\text{Giá cuối} = 0{,}8 \times \text{giá RAG} + 0{,}1 \times \text{giá specialist} + 0{,}1 \times \text{giá neural network}$$

**80/10/10 là lựa chọn thủ công của giảng viên**, không phải tỷ lệ tối ưu tuyệt đối — nguyên lý ensemble là các sai số ngẫu nhiên của từng mô hình có thể **bù trừ lẫn nhau** (ví dụ model A đoán 90, model B đoán 110, giá thật 100 → trung bình vừa đúng), nhưng nếu cả ba cùng lệch theo một hướng, kết hợp vẫn có thể sai.

### Kết quả demo cần nhớ (một lần thử cụ thể, không phải cam kết chung)

| Phương pháp | Sai số trung bình (USD) |
|---|---:|
| Specialist fine-tuned | 39,85 |
| Frontier + RAG | 30,19 |
| Ensemble (kết hợp cả ba) | 29,90 |

RAG mang lại cải thiện lớn so với chỉ dùng specialist; ensemble cải thiện thêm khoảng 1% so với chỉ dùng RAG — mức cải thiện nhỏ nhưng vẫn có ý nghĩa nếu chi phí/độ trễ tăng thêm là chấp nhận được.

### Chốt ý nghĩa thực tế

Ngày 2 chứng minh nguyên lý "không có một mô hình nào thắng tuyệt đối" — kết hợp nhiều cách định giá độc lập (mỗi cách có điểm mạnh/yếu khác nhau) thường ổn định hơn là đặt cược vào một mô hình duy nhất, miễn là **có đo lường để chứng minh** việc kết hợp thực sự đáng giá hơn phần chi phí/độ trễ tăng thêm.

---

## 4. Ngày 3 — Structured Outputs: biến tin khuyến mãi thành dữ liệu

**Nguồn:** [day3.ipynb](day3.ipynb) · bài giảng đầy đủ [Day-03_Structured-Outputs-Scanner-Pushover_Giai-thich-day-du.md](Day-03_Structured-Outputs-Scanner-Pushover_Giai-thich-day-du.md) / tóm tắt [Day-03_Structured-Outputs-Scanner-Pushover_Tom-tat.md](Day-03_Structured-Outputs-Scanner-Pushover_Tom-tat.md) (bài 012–014).

### Tóm tắt quy trình

Tin khuyến mãi thật (từ RSS, trang web) là **dữ liệu phi cấu trúc** — văn bản tự do, lộn xộn. Ngày 3 dùng **Structured Outputs** để ép LLM trả lời đúng theo một khuôn dữ liệu (schema) mà code có thể xử lý trực tiếp, rồi đóng gói thành `ScannerAgent` và thử gửi thông báo qua **Pushover**.

### Ví dụ minh họa

Đầu vào (văn bản tự do): *"Tai nghe X giá gốc 100 USD, giảm 30 USD, còn 70 USD."*

Đầu ra mong muốn (có cấu trúc):

```json
{
  "product_description": "Tai nghe X",
  "price": 70,
  "url": "https://example.com/deal-x"
}
```

Chương trình chỉ cần đọc trực tiếp trường `price`, không phải tự tìm giá bằng cách "mò" trong một đoạn văn dài.

### Các khái niệm cần nhớ

| Thuật ngữ | Hiểu đơn giản |
|---|---|
| Structured Outputs | Yêu cầu LLM trả lời đúng theo một khuôn dữ liệu xác định trước |
| Pydantic | Thư viện Python định nghĩa và kiểm tra dữ liệu (không phải AI) |
| JSON Schema | Quy định các trường cần có và kiểu dữ liệu tương ứng |
| Constrained decoding | Kỹ thuật giới hạn các token model được phép chọn, để đảm bảo giữ đúng cấu trúc khi sinh |
| Parsing | Đọc nội dung và chuyển thành dạng dữ liệu chương trình dùng được |

**Bản chất kỹ thuật:** model vẫn sinh token để biểu diễn JSON như bình thường — SDK/thư viện phía client mới là bên chuyển đổi kết quả đó thành object Python (ví dụ một instance Pydantic).

### `ScannerAgent` làm gì, và chưa làm gì?

Scanner lấy nội dung bằng code thông thường (đọc RSS/trang web), đưa cho LLM, rồi nhận lại danh sách các `Deal` (mô tả, giá, URL) đã được trích xuất và lọc để chỉ giữ tin có thông tin rõ ràng.

**Quan trọng: chọn được tin rõ ràng không đồng nghĩa với chọn được "món hời" thực sự** — muốn biết một deal có đáng giá hay không, còn cần so sánh với giá ước tính (đó là việc của Ensemble ở Ngày 2, chưa phải việc của Scanner).

| Thành phần | Việc chính |
|---|---|
| Code đọc RSS/trang web | Thu thập nội dung thô |
| `ScannerAgent` | Chọn tin phù hợp và trích xuất thành dữ liệu có cấu trúc |
| Ensemble (Ngày 2) | Ước tính sản phẩm đó đáng giá bao nhiêu |
| `PlanningAgent` (Ngày 4) | Quyết định thứ tự các bước và điều kiện hành động |
| Pushover | Soạn và chuyển thông báo tới điện thoại |

### Điểm dễ hiểu sai nhất: đúng cấu trúc không đảm bảo đúng nội dung

Với ví dụ tai nghe giá 70 USD, model **vẫn có thể** trả về `price: 30` (nhầm giá đã giảm với giá bán cuối) — giá trị đó vẫn hợp lệ về mặt kiểu dữ liệu (một con số), nhưng sai về mặt nội dung. Vì vậy luôn cần kiểm tra giá, URL và điều kiện mua bằng logic riêng, không thể chỉ tin vào việc "response đúng schema".

### Pushover — hai khóa cần phân biệt

| Khóa | Vai trò | Biến môi trường trong bài |
|---|---|---|
| User Key | Định danh người nhận | `PUSHOVER_USER` |
| Application/API Token | Định danh ứng dụng gửi | `PUSHOVER_TOKEN` |

**Không cần LLM để gửi được thông báo** — trong demo, Claude chỉ được dùng (tùy chọn) để viết câu thông báo sinh động hơn; việc thực sự gửi đi vẫn do code gọi API Pushover.

### Chốt ý nghĩa thực tế

Ngày 3 tóm gọn trong một câu: **AI đọc hiểu văn bản tự do; schema định hình dữ liệu đầu ra; chương trình kiểm tra lại nội dung rồi mới thực hiện hành động** — không được bỏ qua bước kiểm tra chỉ vì dữ liệu đã "đúng cấu trúc".

---

## 5. Ngày 4 — Planning Agent và Tool Calling: bộ não điều phối

**Nguồn:** [day4.ipynb](day4.ipynb), [agents/](agents/) · bài giảng đầy đủ [Day-04_Planning-Agent-Tool-Calling_Giai-thich-day-du.md](Day-04_Planning-Agent-Tool-Calling_Giai-thich-day-du.md) / tóm tắt [Day-04_Planning-Agent-Tool-Calling_Tom-tat.md](Day-04_Planning-Agent-Tool-Calling_Tom-tat.md) (bài 015–018).

### Tóm tắt quy trình

Ngày 4 xây `PlanningAgent` — thành phần **điều phối** toàn bộ hệ thống bằng tool calling: quyết định khi nào gọi Scanner để tìm deal, khi nào gọi Ensemble để định giá, và khi nào gọi Messaging để gửi thông báo, thay vì viết cứng một luồng `scan() → price() → notify()` cố định trong code.

### Bốn thành phần chính

| Thành phần | Vai trò |
|---|---|
| `PlanningAgent` | "Người điều phối" — chọn công cụ (tool) cần gọi tiếp theo |
| `ScannerAgent` | Tìm và chọn ưu đãi từ nguồn web/RSS (Ngày 3) |
| Ensemble (định giá) | Phối hợp Specialist + RAG + Neural network để định giá (Ngày 2) |
| Messaging Agent | Soạn nội dung và gửi thông báo qua Pushover (Ngày 3) |

`PlanningAgent` chỉ cần gọi đúng tool định giá tổng hợp, **không cần** trực tiếp can thiệp vào từng model bên trong Ensemble.

### Cơ chế Tool Calling — nhắc lại và áp dụng ở quy mô lớn hơn

1. Chương trình đưa cho LLM mục tiêu (ví dụ: "tìm ưu đãi tốt nhất hiện có") kèm danh sách tool khả dụng.
2. LLM trả về tên tool muốn dùng và các đối số tương ứng.
3. **Chương trình (không phải LLM) thực thi hàm thật.**
4. Kết quả được đưa trở lại cho LLM.
5. LLM quyết định bước tiếp theo (gọi tool khác) hoặc kết thúc.

**Agent Loop** là việc lặp lại đúng chu trình "hỏi model → chạy tool → trả kết quả cho model" — bản thân một vòng `while` không đủ để tạo ra hành vi "agentic"; điều quan trọng là **model phải dùng kết quả trả về để tự quyết định bước kế tiếp**.

### Vì sao bắt đầu bằng hàm giả (mock)?

Trước khi nối với hệ thống thật, bài giảng dùng ba hàm giả: một hàm luôn trả danh sách ưu đãi cố định, một hàm luôn định giá "300 USD", và một hàm giả lập gửi thông báo. Mục đích là **kiểm tra luồng điều phối** độc lập với việc phụ thuộc web, model thật hay điện thoại thật. Khi luồng đã chạy đúng, chỉ cần thay phần thân hàm bằng `scanner.scan()`, `ensemble.price()`, `messenger.notify()` — vì giao diện (tool schema) được giữ nguyên, `PlanningAgent` gần như không cần sửa lại cách gọi.

### "Ưu đãi tốt nhất" nghĩa là gì? — cần tiêu chí rõ ràng

Ví dụ: sản phẩm bán 650 USD, model ước tính giá trị thật là 850 USD → chênh lệch 200 USD. Nhưng **giá ước tính không phải giá trị đã được xác minh**, và ưu đãi có mức chênh lệch tiền lớn nhất chưa chắc có tỷ lệ giảm giá cao nhất — muốn hệ thống chọn nhất quán, cần quy định rõ tiêu chí (chênh lệch tuyệt đối? tỷ lệ phần trăm? ngưỡng tối thiểu?).

### Những điểm dễ hiểu nhầm

- **Số lượt gọi LLM nhiều (ví dụ 34 lượt trong một lần demo) không đồng nghĩa có 34 agent riêng biệt** — một agent có thể tự gọi model nhiều lần.
- **Không còn yêu cầu gọi tool không có nghĩa nhiệm vụ đã "thành công"** — ứng dụng vẫn cần tự kiểm tra kết quả thực tế.
- **"Tự chủ" (autonomous) không đồng nghĩa "luôn xử lý hết mọi việc"** — cần kiểm tra bằng code xem agent có bỏ sót trường hợp nào không.
- **Có vòng lặp không có nghĩa ứng dụng tự chạy nền 24/7** — việc lên lịch chạy định kỳ là một vấn đề kỹ thuật riêng (giải quyết ở Ngày 5).

### Chốt ý nghĩa thực tế

Câu cần nhớ nhất của Ngày 4: **Planning Agent chọn việc tiếp theo cần làm; tool thực hiện công việc đó; Agent Loop đưa kết quả trở lại để model tiếp tục quyết định.** Đây chính là khuôn mẫu chung cho hầu hết hệ thống "agentic AI" trong thực tế, không riêng gì bài toán săn deal.

---

## 6. Ngày 5 — Hoàn thiện ứng dụng: giao diện, bộ nhớ và bộ hẹn giờ

**Nguồn:** [day5.ipynb](day5.ipynb), [deal_agent_framework.py](deal_agent_framework.py), [memory.json](memory.json), [log_utils.py](log_utils.py), [price_is_right.py](price_is_right.py), [results.ipynb](results.ipynb) · bài giảng đầy đủ [Day-05_Deal-Agent-UI-Memory-Timer_Giai-thich-day-du.md](Day-05_Deal-Agent-UI-Memory-Timer_Giai-thich-day-du.md) / tóm tắt [Day-05_Deal-Agent-UI-Memory-Timer_Tom-tat.md](Day-05_Deal-Agent-UI-Memory-Timer_Tom-tat.md) (bài 019–022).

### Tóm tắt quy trình

Ngày cuối cùng ghép mọi agent đã xây thành một ứng dụng hoàn chỉnh: có giao diện Gradio hiển thị bảng deal và log xử lý, có bộ nhớ lưu lại lịch sử deal (`memory.json`), và có bộ hẹn giờ tự động chạy lại toàn bộ quy trình mỗi khoảng 5 phút.

### Luồng hoạt động đầy đủ của cả hệ thống

```text
Timer kích hoạt (mỗi ~5 phút)
    -> ScannerAgent đọc tin, trích xuất Deal có cấu trúc (Ngày 3)
    -> Ensemble ước lượng giá trị thật của từng sản phẩm (Ngày 2, dùng Specialist trên Modal từ Ngày 1)
    -> PlanningAgent đánh giá cơ hội, quyết định deal nào đáng chú ý (Ngày 4)
    -> Nếu đủ tốt: Messaging Agent gửi thông báo qua Pushover + ghi vào memory.json
    -> Giao diện Gradio cập nhật bảng deal và log
```

### Sáu thành phần cần phân biệt rõ

| Thành phần | Hiểu đơn giản |
|---|---|
| Agent loop | Trong **một lần chạy**: chọn bước tiếp theo, gọi tool, xem kết quả |
| `DealAgentFramework` | Module tự viết để khởi động, kết nối các agent, ghi log và quản lý lịch sử |
| Memory (`memory.json`) | "Sổ ghi" các deal đã xử lý trước đó |
| Pydantic | Giúp dữ liệu có cấu trúc và chuyển đổi sang/từ JSON — **không đảm bảo nội dung đúng thực tế** |
| Gradio | Giao diện: bảng deal, vùng log, các callback xử lý sự kiện |
| Timer | Đồng hồ kích hoạt một lượt chạy mới theo chu kỳ cố định |

**Phân biệt quan trọng nhất của cả tuần:** *Agent loop* quyết định **làm gì tiếp theo**; *Timer* quyết định **khi nào chạy lại**; *Memory* chỉ đơn thuần lưu lại **những gì đã xảy ra** — ba khái niệm này độc lập với nhau và dễ bị nhầm lẫn thành một.

### Memory không có gì quá bí ẩn

Ứng dụng chỉ đơn giản ghi lịch sử ra file JSON rồi đọc lại khi cần — **LLM chỉ "biết" lịch sử này nếu chương trình chủ động đưa nó vào ngữ cảnh (context) hoặc cung cấp qua một tool**, không có cơ chế ghi nhớ ẩn nào khác.

- Ghi ra JSON **không phải** là fine-tuning.
- Có memory **không bắt buộc** phải dùng vector database.
- Có lịch sử giúp xây cơ chế chống gửi trùng thông báo, nhưng **không tự động đảm bảo** sẽ không bao giờ trùng — logic chống trùng vẫn phải được code tường minh.

### Những điểm dễ hiểu nhầm

| Hiểu nhầm | Cách hiểu đúng |
|---|---|
| Bài cuối dạy một mô hình AI hoàn toàn mới | Chủ yếu là hoàn thiện ứng dụng xung quanh các mô hình đã xây suốt 8 tuần |
| Có timer chạy mỗi 5 phút là đủ để gọi là "agent" | Tính agentic nằm ở việc LLM điều phối và tự chọn tool, không nằm ở việc lặp lại theo lịch |
| Có timer thì ứng dụng tự chạy mãi mãi | Tiến trình/môi trường chạy nó vẫn phải tiếp tục hoạt động (ví dụ máy/server không tắt) |
| Càng nhiều agent, càng nhiều lượt gọi thì càng tốt | Luôn phải đo chất lượng, chi phí và độ trễ trước khi thêm agent hoặc lượt gọi mới |

### Chốt ý nghĩa thực tế

Ngày 5 hoàn tất một hành trình: biến những mảnh AI rời rạc (định giá, quét tin, điều phối, nhắn tin) thành **một ứng dụng có thể quan sát được** (qua log và giao diện), **có trí nhớ** (qua file JSON), và **tự lặp lại công việc** (qua timer) — đúng hình mẫu của một sản phẩm AI thực tế, không chỉ là một notebook thử nghiệm.

---

## 7. Bảng liên kết tài liệu nguồn

| Ngày | Notebook / code | Ghi chú tiếng Việt (Tóm tắt / Đầy đủ) |
|---|---|---|
| Ngày 1 | [day1.ipynb](day1.ipynb), [pricer_service.py](pricer_service.py), [pricer_service2.py](pricer_service2.py), [pricer_ephemeral.py](pricer_ephemeral.py), [llama.py](llama.py), [hello.py](hello.py) | [Day-01_Modal-Agent_Tom-tat.md](Day-01_Modal-Agent_Tom-tat.md) / [-Giai-thich-day-du.md](Day-01_Modal-Agent_Giai-thich-day-du.md) |
| Ngày 2 | [day2.ipynb](day2.ipynb), [products_vectorstore/](products_vectorstore/) | [Day-02_RAG-Ensemble_Tom-tat.md](Day-02_RAG-Ensemble_Tom-tat.md) / [-Giai-thich-day-du.md](Day-02_RAG-Ensemble_Giai-thich-day-du.md) |
| Ngày 3 | [day3.ipynb](day3.ipynb) | [Day-03_Structured-Outputs-Scanner-Pushover_Tom-tat.md](Day-03_Structured-Outputs-Scanner-Pushover_Tom-tat.md) / [-Giai-thich-day-du.md](Day-03_Structured-Outputs-Scanner-Pushover_Giai-thich-day-du.md) |
| Ngày 4 | [day4.ipynb](day4.ipynb), [agents/](agents/) | [Day-04_Planning-Agent-Tool-Calling_Tom-tat.md](Day-04_Planning-Agent-Tool-Calling_Tom-tat.md) / [-Giai-thich-day-du.md](Day-04_Planning-Agent-Tool-Calling_Giai-thich-day-du.md) |
| Ngày 5 | [day5.ipynb](day5.ipynb), [deal_agent_framework.py](deal_agent_framework.py), [memory.json](memory.json), [log_utils.py](log_utils.py), [price_is_right.py](price_is_right.py), [results.ipynb](results.ipynb) | [Day-05_Deal-Agent-UI-Memory-Timer_Tom-tat.md](Day-05_Deal-Agent-UI-Memory-Timer_Tom-tat.md) / [-Giai-thich-day-du.md](Day-05_Deal-Agent-UI-Memory-Timer_Giai-thich-day-du.md) |

---

## 8. Các điểm dễ nhầm trong cả tuần

1. **"Agent" không tự động có nghĩa là "thông minh tự chủ hoàn toàn"** — nhiều agent trong tuần này (đặc biệt Ngày 1) chỉ đơn giản là một class Python gọi một dịch vụ cố định.
2. **File lưu trên Volume/đĩa khác với model đã sẵn sàng trong bộ nhớ GPU** — vẫn cần thời gian "cold start" để nạp model dù file đã có sẵn.
3. **Deploy một dịch vụ không có nghĩa toàn hệ thống tự chạy mãi mãi** — phần điều phối chạy ở đâu, phải tiếp tục hoạt động ở đó.
4. **Đúng cấu trúc dữ liệu (Structured Outputs) không đảm bảo đúng nội dung** — model vẫn có thể điền sai giá trị vào đúng trường dữ liệu.
5. **Ensemble (kết hợp nhiều model) không đảm bảo luôn thắng model tốt nhất trên từng sản phẩm riêng lẻ** — chỉ thường ổn định hơn trên trung bình nhiều sản phẩm.
6. **Trọng số ensemble (như 80/10/10) là lựa chọn thủ công dựa trên thử nghiệm, không phải công thức tối ưu tuyệt đối.**
7. **Tool calling: model chỉ trả về "yêu cầu" gọi hàm, code mới là bên thực thi thật** — nhắc lại bài học quan trọng từ Week 2.
8. **Số lượt gọi LLM nhiều không đồng nghĩa có nhiều agent riêng biệt** — một agent có thể tự gọi model nhiều lần trong một lượt xử lý.
9. **Memory chỉ là file lưu lịch sử, không phải cơ chế "học thêm" hay fine-tuning** — LLM chỉ biết lịch sử khi được đưa vào context tường minh.
10. **Có bộ hẹn giờ (timer) không đồng nghĩa là "agentic"** — tính agentic nằm ở việc model tự quyết định hành động, không nằm ở việc lặp lại theo lịch.
11. **Giá ước lượng từ model không phải giá trị đã được xác minh chắc chắn** — một "cơ hội tốt" theo hệ thống vẫn cần con người hoặc thêm kiểm tra trước khi hành động thật (ví dụ mua hàng).

---

## 9. Mục tiêu cuối cùng — và lời kết cả khóa học

Sau khi học xong Week 8, người học có thể:

- Triển khai một model (đã fine-tune hoặc có sẵn) lên nền tảng cloud (Modal) và gọi nó như một dịch vụ từ xa.
- Kết hợp nhiều cách định giá/dự đoán khác nhau (RAG, model fine-tune, mạng nơ-ron) thành một Ensemble đáng tin cậy hơn.
- Dùng Structured Outputs để biến dữ liệu phi cấu trúc (văn bản tự do) thành dữ liệu có cấu trúc mà chương trình xử lý được.
- Xây một `PlanningAgent` dùng tool calling để điều phối nhiều agent con theo đúng thứ tự cần thiết.
- Hoàn thiện một hệ agent thành ứng dụng thật: có giao diện, có bộ nhớ lưu lịch sử, và tự lặp lại theo chu kỳ.
- Phân biệt rõ ràng giữa "trông có vẻ agentic" (nhiều lượt gọi, có vòng lặp, có timer) và "thực sự agentic" (model tự quyết định hành động tiếp theo dựa trên kết quả quan sát được).

**Thông điệp tổng kết của cả khóa "LLM Engineering":** hành trình 8 tuần đã đi qua gọi LLM cơ bản → tool calling và giao diện → model mã nguồn mở → chọn/đánh giá model → RAG → đánh giá và fine-tuning → ensemble và agent workflow. Điều cần giữ lại **không phải** là "fine-tuning luôn tốt nhất" hay "model lớn luôn thắng", mà là một phản xạ chung cho mọi dự án AI trong tương lai: **chọn kỹ thuật dựa trên đúng bài toán cần giải quyết, và luôn đo lường kết quả bằng số liệu thay vì chỉ tin vào cảm giác "có vẻ ổn".**
