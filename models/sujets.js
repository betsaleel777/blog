let database = require('../configs/database');
let moment = require('moment');

class Sujets {

  constructor(row) {
    this.row = row;
  }

  get id() {
    return this.row.id;
  }
  get titre() {
    return this.row.titre;
  }
  get contenu() {
    return this.row.contenu;
  }
  get created_at() {
    return moment(this.row.created_at);
  }
  get user() {
    return this.row.user;
  }
  get sous_titre() {
    return this.row.sous_titre;
  }

  // static all(cb) {
  //   const SQL = 'SELECT sujets.id,utilisateurs.nom AS user,created_at,titre,sous_titre,contenu FROM sujets INNER JOIN utilisateurs ON utilisateurs.id=sujets.user' ;
  //   database.query(SQL, (err, result) => {
  //     if (err) throw err;
  //     cb(result.map((row) => new Sujets(row)));
  //   });
  // }

  static insert(body,cb) {
    const SQL = 'INSERT INTO sujets SET titre=?,sous_titre=?,contenu=?,user=?,created_at=?' ;
    let {titre,sous_titre,contenu,user} = body;
    database.query(SQL, [titre, sous_titre, contenu, user, new Date()], (err, result) => {
      if (err) throw err;
      cb(result);
    });
  }

  static findWithUser(user,cb){
    const SQL = 'SELECT * FROM sujets WHERE user=?' ;
    database.query(SQL,[user],(err,rows) =>{
      if (err) throw err ;
      cb(rows.map((row) => new Sujets(row))) ;
    }) ;
  }

  static find(sujet){
    let sql = 'SELECT * FROM sujets WHERE id=?' ;
    return new Promise((resolve,reject) => {
      //recuperation du sujet concerné
      let sujets = function(sujet) {
        return new Promise((resolve,reject) =>{
          database.query(sql,[sujet],(err,row) =>{
              if (err) reject(err) ;
              resolve(new Sujets(row[0])) ;
          }) ;
        });
      } ;
      //recuperation des commentaires concernant ce sujet
      let commentaires = function(sujet){
        return new Promise((resolve,reject) =>{
          sql= 'SELECT * FROM messages WHERE sujet=?' ;
          database.query(sql,[sujet],(err,rows) =>{
            let Message = require('./message') ;
              if (err) reject(err) ;
              resolve(rows.map((row) => new Message(row))) ;
            }) ;
        });
      } ;
    //parallelisation des deux requettes
    Promise.all([sujets(sujet),commentaires(sujet)]).then(([sujet,commentaires])=>{
      resolve({sujet:sujet,commentaires:commentaires}) ;
    }).catch((error) =>{
      reject(error) ;
     }) ;
    }) ;
  }
}

module.exports = Sujets;
