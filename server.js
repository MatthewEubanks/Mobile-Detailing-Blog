const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');
const cors = require('cors');
const public = path.join(__dirname, 'public');
const photos = path.join(__dirname, 'photos');

const { DATABASE_URL, PORT } = require('./config');
const { BlogPost } = require('./models');
const { router: usersRouter } = require('./users');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');
mongoose.connect(
  'mongodb://localhost:27017/blog-app',
  {
    useNewUrlParser: true,
  }
);

mongoose.Promise = global.Promise;
passport.use(localStrategy);
passport.use(jwtStrategy);

app.use(morgan('common'));
app.use(express.json());
app.use('/', express.static(public));
app.use('/', express.static(photos));
app.use('/users/', usersRouter);
app.use('/auth/', authRouter);
app.use(cors());

//ROUTES
app.get('/', function(req, res) {
  res.sendFile(path.join(public, 'home.html'));
});

app.get('/posts', (req, res) => {
  BlogPost.find()
    .then(posts => {
      res.json(posts.map(post => post.serialize()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});

app.get('/posts/:id', (req, res) => {
  BlogPost.findById(req.params.id)
    .then(post => res.json(post.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went horribly awry' });
    });
});

app.post('/posts', (req, res) => {
  const requiredFields = ['title', 'picture', 'content'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  console.log(req.body);
  BlogPost.create({
    title: req.body.title,
    picture: req.body.picture,
    content: req.body.content,
    username: req.body.username,
  })
    .then(blogPost => res.status(201).json(blogPost.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong' });
    });
});

app.delete('/posts/:id', (req, res) => {
  BlogPost.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).json({ message: 'success' });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});

app.put('/posts/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match',
    });
  }

  const updated = {};
  const updateableFields = ['title', 'picture', 'content'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  BlogPost.findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedPost => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Something went wrong' }));
});

app.delete('/posts/:id', (req, res) => {
  BlogPost.findByIdAndRemove(req.params.id).then(() => {
    console.log(`Deleted blog post with id \`${req.params.id}\``);
    res.status(204).end();
  });
});

app.use('*', function(req, res) {
  res.status(404).json({ message: 'Not Found' });
});

let server;

function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(
      databaseUrl,
      err => {
        if (err) {
          return reject(err);
        }
        server = app
          .listen(port, () => {
            console.log(`Your app is listening on port ${port}`);
            resolve();
          })
          .on('error', err => {
            mongoose.disconnect();
            reject(err);
          });
      }
    );
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { runServer, app, closeServer };
