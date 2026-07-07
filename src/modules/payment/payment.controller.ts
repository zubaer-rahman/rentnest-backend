import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PaymentService } from './payment.service';
import stripe from '../../lib/stripe';
import config from '../../config';

const createPayment = catchAsync(async (req, res) => {
  const result = await PaymentService.createPayment(req.user.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Payment initiated successfully',
    data: result,
  });
});

const getMyPayments = catchAsync(async (req, res) => {
  const result = await PaymentService.getMyPayments(req.user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment history retrieved successfully',
    data: result,
  });
});

const getPaymentById = catchAsync(async (req, res) => {
  const result = await PaymentService.getPaymentById(req.params['id'] as string, req.user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment details retrieved successfully',
    data: result,
  });
});

const stripeWebhook = async (req: any, res: any) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      config.stripe_webhook_secret as string,
    );
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      await PaymentService.handleStripeWebhookSuccess(session.id);
    } catch (err: any) {
      console.error('Webhook handler error:', err.message);
    }
  }

  res.json({ received: true });
};

const paymentSuccess = (req: any, res: any) => {
  res.send(`
    <html>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: #4CAF50;">Payment Successful! 🎉</h1>
        <p>Your payment has been processed and your rental request is now ACTIVE.</p>
        <p>You can safely close this window.</p>
      </body>
    </html>
  `);
};

const paymentCancel = (req: any, res: any) => {
  res.send(`
    <html>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: #f44336;">Payment Cancelled ❌</h1>
        <p>You cancelled the payment process. Your rental request is still pending payment.</p>
        <p>You can safely close this window and try again later.</p>
      </body>
    </html>
  `);
};

export const PaymentController = {
  createPayment,
  getMyPayments,
  getPaymentById,
  stripeWebhook,
  paymentSuccess,
  paymentCancel,
};
