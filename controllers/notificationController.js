const Notification = require('../models/Notification');

// Obtenir toutes les notifications de l'utilisateur connecté
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50); // Limite aux 50 dernières notifications
    res.json(notifications);
  } catch (error) {
    console.error('Erreur getNotifications:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des notifications' });
  }
};

// Marquer une notification comme lue
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification introuvable' });
    }
    res.json(notification);
  } catch (error) {
    console.error('Erreur markAsRead:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la notification' });
  }
};

// Marquer toutes les notifications comme lues
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'Toutes les notifications ont été marquées comme lues' });
  } catch (error) {
    console.error('Erreur markAllAsRead:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour des notifications' });
  }
};
