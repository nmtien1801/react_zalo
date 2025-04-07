import { useState, useEffect } from "react";
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
  Layout,
  Search,
} from "lucide-react";
import "./Chat.scss";
import GroupInfo from "../info/groupInfo";
import { useSelector, useDispatch } from "react-redux";

export default function ChatGroup(props) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.userInfo);
  const [showSidebar, setShowSidebar] = useState(true);
  const [message, setMessage] = useState(""); // input
  const [messages, setMessages] = useState([]); // all hội thoại
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const [sections] = useState([
    { id: "media", title: "Ảnh/Video", icon: ImageIcon },
    { id: "files", title: "File", icon: File },
    { id: "links", title: "Link", icon: LinkIcon },
  ]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (props.allMsg) {
      setMessages(props.allMsg);
    }
  }, [props.allMsg]);

  const sendMessage = async () => {
    props.handleSendMsg(message);
    setMessage("");
  };

  return (
    <div className="row g-0 h-100">
      {/* Main Chat Area */}
      <div className="col bg-light">
        {/* Chat Header */}
        <div className="bg-white p-2 d-flex align-items-center border-bottom justify-content-between">
          <div className=" d-flex align-items-center">
            <img
              src="/placeholder.svg"
              className="rounded-circle"
              alt=""
              style={{ width: "40px", height: "40px" }}
              onClick={openModal}
            />

            <GroupInfo isOpen={isOpen} closeModal={closeModal} />

            <div className="ms-2">
              <div className="fw-medium">Võ Trường Khang</div>
              <small className="text-muted">Hoạt động 2 giờ trước</small>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-light rounded-circle mb-1">
              <Users size={20} />
            </button>

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
                  className={`p-2 my-1 d-flex ${msg.sender._id === user._id && "justify-content-end"
                    }`}
                >
                  <span
                    className={`p-3 ${msg.sender._id === user._id
                      ? "bg-primary border rounded-pill" // Tin nhắn của user căn phải
                      : "bg-white border rounded-pill" // Tin nhắn của người khác căn trái
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

          {/* Group Profile Section */}
          <div className="text-center p-3 border-bottom">
            <div className="position-relative d-inline-block mb-2">
              <img
                src="/placeholder.svg"
                alt="Group"
                className="rounded-circle"
                style={{ width: "80px", height: "80px" }}
                onClick={openModal}
              />
              <button className="btn btn-light btn-sm rounded-circle position-absolute bottom-0 end-0 p-1">
                <Edit2 size={14} />
              </button>
            </div>
            <h6 className="mb-3 d-flex align-items-center justify-content-center">
              Công Nghệ Mới
              <Edit2 size={16} className="ms-2 text-muted" />
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
                <button className="btn btn-light rounded-circle mb-1">
                  <UserPlus size={20} />
                </button>
                <div className="small">Thêm thành viên</div>
              </div>
              <div className="text-center">
                <button className="btn btn-light rounded-circle mb-1">
                  <Settings size={20} />
                </button>
                <div className="small">Quản lý nhóm</div>
              </div>
            </div>
          </div>

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
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
