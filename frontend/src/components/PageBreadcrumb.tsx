import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export function PageBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;

  return (
    <nav className="breadcrumb shadcn-breadcrumb" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        <li className="breadcrumb-item">
          <Link className="breadcrumb-link" to="/">
            <Home size={15} aria-hidden="true" />
            Início
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li className="breadcrumb-item" key={item.to ?? item.label}>
              <ChevronRight className="breadcrumb-separator" size={15} aria-hidden="true" />
              {item.to && !isLast ? (
                <Link className="breadcrumb-link" to={item.to}>
                  {item.label}
                </Link>
              ) : (
                <span className="breadcrumb-current">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
