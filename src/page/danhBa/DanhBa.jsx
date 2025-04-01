"use client";

import { useState } from "react";
import {
  BellOff,
  Pin,
  UserPlus,
  Settings,
  Users,
  Clock,
  Bookmark,
  ImageIcon,
  File,
  LinkIcon,
  Shield,
  EyeOff,
  AlertTriangle,
  Trash2,
  LogOut,
  Edit2,
} from "lucide-react";

export default function ChatInfoPanel() {
  const [sections] = useState([
    {
      id: "members",
      title: "Thành viên nhóm",
      icon: Users,
      content: "5 thành viên",
    },
    {
      id: "news",
      title: "Bảng tin nhóm",
      icon: Users,
      content: (
        <div className="d-flex flex-column align-items-start">
          {/* Clock */}
          <div
            className="d-flex align-items-center hover-bg-light cursor-pointer"
            style={{ width: "100%" }}
          >
            <div
              className="d-flex align-items-center justify-content-center"
              style={{ width: "38px", height: "60px" }}
            >
              <Clock size={18} />
            </div>
            <div className="ms-2">Danh sách nhắc hẹn</div>
          </div>

          {/* Bookmark */}
          <div
            className="d-flex align-items-center hover-bg-light cursor-pointer"
            style={{ width: "100%" }}
          >
            <div
              className="d-flex align-items-center justify-content-center"
              style={{ width: "38px", height: "60px" }}
            >
              <Bookmark size={18} />
            </div>
            <div className="ms-2">Ghi chú, ghim, bình chọn</div>
          </div>
        </div>
      ),
    },

    {
      id: "media",
      title: "Ảnh/Video",
      icon: ImageIcon,
      empty: "Chưa có Ảnh/Video được chia sẻ trong hội thoại này",
    },
    {
      id: "files",
      title: "File",
      icon: File,
      empty: "Chưa có File được chia sẻ trong hội thoại này",
    },
    {
      id: "links",
      title: "Link",
      icon: LinkIcon,
      content: (
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <div>Figma</div>
            <a
              href="http://www.figma.com"
              className="text-primary text-decoration-none small"
            >
              www.figma.com
            </a>
          </div>
          <small className="text-muted">Hôm qua</small>
        </div>
      ),
    },
  ]);

  return (
    <div>Danh ba</div>
  );
}
