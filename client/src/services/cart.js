const CART_STORAGE_KEY = 'cart'
const CART_UPDATED_EVENT = 'cart-updated'

function dispatchCartUpdate() {
  window.dispatchEvent(new Event(CART_UPDATED_EVENT))
}

export function getStoredCart() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedCart = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY))
    return Array.isArray(storedCart) ? storedCart : []
  } catch {
    return []
  }
}

export function saveStoredCart(cart) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  dispatchCartUpdate()
}

export function clearStoredCart() {
  window.localStorage.removeItem(CART_STORAGE_KEY)
  dispatchCartUpdate()
}

export function getCartItemCount() {
  return getStoredCart().reduce(
    (sum, item) => sum + Math.max(0, Number(item.quantity) || 0),
    0
  )
}

export function subscribeToCartChanges(callback) {
  const handleChange = () => callback(getStoredCart())

  window.addEventListener(CART_UPDATED_EVENT, handleChange)
  window.addEventListener('storage', handleChange)

  return () => {
    window.removeEventListener(CART_UPDATED_EVENT, handleChange)
    window.removeEventListener('storage', handleChange)
  }
}
