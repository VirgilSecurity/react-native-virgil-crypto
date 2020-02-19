const http = require('http');
const fsExtra = require('fs-extra');
const path = require('path');
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const db = Object.create({});

const generateId = () => Math.random().toString(36).substr(2);

const saveFileRecord = ({ filename, mimetype }, signature) => {
  const id = generateId();
  const record = {
    id,
    filename,
    mimetype,
    signature
  };
  db[id] = record;
  return id;
};

const getFileRecord = id => db[id];

const app = express();

app.post('/upload', upload.single('photo'), (req, res, next) => {
  console.log('uploaded: ', req.file);
  console.log('with signature: ', req.body.signature);
  const id = saveFileRecord(req.file, req.body.signature);
  res.status(201).send(id);
});

app.get('/upload/:id', (req, res) => {
  const fileRecord = getFileRecord(req.params.id);
  if (!fileRecord) {
    res.status(404).send('File not found.');
    return;
  }

  const options = {
    root: path.join(__dirname, 'uploads'),
    dotfiles: 'deny',
    headers: {
      'content-type': fileRecord.mimetype,
      'x-signature': fileRecord.signature
    }
  };

  res.sendFile(fileRecord.filename, options, err => {
    if (err) {
      next(err);
    } else {
      console.log(`sent: ${fileRecord.filename}`);
    }
  });
});

const server = http.createServer(app);

const shutdown = () => {
  console.log('Gracefully shutting down...');
  if (server.listening) {
    server.close((err) => {
      if (err) {
        console.error('Error closing the server', err);
        return;
      }

      // remove the uploads because they won't be usable
      // on subsequent runs as we loose the ids and signatures,
      // which are stored in memory (the `db` object)
      fsExtra.emptyDir('uploads/')
        .then(() => {
          console.log('Done!');
          process.exit(0);
        });
    });
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
