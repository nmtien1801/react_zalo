import React from 'react';
import { useState, useRef, useEffect } from "react";
import { Modal, Tab, Tabs } from "react-bootstrap"; // Import Bootstrap components

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
  Reply,
  Share,
  Copy,
  Download,
  RotateCw,
  Image,
  ThumbsUp,
  Heart,
  Meh,
  Frown,
  Angry,
  Share2
} from "lucide-react";
import "./Chat.scss";
import { useSelector, useDispatch } from "react-redux";
import CallScreen from "../../component/CallScreen.jsx";
import { uploadAvatar } from '../../redux/profileSlice.js'
import IconModal from '../../component/IconModal.jsx'
import { deleteMessageForMeService, getReactionMessageService, recallMessageService, sendReactionService, markMessageAsReadService, markAllMessagesAsReadService, loadMessagesService } from "../../service/chatService.js";
import ImageViewer from "./ImageViewer.jsx";
import ShareMsgModal from "../../component/ShareMsgModal.jsx";
import AccountInfo from "../info/accountInfo.jsx";
import { reloadMessages } from "../../redux/chatSlice.js";
import VideoCallModal from "../../component/VideoCallModal.jsx"
import EmojiPopup from '../../component/EmojiPopup.jsx';

export default function ChatPerson(props) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.userInfo);
  const receiver = props.roomData.receiver;
  const fileInputRef = useRef(null); // Ref để truy cập input file ẩn
  const imageInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { setAllMsg } = props;
  const socketRef = props.socketRef;

  const [showSidebar, setShowSidebar] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showCallScreen, setShowCallScreen] = useState(false);
  const [hasSelectedImages, setHasSelectedImages] = useState(false);
  const [isInitiator, setIsInitiator] = useState(false); // Thêm state để theo dõi người khởi tạo

  // Popup Chuột phải
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [selectedMessage, setSelectedMessage] = useState(null);


  const conversations = props.conversations || [];

  const [previewImages, setPreviewImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // ImageViewer
  const [selectedImage, setSelectedImage] = useState(null);

  //Reaction
  const [reactionPopupVisible, setReactionPopupVisible] = useState(null);
  const [reactions, setReactions] = useState({});
  const [hideReactionTimeout, setHideReactionTimeout] = useState(null);

  // Thêm state để theo dõi typing
  const [typingUsers, setTypingUsers] = useState({});
  const typingTimeout = useRef(null);

  // Emoji Popup
  const [showEmojiPopup, setShowEmojiPopup] = useState(false);
  const [emojiButtonPosition, setEmojiButtonPosition] = useState({ top: 0, left: 0, right: 0 });
  const emojiButtonRef = useRef(null);

  // Ref cho input msg
  const messageInputRef = useRef(null);

  // State phân trang
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [page, setPage] = useState(1);
  const [scrollPositionY, setScrollPositionY] = useState(0);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const chatContainerRef = useRef(null);
  const initialLoadComplete = useRef(false);
  const preventInitialFetch = useRef(true);
  const prevMessagesLengthRef = useRef(0);
  const prevLastMessageIdRef = useRef(null);
  const prevMessagesRef = useRef([]);

  //Object Ánh xạ Emoji
  const emojiToTextMap = {
    "👍": "Like",
    "❤️": "Love",
    "😂": "Haha",
    "😮": "Wow",
    "😢": "Sad",
    "😡": "Angry",
  };

  const emojiToIconMap = {
    "👍": <span className="zalo-icon zalo-icon-like"></span>,
    "❤️": <span className="zalo-icon zalo-icon-heart"></span>,
    "😂": <span className="zalo-icon zalo-icon-haha"></span>,
    "😮": <span className="zalo-icon zalo-icon-wow"></span>,
    "😢": <span className="zalo-icon zalo-icon-crying"></span>,
    "😡": <span className="zalo-icon zalo-icon-angry"></span>,
  };

  const textToIconMap = {
    "Like": <span className="zalo-icon zalo-icon-like"></span>,
    "Love": <span className="zalo-icon zalo-icon-heart"></span>,
    "Haha": <span className="zalo-icon zalo-icon-haha"></span>,
    "Wow": <span className="zalo-icon zalo-icon-wow"></span>,
    "Sad": <span className="zalo-icon zalo-icon-crying"></span>,
    "Angry": <span className="zalo-icon zalo-icon-angry"></span>,
  };

  useEffect(() => {
    if (props.allMsg && props.allMsg.length > 0) {
      setMessages(prev => {
        return prev.map(msg => {
          // Tìm tin nhắn trong props.allMsg có cùng nội dung và người gửi
          const matchingNewMsg = props.allMsg.find(
            newMsg =>
              newMsg.sender._id === msg.sender._id &&
              newMsg.msg === msg.msg &&
              Math.abs(new Date(newMsg.createdAt).getTime() - new Date(msg.createdAt).getTime()) < 30000 // Thời gian tạo gần nhau (30 giây)
          );

          if (matchingNewMsg && (msg.status === "pending" || msg.status === "fail")) {
            // Cập nhật tin nhắn tạm thời với dữ liệu chính thức từ server
            return { ...matchingNewMsg, status: "sent" };
          }
          return msg;
        });
      });
    }
  }, [props.allMsg]);

  useEffect(() => {
    if (props.allMsg && props.allMsg.length > 0) {
      // Tìm tin nhắn chưa đọc từ người khác
      const unreadMessages = props.allMsg.filter(
        msg => msg.sender._id !== user._id &&
          (!msg.readBy || !msg.readBy.includes(user._id))
      );

      // Đánh dấu từng tin nhắn chưa đọc
      unreadMessages.forEach(msg => {
        markMessageAsRead(msg._id);
      });
    }
  }, [props.allMsg]);

  // Đánh dấu đã đọc khi vào phòng chat
  useEffect(() => {
    if (props.roomData && props.roomData.receiver && user) {
      // Đánh dấu tất cả tin nhắn trong phòng là đã đọc
      markAllMessagesAsRead(props.roomData.receiver._id);
    }
  }, [props.roomData]);

  // Hàm đánh dấu một tin nhắn đã đọc
  const markMessageAsRead = async (messageId) => {
    try {
      // Chỉ đánh dấu tin nhắn của người khác gửi đến
      if (messageId) {
        const response = await markMessageAsReadService(messageId, user._id);
        if (response.EC === 0) {
          // Emit socket event
          props.socketRef.current.emit("MARK_READ", {
            messageId,
            userId: user._id,
            conversationId: props.roomData.receiver._id
          });
        }
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  // Hàm đánh dấu tất cả tin nhắn là đã đọc
  const markAllMessagesAsRead = async (conversationId) => {
    try {
      const response = await markAllMessagesAsReadService(conversationId, user._id);
      if (response.EC === 0) {
        // Emit socket event
        props.socketRef.current.emit("MARK_ALL_READ", {
          userId: user._id,
          conversationId: conversationId
        });
      }
    } catch (error) {
      console.error("Error marking all messages as read:", error);
    }
  };

  useEffect(() => {
    if (props.allMsg) {
      setMessages(props.allMsg);
    }
  }, [props.allMsg]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto", block: "end" });
    }

    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Chỉ cuộn xuống khi có tin nhắn mới hoặc lần đầu tiên load tin nhắn
    if (!isLoadingOlder) {

      const isNewMessage = prevMessagesLengthRef.current > 0 &&
        messages.length > prevMessagesLengthRef.current &&
        messages[messages.length - 1]._id !== prevLastMessageIdRef.current;

      if (initialLoadComplete.current === false || isNewMessage) {
        scrollToBottom();

        // Đánh dấu đã hoàn thành render lần đầu
        if (!initialLoadComplete.current) {
          initialLoadComplete.current = true;
          // Delay ngắn để tránh kích hoạt loadOlderMessages do sự kiện scroll tự động
          setTimeout(() => {
            if (chatContainerRef.current) {
              // Đặt scroll position tới cuối luôn
              chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
          }, 100);
        }
      }
    }

    if (messages.length > 0) {
      prevMessagesLengthRef.current = messages.length;
      prevLastMessageIdRef.current = messages[messages.length - 1]._id;
    }
  }, [messages, isLoadingOlder]);

  // Add this useEffect for better message update handling
  useEffect(() => {
    // Store previous messages for comparison
    const prevMessages = prevMessagesRef.current;

    // Update the ref with current messages
    prevMessagesRef.current = messages;

    // First load, always scroll to bottom
    if (!prevMessages || prevMessages.length === 0) {
      scrollToBottom();
      return;
    }

    // Skip auto-scroll logic if we're loading older messages
    if (isLoadingOlder) return;

    // If messages were added to the beginning (older messages loaded), don't auto-scroll
    if (messages.length > prevMessages.length &&
      messages[0]._id !== prevMessages[0]._id &&
      messages[messages.length - 1]._id === prevMessages[prevMessages.length - 1]._id) {
      return;
    }

    // Check if we should auto-scroll for new messages
    if (shouldAutoScrollToBottom(prevMessages, messages)) {
      scrollToBottom();
    }
  }, [messages]);

  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  // useEffect(() => {
  //   // Cuộn xuống dưới khi có tin nhắn mới
  //   if (messages.length > 0 && !isLoadingOlder) {
  //     scrollToBottom();
  //   }
  // }, []);

  const handlePaste = (e) => {
    const items = e.clipboardData.items;

    // Duyệt qua tất cả các items trong clipboard
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        // Ngăn chặn paste mặc định
        e.preventDefault();

        // Lấy file từ clipboard
        const file = items[i].getAsFile();

        // Kiểm tra file
        if (!file) return;

        // Thêm file vào danh sách đã chọn
        const files = [file];
        setSelectedFiles((prev) => [...prev, ...files]);

        // Tạo URL xem trước
        const reader = new FileReader();
        reader.onload = () => {
          const imageUrl = reader.result;
          setPreviewImages((prev) => [...prev, imageUrl]);
          setHasSelectedImages(true);
        };
        reader.readAsDataURL(file);

        // Chỉ xử lý file hình ảnh đầu tiên tìm thấy
        break;
      }
    }
  };

  const shouldAutoScrollToBottom = (oldMessages, newMessages) => {
    // If no previous messages, always scroll
    if (!oldMessages.length || !newMessages.length) return true;

    // Check if the newest message was added at the end (incoming message)
    const oldLastMessage = oldMessages[oldMessages.length - 1];
    const newLastMessage = newMessages[newMessages.length - 1];

    // Check if both messages exist and have _id
    if (!oldLastMessage || !newLastMessage) return true;

    // Scroll if:
    // 1. New message at the end AND
    // 2. It's either from current user or we're very close to the bottom already
    if (oldLastMessage._id !== newLastMessage._id) {
      // Check if sender exists before accessing its _id
      const isFromCurrentUser = newLastMessage.sender &&
        user &&
        newLastMessage.sender._id === user._id;
      const isNearBottom = chatContainerRef.current &&
        (chatContainerRef.current.scrollHeight - chatContainerRef.current.scrollTop -
          chatContainerRef.current.clientHeight < 100);

      return isFromCurrentUser || isNearBottom;
    }

    return false;
  };

  // Hàm tải tin nhắn cũ hơn
  const loadOlderMessages = async () => {
    if (!hasMoreMessages || isLoadingOlder || messages.length === 0) return;

    setIsLoadingOlder(true);

    try {
      // Lưu vị trí scroll hiện tại và tin nhắn đầu tiên đang hiển thị
      const chatContainer = chatContainerRef.current;
      const oldScrollHeight = chatContainer.scrollHeight;
      const scrollPosition = chatContainer.scrollTop;

      const response = await loadMessagesService(
        user._id,
        props.roomData.receiver._id,
        props.roomData.receiver.type,
        page + 1,
        20
      );

      if (response.EC === 0) {
        const olderMessages = response.DT;

        if (olderMessages && olderMessages.length > 0) {
          // Sử dụng Set để lọc các tin nhắn trùng lặp
          const uniqueMessages = [...olderMessages];
          const existingIds = new Set(messages.map(msg => msg._id));

          // Lọc những tin nhắn chưa có trong danh sách hiện tại
          const filteredMessages = uniqueMessages.filter(msg => !existingIds.has(msg._id));

          // Thêm tin nhắn cũ vào đầu danh sách
          setMessages(prevMessages => [...filteredMessages, ...prevMessages]);
          setPage(prev => prev + 1);

          // Kiểm tra xem còn tin nhắn để tải không
          setHasMoreMessages(olderMessages.length === 20 && response.pagination?.hasMore);

          const maintainScrollPosition = () => {
            if (chatContainer) {
              const newScrollHeight = chatContainer.scrollHeight;
              const heightDifference = newScrollHeight - oldScrollHeight;
              chatContainer.scrollTop = heightDifference + scrollPosition;
            }
          };

          maintainScrollPosition();
          setTimeout(maintainScrollPosition, 10);
          setTimeout(maintainScrollPosition, 50);
          setTimeout(maintainScrollPosition, 100);
        } else {
          setHasMoreMessages(false);
        }
      } else {
        console.error("Không thể tải thêm tin nhắn cũ:", response.EM);
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error("Lỗi khi tải tin nhắn cũ:", error);
    } finally {
      setIsLoadingOlder(false);
    }
  };

  // Xử lý sự kiện scroll
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;

    // Lưu vị trí scroll hiện tại
    setScrollPositionY(scrollTop);

    // Hiển thị nút cuộn về dưới khi kéo lên trên
    const isScrolledUp = scrollTop < scrollHeight - clientHeight - 300;
    setShowScrollToBottom(isScrolledUp);

    // Chỉ tải tin nhắn cũ khi đã render xong lần đầu và người dùng thực sự cuộn lên
    if (scrollTop < 150 && !isLoadingOlder && hasMoreMessages && !preventInitialFetch.current) {
      loadOlderMessages();
    }

    // Đánh dấu là đã có tương tác người dùng thực sự sau khi render lần đầu
    if (preventInitialFetch.current && initialLoadComplete.current) {
      preventInitialFetch.current = false;
    }
  };

  const handleShowEmojiPopup = () => {
    if (emojiButtonRef.current) {
      const rect = emojiButtonRef.current.getBoundingClientRect();

      const chatContainer = document.querySelector('.chat-container');
      const chatContainerRect = chatContainer?.getBoundingClientRect();

      setEmojiButtonPosition({
        top: rect.top,
        left: rect.left,
        right: rect.right,
        // Add these properties to help with positioning
        containerLeft: chatContainerRect?.left || 0,
        containerRight: chatContainerRect?.right || window.innerWidth,
        containerWidth: chatContainerRect?.width || window.innerWidth
      });
      setShowEmojiPopup(true);
    }
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

  // Hàm gửi lại tin nhắn
  const handleResendMessage = (msg) => {
    // Xóa tin nhắn cũ
    setMessages(prev => prev.filter(m => m._id !== msg._id));

    // Gửi lại tin nhắn
    sendMessage(msg.msg, msg.type);
  };

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

  useEffect(() => {
    const inputElement = messageInputRef.current;

    if (inputElement) {
      inputElement.addEventListener('paste', handlePaste);
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener('paste', handlePaste);
      }
    };
  }, []);

  const cleanFileName = (fileName) => {
    // Loại bỏ các ký tự hoặc số không cần thiết ở đầu tên file
    return fileName.replace(/^\d+_|^\d+-/, ""); // Loại bỏ số và dấu gạch dưới hoặc gạch ngang ở đầu
  };

  // nghiem

  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  // Thêm hàm xử lý typing khi người dùng nhập
  const handleInputChange = (e) => {
    const text = e.target.value;
    setMessage(text);

    // Xóa timeout hiện có để reset
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    // Gửi sự kiện TYPING nếu đang nhập
    if (text.trim() !== "") {
      if (props.socketRef.current) {
        const typingData = {
          userId: user._id,
          username: user.username,
          receiver: props.roomData.receiver,
          conversationId: props.roomData.receiver._id
        };

        console.log("Sending typing data:", typingData);

        props.socketRef.current.emit("TYPING", typingData);
      }

      // Set timeout để dừng typing sau 1.5 giây không nhập
      typingTimeout.current = setTimeout(() => {
        if (props.socketRef.current) {
          const typingData = {
            userId: user._id,
            receiver: props.roomData.receiver,
            conversationId: props.roomData.receiver._id
          };

          console.log("Typing stop", typingData);

          props.socketRef.current.emit("STOP_TYPING", typingData);
        }
      }, 1500);
    } else {
      // Nếu input rỗng, gửi sự kiện dừng typing ngay lập tức
      if (props.socketRef.current) {
        const typingData = {
          userId: user._id,
          receiver: props.roomData.receiver,
          conversationId: props.roomData.receiver._id
        };

        console.log("Typing stop", typingData);

        props.socketRef.current.emit("STOP_TYPING", typingData);
      }
    }
  };

  // useEffect để lắng nghe sự kiện typing từ server
  useEffect(() => {
    if (props.socketRef.current) {
      // Lắng nghe khi có người đang typing
      props.socketRef.current.on("USER_TYPING", (data) => {
        const { userId, username, conversationId } = data;

        // Kiểm tra đúng cuộc trò chuyện hiện tại
        if (userId === props.roomData.receiver._id) {
          setTypingUsers(prev => ({
            ...prev,
            [userId]: username
          }));
          console.log("Updated typing users:", userId, username);
        }
      });

      // Lắng nghe khi có người dừng typing
      props.socketRef.current.on("USER_STOP_TYPING", (data) => {
        const { userId, conversationId } = data;

        if (userId === props.roomData.receiver._id) {
          setTypingUsers(prev => {
            const newState = { ...prev };
            delete newState[userId];
            return newState;
          });
        }
      });

      // Cleanup khi component unmount
      return () => {
        props.socketRef.current.off("USER_TYPING");
        props.socketRef.current.off("USER_STOP_TYPING");

        // Dừng typing khi unmount
        if (props.socketRef.current) {
          props.socketRef.current.emit("STOP_TYPING", {
            userId: user._id,
            receiver: props.roomData.receiver
          });
        }

        if (typingTimeout.current) {
          clearTimeout(typingTimeout.current);
        }
      };
    }
  }, [props.roomData.receiver]);

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

  // Xử lý sự kiện incoming-call từ socket
  // useEffect(() => {
  //   if (!props.socketRef.current) return;

  //   const socket = props.socketRef.current;
  //   socket.on("incoming-call", () => {
  //     setShowCallScreen(true); // Hiển thị modal khi có cuộc gọi đến
  //     setIsInitiator(false); // Người nhận không phải là người khởi tạo
  //   });

  //   return () => {
  //     socket.off("incoming-call");
  //   };
  // }, [props.socketRef]);

  // const handleStartCall = () => {
  //   setShowCallScreen(true); // Mở modal
  //   setIsInitiator(true); // Đặt người dùng hiện tại là người khởi tạo
  // };

  // Xử lý upload file
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      alert('k co file')
      return;
    }


    const formData = new FormData();
    console.log(selectedFile);
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

        sendMessage(response.payload.DT, type); // link ảnh server trả về
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert('err')
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

      const files = Array.from(e.target.files);
      const previews = await Promise.all(
        Array.from(selectedImages).map((image) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(image);
          });
        })
      );

      setPreviewImages(previews);
      setSelectedFiles((prev) => [...prev, ...files]);
      setHasSelectedImages(true);
    } else {
      setHasSelectedImages(false);
    }
  };

  // Kích hoạt input file khi nhấn nút
  const handleButtonClick = () => {
    fileInputRef.current.click(); // Mở dialog chọn file
  };

  const handleButtonClickImage = () => {
    setPreviewImages([]);
    setSelectedFiles([]);
    imageInputRef.current.click(); // Mở dialog chọn file
  };

  // Hàm nhấp vào image xem
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseImageViewer = () => {
    setSelectedImage(null);
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

  const convertTimeAction = (time) => {
    const now = Date.now();
    const past = Number(time);
    const diff = now - past;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (seconds < 60) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days === 1) return "Hôm qua";

    const date = new Date(past);
    return date.toLocaleDateString("vi-VN");
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


  // Xử lý recall msg
  const handleRecallMessage = async (message) => {
    try {
      const response = await recallMessageService(message._id);
      if (response.EC === 0) {
        console.log("Tin nhắn đã được thu hồi:", response.DT);

        props.socketRef.current.emit("RECALL", message);
      } else {
        console.error("Thu hồi tin nhắn thất bại:", response.EM);
      }
    } catch (error) {
      console.error("Lỗi khi thu hồi tin nhắn:", error);
    }
  };

  // Xử lý recall for me
  const handleDeleteMessageForMe = async (id) => {
    try {
      let member;
      if (receiver.type === 2) {
        member = {
          ...receiver,
          memberDel: user._id,
        };
      } else {
        member = user;
      }

      const response = await deleteMessageForMeService(id, member);
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

  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedMessageShareModal, setSelectedMessageShareModal] = useState([]);

  const handleOpenShareModal = (message) => {
    setShowShareModal(true);
    setSelectedMessageShareModal(message); // Lưu tin nhắn đã chọn để chia sẻ
  };

  const handleRemovePreview = (index) => {

    const updatedPreviews = [...previewImages];
    const updatedFiles = [...selectedFiles];

    updatedPreviews.splice(index, 1);
    updatedFiles.splice(index, 1);

    setPreviewImages(updatedPreviews);
    setSelectedFiles(updatedFiles);

    if (updatedPreviews.length === 0) {
      setHasSelectedImages(false);
    }
  };

  const handleMessage = async (message) => {
    if (previewImages.length === 0) {
      if (previewReply !== "") {
        sendMessage(`${previewReply}\n\n\t${message}`, "text");
        setHasSelectedImages(false);
        setPreviewReply("")
      } else {
        sendMessage(message, "text");
      }
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

  // Nhấp phản ứng
  const handleShowReactionPopup = async (messageId, event) => {

    // Lấy vị trí của reaction-icon (phần tử gây sự kiện)
    const iconRect = event.currentTarget.getBoundingClientRect();

    // Lấy vị trí của chat-container
    const chatContainer = document.querySelector(".chat-container");
    const containerRect = chatContainer.getBoundingClientRect();

    // Kích thước ước tính của popup
    const popupWidth = 230;  // Chiều rộng ước lượng của popup
    const popupHeight = 60;  // Chiều cao ước lượng của popup

    // Tính toán vị trí tương đối với reaction-container
    // Vì popup là absolute và container là relative

    // Hiển thị popup phía trên reaction-icon
    let x = 0;  // Tọa độ x tương đối với reaction-container
    let y = 0; // Đặt popup phía trên icon, giá trị âm để đi lên

    // Đảm bảo popup không vượt quá biên phải của chat container
    // Tính toán vị trí phải của popup tương đối với container
    const iconOffsetLeft = iconRect.left - containerRect.left;
    const popupRight = iconOffsetLeft + popupWidth;

    if (popupRight > containerRect.width - 20) {
      // Nếu popup vượt quá biên phải, điều chỉnh x để popup nằm trong container
      x = containerRect.width - popupWidth - 20 - iconOffsetLeft;
    }

    // Đảm bảo popup không vượt quá biên trái
    if (iconOffsetLeft + x < 10) {
      x = 10 - iconOffsetLeft;
    }

    // Đặt popup ở vị trí đã tính
    setReactionPopupVisible({
      messageId,
      position: { x, y },
    });
  };

  const handleHideReactionPopup = (messageId) => {
    // Clear any existing timeout
    if (hideReactionTimeout) {
      clearTimeout(hideReactionTimeout);
    }

    // Set a new timeout to hide the popup after a delay
    const timeout = setTimeout(() => {
      if (reactionPopupVisible?.messageId === messageId) {
        setReactionPopupVisible(null);
      }
    }, 300); // 300ms delay

    setHideReactionTimeout(timeout);
  };

  //Hàm phản ứng
  const handleReactToMessage = (messageId, emoji) => {
    const emojiText = emojiToTextMap[emoji];
    if (!emojiText) return;

    const reactionData = {
      messageId,
      userId: user._id,
      username: user.username,
      emoji: emojiText,
      receiver: props.roomData.receiver
    };

    // Gửi reaction qua socket thay vì gọi API trực tiếp
    if (socketRef.current) {
      socketRef.current.emit("REACTION", reactionData);
    }

  };

  // Lấy phản ứng từng message
  const getReactions = async (messageId) => {
    try {
      const response = await getReactionMessageService(messageId);
      if (response.EC === 0) {
        return response.DT; // Trả về danh sách reaction
      } else {
        console.error("Failed to fetch reactions:", response.EM);
        return [];
      }
    } catch (error) {
      console.error("Error fetching reactions:", error);
      return [];
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hideReactionTimeout) {
        clearTimeout(hideReactionTimeout);
      }
    };
  }, [hideReactionTimeout]);

  //Lấy phản ứng của từng message khi thay đổi messages
  useEffect(() => {
    const fetchReactions = async () => {
      const reactionsData = {};
      for (const msg of messages) {
        const reactionList = await getReactions(msg._id);
        reactionsData[msg._id] = reactionList;
      }
      setReactions(reactionsData); // Cập nhật state reactions
      console.log(reactions);
    };

    if (messages.length > 0) {
      fetchReactions();
    }
  }, [messages]);

  useEffect(() => {
    if (props.socketRef.current) {
      // Giữ nguyên các listeners hiện có

      // Thêm listener cho RECEIVED_REACTION
      props.socketRef.current.on("RECEIVED_REACTION", (data) => {
        console.log("Received reaction:", data);
        const { messageId, userId, emoji } = data;

        setReactions(prevReactions => {
          const currentReactions = prevReactions[messageId] || [];

          // Tìm reaction hiện có
          const existingReactionIndex = currentReactions.findIndex(
            reaction => String(reaction.userId) === String(userId) && reaction.emoji === emoji
          );

          let updatedReactions;
          if (existingReactionIndex !== -1) {
            // Nếu đã tồn tại -> xóa (toggle)
            updatedReactions = currentReactions.filter((_, index) =>
              index !== existingReactionIndex
            );
          } else {
            // Nếu chưa tồn tại -> thêm mới
            updatedReactions = [
              ...currentReactions,
              {
                userId: userId,
                emoji: emoji,
                count: 1
              }
            ];
          }

          return {
            ...prevReactions,
            [messageId]: updatedReactions
          };
        });
      });

      // Bắt lỗi reaction nếu có
      props.socketRef.current.on("REACTION_ERROR", (data) => {
        console.error("Reaction error:", data.error);
      });

      // Clean up function
      return () => {
        // Giữ nguyên cleanup code hiện có
        props.socketRef.current.off("RECEIVED_REACTION");
        props.socketRef.current.off("REACTION_ERROR");
      };
    }
  }, [props.roomData.receiver]);

  // Hàm làm sạch ảnh review
  const handleClearAllPreviews = () => {
    setPreviewImages([]); // Xóa toàn bộ ảnh xem trước
    setHasSelectedImages(false);
  };

  const handleShare = (selectedMessage) => {
    console.log('selectedMessage ', selectedMessage);

  }

  // Hàm trích xuất ID từ các định dạng khác nhau
  const extractId = (idObject) => {
    if (!idObject) return null;

    // Nếu là object với $oid
    if (idObject.$oid) return idObject.$oid;

    // Nếu là string
    if (typeof idObject === 'string') return idObject;

    // Nếu là object MongoDB đã chuyển đổi
    if (idObject.toString) return idObject.toString();

    return null;
  };

  // Hàm xử lý dữ liệu ReadBy
  const processReadByData = (msg, currentUserId, conversations) => {
    // Nếu không có dữ liệu readBy
    if (!msg.readBy || !Array.isArray(msg.readBy) || msg.readBy.length === 0) {
      return { readers: [], count: 0 };
    }

    // Lọc bỏ người dùng hiện tại và người gửi tin nhắn
    const filteredReaderIds = msg.readBy.filter(readerId => {
      const id = extractId(readerId);
      const currentId = extractId(currentUserId);
      const senderId = extractId(msg.sender._id);

      // Chỉ quan tâm đến người khác đã đọc (không phải người dùng hiện tại hoặc người gửi)
      return id !== currentId && id !== senderId;
    });

    if (filteredReaderIds.length === 0) {
      return { readers: [], count: 0 };
    }

    // Tạo mapping người dùng từ thông tin đã có và conversations
    const userMap = new Map();

    // Thêm người gửi và người nhận vào map để tìm kiếm nhanh hơn
    if (msg.sender) {
      userMap.set(extractId(msg.sender._id), {
        _id: msg.sender._id,
        avatar: msg.sender.avatar || "/placeholder.svg",
        username: msg.sender.name || "Unknown"
      });
    }

    if (msg.receiver) {
      userMap.set(extractId(msg.receiver._id), {
        _id: msg.receiver._id,
        avatar: msg.receiver.avatar || "/placeholder.svg",
        username: msg.receiver.name || "Unknown"
      });
    }

    // Thêm thành viên từ receiver.members nếu có
    if (msg.receiver && msg.receiver.members) {
      // Nếu là nhóm, lấy thông tin thành viên từ conversations
      conversations.forEach(conv => {
        if (conv._id && conv.avatar) {
          userMap.set(extractId(conv._id), {
            _id: conv._id,
            avatar: conv.avatar,
            username: conv.username || conv.name || "Unknown"
          });
        }
      });
    }

    // Lấy thông tin chi tiết của tối đa 3 người đọc
    const detailedReaders = filteredReaderIds.slice(0, 3).map(readerId => {
      const id = extractId(readerId);
      // Tìm thông tin từ userMap trước
      if (userMap.has(id)) {
        return userMap.get(id);
      }

      // Nếu không tìm thấy trong userMap, tìm trong conversations
      const readerInfo = conversations.find(conv =>
        extractId(conv._id) === id ||
        (conv.members && conv.members.some(m => extractId(m) === id))
      );

      return readerInfo || {
        _id: id,
        avatar: "/placeholder.svg",
        username: "Unknown"
      };
    });

    return {
      readers: detailedReaders,
      count: filteredReaderIds.length
    };
  };

  // reply mess
  let [previewReply, setPreviewReply] = useState("")
  const handleReply = async (selectedMessage) => {
    // Tách nội dung từ dòng 2 trở đi (nếu có \n)
    const parts = selectedMessage.msg.split('\n\n');
    let contentAfterFirstLine = parts.length > 1 ? parts.slice(1).join('\n') : selectedMessage.msg;

    if (contentAfterFirstLine.startsWith("https://monhoc1.s3.ap-southeast-1.amazonaws.com/media")) {
      contentAfterFirstLine = "*file*"
    }

    setPreviewReply(selectedMessage.sender.name + ": " + contentAfterFirstLine);
    setHasSelectedImages(true)
  }

  const handleClearReply = async () => {
    setPreviewReply("")
    setHasSelectedImages(false);
  }

  // call
  const handleStartCall = props?.handleStartCall;

  // lọc xóa tin nhắn phía tôi
  const filteredMessages = messages.filter((item) =>
    !(
      (item.isDeletedBySender && item.sender._id === user._id) ||
      (item.isDeletedByReceiver && item.receiver._id === user._id) ||
      (Array.isArray(item.memberDel) && item.memberDel.includes(user._id))
    )
  );

  return (
    <div className="row g-0 h-100">
      {/* Main Chat Area */}
      <div className="col bg-light" style={{ position: "relative" }}>
        {/* Chat Header */}
        <div className="bg-white p-2 d-flex align-items-center border-bottom justify-content-between">
          <div className="d-flex align-items-center">
            <img
              src={receiver.avatar ? receiver.avatar : "/placeholder.svg"}
              className="rounded-circle"
              alt=""
              style={{ width: "40px", height: "40px" }}
              onClick={openModal}
            />
            <AccountInfo isOpen={isOpen} closeModal={closeModal} user={receiver} socketRef={props.socketRef} />
            <div className="ms-2">
              <div className="fw-medium">{props.roomData.receiver.username}</div>
              <small className="text-muted">Hoạt động {convertTimeAction(receiver.time)}</small>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span
              className="btn btn-light rounded-circle mb-1"
              onClick={() => handleStartCall(user, receiver)} // Gọi hàm handleStartCall khi bấm
            >
              <Phone size={16} />
            </span>
            <span className="btn btn-light rounded-circle mb-1"
            // onClick={handleStartCall} // Gọi hàm handleStartCall khi bấm
            >
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
        <div
          className="chat-container p-3"
          style={{
            height: hasSelectedImages
              ? "calc(100vh - 230px)" // Khi có ảnh được chọn
              : "calc(100vh - 130px)", // Khi không có ảnh nào được chọn
            overflowY: "auto",
            position: "relative"
          }}
          ref={chatContainerRef}
          onScroll={handleScroll}
        >

          {/* Vị trí loading tin nhắn */}
          {isLoadingOlder && (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <span className="ms-2 text-muted">Đang tải tin nhắn cũ...</span>
            </div>
          )}

          {/* Thông báo hiển thị hết tin nhắn */}
          {!hasMoreMessages && messages.length > 0 && (
            <div className="text-center py-3">
              <small className="text-muted fst-italic">Bạn đã xem hết tin nhắn</small>
            </div>
          )}

          <div className="flex flex-col justify-end">
            {filteredMessages &&
              filteredMessages.map((msg, index) => {

                // Kiểm tra khoảng thời gian giữa tin nhắn hiện tại và tin nhắn trước
                const prevMsg = index > 0 ? filteredMessages[index - 1] : null;

                // Kiểm tra nếu tin nhắn này và tin nhắn trước đó có cùng người gửi
                const isSameSender = prevMsg && prevMsg.sender._id === msg.sender._id;

                // Kiểm tra khoảng thời gian giữa 2 tin nhắn (> 10 phút = 600000ms)
                const timeDiff = prevMsg
                  ? new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime()
                  : 0;
                const isLongTimeDiff = timeDiff > 600000; // 10 phút

                // Hiển thị avatar khi: tin nhắn đầu tiên, người gửi khác, hoặc khoảng cách > 10p
                const showAvatar = !isSameSender || isLongTimeDiff || index === 0;

                // Hiển thị dấu thời gian khi khoảng cách > 10p
                const showTimestamp = isLongTimeDiff || index === 0;

                return (
                  <React.Fragment key={index}>

                    {/* Hiển thị timestamp khi thời gian > 10 phút */}
                    {showTimestamp && (
                      <div className="time-divider text-center my-3">
                        <span className="bg-light px-3 py-1 rounded-pill text-muted small">
                          {new Date(msg.createdAt).toLocaleString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}

                    <div
                      key={index}
                      className={`p-1 my-1 d-flex chat-message ${msg.sender._id === user._id ? "justify-content-end" : "justify-content-start"}`}
                    >

                      {/* Hiển thị avatar cho người khác (không phải mình) */}
                      {msg.sender._id !== user._id && (
                        <div className="me-2" style={{ minWidth: "36px", alignSelf: "flex-start" }}>
                          {showAvatar ? (
                            <img
                              src={receiver.avatar || "https://i.imgur.com/l5HXBdTg.jpg"}
                              alt="avatar"
                              className="message-avatar"
                              style={{ width: "32px", height: "32px", borderRadius: "50%" }}
                            />
                          ) : (
                            <div style={{ width: "32px", height: "32px" }}></div>
                          )}
                        </div>
                      )}

                      <div
                        className={`message-content ${isSameSender ? "message-group" : ""}`}
                        style={{ maxWidth: "70%" }}
                      >
                        <div
                          className={`message-bubble ${msg.sender._id === user._id ? "own" : "other"} ${msg.type !== "text" && msg.type !== "file" && msg.type !== "system" ? "bg-transparent" : ""
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
                                <div key={index} className="grid-item">
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
                          ) : msg.type === "system" ? (
                            <span><i>{msg.msg || ""}</i></span>
                          ) : (
                            <div style={{ whiteSpace: 'pre-line' }}>
                              {msg.msg || ""}
                            </div>
                          )}

                          {/* Phản ứng và thời gian */}
                          <div className="reaction-time-container">
                            <div
                              className="reaction-container"
                              onMouseEnter={(event) => handleShowReactionPopup(msg._id, event)}
                              onMouseLeave={() => handleHideReactionPopup(msg._id)}
                            >
                              <span className="reaction-icon">
                                <Smile size={20} />
                              </span>
                              {reactions[msg._id] && reactions[msg._id].length > 0 && (
                                <div className="reaction-summary">
                                  {reactions[msg._id].map((reaction, index) => (
                                    <span key={index} className="reaction-item">
                                      {textToIconMap[reaction.emoji]}
                                      <span className="reaction-count">{reaction.count || 1}</span>
                                    </span>
                                  ))}
                                </div>
                              )}
                              {reactionPopupVisible?.messageId === msg._id && (
                                <div className="reaction-popup"
                                  style={{
                                    top: reactionPopupVisible.position.y,
                                    left: reactionPopupVisible.position.x,
                                  }}
                                  onMouseEnter={() => {
                                    if (hideReactionTimeout) {
                                      clearTimeout(hideReactionTimeout);
                                    }
                                  }}
                                  onMouseLeave={() => handleHideReactionPopup(msg._id)}
                                >
                                  {Object.keys(emojiToIconMap).map((emoji, index) => (
                                    <span
                                      key={index}
                                      className="reaction-emoji"
                                      onClick={() => handleReactToMessage(msg._id, emoji)}
                                    >
                                      {emojiToIconMap[emoji]}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className={`message-time d-flex align-items-center`}>
                              {convertTime(msg.createdAt)}
                            </div>
                          </div>

                          {/* Nút chia sẻ */}
                          {/* <button
                        className={`share-button-1 `}
                        onClick={() => handleOpenShareModal(msg)}
                      >
                        <Share2 size={16} className="text-muted" />
                      </button> */}
                        </div>
                      </div>

                    </div>
                  </React.Fragment>)
              })}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Nút cuộn về tin nhắn mới nhất */}
        {showScrollToBottom && (
          <button
            className="btn btn-primary rounded-circle position-absolute"
            onClick={scrollToBottom}
            style={{
              bottom: '80px',
              right: '20px',
              zIndex: 100,
              width: '40px',
              height: '40px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
          </button>
        )}

        {/* Message Input */}
        <div className="bg-white p-2 border-top" >
          {/* Xem hình ảnh trước khi gửi */}
          <div
            className="preview-container d-flex flex-wrap gap-2 mt-2 position-relative"
            style={{
              maxHeight: "100px",
              overflowY: "auto",
            }}
          >
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

            {/* Xóa tất cả */}
            {previewImages.length > 0 && (
              <button
                className="btn btn-link text-danger position-absolute top-0 end-0"
                onClick={handleClearAllPreviews}
                style={{ fontSize: "12px", lineHeight: "1" }}
              >
                Xóa tất cả
              </button>
            )}
          </div>

          {/* Xem tin nhắn reply */}
          {previewReply && (
            <div className="">
              <label className="form-label fw-bold">Trả lời tin nhắn:</label>
              <div className="alert alert-secondary d-flex justify-content-between align-items-start">
                <div>{previewReply}</div>
                <button
                  type="button"
                  className="btn-close ms-3"
                  aria-label="Bỏ"
                  onClick={handleClearReply}
                ></button>
              </div>
            </div>
          )}

          {/* Vùng nhập tin nhắn */}
          <div className="d-flex align-items-center">
            <input
              type="file"
              multiple
              accept=".doc,.docx,.xls,.xlsx,.pdf,.mp4"
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ display: "none" }} // Ẩn input
            />
            <button className="btn btn-light me-2" onClick={handleButtonClick}>
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
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleMessage(message);
                }
              }}
              placeholder="Nhập tin nhắn..."
              ref={messageInputRef}
            />

            {/* Nút smile */}
            <button
              className="btn btn-light ms-2"
              // data-bs-toggle="modal"
              // data-bs-target="#iconModal"
              onClick={handleShowEmojiPopup}
              ref={emojiButtonRef}
            >
              <Smile size={20} />
            </button>
            {/* <IconModal onSelect={handleEmojiSelect} /> */}

            <EmojiPopup
              isOpen={showEmojiPopup}
              position={emojiButtonPosition}
              showSidebar={showSidebar}
              onClose={() => setShowEmojiPopup(false)}
              onSelect={handleEmojiSelect}
            />

            {/* Nút gửi */}
            <button
              className="btn btn-primary ms-2"
              onClick={() => handleMessage(message)}
            >
              <Send size={20} />
            </button>
          </div>

          {Object.values(typingUsers).length > 0 && (
            <div className={`typing-indicator ${previewImages.length > 0 ? 'with-preview' : 'normal'}`}>
              <small className="text-muted d-flex align-items-center">
                <span>
                  {Object.values(typingUsers).length === 1
                    ? `${Object.values(typingUsers)[0]} đang nhập...`
                    : `${Object.values(typingUsers).length} người đang nhập...`}
                </span>
                <span className="typing-dots"></span>
              </small>
            </div>
          )}

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
        <div className="col-auto bg-white border-start responsive-sidebar">
          <div className="border-bottom header-right-sidebar">
            <h6 className="text-center">Thông tin hội thoại</h6>
          </div>
          <div className="text-center p-3 border-bottom">
            <div className="position-relative d-inline-block mb-2">

              <img
                src={props.roomData.receiver.avatar || "/placeholder.svg"}
                alt="Profile"
                className="rounded-circle"
                style={{ width: "80px", height: "80px" }}
                onClick={openModal}
              />

            </div>
            <h6 className="mb-3">{props.roomData.receiver.username}</h6>
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
          <div className="popup-item d-flex align-items-center" onClick={() => handleReply(selectedMessage)}>
            <Reply size={16} className="me-2" />
            <span>Trả lời</span>
          </div>
          <div className="popup-item d-flex align-items-center" onClick={() => handleOpenShareModal(selectedMessage)}>
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
          {selectedMessage?.sender?._id === user?._id &&
            new Date() - new Date(selectedMessage.createdAt) < 3600000 && (
              <div
                className="popup-item d-flex align-items-center text-danger"
                onClick={() => handleRecallMessage(selectedMessage)}>
                <RotateCw size={16} className="me-2" />
                <span>Thu hồi</span>
              </div>
            )}
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


      {/* Modal */}
      <ShareMsgModal
        show={showShareModal}
        onHide={() => setShowShareModal(false)}
        message={selectedMessageShareModal}
        conversations={conversations}
        onlineUsers={props.onlineUsers}
        socketRef={props.socketRef}
        setAllMsg={props.setAllMsg}
        user={user}
        selectedUser={props.selectedUser}
      />
    </div>
  );
}