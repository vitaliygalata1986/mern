import express from 'express';
// Именованные импорты контроллеров: каждый обрабатывает свой HTTP-запрос.
import {
  createPosts,
  getPosts,
  getPostById,
  deletePostById,
  updatePostById,
} from '../controllers/PostsControllers.js';

// Router() создаёт отдельный маршрутизатор, который подключается в index.js.
const router = express.Router();

// GET /api/posts: список сообщений из MongoDB, сначала новые.
router.get('/', getPosts);

// GET /api/posts/:id: поиск сообщения; контроллер проверяет id и наличие документа.
router.get('/:id', getPostById);

// POST /api/posts: создание сообщения из полей text и author в JSON-теле.
router.post('/', createPosts);

// PATCH /api/posts/:id: обновление сообщения с проверками по схеме модели.
router.patch('/:id', updatePostById);

// DELETE /api/posts/:id: удаление сообщения с возвратом удалённого документа.
router.delete('/:id', deletePostById);

export default router;

/*
Подробное объяснение routes.js

Этот файл связывает HTTP-методы и пути с функциями контроллера.
Запросы к MongoDB и формирование ответов находятся в PostsControllers.js,
а схема данных — в models/PostsModel.js.
Текущий интерфейс использует GET /api/posts из Home и POST /api/posts из PostForm.
Маршруты чтения одного поста, изменения и удаления доступны в API,
но в компонентах фронтенда вызовы этих трёх маршрутов пока не реализованы.

1. express.Router()
   Создаёт отдельный маршрутизатор. Он не слушает порт самостоятельно:
   в index.js его подключают через app.use('/api/posts', routes), а HTTP-сервер
   запускается вызовом app.listen() после подключения к MongoDB.
   Поэтому '/' здесь означает /api/posts, а '/:id' — /api/posts/:id.

2. Импорт контроллеров
   Фигурные скобки в import означают именованные импорты функций,
   экспортированных из controllers/PostsControllers.js.
   В router.get('/', getPosts) передаём саму функцию, без скобок getPosts().
   Express вызовет её при запросе и передаст req и res:
   req содержит данные запроса, res позволяет отправить ответ клиенту.

3. GET /api/posts → getPosts
   Контроллер читает сообщения через Posts.find().sort({ createdAt: -1 }).
   Ответ со статусом 200 — массив документов, от новых к старым.
   Если коллекция пустая, возвращается [], а не ошибка 404.

4. GET /api/posts/:id → getPostById
   :id — параметр пути, доступный контроллеру в req.params.id.
   Сначала проверяется формат ObjectId, затем выполняется поиск в MongoDB.
   Успех: 200 и документ; неверный формат: 400; документ не найден: 404.
   Корректный формат идентификатора сам по себе не гарантирует наличие записи.

5. POST /api/posts → createPosts
   express.json() из index.js заранее разбирает JSON-тело запроса.
   Пример с Content-Type: application/json:
   { "text": "Привет", "author": "Анна" }.
   Контроллер передаёт text и author в Posts.create(), остальные поля
   из тела при создании не используются. Успех: 200 и созданный документ.
   Оба поля обязательны по схеме; автор берётся из запроса, авторизации нет.

6. PATCH /api/posts/:id → updatePostById
   Контроллер проверяет id и передаёт поля тела в findByIdAndUpdate().
   Например, { "text": "Новый текст" } обновляет текст сообщения.
   Опция new: true возвращает документ после изменения, а runValidators: true
   включает проверки обновления по схеме. Успех: 200 и обновлённый документ.
   Неверный формат id даёт 400, отсутствие документа — 404.

7. DELETE /api/posts/:id → deletePostById
   Контроллер проверяет id и удаляет документ через findByIdAndDelete().
   Успех: 200 и { message: 'Post deleted successfully', post: ... },
   где post — удалённый документ. Неверный id даёт 400, отсутствие — 404.

8. export default router
   Экспортируем настроенный маршрутизатор по умолчанию. В index.js он
   импортируется под именем routes; имя при таком импорте можно выбирать.

Все маршруты работают с MongoDB через контроллеры и модель Posts.
Ошибки операций внутри try контроллеры возвращают со статусом 400
в виде { error: error.message }. Это текущее общее поведение и для ошибок
валидации, и для ошибок базы. Подробности обработки описаны в контроллере.
*/
