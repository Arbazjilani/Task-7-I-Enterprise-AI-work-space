from getpass import getpass

from sqlalchemy.exc import IntegrityError

from app.database import SessionLocal
from app.services.user_service import (
    create_user,
    get_user_by_email,
    seed_default_roles,
)


def main() -> None:
    print("\nCreate Enterprise Copilot Administrator\n")

    full_name = input("Full name: ").strip()
    email = input("Email: ").strip().lower()
    password = getpass("Password: ")
    confirm_password = getpass("Confirm password: ")

    if len(full_name) < 2:
        print("Full name must contain at least 2 characters.")
        return

    if len(password) < 8:
        print("Password must contain at least 8 characters.")
        return

    if password != confirm_password:
        print("Passwords do not match.")
        return

    with SessionLocal() as db:
        seed_default_roles(db)

        existing_user = get_user_by_email(
            db=db,
            email=email,
        )

        if existing_user is not None:
            print("A user with this email already exists.")
            return

        try:
            user = create_user(
                db=db,
                full_name=full_name,
                email=email,
                password=password,
                role_name="admin",
            )

        except (ValueError, IntegrityError) as error:
            db.rollback()
            print(f"Could not create administrator: {error}")
            return

        print("\nAdministrator created successfully.")
        print(f"ID: {user.id}")
        print(f"Name: {user.full_name}")
        print(f"Email: {user.email}")
        print(f"Role: {user.role.name}")


if __name__ == "__main__":
    main()