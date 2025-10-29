import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalShops: 0,
    totalCategories: 0,
    totalTransactions: 0,
    pendingSupportTickets: 0,
  });

  useEffect(() => {
    setStats({
      totalUsers: 1250,
      totalShops: 45,
      totalCategories: 12,
      totalTransactions: 5670,
      pendingSupportTickets: 8,
    });
  }, []);

  const statCards = [
    {
      title: 'Tổng người dùng',
      value: stats.totalUsers,
      icon: '👥',
      color: 'bg-blue-500',
    },
    {
      title: 'Tổng shop',
      value: stats.totalShops,
      icon: '🏪',
      color: 'bg-green-500',
    },
    {
      title: 'Danh mục',
      value: stats.totalCategories,
      icon: '📁',
      color: 'bg-purple-500',
    },
    {
      title: 'Giao dịch',
      value: stats.totalTransactions,
      icon: '💰',
      color: 'bg-yellow-500',
    },
    {
      title: 'Hỗ trợ chờ xử lý',
      value: stats.pendingSupportTickets,
      icon: '🎧',
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold">A</div>
            <span className="text-lg font-semibold text-gray-900">Admin Dashboard</span>
          </div>
          <div className="text-sm text-gray-600">
            Xin chào{user?.username ? `, ${user.username}` : ''}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.color} text-white text-xl`}>
                {stat.icon}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Hoạt động gần đây</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div>
                    <p className="text-sm text-gray-900">Shop mới đăng ký: "TechStore"</p>
                    <p className="text-xs text-gray-500">2 phút trước</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div>
                    <p className="text-sm text-gray-900">Giao dịch mới: 500,000 VNĐ</p>
                    <p className="text-xs text-gray-500">5 phút trước</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div>
                    <p className="text-sm text-gray-900">Ticket hỗ trợ mới</p>
                    <p className="text-xs text-gray-500">10 phút trước</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Thống kê nhanh</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tỷ lệ chuyển đổi</span>
                  <span className="text-sm font-medium text-green-600">+12.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Doanh thu hôm nay</span>
                  <span className="text-sm font-medium text-blue-600">2,450,000 VNĐ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Đơn hàng mới</span>
                  <span className="text-sm font-medium text-purple-600">23</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-sm text-gray-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} MMO Admin. All rights reserved.</span>
          <a href="#" className="hover:text-gray-700">Điều khoản & Quyền riêng tư</a>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;
