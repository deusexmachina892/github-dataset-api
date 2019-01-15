const mongoose = require('mongoose');

const actorSchema = new mongoose.Schema({
    _id: {
      type: Number,
      unique: true,
      required: true
    },
    login: {
      type: String,
      required: true
    },
    avatar_url: {
      type: String,
      required: true
    }
});

actorSchema.pre('save', function (next) {
  // Delete the id and avoid to save it.
  delete this.id;
  next();
});

actorSchema.options.toObject = actorSchema.options.toJSON = {
  virtuals: true,
  transform: function (doc, returned, opts) {
    returned.id = returned._id;

    delete returned._id;
  }
};

mongoose.model('Actor', actorSchema);
module.exports = actorSchema;
