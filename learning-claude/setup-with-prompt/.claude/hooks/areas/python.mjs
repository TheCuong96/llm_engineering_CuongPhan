// Python checks mirroring skill python-standards. / Kiểm tra Python, phản chiếu skill python-standards.
import fs from 'node:fs';
import path from 'node:path';
import { hits, t, findUp } from '../lib.mjs';

function pydanticV2(file) {
  const p = findUp(path.dirname(file), ['pyproject.toml', 'requirements.txt']);
  try {
    return p ? /pydantic[^\n]*(>=|~=|==|\^)\s*2/.test(fs.readFileSync(p, 'utf8')) : false;
  } catch {
    return false;
  }
}

/** Lines that are inside an `async def` body (indentation based). */
function asyncLines(lines) {
  const inside = new Set();
  let indent = -1;
  lines.forEach((line, i) => {
    if (!line.trim()) return;
    const cur = line.match(/^\s*/)[0].length;
    if (indent >= 0 && cur <= indent) indent = -1;
    if (indent < 0 && /^\s*async\s+def\b/.test(line)) indent = cur;
    else if (indent >= 0) inside.add(i);
  });
  return inside;
}

export default function check(ctx) {
  if (ctx.lang !== 'py') return [];
  const out = [];
  const isScript = /(^|\/)(scripts?|migrations?|cli)(\/|\.py$)|(^|\/)(manage|__main__)\.py$/.test(ctx.rel);

  if (!isScript)
    out.push(
      ...hits(ctx, /^\s*print\(/, {
        en: '[no-print] Use the logging module (structured logger), not print (python-standards §2).',
        vi: '[no-print] Dùng module logging (logger có cấu trúc), không dùng print (python-standards §2).',
      }, { skipTests: true }),
    );

  out.push(
    ...hits(ctx, /^\s*except\s*:/, {
      en: '[bare-except] Bare `except:` hides bugs (even KeyboardInterrupt). Catch specific exceptions (python-standards §2).',
      vi: '[bare-except] `except:` trần che giấu lỗi (kể cả KeyboardInterrupt). Hãy bắt exception cụ thể (python-standards §2).',
    }),
    ...hits(ctx, /^\s*def\s+\w+\(.*=\s*(\[\]|\{\}|set\(\))/, {
      en: '[mutable-default] Mutable default argument is shared between calls. Use None and create inside (python-standards §2).',
      vi: '[mutable-default] Tham số mặc định là đối tượng thay đổi được sẽ bị dùng chung giữa các lần gọi. Dùng None rồi tạo bên trong (python-standards §2).',
    }),
    ...hits(ctx, /(^|[^.\w])(eval|exec)\(/, {
      en: '[no-eval] eval/exec are forbidden (python-standards §10).',
      vi: '[no-eval] Cấm eval/exec (python-standards §10).',
    }),
    ...hits(ctx, /shell\s*=\s*True/, {
      en: '[shell-true] shell=True enables command injection. Pass an argument list (python-standards §10).',
      vi: '[shell-true] shell=True mở đường cho command injection. Hãy truyền danh sách tham số (python-standards §10).',
    }),
    ...hits(ctx, /\bpickle\.loads?\(|\byaml\.load\(/, {
      en: '[unsafe-deserialize] pickle / yaml.load on untrusted data is unsafe. Use JSON or yaml.safe_load (python-standards §10).',
      vi: '[unsafe-deserialize] pickle / yaml.load với dữ liệu không tin cậy là không an toàn. Dùng JSON hoặc yaml.safe_load (python-standards §10).',
    }, { unless: /Safe/ }),
    ...hits(ctx, /\bdatetime\.(utcnow|utcfromtimestamp)\(|\bdatetime\.now\(\s*\)/, {
      en: '[naive-datetime] Naive datetimes cause timezone bugs against NestJS data. Use datetime.now(UTC) (python-standards §6).',
      vi: '[naive-datetime] datetime không múi giờ gây lỗi lệch giờ với dữ liệu NestJS. Dùng datetime.now(UTC) (python-standards §6).',
    }),
    ...hits(ctx, /\brequests\.(get|post|put|delete|patch|head)\(/, {
      en: '[requests-timeout] Outbound call without a timeout can hang forever. Pass timeout=... (python-standards §5).',
      vi: '[requests-timeout] Gọi ra ngoài không có timeout có thể treo vô hạn. Hãy truyền timeout=... (python-standards §5).',
    }, { unless: /timeout\s*=/ }),
    ...hits(ctx, /^\s*from\s+[\w.]+\s+import\s+\*/, {
      en: '[wildcard-import] Avoid wildcard imports; import names explicitly (python-standards §2).',
      vi: '[wildcard-import] Tránh import dấu *; hãy import tường minh (python-standards §2).',
    }, { skipTests: true }),
  );

  // swallowed exception: `except ...:` immediately followed by `pass`
  ctx.lines.forEach((line, i) => {
    if (/^\s*except\b.*:\s*$/.test(line) && /^\s*(pass|\.\.\.)\s*$/.test(ctx.lines[i + 1] || '') && !line.includes('hook-ignore'))
      out.push({
        line: i + 1,
        msg: t({
          en: '[swallowed-exception] `except ...: pass` silently swallows errors. Handle, log, or re-raise (backend-standards §5).',
          vi: '[swallowed-exception] `except ...: pass` im lặng nuốt lỗi. Hãy xử lý, ghi log, hoặc raise lại (backend-standards §5).',
        }),
      });
  });

  // blocking calls inside async def
  const inAsync = asyncLines(ctx.lines);
  ctx.lines.forEach((line, i) => {
    if (inAsync.has(i) && /\btime\.sleep\(|\brequests\.\w+\(|\bopen\(/.test(line) && !/aiofiles|to_thread|hook-ignore/.test(line))
      out.push({
        line: i + 1,
        msg: t({
          en: '[blocking-in-async] Blocking call inside async def freezes the event loop. Use the async equivalent or asyncio.to_thread (python-standards §5).',
          vi: '[blocking-in-async] Gọi blocking trong async def sẽ làm đứng event loop. Dùng bản async tương ứng hoặc asyncio.to_thread (python-standards §5).',
        }),
      });
  });

  if (!ctx.isTest && !isScript && !/(config|settings|conftest)/.test(ctx.rel))
    out.push(
      ...hits(ctx, /\bos\.(environ|getenv)\b/, {
        en: '[use-settings] Do not read os.environ in feature code. Use the pydantic-settings object (python-standards §3).',
        vi: '[use-settings] Không đọc os.environ trong code tính năng. Dùng đối tượng pydantic-settings (python-standards §3).',
      }),
    );

  if (pydanticV2(ctx.file))
    out.push(
      ...hits(ctx, /\.(dict|json|parse_obj|from_orm)\(|@validator\(|^\s*class\s+Config\s*:/, {
        en: '[pydantic-v1-api] Pydantic v1 API on a v2 project. Use model_dump / model_validate / field_validator / ConfigDict (python-standards §4).',
        vi: '[pydantic-v1-api] Dùng API Pydantic v1 trong dự án v2. Dùng model_dump / model_validate / field_validator / ConfigDict (python-standards §4).',
      }, { unless: /\b(json\.dumps|response\.json|resp\.json|r\.json|res\.json)\b|\bawait\b.*\.json\(/ }),
    );
  return out;
}
