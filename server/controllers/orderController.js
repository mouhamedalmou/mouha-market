const mongoose = require('mongoose')
const Order = require('../models/Order')
const Product = require('../models/Product')

async function rollbackStock(updates) {
  for (const update of updates) {
    try {
      await Product.findByIdAndUpdate(update.productId, {
        $inc: { stock: update.quantity },
      })
    } catch (rollbackError) {
      console.error('ROLLBACK STOCK ERROR:', rollbackError.message)
    }
  }
}

exports.createOrder = async (req, res) => {
  const decrementedProducts = []

  try {
    const { items } = req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Carrello vuoto' })
    }

    const groupedItems = new Map()

    for (const item of items) {
      const productId = item?.productId
      const quantity = Number(item?.quantity)

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: 'Prodotto non valido nel carrello' })
      }

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: 'Quantità non valida nel carrello' })
      }

      const key = String(productId)
      const existingQuantity = groupedItems.get(key)?.quantity || 0

      groupedItems.set(key, {
        productId: key,
        quantity: existingQuantity + quantity,
      })
    }

    const productIds = [...groupedItems.keys()]
    const products = await Product.find({ _id: { $in: productIds } })
    const productsById = new Map(products.map(product => [String(product._id), product]))

    if (products.length !== productIds.length) {
      return res.status(400).json({ message: 'Uno o più prodotti non esistono più' })
    }

    let totalCents = 0
    const orderItems = []

    for (const { productId, quantity } of groupedItems.values()) {
      const product = productsById.get(productId)

      if (product.stock < quantity) {
        return res.status(400).json({
          message: `Stock insufficiente per ${product.title}`,
        })
      }

      const unitPriceCents = Math.round(product.price * 100)
      totalCents += unitPriceCents * quantity

      orderItems.push({
        productId: product._id,
        title: product.title,
        price: product.price,
        quantity,
        image: product.image,
      })
    }

    for (const item of orderItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
        },
        { new: true }
      )

      if (!updatedProduct) {
        await rollbackStock(decrementedProducts)

        return res.status(409).json({
          message: 'Lo stock è cambiato. Aggiorna il carrello e riprova',
        })
      }

      decrementedProducts.push({
        productId: item.productId,
        quantity: item.quantity,
      })
    }

    const totalAmount = totalCents / 100
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
    })

    res.status(201).json({
      message: 'Ordine creato con successo',
      order,
    })
  } catch (err) {
    if (decrementedProducts.length > 0) {
      await rollbackStock(decrementedProducts)
    }

    console.error('CREATE ORDER ERROR:', err.message)
    res.status(500).json({ message: 'Errore interno del server' })
  }
}

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) {
    console.error('GET MY ORDERS ERROR:', err.message)
    res.status(500).json({ message: 'Errore interno del server' })
  }
}

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })

    res.json(orders)
  } catch (err) {
    console.error('GET ALL ORDERS ERROR:', err.message)
    res.status(500).json({ message: 'Errore interno del server' })
  }
}
