import express from 'express';
import adminController from '../controllers/admin.controller.js';

const router = express.Router();

// Placed students routes
router.post('/api/v1/admin/placed-students/bulk', adminController.updatePlacedStudents);
router.post('/api/v1/admin/placed-students/single', adminController.addSinglePlacedStudent);

export default router; 