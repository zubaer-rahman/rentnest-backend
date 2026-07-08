import httpStatus from 'http-status';
import bcrypt from 'bcryptjs';
import { jwtUtils } from '../../utils/jwt';
import config from '../../config';
import AppError from '../../utils/AppError';
import prisma from '../../lib/prisma';

const register = async (payload: any) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (isUserExists) {
    throw new AppError(httpStatus.CONFLICT, 'User already exists');
  }

  payload.password = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds),
  );

  if (!payload.role || payload.role === 'ADMIN') {
    payload.role = 'TENANT';
  }

  const result = await prisma.user.create({
    data: payload,
  });

  const { password, ...userWithoutPassword } = result;
  return userWithoutPassword;
};

const login = async (payload: any) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid password');
  }

  const jwtPayload = {
    id: user.id,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as any,
  );

  const { password, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
  };
};

const getMe = async (id: string) => {
  const result = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const { password, ...userWithoutPassword } = result;
  return userWithoutPassword;
};

export const AuthService = {
  register,
  login,
  getMe,
};
