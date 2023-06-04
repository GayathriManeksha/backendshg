const mongoose=require('mongoose')
const unitSchema = new mongoose.Schema({
    name: String,
    ID:String,
    no_of_members:Number,
    members:[{
      type:mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
}]
  });
const Unit = mongoose.model('Unit', unitSchema);
module.exports=Unit
