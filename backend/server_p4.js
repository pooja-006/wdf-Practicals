const express = require('express');
const app = express();
const PORT = 5000;

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// In-memory array (no database yet)
let tasks = [];
let nextId = 1;

// CREATE a task
app.post('/tasks', (req, res, next) => {
  try {
    if (!req.body.title) throw new Error('Task title is required');
    const newTask = { id: nextId++, title: req.body.title, completed: false };
    tasks.push(newTask);
    res.status(201).json(newTask);
  } catch (error) {
    next(error); 
  }
});

// READ all tasks
app.get('/tasks', (req, res) => {
  res.status(200).json(tasks);
});

// READ a single task
app.get('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.status(200).json(task);
});

// UPDATE a task
app.put('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ message: 'Task not found' });
  
  task.title = req.body.title !== undefined ? req.body.title : task.title;
  task.completed = req.body.completed !== undefined ? req.body.completed : task.completed;
  res.status(200).json(task);
});

// DELETE a task
app.delete('/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (taskIndex === -1) return res.status(404).json({ message: 'Task not found' });
  
  tasks.splice(taskIndex, 1);
  res.status(200).json({ message: 'Task deleted' });
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error.message);
  res.status(500).json({ message: 'An unexpected server error occurred', error: error.message });
});

app.listen(PORT, () => {
  console.log(`Practical 4 Backend listening on http://localhost:${PORT}`);
});
