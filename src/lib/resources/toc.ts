/** Generate a URL-safe id from a resource section heading. */
export function slugifyResourceHeading(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface TocEntry {
  id: string;
  label: string;
}
