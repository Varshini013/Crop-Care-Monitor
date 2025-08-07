const multer = require('multer');
const path = require('path');
const os = require('os'); // Import the os module

// Set up storage engine for Multer to use the temporary directory
const storage = multer.diskStorage({
  // THIS IS THE FIX: Use the system's temporary directory
  destination: path.join(os.tmpdir(), 'uploads'), 
  filename: function(req, file, cb){
    // Create a unique filename to avoid conflicts
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize upload variable with multer configuration
const upload = multer({
  storage: storage,
  limits:{fileSize: 10000000}, // 10MB limit
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('image');

// Function to check for allowed file types
function checkFileType(file, cb){
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}

module.exports = upload;
