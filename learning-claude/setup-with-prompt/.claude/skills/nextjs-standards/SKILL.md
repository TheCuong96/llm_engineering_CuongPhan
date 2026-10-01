---
name: nextjs-standards
description: Next.js standards for this repository - App Router structure, Server vs Client Components, data fetching and caching, Server Actions, Route Handlers, authentication and middleware/proxy, environment variables, metadata/SEO, images and fonts, error/loading boundaries, performance and testing. Use this skill whenever working on files in the Next.js app (app/, pages/, components, next.config, middleware/proxy, route handlers, server actions), or when the user mentions Next.js, routing, SSR, SSG, ISR, RSC, caching, or "the web app", even if they do not say "Next.js" explicitly. Always combine with frontend-standards.
---

# Next.js Standards

Builds on `frontend-standards` (UI, accessibility, state, forms) and `project-standards` (process, contracts, security). This file covers what is specific to Next.js.

**Version first.** Next.js behaviour changes significantly between majors (14 -> 15 -> 16). Read `package.json` and `next.config.*`, check whether the app uses the App Router (`app/`) or Pages Router (`pages/`), and follow the repo's version. If you are unsure whether an API exists in the installed version, check the installed package or the official docs for that version before using it. Notes below flag version-sensitive items.

## 1. Project structure (App Router)

```
app/
  (marketing)/ (auth)/ (dashboard)/   # route groups: organise without changing URLs
  layout.tsx page.tsx                 # root layout and home
  error.tsx loading.tsx not-found.tsx # boundaries per segment
  api/<resource>/route.ts             # Route Handlers (only when needed)
components/ui/                        # shared primitives, no feature imports
features/<feature>/{components,actions,queries,schemas,types}
lib/{api-client,auth,env,utils}       # server/client-safe helpers
```

- `app/` holds routing and thin page files only. Pages compose feature components; business UI lives in `features/`.
- Colocate with `_private` folders when a file must live inside `app/` but is not a route.
- Do not mix `pages/` and `app/` for the same route. If both exist, follow the repo's migration plan and ask before moving routes.

## 2. Server vs Client Components

**Default to Server Components.** Add `'use client'` only at the smallest leaf that needs it.

| Needs | Component type |
|---|---|
| Fetch data, read secrets, access backend directly, heavy dependencies | Server |
| `useState`, `useEffect`, event handlers, browser APIs, context consumers | Client |

- Push `'use client'` **down** the tree. Wrap only the interactive part (a button, a form field), not the whole page.
- Pass Server Components into Client Components as `children`/props to keep them on the server.
- Props crossing the server -> client boundary must be **serialisable** (no functions except Server Actions, no class instances, no `Date` surprises - pass ISO strings).
- Never import server-only code into a Client Component. Mark sensitive modules with `import 'server-only'` so the build fails if they leak.
- Do not read `window`/`document`/`localStorage` during render; use effects or guard for SSR to avoid hydration mismatches.
- Providers (theme, query client) live in a dedicated `'use client'` `Providers` component imported by the root layout.

## 3. Data fetching

- **Fetch on the server, close to where the data is used**, in Server Components, using `async/await`. Avoid fetching in `useEffect` for initial page data.
- Run independent requests in parallel (`Promise.all`) to prevent waterfalls; stream slow parts with `<Suspense>` and a skeleton fallback.
- Server-side calls to our NestJS API go through the shared API client module with an explicit timeout and the `x-request-id` header. Forward the user's auth credentials deliberately (cookie/token), never use a god-token for user data.
- Deduplicate: wrap shared fetchers in React `cache()` so multiple components in one request share the result.
- Use the client-side data library (TanStack Query / SWR) only for interactive, frequently refreshed, or user-driven client data.
- **Validate** API responses with the shared schema before using them.

### Caching (version-sensitive - verify)
- In Next.js 15+, `fetch` requests and `GET` Route Handlers are **not cached by default**; opt in explicitly. In 14 they were cached by default. Do not assume.
- Choose a strategy per data type and write it down in a comment:
  - Static/rarely changing: cache with `revalidate` (time-based) or tags.
  - User-specific or real-time: no cache (dynamic).
  - After mutations: invalidate with `revalidateTag` / `revalidatePath` (or the equivalent in the repo's version, such as Cache Components with `'use cache'` in Next.js 16) from the Server Action or handler that changed the data.
- Reading `cookies()`, `headers()`, or `searchParams` makes a route dynamic. In Next.js 15+, `params`, `searchParams`, `cookies()`, and `headers()` are **async** and must be awaited; follow the repo's version.
- Never cache responses containing personal or per-user data in a shared cache.

## 4. Server Actions

- Use Server Actions (`'use server'`) for **mutations triggered by forms or UI events**, not for data reads.
- Treat every action as a **public HTTP endpoint**: re-authenticate, re-authorise on the resource, and validate inputs with the shared schema **inside** the action. Never trust that the UI prevented bad input.
- Return a typed result (`{ ok: true, data } | { ok: false, error, fieldErrors }`) instead of throwing for expected failures; the form maps `fieldErrors` to fields.
- Call `revalidateTag`/`revalidatePath` or `redirect()` after success as appropriate (`redirect` throws internally - do not wrap it in `try/catch`).
- Use `useActionState` / `useFormStatus` for pending and error state; support progressive enhancement where practical.
- Keep actions thin: validate, authorise, call a service/API client, revalidate. Business logic stays in the NestJS API.

## 5. Route Handlers (`route.ts`)

- Use them for webhooks, file streaming, OAuth callbacks, or BFF endpoints that the browser must call. Do not create a Route Handler just to proxy a call a Server Component could make directly.
- Export named HTTP method functions; validate input; return `Response`/`NextResponse.json` with correct status codes and the standard error shape.
- Verify webhook signatures; apply rate limiting on public handlers.
- Specify runtime (`nodejs`/`edge`) deliberately; edge has API limits (no Node-only libraries).

## 6. Authentication and middleware

- Session tokens live in `httpOnly`, `Secure`, `SameSite` cookies set by the server. Never expose them to client JavaScript.
- **Middleware (`middleware.ts`, renamed to `proxy.ts` in Next.js 16 - check the repo) is for cheap, optimistic checks only** (redirect unauthenticated users, locale, rewrites). It is not the security boundary.
- **Authorise again where data is accessed** (Server Component, Server Action, Route Handler, and the NestJS API). Never rely on middleware alone.
- Keep middleware fast and dependency-free; configure `matcher` to skip static assets and `_next`.
- Centralise session reading in one helper (`getSession()`), wrapped in `cache()`, used by all server code.

## 7. Environment variables

- Server-only variables have no prefix; **only `NEXT_PUBLIC_*` reaches the browser**, and it is inlined at build time. Never put secrets, internal URLs, or keys with write power in `NEXT_PUBLIC_*`.
- Validate env at startup in `lib/env.ts` (Zod) and import the typed object everywhere; do not read `process.env` directly in components.
- Document every variable in `.env.example`. Do not commit `.env*` files with real values.

## 8. Routing, layouts, and UX boundaries

- Shared UI goes in `layout.tsx` (layouts persist across navigation); per-navigation state goes in `template.tsx` only when needed.
- Provide `loading.tsx` (skeleton matching layout), `error.tsx` (`'use client'`, with a reset action), and `not-found.tsx` at meaningful segment levels. Call `notFound()` for missing resources rather than rendering an empty page.
- Use `next/link` for internal navigation and `useRouter` only for programmatic navigation in Client Components. Do not use `<a href>` for internal routes.
- Dynamic segments: validate the param (format, existence) before use.
- Use parallel/intercepting routes only when the design needs them (modal routes); they add complexity.
- Keep URL state in search params for filters/pagination so pages are shareable and SSR-friendly.

## 9. Metadata, SEO, and assets

- Export `metadata` or `generateMetadata` per route (title, description, Open Graph, canonical). Set `metadataBase` once in the root layout.
- Add `sitemap.ts` and `robots.ts` for public sites; use structured data (JSON-LD) where it helps.
- **Images:** always use `next/image` with `width`/`height` (or `fill` + sized parent), meaningful `alt`, `sizes` for responsive images, and `priority` only for the above-the-fold hero. Whitelist remote hosts in config.
- **Fonts:** use `next/font` (self-hosted, no layout shift); load only needed weights/subsets.
- Third-party scripts go through `next/script` with an appropriate `strategy` (`afterInteractive`/`lazyOnload`).

## 10. Performance

- Server Components and streaming are the main performance tools; keep client bundles small. Inspect with the bundle analyser before adding client dependencies.
- Use `next/dynamic` for heavy client-only components (charts, editors, maps), with `ssr: false` only when truly browser-only.
- Prefer static generation or cached rendering for public pages; use `generateStaticParams` for known dynamic routes.
- Avoid request waterfalls (sequential awaits of independent data), large client-side state hydrated from the server, and oversized serialised props.
- Watch Core Web Vitals in production; fix regressions before shipping new features on top.

## 11. Security specifics

- Server Actions and Route Handlers are public entry points: validate, authenticate, authorise, rate-limit (see section 4/5).
- Set security headers in `next.config` (CSP, `X-Content-Type-Options`, `Referrer-Policy`, frame protections) following the repo's policy.
- Sanitise or avoid raw HTML rendering; never interpolate user input into `dangerouslySetInnerHTML`.
- Restrict `images.remotePatterns`, redirects, and rewrites to known hosts to prevent open redirects and SSRF.
- Do not log full request bodies or cookies.

## 12. Testing

- Unit/component tests for Client Components and hooks with Vitest/Jest + Testing Library. Server Components are easiest to test through **E2E** (Playwright) because async Server Components are not fully supported by unit renderers.
- Extract logic out of components/actions into plain functions and unit-test those.
- Test Server Actions by calling them with a mocked session and API client; assert validation, authorisation, and revalidation calls.
- E2E for critical flows against a running app with a test backend; seed isolated data.
- Run `next build` as part of verification: it catches type errors, bad Server/Client boundaries, and static-generation failures that dev mode hides.

## 13. Common pitfalls

- Marking a whole page `'use client'` "to make it work" - moves everything into the bundle. Isolate the interactive leaf instead.
- Hydration mismatch from `Date.now()`, `Math.random()`, locale-dependent formatting, or browser-only checks in render.
- Forgetting to `await` async request APIs (`params`, `cookies()`) in 15+.
- Assuming caching defaults from another major version; stale or never-cached data results.
- Doing authorisation only in middleware.
- Importing server modules (DB clients, secrets) into client code.
- Sequential `await` chains causing slow pages.
- `redirect()` inside `try/catch` swallowing the redirect.
- Using Route Handlers as an unnecessary hop in front of the API.

## 14. Pre-completion checklist

- [ ] Server Components by default; `'use client'` only on interactive leaves
- [ ] Data fetched on the server in parallel with an explicit caching decision
- [ ] Actions/handlers validate, authenticate, and authorise inside themselves
- [ ] `loading`, `error`, `not-found` handled; metadata set
- [ ] No secret in `NEXT_PUBLIC_*`; env validated
- [ ] `next build`, lint, type-check, and tests pass
