import { Route, Routes, Navigate } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { BRAND_LOGO_URL } from "./brand";
import UsuariosPage from "./pages/UsuariosPage";
import ReceitaBolosPage from "./pages/ReceitaBolosPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <AppShell brand={`Oficina do Bolo`} logoUrl={BRAND_LOGO_URL} links={[{"label":"Início","to":"/"},{"label":"Usuarios","to":"/usuarios"},{"label":"ReceitaBolos","to":"/receitas-bolo"}]} layout="sidebar">
      <Routes>
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/receitas-bolo" element={<ReceitaBolosPage />} />
          <Route path="/" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
