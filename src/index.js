require('dotenv').config();

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
    saveUninitialized: false,
    secret: 'fnkdjggbdkjtghdljgnlgje',
    resave: false,
    store: sessionstore,
    cookie: {
        maxAge: 1200000  //存活時間
    }
}))


app.use((req, res, next) => {
    res.locals.account = req.body.account //把登入session存到res.locals.sess 用來做登出登入
    next();
})

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

app.post('/try-member', async (req, res)=>{
   
    const sql = "SELECT `sid`, `authAccount`, `authPassword`, `name`, `email`, `phone`, `birth`, `country`, `township`, `address`, `card`, `cardDate`, `cvc`, `invoice`, `barCode`, `favorite` FROM `member` WHERE sid=?"
    const [rs] = await db.query(sql, [req.body.sid])
    console.log(rs[0])
    res.json(rs)
});



app.get('/try-list', (req, res)=>{
    db.query('SELECT * FROM `product-new`')
        .then(([results])=>{
            res.json(results);
            console.log('123')
        })
});

app.get('/try-ordercheck', (req, res)=>{
    db.query('SELECT * FROM `ordercheck`')
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

app.get('/try-hair', (req, res)=>{
    // db.query('SELECT * FROM `shops` LIMIT 2')
    db.query('SELECT * FROM `shops` WHERE `shop_cate_tag`="男士理髮"')
        .then(([results])=>{
            res.json(results);
            console.log('shoplist')
        })
});

app.get('/try-beard', (req, res)=>{
    // db.query('SELECT * FROM `shops` LIMIT 2')
    db.query('SELECT * FROM `shops` WHERE `shop_cate_tag`="男士修容"')
        .then(([results])=>{
            res.json(results);
            console.log('shoplist')
        })
});

app.post('/try-order', async (req, res)=>{
    // db.query('SELECT * FROM `shops` LIMIT 2')
    console.log("123",req.body)
    console.log("req.body.payment123",req.body.payment.toString())
    const data = {
        recipient: req.body.recipient,
        img: req.body.payment[0].img,
        protuctname: req.body.payment[0].name ,
        type:req.body.payment[0].type,
        amount: req.body.payment[0].amount,
        unitprice:req.body.payment[0].price,
        total:req.body.payment[0].price,
        data: new Date(),
        ordersid: moment().unix()
    };
    // console.log(data)
    // data.created_at = new Date();

    const sql = "INSERT INTO `ordercheck` set ?"
    const [{affectedRows, insertId}] = await db.query(sql, [ data ]);

    // [{"fieldCount":0,"affectedRows":1,"insertId":860,"info":"","serverStatus":2,"warningStatus":1},null]
});



app.use('/yen',require(__dirname +'/routes/yen'));

app.use('/yu',require(__dirname +'/routes/yu'));

app.use((req, res) => {
    res.type('text/plain');
    res.status('404');
    res.send("路由錯了")
})

app.listen(3000, function () {
    console.log('啟動 server 偵聽阜號 3000');   
});