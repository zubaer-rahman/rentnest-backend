import express from 'express';
import { PropertyController } from '../property/property.controller';
import { RentalController } from '../rental/rental.controller';
import { UserController } from './user.controller';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidation } from './user.validation';
import auth from '../../middlewares/auth';
import { Role } from '../../../generated/prisma';

const router = express.Router();

router.get('/users', auth(Role.ADMIN), UserController.getAllUsers);

router.patch(
  '/users/:id',
  auth(Role.ADMIN),
  validateRequest(UserValidation.updateUserStatusValidationSchema),
  UserController.updateUserStatus,
);

router.get('/properties', auth(Role.ADMIN), PropertyController.getAllProperties);

router.get('/rentals', auth(Role.ADMIN), RentalController.getAllRentalRequests);

export const AdminRoutes = router;
