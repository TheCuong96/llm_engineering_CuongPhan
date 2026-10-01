// PostToolUse (Edit|Write|MultiEdit): format -> lint -> check against the standards.
// Sau khi Claude sửa file: tự định dạng -> lint -> đối chiếu chuẩn. Có lỗi thì exit 2 để Claude tự sửa.
import fs from 'node:fs';
import path from 'node:path';
import {
  readInput, block, t, config, disabled, absPath, relPath, findUp, findBin, nearestPackage,
  detectAreas, makeCtx, run, ruff, hasPyRuffConfig,
} from './lib.mjs';
import common from './areas/common.mjs';
import frontend from './areas/frontend.mjs';
import nextjs from './areas/nextjs.mjs';
import backend from './areas/backend.mjs';
import nestjs from './areas/nestjs.mjs';
import python from './areas/python.mjs';

const input = readInput();
const target = input.tool_input?.file_path;
if (!target) process.exit(0);
const file = absPath(target);
if (!fs.existsSync(file) || !fs.statSync(file).isFile()) process.exit(0);
const rel = relPath(file);
if (/(^|\/)(node_modules|\.next|dist|coverage|\.venv|venv|__pycache__)\//.test(rel)) process.exit(0);

const cfg = config().postEdit;
const timeout = cfg.timeoutSec * 1000;
const ext = path.extname(file).toLowerCase();
const isJs = /^\.(ts|tsx|js|jsx|mjs|cjs)$/.test(ext);
const isPy = ext === '.py';
if (!isJs && !isPy) process.exit(0);

const problems = [];
const trim = (s, n = 3000) => (s.length > n ? s.slice(0, n) + '\n...(truncated)' : s);

// ---------- 1. format + lint (only when the project has the tool configured) ----------
if (isJs) {
  const pkg = nearestPackage(file);
  const dir = pkg ? pkg.dir : path.dirname(file);

  const prettierCfg =
    findUp(dir, ['.prettierrc', '.prettierrc.json', '.prettierrc.yaml', '.prettierrc.yml', '.prettierrc.js', '.prettierrc.cjs', '.prettierrc.mjs', 'prettier.config.js', 'prettier.config.cjs', 'prettier.config.mjs']) ||
    (pkg && pkg.json.prettier ? 'package.json' : null);
  const prettier = findBin('prettier', dir);
  if (cfg.format && prettierCfg && prettier) run(prettier, ['--write', '--log-level', 'silent', file], { cwd: dir, timeout });

  const eslintCfg =
    findUp(dir, ['eslint.config.js', 'eslint.config.mjs', 'eslint.config.cjs', 'eslint.config.ts', '.eslintrc', '.eslintrc.js', '.eslintrc.cjs', '.eslintrc.json', '.eslintrc.yml', '.eslintrc.yaml']) ||
    (pkg && pkg.json.eslintConfig ? 'package.json' : null);
  const eslint = findBin('eslint', dir);
  if (cfg.lint && eslintCfg && eslint) {
    const r = run(eslint, ['--fix', file], { cwd: dir, timeout });
    if (r.status === 1) problems.push(`ESLint:\n${trim((r.stdout || r.stderr || '').trim())}`);
  }
}
if (isPy && hasPyRuffConfig(path.dirname(file))) {
  const dir = path.dirname(file);
  if (cfg.format) ruff(['format', '--quiet', file], dir, timeout);
  if (cfg.lint) {
    const r = ruff(['check', '--fix', '--quiet', '--output-format=concise', file], dir, timeout);
    if (r && r.status === 1) problems.push(`Ruff:\n${trim((r.stdout || '').trim())}`);
  }
}

// ---------- 2. standards checks (read the file AFTER formatting) ----------
if (cfg.areaChecks) {
  let content = '';
  try {
    content = fs.readFileSync(file, 'utf8');
  } catch {
    /* unreadable */
  }
  if (content) {
    const ctx = makeCtx(file, content);
    const areas = detectAreas(file);
    const checks = [common];
    if (areas.has('frontend')) checks.push(frontend);
    if (areas.has('nextjs')) checks.push(nextjs);
    if (areas.has('backend')) checks.push(backend);
    if (areas.has('nestjs')) checks.push(nestjs);
    if (areas.has('python')) checks.push(python);

    const seen = new Set();
    const findings = [];
    for (const c of checks)
      for (const f of c(ctx)) {
        const id = (f.msg.match(/^\[([\w-]+)\]/) || [])[1];
        if (id && disabled(id)) continue;
        const key = `${f.line}:${f.msg}`;
        if (!seen.has(key)) {
          seen.add(key);
          findings.push(f);
        }
      }
    if (findings.length)
      problems.push(
        findings
          .slice(0, 25)
          .map((f) => `  L${f.line}: ${f.msg}`)
          .join('\n'),
      );
  }
}

if (problems.length) {
  block(
    `${t({
      en: `Standards check failed for ${rel}. Fix these, then continue:`,
      vi: `Kiểm tra chuẩn thất bại ở ${rel}. Hãy sửa các điểm sau rồi tiếp tục:`,
    })}\n${problems.join('\n\n')}\n\n${t({
      en: 'False positive? Add `// hook-ignore` (or `# hook-ignore`) on that line with a reason, or disable the rule id in .claude/hooks/config.json.',
      vi: 'Báo nhầm? Thêm `// hook-ignore` (hoặc `# hook-ignore`) trên dòng đó kèm lý do, hoặc tắt rule id trong .claude/hooks/config.json.',
    })}`,
  );
}
