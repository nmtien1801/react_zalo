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
// import { getMessages, sendMessages } from "../../redux/chatSlice";

export default function ChatCloud() {
  const [showSidebar, setShowSidebar] = useState(true);

  const [sections] = useState([
    { id: "media", title: "Ảnh/Video", icon: ImageIcon },
    { id: "files", title: "File", icon: File },
    { id: "links", title: "Link", icon: LinkIcon },
  ]);

  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const [input, setInput] = useState("");

  const messages = useSelector((state) => state.chat.message);
  const messagesEndRef = useRef(null);
  const prevMessagesCount = useRef(messages.length);
  const dispatch = useDispatch();

  const sendMessage = async () => {
    if (!input.trim()) return;
    // let res = await dispatch(sendMessages({ clientId: 2, senderId: 1, message: input }));
    // if (res.payload.EC === 0) {
    //     setInput("");
    //     await dispatch(getMessages());
    // }
  };

  // const fetchMessages = async () => {
  // await dispatch(getMessages());
  // };

  // useEffect(() => {
  //     dispatch(getMessages());
  //     const interval = setInterval(fetchMessages, 1000); // Lặp lại mỗi 1 giây
  //     return () => clearInterval(interval); // Cleanup khi component unmount
  // }, []);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (messages.length > prevMessagesCount.current) {
      const chatContent = document.querySelector(".chat-content");
      chatContent.scrollTop = chatContent.scrollHeight; // Cuộn đến cuối phần Chat Content
    }
    prevMessagesCount.current = messages.length;
  }, [messages]);

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
          {/* Chat messages would go here */}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 my-1 max-w-[80%] rounded-lg ${
                msg.senderId === 2
                  ? "bg-blue-100 self-end ml-auto"
                  : "bg-gray-200"
              }`}
            >
              {msg.message}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white p-2 border-top">
          <div className="d-flex align-items-center">
            <button className="btn btn-light me-2">
              <Smile size={20} />
            </button>
            <button className="btn btn-light me-2">
              <Paperclip size={20} />
            </button>
            <input
              className="form-control flex-1 p-2 border rounded-lg outline-none"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Nhập tin nhắn..."
            />
            <button className="btn btn-primary ms-2" onClick={sendMessage}>
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
