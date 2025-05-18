import React from "react";
import { Modal, Button } from "react-bootstrap";

const CallVoiceModal = ({ receiver, callModalVisible, handleCancelCall }) => {
  return (
    <Modal show={callModalVisible} onHide={handleCancelCall} centered>
      <Modal.Body className="text-center">
        <p className="fs-5 fw-bold text-primary">
          Đang gọi {receiver.username}...
        </p>
        <Button variant="danger" onClick={handleCancelCall}>
          Hủy
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default CallVoiceModal;
