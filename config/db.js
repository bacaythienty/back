const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connecté : ${conn.connection.host}`);
  } catch (error) {
    console.error(`Erreur de connexion à MongoDB : ${error.message}`);
    // En production, on ne quitte pas le processus pour que Render reste actif et qu'on puisse diagnostiquer
    // process.exit(1);
  }
};

module.exports = connectDB;
