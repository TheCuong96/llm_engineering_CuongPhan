<!-- markdownlint-disable MD024 MD025 MD060 -->

# Week 5 — Ghi chú tổng hợp: RAG (Retrieval-Augmented Generation)

> **Mục tiêu tuần:** xây một trợ lý AI có thể trả lời dựa trên **tài liệu riêng** (kho kiến thức nội bộ của một công ty giả định "Insurellm"), thay vì chỉ dựa vào kiến thức đã huấn luyện sẵn của model. Tuần này đi từ ý tưởng đơn giản nhất (tìm theo từ khóa) đến một hệ RAG nâng cao có đánh giá bằng số liệu — đây được xem là kỹ thuật có khả năng ứng dụng tức thì cao bậc nhất của cả khóa học.
>
> Tài liệu này tổng hợp nội dung Day 1–5 của Week 5 từ các bản ghi chú đã có: [RAG_Day_1_Tom_Tat.md](RAG_Day_1_Tom_Tat.md) / [-Day_Du.md](RAG_Day_1_Day_Du.md), [RAG_Day_2_Tom_Tat.md](RAG_Day_2_Tom_Tat.md) / [-Day_Du.md](RAG_Day_2_Day_Du.md), [RAG_Day_3_Tom_Tat.md](RAG_Day_3_Tom_Tat.md) / [-Day_Du.md](RAG_Day_3_Day_Du.md), [RAG_Day_4_Tom_Tat.md](RAG_Day_4_Tom_Tat.md) / [-Day_Du.md](RAG_Day_4_Day_Du.md), [RAG_Day_5_Tom_Tat.md](RAG_Day_5_Tom_Tat.md) / [-Day_Du.md](RAG_Day_5_Day_Du.md).

## Mục lục

1. [Bức tranh toàn cảnh](#1-bức-tranh-toàn-cảnh)
2. [Ngày 1 — Ý tưởng RAG: từ tìm từ khóa đến tìm theo ý nghĩa](#2-ngày-1--ý-tưởng-rag-từ-tìm-từ-khóa-đến-tìm-theo-ý-nghĩa)
3. [Ngày 2 — Chuẩn bị dữ liệu: chunking, embedding và Chroma](#3-ngày-2--chuẩn-bị-dữ-liệu-chunking-embedding-và-chroma)
4. [Ngày 3 — Ghép thành chatbot RAG hoàn chỉnh và xử lý lịch sử hội thoại](#4-ngày-3--ghép-thành-chatbot-rag-hoàn-chỉnh-và-xử-lý-lịch-sử-hội-thoại)
5. [Ngày 4 — Đánh giá RAG bằng số liệu (Evals)](#5-ngày-4--đánh-giá-rag-bằng-số-liệu-evals)
6. [Ngày 5 — Advanced RAG: mười hướng cải tiến](#6-ngày-5--advanced-rag-mười-hướng-cải-tiến)
7. [Bảng liên kết tài liệu nguồn](#7-bảng-liên-kết-tài-liệu-nguồn)
8. [Các điểm dễ nhầm trong cả tuần](#8-các-điểm-dễ-nhầm-trong-cả-tuần)
9. [Mục tiêu cuối cùng](#9-mục-tiêu-cuối-cùng)

---

## 1. Bức tranh toàn cảnh

### Tóm tắt quy trình của tuần

1. **Ngày 1:** hiểu ý tưởng cốt lõi của RAG bằng một bản demo tra từ khóa cực đơn giản, thấy rõ điểm yếu của nó, rồi được giới thiệu "ý tưởng lớn": dùng **embedding** (biểu diễn văn bản bằng số) để tìm theo ý nghĩa thay vì khớp chữ.
2. **Ngày 2:** xây phần "hậu trường" — đọc tài liệu thật, chia nhỏ thành **chunk**, tạo embedding, lưu vào **Chroma** (vector store), và trực quan hóa để hiểu dữ liệu đang được biểu diễn ra sao.
3. **Ngày 3:** ghép mọi thứ thành một chatbot RAG hoàn chỉnh có giao diện, rồi phát hiện ba lỗi kinh điển khi thêm lịch sử hội thoại vào một hệ RAG.
4. **Ngày 4:** học cách **đo lường** một hệ RAG một cách có hệ thống — tách riêng chất lượng "tìm kiếm" (retrieval) và chất lượng "câu trả lời" (answer), dùng bộ câu hỏi chuẩn (golden dataset) và LLM-as-a-Judge.
5. **Ngày 5:** nâng cấp bằng 10 kỹ thuật RAG nâng cao (semantic chunking, query rewriting, reranking...) và đo lại để chứng minh những cải tiến đó thực sự hiệu quả.

### Ý nghĩa chính của tuần

RAG (Retrieval-Augmented Generation — **sinh văn bản có tăng cường truy xuất**) giải quyết một giới hạn cốt lõi của LLM: model không biết dữ liệu riêng/mới của bạn. Nguyên lý xuyên suốt cả tuần:

```text
Câu hỏi của người dùng
    -> Tìm (retrieval) những đoạn tài liệu có khả năng liên quan nhất
    -> Đưa các đoạn đó (văn bản gốc, không phải embedding) vào prompt
    -> LLM đọc prompt (câu hỏi + tài liệu tìm được) rồi viết câu trả lời
```

**Điều quan trọng nhất cần khắc sâu:** đưa tài liệu vào prompt **không phải huấn luyện lại model**, và model **không hề "ghi nhớ vĩnh viễn"** kho tài liệu — mỗi lần hỏi, hệ thống phải tìm lại và gửi lại đúng phần tài liệu liên quan.

---

## 2. Ngày 1 — Ý tưởng RAG: từ tìm từ khóa đến tìm theo ý nghĩa

**Nguồn:** [day1.ipynb](day1.ipynb) · bài giảng đầy đủ [RAG_Day_1_Day_Du.md](RAG_Day_1_Day_Du.md) / tóm tắt [RAG_Day_1_Tom_Tat.md](RAG_Day_1_Tom_Tat.md) (bài 001–006).

### Tóm tắt quy trình

Ngày 1 dựng một bản RAG "thô sơ nhất có thể": đọc các hồ sơ nhân viên dạng Markdown vào một `dictionary` Python, tra cứu bằng cách khớp từ khóa trong câu hỏi, ghép văn bản tìm được vào prompt rồi gọi LLM trả lời. Sau khi thấy rõ điểm yếu của cách này, bài giảng giới thiệu hướng giải quyết bằng **embedding**.

### "Ý tưởng nhỏ": tìm theo từ khóa — và vì sao nó dễ vỡ

Ví dụ: dictionary lưu khóa `lancaster` ứng với hồ sơ của Avery Lancaster.

- Hỏi "Lancaster là ai?" → tìm thấy (khớp khóa).
- Hỏi "Avery là ai?" → **không tìm thấy**, vì thiếu khóa `avery`.
- Hỏi "Alex Lancaster là ai?" → có thể **lấy nhầm** hồ sơ của Avery vì trùng họ.

Đây chính là hạn chế cốt lõi của tìm kiếm từ khóa: quá cứng nhắc, không hiểu được sự tương đồng về ý nghĩa.

### "Ý tưởng lớn": tìm theo ý nghĩa bằng embedding

Hai câu "Giá vé đi London?" và "Bay đến Heathrow bao nhiêu tiền?" dùng từ ngữ khác nhau nhưng liên quan chặt chẽ về ý nghĩa. **Embedding** (một danh sách số biểu diễn nội dung văn bản) giúp hệ thống nhận ra sự liên quan này mà không cần khớp chữ chính xác.

### Các thành phần cốt lõi cần phân biệt

| Thành phần | Hiểu nhanh |
|---|---|
| Knowledge base (kho kiến thức) | Toàn bộ tài liệu cần tra cứu |
| Token / Token ID | Đơn vị văn bản / số định danh đơn vị đó |
| Embedding | Danh sách số biểu diễn một đoạn văn bản, dùng để so sánh ngữ nghĩa |
| Embedding model | Model tạo ra embedding cho tài liệu và câu hỏi |
| Vector store | Nơi lưu trữ và tìm kiếm các embedding, liên kết ngược lại với văn bản gốc |
| Generative LLM | Model đọc câu hỏi + tài liệu tìm được, rồi viết câu trả lời |

**Ghi nhớ quan trọng:** model tạo embedding (giúp *tìm*) và LLM sinh văn bản (giúp *trả lời*) có thể là **hai model hoàn toàn khác nhau**. Và khi trả lời, **LLM đọc văn bản gốc đã tìm được, không phải đọc dãy số embedding** — hệ thống không "giải mã" vector để tái tạo tài liệu.

### Thí nghiệm đáng nhớ nhất: lịch sử hội thoại có thể "che giấu" lỗi tìm kiếm

Nếu hỏi "Avery Lancaster là ai?" rồi hỏi tiếp "Avery là ai?" **trong cùng một cuộc chat**, cả hai câu có thể được trả lời đúng — nhưng điều đó **không chứng minh** việc tìm kiếm hoạt động tốt, vì model có thể đã lấy thông tin từ chính lịch sử hội thoại. Chỉ khi mở một cuộc chat **mới** và hỏi thẳng "Avery là ai?" mới lộ ra rằng cơ chế tra từ khóa thực sự không tìm được. **Bài học kiểm thử:** luôn kiểm tra riêng biệt ba thứ — tài liệu được truy xuất, prompt thực sự gửi đi, và câu trả lời cuối cùng.

### Chốt ý nghĩa thực tế

Ngày 1 không chỉ dạy code — nó dạy **cách tư duy debug một hệ RAG**: đừng vội tin câu trả lời đúng là bằng chứng hệ thống tìm kiếm tốt, vì lịch sử hội thoại hoặc kiến thức nền của model có thể đang "che" đi một lỗi tìm kiếm thực sự.

---

## 3. Ngày 2 — Chuẩn bị dữ liệu: chunking, embedding và Chroma

**Nguồn:** [day2.ipynb](day2.ipynb) · bài giảng đầy đủ [RAG_Day_2_Day_Du.md](RAG_Day_2_Day_Du.md) / tóm tắt [RAG_Day_2_Tom_Tat.md](RAG_Day_2_Tom_Tat.md) (bài 007–011).

### Tóm tắt quy trình

Ngày 2 xây phần "hậu trường" nghiêm túc: đọc toàn bộ kho tài liệu, chia nhỏ thành **chunk** (đoạn), tạo embedding cho từng chunk bằng một embedding model, lưu vào **Chroma** (một vector database), rồi dùng **t-SNE** để giảm chiều dữ liệu và trực quan hóa trong không gian 2D/3D.

### Luồng xử lý cần nhớ

```text
Chuẩn bị kho: tài liệu -> chia chunk -> embedding model tạo vector -> lưu vector kèm văn bản + metadata vào Chroma
Khi có câu hỏi: mã hóa câu hỏi thành vector -> tìm các vector gần nhất -> lấy văn bản chunk tương ứng -> gửi cho LLM
```

### Các con số cụ thể trong demo (chỉ để minh họa quy mô, không phải chuẩn mực)

- Kho tài liệu: **76 file**, khoảng **300.000 ký tự**, gần **64.000 token**.
- Chia với `chunk_size=1000`, `chunk_overlap=200` (đơn vị **ký tự**) → **413 chunk**.
- Đổi `chunk_size=800` → **532 chunk**.
- Số chiều vector: MiniLM **384 chiều**; OpenAI small **1.536 chiều**; OpenAI large **3.072 chiều**.

### Hiểu đúng về chunking

`RecursiveCharacterTextSplitter` (LangChain) ưu tiên cắt theo ranh giới lớn (đoạn văn) trước, chỉ cắt nhỏ hơn khi cần — nó **không tự hiểu ý nghĩa** như một biên tập viên con người.

| Kích thước chunk | Ưu điểm | Nhược điểm |
|---|---|---|
| Nhỏ | Tập trung vào chi tiết | Dễ mất điều kiện/chủ thể liên quan (ví dụ: mất tên người ở đầu đoạn) |
| Lớn | Giữ được ngữ cảnh | Dễ lẫn nhiều ý, tốn context không cần thiết |

**Overlap (chồng lấn)** giữa các chunk giúp giảm nguy cơ đứt ngữ cảnh ở ranh giới cắt, nhưng lạm dụng sẽ tăng dữ liệu trùng lặp. Cấu hình `1000/200` chỉ là **lựa chọn thử nghiệm**, không phải con số tối ưu chuẩn cho mọi dữ liệu — còn phải để ý giới hạn token riêng của embedding model (ví dụ MiniLM trong bài mặc định cắt bớt nếu đầu vào vượt quá 256 word-piece).

### Đọc biểu đồ t-SNE đúng cách

Mỗi điểm trên biểu đồ là một chunk; màu sắc thường theo loại tài liệu. **Trục X/Y/Z không mang ý nghĩa cố định nào** (ví dụ không có trục nào là "mức độ liên quan"). t-SNE giúp quan sát quan hệ lân cận nhưng **không giữ nguyên mọi khoảng cách thật** — cụm dữ liệu tách đẹp trên biểu đồ **chưa chứng minh** việc truy xuất sẽ chính xác.

### Đổi embedding model sẽ đổi cả không gian biểu diễn

Giữ nguyên các chunk nhưng đổi embedding model sẽ cho ra một cách biểu diễn vector khác hẳn — **chính model quyết định không gian vector**, không chỉ là số chiều. Khi triển khai thật, nếu đổi embedding model, phải **tạo lại toàn bộ vector** cho cả tài liệu lẫn câu hỏi bằng model mới; hai model có cùng số chiều **không có nghĩa** chúng dùng chung một không gian vector tương thích.

### Chốt ý nghĩa thực tế

Ngày 2 là bước "làm sạch bếp" bắt buộc trước khi nấu ăn: chất lượng chunking và embedding quyết định trần chất lượng tối đa mà bước tìm kiếm có thể đạt được — dù LLM ở bước sau có giỏi đến đâu, nó cũng không thể trả lời đúng nếu chưa từng được "nhìn thấy" đúng đoạn tài liệu cần thiết.

---

## 4. Ngày 3 — Ghép thành chatbot RAG hoàn chỉnh và xử lý lịch sử hội thoại

**Nguồn:** [day3.ipynb](day3.ipynb) · bài giảng đầy đủ [RAG_Day_3_Day_Du.md](RAG_Day_3_Day_Du.md) / tóm tắt [RAG_Day_3_Tom_Tat.md](RAG_Day_3_Tom_Tat.md) (bài 012–016).

### Tóm tắt quy trình

Ngày 3 nối Chroma (Ngày 2) với một LLM và giao diện Gradio để thành một chatbot RAG hoàn chỉnh, có lịch sử hội thoại; sau đó bài giảng cố ý đặt các câu hỏi hóc búa để lộ ra ba lỗi kinh điển khi kết hợp RAG với lịch sử chat.

### Hai luồng cần nhớ

```text
Chuẩn bị dữ liệu: tài liệu -> chia chunk -> tạo embedding -> lưu Chroma
Mỗi lượt hỏi: tạo truy vấn -> tìm chunk liên quan (retriever) -> lấy văn bản làm context
             -> gửi context + lịch sử + câu hỏi cho LLM -> hiển thị câu trả lời
```

`retriever.invoke()` trả về tài liệu; `llm.invoke()` trả về câu trả lời — đây là **hai bước tách biệt**, người viết code phải tự nối chúng lại; chỉ tạo ra hai đối tượng đó chưa tạo thành một hệ RAG hoàn chỉnh.

### Tổ chức code thành module (thực hành tốt)

| File | Công việc |
|---|---|
| `ingest.py` | Đọc tài liệu → chia đoạn → tạo embedding → lưu kho Chroma |
| `answer.py` | Lấy context, xử lý lịch sử hội thoại, gọi LLM |
| `app.py` | Chạy giao diện Gradio |

### Ba lỗi quan trọng nhất cần khắc cốt ghi tâm

1. **"Lương của cô ấy là bao nhiêu?" nhưng hệ thống trả lời về người khác.** Sau khi đã hỏi về Avery, câu hỏi tiếp theo dùng đại từ "cô ấy" — có **hai nơi** cần biết lịch sử: LLM cần hiểu "cô ấy" = Avery, **và** retriever cũng cần đủ thông tin để tìm đúng hồ sơ Avery (chỉ gửi lịch sử cho LLM là chưa đủ, vì bước tìm kiếm có thể vẫn tìm sai tài liệu). Hướng khắc phục: ghép các câu người dùng đã nói thành truy vấn tìm kiếm, đồng thời vẫn gửi lịch sử cho LLM.
2. **Đổi chủ đề nhưng hệ thống vẫn tìm hồ sơ cũ.** Nếu ghép toàn bộ lịch sử cũ vào truy vấn, câu hỏi mới (ví dụ về một giải thưởng khác) vẫn bị "kéo" về các đoạn nói về Avery. Hướng cải tiến (chưa triển khai đầy đủ trong bài): **viết lại câu hỏi hiện tại thành một câu độc lập** (query rewriting), chỉ giữ phần ngữ cảnh lịch sử thực sự cần thiết.
3. **Trả lời thiếu họ (ví dụ "Maxine" thay vì "Maxine Thompson").** Chunk tìm được có nội dung liên quan nhưng thiếu tên đầy đủ (nằm ở một đoạn/vị trí khác trong tài liệu gốc). Bài học: **tài liệu có thông tin không đồng nghĩa với chunk/prompt có thông tin đó** — cần cân nhắc thêm tiêu đề/tên nhân vật vào từng chunk, hoặc lấy thêm đoạn lân cận.

### Cách debug một hệ RAG trả lời sai

Khi câu trả lời sai, kiểm tra theo đúng thứ tự: **tài liệu gốc → chunk tìm được → context/lịch sử thực sự gửi cho LLM → câu trả lời**. Nếu chunk tìm được đã sai ngay từ đầu, cần sửa bước truy xuất trước — đổi sang LLM "xịn" hơn không giải quyết được lỗi tìm kiếm.

### Chốt ý nghĩa thực tế

Ngày 3 chứng minh một điều quan trọng: **"làm cho RAG chạy được" rất dễ, nhưng "làm cho RAG tìm đúng và trả lời đủ trong hội thoại nhiều lượt" đòi hỏi xử lý lịch sử cẩn thận** — đây là lý do Ngày 4 phải học cách đánh giá RAG bằng số liệu thay vì chỉ thử vài câu hỏi bằng cảm tính.

---

## 5. Ngày 4 — Đánh giá RAG bằng số liệu (Evals)

**Nguồn:** bài giảng đầy đủ [RAG_Day_4_Day_Du.md](RAG_Day_4_Day_Du.md) / tóm tắt [RAG_Day_4_Tom_Tat.md](RAG_Day_4_Tom_Tat.md) (bài 017–023) · [evaluator.py](evaluator.py), [evaluation/](evaluation/).

### Tóm tắt quy trình

Ngày 4 trả lời câu hỏi: "Thay đổi cấu hình này có thực sự làm hệ RAG tốt hơn không, hay chỉ là cảm giác?" Quy trình chuẩn: **lập bộ câu hỏi chuẩn (golden dataset) → đo baseline → đổi một cấu hình → chạy lại → so sánh số liệu và đọc lỗi cụ thể.**

### Vì sao phải chấm điểm hai phần riêng biệt?

| Phần | Câu hỏi cần kiểm tra |
|---|---|
| **Retrieval (truy xuất)** | Hệ thống có tìm **đúng và đủ** các đoạn tài liệu cần thiết không? |
| **Answer (câu trả lời)** | Dựa trên các đoạn đã tìm, LLM có trả lời **đúng, đủ, đúng trọng tâm** không? |

Ví dụ minh họa: đáp án đúng là "Maxine Thompson", nhưng đoạn tìm được chỉ ghi "Maxine" → LLM trả lời thiếu họ **không phải vì LLM kém, mà vì retrieval đã cung cấp thiếu thông tin**. Đây là lý do phải tách hai phần khi chẩn đoán lỗi.

### Các khái niệm đánh giá cốt lõi

| Khái niệm | Hiểu nhanh |
|---|---|
| Golden dataset | Bộ câu hỏi kèm đáp án chuẩn đã được kiểm tra tay (demo dùng 150 câu) |
| Keyword coverage | Tỷ lệ từ khóa mong đợi thực sự xuất hiện trong context tìm được |
| MRR (Mean Reciprocal Rank) | Đo mức độ đoạn đúng xuất hiện *sớm* trong danh sách kết quả (hạng 1 = điểm 1; hạng 2 = điểm 1/2; hạng 5 = điểm 1/5...) |
| nDCG | Đo chất lượng sắp xếp toàn bộ danh sách, ưu tiên nội dung hữu ích ở vị trí đầu |
| LLM as a Judge | Dùng một LLM khác để so sánh câu trả lời với đáp án chuẩn theo tiêu chí cho điểm |
| Structured Outputs | Ép LLM giám khảo trả điểm theo đúng schema để code đọc và tổng hợp được |

**LLM giám khảo chấm theo ba chiều:** Accuracy (đúng), Completeness (đủ), Relevance (liên quan) — ví dụ trường hợp thiếu họ "Thompson" ở trên được chấm 5/5, 4/5, 5/5 tương ứng.

### Kết quả demo: baseline so với sau khi tinh chỉnh

| Chỉ số | Ban đầu | Sau khi chỉnh (chunk nhỏ hơn + đổi embedding) |
|---|---:|---:|
| MRR | 0,7298 | 0,7903 |
| nDCG | 0,7387 | 0,7901 |
| Keyword coverage | 83,8% | 92,5% |
| Accuracy (/5) | 3,99 | 4,21 |
| Completeness (/5) | 3,85 | 4,05 |
| Relevance (/5) | 4,57 | 4,71 |

Thay đổi được thử: từ `chunk 1.000 ký tự, k=5` sang `chunk 500 ký tự, k=10` (giữ tổng context danh nghĩa khoảng 5.000 ký tự), sau đó đổi embedding model. **Trong bộ test cụ thể này**, retrieval tốt hơn đã đi kèm câu trả lời tốt hơn — nhưng điều đó không có nghĩa "chunk 500" hay "embedding lớn nhất" luôn là lựa chọn tốt nhất cho mọi dự án khác.

### Những điểm dễ hiểu sai khi đọc chỉ số

- **MRR 0,79 không phải là "79% câu trả lời đúng"** — đó là một phép đo về *thứ hạng* của kết quả liên quan.
- **Accuracy 4,21/5 là điểm số giám khảo AI chấm**, không phải tỷ lệ phần trăm trả lời đúng.
- **Đủ từ khóa mong đợi chưa chắc là bằng chứng câu trả lời đúng** — các từ khóa đó có thể thuộc về đối tượng/ngữ cảnh khác.
- **Kết quả JSON đúng cấu trúc không đảm bảo LLM giám khảo chấm đúng** — nên đối chiếu thủ công một số câu ngẫu nhiên.
- **Đổi embedding model bắt buộc phải tạo lại toàn bộ vector** (cả tài liệu lẫn câu hỏi), không thể chỉ đổi một phía.

### Chốt ý nghĩa thực tế

Ngày 4 là "phòng kiểm định chất lượng" của cả hệ RAG: câu nói cần nhớ nhất là **"Tôi biết thay đổi này tốt hơn vì tôi đã đo nó trên những câu hỏi đại diện cho nhu cầu thật"** — thay vì chỉ dựa vào cảm giác "có vẻ trả lời hay hơn".

---

## 6. Ngày 5 — Advanced RAG: mười hướng cải tiến

**Nguồn:** [day4.ipynb](day4.ipynb), [day5.ipynb](day5.ipynb) / [day5-EN.ipynb](day5-EN.ipynb), [implementation/](implementation/), [pro_implementation/](pro_implementation/) · bài giảng đầy đủ [RAG_Day_5_Day_Du.md](RAG_Day_5_Day_Du.md) / tóm tắt [RAG_Day_5_Tom_Tat.md](RAG_Day_5_Tom_Tat.md) (bài 024–032).

### Tóm tắt quy trình

Ngày 5 tổng kết bằng thông điệp: **đo → tìm lỗi → thay đổi → đo lại**, rồi giới thiệu 10 kỹ thuật RAG nâng cao, thực hành sâu một vài kỹ thuật (semantic chunking, query rewriting, reranking) và đo lại toàn bộ hệ thống để chứng minh mức cải thiện.

### Mười kỹ thuật RAG nâng cao

| Kỹ thuật | Hiểu ngắn gọn |
|---|---|
| Chunking (nâng cao) | Chia tài liệu sao cho từng đoạn tự thân đã đủ nghĩa, dễ tìm |
| Encoder selection | Chọn embedding model phù hợp với đặc điểm dữ liệu |
| Prompt improvement | Hướng dẫn LLM trả lời rõ ràng, đúng và đủ ý hơn |
| Document preprocessing | Chuẩn bị tài liệu tốt hơn: thêm tiêu đề/tóm tắt hỗ trợ tìm kiếm |
| Query rewriting | Viết lại câu hỏi người dùng thành truy vấn rõ nghĩa, có thể dựa vào lịch sử |
| Query expansion | Tìm kiếm bằng nhiều biến thể truy vấn để giảm bỏ sót |
| Re-ranking | Sắp xếp lại các đoạn đã tìm được để đưa nội dung hữu ích nhất lên đầu |
| Hierarchical RAG | Dùng thêm dữ liệu tổng hợp ở nhiều cấp cho các câu hỏi bao quát |
| GraphRAG | Khai thác quan hệ (người – tổ chức – sản phẩm...) dưới dạng đồ thị |
| Agentic RAG | Để LLM tự quyết định công cụ và các bước tìm kiếm cần thực hiện |

Ghi chú: ba kỹ thuật cuối (Hierarchical RAG, GraphRAG, Agentic RAG) chủ yếu được giới thiệu ở mức ý tưởng và giao bài tập tự khám phá, chưa được xây dựng hoàn chỉnh trong bài giảng.

### Hệ thống nâng cao hoạt động ra sao?

**Khi nhập dữ liệu (không dùng LangChain, tự gọi trực tiếp embedding + Chroma):**

1. Đọc tài liệu Markdown.
2. Dùng LLM để chia đoạn theo ngữ nghĩa (**semantic chunking**) thay vì chỉ cắt theo số ký tự cố định.
3. Mỗi đoạn được bổ sung tiêu đề, tóm tắt và giữ nguyên văn gốc.
4. Tạo embedding, lưu cùng văn bản và metadata vào Chroma.

**Khi người dùng đặt câu hỏi:**

1. Giữ lại **cả câu hỏi gốc lẫn một câu đã viết lại** (query rewriting).
2. Tìm kiếm 20 đoạn bằng mỗi câu (gốc và viết lại).
3. Gộp kết quả, loại trùng (tối đa 40 ứng viên trước khi loại trùng).
4. **Xếp hạng lại (re-rank)** theo câu hỏi gốc, chỉ giữ 10 đoạn đầu.
5. LLM đọc các đoạn đó cùng câu hỏi/lịch sử rồi trả lời.

### Ví dụ quan trọng nhất: khi "thêm AI" lại làm hại kết quả

Câu hỏi: **"Ai học ở Manchester University?"** — hồ sơ đúng ghi "University of Manchester".

- Sau bước chia đoạn theo ngữ nghĩa: tìm được đoạn đúng, nhưng chỉ xếp ở vị trí thứ 5.
- Sau khi re-rank: đoạn đó được đẩy lên vị trí đầu tiên.
- Nhưng bước **query rewriting đôi khi tự ý thêm tên công ty** vào câu viết lại, khiến việc tìm kiếm bị "kéo lệch" sang các tài liệu chung chung và kết quả trở nên **tệ hơn**.
- Cách khắc phục: **tìm kiếm bằng cả câu hỏi gốc lẫn câu đã viết lại**, rồi gộp và xếp hạng chung — không chỉ tin tưởng hoàn toàn vào câu đã được AI viết lại.

**Bài học quan trọng nhất:** thêm một bước AI vào pipeline (như query rewriting) **không tự động** làm hệ thống tốt hơn — phải kiểm tra lỗi cụ thể và đo lại bằng số liệu.

### Kết quả demo: RAG cơ bản so với Advanced RAG

| Chỉ số | Ban đầu | Advanced RAG |
|---|---:|---:|
| MRR | 0,7298 | 0,9116 |
| nDCG | 0,7387 | 0,9025 |
| Keyword coverage | 83,8% | ~96% |
| Accuracy (/5) | 3,99 | 4,62 |
| Relevance (/5) | 4,57 | 4,84 |
| Completeness (/5) | 3,85 | 4,35 |

**Lưu ý quan trọng khi đọc bảng này:** đây là kết quả của một bộ test cụ thể, có dao động giữa các lần chạy, và **nhiều thành phần đã được thay đổi cùng lúc** — nên không thể quy toàn bộ mức cải thiện cho riêng một kỹ thuật duy nhất (ví dụ không thể khẳng định chỉ nhờ reranking).

### Những điểm đừng hiểu nhầm

- **MRR 0,91 không có nghĩa 91% câu hỏi đúng ở hạng 1** — đây vẫn là một phép đo trung bình về thứ hạng.
- **Re-ranking chỉ sắp xếp lại các ứng viên đã tìm được** — nó không thể "tìm ra" dữ liệu đã bị bỏ sót hoàn toàn từ đầu.
- **Structured Outputs chỉ đảm bảo đúng hình dạng dữ liệu đầu ra, không đảm bảo nội dung đúng sự thật.**
- **Biểu đồ t-SNE đẹp không chứng minh hệ RAG hoạt động tốt** — nó chỉ là công cụ quan sát.
- **Dùng model mã nguồn mở không đồng nghĩa dữ liệu ở lại máy local** — nếu gọi model đó qua một dịch vụ cloud, dữ liệu vẫn được gửi ra ngoài.

### Chốt ý nghĩa thực tế

Ngày 5 khép lại tuần bằng một thông điệp có thể áp dụng cho mọi hệ thống AI, không riêng RAG: **RAG nâng cao thực chất là tổ chức dữ liệu và tìm kiếm bằng chứng tốt hơn — nhưng muốn biết nó có thực sự tốt hơn hay không, bắt buộc phải đánh giá bằng số liệu, không thể chỉ dựa vào cảm giác.**

---

## 7. Bảng liên kết tài liệu nguồn

| Ngày | Notebook / code | Ghi chú tiếng Việt (Tóm tắt / Đầy đủ) |
|---|---|---|
| Ngày 1 | [day1.ipynb](day1.ipynb) | [RAG_Day_1_Tom_Tat.md](RAG_Day_1_Tom_Tat.md) / [-Day_Du.md](RAG_Day_1_Day_Du.md) |
| Ngày 2 | [day2.ipynb](day2.ipynb) | [RAG_Day_2_Tom_Tat.md](RAG_Day_2_Tom_Tat.md) / [-Day_Du.md](RAG_Day_2_Day_Du.md) |
| Ngày 3 | [day3.ipynb](day3.ipynb) | [RAG_Day_3_Tom_Tat.md](RAG_Day_3_Tom_Tat.md) / [-Day_Du.md](RAG_Day_3_Day_Du.md) |
| Ngày 4 | [evaluator.py](evaluator.py), [evaluation/](evaluation/) | [RAG_Day_4_Tom_Tat.md](RAG_Day_4_Tom_Tat.md) / [-Day_Du.md](RAG_Day_4_Day_Du.md) |
| Ngày 5 | [day4.ipynb](day4.ipynb), [day5.ipynb](day5.ipynb), [day5-EN.ipynb](day5-EN.ipynb), [implementation/](implementation/), [pro_implementation/](pro_implementation/) | [RAG_Day_5_Tom_Tat.md](RAG_Day_5_Tom_Tat.md) / [-Day_Du.md](RAG_Day_5_Day_Du.md) |
| Ứng dụng chạy thử | [app.py](app.py) | — |
| Dữ liệu | [knowledge-base/](knowledge-base/), [vector_db/](vector_db/), [preprocessed_db/](preprocessed_db/) | — |

---

## 8. Các điểm dễ nhầm trong cả tuần

1. **RAG không bắt buộc phải dùng vector database** — tra cứu bằng từ khóa (như Ngày 1) cũng thực hiện đúng nguyên lý RAG, chỉ là kém linh hoạt hơn.
2. **Đưa tài liệu vào prompt không phải là huấn luyện lại model** — model không "ghi nhớ vĩnh viễn", mỗi lượt hỏi phải tìm và gửi lại tài liệu liên quan.
3. **Vector gần nhau chỉ giúp ước lượng mức độ liên quan, không đảm bảo tài liệu đó chứa đáp án đúng.**
4. **Càng nhiều context chưa chắc càng tốt** — quan trọng là *đúng* thông tin, không phải *nhiều* thông tin.
5. **Lịch sử hội thoại có thể "che giấu" một lỗi tìm kiếm thực sự** — luôn kiểm tra bằng một cuộc chat mới, không có lịch sử.
6. **Chỉ gửi lịch sử cho LLM là chưa đủ trong RAG nhiều lượt** — bước tìm kiếm (retriever) cũng cần được cung cấp đủ ngữ cảnh để tìm đúng tài liệu.
7. **Đổi embedding model bắt buộc phải tạo lại toàn bộ vector** ở cả hai phía (tài liệu và câu hỏi) — không thể trộn lẫn vector từ hai model khác nhau.
8. **Các chỉ số như MRR, nDCG, Accuracy là các phép đo có định nghĩa cụ thể** — không nên diễn giải chúng thành "phần trăm câu trả lời đúng" một cách tùy tiện.
9. **Thêm một bước AI vào pipeline (như query rewriting) không tự động cải thiện chất lượng** — luôn phải đo lại sau mỗi thay đổi.
10. **Kết quả của một bộ test cụ thể không tự động áp dụng cho mọi dự án khác** — luôn xây bộ câu hỏi đánh giá riêng, sát với dữ liệu và người dùng thật của mình.

---

## 9. Mục tiêu cuối cùng

Sau khi học xong Week 5, người học có thể:

- Giải thích nguyên lý RAG bằng lời của chính mình: tìm tài liệu liên quan → đưa vào prompt → LLM trả lời dựa trên đó.
- Phân biệt rõ vai trò của embedding model (giúp tìm kiếm) và LLM sinh văn bản (giúp trả lời).
- Tự xây một pipeline hoàn chỉnh: đọc tài liệu → chia chunk → tạo embedding → lưu vector store → truy xuất → sinh câu trả lời.
- Nhận diện và xử lý các lỗi kinh điển khi kết hợp RAG với lịch sử hội thoại nhiều lượt.
- Đánh giá một hệ RAG bằng số liệu cụ thể (MRR, nDCG, keyword coverage, LLM-as-a-Judge) thay vì chỉ dựa vào cảm tính.
- Hiểu ít nhất 3-4 kỹ thuật RAG nâng cao (semantic chunking, query rewriting, reranking...) và biết rằng mỗi cải tiến đều cần được đo lại để xác nhận hiệu quả.
- Áp dụng đúng tư duy cốt lõi cho mọi dự án AI có dữ liệu riêng trong tương lai: **đo → tìm lỗi → thay đổi → đo lại.**
