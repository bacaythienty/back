const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le patient est requis']
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le médecin est requis']
  },
  date: {
    type: Date,
    required: [true, 'La date du rendez-vous est requise']
  },
  slot: {
    type: String, // ex: '09:30'
    required: [true, "L'heure (créneau) est requise"]
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Empêcher d'avoir le même médecin réservé au même créneau le même jour
appointmentSchema.index({ doctor: 1, date: 1, slot: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
