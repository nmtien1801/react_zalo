import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginService,
  doGetAccountService,
  registerService,
  sendCodeService,
  resetPasswordService,
  changePasswordService,
  verifyEmailService,
} from "../service/authService";
import { uploadAvatarProfileService } from "../service/profileService";

const initialState = {
  userInfo: {},
  isLoggedIn: false, // Kiểm tra xem người dùng đã đăng nhập chưa
  isLoading: false, // Trạng thái loading
};

export const Login = createAsyncThunk(
  "auth/Login",
  async ({ phoneNumber, password }, thunkAPI) => {
    const response = await loginService(phoneNumber, password);
    return response;
  }
);

export const doGetAccount = createAsyncThunk(
  "auth/doGetAccount",
  async (thunkAPI) => {
    const response = await doGetAccountService();
    return response;
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (formData, thunkAPI) => {
    const response = await registerService(formData);
    return response;
  }
);

export const sendCode = createAsyncThunk(
  "auth/sendCode",
  async (email, thunkAPI) => {
    const response = await sendCodeService(email);
    return response;
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ email, code, password }, thunkAPI) => {
    const response = await resetPasswordService(email, code, password);
    return response;
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ phone, currentPassword, newPassword }, thunkAPI) => {
    const response = await changePasswordService(
      phone,
      currentPassword,
      newPassword
    );
    return response;
  }
);

export const uploadAvatarProfile = createAsyncThunk(
  "profile/uploadAvatarProfile",
  async ({ phone, avatar }, thunkAPI) => {
    let response = await uploadAvatarProfileService(phone, avatar);

    return response;
  }
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (email, thunkAPI) => {
    const response = await verifyEmailService(email);
    return response;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,

  extraReducers: (builder) => {
    //  Login
    builder
      .addCase(Login.pending, (state) => {
        state.isLoading = true; // Bắt đầu loading
      })
      .addCase(Login.fulfilled, (state, action) => {
        if (action.payload.EC === 0) {
          state.userInfo = action.payload.DT || {};
          state.isLoggedIn = true;
          state.isLoading = false; // Kết thúc loading
        } else {
          alert(action.payload.EM);
        }
      })
      .addCase(Login.rejected, (state, action) => {
        state.isLoggedIn = false;
        state.isLoading = false; // Kết thúc loading
        alert("Đăng nhập không thành công");
      });

    // doGetAccount
    builder
      .addCase(doGetAccount.pending, (state) => {
        state.isLoading = true; // Bắt đầu loading
      })
      .addCase(doGetAccount.fulfilled, (state, action) => {
        if (action.payload.EC === 0) {
          state.userInfo = action.payload.DT || {};
          console.log("state.userInfo: ", action.payload);

          state.isLoggedIn = true;
          state.isLoading = false; // Kết thúc loading
        }
      })
      .addCase(doGetAccount.rejected, (state, action) => {
        state.isLoggedIn = false;
        state.isLoading = false; // Kết thúc loading
      });

    // Register
    builder
      .addCase(register.pending, (state) => {})
      .addCase(register.fulfilled, (state, action) => {})
      .addCase(register.rejected, (state, action) => {});

    // sendCode
    builder
      .addCase(sendCode.pending, (state) => {})
      .addCase(sendCode.fulfilled, (state, action) => {})
      .addCase(sendCode.rejected, (state, action) => {});

    // resetPassword
    builder
      .addCase(resetPassword.pending, (state) => {})
      .addCase(resetPassword.fulfilled, (state, action) => {})
      .addCase(resetPassword.rejected, (state, action) => {});

    // changePassword
    builder
      .addCase(changePassword.pending, (state) => {})
      .addCase(changePassword.fulfilled, (state, action) => {})
      .addCase(changePassword.rejected, (state, action) => {});

    //uploadAvatarProfile
    builder
      .addCase(uploadAvatarProfile.pending, (state) => {})
      .addCase(uploadAvatarProfile.fulfilled, (state, action) => {
        if (action.payload.EC === 0) {
          state.userInfo.avatar = action.payload.DT || {};
        }
      })
      .addCase(uploadAvatarProfile.rejected, (state, action) => {});

    //verifyEmail
    builder
      .addCase(verifyEmail.pending, (state) => {})
      .addCase(verifyEmail.fulfilled, (state, action) => {})
      .addCase(verifyEmail.rejected, (state, action) => {});
  },
});

// Export actions
export const {} = authSlice.actions;

// Export reducer
export default authSlice.reducer;
