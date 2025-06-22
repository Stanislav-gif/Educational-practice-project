import { API_URL } from "/frontend/js/config.js";
import { showNotification } from "/frontend/js/utils/notification.js";

// Загрузка списка блюд
async function loadDishes(containerId = "dishes-container") {
  const token = localStorage.getItem("access_token");

  if (!token) {
    console.warn("Токен отсутствует");
    document.getElementById(containerId).textContent = "Вы не авторизованы.";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/dishes/`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error(`Ошибка загрузки: ${res.status}`);
    }

    const dishes = await res.json();
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    if (!Array.isArray(dishes) || dishes.length === 0) {
      container.textContent = "Нет доступных блюд";
      return;
    }

    dishes.forEach(dish => {
      const dishDiv = document.createElement("div");
      dishDiv.className = "dish-card";
      dishDiv.innerHTML = `
        <p><strong>ID:</strong> ${dish.id}</p>
        <p><strong>Название:</strong> ${dish.name}</p>
        <p><strong>Описание:</strong> ${dish.description}</p>
        <p><strong>Цена:</strong> ${dish.price} ₽</p>
        <p><strong>Дата:</strong> ${dish.date || "Не указана"}</p>
        <hr>
      `;
      container.appendChild(dishDiv);
    });

    console.log("Блюда успешно загружены");

  } catch (err) {
    console.error("Ошибка при загрузке блюд:", err);
    const container = document.getElementById(containerId);
    if (container) {
      container.textContent = "Не удалось загрузить блюда";
    }
  }
}

// Обработчик формы добавления блюда
async function handleAddDish(e) {
  e.preventDefault();

  const name = document.getElementById("dish-name").value.trim();
  const description = document.getElementById("dish-description").value.trim();
  const price = parseFloat(document.getElementById("dish-price").value);
  const date = document.getElementById("dish-date").value;

  if (!name || !description || isNaN(price) || !date) {
    showNotification("Пожалуйста, заполните все поля корректно.", false);
    return;
  }

  const token = localStorage.getItem("access_token");
  if (!token) {
    showNotification("Вы не авторизованы", false);
    window.location.href = "/frontend/login.html";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/dishes/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ name, description, price, date })
    });

    if (!res.ok) {
      const errorText = await res.text();
      showNotification("Ошибка при добавлении блюда", false);
      throw new Error(errorText);
    }

    showNotification("Блюдо успешно добавлено", true);

    document.getElementById("add-dish-form").reset();
    loadDishes("dishes-container");

  } catch (err) {
    console.error("Ошибка при добавлении блюда:", err);
    showNotification("Не удалось добавить блюдо", false);
  }
}

// Функция добавления блюда в заказ (заглушка)
function addToOrder(dish_id, quantity) {
  console.log(`Добавляем в заказ: блюдо ID=${dish_id}, кол-во=${quantity}`);
}

document.addEventListener("DOMContentLoaded", async () => {
  if (typeof checkUserRole === "function") {
    await checkUserRole(); // проверяем роль пользователя
  }

  loadDishes("dishes-container"); // загружаем список блюд

  // Обработчик формы создания блюда
  const form = document.getElementById("add-dish-form");
  if (form) {
    form.addEventListener("submit", handleAddDish);
  }
});