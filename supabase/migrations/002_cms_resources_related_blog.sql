-- Add related blog slugs to cms_resources (nullable array, safe default)
alter table public.cms_resources
  add column if not exists related_blog_slugs text[] not null default '{}';
