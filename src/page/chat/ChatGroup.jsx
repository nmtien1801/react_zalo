import { useState, useRef, useEffect } from "react";
import { UserX } from "lucide-react";
import {
  LogOut,
  UserPlus,
  Settings,
  ImageIcon,
  File,
  LinkIcon,
  Shield,
  Clock,
  EyeOff,
  ChevronDown,
  Smile,
  Paperclip,
  Send,
  Edit2,
  BellOff,
  Pin,
  Users,
  AlertTriangle,
  Trash2,
  Search,
  Layout,
  Phone,
  Video,
  Reply,
  Share,
  Copy,
  Download,
  RotateCw,
  Image,
  Share2
} from "lucide-react";
import "./Chat.scss";
import GroupInfo from "../info/GroupInfo.jsx";
import { useSelector, useDispatch } from "react-redux";
import CallScreen from "../../component/CallScreen.jsx";
import { uploadAvatar } from '../../redux/profileSlice.js'
import IconModal from '../../component/IconModal.jsx'
import { deleteMessageForMeService, recallMessageService, dissolveGroupService } from "../../service/chatService.js";
import ImageViewer from "./ImageViewer.jsx";
import ShareMsgModal from "../../component/ShareMsgModal.jsx";
import ManageGroup from "../auth/ManageGroup.jsx"
import { uploadAvatarGroup } from '../../redux/profileSlice.js'
import AddMemberModal from "../../component/AddMemberModal.jsx";

// nghiem
import { getRoomChatMembersService } from "../../service/roomChatService"; // Import service
import { removeMemberFromGroupService } from "../../service/chatService"; // Import service
import { reloadMessages } from "../../redux/chatSlice.js";

export default function ChatGroup(props) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.userInfo);
  const [avatarUrl, setAvatarUrl] = useState(props.roomData.receiver.avatar); // update avatar group
  const [receiver, setReceiver] = useState(props.roomData?.receiver || null);
  const fileInputRef = useRef(null); // Ref để truy cập input file ẩn
  const imageInputRef = useRef(null); // Ref để truy cập input ảnh nhóm
  const messagesEndRef = useRef(null);
  const avatarInputRef = useRef(null);  // Ref để truy cập input avatar nhóm
  const socketRef = props.socketRef

  const [showSidebar, setShowSidebar] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const { setAllMsg } = props;

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const [isOpen, setIsOpen] = useState(false);

  const [showAddMemberModal, setShowAddMemberModal] = useState(false); // State quản lý modal

  const handleOpenAddMemberModal = () => {
    setShowAddMemberModal(true); // Mở modal
  };

  const handleCloseAddMemberModal = () => {
    setShowAddMemberModal(false); // Đóng modal
  };

  const [showCallScreen, setShowCallScreen] = useState(false);
  const [hasSelectedImages, setHasSelectedImages] = useState(false);
  const [isInitiator, setIsInitiator] = useState(false); // Thêm state để theo dõi người khởi tạo

  // Popup Chuột phải
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [selectedMessage, setSelectedMessage] = useState(null);


  const conversations = props.conversations || [];

  // ImageViewer
  const [previewImages, setPreviewImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // ManageGroup
  const [showManageGroup, setShowManageGroup] = useState(false)
  const [role, setRole] = useState('')

  const [sections] = useState([
    { id: "media", title: "Ảnh/Video", icon: ImageIcon },
    { id: "files", title: "File", icon: File },
    { id: "links", title: "Link", icon: LinkIcon },
  ]);

  // nghiem
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [members, setMembers] = useState([]); // State để lưu danh sách thành viên

  // Gọi API để lấy danh sách thành viên nhóm
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        if (receiver?._id) {
          const response = await getRoomChatMembersService(receiver._id); // Gọi API với roomId
          if (response.EC === 0) {
            setMembers(response.DT); // Lưu danh sách thành viên vào state
            console.log("Danh sách thành viên nhóm:", response.DT); // Log danh sách thành viên
          } else {
            console.error("Lỗi khi lấy danh sách thành viên:", response.EM);
          }
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    };

    fetchMembers();
  }, [receiver?._id]);

  const handleRemoveMember = async (memberId) => {
    console.log("Xóa thành viên:", memberId);
    console.log("ID nhóm:", receiver._id); // Kiểm tra ID nhóm

    if (memberId === user._id) {
      alert('Không thể xóa chính mình khỏi nhóm!')
      return
    }
    let res = await removeMemberFromGroupService(receiver._id, memberId);
    console.log("res xóa thành viên", res);

    socketRef.current.emit("REQ_REMOVE_MEMBER", members);
  };

  useEffect(() => {
    if (props.allMsg) {
      const filteredMessages = props.allMsg.filter(
        (msg) => !msg.memberDel?.includes(user._id)
      );
      setMessages(filteredMessages);
    }
  }, [props.allMsg]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (msg, type) => {

    // Nếu là chuỗi
    if (typeof msg === "string") {
      if (!msg.trim()) {
        alert("Tin nhắn không được để trống!");
        return;
      }
    }

    // Kiểm tra nếu msg là mảng
    if (Array.isArray(msg)) {
      if (msg.length === 0) {
        msg = JSON.stringify(msg);
      }
    }

    props.handleSendMsg(msg, type);
    setMessage("");
  };

  // Sự kiện nhấn chuột phải
  const handleShowPopup = (e, msg) => {
    e.preventDefault();

    const popupWidth = 200;
    const popupHeight = 350;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    let x = e.clientX;
    let y = e.clientY;

    if (x + popupWidth > screenWidth) {
      x = screenWidth - popupWidth - 10;
    }

    if (y + popupHeight > screenHeight) {
      y = screenHeight - popupHeight - 10;
    }

    setSelectedMessage(msg);
    setPopupPosition({ x, y });
    setPopupVisible(true);
  };

  const handleClosePopup = () => {
    setPopupVisible(false);
    setSelectedMessage(null);
  };

  // Xử lý sự kiện incoming-call từ socket
  useEffect(() => {
    if (!props.socketRef.current) return;

    const socket = props.socketRef.current;
    socket.on("incoming-call", () => {
      setShowCallScreen(true); // Hiển thị modal khi có cuộc gọi đến
      setIsInitiator(false); // Người nhận không phải là người khởi tạo
    });

    return () => {
      socket.off("incoming-call");
    };
  }, [props.socketRef]);

  const handleStartCall = () => {
    setShowCallScreen(true); // Mở modal
    setIsInitiator(true); // Đặt người dùng hiện tại là người khởi tạo
  };

  // Xử lý upload file
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      alert('k co file')
      return;
    }


    const formData = new FormData();
    formData.append("avatar", selectedFile);

    try {
      const response = await dispatch(uploadAvatar({ formData }));
      if (response.payload.EC === 0) {
        const mimeType = selectedFile.type
        let type;
        if (mimeType.split("/")[0] === "video") {
          type = "video";
        } else if (mimeType.split("/")[0] === "image") {
          type = "image";
        } else if (mimeType.split("/")[0] === "application") {
          type = "file";
        } else {
          type = "text";
        }

        sendMessage(response.payload.DT, type); // link ảnh server trả về
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert('err')
    }
  };

  // xử lý upload image
  const handleImageChange = async (e) => {
    const selectedImages = e.target.files;

    if (selectedImages && selectedImages.length > 0) {

      if (selectedImages.length > 10) {
        setHasSelectedImages(false);
        alert("Số lượng ảnh không được quá 10!");
        return;
      }

      const previews = [];
      const files = Array.from(e.target.files);

      for (let image of selectedImages) {
        // Tạo URL xem trước
        const reader = new FileReader();
        reader.onload = () => {
          previews.push(reader.result); // Lưu URL xem trước vào mảng
          setPreviewImages([...previews]); // Cập nhật state xem trước
          setHasSelectedImages(true);
        };
        reader.readAsDataURL(image);
      }

      if (files.length > 0) {
        setSelectedFiles((prev) => [...prev, ...files]);
      }
    } else {
      setHasSelectedImages(false);
    }
  };

  // Kích hoạt input ẩn file khi nhấn nút
  const handleButtonClick = () => {
    fileInputRef.current.click(); // Mở dialog chọn file
  };

  // Kích hoạt input ẩn image khi nhấn nút
  const handleButtonClickImage = () => {
    imageInputRef.current.click(); // Mở dialog chọn file
  };

  // Hàm nhấp vào image xem
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseImageViewer = () => {
    setSelectedImage(null);
  };

  // Kích hoạt input ẩn avatar khi nhấn nút
  const handleButtonUpdateClick = () => {
    avatarInputRef.current.click(); // Mở dialog chọn file
  };

  // Xử lý upload avatar group
  const handleUpdateAvatarGroup = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      alert('k co file')
      return;
    }


    const formData = new FormData();
    formData.append("avatar", selectedFile);

    try {
      const response = await dispatch(uploadAvatar({ formData }));

      if (response.payload.EC === 0) {
        console.log('res S3 avatar', response.payload.DT);
        let res = await dispatch(uploadAvatarGroup({ groupId: props.roomData.receiver._id, avatar: response.payload.DT }))

        setAvatarUrl(response.payload.DT);
      } else {
        console.log('err upload ', response.payload.EM);
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const convertTime = (time) => {
    const date = new Date(time);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Ho_Chi_Minh",
    });
  };

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji);
  };

  //Xử lý khi người dùng nhấp ngoài popup chuột phải
  useEffect(() => {
    const handleClickOutside = () => {
      if (popupVisible) {
        handleClosePopup();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [popupVisible]);


  // Xử lý recall msg
  const handleRecallMessage = async (message) => {
    try {
      const response = await recallMessageService(message._id);
      if (response.EC === 0) {
        console.log("Tin nhắn đã được thu hồi:", response.DT);

        props.socketRef.current.emit("RECALL", message);
      } else {
        console.error("Thu hồi tin nhắn thất bại:", response.EM);
      }
    } catch (error) {
      console.error("Lỗi khi thu hồi tin nhắn:", error);
    }
  };

  // Xử lý recall for me
  const handleDeleteMessageForMe = async (id) => {
    try {
      let member;
      if (receiver.type === 2) {
        member = {
          ...receiver,
          memberDel: user._id
        };
      } else {
        member = user
      }

      const response = await deleteMessageForMeService(id, member);
      if (response.EC === 0) {
        console.log("Tin nhắn đã được xóa chỉ ở phía tôi:", response.DT);

        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== id)
        );

        const res = await dispatch(
          reloadMessages({ sender: user._id, receiver: receiver._id, type: receiver.type })
        );
    
        if (res.payload.EC === 0) {
          setAllMsg(res.payload.DT);
        }
      } else {
        console.error("Xóa tin nhắn thất bại:", response.EM);
      }
    } catch (error) {
      console.error("Lỗi khi xóa tin nhắn:", error);
    }
  };

  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedMessageShareModal, setSelectedMessageShareModal] = useState([]);

  const handleOpenShareModal = (message) => {
    setShowShareModal(true);
    setSelectedMessageShareModal(message); // Lưu tin nhắn đã chọn để chia sẻ
  };

  const handleRemovePreview = (index) => {
    const updatedPreviews = [...previewImages];
    updatedPreviews.splice(index, 1);
    setPreviewImages(updatedPreviews);

    if (updatedPreviews.length === 0) {
      setHasSelectedImages(false);
    }
  };

  const handleMessage = async (message) => {
    if (previewImages.length === 0) {
      sendMessage(message, "text");
    } else if (previewImages.length > 0) {

      const listUrlImage = [];

      for (const image of selectedFiles) {
        const formData = new FormData();
        console.log("Ảnh:" + image);
        formData.append("avatar", image);

        try {
          const response = await dispatch(uploadAvatar({ formData }));
          if (response.payload.EC === 0) {
            listUrlImage.push(response.payload.DT);
          } else {
            alert(response.payload.EM || "Lỗi khi tải lên ảnh!");
          }
        } catch (error) {
          console.error("Lỗi khi tải lên ảnh:", error);
          alert("Đã xảy ra lỗi khi tải lên ảnh.");
        }
      }

      if (listUrlImage.length > 0) {
        const listUrlImageString = listUrlImage.join(", ");
        sendMessage(listUrlImageString, "image");
      }

      if (message.trim()) {
        sendMessage(message, "text");
      }

      setPreviewImages([]);
      setHasSelectedImages(false);
    }

    setMessage("");
  }


  const handleClearAllPreviews = () => {
    setPreviewImages([]); // Xóa toàn bộ ảnh xem trước
    setHasSelectedImages(false);
  };

  const handleShare = (selectedMessage) => {
    console.log('selectedMessage ', selectedMessage);

  }

  // Quản lý nhóm
  const handleManageGroup = async () => {
    setShowManageGroup(false)
  }

  useEffect(() => {
    const role = conversations.find(item => item._id === receiver._id);
    if (role) {
      setRole(role.role)
    }
  }, []);

  // action socket
  useEffect(() => {
    socketRef.current.on("RES_MEMBER_PERMISSION", (data) => {
      const member = data.find((item) => item.sender._id === user._id);
      setReceiver({
        ...receiver,
        permission: member.receiver.permission,
        role: member.role,
      });
    });

    socketRef.current.on("RES_UPDATE_DEPUTY", (data) => {
      // Nếu không có bản ghi nào được cập nhật
      if (data.upsertedCount === 0) {
        setRole("member");
        return;
      }

      // Tìm xem user có phải là sender hoặc receiver không
      const member = data.find(
        (item) =>
          item?.sender?._id === user._id || item?.receiver?._id === user._id
      );
      console.log('member ', member);

      if (member) {
        setRole(member.role);
      } else {
        if (receiver.role !== 'leader') {
          setRole("member");
        }
      }
    });

    socketRef.current.on("RES_TRANS_LEADER", (data) => {
      const { newLeader, oldLeader } = data;
      let member = null;
      if (newLeader?.sender?._id === user._id) {
        member = newLeader;
      } else if (oldLeader?.sender?._id === user._id) {
        member = oldLeader;
      }

      setRole(member.role);
      setReceiver({
        ...receiver,
        role: member.role,
      })
      setShowManageGroup(false);
    });

    socketRef.current.on("RES_REMOVE_MEMBER", (data) => {
      const fetchMembers = async () => {
        try {
          if (receiver?._id) {
            const response = await getRoomChatMembersService(receiver._id);
            console.log("response ", response);
            
            if (response.EC === 0) {
              setMembers(response.DT); // Lưu danh sách thành viên vào state
            } else {
              console.error("Lỗi khi lấy danh sách thành viên:", response.EM);
            }
          }
        } catch (error) {
          console.error("Lỗi khi gọi API getRoomChatMembersService:", error);
        }
      };
      fetchMembers();
    })
  }, [])



   // Handle dissolve group
   const handleDissolveGroup = async () => {
    debugger
    try {
      alert("Thông báo", "Đang giải tán nhóm...");
  
      const response = await dissolveGroupService(receiver._id);
  
      const { EC, EM } = response || {};
  
      if (EC === 0) {
        alert("Thành công", "Nhóm đã được giải tán!");
       window.location.reload(); // Tải lại trang sau khi giải tán nhóm
      } else {
        alert("Lỗi", EM || "Không thể giải tán nhóm.");
      }
    } catch (error) {
      console.error("Lỗi khi giải tán nhóm:", error);
      alert("Lỗi", "Không thể giải tán nhóm, vui lòng thử lại sau.");
    }
  };
  

  return (
    <div className="row g-0 h-100">
      {/* Main Chat Area */}
      <div className="col bg-light">
        {/* Chat Header */}
        <div className="bg-white p-2 d-flex align-items-center border-bottom justify-content-between">
          <div className="d-flex align-items-center">
            <img
              src="/placeholder.svg"
              className="rounded-circle"
              alt=""
              style={{ width: "40px", height: "40px" }}
              onClick={openModal}
            />
            <GroupInfo isOpen={isOpen} closeModal={closeModal} user={receiver} />
            <div className="ms-2">
              <div className="fw-medium">{props.roomData.receiver.username}</div>
              <small className="text-muted">Hoạt động 2 giờ trước</small>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span
              className="btn btn-light rounded-circle mb-1"
              onClick={handleStartCall} // Gọi hàm handleStartCall khi bấm
            >
              <Phone size={16} />
            </span>
            <span className="btn btn-light rounded-circle mb-1">
              <Video size={16} />
            </span>
            <span className="btn btn-light rounded-circle mb-1">
              <Search size={16} />
            </span>
            <button
              className="btn btn-light rounded-circle mb-1"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <Layout size={20} color="#0d6efd" />
            </button>
          </div>
        </div>

        {/* Chat Content */}
        <div
          className="chat-container p-3"
          style={{
            height: hasSelectedImages
              ? "calc(100vh - 278px)" // Khi có ảnh được chọn
              : "calc(100vh - 120px)", // Khi không có ảnh nào được chọn
            overflowY: "auto",
          }}
        >
          <div className="flex flex-col justify-end">
            {messages &&
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 my-1 d-flex ${msg?.sender?._id === user._id ? "justify-content-end" : "justify-content-start"
                    }`}
                >
                  <div
                    className={`p-3 max-w-[70%] break-words rounded-3 ${msg.type === "text" || msg.type === "file" || msg.type === "system"
                      ? msg.sender._id === user._id
                        ? "bg-primary text-white"
                        : "bg-light text-dark"
                      : "bg-transparent"
                      }`}
                    onContextMenu={(e) => handleShowPopup(e, msg)}
                  >
                    {/* Hiển thị nội dung tin nhắn */}
                    {msg.type === "image" ? (
                      msg.msg.includes(",") ? (
                        <div
                          className={`grid-container multiple-images`}
                        >
                          {msg.msg.split(",").map((url, index) => (
                            <div key={index} className="grid-item">
                              <img
                                src={url.trim()}
                                alt={`image-${index}`}
                                className="image-square"
                                onClick={() => handleImageClick(url.trim())}
                                style={{ cursor: "pointer" }}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Nếu chỉ có một URL ảnh, hiển thị ảnh đó
                        <div className={`grid-container multiple-images`}>
                          <div className="grid-item">
                            <img
                              src={msg.msg}
                              alt="image"
                              className="image-square"
                              onClick={() => handleImageClick(msg.msg)}
                              style={{ cursor: "pointer" }}
                            />
                          </div>
                        </div>
                      )
                    ) : msg.type === "video" ? (
                      <video
                        src={msg.msg}
                        controls
                        className="rounded-lg"
                        style={{ width: 250, height: 200, backgroundColor: "black" }}
                      />
                    ) : msg.type === "file" ? (
                      <a
                        href={msg.msg}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`fw-semibold ${msg.sender._id === user._id ? "text-white" : "text-dark"}`}
                      >
                        🡇 {msg.msg.split("_").pop() || "Tệp đính kèm"}
                      </a>
                    ) : msg.type === "system" ? (
                      <span><i>{msg.msg || ""}</i></span>
                    ) : (
                      <span>{msg.msg || ""}</span>
                    )}

                    {/* Thời gian gửi */}
                    <div
                      className={`text-end text-xs mt-1 ${msg?.sender?._id === user._id ? "text-white" : "text-secondary"
                        }`}
                    >
                      {convertTime(msg.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="bg-white p-2 border-top" >
          {/* Vùng nhập tin nhắn */}
          {(receiver.permission.includes(3) || receiver.role === 'leader' || receiver.role === 'deputy') ? (<>
            <div className="d-flex align-items-center">
              <input
                type="file"
                multiple
                accept=".doc,.docx,.xls,.xlsx,.pdf,.mp4"
                onChange={handleFileChange}
                ref={fileInputRef}
                style={{ display: "none" }} // Ẩn input
              />
              <button className="btn btn-light me-2" onClick={handleButtonClick}>
                <Paperclip size={20} />
              </button>

              <input
                type="file"
                multiple
                accept="image/jpeg,image/png"
                onChange={handleImageChange}
                ref={imageInputRef}
                style={{ display: "none" }} // Ẩn input
              />
              <button className="btn btn-light me-2" onClick={handleButtonClickImage}>
                <Image size={20} />
              </button>

              {/* Input tin nhắn */}
              <input
                className="form-control flex-1 p-2 border rounded-lg outline-none"
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(message, "text")}
                placeholder="Nhập tin nhắn..."
              />

              {/* Nút smile */}
              <button
                className="btn btn-light ms-2"
                data-bs-toggle="modal"
                data-bs-target="#iconModal"
              >
                <Smile size={20} />
              </button>
              <IconModal onSelect={handleEmojiSelect} />

              {/* Nút gửi */}
              <button
                className="btn btn-primary ms-2"
                onClick={() => handleMessage(message)}
              >
                <Send size={20} />
              </button>
            </div>
            <div className="preview-container d-flex flex-wrap gap-2 mt-2" >
              {previewImages.map((image, index) => (
                <div key={index} className="preview-item position-relative">
                  <img
                    src={image}
                    alt={`Xem trước ${index + 1}`}
                    className="rounded"
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                  />
                  <button
                    className="btn btn-danger btn-sm position-absolute top-0 end-0 d-flex justify-content-center align-items-center"
                    onClick={() => handleRemovePreview(index)}
                    style={{ borderRadius: "50%" }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {previewImages.length > 0 && (
                <button
                  className="btn btn-link text-danger mt-2"
                  onClick={handleClearAllPreviews}
                >
                  Xóa tất cả
                </button>
              )}
            </div>
          </>) : (<div className="d-flex flex-wrap align-items-center">Chỉ có trưởng nhóm/ phó nhóm mới được phép nhắn tin</div>)}

        </div>
      </div>

      {/* Call Screen Modal */}
      <CallScreen
        show={showCallScreen}
        onHide={() => {
          setShowCallScreen(false);
          setIsInitiator(false); // Reset khi đóng modal
        }}
        senderId={user._id}
        receiverId={receiver._id}
        callerName={user.username}
        receiverName={receiver.username}
        socketRef={props.socketRef}
        isInitiator={isInitiator} // Truyền state isInitiator
      />

      {/* Right Sidebar */}
      {showSidebar &&
        <div
          className="col-auto bg-white border-start"
          style={{ width: "300px", height: "100vh", overflowY: "auto" }}
        >
          {
            showManageGroup ?

              (<ManageGroup handleManageGroup={handleManageGroup} receiver={receiver} socketRef={props.socketRef} />) :

              (
                <>
                  {/* Header */}
                  <div className="border-bottom header-right-sidebar">
                    <h6 className="text-center">Thông tin hội thoại</h6>
                  </div>

                  {/* Group Profile Section */}
                  <div className="text-center p-3 border-bottom">
                    <div className="position-relative d-inline-block mb-2">

                      <img
                        src={avatarUrl ? avatarUrl : "/placeholder.svg"}
                        alt="Group"
                        className="rounded-circle"
                        style={{ width: "80px", height: "80px" }}
                        onClick={openModal}
                      />

                      {/* Input file ẩn */}
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleUpdateAvatarGroup}
                        ref={avatarInputRef}
                        style={{ display: "none" }} // Ẩn input
                      />

                      {/* Nút tùy chỉnh */}
                      <button className="btn btn-light btn-sm rounded-circle position-absolute bottom-0 end-0 p-1">
                        <Edit2 size={14} onClick={handleButtonUpdateClick} />
                      </button>
                    </div>
                    <h6 className="mb-3 d-flex align-items-center justify-content-center">
                      {props.roomData.receiver.username}
                    </h6>

                    {/* Action Buttons */}
                    <div className="d-flex justify-content-center gap-4">
                      <div className="text-center">
                        <button className="btn btn-light rounded-circle mb-1">
                          <BellOff size={20} />
                        </button>
                        <div className="small">Tắt thông báo</div>
                      </div>
                      <div className="text-center">
                        <button className="btn btn-light rounded-circle mb-1">
                          <Pin size={20} />
                        </button>
                        <div className="small">Ghim hội thoại</div>
                      </div>
                      <div className="text-center">
                        <button
                          className="btn btn-light rounded-circle mb-1"
                          onClick={() => {
                            if (
                              receiver.permission.includes(2) || receiver.role === 'leader' || receiver.role === 'deputy'
                            ) {
                              handleOpenAddMemberModal();
                            } else {
                              alert('k có quyền thêm');
                            }
                          }}
                        >
                          <UserPlus size={20} />
                        </button>
                        <div className="small">Thêm thành viên</div>
                      </div>
                      {(role === 'leader' || role === 'deputy') && <div className="text-center">
                        <button className="btn btn-light rounded-circle mb-1"
                          onClick={() => setShowManageGroup(true)}>
                          <Settings size={20} />
                        </button>
                        <div className="small">Quản lý nhóm</div>
                      </div>}
                    </div>
                  </div>

                  {/* Modal AddMember */}
                  <AddMemberModal
                    show={showAddMemberModal} // Truyền state hiển thị
                    onHide={handleCloseAddMemberModal} // Truyền hàm đóng modal
                    roomId={receiver._id} // Truyền roomId của nhóm
                  />

                  {/* Collapsible Sections */}
                  <div className="accordion accordion-flush" id="chatInfo">
                    {sections.map(({ id, title, icon: Icon, content, empty }) => (
                      <div key={id} className="accordion-item">
                        <h2 className="accordion-header">
                          <button
                            className="accordion-button collapsed"
                            data-bs-toggle="collapse"
                            data-bs-target={`#${id}Collapse`}
                          >
                            <Icon size={20} className="me-2" />
                            {title}
                          </button>
                        </h2>

                        <div
                          id={`${id}Collapse`}
                          className="accordion-collapse collapse"
                        >
                          <div className="accordion-body">
                            {content ? (
                              content
                            ) : empty ? (
                              <div className="text-center text-muted">
                                <small>{empty}</small>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>


                  {/* Thành viên */}
                  <div
                    className="d-flex align-items-center justify-content-between p-3 border-bottom hover-bg-light cursor-pointer"
                    onClick={() => setShowMemberModal(true)}
                  >
                    <div className="d-flex align-items-center">
                      <Users size={20} className="me-2" />
                      <span>Thành viên</span>
                    </div>
                    <span className="badge bg-primary">{members.length}</span></div>

                  {/* Modal danh sách thành viên */}
                  {showMemberModal && (
                    <div className="modal show d-block" tabIndex="-1" role="dialog">
                      <div className="modal-dialog" role="document">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title">Danh sách thành viên</h5>
                            <button
                              type="button"
                              className="btn-close"
                              onClick={() => setShowMemberModal(false)}
                            ></button>
                          </div>
                          <div className="modal-body">
                            {members.length > 0 ? (
                              <ul className="list-group">
                                {members.map((member, index) => (
                                  <li
                                    key={index}
                                    className="list-group-item d-flex align-items-center justify-content-between"
                                  >
                                    <div className="d-flex align-items-center">
                                      <img
                                        src={member.avatar || "/placeholder.svg"}
                                        alt={member.username}
                                        className="rounded-circle me-2"
                                        style={{ width: "40px", height: "40px" }}
                                      />
                                      <span>{member.username}</span>
                                    </div>
                                    {((role === 'leader' && member.role != 'leader') || (role === 'deputy' && member.role != 'leader')) &&
                                      <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleRemoveMember(member._id)}
                                      >
                                        Xóa
                                      </button>}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p>Không có thành viên nào.</p>
                            )}
                          </div>
                          <div className="modal-footer">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setShowMemberModal(false)}
                            >
                              Đóng
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}


                  {/* View All Button */}
                  <div className="p-3 border-top border-bottom">
                    <button className="btn btn-light w-100">Xem tất cả</button>
                  </div>



                  {/* Security Settings */}
                  <div className="accordion accordion-flush" id="securitySettings">
                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button
                          className="accordion-button collapsed"
                          data-bs-toggle="collapse"
                          data-bs-target="#securityCollapse"
                        >
                          <Shield size={20} className="me-2" />
                          Thiết lập bảo mật
                        </button>
                      </h2>

                      <div
                        id="securityCollapse"
                        className="accordion-collapse collapse"
                      >
                        <div className="accordion-body p-0">
                          {/* Self-destructing Messages */}
                          <div className="d-flex align-items-center justify-content-between p-3 border-bottom hover-bg-light cursor-pointer">
                            <div className="d-flex align-items-center">
                              <div
                                className="d-flex align-items-center justify-content-center rounded-circle bg-light"
                                style={{ width: "32px", height: "32px" }}
                              >
                                <Clock size={18} className="text-muted" />
                              </div>
                              <div className="ms-2">
                                <div className="d-flex align-items-center">
                                  Tin nhắn tự xóa
                                  <small className="ms-1">
                                    <i
                                      className="text-muted"
                                      style={{ fontSize: "14px" }}
                                    >
                                      (?)
                                    </i>
                                  </small>
                                </div>
                                <small className="text-muted">
                                  Chỉ dành cho trưởng hoặc phó nhóm
                                </small>
                              </div>
                            </div>
                          </div>

                          {/* Hide Conversation */}
                          <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
                            <div className="d-flex align-items-center">
                              <div
                                className="d-flex align-items-center justify-content-center rounded-circle bg-light"
                                style={{ width: "32px", height: "32px" }}
                              >
                                <EyeOff size={18} className="text-muted" />
                              </div>
                              <div className="ms-2">Ẩn trò chuyện</div>
                            </div>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                style={{ width: "40px", height: "20px" }}
                              />
                            </div>
                          </div>

                          {/* Report */}
                          <div className="d-flex align-items-center p-3 border-bottom hover-bg-light cursor-pointer">
                            <div
                              className="d-flex align-items-center justify-content-center rounded-circle bg-light"
                              style={{ width: "32px", height: "32px" }}
                            >
                              <AlertTriangle size={18} className="text-danger" />
                            </div>
                            <div className="ms-2 text-danger">Báo xấu</div>
                          </div>

                          {/* Delete Chat History */}
                          <div className="d-flex align-items-center p-3 border-bottom hover-bg-light cursor-pointer">
                            <div
                              className="d-flex align-items-center justify-content-center rounded-circle bg-light"
                              style={{ width: "32px", height: "32px" }}
                            >
                              <Trash2 size={18} className="text-danger" />
                            </div>
                            <div className="ms-2 text-danger">
                              Xóa lịch sử trò chuyện
                            </div>
                          </div>

                          {/* Leave Group */}
                          <div className="d-flex align-items-center p-3 hover-bg-light cursor-pointer">
                            <div
                              className="d-flex align-items-center justify-content-center rounded-circle bg-light"
                              style={{ width: "32px", height: "32px" }}
                            >
                              <LogOut size={18} className="text-danger" />
                            </div>
                            <div className="ms-2 text-danger">Rời nhóm</div>
                          </div>

                          {/* DissolveDissolve Group */}
                          {role === "leader"   && (  <button className="d-flex align-items-center p-3 hover-bg-light cursor-pointer w-100 "
                          onClick = {handleDissolveGroup}
                          >
                            <div
                              className="d-flex align-items-center justify-content-center rounded-circle bg-light"
                              style={{ width: "32px", height: "32px" }}
                            >
                              <UserX size={18} className="text-danger" />
                            </div>
                            <div className="ms-2 text-danger">Giải tán nhóm</div>
                          </button>)}

                        </div>


                      </div>
                    </div>
                  </div>
                </>
              )

          }
        </div>

      }


      {popupVisible && selectedMessage?.type !== "system" && (
        <div
          className="popup-menu"
          style={{
            position: "absolute",
            top: popupPosition.y,
            left: popupPosition.x,
            backgroundColor: "white",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            zIndex: 1000,
            padding: "10px",
          }}
        >
          <div className="popup-item d-flex align-items-center" onClick={() => console.log("Trả lời")}>
            <Reply size={16} className="me-2" />
            <span>Trả lời</span>
          </div>
          <div className="popup-item d-flex align-items-center" onClick={() => handleOpenShareModal(selectedMessage)}>
            <Share size={16} className="me-2" />
            <span>Chia sẻ</span>
          </div>
          <hr />
          {selectedMessage?.type === "text" && (
            <div className="popup-item d-flex align-items-center" onClick={() => navigator.clipboard.writeText(selectedMessage.msg)}>
              <Copy size={16} className="me-2" />
              <span>Copy tin nhắn</span>
            </div>
          )}
          {selectedMessage?.type === "image" && (
            <div className="popup-item d-flex align-items-center" onClick={() => window.open(selectedMessage.msg, "_blank")}>
              <Image size={16} className="me-2" />
              <span>Lưu ảnh</span>
            </div>
          )}
          {(selectedMessage?.type === "video" || selectedMessage?.type === "file") && (
            <div className="popup-item d-flex align-items-center" onClick={() => window.open(selectedMessage.msg, "_blank")}>
              <Download size={16} className="me-2" />
              <span>Tải về</span>
            </div>
          )}
          <hr />
          {selectedMessage?.sender?._id === user?._id &&
            new Date() - new Date(selectedMessage.createdAt) < 3600000 && (
              <div
                className="popup-item d-flex align-items-center text-danger"
                onClick={() => handleRecallMessage(selectedMessage)}>
                <RotateCw size={16} className="me-2" />
                <span>Thu hồi</span>
              </div>
            )}
          <div
            className="popup-item d-flex align-items-center text-danger"
            onClick={() => handleDeleteMessageForMe(selectedMessage._id)}>
            <Trash2 size={16} className="me-2" />
            <span>Xóa chỉ ở phía tôi</span>
          </div>

        </div>

      )}

      {selectedImage && (
        <ImageViewer imageUrl={selectedImage} onClose={handleCloseImageViewer} />
      )}


      {/* Modal */}
      <ShareMsgModal
        show={showShareModal}
        onHide={() => setShowShareModal(false)}
        message={selectedMessageShareModal}
        conversations={conversations}
        onlineUsers={props.onlineUsers}
      />
    </div>
  );
}
