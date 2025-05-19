import React, { useEffect, useState } from "react";

const VideoCallModal = ({ show, onHide, socketRef, jitsiUrl }) => {
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
            {!jitsiUrl ? (
              <div className="text-white text-center mt-5">Đang chờ kết nối cuộc gọi...</div>
            ) : (
              <iframe
                src={jitsiUrl}
                title="Video Call"
                allow="camera; microphone; fullscreen; display-capture; screen-wake-lock"
                style={{ width: "100%", height: "100%", border: "none" }}
                sandbox="allow-scripts allow-same-origin allow-forms allow-top-navigation allow-popups"
              ></iframe>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;
