import React from "react";

export interface ChartProps {
  title?: string;
  type?: "line" | "bar";
  labels?: string[];
  data?: number[];
  style?: React.CSSProperties;
}

export function Chart({
  title,
  type = "line",
  labels = [],
  data = [],
  style,
}: ChartProps) {
  if (data.length === 0 || labels.length === 0) {
    return (
      <div className="card chart-container" style={style}>
        {title && <h4 className="card-title" style={{ marginBottom: "8px" }}>{title}</h4>}
        <div className="empty-state">
          <h3 className="empty-state-title">Dados indisponíveis</h3>
          <p className="empty-state-desc">
            Este gráfico só será exibido quando houver dados retornados pelo backend.
          </p>
        </div>
      </div>
    );
  }

  const maxVal = Math.max(...data, 1);
  const minVal = 0;
  const range = maxVal - minVal;

  const width = 500;
  const height = 200;
  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Calcula os pontos (x, y) no SVG
  const points = data.map((val, idx) => {
    const x = paddingLeft + (idx / (data.length - 1 || 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((val - minVal) / range) * chartHeight;
    return { x, y, value: val };
  });

  const pathD = points.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    "",
  );

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : "";

  return (
    <div className="card chart-container" style={style}>
      {title && <h4 className="card-title" style={{ marginBottom: "8px" }}>{title}</h4>}
      <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
        <defs>
          <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Linhas de Grade de Y */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = paddingTop + ratio * chartHeight;
          const val = Math.round(maxVal - ratio * range);
          return (
            <g key={i}>
              <line
                className="chart-grid-line"
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
              />
              <text
                className="chart-label"
                x={paddingLeft - 8}
                y={y + 4}
                textAnchor="end"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Eixo X */}
        <line
          className="chart-axis-line"
          x1={paddingLeft}
          y1={paddingTop + chartHeight}
          x2={width - paddingRight}
          y2={paddingTop + chartHeight}
        />

        {/* Rótulos do Eixo X */}
        {labels.map((lbl, idx) => {
          const x = paddingLeft + (idx / (labels.length - 1 || 1)) * chartWidth;
          return (
            <text
              key={idx}
              className="chart-label"
              x={x}
              y={height - 5}
              textAnchor="middle"
            >
              {lbl}
            </text>
          );
        })}

        {/* Renderização do Gráfico */}
        {type === "line" ? (
          <>
            <path className="chart-area" d={areaD} />
            <path className="chart-line" d={pathD} />
            {points.map((p, idx) => (
              <circle
                key={idx}
                className="chart-point"
                cx={p.x}
                cy={p.y}
                r="5"
                title={`${labels[idx]}: ${p.value}`}
              />
            ))}
          </>
        ) : (
          points.map((p, idx) => {
            const barWidth = Math.max(8, (chartWidth / data.length) * 0.6);
            const x = p.x - barWidth / 2;
            const barHeight = paddingTop + chartHeight - p.y;
            return (
              <rect
                key={idx}
                className="chart-bar"
                x={x}
                y={p.y}
                width={barWidth}
                height={Math.max(2, barHeight)}
                title={`${labels[idx]}: ${p.value}`}
              />
            );
          })
        )}
      </svg>
    </div>
  );
}
