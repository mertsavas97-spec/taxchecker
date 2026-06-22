-- Populate blog post editorial hero image paths.
-- Safe to re-run: only updates rows where og_image is null, empty, or still points at legacy SVG thumbnails.

UPDATE cms_blog_posts
SET og_image = '/images/blog/self-employment-tax-explained-hero.jpg'
WHERE slug = 'self-employment-tax-explained'
  AND (og_image IS NULL OR btrim(og_image) = '' OR og_image LIKE '%.svg');

UPDATE cms_blog_posts
SET og_image = '/images/blog/how-self-employment-tax-is-calculated-hero.jpg'
WHERE slug = 'how-self-employment-tax-is-calculated'
  AND (og_image IS NULL OR btrim(og_image) = '' OR og_image LIKE '%.svg');

UPDATE cms_blog_posts
SET og_image = '/images/blog/self-employment-tax-rate-2025-hero.jpg'
WHERE slug = 'self-employment-tax-rate-2025'
  AND (og_image IS NULL OR btrim(og_image) = '' OR og_image LIKE '%.svg');

UPDATE cms_blog_posts
SET og_image = '/images/blog/1099-vs-w2-explained-hero.jpg'
WHERE slug = '1099-vs-w2-explained'
  AND (og_image IS NULL OR btrim(og_image) = '' OR og_image LIKE '%.svg');

UPDATE cms_blog_posts
SET og_image = '/images/blog/1099-tax-deductions-explained-hero.jpg'
WHERE slug = '1099-tax-deductions-explained'
  AND (og_image IS NULL OR btrim(og_image) = '' OR og_image LIKE '%.svg');

UPDATE cms_blog_posts
SET og_image = '/images/blog/quarterly-taxes-explained-hero.jpg'
WHERE slug = 'quarterly-taxes-explained'
  AND (og_image IS NULL OR btrim(og_image) = '' OR og_image LIKE '%.svg');

UPDATE cms_blog_posts
SET og_image = '/images/blog/estimated-tax-safe-harbor-rules-hero.jpg'
WHERE slug = 'estimated-tax-safe-harbor-rules'
  AND (og_image IS NULL OR btrim(og_image) = '' OR og_image LIKE '%.svg');

UPDATE cms_blog_posts
SET og_image = '/images/blog/llc-vs-s-corp-explained-hero.jpg'
WHERE slug = 'llc-vs-s-corp-explained'
  AND (og_image IS NULL OR btrim(og_image) = '' OR og_image LIKE '%.svg');

UPDATE cms_blog_posts
SET og_image = '/images/blog/reasonable-salary-explained-hero.jpg'
WHERE slug = 'reasonable-salary-explained'
  AND (og_image IS NULL OR btrim(og_image) = '' OR og_image LIKE '%.svg');

UPDATE cms_blog_posts
SET og_image = '/images/blog/federal-tax-brackets-2025-explained-hero.jpg'
WHERE slug = 'federal-tax-brackets-2025-explained'
  AND (og_image IS NULL OR btrim(og_image) = '' OR og_image LIKE '%.svg');
