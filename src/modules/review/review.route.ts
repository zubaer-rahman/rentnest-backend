import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { ReviewValidation } from './review.validation';
import { ReviewController } from './review.controller';
import auth from '../../middlewares/auth';
import { Role } from '../../../generated/prisma';

const router = express.Router();

router.post(
  '/',
  auth(Role.TENANT),
  validateRequest(ReviewValidation.createReviewValidationSchema),
  ReviewController.createReview,
);

router.get('/property/:propertyId', ReviewController.getPropertyReviews);

export const ReviewRoutes = router;
