# MERN: React, Express и MongoDB Atlas

Один репозиторий содержит `front/` (React/Vite) и `server/` (Express/Mongoose).
После сборки Express отдаёт React и `/api/posts` с одного адреса.

Нужен Node.js 22.12 или новее в ветке 22.x. Команды ниже выполняются из корня
репозитория. Зависимости приложений остаются в своих папках и lock-файлах.

## Локальный запуск

1. Установите зависимости: `npm run install:all`.
2. Если `server/.env` ещё не создан, скопируйте `server/.env.example` в
   `server/.env`. Укажите свою строку Atlas в `MONGO`, сохранив имя текущей базы.
   Существующий `.env` заменять не нужно.
3. Соберите React: `npm run build`.
4. Запустите приложение: `npm start`.
5. Откройте `http://localhost:5000`, если в `.env` указан `PORT=5000`.
   Без `PORT` сервер использует порт 4000. API доступно по `/api/posts`.

Для разработки запускайте `npm run dev:server` и `npm run dev:front` в двух
терминалах. Vite перенаправляет `/api` на `localhost:5000`, поэтому серверу
для такого режима нужен `PORT=5000`.

## Render: один Web Service

Настройки подготовлены по [документации Render](https://render.com/docs/deploy-node-express-app).
Сначала изменения должны попасть в нужную ветку GitHub.

| Поле | Значение |
| --- | --- |
| Service Type | Web Service |
| Language | Node |
| Root Directory | Оставить пустым: сервису нужны и `front/`, и `server/` |
| Build Command | `npm run install:all && npm run build` |
| Start Command | `npm start` |
| Instance Type | Free |

В Environment добавьте `MONGO` со строкой подключения к существующей базе Atlas
и `NODE_ENV=production`. `PORT` вручную задавать не требуется.
Версию Node.js Render выберет по `engines` в корневом `package.json`.

В Atlas Network Access разрешите исходящие IP-диапазоны созданного сервиса
Render (Connect → Outbound). Локальный IP компьютера не разрешает доступ с Render.
Пользователю базы нужны права чтения и записи в текущую базу.

Строка `MONGO` с паролем остаётся в Environment и не попадает в GitHub или React.
Переносить данные из уже используемой Atlas не требуется.

После публикации проверьте `/`, загрузку файлов `/assets/` и JSON по
`/api/posts`. Создание, редактирование и удаление проверяйте на отдельной
тестовой записи, затем обновите страницу и убедитесь, что результат сохранился.

Бесплатный Render [засыпает после 15 минут без входящего трафика](https://render.com/docs/free).
Первый запрос после простоя может ждать запуска примерно минуту.
