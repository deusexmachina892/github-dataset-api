const mongoose = require('mongoose');

const Events = mongoose.model('Event');

const getAllActors = async (req, res) => {
    const actors = await Events.find({}).select('actor created_at').sort({'created_at':'-1'});
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
          actorJSON[actorId].latest_event = actor.created_at;
          actorJSON[actorId].eventLength += 1;
       }
    });
    actorJSON = Object.values(actorJSON).sort(function (x, y) {
        const sortByEventLength = x.eventLength > y.eventLength ? -1 : (x.eventLength < y.eventLength) ? 1 : 0;
        const sortByLatestEvent = (new Date(x.latest_event) > new Date(y.latest_event)) ? -1 : (new Date(x.latest_event) < new Date(y.latest_event)) ? 1: 0;
        const sortByLogin = x.login < y.login ? -1 : (x.login > y.login) ? 1 : 0;
        return sortByEventLength || sortByLatestEvent ||sortByLogin;
    });
    actorJSON = actorJSON.map(actor => {
        delete actor.eventLength;
        delete actor.latest_event;
        return actor;
    });
    res.status(200).send(actorJSON);
};

const updateActor = async (req, res) => {
	const { id, login, avatar_url } = req.body
	let actorInEvent = (await Events.findOne({ 'actor._id': id})).actor;
	if (!actorInEvent) return res.status(404).send('Actor does not exist!');
	
	if (actorInEvent.login !== login) return res.status(400).send('Cannot modify any other field that avatar_url');
 
	let actor = await Events.updateMany({'actor._id': id}, {
		$set: {
			'actor.avatar_url': avatar_url
		}
	}, {new: true});
	return res.status(200).send();
 };

const getStreak = async (req, res) => {
    const eventsByActors = await Events.find({}).select('actor created_at').sort({ 'created_at' : '1' });
    let actorJSON = {};
    eventsByActors.forEach(event => {
        let actorId = event['actor'].id;
       if (!actorJSON[actorId]) {
          actorJSON[actorId] = {};
          actorJSON[actorId].id = Number(actorId);
          actorJSON[actorId].login = event['actor'].login;
          actorJSON[actorId].avatar_url = event['actor'].avatar_url;
          actorJSON[actorId].streak = 0;
          actorJSON[actorId].latest_event = event.created_at;
       } else {
        if ( (new Date(event.created_at).setHours(0,0,0,0) - new Date(actorJSON[actorId].latest_event).setHours(0,0,0,0)) === 86400000){
          actorJSON[actorId].streak += 1;
        }
          actorJSON[actorId].latest_event = event.created_at;
       }
    });
    actorJSON = Object.values(actorJSON).sort(function (x, y) {
        const sortByStreak = x.streak > y.streak ? -1 : (x.streak < y.streak) ? 1 : 0;
        const sortByLatestEvent = (new Date(x.latest_event) > new Date(y.latest_event)) ? -1 : (new Date(x.latest_event) < new Date(y.latest_event))? 1 : 0;
        const sortByLogin = x.login < y.login ? -1 : (x.login > y.login) ? 1 : 0;
        return sortByStreak || sortByLatestEvent || sortByLogin;
    });
    actorJSON = actorJSON.map(actor => {
        delete actor.streak;
        delete actor.latest_event;
        return actor;
    });
    res.status(200).send(actorJSON);
};


module.exports = {
	updateActor,
	getAllActors,
	getStreak
};

















