import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sellerProductServices } from '../../services/SellerProductServices';
import { useAuth } from '../../hooks/useAuth';

const SellerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(true);
    const [stats, setStats] = useState({
        totalProducts: 0,
        approvedProducts: 0,
        pendingProducts: 0,
        totalOrders: 0
    });

    // Get shopId from user - you may need to adjust this based on your user model
    const shopId = 1; // Replace with actual shopId from user context

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        setLoading(true);
        try {
            // Fetch all products
            const allProducts = await sellerProductServices.getSellerProducts(shopId);
            
            // Calculate stats
            const approved = allProducts.filter(p => p.isApproved).length;
            const pending = allProducts.filter(p => !p.isApproved).length;

            setStats({
                totalProducts: allProducts.length,
                approvedProducts: approved,
                pendingProducts: pending,
                totalOrders: 0 // You can fetch order stats if available
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ 
        title, 
        value, 
        icon, 
        color, 
        bgColor,
        onClick 
    }: { 
        title: string; 
        value: number; 
        icon: string; 
        color: string; 
        bgColor: string;
        onClick?: () => void;
    }) => (
        <div
            style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onClick={onClick}
            onMouseEnter={(e) => {
                if (onClick) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                }
            }}
            onMouseLeave={(e) => {
                if (onClick) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        margin: '0 0 8px 0',
                        fontWeight: '500'
                    }}>
                        {title}
                    </p>
                    <p style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        color: '#111827',
                        margin: 0
                    }}>
                        {loading ? '...' : value}
                    </p>
                </div>
                <div style={{
                    width: '56px',
                    height: '56px',
                    backgroundColor: bgColor,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px'
                }}>
                    {icon}
                </div>
            </div>
        </div>
    );

    const QuickActionButton = ({ 
        label, 
        icon, 
        onClick, 
        color 
    }: { 
        label: string; 
        icon: string; 
        onClick: () => void; 
        color: string;
    }) => (
        <button
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 24px',
                backgroundColor: 'white',
                border: `2px solid ${color}`,
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                color: color,
                cursor: 'pointer',
                transition: 'all 0.2s',
                width: '100%'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = color;
                e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = color;
            }}
        >
            <span style={{ fontSize: '24px' }}>{icon}</span>
            <span>{label}</span>
        </button>
    );

    return (
        <div style={{
            padding: '24px',
            maxWidth: '1400px',
            margin: '0 auto'
        }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#111827',
                    margin: '0 0 8px 0'
                }}>
                    Chào mừng trở lại, {user?.username}! 👋
                </h1>
                <p style={{
                    fontSize: '16px',
                    color: '#6b7280',
                    margin: 0
                }}>
                    Đây là tổng quan về shop của bạn
                </p>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
            }}>
                <StatCard
                    title="Tổng sản phẩm"
                    value={stats.totalProducts}
                    icon="📦"
                    color="#3b82f6"
                    bgColor="#dbeafe"
                    onClick={() => navigate('/seller/products')}
                />
                <StatCard
                    title="Sản phẩm đã duyệt"
                    value={stats.approvedProducts}
                    icon="✅"
                    color="#10b981"
                    bgColor="#d1fae5"
                    onClick={() => navigate('/seller/products')}
                />
                <StatCard
                    title="Sản phẩm chờ duyệt"
                    value={stats.pendingProducts}
                    icon="⏳"
                    color="#f59e0b"
                    bgColor="#fef3c7"
                    onClick={() => navigate('/seller/products')}
                />
                <StatCard
                    title="Tổng đơn hàng"
                    value={stats.totalOrders}
                    icon="🛒"
                    color="#8b5cf6"
                    bgColor="#ede9fe"
                    onClick={() => navigate('/seller/orders')}
                />
            </div>

            {/* Quick Actions */}
            <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                marginBottom: '32px'
            }}>
                <h2 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#111827',
                    margin: '0 0 20px 0'
                }}>
                    Thao tác nhanh
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '16px'
                }}>
                    <QuickActionButton
                        label="Thêm sản phẩm mới"
                        icon="➕"
                        onClick={() => navigate('/seller/products')}
                        color="#10b981"
                    />
                    <QuickActionButton
                        label="Xem đơn hàng"
                        icon="📋"
                        onClick={() => navigate('/seller/orders')}
                        color="#3b82f6"
                    />
                    <QuickActionButton
                        label="Quản lý shop"
                        icon="🏪"
                        onClick={() => navigate('/seller/shop-info')}
                        color="#f59e0b"
                    />
                </div>
            </div>

            {/* Recent Activity */}
            <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#111827',
                    margin: '0 0 20px 0'
                }}>
                    Hoạt động gần đây
                </h2>
                <div style={{
                    padding: '48px',
                    textAlign: 'center',
                    color: '#6b7280'
                }}>
                    <p style={{ fontSize: '48px', margin: '0 0 16px 0' }}>📊</p>
                    <p style={{ fontSize: '16px', margin: 0 }}>
                        Chưa có hoạt động gần đây
                    </p>
                </div>
            </div>

            {/* Tips Section */}
            <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                padding: '20px',
                borderRadius: '8px',
                marginTop: '24px'
            }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>💡</span>
                    <div>
                        <h3 style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: '#1e40af',
                            margin: '0 0 8px 0'
                        }}>
                            Mẹo cho người bán
                        </h3>
                        <p style={{
                            fontSize: '14px',
                            color: '#1e40af',
                            margin: 0,
                            lineHeight: '1.5'
                        }}>
                            • Đảm bảo hình ảnh sản phẩm rõ ràng và chất lượng cao<br />
                            • Viết mô tả sản phẩm chi tiết và chính xác<br />
                            • Cập nhật tình trạng kho hàng thường xuyên<br />
                            • Phản hồi đơn hàng nhanh chóng để tăng uy tín
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;

