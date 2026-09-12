# Day 5 — Đánh giá AI bằng kết quả thực tế và thử chuyển Python sang Rust

> Bản giảng giải đầy đủ cho video 018–021. Nội dung được tổ chức lại từ toàn bộ phụ đề tiếng Anh, đối chiếu khung hình phần mã nguồn và bảng kết quả. Những ví dụ và lưu ý được ghi là **giải thích bổ sung** nhằm giúp hiểu bài, không phải lời nguyên văn của giảng viên. Các kết quả mô hình là kết quả trong video, không phải bảng xếp hạng hiện tại.

## 1. Cả phần này thực sự muốn dạy điều gì?

**Trước khi chọn AI, hãy xác định thế nào là làm tốt; sau đó dùng công việc cụ thể để đo xem AI nào đáp ứng được.**

Giảng viên chọn một công việc dễ kiểm chứng: đưa chương trình Python cho nhiều mô hình, yêu cầu chúng viết lại bằng Rust sao cho **giữ nguyên kết quả tính toán và chạy nhanh hơn**. Đây là bài học về đánh giá và ứng dụng LLM; bạn không cần học thành thạo Rust mới hiểu được mục tiêu.

Bạn đang xây một công cụ dùng mô hình có sẵn để sinh mã, không huấn luyện một mô hình mới. Python là ngôn ngữ viết công cụ và chương trình đầu vào; Rust là ngôn ngữ đầu ra trong thử nghiệm.

| Video | Hoạt động trên màn hình | Kiến thức cần rút ra |
|---|---|---|
| 018 | Giải thích các nhóm chỉ số đánh giá | Điểm kỹ thuật tốt phải liên hệ được với mục tiêu thực tế |
| 019 | Chuẩn bị công cụ chuyển Python → Rust và bài toán khó hơn | Thiết kế đầu vào, yêu cầu và môi trường để có thể kiểm chứng |
| 020 | Thử lần lượt nhiều mô hình | Code có vẻ hợp lý vẫn có thể không biên dịch được; đổi thuật toán có thể tạo khác biệt rất lớn |
| 021 | Hoàn tất thử nghiệm, công bố kết quả, gợi ý mở rộng | Chọn theo bằng chứng của bài toán; hiểu giới hạn của kết quả và xây thử nghiệm tiếp theo |

## 2. Video 018: “Mô hình tốt” và “sản phẩm có ích” là hai câu hỏi khác nhau

### Hai nhóm chỉ số

**Model-centric metrics / Technical metrics — chỉ số tập trung vào mô hình hoặc kỹ thuật:** đo khả năng dự đoán, mức sai lệch hoặc chất lượng đầu ra theo một tiêu chí xác định. Chúng hữu ích khi phát triển và đánh giá mô hình.

**Business-centric metrics / Outcome metrics — chỉ số kết quả kinh doanh hoặc thực tế:** đo điều mà người dùng hay tổ chức thực sự muốn đạt được, chẳng hạn mức hài lòng, thời gian tiết kiệm, chi phí giảm hoặc doanh thu.

Ví dụ bổ sung: chatbot trả lời đúng 95% câu hỏi trong bộ kiểm tra nhưng người dùng vẫn không hài lòng vì giao diện khó dùng và phải đợi lâu. Mô hình có thể làm tốt phần của nó, nhưng trải nghiệm tổng thể chưa tốt.

| Thuật ngữ trong video | Cách hiểu ngắn gọn |
|---|---|
| Loss — hàm mất mát | Con số biểu diễn mức sai theo cách tính đã chọn; quá trình huấn luyện thường cố giảm nó |
| Ground truth — đáp án chuẩn | Giá trị đúng dùng để đối chiếu dự đoán |
| MSE, Mean Squared Error — sai số bình phương trung bình | Lấy chênh lệch giữa dự đoán và đáp án, bình phương rồi lấy trung bình trên các mẫu |
| Cross-entropy loss — mất mát entropy chéo | Với dự đoán token, phạt mô hình khi nó gán xác suất thấp cho token đúng |
| Perplexity — độ bối rối | Cách biểu diễn mức khó dự đoán của dữ liệu đối với mô hình; thường thấp hơn là tốt hơn khi điều kiện đánh giá tương đương |
| Precision — độ chính xác của các dự đoán dương tính | Trong những trường hợp mô hình đánh dấu là “có”, bao nhiêu trường hợp thực sự có? |
| Recall — độ bao phủ | Trong tất cả trường hợp thực sự “có”, mô hình tìm ra bao nhiêu? |
| F1 | Chỉ số kết hợp precision và recall bằng trung bình điều hòa |
| Confusion matrix — ma trận nhầm lẫn | Bảng đếm các dự đoán đúng và sai theo từng loại |
| ROC-AUC | Chỉ số đánh giá khả năng phân biệt hai lớp qua nhiều ngưỡng quyết định |
| KPI — chỉ số hiệu quả chính | Chỉ số quan trọng dùng để theo dõi mục tiêu của sản phẩm hoặc tổ chức |

**Ví dụ MSE:** dự đoán 10, thực tế 8 thì sai số bình phương của mẫu đó là `(10 − 8)² = 4`. Với nhiều mẫu phải lấy trung bình, nên không nên hiểu MSE chỉ là bình phương sai số của một mẫu duy nhất.

**Ví dụ precision/recall:** AI gắn nhãn 10 bình luận là spam, trong đó 8 bình luận đúng là spam. Precision là `8/10 = 80%`. Nếu dữ liệu thực tế có 20 bình luận spam thì recall chỉ là `8/20 = 40%`. Nó ít báo nhầm nhưng bỏ sót nhiều.

**Lưu ý bổ sung về perplexity:** giá trị 100 có thể được hình dung như mức bất định tương đương chọn giữa 100 khả năng đồng đều, xét theo trung bình. Không có nghĩa ở mọi bước mô hình thực sự liệt kê đúng 100 token. Perplexity thấp cũng không đảm bảo câu trả lời luôn đúng sự thật; việc so sánh cần chú ý dữ liệu và cách chia token.

### Vì sao cần cả hai nhóm?

Chỉ số kỹ thuật thường đo được nhanh trên dữ liệu kiểm tra, giúp phát hiện vấn đề và cải thiện mô hình. Chỉ số kinh doanh cho biết giải pháp có tạo giá trị hay không, nhưng chịu tác động của giá cả, giao diện, thị trường và nhiều yếu tố khác.

Vì vậy, không thể chỉ nhìn doanh thu giảm rồi kết luận mô hình kém. Cũng không thể chỉ nhìn loss giảm rồi kết luận sản phẩm thành công.

Giảng viên muốn kỹ sư hiểu mối liên hệ giữa hai nhóm, thay vì giao toàn bộ câu hỏi về giá trị thực tế cho đội kinh doanh. **Giải thích bổ sung:** những chỉ số kỹ thuật được liệt kê không phải đều là hàm loss dùng trực tiếp để huấn luyện; nhiều chỉ số chủ yếu phục vụ đánh giá. Nhận xét trong video về việc khó huấn luyện trực tiếp theo doanh thu nên hiểu theo bối cảnh tín hiệu chậm và nhiều nhiễu, không phải cấm tuyệt đối dùng phản hồi thực tế để cải thiện mô hình.

### Áp dụng vào bài này

Mục tiêu là làm chương trình chạy nhanh hơn và vẫn đúng. Vì vậy, thời gian thực thi của mã sinh ra gần với kết quả mong muốn hơn một điểm benchmark tổng quát.

Trong sản phẩm thật, cần nối thêm một bước: chương trình nhanh hơn giúp giảm bao nhiêu thời gian chờ hoặc chi phí máy chủ? Tăng tốc một đoạn không nằm ở điểm nghẽn có thể ít ảnh hưởng đến người dùng.

## 3. Video 019: Công cụ đang làm gì và mỗi thành phần có vai trò gì?

| Thành phần | Vai trò trong bài |
|---|---|
| Cursor | Trình soạn thảo nơi giảng viên mở notebook và chạy thử |
| Notebook `day5.ipynb` | Chứa phần cấu hình, hàm xử lý và giao diện thử nghiệm |
| Python | Điều phối các lần gọi mô hình và cung cấp chương trình gốc |
| LLM | Đọc mã Python, sinh mã Rust và có thể thay thuật toán |
| OpenRouter | Cổng trung gian truy cập mô hình trong một số lượt thử |
| Groq | Dịch vụ chạy mô hình được dùng cho GPT-OSS 120B trong video |
| Mô hình local | Mô hình suy luận trên máy giảng viên, như GPT-OSS 20B trong thử nghiệm |
| Rust toolchain — bộ công cụ Rust | Biên dịch mã Rust thành chương trình có thể chạy |
| Gradio | Tạo giao diện nhập mã, chọn mô hình, bấm nút và xem kết quả |

Đừng nhầm **Groq** là dịch vụ suy luận với **Grok 4** là tên mô hình. Cũng cần tách hai địa điểm: mô hình có thể sinh mã trên đám mây, còn mã Rust nhận về được biên dịch và chạy trên máy giảng viên.

### Luồng sử dụng

1. Nhập mã Python và chạy bản gốc để ghi nhận kết quả, thời gian.
2. Chọn mô hình, bấm **Port to Rust — chuyển sang Rust**.
3. Hàm `port` gửi yêu cầu và mã nguồn đến mô hình tương ứng.
4. Mã trả về được xử lý để loại bỏ phần bao định dạng như hàng rào Markdown, rồi hiển thị trong ô mã.
5. Bấm **Run Rust** để biên dịch và chạy.
6. Kiểm tra lỗi, đối chiếu kết quả tính toán, sau đó mới so tốc độ.

Yêu cầu cốt lõi trong prompt là: chuyển Python sang ngôn ngữ đích, chỉ trả về mã, giữ kết quả và tối ưu thời gian chạy. Công cụ cũng cung cấp thông tin môi trường/lệnh thực thi. Biến `language` cho phép dùng lại ý tưởng với Rust hoặc C++.

Giảng viên cho phép người học chỉ quan sát mã chuyển đổi hoặc dùng C++ nếu không muốn cài Rust. Nhưng nếu muốn khẳng định mã đúng và nhanh hơn thì vẫn phải thực thi và kiểm tra.

### Liên hệ với React để dễ hình dung

Gradio nối nút bấm với hàm xử lý, gần với cách bạn viết `onClick` rồi cập nhật kết quả trên giao diện:

| Nút | Hàm được gọi | Đầu vào → đầu ra |
|---|---|---|
| Port to Rust | `port` | Mô hình + mã Python → mã Rust |
| Run Python | `run_python` | Mã Python → kết quả và thời gian |
| Run Rust | `compile_and_run` | Mã Rust → kết quả/thời gian hoặc lỗi |

`gr.Code` là ô hiển thị/chỉnh sửa mã có tô màu cú pháp. CSS và bố cục giúp dễ quan sát; chúng không quyết định chất lượng mã mà mô hình sinh ra. Bạn có thể xây giao diện tương tự bằng React, nhưng Gradio giúp giảng viên dựng thử nghiệm Python nhanh hơn.

## 4. Bài toán được đưa cho AI: tìm tổng lớn nhất của một đoạn liên tiếp

Tên bài toán là **Maximum subarray sum — tổng lớn nhất của mảng con liên tiếp**.

Ví dụ bổ sung: với `[-2, 3, -1, 4, -5]`, đoạn tốt nhất là `[3, -1, 4]`, tổng bằng `6`. Không được nhặt riêng `3` và `4` để được `7`, vì phải giữ tính liên tiếp. Cũng không phải luôn lấy cả mảng, vì số âm có thể làm tổng giảm.

Trong mã trên màn hình:

- Mỗi mảng có **10.000 số nguyên**, giá trị từ **−10 đến 10**.
- Một bộ sinh số giả ngẫu nhiên tạo dữ liệu có thể tái lập.
- Tính tổng lớn nhất của mảng con cho **20 bộ dữ liệu**, rồi cộng 20 kết quả.
- Kết quả tham chiếu là **10980**.

### Tại sao tự tạo số giả ngẫu nhiên?

**Pseudo-random number generator — bộ sinh số giả ngẫu nhiên** tạo chuỗi số từ một trạng thái ban đầu gọi là **seed**. Cùng seed và cùng quy tắc thì tạo được cùng chuỗi.

Video dùng dạng **LCG, Linear Congruential Generator — bộ sinh đồng dư tuyến tính**:

```text
trạng_thái_mới = (a × trạng_thái_cũ + c) mod m
```

Mã trên màn hình dùng `a = 1664525`, `c = 1013904223`, `m = 2^32`, với seed ban đầu 42. Một bộ sinh tạo seed cho 20 lượt; mỗi lượt dùng seed đó để sinh mảng riêng. Giữ đúng trình tự này cũng là một phần của việc chuyển mã chính xác.

Nếu hai ngôn ngữ tự gọi thư viện random riêng, chúng có thể tạo hai bộ dữ liệu khác nhau dù cùng ghi một seed. Khi đó đầu ra khác nhau chưa chắc do thuật toán sai. Công thức tường minh giúp tránh sự nhập nhằng này.

Python dùng `yield`: hàm trả từng giá trị và giữ trạng thái để lần gọi sau tiếp tục. AI phải hiểu hành vi đó và tái hiện bằng iterator hoặc trạng thái cập nhật trong Rust; dịch từng từ khóa sẽ không đủ.

### Vì sao kiểu số gây khó khăn?

Python hỗ trợ số nguyên có độ lớn tùy ý trong giới hạn tài nguyên. Rust yêu cầu kiểu số có phạm vi rõ ràng. Dù đầu ra cuối chỉ là 10980, phép nhân trong bộ sinh số có thể tạo giá trị trung gian rất lớn; bản thân `2^32` đã vượt phạm vi `u32`.

Do đó cần xét cả **giá trị trung gian**, chọn kiểu đủ rộng hoặc phép toán có quy tắc tràn rõ ràng. Trong video, giảng viên giải thích lỗi của Claude là sử dụng số 32 bit trong chỗ cần hỗ trợ số lớn hơn, dù mã Python có lời nhắc.

**Giải thích bổ sung:** Rust có các bảo đảm an toàn bộ nhớ cho safe Rust, nhưng không tự đảm bảo thuật toán đúng hoặc mọi phép toán số nguyên đều đúng. Cách xử lý tràn còn phụ thuộc chế độ biên dịch và phép toán sử dụng. Không nên diễn giải lời giới thiệu trong video thành “Rust không thể có lỗi”.

## 5. Vì sao AI có thể làm chương trình nhanh hơn rất nhiều?

### Cách gốc: thử nhiều điểm bắt đầu và kết thúc — O(n²)

Mã Python chọn từng điểm bắt đầu, mở rộng dần điểm kết thúc, cộng thêm từng phần tử và ghi nhận tổng tốt nhất. Nó tránh cộng lại toàn bộ đoạn từ đầu, nhưng vẫn có hai vòng lặp lồng nhau.

Với 10.000 phần tử, số đoạn là:

```text
10.000 × 10.001 / 2 = 50.005.000 đoạn
20 lượt ≈ 1.000.100.000 lần mở rộng đoạn
```

Đó là lý do bản gốc tốn khoảng 33 giây trên máy trong video.

### Cách tối ưu: Kadane’s algorithm — thuật toán Kadane, O(n)

Ở mỗi phần tử chỉ cần quyết định:

> Nối số hiện tại vào đoạn đang xét, hay bắt đầu đoạn mới ngay tại số này?

Ta lưu `current`: tổng tốt nhất của đoạn kết thúc ngay tại vị trí hiện tại; và `best`: tổng tốt nhất từng gặp.

```python
# Ví dụ giảng giải bổ sung, không phải mã Rust do mô hình trong video sinh ra.
# Điều kiện: nums là danh sách số nguyên không rỗng; đoạn phải có ít nhất một số.
def max_subarray_sum(nums):
    current = best = nums[0]
    for x in nums[1:]:
        current = max(x, current + x)
        best = max(best, current)
    return best
```

| Số đang xét trong `[-2, 3, -1, 4, -5]` | `current` | `best` |
|---|---:|---:|
| −2 | −2 | −2 |
| 3 | 3 | 3 |
| −1 | 2 | 3 |
| 4 | 6 | 6 |
| −5 | 1 | 6 |

Mỗi mảng chỉ cần khoảng 10.000 bước, thay vì khoảng 50 triệu lần mở rộng đoạn. Với 20 mảng, còn khoảng 200.000 bước của thuật toán. Đây là so sánh lượng công việc, không phải dự đoán chính xác thời gian máy chạy.

**Điểm cần nhớ:** mô hình thành công đã nhận ra bài toán và thay cách giải. Bạn cũng có thể viết Kadane bằng Python để tăng tốc mà chưa cần chuyển sang Rust. Sau đó, Rust được biên dịch thành mã máy còn giúp giảm chi phí thực thi. Mức tăng tốc được trình diễn là hiệu ứng kết hợp của cả hai thay đổi.

## 6. Video 020–021: kết quả thực tế và cách hiểu đúng

Bảng dưới đối chiếu bảng tổng kết hiển thị trong video 021, khoảng **06:48**. Thời gian là thời gian chạy mã được ghi trong thử nghiệm, không phải thời gian mô hình trả lời.

| Mô hình theo tên hiển thị | Kết quả trong lượt thử | Thời gian ghi nhận |
|---|---|---:|
| GPT-OSS 120B | Đúng đầu ra tham chiếu, xếp thứ 1 | 0,000304 giây = 304 µs |
| Grok 4 | Đúng đầu ra tham chiếu, xếp thứ 2 | 0,000317 giây = 317 µs |
| GPT-OSS 20B | Đúng đầu ra tham chiếu, xếp thứ 3 | 0,000341 giây = 341 µs |
| Qwen 2.5 Coder | Fail — sinh mã gặp lỗi | — |
| DeepSeek Coder v2 | Fail — sinh mã gặp lỗi | — |
| Qwen3 Coder 30B | Fail — lỗi định dạng được báo | — |
| Claude Sonnet 4.5 | Fail — giảng viên chỉ ra vấn đề kiểu số | — |
| GPT-5 | Fail — lỗi định dạng được báo | — |
| Gemini 2.5 Pro | Fail — lỗi định dạng được báo | — |

“Fail” nghĩa là không vượt qua lượt thử theo luật của giảng viên: **không sửa và thử lại để cứu kết quả**. Nó không có nghĩa mô hình đó hoàn toàn không biết Rust. GPT-5 và Gemini đã nhận ra Kadane nhưng vẫn bị loại vì mã không chạy thành công.

### Con số hơn 100.000 lần đến từ đâu?

Ở phần kết, giảng viên dùng:

```text
33,755 giây / 0,000304 giây ≈ 111.036 lần
```

Có một khác biệt nhỏ giữa các chỗ trong nguồn: màn hình chạy Python ở video 020 khoảng **00:55** hiển thị **33,472125 giây**, còn phép tính tổng kết dùng **33,755 giây**. Cả hai vẫn cho mức xấp xỉ 110.000 lần so với 304 µs. Nên xem đây là kết quả đo minh họa, không gộp các con số thành một lần đo chính xác duy nhất.

### Những kết luận không nên suy ra từ bảng này

- **Không phải “Rust luôn nhanh hơn Python 111.000 lần”.** Hai bản dùng thuật toán khác nhau.
- **Không phải “GPT-OSS luôn giỏi hơn mọi mô hình còn lại”.** Đây là một bài toán, cấu hình và lượt sinh mã cụ thể.
- **Không phải “GPT-OSS 120B trả lời trong 304 µs”.** Con số đó thuộc mã được sinh ra; thời gian gọi mô hình là chuyện khác.
- **Không phải “ra 10980 là chắc chắn đúng với mọi đầu vào”.** Một đầu ra tổng hợp khớp chưa thay thế bộ kiểm thử nhiều trường hợp.
- **Không phải “thứ hạng ba bản đúng chắc chắn ổn định”.** Chênh lệch 304–341 µs rất nhỏ; một lần đo dễ chịu ảnh hưởng nhiễu.

Giảng viên gọi kết quả là chiến thắng của “open source”. Đọc sát tình huống: GPT-OSS 120B chạy qua dịch vụ đám mây, GPT-OSS 20B chạy trên máy giảng viên. Mô hình có trọng số được phát hành không đồng nghĩa mọi cách sử dụng đều miễn phí; tên gọi mở cũng không cho biết đầy đủ quyền sử dụng nếu chưa xem giấy phép.

## 7. Làm lại thử nghiệm thế nào để kết quả đáng tin hơn?

Phần này là **hướng dẫn bổ sung** để biến màn trình diễn thành quy trình đánh giá có thể dùng cho dự án.

1. **Chốt yêu cầu:** kết quả phải giữ nguyên, đoạn con có được rỗng không, giới hạn đầu vào và mục tiêu tốc độ là gì.
2. **Chuẩn bị dữ liệu kiểm tra:** mảng một phần tử, toàn âm, toàn dương, có số 0, nhiều seed và nhiều kích thước. Ví dụ `[-5, -2, -9]` phải cho `-2` nếu đoạn bắt buộc không rỗng.
3. **Đánh giá tính đúng trước:** so bản tối ưu với cách duyệt chậm trên nhiều mảng nhỏ; đối chiếu từng lượt và dữ liệu sinh ra, không chỉ tổng cuối.
4. **Kiểm soát môi trường:** giữ máy, phiên bản compiler và chế độ tối ưu tương đương; ghi model ID, prompt, nhà cung cấp, thiết lập suy luận và số lần thử.
5. **Tách thời gian:** thời gian AI sinh mã, thời gian biên dịch và thời gian chạy chương trình. Khi đo mã chạy cực nhanh, lặp nhiều lần, dùng đồng hồ phù hợp và báo trung vị/phân bố; xác định rõ đoạn nào nằm trong phép đo.
6. **Tách tác động:** so Python gốc, Python dùng Kadane và Rust dùng Kadane. Nếu muốn đánh giá ngôn ngữ riêng, thêm Rust với thuật toán gốc.
7. **Thử chính sách sửa lỗi riêng:** một bảng cho lần sinh đầu tiên; một bảng cho tối đa vài vòng nhận lỗi compiler/test rồi sửa. Ghi cả chi phí và tổng thời gian đến khi có mã đạt yêu cầu.

Bộ đánh giá tối thiểu nên theo dõi: tỷ lệ biên dịch thành công, tỷ lệ qua kiểm thử, thời gian chạy của bản đúng, chi phí gọi mô hình và số vòng sửa. Một công cụ thực tế còn cần xét độ dễ bảo trì của mã.

Nếu đưa chức năng chạy mã lên web, phần thực thi cần môi trường cô lập và giới hạn tài nguyên; không đưa trực tiếp mã người dùng vào tiến trình máy chủ ứng dụng như một callback demo.

## 8. Video 021 gợi ý phát triển công cụ theo những hướng nào?

| Hướng mở rộng trong bài | Mục đích |
|---|---|
| Thử thêm mô hình | Xem kết quả có thay đổi theo ứng viên không |
| Chuyển sang ngôn ngữ khác, ví dụ Go | Tái sử dụng quy trình cho đầu ra khác |
| Thêm docstring và comment | Biến công cụ thành trợ lý bổ sung tài liệu cho mã |
| Sinh unit test | Tạo kiểm thử từ mã đầu vào rồi kiểm chứng chất lượng |
| Dùng agent xử lý nhiều file | Mở rộng từ một file sang một dự án có liên kết giữa các phần |
| Sinh mã xử lý tín hiệu giao dịch trong môi trường mô phỏng | Một ý tưởng bài tập mở rộng về code generation, không phải bằng chứng tạo lợi nhuận |

**Agentic workflow — quy trình có tác nhân:** thay vì gọi AI một lần, hệ thống có thể đọc file, sửa mã, chạy kiểm thử, nhận lỗi rồi tiếp tục trong giới hạn đặt trước. Video nêu đây là hướng phát triển tiếp, chưa triển khai một hệ thống chuyển toàn bộ repository hoàn chỉnh.

Cuối phần, giảng viên chuyển sang tuần RAG: bổ sung kiến thức liên quan cho truy vấn. Đây là giới thiệu nội dung kế tiếp, không phải phần RAG đã được giảng trong bốn video này.

## 9. Bạn cần hiểu gì trước khi học tiếp?

Bạn có thể bỏ qua chi tiết CSS và cú pháp Rust ở lượt đọc đầu. Hãy chắc rằng mình giải thích được năm ý sau:

1. Chọn mô hình phải bắt đầu bằng yêu cầu và cách đo thành công.
2. Chỉ số kỹ thuật và kết quả sản phẩm bổ sung cho nhau.
3. Công cụ đang gọi mô hình có sẵn để sinh mã; compiler và bộ kiểm thử mới kiểm chứng được mã đó.
4. Tăng tốc lớn trong bài đến từ việc nhận ra thuật toán tốt hơn kết hợp chuyển sang mã biên dịch.
5. Kết quả một thử nghiệm là bằng chứng có phạm vi, không phải chân lý về mô hình hay ngôn ngữ.

Với công việc front-end, có thể áp dụng cùng tư duy cho việc nhờ AI tối ưu xử lý dữ liệu: trước hết xác định phần chậm, kiểm tra hành vi phải giữ, đo trước/sau, rồi mới quyết định có cần đổi công nghệ hay không. Đó là kỹ năng có thể mang sang dự án của bạn từ phần học này.

## Nguồn học tập

- **018 — Model Evaluation Technical Metrics vs Business Outcomes:** phụ đề toàn bài; nền tảng hai nhóm chỉ số.
- **019 — Python to Rust Code Translation Testing Gemini 2.5 Pro with Cursor:** phụ đề toàn bài; công cụ, dữ liệu và bài toán chuyển mã.
- **020 — Porting Python to Rust Testing GPT, Claude, and Qwen Models:** phụ đề toàn bài; đối chiếu mã nguồn và kết quả Python trên video khoảng 00:25–00:55.
- **021 — Open Source Model Wins Rust Code Generation Speed Challenge:** phụ đề toàn bài; bảng kết quả trên video khoảng 06:48 và phép tính tăng tốc từ khoảng 07:19.

Các ví dụ Kadane, giải thích bổ sung và quy trình đánh giá mở rộng là phần biên soạn để học dễ hơn. Bảng số liệu ghi lại thử nghiệm của giảng viên, không phải kết quả tôi chạy lại các mô hình.
