import { getUserFromToken, getUserRole } from '../utils/auth.js';

export function useHasRole(requiredRoles) {
  const user = getUserFromToken();
  if (!user) return false;

  const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  const canonicalRole = getUserRole();
  const userRoles = (user.roles || []).map((r) => r.toLowerCase());

  return rolesArray.some((reqRole) => {
    const lowerReq = reqRole.toLowerCase();
    if (lowerReq === 'org_admin' || lowerReq === 'admin') {
      return canonicalRole === 'org_admin' || userRoles.includes('org admin') || userRoles.includes('admin');
    }
    if (lowerReq === 'ceo') {
      return canonicalRole === 'org_admin' || userRoles.includes('ceo');
    }
    return userRoles.includes(lowerReq) || canonicalRole === lowerReq;
  });
}
