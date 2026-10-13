import { Hero, ResourceOverview, PageBreadcrumb } from "../components";
import { usuariosService } from "../services/usuarios.service";
import { receitasboloService } from "../services/receitasbolo.service";

export default function DashboardPage() {

  return (
    <div className="page">

      <PageBreadcrumb items={[{ label: `Oficina do Bolo` }]} />

      <Hero title={`Bem-vindo à Oficina do Bolo!`} subtitle={`Sistema para cadastro de usuários e receitas de bolo. Utilize o menu ao lado para acessar todas as funcionalidades.`} />
      <ResourceOverview resources={[{ label: "Usuarios", to: "/usuarios", load: usuariosService.list }, { label: "ReceitaBolos", to: "/receitas-bolo", load: receitasboloService.list }]} />
    </div>
  );
}
