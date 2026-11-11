import { markSessionExists, clearSessionMarker, hasSessionMarker } from '../../src/features/authentication/utils/sessionStorage';

describe('sessionStorage utils on web', () => {
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
