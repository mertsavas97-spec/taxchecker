export function getContactInboxEmail(): string {
  return process.env.CONTACT_INBOX_EMAIL?.trim() || 'mertsavas97@gmail.com';
}

export function getContactFromEmail(): string {
  return (
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    'TaxChecker <onboarding@resend.dev>'
  );
}

export function isContactEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}
