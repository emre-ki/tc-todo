// Todo-API als Cloud Function (FaaS)
// Gleiche Logik wie app/server.js, nur als einzelne Funktion statt ganzem Express-Server.
const functions = require('@google-cloud/functions-framework');

// Achtung: Die Liste liegt nur im Arbeitsspeicher der Funktion.
// Wenn Google die Funktion wegräumt, ist sie wieder leer (zustandslos).
const todos = [];

functions.http('todos', (req, res) => {
  if (req.method === 'GET') {
    return res.json(todos);
  }

  if (req.method === 'POST') {
    if (!req.body || !req.body.text) {
      return res.status(400).json({ fehler: 'Bitte {"text": "..."} mitschicken' });
    }
    const todo = { id: todos.length + 1, text: req.body.text, done: false };
    todos.push(todo);
    return res.status(201).json(todo);
  }

  res.status(405).json({ fehler: 'Nur GET und POST erlaubt' });
});
