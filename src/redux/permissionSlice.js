import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllPermissionService,
  getPermissionCurrentService,
} from "../service/permissionService";

const initialState = {
  permission: [],
};

export const getAllPermission = createAsyncThunk(
  "permission/getAllPermission",
  async (thunkAPI) => {
    let response = await getAllPermissionService();

    return response;
  }
);

export const getPermissionCurrent = createAsyncThunk(
  "permission/getPermissionCurrent",
  async (groupId, thunkAPI) => {
    let response = await getPermissionCurrentService(groupId);

    return response;
  }
);

const permissionSlice = createSlice({
  name: "permission",
  initialState,

  extraReducers: (builder) => {
    //  getAllPermission
    builder
      .addCase(getAllPermission.pending, (state) => {})
      .addCase(getAllPermission.fulfilled, (state, action) => {
        state.permission = action.payload.DT || [];
      })
      .addCase(getAllPermission.rejected, (state, action) => {});

    // getPermissionCurrent
    builder
      .addCase(getPermissionCurrent.pending, (state) => {})
      .addCase(getPermissionCurrent.fulfilled, (state, action) => {
        state.permission = action.payload.DT || [];
      })
      .addCase(getPermissionCurrent.rejected, (state, action) => {});
  },
});

// Export actions
export const {} = permissionSlice.actions;

// Export reducer
export default permissionSlice.reducer;
