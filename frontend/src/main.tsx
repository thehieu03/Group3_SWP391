import { createRoot } from 'react-dom/client'
import App from "./App.tsx";
import {AuthProvider} from "./contexts/AuthContext.tsx";

createRoot(document.getElementById('root')!).render(
    <AuthProvider>
        <App />
    </AuthProvider>
)
