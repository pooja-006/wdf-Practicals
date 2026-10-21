// ============================================================
// events.js  –  Practical 10: Event-Driven Architecture
// ------------------------------------------------------------
// Exports a single TaskEvents instance (EventEmitter subclass)
// that acts as the application-wide event bus.
// Every module that needs to emit OR listen imports this file.
// ============================================================

const EventEmitter = require('events')

class TaskEvents extends EventEmitter {}

const taskEvents = new TaskEvents()

// ── Safety net ───────────────────────────────────────────────────────────────
// Node.js throws if an 'error' event is emitted with no listener.
// Register a fallback so the server never crashes on event-layer errors.
taskEvents.on('error', (err) => {
  console.error(`[EventBus ERROR] Unhandled event error: ${err.message}`)
})

module.exports = taskEvents
