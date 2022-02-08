const sqlite3 = require('sqlite3').verbose();
const DBSOURCE = 'db.sqlite';

const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    // Can't open Database
    console.error(err.message);
    throw err;
  } else {
    console.log('Connection to SQLite Database has been established!');
    db.run(`CREATE TABLE user (
      googleId PRIMARY KEY NOT NULL,
      name text NOT NULL,
      email text UNIQUE NOT NULL,
      password text NOT NULL,
      CONSTRAINT email_unique UNIQUE (email)
      );`,
    (err) => {
      if (err) {
        // Table already made
      } else {
        // Table created
      }
    });
    db.run(`CREATE TABLE profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ownerId references user(id),
      name text NOT NULL,
      dob text NOT NULL, /* Format YYYY-MM-DD */
      sex character(1) NOT NULL,
      bio text DEFAULT "",
      picture0 text DEFAULT "",
      picture1 text DEFAULT "",
      picture2 text DEFAULT "",
      picture3 text DEFAULT "",
      picture4 text DEFAULT "",
      picture5 text DEFAULT "",
      picture6 text DEFAULT "",
      picture7 text DEFAULT "",
      picture8 text DEFAULT "",
      picture9 text DEFAULT ""
    );`,
    (err) => {
      if (err) {
        // Table already made
      } else {
        // Table created
      }
    });
    db.run(`CREATE TABLE matches (
      sentBy TEXT NOT NULL references user(googleId),
      sentTo TEXT NOT NULL references user(googleId),
      accepted BOOLEAN NOT NULL DEFAULT false,
      PRIMARY KEY (sentBy, sentTo)
      );`,
    (err) => {
      if (err) {
        // Table already made
      } else {
        // Table created
      }
    });
  }
});

module.exports = db;
