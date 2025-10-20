import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import routesConfig from '../../config/routesConfig';

const RoleBasedRedirect = () => {
  const { user, isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isLoggedIn && user) {
      // Kiểm tra roles và redirect tương ứng
      if (user.roles.includes('ADMIN')) {
        // Admin redirect to admin dashboard
        navigate('/admin/dashboard');
      } else if (user.roles.includes('SELLER')) {
        // Seller redirect to seller dashboard (có thể là home hoặc seller-specific page)
        navigate(routesConfig.home);
      } else if (user.roles.includes('USER')) {
        // Regular user redirect to home
        navigate(routesConfig.home);
      } else {
        // No valid role, redirect to home
        navigate(routesConfig.home);
      }
    }
  }, [user, isLoggedIn, loading, navigate]);

  // Show loading while determining redirect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-gray-700">Đang chuyển hướng...</p>
      </div>
    </div>
  );
};

export default RoleBasedRedirect;
