import { createRoot } from 'react-dom/client'
import App from "./App.tsx";
import {AuthProvider} from "@provider/AuthProvider.tsx";

createRoot(document.getElementById('root')!).render(
    <AuthProvider>
        <App />
    </AuthProvider>
)
