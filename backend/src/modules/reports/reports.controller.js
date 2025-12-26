const service = require('./reports.service');

async function createReport(req, res, next) {
  try {
    const report = await service.createReport(req.user, req.body);
    res.status(201).json({ ok: true, report });
  } catch (e) {
    next(e);
  }
}

async function listMyReports(req, res, next) {
  try {
    const result = await service.listMyReports(req.user, req.query);
    res.json({ ok: true, ...result });
  } catch (e) {
    next(e);
  }
}

async function adminListReports(req, res, next) {
  try {
    const result = await service.adminListReports(req.query);
    res.json({ ok: true, ...result });
  } catch (e) {
    next(e);
  }
}

async function adminUpdateReport(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id))
      return res.status(400).json({ ok: false, message: 'Invalid id' });

    await service.adminUpdateReport(req.user, id, req.body);
    res.json({ ok: true, message: 'Updated' });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  createReport,
  listMyReports,
  adminListReports,
  adminUpdateReport,
};
