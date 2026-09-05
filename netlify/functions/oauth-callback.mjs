/**
 * Step 2 of the admin portal's GitHub sign-in: trade the code for a token.
 *
 * Served at `/oauth/callback` (see the rewrite in netlify.toml). This is the
 * URL registered as the Authorization callback URL on the GitHub OAuth App, so
 * changing the path here means changing it on GitHub too.
 *
 * This is the only place the client *secret* is ever read. It lives in a
 * Netlify environment variable and never reaches the browser: the exchange
 * happens server-side and only the resulting access token is handed to the CMS,
 * via a postMessage aimed at this site's own origin.
 */
import {
  MISCONFIGURED_HINT,
  getCredentials,
  readCsrfToken,
  renderResult,
} from '../oauth-shared.mjs';

/**
 * Netlify Functions 2.0 handler.
 * @param {Request} request Incoming request.
 * @returns {Promise<Response>} The popup's final page, carrying either the
 * access token or a readable explanation of what went wrong.
 */
const handler = async (request) => {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const csrfToken = readCsrfToken(request);

  // GitHub reports a refused authorization in the query string rather than by
  // failing the request, so this is the "the owner clicked Cancel" path as well
  // as the genuine-error one.
  const oauthError = searchParams.get('error');

  if (oauthError) {
    return renderResult({
      request,
      error:
        searchParams.get('error_description') ??
        `GitHub refused the sign-in request (${oauthError}).`,
      errorCode: 'AUTH_CODE_REQUEST_FAILED',
      hint: 'If you clicked Cancel on GitHub, just close this window and try again.',
    });
  }

  if (!code || !state) {
    return renderResult({
      request,
      error: 'GitHub did not send back an authorization code.',
      errorCode: 'AUTH_CODE_REQUEST_FAILED',
      hint: 'Close this window and click Sign in with GitHub again.',
    });
  }

  // The state must match the cookie set by oauth-auth.mjs. A missing cookie is
  // as much a failure as a mismatched one: it means this callback did not
  // follow a sign-in we started (a replayed link, a forged request, or a
  // sign-in left open for more than ten minutes).
  if (!csrfToken || state !== csrfToken) {
    return renderResult({
      request,
      error: 'This sign-in could not be verified, so it was stopped.',
      errorCode: 'CSRF_DETECTED',
      hint:
        'This is usually harmless: the sign-in window sat open too long, or was ' +
        'opened twice. Close it and click Sign in with GitHub again. If it keeps ' +
        'happening, check that your browser is not blocking cookies for this site.',
    });
  }

  const credentials = getCredentials();

  if (!credentials) {
    return renderResult({
      request,
      error: 'This site has no GitHub sign-in keys configured, so the sign-in cannot be completed.',
      errorCode: 'MISCONFIGURED_CLIENT',
      hint: MISCONFIGURED_HINT,
    });
  }

  let response;

  try {
    response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        // Without this Accept header GitHub answers in form-urlencoded, not
        // JSON, and the parse below would fail on every successful sign-in.
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
      }),
    });
  } catch {
    return renderResult({
      request,
      error: 'Could not reach GitHub to finish signing in.',
      errorCode: 'TOKEN_REQUEST_FAILED',
      hint: 'Check your internet connection, or GitHub’s status page, then try again.',
    });
  }

  let payload;

  try {
    payload = await response.json();
  } catch {
    return renderResult({
      request,
      error: 'GitHub sent back something this site could not read.',
      errorCode: 'MALFORMED_RESPONSE',
      hint: 'Try again in a minute. If it persists, GitHub may be having problems.',
    });
  }

  const token = payload?.access_token;

  if (!token) {
    // GitHub's most common answer here is `incorrect_client_credentials`, which
    // means the client ID and secret in Netlify do not belong to the same OAuth
    // App — worth naming, because it looks identical to "sign-in is broken".
    const reason =
      payload?.error_description ?? payload?.error ?? 'GitHub did not return an access token.';

    return renderResult({
      request,
      error: `GitHub refused to issue an access token: ${reason}`,
      errorCode: 'TOKEN_REQUEST_FAILED',
      hint:
        payload?.error === 'incorrect_client_credentials'
          ? MISCONFIGURED_HINT
          : 'Close this window and try signing in again.',
    });
  }

  return renderResult({ request, token });
};

export default handler;
