const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Events = mongoose.model('Event');
// Routes related to actor.
router.put('/', async (req, res) => {
   const { id, login, avatar_url } = req.body
   let actorInEvent = (await Events.findOne({ 'actor._id': id })).actor;
   if (!actorInEvent) return res.status(404).send('Actor does not exist!');
   if (actorInEvent.login !== login) return res.status(400).send('Cannot modify any other field that avatar_url');

   await Events.updateMany({'actor._id': id}, {
       $set: {
           'actor.avatar_url': avatar_url
       }
   }, {new: true});
   return res.status(200).send();
});

router.get('/', async (req, res) => {
    const actors = await Events.find({}).select('actor created_at');
    let actorJSON = {};
    actors.forEach(actor => {
        let actorId = actor['actor'].id;
       if (!actorJSON[actorId]) {
          actorJSON[actorId] = {};
          actorJSON[actorId].id = Number(actorId);
          actorJSON[actorId].login = actor['actor'].login;
          actorJSON[actorId].avatar_url = actor['actor'].avatar_url;
          actorJSON[actorId].eventLength = 1;
          actorJSON[actorId].latest_event = actor.created_at;
       } else {
        if (new Date(actorJSON[actorId].latest_event) < new Date(actor.created_at)) {
            actorJSON[actorId].latest_event = actor.created_at;
        }
        actorJSON[actorId].eventLength += 1;
       }
    });
    actorJSON = Object.values(actorJSON).sort(function (x, y) {
        return y.eventLength - x.eventLength || new Date(y.latest_event) - new Date(x.latest_event) || y.login - x.login;
    });
    actorJSON = actorJSON.map(actor => {
        delete actor.eventLength;
        delete actor.latest_event;
        return actor;
    });
    res.status(200).send(actorJSON);
});

router.get('/streak', async (req, res) => {
    const actors = await Events.find({}).select('actor created_at').sort({'created_at': '1'});
    let actorJSON = {};
    actors.forEach(actor => {
        let actorId = actor['actor'].id;
       if (!actorJSON[actorId]) {
          actorJSON[actorId] = {};
          actorJSON[actorId].id = Number(actorId);
          actorJSON[actorId].login = actor['actor'].login;
          actorJSON[actorId].avatar_url = actor['actor'].avatar_url;
          actorJSON[actorId].streak = 1;
          actorJSON[actorId].latest_event = actor.created_at;
       } else {
        if (new Date(actor.created_at) - new Date(actorJSON[actorId].latest_event <= 1)) {
            actorJSON[actorId].streak += 1;
            actorJSON[actorId].latest_event = actor.created_at;
        }
       }
    });
    actorJSON = Object.values(actorJSON).sort(function (x, y) {
        return y.streak - x.streak || new Date(y.latest_event) - new Date(x.latest_event) || y.login - x.login;
    });
    
    actorJSON = actorJSON.map(actor => {
        delete actor.streak;
        delete actor.latest_event;
        return actor;
    });

    res.status(200).send(actorJSON);
})
module.exports = router;