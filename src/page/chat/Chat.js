import { useState } from "react";
import { Search, UserPlus, Users } from "lucide-react";
import "./Chat.scss";
import ChatPerson from "./ChatPerson";
import ChatGroup from "./ChatGroup";
import ChatCloud from "./ChatCloud";

export default function ChatInterface() {
  const [selected, setSelected] = useState(0);
  const [conversations] = useState([
    {
      id: 1,
      name: "Cloud",
      message: "[Thông báo] Giới thiệu về Trường Kha...",
      time: "26/07/24",
      avatar: "/cloud.jpg",
      type: 3,
    },
    {
      id: 2,
      name: "Thu",
      message: "[Thông báo] Giới thiệu thêm Thu",
      time: "23/07/24",
      avatar: "/placeholder.svg",
      type: 1,
    },
    {
      id: 3,
      name: "IGH - DHKTPMTB - CT7",
      message: "Võ Văn Hòa, Dung",
      time: "20/07/24",
      avatar: "/placeholder.svg",
      type: 2,
    },
    // Add more conversations as needed
  ]);

  const [typeChatRoom, setTypeChatRoom] = useState("cloud");

  const handleTypeChat = (type) => {
    if (type === 1) {
      setTypeChatRoom("single");
    } else if (type === 2) {
      setTypeChatRoom("group");
    } else {
      setTypeChatRoom("cloud");
    }
  };

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
                />
                <button className="btn btn-light  cursor-pointer border">
                  <Search size={16} />
                </button>
              </div>

              <button className="btn btn-light rounded-circle mb-1">
                <UserPlus size={20} />
              </button>

              <button className="btn btn-light rounded-circle mb-1">
                <Users size={20} />
              </button>
            </div>

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
          </div>

          {/* Conversations List */}
          <div
            className="overflow-auto"
            style={{ height: "calc(100vh - 60px)" }}
          >
            {conversations.map((chat) => (
              <div
                key={chat.id}
                className="d-flex align-items-center p-2 border-bottom hover-bg-light cursor-pointer"
                onClick={() => handleTypeChat(chat.type)}
              >
                <img
                  src={chat.avatar || "/placeholder.svg"}
                  className="rounded-circle"
                  alt=""
                  style={{ width: "48px", height: "48px" }}
                />
                <div className="ms-2 overflow-hidden ">
                  <div className="text-truncate fw-medium ">{chat.name}</div>
                  <div className="text-truncate small text-muted ">
                    {chat.message}
                  </div>
                </div>
                <small className="text-muted ms-auto">{chat.time}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="col">
          {typeChatRoom === "group" ? (
            <ChatGroup />
          ) : typeChatRoom === "single" ? (
            <ChatPerson />
          ) : (
            <ChatCloud />
          )}
        </div>
      </div>
    </div>
  );
}
