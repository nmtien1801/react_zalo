import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Modal, Button } from "react-bootstrap";

const socket = io("http://localhost:8080");

const CallScreen = ({ roomId, show, onHide, user, receiver }) => {
  const localVideoRef = useRef(null); // video của người gọi
  const remoteVideoRef = useRef(null); // video của người đối diện
  const peerConnection = useRef(null); // kết nối WebRTC
  const localStream = useRef(null);
  const [callTimer, setCallTimer] = useState(60);

  useEffect(() => {
    if (!show) return; // Chỉ chạy khi modal mở
    startCall();

    socket.emit("join-call", roomId, socket.id, user, receiver);

    // xử lý WebRTC -> call
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // những người tham gia nhóm gọi
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("candidate", roomId, event.candidate);
      }
    };

    // xử lý khi có video/audio từ người gọi
    peerConnection.current.ontrack = (event) => {
      console.log("Remote stream received: ", event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Nhận lời mời kết nối từ người gọi
    socket.on("offer", async (offer) => {
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socket.emit("answer", roomId, answer);
    });

    // Nhận câu trả lời
    socket.on("answer", (answer) => {
      peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    // giúp hai thiết bị tìm cách kết nối trực tiếp với nhau trong WebRTC
    socket.on("candidate", (candidate) => {
      peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    // Xử lý khi cuộc gọi kết thúc
    socket.on("call-ended", () => {
      endCall();
    });
console.log("receiver: ", receiver);

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("candidate");
      socket.off("call-ended");
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
    };
  }, [roomId, show]);

  const startCall = async () => {
    try {
      localStream.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      console.log("Local stream: ", localStream.current);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream.current;
      }

      localStream.current.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, localStream.current);
      });

      const offer = await peerConnection.current.createOffer();
      
      await peerConnection.current.setLocalDescription(offer);
      socket.emit("offer", roomId, offer);

      startTimer();
    } catch (error) {
      console.error("Lỗi khi lấy camera/micro: ", error);
    }
  };

  const startTimer = () => {
    let interval = setInterval(() => {
      setCallTimer((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          endCall();
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endCall = () => {
    socket.emit("end-call", roomId);
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
      localStream.current = null;
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    onHide(); // Ẩn modal khi kết thúc cuộc gọi
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Video Call (Room: {roomId})</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Thời gian còn lại: {callTimer}s</p>
        <div className="d-flex justify-content-center">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "300px", border: "1px solid black" }}
          />
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ width: "300px", border: "1px solid black" }}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={endCall}>
          End Call
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CallScreen;
