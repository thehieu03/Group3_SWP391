import React from 'react';

const Deposit = () => {
  return (
    <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>Redeem gift-code</h2>

      {/* Nhập mã gift */}
      <div style={{ margin: '20px 0' }}>
        <input
          type="text"
          placeholder="Nhập vào mã gift *"
          style={{
            padding: '10px',
            width: '60%',
            marginRight: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
        <button
          style={{
            padding: '10px 20px',
            backgroundColor: 'green',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Redeem
        </button>
      </div>

      {/* Thông tin & QR */}
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {/* Bên trái: Thông tin chuyển khoản */}
        <div style={{ flex: 1 }}>
          <p><strong>STK:</strong> <span style={{ fontWeight: 'bold' }}>36806937</span></p>
          <p><strong>Người nhận:</strong> Đào Quang Huy</p>
          <p>
            <strong>Nội dung chuyển khoản:</strong>{' '}
            <span style={{ color: 'green', fontWeight: 'bold' }}>KOVQR9784578</span>{' '}
            <button
              style={{
                marginLeft: '10px',
                padding: '4px 10px',
                backgroundColor: '#d9534f',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Copy
            </button>
          </p>
          <p style={{ color: 'red', fontWeight: 'bold' }}>
            Quét mã QR Code để nội dung chuyển khoản chính xác
          </p>
        </div>

        {/* Bên phải: Tạo QR */}
        <div style={{ flex: 1 }}>
          <h4 style={{ color: 'green' }}>🟩 Tạo QR Code thanh toán</h4>
          <div style={{ marginBottom: '10px' }}>
            <label>
              Số tiền:{' '}
              <input
                type="text"
                placeholder="50,000"
                style={{
                  padding: '5px',
                  width: '100px',
                  marginLeft: '10px',
                  marginRight: '5px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              VND
            </label>
          </div>
          <button
            style={{
              padding: '8px 15px',
              backgroundColor: 'green',
              color: 'white',
              marginRight: '10px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Tạo QR
          </button>
          <button
            style={{
              padding: '8px 15px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Reset
          </button>

          <p style={{ fontSize: '12px', marginTop: '10px' }}>
            <strong>Lưu ý:</strong><br />
            • Tối thiểu: 50,000 VND<br />
            • Chỉ nhập số nguyên (không có phần thập phân)
          </p>
        </div>
      </div>

      {/* Ghi chú */}
      <div style={{ marginTop: '30px', fontSize: '14px' }}>
        <p style={{ color: 'red' }}>
          <strong>Lưu ý:</strong><br />
          • Vui lòng điền chính xác nội dung chuyển khoản để thực hiện nạp tiền tự động.<br />
          • Không chấp nhận giao dịch nạp tiền từ tài khoản công ty. Chỉ các giao dịch từ tài khoản cá nhân, đúng với thông tin đã đăng ký với ngân hàng, mới được xử lý.<br />
          • Nạp tiền bằng ví điện tử USDT hoặc Paypal, vui lòng liên hệ hỗ trợ viên: <span style={{ color: 'green' }}>Tại đây</span>.<br />
          • Vietcombank trong khoảng 23-3h không thể kiểm tra lịch sử giao dịch.<br />
          • Nếu quá lâu không thấy tiền vào, vui lòng liên hệ hỗ trợ viên: <span style={{ color: 'green' }}>Tại đây</span>.
        </p>
      </div>
    </div>
  );
};

export default Deposit;