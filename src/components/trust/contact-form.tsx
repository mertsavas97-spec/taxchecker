'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import Link from 'next/link';

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
import {
  CONTACT_TOPICS,
  contactFormSchema,
  type ContactFormValues,
} from '@/lib/contact/validation';

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      topic: undefined,
      message: '',
      website: '',
    },
  });

  const topic = watch('topic');

  async function onSubmit(values: ContactFormValues) {
    setServerError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = (await response.json()) as { error?: string; ok?: boolean };

      if (!response.ok) {
        setServerError(data.error ?? 'Unable to send your message. Please try again.');
        return;
      }

      setSubmitted(true);
      reset();
    } catch {
      setServerError('Unable to send your message. Please try again.');
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-tc-savings/30 bg-tc-savings-muted/30 p-5">
        <h2 className="text-base font-semibold text-foreground">Message sent</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Thank you for contacting TaxChecker. If your inquiry is about website functionality
          or methodology, we will review it when possible. We cannot provide individualized
          tax advice by email.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => setSubmitted(false)}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="rounded-lg border border-border bg-muted/20 px-3 py-3 text-xs leading-relaxed text-muted-foreground">
        <p>
          By submitting this form, you agree that we may use the information you provide to
          respond to your inquiry as described in our{' '}
          <Link href="/privacy" className="font-medium text-tc-link no-underline hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
        <p className="mt-2 font-medium text-foreground">
          Do not submit Social Security numbers, tax returns, bank information, or other
          sensitive tax documents.
        </p>
      </div>

      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden>
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register('website')}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Name</Label>
          <Input id="contact-name" autoComplete="name" {...register('name')} />
          {errors.name ? (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            {...register('email')}
          />
          {errors.email ? (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-topic">Topic</Label>
        <Select
          value={topic}
          onValueChange={(value) =>
            setValue('topic', value as ContactFormValues['topic'], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger id="contact-topic" className="w-full">
            <SelectValue placeholder="Select a topic" />
          </SelectTrigger>
          <SelectContent>
            {CONTACT_TOPICS.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.topic ? (
          <p className="text-xs text-destructive">{errors.topic.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          rows={6}
          className="min-h-32 resize-y"
          {...register('message')}
        />
        {errors.message ? (
          <p className="text-xs text-destructive">{errors.message.message}</p>
        ) : null}
      </div>

      {serverError ? (
        <p className="text-sm text-destructive" role="alert">
          {serverError}
        </p>
      ) : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  );
}
