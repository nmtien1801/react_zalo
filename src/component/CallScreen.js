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
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [incomingCall, setIncomingCall] = useState(false);
  const [callerSocketId, setCallerSocketId] = useState(null);
  const [callStatus, setCallStatus] = useState("idle"); // 'idle'|'calling'|'ringing'|'connected'|'error'
  const [errorMessage, setErrorMessage] = useState("");
  const peerConnectionRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [callerId, setCallerId] = useState(null); // Thêm state mới

  // Kiểm tra hỗ trợ WebRTC
  useEffect(() => {
    if (!window.RTCPeerConnection || !navigator.mediaDevices?.getUserMedia) {
      setErrorMessage("Trình duyệt không hỗ trợ gọi video");
      setCallStatus("error");
    }
  }, []);

  // Thiết lập kết nối Peer và xử lý signal
  const setupPeerConnection = useCallback(
    (pc, targetUserId) => {
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Người gọi gửi ICE Candidate:", event.candidate);
          socketRef.current.emit("relay-signal", {
            targetUserId: targetUserId === receiverId ? receiverId : callerId, // Dùng callerId nếu là người nhận
            signal: {
              type: "candidate",
              candidate: event.candidate.candidate,
              sdpMid: event.candidate.sdpMid || "0",
              sdpMLineIndex: event.candidate.sdpMLineIndex || 0,
            },
          });
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
    [socketRef, receiverId, callerId] // Thêm callerId vào dependencies
  );

  // Dọn dẹp khi kết thúc call
  const endCall = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop());
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

  // Bắt đầu cuộc gọi
  const startCall = useCallback(async () => {
    try {
      setCallStatus("calling");

      // Tạo kết nối WebRTC
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      setupPeerConnection(pc, receiverId);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log("Stream của người gọi:", stream);

      // Hiển thị video local
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Thêm track vào PeerConnection
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Lắng nghe sự kiện `ontrack` từ người nhận
      pc.ontrack = (event) => {
        console.log("Nhận được stream từ người nhận:", event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Xử lý ICE Candidate
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Người gọi gửi ICE Candidate:", event.candidate);
          socketRef.current.emit("relay-signal", {
            targetUserId: receiverId,
            signal: {
              type: "candidate",
              candidate: event.candidate,
            },
          });
        }
      };

      // Tạo offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Gửi offer đến người nhận
      socketRef.current.emit("call-user", {
        senderId,
        receiverId,
        offer: {
          type: "offer",
          sdp: offer.sdp,
        },
      });
    } catch (err) {
      console.error("Lỗi khi bắt đầu cuộc gọi:", err);
      setErrorMessage("Không thể truy cập camera/microphone");
      setCallStatus("error");
      endCall();
    }
  }, [receiverId, senderId, setupPeerConnection, socketRef, endCall]);

  // Xử lý cuộc gọi đến
  const handleIncomingCall = useCallback(
    async (offer) => {
      try {
        setCallStatus("ringing");
        setIncomingCall(true);
  
        const pc = new RTCPeerConnection();
        peerConnectionRef.current = pc;
        setupPeerConnection(pc, callerId); // Dùng callerId thay vì callerSocketId
  
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
  
        pc.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };
  
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
      } catch (err) {
        console.error("Lỗi khi nhận cuộc gọi:", err);
        setErrorMessage("Không thể thiết lập kết nối");
        setCallStatus("error");
        endCall();
      }
    },
    [callerId, setupPeerConnection, endCall] // Thêm callerId vào dependencies
  );

  // Trả lời cuộc gọi
  const answerCall = useCallback(async () => {
    try {
      const pc = peerConnectionRef.current;
      if (!pc || pc.signalingState !== "have-remote-offer" || pc.iceConnectionState === "closed") {
        throw new Error("PeerConnection không ở trạng thái phù hợp");
      }
  
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
  
      socketRef.current.emit("relay-signal", {
        targetUserId: callerId, // Dùng callerId thay vì callerSocketId
        signal: {
          type: "answer",
          sdp: answer.sdp,
        },
      });
  
      setIncomingCall(false);
      setCallStatus("connected");
    } catch (err) {
      console.error("Lỗi khi trả lời cuộc gọi:", {
        error: err,
        pcState: peerConnectionRef.current?.signalingState,
        iceState: peerConnectionRef.current?.iceConnectionState
      });
      setErrorMessage("Không thể trả lời cuộc gọi");
      setCallStatus("error");
      endCall();
    }
  }, [callerId, socketRef, endCall]); // Thêm callerId vào dependencies
  // Thiết lập socket listeners
  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;

    socket.on("user-list", (users) => {
      setOnlineUsers(users);
    });

    socket.on("incoming-call", ({ senderId, offer, callerSocketId }) => {
      setIncomingCall(true);
      setCallerSocketId(callerSocketId);
      setCallerId(senderId); // Lưu senderId từ BE
      handleIncomingCall(offer);
    });

    socket.on("call-error", ({ message }) => {
      setErrorMessage(message || "Lỗi cuộc gọi");
      setCallStatus("error");
    });

    // Người gọi nhận Answer:
    socket.on("signal", async ({ signal }) => {
      // Thêm kiểm tra chặt chẽ hơn
      if (!signal || typeof signal !== "object" || !signal.type) {
        console.error("Signal không hợp lệ:", signal);
        return;
      }

      const pc = peerConnectionRef.current;
      if (!pc) {
        console.error("PeerConnection chưa được khởi tạo");
        return;
      }

      try {
        switch (signal.type) {
          case "offer":
            if (incomingCall) {
              await pc.setRemoteDescription(new RTCSessionDescription(signal));
            }
            break;

          case "answer":
            if (!incomingCall) {
              await pc.setRemoteDescription(new RTCSessionDescription(signal));
            }
            break;

            case "candidate":
              let candidateStr = signal.candidate;
              if (typeof candidateStr === "object" && candidateStr.candidate) {
                candidateStr = candidateStr.candidate; // Trích xuất chuỗi từ RTCIceCandidate
              }
              if (
                !candidateStr ||
                (typeof candidateStr === "string" &&
                  candidateStr.indexOf("candidate:") === -1 &&
                  candidateStr.indexOf("a=candidate:") === -1)
              ) {
                console.warn("Candidate không hợp lệ:", signal.candidate);
                return;
              }
            
              const iceCandidate = {
                candidate: candidateStr,
                sdpMid: signal.sdpMid || "0",
                sdpMLineIndex: signal.sdpMLineIndex || 0,
              };
            
              try {
                await pc.addIceCandidate(new RTCIceCandidate(iceCandidate));
                console.log("Thêm ICE Candidate thành công:", iceCandidate);
              } catch (err) {
                console.error("Lỗi khi thêm ICE Candidate:", err);
              }
              break;

          default:
            console.warn("Loại signal không được hỗ trợ:", signal.type);
        }
      } catch (err) {
        console.error("Lỗi xử lý signal:", {
          error: err,
          signalType: signal?.type,
          pcState: pc?.signalingState,
        });
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
        {errorMessage && (
          <Alert variant="danger" className="mb-3">
            {errorMessage}
          </Alert>
        )}

        <div className="video-container">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="local-video"
          />
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="remote-video"
          />
        </div>

        <div className="call-status text-center mt-3">
          {callStatus === "calling" && (
            <div>
              <Spinner animation="border" variant="primary" />
              <p>Đang kết nối...</p>
            </div>
          )}
          {callStatus === "connected" && (
            <p className="text-success">Đã kết nối</p>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer>
        {callStatus === "ringing" ? (
          <Button variant="success" onClick={answerCall}>
            Trả lời
          </Button>
        ) : callStatus === "calling" ? (
          <Button variant="primary" disabled>
            <Spinner animation="border" size="sm" /> Đang gọi...
          </Button>
        ) : (
          <Button variant="primary" onClick={startCall}>
            Gọi
          </Button>
        )}
        <Button variant="danger" onClick={endCall}>
          Kết thúc
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CallScreen;