import authReducer, {
  fetchProfile,
  loginUser,
  logout,
  registerUser,
  setAuthIntent,
} from './authSlice';
import { AuthResponse, UserProfile } from './authApi';

const profile: UserProfile = {
  id: 'u-1',
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  phone: '3001234567',
  documentId: '1234567890',
  defaultAddress: null,
  defaultCity: null,
};

const authResponse: AuthResponse = { token: 'signed-token', user: profile };

describe('authSlice', () => {
  it('returns the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual({
      user: null,
      token: null,
      status: 'idle',
      error: null,
      intent: 'direct',
    });
  });

  it('stores the user and token on registerUser.fulfilled', () => {
    const action = registerUser.fulfilled(authResponse, 'req-1', {} as never);
    const state = authReducer(undefined, action);
    expect(state.user).toEqual(profile);
    expect(state.token).toBe('signed-token');
    expect(state.status).toBe('succeeded');
  });

  it('stores the user and token on loginUser.fulfilled', () => {
    const action = loginUser.fulfilled(authResponse, 'req-1', {} as never);
    const state = authReducer(undefined, action);
    expect(state.token).toBe('signed-token');
  });

  it('stores a generic error message on loginUser.rejected', () => {
    const action = loginUser.rejected(new Error('boom'), 'req-1', {} as never, 'El email o la contraseña no coinciden. Revisa e intenta de nuevo.');
    const state = authReducer(undefined, action);
    expect(state.status).toBe('failed');
    expect(state.error).toBe('El email o la contraseña no coinciden. Revisa e intenta de nuevo.');
  });

  it('updates the profile on fetchProfile.fulfilled', () => {
    const action = fetchProfile.fulfilled(profile, 'req-1', 'token');
    const state = authReducer(undefined, action);
    expect(state.user).toEqual(profile);
  });

  it('clears the session on fetchProfile.rejected (expired/stale token)', () => {
    const loggedIn = authReducer(undefined, loginUser.fulfilled(authResponse, 'req-1', {} as never));
    const action = fetchProfile.rejected(new Error('401'), 'req-2', 'token');
    const state = authReducer(loggedIn, action);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('tracks the auth intent', () => {
    const state = authReducer(undefined, setAuthIntent({ pendingProductId: 'p-1' }));
    expect(state.intent).toEqual({ pendingProductId: 'p-1' });
  });

  it('clears the session and intent on logout', () => {
    const loggedIn = authReducer(undefined, loginUser.fulfilled(authResponse, 'req-1', {} as never));
    const state = authReducer(loggedIn, logout());
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.intent).toBe('direct');
  });
});
