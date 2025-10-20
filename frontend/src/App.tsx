import {BrowserRouter, Routes, Route} from "react-router-dom";
import {publicRoutes, privateRoutes, sellerRoutes, adminRoutes, hasRequiredRole} from "./routes";
import { useAuth } from "./hooks/useAuth";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRoles }: { children: React.ReactNode, requiredRoles?: string[] }) => {
  const { user, isLoggedIn, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRoles && !hasRequiredRole(user, requiredRoles)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
        <div className="App">
            <Routes>
                {publicRoutes.map((route,index)=>{
                    const Layout=route.layout;
                    const Page=route.element;
                    return <Route key={index} path={route.path} element={<Layout>
                        {Page}
                    </Layout>}/>
                })}
                
                {privateRoutes.map((route,index)=>{
                    const Layout=route.layout;
                    const Page=route.element;
                    return <Route key={`private-${index}`} path={route.path} element={
                        <ProtectedRoute requiredRoles={route.requiredRoles}>
                            <Layout>
                                {Page}
                            </Layout>
                        </ProtectedRoute>
                    }/>
                })}
                
                {sellerRoutes.map((route,index)=>{
                    const Layout=route.layout;
                    const Page=route.element;
                    return <Route key={`seller-${index}`} path={route.path} element={
                        <ProtectedRoute requiredRoles={route.requiredRoles}>
                            <Layout>
                                {Page}
                            </Layout>
                        </ProtectedRoute>
                    }/>
                })}
                
                {adminRoutes.map((route,index)=>{
                    const Layout=route.layout;
                    const Page=route.element;
                    return <Route key={`admin-${index}`} path={route.path} element={
                        <ProtectedRoute requiredRoles={route.requiredRoles}>
                            <Layout>
                                {Page}
                            </Layout>
                        </ProtectedRoute>
                    }/>
                })}
            </Routes>
        </div>
    </BrowserRouter>
  )
}

export default App
