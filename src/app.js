const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const { sequelize } = require('./model')
const { getProfile } = require('./middleware/getProfile');

app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

app.use(getProfile);

const contracts = require('./controllers/contracts');
app.use('/contracts', getProfile, contracts);

const jobs = require('./controllers/jobs');
app.use('/jobs', getProfile, jobs);

const balances = require('./controllers/balances');
app.use('/balances', getProfile, balances);

const admin = require('./controllers/admin');
app.use('/admin', getProfile, admin);

module.exports = app;
