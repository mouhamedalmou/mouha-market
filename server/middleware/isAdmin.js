module.exports = (req, res, next) => {
  const role = req.user?.isAdmin || req.user?.role === 'admin' ? 'admin' : 'user'

  if (role !== 'admin') {
    return res.status(403).json({ message: 'Accesso riservato agli admin' })
  }

  next()
}
