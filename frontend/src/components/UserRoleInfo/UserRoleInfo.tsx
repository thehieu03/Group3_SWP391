import { useAuth } from "@/hooks/useAuth";
import { getRoleBadgeColor, getRoleDisplayName } from "@/helpers";

const UserRoleInfo = () => {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn || !user) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        Thông tin tài khoản
      </h3>

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
          <span
            className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
              user.isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {user.isActive ? "Hoạt động" : "Không hoạt động"}
          </span>
        </div>

        <div>
          <span className="text-sm text-gray-600">Vai trò:</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {user.roles.map((role, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                  role,
                  true
                )}`}
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
