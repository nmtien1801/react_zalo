import React from "react";

export default function WelcomePage() {
  return (
    <div className="row g-0 h-100" style={{ paddingTop: 50, paddingBottom: 50}}>
        <div className="d-flex flex-column align-items-center justify-content-center h-100 w-100">
            <h2 className="mb-3" style={{ color: "#2257d6", fontWeight: 700 }}>
                Chào mừng đến với <span style={{ color: "#1976d2" }}>Zata PC!</span>
            </h2>
            <p className="mb-4 text-center" style={{ maxWidth: 500 }}>
                Khám phá những tiện ích hỗ trợ làm việc và trò chuyện cùng người thân, bạn bè được tối ưu hoá cho máy tính của bạn.
            </p>
            <img
                src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjrXxCC_v89l88b4JpwRxfbZqj8F_QaN60xcnvDkZG7NQw9Z-Nl3TYeEr6pmfs2rGq1vDu39R8O_dIjGqGAHzBc6Cbf3vFSxjoc5TsTztWn7j36ZS0M8IQPqX1MoZSaNkfbCFw_CnUraUQ0SNuu5-krRaWoYYpvZ_WNfKkLhXnovQRReGxC_vwX-co-ZMh5/s1600/z6635830841612_be71a62b25da89ca19a7fedf8f3e52c3.jpg"
                alt="Welcome Zalo"
                style={{ width: 320, maxWidth: "90%", marginBottom: 32 }}
            />
            <h5 className="mb-2" style={{ color: "#1976d2" }}>
                Nhắn tin nhiều hơn, soạn thảo ít hơn
            </h5>
            <p className="text-center" style={{ maxWidth: 400 }}>
                Sử dụng <b>Tin Nhắn Nhanh</b> để lưu sẵn các tin nhắn thường dùng và gửi nhanh trong hội thoại bất kỳ.
            </p>
        </div>
    </div>
  );
}