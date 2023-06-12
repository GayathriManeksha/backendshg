const mongoose=require('mongoose')
const userSchema= new mongoose.Schema({
    name: String,
    id:String,
    isinvited: {
        type: Number,
        enum: [0, 1, 2],
        default:0
      },
      unit:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Unit',
        
      }
  });
const User= mongoose.model('User', userSchema);
module.exports=User
