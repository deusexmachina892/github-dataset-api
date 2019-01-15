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
    repoToBeSaved = await Repo.findById(repo.id);
    if (repoToBeSaved) {
      await Repo.findOneAndUpdate({ _id: repo.id }, {
        $push: { events: id }
        });
    } else {
        repoToBeSaved = new Repo({
            _id: repo.id,
            name: repo.name,
            url: repo.url,
            owner: actor.id
          });
        repoToBeSaved = await repoToBeSaved.save();
    }
    actorToBeSaved = await Actor.findById(actor.id);
    if (actorToBeSaved) {
        await Actor.findOneAndUpdate({ _id: actor.id }, {
            $push: {
                events: id,
                repo: repo.id
            }
        });
    } else {
        actorToBeSaved = new Actor({
            _id: actor.id,
            login: actor.login,
            avatar_url: actor.avatar_url
         });
        actorToBeSaved.events.push(event._id);
        actorToBeSaved.repos.push(repoToBeSaved._id);
        actorToBeSaved = await actorToBeSaved.save();
    }
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
