import { useState, useEffect } from 'react';
import type { SystemsConfigResponse } from '../../models/modelResponse/SystemsConfigResponse';
import { systemConfigServices } from '../../services/SystemConfigServices';

const SystemSettings = () => {
  const [config, setConfig] = useState<SystemsConfigResponse>({
    email: '',
    fee: 0,
    googleAppPassword: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Load system config khi component mount
  useEffect(() => {
    loadSystemConfig();
  }, []);

  const loadSystemConfig = async () => {
    try {
      setLoading(true);
      const data = await systemConfigServices.getSystemConfigAsync();
      setConfig(data);
    } catch (error: any) {
      console.error('Failed to load system config:', error);
      setMessage({
        type: 'error',
        text: 'Không thể tải cấu hình hệ thống. Vui lòng thử lại.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'fee') {
      const feeValue = parseFloat(value);
      // Không cho phép giá trị âm
      if (!isNaN(feeValue) && feeValue >= 0) {
        setConfig(prev => ({ ...prev, [name]: feeValue }));
      } else if (value === '') {
        setConfig(prev => ({ ...prev, [name]: 0 }));
      }
    } else {
      setConfig(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Validate Email
      const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      if (!config.email || !emailRegex.test(config.email) || !config.email.includes('@')) {
        setMessage({
          type: 'error',
          text: 'Email không hợp lệ. Email phải có @ và đúng định dạng (vd: admin@example.com)'
        });
        setSaving(false);
        return;
      }

      // Validate Fee
      if (config.fee === undefined || config.fee === null || config.fee < 0) {
        setMessage({
          type: 'error',
          text: 'Phí giao dịch phải là số không âm.'
        });
        setSaving(false);
        return;
      }

      if (!config.googleAppPassword) {
        setMessage({
          type: 'error',
          text: 'Google App Password không được để trống.'
        });
        setSaving(false);
        return;
      }

      // Call API
      await systemConfigServices.updateSystemConfigAsync({
        email: config.email,
        fee: config.fee,
        googleAppPassword: config.googleAppPassword,
      });

      setMessage({
        type: 'success',
        text: 'Cập nhật cài đặt hệ thống thành công!'
      });

      // Reload config để đảm bảo data mới nhất
      await loadSystemConfig();
    } catch (error: any) {
      console.error('Failed to update system config:', error);
      
      if (error.response?.status === 400) {
        setMessage({
          type: 'error',
          text: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.'
        });
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        setMessage({
          type: 'error',
          text: 'Bạn không có quyền thực hiện thao tác này.'
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Có lỗi xảy ra khi cập nhật cài đặt. Vui lòng thử lại.'
        });
      }
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cài đặt hệ thống</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Thông tin cấu hình</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email hệ thống <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={config.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nhập email hệ thống (vd: admin@taphoammo.com)"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Email này sẽ được sử dụng để gửi thông báo và liên lạc với người dùng
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phí giao dịch (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="fee"
              value={config.fee}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nhập phí giao dịch (không âm, vd: 5.5)"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Phí giao dịch (số thực không âm, vd: 5.0, 10.5, 15.25)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google App Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="googleAppPassword"
              value={config.googleAppPassword}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nhập Google App Password"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Mật khẩu ứng dụng Google để gửi email tự động
            </p>
          </div>
        </div>

        {message && (
          <div className={`mt-4 p-4 rounded-md ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              saving
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Cài đặt bổ sung</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Bảo trì hệ thống</h3>
              <p className="text-sm text-gray-500">Tạm dừng hệ thống để bảo trì</p>
            </div>
            <button 
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
              onClick={() => alert('Tính năng đang được phát triển')}
            >
              Bật chế độ bảo trì
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Backup dữ liệu</h3>
              <p className="text-sm text-gray-500">Tạo bản sao lưu dữ liệu hệ thống</p>
            </div>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
              onClick={() => alert('Tính năng đang được phát triển')}
            >
              Tạo backup
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Xóa cache</h3>
              <p className="text-sm text-gray-500">Xóa bộ nhớ đệm hệ thống</p>
            </div>
            <button 
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
              onClick={() => alert('Tính năng đang được phát triển')}
            >
              Xóa cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
