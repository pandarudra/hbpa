import { Platform } from 'react-native';
import { markSessionExists, clearSessionMarker, hasSessionMarker } from '../../src/features/authentication/utils/sessionStorage';

describe('sessionStorage utils on web', () => {
  const store: Record<string, string> = {};

  beforeAll(() => {
    Object.defineProperty(Platform, 'OS', { value: 'web', writable: true });
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: jest.fn((k: string) => store[k] ?? null),
        setItem: jest.fn((k: string, v: string) => {
          store[k] = v;
        }),
        removeItem: jest.fn((k: string) => {
          delete store[k];
        }),
        clear: jest.fn(() => {
          Object.keys(store).forEach((k) => delete store[k]);
        }),
      },
      writable: true,
    });
  });

  beforeEach(() => {
    localStorage.clear();
  });

  it('marks session as existing', async () => {
    expect(await hasSessionMarker()).toBe(false);
    await markSessionExists();
    expect(await hasSessionMarker()).toBe(true);
  });

  it('clears session marker', async () => {
    await markSessionExists();
    expect(await hasSessionMarker()).toBe(true);
    await clearSessionMarker();
    expect(await hasSessionMarker()).toBe(false);
  });
});
