---
name: nextjs-standards
description: Next.js standards for this repository - App Router structure, Server vs Client Components, data fetching and caching, Server Actions, Route Handlers, authentication and middleware/proxy, environment variables, metadata/SEO, images and fonts, error/loading boundaries, performance and testing. Use this skill whenever working on files in the Next.js app (app/, pages/, components, next.config, middleware/proxy, route handlers, server actions), or when the user mentions Next.js, routing, SSR, SSG, ISR, RSC, caching, or "the web app", even if they do not say "Next.js" explicitly. Always combine with frontend-standards.
---

<!-- BẢN TIẾNG VIỆT. Phần description giữ tiếng Anh để Claude kích hoạt skill chính xác. Chỉ dùng MỘT bản (Anh hoặc Việt) cho mỗi skill, không cài cả hai. -->

# Chuẩn Next.js

Xây trên `frontend-standards` (UI, accessibility, state, form) và `project-standards` (quy trình, contract, bảo mật). File này chỉ nói về phần đặc thù của Next.js.

**Xem phiên bản trước.** Hành vi của Next.js thay đổi đáng kể giữa các bản major (14 -> 15 -> 16). Đọc `package.json` và `next.config.*`, xác định app dùng App Router (`app/`) hay Pages Router (`pages/`), và theo phiên bản của repo. Nếu không chắc một API có trong bản đang cài hay không, hãy kiểm tra package đã cài hoặc tài liệu chính thức của đúng bản đó trước khi dùng. Các ghi chú dưới đây đánh dấu những điểm phụ thuộc phiên bản.

## 1. Cấu trúc dự án (App Router)

```
app/
  (marketing)/ (auth)/ (dashboard)/   # route group: tổ chức mà không đổi URL
  layout.tsx page.tsx                 # layout gốc và trang chủ
  error.tsx loading.tsx not-found.tsx # ranh giới theo từng segment
  api/<resource>/route.ts             # Route Handler (chỉ khi cần)
components/ui/                        # primitive dùng chung, không import từ feature
features/<feature>/{components,actions,queries,schemas,types}
lib/{api-client,auth,env,utils}       # helper dùng được ở server/client
```

- `app/` chỉ chứa routing và các file page mỏng. Page ghép các component feature; UI nghiệp vụ nằm trong `features/`.
- Gom file bằng thư mục `_private` khi một file phải nằm trong `app/` nhưng không phải route.
- Không trộn `pages/` và `app/` cho cùng một route. Nếu cả hai tồn tại, theo kế hoạch migrate của repo và hỏi trước khi chuyển route.

## 2. Server Component và Client Component

**Mặc định là Server Component.** Chỉ thêm `'use client'` ở lá nhỏ nhất cần nó.

| Cần | Loại component |
|---|---|
| Lấy dữ liệu, đọc bí mật, truy cập backend trực tiếp, dependency nặng | Server |
| `useState`, `useEffect`, event handler, API trình duyệt, component đọc context | Client |

- Đẩy `'use client'` **xuống thấp** trong cây. Chỉ bọc phần tương tác (một nút, một ô nhập), không bọc cả trang.
- Truyền Server Component vào Client Component qua `children`/props để chúng ở lại server.
- Props đi qua ranh giới server -> client phải **serialize được** (không hàm, trừ Server Action; không instance của class; coi chừng `Date` - truyền chuỗi ISO).
- Không bao giờ import code chỉ-server vào Client Component. Đánh dấu module nhạy cảm bằng `import 'server-only'` để build lỗi nếu bị rò.
- Không đọc `window`/`document`/`localStorage` trong lúc render; dùng effect hoặc chặn cho SSR để tránh hydration mismatch.
- Provider (theme, query client) nằm trong một component `Providers` riêng có `'use client'`, được layout gốc import.

## 3. Lấy dữ liệu

- **Fetch ở server, gần nơi dùng dữ liệu**, trong Server Component, bằng `async/await`. Tránh fetch trong `useEffect` cho dữ liệu ban đầu của trang.
- Chạy song song các request độc lập (`Promise.all`) để tránh waterfall; stream phần chậm bằng `<Suspense>` và skeleton fallback.
- Lệnh gọi từ server tới API NestJS đi qua module API client dùng chung, với timeout tường minh và header `x-request-id`. Chuyển tiếp thông tin xác thực của người dùng có chủ đích (cookie/token), không bao giờ dùng "token thần thánh" cho dữ liệu người dùng.
- Khử trùng lặp: bọc fetcher dùng chung bằng React `cache()` để nhiều component trong cùng một request dùng chung kết quả.
- Chỉ dùng thư viện dữ liệu phía client (TanStack Query / SWR) cho dữ liệu tương tác, hay làm mới, hoặc do người dùng điều khiển.
- **Validate** phản hồi API bằng schema dùng chung trước khi dùng.

### Caching (phụ thuộc phiên bản - hãy kiểm tra)
- Ở Next.js 15+, các request `fetch` và Route Handler `GET` **không được cache mặc định**; hãy bật tường minh. Ở bản 14 chúng được cache mặc định. Đừng giả định.
- Chọn chiến lược theo từng loại dữ liệu và ghi trong comment:
  - Tĩnh/ít đổi: cache với `revalidate` (theo thời gian) hoặc tag.
  - Theo người dùng hoặc thời gian thực: không cache (dynamic).
  - Sau mutation: invalidate bằng `revalidateTag` / `revalidatePath` (hoặc tương đương ở bản của repo, như Cache Components với `'use cache'` ở Next.js 16) từ Server Action hoặc handler đã đổi dữ liệu.
- Đọc `cookies()`, `headers()` hay `searchParams` làm route thành dynamic. Ở Next.js 15+, `params`, `searchParams`, `cookies()`, `headers()` là **bất đồng bộ** và phải `await`; theo bản của repo.
- Không bao giờ cache response chứa dữ liệu cá nhân hay theo người dùng trong cache dùng chung.

## 4. Server Action

- Dùng Server Action (`'use server'`) cho **mutation kích hoạt từ form hoặc sự kiện UI**, không dùng để đọc dữ liệu.
- Coi mỗi action là một **endpoint HTTP công khai**: xác thực lại, phân quyền lại trên tài nguyên, và validate input bằng schema dùng chung **bên trong** action. Không bao giờ tin rằng UI đã ngăn input sai.
- Trả kết quả có kiểu (`{ ok: true, data } | { ok: false, error, fieldErrors }`) thay vì ném lỗi cho các thất bại dự kiến; form ánh xạ `fieldErrors` vào field.
- Gọi `revalidateTag`/`revalidatePath` hoặc `redirect()` sau khi thành công khi phù hợp (`redirect` ném lỗi nội bộ - không bọc trong `try/catch`).
- Dùng `useActionState` / `useFormStatus` cho trạng thái chờ và lỗi; hỗ trợ progressive enhancement khi thực tế.
- Giữ action mỏng: validate, phân quyền, gọi service/API client, revalidate. Logic nghiệp vụ ở lại API NestJS.

## 5. Route Handler (`route.ts`)

- Dùng cho webhook, stream file, callback OAuth, hoặc endpoint BFF mà trình duyệt buộc phải gọi. Đừng tạo Route Handler chỉ để proxy một lệnh mà Server Component gọi trực tiếp được.
- Export hàm theo tên HTTP method; validate input; trả `Response`/`NextResponse.json` với status code đúng và cấu trúc lỗi chuẩn.
- Xác minh chữ ký webhook; áp giới hạn tốc độ cho handler công khai.
- Chỉ định runtime (`nodejs`/`edge`) có chủ đích; edge có giới hạn API (không dùng được thư viện chỉ-Node).

## 6. Xác thực và middleware

- Token phiên nằm trong cookie `httpOnly`, `Secure`, `SameSite` do server đặt. Không bao giờ để JavaScript client đọc được.
- **Middleware (`middleware.ts`, đổi tên thành `proxy.ts` ở Next.js 16 - kiểm tra repo) chỉ dùng cho kiểm tra nhanh, lạc quan** (chuyển hướng người dùng chưa đăng nhập, locale, rewrite). Nó không phải ranh giới bảo mật.
- **Phân quyền lại tại nơi truy cập dữ liệu** (Server Component, Server Action, Route Handler, và API NestJS). Không bao giờ chỉ dựa vào middleware.
- Giữ middleware nhanh và không có dependency nặng; cấu hình `matcher` để bỏ qua tài nguyên tĩnh và `_next`.
- Tập trung việc đọc phiên vào một helper (`getSession()`), bọc bằng `cache()`, mọi code server dùng chung.

## 7. Biến môi trường

- Biến chỉ-server không có tiền tố; **chỉ `NEXT_PUBLIC_*` tới được trình duyệt**, và được nhúng lúc build. Không bao giờ đặt bí mật, URL nội bộ hay khoá có quyền ghi trong `NEXT_PUBLIC_*`.
- Validate env lúc khởi động trong `lib/env.ts` (Zod) và import đối tượng có kiểu ở mọi nơi; không đọc `process.env` trực tiếp trong component.
- Ghi lại mọi biến trong `.env.example`. Không commit file `.env*` có giá trị thật.

## 8. Routing, layout và ranh giới UX

- UI dùng chung đặt ở `layout.tsx` (layout được giữ qua các lần điều hướng); state theo từng lần điều hướng chỉ đặt ở `template.tsx` khi cần.
- Cung cấp `loading.tsx` (skeleton khớp layout), `error.tsx` (`'use client'`, có hành động reset), và `not-found.tsx` ở các cấp segment có ý nghĩa. Gọi `notFound()` cho tài nguyên không tồn tại thay vì render trang rỗng.
- Dùng `next/link` cho điều hướng nội bộ và `useRouter` chỉ cho điều hướng bằng code trong Client Component. Không dùng `<a href>` cho route nội bộ.
- Dynamic segment: validate param (định dạng, sự tồn tại) trước khi dùng.
- Chỉ dùng parallel/intercepting route khi thiết kế cần (modal route); chúng thêm độ phức tạp.
- Giữ state URL trong search params cho bộ lọc/phân trang để trang chia sẻ được và thân thiện SSR.

## 9. Metadata, SEO và tài nguyên

- Export `metadata` hoặc `generateMetadata` cho mỗi route (title, description, Open Graph, canonical). Đặt `metadataBase` một lần ở layout gốc.
- Thêm `sitemap.ts` và `robots.ts` cho site công khai; dùng structured data (JSON-LD) khi có ích.
- **Ảnh:** luôn dùng `next/image` với `width`/`height` (hoặc `fill` + cha có kích thước), `alt` có nghĩa, `sizes` cho ảnh responsive, và `priority` chỉ cho ảnh hero trên màn hình đầu. Whitelist host ảnh từ xa trong config.
- **Font:** dùng `next/font` (tự host, không dịch layout); chỉ tải weight/subset cần thiết.
- Script bên thứ ba đi qua `next/script` với `strategy` phù hợp (`afterInteractive`/`lazyOnload`).

## 10. Hiệu năng

- Server Component và streaming là công cụ hiệu năng chính; giữ bundle client nhỏ. Kiểm tra bằng bundle analyzer trước khi thêm dependency phía client.
- Dùng `next/dynamic` cho component client nặng (biểu đồ, editor, bản đồ), với `ssr: false` chỉ khi thật sự chỉ chạy trên trình duyệt.
- Ưu tiên static generation hoặc render có cache cho trang công khai; dùng `generateStaticParams` cho dynamic route đã biết.
- Tránh waterfall request (await tuần tự dữ liệu độc lập), state client lớn được hydrate từ server, và props serialize quá lớn.
- Theo dõi Core Web Vitals ở production; sửa hồi quy trước khi xây thêm tính năng lên trên.

## 11. Bảo mật đặc thù

- Server Action và Route Handler là điểm vào công khai: validate, xác thực, phân quyền, giới hạn tốc độ (xem mục 4/5).
- Đặt security header trong `next.config` (CSP, `X-Content-Type-Options`, `Referrer-Policy`, chống nhúng khung) theo chính sách của repo.
- Làm sạch hoặc tránh render HTML thô; không bao giờ nội suy input người dùng vào `dangerouslySetInnerHTML`.
- Giới hạn `images.remotePatterns`, redirect và rewrite vào host đã biết để chống open redirect và SSRF.
- Không log toàn bộ body request hay cookie.

## 12. Kiểm thử

- Unit/component test cho Client Component và hook bằng Vitest/Jest + Testing Library. Server Component dễ test nhất qua **E2E** (Playwright) vì Server Component bất đồng bộ chưa được các bộ render unit hỗ trợ đầy đủ.
- Tách logic ra khỏi component/action thành hàm thuần và unit-test chúng.
- Test Server Action bằng cách gọi chúng với session và API client giả; kiểm chứng validation, phân quyền và lời gọi revalidate.
- E2E cho các luồng quan trọng chạy trên app thật với backend test; seed dữ liệu cô lập.
- Chạy `next build` như một phần của kiểm chứng: nó bắt lỗi kiểu, ranh giới Server/Client sai, và lỗi static generation mà chế độ dev che đi.

## 13. Lỗi thường gặp

- Đánh dấu cả trang `'use client'` "cho chạy được" - đẩy mọi thứ vào bundle. Hãy cô lập lá tương tác.
- Hydration mismatch do `Date.now()`, `Math.random()`, định dạng phụ thuộc locale, hoặc kiểm tra chỉ-trình-duyệt trong render.
- Quên `await` các API request bất đồng bộ (`params`, `cookies()`) ở bản 15+.
- Giả định mặc định caching của bản major khác; dẫn tới dữ liệu cũ hoặc không bao giờ cache.
- Chỉ phân quyền trong middleware.
- Import module server (DB client, bí mật) vào code client.
- Chuỗi `await` tuần tự gây trang chậm.
- `redirect()` trong `try/catch` nuốt mất redirect.
- Dùng Route Handler làm một chặng thừa phía trước API.

## 14. Checklist trước khi hoàn thành

- [ ] Server Component là mặc định; `'use client'` chỉ ở lá tương tác
- [ ] Dữ liệu lấy ở server, song song, có quyết định caching tường minh
- [ ] Action/handler tự validate, xác thực và phân quyền bên trong
- [ ] Đã xử lý `loading`, `error`, `not-found`; đã đặt metadata
- [ ] Không có bí mật trong `NEXT_PUBLIC_*`; env đã validate
- [ ] `next build`, lint, type-check và test đều qua
