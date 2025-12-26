const offersService = require('./offers.service');

async function createOfferOnListing(req, res, next) {
  try {
    const listingId = Number(req.params.id);
    if (!Number.isFinite(listingId))
      return res.status(400).json({ ok: false, message: 'Invalid listing id' });

    const { amount_lkr, message } = req.body || {};
    if (!Number.isFinite(Number(amount_lkr)) || Number(amount_lkr) <= 0) {
      return res
        .status(400)
        .json({ ok: false, message: 'amount_lkr required' });
    }

    const offer = await offersService.createOffer(
      req.user,
      listingId,
      Number(amount_lkr),
      message || null
    );
    return res.status(201).json({ ok: true, offer });
  } catch (err) {
    next(err);
  }
}

async function sellerInbox(req, res, next) {
  try {
    const items = await offersService.listSellerInbox(req.user, req.query);
    res.json({ ok: true, items });
  } catch (err) {
    next(err);
  }
}

async function myOffers(req, res, next) {
  try {
    const items = await offersService.listBuyerOffers(req.user, req.query);
    res.json({ ok: true, items });
  } catch (err) {
    next(err);
  }
}

async function updateOffer(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id))
      return res.status(400).json({ ok: false, message: 'Invalid offer id' });

    const { action, counter_amount_lkr, message } = req.body || {};
    if (!action || !['ACCEPT', 'COUNTER', 'DECLINE'].includes(action)) {
      return res
        .status(400)
        .json({ ok: false, message: 'action must be ACCEPT|COUNTER|DECLINE' });
    }

    await offersService.updateOffer(req.user, id, {
      action,
      counter_amount_lkr:
        counter_amount_lkr != null ? Number(counter_amount_lkr) : null,
      message: message || null,
    });

    res.json({ ok: true, message: 'Updated' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createOfferOnListing, sellerInbox, myOffers, updateOffer };
