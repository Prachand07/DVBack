const mongoose=require("mongoose");
require('dotenv').config();
const url=process.env.MONGO_URL;

mongoose.connect(url);
const data=mongoose.connection;
data.on("connected",()=>{
    console.log("Database connected");
})
data.on("disconncted",()=>{
    console.log("Database disconnected");
})

module.exports=data;
