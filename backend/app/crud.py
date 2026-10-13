from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from . import models, schemas


def _save(db: Session, item):
    """Erro de integridade é dado inválido do cliente, não falha do servidor."""
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=f"Não foi possível salvar: {exc.orig}",
        ) from exc
    db.refresh(item)
    return item


def list_usuario(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Usuario).offset(skip).limit(limit).all()


def get_usuario(db: Session, item_id: int):
    item = db.get(models.Usuario, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Usuario not found")
    return item


def create_usuario(db: Session, payload: schemas.UsuarioCreate):
    data = {
        "nome": payload.nome,
        "email": payload.email,
        "senha": payload.senha,
    }
    item = models.Usuario(**data)
    db.add(item)
    return _save(db, item)


def update_usuario(db: Session, item_id: int, payload: schemas.UsuarioUpdate):
    item = get_usuario(db, item_id)
    data = payload.model_dump(exclude_unset=True)
    if "nome" in data:
        item.nome = data["nome"]
    if "email" in data:
        item.email = data["email"]
    if "senha" in data:
        item.senha = data["senha"]
    return _save(db, item)


def delete_usuario(db: Session, item_id: int):
    item = get_usuario(db, item_id)
    db.delete(item)
    db.commit()
    return None


def list_receitaBolo(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ReceitaBolo).offset(skip).limit(limit).all()


def get_receitaBolo(db: Session, item_id: int):
    item = db.get(models.ReceitaBolo, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="ReceitaBolo not found")
    return item


def create_receitaBolo(db: Session, payload: schemas.ReceitaBoloCreate):
    data = {
        "nome": payload.nome,
        "descricao": payload.descricao,
        "ingredientes": payload.ingredientes,
        "modo_preparo": payload.modoPreparo,
        "imagem": payload.imagem,
        "usuario_id": payload.usuarioId,
    }
    item = models.ReceitaBolo(**data)
    db.add(item)
    return _save(db, item)


def update_receitaBolo(db: Session, item_id: int, payload: schemas.ReceitaBoloUpdate):
    item = get_receitaBolo(db, item_id)
    data = payload.model_dump(exclude_unset=True)
    if "nome" in data:
        item.nome = data["nome"]
    if "descricao" in data:
        item.descricao = data["descricao"]
    if "ingredientes" in data:
        item.ingredientes = data["ingredientes"]
    if "modoPreparo" in data:
        item.modo_preparo = data["modoPreparo"]
    if "imagem" in data:
        item.imagem = data["imagem"]
    if "usuarioId" in data:
        item.usuario_id = data["usuarioId"]
    return _save(db, item)


def delete_receitaBolo(db: Session, item_id: int):
    item = get_receitaBolo(db, item_id)
    db.delete(item)
    db.commit()
    return None
