import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';

import { UserRoutes } from '../modules/user/user.route';

import { AdminRoutes } from '../modules/user/admin.route';
import { CategoryRoutes } from '../modules/category/category.route';
import { PropertyRoutes } from '../modules/property/property.route';
import { RentalRoutes } from '../modules/rental/rental.route';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/admin',
    route: AdminRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/categories',
    route: CategoryRoutes,
  },
  {
    path: '/properties',
    route: PropertyRoutes,
  },
  {
    path: '/rentals',
    route: RentalRoutes,
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
