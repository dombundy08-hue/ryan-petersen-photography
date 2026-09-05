/**
 * Step 1 of the admin portal's GitHub sign-in: send the owner to GitHub.
 *
 * Served at `/oauth/auth` (see the rewrite in netlify.toml). Sveltia CMS opens
 * this in a popup with `?provider=github&site_id=<hostname>&scope=repo,user`
 * and expects a redirect to GitHub's authorize page.
 *
 * Nothing secret is exposed here — the client ID is public by design — but the
 * CSRF `state` is minted here and checked in oauth-callback.mjs, so the two
 * files have to agree on the cookie. Both read it from netlify/oauth-shared.mjs.
 */
import {
  MISCONFIGURED_HINT,
  PROVIDER,
  buildCsrfCookie,
  getAllowedOrigins,
  getCredentials,
  getScope,
  renderResult,
} from '../oauth-shared.mjs';

/**
 * Netlify Functions 2.0 handler.
 * @param {Request} request Incoming request.
 * @returns {Promise<Response>} Redirect to GitHub, or a readable failure page.
 */
const handler = async (request) => {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider');
  const siteId = searchParams.get('site_id');

  // Sveltia always sends `provider`. Anything else reaching this URL is either
  // a misconfigured `backend.name` or a stray visitor, and both are worth
  // saying out loud rather than redirecting into a confusing GitHub screen.
  if (provider && provider !== PROVIDER) {
    return renderResult({
      request,
      error: `This site can only sign in with GitHub, but the admin portal asked for "${provider}".`,
      errorCode: 'UNSUPPORTED_BACKEND',
      hint: 'Check backend.name in public/admin/config.yml.',
    });
  }

  const credentials = getCredentials();

  if (!credentials) {
    return renderResult({
      request,
      error: 'This site has no GitHub sign-in keys configured yet, so sign-in cannot start.',
      errorCode: 'MISCONFIGURED_CLIENT',
      hint: MISCONFIGURED_HINT,
    });
  }

  // `site_id` is the hostname of the page that opened the popup. It is supplied
  // by the caller and so proves nothing on its own — the real protection is the
  // postMessage target origin in renderResult() and the callback URL pinned on
  // the GitHub OAuth App. Checking it anyway turns the common misconfiguration
  // (base_url pointing at a different domain from /admin/) into a readable
  // message here, instead of a token that later has nowhere to be delivered.
  const allowedHosts = getAllowedOrigins(request).map((origin) => new URL(origin).hostname);

  if (siteId && !allowedHosts.includes(siteId)) {
    return renderResult({
      request,
      error: `The admin portal is running on "${siteId}", which this sign-in helper is not configured to serve.`,
      errorCode: 'UNSUPPORTED_DOMAIN',
      hint:
        `Expected ${allowedHosts.join(' or ')}. Either open the portal on that ` +
        'address, or add this one to the CMS_ALLOWED_ORIGINS environment ' +
        'variable in Netlify.',
    });
  }

  // 32 hex characters — the shape oauth-callback.mjs matches the cookie against.
  const csrfToken = globalThis.crypto.randomUUID().replaceAll('-', '');

  const params = new URLSearchParams({
    client_id: credentials.clientId,
    scope: getScope(searchParams.get('scope')),
    state: csrfToken,
  });

  // `redirect_uri` is deliberately omitted. GitHub falls back to the callback
  // URL registered on the OAuth App, so there is exactly one place that value
  // is written down and no way for the two to drift apart and produce a
  // `redirect_uri_mismatch` the owner cannot debug.
  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://github.com/login/oauth/authorize?${params}`,
      'Set-Cookie': buildCsrfCookie(csrfToken),
      'Cache-Control': 'no-store',
    },
  });
};

export default handler;
