# Bộ câu hỏi ôn tập và phỏng vấn LLM Engineering

> Bản biên tập lại từ Q&A.md. Các câu hỏi gần nhau đã được gộp theo chủ đề; phần thiếu đã được bổ sung và những cách diễn đạt chưa chính xác đã được sửa. Mỗi mục có câu trả lời ngắn để luyện phỏng vấn cùng phần giải thích để tự học.
>
> **Phạm vi cần hiểu đúng:** ghi chú khóa học mô tả việc xây ứng dụng dùng LLM có sẵn, RAG, agent workflow và fine-tuning cho tác vụ hẹp. Điều đó không đồng nghĩa với việc tự huấn luyện một LLM tổng quát từ đầu.

## Cách dùng tài liệu này

1. Đọc câu trả lời ngắn rồi thử giải thích lại bằng lời của mình.
2. Đọc phần giải thích khi có điểm chưa rõ.
3. Làm câu hỏi tự kiểm tra ở cuối.
4. Khi ôn phỏng vấn, giải thích đúng bản chất và đưa ví dụ; không cần học thuộc từng chữ.

---

## 1. LLM, model và ứng dụng AI

### LLM là gì? Model có “suy nghĩ” hay không?

**Câu trả lời phỏng vấn:** LLM là một loại mô hình AI được huấn luyện trên lượng lớn dữ liệu để xử lý và sinh ngôn ngữ. Với nhiều LLM tạo văn bản, model dự đoán token tiếp theo dựa trên ngữ cảnh rồi lặp lại quá trình đó. Câu trả lời nghe hợp lý vẫn có thể sai.

**Giải thích dễ hiểu:** Model học các mẫu thống kê từ dữ liệu huấn luyện; nó không tra cứu sự thật tự động trừ khi ứng dụng cung cấp tài liệu hoặc công cụ. Vì vậy cần phân biệt model, thông tin nó được cung cấp và dữ kiện đã được kiểm chứng.

### Có những loại AI nào? Mã nguồn mở và đóng nghĩa là gì?

“Mã nguồn mở” và “mã nguồn đóng” là một cách phân biệt về mức độ công khai của model và quyền sử dụng, không phải toàn bộ các loại AI. Cần kiểm tra riêng mã nguồn, trọng số, dữ liệu và giấy phép. Một model có thể tải được trọng số nhưng vẫn có điều kiện cấp phép; tài nguyên công khai không mặc nhiên cho phép mọi cách sử dụng.

### Parameters (tham số) là gì?

**Câu trả lời phỏng vấn:** Parameters là các giá trị số trong model được điều chỉnh khi huấn luyện. Chúng ảnh hưởng cách model chuyển đầu vào thành dự đoán. Số parameters lớn hơn không trực tiếp cho biết model “biết nhiều hơn” hoặc sẽ tốt hơn trên mọi tác vụ.

Ví dụ “JavaScript có 15 điểm, React có 10 điểm, nên 25 parameters là 25 đơn vị kiến thức” không chính xác. Một tham số không tương ứng một-một với một chủ đề hay một sự kiện. Có thể hình dung parameters như các trọng số trong mạng lưới rất lớn; huấn luyện điều chỉnh chúng dựa trên dữ liệu.

### Model, tool và agent khác nhau thế nào?

**Câu trả lời phỏng vấn:** Model sinh câu trả lời hoặc yêu cầu gọi công cụ. Tool là chức năng do ứng dụng cung cấp. Agent là hệ thống trong đó model tham gia chọn bước tiếp theo, quan sát kết quả và tiếp tục cho tới khi hoàn thành hoặc cần con người hỗ trợ.

Không phải “LLM hoàn chỉnh nào cũng gồm model, tool và agent”. Model có thể chỉ nhận văn bản rồi tạo văn bản. Tool và agent là những phần tùy chọn của ứng dụng xây quanh model.

Ví dụ người dùng hỏi giá vé. Model có thể yêu cầu gọi hàm tra giá. Backend kiểm tra tham số và quyền, chạy truy vấn cơ sở dữ liệu rồi gửi kết quả lại model. Model không tự chạy SQL chỉ vì nó đã phát ra yêu cầu tool. Một vòng lặp lặp đi lặp lại cũng chưa đủ để gọi là agent; model cần dùng kết quả vừa nhận để quyết định bước tiếp theo.

### Ollama, Hugging Face Hub và Google Colab là gì?

- **Ollama:** công cụ giúp tải, chạy và cung cấp giao diện gọi model trên máy cá nhân. “Chạy local” có thể tránh phí API, nhưng vẫn cần phần cứng, điện, dung lượng và license phù hợp.
- **Hugging Face Hub:** nền tảng chia sẻ model, dataset và ứng dụng demo. Có nội dung công khai, riêng tư hoặc bị giới hạn truy cập. Cần đọc model card, điều khoản và license.
- **Google Colab:** môi trường notebook chạy trên cloud, đôi khi cung cấp GPU theo điều kiện và giới hạn của dịch vụ. Không nên mặc định lúc nào cũng có GPU miễn phí.

Không phải model nào trong Ollama hay Hugging Face đều có cùng license. Colab hữu ích khi máy cá nhân thiếu tài nguyên, nhưng không cần GPU cho mọi lời gọi API hay model nhỏ.

---

## 2. Training, inference, fine-tuning và RLHF

### Training, fine-tuning và inference khác nhau thế nào?

**Câu trả lời phỏng vấn:** Training cập nhật các tham số model bằng dữ liệu. Fine-tuning là huấn luyện tiếp model đã pretrain để thích nghi với mục tiêu cụ thể. Inference là dùng model đã huấn luyện để tạo dự đoán từ đầu vào mới; thông thường trọng số không đổi trong lượt inference.

Ví dụ:

- Gọi API GPT, Claude hoặc Gemini để hỏi đáp là inference.
- Huấn luyện tiếp model bằng ví dụ tác vụ định giá là fine-tuning.
- Huấn luyện model tổng quát từ điểm bắt đầu là training from scratch; đây là bài toán khác, cần nguồn lực lớn hơn nhiều.

**Upload dataset không phải training.** Chỉ tải file lên dịch vụ chưa có nghĩa model đã cập nhật trọng số. Batch processing cũng chỉ xử lý nhiều yêu cầu theo lô.

### RLHF là gì?

**Câu trả lời phỏng vấn:** RLHF là Reinforcement Learning from Human Feedback, tức học tăng cường từ phản hồi của con người. Đây là một nhóm phương pháp hậu huấn luyện/alignment có thể dùng để điều chỉnh câu trả lời theo đánh giá hoặc sở thích của con người.

Có thể hình dung người đánh giá so sánh các câu trả lời, cho biết câu nào hữu ích hơn; những tín hiệu đó tham gia vào quy trình huấn luyện. RLHF không chạy mỗi khi người dùng gửi prompt. Không phải mọi model trợ lý đều dùng chính xác cùng một cách huấn luyện RLHF.

### AI có biết mình là ai hoặc nhớ người dùng không?

**Câu trả lời phỏng vấn:** Model không tự biết danh tính thật hay có nhận thức về bản thân. Một lượt gọi thường chỉ có nội dung được gửi trong lượt đó. Ứng dụng tạo cảm giác liên tục bằng cách gửi lại lịch sử, hồ sơ hoặc thông tin được lưu bên ngoài.

Nếu tên người dùng có trong lịch sử được gửi kèm, model có thể dùng tên đó. Nếu một lần gọi mới không có lịch sử hay hồ sơ, model thường không biết thông tin ấy. Lịch sử cũng làm prompt dài hơn; ứng dụng có thể giới hạn, tóm tắt hoặc truy xuất phần liên quan.

---

## 3. Prompt, token và hội thoại

### System prompt và user prompt là gì?

**Câu trả lời phỏng vấn:** System prompt đặt vai trò, mục tiêu, quy tắc và định dạng chung. User prompt chứa yêu cầu hoặc dữ liệu cụ thể của người dùng. Cả hai hướng dẫn inference, không tự cập nhật tham số model.

Ví dụ: system yêu cầu “giảng như gia sư, giải thích từng bước”; user hỏi “giải thích vòng đời component React”. Prompt là chỉ dẫn chứ không phải rào chắn an ninh tuyệt đối. Backend vẫn phải kiểm tra quyền và dữ liệu.

### Token, Token ID, tokenizer và context window là gì?

**Câu trả lời phỏng vấn:** Token là đơn vị văn bản mà model xử lý; có thể là một từ, mảnh từ hoặc dấu câu. Token ID là số nguyên đại diện cho token trong từ vựng của tokenizer. Context window là lượng token model có thể xử lý trong một lượt, tính trên ngữ cảnh đầu vào và phần sinh ra theo giới hạn của model.

Luồng đơn giản:

Văn bản → tokenizer chia thành token → đổi thành ID → model xử lý → model sinh token ID → tokenizer chuyển về văn bản.

Một từ không nhất thiết bằng một token. Số token thay đổi theo ngôn ngữ và tokenizer; muốn ước tính chính xác cần tokenizer tương ứng với model.

### Autoregressive là gì?

Với mô hình sinh văn bản tự hồi quy, model dự đoán token tiếp theo từ ngữ cảnh hiện tại, thêm token đó vào chuỗi rồi tiếp tục dự đoán. Lặp lại quá trình này sẽ tạo ra câu trả lời. Model không nhất thiết tạo cả câu trả lời trong một phép tính duy nhất.

### Streaming là gì?

**Câu trả lời phỏng vấn:** Streaming cho phép ứng dụng nhận và hiển thị các phần đầu ra trong khi model vẫn đang sinh tiếp, thay vì chờ toàn bộ câu trả lời hoàn tất. Nó có thể giúp người dùng thấy phản hồi sớm hơn, nhưng không tự tăng tốc các bước tiền xử lý đã diễn ra trước khi gọi model.

### Vì sao chatbot có lịch sử dù API stateless?

Mỗi lần gọi API thường độc lập; backend tạo một danh sách tin nhắn mới gồm system, history và câu hỏi hiện tại. Lịch sử được gửi lại làm model có đủ ngữ cảnh để trả lời nối tiếp. Đây là cách ứng dụng tạo tính liên tục, không phải ký ức tự phát của model.

---

## 4. Công cụ và thư viện trong khóa học

### Gradio và callback của gr.ChatInterface là gì?

**Câu trả lời phỏng vấn:** Gradio là thư viện Python giúp dựng giao diện web cho hàm Python. Trong gr.ChatInterface, callback nhận tin nhắn mới và lịch sử chat; chương trình kết hợp chúng với hướng dẫn hệ thống rồi gọi model.

Có thể hình dung callback như handler trong React: giao diện gọi một hàm khi người dùng thao tác. Gradio lo nhiều phần giao diện, còn callback và backend quyết định nội dung gửi cho model. History phải được chuyển tiếp rõ ràng trong mỗi lượt gọi.

### Hugging Face pipeline là gì?

Pipeline là lớp tiện ích giúp chạy inference cho tác vụ phổ biến bằng cách ghép các bước tiền xử lý, gọi model và xử lý kết quả. Nó tiện để thử model nhanh. Khi cần kiểm soát sâu dữ liệu hoặc cách chạy, có thể dùng API thấp hơn. Trong nội dung khóa học, pipeline là để chạy model có sẵn, không tự fine-tune model.

### AutoTokenizer, AutoModelForCausalLM và chat template là gì?

- **AutoTokenizer:** chọn tokenizer tương ứng với model, chuyển văn bản thành token ID và giải mã ID thành văn bản.
- **AutoModelForCausalLM:** nạp lớp model dùng cho causal language modeling, thường dự đoán token tiếp theo để sinh văn bản.
- **Chat template:** chuyển các tin nhắn có vai trò system/user/assistant thành format token mà model cụ thể được huấn luyện để nhận.

“Auto” không có nghĩa thư viện tự chọn model tốt nhất. Tokenizer, cấu hình và trọng số phải tương thích. Model chat khác nhau có thể dùng chat template khác nhau.

### Quantization là gì? Đánh đổi điều gì?

**Câu trả lời phỏng vấn:** Quantization lưu trọng số ở độ chính xác số thấp hơn để giảm dung lượng và thường giảm bộ nhớ cần khi nạp model. Đổi lại, chất lượng có thể giảm; tác động tới tốc độ tùy phần cứng và cách triển khai.

Quantization không làm giảm số lượng parameters, và không bảo đảm mọi máy chạy nhanh hơn. Nó đổi độ chính xác biểu diễn để tiết kiệm tài nguyên.

### Vì sao Python được dùng nhiều trong AI?

Python phổ biến nhờ hệ sinh thái thư viện cho dữ liệu, học máy và notebook. Tuy nhiên, không bắt buộc toàn bộ ứng dụng AI phải viết bằng Python. Bạn có thể viết giao diện và backend bằng TypeScript/Node.js rồi gọi API model hoặc dịch vụ Python. Muốn theo notebook và chạy QLoRA trong khóa, cần học đủ Python và môi trường liên quan.

---

## 5. Chọn model và đánh giá

### Quy trình chọn model như thế nào?

**Câu trả lời phỏng vấn:** Xác định tác vụ và tiêu chí đạt trước; dùng benchmark để lọc một số model ứng viên; thử chúng trên cùng bộ ví dụ đại diện; đo chất lượng, độ trễ, chi phí và độ ổn định rồi chọn.

1. Hiểu người dùng và vấn đề.
2. Xác định tiêu chí đạt bằng ví dụ.
3. Chọn vài model đáng thử.
4. Cho chúng xử lý cùng đầu vào và cùng quy tắc chấm.
5. Xem các trường hợp sai, chi phí và thời gian.
6. Chọn model phù hợp rồi theo dõi khi dùng thật.

Leaderboard giúp chọn ứng viên, không quyết định thay phép đo trên bài toán của bạn.

### Benchmark và Chinchilla Scaling Law là gì?

Benchmark là bộ kiểm tra được chuẩn hóa tương đối để so sánh một số năng lực model. Ghi chú khóa học nêu GPQA, MMLU-Pro, AIME, LiveCodeBench, MuSR và Humanity’s Last Exam. Chúng đo các dạng nhiệm vụ khác nhau; điểm cao không đảm bảo model phù hợp ứng dụng của bạn. Cần để ý phiên bản, phương pháp chấm và khả năng dữ liệu benchmark đã xuất hiện trong huấn luyện hay chưa.

Chinchilla Scaling Law nghiên cứu sự cân bằng giữa kích thước model, lượng dữ liệu huấn luyện và ngân sách tính toán trong các điều kiện cụ thể. Ý chính là tăng số parameters một mình không đảm bảo hiệu quả. Đây không phải công thức đơn giản để tuyên bố model lớn hơn luôn tốt hơn.

---

## 6. RAG, embedding và vector database

### RAG là gì? Khác system prompt và fine-tuning thế nào?

**Câu trả lời phỏng vấn:** RAG tìm tài liệu liên quan từ kho dữ liệu rồi đưa văn bản tìm được vào ngữ cảnh để LLM trả lời. System prompt đặt quy tắc chung; RAG cung cấp dữ kiện cho câu hỏi; fine-tuning cập nhật tham số model qua huấn luyện. RAG thông thường không cập nhật trọng số và không làm model nhớ vĩnh viễn tài liệu.

RAG có thể dùng tìm kiếm từ khóa, cơ sở dữ liệu hoặc vector search. **Không bắt buộc phải dùng vector database.**

### Chunking, embedding và vector store là gì?

**Chunking** là chia tài liệu dài thành đoạn nhỏ để tìm và cung cấp đúng phần liên quan. Chunk quá nhỏ có thể làm mất ngữ cảnh; chunk quá lớn có thể lẫn nhiều ý và tốn token. Kích thước cần thử theo tài liệu, không có con số tối ưu cho mọi trường hợp.

**Embedding** là biểu diễn số do model embedding tạo từ văn bản. Nó giúp tìm những nội dung có liên quan về mặt ngữ nghĩa, ngay cả khi dùng từ khác nhau. Vector gần nhau không bảo đảm hai câu hoàn toàn đồng nghĩa.

So với tìm từ khóa, vector search có thể tìm nội dung liên quan dù câu hỏi dùng từ khác tài liệu. Tìm từ khóa thường nhanh và dễ giải thích, nhưng có thể bỏ sót từ đồng nghĩa hoặc cách diễn đạt khác; embedding search linh hoạt hơn về ý nghĩa nhưng cũng có thể truy xuất nhầm. Có thể kết hợp hai cách rồi đo kết quả. Cosine similarity là một cách phổ biến để so hướng của hai vector; điểm cao thường chỉ mức gần nhau hơn trong không gian embedding đó, không phải xác suất hai câu đúng cùng nghĩa.

**Embedding model** thường dùng để tạo vector phục vụ tìm kiếm; nó có thể khác LLM sinh câu trả lời. LLM nhận văn bản gốc được truy xuất, không giải mã vector thành tài liệu.

**Vector store/database**, như Chroma trong khóa học, lưu vector cùng văn bản hoặc metadata để tìm các mục gần với vector truy vấn. Nếu đổi embedding model, cần tạo vector tài liệu và truy vấn bằng model tương thích; không nên trộn vector từ hai không gian khác nhau chỉ vì chúng có cùng số chiều.

### RAG hoạt động qua những bước nào?

**Chuẩn bị dữ liệu:** đọc và làm sạch tài liệu → chia chunk → tạo embedding → lưu vector cùng văn bản và metadata.

**Mỗi câu hỏi:** biến câu hỏi thành truy vấn → tìm các chunk liên quan → tùy chọn sắp xếp lại bằng reranker → ghép văn bản được tìm thấy với câu hỏi và chỉ dẫn → gọi LLM → trả lời kèm nguồn nếu có.

Nếu kho không chứa đáp án, hệ thống nên nói chưa tìm thấy đủ thông tin thay vì suy đoán. Chỉ thị trong prompt hữu ích nhưng không thay thế việc kiểm tra chất lượng.

### Retrieval evaluation và generation evaluation khác nhau thế nào?

**Câu trả lời phỏng vấn:** Retrieval eval xem hệ thống có tìm đúng và đủ tài liệu không. Generation eval xem model có trả lời chính xác, đầy đủ và liên quan dựa trên tài liệu được cấp không.

Khi câu trả lời sai, kiểm tra theo luồng: tài liệu gốc → chunk → kết quả truy xuất → context gửi cho model → câu trả lời. Nếu retriever tìm nhầm, đổi sang model lớn hơn chưa chắc sửa được lỗi gốc. Hãy dùng bộ câu hỏi có đáp án đã kiểm chứng để so sánh thay đổi.

Advanced RAG gồm những cách như query rewriting, hybrid search, reranking, thêm metadata hoặc lấy đoạn lân cận. Mỗi cách xử lý kiểu lỗi riêng; chỉ nên thêm khi đánh giá cho thấy có ích.

---

## 7. Dữ liệu và học máy

### Training và generalization là gì? Vì sao chia train/validation/test?

Training cập nhật model dựa trên tập train. Generalization là khả năng áp dụng quy luật đã học vào dữ liệu mới.

- **Train:** dùng để học/cập nhật.
- **Validation:** dùng để so sánh cấu hình và chọn checkpoint trong quá trình phát triển.
- **Test:** giữ riêng để đánh giá cuối sau khi đã chốt lựa chọn.

Nếu dùng test để chỉnh cấu hình nhiều lần, nó dần không còn là phép đo độc lập. Với sản phẩm trùng hoặc rất giống nhau, cần loại trùng trước khi chia tập để tránh leakage.

### Vì sao làm sạch dữ liệu và khảo sát phân bố?

Dữ liệu thiếu, sai, trùng hoặc lệch có thể khiến model học tín hiệu không phù hợp và làm đánh giá thiếu công bằng. Trong dự án giá sản phẩm, ghi chú nêu việc bỏ dòng thiếu giá, giới hạn phạm vi giá, chuẩn hóa mô tả, loại trùng và khảo sát phân bố danh mục/giá. Các ngưỡng cụ thể thuộc thí nghiệm đó, không phải quy tắc chung.

Ghi chú Q&A mô tả việc chọn khoảng 820.000 sản phẩm, ưu tiên một số nhóm, rồi chia và lưu các phiên bản Full/Lite để tái sử dụng. Hãy xem đây là quy mô của dự án khóa học, không phải kích thước tối thiểu cho mọi bài toán. Tập Lite giúp thử pipeline nhanh; tập lớn hơn dùng cho huấn luyện hoặc đánh giá ở quy mô lớn hơn.

Tên dataset có chữ “Reviews” không có nghĩa bài toán nhất thiết dùng đánh giá khách hàng; cần kiểm tra các trường được đưa vào model.

### Baseline là gì và tại sao cần?

Baseline là kết quả của cách làm đơn giản dùng làm mốc. Ví dụ dự đoán giá trung bình cho mọi sản phẩm. Nếu giải pháp phức tạp hơn không vượt baseline trên cùng dữ liệu và cùng cách chấm, chưa có bằng chứng rằng nó cải thiện vấn đề.

### Linear Regression và XGBoost khác nhau thế nào?

Linear Regression mô hình hóa quan hệ tuyến tính giữa đặc trưng và kết quả. XGBoost kết hợp nhiều cây quyết định bằng boosting để có thể biểu diễn quan hệ phi tuyến và tương tác phức tạp hơn. XGBoost có thể thắng ở một bộ dữ liệu nhưng không phải lúc nào cũng tốt hơn.

Trong ghi chú Week 6, XGBoost có sai số trung bình 68,23 USD và Linear Regression đơn giản 101,56 USD; NLP + Linear Regression đạt 76,81 USD. Điều này không chứng minh thuật toán XGBoost luôn tốt hơn. Cần so sánh trên cùng dữ liệu và đặc trưng; khi đổi cả cách biểu diễn đầu vào lẫn model, không thể quy mọi cải thiện cho riêng thuật toán.

### Loss, MAE, MSE và R² khác nhau thế nào?

- **Training loss:** mục tiêu toán học được tối ưu trên train.
- **Validation loss:** mục tiêu tương tự trên dữ liệu không dùng cập nhật.
- **MAE:** độ lệch tuyệt đối trung bình; dự đoán giá thì thường diễn giải theo USD.
- **MSE:** trung bình bình phương sai lệch, phạt sai số lớn nặng hơn MAE.
- **R²:** chỉ số về mức độ giải thích biến thiên theo định nghĩa của nó; không phải phần trăm dự đoán đúng.

MAE 20 USD nghĩa là sai lệch tuyệt đối trung bình trên bộ đánh giá là 20 USD, không có nghĩa mọi dự đoán đều sai đúng 20 USD. Loss của LLM thường đo dự đoán token, không đo trực tiếp số USD sai; loss giảm chưa chứng minh ứng dụng định giá tốt hơn.

### Vì sao fine-tuning không đảm bảo kết quả tốt hơn?

Nó phụ thuộc dữ liệu, định dạng, kích thước tập, siêu tham số và cách đánh giá. Ghi chú Week 6 ghi nhận một thí nghiệm có sai số trung bình 75,91 USD cho GPT-4.1 Nano fine-tuned và 62,51 USD cho GPT-4.1 Nano chưa fine-tuned. Đây là bằng chứng một lần fine-tuning có thể kém hơn trên tác vụ đó, không chứng minh fine-tuning luôn xấu. Các kết quả chỉ so được công bằng khi tập đánh giá và cách đo tương thích.

---

## 8. Fine-tuning, LoRA và QLoRA

### Fine-tuning trong dự án khóa học diễn ra thế nào?

Dự án dùng model đã pretrain, tạo ví dụ mô tả sản phẩm và giá theo dạng prompt/completion, huấn luyện tiếp rồi đánh giá trên test. Đây là tinh chỉnh model có sẵn cho tác vụ hẹp, không phải huấn luyện LLM tổng quát từ đầu.

Cần kiểm tra dữ liệu có đúng định dạng, đáp án có bị cắt mất, train/validation/test có tách đúng và metric có phản ánh mục tiêu không. Upload dataset hay chạy batch không tự nó là fine-tuning.

### LoRA và QLoRA là gì?

**Câu trả lời phỏng vấn:** LoRA đóng băng phần lớn trọng số model nền, thêm các ma trận hạng thấp nhỏ ở một số lớp và chỉ huấn luyện phần bổ sung. QLoRA kết hợp LoRA với lượng tử hóa model nền để giảm nhu cầu bộ nhớ.

LoRA giảm số tham số cần cập nhật và thường giảm phần adapter cần lưu. Nhưng model nền vẫn cần được nạp và tính toán, nên LoRA không có nghĩa tổng tài nguyên bằng không. Adapter thường cần model nền, tokenizer và cấu hình tương thích để chạy; adapter không nhất thiết độc lập như một model đầy đủ.

### Training loss, validation loss và overfitting là gì?

Training loss đo mức model khớp dữ liệu train theo mục tiêu huấn luyện. Validation loss đo cùng mục tiêu trên dữ liệu không được dùng cập nhật trọng số. Nếu training loss giảm nhưng validation loss tăng, đó là dấu hiệu có thể overfit.

Giống như học sinh thuộc bộ đề đã luyện nhưng làm kém đề mới. Không nên chọn checkpoint chỉ vì nó mới nhất hoặc có training loss thấp nhất. Dùng validation để chọn; giữ test cho đánh giá cuối. Với dự đoán giá, đo thêm MAE vì loss token không phải số USD sai.

---

## 9. Deployment và áp dụng vào sản phẩm

### Modal và SpecialistAgent là gì trong capstone?

Trong capstone, Modal được dùng làm môi trường cloud chạy dịch vụ/model Python; SpecialistAgent là lớp ứng dụng gọi dịch vụ chuyên dự đoán giá. Đây là ví dụ đưa model đã fine-tune vào một hệ thống lớn hơn.

Serverless không có nghĩa là không có server; nền tảng quản lý phần lớn hạ tầng thay bạn. Khi triển khai thật cần xem thời gian khởi động, độ trễ, giới hạn và chi phí. Model định giá trong bài là model chuyên một tác vụ hẹp, không phải trợ lý lập trình tổng quát.

### Năm bước áp dụng AI

1. **Understand:** hiểu vấn đề, người dùng và tiêu chí thành công.
2. **Prepare:** chuẩn bị dữ liệu, quy tắc và trường hợp kiểm thử.
3. **Select:** chọn prompting, RAG, tool, ML hoặc fine-tuning.
4. **Customize:** điều chỉnh theo kết quả đo.
5. **Productionize:** tích hợp, theo dõi chất lượng, lỗi, chi phí và trải nghiệm.

Không bắt buộc phải fine-tune. Hãy chọn phương pháp đơn giản nhất đáp ứng tiêu chí rồi tăng độ phức tạp khi có bằng chứng cần thiết.

### Áp dụng vào trợ lý lập trình cá nhân

Hãy bắt đầu bằng model có sẵn cùng khả năng tìm trong tài liệu hoặc repository. Ứng dụng tìm các file liên quan, đưa phần đó vào ngữ cảnh và yêu cầu model giải thích kèm đường dẫn nguồn. RAG giúp model tham khảo dự án; nó không huấn luyện model và không cấp quyền sửa code.

Sau khi hỏi đáp ổn định mới thêm tool đọc file, chạy kiểm tra hoặc tạo diff. Backend cần giới hạn phạm vi file và lệnh được phép. Fine-tuning không phải bước bắt buộc cho phiên bản đầu.

---

## 10. Câu trả lời ngắn thường gặp khi phỏng vấn

**RAG có phải fine-tuning không?** Không. RAG tìm dữ liệu và đưa vào ngữ cảnh lúc trả lời; fine-tuning cập nhật tham số qua huấn luyện.

**Embedding có phải câu trả lời của AI không?** Không. Embedding là biểu diễn số thường dùng để tìm nội dung; LLM sinh câu trả lời từ văn bản được cung cấp.

**Model gọi tool như thế nào?** Model phát yêu cầu và tham số; backend kiểm tra, chạy hàm thật rồi gửi kết quả lại.

**Parameters nhiều hơn có luôn tốt hơn không?** Không. Chất lượng còn phụ thuộc dữ liệu, huấn luyện và mức phù hợp với tác vụ.

**Loss giảm có nghĩa ứng dụng tốt hơn không?** Chưa chắc. Cần đo metric gắn với nhiệm vụ và xem lỗi thực tế.

**Có thể dùng khóa học để huấn luyện ChatGPT từ đầu không?** Không. Khóa học tập trung vào ứng dụng dùng model có sẵn, các thử nghiệm ML và fine-tuning tác vụ cụ thể. Huấn luyện model nền tảng từ đầu là bài toán khác về quy mô và tài nguyên.

---

## 11. Câu hỏi tự kiểm tra

1. Vì sao chatbot có vẻ nhớ người dùng dù model không tự nhớ một lần gọi trước?
2. Nếu RAG trả lời sai, bạn kiểm tra những bước nào trước khi đổi model?
3. Vì sao JSON đúng cấu trúc vẫn có thể chứa thông tin sai?
4. Tại sao phải có baseline?
5. Bạn làm gì khi training loss giảm nhưng validation loss tăng?
6. Vì sao cần dùng cùng test set khi so sánh model?
7. Khi nào prompting hoặc RAG hợp lý hơn fine-tuning?
8. LoRA tiết kiệm phần nào và phần nào vẫn cần tài nguyên?
9. Vì sao đổi embedding model thường cần tạo lại vector?
10. Tool nào bạn sẽ cấp cho trợ lý đọc repository trước, và giới hạn quyền ra sao?

## 12. Đối chiếu với câu hỏi ban đầu

- **Q1, Q3, Q7–Q10:** LLM, loại model, ứng dụng, tool, agent.
- **Q5–Q6, Q18–Q19, Q45–Q46, Q51–Q53:** parameters, training/inference, RLHF, fine-tuning và dữ liệu.
- **Q2, Q11–Q15, Q34–Q37:** prompt, lịch sử, streaming, Gradio/callback, token và autoregressive.
- **Q16–Q17, Q20–Q24, Q33:** Hugging Face, Colab, Python, pipeline, tokenizer, chat template, quantization.
- **Q25–Q27, Q54:** chọn model, benchmark, Chinchilla và chiến lược áp dụng AI.
- **Q28–Q44:** RAG, system prompt, chunking, embedding, vector store, đánh giá và Advanced RAG.
- **Q47–Q50, Q55–Q58:** dữ liệu, baseline, Linear Regression, XGBoost, metric và fine-tuning.
- **Q59–Q64:** LoRA, QLoRA, loss, validation và overfitting.
- **Q65–Q66:** Modal và SpecialistAgent.

### Các hiệu chỉnh quan trọng

- Parameters không phải số lượng đơn vị kiến thức.
- Model không bắt buộc gồm tool và agent.
- Hugging Face Hub có tài nguyên riêng tư và bị giới hạn; cần kiểm tra license.
- Colab không đảm bảo lúc nào cũng có GPU miễn phí.
- RAG không nhất thiết cần vector database.
- Embedding hỗ trợ tìm kiếm, nhưng không đảm bảo các câu gần vector luôn đồng nghĩa.
- Streaming giúp nhận đầu ra theo phần, không làm nhanh toàn bộ pipeline.
- Số liệu benchmark và thí nghiệm khóa học chỉ có ý nghĩa trong bối cảnh phép thử đó.
- Fine-tuning có thể cải thiện hoặc làm giảm kết quả; cần so với baseline và đánh giá đúng tác vụ.

### Nguồn đối chiếu

Q&A.md; Week1_Notes.md; Week2_Notes.md; Week3_Notes.md; Week4_Notes.md; Week5_Notes.md; Week6_Notes.md; Week-07-QLoRA-Ghi-note.md; Week8_Notes.md.
