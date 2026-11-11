import React from 'react';
import { render } from '@testing-library/react-native';
import DashboardScreen from '../../app/(protected)/dashboard';
import { useAuth } from '@/providers/AuthProvider';

jest.mock('@/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => `Redirect to ${href}`,
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: Object.assign(jest.fn(), {
    error: jest.fn(),
    success: jest.fn(),
  }),
}));

describe('User Dashboard Screen (/dashboard)', () => {
  const mockSignOut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders minimal dashboard with dynamic name and confirmation message for USER role', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        uid: 'user_1',
        name: 'Debansh Mohanty',
        email: 'debansh@hbplus.fit',
        role: 'USER',
        status: 'ACTIVE',
        avatarUrl: null,
      },
      signOut: mockSignOut,
    });

    const { getByText, queryByText, getAllByText } = render(<DashboardScreen />);

    // Brand and eyebrow
    expect(getByText('HORIZON')).toBeTruthy();
    expect(getByText('WELCOME TO HORIZON')).toBeTruthy();

    // Dynamic greeting and confirmation
    expect(getByText('Welcome back, Debansh.')).toBeTruthy();
    expect(
      getByText('Your official organization account is successfully authenticated.'),
    ).toBeTruthy();

    // Exactly one Sign Out button in header
    const signOutButtons = getAllByText('Sign Out');
    expect(signOutButtons.length).toBe(1);

    // Verify telemetry, email, domain, or extraneous widgets are NOT rendered
    expect(queryByText('debansh@hbplus.fit')).toBeNull();
    expect(queryByText('Session & Account Telemetry')).toBeNull();
    expect(queryByText('Domain Verification')).toBeNull();
    expect(queryByText('Account Status')).toBeNull();
    expect(queryByText('Identity Provider')).toBeNull();
    expect(queryByText('Member Since')).toBeNull();
    expect(queryByText('Last Authenticated')).toBeNull();
  });

  it('redirects ADMIN users to /admin', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        uid: 'admin_1',
        name: 'Admin Boss',
        email: 'admin@hbplus.fit',
        role: 'ADMIN',
        status: 'ACTIVE',
      },
      signOut: mockSignOut,
    });

    const { toJSON } = render(<DashboardScreen />);
    expect(JSON.stringify(toJSON())).toContain('Redirect to /admin');
  });
});
