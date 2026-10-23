# WareTrack-style — Tài liệu triển khai giao diện vận hành 3D kiểu chiến thuật (v2)
*Phân tích từ video demo của Dilum Sanjaya trên X (72 giây) · 13/10/2026 · Rà soát v2 ngày 23/10/2026 · Dùng làm đầu vào (brief) khi khởi động một dự án mới theo cùng phong cách*

> **Bản v2.** Sửa từ `prompt-web-3d-quản-lý-nhà-máy.md` (bản gốc giữ nguyên). Chỗ đã sửa hoặc bổ sung được đánh dấu **\[v2\]**; danh sách lỗi của bản gốc và cách sửa ở mục 15.
> Lưu ý: tên file nói "nhà máy" nhưng nội dung là **mạng lưới kho vận**. Bản v2 giữ domain kho vận; muốn làm nhà máy, dùng bảng ánh xạ ở mục 12.
## 0. Cách đọc và cách dùng tài liệu này
**Nguồn và độ tin cậy.** Toàn bộ phân tích dựa trên một video quay màn hình dài 72 giây (1874×1080, không có âm thanh). Không có mã nguồn, không có prompt, không có link demo trực tiếp. Vì vậy:
- **\[Quan sát\]** — thấy trực tiếp trong video: bố cục, chữ, số liệu, hành vi.
- **\[Suy luận\]** — suy ra từ hình ảnh: stack kỹ thuật, công thức mô phỏng, kích thước chính xác. Cần kiểm chứng khi làm.
- Tweet ghi "Built with Opus 5.5". Video không cho biết cách xây, số lượt prompt hay thời gian bỏ ra, nên đừng coi đó là bằng chứng về quy trình.
- Chữ nhỏ trong video được đọc bằng mắt từ khung hình nén; vài địa chỉ hoặc con số có thể lệch một chữ.
**Cách dùng.**
1. Điền các biến `{{…}}` theo bảng ở đầu mục 11 (đã có sẵn giá trị mặc định cho domain kho vận). **\[v2\]**
2. Dán mục 11 (Starter prompt) làm tin nhắn đầu tiên trong phiên Claude Code hoặc Project mới.
3. Đính kèm **toàn bộ** tài liệu này làm tham chiếu; mục 14 chỉ dùng để đối chiếu video. **\[v2\]** Bản gốc ghi "đính kèm mục 3–9" nhưng starter prompt lại tham chiếu "mục 1 đến 10 và mục 12".
4. Muốn đổi ngành thì dùng bảng ánh xạ ở mục 12; giữ nguyên nguyên tắc, bố cục HUD và vòng lặp tương tác.
5. Không sao chép thương hiệu: logo WareTrack, tên hãng vận tải (Nordline, Cargoviva, Bluepeak) và các mẫu sơn xe là của tác giả. Hãy tự đặt tên và tự dựng asset.
## 1. Sản phẩm là gì
**\[Quan sát\]** Một "bản sao số" (digital twin) của mạng lưới kho vận, trình bày như game xây dựng/chiến thuật. Có 5 kho ở New Jersey (WH-01 đến WH-05), mỗi kho là một diorama 3D nhìn chếch kiểu isometric: nhà kho, cửa dock, xe tải ra vào, xe nâng chạy, pallet và kệ hàng. Người dùng mẫu là Alex Chen, Operations Manager.
Vòng lặp sử dụng: chọn kho, quan sát cảnh đang chạy, bấm vào xe tải, xe nâng, pallet hoặc trạm sạc, đọc thẻ chi tiết, theo dõi lô hàng ở thanh dưới, rồi chuyển sang kho khác. Mô phỏng chạy liên tục với đồng hồ "Live".
Điểm khác với phần mềm công nghiệp thông thường: trung tâm không phải bảng biểu mà là bản đồ 3D. Bảng, thẻ và số liệu chỉ là lớp HUD nổi lên trên.
## 2. Bảy nguyên tắc thiết kế ("công thức" cảm giác chiến thuật)
1. **Bản đồ là giao diện.** Scene 3D phủ toàn màn hình làm nền; mọi UI là panel kính nổi, không phải dashboard có bản đồ nhỏ nhét trong một ô.
2. **Mọi thực thể đều bấm được.** Kho, xe tải, xe nâng, pallet, trạm sạc, cửa dock. Bấm vào là mở một thẻ chi tiết có cấu trúc thống nhất.
3. **Thế giới đang sống.** Xe chạy, xe nâng bốc dỡ, số liệu nhảy, ETA đếm lùi, đồng hồ Live chạy. Không có trạng thái tĩnh chờ người dùng nhấn Refresh.
4. **HUD đặt ở bốn góc, như game RTS.** Thanh trên (điều hướng, tìm kiếm, đổi kho), thanh tài nguyên (3 KPI) ở góc trên trái, panel thông tin đối tượng đang chọn ở góc phải, bảng hàng đợi (dock/xe nâng/xe tải) và thanh theo dõi lô hàng ở dưới.
5. **Ngôn ngữ thị giác đồ chơi.** Low-poly sạch, không texture, một màu nhấn xanh dương duy nhất, nền lavender sáng, bóng đổ mềm. Màu sắc mang nghĩa trạng thái (xanh lá, cam, xanh dương).
6. **Phản hồi kiểu game.** Hover và select có khung góc bao quanh vật thể, chip nhãn nổi trên đầu, vòng sáng dưới chân, đường dẫn xanh đến đích.
7. **Mật độ thông tin thấp trong scene, cao trong panel.** Trong cảnh chỉ có chip nhãn ngắn (mã + trạng thái); chi tiết nằm ở panel.
## 3. Bản đồ bố cục HUD
**\[Quan sát\]** Bố cục cố định, không đổi suốt 72 giây. Kích thước dưới đây ước lượng theo khung 1874px; hãy dùng tỉ lệ theo viewport.
```
+--------------------------------------------------------------------------+
| A. TOP BAR: logo | search (/) | site switcher | Live clock | bell | avatar  |
+--------------------------------------------------------------------------+
| B. KPI x3          |                                   | [ctrl]          |
| (trên-trái)        |                                   | [+][-][rot][rot]|
|                    |   C. SCENE 3D (toàn màn hình, nền)| [home]          |
|                    |                                   | D. DETAIL PANEL |
|                    |                                   | (~23% rộng)     |
|                    |                                   |                 |
| E. SHIPMENT TRACKING (dưới-trái, ~60% rộng)            | F. FLEET BOARD  |
|                                                        | (dưới-phải ~30%)|
+--------------------------------------------------------------------------+
```
| Vùng | Vị trí | Vai trò |
| --- | --- | --- |
| A. Top bar | Trên cùng, kính trắng mờ | Nhận diện, tìm kiếm toàn cục, đổi kho, trạng thái Live, người dùng |
| B. KPI | Trên-trái, 3 thẻ ngang | Ba chỉ số của kho đang xem, có mũi tên tăng và delta |
| C. Scene | Phủ toàn khung, nằm dưới mọi HUD | Diorama 3D của kho hiện tại |
| Map controls | Cột nút dọc, cạnh trái của panel D | Zoom in, zoom out, xoay trái, xoay phải, về vị trí gốc |
| D. Detail panel | Phải, dưới top bar | Thẻ chi tiết của đối tượng đang chọn (mặc định là chính kho) |
| E. Shipment tracking | Dưới-trái | Dòng thời gian 5 bước của lô hàng gắn với xe đang chọn |
| F. Fleet board | Dưới-phải | Ba tab: Docks, Forklifts, Trucks; mỗi dòng bấm được |
## 4. Đặc tả component
Phong cách chung: thẻ nền trắng độ mờ cao (khoảng 85–90%) kèm backdrop-blur, bo góc lớn (khoảng 16–20px), đổ bóng mềm ánh xanh, viền rất nhạt. **\[Suy luận\]** chi tiết CSS.
### 4.1 Top bar
**\[Quan sát\]** Từ trái sang phải:
- Logo: khối lập phương xanh trong ô bo góc + chữ "WareTrack" đậm.
- Ô tìm kiếm với placeholder "Search sites, trucks, forklifts, pallets, shipments..." và phím tắt gợi ý `/`.
- **Site switcher**: huy hiệu xanh "WH-01" + tên kho (Riverside Hub) + dòng phụ "78% full · 1/2 docked", có nút chuyển kho kế tiếp và mũi tên mở danh sách.
- Chip xanh lá "Live 09:40" có chấm nhấp nháy (đồng hồ mô phỏng).
- Chuông thông báo, đường kẻ dọc, avatar + "Alex Chen / Operations Manager" + mũi tên menu.
### 4.2 Thẻ KPI (ba thẻ)
**\[Quan sát\]** Mỗi thẻ có icon vuông, nhãn nhỏ, số lớn, mũi tên tăng xanh lá + delta, dòng chú thích.
| Thẻ | Ví dụ | Chú thích |
| --- | --- | --- |
| Stock on hand | 1,412 (+15) | pallets · WH-01 |
| Trucks on site | 1 (+1) | 1 inbound · WH-01 |
| On-time delivery | 96.6% (+0.4%) | last 30 days |
Khi đổi kho, số **đếm chạy** (count tween) từ giá trị cũ sang mới (thấy 1,412 → 1,042 → 610 khi chuyển WH-01 sang WH-04).
### 4.3 Map controls
**\[Quan sát\]** Một cột nút tròn dọc gồm năm nút: `+`, `−`, xoay ngược chiều kim đồng hồ, xoay thuận chiều, và nút "home" đưa camera về góc nhìn mặc định. Kéo chuột (con trỏ hình bàn tay) để pan, cuộn để zoom.
### 4.4 Detail panel — năm biến thể
**\[Quan sát\]** Khung chung: dòng eyebrow chữ xanh nhỏ in hoa (loại đối tượng · mã kho) → tiêu đề đậm → dòng phụ xám. Góc phải có ba nút: định vị/ghim, mở rộng (link ngoài), đóng (X). Dưới đó là chip trạng thái và các trường.
| Biến thể | Eyebrow | Nội dung |
| --- | --- | --- |
| Site | DEPOT, DISTRIBUTION CENTER, COLD STORE, CROSS-DOCK, AUTOMATED DC · WH-0x | Tên + địa chỉ; chip Operational + "2 docked · 1 arriving · 3 staged"; 4 ô số (Stock on hand n / sức chứa + thanh xanh dương; Truck bays a / b busy + thanh xanh lá; Outbound today; Put-aways today); bảng Inventory (icon, tên, số lượng, chip In Stock xanh lá hoặc Low Stock cam); mục Forklift fleet "1/2 working" và dòng xe nâng kèm % tiến độ |
| Forklift | FORKLIFT · WH-0x | FL-xx, tài xế · model (vd. Sam Haddad · Toyota 8FBE18); chip Loading truck, Unloading truck hoặc Charging; thanh tiến độ + pin %; Carrying (Empty hoặc mã pallet · tên hàng); Moves today; Speed (km/h); Charger; Site |
| Pallet | PALLET · nhóm hàng (vd. PPE) | Tên hàng, mã PAL-xxxx · SKU; chip Staged hoặc Moving; Quantity, Gross weight, Location (Yard slot hoặc "Forklift FL-xx"), Lot, Received, Site |
| Charger | CHARGER · WH-0x | C1, mô tả "48 V lithium-ion forklift charger"; chip Free hoặc đang sạc cho FL-xx; Sessions today, Energy today (kWh), Charge rate (% mỗi phút), Site |
| Truck | Tên hãng in hoa | TRK-xxxx, tài xế · biển số; chip En route, At gate, Docking, Loading hoặc Unloading + dòng mô tả (vd. "Reversing into Bay 3"); thanh tiến độ ("x m left" hoặc "x/6 pallets"); Shipment #SHP-xxxxx, Customer, Destination, ETA, Speed, Bay, Cargo (n/6 pallets · tấn) |
### 4.5 Shipment tracking (dưới-trái)
**\[Quan sát\]** Thẻ ngang chia hai nửa.
- **Nửa trái, stepper 5 bước:** Order Confirmed (giờ) → Picked (giờ) → Loading hoặc Loaded (kèm "2/6" và ETA) → In Transit (ETA) → Delivered (ETA). Bước đã xong là vòng tròn xanh đặc kèm icon, bước hiện tại có quầng sáng, bước tương lai xám. Đoạn nối đã qua màu xanh, chưa qua màu xám. Góc phải tiêu đề ghi "TRK-2051 · WareTrack".
- **Nửa phải, thẻ lô hàng:** ảnh xe nhỏ, "#SHP-78442", "To: Philadelphia, PA", chip trạng thái (Loading, Unloading, En route, Docking), dòng "WH-01 · Bay 1 · 13 min left", mũi tên mở chi tiết.
Stepper **đổi theo xe đang chọn**; với xe nhập kho, bước thứ ba thành "Unloading n/6". Số phút còn lại giảm theo đồng hồ mô phỏng (13 → 11 → 10 → 6 min).
### 4.6 Fleet board (dưới-phải)
**\[Quan sát\]** Ba tab dạng pill kèm bộ đếm: "Docks 2/2", "Forklifts 1/2", "Trucks 2"; bên phải là tên kho hiện tại. Mỗi dòng bấm được (mở panel và đưa camera tới đối tượng). Đổi tab có hiệu ứng cross-fade.
| Tab | Dòng mẫu |
| --- | --- |
| Docks | Bay 1 · WH-01: chấm màu hãng + TRK-2051 · WareTrack + chip Loading + tiến độ 2/6; Bay 2: "No truck assigned" + chip Available; Inbound: TRK-2287 · Bluepeak + chip En route + "3 min" |
| Forklifts | FL-10 · "Unloading TRK-2205 at In 1" + chip Unloading + 84%; FL-12 · "Charging at bay" + chip Charging + 85% |
| Trucks | TRK-2229 · Nordline · "WH-04 · Out 2" · Loading · 3/6; TRK-2307 · "To WH-04" · Docking; TRK-2481 · Cargoviva · "To WH-04" · En route · "1 min" |
Bảng màu chip trạng thái **\[Quan sát\]**:
| Trạng thái | Màu chip |
| --- | --- |
| Operational, In Stock, Loading, Unloading, Free | nền xanh lá nhạt, chữ xanh lá |
| Low Stock, Charging, At gate | nền cam nhạt, chữ cam |
| En route, Docking | nền xanh dương nhạt, chữ xanh dương |
| Available, Delivered, chưa tới | nền xám nhạt, chữ xám |

**\[v2\] Độ tương phản chữ trên chip.** Màu lấy mẫu từ video hợp với *thanh tiến độ*. Nhưng nếu dùng đúng màu đó cho *chữ* 12px trên nền chip nhạt thì không đạt WCAG AA (cần ≥ 4.5:1): cam `#E8830C` trên `#FFE3AF` chỉ khoảng 2.2:1, xanh lá `#22B249` trên `#DDF6E2` khoảng 2.4:1. Giữ màu thanh như cũ, còn chữ chip dùng tông đậm: xanh lá `#166534` (~6:1), cam `#9A5200` (~4.7:1), xanh dương `#1D4ED8`, xám `#475569`.

**\[v2\] Bấm vào cửa dock.** Nguyên tắc 2 nói dock bấm được, nhưng panel chỉ có năm biến thể và không có biến thể Dock. Quy ước: nếu dock có xe thì chọn xe đó; nếu dock trống thì mở panel Site và cuộn tới ô "Truck bays".
### 4.7 Tìm kiếm và thông báo **\[v2\]**
Bản gốc có ô tìm kiếm và chuông nhưng không mô tả hành vi. Đặc tả tối thiểu:
- **Tìm kiếm:** phím `/` để focus. Tìm theo mã (WH-, TRK-, FL-, PAL-, SHP-) và theo tên, khớp mờ, không phân biệt hoa thường. Kết quả nhóm theo loại, tối đa 5 dòng mỗi loại, ưu tiên site đang xem. Enter thì ghi vào `selected`, đổi site nếu cần và đưa camera bay tới đối tượng. Esc để đóng.
- **Thông báo:** là bộ lọc của event log, chỉ giữ sự kiện cần hành động: xe tới cổng, hàng xuống Low Stock, pin xe nâng < 20%, xe trễ ETA. Chấm trên chuông cho biết số chưa đọc. Bấm vào một thông báo thì chọn đối tượng liên quan.
## 5. Scene 3D
### 5.1 Camera
- **\[Quan sát\]** Góc nhìn chếch từ trên xuống kiểu isometric. Có thể kéo để pan, cuộn để zoom từ toàn cảnh khu kho xuống cận cảnh xe nâng, xoay từng bước bằng hai nút xoay.
- **\[Quan sát\]** Đổi kho: camera bay sang kho mới (fly-to) rồi ổn định ở góc nhìn tổng quan. Panel mờ dần rồi nạp dữ liệu kho mới trong lúc số KPI đếm chạy.
- **\[Suy luận\]** Camera phối cảnh với FOV hẹp (hình cận cảnh vẫn có chút phối cảnh) hoặc orthographic kèm zoom; giới hạn góc nghiêng và khoảng cách để người dùng không lạc.
### 5.2 Danh mục asset (đều là hình khối đơn giản)
| Asset | Mô tả quan sát được |
| --- | --- |
| Nhà kho | Khối dài, tường sọc đứng trắng-lavender, mái xanh dương, khung cửa dock xanh đậm; cửa mở thấy thùng carton bên trong; biển hiệu công ty trên tường |
| Cửa dock | Dãy cửa gắn số (D5...), vạch vàng cam sơn dưới sàn tạo ô đỗ xe |
| Xe tải | Đầu kéo + thùng trắng, mỗi hãng một mẫu sơn riêng (xanh dương; trắng-xanh ngọc; trắng-cam; trắng-navy) |
| Xe nâng | Màu vàng cam, cột nâng đen, bánh nhỏ; có đội xe đỗ cạnh trạm sạc |
| Pallet | Chồng thùng carton nâu; thùng nhựa xanh dương xếp trên pallet |
| Kệ hàng | Khung xanh dương, nhiều tầng chứa thùng carton |
| Container | Khối sọc, màu ngọc hoặc xanh |
| Trạm sạc | Hộp trắng nhỏ cạnh bãi xe nâng (C1, C2, C3) |
| Cảnh quan | Cây tròn xanh lá (hai cỡ), hàng rào xám trong suốt, đường nhựa lavender có vạch trắng đứt, vỉa cỏ nhạt |
| Nhà phụ cận | Khối trắng, ô cửa sổ xanh dạng lưới; kho lạnh có mái phẳng, dàn quạt, silo trắng; DC tự động có mặt kính xanh |
| Pin định vị | Giọt nước xanh dương nổi trên pallet quan trọng/đang chờ, bấm được |
### 5.3 Vật liệu, ánh sáng, hậu kỳ
- Vật liệu phẳng (flat/matte), không texture; màu dựa trên bảng tông xanh dương, trắng và lavender.
- Bóng đổ mềm, có ambient occlusion nhẹ ở chân vật thể. **\[Suy luận\]**
- Sương mờ lavender ở rìa và xa, hiệu ứng tilt-shift/độ sâu trường ảnh ở mép khung hình (góc trên-phải thấy mờ). **\[Suy luận\]**
- Toàn cảnh sáng, tương phản thấp; thông tin nổi bật nhờ màu xanh nhấn chứ không nhờ độ tối.
### 5.4 Lớp phủ trong scene
| Lớp phủ | Khi nào | Hình thức |
| --- | --- | --- |
| Chip nhãn nổi | Hover hoặc chọn | Viên thuốc nhỏ trên đầu vật thể: "FL-01 · Loading truck", "TRK-2205 · Unloading", "PAL-1026 · Safety Helmet" |
| Khung góc | Đang chọn xe | Bốn góc khung xanh dương bao quanh xe |
| Vòng sáng dưới chân | Hover trạm sạc, ô dock | Tấm xanh bán trong suốt; hover cửa dock hiện nhãn "In 2 · Docking" |
| Đường dẫn | Chọn xe đang tới | Đường xanh đậm dày trên mặt đường, rồi nét đứt cong tới pin ở bãi đỗ; xe chạy theo đường này |
| Pin định vị | Luôn hiện | Giọt nước xanh trên pallet, bấm mở panel Pallet |
## 6. Hành vi và kịch bản tương tác (đã quan sát)
1. **Mở màn** ở WH-01 với panel kho (Site) bên phải.
2. **Chọn xe nâng** → panel chuyển sang Forklift, chip nhãn nổi trên xe, khung bao quanh.
3. **Chọn pallet** → panel Pallet (Staged); khi xe nâng nhấc pallet, panel đổi thành Moving với "On forks of FL-01" (dữ liệu bám theo mô phỏng, không chỉ là tĩnh).
4. **Đổi kho** qua site switcher → camera bay, KPI đếm chạy, bảng F và thẻ E nạp lại cho kho mới.
5. **Chọn trạm sạc** (C1) → panel Charger cho biết xe nâng nào đang dùng.
6. **Bấm dòng trong Fleet board** (xe tải En route) → panel Truck mở, đường xanh vẽ trên đường; xe tiến về cổng, trạng thái chuyển En route → At gate → Docking → Unloading.
7. **Đổi tab Docks / Forklifts / Trucks** → cross-fade bảng; dòng hiện đúng đối tượng của kho đó.
8. **Điều khiển camera** bằng kéo, cuộn, hai nút xoay, nút home; trong 72 giây, người dùng zoom từ toàn cảnh xuống tận mặt cửa dock rồi xoay quanh kho lạnh.
9. **Vòng lặp:** cuối video quay về WH-01, như một demo tự lặp.
## 7. Mô hình dữ liệu và mô phỏng
### 7.1 Năm kho trong demo
**\[Quan sát\]** Số liệu đọc từ panel và top bar; địa chỉ đọc bằng mắt nên có thể lệch một chữ. Số xe tại kho và số dock đang dùng thay đổi theo mô phỏng.
| Mã | Tên | Loại | Địa chỉ | Tồn / sức chứa | Đầy · dock | Outbound / put-aways | On-time | Nét riêng của scene |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| WH-01 | Riverside Hub | Depot | 12 Riverside Dr, Newark NJ | 1,412 / 1,800 | 78% · 2 bay | 23 / 15 | 96.6% | Cụm ba nhà kho xanh đặc, kệ pallet, container ngoài sân |
| WH-02 | Northgate DC | Distribution Center | 480 Northgate Blvd, Newark NJ | 3,310 / 4,200 | 79% · 4 bay | 21 / 35 | 98.2% | Nhà kho rất dài, hơn tám cửa dock, mặt tiền kính |
| WH-03 | Eastport Cold Chain | Cold Store | 7 Harbor Way, Elizabeth NJ | 990 / 1,400 | 71% · 3 bay | 31 / 20 | 96.0% | Mái phẳng có dàn quạt, silo trắng |
| WH-04 | Southfield Cross-Dock | Cross-Dock | 2200 Southfield Ave, Linden NJ | 610 / 1,600 | 38% · 6 dock | 29 / 20 | 96.2% | Dãy cửa nhiều xe vào ra, sân đỗ rộng, trạm sạc xe nâng |
| WH-05 | Westgate Robotics Hub | Automated DC | 300 Westgate Rd, Kearny NJ | 1,730 / 2,400 | 72% · 4 bay | 33 / 25 | 95.9% | Khối trắng khung xanh, bốn cửa lớn |
Mỗi kho có bốn dòng Inventory (vd. Cardboard Box (M), Plastic Container, Safety Helmet, Packing Tape, LED Panel 60×60, Nitrile Gloves, Frozen Peas 10 kg, Spring Water 24-pack, Office Chair); thường có một dòng ở trạng thái Low Stock.
### 7.2 Kiểu dữ liệu đề xuất **\[Suy luận\]**
```ts
type SiteKind = 'depot' | 'distribution_center' | 'cold_store' | 'cross_dock' | 'automated_dc';
type TruckState = 'en_route' | 'at_gate' | 'docking' | 'unloading' | 'loading' | 'departing' | 'in_transit' | 'delivered';
type ForkliftState = 'idle' | 'fetching' | 'loading_truck' | 'unloading_truck' | 'returning' | 'queued_for_charger' | 'charging'; // [v2] thêm returning, queued_for_charger
type PalletState = 'in_rack' | 'staged' | 'moving' | 'loaded';
type DockState = 'available' | 'reserved' | 'occupied'; // [v2] mục 7.3 có máy trạng thái dock nhưng bản gốc không có field này
interface Site {
  id: string;            // 'WH-01'
  name: string;
  kind: SiteKind;
  address: string;
  capacity: number;      // pallets
  docks: Dock[];
  chargers: Charger[];
  inventory: InventoryItem[];
  layout: string;        // khoá preset scene
  kpiBaseline: { stockOnHand: number; trucksOnSite: number; onTimePct30d: number }; // [v2] mốc đầu ngày để tính delta; on-time 30 ngày cần lịch sử giả lập
}
interface Dock { id: string; label: string; direction: 'in' | 'out'; state: DockState; truckId?: string }
interface Charger { id: string; label: string; ratePctPerMin: number; forkliftId?: string; queue: string[]; sessionsToday: number; energyKwhToday: number } // [v2]
interface InventoryItem { sku: string; name: string; icon: string; qty: number; lowStockThreshold: number } // [v2]
interface Carrier { id: string; name: string; livery: { cab: string; trailer: string; stripe?: string } }  // [v2]
interface Truck {
  id: string; carrierId: string; driver: string; plate: string;
  siteId: string | null;  // [v2] null = đang chạy giữa hai site, không render
  state: TruckState; dockId?: string; shipmentId: string;
  pos: [number, number, number]; route?: [number, number, number][];
  cargo: { pallets: number; capacity: number; weightKg: number }; // [v2] capacity thay cho hằng số 6
  speedKmh: number;
}
interface Forklift {
  id: string; siteId: string; driver: string; model: string; state: ForkliftState;
  battery: number; carrying?: string; movesToday: number; speedKmh: number;
  chargerId?: string; task?: { truckId: string; dockId: string };
}
interface Pallet {
  id: string; siteId: string; sku: string; name: string; qty: number; weightKg: number; lot: string;
  receivedAt: number; state: PalletState;
  location: { kind: 'slot' | 'forklift' | 'truck'; ref: string };
}
interface Shipment {
  id: string; customer: string; destination: string; truckId: string;
  direction: 'inbound' | 'outbound';  // [v2] bước 3 hiện "Loading" hay "Unloading" tuỳ hướng
  steps: { key: 'confirmed' | 'picked' | 'handling' | 'in_transit' | 'delivered'; at?: number; eta?: number }[];
}
interface SimEvent { t: number; type: string; siteId: string; entityId: string; payload?: unknown }
type Selection = { kind: 'site' | 'truck' | 'forklift' | 'pallet' | 'charger'; id: string } | null;
```
Lựa chọn (selection) là một biến duy nhất: `selected: Selection`, cộng thêm `hovered`. Scene, Fleet board, thanh tìm kiếm, thông báo và thẻ tracking đều ghi vào cùng biến này.

**\[v2\] Đối tượng đang chọn rời đi.** Khi xe tải đang chọn rời site hoặc thực thể bị xoá, panel không được trống hay crash. Giữ thẻ ở trạng thái mờ với dòng "Đã rời WH-04 · đang tới WH-02" kèm nút "Theo dõi". Esc hoặc chọn đối tượng khác thì bỏ thẻ đó.
### 7.3 Máy trạng thái **\[Suy luận từ các chip trạng thái đã thấy\]**
- **Xe tải nhập kho:** en\_route → at\_gate → docking (lùi vào bay, tốc độ giảm còn khoảng 10–22 km/h) → unloading (n/6 pallet) → departing.
- **Xe tải xuất kho:** docking → loading (n/6) → departing → in\_transit → delivered.
- **Xe nâng:** idle → fetching → loading\_truck hoặc unloading\_truck → returning → idle. **\[v2\]** Khi pin < 20% (chỉ xét lúc idle, không bỏ dở việc đang làm), xe tới trạm sạc trống gần nhất (C1, C2, C3), sạc tới ≥ 95% rồi về idle. Không còn trạm trống thì chuyển sang queued\_for\_charger.
- **Dock:** available → reserved (xe tới cổng) → occupied → available.
- **Pallet:** in\_rack hoặc staged → moving (trên càng xe nâng) → loaded.
- **Shipment:** các mốc Order Confirmed, Picked, Loaded, In Transit, Delivered lấy từ event log; chữ "ETA" tính từ đồng hồ mô phỏng.
### 7.4 Engine mô phỏng
- **Đồng hồ:** trong video đồng hồ chạy từ 09:40 đến 09:54 trong khoảng 70 giây quay, tức nhanh cỡ 12 lần thời gian thực **\[Suy luận\]**. Hãy làm hệ số tốc độ điều chỉnh được.
- **Bước thời gian cố định** (fixed timestep), RNG có seed để demo lặp lại được, event bus ghi mọi chuyển trạng thái.
- **Tách engine khỏi React:** thuần TypeScript, có unit test. UI chỉ đọc qua selector (KPI, chip, ETA, số "min left"). Renderer nội suy vị trí giữa các tick.
- **Giá trị suy ra:** ETA = số pallet còn lại × thời gian mỗi pallet; Trucks on site = số xe đang ở trong kho; delta KPI so với mốc đầu ngày.
- **\[v2\] Đã chốt: mô phỏng thật, thêm lớp "đạo diễn" nếu cần.** Bản gốc để ngỏ câu hỏi "kịch bản dàn dựng hay mô phỏng thật", nhưng starter prompt lại bắt buộc máy trạng thái và RNG, tức là ngầm chọn mô phỏng thật. Bản v2 chốt luôn: engine là mô phỏng thật (có seed nên vẫn lặp lại được). Nếu cần quay video demo, thêm một `DemoDirector` nằm ngoài engine, chỉ điều khiển camera và selection theo timeline, không can thiệp trạng thái mô phỏng.
- **\[v2\] Nhịp tick:** engine tick cố định 10 lần mỗi giây theo thời gian mô phỏng. Hệ số tốc độ mặc định 12×, chỉnh được từ 1× đến 60× và tạm dừng được (phím Space). Renderer nội suy vị trí giữa hai tick.
- **\[v2\] Mọi site chạy cùng lúc.** Site switcher hiện "% full · docked" của mọi kho, Fleet board có xe "To WH-04", nên cả năm site phải tick song song. Chỉ site đang xem được render 3D; các site khác chỉ chạy logic.
- **\[v2\] Xe đi giữa các site:** xe rời site thì đặt `siteId = null`, trạng thái in\_transit, ETA tính từ bảng khoảng cách giả lập `siteDistancesKm`. Tới nơi thì xe xuất hiện ở mép bản đồ của site đích, trạng thái en\_route.
## 8. Design tokens
Các mã màu có dấu (m) là **lấy mẫu pixel trực tiếp** từ khung hình nên khá đáng tin; phần còn lại là ước lượng **\[Suy luận\]**.
| Token | Giá trị | Ghi chú |
| --- | --- | --- |
| ground | #F9FAFD (m) | Sàn, mặt đường sáng |
| lavender | #D2D8EB (m) | Bóng đổ, vùng đất tối hơn |
| brand-roof | #144FCB (m) | Xanh đậm của mái nhà kho |
| accent-bar | #3B79F4 (m) | Thanh tiến độ xanh dương, màu nhấn UI |
| success-bar | #22B249 (m) | Thanh tiến độ xanh lá |
| chip-success-bg | #DDF6E2 (m), #E7F7E2 (m) | Nền chip Operational, In Stock |
| chip-warning-bg | #FFE3AF (m) | Nền chip Low Stock; chữ cam trong video khoảng #E8830C, nhưng **\[v2\]** dùng #9A5200 để đủ tương phản (mục 4.6) |
| chip-text-* **\[v2\]** | success #166534 · warning #9A5200 · info #1D4ED8 · neutral #475569 | Chữ trên chip, đều ≥ 4.5:1 với nền chip tương ứng |
| tile-bg | #ECF4FD (m) | Ô số trong panel, nền thẻ phụ |
| topbar-bg | #F2F5FC (m) | Nền thanh trên |
| hud-bg | trắng 85–90% + blur 12–20px | Panel kính |
| text | Navy gần đen; phụ là xám xanh | Ước lượng |
| font | Họ Inter (khớp bằng mắt), số tabular | Trọng số 500, 600, 700 |
| cỡ chữ | Eyebrow 11px in hoa; tiêu đề 18–20px; thân 13–14px; chip 12px | Ước lượng |
| bo góc | Thẻ 16–20px; ô số 12px; chip tròn hoàn toàn; nút tròn | Ước lượng |
| bóng | Mềm, rộng, ánh xanh nhạt, độ mờ thấp | Ước lượng |
| chuyển động | Panel 200–300ms; đếm số 600–900ms; camera bay 1–1.5s ease-in-out | Ước lượng |
Chỉ dùng **một** màu nhấn. Màu trạng thái (xanh lá, cam) chỉ xuất hiện ở chip và thanh tiến độ, không dùng làm màu trang trí.
## 9. Stack đề xuất và cấu trúc thư mục **\[Suy luận\]**
Video không tiết lộ stack; đây là lựa chọn hợp lý cho đúng loại sản phẩm này.
| Lớp | Lựa chọn | Lý do |
| --- | --- | --- |
| Ứng dụng | Vite + React + TypeScript | Khởi động nhanh, hợp với Claude Code |
| 3D | three.js qua @react-three/fiber và drei | Raycast, Html, Outlines, Instances, camera controls có sẵn |
| Hậu kỳ | @react-three/postprocessing | AO nhẹ, tilt-shift, bloom rất nhẹ |
| State | Zustand | Một store cho mô phỏng, một cho selection và camera |
| UI | Tailwind + Radix (Tabs, Popover, Tooltip) | Panel và pill nhất quán |
| Chuyển động | Framer Motion | Panel mờ dần, cross-fade tab |
| Icon | lucide-react | Bộ nét mảnh khớp với phong cách |
| Asset 3D | Dựng bằng code từ hình khối, InstancedMesh cho thùng, cây, hàng rào | Hình khối rất đơn giản, không cần file GLB |
| Test | Vitest cho engine mô phỏng | Engine thuần TS, test nhanh |
| Kiểm tra giao diện **\[v2\]** | Playwright | Chụp màn hình tự động ở 1440×900 và 1920×1080 sau mỗi giai đoạn |

**\[v2\] Phiên bản:** @react-three/fiber đi theo major của React (v8 ↔ React 18, v9 ↔ React 19). Yêu cầu agent chọn một bộ phiên bản ổn định tương thích nhau và ghi lại trong README, đừng để npm kéo bản mới nhất lệch major.
```
src/
  sim/       engine thuần TS: clock, rng, state machine, events, selectors
  data/      preset các site, danh mục hàng, hãng vận tải (đặt tên giả)
  scene/     R3F: World, Site, Warehouse, Truck, Forklift, Pallet, Rack, Roads, Trees, Overlays
  hud/       TopBar, KpiBar, MapControls, DetailPanel/*, ShipmentTracking, FleetBoard
  store/     zustand: sim, selection, camera
  design/    tokens.css, primitives (Chip, Panel, Tile, ProgressBar)
```
## 10. Kế hoạch triển khai theo giai đoạn
**\[v2\]** Bản gốc khuyên "làm engine mô phỏng sớm (P5)" nhưng bảng lại xếp engine ở P5, sau cả bước HUD dùng dữ liệu mock, còn starter prompt thì bảo làm tuần tự P0→P7, nên lời khuyên này không bao giờ được áp dụng. Bản v2 đưa engine lõi lên P1. Nhờ vậy HUD đọc dữ liệu thật qua selector ngay từ đầu, không phải viết dữ liệu mock rồi bỏ đi.
| Giai đoạn | Việc | Tiêu chí hoàn thành |
| --- | --- | --- |
| P0 Nền | Scaffold, tokens, font, layout HUD rỗng đúng tỉ lệ, script Playwright chụp màn hình | Khung HUD khớp bố cục mục 3 ở 1440×900 và 1920×1080; `npm run build` không lỗi |
| P1 Engine lõi | Đồng hồ, RNG có seed, máy trạng thái xe tải, xe nâng, dock, pallet; event log; selector KPI; một site; chưa có UI | Vitest phủ mọi chuyển trạng thái ở mục 7.3; chạy headless 30 phút mô phỏng không kẹt; cùng seed cho ra cùng event log |
| P2 Scene tĩnh | Sàn, đường, hàng rào, cây, một nhà kho; camera pan, zoom, xoay 90° bằng năm nút | ≥ 55 fps ở 1080p trên laptop GPU tích hợp, DPR ≤ 1.5; xoay mượt |
| P3 Thực thể sống | Xe tải (ít nhất bốn livery), xe nâng, pallet, kệ, trạm sạc, pin định vị; vị trí đọc từ engine, nội suy giữa các tick | Chuyển động khớp trạng thái engine; thùng và cây dùng instancing |
| P4 HUD | Top bar, KPI, panel năm biến thể, tracking, fleet board, tìm kiếm, thông báo; tất cả đọc qua selector | Mọi chuỗi chữ, chip, thanh tiến độ khớp mục 4; chữ chip đạt ≥ 4.5:1 |
| P5 Chọn lọc | Raycast, overlay hover/select, đồng bộ scene, panel, board, tìm kiếm; xử lý đối tượng rời site | Chọn ở đâu cũng ra cùng một đối tượng; Esc bỏ chọn; không lỗi khi xe đang chọn rời đi |
| P6 Đa site | Năm preset chạy song song, site switcher, camera bay, KPI đếm chạy, xe đi giữa các site | Đổi site < 2 giây; đổi qua lại 50 lần mà bộ nhớ không tăng quá 10% |
| P7 Hoàn thiện | Hậu kỳ, chuyển cảnh, phím tắt (/, Esc, Space), trạng thái trống và lỗi, prefers-reduced-motion, chế độ hạ chất lượng, bố cục di động (bottom sheet) | Tự hạ chất lượng khi FPS < 45 kéo dài 3 giây; mọi thao tác chính làm được bằng bàn phím |
## 11. Starter prompt **\[v2\]** (điền các biến trong ngoặc nhọn kép `{{…}}`, rồi dán nguyên văn)
Bản gốc ghi "điền phần trong ngoặc kép nhọn" nhưng biến lại dùng `{{…}}`, không có danh sách biến, và `{{CÁC THỰC THỂ}}`, `{{N}}` không có giá trị mẫu. Ngoài ra prompt vừa có `{{NGÀNH}}` vừa ghi cứng từ vựng kho vận (site switcher, fleet board, năm biến thể, xanh dương, lavender), nên đổi ngành vẫn ra app kho vận. Bản v2 đưa mọi chỗ phụ thuộc domain thành biến:
| Biến | Ý nghĩa | Mặc định (kho vận) |
| --- | --- | --- |
| `{{TÊN_SẢN_PHẨM}}` | Tên app, tự đặt, không trùng thương hiệu thật | DockSight |
| `{{NGÀNH}}` | Domain | mạng lưới kho vận |
| `{{VAI_TRÒ}}` | Người dùng chính | Operations Manager |
| `{{SITE}}` · `{{N_SITE}}` | Đơn vị cơ sở và số lượng | kho · 5 |
| `{{THỰC_THỂ}}` | Các thực thể có máy trạng thái | xe tải, xe nâng, dock, pallet, trạm sạc |
| `{{VÒNG_ĐỜI}}` | Năm bước của đối tượng chính | Order Confirmed → Picked → Loading/Unloading → In Transit → Delivered |
| `{{BẢNG_TAB}}` | Ba tab của bảng điều phối | Docks · Forklifts · Trucks |
| `{{KPI}}` | Ba KPI | Stock on hand · Trucks on site · On-time delivery |
| `{{MÀU_NHẤN}}` · `{{NỀN}}` | Một màu nhấn và tông nền | xanh dương #3B79F4 · lavender sáng |
```
Bạn là kỹ sư frontend/3D cấp cao. Hãy xây ứng dụng web "{{TÊN_SẢN_PHẨM}}": giao diện vận hành 3D kiểu game chiến thuật (digital twin) cho {{NGÀNH}}. Tài liệu đính kèm là đặc tả. Nếu tài liệu mâu thuẫn với prompt này thì làm theo prompt và báo lại cho tôi.

BỐI CẢNH
- Người dùng: {{VAI_TRÒ}}, theo dõi {{N_SITE}} {{SITE}} cùng lúc.
- Trải nghiệm cốt lõi: bản đồ 3D isometric phủ toàn màn hình là giao diện chính; HUD kính mờ nổi lên trên; thế giới mô phỏng chạy liên tục; mọi thực thể đều bấm được.

YÊU CẦU BẮT BUỘC
1. Stack: Vite + React + TypeScript; three.js qua @react-three/fiber và drei; Zustand; Tailwind + Radix; Framer Motion; Vitest; Playwright. Chọn một bộ phiên bản ổn định tương thích nhau (R3F phải khớp major của React) và ghi vào README. Asset 3D dựng bằng code từ hình khối, vật thể lặp dùng InstancedMesh.
2. Bố cục HUD theo mục 3–4: top bar (logo, tìm kiếm có phím /, chuyển {{SITE}}, chip Live + đồng hồ mô phỏng, chuông, avatar); ba thẻ KPI ({{KPI}}) ở trên-trái; cột nút camera (+, −, xoay trái, xoay phải, home); panel chi tiết bên phải, mỗi loại thực thể một biến thể; thẻ vòng đời năm bước ({{VÒNG_ĐỜI}}) ở dưới-trái; bảng điều phối ba tab ({{BẢNG_TAB}}) ở dưới-phải.
3. Engine mô phỏng nằm trong src/sim: TypeScript thuần, không import React hay three. Tick cố định 10 Hz; hệ số tốc độ mặc định 12× (chỉnh 1×–60×, tạm dừng được); RNG có seed; event log; máy trạng thái cho {{THỰC_THỂ}} theo mục 7.3. Mọi {{SITE}} tick song song, chỉ site đang xem được render. UI chỉ đọc dữ liệu qua selector.
4. Lựa chọn: một nguồn sự thật duy nhất `selected: {kind, id} | null` cộng thêm `hovered`. Scene, bảng điều phối, tìm kiếm và thông báo đều ghi vào đây. Khi đối tượng đang chọn rời đi, panel giữ thẻ ở trạng thái mờ kèm dòng "đã rời…", không để trống, không crash.
5. Thẩm mỹ theo token mục 8: low-poly sạch, không texture, nền {{NỀN}}, chỉ một màu nhấn {{MÀU_NHẤN}}; màu trạng thái chỉ dùng cho chip và thanh tiến độ; chữ trên chip đạt tương phản ≥ 4.5:1.
6. Phi chức năng: ≥ 55 fps ở 1080p trên laptop GPU tích hợp (DPR ≤ 1.5), tự hạ chất lượng khi FPS tụt; tôn trọng prefers-reduced-motion (tắt camera bay và hiệu ứng đếm số); mọi thao tác chính làm được bằng bàn phím qua bảng điều phối và tìm kiếm.
7. Dữ liệu: {{N_SITE}} preset theo mục 7.1, số liệu giả lập hợp lý; không dùng tên, logo hay livery của thương hiệu thật.

CÁCH LÀM VIỆC
- Trước khi viết code: tóm tắt kế hoạch và giả định (tối đa 15 dòng) kèm danh sách câu hỏi mở, rồi chờ tôi xác nhận.
- Làm lần lượt từ P0 đến P7 theo mục 10. Hết mỗi giai đoạn: chạy `npm run build` và `npm test`; mở app bằng Playwright, chụp màn hình ở 1440×900 và 1920×1080; tự đối chiếu với cột "Tiêu chí hoàn thành"; báo cáo ngắn (đã làm · bằng chứng · còn thiếu) rồi DỪNG lại chờ tôi duyệt.
- Không thêm tính năng ngoài tài liệu. Gặp quyết định mà tài liệu chưa nói: hỏi tôi, kèm phương án bạn đề xuất.
```
## 12. Thích ứng sang domain khác
Giữ nguyên cấu trúc, đổi từ vựng. Mỗi khái niệm trong kho vận có một vai trò chung:
| Trong WareTrack | Vai trò chung | Ví dụ ở domain khác |
| --- | --- | --- |
| Site (kho) | Cơ sở/khu vực chứa hoạt động | Bệnh viện, cảng, nhà máy, sân bay, trang trại |
| Truck | Thực thể di động đến và đi | Xe cứu thương, tàu, máy bay, xe giao hàng |
| Forklift | Tác nhân làm việc, có pin/năng lượng | Y tá, robot, máy kéo, drone |
| Dock/Bay | Tài nguyên cố định có hàng đợi | Giường bệnh, cầu cảng, cổng ra máy bay |
| Pallet | Đơn vị vật phẩm cần theo dõi | Mẫu xét nghiệm, container, hành lý |
| Charger | Tài nguyên phụ trợ dùng chung | Trạm bảo trì, trạm nạp, phòng khử khuẩn |
| Shipment stepper | Vòng đời năm bước của đối tượng chính | Hành trình bệnh nhân, lô sản xuất, chuyến bay |
| Ba KPI | Ba chỉ số người điều hành quan tâm nhất | Tuỳ ngành |
Trả lời năm câu hỏi này trước khi viết prompt: (1) thực thể cốt lõi là gì; (2) vòng đời của nó gồm những bước nào; (3) tài nguyên nào khan hiếm và có hàng đợi; (4) ba KPI chính; (5) một màu nhấn của thương hiệu mới.
## 13. Rủi ro, giới hạn và điều chưa biết
- Không biết tác giả dùng stack gì, mất bao nhiêu lượt prompt, có chỉnh tay hay không, hay asset được dựng thế nào.
- Video chỉ dài 72 giây và có thể được dàn dựng; không nên suy ra rằng mô phỏng bên dưới đầy đủ hoặc ổn định lâu dài.
- Hiệu năng: nhiều thực thể cộng hậu kỳ nặng dễ tụt FPS trên laptop yếu và điện thoại; cần instancing, giới hạn DPR, và chế độ hạ chất lượng.
- Trợ năng: canvas 3D không đọc được bằng trình đọc màn hình, nên Fleet board và tìm kiếm phải đủ để làm mọi tác vụ bằng bàn phím.
- Di động: bố cục năm vùng HUD không vừa màn hình nhỏ; cần bố cục riêng (bottom sheet thay cho panel phải).
- Bản quyền và thương hiệu: giữ nguyên tắc và bố cục, nhưng đổi tên, logo, bảng màu chi tiết, livery xe và mọi asset.
- Số liệu trong demo là giả lập, không phải dữ liệu thật.
## 14. Phụ lục: dòng thời gian video (xấp xỉ, theo giây)
Đồng hồ Live chạy từ 09:40 ở giây 0 đến 09:54 ở giây 70.
| Giây | Kho | Điều xảy ra |
| --- | --- | --- |
| 0–6 | WH-01 Riverside Hub | Panel Site; chọn FL-01; chọn pallet PAL-1026; kéo chuột để pan |
| 8–10 | WH-01 sang WH-04 | Pallet chuyển Moving; đổi sang Southfield Cross-Dock, KPI đếm 1,412 sang 610, panel mờ rồi nạp lại |
| 12–14 | WH-04 | Chọn trạm sạc C1; chọn TRK-2205 (khung góc + chip nhãn) |
| 16–22 | WH-04 | Chọn FL-10 và FL-12 (đang sạc); đổi tab Forklifts sang Trucks; chọn TRK-2481 En route, đường xanh hiện trên mặt đường |
| 24–30 | WH-04 | TRK-2481 tiến vào; chọn TRK-2229 (Loading, Out 2); TRK-2205 Unloading |
| 32–38 | WH-02 Northgate DC | Toàn cảnh rồi zoom sát cửa dock, xe Nordline đậu ở cửa, xe nâng ra vào |
| 40–46 | WH-02 sang WH-03 | Cận cảnh xe nâng và pallet; đổi sang Eastport Cold Chain, camera bay rồi xoay quanh nhà lạnh |
| 48–54 | WH-03 | Xoay bằng nút; chọn TRK-2603 (Docking): đường xanh + đường nét đứt tới pin ở Bay 3 |
| 56–62 | WH-04 sang WH-05 | Quay lại WH-04, chọn TRK-2307; đổi sang Westgate Robotics Hub |
| 64–70 | WH-05 sang WH-01 | TRK-2372 docking; FL-15 loading; quay về Riverside Hub, kết thúc ở 09:54
## 15. Nhật ký thay đổi so với bản gốc **\[v2\]**
| # | Vấn đề ở bản gốc | Hệ quả | Cách sửa (mục) |
| --- | --- | --- | --- |
| 1 | Dòng `-----` thừa ở đầu file | Rác khi hiển thị; vài trình đọc hiểu nhầm là front-matter | Xoá |
| 2 | Tên file nói "nhà máy", nội dung là kho vận | Dễ nhầm khi tìm và dùng | Ghi chú đầu file; giữ domain kho vận |
| 3 | Mục 0 bảo đính kèm mục 3–9, starter prompt lại tham chiếu mục 1–10 và 12 | Agent thiếu ngữ cảnh mục 1–2, 10, 12 | Đính kèm toàn bộ (mục 0) |
| 4 | "Ngoặc kép nhọn" nhưng biến dùng `{{…}}`; không có danh sách biến hay giá trị mẫu | Người dùng không biết phải điền gì | Bảng biến + mặc định (mục 11) |
| 5 | Prompt vừa có `{{NGÀNH}}` vừa ghi cứng từ vựng và màu của kho vận | Đổi ngành vẫn ra app kho vận | Đưa mọi chỗ phụ thuộc domain thành biến (mục 11) |
| 6 | Khuyên "làm engine sớm" nhưng xếp engine ở P5 và bắt làm tuần tự | Engine làm muộn; dữ liệu mock viết xong phải bỏ | Engine lõi lên P1 (mục 10) |
| 7 | Để ngỏ "kịch bản hay mô phỏng thật" trong khi prompt bắt buộc mô phỏng | Agent hỏi lại hoặc tự chọn bừa | Chốt mô phỏng thật + `DemoDirector` tuỳ chọn (mục 7.4) |
| 8 | Kiểu dữ liệu thiếu `Charger`, `InventoryItem`, `Carrier`; `Dock` không có `state`; thiếu trạng thái `returning`; bước Shipment ghi cứng `loading`; số pallet "6" là hằng số | Code sinh ra lệch đặc tả | Mục 7.2 |
| 9 | Không nói site không xem có chạy mô phỏng không, dù switcher và board cần số liệu mọi site; không mô hình xe đi giữa các site | Số liệu site khác đứng yên hoặc sai | Mục 7.4 |
| 10 | Không xử lý khi đối tượng đang chọn rời site hoặc biến mất | Panel trống hoặc crash | Mục 7.2 |
| 11 | Dock "bấm được" nhưng không có biến thể panel Dock | Hành vi không xác định | Quy ước ở mục 4.6 |
| 12 | Tìm kiếm và chuông thông báo không có đặc tả hành vi | Mỗi lần sinh code ra một kiểu khác | Mục 4.7 |
| 13 | Chữ chip dùng màu của thanh tiến độ, tương phản chỉ 2.2–2.4:1 | Khó đọc, trượt WCAG AA | Mục 4.6 và 8 |
| 14 | Starter prompt không có điểm dừng sau mỗi giai đoạn, không nói cách "tự kiểm bằng ảnh chụp"; yêu cầu hiệu năng và trợ năng chỉ nằm ở mục 10 và 13 | Agent làm một mạch P0–P7, khó review | Mục 11: build/test, Playwright, dừng chờ duyệt, yêu cầu phi chức năng |
| 15 | Không lưu ý phiên bản thư viện (R3F đi theo major của React) | Dễ cài lệch phiên bản | Mục 9 |
| 16 | KPI "On-time 30 ngày" cần lịch sử mà mô phỏng không có | Delta và số liệu vô nghĩa | `kpiBaseline` trong `Site` (mục 7.2) |