// ============================================================
// Practical 9: In-Memory Caching and Query Optimization
// server_p9.js
// ------------------------------------------------------------
// Additions over server.js (Practical 6/7):
//   • node-cache with TTL = 60 s
//   • GET /tasks        → cache key "all_tasks"
//   • GET /tasks/:id    → cache key "task_<id>"
//   • POST / PUT / DELETE /tasks → invalidate relevant cache keys
//   • GET /cache-stats  → debug endpoint (hit/miss counters)
//   • GET /cache-reset  → reset counters for clean benchmark runs
// ============================================================

require('dotenv').config()
const express    = require('express')
const cors       = require('cors')
const bcrypt     = require('bcryptjs')
const jwt        = require('jsonwebtoken')
const mongoose   = require('mongoose')
const Task       = require('./models/Task')
const User       = require('./models/User')
const authenticate          = require('./middleware/auth')
const { validateTask, validateCredentials } = require('./middleware/validation')
const { cacheGet, cacheSet, cacheDel, getStats, resetStats } = require('./cache')

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

// JSON parse-error handler (must come AFTER express.json())
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && error.type === 'entity.parse.failed')
    return res.status(400).json({ message: 'Request body contains invalid JSON.' })
  next(error)
})

// ── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', practical: 9 }))

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

// ── Cache Debug Endpoints ────────────────────────────────────────────────────

/**
 * GET /cache-stats
 * Returns current hit/miss statistics and the list of currently cached keys.
 * Useful for verifying cache behaviour during testing.
 */
app.get('/cache-stats', (req, res) => {
  res.json({
    message: 'Cache statistics',
    stats: getStats(),
  })
})

/**
 * GET /cache-reset
 * Resets hit/miss counters to zero.
 * Use this before starting a new benchmark run.
 */
app.get('/cache-reset', (req, res) => {
  resetStats()
  res.json({ message: 'Cache hit/miss counters have been reset to zero.' })
})

// ── Task Routes (with Caching) ───────────────────────────────────────────────

/**
 * GET /tasks
 * Cache key : "all_tasks"
 * Flow      : HIT  → return cached array immediately (no DB call)
 *             MISS → query MongoDB → store in cache → return data
 */
app.get('/tasks', authenticate, async (req, res, next) => {
  try {
    const CACHE_KEY = 'all_tasks'

    // ── Cache HIT ──────────────────────────────────────────────
    const cached = cacheGet(CACHE_KEY)
    if (cached) {
      console.log('[CACHE HIT] all_tasks')
      return res.json(cached)
    }

    // ── Cache MISS ─────────────────────────────────────────────
    console.log('[CACHE MISS] all_tasks → querying MongoDB')
    const tasks = await Task.find().sort({ createdAt: -1 })
    cacheSet(CACHE_KEY, tasks)          // stored with default TTL (60 s)
    res.json(tasks)
  } catch (error) { next(error) }
})

/**
 * GET /tasks/:id
 * Cache key : "task_<id>"
 * Cached separately from the all-tasks list (Supplementary requirement).
 */
app.get('/tasks/:id', authenticate, async (req, res, next) => {
  try {
    const CACHE_KEY = `task_${req.params.id}`

    // ── Cache HIT ──────────────────────────────────────────────
    const cached = cacheGet(CACHE_KEY)
    if (cached) {
      console.log(`[CACHE HIT] ${CACHE_KEY}`)
      return res.json(cached)
    }

    // ── Cache MISS ─────────────────────────────────────────────
    console.log(`[CACHE MISS] ${CACHE_KEY} → querying MongoDB`)
    const task = await Task.findById(req.params.id)
    if (!task) return res.status(404).json({ message: 'Task not found.' })
    cacheSet(CACHE_KEY, task)           // stored with default TTL (60 s)
    res.json(task)
  } catch (error) { next(error) }
})

/**
 * POST /tasks
 * After creating a task:
 *  • Invalidate "all_tasks" so the next GET /tasks re-fetches from MongoDB.
 *  (No per-task key to invalidate since it's a brand-new document.)
 */
app.post('/tasks', authenticate, validateTask, async (req, res, next) => {
  try {
    const task = await Task.create(req.body)

    // ── Cache Invalidation ──────────────────────────────────────
    cacheDel('all_tasks')
    console.log('[CACHE INVALIDATED] all_tasks (POST /tasks)')

    res.status(201).json(task)
  } catch (error) { next(error) }
})

/**
 * PUT /tasks/:id
 * After updating a task:
 *  • Invalidate "all_tasks"  (list is now stale)
 *  • Invalidate "task_<id>"  (individual entry is now stale)
 */
app.put('/tasks/:id', authenticate, validateTask, async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!task) return res.status(404).json({ message: 'Task not found.' })

    // ── Cache Invalidation ──────────────────────────────────────
    cacheDel('all_tasks', `task_${req.params.id}`)
    console.log(`[CACHE INVALIDATED] all_tasks, task_${req.params.id} (PUT /tasks/:id)`)

    res.json(task)
  } catch (error) { next(error) }
})

/**
 * DELETE /tasks/:id
 * After deleting a task:
 *  • Invalidate "all_tasks"
 *  • Invalidate "task_<id>"
 */
app.delete('/tasks/:id', authenticate, async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id)
    if (!task) return res.status(404).json({ message: 'Task not found.' })

    // ── Cache Invalidation ──────────────────────────────────────
    cacheDel('all_tasks', `task_${req.params.id}`)
    console.log(`[CACHE INVALIDATED] all_tasks, task_${req.params.id} (DELETE /tasks/:id)`)

    res.json({ message: 'Task deleted.' })
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
    app.listen(PORT, () => console.log(`[Practical 9] Backend listening on http://localhost:${PORT}`))
  } catch (error) {
    console.error(`Startup failed: ${error.message}`)
    process.exitCode = 1
  }
}

if (require.main === module) startServer()
module.exports = app
