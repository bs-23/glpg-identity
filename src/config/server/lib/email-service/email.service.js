const fs = require('fs');
const path = require('path');
var AWS = require('aws-sdk');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const region = nodecache.getValue('AWS_REGION');
const SES = new AWS.SES({ region });

AWS.config.update({
    accessKeyId: nodecache.getValue('AWS_ACCESS_KEY_ID'),
    secretAccessKey: nodecache.getValue('AWS_SECRET_ACCESS_KEY'),
    region
});

/**
 *
 * @param {string} options.templateUrl - URL of the template file to use
 * @param {string} options.template - Name of teh template to use
 * @param {string} options.fromAddress - From email address
 * @param {[string]} options.toAddresses - To email addresses
 * @param {string} options.subject - Subject line for email
 * @param {string} options.data - Values to be replaced in the template
 */
async function send(options) {
    const template = options.template || await getTemplate(options.templateUrl);

    const htmlBody = options.data
        ? transformTemplate(template, options.data)
        : template;

    // Create SES sendEmail params
    var params = {
        Destination: {
            ToAddresses: options.toAddresses,
        },
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: htmlBody,
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: options.subject,
            },
        },
        Source: options.fromAddress || 'glpg.cdp@gmail.com'
    };

    const response = await SES.sendEmail(params).promise();
    return response;
}

async function getTemplate(templateUrl) {
    const templateText = fs.readFileSync(templateUrl, 'utf8');
    return templateText;
}

function transformTemplate(templateText, data) {
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            const replacer = `[[${key}]]`;
            const value = `${data[key]}`;
            templateText = templateText
                ? templateText.replace(replacer, value)
                : "";
        }
    }

    return templateText;
}

exports.send = send;
