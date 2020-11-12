const express = require('express');
const session = require('express-session');
const MysqlStore = require('express-mysql-session')(session);
const moment = require('moment-timezone');
const db = require('./db_connect2');
const dby = require('./db_connectY');
const sessionstore = new MysqlStore({}, db)
const upload = require(__dirname + '/upload-module');
const cors = require('cors')


const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
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

app.get('/try-db', (req, res)=>{
    db.query('SELECT * FROM `cart`')
        .then(([results])=>{
            res.json(results);
            console.log('123')
        })
});



app.get('/try-list', (req, res)=>{
    db.query('SELECT * FROM `product`')
        .then(([results])=>{
            res.json(results);
            console.log('123')
        })
});



app.get('/try-home', (req, res)=>{
    db.query('SELECT * FROM `images`')
    .then(([results])=>{
        res.json(results);
    })
});

app.get('/try-shop', (req, res)=>{
    db.query('SELECT * FROM `shops`')
        .then(([results])=>{
            res.json(results);
            console.log('shoplist')
        })
});

app.get('/try-shop-page', (req, res)=>{
    db.query(`SELECT COUNT(1) totalRows FROM shops`)
        .then(([results])=>{
            res.json(results);
            console.log('shoplist-page',results)
        })
});

app.use('/yen',require(__dirname +'/routes/yen'));


app.use((req, res) => {
    res.type('text/plain');
    res.status('404');
    res.send("路由錯了")
})

app.listen(3000, function () {
    console.log('啟動 server 偵聽阜號 3000');   
});