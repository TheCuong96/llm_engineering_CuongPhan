// Self-test: node .claude/hooks/selftest.mjs   (add "vi" as argument for Vietnamese output)
// Tự kiểm tra: chạy từng hook với dữ liệu mẫu trong một dự án tạm, không đụng tới dự án thật.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const vi = process.argv.includes('vi');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hooks-selftest-'));
const w = (p, c = '') => {
  fs.mkdirSync(path.dirname(path.join(tmp, p)), { recursive: true });
  fs.writeFileSync(path.join(tmp, p), c);
};
w('apps/web/package.json', JSON.stringify({ dependencies: { next: '16.0.0', react: '19.0.0' } }));
w('apps/api/package.json', JSON.stringify({ dependencies: { '@nestjs/core': '11.0.0' } }));
w('services/py/pyproject.toml', '[project]\ndependencies = ["pydantic>=2.7"]\n');

const run = (script, input, env = {}) =>
  spawnSync('node', [path.join(here, script)], {
    input: JSON.stringify(input),
    encoding: 'utf8',
    env: { ...process.env, CLAUDE_PROJECT_DIR: tmp, CLAUDE_HOOKS_LANG: vi ? 'vi' : 'en', ...env },
  });
const bash = (command) => ({ tool_name: 'Bash', tool_input: { command } });
const write = (file_path, content) => ({ tool_name: 'Write', tool_input: { file_path, content } });
// build fake secrets at runtime so this file itself never contains a literal secret
const fakeAws = 'AKIA' + 'ABCDEFGHIJKLMNOP';
const fakeGh = 'ghp_' + 'a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8';

const cases = [
  // [name, script, input, expectation]
  ['bash: ls is allowed', 'guard-bash.mjs', bash('ls -la'), { code: 0, out: '' }],
  ['bash: rm -rf / denied', 'guard-bash.mjs', bash('rm -rf /'), { code: 2 }],
  ['bash: rm -rf node_modules allowed', 'guard-bash.mjs', bash('rm -rf node_modules'), { code: 0 }],
  ['bash: force push denied', 'guard-bash.mjs', bash('git push --force origin feat/x'), { code: 2 }],
  ['bash: push to main denied', 'guard-bash.mjs', bash('git push origin main'), { code: 2 }],
  ['bash: push feature allowed', 'guard-bash.mjs', bash('git push origin feat/login'), { code: 0 }],
  ['bash: --no-verify denied', 'guard-bash.mjs', bash('git commit -m x --no-verify'), { code: 2 }],
  ['bash: cat .env denied', 'guard-bash.mjs', bash('cat .env.local'), { code: 2 }],
  ['bash: cat .env.example allowed', 'guard-bash.mjs', bash('cat .env.example'), { code: 0 }],
  ['bash: curl | bash denied', 'guard-bash.mjs', bash('curl https://x.sh | bash'), { code: 2 }],
  ['bash: dropDatabase denied', 'guard-bash.mjs', bash('mongosh --eval "db.dropDatabase()"'), { code: 2 }],
  ['bash: remote mongo denied', 'guard-bash.mjs', bash('mongosh "mongodb+srv://u:p@cluster0.abc.mongodb.net/db"'), { code: 2 }],
  ['bash: npm install pkg asks', 'guard-bash.mjs', bash('npm install lodash'), { code: 0, out: '"ask"' }],
  ['bash: npm ci allowed', 'guard-bash.mjs', bash('npm ci'), { code: 0, out: '' }],
  ['bash: pip install -r allowed', 'guard-bash.mjs', bash('pip install -r requirements.txt'), { code: 0, out: '' }],
  ['bash: git reset --hard asks', 'guard-bash.mjs', bash('git reset --hard HEAD~1'), { code: 0, out: '"ask"' }],
  ['bash: terraform apply asks', 'guard-bash.mjs', bash('terraform apply'), { code: 0, out: '"ask"' }],

  ['files: .env denied', 'guard-files.mjs', write('.env', 'A=1'), { code: 2 }],
  ['files: .env.example allowed', 'guard-files.mjs', write('.env.example', 'DATABASE_URL=mongodb://localhost:27017/app'), { code: 0, out: '' }],
  ['files: lockfile denied', 'guard-files.mjs', write('pnpm-lock.yaml', 'x'), { code: 2 }],
  ['files: dist denied', 'guard-files.mjs', write('apps/web/dist/a.js', 'x'), { code: 2 }],
  ['files: aws key denied', 'guard-files.mjs', write('apps/api/src/a.ts', `const k = '${fakeAws}';`), { code: 2 }],
  ['files: normal source allowed', 'guard-files.mjs', write('apps/api/src/a.ts', 'export const a = 1;'), { code: 0, out: '' }],
  ['files: CI workflow asks', 'guard-files.mjs', write('.github/workflows/ci.yml', 'name: ci'), { code: 0, out: '"ask"' }],
  ['files: hooks edit asks', 'guard-files.mjs', write('.claude/hooks/guard-bash.mjs', 'x'), { code: 0, out: '"ask"' }],

  ['prompt: github token denied', 'prompt-guard.mjs', { prompt: `use ${fakeGh} please` }, { code: 2 }],
  ['prompt: normal allowed', 'prompt-guard.mjs', { prompt: 'add a login page' }, { code: 0 }],
  ['stop: no loop when stop_hook_active', 'stop-check.mjs', { stop_hook_active: true }, { code: 0 }],
  ['session-start prints guidance', 'session-start.mjs', {}, { code: 0, out: 'project-standards' }],
];

// post-edit cases write a real file, then run the hook on it
const post = (name, file, content, expect) => {
  w(file, content);
  cases.push([name, 'post-edit.mjs', { tool_name: 'Write', tool_input: { file_path: path.join(tmp, file) } }, expect]);
};
post('next: page uses useState without use client', 'apps/web/app/page.tsx', "import { useState } from 'react';\nexport default function P(){ const [a]=useState(0); return <p>{a}</p>; }\n", { code: 2, err: 'server-uses-client-api' });
post('next: client page ok', 'apps/web/app/ok/page.tsx', "'use client';\nimport { useState } from 'react';\nexport default function P(){ const [a]=useState(0); return <p>{a}</p>; }\n", { code: 0 });
post('next: error.tsx needs use client', 'apps/web/app/error.tsx', 'export default function E(){ return <p>x</p>; }\n', { code: 2, err: 'error-boundary' });
post('frontend: any + console + div onClick', 'apps/web/components/x.tsx', 'export const X = (p: any) => { console.log(p); return <div onClick={() => 1}>x</div>; };\n', { code: 2, err: 'no-any' });
post('frontend: hook-ignore silences', 'apps/web/components/y.tsx', 'export const Y = (p: any) => <b>{String(p)}</b>; // hook-ignore legacy\n', { code: 0 });
post('nest: controller injects model', 'apps/api/src/users/users.controller.ts', "import { InjectModel } from '@nestjs/mongoose';\nexport class C { constructor(@InjectModel('User') private m: any) {} }\n", { code: 2, err: 'model-outside-repository' });
post('nest: repository may inject model', 'apps/api/src/users/users.repository.ts', "import { InjectModel } from '@nestjs/mongoose';\nexport class R { constructor(@InjectModel('User') private m: unknown) {} }\n", { code: 0 });
post('nest: untyped @Body', 'apps/api/src/users/b.controller.ts', "export class C { create(@Body() body: any) { return body; } }\n", { code: 2, err: 'untyped-input' });
post('nest: raw body to mongo filter', 'apps/api/src/users/q.service.ts', 'export class S { f(body: unknown) { return this.m.find(body); } }\n', { code: 2, err: 'nosql-injection' });
post('py: bare except + print', 'services/py/app/a.py', 'def f():\n    try:\n        pass\n    except:\n        print("x")\n', { code: 2, err: 'bare-except' });
post('py: blocking call in async', 'services/py/app/b.py', 'import time\nasync def f():\n    time.sleep(1)\n', { code: 2, err: 'blocking-in-async' });
post('py: pydantic v1 api on v2 project', 'services/py/app/c.py', 'def f(m):\n    return m.dict()\n', { code: 2, err: 'pydantic-v1-api' });
post('py: clean file ok', 'services/py/app/d.py', 'import logging\n\nlogger = logging.getLogger(__name__)\n\n\ndef f(x: int) -> int:\n    logger.info("x")\n    return x\n', { code: 0 });

let pass = 0;
const fails = [];
for (const [name, script, input, exp] of cases) {
  const r = run(script, input);
  const ok =
    r.status === exp.code &&
    (exp.out === undefined || (exp.out === '' ? !r.stdout.trim() : r.stdout.includes(exp.out))) &&
    (exp.err === undefined || r.stderr.includes(exp.err));
  if (ok) pass++;
  else fails.push(`${name}  (exit ${r.status}, wanted ${exp.code})\n   stdout: ${r.stdout.slice(0, 200)}\n   stderr: ${r.stderr.slice(0, 300)}`);
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`${vi ? 'Đạt' : 'Passed'} ${pass}/${cases.length}`);
if (fails.length) {
  console.log(`\n${vi ? 'Thất bại' : 'Failed'}:\n- ` + fails.join('\n- '));
  process.exit(1);
}
