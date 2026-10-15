# AI-native SDLC: Bản giảng giải tiếng Việt và hướng dẫn thực hành

**Dựa trên khóa học:** [The AI-native SDLC playbook — Claude Academy](https://academy.claude.com/courses/ai-native-sdlc-playbook).  
**Ngày đọc và biên soạn:** 15/10/2026.  
**Phạm vi đã đọc:** 14/14 bài, gồm 12 cách áp dụng trong sáu giai đoạn SDLC, cùng các mục mở rộng về bộ chấm eval, kiểm tra log và phát hiện bất thường.

Đây là bản diễn giải và tổng hợp để học, kèm bài tập, prompt và ví dụ mới do người biên soạn bổ sung; không phải bản dịch nguyên văn. Các đường dẫn “Bài gốc” giúp bạn đối chiếu từng nội dung. Các lệnh và cấu hình minh họa chưa được chạy trên dự án của bạn.

Khóa học hướng đến người phụ trách kỹ thuật, nền tảng và bảo mật trong tổ chức đã dùng Claude Code. Tuy vậy, tài liệu này giải thích từ các khái niệm nền để người mới cũng theo dõi được. Khóa gốc chủ yếu là bài đọc, khoảng một giờ, không có bài kiểm tra hay huy hiệu hoàn thành.

## Mục lục

1. [Bài 1 — Hiểu sự thay đổi và chọn điểm bắt đầu](#bai-01)
2. [Bài 2 — Biến ý tưởng thành intent.md](#bai-02)
3. [Bài 3 — Tạo yêu cầu và thiết kế](#bai-03)
4. [Bài 4 — Lập kế hoạch trước khi sửa mã](#bai-04)
5. [Bài 5 — Viết CLAUDE.md cho dự án](#bai-05)
6. [Bài 6 — Đóng gói tri thức bằng skill](#bai-06)
7. [Bài 7 — Phiên song song và subagent](#bai-07)
8. [Bài 8 — Cho AI vòng phản hồi](#bai-08)
9. [Bài 9 — Đánh giá agent liên tục bằng eval](#bai-09)
10. [Bài 10 — AI trong quy trình review PR](#bai-10)
11. [Bài 11 — Hook làm cổng phê duyệt](#bai-11)
12. [Bài 12 — Đưa AI vào CI/CD](#bai-12)
13. [Bài 13 — Khép vòng từ chỉ số vận hành](#bai-13)
14. [Bài 14 — Tổng kết và tài nguyên](#bai-14)
15. [Bài tập tổng hợp và kế hoạch áp dụng](#thuc-hanh)
16. [Thuật ngữ dễ tra cứu](#thuat-ngu)

## Ví dụ xuyên suốt và cách dùng tài liệu

**Ví dụ bổ sung:** Bạn làm phần mềm cho một nhà sách trực tuyến. Khách thường gọi hỏi “Đơn hàng của tôi đang ở đâu?”. Nhóm muốn thêm màn hình xem trạng thái đơn, dùng tài khoản đăng nhập hiện có. Frontend gọi `shop-api`; chỉ `shop-api` được gọi hệ thống kho cũ `warehouse-core`.

Để có con số rõ ràng cho bài tập, ta giả định:

- Hệ thống kho chỉ chịu được 30 yêu cầu/giây.
- Trạng thái cho phép cũ tối đa 45 giây.
- API chỉ trả về trạng thái, bước tiếp theo và ngày giao dự kiến; không thêm địa chỉ hoặc số điện thoại.
- Ngày giao dự kiến có thể chưa có. Giao diện phải xử lý trường hợp đó.
- Cache phải phân biệt người dùng và đơn hàng, đồng thời kiểm tra quyền sở hữu trước khi trả dữ liệu.

Các con số trên phục vụ minh họa, không phải cấu hình mặc định của Claude hay khuyến nghị chung cho mọi hệ thống.

Bạn có thể đọc hết một lượt rồi làm bài tập, hoặc thực hiện từng bài trên repository thử nghiệm. Các file mẫu dùng Markdown; tên thư mục và lệnh cần đổi theo dự án thật. Các script Bash và workflow Linux của khóa gốc cần môi trường phù hợp như Linux, WSL hoặc Git Bash; chúng không tự trở thành script PowerShell.

<a id="bai-01"></a>
## Bài 1 — Hiểu sự thay đổi và chọn điểm bắt đầu

**Bài gốc:** [What changes and where to start](https://academy.claude.com/courses/ai-native-sdlc-playbook/introduction)

### Giảng dễ hiểu

SDLC là hành trình đưa một ý tưởng thành phần mềm được sử dụng và bảo trì. Nếu AI giúp viết mã nhanh gấp nhiều lần nhưng yêu cầu vẫn mơ hồ, PR vẫn chờ người đọc và triển khai vẫn làm tay, sản phẩm chưa chắc đến tay khách nhanh hơn.

Hãy nghĩ đến nhà bếp: có máy thái rau rất nhanh nhưng người duyệt món, nấu và phục vụ không đổi thì hàng chờ chỉ chuyển chỗ. Khóa học hướng đến cải thiện cả dòng công việc.

| Giai đoạn | Việc cần làm | Vai trò AI trong cách làm của khóa học |
|---|---|---|
| Plan — Lên ý tưởng | Hiểu vấn đề và kết quả mong muốn | Tổng hợp thông tin thành `intent.md` |
| Design — Thiết kế | Chuyển ý tưởng thành yêu cầu khả thi | Tạo `spec.md`, đối chiếu chính sách và nêu xung đột |
| Build — Xây dựng | Lập kế hoạch rồi viết mã | Dựa trên `plan.md`, `CLAUDE.md` và skill |
| Test — Kiểm thử | Chứng minh kết quả và chất lượng agent | Chạy kiểm tra trong lúc làm và eval khi cấu hình thay đổi |
| Deploy — Phát hành | Review, phê duyệt, đưa lên môi trường | Review có hệ thống, triển khai qua công cụ được cấp quyền |
| Maintain — Bảo trì | Phát hiện vấn đề và cải tiến | Từ tín hiệu vận hành tạo ý tưởng sửa chữa mới |

Người vẫn chịu trách nhiệm về quyết định nghiệp vụ, chính sách và mức rủi ro chấp nhận được. “AI-native” không có nghĩa mọi quyết định đều tự động.

### Thao tác thực hành

1. Chọn một thay đổi gần đây, ví dụ thêm bộ lọc đơn hàng.
2. Ghi lại thời gian làm việc và thời gian chờ ở từng giai đoạn. Một giờ viết mã nhưng ba ngày chờ review là hai loại thời gian khác nhau.
3. Xác định điểm nghẽn lớn nhất: ý tưởng thiếu rõ ràng, AI hay sai quy ước, kiểm thử khó chạy hay review chậm.
4. Chọn một cách áp dụng không có điều kiện tiên quyết: tạo intent, dùng Plan Mode, viết `CLAUDE.md`, tạo skill, làm vòng phản hồi hoặc thiết lập hook.
5. Đặt một thước đo trước khi thay đổi. Ví dụ: thời gian từ nêu vấn đề đến có intent được duyệt.
6. Chạy thử trên một nhóm hoặc một repo, rồi so sánh cả tốc độ lẫn chất lượng.

**Prompt bổ sung:**

```text
Đây là thời gian thực tế của một thay đổi gần đây: [...].
Hãy chỉ ra ba điểm chờ lớn nhất trong sáu giai đoạn SDLC.
Đề xuất một thử nghiệm nhỏ trong hai tuần, kèm đầu ra và thước đo.
Không giả định rằng viết mã là điểm nghẽn chính.
```

### Thứ tự phụ thuộc cần hiểu

Theo sơ đồ khóa học, sáu cách áp dụng nền tảng nêu trên có thể bắt đầu độc lập. Sau đó:

- `CLAUDE.md` tạo nền cho các phiên song song; vòng phản hồi giúp giảm công giám sát.
- `CLAUDE.md` và vòng phản hồi tạo nền cho eval.
- Intent cùng skill tạo nền cho yêu cầu và thiết kế.
- Sơ đồ đặt review PR sau eval và subagent; trang bài review còn nhấn mạnh `CLAUDE.md`, policy skill khi cần và các subagent đã định nghĩa.
- Review PR cùng hook tạo nền cho CI/CD.
- CI/CD cùng intent tạo nền cho vòng vận hành khép kín.

Đây là quan hệ triển khai, không phải yêu cầu phải học theo thứ tự đó. Đọc bài 3 trước bài 6 vẫn được; áp dụng bài 3 có chính sách tự động thì cần chuẩn bị skill.

**Đầu ra:** Một điểm nghẽn, một thử nghiệm và một chỉ số ban đầu.  
**Lỗi dễ mắc:** Mở nhiều agent trước khi có cách kiểm tra kết quả hoặc đủ người review.

<a id="bai-02"></a>
## Bài 2 — Biến ý tưởng thành intent.md

**Bài gốc:** [Capture as intent.md](https://academy.claude.com/courses/ai-native-sdlc-playbook/capture-intent)

### Giảng dễ hiểu

`intent.md` là bản ghi ngắn về điều bạn muốn đạt được, lý do và giới hạn. Nó giống phiếu yêu cầu sửa nhà: “Tôi cần phòng làm việc yên tĩnh cho hai người” trước khi quyết định mua loại tường nào.

Ý tưởng có thể đến từ khách hàng, ticket, nhân viên hoặc cảnh báo vận hành. AI giúp hỏi cho rõ và viết thành tài liệu; người đưa ý tưởng phải sửa các hiểu lầm, còn chủ sản phẩm quyết định có chuyển tiếp hay không.

### Thao tác thực hành

1. Nhóm kỹ thuật tạo nơi lưu có lịch sử phiên bản. Với một sản phẩm, dùng `intent/order-status/intent.md` ngay trong repo thường dễ quản lý.
2. Thống nhất mẫu: vấn đề, kết quả mong muốn, người/hệ thống liên quan, ràng buộc, câu hỏi chưa rõ.
3. Trong Claude, kể vấn đề bằng ngôn ngữ thường: “Khách gọi hỏi đơn, nhân viên phải mở hệ thống kho”. Đưa số liệu đã biết và đánh dấu số liệu chưa xác minh.
4. Yêu cầu Claude hỏi về phạm vi, nhóm khách, quyền truy cập và dấu hiệu thành công. Trả lời trước khi nhờ viết tài liệu.
5. Nhờ tạo intent theo mẫu. Đọc lại để phát hiện AI đã biến một giả định thành sự thật hoặc tự thêm tính năng.
6. Nhờ chủ sản phẩm rà soát. Những người không dùng Git có thể dùng connector đã được tổ chức thiết lập để tạo bản nháp; việc duyệt vẫn cần được ghi nhận.
7. Commit bản đã chỉnh và dùng PR/review để lưu quyết định chấp nhận hay từ chối theo quy trình của nhóm.

**Prompt bổ sung:**

```text
Khách hàng nhà sách thường gọi để hỏi trạng thái đơn.
Hãy hỏi tôi để làm rõ vấn đề, phạm vi và ràng buộc trước.
Sau đó soạn intent/order-status/intent.md theo mẫu của nhóm.
Thông tin chưa có bằng chứng phải để ở mục Giả định hoặc Câu hỏi mở.
Chưa chọn thư viện, chưa thiết kế endpoint và chưa viết mã.
```

**Mẫu bổ sung:**

```markdown
# Intent: Khách tự xem trạng thái đơn hàng
Người đề xuất: Nhóm chăm sóc khách hàng
Trạng thái: Chờ chủ sản phẩm duyệt

## Vấn đề
Khách phải liên hệ hỗ trợ để biết đơn đang ở bước nào.
Chưa có số liệu đầy đủ về tỷ lệ cuộc gọi chỉ hỏi trạng thái.

## Kết quả mong muốn
Khách đã đăng nhập tự xem trạng thái đơn của chính mình.

## Liên quan
Khách mua sách, nhóm hỗ trợ, website, shop-api, warehouse-core.

## Ràng buộc
- Dùng cơ chế đăng nhập hiện có.
- Không hiển thị thêm địa chỉ hoặc số điện thoại.
- Không vượt giới hạn 30 yêu cầu/giây của hệ thống kho.

## Ngoài phạm vi
Hủy đơn, đổi địa chỉ, theo dõi vị trí xe giao hàng.

## Câu hỏi mở
Đơn mua không đăng nhập có được hỗ trợ ở đợt sau không?
Độ trễ trạng thái bao nhiêu là chấp nhận được?
```

### Đầu ra, người duyệt và cách đo

Đầu ra là intent có người chịu trách nhiệm, lịch sử sửa và quyết định của chủ sản phẩm. Thời điểm tác giả kể ý tưởng cần được ghi lại nếu muốn đo chính xác thời gian từ cuộc trao đổi đầu tiên; Git chỉ biết những gì đã được commit.

Đo thời gian đến bản intent được lưu, tỷ lệ intent được chấp nhận và số lần sửa intent sau khi spec đã bắt đầu. Chấp nhận nhiều chưa chắc tốt nếu tất cả đều mơ hồ.

**Tự kiểm tra:** Người chưa dự cuộc họp có hiểu vấn đề và biết điều gì nằm ngoài phạm vi không?

<a id="bai-03"></a>
## Bài 3 — Tạo yêu cầu và thiết kế

**Bài gốc:** [Requirements and design](https://academy.claude.com/courses/ai-native-sdlc-playbook/requirements-and-design)

### Giảng dễ hiểu

Intent trả lời “muốn gì và vì sao”. Spec trả lời “hệ thống phải làm gì, theo thiết kế nào và làm sao đáp ứng ràng buộc”. AI có thể hỗ trợ làm yêu cầu và thiết kế trong cùng buổi làm việc, dùng chính sách tổ chức làm giới hạn.

Điều quan trọng không phải spec dài, mà là các quyết định có thể kiểm tra. “Trạng thái phải cập nhật nhanh” khó kiểm tra; “dữ liệu cũ tối đa 45 giây” rõ hơn.

### Thao tác thực hành

1. Chuẩn bị intent đã được chấp nhận và các skill về bảo mật, trải nghiệm, thương hiệu hoặc tuân thủ cần áp dụng.
2. Mở phiên Claude có quyền đọc bối cảnh cần thiết. Đưa intent và nêu các chính sách phải dùng.
3. Yêu cầu tạo `spec.md`: yêu cầu đánh số, thiết kế, cách đáp ứng từng ràng buộc, câu hỏi mở và vấn đề cần chủ chính sách quyết định.
4. Với giao diện, tạo bản phác thảo. Khóa gốc nêu luồng từ intent sang Claude Design, lặp trên mock rồi chuyển sang Claude Code. Bạn cũng có thể dùng bản thiết kế đã được nhóm chấp nhận.
5. Kiểm tra các đường đi khó: dữ liệu chưa có, mất kết nối kho, hết phiên đăng nhập, khách cố mở đơn của người khác.
6. Giải quyết xung đột trước. Nếu quy tắc trải nghiệm yêu cầu ngày giao nhưng nghiệp vụ chưa có ngày, chủ sản phẩm và người phụ trách chính sách phải chốt cách hiển thị.
7. Lưu spec cạnh intent, ghi skill hoặc phiên bản chính sách đã dùng. Chủ sản phẩm quyết định chuyển sang xây dựng; thay đổi rủi ro cao cần người phụ trách kỹ thuật tham gia.

**Prompt bổ sung:**

```text
Đọc intent/order-status/intent.md và các policy skill liên quan.
Soạn spec.md với yêu cầu R1, R2... có thể kiểm tra.
Đề xuất thiết kế phù hợp kiến trúc hiện có.
Với mỗi ràng buộc, chỉ ra thiết kế hoặc yêu cầu đáp ứng nó.
Nêu riêng mọi giả định, chính sách xung đột và người cần quyết định.
Không tự coi câu hỏi chưa được trả lời là đã được chấp nhận.
```

**Ví dụ bổ sung về nội dung spec:**

| Mã | Yêu cầu | Cách chứng minh |
|---|---|---|
| R1 | Khách chỉ xem được đơn của mình | Test quyền truy cập giữa hai tài khoản |
| R2 | API trả đúng ba trường đã thống nhất | Test cấu trúc response |
| R3 | Dữ liệu cũ tối đa 45 giây | Test thời hạn cache với đồng hồ giả lập |
| R4 | Không tạo cơ chế đăng nhập mới | Kiểm tra tích hợp middleware hiện có |
| R5 | Thiếu ngày giao vẫn dùng được màn hình | Test trạng thái không có ngày và kiểm tra UI |

Thiết kế minh họa: `OrderStatusPanel → shop-api → warehouse-core`. Trình duyệt không gọi kho trực tiếp. Cần tính giới hạn tải ở phía máy chủ; cache trên trình duyệt riêng lẻ không đủ chứng minh toàn bộ hệ thống luôn dưới 30 yêu cầu/giây.

### Đầu ra, người duyệt và cách đo

Đầu ra là spec được duyệt, có các vấn đề đã giải quyết hoặc được chuyển tiếp rõ ràng. Đo thời gian từ intent đến spec và số lần sửa yêu cầu sau khi đã bắt đầu lập kế hoạch triển khai. Sửa nhiều có thể cho thấy đã chuyển sang viết mã khi câu hỏi còn quá lớn.

<a id="bai-04"></a>
## Bài 4 — Lập kế hoạch trước khi sửa mã

**Bài gốc:** [Claude Code plan mode as the default starting point](https://academy.claude.com/courses/ai-native-sdlc-playbook/plan-mode)

### Giảng dễ hiểu

Spec là bản thiết kế ngôi nhà; plan là trình tự thi công, phần nào sửa trước và kiểm tra bằng cách nào. Plan Mode cho phép khảo sát và lập kế hoạch trước khi cho phép sửa mã triển khai.

Một kế hoạch tốt khiến bạn phát hiện hướng đi sai khi chi phí thay đổi còn thấp. “Thêm API rồi sửa UI” còn quá chung; kế hoạch nên chỉ ra tệp, thứ tự, rủi ro và bằng chứng hoàn thành.

### Thao tác thực hành

1. Trong terminal, chuyển vào thư mục gốc dự án.
2. Mở Claude Code ở Plan Mode. Cách khởi động đã đối chiếu với [CLI reference](https://code.claude.com/docs/en/cli-reference):

   ```bash
   claude --permission-mode plan
   ```

3. Yêu cầu đọc intent, spec và mã hiện có rồi đề xuất kế hoạch. Nếu chưa có spec, nêu rõ đang làm từ intent và yêu cầu chỉ ra khoảng trống.
4. Hỏi tiếp: bước nào rủi ro nhất, tính năng cũ nào có thể hỏng, phương án khác là gì, cần test nào trước khi sửa.
5. Đọc từng tệp dự kiến thay đổi. Đảm bảo kế hoạch nối được với các mã yêu cầu trong spec.
6. Chấp nhận kế hoạch theo giao diện Claude Code. Khi được phép ghi, yêu cầu lưu nội dung đã duyệt thành `plan.md` và commit theo quy trình dự án. Không yêu cầu Plan Mode sửa mã triển khai để “tiện tay làm luôn”.
7. Cho triển khai. Nếu phát hiện phải đổi hướng, cập nhật kế hoạch cùng thay đổi mã để review không dựa trên tài liệu cũ.

**Prompt bổ sung:**

```text
Đọc intent/order-status/intent.md và spec.md, sau đó khảo sát repo.
Chỉ lập kế hoạch, chưa sửa mã triển khai.
Nêu file dự kiến thay đổi, thứ tự, yêu cầu R1-R5 liên quan,
rủi ro, phương án thay thế và kiểm tra chứng minh mỗi bước.
Hỏi tôi những quyết định còn thiếu trước khi chốt.
```

**Khung plan bổ sung:**

```markdown
# Plan: Màn hình trạng thái đơn
## Phạm vi sửa
- API: thêm route theo pattern hiện có, tái sử dụng auth.
- UI: thêm panel và các trạng thái tải/lỗi/thiếu ngày.
- Tests: thêm tình huống quyền sở hữu, response và cache.

## Thứ tự
1. Xác định middleware và cơ chế cache sẵn có.
2. Viết kiểm tra cho R1, R2, R3.
3. Thực hiện API, sau đó UI cho R4, R5.
4. Kiểm tra luồng mới và các luồng đơn hàng lân cận.

## Rủi ro
Cache sai khóa có thể lộ trạng thái đơn giữa hai khách.
Tải tổng vào kho phải được đo, không suy từ một trình duyệt.

## Bằng chứng
Kết quả test, build, lint; ảnh UI; kết quả kiểm tra tải phù hợp.
```

### Auto Mode và hệ thống cũ

Khóa học đề xuất tăng tự chủ cho việc thường lệ khi đã có spec rõ, phạm vi ảnh hưởng nhỏ, test tốt và các lớp kiểm soát. Auto Mode không thay thế người duyệt rủi ro hay cổng phát hành.

Nếu tổ chức đang dùng Jira, công cụ quản lý yêu cầu hoặc hệ thống duyệt thay đổi, cần chỉ định nơi giữ bản chính cho từng loại tài liệu. Có thể chọn Git làm bản chính và ticket trỏ tới commit, hoặc công cụ cũ làm bản chính và Markdown là bản làm việc. Khi đang chuyển đổi, ít nhất phải liên kết mã ticket với commit SHA và quy định cách xử lý khi hai bản khác nhau.

**Đầu ra:** Plan đã được kỹ sư duyệt, có khả năng truy vết sang spec.  
**Đo:** Thời gian từ duyệt plan đến merge, số vòng làm lại và tỷ lệ diff cuối vẫn phù hợp plan.

<a id="bai-05"></a>
## Bài 5 — Viết CLAUDE.md cho dự án

**Bài gốc:** [The CLAUDE.md](https://academy.claude.com/courses/ai-native-sdlc-playbook/claude-md)

### Giảng dễ hiểu

`CLAUDE.md` giống tờ hướng dẫn ngày đầu cho một kỹ sư mới: chạy dự án thế nào, kiến trúc có luật gì, lỗi nào nhóm hay gặp. Nó đưa tri thức quan trọng vào bối cảnh làm việc của Claude thay vì để trong trí nhớ một người.

Không nên nhét mọi tài liệu vào đây. Tài liệu càng dài, cũ hoặc mâu thuẫn thì càng khó giúp agent làm đúng.

### Thao tác thực hành

1. Mở Claude Code tại repo rồi nhập `/init` để tạo bản khởi đầu từ dự án.
2. Đọc và xác minh các lệnh được đề xuất. Lệnh test tưởng đúng nhưng thực tế không chạy test sẽ làm các bước sau mất giá trị.
3. Giữ các phần thiết yếu: build, test, lint, cách chạy; ranh giới kiến trúc; quy ước ảnh hưởng tính đúng; lỗi lặp lại.
4. Cắt phần giải thích dài đã có nơi khác. Khóa học gợi ý giữ dưới một trang như quy tắc biên tập thực dụng.
5. Lưu tại gốc repo và review thay đổi như mã nguồn.
6. Khi Claude sai cùng một việc hai lần, cân nhắc thêm chỉ dẫn cụ thể. Đồng thời xem vấn đề có cần kiểm tra bằng hook/CI thay vì chỉ nhắc bằng văn bản hay không.
7. Khi kiến trúc đổi, cập nhật hướng dẫn ngay trong thay đổi liên quan.

**Mẫu bổ sung:**

```markdown
# Nhà sách trực tuyến
## Lệnh đã xác minh
- Test: npm test
- Build: npm run build
- Lint: npm run lint

## Ranh giới kiến trúc
- web/ chỉ gọi shop-api/, không gọi warehouse-core trực tiếp.
- intent/<ten-thay-doi>/ chứa intent.md, spec.md, plan.md.
- API kiểm tra quyền sở hữu đơn trước khi trả trạng thái.

## Quy ước
- Ngày qua API dùng ISO 8601; UI tự định dạng khi hiển thị.
- Không có ngày giao là tình huống hợp lệ.
- Cache phải tách theo người dùng và đơn hàng.

## Lỗi cần tránh
- Không ghi toàn bộ request/response hoặc dữ liệu khách vào log.
- Không tự đổi phiên bản dependency ngoài phạm vi đã duyệt.

## Hoàn thành
Chạy kiểm tra phù hợp và báo kết quả thực tế, kể cả phần chưa chạy.
```

Các lệnh `npm` trên chỉ là ví dụ cho repo có script tương ứng; không phải repo nào cũng dùng Node.js.

**Đầu ra:** Một hướng dẫn ngắn, đúng và có chủ sở hữu.  
**Đo:** Số lần agent lặp lỗi đã có hướng dẫn; thời gian một thành viên mới có PR đầu tiên được merge.  
**Tự kiểm tra:** Một kỹ sư mới có thể chạy kiểm tra mà không phải hỏi người cũ không?

<a id="bai-06"></a>
## Bài 6 — Đóng gói tri thức bằng skill

**Bài gốc:** [Skills as institutional knowledge](https://academy.claude.com/courses/ai-native-sdlc-playbook/skills-as-institutional-knowledge)

### Giảng dễ hiểu

Skill là hướng dẫn chuyên biệt dùng lại cho một nhóm nhiệm vụ: kiểm tra API, tạo thiết kế đúng thương hiệu hoặc viết tài liệu theo chuẩn tổ chức. Nó cần nêu lúc nào áp dụng và khi áp dụng thì làm gì.

| Bạn muốn truyền đạt điều gì? | Chỗ đặt hợp lý |
|---|---|
| Lệnh test, cấu trúc repo, luật kiến trúc dùng thường xuyên | `CLAUDE.md` |
| Quy trình kiểm tra API áp dụng khi đụng đến API | Skill |
| Yêu cầu một lần cho thay đổi hiện tại | Prompt, intent, spec hoặc plan |
| Điều phải được kiểm tra bằng cơ chế thực thi | Hook, CI và/hoặc kiểm soát ở hệ thống đích |

Skill là lớp hướng dẫn. Việc có một câu “không được lộ dữ liệu” không tự chứng minh mọi thay đổi đều an toàn.

### Thao tác thực hành

1. Chọn một chính sách đang áp dụng không đều. Ví dụ: API liên quan đơn hàng phải kiểm tra quyền sở hữu.
2. Xác định người phụ trách chính sách và tài liệu chính thức. Không lấy ý kiến tạm của AI làm chính sách mới.
3. Tạo `.claude/skills/order-api-policy/SKILL.md`.
4. Viết phần mô tả đủ rõ để Claude nhận biết khi tạo, sửa hoặc review API đơn hàng đều cần dùng skill.
5. Viết thân bài thành hành động kiểm tra được, có đầu ra mong đợi. Nếu gọi script thì script phải tồn tại và hoạt động trong repo.
6. Thử nhiều cách yêu cầu: “thêm route”, “review API”, “sửa lỗi xem đơn”. Xác nhận skill thực sự được nạp, không chỉ nhìn câu trả lời có vẻ giống chính sách.
7. Thử cả một nhiệm vụ không liên quan để tránh skill kích hoạt tràn lan.
8. Commit skill, nhờ chủ chính sách duyệt và có thể phân phối qua plugin của tổ chức. Cập nhật skill cùng lúc chính sách thay đổi.

**Ví dụ skill bổ sung để học cấu trúc:**

```markdown
---
name: order-api-policy
description: Kiểm tra chính sách API đơn hàng. Dùng khi tạo, sửa hoặc review endpoint đơn hàng, hoặc mô tả API tương ứng.
---

# Kiểm tra API đơn hàng
1. Xác định cơ chế xác thực đang được dự án sử dụng.
2. Kiểm tra quyền sở hữu đơn, kể cả đường đi trả dữ liệu từ cache.
3. Chỉ trả các trường đã được spec chấp nhận.
4. Kiểm tra response và log không làm lộ dữ liệu khách.
5. Chỉ ra test cho truy cập chéo tài khoản và trường hợp thiếu ngày giao.
6. Báo phát hiện kèm vị trí và bằng chứng; đánh dấu điều chưa xác minh.
```

### Hook trong giai đoạn xây dựng

Khóa học mở rộng bài này sang hook: sau khi sửa tệp, có thể chạy formatter hoặc kiểm tra chính sách nhanh; trước hành động, có thể chặn thao tác vào đường dẫn được bảo vệ.

Phải hiểu thời điểm: `PostToolUse` chạy sau thao tác nên không hoàn tác được lần sửa đã xảy ra. Hook chỉ khớp `Edit|Write` cũng không bắt lần shell tự ghi lại tệp. Vì vậy khóa học chạy lại kiểm tra chính sách như một check bắt buộc ở PR. Đây cũng là hành vi được mô tả trong [Hooks reference](https://code.claude.com/docs/en/hooks).

Với ví dụ nhà sách, bạn có thể kiểm tra nhanh tệp API sau mỗi sửa, nhưng vẫn cần test quyền sở hữu và CI cho toàn bộ diff. Kiểm tra nặng không nên chạy sau mọi lần gõ nhỏ nếu nó làm vòng làm việc chậm hẳn.

**Đầu ra:** Skill đúng chính sách, kích hoạt đúng và có người duyệt.  
**Đo:** Thời gian đưa cập nhật chính sách vào skill; số phát hiện review về cùng chính sách. Nếu lỗi không giảm, kiểm tra cả điều kiện kích hoạt lẫn nội dung skill.

<a id="bai-07"></a>
## Bài 7 — Phiên song song và subagent

**Bài gốc:** [Parallel sessions and subagents](https://academy.claude.com/courses/ai-native-sdlc-playbook/parallel-sessions-and-subagents)

### Giảng dễ hiểu

Hai khái niệm này giải quyết hai việc khác nhau:

| Khái niệm | Cách hình dung | Phù hợp với |
|---|---|---|
| Phiên song song | Hai bàn làm việc độc lập, mỗi bàn có một bản checkout | Hai nhiệm vụ đủ độc lập |
| Subagent | Một chuyên viên được giao việc hẹp trong một phiên | Đọc mã, tìm hiểu hoặc kiểm chứng có phạm vi rõ |

Mỗi phiên độc lập không tự biết phiên kia đã quyết định gì. Người điều phối phải chia việc và review. Subagent có bối cảnh riêng nên tránh làm đầy cuộc trò chuyện chính bằng quá nhiều chi tiết, nhưng cần nhận nhiệm vụ và giới hạn rõ ràng.

### Thao tác thực hành

1. Chuẩn bị `CLAUDE.md` dùng chung và các lệnh kiểm tra. Vòng phản hồi càng tốt thì càng ít cần theo dõi từng thao tác.
2. Đọc plan để phân chia công việc theo vùng tệp. Việc cùng sửa một module nên làm tuần tự hoặc có giao diện đã thống nhất.
3. Ví dụ: một phiên chuẩn bị tài liệu sử dụng màn hình, phiên khác xây API. Nếu UI và API đều cần sửa schema chung, chốt schema trước rồi mới tách.
4. Mở hai terminal và tạo phiên với worktree riêng:

   ```bash
   # Terminal A
   claude --worktree order-status-api

   # Terminal B
   claude --worktree order-status-guide
   ```

5. Giao cho mỗi phiên phạm vi, đầu ra, phần không được chạm vào và kiểm tra cần chạy. Đừng chỉ bảo “làm nửa còn lại”.
6. Với việc kiểm chứng lặp lại, định nghĩa subagent trong `.claude/agents/`. Giao nó kiểm tra và báo lại, không tự sửa nếu vai trò là đánh giá độc lập.
7. Khi từng nhánh xong, đọc báo cáo và diff. Tích hợp theo quy trình Git của nhóm, giải quyết xung đột rồi chạy kiểm tra tích hợp.
8. Bắt đầu với hai hoặc ba phiên như khóa học gợi ý. Chỉ tăng khi bạn vẫn review kịp và chất lượng không giảm.

**Ví dụ định nghĩa subagent bổ sung:**

```markdown
---
name: order-flow-verifier
description: Kiểm chứng luồng trạng thái đơn sau khi triển khai tính năng.
tools: Read, Bash
---

Đọc plan và hướng dẫn chạy trong CLAUDE.md.
Chạy kiểm tra có sẵn cho luồng mới và luồng lịch sử đơn hàng liên quan.
Kiểm tra truy cập đơn của tài khoản khác bị từ chối.
Không sửa tệp. Báo lệnh đã chạy, kết quả, sai khác và điều chưa kiểm tra được.
Nếu không có công cụ duyệt web, không tuyên bố đã nhìn giao diện.
```

### Điểm cần kiểm tra

Worktree tách tệp và nhánh Git; nó không tự tách database, cổng mạng hoặc dịch vụ bên ngoài. Hai phiên cùng chạy ứng dụng cần dùng cấu hình môi trường phù hợp để không giẫm lên nhau.

Hook và permission dùng chung giúp các phiên tuân theo cùng ranh giới. Quyền công cụ của subagent cũng cần đúng với nhiệm vụ; một người đọc mã không cần quyền phát hành.

**Đầu ra:** Các thay đổi độc lập, mỗi thay đổi có bằng chứng kiểm tra và đã được tích hợp.  
**Đo:** Số việc merge mỗi tuần đi kèm tỷ lệ làm lại; đếm số phiên đơn thuần không đo được hiệu quả.  
**Tự kiểm tra:** Nếu mở thêm hai phiên, bạn có đủ thời gian đọc kết quả của chúng không?

<a id="bai-08"></a>
## Bài 8 — Cho AI vòng phản hồi

**Bài gốc:** [Give Claude a feedback loop](https://academy.claude.com/courses/ai-native-sdlc-playbook/give-claude-a-feedback-loop)

### Giảng dễ hiểu

Nếu bạn chỉ nói “làm cho đúng” mà AI không có cách biết đúng hay sai, nó dễ dừng ở một lời giải thích nghe hợp lý. Vòng phản hồi là chu trình:

```text
Thực hiện → chạy kiểm tra → đọc lỗi → sửa → chạy lại → báo bằng chứng
```

Test kiểm tra hành vi; build phát hiện lỗi đóng gói/biên dịch; lint kiểm tra quy tắc; ảnh giao diện giúp kiểm tra thứ mà test logic không nhìn thấy.

Vòng phản hồi diễn ra nhiều lần trong lúc làm. Verifier subagent là một cách thực hiện lượt kiểm tra cuối bằng bối cảnh mới, không thay thế các kiểm tra trong quá trình.

### Thao tác thực hành

1. Chuẩn hóa cách chạy: một lệnh cho nhóm test cần thiết, một lệnh build, một lệnh lint. Lỗi phải trả mã thoát khác 0.
2. Ghi các lệnh đúng và dấu hiệu thành công trong `CLAUDE.md`.
3. Giao mục tiêu quan sát được: “khách A không đọc được đơn của khách B”, “thiếu ngày vẫn có nội dung”, “response đúng ba trường”.
4. Nếu sửa bug, tái hiện bug bằng test trước. Chạy để thấy nó thất bại đúng nguyên nhân, không phải do thiếu thư viện hoặc sai môi trường.
5. Lưu test đã xác nhận. Chỉ sau đó cho sửa mã để test qua. Với tác vụ này, bảo vệ test đã dùng làm bằng chứng bằng hook hoặc review diff.
6. Với UI, cho Claude công cụ nhìn ứng dụng và bản thiết kế. Yêu cầu mở màn hình, chụp ảnh, đối chiếu và chỉnh. Nếu không có công cụ đó thì ghi rõ chưa kiểm tra bằng mắt.
7. Chạy lại các kiểm tra liên quan sau sửa; báo lệnh, kết quả và giới hạn thay vì chỉ nói “đã hoàn thành”.
8. Đưa bằng chứng vào PR hoặc check run để người review không phải tin vào lời khẳng định của agent.

**Prompt sửa lỗi bổ sung:**

```text
Lỗi: khi API trả expected_delivery = null, panel bị trắng.
Trước tiên tạo test tái hiện và chạy để xác nhận lỗi đúng nguyên nhân.
Hãy dừng để tôi kiểm tra test đó.
Sau khi test được chốt, sửa mã triển khai để test qua;
không xóa, bỏ qua hay làm yếu test đã chốt.
Kiểm tra thêm trường hợp có ngày và trường hợp API lỗi.
Báo bằng chứng đã chạy và điều chưa kiểm tra.
```

### Một kết quả tốt trông thế nào?

**Ví dụ bổ sung, không phải kết quả đã chạy:**

```text
Trước sửa: test empty_delivery_date thất bại vì panel không có nội dung.
Sau sửa: test đó và các test trạng thái liên quan đều qua.
Build và lint: qua theo lệnh của repo.
UI: đã kiểm tra có ngày, chưa có ngày và lỗi tải dữ liệu.
Chưa kiểm tra: tải đồng thời lên hệ thống kho thật.
```

Việc bảo vệ test ở đây phục vụ một lần sửa bug có test tái hiện đã chốt. Không nên hiểu thành “test không bao giờ được sửa”: khi yêu cầu hợp lệ đổi, test cũng cần đổi và được review thích hợp.

**Đầu ra:** Kết quả có thể kiểm tra lại.  
**Người duyệt:** Code owner xem bằng chứng, ý định và rủi ro.  
**Đo:** Tỷ lệ CI qua ở lần đầu, thời gian review, tỷ lệ thay đổi gây lỗi. “Test xanh” chỉ có giá trị trong phạm vi hành vi test thật sự bao phủ.

<a id="bai-09"></a>
## Bài 9 — Đánh giá agent liên tục bằng eval

**Bài gốc:** [Continuous evals in CI](https://academy.claude.com/courses/ai-native-sdlc-playbook/continuous-evals-in-ci)

### Giảng dễ hiểu

Test ứng dụng hỏi: “Mã hiện tại có chạy đúng không?”. Eval hỏi thêm: “Với model và hướng dẫn hiện tại, agent có xử lý nhiệm vụ đúng chuẩn không?”.

Bạn rút gọn `CLAUDE.md`, đổi skill hoặc đổi model; ứng dụng chưa thay đổi nhưng cách AI thực hiện nhiệm vụ tiếp theo có thể thay đổi. Eval dùng lại các nhiệm vụ thật để phát hiện suy giảm này.

Hình dung một bài thi lái xe: cùng tuyến đường và tiêu chí, nhưng thay người lái hoặc hướng dẫn. Bạn đang đánh giá cách hoàn thành nhiệm vụ, không chỉ kiểm tra chiếc xe.

### Thao tác thực hành

1. Có `CLAUDE.md`, vòng phản hồi và CI chạy được Claude không tương tác, kèm ngân sách gọi model.
2. Gom khoảng 20–50 nhiệm vụ thực tế có kết quả đã được chấp nhận như khóa học gợi ý. Để học cơ chế, có thể làm thử vài ca trước rồi mở rộng.
3. Với mỗi nhiệm vụ, ghi mã nguồn đầu vào ở commit nào, prompt, phạm vi tệp được sửa và các kiểm tra chấp nhận.
4. Tạo checkout sạch tại commit trước khi nhiệm vụ được giải quyết. Nếu bắt đầu ở mã đã sửa xong, bài đánh giá không còn đúng câu hỏi ban đầu.
5. Áp dụng cấu hình agent đang muốn đánh giá: `CLAUDE.md`, skill và hook của nhánh mới. Giữ bộ chấm bên ngoài vùng agent được phép sửa.
6. Chạy agent, sau đó dùng bộ chấm độc lập kiểm tra: có lỗi thực thi không, có sửa ngoài phạm vi không, test/lint/policy có qua không.
7. Chạy theo lịch và khi cấu hình thay đổi; đặt điều kiện merge cho cấu hình. Khi đổi model/prompt, cũng dùng lại suite để so sánh.
8. Nếu điểm giảm, đọc từng ca thất bại rồi quyết định; đừng chỉ hạ ngưỡng để merge.
9. Biến mỗi sự cố thật thành ca eval hồi quy. Cập nhật ca quá dễ hoặc không còn đại diện khi hệ thống thay đổi.

**Mẫu mô tả eval bổ sung — định dạng do nhóm tự xây, không phải chuẩn có sẵn của Claude:**

```json
{
  "name": "order-debug-without-customer-data",
  "start_commit": "<commit-truoc-thay-doi>",
  "task": "Them log de dieu tra loi truy van trang thai don",
  "allowed_paths": ["shop-api/routes", "shop-api/tests"],
  "acceptance": [
    "existing tests still pass",
    "lint passes",
    "no modification outside allowed paths",
    "logs contain no complete response or customer details",
    "authorization behavior is preserved"
  ]
}
```

Bạn cần tự viết runner và các kiểm tra thực thi cho định dạng này. Một file JSON liệt kê tiêu chí không tự chạy được eval.

### Giảng thêm các mục mở rộng của bài gốc

**Bộ chấm `check.sh`:** Khóa học minh họa việc chấm từ một bản sao được tạo trước khi agent chạy. Nó xem agent có kết thúc hợp lệ, có sửa tệp ngoài danh sách cho phép, rồi thực thi từng check và tổng hợp PASS/FAIL. Nó kiểm tra phạm vi lần nữa sau khi chạy check để phát hiện kiểm tra cũng làm thay đổi tệp ngoài ý muốn.

Ý nghĩa thực hành: agent không được qua bài bằng cách sửa Makefile, bỏ check hoặc viết lại tiêu chí chấm. Bản sao ngoài checkout giúp tách người làm bài với đề và bộ chấm; cách tách thực tế còn phải được củng cố bằng quyền của runner.

**Kiểm tra log `log_bodies.py`:** Bài gốc dùng dữ liệu khách giả, gọi endpoint và thu các dòng log. Nó phát hiện việc ghi toàn bộ response theo các biểu diễn đã xét, không phụ thuộc tên biến trong mã.

Giới hạn được bài nêu rõ: kiểm tra toàn bộ response không đồng nghĩa bắt được mọi trường nhạy cảm bị log riêng. Ví dụ log riêng ô “ghi chú giao hàng” vẫn có thể lộ số điện thoại nếu ô đó chứa văn bản tự do. Bài tập nhà sách cần kiểm tra hành vi đó riêng.

**Không dùng `--bare` khi đang đánh giá các cấu hình mà chế độ đó bỏ qua.** Nếu suite nhằm kiểm tra `CLAUDE.md`, skill và hook nhưng chạy agent không nạp chúng, kết quả không trả lời đúng câu hỏi. Ý nghĩa cờ có trong [CLI reference](https://code.claude.com/docs/en/cli-reference).

### Đầu ra và cách đo

Đầu ra là bộ nhiệm vụ có thể chạy lại, tiêu chí chấm đáng tin và lịch sử kết quả theo phiên bản cấu hình/model. Đo tỷ lệ qua, chi phí, thời gian chạy, thời gian từ sự cố đến có eval và lỗi bị chặn ở CI so với lỗi lọt ra vận hành.

Đừng đưa số điện thoại hoặc dữ liệu khách thật vào ca thử nếu dữ liệu giả đã đủ tái hiện hành vi. Với bài tập này, toàn bộ thông tin khách đều là giả lập.

<a id="bai-10"></a>
## Bài 10 — AI trong quy trình review PR

**Bài gốc:** [AI in the PR review loop](https://academy.claude.com/courses/ai-native-sdlc-playbook/ai-in-the-pr-review-loop)

### Giảng dễ hiểu

AI có hai vai trò: review thay đổi được gửi lên, và sửa các nhận xét trên PR mà nó thực hiện. Người review có thể dành nhiều chú ý hơn cho “thay đổi có đúng ý định và rủi ro có chấp nhận được không?”.

Review nên thành các lượt rõ ràng. Một lượt tìm lỗi logic, một lượt bảo mật, một lượt đối chiếu spec/plan. Nếu không đọc plan, reviewer có thể không biết cache là yêu cầu quan trọng của thiết kế.

### Thao tác thực hành

1. Chuẩn bị `CLAUDE.md`, các policy skill cần thiết và định nghĩa subagent. Dùng eval để biết thay đổi cấu hình review có làm giảm chất lượng không.
2. Chọn cách tích hợp. Khóa học nêu dịch vụ Code Review do quản trị viên bật, hoặc `claude-code-action` chạy trong CI riêng. Tên gọi và tình trạng preview trong khóa là thông tin tại thời điểm đọc, cần đối chiếu sản phẩm khi triển khai.
3. Viết `REVIEW.md` ở gốc repo: các lượt review, mức độ nghiêm trọng, điều nên bỏ qua và giới hạn nhận xét nhỏ.
4. Cấu hình luồng review thực sự đọc file đó. Việc chỉ tạo file không đảm bảo mọi bot review đều tự dùng nó.
5. Đặt branch protection và người phê duyệt. Trong mô hình khóa học, AI đưa phát hiện; code owner vẫn phê duyệt qua quy trình.
6. Gửi PR có liên kết intent, spec, plan và bằng chứng test. Để AI đối chiếu cả hành vi và ràng buộc, không chỉ diff.
7. Xem xét phát hiện trước khi cho sửa. Với integration tương ứng, có thể dùng `@claude` trên review comment để giao việc sửa rồi chạy lại kiểm tra.
8. Sau sửa, kiểm tra lại diff và các nhận xét chưa giải quyết. Không để vòng tự sửa tự biến thành quyền tự phê duyệt.
9. Khi một lỗi lặp lần hai, đưa bài học vào hướng dẫn thích hợp. Định kỳ xem xét nhận xét sai và giới hạn nhiễu do các lỗi nhỏ.

**Mẫu REVIEW.md bổ sung:**

```markdown
# Hướng dẫn review nhà sách
## Các lượt
- Logic: quyền xem đơn, cache, dữ liệu thiếu và xử lý lỗi.
- Bảo mật: truy cập chéo tài khoản, dữ liệu khách trong log.
- Đúng yêu cầu: đối chiếu R1-R5 và plan của thay đổi.

## Mức độ
- Important: sai hành vi, lộ dữ liệu, vi phạm ràng buộc đã duyệt.
- Nit: cải thiện nhỏ không ảnh hưởng tính đúng.

## Báo cáo
Mỗi phát hiện có vị trí, tình huống gây lỗi và ảnh hưởng.
Giới hạn ba nit; không lặp lại vấn đề formatter đã kiểm tra.
Bỏ qua tệp sinh tự động nếu không có lý do cụ thể để kiểm tra.
```

**Ví dụ bổ sung:** Panel gửi request mỗi lần render có thể là Important vì phá thiết kế hạn chế tải. Tên biến chưa đẹp thường là Nit. Một test còn thiếu có mức độ nào phải xét theo rủi ro của hành vi chưa được bảo vệ, không gán máy móc.

### Hai cách dùng @claude không nên nhầm

Khóa học phân biệt luồng action xử lý comment và đẩy bản sửa, với lệnh `@claude review` trong dịch vụ review quản lý để yêu cầu review lại. Hãy dùng đúng integration đã cài; cùng cách viết tên không có nghĩa hành vi giống nhau ở mọi nơi.

**Đầu ra:** PR có phát hiện, cách xử lý, bằng chứng kiểm tra và phê duyệt rõ ràng.  
**Đo:** Thời gian đến lượt review đầu, tỷ lệ comment được xử lý qua agent và lỗi lọt qua merge. Số lượng nhận xét không đại diện cho chất lượng review.

<a id="bai-11"></a>
## Bài 11 — Hook làm cổng phê duyệt

**Bài gốc:** [Hooks as approval gates](https://academy.claude.com/courses/ai-native-sdlc-playbook/hooks-as-approval-gates)

### Giảng dễ hiểu

Hook là chương trình chạy tại một sự kiện của Claude Code. Khi dùng làm cổng phê duyệt, nó kiểm tra điều kiện trước khi hành động tiếp tục.

Ví dụ dễ hình dung: bảo vệ ở cửa kho. Bạn có thể giải thích mình muốn vào làm gì, nhưng cửa chỉ mở khi có giấy phép hợp lệ. Prompt mô tả ý định; chương trình kiểm tra giấy phép mới là cổng thực thi.

| Quyết định | Ý nghĩa | Ví dụ trong bài tập |
|---|---|---|
| Allow | Cho thực hiện | Triển khai bản thử lên dev |
| Ask | Hỏi người đang vận hành phiên | Kỹ sư xác nhận triển khai staging từ phiên tương tác |
| Deny | Chặn, nêu đường đi để được duyệt | Production thiếu phiếu duyệt đúng phiên bản |

### Thao tác thực hành

1. Cùng người phụ trách kỹ thuật, quản lý thay đổi và chính sách liệt kê các cổng phải giữ lại: release production, sửa hạ tầng, migration, tệp cần bảo vệ.
2. Xác định bằng chứng chấp thuận ở đâu và ai được ghi. Nếu AI có thể tự sửa bản ghi mà hook đọc thì giấy phép mất ý nghĩa.
3. Viết hook trước hành động, nhận tên công cụ và đầu vào, kiểm tra môi trường, phiên bản và phiếu duyệt.
4. Trả quyết định với lý do cụ thể: thiếu gì, ai có quyền duyệt và thao tác tiếp theo là gì. Chặn mà không giải thích khiến vòng làm việc khó tiếp tục.
5. Hook dùng trong nhóm có thể nằm ở `.claude/settings.json`. Với điều bắt buộc mà người dùng không được tắt, quản trị viên đặt trong managed settings.
6. Kiểm thử ít nhất bốn ca: không có phiếu, phiếu chưa duyệt, phiếu duyệt cho phiên bản khác và phiếu hợp lệ cho đúng phiên bản.
7. Thử đường đi khác ngoài công cụ release. Hệ thống đích và credential cũng phải giới hạn để không có lối triển khai khác bỏ qua cổng.
8. Ghi quyết định, thời gian và người duyệt để truy vết sau này.

**Logic bổ sung dạng mã giả, không phải script chạy trực tiếp:**

```text
khi chuẩn bị release:
  nếu môi trường là dev:
    cho phép
  nếu môi trường là staging:
    nếu là pipeline đáng tin từ thay đổi đã được merge duyệt:
      cho phép theo chính sách staging
    ngược lại:
      hỏi kỹ sư đang chạy phiên
  nếu môi trường là production:
    đọc phiếu từ hệ thống phê duyệt độc lập
    chỉ cho phép khi trạng thái đã duyệt và phiên bản trùng khớp
  nếu không xác định môi trường:
    chặn và yêu cầu bổ sung quy tắc
```

### Những chi tiết triển khai bài gốc muốn bạn chú ý

- Matcher ví dụ bắt tên công cụ release của các MCP server theo môi trường.
- Script kiểm tra phiếu là chương trình của hệ thống quản lý thay đổi; tên CLI trong ví dụ không phải phần mềm tự có khi cài Claude.
- `ask` cần có người trả lời. Với job chạy không tương tác, bài học dùng tuyến đã được duyệt trước hoặc chặn; không để job chờ một người không tồn tại trong phiên.
- Ví dụ staging tin vào biến môi trường của pipeline. Biến do người dùng tự đặt không phải bằng chứng mạnh về nguồn chạy; khi triển khai thật cần gắn sự tin cậy với danh tính và quyền của runner.
- Production phải kiểm tra đúng phiên bản, tránh dùng một phiếu đã duyệt cho thay đổi khác.

### Managed settings cho tổ chức

Phần này của khóa học giải thích một cấu hình quản trị tập trung. Không cần nhớ cả JSON; cần hiểu mỗi nhóm kiểm soát giải quyết việc gì:

| Nhóm | Mục đích và điều cần triển khai |
|---|---|
| Permission allow/deny | Cho vòng build/test cần thiết, chặn đường truy cập không phù hợp |
| Không cho mở rộng quy tắc tại máy cá nhân | Ngăn cấu hình dự án/người dùng tự nới ranh giới quản trị |
| Sandbox tệp và mạng | Giới hạn hành vi của tiến trình, kể cả shell; tắt WebFetch riêng lẻ không đủ chặn shell ra mạng |
| Cô lập credential | Không để chương trình con đọc tệp khóa hoặc nhận biến môi trường bí mật ngoài nhu cầu |
| Chỉ dùng hook quản trị | Cổng bắt buộc nằm trong cấu hình quản trị; hook ở dự án có thể không được chạy khi chế độ này bật |
| Plugin và marketplace được duyệt | Quản lý nguồn cung cấp skill, agent và các thành phần mở rộng |
| MCP được duyệt | Chỉ cung cấp các server/công cụ mà tổ chức cho phép |
| Phiên bản tối thiểu | Dùng phiên bản đã được đánh giá và có hỗ trợ các khóa cấu hình cần thiết |

Các khóa cụ thể và mức ưu tiên cần đối chiếu [Settings reference](https://code.claude.com/docs/en/settings) khi áp dụng. Không lấy cấu hình mẫu của một doanh nghiệp làm cấu hình phổ quát cho máy cá nhân.

**Đầu ra:** Cổng đã được thử cả trường hợp hợp lệ và không hợp lệ, có bằng chứng phê duyệt độc lập.  
**Đo:** Thời gian chờ từng cổng và số vi phạm đi tới production. Giảm số lần hỏi không quan trọng bằng giữ đúng những quyết định cần người có trách nhiệm.

<a id="bai-12"></a>
## Bài 12 — Đưa AI vào CI/CD

**Bài gốc:** [CI/CD integration and deployment](https://academy.claude.com/courses/ai-native-sdlc-playbook/ci-cd-integration-and-deployment)

### Giảng dễ hiểu

CI chạy kiểm tra khi mã thay đổi. CD tự động hóa phần đưa phiên bản đã chuẩn bị tới môi trường sử dụng. Script thông thường làm tốt các bước xác định sẵn; Claude có thể hỗ trợ các bước cần đọc và suy xét như phân loại lỗi build, giải thích test chập chờn hoặc soạn ghi chú phát hành.

Hãy tăng tự động hóa theo thứ tự: đọc và giải thích → đề xuất thay đổi qua PR → triển khai vào môi trường được phép. Khóa học đặt review và cổng phê duyệt trước CI/CD để không tăng tốc qua một cổng chưa tồn tại.

### Thao tác thực hành

1. Chọn tác vụ chỉ đọc đầu tiên, chẳng hạn đọc file log build thất bại. Xác định chính xác đầu vào và nơi lưu báo cáo.
2. Cấu hình model access mà tổ chức chấp nhận: API hoặc hạ tầng cloud được khóa học đề cập như Bedrock, Vertex AI hay Microsoft Foundry. Quản lý secret trong hệ thống CI thay vì đưa vào repo.
3. Chuẩn bị runner/container với repo và log cần đọc. Cấp credential ngắn hạn, đúng phạm vi; không gắn sẵn quyền production vào mọi job.
4. Chạy Claude không tương tác bằng `claude -p`. Giới hạn quyền công cụ, tệp và mạng theo tác vụ. Kiểm tra cả đường đi thất bại.
5. Khi báo cáo đã hữu ích, thêm tác vụ có ghi như sửa lint hoặc tài liệu, nhưng kết quả phải thành nhánh/PR và qua branch protection.
6. Nếu tích hợp deploy qua MCP, cung cấp các công cụ release, status và rollback. Mỗi môi trường dùng server và credential riêng để phân quyền rõ.
7. Bắt đầu ở dev, rồi staging. Với production, agent chuẩn bị release và chỉ đi tiếp khi cổng xác nhận phê duyệt cho đúng phiên bản.
8. Định nghĩa kiểm tra sau phát hành: chờ bao lâu, theo dõi chỉ số nào, ngưỡng nào và trường hợp nào rollback.
9. Diễn tập rollback trong staging, xác nhận phiên bản cũ thực sự hoạt động lại và dữ liệu vẫn tương thích.
10. Lưu phiên bản, kết quả status, quyết định rollback và danh tính chạy job vào báo cáo phát hành.

**Lệnh bổ sung cho bài tập đọc log:**

```bash
claude -p "Đọc out/build.log. Nêu nguyên nhân có bằng chứng, khả năng lỗi chập chờn và kiểm tra tiếp theo. Không sửa tệp." --permission-mode plan
```

Đây là lệnh gọi mẫu, giả định đã có Claude Code, xác thực hợp lệ và tệp log. Với CI cần kiểm soát quyền bằng cấu hình và runner; chỉ câu “không sửa tệp” không phải ranh giới bảo mật.

**Prompt deploy bổ sung để dùng khi đã có công cụ và chính sách tương ứng:**

```text
Triển khai phiên bản đã xác định sang staging bằng công cụ được cấp.
Sau khi rollout xong, đo tỷ lệ lỗi 5xx trong cửa sổ năm phút.
Nếu vượt ngưỡng đã duyệt, gọi rollback theo runbook.
Xác nhận phiên bản đang hoạt động và báo kết quả đo sau rollback.
Không dùng công cụ của môi trường khác.
```

### Vì sao tách MCP server theo môi trường?

Giả sử chỉ có công cụ `release(environment, version)`. Quy tắc cấp quyền theo tên công cụ có thể chưa phân biệt được giá trị `environment`. Bài gốc dùng các tên server riêng để có các công cụ như `mcp__deploy-staging__release` và `mcp__deploy-prod__release`.

| Môi trường | Credential của job | Quyền phát hành minh họa |
|---|---|---|
| Dev | Token chỉ dùng cho dev | Cho phép theo chính sách dev |
| Staging | Token chỉ dùng cho staging | Cho theo nhánh/pipeline đã duyệt hoặc hỏi trong phiên tương tác |
| Production | Danh tính triển khai được kiểm soát | Release phải qua hook kiểm tra phiếu; status/rollback theo runbook đã duyệt |

Không chỉ dựa vào tên tool. Server và nền tảng triển khai cũng phải xác minh credential đúng môi trường. Với cấu hình mẫu của khóa học, `dontAsk` từ chối hành động còn cần hỏi, còn `PreToolUse` có thể cho phép release khi phiếu duyệt hợp lệ. Hãy thử hành vi trên phiên bản và cấu hình thực tế, kể cả lúc hook lỗi hoặc không được nạp.

### Rollback cần được hiểu đúng

Rollback không chỉ là đổi dòng phiên bản. Migration database, thông điệp hàng đợi hoặc định dạng dữ liệu mới có thể khiến bản cũ không còn dùng được. Runbook cần chỉ ra điều kiện được rollback, cách xác minh và khi nào phải chuyển cho người trực.

Khóa học nhấn mạnh một đường rollback đơn giản đã diễn tập trước. Trong bài tập nhà sách, sau khi trả phiên bản cũ, vẫn cần xác nhận tải kho và tỷ lệ lỗi đã hạ xuống, không chỉ xem lệnh trả mã thành công.

**Đầu ra:** Một pipeline có đầu vào, quyền, cổng, kiểm tra sau phát hành và đường hồi phục rõ ràng.  
**Đo:** Tỷ lệ lỗi pipeline được phân loại mà không gọi người; thời gian đưa thay đổi tới sử dụng, mức độ thường xuyên triển khai, tỷ lệ thay đổi gây sự cố và thời gian phục hồi theo cách nhóm định nghĩa các chỉ số DORA.

<a id="bai-13"></a>
## Bài 13 — Khép vòng từ chỉ số vận hành

**Bài gốc:** [Closing the loop on metrics](https://academy.claude.com/courses/ai-native-sdlc-playbook/closing-the-loop-on-metrics)

### Giảng dễ hiểu

Đến đây, vòng làm việc có thể bắt đầu từ hệ thống vận hành: phát hiện bất thường → điều tra → tạo intent → thiết kế → sửa → kiểm tra → review → triển khai.

Phần phát hiện trong ví dụ của khóa học là chương trình xác định, không nhờ model đoán xem đồ thị có “trông lạ” không. Claude được gọi khi quy tắc đã phát hiện một tín hiệu, rồi chỉ được hành động trong các tuyến đã cấp quyền.

Các bước chạy tự động vẫn cần cổng chất lượng giữa chặng. Cổng có thể là kiểm tra xác định hoặc reviewer độc lập; thiếu tự tin thì chuyển người xử lý. Agent tự nói “tôi chắc” không phải cổng độc lập.

### Control band là gì?

Control band là dải quanh mức bình thường của một chỉ số. Trong ví dụ khóa học:

- `μ` là trung bình các số đo trong cửa sổ lịch sử.
- `σ` là độ lệch chuẩn, mô tả mức dao động thông thường.
- Mốc phía trên ở 1σ, 2σ, 3σ lần lượt là `μ + σ`, `μ + 2σ`, `μ + 3σ`.

**Ví dụ số bổ sung:** Tỷ lệ lỗi bình thường là 0,40%, độ lệch chuẩn 0,10 điểm phần trăm. Các mốc trên là 0,50%, 0,60% và 0,70%. Cần thống nhất đơn vị: `0.40` biểu diễn phần trăm khác với tỷ lệ `0.004`.

Khóa học giải thích rằng dưới giả định phân phối chuông ổn định, vượt phía trên 1σ xuất hiện khá thường xuyên; ngay cả vượt 3σ đôi khi cũng do nhiễu. Vì vậy không nên cho một tín hiệu đơn lẻ quyền sửa production tùy ý.

### Thao tác thực hành

1. Chọn một chỉ số có đường nền tương đối ổn định: tỷ lệ lỗi test, lỗi 5xx sau triển khai hoặc thời gian xử lý PR.
2. Lấy lịch sử, ví dụ số đo theo giờ trong 30 ngày. Chốt đơn vị, cách xử lý dữ liệu thiếu và biến động theo giờ/ngày.
3. Viết chương trình tính đường nền và xét quy tắc; lưu trong Git và kiểm thử bằng dữ liệu có kết quả mong đợi.
4. Định nghĩa mức phản ứng trong cấu hình có phiên bản. Mẫu của khóa học là 1σ chỉ ghi log, 2σ gọi Claude điều tra chỉ đọc, 3σ cho đề xuất qua PR hoặc runbook đã được duyệt.
5. Thêm phát hiện trôi chậm: bốn trong năm điểm nằm trên mốc 1σ, hoặc tám điểm liên tiếp trên trung bình. Trong bài gốc, các quy tắc này được xử lý như mức 2σ.
6. Dùng lịch CI, cron hoặc webhook giám sát để gọi chương trình. Tầng điều phối đọc mức và cấp đúng công cụ, không để agent tự nâng quyền.
7. Claude điều tra dựa trên metric, log, thay đổi gần nhất và repo. Nó ghi kết luận cùng bằng chứng thành intent; giả thuyết chưa xác minh phải ghi rõ.
8. Ở mức được hành động, chỉ mở PR vào cổng review hoặc gọi đúng runbook. Không được biến mức 3σ thành quyền sửa tùy ý.
9. Người sở hữu dịch vụ phân loại: sửa ngay, lên lịch hoặc bỏ qua có lý do. Các lần báo giả dùng để tinh chỉnh đường nền/quy tắc.
10. Sau khi sửa và phát hành, xác minh chỉ số hồi phục; thêm test/eval để ngăn lặp lại cùng lớp sự cố.

**Cấu hình bài tập bổ sung — cần tự xây tầng đọc và thi hành:**

```yaml
metric: order_status_5xx_rate
baseline: rolling_30_days_hourly
tiers:
  above_1_sigma:
    action: log
  above_2_sigma:
    action: diagnose_read_only
  above_3_sigma:
    action: propose
    approved_routes:
      - pull_request
      - rollback_order_portal
```

Tên khóa này dùng để minh họa thiết kế của bài tập, không phải file cấu hình mà Claude tự nhận biết.

### Giảng mục mở rộng: script phát hiện

Script Python trong bài gốc đọc một danh sách số đo theo thứ tự thời gian, tách điểm mới nhất khỏi dữ liệu nền rồi tính trung bình và độ lệch chuẩn. Nó có sàn cho sigma để đường nền quá phẳng không làm mọi dao động nhỏ thành sự cố. Chương trình xét quy tắc nặng nhất trước và trả mức cao nhất phù hợp.

Điểm quan trọng khi thực hiện:

1. Chương trình gọi phải đưa đúng cửa sổ 30 ngày; chú thích đầu vào không tự cắt dữ liệu giúp bạn.
2. Script yêu cầu tối thiểu một lượng lịch sử trước điểm mới nhất. Khi thiếu dữ liệu phải báo thiếu, không giả vờ đã có đường nền đáng tin.
3. Ví dụ chỉ xét phía tăng vì đang theo dõi tỷ lệ lỗi. Chỉ số mà giảm mới xấu cần quy tắc khác.
4. Sàn sigma tính theo đơn vị của metric; không sao chép một con số cho mọi thang đo.
5. Đường nền có mùa vụ hoặc thay đổi cấu trúc cần mô hình/quy tắc phù hợp. Đây là điều cần bổ sung khi áp dụng, không phải khả năng mà script ngắn tự giải quyết.

### Kịch bản nhà sách từ đầu đến cuối

**Ví dụ bổ sung:**

1. 10:10, một release vô tình bỏ cache trạng thái.
2. Tải vào kho tăng; `shop-api` bắt đầu trả nhiều lỗi 5xx.
3. Chương trình phát hiện vượt mốc nặng đã cấu hình, ghi số đo, đường nền và thời điểm.
4. Agent đọc diff của release, thấy thay đổi cache và đối chiếu ràng buộc 30 yêu cầu/giây. Nó ghi đây là nguyên nhân nghi vấn, xác minh thêm bằng log/tải kho.
5. Nếu điều kiện runbook đã duyệt được đáp ứng, agent gọi rollback theo quyền đã cấp.
6. Agent kiểm tra phiên bản và metric sau rollback rồi viết intent: bằng chứng, tác động, mục tiêu, giới hạn và việc đã làm.
7. Nhóm quyết định cách vừa cải thiện độ tươi dữ liệu vừa giữ giới hạn tải.
8. Bản sửa qua spec, plan, test và PR review. Eval mới kiểm tra yêu cầu “làm trạng thái nhanh hơn” không khiến agent tùy tiện xóa cơ chế kiểm soát tải.

Không nên chỉ tìm chuỗi `CACHE_SECONDS` để kết luận thiết kế đúng. Kiểm tra chuỗi là cách minh họa đơn giản; bài tập thực tế nên kiểm tra hành vi cache, quyền truy cập và tải có ý nghĩa.

### Sự cố và yêu cầu đến từ kênh trao đổi

Phần cuối bài giới thiệu Claude Tag, được mô tả là public beta trong Slack tại thời điểm trang được đọc. Ý tưởng là Claude tham gia bằng danh tính riêng, nhận sự cố/yêu cầu, điều tra qua công cụ và lưu tiến trình trong luồng trao đổi.

Luồng nhỏ, rõ ràng có thể thành PR; yêu cầu lớn trở thành intent để bắt đầu lại quy trình. Sau khắc phục, agent xác minh metric và ghi bài học có phiên bản. Tích hợp kênh không thay thế phân quyền, người phụ trách trực hoặc cổng review. Khả năng truy cập sản phẩm phụ thuộc triển khai thực tế của tổ chức.

**Đầu ra:** Từ cảnh báo có một hồ sơ điều tra/intent truy vết được, hành động trong đúng quyền và kiểm tra hồi phục.  
**Đo:** Thời gian từ vượt ngưỡng đến intent trong hàng đợi, tỷ lệ đề xuất thành bản sửa đã merge, tỷ lệ báo giả và số sự cố cùng loại lặp lại.

<a id="bai-14"></a>
## Bài 14 — Tổng kết và tài nguyên

**Bài gốc:** [Closing thoughts and resources](https://academy.claude.com/courses/ai-native-sdlc-playbook/closing-thoughts-and-resources)

### Giảng dễ hiểu

Khóa học kết thúc bằng việc nối các mảnh thành một hệ thống: model thực hiện công việc; tài liệu, công cụ, kiểm tra và quyền bao quanh model khiến kết quả có thể sử dụng và kiểm soát được.

Thay đổi lớn trong vai trò con người là chuyển thêm công sức sang định nghĩa ý định, ranh giới, bằng chứng và quyết định khó. Không nên đánh giá thành công bằng số dòng mã AI sinh ra.

### Thao tác sau khóa học

1. Chọn một repo thử nghiệm và người chịu trách nhiệm triển khai cách làm mới.
2. Viết danh sách những gì đã có: test một lệnh, owner cho policy, intent/spec/plan, review, hook và rollback.
3. Chọn một khoảng trống đang gây tốn thời gian hoặc gây lỗi, thay vì triển khai tất cả cùng lúc.
4. Mở tài liệu chính thức tương ứng trong bảng dưới để kiểm tra cấu hình của phiên bản đang dùng.
5. Chốt thử nghiệm nhỏ, người duyệt và chỉ số. Ghi lại kết quả kể cả khi thử nghiệm không cải thiện được tốc độ.
6. Mở rộng sau khi đầu ra đáng tin và người review theo kịp.

### Tài nguyên chính thức được bài kết giới thiệu

Các liên kết dưới đây là tài nguyên triển khai thêm, không phải các bài học thứ 15 trở đi. Tài liệu này đã đọc đủ 14 bài của khóa; không tuyên bố đã giảng toàn bộ mọi trang tài liệu được liên kết ra ngoài.

| Bạn cần làm gì? | Tài liệu |
|---|---|
| Chọn mô hình thiết lập cho tổ chức | [Admin setup](https://code.claude.com/docs/en/admin-setup) |
| Hiểu các tầng cấu hình và mức ưu tiên | [Settings reference](https://code.claude.com/docs/en/settings) |
| Quản lý cấu hình từ console | [Server-managed settings](https://code.claude.com/docs/en/server-managed-settings) |
| Thiết lập quyền | [Permissions](https://code.claude.com/docs/en/permissions) |
| Cô lập tệp và mạng ở mức hệ điều hành | [Sandboxing](https://code.claude.com/docs/en/sandboxing) |
| Thiết lập và tra cứu hook | [Hooks guide](https://code.claude.com/docs/en/hooks-guide), [Hooks reference](https://code.claude.com/docs/en/hooks) |
| Viết skill | [Skills](https://code.claude.com/docs/en/skills) |
| Phân phối qua marketplace riêng | [Plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces) |
| Quản trị bề mặt công cụ | [Managed MCP](https://code.claude.com/docs/en/managed-mcp) |
| Chọn đường truy cập model cho doanh nghiệp | [Third-party integrations](https://code.claude.com/docs/en/third-party-integrations) |
| Cấu hình mạng | [Network configuration](https://code.claude.com/docs/en/network-config) |
| Theo dõi phiên và mức sử dụng | [Monitoring](https://code.claude.com/docs/en/monitoring-usage), [Analytics](https://code.claude.com/docs/en/analytics) |
| Truy xuất hoạt động phục vụ quản trị | [Compliance API](https://platform.claude.com/docs/en/manage-claude/compliance-api) |
| Hiểu mô hình an toàn của sản phẩm | [Security](https://code.claude.com/docs/en/security) |

**Đầu ra:** Một quyết định áp dụng có phạm vi và chủ sở hữu, dựa trên cả hiệu quả lẫn chất lượng.

<a id="thuc-hanh"></a>
## Bài tập tổng hợp: Tự thực hiện một vòng thay đổi

Phần này là bài tập bổ sung của tài liệu, giúp nối các bài lại. Không yêu cầu bạn triển khai production để hoàn thành việc học.

### Chuẩn bị chỗ làm

1. Chọn repo thử nghiệm mà bạn được phép sửa; tạo nhánh theo quy trình của nhóm.
2. Đảm bảo chạy ứng dụng và test hiện có trước khi thêm tính năng, để biết lỗi nào đã tồn tại.
3. Dùng một thư mục riêng cho bộ tài liệu thay đổi:

   ```text
   intent/
     order-status/
       intent.md
       spec.md
       plan.md
   CLAUDE.md
   REVIEW.md
   .claude/
     skills/
       order-api-policy/
         SKILL.md
     agents/
       order-flow-verifier.md
   ```

4. Nếu dự án có cấu trúc khác, giữ cấu trúc dự án và điều chỉnh các đường dẫn trong prompt. Không cần tạo một thư mục mới chỉ vì ví dụ có nó.

### Vòng 1 — Từ vấn đề đến mã có bằng chứng

| Bước | Bạn thao tác | Đầu ra để tự kiểm tra |
|---|---|---|
| 1 | Kể vấn đề khách hỏi trạng thái, trả lời câu hỏi làm rõ | Intent không tự thêm tính năng ngoài phạm vi |
| 2 | Nhờ tạo spec, xử lý câu hỏi về quyền và ngày giao | Yêu cầu đánh số, có điều kiện chấp nhận |
| 3 | Bật Plan Mode, hỏi về rủi ro cache và API | Plan nêu phần sửa và test tương ứng |
| 4 | Duyệt hướng đi, cho triển khai có vòng phản hồi | Diff và kết quả test/build/lint thực tế |
| 5 | Chạy verifier hoặc kiểm tra độc lập | Báo cáo cả luồng mới và luồng gần nó |
| 6 | Review theo logic, bảo mật và spec/plan | Phát hiện có bằng chứng, quyết định của người review |

**Ba phép thử bắt buộc của bài tập:**

1. Khách A thử xem đơn của khách B: phải bị từ chối, kể cả khi đã có cache.
2. Ngày giao chưa có: màn hình vẫn giải thích được trạng thái, không bị trắng.
3. Kho chậm hoặc báo lỗi: UI hiển thị trạng thái phù hợp và hệ thống không tăng request vô hạn.

### Vòng 2 — Kiểm tra độ tin cậy của cách làm

1. Tạo một eval từ nhiệm vụ thêm log: agent phải giúp điều tra mà không ghi toàn bộ dữ liệu khách.
2. Sửa một chỉ dẫn trong bản nháp `CLAUDE.md`, chạy lại eval và xem sự khác biệt. Không cố tình làm yếu cấu hình dùng chung của nhóm.
3. Mô phỏng release cần phiếu duyệt bằng công cụ giả hoặc staging. Kiểm tra phiếu sai phiên bản bị từ chối.
4. Diễn tập rollback trên môi trường thử đã chuẩn bị, ghi cách biết hồi phục thành công.
5. Dùng chuỗi metric giả để thử các mức phản ứng; xác nhận mức nhẹ chỉ ghi log, không có quyền hành động.
6. Từ sự cố giả tạo một intent mới và một eval hồi quy. Vòng lặp đã khép khi bài học thật sự trở thành kiểm tra cho lần sau.

### Lộ trình áp dụng tham khảo trong bốn tuần

| Thời gian | Trọng tâm | Tiêu chí chuyển tiếp |
|---|---|---|
| Tuần 1 | Lệnh kiểm tra, CLAUDE.md, một intent và plan | Người khác chạy được; intent/plan đủ rõ để review |
| Tuần 2 | Một policy skill và kiểm tra thực thi; bắt đầu suite eval | Policy kích hoạt đúng, lỗi chủ đích bị phát hiện |
| Tuần 3 | Review PR có hướng dẫn; hook cho một hành động có cổng | Review có ích, cổng thử đúng cả allow và deny |
| Tuần 4 | CI đọc log, deploy staging và diễn tập rollback; mô phỏng metric | Có bằng chứng hồi phục, quyền không vượt phạm vi |

Đây là nhịp gợi ý. Một tổ chức có nhiều hệ thống cũ có thể cần lâu hơn ở bước chọn nguồn dữ liệu chính và phân quyền.

### Bộ chỉ số nên ghi lại từ đầu

| Câu hỏi | Chỉ số gợi ý | Đọc cùng với |
|---|---|---|
| Ý tưởng có thành đầu vào nhanh hơn? | Thời gian tới intent được duyệt | Tỷ lệ phải viết lại sau spec |
| AI có giảm lỗi cơ bản? | CI qua lần đầu, lỗi lặp đã có hướng dẫn | Phạm vi test và lỗi lọt ra ngoài |
| Review có bớt chờ? | Thời gian đến review đầu và đến merge | Tỷ lệ phát hiện sai, số lần làm lại |
| Tự động hóa có đáng tin? | Eval pass rate theo cấu hình/model | Chi phí, độ khó và tính đại diện của ca |
| Vận hành có tốt hơn? | Thời gian phát hiện/hồi phục | Báo giả, sự cố lặp, thay đổi gây lỗi |

Đừng cộng số PR hoặc phiên agent rồi coi đó là năng suất cuối cùng. Một nhóm merge nhiều hơn nhưng phải sửa sự cố nhiều hơn có thể chưa tiến bộ.

<a id="thuat-ngu"></a>
## Thuật ngữ dễ tra cứu

| Thuật ngữ | Nghĩa dễ hiểu |
|---|---|
| SDLC | Các bước đưa ý tưởng thành phần mềm rồi vận hành, bảo trì |
| AI-native SDLC | Quy trình được tổ chức để AI tham gia xuyên suốt, với trách nhiệm và kiểm soát rõ |
| Agent | AI làm việc qua công cụ và lặp theo kết quả quan sát |
| Harness | Môi trường điều phối agent: hướng dẫn, công cụ, quyền, kiểm tra, ghi log |
| Artifact | Đầu ra lưu được và review được: tài liệu, diff, log, ảnh kiểm tra |
| intent.md | Vấn đề, kết quả muốn đạt, giới hạn và câu hỏi mở |
| spec.md | Yêu cầu cùng thiết kế đã được làm rõ |
| plan.md | Cách triển khai, thứ tự, rủi ro và bằng chứng cần có |
| CLAUDE.md | Bối cảnh và quy ước làm việc dùng chung của dự án |
| Skill | Hướng dẫn chuyên biệt có điều kiện áp dụng và quy trình thực hiện |
| Hook | Chương trình chạy tại sự kiện, dùng để kiểm tra hoặc tác động luồng thực hiện |
| PreToolUse | Sự kiện trước lần dùng công cụ; phù hợp để xét cổng trước hành động |
| PostToolUse | Sự kiện sau công cụ thành công; phù hợp phản hồi, không tự đảo ngược hành động đã xảy ra |
| Subagent | Agent phụ nhận việc hẹp với bối cảnh và công cụ riêng |
| Worktree | Bản checkout Git riêng để các luồng làm việc không sửa chung một bộ tệp |
| PR | Pull request: đề nghị nhập thay đổi vào nhánh đích, nơi lưu review và kiểm tra |
| Code owner | Người/nhóm chịu trách nhiệm phê duyệt vùng mã |
| Branch protection | Quy tắc bắt buộc trước khi nhập mã vào nhánh được bảo vệ |
| CI/CD | Tự động kiểm tra/tích hợp và đưa phiên bản tới môi trường |
| Eval | Nhiệm vụ cùng tiêu chí chấm để đánh giá cách agent hoàn thành công việc |
| Regression | Hành vi từng đúng bị hỏng sau thay đổi |
| MCP | Cách kết nối agent với công cụ và nguồn dữ liệu bên ngoài |
| Sandbox | Môi trường giới hạn những gì tiến trình được truy cập/thực hiện |
| Managed settings | Cấu hình do quản trị viên tổ chức kiểm soát |
| PII | Thông tin có thể nhận diện cá nhân |
| Runbook | Hướng dẫn vận hành đã xác định bước, điều kiện và cách xác minh |
| Rollback | Đưa hệ thống về trạng thái/phiên bản trước theo quy trình đã chuẩn bị |
| Control band | Dải dao động dùng để phân biệt tín hiệu cần chú ý với mức bình thường |
| Triage | Phân loại và ưu tiên xử lý một vấn đề |
| Leading indicator | Dấu hiệu sớm cho thấy quy trình đang thay đổi |
| Lagging indicator | Kết quả xuất hiện sau một khoảng thời gian, như lỗi vận hành hoặc thời gian hồi phục |
| OpenTelemetry | Cơ chế thu thập/xuất tín hiệu quan sát để theo dõi hoạt động hệ thống |

## Kiểm tra việc học

Bạn đã nắm được nội dung khi có thể tự trả lời:

- Vì sao viết mã nhanh chưa đảm bảo phát hành nhanh?
- Khi nào dùng intent, spec, plan và khi nào cần quay lại sửa chúng?
- Vì sao skill không thay thế hook/CI cho một điều bắt buộc?
- Test ứng dụng khác eval agent ở điểm nào?
- Ai được phê duyệt PR và ai được phê duyệt release production?
- Làm sao agent chứng minh đã kiểm tra thay vì chỉ nói đã xong?
- Cần chuẩn bị gì trước khi cho agent tự rollback?
- Một cảnh báo mới đi qua những bước nào để thành cải tiến bền vững?

## Ghi chú về nguồn và phạm vi

Toàn bộ 14 liên kết “Bài gốc” tương ứng các bài đã mở và đọc. Ba mục mở rộng đã được mở thêm: bộ chấm eval, kiểm tra toàn bộ response trong log và script phát hiện bất thường. Trang “Course complete” là trang trạng thái, không phải bài giảng thứ 15.

Các ví dụ nhà sách, prompt tiếng Việt, cấu trúc bài tập và lộ trình bốn tuần là phần bổ sung để áp dụng kiến thức. Chúng không mô tả việc đã sửa repo, chạy test, tạo PR hoặc triển khai hệ thống của bạn. Các tài liệu sản phẩm có thể thay đổi; khi triển khai hãy đối chiếu phiên bản cài đặt và tài liệu chính thức được liên kết ở trên.
