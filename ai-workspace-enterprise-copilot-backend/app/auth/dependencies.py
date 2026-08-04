from collections.abc import Callable
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.auth.jwt import decode_access_token
from app.database import get_db
from app.models.user import User
from app.services.user_service import get_user_by_id


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login"
)

DatabaseSession = Annotated[
    Session,
    Depends(get_db),
]

AccessToken = Annotated[
    str,
    Depends(oauth2_scheme),
]


def authentication_error() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    token: AccessToken,
    db: DatabaseSession,
) -> User:
    try:
        payload = decode_access_token(token)

        if payload.get("type") != "access":
            raise authentication_error()

        subject = payload.get("sub")

        if subject is None:
            raise authentication_error()

        user_id = int(subject)

    except (
        jwt.InvalidTokenError,
        ValueError,
        TypeError,
    ) as error:
        raise authentication_error() from error

    user = get_user_by_id(
        db=db,
        user_id=user_id,
    )

    if user is None:
        raise authentication_error()

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This user account is inactive.",
        )

    return user


CurrentUser = Annotated[
    User,
    Depends(get_current_user),
]


def require_roles(
    *allowed_roles: str,
) -> Callable[[CurrentUser], User]:
    normalized_roles = {
        role.strip().lower()
        for role in allowed_roles
    }

    def role_checker(
        current_user: CurrentUser,
    ) -> User:
        if current_user.role.name not in normalized_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You do not have permission "
                    "to perform this action."
                ),
            )

        return current_user

    return role_checker