const path = require('path');
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));
const crdlpService = require(path.join(process.cwd(), 'src/modules/core/server/crdlp/crdlp.service'));

async function getMultichannelConsentsByOnekeyId(req, res) {
    const response = new Response({}, []);
    const oneKeyId = req.params.id;

    try {
        const multichannel_consents = await crdlpService.getMultichannelConsents(null, { onekeyid: oneKeyId });

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
