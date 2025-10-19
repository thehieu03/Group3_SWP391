import {BrowserRouter, Routes, Route} from "react-router-dom";
import {publicRoutes} from "./routes";
import { AuthProvider } from "./contexts/AuthContext";

function App() {

  return (
    <AuthProvider>
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
              </Routes>
          </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
