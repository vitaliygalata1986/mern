import { useContext, useState } from 'react';
import { PostContext } from '../context/PostContext';

function PostDetail({ post }) {
  const { setPosts } = useContext(PostContext);
  const [error, setError] = useState('');
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
      <button onClick={handleDelete} className="post-delete">
        X
      </button>
      <h3>{post.author}</h3>
      <p>{post.text}</p>
      <hr />
      <p>{post.createdAt}</p>
    </div>
  );
}

export default PostDetail;

// PostDetail отображает один пост, который Home передаёт через prop post.
// Из PostContext компонент получает setPosts для обновления общего списка после удаления.
// Запись { post } в аргументах функции извлекает это поле из объекта props.
// Выражения в фигурных скобках JSX выводят значения полей объекта:
// author — автор, text — текст, createdAt — дата в том виде, в котором её прислал API.
// Дополнительного форматирования даты здесь пока нет; <hr /> добавляет разделитель.
// Кнопка X вызывает handleDelete: DELETE /api/posts/:id отправляет ID текущего поста.
// response.json() читает ответ сервера, а response.ok показывает успешность HTTP-запроса.
// При неуспешном статусе setError сохраняет сообщение, которое выводится над кнопкой.
// После успешного удаления setPosts получает предыдущий список и через filter
// исключает пост с текущим _id: React обновляет список без перезагрузки страницы.
// Ответ сервера выводится в консоль. Ошибки сети или чтения JSON попадают в catch
// и выводятся только в консоль — setError в этой ветке не вызывается.
// Для списка важен key на <PostDetail /> внутри map в Home.jsx.
// key на внутреннем <div> не заменяет этот ключ и для текущей разметки избыточен.
