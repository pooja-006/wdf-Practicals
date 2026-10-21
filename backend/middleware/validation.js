function validateTask(req, res, next) {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) return res.status(400).json({ message: 'Request body must be a JSON object.' })
  const { title, priority, completed } = req.body
  if (typeof title !== 'string' || !title.trim()) return res.status(400).json({ message: 'Task title is required.' })
  if (req.body.description !== undefined && typeof req.body.description !== 'string') return res.status(400).json({ message: 'Description must be a string.' })
  if (priority !== undefined && !['low', 'medium', 'high'].includes(priority)) return res.status(400).json({ message: 'Priority must be low, medium, or high.' })
  if (completed !== undefined && typeof completed !== 'boolean') return res.status(400).json({ message: 'Completed must be a boolean.' })
  next()
}

function validateCredentials(req, res, next) {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) return res.status(400).json({ message: 'Request body must be a JSON object.' })
  const { email, password } = req.body
  if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim()) || typeof password !== 'string' || password.length < 6) return res.status(400).json({ message: 'A valid email and password of at least 6 characters are required.' })
  next()
}

module.exports = { validateTask, validateCredentials }
