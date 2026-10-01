// Stop: Definition of Done gate. Claude cannot finish while type-check / ruff fail or secrets are present.
// Cổng "Definition of Done": không cho Claude kết thúc khi type-check/ruff lỗi hoặc có bí mật trong file thay đổi.
import fs from 'node:fs';
import path from 'node:path';
import {
  readInput, block, t, config, git, run, ruff, hasPyRuffConfig, findUp, findBin, nearestPackage,
  absPath, relPath, findSecrets, isTestFile, PROJECT_DIR,
} from './lib.mjs';

const input = readInput();
// Already continuing because of a previous Stop block -> never loop. / Tránh vòng lặp vô hạn.
if (input.stop_hook_active || process.env.CLAUDE_HOOKS_SKIP_STOP === '1') process.exit(0);

const cfg = config().stop;
const timeout = cfg.timeoutSec * 1000;

// ---------- changed files ----------
const porcelain = git(['status', '--porcelain=v1', '-uall']);
const changed = porcelain
  .split('\n')
  .filter(Boolean)
  .map((l) => l.slice(3).split(' -> ').pop().replace(/^"|"$/g, ''))
  .map((p) => absPath(p))
  .filter((p) => fs.existsSync(p) && fs.statSync(p).isFile());
if (!changed.length) process.exit(0);

const problems = [];
const trim = (s, n = 2500) => (s.length > n ? s.slice(0, n) + '\n...(truncated)' : s);

// ---------- 1. secrets / .env tracked ----------
if (cfg.secrets) {
  const lines = [];
  for (const f of changed) {
    const rel = relPath(f);
    const base = path.basename(f);
    if (/^\.env(\..+)?$/.test(base) && !/\.(example|sample|template)$/.test(base))
      lines.push(`  ${rel}: ${t({ en: '.env file is not git-ignored. Add it to .gitignore and never commit it.', vi: 'File .env chưa được git-ignore. Hãy thêm vào .gitignore và không commit.' })}`);
    if (/\.(png|jpe?g|gif|ico|pdf|zip|gz|woff2?|ttf|lock|lockb)$/i.test(base) || /(package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$/.test(base)) continue;
    if (fs.statSync(f).size > 300 * 1024 || /\.(example|sample|template)$/.test(base)) continue;
    let text = '';
    try {
      text = fs.readFileSync(f, 'utf8');
    } catch {
      continue;
    }
    for (const s of findSecrets(text, { relaxed: isTestFile(rel) })) lines.push(`  ${rel}:${s.line}: ${s.name}`);
  }
  if (lines.length) problems.push(`${t({ en: 'Possible secrets in changed files:', vi: 'Có thể có bí mật trong file đã thay đổi:' })}\n${lines.slice(0, 20).join('\n')}`);
}

// ---------- 2. TypeScript type-check per touched package ----------
if (cfg.typecheck) {
  const done = new Set();
  for (const f of changed.filter((x) => /\.(ts|tsx)$/.test(x) && !/node_modules/.test(x))) {
    const pkg = nearestPackage(f);
    if (!pkg) continue;
    const tsconfig = findUp(path.dirname(f), ['tsconfig.json'], pkg.dir);
    if (!tsconfig || done.has(tsconfig)) continue;
    done.add(tsconfig);
    const tsc = findBin('tsc', pkg.dir);
    if (!tsc) continue;
    const r = run(tsc, ['--noEmit', '-p', tsconfig], { cwd: pkg.dir, timeout });
    if (r.status === 1 || r.status === 2) {
      const out = (r.stdout || r.stderr || '').trim().split('\n').slice(0, 40).join('\n');
      problems.push(`${t({ en: 'Type-check failed in', vi: 'Type-check thất bại tại' })} ${relPath(pkg.dir) || '.'}:\n${trim(out)}`);
    }
  }
}

// ---------- 3. Ruff on touched Python files ----------
if (cfg.ruff) {
  const byDir = new Map();
  for (const f of changed.filter((x) => x.endsWith('.py'))) {
    const root = findUp(path.dirname(f), ['pyproject.toml', 'ruff.toml', '.ruff.toml']);
    if (!root || !hasPyRuffConfig(path.dirname(f))) continue;
    const d = path.dirname(root);
    byDir.set(d, [...(byDir.get(d) || []), f]);
  }
  for (const [dir, files] of byDir) {
    const r = ruff(['check', '--output-format=concise', ...files], dir, timeout);
    if (r && r.status === 1) problems.push(`Ruff (${relPath(dir) || '.'}):\n${trim((r.stdout || '').trim())}`);
  }
}

if (problems.length) {
  block(
    `${t({
      en: 'Definition of Done not met. Fix the following before finishing:',
      vi: 'Chưa đạt Definition of Done. Hãy sửa các điểm sau trước khi kết thúc:',
    })}\n\n${problems.join('\n\n')}\n\n${t({
      en: 'Cannot fix something (missing tool, pre-existing failure)? Say so explicitly in your final answer instead of claiming success.',
      vi: 'Không sửa được (thiếu công cụ, lỗi có từ trước)? Hãy nói rõ trong câu trả lời cuối thay vì tuyên bố thành công.',
    })}`,
  );
}
