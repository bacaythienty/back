require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Specialty = require('./models/Specialty');
const Appointment = require('./models/Appointment');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connexion MongoDB réussie pour le peuplement (Sénégal)...');

    // Nettoyer la base de données
    await User.deleteMany({});
    await Specialty.deleteMany({});
    await Appointment.deleteMany({});
    console.log('Base de données nettoyée !');

    // 1. Créer des spécialités
    const specialtiesData = [
      { name: 'Cardiologie', icon: 'Heart', description: 'Maladies du cœur et des vaisseaux sanguins' },
      { name: 'Pédiatrie', icon: 'Baby', description: 'Santé et développement des enfants' },
      { name: 'Généraliste', icon: 'Stethoscope', description: 'Médecine générale et suivi de santé familial' },
      { name: 'Dentiste', icon: 'Smile', description: 'Soins dentaires et hygiène bucco-dentaire' },
      { name: 'Ophtalmologie', icon: 'Eye', description: 'Troubles de la vision et maladies des yeux' }
    ];

    const specialties = await Specialty.create(specialtiesData);
    console.log('Spécialités insérées !');

    const cardioId = specialties.find(s => s.name === 'Cardiologie')._id;
    const generalisteId = specialties.find(s => s.name === 'Généraliste')._id;
    const pediatreId = specialties.find(s => s.name === 'Pédiatrie')._id;
    const dentisteId = specialties.find(s => s.name === 'Dentiste')._id;

    // Slots standards pour les rendez-vous
    const standardSlots = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
    ];

    const availabilityDrDiop = [
      { day: 'Monday', slots: standardSlots },
      { day: 'Tuesday', slots: standardSlots },
      { day: 'Thursday', slots: standardSlots },
      { day: 'Friday', slots: standardSlots }
    ];

    const availabilityDrSy = [
      { day: 'Monday', slots: standardSlots },
      { day: 'Wednesday', slots: standardSlots },
      { day: 'Friday', slots: standardSlots }
    ];

    // 2. Créer des utilisateurs
    // Mot de passe par défaut pour tous : 'password123'
    const passwordHash = await bcrypt.hash('password123', 10);

    const usersData = [
      // Administrateur
      {
        name: 'Admin MediRdv Sénégal',
        email: 'admin@medirdv.sn',
        password: passwordHash,
        role: 'admin',
        phone: '+221771234567',
        isActive: true
      },
      // Patients
      {
        name: 'Babacar Diagne',
        email: 'babacar@gmail.com',
        password: passwordHash,
        role: 'patient',
        phone: '+221776543210',
        isActive: true
      },
      {
        name: 'Mariama Sow',
        email: 'mariama@gmail.com',
        password: passwordHash,
        role: 'patient',
        phone: '+221781234567',
        isActive: true
      },
      // Médecins du Sénégal (surtout Thiès et Dakar)
      {
        name: 'Dr. Astou Diop',
        email: 'astou.diop@medirdv.sn',
        password: passwordHash,
        role: 'doctor',
        phone: '+221703344556',
        isActive: true,
        doctorProfile: {
          specialty: cardioId,
          biography: 'Spécialiste renommée en cardiologie à Thiès. Plus de 15 ans d\'expérience dans le diagnostic et la prise en charge des cardiopathies en Afrique de l\'Ouest.',
          address: 'Quartier Dixième (près de la gouvernance), Thiès, Sénégal',
          education: 'Doctorat en Cardiologie - Université Cheikh Anta Diop (UCAD) de Dakar',
          experience: 15,
          fees: 15000, // En FCFA
          profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
          availability: availabilityDrDiop
        }
      },
      {
        name: 'Dr. Ousmane Sy',
        email: 'ousmane.sy@medirdv.sn',
        password: passwordHash,
        role: 'doctor',
        phone: '+221778899001',
        isActive: true,
        doctorProfile: {
          specialty: generalisteId,
          biography: 'Médecin généraliste dévoué, accueillant les familles à Dakar. Prise en charge des enfants et des adultes.',
          address: 'Amitié 2 (Avenue Bourguiba), Dakar, Sénégal',
          education: 'Diplôme d\'État de Médecine - Faculté de Médecine de Dakar',
          experience: 9,
          fees: 10000, // En FCFA
          profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
          availability: availabilityDrSy
        }
      },
      {
        name: 'Dr. Khady Ndiaye',
        email: 'khady.ndiaye@medirdv.sn',
        password: passwordHash,
        role: 'doctor',
        phone: '+221764455667',
        isActive: true,
        doctorProfile: {
          specialty: pediatreId,
          biography: 'Pédiatre attentionnée installée à Thiès. Suivi vaccinal, croissance du nourrisson et urgences pédiatriques.',
          address: 'Quartier Mbour 1, Thiès, Sénégal',
          education: 'Spécialisation en Pédiatrie - UCAD Dakar & Clinique Pédiatrique de Thiès',
          experience: 7,
          fees: 12000, // En FCFA
          profileImage: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300',
          availability: availabilityDrDiop
        }
      },
      {
        name: 'Dr. Cheikh Diallo',
        email: 'cheikh.diallo@medirdv.sn',
        password: passwordHash,
        role: 'doctor',
        phone: '+221773322110',
        isActive: true,
        doctorProfile: {
          specialty: dentisteId,
          biography: 'Chirurgien-dentiste spécialisé dans les soins esthétiques et la prévention bucco-dentaire.',
          address: 'Quartier Escale (Avenue de la gare), Thiès, Sénégal',
          education: 'Chirurgie Dentaire - Institut d\'Odontostomatologie de Dakar',
          experience: 11,
          fees: 15000, // En FCFA
          profileImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=300',
          availability: availabilityDrSy
        }
      }
    ];

    await User.insertMany(usersData);
    console.log('Utilisateurs (Sénégal : Dakar & Thiès) insérés avec succès !');

    console.log('Peuplement de la base de données terminé !');
    process.exit(0);
  } catch (error) {
    console.error(`Erreur de peuplement : ${error.message}`);
    process.exit(1);
  }
};

seedData();
