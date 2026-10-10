# BACKEND SCHEMA — Physical database proposal (Supabase Postgres)

Status: **PROPOSED SQL — not a migration.** Copy into `supabase/migrations/<timestamp>_<name>.sql` one phase at a time, review, run `supabase db reset && supabase test db`.
Logical model: `docs/ai/DATA_MODEL.md`. Conventions below are mandatory.

Day 0 (VERIFIED 2026-10-10): the repo has no `supabase/` directory — no config, migrations, RLS policies, seed or
pgTAP tests — and no Supabase dependency in `package.json`. The Supabase CLI is not installed locally. Zero tables
exist; every `TBL-` below is PROPOSED. Whether a hosted Supabase project exists is UNKNOWN.

## 1. Conventions
- PK `id uuid default gen_random_uuid()`; `created_at/updated_at timestamptz default now()` (+ `set_updated_at` trigger).
- Tenant tables: `organization_id uuid not null`, RLS **enabled + forced**, `unique (organization_id, id)` so children can use composite FKs.
- Status columns: `text` + `check (status in (...))` (easier to migrate than enums).
- Money: `amount_minor bigint check (amount_minor >= 0)`, `currency char(3) check (currency ~ '^[A-Z]{3}$')`.
- Schemas: `public` (RLS-protected app data, exposed via Data API), `private` (secrets, webhooks, idempotency, helper functions — **not exposed**).
- Helper functions: `security definer`, `set search_path = ''`, fully-qualified names.
- No `using (true)` on tenant data. No `select *` from app code on sensitive tables.

## 2. Phase map
| Migration | Tables | Phase |
|---|---|---|
| 0001_foundation | organizations, profiles, organization_members, roles, permissions, role_permissions, member_roles, invitations, audit_logs, private helpers | R0 |
| 0002_jobs_webhooks | private.jobs, private.webhook_events, private.idempotency_keys, notifications | R0 |
| 0003_infra | clients, client_contacts, provider_accounts, private.provider_credentials, domains, dns_zones, dns_records, dns_change_requests, dns_snapshots, hosting_accounts, websites, environments, website_domains, repositories, deployments, health_checks | R1 |
| 0004_payments | invoices, payment_requests, payment_attempts, payment_events, refunds, reconciliations | R2 |
| 0005_ops | projects, tasks, task_updates, task_comments, task_checklist_items, task_dependencies, approvals, support_tickets, support_messages, customer_users, attachments | R3 |
| 0006_team | employees, chat_channels, chat_members, chat_messages, chat_read_states, calls, call_participants, salary_records, payroll_periods, payroll_entries, expenses, leave_requests | R4 |
| 0007_ops_hardening | incidents, incident_events, integration_sync_states | R5 |

## 3. Foundation (0001)

```sql
create extension if not exists pgcrypto;
create extension if not exists citext;
create schema if not exists private;

-- TBL-001
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,48}$'),
  status text not null default 'active' check (status in ('active','suspended','archived')),
  timezone text not null default 'UTC',
  default_currency char(3) not null default 'GBP',
  settings jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- TBL-002 (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- TBL-003
create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  kind text not null default 'staff' check (kind in ('staff','customer')),
  status text not null default 'active' check (status in ('invited','active','suspended','disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id),
  unique (organization_id, id)
);
create index on public.organization_members (user_id) where status = 'active';

-- TBL-004..007 RBAC
create table public.permissions (
  key text primary key check (key ~ '^[a-z_]+\.[a-z_]+$'),   -- e.g. dns.write
  description text not null,
  is_high_risk boolean not null default false
);
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade, -- null = system template
  name text not null,
  requires_mfa boolean not null default false,
  is_system boolean not null default false,
  unique (organization_id, name)
);
create table public.role_permissions (
  role_id uuid references public.roles(id) on delete cascade,
  permission_key text references public.permissions(key) on delete cascade,
  primary key (role_id, permission_key)
);
create table public.member_roles (
  member_id uuid references public.organization_members(id) on delete cascade,
  role_id uuid references public.roles(id) on delete cascade,
  granted_by uuid references auth.users(id),
  granted_at timestamptz not null default now(),
  primary key (member_id, role_id)
);

-- TBL-008
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email citext not null,
  role_id uuid not null references public.roles(id),
  token_hash bytea not null unique,          -- sha256 of token; raw token only in email
  expires_at timestamptz not null,
  accepted_at timestamptz,
  invited_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

-- TBL-009 append-only
create table public.audit_logs (
  id bigint generated always as identity primary key,
  organization_id uuid references public.organizations(id),
  actor_user_id uuid,
  action text not null,                       -- 'dns.record.update'
  resource_type text not null,
  resource_id text,
  result text not null check (result in ('success','failure','denied')),
  request_id text,
  ip inet,
  metadata jsonb not null default '{}',       -- redacted, no secrets
  created_at timestamptz not null default now()
);
create index on public.audit_logs (organization_id, created_at desc);
revoke update, delete on public.audit_logs from authenticated, anon;

-- Helpers
create or replace function private.is_org_member(org uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = org and m.user_id = (select auth.uid()) and m.status = 'active'
  );
$$;

create or replace function private.has_permission(org uuid, perm text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.organization_members m
    join public.member_roles mr on mr.member_id = m.id
    join public.role_permissions rp on rp.role_id = mr.role_id
    join public.organizations o on o.id = m.organization_id and o.status = 'active'
    where m.organization_id = org and m.user_id = (select auth.uid())
      and m.status = 'active' and rp.permission_key = perm
  );
$$;
revoke all on function private.is_org_member, private.has_permission from public;
grant execute on function private.is_org_member, private.has_permission to authenticated;

-- RLS
alter table public.organizations enable row level security;
alter table public.organizations force row level security;
create policy org_read on public.organizations for select to authenticated
  using (private.is_org_member(id));
-- writes only through server (secret key) after app-level authz

alter table public.organization_members enable row level security;
alter table public.organization_members force row level security;
create policy members_read on public.organization_members for select to authenticated
  using (user_id = (select auth.uid()) or private.has_permission(organization_id, 'staff.read'));

alter table public.audit_logs enable row level security;
alter table public.audit_logs force row level security;
create policy audit_read on public.audit_logs for select to authenticated
  using (private.has_permission(organization_id, 'audit.read'));
-- inserts only from server; no update/delete policy at all
```

## 4. Jobs, webhooks, idempotency (0002)

```sql
create table private.jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  type text not null,                          -- 'payment.create_link', 'dns.apply_change'
  payload jsonb not null,                      -- IDs only, never secrets
  status text not null default 'queued'
    check (status in ('queued','running','completed','retrying','failed','dead_letter','cancelled')),
  attempts int not null default 0,
  max_attempts int not null default 8,
  run_at timestamptz not null default now(),
  locked_at timestamptz, locked_by text,
  last_error text,
  dedupe_key text unique,
  correlation_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on private.jobs (status, run_at) where status in ('queued','retrying');
-- claim: update ... where id = (select id from private.jobs where status in ('queued','retrying')
--        and run_at <= now() order by run_at for update skip locked limit 1) returning *;

create table private.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  organization_id uuid,
  payload jsonb not null,                      -- verified payload, card data never present
  signature_verified boolean not null,
  status text not null default 'received' check (status in ('received','processed','ignored','failed')),
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (provider, provider_event_id)
);

create table private.idempotency_keys (
  key text primary key,
  organization_id uuid not null,
  user_id uuid,
  request_hash bytea not null,
  response jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '24 hours'
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  user_id uuid not null references auth.users(id),
  type text not null, title text not null, body text,
  resource_type text, resource_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.notifications (user_id, created_at desc) where read_at is null;
alter table public.notifications enable row level security;
create policy notif_own on public.notifications for select to authenticated
  using (user_id = (select auth.uid()) and private.is_org_member(organization_id));
create policy notif_mark_read on public.notifications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
```

## 5. Infrastructure (0003) — key tables

```sql
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  name text not null,
  status text not null default 'active' check (status in ('prospect','active','inactive','archived')),
  billing_email citext,
  account_manager_id uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (organization_id, id)
);

create table public.provider_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  provider text not null check (provider in ('cloudflare','vercel','github','cpanel','registrar','stripe','dojo','email','turn')),
  display_name text not null,
  external_account_id text,
  status text not null default 'not_configured'
    check (status in ('not_configured','connected','degraded','expired','error','revoked','disconnected')),
  scopes text[] not null default '{}',
  last_verified_at timestamptz, last_error text,
  unique (organization_id, id)
);

create table private.provider_credentials (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  provider_account_id uuid not null,
  ciphertext bytea not null, nonce bytea not null, auth_tag bytea not null,
  key_version int not null,
  last4 text,
  expires_at timestamptz, revoked_at timestamptz,
  created_by uuid not null, created_at timestamptz not null default now(),
  foreign key (organization_id, provider_account_id)
    references public.provider_accounts(organization_id, id) on delete cascade
);

create table public.domains (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  client_id uuid,
  name text not null check (name = lower(name) and name ~ '^([a-z0-9-]+\.)+[a-z0-9-]{2,}$'),
  registrar_account_id uuid,
  dns_account_id uuid,
  status text not null default 'active'
    check (status in ('active','expiring','expired','transferring','suspended','archived')),
  expires_at date,
  auto_renew boolean,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (organization_id, name),
  unique (organization_id, id),
  foreign key (organization_id, client_id) references public.clients(organization_id, id),
  foreign key (organization_id, dns_account_id) references public.provider_accounts(organization_id, id),
  foreign key (organization_id, registrar_account_id) references public.provider_accounts(organization_id, id)
);
create index on public.domains (organization_id, expires_at);

create table public.dns_change_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  domain_id uuid not null,
  operation text not null check (operation in ('create','update','delete')),
  record_type text not null check (record_type in ('A','AAAA','CNAME','MX','TXT','NS','CAA','SRV')),
  before jsonb, after jsonb,
  risk text not null check (risk in ('low','medium','high')),
  status text not null default 'proposed'
    check (status in ('proposed','approved','applying','applied','failed','uncertain','cancelled')),
  requested_by uuid not null, approved_by uuid,
  check (approved_by is null or approved_by <> requested_by or risk <> 'high'),
  provider_record_id text,
  error text,
  created_at timestamptz not null default now(), applied_at timestamptz,
  foreign key (organization_id, domain_id) references public.domains(organization_id, id)
);
-- dns_records (cached provider state), dns_snapshots, hosting_accounts, websites, environments,
-- website_domains, repositories, deployments, health_checks follow the same pattern:
-- organization_id + composite FKs + status checks + (organization_id, …) indexes.
```

RLS template applied to every tenant table `T` with module permission prefix `P`:

```sql
alter table public.T enable row level security;
alter table public.T force row level security;
create policy T_select on public.T for select to authenticated
  using (private.has_permission(organization_id, 'P.read'));
create policy T_insert on public.T for insert to authenticated
  with check (private.has_permission(organization_id, 'P.write'));
create policy T_update on public.T for update to authenticated
  using (private.has_permission(organization_id, 'P.write'))
  with check (private.has_permission(organization_id, 'P.write'));
-- deletes: usually no policy (soft delete/archive through server) or 'P.delete'
```
Infra mutations with provider side-effects (DNS apply, deploy) have **no client insert/update policy**: they go through server actions + jobs only.

## 6. Payments (0004)

```sql
create table public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  client_id uuid not null,
  ticket_id uuid, invoice_id uuid,
  provider text not null check (provider in ('stripe','dojo')),
  provider_account_id uuid not null,
  amount_minor bigint not null check (amount_minor > 0),
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  description text not null check (length(description) <= 500),
  status text not null default 'pending'
    check (status in ('pending','sent','paid','failed','expired','cancelled','refunded','partially_refunded')),
  provider_payment_id text, payment_url text,
  refunded_minor bigint not null default 0 check (refunded_minor between 0 and amount_minor),
  expires_at timestamptz,
  created_by uuid not null,
  paid_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (provider, provider_payment_id),
  foreign key (organization_id, client_id) references public.clients(organization_id, id),
  foreign key (organization_id, provider_account_id) references public.provider_accounts(organization_id, id)
);
create index on public.payment_requests (organization_id, status, created_at desc);

-- Allowed transitions enforced by trigger:
-- pending→sent|failed|cancelled ; sent→paid|expired|cancelled|failed ;
-- paid→refunded|partially_refunded ; partially_refunded→refunded
create or replace function private.check_payment_transition() returns trigger
language plpgsql set search_path = '' as $$
begin
  if old.status = new.status then return new; end if;
  if not (old.status, new.status) in (
    ('pending','sent'),('pending','failed'),('pending','cancelled'),
    ('sent','paid'),('sent','expired'),('sent','cancelled'),('sent','failed'),
    ('paid','refunded'),('paid','partially_refunded'),('partially_refunded','refunded')
  ) then raise exception 'invalid payment transition % -> %', old.status, new.status; end if;
  return new;
end $$;
create trigger payment_transition before update of status on public.payment_requests
  for each row execute function private.check_payment_transition();

-- RLS: select with payments.read; NO insert/update policy for authenticated (server + jobs only).
```
`payment_events` (provider events mapped to a request), `refunds` (amount, reason, requested_by, approved_by, status), `reconciliations` follow the same pattern.

## 7. Operations (0005) — notable rules
- `tasks.assigned_to` must be an active staff member of the same org → composite FK to `organization_members(organization_id, id)`.
- `task_dependencies` `check (task_id <> depends_on_id)`.
- `support_messages.visibility in ('customer','internal')`; customer RLS policy:
```sql
create policy msg_customer on public.support_messages for select to authenticated
  using (visibility = 'customer' and exists (
    select 1 from public.support_tickets t
    join public.customer_users cu on cu.client_id = t.client_id and cu.user_id = (select auth.uid())
    where t.id = support_messages.ticket_id));
create policy msg_staff on public.support_messages for select to authenticated
  using (private.has_permission(organization_id, 'support.read'));
```
- `approvals`: `check (approver_id <> requester_id)` when `policy = 'separation_of_duties'`.
- `attachments`: `storage_path` generated server-side `org/<org_id>/<module>/<uuid>`; bucket private; Storage RLS checks parent resource access.

## 8. Team (0006) — notable rules
- `chat_messages` RLS: `exists (select 1 from chat_members cm where cm.channel_id = chat_messages.channel_id and cm.user_id = (select auth.uid()) and cm.left_at is null)`.
- Realtime private channels: policy on `realtime.messages` using `realtime.topic()` mapped to channel/call membership.
- `salary_records`, `payroll_entries`: select only with `salary.read`, or own row if `salary.read_own`; no client write policies; mutations via server with step-up; all audited.

## 9. Index checklist
`(organization_id, status)`, `(organization_id, created_at desc)` on every big list table · FK columns · `domains(organization_id, expires_at)` · `tasks(organization_id, assigned_to, status)` · `chat_messages(channel_id, created_at desc)` · `support_tickets(organization_id, status, sla_due_at)` · partial indexes for queues.

## 10. pgTAP tests per table (template)
```sql
-- supabase/tests/rls_domains.test.sql
begin; select plan(5);
-- seed: org A, org B, userA (dns.read), userB (org B), userNoPerm (org A, no dns.read)
select tests.authenticate_as('userA');
select results_eq('select count(*) from domains where organization_id = :orgA', $$values(1::bigint)$$);
select is_empty('select * from domains where organization_id = :orgB');
select throws_ok('insert into domains(organization_id,name) values (:orgB,''x.com'')');
select tests.authenticate_as('userNoPerm');
select is_empty('select * from domains');
select tests.clear_authentication();
select is_empty('select * from domains');
select * from finish(); rollback;
```
Every tenant table must ship with: anon DENY · own-org ALLOW · other-org DENY · no-permission DENY · cross-tenant FK insert DENY.
