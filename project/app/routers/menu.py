from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.repositories import get_menu_by_date, get_dish
from app.schemas import MenuResponse
from app.dependencies import get_current_user, get_db

router = APIRouter(prefix="/menu", tags=["Меню"])

@router.get("/", response_model=list[MenuResponse])
def read_menu(
    date_filter: str = Query(None, alias="date"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    menu_items = get_menu_by_date(db, date_filter)

    if not menu_items:
        print("Меню пустое")
        return []

    result = []
    for item in menu_items:
        if item.dish:
            result.append({
                "id": item.id,
                "date": item.date,
                "dish_id": item.dish_id,
                "name": item.dish.name,
                "description": item.dish.description,
                "price": item.dish.price
            })

    return result