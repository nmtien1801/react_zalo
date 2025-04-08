import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import chatReducer from "./chatSlice";
import roomChatReducer from "./roomChatSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    roomChat: roomChatReducer,
  },
});