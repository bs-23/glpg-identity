const path = require('path');
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));

function validate(schema) {
    return function (req, res, next) {
        const response = new Response({}, []);

        schema.validate(req.body, { abortEarly: false }).then(function() {
            next();
        }).catch(function (err) {
            err.inner.forEach(e => {
                response.errors.push(new CustomError(e.message, 400, e.path));
            });

            return res.status(400).send(response);
        });
    }
}

exports.validate = validate;
