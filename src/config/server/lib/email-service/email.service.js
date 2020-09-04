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
 * @param {string} options.template - Template content
 * @param {string} options.plaintext - Plaintext to be sent for supporting legacy clients
 * @param {string} options.fromAddress - From email address
 * @param {[string]} options.toAddresses - To email addresses
 * @param {string} options.subject - Subject line for email
 * @param {string} options.data - Values to be replaced in the template
 */
async function send(options) {
    const template = options.template || await getTemplate(options.templateUrl);

    const htmlBody = options.data
        ? transformContent(template, options.data)
        : template;

    const plaintext = options.data
        ? transformContent(options.plaintext, options.data)
        : options.plaintext;

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
                },
                Text: {
                    Charset: "UTF-8",
                    Data: plaintext
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: options.subject,
            },
        },
        Source: options.fromAddress || 'glpg@brainstation-23.com'
    };

    const response = await SES.sendEmail(params).promise();
    return response;
}

async function getTemplate(templateUrl) {
    const templateText = fs.readFileSync(templateUrl, 'utf8');
    return templateText;
}

function buildList(listName, list, template) {
    let newTemplate = template

    const startTag = `{{${listName}}}`
    const valueTag = `{{${listName}-value}}`
    const endTag = `{{${listName}-end}}`

    const startTagPos = newTemplate.indexOf(startTag)
    const contentStartPos = startTagPos + startTag.length
    const contentEndPos = newTemplate.indexOf(endTag)
    const endTagPos = contentEndPos + endTag.length

    const content = newTemplate.slice(contentStartPos, contentEndPos)

    let expandedContent = ''
    list.map(value => expandedContent += content.replace(valueTag, value))

    newTemplate = newTemplate.slice(0, startTagPos) + expandedContent + newTemplate.slice(endTagPos)
    return newTemplate
}

function transformContent(content, data) {
    if(!content) {
        return '';
    }

    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            if (Array.isArray(data[key])) {
                content = buildList(key, data[key], content)
                continue
            }
            const replacer = `[[${key}]]`;
            const value = `${data[key]}`;
            content = content
                ? content.replace(replacer, value)
                : "";
        }
    }

    return content;
}

exports.send = send;
