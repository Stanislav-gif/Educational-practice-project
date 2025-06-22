export function showNotification(message, isSuccess = true) {
  const notificationContainer = document.getElementById("notification-container");
  if (!notificationContainer) {
    console.warn("Элемент #notification-container не найден");
    return;
  }

  const notification = notificationContainer.querySelector(".notification");
  if (!notification) {
    console.warn("Элемент .notification не найден");
    return;
  }

  const messageSpan = notification.querySelector(".message");
  if (!messageSpan) {
    console.warn("Элемент .message не найден");
    return;
  }

  // Обновляем текст
  messageSpan.textContent = message;

  // Обновляем стили
  notification.classList.remove("success", "error");
  notification.classList.add(isSuccess ? "success" : "error");

  // Показываем уведомление
  notification.classList.remove("hidden");
  notification.style.display = "flex";

  // Скрываем через 3 секунды
  setTimeout(() => {
    notification.classList.add("hidden");
    setTimeout(() => {
      notification.style.display = "none";
    }, 300);
  }, 3000);

  // Добавляем обработчик закрытия по крестику
  const closeBtn = notification.querySelector(".close-btn");
  if (closeBtn && !closeBtn.hasAttribute("data-listener-added")) {
    closeBtn.setAttribute("data-listener-added", "true"); // Защита от дублирования обработчика
    closeBtn.addEventListener("click", () => {
      notification.classList.add("hidden");
      setTimeout(() => {
        notification.style.display = "none";
      }, 300);
    });
  }
}