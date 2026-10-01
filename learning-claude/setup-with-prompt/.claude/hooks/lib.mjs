// Shared helpers for all hooks. / Hàm dùng chung cho mọi hook.
// Zero dependencies: only Node.js built-ins. / Không phụ thuộc thư viện ngoài, chỉ dùng Node.js có sẵn.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

// ---------- language / ngôn ngữ ----------
// Set CLAUDE_HOOKS_LANG=vi in .claude/settings.json ("env") to get Vietnamese messages.
export const LANG = /^vi/i.test(process.env.CLAUDE_HOOKS_LANG || '') ? 'vi' : 'en';
export const t = (m) => (typeof m === 'string' ? m : m[LANG] || m.en);

export const PROJECT_DIR = path.resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd());

// ---------- input / output ----------
export function readInput() {
  try {
    const raw = fs.readFileSync(0, 'utf8');
    return raw.trim() ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Exit code 2 + stderr: Claude Code feeds stderr back to Claude (or the user for prompts). */
export function block(msg) {
  process.stderr.write(String(msg).trimEnd() + '\n');
  process.exit(2);
}

/** PreToolUse: let the user decide (Claude Code shows a permission prompt). */
export function ask(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason: String(reason),
      },
    }),
  );
  process.exit(0);
}

// ---------- config / cấu hình ----------
const DEFAULTS = {
  protectedBranches: ['main', 'master', 'develop', 'production'],
  extraProtectedPaths: [], // regex strings, matched against project-relative posix paths
  allowPaths: [], // regex strings that are never blocked/asked
  disabledRules: [], // rule ids to turn off (see ids in messages: [rule-id])
  postEdit: { format: true, lint: true, areaChecks: true, timeoutSec: 90 },
  stop: { typecheck: true, ruff: true, secrets: true, timeoutSec: 150 },
};
let _cfg;
export function config() {
  if (_cfg) return _cfg;
  let user = {};
  try {
    user = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, '.claude/hooks/config.json'), 'utf8'));
  } catch {
    /* no user config */
  }
  _cfg = {
    ...DEFAULTS,
    ...user,
    postEdit: { ...DEFAULTS.postEdit, ...(user.postEdit || {}) },
    stop: { ...DEFAULTS.stop, ...(user.stop || {}) },
  };
  return _cfg;
}
export const disabled = (id) => config().disabledRules.includes(id);

// ---------- paths ----------
export const toPosix = (p) => p.split(path.sep).join('/').replace(/\\/g, '/');
export const absPath = (p) => (path.isAbsolute(p) ? p : path.resolve(PROJECT_DIR, p));
export const relPath = (abs) => toPosix(path.relative(PROJECT_DIR, abs));

export function findUp(startDir, names, stop = PROJECT_DIR) {
  let dir = startDir;
  for (;;) {
    for (const n of names) {
      const p = path.join(dir, n);
      if (fs.existsSync(p)) return p;
    }
    if (dir === stop || path.dirname(dir) === dir) return null;
    dir = path.dirname(dir);
  }
}

export function findBin(name, startDir) {
  const exe = process.platform === 'win32' ? `${name}.cmd` : name;
  const p = findUp(startDir, [path.join('node_modules', '.bin', exe)], path.parse(startDir).root);
  return p;
}

const pkgCache = new Map();
export function nearestPackage(file) {
  const p = findUp(path.dirname(file), ['package.json']);
  if (!p) return null;
  if (!pkgCache.has(p)) {
    let json = {};
    try {
      json = JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch {
      /* ignore */
    }
    pkgCache.set(p, { dir: path.dirname(p), json });
  }
  return pkgCache.get(p);
}

/** Detect which standards apply to a file by looking at its nearest package.json / extension. */
export function detectAreas(file) {
  const areas = new Set();
  const ext = path.extname(file).toLowerCase();
  if (ext === '.py') return new Set(['python', 'backend']);
  if (!/^\.(ts|tsx|js|jsx|mjs|cjs)$/.test(ext)) return areas;
  const pkg = nearestPackage(file);
  if (!pkg) return areas;
  const j = pkg.json;
  const deps = { ...j.dependencies, ...j.devDependencies, ...j.peerDependencies };
  if (deps.next) {
    areas.add('nextjs');
    areas.add('frontend');
  } else if (deps.react) {
    areas.add('frontend');
  }
  if (deps['@nestjs/core'] || deps['@nestjs/common']) {
    areas.add('nestjs');
    areas.add('backend');
  } else if (deps.express || deps.fastify || deps.koa || deps.hono) {
    areas.add('backend');
  }
  return areas;
}

export const isTestFile = (rel) =>
  /\.(spec|test)\.[cm]?[tj]sx?$/.test(rel) ||
  /(^|\/)(tests?|__tests__|e2e|__mocks__|fixtures?)\//.test(rel) ||
  /(^|\/)(test_[^/]*|[^/]*_test|conftest)\.py$/.test(rel);

// ---------- processes ----------
export function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, {
    cwd: opts.cwd || PROJECT_DIR,
    encoding: 'utf8',
    timeout: opts.timeout || 60000,
    maxBuffer: 20 * 1024 * 1024,
    shell: process.platform === 'win32',
    env: process.env,
  });
}
export function git(args) {
  const r = run('git', args, { timeout: 10000 });
  return r.status === 0 ? (r.stdout || '').trim() : '';
}
/** Current branch name; works even before the first commit. */
export const currentBranch = () => git(['branch', '--show-current']) || git(['rev-parse', '--abbrev-ref', 'HEAD']);
/** Run ruff via PATH, then `uv run`. Returns null when ruff is not available. */
export function ruff(args, cwd, timeout = 60000) {
  let r = run('ruff', args, { cwd, timeout });
  if (!r.error && r.status !== null && r.status !== 127) return r;
  r = run('uv', ['run', '--quiet', 'ruff', ...args], { cwd, timeout });
  if (!r.error && r.status !== null && !/Failed to spawn|No such file|not found/i.test(r.stderr || '')) return r;
  return null;
}
export const hasPyRuffConfig = (dir) =>
  Boolean(findUp(dir, ['ruff.toml', '.ruff.toml'])) ||
  (() => {
    const p = findUp(dir, ['pyproject.toml']);
    try {
      return p ? /\[tool\.ruff/.test(fs.readFileSync(p, 'utf8')) : false;
    } catch {
      return false;
    }
  })();

// ---------- secrets / bí mật ----------
const SECRET_PATTERNS = [
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/],
  ['private key', /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/],
  ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{36,}\b/],
  ['GitHub fine-grained token', /\bgithub_pat_[A-Za-z0-9_]{50,}\b/],
  ['Anthropic API key', /\bsk-ant-[A-Za-z0-9_-]{20,}\b/],
  ['OpenAI-style API key', /\bsk-(?:proj-)?[A-Za-z0-9_-]{40,}\b/],
  ['Slack token', /\bxox[abprs]-[A-Za-z0-9-]{10,}\b/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['Stripe live key', /\b[sr]k_live_[0-9a-zA-Z]{20,}\b/],
  ['JWT', /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/],
];
const PLACEHOLDER = /(example|changeme|placeholder|your[_-]|xxxx|dummy|sample|<[^>]+>|\$\{|\{\{|process\.env|os\.environ)/i;
const LOCAL_HOSTS = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]|host\.docker\.internal)$/i;

/** Returns [{line, name}] for suspicious secrets in text. relaxed=true for tests/fixtures. */
export function findSecrets(text, { relaxed = false } = {}) {
  const found = [];
  text.split('\n').forEach((line, i) => {
    if (/hook-ignore/.test(line)) return;
    for (const [name, re] of SECRET_PATTERNS) if (re.test(line)) found.push({ line: i + 1, name });
    const m = line.match(/mongodb(?:\+srv)?:\/\/([^:@/\s'"]+):([^@/\s'"]+)@([^/\s'"?,:]+)/i);
    if (m && !LOCAL_HOSTS.test(m[3]) && m[3].includes('.') && !PLACEHOLDER.test(m[2]) && !relaxed) {
      found.push({ line: i + 1, name: 'MongoDB URI with credentials' });
    }
    if (!relaxed) {
      const g = line.match(
        /(?:password|passwd|secret|api[_-]?key|access[_-]?token|auth[_-]?token)\s*[:=]\s*(['"])([A-Za-z0-9+/=_\-.]{16,})\1/i,
      );
      if (g && /[A-Za-z]/.test(g[2]) && /\d/.test(g[2]) && !PLACEHOLDER.test(g[2]) && !PLACEHOLDER.test(line)) {
        found.push({ line: i + 1, name: 'hard-coded credential' });
      }
    }
  });
  return found;
}

// ---------- line scanner used by area checks / bộ quét dòng cho các kiểm tra theo khu vực ----------
export function makeCtx(file, content) {
  const rel = relPath(file);
  const ext = path.extname(file).toLowerCase();
  return {
    file,
    rel,
    content,
    lines: content.split('\n'),
    lang: ext === '.py' ? 'py' : /^\.(ts|tsx|js|jsx|mjs|cjs)$/.test(ext) ? 'js' : 'other',
    isTest: isTestFile(rel),
    base: path.basename(file),
  };
}

const isComment = (line, lang) => {
  const s = line.trim();
  return lang === 'py' ? s.startsWith('#') : s.startsWith('//') || s.startsWith('*') || s.startsWith('/*');
};

/** Find lines matching `re`. Returns [{line, msg}]. Honors `hook-ignore` / `hook-ignore-next-line`. */
export function hits(ctx, re, msg, opts = {}) {
  const out = [];
  if (opts.skipTests && ctx.isTest) return out;
  ctx.lines.forEach((line, i) => {
    if (!opts.comments && isComment(line, ctx.lang)) return;
    if (line.includes('hook-ignore')) return;
    if (i > 0 && ctx.lines[i - 1].includes('hook-ignore-next-line')) return;
    if (re.test(line) && (!opts.unless || !opts.unless.test(line))) out.push({ line: i + 1, msg: t(msg) });
  });
  return out;
}
/** File-level finding (one entry for the whole file). */
export const fileHit = (cond, msg) => (cond ? [{ line: 1, msg: t(msg) }] : []);
