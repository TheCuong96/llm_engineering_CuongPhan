# Introduction to AI Fluency for Educators

Bài giảng tiếng Việt dành cho lập trình viên fullstack mới tiếp cận AI.

Bạn chưa chỉ định stack và mục tiêu cụ thể, nên ví dụ dùng ứng dụng web, REST API, SQL, Git và hướng dẫn junior. Các ví dụ kỹ thuật và mẫu tài liệu là phần chuyển thể, không phải ví dụ nguyên văn của khóa học.

Nguồn: [Introduction to AI Fluency for Educators — Claude Academy](https://academy.claude.com/courses/ai-fluency-for-educators/introduction-to-ai-fluency-for-educators). Định nghĩa ngắn về 4D được đối chiếu với [AI Fluency Framework review](https://academy.claude.com/courses/ai-fluency-for-educators/ai-fluency-framework-review).

## Phần 1 — Hiểu cách cộng tác với AI

### 1. Bài này giải quyết vấn đề gì và vì sao bạn nên quan tâm?

**Làm sao đưa AI vào giảng dạy để người học học tốt hơn, đồng thời sử dụng nó hiệu quả, có trách nhiệm và an toàn?**

Với lập trình viên, tình huống gần nhất là hướng dẫn junior, viết tài liệu onboarding hoặc tổ chức buổi chia sẻ kỹ thuật. Thử hình dung bạn cần dạy phân quyền API: AI có thể đề xuất bài tập, nhưng bạn vẫn phải quyết định mục tiêu, kiểm tra kiến thức và quan sát mức hiểu của người học.

Ví dụ, junior viết được middleware kiểm tra đăng nhập chưa chứng minh họ biết kiểm tra quyền truy cập từng tài nguyên. Một bài tập tốt cần làm lộ ra khoảng trống đó.

**Hiểu nhầm phổ biến:** Tạo tài liệu nhanh hơn đồng nghĩa với dạy tốt hơn. Tốc độ sản xuất và kết quả học tập là hai tiêu chí khác nhau.

### 2. AI Fluency là gì?

**AI Fluency — năng lực cộng tác thành thạo với AI** là biết khi nào nên dùng AI, giao việc thế nào, đánh giá kết quả ra sao và chịu trách nhiệm về cách sử dụng.

- **Ví von:** Giống năng lực dùng database trong sản phẩm thật. Biết viết `SELECT` chưa đủ; bạn còn cần hiểu dữ liệu, tính đúng đắn và quyền truy cập.
- **Ví dụ fullstack:** Khi nhờ AI tạo bài tập SQL transaction, bạn chọn mục tiêu học, mô tả trình độ junior rồi kiểm tra bài có thể hiện đúng tính toàn vẹn của thao tác hay không.
- **Giới hạn:** Database thực hiện truy vấn theo quy tắc xác định. Câu trả lời của AI có thể nghe hợp lý nhưng vẫn sai, nên cần kiểm tra bằng chuyên môn và bằng chứng.

**Hiểu nhầm phổ biến:** AI Fluency là nhớ nhiều câu lệnh hay. Năng lực cốt lõi là xác định mục tiêu, cộng tác và đánh giá.

### 3. AI như một thinking partner

**Thinking partner — đối tác hỗ trợ tư duy** là cách dùng AI để đặt câu hỏi, đưa ra phương án và giúp bạn xem lại giả định của mình. Đây là vai trò trong cách cộng tác, không khẳng định AI có ý thức hay hiểu con người như đồng nghiệp.

- **Ví von:** Một buổi design review, nơi người khác hỏi về các trường hợp bạn chưa xét.
- **Ví dụ fullstack:** Bạn định dạy phân quyền bằng middleware. Hãy yêu cầu AI chất vấn cách dạy: junior có thể viết đúng middleware nhưng vẫn chưa hiểu điều gì? Một tình huống để bạn xem xét là người dùng đổi ID trên URL để truy cập tài nguyên của người khác.
- **Giới hạn:** Đồng nghiệp có thể biết hệ thống và quan sát người học trực tiếp. AI chỉ được cung cấp một phần tình huống; đề xuất cần đối chiếu thực tế.

**Lỗi thường gặp:** Chỉ nhờ AI xác nhận phương án mình thích. Hãy yêu cầu nó chỉ ra giả định, phương án khác và điều cần xác minh.

### 4. Khung 4D

**AI Fluency Framework — khung năng lực cộng tác với AI** gồm Delegation, Description, Discernment và Diligence. Bài Introduction giới thiệu khung; bài tiếp theo đi vào chi tiết.

#### Delegation — phân chia việc giữa người và AI

Xác định nhiệm vụ, khả năng của công cụ và phần việc phù hợp để giao cho AI.

- **Ví von:** Chia trách nhiệm giữa các service sau khi hiểu bài toán.
- **Ví dụ:** Giao AI đề xuất bài tập onboarding; bạn giữ việc xác định mục tiêu, kiểm tra đáp án và đánh giá junior.
- **Giới hạn:** AI không có hợp đồng hành vi chặt chẽ như service được kiểm thử. Giao việc không bảo đảm kết quả đúng.
- **Lỗi thường gặp:** Giao toàn bộ nhiệm vụ khi chưa xác định tiêu chí thành công.

#### Description — mô tả rõ điều bạn cần

Truyền đạt kết quả mong muốn, cách cộng tác và yêu cầu đối với phản hồi của AI.

- **Ví von:** Viết API contract hoặc acceptance criteria để giảm cách hiểu khác nhau.
- **Ví dụ:** Yêu cầu bài tập REST API trong 20 phút, cho junior biết Express nhưng chưa học phân quyền, kèm đề bài, gợi ý và tiêu chí đánh giá.
- **Giới hạn:** Ngôn ngữ tự nhiên không được kiểm tra chặt như schema. AI vẫn có thể bỏ sót hoặc hiểu sai.
- **Lỗi thường gặp:** Chỉ nói “viết bài thật hay”, không nêu đối tượng và mục tiêu.

#### Discernment — đánh giá có suy xét

Kiểm tra chất lượng đầu ra, cách AI thực hiện nhiệm vụ và cách nó giao tiếp; xác định điều cần sửa.

- **Ví von:** Code review kết hợp kiểm thử, xem cả kết quả và lựa chọn dẫn đến kết quả.
- **Ví dụ:** Kiểm tra bài về phân quyền có yêu cầu xác minh quyền trên tài nguyên hay chỉ xác minh đăng nhập.
- **Giới hạn:** Không có bộ test tự động nào chứng minh đầy đủ người học đã hiểu. Bạn cần nghe họ giải thích và xem họ xử lý tình huống mới.
- **Lỗi thường gặp:** Đánh giá bằng độ trôi chảy của văn bản thay vì tính đúng đắn và phù hợp.

#### Diligence — sử dụng có trách nhiệm

Quan tâm tới trách nhiệm, sự minh bạch và tác động của việc dùng AI xuyên suốt quá trình cộng tác.

- **Ví von:** Trách nhiệm khi đưa phần mềm vào sử dụng: chạy được chưa phải tiêu chí duy nhất.
- **Ví dụ:** Dùng dữ liệu giả trong bài tập, làm rõ quy định sử dụng AI và kiểm tra tài liệu trước khi đưa cho junior.
- **Giới hạn:** Trách nhiệm giáo dục còn bao gồm công bằng và cơ hội học; checklist kỹ thuật không bao quát hết.
- **Lỗi thường gặp:** Nghĩ rằng “AI viết” nên người sử dụng không chịu trách nhiệm về nội dung.

### 5. Phối hợp bốn năng lực

| Năng lực | Khi dạy junior về phân quyền |
|---|---|
| Delegation | Giao AI đề xuất tình huống; bạn quyết định mục tiêu học. |
| Description | Nêu trình độ, thời lượng và sản phẩm cần có. |
| Discernment | Kiểm tra tính đúng đắn, độ khó và khả năng đo mức hiểu. |
| Diligence | Dùng dữ liệu phù hợp, làm rõ quy định và chịu trách nhiệm. |

Nếu bài quá khó, bạn đánh giá vấn đề rồi sửa mô tả để AI điều chỉnh. **Description và Discernment tạo thành vòng phản hồi.**

**Hiểu nhầm phổ biến:** 4D là bốn bước làm một lần theo thứ tự. Thực tế, bạn có thể quay lại phân chia việc hoặc bổ sung yêu cầu sau khi xem kết quả.

## Phần 2 — Xây dựng bối cảnh để cộng tác tốt hơn

### 6. Context-building là gì?

**Context-building — xây dựng bối cảnh** là cung cấp thông tin cần thiết về tình huống, mục tiêu, giá trị và giới hạn để AI có cơ sở đưa ra đề xuất phù hợp.

- **Ví von:** Giống đưa cho người mới README cùng yêu cầu nghiệp vụ trước khi họ sửa một tính năng.
- **Ví dụ fullstack:** “Người học đã biết HTTP và CRUD; chưa hiểu quyền sở hữu tài nguyên; chỉ có 20 phút; bài phải chạy được trên máy cá nhân; mục tiêu là giải thích được vì sao đăng nhập chưa đủ.”
- **Giới hạn:** README có thể được đọc lại từ repository. Đưa bối cảnh vào một cuộc trò chuyện không tự bảo đảm mọi cuộc trò chuyện sau đều có nó. Khi tái sử dụng, bạn cần cung cấp lại tài liệu theo cách công cụ hỗ trợ và kiểm tra thông tin còn đúng.

So sánh hai yêu cầu:

| Thiếu bối cảnh | Có bối cảnh |
|---|---|
| “Viết bài tập phân quyền.” | “Viết bài 20 phút cho junior biết CRUD. Cho họ tìm lỗi truy cập tài nguyên của người khác. Chưa đưa đáp án ngay; dùng câu hỏi gợi mở trước.” |

**Lỗi thường gặp:** Cung cấp nhiều thông tin nhưng thiếu mục tiêu. Danh sách công nghệ dài không nói được người học cần hiểu điều gì.

### 7. Giữ giá trị giảng dạy ở trung tâm

**Pedagogical values — giá trị sư phạm** là những điều bạn coi trọng khi giúp người khác học, như hiểu nguyên nhân, tự thử nghiệm và có cơ hội nhận phản hồi.

- **Ví von:** Giống các nguyên tắc kiến trúc giúp bạn chọn giữa nhiều phương án kỹ thuật đều có thể chạy.
- **Ví dụ fullstack:** Nếu bạn coi trọng khả năng tự debug, hãy yêu cầu AI thiết kế bài có lỗi để junior điều tra, thay vì cung cấp sẵn toàn bộ lời giải.
- **Giới hạn:** Nguyên tắc kiến trúc thường đánh giá hệ thống. Giá trị sư phạm cần xét cả con người, trình độ và hoàn cảnh học.

**Constraints — các ràng buộc** là những giới hạn thực tế mà thiết kế phải đáp ứng: thời gian, thiết bị, chính sách tổ chức hoặc kiến thức đầu vào.

- **Ví von:** Giống yêu cầu phi chức năng và giới hạn môi trường triển khai.
- **Ví dụ fullstack:** Bài chỉ kéo dài 20 phút, không cần dịch vụ trả phí và không dùng dữ liệu khách hàng thật.
- **Giới hạn:** Ràng buộc học tập có thể thay đổi theo từng nhóm người; đừng mặc định mọi junior đều giống nhau.

**Academic integrity — tính liêm chính học thuật** liên quan tới việc học và đánh giá trung thực, chẳng hạn làm rõ hỗ trợ nào được phép và công sức nào thuộc về người học.

- **Ví von:** Giống làm rõ nguồn đóng góp trong code review để reviewer biết phần nào cần kiểm tra.
- **Ví dụ fullstack:** Trong bài onboarding, cho phép dùng AI để xin gợi ý, nhưng yêu cầu junior tự giải thích bản sửa và chứng minh bằng test.
- **Giới hạn:** Quy tắc giáo dục phụ thuộc tổ chức và mục tiêu đánh giá; quy trình code review không thay thế được các quy tắc đó.

**Hiểu nhầm phổ biến:** Có một chính sách AI phù hợp cho mọi bài tập. Hãy xác định mục tiêu của từng bài trước khi quyết định mức hỗ trợ được phép.

### 8. Reusable context document là gì?

**Reusable context document — tài liệu bối cảnh tái sử dụng** là bản tóm tắt có cấu trúc về cách bạn giảng dạy và tình huống của người học, để cung cấp cho AI trong những lần cộng tác sau.

- **Ví von:** README dành cho cách cộng tác và mục tiêu học tập của bạn.
- **Ví dụ fullstack:** Một file `teaching-context.md` mô tả nhóm junior, kiến thức đầu vào, cách bạn phản hồi và tiêu chí đánh giá bài onboarding.
- **Giới hạn:** File không tự khiến AI tuân thủ hoàn hảo hoặc tự ghi nhớ lâu dài. Nó là đầu vào để tham chiếu; bạn vẫn phải kiểm tra phản hồi.

Quy trình của bài học có thể hiểu như sau:

1. **Tự suy ngẫm:** Xác định giá trị, giới hạn, đặc điểm người học và phương pháp bạn coi trọng.
2. **Trao đổi:** Nhờ AI phỏng vấn hoặc chia sẻ trước rồi hỏi còn thiếu gì. Bạn có thể suy nghĩ thành lời và chỉnh lại quan điểm.
3. **Tổng hợp:** Nhờ AI viết bản có cấu trúc, dễ sao chép.
4. **Kiểm tra:** Sửa điều thiếu, sai hoặc chỉ là suy đoán trước khi dùng lại.

Các nhóm thông tin cần bao quát gồm môn/chủ đề và trình độ, khó khăn người học, bối cảnh tổ chức, phương pháp, điểm vướng của người hướng dẫn, mục tiêu dùng AI và đặc điểm riêng của tình huống. Khi đưa ví dụ, cân nhắc quyền riêng tư và dữ liệu nhạy cảm.

**Lỗi thường gặp:** Chấp nhận bản tổng hợp có những “sự thật” bạn chưa hề nói. Yêu cầu đánh dấu chỗ chưa biết thay vì tự điền.

#### Mẫu tài liệu cho dự án của bạn

Đây là mẫu chuyển thể để bạn điền; không phải tên file bắt buộc hoặc tính năng riêng của Claude.

```markdown
# Bối cảnh hướng dẫn junior

## Chủ đề và mục tiêu
- Dự án/chủ đề: [điền thông tin phù hợp để chia sẻ]
- Sau buổi học, người học phải làm được: [...]

## Người học
- Đã biết: [...]
- Chưa biết / thường hiểu sai: [...]
- Khó khăn và mục tiêu: [...]

## Giá trị và phương pháp
- Ưu tiên: hiểu nguyên nhân, tự debug, giải thích lựa chọn.
- Cách hỗ trợ: hỏi gợi mở trước, đưa lời giải sau.

## Ràng buộc
- Thời gian, công cụ, chính sách, dữ liệu được phép dùng: [...]

## Điểm vướng và vai trò của AI
- Điều tôi đang khó làm: [...]
- AI hỗ trợ: đề xuất bài tập, chất vấn giả định, soạn bản nháp.
- Tôi quyết định: mục tiêu, tính đúng đắn, đánh giá người học.

## Tiêu chí đánh giá
- Bằng chứng người học đã hiểu: [...]
- Quy định sử dụng AI trong bài tập: [...]

## Điều chưa rõ
- Những thông tin cần hỏi lại: [...]
```

### 9. Bài thực hành 25 phút trong dự án của bạn

**Sản phẩm cuối:** Một tài liệu bối cảnh đã kiểm tra và một đề bài onboarding ngắn. Chọn chủ đề bạn hiểu đủ để kiểm tra, ví dụ validation API, transaction hoặc phân quyền.

#### Bước 1 — Tự ghi ý chính: 5 phút

Trả lời bốn câu:

1. Tôi muốn junior thực sự hiểu điều gì?
2. Junior đã biết gì và thường mắc lỗi gì?
3. Có giới hạn thời gian, công cụ và dữ liệu nào?
4. Tôi muốn hướng dẫn theo cách nào, và vì sao?

#### Bước 2 — Để AI hỏi thêm: 8 phút

Dùng yêu cầu sau, rồi trả lời các câu hỏi thực sự cần thiết:

```text
Tôi là lập trình viên fullstack đang hướng dẫn junior trong dự án.
Tôi muốn xây dựng tài liệu bối cảnh tái sử dụng cho các buổi onboarding.

Bối cảnh ban đầu:
[Dán bốn câu trả lời của tôi]

Hãy hỏi từng lượt 1–2 câu để làm rõ người học, mục tiêu,
phương pháp, ràng buộc, điểm vướng và vai trò phù hợp của AI.
Hãy giúp tôi xem lại các giả định. Đừng tự điền thông tin chưa biết.
```

#### Bước 3 — Tổng hợp và kiểm tra: 7 phút

Yêu cầu AI tổng hợp theo mẫu ở trên. Đọc lại và sửa:

- Mục tiêu có quan sát hoặc kiểm chứng được không?
- AI có thêm thông tin bạn chưa xác nhận không?
- Phương pháp có đúng với cách bạn muốn hướng dẫn không?
- Có dữ liệu cần loại bỏ hoặc thay bằng dữ liệu giả không?

Lưu bản đã sửa thành file Markdown ở vị trí phù hợp trong dự án.

#### Bước 4 — Thử dùng lại: 5 phút

Mở cuộc trò chuyện mới, cung cấp bản bối cảnh và yêu cầu:

```text
Dựa trên tài liệu bối cảnh này, hãy đề xuất một bài tập onboarding
15 phút cho chủ đề đã chọn, gồm đề bài, gợi ý và tiêu chí đánh giá.
Chỉ ra giả định còn thiếu và giải thích bài đo mục tiêu học như thế nào.
```

Đối chiếu đề bài với mục tiêu và ràng buộc. Nếu chưa phù hợp, chỉ rõ lỗi và yêu cầu sửa: đó là luyện Description cùng Discernment.

**Tiêu chí hoàn thành:** Tài liệu phản ánh đúng bạn; không chứa thông tin tự bịa; bài tập đo được mục tiêu học; bạn giải thích được phần việc của người và AI.

**Lưu ý về thời lượng nguồn:** Trang bài học ghi tổng 30 phút nhưng chia hai phần thành 10 và 25 phút, cộng lại là 35 phút. Đây là sự không nhất quán trên trang; bài 25 phút ở đây là phiên bản rút gọn cho yêu cầu của bạn.

### 10. Tự phản tư sau thực hành

- Phần nào trong cách hướng dẫn của bạn khó diễn đạt nhất?
- Điều gì trở nên rõ hơn sau cuộc trao đổi?

Ví dụ, bạn có thể nhận ra “junior chưa hiểu backend” là mô tả quá rộng. “Junior chưa phân biệt đăng nhập với quyền truy cập từng bản ghi” cụ thể hơn và giúp thiết kế bài tốt hơn.

**Lỗi thường gặp:** Chỉ đánh giá xem AI có tạo đủ tài liệu không. Hãy xem quá trình có giúp bạn hiểu rõ mục tiêu và cách hướng dẫn của mình không.

## Tóm tắt 5 ý chính

1. AI Fluency là năng lực cộng tác, đánh giá và chịu trách nhiệm, không chỉ là viết yêu cầu hay.
2. AI có thể hỗ trợ tư duy bằng cách đặt câu hỏi và đề xuất phương án; chuyên môn và phán đoán của người hướng dẫn vẫn cần thiết.
3. 4D gồm Delegation, Description, Discernment và Diligence; bạn dùng chúng phối hợp và lặp lại.
4. Bối cảnh phải nêu rõ người học, mục tiêu, giá trị và ràng buộc để đề xuất có cơ sở phù hợp.
5. Tài liệu bối cảnh cần được trao đổi, kiểm tra và cập nhật trước khi tái sử dụng.

## Câu hỏi tự kiểm tra

1. AI tạo một bài onboarding rất trôi chảy nhưng chỉ kiểm tra đăng nhập, bỏ qua quyền sở hữu tài nguyên. Bạn cần vận dụng năng lực nào để phát hiện vấn đề?
2. Vì sao “viết bài tập REST API thật hay” là một mô tả chưa đủ?
3. Tài liệu bối cảnh có bảo đảm AI tự nhớ trong mọi cuộc trò chuyện sau không? Bạn cần làm gì khi dùng lại?
4. Bạn giao AI soạn toàn bộ lời giải cho bài học nhằm luyện junior tự debug. Có điểm nào cần xem lại trong cách phân chia việc?
5. Nêu một khác biệt giữa tài liệu onboarding được viết đẹp và bằng chứng junior đã hiểu.

## Cần tìm hiểu thêm

- **Khung 4D chi tiết:** Bài tiếp theo, [AI Fluency Framework review](https://academy.claude.com/courses/ai-fluency-for-educators/ai-fluency-framework-review), giải thích sâu hơn. Vì bạn mới tiếp cận AI, nên học phần này.
- **Nền tảng trước khóa học:** Video khuyến nghị khóa AI Fluency: Framework & Foundations. Video cũng nhắc tới các khóa đồng hành dành cho người học và người dạy khung AI Fluency.
- **Phạm vi các bài sau:** Thiết kế khóa học, mục tiêu học tập, tài liệu, bài tập và đánh giá. Bài Introduction giới thiệu hướng đi, chưa hướng dẫn chi tiết toàn bộ các việc đó.
- **Kỹ thuật AI/LLM:** Token, context window, agent, subagent, tool use, MCP, skill và prompt caching không được giải thích trong bài này. Chúng nên được học riêng khi bạn chuyển sang Claude Code hoặc tích hợp API; không cần nhồi vào bài nhập môn về cách cộng tác.

Khóa học không hứa giúp bạn thành chuyên gia ngay. Trọng tâm là luyện cách đặt câu hỏi tốt hơn và giữ giá trị giảng dạy trong các quyết định sử dụng AI.

## Đáp án tự kiểm tra

1. **Discernment:** Đối chiếu đầu ra với tính đúng đắn và mục tiêu học. Sau đó dùng Description để yêu cầu sửa phần còn thiếu.
2. Thiếu đối tượng, kiến thức đầu vào, mục tiêu quan sát được, thời lượng, ràng buộc và sản phẩm mong muốn.
3. Không. Cần cung cấp lại bằng cách công cụ hỗ trợ, kiểm tra tài liệu còn đúng và đánh giá phản hồi dựa trên bối cảnh đó.
4. Xem lại **Delegation**: lời giải hoàn chỉnh có thể làm mất cơ hội luyện debug. Có thể giao AI tạo tình huống lỗi và gợi ý theo mức, còn người hướng dẫn quyết định lúc cung cấp đáp án.
5. Văn bản đẹp là đặc điểm của tài liệu. Bằng chứng hiểu có thể là junior tự giải thích lỗi, sửa đúng và áp dụng được nguyên tắc vào tình huống khác.
