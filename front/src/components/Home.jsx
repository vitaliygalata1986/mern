import { useEffect, useContext } from 'react';
import PostDetail from './PostDetail';
import PostForm from './PostForm';
import { PostContext } from '../context/PostContext';

function Home() {
  const { posts, setPosts } = useContext(PostContext);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts');
        if (!response.ok) {
          throw new Error(
            'Failed to fetch data from the server API http://localhost:5000/api/posts',
          );
        }
        const posts = await response.json();
        setPosts(posts);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchPosts();
  }, [setPosts]);

  return (
    <div className="main-section">
      <PostForm />
      <h2>Welcome to the Home Page</h2>

      <div className="posts">
        {posts.length > 0 ? (
          posts.map((post) => <PostDetail key={post._id} post={post} />)
        ) : (
          <p>No posts available.</p>
        )}
      </div>
    </div>
  );
}

export default Home;

// Home загружает посты, показывает PostForm и передаёт каждую запись в PostDetail.
// useContext(PostContext) получает posts и setPosts из ближайшего PostProvider.
// Собственного состояния списка здесь больше нет: начальный [] задан в провайдере.
// setPosts(posts) заменяет общий список массивом из ответа API.
// Когда PostForm добавляет запись через тот же setter, Home получает новый список
// из контекста и отображает его без перезагрузки страницы и повторного GET-запроса.
//
// useEffect с [setPosts] запускает загрузку после монтирования компонента.
// Setter из useState имеет стабильную ссылку: изменения posts не перезапускают
// этот эффект. При новом монтировании Home загрузка выполняется снова.
// StrictMode в текущем main.jsx не оборачивает приложение.
// fetchPosts объявлена внутри эффекта и вызвана ниже; сам callback эффекта не async.
// await fetch('/api/posts') отправляет GET на origin страницы. При разработке
// Vite пересылает запрос на localhost:5000 по правилу proxy из vite.config.js.
// fetch сам по себе не считает HTTP-ошибки 4xx/5xx отклонением Promise,
// поэтому response.ok проверяется отдельно и при ошибке выполняется throw.
// response.json() читает тело ответа как JSON; здесь ожидается массив постов.
// Локальная переменная posts внутри fetchPosts содержит ответ API,
// а одноимённая переменная из useContext содержит общий список из провайдера.
// catch выводит ошибку в консоль; отдельного сообщения об ошибке в интерфейсе пока нет.
// Отмена запроса и защита от устаревшего ответа пока не реализованы: если GET
// завершится после добавления поста формой, он заменит список своим ответом.
//
// Если массив непустой, map создаёт PostDetail для каждого поста.
// post={post} передаёт объект через props, а key={post._id} помогает React
// сопоставлять элементы списка между рендерами. key не передаётся как обычный prop.
// При пустом массиве выводится No posts available. Отдельного состояния загрузки нет,
// поэтому этот текст виден и до получения ответа, а также после ошибки первого запроса.
// GET возвращает новые посты первыми, но PostForm добавляет созданный пост в конец
// массива. До следующей загрузки порядок списка может отличаться от порядка API.
