require('dotenv').config()

const mongoose = require('mongoose')
const Product = require('../models/Product')
const products = require('../data/products')

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI

async function seedProducts() {
  if (!MONGODB_URI) {
    throw new Error('Variabile ambiente MongoDB mancante: usa MONGODB_URI nella .env')
  }

  await mongoose.connect(MONGODB_URI)

  const operations = products.map(product => ({
    updateOne: {
      filter: { title: product.title },
      update: { $set: product },
      upsert: true,
    },
  }))

  const result = await Product.bulkWrite(operations)
  const totalProducts = await Product.countDocuments()

  console.log(
    `Prodotti sincronizzati. Inseriti: ${result.upsertedCount}, aggiornati: ${result.modifiedCount}, totale catalogo: ${totalProducts}`
  )
}

seedProducts()
  .catch((error) => {
    console.error('SEED PRODUCTS ERROR:', error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.connection.close()
  })
