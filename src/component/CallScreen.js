import React, { useEffect, useRef, useState, useCallback } from "react";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";
import { io } from "socket.io-client";
import "./CallControls.css";

const CallScreen = ({
  show,
  onHide,
  senderId,
  receiverId,
  callerName,
  receiverName,
  socketRef,
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
    setCallerId(senderId);
  }, []);

  const setupPeerConnection = useCallback(
    (pc, targetUserId) => {
      pc.onicecandidate = (event) => {
        if (event.candidate) {
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

  const endCall = useCallback(() => {
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

    setIncomingCall(false);
    setCallerSocketId(null);
    setCallStatus("idle");
    onHide();
  }, [onHide]);

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
    async (offer) => {
      if (peerConnectionRef.current) {
        console.warn("⚠️ Đã có PeerConnection hiện tại, từ chối cuộc gọi đến");
        return;
      }
      try {
        setCallStatus("ringing");
        setIncomingCall(true);

        const pc = new RTCPeerConnection();
        peerConnectionRef.current = pc;
        setupPeerConnection(pc, callerId);

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
    [callerId, setupPeerConnection, endCall]
  );

  const answerCall = useCallback(async () => {
    try {
      const pc = peerConnectionRef.current;
      if (!pc || pc.signalingState !== "have-remote-offer") {
        throw new Error("PeerConnection không ở trạng thái phù hợp");
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

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

  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;

    socket.on("user-list", (users) => {
      setOnlineUsers(users);
    });

    socket.on("incoming-call", ({ senderId, offer, callerSocketId }) => {
      setIncomingCall(true);
      setCallerSocketId(callerSocketId);
      setCallerId(senderId);
      handleIncomingCall(offer);
    });

    socket.on("call-error", ({ message }) => {
      setErrorMessage(message || "Lỗi cuộc gọi");
      setCallStatus("error");
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
            console.log("Nhận offer, đặt remoteDescription...");
            await pc.setRemoteDescription(new RTCSessionDescription(signal));
            console.log("Đã đặt xong remoteDescription!");
    
            // 🟢 Xử lý ICE candidates bị chờ
            while (pendingCandidates.current.length) {
              const candidate = pendingCandidates.current.shift();
              try {
                console.log("Thêm ICE candidate bị chờ:", candidate);
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
              } catch (err) {
                console.error("❌ Lỗi khi thêm ICE candidate bị chờ:", err);
              }
            }
            break;
    
          case "answer":
            if (pc.signalingState === "stable") {
              console.warn("⚠️ Đã nhận answer khi trạng thái stable, bỏ qua...");
              break;
            }
            if (pc.signalingState !== "have-local-offer") {
              console.error("❌ Trạng thái không phù hợp để nhận answer:", pc.signalingState);
              break;
            }
            console.log("Nhận answer, đặt remoteDescription...");
            await pc.setRemoteDescription(new RTCSessionDescription(signal));
            console.log("Đã đặt xong remoteDescription!");
            break;
    
          case "candidate":
            if (signal.candidate) {
              if (pc.signalingState === "stable" || pc.remoteDescription) {
                console.log("Thêm ICE candidate ngay:", signal.candidate);
                await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
              } else {
                console.warn("⚠️ Chưa có remoteDescription, lưu ICE candidate lại.", {
                  signalingState: pc.signalingState,
                  candidate: signal.candidate,
                });
                pendingCandidates.current.push(signal.candidate);
              }
            }
            break;
    
          default:
            console.warn("⚠️ Loại signal không được hỗ trợ:", signal.type);
        }
      } catch (err) {
        console.error("❌ Lỗi xử lý signal:", err);
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
          <Button variant="primary" disabled><Spinner animation="border" size="sm" /> Đang gọi...</Button>
        ) : (
          <Button variant="primary" onClick={startCall}>Gọi</Button>
        )}
        <Button variant="danger" onClick={endCall}>Kết thúc</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CallScreen;
