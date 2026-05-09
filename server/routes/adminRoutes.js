const express = require('express')
const router = express.Router()

const {
  createAdminOrder,
  createAdminProduct,
  deleteAdminOrder,
  deleteAdminProduct,
  getAdminOrders,
  getAdminProducts,
  getAdminUsers,
  getDashboardStats,
  updateAdminOrder,
  updateAdminProduct,
} = require('../controllers/adminController')

const auth = require('../middleware/auth')
const isAdmin = require('../middleware/isAdmin')

router.use(auth, isAdmin)

router.get('/stats', getDashboardStats)
router.get('/users', getAdminUsers)

router.get('/orders', getAdminOrders)
router.post('/orders', createAdminOrder)
router.put('/orders/:id', updateAdminOrder)
router.delete('/orders/:id', deleteAdminOrder)

router.get('/products', getAdminProducts)
router.post('/products', createAdminProduct)
router.put('/products/:id', updateAdminProduct)
router.delete('/products/:id', deleteAdminProduct)

module.exports = router
