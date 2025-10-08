import React from "react";
import "./Login.css";

export default function LoginRegisterPage() {
    return (
        <div className="login-register-container">
            <div className="form-wrapper">

                {/* Đăng nhập */}
                <div className="form-box form-login">
                    <h2 className="form-title">Đăng nhập</h2>

                    <label>Email</label>
                    <input type="email" placeholder="Nhập email" />

                    <label>Mật khẩu</label>
                    <input type="password" placeholder="Nhập mật khẩu" />

                    <div className="forgot-password">Quên mật khẩu</div>

                    <div className="remember">
                        <input type="checkbox" defaultChecked />
                        <span>Ghi nhớ đăng nhập</span>
                    </div>

                    <button className="btn-green">Đăng nhập</button>

                    <div className="or-text">Or</div>

                    <button className="btn-google">
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google"
                        />
                        Login with Google
                    </button>
                </div>

                {/* Đăng ký */}
                <div className="form-box form-register">
                    <h2 className="form-title">Đăng ký</h2>
                    <p className="notice">
            <span className="text-green">
              Chú ý: Nếu bạn sử dụng các chương trình
            </span>{" "}
                        <span className="text-red">Bypass Captcha</span>{" "}
                        <span className="text-green">
              có thể không đăng ký tài khoản được.
            </span>
                    </p>

                    <div className="grid-2">
                        <div>
                            <label>Tài khoản</label>
                            <input type="text" placeholder="Nhập tài khoản" />
                        </div>
                        <div>
                            <label>Email</label>
                            <input type="email" placeholder="Nhập email" />
                        </div>
                        <div>
                            <label>Mật khẩu</label>
                            <input type="password" placeholder="Nhập mật khẩu" />
                        </div>
                        <div>
                            <label>Nhập lại mật khẩu</label>
                            <input type="password" placeholder="Nhập lại mật khẩu" />
                        </div>
                    </div>

                    <div className="agree">
                        <input type="checkbox" defaultChecked />
                        <span>
              Tôi đã đọc và đồng ý với{" "}
                            <span className="text-green-bold">
                Điều khoản sử dụng Tạp Hóa MMO
              </span>
            </span>
                    </div>

                    <button className="btn-green">Đăng ký</button>
                </div>
            </div>
        </div>
    );
}
