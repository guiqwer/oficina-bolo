import React from "react";
import { ArrowRight, Database, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

export interface ResourceOverviewItem {
  label: string;
  to: string;
  load: () => Promise<unknown[]>;
}

export function ResourceOverview({ resources }: { resources: ResourceOverviewItem[] }) {
  const [counts, setCounts] = React.useState<Record<string, number>>({});
  const [loading, setLoading] = React.useState<Record<string, boolean>>({});
  const [errors, setErrors] = React.useState<Record<string, boolean>>({});

  const refresh = React.useCallback((item: ResourceOverviewItem) => {
    setLoading((current) => ({ ...current, [item.label]: true }));
    setErrors((current) => ({ ...current, [item.label]: false }));
    return item
      .load()
      .then((rows) => {
        setCounts((current) => ({
          ...current,
          [item.label]: Array.isArray(rows) ? rows.length : 0,
        }));
      })
      .catch(() => {
        setErrors((current) => ({ ...current, [item.label]: true }));
      })
      .finally(() => {
        setLoading((current) => ({ ...current, [item.label]: false }));
      });
  }, []);

  React.useEffect(() => {
    for (const item of resources) void refresh(item);
  }, [refresh, resources]);

  if (resources.length === 0) return null;

  return (
    <section className="resource-overview" aria-label="Módulos do sistema">
      {resources.map((item) => {
        const isLoading = loading[item.label];
        const hasError = errors[item.label];
        return (
          <article className="resource-card" key={item.to}>
            <div className="resource-card-main">
              <span className="resource-icon" aria-hidden="true">
                <Database size={20} />
              </span>
              <div>
                <h2 className="resource-title">{item.label}</h2>
                <p className="resource-meta">
                  {isLoading
                    ? "Atualizando..."
                    : hasError
                      ? "Não foi possível carregar"
                      : counts[item.label] === 1
                        ? "1 registro"
                        : String(counts[item.label] ?? 0) + " registros"}
                </p>
              </div>
            </div>
            <div className="resource-actions">
              <button
                className="icon-btn"
                type="button"
                onClick={() => void refresh(item)}
                aria-label={"Atualizar " + item.label}
                title="Atualizar"
              >
                <RefreshCw size={16} />
              </button>
              <Link className="btn btn-primary btn-sm" to={item.to}>
                Acessar <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </article>
        );
      })}
    </section>
  );
}
