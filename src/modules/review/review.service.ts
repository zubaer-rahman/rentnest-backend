import httpStatus from 'http-status';
import AppError from '../../utils/AppError';
import prisma from '../../lib/prisma';
import { PaymentStatus, RequestStatus } from '../../../generated/prisma';

const createReview = async (
  tenantId: string,
  payload: { propertyId: string; rating: number; comment: string },
) => {
  const completedRental = await prisma.rentalRequest.findFirst({
    where: {
      tenantId,
      propertyId: payload.propertyId,
      status: { in: [RequestStatus.ACTIVE, RequestStatus.COMPLETED] },
      payments: {
        some: { status: PaymentStatus.COMPLETED },
      },
    },
  });

  if (!completedRental) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can only review a property after completing a paid rental',
    );
  }

  const existingReview = await prisma.review.findFirst({
    where: {
      tenantId,
      propertyId: payload.propertyId,
    },
  });

  if (existingReview) {
    throw new AppError(httpStatus.CONFLICT, 'You have already reviewed this property');
  }

  return prisma.review.create({
    data: {
      ...payload,
      tenantId,
    },
    include: {
      property: { select: { id: true, title: true } },
      tenant: { select: { id: true, name: true } },
    },
  });
};

const getPropertyReviews = async (propertyId: string) => {
  return prisma.review.findMany({
    where: { propertyId },
    include: {
      tenant: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const ReviewService = {
  createReview,
  getPropertyReviews,
};
