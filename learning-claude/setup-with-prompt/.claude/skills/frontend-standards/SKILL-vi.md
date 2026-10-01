---
name: frontend-standards
description: Tiêu chuẩn kỹ thuật frontend cho giao diện web React và TypeScript - thiết kế component, quản lý trạng thái, lấy dữ liệu, form, accessibility, hiệu năng, styling, trạng thái lỗi/đang tải/trống, bảo mật và kiểm thử. Dùng skill này khi tạo hoặc sửa UI, component, page, hook, style, form hoặc logic phía client trong repository này, hoặc khi review code frontend, kể cả khi người dùng chỉ nói "thêm nút", "sửa trang này" hay "làm responsive". Kết hợp với nextjs-standards để áp dụng quy tắc riêng của Next.js.
---

# Tiêu chuẩn Front-End

Các quy tắc không phụ thuộc framework cho UI web (React + TypeScript). Chi tiết Next.js (routing, Server Components, caching) nằm trong `nextjs-standards`. Quy tắc nền tảng nằm trong `project-standards`.

Trước khi viết component, hãy tìm component hiện có gần nhất và làm theo cấu trúc, cách đặt tên và styling của nó.

## 1. TypeScript

- Bật chế độ `strict`. Không dùng `any`; dùng `unknown` rồi thu hẹp kiểu hoặc khai báo kiểu đúng. Nếu thật sự không tránh được `any`, thêm comment một dòng giải thích lý do.
- Ưu tiên `type` cho union và props; chỉ dùng `interface` khi cần declaration merging hoặc `extends`. Nhất quán với repo.
- Suy ra type từ nguồn sự thật (API type được sinh tự động, Zod schema qua `z.infer`) thay vì khai báo lại.
- Tránh type assertion (`as`). Validation dữ liệu chưa biết ở biên (API response, `localStorage`, URL params) bằng schema rồi mới tin giá trị đã có kiểu bên trong.
- Dùng discriminated union cho state machine: `{ status: 'loading' } | { status: 'error'; error: Error } | { status: 'success'; data: T }`.
- Không dùng non-null assertion (`!`) để bịt lỗi compiler; hãy xử lý trường hợp null.

## 2. Thiết kế component

- **Một component, một trách nhiệm.** Tách component khi nó vừa lấy dữ liệu, xử lý nghiệp vụ vừa trình bày UI.
- **Presentational và container.** Giữ component hình ảnh thuần (props vào, JSX ra). Đặt dữ liệu và side effect trong hook hoặc container component.
- **Props:** ít, có kiểu, mang ý nghĩa rõ. Ưu tiên composition (`children`, slot) thay vì nhiều boolean flag. Nếu truyền hơn khoảng 6 props, hãy xem xét lại ranh giới component.
- **Đặt tên:** component `PascalCase`, hook `useCamelCase`, handler nội bộ `handleX`, prop callback `onX`; tên file khớp component được export.
- **Tổ chức file:** gom theo feature (`features/billing/{components,hooks,api,types}`) thay vì gom toàn app theo loại kỹ thuật. Primitive dùng chung đặt trong `components/ui` (hoặc lớp tương đương), không import feature cụ thể.
- Mặc định dùng **named export** (dễ refactor và auto-import); chỉ dùng default export khi framework yêu cầu (ví dụ Next.js page/layout).
- Không để logic trong JSX ngoài điều kiện đơn giản. Tách thành biến hoặc component nhỏ.
- Mỗi list item phải có `key` ổn định, duy nhất (dùng id, không dùng array index cho danh sách động).

## 3. Quản lý trạng thái

Chọn công cụ đơn giản nhất đáp ứng được yêu cầu, theo thứ tự:

1. **Giá trị suy ra** - tính trong lúc render; không lưu thứ có thể tính được.
2. **State cục bộ** (`useState`/`useReducer`) - cho state thuộc về một component.
3. **State trong URL** (search params, route params) - cho nội dung có thể chia sẻ, bookmark hoặc giữ sau refresh: filter, phân trang, tab, sort.
4. **Server state** (TanStack Query / SWR / data layer của framework) - cho dữ liệu từ backend. Không sao chép vào global store.
5. **Context** - cho giá trị ít thay đổi, cần rộng rãi (theme, user hiện tại). Tách context để tránh nhiều component render lại.
6. **Global client store** (Zustand/Redux hoặc công cụ repo đang dùng) - chỉ dùng cho state client thực sự xuyên nhiều khu vực.

Quy tắc:

- Không phản chiếu props vào state. Hãy nâng state lên hoặc dùng `key` để reset.
- Không đồng bộ state bằng `useEffect` nếu có thể suy ra trực tiếp.
- Giữ state tối thiểu và chuẩn hóa; tránh các boolean mâu thuẫn (`isLoading` + `isError` + `isSuccess`) - dùng một status.

## 4. Effect và hook

- `useEffect` dùng để đồng bộ với hệ thống bên ngoài (subscription, timer, DOM API), **không** dùng để biến đổi dữ liệu hoặc phản hồi sự kiện người dùng. Logic event thuộc về handler.
- Dependency array phải đầy đủ; lint rule là bắt buộc. Sửa thiết kế thay vì tắt cảnh báo.
- Luôn cleanup subscription, timer, listener và request đang chạy (`AbortController`).
- Tách logic effect + state lặp lại thành custom hook có tên rõ và kiểu trả về cụ thể.
- Memoization (`useMemo`, `useCallback`, `React.memo`) là tối ưu hóa: chỉ thêm sau khi đo được vấn đề thực tế, không mặc định dùng. (Nếu dự án dùng React Compiler, làm theo hướng dẫn của compiler và tránh memo thủ công.)

## 5. Lấy dữ liệu và lớp API

- Mọi HTTP request phải qua **một module API client** (base URL, auth header, chuẩn hóa lỗi, request-id header, timeout). Component không gọi `fetch`/`axios` với URL hard-code.
- Dùng type được sinh tự động hoặc được validation bằng schema cho request và response.
- Chuẩn hóa lỗi thành một cấu trúc UI có thể hiển thị (khớp cấu trúc lỗi chuẩn trong `project-standards`).
- Xử lý tường minh mọi trạng thái: **loading, empty, error, success và partial/stale**. Màn hình chỉ xử lý success là chưa hoàn chỉnh.
- Chủ động cache và invalidate: sau mutation, chỉ invalidate hoặc cập nhật đúng query bị ảnh hưởng. Chỉ dùng optimistic update khi xử lý được rollback.
- Debounce tìm kiếm khi gõ; hủy request cũ hơn; phân trang hoặc virtualize danh sách dài.
- Không bao giờ tin client về phân quyền: ẩn nút chỉ là UX, không phải bảo mật.

## 6. Form và validation

- Dùng nhất quán một thư viện form (React Hook Form + Zod là mặc định, trừ khi repo chọn khác).
- Định nghĩa schema một lần, tái sử dụng cho type và validation. Đồng bộ quy tắc server, nhưng nhớ rằng server mới là nguồn quyết định.
- Hiển thị lỗi cạnh field, thông báo cho công nghệ hỗ trợ (`aria-describedby`, `role="alert"` cho phần tổng hợp) và focus vào field lỗi đầu tiên khi submit.
- Disable hoặc chặn nút submit trong lúc gửi để tránh gửi trùng; hiển thị tiến trình; ánh xạ lỗi field từ server `details[].field` vào form.
- Giữ lại input người dùng khi thất bại. Không xóa form vì request lỗi.
- Dùng đúng input type và thuộc tính `autocomplete`.

## 7. Accessibility (bắt buộc)

Đặt mục tiêu WCAG 2.2 AA.

- Ưu tiên **HTML ngữ nghĩa**: dùng `button` cho thao tác, `a` cho điều hướng, `label` gắn với input, heading đúng thứ tự, landmark (`main`, `nav`). Không gắn click handler lên `div`.
- Mọi chức năng dùng được bằng bàn phím; focus hiển thị rõ; thứ tự tab hợp lý; không tạo keyboard trap. Modal phải giữ focus bên trong, đóng bằng `Esc` và trả focus về vị trí cũ khi đóng.
- Ảnh có `alt` có ý nghĩa (`alt=""` cho ảnh trang trí). Nút chỉ có icon phải có tên truy cập được (`aria-label`).
- Không dùng màu sắc làm cách duy nhất truyền tải ý nghĩa; độ tương phản chữ thân bài ít nhất 4.5:1.
- Tôn trọng `prefers-reduced-motion`. Không tự phát motion hoặc media nếu không có điều khiển.
- Chỉ dùng ARIA để bù những gì HTML ngữ nghĩa không thể biểu đạt; ARIA sai còn tệ hơn không dùng.
- Nội dung cập nhật động (toast, kết quả async) cần live region.

## 8. Hiệu năng

Đo bằng Lighthouse / Web Vitals trước và sau; mục tiêu: LCP < 2.5 s, INP < 200 ms, CLS < 0.1.

- Giảm JavaScript gửi xuống: code-split route/component nặng (`dynamic`/`lazy`), tránh thư viện lớn cho tác vụ nhỏ, kiểm tra ảnh hưởng bundle trước khi thêm dependency.
- Tối ưu ảnh (đúng kích thước, định dạng hiện đại, lazy loading phần dưới màn hình, khai báo width/height để tránh layout shift) và font (subset, `font-display`).
- Tránh layout thrash và render lại không cần thiết: props ổn định, nâng state, chia context, virtualize list có hàng trăm dòng.
- Không chặn render bởi request không quan trọng; skeleton phải khớp layout cuối cùng.
- Không import cả utility library chỉ để dùng một hàm (`lodash` -> `lodash-es` theo từng hàm hoặc API native).

## 9. Styling

- Theo hệ thống của repo (Tailwind, CSS Modules, design token hoặc component library). Không trộn nhiều cách trong cùng một feature.
- Dùng design token (màu, khoảng cách, typography), tránh giá trị thô. Không dùng magic number hoặc mã màu hex hard-code trong component.
- **Mobile-first và responsive**; kiểm tra ở độ rộng 360 px, 768 px và 1280 px. Dùng đơn vị tương đối và flex/grid; tránh width cố định.
- Hỗ trợ dark mode nếu app có, thông qua token thay vì nhân đôi style.
- Tránh `!important` và selector lồng sâu. Style component nên ở cục bộ.
- Tái sử dụng primitive từ UI layer (Button, Input, Modal), không tự style element thô cho từng page.

## 10. Quốc tế hóa và định dạng

- Nếu app đã localize, không hard-code chuỗi hiển thị cho người dùng trong component; dùng lớp i18n và key.
- Định dạng ngày, số và tiền bằng API `Intl` theo locale người dùng. Lưu và truyền UTC; chỉ chuyển đổi khi hiển thị.
- Tính đến việc văn bản dài hơn (tiếng Việt và tiếng Đức thường dài hơn tiếng Anh) và hướng phải-sang-trái nếu cần.

## 11. Bảo mật (phía client)

- Không dùng `dangerouslySetInnerHTML` với nội dung chưa sanitize; nếu bắt buộc, sanitize bằng thư viện đáng tin (DOMPurify) và nêu lý do trong comment.
- Không lưu token hoặc dữ liệu nhạy cảm trong `localStorage`. Ưu tiên cookie `httpOnly`, `Secure`, `SameSite` do server thiết lập.
- Không bao giờ gửi secret xuống browser. Bất cứ thứ gì được bundle phía client đều là công khai.
- Validation và encode dữ liệu đưa vào URL; mở liên kết ngoài với `rel="noopener noreferrer"`.
- Không tin dữ liệu từ `postMessage`, URL params hoặc storage nếu chưa validation.

## 12. Xử lý lỗi và khả năng phục hồi

- Dùng error boundary quanh từng khu vực feature để một lỗi không làm trắng toàn app.
- Lỗi hiển thị cho user phải hữu ích, có thể hành động ("Không thể lưu thay đổi. Hãy thử lại."), không hiển thị stack trace thô hoặc chỉ mã lỗi. Cho phép retry khi phù hợp.
- Gửi lỗi bất ngờ tới công cụ monitoring repo đang dùng, kèm request id; không âm thầm nuốt lỗi (`catch {}`).

## 13. Kiểm thử

- **Unit/component test** (Vitest hoặc Jest + Testing Library): truy vấn theo role, label và text như người dùng; tránh kiểm tra chi tiết triển khai hoặc snapshot tree lớn.
- **Hook và logic thuần:** unit test trực tiếp.
- **Mock API:** dùng MSW ở tầng network, không mock module API client.
- **E2E** (Playwright/Cypress): bao phủ hành trình quan trọng (đăng nhập, checkout, CRUD chính), không cần mọi màn hình.
- Thêm kiểm tra accessibility (`jest-axe` / `axe-core`) cho component quan trọng.
- Mọi bug fix cần regression test. Test phải xác định: mock timer và network, không gọi service thật.

## 14. Checklist trước khi hoàn tất

- [ ] Trạng thái loading, empty, error và success đều hiển thị đúng
- [ ] Dùng được chỉ bằng bàn phím; label và focus chính xác
- [ ] Responsive trên mobile, tablet và desktop
- [ ] Type nghiêm ngặt, không `any`, API type lấy từ contract
- [ ] Không có console output, dead code hoặc chuỗi/màu hard-code
- [ ] Lint, type-check và test đều qua
- [ ] Đã cân nhắc ảnh hưởng bundle nếu thêm dependency
