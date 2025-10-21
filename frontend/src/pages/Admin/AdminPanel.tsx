import { useState } from 'react';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import ShopManagement from './ShopManagement';
import CategoryManagement from './CategoryManagement';
import SystemSettings from './SystemSettings';
import SupportTickets from './SupportTickets';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <UserManagement />;
      case 'shops':
        return <ShopManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'transactions':
        return <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Lịch sử giao dịch</h2>
          <p className="text-gray-600">Tính năng đang được phát triển...</p>
        </div>;
      case 'support':
        return <SupportTickets />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Xin chào, <span className="font-medium">Admin</span>
              </span>
              <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'users', label: 'Quản lý người dùng', icon: '👥' },
                { id: 'shops', label: 'Quản lý shop', icon: '🏪' },
                { id: 'categories', label: 'Quản lý danh mục', icon: '📁' },
                { id: 'transactions', label: 'Lịch sử giao dịch', icon: '💰' },
                { id: 'support', label: 'Hỗ trợ khách hàng', icon: '🎧' },
                { id: 'settings', label: 'Cài đặt hệ thống', icon: '⚙️' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-green-100 text-green-700 border-r-2 border-green-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
