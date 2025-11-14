# Запуск и развертывание приложения

Данный репозиторий содержит всё необходимое для локального запуска созданного нами веб-приложения.

## 🚀 Локальный запуск

**Требования:**  
- Node.js (актуальная LTS-версия)  
- Аккаунт Firebase (для аутентификации)  

---

## 1. Установка зависимостей

```bash
npm install

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Configure Firebase Authentication:
   - Create a Firebase project and enable **Email/Password** auth.
   - Copy the Web app config values into `.env.local` (`FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, etc.).
4. Run the app:
   `npm run dev`
