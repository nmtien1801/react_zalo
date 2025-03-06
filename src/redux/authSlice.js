import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginService
} from "../service/authService";

const initialState = {
  userInfo: {},
  isLoggedIn: false, // Kiểm tra xem người dùng đã đăng nhập chưa
};

export const Login = createAsyncThunk(
  "auth/Login",
  async ({ phoneNumber, password }, thunkAPI) => {
    const response = await loginService(phoneNumber, password );
    return response;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,

  extraReducers: (builder) => {
    //  Login
    builder
      .addCase(Login.pending, (state) => {})
      .addCase(Login.fulfilled, (state, action) => {
        if (action.payload.EC === 0) {
          state.userInfo = action.payload.DT || {};
          state.isLoggedIn = true;
          localStorage.setItem("access_Token", action.payload.DT.access_Token);
          localStorage.setItem("refresh_Token", action.payload.DT.refresh_Token);
        }
      })
      .addCase(Login.rejected, (state, action) => {});

  },
});

// Export actions
export const {} = authSlice.actions;

// Export reducer
export default authSlice.reducer;
