import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SESSION_KEY = 'hbp_session_exists';

/**
 * Mark that a backend session cookie exists.
 * We only store a boolean — the actual session lives in the HttpOnly cookie.
 * On web, expo-secure-store falls back to a non-sensitive localStorage entry,
 * which is acceptable because this marker carries no credentials.
 */
export async function markSessionExists(): Promise<void> {
  if (Platform.OS === 'web') {
    // On web the session cookie is HttpOnly — this marker is just a hint.
    try { localStorage.setItem(SESSION_KEY, '1'); } catch { /* ignore */ }
    return;
  }
  await SecureStore.setItemAsync(SESSION_KEY, '1');
}

export async function clearSessionMarker(): Promise<void> {
  if (Platform.OS === 'web') {
    try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
    return;
  }
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

export async function hasSessionMarker(): Promise<boolean> {
  if (Platform.OS === 'web') {
    try { return localStorage.getItem(SESSION_KEY) === '1'; } catch { return false; }
  }
  const val = await SecureStore.getItemAsync(SESSION_KEY);
  return val === '1';
}
