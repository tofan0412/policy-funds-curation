const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

function crudLog(type, message) {
  const now = new Date();
  const ts = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0') + ' ' +
    String(now.getHours()).padStart(2, '0') + ':' +
    String(now.getMinutes()).padStart(2, '0') + ':' +
    String(now.getSeconds()).padStart(2, '0');
  console.log(`[${ts}][${type}] ${message}`);
}

// DB setup
const db = new Database(path.join(__dirname, 'todos.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    completed INTEGER DEFAULT 0,
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
    due_date TEXT DEFAULT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
  )
`);

// GET all todos
app.get('/api/todos', (req, res) => {
  const { priority, completed, sort } = req.query;
  let query = 'SELECT * FROM todos WHERE 1=1';
  const params = [];

  if (priority) {
    query += ' AND priority = ?';
    params.push(priority);
  }
  if (completed !== undefined) {
    query += ' AND completed = ?';
    params.push(completed === 'true' ? 1 : 0);
  }

  if (sort === 'due_date') {
    query += ' ORDER BY CASE WHEN due_date IS NULL THEN 1 ELSE 0 END, due_date ASC';
  } else if (sort === 'priority') {
    query += " ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END";
  } else {
    query += ' ORDER BY created_at DESC';
  }

  const todos = db.prepare(query).all(...params);
  res.json(todos.map(t => ({ ...t, completed: t.completed === 1 })));
});

// GET single todo
app.get('/api/todos/:id', (req, res) => {
  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
  if (!todo) return res.status(404).json({ error: 'Not found' });
  res.json({ ...todo, completed: todo.completed === 1 });
});

// POST create todo
app.post('/api/todos', (req, res) => {
  const { title, description = '', priority = 'medium', due_date = null } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: '제목은 필수입니다.' });
  }
  const result = db.prepare(
    'INSERT INTO todos (title, description, priority, due_date) VALUES (?, ?, ?, ?)'
  ).run(title.trim(), description, priority, due_date);

  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
  crudLog('C', `할일 추가: "${todo.title}" (id=${todo.id})`);
  res.status(201).json({ ...todo, completed: todo.completed === 1 });
});

// PATCH update todo
app.patch('/api/todos/:id', (req, res) => {
  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
  if (!todo) return res.status(404).json({ error: 'Not found' });

  const { title, description, priority, due_date, completed } = req.body;
  const updated = {
    title: title !== undefined ? title.trim() : todo.title,
    description: description !== undefined ? description : todo.description,
    priority: priority !== undefined ? priority : todo.priority,
    due_date: due_date !== undefined ? due_date : todo.due_date,
    completed: completed !== undefined ? (completed ? 1 : 0) : todo.completed,
  };

  db.prepare(
    `UPDATE todos SET title=?, description=?, priority=?, due_date=?, completed=?,
     updated_at=datetime('now','localtime') WHERE id=?`
  ).run(updated.title, updated.description, updated.priority, updated.due_date, updated.completed, req.params.id);

  const result = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
  crudLog('U', `할일 수정: "${result.title}" (id=${result.id})`);
  res.json({ ...result, completed: result.completed === 1 });
});

// DELETE todo
app.delete('/api/todos/:id', (req, res) => {
  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
  if (!todo) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM todos WHERE id = ?').run(req.params.id);
  crudLog('D', `할일 삭제: "${todo.title}" (id=${todo.id})`);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
