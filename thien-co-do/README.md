# Thiên Cơ Đồ

Giao diện vận hành 3D (digital twin) cho hậu cần Tử Vân Tông. Đặc tả: `../prompt-web-3d-tông-môn-tu-tiên.md`.

## Chạy

```bash
npm install
npx playwright install chromium   # lần đầu
npm run dev                       # http://localhost:5173
npm run build && npm test         # build + Vitest
npx playwright test               # e2e (tự chạy vite preview ở :4173, cần build trước)
PHASE=P0 npm run shots            # chụp bằng chứng 1440×900, 1920×1080 vào evidence/<PHASE>/
```

### Tham số URL

| Tham số | Tác dụng |
| --- | --- |
| `?perf` | Hiện FPS, DPR, số draw call, số tam giác |
| `?glyphs` | Mẫu chữ có dấu để kiểm tra font |
| `?autoQuality=off` | Tắt tự hạ chất lượng (dùng cho ảnh chụp bằng chứng trên máy render bằng CPU) |
| `?quality=0…4` | Ép bậc chất lượng ban đầu |
| `?fps=30` | Thay FPS đo được bằng một số cố định, để thử bộ tự hạ chất lượng |
| `?crashScene` | Cố ý làm sa bàn lỗi, để xem trạng thái lỗi |

### Phím tắt

| Phím | Tác dụng |
| --- | --- |
| `/` | Mở tìm kiếm (↑↓ chọn, Enter mở và đưa camera tới, Esc đóng) |
| `Space` | Tạm dừng / chạy tiếp mô phỏng (không áp dụng khi đang focus nút, tab hay ô nhập) |
| `Esc` | Bỏ chọn |
| `Tab` / `Enter` / mũi tên | Mọi nút sa bàn, tab và dòng bảng điều phối đều dùng được bằng bàn phím |

### Chất lượng hiển thị

Khi FPS dưới 45 kéo dài 3 giây, app tự hạ một bậc, lần lượt tắt: hạt linh khí và khói → bloom và tilt-shift → đàn hạc → thác nước chuyển động. App không tự nâng bậc trở lại, để tránh dao động qua lại. HUD không bao giờ bị ảnh hưởng.

### Đo hiệu năng trên GPU thật

Chạy Chromium có giao diện, 1920×1080, DPR 1.5, tắt vsync:

```bash
npm run build && PERF=1 PHASE=P7 npx playwright test e2e/perf.spec.ts
```

Bài đo chạy với `?autoQuality=off`, tức chất lượng đầy đủ (bloom, tilt-shift, hạt, hạc), nên kết quả phản ánh trường hợp nặng nhất.

## Bộ phiên bản (đã ghim chính xác)

| Gói | Phiên bản | Ghi chú |
| --- | --- | --- |
| react / react-dom | 19.3.1 | R3F 9.8 yêu cầu `>=19 <19.4` |
| three / @types/three | 0.186.1 / 0.186.0 | |
| @react-three/fiber | 9.8.2 | major 9 ↔ React 19 |
| @react-three/drei | 10.7.9 | |
| @react-three/postprocessing | 3.2.2 | bloom, tilt-shift (P7) |
| camera-controls | 3.1.2 | dùng qua drei `CameraControls` |
| zustand | 5.0.16 | |
| framer-motion | 14.6.0 | |
| @radix-ui/react-tabs · popover · dropdown-menu · tooltip | 1.2.1 · 1.3.1 · 2.2.1 · 1.4.1 | |
| lucide-react | 1.61.0 | |
| tailwindcss + @tailwindcss/vite | 4.3.3 | |
| @fontsource/noto-serif · be-vietnam-pro | 5.3.0 | dùng file theo weight để giữ `unicode-range` |
| vite / @vitejs/plugin-react | 8.3.5 / 6.1.2 | |
| typescript | 5.9.3 | |
| vitest | 5.0.5 | |
| @playwright/test | 1.64.1 | Chromium headless shell v1248 |

Node 24.11, npm 11.6.

## Cấu trúc

```
src/sim     engine TS thuần (không import React/three)
src/data    preset 5 phong, thương hội, units.ts
src/i18n    vi.ts — mọi chuỗi hiển thị
src/scene   R3F scene
src/hud     panel HUD
src/store   zustand
src/design  tokens.ts (nguồn), tokens.css (HUD), primitives
e2e         Playwright
evidence    ảnh chụp từng giai đoạn
```
