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
} from "lucide-react";
import "./Chat.scss";
import AccountInfo from "../info/AccountInfo";
import { useSelector, useDispatch } from "react-redux";
import CallScreen from "../../component/CallScreen.jsx";

export default function ChatPerson(props) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.userInfo);
  const receiver = props.roomData.receiver;

  const [showSidebar, setShowSidebar] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showCallScreen, setShowCallScreen] = useState(false);
  const [isInitiator, setIsInitiator] = useState(false); // Thêm state để theo dõi người khởi tạo

  useEffect(() => {
    if (props.allMsg) {
      setMessages(props.allMsg);
    }
  }, [props.allMsg]);

  const sendMessage = () => {
    props.handleSendMsg(message);
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
            <AccountInfo isOpen={isOpen} closeModal={closeModal} receiver={receiver} />
            <div className="ms-2">
              <div className="fw-medium">Võ Trường Khang</div>
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
        <div className="p-3" style={{ height: "calc(100vh - 128px)", overflowY: "auto" }}>
          <div className="flex flex-col justify-end">
            {messages &&
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 my-1 d-flex ${msg.sender._id === user._id && "justify-content-end"
                    }`}
                >
                  <span
                    className={`p-3 ${msg.sender._id === user._id
                      ? "bg-primary border rounded-pill"
                      : "bg-white border rounded-pill"
                      }`}
                  >
                    {msg.msg}
                  </span>
                </div>
              ))}
          </div>
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
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Nhập tin nhắn..."
            />
            <button className="btn btn-primary ms-2" onClick={sendMessage}>
              <Send size={20} />
            </button>
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
                src="/placeholder.svg"
                alt="Profile"
                className="rounded-circle"
                style={{ width: "80px", height: "80px" }}
                onClick={openModal}
              />
              <button className="btn btn-light btn-sm rounded-circle position-absolute bottom-0 end-0 p-1">
                <Edit2 size={14} />
              </button>
            </div>
            <h6 className="mb-3">Võ Trường Khang</h6>
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
    </div>
  );
}