const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
const port = 3000;

// Utilisation d'une base de données persistante
const db = new sqlite3.Database('articles.db');

app.use(bodyParser.json());

db.run('CREATE TABLE IF NOT EXISTS articles (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, content TEXT)');

app.get('/articles', (req, res) => {
  db.all('SELECT * FROM articles', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ articles: rows });
  });
});

app.get('/articles/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM articles WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    res.json({ article: row });
  });
});

app.post('/articles', (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return;
  }

  const stmt = db.prepare('INSERT INTO articles (title, content) VALUES (?, ?)');
  stmt.run(title, content, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    res.json({ articleId: this.lastID });
  });
});

app.put('/articles/:id', (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return;
  }

  db.run('UPDATE articles SET title = ?, content = ? WHERE id = ?', [title, content, id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    res.json({ message: 'Article updated successfully' });
  });
});

app.delete('/articles/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM articles WHERE id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    res.json({ message: 'Article deleted successfully' });
  });
});

app.post('/contacts', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email and message are required' });
    return;
  }
  console.log(name, email, message);
  res.json({ message: 'Message sent successfully' });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening at http://localhost:${port}`);
});
