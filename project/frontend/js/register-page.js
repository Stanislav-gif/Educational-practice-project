import { showNotification } from "./utils/notification.js";

document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  // Валидация данных на клиенте
  if (!name || name.length < 3) {
    showNotification("Имя должно быть не менее 3 символов", false);
    document.getElementById("status").textContent = "Ошибка: имя слишком короткое";
    return;
  }

  if (!password || password.length < 8) {
    showNotification("Пароль должен быть не менее 8 символов", false);
    document.getElementById("status").textContent = "Ошибка: пароль слишком короткий";
    return;
  }

  try {
    const response = await fetch("http://localhost:5500/users/signup/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: name, password, role })
    });

    let errorData = null;
    try {
      errorData = await response.json(); // Пытаемся получить JSON-ответ
    } catch (jsonError) {
      errorData = { detail: "Не удалось разобрать ответ от сервера" };
    }

    if (!response.ok) {
      showNotification(errorData.detail || "Ошибка регистрации", false);
      document.getElementById("status").textContent = errorData.detail || "Неизвестная ошибка";
      return;
    }

    const result = await response.json();
    showNotification("Пользователь успешно зарегистрирован!", true);
    document.getElementById("status").textContent = "Вы зарегистрированы!";
    
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);

  } catch (err) {
    console.error("Ошибка сети:", err);
    showNotification("Не удалось подключиться к серверу", false);
    document.getElementById("status").textContent = "Ошибка сети. Попробуйте позже.";
  }
});