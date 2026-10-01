---
name: frontend-standards
description: Front-end engineering standards for React and TypeScript web UIs - component design, state management, data fetching, forms, accessibility, performance, styling, error/loading/empty states, security and testing. Use this skill whenever creating or modifying UI code, components, pages, hooks, styles, forms, or client-side logic in this repository, or when reviewing front-end code, even if the user only says "add a button", "fix this page", or "make it responsive". Pair with nextjs-standards for Next.js-specific rules.
---

<!-- BẢN TIẾNG VIỆT. Phần description giữ tiếng Anh để Claude kích hoạt skill chính xác. Chỉ dùng MỘT bản (Anh hoặc Việt) cho mỗi skill, không cài cả hai. -->

# Chuẩn Front-End

Quy tắc không phụ thuộc framework cho giao diện web (React + TypeScript). Phần riêng của Next.js (routing, Server Components, caching) nằm ở `nextjs-standards`. Quy tắc nền tảng nằm ở `project-standards`.

Trước khi viết một component, hãy tìm component gần giống nhất đã có và làm theo cấu trúc, cách đặt tên và cách style của nó.

## 1. TypeScript

- Bật chế độ `strict`. Không dùng `any`; dùng `unknown` rồi thu hẹp kiểu, hoặc viết kiểu đúng. Nếu thật sự bất khả kháng, thêm một dòng comment giải thích.
- Ưu tiên `type` cho union và props, `interface` chỉ khi cần declaration merging hoặc `extends`. Nhất quán với repo.
- Suy ra kiểu từ nguồn sự thật (kiểu API được sinh, schema Zod qua `z.infer`) thay vì khai báo lại.
- Tránh ép kiểu (`as`). Validate dữ liệu không rõ kiểu ở biên (phản hồi API, `localStorage`, tham số URL) bằng schema, rồi tin vào giá trị đã có kiểu bên trong.
- Dùng discriminated union cho máy trạng thái: `{ status: 'loading' } | { status: 'error'; error: Error } | { status: 'success'; data: T }`.
- Không dùng non-null assertion (`!`) để làm câm compiler; hãy xử lý trường hợp null.

## 2. Thiết kế component

- **Một component, một trách nhiệm.** Tách khi component trộn lẫn lấy dữ liệu, logic nghiệp vụ và hiển thị.
- **Presentational và container.** Giữ component hiển thị thuần (props vào, JSX ra). Đưa dữ liệu và side effect vào hook hoặc container.
- **Props:** ít, có kiểu và có nghĩa. Ưu tiên composition (`children`, slot) hơn nhiều cờ boolean. Nếu truyền quá ~6 props, hãy xem lại ranh giới.
- **Đặt tên:** component `PascalCase`, hook `useCamelCase`, handler `handleX` bên trong, `onX` khi là props, tên file khớp tên component export.
- **Tổ chức file:** gom theo tính năng (`features/billing/{components,hooks,api,types}`) thay vì theo loại kỹ thuật toàn app. Primitive dùng chung nằm ở lớp `components/ui` (hoặc tương đương), không import từ feature.
- **Named export** là mặc định (refactor và auto-import tốt hơn); default export chỉ khi framework yêu cầu (page/layout của Next.js).
- **Không để logic trong JSX** ngoài điều kiện đơn giản. Tách ra biến hoặc component nhỏ.
- Luôn đặt `key` ổn định, duy nhất cho phần tử danh sách (dùng id, không dùng chỉ số mảng với danh sách động).

## 3. Quản lý state

Chọn công cụ ít quyền lực nhất mà đủ dùng, theo thứ tự:

1. **Giá trị suy diễn** - tính trong lúc render; đừng lưu thứ có thể tính ra.
2. **State cục bộ** (`useState`/`useReducer`) - cho state do một component sở hữu.
3. **State trên URL** (search params, route params) - cho mọi thứ cần chia sẻ, bookmark, hoặc sống sót sau refresh: bộ lọc, phân trang, tab, sắp xếp.
4. **Server state** (TanStack Query / SWR / lớp data của framework) - cho dữ liệu từ backend. Không bao giờ sao chép vào store toàn cục.
5. **Context** - cho giá trị ít đổi nhưng nhiều nơi cần (theme, người dùng hiện tại). Tách context để tránh re-render lan rộng.
6. **Store client toàn cục** (Zustand/Redux hoặc thứ repo đang dùng) - chỉ cho state client thật sự xuyên suốt.

Quy tắc:
- Không phản chiếu props vào state. Nâng state lên hoặc dùng key để reset.
- Không đồng bộ state bằng `useEffect` khi có thể suy diễn.
- Giữ state tối thiểu và chuẩn hoá; tránh các boolean mâu thuẫn (`isLoading` + `isError` + `isSuccess`) - dùng một status.

## 4. Effect và hook

- `useEffect` dùng để đồng bộ với hệ thống bên ngoài (subscription, timer, DOM API), **không** để biến đổi dữ liệu hay phản ứng với sự kiện người dùng. Logic sự kiện thuộc về handler.
- Mảng dependency phải đầy đủ; rule lint không phải tuỳ chọn. Hãy sửa thiết kế thay vì tắt cảnh báo.
- Luôn dọn dẹp subscription, timer, listener và request đang bay (`AbortController`).
- Tách logic effect + state lặp lại thành custom hook có tên rõ và kiểu trả về rõ.
- Memo hoá (`useMemo`, `useCallback`, `React.memo`) là tối ưu hoá: thêm sau khi đo thấy vấn đề thật, không thêm theo mặc định. (Nếu dự án dùng React Compiler, theo hướng dẫn của nó và tránh memo hoá thủ công.)

## 5. Lấy dữ liệu và lớp API

- Mọi HTTP đi qua **một module API client** (base URL, header xác thực, chuẩn hoá lỗi, header request-id, timeout). Component không gọi `fetch`/`axios` với URL ghi cứng.
- Dùng kiểu được sinh hoặc đã validate bằng schema cho request và response.
- Chuẩn hoá lỗi thành một hình dạng UI render được (khớp cấu trúc lỗi chuẩn trong `project-standards`).
- Xử lý tường minh mọi trạng thái: **loading, empty, error, success, và dữ liệu cũ/một phần**. Màn hình chỉ xử lý success là chưa xong.
- Cache và vô hiệu hoá có chủ đích: sau mutation, invalidate hoặc cập nhật đúng các query bị ảnh hưởng. Chỉ dùng optimistic update khi đã xử lý rollback.
- Debounce tìm kiếm khi gõ; huỷ request đã bị thay thế; phân trang hoặc virtualize danh sách dài.
- Không bao giờ tin client cho việc phân quyền: ẩn nút là UX, không phải bảo mật.

## 6. Form và validation

- Dùng một thư viện form nhất quán (React Hook Form + Zod là mặc định trừ khi repo khác).
- Định nghĩa schema một lần và dùng lại cho kiểu và validation. Phản chiếu quy tắc của server, nhưng nhớ server mới là nơi quyết định.
- Hiện lỗi ngay cạnh field, thông báo cho công nghệ hỗ trợ (`aria-describedby`, `role="alert"` cho phần tóm tắt), và chuyển focus tới field lỗi đầu tiên khi submit.
- Khoá hoặc chặn nút submit khi đang gửi để tránh submit đúp; hiện tiến trình; ánh xạ lỗi field từ server (`details[].field`) vào form.
- Giữ nguyên dữ liệu người dùng đã nhập khi thất bại. Không bao giờ xoá form vì request lỗi.
- Dùng đúng `type` của input và thuộc tính `autocomplete`.

## 7. Khả năng truy cập - accessibility (bắt buộc)

Mục tiêu WCAG 2.2 AA.

- Dùng **HTML ngữ nghĩa** trước: `button` cho hành động, `a` cho điều hướng, `label` gắn với input, heading đúng thứ tự, landmark (`main`, `nav`). Không gắn click handler lên `div`.
- Mọi thứ thao tác được bằng bàn phím; có style focus rõ; thứ tự tab hợp lý; không bẫy bàn phím. Modal giữ focus bên trong, đóng bằng `Esc`, và trả focus khi đóng.
- Ảnh có `alt` có nghĩa (`alt=""` cho ảnh trang trí). Nút chỉ có icon phải có tên truy cập (`aria-label`).
- Màu không phải phương tiện duy nhất truyền ý nghĩa; độ tương phản tối thiểu 4.5:1 cho chữ thường.
- Tôn trọng `prefers-reduced-motion`. Không tự phát chuyển động hay media mà không có điều khiển.
- Chỉ dùng ARIA để lấp chỗ HTML ngữ nghĩa không làm được; ARIA sai còn tệ hơn không có.
- Cập nhật động (toast, kết quả bất đồng bộ) dùng live region.

## 8. Hiệu năng

Đo bằng Lighthouse / Web Vitals trước và sau; mục tiêu: LCP < 2.5 s, INP < 200 ms, CLS < 0.1.

- Gửi ít JavaScript hơn: tách code các route/component nặng (`dynamic`/`lazy`), tránh thư viện lớn cho việc nhỏ, kiểm tra ảnh hưởng bundle trước khi thêm dependency.
- Tối ưu ảnh (đúng kích thước, định dạng hiện đại, lazy load dưới màn hình đầu, width/height tường minh để tránh dịch layout) và font (subset, `font-display`).
- Tránh layout thrash và re-render thừa: props ổn định, nâng state, tách context, virtualize danh sách hàng trăm dòng.
- Không chặn render vì request không thiết yếu; hiện skeleton khớp layout cuối cùng.
- Không import cả thư viện tiện ích chỉ để dùng một hàm (`lodash` -> `lodash-es` từng hàm hoặc dùng native).

## 9. Style

- Theo hệ thống của repo (Tailwind, CSS Modules, design token, hoặc thư viện component). Không trộn các cách trong một tính năng.
- Dùng design token (màu, khoảng cách, chữ) thay vì giá trị thô. Không số "ma thuật" hay mã hex ghi cứng trong component.
- **Mobile-first và responsive**; thử ở chiều rộng 360 px, 768 px, 1280 px. Dùng đơn vị tương đối và flex/grid; tránh chiều rộng cố định.
- Hỗ trợ dark mode nếu app có, qua token, không nhân đôi style.
- Tránh `!important` và selector lồng sâu. Style của component giữ cục bộ trong component.
- Tái sử dụng primitive từ lớp UI (Button, Input, Modal) thay vì style lại phần tử thô ở mỗi trang.

## 10. Quốc tế hoá và định dạng

- Không ghi cứng chuỗi hiển thị trong component nếu app có đa ngôn ngữ; dùng lớp i18n và key.
- Định dạng ngày, số, tiền bằng API `Intl` và locale của người dùng. Lưu và truyền UTC; chỉ chuyển đổi khi hiển thị.
- Dự trù chữ dài ra (tiếng Việt và tiếng Đức dài hơn tiếng Anh) và chiều phải-sang-trái nếu cần.

## 11. Bảo mật (phía client)

- Không dùng `dangerouslySetInnerHTML` với nội dung chưa làm sạch; nếu bất khả kháng, làm sạch bằng thư viện uy tín (DOMPurify) và giải thích trong comment.
- Không lưu token hay dữ liệu nhạy cảm trong `localStorage`. Ưu tiên cookie `httpOnly`, `Secure`, `SameSite` do server đặt.
- Không bao giờ gửi bí mật xuống trình duyệt. Mọi thứ đóng gói phía client đều công khai.
- Validate và mã hoá dữ liệu đặt vào URL; mở liên kết ngoài với `rel="noopener noreferrer"`.
- Không tin dữ liệu từ `postMessage`, tham số URL hay storage khi chưa validate.

## 12. Xử lý lỗi và khả năng chịu lỗi

- Dùng error boundary quanh các vùng tính năng để một lỗi không làm trắng cả app.
- Lỗi hiển thị cho người dùng phải hành động được và dễ hiểu ("Không thể lưu thay đổi. Hãy thử lại."), không phải stack trace thô hay chỉ mã lỗi. Cho phép thử lại khi hợp lý.
- Báo lỗi bất ngờ tới công cụ giám sát của repo, kèm request id; không bao giờ nuốt lỗi im lặng (`catch {}`).

## 13. Kiểm thử

- **Unit/component test** (Vitest hoặc Jest + Testing Library): truy vấn theo role, label, text như người dùng; tránh test chi tiết cài đặt hay snapshot cây lớn.
- **Hook và logic thuần:** unit-test trực tiếp.
- **Mock API:** dùng MSW ở tầng mạng, không mock module API client.
- **E2E** (Playwright/Cypress): phủ các hành trình quan trọng (đăng nhập, thanh toán, CRUD chính), không phải mọi màn hình.
- Thêm kiểm tra accessibility (`jest-axe` / `axe-core`) cho các component chính.
- Mỗi bản sửa lỗi có test hồi quy. Test phải tất định: mock timer và mạng, không gọi dịch vụ thật.

## 14. Checklist trước khi hoàn thành

- [ ] Các trạng thái loading, empty, error, success đều hiển thị đúng
- [ ] Dùng được chỉ bằng bàn phím; label và focus đúng
- [ ] Responsive ở mobile, tablet, desktop
- [ ] Kiểu strict, không `any`, kiểu API lấy từ contract
- [ ] Không còn console, code chết, chuỗi/màu ghi cứng
- [ ] Lint, type-check, test đều qua
- [ ] Đã cân nhắc ảnh hưởng bundle cho mọi dependency mới
