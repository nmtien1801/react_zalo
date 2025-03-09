import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  message: [],
};

export const getMessages = createAsyncThunk(
  "auth/getMessages",
  async ( thunkAPI) => {
    let response = await axios.get("http://localhost:8080/show/2");
    return response.data;
  }
);

export const sendMessages = createAsyncThunk(
  "auth/sendMessages",
  async ( {clientId, senderId, message},thunkAPI) => {
    let response = await axios.post("http://localhost:8080/send", { clientId, senderId, message });
    return response.data;
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,

  extraReducers: (builder) => {
    //  getMessages
    builder
      .addCase(getMessages.pending, (state) => {})
      .addCase(getMessages.fulfilled, (state, action) => {
        if (action.payload.EC === 0) {
          state.message = action.payload.DT || [];
        }
      })
      .addCase(getMessages.rejected, (state, action) => {});

    //  sendMessages
    builder
      .addCase(sendMessages.pending, (state) => {})
      .addCase(sendMessages.fulfilled, (state, action) => {
        if (action.payload.EC === 0) {
          state.message = action.payload.DT || [];
        }
      })
      .addCase(sendMessages.rejected, (state, action) => {});
  },
});

// Export actions
export const {} = chatSlice.actions;

// Export reducer
export default chatSlice.reducer;
