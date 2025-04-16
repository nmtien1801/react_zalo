import React, { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { Modal, Button, Form, Tab, Tabs, ListGroup, InputGroup } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import io from "socket.io-client";
import { getConversations } from "../redux/chatSlice";
export default function ShareMsgModal({ show, onHide, message, conversations, onlineUsers }) {


    const [conversations1, setConversations1] = useState([]);
    const [selectedRecipients, setSelectedRecipients] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isConnect, setIsConnect] = useState(false); // connect socke



    const user = useSelector((state) => state.auth.userInfo);

    const socketRef = useRef();

    // connect docket
    useEffect(() => {
        const socket = io.connect(import.meta.env.VITE_BACKEND_URL);

        socketRef.current = socket;
        socket.on("connect", () => setIsConnect(true));
        socket.off("disconnect", () => setIsConnect(false));
    }, []);


    useEffect(() => {
        setConversations1(conversations);
    }, [conversations]);



    const handleSendMsgs = () => {
        if (socketRef.current.connected) {
            let sender = { ...user };
            sender.socketId = socketRef.current.id;

            // Lặp qua danh sách người nhận
            selectedRecipients.forEach((recipient) => {
                const receiverOnline = onlineUsers.find((u) => u.userId === recipient._id);

                const data = {
                    msg: message?.msg, // Nội dung tin nhắn
                    receiver: {
                        ...recipient,
                        socketId: receiverOnline ? receiverOnline.socketId : null,
                    },
                    sender,
                    type: message?.type, // Kiểu tin nhắn (text, image, video, etc.)
                };

                console.log("Sending data: ", data);

                // Gửi tin nhắn qua socket
                socketRef.current.emit("SEND_MSG", data);
            });

            // Đóng modal sau khi gửi
            onHide();
        } else {
            console.error("Socket is not connected");
        }
    };





    const handleRecipientToggle = (user) => {
        setSelectedRecipients((prev) =>
            prev.some((recipient) => recipient._id === user._id)
                ? prev.filter((recipient) => recipient._id !== user._id)
                : [...prev, user]
        );
    };

    const handleShare = () => {
        onHide();
    };




    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Chia sẻ</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Tìm kiếm */}
                <InputGroup className="mb-3">
                    <Form.Control
                        placeholder="Tìm kiếm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>

                {/* Tabs */}
                <Tabs defaultActiveKey="recent" className="mb-3">
                    <Tab eventKey="recent" title="Gần đây">
                        <ListGroup>
                            {conversations.map((contact) => (
                                <ListGroup.Item
                                    key={contact._id}
                                    className="d-flex align-items-center"
                                >
                                    <Form.Check
                                        type="checkbox"
                                        className="me-2"
                                        checked={selectedRecipients.some((recipient) => recipient._id === contact._id)}
                                        onChange={() => handleRecipientToggle(contact)}
                                    />
                                    <img
                                        src={contact.avatar}
                                        alt={contact.username}
                                        className="rounded-circle me-2"
                                        style={{ width: "40px", height: "40px" }}
                                    />
                                    <span>{contact.username}</span>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Tab>
                    <Tab eventKey="groups" title="Nhóm trò chuyện">
                        <div className="text-center text-muted">Chưa có nhóm nào</div>
                    </Tab>
                    <Tab eventKey="friends" title="Bạn bè">
                        <div className="text-center text-muted">Chưa có bạn bè nào</div>
                    </Tab>
                </Tabs>



                {/* Nội dung tin nhắn */}
                <div className="border p-2 rounded mb-3 mt-5">
                    <strong>Chia sẻ tin nhắn</strong>
                    <div className="text-muted">
                        {message?.msg}
                    </div>
                </div>

                {/* Nhập tin nhắn */}
                {/* <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Nhập tin nhắn..."
                    className="mb-3"
                /> */}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Hủy
                </Button>
                <Button
                    variant="primary"
                    disabled={selectedRecipients.length === 0}
                    onClick={handleSendMsgs}
                >
                    Chia sẻ
                </Button>
            </Modal.Footer>
        </Modal>
    );
}