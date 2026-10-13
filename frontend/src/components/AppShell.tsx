import "bootstrap-icons/font/bootstrap-icons.css";
import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useAuth } from "../auth";

export interface AppNavLink {
  label: string;
  to: string;
}

function NavIcon({ label }: { label: string }) {
  const value = label.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const iconClass = iconClassFor(value);
  return <i className={`bi ${iconClass}`} aria-hidden="true" />;
}

function iconClassFor(value: string): string {
  if (value === "inicio" || value === "home") return "bi-house-door";
  if (value.includes("dashboard") || value.includes("painel")) return "bi-speedometer2";
  if (value.includes("aluno") || value.includes("estudante")) return "bi-mortarboard";
  if (value.includes("professor") || value.includes("docente")) return "bi-person-badge";
  if (value.includes("lingua") || value.includes("idioma") || value.includes("language")) return "bi-translate";
  if (value.includes("nivel") || value.includes("etapa")) return "bi-layers";
  if (value.includes("curso") || value.includes("disciplina")) return "bi-journal-bookmark";
  if (value.includes("aula") || value.includes("turma") || value.includes("classe")) return "bi-easel";
  if (value.includes("matricula") || value.includes("inscricao")) return "bi-clipboard-check";
  if (value.includes("cliente") || value.includes("usuario") || value.includes("pessoa")) return "bi-people";
  if (value.includes("categoria")) return "bi-tags";
  if (value.includes("produto") || value.includes("estoque")) return "bi-box-seam";
  if (value.includes("fornecedor")) return "bi-truck";
  if (value.includes("compra")) return "bi-cart";
  if (value.includes("venda") || value.includes("pedido")) return "bi-receipt";
  if (value.includes("item")) return "bi-list-check";
  if (value.includes("relatorio") || value.includes("analise")) return "bi-graph-up";
  if (value.includes("financeiro") || value.includes("pagamento")) return "bi-cash-stack";
  if (value.includes("config")) return "bi-gear";
  return "bi-grid";
}

function Brand({ value }: { value: string }) {
  return (
    <span className="brand">
      <span className="brand-icon">
        <i className="bi bi-grid" aria-hidden="true" />
      </span>
      {value}
    </span>
  );
}

function SidebarBrand({
  value,
  logoUrl,
  collapsed,
}: {
  value: string;
  logoUrl?: string | null;
  collapsed: boolean;
}) {
  if (logoUrl) {
    return (
      <div className="sidebar-brand sidebar-brand-logo">
        <img className="sidebar-logo" src={logoUrl} alt={value} />
      </div>
    );
  }

  return (
    <div className="sidebar-brand">
      <span className="brand-icon sidebar-brand-icon">
        <i className="bi bi-grid" aria-hidden="true" />
      </span>
      <div className="sidebar-brand-text" aria-hidden={collapsed}>
        <span className="sidebar-brand-title">{value}</span>
      </div>
    </div>
  );
}

function NavigationItems({ links, collapsed = false }: { links: AppNavLink[]; collapsed?: boolean }) {
  return (
    <>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === "/"}
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          title={collapsed ? link.label : undefined}
        >
          <NavIcon label={link.label} />
          <span className="nav-link-label">{link.label}</span>
        </NavLink>
      ))}
    </>
  );
}

function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("theme");
  const theme = stored === "light" || stored === "dark" ? stored : "light";
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.dataset.theme = theme;
  document.documentElement.setAttribute("data-swal2-theme", theme);
  if (document.body) {
    document.body.setAttribute("data-theme", theme);
    document.body.dataset.theme = theme;
    document.body.setAttribute("data-swal2-theme", theme);
  }
  return theme;
}

export function AppShell({
  brand,
  logoUrl,
  links,
  layout,
  children,
}: {
  brand: string;
  logoUrl?: string | null;
  links: AppNavLink[];
  layout: "navbar" | "sidebar";
  children: ReactNode;
}) {
  const auth = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("sidebar-collapsed") === "true";
  });
  const isDark = theme === "dark";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.dataset.theme = theme;
    document.documentElement.setAttribute("data-swal2-theme", theme);
    if (document.body) {
      document.body.setAttribute("data-theme", theme);
      document.body.dataset.theme = theme;
      document.body.setAttribute("data-swal2-theme", theme);
    }
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("sidebar-collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const sidebarThemeToggle = (
    <button
      className="sidebar-theme-toggle"
      type="button"
      onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      title={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
    >
      <span className="sidebar-action-icon">
        <i className={`bi ${isDark ? "bi-sun" : "bi-moon"}`} aria-hidden="true" />
      </span>
      <span className="sidebar-action-text">{isDark ? "Modo claro" : "Modo escuro"}</span>
      <span className={`theme-switch${isDark ? " is-dark" : ""}`} aria-hidden="true">
        <span className="theme-switch-thumb" />
      </span>
    </button>
  );

  const navbarThemeToggle = (
    <button
      className="theme-toggle"
      type="button"
      onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      title={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
    >
      <i className={`bi ${isDark ? "bi-sun" : "bi-moon"}`} aria-hidden="true" />
    </button>
  );

  if (layout === "sidebar") {
    return (
      <div className={`app app-sidebar${sidebarCollapsed ? " sidebar-collapsed" : ""}`}>
        <aside className="sidebar shadcn-sidebar">
          <div className={`sidebar-topbar${logoUrl ? " has-logo" : ""}`}>
            <SidebarBrand value={brand} logoUrl={logoUrl} collapsed={sidebarCollapsed} />
            <button
              className="sidebar-toggle"
              type="button"
              onClick={() => setSidebarCollapsed((current) => !current)}
              aria-label={sidebarCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
              title={sidebarCollapsed ? "Expandir" : "Recolher"}
            >
              <i className={`bi ${sidebarCollapsed ? "bi-layout-sidebar-inset" : "bi-layout-sidebar-inset-reverse"}`} aria-hidden="true" />
            </button>
          </div>
          <div className="sidebar-section-label">Navegação</div>
          <nav className="sidebar-nav shadcn-sidebar-menu" aria-label="Navegação principal">
            <NavigationItems links={links} collapsed={sidebarCollapsed} />
          </nav>
          <div className="sidebar-footer">
            {auth.enabled && (
              <button
                className="sidebar-footer-action"
                type="button"
                onClick={auth.logout}
                title={sidebarCollapsed ? "Sair" : undefined}
              >
                <span className="sidebar-action-icon">
                  <i className="bi bi-box-arrow-left" aria-hidden="true" />
                </span>
                <span className="sidebar-action-text">Sair</span>
              </button>
            )}
            {sidebarThemeToggle}
          </div>
        </aside>
        <main className="content content-with-sidebar">{children}</main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="navbar shadcn-navbar">
        <div className="navbar-inner">
          <Brand value={brand} />
          <div className="navbar-actions">
            <nav className="nav-links shadcn-navigation-menu" aria-label="Navegação principal">
              <NavigationItems links={links} />
            </nav>
            {auth.enabled && (
              <button
                className="theme-toggle"
                type="button"
                onClick={auth.logout}
                aria-label="Sair"
                title="Sair"
              >
                <i className="bi bi-box-arrow-left" aria-hidden="true" />
              </button>
            )}
            {navbarThemeToggle}
          </div>
        </div>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}
