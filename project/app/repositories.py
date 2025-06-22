from datetime import date, datetime
from sqlalchemy.orm import Session
from app.models import User, Dish, Menu, Order, OrderItem
from app.schemas import DishCreate, UserCreate
from app.core.security import get_password_hash
from sqlalchemy.orm import joinedload

# Пользователи
def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)

    db_user = User(
        username=user.username,
        hashed_password=hashed_password,
        role=user.role
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
# Блюда
def get_dish(db: Session, dish_id: int):
    return db.query(Dish).filter(Dish.id == dish_id).first()

def get_dishes(db: Session):
    return db.query(Dish).all()

def create_dish(db: Session, dish: DishCreate):
    db_dish = Dish(**dish.model_dump())
    db.add(db_dish)
    db.commit()
    db.refresh(db_dish)
    return db_dish

# Меню 
def add_dish_to_menu(db: Session, date, dish_id):
    db_menu_item = Menu(date=date, dish_id=dish_id)
    db.add(db_menu_item)
    db.commit()
    db.refresh(db_menu_item)
    return db_menu_item

def get_menu_by_date(db: Session, date_str: str):
    if not date_str:
        return []

    try:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        return db.query(Menu).options(joinedload(Menu.dish)).filter(Menu.date == date_obj).all()
    except ValueError:
        return []
def create_order(db: Session, user_id: int, items: list):
    db_order = Order(user_id=user_id, date=date.today(), status="new")
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    for item in items:
        db_item = OrderItem(
            order_id=db_order.id,
            dish_id=item.dish_id,
            quantity=item.quantity
        )
        db.add(db_item)
    db.commit()

    db_order = db.query(Order).options(joinedload(Order.items)).get(db_order.id)
    return db_order

def get_orders_by_user(db: Session, user_id: int):
    return db.query(Order).options(joinedload(Order.items)).filter(Order.user_id == user_id).all()

# Возвращает список всех блюд из базы данных
def get_all_dishes(db: Session):
    return db.query(Dish).all()