const favoritesService = require('./favorites.service');

async function addFavorite(req, res, next) {
  try {
    const listingId = Number(req.params.listingId);
    if (!Number.isFinite(listingId))
      return res.status(400).json({ ok: false, message: 'Invalid listingId' });

    await favoritesService.addFavorite(req.user, listingId);
    res.json({ ok: true, message: 'Favorited' });
  } catch (err) {
    next(err);
  }
}

async function removeFavorite(req, res, next) {
  try {
    const listingId = Number(req.params.listingId);
    if (!Number.isFinite(listingId))
      return res.status(400).json({ ok: false, message: 'Invalid listingId' });

    await favoritesService.removeFavorite(req.user, listingId);
    res.json({ ok: true, message: 'Unfavorited' });
  } catch (err) {
    next(err);
  }
}

async function listMyFavorites(req, res, next) {
  try {
    const items = await favoritesService.listMyFavorites(req.user, req.query);
    res.json({ ok: true, items });
  } catch (err) {
    next(err);
  }
}

module.exports = { addFavorite, removeFavorite, listMyFavorites };
