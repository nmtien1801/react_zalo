import React, { useEffect, useRef, useState, useCallback } from "react";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";
import "./CallControls.css";

const CallScreen = ({
  show,
  onHide,
  senderId,
  receiverId,
  callerName,
  receiverName,
  socketRef,
  isInitiator = false,
}) => {
  const pendingCandidates = { current: [] };
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [incomingCall, setIncomingCall] = useState(false);
  const [callerSocketId, setCallerSocketId] = useState(null);
  const [callStatus, setCallStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const peerConnectionRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [callerId, setCallerId] = useState(null);

  useEffect(() => {
    if (!window.RTCPeerConnection || !navigator.mediaDevices?.getUserMedia) {
      setErrorMessage("Trình duyệt không hỗ trợ gọi video");
      setCallStatus("error");
    }
    if (isInitiator) {
      setCallerId(senderId); // Người gọi: callerId là chính mình
    }
  }, [senderId, isInitiator]);

  const setupPeerConnection = useCallback(
    (pc, targetUserId) => {
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Sending ICE candidate to targetUserId:", targetUserId);
          socketRef.current.emit("relay-signal", {
            targetUserId,
            signal: {
              type: "candidate",
              candidate: event.candidate,
            },
          });
        }
      };

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") {
          setCallStatus("connected");
        } else if (pc.connectionState === "failed") {
          setErrorMessage("Kết nối thất bại");
          setCallStatus("error");
          endCall();
        }
      };
    },
    [socketRef]
  );

  const endCall = useCallback((isRemote = false) => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current?.srcObject) {
      remoteVideoRef.current.srcObject = null;
    }

    // Gửi tín hiệu kết thúc đến bên còn lại
    const targetUserId = isInitiator ? receiverId : callerId;
    if (socketRef.current && targetUserId) {
      console.log("Sending end-call to:", targetUserId);
      console.log("Socket connected:", socketRef.current.connected);
      socketRef.current.emit("end-call", { targetUserId });
    }else {
      console.log("Cannot send end-call. Socket:", socketRef.current, "Target:", targetUserId);
    }

    setIncomingCall(false);
    setCallerSocketId(null);
    setCallStatus("idle");
    onHide();
  }, [onHide, socketRef, isInitiator, receiverId, callerId]);

  const startCall = useCallback(async () => {
    if (peerConnectionRef.current) {
      console.warn("⚠️ Đã có PeerConnection hiện tại, không thể bắt đầu cuộc gọi mới");
      return;
    }
    try {
      setCallStatus("calling");

      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;
      setupPeerConnection(pc, receiverId);

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketRef.current.emit("call-user", {
        senderId,
        receiverId,
        offer,
      });
    } catch (err) {
      setErrorMessage("Không thể truy cập camera/microphone");
      setCallStatus("error");
      endCall();
    }
  }, [receiverId, senderId, setupPeerConnection, socketRef, endCall]);

  const handleIncomingCall = useCallback(
    async (offer, incomingCallerId) => {
      if (peerConnectionRef.current) {
        console.warn("⚠️ Đã có PeerConnection hiện tại, từ chối cuộc gọi đến");
        return;
      }
      try {
        setCallStatus("ringing");
        setIncomingCall(true);
        setCallerId(incomingCallerId); // Cập nhật callerId từ incoming-call

        const pc = new RTCPeerConnection();
        peerConnectionRef.current = pc;
        setupPeerConnection(pc, incomingCallerId); // Sử dụng incomingCallerId làm target

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
      } catch (err) {
        setErrorMessage("Không thể thiết lập kết nối");
        setCallStatus("error");
        endCall();
      }
    },
    [setupPeerConnection, endCall]
  );

  const answerCall = useCallback(async () => {
    try {
      const pc = peerConnectionRef.current;
      if (!pc || pc.signalingState !== "have-remote-offer") {
        throw new Error("PeerConnection không ở trạng thái phù hợp");
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      console.log("Sending answer to targetUserId:", callerId);
      socketRef.current.emit("relay-signal", {
        targetUserId: callerId,
        signal: answer,
      });

      setIncomingCall(false);
      setCallStatus("connected");
    } catch (err) {
      setErrorMessage("Không thể trả lời cuộc gọi");
      setCallStatus("error");
      endCall();
    }
  }, [callerId, socketRef, endCall]);

  // Tự động gọi startCall khi là người khởi tạo và modal mở
  useEffect(() => {
    if (show && isInitiator && callStatus === "idle") {
      startCall();
    }
  }, [show, isInitiator, startCall, callStatus]);

  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;

    socket.on("incoming-call", ({ senderId, offer, callerSocketId }) => {
      console.log("Incoming call - senderId:", senderId);
      setIncomingCall(true);
      setCallerSocketId(callerSocketId);
      handleIncomingCall(offer, senderId); // Truyền senderId vào handleIncomingCall
    });

    socket.on("call-error", ({ message }) => {
      setErrorMessage(message || "Lỗi cuộc gọi");
      setCallStatus("error");
    });

    socket.on("call-ended", () => {
      console.log("📞 Cuộc gọi đã bị kết thúc bởi người kia");
      endCall(true); // gọi lại hàm để dọn dẹp và đóng modal
    });

    socket.on("signal", async ({ signal }) => {
      if (!signal || !signal.type) return;

      const pc = peerConnectionRef.current;
      if (!pc || pc.connectionState === "closed") {
        console.warn("⚠️ PeerConnection không hợp lệ hoặc đã đóng");
        return;
      }

      try {
        switch (signal.type) {
          case "offer":
            await pc.setRemoteDescription(new RTCSessionDescription(signal));
            break;
          case "answer":
            if (pc.signalingState !== "have-local-offer") break;
            await pc.setRemoteDescription(new RTCSessionDescription(signal));
            break;
          case "candidate":
            if (signal.candidate && (pc.signalingState === "stable" || pc.remoteDescription)) {
              await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
            } else {
              pendingCandidates.current.push(signal.candidate);
            }
            break;
          default:
            console.warn("⚠️ Loại signal không được hỗ trợ:", signal.type);
        }
      } catch (err) {
        console.error("❌ Lỗi xử lý signal:", err);
        socket.off("call-ended"); // Dọn dẹp listener
      }
    });

    const heartbeatInterval = setInterval(() => {
      socket.emit("heartbeat", senderId);
    }, 5000);

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [senderId, socketRef, handleIncomingCall, endCall]);

  return (
    <Modal show={show} onHide={endCall} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {callStatus === "ringing"
            ? `Cuộc gọi từ ${callerName}`
            : callStatus === "calling"
              ? `Đang gọi ${receiverName}...`
              : "Cuộc gọi video"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        <div className="video-container">
          <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />
          <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
        </div>
      </Modal.Body>
      <Modal.Footer>
        {callStatus === "ringing" ? (
          <Button variant="success" onClick={answerCall}>Trả lời</Button>
        ) : callStatus === "calling" ? (
          <Button variant="primary" disabled>
            <Spinner animation="border" size="sm" /> Đang gọi...
          </Button>
        ) : null}
        <Button variant="danger" onClick={() => endCall(false)}>Kết thúc</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CallScreen;