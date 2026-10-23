# OrbitDeck — Tài liệu triển khai giao diện vận hành 3D bối cảnh không gian vũ trụ

*Biến thể theo chủ đề của brief "WareTrack-style" (`prompt-web-3d-quản-lý-nhà-máy-v2.md`) · 23/10/2026 · Dùng làm đầu vào (brief) khi khởi động dự án mới*

## 0. Cách đọc và cách dùng

- **Tài liệu tự đủ.** Giữ "công thức" của brief gốc: bản đồ là giao diện, HUD bốn góc kiểu RTS, thế giới đang sống, mọi thực thể đều bấm được. Domain được thay bằng **hậu cần của một mạng lưới trạm không gian** trải từ quỹ đạo Trái Đất tới vành đai tiểu hành tinh.
- **Nhãn:** **\[Kế thừa\]** là giữ từ brief gốc; **\[Mới\]** là phần riêng của bối cảnh không gian; **\[Đổi\]** là nguyên tắc gốc được thay đổi có chủ đích (ví dụ: nền tối thay cho nền sáng).
- **Cách dùng:** (1) dán mục 11 làm tin nhắn đầu tiên; (2) đính kèm toàn bộ tài liệu này; (3) muốn đổi tên trạm hay hãng thì chỉ sửa ở mục 7.1.
- **Ngôn ngữ:** tài liệu viết tiếng Việt; **chuỗi trong UI dùng tiếng Anh**, vì thuật ngữ vận hành không gian (docking, manifest, keep-out sphere) quen dùng tiếng Anh. Mọi chuỗi gom trong `src/i18n/en.ts` để sau này dịch được.
- **Phong cách hoá, không mô phỏng cơ học quỹ đạo thật.** Nhưng phải tránh các lỗi "nhìn là biết sai": tàu không rẽ ngoặt như máy bay, cập trạm phải tiếp cận thẳng theo trục cổng và rất chậm, không có khói lửa lan toả trong chân không.
- **Tên hư cấu.** Không dùng tên hay logo của cơ quan và hãng thật (NASA, ESA, SpaceX…), không dùng tên tàu hay trạm có thật (ISS, Gateway, Dragon…). Địa danh thiên văn có thật (miệng núi Shackleton, Phobos, Ceres, điểm L1) thì dùng được.

## 1. Sản phẩm là gì

**OrbitDeck** là bản sao số (digital twin) của mạng lưới hậu cần **năm cơ sở không gian**: ba trạm trên quỹ đạo và hai căn cứ trên bề mặt thiên thể. Mỗi cơ sở là một diorama 3D nhìn chếch, gồm module trạm hình trụ, cánh pin mặt trời, cổng ghép nối, hangar hàng hoá, drone hậu cần, pod hàng và nút cấp điện. Tàu hàng của các hãng tiếp cận, ghép nối, dỡ hoặc bốc pod rồi rời đi.

Người dùng mẫu: **Rin Okafor, Station Logistics Lead**.

Vòng lặp sử dụng: chọn trạm, quan sát cảnh đang chạy, bấm vào tàu, drone, pod hoặc nút cấp điện, đọc thẻ chi tiết, theo dõi manifest ở thanh dưới, rồi chuyển sang trạm khác.

Cảm giác chủ đạo khác bản gốc: **tĩnh lặng và chính xác**. Mọi chuyển động chậm, có chủ đích; tốc độ cập trạm hiển thị bằng cm/s.

### Bảng ánh xạ từ brief gốc

| Brief gốc (kho vận) | OrbitDeck | Mã |
| --- | --- | --- |
| Site (kho) | Station / Base (trạm quỹ đạo hoặc căn cứ bề mặt) | ST-01…ST-05 |
| Truck | Cargo ship (tàu hàng) | CRG-xxxx |
| Forklift + pin | Cargo drone (trên quỹ đạo) / Rover (trên bề mặt) + pin | DR-xx / RV-xx |
| Dock / Bay | Docking port (quỹ đạo) / Landing pad (bề mặt) | A1, B2… / P1, P2… |
| Pallet | Cargo pod | POD-xxxx |
| Charger | Power node | PN-1, PN-2… |
| Shipment | Manifest | #MNF-xxxxx |
| Hãng vận tải | Carrier | 4 hãng hư cấu |
| Cổng kho | Keep-Out Sphere (KOS): vùng giữ khoảng cách 200 m quanh trạm | \[Mới\] |
| (không có) | Life support reserve: số ngày dự trữ O₂ và H₂O | \[Mới\] |

## 2. Bảy nguyên tắc thiết kế

1. **Bản đồ là giao diện.** \[Kế thừa\]
2. **Mọi thực thể đều bấm được:** trạm, tàu hàng, drone, rover, pod, power node, cổng ghép, bãi đáp.
3. **Thế giới đang sống.** Tàu tiếp cận, drone chuyển pod, cánh pin xoay theo Mặt Trời, đèn hiệu cổng nhấp nháy, hành tinh xoay chậm ở nền, đồng hồ UTC chạy.
4. **HUD đặt ở bốn góc, như game RTS.** \[Kế thừa\]
5. **Đồ chơi trên nền tối.** \[Đổi\] Low-poly sạch, không texture, nền không gian màu navy đậm (không dùng đen tuyệt đối), **một màu nhấn cyan**. Thông tin nổi bật nhờ ánh sáng có chủ đích (đèn cửa sổ, đèn hiệu, viền chọn), không nhờ độ sáng toàn cảnh. Màu trạng thái chỉ dùng cho chip và thanh tiến độ.
6. **Phản hồi kiểu game.** Khung góc kiểu ống ngắm, chip nhãn nổi, vòng sáng quanh cổng hoặc bãi đáp, quỹ đạo nét đứt cùng hành lang tiếp cận.
7. **Chậm và có chủ đích.** \[Mới\] Không vật thể nào chuyển động giật hay nhanh, trừ lúc đốt động cơ. Mật độ thông tin thấp trong scene, cao trong panel \[Kế thừa\].

## 3. Bản đồ bố cục HUD

\[Kế thừa\] Bố cục cố định; kích thước theo tỉ lệ viewport.

```
+--------------------------------------------------------------------------+
| A. TOP BAR: logo | search (/) | station switcher | Live UTC ×12 | bell | avatar |
+--------------------------------------------------------------------------+
| B. KPI x3          |                                   | [map ctrl]      |
| (trên-trái)        |                                   | [+][-][↺][↻]    |
|                    |   C. SCENE 3D (toàn màn hình)     | [home][system]  |
|                    |                                   | D. DETAIL PANEL |
|                    |                                   | (~23% rộng)     |
|                    |                                   |                 |
| E. MANIFEST TRACKING (dưới-trái, ~60% rộng)            | F. CARGO OPS    |
|                                                        |  BOARD (~30%)   |
+--------------------------------------------------------------------------+
```

| Vùng | Vị trí | Vai trò |
| --- | --- | --- |
| A. Top bar | Trên cùng, kính tối | Nhận diện, tìm kiếm, đổi trạm, đồng hồ UTC kèm tốc độ mô phỏng, cảnh báo, người dùng |
| B. KPI | Trên-trái, 3 thẻ | Ba chỉ số của trạm đang xem |
| C. Scene | Phủ toàn khung | Diorama trạm hiện tại; hành tinh và trường sao ở nền |
| Map controls | Cột dọc, cạnh trái panel D | Zoom in, zoom out, xoay trái, xoay phải, home, **System view** \[Mới\] |
| D. Detail panel | Phải | Thẻ chi tiết đối tượng đang chọn; mặc định là trạm |
| E. Manifest tracking | Dưới-trái | Vòng đời 5 bước của manifest gắn với tàu đang chọn |
| F. Cargo Ops board | Dưới-phải | Ba tab: Ports, Drones, Ships |

## 4. Đặc tả component

Phong cách chung \[Đổi\]: panel kính tối `rgba(14,20,38,0.72)` kèm backdrop-blur 16px, viền 1px `rgba(148,180,255,0.14)`, bo góc 12–14px (nhỏ hơn bản gốc để có cảm giác kỹ thuật hơn). Không dùng bóng đổ đậm; tạo chiều sâu bằng viền và một lớp glow trong rất nhạt.

### 4.1 Top bar

- **Logo:** lục giác cyan có vòng quỹ đạo cắt ngang + chữ "OrbitDeck".
- **Search:** placeholder "Search stations, ships, drones, pods, manifests…", gợi ý phím `/`.
- **Station switcher:** huy hiệu cyan "ST-01" + "Halcyon Station" + dòng phụ "78% full · 1/2 ports docked"; nút sang trạm kế tiếp; mũi tên mở danh sách.
- **Chip "Live · UTC 09:40 · ×12"** có chấm nhấp nháy. Bấm vào để đổi tốc độ (1×, 12×, 60×, tạm dừng). \[Mới\] Tốc độ luôn hiển thị, vì ở đây thời gian bị nén rất rõ.
- **Chuông cảnh báo** có số chưa đọc; avatar + "Rin Okafor / Station Logistics Lead".

### 4.2 Thẻ KPI

| Thẻ | Ví dụ | Chú thích |
| --- | --- | --- |
| Cargo on hand | 1,412 (+15) | pods · ST-01 |
| Ships docked | 1 (+1) | 1 on approach · ST-01 |
| On-window delivery | 96.6% (+0.4%) | last 30 days |

"On-window" nghĩa là giao đúng **cửa sổ phóng/tiếp cận** đã lên lịch, khái niệm tương đương "on-time" trong không gian. Khi đổi trạm, số đếm chạy trong 600–900ms.

### 4.3 Map controls

\[Kế thừa\] Năm nút: `+`, `−`, xoay ngược chiều, xoay thuận chiều, home.

\[Mới\] Nút thứ sáu là **System view**: camera lùi ra một sơ đồ hệ mặt trời phong cách hoá, không theo tỉ lệ thật. Trái Đất, Mặt Trăng, điểm L1, sao Hỏa với Phobos và Ceres nằm trên các vòng tròn đồng tâm. Tàu đang bay giữa các trạm hiện thành chevron nhỏ trên cung nét đứt, kèm ETA. Bấm vào một trạm để bay vào.

### 4.4 Detail panel: năm biến thể

Khung chung \[Kế thừa\]: eyebrow chữ cyan in hoa (loại · mã trạm), tiêu đề, dòng phụ, ba nút (định vị, mở rộng, đóng), chip trạng thái, các trường. Mã và số liệu kỹ thuật dùng font mono.

| Biến thể | Eyebrow | Nội dung |
| --- | --- | --- |
| Station | ORBITAL DEPOT, CRYO STORE, DISTRIBUTION HUB, CROSS-DOCK, ROBOTICS YARD · ST-0x | Tên và vị trí ("LEO · 410 km · 51.6°"); chip **Nominal** + "2 docked · 1 approaching · 3 staged"; 4 ô số: Cargo on hand n / capacity + thanh cyan, Ports a / b busy + thanh xanh lá, Outbound today, Stowed today; bảng Inventory (icon, tên, số lượng, chip In Stock hoặc Low Stock); \[Mới\] dòng **Life support** "O₂ 182 d · H₂O 140 d"; mục Drone fleet "1/2 working" |
| Drone / Rover | CARGO DRONE · ST-0x hoặc ROVER · ST-0x | DR-07, người vận hành (hoặc "Autonomous") · model ("Kestrel CD-4 free-flyer"); chip Loading ship, Unloading ship hoặc Charging; thanh tiến độ + pin %; Carrying (Empty hoặc POD-xxxx · tên); Moves today; Speed (drone: m/s, rover: km/h); Power node; Station |
| Cargo pod | POD · nhóm hàng (LIFE SUPPORT, PROPELLANT, SPARES, SCIENCE) | Tên (Water Recovery Filter), POD-1026 · SKU; chip Staged, Moving hoặc Stowed; Quantity, Mass (kg), \[Mới\] Temp range (hàng cryo: "−183 °C ± 5"), Hazard class, Location (Rack H2-04 hoặc "Held by DR-07"), Lot, Received, Station |
| Power node | POWER NODE · ST-0x | PN-1, "120 kW inductive charger"; chip Free hoặc "Charging DR-12"; Sessions today, Energy today (kWh), Charge rate (% mỗi phút), Queue, Station |
| Cargo ship | Tên hãng in hoa (HELION LINES) | CRG-2051, chỉ huy · số đăng ký; chip In transit, Approaching, Holding at KOS, Final approach, Unloading, Loading hoặc Departing, kèm dòng mô tả ("Final approach to Port A1 · 8 cm/s"); thanh tiến độ ("142 m to port" hoặc "3/8 pods"); Manifest #MNF-78442, Consignee, Destination, ETA, Closing rate, Port, Cargo (n/8 pods · tấn) |

**Bấm vào cổng ghép hoặc bãi đáp:** nếu có tàu thì chọn tàu đó; nếu trống thì mở panel Station và cuộn tới ô Ports.

### 4.5 Manifest tracking (dưới-trái)

- **Stepper 5 bước:** Manifest Approved (giờ) → Packed (giờ) → Loading n/8 hoặc Unloading n/8 (tuỳ hướng) → In Transfer (ETA dạng "3d 04h") → Delivered (ETA). Bước đã xong là vòng cyan đặc, bước hiện tại có quầng sáng, bước tương lai màu xám. Góc phải tiêu đề ghi "CRG-2051 · Helion Lines".
- **Thẻ manifest:** hình tàu nhỏ, "#MNF-78442", "To: Phobos Transfer Yard", chip trạng thái, "ST-01 · Port A1 · 13 min left", mũi tên mở chi tiết.
- **Đơn vị thời gian luôn ghi rõ** ("13 min" so với "3d 04h"), vì manifest trải qua cả hai thang thời gian (mục 7.4).

### 4.6 Cargo Ops board (dưới-phải)

Ba tab pill: "Ports 2/2", "Drones 1/2", "Ships 2"; bên phải là tên trạm. Mỗi dòng bấm được; đổi tab có hiệu ứng cross-fade.

| Tab | Dòng mẫu |
| --- | --- |
| Ports | Port A1 · ST-01: chấm màu hãng + CRG-2051 · Helion + chip Loading + 2/8; Port A2: "No ship assigned" + chip Available; Approaching: CRG-2287 · Orbis Freight + chip Final approach + "3 min" |
| Drones | DR-10 · "Unloading CRG-2205 at Port B1" + chip Unloading + 84%; DR-12 · "Charging at PN-1" + chip Charging + 35% |
| Ships | CRG-2229 · Kestrel Cargo · "ST-04 · Port C2" · Loading · 3/8; CRG-2307 · "To ST-04" · Final approach; CRG-2481 · Nadir Logistics · "To ST-04" · In transit · "2d 06h" |

Bảng màu chip trạng thái (chữ sáng trên nền tối pha màu, đều ≥ 7:1):

| Trạng thái | Nền | Chữ |
| --- | --- | --- |
| Nominal, In Stock, Loading, Unloading, Free | `rgba(52,211,153,0.14)` | `#6EE7B7` |
| Low Stock, Charging, Holding at KOS, Boil-off risk | `rgba(251,191,36,0.14)` | `#FCD34D` |
| In transit, Approaching, Final approach, Moving | `rgba(56,189,248,0.14)` | `#7DD3FC` |
| Available, Delivered, bước chưa tới | `rgba(148,163,184,0.14)` | `#CBD5E1` |
| Solar storm, Shelter (P8) | `rgba(248,113,113,0.16)` | `#FCA5A5` |

### 4.7 Tìm kiếm và cảnh báo

- **Tìm kiếm:** phím `/` để focus; tìm theo mã (ST-, CRG-, DR-, RV-, POD-, PN-, MNF-) và theo tên; khớp mờ; kết quả nhóm theo loại, ưu tiên trạm đang xem. Enter thì chọn đối tượng, đổi trạm nếu cần và đưa camera bay tới.
- **Cảnh báo:** là bộ lọc của event log, chỉ giữ sự kiện cần hành động: tàu đang giữ ở KOS chờ cấp phép, hàng xuống Low Stock, pin drone < 20%, life support < 30 ngày, pod cryo có nguy cơ bay hơi, tàu lỡ cửa sổ, và (P8) bão Mặt Trời. Bấm vào một cảnh báo thì chọn đối tượng liên quan.

## 5. Scene 3D

### 5.1 Camera

- Nhìn chếch kiểu isometric (nghiêng 35–50°). Kéo để pan, cuộn để zoom, xoay từng bước 90°.
- **Trạm quỹ đạo:** trạm nằm giữa khung; rìa hành tinh cong vắt ngang một phần ba dưới khung hình; trường sao phía sau. Luôn giữ một hướng "lên" cố định (mặt phẳng trạm) cho dễ đọc, dù trong không gian không có trên hay dưới.
- **Căn cứ bề mặt:** mặt đất regolith có đường chân trời, bầu trời đen, Trái Đất hoặc Mặt Trời treo trên cao.
- **Đổi trạm:** camera lùi ra System view, lướt sang trạm mới rồi đẩy vào (1.4–1.8s, ease-in-out). Panel mờ dần rồi nạp lại trong lúc KPI đếm chạy. Nếu bật prefers-reduced-motion thì thay bằng fade 200ms.
- Giới hạn khoảng cách và vùng pan để người dùng không trôi ra không gian trống.

### 5.2 Danh mục asset (dựng bằng code từ hình khối)

| Asset | Mô tả |
| --- | --- |
| Module trạm | Hình trụ màu trắng ngà có vân panel nổi, khớp nối hình nón cụt, cửa sổ nhỏ phát sáng ấm |
| Cánh pin mặt trời | Tấm phẳng xanh navy kẻ lưới, xoay chậm theo hướng Mặt Trời |
| Radiator | Tấm trắng mỏng xếp dãy, gắn vuông góc với cánh pin |
| Cổng ghép (port) | Vòng tròn có đèn hiệu nhấp nháy, đánh số A1, A2…; vạch dẫn hướng trên vỏ |
| Bãi đáp (pad) | Đĩa phẳng trên regolith, vòng đèn quanh viền, đánh số P1, P2… |
| Cargo ship | Thân hộp/trụ, module động cơ phía sau, cụm RCS ở bốn góc; 4 mẫu livery theo hãng; đuôi phát sáng khi đốt động cơ |
| Cargo drone | Khối lập phương nhỏ có kẹp, phụt khí RCS ngắt quãng khi đổi hướng (không có cánh quạt) |
| Rover | Thân hộp thấp 6 bánh, sàn chở pod, đèn pha |
| Cargo pod | Trụ bo góc, đai màu theo nhóm hàng; pod cryo có lớp sương trắng |
| Giá pod | Khung lưới trong hangar mở một mặt |
| Power node | Trụ ngắn có vòng sáng cyan ở đỉnh; khi đang sạc có xung sáng chạy dọc |
| Bồn cryo | Trụ trắng lớn, ống dẫn, van; có sương lạnh nhẹ |
| Bề mặt | Regolith low-poly xám, miệng hố nhỏ, đá vụn |
| Nền | Trường sao (Points ≤ 3,000, không lấp lánh), hành tinh lớn có quầng khí quyển fresnel, Mặt Trăng ở xa |
| Beacon định vị | Hình thoi phát sáng nhỏ trên pod ưu tiên; bấm được |

### 5.3 Vật liệu, ánh sáng, hậu kỳ

- Vật liệu phẳng (matte), không texture.
- **Ánh sáng:** một directional mạnh màu trắng ấm đóng vai Mặt Trời (bóng đổ PCF làm mềm); fill hemisphere xanh navy cường độ thấp (ánh phản xạ từ hành tinh); ambient rất thấp để mặt khuất bóng vẫn đọc được hình.
- **Emissive:** cửa sổ, đèn hiệu cổng, đuôi động cơ, vòng power node. Bloom chỉ áp cho emissive, ngưỡng cao.
- **Không dùng fog** (chân không). Thay vào đó, vật thể ở xa nhạt dần về màu navy, kèm vignette nhẹ để giữ chiều sâu.
- Hành tinh: sphere có shader fresnel cho rìa khí quyển cyan-xanh, xoay rất chậm.
- Tilt-shift nhẹ. Toàn cảnh tối nhưng không đen kịt; vỏ trạm sáng màu để nổi bật trên nền.

### 5.4 Lớp phủ trong scene

| Lớp phủ | Khi nào | Hình thức |
| --- | --- | --- |
| Chip nhãn nổi | Hover hoặc chọn | "DR-07 · Loading ship", "CRG-2205 · Unloading", "POD-1026 · Water Filter" |
| Khung góc ống ngắm | Đang chọn | Bốn góc cyan; với tàu thì kèm số khoảng cách ("142 m") |
| Vòng sáng | Hover power node, cổng hoặc bãi đáp | Vòng cyan bán trong suốt; hover cổng hiện "A2 · Final approach" |
| Quỹ đạo tiếp cận \[Mới\] | Chọn tàu đang tới | Cung nét đứt từ mép khung tới điểm giữ (hold point); khung dây hình cầu KOS bán kính 200 m (theo tỉ lệ scene); hành lang tiếp cận hình nón đặc theo trục cổng; tàu bay theo đúng đường này |
| Beacon | Luôn hiện | Bấm để mở panel Pod |

## 6. Kịch bản demo (~75 giây, dùng làm kịch bản nghiệm thu)

1. **Mở màn** ở ST-01 Halcyon Station, panel Station bên phải.
2. **Chọn DR-07:** panel Drone, chip nhãn, khung ống ngắm.
3. **Chọn POD-1026** (Staged). Khi drone kẹp pod, panel tự đổi sang "Moving · Held by DR-07".
4. **Đổi sang ST-04 Phobos Transfer Yard:** camera lùi ra System view, lướt tới sao Hỏa rồi đẩy vào; KPI đếm từ 1,412 về 610.
5. **Chọn PN-1:** thấy DR-12 đang sạc, pin tăng dần.
6. **Bấm CRG-2481 trên Cargo Ops board:** cung quỹ đạo và khung KOS hiện ra; tàu chuyển Approaching → Holding at KOS → Final approach (hành lang nón, tốc độ giảm từ 10 xuống 3 cm/s) → Unloading.
7. **Đổi tab** Ports → Drones → Ships; mở System view, chọn ST-02 Shackleton Cryo Depot (căn cứ bề mặt, rover chạy trên regolith, bồn cryo).
8. **Quay về ST-01**; demo có thể tự lặp.

## 7. Mô hình dữ liệu và mô phỏng

### 7.1 Năm cơ sở

| Mã | Tên | Loại | Môi trường | Vị trí | Tồn / sức chứa (pod) | Đầy · cổng | Out / stowed hôm nay | On-window | Nét riêng của scene |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ST-01 | Halcyon Station | Orbital Depot | Quỹ đạo | LEO 410 km, Trái Đất | 1,412 / 1,800 | 78% · 2 port | 23 / 15 | 96.6% | Cụm module trụ, hai cánh pin lớn, cánh tay robot, Trái Đất xanh bên dưới |
| ST-02 | Shackleton Cryo Depot | Cryo Store | Bề mặt | Vành miệng núi Shackleton, cực Nam Mặt Trăng | 990 / 1,400 | 71% · 3 pad | 31 / 20 | 96.0% | Bồn cryo trắng, radiator, regolith xám, Trái Đất thấp trên đường chân trời |
| ST-03 | Lagrange Junction | Distribution Hub | Quỹ đạo | Điểm L1 Trái Đất–Mặt Trăng | 3,310 / 4,200 | 79% · 4 port | 21 / 35 | 98.2% | Vòng xuyến lớn quay chậm, nhiều cổng ghép quanh trục |
| ST-04 | Phobos Transfer Yard | Cross-Dock | Quỹ đạo | Neo cạnh Phobos, quỹ đạo sao Hỏa | 610 / 1,600 | 38% · 6 port | 29 / 20 | 96.2% | Khung giàn dài, nhiều tàu ra vào, sao Hỏa đỏ cam lớn ở nền |
| ST-05 | Ceres Robotics Yard | Robotics Yard | Bề mặt | Bề mặt Ceres, vành đai tiểu hành tinh | 1,730 / 2,400 | 72% · 4 pad | 33 / 25 | 95.9% | Xưởng mái vòm, rover tự hành, cửa mỏ băng |

Mỗi trạm có bốn dòng Inventory, thường có một dòng Low Stock. Danh mục mẫu: Water Recovery Filter, O₂ Candle Pack, Liquid Oxygen (cryo), Spare Solar Cell Panel, Freeze-dried Rations (30-day), Regolith Sample Canister, Medical Kit, Xenon Propellant Tank, 3D-Printer Feedstock.

Hãng và livery: **Helion Lines** (trắng-cam), **Orbis Freight** (trắng-xanh ngọc), **Kestrel Cargo** (xám-vàng), **Nadir Logistics** (navy-trắng).

### 7.2 Kiểu dữ liệu

```ts
type StationKind = 'orbital_depot' | 'cryo_store' | 'distribution_hub' | 'cross_dock' | 'robotics_yard';
type StationEnv = 'orbital' | 'surface';
type ShipState = 'in_transit' | 'approaching' | 'holding_kos' | 'final_approach'
               | 'unloading' | 'loading' | 'undocking' | 'departing' | 'delivered';
type DroneKind = 'free_flyer' | 'rover';
type DroneState = 'idle' | 'fetching' | 'loading_ship' | 'unloading_ship' | 'returning'
                | 'queued_for_power' | 'charging' | 'sheltering';   // sheltering chỉ dùng ở P8
type PodState = 'stowed' | 'staged' | 'moving' | 'loaded';
type PortState = 'available' | 'reserved' | 'occupied';

interface Station {
  id: string;                 // 'ST-01'
  name: string; kind: StationKind; env: StationEnv; locationLabel: string;
  capacity: number;           // pods
  ports: Port[]; powerNodes: PowerNode[]; inventory: InventoryItem[];
  lifeSupport: { o2Days: number; h2oDays: number };
  layout: string;
  kpiBaseline: { cargoOnHand: number; shipsDocked: number; onWindowPct30d: number };
}
interface Port { id: string; label: string; direction: 'in' | 'out'; axis: [number, number, number]; state: PortState; shipId?: string }
interface Carrier { id: string; name: string; livery: { hull: string; stripe: string } }
interface Ship {
  id: string; carrierId: string; commander: string; registry: string;
  stationId: string | null;   // null = đang trên quỹ đạo chuyển, chỉ hiện ở System view
  state: ShipState; portId?: string; manifestId: string;
  pos: [number, number, number]; route?: [number, number, number][];
  cargo: { pods: number; capacity: number; massKg: number };       // capacity mặc định 8
  closingRateMps: number;     // tốc độ tiếp cận; final approach 0.10 → 0.03
}
interface Drone {
  id: string; stationId: string; kind: DroneKind; operator: string; model: string;
  state: DroneState; battery: number; carrying?: string; movesToday: number;
  speedMps: number; powerNodeId?: string; task?: { shipId: string; portId: string };
}
interface Pod {
  id: string; stationId: string; sku: string; name: string; category: 'life_support' | 'propellant' | 'spares' | 'science' | 'food';
  qty: number; massKg: number; lot: string; receivedAt: number; state: PodState;
  tempRangeC?: [number, number]; hazardClass?: string;
  cryo?: { maxMinutesOutside: number; minutesOutside: number };
  location: { kind: 'rack' | 'drone' | 'ship'; ref: string };
}
interface PowerNode { id: string; label: string; kw: number; ratePctPerMin: number; droneId?: string; queue: string[]; sessionsToday: number; energyKwhToday: number }
interface InventoryItem { sku: string; name: string; icon: string; qty: number; lowStockThreshold: number }
interface Manifest {
  id: string; consignee: string; destination: string; shipId: string;
  direction: 'inbound' | 'outbound';
  steps: { key: 'approved' | 'packed' | 'handling' | 'in_transfer' | 'delivered'; at?: number; eta?: number }[];
}
interface TransferLeg { from: string; to: string; durationSimHours: number }  // bảng thời gian bay giữa các trạm
interface SimEvent { t: number; type: string; stationId: string; entityId: string; payload?: unknown }
type Selection = { kind: 'station' | 'ship' | 'drone' | 'pod' | 'power_node'; id: string } | null;
```

Lựa chọn là một biến duy nhất `selected: Selection` cộng thêm `hovered`. Scene, Cargo Ops board, tìm kiếm, cảnh báo và thẻ manifest đều ghi vào cùng biến này. Khi tàu đang chọn rời trạm, panel giữ thẻ ở trạng thái mờ với dòng "Departed ST-04 · in transfer to ST-02" kèm nút "Follow"; không để trống, không crash.

### 7.3 Máy trạng thái

- **Tàu nhập:** in\_transit (ngoài màn hình, ETA tính bằng ngày) → approaching (xuất hiện ở mép scene, bay theo cung nét đứt) → holding\_kos (dừng tại điểm giữ 200 m, chờ được giữ chỗ cổng và cấp phép, 2–6 phút mô phỏng) → final\_approach (theo trục cổng, tốc độ tiếp cận giảm từ 10 xuống 3 cm/s) → unloading (n/8 pod) → undocking → departing (đốt động cơ, đuôi phát sáng) → in\_transit.
- **Tàu xuất:** (đang ghép nối) loading (n/8) → undocking → departing → in\_transit → delivered.
- **Drone / rover:** idle → fetching → loading\_ship hoặc unloading\_ship → returning → idle. Khi pin < 20% (chỉ xét lúc idle), tới power node trống gần nhất → charging tới ≥ 95% → idle. Không còn node trống thì queued\_for\_power.
- **Cổng / bãi đáp:** available → reserved (tàu vào holding\_kos) → occupied → available.
- **Pod:** stowed hoặc staged → moving (bị drone kẹp) → loaded.
- **Cryo \[Mới\]:** pod có `cryo` nằm ngoài kho lạnh thì `minutesOutside` tăng dần. Vượt 70% ngưỡng thì hiện chip "Boil-off risk" kèm cảnh báo.
- **Life support \[Mới\]:** `o2Days` và `h2oDays` giảm dần theo thời gian mô phỏng. Dỡ pod nhóm `life_support` thì cộng lại. Đây là sợi dây nối hàng hoá với một chỉ số sống còn, khiến việc dỡ hàng có ý nghĩa.
- **Manifest:** các mốc lấy từ event log. ETA ở bước In Transfer tính theo `TransferLeg`.

### 7.4 Engine mô phỏng

- \[Kế thừa v2\] TypeScript thuần trong `src/sim`, không import React hay three. Tick cố định 10 Hz; hệ số tốc độ mặc định 12× (1×–60×, tạm dừng bằng Space); RNG có seed; event bus; UI chỉ đọc qua selector; renderer nội suy giữa các tick.
- \[Kế thừa v2\] **Mọi trạm tick song song**; chỉ trạm đang xem được render chi tiết. Đã chốt: mô phỏng thật, còn video demo thì dùng `DemoDirector` riêng.
- **Hai thang thời gian \[Mới\].** Thao tác tại trạm diễn ra trong vài phút; chuyến bay giữa các trạm kéo dài từ vài ngày (LEO ↔ L1) tới vài tháng (Trái Đất ↔ sao Hỏa). Không tăng tốc mô phỏng để thấy được chuyến bay dài. Thay vào đó:
  - Lúc khởi tạo, seed sẵn một đội tàu *đã đang bay* với ETA rải đều, sao cho tại mỗi trạm cứ vài phút mô phỏng lại có một tàu tới vùng tiếp cận.
  - Tàu rời trạm thì đặt `stationId = null` và chỉ hiện ở System view; ETA lấy từ `TransferLeg`, hiển thị dạng "2d 06h".
  - Trên UI, luôn ghi rõ đơn vị (min, h, d).
- **Giá trị suy ra:** thời gian dỡ còn lại = số pod còn lại × thời gian mỗi pod; Ships docked = số tàu ở trạng thái unloading hoặc loading tại trạm; delta KPI so với `kpiBaseline`.

## 8. Design tokens

| Token | Giá trị | Ghi chú |
| --- | --- | --- |
| space-bg | `#0B1020` | Nền chính; không dùng `#000` |
| space-deep | `#060912` | Rìa vignette |
| hud-bg | `rgba(14,20,38,0.72)` + blur 16px | Panel kính tối |
| hud-border | `rgba(148,180,255,0.14)` | Viền panel |
| text | `#E6EBF5`; phụ `#93A0B8` (~7:1 trên hud-bg) | |
| accent | `#38BDF8` | Màu nhấn UI duy nhất: thanh tiến độ, quỹ đạo, khung chọn, huy hiệu |
| accent-ink | `#7DD3FC` | Chữ màu nhấn trên nền tối |
| station-hull | `#E8ECF2` | Vỏ module, sáng để nổi trên nền tối |
| solar | `#1E3A8A`, lưới `#3B5BC9` | Cánh pin |
| regolith | `#8C8F96` / `#6E7178` | Mặt đất Mặt Trăng và Ceres |
| planet-atmo | `#4FA8FF` | Rìa fresnel của hành tinh |
| success / warning / danger | thanh `#34D399` / `#FBBF24` / `#F87171`; chữ chip `#6EE7B7` / `#FCD34D` / `#FCA5A5` | |
| font | UI: **Inter**; mã và số kỹ thuật: **JetBrains Mono** hoặc **IBM Plex Mono**; số dạng tabular | |
| cỡ chữ | Eyebrow 11px in hoa, giãn chữ 0.08em; tiêu đề 18–20px; thân 13–14px; chip 12px | |
| bo góc | Thẻ 12–14px; ô số 10px; chip tròn hoàn toàn | Nhỏ hơn bản gốc |
| chuyển động | Panel 200–300ms; đếm số 600–900ms; camera 1.4–1.8s ease-in-out | |

Chỉ dùng **một** màu nhấn. Panel kính tối có thể nằm đè lên vỏ trạm màu sáng, nên phải kiểm tra tương phản chữ ở cả hai trường hợp: panel trên nền sao và panel trên vỏ trạm.

## 9. Stack đề xuất và cấu trúc thư mục

\[Kế thừa v2\] Vite + React + TypeScript, three.js qua @react-three/fiber và drei, @react-three/postprocessing, Zustand, Tailwind + Radix, Framer Motion, lucide-react, Vitest, Playwright. Chọn một bộ phiên bản tương thích nhau (R3F đi theo major của React) và ghi vào README. Thêm một ShaderMaterial nhỏ cho rìa khí quyển hành tinh.

```
src/
  sim/       engine thuần TS: clock, rng, state machines, transfer legs, life support, cryo, events, selectors
  data/      preset 5 trạm, carriers, danh mục pod, bảng TransferLeg
  i18n/      en.ts — mọi chuỗi hiển thị
  scene/     World, Station, Module, SolarArray, Radiator, Port, Pad, CargoShip, Drone, Rover, Pod, Rack,
             PowerNode, CryoTank, Regolith, Planet, Starfield, SystemView, Overlays
  hud/       TopBar, KpiBar, MapControls, DetailPanel/*, ManifestTracking, CargoOpsBoard, Search, Alerts
  store/     zustand: sim, selection, camera
  design/    tokens.css, primitives (Chip, Panel, Tile, ProgressBar)
```

## 10. Kế hoạch triển khai theo giai đoạn

| Giai đoạn | Việc | Tiêu chí hoàn thành |
| --- | --- | --- |
| P0 Nền | Scaffold, tokens tối, font, layout HUD rỗng, script Playwright | HUD khớp mục 3 ở 1440×900 và 1920×1080; mọi cặp chữ/nền ≥ 4.5:1 |
| P1 Engine lõi | Đồng hồ, RNG có seed, máy trạng thái tàu, drone, cổng, pod; life support; event log; selector KPI; một trạm; chưa có UI | Vitest phủ mọi chuyển trạng thái ở mục 7.3; chạy headless 30 phút mô phỏng không kẹt; cùng seed ra cùng event log |
| P2 Scene tĩnh | Một trạm quỹ đạo (module, cánh pin, cổng), trường sao, hành tinh; camera đủ năm nút | ≥ 55 fps ở 1080p trên laptop GPU tích hợp, DPR ≤ 1.5; hành tinh không bị z-fighting |
| P3 Thực thể sống | Tàu (4 livery), drone, pod, giá, power node, beacon; vị trí đọc từ engine | Final approach thẳng trục, chậm dần; drone đổi hướng bằng phụt RCS, không trượt kiểu xe |
| P4 HUD | Top bar (kèm tốc độ), KPI, panel năm biến thể, manifest tracking, Cargo Ops board, tìm kiếm, cảnh báo | Chuỗi chữ, chip, thanh khớp mục 4; đơn vị thời gian luôn hiển thị |
| P5 Chọn lọc | Raycast, overlay (chip, khung ống ngắm, vòng sáng, cung quỹ đạo, KOS, hành lang nón), đồng bộ mọi nơi chọn | Chọn ở đâu cũng ra cùng một đối tượng; Esc bỏ chọn; không lỗi khi tàu đang chọn rời trạm |
| P6 Đa trạm | Năm preset (thêm hai căn cứ bề mặt với rover và regolith), System view, camera bay, tàu đi giữa các trạm | Đổi trạm < 2 giây; đổi qua lại 50 lần mà bộ nhớ không tăng quá 10%; System view hiện đúng tàu đang bay kèm ETA |
| P7 Hoàn thiện | Hậu kỳ (bloom có ngưỡng, vignette, tilt-shift), phím tắt, trạng thái trống và lỗi, prefers-reduced-motion, chế độ hạ chất lượng, bố cục di động | Tự hạ chất lượng khi FPS < 45 kéo dài 3 giây (giảm số sao, tắt bloom trước); mọi thao tác chính làm được bằng bàn phím |
| P8 Tuỳ chọn | Thời tiết không gian: bão Mặt Trời theo lịch có seed → cảnh báo; drone ngoài trạm chuyển sheltering; final approach bị tạm hoãn | Bão bắt đầu và kết thúc đúng event log; hàng đợi cổng phục hồi sau bão |

## 11. Starter prompt (dán nguyên văn)

```
Bạn là kỹ sư frontend/3D cấp cao. Hãy xây ứng dụng web "OrbitDeck": giao diện vận hành 3D kiểu game chiến thuật (digital twin) cho mạng lưới hậu cần năm cơ sở không gian (ba trạm quỹ đạo, hai căn cứ bề mặt). Tài liệu đính kèm là đặc tả. Nếu tài liệu mâu thuẫn với prompt này thì làm theo prompt và báo lại cho tôi.

BỐI CẢNH
- Người dùng: Station Logistics Lead, theo dõi 5 trạm cùng lúc. Chuỗi UI bằng tiếng Anh, gom trong src/i18n/en.ts.
- Phong cách hoá, không mô phỏng cơ học quỹ đạo thật, nhưng không được sai kiểu "nhìn là biết": tàu không rẽ ngoặt như máy bay, cập trạm phải thẳng trục và chậm (cm/s), không có khói lửa lan toả trong chân không.
- Trải nghiệm cốt lõi: bản đồ 3D isometric phủ toàn màn hình là giao diện chính; HUD kính tối nổi lên trên; mô phỏng chạy liên tục; mọi thực thể đều bấm được.

YÊU CẦU BẮT BUỘC
1. Stack: Vite + React + TypeScript; three.js qua @react-three/fiber và drei; Zustand; Tailwind + Radix; Framer Motion; Vitest; Playwright. Chọn một bộ phiên bản ổn định tương thích nhau (R3F phải khớp major của React) và ghi vào README. Asset 3D dựng bằng code từ hình khối, vật thể lặp dùng InstancedMesh.
2. Bố cục HUD theo mục 3–4: top bar (logo, tìm kiếm có phím /, station switcher, chip Live UTC kèm tốc độ mô phỏng, chuông cảnh báo, avatar); ba thẻ KPI (Cargo on hand · Ships docked · On-window delivery) ở trên-trái; cột sáu nút (+, −, xoay trái, xoay phải, home, System view); panel chi tiết bên phải với năm biến thể (Station, Drone/Rover, Cargo pod, Power node, Cargo ship); thẻ manifest năm bước (Approved → Packed → Loading/Unloading n/8 → In Transfer → Delivered) ở dưới-trái; Cargo Ops board ba tab (Ports · Drones · Ships) ở dưới-phải.
3. Engine mô phỏng nằm trong src/sim: TypeScript thuần, không import React hay three. Tick cố định 10 Hz; hệ số tốc độ mặc định 12× (chỉnh 1×–60×, tạm dừng được); RNG có seed; event log; máy trạng thái cho tàu (gồm holding at KOS và final approach), drone/rover, cổng/bãi đáp, pod, cryo và life support theo mục 7.3. Cả năm trạm tick song song, chỉ trạm đang xem được render chi tiết. Xử lý hai thang thời gian theo mục 7.4: không tăng tốc để thấy chuyến bay dài, mà seed sẵn tàu đang bay với ETA rải đều. UI chỉ đọc qua selector.
4. Lựa chọn: một nguồn sự thật duy nhất `selected: {kind, id} | null` cộng thêm `hovered`. Scene, board, tìm kiếm và cảnh báo đều ghi vào đây. Khi tàu đang chọn rời trạm, panel giữ thẻ ở trạng thái mờ kèm dòng "Departed…", không để trống, không crash.
5. Thẩm mỹ theo token mục 8: low-poly sạch trên nền navy #0B1020 (không dùng đen tuyệt đối), chỉ một màu nhấn cyan #38BDF8; màu trạng thái chỉ dùng cho chip và thanh; chữ trên chip đạt tương phản ≥ 4.5:1, kể cả khi panel đè lên vỏ trạm màu sáng. Không dùng fog; tạo chiều sâu bằng cách làm vật ở xa nhạt dần và vignette. Hành tinh render sao cho không bị z-fighting.
6. Phi chức năng: ≥ 55 fps ở 1080p trên laptop GPU tích hợp (DPR ≤ 1.5), tự hạ chất lượng khi FPS tụt; tôn trọng prefers-reduced-motion (tắt camera bay và hiệu ứng đếm số); mọi thao tác chính làm được bằng bàn phím qua board và tìm kiếm.
7. Dữ liệu: 5 trạm theo mục 7.1. Không dùng tên hay logo của cơ quan và hãng thật, không dùng tên tàu hay trạm có thật; địa danh thiên văn có thật thì được dùng.

CÁCH LÀM VIỆC
- Trước khi viết code: tóm tắt kế hoạch và giả định (tối đa 15 dòng) kèm danh sách câu hỏi mở, rồi chờ tôi xác nhận.
- Làm lần lượt từ P0 đến P7 theo mục 10 (P8 chỉ làm khi tôi yêu cầu). Hết mỗi giai đoạn: chạy `npm run build` và `npm test`; mở app bằng Playwright, chụp màn hình ở 1440×900 và 1920×1080; tự đối chiếu với cột "Tiêu chí hoàn thành"; báo cáo ngắn (đã làm · bằng chứng · còn thiếu) rồi DỪNG lại chờ tôi duyệt.
- Không thêm tính năng ngoài tài liệu. Gặp quyết định mà tài liệu chưa nói: hỏi tôi, kèm phương án bạn đề xuất.
```

## 12. Rủi ro và lưu ý riêng của bối cảnh không gian

- **Panel kính tối mất chiều sâu** trên nền tối. Dùng viền và glow trong thay cho bóng đổ, và kiểm tra tương phản ở cả hai trường hợp: panel trên nền sao và panel trên vỏ trạm sáng.
- **Tỉ lệ không gian là không thể giữ thật.** Mỗi trạm dùng một tỉ lệ phong cách hoá riêng, nhất quán bên trong trạm đó. Hành tinh là một sphere khổng lồ ở rất xa, dễ gây z-fighting hoặc mất độ chính xác depth. Cách xử lý: render hành tinh ở một layer hoặc pass riêng với near/far riêng, hoặc bật `logarithmicDepthBuffer` (và đo lại FPS sau khi bật).
- **Trường sao cộng bloom dễ sinh nhiễu nhấp nháy.** Giữ ≤ 3,000 sao, không cho lấp lánh, và đặt ngưỡng bloom cao hơn độ sáng của sao.
- **Hai thang thời gian gây nhầm lẫn.** Luôn ghi đơn vị (min, h, d); System view là nơi duy nhất hiển thị chuyến bay dài ngày.
- **Lỗi "nhìn là biết sai"** cần tránh: tàu rẽ ngoặt hay chúc mũi như máy bay; drone bay bằng cánh quạt; lửa và khói bốc lên trong chân không; cập trạm nhanh hoặc chéo trục; bóng đổ mềm như dưới bầu trời có khí quyển (ngoài không gian bóng phải gắt hơn, chỉ làm mềm vừa đủ để giữ phong cách đồ chơi).
- **Thương hiệu:** không dùng tên hay logo của cơ quan và hãng thật; không đặt livery giống tàu có thật.
- **Trợ năng và di động** \[Kế thừa\]: board và tìm kiếm phải đủ để làm mọi thao tác bằng bàn phím; trên màn hình nhỏ, panel chi tiết chuyển thành bottom sheet.
- Số liệu trong tài liệu là giả lập.
