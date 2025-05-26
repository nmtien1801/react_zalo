import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Download, RefreshCw } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

import customizeAxios from "../../component/customizeAxios";

import { Login } from "../../redux/authSlice";

import { generateQRLoginService } from "../../service/authService";

export default function LoginWithQR() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // State cho QR Code
  const [qrData, setQrData] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState("generating"); // generating, pending, expired, success
  const [errorMessage, setErrorMessage] = useState("");
  
  // Biến để theo dõi polling
  const pollingIntervalRef = useRef(null);
  const expiryTimerRef = useRef(null);
  const qrRef = useRef(null);
  
  // Tải QR Code xuống
  const downloadQRCode = () => {
    if (status !== "pending" || !qrData) return;
    
    try {
      // Tạo URL để tạo QR code từ qrserver.com
      const encodedData = encodeURIComponent(qrData);
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodedData}&size=300x300&format=png&margin=10&color=000000&bgcolor=ffffff`;
      
      // Tải hình ảnh
      fetch(qrUrl)
        .then(response => response.blob())
        .then(blob => {
          // Tạo URL cho blob
          const blobUrl = window.URL.createObjectURL(blob);
          
          // Tạo thẻ a để tải xuống
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `zata-qr-login-${new Date().getTime()}.png`;
          
          // Kích hoạt việc tải xuống
          document.body.appendChild(link);
          link.click();
          
          // Dọn dẹp
          document.body.removeChild(link);
          setTimeout(() => {
            window.URL.revokeObjectURL(blobUrl);
          }, 100);
        });
    } catch (error) {
      console.error("Error downloading QR code:", error);
      alert("Không thể tải mã QR. Vui lòng thử lại.");
    }
  };

  // Tạo mã QR mới
  const generateNewQR = async () => {
    try {
      setStatus("generating");
      setErrorMessage("");
      
      // Xóa các interval hiện tại nếu có
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
      
      // Gọi API để tạo QR code mới
      const response = await generateQRLoginService();
      
      if (response && response.EC === 0) {
        setQrData(response.DT.qrToken);
        setSessionId(response.DT.sessionId);
        setStatus("pending");
        
        // Thiết lập thời gian hết hạn (2 phút)
        expiryTimerRef.current = setTimeout(() => {
          setStatus("expired");
        }, 120000); // 2 phút
        
        // Bắt đầu polling để kiểm tra trạng thái
        startPolling(response.DT.sessionId);
      } else {
        setErrorMessage("Không thể tạo mã QR. Vui lòng thử lại.");
        setStatus("error");
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
      setErrorMessage("Lỗi kết nối. Vui lòng thử lại sau.");
      setStatus("error");
    }
  };
  
  // Hàm để bắt đầu polling kiểm tra trạng thái
  const startPolling = (sid) => {
    // Kiểm tra trạng thái mỗi 2 giây
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await customizeAxios.get(`/api/check-qr-status/${sid}`);

        console.log("Polling response:", response);

        if (response.EC === 0) {
          console.log("QR status:", response.DT.status);
          // Nếu status là confirmed và có dữ liệu đăng nhập
          if (response.DT.status === "confirmed") {
              // Xử lý đăng nhập thành công
              handleSuccessfulLogin(response.DT);
              clearInterval(pollingIntervalRef.current);
              if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
          }

        } else if (response.EC === 1) {
          // QR code không hợp lệ hoặc đã hết hạn
          setStatus("expired");
          clearInterval(pollingIntervalRef.current);
        }
      } catch (error) {
        console.error("Error checking QR status:", error);
      }
    }, 2000);
  };
  
  // Xử lý đăng nhập thành công
  const handleSuccessfulLogin = (userData) => {

    setStatus("success");
      // Lưu thông tin đăng nhập
    localStorage.setItem("access_Token", userData.access_Token);
    localStorage.setItem("refresh_Token", userData.refresh_Token);
    
    // Đưa thông tin vào Redux store
    dispatch(Login.fulfilled({
      EC: 0,
      EM: "QR login successful",
      DT: userData
    }));
    
    // Điều hướng sau 1 giây
    setTimeout(() => {
      navigate("/chat");
    }, 1000);
  };
  
  // Tạo QR khi component mount
  useEffect(() => {
    generateNewQR();
    
    // Cleanup khi component unmount
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    };
  }, []);

  return (
    <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center py-4">
      <div
        className="card shadow-lg"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <div className="card-body p-4">
          {/* Logo and Title */}
          <div className="text-center mb-4">
            <div className="d-flex align-items-center justify-content-center">
              <Link to="/login" className="btn btn-link position-absolute start-0 ms-3">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="display-6 text-primary fw-bold mb-0">Zata</h1>
            </div>
            <h2 className="fs-5 fw-medium text-dark mt-3">Đăng nhập bằng mã QR</h2>
            <p className="text-muted small">
              Quét mã QR này bằng ứng dụng Zata trên điện thoại để đăng nhập
            </p>
          </div>

          {/* QR Code Display */}
          <div className="text-center mb-4">
            <div 
              className="qr-container mx-auto border p-3 rounded-3" 
              style={{ 
                width: "220px", 
                height: "220px", 
                position: "relative",
                backgroundColor: "#fff"
              }}
            >
              {status === "generating" && (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tạo mã QR...</span>
                  </div>
                </div>
              )}
              
              {status === "pending" && qrData && (
                <QRCodeSVG 
                  value={qrData}
                  size={200}
                  level={"H"}
                  includeMargin={true}
                  imageSettings={{
                    src: "https://i.imgur.com/cIRFqAL.png",
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              )}
              
              {status === "expired" && (
                <div className="d-flex flex-column justify-content-center align-items-center h-100">
                  <p className="text-danger mb-2">Mã QR đã hết hạn</p>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={generateNewQR}
                  >
                    <RefreshCw size={16} className="me-1" />
                    Tạo mã mới
                  </button>
                </div>
              )}
              
              {status === "success" && (
                <div className="d-flex flex-column justify-content-center align-items-center h-100">
                  <div className="text-success mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                    </svg>
                  </div>
                  <p className="text-success">Đăng nhập thành công!</p>
                </div>
              )}
              
              {status === "error" && (
                <div className="d-flex flex-column justify-content-center align-items-center h-100">
                  <p className="text-danger mb-2">{errorMessage}</p>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={generateNewQR}
                  >
                    <RefreshCw size={16} className="me-1" />
                    Thử lại
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Instructions */}
          {status === "pending" && (
            <div className="text-center mb-3">
              <p className="mb-1 small">Để đăng nhập:</p>
              <ol className="text-start small ps-4">
                <li>Mở ứng dụng Zata trên điện thoại</li>
                <li>Nhấn vào nút Quét mã QR</li>
                <li>Di chuyển camera đến mã QR này</li>
              </ol>
            </div>
          )}

          {/* Refresh Button */}
          {status === "pending" && (
            <div className="text-center mb-3 d-flex justify-content-center gap-2">
              <button 
                className="btn btn-outline-primary"
                onClick={generateNewQR}
              >
                <RefreshCw size={18} className="me-2" />
                Làm mới mã QR
              </button>

              <button 
                className="btn btn-outline-success" 
                onClick={downloadQRCode}
                title="Tải mã QR"
              >
                <Download size={18} className="me-1" />
                Tải QR
              </button>
            </div>
          )}

          {/* Login with password link */}
          <div className="text-center mt-4">
            <Link 
              to="/login"
              className="text-decoration-none"
              style={{ color: "#2962ff" }}
            >
              Đăng nhập bằng mật khẩu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}