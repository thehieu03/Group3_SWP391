import { useState, useEffect } from 'react';
import ProductApprovalServices from '../../services/ProductApprovalServices';
import type { ProductApprovalItem, ProductApprovalRequest } from '../../services/ProductApprovalServices';
import { categoryServices } from '../../services/CategoryServices';

const ProductApproval = () => {
    const [products, setProducts] = useState<ProductApprovalItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    
    const [totalCount, setTotalCount] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(0);
    
    const [searchProductName, setSearchProductName] = useState<string>('');
    const [searchShopName, setSearchShopName] = useState<string>('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [categories, setCategories] = useState<any[]>([]);
    const [sortBy, setSortBy] = useState<string>('CreatedAt');
    const [sortDirection, setSortDirection] = useState<string>('desc');
    
    const [selectedProduct, setSelectedProduct] = useState<ProductApprovalItem | null>(null);
    const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

    useEffect(() => {
        fetchCategories();
        fetchPendingProducts();
    }, [pageNumber, pageSize, sortBy, sortDirection]);

    const fetchCategories = async () => {
        try {
            const data = await categoryServices.getAllCategoryAsync();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchPendingProducts = async () => {
        setLoading(true);
        setError('');
        
        try {
            const params: ProductApprovalRequest = {
                pageNumber,
                pageSize,
                sortBy,
                sortDirection,
                searchProductName: searchProductName || undefined,
                searchShopName: searchShopName || undefined,
                categoryId: selectedCategoryId ? parseInt(selectedCategoryId) : undefined,
            };

            const response = await ProductApprovalServices.getPendingProducts(params);
            setProducts(response.products);
            setTotalCount(response.totalCount);
            setTotalPages(response.totalPages);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Không thể tải danh sách sản phẩm');
            console.error('Error fetching pending products:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPageNumber(1);
        fetchPendingProducts();
    };

    const handleApprove = async (productId: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn duyệt sản phẩm này?')) {
            return;
        }

        try {
            await ProductApprovalServices.approveProduct(productId);
            alert('Duyệt sản phẩm thành công!');
            fetchPendingProducts();
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Không thể duyệt sản phẩm');
        }
    };

    const handleViewDetail = (product: ProductApprovalItem) => {
        setSelectedProduct(product);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setSelectedProduct(null);
        setShowDetailModal(false);
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDirection('asc');
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const styles = {
        container: {
            padding: '24px',
            maxWidth: '1400px',
            margin: '0 auto',
            backgroundColor: '#f9fafb'
        },
        header: {
            marginBottom: '24px'
        },
        title: {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '8px'
        },
        subtitle: {
            fontSize: '14px',
            color: '#6b7280'
        },
        filterBox: {
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '24px'
        },
        inputGroup: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr auto',
            gap: '16px'
        },
        label: {
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '8px'
        },
        input: {
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            outline: 'none'
        } as React.CSSProperties,
        button: {
            padding: '10px 24px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
        } as React.CSSProperties,
        errorBox: {
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '24px'
        },
        tableContainer: {
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse' as const
        },
        th: {
            backgroundColor: '#f9fafb',
            padding: '12px 16px',
            textAlign: 'left' as const,
            fontSize: '12px',
            fontWeight: '500',
            color: '#6b7280',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
            borderBottom: '1px solid #e5e7eb'
        },
        td: {
            padding: '16px',
            borderBottom: '1px solid #e5e7eb',
            fontSize: '14px'
        },
        actionButton: {
            padding: '6px 12px',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            marginRight: '8px'
        } as React.CSSProperties,
        approveBtn: {
            backgroundColor: '#10b981',
            color: 'white'
        },
        rejectBtn: {
            backgroundColor: '#ef4444',
            color: 'white'
        },
        pagination: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            borderTop: '1px solid #e5e7eb'
        },
        pageButton: {
            padding: '8px 16px',
            border: '1px solid #d1d5db',
            backgroundColor: 'white',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
        } as React.CSSProperties
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Cấp quyền sản phẩm</h1>
                <p style={styles.subtitle}>Tổng cộng {totalCount} sản phẩm chờ duyệt</p>
            </div>

            <div style={styles.filterBox}>
                <div style={{...styles.inputGroup, gridTemplateColumns: '1fr 1fr 1fr auto'}}>
                    <div>
                        <label style={styles.label}>Tìm kiếm</label>
                        <input
                            type="text"
                            placeholder="Tìm theo tên sản phẩm..."
                            value={searchProductName}
                            onChange={(e) => setSearchProductName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            style={styles.input}
                        />
                    </div>
                    <div>
                        <label style={styles.label}>Lọc theo shop</label>
                        <input
                            type="text"
                            placeholder="Tìm theo tên shop..."
                            value={searchShopName}
                            onChange={(e) => setSearchShopName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            style={styles.input}
                        />
                    </div>
                    <div>
                        <label style={styles.label}>Lọc theo danh mục</label>
                        <select
                            value={selectedCategoryId}
                            onChange={(e) => setSelectedCategoryId(e.target.value)}
                            style={styles.input}
                        >
                            <option value="">Tất cả danh mục</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{...styles.label, visibility: 'hidden'}}>-</label>
                        <button onClick={handleSearch} style={styles.button}>
                            Tìm kiếm
                        </button>
                    </div>
                </div>
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Hình ảnh</th>
                            <th style={{...styles.th, cursor: 'pointer', userSelect: 'none'}} onClick={() => handleSort('Name')}>
                                Tên sản phẩm {
                                    sortBy === 'Name' 
                                        ? (sortDirection === 'asc' ? ' ↑' : ' ↓')
                                        : ' ⇅'
                                }
                            </th>
                            <th style={styles.th}>Shop</th>
                            <th style={styles.th}>Danh mục</th>
                            <th style={styles.th}>Mô tả</th>
                            <th style={{...styles.th, cursor: 'pointer', userSelect: 'none'}} onClick={() => handleSort('CreatedAt')}>
                                Ngày tạo {
                                    sortBy === 'CreatedAt'
                                        ? (sortDirection === 'asc' ? ' ↑' : ' ↓')
                                        : ' ⇅'
                                }
                            </th>
                            <th style={styles.th}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} style={{...styles.td, textAlign: 'center', padding: '48px', color: '#6b7280'}}>
                                    Đang tải...
                                </td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{...styles.td, textAlign: 'center', padding: '48px', color: '#6b7280'}}>
                                    Không có sản phẩm chờ duyệt
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} style={{backgroundColor: 'white'}}>
                                    <td style={styles.td}>
                                        {product.image ? (
                                            <img 
                                                src={`data:image/jpeg;base64,${product.image}`}
                                                alt={product.productName}
                                                style={{height: '48px', width: '48px', borderRadius: '4px', objectFit: 'cover'}}
                                            />
                                        ) : (
                                            <div style={{
                                                height: '48px',
                                                width: '48px',
                                                borderRadius: '4px',
                                                backgroundColor: '#e5e7eb',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '12px',
                                                color: '#6b7280'
                                            }}>
                                                No Image
                                            </div>
                                        )}
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{fontWeight: '500', color: '#111827'}}>{product.productName}</div>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{color: '#111827'}}>{product.shopName}</div>
                                        {product.shopOwnerName && (
                                            <div style={{fontSize: '12px', color: '#6b7280'}}>{product.shopOwnerName}</div>
                                        )}
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{color: '#111827'}}>{product.categoryName || 'N/A'}</div>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{color: '#6b7280', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                                            {product.description || 'Không có mô tả'}
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{color: '#111827'}}>{formatDate(product.createdAt)}</div>
                                    </td>
                                    <td style={styles.td}>
                                        <button
                                            onClick={() => handleViewDetail(product)}
                                            style={{...styles.actionButton, backgroundColor: '#3b82f6', color: 'white', marginRight: '8px'}}
                                        >
                                            Xem chi tiết
                                        </button>
                                        <button
                                            onClick={() => handleApprove(product.id)}
                                            style={{...styles.actionButton, ...styles.approveBtn}}
                                        >
                                            Duyệt
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {!loading && products.length > 0 && (
                    <div style={styles.pagination}>
                        <div style={{fontSize: '14px', color: '#6b7280'}}>
                            Hiển thị {(pageNumber - 1) * pageSize + 1} đến {Math.min(pageNumber * pageSize, totalCount)} trong số {totalCount} kết quả
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <button
                                onClick={() => setPageNumber(pageNumber - 1)}
                                disabled={pageNumber === 1}
                                style={{...styles.pageButton, opacity: pageNumber === 1 ? 0.5 : 1, cursor: pageNumber === 1 ? 'not-allowed' : 'pointer'}}
                            >
                                Trước
                            </button>
                            <span style={{fontSize: '14px', color: '#6b7280', padding: '0 8px'}}>
                                Trang {pageNumber} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPageNumber(pageNumber + 1)}
                                disabled={pageNumber >= totalPages}
                                style={{...styles.pageButton, opacity: pageNumber >= totalPages ? 0.5 : 1, cursor: pageNumber >= totalPages ? 'not-allowed' : 'pointer'}}
                            >
                                Sau
                            </button>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setPageNumber(1);
                                }}
                                style={{...styles.pageButton, marginLeft: '8px'}}
                            >
                                <option value={5}>5 / trang</option>
                                <option value={10}>10 / trang</option>
                                <option value={20}>20 / trang</option>
                                <option value={50}>50 / trang</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Chi tiết sản phẩm */}
            {showDetailModal && selectedProduct && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        maxWidth: '800px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        padding: '32px',
                        position: 'relative',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}>
                        {/* Header */}
                        <div style={{marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px'}}>
                            <h2 style={{fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0}}>
                                Chi tiết sản phẩm
                            </h2>
                        </div>

                        {/* Hình ảnh */}
                        <div style={{marginBottom: '24px', textAlign: 'center'}}>
                            {selectedProduct.image ? (
                                <img 
                                    src={`data:image/jpeg;base64,${selectedProduct.image}`}
                                    alt={selectedProduct.productName}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '400px',
                                        borderRadius: '8px',
                                        objectFit: 'contain',
                                        border: '1px solid #e5e7eb'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '100%',
                                    height: '300px',
                                    backgroundColor: '#f3f4f6',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#9ca3af',
                                    fontSize: '18px'
                                }}>
                                    Không có hình ảnh
                                </div>
                            )}
                        </div>

                        {/* Thông tin sản phẩm */}
                        <div style={{marginBottom: '24px'}}>
                            <div style={{marginBottom: '16px'}}>
                                <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '4px'}}>
                                    Tên sản phẩm
                                </label>
                                <div style={{fontSize: '18px', fontWeight: '500', color: '#111827'}}>
                                    {selectedProduct.productName}
                                </div>
                            </div>

                            <div style={{marginBottom: '16px'}}>
                                <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '4px'}}>
                                    Shop
                                </label>
                                <div style={{fontSize: '16px', color: '#111827'}}>
                                    {selectedProduct.shopName}
                                    {selectedProduct.shopOwnerName && (
                                        <span style={{fontSize: '14px', color: '#6b7280', marginLeft: '8px'}}>
                                            (Chủ shop: {selectedProduct.shopOwnerName})
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div style={{marginBottom: '16px'}}>
                                <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '4px'}}>
                                    Danh mục
                                </label>
                                <div style={{fontSize: '16px', color: '#111827'}}>
                                    {selectedProduct.categoryName || 'Không có danh mục'}
                                </div>
                            </div>

                            <div style={{marginBottom: '16px'}}>
                                <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '4px'}}>
                                    Mô tả
                                </label>
                                <div style={{fontSize: '16px', color: '#111827'}}>
                                    {selectedProduct.description || 'Không có mô tả'}
                                </div>
                            </div>

                            <div style={{marginBottom: '16px'}}>
                                <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '4px'}}>
                                    Chi tiết sản phẩm
                                </label>
                                <div style={{
                                    fontSize: '16px',
                                    color: '#111827',
                                    backgroundColor: '#f9fafb',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {selectedProduct.details || 'Không có chi tiết'}
                                </div>
                            </div>

                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                <div>
                                    <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '4px'}}>
                                        Ngày tạo
                                    </label>
                                    <div style={{fontSize: '16px', color: '#111827'}}>
                                        {formatDate(selectedProduct.createdAt)}
                                    </div>
                                </div>
                                <div>
                                    <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '4px'}}>
                                        Phí (%  )
                                    </label>
                                    <div style={{fontSize: '16px', color: '#111827'}}>
                                        {selectedProduct.fee ? `${(selectedProduct.fee * 100).toFixed(1)}%` : 'Không có'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb'}}>
                            <button
                                onClick={() => {
                                    closeDetailModal();
                                    handleApprove(selectedProduct.id);
                                }}
                                style={{
                                    flex: 1,
                                    padding: '12px 24px',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                Duyệt sản phẩm
                            </button>
                            <button
                                onClick={closeDetailModal}
                                style={{
                                    flex: 1,
                                    padding: '12px 24px',
                                    backgroundColor: '#6b7280',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                Quay lại
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductApproval;

