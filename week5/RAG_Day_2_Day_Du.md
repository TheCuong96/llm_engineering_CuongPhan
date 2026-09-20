# Day 2 — Xây kho tri thức cho RAG: từ tài liệu đến vector

> Bản giảng đầy đủ cho video 007–011. Biên soạn theo toàn bộ phụ đề tiếng Anh đính kèm, diễn giải lại bằng tiếng Việt; không phải bản dịch từng câu hay bản chép nguyên mã nguồn trên màn hình. Các ví dụ tự xây dựng và phần mở rộng được ghi rõ.

## 1. Cả phần học này thực sự muốn dạy điều gì?

**Bạn đang học cách chuẩn bị tài liệu để một ứng dụng AI có thể tìm được những đoạn liên quan đến câu hỏi.** Kết quả chính của buổi học là một kho chứa các đoạn văn cùng vector và thông tin nguồn, có thể dùng cho bước truy xuất của RAG.

Bối cảnh trong bài là trợ lý kiến thức cho công ty bảo hiểm InsureLife. Kho tài liệu gồm thông tin công ty, nhân viên, hợp đồng và sản phẩm. Nếu khách hỏi một điều kiện của sản phẩm, hệ thống cần tìm đoạn mô tả đúng điều kiện đó trước khi nhờ mô hình viết câu trả lời.

Cách đơn giản là tìm những từ xuất hiện trong câu hỏi. Nhưng người hỏi và tài liệu có thể dùng cách diễn đạt khác nhau. Semantic search — tìm kiếm theo ngữ nghĩa — dùng vector để tìm nội dung liên quan về ý nghĩa, kể cả khi không trùng từ hoàn toàn. Đây cũng không chỉ là tìm từ gần giống về mặt chính tả.

Ví dụ tự xây dựng: câu hỏi “Tôi muốn ngừng hợp đồng thì làm sao?” có thể cần đoạn mang tiêu đề “Thủ tục chấm dứt hợp đồng”. Tìm đúng đoạn này quan trọng hơn việc lấy tất cả tài liệu có từ “tôi” hoặc “hợp đồng”.

| Video | Câu hỏi mà bài giải quyết | Điều cần hiểu sau khi học |
| --- | --- | --- |
| 007 — Vectors for RAG | Các thành phần của RAG nối với nhau thế nào? LangChain giúp gì? | Phân biệt công cụ điều phối với các mô hình và kho dữ liệu |
| 008 — Breaking Documents into Chunks | Vì sao và bằng cách nào phải chia tài liệu? | Tạo đoạn có độ dài phù hợp, giữ ngữ cảnh và metadata |
| 009 — Encoder Models vs Vector Databases | Ai tạo vector, ai lưu vector? | Phân biệt lựa chọn embedding model với lựa chọn hạ tầng tìm kiếm |
| 010 — Chroma and t-SNE | Làm sao lưu các đoạn và quan sát vector? | Hiểu dữ liệu trong Chroma và ý nghĩa của biểu đồ 2D |
| 011 — 3D and Comparing Models | Khi đổi embedding model thì điều gì thay đổi? | So sánh biểu diễn ngữ nghĩa và đọc biểu đồ có giới hạn |

**Phạm vi:** 5 video này chủ yếu xây phần chuẩn bị dữ liệu. Cuối bài, giảng viên hẹn buổi sau mới nối thành chatbot RAG có giao diện Gradio, trả lời và hiển thị nguồn. Bạn chưa cần thấy chatbot hoàn chỉnh để hiểu mục tiêu của phần hiện tại.

## 2. Phân biệt hai giai đoạn của RAG

### Giai đoạn A: chuẩn bị kho dữ liệu — trọng tâm hôm nay

1. Đọc tài liệu gốc.
2. Chia tài liệu thành các chunk — đoạn nhỏ.
3. Dùng embedding model tạo vector cho từng chunk.
4. Lưu vector, nội dung chunk và metadata vào kho tìm kiếm.

Quá trình này còn gọi là indexing — lập chỉ mục. Khi tài liệu thay đổi, cập nhật phần dữ liệu tương ứng; không cần làm lại toàn bộ kho cho mỗi câu hỏi.

### Giai đoạn B: xử lý câu hỏi — để hiểu dữ liệu đã chuẩn bị sẽ dùng thế nào

1. Dùng mô hình embedding tương thích với kho để biến câu hỏi thành vector.
2. Tìm các vector gần với vector câu hỏi theo phép đo đã chọn.
3. Lấy **văn bản gốc của những chunk tìm được**.
4. Ghép các đoạn này cùng câu hỏi và hướng dẫn thành prompt.
5. Mô hình sinh văn bản đọc prompt và viết câu trả lời.

Chú ý: mô hình trả lời thường nhận văn bản được truy xuất, không nhận danh sách hàng nghìn số để tự giải mã thành tài liệu. Vector giúp tìm đường đến văn bản. Tạo embedding cũng không phải huấn luyện lại mô hình trả lời để nó ghi nhớ tài liệu.

## 3. Video 007 — LangChain đóng vai trò gì?

LangChain là framework cung cấp những thành phần để ghép các bước của ứng dụng LLM. Trong bài, nó hỗ trợ đọc file, biểu diễn tài liệu, chia đoạn, gọi embedding model và làm việc với Chroma.

Với nền tảng lập trình web, bạn có thể liên tưởng đến các adapter cùng tuân theo một interface: phần ứng dụng gọi thao tác chung, còn adapter xử lý cách giao tiếp với từng dịch vụ. Đây là phép liên tưởng về tổ chức code, không có nghĩa LangChain và framework web làm cùng một việc.

| Thành phần xuất hiện trong bài | Vai trò |
| --- | --- |
| Document loader — bộ đọc tài liệu | Đọc file và tạo đối tượng tài liệu |
| Text splitter — bộ chia văn bản | Tạo các chunk từ tài liệu |
| Embedding wrapper — lớp tích hợp embedding | Gọi mô hình chuyển văn bản thành vector |
| Vector store integration — tích hợp kho vector | Ghi dữ liệu, tìm các đoạn liên quan |
| LangGraph | Công cụ liên quan trong hệ sinh thái để tổ chức luồng agent; không phải trọng tâm buổi này |
| LangSmith | Công cụ quan sát và đánh giá ứng dụng; không phải kho vector |

Giảng viên đưa ra cả ưu và nhược điểm của LangChain:

| Ưu điểm | Đánh đổi |
| --- | --- |
| Có sẵn thành phần, dựng pipeline nhanh | Phải học thêm abstraction, thuật ngữ và cách tổ chức |
| Có nhiều tích hợp với mô hình và nguồn dữ liệu | Nhiều package và dependency hơn |
| Có thể tái sử dụng cách gọi chung | Một lời gọi ngắn có thể che nhiều bước bên trong, khiến người mới khó hiểu |

Bài nhắc các package như `langchain_openai`, `langchain_chroma`, `langchain_huggingface`, `langchain_community` và `langchain_text_splitters`. Bạn nên nhớ **chức năng của nhóm**, chưa cần thuộc tất cả import.

Nhận xét “framework nặng”, “có công cụ nhẹ hơn” là đánh giá của giảng viên trong bối cảnh khóa học. RAG không bắt buộc dùng LangChain; một ứng dụng đơn giản có thể tự nối SDK mô hình với lớp truy xuất dữ liệu. Các phát biểu về mức độ phổ biến, phiên bản mới hoặc giá rẻ trong video không nên hiểu là thông tin cập nhật hiện tại.

## 4. Video 008 — Vì sao phải chia tài liệu thành chunk?

### Vấn đề của một vector cho cả tài liệu

Một tài liệu dài có thể nói về nhiều chủ đề. Nếu biểu diễn toàn bộ bằng một vector, một chi tiết nhỏ mà người dùng hỏi có thể bị hòa vào nội dung chung.

Ví dụ tự xây dựng: một hợp đồng gồm phạm vi bảo hiểm, mức phí, thanh toán và chấm dứt hợp đồng. Câu hỏi về chấm dứt chỉ cần một phần. Chia thành các đoạn hợp lý giúp tìm đúng phần đó và giảm lượng văn bản phải gửi cho mô hình trả lời.

Chunk là một phần nội dung gốc; **không tự động là bản tóm tắt**. Bộ chia văn bản trong bài không gọi LLM để viết lại từng đoạn.

### Dữ liệu và kết quả cụ thể trong buổi học

| Hạng mục | Số liệu giảng viên trình bày |
| --- | --- |
| Số file Markdown | 76 |
| Tổng ký tự | Khoảng 300.000 |
| Tổng token được đếm trong notebook | Gần 64.000 |
| `chunk_size` chính | 1.000 ký tự |
| `chunk_overlap` | 200 ký tự |
| Kết quả với cấu hình chính | 413 chunk |
| Khi giảm kích thước xuống 800 | 532 chunk |

Đây là số liệu của bộ tài liệu và cấu hình trong video, không phải kết quả cố định với mọi dữ liệu. Con số token phụ thuộc tokenizer; không suy ra một tỷ lệ ký tự/token chung từ ví dụ này.

Giảng viên chỉ ra kho mẫu còn đủ nhỏ để đưa toàn bộ vào context của một số mô hình trong bài. Tuy vậy, việc lặp lại toàn bộ tài liệu cho mỗi câu hỏi có chi phí và không mở rộng vô hạn khi dữ liệu tăng. RAG giúp chọn phần cần thiết, nhưng vẫn cần kiểm tra có lấy thiếu thông tin hay không.

### Document và metadata là gì?

Một đối tượng `Document` có hai phần đáng nhớ:

```json
{
  "page_content": "Nội dung văn bản của tài liệu hoặc một chunk",
  "metadata": {
    "source": "knowledge-base/products/example.md",
    "doc_type": "products"
  }
}
```

Ví dụ trên chỉ minh họa cấu trúc. `page_content` là nội dung để đọc hoặc tạo embedding. `source` giúp truy ngược file gốc. `doc_type` là loại tài liệu, lấy từ thư mục trong bài: `company`, `contracts`, `employees`, `products`.

Sau khi chia, các chunk vẫn cần thông tin nguồn. Nếu chỉ lưu số vector, bạn sẽ khó lấy đúng văn bản, giải thích nguồn và kiểm tra vì sao hệ thống trả lời như vậy.

### RecursiveCharacterTextSplitter hoạt động ra sao?

“Recursive” nghe phức tạp nhưng ý tưởng là: **ưu tiên chia ở ranh giới lớn; nếu phần đó vẫn quá dài thì tiếp tục chia ở ranh giới nhỏ hơn**. Bài mô tả ưu tiên chỗ xuống dòng kép, xuống dòng đơn rồi khoảng trắng. Không nên hiểu đây là một mô hình hiểu và phân tích ngữ pháp từng câu.

Hai tham số chính:

- `chunk_size`: kích thước mục tiêu hoặc giới hạn theo cách đo được cấu hình; bài đang đo bằng ký tự.
- `chunk_overlap`: lượng nội dung chồng lặp nhằm giảm mất ngữ cảnh tại ranh giới. Lượng lặp thực tế còn phụ thuộc cách bộ chia ghép các đoạn.

Ví dụ tự xây dựng: câu “Có thể chấm dứt hợp đồng” nằm cuối chunk A, còn “sau khi hoàn thành các khoản thanh toán còn thiếu” nằm đầu chunk B. Nếu chỉ lấy A, mô hình có thể bỏ sót điều kiện. Overlap giúp giảm khả năng tách rời hai ý, nhưng không bảo đảm mọi câu trả lời luôn nằm gọn trong một chunk.

| Cách chia | Lợi ích có thể có | Rủi ro |
| --- | --- | --- |
| Chunk nhỏ | Tìm chi tiết tập trung hơn | Thiếu điều kiện, tiêu đề hoặc chủ thể |
| Chunk lớn | Giữ nhiều ngữ cảnh hơn | Nhiều ý lẫn nhau, tốn context |
| Overlap nhiều | Giảm đứt ngữ cảnh ở ranh giới | Tăng dữ liệu trùng, có thể lấy nhiều kết quả gần như giống nhau |

Không có cấu hình đúng cho mọi bộ tài liệu. `1000/200` là điểm xuất phát trong bài, không phải công thức cần áp dụng máy móc.

**Bổ sung cần biết:** độ dài đầu vào của embedding model là giới hạn riêng. Model card của `all-MiniLM-L6-v2` cho biết mặc định văn bản dài hơn 256 word pieces bị cắt bớt. Vì vậy 1.000 ký tự không tự bảo đảm toàn bộ chunk được mô hình đọc, đặc biệt khi ngôn ngữ thay đổi. [Nguồn: model card chính thức](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2).

## 5. Video 009 — Embedding model và vector store khác nhau thế nào?

**Embedding model quyết định cách văn bản được biểu diễn bằng số; vector store tổ chức lưu trữ và tìm kiếm trên biểu diễn đó.**

| Thành phần | Đầu vào | Đầu ra hoặc nhiệm vụ |
| --- | --- | --- |
| Embedding model — mô hình nhúng | Văn bản | Một vector, ví dụ danh sách 384 số |
| Vector store — kho vector | Vector, văn bản, metadata | Lưu và tìm những mục gần vector truy vấn |
| Generative model — mô hình sinh | Câu hỏi và các đoạn tham khảo | Câu trả lời bằng ngôn ngữ tự nhiên |
| LangChain | Các thành phần và cấu hình | Nối các thao tác thành luồng xử lý |

GPT-4.1 nano được nhắc trong notebook là mô hình phục vụ sinh câu trả lời trong bối cảnh bài. Nó không phải tên của embedding model đang tạo vector cho Chroma.

### “384 chiều” nghĩa là gì?

Một vector 384 chiều có 384 giá trị số. Mỗi chunk được ánh xạ thành một vector như vậy, dù số từ của các chunk khác nhau.

Không hiểu 384 chiều là 384 từ, 384 tài liệu hay context window 384 token. Cũng không nên gán từng chiều thành một nhãn cố định như “chiều 1 = nhân viên”. Những đặc trưng này được mô hình học, thường phân bố trên nhiều chiều.

Bài nhắc word2vec và BERT để đặt nền lịch sử; phần thực hành dùng mô hình embedding có sẵn. BERT là nền tảng encoder, không có nghĩa lấy bất kỳ đầu ra BERT nào cũng sẽ có chất lượng tìm kiếm câu tốt như mô hình được huấn luyện chuyên cho sentence embeddings.

### Chọn mô hình khác với chọn database

| Quyết định | Những câu hỏi nên đặt ra |
| --- | --- |
| Embedding model | Có biểu diễn tốt ngôn ngữ, thuật ngữ và loại câu hỏi của mình? Giới hạn đầu vào? Độ trễ và chi phí? |
| Vector store | Lưu được bao nhiêu dữ liệu? Lọc metadata thế nào? Tốc độ, vận hành, phân quyền, sao lưu và khả năng mở rộng? |

Video dùng Chroma. FAISS được giới thiệu như công cụ tìm kiếm tương tự trên vector: nên hiểu nó là thư viện tìm kiếm/index, không đồng nhất với một database hoàn chỉnh. Bài còn nhắc Pinecone, Weaviate và khả năng tìm vector trong hệ sinh thái PostgreSQL, MongoDB, Elasticsearch. Bạn không cần học hết những lựa chọn này để hiểu buổi học.

Thông điệp của giảng viên là hãy quan tâm chất lượng embedding thay vì chỉ hỏi “database nào tốt nhất”. Tuy nhiên, chất lượng truy xuất cũng chịu ảnh hưởng của thuật toán index, phép đo tương tự, bộ lọc và cấu hình tìm kiếm; đổi database không phải lúc nào cũng chỉ đổi tốc độ.

## 6. Video 010 — Tạo Chroma và hiểu dữ liệu bên trong

Trong bài, giảng viên tạo đối tượng embedding dùng `sentence-transformers/all-MiniLM-L6-v2`, rồi truyền nó cùng các chunk cho thao tác tạo kho Chroma.

Một lời gọi ngắn nhìn giống “Chroma tạo mọi thứ”, nhưng về mặt trách nhiệm có các bước sau:

1. Lớp tích hợp lấy văn bản của từng chunk.
2. Gọi embedding model để tính vector.
3. Ghi vector, nội dung và metadata vào Chroma.
4. Lưu dữ liệu tại thư mục được cấu hình để dùng lại.

Đây là lý do giảng viên lặp nhiều lần “Chroma không tạo vector”: một hệ thống có thể tự gọi hàm embedding giúp bạn, nhưng mô hình embedding vẫn là thành phần thực hiện phép chuyển đổi ngữ nghĩa.

Kết quả trong bài là **413 vector, mỗi vector 384 chiều**. Collection là nhóm bản ghi trong Chroma, có thể liên tưởng tới một collection trong database. 413 là số chunk; 384 là độ dài vector. Hai con số mô tả hai thuộc tính hoàn toàn khác nhau.

Một bản ghi có thể hình dung như sau; vector bên dưới được rút ngắn để dễ nhìn, không phải kết quả tính thật:

```json
{
  "id": "chunk-001",
  "document": "Đoạn nội dung gốc...",
  "embedding": [0.12, -0.08, 0.31],
  "metadata": {"source": "products/example.md", "doc_type": "products"}
}
```

Trong demo, giảng viên xóa kho cũ rồi tạo lại để thử nghiệm từ đầu. Với dự án thật, nên dùng collection hoặc thư mục riêng cho từng thử nghiệm, có quy tắc cập nhật và chống trùng; không sao chép bước xóa toàn bộ vào luồng chạy thường xuyên.

### Mã giả để đọc xuyên qua các lớp thư viện

```text
# Đây là mã giả mô tả trách nhiệm, không phải API chạy trực tiếp.
documents = load_documents(folder)
chunks = split_documents(documents, size=1000, overlap=200)

for chunk in chunks:
    vector = embedding_model.encode(chunk.text)
    vector_store.save(vector, chunk.text, chunk.metadata)

# Giai đoạn hỏi đáp, được nối hoàn chỉnh ở buổi sau:
question_vector = embedding_model.encode(question)
matched_chunks = vector_store.search(question_vector, top_k=4)
answer = chat_model.generate(question, context=matched_chunks.text)
```

`top_k=4` ở đây là ví dụ bổ sung, không phải kết quả hay cấu hình được xác nhận từ video. Ý nghĩa là lấy bốn kết quả đứng đầu, không phải bốn kết quả chắc chắn đúng.

## 7. Video 010–011 — Biểu đồ 2D và 3D đang cho bạn thấy gì?

Một vector có 384 hoặc hàng nghìn chiều không thể được hiển thị trực tiếp như tọa độ thông thường. Bài dùng **t-SNE — kỹ thuật giảm chiều để trực quan hóa** — tạo tọa độ 2D hoặc 3D từ các vector đó.

| Thành phần trên biểu đồ | Cách đọc |
| --- | --- |
| Một điểm | Một chunk |
| Màu điểm | Loại tài liệu được lấy từ metadata |
| Nội dung khi hover | Văn bản chunk để kiểm tra ý nghĩa |
| Trục X/Y/Z | Tọa độ của phép giảm chiều, không phải những thuộc tính đặt tên sẵn |
| Một nhóm điểm | Gợi ý về quan hệ trong dữ liệu, cần đọc nội dung để xác minh |

Trong bài, embedding được tạo từ nội dung chunk. Nhãn `doc_type` được dùng để tô màu; không phải tác giả huấn luyện lại mô hình bằng bốn nhãn đó. Vì vậy, việc nhiều đoạn nhân viên tập trung gần nhau là một quan sát thú vị: biểu diễn từ văn bản có liên hệ với các nhóm tài liệu vốn có.

Biểu đồ 3D cho phép xoay, zoom và nhìn các điểm bị che ở góc nhìn khác. Đổi số chiều hiển thị từ 2 sang 3 không làm embedding model tốt hơn, cũng không biến vector được lưu trong kho thành vector ba chiều.

### Giới hạn phải hiểu để không đọc sai biểu đồ

**Bổ sung làm rõ:** t-SNE ưu tiên thể hiện cấu trúc lân cận, không bảo toàn toàn bộ khoảng cách của không gian ban đầu. Hai cụm ở xa nhau trên hình không đủ để suy ra mức khác biệt ngữ nghĩa chính xác. Cấu hình và khởi tạo có thể làm hình thay đổi; cố định `random_state` hỗ trợ tái lập trong điều kiện tương ứng. [Nguồn: tài liệu scikit-learn về t-SNE](https://scikit-learn.org/stable/modules/manifold.html#t-sne).

Vì vậy, dùng hình để đặt câu hỏi: “Tại sao chunk này nằm lẫn sang nhóm khác?” Sau đó đọc văn bản và kiểm tra truy xuất. Không dùng vị trí trái/phải hoặc cụm trông đẹp để chấm điểm chất lượng RAG.

Vector đầy đủ vẫn được dùng để tìm kiếm trong quy trình của bài. Tọa độ 2D/3D là dữ liệu phục vụ quan sát.

## 8. Video 011 — Đổi embedding model thì điều gì thay đổi?

Giảng viên giữ cùng bộ chunk nhưng thay mô hình và tạo lại vector:

| Mô hình trong lần chạy minh họa | Số chiều được hiển thị trong video |
| --- | --- |
| `sentence-transformers/all-MiniLM-L6-v2` | 384 |
| `text-embedding-3-small` | 1.536 |
| `text-embedding-3-large` | 3.072 |

Đây là các kích thước quan sát trong cấu hình của bài, không phải lời khẳng định mọi cấu hình của một model luôn có cùng kích thước đầu ra.

Nội dung chunk và loại tài liệu vẫn như cũ. Những thứ thay đổi là vector biểu diễn nội dung, số chiều trong thử nghiệm và hình phân bố sau giảm chiều. Điều này minh họa rõ rằng cách biểu diễn đến từ mô hình embedding.

Giảng viên nhận xét các mô hình OpenAI làm các nhóm tách rõ hơn trong ví dụ. Nên hiểu đó là **quan sát của demo**, không phải benchmark chứng minh thứ hạng tổng quát. Số chiều nhiều hơn cũng không tự bảo đảm truy xuất tốt hơn.

Một số chunk sản phẩm nằm gần chunk hợp đồng vì hợp đồng cũng nói về tính năng sản phẩm. Điều đó có thể hợp lý. Mục tiêu tìm kiếm là lấy thông tin giúp trả lời câu hỏi, không phải buộc mọi điểm cùng màu vào một vùng hoàn toàn tách biệt.

**Bổ sung khi triển khai:** khi đổi embedding model, cần tạo lại embedding của tài liệu trong kho tương ứng và dùng cách mã hóa câu hỏi tương thích. Hai model có cùng số chiều vẫn có thể tạo hai không gian không tương thích. Không chỉ đổi model cho câu hỏi rồi tìm trên vector cũ. Với mô hình có chế độ query/document riêng, cần dùng đúng cặp chế độ mà mô hình yêu cầu.

## 9. Nên thực hành thế nào để thật sự hiểu? — Phần bổ sung

Bạn có thể thử bằng tài liệu kỹ thuật quen thuộc như đăng nhập, refresh token, upload ảnh và thông báo. Đây là bộ ví dụ tự xây dựng, không phải dữ liệu bảo hiểm của video.

1. Chọn một nhóm tài liệu nhỏ; xác định nguồn và loại của từng file.
2. Chia thành chunk rồi đọc vài chunk, nhất là chỗ ranh giới. Kiểm tra còn biết đoạn đang nói về chức năng nào không.
3. Viết 10 câu hỏi với đoạn nguồn mong đợi. Ví dụ: “Access token hết hạn thì xử lý thế nào?” cần đoạn giải thích refresh flow.
4. Tạo embedding và lập kho, sau đó kiểm tra các chunk được lấy về trước khi nối mô hình trả lời.
5. Thay một yếu tố mỗi lần: kích thước chunk hoặc embedding model. Giữ các yếu tố còn lại tương đương.
6. Xem cấu hình nào lấy đúng và đủ thông tin với độ trễ, chi phí chấp nhận được.

Một phép đo nhập môn: trong 10 câu hỏi, có bao nhiêu câu lấy được ít nhất một đoạn đúng trong top 4? Đây là tỷ lệ tìm trúng đơn giản, chưa phải đánh giá đầy đủ; câu hỏi cần nhiều bằng chứng còn phải kiểm tra lấy đủ các đoạn cần thiết.

Với tài liệu tiếng Việt, cần kiểm tra model bằng câu hỏi tiếng Việt thực tế. Thành công trên dữ liệu tiếng Anh của giảng viên không tự chứng minh chất lượng cho kho tiếng Việt.

## 10. Tự kiểm tra sau khi đọc

| Câu hỏi | Câu trả lời cần nắm |
| --- | --- |
| Vì sao có 76 file nhưng 413 vector? | Mỗi file được chia thành nhiều chunk; lần chạy này tạo một vector cho mỗi chunk |
| Chroma có quyết định vector dài 384 số không? | Độ dài đến từ mô hình/cấu hình embedding được dùng |
| Overlap có làm mô hình học thêm không? | Không; nó lặp một phần văn bản giữa các chunk để giảm đứt ngữ cảnh |
| Biểu đồ 3D có thay kho thành vector 3 chiều không? | Không; đó là biểu diễn để quan sát |
| Vì sao giữ lại văn bản khi đã có vector? | Để trả về nội dung làm context và kiểm tra nguồn |
| Có cần gửi toàn bộ kho trong mỗi câu hỏi không? | Luồng RAG này chỉ lấy các đoạn liên quan |
| Model có biểu đồ đẹp nhất chắc chắn tốt nhất? | Không; cần đánh giá truy xuất trên câu hỏi thực tế |
| Học hết phần này đã xong chatbot chưa? | Chưa; phần này chuẩn bị kho và quan sát embedding, chatbot hoàn chỉnh được giới thiệu cho buổi sau |

## Nguồn và phạm vi biên soạn

Nguồn chính là toàn bộ năm phụ đề tiếng Anh đi kèm video 007–011: *Vectors for RAG Introduction to LangChain and Vector Databases*; *Breaking Documents into Chunks with LangChain Text Splitters*; *Encoder Models vs Vector Databases OpenAI, BERT, Chroma & FAISS*; *Creating Vector Stores with Chroma and Visualizing Embeddings with t-SNE*; *3D Vector Visualizations and Comparing Embedding Models*.

Các tên bị nhận dạng sai trong lời nói được chuẩn hóa thành LangChain, Chroma, FAISS và all-MiniLM-L6-v2. Một chỗ phụ đề nói nhầm 304 chiều; bảng dùng 384, nhất quán với phần đếm vector và model card. Các con số của demo là kết quả giảng viên trình bày, không phải kết quả tôi chạy lại. Các giới hạn kỹ thuật bổ sung có nguồn ngay tại đoạn liên quan.
