const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const async = require('async');

const { validateEvent } = require('../models/Event');
const formattedDate = require('../utils/dateUtils');

const Event = mongoose.model('Event');
const Actor = mongoose.model('Actor');
const Repo = mongoose.model('Repo');

// Routes related to event
router.get('/', async (req, res) => {
// events sorted by id
  const events = await Event.find({}, null, {sort: {'_id': '-1'}})
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

  let event = await Event.findById(id);

  if (event) {
      return res.status(400).send('Event with same id exists!');
  }

   event = new Event({
    _id: id,
    type,
    actor: actor.id,
    repo: repo.id,
    created_at: formattedDate(new Date(created_at))
});

   let repoToBeSaved = new Repo({
     _id: repo.id,
     name: repo.name,
     url: repo.url,
     owner: actor.id
   });
   let actorToBeSaved = new Actor({
      _id: actor.id,
      login: actor.login,
      avatar_url: actor.avatar_url
   });
   actorToBeSaved.events.push(event._id);
   actorToBeSaved.repos.push(repoToBeSaved._id);
   try {
    event = await event.save();
    repoToBeSaved = await repoToBeSaved.save();
    actorToBeSaved = await actorToBeSaved.save();
   } catch (error) {
       console.log(error.message)
       return res.status(404).send('Something went wrong');
   }
  return res.status(201).send('Event saved successfully!');
});

module.exports = router;
