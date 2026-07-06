import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { RentalService } from './rental.service';

const createRentalRequest = catchAsync(async (req, res) => {
  const result = await RentalService.createRentalRequest(req.user.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Rental request submitted successfully',
    data: result,
  });
});

const getMyRentalRequests = catchAsync(async (req, res) => {
  const result = await RentalService.getMyRentalRequests(req.user.id, req.user.role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rental requests retrieved successfully',
    data: result,
  });
});

const getRentalRequestById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await RentalService.getRentalRequestById(id as string, req.user.id, req.user.role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rental request retrieved successfully',
    data: result,
  });
});

const updateRentalRequestStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await RentalService.updateRentalRequestStatus(id as string, req.user.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Rental request ${req.body.status.toLowerCase()} successfully`,
    data: result,
  });
});

const getAllRentalRequests = catchAsync(async (req, res) => {
  const result = await RentalService.getAllRentalRequests();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All rental requests retrieved successfully',
    data: result,
  });
});

export const RentalController = {
  createRentalRequest,
  getMyRentalRequests,
  getRentalRequestById,
  updateRentalRequestStatus,
  getAllRentalRequests,
};
