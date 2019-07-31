

const express =require('express');
const path=require('path');
const bodyparser=require('body-parser');
//const expressValidator=require('express-validator');

const flash=require('connect-flash');
const session=require('express-session');
//mongoose
const mongoose=require('mongoose');

//connect mongodb
mongoose.connect('mongodb://localhost/nodekb',{ useNewUrlParser: true });
let db=mongoose.connection;

//check the database connection error for safeside
db.once('open',function(){
    console.log('connection successful');
})
db.on('error',function(err)
{
    console.log(err);
})


//init app
var app=express();
const port = 3000;

app.use(bodyparser.urlencoded(
    {
        extended:true
    }
))
const exphb=require('express-handlebars');
//load view engine
app.set('views',path.join(__dirname,'views'));
app.engine('hbs',exphb({
    extname:'hbs',
    defaultLayout:'layout',
    layoutsDir: __dirname + '/views/'
    }));
app.set('view engine','hbs');

//bring model here
const Article=require('./models/article');
//set public folder
app.use(express.static(path.join(__dirname,'public')))


//express session middleware

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));



//express validator
const { check, validationResult } = require('express-validator');

//express messages middleware
app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//home route
app.get('/',function(req,res)
{
   // res.redirect('index');
    //console.log(__dirname);
    
    Article.find({},function(err,doc){
        if(err)
        {
            console.log(err);
        }
        else{
        res.render('index',{
            title:'Articles',
            Article: doc
        });
    }
    });

});

//add route
app.get('/articles/add',function(req,res)
{
    res.render('add_articles',{
        title:'Add Article'
    });
})

app.get('/articles/edit/:id',function(req,res)
{
   Article.findById(req.params.id,function(err,doc)
   {
       if(err)
       {
           console.log(err);
       }
       else{
        res.render('edit_articles',{
        title:'Update Article',
        Articles:doc
    });
}
   });
    
})
//update post
app.post('/articles/edit/:id',function(req,res)
{
  
    let _Article={};
    _Article._id=req.body._id;
    _Article.title=req.body.title;
    _Article.author=req.body.author;
   _Article.body=req.body.body;

    const query={_id:req.params.id};
  
    Article.updateOne(query,_Article,function(err)
    {
        if(err)
        {
            console.log(err);
            return;
        }
        else
        {
            res.redirect('/');
        }
    });
   });
    
//delete post
app.get('/articles/delete/:id',function(req,res)
{
  
    const query={_id:req.params.id};
    Article.findByIdAndRemove(query,function(err)
    {
        if(err)
        {
            console.log(err);
            return;
        }
        else
        {
            res.redirect('/');
        }
    });
   });
    


//Add Post to database
app.post('/articles/add',[
    check('title').isLength({min:3}).withMessage('atleast more then 3')
],
function(req,res)
{
    const errors = validationResult(req);
   if (!errors.isEmpty()) {
   return res.status(422).json({ errors: errors.array() });
   }
   let _Article=new Article();
   _Article.title=req.body.title;
   _Article.author=req.body.author;
  _Article.body=req.body.body;
   
   _Article.save(function(err)
   {
       if(err)
       {
           console.log(err);
           return;
       }
       else
       {
        req.flash({
            type: 'success',
            message: 'Post has been created',
            redirect: false
          })
           res.redirect('/');
       }
   });
});

//handle error
function handleValidationError(err,body)
{
      for(field in err.errors)
      {
        switch(err.errors[field].path)
        {
          case 'title':
            body['titleError']=err.errors[field].message;
            break;
          case 'author':
            body['authorError']=err.errors[field].message;
            break;
            case 'body':
                body['bodyerror']=err.errors[field].message;
          default:
            break;
        }
      }
}


//start server
app.listen(port, function()
{ console.log(`Example app listening on port ${port}!`);
});