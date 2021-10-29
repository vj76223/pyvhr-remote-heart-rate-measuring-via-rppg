const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
const spawn = require("child_process").spawn;
const redis = require("redis");
const client = redis.createClient();

client.on("error", function (error) {
  console.error(error);
});


// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  // limits: { fileSize: 1000000 },
  // fileFilter: function(req, file, cb){
  //   checkFileType(file, cb);
  // }
}).single('myImage');

// Check File Type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Video Only!');
  }
}

const app = express();

// EJS
app.set('view engine', 'ejs');

// Public Folder
app.use(express.static('./public'));

app.get('/', (req, res) => res.render('index'));

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.render('index', {
        msg: err
      });
    } else {
      if (req.file == undefined) {
        res.render('index', {
          msg: 'Error: No File Selected!'
        });
      } else {
        const sessionId = new Date().getTime();
        res.render('index', {
          msg: `File uploaded. Processing video... Check Session ID: ${sessionId}`,
        });
        const pythonProcess = spawn('python3', ["random_script.py", sessionId, `public/uploads/${req.file.filename}`]);
        pythonProcess.stdout.on('data', (data) => {
          console.log(data.toString());
        });
      }
    }
  });
});



const port = 80;

app.listen(port, () => console.log(`Server started on port ${port}`));

