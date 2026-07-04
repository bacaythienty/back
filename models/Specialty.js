const mongoose = require('mongoose');

const specialtySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de la spécialité est requis'],
    unique: true,
    trim: true
  },
  icon: {
    type: String,
    required: [true, "Le nom de l'icône Lucide est requis"],
    default: 'Activity'
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Specialty', specialtySchema);
