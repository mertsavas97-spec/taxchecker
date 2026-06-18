'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';

import { AdminPageHeader } from '@/components/admin/admin-page-header';
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
import { getReadyCalculators } from '@/config/calculators';
import { resources as staticResources } from '@/config/resources';
import { resourceHubCategories } from '@/config/resource-hub';
import { getPublicSourceRegistry } from '@/lib/authority/source-registry';
import { launchBlogPostInputs } from '@/lib/blog/launch-articles';
import {
  archiveResourceAction,
  draftResourceAction,
  publishResourceAction,
  saveResourceAction,
} from '@/lib/admin/content/actions';
import {
  getResourceEditorSeoChecks,
  resourceEditorSeoScore,
} from '@/lib/admin/resources/seo-checks';
import type { CmsContentStatus, CmsResource, ResourceInput } from '@/lib/admin/content/types';
import { cn } from '@/lib/utils';

const calculators = getReadyCalculators();
const resourceOptions = staticResources.filter((resource) =>
  resource.route.startsWith('/resources/'),
);
const sourceOptions = getPublicSourceRegistry();
const blogOptions = launchBlogPostInputs.map((post) => ({
  slug: post.slug,
  title: post.title,
}));

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toInput(resource?: CmsResource): ResourceInput {
  return {
    id: resource?.id,
    slug: resource?.slug ?? '',
    title: resource?.title ?? '',
    shortTitle: resource?.shortTitle ?? '',
    description: resource?.description ?? resource?.seoDescription ?? '',
    content: resource?.content ?? '',
    status: resource?.status ?? 'draft',
    category: resource?.category ?? resourceHubCategories[0]?.label ?? 'Guides',
    route: resource?.route,
    readingTime: resource?.readingTime ?? '5 min read',
    taxYear: resource?.taxYear ?? null,
    lastReviewed: resource?.lastReviewed ?? null,
    sourceIds: resource?.sourceIds ?? [],
    seoTitle: resource?.seoTitle ?? '',
    seoDescription: resource?.seoDescription ?? '',
    canonicalUrl: resource?.canonicalUrl ?? null,
    ogImage: resource?.ogImage ?? null,
    featured: resource?.featured ?? false,
    relatedCalculatorSlugs: resource?.relatedCalculatorSlugs ?? [],
    relatedResourceSlugs: resource?.relatedResourceSlugs ?? [],
    relatedBlogSlugs: resource?.relatedBlogSlugs ?? [],
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

export function ResourceEditor({
  resource,
  mode,
}: {
  resource?: CmsResource;
  mode: 'create' | 'edit';
}) {
  const router = useRouter();
  const [form, setForm] = useState<ResourceInput>(() => toInput(resource));
  const [sourceIdsInput, setSourceIdsInput] = useState(() =>
    (resource?.sourceIds ?? []).join(', '),
  );
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const seoChecks = useMemo(() => getResourceEditorSeoChecks(form), [form]);
  const seoScore = useMemo(() => resourceEditorSeoScore(form), [form]);

  function updateField<K extends keyof ResourceInput>(key: K, value: ResourceInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleSlugList(
    key: 'relatedCalculatorSlugs' | 'relatedResourceSlugs' | 'relatedBlogSlugs',
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

  function buildPayload(status: CmsContentStatus): ResourceInput {
    const slug = form.slug.trim() || slugify(form.title);
    return {
      ...form,
      status,
      slug,
      shortTitle: form.shortTitle.trim() || form.title.trim(),
      route: form.route?.trim() || `/resources/${slug}`,
      sourceIds: sourceIdsInput
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean),
    };
  }

  function handleSave(status: CmsContentStatus) {
    startTransition(async () => {
      setMessage(null);
      const saved = await saveResourceAction(buildPayload(status));
      setMessage(status === 'published' ? 'Resource published.' : 'Draft saved.');
      if (mode === 'create') {
        router.replace(`/admin/resources/${saved.id}`);
      }
      router.refresh();
    });
  }

  function handleQuickAction(action: (id: string) => Promise<void>) {
    if (!resource?.id) return;
    startTransition(async () => {
      await action(resource.id);
      router.refresh();
    });
  }

  return (
    <div>
      <AdminPageHeader
        title={mode === 'create' ? 'New resource' : 'Edit resource'}
        description="Manage resource content, authority metadata, SEO, and publishing."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/resources">← Back to resources</Link>
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
                    if (!form.shortTitle) {
                      updateField('shortTitle', event.target.value);
                    }
                  }}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(event) => updateField('slug', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortTitle">Short title</Label>
                  <Input
                    id="shortTitle"
                    value={form.shortTitle}
                    onChange={(event) => updateField('shortTitle', event.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description / excerpt</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content body</Label>
                <Textarea
                  id="content"
                  value={form.content}
                  onChange={(event) => updateField('content', event.target.value)}
                  rows={16}
                  className="font-mono text-xs"
                />
              </div>
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
                      {resourceHubCategories.map((category) => (
                        <SelectItem key={category.id} value={category.label}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="readingTime">Reading time</Label>
                  <Input
                    id="readingTime"
                    value={form.readingTime}
                    onChange={(event) => updateField('readingTime', event.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-4 shadow-tc-sm">
            <h2 className="mb-4 text-sm font-semibold">Tax / authority metadata</h2>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="taxYear">Tax year</Label>
                  <Input
                    id="taxYear"
                    type="number"
                    value={form.taxYear ?? ''}
                    onChange={(event) =>
                      updateField(
                        'taxYear',
                        event.target.value ? Number(event.target.value) : null,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastReviewed">Last reviewed</Label>
                  <Input
                    id="lastReviewed"
                    type="date"
                    value={form.lastReviewed ?? ''}
                    onChange={(event) =>
                      updateField('lastReviewed', event.target.value || null)
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sourceIds">Source IDs</Label>
                <Input
                  id="sourceIds"
                  value={sourceIdsInput}
                  onChange={(event) => setSourceIdsInput(event.target.value)}
                  placeholder="schedule-se, pub-334"
                />
                <p className="text-xs text-muted-foreground">
                  Available IDs: {sourceOptions.map((entry) => entry.id).join(', ')}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Federal-only estimate disclaimer and IRS review indicators are shown on
                the public resource hero from existing authority copy.
              </p>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-4 shadow-tc-sm">
            <h2 className="mb-4 text-sm font-semibold">Relations</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Related calculators</Label>
                <div className="flex flex-wrap gap-1.5">
                  {calculators.map((calculator) => (
                    <ToggleChip
                      key={calculator.slug}
                      label={calculator.shortTitle}
                      selected={form.relatedCalculatorSlugs.includes(calculator.slug)}
                      onClick={() =>
                        toggleSlugList('relatedCalculatorSlugs', calculator.slug)
                      }
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Related resources</Label>
                <div className="flex flex-wrap gap-1.5">
                  {resourceOptions.map((item) => (
                    <ToggleChip
                      key={item.slug}
                      label={item.shortTitle}
                      selected={form.relatedResourceSlugs.includes(item.slug)}
                      onClick={() =>
                        toggleSlugList('relatedResourceSlugs', item.slug)
                      }
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Related blog posts</Label>
                <div className="flex flex-wrap gap-1.5">
                  {blogOptions.map((post) => (
                    <ToggleChip
                      key={post.slug}
                      label={post.title}
                      selected={form.relatedBlogSlugs.includes(post.slug)}
                      onClick={() => toggleSlugList('relatedBlogSlugs', post.slug)}
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
                Featured resource
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
                    placeholder="/og/resources/example.png"
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
            <Button disabled={pending} onClick={() => handleSave('published')}>
              Publish
            </Button>
            <Button variant="outline" disabled={pending} onClick={() => handleSave('archived')}>
              Archive
            </Button>
            {resource?.id ? (
              <>
                {resource.status !== 'published' ? (
                  <Button
                    variant="secondary"
                    disabled={pending}
                    onClick={() => handleQuickAction(publishResourceAction)}
                  >
                    Quick publish
                  </Button>
                ) : null}
                {resource.status === 'archived' ? (
                  <Button
                    variant="secondary"
                    disabled={pending}
                    onClick={() => handleQuickAction(draftResourceAction)}
                  >
                    Restore to draft
                  </Button>
                ) : null}
                {resource.status !== 'archived' ? (
                  <Button
                    variant="ghost"
                    disabled={pending}
                    onClick={() => handleQuickAction(archiveResourceAction)}
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
        </aside>
      </div>
    </div>
  );
}
