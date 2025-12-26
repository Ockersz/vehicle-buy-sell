const service = require('./uploads.service');

async function presignOne(req, res, next) {
  try {
    const out = await service.presignOne(req.user, req.body);
    res.json({ ok: true, ...out });
  } catch (e) {
    next(e);
  }
}

async function presignMulti(req, res, next) {
  try {
    const out = await service.presignMulti(req.user, req.body);
    res.json({ ok: true, ...out });
  } catch (e) {
    next(e);
  }
}

async function deleteObject(req, res, next) {
  try {
    await service.deleteObject(req.user, req.body);
    res.json({ ok: true, message: 'Deleted' });
  } catch (e) {
    next(e);
  }
}

module.exports = { presignOne, presignMulti, deleteObject };
