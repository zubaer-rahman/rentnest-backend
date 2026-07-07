import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidation } from './user.validation';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth';
import { Role } from '../../../generated/prisma';
import { PropertyController } from '../property/property.controller';
import { RentalController } from '../rental/rental.controller';

const router = express.Router();

// User management
router.get('/users', auth(Role.ADMIN), UserController.getAllUsers);

router.patch(
  '/users/:id',
  auth(Role.ADMIN),
  validateRequest(UserValidation.updateUserStatusValidationSchema),
  UserController.updateUserStatus,
);

// Property oversight
router.get('/properties', auth(Role.ADMIN), PropertyController.getAllProperties);

// Rental request oversight
router.get('/rentals', auth(Role.ADMIN), RentalController.getAllRentalRequests);

export const AdminRoutes = router;
