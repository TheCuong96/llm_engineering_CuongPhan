# AI Fluency: Framework and foundations — Phần 1

## 1. Tôi thực sự đọc được gì?

**Trang đang mở:** [AI Fluency: Framework and foundations](https://academy.claude.com/courses/ai-fluency-framework-foundations).

Extension đã cung cấp văn bản của **trang giới thiệu khóa học**, chưa phải nội dung một bài học cụ thể. Tôi đọc được:

- Thông tin khóa học: 14 bài, thời lượng giới thiệu là 4 giờ, một bài kiểm tra và huy hiệu hoàn thành.
- Các mục tiêu học tập, trong đó có khung 4D và ba cách cộng tác với AI.
- Bối cảnh xây dựng khóa học, thông tin về nhóm tác giả và lời công bố cách họ sử dụng AI.

Tôi cũng đã mở và đọc phần văn bản của cả ba PDF được liên kết trực tiếp: [Giới thiệu khóa học](https://www-cdn.anthropic.com/7e9692bba414a91a562af2a64b7e99d7946de590.pdf), [Giới thiệu giảng viên](https://www-cdn.anthropic.com/e5f2470543977625bf82bbf74cd7898f47da4ae1.pdf) và [Cách nhóm tác giả sử dụng AI](https://www-cdn.anthropic.com/0e37fa9da01fab7a5478a2194d352027794c1b89.pdf).

**Giới hạn:** tôi chưa đọc 14 bài riêng lẻ, chưa nhận bản chép lời (transcript) hay phụ đề video, và chưa đọc bản tóm lược thực hành của khung AI Fluency được nhắc đến trong lời công bố. Việc nguồn nhắc tên tài liệu không có nghĩa tôi đã đọc tài liệu ấy.

Vì vậy, hôm nay ta học **phần mở đầu dựa trên trang giới thiệu**, không coi đây là bản giảng lại video hoặc bài số 1 chính thức. Các phần dưới có nhãn **“Giải thích bổ sung”** là diễn giải, ví dụ và bài tập do tôi soạn.

## 2. Bài này nói về điều gì?

**Theo nguồn:** mục tiêu của khóa học là giúp con người cộng tác với AI hiệu quả, tiết kiệm công sức, có đạo đức và an toàn. Khung nền tảng gồm bốn năng lực liên quan với nhau, gọi là 4D. Khóa học hướng tới năng lực cộng tác rộng hơn việc viết những câu yêu cầu hay. [Nguồn: Giới thiệu khóa học](https://www-cdn.anthropic.com/7e9692bba414a91a562af2a64b7e99d7946de590.pdf).

**Giải thích bổ sung:** vấn đề thực tế là AI có thể tạo ra câu trả lời rất nhanh, nhưng bạn vẫn cần quyết định nên nhờ nó làm gì và có nên sử dụng kết quả ấy hay không.

Ví dụ, Claude viết một biểu mẫu React trông hợp lý. Nhưng biểu mẫu có đáp ứng yêu cầu của bạn không? Có xử lý dữ liệu nhập sai không? Bạn có kiểm tra được hành vi của nó không? Tốc độ tạo mã chỉ trả lời một phần của bài toán.

Sau phần mở đầu này, bạn có thể:

- Giải thích năng lực sử dụng AI thành thạo bằng một tình huống thực tế.
- Phân chia một việc nhỏ giữa mình và AI.
- Viết yêu cầu có tiêu chí kiểm tra, rồi phản hồi dựa trên kết quả quan sát được.

### Kiến thức nền cần thiết — Giải thích bổ sung

**Trí tuệ nhân tạo (Artificial Intelligence, AI)** là tên gọi rộng cho các hệ thống thực hiện những nhiệm vụ như nhận dạng, dự đoán hoặc tạo nội dung.

**Mô hình ngôn ngữ lớn (Large Language Model, LLM)** là một loại mô hình được huấn luyện trên lượng lớn dữ liệu để xử lý và sinh ngôn ngữ. Claude thuộc nhóm này. Với phần hôm nay, bạn chỉ cần nhớ: một câu trả lời được diễn đạt trôi chảy vẫn cần được kiểm tra về tính đúng đắn.

**Lời yêu cầu gửi cho AI (prompt)** là phần bạn viết để hướng dẫn AI thực hiện nhiệm vụ, thường gồm mục tiêu, bối cảnh và yêu cầu về kết quả.

Bạn chưa cần học toán của mô hình hay cách gọi dịch vụ AI từ mã nguồn. Nền tảng React và TypeScript đã đủ để hiểu ví dụ hôm nay.

### Bản đồ nội dung được trang giới thiệu nêu

Trang công bố các chủ đề: năng lực sử dụng AI thành thạo; khung 4D; tự động hóa, tăng cường năng lực và giao quyền chủ động; nền tảng AI tạo sinh và LLM; giao việc; mô tả yêu cầu; đánh giá và điều chỉnh; trách nhiệm khi tạo và sử dụng kết quả. Đây là **nhóm mục tiêu học tập**, không phải danh sách tên hoặc thứ tự 14 bài đã được tôi xác minh. [Nguồn: Trang khóa học](https://academy.claude.com/courses/ai-fluency-framework-foundations).

## 3. Phần đầu tiên: Hiểu năng lực sử dụng AI thành thạo

### 3.1. Bản chất là biết tổ chức việc cộng tác — Giải thích bổ sung

**Năng lực sử dụng AI thành thạo (AI Fluency)** có thể hiểu trong thực hành là biết phối hợp khả năng của AI với mục tiêu, sự phán đoán và trách nhiệm của mình.

Hãy lấy một việc bạn quen thuộc: làm biểu mẫu đăng ký bằng React.

Bạn có thể yêu cầu: “Viết cho tôi form đăng ký.” AI có thể tạo ra mã, nhưng lúc đó nhiều quyết định vẫn chưa rõ: cần trường nào, khi nào báo lỗi, dùng thư viện gì, và thế nào được coi là hoàn thành. AI phải tự điền những chỗ trống ấy; lựa chọn của nó có thể khác ý bạn.

Một cách cộng tác rõ ràng hơn là bạn xác định hành vi mong muốn, giao cho AI phần soạn bản nháp, rồi kiểm tra bằng các trường hợp cụ thể. Khi phát hiện sai, bạn đưa lại bằng chứng để sửa.

Điểm cốt lõi nằm ở **toàn bộ quá trình từ mục tiêu đến kết quả được kiểm chứng**. Viết yêu cầu rõ là một phần của quá trình đó.

### 3.2. Vì sao cần nhìn rộng hơn câu trả lời đầu tiên? — Giải thích bổ sung

Giả sử Claude đề xuất biểu mẫu có trường email và mật khẩu. Mã nhìn gọn, tên biến rõ, lời giải thích thuyết phục. Bạn vẫn chưa biết biểu mẫu có hoạt động đúng nếu chưa kiểm tra.

Ví dụ, yêu cầu là “không chấp nhận mật khẩu chỉ gồm khoảng trắng”. Nhưng phần kiểm tra chỉ xét độ dài chuỗi. Khi nhập tám dấu cách, biểu mẫu vẫn cho qua. Mã có thể chạy mà hành vi vẫn sai yêu cầu.

Ta cần tách ba câu hỏi dễ bị nhầm:

| Câu hỏi | Bằng chứng phù hợp trong ví dụ |
|---|---|
| Tôi có hiểu mã không? | Tôi giải thích được cách dữ liệu và lỗi được xử lý. |
| Mã có chạy được không? | Tôi thực sự chạy nó trong môi trường dự án phù hợp. |
| Mã có đáp ứng yêu cầu không? | Tôi thử từng hành vi đã thống nhất, kể cả dữ liệu không hợp lệ. |

Mỗi câu hỏi kiểm tra một điều khác nhau. Lời giải thích tốt không thay thế được việc chạy mã; chạy thành công cũng chưa chứng minh mọi yêu cầu đã đúng.

### 3.3. Nhìn khung 4D qua bốn câu hỏi thực hành

**Theo nguồn:** bốn thành phần của khung là giao việc (Delegation), mô tả (Description), đánh giá có suy xét (Discernment) và thực hành có trách nhiệm (Diligence). [Nguồn: Giới thiệu khóa học](https://www-cdn.anthropic.com/7e9692bba414a91a562af2a64b7e99d7946de590.pdf).

**Giải thích bổ sung:** bảng dưới là cách tôi minh họa khung cho công việc Frontend, chưa thay thế phần định nghĩa chi tiết trong các bài chuyên biệt.

| Thành phần | Câu hỏi để thực hành | Ví dụ biểu mẫu React |
|---|---|---|
| Giao việc | Phần nào nên nhờ AI, phần nào tôi cần tự quyết? | Nhờ AI đề xuất cấu trúc; bạn chốt yêu cầu và phạm vi. |
| Mô tả | AI cần biết gì để làm đúng việc? | Nêu trường dữ liệu, quy tắc hợp lệ, giới hạn thư viện và dạng đầu ra. |
| Đánh giá có suy xét | Tôi dựa vào đâu để chấp nhận kết quả? | Thử dữ liệu hợp lệ, không hợp lệ và đối chiếu yêu cầu. |
| Thực hành có trách nhiệm | Tôi cần làm gì trước khi đưa kết quả cho người khác sử dụng? | Kiểm tra phù hợp với mục đích dùng, xử lý dữ liệu đúng quy định của dự án và công bố sự hỗ trợ của AI khi cần. |

Các câu hỏi này có thể xuất hiện nhiều lần trong một nhiệm vụ. Khi kiểm tra thấy thiếu yêu cầu, bạn quay lại mô tả rõ hơn; khi nhận ra nhiệm vụ quá rộng, bạn điều chỉnh phần giao cho AI.

### 3.4. Một phép so sánh và giới hạn của nó — Giải thích bổ sung

Bạn có thể hình dung mình nhờ một người phụ nấu ăn: bạn chọn món, nói rõ khẩu phần và nguyên liệu cần tránh, giao một số công đoạn rồi kiểm tra món trước khi phục vụ.

Phép so sánh giúp thấy vì sao “đưa một câu lệnh rồi nhận kết quả” chưa đủ cho mọi việc. Tuy nhiên, AI không có hiểu biết đời sống và trách nhiệm như một người phụ bếp. Phép so sánh chỉ minh họa cách tổ chức công việc, không chứng minh AI hiểu hoặc chịu trách nhiệm như con người.

### 3.5. Trách nhiệm vẫn có người giữ

**Theo nguồn:** nhóm tác giả công bố đã sử dụng Claude 3.7 để hỗ trợ xây dựng, soạn thảo, phản biện và chỉnh sửa tài liệu. Con người kiểm tra nội dung, quyết định cuối cùng và giữ trách nhiệm đối với sản phẩm. Đây là mô tả quá trình xây dựng khóa học, không phải khuyến nghị chọn phiên bản Claude hiện tại. [Nguồn: Công bố sử dụng AI](https://www-cdn.anthropic.com/0e37fa9da01fab7a5478a2194d352027794c1b89.pdf).

**Giải thích bổ sung:** với dự án React của bạn, cách áp dụng tương tự là xem mã AI tạo ra như một đóng góp cần được xem xét. Mức kiểm tra phụ thuộc vào việc bạn sẽ dùng mã ở đâu. Một bản thử giao diện và một biểu mẫu đang phục vụ người dùng thật có yêu cầu kiểm chứng khác nhau.

Bạn có thể dùng cách cộng tác này khi học, tạo bản nháp hoặc giải quyết nhiệm vụ có đầu ra kiểm tra được. Nếu bạn chưa đủ khả năng đánh giá phần quan trọng của kết quả, hãy thu nhỏ nhiệm vụ, yêu cầu giải thích hoặc nhờ người có chuyên môn xem xét trước khi sử dụng.

## 4. Thực hành: Nhờ Claude lập kế hoạch trước khi viết mã

**Giải thích bổ sung — đây là bài tập và prompt do tôi soạn, không phải bài tập nguyên văn của khóa học.**

**Mục tiêu:** tập xác định yêu cầu và kiểm tra kết quả của AI bằng một nhiệm vụ nhỏ. Chưa cần cài đặt gì hoặc chạy mã.

### Prompt hoàn chỉnh

```text
Tôi đang học cách cộng tác với AI và có nền tảng React, TypeScript.

Nhiệm vụ: giúp tôi lập kế hoạch cho một biểu mẫu đăng ký thử nghiệm
ở phía giao diện. Chưa viết mã trong lượt này.

Yêu cầu đã chốt:
- Có hai trường: email và mật khẩu.
- Không chấp nhận email trống hoặc chỉ có khoảng trắng.
- Mật khẩu phải có ít nhất 8 ký tự và không được chỉ có khoảng trắng.
- Không gửi dữ liệu ra ngoài và không lưu mật khẩu.
- Không thêm thư viện hoặc kết nối máy chủ.

Hãy trả lời theo thứ tự:
1. Nhắc lại ngắn gọn các yêu cầu đã chốt.
2. Nêu những điểm còn chưa rõ; không tự coi giả định là yêu cầu đã chốt.
3. Đề xuất phần AI có thể hỗ trợ và phần tôi cần tự quyết hoặc kiểm tra.
4. Lập bảng ca kiểm tra, gồm đầu vào và kết quả mong đợi.
5. Nêu rõ những gì kế hoạch này chưa chứng minh được.

Giải thích bằng tiếng Việt dễ hiểu. Dừng ở bản kế hoạch để tôi xem xét.
```

### Vì sao prompt được viết như vậy?

- **Bối cảnh người học** giúp định hướng mức giải thích.
- **Phạm vi “chưa viết mã”** tạo một điểm dừng để xem xét yêu cầu trước khi triển khai.
- **Các yêu cầu đã chốt** cho phép bạn đối chiếu câu trả lời với một căn cứ cụ thể.
- **Các giới hạn** tránh mở rộng bài tập sang lưu trữ dữ liệu hoặc máy chủ.
- **Yêu cầu phân biệt điều chưa rõ** giúp bạn nhận ra quyết định nào vẫn cần mình đưa ra.
- **Bảng ca kiểm tra và giới hạn kết luận** buộc cuộc trao đổi hướng tới cách kiểm chứng.

Để đổi sang việc khác, hãy thay mục tiêu, các yêu cầu đã chốt và giới hạn. Ví dụ, với danh sách sản phẩm, bạn có thể mô tả lọc theo tên và trạng thái khi không có kết quả. Giữ phần yêu cầu nêu điều chưa rõ và cách kiểm tra.

### Các bước thực hiện

1. Gửi prompt trên cho Claude trong cuộc trò chuyện bạn sử dụng để học.
2. Đối chiếu từng yêu cầu đã chốt với kế hoạch nhận được.
3. Kiểm tra xem bảng có trường hợp email trống, email chỉ có khoảng trắng, mật khẩu 7 ký tự, mật khẩu 8 ký tự hợp lệ và mật khẩu chỉ có khoảng trắng hay chưa. Giữ trường email hợp lệ khi thử riêng quy tắc mật khẩu, và ngược lại.
4. Chọn một điểm thiếu hoặc chưa rõ rồi phản hồi bằng bằng chứng cụ thể.
5. Xem bản sửa có giải quyết đúng điểm bạn nêu hay không.

Ví dụ phản hồi khi kế hoạch thực sự bỏ sót trường hợp khoảng trắng:

```text
Bảng kiểm tra chưa có mật khẩu gồm đúng 8 dấu cách.
Yêu cầu đã chốt không cho phép mật khẩu chỉ có khoảng trắng.
Hãy bổ sung ca kiểm tra này, nêu kết quả mong đợi và kiểm tra
xem phần mô tả quy tắc có nhất quán với kết quả đó không.
```

Không cần cố tìm lỗi nếu câu trả lời đã đầy đủ. Khi đó, chọn một điểm còn chưa rõ để hỏi tiếp, chẳng hạn quy tắc xác định email hợp lệ ngoài việc không được trống. Prompt ban đầu chưa chốt toàn bộ quy tắc định dạng email.

### Tiêu chí hoàn thành

Bạn hoàn thành khi phân biệt được yêu cầu đã chốt với đề xuất của AI, chỉ ra được cách kiểm tra từng quy tắc và giải thích được một quyết định cần con người giữ lại. Một bản kế hoạch tốt vẫn chưa chứng minh rằng mã tương lai sẽ chạy đúng.

**Trạng thái thực hiện:** tôi đã soạn bài tập; tôi chưa gửi prompt này sang Claude và chưa chạy hay kiểm thử mã nào trong bài.

## 5. Những ý cần nhớ

- Năng lực cộng tác với AI bao gồm chọn việc, truyền đạt, đánh giá và chịu trách nhiệm.
- Câu trả lời dễ đọc là một tín hiệu về cách trình bày; tính đúng đắn cần bằng chứng phù hợp.
- Khi phản hồi cho AI, nêu đầu vào cụ thể, yêu cầu liên quan và chỗ kết quả chưa đáp ứng.
- Phần hôm nay là bài mở đầu dựa trên trang giới thiệu và ví dụ bổ sung; chưa bao phủ các bài chi tiết của khóa học.

## 6. Năm câu hỏi tự kiểm tra

Chưa có đáp án để bạn tự trả lời trước.

1. Vì sao viết được một prompt rất chi tiết vẫn chưa đủ để chứng minh bạn cộng tác với AI hiệu quả?
2. Claude viết biểu mẫu React và giải thích rất thuyết phục. Bạn cần thêm những bằng chứng nào trước khi kết luận mã đáp ứng yêu cầu?
3. Trong bài tập, Claude tự chọn một thư viện kiểm tra dữ liệu dù bạn đã yêu cầu không thêm thư viện. Bạn sẽ phản hồi thế nào, và phản hồi ấy liên quan đến thành phần nào của khung 4D?
4. Nếu mật khẩu gồm tám dấu cách vẫn được chấp nhận, bạn sẽ mô tả lỗi bằng đầu vào, kết quả quan sát được và kết quả mong đợi như thế nào?
5. Nếu không hiểu phần mã AI tạo ra nhưng muốn đưa vào dự án thật, bạn sẽ điều chỉnh cách giao việc và kiểm tra ra sao? Vì sao?

**Điểm dừng:** đã học xong phần mở đầu. Chưa giảng sâu từng năng lực 4D, ba cách cộng tác hay cơ chế hoạt động của LLM. Bạn có thể trả lời năm câu hỏi hoặc hỏi lại phần chưa rõ trước khi chuyển tiếp.

## 7. Nguồn đã sử dụng

- [Trang khóa học AI Fluency: Framework and foundations](https://academy.claude.com/courses/ai-fluency-framework-foundations): văn bản nhận qua extension; kiểm tra thêm cấu trúc trang và các liên kết PDF bằng trình duyệt.
- [Giới thiệu khóa học — PDF](https://www-cdn.anthropic.com/7e9692bba414a91a562af2a64b7e99d7946de590.pdf): đã đọc văn bản, dùng cho mục tiêu và bối cảnh khung 4D.
- [Giới thiệu giảng viên — PDF](https://www-cdn.anthropic.com/e5f2470543977625bf82bbf74cd7898f47da4ae1.pdf): đã đọc văn bản để xác nhận thành phần nhóm giảng dạy; không dùng thay nội dung bài học.
- [Cách nhóm tác giả sử dụng AI — PDF](https://www-cdn.anthropic.com/0e37fa9da01fab7a5478a2194d352027794c1b89.pdf): đã đọc văn bản, dùng cho ví dụ về vai trò của AI và trách nhiệm của con người.

Ngày kiểm tra nội dung: 15/10/2026. Tài liệu này là phần giảng giải do AI biên soạn dựa trên các nguồn trên, không phải tài liệu chính thức của Anthropic.
