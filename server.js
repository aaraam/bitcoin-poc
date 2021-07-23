const express = require('express');
const app = express();

require('dotenv').config();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

// Start Server
app.listen(process.env.PORT || 7100, () => console.log('Server started on port 7100'));

// Routes
const bitcoinRoute = require('./routes/btcRoutes');
app.use('/btc', bitcoinRoute);
