import { useState, useEffect } from 'react';
import { sellerProductServices, type SellerProduct, type SellerProductRequest } from '../../services/SellerProductServices';
import { categoryServices } from '../../services/CategoryServices';
import { useAuth } from '../../hooks/useAuth';

const SellerProductManagement = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState<SellerProduct[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    
    // Pagination state
    const [totalCount, setTotalCount] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(0);
    
    // Filter state
    const [searchProductName, setSearchProductName] = useState<string>('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [categories, setCategories] = useState<any[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('all'); // all, approved, pending
    
    // Sort state
    const [sortBy, setSortBy] = useState<string>('createdAt');
    const [sortDirection, setSortDirection] = useState<string>('desc');
    
    const [showModal, setShowModal] = useState<boolean>(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [selectedProduct, setSelectedProduct] = useState<SellerProduct | null>(null);
    
    // Form state
    const [formData, setFormData] = useState<SellerProductRequest>({
        shopId: 0,
        categoryId: 0,
        name: '',
        description: '',
        details: '',
        image: undefined
    });
    const [imagePreview, setImagePreview] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);

    // Get shopId from user - you may need to adjust this based on your user model
    const shopId = 1; // Replace with actual shopId from user context

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [pageNumber, pageSize, sortBy, sortDirection]);

    const fetchCategories = async () => {
        try {
            const data = await categoryServices.getAllCategoryAsync();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        setError('');
        
        try {
            const params: any = {
                pageNumber,
                pageSize,
                sortBy,
                sortDirection
            };
            
            if (searchProductName) {
                params.searchProductName = searchProductName;
            }
            
            if (selectedCategoryId) {
                params.categoryId = parseInt(selectedCategoryId);
            }
            
            if (filterStatus === 'approved') {
                params.isApproved = true;
            } else if (filterStatus === 'pending') {
                params.isApproved = false;
            }

            const response = await sellerProductServices.getSellerProducts(shopId, params);
            setProducts(response.products);
            setTotalCount(response.totalCount);
            setTotalPages(response.totalPages);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Không thể tải danh sách sản phẩm');
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPageNumber(1); // Reset to first page when searching
        fetchProducts();
    };

    const handleResetFilters = () => {
        setSearchProductName('');
        setSelectedCategoryId('');
        setFilterStatus('all');
        setPageNumber(1);
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDirection('asc');
        }
    };

    const handleCreateNew = () => {
        setModalMode('create');
        setFormData({
            shopId: shopId,
            categoryId: 0,
            name: '',
            description: '',
            details: '',
            image: undefined
        });
        setImagePreview('');
        setImageFile(null);
        setShowModal(true);
    };

    const handleEdit = (product: SellerProduct) => {
        setModalMode('edit');
        setSelectedProduct(product);
        setFormData({
            shopId: product.shopId,
            categoryId: product.categoryId,
            name: product.name,
            description: product.description,
            details: product.details,
            image: undefined
        });
        if (product.image) {
            setImagePreview(`data:image/jpeg;base64,${product.image}`);
        } else {
            setImagePreview('');
        }
        setImageFile(null);
        setShowModal(true);
    };

    const handleView = (product: SellerProduct) => {
        setModalMode('view');
        setSelectedProduct(product);
        setShowModal(true);
    };

    const handleDelete = async (productId: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            return;
        }

        try {
            await sellerProductServices.deleteProduct(productId);
            alert('Xóa sản phẩm thành công!');
            fetchProducts();
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Không thể xóa sản phẩm');
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const base64 = await sellerProductServices.fileToBase64(file);
            setImagePreview(base64);
            setFormData({ ...formData, image: base64 });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name || !formData.categoryId || !formData.description) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        try {
            if (modalMode === 'create') {
                await sellerProductServices.createProduct(formData);
                alert('Tạo sản phẩm thành công! Sản phẩm đang chờ duyệt.');
            } else if (modalMode === 'edit' && selectedProduct) {
                await sellerProductServices.updateProduct(selectedProduct.id, formData);
                alert('Cập nhật sản phẩm thành công!');
            }
            
            setShowModal(false);
            fetchProducts();
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
        setImagePreview('');
        setImageFile(null);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const getStatusBadge = (product: SellerProduct) => {
        if (product.isApproved) {
            return (
                <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: '#d1fae5',
                    color: '#065f46'
                }}>
                    Đã duyệt
                </span>
            );
        } else {
            return (
                <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: '#fef3c7',
                    color: '#92400e'
                }}>
                    Chờ duyệt
                </span>
            );
        }
    };

    const styles = {
        container: {
            padding: '24px',
            maxWidth: '1400px',
            margin: '0 auto',
            backgroundColor: '#f9fafb'
        },
        header: {
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        title: {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            margin: 0
        },
        createButton: {
            padding: '12px 24px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
        } as React.CSSProperties,
        filterBox: {
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '24px'
        },
        inputGroup: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr auto',
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
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Quản lý sản phẩm</h1>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '8px 0 0 0' }}>
                        Tổng cộng {products.length} sản phẩm
                    </p>
                </div>
                <button onClick={handleCreateNew} style={styles.createButton}>
                    + Thêm sản phẩm mới
                </button>
            </div>

            <div style={styles.filterBox}>
                <div style={styles.inputGroup}>
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
                        <label style={styles.label}>Trạng thái</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={styles.input}
                        >
                            <option value="all">Tất cả</option>
                            <option value="approved">Đã duyệt</option>
                            <option value="pending">Chờ duyệt</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ ...styles.label, visibility: 'hidden' }}>-</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                                onClick={handleResetFilters} 
                                style={{
                                    ...styles.button,
                                    backgroundColor: '#6b7280',
                                    flex: 1
                                }}
                            >
                                Reset
                            </button>
                            <button 
                                onClick={handleSearch} 
                                style={{
                                    ...styles.button,
                                    flex: 1
                                }}
                            >
                                Tìm kiếm
                            </button>
                        </div>
                    </div>
                </div>
                {(searchProductName || selectedCategoryId || filterStatus !== 'all') && (
                    <div style={{
                        marginTop: '12px',
                        padding: '8px 12px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#374151'
                    }}>
                        <strong>Đang lọc:</strong>
                        {searchProductName && ` Tên: "${searchProductName}"`}
                        {selectedCategoryId && ` | Danh mục: ${categories.find(c => c.id === parseInt(selectedCategoryId))?.name}`}
                        {filterStatus !== 'all' && ` | Trạng thái: ${filterStatus === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}`}
                    </div>
                )}
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Hình ảnh</th>
                            <th 
                                style={{ ...styles.th, cursor: 'pointer', userSelect: 'none' }}
                                onClick={() => handleSort('name')}
                            >
                                Tên sản phẩm {
                                    sortBy === 'name' 
                                        ? (sortDirection === 'asc' ? ' ↑' : ' ↓')
                                        : ' ⇅'
                                }
                            </th>
                            <th style={styles.th}>Danh mục</th>
                            <th style={styles.th}>Mô tả</th>
                            <th style={styles.th}>Trạng thái</th>
                            <th 
                                style={{ ...styles.th, cursor: 'pointer', userSelect: 'none' }}
                                onClick={() => handleSort('createdAt')}
                            >
                                Ngày tạo {
                                    sortBy === 'createdAt'
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
                                <td colSpan={7} style={{ ...styles.td, textAlign: 'center', padding: '48px', color: '#6b7280' }}>
                                    Đang tải...
                                </td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ ...styles.td, textAlign: 'center', padding: '48px', color: '#6b7280' }}>
                                    Chưa có sản phẩm nào
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} style={{ backgroundColor: 'white' }}>
                                    <td style={styles.td}>
                                        {product.image ? (
                                            <img
                                                src={`data:image/jpeg;base64,${product.image}`}
                                                alt={product.name}
                                                style={{ height: '48px', width: '48px', borderRadius: '4px', objectFit: 'cover' }}
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
                                        <div style={{ fontWeight: '500', color: '#111827' }}>{product.name}</div>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{ color: '#111827' }}>{product.categoryName || 'N/A'}</div>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{ color: '#6b7280', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {product.description || 'Không có mô tả'}
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        {getStatusBadge(product)}
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{ color: '#111827' }}>{formatDate(product.createdAt)}</div>
                                    </td>
                                    <td style={styles.td}>
                                        <button
                                            onClick={() => handleView(product)}
                                            style={{ ...styles.actionButton, backgroundColor: '#3b82f6', color: 'white' }}
                                        >
                                            Xem
                                        </button>
                                        <button
                                            onClick={() => handleEdit(product)}
                                            style={{ ...styles.actionButton, backgroundColor: '#f59e0b', color: 'white' }}
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            style={{ ...styles.actionButton, backgroundColor: '#ef4444', color: 'white' }}
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {!loading && products.length > 0 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        borderTop: '1px solid #e5e7eb'
                    }}>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>
                            Hiển thị {(pageNumber - 1) * pageSize + 1} đến {Math.min(pageNumber * pageSize, totalCount)} trong số {totalCount} kết quả
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                                onClick={() => setPageNumber(pageNumber - 1)}
                                disabled={pageNumber === 1}
                                style={{
                                    padding: '8px 16px',
                                    border: '1px solid #d1d5db',
                                    backgroundColor: 'white',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    cursor: pageNumber === 1 ? 'not-allowed' : 'pointer',
                                    opacity: pageNumber === 1 ? 0.5 : 1
                                }}
                            >
                                Trước
                            </button>
                            <span style={{ fontSize: '14px', color: '#6b7280', padding: '0 8px' }}>
                                Trang {pageNumber} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPageNumber(pageNumber + 1)}
                                disabled={pageNumber >= totalPages}
                                style={{
                                    padding: '8px 16px',
                                    border: '1px solid #d1d5db',
                                    backgroundColor: 'white',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    cursor: pageNumber >= totalPages ? 'not-allowed' : 'pointer',
                                    opacity: pageNumber >= totalPages ? 0.5 : 1
                                }}
                            >
                                Sau
                            </button>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setPageNumber(1);
                                }}
                                style={{
                                    padding: '8px 16px',
                                    border: '1px solid #d1d5db',
                                    backgroundColor: 'white',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    marginLeft: '8px',
                                    cursor: 'pointer'
                                }}
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

            {/* Modal for Create/Edit/View */}
            {showModal && (
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
                        position: 'relative'
                    }}>
                        <div style={{ marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                                {modalMode === 'create' && 'Thêm sản phẩm mới'}
                                {modalMode === 'edit' && 'Chỉnh sửa sản phẩm'}
                                {modalMode === 'view' && 'Chi tiết sản phẩm'}
                            </h2>
                        </div>

                        {modalMode === 'view' && selectedProduct ? (
                            // View mode
                            <div>
                                <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                                    {selectedProduct.image ? (
                                        <img
                                            src={`data:image/jpeg;base64,${selectedProduct.image}`}
                                            alt={selectedProduct.name}
                                            style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', objectFit: 'contain', border: '1px solid #e5e7eb' }}
                                        />
                                    ) : (
                                        <div style={{ width: '100%', height: '300px', backgroundColor: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '18px' }}>
                                            Không có hình ảnh
                                        </div>
                                    )}
                                </div>
                                
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>
                                        Tên sản phẩm
                                    </label>
                                    <div style={{ fontSize: '18px', fontWeight: '500', color: '#111827' }}>
                                        {selectedProduct.name}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>
                                        Danh mục
                                    </label>
                                    <div style={{ fontSize: '16px', color: '#111827' }}>
                                        {selectedProduct.categoryName || 'N/A'}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>
                                        Mô tả
                                    </label>
                                    <div style={{ fontSize: '16px', color: '#111827' }}>
                                        {selectedProduct.description}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>
                                        Chi tiết
                                    </label>
                                    <div style={{ fontSize: '16px', color: '#111827', backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', whiteSpace: 'pre-wrap' }}>
                                        {selectedProduct.details}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>
                                            Trạng thái
                                        </label>
                                        <div>
                                            {getStatusBadge(selectedProduct)}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>
                                            Ngày tạo
                                        </label>
                                        <div style={{ fontSize: '16px', color: '#111827' }}>
                                            {formatDate(selectedProduct.createdAt)}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                                    <button
                                        onClick={closeModal}
                                        style={{ flex: 1, padding: '12px 24px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '500', cursor: 'pointer' }}
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Create/Edit mode
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={styles.label}>Tên sản phẩm *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        style={styles.input}
                                        required
                                        disabled={modalMode === 'view'}
                                    />
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={styles.label}>Danh mục *</label>
                                    <select
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                                        style={styles.input}
                                        required
                                        disabled={modalMode === 'view'}
                                    >
                                        <option value={0}>Chọn danh mục</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={styles.label}>Mô tả *</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                                        required
                                        disabled={modalMode === 'view'}
                                    />
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={styles.label}>Chi tiết sản phẩm</label>
                                    <textarea
                                        value={formData.details}
                                        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                        style={{ ...styles.input, minHeight: '120px', resize: 'vertical' }}
                                        disabled={modalMode === 'view'}
                                    />
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={styles.label}>Hình ảnh</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={styles.input}
                                        disabled={modalMode === 'view'}
                                    />
                                    {imagePreview && (
                                        <div style={{ marginTop: '12px', textAlign: 'center' }}>
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', objectFit: 'contain', border: '1px solid #e5e7eb' }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                                    {modalMode !== 'view' && (
                                        <button
                                            type="submit"
                                            style={{ flex: 1, padding: '12px 24px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '500', cursor: 'pointer' }}
                                        >
                                            {modalMode === 'create' ? 'Tạo sản phẩm' : 'Cập nhật'}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        style={{ flex: 1, padding: '12px 24px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '500', cursor: 'pointer' }}
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerProductManagement;

