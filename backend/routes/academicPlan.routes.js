// AcademicPlan Routes - Protected by JWT Authentication
import express from 'express';
import {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan
} from '../controllers/academicPlan.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All academic plan routes require authentication
router.use(protect);

router.route('/')
  .post(createPlan)
  .get(getPlans);

router.route('/:id')
  .get(getPlanById)
  .patch(updatePlan)
  .delete(deletePlan);

export default router;

