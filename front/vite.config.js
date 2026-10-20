import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

// Как работает блок server.proxy:
// proxy — объект с правилами, по которым Vite пересылает запросы на другой сервер.
// '/api' — префикс пути для этого правила.
// GET из Home.jsx и POST из PostForm.jsx на /api/posts используют один прокси.
// PostProvider только хранит состояние; сетевых запросов в нём нет.
// target — адрес backend, куда Vite отправляет подходящие запросы.
// Здесь это http://localhost:5000; backend нужно запустить отдельно.
// В server/index.js запасной порт — 4000. Для текущего target серверу нужен
// порт 5000, заданный через окружение; сам прокси порт backend не меняет.
// rewrite не задан, поэтому /api остаётся в пути: backend получает /api/posts.
// changeOrigin: true: в пересылаемом запросе заголовок Host
// меняется на localhost:5000. Это настройка запроса к backend, а не отключение CORS.
// secure: false: отключает проверку сертификата целевого HTTPS-сервера.
// У нас target использует HTTP, поэтому сейчас этот параметр ни на что не влияет.
//
// Почему при таком запросе не возникает проблема CORS:
// Origin — сочетание протокола, имени хоста и порта. Например, localhost:5173
// и localhost:5000 при одинаковом протоколе имеют разные origin из-за разных портов.
// Если страница открыта на http://localhost:5173, fetch('/api/posts') обращается
// к http://localhost:5173/api/posts, то есть к тому же origin, что и страница.
// Затем Vite сам обращается к http://localhost:5000/api/posts и возвращает ответ браузеру.
// Ограничения CORS браузера не применяются к этому запросу от сервера Vite к backend.
// Поэтому CORS не отключается: браузер просто общается с API через свой сервер Vite.
// Если написать fetch('http://localhost:5000/api/posts'), запрос пойдёт напрямую,
// минуя прокси, и для страницы с другим origin понадобится разрешение CORS от backend.
//
// Это настройка сервера разработки (npm run dev). В файлы сборки dist прокси не входит.
// После npm run build из корня проекта Express отдаёт файлы front/dist и API
// с одного адреса. Поэтому fetch('/api/posts') работает и без прокси Vite.
// Документация: https://vite.dev/config/server-options.html#server-proxy
