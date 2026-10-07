import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authApi, LoginPayload, RegisterPayload, UserProfile } from './authApi';

export type AuthIntent = 'direct' | { pendingProductId: string };

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  /** Where "Ingresar"/"Pagar" sent the user — drives where login/register redirect back to (spec §11.1). */
  intent: AuthIntent;
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: 'idle',
  error: null,
  intent: 'direct',
};

const GENERIC_LOGIN_ERROR = 'El email o la contraseña no coinciden. Revisa e intenta de nuevo.';

export const registerUser = createAsyncThunk('auth/register', async (payload: RegisterPayload) => authApi.register(payload));

export const loginUser = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      return await authApi.login(payload);
    } catch {
      return rejectWithValue(GENERIC_LOGIN_ERROR);
    }
  },
);

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (token: string) => authApi.fetchProfile(token));

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthIntent(state, action: { payload: AuthIntent }) {
      state.intent = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.intent = 'direct';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'No pudimos crear tu cuenta.';
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string | undefined) ?? GENERIC_LOGIN_ERROR;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(fetchProfile.rejected, (state) => {
        // Stored token is stale/expired — drop the session silently, no error banner on boot.
        state.user = null;
        state.token = null;
      });
  },
});

export const { setAuthIntent, logout } = authSlice.actions;
export default authSlice.reducer;
