import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import "./Chat.scss";
import { useSelector, useDispatch } from "react-redux";
import { chatGPT } from "../../redux/chatSlice";

export default function ChatBot(props) {
  const user = useSelector((state) => state.auth.userInfo);
  const messagesEndRef = useRef(null);
  const chatbotImage = "https://cdn-icons-png.flaticon.com/512/4712/4712027.png";
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { sender: "user", content: message };
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");

    try {
      const res = await dispatch(chatGPT(message)).unwrap();
      const reply = res.reply;
      setMessages((prev) => [...prev, { sender: "bot", content: reply }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", content: "Xin lỗi, đã xảy ra lỗi!" },
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="row g-0 h-100 w-100 w-md-50 w-lg-25 mx-auto">
      <div className="col bg-light">
        {/* Header */}
        <div className="bg-white p-3 d-flex align-items-center border-bottom shadow-sm">
          <img
            src={chatbotImage}
            className="rounded-circle"
            alt="Chatbot"
            style={{ width: "40px", height: "40px" }}
          />
          <div className="ms-2">
            <div className="fw-semibold fs-5">Trợ lý ảo</div>
            <div className="text-muted small">Sẵn sàng giúp bạn</div>
          </div>
        </div>

        {/* Chat content */}
        <div
          className="chat-container px-3 py-2"
          style={{
            height: "calc(100vh - 140px)",
            overflowY: "auto",
            backgroundColor: "#f8f9fa",
          }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`d-flex mb-2 ${msg.sender === "user" ? "justify-content-end" : "justify-content-start"}`}
            >
              <div
                className={`p-2 rounded-pill ${msg.sender === "user" ? "bg-primary text-white" : "bg-white text-dark"
                  }`}
                style={{ maxWidth: "70%" }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <div className="bg-white p-3 border-top shadow-sm">
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
  );
}
