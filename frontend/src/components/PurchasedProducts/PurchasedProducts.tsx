import React, { useEffect, useState } from 'react';
import Image from '../Image';
import routesConfig from '../../config/routesConfig';
import { orderServices } from '../../services/OrderServices';
import type { OrderResponse } from '../../models/modelResponse/OrderResponse';
import { useAuth } from '../../hooks/useAuth';

const PurchasedProducts: React.FC = () => {
    const { isLoggedIn, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        // Chỉ fetch orders khi user đã login
        if (!isLoggedIn) {
            setLoading(false);
            return;
        }

        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError(null);
                // Gọi API thực tế
                const userOrders = await orderServices.getMyOrdersAsync();
                setOrders(userOrders);
            } catch {
                setError('Không thể tải danh sách đơn hàng');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [isLoggedIn]);

    const handleProductClick = (productId: number) => {
        window.location.href = routesConfig.getProductUrl(productId);
    };

    // Nếu đang loading auth hoặc user chưa login thì không hiển thị component
    if (authLoading || !isLoggedIn) {
        return null;
    }

    if (loading) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Lối tắt</h2>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải đơn hàng...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Lối tắt</h2>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Lối tắt</h2>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="text-gray-400 text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            Chưa có đơn hàng nào
                        </h3>
                        <p className="text-gray-500">
                            Bạn chưa mua sản phẩm nào. Hãy khám phá các sản phẩm trên trang!
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Lối tắt
            </h2>
            
            {/* Products Scrollable List */}
            <div className="relative">
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="flex-shrink-0 w-80 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200"
                            onClick={() => handleProductClick(order.productId)}
                        >
                            {/* Green Banner */}
                            <div className="bg-green-600 text-white text-center py-1 px-2 rounded-t-lg">
                                <span className="text-sm font-medium">Sản phẩm đã mua</span>
                            </div>

                            {/* Product Image */}
                            <div className="aspect-square p-4">
                                <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Image
                                        src={order.productImage}
                                        alt={order.productName}
                                        className="w-16 h-16 object-contain"
                                    />
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-4">
                                {/* Rating */}
                                <div className="flex items-center mb-2">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                            </svg>
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-600 ml-2">
                                        {order.rating ? `${order.rating} Reviews` : 'Chưa đánh giá'}
                                    </span>
                                </div>

                                {/* Order Info */}
                                <div className="text-sm text-gray-600 mb-3">
                                    Số lượng: {order.quantity} | Tổng: {order.totalAmount.toLocaleString()} ₫
                                </div>

                                {/* Product Name */}
                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
                                    {order.productName}
                                </h3>

                                {/* Category */}
                                <div className="text-xs text-gray-500 mb-1">
                                    <span className="font-medium">Sản phẩm:</span> {order.categoryName}
                                </div>

                                {/* Seller */}
                                <div className="text-xs text-gray-500 mb-2">
                                    <span className="font-medium">Người bán:</span> {order.sellerName}
                                </div>

                                {/* Price */}
                                <div className="text-sm font-bold text-green-600">
                                    {order.price.toLocaleString()} ₫
                                </div>

                                {/* Order Date */}
                                <div className="text-xs text-gray-400 mt-2">
                                    Mua ngày: {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Arrows */}
                <button className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <button className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default PurchasedProducts;
