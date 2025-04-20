import { useState, useEffect, useRef } from "react";
import { Search, UserPlus, Users } from "lucide-react";
import "./Chat.scss";
import ChatPerson from "./ChatPerson";
import ChatGroup from "./ChatGroup";
import ChatCloud from "./ChatCloud";
import AddFriendModal from "../../component/AddFriendModal";

import { Modal } from "react-bootstrap";
import { loadMessages, getConversations } from "../../redux/chatSlice";
import { useSelector, useDispatch } from "react-redux";
import io from "socket.io-client";

import axios from "axios";
import { getUserByPhoneService } from "../../service/userService";
import { createConversationGroupService } from "../../service/chatService";

export default function ChatInterface() {
  const dispatch = useDispatch();
  const socketRef = useRef();

  const [allMsg, setAllMsg] = useState([]);
  const user = useSelector((state) => state.auth.userInfo);
  const conversationRedux = useSelector((state) => state.chat.conversations);
  const [isConnect, setIsConnect] = useState(false); // connect socket
  const [selected, setSelected] = useState(0);

  const [showPopupCreateGroup, setShowPopupCreateGroup] = useState(false);
  const [searchResults, setSearchResults] = useState([]); // Khởi tạo là mảng rỗng
  const [members, setMembers] = useState([]);


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
      avatar: "https://i.imgur.com/n7rlrz1.png",
      type: 3,
    },
  ]);

  const [typeChatRoom, setTypeChatRoom] = useState("cloud");
  const [onlineUsers, setOnlineUsers] = useState([]);

  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleCloseSearch = () => {
    setIsSearchFocused(false);
  };
  const [showModalAddFriend, setShowModalAddFriend] = useState(false);

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

      socketRef.current.on("RECALL_MSG", (data) => {
        setAllMsg((prevMsgs) =>
          prevMsgs.map((msg) =>
            msg._id === data._id
              ? { ...msg, msg: "Tin nhắn đã được thu hồi", type: "system" }
              : msg
          )
        );
      });

      socketRef.current.on("DELETED_MSG", (data) => {
        setAllMsg((prevState) =>
          prevState.filter((item) => item._id != data.msg._id)
        );
      });

      return () => socketRef.current.disconnect();
    }
  }, [isConnect]);

  const handleSendMsg = (msg, typeUpload) => {
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
        type: typeUpload,  // 1 - text , 2 - image, 3 - video, 4 - file, 5 - icon
      };
      console.log("data: ", data);

      socketRef.current.emit("SEND_MSG", data);
    }
  };

  console.log(onlineUsers, "onlineUsers");


  // Hàm mở popup
  const handleOpenPopupCreateGroup = () => {
    setShowPopupCreateGroup(true);
  };

  // Hàm đóng popup
  const handleClosePopupCreateGroup = () => {
    setShowPopupCreateGroup(false);
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
      receiverOnline = onlineUsers.find((u) => u.userId === receiver._id);
      setRoomData({
        ...roomData, room: "cloud", receiver: {
          ...receiver,
          socketId: receiverOnline ? receiverOnline.socketId : null,
        },
      });
    }
  };

  // Hàm tìm kiếm user theo số điện thoại
  const handleSearchPhone = async (e) => {
    const query = e.target.value.trim(); // Lấy giá trị từ input
    if (!query) {
      setSearchResults([]); // Xóa kết quả nếu input rỗng
      return;
    }

    try {

      const response = await getUserByPhoneService(query); // Gọi API
      if (response.EC === 0 &&
        response.EM === "User found" &&
        response.DT &&
        response.DT.DT) {
        setSearchResults([response.DT.DT]); // Lưu kết quả nếu là mảng
      } else {
        setSearchResults([]); // Không có kết quả hoặc không phải mảng
      }

    } catch (error) {
      console.error("Lỗi khi tìm kiếm số điện thoại:", error);
      setSearchResults([]); // Xóa kết quả nếu có lỗi
    }
  };

  // Hàm xử lý khi chọn hoặc bỏ chọn user
  const handleSelectUser = (user) => {
    const isSelected = members.some((member) => member._id === user._id);

    if (isSelected) {
      // Nếu user đã được chọn, xóa khỏi danh sách
      setMembers((prev) => prev.filter((member) => member._id !== user._id));
      console.log(members);
    } else {
      // Nếu user chưa được chọn, thêm vào danh sách
      setMembers((prev) => [...prev, user]);
    }
  };

  const handleCreateGroup = async () => {
    try {
      // Lấy dữ liệu từ input và danh sách người dùng được chọn
      const nameGroup = document.querySelector("#group-name").value;
      const avatarGroup = document.querySelector("#group-avatar").files[0];
      const selectedMembers = members.map((member) => member._id);

      // Kiểm tra dữ liệu đầu vào
      if (!nameGroup || selectedMembers.length < 2) {
        alert("Vui lòng nhập tên nhóm và chọn ít nhất hai thành viên.");
        return;
      }

      // Xử lý upload avatar nếu có
      let avatarUrl = "";
      if (avatarGroup) {
        const formData = new FormData();
        formData.append("file", avatarGroup);
        formData.append("upload_preset", "your_upload_preset"); // Thay bằng upload preset của bạn nếu dùng Cloudinary

        const uploadRes = await axios.post(
          "https://api.cloudinary.com/v1_1/your_cloud_name/image/upload",
          formData
        );
        avatarUrl = uploadRes.data.secure_url;
      }

      console.log(selectedMembers);

      // Gửi yêu cầu đến API tạo nhóm
      const response = await createConversationGroupService({
        nameGroup,
        avatarGroup: avatarUrl,
        members: selectedMembers,
      });

      if (response.data.EC === 0) {
        alert("Tạo nhóm thành công!");
        setShowPopupCreateGroup(false); // Đóng popup
      } else {
        alert(response.data.EM || "Đã xảy ra lỗi khi tạo nhóm.");
      }
    } catch (error) {
      console.error("Lỗi khi tạo nhóm:", error);
      alert("Đã xảy ra lỗi khi tạo nhóm.");
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
          members: item.members,
          role: item.role,
          permission: item.receiver.permission
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
                  onFocus={handleSearchFocus}
                />
                <button className="btn btn-light  cursor-pointer border">
                  <Search size={16} />
                </button>
              </div>
              {isSearchFocused ? (
                <button
                  className="btn btn-light rounded-circle mb-1"
                  onClick={handleCloseSearch}
                >
                  Đóng
                </button>) : (
                <>
                  <button className="btn btn-light rounded-circle mb-1"
                    onClick={() => setShowModalAddFriend(true)}
                  >
                    <UserPlus size={20} />
                  </button>

                  <AddFriendModal
                    show={showModalAddFriend}
                    onHide={() => setShowModalAddFriend(false)}
                  />
                  <button className="btn btn-light rounded-circle mb-1">
                    <Users size={20} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Conversations List */}
          <div
            className="overflow-auto"
            style={{ height: "calc(100vh - 60px)" }}
          >
            {isSearchFocused ?
              (<>
                <div className="d-flex align-items-center justify-content-between">
                  abc
                </div>
              </>) :
              (<>
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
              </>)}
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
                  socketRef={socketRef}
                  conversations={conversations}
                  onlineUsers={onlineUsers}
                />
              ) : typeChatRoom === "single" ? (
                <ChatPerson
                  roomData={roomData}
                  handleSendMsg={handleSendMsg}
                  allMsg={allMsg}
                  user={user}
                  socketRef={socketRef}
                  conversations={conversations}
                  onlineUsers={onlineUsers}
                />
              ) : (
                <ChatCloud
                  roomData={roomData}
                  handleSendMsg={handleSendMsg}
                  allMsg={allMsg}
                  user={user}
                  socketRef={socketRef}
                  conversations={conversations}
                  onlineUsers={onlineUsers}
                />
              )}
            </>
          ) : (
            <>Chào mừng bạn đến với chúng tôi</>
          )}
        </div>
      </div>

      {showPopupCreateGroup && (
        <div className="custom-modal">
          <div className="custom-modal-content">
            <div className="custom-modal-header">
              <h5 className="custom-modal-title">Tạo nhóm</h5>
              <button
                className="custom-modal-close"
                onClick={handleClosePopupCreateGroup}
              >
                &times;
              </button>
            </div>
            <div className="custom-modal-body">
              <div className="group-form">
                <div className="group-input d-flex align-items-center mb-3">
                  <div className="avatar-upload position-relative">
                    <label htmlFor="group-avatar" className="avatar-label">
                      <img
                        src="https://i.imgur.com/cIRFqAL.png"
                        alt="Avatar"
                        className="rounded-circle"
                        style={{ width: "50px", height: "50px", cursor: "pointer" }}
                      />
                      <div className="camera-icon position-absolute">
                        <i className="bi bi-camera-fill"></i>
                      </div>
                    </label>
                    <input
                      type="file"
                      id="group-avatar"
                      className="d-none"
                      accept="image/*"
                      onChange={(e) => handleAvatarUpload(e)}
                    />
                  </div>
                  <input
                    type="text"
                    className="form-control border-0 border-bottom ms-3"
                    id="group-name"
                    placeholder="Nhập tên nhóm..."
                  />
                </div>
                <div className="group-search mb-3">
                  <div className="input-group rounded-pill bg-light">
                    <span className="input-group-text bg-transparent border-0">
                      <Search size={16} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control bg-transparent border-0"
                      placeholder="Nhập tên, số điện thoại, hoặc danh sách số điện thoại"
                      onChange={handleSearchPhone}
                    />
                  </div>
                </div>
                <div className="group-tabs-wrapper">
                  <div className="group-tabs">
                    {["Tất cả", "Khách hàng", "Gia đình", "Công việc", "Bạn bè", "Trả lời sau", "Học tập", "Thể thao"].map(
                      (tab, index) => (
                        <button key={index} className="btn btn-light group-tab">
                          {tab}
                        </button>
                      )
                    )}
                  </div>
                </div>
                <div className="group-list">
                  <h6>Trò chuyện gần đây</h6>
                  <div className="group-list-container">
                    {searchResults.map((user) => (
                      <div key={user._id} className="group-item">
                        <input
                          type="checkbox"
                          id={`user-${user._id}`}
                          name="group-user"
                          value={user._id}
                          checked={members.some((member) => member._id === user._id)} // Kiểm tra nếu user đã được chọn
                          onChange={() => handleSelectUser(user)} // Gọi hàm xử lý khi chọn/bỏ chọn
                        />
                        <label htmlFor={`user-${user._id}`} className="d-flex align-items-center">
                          <img
                            src={user.avatar || "/placeholder.svg"}
                            alt={user.name}
                            className="rounded-circle"
                            style={{ width: "40px", height: "40px" }}
                          />
                          <span className="ms-2">{user.name || user.phone}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="custom-modal-footer">
              <button
                className="btn btn-secondary"
                onClick={handleClosePopupCreateGroup}
              >
                Đóng
              </button>
              <button className="btn btn-primary" onClick={handleCreateGroup}>Tạo nhóm</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
