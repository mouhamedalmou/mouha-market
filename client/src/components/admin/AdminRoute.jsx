import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getStoredToken, getStoredUser } from '../../services/session'

function AdminRoute() {
  const location = useLocation()
  const token = getStoredToken()
  const user = getStoredUser()
  const hasAdminAccess = user?.role === 'admin' || user?.isAdmin === true

  if (!token) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  }

  if (!hasAdminAccess) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default AdminRoute
