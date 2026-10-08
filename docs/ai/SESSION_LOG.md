# Session Log

This is the chronological record of meaningful AI-assisted development sessions.

The purpose is to preserve continuity between Claude Code, VS Code, Claude Web, and future development sessions without requiring the AI to reread the entire repository.

This file is historical.

Current project state belongs in:

```text
docs/ai/CURRENT_TASK.md
docs/ai/WORKSPACE_STATE.md
docs/ai/INTEGRATION_STATUS.md
docs/ai/KNOWN_ISSUES.md
docs/ai/PRODUCTION_READINESS.md
```

Do not use this file as a replacement for those documents.

---

# Session Rules

At the beginning of a session, Claude should NOT read the entire session history by default.

Instead:

1. Read `CLAUDE.md`.
2. Read `CURRENT_TASK.md`.
3. Read `WORKSPACE_STATE.md`.
4. Read relevant architecture/security documents.
5. Check the latest session-log entry only when continuity is required.

At the end of a meaningful session, Claude should append a concise session record.

Do not rewrite old session entries unless correcting an actual mistake.

---

# Session Entry Format

Each session should use:

```text
## SESSION-YYYY-MM-DD-N

Date:
AI/Environment:
Branch:
Commit:
Task:
Objective:

Completed:
-

Files Created:
-

Files Modified:
-

Files Deleted:
-

Database Changes:
-

Integration Changes:
-

Security Changes:
-

Tests:
-

Build:
-

Deployment:
-

Issues Discovered:
-

Issues Resolved:
-

Known Blockers:
-

Decisions:
-

Next Step:
-

Production Readiness:
-

Integration Status:
-

Notes:
-
```

Keep entries factual and concise.

---

# Session History

## SESSION-000

Date:
Project initialization

AI/Environment:
Initial setup

Branch:
N/A

Commit:
N/A

Task:
Initialize project documentation system.

Objective:
Create the AI project context and state-management structure.

Completed:

- Defined master product specification.
- Defined AI development workflow.
- Defined production-readiness tracking.
- Defined integration tracking.
- Defined known-issues tracking.
- Defined session history tracking.

Files Created:

```text
docs/ai/MASTER_SPEC.md
docs/ai/CLAUDE.md
docs/ai/CURRENT_TASK.md
docs/ai/WORKSPACE_STATE.md
docs/ai/INTEGRATION_STATUS.md
docs/ai/KNOWN_ISSUES.md
docs/ai/PRODUCTION_READINESS.md
docs/ai/SESSION_LOG.md
```

Database Changes:

None.

Integration Changes:

None.

Security Changes:

Documentation only.

Tests:

Not applicable.

Deployment:

Not deployed.

Known Blockers:

None known.

Next Step:

Begin project foundation according to `CURRENT_TASK.md`.

Production Readiness:

NOT READY

Integration Status:

NOT_CONNECTED

---

# Session Continuation Rules

## 1. Never Assume Previous Work Was Completed

If the session log says:

```text
Completed:
Implemented domain creation API
```

Claude must still verify the current repository before building on it.

The repository is the source of truth for implementation.

The session log is context, not proof.

---

## 2. Verify Before Continuing

Before modifying existing work:

```text
git status
git branch
git log
```

Then inspect the relevant files.

Do not assume the last AI session's description is accurate.

---

## 3. Record Actual Changes

At the end of a task, record:

```text
Files created
Files modified
Database migrations
Tests
Commands run
Build result
Deployment result
Known issues
Next task
```

Do not claim something was tested if it was not tested.

---

# AI Session Handoff

When ending a session before the current task is complete, Claude should update:

```text
CURRENT_TASK.md
WORKSPACE_STATE.md
SESSION_LOG.md
KNOWN_ISSUES.md
INTEGRATION_STATUS.md
PRODUCTION_READINESS.md
```

Only update the files relevant to the work performed.

---

# Incomplete Session

If a session stops unexpectedly, record:

```text
## SESSION-YYYY-MM-DD-N

Status:
INTERRUPTED

Current Task:
...

Last Completed Step:
...

Current Step:
...

What Was Being Investigated:
...

Files Being Modified:
...

Unverified Changes:
...

Potential Problems:
...

Exact Next Action:
...
```

The next Claude session must verify the repository before continuing.

---

# Context Compression Rule

Do not allow this file to become a huge duplicate of the entire project.

A session entry should normally contain only:

```text
What happened
What changed
What was verified
What failed
What remains
What should happen next
```

Do not copy entire code files into this document.

Do not copy large logs.

Do not copy entire error traces.

Store important error summaries and reference the relevant file/task instead.

---

# Decision Recording

If an important architectural decision is made during a session, record only the decision summary here.

The full decision should be stored in the appropriate architecture/ADR document.

Example:

```text
Decision:
Use provider adapters instead of calling Stripe/Dojo APIs directly from UI code.

Reason:
Maintainability and provider isolation.

Full decision:
docs/ai/decisions/ADR-001-provider-adapters.md
```

---

# Security Rule

Never store the following in session logs:

```text
API keys
passwords
access tokens
refresh tokens
private keys
database secrets
payment credentials
customer payment information
salary details
personal authentication information
```

If a secret appears in terminal output or an error message:

1. Do not copy it into this file.
2. Redact it from any documentation.
3. Determine whether it must be rotated.
4. Record only that a potential secret exposure occurred.

---

# Commands / Verification

Record important verification commands and results, for example:

```text
pnpm lint → PASS
pnpm typecheck → PASS
pnpm test → PASS
pnpm build → PASS
pnpm test:e2e → PASS
```

Do not record commands as PASS unless they actually succeeded.

If a command fails:

```text
pnpm build → FAIL
Reason: missing environment variable
```

---

# Deployment Recording

For deployment-related sessions:

```text
Deployment:
Environment:
Platform:
Commit:
Deployment ID:
Result:
Health Check:
Smoke Test:
Rollback Required:
```

Never store deployment secrets.

---

# Integration Recording

For integration-related sessions:

```text
Provider:
Environment:
Operation:
Result:
Verification:
Failure:
Next Action:
```

The authoritative integration state remains:

```text
docs/ai/INTEGRATION_STATUS.md
```

---

# Session Completion Checklist

Before ending a meaningful session, Claude should check:

- [ ] Current task updated
- [ ] Workspace state updated
- [ ] Relevant known issues updated
- [ ] Integration status updated if applicable
- [ ] Production readiness updated if applicable
- [ ] Tests recorded
- [ ] Build result recorded
- [ ] Deployment result recorded if applicable
- [ ] Important decisions recorded
- [ ] Next step written
- [ ] No secrets written to documentation
- [ ] Git status checked
- [ ] Uncommitted work clearly identified

---

# Final Session Entry Rule

Every completed task must end with:

```text
Task:
STATUS: COMPLETE

Verification:
...

Next Task:
...

Blocked By:
NONE
```

If incomplete:

```text
Task:
STATUS: INCOMPLETE

Completed:
...

Remaining:
...

Blocked By:
...

Exact Next Action:
...
```

Never use:

```text
STATUS: COMPLETE
```

when the implementation has not actually been verified.
