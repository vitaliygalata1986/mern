import { useState } from 'react';

function PostForm() {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
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

      const post = await response.json(); // Получаем созданный пост с сервера

      if (!response.ok) {
        setError(
          `Failed to create a new post: ${post.error || 'Unknown error'}`,
        );
      } else {
        setError(null);
        setText('');
        setAuthor('');
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
