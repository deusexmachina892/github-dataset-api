const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Repo = mongoose.model('Repo');
const Actor = mongoose.model('Actor');
const Events = mongoose.model('Event');
// Route related to delete events

router.delete('/', async (req, res) => {
  await Repo.deleteMany();
  await Actor.deleteMany();
  await Events.deleteMany();
  return res.status(200).send('Deleted all events');
});

module.exports = router;
