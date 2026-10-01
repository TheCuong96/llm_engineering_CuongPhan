// Checks for ALL JS/TS files (project-standards). / Kiểm tra chung cho mọi file JS/TS.
import { hits } from '../lib.mjs';

export default function check(ctx) {
  if (ctx.lang !== 'js') return [];
  return [
    ...hits(
      ctx,
      /eslint-disable(?:-next-line|-line)?\b(?!.*\s--\s)/,
      {
        en: '[lint-disable-reason] eslint-disable without a reason. Fix the code, or add " -- why this is safe" (project-standards §3).',
        vi: '[lint-disable-reason] eslint-disable thiếu lý do. Hãy sửa code, hoặc thêm " -- vì sao an toàn" (project-standards §3).',
      },
      { comments: true },
    ),
    ...hits(
      ctx,
      /@ts-(ignore|nocheck)\b/,
      {
        en: '[ts-ignore] Do not use @ts-ignore/@ts-nocheck. Fix the type, or use @ts-expect-error with a reason (frontend-standards §1).',
        vi: '[ts-ignore] Không dùng @ts-ignore/@ts-nocheck. Hãy sửa kiểu, hoặc dùng @ts-expect-error kèm lý do (frontend-standards §1).',
      },
      { comments: true },
    ),
    ...hits(ctx, /^\s*debugger\s*;?\s*$/, {
      en: '[debugger] Remove the debugger statement.',
      vi: '[debugger] Hãy xoá lệnh debugger.',
    }),
  ];
}
