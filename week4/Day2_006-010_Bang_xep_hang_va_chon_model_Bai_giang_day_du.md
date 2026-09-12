# Day 2 — Hiểu bảng xếp hạng và chọn mô hình AI cho công việc thực tế

> Bản giảng lại đầy đủ của 5 bài 006–010. Biên soạn dựa trên toàn bộ phụ đề tiếng Anh được cung cấp; không phải bản chép lời hay bản kiểm tra từng khung hình video. Các ví dụ thực hành bên dưới là phần bổ sung để giải thích.
>
> Tên mô hình, thứ hạng, giá và điểm số trong video thuộc thời điểm ghi hình. Tài liệu tập trung vào cách đọc và ra quyết định, không dùng các thứ hạng đó làm khuyến nghị hiện tại.

## 1. Rốt cuộc, phần này muốn dạy bạn điều gì?

**Bạn đang chuẩn bị xây một tính năng AI. Có rất nhiều mô hình; làm sao chọn được vài mô hình phù hợp để thử, thay vì chọn theo tên tuổi hoặc cảm giác?** Đây là câu hỏi xuyên suốt cả phần.

Giảng viên đi qua nhiều website nên dễ tạo cảm giác bài học chỉ là giới thiệu công cụ. Thực ra, mỗi website cung cấp một loại bằng chứng để trả lời ba câu hỏi:

1. **Năng lực:** Mô hình có làm được việc của mình không?
2. **Khả năng vận hành:** Nó có đủ nhanh và chi phí có chấp nhận được không?
3. **Giá trị:** Tính năng AI đó giúp người dùng hoặc doanh nghiệp đạt điều gì?

Kết quả cần đạt sau 5 bài là **biết lập danh sách ngắn các mô hình đáng thử**. Chọn mô hình cuối cùng còn cần làm prototype — bản thử nghiệm — và đánh giá trên dữ liệu của chính dự án. Giảng viên nhấn mạnh điều này ở cuối bài 010.

Phần này thuộc hướng **ứng dụng và đánh giá mô hình có sẵn**. Nó chưa hướng dẫn huấn luyện một mô hình như ChatGPT từ đầu.

| Bài | Nội dung đang trình bày | Mục đích thực sự |
| --- | --- | --- |
| 006 | Giới thiệu các leaderboard và Artificial Analysis | Biết tìm bằng chứng ở đâu; nhìn mô hình theo nhiều tiêu chí |
| 007 | Đào sâu điểm, chi phí và tốc độ | Hiểu sự đánh đổi để lọc ứng viên hợp lý |
| 008 | Vellum, SEAL, Hugging Face, LiveBench | Chọn nguồn đánh giá phù hợp với lĩnh vực và kiểm tra độ tin cậy |
| 009 | LM Arena và bình chọn ẩn danh | Bổ sung góc nhìn trải nghiệm người dùng |
| 010 | Ứng dụng thương mại và Agentic AI | Gắn việc chọn mô hình với bài toán mang lại giá trị |

## 2. Bài 006 — Đọc leaderboard như đọc kết quả thi

**Benchmark — bài/bộ đánh giá chuẩn** — là cách giao một tập nhiệm vụ cho mô hình rồi đo kết quả. **Leaderboard — bảng xếp hạng** — tổng hợp kết quả của nhiều mô hình. Một website có thể chứa nhiều bảng xếp hạng, và mỗi bảng có thể dùng một hoặc nhiều benchmark.

Ví dụ: cho các mô hình sửa cùng một bộ lỗi JavaScript, chạy kiểm thử rồi tính tỷ lệ sửa đúng. Bộ nhiệm vụ và cách chấm là benchmark; bảng so sánh các mô hình là leaderboard.

Giống tuyển lập trình viên, điểm tổng quát có ích nhưng chưa đủ. Người giỏi thuật toán chưa chắc phù hợp nhất với công việc chỉnh giao diện, xử lý accessibility hoặc bảo trì một codebase cụ thể.

### Ba trục cần xem đầu tiên

| Trục | Câu hỏi cần trả lời | Ý nghĩa thực tế |
| --- | --- | --- |
| Intelligence — năng lực theo bài đánh giá | Mô hình làm tốt những nhiệm vụ được đo đến đâu? | Dự đoán sơ bộ khả năng xử lý công việc |
| Cost — chi phí | Hoàn thành công việc tốn bao nhiêu? | Ảnh hưởng ngân sách khi có nhiều lượt dùng |
| Speed/Latency — tốc độ/độ trễ | Người dùng phải chờ bao lâu? | Ảnh hưởng trải nghiệm và thông lượng |

Artificial Analysis được dùng làm ví dụ chính vì đặt những yếu tố này cạnh nhau. **Intelligence Index là điểm tổng hợp của một nhóm đánh giá**, không phải phép đo toàn bộ trí thông minh và cũng không mặc nhiên là phần trăm câu đúng.

Video nhắc các bài như MMLU-Pro, GPQA Diamond, Humanity’s Last Exam, LiveCodeBench, Terminal-Bench và AIME. Bạn chỉ cần hiểu chúng đo những phần khác nhau: kiến thức, suy luận khoa học, câu hỏi chuyên sâu, lập trình, thao tác trong môi trường terminal và toán thi đấu. Danh sách hoặc trọng số cấu thành một chỉ số có thể đổi theo phiên bản.

### Vì sao cần xem điểm thành phần?

Hai mô hình có điểm tổng gần nhau nhưng mô hình A mạnh toán, mô hình B mạnh viết code. Nếu bạn xây công cụ sửa code, điểm lập trình có liên quan trực tiếp hơn.

Một mô hình vượt một nhóm người trên bộ câu hỏi khoa học cũng **không đồng nghĩa nó có năng lực của tiến sĩ trong mọi việc**. Ngay giảng viên cũng thừa nhận mô hình có thể rất mạnh trên bài khoa học nhưng vẫn thất bại ở một tình huống cờ đơn giản.

### Đồ thị tiến bộ theo thời gian muốn nói gì?

Giảng viên dùng đồ thị để minh họa kết quả benchmark tăng nhanh, rồi phân biệt:

- **Training-time techniques — kỹ thuật lúc huấn luyện:** cải thiện mô hình thông qua quá trình học.
- **Inference-time techniques — kỹ thuật lúc chạy:** dành thêm tính toán để suy luận, thử phương án, kết hợp prompt hoặc công cụ trong hệ thống.

Ví dụ bổ sung: thay vì trả lời ngay một bài toán, hệ thống cho mô hình thêm thời gian kiểm tra các bước trước khi trả lời. Chất lượng có thể tăng, nhưng thời gian và chi phí cũng tăng.

Nhận định rằng tiến bộ gần đây chủ yếu đến từ inference là cách diễn giải của giảng viên. Một đồ thị điểm số riêng lẻ chưa chứng minh được phần đóng góp của từng nguyên nhân, cũng chưa bảo đảm tốc độ tiến bộ sẽ tiếp tục như vậy.

## 3. Bài 007 — Giỏi, rẻ, nhanh: phải đọc đúng từng yếu tố

### 3.1. Giá token thấp chưa chắc hoàn thành việc rẻ

**Token** là đơn vị văn bản mà mô hình xử lý; không có quy tắc cố định rằng một token bằng một từ.

- **Input tokens:** phần gửi vào, gồm yêu cầu và ngữ cảnh.
- **Answer tokens:** phần câu trả lời được tạo ra.
- **Reasoning tokens:** phần tính toán suy luận được hệ thống ghi nhận ở các mô hình có hỗ trợ; có thể không hiển thị đầy đủ cho người dùng.

Hai mô hình trả cùng một đáp án có thể dùng lượng token khác nhau. Đây là lý do video xem **chi phí chạy cùng bộ nhiệm vụ**, thay vì chỉ đọc đơn giá trên bảng giá.

Ví dụ giả định, bỏ qua input, cache và công cụ để dễ tính:

| Mô hình | Giá trên 1 triệu token đầu ra có tính phí | Token dùng cho một nhiệm vụ | Chi phí |
| --- | ---: | ---: | ---: |
| A | 2 USD | 10.000 | 0,020 USD |
| B | 5 USD | 2.000 | 0,010 USD |

A rẻ hơn theo đơn vị token nhưng B rẻ hơn cho nhiệm vụ này.

Công thức cơ bản:

```text
Chi phí = Σ (số token thuộc từng loại có tính phí × đơn giá loại đó)
          + phí công cụ hoặc dịch vụ khác, nếu có
```

Phải theo cách phân loại của nhà cung cấp; nếu reasoning đã được tính trong output thì không cộng thêm lần nữa. Cache chỉ làm giảm phí khi thỏa điều kiện áp dụng, không phải cứ gửi lại nội dung là chắc chắn được giảm.

**Bổ sung cho dự án thực tế:** đo cả chi phí của lần thử lại và sửa lỗi. Một mô hình rẻ nhưng thường xuyên thất bại có thể có chi phí trên mỗi kết quả đạt yêu cầu cao hơn.

Artificial Analysis cũng phân biệt đơn giá token với chi phí theo nhiệm vụ, có tính đến lượng token thực tế; cách trình bày hiện tại có thể khác giao diện video. Tham khảo [phương pháp đánh giá của Artificial Analysis](https://artificialanalysis.ai/methodology).

### 3.2. Đọc biểu đồ Intelligence vs. Cost

Trong biểu đồ được giảng viên giải thích:

- Trục ngang: chi phí, đi sang phải là đắt hơn.
- Trục dọc: điểm năng lực, đi lên là cao hơn.
- Khu vực trên bên trái: điểm cao và chi phí thấp, thường đáng xem trước.

Nếu B nằm phía trên và bên trái A, B có điểm cao hơn và rẻ hơn **trên phép đo đang xem**. Vì vậy, A thường ít hấp dẫn hơn nếu bạn chỉ quan tâm hai tiêu chí này.

Nhưng đừng biến nó thành quy tắc “luôn loại A”. A vẫn có thể phù hợp hơn với tiếng Việt, một lĩnh vực riêng, độ trễ, cách triển khai hoặc yêu cầu dữ liệu của bạn. Chính video cũng lưu ý chỉ số tổng hợp không trùng hoàn toàn với tác vụ dự án.

**Cách dùng đúng:** dùng biểu đồ để giảm số ứng viên cần thử, sau đó kiểm chứng trên công việc thật. Khi đổi biểu đồ, luôn đọc lại nhãn trục và đơn vị: chi phí mỗi triệu token, chi phí mỗi nhiệm vụ và tổng phí cả bộ đánh giá là ba thứ khác nhau.

### 3.3. Phân biệt ba loại tốc độ

| Chỉ số | Đo điều gì? | Ví dụ dễ hiểu |
| --- | --- | --- |
| Output speed — tốc độ sinh đầu ra | Bao nhiêu token được tạo mỗi giây | Sau khi bắt đầu trả lời, chữ chạy nhanh đến đâu |
| Latency to first answer token — độ trễ tới token trả lời đầu tiên | Thời gian chờ trước khi thấy nội dung trả lời | Gửi câu hỏi rồi chờ trước khi xuất hiện chữ đầu |
| End-to-end response time — tổng thời gian phản hồi | Từ lúc gửi đến khi hoàn tất | Bao lâu mới có cả kết quả để dùng |

Video tính độ trễ tới token **câu trả lời**, không tính token suy luận là câu trả lời đầu tiên. Ở hệ thống khác, “time to first token” có thể được định nghĩa khác; cần đọc phương pháp đo.

Ví dụ giả định, câu trả lời đều dài 200 token:

- A chờ 10 giây rồi sinh 100 token/giây: tổng khoảng 12 giây.
- B chờ 1 giây rồi sinh 40 token/giây: tổng khoảng 6 giây.

A sinh chữ nhanh hơn nhưng B hoàn thành sớm hơn. Công cụ và mạng có thể làm thời gian thực tế tăng thêm.

## 4. Bài 008 — Dùng mỗi nguồn để trả lời một câu hỏi khác nhau

### Vellum: kiểm tra các giới hạn và chi phí cơ bản

Theo phần giới thiệu trong video, bảng so sánh của Vellum hữu ích khi muốn đặt **context window, giá input/output và tốc độ** cạnh nhau.

**Context window — cửa sổ ngữ cảnh** — là giới hạn lượng token mô hình có thể xử lý trong một lượt theo quy định của mô hình/API. Khi thiết kế ứng dụng, cần tính prompt hệ thống, lịch sử, tài liệu, kết quả công cụ và phần chỗ dành cho đầu ra; cũng cần kiểm tra giới hạn output riêng.

Cửa sổ lớn giống bàn làm việc rộng hơn: đặt được nhiều tài liệu hơn, nhưng không bảo đảm mọi chi tiết đều được sử dụng chính xác. Không nên chọn mô hình chỉ vì con số context lớn.

### SEAL: tìm đánh giá sát chuyên môn

SEAL là nhóm leaderboard của Scale AI được video giới thiệu cho những năng lực chuyên biệt: dùng công cụ, kỹ thuật phần mềm, suy luận đa ngôn ngữ, thị giác, an toàn, tính trung thực và dạy học.

Ý nghĩa: **bài toán càng đặc thù, càng cần benchmark đúng lĩnh vực**. Với một gia sư AI, khả năng hướng dẫn người học và giải thích lỗi có thể quan trọng hơn điểm toán thi đấu.

Video đi sâu vào **Humanity’s Last Exam (HLE)** — bộ câu hỏi rất khó thuộc nhiều lĩnh vực — và minh họa cách dùng **LLM-as-a-judge**, tức mô hình làm người chấm:

1. Mô hình cần đánh giá tạo câu trả lời.
2. Người chấm nhận câu trả lời đó và đáp án tham chiếu.
3. Người chấm kiểm tra câu trả lời có phù hợp với đáp án hay không.

Theo video, người chấm trong cách triển khai được giới thiệu là o3. Điều này không nên được hiểu là mọi bảng HLE luôn dùng cùng một thiết lập. Có đáp án tham chiếu giúp việc chấm có căn cứ hơn, nhưng người chấm AI vẫn có thể mắc lỗi.

Video cũng giải thích chênh lệch điểm HLE giữa hai nơi có liên quan đến phiên bản chỉ văn bản và phiên bản đa phương thức. Bài học tổng quát: trước khi so hai điểm số, kiểm tra **phiên bản bộ đề, đầu vào, công cụ được phép dùng, cấu hình suy luận và phương pháp chấm**.

### Hugging Face: một nơi chứa nhiều bảng, không phải một bảng duy nhất

Giảng viên duyệt nhiều leaderboard trong Spaces, gồm lập trình theo ngôn ngữ, hiệu năng theo phần cứng, y khoa, agent và các nhóm khác.

Video nói Open LLM Leaderboard cũ đã được lưu trữ ở thời điểm ghi hình; suy đoán về nguyên nhân không phải kết luận đã được chứng minh. Điều đó cũng không có nghĩa mọi leaderboard trên Hugging Face đều ngừng cập nhật.

Khi gặp một bảng, hãy kiểm tra ai duy trì, lần cập nhật gần nhất, mô hình được thử và cách đánh giá. Việc bảng được đặt trên cùng một nền tảng không bảo đảm tất cả đều có chất lượng như nhau.

**Bổ sung:** open-weight — công khai trọng số — và open-source — mã nguồn mở — không phải lúc nào cũng đồng nghĩa. Việc tải được mô hình không tự động cho phép mọi hình thức sử dụng thương mại; cần xem giấy phép. Chi phí chạy local còn phụ thuộc phần cứng và vận hành, không thể lấy giá API làm chi phí local.

### LiveBench: giảm nguy cơ “đã gặp đề thi”

**Data contamination — nhiễm dữ liệu đánh giá** — xảy ra khi nội dung đánh giá hoặc nội dung quá gần với nó xuất hiện trong dữ liệu mà mô hình đã được học, khiến điểm số có thể đánh giá quá cao khả năng xử lý bài mới.

LiveBench chú trọng làm mới câu hỏi và dùng dữ liệu mới để hạn chế vấn đề này. Video nhắc chu kỳ làm mới toàn bộ khoảng sáu tháng; tài liệu gốc mô tả bổ sung/cập nhật câu hỏi hàng tháng. Hai cách mô tả không nhất thiết mâu thuẫn: cập nhật từng phần khác với thay toàn bộ. Nên hiểu mục tiêu là **hạn chế nguy cơ nhiễm**, không phải bảo đảm tuyệt đối không thể nhiễm. Tham khảo [công bố của nhóm LiveBench](https://arxiv.org/abs/2406.19314).

Đừng nhầm **LiveBench** với **LiveCodeBench**: video nhắc cả hai, nhưng LiveCodeBench tập trung vào lập trình, còn LiveBench đánh giá nhiều nhóm năng lực.

## 5. Bài 009 — LM Arena cho biết người dùng thích câu trả lời nào

Quy trình được minh họa trong video:

1. Bạn gửi cùng một câu hỏi cho hai mô hình ẩn tên.
2. Đọc câu trả lời A và B.
3. Chọn câu tốt hơn theo nhận xét của mình.
4. Nhiều lượt so sánh được tổng hợp thành bảng xếp hạng.

Giảng viên thử yêu cầu kể chuyện cười cho kỹ sư AI và chọn câu trả lời mình thích hơn. Ví dụ này cho thấy một số tiêu chí như duyên dáng, ngắn gọn hoặc dễ đọc không dễ đo bằng đáp án đúng/sai.

Video mô tả **Elo-style rating — điểm xếp hạng theo kiểu Elo**. Bạn có thể liên tưởng Elo trong cờ vua: kết quả đối đầu giúp ước lượng sức mạnh tương đối. Không cần hiểu rằng hệ thống phải dùng y nguyên công thức của một nền tảng cờ cụ thể. Điểm cao hơn cũng không phải “tỷ lệ đúng cao hơn từng ấy phần trăm”.

**Blind testing — thử nghiệm ẩn danh** — giảm thiên kiến vì thương hiệu. Tuy vậy, kết quả vẫn phụ thuộc câu hỏi, nhóm người bình chọn và sở thích trình bày. Một câu sai nhưng thuyết phục vẫn có thể được thích hơn.

Giảng viên rất đề cao Arena; cách diễn giải thận trọng hơn là: **Arena bổ sung bằng chứng về sự ưa thích của người dùng, không phải phán quyết cuối cùng về mọi năng lực.** Với công việc có đáp án kiểm chứng được, vẫn phải đo tính đúng đắn.

## 6. Bài 010 — Xây AI để tạo giá trị gì?

Bài cuối chuyển từ “mô hình nào tốt?” sang “dùng nó vào đâu?”. Có **hai cách phân loại** trong bài, cần tách ra để không bị rối.

### Cách nhìn thứ nhất: loại giá trị mang lại

| Khái niệm | Hiểu đơn giản | Ví dụ bổ sung cho công việc frontend |
| --- | --- | --- |
| Automation — tự động hóa | AI thực hiện một tác vụ vốn làm thủ công | Phân loại ticket và trích xuất thông tin |
| Augmentation — hỗ trợ tăng năng lực | Người làm việc cùng AI, người tiếp tục kiểm soát | AI đề xuất sửa component, developer xem và duyệt |
| Differentiation — tạo khác biệt | AI giúp cung cấp trải nghiệm hoặc năng lực mới | Công cụ luyện giao tiếp thích ứng theo lỗi của từng người học |

Giảng viên trình bày một hướng đi từ tự động hóa tới tạo khác biệt. Đây là khung tư duy kinh doanh, không phải định luật rằng sản phẩm ở cột sau luôn tạo nhiều giá trị hơn. Tự động hóa một công việc lớn và lặp lại vẫn có thể rất đáng giá.

### Cách nhìn thứ hai: cách xây giải pháp

| Nhóm | Bản chất | Điểm cần hiểu |
| --- | --- | --- |
| LLM wrapper — ứng dụng bao quanh LLM | Đưa mô hình có sẵn vào giao diện/quy trình sản phẩm | Giá trị có thể nằm ở trải nghiệm và tích hợp, dù không sở hữu mô hình nền |
| Specialized AI platform — nền tảng AI chuyên biệt | Kết hợp dữ liệu và quy trình chuyên ngành | Có thể dùng RAG, công cụ, fine-tuning hoặc nhiều kỹ thuật cùng nhau |
| Agentic AI — AI có khả năng chủ động thực hiện chuỗi việc | Mô hình tham gia quyết định bước tiếp theo và sử dụng công cụ | Mức tự chủ cần phù hợp với nhiệm vụ và quyền được cấp |

Ba nhóm có thể chồng lấn. Một nền tảng chuyên biệt có thể gọi API mô hình bên ngoài và đồng thời dùng agent. Đây cũng không phải ba mức giá trị tương ứng một-một với bảng phía trên.

Các tên Duolingo, Harvey, Nebula, Khanmigo, Salesforce và Palantir được giảng viên dùng làm ví dụ minh họa tại thời điểm ghi hình. Không cần ghi nhớ danh sách; hãy nhớ thông điệp: **mô hình nền là một phần, dữ liệu, quy trình và trải nghiệm mới biến nó thành sản phẩm hữu ích**.

### RAG, fine-tuning và tools khác nhau ở đâu? — Giải thích bổ sung

- **RAG — truy xuất tăng cường cho sinh nội dung:** tìm tài liệu liên quan rồi đưa vào ngữ cảnh để mô hình dựa vào đó trả lời. Ví dụ: lấy đúng bài ngữ pháp để giải thích lỗi của học viên.
- **Fine-tuning — tinh chỉnh mô hình:** huấn luyện thêm trên các ví dụ, làm thay đổi trọng số. Có thể dùng để thích nghi hành vi hoặc cách thực hiện tác vụ.
- **Tools — công cụ:** cho hệ thống khả năng thực hiện hành động như tra dữ liệu, chạy kiểm thử, đọc file hoặc gọi API.

Có dữ liệu riêng không có nghĩa bắt buộc phải huấn luyện lại mô hình. Dữ liệu cũng phải đúng, liên quan và được tích hợp hữu ích; chỉ sở hữu nhiều dữ liệu chưa đủ tạo lợi thế.

### Agent khác một lần gọi LLM như thế nào?

Một lần gọi đơn giản: gửi code, nhận gợi ý sửa.

Một quy trình agent có thể: đọc lỗi → chọn file để xem → sửa code → chạy kiểm thử → xem kết quả → quyết định sửa tiếp hoặc dừng. Điểm khác biệt là hệ thống dùng phản hồi để quyết định bước tiếp theo. Một chuỗi bước cố định gọi LLM chưa nhất thiết là agent có quyền tự quyết.

Agent không đồng nghĩa được làm mọi thứ tự do. Trong ví dụ sửa code, quyền đọc/sửa file, ngân sách số lần thử và điều kiện dừng cần được xác định rõ.

## 7. Ghép kiến thức thành cách làm thực tế — Phần bổ sung

Giả sử bạn cần AI **giải thích lỗi ngữ pháp A1 bằng tiếng Việt**. Đừng bắt đầu bằng việc hỏi “mô hình nào đứng đầu?”. Hãy làm theo thứ tự:

1. **Định nghĩa kết quả tốt:** chỉ đúng lỗi, giải thích dễ hiểu, câu sửa chính xác, phản hồi ngắn.
2. **Đặt ràng buộc:** thời gian chờ, chi phí và cách xử lý dữ liệu của ứng dụng.
3. **Lọc 2–4 ứng viên:** xem điểm phù hợp, chi phí, độ trễ và bằng chứng về trải nghiệm.
4. **Dùng cùng bộ ví dụ:** gồm câu đúng, câu sai, lỗi phổ biến và câu dễ gây hiểu nhầm; giữ điều kiện thử có thể so sánh.
5. **Đánh giá cả chất lượng lẫn vận hành:** không chỉ đọc vài câu thấy “hay”.
6. **Chọn theo ngưỡng đạt yêu cầu:** cân nhắc chi phí giữa các mô hình đã đáp ứng chất lượng cần thiết.

Ví dụ kết quả giả định, hoàn toàn không phải dữ liệu của một mô hình thật:

| Mô hình | Bài đạt yêu cầu trên 30 bài | Độ trễ trung vị | Tổng chi phí 30 bài |
| --- | ---: | ---: | ---: |
| A | 29 | 4 giây | 0,90 USD |
| B | 28 | 2 giây | 0,30 USD |
| C | 23 | 1 giây | 0,15 USD |

Nếu ngưỡng của bản thử là 28/30, B là ứng viên đáng cân nhắc. Nếu lỗi còn lại của B là lỗi nghiêm trọng, phải xem xét kỹ trước khi chọn. Bộ 30 bài chỉ giúp thử ban đầu, chưa đủ chứng minh chất lượng production.

Có thể định tuyến bài đơn giản sang mô hình rẻ, bài khó sang mô hình mạnh hơn, nhưng chỉ nên thêm độ phức tạp này khi kết quả thực nghiệm cho thấy cần thiết.

## 8. Bài thực hành tiếp theo liên quan gì?

Cuối bài 010, giảng viên giới thiệu bài tiếp theo: thử nhiều mô hình chuyển code **Python sang C++** để tạo chương trình hiệu năng cao hơn. Trong 5 bài này, đó mới là phần giới thiệu, chưa phải hướng dẫn triển khai hoàn chỉnh.

Mục tiêu sâu hơn là thực hành chọn mô hình trên một công việc cụ thể: code sinh ra có biên dịch được, chạy đúng và đạt hiệu năng mong muốn không?

**Bổ sung:** chuyển sang C++ không tự động bảo đảm nhanh hơn. Còn tùy thuật toán, thư viện và cách triển khai; Python cũng có thể gọi thư viện native được tối ưu. Vì thế phải kiểm tra đúng/sai và đo thời gian chạy, không chỉ nhìn ngôn ngữ đầu ra.

## 9. Những điều cần nhớ sau khi học

- Leaderboard giúp tìm ứng viên; kết quả thử trên dự án giúp chọn ứng viên cuối cùng.
- Điểm tổng hợp không thay thế điểm theo năng lực và dữ liệu của bạn.
- So chi phí hoàn thành cùng công việc, không chỉ so đơn giá token.
- Phân biệt tốc độ sinh chữ, thời gian chờ ban đầu và tổng thời gian hoàn tất.
- Bình chọn ẩn danh đo trải nghiệm ưa thích; vẫn cần kiểm chứng độ đúng.
- Sản phẩm AI có giá trị nhờ giải quyết công việc cụ thể, cùng dữ liệu, công cụ và quy trình phù hợp.

### Ghi chú về nguồn và biên tập

Nguồn chính là 5 phụ đề tiếng Anh bài 006, 007, 008, 009 và 010 do bạn cung cấp. Các từ nhận dạng sai rõ ràng như “a genetic AI” được chuẩn hóa thành “Agentic AI”; tên và thuật ngữ được trình bày theo ngữ cảnh bài học. Các phần ghi “bổ sung”, ví dụ số liệu giả định và quy trình thực hành là phần giảng giải thêm, không gán cho giảng viên.

Hai nguồn bên ngoài được dùng để làm rõ phương pháp là [Artificial Analysis](https://artificialanalysis.ai/methodology) và [bài báo LiveBench](https://arxiv.org/abs/2406.19314). Tài liệu không cập nhật hay khẳng định bảng xếp hạng mô hình hiện tại.
