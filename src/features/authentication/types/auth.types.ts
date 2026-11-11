export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'DISABLED';

export interface AppUser {
  uid: string;
  email: string;
  name: string;
  avatarUrl: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface AuthState {
  user: AppUser | null;
  isLoading: boolean;
  error: AuthError | null;
}

export type AuthErrorCode =
  | 'DOMAIN_NOT_ALLOWED'
  | 'EMAIL_NOT_VERIFIED'
  | 'INVALID_TOKEN'
  | 'ACCOUNT_DISABLED'
  | 'NETWORK_ERROR'
  | 'CANCELLED'
  | 'UNKNOWN';

export interface AuthError {
  code: AuthErrorCode;
  message: string;
}

/** What the backend returns from POST /api/auth/google and GET /api/auth/me */
export interface AuthApiResponse {
  success: true;
  user: AppUser;
}

export interface ApiErrorResponse {
  success: false;
  code: string;
  message: string;
}

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string | null;
  lastLoginAt: string | null;
}

export interface AdminPagination {
  currentPage: number;
  pageSize: number;
  totalUsers: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface AdminUsersResponse {
  success: true;
  data: {
    users: AdminUserItem[];
    pagination: AdminPagination;
  };
}
