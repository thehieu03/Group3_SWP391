import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import routesConfig from '../../../config/routesConfig';

interface SellerLayoutProps {
  children: React.ReactNode;
}

const SellerLayout = ({ children }: SellerLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    logout();
    navigate(routesConfig.home);
  };

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: '📊',
      path: '/seller/dashboard'
    },
    { 
      id: 'products', 
      label: 'Quản lý sản phẩm', 
      icon: '📦',
      path: '/seller/products'
    },
    { 
      id: 'orders', 
      label: 'Quản lý đơn hàng', 
      icon: '🛒',
      path: '/seller/orders'
    },
    { 
      id: 'shop', 
      label: 'Thông tin shop', 
      icon: '🏪',
      path: '/seller/shop-info'
    },
    { 
      id: 'statistics', 
      label: 'Thống kê', 
      icon: '📈',
      path: '/seller/statistics'
    },
  ];

  const handleMenuClick = (item: typeof menuItems[0]) => {
    setActiveTab(item.id);
    navigate(item.path);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '64px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h1 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#111827',
                margin: 0
              }}>
                Seller Dashboard
              </h1>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <span style={{
                fontSize: '14px',
                color: '#6b7280'
              }}>
                Xin chào, <span style={{ fontWeight: '500', color: '#111827' }}>{user?.username}</span>
              </span>
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <aside style={{
          width: '256px',
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          minHeight: 'calc(100vh - 64px)'
        }}>
          <nav style={{ marginTop: '20px', padding: '0 8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: activeTab === item.id ? '#d1fae5' : 'transparent',
                    color: activeTab === item.id ? '#065f46' : '#6b7280',
                    borderRight: activeTab === item.id ? '3px solid #10b981' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== item.id) {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.color = '#111827';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== item.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#6b7280';
                    }
                  }}
                >
                  <span style={{ marginRight: '12px' }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '24px' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;

