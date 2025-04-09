import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRoomChatByPhoneService } from "../service/roomChatService";
import axios from "axios";

const initialState = {
    roomChat: [],
};


export const getRoomChatByPhone = createAsyncThunk(
    "search",
    async ({ phone }, thunkAPI) => {
        let response = await getRoomChatByPhoneService(phone);
        return response;
    }
);

const roomChatSlice = createSlice({
    name: "roomChat",
    initialState,

    extraReducers: (builder) => {

        //  getRoomChatByPhone
        builder
            .addCase(getRoomChatByPhone.pending, (state) => { })
            .addCase(getRoomChatByPhone.fulfilled, (state, action) => {
                if (action.payload.EC === 0) {
                    state.roomChat.push(action.payload.DT) || [];
                }
            })
            .addCase(getRoomChatByPhone.rejected, (state, action) => { });
    },
});


// Export actions
export const { } = roomChatSlice.actions;

// Export reducer
export default roomChatSlice.reducer;
