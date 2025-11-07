import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "/api/accounts";

const ChangePassword = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const mockToken = JSON.stringify({ id: 1, username: "admin" });
        localStorage.setItem("token", mockToken);
    }, []);

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "Mật khẩu mới và nhập lại không khớp!" });
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const response = await fetch(`${API_BASE_URL}/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token ? `Bearer ${token}` : "",
                },
                body: JSON.stringify({
                    oldPassword,
                    newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Không thể đổi mật khẩu");
            }

            setMessage({
                type: "success",
                text: data.message || "Đổi mật khẩu thành công!",
            });

            // ✅ Xóa token để buộc đăng nhập lại
            localStorage.removeItem("token");

            // ✅ Chuyển sang trang đăng nhập sau khi đổi mật khẩu thành công
            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 1000);
        } catch (err: unknown) {
            const error = err as { message?: string };
            setMessage({ type: "error", text: error.message || "Đã xảy ra lỗi" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full flex justify-center bg-gray-50 py-10">
            <div className="w-full max-w-4xl bg-white shadow border rounded-lg">
                {/* Header */}
                <div className="border-b bg-gray-100 p-6 rounded-t-lg">
                    <h5 className="text-[20px] font-semibold text-gray-700">
                        Đổi mật khẩu
                    </h5>
                </div>

                {/* Body */}
                <div className="p-8">
                    <form className="space-y-6" onSubmit={handleChangePassword}>
                        {/* Mật khẩu cũ */}
                        <div className="flex flex-col">
                            <label
                                htmlFor="oldPassword"
                                className="text-gray-700 font-medium mb-2"
                            >
                                Mật khẩu cũ
                            </label>
                            <input
                                id="oldPassword"
                                type="password"
                                placeholder="Nhập mật khẩu cũ"
                                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                required
                            />
                        </div>

                        {/* Mật khẩu mới + Nhập lại */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col">
                                <label
                                    htmlFor="newPassword"
                                    className="text-gray-700 font-medium mb-2"
                                >
                                    Mật khẩu mới
                                </label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    placeholder="Nhập mật khẩu mới"
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex flex-col">
                                <label
                                    htmlFor="confirmPassword"
                                    className="text-gray-700 font-medium mb-2"
                                >
                                    Nhập lại mật khẩu mới
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Nhập lại mật khẩu mới"
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Nút cập nhật */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`${
                                    loading
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-green-500 hover:bg-green-600"
                                } text-white font-medium px-6 py-2 rounded-md transition-colors`}
                            >
                                {loading ? "Đang xử lý..." : "Cập nhật"}
                            </button>
                        </div>
                    </form>

                    {/* Thông báo */}
                    {message && (
                        <p
                            className={`mt-4 font-medium ${
                                message.type === "error" ? "text-red-500" : "text-green-600"
                            }`}
                        >
                            {message.text}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
