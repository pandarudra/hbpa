import React from 'react';
import { Text, Pressable } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '@/theme';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { ProfileMenuModal } from '@/components/common/ProfileMenuModal';
import { MobileFilterSheet } from '@/components/common/MobileFilterSheet';

function TestConsumer() {
  const { mode, isDark, colors, setThemeMode, toggleTheme } = useTheme();
  return (
    <>
      <Text testID="mode">{mode}</Text>
      <Text testID="isDark">{String(isDark)}</Text>
      <Text testID="bg">{colors.background}</Text>
      <Pressable testID="btn-dark" onPress={() => setThemeMode('dark')}>
        <Text>Set Dark</Text>
      </Pressable>
      <Pressable testID="btn-light" onPress={() => setThemeMode('light')}>
        <Text>Set Light</Text>
      </Pressable>
      <Pressable testID="btn-toggle" onPress={toggleTheme}>
        <Text>Toggle</Text>
      </Pressable>
    </>
  );
}

describe('Horizon Theme System & Components', () => {
  it('provides default theme state and allows switching between light and dark modes', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    // Initial state (defaults to system)
    expect(getByTestId('mode').props.children).toBe('system');

    // Switch to dark mode
    act(() => {
      fireEvent.press(getByTestId('btn-dark'));
    });
    expect(getByTestId('mode').props.children).toBe('dark');
    expect(getByTestId('isDark').props.children).toBe('true');
    expect(getByTestId('bg').props.children).toBe('#10131B');

    // Switch to light mode
    act(() => {
      fireEvent.press(getByTestId('btn-light'));
    });
    expect(getByTestId('mode').props.children).toBe('light');
    expect(getByTestId('isDark').props.children).toBe('false');
    expect(getByTestId('bg').props.children).toBe('#F7F5F0');

    // Toggle theme
    act(() => {
      fireEvent.press(getByTestId('btn-toggle'));
    });
    expect(getByTestId('isDark').props.children).toBe('true');
  });

  it('renders ThemeToggle button properly', () => {
    const { getByRole } = render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const button = getByRole('button');
    expect(button).toBeTruthy();
  });

  it('renders ProfileMenuModal with user info and appearance controls', () => {
    const mockSignOut = jest.fn();
    const mockClose = jest.fn();

    const { getByText } = render(
      <ThemeProvider>
        <ProfileMenuModal
          visible={true}
          onClose={mockClose}
          user={{
            displayName: 'Rudra Narayan',
            email: 'rudra@hbplus.fit',
            role: 'ADMIN',
          }}
          onSignOut={mockSignOut}
        />
      </ThemeProvider>,
    );

    expect(getByText('Rudra Narayan')).toBeTruthy();
    expect(getByText('rudra@hbplus.fit')).toBeTruthy();
    expect(getByText('ADMIN')).toBeTruthy();
    expect(getByText('APPEARANCE')).toBeTruthy();
    expect(getByText('Light')).toBeTruthy();
    expect(getByText('Dark')).toBeTruthy();
    expect(getByText('System')).toBeTruthy();

    const signOutBtn = getByText('Sign Out');
    fireEvent.press(signOutBtn);
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('renders MobileFilterSheet and allows selecting and applying filters', () => {
    const mockApply = jest.fn();
    const mockReset = jest.fn();
    const mockClose = jest.fn();

    const { getByText } = render(
      <ThemeProvider>
        <MobileFilterSheet
          visible={true}
          onClose={mockClose}
          selectedRole="ALL"
          selectedStatus="ALL"
          onApply={mockApply}
          onReset={mockReset}
        />
      </ThemeProvider>,
    );

    expect(getByText('Filter Users')).toBeTruthy();
    expect(getByText('ROLE')).toBeTruthy();
    expect(getByText('ACCOUNT STATUS')).toBeTruthy();

    // Select role Admin
    fireEvent.press(getByText('Admin'));
    // Select status Active
    fireEvent.press(getByText('Active'));

    // Apply
    fireEvent.press(getByText('Apply filters'));
    expect(mockApply).toHaveBeenCalledWith('ADMIN', 'ACTIVE');
  });
});
