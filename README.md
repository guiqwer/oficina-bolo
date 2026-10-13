# oficina-bolo

Quero um sistema de oficina do bolo onde temos o cadastro de usuarios e eu consigo cadastrar receitas de bolo.

## Estrutura

- `backend/` — API FastAPI
- `frontend/` — App React

## Deploy no PDC Deploy

O único `docker-compose.yml`, na raiz do monorepo, sobe toda a stack sem publicar portas no host.
Na criação do projeto, selecione o serviço público `web` e a porta `80`.
Antes do primeiro deploy, cadastre as variáveis de `.env.example` no ambiente.
O Nginx público encaminha `/api` para o backend e `/auth` para o Keycloak pela rede interna.
