import { useState, useEffect } from "react";
import { userServices } from "@services/UserServices.ts";
import type { UserForAdmin, UpdateAccountRequest } from "@/models";
import useDebounce from "@hooks/useDebounce.tsx";
import Button from "@components/Button/Button.tsx";
import EditUserModal from "./EditUserModal";
import DeleteUserModal from "./DeleteUserModal";
import ViewUserModal from "./ViewUserModal";
import UserStats from "@components/Admin/UserStats";

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
  const [usernameSearch, setUsernameSearch] = useState("");
  const [emailSearch, setEmailSearch] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [editingUser, setEditingUser] = useState<UserForAdmin | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserForAdmin | null>(null);
  const [viewingUser, setViewingUser] = useState<UserForAdmin | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBannedUsers, setShowBannedUsers] = useState(false);
  const [isUnbanning, setIsUnbanning] = useState(false);
  const [isBanning, setIsBanning] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));

  // Statistics state
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    customers: 0,
    sellers: 0,
  });

  const debouncedUsernameSearch = useDebounce(usernameSearch, 500);
  const debouncedEmailSearch = useDebounce(emailSearch, 500);

  // Load statistics on component mount
  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const stats = await userServices.getUserStatisticsAsync();
        setStatistics(stats);
      } catch (err) {
        console.error("Error loading statistics:", err);
      }
    };

    void loadStatistics();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedUsernameSearch,
    debouncedEmailSearch,
    filterRole,
    sortOrder,
    showBannedUsers,
  ]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsSearching(true);
        setError(null);

        let result;
        if (showBannedUsers) {
          result = await userServices.getUsersPagedAsync(
            currentPage,
            pageSize,
            undefined,
            filterRole,
            sortOrder,
            debouncedUsernameSearch,
            debouncedEmailSearch,
            false
          );
        } else {
          result = await userServices.getUsersPagedAsync(
            currentPage,
            pageSize,
            undefined,
            filterRole,
            sortOrder,
            debouncedUsernameSearch,
            debouncedEmailSearch,
            true
          );
        }

        setUsers(result.items);
        setTotalUsers(result.total);
      } catch {
        setError("Không thể tải danh sách người dùng");
      } finally {
        setIsSearching(false);
        setLoading(false);
      }
    };

    void fetchUsers();
  }, [
    currentPage,
    debouncedUsernameSearch,
    debouncedEmailSearch,
    filterRole,
    sortOrder,
    pageSize,
    showBannedUsers,
  ]);

  const handleEditUser = (user: UserForAdmin) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleViewUser = (user: UserForAdmin) => {
    setViewingUser(user);
    setShowViewModal(true);
  };

  const handleUpdateUser = async (updatedData: UpdateAccountRequest) => {
    if (!editingUser) return;

    try {
      setIsUpdating(true);
      setError(null);

      const selectedRoles = updatedData.roles;

      // Filter valid roles and map to role IDs
      const validRoles = selectedRoles.filter(
        (role) => role === "SELLER" || role === "CUSTOMER"
      );

      if (validRoles.length === 0) {
        alert(
          "Vui lòng chọn ít nhất một vai trò hợp lệ (Người bán hoặc Khách hàng)"
        );
        setIsUpdating(false);
        return;
      }

      const roleIds = validRoles.map((role) => (role === "SELLER" ? 2 : 3));

      // Don't allow sending empty roleIds - it causes backend errors
      if (roleIds.length === 0) {
        alert(
          "Không thể xóa tất cả vai trò của người dùng. Vui lòng giữ ít nhất một vai trò."
        );
        setIsUpdating(false);
        return;
      }

      await userServices.updateUserRolesAsync(editingUser.id, roleIds);

      console.log("Roles updated successfully, refreshing data...");

      // Refresh statistics
      const stats = await userServices.getUserStatisticsAsync();
      setStatistics(stats);

      const result = await userServices.getUsersPagedAsync(
        currentPage,
        pageSize,
        undefined,
        filterRole,
        sortOrder,
        debouncedUsernameSearch,
        debouncedEmailSearch,
        showBannedUsers ? false : true
      );

      setUsers(result.items);
      setTotalUsers(result.total);

      console.log("User list refreshed successfully");

      setShowEditModal(false);
      setEditingUser(null);
    } catch (err: unknown) {
      console.error("Error updating user:", err);

      const apiError = err as ApiError;
      const errorMessage =
        apiError?.response?.data?.message ||
        (err instanceof Error ? err.message : "Không thể cập nhật người dùng");

      console.error("Error details:", {
        status: apiError?.response?.status,
        data: apiError?.response?.data,
        message: errorMessage,
      });

      setError(errorMessage);
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
      const newPage =
        users.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      setCurrentPage(newPage);

      const result = await userServices.getUsersPagedAsync(
        newPage,
        pageSize,
        undefined,
        filterRole,
        sortOrder,
        debouncedUsernameSearch,
        debouncedEmailSearch,
        showBannedUsers ? false : true
      );
      setUsers(result.items);
      setTotalUsers(result.total);

      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error && "response" in err
          ? (err as ApiError).response?.data?.message
          : "Không thể xóa người dùng";
      setError(errorMessage || "Không thể xóa người dùng");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBanUser = async (user: UserForAdmin) => {
    if (!confirm(`Bạn có chắc chắn muốn ban người dùng ${user.username}?`)) {
      return;
    }

    try {
      setIsBanning(true);
      setError(null);

      await userServices.updateUserStatusAsync(user.id, false);

      // Refresh statistics
      const stats = await userServices.getUserStatisticsAsync();
      setStatistics(stats);

      const result = await userServices.getUsersPagedAsync(
        currentPage,
        pageSize,
        undefined,
        filterRole,
        sortOrder,
        debouncedUsernameSearch,
        debouncedEmailSearch,
        showBannedUsers ? false : true
      );

      setUsers(result.items);
      setTotalUsers(result.total);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error && "response" in err
          ? (err as ApiError).response?.data?.message
          : "Không thể ban người dùng";
      setError(errorMessage || "Không thể ban người dùng");
    } finally {
      setIsBanning(false);
    }
  };

  const handleUnbanUser = async (user: UserForAdmin) => {
    if (
      !confirm(`Bạn có chắc chắn muốn gỡ ban cho người dùng ${user.username}?`)
    ) {
      return;
    }

    try {
      setIsUnbanning(true);
      setError(null);

      await userServices.updateUserStatusAsync(user.id, true);

      // Refresh statistics
      const stats = await userServices.getUserStatisticsAsync();
      setStatistics(stats);

      const result = await userServices.getUsersPagedAsync(
        currentPage,
        pageSize,
        undefined,
        filterRole,
        sortOrder,
        debouncedUsernameSearch,
        debouncedEmailSearch,
        showBannedUsers ? false : true
      );

      setUsers(result.items);
      setTotalUsers(result.total);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error && "response" in err
          ? (err as ApiError).response?.data?.message
          : "Không thể gỡ ban người dùng";
      setError(errorMessage || "Không thể gỡ ban người dùng");
    } finally {
      setIsUnbanning(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "SELLER":
        return "bg-blue-100 text-blue-800";
      case "CUSTOMER":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Quản trị viên";
      case "SELLER":
        return "Người bán";
      case "CUSTOMER":
        return "Khách hàng";
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
          <Button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {showBannedUsers
              ? "Quản lý người dùng bị ban"
              : "Quản lý người dùng"}
          </h1>
          {totalUsers > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              Tổng cộng {totalUsers}{" "}
              {showBannedUsers ? "người dùng bị ban" : "người dùng"}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowBannedUsers(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              !showBannedUsers
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Người dùng hoạt động
          </Button>
          <Button
            onClick={() => setShowBannedUsers(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              showBannedUsers
                ? "bg-red-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Người dùng bị ban
          </Button>
        </div>
      </div>

      {/* User Statistics */}
      <UserStats
        totalUsers={statistics.totalUsers}
        activeUsers={statistics.activeUsers}
        inactiveUsers={statistics.inactiveUsers}
        customers={statistics.customers}
        sellers={statistics.sellers}
      />

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm theo username
            </label>
            <div className="relative">
              <input
                type="text"
                value={usernameSearch}
                onChange={(e) => setUsernameSearch(e.target.value)}
                placeholder="Nhập username..."
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
              Tìm theo email
            </label>
            <div className="relative">
              <input
                type="text"
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                placeholder="Nhập email..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sắp xếp theo ngày tạo
            </label>
            <div className="flex gap-2">
              <Button
                onClick={() => setSortOrder("desc")}
                className={`px-3 py-2 text-sm rounded-md ${
                  sortOrder === "desc"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Mới nhất
              </Button>
              <Button
                onClick={() => setSortOrder("asc")}
                className={`px-3 py-2 text-sm rounded-md ${
                  sortOrder === "asc"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Cũ nhất
              </Button>
            </div>
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
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    {isSearching ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mr-3"></div>
                        Đang tìm kiếm...
                      </div>
                    ) : (
                      "Không tìm thấy người dùng nào"
                    )}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(
                              role
                            )}`}
                          >
                            {getRoleDisplayName(role)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.balance.toLocaleString("vi-VN")} VNĐ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.isActive ? "Hoạt động" : "Không hoạt động"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {showBannedUsers
                          ? !user.roles.includes("ADMIN") && (
                              <>
                                <Button
                                  onClick={() => handleUnbanUser(user)}
                                  disabled={isUnbanning}
                                  leftIcon={
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  }
                                  className="text-green-600 hover:text-green-900 disabled:opacity-50 bg-transparent border-0 p-0"
                                >
                                  {isUnbanning ? "Đang gỡ ban..." : "Gỡ ban"}
                                </Button>
                                <Button
                                  onClick={() => handleViewUser(user)}
                                  leftIcon={
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                      />
                                    </svg>
                                  }
                                  className="text-blue-600 hover:text-blue-900 bg-transparent border-0 p-0"
                                >
                                  Xem
                                </Button>
                              </>
                            )
                          : !user.roles.includes("ADMIN") && (
                              <>
                                <Button
                                  onClick={() => handleEditUser(user)}
                                  leftIcon={
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                      />
                                    </svg>
                                  }
                                  className="text-blue-600 hover:text-blue-900 bg-transparent border-0 p-0"
                                >
                                  Sửa
                                </Button>
                                <Button
                                  onClick={() => handleBanUser(user)}
                                  disabled={isBanning}
                                  leftIcon={
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                                      />
                                    </svg>
                                  }
                                  className="text-red-600 hover:text-red-900 disabled:opacity-50 bg-transparent border-0 p-0"
                                >
                                  {isBanning ? "Đang ban..." : "Ban"}
                                </Button>
                                <Button
                                  onClick={() => handleViewUser(user)}
                                  leftIcon={
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                      />
                                    </svg>
                                  }
                                  className="text-green-600 hover:text-green-900 bg-transparent border-0 p-0"
                                >
                                  Xem
                                </Button>
                              </>
                            )}
                        {user.roles.includes("ADMIN") && (
                          <span className="text-gray-500 text-sm">
                            Không thể chỉnh sửa
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalUsers > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </Button>
            <Button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage >= totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-700">
                Hiển thị{" "}
                <span className="font-medium">
                  {totalUsers > 0 ? (currentPage - 1) * pageSize + 1 : 0}
                </span>{" "}
                đến{" "}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, totalUsers)}
                </span>{" "}
                trong tổng số <span className="font-medium">{totalUsers}</span>{" "}
                {showBannedUsers ? "người dùng bị ban" : "người dùng"}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Hiển thị</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    const newPageSize = Number(e.target.value);
                    setPageSize(newPageSize);
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                </select>
                <span className="text-sm text-gray-700">mục/trang</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Trang</span>
                <select
                  value={currentPage}
                  onChange={(e) =>
                    setCurrentPage(
                      Math.min(totalPages, Math.max(1, Number(e.target.value)))
                    )
                  }
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={totalPages <= 1}
                >
                  {Array.from(
                    { length: Math.max(1, totalPages) },
                    (_, i) => i + 1
                  ).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-700">/ {totalPages}</span>
              </div>
            </div>
            <div>
              {totalPages > 1 && (
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <Button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Trước</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .map((page, index, array) => {
                      const showEllipsis =
                        index > 0 && page - array[index - 1] > 1;
                      return (
                        <div key={page} className="flex">
                          {showEllipsis && (
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                              ...
                            </span>
                          )}
                          <Button
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? "z-10 bg-green-50 border-green-500 text-green-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </Button>
                        </div>
                      );
                    })}

                  <Button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage >= totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Sau</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Button>
                </nav>
              )}
            </div>
          </div>
        </div>
      )}

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

      <ViewUserModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewingUser(null);
        }}
        user={viewingUser}
      />
    </div>
  );
};

export default UserManagement;
