const uploadsService = require('./uploads.service');

async function presign(req, res, next) {
  try {
    const result = await uploadsService.presignMany(req.user, req.body);
    res.json({ ok: true, items: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { presign };
