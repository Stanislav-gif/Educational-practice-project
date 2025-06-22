import { API_URL } from "/frontend/js/config.js";
import { showNotification } from "/frontend/js/utils/notification.js";

document.addEventListener("DOMContentLoaded", () => {
  // Тестовое уведомление при загрузке страницы
  showNotification("Добро пожаловать!", true);

  const form = document.getElementById("date-form");
  const container = document.getElementById("menu-container");

  if (!form || !container) return;

  // Обработчик формы выбора даты
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dateInput = document.getElementById("filter-date");
    const date = dateInput.value;

    if (!date) {
      container.innerHTML = "<p>Выберите дату</p>";
      showNotification("Пожалуйста, выберите дату", false);
      return;
    }

    const formattedDate = new Date(date).toISOString().split("T")[0];
    await loadMenu(formattedDate, container);
  });
  // Автоматически загружаем меню на сегодня при открытии страницы
  const today = new Date().toISOString().split("T")[0];
  loadMenu(today, container);
});

// Загрузка меню по дате
async function loadMenu(date, container) {
  try {
    console.log("Отправляю запрос к серверу:", `${API_URL}/menu/?date=${date}`);

    const token = localStorage.getItem("access_token");

    const res = await fetch(`${API_URL}/menu/?date=${date}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Статус ответа:", res.status);

    if (!res.ok) {
      throw new Error(`Ошибка загрузки: ${res.status}`);
    }

    const menuItems = await res.json();
    console.log("Полученные записи меню:", menuItems);
    console.log("Ответ от сервера:", menuItems);

    container.innerHTML = "";

    if (!Array.isArray(menuItems) || menuItems.length === 0) {
      container.innerHTML = "<p>На эту дату нет блюд в меню</p>";
      showNotification("На эту дату нет блюд", false);
      return;
    }

    // Отрисовываем каждое блюдо
    menuItems.forEach((item) => {
      const dish = {
        name: item.name || "Не указано",
        description: item.description || "Нет описания",
        dish_id: item.dish_id || "—",
        price: item.price !== undefined ? `${item.price} ₽` : "Не указана",
      };

      const dishDiv = document.createElement("div");
      dishDiv.className = "dish-card";

      // Создаём элементы карточки
      dishDiv.innerHTML = `
        <h3>${dish.name}</h3>
        <p>${dish.description}</p>
        <p><strong>ID:</strong> ${dish.dish_id}</p>
        <p><strong>Цена:</strong> ${dish.price}</p>

        <!-- Блок управления количеством -->
        <div class="quantity-control">
          <button class="qty-btn minus">-</button>
          <input type="number" class="quantity-input" value="1" min="1" />
          <button class="qty-btn plus">+</button>
        </div>

        <button class="order-btn">Заказать</button>
        <hr>
      `;

      // Находим элементы внутри карточки
      const qtyInput = dishDiv.querySelector(".quantity-input");
      const btnMinus = dishDiv.querySelector(".qty-btn.minus");
      const btnPlus = dishDiv.querySelector(".qty-btn.plus");
      const orderBtn = dishDiv.querySelector(".order-btn");

      // Логика кнопок + / -
      btnMinus.addEventListener("click", () => {
        let current = parseInt(qtyInput.value);
        if (current > 1) qtyInput.value = current - 1;
      });

      btnPlus.addEventListener("click", () => {
        let current = parseInt(qtyInput.value);
        qtyInput.value = current + 1;
      });

      // Логика кнопки "Заказать"
      orderBtn.addEventListener("click", () => {
        const quantity = parseInt(qtyInput.value);
        if (quantity < 1) {
          showNotification("Количество должно быть не меньше 1", false);
          return;
        }
        addToOrder(item.dish_id, quantity);
      });

      // Добавляем карточку в контейнер
      container.appendChild(dishDiv);
    });

    console.log("Меню успешно загружено");

  } catch (err) {
    console.error("Ошибка при загрузке меню:", err);
    container.innerHTML = "<p>Не удалось загрузить меню</p>";
    showNotification("Не удалось загрузить меню", false);
  }
}

// Функция добавления блюда в заказ
async function addToOrder(dish_id, quantity) {
  const token = localStorage.getItem("access_token");
  if (!token) {
    showNotification("Вы не авторизованы", false);
    window.location.href = "/frontend/login.html";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/orders/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ items: [{ dish_id, quantity }] }),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    showNotification("Блюдо добавлено в заказ", true);

  } catch (err) {
    console.error("Ошибка при оформлении заказа:", err);
    showNotification("Не удалось оформить заказ", false);
  }
}