import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  uploadAvatarService,
  uploadProfileService,
} from "../service/profileService";

const initialState = {};

export const uploadAvatar = createAsyncThunk(
  "profile/uploadAvatar",
  async ({ formData }, thunkAPI) => {
    let response = await uploadAvatarService(formData);

    return response;
  }
);

export const uploadProfile = createAsyncThunk(
  "profile/uploadProfile",
  async (formData, thunkAPI) => {
    let response = await uploadProfileService(formData);

    return response;
  }
);

const chatSlice = createSlice({
  name: "profile",
  initialState,

  extraReducers: (builder) => {
    //  uploadAvatar
    builder
      .addCase(uploadAvatar.pending, (state) => {})
      .addCase(uploadAvatar.fulfilled, (state, action) => {})
      .addCase(uploadAvatar.rejected, (state, action) => {});
  },
});

// Export actions
export const {} = chatSlice.actions;

// Export reducer
export default chatSlice.reducer;
