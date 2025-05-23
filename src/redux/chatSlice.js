import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loadMessagesService,
  getConversationsService,
  updatePermissionService,
  chatGPTService,
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

export const updatePermission = createAsyncThunk(
  "chat/updatePermission",
  async ({ groupId, newPermission }, thunkAPI) => {
    let response = await updatePermissionService(groupId, newPermission);
    return response;
  }
);

export const reloadMessages = createAsyncThunk(
  "chat/reloadMessages",
  async ({ sender, receiver, type }, thunkAPI) => {
    try {
      const response = await loadMessagesService(sender, receiver, type);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Lỗi không xác định"
      );
    }
  }
);

export const chatGPT = createAsyncThunk(
  "chat/chatGPT",
  async (message, thunkAPI) => {
    let response = await chatGPTService(message);
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
      .addCase(loadMessages.pending, (state) => {})
      .addCase(loadMessages.fulfilled, (state, action) => {
        if (action.payload.EC === 0) {
          state.messages = action.payload.DT || [];
        }
      })
      .addCase(loadMessages.rejected, (state, action) => {});

    //  getConversations
    builder.addCase(getConversations.pending, (state) => {});
    builder
      .addCase(getConversations.fulfilled, (state, action) => {
        if (action.payload.EC === 0) {
          state.conversations = action.payload.DT || [];
        }
      })
      .addCase(getConversations.rejected, (state, action) => {});

    // updatePermission
    builder.addCase(updatePermission.pending, (state) => {});
    builder
      .addCase(updatePermission.fulfilled, (state, action) => {
        if (action.payload.EC === 0 && Array.isArray(action.payload.DT)) {
          const updatedConversations = action.payload.DT;

          // Tạo bản sao mới của conversations, thay thế các phần tử trùng receiver._id
          state.conversations = state.conversations.map((oldConv) => {
            const updatedConv = updatedConversations.find(
              (newConv) => newConv.receiver._id === oldConv.receiver._id
            );
            return updatedConv ? updatedConv : oldConv;
          });
        }
      })
      .addCase(updatePermission.rejected, (state, action) => {});

    // reloadMessages
    builder
      .addCase(reloadMessages.pending, (state) => {
        console.log("Đang tải lại messages...");
      })
      .addCase(reloadMessages.fulfilled, (state, action) => {
        if (action.payload.EC === 0) {
          state.messages = action.payload.DT || [];
          console.log("Tải lại messages thành công:", action.payload.DT);
        } else {
          console.error("Lỗi khi tải lại messages:", action.payload.EM);
        }
      })
      .addCase(reloadMessages.rejected, (state, action) => {
        console.error("Lỗi khi tải lại messages:", action.payload);
      });

    // chatGPT
    builder
      .addCase(chatGPT.pending, (state) => {})
      .addCase(chatGPT.fulfilled, (state, action) => {})
      .addCase(chatGPT.rejected, (state, action) => {});
  },
});

// Export actions
export const { updateMessage, deleteMessage } = chatSlice.actions;

// Export reducer
export default chatSlice.reducer;
