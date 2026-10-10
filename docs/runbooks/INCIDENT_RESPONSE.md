Create or update `docs/runbooks/INCIDENT_RESPONSE.md`.

Write an actionable incident-response procedure suitable for a multi-tenant company operations and hosting platform.

Include:

1. Incident declaration, severity levels, incident commander, and communication roles.
2. Detection and triage through monitoring, customer reports, audit logs, and provider alerts.
3. Evidence preservation and a timeline of events.
4. Containment strategies for compromised accounts, exposed tokens, suspicious deployments, payment anomalies, and unauthorized DNS changes.
5. Handling tenant data exposure, privilege escalation, service outages, failed webhooks, and infrastructure compromise.
6. Customer and internal communication procedures.
7. Credential revocation and rotation.
8. Recovery and verification.
9. Escalation to payment, hosting, registrar, or security providers.
10. Privacy-preserving log handling and prohibited disclosure of secrets.
11. Post-incident review, root-cause analysis, corrective actions, and follow-up tracking.
12. Criteria for closing an incident and communicating resolution.

Include a concise incident record template and a severity matrix based on impact, scope, urgency, and data sensitivity.

Do not invent emergency contact details, provider account IDs, or SLAs. Use clearly labeled placeholders for information the organization must supply.

Reference SECURITY_BASELINE.md, THREAT_MODEL.md, DEPLOYMENT.md, and DISASTER_RECOVERY.md.

Do not perform incident-response actions or modify production systems while creating the runbook.
