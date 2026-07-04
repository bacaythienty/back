const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  email: {
    type: String,
    required: [true, "L'adresse email est requise"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Veuillez fournir un email valide"]
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    select: false // Par défaut, ne pas renvoyer le mot de passe dans les requêtes
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    required: [true, 'Le rôle est requis'],
    default: 'patient'
  },
  phone: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  doctorProfile: {
    specialty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialty'
    },
    biography: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    education: {
      type: String,
      trim: true
    },
    experience: {
      type: Number, // En années
      default: 0
    },
    fees: {
      type: Number, // Tarif de consultation
      default: 0
    },
    profileImage: {
      type: String, // URL de l'image
      default: ''
    },
    // Disponibilités hebdomadaires configurables par le médecin
    // Exemple : [{ day: 'Monday', slots: ['09:00', '09:30', '10:00', '10:30'] }]
    availability: [
      {
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          required: true
        },
        slots: {
          type: [String], // Liste des heures de créneaux, ex: ['09:00', '09:30']
          default: []
        }
      }
    ]
  }
}, {
  timestamps: true
});

// Middleware pour hacher le mot de passe avant de sauvegarder
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Méthode pour comparer les mots de passe
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
