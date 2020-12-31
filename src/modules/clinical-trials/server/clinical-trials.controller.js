const path = require('path');
const _ = require('lodash');
const validator = require('validator');
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));
const history = require('./clinical-trials.history.model');

async function sync(req, res) {
    const response = new Response({}, []);

    try {

        let result = await history.create({
            description: "test",
            value: "test value",
            created_by: req.user.id,
            updated_by: req.user.id
        });



        if (!result) {
            response.data = [];
            return res.status(204).send(response);
        }

        response.data = result;

        res.json(response);
    } catch (err) {
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}


exports.sync = sync;
