const path = require('path');
const crypto = require('crypto');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const User = require('./user1.model');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const emailService = require(path.join(process.cwd(), 'src/config/server/lib/email-service/email.service'));
const logService = require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.service'));
const ResetPassword = require('./reset-password.model');
const UserProfile = require(path.join(process.cwd(), "src/modules/user/server/user-profile.model"));
const UserProfile_PermissionSet = require(path.join(process.cwd(), "src/modules/user/server/permission-set/userProfile-permissionSet.model"));
const PermissionSet = require(path.join(process.cwd(), "src/modules/user/server/permission-set/permission-set.model"));
const PermissionSet_ServiceCateory = require(path.join(process.cwd(), "src/modules/user/server/permission-set/permissionSet-serviceCategory.model"));
const ServiceCategory = require(path.join(process.cwd(), "src/modules/user/server/permission/service-category.model"));
const UserPermissionSet = require(path.join(process.cwd(), "src/modules/user/server/permission-set/user-permissionSet.model"));
const { QueryTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

const axios = require("axios");
const Application = require(path.join(process.cwd(), "src/modules/application/server/application.model"));
const PasswordPolicies = require(path.join(process.cwd(), "src/modules/core/server/password/password-policies.js"));

function generateAccessToken(user) {
    return jwt.sign({
        id: user.id,
        first_name: user.last_name,
        last_name: user.last_name,
        email: user.email,
    }, nodecache.getValue('CDP_TOKEN_SECRET'), {
        expiresIn: '2d',
        issuer: user.id.toString()
    });
}

async function getProfilePermissions(user) {

    let serviceCategories = [];
    const permissionSets = [];
    const userProfile = user.userProfile;
    let applications = [];
    let countries = [];

    if (userProfile) {
        for (const userProPermSet of userProfile.userProfile_permissionSet) {

            const permissionServiceCategories = await PermissionSet_ServiceCateory.findAll({
                where: {
                    permissionSetId: userProPermSet.permissionSet.id
                },
                include: [{
                    model: ServiceCategory,
                    as: 'serviceCategory'

                }]
            });
            serviceCategories = [];
            permissionServiceCategories.forEach(perServiceCat => {
                serviceCategories.push(perServiceCat.serviceCategory);

            });

            const applicationsCountries = await getUserApplicationCountry(userProPermSet.permissionSet);

                applications = applicationsCountries[0];
                countries = applicationsCountries[1];

            permissionSets.push({
                serviceCategories: serviceCategories.map(sc => sc.slug),
                application: applications.length > 0 ? applications : null,
                countries: countries
            });

        }
        const profile = {
            title: userProfile.title,
            permissionSets: permissionSets
        }

        return profile;
    }

}


async function getUserApplicationCountry(permissionSet) {
    const applications = [];
    let countries = [];
    if (permissionSet.slug == 'system_admin') {
        const userApplications = await Application.findAll();
        userApplications.forEach(userApplication => {
            applications.push({
                name: userApplication.name,
                slug: userApplication.slug,
                logo_link: userApplication.logo_link
            });
        });

        const countriesDb = await sequelize.datasyncConnector.query("SELECT DISTINCT ON(codbase_desc) * FROM ciam.vwcountry ORDER BY codbase_desc, countryname;", { type: QueryTypes.SELECT });
        countries = countriesDb.map(c => c.country_iso2);
    } else {
        if (permissionSet.applicationId) {
            const userApplication = await Application.findOne({ where: { id: permissionSet.applicationId } });
            applications.push({
                name: userApplication.name,
                slug: userApplication.slug,
                logo_link: userApplication.logo_link
            });
        }

        if (permissionSet.countries) {
            countries = permissionSet.countries;
        }

    }

    return [applications, countries];


}

async function getUserPermissions(user) {

    let serviceCategories = [];
    const userPermissionSets = user.user_permissionSet;
    const permissionSets = [];
    let applications = [];
    let countries = [];

    if (userPermissionSets) {
        for (const userPermSet of userPermissionSets) {

            const permissionServiceCategories = await PermissionSet_ServiceCateory.findAll({
                where: {
                    permissionSetId: userPermSet.permissionSetId
                },
                include: [{
                    model: ServiceCategory,
                    as: 'serviceCategory'

                }]
            });
            serviceCategories = [];
            permissionServiceCategories.forEach(perServiceCat => {
                serviceCategories.push(perServiceCat.serviceCategory);

            });

            const applicationsCountries = await getUserApplicationCountry(userPermSet.permissionSet);

            applications = applicationsCountries[0];
            countries = applicationsCountries[1];

            permissionSets.push({
                serviceCategories: serviceCategories.map(sc => sc.slug),
                application: applications ? (applications.length > 0 ? applications : null) : null,
                countries: countries
            });
        }
    }

    return permissionSets;

}


async function formatData(user) {
    const data = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        type: user.type,
        profile: await getProfilePermissions(user),
        permissionsets: await getUserPermissions(user)
    };
    return data;
}

async function formatProfileDetail(user) {
    const applicationCountriesFormatted = await getCommaSeparatedApplications(user);
    const profile = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        type: user.type,
        phone: user.phone,
        last_login: user.last_login,
        expiry_date: user.expiry_date,
        profiles: user.userProfile.title,
        application: applicationCountriesFormatted[0],
        countries: applicationCountriesFormatted[1]
    };

    return profile;
}

async function getCommaSeparatedApplications(user) {
    let all_applications = [];
    let all_countries = [];
    let user_applications = [];
    let profile_applications = [];
    let user_countries = [];
    let profile_countries = [];
    for (const userPermSet of user.user_permissionSet) {
        const applicationsCountries = await getUserApplicationCountry(userPermSet.permissionSet);
        user_applications = user_applications.concat(applicationsCountries[0]);
        user_countries = user_countries.concat(applicationsCountries[1])

    }

    if (user.userProfile) {
        const profilePermissionSets = user.userProfile.userProfile_permissionSet;
        for (const userProPermSet of profilePermissionSets) {

            const applicationsCountries = await getUserApplicationCountry(userProPermSet.permissionSet);
            profile_applications = profile_applications.concat(applicationsCountries[0]);
            profile_countries = profile_countries.concat(applicationsCountries[1]);
        }
    }


    all_countries = [...new Set(user_countries.concat(profile_countries))];
    all_applications = user_applications.concat(profile_applications);
    let apps = [...new Set(all_applications.length > 0 ? all_applications.map(app => app.name) : [])];

    apps = apps.join();

    return [apps, all_countries];


}

async function getSignedInUserProfile(req, res) {
    try {
        res.json(await formatData(req.user));
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function login(req, res) {
    try {
        const { email, password, recaptchaToken } = req.body;

        // if (!recaptchaToken) {
        //     return res.status(400).send('Captcha verification required.');
        // }

        const user = await User.findOne({
            where: {
                email: {
                    [Op.iLike]: `%${email}%`
                }
            },
            include: [{
                model: UserProfile,
                as: 'userProfile',
                include: [{
                    model: UserProfile_PermissionSet,
                    as: 'userProfile_permissionSet',
                    include: [{
                        model: PermissionSet,
                        as: 'permissionSet',

                    }]
                }]
            },
            {
                model: UserPermissionSet,
                as: 'user_permissionSet',
                include: [{
                    model: PermissionSet,
                    as: 'permissionSet',

                }]

            }
            ]
        });

        if (user && user.dataValues.failed_auth_attempt >= 5) {
            return res.status(401).send('Your account has been locked for consecutive failed auth attempts. Please use the Forgot Password link to unlock.');
        }

        if (user && (!user.password || !user.validPassword(password))) {
            await user.update(
                { failed_auth_attempt: parseInt(user.dataValues.failed_auth_attempt ? user.dataValues.failed_auth_attempt : '0') + 1 },
                { where: { email: email } }
            );
        }

        if (!user || !user.password || !user.validPassword(password)) {
            return res.status(401).send('Invalid email or password.');
        }

        const isSiteVerified = await verifySite(recaptchaToken);

        // if (!isSiteVerified) {
        //     return res.status(400).send('Failed captcha verification.');
        // }

        res.cookie('access_token', generateAccessToken(user), {
            expires: new Date(Date.now() + 8.64e7),
            httpOnly: true
        });

        await user.update({ last_login: Date() })


        await user.update(
            { failed_auth_attempt: 0 },
            { where: { email: email } }
        );

        res.json(await formatData(user));
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function logout(req, res) {
    res.clearCookie('access_token').redirect('/');
}

async function createUser(req, res) {

    const {
        first_name,
        last_name,
        email,
        country_code,
        phone,
        profile,
        permission_sets
    } = req.body;
    const phone_number = phone ? country_code + phone : '';
    const validForMonths = 6
    const currentDate = new Date()


    try {
        const [doc, created] = await User.findOrCreate({
            where: { email: email.toLowerCase() },
            defaults: {
                first_name,
                last_name,
                phone: phone_number ? phone_number.replace(/\s+/g, '') : null,
                profileId: profile,
                created_by: req.user.id,
                updated_by: req.user.id,
                expiry_date: new Date(currentDate.setMonth(currentDate.getMonth() + validForMonths))
            }
        });

        permission_sets.forEach(async ps => {
            await UserPermissionSet.create({
                userId: doc.id,
                permissionSetId: ps,
            });

        })

        if (!created) {
            return res.status(400).send('Email already exists.');
        }

        const logData = {
            event_type: 'CREATE',
            object_id: doc.id,
            table_name: 'users',
            created_by: req.user.id,
            description: 'Created new CDP user',
        }
        await logService.log(logData)

        const token = crypto.randomBytes(36).toString('hex');
        const expireAt = Date.now() + 3600000;

        const [resetRequest, reqCreated] = await ResetPassword.findOrCreate({
            where: { user_id: doc.id },
            defaults: {
                token,
                expires_at: expireAt,
                type: 'set'
            }
        });

        if (!reqCreated && resetRequest) {
            await resetRequest.update({
                token,
                expires_at: expireAt,
                type: 'set'
            });
        }

        const link = `${req.protocol}://${req.headers.host}/reset-password?token=${token}`;

        const templateUrl = path.join(process.cwd(), `src/config/server/lib/email-service/templates/cdp/password-set.html`);
        const options = {
            toAddresses: [doc.email],
            templateUrl,
            subject: 'Setup password for your CDP account',
            data: {
                name: `${doc.first_name} ${doc.last_name}` || '',
                link
            }
        };

        emailService.send(options);

        res.json(doc);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function deleteUser(req, res) {
    try {
        await User.destroy({ where: { id: req.params.id } });

        res.json({ id: req.params.id });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getUsers(req, res) {

    const page = req.query.page ? req.query.page - 1 : 0;
    if (page < 0) return res.status(404).send("page must be greater or equal 1");

    const limit = 15;
    const country_iso2 = req.query.country_iso2 === 'null' ? null : req.query.country_iso2;
    const offset = page * limit;

    const signedInId = (await formatData(req.user)).id;

    try {


        const users = await User.findAll({
            where: {
                id: { [Op.ne]: signedInId },
                type: 'basic'
            },
            offset,
            limit,
            order: [
                ['created_at', 'DESC'],
                ['id', 'DESC']
            ],
            include: [{
                model: User,
                as: 'createdByUser',
                attributes: ['id', 'first_name', 'last_name'],
            },
            {
                model: UserProfile,
                as: 'userProfile',
                include: [{
                    model: UserProfile_PermissionSet,
                    as: 'userProfile_permissionSet',
                    include: [{
                        model: PermissionSet,
                        as: 'permissionSet',
                        where: {
                            countries: country_iso2 ? { [Op.contains]: [country_iso2] } : { [Op.ne]: ["undefined"] }
                        }

                    }]
                }]
            },
            {
                model: UserPermissionSet,
                as: 'user_permissionSet',
                include: [{
                    model: PermissionSet,
                    as: 'permissionSet',

                }]

            }
        ],
            attributes: { exclude: ['password'] },
        });

        const totalUser = await User.count({
            where: {
                id: { [Op.ne]: signedInId },
                type: 'basic'
            },
            include: [
            {
                model: UserProfile,
                as: 'userProfile',
                include: [{
                    model: UserProfile_PermissionSet,
                    as: 'userProfile_permissionSet',
                    include: [{
                        model: PermissionSet,
                        as: 'permissionSet',
                        where: {
                            countries: country_iso2 ? { [Op.contains]: [country_iso2] } : { [Op.ne]: ["undefined"] }
                        }

                    }]
                }]
            }
        ]
        });
        const data = {
            users: users,
            page: page + 1,
            limit: limit,
            total: totalUser,
            start: limit * page + 1,
            end: offset + limit > totalUser ? totalUser : offset + limit,
            country_iso2: country_iso2 ? country_iso2 : null
        };

        res.json(data);

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getUser(req, res) {
    try {
        const user = await User.findOne({
            where: {
                id: req.params.id
            },
            include: [{
                model: UserProfile,
                as: 'userProfile',
                include: [{
                    model: UserProfile_PermissionSet,
                    as: 'userProfile_permissionSet',
                    include: [{
                        model: PermissionSet,
                        as: 'permissionSet',

                    }]
                }]
            },
            {
                model: UserPermissionSet,
                as: 'user_permissionSet',
                include: [{
                    model: PermissionSet,
                    as: 'permissionSet',

                }]

            }
            ],
        });

        const formattedUser = await formatProfileDetail(user);

        res.json(formattedUser);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function sendPasswordResetLink(req, res) {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.json({ message: 'An email has been sent to the provided email with further instructions.' });
        }

        const token = crypto.randomBytes(36).toString('hex');
        const expireAt = Date.now() + 3600000;

        const [doc, created] = await ResetPassword.findOrCreate({
            where: { user_id: user.id },
            defaults: {
                token,
                expires_at: expireAt
            }
        });

        if (!created && doc) {
            await doc.update({
                token,
                expires_at: expireAt
            });
        }

        const link = `${req.protocol}://${req.headers.host}/reset-password?token=${token}`;

        const templateUrl = path.join(process.cwd(), `src/config/server/lib/email-service/templates/cdp/password-reset-instruction.html`);
        const options = {
            toAddresses: [user.email],
            templateUrl,
            subject: 'Password Reset Instructions',
            data: {
                name: user.first_name + " " + user.last_name || '',
                link
            }
        };

        emailService.send(options);

        res.json({ message: 'An email has been sent to the provided email with further instructions.' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function changePassword(req, res) {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    try {
        const user = await User.findOne({ where: { id: req.user.id } });

        if (!user || !user.validPassword(currentPassword)) {
            return res.status(400).send('Current Password not valid');
        }

        if (await PasswordPolicies.isOldPassword(newPassword, user)) return res.status(400).send('New password can not be your previously used password.');

        if (!PasswordPolicies.validatePassword(newPassword)) return res.status(400).send('Password must contain atleast a digit, an uppercase, a lowercase and a special character and must be 8 to 50 characters long.')

        if (newPassword !== confirmPassword) return res.status(400).send('Passwords should match');

        if (PasswordPolicies.isCommonPassword(newPassword, user)) return res.status(400).send('Password can not be commonly used passwords or personal info. Try a different one.');

        if (user.password) await PasswordPolicies.saveOldPassword(user);

        user.password = newPassword;
        await user.save();

        res.json(await formatData(user));
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function resetPassword(req, res) {
    try {
        const { token } = req.query;

        if (!token) return res.status(400).send('Invalid password reset token');

        const resetRequest = await ResetPassword.findOne({ where: { token } });

        if (!resetRequest) return res.status(400).send("Invalid password reset token.");

        if (resetRequest.expires_at < Date.now()) {
            await resetRequest.destroy();
            return res.status(400).send("Password reset token has been expired. Please request again.");
        }

        const user = await User.findOne({ where: { id: resetRequest.user_id } });

        if (await PasswordPolicies.isOldPassword(req.body.newPassword, user)) return res.status(400).send('New password can not be your previously used password.');

        if (!PasswordPolicies.validatePassword(req.body.newPassword)) return res.status(400).send('Password must contain atleast a digit, an uppercase, a lowercase and a special character and must be 8 to 50 characters long.');

        if (PasswordPolicies.isCommonPassword(req.body.newPassword, user)) return res.status(400).send('Password can not be commonly used passwords or personal info. Try a different one.');

        if (req.body.newPassword !== req.body.confirmPassword) return res.status(400).send("Password and confirm password doesn't match.");

        if (user.password) await PasswordPolicies.saveOldPassword(user);

        user.update({ password: req.body.newPassword });
        const options = {
            toAddresses: [user.email],
            data: {
                name: user.first_name + " " + user.last_name,
                link: `${req.protocol}://${req.headers.host}/login`
            }
        };

        if (resetRequest.type === 'set') {
            options.templateUrl = path.join(process.cwd(), `src/config/server/lib/email-service/templates/cdp/registration-success.html`);
            options.subject = 'Registration Successful';
        }
        else {
            options.templateUrl = path.join(process.cwd(), `src/config/server/lib/email-service/templates/cdp/password-reset.html`);
            options.subject = 'Your password has been reset'
        }

        await user.update(
            { failed_auth_attempt: 0 },
            { where: { email: user.dataValues.email } }
        );

        emailService.send(options);

        await resetRequest.destroy();

        res.sendStatus(200);

    } catch (error) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function verifySite(captchaResponseToken) {
    try {
        const secretKey = nodecache.getValue('RECAPTCHA_SECRET_KEY');

        const siteverifyResponse = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaResponseToken}`,
            null,
            {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
                }
            }
        );

        return siteverifyResponse.data.success;
    } catch (error) {
        return false;
    }
}

exports.login = login;
exports.logout = logout;
exports.createUser = createUser;
exports.getSignedInUserProfile = getSignedInUserProfile;
exports.changePassword = changePassword;
exports.deleteUser = deleteUser;
exports.getUsers = getUsers;
exports.getUser = getUser;
exports.sendPasswordResetLink = sendPasswordResetLink;
exports.resetPassword = resetPassword;
