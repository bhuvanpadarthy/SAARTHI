import { getSupabase, isSupabaseConfigured } from '../config/supabase.js';
import { store, DEFAULT_SHOP_ID } from '../storage/store.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication token missing or invalid. Please supply Bearer token in Authorization header.',
        },
      });
    }

    const token = authHeader.split(' ')[1]?.trim();
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Bearer token format is invalid.',
        },
      });
    }

    // 1. If Supabase is fully configured, verify with Supabase Auth
    if (isSupabaseConfigured) {
      const supabase = getSupabase();
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Session token has expired or is invalid.',
          },
        });
      }

      req.user = user;
    } else {
      // 2. Dev / Testing / Offline Mode
      // Support mock bearer tokens for automated tests and local developer setup
      if (token === 'mock-owner-token') {
        req.user = { id: 'usr-admin-01', email: 'owner@saarthi.local', role: 'authenticated' };
      } else if (token === 'mock-cashier-token') {
        req.user = { id: 'usr-cashier-01', email: 'cashier@saarthi.local', role: 'authenticated' };
      } else if (token.startsWith('user-')) {
        req.user = { id: token, email: `${token}@saarthi.local`, role: 'authenticated' };
      } else {
        // Default authenticated demo operator
        req.user = { id: 'usr-admin-01', email: 'admin@saarthi.local', role: 'authenticated' };
      }
    }

    // Attach shop context & role by looking up shop membership
    // Never trust client-supplied shop ID in body or query!
    const targetShopId = req.headers['x-shop-id'] || DEFAULT_SHOP_ID;
    const member = await store.getMember(targetShopId, req.user.id);

    if (!member) {
      // If no membership found, check if this is the default shop in dev/test
      if (!isSupabaseConfigured && targetShopId === DEFAULT_SHOP_ID) {
        req.shopId = DEFAULT_SHOP_ID;
        req.userRole = 'owner';
        return next();
      }

      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_SHOP_ACCESS',
          message: 'You are not an active member of this shop.',
        },
      });
    }

    req.shopId = member.shop_id;
    req.userRole = member.role;
    next();
  } catch (err) {
    next(err);
  }
};

// Role-based permission guard
export const requireRole = (allowedRoles = ['owner', 'manager']) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied: role not established.',
        },
      });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `Operation requires one of the following roles: [${allowedRoles.join(', ')}]. Current role: ${req.userRole}`,
        },
      });
    }

    next();
  };
};
