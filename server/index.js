import express from 'express';
import 'dotenv/config';

const app = express();

// укажем middleware для обработки JSON
app.use(express.json());

app.get('/', (req, res) => {
  // req, res - запрос и ответ
  res.send('Server is running!');
});

app.post('/', (req, res) => {
  // req, res - запрос и ответ
  res.send('Server is running!');
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
