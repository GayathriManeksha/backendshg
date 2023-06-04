const express =require('express');
const mongoose=require("mongoose");
const app=express();

const bodyParser = require("body-parser");
app.use(express.json());
const cors=require("cors");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const Unit = require('./models/unit');
const User = require('./models/user');
const Announcement = require('./models/announcement');
mongoose.connect("mongodb+srv://navyaknair9:3veni@cluster0.qtmgwsg.mongodb.net/meditrack?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
},);

  // Define the API endpoint for creating a unit
app.post('/createunit', async(req, res) => {
    const unitName = req.body.unitName;

    
    const unit = new Unit({ name: unitName });
    await unit.save();

    console.log(`Created database for unit: ${unitName}`);

    
  });
app.post('/login', async(req, res) => {
    const {name, id} = req.body;
  
    console.log('Received request:',name, id);
  
    const user = await User.findOne({name: name,id: id});
    if(user){
      console.log(user);
      return res.json({status:"ok",data:user});
      
    }
    else{
      console.log("user not found");
      return res.json({status:"error"});
    }
  
    });

    app.get('/announcements', async (req, res) => {
      const { unitName } = req.query;
    
      try {
        // Fetch announcements for the specified unit
        const announcements = await Announcement.find({ unit: unitName });
    
        res.json(announcements);
      } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ message: 'Error fetching announcements' });
      }
    });
  

    app.post('/announcements', async (req, res) => {
      const { unitName, senderId, message } = req.body;
    
      try {
        
        const announcement = new Announcement({
          unit: unitName,
          senderId: senderId,
          message: message
        });
    
        
        await announcement.save();
    
        res.status(201).json({ message: 'Announcement created successfully' });
      } catch (error) {
        console.error('Error creating announcement:', error);
        res.status(500).json({ message: 'Error creating announcement' });
      }
    });

  // API endpoint for creating a user
  app.post('/users', async (req, res) => {

    console.log("Hey")
    const { name } = req.body;
  
    try {
      // Create a new user
      const user = new User({ name });
  
      // Save the user to the database
      await user.save();
  
      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Error creating user' });
    }
  });
 


    
app.listen(3005, () => {
      console.log('Server started on port 3005');
    });




    
  
    
    
   

