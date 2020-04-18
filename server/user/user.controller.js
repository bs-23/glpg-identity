const User = require("./user.model");

async function createUser(req, res) {
    const {name, email, password, role} = req.body;

    try {
        const [doc, created] = await User.findOrCreate({ email: email}, {
            name:  name,
            password: password,
            role: role,
            created_by: req.user.id
        });

        if(!created) {
            return res.status(400).send("This email address already exists.");
        }

        res.json(doc);
    } catch(error) {
        // log error
    }
}

exports.createUser = createUser;
