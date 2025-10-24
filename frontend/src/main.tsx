import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider } from "./provider/AuthProvider.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import {clientId} from "@config/clientId.ts";

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
          <App />
      </AuthProvider>
  </GoogleOAuthProvider>
);
