const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

/**
 *
 * @param {string} options.templateName Name of teh template to use
 * @param {string} options.from From email address
 * @param {string} options.to To email address
 * @param {string} options.subject Subject line for email
 * @param {string} options.replacer Values to be replaced in the template
 */
async function send(options) {
    const template = await getTemplate(options.templateName);

    const html = options.replacer
        ? transformTemplate(template, options.replacer)
        : template;

    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });

    const mailOptions = {
        from: options.from, // sender address
        to: options.to, // list of receivers
        subject: options.subject, // Subject line
        // text: "Hello world?hjsgfs fsd fsdf sdf sdf sdf", // plain text body
        html: html,
    };

    // send mail with defined transport object
    let info = await transporter.sendMail(mailOptions);

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

async function getTemplate(templateName) {
    const templateText = fs.readFileSync(
        path.join(
            process.cwd(),
            `src/config/server/lib/email-service/templates/${templateName}.html`
        ),
        "utf8"
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
                : "";
        }
    }

    return templateText;
}

exports.send = send;
