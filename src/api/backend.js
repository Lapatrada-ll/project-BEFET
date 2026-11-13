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

// ---------- Favorites (Wishlist) ----------
export function getFavorites(token) {
  return apiFetch('/api/favorites', { token }); // returns [product_id, ...]
}

export function addFavorite(productId, token) {
  return apiFetch('/api/favorites', {
    method: 'POST',
    body: { product_id: productId },
    token,
  });
}

export function removeFavorite(productId, token) {
  return apiFetch(`/api/favorites/${productId}`, {
    method: 'DELETE',
    token,
  });
}


// ---------- Reviews & Admin ----------
export function getReviews() {
  return apiFetch('/api/reviews');
}

export function createReview(productId, rating, comment, token) {
  return apiFetch('/api/reviews', {
    method: 'POST',
    body: { productId, rating, comment },
    token,
  });
}

export function updateReview(id, reviewData, token) {
  return apiFetch(`/api/admin/reviews/${id}`, {
    method: 'PUT',
    body: reviewData,
    token,
  });
}

export function deleteReview(id, token) {
  return apiFetch(`/api/admin/reviews/${id}`, {
    method: 'DELETE',
    token,
  });
}

export function getAdminUsers(token) {
  return apiFetch('/api/admin/users', { token });
}

export function updateAdminUser(id, userData, token) {
  return apiFetch(`/api/admin/users/${id}`, {
    method: 'PUT',
    body: userData,
    token,
  });
}

export function deleteAdminUser(id, token) {
  return apiFetch(`/api/admin/users/${id}`, {
    method: 'DELETE',
    token,
  });
}

export function getAdminOrders(token) {
  return apiFetch('/api/admin/orders', { token });
}

export function createProduct(productData, token) {
  return apiFetch('/api/admin/products', {
    method: 'POST',
    body: productData,
    token,
  });
}

export function updateProduct(id, productData, token) {
  return apiFetch(`/api/admin/products/${id}`, {
    method: 'PUT',
    body: productData,
    token,
  });
}

export function deleteProduct(id, token) {
  return apiFetch(`/api/admin/products/${id}`, {
    method: 'DELETE',
    token,
  });
}

export function createCategory(categoryData, token) {
  return apiFetch('/api/admin/categories', {
    method: 'POST',
    body: categoryData,
    token,
  });
}

export function updateCategory(id, categoryData, token) {
  return apiFetch(`/api/admin/categories/${id}`, {
    method: 'PUT',
    body: categoryData,
    token,
  });
}

export function deleteCategory(id, token) {
  return apiFetch(`/api/admin/categories/${id}`, {
    method: 'DELETE',
    token,
  });
}

export function createAdminUser(userData, token) {
  return apiFetch('/api/admin/users', {
    method: 'POST',
    body: userData,
    token,
  });
}