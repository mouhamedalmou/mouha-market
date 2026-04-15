const mongoose = require('mongoose')
const Product = require('../models/Product')

exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, image, category, stock } = req.body

    if (!title || !description || price === undefined) {
      return res.status(400).json({ message: 'Titolo, descrizione e prezzo sono obbligatori' })
    }

    const product = await Product.create({
      title: title.trim(),
      description: description.trim(),
      price,
      image: image || '',
      category: category || 'general',
      stock: stock ?? 0,
    })

    res.status(201).json(product)
  } catch (err) {
    console.error('CREATE PRODUCT ERROR:', err.message)
    res.status(500).json({ message: 'Errore interno del server' })
  }
}

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 })
    res.json(products)
  } catch (err) {
    console.error('GET PRODUCTS ERROR:', err.message)
    res.status(500).json({ message: 'Errore interno del server' })
  }
}

exports.getProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID prodotto non valido' })
    }

    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Prodotto non trovato' })
    }

    res.json(product)
  } catch (err) {
    console.error('GET PRODUCT BY ID ERROR:', err.message)
    res.status(500).json({ message: 'Errore interno del server' })
  }
}

exports.updateProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID prodotto non valido' })
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Prodotto non trovato' })
    }

    res.json(updatedProduct)
  } catch (err) {
    console.error('UPDATE PRODUCT ERROR:', err.message)
    res.status(500).json({ message: 'Errore interno del server' })
  }
}

exports.deleteProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID prodotto non valido' })
    }

    const deletedProduct = await Product.findByIdAndDelete(req.params.id)

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Prodotto non trovato' })
    }

    res.json({ message: 'Prodotto eliminato con successo' })
  } catch (err) {
    console.error('DELETE PRODUCT ERROR:', err.message)
    res.status(500).json({ message: 'Errore interno del server' })
  }
}
