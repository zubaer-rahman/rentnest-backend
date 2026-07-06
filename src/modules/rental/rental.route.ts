import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { RentalValidation } from './rental.validation';
import { RentalController } from './rental.controller';
import auth from '../../middlewares/auth';
import { Role } from '../../../generated/prisma';

const router = express.Router();

// Tenant routes
router.post(
  '/',
  auth(Role.TENANT),
  validateRequest(RentalValidation.createRentalRequestValidationSchema),
  RentalController.createRentalRequest,
);

// Shared: tenant sees their own, landlord sees requests for their properties
router.get(
  '/',
  auth(Role.TENANT, Role.LANDLORD),
  RentalController.getMyRentalRequests,
);

router.get(
  '/:id',
  auth(Role.TENANT, Role.LANDLORD),
  RentalController.getRentalRequestById,
);

// Landlord approves / rejects
router.patch(
  '/:id',
  auth(Role.LANDLORD),
  validateRequest(RentalValidation.updateRentalStatusValidationSchema),
  RentalController.updateRentalRequestStatus,
);

export const RentalRoutes = router;
