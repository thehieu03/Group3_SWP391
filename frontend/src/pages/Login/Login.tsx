import React, { useState } from "react";
import "./Login.css";

const API_BASE_URL = "https://localhost:5134";

export default function LoginRegisterPage() {
    const [registerData, setRegisterData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    });

    const isValidPassword = (password) => {
        // 🔹 Code này của bạn đã ĐÚNG (khớp với backend)
        const regex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
        return regex.test(password);
    };

    const handleRegister = async () => {
        if (registerData.password !== registerData.confirmPassword) {
            alert(" Mật khẩu nhập lại không khớp!");
            return;
        }

        if (!isValidPassword(registerData.password)) {
            alert(" Mật khẩu phải chứa ít nhất 8 ký tự, gồm cả chữ và số!");
            return;
        }

        // 🔹 Dùng API_BASE_URL (đã sửa)
        const response = await fetch(`${API_BASE_URL}/api/Account/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(registerData),
        });

        const result = await response.json();
        if (result.success) {
            alert(" " + result.message);
        } else {
            alert(" " + result.message);
        }
    };

    const handleLogin = async () => {
        // 🔹 Dùng API_BASE_URL (đã sửa)
        const response = await fetch(`${API_BASE_URL}/api/Account/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginData),
        });

        const result = await response.json();
        if (result.success) {
            alert(" " + result.message);

            // 🔹 Code này của bạn đã ĐÚNG (lấy token từ data)
            localStorage.setItem("token", result.data.token);
        } else {
            alert(" " + result.message);
        }
    };

    return (
        <div className="login-register-container">
            <div className="form-wrapper">
                {/* ====================================================
                PHẦN FORM GIỮ NGUYÊN - BẠN KHÔNG CẦN THAY ĐỔI GÌ Ở DƯỚI
                ====================================================
                */}

                {/* ---------------- Đăng nhập ---------------- */}
                <div className="form-box form-login">
                    <h2 className="form-title">Đăng nhập</h2>

                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Nhập email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    />

                    <label>Mật khẩu</label>
                    <input
                        type="password"
                        placeholder="Nhập mật khẩu"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    />

                    <div className="forgot-password">Quên mật khẩu</div>

                    <div className="remember">
                        <input type="checkbox" defaultChecked />
                        <span>Ghi nhớ đăng nhập</span>
                    </div>

                    <button className="btn-green" onClick={handleLogin}>
                        Đăng nhập
                    </button>

                    <div className="or-text">Or</div>

                    <button className="btn-google">
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google"
                        />
                        Login with Google
                    </button>
                </div>

                {/* ---------------- Đăng ký ---------------- */}
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
                            <input
                                type="text"
                                placeholder="Nhập tài khoản"
                                value={registerData.username}
                                onChange={(e) =>
                                    setRegisterData({ ...registerData, username: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="Nhập email"
                                value={registerData.email}
                                onChange={(e) =>
                                    setRegisterData({ ...registerData, email: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <label>Mật khẩu</label>
                            <input
                                type="password"
                                placeholder="Nhập mật khẩu"
                                value={registerData.password}
                                onChange={(e) =>
                                    setRegisterData({ ...registerData, password: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <label>Nhập lại mật khẩu</label>
                            <input
                                type="password"
                                placeholder="Nhập lại mật khẩu"
                                value={registerData.confirmPassword}
                                onChange={(e) =>
                                    setRegisterData({
                                        ...registerData,
                                        confirmPassword: e.target.value,
                                    })
                                }
                            />
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

                    <button className="btn-green" onClick={handleRegister}>
                        Đăng ký
                    </button>
                </div>
            </div>
        </div>
    );
}