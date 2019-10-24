let database = require('../configs/database');
let moment = require('moment');
class Message {

  constructor(row) {
    this.row = row;
  }

  get contenu() {
    return this.row.contenu;
  }

  get created_at() {
    return moment(this.row.created_at);
  }

  get sujet(){
    return this.row.sujet ;
  }

  static insert(body, cb) {
    let {contenu,sujet} = body ;
    database.query('INSERT INTO messages SET contenu=?,sujet=?,created_at=?', [contenu,sujet, new Date()], (err, result) => {
      if (err) throw err;
      cb(result);
    });
  }

  static all(cb) {
    database.query('SELECT * FROM messages', (err, result) => {
      if (err) throw err;
      cb(result.map((row) => new Message(row)));
    });
  }
}
module.exports = Message;
