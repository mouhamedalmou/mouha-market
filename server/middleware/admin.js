module.exports = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: 'Accesso riservato agli admin' })
  }

  next()
}