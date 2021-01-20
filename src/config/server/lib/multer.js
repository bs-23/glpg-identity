const multer = require('multer');

module.exports = multer({
    storage: multer.memoryStorage(),
    // limits: {
    //     fileSize: 5242880
    // }
});
