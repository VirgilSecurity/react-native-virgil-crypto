import http from 'node:http';
import path from 'node:path';
import fsExtra from 'fs-extra';
import express, {type NextFunction, type Request, type Response} from 'express';
import multer from 'multer';

type FileRecord = {
  id: string;
  filename: string;
  mimetype: string;
  signature: string;
};

const upload = multer({dest: 'uploads/'});
const db = new Map<string, FileRecord>();

const generateId = () => Math.random().toString(36).slice(2);

const saveFileRecord = (
  file: Express.Multer.File,
  signature: string,
): string => {
  const id = generateId();
  db.set(id, {
    id,
    filename: file.filename,
    mimetype: file.mimetype,
    signature,
  });
  return id;
};

const app = express();

app.post(
  '/upload',
  upload.single('photo'),
  (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).send('Missing "photo" file.');
      return;
    }
    const signature = String(req.body.signature ?? '');
    console.log('uploaded: ', req.file);
    console.log('with signature: ', signature);
    const id = saveFileRecord(req.file, signature);
    res.status(201).send(id);
  },
);

app.get('/upload/:id', (req: Request, res: Response, next: NextFunction) => {
  const fileRecord = db.get(req.params.id);
  if (!fileRecord) {
    res.status(404).send('File not found.');
    return;
  }

  const options = {
    root: path.join(__dirname, '..', 'uploads'),
    dotfiles: 'deny' as const,
    headers: {
      'content-type': fileRecord.mimetype,
      'x-signature': fileRecord.signature,
    },
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
  if (!server.listening) {
    return;
  }
  server.close(async err => {
    if (err) {
      console.error('Error closing the server', err);
      return;
    }
    // Remove uploads — file ids and signatures live in memory
    // and are lost on restart, so the files become unusable.
    await fsExtra.emptyDir('uploads/');
    console.log('Done!');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
