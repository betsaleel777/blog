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

  static formating(body) {
    let {contenu,titre,sous_titre,user} = body;
    return [titre, sous_titre, contenu, user, new Date()];
  }

  static all(cb) {
    const SQL = 'SELECT sujets.id,utilisateurs.nom AS user,created_at,titre,sous_titre,contenu FROM sujets INNER JOIN utilisateurs ON utilisateurs.id=sujets.user' ;
    database.query(SQL, (err, result) => {
      if (err) throw err;
      cb(result.map((row) => new Sujets(row)));
    });
  }

  insert(body,cb) {
    const SQL = 'INSERT INTO sujets SET titre=?,sous_titre=?,contenu=?,user=?,created_at=?' ;
    database.query(SQL, this.formating(body), (err, result) => {
      if (err) throw err;
      cb(result);
    });
  }

  static find(id,cb){
    const SQL = 'SELECT * FROM sujets WHERE user=?' ;
    database.query(SQL,[id],(err,rows) =>{
      if (err) throw err ;
      cb(rows.map((row) => new Sujets(row))) ;
    }) ;
  }

}

module.exports = Sujets;
