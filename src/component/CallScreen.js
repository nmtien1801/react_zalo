import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { io } from 'socket.io-client';

const VideoCallModal = ({ 
  show, 
  onHide, 
  senderId, 
  receiverId,
  callerName = "Caller",
  receiverName = "Receiver"
}) => {
  const socket = useRef(null);
  const pc = useRef(null);
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const [callStatus, setCallStatus] = useState('idle');
  const [callDuration, setCallDuration] = useState(0);
  const candidateBuffer = useRef([]);
  const timerRef = useRef(null);

  // Xử lý candidate buffer
  const processCandidateBuffer = async () => {
    while (candidateBuffer.current.length > 0 && pc.current?.remoteDescription) {
      const candidate = candidateBuffer.current.shift();
      try {
        await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Failed to process buffered candidate:', err);
      }
    }
  };

  // Khởi tạo kết nối
  useEffect(() => {
    if (!show) return;

    const initializeCall = async () => {
      try {
        socket.current = io('http://localhost:8080');
        socket.current.emit('register', senderId);

        pc.current = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            // Có thể thêm TURN server nếu cần
          ]
        });

        // Xử lý ICE Candidate
        pc.current.onicecandidate = (e) => {
          if (e.candidate) {
            socket.current.emit('relay-signal', {
              targetUserId: receiverId,
              signal: { type: 'candidate', candidate: e.candidate }
            });
          }
        };

        // Nhận stream từ xa
        pc.current.ontrack = (e) => {
          if (!remoteVideo.current.srcObject) {
            remoteVideo.current.srcObject = e.streams[0];
            setCallStatus('connected');
          }
        };

        // Xử lý sự kiện từ server
        socket.current.on('incoming-call', handleIncomingCall);
        socket.current.on('signal', handleSignal);
        socket.current.on('call-ended', handleCallEnded);
        socket.current.on('call-error', handleCallError);

        // Heartbeat
        const heartbeatInterval = setInterval(() => {
          socket.current?.emit('heartbeat', senderId);
        }, 15000);

        return () => clearInterval(heartbeatInterval);
      } catch (err) {
        console.error('Initialization error:', err);
        setCallStatus('failed');
      }
    };

    initializeCall();

    return () => {
      endCall();
      socket.current?.disconnect();
    };
  }, [show, senderId, receiverId]);

  const startCall = async () => {
    try {
      setCallStatus('calling');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (localVideo.current) {
        localVideo.current.srcObject = stream;
      }

      stream.getTracks().forEach(track => {
        pc.current.addTrack(track, stream);
      });

      const offer = await pc.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await pc.current.setLocalDescription(offer);
      
      socket.current.emit('call-user', {
        senderId,
        receiverId,
        offer
      });

      // Bắt đầu đếm thời gian
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Call setup error:', err);
      setCallStatus('failed');
      endCall();
    }
  };

  const handleIncomingCall = async ({ senderId, offer }) => {
    try {
      setCallStatus('receiving');
      
      if (!pc.current) {
        throw new Error('PeerConnection not initialized');
      }

      await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      
      socket.current.emit('relay-signal', {
        targetUserId: senderId,
        signal: { type: 'answer', answer }
      });

      // Xử lý candidate đã buffer
      processCandidateBuffer();
    } catch (err) {
      console.error('Error handling incoming call:', err);
      setCallStatus('failed');
      endCall();
    }
  };

  const handleSignal = async ({ type, answer, candidate }) => {
    try {
      if (!pc.current) return;

      switch (type) {
        case 'answer':
          await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
          break;
          
        case 'candidate':
          if (pc.current.remoteDescription) {
            await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
          } else {
            console.log('Buffering candidate...');
            candidateBuffer.current.push(candidate);
          }
          break;
          
        default:
          console.warn('Unknown signal type:', type);
      }
    } catch (err) {
      console.error('Signal processing error:', err);
    }
  };

  const handleCallEnded = () => {
    setCallStatus('ended');
    endCall();
  };

  const handleCallError = ({ message }) => {
    console.error('Call error:', message);
    setCallStatus('failed');
    alert(`Call failed: ${message}`);
    endCall();
  };

  const endCall = () => {
    // Dừng timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Đóng kết nối peer
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }
    
    // Dừng stream local
    if (localVideo.current?.srcObject) {
      localVideo.current.srcObject.getTracks().forEach(track => track.stop());
      localVideo.current.srcObject = null;
    }
    
    // Reset remote video
    if (remoteVideo.current) {
      remoteVideo.current.srcObject = null;
    }
    
    // Xóa buffer candidate
    candidateBuffer.current = [];
    
    // Gửi thông báo kết thúc cuộc gọi
    if (socket.current) {
      socket.current.emit('end-call', { targetUserId: receiverId });
    }
    
    // Reset state
    setCallDuration(0);
    onHide();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Modal show={show} onHide={endCall} centered size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {callStatus === 'calling' ? `Calling ${receiverName}...` : 
           callStatus === 'receiving' ? `Incoming call from ${callerName}` :
           callStatus === 'connected' ? `In call with ${receiverName}` : 
           `Call ${callStatus}`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex justify-content-between">
          <div className="text-center">
            <p>{callerName} ({senderId})</p>
            <video
              ref={localVideo}
              autoPlay
              muted
              playsInline
              style={{ width: '300px', border: '1px solid #ccc' }}
            />
          </div>
          <div className="text-center">
            <p>{receiverName} ({receiverId})</p>
            <video
              ref={remoteVideo}
              autoPlay
              playsInline
              style={{ width: '300px', border: '1px solid #ccc' }}
            />
          </div>
        </div>
        
        {callStatus === 'connected' && (
          <div className="text-center mt-3">
            <p>Duration: {formatTime(callDuration)}</p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {callStatus === 'receiving' ? (
          <>
            <Button variant="success" onClick={() => {}}>
              Accept
            </Button>
            <Button variant="danger" onClick={endCall}>
              Decline
            </Button>
          </>
        ) : (
          <>
            <Button variant="danger" onClick={endCall}>
              End Call
            </Button>
            {callStatus === 'idle' && (
              <Button variant="primary" onClick={startCall}>
                Start Call
              </Button>
            )}
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default VideoCallModal;