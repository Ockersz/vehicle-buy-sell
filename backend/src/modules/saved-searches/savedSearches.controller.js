const service = require('./savedSearches.service');

async function listSavedSearches(req, res, next) {
  try {
    const items = await service.listSavedSearches(req.user);
    res.json({ ok: true, items });
  } catch (e) {
    next(e);
  }
}

async function createSavedSearch(req, res, next) {
  try {
    const saved = await service.createSavedSearch(req.user, req.body);
    res.status(201).json({ ok: true, saved_search: saved });
  } catch (e) {
    next(e);
  }
}

async function updateSavedSearch(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id))
      return res.status(400).json({ ok: false, message: 'Invalid id' });

    await service.updateSavedSearch(req.user, id, req.body);
    res.json({ ok: true, message: 'Updated' });
  } catch (e) {
    next(e);
  }
}

async function deleteSavedSearch(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id))
      return res.status(400).json({ ok: false, message: 'Invalid id' });

    await service.deleteSavedSearch(req.user, id);
    res.json({ ok: true, message: 'Deleted' });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listSavedSearches,
  createSavedSearch,
  updateSavedSearch,
  deleteSavedSearch,
};
