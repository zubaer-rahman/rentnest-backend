import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { PaymentValidation } from './payment.validation';
import { PaymentController } from './payment.controller';
import auth from '../../middlewares/auth';
import { Role } from '../../../generated/prisma';

const router = express.Router();

router.post('/webhook', express.raw({ type: 'application/json' }), PaymentController.stripeWebhook);

router.get('/confirm', PaymentController.paymentSuccess);
router.get('/cancel', PaymentController.paymentCancel);

router.post(
  '/create',
  auth(Role.TENANT),
  validateRequest(PaymentValidation.createPaymentValidationSchema),
  PaymentController.createPayment,
);

router.get('/', auth(Role.TENANT), PaymentController.getMyPayments);

router.get('/:id', auth(Role.TENANT), PaymentController.getPaymentById);

export const PaymentRoutes = router;
