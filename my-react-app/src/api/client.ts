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
export const fetchCategoriesApi = () => request('/categories');
export const createMenuItemApi = (body: {
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  preparationTime?: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
}) => request('/items', {
  method: 'POST',
  body: JSON.stringify(body),
});
export const updateMenuItemApi = (menuItemId: string, body: {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  preparationTime?: number;
  isAvailable?: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
}) => request(`/items/${menuItemId}`, {
  method: 'PUT',
  body: JSON.stringify(body),
});
export const deleteMenuItemApi = (menuItemId: string) => request(`/items/${menuItemId}`, {
  method: 'DELETE',
});
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
  groupIds?: string[];
}) => request('/auth/users', {
  method: 'POST',
  body: JSON.stringify(body),
});
export const changePasswordApi = (userId: string, body: { oldPassword?: string; newPassword: string }) =>
  request(`/auth/users/${userId}/password`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
export const fetchOrdersApi = (params?: { status?: string; active?: boolean; tableId?: string }) => {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.active) query.set('active', 'true');
  if (params?.tableId) query.set('tableId', params.tableId);
  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request(`/orders${queryString}`);
};
export const createOrderApi = (body: {
  orderType?: string;
  tableId?: string | null;
  userId: string;
  items: Array<{ menuItemId: string; quantity: number; specialInstructions?: string }>;
  notes?: string;
}) => request('/orders', {
  method: 'POST',
  body: JSON.stringify(body),
});
export const updateOrderApi = (orderId: string, body: {
  status?: string;
  totalAmount?: number;
  taxAmount?: number;
  discountAmount?: number;
  notes?: string;
}) => request(`/orders/${orderId}`, {
  method: 'PUT',
  body: JSON.stringify(body),
});
export const updateOrderStatusApi = (orderId: string, status: string) =>
  request(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
export const updateOrderPaymentStatusApi = (orderId: string, paymentStatus: string) =>
  request(`/orders/${orderId}/payment`, {
    method: 'PATCH',
    body: JSON.stringify({ paymentStatus }),
  });
export const fetchGroupsApi = () => request('/groups');
export const createGroupApi = (body: { name: string; description?: string }) =>
  request('/groups', {
    method: 'POST',
    body: JSON.stringify(body),
  });
export const assignUsersToGroupApi = (groupId: string, userIds: string[]) =>
  request(`/groups/${groupId}/users`, {
    method: 'POST',
    body: JSON.stringify({ userIds }),
  });
export const fetchNotificationsApi = () => request('/notifications');
