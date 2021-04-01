const path = require('path');
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));

function validateFile(upload) {
    return function (req, res, next) {
        const response = new Response({}, []);

        upload(req, res, (err) => {
            if (err) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    response.errors.push(new CustomError('File too large. Size limit is 5 MB', 400));
                    return res.status(400).send(response);
                }

                if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    response.errors.push(new CustomError('File number limit exceded. Only 1 file is allowed', 400));
                    return res.status(400).send(response);
                }

                response.errors.push(new CustomError(err.message, 400));
                return res.status(400).send(response);
            }

            next();
        });
    }
}

exports.validateFile = validateFile;
