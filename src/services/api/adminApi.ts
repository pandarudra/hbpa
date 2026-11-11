import config from '@/constants/config';
import type {
  AdminUsersQuery,
  AdminUsersResponse,
  ApiErrorResponse,
} from '@/features/authentication/types/auth.types';

export const adminApi = {
  listUsers: async (query: AdminUsersQuery = {}): Promise<AdminUsersResponse> => {
    const params = new URLSearchParams();
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.search) params.set('search', query.search);
    if (query.role) params.set('role', query.role);
    if (query.status) params.set('status', query.status);

    const queryString = params.toString();
    const url = `${config.apiBaseUrl}/api/admin/users${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = (await res.json()) as AdminUsersResponse | ApiErrorResponse;

    if (!res.ok) {
      const err = data as ApiErrorResponse;
      throw {
        code: err.code ?? 'UNKNOWN',
        message: err.message ?? 'Failed to fetch administrative users',
      };
    }

    return data as AdminUsersResponse;
  },
};
