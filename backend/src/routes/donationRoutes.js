import { Router } from 'express';
import donationController from '../controllers/DonationController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorizeRoles from '../middlewares/authorizeRolesMiddleware.js';

const router = Router();

router.use(authMiddleware, authorizeRoles('O'));

router.get('/', donationController.getAll);
router.get('/:id', donationController.getById);
router.patch('/:id/complete', donationController.complete);
router.patch('/:id/cancel', donationController.cancel);

export default router;