# The AI-native SDLC playbook — Introduction

## Bài giảng dành cho lập trình viên fullstack

Nguồn: [Introduction — Claude Academy](https://academy.claude.com/courses/ai-native-sdlc-playbook/introduction).

**Phạm vi:** giải thích đầy đủ các ý chính của bài Introduction, bài 1 trong khóa học 14 bài. Đây không phải bản dịch toàn bộ khóa học. Các ví dụ fullstack và bài thực hành bên dưới là ví dụ giảng giải, không phải cấu hình hay quy trình bắt buộc do Anthropic quy định.

Ví dụ xuyên suốt sử dụng React, Node.js, SQL, Git và CI/CD. Bạn có thể thay bằng stack đang dùng.

# Phần 1: Vì sao viết code nhanh hơn chưa đủ?

## 1. Bài này giải quyết vấn đề gì?

Bạn dùng AI và hoàn thành một tính năng trong vài giờ, nhưng phải chờ làm rõ yêu cầu hai ngày, chờ review ba ngày và chờ lịch release thêm một tuần.

**Viết code nhanh hơn không đồng nghĩa với đưa phần mềm hữu ích đến người dùng nhanh hơn.**

Bài học giải quyết khoảng cách này: khi AI tăng tốc khâu triển khai, các khâu xung quanh có thể trở thành nơi giữ công việc lại. Anthropic đề xuất thay đổi toàn bộ quy trình phát triển phần mềm, thay vì chỉ thêm AI vào bước viết code.

Với một lập trình viên fullstack, điều này đáng quan tâm vì bạn thường đi qua nhiều khâu: hiểu yêu cầu, sửa frontend, viết API, thay đổi database, kiểm thử và triển khai. Tốc độ của bạn phụ thuộc vào cả chuỗi.

### Hiểu nhầm phổ biến

**“Bài này khẳng định viết code không còn là nút thắt trong mọi dự án.”**

Không nên hiểu tuyệt đối. Phần “When code is no longer the bottleneck” mô tả tình huống khâu xây dựng đã được tăng tốc đáng kể. Trong dự án có yêu cầu khó hoặc nhiều ràng buộc, triển khai vẫn có thể là nút thắt. Bạn cần kiểm tra tình hình thực tế của đội mình.

## 2. SDLC truyền thống

**SDLC — Software Development Lifecycle**, nghĩa là vòng đời phát triển phần mềm: quy trình đưa ý tưởng thành phần mềm chạy thật, rồi tiếp tục vận hành và cải tiến nó.

| Giai đoạn | Câu hỏi chính | Ví dụ: thêm chức năng xuất đơn hàng |
|---|---|---|
| **Plan** — xác định nhu cầu và lập kế hoạch | Cần giải quyết vấn đề gì? | Nhân viên mất thời gian tổng hợp đơn hàng |
| **Design** — thiết kế | Giải pháp nên hoạt động thế nào? | Xác định quyền truy cập, API và định dạng CSV |
| **Build** — xây dựng | Triển khai bằng cách nào? | Viết giao diện, API và truy vấn SQL |
| **Test** — kiểm thử | Có hoạt động đúng không? | Kiểm tra phân quyền, dữ liệu và trường hợp lỗi |
| **Deploy** — triển khai | Đưa thay đổi lên môi trường thật thế nào? | Chạy pipeline và phát hành |
| **Maintain** — duy trì, vận hành | Sau phát hành có vấn đề gì? | Theo dõi lỗi, độ trễ và phản hồi người dùng |

**Ví von với web:** giống request đi qua nhiều middleware; mỗi bước có trách nhiệm riêng trước khi chuyển tiếp.

**Giới hạn:** SDLC kéo dài qua nhiều người, công cụ và ngày làm việc. Nó không phải chuỗi hàm trong một request; các giai đoạn có thể chồng lấn hoặc quay lại bước trước.

Trong mô hình truyền thống mà bài mô tả, product manager ghi yêu cầu, kiến trúc sư thiết kế, kỹ sư triển khai, QA kiểm tra, đội release phát hành và đội vận hành theo dõi. Công việc được bàn giao qua tài liệu, ticket và phê duyệt. Đây là mô hình khái quát; không phải mọi đội đều có từng vai trò tách biệt.

Khi triển khai mất nhiều tuần hoặc nhiều tháng, hiểu sai yêu cầu gây lãng phí lớn. Tài liệu, ước lượng và review giúp thống nhất kỳ vọng, làm rõ trách nhiệm và kiểm soát rủi ro.

**PRD — Product Requirements Document**, nghĩa là tài liệu yêu cầu sản phẩm: ghi nhu cầu, phạm vi và kết quả mong muốn.

- **Ví von:** gần với hợp đồng API vì giúp các bên thống nhất kỳ vọng.
- **Ví dụ:** xác định ai được xuất đơn hàng, trường dữ liệu nào được xuất và vấn đề người dùng đang gặp.
- **Giới hạn:** PRD chứa mục tiêu bằng ngôn ngữ tự nhiên; không chặt chẽ hay tự kiểm tra được như schema API.

### Lỗi thường gặp

**“Có AI thì bỏ hết tài liệu và phê duyệt.”** Bài học giữ mục tiêu kiểm soát, nhưng đề xuất đổi cách thực hiện để phù hợp với tốc độ mới.

## 3. Từ LLM đến agent

**AI — Artificial Intelligence**, nghĩa là trí tuệ nhân tạo. Trong ngữ cảnh bài, AI hỗ trợ đọc yêu cầu, đề xuất giải pháp và thực hiện công việc phát triển phần mềm.

**LLM — Large Language Model**, nghĩa là mô hình ngôn ngữ lớn: mô hình xử lý và tạo văn bản hoặc code dựa trên thông tin được cung cấp. Câu trả lời có thể hợp lý về cách diễn đạt nhưng vẫn sai.

- **Ví von:** gọi LLM qua API giống gọi dịch vụ backend nhận đầu vào và trả đầu ra.
- **Ví dụ:** gửi mô tả lỗi và API handler, nhận phân tích cùng đề xuất sửa.
- **Giới hạn:** đầu ra không có độ chắc chắn như một hàm tính toán đã được đặc tả rõ; cách diễn đạt tự tin không chứng minh nội dung đúng.

**Agent**, nghĩa là hệ thống AI làm việc qua nhiều bước: nhận mục tiêu, chọn hành động, dùng công cụ, đọc kết quả rồi tiếp tục xử lý.

**Tool use**, nghĩa là sử dụng công cụ: AI yêu cầu một công cụ thực hiện hành động như đọc file hoặc chạy test; môi trường thực thi và trả kết quả về.

Ví dụ, khi nhận yêu cầu “Sửa lỗi người không có quyền vẫn xuất được đơn hàng”, agent có thể:

1. Đọc route xuất CSV và logic phân quyền bằng công cụ đọc file.
2. Tìm test liên quan.
3. Sửa code.
4. Yêu cầu công cụ chạy test.
5. Đọc kết quả và điều chỉnh.
6. Trình bày thay đổi để người phụ trách review.

- **Ví von cho agent:** một worker xử lý job nhiều bước, gọi service rồi chọn bước tiếp theo từ kết quả.
- **Giới hạn:** worker thường chạy logic lập trình sẵn; agent có thể lựa chọn dựa trên mô hình nên có thể hiểu sai mục tiêu hoặc chọn sai hành động.
- **Ví von cho tool use:** gọi một hàm hoặc endpoint để thực hiện tác vụ cụ thể.
- **Giới hạn:** mô hình đề xuất lời gọi công cụ; quyền thực thi, công cụ sẵn có và cách xử lý lỗi phụ thuộc môi trường. Việc AI viết “test đã pass” không thay thế kết quả chạy test thật.

Bài học nhắc **Claude Code** như ví dụ về giải pháp **agentic coding**: dùng agent hỗ trợ công việc lập trình.

### Hiểu nhầm phổ biến

**“Agent tự chạy test nên kết quả chắc chắn đúng.”** Test có thể thiếu tình huống quan trọng; agent cũng có thể sửa test theo kỳ vọng sai. Con người vẫn cần xác định đúng yêu cầu và tiêu chí chấp nhận.

## 4. Khi Build nhanh hơn, nút thắt chuyển đi đâu?

**Bottleneck**, nghĩa là nút thắt: công đoạn giới hạn tốc độ của toàn bộ dòng công việc.

- **Ví von:** API nhận job nhanh nhưng worker xử lý chậm thì queue dài ra.
- **Ví dụ:** agent tạo nhiều pull request trong khi đội bảo mật chỉ review được một số lượng nhỏ; hàng chờ tăng.
- **Giới hạn:** PR không đồng đều như job đơn giản. Một PR sửa chữ và một PR thay đổi phân quyền có độ khó và rủi ro khác nhau.

Bài nêu ba hệ quả:

1. **Nút thắt chuyển sang Plan, Review/Test và Deploy.** Yêu cầu, kiểm tra và phát hành vẫn có thể chậm dù code đã sẵn sàng.
2. **Cách kiểm soát cũ khó theo kịp lượng code mới.** Đọc thủ công mọi dòng có thể vượt năng lực của đội. Với bảo mật, hệ quả là hàng chờ lớn hoặc phát hành khi chưa kiểm tra đủ.
3. **Chi phí governance tăng.** Nhiều ngoại lệ hơn phải đi qua các cuộc họp hoặc hội đồng chỉ diễn ra hàng tuần, hàng tháng.

**Governance**, nghĩa là quản trị và kiểm soát: quy định ai được quyết định, điều kiện nào phải đáp ứng và bằng chứng nào cần lưu.

- **Ví von:** gần với authorization và policy trong backend.
- **Ví dụ:** thay đổi logic thanh toán cần người có trách nhiệm phê duyệt trước phát hành.
- **Giới hạn:** governance rộng hơn kiểm tra quyền trong code; còn gồm trách nhiệm, xử lý ngoại lệ và khả năng truy lại quyết định.

### Lỗi thường gặp

Chỉ đo số dòng code hoặc số PR do AI tạo ra. Các số này không cho biết tính năng đã đến người dùng nhanh hơn hay chất lượng có tốt hơn không. Hãy quan sát cả thời gian chờ giữa các bước — đây là gợi ý thực hành, không phải bộ chỉ số bắt buộc của bài Introduction.

## 5. AI-native SDLC là gì?

**AI-native SDLC**, nghĩa là vòng đời phát triển phần mềm được thiết kế để AI tham gia xuyên suốt, từ làm rõ nhu cầu đến vận hành.

Ý chính: **giữ mục tiêu kiểm soát, đổi cách thực thi và tổ chức công việc thành vòng lặp có AI tham gia, với con người chịu trách nhiệm.**

- **Ví von:** workflow dựa trên sự kiện; một kết quả được chấp nhận có thể kích hoạt bước tiếp theo.
- **Ví dụ:** duyệt nhu cầu xuất CSV → thiết kế → code và test → review → phát hành → phát hiện truy vấn chậm → tạo nhu cầu cải tiến mới.
- **Giới hạn:** có sự kiện không có nghĩa được tự động đi tiếp. Các bước cần phán đoán hoặc phê duyệt vẫn cần người chịu trách nhiệm.

### Hiểu nhầm phổ biến

**“AI-native nghĩa là con người ra khỏi quy trình.”** Bài học giữ con người ở vai trò khởi xướng, định hướng và quản trị. Điều thay đổi là nơi con người tập trung chú ý.

# Phần 2: Vòng lặp hoạt động cụ thể thế nào?

## 6. Sáu giai đoạn thay đổi ra sao?

Bảng trong bài mô tả hai đầu của một phổ chuyển đổi. Phần lớn tổ chức nằm giữa hai đầu, không nhất thiết chuyển toàn bộ cùng lúc.

### 6.1. Plan: từ nguồn vấn đề đến intent.md

Claude tổng hợp khó khăn từ nguồn thông tin thực tế và ghi thành **intent.md**: file mô tả ý định, vấn đề và kết quả mong muốn để cả người và agent sử dụng.

- **Ví von:** ticket được viết rõ để người nhận bắt đầu làm việc mà ít phải hỏi lại.
- **Ví dụ:** ghi rằng nhân viên mất 30 phút tổng hợp đơn hàng mỗi ngày và cần xuất dữ liệu đúng quyền truy cập.
- **Giới hạn:** tên file không tạo ra cơ chế tự động. File cũng không tự chứng minh nhu cầu đúng; người phụ trách phải kiểm tra nguồn và xác nhận.

**Lỗi thường gặp:** bắt đầu bằng giải pháp “thêm nút CSV” mà chưa nói vấn đề nào cần giải quyết và thành công được nhận biết thế nào.

### 6.2. Design: cùng agent làm rõ yêu cầu và thiết kế

Bài đề xuất rút ngắn khoảng cách giữa yêu cầu và thiết kế trong một phiên làm việc với agent. Các chuẩn của tổ chức được đóng gói thành skills và quản lý phiên bản trong Git.

**Skill**, nghĩa là gói hướng dẫn và có thể kèm tài nguyên giúp agent thực hiện một loại công việc theo cách mong muốn.

- **Ví von:** gần với playbook kỹ thuật hoặc bộ quy ước có ví dụ dùng lại.
- **Ví dụ:** skill hướng dẫn thiết kế REST API với format lỗi, pagination và quy tắc phân quyền của dự án.
- **Giới hạn:** skill không phải thư viện được compiler bắt buộc thực thi. Có hướng dẫn không bảo đảm agent luôn tuân thủ; vẫn cần kiểm tra kết quả.

Thiết kế có thể được ghi trong **spec.md**: tài liệu đặc tả hành vi và giải pháp đã thống nhất.

**Lỗi thường gặp:** hiểu “rút ngắn quá trình” thành “bỏ thiết kế”. Quyết định quan trọng vẫn phải được làm rõ và ghi lại.

### 6.3. Build: code, test và tri thức cùng được duy trì

AI hỗ trợ tạo code và test. Tri thức của dự án được duy trì trong **CLAUDE.md** và skills có quản lý phiên bản, thay vì chỉ nằm trong đầu người hoặc trong chat cũ.

**CLAUDE.md** là file hướng dẫn dự án cho Claude Code, chứa thông tin cần thiết để làm việc trong repository.

- **Ví von:** README dành cho cộng tác viên, tập trung vào quy ước và cách làm việc.
- **Ví dụ:** ghi lệnh test thực tế của repo, cấu trúc module và quy tắc xử lý quyền xuất dữ liệu.
- **Giới hạn:** nội dung file là hướng dẫn, không phải cơ chế cưỡng chế. Đừng ghi một quy tắc rồi coi nó đã được bảo đảm như constraint trong database.

Bài cũng nhắc **plan mode**, nghĩa là chế độ lập kế hoạch của Claude Code để phân tích và đề xuất cách triển khai trước khi bước sang thực hiện. Bài Introduction không cung cấp chi tiết lệnh hay cấu hình nên tài liệu này không đoán cách kích hoạt.

- **Ví von:** viết implementation plan trước khi sửa module.
- **Ví dụ:** liệt kê thay đổi ở route, service, giao diện và test cho chức năng CSV.
- **Giới hạn:** kế hoạch do AI tạo vẫn có thể thiếu phụ thuộc hoặc hiểu sai codebase; cần kiểm tra trước khi thực hiện.

**Lỗi thường gặp:** để hướng dẫn dự án lỗi thời hoặc chứa quá nhiều thông tin không liên quan. File tồn tại không có nghĩa tri thức bên trong còn đúng.

### 6.4. Test: phản hồi liên tục trong quá trình xây dựng

Thay vì chỉ có cổng QA ở cuối giai đoạn, bài đề xuất đan **evals — evaluations**, nghĩa là các phép đánh giá có tiêu chí, vào quá trình thực hiện.

- **Ví von:** giống chạy kiểm tra tự động thường xuyên trong CI để nhận phản hồi sớm.
- **Ví dụ:** mỗi lần thay đổi chức năng CSV, kiểm tra quyền truy cập, định dạng dữ liệu và tình huống dữ liệu lớn.
- **Giới hạn:** eval là khái niệm rộng hơn unit test. Tùy đối tượng đánh giá, nó có thể dùng tiêu chí chất lượng hoặc cách chấm có độ biến thiên. Introduction chưa định nghĩa bộ eval cụ thể; cần xem bài chuyên về evals để triển khai chi tiết.

**Lỗi thường gặp:** để AI vừa tạo kết quả vừa tự tuyên bố đạt mà không có tiêu chí hay bằng chứng kiểm tra độc lập.

### 6.5. Deploy: review nhiều lớp và kiểm soát tại lúc hành động

Bài đề xuất nhiều lớp agentic review, đồng thời dành human review cho code quan trọng hoặc chịu yêu cầu quản lý. Con người vẫn chịu trách nhiệm với quyết định cần phán đoán.

**Agentic review**, nghĩa là dùng agent để đọc thay đổi, tìm vấn đề và ghi nhận kết quả review.

- **Ví von:** giống một lớp kiểm tra trong CI, bổ sung khả năng phân tích theo ngữ cảnh.
- **Ví dụ:** agent kiểm tra PR xuất CSV có bỏ sót authorization hoặc đưa dữ liệu nhạy cảm vào file không.
- **Giới hạn:** review bằng agent có thể bỏ sót lỗi hoặc báo nhầm; không có độ bảo đảm của một quy tắc kiểm tra xác định.

**Hook**, nghĩa là cơ chế chạy xử lý ở một sự kiện trong quá trình agent hoạt động. Bài đặt hooks vào vai trò **approval gates**, tức cổng kiểm soát/phê duyệt trước khi đi tiếp.

- **Ví von:** middleware hoặc Git hook kiểm tra điều kiện trước một thao tác.
- **Ví dụ:** ở mức thiết kế, kiểm tra một hành động triển khai có đáp ứng chính sách và phê duyệt cần thiết không.
- **Giới hạn:** sự kiện, khả năng chặn và cấu hình phụ thuộc hệ thống cụ thể. Một hook không tự tạo đầy đủ quy trình phê duyệt; Introduction không cung cấp cấu hình để thực hiện ví dụ này.

**Lỗi thường gặp:** coi review bằng AI hoặc hook là bằng chứng hệ thống đã an toàn. Phải xác định rõ điều kiện kiểm tra, quyền thực thi và ai xử lý ngoại lệ.

### 6.6. Maintain: dữ liệu production quay lại thành nhu cầu mới

Bài mô tả agents theo dõi deployment đang chạy. Khi chỉ số vượt **control band**, tức dải giới hạn chấp nhận được, vấn đề được chẩn đoán và ghi thành intent.md mới.

- **Ví von:** alert threshold trong hệ thống monitoring.
- **Ví dụ:** đội quy định mục tiêu độ trễ xuất CSV; khi vượt giới hạn, kết quả điều tra trở thành đầu vào cho vòng cải tiến.
- **Giới hạn:** vượt ngưỡng cho biết cần xem xét, không tự chứng minh nguyên nhân. Ngưỡng cũng cần phù hợp tải và ngữ cảnh; agent không tự có quyền sửa production chỉ vì nhận được cảnh báo.

**Lỗi thường gặp:** coi giả thuyết chẩn đoán của agent là nguyên nhân đã được chứng minh.

## 7. Artifact và Git nối các bước thành một chuỗi

**Artifact**, nghĩa là sản phẩm đầu ra được lưu lại của một bước: tài liệu, code, test hoặc bản ghi kết quả.

- **Ví von:** dữ liệu đầu ra của một job được lưu để job tiếp theo đọc.
- **Ví dụ:** Design đọc intent.md đã duyệt, rồi tạo spec.md để bước sau sử dụng.
- **Giới hạn:** artifact có thể là ngôn ngữ tự nhiên nên không có schema chặt chẽ như payload API. Tồn tại một file không có nghĩa nó đầy đủ hoặc đã được chấp nhận.

Bài nêu chuỗi đầu ra gồm intent.md, spec.md, plan.md, diff và test, PR cùng phát hiện review, và bản ghi sự cố.

Ở giai đoạn đầu, Markdown hữu ích vì cả product owner và agent đều đọc được. Từ Build trở đi, code và hồ sơ liên quan trở thành đầu ra chủ yếu.

Chuỗi commit góp phần tạo **audit trail**, nghĩa là dấu vết có thể kiểm tra lại: ai yêu cầu điều gì, agent tạo gì và ai phê duyệt.

- **Ví von:** log có khả năng truy vết một request qua nhiều bước.
- **Ví dụ:** từ PR có thể truy lại spec và nhu cầu gốc để hiểu vì sao chức năng CSV được xây.
- **Giới hạn:** lịch sử Git không tự ghi đầy đủ nguồn yêu cầu hoặc mọi phê duyệt. Cần liên kết và lưu các bằng chứng ấy; không nên coi bất kỳ commit nào cũng là sự phê duyệt hợp lệ.

### Hiểu nhầm phổ biến

**“Chỉ cần tạo các file đúng tên là có AI-native SDLC.”** Các file là phương tiện bàn giao. Giá trị nằm ở nội dung, tiêu chí chấp nhận, người chịu trách nhiệm và cơ chế sử dụng chúng.

**“Commit file sẽ tự kích hoạt agent.”** Đây là cách vận hành mục tiêu mà bài đề xuất. Đội phải thiết lập tích hợp hoặc workflow; Git và Markdown không tự cung cấp khả năng đó.

## 8. Các plays hoạt động thế nào?

**Play**, nghĩa là một cách làm cụ thể trong playbook, có thể áp dụng cho một mục tiêu của quy trình.

- **Ví von:** runbook triển khai hoặc xử lý sự cố có đầu vào, bước thực hiện và tiêu chí kết quả.
- **Ví dụ:** play “Capture as intent.md” tập trung biến nhu cầu thành đầu vào rõ ràng cho thiết kế.
- **Giới hạn:** play không nhất thiết là script tự chạy; nó có thể cần người điều phối, quyết định và công cụ hỗ trợ.

Mỗi play trong khóa học trình bày năm nhóm nội dung:

1. Điều gì thay đổi.
2. Cách bắt đầu.
3. Các bước triển khai cụ thể.
4. Những vấn đề governance cần cân nhắc.
5. Cách đo xem nó có hiệu quả không.

Các plays được chia vào sáu giai đoạn nhưng không buộc mọi tổ chức triển khai theo một hàng thẳng. Bạn có thể ưu tiên giai đoạn đang nghẽn, sau khi kiểm tra **Prerequisites**, tức điều kiện tiên quyết của play.

Bài mô tả đồ thị phụ thuộc: các play ở hàng đầu không có điều kiện tiên quyết; mũi tên liền biểu thị phụ thuộc, mũi tên nét đứt biểu thị hỗ trợ nhưng không bắt buộc. Nội dung văn bản đọc được không cung cấp đủ từng cạnh của hình, nên tài liệu này không dựng lại đồ thị phụ thuộc cụ thể.

Vòng lặp mục tiêu được mô tả như sau:

```text
intent.md được chấp nhận
  → làm rõ yêu cầu và thiết kế
spec.md được phê duyệt
  → lập kế hoạch triển khai
code + test + PR được review và merge
  → pipeline triển khai
production vượt giới hạn đã đặt
  → chẩn đoán và tạo intent.md mới
```

Ban đầu, bạn có thể yêu cầu từng bước bằng tay. Đích đến là các đầu ra được chấp nhận kích hoạt cổng xử lý tiếp theo, với con người tập trung review và quyết định ở các cổng cần thiết.

### Lỗi thường gặp

Tự động hóa toàn bộ trước khi làm rõ đầu vào, tiêu chí chấp nhận và trách nhiệm. Bạn chỉ khiến một quy trình chưa rõ chạy nhanh hơn. Hãy thử một play tại điểm nghẽn trước rồi đo kết quả.

## 9. Tóm tắt 5 ý chính

1. **Tốc độ viết code chỉ là một phần của tốc độ giao phần mềm.** Plan, Review/Test và Deploy có thể trở thành nút thắt mới.
2. **AI-native SDLC giữ mục tiêu kiểm soát nhưng đổi cách thực thi.** AI tham gia xuyên suốt; con người vẫn chịu trách nhiệm với quyết định cần phán đoán.
3. **Quy trình trở thành vòng lặp.** Kết quả vận hành quay lại làm đầu vào cho thay đổi tiếp theo.
4. **Đầu ra được lưu và quản lý phiên bản giúp bàn giao và truy vết.** intent.md, spec.md, code, test và hồ sơ review cần liên kết với nhau.
5. **Chuyển đổi theo các plays có điều kiện tiên quyết.** Bắt đầu thủ công, ưu tiên điểm nghẽn và chỉ tự động hóa khi cơ chế kiểm tra đã rõ.

## 10. Câu hỏi tự kiểm tra

1. Agent hoàn thành code trong hai giờ nhưng PR chờ review bốn ngày. Bạn nên kiểm tra điểm nào trước, và vì sao?
2. intent.md đã được commit có đồng nghĩa yêu cầu đúng và được phê duyệt không?
3. Skill và database constraint khác nhau ở điểm nào về khả năng bảo đảm quy tắc?
4. Agent review không phát hiện lỗi có đủ để kết luận PR thay đổi phân quyền đã an toàn không?
5. Số liệu production góp phần đóng vòng lặp SDLC như thế nào?

## 11. Bài thực hành 15–30 phút: tạo một đầu vào có thể bàn giao

**Mục tiêu:** biến một vấn đề thật trong dự án thành intent.md có thể review, rồi kiểm tra liệu agent có hiểu đúng trước khi viết code.

### Bước 1 — Chọn vấn đề nhỏ, 3 phút

Chọn một việc như trạng thái loading chưa rõ, API trả lỗi thiếu nhất quán hoặc trang danh sách bị chậm. Tránh chọn nhiệm vụ lớn cho lần đầu.

Ghi nguồn vấn đề: ticket, phản hồi người dùng hoặc quan sát có thể kiểm tra.

### Bước 2 — Tạo bản nháp intent.md, 7 phút

Đây là mẫu thực hành đề xuất, không phải schema bắt buộc của khóa học:

```markdown
# Intent: Hiển thị trạng thái khi xuất đơn hàng

## Vấn đề và nguồn
Người dùng bấm xuất nhiều lần vì không biết request đang chạy.
Nguồn: [ticket hoặc quan sát cụ thể trong dự án]

## Kết quả mong muốn
Người dùng nhận biết thao tác đang xử lý và khi nào hoàn tất.

## Phạm vi
Giao diện xuất đơn hàng; giữ hành vi và quyền truy cập hiện có.

## Tiêu chí chấp nhận
- Khi đang xử lý, giao diện hiển thị trạng thái chờ.
- Không gửi request trùng từ việc bấm nút liên tiếp.
- Khi thành công hoặc lỗi, người dùng nhận thông báo rõ.

## Câu hỏi còn mở
- Dự án đã có component và quy ước thông báo nào?
```

Mỗi mục có một vai trò: nguồn giúp kiểm tra nhu cầu; kết quả nói điều cần đạt; phạm vi giới hạn thay đổi; tiêu chí giúp review; câu hỏi mở ngăn giả định bị giấu đi.

### Bước 3 — Nhờ agent phân tích trước, 5–10 phút

Nếu đã có công cụ agent trong dự án, dùng yêu cầu sau:

```text
Đọc intent.md và code liên quan. Chưa sửa code.
Tóm tắt vấn đề, chỉ ra thông tin còn thiếu và đề xuất phương án nhỏ nhất.
Với mỗi tiêu chí chấp nhận, nêu cách kiểm tra phù hợp.
Phân biệt điều đã thấy trong code với giả định chưa xác minh.
```

Nếu chưa có agent, tự làm bước này như một cuộc review đầu vào; bạn vẫn thực hành được phần cốt lõi.

### Bước 4 — Review và lưu kết quả, 5 phút

- Kiểm tra agent có hiểu đúng nhu cầu không.
- Bổ sung những câu hỏi thực sự còn thiếu.
- Xác nhận tiêu chí chấp nhận có thể kiểm tra.
- Lưu bản nháp vào Git theo quy trình của repo. Nếu chưa được người phụ trách chấp nhận, ghi rõ trạng thái bản nháp.

**Kết quả cần có:** một đầu vào rõ hơn cho Design/Build, cùng danh sách câu hỏi hoặc cách kiểm tra. Không cần triển khai tính năng hay thiết lập workflow tự động trong bài tập này.

## 12. Cần tìm hiểu thêm

Các chủ đề sau vượt phạm vi Introduction:

- **Capture as intent.md** và **Requirements and design:** cách biến nguồn nhu cầu thành tài liệu có thể hành động.
- **Claude Code plan mode**, **The CLAUDE.md**, **Skills as institutional knowledge:** cách tổ chức kế hoạch và hướng dẫn dự án.
- **Parallel sessions and subagents:** cách chia công việc; bài mở đầu chưa giải thích cơ chế nên tài liệu này không suy đoán.
- **Give Claude a feedback loop** và **Continuous evals in CI:** thiết kế phản hồi và đánh giá có bằng chứng.
- **AI in the PR review loop**, **Hooks as approval gates**, **CI/CD integration and deployment:** cơ chế review, kiểm soát và tích hợp thực tế.
- **Closing the loop on metrics:** cách dùng dữ liệu vận hành làm đầu vào cải tiến.

Token, context window, MCP và prompt caching chưa phải trọng tâm của bài này. Bạn có thể học sau khi cần hiểu giới hạn thông tin của mô hình hoặc tích hợp công cụ. Không cần học mọi thuật ngữ AI trước khi áp dụng bài tập trên.

## 13. Đáp án tự kiểm tra

1. **Kiểm tra hàng chờ review trước.** Trong tình huống này, thời gian chờ review đang chi phối tiến độ hơn thời gian viết code. Cần tìm nguyên nhân cụ thể, không mặc định tăng tốc code sẽ giải quyết được.
2. **Không.** Commit ghi nhận phiên bản; yêu cầu đúng và được chấp nhận cần nguồn đáng tin, review và bằng chứng phê duyệt phù hợp.
3. **Skill là hướng dẫn; database constraint là kiểm tra được hệ thống thực thi.** Agent có thể hiểu hoặc làm theo hướng dẫn không đầy đủ, nên cần kiểm tra đầu ra.
4. **Không.** Agent có thể bỏ sót lỗi. Thay đổi phân quyền cần các kiểm tra phù hợp và người chịu trách nhiệm review theo mức rủi ro.
5. **Dữ liệu vận hành phát hiện vấn đề hoặc mục tiêu chưa đạt.** Sau chẩn đoán và xác nhận, vấn đề trở thành intent mới, mở một vòng Plan–Design–Build–Test–Deploy–Maintain tiếp theo.
