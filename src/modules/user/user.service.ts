import httpStatus from 'http-status';
import AppError from '../../utils/AppError';
import prisma from '../../lib/prisma';
import { Role, UserStatus } from '../../../generated/prisma';

const updateProfile = async (id: string, payload: any) => {
  const result = await prisma.user.update({
    where: {
      id,
    },
    data: payload,
  });

  const { password, ...userWithoutPassword } = result;
  return userWithoutPassword;
};

const getAllUsers = async () => {
  const result = await prisma.user.findMany({
    where: {
      role: {
        not: Role.ADMIN,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return result;
};

const updateUserStatus = async (id: string, payload: { status: UserStatus }) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const result = await prisma.user.update({
    where: {
      id,
    },
    data: {
      status: payload.status,
    },
  });

  const { password, ...userWithoutPassword } = result;
  return userWithoutPassword;
};

export const UserService = {
  updateProfile,
  getAllUsers,
  updateUserStatus,
};
