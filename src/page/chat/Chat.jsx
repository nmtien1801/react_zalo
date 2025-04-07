import { useState, useEffect, useRef } from "react";
import { Search, UserPlus, Users } from "lucide-react";
import "./Chat.scss";
import ChatPerson from "./ChatPerson";
import ChatGroup from "./ChatGroup";
import ChatCloud from "./ChatCloud";
import { loadMessages, getConversations } from "../../redux/chatSlice";
import { useSelector, useDispatch } from "react-redux";
import io from "socket.io-client";

export default function ChatInterface() {
  const dispatch = useDispatch();
  const socketRef = useRef();

  const [allMsg, setAllMsg] = useState([]);
  const user = useSelector((state) => state.auth.userInfo);
  const conversationRedux = useSelector((state) => state.chat.conversations);
  const [isConnect, setIsConnect] = useState(false); // connect socket
  const [selected, setSelected] = useState(0);
  const [roomData, setRoomData] = useState({
    room: null,
    receiver: null,
  });
  const [conversations, setConversations] = useState([
    {
      _id: 1,
      username: "Cloud",
      message: "[Thông báo] Giới thiệu về Trường Kha...",
      time: "26/07/24",
      avatar: "/cloud.jpg",
      type: 3,
    },
  ]);

  const [typeChatRoom, setTypeChatRoom] = useState("cloud");
  const [onlineUsers, setOnlineUsers] = useState([]);

  // connect docket
  useEffect(() => {
    const socket = io.connect(import.meta.env.VITE_BACKEND_URL);

    socketRef.current = socket;
    socket.on("connect", () => setIsConnect(true));
    socket.off("disconnect", () => setIsConnect(false));
  }, []);
  // console.log("Connected to socket server with ID:", socketRef);

  // action socket
  useEffect(() => {
    if (isConnect) {

      socketRef.current.emit("register", user._id);

      socketRef.current.on("user-list", (usersList) => {
        setOnlineUsers(usersList); // Lưu danh sách user online
      });

      socketRef.current.on("RECEIVED_MSG", (data) => {
        console.log("form another users", data);
        setAllMsg((prevState) => [...prevState, data]);
      });
      
      socketRef.current.on("DELETED_MSG", (data) => {
        setAllMsg((prevState) =>
          prevState.filter((item) => item._id != data.msg._id)
        );
      });

      return () => socketRef.current.disconnect();
    }
  }, [isConnect]);

  const handleSendMsg = (msg) => {
    if (socketRef.current.connected) {
      let sender = { ...user };
      sender.socketId = socketRef.current.id;

      // Lấy socketId của receiver từ danh sách onlineUsers
      const receiverOnline = onlineUsers.find(
        (u) => u.userId === roomData.receiver?._id
      );

      const data = {
        msg,
        receiver: {
          ...roomData.receiver,
          socketId: receiverOnline ? receiverOnline.socketId : null,
        },
        sender,
      };
      console.log("data: ", data);

      socketRef.current.emit("SEND_MSG", data);
    }
  };

  const handleTypeChat = (type, receiver) => {
    let receiverOnline; // lấy socketId của người nhận từ danh sách onlineUsers
    if (type === 1) {
      setTypeChatRoom("single");
      handleLoadMessages(receiver._id, receiver.type);
      receiverOnline = onlineUsers.find((u) => u.userId === receiver._id);

      setRoomData({
        ...roomData, room: "single", receiver: {
          ...receiver,
          socketId: receiverOnline ? receiverOnline.socketId : null,
        },
      });
    } else if (type === 2) {
      setTypeChatRoom("group");
      handleLoadMessages(receiver._id, receiver.type);

      receiverOnline = onlineUsers.find((u) =>
        receiver.members.includes(u.userId)
      );

      setRoomData({
        ...roomData, room: "group", receiver: {
          ...receiver,
          socketId: receiverOnline ? receiverOnline.socketId : null,
        },
      });
    } else {
      setTypeChatRoom("cloud");
      handleLoadMessages(receiver._id, receiver.type);
      setRoomData({ ...roomData, room: "cloud", receiver: user });
    }
  };

  const handleLoadMessages = async (receiver, type) => {
    const res = await dispatch(
      loadMessages({ sender: user._id, receiver: receiver, type: type })
    );

    if (res.payload.EC === 0) {
      setAllMsg(res.payload.DT);
    }
  };

  //  const handleDelete = (id) => {
  //   axios
  //     .delete(`http://localhost:8080/message/${id}`)
  //     .then((res) => {
  //       if (socketRef.current.connected) {
  //         const data = {
  //           msg: res.data.data,
  //           receiver: roomData.receiver,
  //         };
  //         socketRef.current.emit("DELETE_MSG", data);
  //         setAllMsg((prevState) =>
  //           prevState.filter((data) => data._id != res.data.data._id)
  //         );
  //       }
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // };

  useEffect(() => {
    dispatch(getConversations(user._id));
  }, []);

  useEffect(() => {
    if (conversationRedux) {
      let _conversations = conversationRedux.map((item) => {
        return {
          _id: item.receiver._id,
          username: item.receiver.username,
          message: item.message,
          time: item.time,
          avatar: item.avatar,
          type: item.type,
          phone: item.receiver.phone,
          members: item.receiver.members,
        };
      });

      setConversations(_conversations);
    }
  }, [conversationRedux]);

  return (
    <div className="container-fluid vh-100 p-0">
      <div className="row h-100 g-0 ">
        {/* Left Sidebar */}
        <div
          className="col-3 border-end bg-white"
          style={{ maxWidth: "300px" }}
        >
          {/*  Search */}
          <div className="p-2 border-bottom">
            <div className="d-flex align-items-center pb-3">
              <div className="input-group me-3">
                <input
                  type="text"
                  className="form-control form-control-sm bg-light"
                  placeholder="Tìm kiếm"
                />
                <button className="btn btn-light  cursor-pointer border">
                  <Search size={16} />
                </button>
              </div>

              <button className="btn btn-light rounded-circle mb-1">
                <UserPlus size={20} />
              </button>

              <button className="btn btn-light rounded-circle mb-1">
                <Users size={20} />
              </button>
            </div>

            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-4">
                {["Tất cả", "Chưa đọc"].map((item, index) => (
                  <span
                    key={index}
                    onClick={() => setSelected(index)}
                    style={{
                      textDecoration: selected === index ? "underline" : "none",
                      color: selected === index ? "#0d6efd" : "black", // Đổi màu xanh khi chọn
                      cursor: "pointer",
                      textDecorationThickness: "4px", // Độ dày gạch chân
                      textUnderlineOffset: "5px", // Khoảng cách gạch chân so với chữ
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
              <div className="cursor-pointer hover-bg-light p-1">Phân loại</div>
            </div>
          </div>

          {/* Conversations List */}
          <div
            className="overflow-auto"
            style={{ height: "calc(100vh - 60px)" }}
          >
            {conversations &&
              conversations.map((chat) => (
                <div
                  key={chat._id}
                  className="d-flex align-items-center p-2 border-bottom hover-bg-light cursor-pointer"
                  onClick={() => handleTypeChat(chat.type, chat)}
                >
                  <img
                    src={chat.avatar || "/placeholder.svg"}
                    className="rounded-circle"
                    alt=""
                    style={{ width: "48px", height: "48px" }}
                  />
                  <div className="ms-2 overflow-hidden ">
                    <div className="text-truncate fw-medium ">
                      {chat.username}
                    </div>
                    <div className="text-truncate small text-muted ">
                      {chat.message}
                    </div>
                  </div>
                  <small className="text-muted ms-auto">{chat.time}</small>
                </div>
              ))}
          </div>
        </div>

        <div className="col">
          {roomData.room ? (
            <>
              {typeChatRoom === "group" ? (
                <ChatGroup
                  roomData={roomData}
                  handleSendMsg={handleSendMsg}
                  allMsg={allMsg}
                  user={user}
                  // handleDelete={handleDelete}
                  socketRef={socketRef}
                />
              ) : typeChatRoom === "single" ? (
                <ChatPerson
                  roomData={roomData}
                  handleSendMsg={handleSendMsg}
                  allMsg={allMsg}
                  user={user}
                  // handleDelete={handleDelete}
                  socketRef={socketRef}
                />
              ) : (
                <ChatCloud
                  roomData={roomData}
                  handleSendMsg={handleSendMsg}
                  allMsg={allMsg}
                  user={user}
                // handleDelete={handleDelete}
                />
              )}
            </>
          ) : (
            <>Chào mừng bạn đến với chúng tôi</>
          )}
        </div>
      </div>
    </div>
  );
}
