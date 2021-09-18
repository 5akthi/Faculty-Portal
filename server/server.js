const express = require('express');
const http = require('http');
const socket =  require('socket.io');
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');

const dotenv = require('dotenv');
dotenv.config()

const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

//MIDDILEWARES
const app = express();
let server = http.createServer(app);
let io = socket(server);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});

const facultyRoutes = require('./routes/facultyRoutes');
const visitorRoute = require('./routes/visitorRoute');

//Passport Middleware
app.use(passport.initialize());

//Passport Config.
require('./config/passport')(passport)

app.use(morgan('dev'))

io.on('connection', (socket) => {
    socket.on('join room', ({room1, room2}) => {
        socket.join(room1)
        socket.join(room2)
    })
    socket.on("private message", (message) => {
        io.to(message.room).emit('new Message', {
            message: message.message,
            sender: message.sender
        });
   })
    socket.on('disconnect', function () {
        console.log('Socket disconnected');
    })
})

//ROUTES
app.use('/api/visitor', visitorRoute);
app.use('/api/faculty', facultyRoutes);

//Catching 404 Error
app.use((req, res, next) => {
    const error = new Error('INVALID ROUTE');
    error.status = 404;
    next(error);
})

//Error handler function
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URL.replace("<password>", process.env.MONGO_PASSWORD)
, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    server.listen(PORT);
    console.log("server Started");
}).catch((err) => {
    console.log("Error in connecting to DataBase", err.message);
})