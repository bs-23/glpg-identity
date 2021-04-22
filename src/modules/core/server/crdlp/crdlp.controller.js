const path = require('path');
const { QueryTypes } = require('sequelize');
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));

async function getMultichannelConsentsByOnekeyId(req, res) {
    const response = new Response({}, []);
    const oneKeyId = req.params.id;

    try {
        const multichannel_consents = await sequelize.datasyncConnector.query(`
            SELECT *
            FROM ciam.vw_veeva_consent_master
            where ciam.vw_veeva_consent_master.onekeyid = $oneKeyId;`,
            {
                bind: { oneKeyId: oneKeyId },
                type: QueryTypes.SELECT
            }
        );

        if (!multichannel_consents) return res.sendStatus(204);

        response.data = multichannel_consents;

        res.json(response);
    } catch (err) {
        logger.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

exports.getMultichannelConsentsByOnekeyId = getMultichannelConsentsByOnekeyId;
