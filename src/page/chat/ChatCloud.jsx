import { useState, useRef, useEffect } from "react";
import { Modal, Tab, Tabs } from "react-bootstrap"; // Import Bootstrap components

import {
  ImageIcon,
  File,
  LinkIcon,
  Shield,
  EyeOff,
  Smile,
  Paperclip,
  Send,
  Edit2,
  Trash2,
  Search,
  Layout,
  Reply,
  Share,
  Copy,
  Download,
  RotateCw,
  Image,
} from "lucide-react";
import "./Chat.scss";
import { useSelector, useDispatch } from "react-redux";
import { uploadAvatar } from '../../redux/profileSlice.js'
import IconModal from '../../component/IconModal.jsx'
import { deleteMessageForMeService, getReactionMessageService, loadMessagesService, recallMessageService, sendReactionService } from "../../service/chatService.js";
import ImageViewer from "./ImageViewer.jsx";
import ShareMsgModal from "../../component/ShareMsgModal.jsx";
import AccountInfo from "../info/accountInfo.jsx";
import { reloadMessages } from "../../redux/chatSlice.js";
import EmojiPopup from "../../component/EmojiPopup.jsx";

export default function ChatPerson(props) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.userInfo);
  const receiver = props.roomData.receiver;
  const fileInputRef = useRef(null); // Ref để truy cập input file ẩn
  const imageInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { setAllMsg } = props;
  const socketRef = props.socketRef;
  const roomData = props.roomData;

  const [showSidebar, setShowSidebar] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [hasSelectedImages, setHasSelectedImages] = useState(false);

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

  // Emoji Popup
  const [showEmojiPopup, setShowEmojiPopup] = useState(false);
  const [emojiButtonPosition, setEmojiButtonPosition] = useState({ top: 0, left: 0, right: 0 });
  const emojiButtonRef = useRef(null);

  // Ref cho input msg
  const messageInputRef = useRef(null);

  // State phân trang và scroll
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
    if (props.allMsg) {
      setMessages(props.allMsg);
    }
  }, [props.allMsg]);

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
        messages[messages.length - 1]?._id !== prevLastMessageIdRef.current;

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
      prevLastMessageIdRef.current = messages[messages.length - 1]?._id;
    }
  }, [messages, isLoadingOlder]);

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
      messages[0]?._id !== prevMessages[0]?._id &&
      messages[messages.length - 1]?._id === prevMessages[prevMessages.length - 1]?._id) {
      return;
    }

    // Check if we should auto-scroll for new messages
    if (shouldAutoScrollToBottom(prevMessages, messages)) {
      scrollToBottom();
    }
  }, [messages]);

  // Reset state khi receiver thay đổi
  useEffect(() => {
    // Khi component mount hoặc thay đổi receiver, cuộn xuống dưới cùng ngay lập tức
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }

    // Đặt lại các biến kiểm soát
    preventInitialFetch.current = true;
    initialLoadComplete.current = false;
    setPage(1);
    setHasMoreMessages(true);

    return () => {
      // Reset các biến khi unmount component
      preventInitialFetch.current = true;
      initialLoadComplete.current = false;
    };
  }, [props.roomData.receiver._id]);

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

    // gửi cloud
    if (roomData.receiver.type === 3) {
      props.handleLoadMessages(receiver._id, receiver.type);
    }

    setMessage("");
  };

  const [sections] = useState([
    { id: "media", title: "Ảnh/Video", icon: ImageIcon },
    { id: "files", title: "File", icon: File },
    { id: "links", title: "Link", icon: LinkIcon },
  ]);

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

  // Hàm kiểm tra xem có nên tự động cuộn xuống dưới cùng không
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
      // Kiểm tra tồn tại của chatContainerRef.current
      const chatContainer = chatContainerRef.current;
      if (!chatContainer) {
        console.warn("Chat container not found, aborting loadOlderMessages");
        setIsLoadingOlder(false);
        return;
      }

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

          // Duy trì vị trí cuộn
          const maintainScrollPosition = () => {
            // Kiểm tra lại chatContainer vì có thể đã thay đổi sau khi setMessages
            if (chatContainerRef.current) {
              const newScrollHeight = chatContainerRef.current.scrollHeight;
              const heightDifference = newScrollHeight - oldScrollHeight;
              chatContainerRef.current.scrollTop = heightDifference + scrollPosition;
            }
          };

          // Gọi nhiều lần để đảm bảo thực hiện sau khi DOM đã cập nhật
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
    if (!chatContainerRef.current) return; // Nếu không có container thì không xử lý

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

  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

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

  //Show popup emoji
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
    const rect = event.currentTarget.getBoundingClientRect(); // Lấy tọa độ phần tử
    let x = rect.left;
    let y = rect.bottom;

    const chatContainer = document.querySelector(".chat-container");
    const containerRect = chatContainer.getBoundingClientRect();

    if (x > containerRect.right - 200) {
      x = rect.left - containerRect.right - 50;
    } else {
      x = 0;
    }

    y = 0;

    setReactionPopupVisible({
      messageId,
      position: { x, y },
    });
  };

  const handleHideReactionPopup = (messageId) => {
    if (reactionPopupVisible?.messageId === messageId) {
      setReactionPopupVisible(null);
    }
  };

  //Hàm phản ứng
  const handleReactToMessage = (messageId, emoji) => {
    const emojiText = emojiToTextMap[emoji];
    if (!emojiText) return;

    sendReactionService(messageId, user._id, emojiText)
      .then((response) => {
        if (response.EC === 0) {
          console.log("Reaction sent successfully:", response.DT);

          setReactions((prevReactions) => {
            const currentReactions = prevReactions[messageId] || [];
            const existingReactionIndex = currentReactions.findIndex(
              (reaction) => reaction.emoji === emojiText && reaction.userId === user._id
            );

            if (existingReactionIndex !== -1) {
              currentReactions.splice(existingReactionIndex, 1);
            } else {
              currentReactions.push({
                emoji: emojiText,
                userId: user._id,
                count: 1,
              });
            }

            return {
              ...prevReactions,
              [messageId]: [...currentReactions],
            };
          });
        } else {
          console.error("Failed to send reaction:", response.EM);
        }
      })
      .catch((error) => {
        console.error("Error sending reaction:", error);
      });
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

  // Hàm làm sạch ảnh review
  const handleClearAllPreviews = () => {
    setPreviewImages([]); // Xóa toàn bộ ảnh xem trước
    setHasSelectedImages(false);
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
      <div className="col bg-light">
        {/* Chat Header */}
        <div className="bg-white p-2 d-flex align-items-center border-bottom justify-content-between">
          <div className=" d-flex align-items-center">
            <img
              src="/cloud.jpg"
              className="rounded-circle"
              alt=""
              style={{ width: "40px", height: "40px" }}
            />
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
              ? "calc(100vh - 230px)" // Khi có ảnh được chọn
              : "calc(100vh - 130px)", // Khi không có ảnh nào được chọn
            overflowY: "auto",
          }}
          onScroll={handleScroll} // Thêm sự kiện cuộn
        >
          <div className="flex flex-col justify-end">
            {filteredMessages &&
              filteredMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 my-1 d-flex ${msg.sender._id === user._id ? "justify-content-end" : "justify-content-start"
                    }`}
                >
                  <div
                    className={`p-3 max-w-[70%] break-words rounded-3 wrap-container ${msg.type === "text" || msg.type === "file" || msg.type === "system"
                      ? msg.sender._id === user._id
                        ? "bg-primary text-white"
                        : "bg-white text-dark"
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
                                {reaction.count || 1}
                              </span>
                            ))}
                          </div>
                        )}
                        {reactionPopupVisible?.messageId === msg._id && (
                          <div className="reaction-popup"
                            style={{
                              top: reactionPopupVisible.position.y,
                              left: reactionPopupVisible.position.x,
                            }}>
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
                      <div
                        className={`message-time`}
                      >
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
              ))}

            <div ref={messagesEndRef} />
          </div>
        </div>

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
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (previewReply !== "") {
                    sendMessage(`${previewReply}\n\n${message}`, "text");
                    setHasSelectedImages(false);
                    setPreviewReply("")
                  } else {
                    sendMessage(message, "text");
                  }
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
        </div>
      </div>

      {/* Right Sidebar */}
      {showSidebar && (
        <div
          className="col-auto bg-white border-start responsive-sidebar"
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
              />
              <button className="btn btn-light btn-sm rounded-circle position-absolute bottom-0 end-0 p-1">
                <Edit2 size={14} />
              </button>
            </div>
            <h5 className="mb-3">Cloud của tôi</h5>
            <small className="text-muted">
              Lưu trữ và truy cập nhanh những nội dung quan trọng của bạn ngay
              trên zata
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