const API_PREFIX = '/api';

function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('authToken');
}

async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_PREFIX}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.error || response.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export const loginApi = (email: string, password: string) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const fetchMenuItemsApi = () => request('/items');
export const fetchTablesApi = () => request('/tables');
export const fetchUsersApi = () => request('/auth/users');
export const createUserApi = (body: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  isActive?: boolean;
}) => request('/auth/users', {
  method: 'POST',
  body: JSON.stringify(body),
});
export const fetchOrdersApi = () => request('/orders');
export const fetchNotificationsApi = () => request('/notifications');
