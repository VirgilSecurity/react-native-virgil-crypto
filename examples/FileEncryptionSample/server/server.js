const http = require('http');
const fsExtra = require('fs-extra');
const path = require('path');
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const db = Object.create({});

function generateId() {
  return Math.random().toString(36).substr(2);
}

function saveFileRecord({ filename, mimetype }, signature) {
  const id = generateId();
  const record = {
    id,
    filename,
    mimetype,
    signature
  };
  db[id] = record;
  return id;
}

function getFileRecord(id) {
  return db[id];
}

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

server.listen(3000, () => {
  console.log('Server listening on port 3000');

  process.on('SIGINT', () => {
    console.log('shutdown started');
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
            console.log('process is stopping');
            process.exit(0);
          });
      });
    }
  });
});