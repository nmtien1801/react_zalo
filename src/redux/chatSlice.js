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

export const getConversationsByMember = createAsyncThunk(
  "chat/getConversationsByMember",
  async (sender, thunkAPI) => {
    let response = await getConversationsByMemberService(sender);
    return response;
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,

  reducers: {
    // Cập nhật nội dung tin nhắn
    updateMessage: (state, action) => {
      const { id, updatedMessage } = action.payload;
      state.messages = state.messages.map((msg) =>
        msg._id === id ? { ...msg, ...updatedMessage } : msg
      );
    },
    // Xóa tin nhắn
    deleteMessage: (state, action) => {
      const id = action.payload;
      state.messages = state.messages.filter((msg) => msg._id !== id);
    },
  },

  extraReducers: (builder) => {


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
export const { updateMessage, deleteMessage } = chatSlice.actions;

// Export reducer
export default chatSlice.reducer;
