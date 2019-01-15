const mongoose =  require('mongoose');

const repoSchema = new mongoose.Schema({
    _id: {
      type: Number,
      unique: true,
      required: true
    },
    name: {
    type: String,
    required: true    
  },
  url: {
    type: String,
    required: true
  }
});

repoSchema.pre('save', function (next) {
  // Delete the id and avoid to save it.
  delete this.id;
  
  next();
});


repoSchema.options.toObject = repoSchema.options.toJSON = {
  virtuals: true,
  transform: function (doc, returned, opts) {
    returned.id = returned._id;

    delete returned._id;
  }
};

mongoose.model('Repo', repoSchema);
