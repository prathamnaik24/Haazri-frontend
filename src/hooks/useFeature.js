import { getUserFromToken } from '../utils/auth.js';

export function useHasFeature(requiredFeature) {
  const user = getUserFromToken();
  if (!user) return false;

  // Org Admin / CEO role bypass or features check
  if (user.type === 'org_admin') return true;

  const features = user.features || [
    'basic_attendance',
    'basic_leaves',
    'financial_dashboard',
    'billing_portal',
    'subscription_management',
  ];

  return features.includes(requiredFeature);
}
