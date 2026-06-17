-- TaxChecker CMS schema — Sprint 28
-- Run in Supabase SQL editor or via supabase db push

-- ---------------------------------------------------------------------------
-- admin_users
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text not null default 'editor' check (role in ('owner', 'editor')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- cms_resources
-- ---------------------------------------------------------------------------
create table if not exists public.cms_resources (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  content text,
  category text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  reading_time text,
  tax_year integer,
  last_reviewed date,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  seo_title text,
  seo_description text,
  canonical_url text,
  og_image text,
  related_calculators text[] not null default '{}',
  related_resources text[] not null default '{}',
  source_ids text[] not null default '{}',
  featured boolean not null default false,
  route text,
  short_title text,
  created_by uuid,
  updated_by uuid
);

-- ---------------------------------------------------------------------------
-- cms_blog_posts
-- ---------------------------------------------------------------------------
create table if not exists public.cms_blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content text,
  category text not null,
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  author_id uuid,
  author_name text,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  seo_title text,
  seo_description text,
  canonical_url text,
  og_image text,
  reading_time text,
  featured boolean not null default false,
  related_calculators text[] not null default '{}',
  related_resources text[] not null default '{}',
  tax_year integer,
  revision integer not null default 1
);

-- ---------------------------------------------------------------------------
-- cms_calculator_metadata
-- ---------------------------------------------------------------------------
create table if not exists public.cms_calculator_metadata (
  id uuid primary key default gen_random_uuid(),
  calculator_slug text unique not null,
  title text not null,
  tax_year integer,
  last_reviewed date,
  featured_badge text,
  status text not null default 'ready' check (status in ('ready', 'planned', 'archived')),
  seo_title text,
  seo_description text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- cms_audit_log
-- ---------------------------------------------------------------------------
create table if not exists public.cms_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- indexes
-- ---------------------------------------------------------------------------
create index if not exists cms_resources_slug_idx on public.cms_resources (slug);
create index if not exists cms_resources_status_idx on public.cms_resources (status);
create index if not exists cms_resources_category_idx on public.cms_resources (category);
create index if not exists cms_resources_updated_at_idx on public.cms_resources (updated_at desc);

create index if not exists cms_blog_posts_slug_idx on public.cms_blog_posts (slug);
create index if not exists cms_blog_posts_status_idx on public.cms_blog_posts (status);
create index if not exists cms_blog_posts_category_idx on public.cms_blog_posts (category);
create index if not exists cms_blog_posts_updated_at_idx on public.cms_blog_posts (updated_at desc);

create index if not exists cms_calculator_metadata_slug_idx on public.cms_calculator_metadata (calculator_slug);
create index if not exists cms_calculator_metadata_status_idx on public.cms_calculator_metadata (status);
create index if not exists cms_calculator_metadata_updated_at_idx on public.cms_calculator_metadata (updated_at desc);

create index if not exists cms_audit_log_entity_idx on public.cms_audit_log (entity_type, entity_id);
create index if not exists cms_audit_log_created_at_idx on public.cms_audit_log (created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cms_resources_updated_at on public.cms_resources;
create trigger cms_resources_updated_at
  before update on public.cms_resources
  for each row execute function public.set_updated_at();

drop trigger if exists cms_blog_posts_updated_at on public.cms_blog_posts;
create trigger cms_blog_posts_updated_at
  before update on public.cms_blog_posts
  for each row execute function public.set_updated_at();

drop trigger if exists cms_calculator_metadata_updated_at on public.cms_calculator_metadata;
create trigger cms_calculator_metadata_updated_at
  before update on public.cms_calculator_metadata
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- helper: admin email check
-- ---------------------------------------------------------------------------
create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.admin_users enable row level security;
alter table public.cms_resources enable row level security;
alter table public.cms_blog_posts enable row level security;
alter table public.cms_calculator_metadata enable row level security;
alter table public.cms_audit_log enable row level security;

-- admin_users: authenticated users may read their own row
drop policy if exists admin_users_self_select on public.admin_users;
create policy admin_users_self_select
  on public.admin_users
  for select
  to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- Public read: published resources
drop policy if exists cms_resources_public_select on public.cms_resources;
create policy cms_resources_public_select
  on public.cms_resources
  for select
  to anon, authenticated
  using (status = 'published');

-- Public read: published blog posts
drop policy if exists cms_blog_posts_public_select on public.cms_blog_posts;
create policy cms_blog_posts_public_select
  on public.cms_blog_posts
  for select
  to anon, authenticated
  using (status = 'published');

-- Public read: ready calculator metadata
drop policy if exists cms_calculator_metadata_public_select on public.cms_calculator_metadata;
create policy cms_calculator_metadata_public_select
  on public.cms_calculator_metadata
  for select
  to anon, authenticated
  using (status = 'ready');

-- Admin CMS writes (authenticated + admin_users)
drop policy if exists cms_resources_admin_all on public.cms_resources;
create policy cms_resources_admin_all
  on public.cms_resources
  for all
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists cms_blog_posts_admin_all on public.cms_blog_posts;
create policy cms_blog_posts_admin_all
  on public.cms_blog_posts
  for all
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists cms_calculator_metadata_admin_all on public.cms_calculator_metadata;
create policy cms_calculator_metadata_admin_all
  on public.cms_calculator_metadata
  for all
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists cms_audit_log_admin_insert on public.cms_audit_log;
create policy cms_audit_log_admin_insert
  on public.cms_audit_log
  for insert
  to authenticated
  with check (public.is_admin_user());

drop policy if exists cms_audit_log_admin_select on public.cms_audit_log;
create policy cms_audit_log_admin_select
  on public.cms_audit_log
  for select
  to authenticated
  using (public.is_admin_user());

-- Note: service_role key bypasses RLS for server-only admin operations.
