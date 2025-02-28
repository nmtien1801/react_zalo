import { useState } from "react";
import { Search, ImageIcon, File, LinkIcon } from "lucide-react";
import "./Chat.scss";
import ChatPerson from "./ChatPerson";
import ChatGroup from "./ChatGroup";

export default function ChatInterface() {
  const [conversations] = useState([
    {
      id: 1,
      name: "Võ Trường Khang",
      message: "[Thông báo] Giới thiệu về Trường Kha...",
      time: "26/07/24",
      avatar: "/placeholder.svg",
    },
    {
      id: 2,
      name: "Thu",
      message: "[Thông báo] Giới thiệu thêm Thu",
      time: "23/07/24",
      avatar: "/placeholder.svg",
    },
    {
      id: 3,
      name: "IGH - DHKTPMTB - CT7",
      message: "Võ Văn Hòa, Dung",
      time: "20/07/24",
      avatar: "/placeholder.svg",
    },
    // Add more conversations as needed
  ]);

  const [sections] = useState([
    { id: "media", title: "Ảnh/Video", icon: ImageIcon },
    { id: "files", title: "File", icon: File },
    { id: "links", title: "Link", icon: LinkIcon },
  ]);

  const [isChatGroup, setIsChatGroup] = useState(false);

  return (
    <div className="container-fluid vh-100 p-0">
      <div className="row h-100 g-0 ">
        {/* Left Sidebar */}
        <div
          className="col-3 border-end bg-white"
          style={{ maxWidth: "300px" }}
        >
          {/* Profile and Search */}
          <div className="p-3 border-bottom">
            <div className="d-flex align-items-center ">
              <img
                src="/placeholder.svg"
                className="rounded-circle"
                alt=""
                style={{ width: "32px", height: "32px" }}
              />
              <div className="input-group ms-2">
                <input
                  type="text"
                  className="form-control form-control-sm bg-light"
                  placeholder="Tìm kiếm"
                />
                <span className="input-group-text bg-light border-start-0">
                  <Search size={16} />
                </span>
              </div>
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
                onClick={() => setIsChatGroup(!isChatGroup)}
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
            {isChatGroup ? <ChatGroup /> : <ChatPerson />}
        </div>
      </div>
    </div>
  );
}
