const BASE = process.env.REACT_APP_API_URL || '';

export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json()
    .catch(() => ({ error: 'Server did not return JSON' }));

  if (!res.ok) {
    const err = new Error(data.error?.message ?? data.error ?? `Server returned ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// ---------- Auth (Matches Go Backend) ----------
export function register(fullName, email, password) {
  return apiFetch('/api/register', {
    method: 'POST',
    body: { full_name: fullName, email, password },
  });
}

export function login(email, password) {
  return apiFetch('/api/login', {
    method: 'POST',
    body: { email, password },
  }); // Returns { message, token, user }
}

// ---------- Categories ----------
export function getCategories() {
  return apiFetch('/api/categories'); // [{ category_id, category_name, image_url }]
}

// ---------- Products ----------
export function getProducts() {
  return apiFetch('/api/products');
}