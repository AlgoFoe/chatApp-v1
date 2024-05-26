const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    user:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    pass:{
        type:String,
        required:true,
    }
},{timestamps:true})

const collection = new mongoose.model("User",userSchema)
module.exports = collection 