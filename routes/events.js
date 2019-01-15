const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const async = require('async');

const { validateEvent } = require('../models/Events');
const formattedDate = require('../utils/dateUtils');

const Events = mongoose.model('Event');
const Actor = mongoose.model('Actor');
const Repo = mongoose.model('Repo');

// Routes related to event
router.get('/', async (req, res) => {
// events sorted by id
  const events = await Events.find({}, null, {sort: {'_id': '-1'}})
                   .select('-__v')
                   .populate('actor repo', '-__v -events -repos');

   return res.status(200).send(events);
});

router.post('/', async (req, res) => {
  const { error } = validateEvent(req.body);
  if (error) {
      return res.status(400).send('Please check the fields entered!');
  }

  const {
      id,
      type,
      actor,
      repo,
      created_at
  } = req.body;

  let event = await Events.findById(id);

  if (event) {
      return res.status(400).send('Event with same id exists!');
  }

   event = new Events({
    _id: id,
    type,
    actor: actor.id,
    repo: repo.id,
    created_at: formattedDate(new Date(created_at))
});

   try {
    event = await event.save();

   } catch (error) {
       console.log(error.message);
       return res.status(404).send('Something went wrong');
   }
  return res.status(201).send('Event saved successfully!');
});

router.get('/actors/:actorId', async (req, res) => {
  const { actorId } = req.params;
  let actor = await Actor.findById(actorId);

  if (!actor) return res.status(404).send('Actor not found!');
  const eventsByActor = await Events.find({ actor: actorId }, null, { sort: { '_id': '-1' } });
  return res.status(200).send(eventsByActor);
});

module.exports = router;
