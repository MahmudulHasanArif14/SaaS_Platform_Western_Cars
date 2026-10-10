Create or update `docs/design/UI_UX_SPEC.md`.

Use MASTER_SPEC.md, ARCHITECTURE.md, DATA_MODEL.md, SECURITY_BASELINE.md, and DESIGN_SYSTEM.md as references.

Define the user experience for the company operations platform.

Cover:

- Sign-in, registration where supported, account recovery, and onboarding.
- Organization selection, workspace switching, and role-dependent navigation.
- Overview dashboard, notifications, search, and user settings.
- CRM and customer detail workflows.
- Employee directory, teams, assignments, and manager views.
- Tasks, projects, task details, checklists, comments, and approvals.
- Support tickets, customer communication, internal-only notes, escalation, and SLAs.
- Chatrooms, direct messages, attachments, and call interfaces.
- Domain inventory, DNS change review, verification, renewal, and risk warnings.
- Hosting projects, environments, deployment logs, deployment approval, and rollback.
- Payment-link creation, payment status, refunds, and reconciliation views.
- Restricted HR/salary views.
- Integration settings, access management, audit history, and system health.

For each workflow define the user goal, actor, prerequisites, navigation, steps, success criteria, validation, failure handling, permissions, and audit implications.

Specify responsive layouts, keyboard behavior, accessibility, loading states, empty states, errors, permission-denied states, confirmations, and recovery paths.

Use consistent language and component patterns from DESIGN_SYSTEM.md. Do not expose sensitive information or imply a user can perform an action they are not authorized to perform.

Treat the future AI website builder as a separate later-phase experience and reference AI_WEBSITE_BUILDER_SPEC.md.

Clearly distinguish existing UX from proposed UX. Do not implement screens.
