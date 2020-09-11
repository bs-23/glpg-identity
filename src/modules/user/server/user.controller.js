const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./user.model');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const emailService = require(path.join(process.cwd(), 'src/config/server/lib/email-service/email.service'));
const logService = require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.service'));
const ResetPassword = require('./reset-password.model');
const UserProfile = require(path.join(process.cwd(), "src/modules/user/server/user-profile.model"));
const UserProfile_PermissionSet = require(path.join(process.cwd(), "src/modules/user/server/permission-set/userProfile-permissionSet.model"));
const User_Role = require(path.join(process.cwd(), "src/modules/user/server/role/user-role.model"));
const Role_PermissionSet = require(path.join(process.cwd(), "src/modules/user/server/permission-set/role-permissionSet.model"));
const Role = require(path.join(process.cwd(), "src/modules/user/server/role/role.model"));
const PermissionSet = require(path.join(process.cwd(), "src/modules/user/server/permission-set/permission-set.model"));
const PermissionSet_ServiceCateory = require(path.join(process.cwd(), "src/modules/user/server/permission-set/permissionSet-serviceCategory.model"));
const PermissionSet_Application = require(path.join(process.cwd(), "src/modules/user/server/permission-set/permissionSet-application.model"));
const ServiceCategory = require(path.join(process.cwd(), "src/modules/user/server/permission/service-category.model"));
const axios = require("axios");
const Application = require(path.join(process.cwd(), "src/modules/application/server/application.model"));
const PasswordPolicies = require(path.join(process.cwd(), "src/modules/core/server/password/password-policies.js"));
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const { QueryTypes, Op } = require('sequelize');

function generateAccessToken(user) {
    return jwt.sign({
        id: user.id
    }, nodecache.getValue('CDP_TOKEN_SECRET'), {
        expiresIn: '1d',
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
        for (const userProPermSet of userProfile.up_ps) {
            let permissionSet = userProPermSet.ps;
            for (const psc of permissionSet.ps_sc) {
                serviceCategories.push(psc.serviceCategory);
            }
            const applicationsCountries = await getUserApplicationCountry(userProPermSet.ps);

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

async function getRolePermissions(user) {

    let serviceCategories = [];
    const permissionSets = [];
    let applications = [];
    let countries = [];
    const userRoles = user.userRoles;
    const roles = [];

    if (userRoles.length) {
        for (const userRole of userRoles) {
            for (const rolePermSet of userRole.role.role_ps) {
                let permissionSet = rolePermSet.ps;
                for (const psc of permissionSet.ps_sc) {
                    serviceCategories.push(psc.serviceCategory);
                }
                const applicationsCountries = await getUserApplicationCountry(rolePermSet.ps);

                applications = applicationsCountries[0];
                countries = applicationsCountries[1];

                permissionSets.push({
                    serviceCategories: serviceCategories.map(sc => sc.slug),
                    application: applications.length > 0 ? applications : null,
                    countries: countries
                });

            }

            roles.push({
                title: userRole.role.title,
                permissionSets: permissionSets

            })
        }

    }
    return roles;

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
        if (permissionSet.ps_app) {
            for (const ps_app of permissionSet.ps_app) {

                const userApplication = ps_app.application;
                applications.push({
                    name: userApplication.name,
                    slug: userApplication.slug,
                    logo_link: userApplication.logo_link
                });

            }

        }

        if (permissionSet.countries) {
            countries = permissionSet.countries;
        }

    }

    return [applications, countries];


}




async function getCommaSeparatedAppCountryPermissions(user) {
    let all_applications = [];
    let all_countries = [];
    let role_applications = [];
    let profile_applications = [];
    let role_countries = [];
    let profile_countries = [];
    let profile_ps = [];
    let role_ps = [];
    let all_ps = [];

    for (const userRole of user.userRoles) {
        for (const rolePermSet of userRole.role.role_ps) {
            const applicationsCountries = await getUserApplicationCountry(rolePermSet.ps);
            role_applications = role_applications.concat(applicationsCountries[0]);
            role_countries = role_countries.concat(applicationsCountries[1])
            role_ps.push({
                title: rolePermSet.ps.title,
                type: rolePermSet.ps.type,
            });

        }

    }

    if (user.userProfile) {
        const profilePermissionSets = user.userProfile.up_ps;
        for (const userProPermSet of profilePermissionSets) {

            const applicationsCountries = await getUserApplicationCountry(userProPermSet.ps);
            profile_applications = profile_applications.concat(applicationsCountries[0]);
            profile_countries = profile_countries.concat(applicationsCountries[1]);
            profile_ps.push({
                title: userProPermSet.ps.title,
                type: userProPermSet.ps.type,
            });
        }
    }


    all_countries = [...new Set(role_countries.concat(profile_countries))];
    all_applications = role_applications.concat(profile_applications);
    all_ps = role_ps.concat(profile_ps);
    let apps = [...new Set(all_applications.length > 0 ? all_applications.map(app => app.name) : [])];

    apps = apps.join();

    return [apps, all_countries, all_ps];


}

function ignoreCaseArray(str) {
    return [str.toLowerCase(), str.toUpperCase(), str.charAt(0).toLowerCase() + str.charAt(1).toUpperCase(), str.charAt(0).toUpperCase() + str.charAt(1).toLowerCase()];
}

async function formatProfile(user) {
    const data = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        type: user.type,
        profile: await getProfilePermissions(user),
        role: await getRolePermissions(user),
    };
    return data;
}

async function formatProfileDetail(user) {
    const appCounPermissionFormatted = await getCommaSeparatedAppCountryPermissions(user);
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
        application: appCounPermissionFormatted[0],
        countries: appCounPermissionFormatted[1],
        role: user.userRoles && user.userRoles.length ? user.userRoles[0].role.title : '',
        permissionSets: appCounPermissionFormatted[2]
    };

    return profile;
}


async function getSignedInUserProfile(req, res) {
    try {
        res.json(await formatProfile(req.user));
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
                    as: 'up_ps',
                    include: [{
                        model: PermissionSet,
                        as: 'ps',
                        include: [
                            {
                                model: PermissionSet_ServiceCateory,
                                as: 'ps_sc',
                                include: [
                                    {
                                        model: ServiceCategory,
                                        as: 'serviceCategory',

                                    }
                                ]

                            },
                            {
                                model: PermissionSet_Application,
                                as: 'ps_app',
                                include: [
                                    {
                                        model: Application,
                                        as: 'application',

                                    }
                                ]

                            }
                        ]

                    }]
                }]
            },
            {
                model: User_Role,
                as: 'userRoles',
                include: [{
                    model: Role,
                    as: 'role',
                    include: [{
                        model: Role_PermissionSet,
                        as: 'role_ps',
                        include: [{
                            model: PermissionSet,
                            as: 'ps',
                            include: [
                                {
                                    model: PermissionSet_ServiceCateory,
                                    as: 'ps_sc',
                                    include: [
                                        {
                                            model: ServiceCategory,
                                            as: 'serviceCategory',

                                        }
                                    ]

                                },
                                {
                                    model: PermissionSet_Application,
                                    as: 'ps_app',
                                    include: [
                                        {
                                            model: Application,
                                            as: 'application',

                                        }
                                    ]

                                }
                            ]

                        }]
                    }]

                }]
            }
            ],
        });

        const userLockedMessage = 'Your account has been locked for consecutive failed auth attempts. Please use the Forgot Password link to unlock.';

        if (user && user.dataValues.failed_auth_attempt >= 5) {
            return res.status(401).send(userLockedMessage);
        }

        if (user && user.password_expiry_date && user.password_expiry_date < Date.now()) {
            return res.status(401).send("Password has been expired. Please reset the password.");
        }

        if (!user || !user.password || !user.validPassword(password)) {

            if (user && user.password) {
                await user.update(
                    { failed_auth_attempt: parseInt(user.dataValues.failed_auth_attempt ? user.dataValues.failed_auth_attempt : '0') + 1 }
                );
            }

            const errorMessage = user && user.dataValues.failed_auth_attempt >= 5
                ? userLockedMessage
                : 'Invalid email or password.';

            return res.status(401).send(errorMessage);
        }

        const isSiteVerified = await verifySite(recaptchaToken);

        // if (!isSiteVerified) {
        //     return res.status(400).send('Failed captcha verification.');
        // }

        res.cookie('access_token', generateAccessToken(user), {
            expires: new Date(Date.now() + 8.64e7),
            httpOnly: true
        });

        await user.update({
            last_login: Date(),
            failed_auth_attempt: 0
        });

        res.json(await formatProfile(user));
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
        role,
    } = req.body;

    const phone_number = phone ? country_code + phone : '';
    const validForMonths = 6
    const currentDate = new Date()

    try {
        const [user, created] = await User.findOrCreate({
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

        if (role) {
            await User_Role.create({
                userId: user.id,
                roleId: role,
            });
        }

        if (!created) {
            return res.status(400).send('Email already exists.');
        }

        const logData = {
            event_type: 'CREATE',
            object_id: user.id,
            table_name: 'users',
            created_by: req.user.id,
            description: 'Created new CDP user',
        }
        await logService.log(logData)

        const token = crypto.randomBytes(36).toString('hex');
        const expireAt = Date.now() + 3600000;

        const [resetRequest, reqCreated] = await ResetPassword.findOrCreate({
            where: { user_id: user.id },
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
            toAddresses: [user.email],
            templateUrl,
            subject: 'Setup password for your CDP account',
            data: {
                name: `${user.first_name} ${user.last_name}` || '',
                link
            }
        };

        emailService.send(options);

        res.json(user);
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
    // const country_iso2 = req.query.country_iso2 === 'null' ? null : req.query.country_iso2;
    const codbase = req.query.codbase === 'null' ? null : req.query.codbase;
    const offset = page * limit;

    const signedInId = (await formatProfile(req.user)).id;

    const country_iso2_list_for_codbase = (await sequelize.datasyncConnector.query(`SELECT * FROM ciam.vwcountry`, { type: QueryTypes.SELECT })).filter(i => i.codbase === codbase).map(i => i.country_iso2);
    const countries_ignorecase_for_codbase = [].concat.apply([], country_iso2_list_for_codbase.map(i => ignoreCaseArray(i)));
    let countries_ignorecase_for_codbase_formatted = '{' + countries_ignorecase_for_codbase.join(", ") + '}';


    try {

        const users = await User.findAll({

            where: {
                id: { [Op.ne]: signedInId },
                type: 'basic',
                [Op.or]: [
                    {
                        '$userRoles.role.role_ps.ps.countries$': codbase ? { [Op.overlap]: countries_ignorecase_for_codbase_formatted } : {
                            [Op.or]: [{
                                [Op.ne]: '{0}'
                            }, {
                                [Op.eq]: null
                            }]
                        }

                    },
                    {
                        '$userProfile.up_ps.ps.countries$': codbase ? { [Op.overlap]: countries_ignorecase_for_codbase_formatted } : {
                            [Op.or]: [{
                                [Op.ne]: '{0}'
                            }, {
                                [Op.eq]: null
                            }]
                        }

                    }

                ]
            },
            order: [
                ['created_at', 'DESC'],
                ['id', 'DESC']
            ],
            offset,
            limit: limit,
            subQuery: false,
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
                    as: 'up_ps',
                    include: [{
                        model: PermissionSet,
                        as: 'ps',

                    }]
                }]
            },

            {
                model: User_Role,
                as: 'userRoles',
                include: [{
                    model: Role,
                    as: 'role',
                    include: [{
                        model: Role_PermissionSet,
                        as: 'role_ps',
                        include: [{
                            model: PermissionSet,
                            as: 'ps'
                        }]
                    }]


                }]
            }],
            attributes: { exclude: ['password'] }


        });

        const totalUser = await User.count({
            where: {
                id: { [Op.ne]: signedInId },
                type: 'basic',
                [Op.or]: [
                    {
                        '$userRoles.role.role_ps.ps.countries$': codbase ? { [Op.overlap]: countries_ignorecase_for_codbase_formatted } : { [Op.ne]: '{0}' }

                    },
                    {
                        '$userProfile.up_ps.ps.countries$': codbase ? { [Op.overlap]: countries_ignorecase_for_codbase_formatted } : { [Op.ne]: '{0}' }

                    }

                ]
            },
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
                    as: 'up_ps',
                    include: [{
                        model: PermissionSet,
                        as: 'ps',

                    }]
                }]
            },

            {
                model: User_Role,
                as: 'userRoles',
                include: [{
                    model: Role,
                    as: 'role',
                    include: [{
                        model: Role_PermissionSet,
                        as: 'role_ps',
                        include: [{
                            model: PermissionSet,
                            as: 'ps'
                        }]
                    }]


                }]
            }],
        });

        const data = {
            users: users,
            page: page + 1,
            limit: limit,
            total: totalUser,
            start: limit * page + 1,
            end: offset + limit > totalUser ? totalUser : offset + limit,
            // country_iso2: country_iso2 ? country_iso2 : null,
            codbase: codbase ? codbase : null
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
                    as: 'up_ps',
                    include: [{
                        model: PermissionSet,
                        as: 'ps',
                        include: [
                            {
                                model: PermissionSet_ServiceCateory,
                                as: 'ps_sc',
                                include: [
                                    {
                                        model: ServiceCategory,
                                        as: 'serviceCategory',

                                    }
                                ]

                            },
                            {
                                model: PermissionSet_Application,
                                as: 'ps_app',
                                include: [
                                    {
                                        model: Application,
                                        as: 'application',

                                    }
                                ]

                            }
                        ]

                    }]
                }]
            },
            {
                model: User_Role,
                as: 'userRoles',
                include: [{
                    model: Role,
                    as: 'role',
                    include: [{
                        model: Role_PermissionSet,
                        as: 'role_ps',
                        include: [{
                            model: PermissionSet,
                            as: 'ps',
                            include: [
                                {
                                    model: PermissionSet_ServiceCateory,
                                    as: 'ps_sc',
                                    include: [
                                        {
                                            model: ServiceCategory,
                                            as: 'serviceCategory',

                                        }
                                    ]

                                },
                                {
                                    model: PermissionSet_Application,
                                    as: 'ps_app',
                                    include: [
                                        {
                                            model: Application,
                                            as: 'application',

                                        }
                                    ]

                                }
                            ]

                        }]
                    }]

                }]
            }
            ],
        });


        if (!user) return res.status(404).send("User is not found or may be removed");

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

        if (await PasswordPolicies.minimumPasswordAge(user.password_updated_at)) {
            return res.status(400).send(`You cannot change password before 1 day`);
        }

        if (await PasswordPolicies.isOldPassword(newPassword, user)) return res.status(400).send('New password can not be your previously used password.');

        if (!PasswordPolicies.validatePassword(newPassword)) return res.status(400).send('Password must contain atleast a digit, an uppercase, a lowercase and a special character and must be 8 to 50 characters long.');

        if (!PasswordPolicies.hasValidCharacters(newPassword)) return res.status(400).send('Password has one or more invalid character.');

        if (newPassword !== confirmPassword) return res.status(400).send('Passwords should match');

        if (PasswordPolicies.isCommonPassword(newPassword, user)) return res.status(400).send('Password can not be commonly used passwords or personal info. Try a different one.');

        if (user.password) await PasswordPolicies.saveOldPassword(user);

        const currentDate = new Date();
        const expiryDate = newPassword.length >= 15
            ? new Date(currentDate.setFullYear(currentDate.getFullYear() + 1))
            : new Date(currentDate.setDate(currentDate.getDate() + 90));

        user.password_expiry_date = expiryDate;
        user.password = newPassword;
        user.password_updated_at = new Date(Date.now());
        await user.save();

        res.json(await formatProfile(user));
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

        if (await PasswordPolicies.minimumPasswordAge(user.password_updated_at)) {
            return res.status(400).send(`You cannot change password before 1 day`);
        }

        if (await PasswordPolicies.isOldPassword(req.body.newPassword, user)) return res.status(400).send('New password can not be your previously used password.');

        if (!PasswordPolicies.validatePassword(req.body.newPassword)) return res.status(400).send('Password must contain atleast a digit, an uppercase, a lowercase and a special character and must be 8 to 50 characters long.');

        if (!PasswordPolicies.hasValidCharacters(req.body.newPassword)) return res.status(400).send('Password has one or more invalid character.');

        if (PasswordPolicies.isCommonPassword(req.body.newPassword, user)) return res.status(400).send('Password can not be commonly used passwords or personal info. Try a different one.');

        if (req.body.newPassword !== req.body.confirmPassword) return res.status(400).send("Password and confirm password doesn't match.");

        if (user.password) await PasswordPolicies.saveOldPassword(user);

        const currentDate = new Date();
        const expiryDate = req.body.newPassword.length >= 15
            ? new Date(currentDate.setFullYear(currentDate.getFullYear() + 1))
            : new Date(currentDate.setDate(currentDate.getDate() + 90));

        await user.update({
            password: req.body.newPassword,
            failed_auth_attempt: 0,
            password_updated_at: new Date(Date.now()),
            password_expiry_date: expiryDate
        });

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

        emailService.send(options);

        await resetRequest.destroy();

        res.sendStatus(200);

    } catch (err) {
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

        if (!siteverifyResponse || !siteverifyResponse.data || !siteverifyResponse.data.success) {
            console.log(siteverifyResponse.data);
        }

        return siteverifyResponse.data.success;
    } catch (error) {
        console.error(error);
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
