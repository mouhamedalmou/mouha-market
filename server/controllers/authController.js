const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : ''
}

function getUserRole(user) {
  return user.role || (user.isAdmin ? 'admin' : 'user')
}

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body
    const trimmedName = typeof name === 'string' ? name.trim() : ''
    const normalizedEmail = normalizeEmail(email)

    if (!trimmedName || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'Tutti i campi sono obbligatori' })
    }

    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      return res.status(400).json({ message: 'Email già registrata' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
    })

    res.status(201).json({
      message: 'Utente creato con successo',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: getUserRole(user),
        isAdmin: getUserRole(user) === 'admin',
      },
    })
  } catch (err) {
    console.error('REGISTER ERROR:', err.message)
    res.status(500).json({ message: 'Errore interno del server' })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    const normalizedEmail = normalizeEmail(email)

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Email e password sono obbligatorie' })
    }

    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
      return res.status(401).json({ message: 'Credenziali non valide' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenziali non valide' })
    }

    const token = jwt.sign(
      { id: user._id, role: getUserRole(user), isAdmin: getUserRole(user) === 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: getUserRole(user),
        isAdmin: getUserRole(user) === 'admin',
      },
    })
  } catch (err) {
    console.error('LOGIN ERROR:', err.message)
    res.status(500).json({ message: 'Errore interno del server' })
  }
}
