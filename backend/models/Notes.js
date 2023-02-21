const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotesSchema = new Schema({

  //To store the user
  user:{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'user'
  },

  title:{
    type:String,
    required:true,
  },
  description:{
    type:String,
    required:true,
    unique:true
  },
  tag:{
    type:String,
    default:"General"
  },
  date:{
    type:Date,
    default:Date.now
  }
});

//mongoose.model(modelName, schema):

module.exports = mongoose.model('notes', NotesSchema);