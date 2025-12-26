const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const { errorMiddleware } = require('./middlewares/error.middleware');

const authRoutes = require('./modules/auth/auth.routes');
const locationRoutes = require('./modules/locations/locations.routes');
const uploadRoutes = require('./modules/uploads/uploads.routes');

// stubs (mounted so routes exist even before we implement)
const listingsRoutes = require('./modules/listings/listings.routes');
const favoritesRoutes = require('./modules/favorites/favorites.routes');
const offersRoutes = require('./modules/offers/offers.routes');
const savedSearchRoutes = require('./modules/saved-searches/savedSearches.routes');
const notificationsRoutes = require('./modules/notifications/notifications.routes');
const reportsRoutes = require('./modules/reports/reports.routes');
const adminRoutes = require('./modules/admin/admin.routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

const swaggerDocument = YAML.load(path.join(__dirname, './docs/swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/auth', authRoutes);
app.use('/locations', locationRoutes);
app.use('/uploads', uploadRoutes);

app.use('/listings', listingsRoutes);
app.use('/favorites', favoritesRoutes);
app.use('/offers', offersRoutes);
app.use('/saved-searches', savedSearchRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/reports', reportsRoutes);
app.use('/admin', adminRoutes);

app.use(errorMiddleware);

module.exports = { app };
