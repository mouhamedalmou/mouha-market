module.exports = (req, res, next) => {
  const role = req.user?.role || (req.user?.isAdmin ? 'admin' : 'user')

  if (role !== 'admin') {
    return res.status(403).json({ message: 'Accesso riservato agli admin' })
  }

  next()
}
