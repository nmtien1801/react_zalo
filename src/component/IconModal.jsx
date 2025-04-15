// IconModal.jsx
export default function IconModal({ onSelect }) {
  const emojis = ["🥳", "😊", "😎", "❤️", "🙌"];

  const handleClick = (emoji) => {
    if (onSelect) onSelect(emoji);
  };

  return (
    <div
      className="modal fade"
      id="iconModal"
      tabIndex="-1"
      aria-labelledby="iconModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="iconModalLabel">Chọn icon</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body d-flex gap-2 flex-wrap">
            {emojis.map((emoji, index) => (
              <span
                key={index}
                role="button"
                style={{ fontSize: "24px", cursor: "pointer" }}
                onClick={() => handleClick(emoji)}
                data-bs-dismiss="modal" // tự đóng modal khi chọn
              >
                {emoji}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
