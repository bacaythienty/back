const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAvailableSlots,
  getMyAppointments,
  confirmAppointment,
  cancelAppointment,
  getAllAppointments
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Créneaux disponibles (public)
router.get('/available-slots', getAvailableSlots);

// Prendre un RDV (Patient)
router.post('/', protect, authorize('patient'), createAppointment);

// Consulter ses propres RDV (Patient / Médecin)
router.get('/my', protect, getMyAppointments);

// Valider ou annuler un RDV
router.patch('/:id/confirm', protect, authorize('doctor'), confirmAppointment);
router.patch('/:id/cancel', protect, cancelAppointment);

// Admin : liste de tous les RDV
router.get('/', protect, authorize('admin'), getAllAppointments);

module.exports = router;
