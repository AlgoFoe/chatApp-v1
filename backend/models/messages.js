const mongoose = require('mongoose')

const msgSchema = new mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,ref:'User',
    },
    recipient:{
        type:mongoose.Schema.Types.ObjectId,ref:'User',
    },
    text:{
        type:String,
    },
    file:{
        type:String,
    }
},{timestamps:true})

const collection = new mongoose.model("message",msgSchema)
module.exports = collection 