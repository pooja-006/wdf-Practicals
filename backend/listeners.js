// ============================================================
// listeners.js  –  Practical 10: Event-Driven Architecture
// ------------------------------------------------------------
// All event listeners are REGISTERED here and this file is
// required ONCE at server startup (in server_p10.js).
//
// Supplementary requirements covered:
//   ✔ task-created  → logs title, timestamp, assigned user
//   ✔ task-deleted  → different log message
//   ✔ Artificial 2-second delay via setTimeout to prove
//     that the API response is NOT blocked
//   ✔ Error event listener (safety net in events.js)
// ============================================================

const taskEvents = require('./events')

// ── Listener 1: task-created ─────────────────────────────────────────────────
taskEvents.on('task-created', (task) => {
  // Simulate a slow notification (e.g., sending an e-mail / push notification).
  // The setTimeout hands control back to the event loop immediately,
  // so the API response has already been sent before this callback fires.
  setTimeout(() => {
    const handlerTimestamp = new Date().toISOString()
    console.log('─'.repeat(60))
    console.log(`[Notification] ✅ TASK CREATED`)
    console.log(`  Title       : "${task.title}"`)
    console.log(`  Priority    : ${task.priority}`)
    console.log(`  Completed   : ${task.completed}`)
    console.log(`  Handler ran : ${handlerTimestamp}`)
    console.log('─'.repeat(60))
  }, 2000) // 2-second artificial delay
})

// ── Listener 2: task-deleted ─────────────────────────────────────────────────
taskEvents.on('task-deleted', (task) => {
  setTimeout(() => {
    const handlerTimestamp = new Date().toISOString()
    console.log('─'.repeat(60))
    console.log(`[Notification] 🗑️  TASK DELETED`)
    console.log(`  Title       : "${task.title}"`)
    console.log(`  ID          : ${task._id}`)
    console.log(`  Handler ran : ${handlerTimestamp}`)
    console.log('─'.repeat(60))
  }, 2000) // 2-second artificial delay
})

console.log('[Listeners] task-created and task-deleted listeners registered.')
