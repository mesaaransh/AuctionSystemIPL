const express = require('express')
const ejs = require("ejs")
const bodyParser = require("body-parser")
const { default: mongoose } = require('mongoose')

const app = express()
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"))
app.set('view engine', 'ejs')



//database connect
mongoose.connect("mongodb://localhost:27017/iplauction");

const playerSchema = new mongoose.Schema({

    name: String,
    team: String,
    role: String,
    isWicketKeeper: Boolean,
    batting: Number,
    Feilding: Number,
    Bowling: Number

})

const groupSchema = new mongoose.Schema({

    players: [mongoose.Schema.ObjectId],
    basePrice:{
        default: 2,
        type: Number
    },
    sellPrice: Number

})

const studentSchema = new mongoose.Schema({

    _id: Number,
    name: String,
    email: String,
    phone: String

})

const teamSchema = new mongoose.Schema({

    members: [mongoose.Schema.ObjectId],
    name: String,
    purse: {
        type: Number,
        default: 40
    },
    groups: [mongoose.Schema.ObjectId]

})

const player = mongoose.model('player', playerSchema)
const group = mongoose.model('group', groupSchema)
const student = mongoose.model('student', studentSchema)
const team = mongoose.model('team', teamSchema)


app.get("/master", function(req, res){
    res.render('auctionmaster.ejs')
})

app.get("/register", function(req, res){
    res.render('register.ejs')
})

app.post("/groupallot", function(req, res){

    console.log(req.body);
    res.redirect("/")

})

app.listen(8000, ()=>{console.log("----------AppStarted-----------");})