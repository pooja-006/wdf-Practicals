// ============================================================
// server_p10.js  –  Practical 10: Asynchronous Processing
//                   with Event-Driven Architecture
// ------------------------------------------------------------
// Builds on server_p9.js (In-Memory Caching) and adds:
//   • events.js        – TaskEvents (EventEmitter subclass)
//   • listeners.js     – task-created / task-deleted listeners
//   • POST /tasks      – emits 'task-created' AFTER responding
//   • DELETE /tasks/:id– emits 'task-deleted' AFTER responding
//   • GET /event-demo  – shows current listener count (debug)
//
// KEY DEMONSTRATION:
//   res.status(201).json(task)   ← [API] timestamp logged here
//   taskEvents.emit('task-created', task) ← queued, fires ~2 s later
//   Console will show API timestamp BEFORE handler timestamp.
// ============================================================

require('dotenv').config()
const express    = require('express')
const cors       = require('cors')
const bcrypt     = require('bcryptjs')
const jwt        = require('jsonwebtoken')
const mongoose   = require('mongoose')
const Task       = require('./models/Task')
const User       = require('./models/User')
const authenticate                          = require('./middleware/auth')
const { validateTask, validateCredentials } = require('./middleware/validation')
const { cacheGet, cacheSet, cacheDel, getStats, resetStats } = require('./cache')

// ── Event infrastructure ─────────────────────────────────────────────────────
const taskEvents = require('./events')
require('./listeners')   // ← registers .on() handlers; MUST load before first emit

const app  = express()
const PORT = process.env.PORT || 5000

// ── Global Middleware ────────────────────────────────────────────────────────
app.use(cors())
app.use(express.json())

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl} ${new Date().toISOString()}`)
  next()
})

// Content-Type guard for write requests
app.use((req, res, next) => {
  if (['POST', 'PUT'].includes(req.method) && !req.is('application/json'))
    return res.status(415).json({ message: 'Requests that create or update data must use application/json.' })
  next()
})

// JSON parse-error handler
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && error.type === 'entity.parse.failed')
    return res.status(400).json({ message: 'Request body contains invalid JSON.' })
  next(error)
})

// ── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', practical: 10 }))

// ── Auth Routes ──────────────────────────────────────────────────────────────
app.post('/register', validateCredentials, async (req, res, next) => {
  try {
    const email = req.body.email.toLowerCase().trim()
    if (await User.findOne({ email }))
      return res.status(409).json({ message: 'An account with that email already exists.' })
    const password = await bcrypt.hash(req.body.password, 10)
    const user = await User.create({ email, password })
    res.status(201).json({ message: 'Registration successful.', user: { id: user._id, email: user.email } })
  } catch (error) { next(error) }
})

app.post('/login', validateCredentials, async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET)
      return res.status(500).json({ message: 'JWT authentication is not configured on the server.' })
    const user = await User.findOne({ email: req.body.email.toLowerCase().trim() })
    if (!user || !(await bcrypt.compare(req.body.password, user.password)))
      return res.status(401).json({ message: 'Email or password is incorrect.' })
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

// ── Cache Debug Endpoints (from Practical 9) ─────────────────────────────────
app.get('/cache-stats', (req, res) => {
  res.json({ message: 'Cache statistics', stats: getStats() })
})

app.get('/cache-reset', (req, res) => {
  resetStats()
  res.json({ message: 'Cache hit/miss counters have been reset to zero.' })
})

// ── Event Debug Endpoint (new in Practical 10) ───────────────────────────────
/**
 * GET /event-demo
 * Returns the number of listeners registered for each event.
 * Useful as a quick sanity check that listeners.js was loaded.
 */
app.get('/event-demo', (req, res) => {
  res.json({
    message: 'EventEmitter debug info (Practical 10)',
    listeners: {
      'task-created': taskEvents.listenerCount('task-created'),
      'task-deleted': taskEvents.listenerCount('task-deleted'),
      'error':        taskEvents.listenerCount('error'),
    },
  })
})

// ── Task Routes ──────────────────────────────────────────────────────────────

/**
 * GET /tasks
 * Unchanged from Practical 9 – served from cache when available.
 */
app.get('/tasks', authenticate, async (req, res, next) => {
  try {
    const CACHE_KEY = 'all_tasks'
    const cached = cacheGet(CACHE_KEY)
    if (cached) {
      console.log('[CACHE HIT] all_tasks')
      return res.json(cached)
    }
    console.log('[CACHE MISS] all_tasks → querying MongoDB')
    const tasks = await Task.find().sort({ createdAt: -1 })
    cacheSet(CACHE_KEY, tasks)
    res.json(tasks)
  } catch (error) { next(error) }
})

/**
 * GET /tasks/:id
 */
app.get('/tasks/:id', authenticate, async (req, res, next) => {
  try {
    const CACHE_KEY = `task_${req.params.id}`
    const cached = cacheGet(CACHE_KEY)
    if (cached) {
      console.log(`[CACHE HIT] ${CACHE_KEY}`)
      return res.json(cached)
    }
    console.log(`[CACHE MISS] ${CACHE_KEY} → querying MongoDB`)
    const task = await Task.findById(req.params.id)
    if (!task) return res.status(404).json({ message: 'Task not found.' })
    cacheSet(CACHE_KEY, task)
    res.json(task)
  } catch (error) { next(error) }
})

/**
 * POST /tasks  ← CORE DEMONSTRATION for Practical 10
 *
 * Execution order (proves non-blocking emit):
 *   1. Save task to MongoDB
 *   2. Invalidate cache
 *   3. Log [API] timestamp  ← appears FIRST in console
 *   4. Send HTTP 201 response to client
 *   5. emit('task-created')  → listener runs ~2 s LATER in background
 */
app.post('/tasks', authenticate, validateTask, async (req, res, next) => {
  try {
    // Step 1 – Persist to database
    const task = await Task.create(req.body)

    // Step 2 – Invalidate cache (from Practical 9)
    cacheDel('all_tasks')
    console.log('[CACHE INVALIDATED] all_tasks (POST /tasks)')

    // Step 3 – Log the API response timestamp (BEFORE emit)
    console.log(`[API] Response sent at ${new Date().toISOString()}`)

    // Step 4 – Respond immediately; client gets its 201 right here
    res.status(201).json(task)

    // Step 5 – Emit AFTER responding.
    // emit() is synchronous in terms of call-stack, but our listener
    // wraps its work in setTimeout(fn, 2000), so it yields to the
    // event loop and executes ~2 seconds later without blocking anything.
    taskEvents.emit('task-created', task)

  } catch (error) { next(error) }
})

/**
 * PUT /tasks/:id
 */
app.put('/tasks/:id', authenticate, validateTask, async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!task) return res.status(404).json({ message: 'Task not found.' })
    cacheDel('all_tasks', `task_${req.params.id}`)
    console.log(`[CACHE INVALIDATED] all_tasks, task_${req.params.id} (PUT /tasks/:id)`)
    res.json(task)
  } catch (error) { next(error) }
})

/**
 * DELETE /tasks/:id  ← SUPPLEMENTARY: emits task-deleted event
 *
 * Same pattern as POST /tasks:
 *   respond first → emit after
 */
app.delete('/tasks/:id', authenticate, async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id)
    if (!task) return res.status(404).json({ message: 'Task not found.' })

    cacheDel('all_tasks', `task_${req.params.id}`)
    console.log(`[CACHE INVALIDATED] all_tasks, task_${req.params.id} (DELETE /tasks/:id)`)

    // Log API timestamp BEFORE emitting
    console.log(`[API] Delete response sent at ${new Date().toISOString()}`)

    // Respond first
    res.json({ message: 'Task deleted.' })

    // Emit after
    taskEvents.emit('task-deleted', task)

  } catch (error) { next(error) }
})

// ── 404 & Global Error Handler ───────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }))

app.use((error, req, res, next) => {
  console.error(error.message)
  if (res.headersSent) return next(error)
  if (error instanceof mongoose.Error.ValidationError)
    return res.status(400).json({ message: 'Validation failed.', details: Object.values(error.errors).map((e) => e.message) })
  if (error instanceof mongoose.Error.CastError)
    return res.status(400).json({ message: 'The provided ID is invalid.' })
  res.status(500).json({ message: 'An unexpected server error occurred.' })
})

// ── Bootstrap ────────────────────────────────────────────────────────────────
if (!process.env.JWT_SECRET) console.warn('JWT_SECRET is missing. Add it to backend/.env.')

async function startServer() {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing. Check backend/.env.')
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`[Practical 10] Backend listening on http://localhost:${PORT}`))
  } catch (error) {
    console.error(`Startup failed: ${error.message}`)
    process.exitCode = 1
  }
}

if (require.main === module) startServer()
module.exports = app
