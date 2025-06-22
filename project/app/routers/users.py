from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.repositories import get_user_by_username, create_user
from app.schemas import UserCreate, UserResponse
from app.db import get_db
from app.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/users", tags=["Пользователи"])


# === Регистрация пользователя ===
@router.post("/signup/", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Проверка на существующего пользователя
    db_user = get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Пользователь уже существует")

    # Проверка длины имени и пароля
    if len(user.username) < 3:
        raise HTTPException(status_code=422, detail="Имя должно быть не менее 3 символов")

    if len(user.password) < 8:
        raise HTTPException(status_code=422, detail="Пароль должен быть не менее 8 символов")

    # Создаём нового пользователя
    return create_user(db=db, user=user)


# === Получение данных текущего пользователя ===
@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user