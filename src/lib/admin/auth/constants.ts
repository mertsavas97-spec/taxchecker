/** Admin session cookie name. */
export const ADMIN_SESSION_COOKIE = 'tc_admin_session';

/** Session lifetime in seconds (24 hours). */
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24;

/** Default dev credentials — override via env in production. */
export const ADMIN_DEFAULT_PASSWORD = 'taxchecker-admin';

export function getAdminSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    process.env.ADMIN_PASSWORD ??
    'dev-admin-secret-change-in-production'
  );
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? ADMIN_DEFAULT_PASSWORD;
}
