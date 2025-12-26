const service = require('./notifications.service');

async function listMyNotifications(req, res, next) {
  try {
    const result = await service.listMyNotifications(req.user, req.query);
    res.json({ ok: true, ...result });
  } catch (e) {
    next(e);
  }
}

async function markRead(req, res, next) {
  try {
    const { ids, mark_all } = req.body || {};
    await service.markRead(req.user, { ids, mark_all });
    res.json({ ok: true, message: 'Updated' });
  } catch (e) {
    next(e);
  }
}

async function getPreferences(req, res, next) {
  try {
    const prefs = await service.getPreferences(req.user);
    res.json({ ok: true, preferences: prefs });
  } catch (e) {
    next(e);
  }
}

async function updatePreferences(req, res, next) {
  try {
    const prefs = await service.updatePreferences(req.user, req.body);
    res.json({ ok: true, preferences: prefs });
  } catch (e) {
    next(e);
  }
}

async function createTestNotification(req, res, next) {
  try {
    const n = await service.createTestNotification(req.user, req.body);
    res.status(201).json({ ok: true, notification: n });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listMyNotifications,
  markRead,
  getPreferences,
  updatePreferences,
  createTestNotification,
};
