/**
 * Shared helpers for the Sveltia CMS OAuth proxy (netlify/functions/oauth-*.mjs).
 *
 * WHY THIS EXISTS
 * ---------------
 * Sveltia CMS talks to GitHub directly from the browser, but the OAuth
 * authorization-code exchange needs the app's *client secret*, which can never
 * ship to a browser. So a tiny server-side proxy has to sit in the middle. The
 * reference implementation is a Cloudflare Worker (sveltia/sveltia-cms-auth);
 * this is the same protocol re-implemented as two Netlify Functions so the site
 * needs one host, one deploy and one set of environment variables instead of
 * two accounts.
 *
 * WHY .mjs AND NOT .ts
 * --------------------
 * tsconfig.json includes `**​/*.ts` and `**​/*.mts` repo-wide, so a TypeScript
 * function here would be type-checked by `next build` against a Next.js/DOM
 * tsconfig it was never written for. Plain ESM keeps the static export's build
 * exactly as it was. Netlify bundles these with esbuild; no extra dependency
 * (`@netlify/functions` is only needed for TypeScript types).
 *
 * WHY IT LIVES OUTSIDE netlify/functions/
 * ---------------------------------------
 * Netlify treats every file at the top level of the functions directory as a
 * deployable function. A shared module in there would deploy as a function with
 * no handler. Keeping it one level up makes it a plain import instead.
 *
 * THE PROTOCOL (verified against sveltia-cms and sveltia-cms-auth source, not
 * assumed from Decap's older provider):
 *
 *   1. The CMS opens a popup at `<base_url>/<auth_endpoint>` with the query
 *      parameters `provider`, `site_id` and `scope`.
 *   2. GitHub redirects the popup back to the callback endpoint with `code`
 *      and `state`.
 *   3. The popup posts the string `authorizing:github` to `window.opener`.
 *   4. The CMS echoes `authorizing:github` back to the popup.
 *   5. The popup posts `authorization:github:success:{"provider":"github",
 *      "token":"..."}` — or `authorization:github:error:{...}` — to the opener.
 *
 * The step-4 echo is mandatory: the CMS only accepts a result that arrives
 * *after* it, and it ignores any message whose `event.origin` is not the origin
 * of `base_url`. Skipping the handshake, or posting from the wrong origin, is
 * exactly the silent-hang failure this replaces.
 */

/**
 * The only backend this proxy serves. The site is on GitHub; accepting
 * `gitlab` too would mean carrying a second set of credentials for nothing.
 */
export const PROVIDER = 'github';

/** Cookie holding the CSRF state token between the two requests. */
export const CSRF_COOKIE = 'sveltia-csrf';

/**
 * Path the CSRF cookie is scoped to. Both endpoints live under `/oauth/`, so
 * the cookie is never sent with an ordinary page request — it exists for
 * roughly ten seconds of a sign-in and nothing else.
 */
export const OAUTH_PATH = '/oauth';

/** Seconds the CSRF cookie survives. A sign-in that takes longer has stalled. */
const CSRF_MAX_AGE = 600;

/**
 * OAuth scopes this proxy is willing to request. The endpoint is reachable by
 * anyone on the internet, and a token minted with a wider scope keeps that
 * scope, so the `scope` query parameter is filtered rather than trusted.
 * `repo,user` is what Sveltia asks for by default (`auth_scope` + `,user`).
 */
const ALLOWED_SCOPES = ['repo', 'public_repo', 'user', 'read:user', 'user:email'];
const DEFAULT_SCOPE = 'repo,user';

/**
 * Work out which scope to ask GitHub for.
 * @param {string | null} requested Raw `scope` query parameter.
 * @returns {string} Comma-separated scope string.
 */
export const getScope = (requested) => {
  const scopes = (requested ?? '').split(/[\s,]+/).filter(Boolean);

  if (scopes.length && scopes.every((scope) => ALLOWED_SCOPES.includes(scope))) {
    return scopes.join(',');
  }

  return DEFAULT_SCOPE;
};

/**
 * Work out the origin this function is being served from.
 *
 * `request.url` is not reliable here: the endpoints are reached through a
 * `netlify.toml` rewrite, so the path may be the internal
 * `/.netlify/functions/...` one. The forwarded headers are what the browser
 * actually asked for, which is the origin the CMS popup is running on.
 * @param {Request} request Incoming request.
 * @returns {string} Origin, e.g. `https://ryanshutter.netlify.app`.
 */
export const getSelfOrigin = (request) => {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');

  if (!host) {
    return new URL(request.url).origin;
  }

  // Netlify always sets x-forwarded-proto in production. The fallback reads the
  // scheme off the request instead of assuming https, so `netlify dev` over
  // http://localhost still produces an origin the local admin page matches —
  // hard-coding https there would make every local sign-in look like a
  // cross-origin mismatch.
  const proto =
    request.headers.get('x-forwarded-proto') || new URL(request.url).protocol.replace(':', '');

  return `${proto}://${host}`;
};

/**
 * Origins the access token may be handed to.
 *
 * The token is posted to `window.opener`, so the target origin decides who can
 * receive it — `*` would hand it to whatever page managed to open the popup.
 * The default is this site's own origin, which is correct whenever `/admin/` and
 * these functions are served from the same host (they always are here).
 *
 * `CMS_ALLOWED_ORIGINS` is the escape hatch for the one case that breaks that
 * assumption: the admin page opened on a different hostname from the one in
 * `base_url` — e.g. `base_url` still points at the netlify.app subdomain after
 * a custom domain goes live. Both hosts have to be listed, or the token has
 * nowhere valid to go.
 * @param {Request} request Incoming request.
 * @returns {string[]} Absolute origins, no trailing slash, duplicates removed.
 */
export const getAllowedOrigins = (request) => {
  const configured = (process.env.CMS_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => {
      try {
        // Accept `example.com`, `https://example.com` and `https://example.com/`
        return new URL(value.includes('://') ? value : `https://${value}`).origin;
      } catch {
        return '';
      }
    })
    .filter(Boolean);

  return [...new Set([getSelfOrigin(request), ...configured])];
};

/**
 * Escape a value for embedding in HTML text.
 *
 * Exported because `hint` is passed through as raw HTML (it contains `<code>`
 * markup), so any *value* interpolated into a hint by a caller has to be
 * escaped there. The `error` string is escaped here automatically.
 * @param {string} value Raw value.
 * @returns {string} Escaped value.
 */
export const escapeHTML = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

/**
 * Serialize a value for an inline `<script>` block. `</script>` inside a JSON
 * string would close the block early, so `<` is escaped.
 * @param {unknown} value Value to serialize.
 * @returns {string} JavaScript literal.
 */
const serialize = (value) => JSON.stringify(value ?? null).replaceAll('<', '\\u003c');

/**
 * Build the popup's final HTML page.
 *
 * It does two independent things, and the second one is the point of this
 * rewrite:
 *
 *   1. Runs the postMessage handshake so the CMS gets the token (or the error).
 *   2. Renders the same message as *visible text*. The Cloudflare reference
 *      renders an empty body, so a handshake that never completes — the popup
 *      opened directly, an origin mismatch, a missing environment variable —
 *      looks identical to a hang. Here the popup always says what happened, and
 *      a watchdog replaces the "signing in" text if no reply arrives.
 * WHY NO `errorCode` IS SENT
 * --------------------------
 * The reference worker sends one, and the CMS does this with it:
 *
 *   result.errorCode ? _(`sign_in_error.${result.errorCode}`, { default: result.error })
 *                    : result.error
 *
 * Sveltia ships its own English for every code the worker uses, so sending one
 * *replaces* whatever we wrote with a generic line — "OAuth app client ID or
 * secret is not configured." instead of the sentence naming the two Netlify
 * variables to add. Omitting the code takes the second branch, and the message
 * below reaches the owner verbatim. The trade is localization, which is not a
 * consideration for a one-person admin panel in English.
 *
 * `errorCode` is still accepted, because it is the right label to quote in a
 * bug report — it is rendered as small print in the popup instead.
 * @param {object} args Arguments.
 * @param {Request} args.request Incoming request, used to derive allowed origins.
 * @param {string} [args.token] Access token, on success.
 * @param {string} [args.error] Human-readable failure message. Sent to the CMS
 * verbatim, so write it for the site owner, not for a developer.
 * @param {string} [args.errorCode] Diagnostic label, shown in the popup only.
 * @param {string} [args.hint] What to do about it. Plain text, no markup: it is
 * shown in the popup *and* appended to the message the CMS displays, and the
 * two have to be the same words.
 * @returns {Response} HTML response that also clears the CSRF cookie.
 */
export const renderResult = ({ request, token, error, errorCode, hint }) => {
  const state = error ? 'error' : 'success';
  // The CMS closes this popup the moment it gets a result, so the hint has to
  // travel with the message rather than only being on screen here.
  const content = error
    ? { provider: PROVIDER, error: hint ? `${error} ${hint}` : error }
    : { provider: PROVIDER, token };

  const allowedOrigins = getAllowedOrigins(request);

  const body = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${error ? 'Sign-in failed' : 'Signing in'} — RyanShutter Admin</title>
<style>
  :root { color-scheme: light dark; }
  body {
    margin: 0; min-height: 100vh; display: grid; place-items: center;
    padding: 2rem; box-sizing: border-box;
    font: 400 16px/1.6 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    background: Canvas; color: CanvasText;
  }
  main { max-width: 34rem; text-align: center; }
  h1 { font-size: 1.25rem; font-weight: 600; margin: 0 0 .75rem; }
  p { margin: 0 0 .75rem; }
  .detail { opacity: .75; font-size: .9375rem; }
  .code {
    opacity: .55; font-size: .8125rem; letter-spacing: .04em;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    margin-top: 1.5rem;
  }
</style>
</head>
<body>
<main>
  <h1 id="heading">${error ? 'Sign-in failed' : 'Signing you in…'}</h1>
  <p id="message">${
    error
      ? escapeHTML(error)
      : 'Connecting the admin portal to GitHub. This window closes itself.'
  }</p>
  ${hint ? `<p class="detail" id="hint">${escapeHTML(hint)}</p>` : ''}
  ${errorCode ? `<p class="code">${escapeHTML(errorCode)}</p>` : ''}
</main>
<script>
(() => {
  const ALLOWED_ORIGINS = ${serialize(allowedOrigins)};
  const RESULT = ${serialize(`authorization:${PROVIDER}:${state}:${JSON.stringify(content)}`)};
  const HANDSHAKE = ${serialize(`authorizing:${PROVIDER}`)};
  const opener = window.opener;

  const show = (heading, message) => {
    document.getElementById('heading').textContent = heading;
    document.getElementById('message').textContent = message;

    // The hint that was rendered server-side belongs to a different situation
    // from the one being reported now; leaving it would give two conflicting
    // instructions on the same screen.
    document.getElementById('hint')?.remove();
  };

  if (!opener) {
    // Someone opened this URL directly rather than from the admin portal.
    show(
      'Nothing to do here',
      'This page is part of the admin portal sign-in and only works when the portal opens it. Go to /admin/ and click "Sign in with GitHub".'
    );
    return;
  }

  let settled = false;

  window.addEventListener('message', ({ data, origin }) => {
    // The CMS answers the first message with the identical string. Anything
    // else, or anything from an origin we do not hand tokens to, is ignored.
    if (settled || data !== HANDSHAKE || !ALLOWED_ORIGINS.includes(origin)) {
      return;
    }

    settled = true;
    // Targeted at the opener's own origin, never '*': this message carries the
    // GitHub access token.
    opener.postMessage(RESULT, origin);
  });

  // Open the handshake. The opener's origin is not knowable from inside this
  // window, so the invitation goes to each allowed origin in turn; the browser
  // silently drops the ones that do not match. This is the same effect as the
  // reference worker's '*' without ever broadcasting to an unknown page.
  ALLOWED_ORIGINS.forEach((origin) => {
    try {
      opener.postMessage(HANDSHAKE, origin);
    } catch {
      // Cross-origin opener that has since navigated away; nothing to do.
    }
  });

  // Watchdog. Without this, an origin mismatch leaves a popup that says
  // "Signing you in…" forever — the exact failure this whole endpoint exists
  // to stop. Ten seconds is far longer than a same-origin postMessage needs.
  setTimeout(() => {
    if (settled) {
      return;
    }

    show(
      'The admin portal did not answer',
      'The sign-in window could not talk back to the admin portal. This usually means the address in the portal\\u2019s settings (base_url) is a different domain from the one you opened /admin/ on. Close this window and tell your developer.'
    );
  }, 10000);
})();
</script>
</body>
</html>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      // The CSRF token is single-use. Clear it whether we succeeded or not, so
      // a stale token can never be replayed against a later callback.
      'Set-Cookie':
        `${CSRF_COOKIE}=deleted; HttpOnly; Secure; SameSite=Lax; ` +
        `Path=${OAUTH_PATH}; Max-Age=0`,
      // A token is in this HTML. Nothing may store or index it.
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
};

/**
 * Build the `Set-Cookie` value that carries the CSRF state to the callback.
 *
 * `SameSite=Lax` is load-bearing: the callback arrives as a top-level GET
 * navigation from github.com, which is cross-site. `Strict` would withhold the
 * cookie and every sign-in would be rejected as a CSRF attempt.
 * @param {string} csrfToken 32 hex characters.
 * @returns {string} Cookie header value.
 */
export const buildCsrfCookie = (csrfToken) =>
  `${CSRF_COOKIE}=${PROVIDER}_${csrfToken}; HttpOnly; Secure; SameSite=Lax; ` +
  `Path=${OAUTH_PATH}; Max-Age=${CSRF_MAX_AGE}`;

/**
 * Read the CSRF token back out of the request's cookies.
 * @param {Request} request Incoming request.
 * @returns {string | undefined} The token, or `undefined` if absent/malformed.
 */
export const readCsrfToken = (request) =>
  request.headers
    .get('cookie')
    ?.match(new RegExp(`\\b${CSRF_COOKIE}=${PROVIDER}_([0-9a-f]{32})\\b`))?.[1];

/**
 * Read and validate the GitHub OAuth app credentials.
 * @returns {{ clientId: string, clientSecret: string } | undefined} The
 * credentials, or `undefined` when either is missing.
 */
export const getCredentials = () => {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;

  return clientId && clientSecret ? { clientId, clientSecret } : undefined;
};

/**
 * What to do when the credentials are missing or mismatched. Written for the
 * site owner, because they are the only person who can fix it. Plain text —
 * this same string is shown in the admin portal, which renders no markup.
 */
export const MISCONFIGURED_HINT =
  'In Netlify, open the ryanshutter site > Site configuration > Environment ' +
  'variables and add GITHUB_OAUTH_CLIENT_ID and GITHUB_OAUTH_CLIENT_SECRET ' +
  'from the GitHub OAuth App, then Deploys > Trigger deploy. Full steps are in ' +
  'the Admin Portal Owner’s Guide.';
