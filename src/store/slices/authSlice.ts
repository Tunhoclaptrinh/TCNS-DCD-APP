import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AuthService } from "../../services/auth.service";
import { StorageService } from "../../utils/storage";
import { AuthResponse, LoginRequest, RegisterRequest, User } from "../../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  isInitialized: false,
};

// Async Thunks
export const login = createAsyncThunk<
  AuthResponse,
  LoginRequest,
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await AuthService.login(credentials);
    await StorageService.setToken(response.token);
    await StorageService.setUser(response.user);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Đăng nhập thất bại");
  }
});

export const register = createAsyncThunk<
  AuthResponse,
  RegisterRequest,
  { rejectValue: string }
>("auth/register", async (data, { rejectWithValue }) => {
  try {
    const response = await AuthService.register(data);
    // Usually register doesn't auto-login, but if it does:
    // await StorageService.setToken(response.token);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Đăng ký thất bại");
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await AuthService.logout();
  } catch (error) {
    // console.error(error);
  } finally {
    await StorageService.removeToken();
    await StorageService.removeUser();
  }
});

export const initializeAuth = createAsyncThunk("auth/initialize", async () => {
  const token = await StorageService.getToken();
  if (!token) return null;

  try {
    const user = await AuthService.getMe();
    return { user, token };
  } catch (error) {
    await StorageService.removeToken();
    return null;
  }
});

export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async (user: User, { rejectWithValue }) => {
    try {
      await StorageService.setUser(user);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      // Update User
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      // Initialize
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isInitialized = true;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
        } else {
          state.isAuthenticated = false;
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isInitialized = true;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
