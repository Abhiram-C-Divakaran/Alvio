/** Keep auth redirects internal, including when a URL contains backslashes. */
export function authDestination(value: string | null | undefined, origin: string): string {
  if (!value?.startsWith('/')) return '/dashboard';
  try {
    const url = new URL(value, origin);
    if (url.origin !== origin || url.pathname === '/auth') return '/dashboard';
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return '/dashboard'; }
}
