module.exports = {};
const {
  CreateListingSchema,
  UpdateListingSchema,
} = require('./listings.schemas');
const listingsService = require('./listings.service');

async function createListing(req, res, next) {
  try {
    const parsed = CreateListingSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ ok: false, message: 'Invalid body' });

    const listing = await listingsService.createListing(req.user, parsed.data);
    res.status(201).json({ ok: true, listing });
  } catch (err) {
    next(err);
  }
}

async function getListingById(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id))
      return res.status(400).json({ ok: false, message: 'Invalid id' });

    const listing = await listingsService.getListingById(id);
    if (!listing)
      return res.status(404).json({ ok: false, message: 'Not found' });

    res.json({ ok: true, listing });
  } catch (err) {
    next(err);
  }
}

async function updateListing(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id))
      return res.status(400).json({ ok: false, message: 'Invalid id' });

    const parsed = UpdateListingSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ ok: false, message: 'Invalid body' });

    await listingsService.updateListing(req.user, id, parsed.data);
    res.json({ ok: true, message: 'Updated' });
  } catch (err) {
    next(err);
  }
}

async function deleteListing(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id))
      return res.status(400).json({ ok: false, message: 'Invalid id' });

    await listingsService.deleteListing(req.user, id);
    res.json({ ok: true, message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}

async function pauseListing(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id))
      return res.status(400).json({ ok: false, message: 'Invalid id' });

    await listingsService.setListingStatus(req.user, id, 'PAUSED');
    res.json({ ok: true, message: 'Paused' });
  } catch (err) {
    next(err);
  }
}

async function unpauseListing(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id))
      return res.status(400).json({ ok: false, message: 'Invalid id' });

    await listingsService.setListingStatus(req.user, id, 'ACTIVE');
    res.json({ ok: true, message: 'Unpaused' });
  } catch (err) {
    next(err);
  }
}

async function renewListing(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id))
      return res.status(400).json({ ok: false, message: 'Invalid id' });

    await listingsService.renewListing(req.user, id);
    res.json({ ok: true, message: 'Renewed' });
  } catch (err) {
    next(err);
  }
}

async function searchListings(req, res, next) {
  try {
    const result = await listingsService.searchListings(req.query);
    res.json({ ok: true, ...result });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createListing,
  getListingById,
  updateListing,
  deleteListing,
  pauseListing,
  unpauseListing,
  renewListing,
  searchListings,
};
