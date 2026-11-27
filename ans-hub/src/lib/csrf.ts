/**
 * Keeping `window.csrf_token` in step with the live session.
 *
 * The page template prints the CSRF token of the session that rendered it into
 * `window.csrf_token`, and the Frappe SDK sends that value on every write. Sign
 * in again anywhere (the Desk, a second tab, a session that expired and was
 * renewed) and the browser gets a different session, so the token held by an
 * already-open tab stops matching. Frappe only checks the token on POST, PUT and
 * DELETE, so the stale tab keeps reading happily and then fails the moment
 * somebody saves, with `CSRFTokenError: Invalid Request`.
 *
 * Rather than ask members to reload, we re-read the token for whichever session
 * the cookie points at now: once on start-up, again whenever the tab is brought
 * back into view, and on demand when a write has already been rejected.
 */

const CSRF_ENDPOINT =
  "/api/method/onerc_knowledge_hub.api.session.get_csrf_token";

/** One request at a time: a burst of writes must not fan out into a burst of refreshes. */
let inFlight: Promise<string | null> | null = null;

export async function refreshCsrfToken(): Promise<string | null> {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const res = await fetch(CSRF_ENDPOINT, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      // A signed-out session answers 403. Nothing to refresh, and the write that
      // triggered this will report the real problem itself.
      if (!res.ok) return null;

      const body = await res.json();
      const token: unknown = body?.message?.csrf_token;

      if (typeof token === "string" && token) {
        (window as Window & { csrf_token?: string }).csrf_token = token;
        return token;
      }

      return null;
    } catch {
      // Offline, or the request was blocked. Leave the old token in place.
      return null;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

/** True when a failed request was rejected for the token, not for its contents. */
export function isCsrfError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const err = error as { exc_type?: string; exception?: string };
  return (
    err.exc_type === "CSRFTokenError" ||
    (typeof err.exception === "string" && err.exception.includes("CSRFTokenError"))
  );
}

/**
 * Run a write, and if it is rejected for a stale token, refresh and run it once
 * more. Only retried on a CSRF rejection: nothing was saved, so there is no risk
 * of the work being done twice.
 */
export async function withCsrfRetry<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (error) {
    if (!isCsrfError(error)) throw error;

    const token = await refreshCsrfToken();
    if (!token) throw error;

    return await call();
  }
}

/**
 * Refresh on start-up and whenever the tab comes back into view, so a tab left
 * open overnight is current before anybody clicks Save.
 */
export function installCsrfRefresh() {
  void refreshCsrfToken();

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void refreshCsrfToken();
  });
}
