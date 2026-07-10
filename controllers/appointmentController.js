const Appointment = require('../models/Appointment');
const User = require('../models/User');

// Helper pour obtenir les créneaux disponibles
const getAvailableSlotsHelper = async (doctorId, dateStr) => {
  const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
  if (!doctor) {
    throw new Error('Médecin introuvable');
  }

  // Créer une date en ignorant le fuseau horaire
  const queryDate = new Date(dateStr);
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = daysOfWeek[queryDate.getUTCDay()]; // getUTCDay() pour éviter les décalages locaux

  // Récupérer les créneaux définis pour ce jour-là par le médecin
  const dayAvailability = doctor.doctorProfile.availability.find(
    (a) => a.day === dayName
  );

  if (!dayAvailability || !dayAvailability.slots || dayAvailability.slots.length === 0) {
    return [];
  }

  const allSlots = dayAvailability.slots;

  // Calculer la plage horaire de cette date en UTC
  const startOfDay = new Date(dateStr);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(dateStr);
  endOfDay.setUTCHours(23, 59, 59, 999);

  // Trouver tous les rendez-vous existants non annulés
  const appointments = await Appointment.find({
    doctor: doctorId,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['pending', 'confirmed'] }
  });

  const bookedSlots = appointments.map((app) => app.slot);

  // Retourner les créneaux restants
  return allSlots.filter((slot) => !bookedSlots.includes(slot));
};

// @desc    Prendre un rendez-vous (Patient)
// @route   POST /api/appointments
// @access  Private (Patient)
exports.createAppointment = async (req, res) => {
  const { doctorId, date, slot, notes } = req.body;

  try {
    // 1. Vérifier si le médecin existe
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ message: 'Médecin introuvable' });
    }

    // 2. Vérifier si la date est dans le futur
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (appointmentDate < today) {
      return res.status(400).json({ message: 'Impossible de réserver à une date passée' });
    }

    // 3. Obtenir les créneaux libres pour ce médecin à cette date
    const availableSlots = await getAvailableSlotsHelper(doctorId, date);
    if (!availableSlots.includes(slot)) {
      return res.status(400).json({ message: 'Ce créneau horaire n\'est plus disponible' });
    }

    // 4. Créer le rendez-vous (par défaut en attente 'pending')
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      date: appointmentDate,
      slot,
      notes
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctor', 'name doctorProfile.address doctorProfile.specialty doctorProfile.profileImage')
      .populate('patient', 'name email phone');

    res.status(201).json(populatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir les créneaux libres d'un médecin pour une date spécifique
// @route   GET /api/appointments/available-slots
// @access  Public
exports.getAvailableSlots = async (req, res) => {
  const { doctorId, date } = req.query; // date format AAAA-MM-JJ

  if (!doctorId || !date) {
    return res.status(400).json({ message: 'Veuillez spécifier doctorId et date (AAAA-MM-JJ)' });
  }

  try {
    const slots = await getAvailableSlotsHelper(doctorId, date);
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir les rendez-vous de l'utilisateur connecté (Patient ou Médecin)
// @route   GET /api/appointments/my
// @access  Private
exports.getMyAppointments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    } else {
      return res.status(400).json({ message: 'Accès non autorisé pour ce rôle' });
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone')
      .populate({
        path: 'doctor',
        select: 'name doctorProfile.address doctorProfile.specialty doctorProfile.profileImage',
        populate: {
          path: 'doctorProfile.specialty',
          select: 'name icon'
        }
      })
      .sort({ date: 1, slot: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Confirmer (valider) un rendez-vous (Médecin)
// @route   PATCH /api/appointments/:id/confirm
// @access  Private (Doctor)
exports.confirmAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Rendez-vous introuvable' });
    }

    // Vérifier si le médecin connecté est bien celui du rendez-vous
    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Action non autorisée' });
    }

    appointment.status = 'confirmed';
    await appointment.save();

    res.json({ message: 'Rendez-vous validé avec succès', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Annuler un rendez-vous (Patient ou Médecin)
// @route   PATCH /api/appointments/:id/cancel
// @access  Private
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Rendez-vous introuvable' });
    }

    // Vérifier si l'utilisateur est concerné (patient ou médecin associé)
    const isPatient = appointment.patient.toString() === req.user._id.toString();
    const isDoctor = appointment.doctor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({ message: 'Action non autorisée' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Rendez-vous annulé avec succès', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir tous les rendez-vous du système (Administrateur)
// @route   GET /api/appointments
// @access  Private (Admin)
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate('patient', 'name email phone')
      .populate({
        path: 'doctor',
        select: 'name doctorProfile.address doctorProfile.specialty doctorProfile.profileImage',
        populate: {
          path: 'doctorProfile.specialty',
          select: 'name icon'
        }
      })
      .sort({ date: -1, slot: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
