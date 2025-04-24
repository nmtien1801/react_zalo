import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllPermissionService } from "../service/permissionService";

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
  },
});

// Export actions
export const {} = permissionSlice.actions;

// Export reducer
export default permissionSlice.reducer;
