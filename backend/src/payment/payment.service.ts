import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Tenant, TenantPlan } from '../tenants/entities/tenant.entity';

/**
 * Payment Service
 * 
 * Setup Instructions:
 * 1. Create Stripe account at stripe.com
 * 2. Get API keys (publishable & secret)
 * 3. Add to .env: STRIPE_SECRET_KEY=sk_xxx, STRIPE_PUBLISHABLE_KEY=pk_xxx
 * 4. Install: npm install stripe
 * 5. Uncomment Stripe integration code below
 */

export interface CreateSubscriptionDto {
  tenantId: string;
  plan: TenantPlan;
  paymentMethodId: string;
}

export interface CreateCheckoutSessionDto {
  tenantId: string;
  plan: TenantPlan;
  successUrl: string;
  cancelUrl: string;
}

@Injectable()
export class PaymentService {
  // private stripe: Stripe;

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {
    // Initialize Stripe (uncomment when ready)
    /*
    const Stripe = require('stripe');
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
    */
  }

  /**
   * Get plan pricing
   */
  getPlanPricing(plan: TenantPlan): {
    monthlyPrice: number;
    yearlyPrice: number;
    currency: string;
    features: string[];
  } {
    const pricing = {
      [TenantPlan.FREE]: {
        monthlyPrice: 0,
        yearlyPrice: 0,
        currency: 'USD',
        features: ['50 users', '10 events', 'Basic matching', 'Messaging'],
      },
      [TenantPlan.STARTER]: {
        monthlyPrice: 99,
        yearlyPrice: 990, // 2 months free
        currency: 'USD',
        features: [
          '200 users',
          '50 events',
          'Basic + Advanced matching',
          'Messaging',
          'Meetings',
          'Analytics',
        ],
      },
      [TenantPlan.PROFESSIONAL]: {
        monthlyPrice: 299,
        yearlyPrice: 2990,
        currency: 'USD',
        features: [
          '1,000 users',
          '200 events',
          'All matching algorithms',
          'Full features',
          'Custom branding',
          'Priority support',
        ],
      },
      [TenantPlan.ENTERPRISE]: {
        monthlyPrice: 999,
        yearlyPrice: 9990,
        currency: 'USD',
        features: [
          'Unlimited users',
          'Unlimited events',
          'White-label',
          'Custom domain',
          'API access',
          'SSO',
          'Dedicated support',
        ],
      },
    };

    return pricing[plan];
  }

  /**
   * Create Stripe checkout session
   */
  async createCheckoutSession(dto: CreateCheckoutSessionDto): Promise<{ sessionId: string; url: string }> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: dto.tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const pricing = this.getPlanPricing(dto.plan);

    console.log(`Creating checkout session for ${tenant.name} - ${dto.plan} plan`);

    // Mock response for development
    if (process.env.NODE_ENV !== 'production') {
      return {
        sessionId: 'cs_test_123456',
        url: `${dto.successUrl}?session_id=cs_test_123456`,
      };
    }

    // Stripe integration (uncomment when ready)
    /*
    const session = await this.stripe.checkout.sessions.create({
      customer_email: tenant.contactEmail,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: pricing.currency.toLowerCase(),
            product_data: {
              name: `Oniki Network - ${dto.plan} Plan`,
              description: pricing.features.join(', '),
            },
            recurring: {
              interval: 'month',
            },
            unit_amount: pricing.monthlyPrice * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: dto.successUrl,
      cancel_url: dto.cancelUrl,
      metadata: {
        tenantId: dto.tenantId,
        plan: dto.plan,
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
    */

    return {
      sessionId: 'mock_session',
      url: dto.successUrl,
    };
  }

  /**
   * Handle Stripe webhook
   */
  async handleStripeWebhook(event: any): Promise<void> {
    console.log('Stripe webhook received:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionCancelled(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  /**
   * Handle checkout completed
   */
  private async handleCheckoutCompleted(session: any): Promise<void> {
    const tenantId = session.metadata?.tenantId;
    const plan = session.metadata?.plan;

    if (tenantId && plan) {
      const tenant = await this.tenantRepository.findOne({
        where: { id: tenantId },
      });

      if (tenant) {
        tenant.plan = plan;
        tenant.subscriptionStartedAt = new Date();
        tenant.subscriptionEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        await this.tenantRepository.save(tenant);

        console.log(`Subscription activated for tenant: ${tenant.name}`);
      }
    }
  }

  /**
   * Handle subscription updated
   */
  private async handleSubscriptionUpdated(subscription: any): Promise<void> {
    console.log('Subscription updated:', subscription.id);
    // Update tenant subscription details
  }

  /**
   * Handle subscription cancelled
   */
  private async handleSubscriptionCancelled(subscription: any): Promise<void> {
    console.log('Subscription cancelled:', subscription.id);
    // Downgrade tenant to free plan
  }

  /**
   * Handle payment succeeded
   */
  private async handlePaymentSucceeded(invoice: any): Promise<void> {
    console.log('Payment succeeded:', invoice.id);
    // Extend subscription period
  }

  /**
   * Handle payment failed
   */
  private async handlePaymentFailed(invoice: any): Promise<void> {
    console.log('Payment failed:', invoice.id);
    // Send payment failed email
    // Set grace period
  }

  /**
   * Get customer billing portal URL
   */
  async createBillingPortalSession(tenantId: string, returnUrl: string): Promise<{ url: string }> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Mock for development
    if (process.env.NODE_ENV !== 'production') {
      return {
        url: `${returnUrl}?portal=mock`,
      };
    }

    // Stripe integration (uncomment when ready)
    /*
    const session = await this.stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId, // Add this field to Tenant entity
      return_url: returnUrl,
    });

    return {
      url: session.url,
    };
    */

    return {
      url: returnUrl,
    };
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(tenantId: string): Promise<void> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Mock for development
    console.log(`Cancelling subscription for tenant: ${tenant.name}`);

    // Stripe integration (uncomment when ready)
    /*
    if (tenant.stripeSubscriptionId) {
      await this.stripe.subscriptions.cancel(tenant.stripeSubscriptionId);
    }
    */

    // Update tenant
    tenant.plan = TenantPlan.FREE;
    tenant.subscriptionEndsAt = new Date(); // Immediate cancellation
    await this.tenantRepository.save(tenant);
  }

  /**
   * Get invoice history
   */
  async getInvoiceHistory(tenantId: string): Promise<any[]> {
    // Mock invoices for development
    return [
      {
        id: 'inv_001',
        date: new Date('2025-09-01'),
        amount: 99,
        status: 'paid',
        plan: TenantPlan.STARTER,
        invoiceUrl: '#',
      },
      {
        id: 'inv_002',
        date: new Date('2025-10-01'),
        amount: 99,
        status: 'paid',
        plan: TenantPlan.STARTER,
        invoiceUrl: '#',
      },
    ];

    // Stripe integration (uncomment when ready)
    /*
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant || !tenant.stripeCustomerId) {
      return [];
    }

    const invoices = await this.stripe.invoices.list({
      customer: tenant.stripeCustomerId,
      limit: 12,
    });

    return invoices.data.map((inv) => ({
      id: inv.id,
      date: new Date(inv.created * 1000),
      amount: inv.amount_paid / 100,
      status: inv.status,
      invoiceUrl: inv.invoice_pdf,
    }));
    */
  }
}

