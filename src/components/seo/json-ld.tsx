/**
 * Safely serialize JSON-LD for script injection.
 * Replaces `<` to prevent script termination attacks.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[] | null;
  id?: string;
}

/**
 * Renders one or more JSON-LD script tags.
 * Pass `null` to render nothing (e.g. empty FAQ list).
 */
export function JsonLd({ data, id }: JsonLdProps) {
  if (data === null) {
    return null;
  }

  const graphs = Array.isArray(data) ? data : [data];

  return (
    <>
      {graphs.map((graph, index) => (
        <script
          key={id ? `${id}-${index}` : `json-ld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(graph) }}
        />
      ))}
    </>
  );
}
