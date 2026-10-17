Toàn bộ phân tích của Claude để làm giống video này, mọi người copy về đổi tên thành .md rồi cho agent triển khai nhé. Có mấy bạn nhắn tin hỏi mình, mình không biết bị vào spam nên không trả lời kịp. Mình cũng chỉ tốn tí token để phân tích chứ không phải cái gì to tát của mình nên chẳng cần giấu, share anh em chơi, làm ra sản phẩm xịn thì còn nhiều thứ lắm.
---------------------------
# WareTrack-style — Tài liệu triển khai giao diện vận hành 3D kiểu chiến thuật
*Phân tích từ video demo của Dilum Sanjaya trên X (72 giây) · 13/10/2026 · Dùng làm đầu vào (brief) khi khởi động một dự án mới theo cùng phong cách*
## 0. Cách đọc và cách dùng tài liệu này
**Nguồn và độ tin cậy.** Toàn bộ phân tích dựa trên một video quay màn hình dài 72 giây (1874×1080, không có âm thanh). Không có mã nguồn, không có prompt, không có link demo trực tiếp. Vì vậy:
- **\[Quan sát\]** — thấy trực tiếp trong video: bố cục, chữ, số liệu, hành vi.
- **\[Suy luận\]** — suy ra từ hình ảnh: stack kỹ thuật, công thức mô phỏng, kích thước chính xác. Cần kiểm chứng khi làm.
- Tweet ghi "Built with Opus 5.5". Video không cho biết cách xây, số lượt prompt hay thời gian bỏ ra, nên đừng coi đó là bằng chứng về quy trình.
- Chữ nhỏ trong video được đọc bằng mắt từ khung hình nén; vài địa chỉ hoặc con số có thể lệch một chữ.
**Cách dùng.**
1. Dán mục 11 (Starter prompt) vào phiên Claude Code hoặc Project mới.
2. Đính kèm các mục 3–9 làm tài liệu tham chiếu.
3. Thay phần domain (mục 12) bằng ngành của bạn; giữ nguyên nguyên tắc, bố cục HUD và vòng lặp tương tác.
4. Không sao chép thương hiệu: logo WareTrack, tên hãng vận tải (Nordline, Cargoviva, Bluepeak) và các mẫu sơn xe là của tác giả. Hãy tự đặt tên và tự dựng asset.
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
type ForkliftState = 'idle' | 'fetching' | 'loading_truck' | 'unloading_truck' | 'charging';
type PalletState = 'in_rack' | 'staged' | 'moving' | 'loaded';
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
}
interface Dock { id: string; label: string; direction: 'in' | 'out'; truckId?: string }
interface Truck {
  id: string; carrierId: string; driver: string; plate: string; siteId: string;
  state: TruckState; dockId?: string; shipmentId: string;
  pos: [number, number, number]; route?: [number, number, number][];
  cargo: { pallets: number; total: number; weightKg: number };
}
interface Forklift {
  id: string; driver: string; model: string; state: ForkliftState;
  battery: number; carrying?: string; movesToday: number; speedKmh: number;
  chargerId?: string; task?: { truckId: string; dockId: string };
}
interface Pallet {
  id: string; sku: string; name: string; qty: number; weightKg: number; lot: string;
  receivedAt: number; state: PalletState;
  location: { kind: 'slot' | 'forklift' | 'truck'; ref: string };
}
interface Shipment {
  id: string; customer: string; destination: string; truckId: string;
  steps: { key: 'confirmed' | 'picked' | 'loading' | 'in_transit' | 'delivered'; at?: number; eta?: number }[];
}
interface SimEvent { t: number; type: string; entityId: string; payload?: unknown }
```
Lựa chọn (selection) là một biến duy nhất: `selected: { kind, id } | null`, cộng thêm `hovered`. Scene, Fleet board, thanh tìm kiếm và thẻ tracking đều ghi vào cùng biến này.
### 7.3 Máy trạng thái **\[Suy luận từ các chip trạng thái đã thấy\]**
- **Xe tải nhập kho:** en\_route → at\_gate → docking (lùi vào bay, tốc độ giảm còn khoảng 10–22 km/h) → unloading (n/6 pallet) → departing.
- **Xe tải xuất kho:** docking → loading (n/6) → departing → in\_transit → delivered.
- **Xe nâng:** idle → fetching → loading\_truck hoặc unloading\_truck → quay về; khi pin xuống thấp thì charging tại trạm C1, C2, C3 rồi quay lại idle.
- **Dock:** available → reserved (xe tới cổng) → occupied → available.
- **Pallet:** in\_rack hoặc staged → moving (trên càng xe nâng) → loaded.
- **Shipment:** các mốc Order Confirmed, Picked, Loaded, In Transit, Delivered lấy từ event log; chữ "ETA" tính từ đồng hồ mô phỏng.
### 7.4 Engine mô phỏng
- **Đồng hồ:** trong video đồng hồ chạy từ 09:40 đến 09:54 trong khoảng 70 giây quay, tức nhanh cỡ 12 lần thời gian thực **\[Suy luận\]**. Hãy làm hệ số tốc độ điều chỉnh được.
- **Bước thời gian cố định** (fixed timestep), RNG có seed để demo lặp lại được, event bus ghi mọi chuyển trạng thái.
- **Tách engine khỏi React:** thuần TypeScript, có unit test. UI chỉ đọc qua selector (KPI, chip, ETA, số "min left"). Renderer nội suy vị trí giữa các tick.
- **Giá trị suy ra:** ETA = số pallet còn lại × thời gian mỗi pallet; Trucks on site = số xe đang ở trong kho; delta KPI so với mốc đầu ngày.
- **Câu hỏi quyết định sớm:** video 72 giây có thể là chuỗi kịch bản dàn dựng, không chắc là mô phỏng ngẫu nhiên đầy đủ (cuối video quay lại đúng WH-01). Timeline kịch bản dễ làm hơn nhiều; mô phỏng thật đáng giá khi bạn cần số liệu nhất quán và tương tác không dự đoán trước.
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
| chip-warning-bg | #FFE3AF (m) | Nền chip Low Stock; chữ cam khoảng #E8830C |
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
Thứ tự gợi ý: làm engine mô phỏng sớm (P5) trước khi mài chi tiết hình ảnh, vì đó là phần khó sửa nhất về sau.
| Giai đoạn | Việc | Tiêu chí hoàn thành |
| --- | --- | --- |
| P0 Nền | Scaffold, tokens, font, layout HUD rỗng đúng tỉ lệ | Khung HUD khớp bố cục mục 3 ở 1080p và 1440p |
| P1 Scene tĩnh | Sàn, đường, hàng rào, cây, một nhà kho; camera pan, zoom, xoay 90° bằng năm nút | Giữ 60 fps trên laptop thường; xoay mượt, không giật |
| P2 Thực thể | Xe tải (ít nhất bốn livery), xe nâng, pallet, kệ, trạm sạc, pin định vị | Mỗi loại có biến thể; thùng và cây dùng instancing |
| P3 HUD với dữ liệu mock | Top bar, KPI, panel năm biến thể, tracking, fleet board | Mọi chuỗi chữ, chip, thanh tiến độ khớp đặc tả mục 4 |
| P4 Chọn lọc | Raycast, hover/select overlay, đồng bộ scene, panel, board | Chọn ở đâu cũng ra cùng một đối tượng; Esc bỏ chọn |
| P5 Mô phỏng | Máy trạng thái, đồng hồ Live, ETA, KPI suy ra, event log | Chạy 30 phút mô phỏng không kẹt; test phủ các chuyển trạng thái |
| P6 Đa site | Năm preset, site switcher, camera bay, KPI đếm chạy | Đổi site dưới 2 giây, không rò bộ nhớ khi đổi nhiều lần |
| P7 Hoàn thiện | Hậu kỳ, chuyển cảnh, phím tắt (/ và Esc), trạng thái trống và lỗi, hiệu năng, trợ năng | Có chế độ hạ chất lượng khi FPS tụt; thao tác chính làm được bằng bàn phím |
## 11. Starter prompt (dán nguyên văn, điền phần trong ngoặc kép nhọn)
```
Bạn là kỹ sư frontend/3D cấp cao. Hãy xây dựng ứng dụng web "{{TÊN SẢN PHẨM}}": một giao diện vận hành cho {{NGÀNH}} theo phong cách "digital twin 3D kiểu game chiến thuật", tham chiếu tài liệu đính kèm (mục 1 đến 10 và mục 12).
Mục tiêu trải nghiệm: bản đồ 3D isometric toàn màn hình là giao diện chính; HUD kính mờ nổi lên trên; thế giới mô phỏng chạy liên tục; mọi thực thể đều bấm được.
Bắt buộc:
1. Stack: Vite + React + TypeScript, three.js qua @react-three/fiber và drei, Zustand, Tailwind + Radix, Framer Motion. Asset 3D dựng bằng code từ hình khối đơn giản, dùng InstancedMesh.
2. Bố cục HUD: top bar (logo, search có phím /, site switcher, chip Live + đồng hồ mô phỏng, chuông, avatar); ba thẻ KPI ở trên-trái; cột nút điều khiển camera (+, −, xoay trái, xoay phải, home); panel chi tiết bên phải (năm biến thể); thẻ tracking năm bước ở dưới-trái; fleet board ba tab ở dưới-phải.
3. Mô phỏng: engine thuần TypeScript, tách khỏi React, có đồng hồ, RNG có seed, máy trạng thái cho {{CÁC THỰC THỂ}}, event log; UI chỉ đọc qua selector. Có unit test.
4. Tương tác: hover và select hiện chip nhãn, khung góc, vòng sáng, đường dẫn; chọn ở scene, board hay tìm kiếm đều dẫn tới cùng một đối tượng được chọn; đổi site thì camera bay tới và số KPI đếm chạy.
5. Thẩm mỹ: low-poly sạch, không texture, nền lavender sáng, một màu nhấn xanh dương, bóng mềm, tilt-shift nhẹ; dùng token màu và typography ở mục 8.
6. Dữ liệu: {{N}} site preset với số liệu giả lập hợp lý; không dùng tên thương hiệu thật.
Cách làm: đi theo giai đoạn P0 đến P7; sau mỗi giai đoạn phải chạy được và tự kiểm bằng ảnh chụp màn hình; hỏi lại tôi khi gặp quyết định không có trong tài liệu. Trước khi viết code, hãy tóm tắt kế hoạch và các giả định trong tối đa 15 dòng.
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