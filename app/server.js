const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/static', express.static(path.join(__dirname, '..', 'ressources', 'static')));

const todos = [];

app.get('/todos', (req, res) => res.json(todos));

app.post('/todos', (req, res) => {
  const todo = { id: todos.length + 1, text: req.body.text, done: false };
  todos.push(todo);
  res.status(201).json(todo);
});

app.listen(process.env.PORT || 8080);