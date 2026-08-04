from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload

from app.auth.dependencies import (
    CurrentUser,
    DatabaseSession,
    require_roles,
)
from app.models.user import User
from app.schemas.user import (
    UserCreateByAdmin,
    UserResponse,
    UserUpdate,
)
from app.services.user_service import (
    create_user,
    get_role_by_name,
    get_user_by_email,
    get_user_by_id,
    normalize_email,
)


router = APIRouter(
    prefix="/api/users",
    tags=["User Management"],
)


AdminUser = Annotated[
    User,
    Depends(require_roles("admin")),
]


AdminOrManager = Annotated[
    User,
    Depends(require_roles("admin", "manager")),
]


@router.get(
    "",
    response_model=list[UserResponse],
)
def list_users(
    db: DatabaseSession,
    _: AdminOrManager,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
) -> list[User]:
    statement = (
        select(User)
        .options(joinedload(User.role))
        .order_by(User.created_at.desc())
        .offset(skip)
        .limit(limit)
    )

    if search:
        search_value = f"%{search.strip().lower()}%"

        statement = statement.where(
            func.lower(User.full_name).like(search_value)
            | func.lower(User.email).like(search_value)
        )

    return list(db.scalars(statement).all())


@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user_by_admin(
    payload: UserCreateByAdmin,
    db: DatabaseSession,
    _: AdminUser,
) -> User:
    existing_user = get_user_by_email(
        db=db,
        email=payload.email,
    )

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )

    try:
        return create_user(
            db=db,
            full_name=payload.full_name,
            email=payload.email,
            password=payload.password,
            role_name=payload.role_name,
        )

    except ValueError as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    except IntegrityError as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        ) from error


@router.get(
    "/{user_id}",
    response_model=UserResponse,
)
def get_user(
    user_id: int,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> User:
    # Employees may view only their own account.
    # Admins and managers may view other accounts.
    if (
        current_user.id != user_id
        and current_user.role.name not in {"admin", "manager"}
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot view this user.",
        )

    user = get_user_by_id(
        db=db,
        user_id=user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    return user


@router.put(
    "/{user_id}",
    response_model=UserResponse,
)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: DatabaseSession,
    _: AdminUser,
) -> User:
    user = get_user_by_id(
        db=db,
        user_id=user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    update_data = payload.model_dump(
        exclude_unset=True
    )

    if "full_name" in update_data:
        user.full_name = update_data["full_name"].strip()

    if "email" in update_data:
        new_email = normalize_email(
            str(update_data["email"])
        )

        existing_user = get_user_by_email(
            db=db,
            email=new_email,
        )

        if (
            existing_user is not None
            and existing_user.id != user.id
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This email is already in use.",
            )

        user.email = new_email

    if "is_active" in update_data:
        user.is_active = update_data["is_active"]

    if "role_name" in update_data:
        role = get_role_by_name(
            db=db,
            role_name=update_data["role_name"],
        )

        if role is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The selected role does not exist.",
            )

        user.role_id = role.id

    try:
        db.commit()
        db.refresh(user)

    except IntegrityError as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The updated user data conflicts with another user.",
        ) from error

    updated_user = get_user_by_id(
        db=db,
        user_id=user.id,
    )

    if updated_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found after update.",
        )

    return updated_user


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def deactivate_user(
    user_id: int,
    db: DatabaseSession,
    current_admin: AdminUser,
) -> None:
    user = get_user_by_id(
        db=db,
        user_id=user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if user.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own account.",
        )

    user.is_active = False

    db.commit()