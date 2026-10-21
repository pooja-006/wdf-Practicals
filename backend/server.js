require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Task = require('./models/Task')
const User = require('./models/User')
const authenticate = require('./middleware/auth')
const { validateTask, validateCredentials } = require('./middleware/validation')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl} ${new Date().toISOString()}`)
  next()
})
app.use((req, res, next) => {
  if (['POST', 'PUT'].includes(req.method) && !req.is('application/json')) return res.status(415).json({ message: 'Requests that create or update data must use application/json.' })
  next()
})

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && error.type === 'entity.parse.failed') return res.status(400).json({ message: 'Request body contains invalid JSON.' })
  next(error)
})

app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.post('/register', validateCredentials, async (req, res, next) => {
  try {
    const email = req.body.email.toLowerCase().trim()
    if (await User.findOne({ email })) return res.status(409).json({ message: 'An account with that email already exists.' })
    const password = await bcrypt.hash(req.body.password, 10)
    const user = await User.create({ email, password })
    res.status(201).json({ message: 'Registration successful.', user: { id: user._id, email: user.email } })
  } catch (error) { next(error) }
})

app.post('/login', validateCredentials, async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) return res.status(500).json({ message: 'JWT authentication is not configured on the server.' })
    const user = await User.findOne({ email: req.body.email.toLowerCase().trim() })
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) return res.status(401).json({ message: 'Email or password is incorrect.' })
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' })
    res.json({ message: 'Login successful.', token })
  } catch (error) { next(error) }
})

app.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('_id email createdAt')
    if (!user) return res.status(404).json({ message: 'User not found.' })
    res.json({ id: user._id, email: user.email, createdAt: user.createdAt })
  } catch (error) { next(error) }
})

app.get('/tasks', authenticate, async (req, res, next) => {
  try { res.json(await Task.find().sort({ createdAt: -1 })) } catch (error) { next(error) }
})
app.get('/tasks/:id', authenticate, async (req, res, next) => {
  try { const task = await Task.findById(req.params.id); if (!task) return res.status(404).json({ message: 'Task not found.' }); res.json(task) } catch (error) { next(error) }
})
app.post('/tasks', authenticate, validateTask, async (req, res, next) => {
  try { res.status(201).json(await Task.create(req.body)) } catch (error) { next(error) }
})
app.put('/tasks/:id', authenticate, validateTask, async (req, res, next) => {
  try { const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!task) return res.status(404).json({ message: 'Task not found.' }); res.json(task) } catch (error) { next(error) }
})
app.delete('/tasks/:id', authenticate, async (req, res, next) => {
  try { const task = await Task.findByIdAndDelete(req.params.id); if (!task) return res.status(404).json({ message: 'Task not found.' }); res.json({ message: 'Task deleted.' }) } catch (error) { next(error) }
})

app.use((req, res) => res.status(404).json({ message: 'Route not found.' }))
app.use((error, req, res, next) => {
  console.error(error.message)
  if (res.headersSent) return next(error)
  if (error instanceof mongoose.Error.ValidationError) return res.status(400).json({ message: 'Validation failed.', details: Object.values(error.errors).map((item) => item.message) })
  if (error instanceof mongoose.Error.CastError) return res.status(400).json({ message: 'The provided ID is invalid.' })
  res.status(500).json({ message: 'An unexpected server error occurred.' })
})

if (!process.env.JWT_SECRET) console.warn('JWT_SECRET is missing. Add it to backend/.env before using authentication.')

async function startServer() {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing. Copy .env.example to .env and configure MongoDB.')
    await mongoose.connect(process.env.MONGO_URI)
    app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`))
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`)
    process.exitCode = 1
  }
}

if (require.main === module) startServer()
module.exports = app
