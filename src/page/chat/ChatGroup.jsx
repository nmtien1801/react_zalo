import { useState, useRef, useEffect } from "react";
import { UserX } from "lucide-react";
import { Modal, Tab, Tabs } from "react-bootstrap"; // Import Bootstrap components

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
  Share2
} from "lucide-react";
import "./Chat.scss";
import GroupInfo from "../info/GroupInfo.jsx";
import { useSelector, useDispatch } from "react-redux";
import CallScreen from "../../component/CallScreen.jsx";
import { uploadAvatar } from '../../redux/profileSlice.js'
import IconModal from '../../component/IconModal.jsx'
import { deleteMessageForMeService, recallMessageService, dissolveGroupService, sendReactionService, getReactionMessageService } from "../../service/chatService.js";
import ImageViewer from "./ImageViewer.jsx";
import ShareMsgModal from "../../component/ShareMsgModal.jsx";
import ManageGroup from "../auth/ManageGroup.jsx"
import { uploadAvatarGroup } from '../../redux/profileSlice.js'
import AddMemberModal from "../../component/AddMemberModal.jsx";
import { transLeaderService } from "../../service/permissionService";

import { getRoomChatMembersService } from "../../service/roomChatService"; // Import service
import { removeMemberFromGroupService } from "../../service/chatService"; // Import service
import { reloadMessages } from "../../redux/chatSlice.js";

export default function ChatGroup(props) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.userInfo);
  const [avatarUrl, setAvatarUrl] = useState(props.roomData.receiver.avatar); // update avatar group
  const [receiver, setReceiver] = useState(props.roomData?.receiver || null);
  const fileInputRef = useRef(null); // Ref để truy cập input file ẩn
  const imageInputRef = useRef(null); // Ref để truy cập input ảnh nhóm
  const messagesEndRef = useRef(null);
  const avatarInputRef = useRef(null);  // Ref để truy cập input avatar nhóm
  const socketRef = props.socketRef;
  const roomData = props.roomData;

  const [showSidebar, setShowSidebar] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const { setAllMsg } = props;

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const [isOpen, setIsOpen] = useState(false);

  const [usersMap, setUsersMap] = useState({});

  const [showAddMemberModal, setShowAddMemberModal] = useState(false); // State quản lý modal

  // Thêm state cho reaction (đặt cùng vị trí với các state khác)
  const [reactionPopupVisible, setReactionPopupVisible] = useState(null);
  const [reactions, setReactions] = useState({});
  const [hideReactionTimeout, setHideReactionTimeout] = useState(null);

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

  const handleOpenAddMemberModal = () => {
    setShowAddMemberModal(true); // Mở modal
  };

  const handleCloseAddMemberModal = () => {
    setShowAddMemberModal(false); // Đóng modal
  };

  const [hasSelectedImages, setHasSelectedImages] = useState(false);

  // Popup Chuột phải
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [selectedMessage, setSelectedMessage] = useState(null);

  const conversations = props.conversations || [];

  // ImageViewer
  const [previewImages, setPreviewImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // ManageGroup
  const [showManageGroup, setShowManageGroup] = useState(false)
  const [role, setRole] = useState('')

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

    // Hiển thị popup phía trên reaction-icon
    let x = 0;  // Tọa độ x tương đối với reaction-container
    let y = 0; // Đặt popup phía trên icon, giá trị âm để đi lên

    // Đảm bảo popup không vượt quá biên phải của chat container
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
    };

    if (messages.length > 0) {
      fetchReactions();
    }
  }, [messages]);

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

  // nghiem
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [members, setMembers] = useState([]); // State để lưu danh sách thành viên

  useEffect(() => {
    if (members.length > 0) {
      const newUsersMap = {};
      members.forEach(member => {
        newUsersMap[member._id] = {
          avatar: member.avatar || "https://i.imgur.com/l5HXBdTg.jpg",
          name: member.username
        };
      });
      setUsersMap(newUsersMap);
    }
  }, [members]);

  // Gọi API để lấy danh sách thành viên nhóm
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        if (receiver?._id) {
          const response = await getRoomChatMembersService(receiver._id); // Gọi API với roomId
          if (response.EC === 0) {
            setMembers(response.DT); // Lưu danh sách thành viên vào state
            console.log("Danh sách thành viên nhóm:", response.DT); // Log danh sách thành viên
          } else {
            console.error("Lỗi khi lấy danh sách thành viên:", response.EM);
          }
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    };

    fetchMembers();
  }, [receiver?._id]);

  const handleRemoveMember = async (memberId) => {

    // Chuyển quyền trưởng nhóm
    if (receiver.role === 'leader' && memberId === user._id) {
      const otherMembers = receiver.members.filter(m => m !== user._id);

      if (otherMembers.length > 0) {
        // Chọn ngẫu nhiên 1 người trong danh sách
        const randomIndex = Math.floor(Math.random() * otherMembers.length);
        const newLeaderId = otherMembers[randomIndex];

        // Gọi API chuyển quyền
        let response = await transLeaderService(receiver._id, newLeaderId);

        if (response.EC === 0) {
          socketRef.current.emit("REQ_TRANS_LEADER", response.DT);
        }
      }

      // Chuyển hướng về trang danh sách nhóm
      window.location.reload();
    }

    let res = await removeMemberFromGroupService(receiver._id, memberId);
    console.log("res xóa thành viên", res);

    let req = {
      member: memberId,
      all: members,
    }
    socketRef.current.emit("REQ_REMOVE_MEMBER", req);
  };

  useEffect(() => {
    if (props.allMsg) {
      const filteredMessages = props.allMsg.filter(
        (msg) => !msg.memberDel?.includes(user._id)
      );
      setMessages(filteredMessages);
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

  // xử lý upload image
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

  // Kích hoạt input ẩn file khi nhấn nút
  const handleButtonClick = () => {
    fileInputRef.current.click(); // Mở dialog chọn file
  };

  // Kích hoạt input ẩn image khi nhấn nút
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

  // Kích hoạt input ẩn avatar khi nhấn nút
  const handleButtonUpdateClick = () => {
    avatarInputRef.current.click(); // Mở dialog chọn file
  };

  // Xử lý upload avatar group
  const handleUpdateAvatarGroup = async (e) => {
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
        console.log('res S3 avatar', response.payload.DT);
        let res = await dispatch(uploadAvatarGroup({ groupId: props.roomData.receiver._id, avatar: response.payload.DT }))
        setAvatarUrl(response.payload.DT);
        if (res.payload.EC === 0) {
          socketRef.current.emit("REQ_UPDATE_AVATAR", receiver);
        }

      } else {
        console.log('err upload ', response.payload.EM);
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
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
          memberDel: user._id
        };
      } else {
        member = user
      }

      const response = await deleteMessageForMeService(id, member);
      if (response.EC === 0) {
        console.log("Tin nhắn đã được xóa chỉ ở phía tôi:", response.DT);

        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== id)
        );

        const res = await dispatch(
          reloadMessages({ sender: user._id, receiver: receiver._id, type: receiver.type })
        );

        if (res.payload.EC === 0) {
          setAllMsg(res.payload.DT);
        }
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
    updatedPreviews.splice(index, 1);
    setPreviewImages(updatedPreviews);

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


  const handleClearAllPreviews = () => {
    setPreviewImages([]); // Xóa toàn bộ ảnh xem trước
    setHasSelectedImages(false);
  };

  const handleShare = (selectedMessage) => {
    console.log('selectedMessage ', selectedMessage);

  }

  // Quản lý nhóm
  const handleManageGroup = async () => {
    setShowManageGroup(false)
  }

  useEffect(() => {
    const role = conversations.find(item => item._id === receiver._id);
    if (role) {
      setRole(role.role)
    }
  }, []);

  // action socket
  useEffect(() => {
    socketRef.current.on("RES_MEMBER_PERMISSION", (data) => {
      const member = data.find((item) => item.sender._id === user._id);
      setReceiver({
        ...receiver,
        permission: member.receiver.permission,
        role: member.role,
      });
    });

    socketRef.current.on("RES_UPDATE_DEPUTY", (data) => {
      // Nếu không có bản ghi nào được cập nhật
      if (data.upsertedCount === 0) {
        setRole("member");
        return;
      }

      // Tìm xem user có phải là sender hoặc receiver không
      const member = data.find(
        (item) =>
          item?.sender?._id === user._id || item?.receiver?._id === user._id
      );
      console.log('member ', member);

      if (member) {
        setRole(member.role);
        setReceiver({
          ...receiver,
          permission: member.receiver.permission,
          role: member.role,
        });
      } else {
        if (receiver.role !== 'leader') {
          setRole("member");
        }
      }
    });

    socketRef.current.on("RES_ADD_GROUP", (data) => {
      const fetchMembers = async () => {
        try {
          if (receiver?._id) {
            const response = await getRoomChatMembersService(receiver._id);
            console.log("response ", response);

            if (response.EC === 0) {
              setMembers(response.DT); // Lưu danh sách thành viên vào state
            } else {
              console.error("Lỗi khi lấy danh sách thành viên:", response.EM);
            }
          }
        } catch (error) {
          console.error("Lỗi khi gọi API getRoomChatMembersService:", error);
        }
      };
      fetchMembers();
    })

    socketRef.current.on("RES_ACCEPT_GROUP", (data) => {
      const fetchMembers = async () => {
        try {
          if (receiver?._id) {
            const response = await getRoomChatMembersService(receiver._id);
            console.log("response ", response);

            if (response.EC === 0) {
              setMembers(response.DT); // Lưu danh sách thành viên vào state
            } else {
              console.error("Lỗi khi lấy danh sách thành viên:", response.EM);
            }
          }
        } catch (error) {
          console.error("Lỗi khi gọi API getRoomChatMembersService:", error);
        }
      };
      fetchMembers();
    })

    socketRef.current.on("RES_TRANS_LEADER", (data) => {
      const { newLeader, oldLeader } = data;
      let member = null;
      if (newLeader?.sender?._id === user._id) {
        member = newLeader;
      } else if (oldLeader?.sender?._id === user._id) {
        member = oldLeader;
      }

      setRole(member.role);
      setReceiver({
        ...receiver,
        role: member.role,
      })
      setShowManageGroup(false);
    });

    socketRef.current.on("RES_REMOVE_MEMBER", (data) => {
      if (receiver.role !== 'leader' && data.member === user._id) {
        window.location.reload();
      }
      const fetchMembers = async () => {
        try {
          if (receiver?._id) {
            const response = await getRoomChatMembersService(receiver._id);
            console.log("response ", response);

            if (response.EC === 0) {
              setMembers(response.DT); // Lưu danh sách thành viên vào state
            } else {
              console.error("Lỗi khi lấy danh sách thành viên:", response.EM);
            }
          }
        } catch (error) {
          console.error("Lỗi khi gọi API getRoomChatMembersService:", error);
        }
      };
      fetchMembers();
    })

    // update avatar
    socketRef.current.on("RES_UPDATE_AVATAR", (data) => {
      setReceiver({
        ...receiver,
        avatar: avatarUrl,
      })
    });
  }, [])

  // Handle dissolve group
  const handleDissolveGroup = async () => {
    try {
      const response = await dissolveGroupService(receiver._id);

      const { EC, EM } = response || {};

      if (EC === 0) {
        alert("Thành công", "Nhóm đã được giải tán!");
        socketRef.current.emit("REQ_DISSOLVE_GROUP", receiver);
      } else {
        alert("Lỗi", EM || "Không thể giải tán nhóm.");
      }
    } catch (error) {
      console.error("Lỗi khi giải tán nhóm:", error);
      alert("Lỗi", "Không thể giải tán nhóm, vui lòng thử lại sau.");
    }
  };

  // reply mess
  let [previewReply, setPreviewReply] = useState("")
  const handleReply = async (selectedMessage) => {
    // Tách nội dung từ dòng 2 trở đi (nếu có \n)
    const parts = selectedMessage.msg.split('\n\n');
    const contentAfterFirstLine = parts.length > 1 ? parts.slice(1).join('\n') : selectedMessage.msg;

    setPreviewReply(selectedMessage.sender.name + ": " + contentAfterFirstLine);
    setHasSelectedImages(true)
  }

  const handleClearReply = async () => {
    setPreviewReply("")
    setHasSelectedImages(false);
  }

  // call
  const handleStartCall = props?.handleStartCall;

  return (
    <div className="row g-0 h-100">
      {/* Main Chat Area */}
      <div className="col bg-light">
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
            <GroupInfo isOpen={isOpen} closeModal={closeModal} user={receiver} />
            <div className="ms-2">
              <div className="fw-medium">{props.roomData.receiver.username}</div>
              <small className="text-muted">Hoạt động {convertTimeAction(receiver.time)}</small>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="btn btn-light rounded-circle mb-1"
              onClick={() => handleStartCall(user, receiver)} // Gọi hàm handleStartCall khi bấm
            >
              <Phone size={16} />
            </span>
            <span className="btn btn-light rounded-circle mb-1">
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
          }}
        >
          <div className="flex flex-col justify-end">
            {messages &&
              messages.map((msg, index) => {

                // Kiểm tra nếu tin nhắn này và tin nhắn tiếp theo có cùng người gửi
                const prevMsg = messages[index - 1];
                const isSameSender = prevMsg && prevMsg.sender._id === msg.sender._id;

                // Lấy avatar từ usersMap hoặc dùng giá trị mặc định
                const senderAvatar = usersMap[msg.sender._id]?.avatar || msg.sender.avatar || "https://i.imgur.com/l5HXBdTg.jpg";
                const senderName = usersMap[msg.sender._id]?.name || msg.sender.name;

                return (
                  <div
                    key={index}
                    className={`p-1 my-1 d-flex chat-message ${msg.sender._id === user._id ? "justify-content-end" : "justify-content-start"}`}
                  >
                    {/* Hiển thị avatar cho người khác (không phải mình) */}
                    {msg.sender._id !== user._id && (
                      <div className="me-2" style={{ minWidth: "36px", alignSelf: "flex-start", marginTop: "23px" }}>
                        {(!isSameSender || index === 0) ? (
                          <img
                            src={senderAvatar}
                            alt="avatar"
                            className="rounded-circle message-avatar"
                          />
                        ) : (
                          <div style={{ width: "32px", height: "32px" }}></div>
                        )}
                      </div>
                    )}

                    <div className={`message-content ${isSameSender ? "message-group" : ""}`} style={{ maxWidth: "70%" }}>

                      {/* Hiển thị tên người gửi nếu không phải mình và là tin nhắn đầu tiên trong chuỗi */}
                      {msg.sender._id !== user._id && (!isSameSender || index === 0) && (
                        <div className="sender-name">
                          {senderName}
                        </div>
                      )}

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
                                {Object.entries(
                                  reactions[msg._id].reduce((acc, reaction) => {
                                    // Tạo object với key là emoji và value là số lượng
                                    if (!acc[reaction.emoji]) {
                                      acc[reaction.emoji] = 0;
                                    }
                                    acc[reaction.emoji] += reaction.count || 1;
                                    return acc;
                                  }, {})
                                ).map(([emoji, count], index) => (
                                  <span key={index} className="reaction-item" title={`${emoji}: ${count}`}>
                                    {textToIconMap[emoji]}
                                    <span className="reaction-count">{count}</span>
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
                          <div className={`message-time ${msg.type === "video" || msg.type === "image"
                            ? "text-secondary"
                            : msg.sender._id === user._id
                              ? "text-white-50"
                              : "text-muted"
                            }`}>
                            {convertTime(msg.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                )
              })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="bg-white p-2 border-top" >
          {/* Xem hình ảnh trước khi gửi */}
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
          {(receiver.permission.includes(3) || role === 'leader' || role === 'deputy') ? (<>
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
          </>) : (<div className="d-flex flex-wrap align-items-center">Chỉ có trưởng nhóm/ phó nhóm mới được phép nhắn tin</div>)}

        </div>
      </div>

      {/* Right Sidebar */}
      {
        showSidebar &&
        <div
          className="col-auto bg-white border-start"
          style={{ width: "300px", height: "100vh", overflowY: "auto" }}
        >
          {
            showManageGroup ?
              (<ManageGroup handleManageGroup={handleManageGroup} receiver={receiver} socketRef={props.socketRef} />) :
              (
                <>
                  {/* Header */}
                  <div className="border-bottom header-right-sidebar">
                    <h6 className="text-center">Thông tin hội thoại</h6>
                  </div>

                  {/* Group Profile Section */}
                  <div className="text-center p-3 border-bottom">
                    <div className="position-relative d-inline-block mb-2">

                      <img
                        src={avatarUrl ? avatarUrl : "/placeholder.svg"}
                        alt="Group"
                        className="rounded-circle"
                        style={{ width: "80px", height: "80px" }}
                        onClick={openModal}
                      />

                      {/* Input file ẩn */}
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleUpdateAvatarGroup}
                        ref={avatarInputRef}
                        style={{ display: "none" }} // Ẩn input
                      />

                      {/* Nút tùy chỉnh */}
                      <button className="btn btn-light btn-sm rounded-circle position-absolute bottom-0 end-0 p-1">
                        <Edit2 size={14} onClick={
                          () => {
                            if (
                              receiver.permission.includes(1) || receiver.role === 'leader' || receiver.role === 'deputy'
                            ) {
                              handleButtonUpdateClick();
                            } else {
                              alert('k có quyền chỉnh sửa');
                            }
                          }
                        } />
                      </button>
                    </div>
                    <h6 className="mb-3 d-flex align-items-center justify-content-center">
                      {props.roomData.receiver.username}
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
                        <button
                          className="btn btn-light rounded-circle mb-1"
                          onClick={() => {
                            if (
                              receiver.permission.includes(2) || receiver.role === 'leader' || receiver.role === 'deputy'
                            ) {
                              handleOpenAddMemberModal();
                            } else {
                              alert('k có quyền thêm');
                            }
                          }}
                        >
                          <UserPlus size={20} />
                        </button>
                        <div className="small">Thêm thành viên</div>
                      </div>
                      {(role === 'leader' || role === 'deputy') && <div className="text-center">
                        <button className="btn btn-light rounded-circle mb-1"
                          onClick={() => setShowManageGroup(true)}>
                          <Settings size={20} />
                        </button>
                        <div className="small">Quản lý nhóm</div>
                      </div>}
                    </div>
                  </div>

                  {/* Modal AddMember */}
                  <AddMemberModal
                    show={showAddMemberModal} // Truyền state hiển thị
                    onHide={handleCloseAddMemberModal} // Truyền hàm đóng modal
                    roomId={receiver._id} // Truyền roomId của nhóm
                    roomData={roomData}
                    socketRef={socketRef} // Truyền socketRef
                    user={user} // Truyền thông tin người dùng
                  />

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


                  {/* Thành viên */}
                  <div
                    className="d-flex align-items-center justify-content-between p-3 border-bottom hover-bg-light cursor-pointer"
                    onClick={() => setShowMemberModal(true)}
                  >
                    <div className="d-flex align-items-center">
                      <Users size={20} className="me-2" />
                      <span>Thành viên</span>
                    </div>
                    <span className="badge bg-primary">{members.length}</span></div>

                  {/* Modal danh sách thành viên */}
                  {showMemberModal && (
                    <div className="modal show d-block" tabIndex="-1" role="dialog">
                      <div className="modal-dialog" role="document">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title">Danh sách thành viên</h5>
                            <button
                              type="button"
                              className="btn-close"
                              onClick={() => setShowMemberModal(false)}
                            ></button>
                          </div>
                          <div className="modal-body">
                            {members.length > 0 ? (
                              <ul className="list-group">
                                {members.map((member, index) => (
                                  <li
                                    key={index}
                                    className="list-group-item d-flex align-items-center justify-content-between"
                                  >
                                    <div className="d-flex align-items-center">
                                      <img
                                        src={member.avatar || "/placeholder.svg"}
                                        alt={member.username}
                                        className="rounded-circle me-2"
                                        style={{ width: "40px", height: "40px" }}
                                      />
                                      <span>{member.username}</span>
                                    </div>
                                    {((role === 'leader' && member.role != 'leader') || (role === 'deputy' && member.role != 'leader')) &&
                                      <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleRemoveMember(member._id)}
                                      >
                                        Xóa
                                      </button>}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p>Không có thành viên nào.</p>
                            )}
                          </div>
                          <div className="modal-footer">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setShowMemberModal(false)}
                            >
                              Đóng
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}


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
                          <div className="d-flex align-items-center p-3 hover-bg-light cursor-pointer" onClick={() => handleRemoveMember(user._id)}>
                            <div
                              className="d-flex align-items-center justify-content-center rounded-circle bg-light"
                              style={{ width: "32px", height: "32px" }}
                            >
                              <LogOut size={18} className="text-danger" />
                            </div>
                            <div className="ms-2 text-danger">Rời nhóm</div>
                          </div>

                          {/* DissolveDissolve Group */}
                          {role === "leader" &&
                            <div className="d-flex align-items-center p-3 hover-bg-light cursor-pointer" onClick={handleDissolveGroup}>
                              <div
                                className="d-flex align-items-center justify-content-center rounded-circle bg-light"
                                style={{ width: "32px", height: "32px" }}
                              >
                                <UserX size={18} className="text-danger" />
                              </div>
                              <div className="ms-2 text-danger">Giải tán nhóm</div>
                            </div>}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )

          }
        </div>

      }


      {
        popupVisible && selectedMessage?.type !== "system" && (
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

        )
      }

      {
        selectedImage && (
          <ImageViewer imageUrl={selectedImage} onClose={handleCloseImageViewer} />
        )
      }


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
    </div >
  );
}