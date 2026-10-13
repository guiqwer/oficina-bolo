import React from "react";
import { Pencil, RefreshCw, Save, Trash2, X } from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export interface Column {
  key: string;
  label?: string;
}

export interface EditField {
  name: string;
  label?: string;
  type?: string;
  readOnly?: boolean;
  relation?: {
    endpoint?: string;
    valueKey?: string;
    labelKey?: string;
  };
}

type RelationLoaders = Record<string, () => Promise<unknown[]>>;
type Row = Record<string, unknown>;

function successToast(title = "Salvo com sucesso!") {
  const isDark = typeof document !== "undefined" && (
    document.documentElement.getAttribute("data-theme") === "dark" ||
    document.documentElement.dataset?.theme === "dark" ||
    document.body?.getAttribute("data-theme") === "dark" ||
    document.body?.dataset?.theme === "dark" ||
    document.documentElement.getAttribute("data-swal2-theme") === "dark" ||
    (typeof window !== "undefined" && (
      window.localStorage.getItem("theme") === "dark" ||
      (!window.localStorage.getItem("theme") && Boolean(window.matchMedia?.("(prefers-color-scheme: dark)").matches))
    ))
  );
  const themeClass = isDark ? "swal-theme-dark" : "swal-theme-light";
  const theme = isDark ? "dark" : "light";
  const bg = isDark ? "#171b25" : "#ffffff";
  const fg = isDark ? "#f4f7fb" : "#0f172a";
  void Swal.fire({
    toast: true,
    backdrop: false,
    position: "top-end",
    icon: "success",
    title,
    background: bg,
    color: fg,
    showConfirmButton: false,
    timer: 3000,
    customClass: {
      popup: "swal-app-popup swal-app-toast " + themeClass,
      title: "swal-app-toast-title",
    },
    didOpen: (popup) => {
      popup.setAttribute("data-theme", theme);
      popup.setAttribute("data-swal-theme", theme);
      popup.style.setProperty("background", bg, "important");
      popup.style.setProperty("background-color", bg, "important");
      popup.style.setProperty("color", fg, "important");
      popup.style.setProperty("box-shadow", "none", "important");
      popup.style.setProperty("-webkit-box-shadow", "none", "important");
      popup.style.setProperty("filter", "none", "important");
      const titleEl = popup.querySelector(".swal2-title, .swal-app-toast-title");
      if (titleEl) {
        (titleEl as HTMLElement).style.setProperty("color", fg, "important");
      }
      const container = popup.closest(".swal2-container");
      if (container) {
        (container as HTMLElement).style.setProperty("background", "transparent", "important");
        (container as HTMLElement).style.setProperty("background-color", "transparent", "important");
        (container as HTMLElement).style.setProperty("box-shadow", "none", "important");
        (container as HTMLElement).style.setProperty("-webkit-box-shadow", "none", "important");
        (container as HTMLElement).style.setProperty("backdrop-filter", "none", "important");
        (container as HTMLElement).style.setProperty("filter", "none", "important");
      }
    },
  });
}

export function DataTable(props: {
  load: () => Promise<unknown>;
  columns: Column[];
  idKey?: string;
  fields?: EditField[];
  relationLoaders?: RelationLoaders;
  reloadToken?: unknown;
  onUpdate?: (id: string | number, body: Record<string, unknown>) => Promise<unknown>;
  onDelete?: (id: string | number) => Promise<unknown>;
}) {
  const idKey = props.idKey ?? "id";
  const canEdit = Boolean(props.onUpdate);
  const canDelete = Boolean(props.onDelete);
  const hasActions = canEdit || canDelete;

  const editFields: EditField[] = React.useMemo(
    () =>
      props.fields && props.fields.length > 0
        ? props.fields.filter((field) => !field.readOnly)
        : props.columns
            .filter((c) => c.key !== idKey)
            .map((c) => ({ name: c.key, label: c.label })),
    [idKey, props.columns, props.fields],
  );

  const [rows, setRows] = React.useState<Row[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [editingId, setEditingId] = React.useState<string | number | null>(null);
  const [draft, setDraft] = React.useState<Record<string, string>>({});
  const [busy, setBusy] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [relationOptions, setRelationOptions] = React.useState<Record<string, Row[]>>({});
  const [relationLoading, setRelationLoading] = React.useState<Record<string, boolean>>({});
  const [selectedCard, setSelectedCard] = React.useState<Row | null>(null);
  const [cardEditing, setCardEditing] = React.useState(false);
  const imageField = editFields.find((field) => field.type === "image");
  const usesImageCards = Boolean(imageField);

  const reload = React.useCallback(() => {
    setLoading(true);
    return props
      .load()
      .then((data) => {
        setRows(Array.isArray(data) ? (data as Row[]) : []);
        setError(null);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [props.load]);

  // Um único useEffect — chama reload ao montar e quando props.load mudar
  React.useEffect(() => {
    void reload();
  }, [reload, props.reloadToken]);

  const relationFields = React.useMemo(
    () => editFields.filter((field) => field.relation && props.relationLoaders?.[field.name]),
    [editFields, props.relationLoaders],
  );

  React.useEffect(() => {
    let alive = true;
    for (const field of relationFields) {
      const load = props.relationLoaders?.[field.name];
      if (!load) continue;
      setRelationLoading((current) => ({ ...current, [field.name]: true }));
      void load()
        .then((items) => {
          if (!alive) return;
          setRelationOptions((current) => ({
            ...current,
            [field.name]: Array.isArray(items) ? (items as Row[]) : [],
          }));
        })
        .catch(() => {
          if (!alive) return;
          setRelationOptions((current) => ({ ...current, [field.name]: [] }));
        })
        .finally(() => {
          if (!alive) return;
          setRelationLoading((current) => ({ ...current, [field.name]: false }));
        });
    }
    return () => {
      alive = false;
    };
  }, [props.relationLoaders, relationFields]);

  const startEdit = (row: Row) => {
    const next: Record<string, string> = {};
    for (const f of editFields) {
      const v = row[f.name];
      next[f.name] = inputValueForField(f, v);
    }
    setDraft(next);
    setEditingId(row[idKey] as string | number);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({});
  };

  const saveEdit = async (id: string | number) => {
    if (!props.onUpdate) return;
    setBusy(true);
    try {
      await props.onUpdate(id, buildPayload());
      cancelEdit();
      await reload();
      successToast("Atualizado com sucesso!");
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string | number) => {
    if (!props.onDelete) return;
    const isDark = typeof document !== "undefined" && (
      document.documentElement.getAttribute("data-theme") === "dark" ||
      document.documentElement.dataset?.theme === "dark" ||
      document.body?.getAttribute("data-theme") === "dark" ||
      document.body?.dataset?.theme === "dark" ||
      document.documentElement.getAttribute("data-swal2-theme") === "dark" ||
      (typeof window !== "undefined" && (
        window.localStorage.getItem("theme") === "dark" ||
        (!window.localStorage.getItem("theme") && Boolean(window.matchMedia?.("(prefers-color-scheme: dark)").matches))
      ))
    );
    const themeClass = isDark ? "swal-theme-dark" : "swal-theme-light";
    const theme = isDark ? "dark" : "light";
    const bg = isDark ? "#171b25" : "#ffffff";
    const fg = isDark ? "#f4f7fb" : "#0f172a";
    const result = await Swal.fire({
      title: "Excluir registro?",
      text: "Esta ação não poderá ser desfeita.",
      icon: "warning",
      background: bg,
      color: fg,
      showCancelButton: true,
      confirmButtonText: "Excluir",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: "swal-app-popup " + themeClass,
        confirmButton: "swal-confirm-button",
        cancelButton: "swal-cancel-button",
      },
      didOpen: (popup) => {
        popup.setAttribute("data-theme", theme);
        popup.setAttribute("data-swal-theme", theme);
        popup.style.setProperty("background", bg, "important");
        popup.style.setProperty("background-color", bg, "important");
        popup.style.setProperty("color", fg, "important");
        const titleEl = popup.querySelector(".swal2-title, .swal-app-toast-title");
        if (titleEl) {
          (titleEl as HTMLElement).style.setProperty("color", fg, "important");
        }
        const container = popup.closest(".swal2-container");
        if (container) {
          container.setAttribute("data-theme", theme);
          container.setAttribute("data-swal-theme", theme);
        }
      },
    });
    if (!result.isConfirmed) return;
    setBusy(true);
    try {
      await props.onDelete(id);
      await reload();
      await Swal.fire({
        title: "Registro excluído",
        text: "A tabela foi atualizada com sucesso.",
        icon: "success",
        background: bg,
        color: fg,
        confirmButtonText: "OK",
        customClass: {
          popup: "swal-app-popup " + themeClass,
          confirmButton: "swal-confirm-button",
        },
        didOpen: (popup) => {
          popup.setAttribute("data-theme", theme);
          popup.setAttribute("data-swal-theme", theme);
          popup.style.setProperty("background", bg, "important");
          popup.style.setProperty("background-color", bg, "important");
          popup.style.setProperty("color", fg, "important");
          const titleEl = popup.querySelector(".swal2-title, .swal-app-toast-title");
          if (titleEl) {
            (titleEl as HTMLElement).style.setProperty("color", fg, "important");
          }
          const container = popup.closest(".swal2-container");
          if (container) {
            container.setAttribute("data-theme", theme);
            container.setAttribute("data-swal-theme", theme);
          }
        },
      });
    } catch (e) {
      setError(String(e));
      await Swal.fire({
        title: "Não foi possível excluir",
        text: e instanceof Error ? e.message : String(e),
        icon: "error",
        background: bg,
        color: fg,
        confirmButtonText: "OK",
        customClass: {
          popup: "swal-app-popup " + themeClass,
          confirmButton: "swal-confirm-button",
        },
        didOpen: (popup) => {
          popup.setAttribute("data-theme", theme);
          popup.setAttribute("data-swal-theme", theme);
          popup.style.setProperty("background", bg, "important");
          popup.style.setProperty("background-color", bg, "important");
          popup.style.setProperty("color", fg, "important");
          const titleEl = popup.querySelector(".swal2-title, .swal-app-toast-title");
          if (titleEl) {
            (titleEl as HTMLElement).style.setProperty("color", fg, "important");
          }
          const container = popup.closest(".swal2-container");
          if (container) {
            container.setAttribute("data-theme", theme);
            container.setAttribute("data-swal-theme", theme);
          }
        },
      });
    } finally {
      setBusy(false);
    }
  };

  const visibleRows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      props.columns.some((column) =>
        String(row[column.key] ?? "").toLowerCase().includes(q),
      ),
    );
  }, [props.columns, query, rows]);

  const relationValue = (field: EditField, row: Row): string => {
    const key = field.relation?.valueKey ?? "id";
    const value = row[key];
    return value == null ? "" : String(value);
  };

  const relationLabel = (field: EditField, row: Row): string => {
    const preferred = [
      field.relation?.labelKey,
      "titulo",
      "title",
      "nome",
      "name",
      "descricao",
      "description",
      "email",
      "codigo",
      "code",
    ].filter(Boolean) as string[];
    for (const key of preferred) {
      const value = row[key];
      if (typeof value === "string" && value.trim()) return value;
    }
    const fallback = row[field.relation?.valueKey ?? "id"];
    return fallback == null ? "Registro sem título" : String(fallback);
  };

  const relationFieldFor = (key: string): EditField | undefined =>
    editFields.find((field) => field.name === key && field.relation);

  const buildPayload = (): Record<string, unknown> => {
    const body: Record<string, unknown> = {};
    for (const field of editFields) {
      const raw = draft[field.name];
      if (raw == null || raw === "") {
        continue;
      } else if (field.type === "checkbox") {
        body[field.name] = raw === "true";
      } else if (field.type === "date") {
        body[field.name] = dateToIso(raw);
      } else if (field.type === "number" || field.relation) {
        const parsed = Number(raw);
        body[field.name] = Number.isNaN(parsed) ? raw : parsed;
      } else {
        body[field.name] = field.type === "image" ? raw.replace(/^data:[^;]+;base64,/, "") : raw;
      }
    }
    return body;
  };

  const inputValueForField = (field: EditField, value: unknown): string => {
    if (value == null) return "";
    if (field.type !== "date") return String(value);
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
    return date.toISOString().slice(0, 10);
  };

  const dateToIso = (value: string): string => {
    const date = new Date(value.includes("T") ? value : value + "T00:00:00");
    return Number.isNaN(date.getTime()) ? value : date.toISOString();
  };

  const renderCellContent = (value: unknown, key: string) => {
    const str = value == null ? "" : String(value);
    const relationField = relationFieldFor(key);
    if (relationField) {
      const match = (relationOptions[key] ?? []).find(
        (option) => relationValue(relationField, option) === str,
      );
      return match ? relationLabel(relationField, match) : str;
    }
    const keyLower = key.toLowerCase();

    // Formata campos de status/ativo com badges coloridos
    if (
      keyLower === "status" ||
      keyLower === "ativo" ||
      keyLower === "active" ||
      keyLower === "situacao" ||
      keyLower === "situacão" ||
      keyLower === "role"
    ) {
      const strLower = str.toLowerCase();
      let badgeCls = "badge-default";
      if (/(ativo|active|pago|sucesso|concluido|concluído|finalizado|sim|yes|true|ok|admin)/.test(strLower)) {
        badgeCls = "badge-success";
      } else if (/(pendente|espera|processando|aguardando|em analise|warning|user)/.test(strLower)) {
        badgeCls = "badge-warning";
      } else if (/(inativo|cancelado|erro|falha|recusado|excluido|nao|não|false|no)/.test(strLower)) {
        badgeCls = "badge-danger";
      }
      return <span className={`badge ${badgeCls}`}>{str}</span>;
    }

    return str;
  };

  const imageSource = (value: unknown) => {
    const raw = value == null ? "" : String(value);
    if (!raw) return "";
    return raw.startsWith("data:") || raw.startsWith("http") ? raw : `data:image/*;base64,${raw}`;
  };

  const openCard = (row: Row) => {
    setSelectedCard(row);
    setCardEditing(false);
  };

  const beginCardEdit = () => {
    if (!selectedCard) return;
    startEdit(selectedCard);
    setCardEditing(true);
  };
  const chooseCardImage = (name: string, file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setDraft((current) => ({ ...current, [name]: String(reader.result ?? "") }));
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="table-wrap loading-state" aria-live="polite" aria-busy="true">
        <div className="skeleton-line" style={{ maxWidth: "92%" }} />
        <div className="skeleton-line" style={{ maxWidth: "86%" }} />
        <div className="skeleton-line" style={{ maxWidth: "78%" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="table-wrap error-state" role="alert">
        <p className="empty-state-title">Não foi possível carregar os dados</p>
        <p className="empty-state-desc">{error}</p>
        <button className="btn btn-outline btn-sm" type="button" onClick={reload}>
          <RefreshCw size={16} aria-hidden="true" /> Tentar Novamente
        </button>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="table-wrap empty-state">
        <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v4.5m16 0h-3.586a1 1 0 00-.707.293l-1.414 1.414a1 1 0 01-.707.293h-2.122a1 1 0 01-.707-.293l-1.414-1.414a1 1 0 00-.707-.293H4"
          />
        </svg>
        <h3 className="empty-state-title">Nenhum registro encontrado</h3>
        <p className="empty-state-desc">
          Ainda não há dados salvos para este recurso. Use o formulário de cadastro para adicionar novos itens.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="toolbar">
        <input
          className="toolbar-search"
          aria-label="Buscar registros"
          placeholder="Buscar registros"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <span className="toolbar-meta">
          {visibleRows.length} de {rows.length} registro{rows.length === 1 ? "" : "s"}
        </span>
      </div>
      {visibleRows.length === 0 ? (
        <div className="table-wrap empty-state">
          <h3 className="empty-state-title">Nenhum resultado encontrado</h3>
          <p className="empty-state-desc">
            Ajuste a busca ou limpe o termo para visualizar todos os registros.
          </p>
          <button className="btn btn-outline btn-sm" type="button" onClick={() => setQuery("")}>
            <X size={16} aria-hidden="true" /> Limpar busca
          </button>
        </div>
      ) : (
        usesImageCards ? (
          <>
            <div className="image-card-grid">
              {visibleRows.map((row, index) => {
                const titleField = props.columns.find((column) => column.key !== imageField?.name);
                const previewFields = props.columns.filter((column) => column.key !== imageField?.name).slice(0, 3);
                return <article className="image-card" key={(row[idKey] as React.Key) ?? index} role="button" tabIndex={0} onClick={() => openCard(row)} onKeyDown={(event) => event.key === "Enter" && openCard(row)}>
                  {imageSource(row[imageField?.name ?? ""]) ? <img className="image-card-media" src={imageSource(row[imageField?.name ?? ""])} alt={titleField ? String(row[titleField.key] ?? "Imagem do registro") : "Imagem do registro"} /> : <div className="image-card-media" aria-label="Imagem não cadastrada" />}
                  <div className="image-card-body"><h3 className="image-card-title">{titleField ? String(row[titleField.key] ?? "Registro") : "Registro"}</h3><div className="image-card-meta">{previewFields.map((column) => <span key={column.key}><strong>{column.label ?? column.key}:</strong> {String(row[column.key] ?? "—")}</span>)}</div></div>
                </article>;
              })}
            </div>
            {selectedCard && <div className="dialog-overlay" role="presentation" onMouseDown={() => !busy && setSelectedCard(null)}><section className="dialog-content" role="dialog" aria-modal="true" aria-label="Detalhes do registro" onMouseDown={(event) => event.stopPropagation()}>
              <div className="dialog-header"><h2 className="dialog-title">{cardEditing ? "Editar registro" : "Detalhes do registro"}</h2><button className="btn btn-outline btn-sm" type="button" onClick={() => setSelectedCard(null)} aria-label="Fechar"><X size={18} /></button></div>
              {cardEditing ? <div className="form-grid">{editFields.map((field) => <label className="field" key={field.name}><span className="field-label">{field.label ?? field.name}</span>{field.type === "image" ? <><input type="file" accept="image/*" onChange={(event) => chooseCardImage(field.name, event.target.files?.[0])} />{draft[field.name] && <img className="image-card-media" src={imageSource(draft[field.name])} alt="Prévia da imagem" />}</> : <input type={field.type === "date" ? "date" : "text"} value={draft[field.name] ?? ""} onChange={(event) => setDraft((current) => ({ ...current, [field.name]: event.target.value }))} />}</label>)}</div> : <div className="image-card-meta">{imageField && imageSource(selectedCard[imageField.name]) && <img className="image-card-media" src={imageSource(selectedCard[imageField.name])} alt="Imagem do registro" />}{props.columns.map((column) => column.key !== imageField?.name && <p key={column.key}><strong>{column.label ?? column.key}:</strong> {String(selectedCard[column.key] ?? "—")}</p>)}</div>}
              <div className="dialog-actions">{cardEditing ? <><button className="btn btn-outline" type="button" onClick={() => setCardEditing(false)}>Cancelar</button><button className="btn btn-primary" type="button" disabled={busy} onClick={() => { const id = selectedCard[idKey] as string | number; void saveEdit(id).then(() => setSelectedCard(null)); }}><Save size={16} /> Salvar</button></> : <>{canEdit && <button className="btn btn-secondary" type="button" onClick={beginCardEdit}><Pencil size={16} /> Editar</button>}{canDelete && <button className="btn btn-outline" type="button" disabled={busy} onClick={() => { const id = selectedCard[idKey] as string | number; void remove(id).then(() => setSelectedCard(null)); }}><Trash2 size={16} /> Excluir</button>}</>}</div>
            </section></div>}
          </>
        ) : <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                {props.columns.map((c) => (
                  <th key={c.key}>{c.label ?? c.key}</th>
                ))}
                {hasActions && <th>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, i) => {
            const id = row[idKey] as string | number;
            const isEditing = editingId != null && id === editingId;
            return (
              <tr key={(id as React.Key) ?? i}>
                {props.columns.map((c) => {
                  const relationField = relationFieldFor(c.key);
                  const editableField = editFields.find((f) => f.name === c.key);
                  const editable =
                    isEditing &&
                    c.key !== idKey &&
                    Boolean(editableField);
                  return (
                    <td key={c.key}>
                      {editable && relationField ? (
                        <div className="relation-picker relation-picker-compact">
                          <select
                            className="table-input"
                            value={draft[c.key] ?? ""}
                            disabled={relationLoading[c.key] || (relationOptions[c.key] ?? []).length === 0}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, [c.key]: e.target.value }))
                            }
                          >
                            <option value="">
                              {relationLoading[c.key]
                                ? "Carregando..."
                                : (relationOptions[c.key] ?? []).length === 0
                                  ? "Sem opções"
                                  : "Selecione"}
                            </option>
                            {(relationOptions[c.key] ?? []).map((option) => {
                              const value = relationValue(relationField, option);
                              return (
                                <option key={value} value={value}>
                                  {relationLabel(relationField, option)}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      ) : editable ? (
                        <input
                          className="table-input"
                          type={editableField?.type === "date" ? "date" : "text"}
                          value={draft[c.key] ?? ""}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, [c.key]: e.target.value }))
                          }
                        />
                      ) : (
                        renderCellContent(row[c.key], c.key)
                      )}
                    </td>
                  );
                })}
                {hasActions && (
                  <td className="row-actions">
                    {isEditing ? (
                      <>
                        <button
                          className="btn btn-primary btn-sm"
                          type="button"
                          disabled={busy}
                          onClick={() => void saveEdit(id)}
                        >
                          <Save size={16} aria-hidden="true" /> Salvar
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          type="button"
                          disabled={busy}
                          onClick={cancelEdit}
                        >
                          <X size={16} aria-hidden="true" /> Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        {canEdit && (
                          <button
                            className="btn btn-secondary btn-sm"
                            type="button"
                            disabled={busy}
                            onClick={() => startEdit(row)}
                          >
                            <Pencil size={16} aria-hidden="true" /> Editar
                          </button>
                        )}
                        {canDelete && (
                          <button
                            className="btn btn-outline btn-sm"
                            type="button"
                            disabled={busy}
                            onClick={() => void remove(id)}
                          >
                            <Trash2 size={16} aria-hidden="true" /> Excluir
                          </button>
                        )}
                      </>
                    )}
                  </td>
                )}
              </tr>
            );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
