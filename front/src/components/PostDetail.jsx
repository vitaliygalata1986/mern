import { useContext, useState } from 'react';
import { PostContext } from '../context/PostContext';

function PostDetail({ post }) {
  const { setPosts } = useContext(PostContext);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedAuthor, setEditedAuthor] = useState('');
  const [editedText, setEditedText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setError('');
    // копируем старые данные поста в локальные состояния, чтобы пользователь мог их отредактировать.
    setEditedAuthor(post.author);
    setEditedText(post.text);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setError('');
    setIsEditing(false);
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    // isSaving = false — форма доступна для редактирования.
    // isSaving = true — запрос выполняется, поля и кнопки заблокированы.

    // if (isSaving) return; // если сохранение выполняется прямо сейчас, мы не запускаем ещё один запрос. (дополнительная защитная проверка в обработчике)

    setIsSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/posts/${post._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: editedAuthor, text: editedText }),
      });
      const updatedPost = await response.json();

      if (!response.ok) {
        setError(
          `Не удалось обновить пост: ${updatedPost.error || 'Неизвестная ошибка'}`,
        );
        return;
      }

      setPosts((prevPosts) =>
        prevPosts.map((item) => (item._id === post._id ? updatedPost : item)),
      );
      // При успешном обновлении вызывается setIsEditing(false), поэтому форма вообще исчезает, а не просто меняется надпись кнопки.
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating the post:', error);
      setError('Не удалось сохранить изменения. Попробуйте ещё раз.');
    } finally {
      // Это выполняется и при успешном запросе, и при ошибке.
      // При ошибке форма остаётся открытой, и кнопка снова показывает Update.
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/posts/${post._id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) {
        setError(
          `Failed to delete the post: ${result.error || 'Unknown error'}`,
        );
      } else {
        setPosts((prevPosts) => prevPosts.filter((p) => p._id !== post._id));
        console.log(result);
      }
    } catch (error) {
      console.error('Error deleting the post:', error);
    }
  };
  return (
    <div key={post._id} className="post">
      {error && <div className="error">{error}</div>}
      {isEditing ? (
        <form
          className="edit-post"
          onSubmit={handleUpdate}
          aria-busy={isSaving}
        >
          <label>
            Автор
            <input
              type="text"
              value={editedAuthor}
              disabled={isSaving}
              onChange={(event) => setEditedAuthor(event.target.value)}
            />
          </label>
          <label>
            Текст поста
            <textarea
              rows={4}
              value={editedText}
              disabled={isSaving}
              onChange={(event) => setEditedText(event.target.value)}
            />
          </label>
          <div className="edit-post-actions">
            <button type="submit" disabled={isSaving}>
              {isSaving ? 'Сохранение…' : 'Update'}
            </button>
            <button type="button" onClick={handleCancel} disabled={isSaving}>
              Отмена
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="post-actions">
            <button
              type="button"
              onClick={handleEdit}
              className="post-edit"
              aria-label="Редактировать пост"
              title="Редактировать пост"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m16 3 5 5-13 13H3v-5L16 3Z" />
                <path d="m13 6 5 5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="post-delete"
              aria-label="Удалить пост"
            >
              X
            </button>
          </div>
          <h3>{post.author}</h3>
          <p>{post.text}</p>
        </>
      )}
      <hr />
      <p>{post.createdAt}</p>
    </div>
  );
}

export default PostDetail;

// PostDetail отображает один пост, который Home передаёт через prop post.
// Из PostContext получаем setPosts для обновления списка после удаления и редактирования.
// Запись { post } в аргументах функции извлекает это поле из объекта props.
// Выражения в фигурных скобках JSX выводят значения полей объекта:
// author — автор, text — текст, createdAt — дата в том виде, в котором её прислал API.
// Дополнительного форматирования даты здесь пока нет; <hr /> добавляет разделитель.
// Карандаш включает isEditing и копирует текущие поля поста в локальный черновик.
// В режиме редактирования показываем input и textarea вместо автора и текста.
// Отмена закрывает форму, не меняя post и общий список. При повторном открытии
// черновик снова заполняется из post. Update отправляет author и text через PATCH.
// При успехе map заменяет пост ответом сервера, сохраняя его место, и форма закрывается.
// При HTTP-ошибке, ошибке сети или чтения JSON форма и введённые данные сохраняются.
// isSaving блокирует поля и кнопки на время запроса; finally снимает блокировку.
// Кнопка X вызывает handleDelete: DELETE /api/posts/:id отправляет ID текущего поста.
// response.json() читает ответ сервера, а response.ok показывает успешность HTTP-запроса.
// При неуспешном статусе setError сохраняет сообщение, которое выводится над кнопкой.
// После успешного удаления setPosts получает предыдущий список и через filter
// исключает пост с текущим _id: React обновляет список без перезагрузки страницы.
// Ответ сервера выводится в консоль. Ошибки сети или чтения JSON попадают в catch
// и выводятся только в консоль — setError в этой ветке не вызывается.
// Для списка важен key на <PostDetail /> внутри map в Home.jsx.
// key на внутреннем <div> не заменяет этот ключ и для текущей разметки избыточен.

/*
  Предположим, в контексте у нас есть три поста:
  prevPosts = [
    { _id: '1', author: 'Alex', text: 'Hello' },
    { _id: '2', author: 'John', text: 'Old text' },
    { _id: '3', author: 'Kate', text: 'Goodbye' }
  ];

  Мы обновляем пост с _id = '2'.
  Сервер возвращает:

    updatedPost = {
      _id: '2',
      author: 'John',
      text: 'New text'
    };

    Теперь map() проходит по каждому элементу массива:
    Элемент	Условие item._id === post._id	Результат
    Пост 1	false	Оставляем item
    Пост 2	true	Возвращаем updatedPost
    Пост 3	false	Оставляем item

    Получаем новый массив:

    [
      { _id: '1', author: 'Alex', text: 'Hello' },
      { _id: '2', author: 'John', text: 'New text' },
      { _id: '3', author: 'Kate', text: 'Goodbye' }
    ]
    
    Первый: map() не пропускает остальные посты, а возвращает их без изменений.
    Второй: map() создаёт новый массив. Исходный массив prevPosts мы напрямую не изменяем.
    React получает новое состояние через setPosts() и обновляет отображение списка.


    - map() вызывается один раз и проходит по всем трём объектам.
    - На каждой итерации callback возвращает один объект, а не весь массив.
    - После завершения всех итераций map() возвращает новый массив из трёх объектов.
    - Первый и третий объекты остаются прежними — даже ссылки на них сохраняются (===).
    - Второй объект заменяется на updatedPost.
      То есть map() создаёт новый массив, но не создаёт автоматически новые копии всех объектов внутри него.
      И уже этот новый массив передаётся в setPosts(), после чего React обновляет состояние.
      
*/
