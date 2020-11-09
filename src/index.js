const express = require('express');
const app = express();
const session = require('express-session');
const MysqlStore = require('express-mysql-session')(session);
const moment = require('moment-timezone');
const db = require('./db_connect2');
const sessionstore = new MysqlStore({}, db)
const cors = require('cors')


app.use( express.json() );
app.use( express.json() );
const corsOptions = {
    credentials: true,
    origin: function(origin, cb){
        console.log(`origin: ${origin}`);
        cb(null, true);
    }
};

app.use(cors(corsOptions))

app.use(session({
    saveUninitialized:false,
    resave: false,
    secret: '12345',
    store: sessionstore,
    cookie: {
        maxAge: 1200000, //20分鐘
    }
}));

app.use(express.static('public'));


app.get( '/', function(req, res) {
    res.send('Hello World');
});

app.get('/try-session', (req, res)=>{
    req.secure.myVar = req.session.myVar || 0;
    req.session.myVar++;
    res.json({
        myVar: req.session.myVar,
        session: req.session
    });
});

app.get('/try-session-off', (req, res)=>{
    delete req.session.myVar;
    res.send('session清除')
});





app.get('/try-db', (req, res)=>{
    db.query('SELECT * FROM `cart`')
        .then(([results])=>{
            res.json(results);
            console.log('123')
        })
});


app.get('/try-mem', (req, res)=>{
    db.query('SELECT * FROM `member`')
        .then(([results])=>{
            res.json(results);
            
        })
});








app.listen(3000, function () {
    console.log('啟動 server 偵聽阜號 3000');
});