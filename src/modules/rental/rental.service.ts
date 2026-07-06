import httpStatus from 'http-status';
import AppError from '../../utils/AppError';
import prisma from '../../utils/prisma';
import { RequestStatus } from '../../../generated/prisma';

const createRentalRequest = async (tenantId: string, payload: { propertyId: string; message: string }) => {
  const property = await prisma.property.findUnique({
    where: { id: payload.propertyId },
  });

  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, 'Property not found');
  }

  if (!property.isAvailable) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Property is not available for rent');
  }

  // Prevent tenant from sending duplicate pending request
  const existingRequest = await prisma.rentalRequest.findFirst({
    where: {
      propertyId: payload.propertyId,
      tenantId,
      status: RequestStatus.PENDING,
    },
  });

  if (existingRequest) {
    throw new AppError(httpStatus.CONFLICT, 'You already have a pending request for this property');
  }

  const result = await prisma.rentalRequest.create({
    data: {
      ...payload,
      tenantId,
    },
    include: {
      property: true,
    },
  });

  return result;
};

const getMyRentalRequests = async (userId: string, role: string) => {
  const whereClause =
    role === 'TENANT'
      ? { tenantId: userId }
      : { property: { landlordId: userId } };

  const result = await prisma.rentalRequest.findMany({
    where: whereClause,
    include: {
      property: {
        include: { category: true },
      },
      tenant: {
        select: { id: true, name: true, email: true, phone: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return result;
};

const getRentalRequestById = async (id: string, userId: string, role: string) => {
  const result = await prisma.rentalRequest.findUnique({
    where: { id },
    include: {
      property: { include: { category: true } },
      tenant: { select: { id: true, name: true, email: true } },
      payments: true,
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Rental request not found');
  }

  // Ensure only the relevant tenant or landlord can view it
  if (role === 'TENANT' && result.tenantId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You do not have access to this request');
  }

  return result;
};

const updateRentalRequestStatus = async (
  id: string,
  landlordId: string,
  payload: { status: RequestStatus },
) => {
  const request = await prisma.rentalRequest.findUnique({
    where: { id },
    include: { property: true },
  });

  if (!request) {
    throw new AppError(httpStatus.NOT_FOUND, 'Rental request not found');
  }

  if (request.property.landlordId !== landlordId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to update this request');
  }

  if (request.status !== RequestStatus.PENDING) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Only pending requests can be approved or rejected');
  }

  const result = await prisma.rentalRequest.update({
    where: { id },
    data: { status: payload.status },
  });

  return result;
};

const getAllRentalRequests = async () => {
  const result = await prisma.rentalRequest.findMany({
    include: {
      property: true,
      tenant: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return result;
};

export const RentalService = {
  createRentalRequest,
  getMyRentalRequests,
  getRentalRequestById,
  updateRentalRequestStatus,
  getAllRentalRequests,
};
