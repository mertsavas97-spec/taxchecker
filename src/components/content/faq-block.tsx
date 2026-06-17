'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqBlock({
  title = 'Frequently asked questions',
  description,
  items,
  className,
  defaultOpenIndexes = [],
}: {
  title?: string;
  description?: string;
  items: FaqItem[];
  className?: string;
  /** Zero-based indexes of FAQ items open by default */
  defaultOpenIndexes?: number[];
}) {
  const defaultValue = defaultOpenIndexes.map((index) => `faq-${index}`);

  return (
    <Card className={cn('shadow-tc-sm', className)}>
      <CardHeader>
        <CardTitle className="tc-heading-subsection">{title}</CardTitle>
        {description ? (
          <p className="tc-body text-sm">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent>
        <Accordion
          type="multiple"
          defaultValue={defaultValue}
          className="w-full"
        >
          {items.map((item, index) => (
            <AccordionItem key={item.question} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
