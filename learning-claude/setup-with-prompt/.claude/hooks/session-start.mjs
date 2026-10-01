// SessionStart: stdout is added to Claude's context. / stdout được thêm vào ngữ cảnh của Claude.
import { t, git, config, currentBranch } from './lib.mjs';

const branch = currentBranch() || '(no git)';
const dirty = git(['status', '--porcelain']).split('\n').filter(Boolean).length;
const protectedBranch = config().protectedBranches.includes(branch);

const msg = {
  en: `Project standards are active (skills + hooks).
- Always apply the skill "project-standards". Then load: Next.js -> frontend-standards + nextjs-standards; NestJS -> backend-standards + nestjs-standards; Python -> backend-standards + python-standards.
- Hooks enforce the rules: dangerous commands and protected files are blocked, secrets are scanned, edited files are formatted/linted and checked against the standards, and you cannot finish while type-check/lint fails.
- If a hook blocks you, read its message and fix the cause. Never work around a hook (no --no-verify, no editing .claude/hooks or settings). If you believe a block is wrong, ask the user.
- Git: branch "${branch}", ${dirty} uncommitted file(s).${protectedBranch ? `\n- WARNING: "${branch}" is a protected branch. Create a feature branch (feat/<topic>, fix/<topic>) before committing.` : ''}`,
  vi: `Chuẩn dự án đang được áp dụng (skill + hook).
- Luôn áp dụng skill "project-standards". Sau đó nạp thêm: Next.js -> frontend-standards + nextjs-standards; NestJS -> backend-standards + nestjs-standards; Python -> backend-standards + python-standards.
- Hook cưỡng chế quy tắc: chặn lệnh nguy hiểm và file được bảo vệ, quét bí mật, tự định dạng/lint file vừa sửa và đối chiếu chuẩn, và không cho kết thúc khi type-check/lint còn lỗi.
- Nếu bị hook chặn, hãy đọc thông báo và sửa nguyên nhân. Không được lách hook (không dùng --no-verify, không sửa .claude/hooks hay settings). Nếu cho rằng hook chặn sai, hãy hỏi người dùng.
- Git: nhánh "${branch}", ${dirty} file chưa commit.${protectedBranch ? `\n- CẢNH BÁO: "${branch}" là nhánh được bảo vệ. Hãy tạo nhánh mới (feat/<chủ-đề>, fix/<chủ-đề>) trước khi commit.` : ''}`,
};
process.stdout.write(t(msg) + '\n');
