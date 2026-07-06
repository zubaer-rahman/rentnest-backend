import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidation } from './user.validation';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth';
import { Role } from '../../../generated/prisma';

const router = express.Router();

router.put(
  '/profile',
  auth(Role.ADMIN, Role.LANDLORD, Role.TENANT),
  validateRequest(UserValidation.updateProfileValidationSchema),
  UserController.updateProfile,
);

export const UserRoutes = router;
