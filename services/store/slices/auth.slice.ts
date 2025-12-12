
import { createSlice } from '../createStore';
import { AuthState, User } from '../types';

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  status: 'idle',
  error: null
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state) => ({ ...state, status: 'loading' as const }),

    loginSuccess: (state, payload: { user: User; token: string; refreshToken: string }) => ({
      ...state,
      user: payload.user,
      token: payload.token,
      refreshToken: payload.refreshToken,
      isAuthenticated: true,
      status: 'success' as const,
      error: null
    }),

    loginFailure: (state, error: string) => ({
      ...state,
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      status: 'error' as const,
      error
    }),

    logout: () => initialState,

    refreshTokenSuccess: (state, payload: { token: string; refreshToken: string }) => ({
      ...state,
      token: payload.token,
      refreshToken: payload.refreshToken,
      error: null
    }),

    refreshTokenFailure: (state) => ({
      ...state,
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      status: 'error' as const,
      error: 'Session expired'
    }),

    updateUser: (state, user: Partial<User>) => ({
      ...state,
      user: state.user ? { ...state.user, ...user } : null
    }),

    setToken: (state, token: string) => ({
      ...state,
      token
    }),

    clearError: (state) => ({
      ...state,
      error: null
    })
  }
});

export const authActions = authSlice.actions;
export const authReducer = authSlice.reducer;

// Selectors
export const authSelectors = {
  selectUser: (state: AuthState) => state.user,

  selectToken: (state: AuthState) => state.token,

  selectIsAuthenticated: (state: AuthState) => state.isAuthenticated,

  selectStatus: (state: AuthState) => state.status,

  selectError: (state: AuthState) => state.error,

  selectUserRole: (state: AuthState) => state.user?.role,

  selectUserPermissions: (state: AuthState) => state.user?.permissions || [],

  selectUserClearance: (state: AuthState) => state.user?.clearance,

  hasPermission: (state: AuthState, permission: string) =>
    state.user?.permissions.includes(permission) || false,

  hasRole: (state: AuthState, role: string) => state.user?.role === role
};
