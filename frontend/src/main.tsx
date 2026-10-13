import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { AuthGate, AuthProvider } from "./auth";
import "./theme.css";

// O HashRouter le a rota do fragmento uma unica vez, na montagem. Por isso ele
// fica dentro do AuthGate: assim so monta depois que o Keycloak terminou o
// init e ja limpou os parametros do callback da URL.
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <AuthGate>
        <HashRouter>
          <App />
        </HashRouter>
      </AuthGate>
    </AuthProvider>
  </React.StrictMode>,
);
