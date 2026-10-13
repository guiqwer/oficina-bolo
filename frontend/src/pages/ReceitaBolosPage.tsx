import { DataTable, ApiForm, PageBreadcrumb } from "../components";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { receitasboloService } from "../services/receitasbolo.service";
import { usuariosService } from "../services/usuarios.service";

export default function ReceitaBolosPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [createTheme, setCreateTheme] = useState<"light" | "dark">(() => {
    if (typeof document === "undefined") return "light";
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark" ||
      document.documentElement.dataset?.theme === "dark" ||
      document.body?.getAttribute("data-theme") === "dark" ||
      document.body?.dataset?.theme === "dark" ||
      document.documentElement.getAttribute("data-swal2-theme") === "dark" ||
      (typeof window !== "undefined" && window.localStorage.getItem("theme") === "dark");
    return isDark ? "dark" : "light";
  });
  const [reloadToken, setReloadToken] = useState(0);
  const openCreateDialog = () => {
    const active = (typeof document !== "undefined" && (
      document.documentElement.getAttribute("data-theme") === "dark" ||
      document.documentElement.dataset?.theme === "dark" ||
      document.body?.getAttribute("data-theme") === "dark" ||
      document.body?.dataset?.theme === "dark" ||
      document.documentElement.getAttribute("data-swal2-theme") === "dark" ||
      (typeof window !== "undefined" && (
        window.localStorage.getItem("theme") === "dark" ||
        (!window.localStorage.getItem("theme") && Boolean(window.matchMedia?.("(prefers-color-scheme: dark)").matches))
      ))
    )) ? "dark" : "light";
    setCreateTheme(active);
    setCreateOpen(true);
  };
  const closeCreateDialog = () => setCreateOpen(false);


  return (
    <div className="page">

      <PageBreadcrumb items={[{ label: `Listagem de ReceitaBolos` }]} />

      <header className="page-header">
        <div>
          <h1 className="page-title">{`Listagem de ReceitaBolos`}</h1>
        </div>
      </header>
      <p style={{ margin: "-18px 0 20px 0" }}>{`Gerencie receitabolos cadastrados, revise status e execute ações recorrentes.`}</p>
      <div className="page-actions">
        <button className="btn btn-primary" type="button" onClick={openCreateDialog}>
          <Plus size={16} aria-hidden="true" />
          Adicionar
        </button>
      </div>
      <DataTable load={receitasboloService.list} reloadToken={reloadToken} columns={[{"key":"nome","label":"Nome"},{"key":"descricao","label":"Descrição"},{"key":"ingredientes","label":"Ingredientes"},{"key":"modoPreparo","label":"Modo de Preparo"},{"key":"imagem","label":"Imagem"},{"key":"usuarioId","label":"Usuário"}]} idKey={"id"} fields={[{"name":"nome","label":"Nome","type":"text","required":true,"readOnly":false},{"name":"descricao","label":"Descrição","type":"textarea","required":true,"readOnly":false},{"name":"ingredientes","label":"Ingredientes","type":"textarea","required":true,"readOnly":false},{"name":"modoPreparo","label":"Modo de Preparo","type":"textarea","required":true,"readOnly":false},{"name":"imagem","label":"Imagem","type":"image","required":true,"readOnly":false},{"name":"usuarioId","label":"Usuário","type":"number","required":true,"readOnly":false,"relation":{"endpoint":"/api/usuarios","valueKey":"id","labelKey":"nome"}}]} relationLoaders={{ "usuarioId": usuariosService.list }} onUpdate={receitasboloService.update} onDelete={receitasboloService.remove} />
      {createOpen && createPortal(
        <div className="dialog-overlay" data-theme={createTheme} role="presentation" onClick={closeCreateDialog}>
          <section
            className="dialog-content shadcn-dialog"
            data-theme={createTheme}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="dialog-header">
              <div>
                <h2 id="create-dialog-title" className="dialog-title">Adicionar</h2>
                <p className="dialog-description">Preencha os dados para criar um novo registro.</p>
              </div>
              <button className="icon-btn" type="button" onClick={closeCreateDialog} aria-label="Fechar">
                <X size={16} aria-hidden="true" />
              </button>
            </header>
            <ApiForm
              submit={receitasboloService.create}
              fields={[{"name":"nome","label":"Nome","type":"text","required":true,"readOnly":false},{"name":"descricao","label":"Descrição","type":"textarea","required":true,"readOnly":false},{"name":"ingredientes","label":"Ingredientes","type":"textarea","required":true,"readOnly":false},{"name":"modoPreparo","label":"Modo de Preparo","type":"textarea","required":true,"readOnly":false},{"name":"imagem","label":"Imagem","type":"image","required":true,"readOnly":false},{"name":"usuarioId","label":"Usuário","type":"number","required":true,"readOnly":false,"relation":{"endpoint":"/api/usuarios","valueKey":"id","labelKey":"nome"}}]}
              submitLabel="Adicionar"
              relationLoaders={{ "usuarioId": usuariosService.list }}
              onSuccess={() => {
                setCreateOpen(false);
                setReloadToken((value) => value + 1);
              }}
            />
          </section>
        </div>,
        document.body
      )}
    </div>
  );
}
