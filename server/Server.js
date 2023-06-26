const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
var mysql = require('mysql');
const { response } = require("express");
const shut =require('shutdown-computer');
const multer =require('multer');

 
const app = express();
// const jwt =require('jsonwebtoken'); 
const jwt =require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const http = require('http').createServer();
var path = require('path');
// const PaytmChecksum =require('paytmchecksum');
const Config=require('./config')
const https =require('https');
// require('./routes')(app);

app.use(cors({
  origin:true,
  methods:["GET","POST"],
  credentials:true
}));
app.use(express.static('server'));
app.use("/image",express.static('image'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use('/api10',paymentRoute);

 
 

// parse application/json

  
//create database connection
const conn = mysql.createConnection({
  host: "sql7.freemysqlhosting.net",
  user: "sql7628860",
  password: "JLuzN3M42Z",
  database: "sql7628860"
});
 
//connect to database 
conn.connect((err) =>{
  if(err) throw err;
  console.log('Mysql Connected...');
});

















var storage = multer.diskStorage({
  destination: (req, file, callBack) => {
      callBack(null, './image')     // './public/images/' directory name where save the file
  },
  filename: (req, file, callBack) => {
      callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})

var upload = multer({
  storage: storage
});
app.post("/upload", upload.single('file'), (req, res) => {
  if (!req.file) {
      console.log("No file upload");
  } else {
      console.log(req.file.filename);
      const  imgsrc =  req.file.filename;
      const insertData = "INSERT INTO users_files(file_src)VALUES(?)";
      conn.query(insertData,[imgsrc], (err, result) => {          if (err) throw err
          console.log("file uploaded");
      })
  }
});
// var sql = "INSERT INTO tupen (id, name) VALUES ('', 'tupen shil')";  
// conn.query(sql, function (err, result) {  
// if (err) throw err;  
// console.log("1 record inserted");  });

//registation

// app.post('/register'),(req,res)=>{
//   conn.query('SELECT * FROM users WHERE LOWER(username) =LOWER(${conn.escape(req.body.email)} ');
// }



app.post('/register', (req, res) => {
  conn.query(
  `SELECT * FROM users1 WHERE LOWER(username) = LOWER(${conn.escape(
  req.body.username
  )});`,
  (err, result) => {  
  if (result.length) {
  return res.status(409).send({
  msg: 'This user is already in use!'
  });
  } else {
  // username is available
  bcrypt.hash(req.body.password, 10, (err, hash) => {
  if (err) {
  return res.status(500).send({
  msg: err
  });
  } else {
  // has hashed pw => add to database
  conn.query(
  `INSERT INTO users1(username, password) VALUES ('${req.body.username}', ${conn.escape(hash)})`,
  (err, result) => {
  if (err) {
  throw err;
  return res.status(400).send({
  msg: err
  });
  }
  return res.status(201).send({
  msg: 'The user has been registerd with us!'
  });
  }
  );
  }
  });
  }
  }
  );
  });
  app.post('/shutdown',(req,res)=>{
    conn.query(
      `SELECT * FROM users WHERE username = ${conn.escape(req.body.username)};`,
      (err, result)=>{
        if(err){
          throw err;
          return res.status(400).send({msg:err});
        }
        if(result.length){

              shut.shutDownComputer();

        }
        else{
          res.send({msg: "computer is on " })
        }
      }
    )
  })











//sigh in 
app.post('/login',  (req, res) => {
conn.query(
`SELECT * FROM users1 WHERE username = ${conn.escape(req.body.username)};`,
(err, result) => {
// user does not exists
if (err) {
throw err;
return res.status(400).send({
msg: err
});
}
if (!result.length) {
return res.status(401).send({
msg: 'Email or password is incorrect!'
});
}
// check password
bcrypt.compare(
req.body.password,
result[0]['password'],
(bErr, bResult) => {
// wrong password
if (bErr) {
throw bErr;
return res.status(401).send({
msg: 'Email or password is incorrect!'
});
}
if (bResult) {
const token = jwt.sign({id:result[0].id},'the-super-strong-secrect',{ expiresIn: '1h' });
conn.query(
`UPDATE users1 SET last_login = now() WHERE id = '${result[0].id}'`
);
return res.status(200).send({
msg: 'Logged in!',
token,
user: result[0],
});
}
return res.status(401).send('<p>username and password incorrect</p>'

);
}
);
}
);
});






//fech ddata 
app.post('/getdata',(req,res)=>{
  
conn.query(`SELECT * FROM orders WHERE userid = ${conn.escape(req.body.userid)};`, function(err, result){
  if(err) throw err;
 console.log(result);
 res.send(result);
// res.get(JSON.stringify({"status":200, "error": null, "response":result}));
}); 
});
//fetxh orders datails api 
app.post('/order_datails',(req,res)=>{
  
  conn.query(`SELECT * FROM users_orders WHERE userid = ${conn.escape(req.body.userid)};`, function(err, result){
    if(err) throw err;
   console.log(result);
   res.send(result);
  // res.get(JSON.stringify({"status":200, "error": null, "response":result}));
  }); 
  });





app.get('/photo',(req,res)=>{
conn.query(
  "SELECT * FROM users_files ",function(err,result){
    if(err) throw err;
    console.log(result);
    res.send(result);

  }
)
});



 
//add new user
app.post('/orders',(req, res) => {
  let data = {userid:req.body.userid,village:req.body.village,pincode:req.body.pincode};
 let sql = "INSERT INTO orders SET ?";
//    let sql = "INSERT INTO employees (id, name, age, city) VALUES ('', 'Ajeet Kumar')";  
   conn.query(sql, data,(err, results) => {
    if(err) throw err;
    res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
  });
});


app.post('/order123',(req, res) => {
  let data = {
    userid:req.body.userid,
    product_id:req.body.product_id,
    price:req.body.price,
    deliver_mode:req.body.deliver_mode,
    delivery_status:req.body.delivery_status,
    delivery_date:req.body.delivery_date 
  };
 let sql = "INSERT INTO users_orders SET ?";
//    let sql = "INSERT INTO employees (id, name, age, city) VALUES ('', 'Ajeet Kumar')";  
   conn.query(sql, data,(err, results) => {
    if(err) throw err;
    res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
  });
});

 






 
app.listen(3000, () => {
  
  console.log("Server running successfully on 3000");
});
