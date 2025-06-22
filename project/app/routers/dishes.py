from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas import DishCreate, DishResponse
from app.repositories import create_dish, add_dish_to_menu, get_all_dishes
from app.dependencies import get_current_active_admin

router = APIRouter(prefix="/dishes", tags=["Блюда"])

# Добавление нового блюда
@router.post("/", response_model=DishResponse)
def add_dish(
    dish: DishCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_admin)
):
    # Создаём блюдо
    new_dish = create_dish(db=db, dish=dish)
    # Добавляем в меню, если указана дата
    if dish.date:
        try:
            add_dish_to_menu(db=db, date=dish.date, dish_id=new_dish.id)

        except Exception as e:
            raise HTTPException(status_code=500, detail="Не удалось добавить блюдо в меню")

    return new_dish


# Получение всех блюд 
@router.get("/", response_model=list[DishResponse])
def read_dishes(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_admin)
):
    dishes = get_all_dishes(db=db)
    if not dishes:
        raise HTTPException(status_code=404, detail="Блюда не найдены")
    return dishes