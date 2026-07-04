const Specialty = require('../models/Specialty');

// @desc    Obtenir toutes les spécialités
// @route   GET /api/specialties
// @access  Public
exports.getSpecialties = async (req, res) => {
  try {
    const specialties = await Specialty.find({});
    res.json(specialties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Créer une nouvelle spécialité (Administrateur)
// @route   POST /api/specialties
// @access  Private (Admin)
exports.createSpecialty = async (req, res) => {
  const { name, icon, description } = req.body;

  try {
    const specialtyExists = await Specialty.findOne({ name });

    if (specialtyExists) {
      return res.status(400).json({ message: 'Cette spécialité existe déjà' });
    }

    const specialty = await Specialty.create({
      name,
      icon,
      description
    });

    res.status(201).json(specialty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Mettre à jour une spécialité (Administrateur)
// @route   PUT /api/specialties/:id
// @access  Private (Admin)
exports.updateSpecialty = async (req, res) => {
  try {
    const specialty = await Specialty.findById(req.params.id);

    if (!specialty) {
      return res.status(404).json({ message: 'Spécialité non trouvée' });
    }

    const { name, icon, description } = req.body;

    specialty.name = name || specialty.name;
    specialty.icon = icon || specialty.icon;
    specialty.description = description || specialty.description;

    const updatedSpecialty = await specialty.save();
    res.json(updatedSpecialty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Supprimer une spécialité (Administrateur)
// @route   DELETE /api/specialties/:id
// @access  Private (Admin)
exports.deleteSpecialty = async (req, res) => {
  try {
    const specialty = await Specialty.findById(req.params.id);

    if (!specialty) {
      return res.status(404).json({ message: 'Spécialité non trouvée' });
    }

    await specialty.deleteOne();
    res.json({ message: 'Spécialité supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
