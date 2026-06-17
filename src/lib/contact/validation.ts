import { z } from 'zod';

export const CONTACT_TOPICS = [
  'General Question',
  'Calculator Feedback',
  'Methodology Question',
  'Technical Issue',
  'Privacy Request',
  'Partnership Inquiry',
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or fewer'),
  email: z
    .string()
    .trim()
    .email('Enter a valid email address')
    .max(254, 'Email must be 254 characters or fewer'),
  topic: z.enum(CONTACT_TOPICS, { message: 'Select a topic' }),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be 5,000 characters or fewer'),
  website: z.string().max(0, 'Invalid submission').optional(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export function sanitizeContactText(value: string): string {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
}

export function sanitizeContactFormInput(input: ContactFormValues): ContactFormValues {
  return {
    name: sanitizeContactText(input.name),
    email: sanitizeContactText(input.email).toLowerCase(),
    topic: input.topic,
    message: sanitizeContactText(input.message),
    website: input.website,
  };
}
