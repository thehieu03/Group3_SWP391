import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import routesConfig from '@config/routesConfig.ts';

const RoleBasedRedirect = () => {
  const { user, isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isLoggedIn && user) {
      if (user.roles.includes('ADMIN')) {
        navigate('/admin/dashboard');
      } else if (user.roles.includes('SELLER')) {
        navigate(routesConfig.home);
      } else if (user.roles.includes('USER')) {
        navigate(routesConfig.home);
      } else {
        navigate(routesConfig.home);
      }
    }
  }, [user, isLoggedIn, loading, navigate]);

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
