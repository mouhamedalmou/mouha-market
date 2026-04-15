const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const productRoutes = require('./routes/product')
const orderRoutes = require('./routes/order')

const app = express()
const PORT = process.env.PORT || 3000
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI

app.use(cors())
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)

app.get('/', (req, res) => {
  res.send('E-commerce API funzionante 🚀')
})

async function startServer() {
  if (!MONGODB_URI) {
    console.error('Variabile ambiente MongoDB mancante: usa MONGODB_URI nella .env')
    process.exit(1)
  }

  try {
    await mongoose.connect(MONGODB_URI)
    console.log('MongoDB connesso')

    app.listen(PORT, () => {
      console.log(`Server avviato su porta ${PORT}`)
    })
  } catch (err) {
    console.error('Errore MongoDB:', err.message)
    process.exit(1)
  }
}

startServer()
