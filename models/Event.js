const mongoose = require('mongoose');
const BaseJoi = require('joi');
const Extension = require('joi-date-extensions');
const Joi = BaseJoi.extend(Extension);

const eventSchema = new mongoose.Schema({
  _id: {
    type: Number,
    unique: true,
    required: true
  },
  type: {
      type: String,
      required: true
  },
  actor: {
    type: Number,
    ref: 'Actor',
    required: true
  },
  repo: {
    type: Number,
    ref: 'Repo',
    required: true
  },
  created_at: {
    type: Date,
    required: true
  }
});

eventSchema.pre('save', function (next) {
  // Delete the id and avoid to save it.
  delete this.id;
  next();
});

eventSchema.options.toObject = eventSchema.options.toJSON = {
  virtuals: true,
  transform: function (doc, returned, opts) {
    returned.id = returned._id;

    delete returned._id;
  }
};

function validateEvent(event){
  const schema = {
    id: Joi.number().required(),
    type: Joi.string().required(),
    actor: Joi.object().keys({
      id: Joi.number().required(),
      login: Joi.string().required(),
      avatar_url: Joi.string().uri().required()
    }),
    repo: Joi.object().keys({
      id: Joi.number().required(),
      name: Joi.string().required(),
      url: Joi.string().uri().required()
    }),
    created_at: Joi.date().utc().format('YYYY-MM-DD HH:mm:ss').required()
  }

  return Joi.validate(event, schema);
}
mongoose.model('Event', eventSchema);

exports.validateEvent = validateEvent;