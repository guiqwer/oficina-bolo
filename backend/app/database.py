import os
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////data/app.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def sync_schema() -> None:
    """Cria as tabelas e acrescenta colunas que ainda não existam.

    O preview reaproveita o volume de dados entre um deploy e outro, então uma
    tabela criada por uma versão anterior do modelo continua lá sem os campos
    novos — e todo INSERT quebraria com "no such column".
    """
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    for table in Base.metadata.sorted_tables:
        existing = {column["name"] for column in inspector.get_columns(table.name)}
        missing = [column for column in table.columns if column.name not in existing]
        if not missing:
            continue
        with engine.begin() as connection:
            for column in missing:
                column_type = column.type.compile(engine.dialect)
                connection.execute(
                    text(f'ALTER TABLE "{table.name}" ADD COLUMN "{column.name}" {column_type}')
                )
