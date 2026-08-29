from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.crud_user import crud_user
from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token
from app.core.exceptions import UnauthorizedException, ConflictException, BadRequestException
from app.models.user import User, UserRole
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse


class AuthService:
    async def register(self, db: AsyncSession, data: RegisterRequest) -> User:
        existing = await crud_user.get_by_email(db, data.email)
        if existing:
            raise ConflictException("Email already registered")
        user = await crud_user.create(db, data.email, data.password, data.full_name, data.role)
        return user

    async def login(self, db: AsyncSession, data: LoginRequest) -> TokenResponse:
        user = await crud_user.get_by_email(db, data.email)
        if not user or not verify_password(data.password, user.password_hash):
            raise UnauthorizedException("Invalid email or password")
        if not user.is_active:
            raise UnauthorizedException("Account is deactivated")
        token_data = {"sub": str(user.id), "role": user.role.value}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        return TokenResponse(access_token=access_token, refresh_token=refresh_token)

    async def refresh(self, db: AsyncSession, refresh_token: str) -> TokenResponse:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise UnauthorizedException("Invalid refresh token")
        user_id = payload.get("sub")
        user = await crud_user.get(db, int(user_id))
        if not user or not user.is_active:
            raise UnauthorizedException("User not found or inactive")
        token_data = {"sub": str(user.id), "role": user.role.value}
        access_token = create_access_token(token_data)
        new_refresh = create_refresh_token(token_data)
        return TokenResponse(access_token=access_token, refresh_token=new_refresh)


auth_service = AuthService()
