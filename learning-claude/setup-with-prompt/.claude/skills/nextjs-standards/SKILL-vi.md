---
name: nextjs-standards
description: Tiêu chuẩn Next.js cho repository này - cấu trúc App Router, Server và Client Components, lấy dữ liệu và caching, Server Actions, Route Handlers, authentication và middleware/proxy, biến môi trường, metadata/SEO, ảnh và font, error/loading boundary, hiệu năng và kiểm thử. Dùng skill này khi làm việc với file trong Next.js app (app/, pages/, components, next.config, middleware/proxy, route handler, server action), hoặc khi người dùng nhắc Next.js, routing, SSR, SSG, ISR, RSC, caching hay "web app", kể cả khi không nói rõ "Next.js". Luôn kết hợp với frontend-standards.
---

# Tiêu chuẩn Next.js

Kế thừa `frontend-standards` (UI, accessibility, state, form) và `project-standards` (quy trình, contract, bảo mật). File này nêu các điểm riêng của Next.js.

**Xác định version trước.** Hành vi Next.js thay đổi đáng kể giữa các major version (14 -> 15 -> 16). Đọc `package.json` và `next.config.*`, kiểm tra app dùng App Router (`app/`) hay Pages Router (`pages/`) và làm theo version trong repo. Nếu chưa chắc API có trong version đang cài hay không, kiểm tra package đã cài hoặc tài liệu chính thức đúng phiên bản. Các mục bên dưới có đánh dấu những điểm phụ thuộc version.

## 1. Cấu trúc dự án (App Router)

```text
app/
  (marketing)/ (auth)/ (dashboard)/   # route groups: organise without changing URLs
  layout.tsx page.tsx                 # root layout and home
  error.tsx loading.tsx not-found.tsx # boundaries per segment
  api/<resource>/route.ts             # Route Handlers (only when needed)
components/ui/                        # shared primitives, no feature imports
features/<feature>/{components,actions,queries,schemas,types}
lib/{api-client,auth,env,utils}       # server/client-safe helpers
```

- `app/` phụ trách routing và page file mỏng. Page ghép feature component; UI nghiệp vụ nằm trong `features/`.
- Dùng thư mục `_private` để đặt file bên trong `app/` nhưng không phải route.
- Không trộn `pages/` và `app/` cho cùng một route. Nếu có cả hai, theo kế hoạch migration của repo và hỏi trước khi chuyển route.

## 2. Server và Client Components

**Mặc định dùng Server Component.** Chỉ thêm `'use client'` ở leaf nhỏ nhất cần tương tác.

| Nhu cầu | Loại component |
| --- | --- |
| Lấy dữ liệu, đọc secret, truy cập backend trực tiếp, dependency nặng | Server |
| `useState`, `useEffect`, event handler, browser API, context consumer | Client |

- Đẩy `'use client'` **xuống thấp** trong cây. Chỉ bọc phần tương tác (một button, field form), không bọc cả page.
- Truyền Server Component vào Client Component qua `children`/props để giữ phần đó trên server.
- Props qua ranh giới server -> client phải **serializable** (không có function trừ Server Action, không có class instance, tránh vấn đề với `Date` - truyền ISO string).
- Không import code chỉ dành cho server vào Client Component. Đánh dấu module nhạy cảm bằng `import 'server-only'` để build báo lỗi nếu bị rò rỉ.
- Không đọc `window`/`document`/`localStorage` trong lúc render; dùng effect hoặc guard SSR để tránh hydration mismatch.
- Provider (theme, query client) nằm trong component `Providers` riêng có `'use client'`, được root layout import.

## 3. Lấy dữ liệu

- **Fetch ở server, gần nơi dữ liệu được dùng**, trong Server Component, bằng `async/await`. Tránh fetch trong `useEffect` cho dữ liệu ban đầu của page.
- Gọi request độc lập song song (`Promise.all`) để tránh waterfall; stream phần chậm bằng `<Suspense>` và skeleton fallback.
- Call server-side tới NestJS API phải đi qua shared API client, có timeout tường minh và header `x-request-id`. Chủ động forward credential xác thực của user (cookie/token), không dùng god-token cho dữ liệu user.
- Chống trùng: bọc fetcher dùng chung bằng React `cache()` để nhiều component trong cùng request dùng chung kết quả.
- Chỉ dùng thư viện data phía client (TanStack Query / SWR) cho dữ liệu client tương tác nhiều, refresh thường xuyên hoặc do user điều khiển.
- **Validation** API response bằng schema dùng chung trước khi sử dụng.

### Caching (phụ thuộc version - cần xác minh)

- Từ Next.js 15 trở lên, `fetch` request và `GET` Route Handler **không được cache mặc định**; cần bật tường minh. Next.js 14 mặc định có cache. Không được mặc định.
- Chọn chiến lược theo loại dữ liệu và ghi trong comment:
  - Tĩnh/ít thay đổi: cache với `revalidate` (theo thời gian) hoặc tag.
  - Theo user hoặc real-time: không cache (dynamic).
  - Sau mutation: invalidate bằng `revalidateTag` / `revalidatePath` (hoặc cách tương đương theo version repo, ví dụ Cache Components với `'use cache'` ở Next.js 16) từ Server Action hoặc handler đã thay đổi dữ liệu.
- Đọc `cookies()`, `headers()` hoặc `searchParams` sẽ khiến route thành dynamic. Từ Next.js 15 trở lên, `params`, `searchParams`, `cookies()` và `headers()` là **async** và phải `await`; theo đúng version của repo.
- Không bao giờ cache response chứa dữ liệu cá nhân hoặc dữ liệu riêng từng user vào shared cache.

## 4. Server Actions

- Dùng Server Action (`'use server'`) cho **mutation được kích hoạt từ form hoặc UI event**, không dùng để đọc dữ liệu.
- Coi mọi action là **HTTP endpoint công khai**: xác thực lại, kiểm tra quyền trên resource và validation input bằng schema dùng chung **ngay bên trong** action. Không tin UI đã chặn input sai.
- Trả typed result (`{ ok: true, data } | { ok: false, error, fieldErrors }`) thay vì ném lỗi với trường hợp dự kiến; form ánh xạ `fieldErrors` vào field tương ứng.
- Gọi `revalidateTag`/`revalidatePath` hoặc `redirect()` sau khi thành công khi phù hợp (`redirect` ném lỗi nội bộ - không bọc trong `try/catch`).
- Dùng `useActionState` / `useFormStatus` cho trạng thái đang xử lý và lỗi; hỗ trợ progressive enhancement khi thực tế.
- Giữ action mỏng: validation, phân quyền, gọi service/API client, revalidate. Business logic thuộc NestJS API.

## 5. Route Handler (`route.ts`)

- Dùng cho webhook, stream file, OAuth callback hoặc BFF endpoint mà browser phải gọi. Không tạo Route Handler chỉ để proxy call mà Server Component có thể gọi trực tiếp.
- Export named function theo HTTP method; validation input; trả `Response`/`NextResponse.json` với status code chính xác và error shape chuẩn.
- Xác minh chữ ký webhook; áp dụng rate limit cho handler công khai.
- Chọn runtime (`nodejs`/`edge`) có chủ đích; Edge có giới hạn API (không dùng thư viện chỉ chạy trên Node).

## 6. Xác thực và middleware

- Session token đặt trong cookie `httpOnly`, `Secure`, `SameSite` do server thiết lập. Không bao giờ để JavaScript phía client đọc được.
- **Middleware (`middleware.ts`, đổi thành `proxy.ts` ở Next.js 16 - kiểm tra repo) chỉ dùng cho kiểm tra nhanh, mang tính tối ưu** (redirect user chưa xác thực, locale, rewrite). Đây không phải ranh giới bảo mật.
- **Phân quyền lại tại nơi dữ liệu được truy cập** (Server Component, Server Action, Route Handler và NestJS API). Không bao giờ chỉ dựa vào middleware.
- Middleware phải nhanh, ít dependency; cấu hình `matcher` bỏ qua static asset và `_next`.
- Tập trung đọc session trong một helper (`getSession()`), bọc bằng `cache()`, dùng trong mọi server code.

## 7. Biến môi trường

- Biến chỉ dùng server không có prefix; **chỉ `NEXT_PUBLIC_*` được đưa ra browser**, và chúng được inline lúc build. Không bao giờ đặt secret, URL nội bộ hoặc key có quyền ghi trong `NEXT_PUBLIC_*`.
- Validation env lúc khởi động trong `lib/env.ts` (Zod), rồi import typed object ở mọi nơi; không đọc trực tiếp `process.env` trong component.
- Ghi tài liệu cho mọi biến trong `.env.example`. Không commit file `.env*` chứa giá trị thật.

## 8. Routing, layout và UX boundary

- UI dùng chung đặt trong `layout.tsx` (layout tồn tại qua các lần điều hướng); chỉ dùng `template.tsx` cho state theo mỗi lần điều hướng khi thực sự cần.
- Cung cấp `loading.tsx` (skeleton khớp layout), `error.tsx` (`'use client'`, có thao tác reset) và `not-found.tsx` ở segment phù hợp. Gọi `notFound()` cho resource thiếu thay vì render trang trống.
- Dùng `next/link` cho điều hướng nội bộ và chỉ dùng `useRouter` cho điều hướng lập trình trong Client Component. Không dùng `<a href>` cho route nội bộ.
- Dynamic segment: validation param (định dạng, tồn tại) trước khi sử dụng.
- Chỉ dùng parallel/intercepting route khi thiết kế cần (modal route); chúng làm tăng độ phức tạp.
- Giữ state URL trong search params cho filter/phân trang để page chia sẻ được và thân thiện với SSR.

## 9. Metadata, SEO và tài nguyên

- Export `metadata` hoặc `generateMetadata` theo route (title, description, Open Graph, canonical). Chỉ đặt `metadataBase` một lần tại root layout.
- Thêm `sitemap.ts` và `robots.ts` cho website công khai; dùng structured data (JSON-LD) khi hữu ích.
- **Ảnh:** luôn dùng `next/image` với `width`/`height` (hoặc `fill` + parent có kích thước), `alt` có ý nghĩa, `sizes` cho ảnh responsive, chỉ dùng `priority` cho hero ở phần đầu màn hình. Whitelist host remote trong config.
- **Font:** dùng `next/font` (self-host, tránh layout shift); chỉ tải weight/subset cần thiết.
- Tích hợp script bên thứ ba bằng `next/script` với `strategy` phù hợp (`afterInteractive`/`lazyOnload`).

## 10. Hiệu năng

- Server Component và streaming là công cụ hiệu năng chính; giữ client bundle nhỏ. Kiểm tra bằng bundle analyser trước khi thêm dependency phía client.
- Dùng `next/dynamic` cho component client nặng (chart, editor, map), chỉ đặt `ssr: false` nếu thực sự chỉ chạy trên browser.
- Ưu tiên static generation hoặc cached rendering cho page công khai; dùng `generateStaticParams` cho dynamic route đã biết.
- Tránh request waterfall (nhiều `await` độc lập nối tiếp), state client lớn hydrate từ server và props serialize quá lớn.
- Theo dõi Core Web Vitals trên production; sửa regression trước khi tiếp tục chồng thêm feature.

## 11. Bảo mật riêng cho Next.js

- Server Action và Route Handler là entry point công khai: validation, xác thực, phân quyền và rate limit (xem mục 4/5).
- Đặt security header trong `next.config` (CSP, `X-Content-Type-Options`, `Referrer-Policy`, frame protection) theo chính sách repo.
- Sanitize hoặc tránh render HTML thô; không nội suy input user vào `dangerouslySetInnerHTML`.
- Giới hạn `images.remotePatterns`, redirect và rewrite ở host đã biết để ngăn open redirect và SSRF.
- Không log toàn bộ request body hoặc cookie.

## 12. Kiểm thử

- Unit/component test cho Client Component và hook bằng Vitest/Jest + Testing Library. E2E (Playwright) thường phù hợp nhất để test Server Component vì async Server Component chưa được các unit renderer hỗ trợ đầy đủ.
- Tách logic khỏi component/action thành hàm thuần và unit test các hàm đó.
- Test Server Action bằng cách gọi với session và API client đã mock; xác nhận validation, phân quyền và lời gọi revalidation.
- E2E cho flow quan trọng trên app đang chạy với test backend; seed dữ liệu cô lập.
- Chạy `next build` trong bước xác minh: lệnh này bắt được lỗi type, ranh giới Server/Client sai và lỗi static generation mà dev mode có thể bỏ qua.

## 13. Lỗi thường gặp

- Đánh dấu cả page là `'use client'` để "cho nó chạy" - việc này đẩy toàn bộ page vào bundle. Chỉ tách leaf cần tương tác.
- Hydration mismatch do `Date.now()`, `Math.random()`, định dạng theo locale hoặc kiểm tra browser-only trong render.
- Quên `await` async request API (`params`, `cookies()`) từ Next.js 15 trở lên.
- Giả định caching mặc định từ major version khác; gây dữ liệu cũ hoặc không bao giờ được cache.
- Chỉ phân quyền trong middleware.
- Import module server (DB client, secret) vào client code.
- Nhiều `await` tuần tự làm page chậm.
- `redirect()` bên trong `try/catch` khiến redirect bị nuốt.
- Dùng Route Handler làm một chặng trung gian không cần thiết trước API.

## 14. Checklist trước khi hoàn tất

- [ ] Mặc định dùng Server Component; `'use client'` chỉ đặt ở leaf tương tác
- [ ] Dữ liệu được fetch song song ở server, có quyết định caching tường minh
- [ ] Action/handler tự validation, xác thực và phân quyền bên trong
- [ ] Đã xử lý `loading`, `error`, `not-found`; đã đặt metadata
- [ ] Không có secret trong `NEXT_PUBLIC_*`; env đã validation
- [ ] `next build`, lint, type-check và test đều qua
