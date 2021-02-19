const fs = require('fs');
const path = require('path');
var AWS = require('aws-sdk');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const SES = new AWS.SES({ region: nodecache.getValue('AWS_REGION') });

AWS.config.update({
    accessKeyId: nodecache.getValue('AWS_ACCESS_KEY_ID'),
    secretAccessKey: nodecache.getValue('AWS_SECRET_ACCESS_KEY'),
    region: nodecache.getValue('AWS_REGION')
});

async function send(options) {
    options.data.year = new Date().getFullYear();

    const template = options.template || await getTemplate(options.templateUrl);

    const htmlBody = options.data
        ? transformContent(template, options.data)
        : template;

    const plaintext = options.data
        ? transformContent(options.plaintext, options.data)
        : options.plaintext || '';

    /**
     * NOTE: Amazon SES does not like undefined as value
     * So, do not send the field at all in case the value is undefined
     * or, at least send empty string (i.e. '')
     */
    let params = {
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
        Source: options.fromAddress || nodecache.getValue('CDP_SENDER_EMAIL')
    };

    const response = await SES.sendEmail(params).promise();
    return response;
}

async function getTemplate(templateUrl) {
    const templateText = fs.readFileSync(templateUrl, 'utf8');
    return templateText;
}

function buildList(listName, list, template) {
    let newTemplate = template;

    const startTag = `{{${listName}}}`;
    const valueTag = `{{${listName}-value}}`;
    const endTag = `{{${listName}-end}}`;

    const startTagPos = newTemplate.indexOf(startTag);
    if(startTagPos === -1) return template;

    const contentEndPos = newTemplate.indexOf(endTag);
    if(contentEndPos === -1) return template;

    const contentStartPos = startTagPos + startTag.length;
    const endTagPos = contentEndPos + endTag.length;

    const content = newTemplate.slice(contentStartPos, contentEndPos);

    let expandedContent = '';
    list.map(value => expandedContent += content.replace(valueTag, value));

    newTemplate = newTemplate.slice(0, startTagPos) + expandedContent + newTemplate.slice(endTagPos);
    return newTemplate;
}

function transformContent(content, data) {
    if(!content) return '';

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
                : '';
        }
    }

    return content;
}

exports.send = send;
