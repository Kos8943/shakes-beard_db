const { render } = require("ejs");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const session = require("express-session");

const db = require(__dirname + "/../db_connect2");
const dby = require(__dirname + "/../db_connectY");
const upload = require(__dirname + "/../upload-module");

router.use(express.urlencoded({ extended: false }));
router.use(express.json());

router.get("/", (req, res) => {
  localStorage.setItem("123", 123);
  res.send("yen");
});

router.get("/try-mem", (req, res) => {
  // db.query('SELECT * FROM `member`')
  db.query("SELECT * FROM `member`").then(([results]) => {
    res.json(results);
  });
});

//----------------------------------------------------------------------------------------------------------

//登入判斷 ok
router.post("/log", async (req, res) => {
  console.log("登入--------------------------");
  const auth = {};

  const sql =
    "SELECT `sid`, `authAccount`, `authPassword`, `name`, `email`, `phone`, `birth`, `country`, `township`, `address`, `card`, `cardDate`, `cvc`, `invoice`, `barCode`, `favorite` FROM `member` WHERE authAccount=? AND authPassword=?";

  //透過使用者輸入的帳密 判斷是否有這筆使用者資料
  const [rs] = await db.query(sql, [req.body.account, req.body.password]); //SELECT出來的是一個陣列
  console.log("rs=", rs[0]);

  //再次判斷（應該可以不用）
  if (rs.length) {
    auth.sid = rs[0].sid;
    auth.authAccount = rs[0].authAccount;
    auth.name = rs[0].name;
    auth.sid = rs[0].sid;
    auth.success = true;
    req.session.name = rs[0].name;
    req.session.sid = rs[0].sid;
    console.log(req.session);

    console.log("ok");
    // auth.token = jwt.sign({ ...rs[0] }, process.env.TOKEN_SECRECT);
    // console.log('token')
  } else {
    auth.success = false;
  }
  res.json(auth);
});

//--------------------------------------------------------------------------------------------------------------------------------
//註冊 ok
router.post("/sign", async (req, res) => {
  console.log("註冊--------------------------");
  const newAuth = {};
  console.log("req.body=", req.body);

  const sql =
    "SELECT `sid`, `authAccount`, `authPassword`, `name`, `email`, `phone`, `birth`, `country`, `township`, `address`, `card`, `cardDate`, `cvc`, `invoice`, `barCode`, `favorite` FROM `member` WHERE authAccount=?";

  //判斷帳號 是否已存在
  const [rs] = await db.query(sql, [req.body.newAccount]);
  console.log("rs=", rs[0]);

  if (!!rs[0]) {
    newAuth.sucess = false;
  } else {
    const data = {
      authAccount: req.body.newAccount,
      name: req.body.newName,
      email: req.body.newEmail,
      phone: req.body.newPhone,
      authPassword: req.body.newPassword,
    };
    console.log("data=", data);
    console.log(data.newAccount);

    const newSql = "INSERT INTO `member` set ?";

    const [{ affectedRows, insertId }] = await db.query(newSql, [data]);
    console.log({
      success: !!affectedRows,
      affectedRows,
      insertId,
    });

    newAuth.sucess = true;
    newAuth.authAccount = data.authAccount;
    newAuth.name = data.name;
    newAuth.sid = insertId;
  }
  res.json(newAuth);
});

//--------------------------------------------------------------------------------------------------------------------------------

//member option //撈資料 ok
router.post("/member-data", async (req, res) => {
  console.log("個人帳戶 撈資料--------------------------");
  console.log(req.body.sid);

  const sql =
    "SELECT `sid`, `authAccount`, `authPassword`, `name`, `email`, `phone`, `birth`, `country`, `township`, `address`, `card`, `cardDate`, `cvc`, `invoice`, `barCode`, `favorite` FROM `member` WHERE sid=?";

  const [rs] = await db.query(sql, [req.body.sid]);
  console.log("rs=", rs[0]);

  res.json(rs);
});

//--------------------------------------------------------------------------------------------------------------------------------

//資料修改 ok
router.post("/data-update", async (req, res) => {
  console.log("資料修改--------------------------");
  const memberUpdate = {};
  console.log("req.body=", req.body);

  const sql =
    "SELECT `sid`, `authAccount`, `name`, `email`, `phone`, `birth`, `country`, `township`, `address`, `favorite` FROM `member` WHERE sid=? AND authAccount=?";

  const [rs] = await db.query(sql, [req.body.sid.sid, req.body.authAccount]);
  console.log("rs=", rs[0]);

  const data = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    birth: req.body.birth,
    country: req.body.country,
    township: req.body.township,
    address: req.body.address,
  };

  const updataSql = "UPDATE `member` SET ? WHERE `sid`=?";
  const [{ affectedRows, changedRows }] = await db.query(updataSql, [
    data,
    req.body.sid.sid,
  ]);
  // {"fieldCount":0,"affectedRows":1,"insertId":0,"info":"Rows matched: 1  Changed: 0  Warnings: 0","serverStatus":2,"warningStatus":0,"changedRows":0}

  console.log("updata=", data);

  console.log({
    success: !!changedRows,
    affectedRows,
    changedRows,
  });

  res.json(data);
});

//--------------------------------------------------------------------------------------------------------------------------------
//密碼修改

router.post("/password-update", async (req, res) => {
  console.log("密碼--------------------------");
  console.log("req.body=", req.body);

  const sql =
    "SELECT `sid`, `authAccount`,`authPassword`, `name`, `email`, `phone`, `birth`, `country`, `township`, `address`, `favorite` FROM `member` WHERE sid=?";

  const [rs] = await db.query(sql, [req.body.sid]);
  console.log("rs=", rs[0]);

  if (rs[0].authPassword === req.body.pass) {
    const data = {
      authPassword: req.body.newPassword,
    };

    const updataSql = "UPDATE `member` SET ? WHERE `sid`=?";
    const [{ affectedRows, changedRows }] = await db.query(updataSql, [
      data,
      req.body.sid,
    ]);
    // {"fieldCount":0,"affectedRows":1,"insertId":0,"info":"Rows matched: 1  Changed: 0  Warnings: 0","serverStatus":2,"warningStatus":0,"changedRows":0}
    console.log({
      success: !!changedRows,
      affectedRows,
      changedRows,
    });
    res.json(!!changedRows);
  } else {
    res.json(false);
  }
});

//--------------------------------------------------------------------------------------------------------------------------------
//偏好設定修改

router.post("/setting", async (req, res) => {
  console.log("偏好設定--------------------------");
  console.log("req.body=", req.body);

  // const sql =
  //   "SELECT `sid`, `authAccount`,`authPassword`, `name`, `email`, `phone`, `birth`, `country`, `township`, `address`, `favorite` FROM `member` WHERE sid=?";

  // const [rs] = await db.query(sql, [req.body.sid]);
  // console.log("rs=", rs[0]);

  // if (rs[0].authPassword === req.body.pass) {
  // const data = {
  //   authPassword: req.body.newPassword,
  // };

  const updataSql = "UPDATE `member` SET ? WHERE `sid`=?";
  const [{ affectedRows, changedRows }] = await db.query(updataSql, [
    req.body,
    req.body.sid,
  ]);
  // {"fieldCount":0,"affectedRows":1,"insertId":0,"info":"Rows matched: 1  Changed: 0  Warnings: 0","serverStatus":2,"warningStatus":0,"changedRows":0}
  console.log({
    success: !!changedRows,
    affectedRows,
    changedRows,
  });
  if (!!changedRows) {
    res.json(!!changedRows);
  } else {
    res.json(false);
  }
});

//--------------------------------------------------------------------------------------------------------------------------------
router.post("/test123", (req, res) => {
  console.log("test-----------------------");
  console.log("req.body = ", req.body);
  console.log(req.header);
  res.json("ok");
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
  delete req.session.my;
  delete req.session.my123;
  delete req.session.my456;
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
