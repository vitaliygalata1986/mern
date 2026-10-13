import Posts from '../models/PostsModel.js';
// Mongoose нужен для проверки формата ObjectId перед запросами по id.
import mongoose from 'mongoose';

// POST /api/posts: создаём сообщение и возвращаем сохранённый документ.
const createPosts = async (req, res) => {
  // Берём поля из JSON-тела, разобранного express.json() в index.js.
  const { text, author } = req.body;
  try {
    // Проверяем данные по схеме Posts и ждём сохранения документа в MongoDB.
    const post = await Posts.create({
      text,
      author,
    });
    // Возвращаем сохранённый документ, включая _id и временные метки.
    res.status(200).json(post);
  } catch (error) {
    // Сейчас любая ошибка внутри try возвращается клиенту со статусом 400.
    res.status(400).send({ error: error.message });
  }
};

// GET /api/posts: возвращаем массив сообщений, начиная с самых новых.
const getPosts = async (req, res) => {
  // find() без фильтра выбирает все документы; пустой результат — массив [].
  try {
    const posts = await Posts.find().sort({ createdAt: -1 }); // сортируем по дате создания, новые сверху
    res.status(200).json(posts);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// GET /api/posts/:id: получаем один документ по его _id.
const getPostById = async (req, res) => {
  const { id } = req.params; // Извлекаем параметр id из URL

  // Проверяем формат ObjectId; существование документа проверяется после поиска.
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ error: 'Invalid post ID' });
  }

  try {
    const post = await Posts.findById(id); // Ищем сообщение по ID
    if (!post) {
      return res.status(404).send({ error: 'Post not found' }); // Если не найдено, возвращаем 404
    }
    res.status(200).json(post); // Возвращаем найденное сообщение
  } catch (error) {
    res.status(400).send({ error: error.message }); // Ошибка при поиске
  }
};

// Остаток старой заглушки: функция не вызывается и не подключена к маршруту.
(req, res) => {
  res.send({ messages: 'DELETE one message' });
};

// DELETE /api/posts/:id: удаляем документ и включаем его в ответ.
const deletePostById = async (req, res) => {
  const { id } = req.params; // Извлекаем параметр id из URL

  // Проверяем, является ли id валидным ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ error: 'Invalid post ID' });
  }

  try {
    const deletedPost = await Posts.findByIdAndDelete(id); // Удаляем сообщение по ID
    if (!deletedPost) {
      return res.status(404).send({ error: 'Post not found' }); // Если не найдено, возвращаем 404
    }
    res
      .status(200)
      .json({ message: 'Post deleted successfully', post: deletedPost }); // Возвращаем сообщение об успешном удалении
  } catch (error) {
    res.status(400).send({ error: error.message }); // Ошибка при удалении
  }
};

// Остаток старой заглушки: функция не вызывается и не подключена к маршруту.
(req, res) => {
  res.send({ messages: 'UPDATE one message' });
};

// PATCH /api/posts/:id: обновляем документ и возвращаем его новое состояние.
const updatePostById = async (req, res) => {
  const { id } = req.params; // Извлекаем параметр id из URL

  // Проверяем, является ли id валидным ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ error: 'Invalid post ID' });
  }

  try {
    const updatedPost = await Posts.findByIdAndUpdate(
      id,
      { ...req.body }, // Копируем тело в объект обновления; отдельного отбора text и author здесь нет.
      { new: true, runValidators: true }, // Возвращаем документ после изменения и включаем валидаторы обновления.
    );

    if (!updatedPost) {
      return res.status(404).send({ error: 'Post not found' }); // Если не найдено, возвращаем 404
    }

    res.status(200).json(updatedPost); // Возвращаем обновленный документ
  } catch (error) {
    res.status(400).send({ error: error.message }); // Ошибка при обновлении
  }
};

export { createPosts, getPosts, getPostById, deletePostById, updatePostById };

/*
Подробное объяснение PostsControllers.js

Контроллеры получают req и res от Express, обращаются к модели Posts
и отправляют HTTP-ответ. routes.js выбирает нужную функцию по методу и пути.
Модель импортируется из models/PostsModel.js и работает с коллекцией posts.

1. async, await, try и catch
   Все пять контроллеров асинхронные. await ждёт результат запроса к MongoDB,
   не блокируя обработку других запросов всем сервером. После завершения
   операции выполняется следующая строка, а при ошибке внутри try — catch.
   В текущем коде каждый catch отправляет статус 400 и объект с полем error.
   Ошибки базы не выделены в отдельную категорию со статусом 500.

2. createPosts: создание
   const { text, author } = req.body извлекает только два поля из JSON-тела.
   Posts.create({ text, author }) проверяет данные по схеме и сохраняет их.
   В ответе со статусом 200 возвращается документ, включая _id, createdAt,
   updatedAt и __v. Обёртки message или posts вокруг документа здесь нет.
   Поле author задаёт клиент; проверки личности автора в проекте нет.

   Деструктуризация req.body стоит перед try. Если тело не было разобрано
   и req.body равно undefined, ошибка не попадёт в локальный catch.
   Express 5 передаст отклонение async-функции обработчику ошибок.
   Собственный общий обработчик ошибок в index.js пока не добавлен.

3. getPosts: список
   Posts.find() выбирает все сообщения без фильтра. sort({ createdAt: -1 })
   задаёт убывающий порядок даты создания: новые записи идут первыми.
   Ответ — массив документов или [] при отсутствии записей. Ограничения
   количества результатов и постраничной загрузки в этом запросе пока нет.

4. req.params.id и ObjectId
   В GET, PATCH и DELETE одного сообщения id берётся из параметра URL.
   mongoose.Types.ObjectId.isValid(id) проверяет допустимость идентификатора,
   но не ищет его в базе. При неверном формате возвращаем 400 с текстом
   'Invalid post ID'; запрос к MongoDB после этого не выполняется.
   return завершает контроллер, чтобы он не продолжил работу после ответа.

5. getPostById: поиск одного сообщения
   Posts.findById(id) ищет документ по полю _id. Если совпадения нет,
   результат равен null: отправляем 404 с текстом 'Post not found'.
   Если документ найден, отправляем его JSON со статусом 200.

6. deletePostById: удаление
   Posts.findByIdAndDelete(id) удаляет документ и возвращает его содержимое.
   null означает, что удалять было нечего: возвращаем 404.
   Успех — объект с полем message и удалённым документом в поле post.
   Повторное удаление того же id вернёт 404, если записи уже нет.

7. updatePostById: обновление
   Posts.findByIdAndUpdate(id, { ...req.body }, options) ищет документ по _id
   и применяет обновление. Оператор ... копирует поля тела в новый объект.
   В отличие от создания, контроллер не выбирает только text и author:
   обработка переданных полей и операторов дальше зависит от Mongoose.
   Для обычного тела { "text": "Новый текст" } меняется указанное поле;
   остальные поля документа сохраняются. Неизвестные схеме обычные поля
   по умолчанию отбрасываются Mongoose в режиме strict.

   new: true означает, что результатом будет документ после обновления.
   runValidators: true включает валидаторы обновления. Они проверяют
   обновляемые поля и поддерживаемые операции, а не весь документ заново.
   Поэтому PATCH с одним text не требует повторной передачи author.
   timestamps в схеме обеспечивает обновление updatedAt.
   upsert не включён: отсутствующий документ не создаётся, возвращается 404.
   При успехе отправляется обновлённый документ со статусом 200.

8. Старые заглушки и экспорт
   Две отдельные стрелочные функции с ответами 'DELETE one message'
   и 'UPDATE one message' остались в файле, но никому не присвоены,
   не экспортируются и не вызываются. Они не обрабатывают HTTP-запросы.
   В конце файла именованный export передаёт пять рабочих контроллеров
   в routes.js, где они и подключаются к маршрутам.
*/
