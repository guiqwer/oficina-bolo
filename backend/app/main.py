from fastapi import Depends, FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .auth import require_user
from .database import get_db, sync_schema

sync_schema()

app = FastAPI(title="oficina-bolo", description="Sistema de oficina do bolo para cadastro de usuários e receitas de bolo, incluindo autenticação Keycloak.")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/usuarios", response_model=list[schemas.UsuarioRead], tags=["Usuario"])
def list_usuario(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), _user: dict = Depends(require_user)):
    return crud.list_usuario(db, skip=skip, limit=limit)


@app.post("/api/usuarios", response_model=schemas.UsuarioRead, status_code=status.HTTP_201_CREATED, tags=["Usuario"])
def create_usuario(payload: schemas.UsuarioCreate, db: Session = Depends(get_db), _user: dict = Depends(require_user)):
    return crud.create_usuario(db, payload)


@app.get("/api/usuarios/{item_id}", response_model=schemas.UsuarioRead, tags=["Usuario"])
def get_usuario(item_id: int, db: Session = Depends(get_db), _user: dict = Depends(require_user)):
    return crud.get_usuario(db, item_id)


@app.put("/api/usuarios/{item_id}", response_model=schemas.UsuarioRead, tags=["Usuario"])
def update_usuario(item_id: int, payload: schemas.UsuarioUpdate, db: Session = Depends(get_db), _user: dict = Depends(require_user)):
    return crud.update_usuario(db, item_id, payload)


@app.delete("/api/usuarios/{item_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Usuario"])
def delete_usuario(item_id: int, db: Session = Depends(get_db), _user: dict = Depends(require_user)):
    crud.delete_usuario(db, item_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@app.get("/api/receitas-bolo", response_model=list[schemas.ReceitaBoloRead], tags=["ReceitaBolo"])
def list_receitaBolo(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), _user: dict = Depends(require_user)):
    return crud.list_receitaBolo(db, skip=skip, limit=limit)


@app.post("/api/receitas-bolo", response_model=schemas.ReceitaBoloRead, status_code=status.HTTP_201_CREATED, tags=["ReceitaBolo"])
def create_receitaBolo(payload: schemas.ReceitaBoloCreate, db: Session = Depends(get_db), _user: dict = Depends(require_user)):
    return crud.create_receitaBolo(db, payload)


@app.get("/api/receitas-bolo/{item_id}", response_model=schemas.ReceitaBoloRead, tags=["ReceitaBolo"])
def get_receitaBolo(item_id: int, db: Session = Depends(get_db), _user: dict = Depends(require_user)):
    return crud.get_receitaBolo(db, item_id)


@app.put("/api/receitas-bolo/{item_id}", response_model=schemas.ReceitaBoloRead, tags=["ReceitaBolo"])
def update_receitaBolo(item_id: int, payload: schemas.ReceitaBoloUpdate, db: Session = Depends(get_db), _user: dict = Depends(require_user)):
    return crud.update_receitaBolo(db, item_id, payload)


@app.delete("/api/receitas-bolo/{item_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["ReceitaBolo"])
def delete_receitaBolo(item_id: int, db: Session = Depends(get_db), _user: dict = Depends(require_user)):
    crud.delete_receitaBolo(db, item_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
