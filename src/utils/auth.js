// Utility to decode a JWT without a library (base64 decode the payload)
export function decodeToken(token) {
  if (!token) return null
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return decoded
  } catch {
    return null
  }
}

export function getStoredToken() {
  return localStorage.getItem('token')
}

export function getUserFromToken() {
  return decodeToken(getStoredToken())
}

// Returns the primary role string: 'org_admin', 'Manager', 'Employee', etc.
export function getUserRole() {
  const user = getUserFromToken()
  if (!user) return null
  // type field from OrgAuthService = 'org_admin'
  if (user.type === 'org_admin') return 'org_admin'
  // For employees, check the roles array
  const roles = user.roles || []
  if (roles.includes('Org Admin')) return 'org_admin'
  if (roles.some(r => r.toLowerCase().includes('manager') || r.toLowerCase().includes('hr'))) return 'manager'
  return 'employee'
}

export function logout() {
  localStorage.removeItem('token')
  window.location.href = '/'
}
