var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var passport  = require('passport');
var nodemailer = require("nodemailer");
var config      = require('./config/database'); // get db config file
var User        = require('./app/models/userdone'); // get the mongoose model
var jwt         = require('jwt-simple');
var apiRoutes = express.Router();
var multer  =   require('multer');  
var path = require('path');
var port        = 9000;
var fs = require('fs');
var session = require("express-session");
app.use(session({secret: 'kaalakoduma'}));
var sess;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/', apiRoutes);
 
// log to console
app.use(morgan('dev'));
app.use(express.static("public"));
app.use('/css', express.static('public'))
app.use('/css/fonts', express.static('public'))
// Use the passport package in our application
app.use(passport.initialize());

mongoose.connect(config.database);
 
function gen_random() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  for (var i = 0; i < 8; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}


app.set('view engine', 'ejs');
 
app.get('/', function(req, res) {
  sess=req.session;
  if(sess.rollno)
    res.redirect('/home');
  else
    res.render('index');
});

app.get('/home', function(req, res) {
  sess = req.session;
  console.log(sess.rollno);
  if(sess.rollno)
      res.render('home');
  else
      res.render('index');
});

app.get('/changepassword', function(req, res) {
  sess = req.session;
  console.log(sess.rollno);
  if(sess.rollno)
      res.render('changepwd');
  else
      res.redirect('/');
});

app.post('/fetchall', function(req, res) {
        User.find({}).exec(function(err, docs) { 
          res.json(docs);
        });
    });

app.post('/update_password', function(req, res) {
        sess=req.session;
         User.findById(sess.rollno, (err, doc) => {  
         if (err) {
            console.log(err);
         } else {
            doc.password=req.body.password;
            doc.save((err, doc) => {
            if (err) {
                console.log(err);
            }
            });
        }
        });
       res.render('home');
    });


app.post('/user_general', function(req, res) {
        console.log(req.body.id);
        fs.appendFile("./confessions/"+req.body.id, req.body.confession+"~", function(err) {if(err) { return console.log(err); }});
        fs.appendFile("./dares/"+req.body.id, req.body.dare+"~", function(err) {if(err) { return console.log(err); }});
        fs.appendFile("./nickname/"+req.body.id, req.body.nickname+"~", function(err) {if(err) { return console.log(err); }});
        fs.appendFile("./nomination/"+req.body.id, req.body.nomination+"~", function(err) {if(err) { return console.log(err); }});
        res.end("updated")
    });

app.post('/user_memories', function(req, res) {
        sess = req.session;
        dir="./memories/"+req.body.id;
        if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
        }
        dir="./memories/"+req.body.id+"/"+sess.rollno;
        if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
        }
        console.log(req.body.id);
        fs.appendFile(dir+"/"+gen_random(), req.body.memories+"~", function(err) {if(err) { return console.log(err); }});
        res.end("updated")
    });


app.get('/profile/:id', function(req, res) {
        User.findOne({ '_id': req.params.id }).exec(function(err, docs)  { 
          res.render('singleusers',{ user : docs });
        });
    });


app.post('/login', function(req, res) {
        sess=req.session;
        console.log("Here");
        User.findOne({ '_id': req.body.rollno }).exec(function(err, docs) { 
          if(docs.password==req.body.password)
          {
              console.log("True");
              sess.rollno=req.body.rollno;
              if(docs.firsttime=="0")
                res.render('signup.ejs')
              else  
                res.redirect('/home');
          }
          else
            res.render('index');
            console.log("Incorrect Password")
        });
    });

app.post('/upload_leaks/:id', function(req, res) {
        var d = new Date();
        console.log(d.getMonth());
        dir="./leaks/"+req.params.id;
        if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
        }
        var storage =   multer.diskStorage({
          destination: function (req, file, callback) {
            callback(null, dir);
          },
          filename: function (req, file, callback) {
            callback(null,gen_random()+'.jpg');
          }
        });
        var upload = multer({ storage : storage}).single('sfile');
        upload(req,res,function(err) {  
        if(err) {  
            return res.end("Error uploading file.");  
        }  
       res.redirect('/profile/'+req.params.id);
    });  
    });

app.post('/upload_memory_pic/:id', function(req, res) {
        sess=req.session;
        console.log(req.params.id);
        dir="./memory_pics/"+req.params.id;
        if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
        }
        dir="./memory_pics/"+req.params.id+"/"+sess.rollno;
        if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
        }
        var storage =   multer.diskStorage({
          destination: function (req, file, callback) {
            callback(null, dir);
          },
          filename: function (req, file, callback) {
            callback(null,gen_random()+'.jpg');
          }
        });
        var upload = multer({ storage : storage}).single('sfile');
        upload(req,res,function(err) {  
        if(err) {  
            return res.end("Error uploading file.");  
        }  
       res.redirect('/profile/'+req.params.id);
    });  
    });

app.post('/upload_memories/:id', function(req, res) {
        var d = new Date();
        console.log(d.getMonth());
        dir="./leaks/"+req.params.id;
        if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
        }
        var storage =   multer.diskStorage({
          destination: function (req, file, callback) {
            callback(null, dir);
          },
          filename: function (req, file, callback) {
            callback(null,gen_random()+'.jpg');
          }
        });
        var upload = multer({ storage : storage}).single('sfile');
        upload(req,res,function(err) {  
        if(err) {  
            return res.end("Error uploading file.");  
        }  
       res.redirect('/profile/'+req.params.id);
    });  
    });



app.get('/profile', function(req, res) {
  if(req.session.email)
      res.redirect('/home');
  else
      res.render('home');
});

app.get('/logout', function(req, res) {
  req.session.destroy(function(err){  
        if(err){  
            console.log(err);  
        }  
        else  
        {  
            res.redirect('/');  
        }  
    });  
});




getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};



app.get('*', function(req, res){
  if(req.session.email) 
     {     res.redirect('/home');
     }
  else
      {   res.redirect('/');
      }
});


app.listen(port);
console.log('Infinity war has started: http://localhost:' + port);
