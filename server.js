let express = require('express');
let bodyParser = require('body-parser');
let app = express();
let session = require('express-session');
let bcrypt = require('bcryptjs');

//moteur de template
app.set('view engine', 'ejs');

// middleware
app.use('/assets', express.static('public'));
app.use('/custom', express.static('public'));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(session({
  secret: 'shinppiteki',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false
  }
}));
app.use((request,response,next) =>{
  if(request.session.userId){
    response.locals.userId = request.session.userId ;
  }
  next();
}) ;
app.use(require('./middlewares/flash'));
// routes
app.get('/', (request, response) => {
  response.render('pages/index');
});

app.get('/acceuil',(request,response) =>{
  response.render('pages/index') ;
}) ;

app.get('/login', (request, response) => {
  response.render('pages/login');
});

app.get('/sign', (request, response) => {
  response.render('pages/signup');
});

app.get('/sujets', (request, response) => {
  let Sujets = require('./models/sujets');
  if(request.query.id){
    Sujets.find(request.query.id).then((object) => {
      response.render('pages/sujet', {
        commentList:object
      });
    }).catch((error) =>{
      console.log('execution de find s\'est mal déroulé:\n'+error) ;
    });
  }

//   Sujets.all((rows) => {
//     response.render('pages/sujets', {
//       messages: rows
//     });
//   });
});

app.get('/profile',(request,response) =>{
  let Sujets = require('./models/sujets') ;
  if(request.query.id){
    Sujets.findWithUser(request.query.id, (rows) =>{
      response.render('pages/profile',{sujets:rows}) ;
    });
  }else if (request.session.userId) {
    Sujets.findWithUser(request.session.userId, (rows) =>{
      response.render('pages/profile',{sujets:rows}) ;
    });
  }
  console.log(request.session) ;
});

// app.get('/commentaires', (request, response) => {
//   let Message = require('./models/message');
//   Message.all((rows) => {
//     response.render('pages/commenter',{
//       messages: rows
//     });
//   });
// });

app.get('/deconnexion',(request,response)=>{
  request.session.destroy((err)=>{
    if (err) throw err ;
    response.redirect('/') ;
  }) ;
});

app.get('/addsujets',(request,response) =>{
  if(request.session.userId){
    response.render('pages/addsujet',{user:request.session.userId}) ;
  }else {
    request.flash('error',`Opération impossible sans être logger sur un compte
    créer votre compte "signup" ou connecter vous via le formulaire
    ci-dessous`);
    response.redirect('/login') ;
  }
}) ;

app.post('/addsujets',(request,response) =>{
  let Sujet = require('./models/sujets') ;
  let {titre,sous_titre,contenu} = request.body ;

  if(titre != undefined && sous_titre != undefined && contenu != undefined){
    Sujet.insert(request.body,(result) =>{
       request.flash('success','le sujet a bien été enregistré') ;
       response.redirect('/sujets?id='+result.insertId) ;
    }) ;
  }else{
    request.flash('error','formulaire mal remplis') ;
    response.redirect('/addsujets') ;
  }
}) ;

app.post('/commentaires', (request, response) => {
  if (request.body.message === '' || request.body.message === '') {
    request.flash('error', 'message vide !!');
    response.redirect('/commentaires');
  } else {
    let Message = require('./models/message');
    Message.insert(request.body.message, function() {
      request.flash('success', 'message enregistrer avec success');
      response.redirect('/commentaires');
    });
  }
});

app.post('/sign', (request, response) => {
  if (request.body.email === '' || request.body.password === '') {
    request.flash('error', 'formulaire mal remplis');
    response.redirect('/sign');
  } else {
    let Utilisateurs = require('./models/utilisateurs');
    const user = new Utilisateurs(request.body);
    if (user.isValid(request.body.passwordConfirmed)) {
      bcrypt.hash(request.body.password, 10, function(err, hash) {
        if (err) throw err;
        user.insert(hash,(resultat) => {
          request.flash('success', 'le compte a été crée avec succès !!');
          response.redirect('/profile?id='+resultat.insertId);
        });
      });
    } else {
      request.flash('error', 'le mot de passe ne correspond pas !!');
      response.redirect('/sign') ;
    }
  }
});

app.post('/login', (request, response) => {
  if (request.body.email === '' || request.body.password === '') {
    request.flash('error', 'formulaire mal remplis') ;
    response.redirect('/login');
  } else {
    let Utilisateurs = require('./models/utilisateurs');
    let user = new Utilisateurs(request.body);
    user.matching((row) => {
      if (row[0] !== undefined) {
        bcrypt.compare(request.body.password, row[0].password,(err, res)=> {
          if (res) {
            request.session.userId = row[0].id ;
            request.flash('success','Bienvenue dans votre espace personel') ;
            response.redirect('/profile?id='+row[0].id) ;
          } else {
            request.flash('error','le mot passe est incorrecte') ;
            response.redirect('/login') ;
          }
        });
      }else{
        request.flash('error','l\'email soumis ne correspond à aucun de nos utilisateur') ;
        response.redirect('/login') ;
      }
    });
  }
});

app.listen(8080);
