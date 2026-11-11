/** Structured application error — always serialised by errorHandler middleware. */
export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly statusCode: number,
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'AppError';
  }
}

export const Errors = {
  missingToken: () => new AppError('MISSING_TOKEN', 400, 'idToken is required'),
  invalidToken: (msg?: string) => new AppError('INVALID_TOKEN', 401, msg ?? 'Invalid or expired token'),
  emailNotVerified: () => new AppError('EMAIL_NOT_VERIFIED', 403, 'Your email address is not verified'),
  domainNotAllowed: () =>
    new AppError('DOMAIN_NOT_ALLOWED', 403, 'Access restricted. Please login using your official domain email.'),
  accountDisabled: () => new AppError('ACCOUNT_DISABLED', 403, 'Your account has been disabled'),
  unauthenticated: () => new AppError('UNAUTHENTICATED', 401, 'Authentication required'),
  forbidden: () => new AppError('FORBIDDEN', 403, 'Insufficient permissions'),
  selfRoleChange: () => new AppError('SELF_ROLE_CHANGE', 400, 'You cannot change your own role'),
  invalidRole: () => new AppError('INVALID_ROLE', 400, 'Invalid role value'),
  userNotFound: () => new AppError('USER_NOT_FOUND', 404, 'User not found'),
};
