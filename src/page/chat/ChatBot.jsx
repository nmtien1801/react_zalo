import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { chatGPT } from "../../redux/chatSlice";
import "./Chat.scss";

export default function ChatBot() {
  const user = useSelector((state) => state.auth.userInfo);
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const chatbotImage = "https://cdn-icons-png.flaticon.com/512/4712/4712027.png";

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { sender: "user", content: message };
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setLoading(true);

    try {
      const res = await dispatch(chatGPT(message)).unwrap();
      const reply = res.reply;
      setMessages((prev) => [...prev, { sender: "bot", content: reply }]);
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", content: "Xin lỗi, đã xảy ra lỗi!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages]);

  return (
    <div className="container-fluid h-100 d-flex justify-content-center align-items-center">
      <div className="chat-box h-100 w-100 w-md-50 w-lg-25 mx-auto">
        <div className="bg-white h-100 d-flex flex-column shadow rounded overflow-hidden">

          {/* Header */}
          <div className="bg-white p-3 d-flex align-items-center border-bottom">
            <img
              src={chatbotImage}
              className="rounded-circle"
              alt="Chatbot"
              style={{ width: "40px", height: "40px" }}
            />
            <div className="ms-2">
              <div className="fw-semibold fs-5">Trợ lý ảo</div>
              <div className="text-muted small">Sẵn sàng hỗ trợ bạn</div>
            </div>
          </div>

          {/* Chat content */}
          <div
            className="flex-grow-1 px-3 py-2"
            style={{ overflowY: "auto", backgroundColor: "#f8f9fa" }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`d-flex mb-2 ${msg.sender === "user" ? "justify-content-end" : "justify-content-start"}`}
              >
                <div
                  className={`p-2 rounded-pill ${msg.sender === "user" ? "bg-primary text-white" : "bg-white text-dark"}`}
                  style={{ maxWidth: "70%" }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="d-flex justify-content-start mb-2 text-muted small">
                Đang trả lời...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <div className="bg-white p-3 border-top">
            <div className="d-flex">
              <input
                className="form-control"
                type="text"
                placeholder="Nhập tin nhắn..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className="btn btn-primary ms-2" onClick={sendMessage}>
                <Send size={20} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
