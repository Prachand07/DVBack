const mongoose=require("mongoose");
require('dotenv').config();
const url="mongodb+srv://Aarush:Aarush%402004@aarush.ig24n.mongodb.net/";

mongoose.connect(url);
const data=mongoose.connection;
data.on("connected",()=>{
    console.log("Database connected");
})
data.on("disconncted",()=>{
    console.log("Database disconnected");
})

module.exports=data;
