'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';

import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { CmsFaqEditor } from '@/components/admin/cms-faq-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { blogCategories } from '@/config/blog-categories';
import { getReadyCalculators } from '@/config/calculators';
import { getPublishedResources } from '@/config/resources';
import {
  archiveBlogPostAction,
  draftBlogPostAction,
  publishBlogPostAction,
  saveBlogPostAction,
} from '@/lib/admin/content/actions';
import type { BlogPostInput, CmsBlogPost, CmsContentStatus } from '@/lib/admin/content/types';
import {
  blogEditorSeoScore,
  getBlogEditorSeoChecks,
} from '@/lib/admin/blog/seo-checks';
import { getCmsFaqEditorGuidance } from '@/lib/admin/cms-faq-guidance';
import { cn } from '@/lib/utils';

const calculators = getReadyCalculators();
const resources = getPublishedResources();

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toInput(post?: CmsBlogPost): BlogPostInput {
  return {
    id: post?.id,
    slug: post?.slug ?? '',
    title: post?.title ?? '',
    excerpt: post?.excerpt ?? '',
    content: post?.content ?? '',
    status: post?.status ?? 'draft',
    category: post?.category ?? blogCategories[0],
    tags: post?.tags ?? [],
    authorId: post?.authorId ?? null,
    authorName: post?.authorName ?? null,
    seoTitle: post?.seoTitle ?? '',
    seoDescription: post?.seoDescription ?? '',
    canonicalUrl: post?.canonicalUrl ?? null,
    ogImage: post?.ogImage ?? null,
    featured: post?.featured ?? false,
    relatedCalculators: post?.relatedCalculators ?? [],
    relatedResources: post?.relatedResources ?? [],
    relatedBlogPosts: post?.relatedBlogPosts ?? [],
    taxYear: post?.taxYear ?? null,
    faqs: post?.faqs ?? [],
  };
}

function ToggleChip({
  selected,
  label,
  onClick,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
        selected
          ? 'border-tc-brand/30 bg-tc-brand/10 text-foreground'
          : 'border-border bg-background text-muted-foreground hover:bg-muted',
      )}
    >
      {label}
    </button>
  );
}

export function BlogEditor({
  post,
  mode,
}: {
  post?: CmsBlogPost;
  mode: 'create' | 'edit';
}) {
  const router = useRouter();
  const [form, setForm] = useState<BlogPostInput>(() => toInput(post));
  const [tagsInput, setTagsInput] = useState(() => (post?.tags ?? []).join(', '));
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const seoChecks = useMemo(() => getBlogEditorSeoChecks(form), [form]);
  const seoScore = useMemo(() => blogEditorSeoScore(form), [form]);
  const faqGuidance = useMemo(() => getCmsFaqEditorGuidance(form.faqs), [form.faqs]);

  function updateField<K extends keyof BlogPostInput>(key: K, value: BlogPostInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleSlugList(
    key: 'relatedCalculators' | 'relatedResources',
    value: string,
  ) {
    setForm((current) => {
      const list = current[key];
      const next = list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value];
      return { ...current, [key]: next };
    });
  }

  function buildPayload(status: CmsContentStatus): BlogPostInput {
    return {
      ...form,
      status,
      slug: form.slug.trim() || slugify(form.title),
      tags: tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    };
  }

  function handleSave(status: CmsContentStatus) {
    startTransition(async () => {
      setMessage(null);
      const saved = await saveBlogPostAction(buildPayload(status));
      setMessage(status === 'published' ? 'Post published.' : 'Draft saved.');
      if (mode === 'create') {
        router.replace(`/admin/blog/${saved.id}`);
      }
      router.refresh();
    });
  }

  function handleQuickAction(action: (id: string) => Promise<void>) {
    if (!post?.id) return;
    startTransition(async () => {
      await action(post.id);
      router.refresh();
    });
  }

  return (
    <div>
      <AdminPageHeader
        title={mode === 'create' ? 'New blog post' : 'Edit blog post'}
        description="Plain-text editor for blog content metadata and publishing."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/blog">← Back to blog</Link>
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-6">
          <section className="rounded-lg border border-border bg-card p-4 shadow-tc-sm">
            <h2 className="mb-4 text-sm font-semibold">Content</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(event) => {
                    updateField('title', event.target.value);
                    if (!form.slug || mode === 'create') {
                      updateField('slug', slugify(event.target.value));
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(event) => updateField('slug', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={form.excerpt}
                  onChange={(event) => updateField('excerpt', event.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={form.content}
                  onChange={(event) => updateField('content', event.target.value)}
                  rows={16}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-4 shadow-tc-sm">
            <h2 className="mb-1 text-sm font-semibold">FAQs (optional)</h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Add educational Q&amp;A pairs for on-page accordions and FAQ rich results. Leave
              empty to keep the current page layout.
            </p>
            <CmsFaqEditor
              faqs={form.faqs}
              onChange={(faqs) => updateField('faqs', faqs)}
            />
          </section>

          <section className="rounded-lg border border-border bg-card p-4 shadow-tc-sm">
            <h2 className="mb-4 text-sm font-semibold">Taxonomy & relations</h2>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(value) => updateField('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {blogCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={tagsInput}
                    onChange={(event) => setTagsInput(event.target.value)}
                    placeholder="comma, separated, tags"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Related calculators</Label>
                <div className="flex flex-wrap gap-1.5">
                  {calculators.map((calculator) => (
                    <ToggleChip
                      key={calculator.slug}
                      label={calculator.shortTitle}
                      selected={form.relatedCalculators.includes(calculator.slug)}
                      onClick={() =>
                        toggleSlugList('relatedCalculators', calculator.slug)
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Related resources</Label>
                <div className="flex flex-wrap gap-1.5">
                  {resources.map((resource) => (
                    <ToggleChip
                      key={resource.slug}
                      label={resource.shortTitle}
                      selected={form.relatedResources.includes(resource.slug)}
                      onClick={() =>
                        toggleSlugList('relatedResources', resource.slug)
                      }
                    />
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) => updateField('featured', event.target.checked)}
                  className="size-4 rounded border-border"
                />
                Featured post
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-4 shadow-tc-sm">
            <h2 className="mb-4 text-sm font-semibold">SEO</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO title</Label>
                <Input
                  id="seoTitle"
                  value={form.seoTitle}
                  onChange={(event) => updateField('seoTitle', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoDescription">SEO description</Label>
                <Textarea
                  id="seoDescription"
                  value={form.seoDescription}
                  onChange={(event) =>
                    updateField('seoDescription', event.target.value)
                  }
                  rows={3}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="canonicalUrl">Canonical URL (optional)</Label>
                  <Input
                    id="canonicalUrl"
                    value={form.canonicalUrl ?? ''}
                    onChange={(event) =>
                      updateField('canonicalUrl', event.target.value || null)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ogImage">OG image path (optional)</Label>
                  <Input
                    id="ogImage"
                    value={form.ogImage ?? ''}
                    onChange={(event) =>
                      updateField('ogImage', event.target.value || null)
                    }
                    placeholder="/og/blog/example.png"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    updateField('status', value as CmsContentStatus)
                  }
                >
                  <SelectTrigger className="sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <div className="flex flex-wrap gap-2">
            <Button disabled={pending} onClick={() => handleSave('draft')}>
              Save draft
            </Button>
            <Button
              variant="default"
              disabled={pending}
              onClick={() => handleSave('published')}
            >
              Publish
            </Button>
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => handleSave('archived')}
            >
              Archive
            </Button>
            {post?.id ? (
              <>
                {post.status !== 'published' ? (
                  <Button
                    variant="secondary"
                    disabled={pending}
                    onClick={() => handleQuickAction(publishBlogPostAction)}
                  >
                    Quick publish
                  </Button>
                ) : null}
                {post.status === 'archived' ? (
                  <Button
                    variant="secondary"
                    disabled={pending}
                    onClick={() => handleQuickAction(draftBlogPostAction)}
                  >
                    Restore to draft
                  </Button>
                ) : null}
                {post.status !== 'archived' ? (
                  <Button
                    variant="ghost"
                    disabled={pending}
                    onClick={() => handleQuickAction(archiveBlogPostAction)}
                  >
                    Quick archive
                  </Button>
                ) : null}
              </>
            ) : null}
          </div>

          {message ? (
            <p className="text-sm text-muted-foreground" role="status">
              {message}
            </p>
          ) : null}
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border border-border bg-card p-4 shadow-tc-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">SEO checks</h2>
              <span className="text-xs font-medium text-muted-foreground">
                {seoScore}%
              </span>
            </div>
            <ul className="space-y-2">
              {seoChecks.map((check) => (
                <li
                  key={check.id}
                  className={cn(
                    'flex items-center justify-between rounded-md border px-2.5 py-2 text-xs',
                    check.passed
                      ? 'border-tc-savings/30 bg-tc-savings-muted/40 text-tc-savings'
                      : 'border-tc-liability/20 bg-tc-liability-muted/30 text-tc-liability',
                  )}
                >
                  <span>{check.label}</span>
                  <span>{check.passed ? 'OK' : 'Missing'}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-border bg-card p-4 shadow-tc-sm">
            <h2 className="mb-3 text-sm font-semibold">FAQ guidance</h2>
            <ul className="space-y-2">
              {faqGuidance.map((check) => (
                <li
                  key={check.id}
                  className={cn(
                    'rounded-md border px-2.5 py-2 text-xs',
                    check.passed
                      ? 'border-tc-savings/30 bg-tc-savings-muted/40 text-tc-savings'
                      : 'border-border bg-muted/30 text-muted-foreground',
                  )}
                >
                  {check.label}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
