// import React, { useState, useEffect, useRef } from "react";
// import io from "socket.io-client";
// import Peer from "simple-peer";

// const socket = io.connect("http://localhost:8080");

// function App() {
//   const [me, setMe] = useState("");   // Socket ID của người dùng hiện tại
//   const [stream, setStream] = useState(null);   // Luồng video của người dùng hiện tại
//   const [receivingCall, setReceivingCall] = useState(false);  // Trạng thái nhận cuộc gọi
//   const [caller, setCaller] = useState(""); // Socket ID của người gọi
//   const [callerSignal, setCallerSignal] = useState(); // Dữ liệu tín hiệu của người gọi
//   const [callAccepted, setCallAccepted] = useState(false);  // Trạng thái cuộc gọi đã được chấp nhận hay chưa
//   const [idToCall, setIdToCall] = useState(""); // ID của người gọi (socket ID)
//   const [name, setName] = useState(""); // Tên của người dùng

//   const myVideo = useRef();
//   const userVideo = useRef();
//   const connectionRef = useRef();

//   // Thêm đoạn này để kiểm tra kết nối socket
//   useEffect(() => {
//     socket.on("connect", () => {
//       console.log("Connected to socket server with ID:", socket.id);
//     });

//     socket.on("connect_error", (err) => {
//       console.error("Connection error:", err);
//     });
//   }, []);

//   useEffect(() => {
//     navigator.mediaDevices
//       .getUserMedia({ video: true, audio: true })
//       .then((stream) => {
//         setStream(stream);
//         if (myVideo.current) {
//           myVideo.current.srcObject = stream;
//         }
//       })
//       .catch((err) => console.error(err));

//     socket.on("me", (id) => {
//       setMe(id);
//     });

//     socket.on("callUser", (data) => {
//       setReceivingCall(true);
//       setCaller(data.from);
//       setName(data.name);
//       setCallerSignal(data.signal);
//     });

//     return () => {
//       if (stream) {
//         stream.getTracks().forEach((track) => track.stop());
//       }
//     };
//   }, []);

//   const callUser = (id) => {
//     const peer = new Peer({
//       initiator: true,
//       trickle: false,
//       stream: stream,
//     });

//     peer.on("signal", (data) => {
//       socket.emit("callUser", {
//         userToCall: id,
//         signalData: data,
//         from: me,
//         name: name,
//       });
//     });

//     peer.on("stream", (stream) => {
//       if (userVideo.current) {
//         userVideo.current.srcObject = stream;
//       }
//     });

//     socket.on("callAccepted", (signal) => {
//       setCallAccepted(true);
//       peer.signal(signal);
//     });

//     connectionRef.current = peer;
//   };

//   const answerCall = () => {
//     setCallAccepted(true);
//     const peer = new Peer({
//       initiator: false,
//       trickle: false,
//       stream: stream,
//     });

//     peer.on("signal", (data) => {
//       socket.emit("answerCall", { signal: data, to: caller });
//     });

//     peer.on("stream", (stream) => {
//       if (userVideo.current) {
//         userVideo.current.srcObject = stream;
//       }
//     });

//     peer.signal(callerSignal);
//     connectionRef.current = peer;
//   };

//   const leaveCall = () => {
//     if (connectionRef.current) {
//       connectionRef.current.destroy();
//       // console.log(">>>>>Call ended", connectionRef.current);
      
//     }
//     // window.location.reload();
//   };

//   return (
//     <div style={{ textAlign: "center", marginTop: "20px" }}>
//       <h1>Video Call App</h1>
//       <div
//         style={{ display: "flex", justifyContent: "center", margin: "20px" }}
//       >
//         <div style={{ margin: "10px" }}>
//           {stream && (
//             <video
//               playsInline
//               muted
//               ref={myVideo}
//               autoPlay
//               style={{ width: "300px" }}
//             />
//           )}
//         </div>
//         <div style={{ margin: "10px" }}>
//           {callAccepted && (
//             <video
//               playsInline
//               ref={userVideo}
//               autoPlay
//               style={{ width: "300px" }}
//             />
//           )}
//         </div>
//       </div>

//       <div style={{ margin: "20px" }}>
//         <input
//           type="text"
//           placeholder="Your Name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           style={{ padding: "5px", margin: "5px" }}
//         />
//         <p>Your ID: {me}</p>
//         <input
//           type="text"
//           placeholder="ID to call"
//           value={idToCall}
//           onChange={(e) => setIdToCall(e.target.value)}
//           style={{ padding: "5px", margin: "5px" }}
//         />
//         <div>
//           {callAccepted ? (
//             <button
//               onClick={leaveCall}
//               style={{
//                 padding: "10px",
//                 margin: "5px",
//                 background: "red",
//                 color: "white",
//               }}
//             >
//               End Call
//             </button>
//           ) : (
//             <button
//               onClick={() => callUser(idToCall)}
//               style={{
//                 padding: "10px",
//                 margin: "5px",
//                 background: "green",
//                 color: "white",
//               }}
//             >
//               Call
//             </button>
//           )}
//         </div>
//       </div>

//       {receivingCall && !callAccepted && (
//         <div>
//           <h2>{name} is calling...</h2>
//           <button
//             onClick={answerCall}
//             style={{
//               padding: "10px",
//               margin: "5px",
//               background: "blue",
//               color: "white",
//             }}
//           >
//             Answer
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;
