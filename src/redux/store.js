import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import chatReducer from "./chatSlice";
import profileReducer from './profileSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    profile: profileReducer,
  },
});