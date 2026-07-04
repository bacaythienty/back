const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  updateDoctorProfile,
  updateDoctorAvailability,
  getAllUsers,
  toggleUserStatus
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Routes publiques pour les médecins
router.get('/doctors', getDoctors);
router.get('/doctors/:id', getDoctorById);

// Routes réservées aux médecins connectés
router.put('/doctor/profile', protect, authorize('doctor'), updateDoctorProfile);
router.put('/doctor/availability', protect, authorize('doctor'), updateDoctorAvailability);

// Routes d'administration
router.get('/', protect, authorize('admin'), getAllUsers);
router.patch('/:id/toggle-status', protect, authorize('admin'), toggleUserStatus);

module.exports = router;
