const express = require('express')
const ejs = require("ejs")
const bodyParser = require("body-parser")
const { default: mongoose } = require('mongoose')
const { questions } = require('./questions')

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))
app.set('view engine', 'ejs')

//database connect
mongoose.connect("mongodb+srv://mesaaransh:saaransh123@cluster0.mfqfmwp.mongodb.net/iplauction");

const playerSchema = new mongoose.Schema({

    _id: Number,
    group: Number,
    name: String,
    team: String,
    role: String,
    price: Number,
    isWicketKeeper: Boolean,
    battingRating: Number,
    feildingRating: Number,
    bowlingRating: Number

})

const groupSchema = new mongoose.Schema({

    players: [Number],
    basePrice: {
        default: 2,
        type: Number
    },
    sellPrice: Number

})

const teamSchema = new mongoose.Schema({
    _id: Number,
    name: String,
    purse: {
        type: Number,
        default: 40
    },
    members: Array,
    rollNo: Array,
    groups: [mongoose.Schema.ObjectId]
})

const player = mongoose.model('player', playerSchema)
const group = mongoose.model('group', groupSchema)
const team = mongoose.model('team', teamSchema)
var quesList = questions;

// app.get("/testing", async function(req, res){


//     for(var i = 1; i <= 63; i++){
//         var playerData = await player.find({group: i});
//         var singleGroup = {
//             players: [],
//             basePrice: 0,
//             sellPrice: null
//         }

//         playerData.forEach((player) => {
//             singleGroup.players.push(player._id)
//             singleGroup.basePrice += player.price;
//         })

//         console.log(singleGroup);
//         var data = new group(singleGroup)
//         await data.save();
//     }

//     var newTeam = new team({
//         _id: 1001,
//         name: "Kuch Bhi",
//         members: ["k", "u", "c", "h"],
//     })

//     newTeam.save();


// })


app.get("/test", function (req, res) {
    try {
        res.render('test.ejs', { q: quesList })
    } catch (error) {
        res.send(error);
    }
})

app.post("/test", async function (req, res) {

    try {

        var answers = req.body;
        var score = 0;
        for (let i = 0; i < quesList.length; i++) {
            if (answers[i].toLowerCase() == quesList[i].answer) {
                score++;
            }
        }

        console.log(answers);
        var setScore = Math.round(((score / 22) * 150) * 10) / 10;

        await team.findByIdAndUpdate(parseInt(answers.teamid), {
            purse: setScore < 40 ? 40 : setScore
        })

        res.redirect("/test")

    } catch (error) {
        res.send(error)
    }

})



app.get("/groupallot/:id", async function (req, res) {

    try {
        if (req.params.id < 63) {
            var data = await player.find({ group: req.params.id });

            var groupData = await group.find({});
            var groupId = groupData[req.params.id - 1]._id.toString();

            res.render("alloter", { data: data, number: req.params.id, group: groupData, groupId: groupId });
        }
        else {
            res.redirect("/leaderboard")
        }

    } catch (error) {
        res.send(error)
    }

})

app.post("/groupallot/:id", async function (req, res) {

    try {
        var selectedTeam = await team.findById(req.body.team);
        selectedTeam.purse -= req.body.price;
        selectedTeam.groups.push(req.body.group);

        var selectedGroup = await group.find({ _id: req.body.group });
        selectedGroup[0].sellPrice = parseInt(req.body.price);

        await group.findOneAndUpdate({ _id: req.body.group }, selectedGroup[0]);
        console.log(req.body.price, selectedGroup);

        var updatedTeam = new team(selectedTeam);
        await updatedTeam.save();

        var id = parseInt(req.params.id) + 1;
        res.redirect("/groupallot/" + id);
    }
    catch (e) {
        res.send(e);
    }
})

app.get("/leaderboard", async function (req, res) {

    try {
        var allTeams = await team.find({});
        var leaderboard = [];

        for (let i = 0; i < allTeams.length; i++) {

            var currTeam = {
                name: allTeams[i].name,
                members: allTeams[i].members,
                players: [],
                isQualified: 0,
                points: 0
            }

            for (let j = 0; j < allTeams[i].groups.length; j++) {

                var currGroup = await group.findById(allTeams[i].groups[j]);
                console.log(currGroup);

                for (let k = 0; k < currGroup.players.length; k++) {

                    var currPlayer = await player.findById(currGroup.players[k]);
                    currTeam.points += currPlayer.battingRating + currPlayer.feildingRating + currPlayer.bowlingRating;
                    if (currPlayer.isWicketKeeper) {
                        currTeam.isQualified = 1;
                    }
                    currTeam.players.push(currPlayer);
                    // console.log(currPlayer);

                }

            }

            if (currTeam.isQualified && currTeam.players.length > 11)
                leaderboard.push(currTeam);
            else
                currTeam.isQualified = 0;
        }

        leaderboard.sort((a, b) => {a.points - b.points});
        res.render("leaderboard.ejs", { data: leaderboard })
    } catch (error) {
        res.send(error)
    }

})
app.listen(process.env.PORT || 8000, () => { console.log("----------AppStarted-----------"); })