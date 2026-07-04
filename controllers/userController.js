const User = require('../models/User');
const Specialty = require('../models/Specialty');

// @desc    Récupérer la liste des médecins avec filtrage
// @route   GET /api/users/doctors
// @access  Public
exports.getDoctors = async (req, res) => {
  try {
    const { specialty, search, city } = req.query;
    let query = { role: 'doctor', isActive: true };

    // Filtrer par spécialité
    if (specialty) {
      query['doctorProfile.specialty'] = specialty;
    }

    // Filtrer par ville/adresse
    if (city) {
      query['doctorProfile.address'] = { $regex: city, $options: 'i' };
    }

    // Recherche globale par nom ou description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'doctorProfile.biography': { $regex: search, $options: 'i' } },
        { 'doctorProfile.education': { $regex: search, $options: 'i' } }
      ];
    }

    const doctors = await User.find(query)
      .populate('doctorProfile.specialty', 'name icon description')
      .select('-password');

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir les détails d'un médecin par son ID
// @route   GET /api/users/doctors/:id
// @access  Public
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' })
      .populate('doctorProfile.specialty', 'name icon description')
      .select('-password');

    if (doctor) {
      res.json(doctor);
    } else {
      res.status(404).json({ message: 'Médecin non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mettre à jour le profil d'un médecin (par lui-même)
// @route   PUT /api/users/doctor/profile
// @access  Private (Doctor)
exports.updateDoctorProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || user.role !== 'doctor') {
      return res.status(404).json({ message: 'Profil médecin introuvable' });
    }

    const { name, phone, biography, address, education, experience, fees, profileImage } = req.body;

    user.name = name || user.name;
    user.phone = phone || user.phone;

    // Mise à jour des informations spécifiques du profil médecin
    if (user.doctorProfile) {
      user.doctorProfile.biography = biography !== undefined ? biography : user.doctorProfile.biography;
      user.doctorProfile.address = address !== undefined ? address : user.doctorProfile.address;
      user.doctorProfile.education = education !== undefined ? education : user.doctorProfile.education;
      user.doctorProfile.experience = experience !== undefined ? experience : user.doctorProfile.experience;
      user.doctorProfile.fees = fees !== undefined ? fees : user.doctorProfile.fees;
      user.doctorProfile.profileImage = profileImage !== undefined ? profileImage : user.doctorProfile.profileImage;
    }

    const updatedUser = await user.save();
    
    // Renvoyer l'utilisateur peuplé avec la spécialité
    const populatedUser = await User.findById(updatedUser._id)
      .populate('doctorProfile.specialty', 'name icon')
      .select('-password');

    res.json(populatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mettre à jour les disponibilités d'un médecin (par lui-même)
// @route   PUT /api/users/doctor/availability
// @access  Private (Doctor)
exports.updateDoctorAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || user.role !== 'doctor') {
      return res.status(404).json({ message: 'Profil médecin introuvable' });
    }

    const { availability } = req.body; // Array de { day: 'Monday', slots: [...] }

    if (!availability || !Array.isArray(availability)) {
      return res.status(400).json({ message: 'Disponibilités invalides' });
    }

    user.doctorProfile.availability = availability;
    await user.save();

    res.json({
      message: 'Disponibilités mises à jour avec succès',
      availability: user.doctorProfile.availability
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer tous les utilisateurs (Administrateur)
// @route   GET /api/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const users = await User.find(query)
      .populate('doctorProfile.specialty', 'name icon')
      .select('-password');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Activer ou désactiver un compte utilisateur (Administrateur)
// @route   PATCH /api/users/:id/toggle-status
// @access  Private (Admin)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Impossible de désactiver un administrateur' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `Statut de l'utilisateur modifié avec succès (${user.isActive ? 'Actif' : 'Inactif'})`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
