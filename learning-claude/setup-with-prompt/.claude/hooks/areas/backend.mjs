// Language-agnostic back-end checks mirroring skill backend-standards (NestJS and Python files).
// Kiểm tra back-end chung, phản chiếu skill backend-standards (cho cả file NestJS và Python).
import { hits } from '../lib.mjs';

export default function check(ctx) {
  const out = [];
  if (ctx.lang === 'js') {
    out.push(
      ...hits(ctx, /\.(find|findOne|findOneAndUpdate|findOneAndDelete|updateOne|updateMany|deleteOne|deleteMany|countDocuments|aggregate)\(\s*(req\.(body|query|params)|body|query|dto)\b/, {
        en: '[nosql-injection] Raw request data is passed as a Mongo filter. Whitelist fields and build the filter explicitly; never forward body/query (backend-standards §3, project-standards §8).',
        vi: '[nosql-injection] Dữ liệu request thô được dùng làm filter Mongo. Hãy whitelist field và dựng filter tường minh; không chuyển thẳng body/query (backend-standards §3, project-standards §8).',
      }),
      ...hits(ctx, /\bMath\.random\(\)/, {
        en: '[weak-random] Math.random() is not secure for tokens/ids/secrets. Use crypto.randomBytes / randomUUID (backend-standards §12).',
        vi: '[weak-random] Math.random() không an toàn cho token/id/bí mật. Dùng crypto.randomBytes / randomUUID (backend-standards §12).',
      }, { unless: /^(?!.*(token|secret|password|otp|nonce|key|session)).*$/i }),
      ...hits(ctx, /createHash\(\s*['"](md5|sha1)['"]\s*\)/, {
        en: '[weak-hash] md5/sha1 must not be used for passwords or tokens. Use argon2id or bcrypt (backend-standards §4).',
        vi: '[weak-hash] Không dùng md5/sha1 cho mật khẩu hay token. Dùng argon2id hoặc bcrypt (backend-standards §4).',
      }, { unless: /^(?!.*(password|passwd|pwd|token|secret)).*$/i }),
      ...hits(ctx, /\bcatch\s*(\(\s*\w*\s*\))?\s*\{\s*\}/, {
        en: '[empty-catch] Empty catch swallows errors. Handle it, or rethrow with context (backend-standards §5).',
        vi: '[empty-catch] catch rỗng nuốt mất lỗi. Hãy xử lý, hoặc ném lại kèm ngữ cảnh (backend-standards §5).',
      }),
      ...hits(ctx, /\beval\(|new\s+Function\(/, {
        en: '[no-eval] eval/new Function is forbidden (project-standards §8).',
        vi: '[no-eval] Cấm dùng eval/new Function (project-standards §8).',
      }),
      ...hits(ctx, /enableCors\(\s*\)|origin\s*:\s*(['"]\*['"]|true)\b/, {
        en: '[cors-open] CORS is open to every origin. Restrict it to known origins from configuration (backend-standards §12).',
        vi: '[cors-open] CORS đang mở cho mọi origin. Hãy giới hạn theo danh sách origin lấy từ cấu hình (backend-standards §12).',
      }),
    );
  }
  if (ctx.lang === 'py') {
    out.push(
      ...hits(ctx, /\.(find|find_one|find_one_and_update|update_one|update_many|delete_one|delete_many|count_documents|aggregate)\(\s*(request\.\w+|body|payload|query|data)\s*[,)]/, {
        en: '[nosql-injection] Raw request data is passed as a Mongo filter. Build the filter from validated fields only (backend-standards §3).',
        vi: '[nosql-injection] Dữ liệu request thô được dùng làm filter Mongo. Chỉ dựng filter từ các field đã validate (backend-standards §3).',
      }),
    );
  }
  out.push(
    ...hits(ctx, /\$where\b/, {
      en: '[mongo-where] $where is forbidden: slow and an injection risk (backend-standards §6).',
      vi: '[mongo-where] Cấm dùng $where: chậm và có rủi ro injection (backend-standards §6).',
    }),
    ...hits(ctx, /mongodb(\+srv)?:\/\/(?!localhost|127\.0\.0\.1|\$|\{|<)/i, {
      en: '[hardcoded-uri] Hard-coded MongoDB URI. Read it from validated configuration (backend-standards §9).',
      vi: '[hardcoded-uri] URI MongoDB bị ghi cứng. Hãy đọc từ cấu hình đã validate (backend-standards §9).',
    }, { skipTests: true }),
  );
  return out;
}
