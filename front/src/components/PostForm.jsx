import { useState, useContext } from 'react';
import { PostContext } from '../context/PostContext';

function PostForm() {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const { setPosts } = useContext(PostContext);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newPost = { text, author };

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPost),
      });

      const post = await response.json(); // Документ при успехе или объект ошибки при неуспешном ответе.

      if (!response.ok) {
        setError(
          `Failed to create a new post: ${post.error || 'Unknown error'}`,
        );
      } else {
        setError(null);
        setText('');
        setAuthor('');
        setPosts((prevPosts) => [...prevPosts, post]); // Добавляем документ из API в конец общего списка.
      }
    } catch (error) {
      console.error('Error creating a new post:', error);
    }
  };
  return (
    <form className="add-post" onSubmit={handleSubmit}>
      <h3>Add Message Form</h3>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Введите текст поста"
      ></textarea>
      <input
        type="text"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Введите автора поста"
      />
      {error && <div className="error">{error}</div>}
      <button type="submit">Добавить</button>
    </form>
  );
}

export default PostForm;

// text, author и error — локальное состояние формы. Список постов хранится выше,
// в PostProvider; useContext даёт форме его setPosts без передачи через props.
// Поля управляемые: value берётся из состояния, onChange обновляет это состояние.
// onSubmit вызывает handleSubmit, а preventDefault отменяет обычную отправку
// HTML-формы с переходом на другую страницу.
//
// POST /api/posts отправляет text и author как JSON. В разработке запрос проходит
// через прокси Vite к Express, затем createPosts сохраняет запись через Posts.create.
// Сервер проверяет обязательные поля по схеме; required в разметке формы пока нет.
// response.json() выполняется до проверки response.ok: имя post обозначает
// и успешный документ, и JSON с полем error при ошибке API.
// При HTTP-ошибке setError показывает сообщение, введённые значения сохраняются.
// При успехе форма очищает поля и ошибку, затем добавляет документ из ответа,
// содержащий в том числе _id и createdAt, в общее состояние.
//
// setPosts получает функцию: prevPosts — актуальное предыдущее значение списка
// при обработке обновления React. [...prevPosts, post] создаёт новый массив,
// сохраняя старые записи и добавляя новую последней без изменения исходного массива.
// Home читает тот же контекст и сразу выводит новую карточку через PostDetail.
// Это обновление после успешного ответа API; повторный запрос списка не выполняется.
// Сервер сортирует GET по createdAt от новых к старым, форма же добавляет в конец.
//
// Сетевые ошибки и ошибки разбора JSON попадают в catch и только выводятся
// в консоль: отдельное сообщение через setError в этой ветке пока не задано.
// Состояния отправки и блокировки повторного нажатия кнопки пока нет.
