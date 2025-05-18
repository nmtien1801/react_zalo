import React, { useEffect, useState } from "react";

const VideoCallModal = ({ show, onHide, socketRef }) => {
  const [jitsiUrl, setJitsiUrl] = useState(null);

  useEffect(() => {
    if (socketRef?.current) {
      socketRef.current.on("RES_CALL", (from, to) => {
        const members = to.members || [];
        const membersString = members.join("-");
        setJitsiUrl(`https://meet.jit.si/${membersString}`);
        console.log("from ", from, "to ", to);
      });
    }
  }, [socketRef]);

  return (
    <div
      className={`modal fade ${show ? "show d-block" : "d-none"}`}
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content bg-dark">
          <div className="modal-header border-0">
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onHide}
            ></button>
          </div>
          <div className="modal-body p-0" style={{ height: "75vh" }}>
            {jitsiUrl && (
              <iframe
                src={jitsiUrl}
                title="Video Call"
                allow="camera; microphone; fullscreen; display-capture"
                style={{ width: "100%", height: "100%", border: "none" }}
                sandbox="allow-scripts allow-same-origin allow-forms" // Cho phép các quyền iframe cụ thể
              ></iframe>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;
