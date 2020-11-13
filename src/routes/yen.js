const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const db = require(__dirname + "/../db_connect2");
const dby = require(__dirname + "/../db_connectY");
const upload = require(__dirname + "/../upload-module");

router.use(express.urlencoded({ extended: false }));
router.use(express.json());

router.get("/", (req, res) => {
  res.send("yen");
});

router.get("/try-mem", (req, res) => {
  // db.query('SELECT * FROM `member`')
  dby.query("SELECT * FROM `member`").then(([results]) => {
    res.json(results);
  });
});

//撈資料表 //資料修改
router.get("/update", (req, res) => {
  // db.query('SELECT * FROM `member`')
  dby.query("SELECT * FROM `member`").then(([results]) => {
    res.json(results);
  });
});

//登入判斷
router.post('/try-log', async (req, res) => {
    const output = {
        body: req.body,
        success: false,
    };

    const auth = {
        success: false,
    }
    console.log('req', req.body) //

    const sql = "SELECT `sid`,`authAccount`,`authPassword`,`name`, `email`, `phone` FROM `member` WHERE authAccount=? AND authPassword=?"
    console.log('sql', sql)

    //透過使用者輸入的帳密 判斷是否有這筆使用者資料
    const [rs] = await dby.query(sql, [req.body.account, req.body.password]); //SELECT出來的是一個陣列
    console.log('rs=', rs[0])

    //再次判斷（應該可以不用） 
    if (rs.length && rs[0].authAccount == req.body.account && rs[0].authPassword == req.body.password) {
        // req.session.admin = rs[0];
        // output.success = true; //登入成功
        // output.name = rs[0].name
        // output.sid = rs[0].sid
        auth.sid = rs[0].sid
        auth.account = rs[0].account
        auth.name = rs[0].name
        auth.sid = rs[0].sid
        auth.success = true; //登入成功
        console.log('ok')
        // output.token = jwt.sign({ ...rs[0] }, process.env.TOKEN_SECRECT);
        // console.log('token')
    } else {
        output.success = false

    }




    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // if (rs[0].authAccount == req.body.account) {
    //     req.session.admin = rs[0];
    //     output.success = true; //登入成功
    //     console.log('ok')
    //     // output.token = jwt.sign({ ...rs[0] }, process.env.TOKEN_SECRECT);
    //     console.log('token')
    // } else {
    //     output.success = false
    // }
    res.json(auth); //server端把output轉換成json的字串給用戶端(會自己加Content-Type)
});

//表單post測試
router.post("/post-test", (req, res) => {
  console.log("ok!!!!!!!!!!!");
  res.json(req.body);
  // res.json(req.query)
});

//查看session
router.get("/try-session", (req, res) => {
  res.json(req.session);
});

//session測試
router.get("/try-session-add", (req, res) => {
  req.session.myVar = req.session.myVar || 0;
  req.session.myVar++;
  console.log(req.session);
  res.json({
    session: req.session,
  });
});

//清除session
router.get("/try-session-off", (req, res) => {
  delete req.session.myVar;
  delete req.session.admin;
  res.send("session清除");
});

//render 登入表單
router.get("/test-admin-session", (req, res) => {
  res.render("member/log");
});

//連線資料庫 比對帳號密碼是否存在 有的話傳回[rs]
//若有拿到資料(長度不為0) 則將資料設定成為session
router.post("/test-admin-session", upload.none(), async (req, res) => {
  const output = {
    body: req.body,
    success: false,
  };
  const sql =
    "SELECT `sid`, `account` FROM `member` WHERE account=? AND password=? ";
  const [rs] = await db.query(sql, [req.body.account, req.body.password]); //SELECT出來的是一個陣列
  if (rs.length) {
    req.session.admin = [rs][0];
    output.success = true;
  }
  res.send(req.session);
});

module.exports = router;
