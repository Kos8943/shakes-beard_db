const express = require('express');
const router= express.Router();

const db = require(__dirname + '/../db_connect2');
const upload = require(__dirname + '/../upload-module');

router.get('/', (req, res) => {
    res.send('yen')
});

router.get('/try-mem', (req, res)=>{
    db.query('SELECT * FROM `member`')
        .then(([results])=>{
            res.json(results);
            
        })
});


router.get('/try-session', (req, res)=>{
    res.json( req.session);
});


router.get('/try-session-add', (req, res) => {
    req.session.myVar = req.session.myVar || 0;
    req.session.myVar++;
    console.log(req.session);
    res.json({
        session: req.session,
    })
})

router.get('/try-session-off', (req, res)=>{
    delete req.session.myVar;
    delete req.session.admin;
    res.send('session清除')
});

router.get('/test-admin-session' ,(req, res) => {
    res.render('member/log')
})

router.post('/test-admin-session', upload.none(), async (req, res) => {
    const output = {
        body: req.body,
        success: false,
    }
    const sql = "SELECT `sid`, `account` FROM `member` WHERE account=? AND password=? "
    const [rs] = await db.query(sql, [req.body.account, req.body.password]);  //SELECT出來的是一個陣列
    if (rs.length) {
        req.session.admin = [rs][0];
        output.success = true       
    }
    res.send(req.session);
})


module.exports = router;