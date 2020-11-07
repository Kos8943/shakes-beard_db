const express = require('express');
const app = express();
const session = require('express-session');
const db = require('./db_connect2');
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
    cookie: {
        maxAge: 1200000, //20分鐘
    }
}));

app.use(express.static('public'));


app.get( '/', function(req, res) {
    res.send('Hello World');
});

app.get('/try-session', (req, res)=>{
    req.secure.my_var = req.session.my_var || 0;
    req.session.my_var++;
    res.json({
        my_var: req.session.my_var,
        session: req.session
    });
});

app.get('/try-db', (req, res)=>{
    db.query('SELECT * FROM `cart`')
        .then(([results])=>{
            res.json(results);
            console.log('123')
        })
});

app.listen(3000, function () {
    console.log('啟動 server 偵聽阜號 3000');
});