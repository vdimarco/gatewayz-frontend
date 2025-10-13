# Stripe Webhook Setup Guide

## Issue
Stripe webhooks are failing with 404 error when trying to reach:
```
https://api.gatewayz.ai/payments/webhook
```

## Solution: Use Frontend Webhook

The frontend already has a working webhook handler at:
```
https://beta.gatewayz.ai/api/stripe/webhook
```

## Setup Steps

### 1. Add Environment Variables

Add these to your `.env.local` file (or production environment):

```bash
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret
```

**Where to find these:**
- **STRIPE_SECRET_KEY**: Stripe Dashboard → Developers → API keys → Secret key
- **STRIPE_WEBHOOK_SECRET**: Stripe Dashboard → Developers → Webhooks → [Your webhook] → Signing secret

### 2. Update Stripe Webhook URL

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Find the webhook pointing to `https://api.gatewayz.ai/payments/webhook`
3. Click "Update details"
4. Change the endpoint URL to:
   ```
   https://beta.gatewayz.ai/api/stripe/webhook
   ```
5. Ensure these events are selected:
   - `checkout.session.completed`

### 3. Test the Webhook

#### Option A: Use Stripe CLI
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger checkout.session.completed
```

#### Option B: Use Stripe Dashboard
1. Go to the webhook in Stripe Dashboard
2. Click "Send test webhook"
3. Select `checkout.session.completed`
4. Click "Send test webhook"

### 4. Verify It Works

Check your application logs for:
```
Received Stripe webhook event: checkout.session.completed
Successfully processed payment and credited user
```

## How It Works

1. User completes Stripe checkout
2. Stripe sends `checkout.session.completed` event to `/api/stripe/webhook`
3. Webhook verifies Stripe signature
4. Webhook extracts user info from metadata:
   - `user_id` or `userId`
   - `credits`
   - `payment_id`
5. Webhook calls backend API: `POST /user/credits`
6. Backend credits the user account
7. Webhook returns success to Stripe

## Troubleshooting

### Webhook Returns 503
**Cause**: Missing environment variables
**Fix**: Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to `.env.local`

### Webhook Returns 400 "Invalid signature"
**Cause**: Wrong webhook secret
**Fix**: Copy the correct signing secret from Stripe Dashboard

### Backend API Fails
**Cause**: Backend endpoint `/user/credits` not working
**Fix**: Check backend server logs and ensure endpoint exists

### Credits Not Added
**Cause**: Missing metadata in checkout session
**Fix**: Ensure checkout session includes:
```javascript
metadata: {
  user_id: "29",
  credits: "100",
  payment_id: "36"
}
```

## Recent Improvements

- ✅ Support both `userId` and `user_id` in metadata
- ✅ Include `payment_id` in backend API call
- ✅ Include `stripe_payment_intent` for tracking
- ✅ Better error logging with context
- ✅ Prevent infinite retries on backend errors

## Need Help?

Check the webhook logs in:
- Stripe Dashboard → Developers → Webhooks → [Your webhook] → Logs
- Your application server logs
