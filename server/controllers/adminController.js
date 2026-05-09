const mongoose = require('mongoose')
const Order = require('../models/Order')
const Product = require('../models/Product')
const User = require('../models/User')

const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered']

function isObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value)
}

function normalizeTitle(body) {
  return typeof body.title === 'string' && body.title.trim()
    ? body.title.trim()
    : typeof body.name === 'string'
      ? body.name.trim()
      : ''
}

function parseNonNegativeNumber(value, fieldName) {
  const number = Number(value)

  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`${fieldName} non valido`)
  }

  return number
}

function parseNonNegativeInteger(value, fieldName) {
  const number = Number(value)

  if (!Number.isInteger(number) || number < 0) {
    throw new Error(`${fieldName} non valido`)
  }

  return number
}

function serializeProductPayload(body, { partial = false } = {}) {
  const payload = {}
  const title = normalizeTitle(body)

  if (!partial || title) {
    if (!title) {
      throw new Error('Nome prodotto obbligatorio')
    }
    payload.title = title
  }

  if (!partial || body.description !== undefined) {
    const description = typeof body.description === 'string' ? body.description.trim() : ''

    if (!description) {
      throw new Error('Descrizione prodotto obbligatoria')
    }

    payload.description = description
  }

  if (!partial || body.price !== undefined) {
    payload.price = parseNonNegativeNumber(body.price, 'Prezzo')
  }

  if (!partial || body.stock !== undefined) {
    payload.stock = parseNonNegativeInteger(body.stock, 'Stock')
  }

  if (!partial || body.category !== undefined) {
    payload.category =
      typeof body.category === 'string' && body.category.trim()
        ? body.category.trim()
        : 'general'
  }

  if (!partial || body.image !== undefined) {
    payload.image = typeof body.image === 'string' ? body.image.trim() : ''
  }

  return payload
}

async function buildOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Aggiungi almeno un prodotto all'ordine")
  }

  const groupedItems = new Map()

  for (const item of items) {
    const productId = item?.productId || item?._id
    const quantity = Number(item?.quantity)

    if (!isObjectId(productId)) {
      throw new Error('Prodotto non valido')
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error('Quantità non valida')
    }

    const key = String(productId)
    groupedItems.set(key, {
      productId: key,
      quantity: (groupedItems.get(key)?.quantity || 0) + quantity,
    })
  }

  const productIds = [...groupedItems.keys()]
  const products = await Product.find({ _id: { $in: productIds } })
  const productsById = new Map(products.map(product => [String(product._id), product]))

  if (products.length !== productIds.length) {
    throw new Error('Uno o più prodotti non esistono')
  }

  let totalCents = 0
  const orderItems = []

  for (const { productId, quantity } of groupedItems.values()) {
    const product = productsById.get(productId)

    if (product.stock < quantity) {
      throw new Error(`Stock insufficiente per ${product.title}`)
    }

    totalCents += Math.round(product.price * 100) * quantity
    orderItems.push({
      productId: product._id,
      title: product.title,
      price: product.price,
      quantity,
      image: product.image,
    })
  }

  return {
    items: orderItems,
    totalAmount: totalCents / 100,
  }
}

async function decrementStock(orderItems) {
  const decrementedProducts = []

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
      for (const update of decrementedProducts) {
        await Product.findByIdAndUpdate(update.productId, {
          $inc: { stock: update.quantity },
        })
      }

      throw new Error('Lo stock è cambiato. Aggiorna i dati e riprova')
    }

    decrementedProducts.push({
      productId: item.productId,
      quantity: item.quantity,
    })
  }
}

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalOrders, totalProducts, pendingOrders, revenueAgg, recentOrders, monthlyRevenue] =
      await Promise.all([
        Order.countDocuments(),
        Product.countDocuments(),
        Order.countDocuments({ status: 'pending' }),
        Order.aggregate([
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        Order.find()
          .populate('user', 'name email')
          .sort({ createdAt: -1 })
          .limit(6),
        Order.aggregate([
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
              revenue: { $sum: '$totalAmount' },
              orders: { $sum: 1 },
            },
          },
          { $sort: { _id: -1 } },
          { $limit: 12 },
          { $sort: { _id: 1 } },
        ]),
      ])

    res.json({
      totalOrders,
      totalRevenue: revenueAgg[0]?.total || 0,
      totalProducts,
      pendingOrders,
      recentOrders,
      monthlyRevenue: monthlyRevenue.map(item => ({
        month: item._id,
        revenue: item.revenue,
        orders: item.orders,
      })),
    })
  } catch (err) {
    console.error('ADMIN STATS ERROR:', err.message)
    res.status(500).json({ message: 'Errore interno del server' })
  }
}

exports.getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })

    res.json(orders)
  } catch (err) {
    console.error('ADMIN GET ORDERS ERROR:', err.message)
    res.status(500).json({ message: 'Errore interno del server' })
  }
}

exports.createAdminOrder = async (req, res) => {
  try {
    const userId = req.body.userId || req.body.user
    const status = req.body.status || 'pending'

    if (!isObjectId(userId)) {
      return res.status(400).json({ message: 'Cliente non valido' })
    }

    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Status ordine non valido' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'Cliente non trovato' })
    }

    const orderPayload = await buildOrderItems(req.body.items)
    await decrementStock(orderPayload.items)

    const order = await Order.create({
      user: user._id,
      items: orderPayload.items,
      totalAmount: orderPayload.totalAmount,
      status,
    })

    const populatedOrder = await order.populate('user', 'name email')
    res.status(201).json(populatedOrder)
  } catch (err) {
    console.error('ADMIN CREATE ORDER ERROR:', err.message)
    res.status(400).json({ message: err.message || 'Errore durante la creazione ordine' })
  }
}

exports.updateAdminOrder = async (req, res) => {
  try {
    if (!isObjectId(req.params.id)) {
      return res.status(400).json({ message: 'ID ordine non valido' })
    }

    const { status } = req.body
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Status ordine non valido' })
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('user', 'name email')

    if (!order) {
      return res.status(404).json({ message: 'Ordine non trovato' })
    }

    res.json(order)
  } catch (err) {
    console.error('ADMIN UPDATE ORDER ERROR:', err.message)
    res.status(500).json({ message: 'Errore interno del server' })
  }
}

exports.deleteAdminOrder = async (req, res) => {
  try {
    if (!isObjectId(req.params.id)) {
      return res.status(400).json({ message: 'ID ordine non valido' })
    }

    const order = await Order.findByIdAndDelete(req.params.id)

    if (!order) {
      return res.status(404).json({ message: 'Ordine non trovato' })
    }

    res.json({ message: 'Ordine eliminato con successo' })
  } catch (err) {
    console.error('ADMIN DELETE ORDER ERROR:', err.message)
    res.status(500).json({ message: 'Errore interno del server' })
  }
}

exports.getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 })
    res.json(products)
  } catch (err) {
    console.error('ADMIN GET PRODUCTS ERROR:', err.message)
    res.status(500).json({ message: 'Errore interno del server' })
  }
}

exports.createAdminProduct = async (req, res) => {
  try {
    const payload = serializeProductPayload(req.body)
    const product = await Product.create(payload)
    res.status(201).json(product)
  } catch (err) {
    console.error('ADMIN CREATE PRODUCT ERROR:', err.message)
    res.status(400).json({ message: err.message || 'Errore durante la creazione prodotto' })
  }
}

exports.updateAdminProduct = async (req, res) => {
  try {
    if (!isObjectId(req.params.id)) {
      return res.status(400).json({ message: 'ID prodotto non valido' })
    }

    const payload = serializeProductPayload(req.body, { partial: true })
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    )

    if (!product) {
      return res.status(404).json({ message: 'Prodotto non trovato' })
    }

    res.json(product)
  } catch (err) {
    console.error('ADMIN UPDATE PRODUCT ERROR:', err.message)
    res.status(400).json({ message: err.message || 'Errore durante aggiornamento prodotto' })
  }
}

exports.deleteAdminProduct = async (req, res) => {
  try {
    if (!isObjectId(req.params.id)) {
      return res.status(400).json({ message: 'ID prodotto non valido' })
    }

    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Prodotto non trovato' })
    }

    res.json({ message: 'Prodotto eliminato con successo' })
  } catch (err) {
    console.error('ADMIN DELETE PRODUCT ERROR:', err.message)
    res.status(500).json({ message: 'Errore interno del server' })
  }
}

exports.getAdminUsers = async (req, res) => {
  try {
    const [users, orderStats] = await Promise.all([
      User.find().select('-password').sort({ createdAt: -1 }),
      Order.aggregate([
        {
          $group: {
            _id: '$user',
            orderCount: { $sum: 1 },
            totalSpent: { $sum: '$totalAmount' },
          },
        },
      ]),
    ])

    const statsByUser = new Map(orderStats.map(item => [String(item._id), item]))

    res.json(users.map(user => {
      const stats = statsByUser.get(String(user._id))
      const role = user.isAdmin || user.role === 'admin' ? 'admin' : 'user'

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        role,
        isAdmin: role === 'admin',
        createdAt: user.createdAt,
        orderCount: stats?.orderCount || 0,
        totalSpent: stats?.totalSpent || 0,
      }
    }))
  } catch (err) {
    console.error('ADMIN GET USERS ERROR:', err.message)
    res.status(500).json({ message: 'Errore interno del server' })
  }
}
