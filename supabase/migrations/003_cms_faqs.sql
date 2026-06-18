-- Optional CMS FAQs for blog posts and resources
alter table public.cms_resources
  add column if not exists faqs jsonb not null default '[]'::jsonb;

alter table public.cms_blog_posts
  add column if not exists faqs jsonb not null default '[]'::jsonb;

alter table public.cms_resources
  drop constraint if exists cms_resources_faqs_is_array;
alter table public.cms_resources
  add constraint cms_resources_faqs_is_array
  check (jsonb_typeof(faqs) = 'array');

alter table public.cms_blog_posts
  drop constraint if exists cms_blog_posts_faqs_is_array;
alter table public.cms_blog_posts
  add constraint cms_blog_posts_faqs_is_array
  check (jsonb_typeof(faqs) = 'array');
