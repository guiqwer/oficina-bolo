from datetime import date
from sqlalchemy import Date, ForeignKey, Integer, LargeBinary, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    nome: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    senha: Mapped[str] = mapped_column(String(255), nullable=False)
    data_cadastro: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    receita_bolos = relationship("ReceitaBolo")


class ReceitaBolo(Base):
    __tablename__ = "receitas_bolo"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    nome: Mapped[str] = mapped_column(String(255), nullable=False)
    descricao: Mapped[str] = mapped_column(String(255), nullable=False)
    ingredientes: Mapped[str] = mapped_column(String(255), nullable=False)
    modo_preparo: Mapped[str] = mapped_column(String(255), nullable=False)
    imagem: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    usuario_id: Mapped[int] = mapped_column("usuario_id", Integer, ForeignKey("usuarios.id"), nullable=False)
    usuario = relationship("Usuario")
