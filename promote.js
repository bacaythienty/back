require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const promoteUser = async () => {
  const email = process.argv[2];
  if (!email) {
    console.error("Veuillez fournir l'adresse email de l'utilisateur à promouvoir en admin.");
    console.log("Usage: node promote.js <email>");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.error(`Utilisateur avec l'email ${email} introuvable.`);
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();
    console.log(`Succès : L'utilisateur ${user.name} (${email}) a été promu au rôle d'ADMINISTRATEUR !`);
    process.exit(0);
  } catch (err) {
    console.error(`Erreur : ${err.message}`);
    process.exit(1);
  }
};

promoteUser();
