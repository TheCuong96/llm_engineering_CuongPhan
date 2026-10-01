// Next.js checks mirroring skill nextjs-standards. / Kiểm tra Next.js, phản chiếu skill nextjs-standards.
import { hits, fileHit } from '../lib.mjs';

const hasDirective = (content, d) =>
  new RegExp(`^\\s*(?:\\/\\/[^\\n]*\\n|\\/\\*[\\s\\S]*?\\*\\/|\\s)*['"]${d}['"]`).test(content);

const SPECIAL = /^(page|layout|template|loading|not-found|default|route)\.(t|j)sx?$/;
const CLIENT_ONLY = /\buse(State|Effect|LayoutEffect|Reducer|Ref|Callback|Memo|Context|Transition|DeferredValue)\s*\(|\s(onClick|onChange|onSubmit|onKeyDown|onBlur|onFocus|onMouseEnter|onInput)=\{/;

export default function check(ctx) {
  if (ctx.lang !== 'js') return [];
  const inApp = ctx.rel.split('/').includes('app');
  const isClient = hasDirective(ctx.content, 'use client');
  const out = [];

  if (inApp && SPECIAL.test(ctx.base) && !isClient && CLIENT_ONLY.test(ctx.content)) {
    out.push(
      ...hits(ctx, CLIENT_ONLY, {
        en: `[server-uses-client-api] ${ctx.base} is a Server Component but uses hooks/event handlers. Move the interactive part to a small 'use client' component and import it (nextjs-standards §2).`,
        vi: `[server-uses-client-api] ${ctx.base} là Server Component nhưng dùng hook/event handler. Tách phần tương tác thành component nhỏ có 'use client' rồi import (nextjs-standards §2).`,
      }).slice(0, 1),
    );
  }
  if (inApp && /^(error|global-error)\.(t|j)sx?$/.test(ctx.base))
    out.push(
      ...fileHit(!isClient, {
        en: "[error-boundary] error.tsx / global-error.tsx must start with 'use client' (nextjs-standards §8).",
        vi: "[error-boundary] error.tsx / global-error.tsx phải bắt đầu bằng 'use client' (nextjs-standards §8).",
      }),
    );
  if (isClient)
    out.push(
      ...hits(ctx, /from\s+['"](server-only|next\/headers|fs|node:fs|child_process|node:child_process|mongoose|mongodb)['"]/, {
        en: "[client-imports-server] A 'use client' file imports a server-only module. Keep it in a Server Component/Action and pass data as props (nextjs-standards §2).",
        vi: "[client-imports-server] File 'use client' import module chỉ dành cho server. Giữ nó ở Server Component/Action và truyền dữ liệu qua props (nextjs-standards §2).",
      }),
    );
  out.push(
    ...hits(ctx, /NEXT_PUBLIC_\w*(SECRET|PRIVATE|PASSWORD|TOKEN|API_?KEY|ACCESS_?KEY)\w*/, {
      en: '[public-secret] NEXT_PUBLIC_* is inlined into the browser bundle. Never put secrets there (nextjs-standards §7).',
      vi: '[public-secret] NEXT_PUBLIC_* được nhúng vào bundle trình duyệt. Tuyệt đối không đặt bí mật ở đây (nextjs-standards §7).',
    }, { unless: /PUBLISHABLE|ANON/i }),
    ...hits(ctx, /<img\b/, {
      en: '[next-image] Use next/image instead of <img> (nextjs-standards §9).',
      vi: '[next-image] Dùng next/image thay cho <img> (nextjs-standards §9).',
    }),
    ...hits(ctx, /<a\s[^>]*href=["']\/(?!\/)/, {
      en: '[next-link] Use next/link for internal navigation (nextjs-standards §8).',
      vi: '[next-link] Dùng next/link cho điều hướng nội bộ (nextjs-standards §8).',
    }),
  );
  if (inApp) {
    out.push(
      ...hits(ctx, /from\s+['"]next\/router['"]/, {
        en: '[app-router] In the App Router import useRouter/usePathname from next/navigation, not next/router (nextjs-standards §8).',
        vi: '[app-router] Trong App Router hãy import useRouter/usePathname từ next/navigation, không phải next/router (nextjs-standards §8).',
      }),
      ...hits(ctx, /\b(getServerSideProps|getStaticProps|getInitialProps)\b/, {
        en: '[pages-api] Pages Router data APIs do not work inside app/. Fetch in Server Components (nextjs-standards §3).',
        vi: '[pages-api] API dữ liệu của Pages Router không chạy trong app/. Hãy fetch trong Server Component (nextjs-standards §3).',
      }),
    );
    if (!/(^|\/)(lib\/env|env|config)[^/]*\.(t|j)s$|\.config\./.test(ctx.rel) && !ctx.isTest)
      out.push(
        ...hits(ctx, /process\.env\.(?!NODE_ENV\b|NEXT_PUBLIC_)/, {
          en: '[typed-env] Do not read process.env in components/actions. Import the validated config from lib/env (nextjs-standards §7).',
          vi: '[typed-env] Không đọc process.env trong component/action. Import cấu hình đã validate từ lib/env (nextjs-standards §7).',
        }),
      );
  }
  return out;
}
