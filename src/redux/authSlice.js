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
  async (formData, thunkAPI) => {
    const response = await loginService(formData);
    return response;
  }
);

// export const doGetAccount = createAsyncThunk(
//   "auth/doGetAccount",
//   async (thunkAPI) => {
//     const response = await doGetAccountService();
//     return response;
//   }
// );

// export const logoutUser = createAsyncThunk(
//   "auth/logoutUser",
//   async (thunkAPI) => {
//     const response = await logoutUserService();
//     return response;
//   }
// );

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

    // doGetAccount
    // builder
    //   .addCase(doGetAccount.pending, (state) => {})
    //   .addCase(doGetAccount.fulfilled, (state, action) => {
    //     if (action.payload.EC === 0) {
    //       state.userInfo = action.payload.DT || {};
    //       state.isLoggedIn = true;
    //     }
    //   })
    //   .addCase(doGetAccount.rejected, (state, action) => {});

    // logoutUser
    // builder
    //   .addCase(logoutUser.pending, (state) => {})
    //   .addCase(logoutUser.fulfilled, (state, action) => {
    //     if (action.payload.EC === 0) {
    //       state.userInfo = {};
    //       state.isLoggedIn = false;
    //       localStorage.removeItem("access_Token");
    //       localStorage.removeItem("refresh_Token");
    //     }
    //   })
    //   .addCase(logoutUser.rejected, (state, action) => {});
  },
});

// Export actions
export const {} = authSlice.actions;

// Export reducer
export default authSlice.reducer;
