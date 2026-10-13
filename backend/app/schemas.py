from base64 import b64encode
from datetime import date
from pydantic import AliasChoices, BaseModel, ConfigDict, EmailStr, Field, field_serializer, field_validator



def _decode_binary(value: object) -> object:
    """Aceita base64 puro, com quebras de linha ou em data URI do navegador."""
    if not isinstance(value, str):
        return value
    text = value.strip()
    if text.startswith("data:"):
        text = text.split(",", 1)[-1]
    return "".join(text.split())


class UsuarioBase(BaseModel):

    nome: str = Field(..., validation_alias=AliasChoices("nome", "nome"), serialization_alias="nome")
    email: EmailStr = Field(..., validation_alias=AliasChoices("email", "email"), serialization_alias="email")
    senha: str = Field(..., validation_alias=AliasChoices("senha", "senha"), serialization_alias="senha")


class UsuarioCreate(UsuarioBase):
    pass


class UsuarioUpdate(BaseModel):

    nome: str | None = None
    email: EmailStr | None = None
    senha: str | None = None


class UsuarioRead(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    nome: str = Field(..., validation_alias=AliasChoices("nome", "nome"), serialization_alias="nome")
    email: EmailStr = Field(..., validation_alias=AliasChoices("email", "email"), serialization_alias="email")
    senha: str = Field(..., validation_alias=AliasChoices("senha", "senha"), serialization_alias="senha")
    dataCadastro: date | None = Field(None, validation_alias=AliasChoices("data_cadastro", "dataCadastro"), serialization_alias="dataCadastro")



class ReceitaBoloBase(BaseModel):
    model_config = ConfigDict(val_json_bytes="base64")


    nome: str = Field(..., validation_alias=AliasChoices("nome", "nome"), serialization_alias="nome")
    descricao: str = Field(..., validation_alias=AliasChoices("descricao", "descricao"), serialization_alias="descricao")
    ingredientes: str = Field(..., validation_alias=AliasChoices("ingredientes", "ingredientes"), serialization_alias="ingredientes")
    modoPreparo: str = Field(..., validation_alias=AliasChoices("modo_preparo", "modoPreparo"), serialization_alias="modoPreparo")
    imagem: bytes = Field(..., validation_alias=AliasChoices("imagem", "imagem"), serialization_alias="imagem")
    usuarioId: int = Field(..., validation_alias=AliasChoices("usuarioId", "usuario_id"), serialization_alias="usuarioId")

    @field_validator("imagem", mode="before")
    @classmethod
    def _normalize_binary(cls, value: object) -> object:
        return _decode_binary(value)


class ReceitaBoloCreate(ReceitaBoloBase):
    pass


class ReceitaBoloUpdate(BaseModel):
    model_config = ConfigDict(val_json_bytes="base64")


    nome: str | None = None
    descricao: str | None = None
    ingredientes: str | None = None
    modoPreparo: str | None = None
    imagem: bytes | None = None
    usuarioId: int | None = None

    @field_validator("imagem", mode="before")
    @classmethod
    def _normalize_binary(cls, value: object) -> object:
        return _decode_binary(value)


class ReceitaBoloRead(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    nome: str = Field(..., validation_alias=AliasChoices("nome", "nome"), serialization_alias="nome")
    descricao: str = Field(..., validation_alias=AliasChoices("descricao", "descricao"), serialization_alias="descricao")
    ingredientes: str = Field(..., validation_alias=AliasChoices("ingredientes", "ingredientes"), serialization_alias="ingredientes")
    modoPreparo: str = Field(..., validation_alias=AliasChoices("modo_preparo", "modoPreparo"), serialization_alias="modoPreparo")
    imagem: bytes = Field(..., validation_alias=AliasChoices("imagem", "imagem"), serialization_alias="imagem")
    usuarioId: int = Field(..., validation_alias=AliasChoices("usuarioId", "usuario_id"), serialization_alias="usuarioId")

    @field_serializer("imagem", when_used="json")
    def _serialize_binary(self, value: bytes | None) -> str | None:
        return None if value is None else b64encode(value).decode()

