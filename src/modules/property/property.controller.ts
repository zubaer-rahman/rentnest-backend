import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PropertyService } from './property.service';
import AppError from '../../utils/AppError';

const createProperty = catchAsync(async (req, res) => {
  const result = await PropertyService.createProperty(req.user.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Property created successfully',
    data: result,
  });
});

const getAllProperties = catchAsync(async (req, res) => {
  const filters = {
    searchTerm: req.query.searchTerm,
    minPrice: req.query.minPrice,
    maxPrice: req.query.maxPrice,
    categoryId: req.query.categoryId,
    city: req.query.city,
    bedrooms: req.query.bedrooms ? Number(req.query.bedrooms) : undefined,
  };

  const options = {
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 10,
    skip: req.query.page && req.query.limit
      ? (Number(req.query.page) - 1) * Number(req.query.limit)
      : 0,
    sortBy: req.query.sortBy,
    sortOrder: req.query.sortOrder,
  };

  const result = await PropertyService.getAllProperties(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Properties retrieved successfully',
    data: result,
  });
});

const getPropertyById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PropertyService.getPropertyById(id as string);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Property not found');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Property retrieved successfully',
    data: result,
  });
});

const updateProperty = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PropertyService.updateProperty(id as string, req.user.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Property updated successfully',
    data: result,
  });
});

const deleteProperty = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PropertyService.deleteProperty(id as string, req.user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Property deleted successfully',
    data: result,
  });
});

export const PropertyController = {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
};
