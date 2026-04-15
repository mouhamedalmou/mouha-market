const express = require('express')
const router = express.Router()

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController')

const auth = require('../middleware/auth')
const admin = require('../middleware/admin')

// pubbliche
router.get('/', getProducts)
router.get('/:id', getProductById)

// protette admin
router.post('/', auth, admin, createProduct)
router.put('/:id', auth, admin, updateProduct)
router.delete('/:id', auth, admin, deleteProduct)

module.exports = router