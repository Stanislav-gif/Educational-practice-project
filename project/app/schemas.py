from pydantic import BaseModel
from typing import List, Optional
from datetime import date

# Блюда 
class DishCreate(BaseModel):
    name: str
    description: str
    price: float
    date: date 

class DishResponse(DishCreate):
    id: int

    class Config:
        from_attributes = True

# Меню 
class MenuCreate(BaseModel):
    dish_id: int
    date: date

class MenuResponse(BaseModel):
    id: int
    date: date
    dish_id: int
    name: str
    description: str
    price: float

    class Config:
        from_attributes = True


# Заказы
class OrderItemCreate(BaseModel):
    dish_id: int
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]

class OrderItemResponse(OrderItemCreate):
    class Config:
        from_attributes = True

class OrderStatus:
    NEW = "new"
    IN_PROCESS = "in_process"
    COMPLETED = "completed"

class OrderResponse(BaseModel):
    id: int
    user_id: int
    date: date
    status: str
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True


# Пользователи
class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "user"

class UserResponse(BaseModel):
    id: int
    username: str
    role: str

    class Config:
        from_attributes = True

# Авторизация
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None


# Обновление статуса заказа
class OrderUpdateStatus(BaseModel):
    new_status: str