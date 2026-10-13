import { useEffect, useState } from 'react';
import PostDetail from './PostDetail';
import PostForm from './PostForm';

function Home() {
  const [posts, setPosts] = useState([]);
  console.log('posts:', posts);

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
  }, []);

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

// Кратко: Home запрашивает посты с сервера и сохраняет их в posts.
// После получения данных React обновляет страницу: каждый пост выводится через PostDetail.
// Пока posts пуст, отображается «No posts available.».

// Home загружает посты и передаёт каждый из них компоненту PostDetail для отображения.
// useState([]) создаёт состояние posts: сначала это пустой массив.
// setPosts(posts) сохраняет полученный массив и вызывает повторный рендер компонента.
// console.log в теле Home выполняется при каждом рендере, а не только после запроса.
//
// useEffect с [] запускает загрузку после монтирования компонента.
// В main.jsx включён StrictMode: в разработке React дополнительно повторяет запуск
// эффекта для проверки, поэтому здесь можно увидеть два запроса к API.
// fetchPosts объявлена внутри эффекта и вызвана ниже; сам callback эффекта не async.
// await fetch('/api/posts') отправляет GET на origin страницы. При разработке
// Vite пересылает запрос на localhost:5000 по правилу proxy из vite.config.js.
// fetch сам по себе не считает HTTP-ошибки 4xx/5xx отклонением Promise,
// поэтому response.ok проверяется отдельно и при ошибке выполняется throw.
// response.json() читает тело ответа как JSON; здесь ожидается массив постов.
// Локальная переменная posts внутри fetchPosts содержит ответ API,
// а одноимённая переменная из useState содержит текущее состояние компонента.
// catch выводит ошибку в консоль; отдельного сообщения об ошибке в интерфейсе пока нет.
//
// Если массив непустой, map создаёт PostDetail для каждого поста.
// post={post} передаёт объект через props, а key={post._id} помогает React
// сопоставлять элементы списка между рендерами. key не передаётся как обычный prop.
// При пустом массиве выводится No posts available. Отдельного состояния загрузки нет,
// поэтому этот текст виден и до получения ответа, а также после ошибки первого запроса.
