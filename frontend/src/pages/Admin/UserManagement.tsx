import { useState, useEffect } from 'react';
import { userServices, type UserForAdmin, type UpdateAccountRequest } from '../../services/UserServices';
import useDebounce from "../../hooks/useDebounce.tsx";

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
      errors?: Record<string, unknown>;
    };
  };
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserForAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [editingUser, setEditingUser] = useState<UserForAdmin | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserForAdmin | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pageSize] = useState(5); // 5 users per page
  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterRole]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsSearching(true);
        setError(null);
        const result = await userServices.getUsersPagedAsync(
          currentPage, 
          pageSize, 
          debouncedSearchTerm, 
          filterRole
        );
        setUsers(result.items);
        setTotalUsers(result.total);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Không thể tải danh sách người dùng');
      } finally {
        setIsSearching(false);
        setLoading(false);
      }
    };

    void fetchUsers();
  }, [currentPage, debouncedSearchTerm, filterRole, pageSize]);

  const handleEditUser = (user: UserForAdmin) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = (user: UserForAdmin) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleUpdateUser = async (updatedData: UpdateAccountRequest) => {
    if (!editingUser) return;
    
    try {
      setIsUpdating(true);
      setError(null);
      
      // Debug: Log the data being sent
      console.log('Updating user with data:', updatedData);
      console.log('Roles being sent:', updatedData.roles);
      
      await userServices.updateAccountAsync(editingUser.id, updatedData);
      
      // Refresh the users list with pagination
      const result = await userServices.getUsersPagedAsync(
        currentPage, 
        pageSize, 
        debouncedSearchTerm, 
        filterRole
      );
      setUsers(result.items);
      setTotalUsers(result.total);
      
      setShowEditModal(false);
      setEditingUser(null);
    } catch (err: unknown) {
      console.error('Error updating user:', err);
      
      // More detailed error logging
      if (err instanceof Error && 'response' in err) {
        const apiErr = err as ApiError;
        console.error('API Error Details:', {
          status: apiErr.response?.status,
          data: apiErr.response?.data,
          message: apiErr.response?.data?.message
        });
      }
      
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as ApiError).response?.data?.message 
        : 'Không thể cập nhật người dùng';
      setError(errorMessage || 'Không thể cập nhật người dùng');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      setIsDeleting(true);
      setError(null);
      await userServices.deleteAccountAsync(userToDelete.id);
      
      // Refresh the users list with pagination
      // If current page becomes empty after deletion, go to previous page
      const newPage = users.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      setCurrentPage(newPage);
      
      const result = await userServices.getUsersPagedAsync(
        newPage, 
        pageSize, 
        debouncedSearchTerm, 
        filterRole
      );
      setUsers(result.items);
      setTotalUsers(result.total);
      
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err: unknown) {
      console.error('Error deleting user:', err);
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as ApiError).response?.data?.message 
        : 'Không thể xóa người dùng';
      setError(errorMessage || 'Không thể xóa người dùng');
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'SELLER':
        return 'bg-blue-100 text-blue-800';
      case 'CUSTOMER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Quản trị viên';
      case 'SELLER':
        return 'Người bán';
      case 'CUSTOMER':
        return 'Khách hàng';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
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
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
          {totalUsers > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              Tổng cộng {totalUsers} người dùng
            </p>
          )}
        </div>
        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md">
          Thêm người dùng
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên hoặc email..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lọc theo vai trò
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="ALL">Tất cả</option>
              <option value="ADMIN">Quản trị viên</option>
              <option value="SELLER">Người bán</option>
              <option value="CUSTOMER">Khách hàng</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số dư
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    {isSearching ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mr-3"></div>
                        Đang tìm kiếm...
                      </div>
                    ) : (
                      'Không tìm thấy người dùng nào'
                    )}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(role)}`}
                        >
                          {getRoleDisplayName(role)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.balance.toLocaleString('vi-VN')} VNĐ
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Sửa
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalUsers > pageSize && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-700">
                Hiển thị{' '}
                <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>
                {' '}đến{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, totalUsers)}
                </span>
                {' '}trong tổng số{' '}
                <span className="font-medium">{totalUsers}</span>
                {' '}kết quả
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Trang</span>
                <select
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Math.min(totalPages, Math.max(1, Number(e.target.value))))}
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <span className="text-sm text-gray-700">/ {totalPages}</span>
              </div>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Trước</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first page, last page, current page, and pages around current page
                    return page === 1 || 
                           page === totalPages || 
                           Math.abs(page - currentPage) <= 1;
                  })
                  .map((page, index, array) => {
                    const showEllipsis = index > 0 && page - array[index - 1] > 1;
                    return (
                      <div key={page} className="flex">
                        {showEllipsis && (
                          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            ...
                          </span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-green-50 border-green-500 text-green-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    );
                  })}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Sau</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <EditUserModal
          user={editingUser}
          onSave={handleUpdateUser}
          onCancel={() => {
            setShowEditModal(false);
            setEditingUser(null);
          }}
          isLoading={isUpdating}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <DeleteUserModal
          user={userToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setUserToDelete(null);
          }}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};

// Edit User Modal Component
const EditUserModal = ({ 
  user, 
  onSave, 
  onCancel, 
  isLoading 
}: { 
  user: UserForAdmin; 
  onSave: (data: UpdateAccountRequest) => void; 
  onCancel: () => void; 
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState<UpdateAccountRequest>({
    id: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    balance: user.balance,
    isActive: user.isActive,
    createdAt: user.createdAt,
    roles: [...user.roles]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure roles array is not empty
    if (formData.roles.length === 0) {
      alert('Vui lòng chọn ít nhất một vai trò');
      return;
    }
    
    console.log('Form data before submit:', formData);
    onSave(formData);
  };

  const handleRoleToggle = (role: string) => {
    console.log('Toggling role:', role);
    console.log('Current roles before toggle:', formData.roles);
    
    setFormData(prev => {
      const newRoles = prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role];
      
      console.log('New roles after toggle:', newRoles);
      return {
        ...prev,
        roles: newRoles
      };
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">Chỉnh sửa người dùng</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số dư (VNĐ)
            </label>
            <input
              type="number"
              value={formData.balance}
              onChange={(e) => setFormData(prev => ({ ...prev, balance: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vai trò
            </label>
            <div className="space-y-2">
              {['ADMIN', 'SELLER', 'CUSTOMER'].map((role) => (
                <label key={role} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.roles.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                    className="mr-2"
                  />
                  <span className="text-sm">
                    {role === 'ADMIN' ? 'Quản trị viên' : 
                     role === 'SELLER' ? 'Người bán' : 'Khách hàng'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Tài khoản hoạt động
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete User Modal Component
const DeleteUserModal = ({ 
  user, 
  onConfirm, 
  onCancel, 
  isLoading 
}: { 
  user: UserForAdmin; 
  onConfirm: () => void; 
  onCancel: () => void; 
  isLoading: boolean;
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4 text-red-600">Xác nhận xóa</h2>
        
        <p className="text-gray-700 mb-6">
          Bạn có chắc chắn muốn xóa người dùng <strong>{user.username}</strong> không?
          <br />
          <span className="text-sm text-gray-500">
            Email: {user.email}
          </span>
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isLoading}
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
