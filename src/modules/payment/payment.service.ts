import httpStatus from 'http-status';
import AppError from '../../utils/AppError';
import prisma from '../../lib/prisma';
import stripe from '../../lib/stripe';
import { PaymentStatus, RequestStatus } from '../../../generated/prisma';

const createPayment = async (
  tenantId: string,
  payload: { rentalRequestId: string; provider: string },
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

  if (payload.provider === 'STRIPE') {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(rentalRequest.property.rent * 100),
      currency: 'usd',
      metadata: {
        rentalRequestId: payload.rentalRequestId,
        tenantId,
      },
    });

    const payment = await prisma.payment.create({
      data: {
        transactionId: paymentIntent.id,
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
      clientSecret: paymentIntent.client_secret,
      amount: payment.amount,
      provider: payment.provider,
      status: payment.status,
    };
  }

  const payment = await prisma.payment.create({
    data: {
      transactionId: `sslcz_${Date.now()}_${rentalRequest.id.slice(0, 8)}`,
      rentalRequestId: payload.rentalRequestId,
      amount: rentalRequest.property.rent,
      method: 'ONLINE',
      provider: payload.provider,
      status: PaymentStatus.PENDING,
    },
  });

  return {
    paymentId: payment.id,
    transactionId: payment.transactionId,
    amount: payment.amount,
    provider: payment.provider,
    status: payment.status,
  };
};

const handleStripeWebhookSuccess = async (paymentIntentId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { transactionId: paymentIntentId },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, `No payment record found for PaymentIntent: ${paymentIntentId}`);
  }

  if (payment.status === PaymentStatus.COMPLETED) {
    return payment;
  }

  const updatedPayment = await prisma.payment.update({
    where: { transactionId: paymentIntentId },
    data: {
      status: PaymentStatus.COMPLETED,
      paidAt: new Date(),
    },
  });

  await prisma.rentalRequest.update({
    where: { id: payment.rentalRequestId },
    data: { status: RequestStatus.ACTIVE },
  });

  return updatedPayment;
};

const confirmPayment = async (tenantId: string, payload: { transactionId: string }) => {
  const payment = await prisma.payment.findUnique({
    where: { transactionId: payload.transactionId },
    include: { rentalRequest: true },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Payment record not found');
  }

  if (payment.rentalRequest.tenantId !== tenantId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to confirm this payment');
  }

  if (payment.status === PaymentStatus.COMPLETED) {
    throw new AppError(httpStatus.CONFLICT, 'Payment is already completed');
  }

  const updatedPayment = await prisma.payment.update({
    where: { transactionId: payload.transactionId },
    data: {
      status: PaymentStatus.COMPLETED,
      paidAt: new Date(),
    },
  });

  await prisma.rentalRequest.update({
    where: { id: payment.rentalRequestId },
    data: { status: RequestStatus.ACTIVE },
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
  confirmPayment,
  handleStripeWebhookSuccess,
  getMyPayments,
  getPaymentById,
};
