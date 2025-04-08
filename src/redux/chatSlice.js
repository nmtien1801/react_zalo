import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loadMessagesService,
  getConversationsService,
} from "../service/chatService";
import axios from "axios";

const initialState = {
  message: [],
  messages: [],
  conversations: [],
};

export const getMessages = createAsyncThunk(
  "chat/getMessages",
  async (thunkAPI) => {
    let response = await axios.get("http://localhost:8080/show/2");
    return response.data;
  }
);

export const sendMessages = createAsyncThunk(
  "chat/sendMessages",
  async ({ clientId, senderId, message }, thunkAPI) => {
    let response = await axios.post("http://localhost:8080/send", {
      clientId,
      senderId,
      message,
    });
    return response.data;
  }
);

export const loadMessages = createAsyncThunk(
  "chat/loadMessages",
  async ({ sender, receiver, type }, thunkAPI) => {
    let response = await loadMessagesService(sender, receiver, type);
    return response;
  }
);

export const getConversations = createAsyncThunk(
  "chat/getConversations",
  async (sender, thunkAPI) => {
    let response = await getConversationsService(sender);
    return response;
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,

  extraReducers: (builder) => {
    //  getMessages
    builder
      .addCase(getMessages.pending, (state) => { })
      .addCase(getMessages.fulfilled, (state, action) => {
        if (action.payload.EC === 0) {
          state.message = action.payload.DT || [];
        }
      })
      .addCase(getMessages.rejected, (state, action) => { });

    //  sendMessages
    builder
      .addCase(sendMessages.pending, (state) => { })
      .addCase(sendMessages.fulfilled, (state, action) => {
        if (action.payload.EC === 0) {
          state.message = action.payload.DT || [];
        }
      })
      .addCase(sendMessages.rejected, (state, action) => { });

    //  loadMessages
    builder
      .addCase(loadMessages.pending, (state) => { })
      .addCase(loadMessages.fulfilled, (state, action) => {
        if (action.payload.EC === 0) {
          state.messages = action.payload.DT || [];
        }
      })
      .addCase(loadMessages.rejected, (state, action) => { });

    //  getConversations
    builder.addCase(getConversations.pending, (state) => { });
    builder
      .addCase(getConversations.fulfilled, (state, action) => {
        if (action.payload.EC === 0) {
          state.conversations = action.payload.DT || [];
        }
      })
      .addCase(getConversations.rejected, (state, action) => { });
  },
});

// Export actions
export const { } = chatSlice.actions;

// Export reducer
export default chatSlice.reducer;
