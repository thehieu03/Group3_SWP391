import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "/api/accounts";

export default function ChangePassword() {
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // ✅ Kiểm tra nhập lại mật khẩu
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu mới và nhập lại không khớp!" });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự." });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage({
          type: "error",
          text: "Vui lòng đăng nhập lại để thực hiện đổi mật khẩu.",
        });
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/change-password`,
        {
          oldPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token.replace(/"/g, "")}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage({
        type: "success",
        text: response.data.message || "Đổi mật khẩu thành công!",
      });

      // ✅ Xóa token và chuyển về trang đăng nhập sau 1s
      setTimeout(() => {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      }, 1000);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        "Đổi mật khẩu thất bại. Vui lòng thử lại.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-50 min-h-screen py-10">
      <div className="w-full max-w-3xl bg-white border rounded-2xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gray-100 border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-700">Đổi mật khẩu</h2>
          <p className="text-sm text-gray-500 mt-1">
            Hãy nhập mật khẩu cũ và tạo mật khẩu mới an toàn hơn.
          </p>
        </div>

        {/* Form */}
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
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>

            {/* Mật khẩu mới */}
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
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
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
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Nút đổi mật khẩu */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full md:w-auto px-6 py-2 text-white font-semibold rounded-lg shadow transition-colors ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
              </button>
            </div>
          </form>

          {/* Thông báo kết quả */}
          {message && (
            <div
              className={`mt-6 text-center font-medium ${
                message.type === "error" ? "text-red-500" : "text-green-600"
              }`}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
