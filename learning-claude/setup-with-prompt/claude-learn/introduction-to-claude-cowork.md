# Introduction to Claude Cowork

## Bài giảng dành cho lập trình viên fullstack chưa học AI

**Phạm vi:** bài **What is Claude Cowork**, thuộc khóa **Introduction to Claude Cowork**, không phải toàn bộ khóa học.

**Nguồn:** [trang bài học của Anthropic Academy](https://anthropic.skilljar.com/introduction-to-claude-cowork/444164), đọc ngày 05/10/2026, gồm văn bản và nội dung tương tác đã đọc trên trang.

**Giới hạn:** chưa có bản chép lời video, nên bài giảng không khẳng định bao quát mọi chi tiết riêng trong video. Các ví dụ fullstack và bài thực hành dưới đây là ví dụ hướng dẫn bổ sung. Không tái hiện nguyên bộ sáu câu hỏi tương tác của khóa.

Bạn chưa chỉ rõ stack cụ thể. Các ví dụ dùng tài liệu sản phẩm, API, Git, kiểm thử và bàn giao QA để áp dụng được cho nhiều dự án.

# Phần 1 — Từ hỏi AI đến giao AI một công việc

## 1. Bài này giải quyết vấn đề gì?

Giả sử bạn cần chuẩn bị tài liệu bàn giao một tính năng thanh toán. Yêu cầu nằm trong tài liệu sản phẩm, quyết định thay đổi nằm trong email và Slack, biên bản họp ở thư mục trên máy, còn kết quả kiểm thử ở một báo cáo khác.

Với cách chat thông thường, bạn thường tự gom dữ liệu, đưa từng phần cho Claude, yêu cầu tóm tắt, rồi ghép và lưu thành tài liệu.

**Cowork hướng tới việc nhận cả công việc đó:** lấy thông tin từ những nguồn được phép truy cập, lập kế hoạch, đọc và đối chiếu các nguồn, rồi tạo đầu ra cụ thể.

Lý do lập trình viên nên quan tâm: công việc của bạn gồm cả viết phần mềm và tổng hợp thông tin, chuẩn bị tài liệu, phối hợp với đội. Cowork được giới thiệu để hỗ trợ nhóm công việc thứ hai.

### Hiểu nhầm phổ biến

**“Cowork hữu ích chủ yếu vì trả lời hay hơn.”** Điểm chính của bài là cách tổ chức công việc: Claude duy trì một nhiệm vụ nhiều bước và tạo sản phẩm bàn giao. Bài không kết luận rằng mọi câu trả lời của Cowork đều thông minh hơn Chat.

## 2. Nền tảng tối thiểu: Claude và LLM

### Định nghĩa

**LLM — Large Language Model, mô hình ngôn ngữ lớn** — là một mô hình AI được huấn luyện để xử lý và tạo ngôn ngữ. Claude là trợ lý AI sử dụng loại mô hình này.

Đây là kiến thức nền bổ sung; bài học hiện tại không đi sâu vào cách huấn luyện mô hình.

### Ví von với lập trình web

Hãy hình dung LLM như một thành phần xử lý nhận đầu vào bằng ngôn ngữ tự nhiên và tạo đầu ra theo yêu cầu. Thay vì chỉ gọi một hàm với các tham số cố định, bạn có thể yêu cầu: “Đọc các báo cáo lỗi này và nhóm chúng theo vấn đề.”

### Ví dụ fullstack

Bạn cung cấp 20 mô tả lỗi. Claude giúp nhóm thành lỗi xác thực, dữ liệu đầu vào, thanh toán và giao diện, rồi viết phần giải thích cho nhóm sản phẩm.

### Chỗ ví von không chính xác

LLM không có hợp đồng hành vi chặt như một hàm nghiệp vụ. Nó có thể hiểu sai, nhóm nhầm hoặc tạo chi tiết nghe hợp lý nhưng thiếu bằng chứng.

**Đầu ra trôi chảy không đồng nghĩa với đầu ra đúng.**

### Lỗi thường gặp

Coi sự tự tin trong cách viết là bằng chứng. Với công việc dự án, hãy đối chiếu kết luận với tài liệu, dữ liệu hoặc kết quả kiểm thử.

## 3. Claude Cowork là gì?

### Định nghĩa

**Claude Cowork** là cách làm việc trong đó bạn giao cho Claude một nhiệm vụ, cung cấp môi trường và nguồn thông tin cần thiết, rồi Claude lập kế hoạch, thực hiện các bước và bàn giao kết quả.

Theo bài học, nhiệm vụ có thể liên quan đến files trên máy, ứng dụng đã kết nối và công việc trong browser.

### Ví von với lập trình web

Hãy liên hệ với một background job gồm nhiều bước: đọc dữ liệu, lấy thêm dữ liệu từ các hệ thống, tổng hợp và tạo báo cáo. Bạn giao mục tiêu thay vì tự làm từng thao tác.

### Ví dụ fullstack

> Đọc tài liệu yêu cầu và biên bản họp trong thư mục bàn giao. Tổng hợp phạm vi tính năng thanh toán, các quyết định đã chốt và những điểm còn thiếu thông tin. Tạo tài liệu để QA chuẩn bị kiểm thử.

### Chỗ ví von không chính xác

Background job thông thường chạy theo luồng do lập trình viên định nghĩa. Cowork có thể tự đề xuất các bước dựa trên yêu cầu và thông tin tìm thấy, nên có thể chọn sai hướng hoặc diễn giải sai dữ liệu.

Không nên mặc định Cowork có tính xác định, cơ chế chạy lại hoặc khôi phục giống hệ thống job bạn thiết kế.

### Hiểu nhầm phổ biến

**“Có Cowork thì khỏi cần Chat.”** Chat vẫn phù hợp để hỏi, lên ý tưởng, suy nghĩ cùng Claude và chỉnh bản nháp. Cowork bổ sung cách giao một công việc trọn vẹn.

## 4. Thay đổi quan trọng nhất: Delegation

### Định nghĩa

**Delegation — giao việc** — là mô tả kết quả bạn cần, cung cấp bối cảnh và ràng buộc, rồi để Claude tổ chức thực hiện. Bạn chuyển từ “trả lời câu hỏi này” sang “hoàn thành công việc này”.

### Ví von với lập trình web

Nó giống viết ticket có acceptance criteria — tiêu chí nghiệm thu. Ticket rõ giúp người thực hiện biết cần tạo ra gì và khi nào công việc được xem là hoàn tất.

### Ví dụ fullstack

Yêu cầu dạng hỏi:

> Tài liệu bàn giao cho QA nên có những gì?

Yêu cầu dạng giao việc:

> Dựa trên tài liệu trong thư mục này, tạo tài liệu bàn giao cho QA gồm phạm vi tính năng, luồng chính, trường hợp lỗi và các điểm chưa xác nhận. Ghi nguồn cho từng quyết định quan trọng.

Yêu cầu thứ nhất cần lời giải thích. Yêu cầu thứ hai cần thực hiện công việc và tạo đầu ra.

### Chỗ ví von không chính xác

Đồng nghiệp có thể biết lịch sử dự án và quy ước chưa được viết ra. Claude phải dựa vào thông tin được cung cấp hoặc truy cập trong phạm vi cho phép. Giao việc không có nghĩa là nó tự biết toàn bộ hệ thống.

### Lỗi thường gặp

- Giao mục tiêu mơ hồ: “Xử lý tài liệu giúp tôi.”
- Không chỉ rõ nguồn cần đọc.
- Không nói đầu ra dùng cho ai.
- Không yêu cầu đánh dấu thông tin thiếu hoặc mâu thuẫn.

## 5. Hình dạng của một nhiệm vụ Cowork phù hợp

Phần tương tác của bài dùng ví dụ: tìm các quyết định về giá trong biên bản họp, email, Slack và tài liệu đề xuất, rồi tạo bản tóm tắt một trang cho lãnh đạo.

| Đặc điểm | Ý nghĩa | Ví dụ fullstack |
|---|---|---|
| Local files | Làm việc với files trên máy | Đọc thư mục tài liệu bàn giao |
| Multiple tools | Phối hợp nhiều công cụ | Đối chiếu tài liệu, email và Slack |
| Multiple steps | Thực hiện nhiều bước | Đọc, so sánh, xác định mâu thuẫn, tổng hợp |
| Real deliverable | Tạo sản phẩm bàn giao cụ thể | Tài liệu hoặc bảng tính hoàn chỉnh |

Đây là hình dạng công việc tiêu biểu trong bài, không phải điều kiện bắt buộc rằng mọi nhiệm vụ phải đủ cả bốn.

### Deliverable là gì?

**Deliverable — sản phẩm bàn giao** — là đầu ra cụ thể có thể kiểm tra và sử dụng, như tài liệu, bảng tính hoặc bộ slide.

Ví von: giống file báo cáo do một job xuất ra. Ví dụ fullstack là tài liệu bàn giao QA; ví dụ trên trang là file `.docx` tóm tắt quyết định về giá.

**Giới hạn:** tạo được file chưa chứng minh nội dung đúng, đầy đủ hoặc sẵn sàng gửi đi.

### Hiểu nhầm phổ biến

**“Upload nhiều files vào Chat là tương đương Cowork.”** Theo bài, khác biệt còn ở việc ai nối các bước với nhau. Trong Chat, bạn thường điều phối từng lượt; Cowork được thiết kế để duy trì toàn bộ nhiệm vụ và tạo đầu ra cuối cùng.

# Phần 2 — Làm việc trong môi trường của bạn

## 6. Tool use: từ viết câu trả lời đến thực hiện thao tác

### Định nghĩa

**Tool use — sử dụng công cụ** — là việc Claude dùng khả năng được hệ thống cung cấp để thực hiện thao tác, chẳng hạn đọc file, lấy thông tin từ ứng dụng hoặc tạo file đầu ra.

Viết “hãy mở file này” trong một câu trả lời và thực sự đọc file là hai việc khác nhau.

### Ví von với lập trình web

Giống một service gọi API hoặc thư viện để lấy dữ liệu và thực hiện hành động. Công cụ tạo cầu nối giữa việc xử lý thông tin và hệ thống bên ngoài.

### Ví dụ fullstack

Để tạo tài liệu bàn giao, Claude có thể đọc tài liệu nguồn, lấy quyết định từ ứng dụng đã kết nối, tổng hợp rồi lưu file đầu ra.

### Chỗ ví von không chính xác

Trong service thông thường, bạn lập trình rõ lúc nào gọi API nào. Với Claude, việc chọn công cụ và thời điểm dùng có thể được quyết định theo yêu cầu và dữ liệu đang có. Không phải mọi yêu cầu đều có công cụ tương ứng hoặc đủ quyền để thực hiện.

### Lỗi thường gặp

Cho rằng lời khẳng định “đã làm xong” đủ chứng minh thành công. Hãy kiểm tra file được tạo, nội dung và vị trí lưu.

## 7. Context và connectors

### Định nghĩa

**Context — ngữ cảnh** — là thông tin Claude có để hiểu và thực hiện yêu cầu: mục tiêu, tài liệu, ràng buộc và kết quả các bước trước.

**Connector — kết nối tới ứng dụng** — là cơ chế cho phép Claude truy cập những khả năng và dữ liệu của ứng dụng được kết nối, trong phạm vi quyền đã cấp.

### Ví von với lập trình web

Context giống dữ liệu đầu vào cùng thông tin cần thiết trong một request. Connector giống integration adapter nối hệ thống của bạn với một dịch vụ bên ngoài.

### Ví dụ fullstack

Context gồm tài liệu yêu cầu, đối tượng đọc là QA và quy định đánh dấu điểm chưa xác nhận. Connector tới Google Drive hoặc Slack có thể giúp lấy tài liệu và quyết định liên quan nếu kết nối đó khả dụng và đã được cấp quyền.

### Chỗ ví von không chính xác

Context không phải một database mà Claude tự truy vấn đầy đủ và luôn nhớ chính xác. Connector cũng không đồng nghĩa với quyền truy cập mọi dữ liệu hay mọi hành động của dịch vụ.

Bài hiện tại không liệt kê chi tiết quyền và thao tác của từng connector, nên không nên suy ra khả năng cụ thể chỉ từ tên ứng dụng.

### Hiểu nhầm phổ biến

**“Đã kết nối Slack thì Claude biết mọi quyết định của đội.”** Thông tin cần tồn tại, nằm trong phạm vi truy cập và được tìm đúng. Một quyết định chỉ nói miệng trong cuộc họp có thể chưa có trong nguồn nào.

## 8. Bốn nơi Cowork làm việc

### 8.1. Trên files của bạn

Bạn chỉ cho Claude thư mục phù hợp; Claude đọc dữ liệu và ghi đầu ra vào môi trường được phép.

Theo bài học, **desktop app là lựa chọn cho công việc liên quan đến files trên máy**, vì tại đó Claude có thể trực tiếp mở và lưu files. Phần tương tác nhấn mạnh việc này không cần bạn upload rồi download thủ công từng file.

**Ví dụ:** đọc một thư mục biên bản họp và tạo tài liệu tổng hợp bên cạnh các tài liệu nguồn.

**Lỗi thường gặp:** đưa cả thư mục quá rộng khiến nguồn thông tin lẫn lộn. Chọn thư mục sát với nhiệm vụ giúp bạn và Claude kiểm tra dễ hơn.

### 8.2. Trong apps đã kết nối

Bài nêu email, calendar, messaging, drive và CRM như những nguồn thông tin có thể tham gia công việc.

**Ví dụ:** đối chiếu biên bản họp với email xác nhận phạm vi tính năng và trao đổi trong Slack.

**Lỗi thường gặp:** nghĩ rằng kết nối ứng dụng tự động giải quyết thông tin mâu thuẫn. Claude vẫn cần chỉ ra nguồn nào nói gì và điểm nào cần người xác nhận.

### 8.3. Trong browser

Bài giới thiệu **Claude in Chrome** như cách đọc và thao tác trên trang web, đặc biệt với công cụ không có connector: dashboard, portal hoặc trang phía sau đăng nhập.

Ví von: giống bạn thao tác qua giao diện web thay vì gọi API. Ví dụ fullstack là đọc thông tin từ một portal hỗ trợ để chuẩn bị báo cáo lỗi.

**Giới hạn của ví von:** thao tác qua giao diện phụ thuộc trang đang hiển thị, phiên đăng nhập, quyền và khả năng thực tế của công cụ. Không nên hiểu câu giới thiệu này thành bảo đảm thao tác được trên mọi website.

**Lỗi thường gặp:** coi browser là đường vòng để bỏ qua quyền truy cập. Browser vẫn làm việc trong môi trường và quyền được cho phép.

### 8.4. Với tools

Cowork hướng tới thực hiện thao tác và tạo đầu ra, thay vì chỉ mô tả bạn nên làm gì. Những thao tác cụ thể vẫn phụ thuộc công cụ được cung cấp và quyền hiện có.

**Ví dụ:** tạo tài liệu bàn giao thay vì chỉ đưa danh sách các mục nên có.

**Lỗi thường gặp:** yêu cầu đầu ra mà không xác định nơi lưu hoặc cách kiểm tra hoàn thành.

## 9. Chọn Chat, Cowork hay Claude Code?

| Tiêu chí | Chat | Cowork | Claude Code |
|---|---|---|---|
| Mục tiêu chính | Suy nghĩ, hỏi đáp, soạn và sửa bản nháp | Giao công việc và nhận kết quả | Xây dựng phần mềm |
| Cách làm việc điển hình | Hội thoại từng lượt | Phiên làm việc nhiều bước | Làm việc trong codebase |
| Bạn thường điều phối | Các lượt hỏi và ghép kết quả | Mục tiêu, nguồn, ràng buộc và việc kiểm tra | Yêu cầu kỹ thuật và việc review |
| Đầu ra tiêu biểu | Giải thích, ý tưởng, bản nháp | Tài liệu, bảng tính, bộ slide | Thay đổi source code, kiểm thử |
| Ví dụ fullstack | Giải thích trade-off REST và GraphQL | Tổng hợp quyết định để bàn giao QA | Sửa API, refactor và chạy tests |

### Claude Code là gì?

**Claude Code** là công cụ phát triển phần mềm dùng Claude để làm việc trong codebase, với khả năng như sửa files, sử dụng terminal và Git theo môi trường và quyền được cho phép.

Ví von: một đồng nghiệp lập trình làm việc trong repo và có thể dùng công cụ phát triển. Ví dụ là sửa lỗi validation của API rồi chạy tests liên quan.

**Giới hạn:** nó không tự có đầy đủ hiểu biết dự án hay bảo đảm thay đổi đúng. Bạn vẫn cần review, kiểm thử và đánh giá tác động như với bất kỳ thay đổi code nào.

### Cách chọn nhanh

- Muốn **hiểu hoặc thảo luận**: bắt đầu bằng Chat.
- Muốn **gom thông tin và tạo sản phẩm bàn giao**: cân nhắc Cowork.
- Muốn **thay đổi phần mềm trong repo**: cân nhắc Claude Code.

Một công việc có thể đi qua cả ba: dùng Chat để bàn phương án, Cowork để tổng hợp yêu cầu, rồi Claude Code để triển khai.

### Hiểu nhầm phổ biến

**“Chat không có công cụ.”** Bài nói Chat cũng có thể lấy thông tin từ tools. Khác biệt cần nhớ là hình dạng và cách duy trì công việc, không phải một ranh giới tuyệt đối về mọi tính năng.

**“Cowork làm nhiều bước nên phải dùng nó để sửa code.”** Chọn theo công việc: bài định vị Claude Code cho xây dựng phần mềm trong codebase.

# Phần 3 — Kiểm soát, thực hành và tự kiểm tra

## 10. Bạn vẫn kiểm soát công việc

Theo bài học, Claude hiển thị kế hoạch trước khi bắt đầu, mặc định hỏi trước những hành động có ý nghĩa như gửi, xóa hoặc chia sẻ, và cho phép bạn điều chỉnh trong quá trình làm.

### Ví von với lập trình web

Hãy liên hệ với bước phê duyệt trong CI/CD: hệ thống có thể chuẩn bị công việc, còn hành động tác động ra bên ngoài có điểm kiểm soát.

### Ví dụ fullstack

Cowork chuẩn bị bản tổng hợp lỗi và tài liệu bàn giao. Bạn xem nội dung trước khi quyết định gửi cho khách hàng hoặc chia sẻ rộng hơn.

### Chỗ ví von không chính xác

Luồng phê duyệt CI/CD có thể được định nghĩa cứng bằng cấu hình. Câu mô tả trong bài chưa phải đặc tả đầy đủ của mọi hành động, mọi phiên bản hay mọi quyền Cowork. Không nên suy ra rằng mọi thay đổi đều có một hộp thoại xác nhận.

### Lỗi thường gặp

- Xem kế hoạch là bằng chứng công việc đã thành công.
- Đồng nhất “tạo bản nháp để gửi” với “được phép gửi”.
- Kiểm tra định dạng mà bỏ qua độ đúng của nội dung.

Gợi ý thực tế: kiểm tra riêng **nguồn**, **kết luận** và **hành động**. Báo cáo đẹp vẫn có thể thiếu nguồn; kết luận đúng vẫn chưa có nghĩa là được phép gửi cho người khác.

## 11. Truy cập Cowork và bước học tiếp theo

Theo nội dung trang hiện tại, Cowork có thể được dùng qua desktop app, web hoặc điện thoại. Desktop app là lựa chọn được bài nêu cho việc trực tiếp đọc và lưu files trên máy.

Cách vào Cowork có thể khác theo phiên bản: có phiên bản dùng tab riêng, có phiên bản chuyển yêu cầu trong hội thoại thành nhiệm vụ Cowork. Vì bài không cung cấp một quy trình giao diện cố định, tài liệu này không đưa tên nút hay đường dẫn menu giả định.

Bài tiếp theo là **Setting up Claude Cowork**: chuẩn bị nơi làm việc như folder hoặc project, thêm connectors đầu tiên và tìm hiểu mô hình quyền.

### Hiểu nhầm phổ biến

Không thấy đúng tab như ảnh hoặc lời kể của người khác không đủ để kết luận bạn thao tác sai. Hãy đối chiếu giao diện và hướng dẫn của phiên bản đang dùng.

## 12. Bài thực hành nhỏ — 25 phút

**Mục tiêu:** tạo bản bàn giao QA cho một tính năng thật trong dự án, dựa trên một nhóm tài liệu nhỏ.

Đây là bài tập hướng dẫn bổ sung, không phải bài tập nguyên văn của Anthropic. Nó kiểm tra khả năng giao việc và kiểm tra kết quả, không yêu cầu viết code.

### Bước 1 — Chuẩn bị nguồn, 5 phút

Chọn một tính năng nhỏ. Tạo thư mục dành cho bài tập chứa bản sao của 2–4 tài liệu bạn được phép sử dụng: yêu cầu tính năng, mô tả API, biên bản quyết định hoặc ghi chú lỗi. Chọn tài liệu không chứa secrets hay dữ liệu người dùng.

Để giữ bài tập đơn giản, chưa cần kết nối thêm ứng dụng.

### Bước 2 — Giao việc, 3 phút

Nếu đã có Cowork và quyền truy cập thư mục qua desktop app, dùng yêu cầu sau và thay phần trong ngoặc vuông:

```text
Tạo tài liệu bàn giao QA cho tính năng [tên tính năng].

Nguồn: chỉ đọc các tài liệu trong thư mục [thư mục bài tập].
Người đọc: QA chưa tham gia phát triển tính năng.

Đầu ra: một file Markdown mới trong thư mục bài tập, gồm:
1. Mục tiêu và phạm vi tính năng.
2. Luồng chính cần kiểm thử.
3. Trường hợp lỗi được tài liệu nguồn nêu rõ.
4. Thông tin thiếu hoặc mâu thuẫn cần xác nhận.
5. Tên tài liệu nguồn cho từng quyết định quan trọng.

Không tự bổ sung yêu cầu nghiệp vụ.
Nếu đề xuất thêm trường hợp kiểm thử, đặt trong mục riêng
và ghi rõ đó là đề xuất của bạn.

Cho tôi xem kế hoạch trước khi thực hiện.
Chỉ tạo file đầu ra mới; không sửa tài liệu nguồn,
không gửi hoặc chia sẻ tài liệu.
```

Các thành phần chính của yêu cầu: mục tiêu nói cần làm gì; nguồn giới hạn dữ liệu; người đọc định hướng cách trình bày; cấu trúc đầu ra giúp nghiệm thu; ràng buộc kiểm soát suy diễn và hành động.

### Bước 3 — Xem kế hoạch và thực hiện, 7 phút

Kiểm tra kế hoạch có bước đọc nguồn, đối chiếu và tạo file. Nếu Claude định bổ sung yêu cầu ngoài tài liệu, điều chỉnh ngay.

Nếu chưa thiết lập Cowork, hãy thực hiện bước chuẩn bị và viết yêu cầu trước. Có thể dùng Chat để luyện cách diễn đạt với các tài liệu được phép cung cấp; việc đó chưa kiểm tra được khả năng Cowork trực tiếp đọc và lưu files.

### Bước 4 — Kiểm tra kết quả, 7 phút

- Mở file thực tế, kiểm tra vị trí lưu.
- Chọn ba quyết định và đối chiếu với nguồn.
- Kiểm tra các trường hợp thiếu dữ liệu có được đánh dấu không.
- Kiểm tra đề xuất mới có tách khỏi yêu cầu đã xác nhận không.
- Xác nhận tài liệu nguồn không bị sửa.

### Bước 5 — Rút kinh nghiệm, 3 phút

Ghi lại một điều yêu cầu ban đầu còn mơ hồ và sửa nó. Đây là cách cải thiện việc giao nhiệm vụ bằng bằng chứng từ kết quả thực tế.

**Tiêu chí hoàn thành:** có file đọc được, đủ các mục yêu cầu, ba quyết định được kiểm tra đúng nguồn và không có hành động ngoài phạm vi đã giao.

## 13. Tóm tắt 5 ý chính

1. **Cowork nhận công việc trọn vẹn:** thu thập thông tin, lập kế hoạch, thực hiện và tạo đầu ra.
2. **Giao kết quả, nguồn và ràng buộc:** đừng chỉ đưa một câu hỏi mơ hồ.
3. **Cowork làm việc trong môi trường được phép:** files, apps và browser; khả năng thực tế phụ thuộc công cụ và quyền.
4. **Chọn theo hình dạng công việc:** Chat để suy nghĩ, Cowork để giao việc, Claude Code để xây dựng phần mềm.
5. **Bạn vẫn kiểm soát và kiểm tra:** kế hoạch, nội dung đầu ra và hành động tác động ra ngoài là những thứ cần đánh giá riêng.

## 14. Câu hỏi tự kiểm tra

1. “Giải thích idempotency trong REST API” và “đọc tài liệu rồi tạo bản bàn giao QA” nên bắt đầu bằng công cụ nào? Vì sao?
2. Vì sao upload nhiều files vào Chat chưa đồng nghĩa với sử dụng Cowork?
3. Claude tạo được file báo cáo đúng định dạng. Điều đó chứng minh những gì và chưa chứng minh những gì?
4. Khi email và biên bản họp mâu thuẫn về phạm vi tính năng, bạn nên yêu cầu Claude xử lý thế nào?
5. Muốn refactor nhiều source files và chạy tests trong repo, bài học định vị công cụ nào phù hợp nhất?

## 15. Cần tìm hiểu thêm

Trong khóa học, các phần tiếp theo sẽ đi vào thiết lập, giao nhiệm vụ đầu tiên, hướng dẫn dùng lâu dài, skills, plugins, Chrome, Microsoft 365 và an toàn. Bài hiện tại chủ yếu xây dựng cách hiểu và cách chọn công cụ.

Nếu mục tiêu của bạn là dùng Claude Code hoặc tích hợp Claude API vào sản phẩm, sau bài này cần học riêng về vòng lặp dùng công cụ, quyền truy cập và kiểm thử kết quả.

Những thuật ngữ dưới đây **vượt phạm vi bài hiện tại**; bạn chưa cần biết để làm bài thực hành. Bảng chỉ cung cấp định hướng ban đầu, không phải đặc tả tính năng Cowork.

| Thuật ngữ | Định nghĩa ngắn | Ví von web và ví dụ fullstack | Giới hạn của ví von |
|---|---|---|---|
| Token | Đơn vị mà mô hình dùng để biểu diễn và xử lý nội dung; không tương đương cố định với một từ | Giống đơn vị đo kích thước payload; lượng tài liệu API đưa vào ảnh hưởng lượng token | Token không phải byte hay từ; cách chia phụ thuộc mô hình |
| Context window | Giới hạn lượng nội dung mô hình có thể xử lý trong một lần làm việc với đầu vào | Giống ngân sách payload; đưa quá nhiều tài liệu cần cân nhắc chọn lọc | Không phải bộ nhớ lâu dài hay database |
| Agent | Hệ thống dùng mô hình để chọn và thực hiện các bước qua công cụ nhằm đạt mục tiêu | Giống worker điều phối; đọc tài liệu, gọi công cụ rồi kiểm tra kết quả | Không phải luồng chương trình cố định; có thể chọn bước sai |
| Subagent | Agent được giao một phần công việc trong một hệ thống lớn hơn | Giống giao một hạng mục cho worker khác; một agent phân tích tài liệu API | Không mặc định có tính độc lập, trạng thái hay triển khai như microservice |
| MCP — Model Context Protocol | Giao thức kết nối ứng dụng AI với công cụ và nguồn dữ liệu | Giống giao diện tích hợp chuẩn; cung cấp công cụ đọc dữ liệu dự án | Không thay thế API nghiệp vụ và không tự cấp quyền truy cập |
| Skill | Bộ hướng dẫn và tài nguyên để AI thực hiện một loại công việc theo cách nhất định | Giống playbook; hướng dẫn viết tài liệu theo mẫu của đội | Không phải hàm xác định hay bảo đảm luôn tuân thủ hoàn hảo |
| Prompt caching | Cơ chế tái sử dụng phần xử lý của nội dung đầu vào lặp lại theo hỗ trợ của dịch vụ | Giống cache; phần hướng dẫn chung lặp lại qua nhiều yêu cầu API | Không phải cache toàn bộ câu trả lời; điều kiện và lợi ích phụ thuộc dịch vụ |

### Hiểu nhầm phổ biến

Không nên suy luận rằng Cowork công khai hoặc cho phép bạn cấu hình mọi cơ chế trong bảng. Muốn dùng tính năng cụ thể, cần đọc tài liệu chính thức tương ứng với sản phẩm và phiên bản.

## 16. Đáp án tự kiểm tra

1. **Chat** cho việc giải thích một khái niệm; **Cowork** cho việc đọc nguồn và tạo tài liệu bàn giao. Chọn theo hình dạng công việc, không chỉ theo độ khó.
2. Khác biệt nằm ở việc duy trì nhiệm vụ và điều phối các bước. Với Chat, người dùng thường nối các lượt; Cowork được thiết kế để xử lý công việc nhiều bước tới đầu ra.
3. Chứng minh đã tạo được file có định dạng kiểm tra được. Chưa chứng minh kết luận đúng, nguồn đầy đủ hoặc tài liệu được phép gửi đi.
4. Yêu cầu chỉ rõ nội dung mâu thuẫn và nguồn tương ứng, đánh dấu cần xác nhận; không tự chọn một nguồn là chân lý khi chưa có quy tắc hoặc bằng chứng.
5. **Claude Code**, vì công việc nằm trong codebase và cần công cụ phát triển như terminal, Git và chạy tests. Kết quả vẫn cần review và kiểm thử phù hợp.
