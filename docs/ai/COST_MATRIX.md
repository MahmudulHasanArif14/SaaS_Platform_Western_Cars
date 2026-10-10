# Cost Matrix

Required by MASTER_SPEC Part B §171 (the spec names `docs/COST_MATRIX.md`; kept under `docs/ai/` with the other project-memory files — see DECISIONS ADR-002).

**No pricing below is verified.** Free-tier limits and prices change; each row must be checked against the provider's official pricing page and dated before it is used for a decision. Rule: security and reliability outrank free price.

| Service | Purpose | Free tier | Paid dependency / trigger | Production limitation | If unavailable | Alternative | Verified |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Supabase | DB, Auth, RLS, Realtime, Storage, queues/cron | TO VERIFY (free projects may pause when inactive) | Likely paid for production: backups/PITR, no pausing, separate staging + prod projects | Plan limits on DB size, MAU, Realtime connections, Storage, egress | Whole platform down | Self-hosted Supabase | NO |
| Vercel | Hosting the platform app | TO VERIFY (hobby tier commercial-use terms) | Commercial use may require paid plan | Function duration/limits affect jobs & webhooks | Platform unreachable | Other Next.js host | NO |
| GitHub | Source, CI, repo integration | TO VERIFY (Actions minutes) | Private repo CI minutes | API rate limits | No CI / repo sync | GitLab | NO |
| Cloudflare | DNS, SSL edge | TO VERIFY | Advanced features | API token scopes, rate limits | DNS changes unavailable via API | Registrar DNS | NO |
| cPanel hosts | Client hosting | Depends on host | Host licence | API availability varies by host | Manual management | — | NO |
| Domain registrar(s) | Domains, renewals, nameservers | N/A | Domain fees; API access may need balance/whitelist | API differs per registrar | Manual tracking | — | NO (OD-3) |
| Stripe | Payments | No monthly fee model — TO VERIFY | Per-transaction fees | Account verification, payout schedule | Cannot collect via Stripe | Dojo | NO |
| Dojo | Payments | TO VERIFY | Merchant agreement, fees | Region availability; API capabilities to confirm | Cannot collect via Dojo | Stripe | NO |
| Email provider | Invitations, notifications | TO VERIFY | Volume | Sender domain verification (SPF/DKIM/DMARC) | Invitations/notifications fail | Alternate provider | NO (OD-4) |
| TURN | WebRTC relay | Self-host coturn (server cost) or provider — TO VERIFY | Bandwidth | Needed for restrictive networks | Calls fail behind strict NAT | Provider vs self-host | NO |
| Monitoring / error tracking | Uptime, errors | TO VERIFY | Volume | Retention | Reduced visibility | Self-implemented health checks | NO (OD-5) |
| AI provider (A17 only) | Website generation | TO VERIFY | Per-token usage | Commercial terms, quotas | Builder unusable | Another model provider | NO (OD-12) |

Update this table when a service is chosen, with the date and source URL of the pricing checked.
