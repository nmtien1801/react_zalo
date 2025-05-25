import { useState, useEffect, useRef } from "react";
import { ImageIcon, Search, UserPlus, Users } from "lucide-react";
import "./Chat.scss";
import ChatPerson from "./ChatPerson";
import ChatGroup from "./ChatGroup";
import ChatCloud from "./ChatCloud";
import AddFriendModal from "../../component/AddFriendModal";

import { Modal } from "react-bootstrap";
import { loadMessages, getConversations } from "../../redux/chatSlice";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";

import axios from "axios";
import { getUserByPhoneService } from "../../service/userService";
import { createConversationGroupService } from "../../service/chatService";
import { getFriendListService } from "../../service/friendShipService";
import { uploadAvatar } from "../../redux/profileSlice";
import WelcomePage from "./WelcomePage";

export default function ChatInterface(props) {
  const dispatch = useDispatch();
  const socketRef = props.socketRef
  const location = useLocation();
  const friend = location.state?.friend;

  const [allMsg, setAllMsg] = useState([]);
  const user = useSelector((state) => state.auth.userInfo);
  const conversationRedux = useSelector((state) => state.chat.conversations);
  const [selected, setSelected] = useState(0);

  const [showPopupCreateGroup, setShowPopupCreateGroup] = useState(false);
  const [searchResults, setSearchResults] = useState([]); // Khởi tạo là mảng rỗng
  const [members, setMembers] = useState([]);

  const [groupAvatarPreview, setGroupAvatarPreview] = useState("https://i.imgur.com/cIRFqAL.png");

  const [roomData, setRoomData] = useState({
    room: null,
    receiver: null,
  });

  const [conversations, setConversations] = useState([]);

  const [typeChatRoom, setTypeChatRoom] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);

  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleCloseSearch = () => {
    setIsSearchFocused(false);
  };
  const [showModalAddFriend, setShowModalAddFriend] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);



  // action socket
  useEffect(() => {
    socketRef.current.on("user-list", (usersList) => {
      setOnlineUsers(usersList); // Lưu danh sách user online

    });

    // socketRef.current.on("RECEIVED_MSG", (data) => {
    //   console.log("RECEIVED_MSG: ", data);
    //   console.log("selected: ", selectedUser);


    //   if (data.receiver._id === selectedUser._id) {
    //     setAllMsg((prevState) => [...prevState, data]);
    //   }

    // });


    socketRef.current.on("RECALL_MSG", (data) => {
      setAllMsg((prevMsgs) =>
        prevMsgs.map((msg) =>
          msg._id === data._id
            ? { ...msg, msg: "Tin nhắn đã được thu hồi", type: "system" }
            : msg
        )
      );
    });

    // accept friend
    socketRef.current.on("RES_ACCEPT_FRIEND", async () => {
      dispatch(getConversations(user._id));
    });

    // accept group
    socketRef.current.on("RES_ACCEPT_GROUP", async () => {
      dispatch(getConversations(user._id));
    });

    // delete friend
    socketRef.current.on("RES_DELETE_FRIEND", async () => {
      dispatch(getConversations(user._id));
    });

    // remove member group
    socketRef.current.on("RES_REMOVE_MEMBER", (data) => {
      dispatch(getConversations(user._id));
    })

    // create group
    socketRef.current.on("RES_CREATE_GROUP", (data) => {
      dispatch(getConversations(user._id));
    });

    // Dissolve Group
    socketRef.current.on("RES_DISSOLVE_GROUP", (data) => {
      dispatch(getConversations(user._id));
      window.location.reload();
    });

    // add member group
    socketRef.current.on("RES_ADD_GROUP", (data) => {
      dispatch(getConversations(user._id));
    });

    // update avatar
    socketRef.current.on("RES_UPDATE_AVATAR", (data) => {
      dispatch(getConversations(user._id));
    });

    // update permission
    socketRef.current.on("RES_MEMBER_PERMISSION", (data) => {
      dispatch(getConversations(user._id));
    });

    // receiver msg - update message in conversation
    socketRef.current.on("RECEIVED_MSG", (data) => {
      dispatch(getConversations(user._id));

      //Nếu đang trong chat với người gửi, tự động đánh dấu đã đọc
      if (data.sender._id === selectedUser?._id) {
        // Thêm tin nhắn vào giao diện
        setAllMsg((prevState) => [...prevState, data]);
        
        // Đánh dấu tin nhắn đã đọc
        socketRef.current.emit("MARK_READ", {
          messageId: data._id,
          userId: user._id,
          conversationId: data.sender._id
        });
      }
    });

    // Xử lý sự kiện tin nhắn đã đọc
    socketRef.current.on("MESSAGE_READ", (data) => {
      // Cập nhật trạng thái đã đọc cho tin nhắn
      setAllMsg((prevMsgs) => 
        prevMsgs.map((msg) => {
          if (msg._id === data.messageId) {
            // Nếu người đánh dấu đã đọc là người gửi, bỏ qua
            if (data.userId === msg.sender._id) return msg;
            
            // Nếu readBy đã có userId này, không thêm lại
            if (msg.readBy && msg.readBy.some(id => 
              (id.$oid || id) === (data.userId.$oid || data.userId))
            ) {
              return { ...msg, isRead: true };
            }
            
            // Thêm vào mảng readBy
            return {
              ...msg,
              isRead: true,
              readBy: [...(msg.readBy || []), data.userId]
            };
          }
          return msg;
        })
      );
      console.log("MESSAGE_READ: ", data);
    });

    // Xử lý sự kiện tất cả tin nhắn đã đọc
    socketRef.current.on("ALL_MESSAGES_READ", (data) => {
      // Cập nhật trạng thái đã đọc cho tất cả tin nhắn từ người dùng cụ thể
      setAllMsg((prevMsgs) => 
        prevMsgs.map((msg) => {
          // Chỉ cập nhật các tin nhắn trong cuộc trò chuyện được chỉ định
          if (msg.receiver._id === data.conversationId) {
            // Nếu người đánh dấu đã đọc là người gửi, bỏ qua
            if (data.userId === msg.sender._id) return msg;
            
            // Kiểm tra xem người này đã có trong danh sách readBy chưa
            const hasUserInReadBy = msg.readBy && msg.readBy.some(id => 
              (id.$oid || id) === (data.userId.$oid || data.userId)
            );
            
            if (hasUserInReadBy) {
              // Người dùng đã có trong danh sách readBy
              return { ...msg, isRead: true };
            } else {
              // Thêm người dùng vào danh sách readBy
              return {
                ...msg,
                isRead: true,
                readBy: [...(msg.readBy || []), data.userId]
              };
            }
          }
          return msg;
        })
      );
      console.log("ALL_MESSAGES_READ: ", data);
    });

    return () => {
      socketRef.current.off("MESSAGE_READ");
      socketRef.current.off("ALL_MESSAGES_READ");
    };

  }, [socketRef]);

  useEffect(() => {
    socketRef.current.on("RECEIVED_MSG", (data) => {
      console.log("RECEIVED_MSG: ", data);
      console.log("selected: ", selectedUser);
      // Kiểm tra selectedUser trước khi dùng
      if (data.receiver._id === user._id && data.sender._id === selectedUser._id)
        setAllMsg((prevState) => [...prevState, data]);
      if (data.receiver._id === selectedUser._id)
        setAllMsg((prevState) => [...prevState, data]);
    });

    // Cleanup
    return () => {
      socketRef.current.off("RECEIVED_MSG");
    };
  }, [socketRef, selectedUser]);


  const handleSendMsg = (msg, typeUpload) => {
    console.log("msg: ", msg);

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
        readBy: []
      };

      console.log("data: ", data);
      socketRef.current.emit("SEND_MSG", data);
    }
  };

  // Hàm mở popup
  const handleOpenPopupCreateGroup = async () => {

    try {
      const response = await getFriendListService();
      if (response.EC === 0 && response.DT) {
        setSearchResults(response.DT); // Lưu danh sách bạn bè vào searchResults
      } else {
        setSearchResults([]); // Không có bạn bè
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bạn bè:", error);
      setSearchResults([]);
    }

    setMembers([{ _id: user._id, phone: user.phone, avatar: user.avatar }]);

    setShowPopupCreateGroup(true);
  };

  // Hàm đóng popup
  const handleClosePopupCreateGroup = () => {
    document.querySelector("#group-name").value = "";
    document.querySelector("#group-avatar").value = "";
    setGroupAvatarPreview("https://i.imgur.com/cIRFqAL.png");
    setMembers([]);
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

  // Hàm tìm kiếm user theo số tài khoản
  const handleSearchPhone = async (e) => {
    const query = e.target.value.trim(); // Lấy giá trị từ input
    if (!query) {

      try {
        const response = await getFriendListService();
        if (response.EC === 0 && response.DT) {
          setSearchResults(response.DT); // Lưu danh sách bạn bè vào searchResults
        } else {
          setSearchResults([]); // Không có bạn bè
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bạn bè:", error);
        setSearchResults([]);
      }
      return;

    }

    // Kiểm tra xem query có phải là số tài khoản hay không
    const isPhoneNumber = /^\d+$/.test(query);
    if (!isPhoneNumber) {

      try {
        const response = await getFriendListService();
        if (response.EC === 0 && response.DT) {
          setSearchResults(response.DT); // Lưu danh sách bạn bè vào searchResults
        } else {
          setSearchResults([]); // Không có bạn bè
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bạn bè:", error);
        setSearchResults([]);
      }
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
      console.error("Lỗi khi tìm kiếm số tài khoản:", error);
      setSearchResults([]); // Xóa kết quả nếu có lỗi
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file); // Tạo URL tạm thời
      setGroupAvatarPreview(previewUrl); // Lưu URL vào state
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
      if (!nameGroup) {
        alert("Vui lòng nhập tên nhóm.");
        return;
      }

      if (selectedMembers.length < 3) {
        alert("Vui lòng chọn ít nhất ba thành viên.");
        return;
      }

      // Xử lý upload avatar nếu có
      let avatarUrl = "";
      if (avatarGroup) {

        const formData = new FormData();
        formData.append("avatar", avatarGroup);

        try {
          const response = await dispatch(uploadAvatar({ formData }));
          if (response.payload.EC === 0) {
            avatarUrl = response.payload.DT;
          } else {
            alert(response.payload.EM || "Lỗi khi tải lên ảnh!");
          }
        } catch (error) {
          console.error("Lỗi khi tải lên ảnh:", error);
          alert("Đã xảy ra lỗi khi tải lên ảnh.");
        }
      }

      console.log(selectedMembers);

      // Nếu không có avatar, sử dụng ảnh mặc định
      if (avatarUrl.trim() === "") {
        avatarUrl = "https://i.imgur.com/jUTa2UN.png";
      }

      // Gửi yêu cầu đến API tạo nhóm
      const response = await createConversationGroupService(
        nameGroup,
        avatarUrl,
        selectedMembers,
      );

      if (response.EC === 0) {
        alert("Tạo nhóm thành công!");
        socketRef.current.emit("REQ_CREATE_GROUP", response.DT);
        setShowPopupCreateGroup(false); // Đóng popup
      } else {
        alert(response.EM || "Đã xảy ra lỗi khi tạo nhóm.");
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

  const convertTime = (time) => {
    const now = Date.now();
    const past = Number(time);
    const diff = now - past;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (seconds < 60) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút`;
    if (hours < 24) return `${hours} giờ`;
    if (days === 1) return "Hôm qua";

    const date = new Date(past);
    return date.toLocaleDateString("vi-VN");
  };

  useEffect(() => {
    if (friend && conversations.length > 0) {
      const existing = conversations.find(c => c._id === friend._id);

      if (existing) {
        handleTypeChat(existing.type, existing);
      }
    }
  }, [friend, conversations]);

  return (
    <div className="container-fluid vh-100 p-0 min-vh-100">
      <div className="row h-100 g-0 ">
        {/* Left Sidebar */}
        <div
          className={`col-3 border-end bg-white ${typeChatRoom ? 'd-none d-lg-block' : ''
            }`}
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/></svg>
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
                    socketRef={socketRef}
                  />
                  <button className="btn btn-light rounded-circle mb-1"
                    onClick={() => handleOpenPopupCreateGroup()}>
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
                  conversations.map((chat) => {
                    console.log(chat);
                    return (
                    <div
                      key={chat._id}
                      className={`d-flex align-items-center p-2 border-bottom hover-bg-light cursor-pointer ${
                        selectedUser && selectedUser._id === chat._id ? 'active-chat' : ''
                      }`}
                      onClick={() => {
                        handleTypeChat(chat.type, chat);
                        setSelectedUser(chat);
                      }}

                    >
                      <img
                        src={
                          chat.type === 3
                            ? "/cloud.jpg"
                            : chat.avatar || "/placeholder.svg"
                        }
                        className="rounded-circle"
                        alt=""
                        style={{ width: "48px", height: "48px" }}
                      />
                      <div className="ms-2 overflow-hidden flex-grow-1">
                        <div className="text-truncate fw-medium">
                          {chat.username}
                        </div>
                        <div
                          className="text-truncate small text-muted"
                          style={{ maxWidth: "200px", whiteSpace: "nowrap", alignItems: "center", display: "flex" }}
                        >
                          {(() => {
                            // Regex kiểm tra link ảnh (jpg, jpeg, png, gif, webp)
                            const imageRegex = /(https?:\/\/[^\s,]+?\.(jpg|jpeg|png|gif|webp))/gi;
                            // Nếu là nhiều link ảnh, phân tách bởi dấu phẩy hoặc khoảng trắng
                            const isImage =
                              typeof chat.message === "string" &&
                              chat.message.split(/,|\s/).some((url) => imageRegex.test(url));
                            if (isImage) {
                              return (
                                <>
                                  <ImageIcon size={16} className="me-1" />
                                  Hình ảnh
                                </>
                              );
                            }
                            return chat.message;
                          })()}
                        </div>
                      </div>
                      <small className="text-muted ms-auto">
                        {convertTime(chat.time)}
                      </small>
                    </div>
                  )})}
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
                  setAllMsg={setAllMsg}
                  user={user}
                  socketRef={socketRef}
                  conversations={conversations}
                  onlineUsers={onlineUsers}
                  selectedUser={selectedUser}
                  handleStartCall={props.handleStartCall}
                />
              ) : typeChatRoom === "single" ? (
                <ChatPerson
                  roomData={roomData}
                  handleSendMsg={handleSendMsg}
                  allMsg={allMsg}
                  setAllMsg={setAllMsg}
                  user={user}
                  socketRef={socketRef}
                  conversations={conversations}
                  onlineUsers={onlineUsers}
                  selectedUser={selectedUser}
                  handleStartCall={props.handleStartCall}
                />
              ) : (
                <ChatCloud
                  roomData={roomData}
                  handleSendMsg={handleSendMsg}
                  allMsg={allMsg}
                  setAllMsg={setAllMsg}
                  user={user}
                  socketRef={socketRef}
                  conversations={conversations}
                  onlineUsers={onlineUsers}
                  selectedUser={selectedUser}
                  handleLoadMessages={handleLoadMessages}
                />
              )}
            </>
          ) : (
            <WelcomePage/>
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
                        src={groupAvatarPreview}
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
                      placeholder="Nhập tên, số tài khoản, hoặc danh sách số tài khoản"
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
                <div className="row">
                  {/* Danh sách tìm kiếm */}
                  <div className="col">
                    <div className="group-list">
                      <h6>Bạn bè gần đây</h6>
                      <div className="group-list-container">
                        {searchResults.length > 0 ? (
                          searchResults.map((user) => (
                            <div key={user._id} className="group-item">
                              <input
                                type="checkbox"
                                id={`user-${user._id}`}
                                name="group-user"
                                value={user._id}
                                checked={members.some((member) => member._id === user._id)}
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
                          ))
                        ) : (
                          <div className="text-muted">Không tìm thấy kết quả nào</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Danh sách đã chọn */}
                  {members.length > 0 && (
                    <div className="col-auto" style={{ maxWidth: "300px", minWidth: "200px" }}>
                      <div className="selected-list">
                        <h6>Đã chọn</h6>
                        <div className="selected-list-container">
                          {members.map((member) => (
                            <div key={member._id} className="selected-item d-flex align-items-center mb-2">
                              <img
                                src={member.avatar || "/placeholder.svg"}
                                alt={member.name}
                                className="rounded-circle"
                                style={{ width: "40px", height: "40px" }}
                              />

                              {member.phone === user.phone ? (
                                <>
                                  <span className="text-muted fst-italic ms-2 me-2">Bạn</span>
                                </>
                              ) : (
                                <>
                                  <span className="ms-2 me-2">{member.name || member.phone}</span>
                                  <button
                                    className="btn btn-danger btn-sm ms-auto"
                                    onClick={() => handleSelectUser(member)}
                                  >
                                    Xóa
                                  </button>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
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
              <button className="btn btn-primary ms-2" onClick={handleCreateGroup}>Tạo nhóm</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
