import React, { useState } from 'react';
import { Modal, Form, Button, ListGroup, InputGroup } from 'react-bootstrap';

const AddFriendModal = ({ isOpen, closeModal }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Dữ liệu mẫu
    const recentResults = [
        { id: 1, name: "Vũ Thị Kiều", phone: "(+84) 0942 158 473" },
        { id: 2, name: "Nguyễn Hương", phone: "(+84) 0943 386 287" },
        { id: 3, name: "Nam", phone: "(+84) 0352 714 275" }
    ];

    const suggestedFriends = [
        { id: 4, name: "Lê Phúc Lữ", source: "Từ gói ý kết bạn" },
        { id: 5, name: "Minh Anh", source: "Từ gói ý kết bạn" },
        { id: 6, name: "Minh Nhựt", source: "Từ gói ý kết bạn" }
    ];

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Thêm bạn</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {/* Search Input */}
                <InputGroup className="mb-3">
                    <InputGroup.Text>
                        <Search />
                    </InputGroup.Text>
                    <Form.Control
                        placeholder="(+84) Số điện thoại"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                            <X />
                        </Button>
                    )}
                </InputGroup>

                {/* Kết quả gần nhất */}
                <h6 className="mt-4 mb-2 text-muted">Kết quả gần nhất</h6>
                <ListGroup variant="flush">
                    {recentResults.map(user => (
                        <ListGroup.Item key={user.id} className="d-flex justify-content-between align-items-center">
                            <div>
                                <div className="fw-bold">{user.name}</div>
                                <small className="text-muted">{user.phone}</small>
                            </div>
                            <Button variant="primary" size="sm">Kết bạn</Button>
                        </ListGroup.Item>
                    ))}
                </ListGroup>

                {/* Có thể bạn quen */}
                <h6 className="mt-4 mb-2 text-muted">Có thể bạn quen</h6>
                <ListGroup variant="flush">
                    {suggestedFriends.map(user => (
                        <ListGroup.Item key={user.id}>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <div className="fw-bold">{user.name}</div>
                                    <small className="text-muted">{user.source}</small>
                                </div>
                                <Button variant="primary" size="sm">Kết bạn</Button>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>

                {/* Xem thêm */}
                <div className="text-center mt-3">
                    <Button variant="link">Xem thêm</Button>
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Hủy</Button>
                <Button variant="primary">Tìm kiếm</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddFriendModal;