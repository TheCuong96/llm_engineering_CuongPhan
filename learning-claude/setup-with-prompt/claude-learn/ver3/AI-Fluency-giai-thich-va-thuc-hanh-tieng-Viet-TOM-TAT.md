# TÓM TẮT — AI Fluency: Framework and foundations

> Bản tóm tắt dễ hiểu của [AI-Fluency-giai-thich-va-thuc-hanh-tieng-Viet.md](AI-Fluency-giai-thich-va-thuc-hanh-tieng-Viet.md). Giữ đủ 14 bài, mọi ý chính và các bước thực hành; prompt mẫu đầy đủ xem ở file gốc.
> Nguồn gốc: khóa học của Rick Dakan, Joseph Feller và Anthropic — giấy phép CC BY-NC-SA 4.0.

## Bức tranh 1 phút

**AI Fluency** = biết cộng tác với AI sao cho **đạt mục tiêu, tốn công hợp lý, có đạo đức, an toàn**. Không chỉ là "biết gõ câu hỏi".

Toàn khóa xoay quanh **khung 4D** — 4 năng lực, mỗi năng lực có 3 thành phần:

| D | Câu hỏi tự nhắc | 3 thành phần |
|---|---|---|
| **Delegation** (phân công) | Việc nào người làm, việc nào AI làm? | Problem Awareness · Platform Awareness · Task Delegation |
| **Description** (mô tả) | Tôi đã nói rõ cần gì chưa? | Product · Process · Performance |
| **Discernment** (đánh giá) | Kết quả có thật sự tốt không? | Product · Process · Performance |
| **Diligence** (trách nhiệm) | Dữ liệu, công khai, kiểm chứng ổn chưa? | Creation · Transparency · Deployment |

4D **không phải vòng chạy một lần**: đang đánh giá mà phát hiện giao sai việc → quay lại phân công/mô tả. Diligence có mặt từ đầu đến cuối.

**Dự án mẫu xuyên suốt:** chuẩn bị buổi chia sẻ 30 phút cho 8 đồng nghiệp mới dùng AI về cách viết email. Sản phẩm: dàn ý, email mẫu, bài tập, bảng kiểm. Chỉ dùng dữ liệu giả. Hãy giữ một dự án của riêng bạn cho bài 7, 11, 12.

## Chuẩn bị trên Academy

1. Mở trang khóa học → chọn bài (nút **Show course lessons** nếu cần).
2. Đọc **In this lesson** → xem video hoặc **Summary / Transcript**.
3. Đọc **Key takeaways**, **Exercises** (bấm từng thẻ Exercise 1/2/3 — nội dung khác nhau).
4. Mở AI ở tab khác, làm bài, lưu prompt + điều học được → trả lời **Reflection** → **Next lesson**.

Khi gửi prompt thực hành: chat mới khi đổi chủ đề · thay phần `[ ]` · dùng dữ liệu giả nếu có thông tin riêng · đọc hết câu trả lời rồi mới phản hồi · phản hồi vào điểm cụ thể · lưu bản chọn.

Khóa học tự công bố đã dùng Claude để soạn — chính là một ví dụ về Diligence (nói rõ AI làm gì, người chịu trách nhiệm gì).

---

## Bài 1 — Bắt đầu với AI Fluency

**Ý chính:** Như có một cộng sự viết rất nhanh — nếu không nói rõ người đọc, họ viết trơn tru nhưng vô dụng; nếu không đọc lại, lỗi đi thẳng tới người nhận. Chất lượng phụ thuộc vào cách *bạn* tổ chức công việc.

**Các bước:**
1. Đọc mục tiêu, xem video/bản chép lời.
2. Mở chat mới, chọn một việc nhỏ hay làm (email, checklist…).
3. Gõ yêu cầu tự nhiên, chưa cần hoàn hảo.
4. Ghi 1 điểm hữu ích + 1 điểm chưa đúng nhu cầu.
5. Viết 3 dòng: từng khó gì với AI, muốn thử gì, muốn tiến bộ ở đâu.
6. **Lưu prompt đầu tiên** — sẽ sửa lại sau bài 9.

✅ Tự kiểm: đã có một mục tiêu thực tế và thấy ít nhất một chỗ cần phán đoán của mình.

## Bài 2 — Vì sao cần AI Fluency?

**Ý chính:** Công cụ mạnh ≠ dùng giỏi. AI có thể hiểu sai, trả lời ngoài dự kiến, hoặc *nghe* đáng tin hơn mức nó biết. Có **3 cách tương tác**:

| Cách | Bạn làm | AI làm | Ví dụ |
|---|---|---|---|
| **Automation** | Giao việc có đầu ra rõ | Thực hiện | Đổi dàn ý đã duyệt thành bảng thời lượng |
| **Augmentation** | Trao đổi, phản biện, chọn hướng | Gợi ý, hỏi lại | Cùng tìm hoạt động thực hành |
| **Agency** | Cấu hình mục tiêu, kiến thức, giới hạn | Tự xử lý tình huống trong phạm vi | Trợ lý phân loại câu hỏi sau buổi học |

Agency cần hệ thống/công cụ thật — một prompt không tự cấp quyền đọc email hay chạy nền.

**Các bước:** (1) viết một công việc cụ thể → (2) chọn phần có đầu ra rõ → Automation → (3) phần còn nhiều lựa chọn → Augmentation → (4) nghĩ việc lặp lại có thể giao Agency → (5) ghi phạm vi, dữ liệu được đọc, khi nào chuyển lại cho người, hành động cần duyệt → (6) chọn cách hợp nhất, không cần dùng cả ba.

⚠️ Lỗi: nghĩ tự chủ càng cao càng tốt. Chọn theo tính chất việc, khả năng kiểm tra và hậu quả khi sai.

## Bài 3 — Khung 4D

**Ý chính:** Xem bảng 4D ở trên. Áp vào dự án mẫu: AI gợi ý hoạt động, tôi chọn (Delegation) · nêu thời lượng, đối tượng, giọng văn (Description) · kiểm tổng thời gian (Discernment) · dùng email giả, ghi vai trò AI (Diligence).

**Bài tập 1 — Áp 4D vào một tình huống:** ghi tên sản phẩm cuối → tạo 4 dòng 4D → Delegation: người giữ gì, AI hỗ trợ gì → Description: đối tượng, mục tiêu, đầu ra, cách phối hợp → Discernment: điều kiện chấp nhận → Diligence: dữ liệu dùng, ai cần biết vai trò AI, ai duyệt.

**Bài tập 2 — Chủ đề bạn rành** (vd pha cà phê phin): chat tự nhiên 5–10 phút; đánh dấu lúc AI mở rộng suy nghĩ, lúc phải giải thích lại, lúc chuyên môn của bạn bắt được lỗi. Lưu đoạn tiêu biểu cho bài 10.

**Bài tập 3 — Chủ đề mới** (vd biểu đồ hộp): xin giải thích bằng ví dụ đơn giản, hỏi tiếp, ghi những gì cần xác minh, so sánh: ở chủ đề mới bạn khó bắt lỗi hơn ở đâu?

💡 Rút ra: "nghe hợp lý" không thay được hiểu biết. Lĩnh vực lạ → thêm nguồn đáng tin hoặc nhờ người am hiểu.

## Bài 4 — Nền tảng AI tạo sinh

**Ý chính:**
- AI tạo sinh *tạo nội dung mới* (khác AI phân loại chỉ gắn nhãn). **LLM** học mẫu trong dữ liệu để dự đoán ngôn ngữ → câu trả lời là *được tạo ra*, không phải *tra cứu và xác minh*.
- 3 động lực phát triển: thuật toán/kiến trúc (Transformer), dữ liệu số lớn, sức tính toán. Tham số là các số điều chỉnh xử lý — không phải "kho sự thật".

| Khái niệm | Hiểu đơn giản | Hệ quả |
|---|---|---|
| Pre-training | Học mẫu trên dữ liệu khổng lồ | Nền năng lực ngôn ngữ |
| Fine-tuning | Chỉnh để làm theo yêu cầu | Thành "trợ lý" |
| Prompt | Thông tin + yêu cầu bạn đưa | Phải cung cấp đúng bối cảnh |
| Context window | Lượng thông tin xử lý một lần | Quá dài → mất thông tin |
| In-context learning | Học theo ví dụ trong cuộc chat | Dạy định dạng ngay trong chat — **không** cập nhật vĩnh viễn mô hình |

**Thực hành:** chat mới → đưa 2 ví dụ cùng quy luật (vd `Việc | Người phụ trách | Hạn`) → đưa đầu vào thứ 3 → kiểm AI giữ đúng nội dung hay chỉ bắt chước hình thức → mở chat khác không có ví dụ, so sánh → ghi điều phải nhắc lại khi bắt đầu chat mới.

## Bài 5 — Khả năng và giới hạn

**Ý chính:** LLM viết, tóm tắt, giải thích, dùng công cụ được — nhưng **không bảo đảm đúng**.

| Giới hạn | Ví dụ | Cách xử lý |
|---|---|---|
| Mốc kiến thức | Sai về thay đổi gần đây | Đưa nguồn mới / dùng tìm kiếm |
| Hallucination | Bịa tài liệu, số liệu | Mở nguồn gốc kiểm tra |
| Ngữ cảnh hữu hạn | Quên điều kiện đầu chat | Tóm tắt lại yêu cầu, chia nhỏ |
| Kết quả biến thiên | Hỏi 2 lần ra 2 kiểu | Tiêu chí cố định, ví dụ mẫu |
| Sai tính toán | Cộng sai thời lượng | Tự tính lại / dùng công cụ |
| Thiếu quyền truy cập | Không đọc được lịch, tệp nội bộ | Xác định nó thực sự đọc được gì |

Temperature ảnh hưởng độ biến thiên nhưng không biến câu trả lời thành sự thật.

**Ví dụ:** AI đề xuất lịch 5+10+8+10+5 = **38 phút** cho buổi 30 phút — nghe hợp lý nhưng sai.

**Các bước:** đưa lịch giả vượt giờ → yêu cầu cộng và sửa → tự cộng đối chiếu → yêu cầu chỉ ra thông tin thiếu thay vì đoán → hỏi dữ liệu AI không có (số người dự) → xem nó thừa nhận hay bịa → ghi giới hạn quan sát được và cách giảm rủi ro.

✅ Phân biệt được: điều AI *tạo ra* / điều *có bằng chứng* / điều *chưa đủ thông tin*.

## Bài 6 — Delegation: Chia việc có chủ đích

**Ý chính:** Phân công bắt đầu từ **hiểu vấn đề** — chưa biết "tốt" trông thế nào thì không giao và không chấm được.
1. **Problem Awareness:** mục tiêu, dấu hiệu thành công, loại việc cần làm.
2. **Platform Awareness:** hệ thống có năng lực, giới hạn, dữ liệu, công cụ gì.
3. **Task Delegation:** phần nào người / AI / cùng làm / giao trợ lý thay mặt.

Tách 4 loại nhu cầu: việc lặp lại tốn thời gian · chỗ cần khám phá ý tưởng · chỗ thiếu thông tin · chỗ cần phán đoán.

**Ví dụ phân công:** hiểu người nghe → người hỏi nhóm · đề xuất 3 cấu trúc → AI · chọn cấu trúc → cùng so sánh, người chốt · email giả → AI nháp · quy định dùng AI của nhóm → người kiểm nguồn nội bộ · điều phối buổi học → người.

**Các bước:**
1. Chọn việc nhỏ (chuẩn bị họp, viết email).
2. Chat mới, nêu việc định làm.
3. Nhờ AI *cùng thảo luận* kế hoạch phân công, không chấp nhận danh sách ngay.
4. Trả lời: kết quả tốt là gì, gồm phần nào, phần nào cần kinh nghiệm của bạn.
5. Với mỗi việc giao AI hỏi: "Bạn cần dữ liệu/công cụ gì?"
6. Tự xem giao diện và quyền truy cập thực tế (lời AI tự mô tả chỉ để tham khảo).
7. Thử một tác vụ nhỏ đại diện xem có kiểm tra được không.
8. Chốt bảng: người làm · AI làm · đầu ra · cách duyệt.

**Khi nào đổi phân công:** kiểm chứng lâu hơn tự làm → thu hẹp phần AI; thiếu dữ liệu tin cậy → thu thập trước; thiếu công cụ → đổi công cụ/cách làm.

⚠️ Lỗi: giao "làm toàn bộ" khi chưa có tiêu chí · nghĩ model nào cũng như nhau · mặc định AI biết bối cảnh tổ chức · quên chi phí kiểm tra.

## Bài 7 — Lập kế hoạch dự án (bài thực hành)

Chọn dự án nhiều bước, làm xong trong ~1 giờ, dùng tiếp cho các bài sau.

**Bước 1 — Chọn và thu nhỏ:** viết tên dự án 1 câu → ghi sản phẩm cuối → bỏ phần thừa. ("Bộ tài liệu buổi 30 phút" vừa sức; "hệ thống đào tạo AI cả công ty" quá rộng.)

**Bước 2 — Làm rõ tầm nhìn:** giới thiệu dự án cho AI → mời AI hỏi (tối đa 5 câu, từng câu một) → chốt đối tượng, điều họ cần làm được, đầu ra, ràng buộc, định nghĩa hoàn thành → nhờ AI tóm tắt lại và sửa nếu hiểu sai.

**Bước 3 — Chia việc:** cùng AI liệt kê việc theo thứ tự → mỗi việc cần kỹ năng/dữ liệu/phán đoán gì → xác định phụ thuộc (chốt người nghe trước khi chọn ví dụ) → thêm cách kiểm tra mỗi đầu ra → ước lượng thời gian *làm dự án* (khác thời lượng buổi học) → **lưu kế hoạch** để dùng ở bài 11.

**Lịch mẫu 60 phút:** 0–10 chốt mục tiêu · 10–20 chọn dàn ý · 20–30 viết email giả + bài tập · 30–45 đọc thử, sửa, cộng thời lượng · 45–55 bảng kiểm + khai báo AI · 55–60 gom và lưu bản cuối.

## Bài 8 — Description: Mô tả điều bạn cần

**Ý chính:** Mô tả có 3 mặt — giúp bạn nhận ra mình còn thiếu gì:

| Mặt | Trả lời câu hỏi | Ví dụ |
|---|---|---|
| **Product** | Cần tạo *cái gì*? | Email tiếng Việt ≤150 từ, có hạn phản hồi |
| **Process** | Làm *theo cách nào*? | Kiểm dữ kiện trước, lập dàn ý rồi mới viết |
| **Performance** | *Tương tác* với tôi thế nào? | Hỏi từng câu, chỉ ra mâu thuẫn, trả lời ngắn |

**Trước / sau:** "Làm nội dung buổi học AI cho tôi" → prompt có bối cảnh + mục tiêu, phần *Sản phẩm* (bảng, đúng 30 phút, ≥10 phút thực hành), *Cách làm* (dữ liệu giả, dàn ý trước, tự kiểm thời lượng), *Cách trao đổi* (tiếng Việt đơn giản, chỉ ra mâu thuẫn, mỗi lượt hỏi 1 câu).

**Thực hành "Bad Prompt Makeover":**
1. Đọc mục Bad Prompt Makeover ở bài 8.
2. Nhờ AI đưa một prompt mơ hồ.
3. Tự bổ sung Product/Process/Performance.
4. Gửi bản trước–sau, nhờ AI nhận xét.
5. Thông tin chưa biết → ghi là "cần hỏi", đừng để AI tự quyết.
6. Sau ~5 phút đổi vai: bạn đưa prompt kém, AI sửa.
7. So thông tin AI thêm với ý định thật, bỏ giả định sai.
8. Chạy thử prompt đã sửa với dữ liệu giả.

**Khi hội thoại lệch:** chỉ ra sai lệch + nhắc điểm đã chốt + nói cần giữ gì, đổi gì.

⚠️ Lỗi: dài mà thiếu mục tiêu · yêu cầu mâu thuẫn · chỉ nói "hay hơn" · không nêu cách tương tác.

## Bài 9 — Sáu kỹ thuật viết prompt

Chọn kỹ thuật theo vấn đề, không nhồi tất cả.

1. **Cung cấp bối cảnh** — cần gì, vì sao, ai dùng, họ biết gì. *Làm:* thêm 2 câu về người nhận + mục đích vào prompt bài 1, chạy lại.
2. **Cho ví dụ đầu ra tốt** — kể cả cách xử lý khi thiếu dữ liệu (vd ghi `[cần bổ sung địa điểm]`). *Làm:* kiểm AI giữ quy luật chứ không chép sai dữ kiện.
3. **Ràng buộc đầu ra** — định dạng, độ dài, ngôn ngữ, phần bắt buộc, điều không được thêm; phải *kiểm được*. *Làm:* thay "ngắn gọn" bằng "tối đa 150 từ".
4. **Chia bước** — kiểm dữ kiện → dàn ý → chờ xác nhận → viết hoàn chỉnh. Việc đơn giản thì không cần.
5. **Cho cân nhắc trước khi kết luận** — yêu cầu kiểm điều kiện, nêu giả định và lý do ngắn có thể đối chiếu. "Hãy nghĩ kỹ" không bảo đảm đúng.
6. **Vai trò / giọng điệu** — định hướng góc nhìn, *không* cấp chuyên môn hay quyền truy cập. *Làm:* so bản "người hướng dẫn cho người mới" với bản thuật ngữ chuyên sâu.

**Bonus — nhờ AI sửa prompt:** chỉ ra ≤3 chỗ mơ hồ, hỏi thông tin, viết lại, *đánh dấu phần đang giả định*. Bạn vẫn phải duyệt.

**Thực hành tổng hợp A/B:**
1. Lấy prompt bài 1 hoặc 8 → chạy = **bản A**.
2. Chọn 1–2 kỹ thuật phù hợp → sửa = **bản B**.
3. Chạy B với cùng dữ liệu.
4. Chấm cả hai bằng cùng bảng kiểm: đủ dữ kiện, đúng đối tượng, có hành động, không thêm thông tin, dễ dùng.
5. B tốt hơn → ghi kỹ thuật hữu ích (1 lần thử chưa phải quy luật).
6. Cả hai kém → xem lại mục tiêu/dữ liệu, có thể chia việc.
7. Chat rối → mở chat mới với bản tóm tắt đã duyệt.

Phản hồi tốt: "Bản này thiếu hạn phản hồi. Thêm hạn đã cho, giữ giờ họp, rút mở đầu còn 1 câu." Mức tự tin do AI tự báo **không** phải kiểm chứng.

## Bài 10 — Discernment: Đánh giá bằng hiểu biết

**Ý chính:** Mô tả rõ + đánh giá kỹ = hai nửa của cộng tác.

| Mặt | Xem gì | Dấu hiệu lỗi |
|---|---|---|
| **Product** | Đúng, phù hợp, mạch lạc, hữu ích | Lịch vượt 30 phút; email thiếu hành động |
| **Process** | Các bước, dữ liệu, logic quan sát được | Tự thêm ý đã bỏ; so sánh bằng tiêu chí khác nhau |
| **Performance** | Chất lượng tương tác | Hỏi dồn khi bạn yêu cầu từng câu; đồng tình dù mâu thuẫn |

Ví dụ: ghi nhầm thứ Năm thành thứ Sáu (Product) · tự thêm lý do cuộc họp dù bị cấm (Process) · cần bản ngắn mà cứ gửi nhiều trang (Performance).

**Các bước:**
1. Quay lại chủ đề bạn rành (bài 3).
2. Chat mới, xin 3 cách giải thích (A, B, C, ≤120 từ, chưa tự chọn bản tốt nhất).
3. Chấm Product từng bản.
4. Chấm Process: bước nhảy, thiếu điều kiện, nhầm quan hệ?
5. Chấm Performance: đúng câu hỏi, đúng mức chi tiết, tiếp thu phản hồi?
6. Chọn bản mạnh nhất, nêu điểm tốt.
7. Chọn bản yếu nhất, chỉ 1 vấn đề cụ thể + cách sửa.
8. Nhờ AI cải thiện; đọc lại cả phần mới lẫn phần cũ đã đúng.
9. Ghi kiến thức nào giúp bạn bắt lỗi, người mới khó ở đâu.

**Mẫu phản hồi:** bản tốt nhất vì… → bản có vấn đề ở câu… → vấn đề → ảnh hưởng → sửa theo nguồn nào, giữ gì → liệt kê thay đổi.

**Không đủ chuyên môn?** Thu hẹp kết luận, tra nguồn, dùng công cụ, nhờ người am hiểu. AI tự chấm ≠ bằng chứng độc lập.

## Bài 11 — Vòng lặp Mô tả ↔ Đánh giá (bài thực hành)

**Luồng:** Mô tả → AI làm → Đánh giá → Phản hồi cụ thể → Sửa → Kiểm lại. Nếu lỗi do phân công sai / thiếu dữ liệu / thiếu công cụ → sửa *nguyên nhân*, đừng lặp prompt mãi. (Bài gốc gọi kế hoạch là "Lesson 5" — thực ra là **bài 7**.)

**Các bước:**
1. Mở lại kế hoạch bài 7 (hoặc chat mới kèm tóm tắt kế hoạch).
2. Rà lại phân công, đổi nếu đã hiểu thêm.
3. Chọn **một đầu ra nhỏ** (vd dàn ý) — không làm hết một lúc.
4. Nêu Product/Process/Performance cho phần đó.
5. Nhận nháp, kiểm theo tiêu chí.
6. Ghi phần đạt/chưa đạt bằng ví dụ cụ thể.
7. Yêu cầu sửa đúng chỗ, nhắc giữ dữ kiện đã đúng.
8. Kiểm bản sửa có sinh lỗi mới không.
9. Chốt, lưu phiên bản, sang phần kế.
10. Ghép các phần, đọc lại toàn bộ (phần tốt riêng lẻ vẫn có thể mâu thuẫn).

**Ví dụ một vòng:** nháp 38 phút → đánh giá: vượt 8 phút, phần kiến thức nền quá dài, giữ 10 phút thực hành → phản hồi: giữ minh họa + thực hành, rút nền và mở đầu, thêm 3 phút kiểm tra bằng bảng kiểm, ghi tổng → bản sửa: 3+4+5+10+3+5 = **30 phút**. Đúng giờ vẫn chưa chắc dùng được — còn phải kiểm bài tập làm kịp, hướng dẫn dễ hiểu.

**Điều kiện dừng** (tránh sửa văn vô tận): đúng 30 phút · dữ liệu giả · người mới đọc hiểu · thời điểm nhất quán · có bảng kiểm + công khai vai trò AI.

## Bài 12 — Diligence: Dùng AI có trách nhiệm

| Mặt | Nghĩ đến | Dự án mẫu |
|---|---|---|
| **Creation** | Chọn hệ thống & cách dùng có chủ đích; dữ liệu, quyền riêng tư, chính sách | Dùng email giả, kiểm công cụ hợp bối cảnh nhóm |
| **Transparency** | Nói đúng, đủ vai trò AI cho người cần biết | Nêu AI gợi ý dàn ý, viết nháp |
| **Deployment** | Kiểm tra & chịu trách nhiệm đầu ra được dùng | Rà dữ kiện, đọc thử, duyệt bản cuối |

Discernment *nhận ra* lỗi; Deployment Diligence là *trách nhiệm thực hiện kiểm tra và quyết định có đủ cơ sở dùng hay chưa*. Chỉ thay tên chưa chắc đã ẩn danh. Chỉ nói "có dùng AI" là chưa đủ.

**Viết Diligence Statement — các bước:**
1. Đọc mục *Creating a Diligence Statement* + ví dụ công bố của khóa học.
2. Mở kế hoạch và các phiên bản đã lưu.
3. Ghi hệ thống AI đã dùng và việc AI *thật sự* hỗ trợ.
4. Ghi loại dữ liệu đã gửi.
5. Ghi ai sẽ dùng sản phẩm, họ cần biết gì về AI.
6. Liệt kê bước kiểm tra *đã làm thật*.
7. Ghi điều *chưa* kiểm tra — đừng khai quá.
8. Nhờ AI viết bản công bố từ thông tin trên.
9. Tự đọc lại, xóa tuyên bố quá mức.
10. Đặt công bố ở đầu/cuối tài liệu, ghi chú hoặc phụ lục.

**Mẫu:** "Khi chuẩn bị [sản phẩm], tôi dùng [AI] để hỗ trợ [phạm vi]. Tôi cung cấp [loại dữ liệu]. Tôi đã kiểm tra [bước] và chỉnh [phần]. [Giới hạn]. Tôi chịu trách nhiệm với bản cuối."

## Bài 13 — Tổng kết và chính sách AI cá nhân

**4 câu tự hỏi mỗi lần làm việc với AI:** phân công hợp lý chưa? · AI đủ bối cảnh và hướng dẫn chưa? · đã kiểm sản phẩm, quy trình, tương tác chưa? · đã xét dữ liệu, minh bạch, người bị ảnh hưởng chưa?

**Bài tập 1 — Kết nối với công việc:** chọn tình huống thật → giới thiệu 4D bằng lời mình (có thể dùng tài liệu framework của Ringling làm ngữ cảnh) → nhờ AI phân tích theo từng D → đưa một ví dụ đã làm, hỏi chỗ cải thiện → chọn **một hành vi cụ thể** sẽ đổi lần tới.

**Bài tập 2 — Chính sách AI cá nhân:**
1. Liệt kê bối cảnh dùng AI (học, cá nhân, công việc, sáng tạo).
2. Mỗi bối cảnh: việc phù hợp + dữ liệu được dùng.
3. Ranh giới cho thông tin riêng tư/bí mật.
4. Cách kiểm đầu ra theo tác vụ.
5. Ai cần biết đóng góp của AI, thông báo thế nào.
6. Nghĩ từ góc người bị ảnh hưởng.
7. Nhờ AI chỉ ra tình huống khó/mâu thuẫn trong quy tắc.
8. Lưu chính sách ngắn, hẹn ngày rà lại.

Ví dụ: học → đối chiếu nguồn tin cậy · viết công việc → rà mọi cam kết và dữ kiện trước khi gửi · sáng tạo → xem quyền tài nguyên, ghi công · dữ liệu nội bộ → chỉ dùng khi có quyền và hệ thống phù hợp.

## Bài 14 — Hoạt động luyện tập tiếp

Chọn theo sở thích, không cần làm hết. Mỗi hoạt động phải giúp bạn học được điều gì đó về mô tả, đánh giá hoặc phối hợp.

- **A. Kế hoạch AI Fluency cá nhân:** bảng 4 hàng 4D → tự xếp mức (mới / đang phát triển / khá tự tin) + 1 bằng chứng → xem mình dùng Automation/Augmentation/Agency ra sao → chọn 1–2 năng lực ưu tiên → hoạt động, lịch, dấu hiệu tiến bộ → nhờ AI làm cho khả thi hơn.
- **B. Thư viện prompt:** liệt kê 5–10 việc hay làm → viết mẫu có chỗ điền → thử với đầu vào điển hình + đầu vào thiếu thông tin → lưu ví dụ đạt, lỗi hay gặp, tiêu chí → ghi hệ thống + ngày thử → chỉ thành mẫu khi đã thấy hữu ích thực tế.
- **C. Đố nhau:** câu đố có đáp án đã kiểm → AI đoán + nêu căn cứ → sai thì gợi manh mối, không cho đáp án → xem AI cập nhật hay đoán bừa → đổi vai.
- **D. Ô chữ:** nêu số chữ, chữ đã biết, quy ước dấu/khoảng trắng → xin ứng viên → kiểm đủ ràng buộc → phản hồi chính xác lỗi.
- **E. Phân nhóm từ:** 12–20 từ, quy định 1 từ có thuộc nhiều nhóm không → chấm Product/Process/Performance.
- **F. 20 câu hỏi:** giới hạn 20 câu, AI đếm → hỏi rộng rồi thu hẹp → kiểm câu trả lời nhất quán với đáp án → đổi vai.
- **G. Kể chuyện / nhập vai:** luân phiên mỗi bên 1 câu, ghi chi tiết đã xác lập, chỉnh khi lệch; nhập vai thì định rõ luật và quyền quyết định — luyện Augmentation.
- **H. Giải thích dưới ràng buộc:** vd giải thích context window bằng ẩn dụ bàn sơ chế nấu ăn, rồi nêu chỗ ẩn dụ sai.
- **I. Câu đố nâng cao / lập trình** (vd Project Euler): ghi điều kiện + ví dụ nhỏ → AI nêu cách tiếp cận trước → tự kiểm trường hợp nhỏ/chạy test → ghi loại lỗi.

**Lịch luyện 2 tuần:** N1–2 bảng phân công · N3–4 sửa 2 prompt mơ hồ · N5–6 chấm 3 đầu ra lĩnh vực quen · N7 dự án nhỏ · N8–9 công bố + chính sách · N10–11 trò chơi có ràng buộc · N12–13 ba mẫu prompt · N14 tự đánh giá, chọn mục tiêu mới.

---

## Bài kiểm tra và huy hiệu

- **10 câu**, đạt **≥80%** (≥8 câu đúng). Quiz riêng, không phải bài 14.
- Các bước: đăng nhập → mở **Course quiz** → trả lời, dùng **Next/Back** hoặc **Go to question N** → nộp → nếu đạt, **Create your completion badge** → xem ở trang **Completion badge**.
- **Ôn hiệu quả** — giải thích được bằng ví dụ khác biệt giữa: Automation vs Augmentation (và Agency) · Problem vs Platform Awareness · Product vs Process vs Performance Description · Product vs Performance Discernment · Creation vs Transparency vs Deployment Diligence. Bí quyết: tự hỏi "tôi đang nói về *phân công*, *yêu cầu*, *đánh giá* hay *trách nhiệm*?"

## Bộ công cụ dùng lại

**Bản ghi trước khi làm việc với AI:** tên việc · người dùng kết quả · mục tiêu & dấu hiệu thành công · đầu ra · dữ liệu/công cụ có · dữ liệu không được gửi · phần tôi làm / AI làm / cùng khám phá · tiêu chí kiểm · người duyệt & cách công khai AI · điều kiện hoàn thành.

**Bảng kiểm email:** người nhận biết vì sao nhận · ngày/giờ/địa điểm/thời lượng đúng · hành động + hạn rõ · không có thông tin AI tự thêm · giọng phù hợp · độ dài phù hợp · dữ liệu giả (hoặc có quyền) · người gửi duyệt bản cuối.

**Nhật ký một vòng cải thiện:** đã yêu cầu gì → kết quả có gì tốt → vấn đề ở đâu (Product/Process/Performance) → nhận ra nhờ đâu → phản hồi ra sao → bản sau cải thiện không → quyết định (dùng/sửa/bỏ/đổi phân công).

**10 tình huống tự kiểm (đáp án):** chưa rõ người nghe → Problem Awareness · nhờ AI không có quyền đọc lịch → Platform Awareness · cùng khám phá cốt truyện → Augmentation · bảng 3 cột ≤10 hàng → Product Description · phân loại trước rồi kết luận → Process Description · hỏi từng câu, phản biện → Performance Description · email sai ngày → Product Discernment · AI đưa lại phương án đã loại → Process (và Performance) Discernment · cân nhắc quyền chia sẻ dữ liệu → Creation Diligence · công khai AI nhưng chưa kiểm số liệu → thiếu Deployment Diligence.

**8 hiểu lầm cần sửa:**

| Hiểu lầm | Đúng ra |
|---|---|
| Prompt dài luôn tốt hơn | Rõ, liên quan, nhất quán mới tốt |
| AI tự tin thì tin được | Cần căn cứ và kiểm tra |
| Cho vai chuyên gia = có chuyên môn | Vai chỉ định hướng, vẫn phải đánh giá |
| Công khai dùng AI là đủ trách nhiệm | Còn dữ liệu, chất lượng, tác động |
| AI tự sửa là hết lỗi | Bản sửa vẫn có thể sinh lỗi mới |
| Có công cụ = có mọi dữ liệu | Mỗi công cụ có phạm vi riêng |
| AI nhớ mọi thứ bạn nói | Tùy hệ thống và ngữ cảnh |
| Phải dùng mọi kỹ thuật mỗi prompt | Chọn theo nhu cầu |
