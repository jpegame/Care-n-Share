import { Router } from 'express';
import dashboardController from '../controllers/DashboardController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorizeRoles from '../middlewares/authorizeRolesMiddleware.js';

const router = Router();

router.use(authMiddleware, authorizeRoles('O'));

router.get('/summary', dashboardController.getSummary);
router.get('/donations', dashboardController.getDonationStats);
router.get('/goals', dashboardController.getGoalsProgress);
router.get('/volunteers', dashboardController.getVolunteerStats);
router.get('/activity', dashboardController.getRecentActivity);

export default router;