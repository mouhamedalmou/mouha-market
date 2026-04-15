const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization')

    if (!authHeader) {
      return res.status(401).json({ message: 'Accesso negato' })
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = decoded
    next()
  } catch (err) {
    console.log(err.message)
    return res.status(401).json({ message: 'Token non valido' })
  }
}