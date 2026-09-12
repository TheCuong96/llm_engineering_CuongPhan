# Chọn và đánh giá LLM — Bài giảng đầy đủ

> Tổng hợp 5 bài Day 1, từ video 001 đến 005. Mục tiêu: hiểu cách chọn model cho một ứng dụng, đọc đúng benchmark và biết tự kiểm chứng chất lượng.
>
> Tài liệu được viết lại từ toàn bộ phụ đề tiếng Anh đính kèm, không phải bản chép lời. Các ví dụ ứng dụng, quy trình thử nghiệm và mã giả là phần tôi bổ sung. Không tái dựng mã nguồn hay chi tiết hình ảnh chưa kiểm tra trực tiếp trong video. Các thứ hạng và tên model được nhắc trong demo thuộc thời điểm ghi hình, không phải bảng xếp hạng hiện tại.

## 1. Cả phần này thực sự muốn dạy bạn điều gì?

Sau khi biết gọi API, dùng Hugging Face và tạo ứng dụng AI, bạn sẽ gặp một vấn đề mới: **có nhiều model cùng làm được một việc, vậy nên chọn model nào?**

Giảng viên muốn chuyển bạn từ tư duy “model nào nổi tiếng nhất?” sang tư duy kỹ sư: “model nào đáp ứng bài toán của mình với chi phí, tốc độ và điều kiện triển khai phù hợp?”.

Ví dụ, một model giải toán rất giỏi chưa chắc là lựa chọn hợp lý để sửa một câu tiếng Anh A1. Với việc sửa câu, bạn có thể cần phản hồi nhanh, giải thích dễ hiểu và tuân thủ định dạng hơn là khả năng giải toán nâng cao.

| Bài | Nội dung | Mục đích trong mạch học |
| --- | --- | --- |
| 001 — Choosing the Right LLM | Yêu cầu, thông số và chi phí | Biết loại những model không phù hợp ngay từ đầu |
| 002 — Chinchilla Scaling Law | Tham số và dữ liệu huấn luyện | Hiểu vì sao không thể chỉ nhìn kích thước model |
| 003 — AI Model Benchmarks | Sáu nhóm bài kiểm tra | Biết một điểm số đang phản ánh năng lực gì |
| 004 — Limitations of Benchmarks | Những nguyên nhân gây hiểu sai | Không đánh đồng điểm thi với chất lượng thực tế |
| 005 — Connect Four Leaderboard | Demo hai model chơi cờ | Quan sát điểm mạnh, lỗi và ảnh hưởng của prompt |

**Kết quả cần đạt:** bạn giải thích được lý do chọn một model, kèm bằng chứng từ bài toán của mình. Không cần học thuộc model nào đứng đầu một bảng xếp hạng.

## 2. Bài 001 — Model Selection: lựa chọn mô hình

### 2.1. Bắt đầu bằng yêu cầu của ứng dụng

Trước khi so model, viết rõ:

- **Công việc:** tóm tắt, sửa ngữ pháp, sinh code, đọc ảnh hay gọi công cụ?
- **Đầu vào và đầu ra:** tiếng Việt hay tiếng Anh; đoạn ngắn hay tài liệu dài; văn bản tự do hay JSON?
- **Chất lượng chấp nhận được:** lỗi nào có thể sửa, lỗi nào làm tính năng không dùng được?
- **Tốc độ và tải:** người dùng chờ bao lâu; có bao nhiêu yêu cầu đồng thời?
- **Ngân sách và triển khai:** dùng API hay tự chạy; phần cứng và thời gian xây dựng có đủ không?

Đây là phần xác định tiêu chuẩn trước khi nhìn điểm số. Nếu chưa biết mình cần gì, một bảng xếp hạng dài chỉ khiến việc chọn model khó hơn.

### 2.2. Những thông số cần hiểu

| Thuật ngữ | Hiểu đơn giản | Khi chọn model cần chú ý |
| --- | --- | --- |
| Parameters — tham số | Những giá trị số được học trong quá trình huấn luyện | Kích thước liên quan tới tài nguyên, nhưng không tự quyết định chất lượng |
| Training tokens — token huấn luyện | Lượng token được dùng trong quá trình học | Đây không phải giới hạn văn bản bạn nhập vào |
| Context window — cửa sổ ngữ cảnh | Giới hạn ngữ cảnh model xử lý trong một lần chạy | Phải tính toàn bộ nội dung gửi vào, cùng ngân sách đầu ra theo quy định model |
| Knowledge cutoff — mốc kiến thức | Mốc dữ liệu huấn luyện mà nhà cung cấp công bố | Không bảo đảm model biết đầy đủ mọi sự kiện trước mốc đó |
| Release date — ngày phát hành | Thời điểm phiên bản được đưa ra | Không đồng nghĩa với mốc kiến thức |
| Model card — hồ sơ mô hình | Tài liệu mô tả model, cách dùng, đánh giá và hạn chế | Có thể cần đọc thêm tài liệu API, giá và giấy phép |

**Ví dụ minh họa:** model 8B có khoảng 8 tỷ tham số. Nếu tài liệu nói model được học trên 1T token thì đó là khoảng 1 nghìn tỷ token huấn luyện. Nếu context là 32K, đó lại là một giới hạn khác: khoảng hàng chục nghìn token cho một lần xử lý, theo cách công bố của nhà cung cấp.

Ba con số này trả lời ba câu hỏi khác nhau: **model lớn bao nhiêu, đã học bao nhiêu và đang xử lý được bao nhiêu**.

Với một cuộc hội thoại, ngữ cảnh có thể gồm chỉ dẫn hệ thống, lịch sử được ứng dụng gửi lại, tài liệu truy xuất, kết quả công cụ và câu hỏi mới. Không phải mọi tin nhắn từng tồn tại đều tự động nằm trong bộ nhớ model: ứng dụng có thể bỏ bớt hoặc tóm tắt lịch sử.

### 2.3. Chat, reasoning và hybrid

- **Chat model — mô hình hội thoại:** thường được dùng cho trao đổi và sinh nội dung trực tiếp.
- **Reasoning model — mô hình suy luận:** được thiết kế hoặc huấn luyện để dành thêm tính toán cho bài toán cần nhiều bước.
- **Hybrid model — mô hình kết hợp:** có thể hỗ trợ nhiều chế độ; cách bật hoặc lựa chọn phụ thuộc sản phẩm.

Giảng viên nhấn mạnh rằng suy luận nhiều hơn có thể đổi lấy thời gian chờ dài hơn. Với một yêu cầu đơn giản, phần tính toán thêm có thể không đem lại lợi ích tương xứng.

Nhận xét trong video về khả năng sáng tạo của reasoning model nên hiểu là một xu hướng giảng viên quan sát, không phải quy luật áp dụng cho mọi model. Bạn vẫn phải thử trên nội dung thực tế của mình.

### 2.4. API và tự chạy: phải tính tổng chi phí

Video phản bác quan niệm “model chạy local thì miễn phí”. Bạn có thể không trả phí cho từng token qua API, nhưng vẫn dùng GPU, RAM, điện và thời gian vận hành.

| Khoản chi | Ví dụ |
| --- | --- |
| Inference — chạy model để trả lời | Phí API hoặc chi phí máy chạy model |
| Huấn luyện bổ sung | Chuẩn bị dữ liệu, fine-tuning và kiểm tra chất lượng |
| Xây dựng | Tích hợp model, prompt, RAG, xử lý lỗi |
| Vận hành | Theo dõi, cập nhật, chịu tải và xử lý sự cố |
| Time to market — thời gian đưa ra sử dụng | Số ngày hoặc tuần cần để có tính năng đủ tốt |

Model rẻ hơn mỗi lần chạy có thể đòi hỏi nhiều công sức chỉnh sửa hơn. Ngược lại, model mạnh hơn có thể giúp thử ý tưởng nhanh, nhưng chi phí khi sử dụng nhiều cần được đo lại. Đây là các khả năng phải tính, không phải kết luận sẵn rằng API hay local luôn rẻ hơn.

“Open weights — trọng số mở” cũng không tự động đồng nghĩa với mọi ý nghĩa của “open source — mã nguồn mở”. Đừng suy quyền sử dụng chỉ từ nhãn “open”; cần xem giấy phép cụ thể của model.

### 2.5. Tốc độ sinh và thời gian chờ là hai phép đo

**Time to first token (TTFT)** là thời gian tới token đầu tiên. **Output throughput** thường là tốc độ sinh token đầu ra. Tổng thời gian hoàn thành còn chịu ảnh hưởng của độ dài câu trả lời, tải hệ thống và việc gọi công cụ.

Ví dụ giả định:

| Model | Chờ trước khi bắt đầu | Tốc độ sau khi bắt đầu | Cảm nhận |
| --- | --- | --- | --- |
| A | 0,5 giây | 40 token/giây | Giao diện có phản hồi sớm |
| B | 6 giây | 100 token/giây | Chờ lâu ban đầu, rồi văn bản xuất hiện nhanh |

Với frontend có streaming, khác biệt này tác động trực tiếp tới UX. Ngoài ra, **rate limits — giới hạn tần suất** quyết định ứng dụng được gửi bao nhiêu request hoặc token trong một khoảng thời gian; tốc độ một request không cho biết toàn bộ khả năng phục vụ nhiều người.

**Điều cần nhớ từ bài 001:** dùng yêu cầu và thông số để lập danh sách ứng viên ngắn trước khi so điểm benchmark.

## 3. Bài 002 — Chinchilla Scaling Law: quy luật mở rộng

### 3.1. Câu hỏi nghiên cứu là gì?

Khi có một ngân sách tính toán để huấn luyện model, nên phân bổ bao nhiêu cho kích thước model và bao nhiêu cho lượng dữ liệu?

Kết quả Chinchilla cho thấy trong miền thực nghiệm tối ưu tính toán của nghiên cứu, kích thước model và số token huấn luyện nên tăng theo tỷ lệ tương ứng: tăng gấp đôi kích thước thì số token tối ưu cũng tăng khoảng gấp đôi. Đây là kết quả thực nghiệm có điều kiện, không phải quy luật “gấp đôi tham số thì thông minh gấp đôi”. [Nghiên cứu Chinchilla](https://arxiv.org/abs/2203.15556).

### 3.2. Cách hình dung

Hãy hình dung bạn đang thiết kế một khóa đào tạo: năng lực tiếp nhận và lượng bài tập cần được cân đối. Thêm chỗ chứa không bảo đảm có thêm kiến thức hữu ích; cho thêm bài tập cũng không có nghĩa mọi giới hạn đều biến mất. Đây chỉ là phép ví von để nhớ quan hệ, không phải mô tả não người hay kiến trúc model.

Ý nghĩa thực dụng là **đừng đánh giá năng lực bằng một con số tham số tách khỏi dữ liệu và cách huấn luyện**.

### 3.3. Những chỗ trong lời giảng cần hiểu thận trọng

Giảng viên dùng ví dụ model học chậm lại để giải thích việc tăng kích thước. Khi áp dụng thực tế, không thể chỉ thấy chất lượng ngừng tăng rồi kết luận “cần gấp đôi tham số”: nguyên nhân còn có thể nằm ở dữ liệu, thiết lập huấn luyện hoặc cách đo.

Chinchilla bàn về tối ưu **huấn luyện**. Một model nhỏ hơn được huấn luyện lâu hơn có thể hấp dẫn nếu sau đó phải phục vụ rất nhiều lượt hỏi, vì chi phí sử dụng cũng quan trọng. Nghiên cứu về over-training xem xét rõ sự khác biệt giữa chế độ tối ưu huấn luyện và lựa chọn để giảm chi phí suy luận. [Language models scale reliably with over-training](https://arxiv.org/abs/2403.08540).

Video cũng đề cập kiến trúc, kỹ thuật huấn luyện, pruning và các phương pháp lúc sử dụng. Không nên gom tất cả thành “nén model”: **pruning** là loại bỏ thành phần/trọng số; **quantization** chủ yếu giảm độ chính xác biểu diễn số, không mặc nhiên làm giảm số tham số.

### 3.4. Training time và inference time

| Giai đoạn | Việc diễn ra | Ví dụ |
| --- | --- | --- |
| Training time — lúc huấn luyện | Điều chỉnh trọng số từ dữ liệu | Pretraining, fine-tuning |
| Inference time — lúc sử dụng | Dùng trọng số đã có để xử lý yêu cầu | Prompt, reasoning, RAG, gọi công cụ |

**RAG — Retrieval-Augmented Generation, sinh câu trả lời có bổ sung thông tin truy xuất:** ứng dụng tìm tài liệu liên quan rồi cung cấp cho model. Trong cách dùng thông thường này, trọng số không được cập nhật mỗi khi bạn đưa tài liệu vào.

Ví dụ: muốn model trả lời về nội quy mới của công ty, bạn có thể cung cấp đoạn nội quy phù hợp. Không nhất thiết phải huấn luyện lại chỉ để model sử dụng được thông tin đó.

**Điều cần nhớ từ bài 002:** tham số, dữ liệu và cách sử dụng đều ảnh hưởng kết quả. Chinchilla giúp hiểu một khía cạnh của việc huấn luyện, không trực tiếp chỉ ra model tốt nhất cho ứng dụng của bạn.

## 4. Bài 003 — Benchmarks: các bài kiểm tra chuẩn

### 4.1. Phân biệt ba khái niệm

| Khái niệm | Ý nghĩa |
| --- | --- |
| Benchmark | Bộ bài và quy trình dùng để đánh giá |
| Metric — chỉ số | Cách lượng hóa kết quả, chẳng hạn tỷ lệ đúng |
| Leaderboard — bảng xếp hạng | Bảng sắp các model theo kết quả |
| Arena — đấu trường | Hình thức cho các model đối đầu; cách chấm tùy hệ thống |

Một benchmark giống một môn thi. Bạn cần biết đề thi đo gì trước khi diễn giải điểm.

### 4.2. Sáu benchmark được giảng viên giới thiệu

| Benchmark | Năng lực chính được kiểm tra | Không nên suy ra |
| --- | --- | --- |
| GPQA | Câu hỏi khoa học chuyên sâu | Giỏi mọi công việc của nhà khoa học |
| MMLU-Pro | Kiến thức và suy luận ở nhiều lĩnh vực | Không còn sai hoặc mơ hồ |
| AIME | Giải toán thi đấu | Giỏi mọi hình thức tư duy |
| LiveCodeBench | Giải các bài lập trình trong phạm vi đánh giá | Tự xây và duy trì ứng dụng production tốt |
| MuSR | Suy luận nhiều bước từ câu chuyện | Mọi kết luận đời thực đều đáng tin |
| HLE | Câu hỏi học thuật rất khó, nhiều lĩnh vực | Một phép đo hoàn chỉnh cho trí thông minh |

### 4.3. GPQA — câu hỏi khó dù được tra cứu

Tên đầy đủ là **Graduate-Level Google-Proof Q&A**. Bộ gốc có 448 câu trắc nghiệm vật lý, hóa học và sinh học. “Google-proof” nhấn mạnh người không chuyên vẫn khó trả lời dù được tìm kiếm.

Nghiên cứu ban đầu báo cáo khoảng 34% cho nhóm đánh giá không chuyên lĩnh vực, 65% cho chuyên gia có hoặc đang học tiến sĩ đúng lĩnh vực, và 39% cho baseline GPT-4 mạnh nhất của nghiên cứu. Đây là kết quả trong thiết kế thử nghiệm đó, không phải ngưỡng phổ quát để công nhận “trình độ tiến sĩ”. [Bài báo GPQA](https://arxiv.org/abs/2311.12022).

Khi đọc bảng điểm, kiểm tra đúng biến thể GPQA, cấu hình và tập câu hỏi; đừng trộn những phiên bản khác nhau.

### 4.4. MMLU-Pro — tăng độ khó và khả năng phân biệt

**MMLU** viết tắt của Massive Multitask Language Understanding. MMLU-Pro bổ sung câu hỏi khó, thiên về suy luận hơn, mở rộng lựa chọn từ 4 lên 10 và loại bớt câu đơn giản hoặc nhiễu. “Pro” là cải tiến benchmark, không phải bảo đảm tuyệt đối không còn vấn đề. [Bài báo MMLU-Pro](https://arxiv.org/abs/2406.01574).

Ví dụ trực giác: chỉ đoán ngẫu nhiên một đáp án đúng trong 4 lựa chọn có xác suất 25%; trong 10 lựa chọn là 10%. Tuy nhiên, độ khó còn phụ thuộc nội dung câu hỏi và đáp án nhiễu, không chỉ số lựa chọn.

### 4.5. AIME — toán thi đấu

**American Invitational Mathematics Examination** là kỳ thi toán dành cho học sinh có năng lực toán cao. Video dùng AIME làm ví dụ để phân biệt “giải bài toán nhiều bước” với “tính nhẩm”. Khi so kết quả phải xem năm đề, tập đề và số lần thử; hai điểm đều ghi AIME chưa chắc đo trong cùng điều kiện.

### 4.6. LiveCodeBench — đánh giá lập trình với bài mới

LiveCodeBench thu thập bài thi lập trình mới theo thời gian từ các nguồn như LeetCode, AtCoder và Codeforces để giảm nguy cơ model đã thấy bài trong dữ liệu huấn luyện. Nó còn xem xét các khía cạnh như thực thi, tự sửa và dự đoán đầu ra code. [Trang dự án LiveCodeBench](https://livecodebench.github.io/).

**Liên hệ frontend, phần bổ sung:** giải đúng bài thuật toán và sửa một component React trong codebase lớn là hai yêu cầu khác nhau. Việc thứ hai còn cần hiểu yêu cầu, trạng thái, hành vi giao diện, convention và ảnh hưởng tới các phần khác. Điểm lập trình là tín hiệu để chọn ứng viên, rồi vẫn cần thử bằng công việc thực tế.

### 4.7. MuSR — suy luận nhiều bước từ câu chuyện

**Multistep Soft Reasoning** dùng câu chuyện để đánh giá việc kết hợp dữ kiện và suy luận. Ba nhóm gồm bí ẩn án mạng, theo dõi đồ vật và phân công nhóm. Video nhấn mạnh câu chuyện án mạng: model phải xét phương tiện, động cơ và cơ hội. [Mã nguồn và dữ liệu MuSR](https://github.com/Zayne-sprague/MuSR).

Ví dụ tự tạo: A có động cơ nhưng ở nơi khác; B có mặt nhưng không tiếp cận được công cụ; C thỏa nhiều điều kiện hơn. Điểm cần học là phải đối chiếu các dữ kiện, không chọn nhân vật chỉ vì một chi tiết gây chú ý. Trong thực tế, suy luận từ truyện không thay thế bằng chứng về con người thật.

### 4.8. HLE — Humanity’s Last Exam

HLE được tạo để cung cấp những câu hỏi học thuật rất khó khi các bộ đề cũ dần bị chinh phục. Video mô tả bộ gồm khoảng 2.500 câu. Tên gọi “kỳ thi cuối cùng của nhân loại” là tên benchmark, không phải kết luận rằng vượt nó đồng nghĩa vượt con người trong mọi việc.

**Hiệu chỉnh mốc:** phụ đề nhắc cuối năm 2024; bản công bố arXiv đầu tiên mang ngày 24/01/2025. Không dùng những điểm phần trăm trong video làm điểm hiện tại. [Bài báo HLE](https://arxiv.org/abs/2501.14249).

**Điều cần nhớ từ bài 003:** chọn benchmark gần năng lực cần dùng; đọc cả điều kiện đo, không chỉ tên model và điểm.

## 5. Bài 004 — Vì sao benchmark có thể gây hiểu lầm?

### 5.1. Data contamination — dữ liệu đánh giá bị lọt vào dữ liệu học

Nếu model đã gặp câu hỏi hoặc đáp án trong quá trình huấn luyện, điểm cao có thể phản ánh khả năng ghi nhớ một phần. Điều bạn muốn đo lại là khả năng giải bài chưa gặp.

Giữ một phần đề kín hoặc cập nhật đề mới giúp giảm rủi ro, nhưng không tạo bảo đảm tuyệt đối.

### 5.2. Overfitting — tối ưu quá sát một bộ kiểm tra

Ví dụ của giảng viên: tạo nhiều phiên bản, luôn chọn phiên bản đạt GPQA cao nhất, rồi lặp lại. Dù không trực tiếp đưa đáp án vào huấn luyện, quá trình lựa chọn có thể dần bám vào đặc điểm riêng của bộ đề.

| Vấn đề | Cách ghi nhớ |
| --- | --- |
| Contamination | Nội dung đề đã lọt vào quá trình học |
| Overfitting do lựa chọn | Dùng cùng một đề để quyết định quá nhiều lần |

**Áp dụng bổ sung:** tách tập dùng để chỉnh prompt/chọn model và tập kiểm tra cuối chưa dùng để chỉnh. Khi đã nhìn kết quả tập cuối rồi tiếp tục tối ưu theo nó, tập đó không còn thực sự “chưa đụng tới”.

### 5.3. Thay số hoặc tên mà điểm giảm nói lên điều gì?

Video liên hệ nghiên cứu Apple với contamination. Cách kết luận cần thận trọng hơn: điểm giảm khi đổi các chi tiết cho thấy khả năng xử lý biến thể chưa vững; **riêng hiện tượng này không chứng minh chắc chắn dữ liệu đề đã bị học trước**. GSM-Symbolic nghiên cứu biến thiên kết quả khi thay dữ kiện và tăng độ phức tạp của bài toán. [Apple: GSM-Symbolic](https://machinelearning.apple.com/research/gsm-symbolic).

### 5.4. Cấu hình đánh giá không giống nhau

Hai con số khó so sánh nếu khác prompt, số ví dụ mẫu, ngân sách token, số lần thử, công cụ được phép dùng hoặc phiên bản model. Phần cứng và hạ tầng đặc biệt quan trọng khi đo tốc độ; không nên coi phần cứng là lời giải thích mặc định cho mọi chênh lệch độ chính xác.

Kết quả tự công bố cũng cần có phương pháp đủ rõ để người đọc đánh giá mức độ so sánh được.

### 5.5. Phạm vi hẹp và thiếu sắc thái

Trắc nghiệm dễ chấm đúng/sai, nhưng khó phản ánh đầy đủ việc giải thích cho người mới, xử lý yêu cầu mơ hồ hay biết hỏi lại. Một chatbot có thể chọn đúng đáp án ngữ pháp nhưng giảng quá khó cho người học A1.

Đây là khoảng cách giữa **đúng trên đề thi** và **hữu ích trong sản phẩm**.

### 5.6. Saturation — bão hòa điểm số

Khi nhiều model đều gần điểm tối đa, benchmark khó phân biệt chúng. Giống một bài kiểm tra quá dễ với cả lớp: việc tất cả được 10 không cho biết ai phù hợp nhất với nhiệm vụ khó hơn. Điều này giải thích nhu cầu tạo benchmark mới, khó hơn.

### 5.7. Evaluation awareness — phản ứng với bối cảnh đánh giá

Giảng viên nêu khả năng model phản hồi khác khi có dấu hiệu đang được đánh giá, nhất là các bài đo alignment. Trong phạm vi video, đây được trình bày như một mối quan tâm còn cần nghiên cứu, không phải kết luận rằng mọi model đều cố ý gian lận.

**Alignment — sự phù hợp của hành vi với mục tiêu, chỉ dẫn và các ràng buộc mong muốn** rộng hơn việc làm theo mọi câu lệnh. Không cần nhân cách hóa model để hiểu vấn đề: điều kiện bài test có thể khác điều kiện sử dụng thật.

**Điều cần nhớ từ bài 004:** benchmark là bằng chứng có phạm vi và điều kiện. Kết quả tốt nên dẫn tới bước thử thực tế, không kết thúc việc đánh giá.

## 6. Bài 005 — Connect Four: quan sát năng lực bằng trò chơi

### 6.1. Video này là demo, không phải bài code đầy đủ

Giảng viên trình diễn ứng dụng tự xây, cho hai model thi đấu, xem phần đánh giá bàn cờ và mở tab leaderboard. Video có nhắc liên kết walkthrough, mã nguồn và giao diện Gradio, nhưng phụ đề đính kèm không cung cấp đủ địa chỉ hoặc mã để tái dựng nguyên bản.

Tên “Build a Connect Four Leaderboard” dễ khiến bạn chờ một bài viết code từng bước; thực tế phần này chủ yếu giúp hình thành trực giác trước khi học các leaderboard khác.

### 6.2. Luật chơi cần biết

Hai bên lần lượt chọn cột để thả quân. Quân rơi xuống vị trí trống thấp nhất. Bên có bốn quân liên tiếp theo chiều ngang, dọc hoặc chéo thắng. Bàn chuẩn có 7 cột và 6 hàng; mỗi lượt có tối đa 7 lựa chọn, ít hơn nếu có cột đầy.

Số lựa chọn ít không làm bài toán dễ hoàn toàn. Model phải xác định vị trí rơi, nhận biết nước thắng ngay, chặn đối thủ và dự đoán hậu quả.

### 6.3. Điều gì xảy ra trong demo?

Theo phụ đề, giảng viên cho model 120B của OpenAI chạy qua **Groq** đấu với Gemini 2.5 Flash-Lite, rồi cho Claude Sonnet 4.5 đấu GPT-5 mini. Trong các ván được kể, bên đỏ thắng; ở ván sau có tình huống tạo bẫy và đối thủ nhận ra nguy cơ quá muộn.

Đây là **kết quả demo được thuật lại**, không phải bằng chứng một model luôn hơn model kia. Groq trong đoạn này là nền tảng chạy suy luận, không phải Grok của xAI; phụ đề tự động dễ làm nhầm hai tên.

### 6.4. Vì sao giảng viên thay prompt?

Giảng viên cho biết hỏi thẳng “chọn cột nào?” khiến các model chơi kém. Ông đổi sang yêu cầu mô tả bàn cờ, nguy cơ, cơ hội và chiến lược trước khi chọn nước.

Ý nghĩa là cách tổ chức yêu cầu và lượng tính toán lúc trả lời có thể thay đổi chất lượng. Tuy nhiên, một đoạn giải thích dài không bảo đảm nước đi đúng; yêu cầu giải thích cũng không biến model thành phiên bản được huấn luyện chuyên cho reasoning.

Mẫu prompt tự viết để thử ý tưởng, không phải prompt gốc:

```text
Bạn chơi Connect Four. Bạn là quân R; đối thủ là Y.
Các cột được đánh số 0–6. Các hàng được gửi từ trên xuống dưới.
Quân rơi xuống ô trống thấp nhất trong cột. Chỉ chọn cột chưa đầy.

Hãy đánh giá ngắn gọn nước thắng ngay và nguy cơ đối thủ thắng ngay.
Trả về JSON gồm:
{"column": <số nguyên 0–6>, "reason": "giải thích ngắn"}

Bàn cờ: <trạng thái hiện tại>
Cột hợp lệ: <danh sách>
```

### 6.5. Ai phải xác nhận nước đi và kết quả?

**Phần bổ sung về kiến trúc:** model đề xuất nước đi; code phải kiểm tra tính hợp lệ, cập nhật trạng thái và xác định thắng/thua. Không để model tự tuyên bố mình thắng rồi ghi điểm theo lời đó.

Mã giả sau chỉ giải thích trách nhiệm các phần, không phải chương trình chạy hoàn chỉnh:

```python
while not game_over(board):
    player = players[current_turn]
    move = ask_model(player, board, legal_columns(board))

    if not valid_move(board, move):
        handle_invalid_move(player)  # Quy định trước: retry, phạt hoặc thua
        break

    apply_move(board, move, player)
    record_move(player, move)
    current_turn = 1 - current_turn

save_result(compute_result_from_board(board))
```

Từ góc nhìn web: Gradio là giao diện; bộ điều phối gọi model; bộ luật là logic xác định trạng thái đúng; nơi lưu kết quả cung cấp dữ liệu cho leaderboard. Nếu thay Gradio bằng React, các trách nhiệm này vẫn cần tồn tại.

### 6.6. Muốn leaderboard có ý nghĩa hơn

- Cho các model chơi nhiều ván và đổi bên đi trước.
- Giữ rõ phiên bản, prompt, giới hạn thời gian và ngân sách token.
- Quy định xử lý JSON lỗi, cột đầy, timeout và số lần thử lại.
- Ghi cả thắng/hòa/thua, nước không hợp lệ, thời gian và chi phí.
- Nếu thêm công cụ tính nước đi, xem đó là cấu hình hệ thống riêng.

Tỷ lệ thắng trước một nhóm đối thủ yếu không thể so trực tiếp với tỷ lệ thắng trước nhóm mạnh. Ít ván thì kết quả dễ dao động. Phụ đề không đủ để xác nhận leaderboard gốc dùng Elo hay công thức nào khác, vì vậy không nên tự gán cách tính.

**Điều cần nhớ từ bài 005:** một bài thử nhỏ có thể làm lộ lỗi cụ thể mà điểm tổng quát che khuất. Nhưng thắng Connect Four vẫn chỉ là bằng chứng cho bài thử đó.

## 7. Áp dụng: chọn model cho tính năng sửa tiếng Anh

> Phần hướng dẫn bổ sung để biến kiến thức trong video thành một quy trình có thể làm theo. Các model A/B và tiêu chí dưới đây là ví dụ giả định.

### Bước 1 — Định nghĩa kết quả tốt

Giả sử tính năng nhận câu sai, sửa lại, giải thích bằng tiếng Việt dễ hiểu và trả JSON để frontend hiển thị.

Một câu trả lời đạt cần sửa đúng, giữ ý nghĩa, giải thích vừa trình độ và có JSON hợp lệ. Trả lời trôi chảy nhưng đổi nghĩa vẫn là lỗi.

### Bước 2 — Lọc còn 2–3 ứng viên

Dựa vào khả năng tiếng Việt, định dạng đầu ra, tốc độ, ngân sách, context và điều kiện triển khai. Sau đó dùng benchmark liên quan để hỗ trợ sàng lọc. Không cần dùng HLE làm tiêu chí quyết định cho việc sửa câu cơ bản.

### Bước 3 — Chuẩn bị bộ thử đại diện

| Nhóm thử | Ví dụ | Cần quan sát |
| --- | --- | --- |
| Câu sai rõ ràng | She go to school every day. | Sửa thành “She goes…” |
| Câu đã đúng | I am tired. | Không sửa thừa |
| Nhiều lỗi | He don't likes coffee. | Sửa toàn bộ phần liên quan |
| Thiếu ngữ cảnh | I saw her duck. | Nhận ra khả năng nhiều nghĩa |
| Thiếu thông tin | Một câu chưa hoàn chỉnh | Biết yêu cầu làm rõ |
| Đầu ra cho UI | Câu có dấu ngoặc kép | JSON vẫn đúng định dạng |

Có thể bắt đầu bằng vài chục trường hợp đa dạng để phát hiện lỗi rõ ràng. Đây là thử nghiệm ban đầu, chưa đủ để khẳng định độ tin cậy cho mọi người dùng.

### Bước 4 — Chạy và chấm theo tiêu chí đã định

| Tiêu chí | Cách xem |
| --- | --- |
| Sửa đúng | Đối chiếu đáp án, chấp nhận biến thể hợp lý |
| Giữ ý nghĩa | Người chấm kiểm tra |
| Giải thích dễ hiểu | Chấm theo mức độ phù hợp A1 |
| JSON hợp lệ | Parse và kiểm tra schema bằng code |
| Thời gian | Đo thời gian tới phản hồi đầu và hoàn thành |
| Chi phí | Tính cả lượt lỗi, retry và đầu ra dài |

Để tránh chỉ chọn theo cảm giác, nên che tên model khi chấm phần văn bản. Giữ một tập kiểm tra riêng để đánh giá sau khi đã chỉnh prompt.

### Bước 5 — Chọn từ bằng chứng

Nếu A có điểm tổng quát cao nhưng giải thích khó hiểu, còn B đạt yêu cầu tốt hơn trên tập thử của ứng dụng và nằm trong ngân sách, bạn có lý do chọn B. Nếu hai model gần ngang nhau, cần xem sai ở nhóm nào và mức độ nghiêm trọng, không chỉ trung bình cộng.

Sau khi đưa vào dùng, thu thập các trường hợp lỗi mới và đánh giá lại khi đổi prompt hoặc phiên bản model.

## 8. Tự kiểm tra sau bài học

1. Model có nhiều tham số hơn có chắc sửa tiếng Anh tốt hơn không?
2. Training tokens và context window khác nhau thế nào?
3. Model sinh 100 token/giây có chắc tạo cảm giác nhanh hơn model 40 token/giây không?
4. Contamination khác overfitting do lựa chọn model ở đâu?
5. Một ván thắng Connect Four chứng minh được điều gì?
6. Trước khi chốt model, bạn còn phải làm gì sau khi xem leaderboard?

**Đáp án ngắn:**

1. Không; cần thử đúng nhiệm vụ.
2. Một bên là dữ liệu đã dùng để học, bên kia là khả năng chứa ngữ cảnh cho lần xử lý.
3. Không; phải xét thời gian chờ ban đầu và thời gian hoàn thành.
4. Một bên liên quan đề lọt vào dữ liệu học, bên kia có thể xuất hiện do tối ưu/lựa chọn lặp lại theo cùng đề.
5. Model thắng ván đó trong cấu hình đó; chưa đủ để xếp hạng năng lực tổng quát.
6. Đánh giá trên dữ liệu và tiêu chí của ứng dụng, kể cả tốc độ, chi phí và lỗi.

## 9. Nguồn và cách sử dụng tài liệu

Nguồn bài giảng là 5 phụ đề tiếng Anh đính kèm có tên tương ứng:

1. 001 Day 1 — Choosing the Right LLM Model Selection Strategy and Basics.
2. 002 Day 1 — The Chinchilla Scaling Law Parameters, Training Data and Why It Matters.
3. 003 Day 1 — Understanding AI Model Benchmarks GPQA, MMLU-Pro, and HLE.
4. 004 Day 1 — Limitations of AI Benchmarks Data Contamination and Overfitting.
5. 005 Day 1 — Build a Connect Four Leaderboard (Reasoning Benchmark).

Tên riêng sai do nhận dạng giọng nói như “Musa”, “HL”, “Gpca” được chuẩn hóa thành MuSR, HLE, GPQA. Những nguồn nghiên cứu được liên kết ngay tại phần dùng để đối chiếu; chúng bổ sung độ chính xác, không thay thế mạch nội dung của video.

Đọc bản tóm tắt để nhớ cấu trúc trước; quay lại mục 2 khi xem thông số model, mục 4–5 khi đọc benchmark và mục 7 khi cần tự chọn model cho tính năng.
