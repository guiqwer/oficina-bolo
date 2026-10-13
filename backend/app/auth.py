import os
from functools import lru_cache
from typing import Any

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient

bearer = HTTPBearer(auto_error=False)


@lru_cache
def jwks_client() -> PyJWKClient:
    issuer = os.getenv("KEYCLOAK_ISSUER", "http://localhost:8080/realms/pdc-generated").rstrip("/")
    jwks_url = os.getenv("KEYCLOAK_JWKS_URL", f"{issuer}/protocol/openid-connect/certs")
    return PyJWKClient(jwks_url)


def require_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)) -> dict[str, Any]:
    if os.getenv("AUTH_ENABLED", "true") == "false" or os.getenv("AUTH_DISABLED_FOR_TESTS") == "true":
        return {"sub": "test-user"}
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token de acesso ausente")

    token = credentials.credentials
    issuer = os.getenv("KEYCLOAK_ISSUER", "http://localhost:8080/realms/pdc-generated").rstrip("/")
    audience = os.getenv("KEYCLOAK_AUDIENCE", "pdc-generated-api")
    strict = os.getenv("KEYCLOAK_STRICT_VALIDATION") == "true"
    try:
        key = jwks_client().get_signing_key_from_jwt(token).key
        return jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=audience if strict else None,
            issuer=issuer if strict else None,
            options={"verify_exp": True, "verify_aud": strict, "verify_iss": strict},
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token de acesso inválido") from exc
