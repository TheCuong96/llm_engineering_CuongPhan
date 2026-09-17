# AI — Day 4: Hiểu cách huấn luyện mạng nơ-ron và đánh giá LLM

> Bản giảng giải đầy đủ cho video 017–021. Đọc bản tóm tắt trước nếu bạn muốn nắm mạch bài nhanh.
>
> Tài liệu được viết lại từ toàn bộ 5 phụ đề, có đối chiếu các khung hình chứa mã nguồn và kết quả quan trọng. Các ví dụ ví von và phần “Giải thích thêm” là phần bổ sung để dễ học; đây không phải bản dịch từng câu hay bản sao đầy đủ notebook. Số liệu là kết quả trong video, không phải bảng xếp hạng AI hiện tại.

## 1. Cả phần này thực sự muốn dạy điều gì?

**Bạn đang học cách chọn và đánh giá một giải pháp AI cho một nhiệm vụ cụ thể: đọc mô tả sản phẩm rồi ước lượng giá bán.**

Hãy tưởng tượng bạn có một cửa hàng với rất nhiều mặt hàng. Bạn muốn có một công cụ: nhập mô tả “bàn đạp hiệu ứng cho đàn guitar điện, thương hiệu X, tính năng Y”, công cụ trả về giá ước tính bằng USD.

Có nhiều cách giải quyết: đoán một giá cố định, dùng thuật toán học máy, tự huấn luyện mạng nơ-ron, hoặc hỏi một LLM có sẵn. Giảng viên lần lượt thử các cách và đo độ sai để biết cách nào hiệu quả trong thí nghiệm này.

Phần học này có ba đích đến:

1. Hiểu **training — huấn luyện** thực sự làm thay đổi điều gì bên trong mô hình.
2. Tận mắt thấy một mạng nơ-ron nhỏ được tạo, huấn luyện và sử dụng bằng PyTorch.
3. Biết kiểm tra LLM bằng dữ liệu và thước đo, thay vì chỉ thấy câu trả lời có vẻ hợp lý rồi tin rằng nó giỏi.

**Có tự tạo AI trong bài này, nhưng đó là một mô hình chuyên đoán giá. Bạn chưa tự xây một ChatGPT từ đầu.** Đến đoạn dùng GPT, Claude, Gemini và Grok, bạn đang sử dụng mô hình đã được nhà cung cấp huấn luyện. Fine-tuning chỉ được giới thiệu là nội dung buổi tiếp theo.

### Vai trò của từng video

| Video | Nội dung chính | Câu hỏi bạn cần trả lời được sau khi học |
|---|---|---|
| 017 | Giới thiệu vòng lặp huấn luyện, parameters và hyperparameters | Máy học từ lỗi sai bằng cách nào? |
| 018 | Giảng viên tự đoán giá để làm human baseline | Nhiệm vụ này khó đến đâu đối với một người? |
| 019 | Biến mô tả thành số, xây và huấn luyện mạng bằng PyTorch | Từ văn bản đến mô hình dự đoán giá cần những bước gì? |
| 020 | Thử GPT-4.1 nano và Claude Opus 4.5 có sẵn | Không huấn luyện thêm cho bài toán này, LLM làm được đến đâu? |
| 021 | Thử thêm Gemini, Grok, GPT-5.1 và tổng kết | So sánh các mô hình như thế nào, và kết luận đến mức nào là hợp lý? |

Tên tệp 020 nhắc GPT-4o-mini, nhưng nội dung chạy GPT-4.1 nano. Tài liệu này theo nội dung thực tế.

## 2. Hiểu bài toán trước khi học thuật toán

### Đầu vào, đáp án và dự đoán

| Thành phần | Trong bài này | Ký hiệu thường gặp |
|---|---|---|
| Input — đầu vào | Mô tả sản phẩm, sau đó được biểu diễn thành số | `X` |
| Ground truth / Label — đáp án chuẩn / nhãn | Giá đã ghi trong dữ liệu | `y` |
| Prediction — dự đoán | Giá mô hình ước lượng | `ŷ`, đọc là “y mũ” |

Ví dụ thật trong bài: sản phẩm bàn đạp hiệu ứng guitar có giá **219 USD**. Giảng viên đoán **120 USD**; GPT-4.1 nano đoán **180 USD**. Độ lệch lần lượt là 99 USD và 39 USD.

Đây là **regression — hồi quy**, vì cần dự đoán một giá trị số. Nếu yêu cầu chỉ là “sản phẩm thuộc nhóm điện tử hay quần áo?”, đó mới là **classification — phân loại**.

### Dữ liệu đã được chuẩn bị ở những buổi trước

Video 017 nhắc lại: dữ liệu sản phẩm Amazon được lấy từ một bộ dữ liệu trên Hugging Face, chọn lọc và dùng LLM để viết mô tả ngắn gọn hơn. Sau đó giảng viên đã thử dự đoán ngẫu nhiên, giá trung bình, Linear Regression, Random Forest và XGBoost.

Những bước này là bối cảnh, không được hướng dẫn đầy đủ lại trong 5 video hiện tại. Cụm video này bắt đầu ở giai đoạn **đã có dữ liệu để tiếp tục thí nghiệm**.

Video có chế độ dữ liệu nhẹ và đầy đủ; giảng viên dùng bản lớn khoảng 800.000 mẫu và khuyên người học bắt đầu bằng bản nhẹ. Trong quá trình xây mạng, một phần dữ liệu huấn luyện còn được tách ra làm validation.

### Vì sao cần train, validation và test?

Ví von với học sinh:

| Tập dữ liệu | Ví von | Vai trò |
|---|---|---|
| Training set | Bài tập được học và sửa | Dùng để cập nhật tham số |
| Validation set | Bài kiểm tra thử | Theo dõi việc học, chọn cấu hình |
| Test set | Đề thi cuối cùng | Đánh giá sau khi chốt cách làm |

**Generalization — khả năng khái quát hóa** là học được quy luật để làm tốt cả với sản phẩm mới. **Overfitting — quá khớp** là làm rất tốt bài đã học nhưng kém với dữ liệu mới, giống học thuộc đáp án thay vì hiểu bài.

Giải thích thêm: mô tả đầu vào không nên vô tình chứa giá cần đoán. Nếu dùng test để sửa prompt hoặc chọn cấu hình nhiều lần, cần một tập kiểm tra cuối cùng khác chưa bị sử dụng để điều chỉnh.

## 3. Video 017: “Huấn luyện” nghĩa là sửa các con số bên trong mô hình

### Mạng nơ-ron là gì trong bài này?

Có thể hình dung nó như một máy tính nhiều tầng. Nó nhận các con số đại diện cho mô tả, thực hiện nhiều phép tính, rồi cho ra một con số dự đoán giá.

Các phép tính chứa **weights — trọng số** và **biases — độ lệch**. Đây là các **parameters — tham số** được điều chỉnh khi học.

Ví dụ minh họa đơn giản, không phải công thức thật của mô hình trong video:

```text
Giá dự đoán = 30 + 40 × có_chống_ồn + 20 × có_bluetooth
```

Ban đầu các hệ số có thể chưa hợp lý. Sau khi xem nhiều ví dụ kèm giá thật, quá trình học điều chỉnh chúng. Mạng thật có nhiều tầng và nhiều hệ số hơn, nhưng nguyên tắc “dự đoán, đo sai, sửa tham số” vẫn giữ nguyên.

Không nên hiểu mỗi tham số tương ứng rõ ràng với một kiến thức như “giá Bluetooth”. Trong mạng thật, nhiều tham số phối hợp tạo ra kết quả.

### Bốn bước huấn luyện

Giả sử mô hình dự đoán một sản phẩm giá 150 USD, trong khi dữ liệu ghi 200 USD.

| Bước | Thuật ngữ | Hiểu đơn giản |
|---|---|---|
| 1 | Forward pass — lượt tính xuôi | Cho mô tả đi qua mạng để nhận dự đoán 150 |
| 2 | Loss calculation — tính hàm mất mát | So 150 với 200 để đo mức sai |
| 3 | Backward pass / Backpropagation — lan truyền ngược | Tính độ nhạy của lỗi đối với từng tham số |
| 4 | Optimization — cập nhật tối ưu | Dùng thông tin đó để điều chỉnh tham số |

**Gradient — đạo hàm/độ dốc** cung cấp thông tin về hướng và mức độ thay đổi của loss khi tham số thay đổi nhỏ. Bạn chưa cần tự tính đạo hàm để hiểu mạch bài.

Điểm cần phân biệt: **backward tính gradient; optimizer mới cập nhật tham số**. Backward không phải “cho máy đọc lại câu theo chiều ngược”.

Mỗi lần cập nhật nhằm giảm lỗi, nhưng không bảo đảm lỗi của mọi sản phẩm hay mọi batch đều giảm ngay. Việc học là quá trình lặp lại trên nhiều nhóm dữ liệu.

### Batch, epoch, learning rate: ba nút điều khiển việc học

| Thuật ngữ | Ý nghĩa | Ví dụ |
|---|---|---|
| Batch | Nhóm mẫu xử lý trong một lượt | 64 sản phẩm |
| Batch size | Số mẫu trong nhóm | `64` |
| Epoch | Một lượt đi qua toàn bộ tập training | Học hết bộ bài một lần |
| Number of epochs | Tổng số lượt đi qua tập training | `2` |
| Learning rate | Hệ số điều khiển mức cập nhật | `0.001` |

Ví dụ minh họa: có 640 mẫu training, batch size 64 thì mỗi epoch có 10 batch; học 2 epoch sẽ có 20 lượt cập nhật nếu mỗi batch cập nhật một lần.

Các thiết lập này là **hyperparameters — siêu tham số**. Khác với trọng số do mô hình học, chúng được người xây hệ thống hoặc quy trình tìm kiếm lựa chọn.

Learning rate quá lớn có thể làm việc học dao động hoặc không hội tụ; quá nhỏ có thể học chậm. `0.001` không có nghĩa mọi trọng số đều được cộng hoặc trừ đúng 0.001; mức thay đổi còn phụ thuộc gradient và optimizer.

**Hyperparameter optimization — tối ưu siêu tham số** là thử các cấu hình có phương pháp và so kết quả trên validation. Đây không chỉ là đoán mò, và cũng không nên chọn bằng cách nhìn test liên tục.

## 4. Video 018: Vì sao cho con người thi đoán giá?

Giảng viên muốn kiểm tra phát biểu “bài toán này khó” bằng một mốc tham chiếu cụ thể.

Ông xuất mô tả của **100 sản phẩm test** ra CSV, tự điền giá dự đoán rồi dùng cùng công cụ đánh giá để chấm. Hàm `human_pricer` chỉ tra câu trả lời đã điền trong CSV; nó không huấn luyện mô hình con người nào cả.

Kết quả của giảng viên: **sai số tuyệt đối trung bình 87.62 USD**. Ông làm tốt hơn đoán ngẫu nhiên và một số baseline đơn giản, nhưng thua một số mô hình học máy đã thử trước đó.

**Human baseline — mốc tham chiếu con người** giúp biết bài toán khó và kết quả máy có hữu ích hay không. Tuy nhiên, đây là kết quả của **một người trên 100 mẫu**, không phải năng lực đại diện cho toàn nhân loại. Một chuyên gia định giá trong một ngành cụ thể có thể có kết quả khác.

Phần này không nhằm yêu cầu bạn phải giỏi đoán giá. Nó dạy bạn: trước khi chê “AI sai nhiều”, hãy xem người và giải pháp đơn giản đang làm tốt đến đâu.

## 5. Video 019: Từ mô tả sản phẩm đến mạng PyTorch

### Bước A — Tách câu hỏi và đáp án

Mỗi sản phẩm có mô tả và giá. Chương trình tạo hai nhóm tương ứng:

```text
Mô tả: [mô tả sản phẩm A, mô tả sản phẩm B, ...]
Giá:   [giá sản phẩm A,   giá sản phẩm B,   ...]
```

Cần giữ đúng thứ tự: mô tả A phải đi với giá A. Mạng học quan hệ giữa hai nhóm này.

### Bước B — Biến chữ thành vector

Mạng trong bài không nhận trực tiếp câu chữ. Nó nhận **vector — dãy số** biểu diễn thông tin trong câu.

Ví dụ bổ sung: dùng ba cột `tai_nghe`, `bluetooth`, `chống_ồn`, câu “tai nghe Bluetooth” có thể được biểu diễn bằng `[1, 1, 0]`. Đây chỉ là hình dung về ghi nhận đặc điểm xuất hiện, không phải vector thật từ video.

Mã thực tế dùng:

```python
HashingVectorizer(n_features=5000, stop_words="english", binary=True)
```

**Đính chính kỹ thuật:** `5000` là số ô băm, không phải 5.000 từ phổ biến nhất. Nhiều từ có thể rơi vào cùng ô. `binary=True` đánh dấu ô có giá trị, nhưng chuẩn hóa L2 mặc định khiến đầu ra không chỉ gồm 0 và 1. Công cụ không học một từ điển để đảo ngược từng ô về từ gốc. [Tài liệu HashingVectorizer](https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.HashingVectorizer.html).

Giảng viên gọi dạng biểu diễn này là “one-hot”; với ví dụ nhiều đặc điểm cùng xuất hiện, gọi **multi-hot** chính xác hơn trước bước chuẩn hóa. Không cần ghi nhớ tên này ngay, nhưng đừng hiểu rằng mỗi mô tả chỉ được có đúng một vị trí bằng 1.

Vector đặc trưng từ việc băm từ cũng không đồng nghĩa với semantic embedding — vector biểu diễn ngữ nghĩa do mô hình học. Có vector ở đây không có nghĩa bài đang sử dụng RAG hoặc vector database.

### Bước C — Định nghĩa máy tính nhiều tầng

Mạng trên màn hình có 8 lớp `Linear`, với kích thước:

```text
5000 → 128 → 64 → 64 → 64 → 64 → 64 → 64 → 1
```

Hiểu từng phần:

- **5000**: số đặc trưng đầu vào.
- Các tầng ở giữa kết hợp đặc trưng thành những biểu diễn mới.
- **1**: một giá trị đầu ra, tức giá dự đoán.
- **ReLU** giữa các lớp giúp mạng biểu diễn quan hệ phi tuyến; phép ReLU giữ số dương và đổi số âm thành 0.
- Lớp cuối trong mã không có ReLU đi kèm.

Mạng có **669.249 tham số** theo kết quả trên màn hình. Đó là các con số được học, không phải số sản phẩm hay số kiến thức đã thuộc.

Trong PyTorch, `nn.Module` là lớp nền để định nghĩa mô hình; `forward()` mô tả cách đầu vào đi qua các lớp. **Tensor** là cấu trúc chứa các dãy/bảng số để PyTorch tính toán. Bạn có thể liên tưởng tensor đến mảng số nhiều chiều.

Không cần tranh luận mạng 8 lớp “đã đủ sâu chưa”. Deep learning nói đến mạng có nhiều tầng học biểu diễn; không có quy tắc phổ quát rằng ít hơn một con số lớp cụ thể thì chưa được gọi là deep.

### Bước D — Chuẩn bị dữ liệu và huấn luyện

Chương trình đổi dữ liệu sang tensor, tách phần validation và dùng `DataLoader` chia dữ liệu thành batch.

| Thiết lập thấy trong video | Giá trị |
|---|---|
| Batch size | 64 |
| Epochs | 2 |
| Loss function | MSELoss |
| Optimizer | Adam |
| Learning rate | 0.001 |

Đây là cấu hình của buổi thực hành, không phải công thức tối ưu cho mọi bài toán.

Đoạn mã dưới đây rút gọn vòng lặp trong video để đọc hiểu; nó cần mô hình, dữ liệu và optimizer đã được tạo, không phải chương trình độc lập:

```python
for epoch in range(2):
    model.train()
    for batch_X, batch_y in train_loader:
        optimizer.zero_grad()

        outputs = model(batch_X)               # 1. Dự đoán
        loss = loss_function(outputs, batch_y) # 2. Đo lỗi
        loss.backward()                       # 3. Tính gradient
        optimizer.step()                      # 4. Cập nhật tham số
```

`zero_grad()` xóa gradient cũ để tránh cộng dồn ngoài ý muốn. Bản thân `model.train()` chỉ đặt chế độ hoạt động; các bước trong vòng lặp mới thực hiện việc học. [Hướng dẫn tối ưu tham số của PyTorch](https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html).

Giải thích thêm khi đọc notebook: biến `loss` trong vòng lặp là loss của batch hiện tại. Nếu in `loss.item()` sau khi vòng lặp kết thúc, đó là loss của batch cuối, không tự động là loss trung bình toàn epoch.

### Bước E — Dùng mô hình đã học: inference

**Inference — suy luận/dự đoán** là đưa sản phẩm mới vào mô hình để lấy giá, không cập nhật trọng số.

Vẫn phải biến mô tả mới thành vector bằng cùng cách đã dùng khi training. Sau đó gọi mô hình ở chế độ đánh giá và không cần tính gradient:

```python
model.eval()
with torch.no_grad():
    predicted_price = model(product_tensor)
```

Kết quả mạng trong video: **MAE 63.97 USD**. Đây là kết quả tốt nhất của chuỗi thử nghiệm tính đến lúc đó, theo giảng viên. Nó không có nghĩa mạng nơ-ron luôn thắng mọi phương pháp học máy.

## 6. Đọc kết quả: đừng nhầm “sai trung bình” với “đúng bao nhiêu phần trăm”

### MAE — Mean Absolute Error: sai số tuyệt đối trung bình

Lấy độ lệch giữa giá dự đoán và giá thật, bỏ dấu âm, rồi tính trung bình.

Ví dụ bổ sung:

| Giá thật | Giá dự đoán | Sai số tuyệt đối |
|---:|---:|---:|
| 100 | 80 | 20 |
| 200 | 230 | 30 |
| 300 | 250 | 50 |

MAE = `(20 + 30 + 50) / 3 ≈ 33.33 USD`.

**MAE càng thấp càng tốt.** MAE 44.74 USD nghĩa là trung bình độ lệch là 44.74 USD trên các mẫu được chấm. Không có nghĩa sản phẩm nào cũng sai ít hơn 44.74 USD, hoặc mô hình chính xác 55.26%.

### MSE — Mean Squared Error: sai số bình phương trung bình

Thay vì lấy độ lệch tuyệt đối, MSE bình phương độ lệch trước khi tính trung bình. Với ví dụ trên: `(20² + 30² + 50²) / 3 ≈ 1266.67 USD²`.

MSE phạt những lần sai rất lớn mạnh hơn MAE. Trong bài, mạng **học bằng MSE**, còn giảng viên dùng **MAE để so sánh dễ hiểu bằng tiền**. Hai việc này không mâu thuẫn.

### R² — hệ số xác định

R² so sánh tổng lỗi bình phương của mô hình với cách luôn đoán giá trung bình của tập đang đánh giá:

- `1`: dự đoán hoàn hảo.
- `0`: tổng lỗi bình phương bằng mốc đoán trung bình đó.
- Âm: còn tệ hơn mốc ấy theo thước đo lỗi bình phương.

R² khoảng 0.5 **không có nghĩa 50% sản phẩm được đoán đúng**. Nó cũng không chỉ đơn giản là “đoán đúng xu hướng”. Khi hai mô hình có MAE và R² xếp hạng khác nhau, hãy xem các lần sai lớn và liệu chúng có được kiểm tra trên cùng mẫu hay không.

### Biểu đồ ŷ–y

Trong biểu đồ của video, trục ngang là giá thật, trục dọc là giá dự đoán. Mỗi chấm là một sản phẩm.

- Gần đường chéo: dự đoán gần giá thật.
- Phía trên đường chéo: đoán cao hơn thực tế.
- Phía dưới đường chéo: đoán thấp hơn thực tế.

Biểu đồ giúp nhìn thấy lỗi mà một con số trung bình có thể che mất: chẳng hạn mô hình thường định giá quá thấp cho hàng đắt.

## 7. Video 020–021: Thay mạng tự huấn luyện bằng một LLM có sẵn

### Cùng câu hỏi, khác người trả lời

Với mạng nhỏ, bạn tự tổ chức việc học từ các cặp mô tả–giá. Với LLM, bạn gửi mô tả kèm yêu cầu ước lượng giá, rồi đọc câu trả lời.

Prompt trong video về cơ bản là: “Hãy ước lượng giá sản phẩm này. Chỉ trả về giá, không giải thích”, sau đó đính kèm mô tả.

Hàm dự đoán bây giờ gọi API thông qua **LiteLLM**, thay vì gọi mạng PyTorch cục bộ. LiteLLM giúp sử dụng nhiều nhà cung cấp qua cách gọi tương đối thống nhất; nó không phải mô hình đang đoán giá.

Hàm `evaluate` tiếp tục nhận một hàm dự đoán và chấm kết quả. Đây là tư duy thiết kế đáng học: **giữ cách chấm nhất quán, thay giải pháp cần kiểm tra**.

Giải thích thêm: khi xây ứng dụng thật, cần bảo đảm giá trả về được chuyển thành số và có đơn vị tiền tệ rõ ràng. Một câu trả lời bằng văn bản trông hợp lý chưa chắc đã là dữ liệu hợp lệ để tính điểm.

### “Không training” phải được hiểu thế nào?

**Không huấn luyện thêm trong thí nghiệm này**, chứ không phải LLM chưa từng học.

Các LLM đã trải qua quá trình huấn luyện lớn trước đó. Chúng mang theo kiến thức về ngôn ngữ, thương hiệu, loại sản phẩm và nhiều quan hệ trong thế giới. Vì thế chúng có thể dự đoán khá tốt ngay khi được yêu cầu.

| Cách làm | Có cập nhật trọng số trong thao tác này? | Trong cụm video? |
|---|---|---|
| Train from scratch — huấn luyện từ đầu | Có, bắt đầu từ tham số khởi tạo | Có, với mạng nhỏ dự đoán giá |
| Prompt / inference — đưa yêu cầu để mô hình trả lời | Không | Có, với các LLM |
| Fine-tuning — huấn luyện tiếp mô hình có sẵn | Có | Chưa; hẹn buổi sau |
| RAG — truy xuất dữ liệu rồi đưa vào ngữ cảnh | Thường không | Chỉ được nhắc trong lộ trình, không triển khai ở đây |

LLM cũng là một loại mạng nơ-ron. Trong ngữ cảnh bài này, sự so sánh là **mạng feed-forward nhỏ tự huấn luyện** với **LLM lớn đã được huấn luyện sẵn**, không phải “mạng nơ-ron” đối lập với “AI ngôn ngữ”.

LLM dùng kiến trúc phức tạp hơn, thường có các thành phần Transformer như attention để xử lý quan hệ giữa token trong ngữ cảnh. Chỉ thêm nhiều lớp vào mạng đoán giá này không tự biến nó thành ChatGPT.

### Kết quả ghi nhận trong video

Bảng giữ thứ tự triển khai để dễ đối chiếu bài học, không coi đây là một bảng xếp hạng đã kiểm soát mọi yếu tố.

| Phương pháp | MAE (USD), thấp hơn tốt hơn | Ghi chú |
|---|---:|---|
| Giảng viên tự đoán | 87.62 | Chấm 100 sản phẩm |
| Mạng nơ-ron PyTorch | 63.97 | Có huấn luyện cho nhiệm vụ này |
| GPT-4.1 nano | 62.51 | Không fine-tune trong bài |
| Claude Opus 4.5 | 47.10 | Tên xác nhận từ biểu đồ video 020 |
| Gemini 3 Pro Preview | 50.54 | Chỉ chấm 50 sản phẩm; mất khoảng 5 phút trong lần chạy |
| Gemini 2.5 Flash Lite | 58.68 | Tên xác nhận từ biểu đồ video 021 |
| Grok 4.1 Fast | 57.62 | Giảng viên dùng biến thể non-reasoning |
| GPT-5.1 | 44.74 | Lần chạy chính đặt reasoning effort là `none` |

Theo lời giảng, nhiều lượt kiểm tra mô hình dùng 200 mẫu; riêng human baseline dùng 100 và Gemini 3 dùng 50. **800.000 là quy mô dữ liệu học được nhắc tới, không phải số mẫu test dùng để tính các điểm này.**

Giảng viên nói lúc đầu rằng tăng reasoning không giúp GPT-5.1; cuối video ông bổ sung đã chạy lại với mức high và được điểm gần như tương đương. Kết luận phù hợp là **tăng mức suy luận không mang lại cải thiện rõ trong thử nghiệm này**, không phải suy luận nhiều luôn kém.

### Vì sao phải cẩn thận với kết luận?

Giải thích thêm để đọc thí nghiệm đúng:

- Các mô hình không hoàn toàn thi trên cùng số lượng sản phẩm. Tập ít hơn có thể tình cờ dễ hoặc khó hơn.
- Video không đưa khoảng tin cậy đầy đủ. Chênh lệch nhỏ chưa chứng minh chắc chắn mô hình này luôn hơn mô hình kia.
- Giá trong dữ liệu có thể phụ thuộc thời điểm, người bán, tình trạng hàng và thông tin không được mô tả hết.
- Không có bằng chứng trong các video để xác nhận dữ liệu tiền huấn luyện của LLM hoàn toàn không trùng với dữ liệu sản phẩm này.
- Tốc độ, chi phí, tính ổn định và quyền riêng tư cũng ảnh hưởng đến lựa chọn giải pháp.

Vì vậy, điều nên nhớ là: **LLM có sẵn đạt kết quả rất đáng chú ý cho bài toán này; hãy kiểm tra nó trước khi đầu tư huấn luyện thêm.** Không suy ra GPT-5.1 luôn giỏi nhất, LLM luôn hơn ML, hoặc các model chạy local đều yếu.

### `size`, `workers` và rate limit có vai trò gì?

`size` là số sản phẩm đem chấm; `workers` là mức chạy đồng thời của công cụ đánh giá. Chúng không phải batch size huấn luyện mạng.

Tăng workers có thể chạy nhanh hơn, nhưng dễ gặp giới hạn yêu cầu của API. Video gợi ý giảm workers khi gặp rate limit. Giảm size giúp thử nhanh hơn, nhưng kết quả ít chắc chắn hơn. Lời nhận xét về “nhanh” hay “rẻ” trong bài chỉ phản ánh bối cảnh lần chạy đó; tài liệu này không báo giá API hiện tại.

## 8. Những chỗ trong bài nói nhanh hoặc dễ gây hiểu nhầm

| Cách nói / điểm dễ nhầm | Cách hiểu nên giữ |
|---|---|
| ML truyền thống chỉ có vài chục/vài trăm tham số | Chỉ là cách giản lược; độ lớn phụ thuộc mô hình và số đặc trưng |
| HashingVectorizer lấy 5.000 từ phổ biến | Thực tế dùng 5.000 ô đặc trưng băm |
| Mạng nơ-ron không cần xử lý đặc trưng | Vẫn cần quyết định cách biểu diễn đầu vào; bài đã chọn cách băm từ |
| LLM “không được huấn luyện” | Không được huấn luyện thêm cho thử nghiệm này |
| Một người đạt 87.62 USD là “mức con người” | Chỉ là một human baseline cụ thể |
| R² 50% nghĩa là đúng 50% | Không phải tỷ lệ câu đoán đúng |
| Loss training giảm là mô hình tốt hơn | Còn phải xem validation và khả năng làm tốt trên dữ liệu mới |
| Tên “Claude 4.7” hoặc “Sonnet” ở vài câu tổng kết | Biểu đồ lượt chạy 020 ghi **Claude Opus 4.5** |
| Lời đọc “Gemini Flash”, “7.62” | Biểu đồ xác nhận **Flash Lite**, **Grok 57.62 USD** |

## 9. Bạn cần học gì ngay, phần nào có thể để sau?

Sau phần này, bạn nên tự kể được câu chuyện sau:

> Tôi có các mô tả sản phẩm kèm giá. Tôi giữ riêng dữ liệu kiểm tra. Với mạng nhỏ, tôi chuyển mô tả thành số rồi lặp việc dự đoán, đo lỗi và cập nhật tham số. Với LLM có sẵn, tôi gửi yêu cầu dự đoán mà không huấn luyện thêm. Tôi dùng thước đo và dữ liệu kiểm tra để so các giải pháp, đồng thời xem tốc độ, chi phí và giới hạn của thí nghiệm.

Cần hiểu ngay: `X`, `y`, `ŷ`; train/validation/test; bốn bước training; batch/epoch/learning rate; training khác inference; MAE thấp hơn là tốt hơn.

Có thể để sau: tự tính gradient, toán chi tiết của Adam, triển khai Transformer, tìm kiến trúc mạng tối ưu. Chính giảng viên cũng giới thiệu đây là phần làm quen, chưa yêu cầu hiểu sâu toàn bộ mạng nơ-ron.

### Tự kiểm tra nhanh bằng lời của mình

1. **Sửa prompt có phải fine-tuning không?** Không; prompt thay đầu vào, fine-tuning cập nhật trọng số.
2. **Học 2 epoch có nghĩa chỉ dự đoán hai lần không?** Không; đi qua toàn bộ tập training hai lần, thường gồm nhiều batch.
3. **Mô hình MAE 44.74 USD có bảo đảm mọi dự đoán sai dưới 44.74 USD không?** Không; đó là trung bình.
4. **Vì sao giữ test riêng?** Để đo khả năng trên dữ liệu chưa dùng để chọn hoặc sửa giải pháp.
5. **Bài đã tạo một chatbot tổng quát chưa?** Chưa; nó tạo mô hình dự đoán giá và thử các LLM có sẵn.

## 10. Mốc đối chiếu trong nguồn

Thời gian là vị trí xấp xỉ trong từng video, không phải thời gian gộp:

| Video | Mốc | Nội dung đối chiếu |
|---|---|---|
| 019 | 02:15–03:50 | HashingVectorizer và cấu trúc 8 lớp |
| 019 | 07:30 | 669.249 tham số, MSE, Adam, learning rate, vòng lặp training |
| 019 | 09:49 | MAE mạng nơ-ron 63.97 |
| 020 | 05:25 | GPT-4.1 nano 62.51 |
| 020 | 09:50 | Biểu đồ Claude Opus 4.5, MAE 47.10 |
| 021 | 02:27 | Biểu đồ Gemini 2.5 Flash Lite, MAE 58.68 |
| 021 | 04:05 | Biểu đồ Grok 4.1 Fast, MAE 57.62 |
| 021 | 05:23 | GPT-5.1, MAE 44.74 |

Nguồn chính: các tệp MP4 và SRT 017, 018, 019, 020, 021 do bạn cung cấp. Những tài liệu chính thức được liên kết tại phần giải thích bổ sung chỉ dùng để làm rõ kỹ thuật; không thay thế nội dung bài giảng.
