import { hasPermission } from '../utils/auth.js';

export function useHasPermission(requiredPermission) {
  return hasPermission(requiredPermission);
}
