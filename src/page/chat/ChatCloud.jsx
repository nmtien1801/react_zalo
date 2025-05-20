import { useState, useRef, useEffect } from "react";
import { Modal, Tab, Tabs } from "react-bootstrap"; // Import Bootstrap components

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
  Reply,
  Share,
  Copy,
  Download,
  Image,
  Trash2
} from "lucide-react";
import "./Chat.scss";

import { useSelector, useDispatch } from "react-redux";
import { uploadAvatar } from '../../redux/profileSlice.js'
import IconModal from '../../component/IconModal.jsx'
import { deleteMessageForMeService } from "../../service/chatService.js";
import ImageViewer from "./ImageViewer.jsx";
import AccountInfo from "../info/accountInfo.jsx";

export default function ChatCloud(props) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.userInfo);
  const [showSidebar, setShowSidebar] = useState(true);
  const fileInputRef = useRef(null); // Ref để truy cập input file ẩn
  const socketRef = props.socketRef

  const [sections] = useState([
    { id: "media", title: "Ảnh/Video", icon: ImageIcon },
    { id: "files", title: "File", icon: File },
    { id: "links", title: "Link", icon: LinkIcon },
  ]);

  
  // nghiem
const [mediaMessages, setMediaMessages] = useState([]);
const [fileMessages, setFileMessages] = useState([]);
const [linkMessages, setLinkMessages] = useState([]);

const [showAllModal, setShowAllModal] = useState(false);
const [activeTab, setActiveTab] = useState("media"); // Default tab is "media"

useEffect(() => {
  const media = messages.flatMap((msg) => {
    if (msg.type === "image") {
      // Nếu msg chứa nhiều URL, tách chúng thành mảng
      return msg.msg.split(",").map((url) => ({
        ...msg,
        msg: url.trim(), // Loại bỏ khoảng trắng thừa
      }));
    }
    if (msg.type === "video") {
      return [msg]; // Giữ nguyên video
    }
    return [];
  });

  const files = messages.filter((msg) => msg.type === "file");
  const links = messages.filter(
    (msg) =>
      msg.type === "text" && // Chỉ lấy tin nhắn có type là "text"
      msg.msg.match(/https?:\/\/[^\s]+/g) // Kiểm tra xem msg có chứa URL
  );

  setMediaMessages(media); // Cập nhật mediaMessages
  setFileMessages(files);
  setLinkMessages(links); // Lưu các tin nhắn dạng URL
}, [messages]);

const cleanFileName = (fileName) => {
    // Loại bỏ các ký tự hoặc số không cần thiết ở đầu tên file
    return fileName.replace(/^\d+_|^\d+-/, ""); // Loại bỏ số và dấu gạch dưới hoặc gạch ngang ở đầu
  };

// nghiem

  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const [message, setMessage] = useState(""); // input
  const [messages, setMessages] = useState([]); // all hội thoại

  //Popup Chuột phải
  const messagesEndRef = useRef(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [selectedMessage, setSelectedMessage] = useState(null);

  const imageInputRef = useRef(null);
  const [hasSelectedImages, setHasSelectedImages] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  // ImageViewer
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (props.allMsg) {
      setMessages(props.allMsg);
    }
  }, [props.allMsg]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sự kiện nhấn chuột phải
  const handleShowPopup = (e, msg) => {
    e.preventDefault();

    const popupWidth = 200;
    const popupHeight = 350;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    let x = e.clientX;
    let y = e.clientY;

    if (x + popupWidth > screenWidth) {
      x = screenWidth - popupWidth - 10;
    }

    if (y + popupHeight > screenHeight) {
      y = screenHeight - popupHeight - 10;
    }

    setSelectedMessage(msg);
    setPopupPosition({ x, y });
    setPopupVisible(true);
  };

  const handleClosePopup = () => {
    setPopupVisible(false);
    setSelectedMessage(null);
  };

  const sendMessage = async (msg, type) => {
    // Nếu là chuỗi
    if (typeof msg === "string") {
      if (!msg.trim()) {
        alert("Tin nhắn không được để trống!");
        return;
      }
    }

    // Kiểm tra nếu msg là mảng
    if (Array.isArray(msg)) {
      if (msg.length === 0) {
        msg = JSON.stringify(msg);
      }
    }

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
      } else {
        console.log(response.payload.EM);
        alert(response.payload.EM)
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

  //Xử lý khi người dùng nhấp ngoài popup chuột phải
  useEffect(() => {
    const handleClickOutside = () => {
      if (popupVisible) {
        handleClosePopup();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [popupVisible]);

  // Xử lý recall for me
  const handleDeleteMessageForMe = async (id) => {
    try {
      const response = await deleteMessageForMeService(id, user._id);
      if (response.EC === 0) {
        console.log("Tin nhắn đã được xóa chỉ ở phía tôi:", response.DT);

        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== id)
        );
      } else {
        console.error("Xóa tin nhắn thất bại:", response.EM);
      }
    } catch (error) {
      console.error("Lỗi khi xóa tin nhắn:", error);
    }
  };

  const handleImageChange = async (e) => {
    const selectedImages = e.target.files;

    if (selectedImages && selectedImages.length > 0) {

      if (selectedImages.length > 10) {
        setHasSelectedImages(false);
        alert("Số lượng ảnh không được quá 10!");
        return;
      }

      const previews = [];
      const files = Array.from(e.target.files);

      for (let image of selectedImages) {
        // Tạo URL xem trước
        const reader = new FileReader();
        reader.onload = () => {
          previews.push(reader.result); // Lưu URL xem trước vào mảng
          setPreviewImages([...previews]); // Cập nhật state xem trước
          setHasSelectedImages(true);
        };
        reader.readAsDataURL(image);
      }

      if (files.length > 0) {
        setSelectedFiles((prev) => [...prev, ...files]);
      }
    } else {
      setHasSelectedImages(false);
    }
  };

  const handleButtonClickImage = () => {
    imageInputRef.current.click(); // Mở dialog chọn file
  };

  // Hàm nhấp vào image xem
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseImageViewer = () => {
    setSelectedImage(null);
  };

  // xóa ảnh xem trước
  const handleRemovePreview = (index) => {
    const updatedPreviews = [...previewImages];
    updatedPreviews.splice(index, 1);
    setPreviewImages(updatedPreviews);

    if (updatedPreviews.length === 0) {
      setHasSelectedImages(false);
    }
  };

  const handleMessage = async (message) => {
    if (previewImages.length === 0) {
      sendMessage(message, "text");
    } else if (previewImages.length > 0) {

      const listUrlImage = [];

      for (const image of selectedFiles) {
        const formData = new FormData();
        console.log("Ảnh:" + image);
        formData.append("avatar", image);

        try {
          const response = await dispatch(uploadAvatar({ formData }));
          if (response.payload.EC === 0) {
            listUrlImage.push(response.payload.DT);
          } else {
            alert(response.payload.EM || "Lỗi khi tải lên ảnh!");
          }
        } catch (error) {
          console.error("Lỗi khi tải lên ảnh:", error);
          alert("Đã xảy ra lỗi khi tải lên ảnh.");
        }
      }

      if (listUrlImage.length > 0) {
        const listUrlImageString = listUrlImage.join(", ");
        sendMessage(listUrlImageString, "image");
      }

      if (message.trim()) {
        sendMessage(message, "text");
      }

      setPreviewImages([]);
      setHasSelectedImages(false);
    }

    setMessage("");
  }


  const handleClearAllPreviews = () => {
    setPreviewImages([]); // Xóa toàn bộ ảnh xem trước
    setHasSelectedImages(false);
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

            <AccountInfo isOpen={isOpen} closeModal={closeModal} socketRef={socketRef} />

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
          className="chat-container p-3"
          style={{
            height: hasSelectedImages
              ? "calc(100vh - 278px)" // Khi có ảnh được chọn
              : "calc(100vh - 120px)", // Khi không có ảnh nào được chọn
            overflowY: "auto",
          }}
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
                    className={`p-3 max-w-[70%] break-words rounded-3 wrap-container ${msg.type === "text" || msg.type === "file"
                      ? msg.sender._id === user._id
                        ? "bg-primary text-white"
                        : "bg-light text-dark"
                      : "bg-transparent"
                      }`}
                    onContextMenu={(e) => handleShowPopup(e, msg)}
                  >
                    {/* Hiển thị nội dung tin nhắn */}
                    {msg.type === "image" ? (
                      msg.msg.includes(",") ? (
                        <div
                          className={`grid-container multiple-images`}
                        >
                          {msg.msg.split(",").map((url, index) => (
                            <div key={index} className="grid-item">
                              <img
                                src={url.trim()}
                                alt={`image-${index}`}
                                className="image-square"
                                onClick={() => handleImageClick(url.trim())}
                                style={{ cursor: "pointer" }}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Nếu chỉ có một URL ảnh, hiển thị ảnh đó
                        <div className={`grid-container single-image`}>
                          <div className="grid-item">
                            <img
                              src={msg.msg}
                              alt="image"
                              className="image-square"
                              onClick={() => handleImageClick(msg.msg)}
                              style={{ cursor: "pointer" }}
                            />
                          </div>
                        </div>
                      )
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
                      className={`text-end text-xs mt-1 ${msg.sender._id === user._id
                        ? msg.type === "image"
                          ? "text-secondary" // Nếu là ảnh, đổi thành text-secondary
                          : "text-white" // Nếu không, giữ text-white
                        : "text-secondary"
                        }`}
                    >
                      {convertTime(msg.createdAt)}
                    </div>
                  </div>

                </div>
              ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="bg-white p-2 border-top">
          <div className="d-flex align-items-center">
            {/* Modal riêng */}
            <IconModal onSelect={handleEmojiSelect} />
            {/* Input file ẩn */}
            <input
              type="file"
              multiple
              accept=".doc,.docx,.xls,.xlsx,.pdf,.mp4"
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ display: "none" }} // Ẩn input
            />
            <button className="btn btn-light me-2" onClick={handleButtonClick} >
              <Paperclip size={20} />
            </button>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png"
              onChange={handleImageChange}
              ref={imageInputRef}
              style={{ display: "none" }} // Ẩn input
            />
            <button className="btn btn-light me-2" onClick={handleButtonClickImage}>
              <Image size={20} />
            </button>

            {/* Input tin nhắn */}
            <input
              className="form-control flex-1 p-2 border rounded-lg outline-none"
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(message, "text")}
              placeholder="Nhập tin nhắn..."
            />
            {/* Nút smile */}
            <button
              className="btn btn-light ms-2"
              data-bs-toggle="modal"
              data-bs-target="#iconModal"
            >
              <Smile size={20} />
            </button>
            <IconModal onSelect={handleEmojiSelect} />

            {/* Nút gửi */}
            <button
              className="btn btn-primary ms-2"
              onClick={() => handleMessage(message)}
            >
              <Send size={20} />
            </button>
          </div>
          <div className="preview-container d-flex flex-wrap gap-2 mt-2" >
            {previewImages.map((image, index) => (
              <div key={index} className="preview-item position-relative">
                <img
                  src={image}
                  alt={`Xem trước ${index + 1}`}
                  className="rounded"
                  style={{ width: "100px", height: "100px", objectFit: "cover" }}
                />
                <button
                  className="btn btn-danger btn-sm position-absolute top-0 end-0 d-flex justify-content-center align-items-center"
                  onClick={() => handleRemovePreview(index)}
                  style={{ borderRadius: "50%" }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {previewImages.length > 0 && (
              <button
                className="btn btn-link text-danger mt-2"
                onClick={handleClearAllPreviews}
              >
                Xóa tất cả
              </button>
            )}
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
                <div id={`${id}Collapse`} className="accordion-collapse collapse">
                  <div className="accordion-body text-center text-muted">
                    {id === "media" && mediaMessages.length > 0 ? (
                      <>
                        <div className="media-list d-flex flex-wrap gap-2">
                          {mediaMessages.slice(0, 8).map((msg, index) => (
                          // {mediaMessages.map((msg, index) => (
                            <div
                              key={index}
                              className="media-item"
                              style={{
                                width: "calc(25% - 10px)", // 4 media mỗi hàng
                                height: "60px",
                                overflow: "hidden",
                                borderRadius: "8px",
                              }}
                            >
                              {msg.type === "image" ? (
                                <img
                                  src={msg.msg}
                                  alt={`Media ${index + 1}`}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => handleImageClick(msg.msg)}
                                />
                              ) : (
                                <video
                                  src={msg.msg}
                                  controls
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    cursor: "pointer",
                                  }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                        {/* {mediaMessages.length > 8 && ( */}
                          <button
                            className="btn btn-link mt-2"
                            onClick={() => {
                              setActiveTab("media"); // Set default tab
                              setShowAllModal(true); // Open modal
                            }}
                          >
                            Xem tất cả
                          </button>
                        {/* )} */}
                      </>
                    ) : id === "files" && fileMessages.length > 0 ? (
                      <>
                      <div className="file-list">
                        {fileMessages.slice(0, 4).map((msg, index) => (
                          <div
                            key={index}
                            className="d-flex align-items-center mb-2"
                            style={{
                              borderBottom: "1px solid #ddd",
                              paddingBottom: "5px",
                            }}
                          >
                            {/* Icon loại file */}
                            <File size={20} className="me-2 text-primary" />
                            {/* Tên file */}
                            <a
                              href={msg.msg}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-truncate"
                              style={{ maxWidth: "200px" }}
                            >
                              {cleanFileName(msg.msg.split("/").pop()) || `File ${index + 1}`}
                            </a>
                          </div>
                        ))}
                      </div>
                        {/* {fileMessages.length > 4 && ( */}
                          <button
                            className="btn btn-link mt-2"
                            onClick={() => {
                              setActiveTab("files"); // Set default tab
                              setShowAllModal(true); // Open modal
                            }}
                          >
                            Xem tất cả
                          </button>
                        {/* )} */}
                      </>

                    ) : id === "links" && linkMessages.length > 0 ? (
                      <>
                        <div className="link-list">
                          {linkMessages.slice(0, 4).map((msg, index) => (
                            <div key={index} className="d-flex align-items-center mb-2">
                              <LinkIcon size={20} className="me-2 text-primary" />
                              <a
                                href={msg.msg}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-truncate"
                                style={{ maxWidth: "200px", color: "black", textDecoration: "none" }}
                              >
                                {msg.msg}
                              </a>
                            </div>
                          ))}
                        </div>

                        {/* {linkMessages.length > 4 && ( */}
                          <button
                            className="btn btn-link mt-2"
                            onClick={() => {
                              setActiveTab("links"); // Set default tab
                              setShowAllModal(true); // Open modal
                            }}
                          >
                            Xem tất cả
                          </button>
                        {/* )} */}


                          </>


                    ) : (
                      <small>{`Chưa có ${title} được chia sẻ trong hội thoại này`}</small>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Modal
            show={showAllModal}
            onHide={() => setShowAllModal(false)}
            centered
          >
                <Modal.Header closeButton>
                  <Modal.Title>Xem tất cả</Modal.Title>
                </Modal.Header>
                <Modal.Body
                  style={{
                    overflowY: "auto", // Thêm cuộn dọc nếu nội dung vượt quá chiều cao
                    // height: "calc(100% - 56px)", // Trừ chiều cao của header
                    height: "400px", // Giới hạn chiều cao của modal
                    backgroundColor: "#dddada", // Màu gray mờ   
                    
                  }}
                >
                  <Tabs
                    activeKey={activeTab}
                    onSelect={(tab) => setActiveTab(tab)}
                    className="mb-3"
                  >
                    <Tab eventKey="media" title="Ảnh/Video">
                      <div
                        className="d-flex flex-wrap gap-2"
                        style={{
                          alignItems: "center",
                          justifyContent: "center", 
                          backgroundColor: "#dddada", // Màu gray mờ   
                          paddingTop: "10px",
                          paddingBottom: "10px",
                        }}

                      >
                        {mediaMessages.map((msg, index) => (
                          <div
                            key={index}
                            className="media-item"
                            style={{
                              width: "calc(25% - 10px)",
                              height: "100px",
                              overflow: "hidden",
                              borderRadius: "8px",
                            }}
                          >
                            {msg.type === "image" ? (
                              <img
                                src={msg.msg}
                                alt={`Media ${index + 1}`}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  handleImageClick(msg.msg); // Hiển thị ảnh
                                  setShowAllModal(false); // Đóng modal
                                }}
                              />
                            ) : (
                              <video
                                src={msg.msg}
                                controls
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  cursor: "pointer",
                                }}
                                // onClick={() => {
                                //   setShowAllModal(false); // Đóng modal
                                // }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </Tab>
                    <Tab eventKey="files" title="File">
                      <div
                        className="file-list"
                        style={{
                          alignItems: "center",
                          justifyContent: "center", 
                          backgroundColor: "#dddada", // Màu gray mờ   
                          paddingTop: "10px",
                          paddingBottom: "10px",

                        }}
                      >
                        {fileMessages.map((msg, index) => (
                          <div
                            key={index}
                            className="d-flex align-items-center mb-2"
                            style={{
                              borderBottom: "1px solid black",
                              paddingBottom: "5px",
                            }}
                          >
                            <File size={20} className="me-2 text-primary" />
                            <a
                              href={msg.msg}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-truncate"
                            >
                              {cleanFileName(msg.msg.split("/").pop()) || `File ${index + 1}`}
                            </a>
                          </div>
                        ))}
                      </div>
                    </Tab>
                    <Tab eventKey="links" title="Link">
                      <div
                        className="link-list"
                        style={{
                          alignItems: "center",
                          justifyContent: "center", 
                          backgroundColor: "#dddada", // Màu gray mờ   
                          paddingTop: "10px",
                          paddingBottom: "10px",
                        }}
                      >
                        {linkMessages.map((msg, index) => (
                          <div key={index} className="d-flex align-items-center mb-2"
                          style={{
                            borderBottom: "1px solid black",
                            paddingBottom: "5px",
                          }}
                          >
                            <LinkIcon size={20} className="me-2 text-primary" />
                            <a
                              href={msg.msg}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-truncate"
                              style={{
                                color: "black",
                                textDecoration: "none",
                              }}
                            >
                              {msg.msg}
                            </a>
                          </div>
                        ))}
                      </div>
                    </Tab>
                  </Tabs>
                </Modal.Body>
          </Modal>

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

      {popupVisible && selectedMessage?.type !== "system" && (
        <div
          className="popup-menu"
          style={{
            position: "absolute",
            top: popupPosition.y,
            left: popupPosition.x,
            backgroundColor: "white",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            zIndex: 1000,
            padding: "10px",
          }}
        >
          <div className="popup-item d-flex align-items-center" onClick={() => console.log("Trả lời")}>
            <Reply size={16} className="me-2" />
            <span>Trả lời</span>
          </div>
          <div className="popup-item d-flex align-items-center" onClick={() => console.log("Chia sẻ")}>
            <Share size={16} className="me-2" />
            <span>Chia sẻ</span>
          </div>
          <hr />
          {selectedMessage?.type === "text" && (
            <div className="popup-item d-flex align-items-center" onClick={() => navigator.clipboard.writeText(selectedMessage.msg)}>
              <Copy size={16} className="me-2" />
              <span>Copy tin nhắn</span>
            </div>
          )}
          {selectedMessage?.type === "image" && (
            <div className="popup-item d-flex align-items-center" onClick={() => window.open(selectedMessage.msg, "_blank")}>
              <Image size={16} className="me-2" />
              <span>Lưu ảnh</span>
            </div>
          )}
          {(selectedMessage?.type === "video" || selectedMessage?.type === "file") && (
            <div className="popup-item d-flex align-items-center" onClick={() => window.open(selectedMessage.msg, "_blank")}>
              <Download size={16} className="me-2" />
              <span>Tải về</span>
            </div>
          )}
          <hr />

          <div
            className="popup-item d-flex align-items-center text-danger"
            onClick={() => handleDeleteMessageForMe(selectedMessage._id)}>
            <Trash2 size={16} className="me-2" />
            <span>Xóa chỉ ở phía tôi</span>
          </div>
        </div>
      )}
      {selectedImage && (
        <ImageViewer imageUrl={selectedImage} onClose={handleCloseImageViewer} />
      )}
    </div>
  );
}
