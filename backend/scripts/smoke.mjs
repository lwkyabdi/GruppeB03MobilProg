// Run against a local backend. Creates two test accounts, removes their film entry.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const base = process.env.SMOKE_API_URL ?? 'http://localhost:5173';
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname))
  throw new Error('Smoke-testen er begrenset til lokal backend.');
async function call(path, { token, body, method = 'GET' } = {}) {
  return fetch(`${base}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Origin: 'moviemate://',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  });
}
async function account() {
  const email = `smoke-${randomUUID()}@example.com`;
  const password = randomUUID();
  const created = await call('/api/auth/sign-up/email', {
    method: 'POST',
    body: { name: 'Lokal API-test', email, password },
  });
  assert.equal(created.status, 200, 'registrering');
  const registeredToken = created.headers.get('set-auth-token');
  assert.ok(registeredToken, 'token-header ved registrering');
  await call('/api/auth/sign-out', {
    token: registeredToken,
    method: 'POST',
    body: {},
  });
  const response = await call('/api/auth/sign-in/email', {
    method: 'POST',
    body: { email, password },
  });
  assert.equal(response.status, 200, 'innlogging');
  const token = response.headers.get('set-auth-token');
  assert.ok(token, 'token-header ved innlogging');
  return token;
}
const status = await call('/api/status');
assert.equal(status.status, 200);
assert.equal((await call('/api/v1/watchlist')).status, 401);
assert.equal((await call('/api/v1/movies?query=Matrix')).status, 401);
const token = await account();
const other = await account();
assert.equal((await call('/api/me', { token })).status, 200);
const created = await call('/api/v1/watchlist', {
  token,
  method: 'POST',
  body: { tmdbId: 603, title: 'The Matrix', posterPath: null },
});
assert.equal(created.status, 201);
const entry = (await created.json()).data;
try {
  assert.equal(
    (
      await call(`/api/v1/watchlist/${entry.id}`, {
        token: other,
        method: 'PATCH',
        body: { favorite: true },
      })
    ).status,
    403,
  );
  assert.equal((await call('/api/v1/watchlist', { token: other })).status, 200);
  assert.equal(
    (await (await call('/api/v1/watchlist', { token: other })).json()).data
      .length,
    0,
  );
  const updated = await call(`/api/v1/watchlist/${entry.id}`, {
    token,
    method: 'PATCH',
    body: {
      favorite: true,
      status: 'completed',
      rating: 9,
      comment: 'API-test',
    },
  });
  assert.equal(updated.status, 200);
  const list = await (await call('/api/v1/watchlist', { token })).json();
  assert.ok(
    list.data.some(
      (item) => item.id === entry.id && item.favorite && item.rating === 9,
    ),
  );
  assert.equal(
    (
      await call(`/api/v1/watchlist/${entry.id}`, {
        token,
        method: 'PATCH',
        body: { rating: 11 },
      })
    ).status,
    400,
  );
  for (const path of [
    '/api/v1/movies?query=Matrix',
    '/api/v1/movies/popular',
    '/api/v1/movies/603',
  ]) {
    const response = await call(path, { token });
    assert.equal(response.status, 200, `TMDB: ${path}`);
    assert.equal((await response.json()).ok, true);
  }
  console.log(
    'OK: registrering, innlogging, token, CRUD, validering, eierskap og TMDB.',
  );
} finally {
  await call(`/api/v1/watchlist/${entry.id}`, { token, method: 'DELETE' });
  await call('/api/auth/sign-out', { token, method: 'POST', body: {} });
  await call('/api/auth/sign-out', { token: other, method: 'POST', body: {} });
}
assert.equal((await call('/api/me', { token })).status, 401);
console.log(
  'OK: utlogget token er avvist. To lokale testkontoer er beholdt uten filmdata.',
);
