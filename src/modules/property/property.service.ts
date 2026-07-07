import { Prisma } from '../../../generated/prisma';
import prisma from '../../lib/prisma';

const createProperty = async (landlordId: string, payload: any) => {
  const result = await prisma.property.create({
    data: {
      ...payload,
      landlordId,
    },
  });
  return result;
};

const getAllProperties = async (filters: any, options: any) => {
  const { page, limit, skip, sortBy, sortOrder } = options;
  const { searchTerm, minPrice, maxPrice, ...filterData } = filters;

  const andConditions: Prisma.PropertyWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: ['title', 'city', 'address'].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (minPrice || maxPrice) {
    const rentCondition: Prisma.FloatFilter = {};
    if (minPrice) rentCondition.gte = Number(minPrice);
    if (maxPrice) rentCondition.lte = Number(maxPrice);
    andConditions.push({ rent: rentCondition });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.PropertyWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.property.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? { [sortBy as string]: sortOrder }
        : { createdAt: 'desc' },
    include: {
      category: true,
      landlord: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  const total = await prisma.property.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getPropertyById = async (id: string) => {
  const result = await prisma.property.findUnique({
    where: { id },
    include: {
      category: true,
      landlord: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  return result;
};

const updateProperty = async (
  id: string,
  landlordId: string,
  payload: any,
) => {
  const result = await prisma.property.update({
    where: {
      id,
      landlordId,
    },
    data: payload,
  });
  return result;
};

const deleteProperty = async (id: string, landlordId: string) => {
  const result = await prisma.property.delete({
    where: {
      id,
      landlordId,
    },
  });
  return result;
};

export const PropertyService = {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
};
