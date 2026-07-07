import express from 'express';
import { PropertyController } from './property.controller';

const router = express.Router();

router.get('/', PropertyController.getAllProperties);
router.get('/:id', PropertyController.getPropertyById);

export const PropertyRoutes = router;
