# Bộ Hook chuẩn dự án (Next.js + NestJS + Python + MongoDB)

Bộ hook này **cưỡng chế** các chuẩn mà 6 skill chỉ **hướng dẫn**. Skill là lời khuyên Claude có thể bỏ sót; hook là script chạy tự động nên luôn được thực thi.

| | Skill | Hook |
|---|---|---|
| Bản chất | Hướng dẫn bằng văn bản, Claude tự đọc | Script chạy tự động ở các thời điểm cố định |
| Có thể bị bỏ qua? | Có | Không (hook chặn bằng mã thoát 2) |
| Dùng để | Giải thích *vì sao* và *làm thế nào* | Chặn, kiểm tra, định dạng |

## Cấu trúc

```
.claude/
  settings.json            # đăng ký hook (bật ngôn ngữ ở "env")
  hooks/
    config.json            # tuỳ chỉnh: nhánh bảo vệ, rule tắt, đường dẫn cho phép
    lib.mjs                # hàm dùng chung (đọc input, quét bí mật, nhận diện khu vực)
    session-start.mjs      # nạp nhắc nhở chuẩn dự án + cảnh báo nhánh
    prompt-guard.mjs       # chặn prompt chứa khoá/token
    guard-bash.mjs         # chặn/hỏi trước với lệnh Bash nguy hiểm
    guard-files.mjs        # bảo vệ file nhạy cảm, quét bí mật khi ghi file
    post-edit.mjs          # sau khi sửa: format -> lint -> đối chiếu chuẩn
    stop-check.mjs         # cổng Definition of Done khi Claude kết thúc
    areas/                 # kiểm tra riêng: common, frontend, nextjs, backend, nestjs, python
    selftest.mjs           # tự kiểm tra bộ hook
```

Yêu cầu duy nhất là **Node.js** (đã có sẵn vì dự án dùng Next.js/NestJS). Không cần cài thêm thư viện.

## Cài đặt

1. Chép thư mục `.claude/` vào **thư mục gốc** dự án.
   - Nếu dự án **đã có** `.claude/settings.json`, đừng ghi đè: hãy gộp khối `"hooks"` và `"env"` vào file hiện có.
2. Chạy thử: `node .claude/hooks/selftest.mjs` (thêm `vi` để xem kết quả tiếng Việt). Kết quả đúng là `Đạt 42/42`.
3. Mở lại Claude Code trong dự án (hook được nạp lúc khởi động phiên). Gõ `/hooks` để xem danh sách hook đã đăng ký.
4. Commit `.claude/` lên git để cả team dùng chung.

**Đổi ngôn ngữ thông báo:** trong `.claude/settings.json` sửa `"CLAUDE_HOOKS_LANG": "en"` thành `"vi"`. Thông báo của hook sẽ hiện bằng tiếng Việt. Claude đọc được cả hai, nhưng khi trả lời bạn vẫn dùng ngôn ngữ bạn đang viết.

## Từng hook làm gì

### 1. `SessionStart` - session-start.mjs
Đầu mỗi phiên (mở mới, resume, `/clear`, nén ngữ cảnh) nạp nhắc nhở: dùng skill nào cho khu vực nào, hook sẽ cưỡng chế gì, không được lách hook. In ra nhánh git hiện tại và cảnh báo nếu đang ở nhánh được bảo vệ.

### 2. `UserPromptSubmit` - prompt-guard.mjs
Chặn prompt của bạn nếu có vẻ chứa khoá/token (AWS, GitHub, Anthropic, OpenAI, Slack, Google, Stripe, JWT, private key, URI MongoDB kèm mật khẩu). Prompt bị xoá khỏi hội thoại để bí mật không đi vào ngữ cảnh.

### 3. `PreToolUse` cho Bash - guard-bash.mjs
Có hai mức: **CHẶN** (không cho chạy) và **HỎI** (hiện hộp xác nhận cho bạn).

| Mức | Rule id | Nội dung |
|---|---|---|
| Chặn | `rm-wide` | `rm -rf` lên `/`, `~`, `.`, `*`, gốc dự án, `.git` |
| Chặn | `force-push` | `git push --force` / `-f` |
| Chặn | `push-protected` | push trực tiếp lên main/master/develop/production (kể cả `git push` trần khi đang ở các nhánh đó) |
| Chặn | `no-verify` | `--no-verify` với commit/push/merge/rebase |
| Chặn | `db-destructive` | `dropDatabase`, `deleteMany({})`, `DROP`, `TRUNCATE`, `mongorestore --drop` |
| Chặn | `remote-mongo` | lệnh trỏ tới MongoDB cloud/từ xa (agent chỉ được dùng DB local) |
| Chặn | `curl-pipe-shell` | `curl ... \| bash` |
| Chặn | `sudo-chmod` | `sudo`, `chmod 777` |
| Chặn | `print-secrets` | `cat .env`, `printenv`, `env` (cho phép `.env.example`) |
| Hỏi | `add-dependency` | `npm i <gói>`, `pnpm add`, `yarn add`, `pip install <gói>`, `uv add`, `poetry add` (cho phép `npm ci`, `pip install -r`) |
| Hỏi | `db-migrate-seed` | `migrate-mongo`, `mongosh`, `alembic`, script `migrate`/`seed` |
| Hỏi | `publish-deploy` | `npm publish`, `docker push`, `kubectl apply`, `terraform apply`, `vercel --prod`... |
| Hỏi | `git-destructive` | `git reset --hard`, `git clean -f`, `git checkout .`, `branch -D`, `--force-with-lease`... |

### 4. `PreToolUse` cho Edit/Write - guard-files.mjs
| Mức | Rule id | Nội dung |
|---|---|---|
| Chặn | `env-file` | sửa `.env*` thật (cho phép `.env.example`) |
| Chặn | `key-file` | file `.pem`, `.key`, `id_rsa`, `.aws/credentials`... |
| Chặn | `build-output` | `node_modules`, `.git`, `.next`, `dist`, `coverage`, `__pycache__`, `.venv`... |
| Chặn | `lockfile` | `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `uv.lock`, `poetry.lock`... |
| Chặn | `generated-file` | thư mục `generated/`, `*.generated.*`, file có dòng `@generated`/`DO NOT EDIT` |
| Chặn | `secrets` | nội dung sắp ghi có vẻ chứa bí mật |
| Hỏi | `guardrail-edit` | sửa `.claude/settings.json` hoặc `.claude/hooks/` |
| Hỏi | `ci-infra` | `.github/workflows`, Dockerfile, docker-compose, terraform, k8s, helm |
| Hỏi | `existing-migration` | sửa migration đã có |
| Hỏi | `dependency-manifest` | sửa `package.json`/`pyproject.toml`/`requirements` theo hướng thêm/đổi thư viện |

### 5. `PostToolUse` - post-edit.mjs
Sau mỗi lần Claude sửa file `.ts/.tsx/.js/.py`:
1. **Định dạng**: Prettier (JS/TS) hoặc `ruff format` (Python), *chỉ khi dự án đã cấu hình công cụ đó*.
2. **Lint**: `eslint --fix` hoặc `ruff check --fix`, cũng chỉ khi đã cấu hình.
3. **Đối chiếu chuẩn**: tự nhận diện khu vực của file qua `package.json` gần nhất (có `next` -> Next.js + front-end; có `@nestjs/core` -> NestJS + back-end; file `.py` -> Python + back-end) rồi chạy bộ kiểm tra tương ứng ở bảng dưới.

Nếu có lỗi, hook trả mã 2 kèm danh sách `L<dòng>: [rule-id] mô tả (skill §mục)` để Claude tự sửa ngay.

| Khu vực | Rule id tiêu biểu |
|---|---|
| Chung JS/TS | `lint-disable-reason`, `ts-ignore`, `debugger` |
| Front-end | `no-any`, `no-console`, `xss`, `token-storage`, `a11y-click`, `a11y-alt`, `list-key`, `noopener` |
| Next.js | `server-uses-client-api`, `error-boundary`, `client-imports-server`, `public-secret`, `next-image`, `next-link`, `app-router`, `pages-api`, `typed-env` |
| Back-end | `nosql-injection`, `mongo-where`, `weak-random`, `weak-hash`, `empty-catch`, `no-eval`, `cors-open`, `hardcoded-uri` |
| NestJS | `model-outside-repository`, `fat-controller`, `http-in-service`, `untyped-input`, `use-logger`, `circular-dep`, `use-config`, `dto-decorator`, `schema-timestamps`, `schema-password` |
| Python | `no-print`, `bare-except`, `swallowed-exception`, `mutable-default`, `no-eval`, `shell-true`, `unsafe-deserialize`, `naive-datetime`, `requests-timeout`, `wildcard-import`, `blocking-in-async`, `use-settings`, `pydantic-v1-api` |

### 6. `Stop` - stop-check.mjs
Khi Claude định kết thúc, hook kiểm tra các file đã thay đổi (theo `git status`):
- có bí mật hoặc file `.env` chưa được git-ignore không;
- `tsc --noEmit` cho từng package TypeScript bị đụng tới;
- `ruff check` cho các file Python bị đụng tới.

Nếu lỗi, Claude **không được kết thúc** và phải sửa tiếp. Hook chỉ chặn **một lần** mỗi lượt (có cơ chế chống vòng lặp), và nếu bạn không muốn kiểm tra thì đặt `CLAUDE_HOOKS_SKIP_STOP=1`.

## Tuỳ chỉnh (`.claude/hooks/config.json`)

```json
{
  "protectedBranches": ["main", "master", "develop", "production"],
  "extraProtectedPaths": ["^apps/api/src/legacy/"],
  "allowPaths": ["^docs/"],
  "disabledRules": ["no-console"],
  "postEdit": { "format": true, "lint": true, "areaChecks": true, "timeoutSec": 90 },
  "stop": { "typecheck": true, "ruff": true, "secrets": true, "timeoutSec": 150 }
}
```

- `extraProtectedPaths` / `allowPaths`: chuỗi regex so với đường dẫn tương đối của file.
- `disabledRules`: tắt một rule theo id (id nằm trong dấu `[...]` của thông báo).
- Thêm tính năng mới? Thêm một rule vào file tương ứng trong `areas/` rồi thêm ca thử vào `selftest.mjs`.

## Khi hook báo nhầm

Các kiểm tra theo khu vực dựa trên biểu thức chính quy nên **có thể báo nhầm**. Có ba cách xử lý, theo thứ tự nên thử:
1. Sửa code cho đúng chuẩn (thường là cách tốt nhất).
2. Thêm `// hook-ignore lý do` (hoặc `# hook-ignore lý do` trong Python) ngay trên dòng đó, hoặc `hook-ignore-next-line` ở dòng trước.
3. Tắt hẳn rule trong `disabledRules` nếu nó không phù hợp với dự án của bạn.

## Xử lý sự cố

| Triệu chứng | Cách xử lý |
|---|---|
| Hook không chạy | Mở lại phiên Claude Code; gõ `/hooks` kiểm tra; chạy `claude --debug` để xem log |
| `node: command not found` | Đảm bảo `node` có trong PATH của shell mà Claude Code dùng |
| Windows | Chạy Claude Code trong Git Bash/WSL để biến `$CLAUDE_PROJECT_DIR` được mở rộng đúng |
| Prettier/ESLint/ruff không chạy | Hook chỉ chạy khi dự án có cấu hình và đã cài công cụ đó (`node_modules/.bin`, `ruff`/`uv`) |
| Stop chạy lâu | Tăng `stop.timeoutSec`, hoặc tắt `stop.typecheck` ở repo lớn |
| Cần chạy lệnh bị chặn | Tự chạy ở terminal của bạn, hoặc tạm tắt rule bằng `disabledRules` |

## Lưu ý quan trọng

- **Hook chạy mã bằng quyền của bạn.** Hãy đọc kỹ script trước khi dùng, và để cả team review khi sửa `.claude/hooks/` (hook `guardrail-edit` sẽ hỏi bạn mỗi khi Claude định sửa chúng).
- **Hook là lưới an toàn, không thay thế được CI.** Vẫn cần lint, type-check và test trong pipeline CI, vì hook chỉ chạy cục bộ và có thể bị tắt.
- **Quy tắc theo regex là heuristic**: ưu tiên ít báo nhầm hơn là bắt hết mọi lỗi. Không rule nào thay được code review.
- Định dạng cấu hình hook của Claude Code có thể thay đổi theo phiên bản. Nếu hook không được nhận, đối chiếu với tài liệu chính thức về hooks của Claude Code.
- Bộ hook này đi cùng 6 skill (`project-standards`, `frontend-standards`, `backend-standards`, `nextjs-standards`, `nestjs-standards`, `python-standards`). Ghi chú `(skill §mục)` trong thông báo chỉ tới đúng mục để đọc thêm.
