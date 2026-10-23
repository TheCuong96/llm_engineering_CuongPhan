# Thiên Cơ Đồ — Tài liệu triển khai giao diện vận hành 3D bối cảnh tu tiên

*Biến thể theo chủ đề của brief "WareTrack-style" (`prompt-web-3d-quản-lý-nhà-máy-v2.md`) · 23/10/2026 · Dùng làm đầu vào (brief) khi khởi động dự án mới*

## 0. Cách đọc và cách dùng

- **Tài liệu tự đủ.** Giữ nguyên "công thức" của brief gốc: bản đồ là giao diện, HUD bốn góc kiểu RTS, thế giới đang sống, mọi thực thể đều bấm được. Toàn bộ domain được thay: không còn mạng lưới kho vận, mà là **hậu cần của một tông môn tu tiên** trải trên năm ngọn núi lơ lửng.
- **Nhãn:** **\[Kế thừa\]** là giữ từ brief gốc và chỉ đổi từ vựng; **\[Mới\]** là phần riêng của bối cảnh tu tiên.
- **Cách dùng:** (1) dán mục 11 làm tin nhắn đầu tiên; (2) đính kèm toàn bộ tài liệu này; (3) muốn đổi tên tông môn, phong hay nhân vật thì chỉ sửa ở mục 7.1, các chỗ khác chỉ tham chiếu theo mã.
- **Mọi tên riêng đều hư cấu.** Không mượn tên tông môn, nhân vật hay công pháp từ tiểu thuyết đã xuất bản. Không dùng thư pháp chữ Hán lấy từ nguồn có bản quyền; ký hiệu bát quái và phù văn dựng bằng hình học thuần.
- **Ngôn ngữ UI:** tiếng Việt, dùng từ Hán-Việt để tạo không khí, nhưng mỗi nhãn phải hiểu được ngay. Ví dụ ghi "Linh chu tại phong", không ghi "Phi chu trú bạc".

## 1. Sản phẩm là gì

**Thiên Cơ Đồ** là bản sao số (digital twin) của **Tử Vân Tông**, trình bày như một sa bàn chiến thuật. Tông môn có năm phong (PH-01 đến PH-05) lơ lửng trên biển mây. Mỗi phong là một diorama 3D nhìn chếch, gồm điện các mái cong, Tàng Bảo Các (kho), phi chu đài nhô ra mép đảo, vườn linh dược và Tụ Linh Trận. Linh chu của các thương hội bay đến, bay đi chở rương linh tài. Đệ tử ngoại môn (hoặc khôi lỗi) khuân rương giữa kho và thuyền. Hộ Sơn Đại Trận bao quanh mỗi phong như một vòm trong suốt.

Người dùng mẫu: **Lục Minh Hà, Chấp Sự Trưởng Lão**, phụ trách vật tư toàn tông.

Vòng lặp sử dụng: chọn phong, quan sát sa bàn đang chạy, bấm vào linh chu, đệ tử, rương hoặc Tụ Linh Trận, đọc ngọc giản (panel chi tiết), theo dõi lệnh vận chuyển ở thanh dưới, rồi chuyển sang phong khác.

**Đây là công cụ vận hành, không phải game nhập vai.** Không có nhân vật chính, không chiến đấu, không cày cấp. Không khí tu tiên nằm ở từ vựng, hình khối và chuyển động; logic bên dưới vẫn là hàng đợi, tài nguyên và vòng đời đơn hàng.

### Bảng ánh xạ từ brief gốc

| Brief gốc (kho vận) | Thiên Cơ Đồ | Mã |
| --- | --- | --- |
| Site (kho) | Phong (ngọn núi lơ lửng) | PH-01…PH-05 |
| Truck | Linh chu (thuyền bay của thương hội) | LC-xxxx |
| Forklift + pin | Đệ tử ngoại môn + linh lực / Khôi lỗi + linh thạch | DT-xx / KL-xx |
| Dock / Bay | Phi chu đài (bến đáp) | Đài 1, Đài 2… |
| Pallet | Rương linh tài | R-xxxx |
| Charger | Tụ Linh Trận | T1, T2, T3 |
| Shipment | Lệnh vận chuyển | #LVC-xxxxx |
| Hãng vận tải | Thương hội | 4 thương hội hư cấu |
| Cổng + hàng rào | Trận môn của Hộ Sơn Đại Trận | \[Mới\] |
| Đồng hồ Live | Đồng hồ canh giờ (12 địa chi) | \[Mới\] |

## 2. Bảy nguyên tắc thiết kế

1. **Sa bàn là giao diện.** \[Kế thừa\] Scene 3D phủ toàn màn hình; mọi UI là panel nổi lên trên.
2. **Mọi thực thể đều bấm được:** phong, linh chu, đệ tử, khôi lỗi, rương linh tài, Tụ Linh Trận, phi chu đài. Bấm vào là mở ngọc giản có cấu trúc thống nhất.
3. **Thế giới đang sống.** Linh chu lướt trên mây, đệ tử khuân rương, linh khí xoáy ở Tụ Linh Trận, thác nước chảy, hạc bay, mây trôi, đồng hồ canh giờ chạy. Không có trạng thái tĩnh chờ người dùng bấm làm mới.
4. **HUD đặt ở bốn góc, như game RTS.** \[Kế thừa\]
5. **Thủy mặc low-poly.** Hình khối sạch, không texture, nền giấy ngà và biển mây trắng, **một màu nhấn duy nhất là tím Tử Vân**. Màu trạng thái chỉ dùng cho chip và thanh tiến độ. Cột chu sa và mái ngọc là màu của *vật thể 3D*, không đưa vào HUD.
6. **Phản hồi kiểu game.** Khung góc dạng phù văn, chip nhãn nổi trên đầu, vòng trận pháp dưới chân, đường bay linh quang tới đích.
7. **Huyền ảo vừa đủ.** \[Mới\] Hiệu ứng (linh quang, hạt linh khí, mây, vòm trận) chỉ là lớp nền: không che chip hay HUD, không nhấp nháy liên tục, và là thứ đầu tiên bị tắt khi hạ chất lượng. Mật độ thông tin thấp trong scene, cao trong panel.

## 3. Bản đồ bố cục HUD

\[Kế thừa\] Bố cục cố định; kích thước tính theo tỉ lệ viewport.

```
+--------------------------------------------------------------------------+
| A. TOP BAR: ấn tông | tìm kiếm (/) | chọn phong | Live·canh giờ | chuông | avatar |
+--------------------------------------------------------------------------+
| B. KPI x3          |                                   | [nút sa bàn]    |
| (trên-trái)        |                                   | [+][-][↺][↻]    |
|                    |   C. SA BÀN 3D (toàn màn hình)    | [gốc][toàn cảnh]|
|                    |                                   | D. NGỌC GIẢN    |
|                    |                                   | (~24% rộng)     |
|                    |                                   |                 |
| E. LỆNH VẬN CHUYỂN (dưới-trái, ~60% rộng)              | F. BẢNG ĐIỀU    |
|                                                        |    PHỐI (~30%)  |
+--------------------------------------------------------------------------+
```

| Vùng | Vị trí | Vai trò |
| --- | --- | --- |
| A. Top bar | Trên cùng, giấy ngà mờ | Nhận diện, tìm kiếm toàn cục, đổi phong, đồng hồ canh giờ, truyền âm (thông báo), người dùng |
| B. KPI | Trên-trái, 3 thẻ ngang | Ba chỉ số của phong đang xem, có mũi tên và delta |
| C. Sa bàn | Phủ toàn khung, nằm dưới mọi HUD | Diorama phong hiện tại; biển mây và các phong khác mờ ở xa |
| Nút sa bàn | Cột dọc, cạnh trái panel D | Zoom in, zoom out, xoay trái, xoay phải, về góc gốc, **toàn cảnh tông môn** \[Mới\] |
| D. Ngọc giản | Phải, dưới top bar (~24% rộng, rộng hơn bản gốc 1% vì chuỗi tiếng Việt dài hơn) | Thẻ chi tiết của đối tượng đang chọn; mặc định là chính phong đó |
| E. Lệnh vận chuyển | Dưới-trái | Vòng đời 5 bước của lệnh gắn với linh chu đang chọn |
| F. Bảng điều phối | Dưới-phải | Ba tab: Phi chu đài, Đệ tử, Linh chu; mỗi dòng bấm được |

## 4. Đặc tả component

Phong cách chung: panel nền giấy ngà `#FBF8F2` độ mờ 85–90% kèm backdrop-blur 16px, bo góc 16–20px, viền 1px tím rất nhạt, bóng mềm ánh tím. Ngọc giản có **một** hoa văn mây mảnh ở góc trên-phải; không lặp hoa văn ở chỗ khác.

### 4.1 Top bar

- **Ấn tông:** ô vuông tím bo góc nhỏ chứa hình đám mây cách điệu (SVG tự vẽ, không dùng chữ Hán) cùng chữ "Thiên Cơ Đồ" font serif.
- **Tìm kiếm:** placeholder "Tìm phong, linh chu, đệ tử, rương, lệnh vận chuyển…", gợi ý phím `/`.
- **Chọn phong:** huy hiệu tím "PH-01", tên "Tử Vân Phong" và dòng phụ "78% đầy · 1/2 đài có thuyền"; nút sang phong kế tiếp; mũi tên mở danh sách năm phong, mỗi dòng có % đầy và số đài đang bận.
- **Chip "Live · Giờ Tỵ 09:40"** có chấm nhấp nháy. Hiện canh giờ theo 12 địa chi (mục 7.4) kèm giờ số cho dễ đọc. Bấm vào chip để đổi tốc độ mô phỏng (1×, 12×, 60×, tạm dừng).
- **Chuông "Truyền âm"** có số chưa đọc; đường kẻ dọc; avatar kèm "Lục Minh Hà / Chấp Sự Trưởng Lão".

### 4.2 Thẻ KPI (ba thẻ)

Mỗi thẻ có icon vuông, nhãn nhỏ, số lớn, mũi tên kèm delta và dòng chú thích.

| Thẻ | Ví dụ | Chú thích |
| --- | --- | --- |
| Linh tài tồn kho | 1,412 (+15) | rương · PH-01 |
| Linh chu tại phong | 1 (+1) | 1 đang tới · PH-01 |
| Giao nộp đúng hạn | 96.6% (+0.4%) | 30 ngày gần nhất |

Khi đổi phong, số **đếm chạy** từ giá trị cũ sang giá trị mới trong 600–900ms.

### 4.3 Nút sa bàn

\[Kế thừa\] Năm nút tròn xếp dọc: `+`, `−`, xoay ngược chiều kim đồng hồ, xoay thuận chiều, về góc nhìn gốc. Kéo chuột để pan, cuộn để zoom.

\[Mới\] Nút thứ sáu là **Toàn cảnh tông môn**: camera lùi lên cao thấy cả năm phong trên biển mây, mỗi phong có chip "PH-0x · 78%". Bấm vào một phong để bay xuống.

### 4.4 Ngọc giản (detail panel): năm biến thể, thêm một biến thể tuỳ chọn

Khung chung \[Kế thừa\]: dòng eyebrow chữ tím in hoa (loại đối tượng · mã phong), tiêu đề đậm, dòng phụ xám. Góc phải có ba nút: định vị, mở rộng, đóng. Dưới đó là chip trạng thái và các trường.

| Biến thể | Eyebrow | Nội dung |
| --- | --- | --- |
| Phong | CHỦ PHONG, ĐAN PHONG, BĂNG KHỐ, TRUNG CHUYỂN, KHÔI LỖI PHONG · PH-0x | Tên và vị trí ("Trung tâm biển mây · cao 3,200 trượng"); chip **Hộ trận vững** + "2 đã đáp · 1 đang tới · 3 rương chờ"; 4 ô số: Linh tài tồn n / sức chứa + thanh tím, Phi chu đài a / b bận + thanh xanh ngọc, Xuất hôm nay, Nhập kho hôm nay; bảng Kho (icon, tên, số lượng, chip Đủ hoặc Sắp cạn); mục Nhân lực "1/2 đang làm" kèm tiến độ từng người; dòng Hộ trận (độ bền %) |
| Đệ tử / Khôi lỗi | ĐỆ TỬ NGOẠI MÔN · PH-0x hoặc KHÔI LỖI · PH-05 | DT-07, Trần Bình · Luyện Khí tầng 6 (khôi lỗi: KL-15 · Thiết Giáp mẫu Bính); chip Bốc lên thuyền, Dỡ thuyền hoặc Đả tọa hồi linh (khôi lỗi: Nạp linh thạch); thanh tiến độ + **Linh lực %**; Đang mang (Trống hoặc R-xxxx · tên); Lượt hôm nay; Thân pháp (km/h); Tụ Linh Trận; Phong |
| Rương linh tài | RƯƠNG · nhóm hàng (LINH DƯỢC, KHOÁNG THẠCH, ĐAN DƯỢC, PHÙ LỤC) | Tên (Huyết Linh Chi), R-1026 · phẩm cấp (Tam phẩm); chip Chờ bốc hoặc Đang chuyển; Số lượng, Trọng lượng (cân), Vị trí (Ô sân 4 hoặc "Trên vai DT-07"), Lô, Nhập lúc, Phong; \[Mới\] hàng cần lạnh có thêm dòng **Hàn khí còn x phút** |
| Tụ Linh Trận | TỤ LINH TRẬN · PH-0x | T1, "Tiểu Tụ Linh Trận cửu cung"; chip Trống hoặc "Đang hồi linh cho DT-12"; Lượt hôm nay, Linh khí đã tụ hôm nay, Tốc độ hồi (% mỗi phút), Hàng chờ, Phong |
| Linh chu | Tên thương hội in hoa (VẠN BẢO THƯƠNG HỘI) | LC-2051, thuyền trưởng · số ấn hiệu; chip Ngự không, Chờ mở trận môn, Hạ đài, Đang bốc hoặc Đang dỡ, kèm dòng mô tả ("Hạ xuống Phi chu đài 3"); thanh tiến độ ("còn 4.2 dặm" hoặc "3/8 rương"); Lệnh #LVC-78442, Bên nhận, Đích đến, Dự kiến tới, Tốc độ, Đài, Hàng (n/8 rương · cân) |
| Lò đan (P8, tuỳ chọn) | LÒ ĐAN · PH-02 | L3 "Cửu Chuyển Đan Lô"; chip Đang luyện, Nghỉ lò hoặc Tạc lò; đan dược đang luyện, Hỏa hầu %, Thành đan dự kiến, Tỉ lệ thành đan 30 ngày, nguyên liệu tiêu hao |

**Bấm vào phi chu đài:** nếu đài có thuyền thì chọn thuyền đó; nếu đài trống thì mở ngọc giản Phong và cuộn tới ô Phi chu đài.

### 4.5 Lệnh vận chuyển (dưới-trái)

- **Nửa trái, stepper 5 bước:** Tiếp lệnh (giờ) → Kiểm phẩm (giờ) → Đang bốc n/8 hoặc Đang dỡ n/8 (tuỳ hướng) kèm dự kiến → Ngự không (dự kiến) → Giao nhận (dự kiến). Bước đã xong là vòng tím đặc kèm icon; bước hiện tại có quầng linh quang; bước tương lai màu xám. Đoạn nối đã qua màu tím, chưa qua màu xám. Góc phải tiêu đề ghi "LC-2051 · Vạn Bảo Thương Hội".
- **Nửa phải, thẻ lệnh:** hình linh chu nhỏ, "#LVC-78442", "Tới: Lạc Hà Thành", chip trạng thái, dòng "PH-01 · Đài 1 · còn 13 phút", mũi tên mở chi tiết.
- Stepper đổi theo linh chu đang chọn; số phút còn lại giảm theo đồng hồ mô phỏng.

### 4.6 Bảng điều phối (dưới-phải)

Ba tab dạng pill có bộ đếm: "Phi chu đài 2/2", "Đệ tử 1/2", "Linh chu 2"; bên phải là tên phong hiện tại. Mỗi dòng bấm được (mở ngọc giản và đưa camera tới đối tượng). Đổi tab có hiệu ứng cross-fade.

| Tab | Dòng mẫu |
| --- | --- |
| Phi chu đài | Đài 1 · PH-01: chấm màu buồm + LC-2051 · Vạn Bảo + chip Đang bốc + 2/8; Đài 2: "Chưa có thuyền" + chip Sẵn sàng; Đang tới: LC-2287 · Lưu Vân Tiêu Cục + chip Ngự không + "3 phút" |
| Đệ tử | DT-10 · "Dỡ LC-2205 tại Đài nhập 1" + chip Dỡ thuyền + 84%; DT-12 · "Đả tọa tại T1" + chip Đả tọa hồi linh + linh lực 35% |
| Linh chu | LC-2229 · Xích Viêm · "PH-04 · Đài xuất 2" · Đang bốc · 3/8; LC-2307 · "Tới PH-04" · Hạ đài; LC-2481 · Huyền Quy Hành · "Tới PH-04" · Ngự không · "1 phút" |

Bảng màu chip trạng thái (mọi cặp chữ/nền đều ≥ 4.5:1):

| Trạng thái | Nền | Chữ |
| --- | --- | --- |
| Hộ trận vững, Đủ, Đang bốc, Đang dỡ, Trống (trận) | `#DDF3E9` | `#116B4A` |
| Sắp cạn, Đả tọa hồi linh, Nạp linh thạch, Chờ mở trận môn, Hàn khí suy | `#FCEBCB` | `#9A5B00` |
| Ngự không, Hạ đài, Đang chuyển | `#EEE9FC` | `#5536C4` |
| Sẵn sàng, Đã giao, bước chưa tới | `#EEEDF2` | `#55506A` |
| Trận suy yếu, Tạc lò (P8) | `#FBE2DC` | `#B23A26` |

### 4.7 Tìm kiếm và truyền âm

- **Tìm kiếm:** phím `/` để focus. Tìm theo mã (PH-, LC-, DT-, KL-, R-, LVC-) và theo tên. **Phải khớp không dấu**, tức là gõ "huyet linh chi" vẫn ra "Huyết Linh Chi": chuẩn hoá NFD rồi bỏ dấu, nhưng nhớ xử lý riêng "đ/Đ" vì NFD không tách được chữ này. Kết quả nhóm theo loại, tối đa 5 dòng mỗi loại, ưu tiên phong đang xem. Enter thì chọn đối tượng, đổi phong nếu cần và đưa camera bay tới.
- **Truyền âm (thông báo):** là bộ lọc của event log, chỉ giữ sự kiện cần hành động: linh chu tới trận môn, kho Sắp cạn, linh lực đệ tử < 20%, rương cần lạnh sắp hết hàn khí, hộ trận < 60%, linh chu trễ hẹn. Bấm vào một thông báo thì chọn đối tượng liên quan.

## 5. Sa bàn 3D

### 5.1 Camera và bố trí thế giới

- Nhìn chếch từ trên xuống kiểu isometric (nghiêng 35–50°). Kéo để pan, cuộn để zoom từ toàn cảnh phong xuống cận cảnh đệ tử, xoay từng bước 90° bằng hai nút xoay.
- **Bố trí thế giới \[Mới\]:** năm phong nằm trong cùng một không gian, xếp trên một vòng cung quanh PH-01, cách nhau đủ xa để chỉ thấy phong kế bên mờ trong sương. Phong đang xem được render đầy đủ. Các phong khác chỉ render bản rút gọn (LOD: khối đảo, mái chính và vòm trận), không có thực thể.
- **Đổi phong:** camera nâng lên trên biển mây, lướt ngang rồi hạ xuống phong mới (1.2–1.6s, ease-in-out). Panel mờ dần rồi nạp lại trong lúc KPI đếm chạy. Nếu người dùng bật prefers-reduced-motion thì thay bằng fade 200ms.
- Giới hạn góc nghiêng, khoảng cách và vùng pan để người dùng không lạc ra biển mây trống.

### 5.2 Danh mục asset (dựng bằng code từ hình khối)

| Asset | Mô tả |
| --- | --- |
| Đảo lơ lửng (đế phong) | Khối đá đa giác, đáy nhọn hình nón ngược, mặt trên phẳng phủ cỏ; vài mảnh đá nhỏ lơ lửng quanh đáy, nhấp nhô chậm |
| Điện các | Thân hộp màu ngà, cột chu sa, mái cong hai tầng màu ngọc thẫm (ConeGeometry 4 cạnh dẹt, góc mái vểnh lên), bảng hiệu trống chữ |
| Tàng Bảo Các (kho) | Lầu ba tầng, cửa lớn mở thấy giá rương bên trong |
| Phi chu đài | Bệ đá bát giác nhô ra mép đảo, trận văn vàng nhạt dưới sàn có đánh số đài, hai cột đèn linh quang |
| Linh chu | Thân thuyền gỗ cong, buồm vải, cờ đuôi; ánh linh quang tím nhạt dưới đáy; 4 mẫu livery theo thương hội |
| Đệ tử | Thân capsule áo trắng viền tím, đầu cầu, búi tóc; khi mang rương thì rương nằm trên vai |
| Khôi lỗi | Khối hộp đồng thau, mắt phát sáng, chân hai đoạn, bước đi cứng |
| Rương linh tài | Hộp gỗ nâu đai đồng; rương ngọc xanh cho linh dược quý; rương phủ sương trắng cho hàng cần lạnh |
| Giá rương | Khung gỗ nhiều tầng trong Tàng Bảo Các và ngoài sân |
| Tụ Linh Trận | Đĩa bát giác phát sáng nhẹ, 8 trụ đá nhỏ quanh viền; khi đang hồi linh có hạt linh khí xoáy lên |
| Hộ Sơn Đại Trận | Vòm bán cầu trong suốt, viền fresnel tím rất nhạt; chỉ hiện rõ khi linh chu đi qua trận môn |
| Lò đan (P8) | Đỉnh ba chân, khói hồng instanced bốc lên |
| Cảnh quan | Tùng low-poly hai cỡ, đá, thác nước (dải mesh có UV trượt), vườn linh dược ô vuông, cầu treo giữa các khối đảo, đàn hạc bay theo đường vòng (instanced) |
| Biển mây | Cụm mây instanced dưới các phong, trôi chậm; sương ngà-tím dày dần về phía xa |
| Linh phù định vị | Lá bùa vàng nhỏ lơ lửng, xoay chậm trên rương quan trọng; bấm được (thay cho pin giọt nước của bản gốc) |

### 5.3 Vật liệu, ánh sáng, hậu kỳ

- Vật liệu phẳng (matte), không texture; màu theo token ở mục 8.
- Ánh sáng hemisphere (trời ngà ấm, đất tím nhạt) cộng một directional mềm từ phía Đông; bóng đổ mềm, AO nhẹ ở chân vật thể.
- Sương màu ngà-tím dày dần theo khoảng cách, để các phong ở xa thành bóng mờ như tranh thủy mặc.
- Bloom chỉ áp cho vật liệu emissive (linh quang dưới linh chu, Tụ Linh Trận, linh phù), ngưỡng cao để HUD và nền không bị loá.
- Tilt-shift nhẹ ở mép khung hình. Toàn cảnh sáng, tương phản thấp; điểm nhấn là màu tím.

### 5.4 Lớp phủ trong sa bàn

| Lớp phủ | Khi nào | Hình thức |
| --- | --- | --- |
| Chip nhãn nổi | Hover hoặc chọn | "DT-07 · Bốc lên thuyền", "LC-2205 · Đang dỡ", "R-1026 · Huyết Linh Chi" |
| Khung góc phù văn | Đang chọn | Bốn góc tím, nét gãy như phù văn |
| Vòng trận dưới chân | Hover Tụ Linh Trận hoặc phi chu đài | Vòng bát quái tím bán trong suốt, xoay chậm; hover đài hiện "Đài 2 · Hạ đài" |
| Đường bay linh quang | Chọn linh chu đang tới | Dải sáng tím trên không theo spline, đoạn cuối là nét đứt cong xuống đài đích; thuyền bay theo đúng đường này |
| Gợn trận môn \[Mới\] | Linh chu đi qua Hộ Sơn Đại Trận | Vòm hiện rõ trong 0.6s, gợn sóng tròn lan ra từ điểm tiếp xúc |
| Linh phù định vị | Luôn hiện | Bấm để mở ngọc giản Rương |

## 6. Kịch bản demo (~75 giây, dùng làm kịch bản nghiệm thu)

1. **Mở màn** ở PH-01 Tử Vân Phong, ngọc giản Phong bên phải.
2. **Chọn DT-07:** ngọc giản chuyển sang Đệ tử, chip nhãn nổi trên đầu, khung phù văn bao quanh.
3. **Chọn rương R-1026** (Chờ bốc). Khi DT-07 nhấc rương lên, ngọc giản tự đổi sang "Đang chuyển · Trên vai DT-07".
4. **Đổi sang PH-04 Truyền Tống Đài:** camera bay qua biển mây, KPI đếm từ 1,412 về 540.
5. **Chọn Tụ Linh Trận T1:** thấy DT-12 đang đả tọa, linh lực tăng dần.
6. **Bấm LC-2481 (Ngự không) trên bảng điều phối:** đường linh quang hiện ra; thuyền chạm Hộ Sơn Đại Trận (có gợn), trạng thái chuyển Chờ mở trận môn → Hạ đài → Đang dỡ.
7. **Đổi tab** Phi chu đài → Đệ tử → Linh chu; bấm "Toàn cảnh tông môn", chọn PH-03 Hàn Băng Cốc rồi xoay quanh hang băng.
8. **Quay về PH-01**; demo có thể tự lặp.

## 7. Mô hình dữ liệu và mô phỏng

### 7.1 Năm phong

| Mã | Tên | Loại | Vị trí | Tồn / sức chứa (rương) | Đầy · đài | Xuất / nhập hôm nay | Đúng hạn | Nét riêng của scene |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PH-01 | Tử Vân Phong | Chủ phong (kho tổng) | Trung tâm biển mây | 1,412 / 1,800 | 78% · 2 đài | 23 / 15 | 96.6% | Đại điện ba tầng, Tàng Bảo Các, quảng trường đá |
| PH-02 | Đan Hà Phong | Đan phong | Phía Đông, ráng chiều | 2,310 / 3,000 | 77% · 4 đài | 31 / 28 | 97.9% | Dãy lò đan khói hồng, vườn linh dược bậc thang |
| PH-03 | Hàn Băng Cốc | Băng khố (kho lạnh) | Phía Bắc, tuyết phủ | 860 / 1,200 | 72% · 3 đài | 18 / 22 | 95.8% | Hang băng, cụm tinh thể băng, thác đóng băng |
| PH-04 | Truyền Tống Đài | Trung chuyển | Phía Nam | 540 / 1,600 | 34% · 6 đài | 41 / 39 | 96.2% | Truyền tống trận lớn giữa sân, nhiều đài đáp, ba Tụ Linh Trận |
| PH-05 | Khôi Lỗi Phong | Tự động (khôi lỗi) | Phía Tây | 1,730 / 2,400 | 72% · 4 đài | 33 / 25 | 95.9% | Xưởng đồng thau, bánh răng lớn, khôi lỗi làm thay đệ tử |

Mỗi phong có bốn dòng Kho, thường có một dòng Sắp cạn. Danh mục mẫu: Linh thạch hạ phẩm, Huyết Linh Chi, Tuyết Liên ngàn năm (cần lạnh), Trúc Cơ Đan, Hàn Thiết khoáng, Linh mễ, Phù giấy trống, Yêu đan nhị giai, Kiếm phôi Thanh Cương.

Thương hội và livery: **Vạn Bảo Thương Hội** (buồm vàng kim), **Lưu Vân Tiêu Cục** (buồm trắng-lam), **Xích Viêm Thương Đoàn** (buồm đỏ cam), **Huyền Quy Hành** (buồm đen-xanh rêu).

**Đơn vị:** hiển thị theo lối cổ (cân, dặm, trượng) nhưng engine lưu theo SI. Gom quy đổi vào một chỗ duy nhất `src/data/units.ts`: 1 cân = 0.5 kg, 1 dặm = 500 m, 1 trượng = 3.33 m.

### 7.2 Kiểu dữ liệu

Định danh trong code dùng tiếng Anh, chuỗi hiển thị tiếng Việt gom vào `src/i18n/vi.ts`. Không đặt dấu tiếng Việt trong tên biến hay tên file.

```ts
type PeakKind = 'main' | 'alchemy' | 'cold_vault' | 'transfer' | 'automaton';
type ShipState = 'sailing' | 'at_barrier' | 'landing' | 'unloading' | 'loading' | 'departing' | 'in_transit' | 'delivered';
type WorkerKind = 'disciple' | 'puppet';
type WorkerState = 'idle' | 'fetching' | 'loading_ship' | 'unloading_ship' | 'returning' | 'queued_for_array' | 'restoring';
type ChestState = 'in_vault' | 'staged' | 'carried' | 'loaded';
type PadState = 'free' | 'reserved' | 'occupied';

interface Peak {
  id: string;                // 'PH-01'
  name: string; kind: PeakKind; locationLabel: string;
  capacity: number;          // rương
  pads: Pad[]; arrays: GatheringArray[]; inventory: InventoryItem[];
  barrier: { strength: number };          // 0–100, độ bền Hộ Sơn Đại Trận
  worldPos: [number, number, number];     // vị trí trên vòng cung quanh PH-01
  layout: string;                         // khoá preset scene
  kpiBaseline: { chestsOnHand: number; shipsAtPeak: number; onTimePct30d: number };
}
interface Pad { id: string; label: string; direction: 'in' | 'out'; state: PadState; shipId?: string }
interface Guild { id: string; name: string; livery: { hull: string; sail: string; flag: string } }
interface Ship {
  id: string; guildId: string; captain: string; sealNo: string;
  peakId: string | null;                  // null = đang bay giữa hai phong, không render chi tiết
  state: ShipState; padId?: string; orderId: string;
  pos: [number, number, number]; route?: [number, number, number][];
  cargo: { chests: number; capacity: number; weightKg: number };  // capacity mặc định 8
  speedMps: number;
}
interface Worker {
  id: string; peakId: string; kind: WorkerKind; name: string;
  realm?: { stage: 'luyen_khi' | 'truc_co'; layer: number };      // chỉ đệ tử; chỉ để hiển thị
  model?: string;                                                 // chỉ khôi lỗi
  state: WorkerState; qi: number;         // 0–100: linh lực (đệ tử) hoặc linh thạch (khôi lỗi)
  carrying?: string; movesToday: number; speedKmh: number;
  arrayId?: string; task?: { shipId: string; padId: string };
}
interface Chest {
  id: string; peakId: string; sku: string; name: string; category: string; grade: number; // phẩm 1–9
  qty: number; weightKg: number; lot: string; receivedAt: number; state: ChestState;
  needsCold?: { maxMinutesOutside: number; minutesOutside: number };
  location: { kind: 'slot' | 'worker' | 'ship'; ref: string };
}
interface GatheringArray { id: string; label: string; ratePctPerMin: number; occupantId?: string; queue: string[]; sessionsToday: number; qiToday: number }
interface InventoryItem { sku: string; name: string; icon: string; qty: number; lowStockThreshold: number }
interface TransportOrder {
  id: string; recipient: string; destination: string; shipId: string;
  direction: 'inbound' | 'outbound';
  steps: { key: 'accepted' | 'inspected' | 'handling' | 'in_flight' | 'delivered'; at?: number; eta?: number }[];
}
interface SimEvent { t: number; type: string; peakId: string; entityId: string; payload?: unknown }
type Selection = { kind: 'peak' | 'ship' | 'worker' | 'chest' | 'array'; id: string } | null;
```

Lựa chọn là một biến duy nhất `selected: Selection` cộng thêm `hovered`. Sa bàn, bảng điều phối, tìm kiếm, truyền âm và thẻ lệnh vận chuyển đều ghi vào cùng biến này. Khi linh chu đang chọn rời phong, ngọc giản giữ thẻ ở trạng thái mờ với dòng "Đã rời PH-04 · đang tới PH-02" kèm nút "Theo dõi"; không để trống, không crash.

### 7.3 Máy trạng thái

- **Linh chu nhập:** sailing → at\_barrier (chờ mở trận môn, 2–6 phút mô phỏng, chỉ mở khi có đài trống được giữ chỗ) → landing (hạ xuống đài, giảm tốc) → unloading (n/8 rương) → departing.
- **Linh chu xuất:** landing → loading (n/8) → departing → in\_transit → delivered.
- **Đệ tử / khôi lỗi:** idle → fetching → loading\_ship hoặc unloading\_ship → returning → idle. Khi `qi` < 20% (chỉ xét lúc idle), đi tới Tụ Linh Trận trống gần nhất → restoring tới ≥ 95% → idle. Không còn trận trống thì vào queued\_for\_array. Khôi lỗi dùng cùng máy trạng thái nhưng hồi nhanh gấp đôi và không có hoạt ảnh đả tọa.
- **Phi chu đài:** free → reserved (thuyền tới trận môn) → occupied → free.
- **Rương:** in\_vault hoặc staged → carried (trên vai đệ tử) → loaded.
- **Hàn khí \[Mới\]:** rương có `needsCold` ở ngoài Hàn Băng Cốc thì `minutesOutside` tăng dần. Vượt 70% ngưỡng thì hiện chip "Hàn khí suy" kèm thông báo. Chỉ là cảnh báo, không huỷ hàng.
- **Hộ trận \[Mới\]:** mỗi lần mở trận môn, `strength` giảm 2 điểm rồi hồi 1 điểm mỗi phút mô phỏng. Dưới 60% thì chip "Trận suy yếu" (màu chu sa) và trận môn mở chậm gấp đôi. Nhờ vậy thuyền dồn dập sẽ tạo ra hàng chờ thật.
- **Lệnh vận chuyển:** các mốc Tiếp lệnh, Kiểm phẩm, Bốc/Dỡ, Ngự không, Giao nhận lấy từ event log; thời gian dự kiến tính từ đồng hồ mô phỏng.

### 7.4 Engine mô phỏng

- \[Kế thừa v2\] TypeScript thuần trong `src/sim`, không import React hay three. Tick cố định 10 Hz theo thời gian mô phỏng; hệ số tốc độ mặc định 12× (1×–60×, tạm dừng được bằng Space); RNG có seed; event bus ghi mọi chuyển trạng thái; UI chỉ đọc qua selector; renderer nội suy vị trí giữa các tick.
- \[Kế thừa v2\] **Mọi phong tick song song**; chỉ phong đang xem được render chi tiết. Linh chu bay giữa các phong có `peakId = null`, ETA lấy từ bảng khoảng cách `peakDistancesLi` (đơn vị dặm).
- \[Kế thừa v2\] Đã chốt: mô phỏng thật. Video demo dùng `DemoDirector` riêng, chỉ điều khiển camera và selection.
- **Canh giờ \[Mới\]:** hàm thuần `toCanhGio(date)` trả về một trong 12 canh: Tý (23–1), Sửu (1–3), Dần (3–5), Mão (5–7), Thìn (7–9), Tỵ (9–11), Ngọ (11–13), Mùi (13–15), Thân (15–17), Dậu (17–19), Tuất (19–21), Hợi (21–23). Lưu ý canh Tý vắt qua nửa đêm. Hàm này cần unit test cho các giờ biên.
- **Giá trị suy ra:** dự kiến xong = số rương còn lại × thời gian mỗi rương; Linh chu tại phong = số thuyền có `peakId` là phong đó và trạng thái khác sailing; delta KPI so với `kpiBaseline`.

## 8. Design tokens

| Token | Giá trị | Ghi chú |
| --- | --- | --- |
| ground-paper | `#F6F2E9` | Mặt đảo, nền sáng |
| cloud | `#FFFFFF` đến `#ECE8F4` | Biển mây (gradient theo độ cao) |
| mist | `#DCD6EA` | Sương ở xa, bóng đổ |
| stone | `#B9BEC9` | Đá đảo |
| roof-jade | `#2D5E57` | Mái điện các (chỉ dùng cho asset 3D) |
| pillar-cinnabar | `#B5462F` | Cột điện (chỉ dùng cho asset 3D, không đưa vào HUD) |
| accent (Tử Vân) | `#6D4AE0` | Màu nhấn UI duy nhất: thanh tiến độ, đường bay, khung chọn, huy hiệu; ~5.7:1 trên nền trắng |
| accent-ink | `#5536C4` | Chữ màu nhấn trên nền accent-tint |
| accent-tint | `#EEE9FC` | Ô số trong ngọc giản, nền chip di chuyển |
| success | thanh `#1F9D6B` · chữ `#116B4A` · nền `#DDF3E9` | |
| warning | thanh `#D98E1C` · chữ `#9A5B00` · nền `#FCEBCB` | |
| danger | chữ `#B23A26` · nền `#FBE2DC` | Chỉ dùng cho Trận suy yếu và Tạc lò |
| text | `#1F1B2E`; phụ `#6B6680` | |
| hud-bg | `#FBF8F2` ở 85–90% + blur 16px | Panel giấy ngà |
| font | Tiêu đề: **Noto Serif**; thân: **Be Vietnam Pro** (hoặc Inter); số dạng tabular | Cả hai font phải nạp subset `vietnamese` |
| cỡ chữ | Eyebrow 11px in hoa; tiêu đề 18–20px; thân 13–14px; chip 12px | \[Kế thừa\] |
| bo góc | Thẻ 16–20px; ô số 12px; chip tròn hoàn toàn | \[Kế thừa\] |
| chuyển động | Panel 200–300ms; đếm số 600–900ms; camera bay 1.2–1.6s ease-in-out | Bay lâu hơn bản gốc vì phải vượt biển mây |

Chỉ dùng **một** màu nhấn. Màu chu sa của cột điện và màu danger của chip phải khác tông đủ xa để không bị đọc nhầm thành "cảnh báo".

## 9. Stack đề xuất và cấu trúc thư mục

\[Kế thừa v2\] Vite + React + TypeScript, three.js qua @react-three/fiber và drei, @react-three/postprocessing, Zustand, Tailwind + Radix, Framer Motion, lucide-react, Vitest, Playwright. Chọn một bộ phiên bản tương thích nhau (R3F đi theo major của React) và ghi vào README.

```
src/
  sim/       engine thuần TS: clock, canhGio, rng, state machines, barrier, cold-chain, events, selectors
  data/      preset 5 phong, thương hội, danh mục linh tài, units.ts
  i18n/      vi.ts — mọi chuỗi hiển thị
  scene/     World, Peak, PeakLod, Hall, Vault, Pad, SpiritShip, Disciple, Puppet, Chest, Rack,
             GatheringArray, Barrier, CloudSea, Waterfall, Cranes, Overlays
  hud/       TopBar, KpiBar, MapControls, DetailPanel/*, OrderTracking, DispatchBoard, Search, Notifications
  store/     zustand: sim, selection, camera
  design/    tokens.css, primitives (Chip, Panel, Tile, ProgressBar)
```

## 10. Kế hoạch triển khai theo giai đoạn

| Giai đoạn | Việc | Tiêu chí hoàn thành |
| --- | --- | --- |
| P0 Nền | Scaffold, tokens, font tiếng Việt, layout HUD rỗng, script Playwright | HUD khớp mục 3 ở 1440×900 và 1920×1080; chuỗi "Đ, ữ, ỡ, ặ, ỷ" hiển thị đúng ở cả hai font |
| P1 Engine lõi | Đồng hồ, canh giờ, RNG có seed, máy trạng thái linh chu, đệ tử, đài, rương, hộ trận; event log; selector KPI; một phong; chưa có UI | Vitest phủ mọi chuyển trạng thái ở mục 7.3 và giờ biên của canh giờ; chạy headless 30 phút mô phỏng không kẹt; cùng seed ra cùng event log |
| P2 Sa bàn tĩnh | Đảo lơ lửng, điện các, Tàng Bảo Các, phi chu đài, tùng, biển mây; camera đủ năm nút | ≥ 55 fps ở 1080p trên laptop GPU tích hợp, DPR ≤ 1.5 |
| P3 Thực thể sống | Linh chu (4 livery), đệ tử, khôi lỗi, rương, giá, Tụ Linh Trận, linh phù; vị trí đọc từ engine | Chuyển động khớp trạng thái engine; mây, tùng, rương dùng instancing |
| P4 HUD | Top bar, KPI, ngọc giản năm biến thể, lệnh vận chuyển, bảng điều phối, tìm kiếm không dấu, truyền âm | Chuỗi chữ, chip, thanh khớp mục 4; chip đạt ≥ 4.5:1; gõ "tu van" ra "Tử Vân Phong" |
| P5 Chọn lọc | Raycast, overlay (chip, khung phù văn, vòng trận, đường bay linh quang, gợn trận môn), đồng bộ mọi nơi chọn | Chọn ở đâu cũng ra cùng một đối tượng; Esc bỏ chọn; không lỗi khi thuyền đang chọn rời đi |
| P6 Đa phong | Năm phong chạy song song, LOD cho phong xa, camera bay qua biển mây, nút toàn cảnh tông môn, thuyền bay giữa các phong | Đổi phong < 2 giây; đổi qua lại 50 lần mà bộ nhớ không tăng quá 10% |
| P7 Hoàn thiện | Hậu kỳ (bloom có ngưỡng, tilt-shift, sương), phím tắt, trạng thái trống và lỗi, prefers-reduced-motion, chế độ hạ chất lượng, bố cục di động | Tự hạ chất lượng khi FPS < 45 kéo dài 3 giây (tắt hạt, bloom, hạc trước tiên); mọi thao tác chính làm được bằng bàn phím |
| P8 Tuỳ chọn | Lò đan ở PH-02: tiêu thụ rương linh dược, sinh rương đan dược; sự kiện Tạc lò hiếm | Luồng nhập → luyện → xuất khép kín, KPI phản ánh đúng |

## 11. Starter prompt (dán nguyên văn)

```
Bạn là kỹ sư frontend/3D cấp cao. Hãy xây ứng dụng web "Thiên Cơ Đồ": giao diện vận hành 3D kiểu game chiến thuật (digital twin) cho hậu cần của Tử Vân Tông, một tông môn tu tiên gồm năm ngọn núi lơ lửng trên biển mây. Tài liệu đính kèm là đặc tả. Nếu tài liệu mâu thuẫn với prompt này thì làm theo prompt và báo lại cho tôi.

BỐI CẢNH
- Người dùng: Chấp Sự Trưởng Lão phụ trách vật tư, theo dõi 5 phong cùng lúc.
- Đây là công cụ vận hành, không phải game nhập vai: không chiến đấu, không cày cấp. Không khí tu tiên nằm ở từ vựng, hình khối và chuyển động; logic bên dưới là hàng đợi, tài nguyên và vòng đời đơn hàng.
- Trải nghiệm cốt lõi: sa bàn 3D isometric phủ toàn màn hình là giao diện chính; HUD giấy ngà mờ nổi lên trên; thế giới mô phỏng chạy liên tục; mọi thực thể đều bấm được.

YÊU CẦU BẮT BUỘC
1. Stack: Vite + React + TypeScript; three.js qua @react-three/fiber và drei; Zustand; Tailwind + Radix; Framer Motion; Vitest; Playwright. Chọn một bộ phiên bản ổn định tương thích nhau (R3F phải khớp major của React) và ghi vào README. Asset 3D dựng bằng code từ hình khối, vật thể lặp dùng InstancedMesh.
2. Bố cục HUD theo mục 3–4: top bar (ấn tông, tìm kiếm có phím /, chọn phong, chip Live + canh giờ, chuông truyền âm, avatar); ba thẻ KPI (Linh tài tồn kho · Linh chu tại phong · Giao nộp đúng hạn) ở trên-trái; cột sáu nút sa bàn (+, −, xoay trái, xoay phải, về gốc, toàn cảnh tông môn); ngọc giản bên phải với năm biến thể (Phong, Đệ tử/Khôi lỗi, Rương, Tụ Linh Trận, Linh chu); thẻ lệnh vận chuyển năm bước (Tiếp lệnh → Kiểm phẩm → Bốc/Dỡ n/8 → Ngự không → Giao nhận) ở dưới-trái; bảng điều phối ba tab (Phi chu đài · Đệ tử · Linh chu) ở dưới-phải.
3. Engine mô phỏng nằm trong src/sim: TypeScript thuần, không import React hay three. Tick cố định 10 Hz; hệ số tốc độ mặc định 12× (chỉnh 1×–60×, tạm dừng được); RNG có seed; event log; máy trạng thái cho linh chu, đệ tử/khôi lỗi, phi chu đài, rương, Hộ Sơn Đại Trận và hàn khí theo mục 7.3. Cả năm phong tick song song; chỉ phong đang xem được render chi tiết, các phong khác dùng LOD. UI chỉ đọc qua selector.
4. Lựa chọn: một nguồn sự thật duy nhất `selected: {kind, id} | null` cộng thêm `hovered`. Sa bàn, bảng điều phối, tìm kiếm và truyền âm đều ghi vào đây. Khi đối tượng đang chọn rời đi, ngọc giản giữ thẻ ở trạng thái mờ kèm dòng "đã rời…", không để trống, không crash.
5. Thẩm mỹ theo token mục 8: "thủy mặc low-poly", không texture, nền giấy ngà và biển mây, chỉ một màu nhấn tím #6D4AE0; màu trạng thái chỉ dùng cho chip và thanh; chữ trên chip đạt tương phản ≥ 4.5:1. Hiệu ứng huyền ảo (linh quang, hạt, mây, vòm trận) không được che HUD và phải tắt được khi hạ chất lượng.
6. Tiếng Việt: toàn bộ chuỗi hiển thị nằm trong src/i18n/vi.ts; định danh trong code dùng tiếng Anh; font Noto Serif (tiêu đề) và Be Vietnam Pro (thân) nạp subset vietnamese; tìm kiếm khớp không dấu và xử lý riêng chữ "đ".
7. Phi chức năng: ≥ 55 fps ở 1080p trên laptop GPU tích hợp (DPR ≤ 1.5), tự hạ chất lượng khi FPS tụt; tôn trọng prefers-reduced-motion (tắt camera bay và hiệu ứng đếm số); mọi thao tác chính làm được bằng bàn phím qua bảng điều phối và tìm kiếm.
8. Dữ liệu: 5 phong theo mục 7.1. Mọi tên riêng là hư cấu; không mượn tên tông môn, nhân vật hay công pháp từ tiểu thuyết đã xuất bản; không dùng thư pháp có bản quyền.

CÁCH LÀM VIỆC
- Trước khi viết code: tóm tắt kế hoạch và giả định (tối đa 15 dòng) kèm danh sách câu hỏi mở, rồi chờ tôi xác nhận.
- Làm lần lượt từ P0 đến P7 theo mục 10 (P8 chỉ làm khi tôi yêu cầu). Hết mỗi giai đoạn: chạy `npm run build` và `npm test`; mở app bằng Playwright, chụp màn hình ở 1440×900 và 1920×1080; tự đối chiếu với cột "Tiêu chí hoàn thành"; báo cáo ngắn (đã làm · bằng chứng · còn thiếu) rồi DỪNG lại chờ tôi duyệt.
- Không thêm tính năng ngoài tài liệu. Gặp quyết định mà tài liệu chưa nói: hỏi tôi, kèm phương án bạn đề xuất.
```

## 12. Rủi ro và lưu ý riêng của bối cảnh tu tiên

- **Font tiếng Việt:** thiếu glyph có dấu thì chữ bị vỡ hoặc rơi về font hệ thống. Bắt buộc nạp subset `vietnamese` và kiểm tra các chữ "Đ, ữ, ỡ, ặ, ỷ" ngay từ P0.
- **Chuỗi dài hơn:** tiếng Việt và Hán-Việt dài hơn tiếng Anh khoảng 20–30%. Ngọc giản và chip phải cho xuống dòng thứ hai hoặc cắt bằng dấu "…" kèm tooltip; không để chữ tràn khỏi viền.
- **Hiệu ứng huyền ảo là thủ phạm tụt FPS số một.** Ngân sách gợi ý: ≤ 2,000 hạt linh khí, ≤ 300 cụm mây instanced, bloom chỉ cho emissive. Khi hạ chất lượng thì tắt theo thứ tự: hạt → bloom → hạc → thác nước động.
- **Vật thể trong suốt chồng nhau** (vòm trận, sương, mây) dễ gây nhấp nháy do three.js sắp xếp transparency. Vòm trận dùng `depthWrite = false` và `renderOrder` riêng.
- **Không trượt thành game:** cảnh giới đệ tử chỉ là thuộc tính hiển thị, không ảnh hưởng gameplay (trừ khi bật P8). Không thêm chiến đấu, rơi đồ hay cấp độ người chơi.
- **Bản quyền và văn hoá:** mọi tên đều hư cấu; ký hiệu bát quái và phù văn dựng bằng hình học thuần; không dùng chữ Hán thư pháp lấy từ nguồn khác.
- **Trợ năng và di động** \[Kế thừa\]: canvas 3D không đọc được bằng trình đọc màn hình, nên bảng điều phối và tìm kiếm phải đủ để làm mọi thao tác bằng bàn phím. Trên màn hình nhỏ, ngọc giản chuyển thành bottom sheet.
- Số liệu trong tài liệu là giả lập.
