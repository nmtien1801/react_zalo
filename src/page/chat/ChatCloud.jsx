import { useState, useRef, useEffect } from "react";
import {
  ImageIcon,
  File,
  LinkIcon,
  Shield,
  Clock,
  EyeOff,
  Smile,
  Paperclip,
  Send,
  Edit2,
  Search,
  Layout,
} from "lucide-react";
import "./Chat.scss";
import AccountInfo from "../info/accountInfo";
import { useSelector, useDispatch } from "react-redux";
import { uploadAvatar } from '../../redux/profileSlice.js'
import IconModal from '../../component/IconModal.jsx'

export default function ChatCloud(props) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.userInfo);
  const [showSidebar, setShowSidebar] = useState(true);
  const fileInputRef = useRef(null); // Ref để truy cập input file ẩn

  const [sections] = useState([
    { id: "media", title: "Ảnh/Video", icon: ImageIcon },
    { id: "files", title: "File", icon: File },
    { id: "links", title: "Link", icon: LinkIcon },
  ]);

  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const [message, setMessage] = useState(""); // input
  const [messages, setMessages] = useState([]); // all hội thoại

  // console.log("props: ", props);
  useEffect(() => {
    if (props.allMsg) {
      setMessages(props.allMsg);
    }
  }, [props.allMsg]);

  const sendMessage = async (msg, type) => {
    props.handleSendMsg(msg, type);
    setMessage("");
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

        sendMessage(response.payload.DT, type);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert('err')
    }
  };

  // Kích hoạt input file khi nhấn nút
  const handleButtonClick = () => {
    fileInputRef.current.click(); // Mở dialog chọn file
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

  return (
    <div className="row g-0 h-100">
      {/* Main Chat Area */}
      <div className="col bg-light">
        {/* Chat Header */}
        <div className="bg-white p-2 d-flex align-items-center border-bottom justify-content-between">
          <div className=" d-flex align-items-center">
            <img
              src="/cloud.jpg"
              className="rounded-circle"
              alt=""
              style={{ width: "40px", height: "40px" }}
              onClick={openModal}
            />

            <AccountInfo isOpen={isOpen} closeModal={closeModal} />

            <div className="ms-2">
              <div className="fw-medium">Cloud của tôi</div>
              <small className="text-muted">
                Lưu và đồng bộ dữ liệu giữa các thiết bị
              </small>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
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
          className="p-3"
          style={{ height: "calc(100vh - 128px)", overflowY: "auto" }}
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
                    className={`p-3 max-w-[70%] break-words rounded-3 ${msg.type === "text" || msg.type === "file"
                      ? msg.sender._id === user._id
                        ? "bg-primary text-white"
                        : "bg-light text-dark"
                      : "bg-transparent"
                      }`}
                  >
                    {/* Hiển thị nội dung tin nhắn */}
                    {msg.type === "image" ? (
                      <img
                        src={msg.msg}
                        alt="image"
                        className="rounded-lg"
                        style={{ width: 200, height: 200, objectFit: "cover" }}
                      />
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
                    ) : (
                      <span>{msg.msg || ""}</span>
                    )}

                    {/* Thời gian gửi */}
                    <div
                      className={`text-end text-xs mt-1 ${msg.sender._id === user._id ? "text-white" : "text-secondary"
                        }`}
                    >
                      {convertTime(msg.createdAt)}
                    </div>
                  </div>

                </div>
              ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="bg-white p-2 border-top">
          <div className="d-flex align-items-center">
            <button
              className="btn btn-light me-2"
              data-bs-toggle="modal"
              data-bs-target="#iconModal"
            >
              <Smile size={20} />
            </button>

            {/* Modal riêng */}
            <IconModal onSelect={handleEmojiSelect} />

            {/* Input file ẩn */}
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,video/mp4,.doc,.docx,.xls,.xlsx,.pdf"
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ display: "none" }} // Ẩn input
            />
            <button className="btn btn-light me-2" onClick={handleButtonClick} >
              <Paperclip size={20} />
            </button>
            <input
              className="form-control flex-1 p-2 border rounded-lg outline-none"
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(message, "text")}
              placeholder="Nhập tin nhắn..."
            />
            <button className="btn btn-primary ms-2" onClick={() => sendMessage(message, "text")}>
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      {showSidebar && (
        <div
          className="col-auto bg-white border-start"
          style={{ width: "300px", height: "100vh", overflowY: "auto" }}
        >
          {/* Header */}
          <div className="border-bottom header-right-sidebar">
            <h6 className="text-center">Thông tin hội thoại</h6>
          </div>

          {/* Profile Section */}
          <div className="text-center p-3 border-bottom">
            <div className="position-relative d-inline-block mb-2">
              <img
                src="/cloud.jpg"
                alt="Profile"
                className="rounded-circle"
                style={{ width: "80px", height: "80px" }}
                onClick={openModal}
              />
              <button className="btn btn-light btn-sm rounded-circle position-absolute bottom-0 end-0 p-1">
                <Edit2 size={14} />
              </button>
            </div>
            <h5 className="mb-3">Cloud của tôi</h5>
            <small className="text-muted">
              Lưu trữ và truy cập nhanh những nội dung quan trọng của bạn ngay
              trên zalo
            </small>
          </div>

          {/* Reminders */}
          <div className="border-bottom">
            <div className="d-flex align-items-center p-3 hover-bg-light cursor-pointer">
              <Clock size={20} className="text-muted me-2" />
              <div>Danh sách nhắc hẹn</div>
            </div>
          </div>

          {/* Collapsible Sections */}
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
                <div
                  id={`${id}Collapse`}
                  className="accordion-collapse collapse"
                >
                  <div className="accordion-body text-center text-muted">
                    <small>{`Chưa có ${title} được chia sẻ trong hội thoại này`}</small>
                  </div>
                </div>
              </div>
            ))}
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
                <div className="accordion-body">
                  {/* Hide Conversation */}
                  <div className="d-flex align-items-center justify-content-between p-2">
                    <div className="d-flex align-items-center">
                      <EyeOff size={20} className="text-muted me-2" />
                      <div>Ẩn trò chuyện</div>
                    </div>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
