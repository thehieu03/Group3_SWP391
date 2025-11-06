import React, { useState } from "react";

const Deposit = () => {
  const [amount, setAmount] = useState("");
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  // Cấu hình tài khoản
  const BANK_CODE = "MB";
  const ACCOUNT_NO = "0868430273";
  const ACCOUNT_NAME = "GORNER ROBIN";
  const FIXED_ADD_INFO = "THANHTOANMMO";

  // Tạo QR link
  const handleGenerate = () => {
    const cleanAmount = Number(amount.replace(/[^0-9]/g, ""));
    if (!cleanAmount || cleanAmount < 50000) {
      alert("Vui lòng nhập số tiền hợp lệ (tối thiểu 50.000 VNĐ)");
      return;
    }

    const qrLink = `https://img.vietqr.io/image/${BANK_CODE}-${ACCOUNT_NO}-print.png?amount=${cleanAmount}&addInfo=${encodeURIComponent(
      FIXED_ADD_INFO
    )}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

    setQrUrl(qrLink);
    setShowPopup(true);
  };

  const handleReset = () => {
    setAmount("");
    setQrUrl(null);
    setShowPopup(false);
  };

  return (
    <div
      style={{
        maxWidth: 420,
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
        padding: 24,
        border: "1px solid #ddd",
        borderRadius: 10,
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        backgroundColor: "white",
      }}
    >
      <h3 style={{ textAlign: "center", color: "#1ba857", marginBottom: 20 }}>
        💵 Tạo mã QR thanh toán
      </h3>

      <div>
        <label style={{ display: "block", fontWeight: 600 }}>Số tiền:</label>
        <div style={{ marginTop: 4 }}>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Nhập số tiền, VD: 50000"
            style={{
              width: "72%",
              border: "1px solid #ccc",
              borderRadius: 6,
              padding: "8px 10px",
              marginRight: 6,
              fontSize: 15,
            }}
          />
          <span style={{ fontWeight: 600 }}>VNĐ</span>
        </div>
      </div>

      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <button
          onClick={handleGenerate}
          style={{
            flex: 1,
            backgroundColor: "#1ba857",
            color: "white",
            padding: "10px 16px",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Tạo QR
        </button>
        <button
          onClick={handleReset}
          style={{
            flex: 1,
            backgroundColor: "#ccc",
            padding: "10px 16px",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>

      <p
        style={{
          fontSize: 13,
          color: "#555",
          marginTop: 14,
          lineHeight: 1.6,
          textAlign: "center",
        }}
      >
        • Tối thiểu: 50.000 VNĐ <br />
        • Chỉ nhập số nguyên (không có phần thập phân)
      </p>

      {showPopup && qrUrl && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            animation: "fadeIn 0.3s ease-in-out",
          }}
          onClick={() => setShowPopup(false)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              textAlign: "center",
              padding: 32,
              boxShadow: "0 10px 35px rgba(0,0,0,0.3)",
              maxWidth: 640,
              width: "90%",
              animation: "zoomIn 0.25s ease-in-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                color: "#333",
                marginBottom: 20,
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              Mã QR thanh toán
            </h3>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <img
                src={qrUrl}
                alt="QR VietQR"
                style={{
                  width: 320,
                  height: 640,
                  borderRadius: 10,
                  objectFit: "contain",
                  border: "1px solid #eee",
                }}
              />
            </div>

            <p style={{ color: "#444", fontSize: 15, lineHeight: 1.5 }}>
              Quét mã bằng ứng dụng ngân hàng để thanh toán
            </p>

            <button
              onClick={() => setShowPopup(false)}
              style={{
                marginTop: 18,
                backgroundColor: "#1ba857",
                color: "white",
                border: "none",
                borderRadius: 6,
                padding: "10px 20px",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
                boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deposit;
