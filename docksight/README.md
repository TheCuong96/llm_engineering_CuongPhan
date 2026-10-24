# DockSight

Giao diện vận hành 3D kiểu game chiến thuật (digital twin) cho mạng lưới 5 kho vận.
Đặc tả: `../prompt-web-3d-quản-lý-nhà-máy-v2.md`.

## Bộ phiên bản (đã khoá, không dùng `^`)

| Lớp | Gói | Phiên bản |
| --- | --- | --- |
| UI | react · react-dom | 19.3.1 |
| 3D | three · @react-three/fiber · @react-three/drei | 0.186.1 · 9.8.2 · 10.7.9 |
| Hậu kỳ | @react-three/postprocessing | 3.2.2 |
| State | zustand | 5.0.16 |
| Style | tailwindcss · @tailwindcss/vite | 4.3.3 |
| Primitive | @radix-ui/react-tabs · popover · tooltip | 1.2.1 · 1.3.1 · 1.4.1 |
| Chuyển động | framer-motion | 14.6.0 |
| Icon · font | lucide-react · @fontsource-variable/inter | 1.61.0 · 5.3.0 |
| Camera | camera-controls (qua drei `CameraControls`) | 3.1.2 |
| Build | vite · @vitejs/plugin-react · typescript | 8.3.5 · 6.1.2 · 5.9.3 |
| Test | vitest · @playwright/test | 5.0.5 · 1.64.1 |

R3F 9 đi với React 19 (R3F 8 chỉ chạy với React 18). Bộ này đã chạy ổn trong dự án `thien-co-do` trên cùng máy.

## Lệnh

```sh
npm run dev               # http://localhost:5173
npm run build             # tsc + vite build
npm test                  # vitest (engine, tokens)
npm run e2e               # playwright, tự chạy preview ở :4174
PERF=1 PHASE=P2 npx playwright test e2e/perf.spec.ts   # đo FPS headed trên GPU thật
PHASE=P0 npm run shots    # chụp bằng chứng vào evidence/P0
```

## Cấu trúc

```
src/
  sim/     engine thuần TS (không import react/three)
  data/    preset 5 kho, hàng hoá, hãng vận tải (tên giả)
  scene/   R3F
  hud/     TopBar, KpiBar, MapControls, DetailPanel, ShipmentTracking, FleetBoard
  store/   zustand
  design/  tokens.css, primitives, contrast
e2e/       playwright: bố cục, ảnh chụp
evidence/  ảnh chụp theo giai đoạn
```

## Phím tắt

| Phím | Tác dụng |
| --- | --- |
| `/` | Mở ô tìm kiếm; ↑ ↓ chọn, Enter chọn đối tượng và bay camera tới |
| `Esc` | Đóng tìm kiếm hoặc popover; nếu không có gì mở thì bỏ chọn |
| `Space` | Tạm dừng hoặc chạy tiếp mô phỏng (trừ khi đang focus vào một nút hay ô nhập, khi đó Space bấm nút đó) |
| `Tab` · `←` `→` | Đi qua mọi điều khiển; trong bảng điều phối, mũi tên đổi tab, Enter chọn dòng |

## Chất lượng hình ảnh

Có bốn mức, mỗi mức bỏ đi một thứ tốn nhất còn lại:

| Mức | Tên | Bỏ đi |
| --- | --- | --- |
| 0 | `full` | không bỏ gì |
| 1 | `no-ao` | AO |
| 2 | `no-post` | bloom và tilt-shift |
| 3 | `no-shadows` | bóng đổ; DPR giảm về 1 |

- **Tự hạ chất lượng:** khi FPS dưới 45 suốt 3 giây liên tiếp, app hạ xuống mức tiếp theo và không tự nâng lại.
- **Renderer phần mềm** (SwiftShader, llvmpipe) bắt đầu thẳng ở mức 2.

Tham số URL:

| Tham số | Tác dụng |
| --- | --- |
| `?quality=N` | Bắt đầu ở mức N |
| `?autoQuality=off` | Tắt tự hạ chất lượng (dùng cho ảnh bằng chứng và test FPS) |
| `?fps=30` | Giả lập FPS cho bộ điều tiết (dùng trong test) |
| `?perf` | Hiện lớp phủ FPS và số draw call |
| `?seed=N` | Đặt seed cho RNG của mô phỏng |

## Di động

Dưới 768 px:
- Top bar xuống hai hàng.
- KPI cuộn ngang.
- Ẩn các nút camera; dùng kéo để di chuyển và chụm hai ngón để zoom.
- Panel chi tiết, bảng điều phối và hành trình gom vào một bottom sheet có ba tab. Bấm thanh nắm để mở rộng hoặc thu gọn sheet.
