const { Op } = require('sequelize');
const { sequelize } = require('../model');
const balances = require('express').Router({ mergeParams: true });

const sumReducer = (acc, cur) => acc + cur;

balances.post('/deposit/:id', async (req, res, next) => {
   const { Job, Contract, Profile } = req.app.get('models');
   const { id } = req.params;
   const { amount } = req.body;

   const profile = await Profile.findOne({
      include: [
         {
            model: Contract,
            as: 'Client',
            required: true,
            include: [Job],
            where: {
               status: 'in_progress'
            }
         },
      ],
      where: { id }
   });

   const total = profile.Client
      .map(c => c.Jobs
         .map(j => j.price)
         .reduce(sumReducer, 0))
      .reduce(sumReducer, 0);

   if (amount > 0.25 * total) {
      res.status(400).send("You're not allowed to charge more than 25% of you total jobs.");
      return;
   }

   try {
      profile.balance += amount;
      profile.save();
      res.json(profile);

   } catch (error) {
      console.log('🎵 oh no, oh no, oh no no no no no 🎵');
      res.status(500, 'something went wrong buddy.');
   }
});

module.exports = balances;