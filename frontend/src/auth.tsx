import React from "react";
import Keycloak from "keycloak-js";

declare global {
  interface Window {
    __AUTH_ENABLED__?: boolean;
    __KEYCLOAK_URL__?: string;
    __KEYCLOAK_REALM__?: string;
    __KEYCLOAK_CLIENT_ID__?: string;
  }
}

type AuthState =
  | { ready: false; authenticated: false; userName: ""; token: null; error: null }
  | { ready: true; authenticated: false; userName: ""; token: null; error: string | null }
  | { ready: true; authenticated: true; userName: string; token: string | null; error: null };

const AuthContext = React.createContext<{
  enabled: boolean;
  state: AuthState;
  login: () => void;
  register: () => void;
  logout: () => void;
  token: () => string | null;
} | null>(null);

let client: Keycloak | null = null;
let loginRedirectInFlight = false;
const authEnabled = window.__AUTH_ENABLED__ !== false;

function homeRedirectUri(): string {
  const url = new URL("./", window.location.href);
  url.hash = "#/";
  return url.toString();
}

function logoutRedirectUri(): string {
  const url = new URL(homeRedirectUri());
  url.searchParams.set("forceLogin", "1");
  return url.toString();
}

function keycloak(): Keycloak {
  if (!client) {
    client = new Keycloak({
      url: window.__KEYCLOAK_URL__ ?? "",
      realm: window.__KEYCLOAK_REALM__ ?? "pdc-generated",
      clientId: window.__KEYCLOAK_CLIENT_ID__ ?? "pdc-generated-app",
    });
  }
  return client;
}

function beginLogin(kind: "login" | "register" = "login"): void {
  if (loginRedirectInFlight) return;
  loginRedirectInFlight = true;
  const action =
    kind === "register"
      ? keycloak().register({ redirectUri: homeRedirectUri() })
      : keycloak().login({ redirectUri: homeRedirectUri() });
  void action.finally(() => {
    loginRedirectInFlight = false;
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>(
    authEnabled
      ? { ready: false, authenticated: false, userName: "", token: null, error: null }
      : { ready: true, authenticated: true, userName: "", token: null, error: null },
  );

  React.useEffect(() => {
    if (!authEnabled) return;
    const kc = keycloak();
    if (window.location.search.includes("forceLogin=1")) {
      window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    }
    kc.init({
      onLoad: "login-required",
      pkceMethod: "S256",
      checkLoginIframe: false,
      // A rota vive no fragmento (HashRouter). Em "fragment" o Keycloak
      // sobrescreve o "#/" com code/state e a aplicacao volta sem rota.
      responseMode: "query",
    })
      .then((authenticated) => {
        if (!authenticated) {
          beginLogin();
          return;
        }
        setState({
          ready: true,
          authenticated: true,
          userName: kc.tokenParsed?.name ?? kc.tokenParsed?.preferred_username ?? "",
          token: kc.token ?? null,
          error: null,
        } as AuthState);
      })
      .catch(() => {
        setState({
          ready: true,
          authenticated: false,
          userName: "",
          token: null,
          error: "Nao foi possivel iniciar a autenticacao.",
        });
      });

    kc.onTokenExpired = () => {
      void kc
        .updateToken(30)
        .then(() => {
          setState((current) =>
            current.authenticated
              ? { ...current, token: kc.token ?? null, error: null }
              : current,
          );
        })
        .catch(() => beginLogin());
    };
  }, []);

  const value = {
    enabled: authEnabled,
    state,
    login: () => { if (authEnabled) beginLogin(); },
    register: () => { if (authEnabled) beginLogin("register"); },
    logout: () => { if (authEnabled) void keycloak().logout({ redirectUri: logoutRedirectUri() }); },
    token: () => authEnabled ? keycloak().token ?? state.token : null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}

export function getAuthToken(): string | null {
  return client?.token ?? null;
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  if (!auth.state.ready) {
    return <main className="auth-screen"><section className="auth-panel"><p>Carregando autenticacao...</p></section></main>;
  }
  if (!auth.state.authenticated) {
    return (
      <main className="auth-screen">
        <section className="auth-panel">
          <p className="auth-kicker">Autenticacao</p>
          <h1>Redirecionando para o login</h1>
          <p>{auth.state.error ?? "Voce sera levado para a tela de acesso segura em instantes."}</p>
          <div className="auth-actions">
            <button type="button" className="auth-primary" onClick={auth.login}>Tentar novamente</button>
            <button type="button" className="auth-secondary" onClick={auth.register}>Criar meu perfil</button>
          </div>
        </section>
      </main>
    );
  }
  return <>{children}</>;
}
