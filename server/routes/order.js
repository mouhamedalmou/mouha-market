const express = require('express')
const router = express.Router()

const {
  createOrder,
  getMyOrders,
  getAllOrders,
} = require('../controllers/orderController')

const auth = require('../middleware/auth')
const admin = require('../middleware/admin')

router.post('/', auth, createOrder)
router.get('/my-orders', auth, getMyOrders)
router.get('/', auth, admin, getAllOrders)

module.exports = router