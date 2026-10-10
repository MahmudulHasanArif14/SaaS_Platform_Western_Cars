Create or update `docs/runbooks/DISASTER_RECOVERY.md`.

Document a disaster-recovery plan for the platform's database, application, file storage, background jobs, audit data, integration configuration, and hosted customer websites where applicable.

Include:

1. Systems, data, dependencies, and recovery priorities.
2. Business impact and recovery priority by service.
3. Recovery Point Objective (RPO) and Recovery Time Objective (RTO), marked PROPOSED until approved.
4. Backup frequency, retention, encryption, access controls, and ownership.
5. Supabase database and storage backup/restore requirements based on the actual provider capabilities.
6. Application redeployment and environment reconstruction.
7. Recovery of provider configuration without exposing secrets.
8. Handling queued jobs, webhook replay, duplicate prevention, and reconciliation after restoration.
9. DNS, domain, SSL, and hosting recovery.
10. Customer communication and service-status updates.
11. Validation after restoration, including tenant isolation, authentication, critical workflows, and data integrity.
12. Recovery testing schedule, evidence, and remediation tracking.
13. Backup failure alerts, retention expiry, and protection against destructive access.
14. Dependencies on external provider availability and contractual backup limits.

Never assume backups exist or are restorable unless verified. Do not store secrets in this runbook.

Define a staged recovery procedure and a checklist for tabletop exercises and restore drills. Identify decisions requiring business approval.

Reference DEPLOYMENT.md, INCIDENT_RESPONSE.md, ARCHITECTURE.md, and SECURITY_BASELINE.md.
