import { Router } from 'express';
import { getMyNotifications } from '../controllers/notificationController.js';
import authenticate from '../middleware/authenticate.js';

const router = Router();

router.get('/', authenticate, getMyNotifications);

export default router;
