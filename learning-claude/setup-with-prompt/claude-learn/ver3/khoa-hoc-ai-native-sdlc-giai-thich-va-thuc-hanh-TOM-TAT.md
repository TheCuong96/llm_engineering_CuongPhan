# TÓM TẮT — The AI-native SDLC playbook

> Bản tóm tắt dễ hiểu của [khoa-hoc-ai-native-sdlc-giai-thich-va-thuc-hanh.md](khoa-hoc-ai-native-sdlc-giai-thich-va-thuc-hanh.md). Giữ đủ 14 bài, mọi ý chính và từng bước thực hành; prompt, mẫu file và cấu hình đầy đủ xem ở file gốc.
> Khóa Claude Academy (~1 giờ đọc, không quiz/huy hiệu), dành cho người phụ trách kỹ thuật/nền tảng/bảo mật đã dùng Claude Code.

## Bức tranh 1 phút

**Ý tưởng cốt lõi:** AI viết mã nhanh gấp nhiều lần **chưa chắc** giao hàng nhanh hơn — nếu yêu cầu vẫn mơ hồ, PR vẫn chờ người đọc, deploy vẫn làm tay thì **hàng chờ chỉ chuyển chỗ** (như có máy thái rau siêu nhanh nhưng bếp và phục vụ vẫn chậm). Phải cải thiện **cả dòng công việc**.

| Giai đoạn | Việc | AI làm gì | Bài |
|---|---|---|---|
| Plan | Hiểu vấn đề | Tổng hợp thành `intent.md` | 2 |
| Design | Ý tưởng → yêu cầu khả thi | Tạo `spec.md`, đối chiếu chính sách | 3 |
| Build | Lập kế hoạch, viết mã | Dựa trên `plan.md`, `CLAUDE.md`, skill | 4–7 |
| Test | Chứng minh kết quả & chất lượng agent | Vòng phản hồi + eval | 8–9 |
| Deploy | Review, phê duyệt, phát hành | Review có hệ thống, deploy qua công cụ được cấp quyền | 10–12 |
| Maintain | Phát hiện vấn đề, cải tiến | Từ tín hiệu vận hành → intent mới | 13 |

Người **vẫn chịu trách nhiệm** quyết định nghiệp vụ, chính sách, mức rủi ro. "AI-native" ≠ mọi thứ tự động.

**Chuỗi tài liệu của một thay đổi:** `intent.md` (muốn gì, vì sao) → `spec.md` (hệ thống phải làm gì) → `plan.md` (thi công thế nào) → code + bằng chứng → PR.

**Ví dụ xuyên suốt — nhà sách trực tuyến:** thêm màn hình khách tự xem trạng thái đơn. Frontend → `shop-api` → `warehouse-core` (kho cũ). Giả định: kho chịu tối đa **30 req/s** · trạng thái cũ tối đa **45 giây** · API chỉ trả **3 trường** (trạng thái, bước tiếp, ngày giao dự kiến — có thể chưa có) · cache phải tách theo người dùng + đơn và kiểm quyền sở hữu.

---

## Bài 1 — Hiểu sự thay đổi và chọn điểm bắt đầu

**Các bước:**
1. Chọn một thay đổi gần đây (vd thêm bộ lọc đơn).
2. Ghi **thời gian làm** và **thời gian chờ** ở từng giai đoạn (1 giờ code nhưng 3 ngày chờ review là hai thứ khác nhau).
3. Xác định điểm nghẽn lớn nhất: ý tưởng mơ hồ, AI sai quy ước, test khó chạy, review chậm…
4. Chọn **một** cách áp dụng không có điều kiện tiên quyết: intent, Plan Mode, `CLAUDE.md`, skill, vòng phản hồi, hook.
5. Đặt **thước đo trước** khi thay đổi.
6. Thử trên 1 nhóm/1 repo, so cả tốc độ lẫn chất lượng.

**Thứ tự phụ thuộc khi triển khai** (không phải thứ tự học):
- 6 cách nền tảng (intent, Plan Mode, CLAUDE.md, skill, vòng phản hồi, hook) bắt đầu độc lập được.
- `CLAUDE.md` → phiên song song · `CLAUDE.md` + vòng phản hồi → eval · intent + skill → yêu cầu & thiết kế.
- Eval + subagent (+ CLAUDE.md, policy skill) → review PR · review PR + hook → CI/CD · CI/CD + intent → vòng vận hành khép kín.

**Đầu ra:** 1 điểm nghẽn + 1 thử nghiệm + 1 chỉ số. ⚠️ Lỗi: mở nhiều agent khi chưa có cách kiểm kết quả hay đủ người review.

## Bài 2 — Biến ý tưởng thành `intent.md`

**Ý chính:** intent = bản ghi ngắn về **muốn đạt gì, vì sao, giới hạn** (như phiếu yêu cầu sửa nhà "cần phòng yên tĩnh cho 2 người" trước khi chọn loại tường). AI hỏi cho rõ và viết; người đề xuất sửa hiểu lầm; **chủ sản phẩm quyết định** đi tiếp hay không.

**Các bước:**
1. Tạo nơi lưu có lịch sử phiên bản — vd `intent/order-status/intent.md` trong repo.
2. Thống nhất mẫu: vấn đề · kết quả mong muốn · người/hệ thống liên quan · ràng buộc · ngoài phạm vi · câu hỏi mở.
3. Kể vấn đề cho Claude bằng ngôn ngữ thường; đưa số liệu đã biết, **đánh dấu số liệu chưa xác minh**.
4. Yêu cầu Claude **hỏi trước** về phạm vi, nhóm khách, quyền truy cập, dấu hiệu thành công.
5. Nhờ viết intent theo mẫu; đọc lại tìm chỗ AI biến giả định thành sự thật hoặc tự thêm tính năng.
6. Chủ sản phẩm rà soát (người không dùng Git có thể dùng connector của tổ chức — nhưng việc duyệt phải được ghi nhận).
7. Commit + PR/review để lưu quyết định chấp nhận/từ chối.

Prompt mẫu nhấn mạnh: hỏi trước · thông tin chưa có bằng chứng để ở *Giả định/Câu hỏi mở* · **chưa chọn thư viện, chưa thiết kế endpoint, chưa viết mã**.

**Đo:** thời gian đến intent được lưu · tỷ lệ chấp nhận · số lần sửa intent sau khi spec đã bắt đầu. ✅ Người không dự họp đọc có hiểu vấn đề và biết cái gì ngoài phạm vi?

## Bài 3 — Tạo yêu cầu và thiết kế (`spec.md`)

**Ý chính:** intent = "muốn gì, vì sao"; spec = "**hệ thống phải làm gì**, thiết kế nào, đáp ứng ràng buộc ra sao". Quan trọng là quyết định **kiểm tra được** ("cập nhật nhanh" ✗ → "cũ tối đa 45 giây" ✓). Chính sách tổ chức (dưới dạng skill) làm giới hạn.

**Các bước:**
1. Chuẩn bị intent đã duyệt + skill bảo mật/trải nghiệm/thương hiệu/tuân thủ.
2. Mở phiên Claude có quyền đọc bối cảnh; đưa intent và nêu chính sách phải dùng.
3. Yêu cầu `spec.md`: yêu cầu **đánh số R1, R2…** · thiết kế · cách đáp ứng từng ràng buộc · câu hỏi mở · vấn đề cần chủ chính sách quyết định.
4. Giao diện: tạo phác thảo (khóa gợi ý intent → Claude Design → lặp trên mock → Claude Code) hoặc dùng thiết kế nhóm đã duyệt.
5. Kiểm các **đường đi khó**: chưa có dữ liệu, mất kết nối kho, hết phiên đăng nhập, khách mở đơn của người khác.
6. **Giải quyết xung đột trước** (vd UX đòi ngày giao nhưng nghiệp vụ chưa có → chủ sản phẩm + chủ chính sách chốt).
7. Lưu spec cạnh intent, ghi phiên bản skill/chính sách đã dùng; chủ sản phẩm quyết định chuyển sang build (rủi ro cao cần trưởng kỹ thuật).

**Ví dụ spec:**

| Mã | Yêu cầu | Cách chứng minh |
|---|---|---|
| R1 | Khách chỉ xem đơn của mình | Test truy cập chéo 2 tài khoản |
| R2 | API trả đúng 3 trường | Test cấu trúc response |
| R3 | Dữ liệu cũ tối đa 45s | Test hạn cache với đồng hồ giả |
| R4 | Không tạo đăng nhập mới | Kiểm tích hợp middleware hiện có |
| R5 | Thiếu ngày giao vẫn dùng được | Test + kiểm tra UI |

Thiết kế: `OrderStatusPanel → shop-api → warehouse-core` (trình duyệt không gọi kho). Giới hạn tải phải tính **phía server** — cache trình duyệt không chứng minh được toàn hệ thống <30 req/s.

**Đo:** thời gian intent → spec · số lần sửa yêu cầu sau khi đã lập plan (nhiều = viết mã khi câu hỏi còn lớn).

## Bài 4 — Lập kế hoạch trước khi sửa mã (Plan Mode)

**Ý chính:** spec = bản thiết kế nhà; **plan = trình tự thi công** (sửa gì trước, kiểm bằng gì). Plan Mode cho khảo sát + lập kế hoạch **trước khi được sửa mã**. Plan tốt chỉ ra **tệp, thứ tự, rủi ro, bằng chứng hoàn thành** — phát hiện hướng sai khi còn rẻ.

**Các bước:**
1. `cd` vào gốc dự án.
2. `claude --permission-mode plan`.
3. Yêu cầu đọc intent, spec, mã hiện có → đề xuất plan (chưa có spec thì nói rõ và chỉ ra khoảng trống).
4. Hỏi tiếp: bước nào rủi ro nhất? tính năng cũ nào có thể hỏng? phương án khác? cần test nào trước?
5. Đọc từng tệp dự kiến sửa; plan phải **nối được với R1–R5**.
6. Chấp nhận plan → khi được ghi, lưu thành `plan.md` và commit. Đừng để Plan Mode "tiện tay sửa luôn".
7. Triển khai; đổi hướng thì **cập nhật plan cùng thay đổi mã**.

**Khung `plan.md`:** *Phạm vi sửa* (API theo pattern có sẵn + tái dùng auth; UI panel với trạng thái tải/lỗi/thiếu ngày; tests quyền, response, cache) · *Thứ tự* (tìm middleware & cache sẵn có → viết test R1–R3 → API → UI cho R4–R5 → kiểm luồng lân cận) · *Rủi ro* (cache sai khóa lộ đơn giữa 2 khách; tải kho phải **đo**) · *Bằng chứng* (test, build, lint, ảnh UI, kiểm tải).

**Auto Mode:** chỉ tăng tự chủ cho việc thường lệ khi spec rõ, phạm vi nhỏ, test tốt, có lớp kiểm soát — không thay người duyệt rủi ro/cổng phát hành.

**Hệ thống cũ (Jira…):** chỉ định **bản chính** cho từng loại tài liệu (Git hay công cụ cũ); khi chuyển đổi, ít nhất liên kết mã ticket ↔ commit SHA và quy định xử lý khi hai bản lệch.

**Đo:** thời gian duyệt plan → merge · số vòng làm lại · tỷ lệ diff cuối vẫn khớp plan.

## Bài 5 — Viết `CLAUDE.md` cho dự án

**Ý chính:** như **tờ hướng dẫn ngày đầu cho kỹ sư mới** — chạy thế nào, luật kiến trúc, lỗi hay gặp. Không nhồi mọi tài liệu (dài, cũ, mâu thuẫn → agent làm sai).

**Các bước:**
1. Mở Claude Code tại repo → `/init` tạo bản khởi đầu.
2. **Xác minh từng lệnh** (lệnh test tưởng đúng mà không chạy test → mọi bước sau vô giá trị).
3. Giữ phần thiết yếu: build/test/lint/run · ranh giới kiến trúc · quy ước ảnh hưởng tính đúng · lỗi lặp lại.
4. Cắt giải thích dài đã có nơi khác — mục tiêu **dưới một trang**.
5. Lưu ở gốc repo, review như mã nguồn.
6. Claude sai cùng việc **2 lần** → thêm chỉ dẫn cụ thể; đồng thời cân nhắc kiểm bằng hook/CI thay vì chỉ nhắc bằng chữ.
7. Kiến trúc đổi → cập nhật ngay trong cùng thay đổi.

**Mẫu:** *Lệnh đã xác minh* (test/build/lint) · *Ranh giới kiến trúc* (`web/` chỉ gọi `shop-api/`; `intent/<tên>/` chứa intent/spec/plan; API kiểm quyền sở hữu) · *Quy ước* (ngày ISO 8601; thiếu ngày giao là hợp lệ; cache tách theo user + đơn) · *Lỗi cần tránh* (không log toàn bộ request/response/dữ liệu khách; không tự đổi dependency) · *Hoàn thành* (báo kết quả thật, kể cả phần chưa chạy).

**Đo:** số lần agent lặp lỗi đã có hướng dẫn · thời gian người mới có PR đầu được merge. ✅ Kỹ sư mới chạy được kiểm tra mà không phải hỏi ai?

## Bài 6 — Đóng gói tri thức bằng skill

**Ý chính:** skill = hướng dẫn chuyên biệt dùng lại cho một nhóm nhiệm vụ; nêu **khi nào áp dụng** và **làm gì**.

| Muốn truyền đạt | Đặt ở |
|---|---|
| Lệnh test, cấu trúc repo, luật kiến trúc dùng thường xuyên | `CLAUDE.md` |
| Quy trình kiểm API khi đụng tới API | **Skill** |
| Yêu cầu một lần cho thay đổi hiện tại | Prompt / intent / spec / plan |
| Điều **bắt buộc** phải kiểm | Hook, CI, kiểm soát ở hệ thống đích |

⚠️ Skill là lớp *hướng dẫn* — một câu "không được lộ dữ liệu" không chứng minh mọi thay đổi an toàn.

**Các bước:**
1. Chọn chính sách đang áp dụng không đều (vd API đơn hàng phải kiểm quyền sở hữu).
2. Xác định **chủ chính sách** + tài liệu chính thức (không lấy ý AI làm chính sách mới).
3. Tạo `.claude/skills/order-api-policy/SKILL.md`.
4. Viết `description` đủ rõ để kích hoạt khi tạo/sửa/review API đơn hàng.
5. Thân bài = hành động kiểm tra được + đầu ra mong đợi (script được gọi phải tồn tại và chạy được).
6. Thử nhiều cách hỏi ("thêm route", "review API", "sửa lỗi xem đơn") → xác nhận skill **thật sự được nạp**.
7. Thử nhiệm vụ không liên quan → skill **không** kích hoạt tràn lan.
8. Commit, chủ chính sách duyệt, có thể phân phối qua plugin tổ chức; cập nhật cùng lúc chính sách đổi.

**Skill mẫu `order-api-policy`:** xác định cơ chế xác thực → kiểm quyền sở hữu kể cả đường trả từ cache → chỉ trả trường spec chấp nhận → response/log không lộ dữ liệu → chỉ ra test truy cập chéo + thiếu ngày giao → báo phát hiện kèm vị trí, bằng chứng, đánh dấu điều chưa xác minh.

**Hook trong giai đoạn build:** sau khi sửa tệp có thể chạy formatter/kiểm chính sách nhanh; trước hành động có thể chặn đường dẫn được bảo vệ. ⚠️ `PostToolUse` chạy **sau** — không hoàn tác được; matcher `Edit|Write` **không bắt** shell tự ghi tệp → vẫn phải chạy lại kiểm tra chính sách như **check bắt buộc ở PR**. Kiểm tra nặng đừng chạy sau mọi lần gõ.

**Đo:** thời gian đưa cập nhật chính sách vào skill · số phát hiện review về cùng chính sách (không giảm → xem cả điều kiện kích hoạt lẫn nội dung).

## Bài 7 — Phiên song song và subagent

| Khái niệm | Hình dung | Hợp với |
|---|---|---|
| **Phiên song song** | 2 bàn làm việc độc lập, mỗi bàn một bản checkout | 2 nhiệm vụ đủ độc lập |
| **Subagent** | Chuyên viên nhận việc hẹp trong một phiên | Đọc mã, tìm hiểu, kiểm chứng có phạm vi |

Phiên độc lập không biết phiên kia quyết định gì → người điều phối chia việc và review. Subagent có context riêng (không làm đầy hội thoại chính) nhưng cần nhiệm vụ + giới hạn rõ.

**Các bước:**
1. Chuẩn bị `CLAUDE.md` chung + lệnh kiểm tra (vòng phản hồi càng tốt càng ít phải theo dõi).
2. Chia việc theo **vùng tệp** từ plan; cùng module thì làm tuần tự hoặc thống nhất giao diện trước.
3. Vd: phiên A xây API, phiên B viết tài liệu sử dụng; nếu cùng sửa schema chung → **chốt schema trước** rồi mới tách.
4. Hai terminal: `claude --worktree order-status-api` và `claude --worktree order-status-guide`.
5. Giao mỗi phiên: phạm vi, đầu ra, phần **không được chạm**, kiểm tra cần chạy (đừng nói "làm nửa còn lại").
6. Việc kiểm chứng lặp lại → định nghĩa subagent trong `.claude/agents/`; vai đánh giá thì **không tự sửa**.
7. Xong từng nhánh → đọc báo cáo + diff → tích hợp theo Git flow, giải quyết xung đột, chạy kiểm tra tích hợp.
8. Bắt đầu **2–3 phiên**; chỉ tăng khi vẫn review kịp và chất lượng không giảm.

**Subagent mẫu `order-flow-verifier`** (`tools: Read, Bash`): đọc plan + CLAUDE.md → chạy kiểm tra luồng mới và luồng lịch sử đơn liên quan → kiểm truy cập đơn người khác bị từ chối → **không sửa tệp** → báo lệnh, kết quả, sai khác, điều chưa kiểm → không có công cụ duyệt web thì không nhận đã nhìn UI.

⚠️ Worktree tách **tệp và nhánh Git**, không tách DB/cổng mạng/dịch vụ ngoài. Quyền subagent phải đúng nhiệm vụ (người đọc mã không cần quyền phát hành).

**Đo:** số việc merge/tuần **kèm** tỷ lệ làm lại (đếm số phiên không đo được hiệu quả). ✅ Mở thêm 2 phiên, bạn có đủ thời gian đọc kết quả không?

## Bài 8 — Cho AI vòng phản hồi

**Ý chính:** nói "làm cho đúng" mà AI không có cách biết đúng sai → nó dừng ở lời giải thích nghe hợp lý.
```
Thực hiện → chạy kiểm tra → đọc lỗi → sửa → chạy lại → báo bằng chứng
```
Test kiểm hành vi · build bắt lỗi đóng gói · lint kiểm quy tắc · ảnh UI bắt cái test logic không thấy. Verifier subagent là lượt kiểm **cuối** với context mới — không thay vòng kiểm trong quá trình.

**Các bước:**
1. Chuẩn hóa: 1 lệnh test cần thiết, 1 lệnh build, 1 lệnh lint; lỗi → **mã thoát ≠ 0**.
2. Ghi lệnh + dấu hiệu thành công vào `CLAUDE.md`.
3. Giao mục tiêu **quan sát được** ("khách A không đọc được đơn khách B", "thiếu ngày vẫn có nội dung", "response đúng 3 trường").
4. Sửa bug → **tái hiện bằng test trước**, chạy thấy fail **đúng nguyên nhân** (không phải thiếu thư viện/sai môi trường).
5. Chốt test đó, rồi mới cho sửa mã để test qua; bảo vệ test bằng hook hoặc review diff.
6. UI: cho Claude công cụ nhìn app + bản thiết kế → mở, chụp, đối chiếu, chỉnh; không có thì ghi rõ "chưa kiểm bằng mắt".
7. Chạy lại kiểm tra liên quan; báo **lệnh, kết quả, giới hạn** — không chỉ "đã xong".
8. Đưa bằng chứng vào PR/check run.

**Báo cáo tốt mẫu:** trước sửa test `empty_delivery_date` fail vì panel trống → sau sửa test + test liên quan qua → build/lint qua → UI đã kiểm có ngày/chưa có ngày/lỗi tải → **chưa kiểm:** tải đồng thời lên kho thật.

💡 "Không làm yếu test đã chốt" áp dụng cho lần sửa bug đó — khi yêu cầu hợp lệ đổi, test vẫn đổi được (qua review).

**Đo:** tỷ lệ CI qua lần đầu · thời gian review · tỷ lệ thay đổi gây lỗi. "Test xanh" chỉ có giá trị trong phạm vi test thật sự bao phủ.

## Bài 9 — Đánh giá agent liên tục bằng eval

**Ý chính:** *Test* hỏi "mã có chạy đúng?". *Eval* hỏi "với **model + hướng dẫn hiện tại**, agent có làm nhiệm vụ đúng chuẩn?". Rút gọn `CLAUDE.md`, đổi skill, đổi model → app không đổi nhưng cách AI làm việc có thể tệ đi. (Như thi lái xe: cùng tuyến, cùng tiêu chí, thay người lái/hướng dẫn.)

**Các bước:**
1. Có `CLAUDE.md`, vòng phản hồi, CI chạy Claude không tương tác + **ngân sách** gọi model.
2. Gom **20–50 nhiệm vụ thật** đã có kết quả được chấp nhận (học cơ chế thì làm vài ca trước).
3. Mỗi nhiệm vụ ghi: commit đầu vào, prompt, phạm vi tệp được sửa, kiểm tra chấp nhận.
4. Checkout sạch tại commit **trước khi** nhiệm vụ được giải.
5. Áp cấu hình cần đánh giá (CLAUDE.md, skill, hook của nhánh mới); **bộ chấm nằm ngoài vùng agent được sửa**.
6. Chạy agent → bộ chấm độc lập kiểm: có lỗi thực thi? sửa ngoài phạm vi? test/lint/policy qua?
7. Chạy theo lịch **và** khi cấu hình đổi; đặt điều kiện merge cho cấu hình; đổi model/prompt cũng chạy lại.
8. Điểm giảm → đọc từng ca fail rồi quyết — **đừng hạ ngưỡng để merge**.
9. Mỗi sự cố thật → **ca eval hồi quy**; thay ca quá dễ/không còn đại diện.

**Mẫu ca eval** (định dạng nhóm tự xây — phải tự viết runner): `name`, `start_commit`, `task`, `allowed_paths`, `acceptance` (test cũ vẫn qua, lint qua, không sửa ngoài phạm vi, log không chứa response đầy đủ/dữ liệu khách, giữ hành vi phân quyền).

**Các mục mở rộng của bài gốc:**
- **`check.sh`:** chấm từ bản sao tạo **trước** khi agent chạy → agent kết thúc hợp lệ? sửa ngoài danh sách? chạy từng check → PASS/FAIL → kiểm phạm vi **lần nữa** sau check. Mục đích: agent không thể "qua bài" bằng cách sửa Makefile/bỏ check/viết lại tiêu chí (củng cố bằng quyền runner).
- **`log_bodies.py`:** dữ liệu khách giả → gọi endpoint → thu log → phát hiện ghi **toàn bộ response** bất kể tên biến. Giới hạn: không bắt được trường nhạy cảm log riêng (vd "ghi chú giao hàng" chứa SĐT) → kiểm riêng.
- **Không dùng `--bare`** khi đang đánh giá chính những cấu hình mà chế độ đó bỏ qua (CLAUDE.md, skill, hook).

**Đo:** tỷ lệ qua · chi phí · thời gian chạy · thời gian từ sự cố → có eval · lỗi chặn ở CI vs lỗi lọt ra vận hành. Dùng dữ liệu giả.

## Bài 10 — AI trong quy trình review PR

**Ý chính:** AI có 2 vai: **review** thay đổi và **sửa** nhận xét trên PR. Người review dồn sức cho "đúng ý định chưa, rủi ro chấp nhận được không?". Review chia **lượt rõ ràng**: logic · bảo mật · đối chiếu spec/plan (không đọc plan thì không biết cache là yêu cầu quan trọng).

**Các bước:**
1. Chuẩn bị `CLAUDE.md`, policy skill, subagent; dùng eval để biết đổi cấu hình review có làm giảm chất lượng không.
2. Chọn tích hợp: dịch vụ **Code Review** (admin bật) hoặc **`claude-code-action`** trong CI (kiểm tình trạng sản phẩm lúc triển khai).
3. Viết `REVIEW.md` ở gốc: các lượt, mức nghiêm trọng, điều bỏ qua, giới hạn nit.
4. Cấu hình luồng review **thật sự đọc** file đó.
5. Branch protection + người phê duyệt: AI đưa phát hiện, **code owner phê duyệt**.
6. PR liên kết intent/spec/plan + bằng chứng test → AI đối chiếu hành vi và ràng buộc, không chỉ diff.
7. Xem phát hiện trước khi cho sửa; có thể dùng `@claude` trên review comment để giao sửa rồi chạy lại kiểm tra.
8. Sau sửa: kiểm lại diff + nhận xét chưa giải quyết. **Tự sửa không được thành tự phê duyệt.**
9. Lỗi lặp lần 2 → đưa vào hướng dẫn phù hợp; định kỳ xem nhận xét sai, giảm nhiễu nit.

**`REVIEW.md` mẫu:** *Lượt* (logic: quyền xem đơn, cache, thiếu dữ liệu, lỗi · bảo mật: truy cập chéo, dữ liệu khách trong log · đúng yêu cầu: R1–R5 + plan) · *Mức* (**Important** = sai hành vi/lộ dữ liệu/vi phạm ràng buộc · **Nit** = cải thiện nhỏ) · *Báo cáo* (vị trí, tình huống lỗi, ảnh hưởng; tối đa 3 nit; không lặp lỗi formatter; bỏ qua file sinh tự động). Vd panel gửi request mỗi lần render = Important (phá thiết kế hạn tải); tên biến xấu = Nit; thiếu test → xét theo rủi ro.

⚠️ Hai cách dùng `@claude` khác nhau: action xử lý comment + đẩy bản sửa vs `@claude review` trong dịch vụ review quản lý để yêu cầu review lại.

**Đo:** thời gian đến review đầu · tỷ lệ comment xử lý qua agent · lỗi lọt qua merge. Số lượng nhận xét ≠ chất lượng.

## Bài 11 — Hook làm cổng phê duyệt

**Ý chính:** hook = chương trình chạy tại một sự kiện của Claude Code. Làm cổng: kiểm điều kiện **trước khi** hành động tiếp tục. Như **bảo vệ cửa kho** — bạn giải thích ý định (prompt), nhưng cửa chỉ mở khi có **giấy phép hợp lệ** (chương trình kiểm tra).

| Quyết định | Nghĩa | Ví dụ |
|---|---|---|
| **Allow** | Cho làm | Deploy bản thử lên dev |
| **Ask** | Hỏi người đang chạy phiên | Kỹ sư xác nhận deploy staging |
| **Deny** | Chặn + nêu đường được duyệt | Production thiếu phiếu duyệt đúng phiên bản |

**Các bước:**
1. Cùng trưởng kỹ thuật, quản lý thay đổi, chính sách liệt kê cổng cần giữ: release production, sửa hạ tầng, migration, tệp bảo vệ.
2. Xác định bằng chứng chấp thuận nằm đâu, ai được ghi — **AI tự sửa được bản ghi thì giấy phép vô nghĩa**.
3. Viết hook **trước hành động** (PreToolUse): nhận tên công cụ + đầu vào, kiểm môi trường, phiên bản, phiếu duyệt.
4. Trả quyết định **kèm lý do**: thiếu gì, ai có quyền duyệt, làm gì tiếp.
5. Hook nhóm: `.claude/settings.json`; bắt buộc không được tắt: **managed settings** của admin.
6. Test ≥4 ca: không phiếu · phiếu chưa duyệt · phiếu duyệt cho **phiên bản khác** · phiếu hợp lệ đúng phiên bản.
7. Thử **đường đi khác** ngoài công cụ release — hệ thống đích và credential cũng phải giới hạn.
8. Ghi quyết định, thời gian, người duyệt.

**Logic mẫu:** dev → cho phép · staging → pipeline tin cậy từ thay đổi đã merge thì cho, không thì hỏi · production → đọc phiếu từ hệ thống duyệt **độc lập**, chỉ cho khi đã duyệt **và** đúng phiên bản · môi trường lạ → chặn.

**Chi tiết cần chú ý:** matcher bắt tên công cụ release của MCP server theo môi trường · CLI kiểm phiếu là của hệ thống quản lý thay đổi, không có sẵn trong Claude · `ask` cần người trả lời — job không tương tác thì dùng tuyến đã duyệt trước hoặc chặn · biến môi trường do người tự đặt **không** phải bằng chứng mạnh — gắn tin cậy với danh tính runner · production phải khớp đúng phiên bản.

**Managed settings cho tổ chức:**

| Nhóm | Mục đích |
|---|---|
| Permission allow/deny | Cho build/test, chặn truy cập không phù hợp |
| Cấm mở rộng quy tắc ở máy cá nhân | Không tự nới ranh giới quản trị |
| Sandbox tệp & mạng | Giới hạn cả shell (tắt WebFetch không đủ chặn shell ra mạng) |
| Cô lập credential | Chương trình con không đọc khóa/biến bí mật ngoài nhu cầu |
| Chỉ dùng hook quản trị | Hook dự án có thể không chạy khi bật |
| Plugin/marketplace được duyệt | Quản lý nguồn skill, agent |
| MCP được duyệt | Chỉ server/công cụ tổ chức cho phép |
| Phiên bản tối thiểu | Dùng bản đã đánh giá |

**Đo:** thời gian chờ từng cổng · số vi phạm đi tới production. Giữ đúng quyết định cần người chịu trách nhiệm quan trọng hơn giảm số lần hỏi.

## Bài 12 — Đưa AI vào CI/CD

**Ý chính:** script thường làm tốt bước xác định sẵn; Claude hỗ trợ bước **cần đọc và suy xét** (phân loại lỗi build, giải thích test chập chờn, soạn release notes). Tăng tự động **theo thứ tự**: đọc & giải thích → đề xuất qua PR → triển khai vào môi trường được phép. Review + cổng phải có **trước** CI/CD.

**Các bước:**
1. Chọn tác vụ **chỉ đọc** đầu tiên (đọc log build lỗi); xác định đầu vào + nơi lưu báo cáo.
2. Cấu hình truy cập model tổ chức chấp nhận (API, Bedrock, Vertex AI, Microsoft Foundry); secret trong hệ thống CI, không trong repo.
3. Runner/container có repo + log; **credential ngắn hạn, đúng phạm vi**; không gắn quyền production vào mọi job.
4. Chạy không tương tác `claude -p`; giới hạn quyền công cụ/tệp/mạng; kiểm cả đường thất bại.
5. Báo cáo đã hữu ích → thêm tác vụ có ghi (sửa lint, tài liệu) nhưng ra **nhánh/PR** qua branch protection.
6. Deploy qua MCP: cung cấp công cụ **release, status, rollback**; **mỗi môi trường một server + credential riêng**.
7. Dev → staging → production (agent chuẩn bị release, chỉ đi tiếp khi cổng xác nhận đúng phiên bản).
8. Định nghĩa kiểm tra sau phát hành: chờ bao lâu, chỉ số nào, ngưỡng nào, khi nào rollback.
9. **Diễn tập rollback** ở staging — bản cũ chạy lại thật, dữ liệu vẫn tương thích.
10. Lưu phiên bản, status, quyết định rollback, danh tính job vào báo cáo phát hành.

**Lệnh mẫu:** `claude -p "Đọc out/build.log. Nêu nguyên nhân có bằng chứng, khả năng lỗi chập chờn và kiểm tra tiếp theo. Không sửa tệp." --permission-mode plan`. ⚠️ Câu "không sửa tệp" **không phải ranh giới bảo mật** — kiểm soát bằng cấu hình + runner.

**Vì sao tách MCP server theo môi trường?** Một tool `release(environment, version)` khiến quy tắc quyền theo tên tool không phân biệt được môi trường → dùng tên riêng: `mcp__deploy-staging__release`, `mcp__deploy-prod__release`. Dev: token dev · staging: token staging, theo pipeline duyệt hoặc hỏi · production: danh tính kiểm soát, release qua hook kiểm phiếu. Server/nền tảng deploy cũng phải xác minh credential. Cấu hình mẫu: `dontAsk` từ chối hành động cần hỏi, `PreToolUse` cho release khi phiếu hợp lệ — thử cả lúc hook lỗi/không nạp.

**Rollback** không chỉ đổi số phiên bản: migration DB, message queue, định dạng dữ liệu mới có thể làm bản cũ hỏng. Runbook phải nêu điều kiện, cách xác minh, khi nào chuyển người trực. Sau rollback vẫn phải xác nhận tải kho + tỷ lệ lỗi giảm, không chỉ xem lệnh trả mã 0.

**Đo:** tỷ lệ lỗi pipeline được phân loại không cần người · các chỉ số **DORA** (lead time, tần suất deploy, tỷ lệ thay đổi gây sự cố, thời gian phục hồi).

## Bài 13 — Khép vòng từ chỉ số vận hành

**Ý chính:** vòng làm việc có thể bắt đầu từ vận hành: **phát hiện bất thường → điều tra → intent → thiết kế → sửa → kiểm → review → triển khai**. Phần phát hiện là **chương trình xác định** (không nhờ model đoán đồ thị "trông lạ"); Claude chỉ được gọi khi quy tắc đã bắn tín hiệu, và chỉ hành động trong tuyến được cấp quyền. Giữa các chặng vẫn cần **cổng chất lượng độc lập** — agent tự nói "tôi chắc" không phải cổng.

**Control band:** `μ` = trung bình cửa sổ lịch sử, `σ` = độ lệch chuẩn; mốc trên ở `μ+σ`, `μ+2σ`, `μ+3σ`. Vd tỷ lệ lỗi 0,40%, σ = 0,10 điểm % → mốc 0,50% / 0,60% / 0,70% (thống nhất đơn vị: 0.40% ≠ 0.004). Vượt 1σ khá thường; vượt 3σ đôi khi vẫn là nhiễu → **không cho một tín hiệu đơn lẻ quyền sửa production tùy ý**.

**Các bước:**
1. Chọn chỉ số có đường nền ổn định (tỷ lệ lỗi test, 5xx sau deploy, thời gian xử lý PR).
2. Lấy lịch sử (vd theo giờ, 30 ngày); chốt đơn vị, xử lý dữ liệu thiếu, mùa vụ giờ/ngày.
3. Viết chương trình tính đường nền + quy tắc; lưu Git, **kiểm thử bằng dữ liệu có kết quả mong đợi**.
4. Mức phản ứng trong cấu hình có phiên bản: **1σ → chỉ log · 2σ → Claude điều tra chỉ đọc · 3σ → đề xuất qua PR hoặc runbook đã duyệt**.
5. Phát hiện trôi chậm (xử lý như 2σ): **4/5 điểm trên 1σ** hoặc **8 điểm liên tiếp trên trung bình**.
6. Gọi chương trình bằng lịch CI/cron/webhook giám sát; tầng điều phối cấp đúng công cụ theo mức — agent **không tự nâng quyền**.
7. Claude điều tra từ metric, log, thay đổi gần nhất, repo → ghi kết luận + bằng chứng thành **intent** (giả thuyết chưa xác minh ghi rõ).
8. Mức được hành động: chỉ mở PR vào cổng review hoặc gọi đúng runbook.
9. Chủ dịch vụ phân loại: sửa ngay / lên lịch / bỏ qua có lý do; báo giả dùng để chỉnh quy tắc.
10. Sau sửa + phát hành: xác minh chỉ số hồi phục; thêm test/eval chống lặp lại.

**Script phát hiện (mục mở rộng):** tách điểm mới nhất khỏi dữ liệu nền → tính μ, σ → có **sàn sigma** (đường nền quá phẳng không biến dao động nhỏ thành sự cố) → xét quy tắc nặng nhất trước. Lưu ý: bên gọi phải đưa đúng cửa sổ 30 ngày · thiếu lịch sử thì **báo thiếu** · ví dụ chỉ xét phía tăng (chỉ số mà giảm mới xấu cần quy tắc khác) · sàn sigma theo đơn vị metric · có mùa vụ/thay đổi cấu trúc cần mô hình phù hợp.

**Kịch bản nhà sách từ đầu đến cuối:** 10:10 release vô tình bỏ cache → tải kho tăng, `shop-api` trả nhiều 5xx → chương trình phát hiện vượt mốc nặng, ghi số đo/đường nền/thời điểm → agent đọc diff, thấy thay đổi cache, đối chiếu ràng buộc 30 req/s, ghi là **nghi vấn**, xác minh bằng log/tải kho → đủ điều kiện runbook thì rollback theo quyền → kiểm phiên bản + metric sau rollback, viết intent → nhóm tìm cách vừa tươi dữ liệu vừa giữ giới hạn tải → bản sửa qua spec/plan/test/PR → **eval mới** kiểm "làm nhanh hơn" không khiến agent xóa kiểm soát tải. (Đừng chỉ grep `CACHE_SECONDS` — kiểm **hành vi**.)

**Kênh trao đổi (Claude Tag trong Slack, public beta lúc đọc):** Claude tham gia bằng danh tính riêng, nhận sự cố/yêu cầu, điều tra, lưu tiến trình trong thread; việc nhỏ → PR, việc lớn → intent. Không thay phân quyền, người trực, cổng review.

**Đo:** thời gian vượt ngưỡng → intent trong hàng đợi · tỷ lệ đề xuất thành bản sửa merge · tỷ lệ báo giả · sự cố cùng loại lặp lại.

## Bài 14 — Tổng kết và tài nguyên

**Ý chính:** model làm việc; **tài liệu, công cụ, kiểm tra và quyền bao quanh** khiến kết quả dùng được và kiểm soát được. Vai trò con người chuyển sang **định nghĩa ý định, ranh giới, bằng chứng và quyết định khó**. Đừng đo thành công bằng số dòng mã AI sinh ra.

**Sau khóa học:**
1. Chọn repo thử nghiệm + người chịu trách nhiệm.
2. Kiểm kê cái đã có: test một lệnh, owner policy, intent/spec/plan, review, hook, rollback.
3. Chọn **một khoảng trống** đang tốn thời gian/gây lỗi — không triển khai tất cả cùng lúc.
4. Đối chiếu tài liệu chính thức (Admin setup, Settings, Server-managed settings, Permissions, Sandboxing, Hooks, Skills, Plugin marketplaces, Managed MCP, Third-party integrations, Network config, Monitoring/Analytics, Compliance API, Security — link trong file gốc).
5. Chốt thử nghiệm nhỏ, người duyệt, chỉ số; ghi kết quả kể cả khi không cải thiện.
6. Mở rộng khi đầu ra đáng tin và người review theo kịp.

---

## Bài tập tổng hợp — tự làm một vòng thay đổi

**Chuẩn bị:** repo thử được phép sửa, tạo nhánh → chạy app + test hiện có trước (biết lỗi nào có sẵn) → cấu trúc:
```
intent/order-status/{intent.md, spec.md, plan.md}
CLAUDE.md · REVIEW.md
.claude/skills/order-api-policy/SKILL.md
.claude/agents/order-flow-verifier.md
```
(Dự án có cấu trúc khác thì giữ cấu trúc dự án.)

**Vòng 1 — Từ vấn đề đến mã có bằng chứng:**

| Bước | Làm | Đầu ra tự kiểm |
|---|---|---|
| 1 | Kể vấn đề, trả lời câu hỏi làm rõ | Intent không thêm tính năng ngoài phạm vi |
| 2 | Tạo spec, xử lý quyền + ngày giao | Yêu cầu đánh số, có điều kiện chấp nhận |
| 3 | Plan Mode, hỏi rủi ro cache/API | Plan nêu phần sửa + test tương ứng |
| 4 | Duyệt, triển khai có vòng phản hồi | Diff + kết quả test/build/lint thật |
| 5 | Verifier / kiểm tra độc lập | Báo cáo luồng mới + luồng lân cận |
| 6 | Review logic, bảo mật, spec/plan | Phát hiện có bằng chứng + quyết định người review |

**3 phép thử bắt buộc:** khách A xem đơn khách B → bị từ chối **kể cả khi có cache** · chưa có ngày giao → màn hình vẫn giải thích được, không trắng · kho chậm/lỗi → UI hiển thị phù hợp, không tăng request vô hạn.

**Vòng 2 — Kiểm độ tin cậy của cách làm:**
1. Tạo eval từ nhiệm vụ "thêm log" — không được ghi toàn bộ dữ liệu khách.
2. Sửa một chỉ dẫn trong bản nháp `CLAUDE.md`, chạy lại eval, so sánh.
3. Mô phỏng release cần phiếu (công cụ giả/staging) — phiếu sai phiên bản bị từ chối.
4. Diễn tập rollback, ghi cách biết hồi phục thành công.
5. Chuỗi metric giả thử các mức — mức nhẹ chỉ log, không có quyền hành động.
6. Từ sự cố giả tạo intent mới + eval hồi quy → **vòng đã khép**.

**Lộ trình 4 tuần:**

| Tuần | Trọng tâm | Tiêu chí chuyển tiếp |
|---|---|---|
| 1 | Lệnh kiểm tra, CLAUDE.md, 1 intent + plan | Người khác chạy được; intent/plan đủ rõ để review |
| 2 | 1 policy skill + kiểm tra thực thi; bắt đầu eval | Policy kích hoạt đúng, lỗi chủ đích bị bắt |
| 3 | Review PR có hướng dẫn; hook cho 1 hành động | Review có ích; cổng đúng cả allow và deny |
| 4 | CI đọc log, deploy staging, diễn tập rollback, mô phỏng metric | Có bằng chứng hồi phục; quyền không vượt phạm vi |

**Bộ chỉ số nên ghi từ đầu** (luôn đọc **cặp** để không tự lừa mình):

| Câu hỏi | Chỉ số | Đọc cùng với |
|---|---|---|
| Ý tưởng → đầu vào nhanh hơn? | Thời gian tới intent duyệt | Tỷ lệ viết lại sau spec |
| AI giảm lỗi cơ bản? | CI qua lần đầu, lỗi lặp đã có hướng dẫn | Phạm vi test, lỗi lọt ra |
| Review bớt chờ? | Thời gian tới review đầu / merge | Phát hiện sai, số lần làm lại |
| Tự động hóa đáng tin? | Eval pass rate theo cấu hình/model | Chi phí, độ khó, tính đại diện |
| Vận hành tốt hơn? | Thời gian phát hiện/hồi phục | Báo giả, sự cố lặp, thay đổi gây lỗi |

Merge nhiều hơn mà sự cố cũng nhiều hơn = **chưa tiến bộ**.

## Thuật ngữ cốt lõi

**Harness** = môi trường điều phối agent (hướng dẫn, công cụ, quyền, kiểm tra, log) · **Artifact** = đầu ra lưu & review được · **PreToolUse** = trước khi dùng công cụ (hợp làm cổng) · **PostToolUse** = sau khi dùng (phản hồi, không hoàn tác) · **Worktree** = checkout Git riêng · **Code owner** = người phê duyệt vùng mã · **Branch protection** = quy tắc bắt buộc trước khi merge · **Eval** = nhiệm vụ + tiêu chí chấm cách agent làm · **Regression** = cái từng đúng bị hỏng · **Runbook** = hướng dẫn vận hành có bước, điều kiện, cách xác minh · **Control band** = dải dao động bình thường · **Triage** = phân loại, ưu tiên · **DORA** = bộ chỉ số giao hàng phần mềm.

## Tự kiểm tra việc học

- Vì sao viết mã nhanh chưa đảm bảo phát hành nhanh?
- Khi nào dùng intent / spec / plan, khi nào quay lại sửa chúng?
- Vì sao skill không thay được hook/CI cho điều bắt buộc?
- Test ứng dụng khác eval agent ở đâu?
- Ai phê duyệt PR, ai phê duyệt release production?
- Agent chứng minh đã kiểm tra thế nào thay vì chỉ nói "xong"?
- Cần chuẩn bị gì trước khi cho agent tự rollback?
- Một cảnh báo đi qua những bước nào để thành cải tiến bền vững?
