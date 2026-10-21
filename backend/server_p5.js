require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Task = require('./models/Task');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Request logging middleware (from Practical 4)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// REST endpoints using Mongoose (NO JWT Auth yet)

// CREATE
app.post('/tasks', async (req, res, next) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (error) { next(error); }
});

// READ all
app.get('/tasks', async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) { next(error); }
});

// READ one
app.get('/tasks/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.status(200).json(task);
  } catch (error) { next(error); }
});

// UPDATE
app.put('/tasks/:id', async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.status(200).json(task);
  } catch (error) { next(error); }
});

// DELETE
app.delete('/tasks/:id', async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.status(200).json({ message: 'Task deleted.' });
  } catch (error) { next(error); }
});

// Handle 404
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

// Global error handler - converts Mongoose errors to structured JSON
app.use((error, req, res, next) => {
  console.error(error.message);
  
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ 
      message: 'Validation failed.', 
      details: Object.values(error.errors).map((item) => item.message) 
    });
  }
  
  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: 'The provided ID is invalid.' });
  }
  
  res.status(500).json({ message: 'An unexpected server error occurred.' });
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing in .env');
    await mongoose.connect(process.env.MONGO_URI);
    app.listen(PORT, () => console.log(`Practical 5 Backend listening on http://localhost:${PORT}`));
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    process.exitCode = 1;
  }
}

startServer();
