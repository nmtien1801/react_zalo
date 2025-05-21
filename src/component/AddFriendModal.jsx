import React, { useState } from 'react';
import { Modal, Form, Button, ListGroup, InputGroup } from 'react-bootstrap';
import { getRoomChatByPhoneService } from "../service/roomChatService"; // Import hàm gọi API
import { sendRequestFriendService } from '../service/friendRequestService';
import AccountInfo from '../page/info/accountInfo';


const AddFriendModal = ({ show, onHide, socketRef }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState({}); // Lưu kết quả tìm kiếm

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        // Kiểm tra nếu query rỗng thì không tìm
        if (!query) return;

        const response = await getRoomChatByPhoneService(query);

        if (response.EC === 0) {
            setSearchResult(response.DT);
            openModal(); // Mở modal sau khi tìm thấy kết quả
            setSearchQuery(''); // Xóa input sau khi tìm kiếm
        } else {
            setSearchQuery(''); // Xóa input nếu không tìm thấy kết quả
            alert(response.EM); // Hiển thị thông báo lỗi nếu có
        }
    };


    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);


    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Thêm bạn</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {/* Search Input */}
                <InputGroup className="mb-3">
                    <Form.Control
                        type="tel"
                        placeholder="số tài khoản"
                        value={searchQuery}
                        onChange={(e) => {
                            const value = e.target.value;
                            // Chỉ cho phép số
                            if (/^\d*$/.test(value)) {
                                setSearchQuery(value); // Chỉ cập nhật input
                            }
                        }}
                    />

                    <AccountInfo isOpen={isOpen} closeModal={closeModal} user={searchResult} socketRef={socketRef} />

                    {searchQuery && (
                        <Button variant="outline-secondary" onClick={() => setSearchQuery('')}>
                            x
                        </Button>
                    )}
                </InputGroup>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Hủy</Button>
                <Button variant="primary"
                    onClick={() => handleSearch({ target: { value: searchQuery } })}
                >Tìm kiếm</Button>

            </Modal.Footer>
        </Modal>
    );
};

export default AddFriendModal;