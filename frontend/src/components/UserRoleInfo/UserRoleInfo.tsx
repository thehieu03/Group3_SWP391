import { useAuth } from '../../hooks/useAuth';

const UserRoleInfo = () => {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn || !user) {
    return null;
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'SELLER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'USER':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Quản trị viên';
      case 'SELLER':
        return 'Người bán';
      case 'USER':
        return 'Người dùng';
      default:
        return role;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Thông tin tài khoản</h3>
      
      <div className="space-y-2">
        <div>
          <span className="text-sm text-gray-600">Tên đăng nhập:</span>
          <span className="ml-2 font-medium">{user.username}</span>
        </div>
        
        <div>
          <span className="text-sm text-gray-600">Email:</span>
          <span className="ml-2 font-medium">{user.email}</span>
        </div>
        
        <div>
          <span className="text-sm text-gray-600">Trạng thái:</span>
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
          </span>
        </div>
        
        <div>
          <span className="text-sm text-gray-600">Vai trò:</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {user.roles.map((role, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(role)}`}
              >
                {getRoleDisplayName(role)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRoleInfo;
