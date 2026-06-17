import { FaqBlock, type FaqItem } from '@/components/content/faq-block';

export function ResourceFaq({
  items,
  title = 'Frequently asked questions',
  description = 'Common questions about this topic. Answers are general and may not fit every taxpayer situation.',
}: {
  items: FaqItem[];
  title?: string;
  description?: string;
}) {
  return (
    <FaqBlock
      title={title}
      description={description}
      items={items}
      defaultOpenIndexes={[0]}
    />
  );
}

export type { FaqItem };
