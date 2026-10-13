import React from "react";

export function Card(props: {
  title?: string;
  subtitle?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  return (
    <div className="card" style={props.style}>
      {props.title && <h3 className="card-title">{props.title}</h3>}
      {props.subtitle && <p className="card-subtitle">{props.subtitle}</p>}
      {props.children}
    </div>
  );
}
