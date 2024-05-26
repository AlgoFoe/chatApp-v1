const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/register');
const Message = require('./models/messages');
const dotenv = require('dotenv');
const ws = require('ws');
const fs = require('fs');
const path = require('path');

dotenv.config();

const PORT = process.env.PORT;
const allowedOrigin = process.env.ORIGIN_URL;
const jwtSecret = process.env.JWT_SECRET_KEY;
const salt = bcrypt.genSaltSync(10);

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

mongoose.connect(process.env.MONGO_URL);

app.use('/uploads', express.static(uploadsDir));
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: allowedOrigin,
    credentials: true,
}));

async function decodeToken(req){
    return new Promise((resolve,reject)=>{
        const token = req.cookies?.token;
        if(token){
            jwt.verify(token,jwtSecret,{},(e,user_data)=>{
                if (e) throw e;
                resolve(user_data);
            })
        }else{
            reject('no token');
        }
    });
}

app.get('/', (req, res) => {
  res.json("Test Ok");
});

app.get('/contacts', async (req,res)=>{
    const contacts = await User.find({},{'_id':1,user:1});
    res.json(contacts);
});

app.get('/messages/:userId',async (req,res)=>{
    const {userId} = req.params;
    const userData = await decodeToken(req);
    const myId = userData.userId;
    const messages = await Message.find({
        sender:{$in:[userId,myId]},
        recipient:{$in:[userId,myId]},  
    }).sort({createdAt : 1});
    res.json(messages);
});

app.post('/login',async (req,res)=>{
    const {user,pass} = req.body;
    const searchedUser = await User.findOne({user});
    if(searchedUser){
        const gatePass = bcrypt.compareSync(pass,searchedUser.pass);
        if(gatePass){
            jwt.sign({ userId: searchedUser._id ,user}, jwtSecret, {}, (e, token) => {
                if (e) throw e;
                res.cookie('token', token, {sameSite:'none',secure:true}).status(201).json({
                  id:searchedUser._id,
                });
            });
        } 
    }
});

app.post('/register', async (req, res) => {
  const { user, email, pass } = req.body;
  try {
    const hashedPass = bcrypt.hashSync(pass, salt);
    const createdUser = await User.create({ user, email, pass: hashedPass });
    jwt.sign({ userId: createdUser._id ,user}, jwtSecret, {}, (e, token) => {
      if (e) throw e;
      res.cookie('token', token, {sameSite:'none',secure:true}).status(201).json({
        _id: createdUser._id,
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } 
});

app.get('/profile', (req, res) => {
    const token = req.cookies?.token;
    if(token){
        jwt.verify(token, jwtSecret, {}, (e, user_data) => {
            if (e) throw 'Error';
            res.json(user_data);
        });
    } else {
        res.json('Not logged in');
    }
});

app.post('/logout', (req, res) => {
    res.cookie('token', '', {sameSite:'none',secure:true}).json('ok');
});

const server = app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

function getCookieValue(cookieString, cookieName) {
    const match = cookieString.match(new RegExp(`(^|; )${cookieName}=([^;]*)`));
    return match ? match[2] : null;
}

const wss = new ws.WebSocketServer({ server });

wss.on('connection', (connection, req) => {

    function notifyOnline() {
        [...wss.clients].forEach(client => {
            client.send(JSON.stringify({
                online: [...wss.clients].map(c => ({ userId: c.userId, username: c.username }))
            }));
        });
    }

    connection.isAlive = true;
    connection.timer = setInterval(() => {
        connection.ping();
        connection.deathTimer = setTimeout(() => {
            connection.isAlive = false;
            clearInterval(connection.timer);
            connection.terminate();
            notifyOnline();
        }, 1000);
    }, 5000);

    connection.on('pong', () => {
        clearTimeout(connection.deathTimer);
    });

    // Get data (userId, username) from cookie
    const token = getCookieValue(req.headers.cookie, 'token');
    if(token){
        jwt.verify(token, jwtSecret, {}, (e, data) => {
            if(e) throw e;
            const { user, userId } = data;
            connection.username = user;
            connection.userId = userId;
        });
    }

    connection.on('message', async (message) => {
        const msgData = JSON.parse(message.toString());
        const { to, text, file } = msgData;
        let filename = null;
        if (file) {
            filename = file.fileName;
            const filePath = path.join(__dirname, "uploads", file.fileName);
            const base64Data = file.data.split(',')[1];
            const bufferVal = Buffer.from(base64Data, 'base64');
            fs.writeFile(filePath, bufferVal, () => {
                console.log('file saved:', filePath);
            });
        }
        if (to && (text || file)) {
            const msgDoc = await Message.create({
                sender: connection.userId,
                recipient: to,
                text,
                file: file ? filename : null
            });
            [...wss.clients].filter(c => c.userId === to).forEach(c => c.send(JSON.stringify({
                text,
                sender: connection.userId,
                recipient: to,
                file: file ? filename : null,
                _id: msgDoc._id
            })));
        }
    });

    // Notify when someone connects
    notifyOnline();
});
