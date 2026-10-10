# SETUP — Install the docs kit and the agent workflow

## 1. Copy the kit into your repo

```bash
# from the repo root
mkdir -p docs/{product,technical,design,plan,security,ai/decisions,runbooks} prompts
cp -r <path-to>/project-docs/docs/* docs/
cp <path-to>/project-docs/prompts/* prompts/
cp <path-to>/project-docs/CLAUDE.md ./CLAUDE.md   # only if you don't have one yet
# move the ai/* files you already wrote into docs/ai/
git checkout -b chore/docs-kit
git add docs prompts CLAUDE.md && git commit -m "docs: add planning kit (PRD, TRD, flows, schema, plan, security)"
```

## 2. Install agent skills (Claude Code)

```bash
npx skills add vercel-labs/agent-skills
```

- Run it in the repo root, review what it installs (`git diff`) and commit only the skills you will use.
- Treat third-party skills like dependencies: read their `SKILL.md`, check they don't run scripts you haven't reviewed.
- Useful skills for this project: Next.js/React best practices, frontend design, Supabase/Postgres, security review.

## 3. Pre-flight checks (Day 0)

Use the package manager the lockfile shows (`pnpm-lock.yaml` → pnpm, `package-lock.json` → npm, `yarn.lock` → yarn).

```bash
git status && git branch --show-current && git log --oneline -5
node -v && <pm> -v
<pm> install
<pm> run lint
<pm> run typecheck   # or: <pm> exec tsc --noEmit
<pm> test
<pm> run build
supabase --version && supabase status   # only if supabase/ exists
```

Record every result (PASS / FAIL + reason / NOT RUN) in `docs/ai/WORKSPACE_STATE.md`.

## 4. Environment files

```text
.env.example        # committed — names + descriptions only
.env.local          # NOT committed — local/test keys only
```

Confirm `.gitignore` contains `.env*` with `!.env.example`.
Never put live Stripe/Dojo keys or the Supabase secret key in local files.

## 5. Working loop with Claude Code

1. Paste `prompts/00_BOOTSTRAP_PROMPT.md` once (Day 0).
2. Each later session: "Read CLAUDE.md and docs/ai/CURRENT_TASK.md, then do only that task."
3. To (re)generate a single document, use its prompt in `prompts/DOC_PROMPTS.md`.
4. At the end: update CURRENT_TASK, WORKSPACE_STATE, SESSION_LOG; stop. Don't auto-start the next task.
