const service = require('./admin.service');

async function listUsers(req, res, next) {
  try {
    const result = await service.listUsers(req.query);
    res.json({ ok: true, ...result });
  } catch (e) {
    next(e);
  }
}

async function updateUserStatus(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id))
      return res.status(400).json({ ok: false, message: 'Invalid user id' });

    await service.updateUserStatus(req.user, id, req.body);
    res.json({ ok: true, message: 'Updated' });
  } catch (e) {
    next(e);
  }
}

async function removeListing(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id))
      return res.status(400).json({ ok: false, message: 'Invalid listing id' });

    await service.removeListing(req.user, id, req.body);
    res.json({ ok: true, message: 'Listing removed' });
  } catch (e) {
    next(e);
  }
}

async function setFeatured(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id))
      return res.status(400).json({ ok: false, message: 'Invalid listing id' });

    await service.setFeatured(req.user, id, req.body);
    res.json({ ok: true, message: 'Updated' });
  } catch (e) {
    next(e);
  }
}

async function setHighlighted(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id))
      return res.status(400).json({ ok: false, message: 'Invalid listing id' });

    await service.setHighlighted(req.user, id, req.body);
    res.json({ ok: true, message: 'Updated' });
  } catch (e) {
    next(e);
  }
}

async function listReports(req, res, next) {
  try {
    const result = await service.listReports(req.query);
    res.json({ ok: true, ...result });
  } catch (e) {
    next(e);
  }
}

async function updateReport(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id))
      return res.status(400).json({ ok: false, message: 'Invalid report id' });

    await service.updateReport(req.user, id, req.body);
    res.json({ ok: true, message: 'Updated' });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listUsers,
  updateUserStatus,
  removeListing,
  setFeatured,
  setHighlighted,
  listReports,
  updateReport,
};
