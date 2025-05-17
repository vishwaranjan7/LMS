const mongoose = require('mongoose');

mongoose.set("strictQuery",false);

const dbConnect=async()=>{
   const {connection}= await mongoose.connect(process.env.MONGO_URI);

   try {
    
       if (connection) {
        console.log(`Connected to ${connection.host}`);
       }
   } catch (error) {
    console.error(error);
    process.exit(1);
    
   }
}

module.exports=dbConnect;