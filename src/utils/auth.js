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

export function hasPermission(permission) {
  const user = getUserFromToken()
  if (!user) return false
  if (Array.isArray(user.permissions)) return user.permissions.includes(permission)
  return user.type === 'org_admin' || (user.roles || []).some(role => role.toLowerCase() === 'org admin')
}

export function canViewHierarchy() {
  return hasPermission('view_hierarchy') || getUserRole() !== null
}

export function canManageHierarchy() {
  return hasPermission('manage_hierarchy') || ['manager', 'org_admin'].includes(getUserRole())
}

/**
 * Returns the canonical role string used for routing and UI gating.
 *
 * Roles returned:
 *   'org_admin' — Organization admin (full access)
 *   'manager'   — Supervisor / manager / HR (team-scoped access)
 *   'employee'  — Regular employee (own data only)
 */
export function getUserRole() {
  const user = getUserFromToken()
  if (!user) return null

  // Primary type set by OrgAuthService at login
  if (user.type === 'org_admin') return 'org_admin'

  // Roles array from JWT
  const roles = (user.roles || []).map(r => r.toLowerCase())

  if (roles.includes('org admin')) return 'org_admin'

  // Supervisor / manager / HR — all get team-scoped access
  const managerKeywords = ['manager', 'supervisor', 'hr', 'team lead', 'lead', 'head', 'director', 'chief', 'vp', 'vice president']
  if (roles.some(r => managerKeywords.some(kw => r.includes(kw)))) return 'manager'

  return 'employee'
}

/**
 * Returns whether the current user can see team-level data.
 * Managers and Org Admins can; regular employees cannot.
 */
export function canViewTeamData() {
  const role = getUserRole()
  return role === 'manager' || role === 'org_admin'
}

/**
 * Returns whether the current user has full org-level admin access.
 */
export function isOrgAdmin() {
  return getUserRole() === 'org_admin'
}

export function logout() {
  localStorage.removeItem('token')
  window.location.href = '/'
}
