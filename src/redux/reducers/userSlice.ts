/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "@/utils/axios";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { RootState } from "../store";

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserState {
  user: User | null;
  accessToken: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: UserState = {
  user: null,
  accessToken: null,
  status: "idle",
  error: null,
};

// Define response types
interface AuthResponse {
  id: number;
  name: string;
  email: string;
  token: string;
}

// Async thunk for register
export const registerUser = createAsyncThunk(
  "user/register",
  async (
    { name, email, password }: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      console.log("Registering user:", { name, email });
      const response = await apiClient.post<AuthResponse>("/users/register", {
        name,
        email,
        password,
      });

      console.log("Register response:", response);

      if (response && response.token) {
        Cookies.remove("admin_token"); // Clear admin token
        Cookies.set("access_token", response.token);
        return response;
      } else {
        return rejectWithValue("Registration response is missing token");
      }
    } catch (error: any) {
      console.error("Register error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    }
  }
);

// Async thunk for login
export const loginUser = createAsyncThunk(
  "user/login",
  async (
    { username, password }: { username: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      console.log("Logging in user:", { email: username });
      const response = await apiClient.post<AuthResponse>("/users/login", {
        email: username, // Using username as email
        password,
      });

      console.log("Login response:", response);

      if (response && response.token) {
        Cookies.remove("admin_token"); // Clear admin token
        Cookies.set("access_token", response.token);
        return response;
      } else {
        return rejectWithValue("Login response is missing token");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      Cookies.remove("access_token");
      localStorage.removeItem("persist:user");
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<any>) => {
        console.log("Login fulfilled with payload:", action.payload);
        state.status = "succeeded";
        state.user = action.payload;
        state.accessToken = action.payload.token;
        Cookies.set("access_token", action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action: PayloadAction<any>) => {
        console.log("Login rejected with payload:", action.payload);
        state.status = "failed";
        state.error = action.payload;
      })

      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<any>) => {
        console.log("Register fulfilled with payload:", action.payload);
        state.status = "succeeded";
        state.user = action.payload;
        state.accessToken = action.payload.token;
        Cookies.set("access_token", action.payload.token);
      })
      .addCase(registerUser.rejected, (state, action: PayloadAction<any>) => {
        console.log("Register rejected with payload:", action.payload);
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { logout } = userSlice.actions;

// Selectors to access the state
export const selectUser = (state: RootState) => state.user.user;
export const selectAccessToken = (state: RootState) => state.user.accessToken;
export const selectAuthStatus = (state: RootState) => state.user.status;
export const selectAuthError = (state: RootState) => state.user.error;

export default userSlice.reducer;
