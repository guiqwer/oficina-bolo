# Oficina do Bolo

Frontend React (Vite + TypeScript).

## Estrutura

```
src/
├── lib/api.ts          # cliente HTTP base
├── services/           # um service por recurso (CRUD), conexão com a API
├── components/         # componentes reutilizáveis (um por arquivo)
└── pages/              # uma página por entrada do YAML
```

## Rodar localmente

```bash
npm install
npm run dev
```

As chamadas usam `window.__API_BASE__` (em `public/config.js`) para apontar
para a API do backend.
