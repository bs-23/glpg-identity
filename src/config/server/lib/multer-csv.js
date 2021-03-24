const path = require('path');
const multer = require('multer');

const MAX_FILE_SIZE = 5242880; // 5 MB
const MAX_FILE_NAME_LENGTH = 224;

module.exports = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname);

        if (fileExtension !== '.csv'
        ) {
            cb(null, false);
            return cb(new Error('Invalid file type. Only CSV is allowed.'), false);
        }

        if (file.originalname.length > MAX_FILE_NAME_LENGTH) {
            cb(null, false);
            return cb(new Error(`Invalid file name. Max file name length is ${MAX_FILE_NAME_LENGTH}.`), false);
        }

        var validCharacterPattern = new RegExp("^[ a-zA-Z0-9\/!'\(\)\*\-\._]*$");
        const containsValidCharacter = validCharacterPattern.test(file.originalname);
        if (!containsValidCharacter) {
            cb(null, false);
            return cb(new Error(`Invalid file name. Allowed characters are a-zA-Z0-9/!\'() .*-_`), false);
        }

        cb(null, true);
    },
    limits: {
        fileSize: MAX_FILE_SIZE
    }
});
