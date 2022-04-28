const { Op } = require('sequelize');
const { sequelize } = require('../model');
const admin = require('express').Router({ mergeParams: true });

admin.get('/best-profession', async (req, res, next) => {
   const { start, end } = req.query;

   const topJob = await sequelize.query(`
      SELECT p.profession, SUM(j.price) totalEarned
      FROM Profiles p
      LEFT JOIN Contracts c on c.ContractorId = p.id
      LEFT JOIN Jobs j on j.ContractId = c.id
      WHERE j.paymentDate >= '${new Date(start).toJSON()}' AND j.paymentDate <= '${new Date(end).toJSON()}'
      GROUP BY p.profession
      ORDER BY SUM(j.price) DESC
      LIMIT 1
   `);

   res.json(topJob[0]);

});

admin.get('/best-clients', async (req, res, next) => {
   const { start, end } = req.query;

   const topJob = await sequelize.query(`
      SELECT p.id, p.firstName, p.lastName, SUM(j.price) totalEarned
      FROM Profiles p
      LEFT JOIN Contracts c on c.ClientId = p.id
      LEFT JOIN Jobs j on j.ContractId = c.id
      WHERE j.paymentDate >= '${new Date(start).toJSON()}' AND j.paymentDate <= '${new Date(end).toJSON()}'
      GROUP BY p.id, p.firstName, p.lastName
      ORDER BY SUM(j.price) DESC
      LIMIT 1
   `);

   res.json(topJob[0]);
});

module.exports = admin;