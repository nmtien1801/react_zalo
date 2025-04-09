import React, { useState } from 'react';
import { Modal, Form, Button, ListGroup, InputGroup } from 'react-bootstrap';
import { getRoomChatByPhoneService } from "../../service/roomChatService"; // Import hàm gọi API
import { sendRequestFriendService } from '../../service/friendRequestService';


const AddFriendModal = ({ show, onHide }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({}); // Lưu kết quả tìm kiếm
    const [loading, setLoading] = useState(false); // Trạng thái loading

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim() === '') {
            setSearchResults([]); // Xóa kết quả nếu input rỗng
            return;
        }

        setLoading(true); // Bắt đầu loading
        try {
            const response = await getRoomChatByPhoneService(query); // Gọi API

            if (response.EC === 0) {
                setSearchResults(response.DT || []); // Cập nhật kết quả tìm kiếm
            } else {
                setSearchResults([]); // Không có kết quả
            }
        } catch (error) {
            console.error("Error fetching search results:", error);
            setSearchResults([]); // Xử lý lỗi
        } finally {
            setLoading(false); // Kết thúc loading
        }
    };

    const handleAddFriend = async (phone) => {
        // Gọi API để thêm bạn bè ở đây

        const data = {
            toUser: phone,
            content: 'Xin chào! Tôi muốn kết bạn với bạn.',
        }

        const response = await sendRequestFriendService(data);

        console.log(response);


        if (response.EC === 0) {
            alert("Đã gửi lời mời kết bạn thành công!");
            setSearchQuery(''); // Xóa input sau khi gửi lời mời
            setSearchResults({}); // Xóa kết quả tìm kiếm
        }
        else {
            alert(response.EM); // Hiển thị thông báo lỗi nếu có
        }

        onHide(); // Đóng modal sau khi gửi lời mời
    }

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Thêm bạn</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {/* Search Input */}
                <InputGroup className="mb-3">
                    <InputGroup.Text>
                        search
                    </InputGroup.Text>
                    <Form.Control
                        placeholder="(+84) Số điện thoại"
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                    {searchQuery && (
                        <Button variant="outline-secondary" onClick={() => setSearchQuery('')}>
                            x
                        </Button>
                    )}
                </InputGroup>

                {/* Kết quả tìm kiếm */}
                {loading ? (
                    <div className="text-muted">Đang tìm kiếm...</div>
                ) : searchQuery && (
                    <>
                        <h6 className="mt-4 mb-2 text-muted">Kết quả tìm kiếm</h6>
                        <ListGroup variant="flush">
                            {Object.keys(searchResults).length > 0 ? ( // Kiểm tra nếu đối tượng không rỗng
                                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div className="fw-bold">{searchResults.username}</div>
                                        <small className="text-muted">{searchResults.phone}</small>
                                    </div>
                                    <Button variant="primary" size="sm"
                                        onClick={() => handleAddFriend(searchResults.phone)} // Gọi hàm thêm bạn bè
                                    >Kết bạn</Button>
                                </ListGroup.Item>
                            ) : (
                                <div className="text-muted">Không tìm thấy kết quả</div>
                            )}
                        </ListGroup>
                    </>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Hủy</Button>
                <Button variant="primary">Tìm kiếm</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddFriendModal;