import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';
import { AppError } from './errorHandler.js';
import { verifySupabaseToken, isSupabaseConfigured } from '../lib/supabase.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    tier: 'FREE' | 'PRO';
  };
}

// Check if a token looks like a Supabase JWT (has the typical Supabase claims)
const isSupabaseToken = (decoded: any): boolean => {
  return decoded && (decoded.aud === 'authenticated' || decoded.sub);
};

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Authorization header missing or invalid', 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError(401, 'Access token missing', 'UNAUTHORIZED');
    }

    // Try to decode the token without verification to check its type
    let decoded: any;
    try {
      decoded = jwt.decode(token);
    } catch {
      throw new AppError(401, 'Invalid token format', 'INVALID_TOKEN');
    }

    // Check if this is a Supabase token
    if (isSupabaseConfigured() && isSupabaseToken(decoded)) {
      // Verify with Supabase
      const supabaseUser = await verifySupabaseToken(token);

      if (!supabaseUser) {
        throw new AppError(401, 'Invalid Supabase token', 'INVALID_TOKEN');
      }

      // Find or create user in our database
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { supabaseId: supabaseUser.id },
            { email: supabaseUser.email },
          ],
        },
        include: { subscription: true },
      });

      if (!user) {
        // Create new user from Supabase auth
        user = await prisma.user.create({
          data: {
            email: supabaseUser.email!,
            displayName: supabaseUser.user_metadata?.display_name ||
                        supabaseUser.user_metadata?.full_name ||
                        supabaseUser.email?.split('@')[0] || 'User',
            supabaseId: supabaseUser.id,
            emailVerified: supabaseUser.email_confirmed_at ? true : false,
            avatarUrl: supabaseUser.user_metadata?.avatar_url,
            googleId: supabaseUser.app_metadata?.provider === 'google'
              ? supabaseUser.user_metadata?.sub
              : null,
            subscription: {
              create: {
                tier: 'FREE',
                status: 'ACTIVE',
              },
            },
            preferences: {
              create: {},
            },
          },
          include: { subscription: true },
        });
      } else if (!user.supabaseId) {
        // Link existing user to Supabase account
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            supabaseId: supabaseUser.id,
            emailVerified: supabaseUser.email_confirmed_at ? true : user.emailVerified,
            avatarUrl: user.avatarUrl || supabaseUser.user_metadata?.avatar_url,
          },
          include: { subscription: true },
        });
      }

      // Update last active
      await prisma.user.update({
        where: { id: user.id },
        data: { lastActiveAt: new Date() },
      });

      req.user = {
        id: user.id,
        email: user.email,
        tier: user.subscription?.tier || 'FREE',
      };

      return next();
    }

    // Legacy JWT verification (for backwards compatibility during migration)
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError(500, 'JWT secret not configured', 'SERVER_ERROR');
    }

    try {
      const verifiedDecoded = jwt.verify(token, secret) as {
        userId: string;
        email: string;
      };

      // Get user with subscription info
      const user = await prisma.user.findUnique({
        where: { id: verifiedDecoded.userId },
        include: { subscription: true },
      });

      if (!user) {
        throw new AppError(401, 'User not found', 'UNAUTHORIZED');
      }

      // Update last active
      await prisma.user.update({
        where: { id: user.id },
        data: { lastActiveAt: new Date() },
      });

      req.user = {
        id: user.id,
        email: user.email,
        tier: user.subscription?.tier || 'FREE',
      };

      next();
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        throw new AppError(401, 'Access token expired', 'TOKEN_EXPIRED');
      }
      if (jwtError instanceof jwt.JsonWebTokenError) {
        throw new AppError(401, 'Invalid access token', 'INVALID_TOKEN');
      }
      throw jwtError;
    }
  } catch (error) {
    next(error);
  }
};

export const requirePro = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.tier !== 'PRO') {
    return res.status(403).json({
      error: 'Subscription Required',
      message: 'This feature requires a Pro subscription',
      upgradeUrl: '/pricing',
    });
  }
  next();
};

// Optional auth middleware - doesn't fail if no token, just sets user if available
export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    // Delegate to main auth middleware but catch errors
    await authMiddleware(req, res, (error) => {
      if (error) {
        // Log but don't fail - user just won't be authenticated
        console.warn('Optional auth failed:', error.message);
      }
      next();
    });
  } catch {
    // Silently continue without auth
    next();
  }
};
