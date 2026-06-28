import { Router } from 'express';
import userRoutes from './userRoutes.js';
import projectRoutes from './projectRoutes.js';
import favoriteRoutes from './favoriteRoutes.js';
import commentRoutes from './commentRoutes.js';
import mentorshipRoutes from './mentorshipRoutes.js';
import collaborationRoutes from './collaborationRoutes.js';
import reportRoutes from './reportRoutes.js';
import adminReportRoutes from './adminReportRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import downloadRoutes from './downloadRoutes.js';
import promotionRoutes from './promotionRoutes.js';
import adminPromotionRoutes from './adminPromotionRoutes.js';
import adminRoutes from './adminRoutes.js';
import backupRoutes from './backupRoutes.js';
import notificationRoutes from './notificationRoutes.js';

const router = Router();

router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/favorites', favoriteRoutes);
router.use(commentRoutes);
router.use('/mentorships', mentorshipRoutes);
router.use('/collaborations', collaborationRoutes);
router.use('/reports', reportRoutes);
router.use('/admin/reports', adminReportRoutes);
router.use('/uploads', uploadRoutes);
router.use('/downloads', downloadRoutes);
router.use('/promotions', promotionRoutes);
router.use('/admin/promotions', adminPromotionRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/backups', backupRoutes);

export default router;
