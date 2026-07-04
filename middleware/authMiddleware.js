const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Récupérer le token depuis le header
      token = req.headers.authorization.split(' ')[1];

      // Décoder le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Récupérer l'utilisateur associé au token et l'ajouter à req.user
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Utilisateur introuvable' });
      }

      if (!req.user.isActive) {
        return res.status(403).json({ message: 'Ce compte a été suspendu par l\'administrateur' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Non autorisé, token invalide' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Non autorisé, pas de token' });
  }
};

// Middleware pour autoriser certains rôles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({
        message: `Accès interdit : le rôle '${req.user ? req.user.role : 'invité'}' n'est pas autorisé`
      });
    }
  };
};

module.exports = { protect, authorize };
