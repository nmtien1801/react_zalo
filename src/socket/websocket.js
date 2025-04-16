import { io } from "socket.io-client";

let socket;

export const connectSocket = (url) => {
    if(!socket) {
        socket = io(url);
        console.log("Websocket connected to:", url);
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      console.log("WebSocket disconnected");
      socket = null;
    }
};

export const getSocket = () => {
    if (!socket) {
        console.error("WebSocket chưa được khởi tạo.");
    }
    return socket;
};
  
export const onEvent = (event, callback) => {
    if (socket) {
        socket.on(event, callback);
    }
};
  
export const emitEvent = (event, data) => {
    if (socket) {
        socket.emit(event, data);
    }
};
