/**
 * User-facing IRS source review copy. Never reference internal repo paths.
 */
export function formatIrsVerificationNotice(reviewedAt: string): string {
  return `Federal tax constants last reviewed ${reviewedAt} against IRS sources for the labeled tax year. Source documentation is on our methodology and sources pages.`;
}
