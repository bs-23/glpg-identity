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
 * @param {string} options.locale - Users language code
 */
async function send(options) {
    const template = options.template || await getTemplate(options.templateUrl, options.locale);

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

async function getTemplate(templateUrl, locale) {
    let templateUrlInLocale = templateUrl.replace('.html', `-${locale.toLowerCase()}.html`)

    if (fs.existsSync(templateUrlInLocale)) {
        return fs.readFileSync(templateUrlInLocale, 'utf8');
    }

    return fs.readFileSync(templateUrl, 'utf8');
}

function buildList(listName, list, template){
    let newTemplate = template

    const startTag = `{{${listName}}}`
    const valueTag = `{{${listName}-value}}`
    const endTag = `{{${listName}-end}}`

    const startTagPos = newTemplate.indexOf(startTag)
    const contentStartPos =  startTagPos + startTag.length
    const contentEndPos = newTemplate.indexOf(endTag)
    const endTagPos = contentEndPos + endTag.length

    const content = newTemplate.slice(contentStartPos, contentEndPos)

    let expandedContent = ''
    list.map(value => expandedContent += content.replace(valueTag, value))

    newTemplate = newTemplate.slice(0, startTagPos) + expandedContent + newTemplate.slice(endTagPos)
    return newTemplate
}

function transformTemplate(templateText, data) {
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            if(Array.isArray(data[key])){
                templateText = buildList(key, data[key], templateText)
                continue
            }
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
