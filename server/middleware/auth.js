const jwt = require('jsonwebtoken')
const User = require('../models/User')

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization')

    if (!authHeader) {
      return res.status(401).json({ message: 'Accesso negato' })
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('name email role isAdmin')

    if (!user) {
      return res.status(401).json({ message: 'Utente non trovato' })
    }

    const role = user.role || (user.isAdmin ? 'admin' : 'user')

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role,
      isAdmin: role === 'admin',
    }
    next()
  } catch (err) {
    console.log(err.message)
    return res.status(401).json({ message: 'Token non valido' })
  }
}
