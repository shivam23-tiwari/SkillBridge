import { UserPlan, SubscriptionBilling } from '../types';

/**
 * =========================================================================
 * PAYMENT SERVICE (RAZORPAY INTEGRATION INTERFACE)
 * =========================================================================
 * 
 * DEMO MODE NOTICE:
 * This service runs in simulated demo mode. No real payments are charged.
 * Real credit/debit card numbers are never collected or stored.
 * 
 * FUTURE PRODUCTION SETUP:
 * When ready to accept live payments via Razorpay:
 * 1. Deploy a small backend Web Service (Express / Supabase Edge Function).
 * 2. In your backend, implement:
 *      POST /api/create-razorpay-order
 *      const order = await razorpay.orders.create({ amount: amountInPaise, currency: 'INR', receipt });
 * 3. In the client, load https://checkout.razorpay.com/v1/checkout.js and initialize:
 *      const rzp = new window.Razorpay({ key: VITE_RAZORPAY_KEY, order_id: order.id, handler: verifyCallback });
 * 4. Verify payment signature on the backend using crypto HMAC SHA256:
 *      generated_signature = hmac_sha256(order_id + "|" + razorpay_payment_id, secret);
 * 5. Update subscriptions in Supabase.
 */

export interface PaymentOrder {
  id: string;
  amount: number; // in INR
  currency: string;
  plan: UserPlan;
  billing: SubscriptionBilling;
  status: 'created' | 'paid' | 'failed';
  createdAt: string;
}

export interface PaymentResult {
  success: boolean;
  orderId: string;
  paymentId: string;
  signature?: string;
  error?: string;
}

export const PaymentService = {
  /**
   * Creates a pending payment order.
   * Matches the Razorpay Orders API contract.
   */
  async createOrder(plan: UserPlan, billing: SubscriptionBilling): Promise<PaymentOrder> {
    // Calculate pricing in INR
    let amount = 0;
    if (plan === 'basic') {
      amount = 99; // ₹99 one-time
    } else if (plan === 'premium') {
      amount = billing === 'yearly' ? 1499 : 299; // ₹1,499/year or ₹299/month
    }

    // Simulate backend network latency
    await new Promise(res => setTimeout(res, 400));

    const orderId = `order_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;

    return {
      id: orderId,
      amount,
      currency: 'INR',
      plan,
      billing,
      status: 'created',
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Completes a simulated checkout.
   * In demo mode, does NOT collect real card numbers.
   */
  async processSimulatedPayment(
    order: PaymentOrder,
    method: 'upi' | 'card' | 'netbanking',
    paymentDetails?: { upiId?: string; cardLast4?: string; bankName?: string }
  ): Promise<PaymentResult> {
    // Simulate gateway verification
    await new Promise(res => setTimeout(res, 900));

    const paymentId = `pay_demo_${Math.random().toString(36).substring(2, 12)}`;
    const mockSignature = `sig_demo_${Math.random().toString(36).substring(2, 16)}`;

    return {
      success: true,
      orderId: order.id,
      paymentId,
      signature: mockSignature,
    };
  },
};
