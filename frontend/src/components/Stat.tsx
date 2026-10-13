import React from "react";

export function Stat(props: { value: string; label?: string; style?: React.CSSProperties }) {
  return (
    <div className="stat" style={props.style}>
      <div className="stat-value">{props.value}</div>
      {props.label && <div className="stat-label">{props.label}</div>}
    </div>
  );
}
