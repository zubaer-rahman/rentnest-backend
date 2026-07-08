import httpStatus from 'http-status';
import AppError from '../../utils/AppError';
import prisma from '../../lib/prisma';
import stripe from '../../lib/stripe';
import config from '../../config';
import { PaymentStatus, RequestStatus } from '../../../generated/prisma';

const createPayment = async (
  tenantId: string,
  payload: { rentalRequestId: string },
) => {
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: payload.rentalRequestId },
    include: { property: true },
  });

  if (!rentalRequest) {
    throw new AppError(httpStatus.NOT_FOUND, 'Rental request not found');
  }

  if (rentalRequest.tenantId !== tenantId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to pay for this request');
  }

  if (rentalRequest.status !== RequestStatus.APPROVED) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Payment can only be made for approved rental requests');
  }

  const existingPayment = await prisma.payment.findFirst({
    where: {
      rentalRequestId: payload.rentalRequestId,
      status: PaymentStatus.COMPLETED,
    },
  });

  if (existingPayment) {
    throw new AppError(httpStatus.CONFLICT, 'Payment has already been completed for this request');
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Rent for ${rentalRequest.property.title}`,
          },
          unit_amount: Math.round(rentalRequest.property.rent * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${config.app_url}/api/payments/confirm?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.app_url}/api/payments/cancel`,
    metadata: {
      rentalRequestId: payload.rentalRequestId,
      tenantId,
    },
  });

  const payment = await prisma.payment.create({
    data: {
      transactionId: session.id,
      rentalRequestId: payload.rentalRequestId,
      amount: rentalRequest.property.rent,
      method: 'ONLINE',
      provider: 'STRIPE',
      status: PaymentStatus.PENDING,
    },
  });

  return {
    paymentId: payment.id,
    transactionId: payment.transactionId,
    paymentUrl: session.url,
    amount: payment.amount,
    provider: payment.provider,
    status: payment.status,
  };
};

const handleStripeWebhookSuccess = async (sessionId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { transactionId: sessionId },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, `No payment record found for Checkout Session: ${sessionId}`);
  }

  if (payment.status === PaymentStatus.COMPLETED) {
    return payment;
  }

  const updatedPayment = await prisma.payment.update({
    where: { transactionId: sessionId },
    data: {
      status: PaymentStatus.COMPLETED,
      paidAt: new Date(),
    },
  });

  const rentalRequest = await prisma.rentalRequest.update({
    where: { id: payment.rentalRequestId },
    data: { status: RequestStatus.ACTIVE },
  });

  await prisma.property.update({
    where: { id: rentalRequest.propertyId },
    data: { isAvailable: false },
  });

  return updatedPayment;
};

const getMyPayments = async (userId: string) => {
  return prisma.payment.findMany({
    where: {
      rentalRequest: { tenantId: userId },
    },
    include: {
      rentalRequest: {
        include: { property: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getPaymentById = async (id: string, userId: string) => {
  const result = await prisma.payment.findUnique({
    where: { id },
    include: {
      rentalRequest: {
        include: { property: true },
      },
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Payment not found');
  }

  if (result.rentalRequest.tenantId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You do not have access to this payment');
  }

  return result;
};

export const PaymentService = {
  createPayment,
  handleStripeWebhookSuccess,
  getMyPayments,
  getPaymentById,
};
