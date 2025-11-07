import { useState, useEffect } from "react";
import type { SystemsConfigResponse } from "@models/modelResponse/SystemsConfigResponse";
import Button from "@components/Button/Button.tsx";

const SystemSettings = () => {
  const [config, setConfig] = useState<SystemsConfigResponse>({
    email: "",
    fee: 0,
    googleAppPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setConfig({
        email: "admin@taphoammo.com",
        fee: 5.0,
        googleAppPassword: "********",
      });
      setLoading(false);
    }, 1000);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: name === "fee" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage({
        type: "success",
        text: "Cập nhật cài đặt hệ thống thành công!",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Có lỗi xảy ra khi cập nhật cài đặt. Vui lòng thử lại.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Cài đặt hệ thống
      </h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Thông tin cấu hình
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email hệ thống
            </label>
            <input
              type="email"
              name="email"
              value={config.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nhập email hệ thống"
            />
            <p className="text-sm text-gray-500 mt-1">
              Email này sẽ được sử dụng để gửi thông báo và liên lạc với người
              dùng
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phí giao dịch (%)
            </label>
            <input
              type="number"
              name="fee"
              value={config.fee}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nhập phí giao dịch"
            />
            <p className="text-sm text-gray-500 mt-1">
              Phần trăm phí được tính trên mỗi giao dịch (0-100%)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google App Password
            </label>
            <input
              type="password"
              name="googleAppPassword"
              value={config.googleAppPassword}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nhập Google App Password"
            />
            <p className="text-sm text-gray-500 mt-1">
              Mật khẩu ứng dụng Google để gửi email tự động
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`mt-4 p-4 rounded-md ${
              message.type === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              saving
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {saving ? "Đang lưu..." : "Lưu cài đặt"}
          </Button>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Cài đặt bổ sung
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Bảo trì hệ thống
              </h3>
              <p className="text-sm text-gray-500">
                Tạm dừng hệ thống để bảo trì
              </p>
            </div>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm">
              Bật chế độ bảo trì
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Backup dữ liệu
              </h3>
              <p className="text-sm text-gray-500">
                Tạo bản sao lưu dữ liệu hệ thống
              </p>
            </div>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
              Tạo backup
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Xóa cache</h3>
              <p className="text-sm text-gray-500">Xóa bộ nhớ đệm hệ thống</p>
            </div>
            <Button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm">
              Xóa cache
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
