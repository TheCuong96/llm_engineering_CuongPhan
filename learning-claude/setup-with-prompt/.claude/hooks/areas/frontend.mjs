// Front-end checks (React/TypeScript) mirroring skill frontend-standards.
// Kiểm tra front-end, phản chiếu skill frontend-standards.
import { hits } from '../lib.mjs';

export default function check(ctx) {
  if (ctx.lang !== 'js') return [];
  const isDts = /\.d\.ts$/.test(ctx.base);
  return [
    ...(isDts
      ? []
      : hits(
          ctx,
          /(:\s*any\b|\bas\s+any\b|<any[,>]|,\s*any\s*[>,])/,
          {
            en: '[no-any] Avoid `any`. Use `unknown` and narrow, or a real/generated type (frontend-standards §1).',
            vi: '[no-any] Tránh `any`. Dùng `unknown` rồi thu hẹp, hoặc kiểu thật/kiểu sinh từ contract (frontend-standards §1).',
          },
          { skipTests: true },
        )),
    ...hits(
      ctx,
      /\bconsole\.(log|debug|info)\(/,
      { en: '[no-console] Remove console output; use the monitoring/logging layer (project-standards §3).', vi: '[no-console] Xoá console output; dùng lớp logging/monitoring (project-standards §3).' },
      { skipTests: true },
    ),
    ...hits(
      ctx,
      /dangerouslySetInnerHTML/,
      {
        en: '[xss] dangerouslySetInnerHTML requires sanitised content (DOMPurify) and a justification comment (frontend-standards §11). Add `hook-ignore` only after sanitising.',
        vi: '[xss] dangerouslySetInnerHTML cần nội dung đã làm sạch (DOMPurify) và comment giải thích (frontend-standards §11). Chỉ thêm `hook-ignore` sau khi đã sanitize.',
      },
      { unless: /sanitiz|DOMPurify/i },
    ),
    ...hits(ctx, /localStorage\.setItem\(\s*['"`][^'"`]*(token|jwt|secret|password|session)/i, {
      en: '[token-storage] Do not keep tokens/sessions in localStorage. Use httpOnly, Secure, SameSite cookies set by the server (frontend-standards §11).',
      vi: '[token-storage] Không lưu token/session trong localStorage. Dùng cookie httpOnly, Secure, SameSite do server đặt (frontend-standards §11).',
    }),
    ...hits(ctx, /<(div|span)\b[^>]*\sonClick=/, {
      en: '[a11y-click] Click handler on a div/span is not keyboard accessible. Use <button> (or <a> for navigation) (frontend-standards §7).',
      vi: '[a11y-click] Gắn onClick trên div/span không dùng được bằng bàn phím. Dùng <button> (hoặc <a> cho điều hướng) (frontend-standards §7).',
    }, { unless: /role=/ }),
    ...hits(ctx, /<img\b[^>]*>/, {
      en: '[a11y-alt] <img> without alt. Add meaningful alt text (or alt="" if decorative) (frontend-standards §7).',
      vi: '[a11y-alt] <img> thiếu alt. Thêm alt có nghĩa (hoặc alt="" nếu chỉ trang trí) (frontend-standards §7).',
    }, { unless: /\balt=|\{\.\.\./ }),
    ...hits(ctx, /\bkey=\{\s*(index|idx|i)\s*\}/, {
      en: '[list-key] Do not use the array index as a React key for dynamic lists; use a stable id (frontend-standards §2).',
      vi: '[list-key] Không dùng chỉ số mảng làm key React cho danh sách động; dùng id ổn định (frontend-standards §2).',
    }),
    ...hits(ctx, /target=["']_blank["']/, {
      en: '[noopener] target="_blank" needs rel="noopener noreferrer" (frontend-standards §11).',
      vi: '[noopener] target="_blank" cần rel="noopener noreferrer" (frontend-standards §11).',
    }, { unless: /rel=/ }),
  ];
}
