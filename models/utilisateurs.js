let database = require('../configs/database');
class Utilisateurs {

  constructor(body) {
    this.email = body.email;
    this.password = body.password;
  }

  get email() {
    return this._email;
  }

  get password() {
    return this._password;
  }

  get mdpHash() {
    return this._mdpHash;
  }

  set email(argEmail) {
    this._email = argEmail;
  }

  set password(argPassword) {
    this._password = argPassword;
  }

  matching(cb) {
    database.query('SELECT id,password FROM utilisateurs WHERE email=?', [this.email], (err, result) => {
      if (err) throw err;
      cb(result);
    });
  }

  insert(mdphash, cb) {
    database.query('INSERT INTO utilisateurs SET email=?,password=?', [this.email, mdphash], (err, result) => {
      if (err) throw err;
      cb(result);
    });
  }
  isValid(passConfirm) {
    if (passConfirm === this.password) {
      return true;
    } else {
      return false;
    }
  }
}
module.exports = Utilisateurs;
