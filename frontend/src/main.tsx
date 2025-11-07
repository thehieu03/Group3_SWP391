import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider } from "./provider/AuthProvider.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import {clientId} from "@config/clientId.ts";
import {StrictMode} from "react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
      <GoogleOAuthProvider clientId={clientId}>
          <AuthProvider>
              <App />
          </AuthProvider>
      </GoogleOAuthProvider>
  </StrictMode>
);
