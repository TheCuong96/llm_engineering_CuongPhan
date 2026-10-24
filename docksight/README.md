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
