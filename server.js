// Required modules
const express = require('express');
const db = require('./database.js');
const md5 = require('md5');
const bodyParser = require('body-parser');
const multer = require('multer');
const config = require('./config');
const googleAuth = require('simple-google-openid');
const auth = googleAuth(config.CLIENT_ID);
const fs = require('fs');
const { promisify } = require('util');
const renameAsync = promisify(fs.rename);
const stayAwake = require('stay-awake');

// Create Express App
const app = express();

stayAwake.prevent(function(err, data) {
  console.log('%d routines are preventing sleep', data);
});

const uploader = multer({
  dest: config.imageStore,
  limits: {
    fields: 10,
    fileSize: 1024 * 1024 * 20,
    files: 1
  },
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(auth);

// Serve static files, set index page to custom name because I felt like it and it looks tidier
app.use('/', express.static(config.www, { index: 'HTML/signUpPage.html', extensions: ['HTML'] }));

app.post('/api/picture/', uploader.single('picture'), uploadPicture);
app.delete('/api/picture/:filename', deletePicture);
async function uploadPicture(req, res) {
  console.log(req);
  const fileExt = req.file.mimetype.split('/')[1] || 'png';
  const newFilename = req.file.filename + '.' + fileExt;
  await renameAsync(req.file.path, config.imageStore + newFilename);
  res.json({ message: 'success', filename: newFilename });
}

function deletePicture(req, res) {
  const path = config.imageStore + req.params.filename;
  fs.unlink(path, (err) => {
    if (err) {
      res.status(400).json({ error: err });
      return;
    }
    res.status(200).json({ message: 'success' });
  })
}

// Start App
app.listen(config.PREFERRED_PORT, () => {
  console.log(`Server running on port ${config.PREFERRED_PORT}.`)
});

// Get all users
app.get('/api/users', (req, res) => {
  const sql = 'select * from user';
  db.all(sql, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: rows
    })
  });
});

// Get all profiles
app.get('/api/profiles/:id/:sex', (req, res) => {
  const sql = `select ownerId from profiles where ownerId != "${req.params.id}" AND sex != "${req.params.sex}";`;
  db.all(sql, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: rows,
    })
  });
});

app.get('/api/profile/:id', (req, res) => {
  const sql = `select * from profiles where ownerId = "${req.params.id}";`;
  db.get(sql, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: row,
    })
  });
});

// Get all matches
app.get('/api/matches', (req, res) => {
  const sql = 'select * from matches';
  db.all(sql, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: rows,
    })
  });
});

// Get Match record by sentTo and sentBy fields
app.get('/api/matchRequest/:toId/:fromId', (req, res) => {
  const sql = 'select * from matches where sentBy = ? AND sentTo = ?;';
  const params = [req.params.fromId, req.params.toId];
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: row
    })
  });
});

// Update a match to accepted
app.patch('/api/match/:toId', (req, res) => {
  const sql = `UPDATE matches set
  accepted = true
  where sentBy = ?
  and sentTo = ?;`;
  const params = [req.body.fromId, req.params.toId];
  db.run(sql, params, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success'
    })
  });
});

app.get('/api/acceptedMatches/:fromId', (req, res) => {
  // Get all match records relating to user that have been accepted
  const sql = 'select * from matches where (sentBy = ? or sentTo = ?) and accepted = true;'
  const params = [req.params.fromId, req.params.fromId];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: rows
    })
  })
})

app.get('/api/unacceptedMatches/:fromId', (req, res) => {
  // Get all match records relating to user that have been accepted
  const sql = 'select * from matches where sentBy = ? and accepted = false;'
  const params = [req.params.fromId];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: rows
    })
  })
})

// Get user via Google ID
app.get('/api/user/:googleId', (req, res) => {
  const sql = `select * from user where googleId like "${req.params.googleId}";`;
  db.get(sql, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: row,
    })
  });
});

// Create a user
app.post('/api/user/', (req, res) => {
  const errors = [];
  if (!req.body.password) {
    errors.push('No Password Specified');
  }
  if (!req.body.email) {
    errors.push('No Email Specified');
  }
  if (errors.length) {
    res.status(400).json({ error: errors.join(', ') });
  }
  const data = {
    id: req.body.googleId,
    name: req.body.name,
    email: req.body.email,
    password: md5(req.body.password)
  }
  const sql = 'INSERT INTO user (googleId, name, email, password) VALUES (?, ?, ?, ?)';
  const params = [data.id, data.name, data.email, data.password];
  db.run(sql, params, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: data,
      id: this.lastID,
    });
  });
});

// Create a profile
app.post('/api/profile/', (req, res) => {
  const errors = [];
  if (!req.body.ownerId) {
    errors.push('No Owner ID Specified');
  }
  if (!req.body.name) {
    errors.push('No Name Specified');
  }
  if (!req.body.dob) {
    errors.push('No Date of Birth Specified');
  }
  if (!req.body.sex) {
    errors.push('No Sex Specified');
  }
  if (errors.length) {
    res.status(400).json({ error: errors.join(', ') });
    return
  }
  const data = req.body;
  const sql = 'INSERT INTO profiles (ownerId, name, dob, sex, bio, picture0, picture1, picture2, picture3, picture4, picture5, picture6, picture7, picture8, picture9) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const params = [data.ownerId, data.name, data.dob, data.sex, data.bio, data.picture0, data.picture1, data.picture2, data.picture3, data.picture4, data.picture5, data.picture6, data.picture7, data.picture8, data.picture9];
  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: data,
      id: this.lastID,
    });
  });
});

// Create a match
app.post('/api/sendMatch/:sendId/:toId', (req, res) => {
  const data = {
    sentBy: req.params.sendId,
    sentTo: req.params.toId
  };
  const params = [data.sentBy, data.sentTo];
  const sql = 'INSERT INTO matches (sentBy, sentTo) values (?, ?);';
  db.run(sql, params, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: data,
      id: this.lastID,
    });
  });
});

// Update a user
app.patch('/api/user/:GoogleId', (req, res) => {
  const data = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password ? md5(req.body.password) : null
  };
  const sql = `UPDATE user Set
  name = COALESCE(?, name),
  email = COALESCE(?, email),
  password = COALESCE(?, password)
  WHERE googleId = ${req.params.GoogleId}`;
  const params = [data.name, data.email, data.password];
  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: res.message });
      return;
    }
    res.json({
      message: 'success',
      data: data,
      changes: this.changes,
    })
  });
});

// Update a profile
app.patch('/api/profile/:id', (req, res) => {
  const data = {
    bio: req.body.bio,
    picture0: req.body.picture0,
    picture1: req.body.picture1,
    picture2: req.body.picture2,
    picture3: req.body.picture3,
    picture4: req.body.picture4,
    picture5: req.body.picture5,
    picture6: req.body.picture6,
    picture7: req.body.picture7,
    picture8: req.body.picture8,
    picture9: req.body.picture9
  };
  const sql = `UPDATE profiles Set
  bio = ?,
  picture0 = ?,
  picture1 = ?,
  picture2 = ?,
  picture3 = ?,
  picture4 = ?,
  picture5 = ?,
  picture6 = ?,
  picture7 = ?,
  picture8 = ?,
  picture9 = ?
  WHERE ownerId = "${req.params.id}"`;

  const params = [data.bio, data.picture0, data.picture1, data.picture2, data.picture3, data.picture4, data.picture5, data.picture6, data.picture7, data.picture8, data.picture9];
  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: data,
      changes: this.changes,
    });
  });
});

// Delete user
app.delete('/api/user/:id', (req, res) => {
  // First delete all profiles that the user owns
  db.run(
    'DELETE FROM profiles WHERE ownerId = ?',
    req.params.id,
    function (err) {
      if (err) {
        res.status(400).json({ error: res.message });
      }
    });

  // Then delete the user
  db.run(
    'DELETE FROM user WHERE googleId = ?',
    req.params.id,
    function (err) {
      if (err) {
        res.status(400).json({ error: res.message });
        return;
      }
      res.json({
        message: 'deleted ',
        changes: this.changes,
      });
    });
});

// Delete profile
app.delete('/api/profile/:id', (req, res) => {
  db.run(`DELETE FROM profiles WHERE ownerId = ${req.params.id}`,
    (err) => {
      if (err) {
        res.status(400).json({ error: res.message });
        return;
      }
      res.json({
        message: 'deleted',
        changes: this.changes,
      });
    });
});

app.delete('/api/match/:senderId/:recieverId', (req, res) => {
  const sql = 'DELETE FROM matches WHERE sentBy = ? and sentTo = ?;';
  const params = [req.params.senderId, req.params.recieverId];
  db.run(sql, params, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'deleted',
      changes: this.changes
    });
  });
});

// Default Response
app.use((req, res) => {
  res.status(404);
});
