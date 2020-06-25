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
 * @param {string} options.templateName Name of teh template to use
 * @param {string} options.fromAddress From email address
 * @param {string} options.toAddresses To email address
 * @param {string} options.subject Subject line for email
 * @param {string} options.replacer Values to be replaced in the template
 * @param {[string]} options.replyToAddresses Reply to email addresses
 */
async function send(options) {
  const template = await getTemplate(options.templateName);

  const htmlBody = options.replacer
    ? transformTemplate(template, options.replacer)
    : template;

  // Create SES sendEmail params
  var params = {
    Destination: {
      CcAddresses: [],
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
    Source: options.fromAddress || 'glpg.cdp@gmail.com',
    ReplyToAddresses: options.replyToAddresses || ['glpg.cdp@gmail.com'],
  };

  const response = await SES.sendEmail(params).promise();
  return response;
}

async function getTemplate(templateName) {
  const templateText = fs.readFileSync(
    path.join(
      process.cwd(),
      `src/config/server/lib/email-service/templates/${templateName}.html`
    ),
    'utf8'
  );

  return templateText;
}

function transformTemplate(templateText, replacer) {
  for (var key in replacer) {
    if (replacer.hasOwnProperty(key)) {
      const replacerKey = `[[${key}]]`;
      const value = `${replacer[key]}`;
      templateText = templateText
        ? templateText.replace(replacerKey, value)
        : '';
    }
  }

  return templateText;
}

exports.send = send;
