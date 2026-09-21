# Day 3 — Xây dựng chatbot RAG và hiểu vì sao nó trả lời sai

> Bản giảng đầy đủ cho 5 video 012–016. Tài liệu dựa trên toàn bộ phụ đề tiếng Anh được cung cấp, có đối chiếu các thuật ngữ và ví dụ với phụ đề tiếng Việt. Đây là bài giảng viết lại theo logic dễ học, không phải bản dịch từng câu hay bản chép mã nguồn trên màn hình. Các phần mở rộng được ghi rõ là **Giải thích bổ sung**.

## 1. Cả phần này muốn dạy bạn điều gì?

**Mục tiêu: biến kho tài liệu đã được lập chỉ mục thành một chatbot có thể tìm thông tin, trả lời câu hỏi và cho bạn xem những đoạn tài liệu đã được sử dụng.**

Ở phần trước, bạn đã chuẩn bị “kho tra cứu”: đọc tài liệu → chia đoạn → tạo vector → lưu vào Chroma. Nhưng có kho dữ liệu chưa đồng nghĩa với có chatbot. Phần này hoàn thiện nửa còn lại: nhận câu hỏi → tìm đoạn liên quan → đưa chúng cho LLM → trả câu trả lời qua giao diện.

Ví dụ xuyên suốt video là trợ lý hỏi đáp về công ty Insurellm. Người dùng hỏi “Avery là ai?”, hệ thống tìm hồ sơ liên quan rồi nhờ LLM diễn đạt thông tin thành câu trả lời.

**Bạn đang xây ứng dụng sử dụng mô hình có sẵn.** Các video không huấn luyện một mô hình như ChatGPT từ đầu, cũng không làm cho mô hình ghi nhớ vĩnh viễn tài liệu công ty. Mỗi lượt hỏi, ứng dụng lại chọn một ít tài liệu để cung cấp cho mô hình.

| Video | Nội dung chính | Điều cần hiểu sau khi học |
| --- | --- | --- |
| 012 | Ôn luồng RAG, giới thiệu LangChain, LLM và retriever | Thành phần nào tìm tài liệu, thành phần nào viết câu trả lời? |
| 013 | Nạp Chroma, chọn embedding, tạo retriever và LLM; giải thích temperature | Vì sao embedding lúc truy vấn phải tương thích với lúc lập chỉ mục? |
| 014 | Nối retriever với LLM, tạo hàm trả lời và giao diện Gradio | RAG thực sự xảy ra ở bước đưa tài liệu tìm được vào prompt |
| 015 | Tách notebook thành module; thêm lịch sử hội thoại | Vì sao lịch sử phải được xử lý ở cả tìm kiếm lẫn tạo câu trả lời? |
| 016 | Thử giao diện có hiển thị nguồn, phát hiện lỗi chunking và đổi chủ đề | RAG chạy được chưa có nghĩa là trả lời tốt trong mọi tình huống |

## 2. Phân biệt các thành phần trước khi nhìn code

Hãy hình dung một trợ lý được phép mở tài liệu trước khi trả lời:

| Thành phần | Vai trò | Không nên hiểu nhầm thành |
| --- | --- | --- |
| Knowledge base — kho tri thức | Các tài liệu gốc: nhân viên, sản phẩm… | Bộ nhớ đã được huấn luyện vào LLM |
| Chunk — đoạn tài liệu | Một phần văn bản được tách ra để lập chỉ mục và tìm kiếm | Luôn là một đơn vị thông tin hoàn chỉnh |
| Embedding model — mô hình biểu diễn vector | Chuyển văn bản thành vector phục vụ so sánh độ tương đồng | Mô hình viết câu trả lời |
| Chroma — kho vector | Lưu và tìm các vector cùng dữ liệu liên quan | Mô hình tự hiểu và trả lời câu hỏi |
| Retriever — bộ truy xuất | Nhận truy vấn, dùng cấu hình embedding/kho dữ liệu để lấy các đoạn liên quan | Chatbot hoàn chỉnh |
| LLM — mô hình ngôn ngữ tạo sinh | Đọc câu hỏi và ngữ cảnh được gửi đến, tạo câu trả lời | Thành phần tự biết vị trí kho Chroma |
| LangChain | Cung cấp các lớp và giao diện để kết nối thành phần | Điều kiện bắt buộc để làm RAG |
| Gradio | Tạo giao diện, nhận câu hỏi và gọi hàm xử lý | Nơi tự động bổ sung tri thức hoặc trí nhớ cho LLM |

Nếu quen frontend: Gradio giống phần giao diện chat; hàm `answer_question` giống lớp điều phối xử lý yêu cầu; retriever giống dịch vụ tìm kiếm; LLM giống dịch vụ tạo nội dung. LangChain giúp gọi các thành phần qua giao diện tương đối thống nhất.

Trong video, cả retriever và LLM đều có phương thức `invoke()`. Cùng tên phương thức nhưng kết quả khác nhau:

- `retriever.invoke(question)` trả về các đối tượng tài liệu.
- `llm.invoke(messages)` trả về phản hồi của mô hình.

**Có cùng phương thức không có nghĩa là hai đối tượng tự liên kết với nhau.** Chính code của bạn phải chuyển kết quả tìm kiếm sang đầu vào của LLM.

## 3. RAG có hai luồng riêng

### Luồng A: Ingestion — chuẩn bị dữ liệu

Thực hiện khi tạo kho dữ liệu hoặc cần cập nhật tài liệu:

1. Đọc các tài liệu gốc.
2. Chia tài liệu thành các chunk.
3. Dùng embedding model tạo vector cho mỗi chunk.
4. Lưu vector, nội dung và metadata liên quan vào Chroma.

Trong cấu hình được nhắc lại ở video, `chunk_size = 1000` và `chunk_overlap = 200`, tính theo **ký tự**, không phải token. Overlap là phần nội dung lặp giữa hai đoạn lân cận để giảm nguy cơ mất ý tại chỗ cắt; nó không bảo đảm mọi đoạn đều đầy đủ ngữ cảnh.

Lần chạy ingestion trong video 015 tạo **413 vector, mỗi vector 384 chiều**. Đây là kết quả với dữ liệu và cấu hình của giảng viên, không phải con số bắt buộc cho mọi dự án.

### Luồng B: Hỏi đáp — chạy mỗi khi có câu hỏi

1. Nhận câu hỏi và lịch sử hội thoại nếu có.
2. Tạo truy vấn tìm kiếm phù hợp.
3. Chuyển truy vấn thành vector và tìm các chunk gần nó trong Chroma.
4. Lấy **văn bản của các chunk** làm context — ngữ cảnh.
5. Gửi chỉ dẫn, context, lịch sử và câu hỏi cho LLM.
6. Nhận câu trả lời và hiển thị trên giao diện.

Điểm thường gây nhầm: trong pipeline này, **vector phục vụ tìm kiếm; văn bản tìm được mới được đưa vào prompt để LLM đọc**. Bạn không gửi thẳng 413 vector cho LLM để nó tự tìm câu trả lời.

## 4. Thiết lập embedding, retriever và LLM đúng cách

### Embedding khi tìm kiếm phải tương thích với embedding đã lưu

Video 013 dùng lại `all-MiniLM-L6-v2` để khớp với kho dữ liệu được tạo bằng mô hình đó. Nếu bạn đã lập chỉ mục bằng một embedding model khác, cần dùng cấu hình tương ứng khi truy vấn hoặc tạo lại chỉ mục.

Có thể hiểu các embedding model như những hệ tọa độ khác nhau. Không thể lấy tọa độ trong hệ A so trực tiếp với tọa độ trong hệ B rồi mặc định rằng khoảng cách còn có ý nghĩa.

**Giải thích bổ sung:** khác số chiều có thể gây lỗi rõ ràng; cùng số chiều nhưng khác mô hình vẫn có thể cho kết quả tìm kiếm sai. Số chiều khớp là chưa đủ. Với pipeline trong bài, hãy giữ cùng mô hình và cấu hình embedding giữa ingestion và truy vấn.

Đổi **LLM tạo câu trả lời** thường không buộc phải tạo lại vector. Đổi **embedding model** thì phải xem lại chỉ mục vì biểu diễn dùng cho tìm kiếm đã thay đổi.

### `k` là số chunk muốn lấy

Ở lần thử trong notebook, retriever trả về 4 đoạn. Trong module sau đó, giảng viên đặt `k = 5` để lấy 5 đoạn cho prompt.

`k` không phải số câu trả lời hoặc số tài liệu gốc: nhiều chunk có thể đến từ cùng một tài liệu.

**Giải thích bổ sung:** tăng `k` có thể giúp lấy thêm thông tin bị thiếu, nhưng cũng đưa thêm nội dung không liên quan và làm prompt dài hơn. Cần kiểm tra bằng câu hỏi thực tế, không mặc định càng lớn càng tốt.

### Temperature — mức độ biến thiên khi sinh nội dung

LLM tạo ra phân bố khả năng cho token tiếp theo. Temperature điều chỉnh cách lấy mẫu từ phân bố đó; đây không phải nút “tăng kiến thức”.

- Temperature thấp thường làm cách diễn đạt ít biến thiên hơn.
- Temperature cao có thể làm đầu ra đa dạng hơn, nhưng không đồng nghĩa với chính xác hơn hoặc sáng tạo tốt hơn.
- Temperature bằng 0 không bảo đảm mọi lần gọi cho kết quả giống hệt nhau.

Giảng viên chọn 0 cho ví dụ hỏi đáp. Bài học quan trọng là: muốn câu trả lời theo phong cách nào, hãy chỉ dẫn rõ bằng prompt; muốn hệ thống biết thông tin nào, hãy cung cấp đúng context. **Giảm temperature không sửa được lỗi lấy nhầm hồ sơ.**

## 5. Nối retriever với LLM: đây mới là RAG

Video 014 thử riêng hai đối tượng với câu “Avery là ai?”:

- Retriever trả về những chunk liên quan đến Avery.
- LLM được hỏi trực tiếp chỉ đưa câu trả lời chung về cái tên đó, vì chưa được nhận hồ sơ công ty.

Sau khi nối chúng lại, LLM có thể trả lời về Avery Lancaster, người đồng sáng lập và CEO trong dữ liệu minh họa.

Dưới đây là **mã giả Python để hiểu luồng**, không phải mã nguồn chép nguyên từ video hoặc ứng dụng có thể chạy độc lập:

```python
def answer_question(question):
    documents = retriever.invoke(question)
    context = "\n\n".join(doc.page_content for doc in documents)

    system_prompt = build_prompt(
        instructions="Dùng thông tin được cung cấp; nếu không biết thì nói rõ.",
        context=context,
    )

    response = llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=question),
    ])
    return response.content
```

Mỗi dòng có một nhiệm vụ:

1. **Retrieve:** lấy các đoạn có khả năng liên quan.
2. **Format:** ghép nội dung của chúng thành context.
3. **Augment:** bổ sung context vào chỉ dẫn gửi cho mô hình.
4. **Generate:** gọi LLM với context và câu hỏi.
5. **Return:** lấy nội dung phản hồi để hiển thị.

Câu “RAG chỉ cần vài dòng code” nói về phần nối các thành phần đã được chuẩn bị. Nó không bao gồm toàn bộ công việc tạo dữ liệu, cài đặt, giao diện, xử lý lỗi và đánh giá chất lượng.

Video cũng thử tên viết sai và vẫn tìm được thông tin. Điều này minh họa lợi ích của tìm kiếm theo biểu diễn ngữ nghĩa, **không chứng minh mọi lỗi chính tả hoặc mọi tên riêng đều được xử lý đúng**.

Khi gắn hàm vào Gradio, giao diện sẽ gọi callback với câu hỏi và lịch sử. Nhận tham số `history` nhưng không dùng nó thì chatbot vẫn chưa có khả năng theo dõi hội thoại.

## 6. Từ notebook sang các module dễ bảo trì

Video 015 chuyển code thử nghiệm sang các file có trách nhiệm rõ ràng:

| File trong bài | Trách nhiệm |
| --- | --- |
| `implementation/ingest.py` | Đọc tài liệu, chia đoạn, tạo embedding, lưu Chroma |
| `implementation/answer.py` | Tìm context, xử lý câu hỏi và lịch sử, gọi LLM |
| `app.py` | Hiển thị Gradio và gọi phần xử lý trả lời |

Hai hàm chính được giới thiệu trong phần trả lời là `fetch_context` và `answer_question`. Mục đích là có thể thay cách tìm kiếm hoặc tạo câu trả lời mà vẫn dùng lại giao diện.

Các lệnh dưới đây thuộc cấu trúc dự án khóa học, cần có source và môi trường của khóa học mới chạy được:

```bash
# Bắt đầu tại thư mục week5 của dự án khóa học
cd implementation
uv run ingest.py
cd ..
uv run app.py
```

Ingestion và chạy giao diện là hai việc riêng. Không cần tạo lại toàn bộ vector cho mỗi câu hỏi.

Trong demo, script ingestion xóa kho Chroma cũ rồi tạo lại. **Giải thích bổ sung:** cách này tiện cho thực hành, nhưng khi áp dụng vào dữ liệu thật cần quyết định rõ việc cập nhật và giữ dữ liệu; không nên vô tình coi nó là cơ chế cập nhật tăng dần.

Tên video có “Production”, nhưng phần được trình bày chủ yếu là tổ chức lại code để dễ phát triển. Chỉ tách thành module chưa đủ chứng minh hệ thống đã đáp ứng mọi yêu cầu vận hành thực tế.

## 7. Lịch sử hội thoại phải giải quyết hai vấn đề khác nhau

Giả sử người dùng nói:

> Người dùng: Avery là ai?  
> Trợ lý: Avery Lancaster là…  
> Người dùng: Lương của cô ấy là bao nhiêu?

### Vấn đề A: LLM không biết “cô ấy” là ai

Nếu chỉ gửi câu cuối, mô hình không tự nhớ lượt gọi trước. Giao diện còn hiển thị hội thoại không có nghĩa LLM đã nhận được hội thoại đó.

Cách sửa trong video: chuyển lịch sử sang định dạng message mà LangChain sử dụng rồi gửi theo thứ tự:

1. System message chứa chỉ dẫn và context.
2. Các lượt người dùng/trợ lý trước đó.
3. Câu hỏi mới.

Hàm `convert_to_messages` được dùng để chuyển đổi định dạng. **Chuyển định dạng không phải tóm tắt lịch sử hay tự suy ra truy vấn tốt hơn.**

### Vấn đề B: Retriever cũng không biết “cô ấy” là ai

Ngay cả khi LLM nhận đầy đủ lịch sử, retriever vẫn có thể chỉ nhận câu “Lương của cô ấy là bao nhiêu?”. Truy vấn thiếu tên nên có thể lấy hồ sơ người khác.

Video 016 cho thấy bản đơn giản trả lời về lương của **Samantha Green** dù cuộc trò chuyện đang nói về Avery. Nguyên nhân không chỉ là LLM; dữ liệu truy xuất đã lệch đối tượng.

Cách sửa trong module của bài: ghép các câu **người dùng đã nói** với câu hỏi mới thành một truy vấn kết hợp. Truy vấn lúc này còn chứa tên Avery nên tìm kiếm có thêm ngữ cảnh.

| Nơi dùng lịch sử | Mục đích |
| --- | --- |
| Đầu vào tìm kiếm | Tìm đúng tài liệu cho câu hỏi hiện tại |
| Đầu vào LLM | Hiểu câu hỏi trong mạch hội thoại và diễn đạt câu trả lời |

**Phải kiểm tra cả hai nơi. Sửa một nơi không tự động sửa nơi còn lại.**

## 8. Vì sao ghép tất cả câu hỏi cũ lại gây lỗi mới?

Trong video 016, sau khi hỏi nhiều câu về Avery, người dùng chuyển sang hỏi người thắng giải thưởng IOTY. Hệ thống tiếp tục lấy những chunk về Avery và không tìm được câu trả lời cần thiết.

Lý do: truy vấn kết hợp chứa quá nhiều nội dung cũ. Thông tin về Avery vẫn ảnh hưởng đến vector tìm kiếm, dù câu hỏi mới đã đổi chủ đề.

| Cách tạo truy vấn | Điểm mạnh | Điểm yếu |
| --- | --- | --- |
| Chỉ câu hỏi mới | Gọn, dễ đi theo chủ đề mới | Dễ mất đối tượng trong “cô ấy”, “sản phẩm đó” |
| Ghép mọi câu hỏi người dùng | Hỗ trợ một số câu hỏi tiếp nối | Có thể kéo chủ đề cũ vào tìm kiếm |

Giảng viên chưa triển khai lời giải nâng cao trong nhóm video này; ông dùng lỗi đó để dẫn sang việc cải tiến và đánh giá RAG.

**Giải thích bổ sung — hướng cải tiến:** dùng lịch sử để viết lại câu hỏi thành một câu độc lập trước khi tìm kiếm.

- Sau câu hỏi về Avery, “Lương của cô ấy?” → “Lương của Avery Lancaster là bao nhiêu?”
- Khi đổi chủ đề, “Ai thắng giải IOTY?” → giữ câu hỏi về giải thưởng, không thêm Avery nếu người dùng không có ý đó.

Luồng mở rộng sẽ là: xác định câu hỏi đầy đủ từ lịch sử → truy xuất tài liệu → trả lời. Có thể dùng thêm một lượt gọi LLM để viết lại truy vấn, nhưng cũng cần đánh giá vì bước này có thể hiểu sai ý và làm tăng thời gian xử lý. Đây là hướng học tiếp, không phải tính năng đã hoàn thành trong video.

## 9. Chunking: tìm đúng đoạn nhưng câu trả lời vẫn thiếu

Ví dụ trong video: hồ sơ **Maxine Thompson** có thông tin cô nhận giải Innovator of the Year năm 2023. Retriever tìm được đoạn nhắc giải thưởng, nhưng đoạn đó chỉ có tên “Maxine”; họ tên đầy đủ nằm ở đầu hồ sơ, ngoài chunk được lấy.

Kết quả: chatbot trả lời đúng một phần nhưng chỉ nói “Maxine”, thiếu “Thompson”.

Điều cần hiểu: **thông tin tồn tại trong tài liệu gốc không có nghĩa nó đã xuất hiện trong prompt.** LLM chỉ được đọc những phần ứng dụng gửi đến trong lượt đó.

**Giải thích bổ sung — các cách có thể thử:**

- Thêm tiêu đề và tên nhân vật vào nội dung mỗi chunk để đoạn đó có thể tự đứng độc lập.
- Khi tìm được chunk, lấy thêm phần lân cận hoặc phần tài liệu cha phù hợp.
- Chia theo cấu trúc như tiêu đề và mục hồ sơ để giảm việc cắt rời ý.
- Điều chỉnh chunk size/overlap rồi kiểm tra lại, vì tăng kích thước cũng có thể làm đoạn chứa nhiều thông tin không liên quan hơn.

Ví dụ chunk sau khi được bổ sung ngữ cảnh có thể mở đầu bằng “Hồ sơ nhân viên: Maxine Thompson”, rồi mới đến nội dung giải thưởng. Đây là ví dụ cải tiến do tôi bổ sung, không phải thay đổi đã được thực hiện trong video.

## 10. Xem context để biết lỗi nằm ở đâu

Giao diện cuối có phần hội thoại bên trái và các chunk tìm được bên phải. Giảng viên nhấn mạnh: phần văn bản trắng là context đã đưa cho LLM; phần màu cam hiển thị metadata nguồn cho người xem và **không được gửi cho LLM trong demo đó**.

Vì vậy, bạn thấy tên file nguồn trên giao diện không có nghĩa mô hình cũng đã nhìn thấy tên ấy. Hiển thị các nguồn đã truy xuất cũng chưa đồng nghĩa từng phát biểu trong câu trả lời đều đã được chứng minh bởi nguồn.

Khi câu trả lời sai, hãy kiểm tra theo thứ tự:

| Kiểm tra | Nếu có vấn đề, nên xem lại |
| --- | --- |
| Tài liệu gốc có câu trả lời không? | Dữ liệu đầu vào |
| Tài liệu đã được đưa vào kho chưa? | Ingestion và chỉ mục |
| Các chunk tìm được có đúng đối tượng/chủ đề không? | Truy vấn, lịch sử, embedding và cách truy xuất |
| Chunk có đủ dữ kiện để trả lời không? | Cách chia đoạn, thông tin đi kèm |
| Prompt có nhận context và lịch sử đúng không? | Code ghép message |
| Đầu vào đã đúng nhưng câu trả lời vẫn sai? | Chỉ dẫn cho mô hình và bước tạo câu trả lời |

Đây là cách biến câu nhận xét mơ hồ “AI không thông minh” thành một lỗi cụ thể có thể sửa.

## 11. Bài thực hành để biết mình đã hiểu

Giảng viên yêu cầu chạy ứng dụng, thử những câu làm tốt và những câu làm kém, đồng thời đọc context. Bạn có thể ghi lại theo bộ thử ngắn sau; đây là gợi ý thực hành bổ sung dựa trên các lỗi trong video:

| Trường hợp | Câu hỏi ví dụ | Điều cần quan sát |
| --- | --- | --- |
| Hỏi trực tiếp | Avery Lancaster là ai? | Đúng người và đúng hồ sơ |
| Hỏi tiếp nối | Lương của cô ấy là bao nhiêu? | Lịch sử có giúp cả tìm kiếm và trả lời không? |
| Đổi chủ đề | Ai nhận giải IOTY năm 2023? | Có còn lấy nhầm hồ sơ Avery không? |
| Cần đủ ngữ cảnh | Họ tên đầy đủ của người nhận giải? | Chunk có chứa đủ họ tên không? |
| Sai chính tả | Cố ý gõ sai nhẹ tên Avery | Có còn tìm đúng không? Đừng mặc định luôn đúng |
| Thiếu dữ liệu | Hỏi một chi tiết không có trong hồ sơ | Hệ thống có thừa nhận thiếu thông tin không? |

Với mỗi trường hợp, lưu câu hỏi, lịch sử trước đó, đáp án mong đợi từ tài liệu, các chunk thực tế và câu trả lời. Khi thay cách tìm kiếm hoặc chia đoạn, chạy lại cùng bộ câu hỏi để xem sửa được gì và có làm hỏng trường hợp khác không.

Đó là cầu nối sang **Evaluation / Evals — đánh giá hệ thống**, chủ đề được hẹn cho phần tiếp theo, chưa được triển khai đầy đủ trong năm video này.

## 12. Những điều cần nhớ sau khi học

1. RAG là tìm tài liệu liên quan rồi đưa chúng vào đầu vào của LLM để hỗ trợ trả lời.
2. Embedding model, Chroma và LLM là ba thành phần khác nhau.
3. LangChain giúp nối các thành phần; Gradio giúp tương tác và quan sát.
4. Lịch sử cần được xử lý ở cả bước truy xuất lẫn bước tạo câu trả lời.
5. Ghép toàn bộ lịch sử có thể sửa câu hỏi tiếp nối nhưng làm hỏng câu hỏi đổi chủ đề.
6. Một chunk đúng chủ đề vẫn có thể thiếu dữ kiện quan trọng ở phần khác của tài liệu.
7. Muốn cải tiến RAG, phải nhìn vào context thực tế và kiểm tra lại trên các tình huống cụ thể.

**Sau phần này, bạn nên giải thích được vì sao chatbot trả lời được từ tài liệu riêng, và lần theo luồng dữ liệu để tìm nguyên nhân khi nó trả lời sai.**

---

### Nguồn bài học

Các phụ đề đính kèm được sử dụng theo thứ tự:

- 012 — *Building a Complete RAG Pipeline with LangChain and Chroma*.
- 013 — *Building a RAG Pipeline with LangChain LLM & Retriever Setup*.
- 014 — *Building RAG with LangChain Retriever and LLM Integration*.
- 015 — *Building Production RAG with Python Modules and Gradio UI*.
- 016 — *RAG with Conversation History Building a Gradio UI and Debugging Chunki* (tên file được cung cấp kết thúc ở “Chunki”).

Phụ đề tự động có một số cách nhận dạng tên riêng và thuật ngữ không nhất quán; tài liệu chuẩn hóa cách viết LangChain, Chroma, Gradio, embedding và các tên nhân vật theo ngữ cảnh. Các kết quả demo là minh họa trong bài học, không phải cam kết hiệu năng cho mọi dữ liệu hoặc mô hình.
