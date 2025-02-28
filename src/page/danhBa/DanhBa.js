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
    <div className="h-100 bg-white border-start" style={{ width: "300px" }}>
      {/* Header */}
      <div className="p-3 border-bottom">
        <h6 className="mb-0 text-center">Thông tin hội thoại</h6>
      </div>

      {/* Group Profile Section */}
      <div className="text-center p-3 border-bottom">
        <div className="position-relative d-inline-block mb-2">
          <img
            src="/placeholder.svg"
            alt="Group"
            className="rounded-circle"
            style={{ width: "80px", height: "80px" }}
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

            <div id={`${id}Collapse`} className="accordion-collapse collapse">
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

          <div id="securityCollapse" className="accordion-collapse collapse">
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
                        <i className="text-muted" style={{ fontSize: "14px" }}>
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
                <div className="ms-2 text-danger">Xóa lịch sử trò chuyện</div>
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
  );
}
