from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.auth.password import hash_password
from app.models.role import Role
from app.models.user import User


DEFAULT_ROLES = {
    "admin": "Full system administration access",
    "manager": "Team and operational management access",
    "employee": "Standard enterprise workspace access",
    "viewer": "Read-only workspace access",
}


def normalize_email(email: str) -> str:
    return email.strip().lower()


def get_role_by_name(
    db: Session,
    role_name: str,
) -> Role | None:
    statement = select(Role).where(
        Role.name == role_name.strip().lower()
    )

    return db.scalar(statement)


def seed_default_roles(db: Session) -> None:
    for role_name, description in DEFAULT_ROLES.items():
        existing_role = get_role_by_name(
            db=db,
            role_name=role_name,
        )

        if existing_role is None:
            db.add(
                Role(
                    name=role_name,
                    description=description,
                )
            )

    db.commit()


def get_user_by_email(
    db: Session,
    email: str,
) -> User | None:
    statement = (
        select(User)
        .options(joinedload(User.role))
        .where(User.email == normalize_email(email))
    )

    return db.scalar(statement)


def get_user_by_id(
    db: Session,
    user_id: int,
) -> User | None:
    statement = (
        select(User)
        .options(joinedload(User.role))
        .where(User.id == user_id)
    )

    return db.scalar(statement)


def create_user(
    db: Session,
    full_name: str,
    email: str,
    password: str,
    role_name: str = "employee",
) -> User:
    role = get_role_by_name(
        db=db,
        role_name=role_name,
    )

    if role is None:
        raise ValueError(
            f"Role '{role_name}' does not exist."
        )

    user = User(
        full_name=full_name.strip(),
        email=normalize_email(email),
        hashed_password=hash_password(password),
        role_id=role.id,
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    created_user = get_user_by_id(
        db=db,
        user_id=user.id,
    )

    if created_user is None:
        raise RuntimeError(
            "User was created but could not be retrieved."
        )

    return created_user