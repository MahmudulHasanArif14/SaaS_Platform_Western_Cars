Create or update `docs/runbooks/DEPLOYMENT.md`.

Inspect the actual repository, CI workflows, package scripts, hosting provider, environment setup, database migrations, and existing deployment procedures.

Document a safe deployment runbook covering:

1. Supported environments and their purpose.
2. Prerequisites, access requirements, and approvals.
3. Branch and pull-request workflow.
4. Local validation, tests, type checking, linting, build, and security checks.
5. Environment-variable configuration without including secret values.
6. Database migration review, backup requirements, compatibility, and execution.
7. Preview deployments and staging validation.
8. Production deployment and authorization.
9. Post-deployment health checks, smoke tests, logs, and monitoring.
10. Deployment failure handling, rollback, and recovery.
11. Database rollback limitations and forward-fix strategy.
12. External integration verification and webhook health.
13. Communication, evidence, ownership, and release sign-off.

Use actual commands and provider-specific steps only when verified. Mark unknown provider settings and missing procedures explicitly.

Never run a production deployment or destructive migration while writing this document.

Reference INCIDENT_RESPONSE.md and DISASTER_RECOVERY.md. Include a release checklist that can be completed with evidence.
