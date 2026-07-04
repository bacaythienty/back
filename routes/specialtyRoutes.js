const express = require('express');
const router = express.Router();
const {
  getSpecialties,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty
} = require('../controllers/specialtyController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getSpecialties);
router.post('/', protect, authorize('admin'), createSpecialty);
router.put('/:id', protect, authorize('admin'), updateSpecialty);
router.delete('/:id', protect, authorize('admin'), deleteSpecialty);

module.exports = router;
