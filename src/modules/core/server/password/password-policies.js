const path = require('path');
const fs = require('fs');
const PasswordHistory = require(path.join(process.cwd(), "src/modules/core/server/password/password-history.model.js"));
const bcrypt = require('bcryptjs');

async function isOldPassword(newPassword, user) {
    try {
        const oldPasswords = await PasswordHistory.findOne({ where: { user_id: user.id } });

        if (user && bcrypt.compareSync(newPassword, user.password)) {
            return true;
        }

        if (oldPasswords !== null) {
            const isOldPassword = oldPasswords.passwords.find(p => bcrypt.compareSync(newPassword, p));
            return !!isOldPassword;
        }

        return false;
    } catch (error) {
        return false;
    }
}

async function saveOldPassword(user) {
    const oldPassword = user.password;

    try {
        const oldPasswords = await PasswordHistory.findOne({ where: { user_id: user.id } });

        let passwordArray = oldPasswords ? oldPasswords.passwords : [];
        if (passwordArray.length >= 19) {
            passwordArray.shift();
        }

        passwordArray.push(oldPassword);
        if (oldPasswords) {
            PasswordHistory.update({ passwords: passwordArray }, { where: { user_id: user.id } });
        } else {
            await PasswordHistory.findOrCreate({
                where: { user_id: user.id },
                defaults: {
                    passwords: passwordArray,
                    created_by: user.id,
                    updated_by: user.id
                }
            });
        }
    } catch (err) {
        console.error(err);
    }
}

function isCommonPassword(password, user) {
    if (password.includes(user.first_name) || password.includes(user.last_name) || password.includes((user.email).split("@")[0])) return true;

    const commonPasswords = JSON.parse(fs.readFileSync('src/modules/core/server/password/common-passwords.json'));
    if (commonPasswords.hasOwnProperty(password)) return true;

    return false;
}

function validatePassword(password) {
    const minLength = 8;
    const maxLength = 50;
    const hasUppercase = new RegExp("^(?=.*[A-Z])").test(password);
    const hasLowercase = new RegExp("^(?=.*[a-z])").test(password);
    const hasDigit = new RegExp("^(?=.*[0-9])").test(password);
    const hasSpecialCharacter = new RegExp("[!\"#$%&'\(\)\*\+,\-\.\/:;<=>\?@\[\\]\^_`\{\|\}\~]").test(password);

    if (password && (password.length < minLength || password.length > maxLength || !hasUppercase || !hasLowercase || !hasDigit || !hasSpecialCharacter)) {
        return false;
    }

    return true;
}

function minimumPasswordAge(date) {
    if (!date) return false;
    const minimumDate = new Date(new Date(date).getTime() + 60 * 60 * 24 * 1000);
    const today = new Date(Date.now());

    if (today < minimumDate) return true;
    return false;
}


exports.isOldPassword = isOldPassword;
exports.saveOldPassword = saveOldPassword;
exports.isCommonPassword = isCommonPassword;
exports.validatePassword = validatePassword;
exports.minimumPasswordAge = minimumPasswordAge;
