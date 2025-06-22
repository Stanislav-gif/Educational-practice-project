from sqlalchemy.orm import Session
from .repositories import create_dish

def create_dish_service(db: Session, dish_data):
    return create_dish(db=db, dish=dish_data)