"""
CLI task runner — run migrations, seed data, etc.
Usage: uv run python -m app.runner <command>
"""
import asyncio
import sys


async def create_super_admin():
    """Create the initial Super Admin user."""
    from app.db.database import AsyncSessionLocal
    from app.crud.crud_user import crud_user
    from app.models.user import UserRole

    email = input("Super Admin email: ")
    password = input("Super Admin password: ")
    full_name = input("Super Admin full name: ")

    async with AsyncSessionLocal() as db:
        existing = await crud_user.get_by_email(db, email)
        if existing:
            print(f"User {email} already exists.")
            return
        user = await crud_user.create(db, email, password, full_name, UserRole.SUPER_ADMIN)
        await db.commit()
        print(f"✅ Super Admin created: {user.email} (id={user.id})")


if __name__ == "__main__":
    command = sys.argv[1] if len(sys.argv) > 1 else "help"
    if command == "create-super-admin":
        asyncio.run(create_super_admin())
    else:
        print("Available commands: create-super-admin")
