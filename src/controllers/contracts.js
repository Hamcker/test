const { Op } = require('sequelize');
const contracts = require('express').Router({ mergeParams: true });

contracts.get('/', async (req, res) => {
   const { Contract } = req.app.get('models');
   const profile = req.profile;

   const contracts = await Contract.findAll({
      where: {
         [Op.and]: {
            [Op.or]: [
               { ContractorId: profile.id },
               { ClientId: profile.id },
            ],
            status: { [Op.ne]: 'terminated' }
         }
      }
   });

   res.json(contracts);
});

contracts.get('/:id', async (req, res) => {
   const { Contract } = req.app.get('models');
   const { id } = req.params;
   const contract = await Contract.findOne({ where: { id } })

   if (!contract) return res.status(404).end();
   if (![contract.ClientId, contract.ContractorId].includes(req.profile.id)) return res.status(401).end();

   res.json(contract)
});

module.exports = contracts;