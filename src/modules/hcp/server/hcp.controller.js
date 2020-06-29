const Hcp = require('./hcp_profile.model');
const Consent = require('./consent.model')

async function getHcps(req, res) {
    const page = req.query.page - 1;
    const limit = 10;
    let is_active = req.query.is_active === 'null' ? null : req.query.is_active;
    const offset = page * limit;

    try {
        const hcps = await Hcp.findAll({
            where: {
                is_active: (is_active) === null ? [true, false] : is_active
            },
            attributes: { exclude: ['password'] },
            offset: offset, limit: limit,
            order: [['created_at', 'ASC'], ['id', 'ASC']]
        });

        const totalUser = await Hcp.count();

        const data = {
            users: hcps,
            page: page + 1,
            limit: limit,
            total: totalUser,
            start: limit * page + 1,
            end: ((offset + limit) > totalUser) ? totalUser : (offset + limit),
            is_active: is_active
        }

        res.json(data);
    } catch (err) {
        res.status(500).send(err);
    }
}

async function editHcp(req, res) {
    const { first_name, last_name, phone } = req.body;

    try {
        const hcpUser = await Hcp.findOne({ where: { id: req.params.id } });

        if (!hcpUser) return res.sendStatus(404);

        hcpUser.update({ first_name, last_name, phone });

        res.json(hcpUser);
    } catch (err) {
        res.status(500).send(err);
    }
}

async function getHcpsById(req, res) {
    console.log("hi");
    const { email, uuid } = req.body;

    try {
        const hcpUser = await Hcp.findOne({ where: { email: email, uuid: uuid }, attributes: { exclude: ['password'] } });

        if (!hcpUser) return res.status(404).send('HCP user not found');

        console.log(hcpUser);

        res.json(hcpUser);

    } catch (err) {
        res.status(500).send(err);
    }
}

async function resetHcpPassword(req, res) {
    const { email, uuid, password } = req.body;

    try {
        const hcpUser = await Hcp.findOne({ where: { email: email, uuid: uuid } });

        if (!hcpUser) return res.status(404).send('HCP user not found');

        hcpUser.update({ password });

        res.status(200).send("password reset successfully");
    } catch (err) {
        res.status(500).send(err);
    }
}


async function getConsents(req, res) {
    const { country_code } = req.body;

    try{
        const consents = await Consent.findAll({
            where: {
                country_code
            },
            attributes: ['id', 'title', 'type', 'opt_in_type', 'category']
        })
        
        const response = { country_code, consents };

        res.json(response);
    }
    catch(err){
        console.log(err);
        res.status(500).send(err);
    }
}


exports.getHcps = getHcps;
exports.editHcp = editHcp;
exports.resetHcpPassword = resetHcpPassword;
exports.getHcpsById = getHcpsById;
exports.getConsents = getConsents;
