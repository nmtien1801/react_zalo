import { useState, useRef, useEffect } from "react";
import {
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
  Image
} from "lucide-react";
import "./Chat.scss";
import AccountInfo from "../info/AccountInfo.jsx";
import { useSelector, useDispatch } from "react-redux";
import CallScreen from "../../component/CallScreen.jsx";
import { uploadAvatar } from '../../redux/profileSlice.js'
import IconModal from '../../component/IconModal.jsx'
import { deleteMessageForMeService, recallMessageService } from "../../service/chatService.js";
import ImageViewer from "./ImageViewer.jsx";

export default function ChatPerson(props) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.userInfo);
  const receiver = props.roomData.receiver;
  const fileInputRef = useRef(null); // Ref để truy cập input file ẩn
  const imageInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [showSidebar, setShowSidebar] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showCallScreen, setShowCallScreen] = useState(false);
  const [hasSelectedImages, setHasSelectedImages] = useState(false);
  const [isInitiator, setIsInitiator] = useState(false); // Thêm state để theo dõi người khởi tạo

  // Popup Chuột phải
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [selectedMessage, setSelectedMessage] = useState(null);

  const [previewImages, setPreviewImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // ImageViewer
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (props.allMsg) {
      setMessages(props.allMsg);
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

  const [sections] = useState([
    { id: "media", title: "Ảnh/Video", icon: ImageIcon },
    { id: "files", title: "File", icon: File },
    { id: "links", title: "Link", icon: LinkIcon },
  ]);

  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

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
    console.log(selectedFile);
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

  // Kích hoạt input file khi nhấn nút
  const handleButtonClick = () => {
    fileInputRef.current.click(); // Mở dialog chọn file
  };

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
      const response = await deleteMessageForMeService(id, user._id);
      if (response.EC === 0) {
        console.log("Tin nhắn đã được xóa chỉ ở phía tôi:", response.DT);

        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== id)
        );
      } else {
        console.error("Xóa tin nhắn thất bại:", response.EM);
      }
    } catch (error) {
      console.error("Lỗi khi xóa tin nhắn:", error);
    }
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
            <AccountInfo isOpen={isOpen} closeModal={closeModal} user={receiver} />
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
                  className={`p-2 my-1 d-flex ${msg.sender._id === user._id ? "justify-content-end" : "justify-content-start"
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
                      className={`text-end text-xs mt-1 ${msg.sender._id === user._id
                        ? msg.type === "image"
                          ? "text-secondary" // Nếu là ảnh, đổi thành text-secondary
                          : "text-white" // Nếu không, giữ text-white
                        : "text-secondary"
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
      {showSidebar && (
        <div className="col-auto bg-white border-start" style={{ width: "300px", height: "100vh", overflowY: "auto" }}>
          <div className="border-bottom header-right-sidebar">
            <h6 className="text-center">Thông tin hội thoại</h6>
          </div>
          <div className="text-center p-3 border-bottom">
            <div className="position-relative d-inline-block mb-2">

              <img
                src={props.roomData.receiver.avatar || "/placeholder.svg"}
                alt="Profile"
                className="rounded-circle"
                style={{ width: "80px", height: "80px" }}
                onClick={openModal}
              />

            </div>
            <h6 className="mb-3">{props.roomData.receiver.username}</h6>
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
                <button className="btn btn-light rounded-circle mb-1">
                  <Users size={20} />
                </button>
                <div className="small">Tạo nhóm trò chuyện</div>
              </div>
            </div>
          </div>
          <div className="border-bottom">
            <div className="d-flex align-items-center p-3 hover-bg-light cursor-pointer">
              <Clock size={20} className="text-muted me-2" />
              <div>Danh sách nhắc hẹn</div>
            </div>
            <div className="d-flex align-items-center p-3 hover-bg-light cursor-pointer">
              <Users size={20} className="text-muted me-2" />
              <div>20 nhóm chung</div>
            </div>
          </div>
          <div className="accordion accordion-flush" id="chatInfo">
            {sections.map(({ id, title, icon: Icon }) => (
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
                <div id={`${id}Collapse`} className="accordion-collapse collapse">
                  <div className="accordion-body text-center text-muted">
                    <small>{`Chưa có ${title} được chia sẻ trong hội thoại này`}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
              <div id="securityCollapse" className="accordion-collapse collapse">
                <div className="accordion-body">
                  <div className="d-flex align-items-center justify-content-between p-2 hover-bg-light cursor-pointer">
                    <div className="d-flex align-items-center">
                      <Clock size={20} className="text-muted me-2" />
                      <div>
                        <div>Tin nhắn tự xóa</div>
                        <small className="text-muted">Không bao giờ</small>
                      </div>
                    </div>
                    <ChevronDown size={20} className="text-muted" />
                  </div>
                  <div className="d-flex align-items-center justify-content-between p-2">
                    <div className="d-flex align-items-center">
                      <EyeOff size={20} className="text-muted me-2" />
                      <div>Ẩn trò chuyện</div>
                    </div>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" role="switch" />
                    </div>
                  </div>
                  <div className="d-flex align-items-center p-2 hover-bg-light cursor-pointer text-danger">
                    <AlertTriangle size={20} className="me-2" />
                    <div>Báo xấu</div>
                  </div>
                  <div className="d-flex align-items-center p-2 hover-bg-light cursor-pointer text-danger">
                    <Trash2 size={20} className="me-2" />
                    <div>Xóa lịch sử trò chuyện</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
          <div className="popup-item d-flex align-items-center" onClick={() => handleShare(selectedMessage)}>
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
          {selectedMessage?.sender._id === user._id &&
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
    </div>
  );
}