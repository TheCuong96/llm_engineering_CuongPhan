// PreToolUse (Bash): DENY catastrophic commands, ASK for risky ones.
// DENY = chặn hẳn (exit 2). ASK = hiện hộp xác nhận cho người dùng. Mirrors "Ask before you act" in project-standards.
import path from 'node:path';
import { readInput, block, ask, t, currentBranch, config, disabled, PROJECT_DIR } from './lib.mjs';

const input = readInput();
const cmd = String(input.tool_input?.command || '');
if (!cmd.trim()) process.exit(0);
const cfg = config();
const segments = cmd.split(/&&|\|\||;|\n|\|/).map((s) => s.trim()).filter(Boolean);

// ---------- helpers ----------
const unquote = (s) => s.replace(/^['"]|['"]$/g, '');
function isWideTarget(raw) {
  const x = unquote(raw);
  if (['/', '/*', '~', '~/', '~/*', '$HOME', '$HOME/', '${HOME}', '.', './', '..', '../', '*', './*', '.*', '.git', '.git/'].includes(x)) return true;
  if (/^\/[^/]*\/?\*?$/.test(x)) return true; // /usr, /etc, /home/*
  return path.resolve(PROJECT_DIR, x) === PROJECT_DIR;
}
function rmDangerous() {
  return segments.some((seg) => {
    const tok = seg.split(/\s+/);
    const i = tok.indexOf('rm');
    if (i < 0) return false;
    const args = tok.slice(i + 1);
    const recursive = args.some((a) => /^-[a-zA-Z]*[rR][a-zA-Z]*$/.test(a) || a === '--recursive');
    return recursive && args.filter((a) => !a.startsWith('-')).some(isWideTarget);
  });
}
function pushesToProtected() {
  return segments.some((seg) => {
    const m = seg.match(/\bgit\s+push\b(.*)$/);
    if (!m) return false;
    const args = m[1].trim().split(/\s+/).filter((a) => a && !a.startsWith('-'));
    const refs = args.slice(1).flatMap((a) => a.split(':')).map((a) => a.replace(/^refs\/heads\//, ''));
    if (refs.some((r) => cfg.protectedBranches.includes(r))) return true;
    if (args.length <= 1) return cfg.protectedBranches.includes(currentBranch());
    return false;
  });
}
function remoteMongo() {
  const re = /mongodb(?:\+srv)?:\/\/(?:[^@/\s'"]+@)?([^/\s'"?,:]+)/gi;
  for (const m of cmd.matchAll(re)) {
    const host = m[1];
    if (!/^(localhost|127\.0\.0\.1|0\.0\.0\.0|host\.docker\.internal)$/i.test(host) && host.includes('.')) return true;
  }
  return /mongodb\+srv:\/\//i.test(cmd);
}
function addsDependency() {
  return segments.some((seg) => {
    let m = seg.match(/\b(?:npm|pnpm|bun)\s+(?:i|install|add)\b(.*)$/) || seg.match(/\byarn\s+add\b(.*)$/);
    if (m) {
      const a = m[1].trim().split(/\s+/).filter(Boolean);
      return a.some((x) => !x.startsWith('-')) && !/\byarn\s+install\b/.test(seg);
    }
    m = seg.match(/\b(?:pip3?|python3?\s+-m\s+pip)\s+install\b(.*)$/);
    if (m) return !/(^|\s)(-r|--requirement|-e|--editable)(\s|=)/.test(m[1]) && /\S/.test(m[1].replace(/--?\w[\w-]*/g, ''));
    return /\b(uv\s+add|poetry\s+add|pipenv\s+install\s+\S)/.test(seg);
  });
}

// ---------- rules ----------
const R = (id, test, m) => ({ id, test, m });
const DENY = [
  R('rm-wide', rmDangerous, {
    en: 'Recursive delete of a root/home/wildcard/project-root path. Delete specific files inside the project instead.',
    vi: 'Xoá đệ quy thư mục gốc/home/ký tự đại diện/gốc dự án. Hãy xoá cụ thể từng file trong dự án.',
  }),
  R('force-push', () => /\bgit\s+push\b[^\n;&|]*(\s--force(?!-)\b|\s-f(\s|$))/.test(cmd), {
    en: 'git push --force rewrites shared history. Use a normal push on your feature branch, or ask the user.',
    vi: 'git push --force ghi đè lịch sử dùng chung. Hãy push bình thường trên nhánh tính năng, hoặc hỏi người dùng.',
  }),
  R('push-protected', pushesToProtected, {
    en: `Direct push to a protected branch (${cfg.protectedBranches.join(', ')}). Push a feature branch and open a pull request.`,
    vi: `Push trực tiếp lên nhánh được bảo vệ (${cfg.protectedBranches.join(', ')}). Hãy push nhánh tính năng rồi mở pull request.`,
  }),
  R('no-verify', () => /\bgit\s+(commit|push|merge|rebase)\b[^\n;&|]*--no-verify\b/.test(cmd), {
    en: 'Do not bypass git hooks (--no-verify). Fix the failing check instead.',
    vi: 'Không được bỏ qua git hook (--no-verify). Hãy sửa lỗi của bước kiểm tra.',
  }),
  R('db-destructive', () => /\b(dropDatabase|dropCollection)\b|\.drop\s*\(\s*\)|deleteMany\s*\(\s*\{\s*\}\s*\)|mongorestore\b[^\n]*--drop\b|\bDROP\s+(DATABASE|TABLE|SCHEMA)\b|\bTRUNCATE\b/i.test(cmd), {
    en: 'Destructive database operation. Never run these from the agent; ask the user to do it deliberately.',
    vi: 'Thao tác phá huỷ cơ sở dữ liệu. Agent không được tự chạy; hãy nhờ người dùng thực hiện có chủ đích.',
  }),
  R('remote-mongo', remoteMongo, {
    en: 'Command targets a non-local MongoDB (cloud/remote URI). Agents may only touch local development databases.',
    vi: 'Lệnh nhắm tới MongoDB không phải local (URI cloud/từ xa). Agent chỉ được thao tác với DB phát triển trên máy local.',
  }),
  R('curl-pipe-shell', () => /\b(curl|wget)\b[^\n|]*\|\s*(sudo\s+)?(sh|bash|zsh|python3?|node)\b/.test(cmd), {
    en: 'Piping a download into a shell executes unreviewed code. Download, inspect, then run.',
    vi: 'Pipe file tải về vào shell sẽ chạy mã chưa kiểm duyệt. Hãy tải về, đọc kỹ rồi mới chạy.',
  }),
  R('sudo-chmod', () => /(^|[;&|]\s*)sudo\s/.test(cmd) || /\bchmod\s+(-R\s+)?[0-7]?777\b/.test(cmd), {
    en: 'sudo / chmod 777 is not allowed for the agent.',
    vi: 'Agent không được dùng sudo / chmod 777.',
  }),
  R('print-secrets', () => /\b(cat|less|more|head|tail|type|bat)\s+[^|;&\n]*\.env(\.(?!example|sample|template)[\w.-]+)?(?=\s|$|['"])/.test(cmd) || /(^|[;&|]\s*)(printenv|env)\s*($|[|;&])/.test(cmd), {
    en: 'Do not print .env files or the whole environment: it leaks secrets into the conversation. Read only variable NAMES from .env.example.',
    vi: 'Không in file .env hay toàn bộ biến môi trường: sẽ lộ bí mật vào hội thoại. Chỉ đọc TÊN biến trong .env.example.',
  }),
];
const ASK = [
  R('add-dependency', addsDependency, {
    en: 'Adding a dependency needs your approval (size, licence, security, maintenance).',
    vi: 'Thêm thư viện phụ thuộc cần bạn duyệt (dung lượng, giấy phép, bảo mật, bảo trì).',
  }),
  R('db-migrate-seed', () => /\b(migrate-mongo|mongosh|mongodump|mongorestore|alembic)\b|\b(npm|pnpm|yarn)\s+(run\s+)?[\w:-]*(migrat|seed)[\w:-]*|\bpython3?\s+[^\n]*\b(seed|migrate)\w*\.py/.test(cmd), {
    en: 'Database migration/seed/shell command. Confirm it targets a LOCAL database.',
    vi: 'Lệnh migration/seed/shell cơ sở dữ liệu. Hãy xác nhận nó nhắm tới DB LOCAL.',
  }),
  R('publish-deploy', () => /\b(npm|pnpm|yarn)\s+publish\b|\btwine\s+upload\b|\bdocker\s+push\b|\bkubectl\s+(apply|delete|rollout|scale)\b|\bterraform\s+(apply|destroy)\b|\bhelm\s+(install|upgrade|uninstall)\b|\bvercel\b[^\n]*--prod\b|\bgh\s+release\s+create\b|\bfly\s+deploy\b/.test(cmd), {
    en: 'Publish/deploy/infrastructure command. Confirm before running.',
    vi: 'Lệnh publish/deploy/hạ tầng. Hãy xác nhận trước khi chạy.',
  }),
  R('git-destructive', () => /\bgit\s+(reset\s+--hard|clean\s+-[a-z]*f|checkout\s+(--\s+)?\.(\s|$)|restore\s+\.(\s|$)|branch\s+-D|stash\s+(drop|clear))|\bgit\s+push\b[^\n;&|]*--force-with-lease/.test(cmd), {
    en: 'This git command can destroy uncommitted work or rewrite history. Confirm before running.',
    vi: 'Lệnh git này có thể làm mất thay đổi chưa commit hoặc ghi đè lịch sử. Hãy xác nhận trước khi chạy.',
  }),
];

for (const r of DENY) {
  if (!disabled(r.id) && r.test()) block(`Blocked [${r.id}]: ${t(r.m)}\n${t({ en: 'Command', vi: 'Lệnh' })}: ${cmd.slice(0, 300)}`);
}
for (const r of ASK) {
  if (!disabled(r.id) && r.test()) ask(`[${r.id}] ${t(r.m)}`);
}
