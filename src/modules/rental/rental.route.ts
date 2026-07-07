import express from 'express';
import auth from '../../middlewares/auth';
import { Role } from '../../../generated/prisma';
import validateRequest from '../../middlewares/validateRequest';
import { RentalValidation } from './rental.validation';
import { RentalController } from './rental.controller';

const router = express.Router();

router.post(
  '/',
  auth(Role.TENANT),
  validateRequest(RentalValidation.createRentalRequestValidationSchema),
  RentalController.createRentalRequest,
);

router.get('/', auth(Role.TENANT), RentalController.getMyRentalRequests);

router.get('/:id', auth(Role.TENANT), RentalController.getRentalRequestById);

export const RentalRoutes = router;
