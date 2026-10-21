const jwt = require('jsonwebtoken')

function authenticate(req, res, next) {
  const authorization = req.headers.authorization
  if (!authorization || !authorization.startsWith('Bearer ')) return res.status(401).json({ message: 'Authentication token is required.' })

  const token = authorization.split(' ')[1]
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (error) {
    return res.status(401).json({ message: error.name === 'TokenExpiredError' ? 'Authentication token has expired.' : 'Authentication token is invalid.' })
  }
}

module.exports = authenticate
