require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connexion à la base de données
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/specialties', require('./routes/specialtyRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

// Route de base de test
app.get('/', (req, res) => {
  res.send('API MediRdv en ligne (v2 - limit 10mb) !');
});

// Middleware de gestion des erreurs global
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Serveur démarré en mode ${process.env.NODE_ENV || 'développement'} sur le port ${PORT}`);
});
