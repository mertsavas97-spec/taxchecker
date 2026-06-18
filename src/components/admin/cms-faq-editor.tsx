'use client';

import { PlusIcon, Trash2Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CmsFaqItem } from '@/lib/admin/content/types';

export function CmsFaqEditor({
  faqs,
  onChange,
}: {
  faqs: CmsFaqItem[];
  onChange: (faqs: CmsFaqItem[]) => void;
}) {
  function updateRow(index: number, patch: Partial<CmsFaqItem>) {
    onChange(
      faqs.map((item, rowIndex) =>
        rowIndex === index ? { ...item, ...patch } : item,
      ),
    );
  }

  function removeRow(index: number) {
    onChange(faqs.filter((_, rowIndex) => rowIndex !== index));
  }

  function addRow() {
    onChange([...faqs, { question: '', answer: '' }]);
  }

  return (
    <div className="space-y-4">
      {faqs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No FAQs yet. Add optional question-and-answer pairs for rich results and on-page
          accordions.
        </p>
      ) : null}

      {faqs.map((item, index) => (
        <div
          key={`faq-${index}`}
          className="space-y-3 rounded-lg border border-border bg-muted/20 p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              FAQ {index + 1}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeRow(index)}
              className="h-8 px-2 text-muted-foreground hover:text-destructive"
            >
              <Trash2Icon className="size-4" aria-hidden />
              <span className="sr-only">Remove FAQ {index + 1}</span>
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`faq-question-${index}`}>Question</Label>
            <Input
              id={`faq-question-${index}`}
              value={item.question}
              onChange={(event) => updateRow(index, { question: event.target.value })}
              placeholder="What is self-employment tax?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`faq-answer-${index}`}>Answer</Label>
            <Textarea
              id={`faq-answer-${index}`}
              value={item.answer}
              onChange={(event) => updateRow(index, { answer: event.target.value })}
              rows={4}
              placeholder="General educational answer without personalized tax advice."
            />
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addRow}>
        <PlusIcon className="size-4" aria-hidden />
        Add FAQ
      </Button>
    </div>
  );
}
