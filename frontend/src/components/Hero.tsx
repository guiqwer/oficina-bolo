import React from "react";

export function Hero(props: { title: string; subtitle?: string; style?: React.CSSProperties }) {
  return (
    <section className="hero" style={props.style}>
      <h1 className="hero-title">{props.title}</h1>
      {props.subtitle && <p className="hero-subtitle">{props.subtitle}</p>}
    </section>
  );
}
