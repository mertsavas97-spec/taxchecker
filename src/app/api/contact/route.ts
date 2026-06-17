import { NextResponse } from 'next/server';
import { Resend } from 'resend';

import {
  getContactFromEmail,
  getContactInboxEmail,
  isContactEmailConfigured,
} from '@/lib/contact/config';
import { checkContactRateLimit } from '@/lib/contact/rate-limit';
import {
  contactFormSchema,
  sanitizeContactFormInput,
} from '@/lib/contact/validation';

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkContactRateLimit(ip);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: rateLimit.retryAfterSeconds
          ? { 'Retry-After': String(rateLimit.retryAfterSeconds) }
          : undefined,
      },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = contactFormSchema.safeParse(body);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid form submission';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const input = sanitizeContactFormInput(parsed.data);

  if (input.website) {
    return NextResponse.json({ ok: true });
  }

  if (!isContactEmailConfigured()) {
    return NextResponse.json(
      {
        error:
          'Contact delivery is not configured. Set RESEND_API_KEY to enable the contact form.',
      },
      { status: 503 },
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const inbox = getContactInboxEmail();
  const from = getContactFromEmail();

  const text = [
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Topic: ${input.topic}`,
    '',
    input.message,
  ].join('\n');

  const { error } = await resend.emails.send({
    from,
    to: [inbox],
    replyTo: input.email,
    subject: `[TaxChecker Contact] ${input.topic}`,
    text,
  });

  if (error) {
    console.error('Contact form email failed:', error);
    return NextResponse.json(
      { error: 'Unable to send your message right now. Please try again later.' },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
