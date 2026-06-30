// src/controllers/notificationController.js
const Notification = require('../models/Notification');
const { AppError } = require('../utils/errorHandler');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const query = { userId };

      if (typeof req.query.isRead === 'string') {
        query.isRead = req.query.isRead === 'true';
      }

      const [items, total] = await Promise.all([
        Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Notification.countDocuments(query)
      ]);

      res.status(200).json({
        success: true,
        message: 'Notifications retrieved',
        data: {
          items,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async markRead(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const updated = await Notification.findOneAndUpdate(
        { _id: id, userId },
        { $set: { isRead: true, status: 'READ', readAt: new Date() } },
        { new: true }
      );

      if (!updated) throw new AppError('Notification not found', 404);

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: { notification: updated }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const deleted = await Notification.findOneAndDelete({ _id: id, userId });
      if (!deleted) throw new AppError('Notification not found', 404);

      res.status(200).json({
        success: true,
        message: 'Notification deleted'
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllRead(req, res, next) {
    try {
      const userId = req.user.id;
      await Notification.updateMany(
        { userId, isRead: false },
        { $set: { isRead: true, status: 'READ', readAt: new Date() } }
      );

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();

