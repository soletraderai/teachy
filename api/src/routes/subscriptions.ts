import { Router, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { prisma } from '../index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// Only initialize Stripe if a real key is provided
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey && stripeKey !== 'sk_test_placeholder'
  ? new Stripe(stripeKey)
  : null;

const PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY || 'price_monthly',
  yearly: process.env.STRIPE_PRICE_YEARLY || 'price_yearly',
};

// GET /api/subscriptions/status
router.get('/status', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user!.id },
    });

    res.json({
      tier: subscription?.tier || 'FREE',
      status: subscription?.status || 'ACTIVE',
      currentPeriodEnd: subscription?.currentPeriodEnd,
      cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd || false,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/subscriptions/checkout
router.post('/checkout', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!stripe) {
      throw new AppError(503, 'Payment processing is not configured', 'STRIPE_NOT_CONFIGURED');
    }

    const { priceType } = req.body; // 'monthly' or 'yearly'

    const priceId = priceType === 'yearly' ? PRICES.yearly : PRICES.monthly;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { subscription: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    // Get or create Stripe customer
    let customerId = user.subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.displayName,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      // Update subscription with customer ID
      await prisma.subscription.update({
        where: { userId: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      metadata: { userId: user.id },
    });

    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
});

// POST /api/subscriptions/portal
router.post('/portal', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!stripe) {
      throw new AppError(503, 'Payment processing is not configured', 'STRIPE_NOT_CONFIGURED');
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user!.id },
    });

    if (!subscription?.stripeCustomerId) {
      throw new AppError(400, 'No subscription found', 'NO_SUBSCRIPTION');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/settings`,
    });

    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
});

// POST /api/subscriptions/dev-upgrade - Development mode subscription upgrade
router.post('/dev-upgrade', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      throw new AppError(403, 'Not available in production', 'NOT_ALLOWED');
    }

    const { billingType } = req.body;
    const isYearly = billingType === 'yearly';

    // Calculate period dates
    const now = new Date();
    const periodEnd = new Date(now);
    if (isYearly) {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Update subscription to PRO
    await prisma.subscription.upsert({
      where: { userId: req.user!.id },
      create: {
        userId: req.user!.id,
        tier: 'PRO',
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        stripeCustomerId: `dev_customer_${req.user!.id}`,
        stripeSubscriptionId: `dev_sub_${Date.now()}`,
      },
      update: {
        tier: 'PRO',
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        stripeSubscriptionId: `dev_sub_${Date.now()}`,
      },
    });

    res.json({
      success: true,
      message: 'Subscription upgraded to PRO (development mode)',
      billingType,
      periodEnd: periodEnd.toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/subscriptions/verify - Verify checkout session
router.post('/verify', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!stripe) {
      throw new AppError(503, 'Payment processing is not configured', 'STRIPE_NOT_CONFIGURED');
    }

    const { sessionId } = req.body;

    if (!sessionId) {
      throw new AppError(400, 'Session ID is required', 'MISSING_SESSION_ID');
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== 'paid') {
      throw new AppError(400, 'Payment not completed', 'PAYMENT_NOT_COMPLETED');
    }

    // The webhook should have already updated the subscription,
    // but verify and update if needed
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user!.id },
    });

    if (subscription?.tier !== 'PRO') {
      // Update if webhook hasn't processed yet
      await prisma.subscription.update({
        where: { userId: req.user!.id },
        data: {
          tier: 'PRO',
          status: 'ACTIVE',
          stripeSubscriptionId: session.subscription as string,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    res.json({ success: true, message: 'Subscription verified' });
  } catch (error) {
    next(error);
  }
});

export default router;
