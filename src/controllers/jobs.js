const { Op } = require('sequelize');
const { sequelize } = require('../model');
const jobs = require('express').Router({ mergeParams: true });

jobs.get('/unpaid', async (req, res) => {
   const { Job, Contract } = req.app.get('models');
   const profile = req.profile;

   const result = await Job.findAll({
      include: {
         model: Contract,
         required: true,
         where: {
            [Op.and]: {
               [Op.or]: [
                  { ContractorId: profile.id },
                  { ClientId: profile.id },
               ],
               status: 'in_progress'
            }
         }
      },
      where: {
         paid: {
            [Op.not]: true
            // [Op.or]: {
            //    // [Op.eq]: false,
            // }
         }

      }
   });

   res.json(result);
});

jobs.post('/:id/pay', async (req, res, next) => {
   const { Job, Contract } = req.app.get('models');
   const profile = req.profile;
   const { id } = req.params;

   const job = await Job.findOne({
      include: {
         model: Contract,
         required: true
      },
      where: { id }
   });

   if (job.Contract.ClientId !== profile.id) {
      res.status(403).send("It's not your job man!");
      return;
   }
   if (job.paid) {
      res.status(400).send("Already paid! but if you feel rich, this is my bitcon wallet...");
      return;
   }
   if (job.Contract.status !== 'in_progress') {
      // I'm not sure about this.
   }

   if (profile.balance < job.price) {
      res.status(406).send('no money no honey dude!');
      return;

   } else {
      const transaction = await sequelize.transaction({});
      try {
         profile.balance -= job.price;
         profile.save();

         job.paid = true;
         job.paymentDate = new Date();
         job.save();

         transaction.commit();
         res.status(200).json(job);

      } catch (error) {
         transaction.rollback();
         console.error('payment failed!', id, error);
      }
   }
});

// jobs.post('/:id/unpay', async (req, res) => {
//    const { Job, Contract } = req.app.get('models');
//    const { id } = req.params;

//    const job = await Job.findOne({
//       where: { id }
//    });

//    job.paid = null;
//    job.paymentDate = null;
//    job.save();

//    res.status(200).send();
// });

module.exports = jobs;
