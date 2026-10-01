# Project Standards Hooks (Next.js + NestJS + Python + MongoDB)

These hooks **enforce** the standards that the 6 skills only **describe**. A skill is advice Claude may overlook; a hook is a script that always runs.

| | Skill | Hook |
|---|---|---|
| Nature | Written guidance Claude reads | Script run automatically at fixed moments |
| Can be skipped? | Yes | No (a hook blocks with exit code 2) |
| Purpose | Explain *why* and *how* | Block, check, format |

## Layout

```
.claude/
  settings.json            # registers the hooks (language toggle in "env")
  hooks/
    config.json            # tuning: protected branches, disabled rules, allowed paths
    lib.mjs                # shared helpers (input, secret scan, area detection)
    session-start.mjs      # injects project reminders + branch warning
    prompt-guard.mjs       # blocks prompts containing keys/tokens
    guard-bash.mjs         # deny/ask for dangerous Bash commands
    guard-files.mjs        # protects sensitive files, scans written content for secrets
    post-edit.mjs          # after an edit: format -> lint -> check against standards
    stop-check.mjs         # Definition of Done gate when Claude tries to finish
    areas/                 # per-area checks: common, frontend, nextjs, backend, nestjs, python
    selftest.mjs           # self-test for the hooks
```

The only requirement is **Node.js** (already present because the project uses Next.js/NestJS). No extra packages.

## Install

1. Copy the `.claude/` folder to the **project root**.
   - If the project **already has** `.claude/settings.json`, do not overwrite it: merge the `"hooks"` and `"env"` blocks into the existing file.
2. Run `node .claude/hooks/selftest.mjs` (add `vi` for Vietnamese output). Expected: `Passed 42/42`.
3. Restart Claude Code in the project (hooks load at session start). Type `/hooks` to list the registered hooks.
4. Commit `.claude/` so the whole team shares it.

**Message language:** in `.claude/settings.json` change `"CLAUDE_HOOKS_LANG": "en"` to `"vi"` for Vietnamese messages.

## What each hook does

### 1. `SessionStart` - session-start.mjs
At the start of a session (new, resume, `/clear`, compaction) it injects reminders: which skill to use for which area, what the hooks enforce, and not to work around them. It prints the current git branch and warns on a protected branch.

### 2. `UserPromptSubmit` - prompt-guard.mjs
Blocks your prompt if it looks like it contains a key/token (AWS, GitHub, Anthropic, OpenAI, Slack, Google, Stripe, JWT, private key, MongoDB URI with password). The prompt is erased so the secret never enters the context.

### 3. `PreToolUse` for Bash - guard-bash.mjs
Two levels: **DENY** (never runs) and **ASK** (you get a confirmation prompt).

| Level | Rule id | What |
|---|---|---|
| Deny | `rm-wide` | `rm -rf` on `/`, `~`, `.`, `*`, project root, `.git` |
| Deny | `force-push` | `git push --force` / `-f` |
| Deny | `push-protected` | direct push to main/master/develop/production (incl. bare `git push` while on them) |
| Deny | `no-verify` | `--no-verify` on commit/push/merge/rebase |
| Deny | `db-destructive` | `dropDatabase`, `deleteMany({})`, `DROP`, `TRUNCATE`, `mongorestore --drop` |
| Deny | `remote-mongo` | commands targeting cloud/remote MongoDB (agents may only use local DBs) |
| Deny | `curl-pipe-shell` | `curl ... \| bash` |
| Deny | `sudo-chmod` | `sudo`, `chmod 777` |
| Deny | `print-secrets` | `cat .env`, `printenv`, `env` (`.env.example` is allowed) |
| Ask | `add-dependency` | `npm i <pkg>`, `pnpm add`, `yarn add`, `pip install <pkg>`, `uv add`, `poetry add` (`npm ci`, `pip install -r` allowed) |
| Ask | `db-migrate-seed` | `migrate-mongo`, `mongosh`, `alembic`, `migrate`/`seed` scripts |
| Ask | `publish-deploy` | `npm publish`, `docker push`, `kubectl apply`, `terraform apply`, `vercel --prod`... |
| Ask | `git-destructive` | `git reset --hard`, `git clean -f`, `git checkout .`, `branch -D`, `--force-with-lease`... |

### 4. `PreToolUse` for Edit/Write - guard-files.mjs
| Level | Rule id | What |
|---|---|---|
| Deny | `env-file` | editing real `.env*` files (`.env.example` allowed) |
| Deny | `key-file` | `.pem`, `.key`, `id_rsa`, `.aws/credentials`... |
| Deny | `build-output` | `node_modules`, `.git`, `.next`, `dist`, `coverage`, `__pycache__`, `.venv`... |
| Deny | `lockfile` | `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `uv.lock`, `poetry.lock`... |
| Deny | `generated-file` | `generated/`, `*.generated.*`, files marked `@generated`/`DO NOT EDIT` |
| Deny | `secrets` | content about to be written looks like a secret |
| Ask | `guardrail-edit` | editing `.claude/settings.json` or `.claude/hooks/` |
| Ask | `ci-infra` | `.github/workflows`, Dockerfile, docker-compose, terraform, k8s, helm |
| Ask | `existing-migration` | editing an existing migration |
| Ask | `dependency-manifest` | editing `package.json`/`pyproject.toml`/`requirements` in a way that adds/changes dependencies |

### 5. `PostToolUse` - post-edit.mjs
After every edit to a `.ts/.tsx/.js/.py` file:
1. **Format**: Prettier (JS/TS) or `ruff format` (Python), *only if the project configures that tool*.
2. **Lint**: `eslint --fix` or `ruff check --fix`, also only if configured.
3. **Standards check**: the file's area is detected from the nearest `package.json` (`next` -> Next.js + frontend; `@nestjs/core` -> NestJS + backend; `.py` -> Python + backend) and the matching checks below run.

On failure the hook exits 2 with `L<line>: [rule-id] message (skill §section)` so Claude fixes it immediately.

| Area | Representative rule ids |
|---|---|
| Common JS/TS | `lint-disable-reason`, `ts-ignore`, `debugger` |
| Frontend | `no-any`, `no-console`, `xss`, `token-storage`, `a11y-click`, `a11y-alt`, `list-key`, `noopener` |
| Next.js | `server-uses-client-api`, `error-boundary`, `client-imports-server`, `public-secret`, `next-image`, `next-link`, `app-router`, `pages-api`, `typed-env` |
| Backend | `nosql-injection`, `mongo-where`, `weak-random`, `weak-hash`, `empty-catch`, `no-eval`, `cors-open`, `hardcoded-uri` |
| NestJS | `model-outside-repository`, `fat-controller`, `http-in-service`, `untyped-input`, `use-logger`, `circular-dep`, `use-config`, `dto-decorator`, `schema-timestamps`, `schema-password` |
| Python | `no-print`, `bare-except`, `swallowed-exception`, `mutable-default`, `no-eval`, `shell-true`, `unsafe-deserialize`, `naive-datetime`, `requests-timeout`, `wildcard-import`, `blocking-in-async`, `use-settings`, `pydantic-v1-api` |

### 6. `Stop` - stop-check.mjs
When Claude tries to finish, the hook inspects changed files (from `git status`):
- secrets, or `.env` files that are not git-ignored;
- `tsc --noEmit` for each touched TypeScript package;
- `ruff check` for touched Python files.

On failure Claude **cannot finish** and must keep fixing. The hook blocks only **once** per turn (loop guard); set `CLAUDE_HOOKS_SKIP_STOP=1` to skip it.

## Configuration (`.claude/hooks/config.json`)

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

- `extraProtectedPaths` / `allowPaths`: regex strings matched against the project-relative path.
- `disabledRules`: turn a rule off by id (the id is in `[...]` in the message).
- Adding a rule: add it to the matching file in `areas/` and add a case to `selftest.mjs`.

## False positives

Area checks are regex based and **can be wrong**. In order of preference:
1. Fix the code (usually the right answer).
2. Add `// hook-ignore reason` (`# hook-ignore reason` in Python) on that line, or `hook-ignore-next-line` on the line before.
3. Disable the rule in `disabledRules` if it does not fit your project.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Hooks do not run | Restart the Claude Code session; check `/hooks`; run `claude --debug` for logs |
| `node: command not found` | Make sure `node` is on the PATH of the shell Claude Code uses |
| Windows | Run Claude Code in Git Bash/WSL so `$CLAUDE_PROJECT_DIR` expands correctly |
| Prettier/ESLint/ruff not running | Hooks run them only if the project has the config and the tool installed (`node_modules/.bin`, `ruff`/`uv`) |
| Stop hook is slow | Raise `stop.timeoutSec` or disable `stop.typecheck` on large repos |
| A blocked command is really needed | Run it yourself in a terminal, or disable that rule in `disabledRules` |

## Important notes

- **Hooks execute code with your permissions.** Read the scripts before adopting them and review changes to `.claude/hooks/` as a team (the `guardrail-edit` rule asks you whenever Claude tries to edit them).
- **Hooks are a safety net, not a replacement for CI.** Keep lint, type-check and tests in CI; hooks run locally and can be disabled.
- **Regex rules are heuristics**, tuned for few false alarms over catching everything. No rule replaces code review.
- The Claude Code hook configuration format may change between versions. If hooks are not picked up, check the official Claude Code hooks documentation.
- This kit pairs with the 6 skills (`project-standards`, `frontend-standards`, `backend-standards`, `nextjs-standards`, `nestjs-standards`, `python-standards`). The `(skill §section)` hint in messages points to the section to read.
